/**
 * Phase 3 Step 1b — evaluate() skeleton + validation tests.
 *
 * Verifies per API spec §7.1 + §7.4 + §7.5:
 *   - Boundary throws: SessionRequiredError on null/undefined session,
 *     SessionDisposedError on disposed session
 *   - Query validation: UnsupportedConstructError for every FOLAxiom
 *     variant outside EvaluableQuery (FOLAtom | FOLConjunction-over-atoms)
 *   - Skeleton return: { result: 'undetermined', reason:
 *     'open_world_undetermined', steps: 0 } for valid EvaluableQuery
 *     under default-OWA empty-state path
 *   - validateEvaluableQuery() pure helper: throws on every non-Evaluable
 *     variant; carries UnsupportedConstructError.suggestion field per
 *     API §7.5
 *
 * Step 1b ships skeleton only; Steps 3+ ship actual SLD-resolution
 * semantics that produce real three-state results. These tests pin
 * down the boundary contract before further evaluator work lands.
 */

import { strictEqual, ok, deepStrictEqual } from "node:assert";
import {
  createSession,
  disposeSession,
  __resetSessionCounterForTesting,
} from "../src/composition/session.js";
import { evaluate } from "../src/composition/evaluate.js";
import {
  SessionRequiredError,
  SessionDisposedError,
  UnsupportedConstructError,
  OFBTError,
} from "../src/kernel/errors.js";
import { REASON_CODES } from "../src/kernel/reason-codes.js";
import {
  validateEvaluableQuery,
  DEFAULT_PER_QUERY_STEP_CAP,
  type EvaluableQuery,
} from "../src/kernel/evaluate-types.js";
import { registerTauPrologProbe } from "../src/kernel/tau-prolog-probe.js";
import type { FOLAxiom } from "../src/kernel/fol-types.js";

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
  errorClass: new (...args: never[]) => E,
  matcher?: (e: E) => boolean
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
  if (matcher && !matcher(thrown as E)) {
    throw new Error(`${errorClass.name} did not match predicate`);
  }
  return thrown as E;
}

async function main(): Promise<void> {
  __resetSessionCounterForTesting();
  // Register a Tau Prolog 0.3.4 probe so createSession succeeds in test env.
  registerTauPrologProbe(() => "0.3.4");

  const validAtom: EvaluableQuery = {
    "@type": "fol:Atom",
    predicate: "http://example.org/Person",
    arguments: [{ "@type": "fol:Constant", iri: "http://example.org/alice" }],
  };

  // -----------------------------------------------------------
  // Boundary: Session lifecycle gates per API §7.4
  // -----------------------------------------------------------

  await checkAsync(
    "evaluate(null, query) throws SessionRequiredError",
    async () => {
      await expectThrows(
        () => evaluate(null, validAtom),
        SessionRequiredError,
        (e) => e.functionName === "evaluate"
      );
    }
  );

  await checkAsync(
    "evaluate(undefined, query) throws SessionRequiredError",
    async () => {
      await expectThrows(
        () => evaluate(undefined, validAtom),
        SessionRequiredError
      );
    }
  );

  await checkAsync(
    "evaluate against disposed session throws SessionDisposedError",
    async () => {
      const session = createSession();
      disposeSession(session);
      await expectThrows(() => evaluate(session, validAtom), SessionDisposedError);
    }
  );

  // -----------------------------------------------------------
  // Skeleton return path
  // -----------------------------------------------------------

  await checkAsync(
    "evaluate(session, FOLAtom) returns 'undetermined' / 'open_world_undetermined' / steps: 0 (Step 1 skeleton)",
    async () => {
      const session = createSession();
      const result = await evaluate(session, validAtom);
      deepStrictEqual(result, {
        result: "undetermined",
        reason: REASON_CODES.open_world_undetermined,
        steps: 0,
      });
    }
  );

  await checkAsync(
    "evaluate(session, FOLConjunction-over-atoms) returns Step 1 skeleton verdict",
    async () => {
      const session = createSession();
      const conj: EvaluableQuery = {
        "@type": "fol:Conjunction",
        conjuncts: [
          validAtom,
          {
            "@type": "fol:Atom",
            predicate: "http://example.org/age",
            arguments: [
              { "@type": "fol:Constant", iri: "http://example.org/alice" },
              { "@type": "fol:Variable", name: "x" },
            ],
          },
        ],
      };
      const result = await evaluate(session, conj);
      strictEqual(result.result, "undetermined");
      strictEqual(result.reason, REASON_CODES.open_world_undetermined);
      strictEqual(result.steps, 0);
    }
  );

  await checkAsync(
    "evaluate accepts QueryParameters argument shape (Step 1 skeleton; semantics land in Steps 3+/4/5)",
    async () => {
      const session = createSession();
      const result = await evaluate(session, validAtom, {
        stepCap: 5000,
        throwOnStepCap: false,
        closedPredicates: new Set(["http://example.org/Person"]),
        extractBindings: ["x"],
        throwOnCycle: false,
      });
      strictEqual(result.result, "undetermined");
      strictEqual(result.reason, REASON_CODES.open_world_undetermined);
    }
  );

  // -----------------------------------------------------------
  // UnsupportedConstructError for every non-Evaluable FOLAxiom variant
  // -----------------------------------------------------------

  const nonEvaluableCases: ReadonlyArray<{
    label: string;
    query: FOLAxiom;
    construct: string;
  }> = [
    {
      label: "FOLImplication",
      query: {
        "@type": "fol:Implication",
        antecedent: validAtom,
        consequent: validAtom,
      },
      construct: "fol-implication-as-query",
    },
    {
      label: "FOLDisjunction",
      query: { "@type": "fol:Disjunction", disjuncts: [validAtom, validAtom] },
      construct: "fol-disjunction-as-query",
    },
    {
      label: "FOLNegation",
      query: { "@type": "fol:Negation", inner: validAtom },
      construct: "fol-negation-as-query",
    },
    {
      label: "FOLUniversal",
      query: { "@type": "fol:Universal", variable: "x", body: validAtom },
      construct: "fol-universal-as-query",
    },
    {
      label: "FOLExistential",
      query: { "@type": "fol:Existential", variable: "x", body: validAtom },
      construct: "fol-existential-as-query",
    },
    {
      label: "FOLEquality",
      query: {
        "@type": "fol:Equality",
        left: { "@type": "fol:Constant", iri: "http://example.org/a" },
        right: { "@type": "fol:Constant", iri: "http://example.org/b" },
      },
      construct: "fol-equality-as-query",
    },
    {
      label: "FOLFalse",
      query: { "@type": "fol:False" },
      construct: "fol-false-as-query",
    },
  ];

  for (const c of nonEvaluableCases) {
    await checkAsync(
      `evaluate(session, ${c.label}) throws UnsupportedConstructError with construct '${c.construct}'`,
      async () => {
        const session = createSession();
        const e = await expectThrows(
          () => evaluate(session, c.query as EvaluableQuery),
          UnsupportedConstructError
        );
        strictEqual(e.construct, c.construct);
        ok(e.suggestion, `suggestion field populated for ${c.label} per API §7.5`);
        ok(e.suggestion!.length > 0, "suggestion is non-empty");
      }
    );
  }

  // Mixed conjunction (FOLConjunction containing an FOLImplication conjunct)
  await checkAsync(
    "evaluate(session, mixed-FOLConjunction) throws UnsupportedConstructError 'non-atom-conjunct' per API §7.1",
    async () => {
      const session = createSession();
      const mixed = {
        "@type": "fol:Conjunction" as const,
        conjuncts: [
          validAtom,
          {
            "@type": "fol:Implication" as const,
            antecedent: validAtom,
            consequent: validAtom,
          },
        ],
      };
      const e = await expectThrows(
        () => evaluate(session, mixed as EvaluableQuery),
        UnsupportedConstructError
      );
      strictEqual(e.construct, "non-atom-conjunct");
    }
  );

  // Malformed atoms
  await checkAsync(
    "evaluate(session, FOLAtom with empty predicate) throws UnsupportedConstructError 'malformed-fol-atom'",
    async () => {
      const session = createSession();
      const malformed = {
        "@type": "fol:Atom" as const,
        predicate: "",
        arguments: [],
      };
      const e = await expectThrows(
        () => evaluate(session, malformed as EvaluableQuery),
        UnsupportedConstructError
      );
      strictEqual(e.construct, "malformed-fol-atom");
    }
  );

  await checkAsync(
    "evaluate(session, FOLAtom with non-array arguments) throws UnsupportedConstructError 'malformed-fol-atom'",
    async () => {
      const session = createSession();
      const malformed = {
        "@type": "fol:Atom" as const,
        predicate: "http://example.org/p",
        arguments: "not-an-array" as unknown as never[],
      };
      const e = await expectThrows(
        () => evaluate(session, malformed as EvaluableQuery),
        UnsupportedConstructError
      );
      strictEqual(e.construct, "malformed-fol-atom");
    }
  );

  await checkAsync(
    "evaluate(session, null query) throws UnsupportedConstructError 'null-or-undefined-query'",
    async () => {
      const session = createSession();
      const e = await expectThrows(
        () => evaluate(session, null as unknown as EvaluableQuery),
        UnsupportedConstructError
      );
      strictEqual(e.construct, "null-or-undefined-query");
    }
  );

  await checkAsync(
    "evaluate(session, query with unknown @type) throws UnsupportedConstructError 'unknown-fol-axiom-type'",
    async () => {
      const session = createSession();
      const bogus = { "@type": "fol:Bogus", arbitraryField: 42 };
      const e = await expectThrows(
        () => evaluate(session, bogus as unknown as EvaluableQuery),
        UnsupportedConstructError
      );
      strictEqual(e.construct, "unknown-fol-axiom-type");
    }
  );

  // -----------------------------------------------------------
  // Pure validateEvaluableQuery() helper — kernel-level
  // -----------------------------------------------------------

  check("validateEvaluableQuery accepts FOLAtom (no throw)", () => {
    validateEvaluableQuery(validAtom);
  });

  check("validateEvaluableQuery accepts atom-only FOLConjunction (no throw)", () => {
    validateEvaluableQuery({
      "@type": "fol:Conjunction",
      conjuncts: [validAtom, validAtom],
    });
  });

  check(
    "validateEvaluableQuery throws UnsupportedConstructError for FOLImplication",
    () => {
      let thrown: unknown = null;
      try {
        validateEvaluableQuery({
          "@type": "fol:Implication",
          antecedent: validAtom,
          consequent: validAtom,
        } as FOLAxiom);
      } catch (e) {
        thrown = e;
      }
      ok(thrown instanceof UnsupportedConstructError, "expected UnsupportedConstructError");
      strictEqual((thrown as UnsupportedConstructError).construct, "fol-implication-as-query");
    }
  );

  check(
    "validateEvaluableQuery thrown errors are OFBTError subclass (consumers catch by class per API §10)",
    () => {
      let thrown: unknown = null;
      try {
        validateEvaluableQuery({
          "@type": "fol:Existential",
          variable: "x",
          body: validAtom,
        } as FOLAxiom);
      } catch (e) {
        thrown = e;
      }
      ok(thrown instanceof OFBTError, "expected OFBTError subclass");
      ok(thrown instanceof UnsupportedConstructError, "expected UnsupportedConstructError");
    }
  );

  // -----------------------------------------------------------
  // DEFAULT_PER_QUERY_STEP_CAP exported per API §7.2
  // -----------------------------------------------------------

  check("DEFAULT_PER_QUERY_STEP_CAP is 10000 per API §7.2", () => {
    strictEqual(DEFAULT_PER_QUERY_STEP_CAP, 10000);
  });

  // -----------------------------------------------------------
  // Summary
  // -----------------------------------------------------------

  console.log("");
  console.log(`  ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main();
