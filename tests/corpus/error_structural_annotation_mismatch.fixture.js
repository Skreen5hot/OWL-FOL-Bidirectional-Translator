/**
 * Phase 3 fixture — Error surface: structural_annotation_mismatch.
 *
 * Per Phase 3 entry packet §3.5 + architect Q-3-E ratification 2026-05-08 (step-N-bind):
 * Step 8 (session/error-surface remainders + typed-error-hierarchy completion) authoring
 * fills full body. Stub at Pass 2a.
 *
 * Status: Draft (stub). Step 8 binding.
 *
 * Exercises: a session where caller-declared structural annotations diverge from the
 * projection's recorded annotation declaration. Expected: structural_annotation_mismatch
 * thrown per API §2.1.1.
 */

const PREFIX = "http://example.org/test/error_structural_annotation_mismatch/";

/** @type {object} */
export const fixture = {
  // Stub: Step 8 authoring fills the input + caller-declared annotations + projection state
  input: {
    ontologyIRI: "http://example.org/test/error_structural_annotation_mismatch",
    prefixes: { ex: PREFIX },
    tbox: [],
    abox: [],
    rbox: [],
  },

  callerDeclaredAnnotations: {
    // Stub: Step 8 fills the caller-side annotation declaration that diverges from the projection's
  },

  expectedOutcome: {
    summary:
      "Stub for Step 8 (typed-error-hierarchy completion) authoring. Stub-level contract: " +
      "session detects caller-declared structural annotations diverging from the projection's " +
      "recorded annotation declaration; structural_annotation_mismatch thrown per API §2.1.1.",
    fixtureType: "session-error-surface",
    canaryRole: "structural-annotation-mismatch-detection",
    stubStatus: "step-8-authoring-pending",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "annotation-mismatch detection failure: implementation silently accepts the divergent " +
    "annotation; implementation throws but with wrong error class.",

  "expected_v0.1_verdict": {
    ringStatus: "ring3-stub-pending-step-8",
    phaseAuthored: 3,
    phaseActivated: 3,
    expectedThrows: "structural_annotation_mismatch",
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
    relatedSpecSections: ["API §2.1.1 (structural annotation declaration consistency)", "spec §5.9 (structural annotation contract)"],
    relatedFixtures: ["error_arc_manifest_version_mismatch (sibling: ARC version mismatch)"],
    architectAuthorization: "Phase 3 entry packet §3.5 ratified 2026-05-08; step-N-bind per Q-3-E split.",
  },
};

export const meta = fixture.meta;
