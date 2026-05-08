/**
 * Phase 3 fixture — Error surface: arc_manifest_version_mismatch.
 *
 * Per Phase 3 entry packet §3.5 + architect Q-3-E ratification 2026-05-08 (step-N-bind):
 * Step 8 (session/error-surface remainders + typed-error-hierarchy completion) authoring
 * fills full body. Stub at Pass 2a.
 *
 * Status: Draft (stub). Step 8 binding.
 *
 * Exercises: a session where the session's ARC manifest version diverges from the
 * conversion's ARC manifest version. Expected: arc_manifest_version_mismatch thrown
 * per API §2.1.2.
 */

const PREFIX = "http://example.org/test/error_arc_manifest_version_mismatch/";

/** @type {object} */
export const fixture = {
  input: {
    ontologyIRI: "http://example.org/test/error_arc_manifest_version_mismatch",
    prefixes: { ex: PREFIX },
    tbox: [],
    abox: [],
    rbox: [],
  },

  // Stub: Step 8 authoring fills session ARC version + conversion ARC version that diverge
  sessionConfig: {
    arcManifestVersion: "v3.3",
  },

  conversionConfig: {
    arcManifestVersion: "v3.4",
  },

  expectedOutcome: {
    summary:
      "Stub for Step 8 authoring. Stub-level contract: session ARC manifest version diverges " +
      "from conversion ARC manifest version; arc_manifest_version_mismatch thrown per API §2.1.2.",
    fixtureType: "session-error-surface",
    canaryRole: "arc-manifest-version-mismatch-detection",
    stubStatus: "step-8-authoring-pending",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "version-mismatch detection failure: implementation silently accepts divergent versions; " +
    "implementation throws but with wrong error class; implementation fails to populate version " +
    "info in the error.",

  "expected_v0.1_verdict": {
    ringStatus: "ring3-stub-pending-step-8",
    phaseAuthored: 3,
    phaseActivated: 3,
    expectedThrows: "arc_manifest_version_mismatch",
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
    relatedSpecSections: ["API §2.1.2 (ARC manifest version mismatch detection)"],
    relatedFixtures: ["error_structural_annotation_mismatch (sibling: structural annotation mismatch)"],
    architectAuthorization: "Phase 3 entry packet §3.5 ratified 2026-05-08; step-N-bind per Q-3-E split.",
  },
};

export const meta = fixture.meta;
