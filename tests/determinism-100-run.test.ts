/**
 * 100-run determinism harness.
 *
 * Phase 1 Step 9.3 origin: walks every fixture in tests/corpus/manifest.json
 * and runs the lifter 100 times against it; asserts all 100
 * stableStringify-canonicalized outputs are byte-identical.
 *
 * Phase 2 extension: the projector-direct fixture-type convention (per
 * Phase 2 entry packet §3.2 — first introduced by p2_lossy_naf_residue)
 * supplies a FOL axioms array as `fixture.input` rather than an OWLOntology.
 * The harness dispatches via folToOwl for these entries instead of owlToFol;
 * the determinism contract (100 byte-identical canonicalized outputs) is
 * the same.
 *
 * Three (now four) fixture shapes:
 *   - single-input (`fixture.input`) with OWL ontology: run owlToFol 100x.
 *   - single-input (`fixture.input`) projector-direct (FOL array): run
 *     folToOwl 100x. Discriminated by manifest entry's
 *     `expectedOutcome.fixtureType === "projector-direct"`.
 *   - multi-input (`fixture.inputs = {key: input}`): run owlToFol 100x per
 *     input key.
 *   - multi-case throwing (`fixture.cases[]` with `expectedThrow`): run
 *     each case 100x; assert the same error class + `construct` field every
 *     time.
 *
 * Spec context:
 *   - spec §5.7 + API §6.1.1 mandate RDFC-1.0 b-node canonicalization;
 *     p1_blank_node_anonymous_restriction's expectedOutcome explicitly says
 *     "100 lift runs produce byte-identical Skolem IDs".
 *   - ADR-007 §2 (variable allocator) and §4 (fresh-allocator-per-direction)
 *     are the determinism contract for non-Skolem axioms.
 *   - The §12 acceptance criterion family includes §12.determinism.
 *   - Phase 2 entry packet §3.2 introduces the projector-direct fixture-type
 *     convention; manifest schema gates `fixtureType` per the
 *     `expectedOutcome` shape.
 *
 * The DETERMINISM_RUNS env var overrides the run count for fast local
 * iteration (e.g., DETERMINISM_RUNS=5 for a smoke check). Default is 100;
 * CI runs the default.
 */

import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { owlToFol } from "../src/kernel/lifter.js";
import { folToOwl } from "../src/kernel/projector.js";
import { stableStringify } from "../src/kernel/canonicalize.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..", "..");
const corpusDir = resolve(projectRoot, "tests", "corpus");
const manifestPath = resolve(corpusDir, "manifest.json");

const RUNS = (() => {
  const raw = process.env.DETERMINISM_RUNS;
  if (!raw) return 100;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error(`DETERMINISM_RUNS must be a positive integer; got ${JSON.stringify(raw)}`);
  }
  return parsed;
})();

interface FixtureEntry {
  fixtureId: string;
  expectedOutcome?: { fixtureType?: string };
}

interface ManifestShape {
  manifestVersion: string;
  fixtures: FixtureEntry[];
}

interface SingleInputFixture {
  input: unknown;
}

interface MultiInputFixture {
  inputs: Record<string, unknown>;
}

interface ThrowCase {
  label: string;
  input: unknown;
  expectedThrow: { class: string; construct: string };
}

interface MultiCaseFixture {
  cases: ThrowCase[];
}

let passed = 0;
let failed = 0;
let totalLifts = 0;

function logPass(name: string): void {
  console.log(`  ✓ PASS: ${name}`);
  passed++;
}

function logFail(name: string, error: unknown): void {
  console.error(`  ✗ FAIL: ${name}`);
  console.error(" ", error instanceof Error ? error.message : String(error));
  failed++;
}

async function loadFixtureModule(file: string): Promise<{ fixture: unknown }> {
  const path = resolve(corpusDir, file);
  await readFile(path, "utf-8");
  const url = "file:///" + path.replace(/\\/g, "/");
  const mod = (await import(url)) as { fixture: unknown };
  return { fixture: mod.fixture };
}

function isSingleInputFixture(f: unknown): f is SingleInputFixture {
  return typeof f === "object" && f !== null && "input" in f;
}

function isMultiInputFixture(f: unknown): f is MultiInputFixture {
  return (
    typeof f === "object" &&
    f !== null &&
    "inputs" in f &&
    typeof (f as { inputs: unknown }).inputs === "object" &&
    (f as { inputs: unknown }).inputs !== null &&
    !Array.isArray((f as { inputs: unknown }).inputs)
  );
}

function isMultiCaseFixture(f: unknown): f is MultiCaseFixture {
  return (
    typeof f === "object" &&
    f !== null &&
    "cases" in f &&
    Array.isArray((f as { cases: unknown }).cases)
  );
}

async function checkSingleInput(fixtureId: string, input: unknown): Promise<void> {
  const first = await owlToFol(input as Parameters<typeof owlToFol>[0]);
  const canonical = stableStringify(first);
  totalLifts++;
  for (let i = 1; i < RUNS; i++) {
    const next = await owlToFol(input as Parameters<typeof owlToFol>[0]);
    totalLifts++;
    const nextCanonical = stableStringify(next);
    if (nextCanonical !== canonical) {
      throw new Error(
        `non-deterministic lift on run ${i + 1}/${RUNS} for ${fixtureId}: ` +
          `output length diff ${canonical.length} vs ${nextCanonical.length}`
      );
    }
  }
}

/**
 * Projector-direct determinism check: the fixture's `input` is a
 * pre-constructed FOL axioms array (per Phase 2 entry packet §3.2). The
 * harness invokes folToOwl 100 times and asserts byte-identical
 * canonicalized outputs. The determinism contract is symmetric to the
 * lifter side — same input → byte-identical projected ontology +
 * audit-artifact-stable @ids per spec §7.5.
 */
async function checkSingleInputProjector(fixtureId: string, input: unknown): Promise<void> {
  const first = await folToOwl(input as Parameters<typeof folToOwl>[0]);
  const canonical = stableStringify(first);
  totalLifts++;
  for (let i = 1; i < RUNS; i++) {
    const next = await folToOwl(input as Parameters<typeof folToOwl>[0]);
    totalLifts++;
    const nextCanonical = stableStringify(next);
    if (nextCanonical !== canonical) {
      throw new Error(
        `non-deterministic projection on run ${i + 1}/${RUNS} for ${fixtureId}: ` +
          `output length diff ${canonical.length} vs ${nextCanonical.length}`
      );
    }
  }
}

async function checkThrowCase(
  fixtureId: string,
  caseLabel: string,
  input: unknown,
  expected: { class: string; construct: string }
): Promise<void> {
  for (let i = 0; i < RUNS; i++) {
    let thrown: unknown = null;
    try {
      await owlToFol(input as Parameters<typeof owlToFol>[0]);
    } catch (e) {
      thrown = e;
    }
    totalLifts++;
    if (thrown === null) {
      throw new Error(
        `${fixtureId}/${caseLabel}: expected throw on run ${i + 1}/${RUNS}, lifter returned`
      );
    }
    const errorClass = (thrown as Error).constructor.name;
    const construct = (thrown as { construct?: string }).construct;
    if (errorClass !== expected.class) {
      throw new Error(
        `${fixtureId}/${caseLabel}: error class drift on run ${i + 1}/${RUNS} ` +
          `— expected ${expected.class}, got ${errorClass}`
      );
    }
    if (construct !== expected.construct) {
      throw new Error(
        `${fixtureId}/${caseLabel}: construct field drift on run ${i + 1}/${RUNS} ` +
          `— expected ${expected.construct}, got ${String(construct)}`
      );
    }
  }
}

async function main(): Promise<void> {
  console.log(`  100-run determinism harness — RUNS=${RUNS}`);

  const manifestRaw = await readFile(manifestPath, "utf-8");
  const manifest = JSON.parse(manifestRaw) as ManifestShape;

  for (const entry of manifest.fixtures) {
    const file = `${entry.fixtureId}.fixture.js`;
    const name = `${entry.fixtureId}: ${RUNS} lifts produce byte-identical canonical output`;
    try {
      const { fixture } = await loadFixtureModule(file);
      if (isMultiCaseFixture(fixture)) {
        for (const c of fixture.cases) {
          await checkThrowCase(entry.fixtureId, c.label, c.input, c.expectedThrow);
        }
        logPass(
          `${entry.fixtureId}: ${RUNS} runs/case across ${fixture.cases.length} cases — ` +
            `error class + construct field byte-stable`
        );
      } else if (isSingleInputFixture(fixture)) {
        const isProjectorDirect = entry.expectedOutcome?.fixtureType === "projector-direct";
        if (isProjectorDirect) {
          await checkSingleInputProjector(entry.fixtureId, fixture.input);
          logPass(
            `${entry.fixtureId}: ${RUNS} folToOwl projections produce byte-identical canonical output (projector-direct)`,
          );
        } else {
          await checkSingleInput(entry.fixtureId, fixture.input);
          logPass(name);
        }
      } else if (isMultiInputFixture(fixture)) {
        const inputKeys = Object.keys(fixture.inputs);
        for (const key of inputKeys) {
          await checkSingleInput(`${entry.fixtureId}/${key}`, fixture.inputs[key]);
        }
        logPass(
          `${entry.fixtureId}: ${RUNS} runs across ${inputKeys.length} inputs ` +
            `(${inputKeys.join(", ")}) — each byte-stable`
        );
      } else {
        throw new Error(
          `${entry.fixtureId}: fixture has none of .input / .inputs / .cases[]; cannot determinism-check`
        );
      }
    } catch (e) {
      logFail(name, e);
    }
  }

  console.log("");
  console.log(`  Summary: ${passed} passed, ${failed} failed, ${totalLifts} total lift invocations`);

  if (failed > 0) {
    process.exit(1);
  }
}

await main();
