# Forge-X — дизайн-система

## Источники и доступы
- Figma-аккаунт: Дмитрий Брыков (weggan040@gmail.com), команда **Framy** (Pro).
- Figma-файл: **ForgeX | Library**, file key `natBqfvZvRAk2RrvPIpBmo`.
  - Typography frame: node `2086:9499` (полная типографика читается отсюда).
  - "EntrancePage:" — page node `155679:47481`.
- Канонический гайд в рабочей папке Framy: **DESIGN_SYSTEM_GUIDE.md** (НЕ CLAUDE.md — его нет).

## Файлы токенов
- `build-tokens.js` — **источник правды**. Определяет palette, theme, типографику, spacing, radius, shadows, breakpoints.
- `tailwind.config.js` — **генерируемый вывод**. Скрипт пишет light-токены в `:root`, dark — в `.dark` как CSS-переменные, затем маппит в Tailwind-классы (`bg-base`, `text-inverse`, `bg-tint-brand-200`, `text-text-neutral-100`, `bg-main-brand`, `text-main-warning-contrast`). Тёмная тема — class-based (`<html class="dark">`).

## Token-вокабуляр (гайд, секция 1.4) — это prop-конвенции компонентов, не CSS-токены
- `size`: шкала `2xs → 2xl`.
- `variant`: латинские порядковые `primary … denary`.
- `state`: default/active/hovered/pressed/visited/enabled/disabled/selected/checked/loading.
- плюс `validation`, `direction`, `alignmentX`, `alignmentY` с фиксированными наборами.
- Живут в коде компонентов (TS prop types), а не в Tailwind config.

## Цвета (секция 2)
- Семантические цвета коллекции `theme` ВСЕГДА алиасят из коллекции `palette` — никогда не ссылаться на индексы palette напрямую (theme-шкалы могут сдвигаться, напр. `tint/neutral/25` → `{neutral/125}` при сдвиге +100).
- Якоря `base` и `inverse` меняют смысл между light/dark.
- Текст на высококонтрастных поверхностях (Primary CTA) ВСЕГДА `text-inverse` ради A11Y.
- Функциональное использование: `tint/neutral` 25–150 — фоны, 200–400 — границы, 500–900 — контент; `tint/brand` — интерактивные фокусные точки; статусы `positive/negative/warning/info` — только контекстный фидбек.

## Типографика (секция 3)
- 7 функциональных групп: `display`, `headline`, `title`, `button`, `label`, `bodyStrong`, `body` — у каждой строгая роль.
- Семантику не смешивать (никогда `body` внутри кнопки). Неоднозначный текст по умолчанию — `body/md`.
- Суб-свойства (fontSize, lineHeight, letterSpacing, fontFamily, fontWeight) применяются ВСЕГДА вместе как единый токен — не разбивать на inline CSS.

## Гайд vs реальность (важно)
- Гайд декларирует `2xs → 2xl` (7 ступеней) для всех групп, но в Figma полный диапазон только у `headline` (7 размеров), у остальных 6 групп — по 5. Синкаем по факту из Figma, не дополняем искусственно.
- Именование размеров — `xxs`/`xxl`, НЕ `2xs`/`2xl`.
- Итог последнего синка (2026-05-27): 37 токенов типографики.
  - display: 5 (xs→xl), weight 800
  - headline: 7 (xxs→xxl), weight 700
  - title: 5 (xs→xl), weight 600
  - label: 5 (xs→xl), weight 600
  - button: 5 (xxs→lg), weight 900
  - body: 5 (xs→xl), weight 400
  - body-strong: 5 (xs→xl), weight 700
- Удалены legacy-токены, которых нет в Figma: `body-xxs` (10/16), `body-strong-xxs` (10/16), `body-strong-xxxs` (8/14). При желании можно вернуть отдельным "legacy" блоком.

## Структура build-tokens.js
- Palette (примитивные рампы, mode-agnostic): `neutral, brand, accent, info, warning, positive, negative` — ступени `25 … 975`.
- Theme (отдельно для `themeLight` / `themeDark`):
  - `base` / `inverse` (white↔black, флипаются между режимами).
  - `tint/<family>/{50…300}` — поверхности/фоны.
  - `text/neutral/{100…400}` + `text/<colored>/{l200, base, d200}` — контент.
  - `main/<family>/{l200, l100, base, d100, d200, contrast}` — интерактив/main.
- Типографика: `fontFamily` — baseline default **Inter** (агностичный sandbox); НО это concept-значение. На 2026-06-09 Figma-файл затемлен под concept со шрифтом **Jost** (подтверждено по node 4003:16360). Шрифт и веса/lineHeight — concept-зависимые, живут в Figma/theme JSON, в build-tokens.js НЕ запекаются. `fontWeight` (regular→black), `fontSize` map (см. выше).
- ✅ Цветовые токены сверены с живым Figma (node 4003:16360, тёмная тема): структура и имена классов верны. Бренд dual-character — main/brand/base золото #c49557, text/brand/base бирюза #5bb3b3. main/*/contrast не равен inverse (info=#000, статусы=#fff).
- Spacing: сетка 4px — `0, 4, 6, 8, 12, 16, 24, 28, 32, 40`.
- Border radius: `xs / sm / md / lg / xl / max`.
- Shadows: `outer-{sm,md,lg}-{100,200,300}` и `inner-{sm,md,lg}-{100,200,300}`.
- Breakpoints: `min: 1920px`, `max: 2160px` (large-desktop-first).

## Workflow guardrail (секция 4)
- Никаких хардкод-значений для padding, margin, borders, radius, shadows, colors — всё через token-классы, сгенерированные в Tailwind config.

## Эталон конвертации казино-макетов (2026-06-09)
- EntrancePage / `breakpoint=desktop` (node `168369:53998`), бренд Dolly Casino — ЭТАЛОН, по которому делают остальные макеты в файле.
- Готово (DS-инстансы): ❖ Header, ❖ MainBanner, ❖ SportEntrancePage/MatchCard/OddsItem, ❖ BannerSection, ❖ Footer/Links/Payments, ❖ MainMenuSidebar, ❖ ScrollBar, ❖ Input, ❖ Link. Тема: base #060e0e, brand gold #c49557, text-brand teal #63b7b7, шрифт Jost, радиусы острые (xs/sm/md=0).
- ПРОБЕЛ (подтверждён пользователем): игровые карточки — локальные `GameCard*`, НЕ DS. Надо менять на card-family (CardGroup/CardSlider/InlineCardSlider). На новые макеты локальный паттерн НЕ тиражировать.
- Мелкий debt: опечатка `neutrlal` в shadow-токене, raw `#dec3a1` в box-shadow кнопок; библиотечные хвосты `UI KIT/Input/Border`, `❖ Footer/…??`.
- Playbook: `Framy/casino-mockup-conversion.md`.
- Нюанс: search_design_system по этому файлу отдаёт чужую библиотеку «Рабочий проект Nullker», ForgeX-компоненты там не индексируются.

## Аудит 14 экранов (2026-06-09, ПОЛНОЕ дерево — корректные данные)
- ВАЖНО: прошлый прогон с depth=10 обрезал счётчики → ошибочно записал Tournaments/Info/GameHall как «100% Inter». НЕВЕРНО. На полном дереве ВСЕ экраны преимущественно Jost; ни один не «отвалился». Inter = остаточный дрейф 1–35%.
- Inter % (доля Inter в тексте): Registration 35%, Login 27%, Info 17%, Account 16%, HelpCenter 15%, Payments 12%, GameHall 12%, Promotion 10%, Shop 8%, Tournaments 6%, GamePage 4%, Challenge 3%, BaseEntrance 1.3%.
- Чистка Inter: по доле — формы Login/Registration; по абсолютной массе — AccountPages (509), ShopPages (252), InfoPages (196), Promotion (160). Это рутина «перевести стрэй-тексты на Jost-типо-токены», не пересборка.
- Декор-плотность (IMG/GRAD/VEC) лидеры = High-Custom-кандидаты: BaseEntrancePage (5113/3664/8568), ShopPages (1689/3996/4061), AccountPages (1278/3268/3017).
- ГЛАВНОЕ: счётчики (шрифт + даже IMG/GRAD/VEC density) НЕ отвечают на «выглядит ли как Dolly» — это только про наличие/плотность, не про то, что декор именно Dolly. Нужна ВИЗУАЛЬНАЯ сверка скриншотов компонентов с эталоном (особенно High-Custom).
- NB: `❖` в REST JSON не считается (UI-глиф); инстансы — `type:"INSTANCE"` (ещё не считали — это ось «структура: на компонентах или сырьё»).

## Принцип: бренд = декоративные внутренние слои (важно)
- «Выглядеть как бренд» определяют НЕ токены цвета, а декоративные ассеты ВНУТРИ компонентов: фоновые изображения, текстуры, градиенты, SVG/VECTOR, нарезанные chrome-плашки кнопок, hero-картинки, лого. Цветов+шрифта недостаточно (прямые слова пользователя 2026-06-09).
- Это зона Rule 0 High-Custom (🟩) + Asset Exception + Design Tricks (хром-кнопки с per-variant image-fill).
- Компонент может быть верным `❖`-инстансом с привязанными цветами и всё равно выглядеть не как бренд, если внутри старые/чужие/пустые декоративные ассеты.
- Аудит/конвертация должны проверять декор-слой (imageRef, GRADIENT_*, "VECTOR" в node JSON), а не только токены; High-Custom — сверять визуально с эталоном.
- Доступ к полному дереву файла — через Figma REST API (`/v1/files/{key}/nodes?ids=...`), запускать на машине пользователя (моя песочница к api.figma.com не пускает). Файл "ForgeX | Library": секции PAGES (14 экранов), LAYOUT/MENU/CARDS/COMPONENTS/FORMS/… (компоненты). DS-карточки игр существуют: GameCard 5094:25170, CardSlider 52869:1881, CardGroup 7213:151105, InlineCardSlider, GameBanner.

## Figma MCP — рабочие нюансы (важно для будущих сессий)
- `get_design_context` / чтение переменных читает из **активного выделения в Figma desktop app**. Если ничего не выделено — "you currently have nothing selected".
- Чтение на уровне page-node часто возвращает пустоту (0×0 screenshot).
- Решение: либо пользователь выделяет фрейм в Figma desktop и кидает URL с `?node-id=…`, либо передаёт node-id напрямую — тогда читаю узел без совпадения с desktop-выделением.

## ЗАПИСЬ в Figma — делаю САМ через `use_figma` (правило, кейс 2026-06-12)
**Главное: `use_figma` (Figma MCP) — рабочий путь записи, не нужны ни Scripter, ни computer-use, ни REST.** Он выполняет произвольный JS через Figma Plugin API (`figma.variables.*`, `getLocalTextStylesAsync`, `setBoundVariable`, `createVariable`, `createVariableCollection`, `createVariableAlias`). Подтверждено на файле OnePass (`3J7XTajyyGvKLMVWwQaiJk`): одним вызовом создал коллекцию `theme` + 39 токенов-алиасов; вторым — привязал 33 текст-стиля к `font/*` (fontFamily/fontStyle/fontSize/lineHeight). 0 ошибок.

**Старый запрет «MCP роняет соединение на записи переменных» — УЗКИЙ, не общий.** Он относится только к **массовому `setValueForMode` по уже сильно-связанным переменным** (каскад ре-рендера по 85+ вариантам). НЕ относится к: созданию НОВЫХ (ещё ни к чему не привязанных) переменных, простановке алиасов на свежие переменные, биндингу текст-стилей — это лёгкие операции, проходят штатно. Вывод: для создания/биндинга — смело `use_figma`; для bulk-перезаписи значений боевых heavily-bound переменных — по-прежнему Tokens Studio / REST / чанками.

**Что НЕ работает (тупики):** моя песочница bash без сети → REST к `api.figma.com` недоступен мне напрямую; Variables REST API (`POST /v1/files/:key/variables`) — только Enterprise (у пользователя не Enterprise); computer-use требует системных прав (Accessibility + Screen Recording), которые пользователь может не дать. Поэтому дефолт для записи — `use_figma`.

**Плейбук записи (оптимизация):**
1. `use_figma` применяет СРАЗУ (без dry-run) → пиши идемпотентный код (проверяй `existing`/by-name перед созданием) и **верифицируй ридбэком** (резолвь алиасы/boundVariables, сверь hex).
2. **Сначала ЧИТАЙ реальные локальные имена.** `getLocalVariableCollectionsAsync` + `getLocalVariablesAsync` + `getLocalTextStylesAsync`. Имя переменной `.name` НЕ содержит имени коллекции (в коллекции `palette` переменная зовётся `neutral/500`, а не `palette/neutral/500`). Карты маппинга строй под фактические имена, а не под то, что показал `get_variable_defs`.
3. **Проверяй local vs remote-library ПЕРЕД планированием.** Кейс OnePass: «грязь» (`Pallette/*`, `Text/*`, `Buttons/*`, семантика) жила в ПОДКЛЮЧЁННОЙ библиотеке (её локально нет → переименовать из файла-потребителя нельзя), а локально были чистые `palette/font/space/radius` с короткими именами. `get_variable_defs` отдаёт объединение local+remote и путает. `getLocalVariables…` показывает только то, что реально можно править.
4. `createVariable(name, collectionObject, "COLOR")` — современная сигнатура принимает ОБЪЕКТ коллекции (старая — collectionId-строку).
5. Семантику строй алиасами: `v.setValueForMode(modeId, figma.variables.createVariableAlias(target))`; `modeId = collection.defaultModeId`.
6. Типографику привязывай через `textStyle.setBoundVariable("fontFamily"|"fontStyle"|"fontSize"|"lineHeight", variable)`. На всякий случай предзагрузи шрифты `loadFontAsync` в try/catch.

## Цветовые ПРАВИЛА ролей (официальный гайд для новичков, кейс 2026-06-12)
Источник: доска-гайд в файле OnePass, node `72962:270956` (фреймы Intro / **Guide** `72962:270981` / Recommendations). Автор — Olga Shchukina, фидбек в slack/комментах. Правила (Guide → Step3–6):
- **palette** — примитивы (neutral/brand/accent/info/warning/positive/negative + extra). Это ПЕСОЧНИЦА: в макетах напрямую НЕ используются, из неё строятся темы. Шаг «500 – Base» — опорный.
- **base / inverse** — base = основной фон приложения (дизайнер выбирает), inverse = инверсия. Темы light/dark (mode в коллекции theme). Чтобы сделать dark приоритетной — Duplicate mode light → удалить light → переименовать копию в light.
- **main/<family>/{l200,l100,base,d100,d200,contrast}** — основные ЗАЛИВКИ (button, badge, выделенный пункт списка). `base` из палитры; `l100=base−100, l200=base−200, d100=base+100, d200=base+200` (формула, шаг 100). `main/.../contrast` = текст/иконка НА этой заливке. ВАЖНО: проверять контраст `main/.../base` на фоне `base`. Зависимости заложены в состояния компонента (default/hover/pressed) — ломать систему нельзя.
- **tint/<family>/{50,100,150,200,250,300}** — ФОНЫ интерфейса (плашки, карточки, невыделенные пункты меню) И **бордеры/дивайдеры**. Зависит от `base`: `tint/x/50=base+50 … tint/x/300=base+300`. Поменял base → пересчитать всю tint. Оттенки чуть отличаются от base, но важны.
- **text/<...>** — ТЕКСТ и ИКОНКИ (одни и те же токены, отдельных icon-токенов канон НЕ держит). `text/neutral/{100,200,300,400}` — значения по вкусу дизайнера (шаг не обязательно 100). `text/<colored>/{l200,base,d200}` — base из палитры, l200/d200 = ±200. Для текста на фонах tint, base и доп-фонах; проверять читаемость.
- Статусы (positive/negative/warning/info) — контекстный фидбек.

## Палитра-плагин (генерация ступеней)
- В рабочей папке: `Framy/color-plugin/` — Figma-плагин **wallet-x-colors-middle** (`index.js` пишет переменные, `index.html` ~233КБ минифицирован — формула генерации шкалы там). Пишет в коллекцию `palette`; конфиг палитры хранит в pluginData коллекции, namespace `wallet_x_ds`, ключ `config_<paletteName>`.
- Запустить его UI из MCP/песочницы нельзя. Если нужны НОВЫЕ ступени палитры — лучше прислать пользователю сгенерить плагином; интерполяция соседних — временный фоллбэк, помечать «сверить плагином».

## Компоненто-специфичные токены (общая конвенция)
- Токены, не ложащиеся в main/tint/text (input fill/stroke, icon/contrast-цвета и т.п.), — в отдельную коллекцию **component** (как ForgeX Rule 5 `❖ Component/...`). Статус-base можно держать продуктовый (не жёсткий канон). Неканон icon/contrast text-токены — сворачивать в канон (он структурнее).
- Конкретное применение в приложении 1PassApp (PlayID-трек: какие коллекции/токены созданы, что перепривязано) — НЕ здесь, см. `playid-1passapp.md` (два мира не смешиваем).

## Нейминг слоёв/компонентов — применение §1.1 (кейс OnePass 2026-06-12)
- Правила §1.1: компоненты/под-компоненты/слои — **UpperCamelCase**; под-компоненты — dot-notation `Parent.Element`; варианты — slash `Parent/Variant`; вариант-пропы и значения — **lowerCamelCase**; булевы пропы — `is/has/can`; авто-имена Figma (`Frame 123`, `Rectangle 41`) → функциональные `Background/Container/Icon/Label/Mask/Knob/Dot/Badge/...`.
- Канон size: `xxs,xs,sm,md,lg,xl,xxl` (L→lg, M→md, Large→lg, Meduim→md). Канон state: `default/active/hovered/pressed/disabled/selected/checked/loading/...`. Семантика state из практики OnePass: `Tap→pressed`, `Disable→disabled`, `normal→default`, `Active-Tap→pressed`; **`Focus→hovered`** (владелец выбрал hovered, т.к. `focused` нет в §1.1-списке).
- **НЕ переименовывать собственные имена** (домен-значения): провайдеры (`AvatarUX`,`Belatra`), флаги (`ar/at`), иконки (`KYC`,`TERMS`), категории табов, темы (`Dark/Light`), системы (`iOS/Android`), направления стрелок. Casing у них не трогать.
- `#id`-суффикс у не-вариант пропов (`Right icon#17980:6`) — внутренний id Figma. При rename через `componentSet.editComponentProperty(fullNameWithId, {name: cleanName})` давать имя БЕЗ `#id`. Вариант-пропы/значения переименовываются правкой имён вариант-детей (`State=Default` → `state=default`), либо editComponentProperty для ключа.
- Способ работы (оправдал себя): аудит структуры через `use_figma` → judgment-карту имён строит **субагент** (он в Figma не пишет, только данные→план) → применяю через MCP. Иконочная геометрия (`Vector`/`Arrow`/`Union`) — НЕ мусор, не трогать. Структурных авто-имён на уровне мастеров в зрелом UI Kit мало — основная масса слоёв уже названа по BEM-конвенции `item-/block-`.
- Конкретика применения в 1PassApp (что переименовано, решённые edge-кейсы) — см. `playid-1passapp.md`.
