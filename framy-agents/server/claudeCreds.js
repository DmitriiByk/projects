// Чтение OAuth-токенов, которые Claude Code сохранил для удалённых MCP-серверов.
// macOS: Keychain (служба "Claude Code-credentials"). Linux/проч.: ~/.claude/.credentials.json
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

function keychainRead(service) {
  return new Promise((resolve) => {
    execFile("security", ["find-generic-password", "-s", service, "-w"], (err, stdout) => {
      resolve(err ? null : (stdout || "").trim());
    });
  });
}

export async function readClaudeCreds() {
  if (process.env.FRAMY_CLAUDE_CREDS) {
    try { return JSON.parse(await fs.readFile(process.env.FRAMY_CLAUDE_CREDS, "utf8")); } catch { return null; }
  }
  if (process.platform === "darwin") {
    const blob = await keychainRead("Claude Code-credentials");
    if (blob) { try { return JSON.parse(blob); } catch { /* ниже попробуем файл */ } }
  }
  const file = path.join(os.homedir(), ".claude", ".credentials.json");
  try { return JSON.parse(await fs.readFile(file, "utf8")); } catch { return null; }
}

// Нормализация expiresAt к миллисекундам epoch.
function toMs(v) {
  if (!v) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return n < 1e12 ? n * 1000 : n; // секунды → мс
}

// Достаём токен mcpOAuth по имени сервера. Ключи бывают вида "mobbin|<hash>".
export async function getMcpToken(serverName) {
  const creds = await readClaudeCreds();
  const oauth = creds?.mcpOAuth || creds?.mcpServers || {};
  const keys = Object.keys(oauth);
  const key =
    keys.find((k) => k === serverName) ||
    keys.find((k) => k.split("|")[0] === serverName) ||
    keys.find((k) => k.toLowerCase().startsWith(serverName.toLowerCase() + "|"));
  if (!key) return { found: false };
  const e = oauth[key] || {};
  const token = e.accessToken || e.access_token || e.token;
  const expiresAt = toMs(e.expiresAt || e.expires_at || e.expiresAtMs);
  return {
    found: Boolean(token),
    token,
    expiresAt,
    expired: expiresAt ? Date.now() > expiresAt : false,
    key,
    scope: e.scope || null,
  };
}
