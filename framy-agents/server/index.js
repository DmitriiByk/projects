import express from "express";
import path from "node:path";
import fs from "node:fs";
import { exec } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  listAgents,
  findAgent,
  updateAgentModel,
  updateAgent,
  createAgent,
  deleteAgent,
} from "./agents.js";
import { previewGithub } from "./github.js";
import { runAgentTask, checkClaudeAvailable } from "./runner.js";
import { getAgentDirs, MODEL_PRESETS } from "./config.js";
import { listConnectors, upsertConnector, deleteConnector, configSources, getConnectorRaw } from "./connectors.js";
import { listTools, callTool } from "./mcpClient.js";
import { getMcpToken } from "./claudeCreds.js";
import { listSkills, readSkillContent, saveSkillContent, assistSkill } from "./skills.js";
import { translateItems } from "./translate.js";
import { imageStatus, generateImage, saveImage } from "./imagegen.js";
import { generateViaFlowra, flowraLimit } from "./flowra.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Корпоративные прокси (Zscaler, BrainRocket и т.п.) перехватывают TLS и подменяют
// сертификат своим CA, которому Node не доверяет. Если включён FRAMY_INSECURE_TLS=1,
// Framy перестаёт проверять сертификаты при обращении к коннекторам.
// Использовать только в доверенной (корпоративной) сети.
if (process.env.FRAMY_INSECURE_TLS === "1") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  console.warn("⚠ FRAMY_INSECURE_TLS=1 — проверка TLS-сертификатов ОТКЛЮЧЕНА (режим для корп-прокси с перехватом).");
}

const app = express();
// Лёгкий CORS (на случай запуска фронтенда отдельно от API).
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
app.use(express.json({ limit: "30mb" }));

const wrap = (fn) => (req, res) => fn(req, res).catch((err) => {
  res.status(err.status || 500).json({ error: err.message || "Внутренняя ошибка" });
});

// --- Метаданные / конфиг ---
app.get("/api/health", wrap(async (req, res) => {
  const claude = await checkClaudeAvailable();
  res.json({ ok: true, claude, agentDirs: getAgentDirs(), models: MODEL_PRESETS });
}));

// --- Агенты ---
app.get("/api/agents", wrap(async (req, res) => {
  res.json({ agents: await listAgents() });
}));

app.get("/api/agents/:id", wrap(async (req, res) => {
  const agent = await findAgent(decodeURIComponent(req.params.id));
  if (!agent) return res.status(404).json({ error: "Агент не найден" });
  res.json({ agent });
}));

// Сменить модель
app.patch("/api/agents/:id/model", wrap(async (req, res) => {
  const { model } = req.body || {};
  if (!model) return res.status(400).json({ error: "Нужно поле model" });
  res.json({ agent: await updateAgentModel(decodeURIComponent(req.params.id), model) });
}));

// Обновить агента (имя/описание/промпт/инструменты)
app.patch("/api/agents/:id", wrap(async (req, res) => {
  res.json({ agent: await updateAgent(decodeURIComponent(req.params.id), req.body || {}) });
}));

// Создать вручную или импортировать одного агента
app.post("/api/agents", wrap(async (req, res) => {
  res.json({ agent: await createAgent(req.body || {}) });
}));

app.delete("/api/agents/:id", wrap(async (req, res) => {
  res.json(await deleteAgent(decodeURIComponent(req.params.id)));
}));

// --- Импорт из GitHub ---
app.post("/api/import/github/preview", wrap(async (req, res) => {
  const { url } = req.body || {};
  res.json(await previewGithub(url));
}));

app.post("/api/import/github", wrap(async (req, res) => {
  const { agents } = req.body || {};
  if (!Array.isArray(agents) || !agents.length)
    return res.status(400).json({ error: "Нечего импортировать" });
  const created = [];
  const errors = [];
  for (const a of agents) {
    try {
      created.push(await createAgent(a));
    } catch (e) {
      errors.push({ name: a.name, error: e.message });
    }
  }
  res.json({ created, errors });
}));

// --- Скиллы ---
app.get("/api/skills", wrap(async (req, res) => {
  res.json({ skills: await listSkills() });
}));

app.get("/api/skills/:id/content", wrap(async (req, res) => {
  res.json(await readSkillContent(decodeURIComponent(req.params.id)));
}));

app.put("/api/skills/:id/content", wrap(async (req, res) => {
  res.json(await saveSkillContent(decodeURIComponent(req.params.id), (req.body || {}).content));
}));

app.post("/api/skills/:id/assist", wrap(async (req, res) => {
  const { content, request } = req.body || {};
  res.json(await assistSkill({ content, request }));
}));

// --- Генерация картинок (Gemini / Nano Banana) ---
app.get("/api/image/status", wrap(async (req, res) => {
  const st = imageStatus();
  if (st.backend === "flowra") st.limit = await flowraLimit();
  res.json(st);
}));

app.post("/api/image/generate", wrap(async (req, res) => {
  const { prompt, refImage, refMime, save, name, model, backend, aspectRatio, resolution } = req.body || {};
  const use = backend || imageStatus().backend;
  let gen;
  if (use === "flowra") {
    gen = await generateViaFlowra({ prompt, aspectRatio, resolution });
  } else {
    gen = await generateImage({ prompt, refImage, refMime, model });
  }
  let savedPath = null;
  if (save && gen.image) savedPath = await saveImage(gen.image, gen.mime || "image/jpeg", name || prompt);
  res.json({ ...gen, savedPath });
}));

// --- Автоперевод описаний (через claude CLI, с кэшем) ---
app.post("/api/translate", wrap(async (req, res) => {
  const { items } = req.body || {};
  if (!Array.isArray(items)) return res.status(400).json({ error: "Нужен массив items" });
  res.json(await translateItems(items));
}));

// --- Коннекторы (MCP-серверы Claude Code / Desktop) ---
app.get("/api/connectors", wrap(async (req, res) => {
  res.json({ sources: await listConnectors(), targets: configSources().map(({ id, label, path, writable }) => ({ id, label, path, writable })) });
}));

app.post("/api/connectors", wrap(async (req, res) => {
  const { target, name, definition } = req.body || {};
  res.json(await upsertConnector({ target, name, definition }));
}));

app.delete("/api/connectors/:id", wrap(async (req, res) => {
  res.json(await deleteConnector(decodeURIComponent(req.params.id)));
}));

// Подготовка удалённого коннектора к вызову: URL + заголовки (свои или токен Claude Code).
async function resolveRemote(id) {
  const raw = await getConnectorRaw(id);
  if (raw.transport === "stdio")
    throw Object.assign(new Error("Инспектор поддерживает только удалённые (HTTP/SSE) коннекторы."), { status: 400 });
  let headers = {};
  if (raw.def.headers && Object.keys(raw.def.headers).length) {
    headers = { ...raw.def.headers }; // в конфиге уже есть авторизация
  } else {
    const tok = await getMcpToken(raw.name);
    if (!tok.found)
      throw Object.assign(new Error(`Не нашёл OAuth-токен для «${raw.name}» в Claude Code. Открой Claude Code и авторизуйся в этом коннекторе.`), { status: 401 });
    if (tok.expired)
      throw Object.assign(new Error(`Токен «${raw.name}» истёк. Открой Claude Code и выполни любой запрос к нему (токен обновится), затем повтори.`), { status: 401 });
    headers = { Authorization: `Bearer ${tok.token}` };
  }
  return { url: raw.url, headers, name: raw.name };
}

app.get("/api/connectors/:id/tools", wrap(async (req, res) => {
  const r = await resolveRemote(decodeURIComponent(req.params.id));
  const result = await listTools({ url: r.url, headers: r.headers });
  res.json(result);
}));

app.post("/api/connectors/:id/call", wrap(async (req, res) => {
  const { tool, args } = req.body || {};
  if (!tool) return res.status(400).json({ error: "Не указан инструмент" });
  const r = await resolveRemote(decodeURIComponent(req.params.id));
  const result = await callTool({ url: r.url, headers: r.headers }, tool, args || {});
  res.json({ result });
}));

// Открыть нативное приложение Claude Desktop (каталог коннекторов — внутри Settings).
app.post("/api/open-claude", wrap(async (req, res) => {
  const cmds = {
    darwin: 'open -a "Claude"',
    win32: 'cmd /c start "" "Claude"',
    linux: "claude-desktop || claude",
  };
  const cmd = cmds[process.platform];
  if (!cmd) return res.json({ launched: false, platform: process.platform, reason: "unsupported" });
  exec(cmd, (err) => { /* best-effort, ошибку не роняем */ });
  res.json({ launched: true, platform: process.platform });
}));

// --- Запуск задачи (SSE-стрим) ---
app.get("/api/agents/:id/run", wrap(async (req, res) => {
  const agent = await findAgent(decodeURIComponent(req.params.id));
  if (!agent) return res.status(404).json({ error: "Агент не найден" });
  const task = req.query.task;
  const model = req.query.model;
  if (!task || !String(task).trim()) return res.status(400).json({ error: "Пустая задача" });

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  const send = (evt) => res.write(`data: ${JSON.stringify(evt)}\n\n`);

  const child = runAgentTask({ agent, task: String(task), model }, (evt) => {
    send(evt);
    if (evt.type === "done") res.end();
  });

  req.on("close", () => {
    try { child.kill(); } catch { /* noop */ }
  });
}));

// --- Раздача собранного фронтенда (production) ---
const webDist = path.join(__dirname, "..", "web", "dist");
if (fs.existsSync(webDist)) {
  app.use(express.static(webDist));
  app.get("*", (req, res) => res.sendFile(path.join(webDist, "index.html")));
}

const PORT = process.env.PORT || 5174;
app.listen(PORT, () => {
  console.log(`\n  Framy server → http://localhost:${PORT}`);
  console.log(`  Каталоги агентов:`);
  for (const d of getAgentDirs()) console.log(`    • ${d}`);
  console.log("");
});
