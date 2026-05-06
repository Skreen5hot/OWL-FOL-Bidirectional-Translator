/**
 * Phase 2 Projector Regression Tests
 *
 * Step 1: skeleton + prefixes parameter handling. Verifies the API §6.2
 * contract surface is in place; later Steps land strategy routing,
 * audit-artifact emission, and roundTripCheck.
 *
 * Spec-test discipline: this file lives alongside lifter-phase1.test.ts
 * and the determinism-100-run harness; it is not a frozen Phase-0 spec
 * test and may be amended as Phase 2 Steps land.
 */

import { strictEqual, deepStrictEqual, ok } from "node:assert";

import { folToOwl } from "../src/kernel/projector.js";
import {
  LOSS_SIGNATURE_SEVERITY_ORDER,
} from "../src/kernel/projector-types.js";
import { stableStringify } from "../src/kernel/canonicalize.js";

let passed = 0;
let failed = 0;

function report(name: string, fn: () => Promise<void> | void): Promise<void> {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    })
    .catch((e: unknown) => {
      console.error(`  ✗ FAIL: ${name}`);
      console.error(" ", e instanceof Error ? e.message : String(e));
      failed++;
    });
}

// ===========================================================================
// STEP 1 — folToOwl skeleton signature + prefixes parameter handling
// ===========================================================================

await report(
  "folToOwl is exported, async, returns OWLConversionResult shape on empty input",
  async () => {
    const result = await folToOwl([]);
    ok(result, "result is defined");
    ok(result.ontology, "result.ontology is defined");
    ok(result.manifest, "result.manifest is defined");
    deepStrictEqual(result.newRecoveryPayloads, [], "newRecoveryPayloads is empty array");
    deepStrictEqual(result.newLossSignatures, [], "newLossSignatures is empty array");
    deepStrictEqual(result.ontology.tbox, [], "ontology.tbox empty");
    deepStrictEqual(result.ontology.abox, [], "ontology.abox empty");
    deepStrictEqual(result.ontology.rbox, [], "ontology.rbox empty");
  },
);

await report(
  "folToOwl: prefixes omitted → output ontology has no prefixes field (full URI form per API §3.10.4)",
  async () => {
    const result = await folToOwl([]);
    ok(
      !("prefixes" in result.ontology),
      "prefixes key absent when not supplied",
    );
  },
);

await report(
  "folToOwl: prefixes supplied → output ontology carries the prefix table verbatim",
  async () => {
    const prefixes = {
      bfo: "http://purl.obolibrary.org/obo/",
      ex: "http://example.org/test/",
    };
    const result = await folToOwl([], undefined, { prefixes });
    deepStrictEqual(result.ontology.prefixes, prefixes);
  },
);

await report(
  "folToOwl: ProjectionManifest carries projector version + operating mode (skeleton placeholders for source provenance)",
  async () => {
    const result = await folToOwl([]);
    ok(
      result.manifest.projectorVersion.startsWith("OFBT-"),
      `projectorVersion starts with OFBT-, got ${result.manifest.projectorVersion}`,
    );
    strictEqual(
      result.manifest.operatingMode,
      "permissive",
      "default operatingMode is permissive when arcCoverage not strict",
    );
    strictEqual(result.manifest.ontologyIRI, "");
    strictEqual(result.manifest.versionIRI, "");
    strictEqual(result.manifest.projectedFrom, "");
    strictEqual(result.manifest.activity.used, "");
  },
);

await report(
  "folToOwl: arcCoverage='strict' → manifest.operatingMode='strict'",
  async () => {
    const result = await folToOwl([], undefined, { arcCoverage: "strict" });
    strictEqual(result.manifest.operatingMode, "strict");
  },
);

await report(
  "folToOwl: deterministic — same input produces byte-identical canonicalized output",
  async () => {
    const prefixes = { ex: "http://example.org/test/" };
    const r1 = await folToOwl([], undefined, { prefixes });
    const r2 = await folToOwl([], undefined, { prefixes });
    strictEqual(stableStringify(r1), stableStringify(r2));
  },
);

await report(
  "folToOwl: input arrays are not mutated (kernel purity)",
  async () => {
    const axioms: never[] = [];
    const recoveryPayloads: never[] = [];
    const config = { prefixes: { ex: "http://example.org/test/" } };
    const beforeAxioms = stableStringify(axioms);
    const beforeRecovery = stableStringify(recoveryPayloads);
    const beforeConfig = stableStringify(config);
    await folToOwl(axioms, recoveryPayloads, config);
    strictEqual(stableStringify(axioms), beforeAxioms);
    strictEqual(stableStringify(recoveryPayloads), beforeRecovery);
    strictEqual(stableStringify(config), beforeConfig);
  },
);

// ===========================================================================
// LOSS_SIGNATURE_SEVERITY_ORDER — frozen contract per API §6.4.1
// ===========================================================================

await report(
  "LOSS_SIGNATURE_SEVERITY_ORDER: 8 entries in the spec-frozen ordering",
  () => {
    deepStrictEqual(
      [...LOSS_SIGNATURE_SEVERITY_ORDER],
      [
        "coherence_violation",
        "naf_residue",
        "arity_flattening",
        "closure_truncated",
        "unknown_relation",
        "bnode_introduced",
        "una_residue",
        "lexical_distinct_value_equal",
      ],
    );
  },
);

await report(
  "LOSS_SIGNATURE_SEVERITY_ORDER: frozen — mutation attempts throw or are silently ignored",
  () => {
    ok(Object.isFrozen(LOSS_SIGNATURE_SEVERITY_ORDER), "array is frozen");
  },
);

// ===========================================================================
// Summary
// ===========================================================================

console.log(`\n  ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
