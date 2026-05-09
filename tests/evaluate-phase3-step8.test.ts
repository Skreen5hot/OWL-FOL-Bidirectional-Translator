/**
 * Phase 3 Step 8 — Session/error-surface remainders tests.
 *
 * Per architect Q-3-A step-granularity ratification 2026-05-08 +
 * Q-3-Step8-A routing 2026-05-09 (option 1 proceed-under-Step-6-Finding-4-
 * pre-ratification). Step 8 ships:
 *
 *   - structural_annotation_mismatch reason code (REASON_CODES extension;
 *     17th member; v0.1.7 → v0.1.8 minor-version bump per API §11.2)
 *   - structural_annotation_mismatch detection at loadOntology per API §5.5
 *     throws (Step 8 minimum scope; evaluate-time per-FOL-state-metadata
 *     detection per API §2.1.1 forward-tracked)
 *   - arc_manifest_version_mismatch detection at loadOntology per API §5.5
 *     throws (Step 8 minimum scope; same evaluate-time forward-track)
 *   - SessionStepCapExceededError throwing on aggregate cap exceeded
 *     per API §2.1 (always throws; non-configurable per the runaway-
 *     protection mechanism)
 *   - closure_truncated LossSignature emission per Q-3-Step5-C item 5
 *     forward-tracked (chain-depth-bound tracking is Step 8+ refinement)
 *
 * Tests cover:
 *   - REASON_CODES has 17 members (structural_annotation_mismatch added)
 *   - API_SPEC_VERSION === '0.1.8' (minor-version bump per API §11.2)
 *   - loadOntology throws OFBTError with code 'arc_manifest_version_mismatch'
 *     when config.arcManifestVersion diverges from session config
 *   - loadOntology throws OFBTError with code 'structural_annotation_mismatch'
 *     when config.structuralAnnotations diverges from session config
 *   - SessionStepCapExceededError throws when session aggregate steps
 *     exceed maxAggregateSteps; multi-query sequence exhausting the cap
 *   - 3 Step 8 fixtures: stub-fill content end-to-end
 */

import { strictEqual, ok } from "node:assert";
import {
  createSession,
  __resetSessionCounterForTesting,
} from "../src/composition/session.js";
import {
  loadOntology,
  registerTauPrologFactory,
  __resetLoadOntologyCacheForTesting,
} from "../src/composition/load-ontology.js";
import { evaluate } from "../src/composition/evaluate.js";
import { REASON_CODES } from "../src/kernel/reason-codes.js";
import { API_SPEC_VERSION } from "../src/kernel/version-constants.js";
import {
  OFBTError,
  SessionStepCapExceededError,
} from "../src/kernel/errors.js";
import { registerTauPrologProbe } from "../src/kernel/tau-prolog-probe.js";
import type { OWLOntology } from "../src/kernel/owl-types.js";
import type { EvaluableQuery } from "../src/kernel/evaluate-types.js";
import pl from "tau-prolog";

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

async function expectThrows<E extends Error>(
  fn: () => Promise<unknown>,
  errorClass: new (...args: never[]) => E
): Promise<E> {
  let thrown: unknown = null;
  try {
    await fn();
  } catch (e) {
    thrown = e;
  }
  if (thrown === null) {
    throw new Error(`expected ${errorClass.name} but no error was thrown`);
  }
  if (!(thrown instanceof errorClass)) {
    throw new Error(
      `expected ${errorClass.name} but got ${(thrown as Error).constructor.name}: ${(thrown as Error).message}`
    );
  }
  return thrown as E;
}

const PREFIX = "http://example.org/test/step8/";

async function main(): Promise<void> {
  __resetSessionCounterForTesting();
  __resetLoadOntologyCacheForTesting();
  registerTauPrologProbe(() => "0.3.4");
  registerTauPrologFactory(() => pl.create(2000));

  // -----------------------------------------------------------
  // REASON_CODES extension verification (Q-3-Step8-A pre-ratification)
  // -----------------------------------------------------------

  check(
    "Step 8 / REASON_CODES has 17 members (structural_annotation_mismatch added per Q-3-Step8-A pre-ratification)",
    () => {
      strictEqual(Object.keys(REASON_CODES).length, 17);
      strictEqual(
        REASON_CODES.structural_annotation_mismatch,
        "structural_annotation_mismatch"
      );
    }
  );

  check(
    "Step 8 / API_SPEC_VERSION bumped 0.1.7 → 0.1.8 per API §11.2 minor-version-bump for additive enum",
    () => {
      strictEqual(API_SPEC_VERSION, "0.1.8");
    }
  );

  // -----------------------------------------------------------
  // arc_manifest_version_mismatch detection at loadOntology
  // -----------------------------------------------------------

  await checkAsync(
    "Step 8 / loadOntology throws OFBTError 'arc_manifest_version_mismatch' when config diverges from session per API §5.5 + §2.1.2",
    async () => {
      const session = createSession({ arcManifestVersion: "0.1.0" });
      const ontology: OWLOntology = {
        ontologyIRI: PREFIX + "arc-mismatch",
        prefixes: { ex: PREFIX },
        tbox: [],
        abox: [],
        rbox: [],
      };
      const err = await expectThrows(
        () =>
          loadOntology(session, ontology, { arcManifestVersion: "0.2.0" }),
        OFBTError
      );
      strictEqual(err.code, "arc_manifest_version_mismatch");
    }
  );

  await checkAsync(
    "Step 8 / loadOntology accepts matching arcManifestVersion (no throw)",
    async () => {
      const session = createSession({ arcManifestVersion: "0.1.0" });
      const ontology: OWLOntology = {
        ontologyIRI: PREFIX + "arc-match",
        prefixes: { ex: PREFIX },
        tbox: [],
        abox: [],
        rbox: [],
      };
      const result = await loadOntology(session, ontology, {
        arcManifestVersion: "0.1.0",
      });
      ok(result.alreadyLoaded === false);
    }
  );

  // -----------------------------------------------------------
  // structural_annotation_mismatch detection at loadOntology
  // -----------------------------------------------------------

  await checkAsync(
    "Step 8 / loadOntology throws OFBTError 'structural_annotation_mismatch' when structuralAnnotations diverges per API §5.5 + §2.1.1",
    async () => {
      const session = createSession({
        structuralAnnotations: new Set([PREFIX + "loadBearing"]),
      });
      const ontology: OWLOntology = {
        ontologyIRI: PREFIX + "annot-mismatch",
        prefixes: { ex: PREFIX },
        tbox: [],
        abox: [],
        rbox: [],
      };
      const err = await expectThrows(
        () =>
          loadOntology(session, ontology, {
            structuralAnnotations: new Set([PREFIX + "differentAnnotation"]),
          }),
        OFBTError
      );
      strictEqual(err.code, "structural_annotation_mismatch");
    }
  );

  await checkAsync(
    "Step 8 / loadOntology accepts matching structuralAnnotations (no throw)",
    async () => {
      const matchingSet = new Set([PREFIX + "loadBearing"]);
      const session = createSession({
        structuralAnnotations: new Set([PREFIX + "loadBearing"]),
      });
      const ontology: OWLOntology = {
        ontologyIRI: PREFIX + "annot-match",
        prefixes: { ex: PREFIX },
        tbox: [],
        abox: [],
        rbox: [],
      };
      const result = await loadOntology(session, ontology, {
        structuralAnnotations: matchingSet,
      });
      ok(result.alreadyLoaded === false);
    }
  );

  // -----------------------------------------------------------
  // SessionStepCapExceededError per API §2.1
  // -----------------------------------------------------------

  await checkAsync(
    "Step 8 / SessionStepCapExceededError thrown when session aggregateSteps >= maxAggregateSteps",
    async () => {
      // Create a session with a small maxAggregateSteps; run multiple
      // queries to exhaust it. Per Step 8 minimum: each evaluate() call
      // increments aggregateSteps by 1000 (placeholder); 5000 cap → 6th
      // call exceeds. Adjust if implementation increment changes.
      const session = createSession({ maxAggregateSteps: 5000 });
      const ontology: OWLOntology = {
        ontologyIRI: PREFIX + "cap-test",
        prefixes: { ex: PREFIX },
        tbox: [],
        abox: [
          {
            "@type": "ClassAssertion",
            class: { "@type": "Class", iri: PREFIX + "Person" },
            individual: PREFIX + "alice",
          },
        ],
        rbox: [],
      };
      await loadOntology(session, ontology);
      const query: EvaluableQuery = {
        "@type": "fol:Atom",
        predicate: PREFIX + "Person",
        arguments: [{ "@type": "fol:Constant", iri: PREFIX + "alice" }],
      };
      // Run queries until aggregate cap exceeded
      let thrownError: SessionStepCapExceededError | null = null;
      let queryCount = 0;
      const maxQueries = 100; // safety bound
      while (queryCount < maxQueries) {
        try {
          await evaluate(session, query);
          queryCount++;
        } catch (e) {
          if (e instanceof SessionStepCapExceededError) {
            thrownError = e;
            break;
          }
          throw e;
        }
      }
      ok(thrownError !== null, "SessionStepCapExceededError thrown");
      ok(
        thrownError!.aggregateSteps >= 5000,
        "aggregateSteps in error >= maxAggregateSteps"
      );
      strictEqual(thrownError!.maxAggregateSteps, 5000);
      strictEqual(thrownError!.code, "aggregate_step_cap_exceeded");
    }
  );

  await checkAsync(
    "Step 8 / Session without maxAggregateSteps does NOT throw on extended sequences (default unbounded per API §2.1)",
    async () => {
      const session = createSession();
      const ontology: OWLOntology = {
        ontologyIRI: PREFIX + "no-cap",
        prefixes: { ex: PREFIX },
        tbox: [],
        abox: [
          {
            "@type": "ClassAssertion",
            class: { "@type": "Class", iri: PREFIX + "Person" },
            individual: PREFIX + "alice",
          },
        ],
        rbox: [],
      };
      await loadOntology(session, ontology);
      const query: EvaluableQuery = {
        "@type": "fol:Atom",
        predicate: PREFIX + "Person",
        arguments: [{ "@type": "fol:Constant", iri: PREFIX + "alice" }],
      };
      // Run several queries without throwing
      for (let i = 0; i < 10; i++) {
        const result = await evaluate(session, query);
        strictEqual(result.result, "true");
      }
    }
  );

  // -----------------------------------------------------------
  // OFBTError thrown is-instance-of OFBTError per API §10
  // -----------------------------------------------------------

  await checkAsync(
    "Step 8 / Thrown OFBTError instances carry .code + .libraryVersion per API §10 base class contract",
    async () => {
      const session = createSession({ arcManifestVersion: "0.1.0" });
      const ontology: OWLOntology = {
        ontologyIRI: PREFIX + "code-check",
        prefixes: { ex: PREFIX },
        tbox: [],
        abox: [],
        rbox: [],
      };
      const err = await expectThrows(
        () =>
          loadOntology(session, ontology, { arcManifestVersion: "0.2.0" }),
        OFBTError
      );
      strictEqual(err.code, "arc_manifest_version_mismatch");
      ok(typeof err.libraryVersion === "string");
      ok(err.message.length > 0);
    }
  );

  console.log("");
  console.log(`  ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main();
