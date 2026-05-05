/**
 * Phase 1 fixture: PROV-O domain/range — STRUCTURAL VERIFICATION ONLY.
 *
 * Status: Draft. Per ROADMAP Phase 1 line 191: entailment-query verification
 * is deferred to Phase 4 (Phase 1 has no ARC modules loaded, so the predicate
 * `prov_entity` does not yet exist as something the validator can query).
 * This fixture verifies the *structural* lifted FOL shape per API §3.7.1.1's
 * worked example tree.
 *
 * The companion `canary_domain_range_existential.fixture.js` asserts the
 * WRONG shape is absent. This fixture asserts the RIGHT shape is present.
 *
 * Cross-phase activation pattern (per tests/corpus/README.md):
 *   - Phase 1: structural FOL-tree match.
 *   - Phase 4 (when re-activated): same input, additional expectation that
 *     `prov:Entity(project_alpha)` and `prov:Entity(project_beta)` are
 *     entailed via the conditional implications.
 */

/** @type {object} */
export const fixture = {
  input: {
    ontologyIRI: "http://example.org/test/p1_prov_domain_range",
    prefixes: { prov: "http://www.w3.org/ns/prov#" },
    tbox: [],
    abox: [
      {
        "@type": "ObjectPropertyAssertion",
        property: "http://www.w3.org/ns/prov#wasInfluencedBy",
        source: "http://example.org/project_alpha",
        target: "http://example.org/project_beta",
      },
    ],
    rbox: [
      {
        "@type": "ObjectPropertyDomain",
        property: "http://www.w3.org/ns/prov#wasInfluencedBy",
        domain: { "@type": "Class", iri: "http://www.w3.org/ns/prov#Entity" },
      },
      {
        "@type": "ObjectPropertyRange",
        property: "http://www.w3.org/ns/prov#wasInfluencedBy",
        range: { "@type": "Class", iri: "http://www.w3.org/ns/prov#Entity" },
      },
    ],
  },
  expectedFOL: [
    // Domain axiom: ∀x,y. wasInfluencedBy(x,y) → Entity(x)
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Universal",
        variable: "y",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Atom",
            predicate: "http://www.w3.org/ns/prov#wasInfluencedBy",
            arguments: [
              { "@type": "fol:Variable", name: "x" },
              { "@type": "fol:Variable", name: "y" },
            ],
          },
          consequent: {
            "@type": "fol:Atom",
            predicate: "http://www.w3.org/ns/prov#Entity",
            arguments: [{ "@type": "fol:Variable", name: "x" }],
          },
        },
      },
    },
    // Range axiom: ∀x,y. wasInfluencedBy(x,y) → Entity(y)
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Universal",
        variable: "y",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Atom",
            predicate: "http://www.w3.org/ns/prov#wasInfluencedBy",
            arguments: [
              { "@type": "fol:Variable", name: "x" },
              { "@type": "fol:Variable", name: "y" },
            ],
          },
          consequent: {
            "@type": "fol:Atom",
            predicate: "http://www.w3.org/ns/prov#Entity",
            arguments: [{ "@type": "fol:Variable", name: "y" }],
          },
        },
      },
    },
    // The asserted property fact.
    {
      "@type": "fol:Atom",
      predicate: "http://www.w3.org/ns/prov#wasInfluencedBy",
      arguments: [
        { "@type": "fol:Constant", iri: "http://example.org/project_alpha" },
        { "@type": "fol:Constant", iri: "http://example.org/project_beta" },
      ],
    },
  ],
};

export const meta = {
  fixtureId: "p1_prov_domain_range",
  intent:
    "PROV-O domain and range axioms must lift to conditional universals (∀x,y. P(x,y) → Domain(x); symmetric for range). Verifies the RIGHT shape (companion canary verifies the WRONG shape's absence). Phase 1 ships structural verification only; entailment-query verification re-activates at Phase 4 once PROV-O ARC content is loaded.",
  verifiedStatus: "Verified",
};
