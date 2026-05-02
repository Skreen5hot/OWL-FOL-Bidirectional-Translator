/**
 * Phase 1 fixture: ABox assertions — class, object property, datatype property.
 *
 * Status: Draft. Per behavioral spec §5.1 and API §3.5:
 *   x rdf:type C            → C(x).
 *   x p y                   → p(x, y).
 *   x p "literal"^^datatype → p(x, literal_constant) with datatype preserved.
 */

/** @type {object} */
export const fixture = {
  input: {
    ontologyIRI: "http://example.org/test/p1_abox",
    prefixes: { ex: "http://example.org/test/", xsd: "http://www.w3.org/2001/XMLSchema#" },
    tbox: [],
    rbox: [],
    abox: [
      {
        "@type": "ClassAssertion",
        individual: "http://example.org/test/alice",
        class: { "@type": "Class", iri: "http://example.org/test/Person" },
      },
      {
        "@type": "ObjectPropertyAssertion",
        property: "http://example.org/test/knows",
        source: "http://example.org/test/alice",
        target: "http://example.org/test/bob",
      },
      {
        "@type": "DataPropertyAssertion",
        property: "http://example.org/test/age",
        source: "http://example.org/test/alice",
        value: { "@value": "30", "@type": "http://www.w3.org/2001/XMLSchema#integer" },
      },
    ],
  },
  expectedFOL: [
    {
      "@type": "fol:Atom",
      predicate: "http://example.org/test/Person",
      arguments: [{ "@type": "fol:Constant", iri: "http://example.org/test/alice" }],
    },
    {
      "@type": "fol:Atom",
      predicate: "http://example.org/test/knows",
      arguments: [
        { "@type": "fol:Constant", iri: "http://example.org/test/alice" },
        { "@type": "fol:Constant", iri: "http://example.org/test/bob" },
      ],
    },
    {
      "@type": "fol:Atom",
      predicate: "http://example.org/test/age",
      arguments: [
        { "@type": "fol:Constant", iri: "http://example.org/test/alice" },
        {
          "@type": "fol:TypedLiteral",
          value: "30",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      ],
    },
  ],
};

export const meta = {
  fixtureId: "p1_abox_assertions",
  intent:
    "ABox assertions must lift directly: class assertion → unary fact; object property assertion → binary fact; data property assertion → binary fact preserving the typed literal (datatype IRI must NOT be erased to bare string)",
  verifiedStatus: "Draft",
};
