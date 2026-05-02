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
export type { ParsePosition, FOLAxiom, RoundTripDiff } from "./errors.js";

// --- Phase 0.3: frozen reason-code enum (API spec §11) ---
export { REASON_CODES, REASON_CODES_LIST, isReasonCode } from "./reason-codes.js";
export type { ReasonCode } from "./reason-codes.js";

// --- Phase 0.4: version surfacing + Tau Prolog verification (API spec §9) ---
export { getVersionInfo, verifyTauPrologVersion } from "./version.js";
export type { VersionInfo, TauPrologVerification } from "./version.js";
export { registerTauPrologProbe } from "./tau-prolog-probe.js";
export type { TauPrologProbe } from "./tau-prolog-probe.js";

// --- Template carryover (replaced by owlToFol in Phase 1) ---
export { transform } from "./transform.js";
export type {
  JsonLdDocument,
  TransformOutput,
  TransformError,
  Provenance,
  UncertaintyAnnotation,
} from "./transform.js";
export { stableStringify } from "./canonicalize.js";
