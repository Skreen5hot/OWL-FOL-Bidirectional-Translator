/**
 * Phase 1 fixture: Functional, Transitive, Symmetric property characteristics + InverseOf.
 *
 * Status: Draft. Per behavioral spec §5.2:
 *   Functional      → ∀x,y,z. p(x,y) ∧ p(x,z) → y=z
 *   Transitive      → ∀x,y,z. p(x,y) ∧ p(y,z) → p(x,z)
 *   Symmetric       → ∀x,y. p(x,y) → p(y,x)
 *   InverseOf(p,q)  → ∀x,y. p(x,y) ↔ q(y,x)  (decomposed as bidirectional pair)
 *
 * ============================================================================
 * AMENDMENT AUDIT TRAIL — Step 5 STRUCTURAL_ONLY fill-in, 2026-05-02
 * ============================================================================
 *
 * (a) Placeholder fill-in. The original `expectedFOL` was the architect-
 *     ratified STRUCTURAL_ONLY string ("exact term-tree shape pinned during
 *     Phase 1 implementation. Lifter must emit: (a) functionality axiom for
 *     hasIDNumber; (b) cycle-guarded transitivity for ancestorOf;
 *     (c) cycle-guarded symmetry for connectedTo; (d) bidirectional
 *     implication pair for parentOf/childOf inverse."). Step 5 fills in
 *     the byte-exact form.
 *
 * (b) Layer-translation decision (anticipated ADR-007). Spec §5.4 says
 *     "the lifter rewrites these axioms to thread visited-ancestor lists,
 *     guaranteeing termination on finite graphs." API §4's FOLAxiom union
 *     has no list / visited-ancestor primitive, so the literal lifter-emits-
 *     visited-list reading is impossible at the FOL surface. The pragmatic
 *     reading consistent with spec §6.2's "equivalent encoding" framing
 *     ("An OWL TransitiveObjectProperty declaration is logically equivalent
 *     to its Prolog rule form p(X,Z) :- p(X,Y), p(Y,Z)") is: the FOL term
 *     tree carries the CLASSICAL semantic axiom; the Phase 3 evaluator
 *     (when it lands) translates the FOL state into cycle-guarded Prolog
 *     rules at ingestion time per ADR-011's visited-ancestor-list pattern.
 *     The fixture's `intent` "cycle-guarded" framing refers to the
 *     end-to-end semantics (the queries terminate on cyclic graphs),
 *     not to a lifter-internal rewrite to a visited-list FOL term.
 *
 * (c) Spec citation. Behavioral spec §5.2 (axiom injection patterns for
 *     property characteristics) + §5.4 (cycle detection + ADR-011 +
 *     v0.2 SLG tabling upgrade noted) + §6.2 (equivalent encoding
 *     framing). The classical-axiom emission is the spec's equivalent-
 *     encoding form; the Prolog rewrite is the Tau Prolog ingestion.
 *
 * (d) Anticipated ADR-007 reference. Phase 1 exit deliverable per the
 *     architect's banked Skolem-naming-convention ADR commitment.
 *     ADR-007 documents: (1) the layer-translation above (lifter emits
 *     classical FOL; cycle guard is Phase 3 evaluator concern);
 *     (2) the variable-allocator letter sequence (x, y, z, w, v, u,
 *     t, s, r, q, v_n) with fresh allocator per top-level lift;
 *     (3) pairwise i<j emission order for SameIndividual /
 *     DifferentIndividuals / EquivalentClasses / DisjointWith;
 *     (4) fresh-allocator-per-direction in liftBidirectionalSubsumption;
 *     (5) TBox → RBox → ABox processing order in owlToFol;
 *     (6) lexicographic sort for predicate sets in identity machinery;
 *     (7) the cardinality-witness Skolem prefix (Step 7);
 *     (8) the RDFC-1.0 b-node Skolem prefix (Step 6).
 *
 * Internal contract consistency (per AUTHORING_DISCIPLINE.md): the
 * amended `expectedFOL` aligns with the prose in `intent` (modulo the
 * layer-translation explained in (b)) and with manifest's
 * `expectedOutcome.summary`. Promotion gate: this fixture cannot promote
 * Draft → Verified at Phase 1 exit until ADR-007 lands and the layer-
 * translation is architect-ratified.
 * ============================================================================
 */

const HAS_ID = "http://example.org/test/hasIDNumber";
const ANCESTOR = "http://example.org/test/ancestorOf";
const CONNECTED = "http://example.org/test/connectedTo";
const PARENT = "http://example.org/test/parentOf";
const CHILD = "http://example.org/test/childOf";

const VAR_X = { "@type": "fol:Variable", name: "x" };
const VAR_Y = { "@type": "fol:Variable", name: "y" };
const VAR_Z = { "@type": "fol:Variable", name: "z" };

/** @type {object} */
export const fixture = {
  input: {
    ontologyIRI: "http://example.org/test/p1_property_characteristics",
    prefixes: { ex: "http://example.org/test/" },
    tbox: [],
    abox: [],
    rbox: [
      {
        "@type": "ObjectPropertyCharacteristic",
        property: "http://example.org/test/hasIDNumber",
        characteristic: "Functional",
      },
      {
        "@type": "ObjectPropertyCharacteristic",
        property: "http://example.org/test/ancestorOf",
        characteristic: "Transitive",
      },
      {
        "@type": "ObjectPropertyCharacteristic",
        property: "http://example.org/test/connectedTo",
        characteristic: "Symmetric",
      },
      {
        "@type": "InverseObjectProperties",
        first: "http://example.org/test/parentOf",
        second: "http://example.org/test/childOf",
      },
    ],
  },
  expectedFOL: [
    // (a) Functional(hasIDNumber): ∀x,y,z. hasIDNumber(x,y) ∧ hasIDNumber(x,z) → y = z
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Universal",
        variable: "y",
        body: {
          "@type": "fol:Universal",
          variable: "z",
          body: {
            "@type": "fol:Implication",
            antecedent: {
              "@type": "fol:Conjunction",
              conjuncts: [
                { "@type": "fol:Atom", predicate: HAS_ID, arguments: [VAR_X, VAR_Y] },
                { "@type": "fol:Atom", predicate: HAS_ID, arguments: [VAR_X, VAR_Z] },
              ],
            },
            consequent: { "@type": "fol:Equality", left: VAR_Y, right: VAR_Z },
          },
        },
      },
    },
    // (b) Transitive(ancestorOf): ∀x,y,z. ancestorOf(x,y) ∧ ancestorOf(y,z) → ancestorOf(x,z)
    // Cycle-guarded SLD ingestion is Phase 3 evaluator concern (ADR-007).
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Universal",
        variable: "y",
        body: {
          "@type": "fol:Universal",
          variable: "z",
          body: {
            "@type": "fol:Implication",
            antecedent: {
              "@type": "fol:Conjunction",
              conjuncts: [
                { "@type": "fol:Atom", predicate: ANCESTOR, arguments: [VAR_X, VAR_Y] },
                { "@type": "fol:Atom", predicate: ANCESTOR, arguments: [VAR_Y, VAR_Z] },
              ],
            },
            consequent: { "@type": "fol:Atom", predicate: ANCESTOR, arguments: [VAR_X, VAR_Z] },
          },
        },
      },
    },
    // (c) Symmetric(connectedTo): ∀x,y. connectedTo(x,y) → connectedTo(y,x)
    // Cycle-guarded SLD ingestion is Phase 3 evaluator concern (ADR-007).
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Universal",
        variable: "y",
        body: {
          "@type": "fol:Implication",
          antecedent: { "@type": "fol:Atom", predicate: CONNECTED, arguments: [VAR_X, VAR_Y] },
          consequent: { "@type": "fol:Atom", predicate: CONNECTED, arguments: [VAR_Y, VAR_X] },
        },
      },
    },
    // (d) InverseObjectProperties(parentOf, childOf) — bidirectional implication pair.
    // Forward: ∀x,y. parentOf(x,y) → childOf(y,x).
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Universal",
        variable: "y",
        body: {
          "@type": "fol:Implication",
          antecedent: { "@type": "fol:Atom", predicate: PARENT, arguments: [VAR_X, VAR_Y] },
          consequent: { "@type": "fol:Atom", predicate: CHILD, arguments: [VAR_Y, VAR_X] },
        },
      },
    },
    // Reverse (alpha-renamed so the universal still binds 'x' and 'y'):
    //   ∀x,y. childOf(x,y) → parentOf(y,x).
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Universal",
        variable: "y",
        body: {
          "@type": "fol:Implication",
          antecedent: { "@type": "fol:Atom", predicate: CHILD, arguments: [VAR_X, VAR_Y] },
          consequent: { "@type": "fol:Atom", predicate: PARENT, arguments: [VAR_Y, VAR_X] },
        },
      },
    },
  ],
};

export const meta = {
  fixtureId: "p1_property_characteristics",
  intent:
    "Functional/Transitive/Symmetric/InverseOf must lift to the canonical FOL axiom each maps to (per spec §5.2). Recursive characteristics MUST be rewritten with visited-ancestor guards per ADR-011 — naive symmetric/transitive rules loop indefinitely under SLD resolution. The lifter emits classical-FOL semantic axioms; the Phase 3 evaluator translates them into cycle-guarded Prolog rules at ingestion time per ADR-011's visited-ancestor pattern (anticipated ADR-007 documents this layer-translation). Inverse must lift to a biconditional pair, NOT a single-direction subPropertyOf.",
  verifiedStatus: "Draft",
};
