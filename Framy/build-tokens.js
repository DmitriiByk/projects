/* build-tokens.js
 * Generates tailwind.config.js for the ForgeX | Library design system.
 * Color data extracted from Figma variable reads:
 *   - palette  : raw primitive ramps (mode-agnostic)
 *   - theme    : semantic tokens, resolved for light + dark modes
 * Run: node build-tokens.js   (writes ./tailwind.config.js)
 */
const fs = require('fs');

/* ----------------------------------------------------------------------------
 * 1) PALETTE — primitive tokens (Figma "palette" collection). Mode-agnostic.
 * -------------------------------------------------------------------------- */
const palette = {
  neutral: { 25:'#f8f8f9',50:'#f1f1f4',75:'#eaeaee',100:'#e4e4e9',150:'#d6d6dd',200:'#c8c8d2',250:'#bbbbc7',300:'#adadbc',400:'#9292a6',500:'#777790',600:'#606075',650:'#555568',700:'#4a4a5a',750:'#3f3f4d',800:'#34343f',850:'#282831',900:'#1d1d24',925:'#18181d',950:'#121216',975:'#0d0d0f' },
  brand:   { 25:'#f7f5ff',50:'#ede9ff',75:'#e3defe',100:'#dad3fd',150:'#c8bef9',200:'#b6aaf5',250:'#a697ef',300:'#9686e8',400:'#7966d8',500:'#5e4ac3',600:'#4e3f9e',650:'#483b89',700:'#413676',750:'#393063',800:'#302952',850:'#272241',900:'#1e1a31',925:'#191629',950:'#141221',975:'#0f0d19' },
  accent:  { 25:'#f2fce8',50:'#ecfbde',75:'#e6f9d3',100:'#e0f7c9',150:'#d4f3b5',200:'#c8eda2',250:'#bbe790',300:'#afe17e',400:'#97d25c',500:'#7fc03d',600:'#669736',650:'#5a8331',700:'#4e702c',750:'#425e26',800:'#354c1f',850:'#293a18',900:'#1d2911',925:'#17200e',950:'#11180a',975:'#0b0f07' },
  info:    { 25:'#effcfd',50:'#e5f9fb',75:'#daf7f9',100:'#d0f4f7',150:'#bceef3',200:'#a8e8ee',250:'#95e2e9',300:'#82dbe3',400:'#5dcdd7',500:'#39bdc9',600:'#2f99a2',650:'#2b868e',700:'#26737a',750:'#216167',800:'#1b4f54',850:'#163e41',900:'#102c2f',925:'#0d2326',950:'#091b1c',975:'#061213' },
  warning: { 25:'#fff6ed',50:'#fff0e1',75:'#ffead5',100:'#ffe4c8',150:'#ffd7b0',200:'#fecb98',250:'#fdbf81',300:'#fbb36b',400:'#f49a41',500:'#e9821b',600:'#b8691b',650:'#9f5d1b',700:'#86511b',750:'#6f441a',800:'#583818',850:'#432c15',900:'#2f2011',925:'#251a0e',950:'#1c140b',975:'#130d08' },
  positive:{ 25:'#f2fce8',50:'#ecfbde',75:'#e6f9d3',100:'#e0f7c9',150:'#d4f3b5',200:'#c8eda2',250:'#bbe790',300:'#afe17e',400:'#97d25c',500:'#7fc03d',600:'#669736',650:'#5a8331',700:'#4e702c',750:'#425e26',800:'#354c1f',850:'#293a18',900:'#1d2911',925:'#17200e',950:'#11180a',975:'#0b0f07' },
  negative:{ 25:'#fef3f3',50:'#fee7e7',75:'#fddcdc',100:'#fcd1d1',150:'#f9bbbb',200:'#f6a6a6',250:'#f29191',300:'#ed7d7d',400:'#e25757',500:'#d43434',600:'#ac2b2b',650:'#952929',700:'#802626',750:'#6b2222',800:'#571e1e',850:'#431919',900:'#311313',925:'#271010',950:'#1e0d0d',975:'#150909' },
};

const COLORED = ['brand','accent','info','warning','positive','negative']; // 6-step tint families
const MAIN_KEYS = ['l200','l100','base','d100','d200','contrast'];
const TEXT_KEYS = ['l200','base','d200'];

/* ----------------------------------------------------------------------------
 * 2) THEME — semantic tokens, resolved hexes for each mode.
 *    light = swatch 4003:16360 ; dark = swatch 63372:2863
 *    (tint/neutral 400 from component frame; 500 resolved via documented ref)
 * -------------------------------------------------------------------------- */
const themeLight = {
  base: '#ffffff',
  inverse: '#000000',
  tint: {
    neutral:  { 50:'#f1f1f4',100:'#e4e4e9',150:'#d6d6dd',200:'#c8c8d2',250:'#bbbbc7',300:'#adadbc',400:'#9292a6',500:'#777790' },
    brand:    { 50:'#ede9ff',100:'#dad3fd',150:'#c8bef9',200:'#b6aaf5',250:'#a697ef',300:'#9686e8' },
    accent:   { 50:'#ecfbde',100:'#e0f7c9',150:'#d4f3b5',200:'#c8eda2',250:'#bbe790',300:'#afe17e' },
    info:     { 50:'#e5f9fb',100:'#d0f4f7',150:'#bceef3',200:'#a8e8ee',250:'#95e2e9',300:'#82dbe3' },
    warning:  { 50:'#fff0e1',100:'#ffe4c8',150:'#ffd7b0',200:'#fecb98',250:'#fdbf81',300:'#fbb36b' },
    positive: { 50:'#ecfbde',100:'#e0f7c9',150:'#d4f3b5',200:'#c8eda2',250:'#bbe790',300:'#afe17e' },
    negative: { 50:'#fee7e7',100:'#fcd1d1',150:'#f9bbbb',200:'#f6a6a6',250:'#f29191',300:'#ed7d7d' },
  },
  text: {
    neutral:  { 100:'#000000',200:'#3f3f4d',300:'#777790',400:'#bbbbc7' },
    brand:    { l200:'#b6aaf5', base:'#7966d8', d200:'#5441b4' },
    accent:   { l200:'#a3da6d', base:'#72ab3a', d200:'#425e26' },
    info:     { l200:'#6fd4dd', base:'#34acb7', d200:'#216167' },
    warning:  { l200:'#fbb36b', base:'#e9821b', d200:'#86511b' },
    positive: { l200:'#afe17e', base:'#7fc03d', d200:'#4e702c' },
    negative: { l200:'#ed7d7d', base:'#d43434', d200:'#802626' },
  },
  main: {
    neutral:  { l200:'#adadbc',l100:'#9292a6',base:'#777790',d100:'#606075',d200:'#4a4a5a',contrast:'#ffffff' },
    brand:    { l200:'#a697ef',l100:'#8775e1',base:'#6b57ce',d100:'#5441b4',d200:'#483b89',contrast:'#ffffff' },
    accent:   { l200:'#afe17e',l100:'#97d25c',base:'#7fc03d',d100:'#669736',d200:'#4e702c',contrast:'#ffffff' },
    info:     { l200:'#82dbe3',l100:'#5dcdd7',base:'#39bdc9',d100:'#2f99a2',d200:'#26737a',contrast:'#000000' },
    warning:  { l200:'#fec58d',l100:'#f9ad60',base:'#f19437',d100:'#df7c18',d200:'#ab631b',contrast:'#ffffff' },
    positive: { l200:'#afe17e',l100:'#97d25c',base:'#7fc03d',d100:'#669736',d200:'#4e702c',contrast:'#ffffff' },
    negative: { l200:'#ed7d7d',l100:'#e25757',base:'#d43434',d100:'#ac2b2b',d200:'#802626',contrast:'#ffffff' },
  },
};

const themeDark = {
  base: '#1d1d24',
  inverse: '#ffffff',
  tint: {
    neutral:  { 50:'#282831',100:'#34343f',150:'#3f3f4d',200:'#4a4a5a',250:'#555568',300:'#606075',400:'#777790',500:'#9292a6' },
    brand:    { 50:'#272241',100:'#302952',150:'#393063',200:'#413676',250:'#483b89',300:'#4e3f9e' },
    accent:   { 50:'#293a18',100:'#354c1f',150:'#425e26',200:'#4e702c',250:'#5a8331',300:'#669736' },
    info:     { 50:'#163e41',100:'#1b4f54',150:'#216167',200:'#26737a',250:'#2b868e',300:'#2f99a2' },
    warning:  { 50:'#432c15',100:'#583818',150:'#6f441a',200:'#86511b',250:'#9f5d1b',300:'#b8691b' },
    positive: { 50:'#293a18',100:'#354c1f',150:'#425e26',200:'#4e702c',250:'#5a8331',300:'#669736' },
    negative: { 50:'#431919',100:'#571e1e',150:'#6b2222',200:'#802626',250:'#952929',300:'#ac2b2b' },
  },
  text: {
    neutral:  { 100:'#ffffff',200:'#c8c8d2',300:'#9292a6',400:'#606075' },
    brand:    { l200:'#c8bef9', base:'#8775e1', d200:'#5441b4' },
    accent:   { l200:'#a3da6d', base:'#72ab3a', d200:'#425e26' },
    info:     { l200:'#6fd4dd', base:'#34acb7', d200:'#216167' },
    warning:  { l200:'#fbb36b', base:'#e9821b', d200:'#86511b' },
    positive: { l200:'#afe17e', base:'#7fc03d', d200:'#4e702c' },
    negative: { l200:'#ed7d7d', base:'#d43434', d200:'#802626' },
  },
  main: {
    neutral:  { l200:'#adadbc',l100:'#9292a6',base:'#777790',d100:'#606075',d200:'#4a4a5a',contrast:'#ffffff' },
    brand:    { l200:'#a697ef',l100:'#8775e1',base:'#6b57ce',d100:'#5441b4',d200:'#483b89',contrast:'#ffffff' },
    accent:   { l200:'#afe17e',l100:'#97d25c',base:'#7fc03d',d100:'#669736',d200:'#4e702c',contrast:'#ffffff' },
    info:     { l200:'#82dbe3',l100:'#5dcdd7',base:'#39bdc9',d100:'#2f99a2',d200:'#26737a',contrast:'#000000' },
    warning:  { l200:'#fecb98',l100:'#fbb36b',base:'#f49a41',d100:'#e9821b',d200:'#b8691b',contrast:'#000000' },
    positive: { l200:'#afe17e',l100:'#97d25c',base:'#7fc03d',d100:'#669736',d200:'#4e702c',contrast:'#ffffff' },
    negative: { l200:'#ed7d7d',l100:'#e25757',base:'#d43434',d100:'#ac2b2b',d200:'#802626',contrast:'#ffffff' },
  },
};

/* ----------------------------------------------------------------------------
 * 3) Build CSS variable maps (:root = light, .dark = dark) + colors object.
 * -------------------------------------------------------------------------- */
function buildVars(theme) {
  const v = {};
  v['--base'] = theme.base;
  v['--inverse'] = theme.inverse;
  for (const group of ['tint','text','main']) {
    for (const fam of Object.keys(theme[group])) {
      for (const key of Object.keys(theme[group][fam])) {
        v[`--${group}-${fam}-${key}`] = theme[group][fam][key];
      }
    }
  }
  return v;
}
const rootVars = buildVars(themeLight);
const darkVars = buildVars(themeDark);

// Semantic colors -> reference the CSS vars. 'base' key becomes DEFAULT for text/main.
function buildSemanticColors() {
  const c = { base: 'var(--base)', inverse: 'var(--inverse)', tint: {}, text: {}, main: {} };
  for (const fam of Object.keys(themeLight.tint)) {
    c.tint[fam] = {};
    for (const k of Object.keys(themeLight.tint[fam])) c.tint[fam][k] = `var(--tint-${fam}-${k})`;
  }
  for (const fam of Object.keys(themeLight.text)) {
    c.text[fam] = {};
    for (const k of Object.keys(themeLight.text[fam])) {
      const name = k === 'base' ? 'DEFAULT' : k;
      c.text[fam][name] = `var(--text-${fam}-${k})`;
    }
  }
  for (const fam of Object.keys(themeLight.main)) {
    c.main[fam] = {};
    for (const k of Object.keys(themeLight.main[fam])) {
      const name = k === 'base' ? 'DEFAULT' : k;
      c.main[fam][name] = `var(--main-${fam}-${k})`;
    }
  }
  return c;
}

/* ----------------------------------------------------------------------------
 * 4) Pretty-printer for nested objects -> JS source.
 * -------------------------------------------------------------------------- */
function q(k) { return /^[A-Za-z_$][\w$]*$/.test(k) ? k : `'${k}'`; }
function printObj(o, indent) {
  const pad = '  '.repeat(indent), pad2 = '  '.repeat(indent + 1);
  const lines = Object.entries(o).map(([k, val]) => {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      return `${pad2}${q(k)}: ${printObj(val, indent + 1)},`;
    }
    return `${pad2}${q(k)}: '${val}',`;
  });
  return `{\n${lines.join('\n')}\n${pad}}`;
}
function printVarBlock(vars, indent) {
  const pad2 = '  '.repeat(indent + 1);
  return Object.entries(vars).map(([k, val]) => `${pad2}'${k}': '${val}',`).join('\n');
}

/* ----------------------------------------------------------------------------
 * 5) Static sections carried over unchanged (typography / radius / spacing / shadows).
 * -------------------------------------------------------------------------- */
const STATIC = `      borderRadius: {
        xs: '0.125rem', // 2
        sm: '0.25rem', // 4
        md: '0.5rem', // 8
        lg: '0.75rem', // 12
        xl: '1rem', // 16
        max: '9999px', // pill / fully rounded
      },

      // ForgeX 4px spacing grid (px-named tokens from the Figma number collection).
      // NOTE: these override Tailwind's default spacing for matching keys
      // (e.g. \`p-4\` becomes 4px, not 16px).
      spacing: {
        0: '0',
        4: '0.25rem', 6: '0.375rem', 8: '0.5rem', 12: '0.75rem', 16: '1rem',
        24: '1.5rem', 28: '1.75rem', 32: '2rem', 40: '2.5rem',
      },

      // Shadows (Figma: shadow/<outer|inner>/<size>/neutral/<intensity>)
      boxShadow: {
        'outer-sm-100': '0px 4px 12px 0px rgba(0, 0, 0, 0.05)',
        'outer-sm-200': '0px 4px 12px 0px rgba(0, 0, 0, 0.10)',
        'outer-sm-300': '0px 4px 12px 0px rgba(0, 0, 0, 0.15)',
        'outer-md-100': '0px 8px 24px 0px rgba(0, 0, 0, 0.05)',
        'outer-md-200': '0px 8px 24px 0px rgba(0, 0, 0, 0.10)',
        'outer-md-300': '0px 8px 24px 0px rgba(0, 0, 0, 0.15)',
        'outer-lg-100': '0px 12px 36px 0px rgba(0, 0, 0, 0.05)',
        'outer-lg-200': '0px 12px 36px 0px rgba(0, 0, 0, 0.10)',
        'outer-lg-300': '0px 12px 36px 0px rgba(0, 0, 0, 0.15)',
        'inner-sm-100': 'inset 0px 2px 2px 0px rgba(0, 0, 0, 0.04)',
        'inner-sm-200': 'inset 0px 2px 2px 0px rgba(0, 0, 0, 0.06)',
        'inner-sm-300': 'inset 0px 2px 2px 0px rgba(0, 0, 0, 0.09)',
        'inner-md-100': 'inset 0px 4px 4px 0px rgba(0, 0, 0, 0.04)',
        'inner-md-200': 'inset 0px 4px 4px 0px rgba(0, 0, 0, 0.06)',
        'inner-md-300': 'inset 0px 4px 4px 0px rgba(0, 0, 0, 0.09)',
        'inner-lg-100': 'inset 0px 8px 8px 0px rgba(0, 0, 0, 0.04)',
        'inner-lg-200': 'inset 0px 8px 8px 0px rgba(0, 0, 0, 0.06)',
        'inner-lg-300': 'inset 0px 8px 8px 0px rgba(0, 0, 0, 0.09)',
      },

      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      fontWeight: {
        regular: '400', semibold: '600', bold: '700', extrabold: '800', black: '900',
      },

      // Typography — synced from Figma "Typography" frame (node 2086:9499).
      // Naming: <group>-<size>. Headline carries 7 sizes (xxs->xxl); all other
      // groups carry 5 sizes (xs->xl). Comments show pixel pair fontSize/lineHeight.
      fontSize: {
        // display — Inter ExtraBold (800)
        'display-xs': ['1.5rem',  { lineHeight: '2.25rem', letterSpacing: '-0.75px', fontWeight: '800' }], // 24/36
        'display-sm': ['1.75rem', { lineHeight: '2.5rem',  letterSpacing: '-1px',    fontWeight: '800' }], // 28/40
        'display-md': ['2rem',    { lineHeight: '2.75rem', letterSpacing: '-1.25px', fontWeight: '800' }], // 32/44
        'display-lg': ['2.25rem', { lineHeight: '3rem',    letterSpacing: '-1.5px',  fontWeight: '800' }], // 36/48
        'display-xl': ['3rem',    { lineHeight: '3.75rem', letterSpacing: '-2px',    fontWeight: '800' }], // 48/60

        // headline — Inter Bold (700)
        'headline-xxs': ['0.875rem', { lineHeight: '1.125rem', letterSpacing: '0px',      fontWeight: '700' }], // 14/18
        'headline-xs':  ['1rem',     { lineHeight: '1.25rem',  letterSpacing: '0px',      fontWeight: '700' }], // 16/20
        'headline-sm':  ['1.125rem', { lineHeight: '1.375rem', letterSpacing: '-0.5px',   fontWeight: '700' }], // 18/22
        'headline-md':  ['1.25rem',  { lineHeight: '1.5rem',   letterSpacing: '-0.625px', fontWeight: '700' }], // 20/24
        'headline-lg':  ['1.5rem',   { lineHeight: '1.75rem',  letterSpacing: '-0.75px',  fontWeight: '700' }], // 24/28
        'headline-xl':  ['1.75rem',  { lineHeight: '2rem',     letterSpacing: '-0.875px', fontWeight: '700' }], // 28/32
        'headline-xxl': ['2rem',     { lineHeight: '2.25rem',  letterSpacing: '-1px',     fontWeight: '700' }], // 32/36

        // title — Inter SemiBold (600)
        'title-xs': ['0.75rem',  { lineHeight: '1rem',     letterSpacing: '0px', fontWeight: '600' }], // 12/16
        'title-sm': ['0.875rem', { lineHeight: '1.125rem', letterSpacing: '0px', fontWeight: '600' }], // 14/18
        'title-md': ['1rem',     { lineHeight: '1.25rem',  letterSpacing: '0px', fontWeight: '600' }], // 16/20
        'title-lg': ['1.125rem', { lineHeight: '1.375rem', letterSpacing: '0px', fontWeight: '600' }], // 18/22
        'title-xl': ['1.25rem',  { lineHeight: '1.5rem',   letterSpacing: '0px', fontWeight: '600' }], // 20/24

        // label — Inter SemiBold (600)
        'label-xs': ['0.75rem',  { lineHeight: '1.125rem', letterSpacing: '-0.25px', fontWeight: '600' }], // 12/18
        'label-sm': ['0.875rem', { lineHeight: '1.25rem',  letterSpacing: '-0.25px', fontWeight: '600' }], // 14/20
        'label-md': ['1rem',     { lineHeight: '1.375rem', letterSpacing: '-0.25px', fontWeight: '600' }], // 16/22
        'label-lg': ['1.125rem', { lineHeight: '1.5rem',   letterSpacing: '-0.25px', fontWeight: '600' }], // 18/24
        'label-xl': ['1.25rem',  { lineHeight: '1.75rem',  letterSpacing: '-0.25px', fontWeight: '600' }], // 20/28

        // button — Inter Black (900)
        'button-xxs': ['0.75rem',  { lineHeight: '1.125rem', letterSpacing: '0px', fontWeight: '900' }], // 12/18
        'button-xs':  ['0.875rem', { lineHeight: '1.375rem', letterSpacing: '0px', fontWeight: '900' }], // 14/22
        'button-sm':  ['1rem',     { lineHeight: '1.375rem', letterSpacing: '0px', fontWeight: '900' }], // 16/22
        'button-md':  ['1.25rem',  { lineHeight: '1.5rem',   letterSpacing: '0px', fontWeight: '900' }], // 20/24
        'button-lg':  ['1.75rem',  { lineHeight: '2rem',     letterSpacing: '0px', fontWeight: '900' }], // 28/32

        // body — Inter Regular (400)
        'body-xs': ['0.75rem',  { lineHeight: '1.125rem', letterSpacing: '-0.25px', fontWeight: '400' }], // 12/18
        'body-sm': ['0.875rem', { lineHeight: '1.25rem',  letterSpacing: '-0.25px', fontWeight: '400' }], // 14/20
        'body-md': ['1rem',     { lineHeight: '1.375rem', letterSpacing: '-0.25px', fontWeight: '400' }], // 16/22
        'body-lg': ['1.125rem', { lineHeight: '1.5rem',   letterSpacing: '-0.25px', fontWeight: '400' }], // 18/24
        'body-xl': ['1.25rem',  { lineHeight: '1.75rem',  letterSpacing: '-0.25px', fontWeight: '400' }], // 20/28

        // bodyStrong — Inter Bold (700)
        'body-strong-xs': ['0.75rem',  { lineHeight: '1.125rem', letterSpacing: '-0.25px', fontWeight: '700' }], // 12/18
        'body-strong-sm': ['0.875rem', { lineHeight: '1.25rem',  letterSpacing: '-0.25px', fontWeight: '700' }], // 14/20
        'body-strong-md': ['1rem',     { lineHeight: '1.375rem', letterSpacing: '-0.25px', fontWeight: '700' }], // 16/22
        'body-strong-lg': ['1.125rem', { lineHeight: '1.5rem',   letterSpacing: '-0.25px', fontWeight: '700' }], // 18/24
        'body-strong-xl': ['1.25rem',  { lineHeight: '1.75rem',  letterSpacing: '-0.25px', fontWeight: '700' }], // 20/28
      },`;

/* ----------------------------------------------------------------------------
 * 6) Assemble the file.
 * -------------------------------------------------------------------------- */
const semantic = buildSemanticColors();
const colorsObj = {
  white: '#ffffff', black: '#000000', transparent: 'transparent', current: 'currentColor',
  base: semantic.base, inverse: semantic.inverse,
  tint: semantic.tint, text: semantic.text, main: semantic.main,
  palette,
};

const out = `/**
 * tailwind.config.js — ForgeX | Library design system
 * Auto-generated by build-tokens.js from Figma variable reads.
 *
 * COLOR ARCHITECTURE (mirrors the Figma collections)
 * --------------------------------------------------
 * • palette  -> primitive ramps, mode-agnostic, exposed as \`palette-<family>-<step>\`
 *               (e.g. bg-palette-brand-400). You normally don't use these directly.
 * • theme    -> semantic tokens (base, inverse, tint/*, text/*, main/*). These are
 *               CSS variables that flip with the mode: light on :root, dark on .dark.
 *               Use these in product code: bg-base, text-text-neutral-100,
 *               bg-tint-brand-200, bg-main-brand (=.../base), text-main-warning-contrast.
 *
 * Dark mode is class-based: add \`class="dark"\` on <html> to switch.
 * The :root / .dark variable values are injected by the plugin at the bottom.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  darkMode: 'class',
  theme: {
    // Figma values only — replaces Tailwind's default breakpoints (large-desktop-first).
    screens: {
      min: '1920px', // breakpoint/width/min (= breakpoint/width/default)
      max: '2160px', // breakpoint/width/max
    },

    extend: {
      colors: ${printObj(colorsObj, 3)},

${STATIC}
    },
  },
  plugins: [
    // Injects theme token values. Light on :root, dark under .dark.
    function ({ addBase }) {
      addBase({
        ':root': {
${printVarBlock(rootVars, 5)}
        },
        '.dark': {
${printVarBlock(darkVars, 5)}
        },
      });
    },
  ],
};
`;

fs.writeFileSync('tailwind.config.js', out);
console.log('Wrote tailwind.config.js (' + out.length + ' bytes)');
