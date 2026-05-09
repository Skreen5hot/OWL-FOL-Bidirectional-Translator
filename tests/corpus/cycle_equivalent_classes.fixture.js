/**
 * Phase 3 fixture — Cycle detection: EquivalentClasses cycle.
 *
 * Per Phase 3 entry packet §3.5 + architect Q-3-E ratification 2026-05-08
 * (step-N-bind): Step 5 (cycle detection per spec §5.4 + ADR-013) authoring
 * cycle fills the full fixture body.
 *
 * Status: Draft (stub) — STAYS Draft after Step 5 close per Q-3-Step5-B
 * Strategy (A) Visited-ancestor encoding scope. ADR-013 ratification 2026-05-09
 * covers 6 cycle-prone predicate classes; Step 5 minimum implements Class 1
 * (TransitiveObjectProperty) only. This fixture's cycle is Class 3
 * (recursive SubClassOf chain via mutual EquivalentClasses) — implementation
 * forward-tracked beyond Step 5 minimum to a subsequent architect-routable
 * cycle (Phase 3 follow-on Step OR Phase 4+ ARC-content surfacing per
 * ADR-013 §implementation-status's "Phase 4+ ARC content may extend with
 * implementation evidence per spec §0.2.3" framing).
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
    ringStatus: "ring3-class-3-forward-tracked",
    phaseAuthored: 3,
    phaseActivated: 3,
    expectedReason: "cycle_detected",
    forwardTrackedAt:
      "step-5-close-2026-05-09; Class 3 implementation requires graph-based predicate-call analysis beyond ADR-013 §pattern's transitive-shape detection; routes as architect-mediated cycle when surfaced",
  },

  "expected_v0.2_elk_verdict": null,

  meta: {
    verifiedStatus: "Draft",
    phase: 3,
    activationTiming: "step-N-bind",
    stepBinding: 5,
    authoredAt: "2026-05-08",
    authoredBy: "SME persona, Phase 3 entry packet final ratification cycle Pass 2a authoring (stub)",
    relatedSpecSections: [
      "spec §5.4 (resolution depth bound + cycle detection)",
      "ADR-011 (cycle-guard policy: visited-ancestor list for v0.1; SLG tabling planned for v0.2)",
    ],
    relatedFixtures: [
      "cycle_recursive_predicate (sibling: predicate-definition cycle)",
    ],
    architectAuthorization:
      "Phase 3 entry packet §3.5 ratified 2026-05-08; step-N-bind per Q-3-E split; Step 5 binding; stub fixture per architect's audit-trail-unity preference for Pass 2a.",
  },
};

export const meta = fixture.meta;
