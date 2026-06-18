import React, { useEffect, useRef, useState } from "react";
import { runTask } from "../api.js";

export default function RunPanel({ agent, models, claudeAvailable, onClose }) {
  const [task, setTask] = useState("");
  const [model, setModel] = useState(agent.model || "inherit");
  const [running, setRunning] = useState(false);
  const [lines, setLines] = useState([]);
  const cancelRef = useRef(null);
  const outRef = useRef(null);

  useEffect(() => {
    return () => cancelRef.current?.();
  }, []);

  useEffect(() => {
    if (outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight;
  }, [lines]);

  function append(cls, text) {
    setLines((prev) => [...prev, { cls, text }]);
  }

  function start() {
    if (!task.trim()) return;
    setLines([]);
    setRunning(true);
    append("meta", `→ Передаю задачу агенту «${agent.name}» (модель: ${model})…\n`);
    cancelRef.current = runTask(agent.id, task, model, (evt) => {
      if (evt.type === "start") append("meta", `$ ${evt.data.cmd}\n`);
      else if (evt.type === "stdout") append("", evt.data);
      else if (evt.type === "stderr") append("err", evt.data);
      else if (evt.type === "error") { append("err", "\n⚠ " + evt.data + "\n"); setRunning(false); }
      else if (evt.type === "done") {
        append("meta", `\n← Готово (код выхода ${evt.data.code}).`);
        setRunning(false);
      }
    });
  }

  function stop() {
    cancelRef.current?.();
    setRunning(false);
    append("meta", "\n■ Остановлено.");
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>▶ Задача для «{agent.name}»</h2>
          <button className="close-x" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {!claudeAvailable && (
            <div className="banner warn">
              CLI <span className="mono">claude</span> не найден в системе. Запуск работать не будет, пока не
              установлен Claude Code. Остальные функции (просмотр, смена модели, добавление) доступны.
            </div>
          )}

          <div className="form-field">
            <label>Что нужно сделать</label>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Например: проверь src/auth на уязвимости и предложи фиксы"
              disabled={running}
            />
          </div>

          <div className="row" style={{ gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label className="field-label">Модель для этого запуска</label>
              <select value={model} onChange={(e) => setModel(e.target.value)} disabled={running}>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>
            <div style={{ alignSelf: "flex-end" }}>
              {!running ? (
                <button className="btn-primary" onClick={start} disabled={!task.trim() || !claudeAvailable}>
                  Запустить
                </button>
              ) : (
                <button className="btn-ghost" onClick={stop}>■ Стоп</button>
              )}
            </div>
          </div>

          {(lines.length > 0 || running) && (
            <div className="run-output" ref={outRef}>
              {lines.map((l, i) => (
                <span key={i} className={l.cls}>{l.text}</span>
              ))}
              {running && <span className="spinner" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
