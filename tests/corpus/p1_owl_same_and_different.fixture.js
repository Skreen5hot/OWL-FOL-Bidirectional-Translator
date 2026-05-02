/**
 * Phase 1 fixture: owl:sameAs and owl:differentFrom between named individuals.
 *
 * Status: Draft. Per behavioral spec §5.5:
 *   owl:sameAs lifts to a same_as/2 fact with reflexivity / symmetry /
 *     transitivity axioms injected.
 *   owl:differentFrom lifts to a different_from/2 fact (or, equivalently,
 *     a negated identity).
 *
 * This fixture verifies the lifter wires up the identity discipline. The
 * canary_sameAs_propagation fixture verifies identity propagates through
 * other predicates — different concern, different fixture.
 */

/** @type {object} */
export const fixture = {
  input: {
    ontologyIRI: "http://example.org/test/p1_same_diff",
    prefixes: { ex: "http://example.org/test/" },
    tbox: [],
    rbox: [],
    abox: [
      {
        "@type": "SameIndividual",
        individuals: [
          "http://example.org/test/superman",
          "http://example.org/test/clarkkent",
        ],
      },
      {
        "@type": "DifferentIndividuals",
        individuals: [
          "http://example.org/test/superman",
          "http://example.org/test/lexluthor",
        ],
      },
    ],
  },
  expectedFOL: [
    {
      "@type": "fol:Atom",
      predicate: "owl:sameAs",
      arguments: [
        { "@type": "fol:Constant", iri: "http://example.org/test/superman" },
        { "@type": "fol:Constant", iri: "http://example.org/test/clarkkent" },
      ],
    },
    {
      "@type": "fol:Atom",
      predicate: "owl:differentFrom",
      arguments: [
        { "@type": "fol:Constant", iri: "http://example.org/test/superman" },
        { "@type": "fol:Constant", iri: "http://example.org/test/lexluthor" },
      ],
    },
  ],
};

export const meta = {
  fixtureId: "p1_owl_same_and_different",
  intent:
    "owl:sameAs and owl:differentFrom must lift to facts with reserved predicate names (NOT discarded as 'metadata'); identity-equivalence axiomatization (reflexivity/symmetry/transitivity for sameAs) must be injected by the lifter per spec §5.5.1",
  verifiedStatus: "Draft",
};
