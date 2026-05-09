/**
 * Phase 0.4 — Version Surfacing & Tau Prolog Verification Tests
 *
 * Verifies per API spec §9:
 *   - getVersionInfo returns the documented shape with apiSpecVersion: '0.1.8'
 *     (bumped at Phase 3 Step 8 implementation cycle 2026-05-09 per
 *     Q-3-Step8-A routing pre-ratified at Step 6 Finding 4 disposition;
 *     reflects additive REASON_CODES extension structural_annotation_mismatch)
 *   - getVersionInfo omits buildTimestamp in the default (published-build) path
 *   - verifyTauPrologVersion returns {match: true, expected: '0.3.4', found: '0.3.4'}
 *     when v0.3.4 is loaded
 *   - verifyTauPrologVersion returns {match: false, ...} when a different version is loaded
 *   - verifyTauPrologVersion returns {match: false, found: null} when nothing is loaded
 */

import { strictEqual, ok } from "node:assert";
import { getVersionInfo, verifyTauPrologVersion } from "../src/kernel/version.js";
import { registerTauPrologProbe } from "../src/kernel/tau-prolog-probe.js";

let passed = 0;
let failed = 0;
function check(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(" ", e instanceof Error ? e.message : String(e));
    failed++;
  }
}

// --- getVersionInfo ---

check("getVersionInfo returns documented shape", () => {
  const v = getVersionInfo();
  ok(typeof v.libraryVersion === "string");
  ok(typeof v.conversionRulesVersion === "string");
  ok(typeof v.tauPrologVersion === "string");
  ok(typeof v.arcManifestVersion === "string");
  ok(typeof v.apiSpecVersion === "string");
});

check("getVersionInfo reports apiSpecVersion === '0.1.8' (Phase 3 Step 8 minor-version bump per Q-3-Step8-A)", () => {
  strictEqual(getVersionInfo().apiSpecVersion, "0.1.8");
});

check("getVersionInfo reports tauPrologVersion === '0.3.4' (pinned)", () => {
  strictEqual(getVersionInfo().tauPrologVersion, "0.3.4");
});

check("getVersionInfo omits buildTimestamp in published-build path", () => {
  const v = getVersionInfo();
  strictEqual(v.buildTimestamp, undefined);
});

check("getVersionInfo is deterministic across calls", () => {
  const a = getVersionInfo();
  const b = getVersionInfo();
  strictEqual(JSON.stringify(a), JSON.stringify(b));
});

// --- verifyTauPrologVersion ---

check("verifyTauPrologVersion returns match=true when probe reports '0.3.4'", () => {
  registerTauPrologProbe(() => "0.3.4");
  const r = verifyTauPrologVersion();
  strictEqual(r.match, true);
  strictEqual(r.expected, "0.3.4");
  strictEqual(r.found, "0.3.4");
  registerTauPrologProbe(null);
});

check("verifyTauPrologVersion returns match=false when probe reports a different version", () => {
  registerTauPrologProbe(() => "0.3.3");
  const r = verifyTauPrologVersion();
  strictEqual(r.match, false);
  strictEqual(r.expected, "0.3.4");
  strictEqual(r.found, "0.3.3");
  registerTauPrologProbe(null);
});

check("verifyTauPrologVersion returns match=false, found=null when probe reports null", () => {
  registerTauPrologProbe(() => null);
  const r = verifyTauPrologVersion();
  strictEqual(r.match, false);
  strictEqual(r.found, null);
  registerTauPrologProbe(null);
});

check("verifyTauPrologVersion returns match=false, found=null when no probe registered and no globalThis.pl", () => {
  registerTauPrologProbe(null);
  const g = globalThis as { pl?: unknown };
  const saved = g.pl;
  delete g.pl;
  try {
    const r = verifyTauPrologVersion();
    strictEqual(r.match, false);
    strictEqual(r.found, null);
  } finally {
    if (saved !== undefined) g.pl = saved;
  }
});

check("verifyTauPrologVersion swallows probe exceptions and returns found=null", () => {
  registerTauPrologProbe(() => {
    throw new Error("probe boom");
  });
  const r = verifyTauPrologVersion();
  strictEqual(r.match, false);
  strictEqual(r.found, null);
  registerTauPrologProbe(null);
});

// --- pl.version object-shape fallback (9.4-amendment-3, 2026-05-09) ---
// Tau Prolog 0.3.x exposes pl.version as { major, minor, patch, status }
// (see node_modules/tau-prolog/modules/core.js ~line 4); the probe must
// normalize that object to the pinned "M.m.p" string. Browser deploy
// regression: previously the typeof === "string" guard rejected the
// object form and reported "(not loaded)" even when pl was loaded.

check("readTauPrologVersion reads object-shape globalThis.pl.version (Tau Prolog 0.3.x browser-load shape)", () => {
  registerTauPrologProbe(null);
  const g = globalThis as { pl?: unknown };
  const saved = g.pl;
  g.pl = { version: { major: 0, minor: 3, patch: 4, status: "beta" } };
  try {
    const r = verifyTauPrologVersion();
    strictEqual(r.match, true);
    strictEqual(r.expected, "0.3.4");
    strictEqual(r.found, "0.3.4");
  } finally {
    if (saved === undefined) delete g.pl; else g.pl = saved;
  }
});

check("readTauPrologVersion still reads string-shape globalThis.pl.version (back-compat with older builds)", () => {
  registerTauPrologProbe(null);
  const g = globalThis as { pl?: unknown };
  const saved = g.pl;
  g.pl = { version: "0.3.4" };
  try {
    const r = verifyTauPrologVersion();
    strictEqual(r.match, true);
    strictEqual(r.found, "0.3.4");
  } finally {
    if (saved === undefined) delete g.pl; else g.pl = saved;
  }
});

check("readTauPrologVersion returns null when pl.version is malformed (missing patch)", () => {
  registerTauPrologProbe(null);
  const g = globalThis as { pl?: unknown };
  const saved = g.pl;
  g.pl = { version: { major: 0, minor: 3 } };
  try {
    const r = verifyTauPrologVersion();
    strictEqual(r.match, false);
    strictEqual(r.found, null);
  } finally {
    if (saved === undefined) delete g.pl; else g.pl = saved;
  }
});

console.log(`\n  ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
