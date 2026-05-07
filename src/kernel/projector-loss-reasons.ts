/**
 * Projector LossSignature reason-string constants.
 *
 * Per SME's Q-Step4a-1 ratification (Phase 2 Step 4 spec-binding cycle
 * 2026-05-07): LossSignature.reason is a free-form machine-readable string
 * field per API §6.4.1, distinct from the frozen REASON_CODES enum (which
 * binds EvaluationResult.reason / ConsistencyResult.reason / typed-error
 * code under DP-2 invariant I4).
 *
 * Defining the reason strings as module-level constants makes them
 * auditable, greppable, and reusable across projector emission paths
 * without enum-tier ceremony. v0.1 ships free-form; v0.2+ MAY introduce a
 * discipline aligning these strings with REASON_CODES members where
 * semantically applicable, but that's a future cycle's concern.
 */

/**
 * Emitted alongside a `naf_residue` LossSignature when the projector
 * encounters a classical fol:Negation whose intended semantics it cannot
 * determine (lifter-derived classical vs. hand-authored NAF). Conservative-
 * emission policy per architect Q-β cycle banking 2026-05-06.
 */
export const LOSS_REASON_NAF_NEGATION_UNBOUND = "negation_over_unbound_predicate";

/**
 * Emitted alongside an `unknown_relation` LossSignature when the projector
 * encounters a predicate IRI whose namespace is NOT in the Phase 2
 * permissive-tolerance set (i.e., not in any loaded ARC module's known-
 * relations registry). Phase 2 emission is informational; Phase 4 strict-
 * mode operation per spec §3.3 promotes this to a rejection contract.
 */
export const LOSS_REASON_UNKNOWN_RELATION_FALLBACK = "predicate_iri_not_in_loaded_arc_modules";

/**
 * Approximation-strategy discriminator used in RecoveryPayload emission
 * (per API §6.4.2). The Phase 2 projector emits ANNOTATED_APPROXIMATION;
 * Step 6 will add PROPERTY_CHAIN.
 */
export const APPROXIMATION_STRATEGY_ANNOTATED = "ANNOTATED_APPROXIMATION" as const;
