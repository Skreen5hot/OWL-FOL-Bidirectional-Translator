/**
 * Phase 0.4 — Version Surfacing & Tau Prolog Verification Tests
 *
 * Verifies per API spec §9:
 *   - getVersionInfo returns the documented shape with apiSpecVersion: '0.1.7'
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

check("getVersionInfo reports apiSpecVersion === '0.1.7'", () => {
  strictEqual(getVersionInfo().apiSpecVersion, "0.1.7");
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

console.log(`\n  ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
