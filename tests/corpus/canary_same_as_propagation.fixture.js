/**
 * Phase 1 wrong-translation canary: owl:sameAs identity propagation.
 *
 * Status: Draft. IN SCOPE FOR PHASE 1, NOT DEFERRED.
 *
 * Per behavioral spec §5.5.2, identity must propagate through other relations:
 * if same_as(a, b) holds and p(a, c) is a fact, then p(b, c) must also hold.
 * The lifter implements this by injecting identity-aware variants for every
 * binary predicate used in the graph (the p_orig + identity-rule rewrite).
 *
 * The failure this canary catches: the lifter silently drops identity
 * propagation. Naive lifting puts owl:sameAs facts in the FOL state but
 * does not wire them into other predicates' resolution paths. Queries on
 * substituted-individual names then return 'undetermined' instead of 'true'.
 *
 * Filename note: ROADMAP line 183 originally listed `canary_sameAs_propagation.fixture.js`.
 * The Phase 0.8 manifest schema's fixtureId pattern is `^[a-z0-9_]+$` (no
 * uppercase). Renamed to `canary_same_as_propagation` for schema conformance;
 * ROADMAP updated to match.
 */

/** @type {object} */
export const fixture = {
  input: {
    ontologyIRI: "http://example.org/test/canary_same_as_propagation",
    prefixes: { ex: "http://example.org/test/" },
    tbox: [],
    abox: [
      {
        "@type": "SameIndividual",
        individuals: [
          "http://example.org/test/superman",
          "http://example.org/test/clarkkent",
        ],
      },
      {
        "@type": "ObjectPropertyAssertion",
        property: "http://example.org/test/worksAt",
        source: "http://example.org/test/clarkkent",
        target: "http://example.org/test/dailyplanet",
      },
    ],
    rbox: [],
  },
  expectedQueries: [
    {
      query: "worksAt(superman, dailyplanet)",
      expectedResult: "true",
      reason: "consistent",
      note: "identity propagation: same_as(superman, clarkkent) ∧ worksAt(clarkkent, dailyplanet) ⊨ worksAt(superman, dailyplanet)",
    },
    {
      query: "worksAt(clarkkent, dailyplanet)",
      expectedResult: "true",
      reason: "consistent",
      note: "directly asserted; baseline that should pass even without identity propagation",
    },
  ],
};

export const meta = {
  fixtureId: "canary_same_as_propagation",
  intent:
    "catches a lifter that lifts owl:sameAs to facts but fails to inject identity-aware predicate variants. Without the propagation rules per spec §5.5.2, queries on substituted-individual names return 'undetermined' silently. The right behavior is 'true' with a witness chain showing the same_as fact + the original assertion.",
  verifiedStatus: "Draft",
};
