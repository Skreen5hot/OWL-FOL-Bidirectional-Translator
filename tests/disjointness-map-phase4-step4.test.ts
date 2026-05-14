/**
 * Phase 4 Step 4 — BFO Disjointness Map activation tests.
 *
 * Per Q-4-Step4-A architect ratification 2026-05-11 + Pass 2b brief
 * confirmation 2026-05-14 + phase-4-entry.md §7 step ledger Step 4
 * deliverable: "BFO Disjointness Map firings per spec §3.4.1 —
 * Continuant ⊓ Occurrent → ⊥ + activation of nc_bfo_continuant_occurrent
 * fixture (corpus-before-code activation per §3.2)."
 *
 * Activates two corpus fixtures end-to-end:
 *
 *   1. bfo_disjointness_map_axiom_emission (step-N-bind, unit-level):
 *      verifies the lifter emits the pairwise binary disjointness axioms
 *      from the loaded BFO ARC's disjointnessAxioms field per Q-4-Step4-A.1
 *      pairwise expansion. Pattern-matches against the fixture's
 *      requiredPatterns (Continuant ⊓ Occurrent binary; IC/SDC/GDC
 *      ternary; Process/PB 4-ary samples).
 *
 *   2. nc_bfo_continuant_occurrent (corpus-before-code, end-to-end):
 *      load BFO ARC + ABox with alice asserted to both Continuant and
 *      Occurrent; checkConsistency returns 'false' / 'inconsistent' via
 *      Step 7 FOLFalse-in-head proof firing on the lifted disjointness
 *      axiom.
 *
 * Developer-side tests; corpus fixtures themselves are SME-authored.
 * No new architectural changes — pure activation against the
 * infrastructure landed at Pass 2b (8901ce6).
 */

import { strictEqual, ok } from "node:assert";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { owlToFol } from "../src/kernel/lifter.js";
import {
  registerARCModule,
  __resetARCModuleRegistryForTesting,
} from "../src/kernel/arc-module-registry.js";
import {
  createSession,
  __resetSessionCounterForTesting,
} from "../src/composition/session.js";
import {
  loadOntology,
  registerTauPrologFactory,
  __resetLoadOntologyCacheForTesting,
} from "../src/composition/load-ontology.js";
import { checkConsistency } from "../src/composition/check-consistency.js";
import { registerTauPrologProbe } from "../src/kernel/tau-prolog-probe.js";
import type {
  FOLAtom,
  FOLAxiom,
  FOLConjunction,
  FOLImplication,
  FOLUniversal,
} from "../src/kernel/fol-types.js";
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

interface CorpusFixture {
  input: {
    ontologyIRI: string;
    prefixes: Record<string, string>;
    tbox: unknown[];
    abox: unknown[];
    rbox: unknown[];
  };
  loadOntologyConfig?: { arcModules?: string[] };
  requiredPatterns?: Array<{
    description: string;
    pattern: unknown;
  }>;
  "expected_v0.1_verdict"?: {
    expectedConsistencyResult?: "true" | "false" | "undetermined";
    expectedReason?: string;
  };
}

async function loadCorpus<T>(filename: string): Promise<T> {
  const path = resolve(projectRoot, "tests", "corpus", filename);
  await readFile(path, "utf-8");
  const url = "file:///" + path.replace(/\\/g, "/");
  const mod = (await import(url)) as { fixture: T };
  return mod.fixture;
}

async function loadBFOArcModule(): Promise<void> {
  const path = resolve(projectRoot, "arc", "core", "bfo-2020.json");
  registerARCModule(JSON.parse(await readFile(path, "utf-8")));
}

function primeTestEnv(): void {
  registerTauPrologProbe(() => "0.3.4");
  registerTauPrologFactory(() => pl.create(2000));
}

/**
 * Pattern-match a single emitted axiom against a required pairwise-
 * disjointness pattern. Returns true on match. The pattern's
 * antecedent.conjuncts list order tolerates either argument order
 * (the fixture asserts a canonical pair shape but the emitter's
 * lex-ordered canonicalization may produce either order depending on
 * IRI comparison).
 */
function matchesDisjointnessPattern(
  ax: FOLAxiom,
  patternConjuncts: ReadonlyArray<{ predicate: string }>
): boolean {
  // Walk one Universal layer.
  if ((ax as { "@type"?: unknown })["@type"] !== "fol:Universal") return false;
  const inner = (ax as FOLUniversal).body;
  if ((inner as { "@type"?: unknown })["@type"] !== "fol:Implication") return false;
  const impl = inner as FOLImplication;
  if ((impl.consequent as { "@type"?: unknown })["@type"] !== "fol:False") return false;
  if ((impl.antecedent as { "@type"?: unknown })["@type"] !== "fol:Conjunction") return false;
  const conj = impl.antecedent as FOLConjunction;
  if (conj.conjuncts.length !== patternConjuncts.length) return false;
  // Each conjunct must be a fol:Atom; collect predicate IRIs (multiset
  // comparison since the lex-ordered canonicalization may have reordered
  // the input pair).
  const actualPreds: string[] = [];
  for (const c of conj.conjuncts) {
    if ((c as { "@type"?: unknown })["@type"] !== "fol:Atom") return false;
    actualPreds.push((c as FOLAtom).predicate);
  }
  const expectedPreds = patternConjuncts.map((p) => p.predicate);
  return (
    [...actualPreds].sort().join("|") === [...expectedPreds].sort().join("|")
  );
}

async function main(): Promise<void> {
  __resetSessionCounterForTesting();
  __resetLoadOntologyCacheForTesting();
  __resetARCModuleRegistryForTesting();
  primeTestEnv();
  await loadBFOArcModule();

  // -----------------------------------------------------------
  // bfo_disjointness_map_axiom_emission (step-N-bind, unit-level)
  // -----------------------------------------------------------

  await checkAsync(
    "Step 4 / bfo_disjointness_map_axiom_emission: lifter emits each required pairwise-disjointness axiom",
    async () => {
      const fixture = await loadCorpus<CorpusFixture>(
        "bfo_disjointness_map_axiom_emission.fixture.js"
      );
      const axioms = await owlToFol(fixture.input as unknown as OWLOntology, fixture.loadOntologyConfig);
      ok(fixture.requiredPatterns !== undefined, "fixture declares requiredPatterns");
      for (const required of fixture.requiredPatterns!) {
        const pattern = required.pattern as {
          body: { antecedent: { conjuncts: Array<{ predicate: string }> } };
        };
        const expectedConjuncts = pattern.body.antecedent.conjuncts;
        const found = axioms.some((ax) =>
          matchesDisjointnessPattern(ax, expectedConjuncts)
        );
        ok(
          found,
          `requiredPattern not emitted: ${required.description}`
        );
      }
    }
  );

  await checkAsync(
    "Step 4 / bfo_disjointness_map_axiom_emission: 29 pairwise binary axioms emitted from 11 N-ary disjointnessAxioms (BFO Disjointness Map)",
    async () => {
      const fixture = await loadCorpus<CorpusFixture>(
        "bfo_disjointness_map_axiom_emission.fixture.js"
      );
      const axioms = await owlToFol(fixture.input as unknown as OWLOntology, fixture.loadOntologyConfig);
      // Count pairwise-disjointness-shape axioms (Universal → Implication
      // with FOLFalse consequent + Conjunction antecedent of 2 atoms).
      let disjointnessCount = 0;
      for (const ax of axioms) {
        if ((ax as { "@type"?: unknown })["@type"] !== "fol:Universal") continue;
        const inner = (ax as FOLUniversal).body;
        if ((inner as { "@type"?: unknown })["@type"] !== "fol:Implication") continue;
        const impl = inner as FOLImplication;
        if ((impl.consequent as { "@type"?: unknown })["@type"] !== "fol:False") continue;
        if ((impl.antecedent as { "@type"?: unknown })["@type"] !== "fol:Conjunction") continue;
        if ((impl.antecedent as FOLConjunction).conjuncts.length === 2) {
          disjointnessCount++;
        }
      }
      // 11 commitments: 1 + 3 + 1 + 3 + 3 + 3 + 6 + 1 + 1 + 6 + 1 = 29
      strictEqual(
        disjointnessCount,
        29,
        "BFO 2020 Disjointness Map: 11 N-ary commitments expand to 29 pairwise binary axioms (N(N-1)/2 per commitment)"
      );
    }
  );

  // -----------------------------------------------------------
  // nc_bfo_continuant_occurrent (corpus-before-code, end-to-end)
  // -----------------------------------------------------------

  await checkAsync(
    "Step 4 / nc_bfo_continuant_occurrent: end-to-end checkConsistency returns 'false' / 'inconsistent' via BFO Disjointness Map firing",
    async () => {
      __resetSessionCounterForTesting();
      __resetLoadOntologyCacheForTesting();
      __resetARCModuleRegistryForTesting();
      primeTestEnv();
      await loadBFOArcModule();

      const fixture = await loadCorpus<CorpusFixture>(
        "nc_bfo_continuant_occurrent.fixture.js"
      );
      const session = createSession(fixture.loadOntologyConfig);
      await loadOntology(session, fixture.input as never);
      const result = await checkConsistency(session);
      strictEqual(
        result.consistent,
        "false",
        `expected 'false' (Continuant ⊓ Occurrent triggered on alice via loaded BFO Disjointness Map); got '${result.consistent}'`
      );
      strictEqual(result.reason, "inconsistent");
      ok(
        result.witnesses !== undefined && result.witnesses.length > 0,
        "witnesses populated (the disjointness axiom + body atoms)"
      );
    }
  );

  await checkAsync(
    "Step 4 / nc_bfo_continuant_occurrent: regression guard — without BFO ARC loaded, alice-both ontology is 'undetermined' (no disjointness axiom in FOL state)",
    async () => {
      __resetSessionCounterForTesting();
      __resetLoadOntologyCacheForTesting();
      __resetARCModuleRegistryForTesting();
      primeTestEnv();
      // Do NOT load BFO ARC module.
      const fixture = await loadCorpus<CorpusFixture>(
        "nc_bfo_continuant_occurrent.fixture.js"
      );
      // Create a session WITHOUT arcModules — the disjointness axiom
      // should NOT be emitted, so consistency is undetermined (no
      // contradiction provable from just the two ClassAssertion facts).
      const session = createSession();
      await loadOntology(session, fixture.input as never);
      const result = await checkConsistency(session);
      ok(
        result.consistent !== "false",
        `without BFO ARC, no Disjointness Map axiom is loaded; consistency should NOT be 'false' (got '${result.consistent}')`
      );
    }
  );

  console.log("");
  console.log(`  ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
