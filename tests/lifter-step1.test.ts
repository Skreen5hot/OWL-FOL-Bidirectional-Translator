/**
 * Phase 1 Step 1 — Lifter Fixture Runner
 *
 * Exercises the corpus fixtures against the Step 1 owlToFol surface:
 *   - canary_punned_construct_rejection — every case throws
 *     UnsupportedConstructError with the documented `construct` field
 *   - canary_iri_canonicalization — three input IRI forms produce
 *     byte-identical lifted FOL
 *   - p1_abox_assertions — ClassAssertion / ObjectPropertyAssertion /
 *     DataPropertyAssertion lift to the expected FOL atoms
 *   - p1_owl_same_and_different — sameAs / differentFrom lift to facts
 *
 * Other corpus fixtures (TBox / RBox / restrictions / domain-range / blank
 * nodes / cardinality / property characteristics) are explicitly DEFERRED to
 * Step 2-9; this runner reports them as `deferred`, not `failed`. As later
 * steps fill in those constructs, this runner activates the additional
 * fixtures rather than introducing new test files.
 */

import { strictEqual, deepStrictEqual, ok } from "node:assert";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { owlToFol } from "../src/kernel/lifter.js";
import { stableStringify } from "../src/kernel/canonicalize.js";
import { UnsupportedConstructError, OFBTError } from "../src/kernel/errors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..", "..");
const corpusDir = resolve(projectRoot, "tests", "corpus");

let passed = 0;
let failed = 0;
let deferred = 0;

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

function defer(name: string, reason: string): void {
  console.log(`  ∘ DEFER: ${name} — ${reason}`);
  deferred++;
}

async function loadFixture(file: string): Promise<{ fixture: any; meta: any }> {
  const path = resolve(corpusDir, file);
  // Verify the fixture file exists; load via dynamic import of a file:// URL.
  await readFile(path, "utf-8");
  const url = "file:///" + path.replace(/\\/g, "/");
  const mod = await import(url);
  return { fixture: mod.fixture, meta: mod.meta };
}

// ---------------------------------------------------------------------------
// canary_punned_construct_rejection
// ---------------------------------------------------------------------------

await report("canary_punned_construct_rejection: every case throws UnsupportedConstructError with documented construct", async () => {
  const { fixture } = await loadFixture("canary_punned_construct_rejection.fixture.js");
  for (const c of fixture.cases) {
    let thrown: unknown = null;
    try {
      await owlToFol(c.input);
    } catch (e) {
      thrown = e;
    }
    ok(
      thrown instanceof UnsupportedConstructError,
      `case "${c.label}": expected UnsupportedConstructError, got ${thrown === null ? "no throw" : (thrown as Error).constructor.name}`
    );
    ok(
      thrown instanceof OFBTError,
      `case "${c.label}": typed error must extend OFBTError`
    );
    const construct = (thrown as UnsupportedConstructError).construct;
    strictEqual(
      construct,
      c.expectedThrow.construct,
      `case "${c.label}": construct field "${construct}" !== expected "${c.expectedThrow.construct}"`
    );
  }
});

// ---------------------------------------------------------------------------
// canary_iri_canonicalization
// ---------------------------------------------------------------------------

await report("canary_iri_canonicalization: three input forms produce byte-identical lifted FOL", async () => {
  const { fixture } = await loadFixture("canary_iri_canonicalization.fixture.js");
  const liftedFull = await owlToFol(fixture.inputs.fullURI);
  const liftedCurie = await owlToFol(fixture.inputs.curie);
  const liftedBare = await owlToFol(fixture.inputs.bareURI);

  const sFull = stableStringify(liftedFull);
  const sCurie = stableStringify(liftedCurie);
  const sBare = stableStringify(liftedBare);

  strictEqual(sFull, sCurie, "fullURI vs curie produce different FOL");
  strictEqual(sFull, sBare, "fullURI vs bareURI produce different FOL");

  // Spot-check the canonical predicate is the expanded full URI form
  // (per API §3.10.3) — guards against a regression where all three forms
  // collapse to the same wrong shape.
  const expectedPredicate = fixture.expectedFOLAcrossInputs[0].predicate;
  ok(sFull.includes(JSON.stringify(expectedPredicate)), `lifted FOL does not contain expected expanded predicate "${expectedPredicate}"`);
});

// ---------------------------------------------------------------------------
// p1_abox_assertions
// ---------------------------------------------------------------------------

await report("p1_abox_assertions: ABox lifts to expected FOL atoms", async () => {
  const { fixture } = await loadFixture("p1_abox_assertions.fixture.js");
  const lifted = await owlToFol(fixture.input);
  deepStrictEqual(lifted, fixture.expectedFOL);
});

// ---------------------------------------------------------------------------
// p1_owl_same_and_different
// ---------------------------------------------------------------------------

await report("p1_owl_same_and_different: SameIndividual / DifferentIndividuals lift to reserved-predicate facts", async () => {
  const { fixture } = await loadFixture("p1_owl_same_and_different.fixture.js");
  const lifted = await owlToFol(fixture.input);
  deepStrictEqual(lifted, fixture.expectedFOL);
});

// ---------------------------------------------------------------------------
// canary_domain_range_existential — DEFERRED to Step 3 (needs domain/range
// conditional translation, which Step 1 does not implement)
// ---------------------------------------------------------------------------

defer(
  "canary_domain_range_existential",
  "deferred to Step 3 (PROV-O domain/range conditional translation)"
);

// ---------------------------------------------------------------------------
// canary_same_as_propagation — DEFERRED to Step 4 (needs identity-aware
// predicate-variant injection per spec §5.5.2; Step 1 emits sameAs facts
// but does not propagate identity through other predicates)
// ---------------------------------------------------------------------------

defer(
  "canary_same_as_propagation",
  "deferred to Step 4 (identity propagation through other predicates per spec §5.5.2)"
);

// ---------------------------------------------------------------------------
// p1_subclass_chain — DEFERRED to Step 2 (TBox SubClassOf)
// ---------------------------------------------------------------------------

defer("p1_subclass_chain", "deferred to Step 2 (TBox SubClassOf lifting)");

// ---------------------------------------------------------------------------
// p1_equivalent_and_disjoint_named — DEFERRED to Step 2
// ---------------------------------------------------------------------------

defer(
  "p1_equivalent_and_disjoint_named",
  "deferred to Step 2 (TBox EquivalentClasses + DisjointWith lifting)"
);

// ---------------------------------------------------------------------------
// p1_restrictions_object_value — DEFERRED to Step 2
// ---------------------------------------------------------------------------

defer(
  "p1_restrictions_object_value",
  "deferred to Step 2 (someValuesFrom / allValuesFrom / hasValue restriction lifting)"
);

// ---------------------------------------------------------------------------
// p1_restrictions_cardinality — DEFERRED to Step 7
// ---------------------------------------------------------------------------

defer(
  "p1_restrictions_cardinality",
  "deferred to Step 7 (cardinality restriction lifting + Skolem ADR fill-in)"
);

// ---------------------------------------------------------------------------
// p1_property_characteristics — DEFERRED to Step 5 (Skolem ADR + cycle-guarded rewrites)
// ---------------------------------------------------------------------------

defer(
  "p1_property_characteristics",
  "deferred to Step 5 (Functional/Transitive/Symmetric/InverseOf with cycle-guarded rewrites + Skolem ADR)"
);

// ---------------------------------------------------------------------------
// p1_prov_domain_range — DEFERRED to Step 3 (PROV-O domain/range conditional translation)
// ---------------------------------------------------------------------------

defer(
  "p1_prov_domain_range",
  "deferred to Step 3 (RBox ObjectPropertyDomain / ObjectPropertyRange conditional translation per API §3.7.1)"
);

// ---------------------------------------------------------------------------
// p1_blank_node_anonymous_restriction — DEFERRED to Step 6 (RDFC-1.0)
// ---------------------------------------------------------------------------

defer(
  "p1_blank_node_anonymous_restriction",
  "deferred to Step 6 (RDFC-1.0 blank-node canonicalization via rdf-canonize)"
);

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n  ${passed} passed, ${failed} failed, ${deferred} deferred (future Step)`);

if (failed > 0) {
  process.exit(1);
}
