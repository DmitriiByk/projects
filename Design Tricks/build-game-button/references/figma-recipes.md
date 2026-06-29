# Код-рецепты use_figma (Plugin API)

ВАЖНО: `use_figma` исполняет JS в контексте файла. Любая ошибка = откат всей транзакции.
Возврата значений наружу НЕТ — id новых нод узнавай через текст-слой + `get_screenshot`.

## Грабли (запомнить)
- `constraints.horizontal/vertical` ∈ `MIN|CENTER|MAX|STRETCH|SCALE` (НЕ TOP/BOTTOM).
- `cornerRadius`/`strokeWeight` бывают `figma.mixed` (symbol) — приводи безопасно.
- Paint для fills — ОБЪЕКТ `{type:"SOLID",color:{r,g,b},opacity}` (не сам цвет!). gradientStops:
  `{position, color:{r,g,b,a}}`.
- COMPONENT/COMPONENT_SET часто рендерятся в `get_screenshot` как 1×1 → снимай ИНСТАНС.
- `combineAsVariants(comps,parent)` — компоненты и parent на ОДНОЙ странице (сперва `parent.appendChild(comp)`),
  имена вариантов `"State=Default"` и т.п.
- `createComponentFromNode(frame)` — превратить готовый фрейм в компонент (для сборки вариантов).
- `figma.base64Decode` СТРОГИЙ (может отвергнуть валидный base64) → используй свой декодер `b64d`.

## Хелперы
```js
const rgba=(h,a)=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255,a:a==null?1:a});
const solid=(h,a)=>({type:"SOLID",color:rgba(h),opacity:a==null?1:a});
const vGrad=(s)=>({type:"GRADIENT_LINEAR",gradientTransform:[[0,1,0],[-1,0,1]],gradientStops:s}); // вертикаль top→bottom
const hGrad=(s)=>({type:"GRADIENT_LINEAR",gradientTransform:[[1,0,0],[0,1,0]],gradientStops:s}); // горизонталь
```

## Дамп значений оригинала (узнать факты)
Прочитай нужные ноды и запиши в текст-слой внутри известного фрейма, потом `get_screenshot` этого фрейма.
Выводи: `name,type,opacity,blendMode,WxH`, fills (тип/scaleMode/imageHash или стопы), strokes+weight,
effects (type/color/offset/radius/spread), `vectorPaths[].data.length`. Для mixed — `typeof v==='symbol'?'mixed':v`.

## Узнать id новой ноды
```js
let t=F.findOne(n=>n.name==="__id"); if(!t){t=figma.createText();t.name="__id";F.appendChild(t);}
await figma.loadFontAsync({family:"Inter",style:"Semi Bold"}); t.fontName={family:"Inter",style:"Semi Bold"};
t.characters="ID="+node.id; t.x=20; t.y=2;  // затем get_screenshot фрейма и прочитать; в конце t.remove()
```

## Растягиваемый фон в auto-layout-кнопке
```js
bg.layoutPositioning="ABSOLUTE"; bg.constraints={horizontal:"STRETCH",vertical:"STRETCH"};
bg.x=0; bg.y=0; bg.resize(btn.width,btn.height);
// label — обычный in-flow ребёнок (Hug), он задаёт ширину кнопки
btn.layoutMode="HORIZONTAL"; btn.primaryAxisSizingMode="AUTO"; btn.counterAxisSizingMode="FIXED";
lab.layoutSizingHorizontal="HUG"; lab.layoutSizingVertical="HUG"; // высота кнопки — паддингом, не Fixed
```

## 9-slice растра через CROP (T2)
```js
const crop=(L,cw)=>({type:"IMAGE",scaleMode:"CROP",imageHash:IH,imageTransform:[[cw,0,L],[0,1,0]]});
// capL: crop(0,CAP) FIXED; center: crop(CAP, 1-2*CAP) FILL; capR: crop(1-CAP,CAP) FIXED
```

## Многослойная рамка (T8)
Концентрические `figma.createRectangle()` с cornerRadius и инсетами (1.5/3.5/5.5), у каждого vGrad,
`constraints {STRETCH,STRETCH}`; сверху панель; затем текст. Рейл — рамка с `strokeTopWeight/strokeBottomWeight`,
`strokeLeftWeight=strokeRightWeight=0`, `strokes=[vGrad gold→dark]`.

## Зеркало ноды (T9)
```js
oR.relativeTransform=[[-1,0,rx+62],[0,1,0]]; // rx — левый x места правого орнамента
```
ВАЖНО (углы + респонсив): `relativeTransform`-зеркало КОНФЛИКТУЕТ с `constraints` (зеркальная нода
не пинится к MAX-краю при ресайзе). Для 4 угловых ассетов, которые должны держаться по углам при
растяжении, зеркаль ВНУТРИ SVG (`createNodeFromSvg`) через `<g transform="translate(W,0) scale(-1,1)">`
— нода остаётся НЕ-трансформированной (обычный фрейм), поэтому `constraints:MIN/MAX` работают штатно.
4 угла: TL `""`, TR `translate(40,0) scale(-1,1)`, BL `translate(0,40) scale(1,-1)`, BR `translate(40,40) scale(-1,-1)`.
Тени направленно: верхние вниз (0,+1), нижние вверх (0,−1). (Минус: вертикальный флип переворачивает и
градиент освещения — для мелких углов терпимо; для крупных давай градиент в objectBoundingBox или рисуй 2 версии.)

## Состояния → компонент-сет (T14)
```js
function mk(state){ const c=figma.createComponent(); c.name="State="+state; /* layout+слои */ F.appendChild(c); return c; }
const def=mk("Default"), hov=mk("Hover"), act=mk("Active"), dis=mk("Disable");
const set=figma.combineAsVariants([def,hov,act,dis],F); set.name="MyButton";
set.layoutMode="VERTICAL"; set.itemSpacing=40; set.paddingTop=40; /* витрина */
```

## GIF-фон + анимация только на hover (T13)
1) Сгенерь GIF фона БЕЗ текста (внешние либы в песочнице: Pillow). Компактный (<~35KB →
   base64 влезает в лимит кода use_figma ~50000). Узел сам обрежет по rounded-форме (clipsContent),
   поэтому GIF можно делать непрозрачным прямоугольником.
2) Загрузка: `upload_assets` POST из песочницы может блокироваться прокси (403). Надёжно — вшить
   байты в use_figma:
```js
function b64d(s){var C='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';var lk=new Uint8Array(256);for(var i=0;i<C.length;i++)lk[C.charCodeAt(i)]=i;var n=s.length,pad=s[n-1]==='='?(s[n-2]==='='?2:1):0;var out=new Uint8Array(((n*3)>>2)-pad);var p=0;for(var j=0;j<n;j+=4){var a=lk[s.charCodeAt(j)],b=lk[s.charCodeAt(j+1)],c=lk[s.charCodeAt(j+2)],d=lk[s.charCodeAt(j+3)];out[p++]=(a<<2)|(b>>4);if(p<out.length)out[p++]=((b&15)<<4)|(c>>2);if(p<out.length)out[p++]=((c&3)<<6)|d;}return out;}
var img=figma.createImage(b64d(B64)); // imageHash = img.hash; используй как IMAGE-fill
```
   (Не полагайся на `figma.base64Decode` — он отверг валидную строку.) Если base64 + код > ~50000 —
   разбей на 2 вызова: 1-й создаёт image и кладёт временный прямоугольник с этой заливкой; 2-й читает
   его imageHash и строит компонент.
3) Сет State=Default (статичный кадр/вектор) / State=Hover (GIF-fill), текст — отдельный слой в обоих.
4) Реакция на Default (while-hovering, авто-возврат):
```js
const react={trigger:{type:"ON_HOVER"},actions:[{type:"NODE",destinationId:hov.id,navigation:"CHANGE_TO",transition:{type:"DISSOLVE",easing:{type:"EASE_OUT"},duration:0.12},preserveScrollPosition:false}]};
try{ await def.setReactionsAsync([react]); }catch(e){ def.reactions=[{trigger:{type:"ON_HOVER"},action:react.actions[0]}]; }
```
   Примечание: `get_screenshot` не рендерит GIF-заливки (в статике пусто) — проверяй hover вживую в Present.

## ВАЖНО: верификация createImage-заливок (PNG и GIF)
`get_screenshot` (этот MCP) **не отрисовывает заливки, созданные через `figma.createImage` в этой же
сессии** — узел выглядит тёмным/пустым, хотя картинка валидна и лежит в файле. Это ограничение рендера,
не баг данных. Поэтому:
- Проверяй наличие байтов: `const im=figma.getImageByHash(IH); (await im.getBytesAsync()).length` > 0.
- Визуально проверяй в самой Figma (там рендерится), либо приложи исходный PNG/GIF файл пользователю.
- Не пытайся «починить» тёмный скрин — он ожидаем при createImage.
- `upload_assets` (который дал бы рендеримую заливку) из песочницы блокируется прокси (403 на mcp.figma.com),
  поэтому остаётся путь createImage с этим компромиссом по верификации.
- **createImage-заливка может НЕ рендериться и в ПРОТОТИПЕ/Present** (лицо тёмное), хотя на ХОЛСТЕ отрисовывается.
  Причина: блоб, созданный плагином, доступен canvas-рендеру, но не всегда — screenshot-сервису и
  плеер-рантайму прототипа. Если кнопка нужна в кликабельном прототипе/Present — фон должен быть
  **по-настоящему импортированной картинкой**: пользователь перетаскивает PNG/GIF в Figma вручную
  (или через upload_assets, если доступно), затем подменяем заливку на этот imageHash. Тогда рендерится везде.
  Для статичной кнопки на холсте createImage достаточно.

## Самодельная БЕСШОВНАЯ текстура для фона (камень/металл/шум) + TILE
Когда фон — материал (камень, бетон, бумага), генерь текстуру САМ (Pillow/numpy) и заливай
`scaleMode:"TILE"` (+ `scalingFactor` — размер плитки; не `imageTransform`). TILE = не тянется
при ресайзе (зерно того же масштаба) — это и нужно для отзывчивого хедера/панели.
- ГЛАВНОЕ: тайл должен быть **бесшовным**, иначе TILE даёт видимую сетку швов («кафель»).
  Обычный `effect_noise`/перлин по краям не стыкуется. Надёжный бесшовный шум — через FFT:
  спектр `1/f^(beta/2)`, случайные фазы, `ifft2().real` → результат периодичен по краям.
  Несколько октав (beta≈3 крупные пятна, ≈2 мрамор, ≈1 зерно), смешать, отмаппить в цветовой
  ramp (dark→light). Трещины/спеклы добавлять осторожно — они ломают бесшовность.
- Держи PNG компактным (квантование `convert("P",colors=32..48)`), чтобы base64 (≤~8000) надёжно
  вставлялся в `use_figma` одним литералом без обрезки при ручном переносе. Большой литерал легко
  обрезать/побить — лучше уменьшить картинку (размер+палитра), чем дробить строку.
- ВАЖНО (уточнение): статичная **IMAGE-заливка** через `createImage` РЕНДЕРИТСЯ в `get_screenshot`
  (в отличие от GIF/анимации и плеера прототипа — там тёмная). То есть для статичного растрового
  фона `createImage` достаточно и проверяется скриншотом. `getBytesAsync().length` может отличаться
  от исходного PNG — Figma пере-сжимает, это норма (не баг).
- Структура BG-компонента панели: рама-металл (vGrad светлый верх→тёмный низ) + INNER_SHADOW
  (светлый сверху, тёмный снизу = фаска) → камень-rect инсетом ~4 (`constraints:STRETCH`,
  TILE-заливка, тонкий тёмный stroke + INNER_SHADOW для «вдавленности») → на компоненте внешняя
  DROP_SHADOW (отрыв). Инстансы на 2 ширины показывают, что плитка не тянется.

## Вогнутые угловые вырезы через boolean (T16)
Острые углы (r=0). Вырез = rect МИНУS union из 4 эллипсов, центрированных на углах. Заливку/эффекты —
на узел boolean-результата. У каждого Z-слоя свой размер резаков (кант меньше, лицо крупнее) = ступенчатая глубина.
```js
function cut(rx,ry,w,h,D,fills,fx){          // вырезать углы у прямоугольника
  const rect=figma.createRectangle(); rect.x=rx; rect.y=ry; rect.resize(w,h); rect.cornerRadius=0; rect.fills=fills; comp.appendChild(rect);
  const corners=[[rx,ry],[rx+w,ry],[rx,ry+h],[rx+w,ry+h]];
  const els=corners.map(([cx,cy])=>{ const e=figma.createEllipse(); e.resize(D,D); e.x=cx-D/2; e.y=cy-D/2; e.fills=[solid("#000")]; comp.appendChild(e); return e; }); // центр строго на углу
  const sub=figma.subtract([rect, figma.union(els,comp)], comp);  // rect минус объединение
  sub.fills=fills; sub.effects=fx; return sub;
}
// КАНТ (низ, утоплен): полный размер, stone+тёмный тинт, мелкие резаки D=16, INNER_SHADOW
const rim=cut(0,0,W,H,16,[stone(1.4),solid("#000",0.42)],[innerShadow]);
// ЛИЦО (верх, приподнято): инсет 4, stone, КРУПНЫЕ резаки D=24, DROP_SHADOW вниз + светлый INNER_SHADOW сверху
const face=cut(4,4,W-8,H-8,24,[stone(1.4)],[dropShadow, innerHighlight]);
```
Грабли: эффекты на детях boolean не видны — вешать на результат; `figma.subtract([base, cutter])` — первый минус остальные.
КОНЦЕНТРИЧНОСТЬ (ровный кант): резаки соседних слоёв в ОДНОМ центре (угол ПАНЕЛИ), радиусы r и r+B
(B=ширина канта). Не центрируй резак инсетнутого слоя в его собственном углу — кант в углу станет шире.
РЕСПОНСИВ: у `BOOLEAN_OPERATION` нет `constraints` → нельзя растянуть. Делай горизонтальный 3-слайс:
```js
comp.layoutMode="HORIZONTAL"; comp.primaryAxisSizingMode="FIXED"; comp.counterAxisSizingMode="FIXED";
// capL (FIXED, CAP≥Ro+B): cutRect TL[0,0,Ro]/BL[0,H,Ro] + face TL[0,0,Ro+B]/BL[0,H,Ro+B]
// mid  (FILL): обычные rect rim/face с constraints STRETCH, БЕЗ углов
// capR (FIXED): cuts в (CAP,0)/(CAP,H)
capL.layoutSizingHorizontal="FIXED"; mid.layoutSizingHorizontal="FILL"; capR.layoutSizingHorizontal="FIXED";
```
Одинаковые эффекты во всех секциях → швы кап|центр незаметны на камне.

## Текстура из фигур (T15)
Сгенерь сетку фигур SVG и импортируй: `figma.createNodeFromSvg('<svg ...><g fill="#..">'+circles+'</g></svg>')`.
Опусти в клип-слой; `constraints {horizontal:"MIN"|"MAX", vertical:"CENTER"}` чтобы НЕ тянулась при ресайзе.
