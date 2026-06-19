# Проекты и дизайн-системы

Карта проектов пользователя. Дизайн-система может быть не одна.

## Forge-X
- Дизайн-система (основная, над которой работаем сейчас). ВАЖНО: эта ДС — ТОЛЬКО про Forge-X. Другие проекты могут использовать её же ИЛИ отличаться — не переносить выводы по Forge-X на другие проекты автоматически.
- Полные детали: [forge-x.md](forge-x.md). Figma "ForgeX | Library" (`natBqfvZvRAk2RrvPIpBmo`), токены в build-tokens.js → tailwind.config.js.
- Репо `~/Documents/Claude/Projects/Framy`: скиллы (design-debt-linter, figma-generate-spec, figma-token-sync, rebrand-pipeline), доктрины (doctrine/), CLAUDE.md-индекс.

## PlayID
- Мобильные приложения под Google Play / App Store.
- Стек-трек: Flutter + Riverpod (мобайл). Цель — в т.ч. быстрые прототипы, которые можно показать на телефоне.
- Обслуживается 4 кастомными агентами (см. [playid-agents.md](playid-agents.md)).
- Потребляет ОБЩУЮ Figma (ForgeX Library) как источник дизайна → через design-system-keeper в ThemeData. НЕ путать с веб-потоком Forge-X (build-tokens.js).
- На диске отдельной папки PlayID пока нет (трек ведётся вне Framy).

## Два мира — НЕ смешивать
- **Forge-X** = казино-бренды, ВЕБ, React/Tailwind, build-tokens.js → tailwind.config.js. Репо Framy.
- **PlayID** = мобайл, Flutter/Riverpod, store-аппки + прототипы. Figma ↔ ThemeData.
- Общее: одна Figma ForgeX Library (`natBqfvZvRAk2RrvPIpBmo`) как источник дизайна. Два независимых потребителя.
- Guardrail: ни один поток не мутирует ТОПОЛОГИЮ Figma-коллекций и не запекает concept-значения в источник (общий принцип из доктрины Forge-X).

## Инструментальные заметки
- [figma-use-gotchas.md](figma-use-gotchas.md) — грабли и правила работы через `use_figma` (Plugin API): транзакции/откаты, auto-layout sizing, прототип-reactions, шрифты, переиспользование. Читать перед любой Figma-сборкой.

## Правило раскладки
- Конвенции, токены, naming, правила компонентов — durable, в файл соответствующей дизайн-системы.
- Текущие задачи/дедлайны — dated, помечать абсолютными датами.
- Повторяемые процессы с чёткими шагами — кандидаты на полноценный skill.
