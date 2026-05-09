/**
 * Phase 3 Step 6 — checkConsistency composition function per API §8.1.
 *
 * Per architect Q-3-A step-granularity ratification 2026-05-08 +
 * Q-3-Step6-A + Q-3-Step6-B rulings 2026-05-09 + ADR-007 §11.
 *
 * Step 6 implements the No-Collapse Guarantee surface per spec §8.5 +
 * the unverifiedAxioms honest-admission surface per API §8.1.1. The
 * ConsistencyResult interface uses the three-state shape per Q-3-Step6-A
 * option (α) editorial correction (consistent: 'true' | 'false' |
 * 'undetermined' — mirrors EvaluationResult.result per API §7.1
 * vocabulary alignment).
 *
 * Step 6 minimum scope per Q-3-Step6 ratification 2026-05-09:
 *   - Three-state ConsistencyResult per Q-3-Step6-A option (α)
 *   - Horn-fragment-escape detection via translator's SkippedAxiom
 *     accumulation (cumulativeSkipped on Session)
 *   - unverifiedAxioms population per API §8.1.1 when reason is
 *     'coherence_indeterminate'
 *   - Per-class Skolem-witness satisfiability checking forward-tracked
 *     beyond Step 6 minimum (covers nc_self_complement; documented as
 *     Step 6+ refinement per ADR-013-style forward-track precedent)
 *
 * Three-state mapping per spec §8.5 + API §8.1:
 *   - cumulativeSkipped is empty (all axioms Horn-translatable):
 *       * No inconsistency proven via Horn check → consistent: 'true' /
 *         'consistent'
 *       * Inconsistency proven via Horn check → consistent: 'false' /
 *         'inconsistent' (Step 6+ forward-track for actual proof; Step 6
 *         minimum returns 'true' for the all-Horn-translatable case)
 *   - cumulativeSkipped is non-empty (some axioms outside Horn fragment):
 *       * consistent: 'undetermined' / 'coherence_indeterminate' /
 *         unverifiedAxioms = the skipped axioms
 *
 * Per API §8.1.2 hypothetical-axiom semantics:
 *   - axiomSet axioms participate in the consistency check
 *   - axiomSet axioms classified for Horn-fragment per the same rules
 *     as session axioms; non-Horn hypotheticals contribute to
 *     unverifiedAxioms
 *   - Hypothetical axioms do NOT persist in session per API §8.1.2
 *     load-bearing semantic
 */

import {
  SessionRequiredError,
  SessionDisposedError,
} from "../kernel/errors.js";
import { REASON_CODES, type ReasonCode } from "../kernel/reason-codes.js";
import { translateFOLToPrologClauses } from "../kernel/fol-to-prolog.js";
import type { FOLAxiom } from "../kernel/fol-types.js";
import type { QueryParameters } from "../kernel/evaluate-types.js";
import type { Session } from "./session.js";

/**
 * ConsistencyResult per API §8.1 with Q-3-Step6-A option (α) editorial
 * correction: `consistent` is a three-state string ('true' | 'false' |
 * 'undetermined') matching EvaluationResult.result per API §7.1
 * vocabulary alignment.
 *
 * Per spec §8.2 framing:
 *   - 'true' / 'consistent' — no contradiction proved; Horn-checkable
 *     fragment within step cap; KB satisfiable
 *   - 'false' / 'inconsistent' — contradiction proved via Horn resolution;
 *     witnesses list the minimal inconsistent subset
 *   - 'undetermined' / 'step_cap_exceeded' — Horn check ran but did not
 *     finish within step cap
 *   - 'undetermined' / 'coherence_indeterminate' — axioms outside the
 *     Horn-checkable fragment prevented decisive answer; unverifiedAxioms
 *     populated per API §8.1.1
 */
export interface ConsistencyResult {
  consistent: "true" | "false" | "undetermined";
  reason: ReasonCode;
  steps: number;
  /**
   * Per API §8.1.1: populated when reason === 'coherence_indeterminate'.
   * Contains the FOL axioms (from session state + axiomSet) that fell
   * outside the Horn-checkable fragment. Empty/undefined when reason
   * is anything else.
   */
  unverifiedAxioms?: FOLAxiom[];
  /**
   * Per API §8.1: populated when consistent === 'false'. Each witness is
   * a minimal inconsistent subset of axioms that the Horn-resolution
   * proof identified. Empty/undefined for non-inconsistent results.
   *
   * Step 6 minimum: empty array (forward-tracked to Step 6+ refinement
   * per per-class Skolem-witness satisfiability checking forward-track).
   */
  witnesses?: InconsistencyWitness[];
}

export interface InconsistencyWitness {
  axioms: FOLAxiom[];
}

/**
 * checkConsistency per API §8.1.
 *
 * Per architect Q-3-Step6-A + Q-3-Step6-B rulings 2026-05-09 + spec
 * §8.5 No-Collapse Guarantee + API §8.1.1 honest-admission surface.
 *
 * Step 6 minimum scope: three-state surface + Horn-fragment-escape
 * detection. Per-class Skolem-witness satisfiability checking is
 * forward-tracked beyond Step 6 minimum (the nc_self_complement
 * fixture's Horn-detectable inconsistency case requires this
 * additional machinery — fixture stays Draft per Phase 3 entry packet
 * Step 6 binding's stub-fill discipline at Step 6+ refinement).
 *
 * Throws (per API §8.1 + §10.3):
 *   - SessionRequiredError — session is null or undefined
 *   - SessionDisposedError — session has been disposed
 *
 * Returns ConsistencyResult per the three-state shape; consumers
 * should switch on `consistent` AND inspect `reason` for the
 * 'undetermined' sub-cases per spec §8.2.
 */
export async function checkConsistency(
  session: Session | null | undefined,
  axiomSet?: ReadonlyArray<FOLAxiom>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  params?: QueryParameters
): Promise<ConsistencyResult> {
  // --- Session lifecycle gates per API §10.3 ---
  if (session === null || session === undefined) {
    throw new SessionRequiredError("checkConsistency");
  }
  if (session.disposed) {
    throw new SessionDisposedError(
      "checkConsistency() called against a disposed session. Create a new session via createSession() before checking consistency."
    );
  }

  // --- Aggregate non-Horn axioms per API §8.1.2 ---
  // Session-loaded skipped axioms (accumulated across loadOntology calls
  // per cumulativeSkipped) PLUS hypothetical axiomSet's non-Horn entries
  // (translated fresh per the same rules as loadOntology). Per API §8.1.2:
  // hypothetical axioms participate in the Horn-fragment classification
  // exactly as session axioms do.
  const sessionSkipped = (session.cumulativeSkipped as FOLAxiom[]).slice();
  let hypotheticalSkipped: FOLAxiom[] = [];
  if (axiomSet !== undefined && axiomSet.length > 0) {
    // Translate the hypothetical axiomSet to determine which axioms are
    // Horn-translatable vs not. We do NOT assert these into the Tau
    // Prolog session per API §8.1.2 hypothetical-non-persistence
    // semantic; we only need the translation result's `skipped` field.
    const hypotheticalTranslation = translateFOLToPrologClauses(
      axiomSet as FOLAxiom[]
    );
    hypotheticalSkipped = hypotheticalTranslation.skipped.map((s) => s.axiom as FOLAxiom);
  }
  const allUnverified: FOLAxiom[] = [
    ...sessionSkipped,
    ...hypotheticalSkipped,
  ];

  // --- Horn-fragment-escape detection per API §8.1.1 + spec §8.5.5 ---
  // If any axiom (session + hypothetical) fell outside the Horn-checkable
  // fragment, the consistency check cannot produce a decisive answer per
  // spec §8.5.4 ("incomplete for full SROIQ"). Surface the unverified
  // axioms per the honest-admission discipline.
  if (allUnverified.length > 0) {
    return {
      consistent: "undetermined",
      reason: REASON_CODES.coherence_indeterminate,
      steps: 0,
      unverifiedAxioms: allUnverified,
      witnesses: [],
    };
  }

  // --- All-Horn-translatable case ---
  // Step 6 minimum: when all axioms are Horn-translatable AND no skipped
  // axioms, return consistent: 'true' / 'consistent'. The actual
  // per-class Skolem-witness satisfiability check (which would catch
  // nc_self_complement-style EquivalentClasses-with-complement
  // contradictions decidable in the Horn fragment) is forward-tracked
  // beyond Step 6 minimum.
  //
  // Step 6+ refinement (forward-tracked): for each named class C in the
  // session's TBox, assert a Skolem witness c_C, query 'inconsistent'
  // against the session's clause database, retract the Skolem witness.
  // If any per-class check proves inconsistent → consistent: 'false' /
  // 'inconsistent' with witnesses[]. The Step 6 minimum returns
  // 'true' / 'consistent' for the all-Horn case; Step 6+ refinement
  // upgrades the assertion to actual proof.
  return {
    consistent: "true",
    reason: REASON_CODES.consistent,
    steps: 0,
    witnesses: [],
  };
}
