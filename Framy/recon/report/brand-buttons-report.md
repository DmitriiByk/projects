# Отчёт распознавания брендовых кнопок — новый подход (recon → strategy)

Прогон петли `dumpSignals()` → `mapStrategy()` по всем неповторяющимся типам кнопок двух брендов.
Файл: ForgeX | Library (`natBqfvZvRAk2RrvPIpBmo`). Скрины эталонов — по ссылкам на узлы (открыть в Figma).

Режим: **copy** (прод). Состояния у всех: default / hovered / pressed / disabled / loading → везде даёт T14.

---

## Главное: что новый подход поймал, а глазами раньше упускалось

- **Vegas Hero — тот самый провал.** Кнопки скошенные (параллелограмм): сегменты `Left/Center/Right`
  нарисованы вектор-`Polygon`, фон вынесен в `CtaPrimaryBg/SecondaryBg/TertiaryBg`. Старое «на глаз»
  распознавание не видело здесь 3-слайс. Новый детектор ловит это по part-наименованию и polygon-
  сегментам → `is_three_slice + is_angled_shape` (урок **L4**).
- **Dragonia 3-слайс был ложноотрицательным** в первом прогоне (`is_three_slice:false`), потому что
  сегменты названы `part=left/middle/right`, а детектор ждал `=l/=c/=r`. Тот же L4 это исправил —
  детектор обновлён и перепроверен.
- **Реюз честно виден из дампа:** `reuse_candidates` показывают общие части (`part=…`, `deposit`,
  `variant=regular`) → в режиме copy сперва переиспользуем их, приёмы — только для остального.

---

## Dragonia  ·  узел `168693:130090` (set `168691:124473`)

Материал: растровая база + градиентные акценты, мягкая тень-отрыв, орнамент-вектор. 3-слайс через
`part=left/middle/right`. quaternary — облегчённый плоский.

| Тип | node (md/default) | Ключевые флаги | Стратегия (приёмы) |
|---|---|---|---|
| primary | `168691:124812` | 3-slice, raster, gradient, lift-shadow, ornament | **T1, T2, T8, T9, T11, T14** |
| secondary | `168691:124720` | 3-slice, raster, gradient, lift-shadow, ornament | **T1, T2, T8, T9, T11, T14** |
| tertiary | `168691:124628` | 3-slice, raster, gradient, lift-shadow, ornament | **T1, T2, T8, T9, T11, T14** |
| quaternary | `168691:124538` | flat, lift-shadow, ornament (без 3-slice/градиента) | **T9, T11, T14** |

## Vegas Hero  ·  узел `168693:130089` (set `168693:127617`)

Материал: металл + **скос** (полигоны) + текстурный оверлей + градиентный sheen. 5 типов.
quaternary — плоский вдавленный (inner+lift shadow), без скоса.

| Тип | node (md/default) | Ключевые флаги | Стратегия (приёмы) |
|---|---|---|---|
| primary | `168693:127621` | 3-slice, **angled**, metallic, texture, gradient, ornament | **T1, T9-skew, T8, T7, T9, T14** |
| secondary | `168693:127696` | 3-slice, **angled**, metallic, texture, gradient, ornament | **T1, T9-skew, T8, T7, T9, T14** |
| tertiary | `168693:127776` | 3-slice, **angled**, metallic, texture, gradient, ornament | **T1, T9-skew, T8, T7, T9, T14** |
| quaternary | `168693:127889` | 3-slice, flat, inner-shadow + lift-shadow (вдавленный) | **T1, T9, T11, T14** |
| quinary | `168693:128134` | 3-slice, **angled**, metallic, texture, gradient, lift, ornament | **T1, T9-skew, T8, T7, T9, T11, T14** |

---

## Легенда приёмов (build-game-ui)
- **T1** 3-слайс (углы FIXED / центр FILL) · **T9-skew** скошенные сегменты вектор-полигонами
- **T2** растровый фон 9-slice CROP · **T8** металл-рама (концентрические градиент-rect)
- **T7** текстурный/FX-оверлей на бленде · **T9** вектор-орнамент/уголки
- **T11** тень-отрыв (выдавлено) / inner-shadow (вдавлено) · **T14** состояния через компонент-сет

## Как читать
По каждому типу: профиль снят дампом (не на глаз), стратегия выведена детерминированно из флагов.
В режиме copy перед сборкой переиспользуются `reuse_candidates`; при неполном совпадении — вопрос
оператору (reuse / clone+доработка / собрать заново). На Standard/Low-Custom tier богатый набор
схлопнулся бы до rung 1-3 (token fill+stroke+radius).

> Скрины эталонов недоступны для скачивания из песочницы (сетевое ограничение) — смотри узлы прямо в
> Figma по `node-id` выше.
