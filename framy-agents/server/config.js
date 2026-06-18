import os from "node:os";
import path from "node:path";

// Каталоги, где Claude Code хранит сабагентов (markdown-файлы с frontmatter).
// Можно переопределить через переменную окружения FRAMY_AGENT_DIRS
// (пути через двоеточие, первый — каталог по умолчанию для записи новых агентов).
export function getAgentDirs() {
  const override = process.env.FRAMY_AGENT_DIRS;
  if (override) {
    return override
      .split(path.delimiter)
      .map((p) => p.trim())
      .filter(Boolean)
      .map(expandHome);
  }

  const dirs = [];
  // Глобальные (пользовательские) агенты
  dirs.push(path.join(os.homedir(), ".claude", "agents"));
  // Проектные агенты — каталог проекта берём из FRAMY_PROJECT_DIR или cwd
  const projectDir = process.env.FRAMY_PROJECT_DIR || process.cwd();
  dirs.push(path.join(projectDir, ".claude", "agents"));
  return dirs.map(expandHome);
}

// Каталог по умолчанию для добавления новых агентов.
export function defaultWriteDir() {
  return getAgentDirs()[0];
}

function expandHome(p) {
  if (p.startsWith("~")) return path.join(os.homedir(), p.slice(1));
  return path.resolve(p);
}

// Допустимые значения поля model для сабагента Claude Code.
export const MODEL_PRESETS = [
  { id: "inherit", label: "Inherit (как у главного агента)" },
  { id: "opus", label: "Opus" },
  { id: "sonnet", label: "Sonnet" },
  { id: "haiku", label: "Haiku" },
];
