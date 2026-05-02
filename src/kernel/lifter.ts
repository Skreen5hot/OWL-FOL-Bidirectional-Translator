/**
 * OWL → FOL Lifter (Phase 1 Step 1 scope)
 *
 * Per API spec §6.1. Async because subsequent steps wire `rdf-canonize` for
 * blank-node canonicalization (Step 6 per phase-1-entry.md sequencing); the
 * Promise contract is established in Step 1 even though the Step 1 surface
 * does not await anything yet.
 *
 * STEP 1 SCOPE (architect-ratified):
 *   - owlToFol skeleton returning Promise<FOLAxiom[]>
 *   - IRI canonicalization on every input IRI per §3.10
 *   - JSON-LD-shaped output type definitions in use
 *   - §13.1 punted-construct REJECTION FROM DAY ONE per architect's third
 *     observation: "build to the canary, not around it"
 *   - ABox lifting (ClassAssertion, ObjectPropertyAssertion,
 *     DataPropertyAssertion, SameIndividual, DifferentIndividuals)
 *
 * NOT YET IMPLEMENTED (deferred to Step 2-9):
 *   - TBox: SubClassOf, EquivalentClasses, DisjointWith, ClassDefinition (Step 2)
 *   - Restrictions someValuesFrom/allValuesFrom/hasValue (Step 2)
 *   - PROV-O domain/range conditional translation (Step 3)
 *   - sameAs identity-aware predicate variants per spec §5.5.2 (Step 4)
 *   - Property characteristics with cycle-guarded rewrites + Skolem ADR (Step 5)
 *   - RDFC-1.0 blank-node canonicalization (Step 6)
 *   - Cardinality restrictions (Step 7)
 *   - 100-run determinism harness (Step 9)
 *
 * Step 1 silently passes through unimplemented axiom kinds (skip-noop)
 * EXCEPT for §13.1 punted constructs which throw. This keeps CI green while
 * Step 2-9 fill in the missing axiom kinds; corpus fixtures whose constructs
 * are not yet implemented are gated by the runner, not by the lifter.
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
  AnnotationAxiom,
  ClassExpression,
  TypedLiteral,
} from "./owl-types.js";
import type { FOLAxiom, FOLAtom, FOLConstant, FOLTypedLiteral } from "./fol-types.js";

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

  // (2) ABox lifting. Direct rules per spec §5.1 / API §3.5.
  for (const a of ontology.abox) {
    const lifted = liftABoxAxiom(a, prefixes);
    if (lifted) axioms.push(...lifted);
  }

  // (3) TBox / RBox: deferred to Step 2+. Silently skip for Step 1.
  // (Punted-construct detection has already run; non-punted-but-unimplemented
  // axioms produce no output rather than throwing UnsupportedConstructError,
  // because they ARE supported per the spec — they just haven't been
  // implemented yet. The Phase 1 Step-1 corpus runner gates on which
  // fixtures should run.)

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
  const out = new Set<string>();
  // TBox: ClassDefinition declarations + named-class subjects
  for (const t of ontology.tbox) {
    if (t["@type"] === "ClassDefinition") out.add(canonicalizeIRI(t.iri, ontology.prefixes));
  }
  // ABox: ClassAssertion target classes (only when the class is a named NamedClass)
  for (const a of ontology.abox) {
    if (a["@type"] === "ClassAssertion" && a.class["@type"] === "Class") {
      out.add(canonicalizeIRI(a.class.iri, ontology.prefixes));
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
      // Pairwise emission for individuals[0..n-1] → [0..1, 0..2, ..., 0..n-1, 1..2, ...]?
      // The Phase 1 corpus (p1_owl_same_and_different) commits to a single
      // binary fact for two-element lists. For n>2 elements the spec does not
      // pin a canonical order; Step 1 emits pairwise (i, j) for i<j.
      const out: FOLAxiom[] = [];
      const ids = axiom.individuals.map((i) => canonicalizeIRI(i, prefixes));
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          out.push({
            "@type": "fol:Atom",
            predicate: "owl:sameAs",
            arguments: [makeConstant(ids[i]), makeConstant(ids[j])],
          });
        }
      }
      return out;
    }
    case "DifferentIndividuals": {
      const out: FOLAxiom[] = [];
      const ids = axiom.individuals.map((i) => canonicalizeIRI(i, prefixes));
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          out.push({
            "@type": "fol:Atom",
            predicate: "owl:differentFrom",
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

// Annotation-axiom walker — kept for parity with the §13.1 detector even
// though Phase 1 Step 1 does not lift annotations to FOL. AnnotationAxiom
// values flow through the annotation walker so the pre-scan can detect
// nested-annotation patterns; lifting itself is deferred per spec §5.9.
export function _annotationWalkerForFutureSteps(_ann: AnnotationAxiom): void {
  // Intentional no-op. Phase 1 Step 1 placeholder; structural annotations
  // land in Step 3 + Phase 3 per ROADMAP.
}
