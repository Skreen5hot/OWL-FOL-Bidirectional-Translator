/**
 * Phase 3 fixture — Cycle detection: recursive predicate definition.
 *
 * Per Phase 3 entry packet §3.5 + architect Q-3-E ratification 2026-05-08 (step-N-bind):
 * Step 5 (cycle detection per spec §5.4 + ADR-011) authoring fills full body. Stub at Pass 2a.
 *
 * Status: Draft (stub). Step 5 binding.
 *
 * Exercises: Recursive predicate definition that would loop without cycle protection
 * (e.g., a transitive property defined via a chain rule that resolves into itself).
 * Discrimination from cycle_equivalent_classes sibling: this fixture's cycle is in
 * PREDICATE definition; the sibling's is in CLASS hierarchy. Both must be caught
 * by ADR-011's visited-ancestor list.
 */

const PREFIX = "http://example.org/test/cycle_recursive_predicate/";

/** @type {object} */
export const fixture = {
  // Stub input — Step 5 authoring fills the recursive-predicate shape
  input: {
    ontologyIRI: "http://example.org/test/cycle_recursive_predicate",
    prefixes: { ex: PREFIX },
    tbox: [],
    abox: [],
    rbox: [
      // Stub: TransitiveObjectProperty plus a self-referential chain that risks looping
      { "@type": "TransitiveObjectProperty", property: PREFIX + "ancestor" },
    ],
  },

  expectedOutcome: {
    summary:
      "Stub for Step 5 (cycle detection) authoring. Step 5 fills full input + expected behavior. " +
      "Stub-level contract: query involving the recursive predicate resolves without infinite loop; " +
      "cycle_detected emitted via the visited-ancestor mechanism per ADR-011.",
    fixtureType: "evaluate-cycle-detection",
    canaryRole: "cycle-detection-recursive-predicate",
    stubStatus: "step-5-authoring-pending",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "cycle detection failure on recursive predicate definitions: infinite loop in SLD resolution; " +
    "depth-bound termination misreported as closure_truncated rather than cycle_detected.",

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
    authoredBy: "SME persona, Pass 2a stub authoring",
    relatedSpecSections: ["spec §5.4", "ADR-011"],
    relatedFixtures: ["cycle_equivalent_classes (sibling: class-hierarchy cycle)"],
    architectAuthorization: "Phase 3 entry packet §3.5 ratified 2026-05-08; step-N-bind per Q-3-E split.",
  },
};

export const meta = fixture.meta;
