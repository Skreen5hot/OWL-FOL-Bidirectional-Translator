/**
 * Phase 3 Step 5 — Cycle detection via visited-ancestor pattern tests.
 *
 * Per architect Q-3-A step-granularity ratification 2026-05-08 +
 * Q-3-Step5-A + Q-3-Step5-B + Q-3-Step5-C rulings 2026-05-09 +
 * ADR-013 visited-ancestor cycle-guard pattern + ADR-007 §11. Step 5
 * minimum scope ships:
 *
 *   - FOL→Prolog translator detects transitive-pattern rules (ADR-013
 *     Class 1 cycle-prone predicate) and rewrites with visited-ancestor
 *     encoding (entry wrapper + p_orig direct-fact path + recursive
 *     guarded path + cycle-detection clause that asserts marker)
 *   - All facts on detected transitive predicates are translated to the
 *     p_orig functor instead of the public predicate name
 *   - evaluate() retracts the cycle marker before each SLD invocation,
 *     queries it after SLD, and surfaces 'undetermined' / 'cycle_detected'
 *     when the marker fires (precedence over closedPredicates / OWA paths)
 *
 * Tests cover:
 *   - Kernel translator: transitive-pattern detection + visited-ancestor
 *     emission shape per ADR-013 §pattern
 *   - Kernel translator: non-transitive predicates emit unchanged
 *     (no false-positive wrapping)
 *   - cycle_recursive_predicate fixture end-to-end: TransitiveObjectProperty
 *     + cyclic ABox + ancestor(a, c) query → 'undetermined' / 'cycle_detected'
 *   - SLD-success path: ancestor(a, b) directly asserted query → 'true' /
 *     'consistent' (cycle marker MAY fire on alternative SLD paths but
 *     success-with-cycle stays 'true' per ADR-013 §detection-emission-contract)
 *   - cycle_equivalent_classes fixture: Class 3 forward-track sanity check
 *     (loadOntology succeeds; query terminates without throwing; behavior
 *     is documented partial-cover until Class 3 implementation lands)
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
import {
  translateFOLToPrologClauses,
  CYCLE_DETECTED_MARKER_PREDICATE,
} from "../src/kernel/fol-to-prolog.js";
import { REASON_CODES } from "../src/kernel/reason-codes.js";
import { registerTauPrologProbe } from "../src/kernel/tau-prolog-probe.js";
import type { OWLOntology } from "../src/kernel/owl-types.js";
import type { FOLAxiom } from "../src/kernel/fol-types.js";
import type { EvaluableQuery } from "../src/kernel/evaluate-types.js";
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

interface CycleFixture {
  input: OWLOntology;
  query?: EvaluableQuery;
  "expected_v0.1_verdict": {
    expectedResult?: "true" | "false" | "undetermined";
    expectedReason: string;
  };
}

async function loadFixture(filename: string): Promise<CycleFixture> {
  const path = resolve(corpusDir, filename);
  await readFile(path, "utf-8");
  const url = "file:///" + path.replace(/\\/g, "/");
  const mod = (await import(url)) as { fixture: CycleFixture };
  return mod.fixture;
}

const PREFIX = "http://example.org/test/step5/";

async function main(): Promise<void> {
  __resetSessionCounterForTesting();
  __resetLoadOntologyCacheForTesting();
  registerTauPrologProbe(() => "0.3.4");
  registerTauPrologFactory(() => pl.create(2000));

  // -----------------------------------------------------------
  // Kernel translator: transitive-pattern detection
  // -----------------------------------------------------------

  check(
    "Step 5 / fol-to-prolog: transitive-pattern rule emits visited-ancestor wrapping per ADR-013",
    () => {
      // ∀x,y,z. ancestor(x,y) ∧ ancestor(y,z) → ancestor(x,z)
      const axioms: FOLAxiom[] = [
        {
          "@type": "fol:Universal",
          variable: "x",
          body: {
            "@type": "fol:Universal",
            variable: "y",
            body: {
              "@type": "fol:Universal",
              variable: "z",
              body: {
                "@type": "fol:Implication",
                antecedent: {
                  "@type": "fol:Conjunction",
                  conjuncts: [
                    {
                      "@type": "fol:Atom",
                      predicate: PREFIX + "ancestor",
                      arguments: [
                        { "@type": "fol:Variable", name: "x" },
                        { "@type": "fol:Variable", name: "y" },
                      ],
                    },
                    {
                      "@type": "fol:Atom",
                      predicate: PREFIX + "ancestor",
                      arguments: [
                        { "@type": "fol:Variable", name: "y" },
                        { "@type": "fol:Variable", name: "z" },
                      ],
                    },
                  ],
                },
                consequent: {
                  "@type": "fol:Atom",
                  predicate: PREFIX + "ancestor",
                  arguments: [
                    { "@type": "fol:Variable", name: "x" },
                    { "@type": "fol:Variable", name: "z" },
                  ],
                },
              },
            },
          },
        },
      ];
      const out = translateFOLToPrologClauses(axioms);
      // Should emit 4 visited-ancestor clauses + skip the original transitive
      // rule. NO standard Step 3 translation of the transitive rule.
      const ancestorAtom = "'" + PREFIX + "ancestor'";
      const guardAtom = "'" + PREFIX + "ancestor/guard'";
      const origAtom = "'" + PREFIX + "ancestor/orig'";
      const matchEntry = out.clauses.find(
        (c) => c.startsWith(ancestorAtom + "(X, Y) :- " + guardAtom)
      );
      ok(matchEntry, "entry wrapper clause emitted: " + (matchEntry ?? "<not found>"));
      const matchDirectFact = out.clauses.find((c) =>
        c.includes(guardAtom + "(X, Y, _V) :- " + origAtom + "(X, Y).")
      );
      ok(matchDirectFact, "p_guard direct-fact clause emitted");
      const matchRecursive = out.clauses.find((c) =>
        c.includes("\\+ member(Z, V)")
      );
      ok(matchRecursive, "p_guard recursive clause with member-check emitted");
      const matchCycleClause = out.clauses.find((c) =>
        c.includes("member(Z, V), assertz(" + CYCLE_DETECTED_MARKER_PREDICATE + ")")
      );
      ok(matchCycleClause, "cycle-detection clause with assertz marker emitted");
      // No skipped axioms
      strictEqual(out.skipped.length, 0, "transitive rule consumed by visited-ancestor wrap, not skipped");
    }
  );

  check(
    "Step 5 / fol-to-prolog: facts on transitive predicate translate to p_orig form",
    () => {
      const axioms: FOLAxiom[] = [
        // Transitive rule
        {
          "@type": "fol:Universal",
          variable: "x",
          body: {
            "@type": "fol:Universal",
            variable: "y",
            body: {
              "@type": "fol:Universal",
              variable: "z",
              body: {
                "@type": "fol:Implication",
                antecedent: {
                  "@type": "fol:Conjunction",
                  conjuncts: [
                    {
                      "@type": "fol:Atom",
                      predicate: PREFIX + "ancestor",
                      arguments: [
                        { "@type": "fol:Variable", name: "x" },
                        { "@type": "fol:Variable", name: "y" },
                      ],
                    },
                    {
                      "@type": "fol:Atom",
                      predicate: PREFIX + "ancestor",
                      arguments: [
                        { "@type": "fol:Variable", name: "y" },
                        { "@type": "fol:Variable", name: "z" },
                      ],
                    },
                  ],
                },
                consequent: {
                  "@type": "fol:Atom",
                  predicate: PREFIX + "ancestor",
                  arguments: [
                    { "@type": "fol:Variable", name: "x" },
                    { "@type": "fol:Variable", name: "z" },
                  ],
                },
              },
            },
          },
        },
        // Fact on the transitive predicate — should translate to p_orig
        {
          "@type": "fol:Atom",
          predicate: PREFIX + "ancestor",
          arguments: [
            { "@type": "fol:Constant", iri: PREFIX + "a" },
            { "@type": "fol:Constant", iri: PREFIX + "b" },
          ],
        },
      ];
      const out = translateFOLToPrologClauses(axioms);
      const origAtom = "'" + PREFIX + "ancestor/orig'";
      const factTranslated = out.clauses.find((c) =>
        c.startsWith(origAtom + "('" + PREFIX + "a', '" + PREFIX + "b').")
      );
      ok(factTranslated, "fact rewritten to p_orig form");
      // No untranslated fact on the public predicate name
      const publicAtom = "'" + PREFIX + "ancestor'";
      const publicFactTranslated = out.clauses.find(
        (c) =>
          c.startsWith(publicAtom + "('" + PREFIX + "a'") &&
          !c.includes("/orig") &&
          !c.includes("/guard")
      );
      ok(
        !publicFactTranslated,
        "no fact emitted on public predicate name (must use p_orig)"
      );
    }
  );

  check(
    "Step 5 / fol-to-prolog: non-transitive predicate is NOT wrapped (no false-positive)",
    () => {
      // Plain unary atom, no transitive shape
      const axioms: FOLAxiom[] = [
        {
          "@type": "fol:Atom",
          predicate: PREFIX + "Person",
          arguments: [{ "@type": "fol:Constant", iri: PREFIX + "alice" }],
        },
      ];
      const out = translateFOLToPrologClauses(axioms);
      // No visited-ancestor clauses for Person (not transitive)
      const guardClause = out.clauses.find((c) => c.includes("/guard"));
      ok(!guardClause, "no visited-ancestor wrapping for non-transitive predicate");
      // Standard fact translation
      strictEqual(out.clauses.length, 1);
    }
  );

  // -----------------------------------------------------------
  // cycle_recursive_predicate fixture end-to-end
  // -----------------------------------------------------------

  await checkAsync(
    "Step 5 / cycle_recursive_predicate fixture: ancestor(a, c)? on cyclic ABox → 'undetermined' / 'cycle_detected'",
    async () => {
      const fixture = await loadFixture("cycle_recursive_predicate.fixture.js");
      const session = createSession();
      await loadOntology(session, fixture.input);
      const result = await evaluate(session, fixture.query!);
      strictEqual(result.result, "undetermined");
      strictEqual(result.reason, REASON_CODES.cycle_detected);
      strictEqual(
        fixture["expected_v0.1_verdict"].expectedResult,
        "undetermined"
      );
      strictEqual(
        fixture["expected_v0.1_verdict"].expectedReason,
        "cycle_detected"
      );
    }
  );

  // -----------------------------------------------------------
  // SLD-success-with-cycle: success path takes precedence per ADR-013
  // -----------------------------------------------------------

  await checkAsync(
    "Step 5 / SLD success on transitive predicate stays 'true' / 'consistent' even if marker fires on alternative path",
    async () => {
      // Same ontology as cycle_recursive_predicate but query a directly-
      // asserted edge: ancestor(a, b) — provable via p_orig directly without
      // recursion. Even if alternative SLD paths attempt cycle, the success
      // path takes precedence per ADR-013 §detection-emission-contract.
      const fixture = await loadFixture("cycle_recursive_predicate.fixture.js");
      const session = createSession();
      await loadOntology(session, fixture.input);
      const result = await evaluate(session, {
        "@type": "fol:Atom",
        predicate: "http://example.org/test/cycle_recursive_predicate/ancestor",
        arguments: [
          {
            "@type": "fol:Constant",
            iri: "http://example.org/test/cycle_recursive_predicate/a",
          },
          {
            "@type": "fol:Constant",
            iri: "http://example.org/test/cycle_recursive_predicate/b",
          },
        ],
      } as EvaluableQuery);
      strictEqual(result.result, "true");
      strictEqual(result.reason, REASON_CODES.consistent);
    }
  );

  // -----------------------------------------------------------
  // cycle_equivalent_classes fixture: Class 3 forward-track sanity check
  // -----------------------------------------------------------

  await checkAsync(
    "Step 5 / cycle_equivalent_classes fixture (Class 3 forward-tracked): loadOntology + query terminates without throwing",
    async () => {
      // Class 3 cycle (mutual EquivalentClasses) is NOT covered by Step 5
      // minimum (Class 1 only). This test verifies the implementation does
      // not crash / hang / throw on the Class 3 fixture; full
      // 'cycle_detected' coverage is forward-tracked beyond Step 5 minimum.
      const fixture = await loadFixture("cycle_equivalent_classes.fixture.js");
      const session = createSession();
      await loadOntology(session, fixture.input);
      // No discriminating query in the stub; just verify loadOntology
      // succeeded and a simple query terminates.
      const result = await evaluate(session, {
        "@type": "fol:Atom",
        predicate: "http://example.org/test/cycle_equivalent_classes/A",
        arguments: [
          {
            "@type": "fol:Constant",
            iri: "http://example.org/test/cycle_equivalent_classes/x",
          },
        ],
      } as EvaluableQuery);
      // Step 5 minimum behavior: 'undetermined' (with reason
      // open_world_undetermined since Class 3 cycle isn't detected; the
      // mutual implication chain has no facts so SLD just fails through).
      strictEqual(result.result, "undetermined");
      // Reason is open_world_undetermined (NOT cycle_detected — that's the
      // forward-tracked Class 3 behavior). Honest about partial coverage.
      ok(
        result.reason === REASON_CODES.open_world_undetermined ||
          result.reason === REASON_CODES.cycle_detected,
        "reason is OWA (Step 5 minimum) or cycle_detected (if Class 3 lands later); both are acceptable Step 5-onward"
      );
    }
  );

  console.log("");
  console.log(`  ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main();
