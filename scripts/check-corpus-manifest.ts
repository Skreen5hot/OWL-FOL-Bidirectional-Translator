/**
 * Test Corpus Manifest CI Gate
 *
 * Phase 0.8 deliverable per ROADMAP. Run via `npm run test:corpus-manifest`.
 *
 * Enforces:
 *   (1) Every file under tests/corpus/ ending in .fixture.js has a manifest entry
 *   (2) Every manifest entry references an existing fixture file
 *   (3) Manifest schema validation: required fields present, enum values valid,
 *       fixture IDs match the filename + sans .fixture.js convention
 *   (4) intendedToCatch is non-empty (fixtures need an articulated intent)
 *
 * Phase 0 ships with an empty fixtures array — both checks trivially pass
 * until Phase 1 begins authoring fixtures.
 */

import { readFile, readdir } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// The compiled location is dist-tests/scripts/check-corpus-manifest.js,
// so project root is two levels up.
const root = resolve(__dirname, "..", "..");
const corpusDir = join(root, "tests", "corpus");
const manifestPath = join(corpusDir, "manifest.json");

const VALID_REGIMES = new Set(["equivalent", "reversible", "true_loss"]);
const FIXTURE_ID_RE = /^[a-z0-9_]+$/;

interface ManifestEntry {
  fixtureId: string;
  phase: number;
  specSections: string[];
  acceptanceCriteria: string[];
  arcEntries: string[];
  regime: string;
  expectedOutcome: unknown;
  expectedLossSignatureReasons: string[];
  intendedToCatch: string;
  "expected_v0.1_verdict": unknown;
  "expected_v0.2_elk_verdict"?: unknown;
}

interface Manifest {
  manifestVersion: string;
  fixtures: ManifestEntry[];
}

async function loadManifest(): Promise<Manifest> {
  const raw = await readFile(manifestPath, "utf-8");
  return JSON.parse(raw) as Manifest;
}

async function listFixtureFiles(): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(corpusDir);
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return [];
    throw e;
  }
  return entries.filter((f) => f.endsWith(".fixture.js"));
}

const errors: string[] = [];

function err(msg: string): void {
  errors.push(msg);
}

async function main(): Promise<void> {
  const manifest = await loadManifest();
  if (typeof manifest.manifestVersion !== "string") {
    err("manifest is missing `manifestVersion` string");
  }
  if (!Array.isArray(manifest.fixtures)) {
    err("manifest is missing `fixtures` array");
    console.error(`  ✗ FAIL: ${errors.length} manifest schema error(s)`);
    process.exit(1);
  }

  const fixtureFiles = await listFixtureFiles();
  const fixtureIdsFromFiles = new Set(
    fixtureFiles.map((f) => f.replace(/\.fixture\.js$/, ""))
  );
  const fixtureIdsFromManifest = new Set<string>();

  for (const fx of manifest.fixtures) {
    if (typeof fx.fixtureId !== "string" || !FIXTURE_ID_RE.test(fx.fixtureId)) {
      err(`fixture has invalid fixtureId: ${JSON.stringify(fx.fixtureId)}`);
      continue;
    }
    if (fixtureIdsFromManifest.has(fx.fixtureId)) {
      err(`duplicate fixtureId in manifest: ${fx.fixtureId}`);
    }
    fixtureIdsFromManifest.add(fx.fixtureId);

    if (typeof fx.phase !== "number" || fx.phase < 1 || fx.phase > 7) {
      err(`${fx.fixtureId}: phase must be integer 1-7, got ${fx.phase}`);
    }
    if (!Array.isArray(fx.specSections)) {
      err(`${fx.fixtureId}: specSections must be an array`);
    }
    if (!Array.isArray(fx.acceptanceCriteria)) {
      err(`${fx.fixtureId}: acceptanceCriteria must be an array`);
    }
    if (!Array.isArray(fx.arcEntries)) {
      err(`${fx.fixtureId}: arcEntries must be an array`);
    }
    if (typeof fx.regime !== "string" || !VALID_REGIMES.has(fx.regime)) {
      err(`${fx.fixtureId}: regime must be one of ${[...VALID_REGIMES].join(", ")}, got "${fx.regime}"`);
    }
    if (typeof fx.intendedToCatch !== "string" || fx.intendedToCatch.trim() === "") {
      err(`${fx.fixtureId}: intendedToCatch must be a non-empty string (fixtures need an articulated intent)`);
    }
    if (!Array.isArray(fx.expectedLossSignatureReasons)) {
      err(`${fx.fixtureId}: expectedLossSignatureReasons must be an array`);
    }
    if (fx["expected_v0.1_verdict"] === undefined) {
      err(`${fx.fixtureId}: expected_v0.1_verdict is required`);
    }
    if (!Object.prototype.hasOwnProperty.call(fx, "expected_v0.2_elk_verdict")) {
      err(
        `${fx.fixtureId}: expected_v0.2_elk_verdict is required (use null to mean "no expected change after ELK"). ` +
          `Absent ≠ null — the absence collapses the ELK regression-suite signal per ROADMAP cross-cutting Test Corpus Manifest Discipline.`
      );
    }
  }

  // (1) Every fixture file has a manifest entry
  for (const id of fixtureIdsFromFiles) {
    if (!fixtureIdsFromManifest.has(id)) {
      err(`orphan fixture file: tests/corpus/${id}.fixture.js has no manifest entry`);
    }
  }
  // (2) Every manifest entry references an existing file
  for (const id of fixtureIdsFromManifest) {
    if (!fixtureIdsFromFiles.has(id)) {
      err(`orphan manifest entry: fixtureId "${id}" has no tests/corpus/${id}.fixture.js`);
    }
  }

  if (errors.length > 0) {
    console.error(`\n  ✗ FAIL: ${errors.length} corpus manifest violation(s):`);
    for (const e of errors) console.error(`    - ${e}`);
    process.exit(1);
  }

  console.log(
    `  ✓ PASS: corpus manifest valid (${fixtureIdsFromManifest.size} entries, ${fixtureIdsFromFiles.size} fixture files)`
  );
}

await main().catch((e) => {
  console.error("  ✗ FAIL: " + (e instanceof Error ? e.message : String(e)));
  process.exit(1);
});
