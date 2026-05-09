/**
 * Phase 3 fixture — Step cap: session-aggregate cap + SessionStepCapExceededError.
 *
 * Per Phase 3 entry packet §3.5 + architect Q-3-E ratification 2026-05-08 (step-N-bind):
 * Step 8 (session/error-surface remainders + typed-error-hierarchy completion) authoring
 * fills full body. Stub at Pass 2a.
 *
 * Status: Draft (stub). Step 8 binding.
 *
 * Exercises: a session that runs multiple queries cumulatively exhausting the
 * session-aggregate step cap (per API §2.1 + §7.4). Expected: SessionStepCapExceededError
 * thrown when maxAggregateSteps is exceeded across queries within the session.
 */

const PREFIX = "http://example.org/test/step_cap_aggregate/";

/** @type {object} */
export const fixture = {
  input: {
    ontologyIRI: "http://example.org/test/step_cap_aggregate",
    prefixes: { ex: PREFIX },
    tbox: [],
    abox: [],
    rbox: [],
  },

  // Stub: session config + multi-query sequence — Step 8 authoring fills the protocol
  sessionConfig: {
    maxAggregateSteps: 5000,
  },

  querySequence: [
    // Stub: Step 8 authoring fills the queries cumulatively exhausting maxAggregateSteps
  ],

  expectedOutcome: {
    summary:
      "Stub for Step 8 (session-aggregate step cap + SessionStepCapExceededError) authoring. " +
      "Step 8 fills the multi-query protocol that cumulatively exhausts the cap. Stub-level " +
      "contract: at the query that crosses the maxAggregateSteps threshold, SessionStepCapExceededError " +
      "thrown per API §2.1.",
    fixtureType: "evaluate-session-aggregate-cap",
    canaryRole: "session-step-cap-exhaustion",
    stubStatus: "step-8-authoring-pending",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "session-aggregate cap failure: implementation never throws SessionStepCapExceededError; " +
    "implementation throws on the wrong query (cumulative count miscalculated); implementation " +
    "throws but with wrong error class.",

  "expected_v0.1_verdict": {
    ringStatus: "ring3-stub-pending-step-8",
    phaseAuthored: 3,
    phaseActivated: 3,
    expectedThrows: "aggregate_step_cap_exceeded",
    stubFilledAt: "step-8-implementation-cycle",
  },

  "expected_v0.2_elk_verdict": null,

  meta: {
    verifiedStatus: "Draft",
    phase: 3,
    activationTiming: "step-N-bind",
    stepBinding: 8,
    authoredAt: "2026-05-08",
    authoredBy: "SME persona, Pass 2a stub authoring",
    relatedSpecSections: ["API §2.1 (session-aggregate cap)", "API §7.4 (cap configuration)"],
    relatedFixtures: ["step_cap_per_query (sibling: per-query cap + step_cap_exceeded reason code)"],
    architectAuthorization: "Phase 3 entry packet §3.5 ratified 2026-05-08; step-N-bind per Q-3-E split.",
  },
};

export const meta = fixture.meta;
