/**
 * Phase 4 Step 1 — ARC Module Loader Skeleton + Schema Validation Tests.
 *
 * Verifies per spec §3.6.2 + phase-4-entry.md §7 step ledger Step 1:
 *   - ARCModule + ARCEntry kernel-pure type surface
 *   - validateARCModule structural schema check (positive + negative cases)
 *   - Registry seam: register / get / list / reset
 *   - Loading the canonical arc/core/bfo-2020.json passes validation
 *     and registers correctly (40 ARCEntry instances per
 *     phase-4-entry.md §1 row 4)
 *   - Loading arc/core/iao-information.json passes validation
 *     (Phase 5 IAO skeleton; 3 ARCEntry instances)
 *
 * Out of scope per Step 1 minimum (forward-tracked):
 *   - Lift-correctness against ARC content (Step 3)
 *   - Strict mode rejection behavior (Step 2)
 *   - BFO Disjointness Map firings (Step 4)
 */

import { strictEqual, ok, throws } from "node:assert";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  validateARCModule,
  registerARCModule,
  getARCModule,
  listRegisteredARCModules,
  __resetARCModuleRegistryForTesting,
} from "../src/kernel/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..", "..");

let passed = 0;
let failed = 0;

function check(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(" ", e instanceof Error ? e.message : String(e));
    failed++;
  }
}

async function checkAsync(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(" ", e instanceof Error ? e.message : String(e));
    failed++;
  }
}

function makeValidEntry(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    "@type": "ARCEntry",
    name: "Bearer Of",
    level: "Instance-level",
    context: "Dependence",
    notation: "—",
    formalDefinition: "—",
    owlCharacteristics: "—",
    owlRealization: "BFO",
    subPropertyOf: "—",
    domain: "Independent Continuant",
    range: "Specifically Dependent Continuant",
    iri: "obo:BFO_0000196",
    notes: "Verified against loaded BFO 2020 in triplestore",
    ...overrides,
  };
}

function makeValidModule(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    "@context": "https://ontology-of-freedom.org/ofbt/arc-context.jsonld",
    "@id": "arc:module:core/test",
    "@type": "ARCModule",
    moduleId: "core/test",
    arcManifestVersion: "0.1.0",
    entries: [makeValidEntry()],
    ...overrides,
  };
}

async function main(): Promise<void> {
  // --- validateARCModule: positive cases ---

  check("validateARCModule: valid minimal module passes", () => {
    const r = validateARCModule(makeValidModule());
    ok(r.valid);
    if (r.valid) {
      strictEqual(r.module.moduleId, "core/test");
      strictEqual(r.module.entries.length, 1);
    }
  });

  check("validateARCModule: zero-entry module passes (empty entries array is valid)", () => {
    const r = validateARCModule(makeValidModule({ entries: [] }));
    ok(r.valid);
  });

  // --- validateARCModule: negative cases ---

  check("validateARCModule: non-object rejected", () => {
    const r = validateARCModule("not an object");
    ok(!r.valid);
    if (!r.valid) ok(r.errors.length > 0);
  });

  check("validateARCModule: null rejected", () => {
    const r = validateARCModule(null);
    ok(!r.valid);
  });

  check("validateARCModule: array at root rejected", () => {
    const r = validateARCModule([]);
    ok(!r.valid);
  });

  check("validateARCModule: wrong @type rejected", () => {
    const r = validateARCModule(makeValidModule({ "@type": "NotARCModule" }));
    ok(!r.valid);
    if (!r.valid) {
      ok(r.errors.some((e) => e.includes("@type")));
    }
  });

  check("validateARCModule: missing moduleId rejected", () => {
    const m = makeValidModule();
    delete m.moduleId;
    const r = validateARCModule(m);
    ok(!r.valid);
    if (!r.valid) {
      ok(r.errors.some((e) => e.includes("moduleId")));
    }
  });

  check("validateARCModule: empty moduleId rejected", () => {
    const r = validateARCModule(makeValidModule({ moduleId: "" }));
    ok(!r.valid);
  });

  check("validateARCModule: missing arcManifestVersion rejected", () => {
    const m = makeValidModule();
    delete m.arcManifestVersion;
    const r = validateARCModule(m);
    ok(!r.valid);
    if (!r.valid) {
      ok(r.errors.some((e) => e.includes("arcManifestVersion")));
    }
  });

  check("validateARCModule: entries not an array rejected", () => {
    const r = validateARCModule(makeValidModule({ entries: "nope" }));
    ok(!r.valid);
    if (!r.valid) {
      ok(r.errors.some((e) => e.includes("entries")));
    }
  });

  check("validateARCModule: entry wrong @type rejected", () => {
    const r = validateARCModule(
      makeValidModule({ entries: [makeValidEntry({ "@type": "NotARCEntry" })] })
    );
    ok(!r.valid);
  });

  check("validateARCModule: entry missing required field rejected", () => {
    const bad = makeValidEntry();
    delete bad.iri;
    const r = validateARCModule(makeValidModule({ entries: [bad] }));
    ok(!r.valid);
    if (!r.valid) {
      ok(r.errors.some((e) => e.includes("iri")));
    }
  });

  check("validateARCModule: entry field wrong type rejected", () => {
    const r = validateARCModule(
      makeValidModule({ entries: [makeValidEntry({ name: 42 })] })
    );
    ok(!r.valid);
  });

  check("validateARCModule: collects multiple errors in single pass (does NOT short-circuit)", () => {
    const r = validateARCModule({
      "@type": "WrongType",
      moduleId: "",
      arcManifestVersion: null,
      entries: "not-array",
    });
    ok(!r.valid);
    if (!r.valid) ok(r.errors.length >= 3);
  });

  // --- Registry seam ---

  check("registry: register + get round-trip on valid module", () => {
    __resetARCModuleRegistryForTesting();
    registerARCModule(makeValidModule());
    const got = getARCModule("core/test");
    ok(got !== null);
    if (got !== null) strictEqual(got.moduleId, "core/test");
  });

  check("registry: getARCModule returns null for unregistered id", () => {
    __resetARCModuleRegistryForTesting();
    strictEqual(getARCModule("core/missing"), null);
  });

  check("registry: registerARCModule throws on invalid input", () => {
    __resetARCModuleRegistryForTesting();
    throws(() => registerARCModule({ "@type": "Bogus" }), /registerARCModule: invalid/);
  });

  check("registry: re-registration with same moduleId overwrites", () => {
    __resetARCModuleRegistryForTesting();
    registerARCModule(makeValidModule({ arcManifestVersion: "0.1.0" }));
    registerARCModule(makeValidModule({ arcManifestVersion: "0.2.0" }));
    const got = getARCModule("core/test");
    ok(got !== null);
    if (got !== null) strictEqual(got.arcManifestVersion, "0.2.0");
  });

  check("registry: listRegisteredARCModules returns sorted ids", () => {
    __resetARCModuleRegistryForTesting();
    registerARCModule(makeValidModule({ moduleId: "core/zzz", "@id": "arc:module:core/zzz" }));
    registerARCModule(makeValidModule({ moduleId: "core/aaa", "@id": "arc:module:core/aaa" }));
    registerARCModule(makeValidModule({ moduleId: "core/mmm", "@id": "arc:module:core/mmm" }));
    const ids = listRegisteredARCModules();
    strictEqual(ids.length, 3);
    strictEqual(ids[0], "core/aaa");
    strictEqual(ids[1], "core/mmm");
    strictEqual(ids[2], "core/zzz");
  });

  check("registry: __resetARCModuleRegistryForTesting clears all", () => {
    __resetARCModuleRegistryForTesting();
    registerARCModule(makeValidModule());
    __resetARCModuleRegistryForTesting();
    strictEqual(getARCModule("core/test"), null);
    strictEqual(listRegisteredARCModules().length, 0);
  });

  // --- Real-file validation: arc/core/bfo-2020.json ---

  await checkAsync("arc/core/bfo-2020.json: validates as ARCModule with 40 entries", async () => {
    const path = resolve(projectRoot, "arc", "core", "bfo-2020.json");
    const raw = await readFile(path, "utf-8");
    const parsed = JSON.parse(raw);
    const r = validateARCModule(parsed);
    ok(r.valid, r.valid ? "" : r.errors.join("; "));
    if (r.valid) {
      strictEqual(r.module.moduleId, "core/bfo-2020");
      strictEqual(r.module.entries.length, 40);
      strictEqual(r.module.arcManifestVersion, "0.1.0");
    }
  });

  await checkAsync("arc/core/bfo-2020.json: registers + retrievable by moduleId", async () => {
    __resetARCModuleRegistryForTesting();
    const path = resolve(projectRoot, "arc", "core", "bfo-2020.json");
    const parsed = JSON.parse(await readFile(path, "utf-8"));
    registerARCModule(parsed);
    const got = getARCModule("core/bfo-2020");
    ok(got !== null);
    if (got !== null) strictEqual(got.entries.length, 40);
  });

  await checkAsync("arc/core/iao-information.json: validates as ARCModule (Phase 5 skeleton)", async () => {
    const path = resolve(projectRoot, "arc", "core", "iao-information.json");
    const raw = await readFile(path, "utf-8");
    const parsed = JSON.parse(raw);
    const r = validateARCModule(parsed);
    ok(r.valid, r.valid ? "" : r.errors.join("; "));
    if (r.valid) {
      strictEqual(r.module.moduleId, "core/iao-information");
      ok(r.module.entries.length >= 1);
    }
  });

  await checkAsync("Both ARC modules co-register without collision", async () => {
    __resetARCModuleRegistryForTesting();
    const bfoPath = resolve(projectRoot, "arc", "core", "bfo-2020.json");
    const iaoPath = resolve(projectRoot, "arc", "core", "iao-information.json");
    registerARCModule(JSON.parse(await readFile(bfoPath, "utf-8")));
    registerARCModule(JSON.parse(await readFile(iaoPath, "utf-8")));
    const ids = listRegisteredARCModules();
    strictEqual(ids.length, 2);
    ok(ids.includes("core/bfo-2020"));
    ok(ids.includes("core/iao-information"));
  });

  console.log("");
  console.log(`  ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
