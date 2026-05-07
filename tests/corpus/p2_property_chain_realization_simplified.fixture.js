/**
 * Phase 2 fixture — Property-Chain Realization simplified built-in OWL form.
 *
 * Per Phase 2 entry packet §3.2 (architect-ratified 2026-05-06):
 *
 *   "Property-chain realization in built-in OWL form (NOT the full RDM
 *    v1.2.1 chain — that's Phase 7-deferred per ADR-008). Exercises
 *    owl:propertyChainAxiom emission with a 2-property chain whose FOL
 *    implication is captured exactly."
 *
 * Per Q-Step6 routing cycle architect rulings 2026-05-XX (Aaron-shared):
 *   - Q-Step6-1 → Option (b): always-emit `regularity_scope_warning` in the
 *     Recovery Payload's scopeNotes per spec §6.2.1's literal framing
 *   - Q-Step6-2 → factual: Phase 1 lifter does NOT emit chains; this fixture
 *     is projector-direct (FOL input) per the established Phase 2 convention
 *   - Q-Step6-3 → Option (α): Step 6 is projector-only; lifter
 *     ObjectPropertyChain support deferred to Phase 3 OR Phase 4
 *
 * Status: Draft. Authored at Q-Step6 routing cycle SME path-fence-authoring
 * pass 2026-05-XX; promoted to Verified at Phase 2 exit per the standard
 * AUTHORING_DISCIPLINE state-machine progression.
 *
 * ── Convention: projector-direct fixture (mirrors p2_lossy_naf_residue + ───
 * ── p2_unknown_relation_fallback + strategy_routing_annotated) ────────────
 *
 * The `input` field is a FOL axioms array (not OWL ontology). Test runner
 * dispatches via folToOwl(fixture.input), bypassing the lifter. Phase 1
 * lifter does not emit property chains today; lifter ObjectPropertyChain
 * support is forward-tracked to Phase 3 OR Phase 4 per architect Q-Step6-3
 * ruling. Step 6 ships projector-only chain detection.
 *
 * ── Property-Chain Realization emission contract ──────────────────────────
 *
 * Per spec §6.1.2: a property chain pattern of the form
 *
 *   ∀x, y_1, ..., y_{n-1}, z. P_1(x, y_1) ∧ P_2(y_1, y_2) ∧ ... ∧
 *                              P_n(y_{n-1}, z) → Q(x, z)
 *
 * projects to:
 *
 *   ObjectPropertyChain { chain: [P_1, P_2, ..., P_n], superProperty: Q }
 *
 * with strategy 'property-chain' per spec §6.2's tiered fallthrough algorithm.
 *
 * Per architect Q-Step6-1 ruling: every chain detected at Phase 2 emits the
 * Recovery Payload with `scopeNotes: ["regularity_scope_warning: import
 * closure not loaded; regularity verified against currently-loaded graph
 * only"]` (or close paraphrase per spec §6.2.1's "naming the imports actually
 * loaded" framing). Phase 4 entry packet's regularity-check upgrade clears
 * the warning for regularity-confirmed chains under loaded-ARC import
 * closure; chains failing regularity fall through to Annotated Approximation
 * per spec §6.2 algorithm.
 *
 * ── Worked example ────────────────────────────────────────────────────────
 *
 *   FOL input (1 axiom): a 2-property chain
 *     ∀x, y, z. parent(x, y) ∧ parent(y, z) → grandparent(x, z)
 *
 *   Where:
 *     - parent and grandparent are predicate IRIs under
 *       http://example.org/test/p2_property_chain_realization_simplified/
 *     - The FOL conjunction-implication shape is the canonical chain pattern
 *       per ADR-007 §7's n-tuple matcher convention
 *
 *   Expected projector output (Step 6 contract):
 *     - 1 RBox axiom: ObjectPropertyChain { chain: [parent, parent],
 *       superProperty: grandparent }
 *     - 1 RecoveryPayload with approximationStrategy: 'PROPERTY_CHAIN',
 *       relationIRI: <grandparent>, originalFOL: <verbatim input>,
 *       scopeNotes: ["regularity_scope_warning: import closure not loaded;
 *                     regularity verified against currently-loaded graph only"]
 *     - 0 LossSignatures (chain projection is reversible-regime, not loss)
 *     - manifest.activity records strategy 'property-chain' for the axiom
 *       (assertion via Step 5's strategy reporting; already shipped at
 *       commit cabebfa)
 *
 * ── Why this exercises the property-chain emission path ───────────────────
 *
 * Step 6 adds Tier-3 dispatch in the strategy router per spec §6.2 (Tier 1:
 * coherence guard — Phase 3 scope; Tier 2: Direct Mapping — already shipped
 * at Step 4b; Tier 3: Property-Chain Realization — this fixture's target;
 * Tier-default: Annotated Approximation — already shipped at Step 4a). The
 * chain pattern shape (conjunction of binary atoms with shared variables)
 * matches the n-tuple matcher per ADR-007 §7's structural recognition rules.
 *
 * The fixture asserts the projector's chain-detection + emission machinery,
 * including the regularity-warning Recovery Payload note that is mandatory
 * per architect Q-Step6-1 ruling.
 *
 * ── Round-trip behavior ───────────────────────────────────────────────────
 *
 * Per spec §7's regime taxonomy: this fixture is `reversible` — the
 * projection is structurally clean (ObjectPropertyChain emitted) AND a
 * Recovery Payload preserves the original FOL state for downstream re-
 * evaluation. The "reversibility" is the Recovery Payload's preservation of
 * the FOL conjunction-implication shape, NOT byte-clean OWL round-trip
 * (lifter ObjectPropertyChain support is forward-tracked).
 *
 * Discrimination from `equivalent` regime: lift+project round-trip is NOT
 * exercised here (lifter does not emit chains today); the Recovery Payload
 * is the round-trip preservation mechanism.
 *
 * ── Phase 4 entry re-exercise ─────────────────────────────────────────────
 *
 * Per architect Q-Step6-1 ruling: Phase 4 entry packet activates
 * regularityCheck(A, importClosure) against loaded ARC modules. Chains
 * regularity-confirmed under import closure emit WITHOUT
 * regularity_scope_warning (the warning becomes optional rather than
 * mandatory — a non-breaking strengthening of the contract per ADR-011's
 * Q-3 banked principle on behavioral-contract evolution). Chains failing
 * regularity fall through to Annotated Approximation per spec §6.2
 * algorithm.
 */

const PREFIX = "http://example.org/test/p2_property_chain_realization_simplified/";
const PARENT = PREFIX + "parent";
const GRANDPARENT = PREFIX + "grandparent";

const VAR_X = { "@type": "fol:Variable", name: "x" };
const VAR_Y = { "@type": "fol:Variable", name: "y" };
const VAR_Z = { "@type": "fol:Variable", name: "z" };

/** @type {object} */
export const fixture = {
  /**
   * Projector-direct input: a single FOL axiom representing the canonical
   * 2-property chain pattern per spec §6.1.2 + ADR-007 §7's n-tuple matcher
   * structural recognition rules.
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
                // parent(x, y)
                {
                  "@type": "fol:Atom",
                  predicate: PARENT,
                  arguments: [VAR_X, VAR_Y],
                },
                // parent(y, z)
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
      "Projection emits Property-Chain Realization strategy with one RBox " +
      "axiom of shape ObjectPropertyChain { chain: [parent, parent], " +
      "superProperty: grandparent } AND one RecoveryPayload carrying " +
      "approximationStrategy: 'PROPERTY_CHAIN', originalFOL preserving the " +
      "input verbatim, and scopeNotes containing 'regularity_scope_warning' " +
      "per architect Q-Step6-1 ruling. No LossSignatures emitted (chain " +
      "projection is reversible-regime, not loss). The @id of the " +
      "RecoveryPayload matches /^ofbt:rp\\/[0-9a-f]{64}$/ per ADR-011.",
    fixtureType: "projector-direct",
    projectionStrategy: "property-chain",
    chainArity: 2,
    chainShape: "P1 ∘ P1 → Q (parent ∘ parent → grandparent)",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "the projector silently routing the chain pattern to Annotated " +
    "Approximation (would emit LossSignature(s) when the spec §6.1.2 + §6.2 " +
    "tiered fallthrough specifies Property-Chain Realization as Tier-3 " +
    "BEFORE Annotated Approximation as Tier-default); OR routing to Direct " +
    "Mapping (would emit a SubObjectPropertyOf without the chain " +
    "decomposition); OR emitting ObjectPropertyChain WITHOUT the Recovery " +
    "Payload's regularity_scope_warning (would silently assert regularity " +
    "the system cannot verify, violating spec §6.2.1's literal framing per " +
    "architect Q-Step6-1 ruling); OR collapsing the 2-property chain to a " +
    "single property (would lose the chain structure entirely); OR " +
    "introducing a phantom property in the chain that the source FOL did " +
    "not declare.",

  "expected_v0.1_verdict": {
    ringStatus: "ring2-passes-with-recovery-payload",
    phaseAuthored: 2,
    phaseActivated: 2,
    expectedRBoxAxiomCount: 1,
    expectedRBoxAxiomShape: {
      "@type": "ObjectPropertyChain",
      chain: [PARENT, PARENT],
      superProperty: GRANDPARENT,
    },
    expectedLossSignatureCount: 0,
    expectedRecoveryPayloadCount: 1,
    expectedRecoveryPayloadShape: {
      "@type": "ofbt:RecoveryPayload",
      approximationStrategy: "PROPERTY_CHAIN",
      relationIRI: GRANDPARENT,
      // @id pattern: /^ofbt:rp\/[0-9a-f]{64}$/ per ADR-011 §3.2
      // originalFOL: verbatim input (the universal-implication-with-chain
      //   shape preserved for downstream re-evaluation)
      // scopeNotes: ["regularity_scope_warning: ..."] per architect
      //   Q-Step6-1 ruling
    },
    expectedScopeNotesPattern: "/regularity_scope_warning/",
    expectedProjectionStrategy: "property-chain",
  },

  "expected_v0.2_elk_verdict": null,

  /**
   * Phase 4 entry re-exercise per architect Q-Step6-1 ruling. Phase 4
   * activates regularityCheck(A, importClosure) against loaded ARC modules;
   * the regularity_scope_warning becomes optional (cleared for regularity-
   * confirmed chains) — a non-breaking strengthening of the Phase 2 contract
   * per ADR-011's Q-3 banked principle.
   */
  phase4Reactivation: {
    gatedOn: "phase4-arc-content-loaded-with-import-closure-machinery",
    expectedOutcome:
      "Under Phase 4 ARC content loaded with regularityCheck(A, " +
      "importClosure) machinery active, this fixture's chain pattern (with " +
      "the parent and grandparent IRIs promoted to a test ARC module if " +
      "applicable, OR remaining outside ARC content with regularity verified " +
      "against the import closure) either: (a) emits ObjectPropertyChain " +
      "WITHOUT regularity_scope_warning if regularity is verified under " +
      "import closure, OR (b) falls through to Annotated Approximation per " +
      "spec §6.2 algorithm if regularity fails.",
    divergenceTrigger:
      "If Phase 4's regularityCheck(A, importClosure) machinery is active " +
      "AND emits regularity_scope_warning for THIS fixture (whose chain " +
      "should be regularity-confirmed under reasonable test ARC " +
      "configuration), ESCALATE: regularity-check semantics regression " +
      "between Phase 2 and Phase 4 (the warning should be cleared, not " +
      "preserved, when import closure verifies regularity).",
  },

  meta: {
    verifiedStatus: "Verified",
    phase: 2,
    authoredAt: "2026-05-XX",
    authoredBy: "SME persona, Q-Step6 routing cycle SME path-fence-authoring pass",
    relatedFixtures: [
      "p2_lossy_naf_residue (projector-direct convention precedent)",
      "p2_unknown_relation_fallback (projector-direct convention precedent)",
      "strategy_routing_annotated (projector-direct convention + Recovery Payload precedent)",
      "strategy_routing_chain (sibling fixture exercising strategy assertion on the same chain shape)",
    ],
    relatedSpecSections: [
      "spec §6.1.2 (Property-Chain Realization strategy)",
      "spec §6.2 (strategy selection algorithm — Tier-3 dispatch)",
      "spec §6.2.1 (regularity check + regularity_scope_warning framing)",
      "spec §6.4.2 (RecoveryPayload schema)",
      "spec §7.3 (reversible-regime contract)",
      "API §6.2 (folToOwl signature)",
      "API §6.4 (audit artifact types)",
    ],
    relatedADRs: [
      "ADR-007 §1 (lifter emits classical FOL — load-bearing for the projector-direct fixture convention; Phase 1 lifter does not emit chains today per Q-Step6-2 factual)",
      "ADR-007 §7 (n-tuple matcher conventions — informs Step 6's chain detection)",
      "ADR-011 (audit-artifact @id content-addressing — RecoveryPayload @id pattern)",
      "ADR-008 (OFI deontic deferred to v0.2 — informs the 'simplified built-in OWL form' framing per Phase 2 entry packet §3.2: NOT the full RDM v1.2.1 chain)",
    ],
    architectAuthorization:
      "Q-Step6-1 ruling 2026-05-XX (always-emit regularity_scope_warning); " +
      "Q-Step6-2 ruling (factual: projector-direct fixture, regime: " +
      "reversible); Q-Step6-3 ruling (Step 6 is projector-only).",
  },
};

export const meta = fixture.meta;
