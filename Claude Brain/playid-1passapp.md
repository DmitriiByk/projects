# PlayID — продукт и три аппки

## Что за продукт
Создаёшь аккаунт + проходишь KYC один раз → коннектишься к разным казино-брендам в один клик. Плюс кошелёк: хранить деньги, депозит, вывод, перевод на бренды. Главная прибыль и KPI — коннект казино.

## Три аппки (одинаковый функционал, разный дизайн)
Они должны отличаться дизайном, иначе сторы (Apple + Google) отклоняют как клон («design spam»). Сторы смотрят не только на цвета, а на структуру экрана и паттерны.
- **PlayID** — светлый, фиолетовый, Montserrat. Казино-агрегатор с кошельком.
- **Kassu** — тёмный, синий, кошелёк-first. Для регулируемых рынков.
- **1PassApp** — клон, который дифференцируем. Светлый, синяя нейтраль, Plus Jakarta Sans. Концепция — «игровой профиль» (Player Pass).

## Принцип (может пригодиться в будущем)
Любой паттерн в 1PassApp должен отличаться И от PlayID, И от Kassu. Коннект казино — главное действие, но не главный контент (иначе читается как клон PlayID).

## Состояние DS в Figma-файле 1PassApp (durable, 2026-06-12)
Файл `3J7XTajyyGvKLMVWwQaiJk` («Redesign-Application»). Цвето-гайд команды — доска node `72962:270956` (правила ролей цветов — в forge-x.md). Деливери-артефакты: `~/Documents/Claude/Projects/OnePass-token-migration/`.
- **Локальные коллекции переменных:** `palette` (короткие имена `neutral/500`, `brand/500`, `blackWhite/white`, `additional/*`, `opacity/*`, партнёры `brandPartners/*`), `font` (`fontFamily/fontWeight/fontSize/lineHeight`), `space` (4px + gap/padding), `radius` (xs..xxl,max). Имя переменной БЕЗ имени коллекции.
- **«Грязные» `Pallette/*`, `Text/*`, `Buttons/*` и семантика — в ПОДКЛЮЧЁННОЙ библиотеке (доступа нет)**, локально их нет. Поэтому семантику строили локально с нуля.
- **Построено через `use_figma`:** коллекция `theme` (base/inverse, main/tint/text по канону Forge-X, всё алиасами на palette); коллекция `component` для спец-токенов (`input/{fill,fillFocus,fillSelected,disable,stroke,strokeFocus,strokeSelected}`, `icon/{neutral,inverse,brandDark,contrast}`, `text/{contrast,contrastSecondary}`). 6 ступеней палитры досозданы интерполяцией (`positive/700,800`, `warning/700,800`, `negative/400`, `neutral/250`) — ⚠️ СВЕРИТЬ плагином `wallet-x-colors-middle`.
- **Типографика:** 33 текст-стиля привязаны к `font/*`. **Компоненты** (Discovery + UI Kit) перепривязаны заливками+бордерами с примитивов на theme/component — цвет-сохраняюще (0 визуальных изменений).
- **Нейминг §1.1 применён:** 47 компонентов → UpperCamelCase, 121 проп, ~470 значений вариантов, функц. имена структурных слоёв. Решённые edge-кейсы: `Switcher` → `isOn=true/false`; `StatusBar` проп `color→type` (`black/white/topFixed/blockTitle`); бывший дубль `Input` (`83:58983`) → `PasscodeInput`.
- **Live-доски токенов** (пересобраны в стиле гайда, все свотчи привязаны к переменным): `Colors` (`73010:291`) — Palette / Gradient&Opacity / Theme / Component; `Typography` (`73017:13`) — живые сэмплы 33 стилей по группам. Старая `Colors` → `Colors (legacy)` (не удалена); старая Typography-секция удалена.
- **Button (`94:64168`) с переключаемыми иконками:** во всех 40 вариантах слоты `LeftIcon/RightIcon` (IconViewBox), пропы `hasLeftIcon/hasRightIcon` (default off). Размер: lg→24/md→20/sm→16/xs→12; цвет иконки = переменная текста варианта. Все варианты переведены в HUG (чтобы росли под иконку). Глиф по умолчанию `eye`, instance-swap для выбора глифа НЕ добавлен.

---
_Конкретные решения по экрану 1PassApp (Pass Card, списки, блоки и т.д.) НЕ фиксирую как правила — это рабочие решения из сессии редизайна, могут переделываться вручную._
