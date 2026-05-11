/**
 * ARC Module Types — Phase 4 Step 1 (per spec §3.6.2 + phase-4-entry.md §7).
 *
 * Kernel-pure (Layer 0) type definitions for ARC (Architecture, Relations,
 * Concepts) modules. An ARC module bundles ontology-content metadata that
 * the lifter consults at lift time when the caller declares `arcModules`
 * in SessionConfiguration / LifterConfiguration.
 *
 * Shape matches the JSON-LD encoding shipped at `arc/core/bfo-2020.json`
 * (40 ARCEntry instances for BFO 2020) + `arc/core/iao-information.json`
 * (Phase 5 IAO skeleton). The composition / adapter layers parse the JSON
 * files; this kernel-pure type defines the shape the kernel consumes.
 *
 * Architectural pattern: kernel exposes the type + a registry seam
 * (`arc-module-registry.ts`) the composition / adapter layer populates at
 * runtime. The lifter (Step 3+) queries the registry by `moduleId` —
 * keeping the kernel itself pure (no filesystem I/O).
 *
 * Pure: no Date, no random, no I/O. Types only.
 */

/**
 * A single ARC entry describing one ontology-content surface (a relation,
 * property characteristic, or class commitment). Field semantics follow
 * the catalogue shape per phase-4-entry.md §1 row 4 (40-entry BFO 2020
 * ARC content authored by the Aaron-led parallel workstream against the
 * v3 relations catalogue).
 *
 * Fields use `"—"` (em-dash) as the "not applicable" sentinel per the
 * upstream catalogue convention; consumers comparing against typed
 * values should treat `"—"` as undefined.
 */
export interface ARCEntry {
  /** Discriminator. Always the literal string `"ARCEntry"`. */
  "@type": "ARCEntry";
  /** Human-readable name of the relation / characteristic. */
  name: string;
  /** Categorization axis (e.g., "Instance-level", "Type-level"). */
  level: string;
  /** Semantic context (e.g., "Dependence", "Mereology", "Spatial"). */
  context: string;
  /** Notation or `"—"` if not applicable. */
  notation: string;
  /** Formal definition or `"—"` if not applicable. */
  formalDefinition: string;
  /**
   * OWL characteristic annotation (e.g., `"owl:TransitiveProperty"`)
   * or `"—"` if none. Drives the lifter's emission of property
   * characteristic axioms at Phase 4 Step 3.
   */
  owlCharacteristics: string;
  /** Upstream ontology realization marker (e.g., `"BFO"`). */
  owlRealization: string;
  /** Parent property IRI or name, or `"—"` if root. */
  subPropertyOf: string;
  /** Domain class name (textual). */
  domain: string;
  /** Range class name (textual). */
  range: string;
  /** Canonical predicate IRI (prefixed form, e.g., `"obo:BFO_0000196"`). */
  iri: string;
  /** Verification notes per the Aaron-led ARC content authoring ritual. */
  notes: string;
}

/**
 * An ARC module — a JSON-LD document bundling one ontology module's
 * commitments. Identified by `moduleId` (e.g., `"core/bfo-2020"`)
 * matching the `arcModules` parameter on SessionConfiguration per
 * spec §3.6.2.
 *
 * Per spec §3.6.2 tree-shaking convention: consumers select modules by
 * `moduleId` strings. The kernel-pure validator + registry seam
 * (`arc-validation.ts` + `arc-module-registry.ts`) exposes runtime
 * lookup by `moduleId` for the lifter to consult at Phase 4 Step 3+.
 */
export interface ARCModule {
  /** JSON-LD context URL. Optional at the kernel-type level; required by validator. */
  "@context"?: string;
  /** JSON-LD identifier (e.g., `"arc:module:core/bfo-2020"`). Optional at kernel-type level. */
  "@id"?: string;
  /** Discriminator. Always the literal string `"ARCModule"`. */
  "@type": "ARCModule";
  /**
   * Module identifier matching the `arcModules` parameter on
   * SessionConfiguration. Format: `"<category>/<name>"` (e.g.,
   * `"core/bfo-2020"`, `"core/iao-information"`).
   */
  moduleId: string;
  /**
   * ARC manifest version this module was authored against. Drives
   * mismatch detection at loadOntology() per API §5.5 throws.
   */
  arcManifestVersion: string;
  /** The ARC entries this module ships. */
  entries: ARCEntry[];
}
