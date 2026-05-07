/**
 * FOL → OWL Projector (Phase 2 Steps 1-4a + Step 5)
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
 * IMPLEMENTED (Step 5 — strategy router with explicit per-axiom attribution
 * per spec §6.2):
 *   - `OWLConversionResult.strategySelections: StrategySelection[]` reports
 *     the strategy chosen for each shape-valid input axiom. Shape-invalid
 *     axioms (null entries, missing @type, etc.) are omitted per Routing
 *     #0.5 robustness discipline.
 *
 *   - Attribution rule:
 *     - Direct Mapping match + zero Annotated Approximation emission for
 *       the axiom → strategy `'direct'`.
 *     - Annotated Approximation emission (regardless of Direct Mapping
 *       success) → strategy `'annotated-approximation'`.
 *     - No Direct Mapping match + no AA emission → strategy
 *       `'annotated-approximation'` (spec §6.2 fallthrough; this axiom
 *       contributes no output but its strategy is reported as the
 *       fallback).
 *
 *   - Property-Chain Realization (`'property-chain'`) is Step 6 territory;
 *     not currently emitted.
 *
 *   - Per-axiom emission tracking: the dispatch loop maps each
 *     LossSignature / RecoveryPayload back to its source axiom index so
 *     the `lossSignatureCount` / `recoveryPayloadCount` fields on
 *     `StrategySelection` are accurate. Pair-matched outputs (Step 3a/3c
 *     EquivalentClasses / InverseObjectProperties / EquivalentObjectProperties)
 *     are attributed to the earlier of the two consumed axiom indices,
 *     matching the source-position-keyed output convention.
 *
 *   - Diagnostic-throw on no-strategy-applies is deferred to a follow-up:
 *     spec §6.2's algorithm fallthrough is Annotated Approximation, so
 *     every shape-valid axiom routes to at least AA. The
 *     `strategy_routing_no_match` fixture (pending SME authoring) will
 *     surface a specific pathological-axiom case that requires the
 *     diagnostic-throw mechanism.
 *
 * IMPLEMENTED (Step 4a — Annotated Approximation strategy + LossSignature
 * emission machinery + ADR-011 content-addressed @id):
 *   - Strategy router architecture: Direct Mapping is attempted first per
 *     spec §6.2 (existing 3-pass dispatch from Steps 3a/3c). After dispatch,
 *     a side-channel emission pass scans the input axioms and emits
 *     informational/conservative LossSignature + RecoveryPayload artifacts
 *     for naf_residue and unknown_relation patterns. Property-Chain
 *     Realization is Step 6 (still pending).
 *
 *   - naf_residue emission (conservative-emission policy per architect Q-β
 *     banking 2026-05-06): the projector emits a LossSignature with
 *     `lossType: "naf_residue"` for every classical fol:Negation in the
 *     input. The projector cannot prove a given negation was lifter-derived
 *     classical (vs. hand-authored with NAF intent) — when in doubt, emit.
 *     Accompanied by a RecoveryPayload preserving the original FOL state
 *     for downstream re-evaluation (Phase 3 evaluator's CWA path).
 *
 *   - unknown_relation emission (informational, Phase 2): the projector
 *     emits a LossSignature with `lossType: "unknown_relation"` for
 *     predicate IRIs whose namespace prefix is NOT in
 *     `config.permissiveNamespaces` (default tolerance includes Phase 1
 *     `http://example.org/test/`, OWL/RDF/RDFS/XSD, OBO Foundry). The
 *     Direct Mapping output is preserved (the OWL form is structurally
 *     valid); the LossSignature is informational. NO RecoveryPayload
 *     (Direct Mapping output IS the recovery). Phase 4 strict-mode per
 *     spec §3.3 promotes this to a rejection contract.
 *
 *   - Content-addressed @id per ADR-011 §1: SHA-256 lower-case hex of
 *     stableStringify of the discriminating fields. LossSignature uses 5
 *     fields (lossType, relationIRI, reason, provenance.sourceGraphIRI,
 *     provenance.arcVersion); RecoveryPayload uses 3 fields (originalFOL,
 *     relationIRI, approximationStrategy). The hash function is async
 *     (crypto.subtle.digest per ADR-002 allowlist).
 *
 *   - ProjectionManifest source-provenance threading: `config.sourceOntologyIRI`
 *     / `config.sourceVersionIRI` populate the manifest's `ontologyIRI` /
 *     `versionIRI` / `projectedFrom` / `activity.used` fields per spec
 *     §6.1.0.2. When omitted, manifest fields stay empty placeholders.
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

import { stableStringify } from "./canonicalize.js";
import { LIBRARY_VERSION, ARC_MANIFEST_VERSION } from "./version-constants.js";
import {
  APPROXIMATION_STRATEGY_ANNOTATED,
  LOSS_REASON_NAF_NEGATION_UNBOUND,
  LOSS_REASON_UNKNOWN_RELATION_FALLBACK,
} from "./projector-loss-reasons.js";
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
  LossSignature,
  OWLConversionResult,
  ProjectionManifest,
  ProjectionStrategy,
  RecoveryPayload,
  StrategySelection,
} from "./projector-types.js";

// Default permissive-namespace allowlist for unknown_relation emission
// (Phase 2 Step 4a). Predicate IRIs whose namespace prefix matches any of
// these are considered "permissively tolerated" and do not trigger
// unknown_relation. Callers may override via `config.permissiveNamespaces`.
const DEFAULT_PERMISSIVE_NAMESPACES: ReadonlyArray<string> = Object.freeze([
  "http://example.org/test/",
  "http://www.w3.org/2002/07/owl#",
  "http://www.w3.org/2000/01/rdf-schema#",
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  "http://www.w3.org/2001/XMLSchema#",
  "http://purl.obolibrary.org/obo/",
]);

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
    ontologyIRI: config?.sourceOntologyIRI ?? "",
    prefixes: config?.prefixes,
    tbox,
    abox,
    rbox,
  };
  if (config?.prefixes === undefined) {
    delete ontology.prefixes;
  }

  // Step 4a — emission pass + Step 5 — per-axiom strategy attribution.
  // Walks the input axioms (NOT the projected output) so the Loss
  // Signature's relationIRI matches the input's predicate IRI verbatim,
  // and naf_residue triggers off the input negation regardless of whether
  // Direct Mapping reconstructed the ObjectComplementOf shape on the OWL
  // side. Per-axiom emission counts are tracked so strategySelections can
  // attribute each LossSignature / RecoveryPayload back to its source
  // axiom.
  const newLossSignatures: LossSignature[] = [];
  const newRecoveryPayloads: RecoveryPayload[] = [];
  const sourceGraphIRI =
    config?.sourceGraphIRI ?? config?.sourceOntologyIRI ?? "";
  const arcVersion = config?.arcManifestVersion ?? ARC_MANIFEST_VERSION;
  const permissive = config?.permissiveNamespaces ?? DEFAULT_PERMISSIVE_NAMESPACES;

  // Step 5 attribution tracking. axiomEmissionCounts[i] is the (LS, RP)
  // pair attributed to axiom i. Indices that don't exist in the map
  // correspond to shape-invalid axioms (omitted from strategySelections).
  const axiomEmissionCounts = new Map<
    number,
    { lossSignatureCount: number; recoveryPayloadCount: number }
  >();

  for (let i = 0; i < axioms.length; i++) {
    const axiom = axioms[i];
    if (!isShape(axiom)) continue;
    let lsCount = 0;
    let rpCount = 0;
    const naf = await emitNafResidueIfApplicable(axiom, sourceGraphIRI, arcVersion);
    if (naf) {
      newLossSignatures.push(naf.signature);
      newRecoveryPayloads.push(naf.recovery);
      lsCount++;
      rpCount++;
    }
    const unknownRels = await emitUnknownRelationsIfApplicable(
      axiom,
      permissive,
      sourceGraphIRI,
      arcVersion,
    );
    for (const ls of unknownRels) {
      newLossSignatures.push(ls);
      lsCount++;
    }
    axiomEmissionCounts.set(i, { lossSignatureCount: lsCount, recoveryPayloadCount: rpCount });
  }

  // Step 5 strategy attribution. Pair-matched axioms are attributed to
  // their `positioned[i]` entry (the earlier of the two consumed indices);
  // the consumed-but-not-positioned entry contributed no output and is
  // attributed to its source position with strategy `'annotated-approximation'`
  // per spec §6.2 fallthrough.
  const strategySelections: StrategySelection[] = [];
  for (let i = 0; i < axioms.length; i++) {
    if (!isShape(axioms[i])) continue;
    const emission = axiomEmissionCounts.get(i) ?? {
      lossSignatureCount: 0,
      recoveryPayloadCount: 0,
    };
    const hasDirectMappingOutput = positioned[i] !== null;
    const hasAnnotatedApproximationOutput = emission.lossSignatureCount > 0;
    const strategy: ProjectionStrategy = hasAnnotatedApproximationOutput
      ? "annotated-approximation"
      : hasDirectMappingOutput
        ? "direct"
        : "annotated-approximation";
    strategySelections.push({
      axiomIndex: i,
      strategy,
      lossSignatureCount: emission.lossSignatureCount,
      recoveryPayloadCount: emission.recoveryPayloadCount,
    });
  }

  const manifest: ProjectionManifest = buildSkeletonManifest(config);

  return {
    ontology,
    manifest,
    newRecoveryPayloads,
    newLossSignatures,
    strategySelections,
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
  // Defensive entry guard: malformed axioms (null entries, missing @type,
  // non-object inputs) return null rather than crashing on property access.
  if (!isShape(axiom)) return null;

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
  if (!Array.isArray(atom.arguments)) return null;

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
    if (!isShape(a0) || !isShape(a1)) return null;
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
    if (!isShape(a0)) return null;
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
    if (!isShape(a0) || !isShape(a1)) return null;

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
  if (!isShape(u.body) || u.body["@type"] !== "fol:Universal") return null;
  const inner = u.body;
  const y = inner.variable;
  if (x === y) return null;
  if (!isShape(inner.body) || inner.body["@type"] !== "fol:Implication") return null;
  const impl = inner.body;
  if (!isShape(impl.antecedent) || impl.antecedent["@type"] !== "fol:Atom") return null;
  if (!isShape(impl.consequent) || impl.consequent["@type"] !== "fol:Atom") return null;
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
  if (!isShape(u.body) || u.body["@type"] !== "fol:Implication") return null;
  const impl = u.body;
  if (!isShape(impl.consequent) || impl.consequent["@type"] !== "fol:False") return null;
  if (!isShape(impl.antecedent) || impl.antecedent["@type"] !== "fol:Conjunction") return null;
  const conj = impl.antecedent;
  if (!Array.isArray(conj.conjuncts) || conj.conjuncts.length !== 2) return null;
  const c0 = conj.conjuncts[0];
  const c1 = conj.conjuncts[1];
  if (!isShape(c0) || !isShape(c1)) return null;
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
  if (!isShape(u.body) || u.body["@type"] !== "fol:Universal") return null;
  const inner = u.body;
  const y = inner.variable;
  if (x === y) return null;
  if (!isShape(inner.body) || inner.body["@type"] !== "fol:Implication") return null;
  const impl = inner.body;
  if (!isShape(impl.antecedent) || impl.antecedent["@type"] !== "fol:Atom") return null;
  if (!isShape(impl.consequent) || impl.consequent["@type"] !== "fol:Atom") return null;
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
  if (!isShape(u.body) || u.body["@type"] !== "fol:Universal") return null;
  const inner = u.body;
  const y = inner.variable;
  if (x === y) return null;
  if (!isShape(inner.body) || inner.body["@type"] !== "fol:Implication") return null;
  const impl = inner.body;
  if (!isShape(impl.antecedent) || impl.antecedent["@type"] !== "fol:Atom") return null;
  if (!isShape(impl.consequent) || impl.consequent["@type"] !== "fol:Atom") return null;
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
  if (!isShape(u.body) || u.body["@type"] !== "fol:Universal") return null;
  const middle = u.body;
  const y = middle.variable;
  if (!isShape(middle.body) || middle.body["@type"] !== "fol:Universal") return null;
  const inner = middle.body;
  const z = inner.variable;
  if (x === y || y === z || x === z) return null;
  if (!isShape(inner.body) || inner.body["@type"] !== "fol:Implication") return null;
  const impl = inner.body;
  if (!isShape(impl.antecedent) || impl.antecedent["@type"] !== "fol:Conjunction") return null;
  const conj = impl.antecedent;
  if (!Array.isArray(conj.conjuncts) || conj.conjuncts.length !== 2) return null;
  const c0 = conj.conjuncts[0];
  const c1 = conj.conjuncts[1];
  if (!isShape(c0) || !isShape(c1)) return null;
  if (c0["@type"] !== "fol:Atom" || c1["@type"] !== "fol:Atom") return null;
  if (!isShape(impl.consequent) || impl.consequent["@type"] !== "fol:Equality") return null;
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
  if (!isShape(u.body) || u.body["@type"] !== "fol:Universal") return null;
  const middle = u.body;
  const y = middle.variable;
  if (!isShape(middle.body) || middle.body["@type"] !== "fol:Universal") return null;
  const inner = middle.body;
  const z = inner.variable;
  if (x === y || y === z || x === z) return null;
  if (!isShape(inner.body) || inner.body["@type"] !== "fol:Implication") return null;
  const impl: FOLImplication = inner.body;
  if (!isShape(impl.antecedent) || impl.antecedent["@type"] !== "fol:Conjunction") return null;
  const conj: FOLConjunction = impl.antecedent;
  if (!Array.isArray(conj.conjuncts) || conj.conjuncts.length !== 2) return null;
  const c0 = conj.conjuncts[0];
  const c1 = conj.conjuncts[1];
  if (!isShape(c0) || !isShape(c1)) return null;
  if (c0["@type"] !== "fol:Atom" || c1["@type"] !== "fol:Atom") return null;
  if (!isShape(impl.consequent) || impl.consequent["@type"] !== "fol:Atom") return null;
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
  if (!isShape(u.body) || u.body["@type"] !== "fol:Implication") return null;
  const impl = u.body;

  // Antecedent must be a unary atom on x (NamedClass on the left). Class
  // expressions in subClass position (intersection/union/etc.) are Step 3c
  // territory.
  if (!isShape(impl.antecedent) || impl.antecedent["@type"] !== "fol:Atom") return null;
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
  // Defensive entry guard: malformed inputs (e.g., a fol:Negation with `body`
  // instead of `inner`, or a recursive descent passing undefined) return null
  // rather than crashing on property access.
  if (!isShape(shape)) return null;

  // NamedClass: fol:Atom arity-1 on contextVar.
  if (shape["@type"] === "fol:Atom") {
    if (!Array.isArray(shape.arguments)) return null;
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
      isShape(shape.arguments[1]) &&
      shape.arguments[1]["@type"] === "fol:Constant" &&
      isNamedIRI(shape.predicate) &&
      isNamedIRI((shape.arguments[1] as { iri?: unknown }).iri as string)
    ) {
      return {
        "@type": "Restriction",
        onProperty: shape.predicate,
        hasValue: (shape.arguments[1] as { iri: string }).iri,
      };
    }
    return null;
  }

  // ObjectIntersectionOf: fol:Conjunction of class-expression-shaped conjuncts.
  if (shape["@type"] === "fol:Conjunction") {
    if (!Array.isArray(shape.conjuncts) || shape.conjuncts.length < 2) return null;
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
    if (!Array.isArray(shape.disjuncts) || shape.disjuncts.length < 2) return null;
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
    if (!isShape(shape.inner)) return null;
    const inner = reconstructClassExpression(shape.inner, contextVar);
    if (!inner) return null;
    return { "@type": "ObjectComplementOf", class: inner };
  }

  // ObjectSomeValuesFrom: fol:Existential { variable: y, body:
  //   fol:Conjunction([P(contextVar, y), filler-on-y]) }
  if (shape["@type"] === "fol:Existential") {
    if (typeof shape.variable !== "string") return null;
    const innerVar = shape.variable;
    if (innerVar === contextVar) return null;
    if (!isShape(shape.body) || shape.body["@type"] !== "fol:Conjunction") return null;
    const conj = shape.body;
    if (!Array.isArray(conj.conjuncts) || conj.conjuncts.length !== 2) return null;
    const propAtom = conj.conjuncts[0];
    const filler = conj.conjuncts[1];
    if (!isShape(propAtom) || propAtom["@type"] !== "fol:Atom") return null;
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
    if (typeof shape.variable !== "string") return null;
    const innerVar = shape.variable;
    if (innerVar === contextVar) return null;
    if (!isShape(shape.body) || shape.body["@type"] !== "fol:Implication") return null;
    const impl = shape.body;
    if (!isShape(impl.antecedent) || impl.antecedent["@type"] !== "fol:Atom") return null;
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
  if (!isShape(u.body) || u.body["@type"] !== "fol:Universal") return null;
  const inner = u.body;
  const y = inner.variable;
  if (x === y) return null;
  if (!isShape(inner.body) || inner.body["@type"] !== "fol:Implication") return null;
  const impl = inner.body;
  if (!isShape(impl.antecedent) || impl.antecedent["@type"] !== "fol:Atom") return null;
  if (!isShape(impl.consequent) || impl.consequent["@type"] !== "fol:Atom") return null;
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
  if (!isShape(u.body) || u.body["@type"] !== "fol:Universal") return null;
  const inner = u.body;
  const y = inner.variable;
  if (x === y) return null;
  if (!isShape(inner.body) || inner.body["@type"] !== "fol:Implication") return null;
  const impl = inner.body;
  if (!isShape(impl.consequent) || impl.consequent["@type"] !== "fol:False") return null;
  if (!isShape(impl.antecedent) || impl.antecedent["@type"] !== "fol:Conjunction") return null;
  const conj = impl.antecedent;
  if (!Array.isArray(conj.conjuncts) || conj.conjuncts.length !== 2) return null;
  const c0 = conj.conjuncts[0];
  const c1 = conj.conjuncts[1];
  if (!isShape(c0) || !isShape(c1)) return null;
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
  if (!isShape(axiom)) return false;
  if (axiom["@type"] !== "fol:Universal") return false;
  if (!isShape(axiom.body)) return false;

  // ∀x. owl:sameAs(x,x) — reflexivity.
  if (
    axiom.body["@type"] === "fol:Atom" &&
    axiom.body.predicate === OWL_SAME_AS_IRI &&
    Array.isArray(axiom.body.arguments) &&
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
    if (!isShape(inner.body)) return false;

    // ∀x,y. P(x,y) → P(y,x) on a reserved predicate — sameAs OR
    // differentFrom symmetry.
    if (
      inner.body["@type"] === "fol:Implication" &&
      isShape(inner.body.antecedent) &&
      isShape(inner.body.consequent) &&
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
      isShape(inner.body.antecedent) &&
      isShape(inner.body.consequent) &&
      inner.body.antecedent["@type"] === "fol:Conjunction" &&
      inner.body.consequent["@type"] === "fol:Atom"
    ) {
      const conj = inner.body.antecedent;
      if (Array.isArray(conj.conjuncts) && conj.conjuncts.length === 2) {
        const c0 = conj.conjuncts[0];
        const c1 = conj.conjuncts[1];
        if (
          isShape(c0) &&
          isShape(c1) &&
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
    isShape(axiom.body.body) &&
    axiom.body.body["@type"] === "fol:Universal"
  ) {
    const x = axiom.variable;
    const y = axiom.body.variable;
    const z = axiom.body.body.variable;
    if (x === y || y === z || x === z) return false;
    if (!isShape(axiom.body.body.body) || axiom.body.body.body["@type"] !== "fol:Implication") return false;
    const impl = axiom.body.body.body;
    if (!isShape(impl.antecedent) || impl.antecedent["@type"] !== "fol:Conjunction") return false;
    const conj = impl.antecedent;
    if (!Array.isArray(conj.conjuncts) || conj.conjuncts.length !== 2) return false;
    const c0 = conj.conjuncts[0];
    const c1 = conj.conjuncts[1];
    if (!isShape(c0) || !isShape(c1) || !isShape(impl.consequent)) return false;
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
  if (!isShape(a) || !isShape(b)) return null;
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
  if (!isShape(a) || !isShape(b)) return null;
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
  if (!isShape(a) || !isShape(b)) return null;
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
  if (!isShape(u.body) || u.body["@type"] !== "fol:Universal") return null;
  const inner = u.body;
  const y = inner.variable;
  if (x === y) return null;
  if (!isShape(inner.body) || inner.body["@type"] !== "fol:Implication") return null;
  const impl = inner.body;
  if (!isShape(impl.antecedent) || impl.antecedent["@type"] !== "fol:Atom") return null;
  if (!isShape(impl.consequent) || impl.consequent["@type"] !== "fol:Atom") return null;
  const ant = impl.antecedent;
  const con = impl.consequent;
  if (!isNamedIRI(ant.predicate) || !isNamedIRI(con.predicate)) return null;
  if (!isBinaryAtomOnVariables(ant, x, y)) return null;
  if (!isBinaryAtomOnVariables(con, y, x)) return null;
  return { firstIRI: ant.predicate, secondIRI: con.predicate };
}

// ---- Defensive shape-object guard (Routing #0.5: robustness on
//      malformed FOL inputs).
//
// The pattern matchers and class-expression reconstructor descend through
// FOL term-tree property accesses. The TS type system says these are valid,
// but at runtime a malformed input (fixture typo, fuzzed input, third-party
// caller passing structurally-invalid FOL) may have missing fields. Without
// this guard, accesses like `shape.inner["@type"]` crash on `undefined`.
//
// The discipline is "matcher returns null on shape mismatch" — defense in
// depth at multiple boundary points per AUTHORING_DISCIPLINE.md. A null
// return surfaces as "this matcher doesn't apply" per spec §6.2; the
// projector falls through to other matchers (or — pending Step 4 —
// silently drops the axiom).
function isShape(x: unknown): x is { "@type": string } {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as { "@type"?: unknown })["@type"] === "string"
  );
}

// ---- Term-shape predicates ----

function isUnaryAtomOnVariable(a: FOLAtom, varName: string): boolean {
  if (!Array.isArray(a.arguments) || a.arguments.length !== 1) return false;
  return isVariableNamed(a.arguments[0], varName);
}

function isBinaryAtomOnVariables(a: FOLAtom, var0: string, var1: string): boolean {
  if (!Array.isArray(a.arguments) || a.arguments.length !== 2) return false;
  return isVariableNamed(a.arguments[0], var0) && isVariableNamed(a.arguments[1], var1);
}

function isVariableNamed(t: FOLTerm, varName: string): boolean {
  return isShape(t) && t["@type"] === "fol:Variable" && (t as { name?: unknown }).name === varName;
}

function isNamedIRI(iri: string): boolean {
  return typeof iri === "string" && iri.length > 0;
}

// ===========================================================================
// ProjectionManifest skeleton
// ===========================================================================

function buildSkeletonManifest(config: FolToOwlConfig | undefined): ProjectionManifest {
  // Per spec §6.1.0.2: ontologyIRI is preserved from source. Step 4a wires
  // source-provenance threading via config.sourceOntologyIRI /
  // sourceVersionIRI. When omitted, fields stay empty placeholders.
  // projectionTimestamp deliberately omitted — kernel stays impurity-free
  // (composition layer wires the timestamp injection per spec §7.5).
  const sourceIRI = config?.sourceOntologyIRI ?? "";
  const versionIRI = config?.sourceVersionIRI ?? "";
  return {
    ontologyIRI: sourceIRI,
    versionIRI,
    projectedFrom: sourceIRI,
    projectorVersion: `OFBT-${LIBRARY_VERSION}`,
    arcManifestVersion: config?.arcManifestVersion ?? "",
    operatingMode: config?.arcCoverage === "strict" ? "strict" : "permissive",
    activity: {
      used: sourceIRI,
    },
  };
}

// ===========================================================================
// Step 4a — Annotated Approximation emission pass
// ===========================================================================

interface NafResidueEmission {
  signature: LossSignature;
  recovery: RecoveryPayload;
}

/**
 * Detect a classical-negation pattern at the top level of an axiom and emit
 * the conservative naf_residue LossSignature + RecoveryPayload pair.
 *
 * Trigger: outer fol:Universal whose body is a fol:Implication whose
 * consequent is a fol:Negation of a unary atom. This is the lifter's
 * canonical ObjectComplementOf shape AND the projector-direct fixture's
 * NAF-residue exercise shape — the projector cannot distinguish between
 * them, so it emits naf_residue on either case (per architect's Q-β
 * conservative-emission policy 2026-05-06).
 *
 * Returns null when the axiom does not contain a classical negation, so
 * non-negation axioms pass through without emission.
 */
async function emitNafResidueIfApplicable(
  axiom: FOLAxiom,
  sourceGraphIRI: string,
  arcVersion: string,
): Promise<NafResidueEmission | null> {
  const negPredicate = findClassicalNegationPredicate(axiom);
  if (!negPredicate) return null;

  const provenance = { sourceGraphIRI, arcVersion };
  const lsId = await contentAddressedId("ofbt:ls/", {
    lossType: "naf_residue",
    relationIRI: negPredicate,
    reason: LOSS_REASON_NAF_NEGATION_UNBOUND,
    sourceGraphIRI,
    arcVersion,
  });
  const signature: LossSignature = {
    "@id": lsId,
    "@type": "ofbt:LossSignature",
    lossType: "naf_residue",
    relationIRI: negPredicate,
    reason: LOSS_REASON_NAF_NEGATION_UNBOUND,
    reasonText:
      "Classical fol:Negation in the FOL state; projector cannot determine " +
      "whether the source authored this with classical OWL negation intent " +
      "(round-trip clean) or NAF intent (round-trip lossy under default-OWA). " +
      "Conservative-emission policy per ADR-007 §1 layer separation: when in " +
      "doubt, emit naf_residue. Downstream consumers may trust the classical " +
      "projection or invoke the RecoveryPayload to reconstitute the FOL with " +
      "negation-context preserved for Phase 3 evaluator's CWA path.",
    provenance,
  };

  const rpId = await contentAddressedId("ofbt:rp/", {
    originalFOL: axiom,
    relationIRI: negPredicate,
    approximationStrategy: APPROXIMATION_STRATEGY_ANNOTATED,
  });
  const recovery: RecoveryPayload = {
    "@id": rpId,
    "@type": "ofbt:RecoveryPayload",
    approximationStrategy: APPROXIMATION_STRATEGY_ANNOTATED,
    relationIRI: negPredicate,
    originalFOL: axiom,
    projectedForm: "",
  };

  return { signature, recovery };
}

/**
 * Walk an axiom's predicate-IRI surface and emit informational
 * unknown_relation LossSignatures for any predicate whose namespace prefix
 * is NOT in the permissive-tolerance set. Phase 2 emission is informational
 * (Direct Mapping output is preserved); Phase 4 strict mode promotes this
 * to rejection per spec §3.3.
 *
 * Returns one LossSignature per unique uncatalogued predicate encountered
 * in the axiom (not per occurrence — deduplicated by the content-addressed
 * @id which derives from the predicate IRI).
 */
async function emitUnknownRelationsIfApplicable(
  axiom: FOLAxiom,
  permissiveNamespaces: ReadonlyArray<string>,
  sourceGraphIRI: string,
  arcVersion: string,
): Promise<LossSignature[]> {
  const predicates = collectPredicateIRIs(axiom);
  const out: LossSignature[] = [];
  const seen = new Set<string>();
  // Iterate sorted for deterministic emission order.
  const sorted = [...predicates].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  for (const predicateIRI of sorted) {
    if (seen.has(predicateIRI)) continue;
    seen.add(predicateIRI);
    if (isPermissivelyToleratedNamespace(predicateIRI, permissiveNamespaces)) continue;

    const lsId = await contentAddressedId("ofbt:ls/", {
      lossType: "unknown_relation",
      relationIRI: predicateIRI,
      reason: LOSS_REASON_UNKNOWN_RELATION_FALLBACK,
      sourceGraphIRI,
      arcVersion,
    });
    out.push({
      "@id": lsId,
      "@type": "ofbt:LossSignature",
      lossType: "unknown_relation",
      relationIRI: predicateIRI,
      reason: LOSS_REASON_UNKNOWN_RELATION_FALLBACK,
      reasonText:
        "Predicate IRI not registered in any loaded ARC module at projector " +
        "emission time; fallback path applied per spec §6.4 unknown_relation " +
        "contract; downstream consumers may load additional ARC modules or " +
        "accept the fallback projection. Phase 4 strict-mode operation per " +
        "spec §3.3 promotes this to a rejection contract.",
      provenance: { sourceGraphIRI, arcVersion },
    });
  }
  return out;
}

function isPermissivelyToleratedNamespace(
  iri: string,
  allowlist: ReadonlyArray<string>,
): boolean {
  for (const prefix of allowlist) {
    if (iri.startsWith(prefix)) return true;
  }
  return false;
}

/**
 * Walk a FOLAxiom recursively and collect every predicate IRI mentioned in
 * any fol:Atom node. Used by unknown_relation emission to discover
 * uncatalogued predicates.
 */
function collectPredicateIRIs(shape: FOLAxiom): Set<string> {
  const out = new Set<string>();
  walkPredicates(shape, out);
  return out;
}

function walkPredicates(shape: unknown, out: Set<string>): void {
  if (!isShape(shape)) return;
  switch (shape["@type"]) {
    case "fol:Atom": {
      const predicate = (shape as { predicate?: unknown }).predicate;
      if (typeof predicate === "string" && predicate.length > 0) {
        out.add(predicate);
      }
      return;
    }
    case "fol:Universal":
    case "fol:Existential":
      walkPredicates((shape as { body?: unknown }).body, out);
      return;
    case "fol:Implication":
      walkPredicates((shape as { antecedent?: unknown }).antecedent, out);
      walkPredicates((shape as { consequent?: unknown }).consequent, out);
      return;
    case "fol:Conjunction": {
      const conjuncts = (shape as { conjuncts?: unknown }).conjuncts;
      if (Array.isArray(conjuncts)) {
        for (const c of conjuncts) walkPredicates(c, out);
      }
      return;
    }
    case "fol:Disjunction": {
      const disjuncts = (shape as { disjuncts?: unknown }).disjuncts;
      if (Array.isArray(disjuncts)) {
        for (const d of disjuncts) walkPredicates(d, out);
      }
      return;
    }
    case "fol:Negation":
      walkPredicates((shape as { inner?: unknown }).inner, out);
      return;
  }
}

/**
 * Walk an axiom searching for the canonical naf_residue trigger pattern:
 * a fol:Negation whose `inner` is a fol:Atom on a unary or binary
 * predicate. Returns the negated predicate's IRI when found; null
 * otherwise.
 *
 * Only inspects the first negation found; multiple-negation handling is
 * deferred to a follow-up Step (per Phase 2 entry packet's bounded scope).
 */
function findClassicalNegationPredicate(shape: FOLAxiom): string | null {
  return walkForNegation(shape);
}

function walkForNegation(shape: unknown): string | null {
  if (!isShape(shape)) return null;
  switch (shape["@type"]) {
    case "fol:Negation": {
      const inner = (shape as { inner?: unknown }).inner;
      if (isShape(inner) && inner["@type"] === "fol:Atom") {
        const predicate = (inner as { predicate?: unknown }).predicate;
        if (typeof predicate === "string" && predicate.length > 0) {
          return predicate;
        }
      }
      return null;
    }
    case "fol:Universal":
    case "fol:Existential":
      return walkForNegation((shape as { body?: unknown }).body);
    case "fol:Implication": {
      const ant = walkForNegation((shape as { antecedent?: unknown }).antecedent);
      if (ant) return ant;
      return walkForNegation((shape as { consequent?: unknown }).consequent);
    }
    case "fol:Conjunction": {
      const conjuncts = (shape as { conjuncts?: unknown }).conjuncts;
      if (Array.isArray(conjuncts)) {
        for (const c of conjuncts) {
          const found = walkForNegation(c);
          if (found) return found;
        }
      }
      return null;
    }
    case "fol:Disjunction": {
      const disjuncts = (shape as { disjuncts?: unknown }).disjuncts;
      if (Array.isArray(disjuncts)) {
        for (const d of disjuncts) {
          const found = walkForNegation(d);
          if (found) return found;
        }
      }
      return null;
    }
  }
  return null;
}

/**
 * Compute a content-addressed @id per ADR-011 §1: SHA-256 lower-case hex
 * of stableStringify(discriminating-fields) prefixed with the artifact
 * scheme (`ofbt:ls/` for LossSignature, `ofbt:rp/` for RecoveryPayload).
 *
 * Uses crypto.subtle.digest per ADR-002 kernel-purity allowlist. Async by
 * necessity (Web Crypto API is Promise-returning).
 */
async function contentAddressedId(
  scheme: string,
  discriminatingFields: Record<string, unknown>,
): Promise<string> {
  const canonical = stableStringify(discriminatingFields);
  const bytes = new TextEncoder().encode(canonical);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${scheme}${hex}`;
}
