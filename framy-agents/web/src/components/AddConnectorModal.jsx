import React, { useState } from "react";
import { api } from "../api.js";

export default function AddConnectorModal({ targets, onClose, onAdded }) {
  const [tab, setTab] = useState("remote");
  const writable = targets.filter((t) => t.writable);
  const [target, setTarget] = useState(writable[0]?.id || "code-user");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>＋ Добавить коннектор</h2>
          <button className="close-x" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-field">
            <label>Куда записать</label>
            <select value={target} onChange={(e) => setTarget(e.target.value)}>
              {writable.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <div className="form-hint mono">{targets.find((t) => t.id === target)?.path}</div>
          </div>

          <div className="tabs">
            <button className={tab === "remote" ? "active" : ""} onClick={() => setTab("remote")}>Удалённый (API)</button>
            <button className={tab === "local" ? "active" : ""} onClick={() => setTab("local")}>Локальный</button>
            <button className={tab === "json" ? "active" : ""} onClick={() => setTab("json")}>JSON</button>
          </div>

          {tab === "remote" && <RemoteForm target={target} onAdded={onAdded} />}
          {tab === "local" && <LocalForm target={target} onAdded={onAdded} />}
          {tab === "json" && <JsonForm target={target} onAdded={onAdded} />}
        </div>
      </div>
    </div>
  );
}

function useSubmit(onAdded) {
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function run(target, name, definition) {
    setErr(""); setBusy(true);
    try {
      const res = await api.addConnector(target, name, definition);
      onAdded(`Коннектор «${res.name}» ${res.isNew ? "добавлен" : "обновлён"}. Перезапусти Claude, чтобы применить.`);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }
  return { err, busy, run };
}

function RemoteForm({ target, onAdded }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [transport, setTransport] = useState("http");
  const [headerName, setHeaderName] = useState("Authorization");
  const [token, setToken] = useState("");
  const { err, busy, run } = useSubmit(onAdded);

  function submit() {
    const def = { type: transport, url };
    if (token.trim()) {
      const value = headerName.toLowerCase() === "authorization" && !/\s/.test(token) ? `Bearer ${token}` : token;
      def.headers = { [headerName]: value };
    }
    run(target, name, def);
  }

  return (
    <div>
      {err && <div className="banner error">{err}</div>}
      <div className="banner info">Удалённый MCP-сервер по URL. Токен пойдёт в заголовок авторизации.</div>
      <div className="form-field">
        <label>Имя коннектора</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="sentry" />
      </div>
      <div className="row" style={{ gap: 12 }}>
        <div className="form-field" style={{ flex: 2 }}>
          <label>URL</label>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://mcp.example.com/mcp" />
        </div>
        <div className="form-field" style={{ flex: 1 }}>
          <label>Транспорт</label>
          <select value={transport} onChange={(e) => setTransport(e.target.value)}>
            <option value="http">HTTP</option>
            <option value="sse">SSE</option>
          </select>
        </div>
      </div>
      <div className="row" style={{ gap: 12 }}>
        <div className="form-field" style={{ flex: 1 }}>
          <label>Заголовок авторизации</label>
          <input value={headerName} onChange={(e) => setHeaderName(e.target.value)} placeholder="Authorization" />
        </div>
        <div className="form-field" style={{ flex: 1.4 }}>
          <label>Токен / ключ (опц.)</label>
          <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="sk-…" type="password" />
        </div>
      </div>
      <button className="btn-primary" onClick={submit} disabled={busy || !name.trim() || !url.trim()}>
        {busy ? "Сохраняю…" : "Добавить"}
      </button>
    </div>
  );
}

function LocalForm({ target, onAdded }) {
  const [name, setName] = useState("");
  const [command, setCommand] = useState("npx");
  const [args, setArgs] = useState("");
  const [env, setEnv] = useState("");
  const { err, busy, run } = useSubmit(onAdded);

  function submit() {
    const def = { command, args: args.split(/\s+/).filter(Boolean) };
    const envObj = {};
    env.split("\n").forEach((line) => {
      const i = line.indexOf("=");
      if (i > 0) envObj[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    });
    if (Object.keys(envObj).length) def.env = envObj;
    run(target, name, def);
  }

  return (
    <div>
      {err && <div className="banner error">{err}</div>}
      <div className="banner info">Локальный MCP-сервер — запускается как процесс на твоей машине.</div>
      <div className="form-field">
        <label>Имя коннектора</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="playwright" />
      </div>
      <div className="row" style={{ gap: 12 }}>
        <div className="form-field" style={{ flex: 1 }}>
          <label>Команда</label>
          <input value={command} onChange={(e) => setCommand(e.target.value)} placeholder="npx" />
        </div>
        <div className="form-field" style={{ flex: 2 }}>
          <label>Аргументы (через пробел)</label>
          <input value={args} onChange={(e) => setArgs(e.target.value)} placeholder="-y @playwright/mcp@latest" />
        </div>
      </div>
      <div className="form-field">
        <label>Переменные окружения (KEY=VALUE, по строке на каждую)</label>
        <textarea value={env} onChange={(e) => setEnv(e.target.value)} style={{ minHeight: 80 }} placeholder={"API_KEY=sk-…\nREGION=eu"} />
      </div>
      <button className="btn-primary" onClick={submit} disabled={busy || !name.trim() || !command.trim()}>
        {busy ? "Сохраняю…" : "Добавить"}
      </button>
    </div>
  );
}

function JsonForm({ target, onAdded }) {
  const [name, setName] = useState("");
  const [raw, setRaw] = useState("");
  const { err, busy, run } = useSubmit(onAdded);

  function submit() {
    let def;
    try {
      def = JSON.parse(raw);
    } catch {
      return run(target, name, "INVALID");
    }
    // Допускаем как { "name": {…} }, так и просто {…}
    if (!def.command && !def.url) {
      const keys = Object.keys(def);
      if (keys.length === 1 && typeof def[keys[0]] === "object") {
        if (!name) setName(keys[0]);
        return run(target, name || keys[0], def[keys[0]]);
      }
    }
    run(target, name, def);
  }

  return (
    <div>
      {err && <div className="banner error">{err}</div>}
      <div className="banner info">Вставь определение сервера. Можно как объект, так и в обёртке <span className="mono">{"{ \"имя\": { … } }"}</span>.</div>
      <div className="form-field">
        <label>Имя (если не указано в JSON)</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="my-server" />
      </div>
      <div className="form-field">
        <textarea value={raw} onChange={(e) => setRaw(e.target.value)} style={{ minHeight: 180 }}
          placeholder={'{\n  "command": "npx",\n  "args": ["-y", "@modelcontextprotocol/server-github"],\n  "env": { "GITHUB_TOKEN": "ghp_…" }\n}'} />
      </div>
      <button className="btn-primary" onClick={submit} disabled={busy || !raw.trim()}>
        {busy ? "Сохраняю…" : "Добавить"}
      </button>
    </div>
  );
}
