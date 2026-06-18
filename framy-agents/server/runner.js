import { spawn } from "node:child_process";
import path from "node:path";
import os from "node:os";

// Проверка, доступен ли в системе CLI `claude`.
export function claudeBinary() {
  return process.env.FRAMY_CLAUDE_BIN || "claude";
}

export function checkClaudeAvailable() {
  return new Promise((resolve) => {
    const p = spawn(claudeBinary(), ["--version"], { shell: process.platform === "win32" });
    let out = "";
    p.stdout?.on("data", (d) => (out += d));
    p.on("error", () => resolve({ available: false }));
    p.on("close", (code) => resolve({ available: code === 0, version: out.trim() }));
  });
}

// Запуск задачи конкретным сабагентом через `claude` в headless-режиме.
// Стримит вывод через колбэк onEvent({type, data}).
export function runAgentTask({ agent, task, model }, onEvent) {
  const prompt = buildPrompt(agent, task);
  const args = ["-p", prompt];

  // Переопределение модели на время запуска (если выбрано в UI).
  if (model && model !== "inherit") args.push("--model", model);

  // Рабочая директория: для проектного агента — корень проекта, иначе домашняя.
  let cwd = os.homedir();
  if (agent.scope === "project" && agent.filePath) {
    cwd = path.resolve(path.dirname(agent.filePath), "..", "..");
  }

  const child = spawn(claudeBinary(), args, {
    cwd,
    shell: process.platform === "win32",
    env: process.env,
  });

  onEvent({ type: "start", data: { cmd: `${claudeBinary()} -p …`, cwd, model: model || agent.model } });

  child.stdout.on("data", (d) => onEvent({ type: "stdout", data: d.toString() }));
  child.stderr.on("data", (d) => onEvent({ type: "stderr", data: d.toString() }));
  child.on("error", (err) => {
    onEvent({
      type: "error",
      data:
        err.code === "ENOENT"
          ? "CLI `claude` не найден. Установите Claude Code и убедитесь, что команда `claude` доступна в PATH."
          : String(err.message || err),
    });
  });
  child.on("close", (code) => onEvent({ type: "done", data: { code } }));

  return child;
}

function buildPrompt(agent, task) {
  return [
    `Use the "${agent.name}" subagent to handle the following task.`,
    `Delegate to that subagent and return its result.`,
    ``,
    `Task:`,
    task,
  ].join("\n");
}
