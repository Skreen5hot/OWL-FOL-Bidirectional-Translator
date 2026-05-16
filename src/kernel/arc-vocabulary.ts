/**
 * ARC Vocabulary + Module Dependency Validation — Phase 4 Step 2
 * (per spec §3.6.3 + §3.6.4 + Q-4-F ratified ruling 2026-05-10).
 *
 * Kernel-pure helpers used by the lifter's strict-mode pre-scan and
 * the composition layer's dependency-validation hook. Two distinct
 * surfaces share this module because both consume the loaded ARC
 * modules' shape:
 *
 *   - `extractARCVocabulary(modules, prefixes?)` — collects the set
 *     of canonicalized property IRIs covered by the given modules.
 *     The lifter's strict-mode pre-scan checks every property IRI in
 *     the input ontology against this set.
 *
 *   - `validateARCModuleDependencies(modules, knownModuleIds)` —
 *     checks that each loaded module's declared dependencies (per
 *     spec §3.6.4 — currently optional on the schema; CCO modules at
 *     Phase 6 declare deps on `core/bfo-2020`) are also in the
 *     loaded set. The composition layer wraps this and throws
 *     ARCManifestError when missing.
 *
 * Per spec §3.6.3: strict mode rejects every property IRI in the
 * input that has no Verified ARC entry. The vocabulary is a Set of
 * canonicalized full URIs (post-`canonicalizeIRI` expansion); input
 * ontology predicates are canonicalized identically before lookup
 * so prefixed-form vs full-URI form differences don't false-fail.
 *
 * v0.1 schema gap: the current ARCModule type omits the optional
 * `dependencies?: string[]` field that spec §3.6.4's CCO examples
 * imply. We read the field via a structural cast — Pass 2a's
 * bfo-2020.json + iao-information.json have no `dependencies`, so
 * the check is vacuously valid for v0.1. The cast preserves
 * forward-compatibility for Phase 6 CCO modules without touching
 * arc-types.ts at Step 2 scope.
 *
 * Pure: no Date, no random, no I/O. Pure structural inspection.
 */

import type { ARCEntry, ARCModule } from "./arc-types.js";
import type { OWLOntology } from "./owl-types.js";
import { canonicalizeIRI } from "./iri.js";

/**
 * Extract the set of canonicalized property IRIs covered by the
 * given ARC modules. Pass the input ontology's `prefixes` map to
 * resolve catalogue prefix-form IRIs (e.g., `"obo:BFO_0000196"`) to
 * full-URI form so the lookup matches canonicalized input predicates.
 *
 * When `prefixes` is undefined, IRIs are passed through
 * `canonicalizeIRI` with no prefix map; CURIE-form entries may not
 * resolve to the same full-URI as input axioms (caller responsibility
 * to thread `ontology.prefixes` from the lifter's invocation).
 */
export function extractARCVocabulary(
  modules: ReadonlyArray<ARCModule>,
  prefixes?: Record<string, string>
): Set<string> {
  const vocab = new Set<string>();
  for (const m of modules) {
    for (const entry of m.entries) {
      if (typeof entry.iri === "string" && entry.iri.length > 0) {
        vocab.add(canonicalizeIRI(entry.iri, prefixes));
      }
    }
  }
  return vocab;
}

/**
 * Result of ARC module dependency validation per spec §3.6.4.
 */
export interface ARCModuleDependencyValidationResult {
  valid: boolean;
  /**
   * The missing dependency edges, one per (declaring-module, missing-dep)
   * pair. Empty when valid.
   */
  missing: Array<{ module: string; missingDependency: string }>;
}

/**
 * Validate that every declared dependency on every loaded module is
 * also in the loaded set. Returns the missing edges as a flat list
 * for diagnostic-message construction.
 *
 * Per spec §3.6.4 v0.1 examples: `cco/realizable-holding.json` depends
 * on `core/bfo-2020.json`, etc. `core/bfo-2020.json` itself has no
 * `dependencies` field — root module of the v0.1 graph.
 */
export function validateARCModuleDependencies(
  modules: ReadonlyArray<ARCModule>,
  knownModuleIds: ReadonlySet<string>
): ARCModuleDependencyValidationResult {
  const missing: Array<{ module: string; missingDependency: string }> = [];
  for (const m of modules) {
    const deps = (m as ARCModule & { dependencies?: string[] }).dependencies;
    if (!Array.isArray(deps)) continue;
    for (const d of deps) {
      if (typeof d === "string" && !knownModuleIds.has(d)) {
        missing.push({ module: m.moduleId, missingDependency: d });
      }
    }
  }
  return { valid: missing.length === 0, missing };
}

/**
 * Walk a class expression and collect every property IRI referenced
 * via `Restriction.onProperty`. Recurses through ObjectIntersectionOf,
 * ObjectUnionOf, ObjectComplementOf so nested restrictions are caught.
 *
 * Helper for `extractPropertyIRIsFromOntology` below. Class IRIs
 * themselves are NOT collected — per spec §3.6.3 strict mode checks
 * property IRIs only.
 */
function collectPropertiesFromClassExpression(
  expr: unknown,
  out: string[]
): void {
  if (expr === null || typeof expr !== "object") return;
  const e = expr as { "@type"?: unknown };
  const t = e["@type"];
  if (t === "Restriction") {
    const r = expr as { onProperty?: unknown };
    if (typeof r.onProperty === "string") out.push(r.onProperty);
    // Recurse into nested someValuesFrom / allValuesFrom class expressions.
    const nested = expr as {
      someValuesFrom?: unknown;
      allValuesFrom?: unknown;
    };
    if (nested.someValuesFrom) collectPropertiesFromClassExpression(nested.someValuesFrom, out);
    if (nested.allValuesFrom) collectPropertiesFromClassExpression(nested.allValuesFrom, out);
    return;
  }
  if (t === "ObjectIntersectionOf" || t === "ObjectUnionOf") {
    const cs = (expr as { classes?: unknown }).classes;
    if (Array.isArray(cs)) {
      for (const c of cs) collectPropertiesFromClassExpression(c, out);
    }
    return;
  }
  if (t === "ObjectComplementOf") {
    const c = (expr as { class?: unknown }).class;
    if (c) collectPropertiesFromClassExpression(c, out);
    return;
  }
  // NamedClass + other shapes: no property IRIs at this node.
}

/**
 * Extract every property IRI referenced anywhere in the input
 * ontology. Used by the lifter's strict-mode pre-scan.
 *
 * Coverage at Step 2 minimum:
 *   - TBox: walks class expressions inside SubClassOf / EquivalentClasses
 *     / DisjointWith / ClassDefinition to catch Restriction.onProperty
 *   - RBox: every axiom kind references at least one property
 *   - ABox: ObjectPropertyAssertion / DataPropertyAssertion property
 *
 * Class IRIs themselves are NOT extracted — per spec §3.6.3 strict
 * mode applies to property IRIs only. Annotation properties are also
 * out of scope at Step 2 (annotations are lifted only when
 * structuralAnnotations explicitly opts them in).
 *
 * IRIs are returned in source order, deduplicated. The caller
 * canonicalizes against the loaded ARC vocabulary.
 */
export function extractPropertyIRIsFromOntology(
  ontology: Pick<OWLOntology, "tbox" | "rbox" | "abox">
): string[] {
  const collected: string[] = [];

  for (const t of ontology.tbox) {
    const tr = t as unknown as Record<string, unknown>;
    const kind = tr["@type"];
    if (kind === "SubClassOf") {
      collectPropertiesFromClassExpression(tr.subClass, collected);
      collectPropertiesFromClassExpression(tr.superClass, collected);
    } else if (kind === "EquivalentClasses" || kind === "DisjointWith") {
      const cs = tr.classes;
      if (Array.isArray(cs)) {
        for (const c of cs) collectPropertiesFromClassExpression(c, collected);
      }
    } else if (kind === "ClassDefinition") {
      collectPropertiesFromClassExpression(tr.expression, collected);
    }
  }

  for (const r of ontology.rbox) {
    const rr = r as unknown as Record<string, unknown>;
    const kind = rr["@type"];
    if (
      kind === "ObjectPropertyDomain" ||
      kind === "ObjectPropertyRange" ||
      kind === "ObjectPropertyCharacteristic"
    ) {
      if (typeof rr.property === "string") collected.push(rr.property);
    } else if (kind === "InverseObjectProperties") {
      if (typeof rr.first === "string") collected.push(rr.first);
      if (typeof rr.second === "string") collected.push(rr.second);
    } else if (kind === "SubObjectPropertyOf") {
      if (typeof rr.subProperty === "string") collected.push(rr.subProperty);
      if (typeof rr.superProperty === "string") collected.push(rr.superProperty);
    } else if (kind === "EquivalentObjectProperties" || kind === "DisjointObjectProperties") {
      const ps = rr.properties;
      if (Array.isArray(ps)) {
        for (const p of ps) if (typeof p === "string") collected.push(p);
      }
    } else if (kind === "ObjectPropertyChain") {
      const chain = rr.propertyChain;
      if (Array.isArray(chain)) {
        for (const p of chain) if (typeof p === "string") collected.push(p);
      }
      if (typeof rr.superProperty === "string") collected.push(rr.superProperty);
    }
  }

  for (const a of ontology.abox) {
    const ar = a as unknown as Record<string, unknown>;
    const kind = ar["@type"];
    if (kind === "ObjectPropertyAssertion" || kind === "DataPropertyAssertion") {
      if (typeof ar.property === "string") collected.push(ar.property);
    }
  }

  // Deduplicate preserving source order so the strict-mode error
  // reports the FIRST offending property the consumer encounters
  // when reading the input — easier to diagnose than a sorted view.
  const seen = new Set<string>();
  const out: string[] = [];
  for (const iri of collected) {
    if (!seen.has(iri)) {
      seen.add(iri);
      out.push(iri);
    }
  }
  return out;
}

/**
 * Convenience: given an input ontology and the canonicalized ARC
 * vocabulary, return the list of property IRIs that are NOT in the
 * vocabulary. Used by the lifter's strict-mode pre-scan to drive the
 * UnsupportedConstructError throw.
 *
 * Returns the offending IRIs in source order; canonicalization
 * applies to both sides so prefixed-form vs full-URI differences
 * don't false-fail.
 */
export function findNonARCPropertyIRIs(
  ontology: Pick<OWLOntology, "tbox" | "rbox" | "abox" | "prefixes">,
  vocabulary: ReadonlySet<string>
): string[] {
  const raw = extractPropertyIRIsFromOntology(ontology);
  const offending: string[] = [];
  for (const iri of raw) {
    const canonical = canonicalizeIRI(iri, ontology.prefixes);
    if (!vocabulary.has(canonical)) offending.push(iri);
  }
  return offending;
}

/**
 * Result of the Step 6 regularity certification per Q-4-Step6-A.1.1
 * architect ratification 2026-05-14/15 (Sub-option α non-transitive
 * chain certification).
 */
export type RegularityCheckResult = "regularity-certified" | "cannot-certify";

/**
 * Phase 4 Step 6 — regularityCheck per Q-4-Step6-A architect ruling +
 * Sub-option α minimum-viable certification (Q-4-Step6-A.1.1).
 *
 * Spec-formally-correct anchor per Horrocks, Kutz, Sattler (2007):
 * transitivity is THE canonical regularity-restricting characteristic in
 * SROIQ. A property chain whose roles are all NON-transitive is provably
 * regular under SROIQ's regularity restriction. v0.1 minimum-viable
 * certification: scan each chain role; if ANY role's loaded ARC entry
 * has `owl:TransitiveProperty` in its `owlCharacteristics` field, return
 * `'cannot-certify'`. Otherwise return `'regularity-certified'`.
 *
 * Substring match (`String.includes`) per architect ruling code-shape:
 * accommodates ARC entries with comma-separated multi-characteristic
 * strings (e.g., `"owl:TransitiveProperty, owl:SymmetricProperty"`).
 *
 * Forward-track: full SROIQ Horrocks regularity check (with role
 * hierarchy + composition closure) defers to v0.2 ELK closure path per
 * project/v0.2-roadmap.md v0.2-09 entry per Q-4-Step6-A.3 ruling. Phase
 * 4 ships the bounded transitivity check; Phase 5+ may extend on
 * implementation evidence per spec §0.2.3.
 *
 * Q-4-Step6-A.4 Step 6 / Step 8 boundary: this function ONLY signals
 * regularity certification status. The projector's strategy router
 * (Step 8 fall-through to Annotated Approximation when chain can't be
 * lift-correctly emitted) is a separate concern; Step 6 controls only
 * the warning emission per non-breaking strengthening discipline.
 */
export function regularityCheck(
  chainRoleIRIs: ReadonlyArray<string>,
  modules: ReadonlyArray<ARCModule>,
  prefixes?: Record<string, string>
): RegularityCheckResult {
  // Build canonical-IRI → owlCharacteristics index across the loaded
  // modules. Single pass; lookup is O(1) per role.
  const characteristicsByIRI = new Map<string, string>();
  for (const m of modules) {
    for (const entry of m.entries) {
      if (typeof entry.iri === "string" && entry.iri.length > 0) {
        const canonical = canonicalizeIRI(entry.iri, prefixes);
        characteristicsByIRI.set(canonical, entry.owlCharacteristics);
      }
    }
  }
  for (const roleIRI of chainRoleIRIs) {
    if (typeof roleIRI !== "string" || roleIRI.length === 0) continue;
    const canonical = canonicalizeIRI(roleIRI, prefixes);
    const characteristics = characteristicsByIRI.get(canonical);
    // Substring match per architect ruling code-shape — accommodates
    // multi-characteristic strings like "owl:TransitiveProperty, owl:Reflexive".
    if (
      typeof characteristics === "string" &&
      characteristics.includes("owl:TransitiveProperty")
    ) {
      return "cannot-certify";
    }
  }
  return "regularity-certified";
}
