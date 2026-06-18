# theme vs канон (гайд Forge-X) — расхождения

Канон (из Guide, Step3–6):
- **base / inverse** — якоря, выбираются.
- **main/<family>/{l200, l100, base, d100, d200, contrast}** — заливки; base из палитры, l/d по ±100/200, contrast — текст/иконка на заливке.
- **tint/<family>/{50, 100, 150, 200, 250, 300}** — фоны и **бордеры**; формула base+N.
- **text/neutral/{100, 200, 300, 400}** + **text/<colored>/{l200, base, d200}** — текст и иконки.

Мой `theme` сейчас = 39 токенов, собран под фактические значения библиотеки (цвет-сохраняюще), поэтому шкала неполная и есть неканон-имена.

---

## 1. base / inverse — ✅ ок
`base`, `inverse` — соответствуют канону.

## 2. main — неполные шкалы (канон хочет l200·l100·base·d100·d200·contrast на семейство)

| family | есть | не хватает по канону |
|---|---|---|
| neutral | l200, l100, base, d200, contrast | **d100** |
| brand | l100, base | **l200, d100, d200, contrast** |
| accent | l200, base | **l100, d100, d200, contrast** |
| positive | base | **l200, l100, d100, d200, contrast** |
| warning | base | **l200, l100, d100, d200, contrast** |
| negative | l200, base | **l100, d100, d200, contrast** |

`info` — в каноне есть, но в OnePass нет палитры info (Functional/Info = accent/200), так что не применимо.

## 3. tint — шкала не по канону

| family | есть у меня | канон 50/100/150/200/250/300 |
|---|---|---|
| neutral | 50, **75**, 200, 300, **500**, **900** | не хватает **100, 150, 250**; лишние неканон **75, 500, 900** |
| brand | 50, 100 | не хватает 150, 200, 250, 300 |
| accent | 200 | не хватает 50, 100, 150, 250, 300 |
| additional | 100 | (additional — расширение OnePass, не канон-семейство) |

Плюс неканон-имена: **`tint/neutral/inputFill`**, **`tint/neutral/inputFillFocus`** (оба = white) — это не часть tint-шкалы, а инпут-специфика.

**Формула base+N (base = white #ffffff ≈ neutral 0):**
`tint/neutral/50→neutral/50`, `/100→neutral/100`, `/150→neutral/150`, `/200→neutral/200`, `/300→neutral/300`. Только **`tint/neutral/250`** не имеет точной ступени в палитре (нет `neutral/250`) → нужен либо новый `neutral/250`, либо ближайший. Для бордеров важны 100/150/200 — они есть точно.

## 4. text — частично канон, много неканон-имён

| family | есть у меня | канон |
|---|---|---|
| neutral | 100, 300, **contrast**, **contrastSecondary**, **iconNeutral**, **iconInverse** | канон 100/200/300/400 → не хватает **200, 400**; жирным — неканон (icon/contrast-расширения OnePass) |
| brand | base, **iconBrand**, **iconBrandDark** | канон l200/base/d200 → не хватает **l200, d200**; жирным — неканон |
| accent | **icon** | канон l200/base/d200 → не хватает все; `icon` — неканон |
| contrast | **icon** | семейства `contrast` в каноне нет |

## 5. links/alert — неканон
Группы `links` в каноне нет. `links/alert` (= negative/500) по канону должен быть `text/negative/*` или `main/negative/*`.

---

## Что предлагаю (с учётом «считать tint по формуле base+N»)

1. **tint** — добить до канона `50/100/150/200/250/300` по формуле от base; неканон `75/500/900` пометить как extra или убрать; `inputFill/inputFillFocus` вынести из tint.
2. **Бордеры** — перепривязать на `tint/neutral/*` (для текущих `neutral/100`, `neutral/150` — цвет-сохраняюще: `tint/neutral/100`, `tint/neutral/150`).
3. **main** — достроить недостающие l/d/contrast по формуле ±100/200 (опционально, нужно для состояний компонентов hover/pressed).
4. **text** — добить канон-ступени (text/neutral/200,400; text/colored/l200,d200); icon/contrast-имена оставить как расширения OnePass или переименовать.
5. **links/alert** — решить: оставить расширением или увести в `text/negative` / `main/negative`.

Существующие 120 перепривязок цвет-верны; при доводке шкалы часть ярлыков уточнится (например бордеры уедут на tint).
