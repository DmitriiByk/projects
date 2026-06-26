import { randomUUID } from "node:crypto";
import { httpError } from "./agents.js";

function cfg() {
  return {
    token: process.env.FLOWRA_TOKEN || "",
    base: (process.env.FLOWRA_BASE_URL || "https://flowra.gosystem.io").replace(/\/+$/, ""),
    boardId: process.env.FLOWRA_BOARD_ID || "1782139364337",
    provider: process.env.FLOWRA_PROVIDER || "wavespeed_nano_banana_2_t2i",
    lora: process.env.FLOWRA_LORA || "Nano Banana 2",
  };
}

export function flowraStatus() {
  const c = cfg();
  return { available: Boolean(c.token), boardId: c.boardId, provider: c.provider, lora: c.lora, base: c.base };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Рекурсивный поиск в JSON объекта, удовлетворяющего предикату.
function deepFind(node, pred, depth = 0) {
  if (node == null || depth > 7) return null;
  if (Array.isArray(node)) {
    for (const x of node) { const r = deepFind(x, pred, depth + 1); if (r) return r; }
    return null;
  }
  if (typeof node === "object") {
    try { if (pred(node)) return node; } catch { /* noop */ }
    for (const k of Object.keys(node)) { const r = deepFind(node[k], pred, depth + 1); if (r) return r; }
  }
  return null;
}

function headers(token) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}`, Accept: "application/json, text/plain, */*" };
}

// Текущий лимит конкурентных генераций.
export async function flowraLimit() {
  const c = cfg();
  if (!c.token) return null;
  try {
    const r = await fetch(`${c.base}/api/boards/${c.boardId}/generation-limit`, { headers: headers(c.token) });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

// Запуск txt2img + поллинг до готового url; возвращает { url, image?, mime? }.
export async function generateViaFlowra({ prompt, aspectRatio, resolution }) {
  const c = cfg();
  if (!c.token) throw httpError(400, "Не задан FLOWRA_TOKEN. Запусти Framy с токеном Flowra.");
  if (!prompt || !String(prompt).trim()) throw httpError(400, "Пустой промпт");

  const now = Date.now();
  const clientJobId = now * 1000 + Math.floor(Math.random() * 1000);
  const body = {
    prompt: String(prompt),
    provider: c.provider,
    source: "manual",
    client_job_id: clientJobId,
    origin_client_id: randomUUID(),
    batch_id: `${now}-${Math.random().toString(36).slice(2, 9)}`,
    seed: -1,
    output_format: "jpeg",
    lora_name: c.lora,
    aspect_ratio: aspectRatio || "Default",
    resolution: resolution || "1k",
  };

  let res;
  try {
    res = await fetch(`${c.base}/api/boards/${c.boardId}/generate-txt2img`, {
      method: "POST", headers: headers(c.token), body: JSON.stringify(body),
    });
  } catch (e) {
    throw httpError(502, `Flowra недоступна: ${e.cause?.message || e.message}`);
  }
  if (res.status === 401 || res.status === 403)
    throw httpError(401, "Flowra: токен недействителен или истёк (401/403). Обнови FLOWRA_TOKEN (перелогинься во Flowra).");
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw httpError(502, `Flowra: запуск не удался (${res.status}): ${t.slice(0, 200)}`);
  }
  const job = await res.json().catch(() => ({}));
  const jobId = job.id || job.client_job_id || clientJobId;

  // Поллинг доски: ищем задачу с непустым url.
  const boardUrl = `${c.base}/api/boards/${c.boardId}`;
  const matchJob = (o) => o && (o.id == jobId || o.client_job_id == jobId);
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    await sleep(2000);
    let data;
    try {
      const r = await fetch(boardUrl, { headers: headers(c.token) });
      if (!r.ok) continue;
      data = await r.json();
    } catch { continue; }

    const done = deepFind(data, (o) => matchJob(o) && typeof o.url === "string" && o.url.length > 5);
    if (done) return await withBytes(done.url, c.token);

    const failed = deepFind(data, (o) => matchJob(o) && (o.error || o.failed || o.status === "failed" || o.status === "error"));
    if (failed) throw httpError(502, `Flowra: генерация завершилась с ошибкой${failed.error ? `: ${failed.error}` : ""}.`);
  }
  throw httpError(504, "Flowra: картинка не пришла за 120с (таймаут). Возможно, очередь занята — проверь лимит.");
}

// Догружаем байты картинки в base64 (если url открыт); иначе отдаём только url.
async function withBytes(url, token) {
  try {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) {
      const buf = Buffer.from(await r.arrayBuffer());
      return { url, image: buf.toString("base64"), mime: r.headers.get("content-type") || "image/jpeg" };
    }
  } catch { /* отдадим просто url */ }
  return { url };
}
