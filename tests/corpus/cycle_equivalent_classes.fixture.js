/**
 * Phase 3 fixture — Cycle detection: EquivalentClasses cycle.
 * **RE-BOUND to Phase 4 per Q-4-B architect ruling 2026-05-10** (corpus-before-code).
 *
 * Per Phase 3 entry packet §3.5 + architect Q-3-E ratification 2026-05-08
 * (step-N-bind): Step 5 (cycle detection per spec §5.4 + ADR-013) authoring
 * cycle fills the full fixture body.
 *
 * Status: Draft (stub) at Phase 3 — **RE-BOUND corpus-before-code at Phase 4
 * entry-cycle 2026-05-10 per Q-3-Step5-B forward-track + Q-4-B ratification.**
 * ADR-013 ratification 2026-05-09 covers 6 cycle-prone predicate classes;
 * Step 5 minimum implements Class 1 (TransitiveObjectProperty) only. This
 * fixture's cycle is Class 3 (recursive SubClassOf chain via mutual
 * EquivalentClasses) — implementation forward-tracked beyond Step 5 minimum;
 * Phase 4 BFO ARC content surfaces the Class-3 cycle-prone-predicate forcing
 * case at lift time (BFO transitive predicates + EquivalentClasses chains
 * within the loaded ARC module's import closure).
 *
 * ════════════════════════════════════════════════════════════════════════════
 * AMENDMENT AUDIT TRAIL — Phase 4 re-binding, 2026-05-10
 * ════════════════════════════════════════════════════════════════════════════
 *
 * (a) The amendment. Phase + phaseAuthored + phaseActivated + activationTiming
 *     fields amended for Phase 4 re-binding. `phase: 3 → 4`; `phaseAuthored: 3
 *     (carries the Phase 3 origin) + phaseActivated: 4` (Phase 4 boundary
 *     surfaces the Class 3 forcing case); `activationTiming: 'step-N-bind' →
 *     'corpus-before-code'` per Q-4-B architectural-commitment-tier
 *     classification.
 *
 * (b) The substantive ruling. Per Q-4-B (architect ruling 2026-05-10) +
 *     Q-3-Step5-B forward-track 2026-05-09: Class 3 cycle-prone-predicate
 *     implementation is forward-tracked beyond Step 5 minimum to Phase 4 ARC-
 *     content surfacing per ADR-013 §implementation-status's "Phase 4+ ARC
 *     content may extend with implementation evidence per spec §0.2.3"
 *     framing. Phase 4's BFO ARC content surfaces the EquivalentClasses-cycle
 *     shape at lift time (per the cycle re-binding identifying BFO ARC's
 *     mutually-equivalent class chains as the forcing demand surface).
 *
 * (c) Why corpus-before-code at Phase 4. Per Q-4-B (architect ruling
 *     2026-05-10): "BFO No-Collapse adversarial canaries exercise the
 *     No-Collapse Guarantee against ARC content (load-bearing for Phase 4's
 *     substantive scope)... Cycle re-binding exercises ADR-013 visited-
 *     ancestor pattern against BFO transitive predicates." The fixture
 *     architecturally-commits the Phase 4 implementation to handle Class 3
 *     correctly; this places it in the corpus-before-code tier.
 *
 * (d) Audit-trail unity. The amendment lands in the same Pass 2a corrective
 *     commit as the 4 NEW Phase 4 corpus-before-code fixtures
 *     (nc_bfo_continuant_occurrent + canary_connected_with_overlap +
 *     canary_bfo_disjointness_silent_pass + p4_bfo_clif_layer_b) per
 *     audit-trail-unity-per-surface ruling. Cross-references: phase-4-entry.md
 *     §3.2 (corpus-before-code list); §11 Q-4-B verbatim ruling text;
 *     manifest.json mirror entry.
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Exercises: Class hierarchy with EquivalentClasses cycle (A ≡ B, B ≡ C,
 * C ≡ A). The lifter emits 6 mutual unary implications; SLD chains them
 * forming a cycle through the predicate-call graph (NOT through transitive
 * closure of a single predicate). ADR-013 §pattern's visited-ancestor wrap
 * targets transitive shape `p(X,Z) :- p(X,Y), p(Y,Z)`; the mutual-implication
 * cycle requires graph-based predicate-call analysis (Class 3) which Step 5
 * minimum does not implement.
 *
 * Step 5 minimum behavior on this fixture (until Class 3 ships): Tau Prolog's
 * SLD on the mutual-implication cycle would loop until the per-query step
 * cap; current evaluate() maps step-cap exhaustion to 'undetermined' /
 * 'open_world_undetermined' (NOT cycle_detected), which is honest about
 * Step 5 minimum coverage but not the architecturally-correct contract.
 *
 * Expected v0.1 verdict at Class 3 implementation completion (forward-tracked):
 * 'undetermined' / 'cycle_detected' per ADR-013 §detection-emission-contract.
 * Discrimination from cycle_recursive_predicate sibling: this fixture's
 * cycle is in CLASS hierarchy via EquivalentClasses (Class 3); the sibling's
 * cycle is in PREDICATE definition via TransitiveObjectProperty (Class 1,
 * Step 5 minimum coverage).
 */

const PREFIX = "http://example.org/test/cycle_equivalent_classes/";

/** @type {object} */
export const fixture = {
  // Stub input — Step 5 authoring fills the EquivalentClasses cycle shape
  input: {
    ontologyIRI: "http://example.org/test/cycle_equivalent_classes",
    prefixes: { ex: PREFIX },
    tbox: [
      { "@type": "EquivalentClasses", classes: [{ "@type": "Class", iri: PREFIX + "A" }, { "@type": "Class", iri: PREFIX + "B" }] },
      { "@type": "EquivalentClasses", classes: [{ "@type": "Class", iri: PREFIX + "B" }, { "@type": "Class", iri: PREFIX + "C" }] },
      { "@type": "EquivalentClasses", classes: [{ "@type": "Class", iri: PREFIX + "C" }, { "@type": "Class", iri: PREFIX + "A" }] },
    ],
    abox: [],
    rbox: [],
  },

  expectedOutcome: {
    summary:
      "Class 3 cycle-prone-predicate fixture (recursive SubClassOf chain via mutual EquivalentClasses). " +
      "Step 5 minimum coverage is Class 1 only per Q-3-Step5-B Strategy (A) ratification 2026-05-09; " +
      "Class 3 implementation forward-tracked beyond Step 5 minimum. Fixture stays Draft until Class 3 " +
      "implementation lands; activation-ringStatus is 'ring3-class-3-forward-tracked'.",
    fixtureType: "consistency-check-cycle-detection",
    canaryRole: "cycle-detection-class-3-mutual-equivalentclasses-cycle",
    stubStatus: "class-3-forward-tracked-beyond-step-5-minimum",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "cycle detection failure: implementation enters infinite loop on EquivalentClasses cycle; " +
    "implementation terminates via depth bound but mis-reports as closure_truncated rather than " +
    "cycle_detected; implementation reports cycle_detected but throws instead of returning the " +
    "reason code (when consumer config requested non-throwing behavior).",

  "expected_v0.1_verdict": {
    ringStatus: "ring3-class-3-rebound-to-phase-4-corpus-before-code",
    phaseAuthored: 3,
    phaseActivated: 4,
    expectedReason: "cycle_detected",
    forwardTrackedAt:
      "step-5-close-2026-05-09; Class 3 implementation requires graph-based predicate-call analysis beyond ADR-013 §pattern's transitive-shape detection; **re-bound to Phase 4 corpus-before-code per Q-4-B architect ruling 2026-05-10** because BFO ARC content surfaces the EquivalentClasses-cycle forcing case at lift time",
  },

  "expected_v0.2_elk_verdict": null,

  meta: {
    verifiedStatus: "Draft",
    phase: 4,
    activationTiming: "corpus-before-code",
    stepBinding: null,
    rebindingHistory: [
      {
        phase: 3,
        activationTiming: "step-N-bind",
        stepBinding: 5,
        rationale: "Phase 3 Step 5 binding per Q-3-E split; stub fixture; Class 3 forward-tracked beyond Step 5 minimum per Q-3-Step5-B 2026-05-09",
      },
      {
        phase: 4,
        activationTiming: "corpus-before-code",
        stepBinding: null,
        rationale: "Re-bound to Phase 4 corpus-before-code per Q-4-B architect ruling 2026-05-10; BFO ARC content surfaces Class 3 forcing case at lift time; Class 3 implementation expected at Phase 4 step-ledger Step 7 (lifter ObjectPropertyChain support per Q-Step6-3 forward-track) OR Step 6 (regularityCheck activation per spec §6.2.1)",
      },
    ],
    authoredAt: "2026-05-08",
    rebindingAt: "2026-05-10",
    authoredBy: "SME persona, Phase 3 entry packet final ratification cycle Pass 2a authoring (stub); re-bound at Phase 4 entry-cycle Pass 2a authoring 2026-05-10",
    relatedSpecSections: [
      "spec §5.4 (resolution depth bound + cycle detection)",
      "ADR-013 (visited-ancestor cycle-guard pattern; six cycle-prone predicate classes; Class 3 = mutual EquivalentClasses cycle)",
    ],
    relatedFixtures: [
      "cycle_recursive_predicate (sibling: predicate-definition cycle, Class 1)",
    ],
    architectAuthorization:
      "Phase 3 entry packet §3.5 ratified 2026-05-08; step-N-bind per Q-3-E split; Step 5 binding; stub fixture per architect's audit-trail-unity preference for Pass 2a. **Phase 4 re-binding ratified per Q-4-B architect ruling 2026-05-10**; corpus-before-code tier; Phase 4 Pass 2a authoring.",
  },
};

export const meta = fixture.meta;
