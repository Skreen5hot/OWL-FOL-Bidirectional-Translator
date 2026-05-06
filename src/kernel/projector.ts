/**
 * FOL → OWL Projector (Phase 2 Steps 1-2)
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
 * IMPLEMENTED (Step 2 — Direct Mapping pattern-match per spec §6.1.1):
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
 * NOT in Step 2 (deferred to later Steps per phase-2-entry.md §7.4):
 *   - Strategy selection algorithm with tiered fallthrough per spec §6.2 — Step 5.
 *     Until that lands, axioms that don't match any Direct Mapping pattern are
 *     dropped silently from the output. This is a temporary scope-bound
 *     behavior; it does NOT violate the spec §6.2 "no silent strategy-pick"
 *     rule because Step 2 implements only Direct Mapping — it does not yet
 *     have alternatives to choose between.
 *   - Class-expression reconstruction (intersection / union / complement /
 *     restrictions / cardinality) — Step 3.
 *   - EquivalentClasses / DisjointWith pair-matching across multiple lifted
 *     axioms — Step 3.
 *   - Functional / InverseObjectProperties / Domain / Range — Step 3.
 *   - SameIndividual / DifferentIndividuals (reserved-predicate atoms) — Step 3.
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
  DataPropertyAssertion,
  ObjectPropertyAssertion,
  ObjectPropertyCharacteristicAxiom,
  OWLOntology,
  RBoxAxiom,
  SubClassOfAxiom,
  TBoxAxiom,
  TypedLiteral,
} from "./owl-types.js";
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
  const tbox: TBoxAxiom[] = [];
  const abox: ABoxAxiom[] = [];
  const rbox: RBoxAxiom[] = [];

  // Step 2: Direct Mapping pattern-match per spec §6.1.1. Iterate in source
  // order. Patterns that don't match any Direct Mapping shape are dropped
  // silently for now; Step 4-5 routes them to Annotated Approximation.
  for (const axiom of axioms) {
    const direct = projectDirectMapping(axiom);
    if (!direct) continue;
    switch (direct.kind) {
      case "tbox":
        tbox.push(direct.axiom);
        break;
      case "abox":
        abox.push(direct.axiom);
        break;
      case "rbox":
        rbox.push(direct.axiom);
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
  // ∀x. C1(x) → C2(x) — TBox SubClassOf with named classes.
  const subClass = matchUnaryUniversalImplication(u);
  if (subClass) {
    const sc: SubClassOfAxiom = {
      "@type": "SubClassOf",
      subClass: { "@type": "Class", iri: subClass.subClassIRI },
      superClass: { "@type": "Class", iri: subClass.superClassIRI },
    };
    return { kind: "tbox", axiom: sc };
  }

  // ∀x,y. P(x,y) → P(y,x) — Symmetric.
  const symmetric = matchSymmetricRule(u);
  if (symmetric) {
    return { kind: "rbox", axiom: symmetric };
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
