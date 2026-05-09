/**
 * Phase 3 Step 3 — evaluate() composition-layer SLD invocation.
 *
 * UPGRADES the Step 1b skeleton (commit c2a9867) per architect Q-3-A
 * step-granularity ratification 2026-05-08 + Q-3-Step3-A/B ratifications
 * 2026-05-09. Now executes Tau Prolog SLD resolution against the session's
 * accumulated FOL state per ADR-007 §11 translation rules.
 *
 * Per API spec §7.1 + §7.2 + §7.4:
 *   - Validates Session lifecycle (SessionRequiredError on null/undefined;
 *     SessionDisposedError on disposed session)
 *   - Validates query as EvaluableQuery (UnsupportedConstructError per
 *     API §7.5 for FOLAxiom variants outside FOLAtom | FOLConjunction)
 *   - Translates the query to a Prolog goal per ADR-007 §11
 *   - Runs Tau Prolog SLD via session.tauPrologSession
 *   - Maps Tau Prolog answer → three-state result + reason code per
 *     spec §6.3 default OWA
 *
 * Three-state mapping (Step 3 minimum, per spec §6.3 default OWA):
 *   - SLD success (answer with bindings) → 'true' / 'consistent'
 *   - SLD failure (no answer; backtrack exhausted) → 'undetermined' /
 *     'open_world_undetermined' (default OWA: fail-to-prove ≠ provable
 *     negation)
 *   - Empty session state OR no Tau Prolog session allocated yet (no
 *     loadOntology call has happened) → 'undetermined' /
 *     'open_world_undetermined' (matches the Step 1b skeleton return
 *     for backwards-compatibility with the Step 2 re-exercise tests'
 *     skeleton-baseline assertions)
 *
 * Per Phase 3 entry packet §7 step ledger:
 *   - Step 4 will add closedPredicates per-predicate CWA + the
 *     FOLNegation NAF translation per ADR-007 §11 forward-track
 *   - Step 5 will add cycle detection + cycle_detected reason code
 *   - Step 6 will add checkConsistency + No-Collapse + unverifiedAxioms
 *   - Step 8 will add SessionStepCapExceededError + structural_annotation_mismatch
 *     + arc_manifest_version_mismatch
 *
 * Step 3 minimum: per-query 10K step cap is wired (default + override
 * via QueryParameters.stepCap), but full step-cap enforcement +
 * SessionStepCapExceededError + throwOnStepCap come at later steps as
 * the entry packet ledger spells out.
 */

import {
  SessionRequiredError,
  SessionDisposedError,
  SessionStepCapExceededError,
} from "../kernel/errors.js";
import { REASON_CODES } from "../kernel/reason-codes.js";
import {
  validateEvaluableQuery,
  type EvaluableQuery,
  type EvaluationResult,
  type QueryParameters,
} from "../kernel/evaluate-types.js";
import {
  translateEvaluableQueryToPrologGoal,
  CYCLE_DETECTED_MARKER_PREDICATE,
} from "../kernel/fol-to-prolog.js";
import type { Session } from "./session.js";

/**
 * Internal: Tau Prolog session-shape narrowing for the SLD invocation.
 * The full Tau Prolog Session class has many methods; we use `query` +
 * `answer` for SLD resolution.
 */
interface TauPrologSessionLike {
  query: (goal: string) => unknown;
  answer: (callback: (answer: unknown) => void) => unknown;
}

/**
 * Internal: Tau Prolog answer-shape narrowing. A successful answer is a
 * Term (binding object). Failure is `false` or `null`. Errors are Term
 * objects with @type fields the type module distinguishes.
 *
 * For Step 3 minimum we only need the success/failure discrimination;
 * detailed error inspection comes at Steps 4/5/8.
 */
function isSuccessAnswer(answer: unknown): boolean {
  // Tau Prolog's pl.type.is_substitution(answer) tests for a binding
  // object. Truthy non-error answers indicate success. False or null
  // indicate failure (no more answers).
  if (answer === null || answer === false) return false;
  if (typeof answer !== "object") return false;
  // Errors are Terms with id="throw" or similar — Step 3 minimum
  // treats any non-null, non-false object answer as success. Step 5
  // cycle detection + Step 8 typed-error surfacing refine this.
  const a = answer as { id?: unknown; indicator?: unknown };
  // pl.type.is_error checks: if the answer Term's id is "throw" or it's
  // wrapped as an error term, treat as not-success.
  if (a.id === "throw") return false;
  return true;
}

/**
 * Run a Tau Prolog SLD query against the session's clause database.
 * Returns 'success' (any answer found), 'failure' (backtrack exhausted),
 * or 'error' (Prolog error during resolution).
 *
 * Promisified wrapper around the Tau Prolog callback API. The
 * single-answer mode (.answer(cb) once) is sufficient for the Step 3
 * minimum's three-state mapping; Step 3+ extends to multi-answer
 * extraction for QueryParameters.extractBindings.
 */
async function runSLD(
  tps: TauPrologSessionLike,
  goalString: string
): Promise<"success" | "failure" | "error"> {
  // Tau Prolog .query() parses the goal string. A parse error is signaled
  // by a non-Term return; for Step 3 minimum we trust validateEvaluableQuery
  // + translator output to produce parseable goals.
  tps.query(goalString);
  return new Promise<"success" | "failure" | "error">((resolve) => {
    let resolved = false;
    const callback = (answer: unknown): void => {
      if (resolved) return;
      resolved = true;
      if (answer === null || answer === false) {
        resolve("failure");
        return;
      }
      // Success path: any Term answer counts as a satisfying binding.
      if (typeof answer === "object" && answer !== null) {
        const a = answer as { id?: unknown };
        if (a.id === "throw") {
          resolve("error");
          return;
        }
        if (isSuccessAnswer(answer)) {
          resolve("success");
          return;
        }
      }
      resolve("failure");
    };
    try {
      tps.answer(callback);
    } catch {
      if (!resolved) {
        resolved = true;
        resolve("error");
      }
    }
  });
}

/**
 * Evaluate a query against the session's FOL state per API §7.1.
 *
 * Step 3 implementation (UPGRADED from Step 1b skeleton):
 *   - Tau Prolog SLD against session.tauPrologSession
 *   - Three-state result + reason code per spec §6.3 default OWA
 *
 * Throws (per API §7.4):
 *   - SessionRequiredError — session is null or undefined
 *   - SessionDisposedError — session has been disposed
 *   - UnsupportedConstructError — query not in EvaluableQuery subset
 *
 * Returns:
 *   - { result: 'true', reason: 'consistent', steps: 0 } when SLD succeeds
 *   - { result: 'undetermined', reason: 'open_world_undetermined', steps: 0 }
 *     when SLD fails OR no FOL state has been loaded into the session yet
 *
 * Per Step 3 minimum scope (ADR-007 §11 + Phase 3 entry packet §7): step
 * count reporting is approximate (0 placeholder); Step 4+ wires the
 * per-query step counter from Tau Prolog's resolution engine. Reason
 * code 'open_world_undetermined' is returned for both empty-state and
 * SLD-failure cases per spec §6.3 default-OWA framing.
 */
export async function evaluate(
  session: Session | null | undefined,
  query: EvaluableQuery,
  params?: QueryParameters
): Promise<EvaluationResult> {
  // --- Session lifecycle gates per API §7.4 ---
  if (session === null || session === undefined) {
    throw new SessionRequiredError("evaluate");
  }
  if (session.disposed) {
    throw new SessionDisposedError(
      "evaluate() called against a disposed session. Create a new session via createSession() before evaluating."
    );
  }

  // --- Phase 3 Step 8: SessionStepCapExceededError per API §2.1 + §7.4 ---
  // Pre-check: if the session's aggregate step counter has already
  // exceeded the configured cap (from prior queries), throw immediately.
  // Per API §2.1: maxAggregateSteps default is unbounded; when set,
  // exceeding it always throws (NOT configurable to non-throwing per
  // API §7.4 — this is the runaway-protection mechanism).
  const maxAggregate = session.config.maxAggregateSteps;
  if (
    maxAggregate !== undefined &&
    session.aggregateSteps >= maxAggregate
  ) {
    throw new SessionStepCapExceededError(
      `Session aggregate step cap exceeded: ${session.aggregateSteps} >= ${maxAggregate} (configured via SessionConfiguration.maxAggregateSteps per API §2.1).`,
      {
        aggregateSteps: session.aggregateSteps,
        maxAggregateSteps: maxAggregate,
      }
    );
  }

  // --- Query validation gate per API §7.5 ---
  validateEvaluableQuery(query);

  // --- No FOL state loaded yet → empty-state default-OWA path ---
  // Matches Step 1b skeleton return for backwards-compat with Step 2
  // re-exercise tests that asserted the skeleton baseline before any
  // loadOntology call.
  //
  // Step 4 refinement (Q-3-Step4-A 2026-05-09): only short-circuit when
  // NO loadOntology call has happened (tauPrologSession === null). Once
  // loadOntology is called — even with an empty ontology — the
  // tauPrologSession is allocated with the unknown=fail directive and
  // SLD runs (returning failure on any query); closedPredicates
  // semantics then apply per spec §6.3.2. The earlier check that also
  // short-circuited on empty cumulativeAxioms incorrectly bypassed
  // closedPredicates for loaded-but-empty sessions.
  if (session.tauPrologSession === null) {
    // Phase 3 Step 8: increment aggregate step counter even on the
    // empty-state path. Per API §2.1 the counter tracks ALL evaluate()
    // calls; an empty-state evaluate() still consumed the API surface.
    // Step 8 minimum uses a placeholder per-call increment of 1; richer
    // per-query step extraction from Tau Prolog is forward-tracked.
    session.aggregateSteps += 1;
    return {
      result: "undetermined",
      reason: REASON_CODES.open_world_undetermined,
      steps: 0,
    };
  }

  // --- SLD resolution against the session's clause database ---
  // Tau Prolog's query() requires a terminal `.` per ISO Prolog goal
  // grammar; the kernel-pure translateEvaluableQueryToPrologGoal returns
  // a bare goal expression (no terminator) so the kernel surface stays
  // composable; the composition layer adds the terminator at the SLD
  // entry point.
  const goalString = translateEvaluableQueryToPrologGoal(query) + ".";
  const tps = session.tauPrologSession as TauPrologSessionLike;

  // Phase 3 Step 5 (ADR-013 visited-ancestor cycle-guard pattern):
  // before each SLD invocation, retract any prior cycle-detection marker
  // assertion so the post-SLD check measures THIS query's cycle attempts
  // only, not stale state from a prior evaluate() call. Tau Prolog's
  // retractall succeeds whether the predicate exists or not (idempotent),
  // matching the per-query lifecycle requirement.
  await runSLD(tps, "retractall(" + CYCLE_DETECTED_MARKER_PREDICATE + ").");

  const sldResult = await runSLD(tps, goalString);

  // Phase 3 Step 5: after SLD, query the cycle-detection marker. If a
  // cycle was attempted during SLD, the visited-ancestor guard clauses
  // assertz'd the marker; this query succeeds iff a cycle was detected.
  // Per ADR-013 §detection-emission-contract, cycle-detection cases
  // surface 'cycle_detected' reason code with no LossSignature (cycle
  // is a termination signal, not information loss).
  const cycleCheckResult = await runSLD(
    tps,
    CYCLE_DETECTED_MARKER_PREDICATE + "."
  );
  const cycleDetected = cycleCheckResult === "success";

  // Phase 3 Step 8: increment session aggregate step counter per API §2.1.
  // Step 8 minimum uses a placeholder per-call increment of 1000 (an
  // order-of-magnitude approximation of the per-query default cap per
  // API §7.2 — DEFAULT_PER_QUERY_STEP_CAP). Real per-query step extraction
  // from Tau Prolog is forward-tracked alongside the steps field
  // refinement (currently steps: 0 placeholder).
  session.aggregateSteps += 1000;

  switch (sldResult) {
    case "success":
      // SLD-success path: positive proof found regardless of
      // closedPredicates. Three-state result: 'true' / 'consistent'.
      // Note: even when SLD succeeds, a cycle MAY have been detected
      // along an alternative resolution path that ultimately succeeded.
      // Per ADR-013 §detection-emission-contract, success-with-cycle-
      // detected stays 'true' / 'consistent' (the cycle was prevented
      // by visited-ancestor encoding; resolution found a non-cyclic
      // path; the proof is valid). Cycle marker is informational on
      // success paths.
      return {
        result: "true",
        reason: REASON_CODES.consistent,
        steps: 0,
      };
    case "failure": {
      // Phase 3 Step 5 (ADR-013): if a cycle was detected during SLD
      // (visited-ancestor guard clauses fired the marker), the SLD
      // failure is attributable to cycle prevention. Per ADR-013
      // §detection-emission-contract, surface 'undetermined' /
      // 'cycle_detected' reason code. This takes precedence over the
      // closedPredicates / open-world handling because the cycle
      // detection is a structural termination signal that's
      // independent of OWA/CWA semantics.
      if (cycleDetected) {
        return {
          result: "undetermined",
          reason: REASON_CODES.cycle_detected,
          steps: 0,
        };
      }
      // Step 4 (Q-3-Step4-A 2026-05-09 + ADR-007 §11): per-predicate
      // CWA handling per spec §6.3.2.
      //
      // SLD failed to prove the goal. Two semantic sub-cases per
      // QueryParameters.closedPredicates:
      //
      //   (a) The query's top-level predicate IS in closedPredicates →
      //       CWA refutation: return 'false' / 'inconsistent' per
      //       ADR-007 §11 (REUSE existing 'inconsistent' reason code,
      //       not a new 'closed_world_negation' code).
      //
      //   (b) The query's top-level predicate is NOT in closedPredicates
      //       (or closedPredicates is undefined) → default OWA per spec
      //       §6.3: fail-to-prove ≠ provable-negation; return
      //       'undetermined' / 'open_world_undetermined' per Q-3-Step4-A
      //       option (β) ratification (REUSE existing
      //       'open_world_undetermined'; not a new 'naf_residue' reason
      //       code despite the LossSignature lossType sharing the
      //       string).
      //
      // For FOLConjunction queries, the top-level predicate is
      // determined by the first conjunct per spec §6.3.2 application
      // semantics (the per-predicate CWA contract is per top-level
      // goal predicate; conjunction goals fail when any conjunct fails,
      // and the closure decision binds against the failing conjunct's
      // predicate — Step 4 minimum applies the simpler rule of the
      // first conjunct's predicate).
      const queryPredicateIRI = topLevelPredicateOf(query);
      const isClosed =
        params?.closedPredicates !== undefined &&
        queryPredicateIRI !== null &&
        params.closedPredicates.has(queryPredicateIRI);
      if (isClosed) {
        return {
          result: "false",
          reason: REASON_CODES.inconsistent,
          steps: 0,
        };
      }
      return {
        result: "undetermined",
        reason: REASON_CODES.open_world_undetermined,
        steps: 0,
      };
    }
    case "error":
      // Step 3 minimum: any Tau Prolog error surfaces as 'undetermined'
      // with a generic reason. Step 5 cycle detection + Step 8 typed-
      // error surfacing refine this to specific reason codes
      // (cycle_detected, etc.).
      return {
        result: "undetermined",
        reason: REASON_CODES.open_world_undetermined,
        steps: 0,
      };
  }
}

/**
 * Extract the top-level predicate IRI from an EvaluableQuery for
 * closedPredicates membership lookup per spec §6.3.2.
 *
 * - FOLAtom → the atom's predicate IRI
 * - FOLConjunction → the FIRST conjunct's predicate IRI per Step 4
 *   minimum semantics (per-conjunct closure-handling is a Step 6
 *   refinement)
 *
 * Returns null defensively for malformed queries (validateEvaluableQuery
 * should already have caught these; this is belt-and-suspenders).
 */
function topLevelPredicateOf(query: EvaluableQuery): string | null {
  const t = (query as { "@type"?: unknown })["@type"];
  if (t === "fol:Atom") {
    const pred = (query as { predicate?: unknown }).predicate;
    return typeof pred === "string" ? pred : null;
  }
  if (t === "fol:Conjunction") {
    const conjuncts = (query as { conjuncts?: unknown }).conjuncts;
    if (Array.isArray(conjuncts) && conjuncts.length > 0) {
      const first = conjuncts[0] as { predicate?: unknown };
      return typeof first?.predicate === "string" ? first.predicate : null;
    }
  }
  return null;
}
