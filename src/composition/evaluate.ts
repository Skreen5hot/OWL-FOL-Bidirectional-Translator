/**
 * Phase 3 Step 1b: evaluate() composition-layer skeleton.
 *
 * Per API spec §7.1 + §7.4. Composition-layer (Layer 1) wrapper around the
 * kernel-pure validation helper. Step 1b ships:
 *
 *   - Public async evaluate(session, query, params?) signature
 *   - Session lifecycle gates (SessionRequiredError on null/undefined;
 *     SessionDisposedError on disposed session)
 *   - Query validation gate via validateEvaluableQuery() — throws
 *     UnsupportedConstructError for FOLAxiom variants outside the
 *     EvaluableQuery subset per API §7.5
 *   - Skeleton return path: { result: 'undetermined', reason:
 *     'open_world_undetermined', steps: 0 } per spec §6.3 default-OWA
 *     framing. The skeleton path matches what an empty session-state
 *     under default OWA would naturally return; subsequent steps replace
 *     the placeholder with actual SLD resolution semantics.
 *
 * Per Phase 3 entry packet §7 step ledger + Q-3-A ratification 2026-05-08:
 * Step 1 = skeleton + types + UnsupportedConstructError; Steps 3+ ship
 * actual SLD evaluation against the lifted FOL state. Per Q-3-B Step 1a
 * pre-emptive review (commit b7e5686 2026-05-08): no genuine semantic
 * divergence surfaced for at-risk parity canaries; Step 1b unblocked.
 *
 * Layer note: this lives in src/composition/ per the architect's purity
 * ruling. The kernel imports nothing from composition; composition imports
 * the EvaluableQuery type + validateEvaluableQuery helper from
 * src/kernel/evaluate-types.ts.
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
import type { Session } from "./session.js";

/**
 * Evaluate a query against the session's FOL state per API §7.1.
 *
 * Step 1 skeleton: validates inputs, throws documented typed errors for
 * boundary failures (null session, disposed session, non-EvaluableQuery
 * query), returns the default-OWA 'undetermined' verdict. Subsequent steps
 * ship actual SLD resolution + three-state semantics + per-predicate CWA +
 * cycle detection + step-cap enforcement.
 *
 * Throws (per API §7.4):
 *   - SessionRequiredError — session is null or undefined
 *   - SessionDisposedError — session has been disposed
 *   - UnsupportedConstructError — query is not in the EvaluableQuery
 *     subset (FOLAtom | FOLConjunction-over-atoms) per API §7.5
 *
 * Returns (Step 1 skeleton, all execution paths):
 *   - { result: 'undetermined', reason: 'open_world_undetermined',
 *       steps: 0 }
 *
 * Steps 3+ replace the skeleton return with real SLD-resolution outputs.
 */
export async function evaluate(
  session: Session | null | undefined,
  query: EvaluableQuery,
  // Step 1 accepts the QueryParameters shape but does not yet exercise
  // most fields. stepCap, throwOnStepCap, closedPredicates,
  // extractBindings, throwOnCycle all become operational at their
  // respective step landings (Step 1, 1, 4, 3, 5 per the entry packet
  // §7 step ledger).
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
  // Throws UnsupportedConstructError for any FOLAxiom variant outside
  // the EvaluableQuery subset, including malformed atoms (non-string
  // predicate, non-array arguments) and mixed conjunctions.
  validateEvaluableQuery(query);

  // --- Step 1 skeleton return path ---
  // Per spec §6.3 default-OWA framing: an empty session state with no
  // ARC axioms loaded cannot prove or refute any non-trivial query;
  // the canonical answer is 'undetermined' with reason
  // 'open_world_undetermined'. Step 3 replaces this with actual SLD
  // resolution against the lifted FOL state.
  return {
    result: "undetermined",
    reason: REASON_CODES.open_world_undetermined,
    steps: 0,
  };
}
