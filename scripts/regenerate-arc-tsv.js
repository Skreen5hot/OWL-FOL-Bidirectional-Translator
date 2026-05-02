#!/usr/bin/env node
/**
 * ARC TSV Regenerator — JSON-LD modules → TSV
 *
 * Phase 0.6 deliverable per ROADMAP. Companion to build-arc.js.
 *
 * Reads the five JSON-LD ARC module files under `arc/` and regenerates
 * a TSV in the v3 schema (with `Module` column appended). The output is
 * compared against `project/relations_catalogue_v3.tsv` by
 * scripts/round-trip-arc.js to verify byte-identical round-trip.
 *
 * Pure-Node, dependency-free.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const arcDir = join(root, "arc");
const outPath = join(root, "arc", "regenerated-relations_catalogue_v3.tsv");

const MODULE_FILES = [
  "core/bfo-2020.json",
  "core/iao-information.json",
  "cco/realizable-holding.json",
  "cco/mereotopology.json",
  "ofi/deontic.json",
];

const HEADER_BASE = [
  "Relation Name",
  "Level",
  "Context",
  "Notation",
  "Formal Definition",
  "OWL Characteristics",
  "OWL / CCO Realization",
  "subPropertyOf",
  "Domain",
  "Range",
  "IRI",
  "Notes",
];

function entryToRow(entry, moduleId) {
  return [
    entry.name ?? "",
    entry.level ?? "",
    entry.context ?? "",
    entry.notation ?? "",
    entry.formalDefinition ?? "",
    entry.owlCharacteristics ?? "",
    entry.owlRealization ?? "",
    entry.subPropertyOf ?? "",
    entry.domain ?? "",
    entry.range ?? "",
    entry.iri ?? "",
    entry.notes ?? "",
    moduleId,
  ];
}

async function main() {
  const allRows = [];
  for (const f of MODULE_FILES) {
    const p = join(arcDir, f);
    let raw;
    try {
      raw = await readFile(p, "utf-8");
    } catch (e) {
      if (e.code === "ENOENT") {
        console.warn(`  ! WARN: ${p} not found — run scripts/build-arc.js first`);
        continue;
      }
      throw e;
    }
    const doc = JSON.parse(raw);
    for (const entry of doc.entries) {
      allRows.push(entryToRow(entry, doc.moduleId));
    }
  }

  const header = [...HEADER_BASE, "Module"];
  const out = [header.join("\t"), ...allRows.map((r) => r.join("\t"))].join("\n") + "\n";

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, out, "utf-8");
  console.log(`  ✓ Regenerated TSV written to ${outPath} (${allRows.length} rows)`);
}

await main().catch((e) => {
  console.error("  ✗ FAIL: " + (e instanceof Error ? e.message : String(e)));
  process.exit(1);
});
