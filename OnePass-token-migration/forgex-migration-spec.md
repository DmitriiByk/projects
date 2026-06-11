# Спек миграции токенов OnePass → схема именования ForgeX

> Принцип: **значения цветов OnePass НЕ меняются**. Меняются только имена, регистр и архитектура наследования (семантика → алиас на `palette/*`). Ничего не удаляется: легаси-имена остаются как deprecated-алиасы.
>
> Формат алиасов и токенов повторяет `forgex-brand.tokens-studio.json` (ключи `value`/`type`, алиас вида `{palette.brand.500}`). OnePass — светлая тема (один режим), поэтому собран один семантический набор `themeLight`.
>
> Опечатка `Pallette → palette` исправлена. Канон примитивов = бывший `Pallette/*`. Регистр семейств приведён к lowercase, ключи — lowerCamelCase (`blackWhite`).

---

## 1. PALETTE — примитивы (коллекция `palette`)

Тип всех — `primitive` (`color`). Значения = из канонического набора `Pallette/*`.

### palette/neutral
| Старое имя (канон) | Новое имя ForgeX | Значение | Тип | Комментарий |
|---|---|---|---|---|
| Pallette/Neutral/25 | palette/neutral/25 | #F4F7FF | primitive | |
| Pallette/Neutral/50 | palette/neutral/50 | #E5EEFF | primitive | |
| Pallette/Neutral/75 | palette/neutral/75 | #E5EBFC | primitive | |
| Pallette/Neutral/100 | palette/neutral/100 | #D0E0FD | primitive | |
| Pallette/Neutral/150 | palette/neutral/150 | #C6DAFF | primitive | |
| Pallette/Neutral/200 | palette/neutral/200 | #AAC6FB | primitive | |
| Pallette/Neutral/300 | palette/neutral/300 | #93B0EC | primitive | |
| Pallette/Neutral/400 | palette/neutral/400 | #8C87B3 | primitive | Конфликт закрыт владельцем: каноном принято #8C87B3; короткий `neutral/400` переуказан алиасом сюда. |
| Pallette/Neutral/500 | palette/neutral/500 | #5977B2 | primitive | |
| Pallette/Neutral/600 | palette/neutral/600 | #486399 | primitive | |
| Pallette/Neutral/700 | palette/neutral/700 | #334973 | primitive | |
| Pallette/Neutral/800 | palette/neutral/800 | #223252 | primitive | |
| Pallette/Neutral/850 | palette/neutral/850 | #1C283F | primitive | |
| Pallette/Neutral/900 | palette/neutral/900 | #101624 | primitive | |
| Pallette/Neutral/950 | palette/neutral/950 | #080B12 | primitive | |

### palette/brand
| Старое имя | Новое имя ForgeX | Значение | Тип | Комментарий |
|---|---|---|---|---|
| Pallette/Brand/25 | palette/brand/25 | #F5F9FE | primitive | |
| Pallette/Brand/50 | palette/brand/50 | #EAF5FF | primitive | |
| Pallette/Brand/100 | palette/brand/100 | #D8EBFF | primitive | |
| Pallette/Brand/150 | palette/brand/150 | #C6E2FF | primitive | |
| Pallette/Brand/200 | palette/brand/200 | #B0D7FF | primitive | |
| Pallette/Brand/250 | palette/brand/250 | #83BCF4 | primitive | |
| Pallette/Brand/300 | palette/brand/300 | #71B8FF | primitive | |
| Pallette/Brand/400 | palette/brand/400 | #3198FF | primitive | |
| Pallette/Brand/500 | palette/brand/500 | #0080FF | primitive | базовый бренд |
| Pallette/Brand/600 | palette/brand/600 | #0072ED | primitive | |
| Pallette/Brand/700 | palette/brand/700 | #0058C5 | primitive | |
| Pallette/Brand/800 | palette/brand/800 | #0044A0 | primitive | |
| Pallette/Brand/850 | palette/brand/850 | #00337D | primitive | |
| Pallette/Brand/900 | palette/brand/900 | #00235E | primitive | |
| Pallette/Brand/950 | palette/brand/950 | #00173F | primitive | |

### palette/accent (розовый)
| Старое имя | Новое имя ForgeX | Значение | Тип | Комментарий |
|---|---|---|---|---|
| Pallette/Accent/50 | palette/accent/50 | #FFE2F0 | primitive | |
| Pallette/Accent/100 | palette/accent/100 | #FFCCE6 | primitive | |
| Pallette/Accent/200 | palette/accent/200 | #FFA6D2 | primitive | |
| Pallette/Accent/300 | palette/accent/300 | #FF87C1 | primitive | |
| Pallette/Accent/400 | palette/accent/400 | #FF51A6 | primitive | |
| Pallette/Accent/500 | palette/accent/500 | #F6077B | primitive | базовый акцент |
| Pallette/Accent/600 | palette/accent/600 | #D9066D | primitive | |
| Pallette/Accent/700 | palette/accent/700 | #C20562 | primitive | |
| Pallette/Accent/750 | palette/accent/750 | #AF0558 | primitive | |
| Pallette/Accent/800 | palette/accent/800 | #9F0450 | primitive | |
| Pallette/Accent/850 | palette/accent/850 | #910449 | primitive | |
| Pallette/Accent/900 | palette/accent/900 | #850443 | primitive | |
| Pallette/Accent/950 | palette/accent/950 | #7A033D | primitive | |

### palette/positive (Green)
| Старое имя | Новое имя ForgeX | Значение | Тип | Комментарий |
|---|---|---|---|---|
| Pallette/Green/200 | palette/positive/200 | #C6E99A | primitive | семейство Green → positive (статусная роль) |
| Pallette/Green/300 | palette/positive/300 | #ADE06E | primitive | |
| Pallette/Green/500 | palette/positive/500 | #7CCC18 | primitive | |
| Pallette/Green/600 | palette/positive/600 | #5BA313 | primitive | |

### palette/negative (Red)
| Старое имя | Новое имя ForgeX | Значение | Тип | Комментарий |
|---|---|---|---|---|
| Pallette/Red/100 | palette/negative/100 | #FFCCCC | primitive | семейство Red → negative |
| Pallette/Red/200 | palette/negative/200 | #FF9999 | primitive | |
| Pallette/Red/300 | palette/negative/300 | #FF6666 | primitive | |
| Pallette/Red/500 | palette/negative/500 | #FF0000 | primitive | |
| Pallette/Red/600 | palette/negative/600 | #CC0000 | primitive | |
| Pallette/Red/700 | palette/negative/700 | #990000 | primitive | |

### palette/warning (Yellow)
| Старое имя | Новое имя ForgeX | Значение | Тип | Комментарий |
|---|---|---|---|---|
| Pallette/Yellow/400 | palette/warning/400 | #FFF199 | primitive | семейство Yellow → warning; шкала жёлто-оранжевая (см. §7) |
| Pallette/Yellow/500 | palette/warning/500 | #FFDD00 | primitive | |
| Pallette/Yellow/600 | palette/warning/600 | #FFB159 | primitive | оранжевый |
| Pallette/Yellow/900 | palette/warning/900 | #FF5E00 | primitive | оранжево-красный |

### palette/additional (фиолетовый + OnePass-расширение)
| Старое имя | Новое имя ForgeX | Значение | Тип | Комментарий |
|---|---|---|---|---|
| Pallette/Additional/100 | palette/additional/100 | #D3C9EF | primitive | лавандовый |
| Pallette/Additional/300 | palette/additional/300 | #AA00FF | primitive | |
| Pallette/Additional/400 | palette/additional/400 | #9C00D2 | primitive | |
| Pallette/Additional/500 | palette/additional/500 | #FF00FF | primitive | magenta |
| Pallette/Additional/550 | palette/additional/550 | #00D4FF | primitive | **ВЫБРОС (циан)** — оставлен внутри `additional` как OnePass-расширение family сверх ядра ForgeX. См. §7. |
| Pallette/Additional/600 | palette/additional/600 | #5500FF | primitive | |
| Pallette/Additional/625 | palette/additional/625 | #361EE0 | primitive | |
| Pallette/Additional/650 | palette/additional/650 | #1B0F8B | primitive | |

> `additional` остаётся как OnePass-расширение палитры сверх ядра ForgeX (ядро ForgeX не содержит этого семейства). Циан `additional/550` НЕ выносится в отдельную коллекцию (по решению владельца §5 «выбросы уводим в группу additional»).

### palette/blackWhite
| Старое имя | Новое имя ForgeX | Значение | Тип | Комментарий |
|---|---|---|---|---|
| Pallette/BlackWhite/White | palette/blackWhite/white | #FFFFFF | primitive | lowerCamelCase ключ |
| Pallette/BlackWhite/Black | palette/blackWhite/black | #000000 | primitive | |

---

## 2. THEME — семантика (коллекция `theme`, набор `themeLight`)

Все семантические токены — **alias** на `palette/*` (строгий алиасинг, гайд §2.1). OnePass — одна светлая тема.

### base / inverse (якоря)
| Старое имя OnePass | Новое имя ForgeX | Значение | Тип | Алиас → | Комментарий |
|---|---|---|---|---|---|
| Background/primary | theme/base | #FFFFFF | alias | {palette.blackWhite.white} | базовый холст |
| (нет; новый якорь) | theme/inverse | #000000 | alias | {palette.blackWhite.black} | высококонтрастная противоположность base |

### tint/* (фоны, бордеры, контент-плоскости)
| Старое имя OnePass | Новое имя ForgeX | Значение | Тип | Алиас → | Комментарий |
|---|---|---|---|---|---|
| Background/secondary | theme/tint/brand/50 | #F5F9FE | alias | {palette.brand.25} | вторичный фон (бренд-25) |
| Background/fourth | theme/tint/brand/100 | #D8EBFF | alias | {palette.brand.100} | |
| Background/contrast secondary | theme/tint/neutral/300 | #93B0EC | alias | {palette.neutral.300} | контрастный фон |
| Background/contrast fourth | theme/tint/neutral/200 | #AAC6FB | alias | {palette.neutral.200} | |
| Background/contrast primary | theme/tint/neutral/500 | #5977B2 | alias | {palette.neutral.500} | |
| Background/popup background | theme/tint/neutral/900 | #101624 | alias | {palette.neutral.900} | фон попапа (тёмный) |
| Input/fill selected | theme/tint/neutral/50 | #E5EEFF | alias | {palette.neutral.50} | |
| Input/Disable | theme/tint/neutral/75 | #E5EBFC | alias | {palette.neutral.75} | |
| Functional/Info | theme/tint/accent/200 | #FFA6D2 | alias | {palette.accent.200} | информ-фон (розовый accent) |
| Background/tertiary | theme/tint/additional/100 | #EEECFF | alias | {palette.additional.100} | Принято владельцем: ближайший примитив, допустимый дрейф значения #EEECFF→#D3C9EF. |

### main/* (заливки кнопок/действий)
| Старое имя OnePass | Новое имя ForgeX | Значение | Тип | Алиас → | Комментарий |
|---|---|---|---|---|---|
| Buttons/tertiary-disable | theme/main/neutral/l200 | #D0E0FD | alias | {palette.neutral.100} | светлая (disabled) ступень |
| Buttons/Text middle | theme/main/neutral/base | #5977B2 | alias | {palette.neutral.500} | средний neutral |
| Buttons/Text dark | theme/main/neutral/d200 | #223252 | alias | {palette.neutral.800} | тёмный neutral |
| Buttons/Text bright | theme/main/neutral/contrast | #FFFFFF | alias | {palette.blackWhite.white} | контраст на тёмной заливке |
| Links/Primary | theme/main/accent/base | #F6077B | alias | {palette.accent.500} | ссылка (accent) |
| Links/Primary-tap | theme/main/accent/l200 | #FF87C1 | alias | {palette.accent.300} | нажатая ссылка |
| Links/Alert | theme/main/negative/base | #FF0000 | alias | {palette.negative.500} | алерт-ссылка |
| Functional/Done | theme/main/positive/base | #5BA313 | alias | {palette.positive.600} | успех |
| Functional/warning | theme/main/warning/base | #FFB159 | alias | {palette.warning.600} | предупреждение |
| Functional/Error | theme/main/negative/base | #FF0000 | alias | {palette.negative.500} | ошибка (совпадает с Links/Alert по значению) |
| Functional/Alert | theme/main/negative/l200 | #FF6666 | alias | {palette.negative.300} | мягкий алерт |

> Примечание: `Buttons/Primary…Tertiary-tap` (8 шт.) и `System/Skeleton` — **пустые/стили** (градиент/композиция), алиас на одиночный цвет не применим. Оставлены вне theme-цвета как стилевые токены (follow-up: effects/gradients).

### text/* (контент: текст и иконки)
| Старое имя OnePass | Новое имя ForgeX | Значение | Тип | Алиас → | Комментарий |
|---|---|---|---|---|---|
| Text/Primary | theme/text/neutral/100 | #00173F | alias | {palette.brand.950} | **основной текст по роли** → text/neutral/100, но значение = brand/950. Алиас на brand/950 (строгий алиасинг; OnePass использует тёмно-синий бренд как «чёрный» текст). |
| Text/Secondary | theme/text/neutral/300 | #486399 | alias | {palette.neutral.600} | вторичный текст |
| Text/Accent | theme/text/brand/base | #0080FF | alias | {palette.brand.500} | акцентный текст = бренд |
| Text/Contrast primary | theme/text/neutral/contrast | #FFFFFF | alias | {palette.blackWhite.white} | текст на тёмном фоне |
| Text/Contrast secondary | theme/text/neutral/contrastSecondary | #D0E0FD | alias | {palette.neutral.100} | вторичный контрастный текст |
| Other/icon25 | theme/text/iconBrand | #0080FF | alias | {palette.brand.500} | иконка (бренд) |
| Other/icon50 | theme/text/iconBrandDark | #00337D | alias | {palette.brand.850} | иконка тёмно-бренд |
| Other/icon100 | theme/text/iconNeutral | #AAC6FB | alias | {palette.neutral.200} | иконка нейтральная |
| Other/icon400 | theme/text/iconAccent | #F6077B | alias | {palette.accent.500} | иконка акцент (= Links/Primary) |
| Other/icon800 | theme/text/iconContrast | #FFFFFF | alias | {palette.blackWhite.white} | иконка на тёмном |
| Other/icon1000 | theme/text/iconInverse | #101624 | alias | {palette.neutral.900} | иконка тёмная |

> **Расширенные ключи `text/*` оставляем (решение владельца).** Неканоничные относительно ядра ForgeX ключи `text/*` (contrast primary/secondary, icon-цвета и т.п.) — намеренное расширение OnePass как отдельного продукта, **не дефект**. Замечание ревью по неканоничности снято решением владельца. Структура `text/*` не меняется.
>
> Обоснование Text/Primary: по **роли** это «основной контент» → слот `text/neutral/100` (в ForgeX это самый тёмный текст). Но фактический hex #00173F совпадает с `palette/brand/950`, а не с нейтралью. По правилу строгого алиасинга алиас ведёт на реально совпадающий примитив — `{palette.brand.950}`. Имя слота сохранено как `text/neutral/100` для семантической совместимости с ролью «primary text».

### Input — пограничные роли (stroke / fill)
| Старое имя OnePass | Новое имя ForgeX | Значение | Тип | Алиас → | Комментарий |
|---|---|---|---|---|---|
| Input/Fill | theme/tint/neutral/inputFill | #FFFFFF | alias | {palette.blackWhite.white} | заливка поля = base |
| Input/Fill focus | theme/tint/neutral/inputFillFocus | #FFFFFF | alias | {palette.blackWhite.white} | |
| Input/Stroke | theme/main/neutral/l100 | #93B0EC | alias | {palette.neutral.300} | бордер поля (роль border, neutral 300) |
| Input/stroke focus | theme/main/brand/l100 | #3198FF | alias | {palette.brand.400} | бордер в фокусе → brand/400 (по роли «фокус = brand») |
| Input/Stroke selected | theme/main/brand/base | #0080FF | alias | {palette.brand.500} | выбранный бордер = brand/500 |

---

## 3. Легаси-алиасы (deprecated — оставлено как алиас, НЕ удалять)

Короткие имена примитивов и параллельные наборы сохранены и переуказаны на канонические `palette/*`. Тип — `alias`.

| Легаси-имя | Новый алиас → | Значение | Комментарий |
|---|---|---|---|
| neutral/25…950 (короткие, кроме 400) | {palette.neutral.<step>} | соотв. | deprecated — алиас, не удалять |
| neutral/400 (короткое) | {palette.neutral.400} | #8C87B3 | deprecated — алиас. Конфликт закрыт владельцем: переуказан на канон (#8C87B3), пометка requires-decision снята. Не удалять. |
| brand/25…950 (короткие) | {palette.brand.<step>} | соотв. | deprecated — алиас |
| accent/50…950 (короткие) | {palette.accent.<step>} | соотв. | deprecated — алиас |
| positive/200…600 (короткие) | {palette.positive.<step>} | соотв. | deprecated — алиас (бывш. Green) |
| negative/100…700 (короткие) | {palette.negative.<step>} | соотв. | deprecated — алиас (бывш. Red) |
| warning/400…900 (короткие) | {palette.warning.<step>} | соотв. | deprecated — алиас (бывш. Yellow) |
| additional/100…650 (короткие) | {palette.additional.<step>} | соотв. | deprecated — алиас |
| black_white/white | {palette.blackWhite.white} | #FFFFFF | deprecated — алиас (snake_case → lowerCamelCase) |
| Opacity/25-White10% | {palette.neutral.25} | #F4F7FF | deprecated — алиас базы; альфу хранить отдельным токеном (follow-up) |
| Opacity/75-White20% | {palette.blackWhite.white} | #FFFFFF | deprecated — алиас базы |
| Opacity/50-Positive10% | {palette.positive.600} | #5BA313 | deprecated — алиас базы |
| Opacity/100-Error40% | {palette.negative.500} | #FF0000 | deprecated — алиас базы |
| Opacity/150-Error20% | {palette.negative.500} | #FF0000 | deprecated — алиас базы |
| opacity/25 | (raw #F4F7FF59) | #F4F7FF59 | deprecated — полупрозрачный; оставлен как есть (нужен отдельный alpha-токен) |
| opacity/75 | (raw #FFFFFF33) | #FFFFFF33 | deprecated |
| opacity/50 | (raw #5BA3131A) | #5BA3131A | deprecated |
| opacity/100 | (raw #FF000066) | #FF000066 | deprecated |
| opacity/150 | (raw #FF000033) | #FF000033 | deprecated |
| Pallette/Gradient/50…800 (15 шт.) | — (пустые/стили) | "" | deprecated — оставлены как стили (градиенты), follow-up |

> Полные машинно-читаемые алиасы коротких примитивов вынесены в набор `legacy` в JSON.

---

## 4. Партнёрские бренды — отдельная коллекция `brand-partners`

Изолированы из ядра. Имена `brandPartners/<brand>/<step>`. Boomerang/BoomerangCasino сведены к одному неймспейсу `boomerang`.

| Старое имя | Новое имя ForgeX | Значение | Тип | Комментарий |
|---|---|---|---|---|
| BillyBets/50, Brand Colors/BillyBets/50 | brandPartners/billyBets/50 | #751925 | primitive | |
| BillyBets/100, Brand Colors/BillyBets/100 | brandPartners/billyBets/100 | #3F010A | primitive | |
| Brand Colors/BillyBets/200 | brandPartners/billyBets/200 | "" | — | пустой слот (стиль/градиент), не удалять |
| BoomerangCasino/50, Brand Colors/BoomerangCasino/50 | brandPartners/boomerang/50 | #3B3737 | primitive | неймспейсы Boomerang+BoomerangCasino сведены |
| BoomerangCasino/100, Brand Colors/BoomerangCasino/100 | brandPartners/boomerang/100 | #0D1014 | primitive | |
| Brand Colors/BoomerangCasino/200, Brand Colors/Boomerang/200 | brandPartners/boomerang/200 | "" | — | пустой слот, не удалять |
| Pacho/50, Brand Colors/Mr.Pacho/50 | brandPartners/mrPacho/50 | #365BFF | primitive | |
| Pacho/100, Brand Colors/Mr.Pacho/100 | brandPartners/mrPacho/100 | #04005E | primitive | |
| Brand Colors/Mr.Pacho/200 | brandPartners/mrPacho/200 | "" | — | пустой слот, не удалять |

---

## 5. Casing типографики

Буквенные ступени → нижний регистр `xxs/xs/sm/md/lg/xl/xxl`. Числовые не применяются. Семейства: Plus Jakarta Sans (display, button), Inter (paragraph — **НЕ трогаем**).

| Группа | Старое (разнобой) | Новое ForgeX | Комментарий |
|---|---|---|---|
| Display | `Display "XL"` + `lg/md/sm/xs` | display/xs, display/sm, display/md, display/lg, display/xl | всё в нижний регистр; family Plus Jakarta Sans |
| Buttons | `Buttons "XL/LG"` + `xxs` | button/xxs, button/xs, button/sm, button/md, button/lg, button/xl | нижний регистр; family Plus Jakarta Sans |
| Headline | смешанный | headline/<xxs…xxl> | привести к нижнему регистру (структура — follow-up) |
| Title | смешанный | title/<xs…xl> | нижний регистр |
| Paragraph | `Paragraph/Medium/(400)` (Inter) | paragraph/medium | **family Inter оставляем как есть**; убрать суффикс `(400)` из имени, перевести в lowerCase |
| бесхозный `lg:12` | в корне | lineHeight/lg (или spacing/lg) | вынести из корня — follow-up |

> В JSON приведён демонстрационный `typography.button` (xxs–xl, нижний регистр, family `Plus Jakarta Sans`). Полная реструктуризация шкал (display/headline/title, значения size/lineHeight) — **follow-up**, в scope этого прохода только casing/family-policy.

---

## 6. Конфликты / требует решения

> Пункты 1 и 2 закрыты решением владельца (см. ниже). Открытых блокеров по значениям нет; ниже — оставшиеся замечания на ревью.

1. ~~**neutral/400 — коллизия значения.**~~ **ЗАКРЫТО (владелец).** Каноном принято **#8C87B3** (`palette/neutral/400`). Короткий `neutral/400` переуказан алиасом на `{palette.neutral.400}`, пометка requires-decision снята. Имя сохранено как deprecated-алиас.
2. ~~**Background/tertiary #EEECFF — нет точного примитива.**~~ **ЗАКРЫТО (владелец).** Принят ближайший примитив `palette/additional/100` (#D3C9EF); дрейф значения #EEECFF→#D3C9EF допущен. Новый базовый примитив не создаётся.
3. **additional/550 #00D4FF — циан в фиолетовой шкале.** По решению владельца §5 оставлен внутри `additional` как OnePass-расширение. Помечен `outlier`. (Альтернатива — отдельная cyan-группа — не выбрана.)
4. **Opacity — два параллельных набора.** `opacity/*` (raw hex с альфой) и `Opacity/*-...` (база без альфы). Сведение к «алиас примитива + отдельный alpha-токен» — follow-up; пока оба сохранены.
5. **warning (Yellow) — разрыв hue.** 400/500 жёлтые, 600/900 оранжевые. Не критично, оставлено; помечено к ревью.
6. **Партнёрские `*/200` пустые** во всех брендах — намеренный слот или пропуск? Оставлены пустыми, не удалены.

---

## 7. Follow-up (вне scope этого прохода)

- **Typography restructure:** полная пересборка шкал display/headline/title/label/button/body со значениями fontSize/lineHeight/letterSpacing, миграция семейств Plus Jakarta Sans, проверка соответствия группам ForgeX (display/headline/title/button/label/body/bodyStrong). В этом проходе — только casing + политика family.
- **Spacing** — НЕ трогали (4px-сетка ForgeX). Отдельный проход.
- **Radius** — НЕ трогали (xs/sm/md/lg/xl/max). Отдельный проход.
- **Shadows / effects** — пустые Buttons/* и System/Skeleton, Gradient/* — перевести в `effects`/`gradients`/`imageFill` коллекции (как `proposals` в ForgeX). Отдельный проход.
- **Opacity** — ввести отдельные alpha-токены и алиасить базу на palette.

---

## Сводка по числам

- Примитивы `palette/*`: 65 (neutral 15, brand 15, accent 13, positive 4, negative 6, warning 4, additional 8 [вкл. циан-выброс 550], blackWhite 2).
- Семантика `theme/*` (themeLight): 38 алиасов (base+inverse 2, tint 11, main 11, text 11, input 5, минус двойной учёт Functional/Error≡Links/Alert по значению — оба токена сохранены).
- Легаси-алиасы (deprecated): 71 короткий примитив-алиас + 5 Opacity-алиасов + 5 raw opacity + 15 пустых Gradient ≈ 96 сохранённых легаси-записей.
- Партнёрские бренды `brandPartners/*`: 9 (3 бренда × {50,100,200}, 200 пустые).
- Требует решения: открытых блокеров нет (neutral/400 и #EEECFF закрыты владельцем); остаётся 4 замечания на ревью (additional/550 циан, два набора Opacity, разрыв hue в warning, пустые партнёрские `*/200`).
