import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import matter from "gray-matter";
import { getSkillDirs, getSkillMdDirs } from "./config.js";
import { claudeBinary } from "./runner.js";
import { httpError } from "./agents.js";

function scopeForSkillDir(dir) {
  const userSkills = path.join(os.homedir(), ".claude", "skills");
  if (path.resolve(dir) === path.resolve(userSkills)) return "user";
  if (dir.includes(path.join(".claude", "skills"))) return "project";
  return "workflow";
}

function parseSkillMd(filePath, raw, source, fallbackName) {
  const parsed = matter(raw);
  const data = parsed.data || {};
  const name = data.name || fallbackName;
  return {
    name,
    description: data.description || "",
    descriptionRu: data.description_ru || data.descriptionRu || null,
    source,
    filePath,
    body: parsed.content.trim().slice(0, 600),
  };
}

// Скиллы вида <dir>/<skill-name>/SKILL.md
async function scanSkillDirs() {
  const out = [];
  for (const dir of getSkillDirs()) {
    let entries;
    try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { continue; }
    const source = scopeForSkillDir(dir);
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const file = path.join(dir, e.name, "SKILL.md");
      try {
        const raw = await fs.readFile(file, "utf8");
        const s = parseSkillMd(file, raw, source, e.name);
        if (s.description) out.push(s);
      } catch { /* нет SKILL.md — пропускаем */ }
    }
  }
  return out;
}

// «Плоские» .md-воркфлоу в корне указанных каталогов (не рекурсивно).
async function scanWorkflowMd() {
  const out = [];
  for (const dir of getSkillMdDirs()) {
    let entries;
    try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      if (!e.isFile() || !e.name.endsWith(".md")) continue;
      if (/^(README|CLAUDE|CHANGELOG)/i.test(e.name)) continue;
      const file = path.join(dir, e.name);
      try {
        const raw = await fs.readFile(file, "utf8");
        if (!raw.startsWith("---")) continue; // только с frontmatter
        const s = parseSkillMd(file, raw, "workflow", e.name.replace(/\.md$/, ""));
        if (s.name && s.description) out.push(s);
      } catch { /* пропускаем */ }
    }
  }
  return out;
}

export async function listSkills() {
  const all = [...(await scanSkillDirs()), ...(await scanWorkflowMd())];
  const seen = new Set();
  const result = [];
  for (const s of all) {
    const id = `${s.source}:${s.name}`;
    if (seen.has(id)) continue;
    seen.add(id);
    result.push({ id, ...s });
  }
  result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}

export async function getSkillById(id) {
  const all = await listSkills();
  return all.find((s) => s.id === id) || null;
}

// Прочитать сырой контент файла скилла + признак возможности записи.
export async function readSkillContent(id) {
  const skill = await getSkillById(id);
  if (!skill) throw httpError(404, "Скилл не найден");
  const content = await fs.readFile(skill.filePath, "utf8");
  let writable = true;
  try { await fs.access(skill.filePath, fs.constants.W_OK); } catch { writable = false; }
  return { id, name: skill.name, source: skill.source, filePath: skill.filePath, writable, content };
}

// Сохранить контент: валидация frontmatter + бэкап + запись.
export async function saveSkillContent(id, content) {
  const skill = await getSkillById(id);
  if (!skill) throw httpError(404, "Скилл не найден");
  if (typeof content !== "string" || !content.trim()) throw httpError(400, "Пустой контент");

  let parsed;
  try { parsed = matter(content); } catch { throw httpError(422, "Невалидный frontmatter (--- … ---)"); }
  const data = parsed.data || {};
  if (!data.name || !String(data.name).trim())
    throw httpError(422, "В frontmatter обязателен name");
  if (!data.description || !String(data.description).trim())
    throw httpError(422, "В frontmatter обязателен description");

  try { await fs.access(skill.filePath, fs.constants.W_OK); }
  catch { throw httpError(403, "Файл скилла только для чтения — сохранить нельзя"); }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  try { await fs.copyFile(skill.filePath, `${skill.filePath}.framy-bak-${stamp}`); } catch { /* noop */ }
  await fs.writeFile(skill.filePath, content, "utf8");
  return { id, name: data.name, filePath: skill.filePath, saved: true };
}

function runClaude(prompt) {
  return new Promise((resolve, reject) => {
    const child = spawn(claudeBinary(), ["-p", prompt], { shell: process.platform === "win32", env: process.env });
    let out = "", err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("error", (e) => reject(e.code === "ENOENT"
      ? httpError(503, "CLI `claude` не найден — ассистент недоступен.")
      : e));
    child.on("close", () => resolve(out));
  });
}

function stripFences(text) {
  let t = text.trim();
  // Убираем обрамляющий ```markdown ... ``` или ``` ... ```
  const fence = t.match(/^```[a-zA-Z]*\n([\s\S]*?)\n```$/);
  if (fence) return fence[1].trim();
  return t;
}

// Ассистент: переписать контент скилла по запросу пользователя.
export async function assistSkill({ content, request }) {
  if (!content || !request) throw httpError(400, "Нужны content и request");
  const prompt = [
    "You are helping the user edit a Claude Code SKILL.md markdown file.",
    "Apply the user's request to the document and return the COMPLETE revised file.",
    "Rules:",
    "- Return ONLY the full markdown file content, no commentary, no explanations.",
    "- Keep the YAML frontmatter block (--- ... ---) with valid `name` and `description`.",
    "- Preserve the document's original language unless the user explicitly asks to change it.",
    "",
    "=== USER REQUEST ===",
    request,
    "",
    "=== CURRENT FILE ===",
    content,
  ].join("\n");
  const out = await runClaude(prompt);
  const revised = stripFences(out);
  if (!revised) throw httpError(502, "Ассистент вернул пустой ответ");
  return { revised };
}
