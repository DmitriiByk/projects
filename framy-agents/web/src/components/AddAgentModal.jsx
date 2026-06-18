import React, { useState } from "react";
import { api } from "../api.js";

const KNOWN_REPOS = [
  "wshobson/agents",
  "VoltAgent/awesome-claude-code-subagents",
  "0xfurai/claude-code-subagents",
];

export default function AddAgentModal({ models, onClose, onAdded }) {
  const [tab, setTab] = useState("manual");
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>＋ Добавить агента</h2>
          <button className="close-x" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="tabs">
            <button className={tab === "manual" ? "active" : ""} onClick={() => setTab("manual")}>Вручную</button>
            <button className={tab === "github" ? "active" : ""} onClick={() => setTab("github")}>Из GitHub</button>
            <button className={tab === "paste" ? "active" : ""} onClick={() => setTab("paste")}>Вставить markdown</button>
          </div>

          {tab === "manual" && <ManualForm models={models} onAdded={onAdded} />}
          {tab === "github" && <GithubImport onAdded={onAdded} />}
          {tab === "paste" && <PasteForm onAdded={onAdded} />}
        </div>
      </div>
    </div>
  );
}

function ManualForm({ models, onAdded }) {
  const [form, setForm] = useState({ name: "", description: "", model: "inherit", tools: "", prompt: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit() {
    setErr(""); setBusy(true);
    try {
      const tools = form.tools.split(",").map((t) => t.trim()).filter(Boolean);
      const agent = await api.createAgent({ ...form, tools });
      onAdded([agent], `Агент «${agent.name}» создан.`);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {err && <div className="banner error">{err}</div>}
      <div className="form-field">
        <label>Имя (латиницей, в kebab-case)</label>
        <input value={form.name} onChange={set("name")} placeholder="security-reviewer" />
      </div>
      <div className="form-field">
        <label>Описание — когда вызывать агента *</label>
        <input value={form.description} onChange={set("description")} placeholder="Use this agent to review code for security issues" />
        <div className="form-hint">Используется Claude Code для авто-выбора агента под задачу.</div>
      </div>
      <div className="row" style={{ gap: 12 }}>
        <div className="form-field" style={{ flex: 1 }}>
          <label>Модель</label>
          <select value={form.model} onChange={set("model")}>
            {models.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </div>
        <div className="form-field" style={{ flex: 1.4 }}>
          <label>Инструменты (через запятую, опц.)</label>
          <input value={form.tools} onChange={set("tools")} placeholder="Read, Grep, Bash" />
        </div>
      </div>
      <div className="form-field">
        <label>Системный промпт</label>
        <textarea value={form.prompt} onChange={set("prompt")} placeholder="Ты — старший инженер по безопасности. Анализируй код и…" />
      </div>
      <button className="btn-primary" onClick={submit} disabled={busy}>
        {busy ? "Создаю…" : "Создать агента"}
      </button>
    </div>
  );
}

function GithubImport({ onAdded }) {
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState(null);
  const [selected, setSelected] = useState({});
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function doPreview(targetUrl) {
    const u = targetUrl ?? url;
    if (!u.trim()) return;
    setErr(""); setBusy(true); setPreview(null);
    try {
      const res = await api.githubPreview(u);
      setPreview(res);
      const sel = {};
      res.agents.forEach((_, i) => (sel[i] = true));
      setSelected(sel);
      if (!res.agents.length) setErr("В репозитории не найдено валидных агентов (.md с полями name и description).");
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function doImport() {
    setErr(""); setBusy(true);
    try {
      const chosen = preview.agents.filter((_, i) => selected[i]);
      const res = await api.githubImport(chosen);
      const msg = `Импортировано: ${res.created.length}` + (res.errors.length ? `, с ошибками: ${res.errors.length}` : "");
      onAdded(res.created, msg);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {err && <div className="banner error">{err}</div>}
      <div className="form-field">
        <label>Ссылка на GitHub-репозиторий или owner/repo[/путь]</label>
        <div className="row" style={{ gap: 8 }}>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://github.com/owner/repo/tree/main/.claude/agents" />
          <button className="btn-ghost" onClick={() => doPreview()} disabled={busy} style={{ whiteSpace: "nowrap" }}>
            {busy && !preview ? "Ищу…" : "Найти агентов"}
          </button>
        </div>
        <div className="form-hint">
          Ищу <span className="mono">.md</span>-файлы в <span className="mono">.claude/agents</span>, <span className="mono">agents/</span> или корне.
          Популярные коллекции: {KNOWN_REPOS.map((r) => (
            <a key={r} href="#" onClick={(e) => { e.preventDefault(); setUrl(r); doPreview(r); }} className="mono" style={{ color: "var(--accent-2)", marginRight: 8 }}>{r}</a>
          ))}
        </div>
      </div>

      {preview && preview.agents.length > 0 && (
        <>
          <div className="banner info">Найдено {preview.count} в {preview.repo}@{preview.branch}. Отметьте, что импортировать.</div>
          <div className="preview-list">
            {preview.agents.map((a, i) => (
              <label className="preview-item" key={i}>
                <input type="checkbox" checked={!!selected[i]} onChange={(e) => setSelected({ ...selected, [i]: e.target.checked })} />
                <div>
                  <h4>{a.name} <span className="mono" style={{ color: "var(--muted)", fontWeight: 400, fontSize: 11 }}>· {a.model}</span></h4>
                  <p>{a.description}</p>
                </div>
              </label>
            ))}
          </div>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={doImport} disabled={busy || !Object.values(selected).some(Boolean)}>
            {busy ? "Импортирую…" : `Импортировать выбранных (${Object.values(selected).filter(Boolean).length})`}
          </button>
        </>
      )}
    </div>
  );
}

function PasteForm({ onAdded }) {
  const [raw, setRaw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setErr(""); setBusy(true);
    try {
      // Парсим frontmatter на клиенте простым способом, отдаём поля на сервер.
      const parsed = parseFrontmatter(raw);
      if (!parsed.name || !parsed.description)
        throw new Error("В markdown нужны поля name и description в frontmatter (--- … ---).");
      const agent = await api.createAgent(parsed);
      onAdded([agent], `Агент «${agent.name}» добавлен.`);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {err && <div className="banner error">{err}</div>}
      <div className="banner info">Вставьте содержимое <span className="mono">.md</span>-файла агента (с frontmatter).</div>
      <div className="form-field">
        <textarea value={raw} onChange={(e) => setRaw(e.target.value)} style={{ minHeight: 220 }}
          placeholder={"---\nname: my-agent\ndescription: Use this agent to…\nmodel: sonnet\ntools: Read, Grep\n---\n\nТы — …"} />
      </div>
      <button className="btn-primary" onClick={submit} disabled={busy || !raw.trim()}>
        {busy ? "Добавляю…" : "Добавить агента"}
      </button>
    </div>
  );
}

function parseFrontmatter(raw) {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!m) return { prompt: raw };
  const data = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  return {
    name: data.name,
    description: data.description,
    model: data.model || "inherit",
    tools: data.tools ? data.tools.split(",").map((t) => t.trim()).filter(Boolean) : [],
    color: data.color,
    prompt: m[2].trim(),
  };
}
