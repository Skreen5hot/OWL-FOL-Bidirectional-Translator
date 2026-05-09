/**
 * Phase 3 Step 3 — FOL → Tau Prolog clause translation per ADR-007 §11.
 *
 * Kernel-pure (Layer 0): no I/O, no Tau Prolog dependency, no Session
 * coupling. Pure string translation from FOLAxiom values to Prolog
 * clause strings + EvaluableQuery values to Prolog goal strings.
 *
 * The composition-layer loadOntology() (src/composition/load-ontology.ts)
 * calls the translator + assertz's the resulting clauses into the Tau
 * Prolog session per API §5.5.
 *
 * Step 3 minimum per ADR-007 §11 + Phase 3 entry packet §7 step ledger:
 *   - FOLAtom (state assertion + EvaluableQuery goal)
 *   - FOLConjunction (in EvaluableQuery + in implication body)
 *   - FOLImplication (state-only Prolog rule, ∀x. P(x) → Q(x) → q(X) :- p(X).)
 *   - Skolem-constant existentials (already lifted; consumed as constants)
 *   - Variable + predicate-IRI canonicalization
 *
 * Step 4 forward-track (closedPredicates):
 *   - FOLNegation NAF semantics with closedPredicates table interaction
 *
 * Step 6 forward-track (checkConsistency + No-Collapse):
 *   - FOLDisjunction-in-head → unverifiedAxioms surfacing
 *   - FOLEquality (same_as discipline)
 *   - FOLFalse (inconsistent reified)
 *   - FOLUniversal-in-body (out-of-scope; surfaces as unverifiedAxioms if via axiomSet)
 *
 * Per ADR-007 §11 reason-enum-stability: no new reason codes introduced.
 * Per ADR-007 §11 banked principle: per-variant table is canonical
 * contract; deviations require ADR amendment.
 *
 * Per ADR-007 §11 multi-ontology accumulation determinism: same FOL state
 * translated in any order produces byte-identical Prolog clause set; sort
 * the output clauses array for determinism.
 */

import type {
  FOLAtom,
  FOLAxiom,
  FOLConjunction,
  FOLImplication,
  FOLTerm,
  FOLUniversal,
} from "./fol-types.js";
import type { EvaluableQuery } from "./evaluate-types.js";

/**
 * Per-variant disposition for a FOLAxiom whose translation is forward-
 * tracked to a later Step (Step 4 / Step 6) per ADR-007 §11.
 *
 * Step 3 collects these but does not assertz them into the session;
 * Step 4 + Step 6 implementations consume the skipped list when
 * activating their respective forward-tracks.
 */
export interface SkippedAxiom {
  axiom: FOLAxiom;
  forwardTrack:
    | "step-4-fol-negation-naf"
    | "step-6-fol-disjunction-in-head"
    | "step-6-fol-equality-same-as"
    | "step-6-fol-false-inconsistent-reified"
    | "step-6-fol-universal-in-body"
    | "step-3-malformed-skip";
  reason: string;
}

/**
 * The output of translating a FOLAxiom[] to Prolog clauses.
 * Sorted for determinism per ADR-007 §11 multi-ontology accumulation
 * determinism contract.
 */
export interface PrologTranslation {
  clauses: string[];
  skipped: SkippedAxiom[];
}

/**
 * Convert a canonical IRI to a Prolog single-quoted atom string.
 *
 * Prolog atoms must either start with a lowercase letter (no special chars)
 * or be wrapped in single quotes for arbitrary strings. IRIs contain `:`,
 * `/`, `#`, etc. → single-quoted atom is the safe canonical form.
 *
 * Single quotes inside the IRI are escaped per ISO Prolog convention
 * (double-up: `'` → `''` inside a single-quoted atom).
 */
export function iriToPrologAtom(iri: string): string {
  return "'" + iri.replace(/'/g, "''") + "'";
}

/**
 * Variable-name allocator state for translating FOL variables to Prolog
 * variables. FOL var names like "x" / "y" / "z" map to Prolog vars
 * "X_x" / "X_y" / "X_z" (uppercase first char + original name preserved
 * for traceability, prefixed with `X_` to avoid Prolog-reserved single-
 * letter conflicts and to disambiguate from constant atoms).
 *
 * Per ADR-007 §11: deterministic alpha-renaming for fresh vars.
 */
function makeVarMap(): Map<string, string> {
  return new Map<string, string>();
}

function prologVarFor(folVarName: string, varMap: Map<string, string>): string {
  const existing = varMap.get(folVarName);
  if (existing !== undefined) return existing;
  // Prolog vars must start uppercase or _. Use `V_<name>` prefix for
  // traceability + avoid single-letter ambiguity (e.g., FOL "X" would
  // otherwise collide with Prolog X across renaming boundaries).
  const prologVar = "V_" + folVarName;
  varMap.set(folVarName, prologVar);
  return prologVar;
}

function termToProlog(term: FOLTerm, varMap: Map<string, string>): string {
  const t = (term as { "@type"?: unknown })["@type"];
  switch (t) {
    case "fol:Variable":
      return prologVarFor((term as { name: string }).name, varMap);
    case "fol:Constant":
      return iriToPrologAtom((term as { iri: string }).iri);
    case "fol:Literal": {
      const value = (term as { value: unknown }).value;
      return iriToPrologAtom(String(value));
    }
    case "fol:TypedLiteral": {
      const value = (term as { value: unknown }).value;
      return iriToPrologAtom(String(value));
    }
    default:
      throw new Error(
        `fol-to-prolog: unsupported FOLTerm @type '${typeof t === "string" ? t : "(non-string)"}'`
      );
  }
}

function atomToProlog(atom: FOLAtom, varMap: Map<string, string>): string {
  const pred = iriToPrologAtom(atom.predicate);
  if (atom.arguments.length === 0) {
    // 0-arity proposition: just the predicate atom, no parens.
    return pred;
  }
  const args = atom.arguments.map((a) => termToProlog(a, varMap)).join(", ");
  return pred + "(" + args + ")";
}

/**
 * Translate a body-context FOLAxiom (the antecedent of an implication, or
 * a conjunct in a body conjunction) to a Prolog goal string.
 *
 * Step 3 minimum supports:
 *   - FOLAtom → Prolog atom
 *   - FOLConjunction (atoms only) → comma-separated Prolog goals
 *
 * Step 4 ACTIVATES (per ADR-007 §11 + Q-3-Step4-A 2026-05-09):
 *   - FOLNegation around a positive atom → Prolog `\+ <atom>`
 *     (negation-as-failure). Per spec §6.3 + ADR-007 §11 the closed-
 *     vs open-predicate semantic mapping is the EVALUATOR's concern at
 *     evaluate() time (per QueryParameters.closedPredicates per API §2 +
 *     API §7.1); the translator's job is just to emit the `\+` operator
 *     so Tau Prolog can resolve under NAF.
 *
 * Returns null for variants still forward-tracked to Step 6
 * (FOLDisjunction / FOLEquality / FOLFalse / FOLUniversal / FOLExistential
 * / unknown / nested FOLNegation). The caller records the skip.
 */
function bodyAxiomToProlog(
  ax: FOLAxiom,
  varMap: Map<string, string>
): string | null {
  const t = (ax as { "@type"?: unknown })["@type"];
  switch (t) {
    case "fol:Atom":
      return atomToProlog(ax as FOLAtom, varMap);
    case "fol:Conjunction": {
      const conj = ax as FOLConjunction;
      const parts: string[] = [];
      for (const c of conj.conjuncts) {
        const p = bodyAxiomToProlog(c, varMap);
        if (p === null) return null;
        parts.push(p);
      }
      return parts.join(", ");
    }
    case "fol:Negation": {
      // Step 4 activation per ADR-007 §11. The inner must be a positive
      // atom for v0.1 NAF semantics; nested FOLNegation or non-atom inner
      // forms surface as null (Step 6 forward-track per ADR-007 §11
      // FOLDisjunction-in-head + FOLEquality + FOLFalse rows).
      const inner = (ax as { inner?: unknown }).inner;
      if (
        inner !== null &&
        typeof inner === "object" &&
        (inner as { "@type"?: unknown })["@type"] === "fol:Atom"
      ) {
        return "\\+ " + atomToProlog(inner as FOLAtom, varMap);
      }
      return null;
    }
    default:
      // FOLDisjunction / FOLEquality / FOLFalse / FOLUniversal /
      // FOLExistential — Step 6 forward-tracks per ADR-007 §11.
      return null;
  }
}

/**
 * Translate a top-level FOLAxiom into Prolog clause string(s).
 *
 * Returns:
 *   - { clauses } when the axiom has a Step-3 translation
 *   - { skipped } when the axiom is forward-tracked to Step 4 or Step 6
 *     per ADR-007 §11
 */
function translateOneAxiom(ax: FOLAxiom): {
  clauses: string[];
  skipped: SkippedAxiom[];
} {
  const t = (ax as { "@type"?: unknown })["@type"];
  switch (t) {
    case "fol:Atom": {
      // Top-level atom = ground fact. Each atom becomes `assertz`-able
      // clause: `'predicate'(arg1, arg2).`
      const varMap = makeVarMap();
      const atomStr = atomToProlog(ax as FOLAtom, varMap);
      return { clauses: [atomStr + "."], skipped: [] };
    }
    case "fol:Universal": {
      // ∀x. body. Body is typically an implication (∀x. P(x) → Q(x)).
      // Translation strips the universal (Prolog has implicit-universal-
      // over-vars per ADR-007 §11); recurses into body.
      const u = ax as FOLUniversal;
      // Multiple nested universals (∀x. ∀y. body) flatten into a single
      // pass since they all become Prolog vars.
      let inner: FOLAxiom = u.body;
      while ((inner as { "@type"?: unknown })["@type"] === "fol:Universal") {
        inner = (inner as FOLUniversal).body;
      }
      return translateOneAxiom(inner);
    }
    case "fol:Implication": {
      const impl = ax as FOLImplication;
      const varMap = makeVarMap();
      const consequent = impl.consequent;
      // Consequent must be an atom for Step 3 minimum (Horn-rule head).
      // FOLDisjunction-in-head is Step 6 forward-track per ADR-007 §11.
      if (
        (consequent as { "@type"?: unknown })["@type"] !== "fol:Atom"
      ) {
        return {
          clauses: [],
          skipped: [
            {
              axiom: ax,
              forwardTrack: "step-6-fol-disjunction-in-head",
              reason:
                "FOLImplication consequent is not a FOLAtom; non-Horn head requires Step 6 No-Collapse machinery (unverifiedAxioms surfacing per ADR-007 §11 + spec §8.5.1)",
            },
          ],
        };
      }
      const head = atomToProlog(consequent as FOLAtom, varMap);
      const bodyStr = bodyAxiomToProlog(impl.antecedent, varMap);
      if (bodyStr === null) {
        // Body contains a non-Horn variant (FOLNegation / FOLDisjunction /
        // etc.) — Steps 4/6 forward-tracks per ADR-007 §11.
        const antT = (impl.antecedent as { "@type"?: unknown })["@type"];
        return {
          clauses: [],
          skipped: [
            {
              axiom: ax,
              forwardTrack:
                antT === "fol:Negation"
                  ? "step-4-fol-negation-naf"
                  : antT === "fol:Disjunction"
                    ? "step-6-fol-disjunction-in-head"
                    : antT === "fol:Equality"
                      ? "step-6-fol-equality-same-as"
                      : antT === "fol:False"
                        ? "step-6-fol-false-inconsistent-reified"
                        : antT === "fol:Universal"
                          ? "step-6-fol-universal-in-body"
                          : "step-6-fol-disjunction-in-head",
              reason:
                "FOLImplication antecedent contains a non-Horn variant; translation deferred per ADR-007 §11 forward-tracks",
            },
          ],
        };
      }
      // Step 3 Horn rule: `head :- body.`
      return { clauses: [head + " :- " + bodyStr + "."], skipped: [] };
    }
    case "fol:Conjunction": {
      // Top-level conjunction = independent axioms. Recurse into each
      // conjunct; collect clauses + skipped.
      const conj = ax as FOLConjunction;
      const out: string[] = [];
      const skipped: SkippedAxiom[] = [];
      for (const c of conj.conjuncts) {
        const sub = translateOneAxiom(c);
        out.push(...sub.clauses);
        skipped.push(...sub.skipped);
      }
      return { clauses: out, skipped };
    }
    case "fol:Negation":
      return {
        clauses: [],
        skipped: [
          {
            axiom: ax,
            forwardTrack: "step-4-fol-negation-naf",
            reason:
              "Top-level FOLNegation requires Step 4 closedPredicates implementation per ADR-007 §11",
          },
        ],
      };
    case "fol:Disjunction":
      return {
        clauses: [],
        skipped: [
          {
            axiom: ax,
            forwardTrack: "step-6-fol-disjunction-in-head",
            reason:
              "Top-level FOLDisjunction requires Step 6 unverifiedAxioms surfacing per ADR-007 §11",
          },
        ],
      };
    case "fol:Equality":
      return {
        clauses: [],
        skipped: [
          {
            axiom: ax,
            forwardTrack: "step-6-fol-equality-same-as",
            reason:
              "Top-level FOLEquality requires Step 6 same_as discipline per ADR-007 §11 + spec §5.5",
          },
        ],
      };
    case "fol:False":
      return {
        clauses: [],
        skipped: [
          {
            axiom: ax,
            forwardTrack: "step-6-fol-false-inconsistent-reified",
            reason:
              "Top-level FOLFalse requires Step 6 checkConsistency 'inconsistent' reified-predicate machinery per ADR-007 §11",
          },
        ],
      };
    default:
      return {
        clauses: [],
        skipped: [
          {
            axiom: ax,
            forwardTrack: "step-3-malformed-skip",
            reason: `Unknown or malformed FOLAxiom @type '${typeof t === "string" ? t : "(non-string)"}'; skipped per defensive translation`,
          },
        ],
      };
  }
}

/**
 * Translate a FOLAxiom[] state into a deterministic Prolog clause set per
 * ADR-007 §11 + multi-ontology accumulation determinism contract.
 *
 * The output clauses array is SORTED so that load order does not affect
 * the byte-identical result per Q-3-Step3-A refinement 2.
 */
export function translateFOLToPrologClauses(
  axioms: ReadonlyArray<FOLAxiom>
): PrologTranslation {
  const allClauses: string[] = [];
  const allSkipped: SkippedAxiom[] = [];
  for (const ax of axioms) {
    const sub = translateOneAxiom(ax);
    allClauses.push(...sub.clauses);
    allSkipped.push(...sub.skipped);
  }
  // Sort for byte-stability per multi-ontology accumulation determinism.
  // Prolog `assertz` is order-sensitive at SLD-trace level (search order),
  // but the determinism contract is on the SET of clauses, not the
  // execution trace. Sorting the assert order keeps the resulting clause
  // database byte-identical across load orderings. Explicit comparator
  // per kernel purity rule (no-bare-sort): use lexicographic comparison
  // of the clause strings.
  allClauses.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  return { clauses: allClauses, skipped: allSkipped };
}

/**
 * Translate an EvaluableQuery (FOLAtom | FOLConjunction-over-atoms) into
 * a Prolog goal string per ADR-007 §11.
 *
 * The goal string is suitable for Tau Prolog's `session.query(string)`
 * API. Variables in the query become Prolog vars (uppercase prefixed).
 *
 * Per API §7.1 + §7.5: only FOLAtom and FOLConjunction-over-atoms are
 * valid EvaluableQuery; the validateEvaluableQuery() helper enforces
 * this at the composition-layer entry. This function assumes a valid
 * EvaluableQuery (caller has validated).
 */
export function translateEvaluableQueryToPrologGoal(
  query: EvaluableQuery
): string {
  const varMap = makeVarMap();
  const t = (query as { "@type"?: unknown })["@type"];
  switch (t) {
    case "fol:Atom":
      return atomToProlog(query as FOLAtom, varMap);
    case "fol:Conjunction": {
      const conj = query as FOLConjunction;
      const parts = conj.conjuncts.map((c) =>
        atomToProlog(c as FOLAtom, varMap)
      );
      return parts.join(", ");
    }
    default:
      throw new Error(
        `translateEvaluableQueryToPrologGoal: invalid EvaluableQuery @type '${typeof t === "string" ? t : "(non-string)"}'; should have been rejected by validateEvaluableQuery() per API §7.5`
      );
  }
}
