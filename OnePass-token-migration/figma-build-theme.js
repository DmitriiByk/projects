/**
 * ============================================================================
 *  figma-build-theme.js
 *  СОЗДАЁТ семантический слой ForgeX (коллекция `theme`) в файле OnePass.
 * ============================================================================
 *
 *  Каждый theme-токен — АЛИАС на локальную переменную из коллекции `palette`
 *  (neutral/500, brand/500, blackWhite/white …). Значения не дублируются:
 *  меняешь палитру — семантика и компоненты обновляются автоматически.
 *
 *  Структура (по нашей спеке onepass.tokens-studio.json):
 *    base, inverse · tint/* · main/* · text/* · links/alert
 *
 *  ГАРАНТИИ: без удалений; идемпотентно (повторный запуск не плодит дубли);
 *            DRY_RUN=true по умолчанию (только лог).
 *
 *  ЗАПУСК: Scripter → вставь код → DRY_RUN=true → Run → проверь лог →
 *          DRY_RUN=false → Run.
 * ============================================================================
 */
const DRY_RUN = true;

const OUT = [];
const log = (...a) => OUT.push(a.map(String).join(" "));
const flush = () => (typeof print === "function" ? print : console.log)(OUT.join("\n"));

// [ имя theme-токена , имя локальной palette-переменной, на которую алиасим ]
const THEME = [
  ["base",    "blackWhite/white"],
  ["inverse", "blackWhite/black"],

  // tint/*
  ["tint/brand/50",   "brand/25"],
  ["tint/brand/100",  "brand/100"],
  ["tint/neutral/50",  "neutral/50"],
  ["tint/neutral/75",  "neutral/75"],
  ["tint/neutral/200", "neutral/200"],
  ["tint/neutral/300", "neutral/300"],
  ["tint/neutral/500", "neutral/500"],
  ["tint/neutral/900", "neutral/900"],
  ["tint/accent/200",      "accent/200"],
  ["tint/additional/100",  "additional/100"],
  ["tint/neutral/inputFill",      "blackWhite/white"],
  ["tint/neutral/inputFillFocus", "blackWhite/white"],

  // main/*
  ["main/neutral/l200",    "neutral/100"],
  ["main/neutral/l100",    "neutral/300"],
  ["main/neutral/base",    "neutral/500"],
  ["main/neutral/d200",    "neutral/800"],
  ["main/neutral/contrast","blackWhite/white"],
  ["main/brand/l100",      "brand/400"],
  ["main/brand/base",      "brand/500"],
  ["main/accent/l200",     "accent/300"],
  ["main/accent/base",     "accent/500"],
  ["main/positive/base",   "positive/600"],
  ["main/warning/base",    "warning/600"],
  ["main/negative/l200",   "negative/300"],
  ["main/negative/base",   "negative/500"],
  ["links/alert",          "negative/500"],

  // text/*
  ["text/neutral/100",               "brand/950"],
  ["text/neutral/300",               "neutral/600"],
  ["text/brand/base",                "brand/500"],
  ["text/neutral/contrast",          "blackWhite/white"],
  ["text/neutral/contrastSecondary", "neutral/100"],
  ["text/brand/iconBrand",           "brand/500"],
  ["text/brand/iconBrandDark",       "brand/850"],
  ["text/neutral/iconNeutral",       "neutral/200"],
  ["text/accent/icon",               "accent/500"],
  ["text/contrast/icon",             "blackWhite/white"],
  ["text/neutral/iconInverse",       "neutral/900"]
];

// createVariable с поддержкой обеих сигнатур API (объект коллекции / collectionId).
function createVariableCompat(name, collection, resolvedType) {
  const useObj = collection && typeof collection === "object" && "defaultModeId" in collection;
  return figma.variables.createVariable(name, useObj ? collection : collection.id, resolvedType);
}

async function build() {
  const tag = DRY_RUN ? "🟡 DRY-RUN (ничего не записывается)" : "🟢 APPLY (запись включена)";
  log("════════════════════════════════════════════════════════");
  log("  OnePass: создание семантического слоя theme   " + tag);
  log("════════════════════════════════════════════════════════");

  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const vars = await figma.variables.getLocalVariablesAsync();
  const palByName = {};
  vars.forEach(v => { palByName[v.name] = v; });

  const report = { created: 0, skipped: 0, warns: [] };

  // 1) Коллекция theme — найти или создать.
  let theme = cols.find(c => c.name === "theme");
  if (theme) {
    log(`\nКоллекция "theme" уже есть — добавляю недостающие токены.`);
  } else if (!DRY_RUN) {
    theme = figma.variables.createVariableCollection("theme");
    log(`\n➕ создана коллекция "theme" (mode: ${theme.modes[0].name})`);
  } else {
    log(`\n➕ будет создана коллекция "theme" (сейчас её нет).`);
  }
  const modeId = theme ? theme.defaultModeId : null;

  // Существующие имена переменных в theme (для идемпотентности).
  const themeVarNames = new Set(
    theme ? vars.filter(v => v.variableCollectionId === theme.id).map(v => v.name) : []
  );

  // 2) Токены.
  log("\n── Токены theme → alias(palette) ──");
  for (const [name, target] of THEME) {
    const tgt = palByName[target];
    if (!tgt) {
      log(`  ⚠️  WARN нет palette-переменной "${target}" (для theme/${name})`);
      report.warns.push("target-missing:" + target);
      continue;
    }
    if (themeVarNames.has(name)) {
      log(`  ⏭  уже есть: ${name}`);
      report.skipped++;
      continue;
    }
    log(`  ➕ ${name}  →  alias(${target})`);
    if (!DRY_RUN) {
      const v = createVariableCompat(name, theme, "COLOR");
      v.setValueForMode(modeId, figma.variables.createVariableAlias(tgt));
    }
    report.created++;
  }

  // 3) Отчёт.
  log("\n════════════════════════ ОТЧЁТ ════════════════════════");
  log(`  Режим:        ${DRY_RUN ? "DRY-RUN (не записано)" : "APPLY (записано)"}`);
  log(`  Создано:      ${report.created}`);
  log(`  Пропущено:    ${report.skipped}`);
  log(`  WARN:         ${report.warns.length}`);
  report.warns.forEach(w => log("     • " + w));
  log("════════════════════════════════════════════════════════");
  log(DRY_RUN
    ? "  ✅ Сухой прогон. Если план верный → DRY_RUN = false и запусти снова."
    : "  ✅ Семантический слой theme создан.");
}

try {
  await build();
} catch (err) {
  log("❌ Ошибка: " + (err && err.message ? err.message : err));
  log(err && err.stack ? err.stack : "");
} finally {
  flush();
}
