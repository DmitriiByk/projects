import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { useI18n } from "../i18n.jsx";

// Простой построчный дифф (LCS) без зависимостей.
function lineDiff(a, b) {
  const A = a.split("\n"), B = b.split("\n");
  const n = A.length, m = B.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out = []; let i = 0, j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) { out.push({ t: "=", v: A[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ t: "-", v: A[i] }); i++; }
    else { out.push({ t: "+", v: B[j] }); j++; }
  }
  while (i < n) out.push({ t: "-", v: A[i++] });
  while (j < m) out.push({ t: "+", v: B[j++] });
  return out;
}

export default function SkillEditorModal({ skill, onClose, onSaved }) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [writable, setWritable] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [chatError, setChatError] = useState("");
  const [proposal, setProposal] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true); setError("");
      try {
        const res = await api.skillContent(skill.id);
        setContent(res.content);
        setWritable(res.writable);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [skill.id]);

  const diff = useMemo(() => (proposal ? lineDiff(content, proposal) : null), [proposal, content]);

  async function ask() {
    if (!chatInput.trim()) return;
    setBusy(true); setChatError(""); setProposal(null);
    try {
      const res = await api.assistSkill(skill.id, content, chatInput.trim());
      setProposal(res.revised);
    } catch (e) { setChatError(e.message); }
    finally { setBusy(false); }
  }

  function applyProposal() { setContent(proposal); setProposal(null); setChatInput(""); }

  async function save() {
    setSaving(true); setError("");
    try {
      await api.saveSkill(skill.id, content);
      onSaved(`Скилл «${skill.name}» сохранён. Перезапусти Claude, чтобы применить.`);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>✎ {skill.name}</h2>
          <button className="close-x" onClick={onClose}>✕</button>
        </div>

        <div className="editor-body">
          <div className="editor-pane">
            {loading ? (
              <div className="empty"><span className="spinner" /> {t("loading")}</div>
            ) : (
              <>
                {!writable && <div className="banner warn">Файл только для чтения — сохранить не получится.</div>}
                {error && <div className="banner error">{error}</div>}
                {diff ? (
                  <div className="diff-view">
                    {diff.map((l, i) => (
                      <div key={i} className={"diff-line " + (l.t === "+" ? "add" : l.t === "-" ? "del" : "")}>
                        <span className="diff-gutter">{l.t === "=" ? " " : l.t}</span>{l.v || " "}
                      </div>
                    ))}
                  </div>
                ) : (
                  <textarea className="editor-text" value={content} onChange={(e) => setContent(e.target.value)} spellCheck={false} />
                )}
              </>
            )}
          </div>

          <div className="assist-pane">
            <div className="assist-title">AI-ассистент</div>
            <div className="assist-hint">Опиши правку: «сократи», «добавь раздел про edge cases», «сделай триггеры чётче».</div>
            {chatError && <div className="banner error">{chatError}</div>}

            {proposal ? (
              <div className="assist-proposal">
                <div className="banner info">Предложен вариант — слева показан дифф.</div>
                <div className="row" style={{ gap: 8 }}>
                  <button className="btn-primary" onClick={applyProposal}>Применить</button>
                  <button className="btn-ghost" onClick={() => setProposal(null)}>Отклонить</button>
                </div>
              </div>
            ) : (
              <>
                <textarea className="assist-input" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Что улучшить в формулировках?" disabled={busy}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) ask(); }} />
                <button className="btn-primary" onClick={ask} disabled={busy || !chatInput.trim()}>
                  {busy ? <><span className="spinner" /> Думаю…</> : "✦ Предложить правку"}
                </button>
                <div className="assist-hint" style={{ marginTop: 8 }}>⌘+Enter — отправить</div>
              </>
            )}
          </div>
        </div>

        <div className="editor-foot">
          <span className="src-path mono" style={{ marginRight: "auto", marginLeft: 0 }}>{skill.source}</span>
          <button className="btn-ghost" onClick={onClose}>Отмена</button>
          <button className="btn-primary" onClick={save} disabled={saving || loading || !writable || !!proposal}>
            {saving ? "Сохраняю…" : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}
