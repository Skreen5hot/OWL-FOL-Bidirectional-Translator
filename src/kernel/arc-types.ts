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
  /**
   * Optional N-ary simple disjointness axioms per spec §3.4.1 + Q-4-Step4-A
   * architect ratification 2026-05-11 (Option A — top-level field on
   * ARCModule). Each axiom declares a set of pairwise-disjoint classes;
   * the lifter expands N-ary to N(N-1)/2 pairwise binary FOL axioms
   * (`∀x. Cᵢ(x) ∧ Cⱼ(x) → False`) per Q-4-Step4-A.1 ruling.
   *
   * Currently used by `core/bfo-2020` for the BFO Disjointness Map (11
   * commitments → 29 emitted binary axioms). Optional + omitted on modules
   * that declare no disjointness commitments.
   */
  disjointnessAxioms?: DisjointnessAxiom[];
  /**
   * Optional bridge axioms per spec §3.4 + §3.4.1 + Q-4-Step5-A architect
   * ratification 2026-05-14 (Option A — top-level field on ARCModule).
   * Each axiom declares one of the spec-ratified bridge-axiom shapes for
   * a primitive relation (currently Connected With per spec §3.4 line 295);
   * the emitter expands per `axiomForm` per Q-4-Step5-A.2.1 ruling.
   *
   * Currently used by `core/bfo-2020` for Connected With's 3 spec-literal
   * bridge axioms (reflexivity + symmetry + parthood-extension). Optional
   * + omitted on modules that declare no bridge commitments.
   */
  bridgeAxioms?: BridgeAxiom[];
}

/**
 * A bridge axiom per spec §3.4 + §3.4.1 + Q-4-Step5-A architect ratification
 * 2026-05-14 (Q-4-Step5-A.2 schema extension + Q-4-Step5-A.2.1 discriminated-
 * union with axiomForm enum).
 *
 * Discriminated union over `axiomForm`. Each form has its own emitter
 * expansion per Q-4-Step5-A.2.1 architect ruling:
 *
 *   - `"reflexivity"` → ∀x. C(x, x)
 *       — `predicate` is the canonical IRI of the reflexive binary relation
 *       (e.g., `cco:ont00001810` for Connected With).
 *
 *   - `"symmetry"` → ∀x,y. C(y, x) → C(x, y)
 *       — `predicate` is the canonical IRI of the symmetric binary relation.
 *       Phase 1 lifter's `owl:SymmetricProperty` characteristic emission
 *       produces an equivalent FOL shape (∀x,y. P(x,y) → P(y,x)); double-
 *       emission gap is Q-4-Step5-A.4 Developer reconnaissance scope.
 *
 *   - `"parthood-extension"` → ∀x,y,z. P(x, y) ∧ C(z, x) → C(z, y)
 *       — `predicate` is the canonical IRI of the connection relation
 *       (the C in spec §3.4.1 line 309); `parthoodPredicate` is the
 *       canonical IRI of the parthood relation (the P; e.g.,
 *       `obo:BFO_0000176` continuant_part_of). Spec §3.4.1 line 309's
 *       parthood-extension bridge: connections inherit through parthood.
 *
 * SME-discretion metadata fields (`comment`, `sourceReference`, `notes`)
 * optional and not consumed by the emitter; they support provenance +
 * audit-trail integrity at the corpus-content surface.
 */
export type BridgeAxiom =
  | {
      "@type": "BridgeAxiom";
      axiomForm: "reflexivity";
      predicate: string;
      comment?: string;
      sourceReference?: string;
      notes?: string;
    }
  | {
      "@type": "BridgeAxiom";
      axiomForm: "symmetry";
      predicate: string;
      comment?: string;
      sourceReference?: string;
      notes?: string;
    }
  | {
      "@type": "BridgeAxiom";
      axiomForm: "parthood-extension";
      predicate: string;
      parthoodPredicate: string;
      comment?: string;
      sourceReference?: string;
      notes?: string;
    };

/**
 * A simple disjointness axiom per spec §3.4.1 + Q-4-Step4-A.
 *
 * `classes` is an N-element list of class IRIs (N ≥ 2) with
 * pairwise-disjoint semantics per OWL `DisjointClasses`. The lifter
 * expands N-ary to pairwise binary FOL axioms at emission time per
 * Q-4-Step4-A.1 ruling.
 *
 * Q-4-Step4-A.2 ratified Phase 4 ships **simple disjointness only**
 * (NOT DisjointUnion / Entity-cover entailment); the latter is
 * forward-tracked to v0.2 ELK closure or a future phase forcing case.
 *
 * SME-discretion metadata fields (`name`, `comment`, `sourceReference`,
 * `notes`) are optional and not consumed by the emitter; they support
 * provenance + audit-trail integrity at the corpus-content surface.
 */
export interface DisjointnessAxiom {
  /** Discriminator. Always the literal string `"DisjointnessAxiom"`. */
  "@type": "DisjointnessAxiom";
  /**
   * N-element list of class IRIs (N ≥ 2). Pairwise-disjoint semantics per
   * OWL `DisjointClasses`. Each pair (i, j) with i < j emits one binary
   * FOL axiom `∀x. classes[i](x) ∧ classes[j](x) → False`.
   */
  classes: string[];
  /** Optional human-readable axiom name (e.g., `"Continuant_Occurrent_root"`). */
  name?: string;
  /** Optional comment describing the partition semantics. */
  comment?: string;
  /** Optional reference to the canonical source (BFO 2020 OWL / ISO/IEC 21838-2 / ...). */
  sourceReference?: string;
  /** Optional audit-trail notes from SME path-fence authoring. */
  notes?: string;
}
