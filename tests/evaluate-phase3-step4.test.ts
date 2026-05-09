/**
 * Phase 3 Step 4 — closedPredicates + per-predicate CWA + body NAF translation tests.
 *
 * Per architect Q-3-A step-granularity ratification 2026-05-08 +
 * Q-3-Step3-B refinement 1 + Q-3-Step4-A ratification 2026-05-09 +
 * ADR-007 §11. Step 4 ships:
 *
 *   - closedPredicates parameter handling in evaluate() per spec §6.3.2 +
 *     API §2 (QueryParameters.closedPredicates) + API §7.1
 *   - FOLNegation-in-implication-body translation activation per ADR-007
 *     §11 (\+ p(X) negation-as-failure)
 *   - Three-state mapping refinement:
 *       * SLD success → 'true' / 'consistent' (regardless of closure)
 *       * SLD failure + predicate IN closedPredicates → 'false' /
 *         'inconsistent' (CWA refutation per ADR-007 §11
 *         reuse-existing-reason-code discipline)
 *       * SLD failure + predicate NOT in closedPredicates → 'undetermined'
 *         / 'open_world_undetermined' (default OWA per spec §6.3 +
 *         Q-3-Step4-A option β ratification)
 *
 * Tests cover:
 *   - cwa_closed_predicate fixture: 'false' / 'inconsistent' end-to-end
 *   - cwa_open_predicate fixture: 'undetermined' / 'open_world_undetermined' end-to-end
 *   - closedPredicates parameter forwarding through evaluate()
 *   - FOLConjunction query with first-conjunct closure semantic per Step 4 minimum
 *   - SLD-success path unaffected by closedPredicates (positive proof always 'true')
 *   - kernel translator: FOLNegation in implication body → '\+ p(...)' Prolog
 *   - kernel translator: top-level FOLNegation still skipped (Step 6 forward-track)
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
import { translateFOLToPrologClauses } from "../src/kernel/fol-to-prolog.js";
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

interface CwaFixture {
  input: OWLOntology;
  query: EvaluableQuery;
  closedPredicates?: ReadonlyArray<string>;
  "expected_v0.1_verdict": {
    expectedResult: "true" | "false" | "undetermined";
    expectedReason: string;
  };
}

async function loadCwaFixture(filename: string): Promise<CwaFixture> {
  const path = resolve(corpusDir, filename);
  await readFile(path, "utf-8");
  const url = "file:///" + path.replace(/\\/g, "/");
  const mod = (await import(url)) as { fixture: CwaFixture };
  return mod.fixture;
}

const PREFIX = "http://example.org/test/step4/";

async function main(): Promise<void> {
  __resetSessionCounterForTesting();
  __resetLoadOntologyCacheForTesting();
  registerTauPrologProbe(() => "0.3.4");
  registerTauPrologFactory(() => pl.create(1000));

  // -----------------------------------------------------------
  // Kernel translator: FOLNegation-in-body activation per Step 4
  // -----------------------------------------------------------

  check(
    "Step 4 / fol-to-prolog: FOLNegation around FOLAtom in implication body translates to \\+ p(X)",
    () => {
      // ∀x. (P(x) ∧ ¬Q(x)) → R(x)
      // Expected Prolog: r(X) :- p(X), \+ q(X).
      const axioms: FOLAxiom[] = [
        {
          "@type": "fol:Universal",
          variable: "x",
          body: {
            "@type": "fol:Implication",
            antecedent: {
              "@type": "fol:Conjunction",
              conjuncts: [
                {
                  "@type": "fol:Atom",
                  predicate: PREFIX + "P",
                  arguments: [{ "@type": "fol:Variable", name: "x" }],
                },
                {
                  "@type": "fol:Negation",
                  inner: {
                    "@type": "fol:Atom",
                    predicate: PREFIX + "Q",
                    arguments: [{ "@type": "fol:Variable", name: "x" }],
                  },
                },
              ],
            },
            consequent: {
              "@type": "fol:Atom",
              predicate: PREFIX + "R",
              arguments: [{ "@type": "fol:Variable", name: "x" }],
            },
          },
        },
      ];
      const out = translateFOLToPrologClauses(axioms);
      strictEqual(out.skipped.length, 0, "FOLNegation-in-body is now translated, not skipped");
      strictEqual(out.clauses.length, 1);
      ok(
        out.clauses[0].includes("\\+ '" + PREFIX + "Q'(V_x)"),
        "body contains \\+ q(X) Prolog NAF: " + out.clauses[0]
      );
    }
  );

  check(
    "Step 4 / fol-to-prolog: top-level FOLNegation still skipped (Step 6 forward-track unchanged)",
    () => {
      // Top-level ¬P(a) — not in implication body; remains skipped per
      // ADR-007 §11 step-4-fol-negation-naf forwardTrack scope (only
      // body NAF activates at Step 4).
      const axioms: FOLAxiom[] = [
        {
          "@type": "fol:Negation",
          inner: {
            "@type": "fol:Atom",
            predicate: PREFIX + "P",
            arguments: [{ "@type": "fol:Constant", iri: PREFIX + "a" }],
          },
        } as FOLAxiom,
      ];
      const out = translateFOLToPrologClauses(axioms);
      strictEqual(out.clauses.length, 0);
      strictEqual(out.skipped.length, 1);
      strictEqual(out.skipped[0].forwardTrack, "step-4-fol-negation-naf");
    }
  );

  // -----------------------------------------------------------
  // closedPredicates parameter handling in evaluate()
  // -----------------------------------------------------------

  await checkAsync(
    "Step 4 / cwa_closed_predicate fixture: query Knows(alice, bob)? + closedPredicates: {Knows} → 'false' / 'inconsistent'",
    async () => {
      const fixture = await loadCwaFixture("cwa_closed_predicate.fixture.js");
      const session = createSession();
      await loadOntology(session, fixture.input);
      const result = await evaluate(session, fixture.query, {
        closedPredicates: new Set(fixture.closedPredicates),
      });
      strictEqual(result.result, "false");
      strictEqual(result.reason, REASON_CODES.inconsistent);
      strictEqual(
        fixture["expected_v0.1_verdict"].expectedResult,
        "false",
        "fixture's expected_v0.1_verdict.expectedResult matches"
      );
      strictEqual(
        fixture["expected_v0.1_verdict"].expectedReason,
        "inconsistent",
        "fixture's expectedReason is 'inconsistent' per ADR-007 §11 reuse-existing-reason-code discipline"
      );
    }
  );

  await checkAsync(
    "Step 4 / cwa_open_predicate fixture: query Knows(alice, bob)? without closedPredicates → 'undetermined' / 'open_world_undetermined'",
    async () => {
      const fixture = await loadCwaFixture("cwa_open_predicate.fixture.js");
      const session = createSession();
      await loadOntology(session, fixture.input);
      const result = await evaluate(session, fixture.query);
      strictEqual(result.result, "undetermined");
      strictEqual(result.reason, REASON_CODES.open_world_undetermined);
      strictEqual(
        fixture["expected_v0.1_verdict"].expectedResult,
        "undetermined",
        "fixture's expected_v0.1_verdict.expectedResult matches"
      );
      strictEqual(
        fixture["expected_v0.1_verdict"].expectedReason,
        "open_world_undetermined",
        "fixture's expectedReason is 'open_world_undetermined' per Q-3-Step4-A option β ratification"
      );
    }
  );

  // -----------------------------------------------------------
  // closedPredicates: SLD-success path unaffected by closure
  // -----------------------------------------------------------

  await checkAsync(
    "Step 4 / SLD success on positive query is 'true' / 'consistent' regardless of closedPredicates",
    async () => {
      const ontology: OWLOntology = {
        ontologyIRI: PREFIX + "sld-success",
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
      const session = createSession();
      await loadOntology(session, ontology);
      // Person(alice) is asserted; closedPredicates includes Person.
      // SLD success is 'true' regardless of closure (closure only refines
      // failure semantics).
      const result = await evaluate(
        session,
        {
          "@type": "fol:Atom",
          predicate: PREFIX + "Person",
          arguments: [{ "@type": "fol:Constant", iri: PREFIX + "alice" }],
        } as EvaluableQuery,
        { closedPredicates: new Set([PREFIX + "Person"]) }
      );
      strictEqual(result.result, "true");
      strictEqual(result.reason, REASON_CODES.consistent);
    }
  );

  // -----------------------------------------------------------
  // closedPredicates: per-predicate scoping
  // -----------------------------------------------------------

  await checkAsync(
    "Step 4 / closedPredicates is per-predicate: closing Person doesn't close Knows",
    async () => {
      const ontology: OWLOntology = {
        ontologyIRI: PREFIX + "per-predicate",
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
      const session = createSession();
      await loadOntology(session, ontology);
      // Query Knows(alice, bob) with closedPredicates: [Person] (NOT Knows).
      // Person closure doesn't apply to Knows; Knows is open → undetermined.
      const result = await evaluate(
        session,
        {
          "@type": "fol:Atom",
          predicate: PREFIX + "Knows",
          arguments: [
            { "@type": "fol:Constant", iri: PREFIX + "alice" },
            { "@type": "fol:Constant", iri: PREFIX + "bob" },
          ],
        } as EvaluableQuery,
        { closedPredicates: new Set([PREFIX + "Person"]) }
      );
      strictEqual(result.result, "undetermined");
      strictEqual(result.reason, REASON_CODES.open_world_undetermined);
    }
  );

  // -----------------------------------------------------------
  // closedPredicates: empty set vs undefined
  // -----------------------------------------------------------

  await checkAsync(
    "Step 4 / empty closedPredicates Set behaves identically to undefined (default OWA)",
    async () => {
      const ontology: OWLOntology = {
        ontologyIRI: PREFIX + "empty-closed",
        prefixes: { ex: PREFIX },
        tbox: [],
        abox: [],
        rbox: [],
      };
      const session = createSession();
      await loadOntology(session, ontology);
      const query: EvaluableQuery = {
        "@type": "fol:Atom",
        predicate: PREFIX + "Person",
        arguments: [{ "@type": "fol:Constant", iri: PREFIX + "alice" }],
      };
      const r1 = await evaluate(session, query, { closedPredicates: new Set() });
      const r2 = await evaluate(session, query);
      strictEqual(r1.result, r2.result);
      strictEqual(r1.reason, r2.reason);
      strictEqual(r1.result, "undetermined");
    }
  );

  // -----------------------------------------------------------
  // FOLConjunction query: first-conjunct-predicate closure semantic
  // -----------------------------------------------------------

  await checkAsync(
    "Step 4 / FOLConjunction query: first-conjunct predicate determines closure decision per Step 4 minimum",
    async () => {
      const ontology: OWLOntology = {
        ontologyIRI: PREFIX + "conj-closure",
        prefixes: { ex: PREFIX },
        tbox: [],
        abox: [],
        rbox: [],
      };
      const session = createSession();
      await loadOntology(session, ontology);
      // ?- Knows(alice, bob), Person(alice) — first conjunct (Knows) is
      // closed; SLD fails → 'false' / 'inconsistent'.
      const result = await evaluate(
        session,
        {
          "@type": "fol:Conjunction",
          conjuncts: [
            {
              "@type": "fol:Atom",
              predicate: PREFIX + "Knows",
              arguments: [
                { "@type": "fol:Constant", iri: PREFIX + "alice" },
                { "@type": "fol:Constant", iri: PREFIX + "bob" },
              ],
            },
            {
              "@type": "fol:Atom",
              predicate: PREFIX + "Person",
              arguments: [{ "@type": "fol:Constant", iri: PREFIX + "alice" }],
            },
          ],
        } as EvaluableQuery,
        { closedPredicates: new Set([PREFIX + "Knows"]) }
      );
      strictEqual(result.result, "false");
      strictEqual(result.reason, REASON_CODES.inconsistent);
    }
  );

  console.log("");
  console.log(`  ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main();
