# Аудит дизайн-токенов OnePass

> Источник: дамп Figma variables. Регистр hex при сравнении игнорируется. Ничего не удаляем — только помечаем «кандидат на слияние/удаление».

---

## 1. Сводка

| Метрика | Кол-во |
|---|---|
| Всего записей в дампе | 213 |
| Примитивы — короткие имена (neutral/*, brand/*, accent/*, additional/*, positive/*, negative/*, warning/* + сырые BillyBets/* и т.п.) | 78 |
| Примитивы — длинные `Pallette/*` | 80 |
| Пары дублей короткое ↔ `Pallette/*` (точное совпадение hex) | 71 |
| Семантические токены (Text/Buttons/Background/Input/Functional/Links/Other/System/Opacity) | 53 |
| Партнёрские бренд-токены (BillyBets, Boomerang, Mr.Pacho) — сырые + `Brand Colors/*` | 16 |
| Типографика / размерные ступени (font*, lineHeight, button, display, lg) | 11 |
| Пустые `""` токены | 23 |
| Опечатки (Pallette) | 80 имён |
| Цвета-выбросы по hue | 1 явный (additional/550 циан) + см. раздел 6 |
| Расхождения значений внутри пар дублей | 0 (все точные) |

---

## 2. Таблица дублей (короткое ↔ Pallette/…)

Все пары совпадают по значению точно (регистр игнорируется). Расхождений значений НЕ найдено — `neutral/950 #080b12` == `Pallette/Neutral/950 #080B12`, проверка пройдена.

### Neutral
| Короткое | Длинное | Hex | Совпадает |
|---|---|---|---|
| Pallette/Neutral/400 (нет короткого `neutral/?` для #8C87B3) — см. примечание | Pallette/Neutral/400 | #8C87B3 | — |
| neutral/25 | Pallette/Neutral/25 | #F4F7FF | да |
| neutral/50 | Pallette/Neutral/50 | #E5EEFF | да |
| neutral/75 | Pallette/Neutral/75 | #E5EBFC | да |
| neutral/100 | Pallette/Neutral/100 | #D0E0FD | да |
| neutral/150 | Pallette/Neutral/150 | #C6DAFF | да |
| neutral/200 | Pallette/Neutral/200 | #AAC6FB | да |
| neutral/300 | Pallette/Neutral/300 | #93B0EC | да |
| neutral/400 | (короткое #7595D5, длинного аналога нет) | #7595D5 | см. примечание |
| neutral/500 | Pallette/Neutral/500 | #5977B2 | да |
| neutral/600 | Pallette/Neutral/600 | #486399 | да |
| neutral/700 | Pallette/Neutral/700 | #334973 | да |
| neutral/800 | Pallette/Neutral/800 | #223252 | да |
| neutral/850 | Pallette/Neutral/850 | #1C283F | да |
| neutral/900 | Pallette/Neutral/900 | #101624 | да |
| neutral/950 | Pallette/Neutral/950 | #080B12 | да |

> Примечание Neutral: значение **#8C87B3** существует только как `Pallette/Neutral/400`, а короткое `neutral/400` имеет **другое** значение **#7595D5**. То есть ступень `400` в двух наборах НЕ совпадает по hex — это коллизия имени, а не дубль. Требует решения владельца: какое значение каноничное для ступени Neutral/400.

### Brand
| Короткое | Длинное | Hex | Совпадает |
|---|---|---|---|
| brand/25 | Pallette/Brand/25 | #F5F9FE | да |
| brand/50 | Pallette/Brand/50 | #EAF5FF | да |
| brand/100 | Pallette/Brand/100 | #D8EBFF | да |
| brand/150 | Pallette/Brand/150 | #C6E2FF | да |
| brand/200 | Pallette/Brand/200 | #B0D7FF | да |
| brand/250 | Pallette/Brand/250 | #83BCF4 | да |
| brand/300 | Pallette/Brand/300 | #71B8FF | да |
| brand/400 | Pallette/Brand/400 | #3198FF | да |
| brand/500 | Pallette/Brand/500 | #0080FF | да |
| brand/600 | Pallette/Brand/600 | #0072ED | да |
| brand/700 | Pallette/Brand/700 | #0058C5 | да |
| brand/800 | Pallette/Brand/800 | #0044A0 | да |
| brand/850 | Pallette/Brand/850 | #00337D | да |
| brand/900 | Pallette/Brand/900 | #00235E | да |
| brand/950 | Pallette/Brand/950 | #00173F | да |

### Accent
| Короткое | Длинное | Hex | Совпадает |
|---|---|---|---|
| accent/50 | Pallette/Accent/50 | #FFE2F0 | да |
| accent/100 | Pallette/Accent/100 | #FFCCE6 | да |
| accent/200 | Pallette/Accent/200 | #FFA6D2 | да |
| accent/300 | Pallette/Accent/300 | #FF87C1 | да |
| accent/400 | Pallette/Accent/400 | #FF51A6 | да |
| accent/500 | Pallette/Accent/500 | #F6077B | да |
| accent/600 | Pallette/Accent/600 | #D9066D | да |
| accent/700 | Pallette/Accent/700 | #C20562 | да |
| accent/750 | Pallette/Accent/750 | #AF0558 | да |
| accent/800 | Pallette/Accent/800 | #9F0450 | да |
| accent/850 | Pallette/Accent/850 | #910449 | да |
| accent/900 | Pallette/Accent/900 | #850443 | да |
| accent/950 | Pallette/Accent/950 | #7A033D | да |

### Green / positive
| Короткое | Длинное | Hex | Совпадает |
|---|---|---|---|
| positive/200 | Pallette/Green/200 | #C6E99A | да |
| positive/300 | Pallette/Green/300 | #ADE06E | да |
| positive/500 | Pallette/Green/500 | #7CCC18 | да |
| positive/600 | Pallette/Green/600 | #5BA313 | да |

### Red / negative
| Короткое | Длинное | Hex | Совпадает |
|---|---|---|---|
| negative/100 | Pallette/Red/100 | #FFCCCC | да |
| negative/200 | Pallette/Red/200 | #FF9999 | да |
| negative/300 | Pallette/Red/300 | #FF6666 | да |
| negative/500 | Pallette/Red/500 | #FF0000 | да |
| negative/600 | Pallette/Red/600 | #CC0000 | да |
| negative/700 | Pallette/Red/700 | #990000 | да |

### Yellow / warning
| Короткое | Длинное | Hex | Совпадает |
|---|---|---|---|
| warning/400 | Pallette/Yellow/400 | #FFF199 | да |
| warning/500 | Pallette/Yellow/500 | #FFDD00 | да |
| warning/600 | Pallette/Yellow/600 | #FFB159 | да |
| warning/900 | Pallette/Yellow/900 | #FF5E00 | да |

### Additional
| Короткое | Длинное | Hex | Совпадает |
|---|---|---|---|
| additional/100 | Pallette/Additional/100 | #D3C9EF | да |
| additional/300 | Pallette/Additional/300 | #AA00FF | да |
| additional/400 | Pallette/Additional/400 | #9C00D2 | да |
| additional/500 | Pallette/Additional/500 | #FF00FF | да |
| additional/550 | Pallette/Additional/550 | #00D4FF | да |
| additional/600 | Pallette/Additional/600 | #5500FF | да |
| additional/625 | Pallette/Additional/625 | #361EE0 | да |
| additional/650 | Pallette/Additional/650 | #1B0F8B | да |

### BlackWhite
| Короткое | Длинное | Hex | Совпадает |
|---|---|---|---|
| black_white/white | Pallette/BlackWhite/White | #FFFFFF | да |
| (нет короткого) | Pallette/BlackWhite/Black | #000000 | — |

**Итого точных пар дублей: 71.** Все короткие имена шкал Neutral/Brand/Accent/Green/Red/Yellow/Additional/BlackWhite — кандидаты на слияние в каноничную группу `Pallette/*` (после переименования по внешнему гайду). Исключение/коллизия: ступень `Neutral/400` (см. примечание выше).

---

## 3. Опечатки

| Что | Должно быть | Кол-во затронутых имён |
|---|---|---|
| `Pallette` | `Palette` | 80 (вся группа `Pallette/*`) |

Других орфографических ошибок в именах не обнаружено. `black_white` vs `BlackWhite` — это скорее стилевой разнобой (snake vs Pascal), а не опечатка; устранится при унификации схемы.

---

## 4. Casing-фиксы

Размерные/типографические ступени названы непоследовательно. Предлагаемый единый вид: **нижний регистр** `xxs / xs / sm / md / lg / xl`; числовые ступени `25–950` оставляем как есть.

| Где | Сейчас | Привести к |
|---|---|---|
| Display | `display/xl` — ок, но в семействе встречается «XL» в верхнем регистре по тексту | `display/xl` (нижний регистр, эталон) |
| Display прочие ступени (md/sm/xs упомянуты в контексте) | смешанные `XL` vs `lg/md/sm/xs` | `display/xl`, `display/lg`, `display/md`, `display/sm`, `display/xs` |
| Buttons | `button/xxs` (нижний), но в контексте есть `XL/LG` (верхний) | `button/xxs`, `button/xs`, `button/sm`, `button/md`, `button/lg`, `button/xl` |
| Paragraph | `Paragraph/Medium/(400)` — суффикс `(400)` в скобках и Title Case | привести группу к единому стилю именования (напр. `paragraph/medium`); сам шрифт Inter НЕ трогаем |
| Одиночный токен | `lg:12` (висит в корне без группы) | перенести в осмысленную группу (`lineHeight/lg` или `spacing/lg`), убрать из корня |

Главное правило: для **буквенных** ступеней — единый нижний регистр; для **числовых** — оставить цифры 25–950.

---

## 5. Пустые токены (`""`)

Всего 23 пустых значения.

| Токен | Рекомендация |
|---|---|
| Buttons/Primary | оставить как стиль (вероятно градиент/композиция) |
| Buttons/Primary-tap | оставить как стиль |
| Buttons/Primary-disable | оставить как стиль |
| Buttons/Secondary | оставить как стиль |
| Buttons/Secondary-tap | оставить как стиль |
| Buttons/secondary-disable | оставить как стиль |
| Buttons/Tertiary | оставить как стиль |
| Buttons/Tertiary-tap | оставить как стиль |
| System/Skeleton | оставить как стиль (анимированный скелетон) |
| Pallette/Gradient/50 … 800 (15 шт.) | оставить как стиль (это градиенты по определению) |
| Brand Colors/BillyBets/200 | заполнить значением (ступень 200 у 50/100 заполнена hex — выглядит как пропущенное значение) |
| Brand Colors/BoomerangCasino/200 | заполнить значением (аналогично) |
| Brand Colors/Mr.Pacho/200 | заполнить значением (аналогично) |
| Brand Colors/Boomerang/200 | заполнить значением ИЛИ удалить дубль-неймспейс — см. прим. |

> Примечание: фигурируют и `Brand Colors/BoomerangCasino/*`, и `Brand Colors/Boomerang/200`. Похоже на два имени одного бренда. Кандидат на слияние неймспейсов Boomerang.
> Замечание: ступени `*/200` у партнёрских брендов пустые во ВСЕХ четырёх — возможно, это намеренный «слот под акцент/градиент». Уточнить у владельца: заполнять hex или оставлять как стиль.

---

## 6. Цвета-выбросы под `additional`

Проверка hue внутри шкал:

| Токен | Hex | Ожидаемый hue группы | Факт | Вердикт |
|---|---|---|---|---|
| additional/550 | #00D4FF | фиолетовый (magenta/violet) | циан/голубой | **ВЫБРОС** — увести/переименовать, не в фиолетовой шкале |
| additional/500 | #FF00FF | — | чистая magenta | ок для additional |
| additional/300 | #AA00FF | — | фиолетовый | ок |
| additional/600 | #5500FF | — | сине-фиолетовый | ок |
| additional/625 | #361EE0 | — | синий-индиго | пограничный, но в ряду к 650 ок |
| additional/650 | #1B0F8B | — | тёмно-синий | ок (хвост шкалы) |
| additional/400 | #9C00D2 | — | фиолетовый | ок |
| additional/100 | #D3C9EF | — | светло-лавандовый | ок |

Проверка соседних шкал на выбросы:
- `warning/Yellow`: ступени 600 `#FFB159` (оранжевый) и 900 `#FF5E00` (оранжево-красный) уходят в оранжевый, тогда как 400/500 — жёлтые. Шкала Yellow фактически «жёлто-оранжевая». Не критично, но отметить: возможен разрыв hue. **Рекомендация: оставить, пометить.**
- `Functional/warning #FFB159` ссылается на этот оранжевый — консистентно с warning/600.
- Остальные шкалы по hue консистентны.

**Главная рекомендация:** `additional/550 #00D4FF` — единственный явный выброс по hue в группе Additional. Вынести в отдельную ступень/группу (например cyan-акцент) согласно правилу «выбросы → additional/другая группа». Поскольку финальные имена задаются внешним гайдом — пока пометить как «кандидат на вынос из фиолетовой шкалы Additional».

---

## 7. Семантические токены → целевой примитив (для алиасов)

Каждый семантический токен должен ссылаться на примитив с тем же значением (вместо хардкода hex). Целевое имя дано в канонической нотации `Pallette/*` (после исправления опечатки станет `Palette/*`).

### Text
| Семантика | Hex | → Примитив |
|---|---|---|
| Text/Primary | #00173F | Pallette/Brand/950 |
| Text/Secondary | #486399 | Pallette/Neutral/600 |
| Text/Contrast primary | #FFFFFF | Pallette/BlackWhite/White |
| Text/Contrast secondary | #D0E0FD | Pallette/Neutral/100 |
| Text/Accent | #0080FF | Pallette/Brand/500 |

### Background
| Семантика | Hex | → Примитив |
|---|---|---|
| Background/primary | #FFFFFF | Pallette/BlackWhite/White |
| Background/secondary | #F5F9FE | Pallette/Brand/25 |
| Background/tertiary | #EEECFF | нет точного примитива — **создать/привязать** (близок, но не равен Neutral/Brand) |
| Background/fourth | #D8EBFF | Pallette/Brand/100 |
| Background/contrast primary | #5977B2 | Pallette/Neutral/500 |
| Background/contrast secondary | #93B0EC | Pallette/Neutral/300 |
| Background/contrast fourth | #AAC6FB | Pallette/Neutral/200 |
| Background/popup background | #101624 | Pallette/Neutral/900 |

### Buttons (резолвимые значения)
| Семантика | Hex | → Примитив |
|---|---|---|
| Buttons/tertiary-disable | #D0E0FD | Pallette/Neutral/100 |
| Buttons/Text bright | #FFFFFF | Pallette/BlackWhite/White |
| Buttons/Text middle | #5977B2 | Pallette/Neutral/500 |
| Buttons/Text dark | #223252 | Pallette/Neutral/800 |
| (Buttons/Primary..Tertiary-tap) | "" | стили — алиас не применим |

### Input
| Семантика | Hex | → Примитив |
|---|---|---|
| Input/Fill | #FFFFFF | Pallette/BlackWhite/White |
| Input/Fill focus | #FFFFFF | Pallette/BlackWhite/White |
| Input/fill selected | #E5EEFF | Pallette/Neutral/50 |
| Input/Disable | #E5EBFC | Pallette/Neutral/75 |
| Input/Stroke | #93B0EC | Pallette/Neutral/300 |
| Input/stroke focus | #3198FF | Pallette/Brand/400 |
| Input/Stroke selected | #0080FF | Pallette/Brand/500 |

### Functional
| Семантика | Hex | → Примитив |
|---|---|---|
| Functional/Done | #5BA313 | Pallette/Green/600 |
| Functional/warning | #FFB159 | Pallette/Yellow/600 |
| Functional/Error | #FF0000 | Pallette/Red/500 |
| Functional/Alert | #FF6666 | Pallette/Red/300 |
| Functional/Info | #FFA6D2 | Pallette/Accent/200 |

### Links
| Семантика | Hex | → Примитив |
|---|---|---|
| Links/Primary | #F6077B | Pallette/Accent/500 |
| Links/Primary-tap | #FF87C1 | Pallette/Accent/300 |
| Links/Alert | #FF0000 | Pallette/Red/500 |

### Other (иконки)
| Семантика | Hex | → Примитив |
|---|---|---|
| Other/icon25 | #0080FF | Pallette/Brand/500 |
| Other/icon50 | #00337D | Pallette/Brand/850 |
| Other/icon100 | #AAC6FB | Pallette/Neutral/200 |
| Other/icon400 | #F6077B | Pallette/Accent/500 |
| Other/icon800 | #FFFFFF | Pallette/BlackWhite/White |
| Other/icon1000 | #101624 | Pallette/Neutral/900 |

### Opacity (полупрозрачные — алиас + альфа)
| Семантика | Hex (с альфой) | База/примитив |
|---|---|---|
| opacity/25 | #F4F7FF59 | Pallette/Neutral/25 + ~35% |
| Opacity/25-White 10% | #F4F7FF | Pallette/Neutral/25 (метка «White 10%» не совпадает с базой — проверить) |
| opacity/75 | #FFFFFF33 | White + 20% |
| Opacity/75-White 20% | #FFFFFF | Pallette/BlackWhite/White |
| opacity/50 | #5BA3131A | Pallette/Green/600 + 10% |
| Opacity/50-Positive10% | #5BA313 | Pallette/Green/600 |
| opacity/100 | #FF000066 | Pallette/Red/500 + 40% |
| Opacity/100-Error 40% | #FF0000 | Pallette/Red/500 |
| opacity/150 | #FF000033 | Pallette/Red/500 + 20% |
| Opacity/150-Error 20% | #FF0000 | Pallette/Red/500 |

> Замечание по Opacity: пары `opacity/*` (с альфой в hex) и `Opacity/*-...` (база без альфы, метка в имени) — фактически дублирующие наборы. Кандидат на унификацию: хранить как алиас примитива + отдельный токен прозрачности.

> Прочая семантика без точного примитива: **Text/Contrast secondary OK**, но `Background/tertiary #EEECFF` и `Buttons/tertiary-disable` стоит сверить — `#EEECFF` не равен ни одному примитиву в дампе (выброс семантики, требует базового токена).

---

## 8. Партнёрские бренды → отдельная коллекция

Вынести из ядра в отдельную коллекцию/группу (напр. `Partners/*`):

| Токен | Hex |
|---|---|
| BillyBets/50 | #751925 |
| Brand Colors/BillyBets/50 | #751925 |
| BillyBets/100 | #3F010A |
| Brand Colors/BillyBets/100 | #3F010A |
| Brand Colors/BillyBets/200 | "" |
| BoomerangCasino/50 | #3B3737 |
| Brand Colors/BoomerangCasino/50 | #3B3737 |
| BoomerangCasino/100 | #0D1014 |
| Brand Colors/BoomerangCasino/100 | #0D1014 |
| Brand Colors/BoomerangCasino/200 | "" |
| Pacho/50 | #365BFF |
| Brand Colors/Mr.Pacho/50 | #365BFF |
| Pacho/100 | #04005E |
| Brand Colors/Mr.Pacho/100 | #04005E |
| Brand Colors/Mr.Pacho/200 | "" |
| Brand Colors/Boomerang/200 | "" |

Внутри партнёрских — те же дубли «короткое ↔ Brand Colors/…» (BillyBets/50 == Brand Colors/BillyBets/50 и т.д.). Кандидаты на слияние. Также свести `BoomerangCasino` и `Boomerang` к одному неймспейсу.

---

## Чеклист действий по приоритету

1. **[P1] Исправить опечатку** `Pallette → Palette` во всех 80 именах.
2. **[P1] Разрешить коллизию Neutral/400** (#8C87B3 vs #7595D5) — решение владельца, какое значение каноничное.
3. **[P1] Слить 71 пару дублей** короткое ↔ `Palette/*` (пометить короткие как кандидатов на устранение; финальные имена — по гайду Framy/ForgeX).
4. **[P2] Вынести партнёрские бренды** (16 токенов) в отдельную коллекцию `Partners/*`; свести Boomerang/BoomerangCasino.
5. **[P2] Привязать семантику к примитивам** (раздел 7) — заменить хардкод hex на алиасы.
6. **[P2] Унифицировать casing ступеней** (display/button/paragraph) к нижнему регистру xs–xl; числа 25–950 оставить; вынести бесхозный `lg:12`.
7. **[P3] Разобрать additional/550 #00D4FF** — вынести циан из фиолетовой шкалы.
8. **[P3] Уточнить пустые `*/200`** партнёрских брендов: заполнить или оставить как стиль.
9. **[P3] Унифицировать Opacity** — два параллельных набора свести к алиас+альфа.
10. **[P3] Базовый токен для `#EEECFF`** (Background/tertiary) — не имеет примитива.

> Напоминание: ничего не удаляем без подтверждения владельца. Все пункты — «кандидат на слияние/вынос/правку».
