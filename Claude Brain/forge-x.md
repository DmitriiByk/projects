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
