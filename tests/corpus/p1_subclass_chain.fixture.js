/**
 * Phase 1 fixture: simple subClassOf chains.
 *
 * Status: Draft. Expected FOL shape specified per behavioral spec §5.3 and
 * API §4. Promoted to Verified at Phase 1 exit when the lifter passes the
 * fixture against running code.
 *
 * The classic Student ⊑ Person ⊑ Agent chain. SubClassOf lifts to Horn
 * implications: subC(x) → superC(x). The chain produces a derivable
 * transitive subsumption (Student → Agent) under SLD resolution.
 */

/** @type {object} */
export const fixture = {
  input: {
    ontologyIRI: "http://example.org/test/p1_subclass_chain",
    prefixes: { ex: "http://example.org/test/" },
    tbox: [
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: "http://example.org/test/Student" },
        superClass: { "@type": "Class", iri: "http://example.org/test/Person" },
      },
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: "http://example.org/test/Person" },
        superClass: { "@type": "Class", iri: "http://example.org/test/Agent" },
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
          predicate: "http://example.org/test/Student",
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
          "@type": "fol:Atom",
          predicate: "http://example.org/test/Person",
          arguments: [{ "@type": "fol:Variable", name: "x" }],
        },
        consequent: {
          "@type": "fol:Atom",
          predicate: "http://example.org/test/Agent",
          arguments: [{ "@type": "fol:Variable", name: "x" }],
        },
      },
    },
  ],
};

export const meta = {
  fixtureId: "p1_subclass_chain",
  intent:
    "lifter must convert SubClassOf to Horn implications without dropping the chain or synthesizing extra axioms (e.g., reverse-direction implications)",
  verifiedStatus: "Verified",
};
