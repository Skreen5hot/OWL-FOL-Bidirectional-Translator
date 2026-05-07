/**
 * Phase 2 fixture — parity canary: OWA-preservation through round-trip.
 *
 * Per Phase 2 entry packet §3.4 (architect-ratified 2026-05-06):
 *
 *   "parity_canary_negative_query.fixture.js — Producing a round-tripped
 *    output where a query Q that previously evaluated to 'undetermined' now
 *    evaluates to 'false' — silent CWA-collapse through projection
 *    (open-world preservation per spec §6.3 default)."
 *
 * Status: Draft. Authored at Phase 2 Step 8 stub-evaluator + parity-canary
 * SME path-fence-authoring pass; promoted to Verified at Phase 2 exit per
 * the standard AUTHORING_DISCIPLINE state-machine progression.
 *
 * ── Canary discipline ─────────────────────────────────────────────────────
 *
 * Per spec §6.3 default OWA: when the FOL state cannot prove a query Q
 * AND cannot prove ¬Q, the answer is 'undetermined'. CWA (closed-world
 * assumption) would collapse the unprovable Q to 'false' — the absence of
 * a proof is taken as proof of absence. Spec §6.3 explicitly forbids this
 * collapse without a `closedPredicates` parameter (Phase 3's evaluate ships
 * the parameter; Phase 2's stub-evaluator does NOT support it).
 *
 * This canary forbids the projector from producing a round-tripped output
 * where the FOL state silently grows a CWA assumption (e.g., a domain
 * closure axiom or a per-predicate closed-world annotation) that wasn't in
 * the original input. Failure mode: a buggy projector emits OWL with an
 * implicit closure annotation that re-lifts to a FOL state with CWA-
 * derivable negations.
 *
 * ── Worked example ────────────────────────────────────────────────────────
 *
 *   Input OWL:
 *     ClassAssertion(Person, alice)
 *     ClassAssertion(Person, bob)
 *
 *   Expected lift F_1 (via owlToFol — Phase 1 verified):
 *     Person(alice)
 *     Person(bob)
 *
 *   Expected project (via folToOwl — Phase 2 Step 2):
 *     ClassAssertion(Person, alice)
 *     ClassAssertion(Person, bob)
 *
 *   Expected re-lift F_3:
 *     Person(alice)
 *     Person(bob)
 *
 *   Round-trip clean. F_3 byte-equivalent to F_1.
 *
 *   Discriminating query Q := Knows(alice, bob)?
 *
 *   Stub-evaluator on F_1:
 *     Atomic positive query Knows(alice, bob).
 *     FACTS: only Person(alice), Person(bob). No Knows(_, _) facts.
 *     RULES: none with Knows as consequent.
 *     Backward-chain exhausts; no proof; default OWA → 'undetermined'.
 *
 *   Stub-evaluator on F_3:
 *     Identical FACTS + RULES (round-trip clean); same trace; 'undetermined'.
 *
 *   Round-trip preservation of OWA: stub-result on F_1 == stub-result on
 *   F_3 == 'undetermined'.
 *
 * ── Forbidden failure mode (the canary catches) ─────────────────────────
 *
 * The projector silently introduces a closure annotation OR a fabricated
 * negative atom in the OWL surface. Examples of buggy emission:
 *   - Adding an OWL annotation like rdfs:isDefinedBy that the lifter mis-
 *     interprets as a domain-closure marker, causing F_3 to derive
 *     ¬Knows(alice, bob) under CWA semantics
 *   - Emitting a NegativeObjectPropertyAssertion that wasn't in the input
 *     (e.g., as an artifact of projecting an absent-NAF-residue marker)
 *   - Mis-lifting a punted construct on the round-trip path that the lifter
 *     should reject but instead silently re-encodes as classical negation
 *
 * Under any of these failure modes, F_3's stub-evaluator on Knows(alice, bob)?
 * collapses to 'false' (CWA-derived negation) instead of 'undetermined'
 * (default OWA). Test asserts F_3 result == 'undetermined'; buggy projector
 * produces 'false' → test fails → CWA-leak caught.
 *
 * ── Phase 3 entry re-exercise per architect Q3 ruling 2026-05-06 ──────────
 *
 * Phase 3's real evaluate() per API §7.1 ships the closedPredicates option.
 * If a Phase 3 consumer explicitly passes closedPredicates: ['Knows'], the
 * real evaluator MAY return 'false' for Knows(alice, bob)? — but only
 * under the explicit consumer-side opt-in. Without closedPredicates, the
 * real evaluator MUST return 'undetermined' (matching the stub).
 *
 * Phase 3 reactivation per phase3Reactivation.divergenceTrigger: if real
 * evaluate (under default OWA — no closedPredicates) returns 'false' where
 * the stub returned 'undetermined', ESCALATE: open-world-preservation
 * broken.
 */

const PREFIX = "http://example.org/test/parity_canary_negative_query/";
const PERSON = PREFIX + "Person";
const KNOWS = PREFIX + "knows";
const ALICE = PREFIX + "alice";
const BOB = PREFIX + "bob";

/** @type {object} */
export const fixture = {
  /**
   * Lift+project+re-lift round-trip fixture: input is OWL ontology.
   * Test runner dispatches via owlToFol(input) → folToOwl(F_1) → owlToFol(projected) → F_3.
   * Then stub-evaluator runs the discriminating query on both F_1 and F_3.
   *
   * The input is intentionally MINIMAL — only ClassAssertions, no rules,
   * no relationship assertions about Knows. This isolates the OWA-vs-CWA
   * discrimination on the discriminating query.
   */
  input: {
    ontologyIRI: "http://example.org/test/parity_canary_negative_query",
    prefixes: {
      ex: PREFIX,
    },
    tbox: [],
    abox: [
      {
        "@type": "ClassAssertion",
        class: { "@type": "Class", iri: PERSON },
        individual: ALICE,
      },
      {
        "@type": "ClassAssertion",
        class: { "@type": "Class", iri: PERSON },
        individual: BOB,
      },
    ],
    rbox: [],
  },

  /**
   * Discriminating query for stub-evaluator. Atomic positive query asking
   * about a relationship that is NOT asserted and NOT derivable.
   *
   * Q := Knows(alice, bob)?
   *
   * Stub evaluation: no Knows facts, no Knows-deriving rules. Backward-chain
   * exhausts; default OWA → 'undetermined'. Returns 'undetermined' on both
   * F_1 (lifted FOL) and F_3 (re-lifted FOL after lift→project→re-lift).
   */
  discriminatingQuery: {
    "@type": "fol:Atom",
    predicate: KNOWS,
    arguments: [
      { "@type": "fol:Constant", iri: ALICE },
      { "@type": "fol:Constant", iri: BOB },
    ],
  },

  expectedOutcome: {
    summary:
      "Round-trip preservation of an OWA-undetermined query. Lift+project+ " +
      "re-lift of the minimal OWL input (two ClassAssertions, no rules, no " +
      "Knows facts) produces F_3 byte-equivalent to F_1. Stub-evaluator on " +
      "the discriminating query Knows(alice, bob)? returns 'undetermined' " +
      "on both F_1 and F_3 (default OWA per spec §6.3 — no proof of " +
      "Knows(alice, bob), no proof of its negation). Failure mode: projector " +
      "silently introduces a closure annotation OR a fabricated negative atom " +
      "→ F_3 derives ¬Knows under CWA semantics → stub returns 'false' on F_3 " +
      "instead of 'undetermined' → canary fires (open-world preservation broken).",
    fixtureType: "round-trip-with-stub-evaluator-query",
    discriminatingQueryStubResult: "undetermined",
    canaryRole: "owa-preservation-against-cwa-collapse",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "the projector silently introducing a closure annotation OR a fabricated " +
    "negative atom in the OWL surface that re-lifts to a CWA-derivable negation, " +
    "collapsing the discriminating query Knows(alice, bob)? from 'undetermined' " +
    "(default OWA per spec §6.3) to 'false' (CWA-derived). Specific failure " +
    "modes: spurious rdfs:isDefinedBy or similar closure annotation; phantom " +
    "NegativeObjectPropertyAssertion not in the input; mis-lifted punted " +
    "construct that should reject but instead silently emits classical negation.",

  "expected_v0.1_verdict": {
    ringStatus: "ring2-passes-with-stub-evaluator-owa-preservation",
    phaseAuthored: 2,
    phaseActivated: 2,
    expectedRoundTripBehavior: {
      structuralEquivalence: "F_3 byte-equivalent to F_1 (modulo canonicalization)",
      lossSignatureCount: 0,
      recoveryPayloadCount: 0,
      stubQueryOnF1: "undetermined",
      stubQueryOnF3: "undetermined",
      stubQueryPreservation: "F_3 result equals F_1 result; default OWA preserved",
    },
    expectedProjectionStrategy: "direct",
  },

  "expected_v0.2_elk_verdict": null,

  /**
   * Phase 3 entry re-exercise per architect Q3 ruling 2026-05-06. Phase 3's
   * real evaluate() per API §7.1 ships the closedPredicates option, but
   * UNDER DEFAULT OWA (no closedPredicates passed), the real evaluator
   * MUST match the stub's 'undetermined' result for this query.
   */
  phase3Reactivation: {
    gatedOn: "real-evaluator-via-API-§7.1-default-OWA-no-closedPredicates",
    query: "Knows(alice, bob)? — atomic positive query under default OWA",
    expectedResult:
      "'undetermined' (must match stub; CWA-collapse forbidden) — real " +
      "evaluator under default OWA per spec §6.3 returns 'undetermined' " +
      "exactly as the stub did. If a Phase 3 consumer explicitly passes " +
      "closedPredicates: ['knows'], the real evaluator MAY return 'false' — " +
      "but that is consumer-opt-in CWA, NOT a round-trip-introduced CWA leak.",
    divergenceTrigger:
      "If real evaluate() under default OWA (no closedPredicates) returns " +
      "'false' where the stub returned 'undetermined', ESCALATE: open-world- " +
      "preservation broken — a CWA assumption leaked through the round-trip " +
      "without consumer-side opt-in. This is the load-bearing canary failure " +
      "the discipline exists to catch.",
  },

  meta: {
    verifiedStatus: "Verified",
    phase: 2,
    authoredAt: "2026-05-XX",
    authoredBy:
      "SME persona, Phase 2 Step 8 stub-evaluator + parity-canary path-fence-authoring pass",
    relatedFixtures: [
      "p1_abox_assertions (ClassAssertion-only minimal-ontology pattern precedent)",
      "p1_owl_same_and_different (reserved-predicate ABox + identity propagation; informs OWA semantics)",
      "parity_canary_query_preservation (sibling canary — entailed-query preservation)",
      "parity_canary_visual_equivalence_trap (sibling canary — engineered semantic-shift detection)",
    ],
    relatedSpecSections: [
      "spec §6.3 (default OWA negation handling — load-bearing for this canary's contract)",
      "spec §8.1 (round-trip parity criterion — extended to OWA-preservation per Phase 2 entry packet §3.4)",
      "spec §8.5 (No-Collapse Guarantee — OWA gap is 'undetermined' not 'false')",
      "API §6.2 (folToOwl signature)",
      "API §7.1 (evaluate — Phase 3 deliverable; closedPredicates option ships here)",
    ],
    relatedADRs: [
      "ADR-007 §1 (lifter emits classical FOL — under default OWA, classical FOL has no implicit closure)",
    ],
    architectAuthorization:
      "Phase 2 entry packet §3.4 (architect-ratified 2026-05-06); architect Q3 ruling on stub-evaluator harness contract + Phase 3 re-exercise gate. Spec §6.3 default OWA framing is load-bearing for this canary's contract.",
  },
};

export const meta = fixture.meta;
