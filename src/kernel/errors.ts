/**
 * OFBT Typed Error Class Hierarchy
 *
 * Per API spec §10. Twelve typed classes total. Consumers catch by class,
 * not by message (Fandaws Consumer Requirement §2.9).
 *
 * Every OFBT failure throws an OFBTError subclass. Generic Error or string
 * throws are never produced by OFBT-owned code paths.
 *
 * Phase 0 deliverable. Type bindings for FOLAxiom / ParsePosition /
 * RoundTripDiff are placeholders here; they are refined in Phase 1
 * (FOLAxiom in lifter), Phase 2 (RoundTripDiff in projector), and as
 * the parser surfaces solidify.
 */

import { LIBRARY_VERSION } from "./version-constants.js";

// Placeholder type aliases — refined in later phases.
export type ParsePosition = {
  line?: number;
  column?: number;
  offset?: number;
};

// Local type alias for the StepCapExceededError.query field. Use `unknown`
// here rather than re-exporting FOLAxiom from fol-types.ts to avoid a
// circular dependency between errors.ts and lifter.ts (which depends on
// errors.ts). Consumers casting StepCapExceededError.query should import
// FOLAxiom from "@ontology-of-freedom/ofbt" directly.
type LocalFOLAxiom = unknown;

export type RoundTripDiff = unknown; // refined in Phase 2

/**
 * Base class for every OFBT-raised error.
 *
 * Always carries:
 *   - `code`: machine-readable code matching the corresponding reason-enum member when applicable
 *   - `libraryVersion`: the OFBT version that threw (so consumer-side telemetry can attribute regressions)
 *
 * Subclasses add domain-specific fields documented in API spec §10.2-§10.7.
 */
export class OFBTError extends Error {
  readonly code: string;
  readonly libraryVersion: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.libraryVersion = LIBRARY_VERSION;
  }
}

// --- §10.2 Conversion errors ---

export class ParseError extends OFBTError {
  readonly construct?: string;
  readonly position?: ParsePosition;

  constructor(message: string, opts: { construct?: string; position?: ParsePosition } = {}) {
    super(message, "parse_error");
    this.construct = opts.construct;
    this.position = opts.position;
  }
}

export class UnsupportedConstructError extends OFBTError {
  readonly construct: string;
  readonly suggestion?: string;

  constructor(message: string, opts: { construct: string; suggestion?: string }) {
    super(message, "unsupported_construct");
    this.construct = opts.construct;
    this.suggestion = opts.suggestion;
  }
}

export class IRIFormatError extends OFBTError {
  readonly iri: string;
  readonly form: "full-uri" | "curie" | "bare-uri" | "unrecognized";

  constructor(
    message: string,
    opts: { iri: string; form: "full-uri" | "curie" | "bare-uri" | "unrecognized" }
  ) {
    super(message, "iri_format_error");
    this.iri = opts.iri;
    this.form = opts.form;
  }
}

export class RoundTripError extends OFBTError {
  readonly diff: RoundTripDiff;

  constructor(message: string, opts: { diff: RoundTripDiff }) {
    super(message, "round_trip_error");
    this.diff = opts.diff;
  }
}

// --- §10.3 Session errors ---

export class SessionRequiredError extends OFBTError {
  readonly functionName: string;

  constructor(functionName: string) {
    super(
      `${functionName} requires a Session argument. Pass a value returned by createSession().`,
      "session_required"
    );
    this.functionName = functionName;
  }
}

export class SessionDisposedError extends OFBTError {
  readonly disposalTimestamp?: string;

  constructor(message: string, opts: { disposalTimestamp?: string } = {}) {
    super(message, "session_disposed");
    this.disposalTimestamp = opts.disposalTimestamp;
  }
}

// --- §10.4 Evaluation errors ---

export class StepCapExceededError extends OFBTError {
  readonly query: LocalFOLAxiom;
  readonly steps: number;
  readonly stepCap: number;

  constructor(message: string, opts: { query: LocalFOLAxiom; steps: number; stepCap: number }) {
    super(message, "step_cap_exceeded");
    this.query = opts.query;
    this.steps = opts.steps;
    this.stepCap = opts.stepCap;
  }
}

export class SessionStepCapExceededError extends OFBTError {
  readonly aggregateSteps: number;
  readonly maxAggregateSteps: number;

  constructor(
    message: string,
    opts: { aggregateSteps: number; maxAggregateSteps: number }
  ) {
    super(message, "aggregate_step_cap_exceeded");
    this.aggregateSteps = opts.aggregateSteps;
    this.maxAggregateSteps = opts.maxAggregateSteps;
  }
}

export class CycleDetectedError extends OFBTError {
  readonly cycle: string[];
  readonly inSubsystem: "sld-resolution" | "class-hierarchy";

  constructor(
    message: string,
    opts: { cycle: string[]; inSubsystem: "sld-resolution" | "class-hierarchy" }
  ) {
    super(message, "cycle_detected");
    this.cycle = opts.cycle;
    this.inSubsystem = opts.inSubsystem;
  }
}

// --- §10.5 Manifest and configuration errors ---

export class ARCManifestError extends OFBTError {
  readonly missingProperties?: string[];
  readonly malformedEntries?: string[];

  constructor(
    message: string,
    opts: { missingProperties?: string[]; malformedEntries?: string[] } = {}
  ) {
    super(message, "arc_manifest_error");
    this.missingProperties = opts.missingProperties;
    this.malformedEntries = opts.malformedEntries;
  }
}

// --- §10.7 Tau Prolog peer-dependency error ---

export class TauPrologVersionMismatchError extends OFBTError {
  readonly expected: string;
  readonly found: string | null;
  readonly resolution: string;

  constructor(
    message: string,
    opts: { expected: string; found: string | null; resolution: string }
  ) {
    super(message, "tau_prolog_version_mismatch");
    this.expected = opts.expected;
    this.found = opts.found;
    this.resolution = opts.resolution;
  }
}
