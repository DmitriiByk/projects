#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Голосовой Telegram-агент на Gemini. Только стандартная библиотека Python.
- Принимает текст и голосовые сообщения.
- Голосовые отправляет в Gemini (он сам распознаёт речь и отвечает).
- Отвечает текстом + аудио (озвучка через macOS `say` -> m4a через `afconvert`).
Конфиг берётся из переменных окружения: TG_TOKEN, TG_CHAT_ID, GEMINI_API_KEY.
Опционально: SAY_VOICE (голос macOS, по умолчанию Milena), AGENT_NAME, SYSTEM_PROMPT.
"""
import os, sys, json, time, base64, subprocess, tempfile, urllib.request, urllib.parse, urllib.error

TG_TOKEN  = os.environ.get("TG_TOKEN", "").strip()
CHAT_ID   = os.environ.get("TG_CHAT_ID", "").strip()
GEM_KEY   = os.environ.get("GEMINI_API_KEY", "").strip()
SAY_VOICE = os.environ.get("SAY_VOICE", "Milena").strip()
FFMPEG    = os.environ.get("FFMPEG_PATH", "ffmpeg").strip()
AGENT     = os.environ.get("AGENT_NAME", "Ассистент").strip()
SYSTEM    = os.environ.get("SYSTEM_PROMPT",
    "Ты — полезный голосовой ассистент. Отвечай кратко, дружелюбно и по делу, на русском. "
    "Если пришло голосовое — сначала пойми, что сказал пользователь, потом ответь.")

if not (TG_TOKEN and CHAT_ID and GEM_KEY):
    print("Нет TG_TOKEN / TG_CHAT_ID / GEMINI_API_KEY в окружении. Сначала: source ~/telegram-agent/config.sh")
    sys.exit(1)

TG_API   = f"https://api.telegram.org/bot{TG_TOKEN}"
TG_FILE  = f"https://api.telegram.org/file/bot{TG_TOKEN}"
GEM_BASE = "https://generativelanguage.googleapis.com/v1beta"
HISTORY  = []          # последние реплики: [{"role":"user/model","parts":[...]}]
MAX_TURNS = 12         # держим в контексте ограниченно (экономия токенов)

def http_json(url, payload=None, method=None, timeout=120):
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(url, data=data, method=method or ("POST" if data else "GET"))
    if data: req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())

# ---------- выбор рабочей модели Gemini ----------
def pick_models():
    try:
        d = http_json(f"{GEM_BASE}/models?key={GEM_KEY}", timeout=30)
    except Exception as e:
        print("Не смог получить список моделей:", e); return ["gemini-2.5-flash"]
    cands = []
    for m in d.get("models", []):
        name = m.get("name","").replace("models/","")
        methods = m.get("supportedGenerationMethods", [])
        if "flash" in name and "generateContent" in methods:
            score = 0
            for bad in ("vision","image","tts","exp","thinking"):
                if bad in name: score -= 3
            if "preview" in name: score -= 1
            if "lite" in name: score -= 1          # lite как запасной вариант
            cands.append((score, name))
    cands.sort(reverse=True)
    out = [n for _, n in cands] or ["gemini-2.5-flash"]
    return out[:4]                                  # основная + резервные на случай 503

MODELS = pick_models()
IMAGE_MODEL = os.environ.get("IMAGE_MODEL", "gemini-2.5-flash-image")   # Nano Banana
print(f"[{AGENT}] модели (по приоритету): {MODELS}")

# ---------- Gemini ----------
def gemini_reply(user_parts):
    HISTORY.append({"role":"user","parts":user_parts})
    del HISTORY[:-MAX_TURNS]
    body = {"systemInstruction":{"parts":[{"text":SYSTEM}]}, "contents":HISTORY}
    for model in MODELS:                                  # перебираем модели при перегрузке
        url = f"{GEM_BASE}/models/{model}:generateContent?key={GEM_KEY}"
        for attempt in range(3):
            try:
                d = http_json(url, body, timeout=120)
                text = d["candidates"][0]["content"]["parts"][0]["text"].strip()
                HISTORY.append({"role":"model","parts":[{"text":text}]})
                return text
            except urllib.error.HTTPError as e:
                if e.code in (429, 500, 503):              # занято -> повтор, затем след. модель
                    time.sleep(1.5 * (attempt + 1)); continue
                return f"Gemini ошибка {e.code}: {e.read().decode()[:200]}"
            except Exception:
                time.sleep(1.5 * (attempt + 1)); continue
    return "Gemini сейчас перегружен (пробовал несколько моделей). Повтори через минуту."

# ---------- Telegram ----------
def tg(method, params):
    url = f"{TG_API}/{method}"
    data = urllib.parse.urlencode(params).encode()
    try:
        with urllib.request.urlopen(url, data=data, timeout=60) as r:
            return json.loads(r.read().decode())
    except Exception as e:
        print("tg error", method, e); return {}

def tg_send_text(text):
    for i in range(0, len(text), 3900):           # лимит сообщения Telegram
        tg("sendMessage", {"chat_id":CHAT_ID, "text":text[i:i+3900]})

def tg_send_voice(path):
    boundary = "----agent" + str(int(time.time()*1000))
    with open(path,"rb") as f: audio = f.read()
    parts = []
    parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n{CHAT_ID}\r\n'.encode())
    parts.append((f'--{boundary}\r\nContent-Disposition: form-data; name="voice"; '
                  f'filename="reply.ogg"\r\nContent-Type: audio/ogg\r\n\r\n').encode())
    parts.append(audio + b"\r\n")
    parts.append(f"--{boundary}--\r\n".encode())
    body = b"".join(parts)
    req = urllib.request.Request(f"{TG_API}/sendVoice", data=body, method="POST")
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    try:
        urllib.request.urlopen(req, timeout=120).read()
    except Exception as e:
        print("sendVoice error", e)

def gen_image(prompt):
    url = f"{GEM_BASE}/models/{IMAGE_MODEL}:generateContent?key={GEM_KEY}"
    body = {"contents":[{"parts":[{"text":prompt}]}],
            "generationConfig":{"responseModalities":["TEXT","IMAGE"]}}
    for attempt in range(3):
        try:
            d = http_json(url, body, timeout=180)
            for p in d["candidates"][0]["content"]["parts"]:
                if "inlineData" in p:
                    return base64.b64decode(p["inlineData"]["data"]), None
            txt = d["candidates"][0]["content"]["parts"][0].get("text","(модель не вернула картинку)")
            return None, txt
        except urllib.error.HTTPError as e:
            if e.code in (429,500,503) and attempt < 2:
                time.sleep(2*(attempt+1)); continue
            return None, f"ошибка {e.code}: {e.read().decode()[:200]}"
        except Exception as e:
            return None, f"ошибка: {e}"

def tg_send_photo(img_bytes, caption=""):
    boundary = "----img" + str(int(time.time()*1000))
    parts = []
    parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n{CHAT_ID}\r\n'.encode())
    if caption:
        parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n{caption[:1000]}\r\n'.encode())
    parts.append((f'--{boundary}\r\nContent-Disposition: form-data; name="photo"; '
                  f'filename="image.png"\r\nContent-Type: image/png\r\n\r\n').encode())
    parts.append(img_bytes + b"\r\n")
    parts.append(f"--{boundary}--\r\n".encode())
    body = b"".join(parts)
    req = urllib.request.Request(f"{TG_API}/sendPhoto", data=body, method="POST")
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    try:
        urllib.request.urlopen(req, timeout=180).read()
    except Exception as e:
        print("sendPhoto error", e)

def tg_download(file_id):
    info = tg("getFile", {"file_id":file_id})
    fp = info.get("result",{}).get("file_path")
    if not fp: return None
    raw = urllib.request.urlopen(f"{TG_FILE}/{fp}", timeout=120).read()
    return raw

# ---------- озвучка через macOS ----------
def speak_to_ogg(text):
    try:
        with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as t:
            t.write(text); txt = t.name
        aiff = txt.replace(".txt",".aiff"); ogg = txt.replace(".txt",".ogg")
        cmd = ["say","-f",txt,"-o",aiff]
        if SAY_VOICE: cmd[1:1] = ["-v", SAY_VOICE]
        if subprocess.run(cmd).returncode != 0:           # голос недоступен -> без -v
            subprocess.run(["say","-f",txt,"-o",aiff], check=True)
        subprocess.run([FFMPEG,"-y","-i",aiff,"-c:a","libopus","-b:a","32k","-ac","1",ogg],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        return ogg
    except Exception as e:
        print("TTS error", e); return None

# ---------- основной цикл ----------
def handle(msg):
    if str(msg.get("chat",{}).get("id")) != CHAT_ID:     # отвечаем только владельцу
        return
    if "voice" in msg or "audio" in msg:
        fid = (msg.get("voice") or msg.get("audio"))["file_id"]
        raw = tg_download(fid)
        if not raw:
            tg_send_text("Не смог скачать аудио."); return
        b64 = base64.b64encode(raw).decode()
        reply = gemini_reply([
            {"text":"Это голосовое сообщение от пользователя. Пойми его и ответь."},
            {"inlineData":{"mimeType":"audio/ogg","data":b64}},
        ])
    elif "text" in msg:
        t = msg["text"].strip()
        low = t.lower()
        img_triggers = ("/img", "/image", "нарисуй", "сгенерируй картинк", "сгенерируй изображен")
        if low.startswith(img_triggers):
            prompt = t
            for pre in ("/img", "/image"):
                if low.startswith(pre): prompt = t[len(pre):].strip()
            tg_send_text("🎨 Генерирую картинку...")
            img, err = gen_image(prompt)
            if img: tg_send_photo(img, caption=prompt[:200])
            else:   tg_send_text(f"Не вышло сгенерировать: {err}")
            return
        reply = gemini_reply([{"text": t}])
    else:
        return
    tg_send_text(reply)
    ogg = speak_to_ogg(reply)
    if ogg: tg_send_voice(ogg)

def main():
    print(f"[{AGENT}] запущен. Жду сообщений в Telegram...")
    tg_send_text(f"🤖 {AGENT} на связи. Пиши или присылай голосовые.")
    offset = None
    while True:
        try:
            params = {"timeout":30}
            if offset is not None: params["offset"] = offset
            r = tg("getUpdates", params)
            for upd in r.get("result", []):
                offset = upd["update_id"] + 1
                msg = upd.get("message") or upd.get("edited_message")
                if msg:
                    try: handle(msg)
                    except Exception as e: print("handle error", e)
        except Exception as e:
            print("loop error", e); time.sleep(3)

if __name__ == "__main__":
    main()
