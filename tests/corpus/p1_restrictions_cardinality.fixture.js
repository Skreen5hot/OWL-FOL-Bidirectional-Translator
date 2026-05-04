/**
 * Phase 1 fixture: ObjectMinCardinality / ObjectMaxCardinality / ObjectExactCardinality.
 *
 * Status: Draft. Per API §3.4 cardinality restrictions, with optional onClass
 * for qualified cardinality restrictions (QCR).
 *
 * Phase 1 lifts cardinality restrictions to classical-FOL counting axioms.
 * The forms are decidable in classical FOL but exceed the Horn fragment;
 * the projector (Phase 2) routes them to Annotated Approximation when
 * projecting back to OWL because OWL 2 DL's cardinality syntax cannot
 * always represent the FOL form one-to-one (e.g., disjunctive equalities
 * in maxCardinality have no direct OWL counterpart). Phase 1's job is
 * just the lift; the projector decides what to do with it.
 *
 * ============================================================================
 * AMENDMENT AUDIT TRAIL — Step 7 STRUCTURAL_ONLY fill-in, 2026-05-03
 * ============================================================================
 *
 * (a) Placeholder fill-in. The original `expectedFOL` was the architect-
 *     ratified STRUCTURAL_ONLY string ("cardinality FOL shape pinned during
 *     Phase 1 implementation; Phase 1 lifter must emit FOL terms preserving
 *     min/max/exact + (when QCR) the onClass filter, in a form the projector
 *     can route to Annotated Approximation"). Step 7 fills in the byte-exact
 *     form per ADR-007 §7's resolved cardinality-witness convention.
 *
 * (b) Convention application (ADR-007 §7). Cardinality lifting uses
 *     existential bindings (NOT Skolem constants) allocated from the
 *     standard variable allocator per ADR-007 §2. Concrete shapes:
 *       - minCardinality(P, n)[onClass C] → ∃ y₁..yₙ pairwise-distinct
 *         ∧ ⋀ P(x, yᵢ) [∧ C(yᵢ)]
 *       - maxCardinality(P, n)[onClass C] → ∀ y₁..y_{n+1}
 *         (⋀ P(x, yᵢ) [∧ C(yᵢ)]) → (⋁ᵢ<ⱼ yᵢ = yⱼ)
 *       - exactCardinality(P, n)[onClass C] → min(P,n)[C] ∧ max(P,n)[C]
 *         conjoined at the consequent of the wrapping SubClassOf universal
 *
 *     Variable allocation across the three SubClassOf axioms in this
 *     fixture's input is per ADR-007 §2: a fresh allocator per top-level
 *     lift (per axiom). Outer x; min part allocs y, z; max part allocs
 *     w, v, u (continuing the alphabetic sequence from the shared inner-
 *     allocator within exactCardinality's min ∧ max conjunction).
 *
 * (c) Spec citation. Behavioral spec §3.4 (restriction shapes); API §3.4
 *     (cardinality variants). The classical-FOL counting form is the
 *     standard semantic encoding of cardinality restrictions per the
 *     OWL 2 Direct Semantics specification (W3C Recommendation, 2012,
 *     section 5.3.4); ADR-007 §7 governs OFBT's specific use of the
 *     variable-allocator convention vs Skolemization (decision: ∃-bindings,
 *     no Skolems).
 *
 * (d) Architect ruling reference. ADR-007 §7 (Resolved at Step 7 close;
 *     promoted from "Step 7 placeholder" to "Cardinality witness
 *     convention" per the architect's standing ratification of ADR-007
 *     sections 2-9 as implementation-choice tier within the developer's
 *     domain). Layer-translation per ADR-007 §1: the lifter emits classical
 *     FOL; the projector (Phase 2) and evaluator (Phase 3) interpret it.
 *
 * Internal contract consistency (per AUTHORING_DISCIPLINE.md): the amended
 * `expectedFOL` aligns with intent and manifest's expectedOutcome.summary.
 * Promotion gate: this fixture is ready Draft → Verified at Phase 1 exit
 * per ADR-007 §7 ratification.
 *
 * Banked: the B2 SME-fix protection ("no wrong-arity unary-atom emission
 * for cardinality") graduates from inline regression test to fixture-level
 * deepStrictEqual against this expectedFOL. Wrong-arity emission would
 * break the byte-exact match — tighter test coverage at the natural
 * graduation point.
 * ============================================================================
 */

const HAS_AT_LEAST_TWO = "http://example.org/test/HasAtLeastTwoChildren";
const HAS_AT_MOST_THREE = "http://example.org/test/HasAtMostThreeChildren";
const HAS_EXACTLY_TWO_HUMAN = "http://example.org/test/HasExactlyTwoHumanChildren";
const HAS_CHILD = "http://example.org/test/hasChild";
const PERSON = "http://example.org/test/Person";

const VAR_X = { "@type": "fol:Variable", name: "x" };
const VAR_Y = { "@type": "fol:Variable", name: "y" };
const VAR_Z = { "@type": "fol:Variable", name: "z" };
const VAR_W = { "@type": "fol:Variable", name: "w" };
const VAR_V = { "@type": "fol:Variable", name: "v" };
const VAR_U = { "@type": "fol:Variable", name: "u" };

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
  expectedFOL: [
    // Case 1: SubClassOf(HasAtLeastTwoChildren, ≥2 hasChild)
    // ∀x. HasAtLeastTwoChildren(x) → ∃y. ∃z. (¬(y=z) ∧ hasChild(x,y) ∧ hasChild(x,z))
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Implication",
        antecedent: { "@type": "fol:Atom", predicate: HAS_AT_LEAST_TWO, arguments: [VAR_X] },
        consequent: {
          "@type": "fol:Existential",
          variable: "y",
          body: {
            "@type": "fol:Existential",
            variable: "z",
            body: {
              "@type": "fol:Conjunction",
              conjuncts: [
                {
                  "@type": "fol:Negation",
                  inner: { "@type": "fol:Equality", left: VAR_Y, right: VAR_Z },
                },
                { "@type": "fol:Atom", predicate: HAS_CHILD, arguments: [VAR_X, VAR_Y] },
                { "@type": "fol:Atom", predicate: HAS_CHILD, arguments: [VAR_X, VAR_Z] },
              ],
            },
          },
        },
      },
    },
    // Case 2: SubClassOf(HasAtMostThreeChildren, ≤3 hasChild)
    // ∀x. HasAtMostThreeChildren(x) → ∀y,z,w,v. (hasChild(x,y)∧hasChild(x,z)∧hasChild(x,w)∧hasChild(x,v)) → ((y=z) ∨ (y=w) ∨ (y=v) ∨ (z=w) ∨ (z=v) ∨ (w=v))
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Implication",
        antecedent: { "@type": "fol:Atom", predicate: HAS_AT_MOST_THREE, arguments: [VAR_X] },
        consequent: {
          "@type": "fol:Universal",
          variable: "y",
          body: {
            "@type": "fol:Universal",
            variable: "z",
            body: {
              "@type": "fol:Universal",
              variable: "w",
              body: {
                "@type": "fol:Universal",
                variable: "v",
                body: {
                  "@type": "fol:Implication",
                  antecedent: {
                    "@type": "fol:Conjunction",
                    conjuncts: [
                      { "@type": "fol:Atom", predicate: HAS_CHILD, arguments: [VAR_X, VAR_Y] },
                      { "@type": "fol:Atom", predicate: HAS_CHILD, arguments: [VAR_X, VAR_Z] },
                      { "@type": "fol:Atom", predicate: HAS_CHILD, arguments: [VAR_X, VAR_W] },
                      { "@type": "fol:Atom", predicate: HAS_CHILD, arguments: [VAR_X, VAR_V] },
                    ],
                  },
                  consequent: {
                    "@type": "fol:Disjunction",
                    disjuncts: [
                      { "@type": "fol:Equality", left: VAR_Y, right: VAR_Z },
                      { "@type": "fol:Equality", left: VAR_Y, right: VAR_W },
                      { "@type": "fol:Equality", left: VAR_Y, right: VAR_V },
                      { "@type": "fol:Equality", left: VAR_Z, right: VAR_W },
                      { "@type": "fol:Equality", left: VAR_Z, right: VAR_V },
                      { "@type": "fol:Equality", left: VAR_W, right: VAR_V },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
    // Case 3: SubClassOf(HasExactlyTwoHumanChildren, =2 hasChild Person) — QCR
    // ∀x. HasExactlyTwoHumanChildren(x) → (
    //   (∃y,z. ¬(y=z) ∧ hasChild(x,y) ∧ Person(y) ∧ hasChild(x,z) ∧ Person(z))   // min
    //   ∧
    //   (∀w,v,u. (hasChild(x,w)∧Person(w)∧hasChild(x,v)∧Person(v)∧hasChild(x,u)∧Person(u)) → ((w=v) ∨ (w=u) ∨ (v=u)))   // max
    // )
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Implication",
        antecedent: {
          "@type": "fol:Atom",
          predicate: HAS_EXACTLY_TWO_HUMAN,
          arguments: [VAR_X],
        },
        consequent: {
          "@type": "fol:Conjunction",
          conjuncts: [
            // Min part: ≥2 distinct hasChild Persons
            {
              "@type": "fol:Existential",
              variable: "y",
              body: {
                "@type": "fol:Existential",
                variable: "z",
                body: {
                  "@type": "fol:Conjunction",
                  conjuncts: [
                    {
                      "@type": "fol:Negation",
                      inner: { "@type": "fol:Equality", left: VAR_Y, right: VAR_Z },
                    },
                    { "@type": "fol:Atom", predicate: HAS_CHILD, arguments: [VAR_X, VAR_Y] },
                    { "@type": "fol:Atom", predicate: PERSON, arguments: [VAR_Y] },
                    { "@type": "fol:Atom", predicate: HAS_CHILD, arguments: [VAR_X, VAR_Z] },
                    { "@type": "fol:Atom", predicate: PERSON, arguments: [VAR_Z] },
                  ],
                },
              },
            },
            // Max part: ≤2 hasChild Persons (any 3 must include an equal pair)
            {
              "@type": "fol:Universal",
              variable: "w",
              body: {
                "@type": "fol:Universal",
                variable: "v",
                body: {
                  "@type": "fol:Universal",
                  variable: "u",
                  body: {
                    "@type": "fol:Implication",
                    antecedent: {
                      "@type": "fol:Conjunction",
                      conjuncts: [
                        { "@type": "fol:Atom", predicate: HAS_CHILD, arguments: [VAR_X, VAR_W] },
                        { "@type": "fol:Atom", predicate: PERSON, arguments: [VAR_W] },
                        { "@type": "fol:Atom", predicate: HAS_CHILD, arguments: [VAR_X, VAR_V] },
                        { "@type": "fol:Atom", predicate: PERSON, arguments: [VAR_V] },
                        { "@type": "fol:Atom", predicate: HAS_CHILD, arguments: [VAR_X, VAR_U] },
                        { "@type": "fol:Atom", predicate: PERSON, arguments: [VAR_U] },
                      ],
                    },
                    consequent: {
                      "@type": "fol:Disjunction",
                      disjuncts: [
                        { "@type": "fol:Equality", left: VAR_W, right: VAR_V },
                        { "@type": "fol:Equality", left: VAR_W, right: VAR_U },
                        { "@type": "fol:Equality", left: VAR_V, right: VAR_U },
                      ],
                    },
                  },
                },
              },
            },
          ],
        },
      },
    },
  ],
};

export const meta = {
  fixtureId: "p1_restrictions_cardinality",
  intent:
    "cardinality restrictions must lift to classical FOL counting axioms preserving the count, the property, and (for QCR) the onClass filter. Phase 1 must NOT silently drop QCR onClass; the lifter emits the FOL form per ADR-007 §7 (∃-bindings + pairwise distinctness for min; ∀(n+1) → pairwise-equality disjunction for max; min ∧ max conjunction for exact). The projector (Phase 2) decides whether the resulting FOL routes to Direct Mapping (when an OWL counterpart exists) or Annotated Approximation (when not).",
  verifiedStatus: "Draft",
};
