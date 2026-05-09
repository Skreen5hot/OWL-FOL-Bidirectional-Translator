/**
 * Kernel Public Barrel
 *
 * Re-exports the kernel layer's public surface. Composition and adapter
 * surfaces (createSession, CLI, etc.) live in their own barrels;
 * the package's top-level entry at src/index.ts re-exports across layers.
 *
 * Per the architect's purity ruling, this file MUST NOT import from
 * src/composition/ or src/adapters/. The purity checker enforces this.
 *
 * Phase 1 adds: owlToFol (lifter)
 * Phase 2 adds: folToOwl, roundTripCheck, audit artifact types
 * Phase 3 adds: evaluate, checkConsistency
 */

// --- Phase 0.2: error class hierarchy (API spec §10) ---
export {
  OFBTError,
  ParseError,
  UnsupportedConstructError,
  IRIFormatError,
  RoundTripError,
  SessionRequiredError,
  SessionDisposedError,
  StepCapExceededError,
  SessionStepCapExceededError,
  CycleDetectedError,
  ARCManifestError,
  TauPrologVersionMismatchError,
} from "./errors.js";
export type { ParsePosition } from "./errors.js";
// RoundTripDiff is exported from projector-types.js (Phase 2 Step 7's
// canonical definition). errors.ts retains a placeholder type for Phase 0
// forward-compatibility; consumers import the refined type from the kernel
// barrel which re-exports from projector-types.

// --- Phase 0.3: frozen reason-code enum (API spec §11) ---
export { REASON_CODES, REASON_CODES_LIST, isReasonCode } from "./reason-codes.js";
export type { ReasonCode } from "./reason-codes.js";

// --- Phase 3 Step 1b: evaluate() type surface + pure validation helper
//     (API spec §7.1 + §7.5). Composition-layer evaluate(session, ...) lives
//     in src/composition/evaluate.ts and re-exports through src/index.ts. ---
export {
  validateEvaluableQuery,
  DEFAULT_PER_QUERY_STEP_CAP,
} from "./evaluate-types.js";
export type {
  EvaluableQuery,
  EvaluationResult,
  Binding,
  QueryParameters,
} from "./evaluate-types.js";

// --- Phase 3 Step 3: FOL → Tau Prolog clause translation per ADR-007 §11.
//     Pure (kernel-Layer-0) string translator. Composition-layer
//     loadOntology() calls these and assertz's the resulting clauses
//     into the session's Tau Prolog state. ---
export {
  translateFOLToPrologClauses,
  translateEvaluableQueryToPrologGoal,
  iriToPrologAtom,
} from "./fol-to-prolog.js";
export type {
  PrologTranslation,
  SkippedAxiom,
} from "./fol-to-prolog.js";

// --- Phase 0.4: version surfacing + Tau Prolog verification (API spec §9) ---
export { getVersionInfo, verifyTauPrologVersion } from "./version.js";
export type { VersionInfo, TauPrologVerification } from "./version.js";
export { registerTauPrologProbe } from "./tau-prolog-probe.js";
export type { TauPrologProbe } from "./tau-prolog-probe.js";

// --- Phase 1 Step 1: lifter foundation ---
export { owlToFol } from "./lifter.js";
export type { LifterConfig } from "./lifter.js";

// --- Phase 2 Step 1: projector skeleton (API §6.2) + audit artifact types
//     (API §6.4) + frozen LOSS_SIGNATURE_SEVERITY_ORDER. Strategy routing
//     and audit-artifact emission land in later Steps. ---
export { folToOwl } from "./projector.js";
export { roundTripCheck } from "./round-trip.js";
export {
  LOSS_SIGNATURE_SEVERITY_ORDER,
} from "./projector-types.js";
export type {
  LossType,
  LossSignature,
  LossSignatureProvenance,
  RecoveryPayload,
  ApproximationStrategy,
  OperatingMode,
  ProjectionActivity,
  ProjectionManifest,
  ProjectionStrategy,
  StrategySelection,
  FolToOwlConfig,
  OWLConversionResult,
  ConversionMetadata,
  FOLConversionResult,
  RoundTripResult,
  RoundTripDiff,
} from "./projector-types.js";

export { canonicalizeIRI, canonicalizeWithOntology } from "./iri.js";
export type {
  OWLOntology,
  TBoxAxiom,
  ABoxAxiom,
  RBoxAxiom,
  AnnotationAxiom,
  ClassExpression,
  TypedLiteral,
  SubClassOfAxiom,
  EquivalentClassesAxiom,
  DisjointWithAxiom,
  ClassDefinitionAxiom,
  ObjectPropertyDomainAxiom,
  ObjectPropertyRangeAxiom,
  ObjectPropertyCharacteristicAxiom,
  InverseObjectPropertiesAxiom,
  ObjectPropertyChainAxiom,
  SubObjectPropertyOfAxiom,
  EquivalentObjectPropertiesAxiom,
  DisjointObjectPropertiesAxiom,
  NamedClass,
  ClassIntersection,
  ClassUnion,
  ClassComplement,
  ObjectSomeValuesFrom,
  ObjectAllValuesFrom,
  ObjectHasValue,
  ObjectMinCardinality,
  ObjectMaxCardinality,
  ObjectExactCardinality,
  ClassAssertion,
  ObjectPropertyAssertion,
  DataPropertyAssertion,
  SameIndividual,
  DifferentIndividuals,
} from "./owl-types.js";
export type {
  FOLAxiom,
  FOLImplication,
  FOLConjunction,
  FOLDisjunction,
  FOLNegation,
  FOLUniversal,
  FOLExistential,
  FOLAtom,
  FOLEquality,
  FOLFalse,
  FOLTerm,
  FOLVariable,
  FOLConstant,
  FOLLiteral,
  FOLTypedLiteral,
} from "./fol-types.js";

// --- Template carryover (retired by Phase 1 exit; preserved through Step 1
//     so the spec tests determinism/no-network/snapshot remain green) ---
export { transform } from "./transform.js";
export type {
  JsonLdDocument,
  TransformOutput,
  TransformError,
  Provenance,
  UncertaintyAnnotation,
} from "./transform.js";
export { stableStringify } from "./canonicalize.js";
