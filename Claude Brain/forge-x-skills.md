# Forge-X — скиллы и доктрины (инвентарь + аудит)

Папка проекта: `~/Documents/Claude/Projects/Framy` (под git, 1 коммит).

## Что есть
### Скилл-файлы (root, плоские .md, без frontmatter)
- `design-debt-linter.md` — линтер хардкода (пиксели/HEX/типографика) с автофиксом в token-классы.
- `figma-generate-spec.md` — генератор технической спеки компонента (README.md) из Figma.
- `figma-theme-rebrand.md` — "Visual Concept → Figma Token Sync" (ранняя версия ребрендинга).
- `rebrand-pipeline.md` — зрелый Dynamic Theme Interpreter pipeline (Phase 1-5 + Component Engineering + Asset Exception). Имеет зеркало `~/Downloads/rebrand-pipeline.md` (надо держать в синке; канон — копия в Framy).

### Доктрины (`doctrine/`, с frontmatter node_type: memory)
- `forgex_architectural_doctrine.md` — БОЛЬШАЯ. Rule 0 (3 tier customization: Standard / 🟩High-Custom #06b204 / 🟧Low-Custom #ff8a05) + Rules 1-16. Читать ПЕРВОЙ перед любым аудитом/правкой Figma.
- `feedback_dynamic_theme_interpreter.md` — НЕ бейкать concept-значения в build-tokens.js/tailwind.config.js (урок про "Path B").
- `feedback_forgex_radius_doctrine.md` — нет правила "sharp corners везде"; radius/xs=0 был только для brand-кнопки.
- `feedback_forgex_variable_injection.md` — ребренд = перезапись значений существующих переменных Figma по name-match in place, НЕ параллельная коллекция. MCP не тянет bulk-перезапись → Tokens Studio import или REST API.
- `verify-button-colors.js` — скрипт проверки.

### Прочее
- `themes/`: excitewin.theme.json, forgex-brand.theme.json, forgex-brand.tokens-studio.json
- `color-plugin/` (APCA/Bezier curve math — reference, не трогать), `concept.png`.

## Реальные имена Tailwind-классов (подтверждено из tailwind.config.js)
- ВЕРНО: `bg-base`, `text-inverse`, `text-text-neutral-100`, `bg-tint-brand-200`, `bg-main-brand`, `text-main-warning-contrast`.
- Палитра-примитивы `bg-palette-brand-400` — есть, но в продукте НЕ использовать напрямую.
- УСТАРЕВШЕЕ/НЕВЕРНОЕ именование (в старых скиллах): `bg-neutral-25`, `bg-brand-500`, `neutral-900`, `brand-500` — таких классов нет.

## Сделано (2026-06-09)
- ✅ `design-debt-linter.md` переписан: doctrine-aware (Rule 0 + sentinel-исключения #ff00ff/#808080/brand-protected/tier-borders), верные имена классов (bg-base, bg-tint-neutral-*, text-text-neutral-*, p-16 4px-grid, rounded-md, text-headline-sm), добавлен frontmatter name/description.
- ✅ Создан `CLAUDE.md` в корне Framy: порядок чтения (Rule 0 → GUIDE → tailwind.config.js), карта доктрин/скиллов/sentinel-цветов/ассетов, помечен legacy figma-theme-rebrand.md.
- ✅ `figma-theme-rebrand.md` превращён в DEPRECATED-редирект на rebrand-pipeline.md (убран запрещённый Path B).
- ✅ `figma-generate-spec.md` починен: реальные Figma MCP-тулы (get_metadata/get_screenshot/get_design_context/get_variable_defs, selection-или-node-id), верные классы, tier/sentinel-учёт, frontmatter.

## Правки по ревью code-reviewer (2026-06-09)
- ✅ Введена конвенция тира в коде: маркер `// @ds-tier: standard|high-custom|low-custom` вверху компонента (Figma-бордеров в .tsx нет). Линтер читает его, no marker = standard. Записано в design-debt-linter.md, component-builder.md (Step 5), CLAUDE.md §4.
- ✅ Уточнён канон `main-<family>`: всегда суффикс роли; `bg-main-brand` = `-base` по DEFAULT, текст на CTA = `text-main-<family>-contrast`. Линтер обязан дописывать `-contrast`.
- ✅ Починен битый якорь в component-builder (rebrand-pipeline "Component Engineering" §2/§4 вместо несуществующего "Adaptive Layout Integrity").
- ✅ Sentinel-список в component-builder Step 6 синхронизирован с каноном (+tier-borders), ссылается на CLAUDE.md §4.
- ✅ В component-builder Step 5 добавлена заметка про px-numeric spacing (p-16 = 16px).

## Правки по оркестрации-ревью (2026-06-09)
- ✅ GUIDE §1.4 `size` приведён к `xxs…xxl` (был `2xs…2xl`, конфликтовал с кодом/токенами). Источник истины — код.
- ✅ CLAUDE.md §3: запись про figma-theme-rebrand.md смягчена — это уже чистый DEPRECATED-редирект, а не «активно противоречит» (старая формулировка пугала зря).
- Урок: даже агент-ревьюер выдал ложный факт («файла нет», хотя есть) — верификация руками обязательна.

## Навык decoration-craft (2026-06-09)
- ✅ Создан `Framy/decoration-craft.md` — playbook «декоратор»: (1) где нужен богатый декор (High-Custom hero/CTA/brand) vs где хватит заливки+stroke; (2) лестница «лёгкое → тяжёлое», правило «лёгчайший приём, что читается так же на целевом размере»; (3) полный toolkit (fill/stroke/radius/shadow in-out/blur/gradient/extra-frame/glow/blend/mask/image/texture/chrome) с responsive-разбивкой (resolution-independent vs asset-bound); (4) Forge-X-правила (токены, Rule 0, gap, master). Ссылается на доктринальные Design Tricks, не дублируя. В CLAUDE.md §3.

## Находки аудита (что чинить)
1. **figma-theme-rebrand.md ПРОТИВОРЕЧИТ доктрине** — его Phase 3-4 велят менять primitive HEX в семантических токенах и обновлять tailwind.config.js под concept. Это ровно та ошибка "Path B", которую пользователь откатил. Кандидат: ретайр или переписать как тонкий враппер над rebrand-pipeline.md.
2. **design-debt-linter.md не знает про Rule 0** — зафлагает raw HEX/градиенты на 🟩High-Custom компонентах и #ff00ff magenta-маски / #808080 card-mask / brand-protected logo-цвета как нарушения. Нужно сделать doctrine-aware (исключения). Плюс примеры классов неверные (bg-neutral-25 → должно bg-tint-neutral-50 / bg-base).
3. **figma-generate-spec.md — выдуманные MCP-тулы** (`figma__get_file`, `figma__get_component`). Реальные: get_design_context/get_metadata/get_screenshot, читают из активного выделения или node-id. Примеры классов тоже устаревшие (neutral-25, headline-sm). Не учитывает selection/node-id gotcha.
4. **Формат непоследовательный** — доктрины с frontmatter (memory), скиллы плоские. Для срабатывания как Cowork-скиллы нужна структура SKILL.md + frontmatter (name/description).
5. **Нет индекса/CLAUDE.md** в Framy — нечем связать скиллы и доктрины; пользователь раньше искал CLAUDE.md, его нет.
6. **Зеркало rebrand-pipeline.md в ~/Downloads** — риск рассинхрона.

## Чего не хватает (пробелы)
- ✅ СДЕЛАНО (2026-06-09): `figma-token-sync.md` — синк СТРУКТУРЫ токенов из Figma в build-tokens.js (не concept-значений!), регенерация tailwind.config.js, верификация diff-ом. Добавлен в CLAUDE.md.
- ✅ СДЕЛАНО (2026-06-09): `component-builder.md` — ТОНКИЙ оркестратор сборки компонентов (~40 строк): только порядок шагов + ссылки на первоисточники, БЕЗ дублирования правил. Нейминг живёт отдельно в GUIDE §1 (только ссылка). Поднимает погребённую секцию "Design Tricks & Mechanics". Решение принято осознанно: толстый скилл с копией правил отвергнут из-за риска drift (два источника правды).
- Doctrine-aware версия линтера со списком sentinel-исключений (#ff00ff, #808080, payment/flag/social brand colors, tier-0 правила).
- Единый индекс/CLAUDE.md с порядком чтения (Rule 0 first).
