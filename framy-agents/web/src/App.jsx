import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api.js";
import AgentCard from "./components/AgentCard.jsx";
import RunPanel from "./components/RunPanel.jsx";
import AddAgentModal from "./components/AddAgentModal.jsx";
import ConnectorsView from "./components/ConnectorsView.jsx";

export default function App() {
  const [view, setView] = useState("agents");
  const [agents, setAgents] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [query, setQuery] = useState("");
  const [runAgent, setRunAgent] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const models = health?.models || [
    { id: "inherit", label: "Inherit" },
    { id: "opus", label: "Opus" },
    { id: "sonnet", label: "Sonnet" },
    { id: "haiku", label: "Haiku" },
  ];

  async function refresh() {
    setLoading(true);
    try {
      const [h, a] = await Promise.all([api.health(), api.listAgents()]);
      setHealth(h);
      setAgents(a.agents);
      setError("");
    } catch (e) {
      setError("Не удалось связаться с сервером: " + e.message + ". Запущен ли бэкенд (npm run dev)?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  function flash(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  }

  async function onModelChange(id, model) {
    await api.setModel(id, model);
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, model } : a)));
  }

  async function onDelete(agent) {
    if (!confirm(`Удалить агента «${agent.name}»? Файл будет удалён с диска.`)) return;
    try {
      await api.deleteAgent(agent.id);
      setAgents((prev) => prev.filter((a) => a.id !== agent.id));
      flash(`Агент «${agent.name}» удалён.`);
    } catch (e) {
      alert("Ошибка удаления: " + e.message);
    }
  }

  function onAdded(created, msg) {
    setShowAdd(false);
    flash(msg);
    refresh();
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter(
      (a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
    );
  }, [agents, query]);

  const claudeAvailable = health?.claude?.available;

  return (
    <div className="app">
      <div className="header">
        <div className="brand">
          <div className="logo">
            <svg width="38" height="38" viewBox="0 0 40 40" fill="none" aria-label="Framy">
              <rect width="40" height="40" rx="10" fill="url(#framyG)" />
              <rect x="8.5" y="8.5" width="23" height="23" rx="6.5" stroke="#fff" strokeWidth="2.4" />
              <rect x="14.6" y="14.6" width="10.8" height="10.8" rx="3.2" stroke="#fff" strokeWidth="2.4" />
              <rect x="18.4" y="18.4" width="3.2" height="3.2" rx="1" fill="#fff" />
              <defs>
                <linearGradient id="framyG" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#5b9dff" />
                  <stop offset="1" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1>Framy</h1>
            <p>Панель управления сабагентами Claude Code</p>
          </div>
        </div>
        <div className="toolbar">
          <span className="status-pill">
            <span className={"dot " + (claudeAvailable ? "ok" : "bad")} />
            CLI claude {claudeAvailable ? health?.claude?.version || "доступен" : "не найден"}
          </span>
          {view === "agents" && <button className="btn-ghost" onClick={refresh}>↻ Обновить</button>}
          {view === "agents" && <button className="btn-primary" onClick={() => setShowAdd(true)}>＋ Добавить агента</button>}
        </div>
      </div>

      <div className="nav-tabs">
        <button className={view === "agents" ? "active" : ""} onClick={() => setView("agents")}>Агенты</button>
        <button className={view === "connectors" ? "active" : ""} onClick={() => setView("connectors")}>Коннекторы</button>
      </div>

      {view === "connectors" ? (
        <ConnectorsView />
      ) : (
      <>
      {error && <div className="banner error" style={{ marginTop: 18 }}>{error}</div>}
      {toast && <div className="banner info" style={{ marginTop: 18 }}>{toast}</div>}

      <div className="searchbar">
        <input
          placeholder="Поиск по имени или описанию…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="status-pill">{filtered.length} агент(ов)</span>
      </div>

      {loading ? (
        <div className="empty"><span className="spinner" /> Загрузка…</div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          {agents.length === 0 ? (
            <>
              <p style={{ fontSize: 16, marginTop: 0 }}>Агентов пока нет.</p>
              <p>Создайте первого вручную, импортируйте из GitHub или вставьте markdown.</p>
              <button className="btn-primary" onClick={() => setShowAdd(true)}>＋ Добавить агента</button>
            </>
          ) : (
            <p>Ничего не найдено по запросу «{query}».</p>
          )}
        </div>
      ) : (
        <div className="grid">
          {filtered.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              models={models}
              onModelChange={onModelChange}
              onRun={setRunAgent}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      <div className="footer-note">
        Каталоги: {health?.agentDirs?.map((d) => <span className="mono" key={d}>{d}　</span>)}
      </div>

      {runAgent && (
        <RunPanel
          agent={runAgent}
          models={models}
          claudeAvailable={claudeAvailable}
          onClose={() => setRunAgent(null)}
        />
      )}
      {showAdd && <AddAgentModal models={models} onClose={() => setShowAdd(false)} onAdded={onAdded} />}
      </>
      )}
    </div>
  );
}
