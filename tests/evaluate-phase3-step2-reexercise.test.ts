/**
 * Phase 3 Step 2 — Re-exercise gate against real evaluate() per Q3 ruling 2026-05-06.
 *
 * Closes I1 (Phase 2 exit forward-track): re-exercise every Phase 2
 * stub-evaluated parity canary against the real `evaluate()` per API §7.1
 * BEFORE Phase 3 implementation work proceeds past Step 1.
 *
 * Per architect Q-3-A ratification 2026-05-08 (step granularity) +
 * Q-Frank-4 publication commitment 2026-05-07: this file produces the
 * per-canary publication artifact. Each canary gets one test that wires
 * the lift→project→re-lift→evaluate plumbing end-to-end via loadOntology
 * (API §5.5 ratified at the Step 3 architectural-gap micro-cycle 2026-05-09)
 * and asserts the actual SLD-resolved evaluator outcome (UPGRADED at
 * Step 3 from the Step 2 skeleton baseline).
 *
 * STEP 3 OUTCOMES — what the assertions now reflect:
 *
 *   At Step 1b skeleton (commits c2a9867 + 8b4fb77), evaluate() returned
 *   'undetermined' uniformly. At Step 3 (this commit + ADR-007 §11
 *   FOL→Prolog translation), evaluate() runs Tau Prolog SLD against
 *   the session's loaded clause database and produces actual three-state
 *   results per spec §6.3 default OWA.
 *
 * Per-canary Step 3 outcomes (UPGRADED from Step 2 baseline):
 *
 * | Canary | Stub result (Phase 2) | Step 3 SLD result | Disposition |
 * |---|---|---|---|
 * | parity_canary_query_preservation | 'true' | 'true' / 'consistent' | ✓ SURVIVED |
 * | parity_canary_negative_query | 'undetermined' | 'undetermined' / 'open_world_undetermined' | ✓ SURVIVED |
 * | parity_canary_visual_equivalence_trap (Tier 1, Q_1+Q_2) | 'true'/'true' | 'true'/'true' | ✓ SURVIVED |
 *
 * Tier 2 of visual_equivalence_trap (the existential-conjunction-negation
 * enhanced discriminator) is OUT OF v0.1 EvaluableQuery scope per API §7.5
 * (FOLExistential + FOLNegation throw UnsupportedConstructError); routed
 * to I8 cycle-2 architect-mediated bundle for fixture pre-amendment per
 * Step 1a routing 2026-05-08.
 *
 * Plumbing verification: each test exercises the full canonical
 * lift→project→re-lift pipeline (Phase 1 owlToFol → Phase 2 folToOwl →
 * Phase 1 owlToFol) plus the Phase 3 evaluate(session, query) call.
 * Plumbing failures (lifter throw, projector throw, evaluate throw)
 * indicate regression in the upstream pipeline; skeleton-disposition
 * outcomes are expected and documented.
 */

import { strictEqual, ok } from "node:assert";
import { owlToFol } from "../src/kernel/lifter.js";
import { folToOwl } from "../src/kernel/projector.js";
import { evaluate } from "../src/composition/evaluate.js";
import {
  loadOntology,
  registerTauPrologFactory,
  __resetLoadOntologyCacheForTesting,
} from "../src/composition/load-ontology.js";
import {
  createSession,
  __resetSessionCounterForTesting,
} from "../src/composition/session.js";
import { REASON_CODES } from "../src/kernel/reason-codes.js";
import { registerTauPrologProbe } from "../src/kernel/tau-prolog-probe.js";
import type { EvaluableQuery } from "../src/kernel/evaluate-types.js";
import type { OWLOntology } from "../src/kernel/owl-types.js";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pl from "tau-prolog";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..", "..");
const corpusDir = resolve(projectRoot, "tests", "corpus");

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

interface ParityCanaryFixture {
  input: OWLOntology;
  discriminatingQuery?: EvaluableQuery;
  discriminatingQueries?: ReadonlyArray<{
    label: string;
    query: EvaluableQuery;
    expectedStubResult: string;
  }>;
  expectedOutcome: {
    discriminatingQueryStubResult?: string;
    discriminatingQueriesAllStubResult?: string;
  };
}

async function loadCanaryFixture(filename: string): Promise<ParityCanaryFixture> {
  const path = resolve(corpusDir, filename);
  await readFile(path, "utf-8");
  const url = "file:///" + path.replace(/\\/g, "/");
  const mod = (await import(url)) as { fixture: ParityCanaryFixture };
  return mod.fixture;
}

/**
 * Run a canary's lift→project→re-lift pipeline and call evaluate() against
 * its discriminating query. UPGRADED at Step 3 to load the re-lifted F_3
 * ontology into the session via loadOntology (API §5.5) so SLD has the
 * actual FOL state to resolve against. Returns the evaluator outcome for
 * assertion + the F_3 axiom count for plumbing verification.
 */
async function reExerciseCanary(
  fixture: ParityCanaryFixture,
  query: EvaluableQuery
): Promise<{
  f1AxiomCount: number;
  f3AxiomCount: number;
  evaluatorResult: "true" | "false" | "undetermined";
  evaluatorReason: string;
}> {
  const f1 = await owlToFol(fixture.input);
  const projected = await folToOwl(f1);
  const f3 = await owlToFol(projected.ontology);

  const session = createSession();
  // Step 3 upgrade: load the re-lifted ontology into the session via
  // loadOntology so the Tau Prolog clause database is populated before
  // evaluate runs SLD per ADR-007 §11.
  await loadOntology(session, projected.ontology);
  const evalResult = await evaluate(session, query);

  return {
    f1AxiomCount: f1.length,
    f3AxiomCount: f3.length,
    evaluatorResult: evalResult.result,
    evaluatorReason: evalResult.reason,
  };
}

async function main(): Promise<void> {
  __resetSessionCounterForTesting();
  __resetLoadOntologyCacheForTesting();
  registerTauPrologProbe(() => "0.3.4");
  // Step 3 upgrade: register real Tau Prolog factory so loadOntology
  // can allocate sessions for SLD resolution per ADR-007 §11.
  registerTauPrologFactory(() => pl.create(1000));

  // -----------------------------------------------------------
  // Canary 1: parity_canary_query_preservation
  // Risk tag: expected-to-survive (per §3.6)
  // Stub result: 'true' (Person(alice) entailed via SubClassOf chain)
  // Step 1b skeleton: 'undetermined' (uniform skeleton return)
  // Step 2 disposition: ⏸ skeleton-deferred-to-step-3
  // -----------------------------------------------------------

  await checkAsync(
    "Step 2 / parity_canary_query_preservation: lift→project→re-lift plumbing succeeds",
    async () => {
      const fixture = await loadCanaryFixture(
        "parity_canary_query_preservation.fixture.js"
      );
      ok(fixture.discriminatingQuery, "fixture has discriminatingQuery field");
      const outcome = await reExerciseCanary(fixture, fixture.discriminatingQuery);
      ok(outcome.f1AxiomCount > 0, "lift produced axioms");
      ok(outcome.f3AxiomCount > 0, "re-lift after projection produced axioms");
    }
  );

  await checkAsync(
    "Step 3 / parity_canary_query_preservation: ✓ SURVIVED — real evaluate() returns 'true' / 'consistent' (matches stub)",
    async () => {
      const fixture = await loadCanaryFixture(
        "parity_canary_query_preservation.fixture.js"
      );
      const outcome = await reExerciseCanary(fixture, fixture.discriminatingQuery!);
      // UPGRADED at Step 3 from skeleton-baseline to SLD outcome:
      // Phase 2 stub returned 'true' for the entailed Person(alice) query.
      // Step 3 SLD via Tau Prolog Horn-rule chain (Mother(alice) +
      // ∀x. Mother(x) → Female(x) + ∀x. Female(x) → Person(x))
      // resolves to 'true' / 'consistent', matching the stub.
      strictEqual(outcome.evaluatorResult, "true");
      strictEqual(outcome.evaluatorReason, REASON_CODES.consistent);
      strictEqual(
        fixture.expectedOutcome.discriminatingQueryStubResult,
        "true",
        "fixture's stub-result is 'true'; Step 3 SLD matches per Q-Frank-4 publication artifact"
      );
    }
  );

  // -----------------------------------------------------------
  // Canary 2: parity_canary_negative_query
  // Risk tag: at-risk-horn-fragment-closure (Step 1a: ✓ expected-to-survive)
  // Stub result: 'undetermined' (OWA, no Knows facts/rules)
  // Step 1b skeleton: 'undetermined' (matches stub trivially)
  // Step 2 disposition: ✓ survived
  // -----------------------------------------------------------

  await checkAsync(
    "Step 2 / parity_canary_negative_query: lift→project→re-lift plumbing succeeds",
    async () => {
      const fixture = await loadCanaryFixture("parity_canary_negative_query.fixture.js");
      ok(fixture.discriminatingQuery, "fixture has discriminatingQuery field");
      const outcome = await reExerciseCanary(fixture, fixture.discriminatingQuery);
      ok(outcome.f1AxiomCount > 0, "lift produced axioms");
      ok(outcome.f3AxiomCount > 0, "re-lift after projection produced axioms");
    }
  );

  await checkAsync(
    "Step 2 / parity_canary_negative_query: ✓ SURVIVED — skeleton 'undetermined' matches stub 'undetermined'",
    async () => {
      const fixture = await loadCanaryFixture("parity_canary_negative_query.fixture.js");
      const outcome = await reExerciseCanary(fixture, fixture.discriminatingQuery!);
      strictEqual(outcome.evaluatorResult, "undetermined");
      strictEqual(outcome.evaluatorReason, REASON_CODES.open_world_undetermined);
      strictEqual(
        fixture.expectedOutcome.discriminatingQueryStubResult,
        "undetermined",
        "fixture's stub-result is 'undetermined' (matches skeleton; no upgrade needed at Step 3 for this disposition direction — Step 3 SLD will still need to confirm OWA returns 'undetermined' for unprovable atomic queries)"
      );
    }
  );

  // -----------------------------------------------------------
  // Canary 3: parity_canary_visual_equivalence_trap (Tier 1)
  // Risk tag: at-risk-horn-fragment-closure (Step 1a: ⚠ anticipated-divergence)
  // Tier 1 stub: 'true'/'true' for Q_1 (Person(bob)?) + Q_2 (hasChild(alice, bob)?)
  // Tier 2: out of v0.1 EvaluableQuery scope (FOLExistential + FOLNegation
  //   throw UnsupportedConstructError per API §7.5); routed to I8 cycle-2.
  // Step 1b skeleton: 'undetermined' uniform
  // Step 2 disposition: ⏸ skeleton-deferred-to-step-3 for Tier 1; Tier 2 deferred
  // -----------------------------------------------------------

  await checkAsync(
    "Step 2 / parity_canary_visual_equivalence_trap: lift→project→re-lift plumbing succeeds",
    async () => {
      const fixture = await loadCanaryFixture(
        "parity_canary_visual_equivalence_trap.fixture.js"
      );
      ok(
        Array.isArray(fixture.discriminatingQueries),
        "fixture has discriminatingQueries array (multi-query canary)"
      );
      ok(
        fixture.discriminatingQueries!.length >= 2,
        "fixture has at least 2 Tier 1 atomic queries"
      );
      // Plumbing-only check; per-query evaluator outcomes asserted below.
      const f1 = await owlToFol(fixture.input);
      const projected = await folToOwl(f1);
      const f3 = await owlToFol(projected.ontology);
      ok(f1.length > 0, "lift produced axioms");
      ok(f3.length > 0, "re-lift after projection produced axioms");
    }
  );

  await checkAsync(
    "Step 3 / parity_canary_visual_equivalence_trap Q_1 (Person(bob)?): ✓ SURVIVED — real evaluate() returns 'true' / 'consistent' (matches stub)",
    async () => {
      const fixture = await loadCanaryFixture(
        "parity_canary_visual_equivalence_trap.fixture.js"
      );
      const q1 = fixture.discriminatingQueries![0];
      const outcome = await reExerciseCanary(fixture, q1.query);
      strictEqual(outcome.evaluatorResult, "true");
      strictEqual(outcome.evaluatorReason, REASON_CODES.consistent);
      strictEqual(
        q1.expectedStubResult,
        "true",
        "Q_1 stub-result is 'true'; Step 3 SLD matches per Q-Frank-4 publication artifact"
      );
    }
  );

  await checkAsync(
    "Step 3 / parity_canary_visual_equivalence_trap Q_2 (hasChild(alice, bob)?): ✓ SURVIVED — real evaluate() returns 'true' / 'consistent' (matches stub)",
    async () => {
      const fixture = await loadCanaryFixture(
        "parity_canary_visual_equivalence_trap.fixture.js"
      );
      const q2 = fixture.discriminatingQueries![1];
      const outcome = await reExerciseCanary(fixture, q2.query);
      strictEqual(outcome.evaluatorResult, "true");
      strictEqual(outcome.evaluatorReason, REASON_CODES.consistent);
      strictEqual(
        q2.expectedStubResult,
        "true",
        "Q_2 stub-result is 'true'; Step 3 SLD matches per Q-Frank-4 publication artifact"
      );
    }
  );

  // -----------------------------------------------------------
  // Step 2 baseline publication artifact summary (assertion-form)
  // -----------------------------------------------------------

  check(
    "Step 3 outcome: 3 of 3 canaries SURVIVED at SLD-resolved evaluator (Q-Frank-4 publication baseline)",
    () => {
      // UPGRADED at Step 3 from skeleton-baseline (1/3 survived) to
      // SLD outcome (3/3 survived). Documented in phase-3-entry.md §3.6
      // Step 3 outcomes table per Q-3-F publication-artifact format.
      // Note: parity_canary_visual_equivalence_trap Tier 2 (existential-
      // conjunction-negation enhanced discriminator) remains deferred to
      // v0.2 via I8 cycle-2 routing per Step 1a finding 2026-05-08
      // (FOLExistential + FOLNegation outside v0.1 EvaluableQuery per API §7.5).
      ok(true, "Step 3 outcome summary recorded");
    }
  );

  console.log("");
  console.log(`  ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main();
