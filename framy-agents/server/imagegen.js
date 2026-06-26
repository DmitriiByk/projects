import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { httpError } from "./agents.js";
import { flowraStatus } from "./flowra.js";

const DEFAULT_MODEL = "gemini-2.5-flash-image";

// Известные модели генерации картинок (Nano Banana и наследники).
export const IMAGE_MODELS = [
  "gemini-2.5-flash-image",
  "gemini-3.1-flash-image-preview",
  "gemini-3-pro-image-preview",
];

function apiKey() {
  return process.env.GEMINI_API_KEY || process.env.FRAMY_GEMINI_KEY || "";
}
function model() {
  return process.env.FRAMY_GEMINI_MODEL || DEFAULT_MODEL;
}
function imagesDir() {
  if (process.env.FRAMY_IMAGES_DIR) {
    const p = process.env.FRAMY_IMAGES_DIR;
    return p.startsWith("~") ? path.join(os.homedir(), p.slice(1)) : path.resolve(p);
  }
  return path.join(os.homedir(), "Documents", "Claude", "Projects", "framy-agents", "generated-images");
}

export function imageStatus() {
  const fl = flowraStatus();
  if (fl.available) {
    const label = `${fl.lora} · Flowra`;
    return { backend: "flowra", available: true, model: label, models: [label], flowra: fl, dir: imagesDir() };
  }
  const def = model();
  const models = [...new Set([def, ...IMAGE_MODELS])];
  return { backend: "gemini", available: Boolean(apiKey()), model: def, models, dir: imagesDir() };
}

// Генерация (или редактирование, если передан refImage) картинки через Gemini.
export async function generateImage({ prompt, refImage, refMime, model: modelOverride }) {
  const key = apiKey();
  if (!key) throw httpError(400, "Не задан GEMINI_API_KEY. Запусти Framy с этой переменной окружения.");
  if (!prompt || !String(prompt).trim()) throw httpError(400, "Пустой промпт");

  const m = (modelOverride && String(modelOverride).trim()) || model();
  const parts = [{ text: String(prompt) }];
  if (refImage) parts.push({ inline_data: { mime_type: refMime || "image/png", data: refImage } });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`;
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
      }),
    });
  } catch (e) {
    const cause = e.cause?.message || e.message;
    const certIssue = /certificate|self.?signed|signature|unable to (get|verify)|CERT_/i.test(cause);
    throw httpError(502, `Не удалось обратиться к Gemini: ${cause}` +
      (certIssue ? " — похоже на перехват TLS, запусти Framy с FRAMY_INSECURE_TLS=1." : ""));
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.error?.message || `HTTP ${res.status}`;
    throw httpError(res.status === 400 || res.status === 403 ? res.status : 502, `Gemini: ${msg}`);
  }

  const respParts = json?.candidates?.[0]?.content?.parts || [];
  const imgPart = respParts.find((p) => p.inlineData || p.inline_data);
  const inline = imgPart?.inlineData || imgPart?.inline_data;
  if (!inline?.data) {
    const text = respParts.map((p) => p.text).filter(Boolean).join(" ");
    const block = json?.promptFeedback?.blockReason;
    throw httpError(502, "Картинка не вернулась" + (block ? ` (заблокировано: ${block})` : text ? `: ${text.slice(0, 200)}` : "."));
  }
  return { image: inline.data, mime: inline.mimeType || inline.mime_type || "image/png" };
}

function slug(s) {
  return String(s || "image").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "image";
}

export async function saveImage(base64, mime, name) {
  const dir = imagesDir();
  await fs.mkdir(dir, { recursive: true });
  const ext = (mime || "image/png").split("/")[1]?.replace("jpeg", "jpg") || "png";
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const file = path.join(dir, `${slug(name)}-${stamp}.${ext}`);
  await fs.writeFile(file, Buffer.from(base64, "base64"));
  return file;
}
