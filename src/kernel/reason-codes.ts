/**
 * Frozen Reason-Code Enum
 *
 * Per API spec §11. Sixteen members in v0.1.7.
 *
 * Bound to apiSpecVersion. Adding a member is a minor bump on
 * libraryVersion + apiSpecVersion (additive only). Removing or renaming
 * is a major bump (DP-2 invariant I4: dictionary discipline).
 *
 * Exposed as a frozen object so consumer-side code can switch
 * exhaustively over its values without runtime mutation risk.
 */

/**
 * The canonical frozen reason-enum object.
 *
 * Key === value (both are the literal string consumers receive in
 * `EvaluationResult.reason` / `ConsistencyResult.reason` / typed-error `code`).
 *
 * Frozen at module load. Mutation throws in strict mode (which is
 * always on for ES Modules).
 */
export const REASON_CODES = Object.freeze({
  // Success outcomes
  consistent: "consistent",
  inconsistent: "inconsistent",
  satisfiable: "satisfiable",
  unsatisfiable: "unsatisfiable",

  // Indeterminate outcomes (load-bearing third state)
  open_world_undetermined: "open_world_undetermined",
  model_not_found: "model_not_found",
  coherence_indeterminate: "coherence_indeterminate",

  // Failure outcomes
  step_cap_exceeded: "step_cap_exceeded",
  aggregate_step_cap_exceeded: "aggregate_step_cap_exceeded",
  cycle_detected: "cycle_detected",
  unbound_predicate: "unbound_predicate",
  unsupported_construct: "unsupported_construct",
  iri_format_error: "iri_format_error",
  parse_error: "parse_error",

  // Environment failures (added in v0.1.6, additive per §11.2)
  tau_prolog_version_mismatch: "tau_prolog_version_mismatch",

  // Configuration mismatch failures (added in v0.1.7, additive per §11.2)
  arc_manifest_version_mismatch: "arc_manifest_version_mismatch",
} as const);

/**
 * Discriminated union of all valid reason-code string literals.
 *
 * Consumers can use this type for exhaustive `switch` checks:
 *
 *   function handle(r: ReasonCode) {
 *     switch (r) {
 *       case 'consistent': ...
 *       case 'inconsistent': ...
 *       // ... TypeScript will complain if a member is missing
 *     }
 *   }
 */
export type ReasonCode = (typeof REASON_CODES)[keyof typeof REASON_CODES];

/**
 * Read-only array of every valid reason-code value, in declaration order.
 * Useful for runtime enumeration (e.g., manifest validation).
 */
export const REASON_CODES_LIST: readonly ReasonCode[] = Object.freeze(
  Object.values(REASON_CODES) as ReasonCode[]
);

/**
 * Type guard: `true` iff `value` is a valid reason code.
 */
export function isReasonCode(value: unknown): value is ReasonCode {
  return typeof value === "string" && (REASON_CODES_LIST as readonly string[]).includes(value);
}
