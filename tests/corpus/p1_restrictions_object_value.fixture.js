/**
 * Phase 1 fixture: ObjectSomeValuesFrom, ObjectAllValuesFrom, ObjectHasValue.
 *
 * Status: Draft. Per behavioral spec §5.3 and API §3.4:
 *   ObjectSomeValuesFrom uses a Skolem constant per restriction instance to
 *     preserve the existential.
 *   ObjectAllValuesFrom becomes an implication.
 *   ObjectHasValue becomes a fact assertion via the named individual.
 */

/** @type {object} */
export const fixture = {
  input: {
    ontologyIRI: "http://example.org/test/p1_restrictions_value",
    prefixes: { ex: "http://example.org/test/" },
    tbox: [
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: "http://example.org/test/Parent" },
        superClass: {
          "@type": "Restriction",
          onProperty: "http://example.org/test/hasChild",
          someValuesFrom: { "@type": "Class", iri: "http://example.org/test/Person" },
        },
      },
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: "http://example.org/test/HappyParent" },
        superClass: {
          "@type": "Restriction",
          onProperty: "http://example.org/test/hasChild",
          allValuesFrom: { "@type": "Class", iri: "http://example.org/test/Happy" },
        },
      },
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: "http://example.org/test/CitizenOfFrance" },
        superClass: {
          "@type": "Restriction",
          onProperty: "http://example.org/test/citizenOf",
          hasValue: "http://example.org/test/France",
        },
      },
    ],
    abox: [],
    rbox: [],
  },
  expectedFOL: [
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Implication",
        antecedent: {
          "@type": "fol:Atom",
          predicate: "http://example.org/test/Parent",
          arguments: [{ "@type": "fol:Variable", name: "x" }],
        },
        consequent: {
          "@type": "fol:Existential",
          variable: "y",
          body: {
            "@type": "fol:Conjunction",
            conjuncts: [
              {
                "@type": "fol:Atom",
                predicate: "http://example.org/test/hasChild",
                arguments: [
                  { "@type": "fol:Variable", name: "x" },
                  { "@type": "fol:Variable", name: "y" },
                ],
              },
              {
                "@type": "fol:Atom",
                predicate: "http://example.org/test/Person",
                arguments: [{ "@type": "fol:Variable", name: "y" }],
              },
            ],
          },
        },
      },
    },
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Implication",
        antecedent: {
          "@type": "fol:Atom",
          predicate: "http://example.org/test/HappyParent",
          arguments: [{ "@type": "fol:Variable", name: "x" }],
        },
        consequent: {
          "@type": "fol:Universal",
          variable: "y",
          body: {
            "@type": "fol:Implication",
            antecedent: {
              "@type": "fol:Atom",
              predicate: "http://example.org/test/hasChild",
              arguments: [
                { "@type": "fol:Variable", name: "x" },
                { "@type": "fol:Variable", name: "y" },
              ],
            },
            consequent: {
              "@type": "fol:Atom",
              predicate: "http://example.org/test/Happy",
              arguments: [{ "@type": "fol:Variable", name: "y" }],
            },
          },
        },
      },
    },
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Implication",
        antecedent: {
          "@type": "fol:Atom",
          predicate: "http://example.org/test/CitizenOfFrance",
          arguments: [{ "@type": "fol:Variable", name: "x" }],
        },
        consequent: {
          "@type": "fol:Atom",
          predicate: "http://example.org/test/citizenOf",
          arguments: [
            { "@type": "fol:Variable", name: "x" },
            { "@type": "fol:Constant", iri: "http://example.org/test/France" },
          ],
        },
      },
    },
  ],
};

export const meta = {
  fixtureId: "p1_restrictions_object_value",
  intent:
    "someValuesFrom must lift with an existential (Skolem-witnessed if existentialised at the point of use); allValuesFrom must lift to a universal-implication, NOT to an existential; hasValue must lift to a fact assertion against the named individual, NOT to an existential",
  verifiedStatus: "Verified",
};
