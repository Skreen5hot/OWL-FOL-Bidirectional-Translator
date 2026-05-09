/**
 * Phase 3 fixture — Hypothetical-axiom case: base consistent, hypothetical introduces inconsistency.
 *
 * Per ROADMAP §3.4 + architect Q-3-E ratification 2026-05-08 (corpus-before-code):
 *
 *   "hypothetical_inconsistency.fixture.js — base KB consistent; axiomSet introduces
 *    inconsistency; checkConsistency(session, axiomSet) returns consistent: false
 *    with witnesses"
 *
 * Status: Draft. Authored corpus-before-code at Pass 2a 2026-05-08.
 *
 * ── Per API §8.1.2 hypothetical-reasoning contract ────────────────────────
 *
 * checkConsistency(session, axiomSet) participates the axiomSet in the consistency
 * check, returns the verdict, and DOES NOT persist the axiomSet in the session.
 * This fixture exercises the FIRST behavior (axiomSet participates) when the
 * hypothetical extension introduces inconsistency.
 *
 * Base KB:
 *   ClassAssertion(Adult, alice)
 *   SubClassOf(Adult, Person)
 *
 * Hypothetical axiomSet:
 *   DisjointClasses(Adult, Person)  — contradicts Adult ⊑ Person + Adult(alice)
 *
 * Classical FOL: Adult(alice) + Adult ⊑ Person + DisjointClasses(Adult, Person)
 * yields Person(alice) ∧ ¬Person(alice) — Horn-decidable contradiction.
 *
 * Expected: checkConsistency(session, axiomSet) returns consistent: false with
 * witnesses naming the specific axiom from axiomSet that introduced the inconsistency.
 *
 * Step 7 binding per architect Q-3-A step ledger ratification 2026-05-08.
 */

const PREFIX = "http://example.org/test/hypothetical_inconsistency/";
const ADULT = PREFIX + "Adult";
const PERSON = PREFIX + "Person";
const ALICE = PREFIX + "alice";

/** @type {object} */
export const fixture = {
  // Base OWL ontology — lifted to FOL as the session's base state.
  // Determinism harness exercises lifter on fixture.input.
  input: {
    ontologyIRI: "http://example.org/test/hypothetical_inconsistency",
    prefixes: { ex: PREFIX },
    tbox: [
      { "@type": "SubClassOf", subClass: { "@type": "Class", iri: ADULT }, superClass: { "@type": "Class", iri: PERSON } },
    ],
    abox: [
      { "@type": "ClassAssertion", class: { "@type": "Class", iri: ADULT }, individual: ALICE },
    ],
    rbox: [],
  },

  axiomSet: [
    // Hypothetical axiom that introduces inconsistency.
    // OWL DisjointClasses(Adult, Person) lifted to FOL: ∀x. (Adult(x) ∧ Person(x)) → ⊥
    // Per ADR-007 §11 (per-variant translation rules ratified 2026-05-09): API §8.1.2
    // axiomSet is FOLAxiom[]; DisjointClasses lifts to a Universal-Implication-Conjunction-
    // False composition per the canonical lifting + spec §6.3 OWA framing.
    // Corrected per Q-3-Step6 retroactive corrective routing 2026-05-09 Finding 2.
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Implication",
        antecedent: {
          "@type": "fol:Conjunction",
          conjuncts: [
            {
              "@type": "fol:Atom",
              predicate: ADULT,
              arguments: [{ "@type": "fol:Variable", name: "x" }],
            },
            {
              "@type": "fol:Atom",
              predicate: PERSON,
              arguments: [{ "@type": "fol:Variable", name: "x" }],
            },
          ],
        },
        consequent: { "@type": "fol:False" },
      },
    },
  ],

  expectedOutcome: {
    summary:
      "checkConsistency(session, axiomSet) returns consistent: false. The hypothetical " +
      "axiomSet's DisjointClasses(Adult, Person) axiom contradicts the base KB's Adult ⊑ Person " +
      "with Adult(alice). Witnesses name the specific axiom from axiomSet (DisjointClasses) and " +
      "the base axioms it contradicted. After this call, a subsequent checkConsistency(session) " +
      "(without axiomSet) MUST see the original session state — hypothetical_non_persistence " +
      "fixture verifies the non-persistence guarantee.",
    fixtureType: "consistency-check-with-hypothetical-axiomset",
    expectedConsistencyResult: "false",
    canaryRole: "hypothetical-axiom-inconsistency-detection",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "checkConsistency failing to participate the axiomSet in the check (would return base-KB " +
    "consistent: true, ignoring the hypothetical extension); checkConsistency persisting the " +
    "axiomSet (would corrupt the session for subsequent calls — verified by the non-persistence " +
    "sibling fixture); witnesses incomplete (failing to name the specific axiom from axiomSet " +
    "that introduced the inconsistency, leaving the consumer unable to identify the hypothetical " +
    "contribution).",

  "expected_v0.1_verdict": {
    ringStatus: "ring3-passes-with-hypothetical-inconsistency-detected",
    phaseAuthored: 3,
    phaseActivated: 3,
    expectedConsistencyResult: "false",
    expectedWitnessContains: [
      "the DisjointClasses(Adult, Person) axiom from axiomSet",
      "the SubClassOf(Adult, Person) base axiom",
      "the ClassAssertion(Adult, alice) base assertion",
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
      "API §8.1.2 (hypothetical-axiom case contract)",
      "API §8.1 (checkConsistency signature)",
      "spec §8.5 (No-Collapse Guarantee scope)",
    ],
    relatedFixtures: [
      "hypothetical_horn_incompleteness (sibling: hypothetical introduces Horn-incompleteness without inconsistency)",
      "hypothetical_clean (sibling: hypothetical extends consistently)",
      "hypothetical_non_persistence (sibling: explicit non-persistence verification)",
    ],
    architectAuthorization:
      "Phase 3 entry packet §3.4 ratified 2026-05-08; corpus-before-code per Q-3-E split; Step 7 binding.",
  },
};

export const meta = fixture.meta;
