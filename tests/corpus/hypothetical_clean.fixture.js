/**
 * Phase 3 fixture — Hypothetical-axiom case: base consistent, hypothetical extends consistently.
 *
 * Per ROADMAP §3.4 + architect Q-3-E ratification 2026-05-08 (corpus-before-code):
 *
 *   "hypothetical_clean.fixture.js — base KB consistent; axiomSet extends consistently;
 *    checkConsistency(session, axiomSet) returns consistent: true"
 *
 * Status: Draft. Step 7 binding.
 *
 * ── The clean-extension case (positive control) ────────────────────────────
 *
 * Base KB:
 *   ClassAssertion(Person, alice)
 *   SubClassOf(Mother, Person)
 *
 * Hypothetical axiomSet:
 *   ClassAssertion(Mother, alice)  — narrows alice's membership; consistent with base
 *
 * Classical FOL: Mother(alice) + Mother ⊑ Person + Person(alice) — fully consistent.
 * The hypothetical extension narrows alice's membership without introducing any
 * contradiction. Horn-decidable; verdict: consistent: true.
 *
 * This is the positive control for the hypothetical-axiom test set. Without it,
 * the test set would only verify negative outcomes (inconsistency, Horn-incompleteness)
 * and could miss a regression where checkConsistency over-pessimistically returns
 * 'undetermined' or false on perfectly consistent extensions.
 *
 * Step 7 binding per architect Q-3-A step ledger.
 */

const PREFIX = "http://example.org/test/hypothetical_clean/";
const PERSON = PREFIX + "Person";
const MOTHER = PREFIX + "Mother";
const ALICE = PREFIX + "alice";

/** @type {object} */
export const fixture = {
  // Base OWL ontology — lifted to FOL as the session's base state.
  // Determinism harness exercises lifter on fixture.input.
  input: {
    ontologyIRI: "http://example.org/test/hypothetical_clean",
    prefixes: { ex: PREFIX },
    tbox: [
      { "@type": "SubClassOf", subClass: { "@type": "Class", iri: MOTHER }, superClass: { "@type": "Class", iri: PERSON } },
    ],
    abox: [
      { "@type": "ClassAssertion", class: { "@type": "Class", iri: PERSON }, individual: ALICE },
    ],
    rbox: [],
  },

  axiomSet: [
    // OWL ClassAssertion(Mother, alice) lifted to FOL Atom Mother(alice).
    // Per ADR-007 §11 (visited-ancestor + per-variant translation rules ratified
    // 2026-05-09): API §8.1.2 axiomSet is FOLAxiom[]; ClassAssertion at the FOL
    // layer is just an atomic predicate application.
    // Corrected per Q-3-Step6 retroactive corrective routing 2026-05-09 Finding 2
    // (Pass 2a authoring used OWL-axiom-shape @type discriminators in axiomSet;
    // canonical FOL @types per src/kernel/evaluate-types.ts + fol-to-prolog.ts).
    {
      "@type": "fol:Atom",
      predicate: MOTHER,
      arguments: [{ "@type": "fol:Constant", iri: ALICE }],
    },
  ],

  expectedOutcome: {
    summary:
      "checkConsistency(session, axiomSet) returns consistent: true. The hypothetical axiomSet's " +
      "ClassAssertion(Mother, alice) is consistent with the base KB's Person(alice) + Mother ⊑ Person. " +
      "Horn-decidable. Positive control for the hypothetical-axiom test set: ensures checkConsistency " +
      "doesn't over-pessimistically flag clean extensions.",
    fixtureType: "consistency-check-with-hypothetical-axiomset",
    expectedConsistencyResult: "true",
    canaryRole: "hypothetical-axiom-clean-extension-positive-control",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "checkConsistency over-pessimistically returning 'undetermined' on a clean Horn-decidable " +
    "extension (would surface unverifiedAxioms when none should be surfaced); checkConsistency " +
    "incorrectly returning consistent: false (would mis-detect a contradiction where none exists); " +
    "any regression where the implementation conflates 'introduces new content' with 'introduces " +
    "uncertainty' (a clean extension introduces verifiable content).",

  "expected_v0.1_verdict": {
    ringStatus: "ring3-passes-with-hypothetical-clean-extension",
    phaseAuthored: 3,
    phaseActivated: 3,
    expectedConsistencyResult: "true",
    expectedUnverifiedAxiomsCount: 0,
    expectedNonPersistence: "subsequent checkConsistency(session) without axiomSet returns base-KB consistent: true (same verdict, but the session state does not include the hypothetical Mother(alice) assertion)",
  },

  "expected_v0.2_elk_verdict": null,

  meta: {
    verifiedStatus: "Verified",
    phase: 3,
    activationTiming: "corpus-before-code",
    stepBinding: 7,
    authoredAt: "2026-05-08",
    authoredBy: "SME persona, Phase 3 entry packet final ratification cycle Pass 2a authoring",
    relatedSpecSections: [
      "API §8.1.2 (hypothetical-axiom case)",
      "spec §8.5.2 (Horn-checkable fragment positive verdict path)",
    ],
    relatedFixtures: [
      "hypothetical_inconsistency (sibling: negative control — introduces inconsistency)",
      "hypothetical_horn_incompleteness (sibling: introduces non-Horn machinery)",
      "hypothetical_non_persistence (sibling: explicit non-persistence verification)",
    ],
    architectAuthorization:
      "Phase 3 entry packet §3.4 ratified 2026-05-08; corpus-before-code per Q-3-E split; Step 7 binding; positive-control role.",
  },
};

export const meta = fixture.meta;
