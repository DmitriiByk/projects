// dumpSignals() — исполняемый recon-дамп узла Figma (use_figma, read-only)
// Слой 1 плана complex-decor-recon-plan.md. Снимает стабильный JSON-профиль декор-элемента:
// геометрия / fills / strokes / effects / blend / маски / 3-слайс / texture-overlay / states /
// reuse_candidates. Вывод детерминирован (round + сортировки) → профили сравнимы диффом.
//
// Применение в use_figma: вставить тело, задать TARGET_ID / PAGE_NAME, вернуть dumpSignals(target).
// Резолв узла с фолбэком — против транзиентного null из getNodeByIdAsync.

const LIGHTEN_MODES = ['LIGHTEN','SCREEN','OVERLAY','SOFT_LIGHT','MULTIPLY','LINEAR_DODGE',
  'COLOR_DODGE','PLUS_LIGHTER','PLUS_DARKER','HARD_LIGHT','COLOR_BURN','LINEAR_BURN'];

async function resolveNode(id, pageName) {
  if (pageName) {
    const pg = figma.root.children.find(p => p.name.trim() === pageName.trim());
    if (pg && figma.currentPage.id !== pg.id) await figma.setCurrentPageAsync(pg);
  }
  let n = null, route = '';
  for (let i = 0; i < 4 && !n; i++) {
    try { n = await figma.getNodeByIdAsync(id); if (n) route = 'getNodeByIdAsync@' + i; } catch (e) {}
    if (!n) { n = figma.currentPage.findOne(x => x.id === id) || null; if (n) route = 'findOne@' + i; }
  }
  return { node: n, route };
}

const round = v => v == null ? v : Math.round(v * 1000) / 1000;
function paintSig(p) {
  const o = { type: p.type, opacity: round(p.opacity ?? 1), blendMode: p.blendMode || 'NORMAL', visible: p.visible !== false };
  if (p.type === 'SOLID') o.color = { r: round(p.color.r), g: round(p.color.g), b: round(p.color.b) };
  if (/GRADIENT/.test(p.type)) o.stops = (p.gradientStops || []).length;
  if (p.type === 'IMAGE') { o.scaleMode = p.scaleMode; o.hasHash = !!p.imageHash; }
  return o;
}
const effSig = e => ({ type: e.type, visible: e.visible !== false, radius: round(e.radius), spread: round(e.spread), blendMode: e.blendMode });
function layerSig(n, depth) {
  return {
    name: n.name, type: n.type, depth, w: round(n.width), h: round(n.height),
    cornerRadius: typeof n.cornerRadius === 'number' ? round(n.cornerRadius) : 'mixed',
    opacity: round(n.opacity ?? 1), blendMode: n.blendMode || 'NORMAL', isMask: !!n.isMask,
    layoutMode: n.layoutMode || null, primaryAxisSizingMode: n.primaryAxisSizingMode || null,
    counterAxisSizingMode: n.counterAxisSizingMode || null,
    constraints: n.constraints ? (n.constraints.horizontal + '/' + n.constraints.vertical) : null,
    fills: Array.isArray(n.fills) ? n.fills.map(paintSig) : (n.fills === figma.mixed ? 'mixed' : null),
    strokes: Array.isArray(n.strokes) ? n.strokes.map(paintSig) : null,
    strokeWeight: typeof n.strokeWeight === 'number' ? round(n.strokeWeight) : null,
    strokeAlign: n.strokeAlign || null,
    effects: Array.isArray(n.effects) ? n.effects.map(effSig) : null,
    hasVector: n.type === 'VECTOR' || (Array.isArray(n.vectorPaths) && n.vectorPaths.length > 0),
    mainComponent: n.type === 'INSTANCE' && n.mainComponent ? n.mainComponent.name : null,
  };
}

function dumpSignals(target) {
  const layers = [], reuse = {};
  (function walk(n, d) {
    if (d > 6 || layers.length > 60) return;
    layers.push(layerSig(n, d));
    if (n.type === 'INSTANCE' && n.mainComponent) { const k = n.mainComponent.name; reuse[k] = (reuse[k] || 0) + 1; }
    if (n.children) for (const c of n.children) walk(c, d + 1);
  })(target, 0);

  const all = layers, root = all[0];
  const anyEff = t => all.some(l => l.effects && l.effects.some(e => e.type === t && e.visible));
  const anyGrad = all.some(l => Array.isArray(l.fills) && l.fills.some(f => /GRADIENT/.test(f.type)));
  const imgFills = all.flatMap(l => Array.isArray(l.fills) ? l.fills.filter(f => f.type === 'IMAGE') : []);
  // Урок #2: оверлей-текстуру (низкая прозрачность / lighten-бленд) НЕ путать с растровой базой.
  const textureOverlay = imgFills.some(f => f.opacity < 0.6 || LIGHTEN_MODES.includes(f.blendMode));
  const rasterBase = imgFills.some(f => f.opacity >= 0.6 && !LIGHTEN_MODES.includes(f.blendMode) && f.scaleMode !== 'TILE');
  // Урок #1: список lighten-блендов ДОЛЖЕН включать LINEAR_DODGE/COLOR_DODGE/PLUS_LIGHTER.
  const anyBlendFx = all.some(l => LIGHTEN_MODES.includes(l.blendMode) ||
    (Array.isArray(l.fills) && l.fills.some(f => LIGHTEN_MODES.includes(f.blendMode))));
  const maxR = Math.max(...all.map(l => typeof l.cornerRadius === 'number' ? l.cornerRadius : 0));
  // Урок L4: 3-слайс распознавать по part=left/center/middle/right, суффиксам =l/=c/=r,
  // повторам Left/Center/Right и polygon-сегментам — НЕ только по числу Rectangle.
  const partRe = /part=(left|center|middle|right)|=(l|c|r)$|^(left|center|middle|right)$/i;
  const partHits = all.filter(l => partRe.test((l.name || '').trim())).length
    + Object.keys(reuse).filter(k => /part=(left|center|middle|right)|=(l|c|r)$/i.test(k)).length;
  const polyCount = all.filter(l => /polygon/i.test(l.name || '') && l.hasVector).length;
  const sliced = partHits >= 2 || all.filter(l => /Rectangle/.test(l.name)).length >= 3 || polyCount >= 3;

  const flags = {
    stretches_horizontally: root.layoutMode === 'HORIZONTAL',
    is_three_slice: sliced,
    is_angled_shape: polyCount > 0, // скос/параллелограмм рисуется вектор-полигонами
    is_raster_bg: rasterBase,
    has_texture_overlay: textureOverlay,
    has_gradient_sheen: anyGrad,
    has_inner_shadow: anyEff('INNER_SHADOW'),
    has_lift_shadow: anyEff('DROP_SHADOW'),
    has_edge_glow: all.some(l => l.effects && l.effects.some(e => e.type === 'DROP_SHADOW' && e.spread > 0 && e.visible)),
    has_blur: anyEff('LAYER_BLUR') || anyEff('BACKGROUND_BLUR'),
    has_fx_blend_layer: anyBlendFx,
    has_ornament_vector: all.some(l => l.hasVector && l.depth > 0),
    has_mask: all.some(l => l.isMask),
    is_pill: typeof root.h === 'number' && maxR >= root.h / 2 - 1,
    material: rasterBase ? 'raster' : (anyGrad ? (anyEff('INNER_SHADOW') ? 'glossy' : 'metallic') : 'flat'),
  };
  return {
    layer_count: layers.length,
    flags,
    reuse_candidates: Object.entries(reuse).map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    layers,
  };
}

// --- пример вызова ---
// const { node, route } = await resolveNode('84:48081', 'Button');
// const target = node.children.find(c => c.name === 'variant=primary, size=md, state=default');
// return { resolve_route: route, profile: dumpSignals(target) };
