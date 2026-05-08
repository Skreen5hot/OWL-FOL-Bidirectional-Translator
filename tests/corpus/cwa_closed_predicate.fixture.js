/**
 * Phase 3 fixture — Per-predicate CWA: closed predicate produces 'false'.
 *
 * Per Phase 3 entry packet §3.5 + architect Q-3-E ratification 2026-05-08 (step-N-bind):
 * Step 4 (closedPredicates + per-predicate CWA per spec §6.3.2 + API §6.3) authoring
 * fills full body. Stub at Pass 2a.
 *
 * Status: Draft (stub). Step 4 binding.
 *
 * Exercises: query with closedPredicates: {p} produces 'false' for failing
 * \+ p(x, y) goals on named individuals. Discrimination from cwa_open_predicate
 * sibling: this fixture exercises CLOSED predicate behavior (CWA-derived 'false');
 * the sibling exercises OPEN predicate behavior (default OWA producing 'undetermined'
 * with naf_residue reason).
 */

const PREFIX = "http://example.org/test/cwa_closed_predicate/";

/** @type {object} */
export const fixture = {
  input: {
    ontologyIRI: "http://example.org/test/cwa_closed_predicate",
    prefixes: { ex: PREFIX },
    tbox: [],
    abox: [
      { "@type": "ClassAssertion", class: { "@type": "Class", iri: PREFIX + "Person" }, individual: PREFIX + "alice" },
    ],
    rbox: [],
  },

  // Stub query — Step 4 authoring fills closedPredicates + discriminating query
  query: {
    "@type": "fol:Atom",
    predicate: PREFIX + "Knows",
    arguments: [
      { "@type": "fol:Constant", iri: PREFIX + "alice" },
      { "@type": "fol:Constant", iri: PREFIX + "bob" },
    ],
  },

  closedPredicates: [PREFIX + "Knows"],

  expectedOutcome: {
    summary:
      "Stub for Step 4 (closedPredicates + per-predicate CWA) authoring. Step 4 fills full " +
      "expected behavior. Stub-level contract: query Knows(alice, bob)? with closedPredicates: " +
      "{Knows} produces 'false' (CWA-derived; the predicate is closed; no derivation succeeds).",
    fixtureType: "evaluate-with-closedPredicates",
    canaryRole: "per-predicate-cwa-closed-discriminator",
    stubStatus: "step-4-authoring-pending",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "closedPredicates failure: implementation ignores closedPredicates parameter and returns " +
    "'undetermined' instead of 'false'; implementation applies CWA globally instead of per-predicate; " +
    "implementation populates wrong reason code.",

  "expected_v0.1_verdict": {
    ringStatus: "ring3-stub-pending-step-4",
    phaseAuthored: 3,
    phaseActivated: 3,
    expectedResult: "false",
    expectedReason: "closed_world_negation",
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
    relatedSpecSections: ["spec §6.3.2 (per-predicate CWA)", "API §6.3 (closedPredicates parameter)"],
    relatedFixtures: ["cwa_open_predicate (sibling: open predicate produces 'undetermined' with naf_residue)"],
    architectAuthorization: "Phase 3 entry packet §3.5 ratified 2026-05-08; step-N-bind per Q-3-E split.",
  },
};

export const meta = fixture.meta;
