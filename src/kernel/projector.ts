/**
 * FOL → OWL Projector (Phase 2 Steps 1-3c)
 *
 * Per API spec §6.2 + behavioral spec §6.1 (three-strategy router) +
 * §7 (audit artifacts) + §8.1 (round-trip parity).
 *
 * IMPLEMENTED (Step 1 — skeleton):
 *   - `folToOwl(axioms, recoveryPayloads?, config?)` exported with the
 *     API §6.2 signature. Async per the API §0.2 I/O profile.
 *   - `prefixes` parameter handling per API §3.10.4: supplied → output
 *     ontology carries the prefix table; omitted → no prefixes key
 *     (canonical full-URI-output shape).
 *   - Structurally-valid ProjectionManifest with placeholder source-
 *     provenance strings + projectorVersion + operatingMode populated.
 *
 * IMPLEMENTED (Step 2 — Direct Mapping single-axiom rules per spec §6.1.1):
 *   - ABox unary atom (named-IRI predicate, single fol:Constant arg) →
 *     ClassAssertion.
 *   - ABox binary atom with both fol:Constant args → ObjectPropertyAssertion.
 *   - ABox binary atom with second arg fol:TypedLiteral → DataPropertyAssertion.
 *   - TBox universal-implication ∀x. C1(x) → C2(x) (single variable, both
 *     sides unary atoms on x) → SubClassOf(C1, C2).
 *   - RBox universal-implication ∀x,y. P(x,y) → P(y,x) → ObjectPropertyCharacteristic
 *     (Symmetric).
 *   - RBox universal-implication ∀x,y,z. P(x,y) ∧ P(y,z) → P(x,z) →
 *     ObjectPropertyCharacteristic(Transitive).
 *
 * IMPLEMENTED (Step 3c — reserved-predicate ABox + remaining TBox/RBox forms):
 *   - Identity-axiomatization SUPPRESSION pre-pass: detects the lifter's
 *     library-injected identity-machinery axioms (per spec §5.5.1-§5.5.2)
 *     and drops them from the projected output. The dropped shapes:
 *     - `∀x. owl:sameAs(x,x)` (reflexivity)
 *     - `∀x,y. owl:sameAs(x,y) → owl:sameAs(y,x)` (sameAs symmetry — would
 *       otherwise round-trip as Symmetric(owl:sameAs))
 *     - `∀x,y,z. owl:sameAs(x,y) ∧ owl:sameAs(y,z) → owl:sameAs(x,z)`
 *       (sameAs transitivity)
 *     - `∀x,y. owl:differentFrom(x,y) → owl:differentFrom(y,x)`
 *       (differentFrom symmetry)
 *     - Per-predicate identity-rewrite rules (unary + binary first-arg +
 *       binary second-arg variants) that propagate sameAs through other
 *     atoms.
 *   - SameIndividual / DifferentIndividuals reconstruction: atoms on the
 *     reserved owl:sameAs / owl:differentFrom predicates with constant
 *     arguments emit pairwise SameIndividual([a, b]) /
 *     DifferentIndividuals([a, b]) ABox axioms.
 *   - RBox SubObjectPropertyOf(P, Q): single-axiom from
 *     `∀x,y. P(x,y) → Q(x,y)` (binary→binary same-args universal-implication
 *     with different predicates).
 *   - RBox EquivalentObjectProperties(P, Q): pair-matched from a converse
 *     SubObjectPropertyOf pair (P→Q and Q→P).
 *   - RBox DisjointObjectProperties(P, Q): single-axiom from
 *     `∀x,y. (P(x,y) ∧ Q(x,y)) → ⊥` (binary version of DisjointWith with
 *     different conjunct predicates).
 *   - ClassDefinition: NOT separately detected. The lifter emits
 *     ClassDefinition with the same FOL shape as EquivalentClasses[NamedClass,
 *     expression] (per `liftBidirectionalSubsumption`). For the simple
 *     ClassDefinition(iri, NamedClass) case the projector emits
 *     EquivalentClasses correctly. For ClassDefinition(iri, ClassExpression)
 *     where the expression is non-NamedClass (e.g., ObjectIntersectionOf),
 *     the lifted reverse direction has class-expression-in-subClass position
 *     which the Step 3b pair-matcher does not yet handle — the forward
 *     direction emits as a single SubClassOf and the reverse direction is
 *     silently dropped. Phase 1 corpus does not exercise this case;
 *     re-activating round-trip parity for the non-NamedClass case requires
 *     extending `matchSubClassOfWithExpression` + `matchEquivalentClassesPair`
 *     to recursive-reconstruct both antecedent and consequent. Banked for a
 *     follow-up Step when corpus surfaces a ClassDefinition fixture.
 *
 * IMPLEMENTED (Step 3b — class-expression reconstruction in SubClassOf consequent):
 *   - Recursive reconstructClassExpression(folShape, contextVar) handles:
 *     - fol:Atom arity-1 on contextVar → {@type:Class, iri}
 *     - fol:Conjunction of class-expression-shaped conjuncts → ObjectIntersectionOf
 *     - fol:Disjunction of class-expression-shaped disjuncts → ObjectUnionOf
 *     - fol:Negation of a class-expression-shaped inner → ObjectComplementOf
 *     - fol:Existential { variable: y, body: fol:Conjunction([P(x,y), filler-on-y]) }
 *       → Restriction { onProperty: P, someValuesFrom: <reconstructed filler> }
 *     - fol:Universal { variable: y, body: fol:Implication(P(x,y), filler-on-y) }
 *       → Restriction { onProperty: P, allValuesFrom: <reconstructed filler> }
 *     - fol:Atom { arguments: [contextVar, fol:Constant(individual)] }
 *       → Restriction { onProperty: predicate, hasValue: individual.iri }
 *   - matchSubClassOfWithExpression: outer ∀x. NamedClass(x) → <reconstructed
 *     class expression on x> → SubClassOf(NamedClass, <expression>). Subsumes
 *     the Step 2 strict-NamedClass case as a degenerate; matchUnaryUniversalImplication
 *     remains in the codebase for pair-matching's strict NamedClass-on-both-sides
 *     contract.
 *
 * IMPLEMENTED (Step 3a — pair-matching TBox + remaining single-axiom RBox):
 *   - Two-pass matching: pair-matching first (consumes both halves of a
 *     pair), then single-axiom direct matching over the remaining axioms.
 *   - TBox EquivalentClasses(C1, C2): pair-matched from `∀x. C1(x) → C2(x)`
 *     AND `∀x. C2(x) → C1(x)`. Unmatched halves degrade gracefully to
 *     SubClassOf via Step 2's single-axiom rule.
 *   - TBox DisjointWith(C1, C2): single-axiom from
 *     `∀x. (C1(x) ∧ C2(x)) → fol:False`.
 *   - RBox Functional(P): single-axiom from
 *     `∀x,y,z. (P(x,y) ∧ P(x,z)) → y=z` (equality consequent).
 *   - RBox InverseObjectProperties(P, Q): pair-matched from
 *     `∀x,y. P(x,y) → Q(y,x)` AND `∀x,y. Q(x,y) → P(y,x)`.
 *   - RBox ObjectPropertyDomain(P, D): single-axiom from
 *     `∀x,y. P(x,y) → D(x)` (consequent unary atom binds the FIRST
 *     antecedent variable).
 *   - RBox ObjectPropertyRange(P, R): single-axiom from
 *     `∀x,y. P(x,y) → R(y)` (consequent unary atom binds the SECOND
 *     antecedent variable).
 *
 * NOT in Step 3c (deferred to later Steps):
 *   - Class expressions in subClass (left) position (e.g.,
 *     `SubClassOf(ObjectIntersectionOf(C1, C2), C3)`). Phase 1 corpus does
 *     not exercise this case; if needed, lands as a Step-3 follow-up.
 *   - Class expressions inside EquivalentClasses pair-matching halves
 *     (each half currently must be a unary-atom-on-x SubClassOf shape).
 *   - Cardinality restrictions (min / max / exact + qualified onClass) —
 *     non-Horn shapes that route to Annotated Approximation in Step 4.
 *   - Strategy selection algorithm with tiered fallthrough per spec §6.2 — Step 5.
 *     Until that lands, axioms that don't match any Direct Mapping pattern are
 *     dropped silently from the output. This is a temporary scope-bound
 *     behavior; it does NOT violate the spec §6.2 "no silent strategy-pick"
 *     rule because Step 3a still implements only Direct Mapping — it does not
 *     yet have alternatives to choose between.
 *   - Annotated Approximation strategy + LossSignature emission — Step 4.
 *   - RecoveryPayload content-addressed `@id` — Step 5.
 *   - Property-Chain Realization — Step 6.
 *   - roundTripCheck — Step 7.
 *
 * PURITY. Per ROADMAP cross-cutting Layer Boundaries: this file is Layer 0
 * (kernel) and MUST NOT use any non-deterministic API (no temporal-clock
 * readers, no random sources, no environment / network access). The
 * ProjectionManifest carries placeholder strings where event-time fields
 * will land; later Steps thread those through the composition layer per
 * spec §7.5 (timestamps recorded but excluded from the byte-stability
 * hash).
 *
 * DETERMINISM. Direct Mapping is order-preserving: the projector iterates
 * input axioms in source order and emits to ABox / TBox / RBox buckets in
 * the same order. The 100-run determinism harness extension (Phase 2
 * Step 9 deliverable) re-exercises this contract across all 26 fixtures.
 */

import { LIBRARY_VERSION } from "./version-constants.js";
import type {
  FOLAtom,
  FOLAxiom,
  FOLConjunction,
  FOLImplication,
  FOLTerm,
  FOLUniversal,
} from "./fol-types.js";
import type {
  ABoxAxiom,
  ClassAssertion,
  ClassExpression,
  DataPropertyAssertion,
  DifferentIndividuals,
  DisjointObjectPropertiesAxiom,
  DisjointWithAxiom,
  EquivalentClassesAxiom,
  EquivalentObjectPropertiesAxiom,
  InverseObjectPropertiesAxiom,
  ObjectPropertyAssertion,
  ObjectPropertyCharacteristicAxiom,
  ObjectPropertyDomainAxiom,
  ObjectPropertyRangeAxiom,
  OWLOntology,
  RBoxAxiom,
  SameIndividual,
  SubClassOfAxiom,
  SubObjectPropertyOfAxiom,
  TBoxAxiom,
  TypedLiteral,
} from "./owl-types.js";

// Reserved-predicate IRIs for the identity discipline (spec §5.5.1-§5.5.2).
// Local definitions match the lifter's private constants — mirroring rather
// than cross-importing keeps the projector self-contained.
const OWL_SAME_AS_IRI = "http://www.w3.org/2002/07/owl#sameAs";
const OWL_DIFFERENT_FROM_IRI = "http://www.w3.org/2002/07/owl#differentFrom";

function isReservedIdentityPredicate(iri: string): boolean {
  return iri === OWL_SAME_AS_IRI || iri === OWL_DIFFERENT_FROM_IRI;
}
import type {
  FolToOwlConfig,
  OWLConversionResult,
  ProjectionManifest,
  RecoveryPayload,
} from "./projector-types.js";

/**
 * Project FOL axioms back to OWL.
 *
 * Per API §6.2 contract. The `recoveryPayloads` parameter is optional but
 * recommended in round-trip flows: it carries the FOL forms of reversible
 * approximations needed for parity per behavioral spec §7.3. Step 2's
 * pattern-match accepts the parameter without yet routing its content;
 * later Steps inject Recovery Payload contents back into the projected
 * ontology via the strategy router.
 *
 * The `config.prefixes` field controls the surface form of IRIs in the
 * output (API §3.10.4): supplied → output ontology carries the prefix
 * table; omitted → output is canonical full-URI form.
 */
export async function folToOwl(
  axioms: FOLAxiom[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  recoveryPayloads?: RecoveryPayload[],
  config?: FolToOwlConfig,
): Promise<OWLConversionResult> {
  // Step 3a-3c: three-pass matching with source-position-keyed output.
  //
  // Pass 0 (Step 3c): identity-axiomatization SUPPRESSION. The lifter
  // injects library-managed axioms for the owl:sameAs / owl:differentFrom
  // identity discipline (per spec §5.5.1-§5.5.2) — reflexivity, symmetry,
  // transitivity for sameAs; symmetry for differentFrom; per-predicate
  // identity-rewrite rules. These are NOT user-authored axioms; the
  // projector marks them consumed so they do not surface as
  // ObjectPropertyCharacteristic axioms on reserved predicates in the
  // projected output.
  //
  // Pass 1 (Step 3a): pair-matching for axioms whose canonical OWL form
  // spans two FOL axioms (EquivalentClasses, InverseObjectProperties,
  // EquivalentObjectProperties).
  //
  // Pass 2 (Step 2-3b-3c): single-axiom Direct Mapping over unconsumed
  // axioms.
  //
  // Distribution pass walks positions in ascending order, preserving
  // source order across all output paths.
  //
  // Pass-ordering is load-bearing:
  //   - Identity-axiomatization SUPPRESSION must run before pair-matching
  //     because the sameAs symmetry axiom shape would pair with a
  //     hypothetical differentFrom counterpart as InverseObjectProperties
  //     (or otherwise misfire).
  //   - Pair-matching MUST run before single-axiom matching because each
  //     half of an EquivalentClasses pair individually matches the
  //     SubClassOf single-axiom rule.
  //
  // Determinism: pairs are matched in source order with strict left-to-right
  // sweep (i, j) where i < j. The first valid pair wins; the pair's output
  // is recorded at position i (the earlier source index of the two halves).
  const positioned: Array<DirectMatch | null> = new Array(axioms.length).fill(null);
  const consumed = new Set<number>();

  // Pass 0 — identity-axiomatization suppression.
  for (let i = 0; i < axioms.length; i++) {
    if (isIdentityAxiomatizationAxiom(axioms[i])) {
      consumed.add(i);
    }
  }

  // Pass 1 — pair-matching.
  for (let i = 0; i < axioms.length; i++) {
    if (consumed.has(i)) continue;
    for (let j = i + 1; j < axioms.length; j++) {
      if (consumed.has(j)) continue;
      const pair =
        matchEquivalentClassesPair(axioms[i], axioms[j]) ??
        matchInverseObjectPropertiesPair(axioms[i], axioms[j]) ??
        matchEquivalentObjectPropertiesPair(axioms[i], axioms[j]);
      if (pair) {
        positioned[i] = pair;
        consumed.add(i);
        consumed.add(j);
        break;
      }
    }
  }

  // Pass 2 — single-axiom Direct Mapping. Patterns that don't match any
  // Direct Mapping shape are dropped silently for now; Step 4-5 routes
  // them to Annotated Approximation.
  for (let i = 0; i < axioms.length; i++) {
    if (consumed.has(i)) continue;
    const direct = projectDirectMapping(axioms[i]);
    if (direct) positioned[i] = direct;
  }

  // Distribution pass — walk source positions in ascending order, emitting
  // each match into its bucket. Skipped indices (consumed pair-halves OR
  // unmatched axioms) contribute nothing.
  const tbox: TBoxAxiom[] = [];
  const abox: ABoxAxiom[] = [];
  const rbox: RBoxAxiom[] = [];
  for (let i = 0; i < axioms.length; i++) {
    const m = positioned[i];
    if (!m) continue;
    switch (m.kind) {
      case "tbox":
        tbox.push(m.axiom);
        break;
      case "abox":
        abox.push(m.axiom);
        break;
      case "rbox":
        rbox.push(m.axiom);
        break;
    }
  }

  const ontology: OWLOntology = {
    ontologyIRI: "",
    prefixes: config?.prefixes,
    tbox,
    abox,
    rbox,
  };
  if (config?.prefixes === undefined) {
    delete ontology.prefixes;
  }

  const manifest: ProjectionManifest = buildSkeletonManifest(config);

  return {
    ontology,
    manifest,
    newRecoveryPayloads: [],
    newLossSignatures: [],
  };
}

// ===========================================================================
// Direct Mapping pattern-match (spec §6.1.1)
// ===========================================================================

type DirectMatch =
  | { kind: "tbox"; axiom: TBoxAxiom }
  | { kind: "abox"; axiom: ABoxAxiom }
  | { kind: "rbox"; axiom: RBoxAxiom };

function projectDirectMapping(axiom: FOLAxiom): DirectMatch | null {
  // Pattern A: bare fol:Atom — ABox class / object-property / data-property
  // assertion.
  if (axiom["@type"] === "fol:Atom") {
    return projectAtomAsAssertion(axiom);
  }

  // Pattern B: fol:Universal at the top level — TBox SubClassOf or RBox
  // property characteristic. The lifter emits these axioms with the variable
  // bindings stacked outermost.
  if (axiom["@type"] === "fol:Universal") {
    return projectUniversalAxiom(axiom);
  }

  return null;
}

// ---- ABox patterns ----

function projectAtomAsAssertion(atom: FOLAtom): DirectMatch | null {
  if (!isNamedIRI(atom.predicate)) return null;

  // Reserved-predicate ABox: owl:sameAs / owl:differentFrom atoms with both
  // arguments named-IRI constants project as SameIndividual /
  // DifferentIndividuals pairwise axioms (one per atom; n-ary input lifts to
  // pairwise atoms via the lifter's i<j emission, and each pair projects
  // back as a 2-individual axiom of the corresponding kind).
  if (
    isReservedIdentityPredicate(atom.predicate) &&
    atom.arguments.length === 2
  ) {
    const a0 = atom.arguments[0];
    const a1 = atom.arguments[1];
    if (
      a0["@type"] === "fol:Constant" &&
      a1["@type"] === "fol:Constant" &&
      isNamedIRI(a0.iri) &&
      isNamedIRI(a1.iri)
    ) {
      if (atom.predicate === OWL_SAME_AS_IRI) {
        const si: SameIndividual = {
          "@type": "SameIndividual",
          individuals: [a0.iri, a1.iri],
        };
        return { kind: "abox", axiom: si };
      }
      const di: DifferentIndividuals = {
        "@type": "DifferentIndividuals",
        individuals: [a0.iri, a1.iri],
      };
      return { kind: "abox", axiom: di };
    }
    return null;
  }

  if (atom.arguments.length === 1) {
    const a0 = atom.arguments[0];
    if (a0["@type"] === "fol:Constant" && isNamedIRI(a0.iri)) {
      const ca: ClassAssertion = {
        "@type": "ClassAssertion",
        individual: a0.iri,
        class: { "@type": "Class", iri: atom.predicate },
      };
      return { kind: "abox", axiom: ca };
    }
    return null;
  }

  if (atom.arguments.length === 2) {
    const a0 = atom.arguments[0];
    const a1 = atom.arguments[1];

    // ObjectPropertyAssertion: both args are named-IRI constants.
    if (
      a0["@type"] === "fol:Constant" &&
      a1["@type"] === "fol:Constant" &&
      isNamedIRI(a0.iri) &&
      isNamedIRI(a1.iri)
    ) {
      const opa: ObjectPropertyAssertion = {
        "@type": "ObjectPropertyAssertion",
        property: atom.predicate,
        source: a0.iri,
        target: a1.iri,
      };
      return { kind: "abox", axiom: opa };
    }

    // DataPropertyAssertion: first arg constant, second arg typed literal.
    if (
      a0["@type"] === "fol:Constant" &&
      isNamedIRI(a0.iri) &&
      a1["@type"] === "fol:TypedLiteral"
    ) {
      const value: TypedLiteral = {
        "@value": a1.value,
        "@type": a1.datatype,
        ...(a1.language !== undefined ? { "@language": a1.language } : {}),
      };
      const dpa: DataPropertyAssertion = {
        "@type": "DataPropertyAssertion",
        property: atom.predicate,
        source: a0.iri,
        value,
      };
      return { kind: "abox", axiom: dpa };
    }

    return null;
  }

  return null;
}

// ---- TBox + RBox universal-implication patterns ----

function projectUniversalAxiom(u: FOLUniversal): DirectMatch | null {
  // ∀x. (C1(x) ∧ C2(x)) → ⊥ — DisjointWith. Single-universal level.
  const disjoint = matchDisjointWith(u);
  if (disjoint) {
    return { kind: "tbox", axiom: disjoint };
  }

  // ∀x. C(x) → <class expression on x> — TBox SubClassOf. Subsumes the
  // Step 2 strict NamedClass-on-both-sides case (the trivial reconstruction
  // of an unary atom returns a NamedClass) and extends to Step 3b's full
  // class-expression recursion in the consequent (intersection / union /
  // complement / restrictions someValuesFrom / allValuesFrom / hasValue).
  const subClassWithExpr = matchSubClassOfWithExpression(u);
  if (subClassWithExpr) {
    return { kind: "tbox", axiom: subClassWithExpr };
  }

  // ∀x,y. P(x,y) → D(x) — ObjectPropertyDomain (consequent unary atom on
  // the FIRST antecedent variable).
  const domain = matchObjectPropertyDomain(u);
  if (domain) {
    return { kind: "rbox", axiom: domain };
  }

  // ∀x,y. P(x,y) → R(y) — ObjectPropertyRange (consequent unary atom on
  // the SECOND antecedent variable).
  const range = matchObjectPropertyRange(u);
  if (range) {
    return { kind: "rbox", axiom: range };
  }

  // ∀x,y. (P(x,y) ∧ Q(x,y)) → ⊥ — DisjointObjectProperties (binary version
  // of DisjointWith with different conjunct predicates).
  const disjointProps = matchDisjointObjectProperties(u);
  if (disjointProps) {
    return { kind: "rbox", axiom: disjointProps };
  }

  // ∀x,y. P(x,y) → Q(x,y) — SubObjectPropertyOf (different predicates).
  // Must run AFTER Domain/Range (which have unary consequents) and BEFORE
  // Symmetric (which has same-predicate-with-swapped-args).
  const subProperty = matchSubObjectPropertyOf(u);
  if (subProperty) {
    return { kind: "rbox", axiom: subProperty };
  }

  // ∀x,y. P(x,y) → P(y,x) — Symmetric.
  const symmetric = matchSymmetricRule(u);
  if (symmetric) {
    return { kind: "rbox", axiom: symmetric };
  }

  // ∀x,y,z. P(x,y) ∧ P(x,z) → y=z — Functional.
  const functional = matchFunctionalRule(u);
  if (functional) {
    return { kind: "rbox", axiom: functional };
  }

  // ∀x,y,z. P(x,y) ∧ P(y,z) → P(x,z) — Transitive.
  const transitive = matchTransitiveRule(u);
  if (transitive) {
    return { kind: "rbox", axiom: transitive };
  }

  return null;
}

interface UnaryUniversalMatch {
  subClassIRI: string;
  superClassIRI: string;
}

function matchUnaryUniversalImplication(u: FOLUniversal): UnaryUniversalMatch | null {
  // Shape: { "@type": "fol:Universal", variable: <X>, body: {
  //   "@type": "fol:Implication", antecedent: Atom(C1, X), consequent: Atom(C2, X)
  // } }
  const x = u.variable;
  const body = u.body;
  if (body["@type"] !== "fol:Implication") return null;
  const ant = body.antecedent;
  const con = body.consequent;
  if (ant["@type"] !== "fol:Atom" || con["@type"] !== "fol:Atom") return null;
  if (!isUnaryAtomOnVariable(ant, x)) return null;
  if (!isUnaryAtomOnVariable(con, x)) return null;
  if (!isNamedIRI(ant.predicate) || !isNamedIRI(con.predicate)) return null;
  return { subClassIRI: ant.predicate, superClassIRI: con.predicate };
}

function matchSymmetricRule(u: FOLUniversal): ObjectPropertyCharacteristicAxiom | null {
  // Shape: ∀x. ∀y. P(x,y) → P(y,x)
  const x = u.variable;
  if (u.body["@type"] !== "fol:Universal") return null;
  const inner = u.body;
  const y = inner.variable;
  if (x === y) return null;
  if (inner.body["@type"] !== "fol:Implication") return null;
  const impl = inner.body;
  if (impl.antecedent["@type"] !== "fol:Atom") return null;
  if (impl.consequent["@type"] !== "fol:Atom") return null;
  const ant = impl.antecedent;
  const con = impl.consequent;
  if (ant.predicate !== con.predicate) return null;
  if (!isNamedIRI(ant.predicate)) return null;
  if (!isBinaryAtomOnVariables(ant, x, y)) return null;
  if (!isBinaryAtomOnVariables(con, y, x)) return null;
  return {
    "@type": "ObjectPropertyCharacteristic",
    property: ant.predicate,
    characteristic: "Symmetric",
  };
}

function matchDisjointWith(u: FOLUniversal): DisjointWithAxiom | null {
  // Shape: ∀x. (C1(x) ∧ C2(x)) → fol:False
  const x = u.variable;
  if (u.body["@type"] !== "fol:Implication") return null;
  const impl = u.body;
  if (impl.consequent["@type"] !== "fol:False") return null;
  if (impl.antecedent["@type"] !== "fol:Conjunction") return null;
  const conj = impl.antecedent;
  if (conj.conjuncts.length !== 2) return null;
  const c0 = conj.conjuncts[0];
  const c1 = conj.conjuncts[1];
  if (c0["@type"] !== "fol:Atom" || c1["@type"] !== "fol:Atom") return null;
  if (!isUnaryAtomOnVariable(c0, x) || !isUnaryAtomOnVariable(c1, x)) return null;
  if (!isNamedIRI(c0.predicate) || !isNamedIRI(c1.predicate)) return null;
  return {
    "@type": "DisjointWith",
    classes: [
      { "@type": "Class", iri: c0.predicate },
      { "@type": "Class", iri: c1.predicate },
    ],
  };
}

function matchObjectPropertyDomain(u: FOLUniversal): ObjectPropertyDomainAxiom | null {
  // Shape: ∀x. ∀y. P(x,y) → D(x)
  const x = u.variable;
  if (u.body["@type"] !== "fol:Universal") return null;
  const inner = u.body;
  const y = inner.variable;
  if (x === y) return null;
  if (inner.body["@type"] !== "fol:Implication") return null;
  const impl = inner.body;
  if (impl.antecedent["@type"] !== "fol:Atom") return null;
  if (impl.consequent["@type"] !== "fol:Atom") return null;
  const ant = impl.antecedent;
  const con = impl.consequent;
  if (!isBinaryAtomOnVariables(ant, x, y)) return null;
  if (!isUnaryAtomOnVariable(con, x)) return null;
  if (!isNamedIRI(ant.predicate) || !isNamedIRI(con.predicate)) return null;
  // Domain and Range have nearly identical antecedent shapes; the
  // distinguishing feature is which antecedent variable the consequent's
  // unary atom binds. Domain: first antecedent variable. Range: second.
  return {
    "@type": "ObjectPropertyDomain",
    property: ant.predicate,
    domain: { "@type": "Class", iri: con.predicate },
  };
}

function matchObjectPropertyRange(u: FOLUniversal): ObjectPropertyRangeAxiom | null {
  // Shape: ∀x. ∀y. P(x,y) → R(y)
  const x = u.variable;
  if (u.body["@type"] !== "fol:Universal") return null;
  const inner = u.body;
  const y = inner.variable;
  if (x === y) return null;
  if (inner.body["@type"] !== "fol:Implication") return null;
  const impl = inner.body;
  if (impl.antecedent["@type"] !== "fol:Atom") return null;
  if (impl.consequent["@type"] !== "fol:Atom") return null;
  const ant = impl.antecedent;
  const con = impl.consequent;
  if (!isBinaryAtomOnVariables(ant, x, y)) return null;
  if (!isUnaryAtomOnVariable(con, y)) return null;
  if (!isNamedIRI(ant.predicate) || !isNamedIRI(con.predicate)) return null;
  return {
    "@type": "ObjectPropertyRange",
    property: ant.predicate,
    range: { "@type": "Class", iri: con.predicate },
  };
}

function matchFunctionalRule(u: FOLUniversal): ObjectPropertyCharacteristicAxiom | null {
  // Shape: ∀x. ∀y. ∀z. (P(x,y) ∧ P(x,z)) → y=z
  const x = u.variable;
  if (u.body["@type"] !== "fol:Universal") return null;
  const middle = u.body;
  const y = middle.variable;
  if (middle.body["@type"] !== "fol:Universal") return null;
  const inner = middle.body;
  const z = inner.variable;
  if (x === y || y === z || x === z) return null;
  if (inner.body["@type"] !== "fol:Implication") return null;
  const impl = inner.body;
  if (impl.antecedent["@type"] !== "fol:Conjunction") return null;
  const conj = impl.antecedent;
  if (conj.conjuncts.length !== 2) return null;
  const c0 = conj.conjuncts[0];
  const c1 = conj.conjuncts[1];
  if (c0["@type"] !== "fol:Atom" || c1["@type"] !== "fol:Atom") return null;
  if (impl.consequent["@type"] !== "fol:Equality") return null;
  const eq = impl.consequent;
  if (c0.predicate !== c1.predicate) return null;
  if (!isNamedIRI(c0.predicate)) return null;
  if (!isBinaryAtomOnVariables(c0, x, y)) return null;
  if (!isBinaryAtomOnVariables(c1, x, z)) return null;
  if (!isVariableNamed(eq.left, y) || !isVariableNamed(eq.right, z)) return null;
  return {
    "@type": "ObjectPropertyCharacteristic",
    property: c0.predicate,
    characteristic: "Functional",
  };
}

function matchTransitiveRule(u: FOLUniversal): ObjectPropertyCharacteristicAxiom | null {
  // Shape: ∀x. ∀y. ∀z. (P(x,y) ∧ P(y,z)) → P(x,z)
  const x = u.variable;
  if (u.body["@type"] !== "fol:Universal") return null;
  const middle = u.body;
  const y = middle.variable;
  if (middle.body["@type"] !== "fol:Universal") return null;
  const inner = middle.body;
  const z = inner.variable;
  if (x === y || y === z || x === z) return null;
  if (inner.body["@type"] !== "fol:Implication") return null;
  const impl: FOLImplication = inner.body;
  if (impl.antecedent["@type"] !== "fol:Conjunction") return null;
  const conj: FOLConjunction = impl.antecedent;
  if (conj.conjuncts.length !== 2) return null;
  const c0 = conj.conjuncts[0];
  const c1 = conj.conjuncts[1];
  if (c0["@type"] !== "fol:Atom" || c1["@type"] !== "fol:Atom") return null;
  if (impl.consequent["@type"] !== "fol:Atom") return null;
  const con = impl.consequent;
  if (c0.predicate !== c1.predicate || c0.predicate !== con.predicate) return null;
  if (!isNamedIRI(c0.predicate)) return null;
  if (!isBinaryAtomOnVariables(c0, x, y)) return null;
  if (!isBinaryAtomOnVariables(c1, y, z)) return null;
  if (!isBinaryAtomOnVariables(con, x, z)) return null;
  return {
    "@type": "ObjectPropertyCharacteristic",
    property: c0.predicate,
    characteristic: "Transitive",
  };
}

// ---- Step 3b: SubClassOf with class-expression consequent reconstruction ----

function matchSubClassOfWithExpression(u: FOLUniversal): SubClassOfAxiom | null {
  // Shape: ∀x. C_outer(x) → <class expression on x>
  // The outer wrapper is a single fol:Universal whose body is fol:Implication.
  // Multi-level universal stacks (e.g., Domain/Range/Symmetric/Transitive/
  // Functional/Inverse) have an outer body of fol:Universal, NOT fol:Implication
  // — so they don't false-positive here.
  const x = u.variable;
  if (u.body["@type"] !== "fol:Implication") return null;
  const impl = u.body;

  // Antecedent must be a unary atom on x (NamedClass on the left). Class
  // expressions in subClass position (intersection/union/etc.) are Step 3c
  // territory.
  if (impl.antecedent["@type"] !== "fol:Atom") return null;
  const ant = impl.antecedent;
  if (!isUnaryAtomOnVariable(ant, x)) return null;
  if (!isNamedIRI(ant.predicate)) return null;

  // Consequent reconstructs recursively to a class expression.
  const superExpr = reconstructClassExpression(impl.consequent, x);
  if (!superExpr) return null;

  return {
    "@type": "SubClassOf",
    subClass: { "@type": "Class", iri: ant.predicate },
    superClass: superExpr,
  };
}

/**
 * Recursive class-expression reconstruction (Step 3b).
 *
 * Given a FOL shape and the name of the context variable bound by an outer
 * SubClassOf wrapper (or by an outer restriction), produce the OWL
 * ClassExpression whose `liftClassExpression(_, contextVar)` would emit
 * exactly this shape.
 *
 * Returns `null` when the shape doesn't match any recognized
 * class-expression form (the projector then falls through to other matchers,
 * or — pending Step 4 — silently drops the axiom).
 */
function reconstructClassExpression(
  shape: FOLAxiom,
  contextVar: string,
): ClassExpression | null {
  // NamedClass: fol:Atom arity-1 on contextVar.
  if (shape["@type"] === "fol:Atom") {
    if (
      shape.arguments.length === 1 &&
      isVariableNamed(shape.arguments[0], contextVar) &&
      isNamedIRI(shape.predicate)
    ) {
      return { "@type": "Class", iri: shape.predicate };
    }
    // ObjectHasValue: fol:Atom { arguments: [contextVar, fol:Constant] }.
    if (
      shape.arguments.length === 2 &&
      isVariableNamed(shape.arguments[0], contextVar) &&
      shape.arguments[1]["@type"] === "fol:Constant" &&
      isNamedIRI(shape.predicate) &&
      isNamedIRI(shape.arguments[1].iri)
    ) {
      return {
        "@type": "Restriction",
        onProperty: shape.predicate,
        hasValue: shape.arguments[1].iri,
      };
    }
    return null;
  }

  // ObjectIntersectionOf: fol:Conjunction of class-expression-shaped conjuncts.
  if (shape["@type"] === "fol:Conjunction") {
    if (shape.conjuncts.length < 2) return null;
    const reconstructed: ClassExpression[] = [];
    for (const c of shape.conjuncts) {
      const r = reconstructClassExpression(c, contextVar);
      if (!r) return null;
      reconstructed.push(r);
    }
    return { "@type": "ObjectIntersectionOf", classes: reconstructed };
  }

  // ObjectUnionOf: fol:Disjunction of class-expression-shaped disjuncts.
  if (shape["@type"] === "fol:Disjunction") {
    if (shape.disjuncts.length < 2) return null;
    const reconstructed: ClassExpression[] = [];
    for (const d of shape.disjuncts) {
      const r = reconstructClassExpression(d, contextVar);
      if (!r) return null;
      reconstructed.push(r);
    }
    return { "@type": "ObjectUnionOf", classes: reconstructed };
  }

  // ObjectComplementOf: fol:Negation of a class-expression-shaped inner.
  if (shape["@type"] === "fol:Negation") {
    const inner = reconstructClassExpression(shape.inner, contextVar);
    if (!inner) return null;
    return { "@type": "ObjectComplementOf", class: inner };
  }

  // ObjectSomeValuesFrom: fol:Existential { variable: y, body:
  //   fol:Conjunction([P(contextVar, y), filler-on-y]) }
  if (shape["@type"] === "fol:Existential") {
    const innerVar = shape.variable;
    if (innerVar === contextVar) return null;
    if (shape.body["@type"] !== "fol:Conjunction") return null;
    const conj = shape.body;
    if (conj.conjuncts.length !== 2) return null;
    const propAtom = conj.conjuncts[0];
    const filler = conj.conjuncts[1];
    if (propAtom["@type"] !== "fol:Atom") return null;
    if (!isBinaryAtomOnVariables(propAtom, contextVar, innerVar)) return null;
    if (!isNamedIRI(propAtom.predicate)) return null;
    const fillerExpr = reconstructClassExpression(filler, innerVar);
    if (!fillerExpr) return null;
    return {
      "@type": "Restriction",
      onProperty: propAtom.predicate,
      someValuesFrom: fillerExpr,
    };
  }

  // ObjectAllValuesFrom: fol:Universal { variable: y, body:
  //   fol:Implication(P(contextVar, y), filler-on-y) }
  if (shape["@type"] === "fol:Universal") {
    const innerVar = shape.variable;
    if (innerVar === contextVar) return null;
    if (shape.body["@type"] !== "fol:Implication") return null;
    const impl = shape.body;
    if (impl.antecedent["@type"] !== "fol:Atom") return null;
    if (!isBinaryAtomOnVariables(impl.antecedent, contextVar, innerVar)) return null;
    if (!isNamedIRI(impl.antecedent.predicate)) return null;
    const fillerExpr = reconstructClassExpression(impl.consequent, innerVar);
    if (!fillerExpr) return null;
    return {
      "@type": "Restriction",
      onProperty: impl.antecedent.predicate,
      allValuesFrom: fillerExpr,
    };
  }

  return null;
}

// ---- Step 3c: SubObjectPropertyOf + DisjointObjectProperties detectors ----

function matchSubObjectPropertyOf(u: FOLUniversal): SubObjectPropertyOfAxiom | null {
  // Shape: ∀x. ∀y. P(x,y) → Q(x,y), with P and Q distinct named IRIs.
  // Distinguishes itself from Symmetric (same predicate with swapped args)
  // and from Domain/Range (unary consequent).
  const x = u.variable;
  if (u.body["@type"] !== "fol:Universal") return null;
  const inner = u.body;
  const y = inner.variable;
  if (x === y) return null;
  if (inner.body["@type"] !== "fol:Implication") return null;
  const impl = inner.body;
  if (impl.antecedent["@type"] !== "fol:Atom") return null;
  if (impl.consequent["@type"] !== "fol:Atom") return null;
  const ant = impl.antecedent;
  const con = impl.consequent;
  if (!isNamedIRI(ant.predicate) || !isNamedIRI(con.predicate)) return null;
  if (ant.predicate === con.predicate) return null;
  if (!isBinaryAtomOnVariables(ant, x, y)) return null;
  if (!isBinaryAtomOnVariables(con, x, y)) return null;
  return {
    "@type": "SubObjectPropertyOf",
    subProperty: ant.predicate,
    superProperty: con.predicate,
  };
}

function matchDisjointObjectProperties(u: FOLUniversal): DisjointObjectPropertiesAxiom | null {
  // Shape: ∀x. ∀y. (P(x,y) ∧ Q(x,y)) → fol:False, with P and Q distinct
  // named IRIs (the binary analogue of DisjointWith for object properties).
  const x = u.variable;
  if (u.body["@type"] !== "fol:Universal") return null;
  const inner = u.body;
  const y = inner.variable;
  if (x === y) return null;
  if (inner.body["@type"] !== "fol:Implication") return null;
  const impl = inner.body;
  if (impl.consequent["@type"] !== "fol:False") return null;
  if (impl.antecedent["@type"] !== "fol:Conjunction") return null;
  const conj = impl.antecedent;
  if (conj.conjuncts.length !== 2) return null;
  const c0 = conj.conjuncts[0];
  const c1 = conj.conjuncts[1];
  if (c0["@type"] !== "fol:Atom" || c1["@type"] !== "fol:Atom") return null;
  if (!isNamedIRI(c0.predicate) || !isNamedIRI(c1.predicate)) return null;
  if (c0.predicate === c1.predicate) return null;
  if (!isBinaryAtomOnVariables(c0, x, y)) return null;
  if (!isBinaryAtomOnVariables(c1, x, y)) return null;
  return {
    "@type": "DisjointObjectProperties",
    properties: [c0.predicate, c1.predicate],
  };
}

// ---- Step 3c: identity-axiomatization SUPPRESSION filter ----

/**
 * Identify the lifter's library-injected identity-discipline axioms (per
 * spec §5.5.1-§5.5.2) so the projector can drop them rather than
 * round-tripping them as user-authored ObjectPropertyCharacteristic axioms
 * on owl:sameAs / owl:differentFrom predicates. The lifter's
 * `emitIdentityMachinery` produces these shapes:
 *
 *   - `∀x. owl:sameAs(x,x)` (sameAs reflexivity)
 *   - `∀x,y. owl:sameAs(x,y) → owl:sameAs(y,x)` (sameAs symmetry)
 *   - `∀x,y,z. owl:sameAs(x,y) ∧ owl:sameAs(y,z) → owl:sameAs(x,z)`
 *     (sameAs transitivity)
 *   - `∀x,y. owl:differentFrom(x,y) → owl:differentFrom(y,x)`
 *     (differentFrom symmetry)
 *   - Per-predicate identity-rewrite rules for unary and binary predicates.
 */
function isIdentityAxiomatizationAxiom(axiom: FOLAxiom): boolean {
  if (axiom["@type"] !== "fol:Universal") return false;

  // ∀x. owl:sameAs(x,x) — reflexivity.
  if (
    axiom.body["@type"] === "fol:Atom" &&
    axiom.body.predicate === OWL_SAME_AS_IRI &&
    axiom.body.arguments.length === 2 &&
    isVariableNamed(axiom.body.arguments[0], axiom.variable) &&
    isVariableNamed(axiom.body.arguments[1], axiom.variable)
  ) {
    return true;
  }

  // 2-level universals: sameAs/differentFrom symmetry, unary identity-rewrite.
  if (axiom.body["@type"] === "fol:Universal") {
    const x = axiom.variable;
    const inner = axiom.body;
    const y = inner.variable;
    if (x === y) return false;

    // ∀x,y. P(x,y) → P(y,x) on a reserved predicate — sameAs OR
    // differentFrom symmetry.
    if (
      inner.body["@type"] === "fol:Implication" &&
      inner.body.antecedent["@type"] === "fol:Atom" &&
      inner.body.consequent["@type"] === "fol:Atom" &&
      isReservedIdentityPredicate(inner.body.antecedent.predicate) &&
      inner.body.antecedent.predicate === inner.body.consequent.predicate &&
      isBinaryAtomOnVariables(inner.body.antecedent, x, y) &&
      isBinaryAtomOnVariables(inner.body.consequent, y, x)
    ) {
      return true;
    }

    // ∀x,z. P(x) ∧ owl:sameAs(x,z) → P(z) — unary identity-rewrite.
    if (
      inner.body["@type"] === "fol:Implication" &&
      inner.body.antecedent["@type"] === "fol:Conjunction" &&
      inner.body.consequent["@type"] === "fol:Atom"
    ) {
      const conj = inner.body.antecedent;
      if (conj.conjuncts.length === 2) {
        const c0 = conj.conjuncts[0];
        const c1 = conj.conjuncts[1];
        if (
          c0["@type"] === "fol:Atom" &&
          c1["@type"] === "fol:Atom" &&
          c1.predicate === OWL_SAME_AS_IRI &&
          isUnaryAtomOnVariable(c0, x) &&
          isBinaryAtomOnVariables(c1, x, y) &&
          isUnaryAtomOnVariable(inner.body.consequent, y) &&
          c0.predicate === inner.body.consequent.predicate
        ) {
          return true;
        }
      }
    }
  }

  // 3-level universals: sameAs transitivity, binary identity-rewrites.
  if (
    axiom.body["@type"] === "fol:Universal" &&
    axiom.body.body["@type"] === "fol:Universal"
  ) {
    const x = axiom.variable;
    const y = axiom.body.variable;
    const z = axiom.body.body.variable;
    if (x === y || y === z || x === z) return false;
    if (axiom.body.body.body["@type"] !== "fol:Implication") return false;
    const impl = axiom.body.body.body;
    if (impl.antecedent["@type"] !== "fol:Conjunction") return false;
    const conj = impl.antecedent;
    if (conj.conjuncts.length !== 2) return false;
    const c0 = conj.conjuncts[0];
    const c1 = conj.conjuncts[1];
    if (
      c0["@type"] !== "fol:Atom" ||
      c1["@type"] !== "fol:Atom" ||
      impl.consequent["@type"] !== "fol:Atom"
    ) {
      return false;
    }
    const con = impl.consequent;

    // ∀x,y,z. owl:sameAs(x,y) ∧ owl:sameAs(y,z) → owl:sameAs(x,z) — transitivity.
    if (
      c0.predicate === OWL_SAME_AS_IRI &&
      c1.predicate === OWL_SAME_AS_IRI &&
      con.predicate === OWL_SAME_AS_IRI &&
      isBinaryAtomOnVariables(c0, x, y) &&
      isBinaryAtomOnVariables(c1, y, z) &&
      isBinaryAtomOnVariables(con, x, z)
    ) {
      return true;
    }

    // ∀x,y,z. P(x,y) ∧ owl:sameAs(x,z) → P(z,y) — binary first-arg rewrite.
    if (
      c0.predicate !== OWL_SAME_AS_IRI &&
      c1.predicate === OWL_SAME_AS_IRI &&
      con.predicate === c0.predicate &&
      isBinaryAtomOnVariables(c0, x, y) &&
      isBinaryAtomOnVariables(c1, x, z) &&
      isBinaryAtomOnVariables(con, z, y)
    ) {
      return true;
    }

    // ∀x,y,z. P(x,y) ∧ owl:sameAs(y,z) → P(x,z) — binary second-arg rewrite.
    if (
      c0.predicate !== OWL_SAME_AS_IRI &&
      c1.predicate === OWL_SAME_AS_IRI &&
      con.predicate === c0.predicate &&
      isBinaryAtomOnVariables(c0, x, y) &&
      isBinaryAtomOnVariables(c1, y, z) &&
      isBinaryAtomOnVariables(con, x, z)
    ) {
      return true;
    }
  }

  return false;
}

// ---- Pair-matchers (Step 3a + 3c) ----

type PairMatch =
  | { kind: "tbox"; axiom: TBoxAxiom }
  | { kind: "rbox"; axiom: RBoxAxiom };

function matchEquivalentClassesPair(a: FOLAxiom, b: FOLAxiom): PairMatch | null {
  // Each half is a SubClassOf-shaped axiom: ∀x. C1(x) → C2(x). The pair
  // forms EquivalentClasses(C1, C2) when one half is the converse of the
  // other (C1 → C2 paired with C2 → C1).
  if (a["@type"] !== "fol:Universal" || b["@type"] !== "fol:Universal") return null;
  const aMatch = matchUnaryUniversalImplication(a);
  const bMatch = matchUnaryUniversalImplication(b);
  if (!aMatch || !bMatch) return null;
  if (
    aMatch.subClassIRI !== bMatch.superClassIRI ||
    aMatch.superClassIRI !== bMatch.subClassIRI
  ) {
    return null;
  }
  // Self-pair guard: a single axiom of the form ∀x. C(x) → C(x) is not a
  // valid EquivalentClasses pair when matched against itself.
  if (aMatch.subClassIRI === aMatch.superClassIRI) return null;
  const ec: EquivalentClassesAxiom = {
    "@type": "EquivalentClasses",
    classes: [
      { "@type": "Class", iri: aMatch.subClassIRI },
      { "@type": "Class", iri: aMatch.superClassIRI },
    ],
  };
  return { kind: "tbox", axiom: ec };
}

function matchEquivalentObjectPropertiesPair(a: FOLAxiom, b: FOLAxiom): PairMatch | null {
  // Each half is a SubObjectPropertyOf-shaped axiom: ∀x,y. P(x,y) → Q(x,y).
  // The pair forms EquivalentObjectProperties(P, Q) when one half is the
  // converse of the other (P→Q paired with Q→P).
  if (a["@type"] !== "fol:Universal" || b["@type"] !== "fol:Universal") return null;
  const aMatch = matchSubObjectPropertyOf(a);
  const bMatch = matchSubObjectPropertyOf(b);
  if (!aMatch || !bMatch) return null;
  if (
    aMatch.subProperty !== bMatch.superProperty ||
    aMatch.superProperty !== bMatch.subProperty
  ) {
    return null;
  }
  // Self-pair guard (already enforced inside matchSubObjectPropertyOf via
  // distinct-predicate check, but defensive).
  if (aMatch.subProperty === aMatch.superProperty) return null;
  const eqp: EquivalentObjectPropertiesAxiom = {
    "@type": "EquivalentObjectProperties",
    properties: [aMatch.subProperty, aMatch.superProperty],
  };
  return { kind: "rbox", axiom: eqp };
}

function matchInverseObjectPropertiesPair(a: FOLAxiom, b: FOLAxiom): PairMatch | null {
  // Each half is a binary cross-predicate implication after alpha-renaming:
  //   ∀x,y. P(x,y) → Q(y,x)
  //   ∀x,y. Q(x,y) → P(y,x)
  // Per ADR-007 §4 (fresh-allocator-per-direction): both halves use the
  // (x, y) variable binding; the swap is in the consequent's argument
  // order, not in the universally-bound variables.
  if (a["@type"] !== "fol:Universal" || b["@type"] !== "fol:Universal") return null;
  const aMatch = matchBinaryInverseImplication(a);
  const bMatch = matchBinaryInverseImplication(b);
  if (!aMatch || !bMatch) return null;
  if (
    aMatch.firstIRI !== bMatch.secondIRI ||
    aMatch.secondIRI !== bMatch.firstIRI
  ) {
    return null;
  }
  // Self-pair guard against P(x,y)→P(y,x) which is Symmetric, not Inverse.
  if (aMatch.firstIRI === aMatch.secondIRI) return null;
  const inv: InverseObjectPropertiesAxiom = {
    "@type": "InverseObjectProperties",
    first: aMatch.firstIRI,
    second: aMatch.secondIRI,
  };
  return { kind: "rbox", axiom: inv };
}

interface BinaryInverseMatch {
  firstIRI: string;
  secondIRI: string;
}

function matchBinaryInverseImplication(u: FOLUniversal): BinaryInverseMatch | null {
  // Shape: ∀x. ∀y. P(x,y) → Q(y,x)
  const x = u.variable;
  if (u.body["@type"] !== "fol:Universal") return null;
  const inner = u.body;
  const y = inner.variable;
  if (x === y) return null;
  if (inner.body["@type"] !== "fol:Implication") return null;
  const impl = inner.body;
  if (impl.antecedent["@type"] !== "fol:Atom") return null;
  if (impl.consequent["@type"] !== "fol:Atom") return null;
  const ant = impl.antecedent;
  const con = impl.consequent;
  if (!isNamedIRI(ant.predicate) || !isNamedIRI(con.predicate)) return null;
  if (!isBinaryAtomOnVariables(ant, x, y)) return null;
  if (!isBinaryAtomOnVariables(con, y, x)) return null;
  return { firstIRI: ant.predicate, secondIRI: con.predicate };
}

// ---- Term-shape predicates ----

function isUnaryAtomOnVariable(a: FOLAtom, varName: string): boolean {
  if (a.arguments.length !== 1) return false;
  return isVariableNamed(a.arguments[0], varName);
}

function isBinaryAtomOnVariables(a: FOLAtom, var0: string, var1: string): boolean {
  if (a.arguments.length !== 2) return false;
  return isVariableNamed(a.arguments[0], var0) && isVariableNamed(a.arguments[1], var1);
}

function isVariableNamed(t: FOLTerm, varName: string): boolean {
  return t["@type"] === "fol:Variable" && t.name === varName;
}

function isNamedIRI(iri: string): boolean {
  return typeof iri === "string" && iri.length > 0;
}

// ===========================================================================
// ProjectionManifest skeleton
// ===========================================================================

function buildSkeletonManifest(config: FolToOwlConfig | undefined): ProjectionManifest {
  // Per spec §6.1.0.2: ontologyIRI is preserved from source. Step 2 keeps
  // the placeholder strings from Step 1; source-ontology-IRI threading
  // (via config or recoveryPayloads-derived provenance) lands in Step 5
  // alongside the strategy selection algorithm. projectionTimestamp
  // deliberately omitted — kernel stays impurity-free.
  return {
    ontologyIRI: "",
    versionIRI: "",
    projectedFrom: "",
    projectorVersion: `OFBT-${LIBRARY_VERSION}`,
    arcManifestVersion: config?.arcManifestVersion ?? "",
    operatingMode: config?.arcCoverage === "strict" ? "strict" : "permissive",
    activity: {
      used: "",
    },
  };
}
