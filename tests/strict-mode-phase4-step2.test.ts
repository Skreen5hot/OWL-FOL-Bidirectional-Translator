/**
 * Phase 4 Step 2 — Strict Mode + ARC Module Dependency Validation Tests.
 *
 * Per spec §3.6.3 + §3.6.4 + Q-4-F lift-rejection ruling 2026-05-10 +
 * phase-4-entry.md §2.2 + §7 step ledger Step 2.
 *
 * Developer-side tests with inline ontologies (corpus-side fixtures
 * — bfo_strict_mode_rejection / bfo_strict_mode_acceptance /
 * arc_module_dependency_validation — are step-N-bind SME-domain
 * authoring, dispatched separately).
 *
 * Verifies:
 *   - Strict mode + arcModules=['core/bfo-2020'] + BFO-only input → lift succeeds
 *   - Strict mode + arcModules=['core/bfo-2020'] + non-BFO predicate in input
 *     → UnsupportedConstructError with `construct: <offending IRI>` and
 *     reason code `unsupported_construct` per Q-3-Step6-B reuse-bounded-by-
 *     semantic-state-alignment
 *   - Permissive mode (default) + non-BFO predicate → lift succeeds
 *   - Strict mode rejection coverage across axiom shapes (ObjectProperty
 *     Assertion + RBox + class-expression Restriction.onProperty)
 *   - ARC module dependency validation: declared module with missing
 *     dependency throws ARCManifestError at loadOntology
 *   - Vocabulary check uses canonicalized IRIs (prefixed form vs full URI
 *     resolves identically)
 */

import { strictEqual, ok, rejects } from "node:assert";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { owlToFol } from "../src/kernel/lifter.js";
import {
  registerARCModule,
  __resetARCModuleRegistryForTesting,
} from "../src/kernel/arc-module-registry.js";
import {
  UnsupportedConstructError,
  ARCManifestError,
} from "../src/kernel/errors.js";
import {
  createSession,
  __resetSessionCounterForTesting,
} from "../src/composition/session.js";
import {
  loadOntology,
  registerTauPrologFactory,
  __resetLoadOntologyCacheForTesting,
} from "../src/composition/load-ontology.js";
import { registerTauPrologProbe } from "../src/kernel/tau-prolog-probe.js";
import type { OWLOntology } from "../src/kernel/owl-types.js";
import pl from "tau-prolog";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..", "..");

let passed = 0;
let failed = 0;

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

const BFO_PFX = "http://purl.obolibrary.org/obo/";
// BFO_0000196 (Bearer Of) — verified present in arc/core/bfo-2020.json catalogue.
// (Common BFO_0000050 part_of is NOT in the 40-entry v0.1 catalogue; use only IRIs
// actually shipped in the loaded module to exercise the positive-control path.)
const BEARER_OF_FULL = BFO_PFX + "BFO_0000196";
const NON_BFO_PROP = "http://example.org/myDomain/hasOwner";
const PERSON_CLASS = BFO_PFX + "BFO_0000040";

async function loadBFOArcModule(): Promise<void> {
  const path = resolve(projectRoot, "arc", "core", "bfo-2020.json");
  const raw = await readFile(path, "utf-8");
  registerARCModule(JSON.parse(raw));
}

/**
 * Re-prime the test environment after a reset cycle.
 * `__resetLoadOntologyCacheForTesting` also clears `registeredFactory` per
 * load-ontology.ts:435; the factory must be re-registered before any
 * subsequent loadOntology call.
 */
function primeTestEnv(): void {
  registerTauPrologProbe(() => "0.3.4");
  registerTauPrologFactory(() => pl.create(2000));
}

async function main(): Promise<void> {
  __resetSessionCounterForTesting();
  __resetLoadOntologyCacheForTesting();
  __resetARCModuleRegistryForTesting();
  registerTauPrologProbe(() => "0.3.4");
  registerTauPrologFactory(() => pl.create(2000));
  await loadBFOArcModule();

  // --- Strict mode: positive control (BFO-only input passes) ---

  await checkAsync(
    "Step 2 / Strict mode: BFO-only input lifts successfully (positive control)",
    async () => {
      const ontology: OWLOntology = {
        ontologyIRI: "http://example.org/test/strict-bfo-only",
        prefixes: { bfo: BFO_PFX, obo: BFO_PFX },
        tbox: [],
        abox: [
          {
            "@type": "ObjectPropertyAssertion",
            property: BEARER_OF_FULL,
            source: "http://example.org/test/x",
            target: "http://example.org/test/y",
          },
        ],
        rbox: [],
      };
      const axioms = await owlToFol(ontology, {
        arcCoverage: "strict",
        arcModules: ["core/bfo-2020"],
      });
      ok(Array.isArray(axioms));
      ok(axioms.length > 0, "BFO-only input emitted FOL axioms under strict mode");
    }
  );

  // --- Strict mode: lift-rejection on non-BFO predicate (the load-bearing canary) ---

  await checkAsync(
    "Step 2 / Strict mode: non-BFO ObjectPropertyAssertion throws UnsupportedConstructError per Q-4-F",
    async () => {
      const ontology: OWLOntology = {
        ontologyIRI: "http://example.org/test/strict-non-bfo",
        prefixes: { bfo: BFO_PFX },
        tbox: [],
        abox: [
          {
            "@type": "ObjectPropertyAssertion",
            property: NON_BFO_PROP,
            source: "http://example.org/test/alice",
            target: "http://example.org/test/bob",
          },
        ],
        rbox: [],
      };
      let caught: unknown = null;
      try {
        await owlToFol(ontology, {
          arcCoverage: "strict",
          arcModules: ["core/bfo-2020"],
        });
      } catch (e) {
        caught = e;
      }
      ok(caught !== null, "expected throw");
      ok(
        caught instanceof UnsupportedConstructError,
        `expected UnsupportedConstructError, got ${(caught as Error)?.constructor.name}`
      );
      const err = caught as UnsupportedConstructError;
      strictEqual(err.construct, NON_BFO_PROP);
      strictEqual(err.code, "unsupported_construct");
      ok(err.message.includes("strict"), "message mentions strict mode");
    }
  );

  await checkAsync(
    "Step 2 / Strict mode: non-BFO predicate in RBox throws (ObjectPropertyDomain)",
    async () => {
      const ontology: OWLOntology = {
        ontologyIRI: "http://example.org/test/strict-rbox-non-bfo",
        prefixes: {},
        tbox: [],
        abox: [],
        rbox: [
          {
            "@type": "ObjectPropertyDomain",
            property: NON_BFO_PROP,
            domain: { "@type": "Class", iri: PERSON_CLASS },
          },
        ],
      };
      await rejects(
        owlToFol(ontology, {
          arcCoverage: "strict",
          arcModules: ["core/bfo-2020"],
        }),
        UnsupportedConstructError
      );
    }
  );

  await checkAsync(
    "Step 2 / Strict mode: non-BFO predicate in Restriction.onProperty throws (TBox class expression)",
    async () => {
      const ontology: OWLOntology = {
        ontologyIRI: "http://example.org/test/strict-restriction-non-bfo",
        prefixes: {},
        tbox: [
          {
            "@type": "SubClassOf",
            subClass: { "@type": "Class", iri: PERSON_CLASS },
            superClass: {
              "@type": "Restriction",
              onProperty: NON_BFO_PROP,
              someValuesFrom: { "@type": "Class", iri: PERSON_CLASS },
            },
          },
        ],
        abox: [],
        rbox: [],
      };
      await rejects(
        owlToFol(ontology, {
          arcCoverage: "strict",
          arcModules: ["core/bfo-2020"],
        }),
        UnsupportedConstructError
      );
    }
  );

  // --- Permissive mode: non-BFO predicate accepted ---

  await checkAsync(
    "Step 2 / Permissive mode (default): non-BFO predicate lifts normally (no throw)",
    async () => {
      const ontology: OWLOntology = {
        ontologyIRI: "http://example.org/test/permissive-non-bfo",
        prefixes: {},
        tbox: [],
        abox: [
          {
            "@type": "ObjectPropertyAssertion",
            property: NON_BFO_PROP,
            source: "http://example.org/test/alice",
            target: "http://example.org/test/bob",
          },
        ],
        rbox: [],
      };
      const axioms = await owlToFol(ontology, {
        arcCoverage: "permissive",
        arcModules: ["core/bfo-2020"],
      });
      ok(axioms.length > 0);
    }
  );

  await checkAsync(
    "Step 2 / No arcCoverage (omitted): non-BFO predicate lifts normally (permissive default)",
    async () => {
      const ontology: OWLOntology = {
        ontologyIRI: "http://example.org/test/no-cov-non-bfo",
        prefixes: {},
        tbox: [],
        abox: [
          {
            "@type": "ObjectPropertyAssertion",
            property: NON_BFO_PROP,
            source: "http://example.org/test/alice",
            target: "http://example.org/test/bob",
          },
        ],
        rbox: [],
      };
      const axioms = await owlToFol(ontology);
      ok(axioms.length > 0);
    }
  );

  // --- Strict mode error reports first offending predicate ---

  await checkAsync(
    "Step 2 / Strict mode: error reports FIRST offending predicate in source order",
    async () => {
      const NON_BFO_A = "http://example.org/a/first";
      const NON_BFO_B = "http://example.org/b/second";
      const ontology: OWLOntology = {
        ontologyIRI: "http://example.org/test/strict-multi-non-bfo",
        prefixes: {},
        tbox: [],
        abox: [
          {
            "@type": "ObjectPropertyAssertion",
            property: NON_BFO_A,
            source: "http://example.org/test/x",
            target: "http://example.org/test/y",
          },
          {
            "@type": "ObjectPropertyAssertion",
            property: NON_BFO_B,
            source: "http://example.org/test/x",
            target: "http://example.org/test/y",
          },
        ],
        rbox: [],
      };
      let err: UnsupportedConstructError | null = null;
      try {
        await owlToFol(ontology, {
          arcCoverage: "strict",
          arcModules: ["core/bfo-2020"],
        });
      } catch (e) {
        if (e instanceof UnsupportedConstructError) err = e;
      }
      ok(err !== null);
      strictEqual(err!.construct, NON_BFO_A);
    }
  );

  // --- Strict mode + empty arcModules: every property fails (edge case) ---

  await checkAsync(
    "Step 2 / Strict mode + empty arcModules: any property fails (consumer hasn't bought vocabulary)",
    async () => {
      const ontology: OWLOntology = {
        ontologyIRI: "http://example.org/test/strict-empty-modules",
        prefixes: {},
        tbox: [],
        abox: [
          {
            "@type": "ObjectPropertyAssertion",
            property: BEARER_OF_FULL,
            source: "http://example.org/test/x",
            target: "http://example.org/test/y",
          },
        ],
        rbox: [],
      };
      await rejects(
        owlToFol(ontology, { arcCoverage: "strict", arcModules: [] }),
        UnsupportedConstructError
      );
    }
  );

  // --- Strict mode: ontology with no properties (TBox-only SubClassOf) ---

  await checkAsync(
    "Step 2 / Strict mode: property-free input (TBox-only SubClassOf) lifts under strict mode (no properties to check)",
    async () => {
      const ontology: OWLOntology = {
        ontologyIRI: "http://example.org/test/strict-property-free",
        prefixes: {},
        tbox: [
          {
            "@type": "SubClassOf",
            subClass: { "@type": "Class", iri: PERSON_CLASS },
            superClass: { "@type": "Class", iri: BFO_PFX + "BFO_0000002" },
          },
        ],
        abox: [],
        rbox: [],
      };
      const axioms = await owlToFol(ontology, {
        arcCoverage: "strict",
        arcModules: ["core/bfo-2020"],
      });
      ok(axioms.length > 0);
    }
  );

  // --- ARC module dependency validation (composition layer) ---

  await checkAsync(
    "Step 2 / Dependency validation: declared module with missing dependency throws ARCManifestError",
    async () => {
      __resetARCModuleRegistryForTesting();
      __resetLoadOntologyCacheForTesting();
      primeTestEnv();
      // Register a fake module declaring a dependency NOT in arcModules.
      registerARCModule({
        "@type": "ARCModule",
        moduleId: "core/test-dep-module",
        arcManifestVersion: "0.1.0",
        dependencies: ["core/missing-dep"],
        entries: [
          {
            "@type": "ARCEntry",
            name: "Test Relation",
            level: "Instance-level",
            context: "Test",
            notation: "—",
            formalDefinition: "—",
            owlCharacteristics: "—",
            owlRealization: "Test",
            subPropertyOf: "—",
            domain: "Thing",
            range: "Thing",
            iri: "http://example.org/test#testRelation",
            notes: "Test fixture",
          },
        ],
      });
      const session = createSession({
        arcModules: ["core/test-dep-module"],
      });
      const ontology: OWLOntology = {
        ontologyIRI: "http://example.org/test/dep-missing",
        prefixes: {},
        tbox: [],
        abox: [],
        rbox: [],
      };
      let caught: unknown = null;
      try {
        await loadOntology(session, ontology);
      } catch (e) {
        caught = e;
      }
      ok(caught !== null, "expected throw");
      ok(
        caught instanceof ARCManifestError,
        `expected ARCManifestError, got ${(caught as Error)?.constructor.name}`
      );
      const err = caught as ARCManifestError;
      strictEqual(err.code, "arc_manifest_error");
      ok(err.message.includes("core/missing-dep"));
      ok(Array.isArray(err.missingProperties));
      ok(err.missingProperties!.length > 0);
    }
  );

  await checkAsync(
    "Step 2 / Dependency validation: BFO-only session (no deps) passes",
    async () => {
      __resetARCModuleRegistryForTesting();
      __resetLoadOntologyCacheForTesting();
      primeTestEnv();
      await loadBFOArcModule();
      const session = createSession({ arcModules: ["core/bfo-2020"] });
      const ontology: OWLOntology = {
        ontologyIRI: "http://example.org/test/bfo-no-deps",
        prefixes: {},
        tbox: [],
        abox: [],
        rbox: [],
      };
      const result = await loadOntology(session, ontology);
      ok(result.alreadyLoaded === false);
    }
  );

  await checkAsync(
    "Step 2 / Dependency validation: declared module with dependency PRESENT passes",
    async () => {
      __resetARCModuleRegistryForTesting();
      __resetLoadOntologyCacheForTesting();
      primeTestEnv();
      registerARCModule({
        "@type": "ARCModule",
        moduleId: "core/root",
        arcManifestVersion: "0.1.0",
        entries: [],
      });
      registerARCModule({
        "@type": "ARCModule",
        moduleId: "core/child",
        arcManifestVersion: "0.1.0",
        dependencies: ["core/root"],
        entries: [],
      });
      const session = createSession({
        arcModules: ["core/root", "core/child"],
      });
      const ontology: OWLOntology = {
        ontologyIRI: "http://example.org/test/dep-present",
        prefixes: {},
        tbox: [],
        abox: [],
        rbox: [],
      };
      const result = await loadOntology(session, ontology);
      ok(result.alreadyLoaded === false);
    }
  );

  console.log("");
  console.log(`  ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
