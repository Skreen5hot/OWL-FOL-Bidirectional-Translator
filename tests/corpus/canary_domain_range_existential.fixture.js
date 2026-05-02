/**
 * Phase 1 wrong-translation canary: domain/range existential synthesis.
 *
 * Status: Draft. IN SCOPE FOR PHASE 1, NOT DEFERRED.
 *
 * Asserts the WRONG shape is absent. Companion fixture
 * `p1_prov_domain_range.fixture.js` asserts the RIGHT shape is present.
 *
 * Per API §3.7.1.2, the lifter MUST NOT emit any of:
 *   WRONG: X ⊑ ∃P.⊤                    (universal-existential restriction on X)
 *   WRONG: ∀x. X(x) → ∃y. P(x,y)        (synthesized universal axiom)
 *   WRONG: SubClassOf(X, ∃P.⊤) in OWL  (existential restriction shape)
 *
 * The wrong translation says "every member of X participates in P with some
 * target." This is a SYNTHESIZED universal not in the source. Asserting X(a)
 * would entail the existence of a Skolem successor b such that P(a, b) — a
 * fact the source did not assert. This is the failure mode this canary catches.
 */

/** @type {object} */
export const fixture = {
  input: {
    ontologyIRI: "http://example.org/test/canary_dr_existential",
    prefixes: { prov: "http://www.w3.org/ns/prov#" },
    tbox: [],
    abox: [
      {
        "@type": "ClassAssertion",
        individual: "http://example.org/lonely_entity",
        class: { "@type": "Class", iri: "http://www.w3.org/ns/prov#Entity" },
      },
    ],
    rbox: [
      {
        "@type": "ObjectPropertyDomain",
        property: "http://www.w3.org/ns/prov#wasInfluencedBy",
        domain: { "@type": "Class", iri: "http://www.w3.org/ns/prov#Entity" },
      },
    ],
  },
  // Negative assertion: the lifted FOL state MUST NOT contain any of these patterns
  // when the input declares only the domain axiom + a class assertion. lonely_entity
  // is an Entity but does not participate in wasInfluencedBy with anything; the
  // wrong existential translation would falsely synthesize a Skolem partner for it.
  forbiddenFOLPatterns: [
    {
      description: "synthesized existential ∀x. Entity(x) → ∃y. wasInfluencedBy(x,y)",
      pattern: {
        "@type": "fol:Universal",
        body: {
          "@type": "fol:Implication",
          antecedent: { "@type": "fol:Atom", predicate: "http://www.w3.org/ns/prov#Entity" },
          consequent: {
            "@type": "fol:Existential",
            body: {
              "@type": "fol:Atom",
              predicate: "http://www.w3.org/ns/prov#wasInfluencedBy",
            },
          },
        },
      },
    },
    {
      description:
        "OWL-side synthesis: SubClassOf(Entity, ObjectSomeValuesFrom(wasInfluencedBy, owl:Thing))",
      pattern: {
        "@type": "SubClassOf",
        superClass: {
          "@type": "Restriction",
          onProperty: "http://www.w3.org/ns/prov#wasInfluencedBy",
        },
      },
    },
  ],
  // Query expectation (executed against the lifted FOL state once Phase 1 lifter exists):
  // Querying ∃y. wasInfluencedBy(lonely_entity, y) MUST return 'undetermined' (open-world)
  // — NOT 'true' via a synthesized Skolem successor.
  expectedQueries: [
    {
      query: "∃y. wasInfluencedBy(lonely_entity, y)",
      expectedResult: "undetermined",
      reason: "open_world_undetermined",
      note: "The wrong existential translation would entail this with a fabricated Skolem y. Correct conditional translation does not.",
    },
  ],
};

export const meta = {
  fixtureId: "canary_domain_range_existential",
  intent:
    "catches the wrong existentialisation of domain/range axioms — would entail a fabricated Skolem successor for any class member, producing false existential entailments the source did not assert",
  verifiedStatus: "Draft",
};
