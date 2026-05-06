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
const VALID_CLIF_VERIFICATION_STATUSES = new Set(["Verified", "[VERIFY]", "Draft"]);
const FIXTURE_ID_RE = /^[a-z0-9_]+$/;

interface ClifGroundTruthEntry {
  clifSource: string;
  clifAxiomRef: string;
  clifText: string;
  verificationStatus: string;
  mappingNote?: string;
  expectedFOLIndex?: number | number[];
  owlAxiomLabel?: string;
}

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
  // OPTIONAL per architect Ruling 2 (BFO/CLIF parity routing cycle 2026-05-03).
  // Opt-in for canonical-CLIF/KIF-derived fixtures; pure-OWL fixtures don't carry it.
  clifGroundTruth?: ClifGroundTruthEntry[];
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
    // OPTIONAL clifGroundTruth per architect Ruling 2 (BFO/CLIF parity
    // routing cycle 2026-05-03). Validate optional presence + structural
    // shape; do NOT validate citation accuracy (that's the SME's pre-Phase-N-
    // exit responsibility per spec §3.3 [VERIFY] discipline).
    if (Object.prototype.hasOwnProperty.call(fx, "clifGroundTruth")) {
      if (!Array.isArray(fx.clifGroundTruth)) {
        err(`${fx.fixtureId}: clifGroundTruth must be an array if present`);
      } else {
        for (let i = 0; i < fx.clifGroundTruth.length; i++) {
          const cgt = fx.clifGroundTruth[i] as ClifGroundTruthEntry;
          const ctx = `${fx.fixtureId}: clifGroundTruth[${i}]`;
          if (!cgt || typeof cgt !== "object") {
            err(`${ctx}: must be an object`);
            continue;
          }
          if (typeof cgt.clifSource !== "string" || cgt.clifSource.trim() === "") {
            err(`${ctx}: clifSource must be a non-empty string (canonical source path/URL)`);
          }
          if (typeof cgt.clifAxiomRef !== "string" || cgt.clifAxiomRef.trim() === "") {
            err(`${ctx}: clifAxiomRef must be a non-empty string (line/section reference into the canonical source)`);
          }
          if (typeof cgt.clifText !== "string" || cgt.clifText.trim() === "") {
            err(`${ctx}: clifText must be a non-empty string (verbatim axiom text from the canonical source)`);
          }
          if (
            typeof cgt.verificationStatus !== "string" ||
            !VALID_CLIF_VERIFICATION_STATUSES.has(cgt.verificationStatus)
          ) {
            err(
              `${ctx}: verificationStatus must be one of Verified | [VERIFY] | Draft per spec §3.3, got "${cgt.verificationStatus}"`
            );
          }
          if (
            Object.prototype.hasOwnProperty.call(cgt, "mappingNote") &&
            typeof cgt.mappingNote !== "string"
          ) {
            err(`${ctx}: mappingNote must be a string if present`);
          }
          if (Object.prototype.hasOwnProperty.call(cgt, "expectedFOLIndex")) {
            const idx = cgt.expectedFOLIndex;
            const validIndex = (n: unknown) =>
              typeof n === "number" && Number.isInteger(n) && n >= 0;
            const ok = validIndex(idx) || (Array.isArray(idx) && idx.every(validIndex));
            if (!ok) {
              err(`${ctx}: expectedFOLIndex must be a non-negative integer or array of non-negative integers if present`);
            }
          }
          if (
            Object.prototype.hasOwnProperty.call(cgt, "owlAxiomLabel") &&
            typeof cgt.owlAxiomLabel !== "string"
          ) {
            err(`${ctx}: owlAxiomLabel must be a string if present`);
          }
        }
      }
    }

    // phaseNReactivation cross-phase reactivation discipline per architect Q5
    // ruling 2026-05-06 + ADR-010 banking. Generalized from Phase 1's banked
    // phase4Reactivation pattern. Recognized field names match the regex
    // ^phase[1-9][0-9]*Reactivation$ where N is the activating phase. Suspicious
    // typos (fields starting with `phase` and ending with `Reactivation` but
    // NOT matching the strict regex — e.g., `phase04Reactivation` with leading
    // zero, `phaseAReactivation` non-numeric) are flagged as hard errors.
    const STRICT_PHASE_REACTIVATION_RE = /^phase[1-9][0-9]*Reactivation$/;
    const SUSPICIOUS_PHASE_REACTIVATION_RE = /^phase.*Reactivation$/;
    for (const key of Object.keys(fx)) {
      if (STRICT_PHASE_REACTIVATION_RE.test(key)) {
        const val = (fx as unknown as Record<string, unknown>)[key];
        const ctx = `${fx.fixtureId}: ${key}`;
        if (!val || typeof val !== "object" || Array.isArray(val)) {
          err(`${ctx}: must be an object (cross-phase reactivation contract per ADR-010 banked principle)`);
          continue;
        }
        const r = val as Record<string, unknown>;
        if (typeof r.gatedOn !== "string" || r.gatedOn.trim() === "") {
          err(`${ctx}.gatedOn: must be a non-empty string (short identifier of what the reactivation depends on)`);
        }
        if (r.expectedOutcome === undefined || r.expectedOutcome === null) {
          err(`${ctx}.expectedOutcome: required (the result the fixture EXPECTS once the gating phase activates)`);
        }
        if (
          Object.prototype.hasOwnProperty.call(r, "divergenceTrigger") &&
          typeof r.divergenceTrigger !== "string"
        ) {
          err(`${ctx}.divergenceTrigger: must be a string if present (escalation condition observed at reactivation)`);
        }
      } else if (SUSPICIOUS_PHASE_REACTIVATION_RE.test(key)) {
        // Field starts with `phase` and ends with `Reactivation` but does not
        // match the strict regex. Suspicious typo per architect Q5 refinement.
        err(
          `${fx.fixtureId}: suspicious field name "${key}" — looks like a phaseNReactivation field but does not match the strict pattern ^phase[1-9][0-9]*Reactivation$ ` +
            `(invalid leading zero, non-numeric N, or missing N). Per ADR-010 + architect Q5 ruling 2026-05-06.`
        );
      }
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
