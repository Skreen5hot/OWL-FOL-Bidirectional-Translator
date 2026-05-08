/**
 * Phase 3 fixture — Cycle detection: EquivalentClasses cycle.
 *
 * Per Phase 3 entry packet §3.5 + architect Q-3-E ratification 2026-05-08 (step-N-bind):
 * Step 5 (cycle detection per spec §5.4 + ADR-011) authoring cycle fills the
 * full fixture body. This stub lands at Pass 2a per architect's audit-trail-unity
 * preference; full content lands at Step 5 implementation alongside the cycle-detection
 * code path that consumes the fixture.
 *
 * Status: Draft (stub). Step 5 binding.
 *
 * Exercises: Class hierarchy with EquivalentClasses cycle (e.g., A ≡ B, B ≡ C,
 * C ≡ A). Some valid OWL ontologies declare such cycles; the lifted FOL has
 * mutual-implication chains that loop without cycle protection. ADR-011's
 * visited-ancestor list catches the loop and emits cycle_detected reason code.
 *
 * Expected v0.1 verdict (filled at Step 5): cycle_detected reason code returned
 * (or thrown per consumer config); no infinite loop; resolution depth bound (spec
 * §5.4) honored. Discrimination from cycle_recursive_predicate sibling: this
 * fixture's cycle is in CLASS hierarchy via EquivalentClasses; the sibling's
 * cycle is in PREDICATE definition via recursive rules.
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
      "Stub for Step 5 (cycle detection) authoring. Full expected behavior lands at Step 5 " +
      "implementation. Stub-level contract: query against the lifted FOL state involving any of " +
      "{A, B, C} resolves without infinite loop; cycle_detected reason code emitted (or thrown).",
    fixtureType: "consistency-check-cycle-detection",
    canaryRole: "cycle-detection-class-hierarchy-cycle",
    stubStatus: "step-5-authoring-pending",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "cycle detection failure: implementation enters infinite loop on EquivalentClasses cycle; " +
    "implementation terminates via depth bound but mis-reports as closure_truncated rather than " +
    "cycle_detected; implementation reports cycle_detected but throws instead of returning the " +
    "reason code (when consumer config requested non-throwing behavior).",

  "expected_v0.1_verdict": {
    ringStatus: "ring3-stub-pending-step-5",
    phaseAuthored: 3,
    phaseActivated: 3,
    expectedReason: "cycle_detected",
    stubFilledAt: "step-5-implementation-cycle",
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
