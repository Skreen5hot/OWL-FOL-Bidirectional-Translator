/**
 * FOL Output Type Definitions
 *
 * Per API spec §4 (Output Types — JSON-LD-Shaped FOL Term Tree). Per ADR-017,
 * OFBT emits FOL as a JSON-LD-shaped term tree with explicit `@type`
 * discrimination so it embeds cleanly in Fandaws DP-2 records and works with
 * standard JSON-LD tooling.
 *
 * Pure type definitions — no runtime code.
 */

import type { TypedLiteral } from "./owl-types.js";

// --- §4.1 The FOLAxiom tree ---

export type FOLAxiom =
  | FOLImplication
  | FOLConjunction
  | FOLDisjunction
  | FOLNegation
  | FOLUniversal
  | FOLExistential
  | FOLAtom
  | FOLEquality
  | FOLFalse;

export interface FOLImplication {
  "@type": "fol:Implication";
  antecedent: FOLAxiom;
  consequent: FOLAxiom;
}

export interface FOLConjunction {
  "@type": "fol:Conjunction";
  conjuncts: FOLAxiom[];
}

export interface FOLDisjunction {
  "@type": "fol:Disjunction";
  disjuncts: FOLAxiom[];
}

export interface FOLNegation {
  "@type": "fol:Negation";
  inner: FOLAxiom;
}

export interface FOLUniversal {
  "@type": "fol:Universal";
  variable: string;
  body: FOLAxiom;
}

export interface FOLExistential {
  "@type": "fol:Existential";
  variable: string;
  body: FOLAxiom;
}

export interface FOLAtom {
  "@type": "fol:Atom";
  predicate: string;
  arguments: FOLTerm[];
}

export interface FOLEquality {
  "@type": "fol:Equality";
  left: FOLTerm;
  right: FOLTerm;
}

/**
 * Falsum (⊥). Used as the consequent of disjointness implications:
 *   ∀x. (A(x) ∧ B(x)) → ⊥
 *
 * Not enumerated explicitly in API §4.1's FOLAxiom union but referenced by
 * the Phase 1 corpus (p1_equivalent_and_disjoint_named expects `fol:False`
 * as the consequent of disjointness implications). Treated as a primitive
 * propositional constant rather than a separate axiom type.
 */
export interface FOLFalse {
  "@type": "fol:False";
}

// --- §4.2 FOL terms ---

export type FOLTerm = FOLVariable | FOLConstant | FOLLiteral | FOLTypedLiteral;

export interface FOLVariable {
  "@type": "fol:Variable";
  name: string;
}

export interface FOLConstant {
  "@type": "fol:Constant";
  iri: string;
}

export interface FOLLiteral {
  "@type": "fol:Literal";
  value: TypedLiteral;
}

/**
 * Inline typed-literal term. Used by the Phase 1 ABox lifter for data property
 * assertions where the value is a bare typed literal rather than wrapped in
 * the §4.2 FOLLiteral form. The Phase 1 corpus (p1_abox_assertions) commits
 * to this flatter shape; it is structurally a TypedLiteral with the FOL term
 * discriminator.
 */
export interface FOLTypedLiteral {
  "@type": "fol:TypedLiteral";
  value: string;
  datatype: string;
  language?: string;
}
