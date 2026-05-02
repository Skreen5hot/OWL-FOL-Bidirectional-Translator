/**
 * Phase 1 fixture: Functional, Transitive, Symmetric property characteristics + InverseOf.
 *
 * Status: Draft. Per behavioral spec §5.2:
 *   Functional      → ∀x,y,z. p(x,y) ∧ p(x,z) → y=z
 *   Transitive      → ∀x,y,z. p(x,y) ∧ p(y,z) → p(x,z)
 *   Symmetric       → ∀x,y. p(x,y) → p(y,x)
 *   InverseOf(p,q)  → ∀x,y. p(x,y) ↔ q(y,x)
 *
 * The lifter MUST rewrite recursive symmetry / transitivity axioms with
 * visited-ancestor guards per ADR-011. Cycle-detection correctness is the
 * Phase 1 exit criterion that this fixture targets — query
 * `transitive_pred(a, c)` against `transitive_pred(a,b), transitive_pred(b,c)`
 * MUST terminate.
 */

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
  expectedFOL: "STRUCTURAL_ONLY — exact term-tree shape pinned during Phase 1 implementation. Lifter must emit: (a) functionality axiom for hasIDNumber; (b) cycle-guarded transitivity for ancestorOf; (c) cycle-guarded symmetry for connectedTo; (d) bidirectional implication pair for parentOf/childOf inverse.",
};

export const meta = {
  fixtureId: "p1_property_characteristics",
  intent:
    "Functional/Transitive/Symmetric/InverseOf must lift to the canonical FOL axiom each maps to (per spec §5.2). Recursive characteristics MUST be rewritten with visited-ancestor guards per ADR-011 — naive symmetric/transitive rules loop indefinitely under SLD resolution. Inverse must lift to a biconditional pair, NOT a single-direction subPropertyOf.",
  verifiedStatus: "Draft",
};
