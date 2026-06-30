// ВНИМАНИЕ (L11): это ПЛОСКАЯ реконструкция — для ПИКСЕЛЬНОЙ СВЕРКИ и случаев, когда компонентов нет.
// Результат НЕ тянется и НЕ на компонентах. Для production-ребилда, если `dumpSignals` нашёл
// `reuse_candidates`, собирай кнопку ИЗ ИНСТАНСОВ компонентов в auto-layout 3-слайсе (каплы FIXED,
// центр FILL) — доктрина build-game-ui «реюз > имитация». См. recon/build-checklist.md, быстрый путь.
//
// faithful-rebuild.js — реконструкция декор-узла ИЗ ДАННЫХ, а не «по памяти» (use_figma).
// Корень повторяющихся промахов ребилда — авторинг геометрии на глаз. Лекарство: пересоздавать
// каждый ЛИСТ из его реальных vectorPaths + absoluteTransform + fills + opacity + effects.
//
// Почему absoluteTransform, а не иерархический recreate с перемножением матриц групп:
//   повёрнутые/зеркальные GROUP (rot 180) при ручной композиции дают дрейф трансляции (один полигон
//   уезжает на несколько px — ломается зеркальность). `absoluteTransform` уже запекает ВСЕ повороты/
//   зеркала/масштабы предков, поэтому ставим каждый лист по нему относительно нового корня — без
//   матричной возни и без GROUP→FRAME рассинхрона (L9/L10).
// Цена: иерархия схлопывается (все листы под корнем) — отзывчивость 3-слайса, если нужна, строится
// отдельно по стратегии mapStrategy. Для точной визуальной реконструкции это верный размен.
//
// Встроенные защиты: гасит дефолтный чёрный stroke; fills всегда явно ([] если не было); фолбэк шрифта.
//
// Применение в use_figma:
//   const root = await rebuildFaithful('168693:127621', figma.currentPage);
//   root.x=..; root.y=..; await root.screenshot({scale:4});

const _clone = o => JSON.parse(JSON.stringify(o));
function _mul(A, B) {
  return [
    [A[0][0]*B[0][0]+A[0][1]*B[1][0], A[0][0]*B[0][1]+A[0][1]*B[1][1], A[0][0]*B[0][2]+A[0][1]*B[1][2]+A[0][2]],
    [A[1][0]*B[0][0]+A[1][1]*B[1][0], A[1][0]*B[0][1]+A[1][1]*B[1][1], A[1][0]*B[0][2]+A[1][1]*B[1][2]+A[1][2]],
  ];
}
function _inv(A) {
  const a=A[0][0], b=A[0][1], tx=A[0][2], d=A[1][0], e=A[1][1], ty=A[1][2];
  const det=a*e-b*d;
  return [[e/det,-b/det,(b*ty-e*tx)/det],[-d/det,a/det,(d*tx-a*ty)/det]];
}
async function _loadFontWithFallback(s) {
  const fonts = await figma.listAvailableFontsAsync();
  const has = (f, st) => fonts.some(x => x.fontName.family===f && x.fontName.style===st);
  const w = (s.fontName===figma.mixed) ? {family:'Inter',style:'Regular'} : s.fontName;
  if (has(w.family,w.style)) { await figma.loadFontAsync(w); return w; }
  const sf = fonts.find(x => x.fontName.family===w.family);
  if (sf) { await figma.loadFontAsync(sf.fontName); return sf.fontName; }
  const base = w.family.split(' ').slice(0,2).join(' ');
  const near = fonts.find(x => x.fontName.family.startsWith(base));
  if (near) { await figma.loadFontAsync(near.fontName); return near.fontName; }
  await figma.loadFontAsync({family:'Inter',style:'Regular'});
  return {family:'Inter',style:'Regular'};
}

// Главная функция: воссоздаёт src (по id) как плоский набор листьев под новым FRAME.
async function rebuildFaithful(srcId, parent) {
  let src=null; for (let i=0;i<3&&!src;i++){ try{ src=await figma.getNodeByIdAsync(srcId);}catch(e){} }
  if (!src) throw new Error('src unresolved: '+srcId);
  const rootInv = _inv(src.absoluteTransform);
  const root = figma.createFrame();
  root.name = src.name+' (rebuild)'; root.resize(src.width, src.height); root.fills=[]; root.clipsContent=false;
  parent.appendChild(root);

  const leaves=[];
  (function walk(n){
    if (n.type==='VECTOR'||n.type==='RECTANGLE'||n.type==='ELLIPSE'||n.type==='TEXT') leaves.push(n);
    if (n.children && n.children.length) n.children.forEach(walk);
  })(src);

  for (const s of leaves) {
    let n; const t=s.type;
    if (t==='VECTOR') n=figma.createVector();
    else if (t==='RECTANGLE') n=figma.createRectangle();
    else if (t==='ELLIPSE') n=figma.createEllipse();
    else n=figma.createText();
    root.appendChild(n); n.name=s.name;
    if (t==='VECTOR' && Array.isArray(s.vectorPaths)) n.vectorPaths=s.vectorPaths.map(vp=>({windingRule:vp.windingRule,data:vp.data}));
    if (t==='TEXT') { try{
      const fn=await _loadFontWithFallback(s); n.fontName=fn;
      if (s.fontSize!==figma.mixed) n.fontSize=s.fontSize;
      n.characters=s.characters||'';
      n.textAlignHorizontal=s.textAlignHorizontal; n.textAlignVertical=s.textAlignVertical;
    }catch(e){} }
    try{ n.resize(Math.max(0.01,s.width),Math.max(0.01,s.height)); }catch(e){}
    try{ n.fills = Array.isArray(s.fills) ? _clone(s.fills) : []; }catch(e){}          // L9: всегда явно
    try{ n.strokes = (Array.isArray(s.strokes)&&s.strokes.length) ? _clone(s.strokes) : []; }catch(e){} // нет чёрного дефолта
    try{ if (typeof s.strokeWeight==='number') n.strokeWeight=s.strokeWeight; }catch(e){}
    try{ n.opacity=s.opacity; }catch(e){}                                              // L6: per-layer opacity
    try{ if (s.blendMode) n.blendMode=s.blendMode; }catch(e){}
    try{ if (Array.isArray(s.effects)) n.effects=_clone(s.effects); }catch(e){}
    try{ n.visible=s.visible; }catch(e){}
    try{ n.relativeTransform=_mul(rootInv, s.absoluteTransform); }catch(e){}           // L10: точная поза из absolute
  }
  return root;
}

if (typeof module !== 'undefined') module.exports = { rebuildFaithful };
