/**
 * Phase 2 fixture — strategy-routing canary for Direct Mapping (positive half).
 *
 * Per Phase 2 entry packet §3.3 (architect-ratified 2026-05-06):
 *
 *   "strategy_routing_direct.fixture.js — axioms expressible in OWL 2 DL
 *    (subClassOf, equivalentClass, property characteristics); asserts
 *    strategy chosen is 'direct'."
 *
 * Per Phase 2 entry packet §3.7 (architect-banked cross-section defense pair
 * 2026-05-06): this fixture is the POSITIVE half of the two-fixture defense-
 * in-depth pair for Phase 2's high-correctness-risk requirement (strategy-
 * routing correctness). The CANARY half is parity_canary_visual_equivalence_
 * trap.fixture.js (forthcoming; depends on Step 7's roundTripCheck + stub-
 * evaluator harness).
 *
 * Status: Draft. Authored at Phase 2 Step 4 spec-binding ratification cycle
 * 2026-05-07; promoted to Verified at Phase 2 exit per the standard
 * AUTHORING_DISCIPLINE state-machine progression.
 *
 * ── Worked example ────────────────────────────────────────────────────────
 *
 *   Input (lift+project round-trip): a mix of OWL 2 DL constructs that ALL
 *   route to Direct Mapping via Steps 2/3a/3b/3c's pattern matchers.
 *
 *     SubClassOf(Mother, Female)                                      // Step 2
 *     EquivalentClasses(Father, Male) [via converse-SubClassOf pair]  // Step 3a
 *     ObjectPropertyCharacteristic(loves, Symmetric)                  // Step 2
 *     ObjectPropertyCharacteristic(ancestor, Transitive)              // Step 2
 *     ObjectPropertyDomain(parentOf, Person)                          // Step 3a
 *     ObjectPropertyRange(parentOf, Person)                           // Step 3a
 *     ClassAssertion(Mother, alice)                                   // Step 2
 *     ObjectPropertyAssertion(parentOf, alice, bob)                   // Step 2
 *
 *   Each of the 8 axioms (well, 7 distinct + 1 EquivalentClasses pair = 8
 *   FOL axioms after lifting) round-trips byte-clean under Direct Mapping.
 *   No Loss Signatures emitted; no Recovery Payloads emitted.
 *
 * ── Why this is the canary's positive half ────────────────────────────────
 *
 * Strategy-routing correctness is Phase 2's high-correctness-risk requirement
 * per the entry packet §3.3 closing paragraph. A correct emission of the
 * WRONG strategy is a Ring 2 pass that hides a real bug (e.g., emitting
 * Annotated Approximation with a structurally-similar OWL output where
 * Direct Mapping was the right choice — output looks valid but consumer
 * tooling treating Loss Signatures as "this didn't round-trip cleanly"
 * would mis-categorize the axiom).
 *
 * This fixture asserts the RIGHT strategy choice (Direct Mapping) on a mix
 * of OWL 2 DL constructs that have unambiguous Direct Mapping coverage. The
 * canary's WRONG-half (parity_canary_visual_equivalence_trap.fixture.js)
 * asserts the wrong strategy's symptoms are absent via query-based detection
 * (graph-shape-equivalent but semantically-shifted output).
 *
 * Cross-section defense pair (architect-banked 2026-05-06 per Phase 2 entry
 * packet §10.8): this fixture lives in the strategy-routing positives section;
 * the canary half lives in the parity-canaries section. The pairing is
 * named explicitly so the cross-section relationship is auditable.
 *
 * ── Phase 5 entry re-exercise ─────────────────────────────────────────────
 *
 * Per Phase 2 entry packet §10.1's banked phaseNReactivation discipline: this
 * fixture currently asserts ROUND-TRIP STRUCTURAL EQUIVALENCE + ZERO LOSS
 * SIGNATURES (the observable proxy for "Direct Mapping was chosen"). Step 5's
 * strategy router will add explicit per-axiom strategy reporting; at Phase 5
 * entry re-exercise, this fixture's assertion strengthens to "for each of the
 * N input axioms, the recorded strategy is 'direct'".
 */

const PREFIX = "http://example.org/test/strategy_routing_direct/";
const MOTHER = PREFIX + "Mother";
const FEMALE = PREFIX + "Female";
const FATHER = PREFIX + "Father";
const MALE = PREFIX + "Male";
const PERSON = PREFIX + "Person";
const LOVES = PREFIX + "loves";
const ANCESTOR = PREFIX + "ancestor";
const PARENT_OF = PREFIX + "parentOf";
const ALICE = PREFIX + "alice";
const BOB = PREFIX + "bob";

/** @type {object} */
export const fixture = {
  /**
   * Lift+project round-trip fixture: input is OWL ontology.
   * Test runner dispatches via folToOwl(owlToFol(input)) for round-trip.
   */
  input: {
    ontologyIRI: "http://example.org/test/strategy_routing_direct",
    prefixes: {
      ex: PREFIX,
    },
    tbox: [
      // 1. Single-axiom SubClassOf (Step 2 Direct Mapping)
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: MOTHER },
        superClass: { "@type": "Class", iri: FEMALE },
      },
      // 2. EquivalentClasses pair-matched at Step 3a from converse SubClassOf pair
      {
        "@type": "EquivalentClasses",
        classes: [
          { "@type": "Class", iri: FATHER },
          { "@type": "Class", iri: MALE },
        ],
      },
    ],
    abox: [
      // 3. ClassAssertion (Step 2 Direct Mapping)
      {
        "@type": "ClassAssertion",
        class: { "@type": "Class", iri: MOTHER },
        individual: ALICE,
      },
      // 4. ObjectPropertyAssertion (Step 2 Direct Mapping)
      {
        "@type": "ObjectPropertyAssertion",
        property: PARENT_OF,
        source: ALICE,
        target: BOB,
      },
    ],
    rbox: [
      // 5. ObjectPropertyCharacteristic Symmetric (Step 2 Direct Mapping)
      {
        "@type": "ObjectPropertyCharacteristic",
        property: LOVES,
        characteristic: "Symmetric",
      },
      // 6. ObjectPropertyCharacteristic Transitive (Step 2 Direct Mapping)
      {
        "@type": "ObjectPropertyCharacteristic",
        property: ANCESTOR,
        characteristic: "Transitive",
      },
      // 7. ObjectPropertyDomain (Step 3a Direct Mapping)
      {
        "@type": "ObjectPropertyDomain",
        property: PARENT_OF,
        domain: { "@type": "Class", iri: PERSON },
      },
      // 8. ObjectPropertyRange (Step 3a Direct Mapping)
      {
        "@type": "ObjectPropertyRange",
        property: PARENT_OF,
        range: { "@type": "Class", iri: PERSON },
      },
    ],
  },

  expectedOutcome: {
    summary:
      "Lift+project round-trip across 8 OWL 2 DL constructs (SubClassOf, " +
      "EquivalentClasses, ClassAssertion, ObjectPropertyAssertion, Symmetric, " +
      "Transitive, ObjectPropertyDomain, ObjectPropertyRange) preserves all " +
      "structural shape under Direct Mapping. No Loss Signatures emitted (zero " +
      "newLossSignatures); no Recovery Payloads emitted (zero newRecoveryPayloads). " +
      "Projected ontology contains the same 8 axioms as input modulo OWL " +
      "serialization convention + placeholder manifest fields.",
    fixtureType: "lift-and-project-round-trip",
    projectionStrategy: "direct",
    role: "positive-half-of-cross-section-defense-pair-with-parity_canary_visual_equivalence_trap",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "the projector silently routing any of the 8 input axioms to Annotated " +
    "Approximation (would emit at least one Loss Signature when none is expected); " +
    "OR routing to a non-existent third strategy that produces structurally-similar " +
    "but semantically-shifted output; OR pair-matching incorrectly collapsing two " +
    "non-converse SubClassOf axioms into a spurious EquivalentClasses; OR " +
    "single-axiom Direct Mapping silently dropping one of the 4 ABox / 4 RBox " +
    "axioms.",

  "expected_v0.1_verdict": {
    ringStatus: "ring2-passes",
    phaseAuthored: 2,
    phaseActivated: 2,
    expectedRoundTripBehavior: {
      structuralEquivalence: "all 8 input axioms preserved in projected output",
      lossSignatureCount: 0,
      recoveryPayloadCount: 0,
      totalAxiomCountInputVsProjected: "9 lifted FOL axioms (EquivalentClasses decomposes per ADR-007 §4) → 8 projected OWL axioms (pair-matching re-collapses)",
    },
  },

  "expected_v0.2_elk_verdict": null,

  phase5Reactivation: {
    gatedOn: "step-5-strategy-router-explicit-per-axiom-strategy-reporting",
    expectedOutcome:
      "Once Step 5 ships explicit per-axiom strategy reporting (manifest.activity " +
      "or per-axiom annotation), this fixture's assertion strengthens to: " +
      "for each of the 8 input axioms, the recorded strategy is 'direct'. " +
      "Property-Chain Realization (Step 6) and Annotated Approximation (Step 4) " +
      "MUST NOT be invoked for any of the 8 axioms.",
    divergenceTrigger:
      "If Step 5's strategy router reports strategy != 'direct' for any of the 8 " +
      "axioms, ESCALATE: strategy-routing correctness regression. The wrong " +
      "strategy choice is a Ring 2 pass that hides a real bug per Phase 2 entry " +
      "packet §3.7 + §10.2 banked principles.",
  },

  meta: {
    verifiedStatus: "Verified",
    phase: 2,
    authoredAt: "2026-05-07",
    authoredBy: "SME persona, Phase 2 Step 4 spec-binding cycle parallel SME workload",
    relatedFixtures: [
      "p1_subclass_chain",
      "p1_equivalent_and_disjoint_named",
      "p1_property_characteristics",
      "p1_prov_domain_range",
      "p1_abox_assertions",
      "parity_canary_visual_equivalence_trap (forthcoming; canary half of cross-section defense pair)",
    ],
    relatedSpecSections: [
      "spec §6.1.1 (Direct Mapping table)",
      "spec §6.2 (strategy selection algorithm)",
      "API §6.2 (folToOwl signature)",
      "API §3.2 / §3.5 / §3.7 (TBox / ABox / RBox surface)",
    ],
    architectBanking: [
      "Phase 2 entry packet §3.3 (corpus-ratified 2026-05-06)",
      "Phase 2 entry packet §3.7 + §10.8 (cross-section defense pair refinement; architect-banked 2026-05-06)",
      "Phase 2 entry packet §10.2 (two-fixture defense-in-depth pattern portability)",
    ],
  },
};

export const meta = fixture.meta;
