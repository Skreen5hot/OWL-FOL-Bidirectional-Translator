/**
 * FOL → OWL Projector (Phase 2 Step 1: skeleton)
 *
 * Per API spec §6.2 + behavioral spec §6.1 (three-strategy router) +
 * §7 (audit artifacts) + §8.1 (round-trip parity).
 *
 * STEP 1 SCOPE — the architect-ratified scaffolding:
 *   - `folToOwl(axioms, recoveryPayloads?, config?)` exported with the
 *     API §6.2 signature. Async per the API §0.2 I/O profile (kernel
 *     does no I/O; the Promise contract is established for parity with
 *     `owlToFol` and to leave room for future projection-normalization
 *     async work).
 *   - `prefixes` parameter handling per API §3.10.4: when supplied,
 *     output ontology carries the prefix table; when omitted, output
 *     prefixes is undefined (caller's full-URI / CURIE choice surfaces
 *     when later Steps emit IRIs into the projected ontology).
 *   - Empty / structural OWLConversionResult: zero TBox/ABox/RBox content,
 *     a structurally-valid ProjectionManifest with placeholder strings,
 *     empty newRecoveryPayloads + newLossSignatures arrays.
 *
 * NOT in Step 1 (deferred to later Steps per phase-2-entry.md §7.4):
 *   - Strategy router (Direct Mapping / Property-Chain Realization /
 *     Annotated Approximation per spec §6.1.1-§6.1.3) — Steps 2-4.
 *   - Strategy selection algorithm with tiered fallthrough per spec §6.2
 *     — Step 5.
 *   - Audit-artifact emission (LossSignature, RecoveryPayload, content-
 *     addressed `@id` per spec §7.5) — Steps 4-6.
 *   - ProjectionManifest event-time provenance threading (timestamps,
 *     minted versionIRI per spec §6.1.0.2) — composition layer wires
 *     impurity-bearing fields when they land; kernel stays pure.
 *   - `roundTripCheck` per API §6.3 — Step 7.
 *
 * PURITY. Per ROADMAP cross-cutting Layer Boundaries: this file is
 * Layer 0 (kernel) and MUST NOT use any non-deterministic API (no
 * temporal-clock readers, no random sources, no environment / network
 * access). The skeleton's ProjectionManifest carries placeholder
 * strings where event-time fields will land; later Steps thread those
 * through the composition layer per spec §7.5 (timestamps recorded but
 * excluded from the byte-stability hash).
 */

import { LIBRARY_VERSION } from "./version-constants.js";
import type { FOLAxiom } from "./fol-types.js";
import type { OWLOntology } from "./owl-types.js";
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
 * approximations needed for parity per behavioral spec §7.3. Step 1's
 * skeleton accepts it without yet round-tripping its content; later Steps
 * route Recovery Payload contents back into the projected ontology when
 * the strategy router emits them.
 *
 * The `config.prefixes` field controls the surface form of IRIs in the
 * output. Step 1 threads the prefix table through to the output ontology;
 * later Steps' IRI emission will read it for CURIE form when a matching
 * prefix is registered.
 */
export async function folToOwl(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  axioms: FOLAxiom[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  recoveryPayloads?: RecoveryPayload[],
  config?: FolToOwlConfig,
): Promise<OWLConversionResult> {
  // Step 1 skeleton: emit a structurally-valid result with zero projected
  // axioms. Later Steps wire strategy routing into this function.

  const ontology: OWLOntology = {
    ontologyIRI: "",
    prefixes: config?.prefixes,
    tbox: [],
    abox: [],
    rbox: [],
  };

  // Drop the prefixes key entirely when the caller did not supply one.
  // Surface form: an OWLOntology without `prefixes` is the canonical
  // full-URI-output shape per API §3.10.4.
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

function buildSkeletonManifest(config: FolToOwlConfig | undefined): ProjectionManifest {
  // Per spec §6.1.0.2: ontologyIRI is preserved from source (Step 2+ wires
  // source-ontology-IRI threading via config or recoveryPayloads-derived
  // provenance). Step 1 emits empty placeholders deterministically.
  // projectionTimestamp deliberately omitted — kernel impurity-free.
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
