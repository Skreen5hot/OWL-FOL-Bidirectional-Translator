/**
 * Projector Audit Artifact Types
 *
 * Per API spec §6.2 (folToOwl I/O surface) + §6.4 (LossSignature,
 * RecoveryPayload, ProjectionManifest schemas) + behavioral spec §7.
 *
 * Pure type definitions and the frozen LOSS_SIGNATURE_SEVERITY_ORDER constant.
 * Phase 2 Step 1 ships these as the foundation for the folToOwl skeleton;
 * later Steps emit instances of these types from the strategy router.
 *
 * Schema stability rules (per API §6.4.1):
 *   - Adding a new LossType is a minor version bump.
 *   - Reordering / renaming / removing existing LossType members is major.
 *   - The severity ordering is committed contract; reordering is major.
 */

import type { FOLAxiom } from "./fol-types.js";
import type { LifterConfig } from "./lifter.js";
import type { OWLOntology } from "./owl-types.js";

// --- API §6.4.1 LossSignature ---

export type LossType =
  | "closure_truncated"
  | "naf_residue"
  | "unknown_relation"
  | "arity_flattening"
  | "bnode_introduced"
  | "coherence_violation"
  | "lexical_distinct_value_equal"
  | "una_residue";

export interface LossSignatureProvenance {
  sourceGraphIRI: string;
  arcVersion: string;
  timestamp?: string;
}

export interface LossSignature {
  "@id": string;
  "@type": "ofbt:LossSignature";
  lossType: LossType;
  relationIRI: string;
  reason: string;
  reasonText: string;
  provenance: LossSignatureProvenance;
}

/**
 * Frozen severity ordering (most severe first) per API §6.4.1.
 *
 * Reordering, renaming, or removing a level is a major version bump per the
 * stability contract. Adding a new level in the middle of the list is a
 * minor version bump.
 */
export const LOSS_SIGNATURE_SEVERITY_ORDER: ReadonlyArray<LossType> = Object.freeze([
  "coherence_violation",
  "naf_residue",
  "arity_flattening",
  "closure_truncated",
  "unknown_relation",
  "bnode_introduced",
  "una_residue",
  "lexical_distinct_value_equal",
]);

// --- API §6.4.2 RecoveryPayload ---

export type ApproximationStrategy = "PROPERTY_CHAIN" | "ANNOTATED_APPROXIMATION";

export interface RecoveryPayload {
  "@id": string;
  "@type": "ofbt:RecoveryPayload";
  approximationStrategy: ApproximationStrategy;
  relationIRI: string;
  originalFOL: FOLAxiom;
  projectedForm: string;
  axiomTemplate?: string;
  bindings?: Record<string, string>;
  scopeNotes?: string[];
}

// --- Behavioral spec §7.4 ProjectionManifest (per spec §6.1.0.2) ---

export type OperatingMode = "strict" | "permissive";

export interface ProjectionActivity {
  startedAtTime?: string;
  endedAtTime?: string;
  used: string;
}

export interface ProjectionManifest {
  ontologyIRI: string;
  versionIRI: string;
  projectedFrom: string;
  projectionTimestamp?: string;
  projectorVersion: string;
  arcManifestVersion: string;
  operatingMode: OperatingMode;
  activity: ProjectionActivity;
}

// --- API §6.2 folToOwl I/O surface ---

export interface FolToOwlConfig extends LifterConfig {
  /**
   * Prefix table for the OWL output (API §3.10.4).
   *
   * - When omitted, output uses full URI form for all IRIs.
   * - When provided, IRIs in the output use CURIE form for matching prefixes.
   *
   * In a typical round trip after `owlToFol`, the natural value is the
   * source ontology's `prefixes` field (per the API §6.2 worked example).
   */
  prefixes?: Record<string, string>;
}

export interface OWLConversionResult {
  ontology: OWLOntology;
  manifest: ProjectionManifest;
  newRecoveryPayloads: RecoveryPayload[];
  newLossSignatures: LossSignature[];
}
