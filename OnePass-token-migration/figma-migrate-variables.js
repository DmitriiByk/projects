/**
 * ============================================================================
 *  figma-migrate-variables.js
 *  Миграция переменных OnePass → схема именования ForgeX (in-place).
 * ============================================================================
 *
 *  ЗАЧЕМ:
 *    Tokens Studio (TS) матчит переменные по ИМЕНИ-ПУТИ. Старые имена в Figma
 *    (Pallette/Neutral/100, Text/Primary, neutral/600, Buttons/Primary …) НЕ
 *    совпадают с новыми ForgeX-путями (palette/neutral/100, text/…). Если просто
 *    импортировать TS — он создаст ДУБЛИ, а компоненты останутся на старых
 *    переменных. Решение: сначала ПЕРЕИМЕНОВАТЬ существующие переменные в новые
 *    ForgeX-пути (variable.id сохраняется → все привязки на компонентах живут),
 *    проставить алиасы семантики на примитивы, создать недостающий theme-слой —
 *    и только потом импортировать TS, который синхронит по совпадающим именам.
 *
 *  КАК ЗАПУСТИТЬ:
 *    0. ОБЯЗАТЕЛЬНО: сделай ветку или копию файла OnePass (Figma → правый клик по
 *       файлу → Duplicate / создай branch). Это необратимая правка переменных.
 *    1. Открой файл OnePass в Figma.
 *    2. Установи и открой плагин «Scripter» (автор Rasmus Andersson).
 *    3. Вставь весь этот код в редактор Scripter.
 *    4. Убедись, что DRY_RUN = true (по умолчанию). Нажми Run (▶).
 *    5. Прочитай лог: переименования / алиасы / создания / WARN. Ничего не записано.
 *    6. Если план верный — поставь DRY_RUN = false и нажми Run ещё раз. Применится.
 *
 *  ГАРАНТИИ:
 *    - НИКАКИХ удалений (.remove() не используется).
 *    - Значения цветов OnePass НЕ меняются (только перекладываются в алиасы той же величины).
 *    - Скрипт идемпотентен: повторный запуск не ломает (если имя уже новое — пропуск).
 *    - Шрифт Inter и типографика не трогаются этим скриптом.
 *    - Всё, чего нет в картах ниже, не затрагивается.
 *
 *  Источник истины: forgex-migration-spec.md + onepass.tokens-studio.json.
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
//  ⚙️  ПЕРЕКЛЮЧАТЕЛЬ. true = только лог (ничего не пишем). false = применить.
// ─────────────────────────────────────────────────────────────────────────────
const DRY_RUN = true;

// Вывод копим в буфер и печатаем ОДНИМ вызовом print в самом конце.
// Так Scripter гарантированно показывает весь лог одним блоком (построчный
// вывод из глубины async-функции он может не отрисовать).
const OUT = [];
const log = (...a) => OUT.push(a.map(String).join(" "));
const flush = () => (typeof print === "function" ? print : console.log)(OUT.join("\n"));


// ============================================================================
//  1. RENAME_MAP — { "СтароеИмяКакВFigma": "новый/forgex/путь" }
//     Имена слева — ровно как лежат в Figma. Имена справа — из спека/JSON.
//     Переименование сохраняет variable.id → привязки на компонентах не рвутся.
// ============================================================================
const RENAME_MAP = {
  // ── PALETTE / neutral (Pallette → palette, lowercase) ────────────────────
  "Pallette/Neutral/25":  "palette/neutral/25",
  "Pallette/Neutral/50":  "palette/neutral/50",
  "Pallette/Neutral/75":  "palette/neutral/75",
  "Pallette/Neutral/100": "palette/neutral/100",
  "Pallette/Neutral/150": "palette/neutral/150",
  "Pallette/Neutral/200": "palette/neutral/200",
  "Pallette/Neutral/300": "palette/neutral/300",
  "Pallette/Neutral/400": "palette/neutral/400",
  "Pallette/Neutral/500": "palette/neutral/500",
  "Pallette/Neutral/600": "palette/neutral/600",
  "Pallette/Neutral/700": "palette/neutral/700",
  "Pallette/Neutral/800": "palette/neutral/800",
  "Pallette/Neutral/850": "palette/neutral/850",
  "Pallette/Neutral/900": "palette/neutral/900",
  "Pallette/Neutral/950": "palette/neutral/950",

  // ── PALETTE / brand ──────────────────────────────────────────────────────
  "Pallette/Brand/25":  "palette/brand/25",
  "Pallette/Brand/50":  "palette/brand/50",
  "Pallette/Brand/100": "palette/brand/100",
  "Pallette/Brand/150": "palette/brand/150",
  "Pallette/Brand/200": "palette/brand/200",
  "Pallette/Brand/250": "palette/brand/250",
  "Pallette/Brand/300": "palette/brand/300",
  "Pallette/Brand/400": "palette/brand/400",
  "Pallette/Brand/500": "palette/brand/500",
  "Pallette/Brand/600": "palette/brand/600",
  "Pallette/Brand/700": "palette/brand/700",
  "Pallette/Brand/800": "palette/brand/800",
  "Pallette/Brand/850": "palette/brand/850",
  "Pallette/Brand/900": "palette/brand/900",
  "Pallette/Brand/950": "palette/brand/950",

  // ── PALETTE / accent ─────────────────────────────────────────────────────
  "Pallette/Accent/50":  "palette/accent/50",
  "Pallette/Accent/100": "palette/accent/100",
  "Pallette/Accent/200": "palette/accent/200",
  "Pallette/Accent/300": "palette/accent/300",
  "Pallette/Accent/400": "palette/accent/400",
  "Pallette/Accent/500": "palette/accent/500",
  "Pallette/Accent/600": "palette/accent/600",
  "Pallette/Accent/700": "palette/accent/700",
  "Pallette/Accent/750": "palette/accent/750",
  "Pallette/Accent/800": "palette/accent/800",
  "Pallette/Accent/850": "palette/accent/850",
  "Pallette/Accent/900": "palette/accent/900",
  "Pallette/Accent/950": "palette/accent/950",

  // ── PALETTE / positive (бывш. Green) ─────────────────────────────────────
  "Pallette/Green/200": "palette/positive/200",
  "Pallette/Green/300": "palette/positive/300",
  "Pallette/Green/500": "palette/positive/500",
  "Pallette/Green/600": "palette/positive/600",

  // ── PALETTE / negative (бывш. Red) ───────────────────────────────────────
  "Pallette/Red/100": "palette/negative/100",
  "Pallette/Red/200": "palette/negative/200",
  "Pallette/Red/300": "palette/negative/300",
  "Pallette/Red/500": "palette/negative/500",
  "Pallette/Red/600": "palette/negative/600",
  "Pallette/Red/700": "palette/negative/700",

  // ── PALETTE / warning (бывш. Yellow) ─────────────────────────────────────
  "Pallette/Yellow/400": "palette/warning/400",
  "Pallette/Yellow/500": "palette/warning/500",
  "Pallette/Yellow/600": "palette/warning/600",
  "Pallette/Yellow/900": "palette/warning/900",

  // ── PALETTE / additional (фиолетовый + OnePass-расширение, вкл. циан 550) ─
  "Pallette/Additional/100": "palette/additional/100",
  "Pallette/Additional/300": "palette/additional/300",
  "Pallette/Additional/400": "palette/additional/400",
  "Pallette/Additional/500": "palette/additional/500",
  "Pallette/Additional/550": "palette/additional/550",
  "Pallette/Additional/600": "palette/additional/600",
  "Pallette/Additional/625": "palette/additional/625",
  "Pallette/Additional/650": "palette/additional/650",

  // ── PALETTE / blackWhite (lowerCamelCase ключи) ──────────────────────────
  "Pallette/BlackWhite/White": "palette/blackWhite/white",
  "Pallette/BlackWhite/Black": "palette/blackWhite/black",

  // ── СЕМАНТИКА → theme/* (новые пути; значения станут алиасами ниже) ───────
  // base / inverse
  "Background/primary": "theme/base",

  // tint/* (фоны, бордеры, контент-плоскости)
  "Background/secondary":          "theme/tint/brand/50",
  "Background/fourth":             "theme/tint/brand/100",
  "Background/contrast secondary": "theme/tint/neutral/300",
  "Background/contrast fourth":    "theme/tint/neutral/200",
  "Background/contrast primary":   "theme/tint/neutral/500",
  "Background/popup background":   "theme/tint/neutral/900",
  "Input/fill selected":           "theme/tint/neutral/50",
  "Input/Disable":                 "theme/tint/neutral/75",
  "Functional/Info":               "theme/tint/accent/200",
  "Background/tertiary":           "theme/tint/additional/100",
  "Input/Fill":                    "theme/tint/neutral/inputFill",
  "Input/Fill focus":              "theme/tint/neutral/inputFillFocus",

  // main/* (заливки кнопок/действий, бордеры)
  "Buttons/tertiary-disable": "theme/main/neutral/l200",
  "Buttons/Text middle":      "theme/main/neutral/base",
  "Buttons/Text dark":        "theme/main/neutral/d200",
  "Buttons/Text bright":      "theme/main/neutral/contrast",
  "Input/Stroke":             "theme/main/neutral/l100",
  "Links/Primary":            "theme/main/accent/base",
  "Links/Primary-tap":        "theme/main/accent/l200",
  "Links/Alert":              "theme/links/alert",          // own group, чтобы не коллизить с Functional/Error
  "Functional/Done":          "theme/main/positive/base",
  "Functional/warning":       "theme/main/warning/base",
  "Functional/Error":         "theme/main/negative/base",   // тот же #FF0000, но отдельный токен
  "Functional/Alert":         "theme/main/negative/l200",
  "Input/stroke focus":       "theme/main/brand/l100",
  "Input/Stroke selected":    "theme/main/brand/base",

  // text/* (контент: текст и иконки)
  "Text/Primary":            "theme/text/neutral/100",
  "Text/Secondary":          "theme/text/neutral/300",
  "Text/Accent":             "theme/text/brand/base",
  "Text/Contrast primary":   "theme/text/neutral/contrast",
  "Text/Contrast secondary": "theme/text/neutral/contrastSecondary",
  "Other/icon25":            "theme/text/brand/iconBrand",
  "Other/icon50":            "theme/text/brand/iconBrandDark",
  "Other/icon100":           "theme/text/neutral/iconNeutral",
  "Other/icon400":           "theme/text/accent/icon",
  "Other/icon800":           "theme/text/contrast/icon",
  "Other/icon1000":          "theme/text/neutral/iconInverse",

  // ── ПАРТНЁРСКИЕ БРЕНДЫ → brandPartners/<brand>/<step> ────────────────────
  // В файле возможны два варианта старого имени (с префиксом "Brand Colors/" и без).
  // Обе формы перечислены — переименуется та, что реально найдётся (вторая даст WARN,
  // что нормально). 200-слоты пустые, но имена всё равно мигрируются.
  "BillyBets/50":                    "brandPartners/billyBets/50",
  "Brand Colors/BillyBets/50":       "brandPartners/billyBets/50",
  "BillyBets/100":                   "brandPartners/billyBets/100",
  "Brand Colors/BillyBets/100":      "brandPartners/billyBets/100",
  "Brand Colors/BillyBets/200":      "brandPartners/billyBets/200",

  "BoomerangCasino/50":              "brandPartners/boomerang/50",
  "Brand Colors/BoomerangCasino/50": "brandPartners/boomerang/50",
  "BoomerangCasino/100":             "brandPartners/boomerang/100",
  "Brand Colors/BoomerangCasino/100":"brandPartners/boomerang/100",
  "Brand Colors/BoomerangCasino/200":"brandPartners/boomerang/200",
  "Brand Colors/Boomerang/200":      "brandPartners/boomerang/200",

  "Pacho/50":                        "brandPartners/mrPacho/50",
  "Brand Colors/Mr.Pacho/50":        "brandPartners/mrPacho/50",
  "Pacho/100":                       "brandPartners/mrPacho/100",
  "Brand Colors/Mr.Pacho/100":       "brandPartners/mrPacho/100",
  "Brand Colors/Mr.Pacho/200":       "brandPartners/mrPacho/200"
};

// Короткие легаси-дубли НЕ переименовываем (остаются как deprecated-имена),
// но их value переуказываем алиасом на канонический palette/* — см. LEGACY_ALIAS ниже.


// ============================================================================
//  2. ALIAS_MAP — семантика (новое имя) → примитив (новое имя), на который алиасим.
//     После переименований ставим setValueForMode(modeId, alias(target)).
//     Источник: блок "Алиас →" в спеке / semantic-light в JSON.
// ============================================================================
const ALIAS_MAP = {
  // base / inverse
  "theme/base":    "palette/blackWhite/white",
  "theme/inverse": "palette/blackWhite/black",

  // tint/*
  "theme/tint/brand/50":             "palette/brand/25",
  "theme/tint/brand/100":            "palette/brand/100",
  "theme/tint/neutral/300":          "palette/neutral/300",
  "theme/tint/neutral/200":          "palette/neutral/200",
  "theme/tint/neutral/500":          "palette/neutral/500",
  "theme/tint/neutral/900":          "palette/neutral/900",
  "theme/tint/neutral/50":           "palette/neutral/50",
  "theme/tint/neutral/75":           "palette/neutral/75",
  "theme/tint/accent/200":           "palette/accent/200",
  "theme/tint/additional/100":       "palette/additional/100",
  "theme/tint/neutral/inputFill":      "palette/blackWhite/white",
  "theme/tint/neutral/inputFillFocus": "palette/blackWhite/white",

  // main/*
  "theme/main/neutral/l200":    "palette/neutral/100",
  "theme/main/neutral/l100":    "palette/neutral/300",
  "theme/main/neutral/base":    "palette/neutral/500",
  "theme/main/neutral/d200":    "palette/neutral/800",
  "theme/main/neutral/contrast":"palette/blackWhite/white",
  "theme/main/brand/l100":      "palette/brand/400",
  "theme/main/brand/base":      "palette/brand/500",
  "theme/main/accent/l200":     "palette/accent/300",
  "theme/main/accent/base":     "palette/accent/500",
  "theme/main/positive/base":   "palette/positive/600",
  "theme/main/warning/base":    "palette/warning/600",
  "theme/main/negative/l200":   "palette/negative/300",
  "theme/main/negative/base":   "palette/negative/500",
  "theme/links/alert":          "palette/negative/500",

  // text/*
  "theme/text/neutral/100":               "palette/brand/950",   // role=primary text, value=brand/950
  "theme/text/neutral/300":               "palette/neutral/600",
  "theme/text/brand/base":                "palette/brand/500",
  "theme/text/neutral/contrast":          "palette/blackWhite/white",
  "theme/text/neutral/contrastSecondary": "palette/neutral/100",
  "theme/text/brand/iconBrand":           "palette/brand/500",
  "theme/text/brand/iconBrandDark":       "palette/brand/850",
  "theme/text/neutral/iconNeutral":       "palette/neutral/200",
  "theme/text/accent/icon":               "palette/accent/500",
  "theme/text/contrast/icon":             "palette/blackWhite/white",
  "theme/text/neutral/iconInverse":       "palette/neutral/900"
};


// ============================================================================
//  3. CREATE_LIST — переменные нового theme-слоя, которых может НЕ быть среди
//     существующих (нет старого имени-источника). Создаём и алиасим на palette.
//     Если переменная с таким именем уже есть — пропускаем (идемпотентность).
//
//     По спеку из существующих токенов нет источника только для theme/inverse
//     (новый якорь, "нет; новый якорь"). Остальные theme/* приходят из RENAME_MAP.
//     Если в конкретном файле какие-то main/* (l100/d100/contrast) отсутствовали
//     как старые токены — добавь их сюда по аналогии { name, alias }.
// ============================================================================
const CREATE_LIST = [
  { name: "theme/inverse", alias: "palette/blackWhite/black" }
  // Пример добавления недостающего, если в файле нет источника:
  // { name: "theme/main/neutral/contrast", alias: "palette/blackWhite/white" },
];


// ============================================================================
//  4. LEGACY_ALIAS — короткие легаси-имена примитивов (НЕ переименовываем),
//     но их value переуказываем алиасом на канонический palette/*.
//     Ключ = имя как лежит в Figma; значение = целевой palette/* (новое имя).
//     Партнёрские короткие/raw-opacity не трогаем (raw остаются как есть).
// ============================================================================
const LEGACY_ALIAS = {
  // neutral короткие
  "neutral/25": "palette/neutral/25",   "neutral/50": "palette/neutral/50",
  "neutral/75": "palette/neutral/75",   "neutral/100": "palette/neutral/100",
  "neutral/150": "palette/neutral/150", "neutral/200": "palette/neutral/200",
  "neutral/300": "palette/neutral/300", "neutral/400": "palette/neutral/400",
  "neutral/500": "palette/neutral/500", "neutral/600": "palette/neutral/600",
  "neutral/700": "palette/neutral/700", "neutral/800": "palette/neutral/800",
  "neutral/850": "palette/neutral/850", "neutral/900": "palette/neutral/900",
  "neutral/950": "palette/neutral/950",
  // brand короткие
  "brand/25": "palette/brand/25",   "brand/50": "palette/brand/50",
  "brand/100": "palette/brand/100", "brand/150": "palette/brand/150",
  "brand/200": "palette/brand/200", "brand/250": "palette/brand/250",
  "brand/300": "palette/brand/300", "brand/400": "palette/brand/400",
  "brand/500": "palette/brand/500", "brand/600": "palette/brand/600",
  "brand/700": "palette/brand/700", "brand/800": "palette/brand/800",
  "brand/850": "palette/brand/850", "brand/900": "palette/brand/900",
  "brand/950": "palette/brand/950",
  // accent короткие
  "accent/50": "palette/accent/50",   "accent/100": "palette/accent/100",
  "accent/200": "palette/accent/200", "accent/300": "palette/accent/300",
  "accent/400": "palette/accent/400", "accent/500": "palette/accent/500",
  "accent/600": "palette/accent/600", "accent/700": "palette/accent/700",
  "accent/750": "palette/accent/750", "accent/800": "palette/accent/800",
  "accent/850": "palette/accent/850", "accent/900": "palette/accent/900",
  "accent/950": "palette/accent/950",
  // positive (бывш. Green) короткие
  "positive/200": "palette/positive/200", "positive/300": "palette/positive/300",
  "positive/500": "palette/positive/500", "positive/600": "palette/positive/600",
  // negative (бывш. Red) короткие
  "negative/100": "palette/negative/100", "negative/200": "palette/negative/200",
  "negative/300": "palette/negative/300", "negative/500": "palette/negative/500",
  "negative/600": "palette/negative/600", "negative/700": "palette/negative/700",
  // warning (бывш. Yellow) короткие
  "warning/400": "palette/warning/400", "warning/500": "palette/warning/500",
  "warning/600": "palette/warning/600", "warning/900": "palette/warning/900",
  // additional короткие
  "additional/100": "palette/additional/100", "additional/300": "palette/additional/300",
  "additional/400": "palette/additional/400", "additional/500": "palette/additional/500",
  "additional/550": "palette/additional/550", "additional/600": "palette/additional/600",
  "additional/625": "palette/additional/625", "additional/650": "palette/additional/650",
  // blackWhite (snake_case → алиас на канон)
  "black_white/white": "palette/blackWhite/white",
  // Opacity-база (без альфы) → алиас на примитив той же величины
  "Opacity/25-White10%":   "palette/neutral/25",
  "Opacity/75-White20%":   "palette/blackWhite/white",
  "Opacity/50-Positive10%":"palette/positive/600",
  "Opacity/100-Error40%":  "palette/negative/500",
  "Opacity/150-Error20%":  "palette/negative/500"
  // raw opacity/25,75,50,100,150 — НЕ трогаем (полупрозрачные, нужен alpha-токен, follow-up)
};


// ============================================================================
//  5. TEXT_STYLE_MAP — переименование TEXT STYLES (отдельный API от переменных).
//     Примитивы типографики (fontFamily/* fontWeight/* fontSize/* lineHeight/*)
//     УЖЕ соответствуют неймингу ForgeX — их НЕ трогаем.
//     Меняются только композитные стили: префикс typography/ + bodyRegular→body.
//     bodyMedium сохраняется как расширение OnePass. Значения (Plus Jakarta Sans,
//     размеры, веса, ls) НЕ меняются — только имя стиля.
// ============================================================================
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
  "bodyRegular/sm": "typography/body/sm",  // bodyRegular → body (как у ForgeX)
  "bodyStrong/xxs": "typography/bodyStrong/xxs", "bodyStrong/xs": "typography/bodyStrong/xs",
  "bodyStrong/sm": "typography/bodyStrong/sm",   "bodyStrong/md": "typography/bodyStrong/md",
  "bodyStrong/lg": "typography/bodyStrong/lg",   "bodyStrong/xl": "typography/bodyStrong/xl",
  // bodyMedium — расширение OnePass (у ForgeX нет такой группы), сохраняем
  "bodyMedium/xxs": "typography/bodyMedium/xxs", "bodyMedium/xs": "typography/bodyMedium/xs",
  "bodyMedium/sm": "typography/bodyMedium/sm",   "bodyMedium/md": "typography/bodyMedium/md",
  "bodyMedium/lg": "typography/bodyMedium/lg",   "bodyMedium/xl": "typography/bodyMedium/xl"
};


// ============================================================================
//  ХЕЛПЕРЫ
// ============================================================================

/** hex → {r,g,b,a} во float 0..1. Поддержка #RGB, #RRGGBB, #RRGGBBAA. */
function hexToRgba(hex) {
  let h = String(hex).trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map(c => c + c).join("");
  if (h.length === 6) h += "FF";
  if (h.length !== 8) throw new Error("Некорректный hex: " + hex);
  const num = parseInt(h, 16);
  return {
    r: ((num >> 24) & 255) / 255,
    g: ((num >> 16) & 255) / 255,
    b: ((num >> 8)  & 255) / 255,
    a: (num & 255) / 255
  };
}

/** Безопасный поиск переменной по точному имени (среди уже загруженных). */
function findVarByName(allVars, name) {
  return allVars.find(v => v.name === name) || null;
}

/**
 * Создание переменной с поддержкой обеих сигнатур API БЕЗ риска двойного создания.
 * Выбираем сигнатуру ДО вызова createVariable (а не «создать → при ошибке создать ещё раз»,
 * иначе при падении уже после фактического создания получили бы дубль).
 *  - новый API: createVariable(name, collectionObject, resolvedType)
 *  - старый API: createVariable(name, collectionId, resolvedType)
 * Эвристика версии: у новых билдов есть figma.variables.createVariableCollection и
 * createVariable принимает объект коллекции. Проверяем по наличию у коллекции метода/типа.
 */
function createVariableCompat(name, collection, resolvedType) {
  // Современная сигнатура принимает объект VariableCollection (есть поле .modes/.defaultModeId).
  const useObjectSignature =
    collection && typeof collection === "object" && "defaultModeId" in collection;
  const collArg = useObjectSignature ? collection : collection.id;
  return figma.variables.createVariable(name, collArg, resolvedType);
}


// ============================================================================
//  ОСНОВНОЙ СЦЕНАРИЙ
// ============================================================================
async function migrate() {
  const tag = DRY_RUN ? "🟡 DRY-RUN (ничего не записывается)" : "🟢 APPLY (запись включена)";
  log("════════════════════════════════════════════════════════");
  log("  OnePass → ForgeX миграция переменных   " + tag);
  log("════════════════════════════════════════════════════════");

  // 1) Загрузка коллекций и переменных (async API Figma).
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  let allVars = await figma.variables.getLocalVariablesAsync();

  if (!collections.length) {
    log("❌ В файле нет локальных коллекций переменных. Прерываю.");
    return;
  }

  // Карта variableId → активный modeId его коллекции (defaultModeId).
  const collById = {};
  collections.forEach(c => { collById[c.id] = c; });
  const modeForVar = (v) => {
    const c = collById[v.variableCollectionId];
    return c ? c.defaultModeId : null;
  };
  // Целевая коллекция для создаваемых theme-переменных: коллекция, где уже живёт
  // большинство theme/* (по первому найденному theme-токену), иначе — первая коллекция.
  let themeCollection = collections[0];

  const report = { renamed: 0, aliased: 0, created: 0, legacy: 0, styles: 0, skipped: 0, warns: [] };

  // Симуляция имён для DRY-RUN: в сухом прогоне реальные .name НЕ меняются,
  // поэтому держим виртуальный индекс «как будет после переименований/создания».
  // Благодаря этому план dry-run по алиасам/легаси корректен (без ложных WARN).
  const planned = new Map();   // varId -> запланированное новое имя
  const virtual = [];          // виртуальные «создаваемые» переменные (только план)
  const effName = (v) => planned.get(v.id) || v.name;
  const lookup  = (name) =>
    allVars.find(v => effName(v) === name) ||
    virtual.find(v => v.name === name) || null;

  // ── ШАГ 1. RENAME ────────────────────────────────────────────────────────
  log("\n── ШАГ 1. Переименование (in-place, id сохраняется) ──");
  for (const [oldName, newName] of Object.entries(RENAME_MAP)) {
    // Идемпотентность: если уже есть переменная с новым именем — пропускаем.
    const already = lookup(newName);
    const src = lookup(oldName);

    if (!src) {
      if (already) {
        log(`  ⏭  уже мигрировано: ${newName}`);
        report.skipped++;
      } else {
        log(`  ⚠️  WARN не найдено: "${oldName}" → ${newName}`);
        report.warns.push(oldName);
      }
      continue;
    }
    // Если new уже занят ДРУГОЙ переменной — не плодим коллизию, логируем.
    if (already && already.id !== src.id) {
      log(`  ⚠️  WARN целевое имя занято другой переменной: ${newName} (источник "${oldName}" оставлен)`);
      report.warns.push(oldName + " (target busy)");
      continue;
    }
    if (already && already.id === src.id) {
      report.skipped++;
      continue;
    }

    log(`  ✏️  "${oldName}"  →  "${newName}"  (id=${src.id})`);
    if (!DRY_RUN) src.name = newName;
    planned.set(src.id, newName);   // фиксируем и в dry-run, и в apply (для последующих lookup)
    report.renamed++;
    // Запомним коллекцию theme-слоя для создания недостающих.
    if (newName.startsWith("theme/")) themeCollection = collById[src.variableCollectionId] || themeCollection;
  }

  // Перечитываем переменные после переименований (в APPLY имена изменились).
  if (!DRY_RUN) allVars = await figma.variables.getLocalVariablesAsync();

  // ── ШАГ 2. CREATE недостающих theme-переменных ───────────────────────────
  log("\n── ШАГ 2. Создание недостающих переменных theme-слоя ──");
  for (const item of CREATE_LIST) {
    const exists = lookup(item.name);
    if (exists) {
      log(`  ⏭  уже существует: ${item.name}`);
      report.skipped++;
      continue;
    }
    log(`  ➕ создать: ${item.name}  (COLOR, коллекция "${themeCollection.name}")  → алиас ${item.alias}`);
    if (!DRY_RUN) {
      const created = createVariableCompat(item.name, themeCollection, "COLOR");
      allVars.push(created);
    } else {
      // План dry-run: добавляем виртуальную переменную, чтобы алиасы её «увидели».
      virtual.push({ id: "virtual:" + item.name, name: item.name, variableCollectionId: themeCollection.id });
    }
    report.created++;
  }

  // ── ШАГ 3. ALIAS семантики на примитивы ──────────────────────────────────
  log("\n── ШАГ 3. Простановка алиасов семантика → palette ──");
  for (const [semName, targetName] of Object.entries(ALIAS_MAP)) {
    const semVar = lookup(semName);
    const targetVar = lookup(targetName);

    if (!semVar) {
      // Может отсутствовать, если источник не нашёлся на ШАГЕ 1.
      log(`  ⚠️  WARN нет семантической переменной для алиаса: ${semName}`);
      report.warns.push("alias-missing:" + semName);
      continue;
    }
    if (!targetVar) {
      log(`  ⚠️  WARN нет целевого примитива: ${targetName} (для ${semName})`);
      report.warns.push("alias-target-missing:" + targetName);
      continue;
    }
    const modeId = modeForVar(semVar);
    if (!modeId) {
      log(`  ⚠️  WARN не определён mode для ${semName}`);
      report.warns.push("no-mode:" + semName);
      continue;
    }
    log(`  🔗 ${semName}  →  alias(${targetName})  [mode ${modeId}]`);
    if (!DRY_RUN) {
      const alias = figma.variables.createVariableAlias(targetVar);
      semVar.setValueForMode(modeId, alias);
    }
    report.aliased++;
  }

  // ── ШАГ 4. LEGACY: переуказать короткие легаси-имена на palette ───────────
  log("\n── ШАГ 4. Легаси-дубли → алиас на канонический palette/* (имена НЕ меняем) ──");
  for (const [legacyName, targetName] of Object.entries(LEGACY_ALIAS)) {
    const legacyVar = lookup(legacyName);
    const targetVar = lookup(targetName);
    if (!legacyVar) {
      log(`  ⚠️  WARN легаси не найдено: ${legacyName}`);
      report.warns.push("legacy-missing:" + legacyName);
      continue;
    }
    if (!targetVar) {
      log(`  ⚠️  WARN целевой примитив не найден: ${targetName} (для ${legacyName})`);
      report.warns.push("legacy-target-missing:" + targetName);
      continue;
    }
    const modeId = modeForVar(legacyVar);
    if (!modeId) {
      log(`  ⚠️  WARN не определён mode для (legacy) ${legacyName}`);
      report.warns.push("legacy-no-mode:" + legacyName);
      continue;
    }
    log(`  🔗 (legacy) ${legacyName}  →  alias(${targetName})`);
    if (!DRY_RUN) {
      const alias = figma.variables.createVariableAlias(targetVar);
      legacyVar.setValueForMode(modeId, alias);
    }
    report.legacy++;
  }

  // ── ШАГ 5. TEXT STYLES: переименование композитных стилей типографики ─────
  //   Это ДРУГОЙ API, не переменные: figma.getLocalTextStylesAsync() + style.name=.
  //   Значения стиля не трогаем — только имя. Идемпотентно, без удалений.
  log("\n── ШАГ 5. Переименование текст-стилей (typography/*) ──");
  let textStyles = await figma.getLocalTextStylesAsync();
  const styleByName = {};
  textStyles.forEach(s => { styleByName[s.name] = s; });
  for (const [oldName, newName] of Object.entries(TEXT_STYLE_MAP)) {
    const src = styleByName[oldName];
    const exists = styleByName[newName];
    if (!src) {
      if (exists) { log(`  ⏭  стиль уже мигрирован: ${newName}`); report.skipped++; }
      else { log(`  ⚠️  WARN текст-стиль не найден: "${oldName}"`); report.warns.push("style-missing:" + oldName); }
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

  // ── ОТЧЁТ ────────────────────────────────────────────────────────────────
  log("\n════════════════════════ ОТЧЁТ ════════════════════════");
  log(`  Режим:              ${DRY_RUN ? "DRY-RUN (не записано)" : "APPLY (записано)"}`);
  log(`  Переименовано:      ${report.renamed}`);
  log(`  Алиасов семантики:  ${report.aliased}`);
  log(`  Легаси-алиасов:     ${report.legacy}`);
  log(`  Текст-стилей:       ${report.styles}`);
  log(`  Создано переменных: ${report.created}`);
  log(`  Пропущено (idemp.): ${report.skipped}`);
  log(`  WARN (не найдено):  ${report.warns.length}`);
  if (report.warns.length) {
    log("  ── список WARN ──");
    report.warns.forEach(w => log("     • " + w));
  }
  log("════════════════════════════════════════════════════════");
  if (DRY_RUN) {
    log("  ✅ Сухой прогон завершён. Проверь план выше.");
    log("     Часть WARN — норма (дубли партнёрских имён 'Brand Colors/…'");
    log("     или отсутствующие в этом файле токены).");
    log("     Когда план верный → поставь DRY_RUN = false и запусти снова.");
  } else {
    log("  ✅ Применено. Дальше: импорт onepass.tokens-studio.json в Tokens Studio");
    log("     с синхронизацией по имени (см. tokens-studio-import-guide.md).");
  }
}

// Запуск. ВАЖНО: используем top-level await, иначе Scripter завершит прогон
// раньше, чем отработает асинхронная часть, и лога не будет видно.
try {
  await migrate();
} catch (err) {
  log("❌ Ошибка миграции: " + (err && err.message ? err.message : err));
  log(err && err.stack ? err.stack : "");
} finally {
  flush();   // печатаем весь накопленный лог ОДНИМ блоком
}
