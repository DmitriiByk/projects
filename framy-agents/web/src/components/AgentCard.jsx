import React, { useState } from "react";
import { useI18n } from "../i18n.jsx";

const SCOPE_KEY = { user: "scopeUser", project: "scopeProject", custom: "scopeCustom" };
const COLORS = ["#d97757", "#6ea8fe", "#4ade80", "#c084fc", "#f59e0b", "#f472b6"];

function barColor(agent) {
  if (agent.color && agent.color.startsWith("#")) return agent.color;
  let h = 0;
  for (const ch of agent.name) h = (h * 31 + ch.charCodeAt(0)) % COLORS.length;
  return COLORS[h];
}

export default function AgentCard({ agent, models, onModelChange, onRun, onDelete }) {
  const { t, d } = useI18n();
  const [model, setModel] = useState(agent.model || "inherit");
  const [saving, setSaving] = useState(false);

  async function changeModel(next) {
    setModel(next);
    setSaving(true);
    try {
      await onModelChange(agent.id, next);
    } catch (e) {
      alert("Не удалось сменить модель: " + e.message);
      setModel(agent.model);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card" style={{ "--bar": barColor(agent) }}>
      <div className="card-head">
        <h3>{agent.name}</h3>
        <span className="scope-tag">{t(SCOPE_KEY[agent.scope] || "scopeCustom")}</span>
      </div>

      <p className="desc">{d(agent.description, agent.descriptionRu) || t("noDesc")}</p>

      {agent.tools?.length > 0 && (
        <div className="tools">
          {agent.tools.slice(0, 5).map((tool) => (
            <span className="tool-chip" key={tool}>{tool}</span>
          ))}
          {agent.tools.length > 5 && <span className="tool-chip">+{agent.tools.length - 5}</span>}
        </div>
      )}

      <div>
        <label className="field-label">{t("model")} {saving && <span className="spinner" />}</label>
        <select value={model} onChange={(e) => changeModel(e.target.value)} disabled={saving}>
          {models.map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
      </div>

      <div className="card-actions">
        <button className="btn-primary" onClick={() => onRun(agent)}>{t("giveTask")}</button>
        <button className="btn-danger" title={t("delete")} onClick={() => onDelete(agent)}>{t("delete")}</button>
      </div>
    </div>
  );
}
