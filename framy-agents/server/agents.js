import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import matter from "gray-matter";
import { getAgentDirs, defaultWriteDir } from "./config.js";

// Безопасное имя файла из name агента.
export function slugify(name) {
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "agent";
}

// Разбор одного markdown-файла агента.
function parseAgentFile(filePath, raw, scope) {
  const parsed = matter(raw);
  const data = parsed.data || {};
  const name = data.name || path.basename(filePath, ".md");
  return {
    id: `${scope}:${name}`,
    name,
    description: data.description || "",
    model: data.model || "inherit",
    tools: normalizeTools(data.tools),
    color: data.color || null,
    prompt: parsed.content.trim(),
    scope, // "user" | "project" | имя каталога
    filePath,
  };
}

function normalizeTools(tools) {
  if (!tools) return [];
  if (Array.isArray(tools)) return tools;
  return String(tools)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function scopeForDir(dir) {
  const userAgents = path.join(os.homedir(), ".claude", "agents");
  if (path.resolve(dir) === path.resolve(userAgents)) return "user";
  if (dir.includes(path.join(".claude", "agents"))) return "project";
  return "custom";
}

// Прочитать всех агентов из всех каталогов.
export async function listAgents() {
  const dirs = getAgentDirs();
  const agents = [];
  const seen = new Set();
  for (const dir of dirs) {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      continue; // каталога нет — пропускаем
    }
    const scope = scopeForDir(dir);
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
      const filePath = path.join(dir, entry.name);
      try {
        const raw = await fs.readFile(filePath, "utf8");
        const agent = parseAgentFile(filePath, raw, scope);
        if (seen.has(agent.id)) continue;
        seen.add(agent.id);
        agents.push(agent);
      } catch {
        /* пропускаем нечитаемый файл */
      }
    }
  }
  agents.sort((a, b) => a.name.localeCompare(b.name));
  return agents;
}

export async function findAgent(id) {
  const agents = await listAgents();
  return agents.find((a) => a.id === id) || null;
}

// Записать файл агента (создание/перезапись).
async function writeAgentFile(filePath, { name, description, model, tools, color, prompt }) {
  const data = { name, description };
  if (model && model !== "inherit") data.model = model;
  if (tools && tools.length) data.tools = tools.join(", ");
  if (color) data.color = color;
  const fileContent = matter.stringify(`\n${(prompt || "").trim()}\n`, data);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, fileContent, "utf8");
}

// Сменить модель существующего агента.
export async function updateAgentModel(id, model) {
  const agent = await findAgent(id);
  if (!agent) throw httpError(404, "Агент не найден");
  await writeAgentFile(agent.filePath, { ...agent, model });
  return { ...agent, model };
}

// Обновить произвольные поля агента.
export async function updateAgent(id, patch) {
  const agent = await findAgent(id);
  if (!agent) throw httpError(404, "Агент не найден");
  const merged = { ...agent, ...patch };
  await writeAgentFile(agent.filePath, merged);
  return merged;
}

// Создать нового агента вручную или из распарсенного определения.
export async function createAgent({ name, description, model, tools, color, prompt }, targetDir) {
  if (!name || !String(name).trim()) throw httpError(400, "Нужно имя агента");
  if (!description || !String(description).trim())
    throw httpError(400, "Нужно описание агента (поле description)");
  const dir = targetDir || defaultWriteDir();
  const filePath = path.join(dir, `${slugify(name)}.md`);
  try {
    await fs.access(filePath);
    throw httpError(409, `Агент с именем «${name}» уже существует`);
  } catch (e) {
    if (e.status === 409) throw e;
    // файла нет — ок
  }
  await writeAgentFile(filePath, {
    name,
    description,
    model: model || "inherit",
    tools: normalizeTools(tools),
    color,
    prompt: prompt || "",
  });
  const raw = await fs.readFile(filePath, "utf8");
  return parseAgentFile(filePath, raw, scopeForDir(dir));
}

// Распарсить сырой markdown-агент (для импорта/предпросмотра).
export function parseRawAgent(raw, fallbackName) {
  const parsed = matter(raw);
  const data = parsed.data || {};
  return {
    name: data.name || fallbackName || "",
    description: data.description || "",
    model: data.model || "inherit",
    tools: normalizeTools(data.tools),
    color: data.color || null,
    prompt: parsed.content.trim(),
    valid: Boolean((data.name || fallbackName) && data.description),
  };
}

export async function deleteAgent(id) {
  const agent = await findAgent(id);
  if (!agent) throw httpError(404, "Агент не найден");
  await fs.unlink(agent.filePath);
  return { id };
}

export function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}
