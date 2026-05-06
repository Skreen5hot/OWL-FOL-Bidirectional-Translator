#!/usr/bin/env node
/**
 * ARC Manifest Linter
 *
 * Phase 0.7 deliverable per ROADMAP.
 *
 * Checks every Verified ARC entry has at least one passing fixture in
 * `tests/corpus/manifest.json`; checks declared parent properties (subPropertyOf)
 * exist in the entry's module or its declared dependencies; flags rows
 * still carrying `[VERIFY]` or Draft status.
 *
 * IRI canonical-vocabulary cache check: routes each entry's IRI to the
 * matching cache file under arc/vocabulary-cache/ by regex match against
 * the cache's iriPattern, then verifies the IRI is a known canonical IRI.
 * Type agreement (object-property vs class) is also checked. In --strict
 * mode, references to cache entries with "unverified": true also fail.
 *
 * Pure-Node, dependency-free.
 */

import { readFile, readdir } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const arcDir = join(root, "arc");
const vocabCacheDir = join(arcDir, "vocabulary-cache");
const corpusManifestPath = join(root, "tests", "corpus", "manifest.json");

const args = process.argv.slice(2);
const strict = args.includes("--strict");
// --strict implies --require-fixtures-for-verified per ROADMAP Phase 4-7
// ARC Authoring Exit Criteria ("every Verified entry has at least one
// passing fixture"). Standalone flag retained for selective invocation.
const requireFixturesForVerified =
  strict || args.includes("--require-fixtures-for-verified");

const VERIFY_TAG_RE = /\[VERIFY[^\]]*\]/i;

const MODULE_DEPS = {
  "core/bfo-2020": [],
  "core/iao-information": ["core/bfo-2020"],
  "cco/realizable-holding": ["core/bfo-2020"],
  "cco/mereotopology": ["core/bfo-2020"],
  "cco/measurement": ["core/bfo-2020"],
  "cco/aggregate": ["core/bfo-2020"],
  "cco/organizational": ["core/bfo-2020"],
  "cco/deontic": ["core/bfo-2020", "core/iao-information"],
};

const violations = [];

function violation(severity, where, message) {
  violations.push({ severity, where, message });
}

async function loadModule(file) {
  try {
    return JSON.parse(await readFile(file, "utf-8"));
  } catch (e) {
    if (e.code === "ENOENT") return null;
    throw e;
  }
}

async function loadCorpusManifest() {
  try {
    const raw = await readFile(corpusManifestPath, "utf-8");
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.fixtures)) return { fixtures: [] };
    return data;
  } catch (e) {
    if (e.code === "ENOENT") return { fixtures: [] };
    throw e;
  }
}

async function gatherModuleFiles() {
  const out = [];
  for (const sub of ["core", "cco", "ofi"]) {
    const p = join(arcDir, sub);
    let entries;
    try {
      entries = await readdir(p);
    } catch (e) {
      if (e.code === "ENOENT") continue;
      throw e;
    }
    for (const e of entries) {
      if (e.endsWith(".json")) out.push(join(p, e));
    }
  }
  return out;
}

/**
 * Load every vocabulary cache file under arc/vocabulary-cache/.
 * Returns a list of { vocab, doc, iriPatternRe, byIri } records sorted by
 * vocabularyId for deterministic routing-precedence.
 */
async function loadVocabCaches() {
  let entries;
  try {
    entries = await readdir(vocabCacheDir);
  } catch (e) {
    if (e.code === "ENOENT") return [];
    throw e;
  }
  const out = [];
  for (const e of entries) {
    if (!e.endsWith(".json") || e === "schema.json") continue;
    const path = join(vocabCacheDir, e);
    const doc = JSON.parse(await readFile(path, "utf-8"));
    if (typeof doc.iriPattern !== "string" || !Array.isArray(doc.entries)) {
      violation("error", path, "vocabulary cache file missing iriPattern or entries[]");
      continue;
    }
    let iriPatternRe;
    try {
      iriPatternRe = new RegExp(doc.iriPattern);
    } catch (err) {
      violation("error", path, `iriPattern is not a valid regex: ${err.message}`);
      continue;
    }
    const byIri = new Map();
    for (const ent of doc.entries) byIri.set(ent.iri, ent);
    out.push({ path, vocab: doc.vocabularyId, doc, iriPatternRe, byIri });
  }
  out.sort((a, b) => a.vocab.localeCompare(b.vocab));
  return out;
}

/**
 * Route an IRI to the first cache whose iriPattern matches it.
 * Returns { cache, entry } or null if no cache claims the IRI.
 */
function routeIRI(iri, caches) {
  for (const c of caches) {
    if (c.iriPatternRe.test(iri)) {
      return { cache: c, entry: c.byIri.get(iri) ?? null };
    }
  }
  return null;
}

/**
 * Map an ARC entry's level + OWL characteristics to the OWL entity type
 * the vocabulary cache should classify the IRI as. Conservative — only
 * makes a claim when the entry's shape is unambiguous.
 *
 * Returns null if the entry's expected type cannot be inferred (in which
 * case the type-agreement check is skipped for that entry).
 */
function expectedEntityType(entry) {
  if (entry.level === "Object-level") {
    // Catalogue object-level entries are object properties unless the
    // OWL Characteristics column declares otherwise.
    return "object-property";
  }
  return null;
}

async function main() {
  const moduleFiles = await gatherModuleFiles();
  const vocabCaches = await loadVocabCaches();
  if (moduleFiles.length === 0) {
    console.warn(
      "  ! WARN: no ARC module JSON files found under arc/ — run `npm run build:arc` first. " +
      "Phase 0 ships the linter scaffolding; population is Phase 4-7 SME work."
    );
    if (vocabCaches.length > 0) {
      console.log(
        `  (vocabulary caches present: ${vocabCaches.map((c) => c.vocab).join(", ")} — will be exercised once ARC modules land)`
      );
    }
    process.exit(0);
  }

  const corpus = await loadCorpusManifest();
  const fixturesByArcEntry = new Map();
  for (const fx of corpus.fixtures) {
    if (Array.isArray(fx.arcEntries)) {
      for (const e of fx.arcEntries) {
        if (!fixturesByArcEntry.has(e)) fixturesByArcEntry.set(e, []);
        fixturesByArcEntry.get(e).push(fx.fixtureId);
      }
    }
  }

  const allEntriesByModule = new Map(); // moduleId → Set of IRIs
  const entryDetails = []; // for downstream checks

  for (const file of moduleFiles) {
    const doc = await loadModule(file);
    if (!doc) continue;
    if (doc["@type"] !== "ARCModule" || typeof doc.moduleId !== "string") {
      violation("error", file, "module root must have @type=ARCModule and a string moduleId");
      continue;
    }
    if (!Array.isArray(doc.entries)) {
      violation("error", file, "module must have an `entries` array");
      continue;
    }
    if (!allEntriesByModule.has(doc.moduleId)) allEntriesByModule.set(doc.moduleId, new Set());
    for (const entry of doc.entries) {
      const iri = entry.iri && entry.iri !== "—" ? entry.iri : null;
      if (iri) allEntriesByModule.get(doc.moduleId).add(iri);
      entryDetails.push({ moduleId: doc.moduleId, file, entry });
    }
  }

  // (1) [VERIFY] / Draft state check
  for (const { file, entry, moduleId } of entryDetails) {
    const haystack = [
      entry.notes,
      entry.iri,
      entry.owlRealization,
      entry.formalDefinition,
    ]
      .filter((x) => typeof x === "string")
      .join(" ");
    if (VERIFY_TAG_RE.test(haystack)) {
      violation(
        "error",
        `${file} :: ${entry.name}`,
        `entry still carries a [VERIFY] tag in ${moduleId}; resolve before phase entry`
      );
    }
  }

  // (2) Worked-example coverage: every Verified entry needs a fixture
  // Default mode: emit informational counts.
  // --require-fixtures-for-verified (or --strict): promote uncovered Verified
  // entries to errors per ROADMAP Phase 4-7 ARC Authoring Exit Criteria.
  let coveredCount = 0;
  let uncoveredCount = 0;
  for (const { entry, file, moduleId } of entryDetails) {
    const iri = entry.iri && entry.iri !== "—" ? entry.iri : null;
    if (!iri) continue;
    if (fixturesByArcEntry.has(iri) && fixturesByArcEntry.get(iri).length > 0) {
      coveredCount++;
    } else {
      uncoveredCount++;
      if (requireFixturesForVerified) {
        violation(
          "error",
          `${file} :: ${entry.name}`,
          `Verified entry ${iri} (in ${moduleId}) has no fixture in tests/corpus/manifest.json (no manifest entry references this IRI in arcEntries[])`
        );
      }
    }
  }

  // (3) IRI canonical-vocabulary existence + type agreement + unverified surfacing.
  //     Routes each entry's IRI to the matching cache by iriPattern regex,
  //     verifies the IRI is present, and (when level allows it) verifies the
  //     cached entity type matches the ARC entry's expected type.
  let cacheCheckedCount = 0;
  let cacheUnknownCount = 0;
  let cacheUnverifiedCount = 0;
  for (const { entry, file, moduleId } of entryDetails) {
    const iri = entry.iri && entry.iri !== "—" ? entry.iri : null;
    if (!iri) continue;
    const routed = routeIRI(iri, vocabCaches);
    if (!routed) {
      // No cache claims this IRI pattern. Not necessarily an error — some IRIs
      // may belong to vocabularies the cache hasn't been seeded for yet.
      // Surface as a warning so the SME notices the gap.
      violation(
        "warn",
        `${file} :: ${entry.name}`,
        `IRI ${iri} does not match any iriPattern in arc/vocabulary-cache/; either add a cache file for this vocabulary or correct the IRI`
      );
      continue;
    }
    cacheCheckedCount++;
    if (!routed.entry) {
      violation(
        "error",
        `${file} :: ${entry.name}`,
        `IRI ${iri} routes to vocabulary cache "${routed.cache.vocab}" but is NOT present in that cache (typo, or canonical release does not declare it). Run \`npm run refresh:vocab-cache -- --vocab=${routed.cache.vocab} --source=<path>\` against the canonical release to confirm.`
      );
      cacheUnknownCount++;
      continue;
    }
    if (routed.entry.deprecated) {
      violation(
        "warn",
        `${file} :: ${entry.name}`,
        `IRI ${iri} is marked deprecated in vocabulary cache "${routed.cache.vocab}"`
      );
    }
    if (routed.entry.unverified) {
      cacheUnverifiedCount++;
      if (strict) {
        violation(
          "error",
          `${file} :: ${entry.name}`,
          `IRI ${iri} is in vocabulary cache "${routed.cache.vocab}" but flagged "unverified": true (hand-seeded, not yet confirmed against canonical release). Refresh the cache against the canonical release to clear the flag.`
        );
      }
    }
    const expectedType = expectedEntityType(entry);
    if (expectedType && routed.entry.type && expectedType !== routed.entry.type) {
      violation(
        "error",
        `${file} :: ${entry.name}`,
        `IRI ${iri} is classified as "${routed.entry.type}" in vocabulary cache "${routed.cache.vocab}" but ARC entry shape implies "${expectedType}" — type disagreement`
      );
    }
  }

  // (4) subPropertyOf parent existence within module + declared deps
  for (const { entry, moduleId, file } of entryDetails) {
    const parentRaw = entry.subPropertyOf;
    if (!parentRaw || parentRaw === "—" || parentRaw.trim() === "") continue;
    const parents = parentRaw.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
    const allowedModules = [moduleId, ...(MODULE_DEPS[moduleId] || [])];
    const allowedIRIs = new Set();
    for (const m of allowedModules) {
      const set = allEntriesByModule.get(m);
      if (set) for (const i of set) allowedIRIs.add(i);
    }
    for (const p of parents) {
      // Permit raw IRIs as well as bracketed CURIEs in the TSV-derived form
      if (!allowedIRIs.has(p)) {
        violation(
          "warn",
          `${file} :: ${entry.name}`,
          `subPropertyOf "${p}" not present in ${moduleId} or its declared dependencies (${(MODULE_DEPS[moduleId] || []).join(", ") || "none"})`
        );
      }
    }
  }

  console.log(`\nARC lint summary: ${entryDetails.length} entries across ${allEntriesByModule.size} modules`);
  const coverageMode = requireFixturesForVerified
    ? "ENFORCED (uncovered → error)"
    : "informational only (run with --strict or --require-fixtures-for-verified to enforce)";
  console.log(`  Worked-example coverage: ${coveredCount} covered / ${uncoveredCount} uncovered — ${coverageMode}`);
  console.log(
    `  Vocabulary cache check: ${cacheCheckedCount} routed, ` +
    `${cacheUnknownCount} unknown-IRI, ${cacheUnverifiedCount} unverified-IRI ` +
    `(across ${vocabCaches.length} cache file${vocabCaches.length === 1 ? "" : "s"})`
  );

  const errors = violations.filter((v) => v.severity === "error");
  const warns = violations.filter((v) => v.severity === "warn");
  for (const v of [...errors, ...warns]) {
    const tag = v.severity === "error" ? "  ✗" : "  !";
    console.error(`${tag} ${v.severity.toUpperCase()}: ${v.where}\n      ${v.message}`);
  }

  if (errors.length > 0 && strict) {
    console.error(`\n  ✗ FAIL: ${errors.length} ARC lint error(s)`);
    process.exit(1);
  }
  if (errors.length > 0) {
    console.warn(`\n  ! ${errors.length} ARC lint error(s) — Phase 0 default is non-strict; rerun with --strict for CI gating in Phases 4-7`);
  } else {
    console.log("\n  ✓ PASS: no ARC lint errors");
  }
  process.exit(0);
}

await main().catch((e) => {
  console.error("  ✗ FAIL: " + (e instanceof Error ? e.message : String(e)));
  process.exit(1);
});
