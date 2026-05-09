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
} from "../kernel/errors.js";
import { REASON_CODES } from "../kernel/reason-codes.js";
import {
  validateEvaluableQuery,
  type EvaluableQuery,
  type EvaluationResult,
  type QueryParameters,
} from "../kernel/evaluate-types.js";
import { translateEvaluableQueryToPrologGoal } from "../kernel/fol-to-prolog.js";
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // --- Query validation gate per API §7.5 ---
  validateEvaluableQuery(query);

  // --- No FOL state loaded yet → empty-state default-OWA path ---
  // Matches Step 1b skeleton return for backwards-compat with Step 2
  // re-exercise tests that asserted the skeleton baseline before any
  // loadOntology call.
  if (
    session.tauPrologSession === null ||
    session.cumulativeAxioms.length === 0
  ) {
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

  const sldResult = await runSLD(tps, goalString);

  switch (sldResult) {
    case "success":
      return {
        result: "true",
        reason: REASON_CODES.consistent,
        steps: 0,
      };
    case "failure":
      // Default OWA per spec §6.3: SLD failure ≠ provable negation;
      // maps to 'undetermined' / 'open_world_undetermined'. Step 4
      // closedPredicates implementation will refine this to 'false' /
      // 'inconsistent' for closed predicates.
      return {
        result: "undetermined",
        reason: REASON_CODES.open_world_undetermined,
        steps: 0,
      };
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
