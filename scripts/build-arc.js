#!/usr/bin/env node
/**
 * ARC Manifest Compiler — TSV → JSON-LD modules
 *
 * Phase 0.6 deliverable per ROADMAP. Updated post-ADR-008 + ADR-009 (2026-05-05):
 * 8 active v0.1 modules; OFI deontic deferred to v0.2 and absent from emitter.
 *
 * Reads `project/relations_catalogue_v3_3.tsv` and produces the eight
 * JSON-LD ARC module files under `arc/` per spec §3.6.1:
 *   arc/core/bfo-2020.json
 *   arc/core/iao-information.json
 *   arc/cco/realizable-holding.json
 *   arc/cco/mereotopology.json
 *   arc/cco/measurement.json
 *   arc/cco/aggregate.json
 *   arc/cco/organizational.json
 *   arc/cco/deontic.json
 *
 * Per ADR-008 (2026-05-05): rows with Module column = `[V0.2-CANDIDATE]` are
 * silently skipped (NOT counted as unassigned), since they are intentionally
 * deferred from v0.1 scope. The skip is reported in the build summary so the
 * v0.2 forward-track remains visible.
 *
 * Module assignment for each TSV row is read from one of two sources,
 * in this order:
 *
 *   (1) The `Module` column in the TSV itself (preferred; SME's canonical view).
 *   (2) `arc/module-assignments.json` — an out-of-band mapping from row's
 *       `Relation Name` → module identifier. Provided as a transition
 *       affordance until the SME has folded the Module column into the TSV.
 *
 * Rows with no module assignment under either mechanism produce a warning
 * and are skipped. Run with `--strict` to fail instead of warn. v0.2-deferred
 * rows are skipped under both `--strict` and non-strict modes.
 *
 * The script is intentionally pure-Node and dependency-free so it can
 * run before `npm install` resolves the project's full devDependency tree.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const tsvPath = join(root, "project", "relations_catalogue_v3_3.tsv");
const arcDir = join(root, "arc");
const assignmentsPath = join(arcDir, "module-assignments.json");

const VALID_MODULES = new Set([
  "core/bfo-2020",
  "core/iao-information",
  "cco/realizable-holding",
  "cco/mereotopology",
  "cco/measurement",
  "cco/aggregate",
  "cco/organizational",
  "cco/deontic",
]);

// Per ADR-008 (2026-05-05): rows tagged with these sentinel values in the
// Module column are intentionally deferred from v0.1 scope. They are skipped
// silently (not counted as unassigned) but reported in the build summary so
// the v0.2 forward-track remains visible.
const V02_DEFERRAL_TAGS = new Set([
  "[V0.2-CANDIDATE]",
  "[V0.2-DEFERRED]",
]);

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const verbose = args.includes("--verbose");

function log(msg) {
  if (verbose) console.log(msg);
}

function parseTsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length === 0) {
    throw new Error("TSV is empty");
  }
  const header = lines[0].split("\t");
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split("\t");
    const row = {};
    for (let j = 0; j < header.length; j++) {
      row[header[j]] = cells[j] !== undefined ? cells[j] : "";
    }
    row.__lineNumber = i + 1;
    rows.push(row);
  }
  return { header, rows };
}

async function loadAssignments() {
  try {
    const txt = await readFile(assignmentsPath, "utf-8");
    const data = JSON.parse(txt);
    if (typeof data !== "object" || data === null) {
      throw new Error("module-assignments.json must be an object");
    }
    return data;
  } catch (e) {
    if (e.code === "ENOENT") return {};
    throw e;
  }
}

function pickModule(row, assignments) {
  if (row.Module && row.Module.trim() !== "") return row.Module.trim();
  const name = row["Relation Name"];
  if (name && assignments[name]) return assignments[name];
  return null;
}

function rowToEntry(row) {
  return {
    "@type": "ARCEntry",
    name: row["Relation Name"],
    level: row.Level,
    context: row.Context,
    notation: row.Notation,
    formalDefinition: row["Formal Definition"],
    owlCharacteristics: row["OWL Characteristics"],
    owlRealization: row["OWL / CCO Realization"],
    subPropertyOf: row.subPropertyOf,
    domain: row.Domain,
    range: row.Range,
    iri: row.IRI,
    notes: row.Notes,
  };
}

async function main() {
  const text = await readFile(tsvPath, "utf-8");
  const { header, rows } = parseTsv(text);

  log(`Parsed ${rows.length} rows from ${tsvPath}`);
  log(`Header columns: ${header.join(", ")}`);

  const hasModuleColumn = header.includes("Module");
  if (!hasModuleColumn) {
    console.warn(
      "  ! WARN: TSV does not yet have a `Module` column. " +
      "Falling back to arc/module-assignments.json. " +
      "Per ROADMAP §0.6, the SME deliverable is the Module column."
    );
  }

  const assignments = await loadAssignments();
  const buckets = new Map();
  const unassigned = [];
  const v02Deferred = [];

  for (const row of rows) {
    const mod = pickModule(row, assignments);
    if (!mod) {
      unassigned.push(row);
      continue;
    }
    if (V02_DEFERRAL_TAGS.has(mod)) {
      v02Deferred.push(row);
      continue;
    }
    if (!VALID_MODULES.has(mod)) {
      const msg = `Row ${row.__lineNumber} (${row["Relation Name"]}) assigned to unknown module "${mod}". Valid: ${[...VALID_MODULES].join(", ")}`;
      if (strict) throw new Error(msg);
      console.warn("  ! WARN: " + msg);
      continue;
    }
    if (!buckets.has(mod)) buckets.set(mod, []);
    buckets.get(mod).push(rowToEntry(row));
  }

  if (unassigned.length > 0) {
    console.warn(
      `  ! WARN: ${unassigned.length} row(s) have no module assignment ` +
      "(neither TSV Module column nor arc/module-assignments.json). " +
      "These rows are skipped. Examples: " +
      unassigned.slice(0, 5).map((r) => `"${r["Relation Name"]}"`).join(", ")
    );
    if (strict) {
      console.error("  ✗ FAIL (strict): unassigned rows are not permitted");
      process.exit(1);
    }
  }

  await mkdir(join(arcDir, "core"), { recursive: true });
  await mkdir(join(arcDir, "cco"), { recursive: true });
  // arc/ofi/ directory not created in v0.1 — OFI deontic deferred to v0.2 per ADR-008.

  // Always emit all eight active v0.1 module files (empty if no rows assigned
  // to that module) so downstream code can rely on their existence.
  for (const mod of VALID_MODULES) {
    const entries = buckets.get(mod) || [];
    const moduleDoc = {
      "@context": "https://ontology-of-freedom.org/ofbt/arc-context.jsonld",
      "@id": `arc:module:${mod}`,
      "@type": "ARCModule",
      moduleId: mod,
      arcManifestVersion: "0.1.0",
      entries,
    };
    const outPath = join(arcDir, ...mod.split("/")) + ".json";
    // Stable JSON: sorted keys handled by canonicalization in the kernel.
    // For ARC modules, JSON.stringify with 2-space indent is sufficient for
    // round-trip parity because TSV row order is preserved in the entries array.
    await writeFile(outPath, JSON.stringify(moduleDoc, null, 2) + "\n", "utf-8");
    log(`  wrote ${outPath} (${entries.length} entries)`);
  }

  const builtCount = rows.length - unassigned.length - v02Deferred.length;
  console.log(
    `  ✓ ARC build complete: ${builtCount} entries across ${VALID_MODULES.size} modules`
  );
  if (unassigned.length > 0) {
    console.log(`    (${unassigned.length} unassigned row(s) skipped)`);
  }
  if (v02Deferred.length > 0) {
    console.log(
      `    (${v02Deferred.length} row(s) deferred to v0.2 per ADR-008: ` +
      v02Deferred.slice(0, 5).map((r) => `"${r["Relation Name"]}"`).join(", ") +
      (v02Deferred.length > 5 ? ", …" : "") +
      ")"
    );
  }
}

await main().catch((e) => {
  console.error("  ✗ FAIL: " + (e instanceof Error ? e.message : String(e)));
  process.exit(1);
});
