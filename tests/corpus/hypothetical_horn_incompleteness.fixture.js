/**
 * Phase 3 fixture — Hypothetical-axiom case: base consistent, hypothetical introduces
 * Horn-incompleteness without inconsistency.
 *
 * Per ROADMAP §3.4 + architect Q-3-E ratification 2026-05-08 (corpus-before-code):
 *
 *   "hypothetical_horn_incompleteness.fixture.js — base KB consistent; axiomSet
 *    introduces Horn-incompleteness without inconsistency; checkConsistency(session,
 *    axiomSet) returns consistent: 'undetermined' with populated unverifiedAxioms"
 *
 * Status: Draft. Step 7 binding.
 *
 * ── The discrimination: hypothetical-extension is non-Horn but consistent ──
 *
 * Base KB (Horn-decidable, consistent):
 *   ClassAssertion(Person, alice)
 *
 * Hypothetical axiomSet (introduces non-Horn machinery without inconsistency):
 *   SubClassOf(Person, ObjectUnionOf(Adult, Minor))  — disjunctive partition
 *
 * Classical FOL: alice is Person, must be Adult or Minor. The KB is satisfiable
 * (alice could be Adult OR Minor; either is consistent). v0.1's Horn-only check
 * cannot decide which disjunct, so the hypothetical-extended consistency check
 * returns 'undetermined' with the SubClassOf-with-ObjectUnionOf axiom in
 * unverifiedAxioms — NOT consistent: false (the KB IS consistent), and NOT
 * silently consistent: true (Horn-only can't verify the disjunct's existence).
 *
 * The unverifiedAxioms field MUST contain the hypothetical SubClassOf axiom (it
 * was the source of the non-Horn-fragment escape), demonstrating that v0.1
 * correctly attributes the indeterminacy to the hypothetical extension rather
 * than mis-attributing it to base axioms.
 */

const PREFIX = "http://example.org/test/hypothetical_horn_incompleteness/";
const PERSON = PREFIX + "Person";
const ADULT = PREFIX + "Adult";
const MINOR = PREFIX + "Minor";
const ALICE = PREFIX + "alice";

/** @type {object} */
export const fixture = {
  // Base OWL ontology — lifted to FOL as the session's base state.
  // Determinism harness exercises lifter on fixture.input.
  input: {
    ontologyIRI: "http://example.org/test/hypothetical_horn_incompleteness",
    prefixes: { ex: PREFIX },
    tbox: [],
    abox: [
      { "@type": "ClassAssertion", class: { "@type": "Class", iri: PERSON }, individual: ALICE },
    ],
    rbox: [],
  },

  axiomSet: [
    // OWL SubClassOf(Person, ObjectUnionOf(Adult, Minor)) lifted to FOL:
    //   ∀x. Person(x) → (Adult(x) ∨ Minor(x))
    // The Disjunction-in-consequent is the canonical Horn-fragment-escape shape per
    // spec §8.5.4 + ADR-007 §11 FOLDisjunction-in-head per-variant table row
    // (architect-ratified 2026-05-09). This is THE shape that exercises the
    // unverifiedAxioms surface in the No-Collapse Guarantee Horn-fragment classifier.
    // Per ADR-007 §11 + API §8.1.2: axiomSet is FOLAxiom[]; FOL Disjunction is the
    // canonical shape, not OWL ObjectUnionOf (which would not exercise the FOL-layer
    // Horn-fragment classifier).
    // Corrected per Q-3-Step6 retroactive corrective routing 2026-05-09 Finding 2.
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Implication",
        antecedent: {
          "@type": "fol:Atom",
          predicate: PERSON,
          arguments: [{ "@type": "fol:Variable", name: "x" }],
        },
        consequent: {
          "@type": "fol:Disjunction",
          disjuncts: [
            {
              "@type": "fol:Atom",
              predicate: ADULT,
              arguments: [{ "@type": "fol:Variable", name: "x" }],
            },
            {
              "@type": "fol:Atom",
              predicate: MINOR,
              arguments: [{ "@type": "fol:Variable", name: "x" }],
            },
          ],
        },
      },
    },
  ],

  expectedOutcome: {
    summary:
      "checkConsistency(session, axiomSet) returns consistent: 'undetermined' with reason " +
      "'coherence_indeterminate'. unverifiedAxioms contains the hypothetical SubClassOf-with-" +
      "ObjectUnionOf-consequent axiom (the source of the non-Horn-fragment escape introduced " +
      "by the hypothetical extension). The base KB is consistent and the hypothetical extension " +
      "introduces non-Horn machinery without inconsistency — the verdict honestly admits Horn-" +
      "incompleteness rather than silently passing or falsely failing.",
    fixtureType: "consistency-check-with-hypothetical-axiomset",
    expectedConsistencyResult: "undetermined",
    expectedReason: "coherence_indeterminate",
    canaryRole: "hypothetical-axiom-horn-incompleteness-attribution",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "checkConsistency failing to attribute Horn-incompleteness to the hypothetical axiom (would " +
    "include base axioms in unverifiedAxioms, mis-attributing); checkConsistency returning " +
    "consistent: false (the KB is satisfiable; false would be wrong); checkConsistency returning " +
    "silently consistent: true (the Horn-fragment escape is real — v0.1 cannot verify, must say so).",

  "expected_v0.1_verdict": {
    ringStatus: "ring3-passes-with-hypothetical-horn-incompleteness-attributed",
    phaseAuthored: 3,
    phaseActivated: 3,
    expectedConsistencyResult: "undetermined",
    expectedReason: "coherence_indeterminate",
    expectedUnverifiedAxiomsContains: [
      "the hypothetical SubClassOf(Person, ObjectUnionOf(Adult, Minor)) axiom from axiomSet",
    ],
    expectedUnverifiedAxiomsDoesNotContain: [
      "base KB axioms (ClassAssertion(Person, alice) is Horn-decidable; should not be flagged as unverified)",
    ],
    expectedNonPersistence: "subsequent checkConsistency(session) without axiomSet returns base-KB consistent: true",
  },

  "expected_v0.2_elk_verdict": null,

  meta: {
    verifiedStatus: "Draft",
    phase: 3,
    activationTiming: "corpus-before-code",
    stepBinding: 7,
    authoredAt: "2026-05-08",
    authoredBy: "SME persona, Phase 3 entry packet final ratification cycle Pass 2a authoring",
    relatedSpecSections: [
      "API §8.1.2 (hypothetical-axiom case)",
      "API §8.1.1 (unverifiedAxioms)",
      "spec §8.5.1 (Horn-checkable fragment)",
      "spec §8.5.5 (surfacing Horn-fragment limit)",
    ],
    relatedFixtures: [
      "hypothetical_inconsistency (sibling: introduces inconsistency)",
      "hypothetical_clean (sibling: extends consistently within Horn fragment)",
      "hypothetical_non_persistence (sibling: explicit non-persistence verification)",
      "nc_horn_incomplete_disjunctive (corpus parallel: same disjunctive shape exercising non-hypothetical case)",
    ],
    architectAuthorization:
      "Phase 3 entry packet §3.4 ratified 2026-05-08; corpus-before-code per Q-3-E split; Step 7 binding.",
  },
};

export const meta = fixture.meta;
