/**
 * Phase 1 Lifter Fixture Runner
 *
 * Single test runner for the entire Phase 1 corpus. Activates fixtures as
 * implementation Steps land. Phase 1 exit requires all 13 fixtures active
 * and passing.
 *
 * Active (Step 1):
 *   - canary_punned_construct_rejection — typed UnsupportedConstructError
 *     with documented `construct` field per case
 *   - canary_iri_canonicalization — three input IRI forms produce
 *     byte-identical lifted FOL
 *   - p1_abox_assertions — ClassAssertion / ObjectPropertyAssertion /
 *     DataPropertyAssertion lift to expected FOL atoms
 *   - p1_owl_same_and_different — sameAs / differentFrom lift to facts
 *
 * Active (Step 2):
 *   - p1_subclass_chain — SubClassOf chain lifts to Horn implications
 *   - p1_equivalent_and_disjoint_named — EquivalentClasses (mutual
 *     implication) + DisjointWith (conjunction → ⊥)
 *   - p1_restrictions_object_value — someValuesFrom (existential),
 *     allValuesFrom (universal-implication), hasValue (fact assertion)
 *
 * Deferred (Step 3-9):
 *   - canary_domain_range_existential (Step 3)
 *   - canary_same_as_propagation (Step 4)
 *   - p1_prov_domain_range (Step 3)
 *   - p1_property_characteristics (Step 5; gates Skolem ADR)
 *   - p1_blank_node_anonymous_restriction (Step 6)
 *   - p1_restrictions_cardinality (Step 7; second consumer of Skolem ADR)
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
  await readFile(path, "utf-8"); // existence check
  const url = "file:///" + path.replace(/\\/g, "/");
  const mod = await import(url);
  return { fixture: mod.fixture, meta: mod.meta };
}

// ===========================================================================
// Helper machinery for canary-style assertions (per SME N1 — added now so
// Step 3 doesn't have to invent it under deadline; unused until then)
// ===========================================================================

/**
 * Assert that NONE of the given forbidden FOL patterns is structurally
 * present anywhere in the lifted FOL state. A "pattern" is a partial
 * FOLAxiom-shaped object; `subtreeMatches` walks the lifted tree and
 * returns true if any subtree is a structural superset of the pattern
 * (every key the pattern declares is matched; extra keys in the lifted
 * subtree are permitted).
 *
 * Used by canary fixtures whose intent is "the wrong shape MUST be absent"
 * (e.g., canary_domain_range_existential's existential-synthesis patterns).
 */
export function assertForbiddenPatterns(
  lifted: unknown,
  forbiddenPatterns: Array<{ description: string; pattern: unknown }>
): void {
  for (const fp of forbiddenPatterns) {
    if (subtreeMatchesAnywhere(lifted, fp.pattern)) {
      throw new Error(
        `Forbidden FOL pattern present in lifted state: ${fp.description}`
      );
    }
  }
}

function subtreeMatchesAnywhere(node: unknown, pattern: unknown): boolean {
  if (matchesShape(node, pattern)) return true;
  if (Array.isArray(node)) {
    return node.some((child) => subtreeMatchesAnywhere(child, pattern));
  }
  if (node !== null && typeof node === "object") {
    return Object.values(node as Record<string, unknown>).some((child) =>
      subtreeMatchesAnywhere(child, pattern)
    );
  }
  return false;
}

function matchesShape(node: unknown, pattern: unknown): boolean {
  if (pattern === undefined) return true;
  if (pattern === null) return node === null;
  if (typeof pattern !== "object") return node === pattern;
  if (Array.isArray(pattern)) {
    if (!Array.isArray(node)) return false;
    if (node.length < pattern.length) return false;
    return pattern.every((p, i) => matchesShape(node[i], p));
  }
  if (node === null || typeof node !== "object") return false;
  return Object.keys(pattern as Record<string, unknown>).every((k) =>
    matchesShape(
      (node as Record<string, unknown>)[k],
      (pattern as Record<string, unknown>)[k]
    )
  );
}

/**
 * Assert that the expected-query expectations from a canary fixture hold
 * against an evaluator. Phase 1 has no evaluator (Phase 3 deliverable);
 * this helper is wired now so canary fixtures whose `expectedQueries` field
 * activates at Phase 4 (cross-phase activation pattern per architect Gap C
 * resolution) can use it without inventing assertion machinery on the day.
 *
 * The `evaluate` parameter is a caller-supplied function with the API §7.1
 * signature; Phase 1 callers pass null which causes this helper to no-op
 * (consistent with the "deferred" status of every fixture that uses it).
 */
export async function assertExpectedQueries(
  expectedQueries: Array<{
    query: string;
    expectedResult: string;
    reason?: string;
    note?: string;
  }>,
  evaluate:
    | ((query: string) => Promise<{ result: string; reason?: string }>)
    | null
): Promise<void> {
  if (evaluate === null) {
    // Phase 1 — no evaluator yet. Helper is wired for Phase 3 / Phase 4
    // activation per the architect's cross-phase activation pattern.
    return;
  }
  for (const eq of expectedQueries) {
    const r = await evaluate(eq.query);
    if (r.result !== eq.expectedResult) {
      throw new Error(
        `Query "${eq.query}" returned result "${r.result}", expected "${eq.expectedResult}"${eq.note ? ` (${eq.note})` : ""}`
      );
    }
    if (eq.reason !== undefined && r.reason !== eq.reason) {
      throw new Error(
        `Query "${eq.query}" returned reason "${r.reason}", expected "${eq.reason}"`
      );
    }
  }
}

// ===========================================================================
// STEP 1 — punted-construct rejection, IRI canonicalization, ABox
// ===========================================================================

await report(
  "canary_punned_construct_rejection: every case throws UnsupportedConstructError with documented construct",
  async () => {
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
        `case "${c.label}": expected UnsupportedConstructError, got ${
          thrown === null ? "no throw" : (thrown as Error).constructor.name
        }`
      );
      ok(thrown instanceof OFBTError, `case "${c.label}": typed error must extend OFBTError`);
      const construct = (thrown as UnsupportedConstructError).construct;
      strictEqual(
        construct,
        c.expectedThrow.construct,
        `case "${c.label}": construct field "${construct}" !== expected "${c.expectedThrow.construct}"`
      );
    }
  }
);

// SME B1 regression: punning detection MUST cover IRIs introduced via
// SubClassOf / EquivalentClasses / DisjointWith / restriction fillers /
// ObjectPropertyDomain.domain — not just ClassDefinition. Earlier
// `collectClassIRIs` only walked ClassDefinition + ABox ClassAssertion,
// silently false-negativing on the most common ontology shapes. This
// inline regression test pins the wider walker so the canary's intent
// (catching the wrong shape's absence) cannot regress.
await report(
  "B1 regression: punning detection covers IRIs introduced via SubClassOf",
  async () => {
    const subClassOfPunningInput = {
      ontologyIRI: "http://example.org/test/punning_via_subclassof",
      prefixes: {},
      tbox: [
        {
          "@type": "SubClassOf" as const,
          subClass: { "@type": "Class" as const, iri: "http://example.org/test/Color" },
          superClass: { "@type": "Class" as const, iri: "http://example.org/test/Hue" },
        },
      ],
      abox: [
        {
          "@type": "ObjectPropertyAssertion" as const,
          property: "http://example.org/test/Color",
          source: "http://example.org/test/apple",
          target: "http://example.org/test/red",
        },
      ],
      rbox: [],
    };
    let thrown: unknown = null;
    try {
      await owlToFol(subClassOfPunningInput);
    } catch (e) {
      thrown = e;
    }
    ok(
      thrown instanceof UnsupportedConstructError,
      `expected UnsupportedConstructError, got ${
        thrown === null ? "no throw" : (thrown as Error).constructor.name
      }`
    );
    strictEqual((thrown as UnsupportedConstructError).construct, "punning");
  }
);

// SME B1 regression (companion): punning detection covers IRIs introduced
// via ObjectPropertyDomain.domain — another path the earlier walker missed.
await report(
  "B1 regression: punning detection covers IRIs introduced via ObjectPropertyDomain.domain",
  async () => {
    const domainPunningInput = {
      ontologyIRI: "http://example.org/test/punning_via_domain",
      prefixes: {},
      tbox: [],
      abox: [
        {
          "@type": "ObjectPropertyAssertion" as const,
          property: "http://example.org/test/Animal",
          source: "http://example.org/test/spot",
          target: "http://example.org/test/dog",
        },
      ],
      rbox: [
        {
          "@type": "ObjectPropertyDomain" as const,
          property: "http://example.org/test/hasOwner",
          domain: { "@type": "Class" as const, iri: "http://example.org/test/Animal" },
        },
      ],
    };
    let thrown: unknown = null;
    try {
      await owlToFol(domainPunningInput);
    } catch (e) {
      thrown = e;
    }
    ok(
      thrown instanceof UnsupportedConstructError,
      `expected UnsupportedConstructError, got ${
        thrown === null ? "no throw" : (thrown as Error).constructor.name
      }`
    );
    strictEqual((thrown as UnsupportedConstructError).construct, "punning");
  }
);

// SME B2 regression: cardinality restrictions throw rather than fall
// through to a wrong-arity placeholder atom. p1_restrictions_cardinality
// is correctly deferred in the runner, but any ontology with a cardinality
// restriction that the deferred runner doesn't exercise must still get
// honest-admission failure rather than silent FOL corruption.
await report(
  "B2 regression: cardinality restriction throws UnsupportedConstructError (no wrong-arity fall-through)",
  async () => {
    const cardinalityInput = {
      ontologyIRI: "http://example.org/test/cardinality_throw",
      prefixes: {},
      tbox: [
        {
          "@type": "SubClassOf" as const,
          subClass: { "@type": "Class" as const, iri: "http://example.org/test/HasTwoOrMore" },
          superClass: {
            "@type": "Restriction" as const,
            onProperty: "http://example.org/test/hasChild",
            minCardinality: 2,
          },
        },
      ],
      abox: [],
      rbox: [],
    };
    let thrown: unknown = null;
    try {
      await owlToFol(cardinalityInput);
    } catch (e) {
      thrown = e;
    }
    ok(
      thrown instanceof UnsupportedConstructError,
      `expected UnsupportedConstructError, got ${
        thrown === null ? "no throw" : (thrown as Error).constructor.name
      }`
    );
    strictEqual(
      (thrown as UnsupportedConstructError).construct,
      "cardinality-restriction"
    );
    // Suggestion field carries the Step 7 deferral context for consumers
    // catching the error programmatically.
    ok(
      (thrown as UnsupportedConstructError).suggestion?.includes("Step 7"),
      "suggestion field should reference Step 7 deferral"
    );
  }
);

await report(
  "canary_iri_canonicalization: three input forms produce byte-identical lifted FOL",
  async () => {
    const { fixture } = await loadFixture("canary_iri_canonicalization.fixture.js");
    const liftedFull = await owlToFol(fixture.inputs.fullURI);
    const liftedCurie = await owlToFol(fixture.inputs.curie);
    const liftedBare = await owlToFol(fixture.inputs.bareURI);

    const sFull = stableStringify(liftedFull);
    const sCurie = stableStringify(liftedCurie);
    const sBare = stableStringify(liftedBare);

    strictEqual(sFull, sCurie, "fullURI vs curie produce different FOL");
    strictEqual(sFull, sBare, "fullURI vs bareURI produce different FOL");

    const expectedPredicate = fixture.expectedFOLAcrossInputs[0].predicate;
    ok(
      sFull.includes(JSON.stringify(expectedPredicate)),
      `lifted FOL does not contain expected expanded predicate "${expectedPredicate}"`
    );
  }
);

await report("p1_abox_assertions: ABox lifts to expected FOL atoms", async () => {
  const { fixture } = await loadFixture("p1_abox_assertions.fixture.js");
  const lifted = await owlToFol(fixture.input);
  deepStrictEqual(lifted, fixture.expectedFOL);
});

await report(
  "p1_owl_same_and_different: SameIndividual / DifferentIndividuals lift to reserved-predicate facts",
  async () => {
    const { fixture } = await loadFixture("p1_owl_same_and_different.fixture.js");
    const lifted = await owlToFol(fixture.input);
    deepStrictEqual(lifted, fixture.expectedFOL);
  }
);

// ===========================================================================
// STEP 2 — TBox SubClassOf / EquivalentClasses / DisjointWith + restrictions
// ===========================================================================

await report("p1_subclass_chain: SubClassOf chain lifts to Horn implications", async () => {
  const { fixture } = await loadFixture("p1_subclass_chain.fixture.js");
  const lifted = await owlToFol(fixture.input);
  deepStrictEqual(lifted, fixture.expectedFOL);
});

await report(
  "p1_equivalent_and_disjoint_named: EquivalentClasses pair → mutual implication; DisjointWith → conjunction implies ⊥",
  async () => {
    const { fixture } = await loadFixture("p1_equivalent_and_disjoint_named.fixture.js");
    const lifted = await owlToFol(fixture.input);
    deepStrictEqual(lifted, fixture.expectedFOL);
  }
);

await report(
  "p1_restrictions_object_value: someValuesFrom (existential), allValuesFrom (universal-implication), hasValue (fact)",
  async () => {
    const { fixture } = await loadFixture("p1_restrictions_object_value.fixture.js");
    const lifted = await owlToFol(fixture.input);
    deepStrictEqual(lifted, fixture.expectedFOL);
  }
);

// ===========================================================================
// STEP 3 — RBox ObjectPropertyDomain + ObjectPropertyRange (HIGH-PRIORITY
// conditional translation per API §3.7.1; defense-in-depth via two fixtures)
// ===========================================================================

await report(
  "p1_prov_domain_range: domain/range axioms lift to conditional universals (right shape)",
  async () => {
    const { fixture } = await loadFixture("p1_prov_domain_range.fixture.js");
    const lifted = await owlToFol(fixture.input);
    deepStrictEqual(lifted, fixture.expectedFOL);
  }
);

await report(
  "canary_domain_range_existential: forbidden existential-synthesis patterns are absent (wrong shape)",
  async () => {
    const { fixture } = await loadFixture("canary_domain_range_existential.fixture.js");
    const lifted = await owlToFol(fixture.input);
    // SME N1 helper put to its first real use: assert the wrong-shape
    // patterns named in the canary's forbiddenFOLPatterns are absent
    // anywhere in the lifted FOL state.
    assertForbiddenPatterns(lifted, fixture.forbiddenFOLPatterns);
    // expectedQueries on this canary activate at Phase 4 (entailment-query
    // verification requires an evaluator, deferred to Phase 3 / Phase 4
    // per the cross-phase activation pattern). Helper is wired with null
    // evaluator and noops until then.
    await assertExpectedQueries(fixture.expectedQueries, null);
  }
);

// ===========================================================================
// DEFERRED — Steps 4-7
// ===========================================================================

defer(
  "canary_same_as_propagation",
  "deferred to Step 4 (identity propagation through other predicates per spec §5.5.2)"
);

defer(
  "p1_property_characteristics",
  "deferred to Step 5 (Functional/Transitive/Symmetric/InverseOf with cycle-guarded rewrites + Skolem ADR)"
);

defer(
  "p1_blank_node_anonymous_restriction",
  "deferred to Step 6 (RDFC-1.0 blank-node canonicalization via rdf-canonize)"
);

defer(
  "p1_restrictions_cardinality",
  "deferred to Step 7 (cardinality restriction lifting + Skolem ADR fill-in)"
);

// ===========================================================================
// Summary
// ===========================================================================

console.log(`\n  ${passed} passed, ${failed} failed, ${deferred} deferred (future Step)`);

if (failed > 0) {
  process.exit(1);
}
