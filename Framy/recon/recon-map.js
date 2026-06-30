// recon-map.js — Слой 2: профиль (flags) → стратегия (приёмы T1–T15 build-game-ui).
// Чистая функция, без Figma. Вход — вывод dumpSignals(). Учитывает режим (Слой 0) и tier (Rule 0).
//
// mapStrategy(profile, opts) -> { mode, tier_gate, reuse_plan, techniques[], rungs_note, warnings[] }
//   profile: { flags, reuse_candidates }
//   opts: { mode: 'copy'|'learn' (default 'copy'), tierAllowsRich: bool (default true) }

function mapStrategy(profile, opts = {}) {
  const f = profile.flags || {};
  const mode = opts.mode === 'learn' ? 'learn' : 'copy';
  const tierAllowsRich = opts.tierAllowsRich !== false;
  const warnings = [];
  const T = [];
  const add = (id, why) => T.push({ id, why });

  // --- tier-гейт (doctrine Rule 0): на Standard/Low-Custom богатый декор не строим ---
  if (!tierAllowsRich) {
    return {
      mode, tier_gate: 'blocked',
      reuse_plan: [],
      techniques: [{ id: 'rung 1-3', why: 'tier Standard/Low-Custom → token fill + stroke + radius, стоп' }],
      rungs_note: 'Богатый декор оправдан только на 🟩 High-Custom. Здесь — плоский токенный финиш.',
      warnings,
    };
  }

  // --- структура/растяжение ---
  if (f.is_raster_slice) add('T16', 'растровая 9-slice нарезка (baked, IMAGE CROP в L/M/R + слот Space) → РЕЮЗ компонента-рамки, не перерисовка вектором (школа Dragonia)');
  if (f.is_three_slice && !f.is_raster_slice) add('T1', '3-слайс L/C/R: углы FIXED, центр FILL — тянется по ширине');
  if (f.is_angled_shape) add('T9-skew', 'скошенная/параллелограмм геометрия → сегменты рисовать вектор-полигонами (vector-method), не rect; углы FIXED');
  if (f.is_raster_bg) add('T2', 'растровый фон тянется → 9-slice CROP, общие доли швов');

  // --- материал/поверхность (лёгкий рунг прежде тяжёлого) ---
  if (f.material === 'glossy' || (f.has_gradient_sheen && f.has_inner_shadow)) add('T4', 'гладкий глянец: верт. градиент + блик + фаска + INNER_SHADOW');
  else if (f.material === 'metallic' || f.has_gradient_sheen) add('T8', 'металл-рама: концентрические rounded-rect с градиентами');

  // --- FX / текстура ---
  if (f.has_texture_overlay || f.has_fx_blend_layer) add('T7', 'FX/текстура на бленде → растр + lighten-бленд + alpha-маска, отдельный компонент');

  // --- орнамент/уголки ---
  if (f.has_ornament_vector) add('T9', 'вектор-орнамент/notch уголки → отдельный вектор-компонент, зеркало');

  // --- глубина ---
  if (f.has_inner_shadow && f.is_inset) add('T11-inv', 'вдавленность (инпут): inner shadow тёмный сверху-внутрь');
  if (f.has_lift_shadow) add('T11', 'выдавлено из фона: внешняя DROP_SHADOW мягкая+плотная + нижний блик');
  if (f.has_edge_glow) add('glow', 'светящаяся кромка: цветная тень со spread');

  // --- форма ---
  if (f.is_pill) add('T5', 'пилюля: жёсткая тень blur0 снизу + тонкий белый внутр. stroke');
  if (f.has_mask) add('mask', 'маска: icon mask-paint (#ff00ff sentinel) / spotlight / клип — проверить роль');

  // --- состояния ---
  if (Array.isArray(profile.states) && profile.states.length > 1) add('T14', 'states → один скелет, меняем свет/насыщ./glow/FX; компонент-сет');

  // --- если ничего не сработало ---
  if (T.length === 0) add('rung 1-3', 'нет признаков богатого декора → token fill + stroke + radius');

  // --- режим / реюз (Слой 0) ---
  let reuse_plan = [];
  const cands = profile.reuse_candidates || [];
  if (mode === 'copy') {
    reuse_plan = cands.map(c => ({ ...c, action: 'reuse-instance' }));
    if (cands.length) warnings.push('Режим copy: сперва переиспользовать reuse_plan; приёмы — только для частей без готового компонента. При неполном совпадении — спросить оператора (reuse / clone+доработка / собрать заново).');
  } else {
    warnings.push('Режим learn: реюз сознательно отключён — воспроизводим приёмы своими руками для тренировки.');
  }

  return {
    mode,
    tier_gate: 'allowed',
    reuse_plan,
    techniques: T,
    rungs_note: 'Climb to the LIGHTEST technique that reads the same at target size (decoration-craft). Глубина = СТЕК слоёв, не один fill.',
    warnings,
  };
}

if (typeof module !== 'undefined') module.exports = { mapStrategy };
