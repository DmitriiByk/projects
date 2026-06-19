import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import matter from "gray-matter";
import { getSkillDirs, getSkillMdDirs } from "./config.js";

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
