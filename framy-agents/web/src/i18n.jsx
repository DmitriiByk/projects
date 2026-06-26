import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "./api.js";

const STRINGS = {
  ru: {
    subtitle: "Панель управления сабагентами Claude Code",
    agents: "Агенты", skills: "Скиллы", connectors: "Коннекторы", images: "Картинки",
    refresh: "↻ Обновить", addAgent: "＋ Добавить агента",
    searchAgents: "Поиск по имени или описанию…",
    agentsCount: "агент(ов)", skillsCount: "скилл(ов)",
    model: "Модель", giveTask: "▶ Дать задачу", delete: "Удалить",
    noDesc: "Без описания",
    cliOk: "доступен", cliBad: "не найден",
    dirs: "Каталоги",
    emptyAgentsTitle: "Агентов пока нет.",
    emptyAgentsHint: "Создайте первого вручную, импортируйте из GitHub или вставьте markdown.",
    notFound: "Ничего не найдено по запросу",
    loading: "Загрузка…",
    translate: "Перевести описания", translating: "Перевожу…",
    translatedToast: "Описания переведены.",
    descEnNote: "Описания на английском.",
    skillsEmpty: "Скиллов не найдено. Проверь каталоги ~/.claude/skills и переменную FRAMY_SKILL_MD_DIRS.",
    open: "Открыть файл",
    scopeUser: "Глобальный", scopeProject: "Проект", scopeWorkflow: "Воркфлоу", scopeCustom: "Свой",
    searchSkills: "Поиск по скиллам…",
  },
  en: {
    subtitle: "Claude Code subagents control panel",
    agents: "Agents", skills: "Skills", connectors: "Connectors", images: "Images",
    refresh: "↻ Refresh", addAgent: "＋ Add agent",
    searchAgents: "Search by name or description…",
    agentsCount: "agent(s)", skillsCount: "skill(s)",
    model: "Model", giveTask: "▶ Give task", delete: "Delete",
    noDesc: "No description",
    cliOk: "available", cliBad: "not found",
    dirs: "Directories",
    emptyAgentsTitle: "No agents yet.",
    emptyAgentsHint: "Create one manually, import from GitHub, or paste markdown.",
    notFound: "Nothing found for",
    loading: "Loading…",
    translate: "Translate descriptions", translating: "Translating…",
    translatedToast: "Descriptions translated.",
    descEnNote: "Descriptions are in English.",
    skillsEmpty: "No skills found. Check ~/.claude/skills and the FRAMY_SKILL_MD_DIRS variable.",
    open: "Open file",
    scopeUser: "Global", scopeProject: "Project", scopeWorkflow: "Workflow", scopeCustom: "Custom",
    searchSkills: "Search skills…",
  },
};

const Ctx = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("framy-lang") || "ru");
  const [descMap, setDescMap] = useState({});
  const [translating, setTranslating] = useState(false);

  useEffect(() => { localStorage.setItem("framy-lang", lang); }, [lang]);

  const t = useCallback((k) => (STRINGS[lang] && STRINGS[lang][k]) || STRINGS.en[k] || k, [lang]);

  // Описание с учётом языка: ru → перевод (если есть) или оригинал.
  const d = useCallback((text, ru) => {
    if (lang !== "ru") return text || "";
    return ru || descMap[text] || text || "";
  }, [lang, descMap]);

  // Запросить перевод набора английских описаний.
  const translate = useCallback(async (texts) => {
    const uniq = [...new Set(texts.filter(Boolean))];
    const missing = uniq.filter((x) => !descMap[x]);
    if (!missing.length) return { translated: 0 };
    setTranslating(true);
    try {
      const res = await api.translate(missing.map((text, i) => ({ id: String(i), text })));
      const add = {};
      missing.forEach((text, i) => { const ru = res.translations[String(i)]; if (ru) add[text] = ru; });
      setDescMap((m) => ({ ...m, ...add }));
      return { translated: Object.keys(add).length };
    } finally {
      setTranslating(false);
    }
  }, [descMap]);

  const hasTranslations = Object.keys(descMap).length > 0;

  return (
    <Ctx.Provider value={{ lang, setLang, t, d, translate, translating, hasTranslations }}>
      {children}
    </Ctx.Provider>
  );
}

// Безопасный фолбэк — если по какой-то причине провайдер не обёрнут (кэш, HMR),
// хук не уронит рендер, а вернёт рабочий минимум (английские строки).
const FALLBACK = {
  lang: "en",
  setLang: () => {},
  t: (k) => (STRINGS.en[k] || k),
  d: (text) => text || "",
  translate: async () => ({ translated: 0 }),
  translating: false,
  hasTranslations: false,
};

export const useI18n = () => useContext(Ctx) || FALLBACK;
