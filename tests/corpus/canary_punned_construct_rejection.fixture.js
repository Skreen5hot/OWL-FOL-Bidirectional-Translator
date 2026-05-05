/**
 * Phase 1 wrong-translation canary: punned construct rejection.
 *
 * Status: Draft. IN SCOPE FOR PHASE 1, NOT DEFERRED.
 *
 * Per ROADMAP Phase 1 deliverables: "Lifter rejects all spec §13.1 punted
 * constructs with UnsupportedConstructError. The `construct` field names
 * the specific construct (e.g., 'owl:hasKey', 'owl:NegativePropertyAssertion',
 * 'punning', 'faceted-datatype-restriction', 'annotation-on-annotation').
 * One test fixture per punted construct verifies the rejection."
 *
 * The failure this canary catches: the lifter silently accepts a punted
 * construct and emits degraded FOL, OR throws a generic Error rather than
 * the typed UnsupportedConstructError with the documented `construct` field.
 *
 * Each input variant below MUST produce UnsupportedConstructError with the
 * specified `construct` value when passed to owlToFol.
 */

/** @type {object} */
export const fixture = {
  // Each entry: { input: <OWLOntology>, expectedThrow: { class, construct } }
  cases: [
    {
      label: "owl:hasKey",
      input: {
        ontologyIRI: "http://example.org/test/punted_hasKey",
        prefixes: {},
        tbox: [
          {
            "@type": "HasKey",
            class: { "@type": "Class", iri: "http://example.org/test/Document" },
            properties: ["http://example.org/test/documentId"],
          },
        ],
        abox: [],
        rbox: [],
      },
      expectedThrow: {
        class: "UnsupportedConstructError",
        construct: "owl:hasKey",
      },
    },
    {
      label: "owl:NegativeObjectPropertyAssertion in ABox",
      input: {
        ontologyIRI: "http://example.org/test/punted_negative_assertion",
        prefixes: {},
        tbox: [],
        abox: [
          {
            "@type": "NegativeObjectPropertyAssertion",
            property: "http://example.org/test/employs",
            source: "http://example.org/test/alice",
            target: "http://example.org/test/bob",
          },
        ],
        rbox: [],
      },
      expectedThrow: {
        class: "UnsupportedConstructError",
        construct: "owl:NegativeObjectPropertyAssertion",
      },
    },
    {
      label: "punning (same IRI declared as both Class and ObjectProperty)",
      input: {
        ontologyIRI: "http://example.org/test/punted_punning",
        prefixes: {},
        tbox: [
          {
            "@type": "ClassDefinition",
            iri: "http://example.org/test/Color",
            expression: { "@type": "Class", iri: "http://example.org/test/Color" },
          },
        ],
        abox: [
          {
            "@type": "ObjectPropertyAssertion",
            property: "http://example.org/test/Color",
            source: "http://example.org/test/apple",
            target: "http://example.org/test/red",
          },
        ],
        rbox: [],
      },
      expectedThrow: {
        class: "UnsupportedConstructError",
        construct: "punning",
      },
    },
    {
      label: "faceted-datatype-restriction (DatatypeRestriction)",
      input: {
        ontologyIRI: "http://example.org/test/punted_faceted_datatype",
        prefixes: { xsd: "http://www.w3.org/2001/XMLSchema#" },
        tbox: [
          {
            "@type": "SubClassOf",
            subClass: { "@type": "Class", iri: "http://example.org/test/Adult" },
            superClass: {
              "@type": "Restriction",
              onProperty: "http://example.org/test/age",
              someValuesFrom: {
                "@type": "DatatypeRestriction",
                datatype: "http://www.w3.org/2001/XMLSchema#integer",
                facets: [{ facet: "minInclusive", value: "18" }],
              },
            },
          },
        ],
        abox: [],
        rbox: [],
      },
      expectedThrow: {
        class: "UnsupportedConstructError",
        construct: "faceted-datatype-restriction",
      },
    },
    {
      label: "annotation-on-annotation (axiom annotation that itself carries annotations)",
      input: {
        ontologyIRI: "http://example.org/test/punted_annot_on_annot",
        prefixes: {},
        tbox: [],
        abox: [],
        rbox: [],
        annotations: [
          {
            "@type": "Annotation",
            property: "http://www.w3.org/2000/01/rdf-schema#comment",
            value: "outer comment",
            annotations: [
              {
                "@type": "Annotation",
                property: "http://www.w3.org/2000/01/rdf-schema#comment",
                value: "inner comment on the outer comment",
              },
            ],
          },
        ],
      },
      expectedThrow: {
        class: "UnsupportedConstructError",
        construct: "annotation-on-annotation",
      },
    },
  ],
};

export const meta = {
  fixtureId: "canary_punned_construct_rejection",
  intent:
    "catches a lifter that silently accepts spec §13.1 punted constructs and emits degraded FOL — or throws a generic Error rather than the typed UnsupportedConstructError with the documented `construct` field. Each case asserts the typed error is raised with the specific construct identifier; consumers catch by class+construct, not by message.",
  verifiedStatus: "Verified",
};
