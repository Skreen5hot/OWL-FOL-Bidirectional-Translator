/**
 * Phase 0.5 — Session Lifecycle Skeleton Tests
 *
 * Verifies per API spec §5:
 *   - createSession succeeds when Tau Prolog v0.3.4 is loaded (probe registered)
 *   - createSession throws TauPrologVersionMismatchError on mismatch (or no probe)
 *   - The error carries expected/found/resolution per §10.7
 *   - disposeSession releases resources (flips disposed flag)
 *   - disposeSession is idempotent on already-disposed sessions
 *   - disposeSession(null) throws SessionRequiredError
 *   - disposeSession(undefined) throws SessionRequiredError
 *   - Session is caller-owned: each createSession returns a fresh handle
 *   - Session config is frozen and applies documented defaults
 */

import { strictEqual, ok, throws, deepStrictEqual } from "node:assert";
import {
  createSession,
  disposeSession,
  __resetSessionCounterForTesting,
} from "../src/composition/session.js";
import {
  SessionRequiredError,
  TauPrologVersionMismatchError,
  OFBTError,
} from "../src/kernel/errors.js";
import { registerTauPrologProbe } from "../src/kernel/tau-prolog-probe.js";

let passed = 0;
let failed = 0;
function check(name: string, fn: () => void) {
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

// Stub probe to "0.3.4" by default for createSession tests
function withMatchingTauProlog<T>(fn: () => T): T {
  registerTauPrologProbe(() => "0.3.4");
  try {
    return fn();
  } finally {
    registerTauPrologProbe(null);
  }
}

check("createSession succeeds when Tau Prolog v0.3.4 is loaded", () => {
  withMatchingTauProlog(() => {
    __resetSessionCounterForTesting();
    const s = createSession();
    ok(s);
    strictEqual(s.disposed, false);
    strictEqual(s.id, "ofbt-session-1");
  });
});

check("createSession throws TauPrologVersionMismatchError when no probe / wrong version", () => {
  registerTauPrologProbe(() => "0.3.3");
  try {
    let thrown: unknown;
    try {
      createSession();
    } catch (e) {
      thrown = e;
    }
    ok(thrown instanceof TauPrologVersionMismatchError);
    ok(thrown instanceof OFBTError);
    const tpe = thrown as TauPrologVersionMismatchError;
    strictEqual(tpe.expected, "0.3.4");
    strictEqual(tpe.found, "0.3.3");
    ok(tpe.resolution.includes("0.3.4"));
  } finally {
    registerTauPrologProbe(null);
  }
});

check("createSession throws TauPrologVersionMismatchError when no probe registered (found=null)", () => {
  registerTauPrologProbe(null);
  const g = globalThis as { pl?: unknown };
  const saved = g.pl;
  delete g.pl;
  try {
    let thrown: unknown;
    try {
      createSession();
    } catch (e) {
      thrown = e;
    }
    ok(thrown instanceof TauPrologVersionMismatchError);
    strictEqual((thrown as TauPrologVersionMismatchError).found, null);
  } finally {
    if (saved !== undefined) g.pl = saved;
  }
});

check("createSession applies documented defaults (arcCoverage = 'permissive', empty structural set)", () => {
  withMatchingTauProlog(() => {
    const s = createSession();
    strictEqual(s.config.arcCoverage, "permissive");
    ok(s.config.structuralAnnotations instanceof Set);
    strictEqual(s.config.structuralAnnotations.size, 0);
    strictEqual(s.config.emitLossSignaturesToConsole, false);
  });
});

check("createSession returns frozen config", () => {
  withMatchingTauProlog(() => {
    const s = createSession();
    throws(
      () => {
        (s.config as { arcCoverage?: string }).arcCoverage = "strict";
      },
      TypeError
    );
  });
});

check("createSession honors caller-supplied SessionConfiguration", () => {
  withMatchingTauProlog(() => {
    const s = createSession({
      arcCoverage: "strict",
      structuralAnnotations: new Set(["fandaws:bfoSubcategory"]),
      arcModules: ["core/bfo-2020", "core/iao-information"],
      maxAggregateSteps: 50000,
    });
    strictEqual(s.config.arcCoverage, "strict");
    ok(s.config.structuralAnnotations?.has("fandaws:bfoSubcategory"));
    deepStrictEqual(s.config.arcModules, ["core/bfo-2020", "core/iao-information"]);
    strictEqual(s.config.maxAggregateSteps, 50000);
  });
});

check("Each createSession call returns a fresh handle (no shared state)", () => {
  withMatchingTauProlog(() => {
    __resetSessionCounterForTesting();
    const a = createSession();
    const b = createSession();
    ok(a !== b);
    ok(a.id !== b.id);
    a.aggregateSteps = 5;
    strictEqual(b.aggregateSteps, 0);
  });
});

check("disposeSession flips the disposed flag", () => {
  withMatchingTauProlog(() => {
    const s = createSession();
    strictEqual(s.disposed, false);
    disposeSession(s);
    strictEqual(s.disposed, true);
  });
});

check("disposeSession is idempotent on already-disposed sessions", () => {
  withMatchingTauProlog(() => {
    const s = createSession();
    disposeSession(s);
    disposeSession(s); // must not throw
    strictEqual(s.disposed, true);
  });
});

check("disposeSession(null) throws SessionRequiredError", () => {
  let thrown: unknown;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    disposeSession(null as unknown as any);
  } catch (e) {
    thrown = e;
  }
  ok(thrown instanceof SessionRequiredError);
  ok(thrown instanceof OFBTError);
  strictEqual((thrown as SessionRequiredError).functionName, "disposeSession");
});

check("disposeSession(undefined) throws SessionRequiredError", () => {
  let thrown: unknown;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    disposeSession(undefined as unknown as any);
  } catch (e) {
    thrown = e;
  }
  ok(thrown instanceof SessionRequiredError);
});

console.log(`\n  ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
