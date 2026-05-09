/**
 * Phase 3 fixture — Hypothetical-axiom case: explicit non-persistence verification.
 *
 * Per ROADMAP §3.4 + architect Q-3-E ratification 2026-05-08 (corpus-before-code):
 *
 *   "hypothetical_non_persistence.fixture.js — runs checkConsistency(session, axiomSet)
 *    then checkConsistency(session) against the same session; second call MUST see
 *    the original session state, not the hypothetical extension; verifies the API
 *    §8.1.2 non-persistence guarantee"
 *
 * Status: Draft. Step 7 binding.
 *
 * ── The non-persistence contract per API §8.1.2 ────────────────────────────
 *
 * checkConsistency(session, axiomSet) participates the axiomSet in the consistency
 * check, returns the verdict, and DOES NOT persist the axiomSet in the session.
 * A subsequent checkConsistency(session) call MUST return the verdict computed
 * against the ORIGINAL session state, not against the hypothetically-extended state.
 *
 * This is the contract that distinguishes hypothetical reasoning from incremental
 * extension. Hypothetical reasoning answers "what would happen if X were true?"
 * without committing to X. Incremental extension would commit to X for future
 * queries. The API §8.1.2 contract is hypothetical-only.
 *
 * ── This fixture's two-call protocol ──────────────────────────────────────
 *
 * Base KB:
 *   ClassAssertion(Adult, alice)
 *   SubClassOf(Adult, Person)
 *
 * Hypothetical axiomSet (introduces inconsistency):
 *   DisjointClasses(Adult, Person)
 *
 * Test runner protocol:
 *   1. checkConsistency(session, axiomSet) → expect consistent: false
 *      (the hypothetical participates; produces inconsistency verdict)
 *   2. checkConsistency(session) → expect consistent: true
 *      (the hypothetical did NOT persist; original session state still consistent)
 *
 * Both calls run against the SAME session. The fixture's `expectedSequence` field
 * names the expected verdict for each call; the test runner must verify both.
 *
 * ── What this fixture catches ─────────────────────────────────────────────
 *
 * The non-persistence violation: checkConsistency persisting the axiomSet in the
 * session. Specific failure modes:
 *   - Implementation calls assertz on the axiomSet's axioms in the session's Tau
 *     Prolog state, then forgets to retract them after the verdict
 *   - Implementation correctly retracts but mis-handles edge cases (e.g., axioms
 *     that introduced derived facts during the check, leaving the derived facts
 *     in the session even after the originating axioms are retracted)
 *   - Implementation silently mutates session state via shared references rather
 *     than copying-and-extending
 *
 * The two-call protocol catches all three failure modes: if any axiom or derived
 * fact persists, the second call's verdict differs from the expected base-KB verdict.
 */

const PREFIX = "http://example.org/test/hypothetical_non_persistence/";
const ADULT = PREFIX + "Adult";
const PERSON = PREFIX + "Person";
const ALICE = PREFIX + "alice";

/** @type {object} */
export const fixture = {
  // Base OWL ontology — lifted to FOL as the session's base state.
  // Determinism harness exercises lifter on fixture.input.
  input: {
    ontologyIRI: "http://example.org/test/hypothetical_non_persistence",
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
    // OWL DisjointClasses(Adult, Person) lifted to FOL: ∀x. (Adult(x) ∧ Person(x)) → ⊥
    // Same shape as hypothetical_inconsistency's axiomSet — disjointness lifts to
    // Universal + Implication + Conjunction + False per ADR-007 §11 canonical lifting.
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

  /**
   * Two-call protocol: each entry in expectedSequence describes one
   * checkConsistency invocation against the same session.
   */
  expectedSequence: [
    {
      callIndex: 1,
      callShape: "checkConsistency(session, axiomSet)",
      expectedConsistencyResult: "false",
      semanticContract: "the hypothetical axiomSet participates; produces inconsistency verdict per API §8.1.2",
    },
    {
      callIndex: 2,
      callShape: "checkConsistency(session)",
      expectedConsistencyResult: "true",
      semanticContract:
        "the same session, no axiomSet — non-persistence guarantee per API §8.1.2 means the " +
        "hypothetical axiomSet did NOT persist; the second call sees only the base KB and returns " +
        "the base-KB verdict (consistent: true)",
    },
  ],

  expectedOutcome: {
    summary:
      "Two-call protocol against the same session. Call 1: checkConsistency(session, axiomSet) " +
      "returns consistent: false (hypothetical participates, produces inconsistency). Call 2: " +
      "checkConsistency(session) returns consistent: true (hypothetical did not persist; base " +
      "KB verdict). The discriminating assertion is Call 2's verdict — if the hypothetical persisted, " +
      "Call 2 would also return consistent: false.",
    fixtureType: "consistency-check-non-persistence-protocol",
    expectedSequence: "[false, true]",
    canaryRole: "hypothetical-axiom-non-persistence-guarantee-verification",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "the non-persistence violation: hypothetical axiomSet persisting in the session after " +
    "checkConsistency(session, axiomSet) returns. Specific failure modes: implementation " +
    "calls assertz without matching retract; implementation correctly retracts axioms but leaves " +
    "derived facts (e.g., resolution-derived intermediate predicates) in the session; implementation " +
    "mutates session state via shared references rather than copy-and-extend. All three failure modes " +
    "manifest as Call 2 returning consistent: false instead of true.",

  "expected_v0.1_verdict": {
    ringStatus: "ring3-passes-with-non-persistence-verified",
    phaseAuthored: 3,
    phaseActivated: 3,
    expectedSequence: ["false", "true"],
    expectedNonPersistenceContract: "Call 2 returns the base-KB verdict, not the hypothetical-extended verdict",
    discriminatesAgainst:
      "any implementation where Call 2 returns 'false' (the hypothetical persisted); " +
      "any implementation where Call 2 returns 'undetermined' (a derived fact from the " +
      "hypothetical reasoning path persisted, contaminating the base-KB-only check)",
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
      "API §8.1.2 (hypothetical-axiom case + non-persistence guarantee)",
      "spec §9.4 (concurrency — v0.1 single-threaded; non-persistence is the only state-mutation discipline)",
    ],
    relatedFixtures: [
      "hypothetical_inconsistency (sibling: introduces inconsistency; this fixture's Call 1 reuses that pattern)",
      "hypothetical_horn_incompleteness (sibling: introduces Horn-incompleteness)",
      "hypothetical_clean (sibling: extends consistently)",
    ],
    architectAuthorization:
      "Phase 3 entry packet §3.4 ratified 2026-05-08; corpus-before-code per Q-3-E split; Step 7 binding; non-persistence-guarantee verification.",
  },
};

export const meta = fixture.meta;
