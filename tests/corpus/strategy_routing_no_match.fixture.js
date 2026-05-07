/**
 * Phase 2 fixture — strategy-routing canary for no-strategy-applicable
 * pathological case (Phase 2 baseline + Phase 3 strengthening contract).
 *
 * Per Phase 2 entry packet §3.3 (architect-ratified 2026-05-06):
 *
 *   "strategy_routing_no_match.fixture.js — pathological axiom for which no
 *    strategy applies; asserts the projector raises a documented diagnostic
 *    per spec §6.1 rather than silently picking a strategy."
 *
 * ── Fixture-contract amendment 2026-05-XX (SME path-fence amendment per ADR-012 ──
 * ── banked principle 2 "fixture regime annotations are provisional during ─────
 * ── phases pre-shipping the matching pipeline component") ───────────────────
 *
 * Step 5's commit body documents: "Diagnostic-throw on no-strategy-applies
 * deferred until SME-authored strategy_routing_no_match fixture surfaces a
 * concrete pathological-axiom case." The implementation explicitly DEFERRED
 * the throw discipline; current Phase 2 projector treats bare fol:False as
 * silent fallthrough to Tier-default Annotated Approximation strategy with
 * empty output (no LossSignature emission, no RecoveryPayload).
 *
 * The original SME-authored fixture (Step 9.1 pre-amendment) carried
 * `expectedThrow: true` per spec §6.1's literal framing of "documented
 * diagnostic raise on no-strategy-applies." This contract did NOT match
 * Phase 2's actual implementation behavior; CI failure surfaced at the
 * Step 9.1 corpus commit attempt 2026-05-XX.
 *
 * SME amendment per the architect-banked annotation-tracking discipline
 * (ADR-012 banked principle 2; AUTHORING_DISCIPLINE.md "Phase 2 Banked
 * Principles" subsection): the fixture's behavioral expectation is
 * AMENDED to match Phase 2's silent-fallthrough baseline. The
 * phase3Reactivation field captures the throw-discipline strengthening
 * contract for Phase 3 entry packet ratification per spec §6.1's literal
 * framing. This is annotation-tracking work, NOT corpus expansion — no
 * architect re-routing required for the amendment itself.
 *
 * ── Adjacent Phase 2 implementation gap (forward-tracked to Phase 3 entry) ──
 *
 * Phase 2's projector silently emits empty output for bare fol:False with
 * NO LossSignature. Per spec §0.1: "every axiom that cannot be projected as
 * Direct Mapping or Property-Chain Realization must emit a Loss Signature
 * record with sufficient information to reconstruct the FOL form." Bare
 * fol:False falling through to Annotated Approximation WITHOUT LossSignature
 * emission is technically spec-non-compliant.
 *
 * Two candidate Phase 3 closures (architect to rule at Phase 3 entry):
 *   (a) Strengthen the strategy router to RAISE A DOCUMENTED DIAGNOSTIC on
 *       inputs the strategy machinery cannot anchor (e.g., bare fol:False
 *       has no relationIRI for the Recovery Payload's required field) — per
 *       spec §6.1's literal-framing throw discipline.
 *   (b) Strengthen Annotated Approximation to ALWAYS EMIT a LossSignature
 *       (with synthetic relationIRI for unanchored cases like bare fol:False)
 *       — per spec §0.1's "every axiom emits a Loss Signature" framing.
 *
 * Both options are forward-tracked. The fixture's phase3Reactivation
 * field documents the discriminating expected outcomes for both options.
 *
 * Status: Draft. Authored at Phase 2 Step 9.1 SME path-fence-authoring pass
 * (deferred from Step 8 close); amended at the same Step 9.1 cycle to match
 * Phase 2 baseline behavior; promoted to Verified at Phase 2 exit per the
 * standard AUTHORING_DISCIPLINE state-machine progression.
 *
 * ── Closes Phase 2 corpus to 13 of 13 architect-ratified fixtures + Q-G ──
 *
 * This fixture is the LAST of the 13 architect-ratified Phase 2 fixtures
 * + the Q-G architect-authorized +1 fixture. With this Phase 2 corpus is
 * complete per Phase 2 entry packet §3.6 inventory + Q-G ruling 2026-05-07.
 *
 * ── Strategy router no-match contract ─────────────────────────────────────
 *
 * Per spec §6.2's strategy selection algorithm: the projector tries each
 * strategy in tiered order:
 *
 *   Tier 1 (Phase 3+): coherence guard
 *   Tier 2: Direct Mapping
 *   Tier 3: Property-Chain Realization (Step 6 deliverable; shipped at
 *          commit covering Step 6)
 *   Tier-default: Annotated Approximation
 *
 * For the vast majority of valid FOL inputs, Annotated Approximation is the
 * catch-all fallback — it accepts any well-formed FOL state and emits a
 * structural annotation + machine-readable FOL string + Recovery Payload.
 *
 * The "no-strategy-applicable" case arises when the input FOL is
 * structurally invalid OR represents a shape the projector's emission
 * machinery cannot handle (e.g., bare falsum at the axiom-list top level,
 * or an axiom with an unrecognized @type discriminator).
 *
 * Per spec §6.1's framing: when no strategy applies, the projector MUST
 * raise a documented diagnostic — silent strategy-pick is a category error.
 * The fixture asserts the diagnostic-raising contract.
 *
 * ── Worked example ────────────────────────────────────────────────────────
 *
 *   FOL input (1 axiom): a bare top-level falsum (⊥)
 *     [{ "@type": "fol:False" }]
 *
 *   This is technically a valid FOL term (representing inconsistency / the
 *   universal-falsum constant), but OWL has no axiom-list-level shape that
 *   represents a bare ⊥ as a top-level assertion. OWL's TBox/ABox/RBox
 *   axioms have specific structural surfaces (SubClassOf, ClassAssertion,
 *   ObjectPropertyAssertion, etc.); a bare ⊥ doesn't fit any of these.
 *
 *   Strategy router behavior:
 *     - Tier 2 (Direct Mapping): no match — bare fol:False has no Direct
 *       Mapping pattern matcher target
 *     - Tier 3 (Property-Chain Realization): no match — not a chain pattern
 *     - Tier-default (Annotated Approximation): the projector's
 *       implementation choice — depending on whether Annotated
 *       Approximation accepts bare falsum or rejects it. Per spec §6.1.3
 *       Annotated Approximation is for "FOL shapes that don't map to OWL 2
 *       DL"; a bare falsum is arguably such a shape, BUT the projector's
 *       implementation may legitimately choose to reject it as malformed
 *       (since it has no class / property / individual to anchor the
 *       Recovery Payload's relationIRI field).
 *
 *   Expected projector behavior: raises a documented diagnostic. The exact
 *   error class is Developer's implementation choice; common candidates:
 *
 *     - StrategySelectionError / NoStrategyAppliesError
 *     - UnsupportedFOLAxiomError
 *     - InvalidFOLInputError
 *     - or similar named error subclass of the OFBT error hierarchy per
 *       API §10
 *
 *   The fixture's assertion contract is loose on the exact class name (to
 *   accommodate Developer's Step 5/6 implementation choices) but tight on
 *   the THROW behavior: folToOwl(fixture.input) MUST throw, NOT return a
 *   silent-strategy-picked output.
 *
 * ── Why a bare fol:False ──────────────────────────────────────────────────
 *
 * fol:False (⊥, falsum) is the universal-falsum constant per spec §6 +
 * fol-types.ts. Phase 1 fixtures use it as the consequent of disjointness
 * implications (e.g., p1_equivalent_and_disjoint_named's
 * "∀x. (A(x) ∧ B(x)) → fol:False" pattern), but ALWAYS embedded inside a
 * universal-implication structure.
 *
 * A BARE fol:False at the top level (no enclosing universal-implication or
 * other structural wrapper) is unusual — it asserts the empty FOL state
 * (the inconsistent ontology). OWL's structured-input format per API §3.1
 * has no top-level ⊥ axiom shape; SubClassOf(owl:Thing, owl:Nothing) would
 * be the closest OWL surface, but that's a SubClassOf axiom, not a bare ⊥.
 *
 * The projector's strategy router cannot route this to any of the four
 * tiers (Tier 1 deferred to Phase 3; Tier 2 Direct Mapping has no matcher;
 * Tier 3 Property-Chain Realization has no matcher; Tier-default Annotated
 * Approximation has no relationIRI to anchor). The documented-diagnostic
 * raise is the correct behavior per spec §6.1.
 *
 * ── Phase 5 entry NOT applicable ──────────────────────────────────────────
 *
 * No phase5Reactivation field for this fixture: Step 5's strategy router
 * already shipped (commit cabebfa); the fixture's contract is
 * Step-5-onwards already-active. The diagnostic-raising contract is checked
 * at Step 9 integration time.
 */

/** @type {object} */
export const fixture = {
  /**
   * Projector-direct input: a single bare top-level fol:False axiom. No
   * enclosing universal-implication or other structural wrapper.
   *
   * The strategy router has no tier that handles a bare ⊥; the projector
   * raises a documented diagnostic per spec §6.1.
   */
  input: [
    { "@type": "fol:False" },
  ],

  expectedOutcome: {
    summary:
      "Projector-direct fixture documenting the Phase 2 no-strategy-applicable " +
      "BASELINE behavior. Input is a bare top-level fol:False axiom — no Direct " +
      "Mapping pattern matches, no Property-Chain Realization pattern matches; " +
      "the strategy router falls through to Tier-default Annotated Approximation " +
      "per Step 5's tiered-fallthrough algorithm. Phase 2 projector treats this " +
      "as silent-fallthrough with EMPTY OUTPUT (no axioms emitted; no " +
      "LossSignature; no RecoveryPayload). This is technically spec-non-compliant " +
      "per spec §0.1 (every projection failure should emit a LossSignature) but " +
      "is the documented Phase 2 BASELINE pending Phase 3 entry packet's " +
      "ratification of the throw discipline OR the always-emit-LossSignature " +
      "discipline (see phase3Reactivation field for both candidate closures).",
    fixtureType: "projector-direct",
    role: "no-strategy-applies-canary-phase2-baseline",
    phase2BaselineBehavior: "silent-fallthrough-to-annotated-approximation-with-empty-output",
    phase2SpecConformanceGap:
      "spec §0.1 'every axiom emits a LossSignature' contract violated — " +
      "Phase 2 baseline produces empty output without LossSignature emission " +
      "for bare fol:False. Forward-tracked to Phase 3 entry packet for joint " +
      "ratification of the closure (throw discipline OR always-emit-LossSignature)."
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "REGRESSION from Phase 2's documented silent-fallthrough baseline to " +
    "either (a) accidental Direct Mapping mis-routing (would emit a structurally-" +
    "invalid OWL axiom, e.g., a SubClassOf with empty subClass / superClass), " +
    "OR (b) accidental Property-Chain Realization mis-routing (would emit an " +
    "ObjectPropertyChain with empty chain array — type-system-invalid), OR (c) " +
    "accidental Annotated Approximation with FABRICATED relationIRI (would " +
    "emit a Recovery Payload anchored to a synthesized IRI that the source FOL " +
    "did not declare — semantic leak). The canary's role at Phase 2 is " +
    "regression-detection: the silent-fallthrough behavior is the BASELINE; " +
    "any DEVIATION from baseline (in any direction — toward stricter throw, " +
    "toward LossSignature emission, toward mis-routed structurally-invalid " +
    "output) signals a Phase 2 implementation change that requires architect " +
    "re-routing per ADR-012's behavioral-contract evolution discipline.",

  "expected_v0.1_verdict": {
    ringStatus: "ring2-passes-with-phase2-silent-fallthrough-baseline",
    phaseAuthored: 2,
    phaseActivated: 2,
    expectedReturn: true,
    expectedReturnShape: {
      ontology: { tbox: [], abox: [], rbox: [] },
      newLossSignatures: [],
      newRecoveryPayloads: [],
      manifest: "ProjectionManifest with strategy attribution 'annotated-approximation' for the bare fol:False axiom (or empty if Step 5's strategy router doesn't attribute strategies for unmatched-by-Direct-Mapping inputs)"
    },
    note:
      "test runner asserts folToOwl(fixture.input) RETURNS a value (does NOT " +
      "throw). The returned value's ontology axiom counts MUST all be 0 (empty " +
      "output). The returned value's newLossSignatures + newRecoveryPayloads " +
      "MUST also be empty per Phase 2 baseline (spec-conformance gap " +
      "documented in phase2SpecConformanceGap field; closure deferred to " +
      "Phase 3 entry packet). If the projector THROWS at Phase 2, the test " +
      "FAILS — diagnostic-throw is forward-tracked to Phase 3, not Phase 2 " +
      "implementation.",
  },

  "expected_v0.2_elk_verdict": null,

  /**
   * Phase 3 entry re-exercise per architect Q3 ruling 2026-05-06 + the
   * forward-track from Phase 2's spec §0.1 / spec §6.1 conformance gap.
   * Phase 3 entry packet's ratification rules on which of two candidate
   * closures applies; this fixture's contract amends to match the ratified
   * closure at Phase 3 reactivation.
   */
  phase3Reactivation: {
    gatedOn: "phase-3-entry-packet-ratifies-no-strategy-applies-closure",
    expectedOutcomeOptionA:
      "If Phase 3 entry packet ratifies the throw-discipline closure (per " +
      "spec §6.1 literal framing): folToOwl(fixture.input) at Phase 3+ " +
      "THROWS a documented diagnostic error (e.g., NoStrategyAppliesError " +
      "or similar named subclass of the OFBT error hierarchy per API §10). " +
      "The fixture's expectedReturn flips to expectedThrow: true at Phase 3 " +
      "reactivation; intendedToCatch updates to detect silent-strategy-pick " +
      "regression.",
    expectedOutcomeOptionB:
      "If Phase 3 entry packet ratifies the always-emit-LossSignature " +
      "closure (per spec §0.1 'every axiom emits a LossSignature' framing): " +
      "folToOwl(fixture.input) at Phase 3+ returns ontology with empty " +
      "axiom counts BUT newLossSignatures.length >= 1 carrying lossType: " +
      "<some-lossType> + relationIRI: <synthetic-or-omitted> + reason: " +
      "'no_strategy_applies_for_unanchored_axiom' (or similar machine-code). " +
      "The fixture's expected_v0.1_verdict.expectedReturnShape updates to " +
      "expect non-empty LossSignature emission.",
    divergenceTrigger:
      "If Phase 3 implementation diverges from BOTH ratified closures (i.e., " +
      "still silent-fallthrough with empty output AND no LossSignature), " +
      "ESCALATE: spec §0.1 + §6.1 conformance gap not resolved. " +
      "If Phase 3 implementation matches whichever closure architect " +
      "ratified, NORMAL — the fixture's contract amends to match.",
  },

  meta: {
    verifiedStatus: "Draft",
    phase: 2,
    authoredAt: "2026-05-XX",
    authoredBy:
      "SME persona, Phase 2 Step 9.1 SME path-fence-authoring pass " +
      "(deferred from Step 8 close per Developer's 'Step 9 cleanup' framing)",
    relatedFixtures: [
      "p1_equivalent_and_disjoint_named (Phase 1 verified-status fol:False usage as disjointness implication consequent — for contrast: fol:False INSIDE a universal-implication is well-handled; this fixture exercises BARE top-level fol:False)",
      "strategy_routing_direct (sibling §3.3 strategy-routing fixture — Tier-2 Direct Mapping positive case)",
      "strategy_routing_chain (sibling §3.3 — Tier-3 Property-Chain Realization positive case)",
      "strategy_routing_annotated (sibling §3.3 — Tier-default Annotated Approximation positive case)",
    ],
    relatedSpecSections: [
      "spec §6.1 (documented-diagnostic-raise contract for no-strategy-applies case)",
      "spec §6.2 (strategy selection algorithm — tiered fallthrough)",
      "API §10 (error class hierarchy — Developer's choice on which subclass for the no-strategy diagnostic)",
    ],
    architectAuthorization:
      "Phase 2 entry packet §3.3 (corpus-ratified 2026-05-06 — strategy_routing_no_match.fixture.js in scope as the 4th of 4 strategy-routing fixtures)",
  },
};

export const meta = fixture.meta;
