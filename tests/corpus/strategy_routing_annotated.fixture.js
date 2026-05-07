/**
 * Phase 2 fixture — strategy-routing canary for Annotated Approximation.
 *
 * Per Phase 2 entry packet §3.3 (architect-ratified 2026-05-06):
 *
 *   "strategy_routing_annotated.fixture.js — axioms exceeding OWL 2 DL
 *    expressivity; asserts strategy chosen is 'annotated-approximation'
 *    and the structural annotation + machine-readable FOL string + round-
 *    trip identifier are all present per spec §6.1."
 *
 * Status: Draft. Authored at Phase 2 Step 4 spec-binding ratification cycle
 * 2026-05-07; promoted to Verified at Phase 2 exit per the standard
 * AUTHORING_DISCIPLINE state-machine progression.
 *
 * ── Worked example ────────────────────────────────────────────────────────
 *
 *   Input (projector-direct fixture, NOT lift+project): a hand-authored FOL
 *   state combining (a) classical negation over an unbound predicate (the
 *   naf_residue trigger from p2_lossy_naf_residue's pattern) AND (b) a
 *   binary-atom assertion using a predicate IRI outside any loaded ARC
 *   module (the unknown_relation trigger from p2_unknown_relation_fallback's
 *   pattern), exercising BOTH Annotated-Approximation-routing trigger paths
 *   in a single fixture.
 *
 *     ∀x. Person(x) → ¬KnownProfession(x)         // Step 4a naf_residue trigger
 *     unfamiliarBond(alice, bob)                   // Step 4a unknown_relation trigger
 *
 *   Where:
 *     - KnownProfession is intentionally outside any loaded ARC module
 *     - unfamiliarBond uses a namespace explicitly outside Phase 2's permissive
 *       tolerance set (mirrors p2_unknown_relation_fallback's pattern)
 *
 *   Expected Step 4a projector output:
 *     - At least one LossSignature with lossType: "naf_residue" (severity rank 2)
 *     - At least one LossSignature with lossType: "unknown_relation" (severity rank 5)
 *     - At least one RecoveryPayload preserving the FOL state (per ADR-011 §3.2:
 *       3-field discriminating set originalFOL + relationIRI + approximationStrategy)
 *     - Projected OWL: structural annotation + machine-readable FOL string + round-
 *       trip identifier per spec §6.1.3 Annotated Approximation contract
 *
 * ── Why this is the strategy-routing-annotated assertion ─────────────────
 *
 * Phase 2 entry packet §3.3 names this fixture as exercising "axioms exceeding
 * OWL 2 DL expressivity" with strategy assertion "annotated-approximation".
 *
 * Step 4a's hard-route scaffolding routes Direct-Mapping-failed axioms to
 * Annotated Approximation. Step 5's strategy router will formalize this with
 * explicit per-axiom strategy reporting.
 *
 * For Step 4a's observable side-effects, this fixture asserts:
 *   - newLossSignatures.length >= 2 (at least naf_residue + unknown_relation)
 *   - At least one LossSignature has lossType: "naf_residue"
 *   - At least one LossSignature has lossType: "unknown_relation"
 *   - All LossSignature @id fields match /^ofbt:ls\/[0-9a-f]{64}$/ per ADR-011
 *   - Severity ordering (severity rank 2 before rank 5) preserved when
 *     consumers sort by LOSS_SIGNATURE_SEVERITY_ORDER
 *
 * ── Discrimination from p2_lossy_naf_residue + p2_unknown_relation_fallback ──
 *
 * Those fixtures exercise EACH lossType emission path INDIVIDUALLY (one axiom,
 * one Loss Signature). This fixture exercises BOTH paths SIMULTANEOUSLY in a
 * single projection invocation, asserting:
 *   - The projector emits multiple Loss Signatures from a single input
 *   - The Loss Signatures are correctly discriminated (lossType field)
 *   - The severity-ordering contract holds across multiple Loss Signatures
 *   - The Annotated Approximation strategy is the routing destination for
 *     BOTH trigger paths (consistent fallthrough behavior)
 *
 * ── Phase 5 entry re-exercise ─────────────────────────────────────────────
 *
 * Per Phase 2 entry packet §10.1's banked phaseNReactivation discipline: this
 * fixture currently asserts OBSERVABLE SIDE-EFFECTS of Annotated Approximation
 * routing. Step 5's strategy router will add explicit per-axiom strategy
 * reporting; at Phase 5 entry re-exercise, this fixture's assertion strengthens
 * to "for each axiom routed to Annotated Approximation, the recorded strategy
 * is 'annotated-approximation'".
 */

const PREFIX = "http://example.org/p2-uncatalogued/strategy_routing_annotated/";
const PERSON = PREFIX + "Person";
const KNOWN_PROFESSION = PREFIX + "KnownProfession";
const UNFAMILIAR_BOND = PREFIX + "unfamiliarBond";
const ALICE = PREFIX + "alice";
const BOB = PREFIX + "bob";

const VAR_X = { "@type": "fol:Variable", name: "x" };

/** @type {object} */
export const fixture = {
  /**
   * Projector-direct input: FOL axioms array (not OWL ontology).
   * Test runner dispatches via folToOwl(fixture.input).
   *
   * Combines two Annotated-Approximation-routing trigger conditions in a
   * single input to exercise multi-Loss-Signature emission + severity-
   * ordering contract.
   */
  input: [
    // Axiom 1: ∀x. Person(x) → ¬KnownProfession(x) — naf_residue trigger
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Implication",
        antecedent: {
          "@type": "fol:Atom",
          predicate: PERSON,
          arguments: [VAR_X],
        },
        consequent: {
          "@type": "fol:Negation",
          inner: {
            "@type": "fol:Atom",
            predicate: KNOWN_PROFESSION,
            arguments: [VAR_X],
          },
        },
      },
    },
    // Axiom 2: unfamiliarBond(alice, bob) — unknown_relation trigger
    {
      "@type": "fol:Atom",
      predicate: UNFAMILIAR_BOND,
      arguments: [
        { "@type": "fol:Constant", iri: ALICE },
        { "@type": "fol:Constant", iri: BOB },
      ],
    },
  ],

  expectedOutcome: {
    summary:
      "Projector-direct fixture exercising BOTH Annotated-Approximation-routing " +
      "trigger paths simultaneously (naf_residue + unknown_relation). Expected " +
      "newLossSignatures.length >= 2 with one naf_residue (severity rank 2) and " +
      "one unknown_relation (severity rank 5); severity-ordering contract " +
      "preserved when consumers sort by LOSS_SIGNATURE_SEVERITY_ORDER. All @id " +
      "fields match /^ofbt:ls\\/[0-9a-f]{64}$/ per ADR-011. Annotated " +
      "Approximation strategy is the routing destination for both trigger paths.",
    fixtureType: "projector-direct",
    projectionStrategy: "annotated-approximation",
    triggerPaths: ["naf_residue", "unknown_relation"],
  },

  expectedLossSignatureReasons: [
    "negation_over_unbound_predicate",
    "predicate_iri_not_in_loaded_arc_modules",
  ],

  intendedToCatch:
    "the projector emitting only ONE LossSignature when TWO are expected (silent " +
    "drop of one trigger path); OR conflating naf_residue and unknown_relation " +
    "into a single LossSignature; OR violating the severity-ordering contract " +
    "when consumers request ordered Loss Signatures (severity rank 2 must precede " +
    "rank 5 in LOSS_SIGNATURE_SEVERITY_ORDER); OR routing one trigger path to " +
    "Annotated Approximation while routing the other through some other strategy " +
    "(inconsistent fallthrough behavior).",

  "expected_v0.1_verdict": {
    ringStatus: "ring2-passes-with-multiple-loss-signatures",
    phaseAuthored: 2,
    phaseActivated: 2,
    expectedLossSignatureCount: 2,
    expectedLossSignatureLossTypes: ["naf_residue", "unknown_relation"],
    severityOrderingContract: "naf_residue (rank 2) precedes unknown_relation (rank 5) when sorted by LOSS_SIGNATURE_SEVERITY_ORDER",
    expectedProjectionStrategy: "annotated-approximation",
    expectedRoundTripBehavior: {
      reLiftEquivalence: "byte-equivalent-modulo-canonicalization",
      multiLossSignatureEmission: true,
    },
  },

  "expected_v0.2_elk_verdict": null,

  phase5Reactivation: {
    gatedOn: "step-5-strategy-router-explicit-per-axiom-strategy-reporting",
    expectedOutcome:
      "Once Step 5 ships explicit per-axiom strategy reporting, this fixture's " +
      "assertion strengthens to: for both input axioms, the recorded strategy " +
      "is 'annotated-approximation'. Direct Mapping is NOT invoked for either " +
      "(or if Direct Mapping IS invoked structurally for the unknown_relation " +
      "axiom per its informational-emission semantics, the strategy field " +
      "explicitly tracks the dual-emission case).",
    divergenceTrigger:
      "If Step 5's strategy router reports strategy != 'annotated-approximation' " +
      "for the naf_residue axiom, ESCALATE: strategy-routing correctness " +
      "regression. The unknown_relation axiom MAY have a different strategy " +
      "report under Step 5's clarified semantics (Direct Mapping with " +
      "informational LossSignature vs Annotated Approximation); architect " +
      "ratification at Step 5 entry resolves the ambiguity.",
  },

  meta: {
    verifiedStatus: "Draft",
    phase: 2,
    authoredAt: "2026-05-07",
    authoredBy: "SME persona, Phase 2 Step 4 spec-binding cycle parallel SME workload",
    relatedFixtures: [
      "p2_lossy_naf_residue (single-trigger naf_residue exerciser)",
      "p2_unknown_relation_fallback (single-trigger unknown_relation exerciser)",
      "strategy_routing_direct (positive-half of cross-section defense pair)",
    ],
    relatedSpecSections: [
      "spec §6.1.3 (Annotated Approximation strategy)",
      "spec §6.2 (strategy selection algorithm)",
      "spec §6.4.1 (LossSignature schema + severity ordering)",
      "spec §7.2 (Loss Signature taxonomy)",
      "API §6.2 (folToOwl signature)",
      "API §6.4 (audit artifact types)",
    ],
    relatedADRs: [
      "ADR-011 (audit-artifact @id content-addressing — Accepted 2026-05-07)",
      "ADR-007 §1 (lifter emits classical FOL — load-bearing for projector-direct fixture convention)",
    ],
  },
};

export const meta = fixture.meta;
