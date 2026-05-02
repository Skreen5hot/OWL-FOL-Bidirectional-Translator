/**
 * Phase 1 fixture: EquivalentClasses + DisjointWith between named classes.
 *
 * Status: Draft. Per behavioral spec §5.3:
 *   EquivalentClasses(A, B) lifts to mutual implication (a biconditional
 *     decomposed as two universals).
 *   DisjointWith(A, B) lifts to A(x) ∧ B(x) → ⊥.
 */

/** @type {object} */
export const fixture = {
  input: {
    ontologyIRI: "http://example.org/test/p1_equiv_disjoint",
    prefixes: { ex: "http://example.org/test/" },
    tbox: [
      {
        "@type": "EquivalentClasses",
        classes: [
          { "@type": "Class", iri: "http://example.org/test/Person" },
          { "@type": "Class", iri: "http://example.org/test/HumanBeing" },
        ],
      },
      {
        "@type": "DisjointWith",
        classes: [
          { "@type": "Class", iri: "http://example.org/test/Person" },
          { "@type": "Class", iri: "http://example.org/test/Boulder" },
        ],
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
          predicate: "http://example.org/test/Person",
          arguments: [{ "@type": "fol:Variable", name: "x" }],
        },
        consequent: {
          "@type": "fol:Atom",
          predicate: "http://example.org/test/HumanBeing",
          arguments: [{ "@type": "fol:Variable", name: "x" }],
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
          predicate: "http://example.org/test/HumanBeing",
          arguments: [{ "@type": "fol:Variable", name: "x" }],
        },
        consequent: {
          "@type": "fol:Atom",
          predicate: "http://example.org/test/Person",
          arguments: [{ "@type": "fol:Variable", name: "x" }],
        },
      },
    },
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Implication",
        antecedent: {
          "@type": "fol:Conjunction",
          conjuncts: [
            {
              "@type": "fol:Atom",
              predicate: "http://example.org/test/Person",
              arguments: [{ "@type": "fol:Variable", name: "x" }],
            },
            {
              "@type": "fol:Atom",
              predicate: "http://example.org/test/Boulder",
              arguments: [{ "@type": "fol:Variable", name: "x" }],
            },
          ],
        },
        consequent: { "@type": "fol:False" },
      },
    },
  ],
};

export const meta = {
  fixtureId: "p1_equivalent_and_disjoint_named",
  intent:
    "EquivalentClasses lifts to two universals (NOT one biconditional that decomposes incorrectly); DisjointWith lifts to a conjunction implying ⊥, NOT to a single negated atom",
  verifiedStatus: "Draft",
};
