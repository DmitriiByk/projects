import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { claudeBinary } from "./runner.js";

const CACHE_FILE = process.env.FRAMY_TRANSLATIONS_CACHE || path.join(os.homedir(), ".framy-translations.json");

function hash(text) {
  return crypto.createHash("sha1").update("ru\n" + text).digest("hex").slice(0, 16);
}

async function readCache() {
  try { return JSON.parse(await fs.readFile(CACHE_FILE, "utf8")); } catch { return {}; }
}
async function writeCache(obj) {
  try { await fs.writeFile(CACHE_FILE, JSON.stringify(obj, null, 2), "utf8"); } catch { /* noop */ }
}

// Прогон claude в headless-режиме; возвращает stdout.
function runClaude(prompt) {
  return new Promise((resolve, reject) => {
    const child = spawn(claudeBinary(), ["-p", prompt], { shell: process.platform === "win32", env: process.env });
    let out = "", err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("error", (e) => reject(e.code === "ENOENT"
      ? new Error("CLI `claude` не найден — автоперевод недоступен. Установите Claude Code.")
      : e));
    child.on("close", () => resolve(out));
  });
}

function extractJsonArray(text) {
  let t = text.trim().replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  const start = t.indexOf("[");
  const end = t.lastIndexOf("]");
  if (start === -1 || end === -1) return null;
  try { return JSON.parse(t.slice(start, end + 1)); } catch { return null; }
}

async function translateBatch(texts) {
  if (!texts.length) return [];
  const numbered = texts.map((t, i) => `${i + 1}. ${t.replace(/\n/g, " ")}`).join("\n");
  const prompt = [
    "Translate the following UI/agent/skill descriptions from English to natural Russian.",
    "Keep product names, tool names and code identifiers as-is (do not translate them).",
    "Return ONLY a JSON array of strings — the translations in the same order, nothing else.",
    "",
    numbered,
  ].join("\n");
  const out = await runClaude(prompt);
  const arr = extractJsonArray(out);
  if (!arr || arr.length !== texts.length) return texts.map(() => null); // не удалось — вернём null'ы
  return arr;
}

// items: [{id, text}] → { translations: { id: ru }, missing, translated }
export async function translateItems(items) {
  const cache = await readCache();
  const translations = {};
  const toTranslate = []; // {id, text, h}
  for (const it of items) {
    if (!it || !it.text) continue;
    const h = hash(it.text);
    if (cache[h]) translations[it.id] = cache[h];
    else toTranslate.push({ ...it, h });
  }
  let translated = 0;
  if (toTranslate.length) {
    const ru = await translateBatch(toTranslate.map((x) => x.text));
    toTranslate.forEach((x, i) => {
      if (ru[i]) { cache[x.h] = ru[i]; translations[x.id] = ru[i]; translated++; }
    });
    if (translated) await writeCache(cache);
  }
  return { translations, requested: items.length, translated, cached: items.length - toTranslate.length };
}
