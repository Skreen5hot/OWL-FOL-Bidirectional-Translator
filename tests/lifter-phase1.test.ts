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
import {
  assertForbiddenPatterns,
  assertRequiredPattern,
  assertExpectedQueries,
} from "./lifter-phase1-helpers.js";

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

// Helper machinery extracted to tests/lifter-phase1-helpers.ts at Step 5
// entry per architect's O3 ruling. See that file for assertForbiddenPatterns,
// assertRequiredPattern, assertExpectedQueries, and the structural-pattern
// matchers (subtreeMatchesAnywhere + matchesShape).

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
// STEP 4 — owl:sameAs identity propagation per spec §5.5.2
// (lifter rewrites to satisfy the canary contract, not vice versa)
// ===========================================================================

await report(
  "canary_same_as_propagation: lifter emits identity-rewrite rules for predicates used in ABox alongside SameIndividual",
  async () => {
    const { fixture } = await loadFixture("canary_same_as_propagation.fixture.js");
    const lifted = await owlToFol(fixture.input);

    // Structural check: the lifted FOL state MUST contain identity-rewrite
    // rules for `worksAt` (the binary predicate used in the canary's ABox
    // alongside the SameIndividual axiom). The two rules are:
    //   ∀x,y,z. worksAt(x,y) ∧ owl:sameAs(x,z) → worksAt(z,y)
    //   ∀x,y,z. worksAt(x,y) ∧ owl:sameAs(y,z) → worksAt(x,z)
    // Plus the equivalence axioms for owl:sameAs (refl/symm/trans).
    const worksAtIRI = "http://example.org/test/worksAt";

    // First-arg identity rewrite for worksAt.
    assertRequiredPattern(lifted, {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Universal",
        variable: "y",
        body: {
          "@type": "fol:Universal",
          variable: "z",
          body: {
            "@type": "fol:Implication",
            antecedent: {
              "@type": "fol:Conjunction",
              conjuncts: [
                {
                  "@type": "fol:Atom",
                  predicate: worksAtIRI,
                  arguments: [
                    { "@type": "fol:Variable", name: "x" },
                    { "@type": "fol:Variable", name: "y" },
                  ],
                },
                {
                  "@type": "fol:Atom",
                  predicate: "http://www.w3.org/2002/07/owl#sameAs",
                  arguments: [
                    { "@type": "fol:Variable", name: "x" },
                    { "@type": "fol:Variable", name: "z" },
                  ],
                },
              ],
            },
            consequent: {
              "@type": "fol:Atom",
              predicate: worksAtIRI,
              arguments: [
                { "@type": "fol:Variable", name: "z" },
                { "@type": "fol:Variable", name: "y" },
              ],
            },
          },
        },
      },
    }, "first-arg identity rewrite for worksAt");

    // Second-arg identity rewrite for worksAt.
    assertRequiredPattern(lifted, {
      "@type": "fol:Universal",
      body: {
        "@type": "fol:Universal",
        body: {
          "@type": "fol:Universal",
          body: {
            "@type": "fol:Implication",
            antecedent: {
              "@type": "fol:Conjunction",
              conjuncts: [
                { "@type": "fol:Atom", predicate: worksAtIRI },
                {
                  "@type": "fol:Atom",
                  predicate: "http://www.w3.org/2002/07/owl#sameAs",
                  arguments: [
                    { "@type": "fol:Variable", name: "y" },
                    { "@type": "fol:Variable", name: "z" },
                  ],
                },
              ],
            },
            consequent: {
              "@type": "fol:Atom",
              predicate: worksAtIRI,
              arguments: [
                { "@type": "fol:Variable", name: "x" },
                { "@type": "fol:Variable", name: "z" },
              ],
            },
          },
        },
      },
    }, "second-arg identity rewrite for worksAt");

    // owl:sameAs symmetry — required for the canary's query to derive
    // worksAt(superman, dailyplanet) from worksAt(clarkkent, dailyplanet)
    // plus sameAs(superman, clarkkent).
    assertRequiredPattern(lifted, {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Universal",
        variable: "y",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Atom",
            predicate: "http://www.w3.org/2002/07/owl#sameAs",
            arguments: [
              { "@type": "fol:Variable", name: "x" },
              { "@type": "fol:Variable", name: "y" },
            ],
          },
          consequent: {
            "@type": "fol:Atom",
            predicate: "http://www.w3.org/2002/07/owl#sameAs",
            arguments: [
              { "@type": "fol:Variable", name: "y" },
              { "@type": "fol:Variable", name: "x" },
            ],
          },
        },
      },
    }, "owl:sameAs symmetry axiom");

    // expectedQueries on this canary activate at Phase 3 (evaluator
    // available). Phase 1 satisfies the canary structurally — the rules
    // needed to derive the queries are present in the lifted state.
    await assertExpectedQueries(fixture.expectedQueries, null);
  }
);

// ===========================================================================
// STEP 5 — RBox property characteristics (Functional/Transitive/Symmetric)
//          + InverseObjectProperties bidirectional implication pair.
//          Cycle-guard layer translation per anticipated ADR-007: lifter
//          emits classical FOL; Phase 3 evaluator handles cycle-guarded
//          SLD ingestion.
// ===========================================================================

await report(
  "p1_property_characteristics: Functional/Transitive/Symmetric/InverseOf lift to classical FOL axioms (ADR-007 layer translation)",
  async () => {
    const { fixture } = await loadFixture("p1_property_characteristics.fixture.js");
    const lifted = await owlToFol(fixture.input);
    deepStrictEqual(lifted, fixture.expectedFOL);
  }
);

// ===========================================================================
// STEP 6 — Blank-node canonicalization (RDFC-1.0 b-node Skolem prefix per
//          ADR-007 §8). p1_blank_node_anonymous_restriction's structured-JS
//          input has no b-node references, so the existing variable-allocator
//          recursion (ADR-007 §2) handles determinism at the existential-
//          witness level. The b-node IRI form (`_:label`) is exercised by
//          an inline regression test below.
// ===========================================================================

await report(
  "p1_blank_node_anonymous_restriction: nested anonymous restrictions lift to deterministic existential witnesses (ADR-007 §2)",
  async () => {
    const { fixture } = await loadFixture("p1_blank_node_anonymous_restriction.fixture.js");
    const lifted = await owlToFol(fixture.input);
    deepStrictEqual(lifted, fixture.expectedFOL);
  }
);

// SME B3 (Step 4 review carry-forward) acknowledged — recommended fixture
// `p1_complement_of.fixture.js` for ObjectComplementOf coverage; deferred
// to Step 9 (Phase 1 exit) along with the `verifiedStatus` Draft → Verified
// promotion + 100-run determinism harness.

// Step 6 b-node IRI canonicalization regression test — verifies the
// `_:label` form is recognized by canonicalizeIRI and lifted to a
// deterministic Skolem constant under ADR-007 §8's BNODE_SKOLEM_PREFIX.
// Phase 1 corpus has no b-node-bearing input (parseOWL adapter doesn't
// exist yet); this regression test pins the b-node code path so Phase 4+
// when real RDF-parsed input lands, the canonicalization is already wired.
await report(
  "Step 6 b-node IRI regression: `_:label` form canonicalizes to deterministic Skolem constant under ADR-007 §8 prefix",
  async () => {
    const bnodeInput = {
      ontologyIRI: "http://example.org/test/p1_step6_bnode_regression",
      prefixes: {},
      tbox: [],
      abox: [
        {
          "@type": "ObjectPropertyAssertion" as const,
          property: "http://example.org/test/hasParent",
          source: "http://example.org/test/alice",
          // Turtle-style b-node label per RDFC-1.0 canonical form
          target: "_:c14n0",
        },
      ],
      rbox: [],
    };
    const lifted1 = await owlToFol(bnodeInput);
    const lifted2 = await owlToFol(bnodeInput);

    // The b-node target should canonicalize to the Skolem constant
    // https://ofbt.ontology-of-freedom.org/ns/0.1/bnode/c14n0
    const expectedSkolem =
      "https://ofbt.ontology-of-freedom.org/ns/0.1/bnode/c14n0";
    deepStrictEqual(lifted1, [
      {
        "@type": "fol:Atom",
        predicate: "http://example.org/test/hasParent",
        arguments: [
          { "@type": "fol:Constant", iri: "http://example.org/test/alice" },
          { "@type": "fol:Constant", iri: expectedSkolem },
        ],
      },
    ]);
    // Determinism: byte-identical across two runs (mini 2-run determinism
    // check; Step 9 100-run harness will broaden coverage).
    deepStrictEqual(lifted1, lifted2);
  }
);

// ===========================================================================
// DEFERRED — Step 7
// ===========================================================================


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
