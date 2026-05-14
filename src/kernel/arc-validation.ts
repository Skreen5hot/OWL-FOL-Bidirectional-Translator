/**
 * ARC Module Schema Validation — Phase 4 Step 1 (per spec §3.6.2 +
 * phase-4-entry.md §7 step ledger).
 *
 * Kernel-pure schema validator for ARC modules. Used at module
 * registration time (`registerARCModule` in `arc-module-registry.ts`)
 * and at loadOntology time when the composition layer parses an
 * arcModules input — both surfaces enforce structural correctness
 * before the lifter (Phase 4 Step 3+) consults the module.
 *
 * Validation scope at Step 1 (minimum-viable schema check):
 *   - Top-level shape: object with discriminator `@type === "ARCModule"`,
 *     required fields `moduleId`, `arcManifestVersion`, `entries`
 *   - Per-entry shape: object with discriminator `@type === "ARCEntry"`
 *     and the 12 required text fields
 *
 * Out of scope at Step 1 (forward-tracked to subsequent Steps):
 *   - Semantic validation (does `iri` resolve? does `subPropertyOf`
 *     name a real parent? do `domain` / `range` name real classes?) —
 *     Step 2 (dependency validation per spec §3.6.4)
 *   - Cross-module consistency (does the loaded module set form a
 *     coherent import closure?) — Step 6 (`regularityCheck`)
 *   - Lift-correctness checks (do entries' owlCharacteristics produce
 *     the expected FOL output shape?) — Step 3 (BFO ARC content lift
 *     correctness)
 *
 * Pure: no Date, no random, no I/O. Pure structural inspection.
 */

import type { ARCModule, ARCEntry } from "./arc-types.js";

/**
 * Result of a structural validation pass. Discriminated union per the
 * ConsistencyResult / TauPrologVerification precedent — consumers
 * switch on `valid` and inspect `errors` (a list of human-readable
 * messages) when invalid.
 */
export type ARCValidationResult =
  | { valid: true; module: ARCModule }
  | { valid: false; errors: string[] };

const REQUIRED_ENTRY_TEXT_FIELDS: ReadonlyArray<keyof ARCEntry> = [
  "name",
  "level",
  "context",
  "notation",
  "formalDefinition",
  "owlCharacteristics",
  "owlRealization",
  "subPropertyOf",
  "domain",
  "range",
  "iri",
  "notes",
];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

/**
 * Phase 4 Step 4 (Q-4-Step4-A architect ratification 2026-05-11) helper:
 * IRI well-formedness check for DisjointnessAxiom.classes entries.
 *
 * Per Q-4-Step4-A.1 + canonical-sources sub-ruling: each class IRI must
 * be a non-empty string. Beyond non-emptiness, the validator does NOT
 * verify the IRI resolves against any canonical source — that's the
 * `binding-immediately` discipline's job at vendoring/authoring time
 * (per the verification ritual report for the BFO Disjointness Map's
 * canonical-IRI confirmation against bfo.owl). Structural validation
 * here covers only string non-emptiness; semantic correctness routes
 * to the verification ritual binding-immediately surface.
 */
function isWellFormedIRI(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function validateDisjointnessAxiom(
  axiom: unknown,
  index: number,
  errors: string[]
): void {
  if (!isPlainObject(axiom)) {
    errors.push(`disjointnessAxioms[${index}]: not an object`);
    return;
  }
  if (axiom["@type"] !== "DisjointnessAxiom") {
    errors.push(
      `disjointnessAxioms[${index}]: @type must be "DisjointnessAxiom" (got ${JSON.stringify(axiom["@type"])})`
    );
  }
  const classes = axiom.classes;
  if (!Array.isArray(classes)) {
    errors.push(
      `disjointnessAxioms[${index}].classes: must be an array (got ${typeof classes})`
    );
    return;
  }
  // N ≥ 2 cardinality per Q-4-Step4-A.1 ratification (N-ary pairwise-disjoint
  // semantics). A 0- or 1-element list cannot express disjointness.
  if (classes.length < 2) {
    errors.push(
      `disjointnessAxioms[${index}].classes: must contain ≥ 2 elements per Q-4-Step4-A.1 N-ary pairwise-disjoint semantics (got ${classes.length})`
    );
  }
  for (let i = 0; i < classes.length; i++) {
    if (!isWellFormedIRI(classes[i])) {
      errors.push(
        `disjointnessAxioms[${index}].classes[${i}]: must be a non-empty string IRI (got ${JSON.stringify(classes[i])})`
      );
    }
  }
}

function validateEntry(
  entry: unknown,
  index: number,
  errors: string[]
): void {
  if (!isPlainObject(entry)) {
    errors.push(`entries[${index}]: not an object`);
    return;
  }
  if (entry["@type"] !== "ARCEntry") {
    errors.push(
      `entries[${index}]: @type must be "ARCEntry" (got ${JSON.stringify(entry["@type"])})`
    );
  }
  for (const field of REQUIRED_ENTRY_TEXT_FIELDS) {
    if (typeof entry[field] !== "string") {
      errors.push(
        `entries[${index}].${field}: must be string (got ${typeof entry[field]})`
      );
    }
  }
}

/**
 * Validate an unknown value against the ARCModule schema.
 *
 * Returns `{ valid: true, module }` when the value conforms structurally;
 * `{ valid: false, errors: [...] }` when one or more fields fail. The
 * validator collects ALL errors in a single pass (does not short-circuit
 * on first failure) so consumers can report the full picture in one
 * round-trip.
 *
 * Per the architect's "no expansion beyond Step 1 skeleton" guard: this
 * checks structural shape only. Semantic validation routes to Step 2
 * (dependency validation) + Step 3 (lift correctness).
 */
export function validateARCModule(value: unknown): ARCValidationResult {
  const errors: string[] = [];

  if (!isPlainObject(value)) {
    return { valid: false, errors: ["root: ARC module must be a JSON object"] };
  }

  if (value["@type"] !== "ARCModule") {
    errors.push(
      `@type: must be "ARCModule" (got ${JSON.stringify(value["@type"])})`
    );
  }

  if (typeof value.moduleId !== "string" || value.moduleId.length === 0) {
    errors.push(
      `moduleId: must be a non-empty string (got ${JSON.stringify(value.moduleId)})`
    );
  }

  if (typeof value.arcManifestVersion !== "string" || value.arcManifestVersion.length === 0) {
    errors.push(
      `arcManifestVersion: must be a non-empty string (got ${JSON.stringify(value.arcManifestVersion)})`
    );
  }

  if (!Array.isArray(value.entries)) {
    errors.push(`entries: must be an array (got ${typeof value.entries})`);
  } else {
    for (let i = 0; i < value.entries.length; i++) {
      validateEntry(value.entries[i], i, errors);
    }
  }

  // Phase 4 Step 4 (Q-4-Step4-A): optional disjointnessAxioms field. When
  // present, must be an array; each element validates per
  // validateDisjointnessAxiom (N ≥ 2 cardinality + IRI well-formedness).
  if (value.disjointnessAxioms !== undefined) {
    if (!Array.isArray(value.disjointnessAxioms)) {
      errors.push(
        `disjointnessAxioms: must be an array when present (got ${typeof value.disjointnessAxioms})`
      );
    } else {
      for (let i = 0; i < value.disjointnessAxioms.length; i++) {
        validateDisjointnessAxiom(value.disjointnessAxioms[i], i, errors);
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }
  return { valid: true, module: value as unknown as ARCModule };
}
