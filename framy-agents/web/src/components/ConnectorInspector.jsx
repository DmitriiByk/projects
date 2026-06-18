import React, { useEffect, useState } from "react";
import { api } from "../api.js";

export default function ConnectorInspector({ connector, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serverInfo, setServerInfo] = useState(null);
  const [tools, setTools] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true); setError("");
      try {
        const res = await api.connectorTools(connector.id);
        setServerInfo(res.serverInfo);
        setTools(res.tools || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [connector.id]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{connector.name} {serverInfo?.name ? <span className="mono" style={{ color: "var(--muted)", fontSize: 13, fontWeight: 400 }}>· {serverInfo.name} {serverInfo.version || ""}</span> : null}</h2>
          <button className="close-x" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {loading && <div className="empty"><span className="spinner" /> Подключаюсь к {connector.url}…</div>}
          {error && (
            <div className="banner error">
              {error}
              <div style={{ marginTop: 8, color: "var(--muted)" }}>
                Токен берётся из Claude Code. Если истёк — открой Claude Code, дёрни этот коннектор, затем повтори.
              </div>
            </div>
          )}

          {!loading && !error && (
            selected ? (
              <ToolRunner connector={connector} tool={selected} onBack={() => setSelected(null)} />
            ) : (
              <>
                <div className="banner info">Найдено инструментов: {tools.length}. Выбери, чтобы вызвать.</div>
                <div className="preview-list">
                  {tools.map((t) => (
                    <button key={t.name} className="preview-item" style={{ textAlign: "left", cursor: "pointer", background: "var(--panel-2)" }} onClick={() => setSelected(t)}>
                      <div>
                        <h4>{t.name}</h4>
                        <p>{t.description || "Без описания"}</p>
                      </div>
                    </button>
                  ))}
                  {tools.length === 0 && <div className="empty">Сервер не вернул инструментов.</div>}
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function ToolRunner({ connector, tool, onBack }) {
  const [args, setArgs] = useState(() => skeletonFromSchema(tool.inputSchema));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function run() {
    setBusy(true); setError(""); setResult(null);
    let parsed;
    try {
      parsed = args.trim() ? JSON.parse(args) : {};
    } catch {
      setBusy(false);
      return setError("Аргументы должны быть валидным JSON.");
    }
    try {
      const res = await api.connectorCall(connector.id, tool.name, parsed);
      setResult(res.result);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button className="btn-ghost" onClick={onBack} style={{ marginBottom: 14 }}>← К списку</button>
      <h3 style={{ margin: "0 0 4px", fontSize: 17 }}>{tool.name}</h3>
      {tool.description && <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 0 }}>{tool.description}</p>}

      <div className="form-field">
        <label>Аргументы (JSON)</label>
        <textarea value={args} onChange={(e) => setArgs(e.target.value)} style={{ minHeight: 120, fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12.5 }} />
        {tool.inputSchema?.properties && (
          <div className="form-hint">Поля: {Object.keys(tool.inputSchema.properties).join(", ") || "—"}</div>
        )}
      </div>

      <button className="btn-primary" onClick={run} disabled={busy}>{busy ? "Вызываю…" : "▶ Вызвать"}</button>

      {error && <div className="banner error" style={{ marginTop: 14 }}>{error}</div>}
      {result && (
        <div style={{ marginTop: 16 }}>
          <div className="field-label">Результат {result.isError ? "(ошибка инструмента)" : ""}</div>
          <div className="run-output">{renderResult(result)}</div>
        </div>
      )}
    </div>
  );
}

function renderResult(result) {
  if (Array.isArray(result?.content)) {
    return result.content
      .map((c) => (c.type === "text" ? c.text : JSON.stringify(c, null, 2)))
      .join("\n\n");
  }
  return JSON.stringify(result, null, 2);
}

function skeletonFromSchema(schema) {
  if (!schema?.properties) return "{}";
  const obj = {};
  for (const [k, v] of Object.entries(schema.properties)) {
    obj[k] = v.type === "number" || v.type === "integer" ? 0 : v.type === "boolean" ? false : v.type === "array" ? [] : "";
  }
  return JSON.stringify(obj, null, 2);
}
