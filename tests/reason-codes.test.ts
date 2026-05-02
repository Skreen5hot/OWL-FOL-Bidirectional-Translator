/**
 * Phase 0.3 — Frozen REASON_CODES Enum Tests
 *
 * Verifies per API spec §11:
 *   - Sixteen members exactly
 *   - Every member is exported with key === value
 *   - The object is frozen (mutation throws in strict mode)
 *   - The type guard isReasonCode behaves correctly
 *   - REASON_CODES_LIST contains the same set
 */

import { strictEqual, ok, deepStrictEqual, throws } from "node:assert";
import {
  REASON_CODES,
  REASON_CODES_LIST,
  isReasonCode,
  type ReasonCode,
} from "../src/kernel/reason-codes.js";

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

const EXPECTED_MEMBERS: readonly ReasonCode[] = [
  "consistent",
  "inconsistent",
  "satisfiable",
  "unsatisfiable",
  "open_world_undetermined",
  "model_not_found",
  "coherence_indeterminate",
  "step_cap_exceeded",
  "aggregate_step_cap_exceeded",
  "cycle_detected",
  "unbound_predicate",
  "unsupported_construct",
  "iri_format_error",
  "parse_error",
  "tau_prolog_version_mismatch",
  "arc_manifest_version_mismatch",
];

check("REASON_CODES has exactly 16 members per API spec §11", () => {
  strictEqual(Object.keys(REASON_CODES).length, 16);
});

check("Every expected member is present and key === value", () => {
  for (const m of EXPECTED_MEMBERS) {
    strictEqual(REASON_CODES[m], m, `${m} missing or value mismatch`);
  }
});

check("REASON_CODES is frozen — mutation throws in strict mode", () => {
  throws(
    () => {
      // ESM is always strict; assigning to a frozen-object property throws.
      (REASON_CODES as Record<string, string>)["new_member"] = "new_member";
    },
    TypeError
  );
});

check("REASON_CODES is frozen — overwriting an existing member throws", () => {
  throws(
    () => {
      (REASON_CODES as Record<string, string>)["consistent"] = "tampered";
    },
    TypeError
  );
});

check("REASON_CODES_LIST contains the same set as REASON_CODES", () => {
  const listSet = new Set(REASON_CODES_LIST);
  const codeSet = new Set(EXPECTED_MEMBERS);
  deepStrictEqual([...listSet].sort(), [...codeSet].sort());
});

check("isReasonCode returns true for every member", () => {
  for (const m of EXPECTED_MEMBERS) {
    ok(isReasonCode(m), `isReasonCode('${m}') should be true`);
  }
});

check("isReasonCode returns false for unknown strings, numbers, null, undefined", () => {
  ok(!isReasonCode("foo"));
  ok(!isReasonCode(""));
  ok(!isReasonCode(42));
  ok(!isReasonCode(null));
  ok(!isReasonCode(undefined));
  ok(!isReasonCode({}));
});

console.log(`\n  ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
