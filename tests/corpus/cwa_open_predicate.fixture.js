/**
 * Phase 3 fixture — Per-predicate CWA: open predicate produces 'undetermined' with naf_residue.
 *
 * Per Phase 3 entry packet §3.5 + architect Q-3-E ratification 2026-05-08 (step-N-bind):
 * Step 4 (closedPredicates + per-predicate CWA per spec §6.3.2 + API §6.3) authoring
 * fills full body. Stub at Pass 2a.
 *
 * Status: Draft (stub). Step 4 binding.
 *
 * Exercises: same query as cwa_closed_predicate sibling but WITHOUT closedPredicates.
 * Default OWA per spec §6.3 produces 'undetermined' with naf_residue reason. Discriminates
 * the OWA-default behavior from the CWA-closed-per-predicate behavior; the pair together
 * verify that closedPredicates is the ONLY trigger for CWA-derived 'false'.
 */

const PREFIX = "http://example.org/test/cwa_open_predicate/";

/** @type {object} */
export const fixture = {
  input: {
    ontologyIRI: "http://example.org/test/cwa_open_predicate",
    prefixes: { ex: PREFIX },
    tbox: [],
    abox: [
      { "@type": "ClassAssertion", class: { "@type": "Class", iri: PREFIX + "Person" }, individual: PREFIX + "alice" },
    ],
    rbox: [],
  },

  query: {
    "@type": "fol:Atom",
    predicate: PREFIX + "Knows",
    arguments: [
      { "@type": "fol:Constant", iri: PREFIX + "alice" },
      { "@type": "fol:Constant", iri: PREFIX + "bob" },
    ],
  },

  // No closedPredicates — default OWA applies
  closedPredicates: undefined,

  expectedOutcome: {
    summary:
      "Stub for Step 4 (closedPredicates + per-predicate CWA) authoring. Stub-level contract: " +
      "query Knows(alice, bob)? without closedPredicates produces 'undetermined' with naf_residue " +
      "reason (default OWA per spec §6.3 — no proof of Knows, no proof of negation, predicate not closed).",
    fixtureType: "evaluate-default-owa",
    canaryRole: "per-predicate-cwa-open-discriminator",
    stubStatus: "step-4-authoring-pending",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "OWA-default failure: implementation applies CWA globally and returns 'false' instead of " +
    "'undetermined' (the wrong silent-failure mode); implementation returns 'undetermined' but " +
    "with wrong reason code (e.g., closure_truncated instead of naf_residue).",

  "expected_v0.1_verdict": {
    ringStatus: "ring3-stub-pending-step-4",
    phaseAuthored: 3,
    phaseActivated: 3,
    expectedResult: "undetermined",
    expectedReason: "naf_residue",
    stubFilledAt: "step-4-implementation-cycle",
  },

  "expected_v0.2_elk_verdict": null,

  meta: {
    verifiedStatus: "Draft",
    phase: 3,
    activationTiming: "step-N-bind",
    stepBinding: 4,
    authoredAt: "2026-05-08",
    authoredBy: "SME persona, Pass 2a stub authoring",
    relatedSpecSections: ["spec §6.3 (default OWA framing)", "spec §6.3.2 (per-predicate CWA)", "API §6.3"],
    relatedFixtures: ["cwa_closed_predicate (sibling: closed predicate produces 'false' via CWA)"],
    architectAuthorization: "Phase 3 entry packet §3.5 ratified 2026-05-08; step-N-bind per Q-3-E split.",
  },
};

export const meta = fixture.meta;
