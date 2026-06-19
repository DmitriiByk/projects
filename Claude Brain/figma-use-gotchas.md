# Figma `use_figma` / Plugin API — грабли и правила

Многоразовое для ЛЮБОЙ работы через `use_figma` (Figma MCP, JS через Plugin API). Не привязано к 1PassApp. Выучено на практике в сессиях редизайна (2026-06).

## Транзакции и ошибки
- **`throw` (или любая необработанная ошибка) откатывает ВСЮ транзакцию вызова.** Все правки в этом `use_figma` пропадут.
  - Пишущий вызов заканчивай `return <отчёт>;`, НЕ `throw`.
  - `throw` — только в read-only диагностике (когда писать нечего и откатывать нечего).
  - Для пачки операций оборачивай каждую в `try/catch` и собирай лог — тогда валидные закоммитятся, а падёт только проблемная.
  - Если вызов упал — считай, что НИЧЕГО не записалось (даже то, что «до» ошибки). Перенос/правку делай отдельным успешным вызовом перед тем, что может упасть.

## Auto-layout / sizing
- **`resize()` на auto-layout фрейме лочит ось в FIXED** и схлопывает hug (классический баг: компонент стал высотой 10px). Не ресайзь то, что должно hug.
  - Хочешь hug → `node.primaryAxisSizingMode='AUTO'; node.counterAxisSizingMode='AUTO';` и не вызывай `resize()`.
  - Хочешь фикс по одной оси, hug по другой → задавай размеры детям, ось-hug оставляй AUTO (фрейм подстроится под детей).
- **Новый `createFrame()` после `layoutMode=...` по умолчанию FIXED 100×100 по counter-оси** → пилюли/чипы/строки рендерятся высотой 100px. ВСЕГДА явно ставь оба sizing в `'AUTO'` для пилюль, чипов, строк-обёрток.
- `layoutAlign='STRETCH'` на ребёнке вертикального auto-layout = растянуть по ширине контейнера (для full-width внутри `content` с паддингами).
- Абсолютные `.x/.y` на детях auto-layout игнорируются — для вставки в нужное место используй `parent.insertChild(index, node)`.

## Прототип (reactions)
- **`node.setReactionsAsync([{ trigger, actions: [action] }])`** — поле **`actions` (массив)**, НЕ `action` (старое поле кидает «update the actions field instead»).
- **NAVIGATE: destination обязан быть другим top-level фреймом ТОЙ ЖЕ страницы.**
  - `createFrame()` кладёт фрейм на `figma.currentPage`, которая часто ≠ страница, где лежат экраны → cross-page nav отклоняется.
  - Сначала перенеси фрейм на нужную страницу (`pageNode.appendChild(frame)`) ОТДЕЛЬНЫМ успешным вызовом, потом привязывай реакции.
  - Проверка страницы узла: иди по `node.parent` до `PAGE`.
- **SCROLL_TO не принимает `transition: {type:'SMART_ANIMATE'...}`** → «Reaction at index 0 was invalid». Ставь `transition: null`.
  - Источник (тамбнейл) может быть вне скролл-контейнера; destination — узел внутри фрейма с `overflowDirection='HORIZONTAL'` (или вертикальным).
- Горизонтальный свайп-просмотр = фрейм-контейнер с `clipsContent=true` + `overflowDirection='HORIZONTAL'`, внутри широкий auto-layout-стрип (hug по ширине). Нативный скролл прототипа листает без множества кадров.
- Шторка снизу: `transition {type:'MOVE_IN', direction:'BOTTOM', matchLayers:false, easing:{type:'EASE_OUT'}, duration:0.3}`; закрытие — `MOVE_OUT`/`BOTTOM`.

## Шрифты
- Грузить перед установкой текста: `await figma.loadFontAsync({family, style})`. `loadFontName` / `loadFontNameAsync` НЕ существуют.
- Стиль пишется с пробелами: `'Extra Bold Italic'`, `'Semi Bold'` (не `ExtraBold`/`SemiBold`).
- Перед `node.characters = '...'` на чужом/клонированном/инстанс-тексте сначала `await figma.loadFontAsync(node.fontName)` (иначе PJS рендерится как Inter или падает).

## Переиспользование и компоненты
- `clone()` сохраняет картинки и градиенты — лучший способ переиспользовать скриншот/баннер/градиент-заливку. Альтернатива: `node.fills = JSON.parse(JSON.stringify(src.fills))` (сохраняет и привязки к переменным).
- **Правь вариант компонента НА МЕСТЕ** (меняй fills/детей существующего COMPONENT) — инстансы обновятся сами. Удаление/пересоздание варианта ломает существующие инстансы.
- Состояния (connected/not-connected и т.п.) = один component set с вариантами через `figma.combineAsVariants([c1,c2], page)`, имена `'State=...'`.
- `clipsContent` — только на фреймах/компонентах, НЕ на RECTANGLE (иначе throw → откат).
- Текст внутри инстанса можно переопределять: найди TEXT-узел, загрузи его шрифт, задай `.characters` (станет override).

## Привязка токенов
- Заливка к переменной: `let p={type:'SOLID',color:{r:0,g:0,b:0}}; p=figma.variables.setBoundVariableForPaint(p,'color', varObj); node.fills=[p];` (аналогично `node.strokes`).
- Резолвить переменные по имени надёжнее, чем по ID: `const vars=await figma.variables.getLocalVariablesAsync(); const V={}; vars.forEach(v=>V[v.name]=v);` → `V['brand/950']`.

## Диагностика
- `get_screenshot` отдаёт только URL (в этой среде его не скачать curl-ом). Для инлайн-картинки используй `get_design_context` (возвращает рендер + код).
- `get_metadata` — лёгкий обзор структуры (имена/размеры/дети) без тяжёлого кода; потом точечно `get_design_context`.
