/**
 * Phase 3 Step 1b: evaluate() type surface + pure validation helper.
 *
 * Per API spec §7.1 + §7.5. Kernel-pure (Layer 0): no I/O, no Session
 * coupling, no Tau Prolog. The composition-layer evaluate() in
 * src/composition/evaluate.ts wraps these types + validation with
 * Session lifecycle and Tau Prolog SLD invocation.
 *
 * Step 1b ships:
 *   - EvaluableQuery, EvaluationResult, Binding, QueryParameters types
 *   - validateEvaluableQuery() pure helper that throws
 *     UnsupportedConstructError for FOLAxiom variants outside
 *     EvaluableQuery per API §7.5
 *
 * Steps 3+ ship the actual SLD-resolution semantics that produce real
 * three-state results; Step 1's skeleton path returns the v0.1 default-OWA
 * 'undetermined' verdict with reason 'open_world_undetermined'.
 *
 * Per spec §6.3 default OWA + spec §0.1 honest-admission discipline +
 * Phase 3 entry packet §3.6 risk-estimate framing.
 */

import type {
  FOLAtom,
  FOLAxiom,
  FOLConjunction,
  FOLTerm,
} from "./fol-types.js";
import type { ReasonCode } from "./reason-codes.js";
import { UnsupportedConstructError } from "./errors.js";

/**
 * The Horn-clause-safe query subset for v0.1 per API §7.1 + §7.5.
 *
 * - FOLAtom: provable-from-session-state under SLD resolution
 * - FOLConjunction (over atoms only): conjunctive goal, all conjuncts must be
 *   provable under a consistent variable binding
 *
 * Mixed conjunctions (atom AND implication, etc.) throw
 * UnsupportedConstructError per API §7.5: theorem-proving semantics not in
 * v0.1 scope. Richer FOL formulas (FOLImplication, FOLDisjunction,
 * FOLNegation, FOLUniversal, FOLExistential, FOLEquality) all throw
 * UnsupportedConstructError.
 *
 * v0.2 may extend this subset; tracked as a forward-track per spec §13.
 */
export type EvaluableQuery = FOLAtom | FOLConjunction;

/**
 * Variable bindings extracted from a successful query proof.
 *
 * Populated only when QueryParameters.extractBindings is set. Each
 * binding maps the variable name (without the '?' or '_' prefix
 * convention; just the name) to the FOLTerm it unifies to in the proof.
 *
 * Per API §7.1.
 */
export interface Binding {
  [variableName: string]: FOLTerm;
}

/**
 * The three-state result per spec §6.3 + Fandaws Consumer Requirement §2.5.
 *
 * - 'true': query is provable from the session's FOL state plus ARC axioms.
 *   Reason is typically 'consistent' or a specific success code.
 * - 'false': query is refutable. In OWA mode requires the negation of the
 *   query to be provable; mere absence of evidence is 'undetermined'. In
 *   per-predicate CWA mode, may also arise from NAF on closed predicates.
 * - 'undetermined': query is neither provable nor refutable. Load-bearing
 *   third state per Fandaws Consumer Requirement §2.5; NOT a degraded
 *   'false'. Reason codes distinguish the cause: step_cap_exceeded,
 *   cycle_detected, unbound_predicate, model_not_found,
 *   open_world_undetermined.
 *
 * Per API §7.1 + §7.2.
 */
export interface EvaluationResult {
  result: "true" | "false" | "undetermined";
  reason: ReasonCode;
  steps: number;
  bindings?: Binding[];
}

/**
 * Per-query parameters per API §7.1 + §7.2 + §7.4 + spec §6.3.2.
 *
 * - stepCap: per-query Prolog step cap. Default 10000 per API §7.2.
 *   Per-query, NOT per-session; each evaluate() call gets a fresh budget.
 *   The session-aggregate budget is configured separately via
 *   SessionConfiguration.maxAggregateSteps and applies across queries.
 * - throwOnStepCap: when true, breaching stepCap throws
 *   StepCapExceededError. When false (default), evaluate() returns
 *   { result: 'undetermined', reason: 'step_cap_exceeded', steps: stepCap }.
 *   Per API §7.4.
 * - closedPredicates: per-predicate CWA per spec §6.3.2. Predicates in this
 *   set use Negation as Failure semantics (no evidence → 'false');
 *   predicates not in this set use default OWA (no evidence →
 *   'undetermined' on negative queries). Step 4 deliverable; Step 1's
 *   skeleton accepts the parameter shape but does not yet exercise the
 *   semantics.
 * - extractBindings: list of variable names whose unification values
 *   should be returned in EvaluationResult.bindings. Bindings are returned
 *   only when this is set. Step 3 deliverable.
 * - throwOnCycle: when true, cycle detection throws CycleDetectedError;
 *   when false (default), evaluate() returns { result: 'undetermined',
 *   reason: 'cycle_detected', ... }. Step 5 deliverable.
 */
export interface QueryParameters {
  stepCap?: number;
  throwOnStepCap?: boolean;
  closedPredicates?: Set<string>;
  extractBindings?: string[];
  throwOnCycle?: boolean;
}

/**
 * Default per-query step cap per API §7.2.
 *
 * Exported so consumers + tests can reference the canonical value
 * without duplicating the numeric literal.
 */
export const DEFAULT_PER_QUERY_STEP_CAP = 10000;

/**
 * Validate that an arbitrary FOLAxiom is in the EvaluableQuery subset
 * per API §7.1 + §7.5. Throws UnsupportedConstructError with the
 * documented `suggestion` field populated for variants outside the subset.
 *
 * Pure helper: no I/O, no Session coupling. Composition-layer evaluate()
 * calls this at entry as the validation gate before any SLD invocation.
 *
 * Per-variant disposition table per API §7.5:
 *
 * | Variant | Disposition |
 * |---|---|
 * | FOLAtom | Supported |
 * | FOLConjunction (over atoms only) | Supported |
 * | FOLConjunction (with non-atoms) | Throws UnsupportedConstructError |
 * | FOLImplication | Throws |
 * | FOLDisjunction | Throws |
 * | FOLNegation | Throws |
 * | FOLUniversal | Throws |
 * | FOLExistential | Throws |
 * | FOLEquality | Throws |
 * | FOLFalse | Throws (not a query — would mean "is contradiction provable?") |
 *
 * The `suggestion` field on UnsupportedConstructError carries v0.2-path
 * guidance per the spec §13 ELK-integration commitment + the
 * existential-via-extractBindings + equality-via-same_as workarounds
 * from API §7.5.
 */
export function validateEvaluableQuery(
  query: FOLAxiom
): asserts query is EvaluableQuery {
  if (query === null || query === undefined) {
    throw new UnsupportedConstructError(
      "evaluate() requires a non-null EvaluableQuery argument",
      {
        construct: "null-or-undefined-query",
        suggestion: "Pass a FOLAtom or FOLConjunction-over-atoms per API §7.1.",
      }
    );
  }

  const t = (query as { "@type"?: unknown })["@type"];

  switch (t) {
    case "fol:Atom": {
      // FOLAtom: validate arguments shape defensively. The lifter and
      // projector emit well-formed atoms; consumer-constructed queries may
      // have arity or argument-shape errors that surface here rather than
      // inside SLD.
      const atom = query as FOLAtom;
      if (typeof atom.predicate !== "string" || atom.predicate.length === 0) {
        throw new UnsupportedConstructError(
          "FOLAtom requires a non-empty string predicate IRI",
          {
            construct: "malformed-fol-atom",
            suggestion:
              "Construct queries via the public FOL builder helpers; ensure predicate is a canonicalized IRI per API §3.10.",
          }
        );
      }
      if (!Array.isArray(atom.arguments)) {
        throw new UnsupportedConstructError(
          "FOLAtom requires arguments to be an array of FOLTerm",
          {
            construct: "malformed-fol-atom",
            suggestion:
              "Per API §4 the arguments field is FOLTerm[] (Variable, Constant, Literal, or TypedLiteral). Empty array means a 0-arity proposition.",
          }
        );
      }
      return;
    }

    case "fol:Conjunction": {
      const conj = query as FOLConjunction;
      if (!Array.isArray(conj.conjuncts)) {
        throw new UnsupportedConstructError(
          "FOLConjunction requires conjuncts to be an array of FOLAxiom",
          {
            construct: "malformed-fol-conjunction",
            suggestion:
              "Per API §4 a Conjunction's conjuncts field is FOLAxiom[]; for v0.1 EvaluableQuery the entries must all be FOLAtom per API §7.1.",
          }
        );
      }
      // Per API §7.1: "FOLConjunction's conjuncts are restricted to FOLAtom
      // for v0.1." Mixed conjunctions throw per API §7.5.
      for (let i = 0; i < conj.conjuncts.length; i++) {
        const c = conj.conjuncts[i];
        const ct = (c as { "@type"?: unknown })?.["@type"];
        if (ct !== "fol:Atom") {
          throw new UnsupportedConstructError(
            `FOLConjunction conjunct[${i}] is ${typeof ct === "string" ? ct : "non-atom"}; v0.1 EvaluableQuery requires conjuncts to be FOLAtom`,
            {
              construct: "non-atom-conjunct",
              suggestion:
                "Mixed conjunctions (atom AND implication, etc.) require theorem-proving semantics not in v0.1 scope. Decompose into atom-only conjunctions per API §7.5; richer fragments are a v0.2 candidate.",
            }
          );
        }
        // Recurse to validate atom shape.
        validateEvaluableQuery(c as FOLAxiom);
      }
      return;
    }

    case "fol:Implication":
      throw new UnsupportedConstructError(
        "FOLImplication is not in the v0.1 EvaluableQuery subset per API §7.1",
        {
          construct: "fol-implication-as-query",
          suggestion:
            'Theorem-proving over FOL implications is a v0.2 candidate. For v0.1, decompose the implication into a Horn-rule on the session state and query the consequent atom directly.',
        }
      );

    case "fol:Disjunction":
      throw new UnsupportedConstructError(
        "FOLDisjunction is not in the v0.1 EvaluableQuery subset per API §7.1",
        {
          construct: "fol-disjunction-as-query",
          suggestion:
            "Disjunctive goals require model-finding semantics. For v0.1, evaluate each disjunct separately and combine the results client-side; richer support is a v0.2 candidate via branching evaluation.",
        }
      );

    case "fol:Negation":
      throw new UnsupportedConstructError(
        "FOLNegation is not in the v0.1 EvaluableQuery subset per API §7.1",
        {
          construct: "fol-negation-as-query",
          suggestion:
            "Wrapping a query in FOLNegation is ambiguous in OWA. For v0.1 closed-world refutation, use the closedPredicates QueryParameter (per spec §6.3.2) plus the positive-atom query rather than a compound FOLNegation.",
        }
      );

    case "fol:Universal":
      throw new UnsupportedConstructError(
        "FOLUniversal is not in the v0.1 EvaluableQuery subset per API §7.1",
        {
          construct: "fol-universal-as-query",
          suggestion:
            "Universal-quantified queries (∀x. P(x) → Q(x)) ask 'is this universal axiom entailed?' — a theorem-proving problem deferred to v0.2 per spec §13.",
        }
      );

    case "fol:Existential":
      throw new UnsupportedConstructError(
        "FOLExistential is not in the v0.1 EvaluableQuery subset per API §7.1",
        {
          construct: "fol-existential-as-query",
          suggestion:
            "Express existential queries as atom queries with extracted bindings: evaluate(session, P(_x), { extractBindings: ['_x'] }) returns bindings if any witness exists. The compound FOLExistential form is unnecessary at the v0.1 API surface per API §7.5.",
        }
      );

    case "fol:Equality":
      throw new UnsupportedConstructError(
        "FOLEquality is not in the v0.1 EvaluableQuery subset per API §7.1",
        {
          construct: "fol-equality-as-query",
          suggestion:
            "Equality between named individuals is expressible via the same_as predicate per spec §5.5 (e.g., evaluate(session, same_as(a, b))). The compound FOLEquality form requires unification semantics deferred to v0.2.",
        }
      );

    case "fol:False":
      throw new UnsupportedConstructError(
        "FOLFalse is not in the v0.1 EvaluableQuery subset per API §7.1",
        {
          construct: "fol-false-as-query",
          suggestion:
            'A FOLFalse query would mean "is contradiction provable?" — that is the consistency check, not an evaluate() query. Use checkConsistency() per API §8.1 instead.',
        }
      );

    default:
      throw new UnsupportedConstructError(
        `Unknown FOLAxiom @type ${typeof t === "string" ? `'${t}'` : `(${typeof t})`}; not in the v0.1 EvaluableQuery subset per API §7.1`,
        {
          construct: "unknown-fol-axiom-type",
          suggestion:
            "The v0.1 EvaluableQuery subset is FOLAtom | FOLConjunction-over-atoms. Construct queries from FOL builder helpers; ensure the @type discriminator matches one of the canonical values per API §4.",
        }
      );
  }
}
