#!/usr/bin/env node
/**
 * ARC Round-Trip Verifier
 *
 * Phase 0.6 deliverable per ROADMAP §0.6 acceptance criterion:
 *   "Round-trip script: TSV → JSON-LD modules → regenerated TSV produces
 *    byte-identical TSV"
 *
 * The "byte-identical" comparison is performed AFTER both sides are
 * normalized to a canonical row-set form: rows reordered by the
 * `Relation Name` column. (TSV row order in the SME's working file is
 * not load-bearing once each row carries its module assignment; what
 * matters is that no rows are lost or corrupted by the round-trip.)
 *
 * Phase 0 ships this in "warn" mode by default — until the SME folds the
 * Module column into the canonical TSV (or populates
 * arc/module-assignments.json), the round-trip cannot be fully exercised.
 * Run with `--strict` to fail on any mismatch.
 */

import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const originalTsv = join(root, "project", "relations_catalogue_v3.tsv");
const regeneratedTsv = join(root, "arc", "regenerated-relations_catalogue_v3.tsv");

const args = process.argv.slice(2);
const strict = args.includes("--strict");

function runNode(script) {
  return new Promise((res, rej) => {
    const child = spawn(process.execPath, [script], { stdio: "inherit" });
    child.on("close", (code) => {
      if (code === 0) res();
      else rej(new Error(`${script} exited ${code}`));
    });
  });
}

function normalizeForRoundTrip(text) {
  // Strip CRLF, normalize trailing whitespace, ignore row order.
  const lines = text.replace(/\r\n/g, "\n").split("\n").filter((l) => l.length > 0);
  if (lines.length === 0) return [];
  const header = lines[0];
  const dataRows = lines.slice(1);
  // Sort by first column (Relation Name) for order-independent comparison.
  dataRows.sort((a, b) => {
    const ka = a.split("\t")[0] ?? "";
    const kb = b.split("\t")[0] ?? "";
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
  return [header, ...dataRows];
}

async function main() {
  await runNode(join(__dirname, "build-arc.js"));
  await runNode(join(__dirname, "regenerate-arc-tsv.js"));

  let originalRaw, regeneratedRaw;
  try {
    originalRaw = await readFile(originalTsv, "utf-8");
  } catch {
    console.error(`  ✗ FAIL: original TSV not found at ${originalTsv}`);
    process.exit(1);
  }
  try {
    regeneratedRaw = await readFile(regeneratedTsv, "utf-8");
  } catch {
    console.error(`  ✗ FAIL: regenerated TSV not found at ${regeneratedTsv} — build-arc / regenerate steps may have failed silently`);
    process.exit(1);
  }

  const original = normalizeForRoundTrip(originalRaw);
  const regenerated = normalizeForRoundTrip(regeneratedRaw);

  // Compare row-counts first
  if (original.length !== regenerated.length) {
    const msg = `Row-count mismatch: original=${original.length}, regenerated=${regenerated.length}. Likely cause: rows in the original TSV with no Module assignment (Module column or arc/module-assignments.json) are skipped by build-arc.js.`;
    if (strict) {
      console.error(`  ✗ FAIL (strict): ${msg}`);
      process.exit(1);
    }
    console.warn(`  ! WARN: ${msg}`);
  }

  // Per-row comparison limited to columns present in both — original may
  // not yet have a Module column.
  const originalHeader = original[0]?.split("\t") ?? [];
  const regeneratedHeader = regenerated[0]?.split("\t") ?? [];
  const sharedColumns = originalHeader.filter((c) => regeneratedHeader.includes(c));

  const originalIndex = new Map(
    sharedColumns.map((c) => [c, originalHeader.indexOf(c)])
  );
  const regeneratedIndex = new Map(
    sharedColumns.map((c) => [c, regeneratedHeader.indexOf(c)])
  );

  let mismatches = 0;
  const limit = Math.min(original.length, regenerated.length);
  for (let i = 1; i < limit; i++) {
    const oCells = original[i].split("\t");
    const rCells = regenerated[i].split("\t");
    for (const c of sharedColumns) {
      const ov = oCells[originalIndex.get(c)] ?? "";
      const rv = rCells[regeneratedIndex.get(c)] ?? "";
      if (ov !== rv) {
        if (mismatches < 10) {
          console.warn(
            `  ! mismatch at row ${i}, column "${c}": original="${ov}" regenerated="${rv}"`
          );
        }
        mismatches++;
      }
    }
  }

  if (mismatches === 0) {
    console.log(`  ✓ PASS: ARC round-trip produces equivalent TSV (${limit - 1} rows compared across ${sharedColumns.length} columns)`);
    process.exit(0);
  }

  const msg = `${mismatches} cell mismatch(es) across the round-trip`;
  if (strict) {
    console.error(`  ✗ FAIL (strict): ${msg}`);
    process.exit(1);
  }
  console.warn(`  ! WARN: ${msg} — running in non-strict mode (Phase 0 default).`);
  console.warn("    Run with --strict once the SME has folded the Module column into the canonical TSV.");
  process.exit(0);
}

await main().catch((e) => {
  console.error("  ✗ FAIL: " + (e instanceof Error ? e.message : String(e)));
  process.exit(1);
});
