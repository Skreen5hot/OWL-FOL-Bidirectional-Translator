/**
 * Phase 2 fixture — strategy-routing canary for Property-Chain Realization.
 *
 * Per Phase 2 entry packet §3.3 (architect-ratified 2026-05-06):
 *
 *   "strategy_routing_chain.fixture.js — axioms whose derived implication is
 *    a property chain; asserts strategy chosen is 'property-chain' and the
 *    emitted owl:propertyChainAxiom matches the expected chain."
 *
 * Per Q-Step6 routing cycle architect rulings 2026-05-XX (Aaron-shared):
 *   - Q-Step6-1 → Option (b): always-emit regularity_scope_warning
 *   - Q-Step6-2 → factual: Phase 1 lifter does NOT emit chains; this fixture
 *     is projector-direct per the established Phase 2 convention
 *   - Q-Step6-3 → Option (α): Step 6 is projector-only
 *
 * Status: Draft. Authored at Q-Step6 routing cycle SME path-fence-authoring
 * pass 2026-05-XX; promoted to Verified at Phase 2 exit per the standard
 * AUTHORING_DISCIPLINE state-machine progression.
 *
 * ── Strategy-routing canary discipline ────────────────────────────────────
 *
 * This fixture is the strategy-routing canary for Tier-3 dispatch (Property-
 * Chain Realization) per spec §6.2's tiered fallthrough algorithm. Step 5
 * shipped the strategy router with explicit per-axiom strategy reporting at
 * commit cabebfa; Step 6 adds the Tier-3 dispatch hook that this fixture
 * exercises.
 *
 * Sibling to strategy_routing_direct (Tier-2 Direct Mapping canary) and
 * strategy_routing_annotated (Tier-default Annotated Approximation canary).
 * Together with the forthcoming strategy_routing_no_match.fixture.js (Step 5
 * deferred-deliverable), the four-fixture set covers the strategy router's
 * full tiered fallthrough surface per Phase 2 entry packet §3.3.
 *
 * ── Discrimination from p2_property_chain_realization_simplified ──────────
 *
 * Both fixtures use the SAME FOL chain shape (∀x,y,z. parent(x,y) ∧
 * parent(y,z) → grandparent(x,z)). The discrimination is in assertion focus:
 *
 *   p2_property_chain_realization_simplified asserts:
 *     - Round-trip behavior + Recovery Payload preservation of FOL state
 *     - Recovery Payload's regularity_scope_warning scopeNotes presence
 *     - regime: "reversible" per the FOL-preservation contract
 *
 *   strategy_routing_chain (THIS fixture) asserts:
 *     - The strategy router's per-axiom report records strategy='property-chain'
 *       (not 'direct', not 'annotated-approximation', not 'unmatched')
 *     - The emitted ObjectPropertyChain's `chain` array EXACTLY matches the
 *       FOL pattern's binary-atom predicate sequence (not a reordered chain,
 *       not a collapsed chain, not a phantom-property chain)
 *
 * The architect-banked cross-section defense pair pattern (Phase 2 entry
 * packet §10.8) generalizes to within-section pairs as well: two fixtures
 * exercising the SAME input shape with COMPLEMENTARY assertion focuses
 * provide stronger coverage than either alone. Both this fixture and its
 * sibling are needed per Phase 2 entry packet §3.3's strategy-routing canary
 * discipline.
 *
 * ── Worked example ────────────────────────────────────────────────────────
 *
 *   FOL input (1 axiom): a 2-property chain
 *     ∀x, y, z. parent(x, y) ∧ parent(y, z) → grandparent(x, z)
 *
 *   Expected projector output (Step 6 contract):
 *     - manifest.activity (or per-axiom strategy reporting per Step 5's
 *       strategy router) records strategy: 'property-chain' for this axiom
 *     - 1 RBox axiom: ObjectPropertyChain { chain: [parent, parent],
 *       superProperty: grandparent }
 *     - The chain array order MUST be [parent, parent] (preserving the FOL
 *       binary-atom sequence parent(x,y) ∧ parent(y,z); NOT [parent] +
 *       collapsed; NOT [grandparent, parent] + phantom)
 *
 * ── Round-trip behavior ───────────────────────────────────────────────────
 *
 * Per spec §7's regime taxonomy: this fixture is `reversible` — same
 * classification as p2_property_chain_realization_simplified. The Recovery
 * Payload preserves the FOL state for downstream re-evaluation.
 *
 * ── Phase 4 entry re-exercise ─────────────────────────────────────────────
 *
 * Same Phase 4 reactivation contract as p2_property_chain_realization_
 * simplified per architect Q-Step6-1 ruling: regularity_scope_warning
 * cleared for regularity-confirmed chains under import closure; falls
 * through to Annotated Approximation for irregular chains. This fixture's
 * strategy assertion adapts: under Phase 4 ARC content with regularity
 * confirmed, strategy='property-chain' stays (warning cleared); under
 * irregular chains, strategy='annotated-approximation' (per the spec §6.2
 * algorithm fallthrough).
 */

const PREFIX = "http://example.org/test/strategy_routing_chain/";
const PARENT = PREFIX + "parent";
const GRANDPARENT = PREFIX + "grandparent";

const VAR_X = { "@type": "fol:Variable", name: "x" };
const VAR_Y = { "@type": "fol:Variable", name: "y" };
const VAR_Z = { "@type": "fol:Variable", name: "z" };

/** @type {object} */
export const fixture = {
  /**
   * Projector-direct input: same canonical 2-property chain shape as
   * p2_property_chain_realization_simplified (sibling fixture). Different
   * predicate-IRI namespace to avoid manifest ID collision and to discriminate
   * fixture-source for any per-fixture diagnostics.
   *
   * ∀x, y, z. parent(x, y) ∧ parent(y, z) → grandparent(x, z)
   */
  input: [
    {
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
                  predicate: PARENT,
                  arguments: [VAR_X, VAR_Y],
                },
                {
                  "@type": "fol:Atom",
                  predicate: PARENT,
                  arguments: [VAR_Y, VAR_Z],
                },
              ],
            },
            consequent: {
              "@type": "fol:Atom",
              predicate: GRANDPARENT,
              arguments: [VAR_X, VAR_Z],
            },
          },
        },
      },
    },
  ],

  expectedOutcome: {
    summary:
      "Strategy-routing canary asserting Tier-3 dispatch per spec §6.2's " +
      "tiered fallthrough algorithm. The strategy router (Step 5) records " +
      "strategy='property-chain' for the chain axiom; Step 6's chain " +
      "detection emits ObjectPropertyChain { chain: [parent, parent], " +
      "superProperty: grandparent } with chain array order EXACTLY preserving " +
      "the FOL binary-atom sequence. Recovery Payload carries " +
      "regularity_scope_warning per architect Q-Step6-1 ruling.",
    fixtureType: "projector-direct",
    projectionStrategy: "property-chain",
    role: "strategy-routing-canary-tier-3-dispatch",
    discriminationFromSibling:
      "p2_property_chain_realization_simplified asserts round-trip behavior + " +
      "Recovery Payload preservation; this fixture asserts strategy choice + " +
      "ObjectPropertyChain.chain array exactness",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "the strategy router silently routing the chain axiom to a non-Tier-3 " +
    "strategy (e.g., 'direct' would emit a SubObjectPropertyOf without chain " +
    "decomposition; 'annotated-approximation' would emit LossSignatures when " +
    "the chain is reversible-regime-projectable per spec §6.1.2; 'unmatched' " +
    "would skip emission entirely); OR Step 6's chain detection emitting " +
    "ObjectPropertyChain with the chain array in WRONG order (e.g., reversed " +
    "[parent, parent] is symmetric here but in general P_1 ∘ P_2 ≠ P_2 ∘ P_1, " +
    "so order preservation is load-bearing); OR collapsing the 2-property " +
    "chain to a single-element chain [parent] (would lose chain semantics); " +
    "OR introducing a phantom property in the chain array that the source FOL " +
    "did not declare.",

  "expected_v0.1_verdict": {
    ringStatus: "ring2-passes-with-strategy-router-attribution",
    phaseAuthored: 2,
    phaseActivated: 2,
    expectedRBoxAxiomCount: 1,
    expectedRBoxAxiomShape: {
      "@type": "ObjectPropertyChain",
      chain: [PARENT, PARENT],
      superProperty: GRANDPARENT,
    },
    expectedChainArrayOrderExactness:
      "chain array order EXACTLY [parent, parent] (preserving FOL binary-atom sequence parent(x,y) ∧ parent(y,z))",
    expectedLossSignatureCount: 0,
    expectedRecoveryPayloadCount: 1,
    expectedScopeNotesPattern: "/regularity_scope_warning/",
    expectedProjectionStrategy: "property-chain",
    expectedStrategyRouterAttribution:
      "manifest.activity OR per-axiom strategy reporting (per Step 5's strategy router shipped at commit cabebfa) records strategy='property-chain' for this axiom",
  },

  "expected_v0.2_elk_verdict": null,

  /**
   * Phase 4 entry re-exercise — same contract as
   * p2_property_chain_realization_simplified per architect Q-Step6-1 ruling.
   * This fixture's strategy assertion adapts to Phase 4's regularity check:
   * regularity-confirmed → strategy='property-chain' (warning cleared);
   * irregular → strategy='annotated-approximation' (fallthrough per spec
   * §6.2 algorithm).
   */
  phase4Reactivation: {
    gatedOn: "phase4-arc-content-loaded-with-import-closure-machinery",
    expectedOutcome:
      "Under Phase 4's regularityCheck(A, importClosure) active machinery: " +
      "(a) if the chain is regularity-confirmed under loaded ARC modules' " +
      "import closure, strategy stays 'property-chain' AND the " +
      "regularity_scope_warning is CLEARED from the Recovery Payload; OR " +
      "(b) if regularity fails, strategy fallthrough to " +
      "'annotated-approximation' per spec §6.2 algorithm.",
    divergenceTrigger:
      "If Phase 4's regularity check is active AND the strategy router " +
      "still reports 'property-chain' WITH regularity_scope_warning preserved " +
      "for a chain that the import closure verifies as regular, ESCALATE: " +
      "regularity-check semantics did not propagate from the spec §6.2.1 " +
      "Phase 4 contract to the strategy router's emission decision.",
  },

  meta: {
    verifiedStatus: "Verified",
    phase: 2,
    authoredAt: "2026-05-XX",
    authoredBy: "SME persona, Q-Step6 routing cycle SME path-fence-authoring pass",
    relatedFixtures: [
      "p2_property_chain_realization_simplified (sibling fixture; same chain shape, complementary assertion focus on round-trip + Recovery Payload preservation)",
      "strategy_routing_direct (Tier-2 Direct Mapping canary)",
      "strategy_routing_annotated (Tier-default Annotated Approximation canary)",
      "strategy_routing_no_match (forthcoming Step 5 deferred-deliverable; Tier-no-match diagnostic canary)",
    ],
    relatedSpecSections: [
      "spec §6.1.2 (Property-Chain Realization strategy)",
      "spec §6.2 (strategy selection algorithm — Tier-3 dispatch)",
      "spec §6.2.1 (regularity check)",
      "spec §6.4.2 (RecoveryPayload schema)",
      "API §6.2 (folToOwl signature)",
    ],
    relatedADRs: [
      "ADR-007 §7 (n-tuple matcher conventions)",
      "ADR-011 (audit-artifact @id content-addressing — RecoveryPayload @id pattern)",
    ],
    architectAuthorization:
      "Phase 2 entry packet §3.3 (corpus-ratified 2026-05-06 — strategy_routing_chain.fixture.js in scope); " +
      "Q-Step6-1 / Q-Step6-2 / Q-Step6-3 rulings 2026-05-XX (projector-direct + always-emit regularity_scope_warning + projector-only Step 6 scope)",
  },
};

export const meta = fixture.meta;
