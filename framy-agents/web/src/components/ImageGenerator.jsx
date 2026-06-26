import React, { useEffect, useRef, useState } from "react";
import { api } from "../api.js";

export default function ImageGenerator({ initialPrompt = "" }) {
  const [status, setStatus] = useState(null);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [model, setModel] = useState("");
  const [ref, setRef] = useState(null); // {data, mime, name}
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // {image, mime, savedPath}
  const [saveToDisk, setSaveToDisk] = useState(true);
  const fileRef = useRef(null);

  useEffect(() => {
    api.imageStatus()
      .then((s) => { setStatus(s); setModel(s.model || ""); })
      .catch(() => setStatus({ available: false }));
  }, []);

  function onPickFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const base64 = dataUrl.split(",")[1];
      setRef({ data: base64, mime: f.type || "image/png", name: f.name });
    };
    reader.readAsDataURL(f);
  }

  async function generate() {
    if (!prompt.trim()) return;
    setBusy(true); setError(""); setResult(null);
    try {
      const res = await api.generateImage({
        prompt: prompt.trim(), model, backend: status?.backend,
        refImage: ref?.data, refMime: ref?.mime,
        save: saveToDisk, name: prompt.trim(),
      });
      setResult(res);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  const dataUrl = result ? (result.image ? `data:${result.mime};base64,${result.image}` : result.url) : null;

  return (
    <div>
      {status && !status.available && (
        <div className="banner warn">
          Не задан <span className="mono">GEMINI_API_KEY</span>. Запусти Framy с этой переменной — например:
          <div className="mono" style={{ marginTop: 6, fontSize: 12 }}>GEMINI_API_KEY=AIza… npm run dev</div>
        </div>
      )}
      {status?.available && (
        <div className="form-field" style={{ maxWidth: 380 }}>
          <label>{status.backend === "flowra" ? "Провайдер" : "Модель"}</label>
          <select value={model} onChange={(e) => setModel(e.target.value)} disabled={status.backend === "flowra"}>
            {(status.models || [status.model]).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          {status.backend === "flowra" ? (
            <div className="form-hint">
              Картинки идут через Flowra (ваша квота).
              {status.limit ? ` Активно ${status.limit.active}/${status.limit.maxGenerations}.` : ""}
              {status.limit && status.limit.canGenerate === false ? " Лимит занят — подожди." : ""}
            </div>
          ) : (
            <div className="form-hint">Если «quota limit: 0» — у этой модели нет бесплатной квоты, выбери другую (часто работает gemini-2.5-flash-image).</div>
          )}
        </div>
      )}
      {error && <div className="banner error">{error}</div>}

      <div className="form-field">
        <label>Промпт</label>
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} style={{ minHeight: 90 }}
          placeholder="Опиши картинку: «иконка приложения для финтех-промо, синий градиент, плоский стиль»"
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate(); }} />
      </div>

      <div className="row" style={{ gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <button className="btn-ghost" onClick={() => fileRef.current?.click()}>
          {ref ? `🖼 ${ref.name}` : "＋ Референс-картинка (опц.)"}
        </button>
        {ref && <button className="btn-danger" onClick={() => setRef(null)}>Убрать референс</button>}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onPickFile} />
        <label className="status-pill" style={{ cursor: "pointer" }}>
          <input type="checkbox" checked={saveToDisk} onChange={(e) => setSaveToDisk(e.target.checked)} style={{ accentColor: "var(--accent)" }} />
          Сохранять в папку
        </label>
        <button className="btn-primary" onClick={generate} disabled={busy || !prompt.trim() || (status && !status.available)} style={{ marginLeft: "auto" }}>
          {busy ? <><span className="spinner" /> Генерирую…</> : "✦ Сгенерировать"}
        </button>
      </div>

      {dataUrl && (
        <div>
          <img src={dataUrl} alt="" style={{ width: "100%", maxWidth: 640, borderRadius: 14, border: "1px solid var(--border)", display: "block" }} />
          <div className="row" style={{ gap: 10, marginTop: 12 }}>
            <a className="btn-primary" href={dataUrl} download="framy-image.png" style={{ textDecoration: "none", display: "inline-block" }}>↓ Скачать</a>
            <button className="btn-ghost" onClick={generate}>↻ Ещё вариант</button>
          </div>
          {result.savedPath && <div className="form-hint mono" style={{ marginTop: 8 }}>Сохранено: {result.savedPath}</div>}
        </div>
      )}
    </div>
  );
}
