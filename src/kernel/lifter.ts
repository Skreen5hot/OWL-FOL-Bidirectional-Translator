/**
 * OWL → FOL Lifter (Phase 1, through Step 5)
 *
 * Per API spec §6.1. Async because subsequent steps wire `rdf-canonize` for
 * blank-node canonicalization (Step 6 per phase-1-entry.md sequencing); the
 * Promise contract is established in Step 1 even though current surface
 * does not await anything yet.
 *
 * IMPLEMENTED (Steps 1-4):
 *   - owlToFol skeleton returning Promise<FOLAxiom[]>
 *   - IRI canonicalization on every input IRI per §3.10
 *   - JSON-LD-shaped output type definitions
 *   - §13.1 punted-construct REJECTION FROM DAY ONE per architect's
 *     "build to the canary, not around it"
 *   - ABox: ClassAssertion (any class expression target),
 *     ObjectPropertyAssertion, DataPropertyAssertion, SameIndividual,
 *     DifferentIndividuals
 *   - TBox: SubClassOf, EquivalentClasses, DisjointWith, ClassDefinition
 *   - Class-expression lifting for restrictions someValuesFrom /
 *     allValuesFrom / hasValue, plus intersection / union / complement
 *   - RBox: ObjectPropertyDomain + ObjectPropertyRange CONDITIONAL
 *     translation per API §3.7.1 (HIGH-PRIORITY): emits
 *     ∀x,y. P(x,y) → D(x) for domain, ∀x,y. P(x,y) → R(y) for range.
 *     The lifter MUST NOT emit the existential synthesis form
 *     (∀x. D(x) → ∃y. P(x,y)) — that is the wrong translation per spec
 *     §5.8 / API §3.7.1.2 and the canary_domain_range_existential
 *     fixture asserts its absence.
 *   - Identity machinery per spec §5.5.1-§5.5.2 (Step 4): when the input
 *     contains SameIndividual axioms, the lifter emits owl:sameAs
 *     reflexivity / symmetry / transitivity equivalence axioms PLUS
 *     per-predicate identity-rewrite rules for every class and object-
 *     property predicate used in the ABox. The canary
 *     canary_same_as_propagation asserts the contract behaviorally
 *     (queries on substituted-individual names return 'true'); Step 4
 *     satisfies it structurally (Phase 1 has no evaluator; Phase 3
 *     activates the query path via assertExpectedQueries).
 *     DifferentIndividuals symmetrically emits an owl:differentFrom
 *     symmetry axiom (no reflexivity; differentFrom is irreflexive).
 *     Identity-rewrite rules are NOT emitted for the reserved
 *     owl:sameAs / owl:differentFrom predicates themselves to avoid
 *     trivial-loop rewrites under SLD resolution.
 *
 * IMPLEMENTED (Step 5):
 *   - RBox ObjectPropertyCharacteristic for Functional / Transitive /
 *     Symmetric per spec §5.2 + InverseObjectProperties as bidirectional
 *     implication pair. CLASSICAL FOL emission — cycle-guarded SLD
 *     ingestion (visited-ancestor list per ADR-011) is the Phase 3
 *     evaluator's concern, not the lifter's. The FOL term tree carries
 *     the equivalent encoding per spec §6.2; the Prolog rule rewrite
 *     happens at evaluator-ingestion time. Anticipated ADR-007 documents
 *     this layer-translation alongside the variable-allocator and
 *     pairwise-emission determinism conventions.
 *
 * NOT YET IMPLEMENTED (deferred to Steps 6-9):
 *   - RDFC-1.0 blank-node canonicalization (Step 6)
 *   - Cardinality restrictions (Step 7) — currently throws
 *     UnsupportedConstructError per SME B2 fix
 *   - 100-run determinism harness (Step 9)
 *
 * Unimplemented axiom kinds noop (skip without error) EXCEPT for §13.1
 * punted constructs and cardinality (per SME B2) which throw. CI stays
 * green while later Steps fill in the missing kinds; corpus fixtures
 * whose constructs are not yet implemented are gated by the runner.
 *
 * Pure: no Date, no random, no I/O. The Promise wrapper is for the Step 6
 * rdf-canonize await that Phase 1 ultimately needs.
 */

import { UnsupportedConstructError } from "./errors.js";
import { canonicalizeIRI } from "./iri.js";
import type {
  OWLOntology,
  TBoxAxiom,
  ABoxAxiom,
  RBoxAxiom,
  ClassExpression,
  TypedLiteral,
} from "./owl-types.js";
import type {
  FOLAxiom,
  FOLAtom,
  FOLConstant,
  FOLTypedLiteral,
  FOLTerm,
  FOLVariable,
  FOLUniversal,
  FOLImplication,
  FOLConjunction,
  FOLDisjunction,
  FOLNegation,
  FOLExistential,
  FOLFalse,
} from "./fol-types.js";

/**
 * Lift an OWLOntology to its FOL representation.
 *
 * Step 1 returns: ABox-derived facts only, plus throws on §13.1 punted
 * constructs anywhere in the input. Empty array on inputs whose only
 * content is TBox/RBox (the unimplemented kinds for Step 1).
 */
export async function owlToFol(ontology: OWLOntology): Promise<FOLAxiom[]> {
  // (1) Pre-scan for §13.1 punted constructs. Any detection throws BEFORE
  // any FOL is emitted. This honors the canary contract:
  // canary_punned_construct_rejection expects typed UnsupportedConstructError
  // with the documented `construct` field per case.
  rejectPuntedConstructs(ontology);

  const axioms: FOLAxiom[] = [];
  const prefixes = ontology.prefixes;

  // (2) TBox lifting (Step 2). Source order is preserved, which matches
  // the Phase 1 corpus's expected output order.
  for (const t of ontology.tbox) {
    const lifted = liftTBoxAxiom(t, prefixes);
    if (lifted) axioms.push(...lifted);
  }

  // (3) RBox lifting (Step 3 = ObjectPropertyDomain + ObjectPropertyRange;
  // remaining RBox kinds noop until Step 5). RBox is processed AFTER TBox
  // and BEFORE ABox per the Phase 1 corpus's expected output order
  // (p1_prov_domain_range emits domain+range universals before the
  // property fact).
  for (const r of ontology.rbox) {
    const lifted = liftRBoxAxiom(r, prefixes);
    if (lifted) axioms.push(...lifted);
  }

  // (4) ABox lifting (Step 1). Direct rules per spec §5.1 / API §3.5.
  for (const a of ontology.abox) {
    const lifted = liftABoxAxiom(a, prefixes);
    if (lifted) axioms.push(...lifted);
  }

  // (5) Identity machinery (Step 4) per spec §5.5.1-§5.5.2. Emitted AFTER
  // ABox so the bare sameAs/differentFrom facts and any object/data property
  // facts already exist; the equivalence axioms + per-predicate rewrite
  // rules apply to them. Skipped when the input does not declare any
  // SameIndividual / DifferentIndividuals (no identity to propagate).
  axioms.push(...emitIdentityMachinery(ontology));

  return axioms;
}

// ---------------------------------------------------------------------------
// §13.1 Punted-construct detection
// ---------------------------------------------------------------------------

function rejectPuntedConstructs(ontology: OWLOntology): void {
  // (a) owl:hasKey — TBox
  for (const t of ontology.tbox) {
    if ((t as { "@type": string })["@type"] === "HasKey") {
      throw new UnsupportedConstructError(
        "owl:hasKey is a v0.1 punted construct per spec §13.1",
        { construct: "owl:hasKey" }
      );
    }
  }

  // (b) NegativeObjectPropertyAssertion / NegativeDataPropertyAssertion — ABox
  for (const a of ontology.abox) {
    if (a["@type"] === "NegativeObjectPropertyAssertion") {
      throw new UnsupportedConstructError(
        "owl:NegativeObjectPropertyAssertion at input is a v0.1 punted construct per spec §13.1",
        { construct: "owl:NegativeObjectPropertyAssertion" }
      );
    }
    if (a["@type"] === "NegativeDataPropertyAssertion") {
      throw new UnsupportedConstructError(
        "owl:NegativeDataPropertyAssertion at input is a v0.1 punted construct per spec §13.1",
        { construct: "owl:NegativeDataPropertyAssertion" }
      );
    }
  }

  // (c) Punning: same IRI used as both Class and ObjectProperty.
  // Collect IRIs declared as classes (in TBox + ABox class assertions) and
  // IRIs used as object properties (in RBox + ABox property assertions).
  // Overlap = punning. Per spec §13.1 the lifter rejects.
  const classIRIs = collectClassIRIs(ontology);
  const propertyIRIs = collectPropertyIRIs(ontology);
  for (const iri of classIRIs) {
    if (propertyIRIs.has(iri)) {
      throw new UnsupportedConstructError(
        `Punning detected: IRI '${iri}' is used as both a class and an object property. Punning is a v0.1 punted construct per spec §13.1.`,
        { construct: "punning" }
      );
    }
  }

  // (d) Faceted datatype restrictions — walk class expressions in TBox /
  // RBox / ABox class assertions and detect any DatatypeRestriction node.
  for (const t of ontology.tbox) {
    walkClassExpressionsInTBoxAxiom(t, detectFacetedDatatype);
  }
  for (const r of ontology.rbox) {
    walkClassExpressionsInRBoxAxiom(r, detectFacetedDatatype);
  }
  for (const a of ontology.abox) {
    if (a["@type"] === "ClassAssertion") {
      walkClassExpression(a.class, detectFacetedDatatype);
    }
  }

  // (e) Annotation-on-annotation — recursive `annotations` field on any
  // AnnotationAxiom is the punted shape per spec §13.1.
  if (ontology.annotations) {
    for (const ann of ontology.annotations) {
      if (
        Array.isArray((ann as { annotations?: unknown[] }).annotations) &&
        (ann as { annotations: unknown[] }).annotations.length > 0
      ) {
        throw new UnsupportedConstructError(
          "Annotation-on-annotation patterns are a v0.1 punted construct per spec §13.1",
          { construct: "annotation-on-annotation" }
        );
      }
    }
  }
}

function detectFacetedDatatype(node: unknown): void {
  if (
    node !== null &&
    typeof node === "object" &&
    (node as { "@type"?: string })["@type"] === "DatatypeRestriction"
  ) {
    throw new UnsupportedConstructError(
      "Faceted datatype restrictions (owl:withRestrictions / DatatypeRestriction) are a v0.1 punted construct per spec §13.1",
      { construct: "faceted-datatype-restriction" }
    );
  }
}

function collectClassIRIs(ontology: OWLOntology): Set<string> {
  // Per SME B1 fix: collect NamedClass IRIs from EVERY place a class can
  // appear, not just ClassDefinition + ClassAssertion. The earlier scope
  // missed SubClassOf/EquivalentClasses/DisjointWith subjects, restriction
  // fillers, and ObjectPropertyDomain/Range targets — letting punning
  // detection silently false-negative on the most common ontology shapes.
  const out = new Set<string>();
  const collectIfNamedClass = (node: unknown): void => {
    if (
      node !== null &&
      typeof node === "object" &&
      (node as { "@type"?: string })["@type"] === "Class"
    ) {
      const iri = (node as { iri?: string }).iri;
      if (typeof iri === "string" && iri.length > 0) {
        out.add(canonicalizeIRI(iri, ontology.prefixes));
      }
    }
  };

  // TBox: ClassDefinition's declared IRI is itself a class; expression and
  // every other class-expression position is walked.
  for (const t of ontology.tbox) {
    if (t["@type"] === "ClassDefinition") {
      out.add(canonicalizeIRI(t.iri, ontology.prefixes));
    }
    walkClassExpressionsInTBoxAxiom(t, collectIfNamedClass);
  }
  // RBox: ObjectPropertyDomain.domain and ObjectPropertyRange.range carry
  // class expressions.
  for (const r of ontology.rbox) {
    walkClassExpressionsInRBoxAxiom(r, collectIfNamedClass);
  }
  // ABox: ClassAssertion target — walk the full class expression so complex
  // targets (intersections, unions, restrictions) are also covered.
  for (const a of ontology.abox) {
    if (a["@type"] === "ClassAssertion") {
      walkClassExpression(a.class, collectIfNamedClass);
    }
  }
  return out;
}

function collectPropertyIRIs(ontology: OWLOntology): Set<string> {
  const out = new Set<string>();
  // RBox: any axiom that names a property
  for (const r of ontology.rbox) {
    switch (r["@type"]) {
      case "SubObjectPropertyOf":
        out.add(canonicalizeIRI(r.subProperty, ontology.prefixes));
        out.add(canonicalizeIRI(r.superProperty, ontology.prefixes));
        break;
      case "EquivalentObjectProperties":
        for (const p of r.properties) out.add(canonicalizeIRI(p, ontology.prefixes));
        break;
      case "InverseObjectProperties":
        out.add(canonicalizeIRI(r.first, ontology.prefixes));
        out.add(canonicalizeIRI(r.second, ontology.prefixes));
        break;
      case "ObjectPropertyChain":
        for (const p of r.chain) out.add(canonicalizeIRI(p, ontology.prefixes));
        out.add(canonicalizeIRI(r.superProperty, ontology.prefixes));
        break;
      case "ObjectPropertyDomain":
      case "ObjectPropertyRange":
        out.add(canonicalizeIRI(r.property, ontology.prefixes));
        break;
      case "DisjointObjectProperties":
        for (const p of r.properties) out.add(canonicalizeIRI(p, ontology.prefixes));
        break;
      case "ObjectPropertyCharacteristic":
        out.add(canonicalizeIRI(r.property, ontology.prefixes));
        break;
    }
  }
  // ABox: ObjectPropertyAssertion / NegativeObjectPropertyAssertion property IRIs
  for (const a of ontology.abox) {
    if (a["@type"] === "ObjectPropertyAssertion" || a["@type"] === "NegativeObjectPropertyAssertion") {
      out.add(canonicalizeIRI(a.property, ontology.prefixes));
    }
  }
  return out;
}

function walkClassExpression(expr: ClassExpression, visit: (n: unknown) => void): void {
  visit(expr);
  if (expr["@type"] === "ObjectIntersectionOf" || expr["@type"] === "ObjectUnionOf") {
    for (const c of expr.classes) walkClassExpression(c, visit);
  } else if (expr["@type"] === "ObjectComplementOf") {
    walkClassExpression(expr.class, visit);
  } else if (expr["@type"] === "Restriction") {
    if ("someValuesFrom" in expr) {
      visit(expr.someValuesFrom);
      // someValuesFrom may be a class expression OR a DatatypeRestriction;
      // recurse only when it's a class expression.
      const sv = expr.someValuesFrom as { "@type": string };
      if (sv["@type"] !== "DatatypeRestriction") {
        walkClassExpression(expr.someValuesFrom as ClassExpression, visit);
      }
    } else if ("allValuesFrom" in expr) {
      walkClassExpression(expr.allValuesFrom, visit);
    } else if ("onClass" in expr && expr.onClass) {
      walkClassExpression(expr.onClass, visit);
    }
  }
}

function walkClassExpressionsInTBoxAxiom(t: TBoxAxiom, visit: (n: unknown) => void): void {
  switch (t["@type"]) {
    case "SubClassOf":
      walkClassExpression(t.subClass, visit);
      walkClassExpression(t.superClass, visit);
      break;
    case "EquivalentClasses":
    case "DisjointWith":
      for (const c of t.classes) walkClassExpression(c, visit);
      break;
    case "ClassDefinition":
      walkClassExpression(t.expression, visit);
      break;
  }
}

function walkClassExpressionsInRBoxAxiom(r: RBoxAxiom, visit: (n: unknown) => void): void {
  if (r["@type"] === "ObjectPropertyDomain") walkClassExpression(r.domain, visit);
  if (r["@type"] === "ObjectPropertyRange") walkClassExpression(r.range, visit);
}

// ---------------------------------------------------------------------------
// ABox lifting (Step 1 deliverable)
// ---------------------------------------------------------------------------

function liftABoxAxiom(
  axiom: ABoxAxiom,
  prefixes?: Record<string, string>
): FOLAxiom[] | null {
  switch (axiom["@type"]) {
    case "ClassAssertion": {
      // x rdf:type C → C(x). Only NamedClass targets are handled in Step 1;
      // class-expression targets defer to Step 2 (require restriction lifting).
      if (axiom.class["@type"] !== "Class") return null;
      const fact: FOLAtom = {
        "@type": "fol:Atom",
        predicate: canonicalizeIRI(axiom.class.iri, prefixes),
        arguments: [makeConstant(canonicalizeIRI(axiom.individual, prefixes))],
      };
      return [fact];
    }
    case "ObjectPropertyAssertion": {
      const fact: FOLAtom = {
        "@type": "fol:Atom",
        predicate: canonicalizeIRI(axiom.property, prefixes),
        arguments: [
          makeConstant(canonicalizeIRI(axiom.source, prefixes)),
          makeConstant(canonicalizeIRI(axiom.target, prefixes)),
        ],
      };
      return [fact];
    }
    case "DataPropertyAssertion": {
      const fact: FOLAtom = {
        "@type": "fol:Atom",
        predicate: canonicalizeIRI(axiom.property, prefixes),
        arguments: [
          makeConstant(canonicalizeIRI(axiom.source, prefixes)),
          makeTypedLiteral(axiom.value),
        ],
      };
      return [fact];
    }
    case "SameIndividual": {
      // Per spec §5.5.1, same_as facts emitted as binary owl:sameAs atoms.
      // Pairwise emission for individuals[0..n-1] → [0..1, 0..2, ..., 0..n-1, 1..2, ...].
      // Step 1 emits pairwise (i, j) for i<j.
      // Per architect Ruling 3 of Step 5 cycle: predicate IRI is the
      // expanded full-URI form per API §3.10.3, NOT the CURIE shorthand.
      const out: FOLAxiom[] = [];
      const ids = axiom.individuals.map((i) => canonicalizeIRI(i, prefixes));
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          out.push({
            "@type": "fol:Atom",
            predicate: OWL_SAME_AS_IRI,
            arguments: [makeConstant(ids[i]), makeConstant(ids[j])],
          });
        }
      }
      return out;
    }
    case "DifferentIndividuals": {
      // Per architect Ruling 3 of Step 5 cycle: full-URI form per API §3.10.3.
      const out: FOLAxiom[] = [];
      const ids = axiom.individuals.map((i) => canonicalizeIRI(i, prefixes));
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          out.push({
            "@type": "fol:Atom",
            predicate: OWL_DIFFERENT_FROM_IRI,
            arguments: [makeConstant(ids[i]), makeConstant(ids[j])],
          });
        }
      }
      return out;
    }
    // NegativeObjectPropertyAssertion / NegativeDataPropertyAssertion are
    // §13.1 punted; they were already rejected in rejectPuntedConstructs().
    default:
      return null;
  }
}

function makeConstant(iri: string): FOLConstant {
  return { "@type": "fol:Constant", iri };
}

function makeTypedLiteral(value: TypedLiteral): FOLTypedLiteral {
  const out: FOLTypedLiteral = {
    "@type": "fol:TypedLiteral",
    value: value["@value"],
    datatype: value["@type"],
  };
  if (value["@language"]) out.language = value["@language"];
  return out;
}

// ---------------------------------------------------------------------------
// TBox lifting (Step 2)
// ---------------------------------------------------------------------------

/**
 * Lift a TBox axiom to one or more FOLAxioms.
 *
 * SubClassOf(C, D)            → ∀x. lift(C, x) → lift(D, x)
 * EquivalentClasses[C0..Cn]   → for each (i, j) with i<j: ∀x. Ci(x) → Cj(x)
 *                                                          and: ∀x. Cj(x) → Ci(x)
 * DisjointWith[C0..Cn]        → for each (i, j) with i<j: ∀x. Ci(x) ∧ Cj(x) → ⊥
 * ClassDefinition(iri, expr)  → equivalent to EquivalentClasses[NamedClass(iri), expr]
 */
function liftTBoxAxiom(
  axiom: TBoxAxiom,
  prefixes?: Record<string, string>
): FOLAxiom[] | null {
  switch (axiom["@type"]) {
    case "SubClassOf": {
      const alloc = makeVarAllocator();
      const x = alloc.next();
      const ant = liftClassExpression(axiom.subClass, x, prefixes, alloc);
      const cons = liftClassExpression(axiom.superClass, x, prefixes, alloc);
      return [universal(x.name, implication(ant, cons))];
    }
    case "EquivalentClasses": {
      const out: FOLAxiom[] = [];
      const cs = axiom.classes;
      for (let i = 0; i < cs.length; i++) {
        for (let j = i + 1; j < cs.length; j++) {
          out.push(...liftBidirectionalSubsumption(cs[i], cs[j], prefixes));
        }
      }
      return out;
    }
    case "DisjointWith": {
      const out: FOLAxiom[] = [];
      const cs = axiom.classes;
      for (let i = 0; i < cs.length; i++) {
        for (let j = i + 1; j < cs.length; j++) {
          const alloc = makeVarAllocator();
          const x = alloc.next();
          const left = liftClassExpression(cs[i], x, prefixes, alloc);
          const right = liftClassExpression(cs[j], x, prefixes, alloc);
          out.push(
            universal(
              x.name,
              implication(conjunction([left, right]), falsum())
            )
          );
        }
      }
      return out;
    }
    case "ClassDefinition": {
      // Equivalent to EquivalentClasses[NamedClass(iri), expression].
      // Same emission shape as the EquivalentClasses case for n=2.
      const named: ClassExpression = {
        "@type": "Class",
        iri: axiom.iri,
      };
      return liftBidirectionalSubsumption(named, axiom.expression, prefixes);
    }
    default:
      return null;
  }
}

/**
 * Emit ∀x. C(x) → D(x) AND ∀x. D(x) → C(x) for two class expressions.
 *
 * Each direction gets a fresh `makeVarAllocator()` (NOT a shared one) so
 * both emitted universals bind `x`. Sharing the allocator would advance the
 * counter across directions and yield `∀x. C(x) → D(x)` followed by
 * `∀y. D(y) → C(y)` — semantically equivalent but inconsistent with the
 * Phase 1 corpus's expected `expectedFOL` (e.g., p1_equivalent_and_disjoint_named
 * pins both universals to `x`). This is a determinism contract, not just
 * an aesthetic preference; banked for the Phase 1 exit Skolem-naming ADR.
 */
function liftBidirectionalSubsumption(
  c: ClassExpression,
  d: ClassExpression,
  prefixes?: Record<string, string>
): FOLAxiom[] {
  const out: FOLAxiom[] = [];
  // Forward direction — fresh allocator so this universal binds 'x'.
  {
    const alloc = makeVarAllocator();
    const x = alloc.next();
    const ant = liftClassExpression(c, x, prefixes, alloc);
    const cons = liftClassExpression(d, x, prefixes, alloc);
    out.push(universal(x.name, implication(ant, cons)));
  }
  // Reverse direction — fresh allocator again so this universal also binds 'x'.
  {
    const alloc = makeVarAllocator();
    const x = alloc.next();
    const ant = liftClassExpression(d, x, prefixes, alloc);
    const cons = liftClassExpression(c, x, prefixes, alloc);
    out.push(universal(x.name, implication(ant, cons)));
  }
  return out;
}

// ---------------------------------------------------------------------------
// RBox lifting (Step 3 — ObjectPropertyDomain + ObjectPropertyRange only)
// ---------------------------------------------------------------------------

/**
 * Lift an RBox axiom to one or more FOLAxioms.
 *
 * Step 3 implements:
 *   ObjectPropertyDomain(P, D)  → ∀x,y. P(x,y) → lift(D, x)    [API §3.7.1.1]
 *   ObjectPropertyRange(P, R)   → ∀x,y. P(x,y) → lift(R, y)    [symmetric]
 *
 * The conditional translation is the HIGH-PRIORITY contract per API §3.7.1.
 * The forbidden existential synthesis (∀x. D(x) → ∃y. P(x,y)) is verified
 * absent by the canary_domain_range_existential fixture using the
 * assertForbiddenPatterns helper.
 *
 * Other RBox axioms (SubObjectPropertyOf, EquivalentObjectProperties,
 * InverseObjectProperties, ObjectPropertyChain, DisjointObjectProperties,
 * ObjectPropertyCharacteristic) noop in Step 3; Step 5 fills them in
 * with cycle-guarded rewrites per ADR-011.
 */
function liftRBoxAxiom(
  r: RBoxAxiom,
  prefixes?: Record<string, string>
): FOLAxiom[] | null {
  switch (r["@type"]) {
    case "ObjectPropertyDomain": {
      // ∀x,y. P(x,y) → D(x). Fresh allocator so x = first var, y = second;
      // inner restrictions in D allocate from index 2 onward (z, w, ...).
      const alloc = makeVarAllocator();
      const x = alloc.next();
      const y = alloc.next();
      const propAtom: FOLAtom = {
        "@type": "fol:Atom",
        predicate: canonicalizeIRI(r.property, prefixes),
        arguments: [x, y],
      };
      const domainLifted = liftClassExpression(r.domain, x, prefixes, alloc);
      return [
        universal(x.name, universal(y.name, implication(propAtom, domainLifted))),
      ];
    }
    case "ObjectPropertyRange": {
      // ∀x,y. P(x,y) → R(y). Same shape, range applied against y.
      const alloc = makeVarAllocator();
      const x = alloc.next();
      const y = alloc.next();
      const propAtom: FOLAtom = {
        "@type": "fol:Atom",
        predicate: canonicalizeIRI(r.property, prefixes),
        arguments: [x, y],
      };
      const rangeLifted = liftClassExpression(r.range, y, prefixes, alloc);
      return [
        universal(x.name, universal(y.name, implication(propAtom, rangeLifted))),
      ];
    }
    case "ObjectPropertyCharacteristic": {
      // Step 5 — property characteristics per spec §5.2 / behavioral §5.4.
      // Lifter emits CLASSICAL FOL axioms for the semantic content. Cycle-
      // guarded SLD ingestion (visited-ancestor list per ADR-011) is the
      // Phase 3 evaluator's concern; the FOL term tree contains the
      // classical equivalent encoding per spec §6.2 ("equivalent encoding"
      // framing — the Prolog rule rewrite is the canonical interpretation
      // when the FOL is loaded into Tau Prolog).
      // Anticipated ADR-007 documents this layer-translation.
      const propIRI = canonicalizeIRI(r.property, prefixes);
      switch (r.characteristic) {
        case "Functional": {
          // ∀x,y,z. P(x,y) ∧ P(x,z) → y = z
          const alloc = makeVarAllocator();
          const x = alloc.next();
          const y = alloc.next();
          const z = alloc.next();
          return [
            universal(
              x.name,
              universal(
                y.name,
                universal(
                  z.name,
                  implication(
                    conjunction([
                      { "@type": "fol:Atom", predicate: propIRI, arguments: [x, y] },
                      { "@type": "fol:Atom", predicate: propIRI, arguments: [x, z] },
                    ]),
                    { "@type": "fol:Equality", left: y, right: z }
                  )
                )
              )
            ),
          ];
        }
        case "Transitive": {
          // ∀x,y,z. P(x,y) ∧ P(y,z) → P(x,z)
          // Cycle-guarded SLD ingestion is Phase 3's concern.
          const alloc = makeVarAllocator();
          const x = alloc.next();
          const y = alloc.next();
          const z = alloc.next();
          return [
            universal(
              x.name,
              universal(
                y.name,
                universal(
                  z.name,
                  implication(
                    conjunction([
                      { "@type": "fol:Atom", predicate: propIRI, arguments: [x, y] },
                      { "@type": "fol:Atom", predicate: propIRI, arguments: [y, z] },
                    ]),
                    { "@type": "fol:Atom", predicate: propIRI, arguments: [x, z] }
                  )
                )
              )
            ),
          ];
        }
        case "Symmetric": {
          // ∀x,y. P(x,y) → P(y,x)
          // Cycle-guarded SLD ingestion is Phase 3's concern.
          const alloc = makeVarAllocator();
          const x = alloc.next();
          const y = alloc.next();
          return [
            universal(
              x.name,
              universal(
                y.name,
                implication(
                  { "@type": "fol:Atom", predicate: propIRI, arguments: [x, y] },
                  { "@type": "fol:Atom", predicate: propIRI, arguments: [y, x] }
                )
              )
            ),
          ];
        }
        // InverseFunctional / Asymmetric / Reflexive / Irreflexive — not yet
        // implemented; Phase 1 corpus does not exercise these. Noop until
        // Phase 1 exit promotion (or earlier if a corpus extension lands).
        default:
          return null;
      }
    }
    case "InverseObjectProperties": {
      // ∀x,y. P(x,y) ↔ Q(y,x). Decomposed as two implications, each with
      // its own fresh allocator so both bind 'x' and 'y' (banked
      // determinism convention from liftBidirectionalSubsumption per
      // ADR-007).
      const p = canonicalizeIRI(r.first, prefixes);
      const q = canonicalizeIRI(r.second, prefixes);
      const out: FOLAxiom[] = [];
      // Forward: ∀x,y. P(x,y) → Q(y,x)
      {
        const alloc = makeVarAllocator();
        const x = alloc.next();
        const y = alloc.next();
        out.push(
          universal(
            x.name,
            universal(
              y.name,
              implication(
                { "@type": "fol:Atom", predicate: p, arguments: [x, y] },
                { "@type": "fol:Atom", predicate: q, arguments: [y, x] }
              )
            )
          )
        );
      }
      // Reverse: ∀x,y. Q(x,y) → P(y,x). Renamed via alpha-equivalence
      // from ∀x,y. Q(y,x) → P(x,y) so both implications bind 'x' and 'y'.
      // Mathematically equivalent under alpha-renaming (per SME O2 carry-
      // forward from Step 5 review); banked in ADR-007 §3 + §4.
      {
        const alloc = makeVarAllocator();
        const x = alloc.next();
        const y = alloc.next();
        out.push(
          universal(
            x.name,
            universal(
              y.name,
              implication(
                { "@type": "fol:Atom", predicate: q, arguments: [x, y] },
                { "@type": "fol:Atom", predicate: p, arguments: [y, x] }
              )
            )
          )
        );
      }
      return out;
    }
    // Other RBox axioms (SubObjectPropertyOf, EquivalentObjectProperties,
    // ObjectPropertyChain, DisjointObjectProperties): deferred. Phase 1
    // corpus does not exercise them; Phase 2 (projector) and beyond may
    // pick them up.
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Identity machinery (Step 4) — spec §5.5.1-§5.5.2
// ---------------------------------------------------------------------------

/**
 * Emit the identity-discipline FOL axioms for an ontology.
 *
 * When SameIndividual is present in the ABox: emits owl:sameAs reflexivity,
 * symmetry, transitivity equivalence axioms PLUS per-predicate identity-
 * rewrite rules for every class IRI (used in ClassAssertion) and every
 * object-property IRI (used in ObjectPropertyAssertion) appearing in the
 * ABox. The reserved owl:sameAs / owl:differentFrom predicates are excluded
 * from the per-predicate rewrites to avoid trivial-loop rewrites under SLD
 * resolution.
 *
 * When DifferentIndividuals is present: emits owl:differentFrom symmetry.
 * differentFrom is irreflexive (NO ∀x. differentFrom(x,x)) and not a
 * transitive relation, so only symmetry is injected.
 *
 * Iteration order over predicate sets is sorted lexicographically so the
 * emitted axioms are deterministic across runs (banked for Phase 1 exit
 * Skolem-naming-convention ADR).
 */
function emitIdentityMachinery(ontology: OWLOntology): FOLAxiom[] {
  const out: FOLAxiom[] = [];
  const prefixes = ontology.prefixes;

  const hasSameIndividual = ontology.abox.some(
    (a) => a["@type"] === "SameIndividual"
  );
  const hasDifferentIndividuals = ontology.abox.some(
    (a) => a["@type"] === "DifferentIndividuals"
  );

  if (hasSameIndividual) {
    out.push(reflexivityAxiom(OWL_SAME_AS_IRI));
    out.push(symmetryAxiom(OWL_SAME_AS_IRI));
    out.push(transitivityAxiom(OWL_SAME_AS_IRI));
  }
  if (hasDifferentIndividuals) {
    out.push(symmetryAxiom(OWL_DIFFERENT_FROM_IRI));
  }

  // Per-predicate identity-rewrite rules — only meaningful when an identity
  // can propagate (SameIndividual present). DifferentIndividuals alone does
  // not require rewrite rules; differentFrom does not propagate identity.
  if (hasSameIndividual) {
    const unaryPredicates = new Set<string>();
    const binaryPredicates = new Set<string>();
    for (const a of ontology.abox) {
      if (a["@type"] === "ClassAssertion" && a.class["@type"] === "Class") {
        unaryPredicates.add(canonicalizeIRI(a.class.iri, prefixes));
      } else if (a["@type"] === "ObjectPropertyAssertion") {
        const pred = canonicalizeIRI(a.property, prefixes);
        // Per architect Ruling 3 of Step 5 cycle: reserved-predicate exclusion
        // matches the expanded full-URI canonical form per API §3.10.3.
        // A user-supplied owl:sameAs / owl:differentFrom in CURIE form goes
        // through canonicalizeIRI and lands as the expanded form too, so the
        // single full-URI check catches both surface forms uniformly.
        if (pred !== OWL_SAME_AS_IRI && pred !== OWL_DIFFERENT_FROM_IRI) {
          binaryPredicates.add(pred);
        }
      }
    }
    const sortedUnary = [...unaryPredicates].sort((a, b) =>
      a < b ? -1 : a > b ? 1 : 0
    );
    const sortedBinary = [...binaryPredicates].sort((a, b) =>
      a < b ? -1 : a > b ? 1 : 0
    );
    for (const p of sortedUnary) {
      out.push(unaryIdentityRewrite(p));
    }
    for (const p of sortedBinary) {
      out.push(binaryIdentityRewriteFirstArg(p));
      out.push(binaryIdentityRewriteSecondArg(p));
    }
  }

  return out;
}

/** ∀x. P(x,x) — equivalence reflexivity for a binary predicate. */
function reflexivityAxiom(predicate: string): FOLUniversal {
  return universal("x", {
    "@type": "fol:Atom",
    predicate,
    arguments: [varRef("x"), varRef("x")],
  });
}

/** ∀x,y. P(x,y) → P(y,x). */
function symmetryAxiom(predicate: string): FOLUniversal {
  return universal(
    "x",
    universal(
      "y",
      implication(
        {
          "@type": "fol:Atom",
          predicate,
          arguments: [varRef("x"), varRef("y")],
        },
        {
          "@type": "fol:Atom",
          predicate,
          arguments: [varRef("y"), varRef("x")],
        }
      )
    )
  );
}

/** ∀x,y,z. P(x,y) ∧ P(y,z) → P(x,z). */
function transitivityAxiom(predicate: string): FOLUniversal {
  return universal(
    "x",
    universal(
      "y",
      universal(
        "z",
        implication(
          conjunction([
            {
              "@type": "fol:Atom",
              predicate,
              arguments: [varRef("x"), varRef("y")],
            },
            {
              "@type": "fol:Atom",
              predicate,
              arguments: [varRef("y"), varRef("z")],
            },
          ]),
          {
            "@type": "fol:Atom",
            predicate,
            arguments: [varRef("x"), varRef("z")],
          }
        )
      )
    )
  );
}

/** ∀x,z. P(x) ∧ owl:sameAs(x,z) → P(z) — unary identity rewrite. */
function unaryIdentityRewrite(predicate: string): FOLUniversal {
  return universal(
    "x",
    universal(
      "z",
      implication(
        conjunction([
          { "@type": "fol:Atom", predicate, arguments: [varRef("x")] },
          {
            "@type": "fol:Atom",
            predicate: OWL_SAME_AS_IRI,
            arguments: [varRef("x"), varRef("z")],
          },
        ]),
        { "@type": "fol:Atom", predicate, arguments: [varRef("z")] }
      )
    )
  );
}

/** ∀x,y,z. P(x,y) ∧ owl:sameAs(x,z) → P(z,y) — binary identity rewrite, first arg. */
function binaryIdentityRewriteFirstArg(predicate: string): FOLUniversal {
  return universal(
    "x",
    universal(
      "y",
      universal(
        "z",
        implication(
          conjunction([
            {
              "@type": "fol:Atom",
              predicate,
              arguments: [varRef("x"), varRef("y")],
            },
            {
              "@type": "fol:Atom",
              predicate: OWL_SAME_AS_IRI,
              arguments: [varRef("x"), varRef("z")],
            },
          ]),
          {
            "@type": "fol:Atom",
            predicate,
            arguments: [varRef("z"), varRef("y")],
          }
        )
      )
    )
  );
}

/** ∀x,y,z. P(x,y) ∧ owl:sameAs(y,z) → P(x,z) — binary identity rewrite, second arg. */
function binaryIdentityRewriteSecondArg(predicate: string): FOLUniversal {
  return universal(
    "x",
    universal(
      "y",
      universal(
        "z",
        implication(
          conjunction([
            {
              "@type": "fol:Atom",
              predicate,
              arguments: [varRef("x"), varRef("y")],
            },
            {
              "@type": "fol:Atom",
              predicate: OWL_SAME_AS_IRI,
              arguments: [varRef("y"), varRef("z")],
            },
          ]),
          {
            "@type": "fol:Atom",
            predicate,
            arguments: [varRef("x"), varRef("z")],
          }
        )
      )
    )
  );
}

function varRef(name: string): FOLVariable {
  return { "@type": "fol:Variable", name };
}

// ---------------------------------------------------------------------------
// Reserved-predicate canonical IRIs (per ADR-007 §9 + architect Ruling 3 of
// Step 5 cycle: canonical form is full URI per API §3.10.3, NOT CURIE form)
// ---------------------------------------------------------------------------

/** Canonical IRI for owl:sameAs. Always full-URI form per API §3.10.3. */
const OWL_SAME_AS_IRI = "http://www.w3.org/2002/07/owl#sameAs";

/** Canonical IRI for owl:differentFrom. Always full-URI form per API §3.10.3. */
const OWL_DIFFERENT_FROM_IRI = "http://www.w3.org/2002/07/owl#differentFrom";

// ---------------------------------------------------------------------------
// Class-expression lifting (Step 2)
// ---------------------------------------------------------------------------

/**
 * Lift a class expression `C` against a term `t`, producing a FOL formula
 * representing membership: `C(t)`.
 *
 * Recursion handles Restrictions and Boolean class expressions. Cardinality
 * and OneOf are not lifted in Step 2; they noop to a placeholder Atom that
 * Step 7 / future steps replace.
 *
 * Variable-allocator threading: callers pass an allocator that yields fresh
 * variable names ("x", "y", "z", "w", "v", "u", ...) — sufficient for the
 * Phase 1 corpus's nesting depth. Step 6's blank-node fixture uses 3-deep
 * nesting; the allocator handles arbitrary depth.
 */
function liftClassExpression(
  expr: ClassExpression,
  term: FOLTerm,
  prefixes: Record<string, string> | undefined,
  alloc: VarAllocator
): FOLAxiom {
  switch (expr["@type"]) {
    case "Class": {
      const atom: FOLAtom = {
        "@type": "fol:Atom",
        predicate: canonicalizeIRI(expr.iri, prefixes),
        arguments: [term],
      };
      return atom;
    }
    case "ObjectIntersectionOf": {
      const conjuncts = expr.classes.map((c) =>
        liftClassExpression(c, term, prefixes, alloc)
      );
      return conjunction(conjuncts);
    }
    case "ObjectUnionOf": {
      const disjuncts = expr.classes.map((c) =>
        liftClassExpression(c, term, prefixes, alloc)
      );
      return { "@type": "fol:Disjunction", disjuncts } satisfies FOLDisjunction;
    }
    case "ObjectComplementOf": {
      const inner = liftClassExpression(expr.class, term, prefixes, alloc);
      return { "@type": "fol:Negation", inner } satisfies FOLNegation;
    }
    case "Restriction": {
      // someValuesFrom — existential
      if ("someValuesFrom" in expr) {
        const filler = expr.someValuesFrom;
        if ((filler as { "@type": string })["@type"] === "DatatypeRestriction") {
          // Already caught by the punted-construct pre-scan; defensive.
          throw new UnsupportedConstructError(
            "Faceted datatype restrictions are a v0.1 punted construct per spec §13.1",
            { construct: "faceted-datatype-restriction" }
          );
        }
        const y = alloc.next();
        const propAtom: FOLAtom = {
          "@type": "fol:Atom",
          predicate: canonicalizeIRI(expr.onProperty, prefixes),
          arguments: [term, y],
        };
        const fillerLifted = liftClassExpression(
          filler as ClassExpression,
          y,
          prefixes,
          alloc
        );
        const exi: FOLExistential = {
          "@type": "fol:Existential",
          variable: y.name,
          body: conjunction([propAtom, fillerLifted]),
        };
        return exi;
      }
      // allValuesFrom — universal-implication
      if ("allValuesFrom" in expr) {
        const y = alloc.next();
        const propAtom: FOLAtom = {
          "@type": "fol:Atom",
          predicate: canonicalizeIRI(expr.onProperty, prefixes),
          arguments: [term, y],
        };
        const fillerLifted = liftClassExpression(
          expr.allValuesFrom,
          y,
          prefixes,
          alloc
        );
        const inner: FOLUniversal = {
          "@type": "fol:Universal",
          variable: y.name,
          body: implication(propAtom, fillerLifted),
        };
        return inner;
      }
      // hasValue — fact assertion against the named individual
      if ("hasValue" in expr) {
        const valConst: FOLConstant = {
          "@type": "fol:Constant",
          iri: canonicalizeIRI(expr.hasValue, prefixes),
        };
        const propAtom: FOLAtom = {
          "@type": "fol:Atom",
          predicate: canonicalizeIRI(expr.onProperty, prefixes),
          arguments: [term, valConst],
        };
        return propAtom;
      }
      // Cardinality variants — Phase 1 Step 7 deliverable. Per SME B2 fix,
      // throw rather than emit a wrong-arity placeholder atom. Emitting a
      // unary atom of an object-property predicate silently corrupts the
      // FOL state for any consumer that also reads the binary form of the
      // same property. The runner correctly defers p1_restrictions_cardinality
      // to Step 7, so this throw is unreached by the active corpus; any
      // out-of-corpus consumer feeding cardinality input gets honest-admission
      // failure rather than degraded FOL.
      throw new UnsupportedConstructError(
        "Cardinality restriction lifting is a Phase 1 Step 7 deliverable per ROADMAP; not yet implemented in the lifter. Activated when Step 7 lands.",
        {
          construct: "cardinality-restriction",
          suggestion:
            "Phase 1 Step 7 deliverable; this is implementation-in-progress, not a permanent v0.1 limitation. The fixture p1_restrictions_cardinality is registered against this construct and activates at Step 7 exit.",
        }
      );
    }
    case "ObjectOneOf": {
      // Disjunction of equalities: x = i1 ∨ x = i2 ∨ ...
      // Phase 1 Step 2 emits the disjunction; full Phase 1 may refine.
      const disjuncts: FOLAxiom[] = expr.individuals.map((iri) => ({
        "@type": "fol:Equality",
        left: term,
        right: {
          "@type": "fol:Constant",
          iri: canonicalizeIRI(iri, prefixes),
        },
      }));
      return disjuncts.length === 1
        ? disjuncts[0]
        : { "@type": "fol:Disjunction", disjuncts } satisfies FOLDisjunction;
    }
    default: {
      // Exhaustiveness guard. ClassExpression has no other variants per
      // owl-types.ts; if a new one is added, TS catches the omission.
      const _exhaustive: never = expr;
      void _exhaustive;
      throw new Error("liftClassExpression: unreachable");
    }
  }
}

// ---------------------------------------------------------------------------
// FOL-axiom builders + variable allocator
// ---------------------------------------------------------------------------

interface VarAllocator {
  next(): FOLVariable;
}

const VAR_NAMES = ["x", "y", "z", "w", "v", "u", "t", "s", "r", "q"];

function makeVarAllocator(): VarAllocator {
  let i = 0;
  return {
    next() {
      const name = i < VAR_NAMES.length ? VAR_NAMES[i] : `v${i}`;
      i += 1;
      return { "@type": "fol:Variable", name };
    },
  };
}

function universal(variable: string, body: FOLAxiom): FOLUniversal {
  return { "@type": "fol:Universal", variable, body };
}

function implication(antecedent: FOLAxiom, consequent: FOLAxiom): FOLImplication {
  return { "@type": "fol:Implication", antecedent, consequent };
}

function conjunction(conjuncts: FOLAxiom[]): FOLConjunction {
  return { "@type": "fol:Conjunction", conjuncts };
}

function falsum(): FOLFalse {
  return { "@type": "fol:False" };
}

// Annotation lifting (spec §5.9 structural annotations) lands in Step 3 +
// Phase 3 per ROADMAP. The current file's responsibilities stop at
// detecting the §13.1 annotation-on-annotation punted pattern (handled
// inline in rejectPuntedConstructs above). When structural-annotation
// lifting work begins, it gets its own module (src/kernel/annotations.ts)
// rather than a placeholder export here.
