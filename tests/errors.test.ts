/**
 * Phase 0.2 — Typed Error Class Hierarchy Tests
 *
 * Verifies all twelve typed error classes per API spec §10:
 *   - Each is exported and instantiable
 *   - Each extends OFBTError (and therefore Error)
 *   - Each carries the documented fields
 *   - Each carries the documented `code` matching its reason-enum member
 *   - libraryVersion is populated from version-constants
 */

import { strictEqual, ok } from "node:assert";
import {
  OFBTError,
  ParseError,
  UnsupportedConstructError,
  IRIFormatError,
  RoundTripError,
  SessionRequiredError,
  SessionDisposedError,
  StepCapExceededError,
  SessionStepCapExceededError,
  CycleDetectedError,
  ARCManifestError,
  TauPrologVersionMismatchError,
} from "../src/kernel/errors.js";
import { LIBRARY_VERSION } from "../src/kernel/version-constants.js";

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

// 1. OFBTError base
check("OFBTError extends Error and carries code + libraryVersion", () => {
  const e = new OFBTError("test", "test_code");
  ok(e instanceof Error, "extends Error");
  ok(e instanceof OFBTError, "is OFBTError");
  strictEqual(e.code, "test_code");
  strictEqual(e.libraryVersion, LIBRARY_VERSION);
  strictEqual(e.name, "OFBTError");
});

// 2. ParseError
check("ParseError carries construct + position; code = parse_error", () => {
  const e = new ParseError("bad parse", { construct: "owl:Foo", position: { line: 5, column: 3 } });
  ok(e instanceof OFBTError);
  strictEqual(e.code, "parse_error");
  strictEqual(e.construct, "owl:Foo");
  strictEqual(e.position?.line, 5);
});

// 3. UnsupportedConstructError
check("UnsupportedConstructError carries construct + suggestion; code = unsupported_construct", () => {
  const e = new UnsupportedConstructError("not supported", {
    construct: "owl:hasKey",
    suggestion: "deferred to v0.2",
  });
  strictEqual(e.code, "unsupported_construct");
  strictEqual(e.construct, "owl:hasKey");
  strictEqual(e.suggestion, "deferred to v0.2");
});

// 4. IRIFormatError
check("IRIFormatError carries iri + form; code = iri_format_error", () => {
  const e = new IRIFormatError("unrecognized", { iri: "garbage", form: "unrecognized" });
  strictEqual(e.code, "iri_format_error");
  strictEqual(e.iri, "garbage");
  strictEqual(e.form, "unrecognized");
});

// 5. RoundTripError
check("RoundTripError carries diff; code = round_trip_error", () => {
  const e = new RoundTripError("not equiv", { diff: { reason: "lossy" } });
  strictEqual(e.code, "round_trip_error");
  ok(e.diff);
});

// 6. SessionRequiredError
check("SessionRequiredError carries functionName; code = session_required", () => {
  const e = new SessionRequiredError("evaluate");
  strictEqual(e.code, "session_required");
  strictEqual(e.functionName, "evaluate");
});

// 7. SessionDisposedError
check("SessionDisposedError carries optional disposalTimestamp; code = session_disposed", () => {
  const e = new SessionDisposedError("disposed", { disposalTimestamp: "2026-05-02T00:00:00Z" });
  strictEqual(e.code, "session_disposed");
  strictEqual(e.disposalTimestamp, "2026-05-02T00:00:00Z");
});

// 8. StepCapExceededError
check("StepCapExceededError carries query + steps + stepCap; code = step_cap_exceeded", () => {
  const q = { kind: "FOLAtom" };
  const e = new StepCapExceededError("cap hit", { query: q, steps: 10001, stepCap: 10000 });
  strictEqual(e.code, "step_cap_exceeded");
  strictEqual(e.query, q);
  strictEqual(e.steps, 10001);
  strictEqual(e.stepCap, 10000);
});

// 9. SessionStepCapExceededError
check("SessionStepCapExceededError carries aggregate fields; code = aggregate_step_cap_exceeded", () => {
  const e = new SessionStepCapExceededError("agg cap", {
    aggregateSteps: 50001,
    maxAggregateSteps: 50000,
  });
  strictEqual(e.code, "aggregate_step_cap_exceeded");
  strictEqual(e.aggregateSteps, 50001);
  strictEqual(e.maxAggregateSteps, 50000);
});

// 10. CycleDetectedError
check("CycleDetectedError carries cycle + inSubsystem; code = cycle_detected", () => {
  const e = new CycleDetectedError("loop", { cycle: ["A", "B", "A"], inSubsystem: "class-hierarchy" });
  strictEqual(e.code, "cycle_detected");
  strictEqual(e.cycle.length, 3);
  strictEqual(e.inSubsystem, "class-hierarchy");
});

// 11. ARCManifestError
check("ARCManifestError carries optional missing/malformed; code = arc_manifest_error", () => {
  const e = new ARCManifestError("missing dep", { missingProperties: ["core/bfo-2020"] });
  strictEqual(e.code, "arc_manifest_error");
  strictEqual(e.missingProperties?.[0], "core/bfo-2020");
});

// 12. TauPrologVersionMismatchError
check("TauPrologVersionMismatchError carries expected/found/resolution; code = tau_prolog_version_mismatch", () => {
  const e = new TauPrologVersionMismatchError("mismatch", {
    expected: "0.3.4",
    found: "0.3.3",
    resolution: "Install tau-prolog@0.3.4 as a peer dependency.",
  });
  strictEqual(e.code, "tau_prolog_version_mismatch");
  strictEqual(e.expected, "0.3.4");
  strictEqual(e.found, "0.3.3");
  ok(e.resolution.includes("tau-prolog"));
});

// Inheritance chain check
check("All twelve subclasses extend OFBTError", () => {
  const samples = [
    new ParseError("p"),
    new UnsupportedConstructError("u", { construct: "x" }),
    new IRIFormatError("i", { iri: "x", form: "unrecognized" }),
    new RoundTripError("r", { diff: {} }),
    new SessionRequiredError("f"),
    new SessionDisposedError("s"),
    new StepCapExceededError("c", { query: null, steps: 1, stepCap: 1 }),
    new SessionStepCapExceededError("c", { aggregateSteps: 1, maxAggregateSteps: 1 }),
    new CycleDetectedError("c", { cycle: [], inSubsystem: "sld-resolution" }),
    new ARCManifestError("m"),
    new TauPrologVersionMismatchError("v", { expected: "0.3.4", found: null, resolution: "x" }),
  ];
  for (const s of samples) {
    ok(s instanceof OFBTError, `${s.constructor.name} extends OFBTError`);
    ok(s instanceof Error, `${s.constructor.name} extends Error`);
  }
});

console.log(`\n  ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
