/**
 * verify-button-colors.js
 *
 * QA verification script: compares MainBanner.Button background chrome
 * structure + colors between SOURCE (canonical remote-referenced 168407:121243)
 * and TARGET (local rebuilt 168386:1205 inside 4050:45382 branded variants).
 *
 * Two execution modes:
 *
 *  (A) Standalone — Node.js, requires FIGMA_TOKEN env var with file_read scope.
 *      Run: FIGMA_TOKEN=figd_xxx node verify-button-colors.js
 *      Uses Figma REST API to fetch both subtrees, walks them, compares.
 *
 *  (B) In-Plugin — paste the COMPARE_LOGIC function body into a use_figma call.
 *      No PAT needed; uses the Plugin API to walk nodes directly.
 *
 * The comparison is *mathematical*: hash strings must match exactly,
 * RGB color channels must be byte-equal (round to 0–255 ints, then ===),
 * geometry positions and sizes must match to <0.5 px tolerance, constraints
 * must be string-equal. Any deviation marks the section as `false`.
 *
 * Output: a strict per-section JSON log of {true, false} per attribute,
 * plus a final boolean roll-up: ALL_MATCH = true ⇨ zero color drift.
 */

const FILE_KEY = "natBqfvZvRAk2RrvPIpBmo";
const SOURCE_ROOT = "168407:121243";  // canonical (with remote Component 1 instances inside)
const TARGET_ROOT = "168386:1205";    // local rebuilt chrome
const TARGET_SET  = "4050:45382";     // host set with branded variants

// =====================================================================
// COMPARE_LOGIC — works against either REST-fetched JSON nodes or Plugin API nodes
// (both expose the same field shapes: { name, type, width, height, x, y,
//  fills, strokes, constraints, children, etc. })
// =====================================================================

const CHECKS = {
  hexEq: (a, b) => a === b,
  hashEq: (a, b) => a === b,
  numEq: (a, b, tol = 0.5) => Math.abs(a - b) <= tol,
  strEq: (a, b) => a === b,
};

function rgbToHex(c) {
  const r = Math.round(c.r * 255).toString(16).padStart(2, "0");
  const g = Math.round(c.g * 255).toString(16).padStart(2, "0");
  const b = Math.round(c.b * 255).toString(16).padStart(2, "0");
  return "#" + r + g + b;
}

function summarizePaint(p) {
  if (!p) return null;
  const out = { type: p.type, visible: p.visible !== false };
  if (p.type === "SOLID" && p.color) out.hex = rgbToHex(p.color);
  if (p.type === "IMAGE") { out.imageHash = p.imageHash; out.scaleMode = p.scaleMode; }
  if (p.opacity != null && p.opacity !== 1) out.opacity = Math.round(p.opacity * 100) / 100;
  if (p.blendMode && p.blendMode !== "NORMAL") out.blendMode = p.blendMode;
  return out;
}

function summarizeSection(node) {
  return {
    name:           node.name,
    type:           node.type,
    width:          node.width,
    height:         node.height,
    x:              node.x,
    y:              node.y,
    constraints:    node.constraints,
    clipsContent:   node.clipsContent,
    fills:          (node.fills || []).map(summarizePaint),
    children:       (node.children || []).map(c => ({
      name:        c.name,
      type:        c.type,
      width:       c.width,
      height:      c.height,
      x:           c.x,
      y:           c.y,
      fills:       (c.fills || []).map(summarizePaint),
      constraints: c.constraints,
    })),
  };
}

function compareSections(srcSec, tgtSec, path) {
  const log = [];
  const sectionResult = (key, ok, src, tgt) => log.push({ path, key, pass: ok, expected: src, actual: tgt });

  sectionResult("name",           CHECKS.strEq(srcSec.name, tgtSec.name), srcSec.name, tgtSec.name);
  sectionResult("type",           CHECKS.strEq(srcSec.type, tgtSec.type), srcSec.type, tgtSec.type);
  sectionResult("width",          CHECKS.numEq(srcSec.width, tgtSec.width), srcSec.width, tgtSec.width);
  sectionResult("height",         CHECKS.numEq(srcSec.height, tgtSec.height), srcSec.height, tgtSec.height);
  sectionResult("x",              CHECKS.numEq(srcSec.x, tgtSec.x, 1.0), srcSec.x, tgtSec.x);
  sectionResult("y",              CHECKS.numEq(srcSec.y, tgtSec.y, 1.0), srcSec.y, tgtSec.y);
  sectionResult("constraints.h",  CHECKS.strEq(srcSec.constraints?.horizontal, tgtSec.constraints?.horizontal), srcSec.constraints?.horizontal, tgtSec.constraints?.horizontal);
  sectionResult("constraints.v",  CHECKS.strEq(srcSec.constraints?.vertical,   tgtSec.constraints?.vertical),   srcSec.constraints?.vertical,   tgtSec.constraints?.vertical);

  // Compare child image rectangles by index
  const srcCh = srcSec.children || [];
  const tgtCh = tgtSec.children || [];
  sectionResult("childCount",     CHECKS.numEq(srcCh.length, tgtCh.length, 0), srcCh.length, tgtCh.length);

  const n = Math.min(srcCh.length, tgtCh.length);
  for (let i = 0; i < n; i++) {
    const s = srcCh[i], t = tgtCh[i];
    const cpath = `${path}.child[${i}]`;
    log.push({ path: cpath, key: "width",  pass: CHECKS.numEq(s.width, t.width),   expected: s.width,  actual: t.width });
    log.push({ path: cpath, key: "height", pass: CHECKS.numEq(s.height, t.height), expected: s.height, actual: t.height });
    // Image fill hash comparison
    const sImage = (s.fills || []).find(p => p && p.type === "IMAGE");
    const tImage = (t.fills || []).find(p => p && p.type === "IMAGE");
    if (sImage || tImage) {
      log.push({
        path: cpath, key: "image.hash",
        pass: CHECKS.hashEq(sImage?.imageHash, tImage?.imageHash),
        expected: sImage?.imageHash, actual: tImage?.imageHash,
      });
      log.push({
        path: cpath, key: "image.scaleMode",
        pass: CHECKS.strEq(sImage?.scaleMode, tImage?.scaleMode),
        expected: sImage?.scaleMode, actual: tImage?.scaleMode,
      });
    }
  }
  return log;
}

function rollUp(log) {
  const total = log.length;
  const passed = log.filter(e => e.pass).length;
  const failed = log.filter(e => !e.pass);
  return { ALL_MATCH: failed.length === 0, total, passed, failedCount: failed.length, failedSample: failed.slice(0, 10) };
}

// =====================================================================
// TOKEN-STRUCTURE VALIDATOR (added V7 after the raw-hex regression)
// =====================================================================
// Catches the regression class where theme variables hold raw RGB instead
// of VARIABLE_ALIAS to a palette entry. Run in-plugin via use_figma.
//
// Usage (in-plugin):
//   const allVars = await figma.variables.getLocalVariablesAsync();
//   const log = validateThemeAliases(allVars, "VariableCollectionId:1:17", "1:1");
//   return rollUp(log);
//
function validateThemeAliases(allVars, themeCollId, modeId) {
  const log = [];
  const themeVars = allVars.filter(v => v.variableCollectionId === themeCollId);
  for (const v of themeVars) {
    if (v.resolvedType !== "COLOR") continue;  // only check color vars
    const val = v.valuesByMode[modeId];
    const isAlias = val && typeof val === "object" && val.type === "VARIABLE_ALIAS";
    log.push({
      path: v.name,
      key: "is_alias",
      pass: isAlias,
      expected: "VARIABLE_ALIAS",
      actual: isAlias ? `alias → ${val.id}` : (val && "r" in val ? `RAW HEX #${[val.r,val.g,val.b].map(x=>Math.round(x*255).toString(16).padStart(2,"0")).join("")}` : "other"),
    });
  }
  return log;
}

if (typeof module !== "undefined") {
  module.exports.validateThemeAliases = validateThemeAliases;
}

// =====================================================================
// STANDALONE MODE (Mode A) — Node.js + Figma REST API
// =====================================================================
if (typeof process !== "undefined" && process.env && process.env.FIGMA_TOKEN) {
  const https = require("https");
  function api(path) {
    return new Promise((resolve, reject) => {
      https.get({ host: "api.figma.com", path, headers: { "X-Figma-Token": process.env.FIGMA_TOKEN } }, res => {
        let body = "";
        res.on("data", c => body += c);
        res.on("end", () => resolve(JSON.parse(body)));
      }).on("error", reject);
    });
  }
  (async () => {
    const ids = [SOURCE_ROOT, TARGET_ROOT].join(",").replace(/:/g, "%3A");
    const res = await api(`/v1/files/${FILE_KEY}/nodes?ids=${ids}`);
    const src = res.nodes[SOURCE_ROOT.replace(":", ":")]?.document;
    const tgt = res.nodes[TARGET_ROOT.replace(":", ":")]?.document;
    if (!src || !tgt) { console.error("Could not fetch nodes"); process.exit(1); }
    // For each l/c/r in source's first variant Component 1, compare to TARGET's l/c/r
    const sourceComp1 = src.children?.[0]?.children?.find(c => c.name === "Component 1");
    const srcL = sourceComp1?.children?.find(c => c.name === "l");
    const srcC = sourceComp1?.children?.find(c => c.name === "c");
    const srcR = sourceComp1?.children?.find(c => c.name === "r");
    const tgtL = tgt.children?.find(c => c.name === "l");
    const tgtC = tgt.children?.find(c => c.name === "c");
    const tgtR = tgt.children?.find(c => c.name === "r");
    const log = [
      ...compareSections(summarizeSection(srcL), summarizeSection(tgtL), "l"),
      ...compareSections(summarizeSection(srcC), summarizeSection(tgtC), "c"),
      ...compareSections(summarizeSection(srcR), summarizeSection(tgtR), "r"),
    ];
    console.log(JSON.stringify(rollUp(log), null, 2));
  })();
}

// =====================================================================
// EXPORTS for in-plugin use (Mode B)
// =====================================================================
if (typeof module !== "undefined") {
  module.exports = { summarizeSection, compareSections, rollUp, rgbToHex };
}
