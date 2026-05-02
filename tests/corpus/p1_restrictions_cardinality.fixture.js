/**
 * Phase 1 fixture: ObjectMinCardinality / ObjectMaxCardinality / ObjectExactCardinality.
 *
 * Status: Draft. Per API §3.4 cardinality restrictions, with optional onClass
 * for qualified cardinality restrictions (QCR).
 *
 * Phase 1 lifts cardinality restrictions to FOL counting axioms; some
 * mappings exceed Horn fragment and must be flagged as Annotated
 * Approximation candidates for the projector (Phase 2). Phase 1's job is
 * just the lift.
 */

/** @type {object} */
export const fixture = {
  input: {
    ontologyIRI: "http://example.org/test/p1_restrictions_cardinality",
    prefixes: { ex: "http://example.org/test/" },
    tbox: [
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: "http://example.org/test/HasAtLeastTwoChildren" },
        superClass: {
          "@type": "Restriction",
          onProperty: "http://example.org/test/hasChild",
          minCardinality: 2,
        },
      },
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: "http://example.org/test/HasAtMostThreeChildren" },
        superClass: {
          "@type": "Restriction",
          onProperty: "http://example.org/test/hasChild",
          maxCardinality: 3,
        },
      },
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: "http://example.org/test/HasExactlyTwoHumanChildren" },
        superClass: {
          "@type": "Restriction",
          onProperty: "http://example.org/test/hasChild",
          cardinality: 2,
          onClass: { "@type": "Class", iri: "http://example.org/test/Person" },
        },
      },
    ],
    abox: [],
    rbox: [],
  },
  expectedFOL: "STRUCTURAL_ONLY — cardinality FOL shape pinned during Phase 1 implementation; Phase 1 lifter must emit FOL terms preserving min/max/exact + (when QCR) the onClass filter, in a form the projector can route to Annotated Approximation",
};

export const meta = {
  fixtureId: "p1_restrictions_cardinality",
  intent:
    "cardinality restrictions must lift to FOL preserving the count, the property, and (for QCR) the onClass filter. Phase 1 must NOT silently drop QCR onClass; if it cannot represent the count semantics within Horn, it must emit a Loss Signature record so the projector can route to Annotated Approximation.",
  verifiedStatus: "Draft",
};
