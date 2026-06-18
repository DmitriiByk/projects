import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { httpError } from "./agents.js";

// --- Где живут конфиги MCP-коннекторов на разных платформах ---
function desktopConfigPath() {
  if (process.env.FRAMY_DESKTOP_CONFIG) return process.env.FRAMY_DESKTOP_CONFIG;
  const home = os.homedir();
  if (process.platform === "darwin")
    return path.join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json");
  if (process.platform === "win32")
    return path.join(process.env.APPDATA || path.join(home, "AppData", "Roaming"), "Claude", "claude_desktop_config.json");
  return path.join(home, ".config", "Claude", "claude_desktop_config.json");
}

function codeUserConfigPath() {
  return process.env.FRAMY_CODE_CONFIG || path.join(os.homedir(), ".claude.json");
}

function projectMcpPath() {
  const dir = process.env.FRAMY_PROJECT_DIR || process.cwd();
  return path.join(dir, ".mcp.json");
}

// Описание источников конфигов. writable — можно ли добавлять/удалять.
export function configSources() {
  return [
    { id: "code-user", label: "Claude Code · глобально", path: codeUserConfigPath(), kind: "code-user", writable: true },
    { id: "code-project", label: "Claude Code · проект (.mcp.json)", path: projectMcpPath(), kind: "mcp-json", writable: true },
    { id: "desktop", label: "Claude Desktop", path: desktopConfigPath(), kind: "desktop", writable: true },
  ];
}

async function readJson(file) {
  try {
    const raw = await fs.readFile(file, "utf8");
    return { exists: true, data: JSON.parse(raw) };
  } catch (e) {
    if (e.code === "ENOENT") return { exists: false, data: null };
    if (e instanceof SyntaxError) throw httpError(422, `Файл ${file} содержит невалидный JSON`);
    throw e;
  }
}

// Достаём объект mcpServers из конфига любого типа.
function extractServers(kind, data) {
  if (!data) return {};
  // code-user: top-level mcpServers (+ можно было бы projects[*].mcpServers)
  // mcp-json / desktop: top-level mcpServers
  return data.mcpServers || {};
}

// Определяем транспорт записи коннектора.
function describeTransport(def) {
  if (def && (def.url || def.serverUrl)) {
    return { transport: (def.type || "http").toLowerCase(), url: def.url || def.serverUrl };
  }
  return { transport: "stdio", command: def?.command, args: def?.args || [] };
}

// Маскируем секреты: значения env и заголовков отдаём как "••••".
function maskSecrets(def) {
  const clone = JSON.parse(JSON.stringify(def || {}));
  const maskMap = (obj) => {
    if (!obj || typeof obj !== "object") return obj;
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = typeof v === "string" && v.length ? "••••••" : v;
    return out;
  };
  if (clone.env) clone.env = maskMap(clone.env);
  if (clone.headers) clone.headers = maskMap(clone.headers);
  return clone;
}

// --- Публичное: список всех коннекторов из всех источников ---
export async function listConnectors() {
  const sources = configSources();
  const result = [];
  for (const src of sources) {
    const { exists, data } = await readJson(src.path).catch((e) => ({ exists: false, data: null, error: e.message }));
    const servers = extractServers(src.kind, data);
    const items = Object.entries(servers).map(([name, def]) => {
      const t = describeTransport(def);
      return {
        id: `${src.id}:${name}`,
        name,
        source: src.id,
        sourceLabel: src.label,
        ...t,
        envKeys: def?.env ? Object.keys(def.env) : [],
        headerKeys: def?.headers ? Object.keys(def.headers) : [],
        masked: maskSecrets(def),
      };
    });
    result.push({ source: src.id, label: src.label, path: src.path, exists, count: items.length, connectors: items });
  }
  return result;
}

// Сырое (немаскированное) определение коннектора — для внутренних вызовов MCP.
export async function getConnectorRaw(id) {
  const [sourceId, ...rest] = id.split(":");
  const name = rest.join(":");
  const src = configSources().find((s) => s.id === sourceId);
  if (!src) throw httpError(400, "Неизвестный источник");
  const { data } = await readJson(src.path);
  const def = data?.mcpServers?.[name];
  if (!def) throw httpError(404, "Коннектор не найден");
  return { name, source: src.id, def, ...describeTransport(def) };
}

// --- Добавить/обновить коннектор ---
export async function upsertConnector({ target, name, definition }) {
  const src = configSources().find((s) => s.id === target);
  if (!src) throw httpError(400, "Неизвестный целевой конфиг");
  if (!src.writable) throw httpError(400, "В этот конфиг запись запрещена");
  if (!name || !/^[A-Za-z0-9_.-]+$/.test(name))
    throw httpError(400, "Имя коннектора: только буквы, цифры, . _ -");
  if (!definition || typeof definition !== "object")
    throw httpError(400, "Нужно определение коннектора (JSON-объект)");
  if (!definition.command && !definition.url)
    throw httpError(400, "В определении должен быть либо command (локальный), либо url (удалённый)");

  const { data } = await readJson(src.path);
  const config = data || {};
  if (!config.mcpServers || typeof config.mcpServers !== "object") config.mcpServers = {};
  const isNew = !(name in config.mcpServers);
  config.mcpServers[name] = definition;

  await backupAndWrite(src.path, config);
  return { name, target, isNew, path: src.path };
}

// --- Удалить коннектор ---
export async function deleteConnector(id) {
  const [sourceId, ...rest] = id.split(":");
  const name = rest.join(":");
  const src = configSources().find((s) => s.id === sourceId);
  if (!src) throw httpError(400, "Неизвестный источник");
  const { exists, data } = await readJson(src.path);
  if (!exists || !data?.mcpServers || !(name in data.mcpServers))
    throw httpError(404, "Коннектор не найден");
  delete data.mcpServers[name];
  await backupAndWrite(src.path, data);
  return { id, removed: name };
}

// Бэкап перед записью + аккуратная запись с сохранением остального содержимого.
async function backupAndWrite(file, config) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  try {
    await fs.access(file);
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    await fs.copyFile(file, `${file}.framy-bak-${stamp}`);
  } catch {
    /* файла ещё нет — бэкап не нужен */
  }
  await fs.writeFile(file, JSON.stringify(config, null, 2) + "\n", "utf8");
}
