import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { useI18n } from "../i18n.jsx";
import SkillEditorModal from "./SkillEditorModal.jsx";
import ImageGenModal from "./ImageGenModal.jsx";

const SCOPE_KEY = { user: "scopeUser", project: "scopeProject", workflow: "scopeWorkflow", custom: "scopeCustom" };
const COLORS = ["#2f6bff", "#4ade80", "#c084fc", "#f59e0b", "#f472b6", "#22d3ee"];
function barColor(name) {
  let h = 0; for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % COLORS.length; return COLORS[h];
}

export default function SkillsView() {
  const { t, d, lang, translate } = useI18n();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [cover, setCover] = useState(null);
  const [toast, setToast] = useState("");

  async function refresh() {
    setLoading(true);
    try { const res = await api.listSkills(); setSkills(Array.isArray(res?.skills) ? res.skills : []); setError(""); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);

  // Когда выбран русский — подтянуть переводы описаний скиллов.
  useEffect(() => {
    if (lang === "ru" && skills.length) translate(skills.map((s) => s.description)).catch(() => {});
  }, [lang, skills]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return skills;
    return skills.filter((s) => s.name.toLowerCase().includes(q) || (s.description || "").toLowerCase().includes(q));
  }, [skills, query]);

  function flash(m) { setToast(m); setTimeout(() => setToast(""), 5000); }

  return (
    <div>
      {error && <div className="banner error" style={{ marginTop: 18 }}>{error}</div>}
      {toast && <div className="banner info" style={{ marginTop: 18 }}>{toast}</div>}

      <div className="searchbar">
        <input placeholder={t("searchSkills")} value={query} onChange={(e) => setQuery(e.target.value)} />
        <span className="status-pill">{filtered.length} {t("skillsCount")}</span>
      </div>

      {loading ? (
        <div className="empty"><span className="spinner" /> {t("loading")}</div>
      ) : filtered.length === 0 ? (
        <div className="empty">{skills.length === 0 ? t("skillsEmpty") : `${t("notFound")} «${query}».`}</div>
      ) : (
        <div className="grid">
          {filtered.map((s) => (
            <div className="card" key={s.id} style={{ "--bar": barColor(s.name) }}>
              <div className="card-head">
                <h3>{s.name}</h3>
                <div className="row" style={{ gap: 8 }}>
                  <span className="scope-tag">{t(SCOPE_KEY[s.source] || "scopeCustom")}</span>
                  <button className="icon-edit" title="Сгенерировать обложку" onClick={() => setCover(s)}>🖼</button>
                  <button className="icon-edit" title="Редактировать" onClick={() => setEditing(s)}>✎</button>
                </div>
              </div>
              <p className="desc" style={{ WebkitLineClamp: 4 }}>
                {d(s.description, s.descriptionRu) || t("noDesc")}
              </p>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <SkillEditorModal
          skill={editing}
          onClose={() => setEditing(null)}
          onSaved={(msg) => { setEditing(null); flash(msg); refresh(); }}
        />
      )}

      {cover && (
        <ImageGenModal
          title={cover.name}
          initialPrompt={`App cover / icon art for a developer tool called "${cover.name}". ${cover.description || ""} Clean, modern, flat style, on-brand for a dev dashboard. No text.`}
          onClose={() => setCover(null)}
        />
      )}
    </div>
  );
}
