# Спек миграции ТИПОГРАФИКИ OnePass → схема именования ForgeX

> Принцип: **значения НЕ меняем**. Семейство `Plus Jakarta Sans`, размеры, начертания (weight), letter-spacing остаются как в Figma OnePass. Меняются только **имена/структура** под схему ForgeX.
>
> Регистр размерных ступеней — нижний (`xxs/xs/sm/md/lg/xl`), у OnePass уже так. Ничего не удаляем; пустоты у `bodyRegular` (только `sm`) не достраиваем.
>
> **ВАЖНО про API Figma:** разделяем два слоя.
> - **VARIABLES** — примитивы `fontFamily/*`, `fontWeight/*`, `fontSize/*`, `lineHeight/*` (Figma Variables API).
> - **TEXT STYLES** — композитные стили `group/size` (Figma Text Styles API, отдельный от Variables). Мигрируются как rename text style.
>
> Маппинг групп ForgeX (гайд §3.1): display, headline, title, button, label, body, bodyStrong. У OnePass нет `label` → не создаём. У OnePass есть `bodyMedium` → у ForgeX такой группы нет → оставляем как расширение OnePass.

---

## 1. ПРИМИТИВЫ (VARIABLES) — что менять / что уже ок

Сравнение нейминга OnePass с форматом ForgeX (`fontSize/25`, `lineHeight/50`, `fontFamily/<group>`, `fontWeight/<group>`).

### 1.1 fontFamily/* (variable, тип `string`/`fontFamily`)
ForgeX использует ключи вида `fontFamily/<group>`. У OnePass — те же ключи. **Нейминг уже соответствует ForgeX — переименование не требуется.** Значение у всех = `"Plus Jakarta Sans"` (не меняем; у ForgeX-эталона Inter, но политика владельца — семейство OnePass сохраняем).

| Имя OnePass | Имя ForgeX | Значение | Статус |
|---|---|---|---|
| fontFamily/display | fontFamily/display | Plus Jakarta Sans | уже соответствует, rename не нужен |
| fontFamily/headline | fontFamily/headline | Plus Jakarta Sans | уже соответствует, rename не нужен |
| fontFamily/title | fontFamily/title | Plus Jakarta Sans | уже соответствует, rename не нужен |
| fontFamily/button | fontFamily/button | Plus Jakarta Sans | уже соответствует, rename не нужен |
| fontFamily/body | fontFamily/body | Plus Jakarta Sans | уже соответствует, rename не нужен |

### 1.2 fontWeight/* (variable, тип `number`/`fontWeight`)
ForgeX-формат — `fontWeight/<group>`. Ключи OnePass совпадают. **Уже соответствует — rename не требуется.** Исключение: OnePass имеет три body-веса (`bodyRegular`, `bodyStrong`, `bodyMedium`) вместо одного — это следствие расширения групп body (см. §3). Ключи остаются как есть.

| Имя OnePass | Имя ForgeX | Значение | Статус |
|---|---|---|---|
| fontWeight/display | fontWeight/display | Bold (700) | уже соответствует, rename не нужен |
| fontWeight/headline | fontWeight/headline | Bold (700) | уже соответствует, rename не нужен |
| fontWeight/title | fontWeight/title | Bold (700) | уже соответствует, rename не нужен |
| fontWeight/button | fontWeight/button | Extra Bold Italic (800) | уже соответствует, rename не нужен |
| fontWeight/bodyRegular | fontWeight/bodyRegular | Regular (400) | уже соответствует, rename не нужен (расширение body, см. §3) |
| fontWeight/bodyStrong | fontWeight/bodyStrong | Bold (700) | уже соответствует, rename не нужен |
| fontWeight/bodyMedium | fontWeight/bodyMedium | Medium (500) | уже соответствует, rename не нужен (расширение OnePass, §4) |

### 1.3 fontSize/* (variable, тип `number`/`fontSize`)
ForgeX-формат — числовые ступени `fontSize/<step>` (`fontSize/25`, `fontSize/50`…). Ключи OnePass идентичны. **Уже соответствует — rename не требуется.**

| Имя OnePass | Имя ForgeX | Значение px | Статус |
|---|---|---|---|
| fontSize/25 | fontSize/25 | 10 | уже соответствует |
| fontSize/50 | fontSize/50 | 12 | уже соответствует |
| fontSize/100 | fontSize/100 | 14 | уже соответствует |
| fontSize/150 | fontSize/150 | 16 | уже соответствует |
| fontSize/200 | fontSize/200 | 18 | уже соответствует |
| fontSize/250 | fontSize/250 | 20 | уже соответствует |
| fontSize/300 | fontSize/300 | 22 | уже соответствует |
| fontSize/350 | fontSize/350 | 24 | уже соответствует |
| fontSize/400 | fontSize/400 | 28 | уже соответствует |
| fontSize/450 | fontSize/450 | 32 | уже соответствует |

### 1.4 lineHeight/* (variable, тип `number`/`lineHeight`)
ForgeX-формат — числовые ступени `lineHeight/<step>` (`lineHeight/50`…). Ключи OnePass идентичны. **Уже соответствует — rename не требуется.**

| Имя OnePass | Имя ForgeX | Значение px | Статус |
|---|---|---|---|
| lineHeight/50 | lineHeight/50 | 12 | уже соответствует |
| lineHeight/75 | lineHeight/75 | 16 | уже соответствует |
| lineHeight/100 | lineHeight/100 | 18 | уже соответствует |
| lineHeight/125 | lineHeight/125 | 20 | уже соответствует |
| lineHeight/150 | lineHeight/150 | 22 | уже соответствует |
| lineHeight/200 | lineHeight/200 | 24 | уже соответствует |
| lineHeight/250 | lineHeight/250 | 28 | уже соответствует |
| lineHeight/300 | lineHeight/300 | 32 | уже соответствует |
| lineHeight/350 | lineHeight/350 | 36 | уже соответствует |

> **Итог по примитивам:** все 4 семейства variables (fontFamily 5, fontWeight 7, fontSize 10, lineHeight 9 = 31 переменная) **уже соответствуют формату нейминга ForgeX — переименование не требуется**, только зафиксировать соответствие. Значения не трогаем.

---

## 2. КОМПОЗИТНЫЕ СТИЛИ (TEXT STYLES) — rename old → new ForgeX-путь

Формат ForgeX text style: `typography/<group>/<size>`. У OnePass стили названы `group/size`. Меняем только путь (добавляем префикс `typography/` и применяем маппинг групп §3). Значения size/lineHeight/letterSpacing/weight — без изменений.

Формат значения: `fontSize/lineHeight, ls<N>` (px), weight в скобках.

### 2.1 display → typography/display (weight 700)
| Старое имя | Новое имя ForgeX | Значение | Тип | Комментарий |
|---|---|---|---|---|
| display/xs | typography/display/xs | 20/24, ls0 (700) | textStyle | |
| display/sm | typography/display/sm | 22/24, ls0 (700) | textStyle | |
| display/md | typography/display/md | 24/28, ls1 (700) | textStyle | |
| display/lg | typography/display/lg | 28/32, ls2 (700) | textStyle | |
| display/xl | typography/display/xl | 32/36, ls2 (700) | textStyle | |

### 2.2 headline → typography/headline (weight 700, ls0)
| Старое имя | Новое имя ForgeX | Значение | Тип | Комментарий |
|---|---|---|---|---|
| headline/xs | typography/headline/xs | 12/16, ls0 (700) | textStyle | |
| headline/sm | typography/headline/sm | 14/18, ls0 (700) | textStyle | |
| headline/md | typography/headline/md | 16/20, ls0 (700) | textStyle | |
| headline/lg | typography/headline/lg | 18/24, ls0 (700) | textStyle | |
| headline/xl | typography/headline/xl | 20/24, ls0 (700) | textStyle | |

### 2.3 title → typography/title (weight 700, ls0)
| Старое имя | Новое имя ForgeX | Значение | Тип | Комментарий |
|---|---|---|---|---|
| title/xs | typography/title/xs | 12/16, ls0 (700) | textStyle | |
| title/sm | typography/title/sm | 14/16, ls0 (700) | textStyle | |
| title/md | typography/title/md | 16/20, ls0 (700) | textStyle | |
| title/lg | typography/title/lg | 18/24, ls0 (700) | textStyle | |
| title/xl | typography/title/xl | 24/28, ls0 (700) | textStyle | |

### 2.4 button → typography/button (weight 800 Extra Bold Italic, ls0)
| Старое имя | Новое имя ForgeX | Значение | Тип | Комментарий |
|---|---|---|---|---|
| button/xs | typography/button/xs | 12/16, ls0 (800 EB Italic) | textStyle | |
| button/sm | typography/button/sm | 14/16, ls0 (800 EB Italic) | textStyle | |
| button/md | typography/button/md | 16/22, ls0 (800 EB Italic) | textStyle | |
| button/lg | typography/button/lg | 18/24, ls0 (800 EB Italic) | textStyle | |
| button/xl | typography/button/xl | 20/24, ls0 (800 EB Italic) | textStyle | |

### 2.5 bodyRegular → typography/body (weight 400) — только sm
| Старое имя | Новое имя ForgeX | Значение | Тип | Комментарий |
|---|---|---|---|---|
| bodyRegular/sm | typography/body/sm | 14/18, (400) | textStyle | В файле OnePass присутствует **только sm**. Остальные размеры не достраиваем (решение §5). |

### 2.6 bodyStrong → typography/bodyStrong (weight 700, ls0)
| Старое имя | Новое имя ForgeX | Значение | Тип | Комментарий |
|---|---|---|---|---|
| bodyStrong/xxs | typography/bodyStrong/xxs | 10/12, ls0 (700) | textStyle | |
| bodyStrong/xs | typography/bodyStrong/xs | 12/16, ls0 (700) | textStyle | |
| bodyStrong/sm | typography/bodyStrong/sm | 14/18, ls0 (700) | textStyle | |
| bodyStrong/md | typography/bodyStrong/md | 16/20, ls0 (700) | textStyle | |
| bodyStrong/lg | typography/bodyStrong/lg | 18/22, ls0 (700) | textStyle | |
| bodyStrong/xl | typography/bodyStrong/xl | 20/24, ls0 (700) | textStyle | |

### 2.7 bodyMedium → typography/bodyMedium (расширение OnePass, см. §4)
| Старое имя | Новое имя ForgeX | Значение | Тип | Комментарий |
|---|---|---|---|---|
| bodyMedium/xxs | typography/bodyMedium/xxs | 10/12, ls0 (500) | textStyle | расширение OnePass |
| bodyMedium/xs | typography/bodyMedium/xs | 12/16, ls0 (500) | textStyle | расширение OnePass |
| bodyMedium/sm | typography/bodyMedium/sm | 14/18, ls0 (500) | textStyle | расширение OnePass |
| bodyMedium/md | typography/bodyMedium/md | 16/20, ls0 (500) | textStyle | расширение OnePass |
| bodyMedium/lg | typography/bodyMedium/lg | 18/22, ls0 (500) | textStyle | расширение OnePass |
| bodyMedium/xl | typography/bodyMedium/xl | 20/24, ls0 (500) | textStyle | расширение OnePass |

> **Итого text styles к переименованию: 34** (display 5, headline 5, title 5, button 5, body 1, bodyStrong 6, bodyMedium 6).

---

## 3. Маппинг групп OnePass → ForgeX

| OnePass | ForgeX | Решение |
|---|---|---|
| display | display | прямое соответствие |
| headline | headline | прямое соответствие |
| title | title | прямое соответствие |
| button | button | прямое соответствие |
| bodyRegular | **body** | `bodyRegular`→`body` (Regular 400 = дефолт body в ForgeX). У OnePass только `sm`. |
| bodyStrong | bodyStrong | совпадает с ForgeX напрямую |
| bodyMedium | **bodyMedium** (расширение) | у ForgeX группы нет → оставляем как расширение OnePass (§4) |
| — (label) | label | у OnePass нет → **НЕ создаём**, мигрировать нечего |

---

## 4. Расширения OnePass (сверх ядра ForgeX)

- **typography/bodyMedium/{xxs,xs,sm,md,lg,xl}** (weight 500) — у ядра ForgeX группы `bodyMedium` нет. По решению владельца (OnePass — отдельный продукт, расширенные ключи сохраняем) группа **остаётся** под ForgeX-нэймингом `typography/bodyMedium/<size>`. Это намеренное расширение, не дефект.
- Сопутствующий примитив `fontWeight/bodyMedium` (500) — также сохраняется как расширение.

---

## 5. Что НЕ трогаем

- **Значения** — Plus Jakarta Sans, все размеры (fontSize 10–32), все lineHeight (12–36), все веса (400/500/700/800 EB Italic), letter-spacing (ls0/ls1/ls2). Без изменений.
- **Пустоты `bodyRegular`** — присутствует только `sm`; остальные размеры **не достраиваем и не удаляем**.
- **Группа `label`** — у OnePass отсутствует, **не создаём**.
- **Примитивы variables** — нейминг уже = ForgeX, **не переименовываем** (только фиксация соответствия).

---

## 6. Spacing / Radius / Shadows — НЕ часть этой миграции

В OnePass токенов spacing, radius и shadows **нет** (значения захардкожены в компонентах). Это **отдельный проект токенизации**, не входящий в данную миграцию типографики. Что потребовалось бы для него (вне scope):

- **Spacing:** вывести шкалу отступов из хардкода (паддинги/гэпы в компонентах), свести к сетке (напр. 4px-сетка ForgeX), завести переменные `spacing/<step>`, перебиндить компоненты с raw-значений на переменные.
- **Radius:** вывести шкалу скруглений из хардкода, завести `radius/<xs…xl/max>` по ForgeX, перебиндить border-radius компонентов.
- **Shadows / effects:** вывести параметры теней из стилей/хардкода, завести `effects`/`shadow/*` коллекции (как proposals в ForgeX), перебиндить.

Это самостоятельный followup-проход; в текущей миграции не выполняется.

---

## 7. Сводка по числам

- **Примитивы (variables): 31** — fontFamily 5, fontWeight 7, fontSize 10, lineHeight 9. Все **уже соответствуют формату ForgeX, rename не требуется**.
- **Композитные стили (text styles): 34 переименования** — display 5, headline 5, title 5, button 5, body 1 (только sm из bodyRegular), bodyStrong 6, bodyMedium 6.
- **Маппинг групп:** display/headline/title/button — прямые; bodyRegular→body; bodyStrong→bodyStrong; bodyMedium — расширение OnePass; label — не мигрируется (нет в OnePass).
- **Spacing/Radius/Shadows:** в OnePass отсутствуют — отдельный проект токенизации, не часть этой миграции.
