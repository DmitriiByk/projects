import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import AddConnectorModal from "./AddConnectorModal.jsx";
import ConnectorInspector from "./ConnectorInspector.jsx";

export default function ConnectorsView() {
  const [sources, setSources] = useState([]);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [inspect, setInspect] = useState(null);

  async function refresh() {
    setLoading(true);
    try {
      const res = await api.listConnectors();
      setSources(Array.isArray(res?.sources) ? res.sources : []);
      setTargets(Array.isArray(res?.targets) ? res.targets : []);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { refresh(); }, []);

  function flash(m) { setToast(m); setTimeout(() => setToast(""), 5000); }

  async function openClaudeCatalog() {
    window.open("https://claude.ai/settings/connectors", "_blank", "noopener");
    try {
      await api.openClaude();
      flash("Открываю каталог: приложение Claude и веб-настройки коннекторов. OAuth-коннекторы (Gmail, Slack…) добавляются там.");
    } catch {
      flash("Открыл веб-настройки коннекторов. Приложение Claude запусти вручную, если нужно.");
    }
  }

  async function onDelete(c) {
    if (!confirm(`Удалить коннектор «${c.name}» из «${c.sourceLabel}»? (бэкап конфига создаётся автоматически)`)) return;
    try {
      await api.deleteConnector(c.id);
      flash(`Коннектор «${c.name}» удалён. Перезапусти Claude, чтобы применить.`);
      refresh();
    } catch (e) {
      alert("Ошибка: " + e.message);
    }
  }

  const total = sources.reduce((n, s) => n + s.count, 0);

  return (
    <div>
      <div className="banner warn" style={{ marginTop: 18 }}>
        Изменения попадают прямо в конфиги Claude. Они применяются после <b>перезапуска</b> Claude Code / Desktop.
        Перед каждой записью создаётся резервная копия (<span className="mono">.framy-bak-…</span>).
      </div>

      {error && <div className="banner error">{error}</div>}
      {toast && <div className="banner info">{toast}</div>}

      <div className="searchbar">
        <div style={{ flex: 1, color: "var(--muted)", fontSize: 14 }}>
          Подключено коннекторов: <b style={{ color: "var(--text)" }}>{total}</b>
        </div>
        <button className="btn-ghost" onClick={openClaudeCatalog}>↗ Каталог Claude</button>
        <button className="btn-ghost" onClick={refresh}>↻ Обновить</button>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>＋ Добавить коннектор</button>
      </div>

      <div className="banner" style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--muted)" }}>
        OAuth-коннекторы из каталога Claude (Gmail, Slack, Google Drive…) добавляются в самом приложении Claude —
        кнопка <b style={{ color: "var(--text)" }}>«↗ Каталог Claude»</b> откроет его. Здесь они появятся в списке после подключения.
      </div>

      {loading ? (
        <div className="empty"><span className="spinner" /> Загрузка…</div>
      ) : (
        sources.map((src) => (
          <div key={src.source} style={{ marginBottom: 26 }}>
            <div className="src-head">
              <span className="src-title">{src.label}</span>
              <span className="scope-tag">{src.exists ? `${src.count} шт.` : "нет файла"}</span>
              <span className="src-path mono">{src.path}</span>
            </div>
            {src.connectors.length === 0 ? (
              <div className="empty" style={{ padding: "26px" }}>
                {src.exists ? "В этом конфиге нет коннекторов." : "Конфиг ещё не создан — появится при первом добавлении."}
              </div>
            ) : (
              <div className="grid">
                {src.connectors.map((c) => (
                  <ConnectorCard key={c.id} c={c} onDelete={onDelete} onInspect={setInspect} />
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {showAdd && (
        <AddConnectorModal
          targets={targets}
          onClose={() => setShowAdd(false)}
          onAdded={(msg) => { setShowAdd(false); flash(msg); refresh(); }}
        />
      )}

      {inspect && <ConnectorInspector connector={inspect} onClose={() => setInspect(null)} />}
    </div>
  );
}

function ConnectorCard({ c, onDelete, onInspect }) {
  const remote = c.transport !== "stdio";
  return (
    <div className="card" style={{ "--bar": remote ? "#6ea8fe" : "#4ade80" }}>
      <div className="card-head">
        <h3>{c.name}</h3>
        <span className="scope-tag">{remote ? c.transport.toUpperCase() : "STDIO"}</span>
      </div>
      <p className="desc" style={{ WebkitLineClamp: 2 }}>
        {remote ? c.url : `${c.command || ""} ${(c.args || []).join(" ")}`.trim() || "—"}
      </p>
      {(c.envKeys?.length > 0 || c.headerKeys?.length > 0) && (
        <div className="tools">
          {c.envKeys.map((k) => <span className="tool-chip" key={"e" + k}>{k}=••••</span>)}
          {c.headerKeys.map((k) => <span className="tool-chip" key={"h" + k}>{k}: ••••</span>)}
        </div>
      )}
      <div className="card-actions">
        {remote && <button className="btn-primary" style={{ flex: 1 }} onClick={() => onInspect(c)}>⚙ Инструменты</button>}
        {!remote && <span style={{ flex: 1, fontSize: 11.5, color: "var(--muted)" }}>{c.sourceLabel}</span>}
        <button className="btn-danger" onClick={() => onDelete(c)}>Удалить</button>
      </div>
    </div>
  );
}
