/**
 * Phase 4 fixture — regularityCheck affirmative skip-warning surface
 * (Sub-option α minimum-viable certification — chain over non-transitive roles).
 *
 * ── Corrective sub-amendment (Q-4-Step6-A Pass 2b 2026-05-15 — within open Pass 2b
 * window post-brief-confirmation; Cat 8 production catch surfaced at Developer
 * Pass 2b verification ritual) ──
 *
 * **Surface:** Initial SME path-fence-author 2026-05-14 used a malformed RBox shape
 * — `SubObjectPropertyOf` axiom with `subPropertyChain: { "@type": "ObjectPropertyChain",
 * properties: [...] }` field — which is OWL 2 DL grammar BUT does NOT match the
 * project's canonical RBox axiom interface declarations per `src/kernel/owl-types.ts`.
 *
 * **Canonical sources:**
 *   - `src/kernel/owl-types.ts:210-214` declares `SubObjectPropertyOfAxiom` with
 *     `subProperty: string` (single IRI; no chain field)
 *   - `src/kernel/owl-types.ts:227-231` declares `ObjectPropertyChainAxiom` as a
 *     TOP-LEVEL `RBoxAxiom` union member with `chain: string[]` + `superProperty: string`
 *
 * **Failure mode caught:** Lifter encountered the malformed shape, found `subProperty`
 * undefined, called `canonicalizeIRI(undefined, prefixes)` → threw `IRIFormatError:
 * "IRI must be a non-empty string"`. Both Step 6 fixtures threw at lift time;
 * `determinism-100-run.test.js` failed (lifts every corpus fixture 100x); Step 6
 * activation tests blocked.
 *
 * **Corrective amendment shape:** Replace the malformed nested SubObjectPropertyOf-
 * with-subPropertyChain shape with the canonical top-level `ObjectPropertyChain`
 * axiom:
 *
 * ```js
 * // BEFORE (malformed):
 * { "@type": "SubObjectPropertyOf",
 *   subPropertyChain: { "@type": "ObjectPropertyChain", properties: [...] },
 *   superProperty: ... }
 *
 * // AFTER (canonical per src/kernel/owl-types.ts:227-231):
 * { "@type": "ObjectPropertyChain", chain: [...], superProperty: ... }
 * ```
 *
 * **Disposition:** SME-domain mechanical fix per binding-immediately discipline + the
 * Q-4-Step6-A Pass 2b Banking 1 (Catch 5 disambiguation reuse — disciplines ratified
 * at prior cycles operate immediately on subsequent findings without re-routing).
 * Verification ritual production catch SIXTH instance (Catch 6); SME pre-routing
 * ritual production miss SECOND instance (Miss 2 — Cat 5/6/8 type-field-structure-
 * consistency boundary not in current ritual category coverage; mirrors Q-4-Step5-A
 * Miss 1 reference-existence-vs-reference-consistency boundary). Cat 10 type-field-
 * structure consistency candidacy forward-tracks to Phase 4 exit retro alongside
 * Cat 9 candidacy.
 *
 * Per Phase 4 entry packet §3.3 step-N-bind + Q-4-Step6-A architect ruling
 * 2026-05-14/15 (Phase 4 mid-phase architectural-gap micro-cycle 3/3 —
 * HITS Q-4-A ~3 PROJECTION EXACT MATCH):
 *
 *   "regularity_check_clears_warning.fixture.js — synthetic chain over
 *    non-transitive roles; expected projector output omits
 *    regularity_scope_warning from RecoveryPayload"
 *
 * Status: Draft (NEW Phase 4 authoring per Q-4-Step6-A.1.1); Step 6 binding;
 * promotes to Verified when Step 6 ships the regularityCheck function +
 * projector amendment per Sub-option α minimum-viable certification logic.
 *
 * ── Discrimination from regularity_check_keeps_warning (sibling) ──
 *
 * THIS fixture exercises the AFFIRMATIVE skip-warning side per Q-4-Step6-A.1.1
 * Sub-option α certification: chain regularity-certified when no role in
 * chain is owl:TransitiveProperty. The projector consults regularityCheck
 * + omits regularity_scope_warning from emitted RecoveryPayload.
 *
 * `regularity_check_keeps_warning.fixture.js` (Phase 4 step-N-bind sibling)
 * exercises the CONSERVATIVE-DEFAULT keeps-warning side: chain containing
 * at least one owl:TransitiveProperty role; projector defaults to emitting
 * regularity_scope_warning (Phase 2 baseline preserved).
 *
 * The two fixtures together exercise both sides of Sub-option α's binary
 * outcome ('regularity-certified' OR 'cannot-certify'); coverage discriminates
 * against Step 6 implementation failures that emit only one side.
 *
 * ── Sub-option α certification logic per architect Q-4-Step6-A.1.1 ──
 *
 * ```typescript
 * function regularityCheck(chain: PropertyChain, arcContent: ARCContent): 'regularity-certified' | 'cannot-certify' {
 *   for (const roleIRI of chain.roles) {
 *     const arcEntry = arcContent.lookup(roleIRI);
 *     if (arcEntry?.owlCharacteristics?.includes('owl:TransitiveProperty')) {
 *       return 'cannot-certify';
 *     }
 *   }
 *   return 'regularity-certified';
 * }
 * ```
 *
 * For THIS fixture: chain roles are bearer_of (BFO_0000196) + has_participant
 * (BFO_0000057). Per `arc/core/bfo-2020.json`: both have `owlCharacteristics: "—"`
 * (not owl:TransitiveProperty). Certification logic returns 'regularity-certified';
 * projector omits regularity_scope_warning.
 *
 * ── Spec-formally-correct anchor per Horrocks, Kutz, Sattler (2007) ──
 *
 * Transitivity is THE canonical regularity-restricting characteristic in SROIQ
 * per Horrocks, Kutz, and Sattler (2007). A chain with no transitive role is
 * provably regular under SROIQ's regularity restriction (the regularity check
 * trivially holds when transitivity is not in play). Spec §6.1.2 cites this
 * reference directly: "SROIQ admits chains under a regularity constraint
 * (Horrocks, Kutz, and Sattler, 2007) precisely because unrestricted chain
 * composition leads to undecidability."
 *
 * ── Step 6 / Step 8 boundary per Q-4-Step6-A.4 ──
 *
 * Step 6 ships warning emission control only:
 *   - 'regularity-certified' → omit regularity_scope_warning (THIS fixture's case)
 *   - 'cannot-certify' → emit regularity_scope_warning (sibling's case)
 *
 * Step 8 ships LossSignature emission + strategy router fall-through to
 * Annotated Approximation; structurally distinct from Step 6's warning
 * emission control. THIS fixture does NOT exercise Step 8's surface;
 * fixture's input + ARC content support a regularity-certified chain
 * (no fall-through trigger).
 *
 * ── What this fixture catches ────────────────────────────────────────────
 *
 * Step 6 implementation failure modes for the affirmative skip-warning side:
 *   - Projector ignores regularityCheck result + emits warning unconditionally
 *     (Phase 2 baseline preserved but Step 6 strengthening dropped — corpus
 *     demand fails)
 *   - regularityCheck returns 'cannot-certify' for chain over non-transitive
 *     roles (Sub-option α logic inverted)
 *   - regularityCheck consults wrong owlCharacteristics field semantics
 *     (e.g., parses string vs array; misses 'owl:TransitiveProperty' substring)
 *   - Projector clears warning but corrupts other RecoveryPayload fields
 */

const PREFIX = "http://example.org/test/regularity_check_clears_warning/";
const BFO_BEARER_OF = "http://purl.obolibrary.org/obo/BFO_0000196"; // bearer_of — NOT owl:TransitiveProperty per arc/core/bfo-2020.json
const BFO_HAS_PARTICIPANT = "http://purl.obolibrary.org/obo/BFO_0000057"; // has_participant — NOT owl:TransitiveProperty
const SYNTHETIC_TARGET_RELATION = PREFIX + "bearerHasParticipant"; // synthetic super-property the chain composes into
const INDIVIDUAL_A = PREFIX + "individual_a";
const INDIVIDUAL_B = PREFIX + "individual_b";
const INDIVIDUAL_C = PREFIX + "individual_c";

/** @type {object} */
export const fixture = {
  /**
   * Input ontology with explicit ObjectPropertyChain over BFO non-transitive
   * roles (bearer_of ∘ has_participant). The chain's role composition is
   * the projector's chain emission surface; regularityCheck consults loaded
   * ARC content's owlCharacteristics for each role; Sub-option α returns
   * 'regularity-certified' because neither role is owl:TransitiveProperty.
   */
  input: {
    ontologyIRI: "http://example.org/test/regularity_check_clears_warning",
    prefixes: {
      bfo: "http://purl.obolibrary.org/obo/",
      ex: PREFIX,
    },
    tbox: [],
    abox: [
      {
        "@type": "ObjectPropertyAssertion",
        property: BFO_BEARER_OF,
        source: INDIVIDUAL_A,
        target: INDIVIDUAL_B,
      },
      {
        "@type": "ObjectPropertyAssertion",
        property: BFO_HAS_PARTICIPANT,
        source: INDIVIDUAL_B,
        target: INDIVIDUAL_C,
      },
    ],
    rbox: [
      {
        "@type": "ObjectPropertyChain",
        chain: [BFO_BEARER_OF, BFO_HAS_PARTICIPANT],
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
   *   - regularity_scope_warning NOT present (omitted because regularity-certified)
   *
   * The fixture asserts RecoveryPayload-level pattern matching on the projector's
   * output (distinct from lift-correctness fixtures which assert lifted-FOL-state).
   */
  expectedOutcome: {
    summary:
      "Phase 4 Step 6 projector with BFO 2020 ARC loaded + Sub-option α regularityCheck applied to a chain over non-transitive roles (bearer_of ∘ has_participant) produces RecoveryPayload containing the chain emission per ADR-007 §11 BUT WITHOUT regularity_scope_warning (omitted because regularityCheck returns 'regularity-certified'; non-breaking strengthening per ADR-011 + Q-4-Step6-A.4 step boundary preservation).",
    fixtureType: "projector-emission-control-regularity-check",
    expectedRecoveryPayloadShape: {
      chainEmission: "present",
      regularityScopeWarning: "absent",
      regularityCheckResult: "regularity-certified",
    },
    canaryRole: "regularity-check-affirmative-skip-warning-unit-level",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "Phase 4 Step 6 regularityCheck affirmative skip-warning failure modes: (1) projector ignores regularityCheck result + emits regularity_scope_warning unconditionally (Phase 2 baseline preserved but Step 6 strengthening dropped — corpus demand fails); (2) regularityCheck returns 'cannot-certify' for chain over non-transitive roles (Sub-option α logic inverted); (3) regularityCheck consults wrong owlCharacteristics field semantics (e.g., parses string vs array; misses 'owl:TransitiveProperty' substring); (4) projector clears warning but corrupts other RecoveryPayload fields.",

  "expected_v0.1_verdict": {
    ringStatus: "ring2-projector-emission-control-regularity-check-affirmative",
    phaseAuthored: 4,
    phaseActivated: 4,
    expectedRecoveryPayloadShape: {
      chainEmission: "present",
      regularityScopeWarning: "absent",
      regularityCheckResult: "regularity-certified",
    },
    corpusActivationTiming: "step-N-bind",
    stepBinding: 6,
    discriminatesAgainst:
      "any Phase 4 Step 6 projector that emits regularity_scope_warning unconditionally (Sub-option α strengthening dropped); any projector that inverts the Sub-option α certification logic (clears warnings for transitive chains; keeps for non-transitive); any projector that consults wrong owlCharacteristics field semantics; any projector that corrupts other RecoveryPayload fields while clearing the warning.",
  },

  "expected_v0.2_elk_verdict": {
    notes:
      "v0.2 ELK closure extends Sub-option α minimum-viable certification to full SROIQ Horrocks regularity check (per v0.2-09 forward-track). At v0.2, this fixture's chain may still certify (bearer_of ∘ has_participant remains regularity-compatible under full SROIQ); the affirmative-skip-warning outcome holds across v0.1 + v0.2; the certification logic that produces it extends.",
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
      "spec §6.2.1 (chain projection + regularity_scope_warning emission + Step 6 strengthening surface)",
      "spec §3.6.2 (arcModules parameter on LifterConfiguration; threading through projector's FolToOwlConfig per Q-4-Step6-A Developer-side scope)",
    ],
    relatedADRs: [
      "ADR-007 §1 (DECISIONS.md ADR-007 — projector emits classical FOL; chain emission canonical shape)",
      "ADR-007 §11 (FOL→Prolog per-variant translation table; chain emission per ADR-007 §11 ratified at Phase 3 Step 3 + Step 4)",
    ],
    relatedBankedPrinciples: [
      "Q-4-Step6-A.1 + .1.1 banking (minimum-viable certification logic operates on transitivity per Horrocks et al. 2007)",
      "Q-4-Step6-A.4 step boundary banking (Step 6 = warning emission control; Step 8 = LossSignature emission + strategy router; clean separation)",
      "Q-4-Step6-A Banking 6 (non-breaking strengthening of behavioral contracts honors signal-preserving omission discipline) — architect verbatim cites 'ADR-011 evolution discipline'; Q-4-Step6-A verification ritual Catch 5 (Cat 2+7+8 cross-category 2026-05-14/15) confirms DECISIONS.md ADR-011 is 'Audit-artifact @id content-addressing — LossSignature + RecoveryPayload' (NOT behavioral-contract evolution discipline); spec §10 ADR-011 is 'SLD termination via cycle-detection guards' (also doesn't match); the 'behavioral-contract evolution discipline' is verbal-banked, NOT a numbered ADR in either registry; SME-domain mechanical fix per Q-4-Step5-A Pass 2b Banking 3 disambiguation discipline; reconciliation deferred per parallel-registry-reconciliation Phase 4 exit retro candidate",
      "Q-Step6-1 Phase 2 baseline preservation discipline (verbal-banked at Phase 2 cycle)",
    ],
    relatedFixtures: [
      "regularity_check_keeps_warning (Phase 4 step-N-bind sibling: conservative-default keeps-warning side; chain containing owl:TransitiveProperty role; together with this fixture exercises both sides of Sub-option α binary outcome)",
      "bfo_disjointness_map_axiom_emission (Phase 4 step-N-bind sibling: Q-4-Step4-A precedent — unit-level emission verification pattern)",
    ],
    architectAuthorization:
      "Q-4-Step6-A architect ruling 2026-05-14/15 + Q-4-Step6-A.1 Reading 3 hybrid + Q-4-Step6-A.1.1 Sub-option α + Q-4-Step6-A.2 SME dispatch + Q-4-Step6-A.4 Step 6 / Step 8 boundary preservation per `project/reviews/phase-4-step6-regularity-check.md`. Step 6 binding per architect Required-of-the-fixture-authoring framing.",
  },
};

export const meta = fixture.meta;
