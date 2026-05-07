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

  /**
   * Source-provenance threading for ProjectionManifest fields per spec
   * §6.1.0.2. In a typical round trip, the caller passes the source
   * ontology's `ontologyIRI` here so the projected manifest preserves the
   * source's logical identity. When omitted, manifest emits empty placeholder
   * strings for these fields.
   */
  sourceOntologyIRI?: string;
  sourceVersionIRI?: string;

  /**
   * Source graph IRI used as the `provenance.sourceGraphIRI` field on
   * emitted LossSignatures (API §6.4.1). Falls back to `sourceOntologyIRI`
   * when omitted; falls back to the empty string when both are omitted.
   */
  sourceGraphIRI?: string;

  /**
   * Permissive-namespace allowlist for unknown_relation LossSignature
   * emission (Phase 2 Step 4a). When the projector encounters a predicate
   * IRI whose namespace prefix is in this set, no unknown_relation is
   * emitted. When the prefix is NOT in this set, an informational
   * unknown_relation LossSignature accompanies the Direct Mapping output.
   *
   * When omitted, the projector uses a default tolerance set that includes
   * Phase 1's `http://example.org/test/` test prefix plus the OWL / RDF /
   * RDFS / XSD vocabularies plus the BFO/OBO Foundry namespace.
   *
   * Phase 4 strict-mode (per spec §3.3) promotes this from informational
   * emission to rejection; Phase 2 ships the informational variant.
   */
  permissiveNamespaces?: ReadonlyArray<string>;
}

/**
 * Phase 2 Step 5 — strategy router output.
 *
 * Tier names per spec §6.2 (strategy selection algorithm). v0.1 ships
 * `direct` + `annotated-approximation`; `property-chain` activates at
 * Step 6 (Property-Chain Realization).
 */
export type ProjectionStrategy =
  | "direct"
  | "annotated-approximation"
  | "property-chain";

/**
 * Per-axiom strategy attribution. Reported by `folToOwl` so consumers can
 * verify projection-strategy correctness (the "correct emission of the
 * wrong projection strategy" failure mode that Phase 2 entry packet §3.3
 * names as the high-risk concern). One entry per shape-valid input axiom;
 * shape-invalid axioms (e.g., null entries, missing @type) are omitted
 * per Routing #0.5 robustness discipline.
 */
export interface StrategySelection {
  axiomIndex: number;
  strategy: ProjectionStrategy;
  /**
   * Number of LossSignatures emitted attributable to this axiom. Zero for
   * `direct` selections; non-zero for `annotated-approximation` selections
   * that triggered an emission path (naf_residue, unknown_relation, etc.).
   */
  lossSignatureCount: number;
  /**
   * Number of RecoveryPayloads emitted attributable to this axiom. Zero
   * for informational AA selections (e.g., unknown_relation); non-zero
   * for reversible AA selections (e.g., naf_residue).
   */
  recoveryPayloadCount: number;
}

/**
 * FOL-side conversion result per API §6.1's `FOLConversionResult` interface.
 *
 * Phase 1's `owlToFol` returns `FOLAxiom[]` directly; `roundTripCheck`
 * (Step 7) wraps that output into this shape per API §6.3's
 * `intermediateForm` contract. When Phase 1's lifter is later refactored
 * to return `FOLConversionResult` directly per API §6.1, this type can be
 * shared.
 */
export interface ConversionMetadata {
  sourceOntologyIRI: string;
  /**
   * Source bnode → canonical Skolem mapping. Phase 1 lifter doesn't expose
   * this surface (the bnode registry is internal); Step 7 ships an empty
   * Map here pending the lifter refactor.
   */
  bnodeRegistry: Map<string, string>;
  arcCoverage: "strict" | "permissive";
  arcManifestVersion: string;
}

export interface FOLConversionResult {
  axioms: FOLAxiom[];
  recoveryPayloads: RecoveryPayload[];
  lossSignatures: LossSignature[];
  metadata: ConversionMetadata;
}

/**
 * Round-trip diff per API §6.3 + spec §8.1 parity criterion. Populated on
 * `RoundTripResult` only when `equivalent === false`.
 */
export interface RoundTripDiff {
  /**
   * FOL axioms present in source FOL (F₂ in spec §8.1's notation) but
   * absent from re-lifted output (F₃). Recovered axioms (those whose
   * `originalFOL` appears in a Recovery Payload) are subtracted from this
   * set per the "modulo L" qualifier of spec §8.1.
   */
  missingFromOutput: FOLAxiom[];
  /**
   * FOL axioms present in re-lifted output (F₃) but absent from source
   * FOL (F₂). The "no-fabrication" half of the bidirectional check per
   * spec §8.2.
   */
  extraInOutput: FOLAxiom[];
  /**
   * Coarse classification of the diff axioms' FOL bucket. `tbox` if all
   * diff entries are TBox-shaped (universals with unary-atom bodies);
   * `rbox` if all are RBox-shaped (universals with binary-atom bodies);
   * `abox` if all are bare-atom assertions; `mixed` otherwise.
   */
  classification: "tbox" | "abox" | "rbox" | "mixed";
}

/**
 * Round-trip result per API §6.3. `equivalent === true` means strict parity
 * holds modulo the Loss Signature ledger per spec §8.1; `equivalent ===
 * false` means the parity criterion failed (the diff captures the
 * un-recovered divergence).
 */
export interface RoundTripResult {
  equivalent: boolean;
  diff?: RoundTripDiff;
  intermediateForm: FOLConversionResult;
  finalForm: OWLConversionResult;
}

export interface OWLConversionResult {
  ontology: OWLOntology;
  manifest: ProjectionManifest;
  newRecoveryPayloads: RecoveryPayload[];
  newLossSignatures: LossSignature[];
  /**
   * Per-axiom strategy attribution per spec §6.2 — Step 5 contract. Phase 2
   * entry packet §3.3's strategy-routing fixtures (strategy_routing_direct
   * / _annotated / _chain / _no_match) re-exercise their assertions
   * against this field at Step 5 entry per phase5Reactivation.
   */
  strategySelections: ReadonlyArray<StrategySelection>;
}
