/**
 * ============================================================================
 *  figma-migrate-local.js
 *  ТОЧЕЧНАЯ миграция ЛОКАЛЬНЫХ токенов OnePass под схему ForgeX.
 * ============================================================================
 *
 *  КОНТЕКСТ:
 *    Локальные коллекции этого файла (palette / font / space / radius) уже почти
 *    в форме ForgeX (короткие имена neutral/600, brand/500; fontSize/*, radius xs..max).
 *    «Грязные» имена (Pallette/*, Text/*, Buttons/*) и семантический слой приходят
 *    из ПОДКЛЮЧЁННОЙ БИБЛИОТЕКИ — их в этом файле нет, мигрировать их надо в самом
 *    файле-библиотеке (вне этого прохода).
 *
 *  ЧТО ДЕЛАЕТ (только локальное, ID переменных сохраняются → привязки живут):
 *    1) black_white/* → blackWhite/* (camelCase как у ForgeX)
 *    2) партнёрские бренды → brandPartners/* (изоляция от ядра палитры)
 *    3) текст-стили → typography/* (bodyRegular→body; bodyMedium как расширение OnePass)
 *
 *  ГАРАНТИИ: без удалений; значения не меняются; только имена; идемпотентно.
 *
 *  ЗАПУСК: Scripter → вставь код → DRY_RUN=true → Run → проверь лог →
 *          DRY_RUN=false → Run.
 * ============================================================================
 */
const DRY_RUN = true;

// Вывод копим в буфер и печатаем одним блоком в конце (надёжно для Scripter).
const OUT = [];
const log = (...a) => OUT.push(a.map(String).join(" "));
const flush = () => (typeof print === "function" ? print : console.log)(OUT.join("\n"));

// ── Переименования ПЕРЕМЕННЫХ (имена ровно как в коллекции palette) ──────────
const VAR_RENAME = {
  // snake_case → camelCase (ForgeX: blackWhite)
  "black_white/black": "blackWhite/black",
  "black_white/white": "blackWhite/white",
  // партнёрские бренды → отдельный namespace brandPartners/
  "BillyBets/50":        "brandPartners/billyBets/50",
  "BillyBets/100":       "brandPartners/billyBets/100",
  "BoomerangCasino/50":  "brandPartners/boomerang/50",
  "BoomerangCasino/100": "brandPartners/boomerang/100",
  "Pacho/50":            "brandPartners/mrPacho/50",
  "Pacho/100":           "brandPartners/mrPacho/100"
};

// ── Переименования ТЕКСТ-СТИЛЕЙ → typography/* ───────────────────────────────
const TEXT_STYLE_MAP = {
  "display/xs": "typography/display/xs",   "display/sm": "typography/display/sm",
  "display/md": "typography/display/md",   "display/lg": "typography/display/lg",
  "display/xl": "typography/display/xl",
  "headline/xs": "typography/headline/xs", "headline/sm": "typography/headline/sm",
  "headline/md": "typography/headline/md", "headline/lg": "typography/headline/lg",
  "headline/xl": "typography/headline/xl",
  "title/xs": "typography/title/xs",       "title/sm": "typography/title/sm",
  "title/md": "typography/title/md",       "title/lg": "typography/title/lg",
  "title/xl": "typography/title/xl",
  "button/xs": "typography/button/xs",     "button/sm": "typography/button/sm",
  "button/md": "typography/button/md",     "button/lg": "typography/button/lg",
  "button/xl": "typography/button/xl",
  "bodyRegular/sm": "typography/body/sm",
  "bodyStrong/xxs": "typography/bodyStrong/xxs", "bodyStrong/xs": "typography/bodyStrong/xs",
  "bodyStrong/sm": "typography/bodyStrong/sm",   "bodyStrong/md": "typography/bodyStrong/md",
  "bodyStrong/lg": "typography/bodyStrong/lg",   "bodyStrong/xl": "typography/bodyStrong/xl",
  "bodyMedium/xxs": "typography/bodyMedium/xxs", "bodyMedium/xs": "typography/bodyMedium/xs",
  "bodyMedium/sm": "typography/bodyMedium/sm",   "bodyMedium/md": "typography/bodyMedium/md",
  "bodyMedium/lg": "typography/bodyMedium/lg",   "bodyMedium/xl": "typography/bodyMedium/xl"
};

async function migrate() {
  const tag = DRY_RUN ? "🟡 DRY-RUN (ничего не записывается)" : "🟢 APPLY (запись включена)";
  log("════════════════════════════════════════════════════════");
  log("  OnePass → ForgeX: локальная миграция   " + tag);
  log("════════════════════════════════════════════════════════");

  const report = { vars: 0, styles: 0, skipped: 0, warns: [] };

  // ── Переменные ────────────────────────────────────────────────────────────
  const vars = await figma.variables.getLocalVariablesAsync();
  const byName = {};
  vars.forEach(v => { byName[v.name] = v; });

  log("\n── Переменные ──");
  for (const [oldName, newName] of Object.entries(VAR_RENAME)) {
    const src = byName[oldName];
    const exists = byName[newName];
    if (!src) {
      if (exists) { log(`  ⏭  уже мигрировано: ${newName}`); report.skipped++; }
      else { log(`  ⚠️  WARN не найдено: "${oldName}"`); report.warns.push("var:" + oldName); }
      continue;
    }
    if (exists && exists.id !== src.id) {
      log(`  ⚠️  WARN имя занято другой переменной: ${newName} (источник "${oldName}" оставлен)`);
      report.warns.push("var-busy:" + oldName);
      continue;
    }
    log(`  ✏️  "${oldName}"  →  "${newName}"  (id=${src.id})`);
    if (!DRY_RUN) src.name = newName;
    report.vars++;
  }

  // ── Текст-стили ───────────────────────────────────────────────────────────
  const styles = await figma.getLocalTextStylesAsync();
  const styleByName = {};
  styles.forEach(s => { styleByName[s.name] = s; });

  log("\n── Текст-стили ──");
  for (const [oldName, newName] of Object.entries(TEXT_STYLE_MAP)) {
    const src = styleByName[oldName];
    const exists = styleByName[newName];
    if (!src) {
      if (exists) { log(`  ⏭  уже мигрирован: ${newName}`); report.skipped++; }
      else { log(`  ⚠️  WARN стиль не найден: "${oldName}"`); report.warns.push("style:" + oldName); }
      continue;
    }
    if (exists && exists.id !== src.id) {
      log(`  ⚠️  WARN имя стиля занято: ${newName} (источник "${oldName}" оставлен)`);
      report.warns.push("style-busy:" + oldName);
      continue;
    }
    log(`  ✏️  стиль "${oldName}"  →  "${newName}"`);
    if (!DRY_RUN) src.name = newName;
    report.styles++;
  }

  // ── Отчёт ─────────────────────────────────────────────────────────────────
  log("\n════════════════════════ ОТЧЁТ ════════════════════════");
  log(`  Режим:           ${DRY_RUN ? "DRY-RUN (не записано)" : "APPLY (записано)"}`);
  log(`  Переменных:      ${report.vars}`);
  log(`  Текст-стилей:    ${report.styles}`);
  log(`  Пропущено:       ${report.skipped}`);
  log(`  WARN:            ${report.warns.length}`);
  if (report.warns.length) {
    log("  ── список WARN ──");
    report.warns.forEach(w => log("     • " + w));
  }
  log("════════════════════════════════════════════════════════");
  log(DRY_RUN
    ? "  ✅ Сухой прогон завершён. Если план верный → DRY_RUN = false и запусти снова."
    : "  ✅ Применено.");
}

try {
  await migrate();
} catch (err) {
  log("❌ Ошибка: " + (err && err.message ? err.message : err));
  log(err && err.stack ? err.stack : "");
} finally {
  flush();
}
