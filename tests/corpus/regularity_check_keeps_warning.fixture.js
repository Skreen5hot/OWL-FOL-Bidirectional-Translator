/**
 * Phase 4 fixture — regularityCheck conservative-default keeps-warning surface
 * (Sub-option α minimum-viable certification — chain containing
 * owl:TransitiveProperty role).
 *
 * ── Corrective sub-amendment (Q-4-Step6-A Pass 2b 2026-05-15 — within open Pass 2b
 * window post-brief-confirmation; Cat 8 production catch surfaced at Developer
 * Pass 2b verification ritual) ──
 *
 * **Surface + canonical sources + corrective amendment shape:** identical to the
 * sibling fixture `regularity_check_clears_warning.fixture.js` audit-trail entry
 * for this corrective sub-amendment (both fixtures carried the same RBox shape
 * mismatch; same SME path-fence-author error pattern; same Cat 8 production catch
 * disposition). See the sibling's audit-trail header for full corrective-sub-
 * amendment surface + failure-mode-class + disposition documentation.
 *
 * **Disposition:** SME-domain mechanical fix per binding-immediately discipline +
 * Q-4-Step6-A Pass 2b Banking 1 (Catch 5 disambiguation reuse). Verification ritual
 * production catch SIXTH instance (Catch 6) + SME pre-routing ritual production
 * miss SECOND instance (Miss 2). Cat 10 type-field-structure consistency candidacy
 * forward-tracks to Phase 4 exit retro alongside Cat 9 candidacy.
 *
 * Per Phase 4 entry packet §3.3 step-N-bind + Q-4-Step6-A architect ruling
 * 2026-05-14/15 (Phase 4 mid-phase architectural-gap micro-cycle 3/3):
 *
 *   "regularity_check_keeps_warning.fixture.js — synthetic chain containing
 *    at least one owl:TransitiveProperty role; expected projector output
 *    includes regularity_scope_warning (Phase 2 baseline preserved)"
 *
 * Status: Draft (NEW Phase 4 authoring per Q-4-Step6-A.1.1); Step 6 binding;
 * promotes to Verified when Step 6 ships the regularityCheck function +
 * projector amendment per Sub-option α minimum-viable certification logic.
 *
 * ── Discrimination from regularity_check_clears_warning (sibling) ──
 *
 * THIS fixture exercises the CONSERVATIVE-DEFAULT keeps-warning side per
 * Q-4-Step6-A.1.1 Sub-option α certification: chain containing at least one
 * owl:TransitiveProperty role; regularityCheck returns 'cannot-certify';
 * projector defaults to emitting regularity_scope_warning (Phase 2 baseline
 * preserved).
 *
 * `regularity_check_clears_warning.fixture.js` (Phase 4 step-N-bind sibling)
 * exercises the AFFIRMATIVE skip-warning side: chain over BFO non-transitive
 * roles; regularityCheck returns 'regularity-certified'; projector omits
 * regularity_scope_warning.
 *
 * ── Sub-option α certification logic per architect Q-4-Step6-A.1.1 ──
 *
 * For THIS fixture: chain roles are continuant_part_of (BFO_0000176) +
 * has_continuant_part (BFO_0000178). Per `arc/core/bfo-2020.json`: BOTH have
 * `owlCharacteristics: "owl:TransitiveProperty"`. Certification logic returns
 * 'cannot-certify' on encountering the first transitive role (continuant_part_of);
 * projector preserves Phase 2 baseline + emits regularity_scope_warning.
 *
 * Note: cycle-prone predicate class per ADR-013 (visited-ancestor cycle-guard
 * pattern) — continuant_part_of + has_continuant_part are the canonical
 * transitivity-cycle-prone parthood predicates. Phase 3 Step 5 ratified ADR-013
 * for these cases; Phase 4 Step 6's regularityCheck is the chain-regularity
 * surface (distinct from ADR-013's cycle-guard surface; both apply when chain
 * contains parthood roles).
 *
 * ── Spec-formally-correct anchor per Horrocks, Kutz, Sattler (2007) ──
 *
 * Transitivity is THE canonical regularity-restricting characteristic in SROIQ
 * per Horrocks, Kutz, and Sattler (2007). A chain involving transitive roles
 * cannot be trivially certified as regular; conservative default applies.
 * Phase 4 Step 6 ships the minimum-viable scope (transitivity as the singular
 * canonical violation source); v0.2 ELK closure extends to full SROIQ
 * regularity check per v0.2-09 forward-track.
 *
 * ── Phase 2 baseline preservation per ADR-011 ──
 *
 * Per ADR-011 behavioral-contract evolution discipline: Step 6 is non-breaking
 * strengthening of the Phase 2 baseline. The Phase 2 projector emitted
 * regularity_scope_warning unconditionally on all chain projections. Step 6
 * strengthens by OMITTING the warning for regularity-certified chains; the
 * Phase 2 default (keep the warning) holds for chains that cannot be certified.
 *
 * THIS fixture exercises the Phase 2 baseline preservation: the chain
 * contains transitive roles; Step 6 cannot certify; warning is kept (Phase 2
 * baseline). The signal-preserving discipline per Q-4-Step6-A Banking 6:
 * omission means certified; presence means cannot-certify (cleaner than
 * Phase 2's unconditional emission).
 *
 * ── Step 6 / Step 8 boundary per Q-4-Step6-A.4 ──
 *
 * THIS fixture's chain contains transitive roles → cannot-certify. The
 * regularity_scope_warning is emitted per Phase 2 baseline. Step 8's
 * fall-through-to-Annotated-Approximation surface is DISTINCT from Step 6's
 * warning emission: Step 8 fires when the chain ALSO cannot be lift-correctly
 * emitted (separate condition). THIS fixture does NOT exercise Step 8's
 * surface; the chain is lift-correctly emittable (it's a valid OWL 2 DL
 * ObjectPropertyChain); the cannot-certify outcome triggers only the warning,
 * not the Annotated Approximation fall-through.
 *
 * ── What this fixture catches ────────────────────────────────────────────
 *
 * Step 6 implementation failure modes for the conservative-default keeps-warning
 * side:
 *   - Projector clears warning for chain containing transitive role
 *     (Sub-option α logic inverted — false-positive regularity certification)
 *   - Projector drops warning silently (Phase 2 baseline corruption — corpus
 *     demand fails)
 *   - regularityCheck short-circuits on first non-transitive role + ignores
 *     subsequent transitive roles (logic bug)
 *   - Projector conflates Step 6 warning emission with Step 8 LossSignature
 *     emission (boundary violation per Q-4-Step6-A.4)
 */

const PREFIX = "http://example.org/test/regularity_check_keeps_warning/";
const BFO_CONTINUANT_PART_OF = "http://purl.obolibrary.org/obo/BFO_0000176"; // continuant_part_of — owl:TransitiveProperty per arc/core/bfo-2020.json
const BFO_HAS_CONTINUANT_PART = "http://purl.obolibrary.org/obo/BFO_0000178"; // has_continuant_part — owl:TransitiveProperty per arc/core/bfo-2020.json
const SYNTHETIC_TARGET_RELATION = PREFIX + "partOfHasPart"; // synthetic super-property the chain composes into
const INDIVIDUAL_A = PREFIX + "individual_a";
const INDIVIDUAL_B = PREFIX + "individual_b";
const INDIVIDUAL_C = PREFIX + "individual_c";

/** @type {object} */
export const fixture = {
  /**
   * Input ontology with explicit ObjectPropertyChain over BFO transitive
   * roles (continuant_part_of ∘ has_continuant_part). The chain's role
   * composition is the projector's chain emission surface; regularityCheck
   * consults loaded ARC content's owlCharacteristics for each role;
   * Sub-option α returns 'cannot-certify' because continuant_part_of has
   * owl:TransitiveProperty (the first transitive role short-circuits).
   *
   * Note: This is a Sub-option α minimum-viable certification result, NOT
   * a formal SROIQ Horrocks regularity check. Under full SROIQ analysis,
   * the chain may still be regular (continuant_part_of ∘ has_continuant_part
   * involves inverse-of relations + transitivity composition; formal
   * regularity depends on the role hierarchy + composition closure). v0.2
   * ELK closure path extends per v0.2-09 forward-track.
   */
  input: {
    ontologyIRI: "http://example.org/test/regularity_check_keeps_warning",
    prefixes: {
      bfo: "http://purl.obolibrary.org/obo/",
      ex: PREFIX,
    },
    tbox: [],
    abox: [
      {
        "@type": "ObjectPropertyAssertion",
        property: BFO_CONTINUANT_PART_OF,
        source: INDIVIDUAL_A,
        target: INDIVIDUAL_B,
      },
      {
        "@type": "ObjectPropertyAssertion",
        property: BFO_HAS_CONTINUANT_PART,
        source: INDIVIDUAL_B,
        target: INDIVIDUAL_C,
      },
    ],
    rbox: [
      {
        "@type": "ObjectPropertyChain",
        chain: [BFO_CONTINUANT_PART_OF, BFO_HAS_CONTINUANT_PART],
        superProperty: SYNTHETIC_TARGET_RELATION,
      },
    ],
  },

  loadOntologyConfig: {
    arcModules: ["core/bfo-2020"],
  },

  /**
   * Expected projector RecoveryPayload contents per Sub-option α certification:
   *   - Chain emitted in RecoveryPayload (canonical chain emission per ADR-007 §11)
   *   - regularity_scope_warning PRESENT (Phase 2 baseline preserved because
   *     regularityCheck returns 'cannot-certify')
   *
   * The fixture asserts RecoveryPayload-level pattern matching on the projector's
   * output (distinct from lift-correctness fixtures which assert lifted-FOL-state).
   */
  expectedOutcome: {
    summary:
      "Phase 4 Step 6 projector with BFO 2020 ARC loaded + Sub-option α regularityCheck applied to a chain containing owl:TransitiveProperty roles (continuant_part_of ∘ has_continuant_part) produces RecoveryPayload containing the chain emission per ADR-007 §11 AND ALSO regularity_scope_warning (kept because regularityCheck returns 'cannot-certify'; Phase 2 baseline preserved per ADR-011 non-breaking strengthening signal-preserving discipline + Q-4-Step6-A.4 step boundary preservation).",
    fixtureType: "projector-emission-control-regularity-check",
    expectedRecoveryPayloadShape: {
      chainEmission: "present",
      regularityScopeWarning: "present",
      regularityCheckResult: "cannot-certify",
    },
    canaryRole: "regularity-check-conservative-default-keeps-warning-unit-level",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "Phase 4 Step 6 regularityCheck conservative-default keeps-warning failure modes: (1) projector clears regularity_scope_warning for chain containing transitive role (Sub-option α logic inverted — false-positive regularity certification corrupts the spec §6.2.1 'regularity-confirmed' semantic per architect Q-4-Step6-A.1 anchor); (2) projector drops warning silently (Phase 2 baseline corruption — corpus demand fails); (3) regularityCheck short-circuits on first non-transitive role + ignores subsequent transitive roles (iteration bug — needs to scan ALL chain roles, return 'cannot-certify' on FIRST transitive encounter); (4) projector conflates Step 6 warning emission with Step 8 LossSignature emission (boundary violation per Q-4-Step6-A.4 — Step 8 is fall-through-to-Annotated-Approximation, distinct surface from Step 6's warning emission control).",

  "expected_v0.1_verdict": {
    ringStatus: "ring2-projector-emission-control-regularity-check-conservative",
    phaseAuthored: 4,
    phaseActivated: 4,
    expectedRecoveryPayloadShape: {
      chainEmission: "present",
      regularityScopeWarning: "present",
      regularityCheckResult: "cannot-certify",
    },
    corpusActivationTiming: "step-N-bind",
    stepBinding: 6,
    discriminatesAgainst:
      "any Phase 4 Step 6 projector that clears regularity_scope_warning for chain containing owl:TransitiveProperty role (false-positive certification — corrupts spec §6.2.1 semantic per Q-4-Step6-A.1); any projector that silently drops warning for the cannot-certify case (Phase 2 baseline corruption); any projector with iteration bug short-circuiting on non-transitive roles; any projector conflating Step 6 (warning emission) with Step 8 (LossSignature emission + Annotated Approximation fall-through) per Q-4-Step6-A.4 boundary preservation.",
  },

  "expected_v0.2_elk_verdict": {
    notes:
      "v0.2 ELK closure extends Sub-option α minimum-viable certification to full SROIQ Horrocks regularity check (per v0.2-09 forward-track). At v0.2, this fixture's chain may EITHER (a) certify (continuant_part_of ∘ has_continuant_part may be regular under full SROIQ analysis if role hierarchy + composition closure permits) — in which case the v0.2 expectation flips to 'regularity-certified' + warning omitted; OR (b) still cannot-certify (formal analysis confirms transitivity-restriction at chain level) — in which case the v0.2 expectation matches v0.1. The disposition surfaces at v0.2 entry-cycle authoring per v0.2-09 + v0.2-02 (ELK reasoner integration) landing.",
  },

  meta: {
    verifiedStatus: "Draft",
    phase: 4,
    activationTiming: "step-N-bind",
    stepBinding: 6,
    corpusActivationTiming: "step-N-bind",
    authoredAt: "2026-05-14",
    authoredBy: "SME persona, Phase 4 Step 6 Q-4-Step6-A mid-phase architectural-gap micro-cycle path-fence-authoring per architect ruling 2026-05-14/15",
    relatedSpecSections: [
      "spec §6.1.2 (SROIQ R feature + regularity restriction citing Horrocks, Kutz, and Sattler 2007)",
      "spec §6.2.1 (chain projection + regularity_scope_warning emission + Step 6 strengthening surface; Phase 2 baseline preservation under cannot-certify)",
      "spec §3.6.2 (arcModules parameter on LifterConfiguration)",
    ],
    relatedADRs: [
      "ADR-007 §1 (DECISIONS.md ADR-007 — projector emits classical FOL; chain emission canonical shape)",
      "ADR-007 §11 (FOL→Prolog per-variant translation table; chain emission per ADR-007 §11)",
      "ADR-013 (DECISIONS.md ADR-013 — visited-ancestor cycle-guard pattern; continuant_part_of + has_continuant_part are canonical cycle-prone parthood predicates; ADR-013 surface is distinct from Step 6's regularityCheck surface — both apply to chains involving parthood)",
    ],
    relatedBankedPrinciples: [
      "Q-4-Step6-A.1 + .1.1 banking (minimum-viable certification operates on transitivity per Horrocks et al. 2007)",
      "Q-4-Step6-A.4 step boundary banking (Step 6 = warning emission control; Step 8 = LossSignature emission; clean separation)",
      "Q-4-Step6-A Banking 6 (non-breaking strengthening of behavioral contracts honors signal-preserving omission discipline) — architect verbatim cites 'ADR-011 evolution discipline'; Q-4-Step6-A verification ritual Catch 5 (Cat 2+7+8 cross-category 2026-05-14/15) confirms 'behavioral-contract evolution discipline' is verbal-banked, NOT a numbered ADR in either DECISIONS.md or spec §10 registry; SME-domain mechanical fix per Q-4-Step5-A Pass 2b Banking 3 disambiguation discipline; reconciliation deferred per parallel-registry-reconciliation Phase 4 exit retro candidate",
      "Q-Step6-1 Phase 2 baseline preservation discipline (verbal-banked at Phase 2 cycle; reaffirmed at Q-4-Step6-A architect ruling)",
    ],
    relatedFixtures: [
      "regularity_check_clears_warning (Phase 4 step-N-bind sibling: affirmative skip-warning side; chain over non-transitive roles; together with this fixture exercises both sides of Sub-option α binary outcome)",
      "bfo_disjointness_map_axiom_emission (Phase 4 step-N-bind sibling: Q-4-Step4-A precedent — unit-level emission verification pattern)",
    ],
    architectAuthorization:
      "Q-4-Step6-A architect ruling 2026-05-14/15 + Q-4-Step6-A.1 Reading 3 hybrid + Q-4-Step6-A.1.1 Sub-option α + Q-4-Step6-A.2 SME dispatch + Q-4-Step6-A.4 Step 6 / Step 8 boundary preservation per `project/reviews/phase-4-step6-regularity-check.md`. Step 6 binding per architect Required-of-the-fixture-authoring framing.",
  },
};

export const meta = fixture.meta;
