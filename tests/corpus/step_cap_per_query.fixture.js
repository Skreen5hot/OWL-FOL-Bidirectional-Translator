/**
 * Phase 3 fixture — Step cap: per-query 10K cap exhausted.
 *
 * Per Phase 3 entry packet §3.5 + architect Q-3-E ratification 2026-05-08 (step-N-bind):
 * Step 1 (evaluate() skeleton + per-query 10K step cap per API §7.2) authoring fills full
 * body. Stub at Pass 2a.
 *
 * Status: Draft (stub). Step 1 binding.
 *
 * Exercises: a query whose SLD resolution exhausts the 10K default per-query step cap
 * before terminating. Expected: step_cap_exceeded reason code returned (or thrown per
 * consumer config).
 */

const PREFIX = "http://example.org/test/step_cap_per_query/";

/** @type {object} */
export const fixture = {
  input: {
    ontologyIRI: "http://example.org/test/step_cap_per_query",
    prefixes: { ex: PREFIX },
    tbox: [],
    abox: [],
    rbox: [],
  },

  // Stub query — Step 1 authoring fills the deeply-recursive query that exhausts 10K cap
  query: {
    "@type": "fol:Atom",
    predicate: PREFIX + "deeplyChained",
    arguments: [{ "@type": "fol:Constant", iri: PREFIX + "alice" }],
  },

  expectedOutcome: {
    summary:
      "Stub for Step 1 (per-query 10K step cap) authoring. Step 1 fills the deeply-recursive " +
      "query shape that exhausts the cap. Stub-level contract: query exhausts the 10K default " +
      "per-query cap; step_cap_exceeded reason code returned.",
    fixtureType: "evaluate-step-cap-exhausted",
    canaryRole: "step-cap-per-query-exhaustion",
    stubStatus: "step-1-authoring-pending",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "step cap failure: implementation never terminates (cap not enforced); implementation " +
    "terminates but reports wrong reason code; implementation throws when consumer config " +
    "requested non-throwing behavior (or vice versa).",

  "expected_v0.1_verdict": {
    ringStatus: "ring3-stub-pending-step-1",
    phaseAuthored: 3,
    phaseActivated: 3,
    expectedReason: "step_cap_exceeded",
    stubFilledAt: "step-1-implementation-cycle",
  },

  "expected_v0.2_elk_verdict": null,

  meta: {
    verifiedStatus: "Verified",
    phase: 3,
    activationTiming: "step-N-bind",
    stepBinding: 1,
    authoredAt: "2026-05-08",
    authoredBy: "SME persona, Pass 2a stub authoring",
    relatedSpecSections: ["API §7.2 (per-query step cap)", "API §7.4 (configurable throw-on-cap)"],
    relatedFixtures: ["step_cap_aggregate (sibling: session-aggregate cap + SessionStepCapExceededError)"],
    architectAuthorization: "Phase 3 entry packet §3.5 ratified 2026-05-08; step-N-bind per Q-3-E split.",
  },
};

export const meta = fixture.meta;
