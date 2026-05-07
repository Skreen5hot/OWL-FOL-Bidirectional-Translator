/**
 * Phase 2 Stub Evaluator Harness
 *
 * Per Phase 2 entry packet §3.4 (architect-ratified 2026-05-06) + architect
 * Q3 ruling: this harness is the Phase 2 query-evaluation surface for the
 * 3 parity canaries. Phase 3 replaces it with the real `evaluate()` per
 * API §7.1; Phase 3 entry packet's gate item re-exercises every Phase 2
 * stub-evaluated canary against the real evaluator BEFORE Phase 3
 * implementation work proceeds past its Step 1.
 *
 * SME-authored leading JSDoc contract (architect-ratified): the contract IS
 * the audit-trail for what each canary DID assert under the stub. Developer
 * implements the function body per this contract. Path-fencing per
 * AUTHORING_DISCIPLINE Section 0 Item 1: SME authors corpus content
 * including this harness file (tests/corpus/ is SME path domain); Developer
 * commits per single-committer model.
 *
 * ── Architect-ratified capability table (entry packet §3.4) ───────────────
 *
 * | Capability                          | Stub-evaluator behavior                                                             |
 * |-------------------------------------|-------------------------------------------------------------------------------------|
 * | Atomic positive query (P(a, b))     | Supported. Returns 'true' / 'false' / 'undetermined' per the lifted FOL state.      |
 * | Atomic negative query (¬P(a, b))    | Supported under default OWA. 'undetermined' unless P(a,b) is explicitly entailed    |
 * |                                     | (then 'false'). NO closed-predicate semantics.                                      |
 * | Existential query (∃x. P(a, x))     | Supported with binding-level entailment only — returns 'true' if a binding is       |
 * |                                     | entailed (i.e., a concrete constant c exists such that P(a, c) is provable);        |
 * |                                     | 'undetermined' otherwise. Skolem-witness derivation from universal-implications     |
 * |                                     | with existential consequent is NOT supported (Phase 3's evaluator handles).         |
 * | Conjunction / disjunction in body   | Supported via decomposition into atomic queries (correctness limited by the         |
 * |                                     | underlying atomic behavior).                                                        |
 * | closedPredicates parameter          | NOT supported — Phase 3's evaluate ships this. Throws UnsupportedHarnessFeatureError.|
 * | Cardinality-bearing query           | NOT supported — Phase 3's Horn-fragment check + non-Horn fallback handles this.     |
 * | (∃≥2 y. P(x, y))                    | Returns 'undetermined' AND emits a harness-level diagnostic.                        |
 * | ARC-content-dependent entailment    | NOT supported — Phase 4+ adds ARC content. Stub operates on built-in OWL semantics  |
 * |                                     | only.                                                                               |
 * | Determinism contract                | Same input → same output, byte-stable across 100 runs (matches API §6.1.1 /         |
 * |                                     | determinism-100-run harness pattern).                                               |
 *
 * ── Implementation guidance (Developer-domain implementation against the contract above) ──
 *
 * The harness implements bounded SLD resolution over the FOL state's Horn-shape
 * universal-implications + asserted atoms (ABox facts). Recommended approach:
 *
 *   1. Parse the FOL state into two pools:
 *      (a) FACTS — atoms with all-Constant arguments (e.g., Mother(alice), hasChild(alice, bob))
 *      (b) RULES — universal-implications matching the Horn shape ∀x_1,...,x_n. (P_1(...) ∧ ... ∧ P_k(...)) → Q(...)
 *      Non-Horn axioms (cardinality, disjunctive consequents, nested existentials with non-trivial bodies) are
 *      not used by the stub; they remain in the state for future Phase 3 evaluation.
 *
 *   2. For atomic positive query Q(c_1, ..., c_n):
 *      - Forward-chain or backward-chain bounded by stepCap=100 (well below the SLD step caps Phase 3 will configure)
 *      - Backward-chain example: try to unify Q with each rule's consequent; on success, recursively prove
 *        the rule's antecedent atoms via the same procedure
 *      - Return 'true' if proof found within stepCap; 'undetermined' if exhausted without proof
 *      - Return 'false' if a NEGATIVE atom of Q is explicitly entailed (rare; spec §6.3 default OWA)
 *
 *   3. For atomic negative query ¬Q(c_1, ..., c_n):
 *      - Try to prove Q first (per step 2)
 *      - If Q proved 'true' → return 'false'
 *      - Otherwise → return 'undetermined' (default OWA per spec §6.3; closedPredicates would change this
 *        but is NOT supported by stub)
 *
 *   4. For existential query ∃x. P(c, x):
 *      - Search FACTS for any atom matching P(c, ?_); if found, bind ?_ = c' and return 'true'
 *      - Search RULES whose consequent is P(c, ?_); attempt backward-chain proof for each; on success,
 *        the rule's antecedent must yield a concrete binding (per "binding-level entailment only")
 *      - Skolem-witness binding from rules like ∀x. C(x) → ∃y. P(x, y) is NOT supported — even if
 *        C(c) is provable, the existential's ∃y witness is not concretely bindable; return 'undetermined'
 *      - Return 'undetermined' if no binding found
 *
 *   5. For conjunction (Q_1 ∧ Q_2): decompose to atomic; return 'true' if both 'true'; 'false' if either 'false';
 *      'undetermined' otherwise.
 *
 *   6. For disjunction (Q_1 ∨ Q_2): decompose; return 'true' if either 'true'; 'false' if both 'false';
 *      'undetermined' otherwise. NOTE: classical FOL doesn't entail individual disjuncts from disjunctive
 *      rules; this is a stub limitation. Phase 3's evaluator handles via non-Horn fallback.
 *
 *   7. For closedPredicates option: throw UnsupportedHarnessFeatureError("closedPredicates").
 *
 *   8. For cardinality-bearing query: return 'undetermined' AND emit a console.warn('[stub-evaluator] cardinality
 *      query not supported; returning undetermined') diagnostic.
 *
 * ── Determinism contract ──────────────────────────────────────────────────
 *
 * Same `folState` + same `query` + same options → same result, byte-stable across 100 runs.
 * No Date.now() / Math.random() / iteration-order-dependent traversal allowed in the implementation.
 * Iterate FACTS / RULES in source order; if hashing predicates is used, use stable canonical-string hashing
 * per kernel canonicalize.ts patterns.
 *
 * ── Phase 3 transition contract ──────────────────────────────────────────
 *
 * At Phase 3 entry: every parity canary fixture's `phase3Reactivation` field
 * is re-exercised against the real `evaluate()` per spec API §7.1. The real
 * evaluator MUST satisfy: for every canary's stub-evaluated query, the
 * real-evaluator result either matches the stub OR diverges in the
 * direction documented in the canary's `phase3Reactivation.divergenceTrigger`.
 * Unexpected divergence triggers a Phase 3 entry escalation cycle.
 */

/**
 * Error thrown when a canary or test exercises a stub-evaluator capability
 * that is documented as NOT SUPPORTED in the contract above.
 *
 * Phase 3's real `evaluate()` per API §7.1 ships the not-supported capabilities;
 * the canary's `phase3Reactivation` field documents the re-exercise contract.
 */
export class UnsupportedHarnessFeatureError extends Error {
  constructor(feature) {
    super(
      `Stub-evaluator does not support: ${feature}. ` +
        `Phase 3's real evaluate() per API §7.1 ships this capability. ` +
        `See tests/corpus/_stub-evaluator.js leading JSDoc contract + the canary's ` +
        `phase3Reactivation field for the re-exercise content.`
    );
    this.name = "UnsupportedHarnessFeatureError";
    this.feature = feature;
  }
}

/**
 * Tri-state result type returned by the stub-evaluator.
 *
 * Per spec §6.3 default OWA + the No-Collapse Guarantee per spec §8.5:
 *   - 'true' — query is provably entailed by the FOL state
 *   - 'false' — query's negation is provably entailed (rare under default OWA)
 *   - 'undetermined' — neither query nor its negation is provable; OWA gap
 */

/**
 * Synchronous, in-process query evaluator over a FOL state.
 *
 * Implements the leading JSDoc contract above. Developer fills in the body
 * per the implementation guidance section.
 *
 * @param {FOLAxiom[]} folState - the FOL axioms array (lifted FOL state)
 * @param {object} query - structured query per src/kernel/fol-types.ts
 *   (e.g., {"@type": "fol:Atom", predicate: "...", arguments: [...]})
 * @param {object} [options] - reserved; { closedPredicates: [...] } throws
 *   UnsupportedHarnessFeatureError per the contract
 * @returns {'true' | 'false' | 'undetermined'} - tri-state result per the
 *   contract's behavior table
 * @throws {UnsupportedHarnessFeatureError} - when an unsupported capability
 *   is exercised
 */
export function evaluateStub(folState, query, options) {
  // closedPredicates is Phase 3's evaluate() territory per the contract.
  if (options && options.closedPredicates !== undefined) {
    throw new UnsupportedHarnessFeatureError("closedPredicates");
  }

  if (!Array.isArray(folState)) return "undetermined";
  if (!isShape(query)) return "undetermined";

  // Parse state once into FACTS + RULES per the contract's step 1.
  const { facts, rules } = parseState(folState);

  return dispatchQuery(query, facts, rules);
}

// ---- Query dispatch ----

function dispatchQuery(query, facts, rules) {
  switch (query["@type"]) {
    case "fol:Atom":
      return evaluateAtomQuery(query, facts, rules);
    case "fol:Negation":
      return evaluateNegationQuery(query, facts, rules);
    case "fol:Existential":
      return evaluateExistentialQuery(query, facts, rules);
    case "fol:Conjunction":
      return evaluateConjunctionQuery(query, facts, rules);
    case "fol:Disjunction":
      return evaluateDisjunctionQuery(query, facts, rules);
    default:
      return "undetermined";
  }
}

function evaluateAtomQuery(atom, facts, rules) {
  // Bare fol:Atom — must have all-constant args to be a closed query
  // (existential queries should arrive via fol:Existential wrapping; bare
  // atoms with variable args are treated as undetermined per the contract).
  if (!Array.isArray(atom.arguments)) return "undetermined";
  if (!atom.arguments.every(isConstantTerm)) return "undetermined";
  return backwardChain(atom, facts, rules, 100, new Set()) ? "true" : "undetermined";
}

function evaluateNegationQuery(negation, facts, rules) {
  const inner = negation.inner;
  if (!isShape(inner) || inner["@type"] !== "fol:Atom") return "undetermined";
  if (!Array.isArray(inner.arguments) || !inner.arguments.every(isConstantTerm)) {
    return "undetermined";
  }
  // Default OWA per spec §6.3: ¬Q evaluates to 'false' iff Q is provably
  // entailed; otherwise 'undetermined'. closedPredicates would change this
  // but is NOT supported by the stub.
  const positive = backwardChain(inner, facts, rules, 100, new Set());
  return positive ? "false" : "undetermined";
}

function evaluateExistentialQuery(existential, facts, rules) {
  // Existential ∃y. P(c, y) — search facts for a binding; rules with
  // existential consequents are NOT supported (Skolem-witness derivation
  // is Phase 3 territory per the contract).
  const innerVar = existential.variable;
  if (typeof innerVar !== "string") return "undetermined";
  const body = existential.body;
  if (!isShape(body) || body["@type"] !== "fol:Atom") return "undetermined";
  if (!Array.isArray(body.arguments)) return "undetermined";

  // Look for a fact matching the body's predicate where each non-existential
  // arg is a constant matching the body's constant arg, and the existential
  // var slot is bindable.
  const predicate = body.predicate;
  for (const fact of facts) {
    if (fact.predicate !== predicate) continue;
    if (!Array.isArray(fact.arguments)) continue;
    if (fact.arguments.length !== body.arguments.length) continue;
    let consistent = true;
    for (let i = 0; i < body.arguments.length; i++) {
      const bodyArg = body.arguments[i];
      const factArg = fact.arguments[i];
      if (isVariableNamedTerm(bodyArg, innerVar)) {
        // Binding slot — fact must have a constant here for binding-level
        // entailment to succeed.
        if (!isConstantTerm(factArg)) {
          consistent = false;
          break;
        }
      } else if (isConstantTerm(bodyArg)) {
        if (!isConstantTerm(factArg)) {
          consistent = false;
          break;
        }
        if (bodyArg.iri !== factArg.iri) {
          consistent = false;
          break;
        }
      } else {
        consistent = false;
        break;
      }
    }
    if (consistent) return "true";
  }
  return "undetermined";
}

function evaluateConjunctionQuery(conjunction, facts, rules) {
  if (!Array.isArray(conjunction.conjuncts)) return "undetermined";
  let anyUndetermined = false;
  for (const c of conjunction.conjuncts) {
    const r = dispatchQuery(c, facts, rules);
    if (r === "false") return "false";
    if (r === "undetermined") anyUndetermined = true;
  }
  return anyUndetermined ? "undetermined" : "true";
}

function evaluateDisjunctionQuery(disjunction, facts, rules) {
  if (!Array.isArray(disjunction.disjuncts)) return "undetermined";
  let anyTrue = false;
  let allFalse = true;
  for (const d of disjunction.disjuncts) {
    const r = dispatchQuery(d, facts, rules);
    if (r === "true") anyTrue = true;
    if (r !== "false") allFalse = false;
  }
  if (anyTrue) return "true";
  if (allFalse) return "false";
  return "undetermined";
}

// ---- State parsing ----

function parseState(folState) {
  const facts = [];
  const rules = [];
  for (const axiom of folState) {
    if (!isShape(axiom)) continue;
    if (axiom["@type"] === "fol:Atom" && isClosedAtom(axiom)) {
      facts.push(axiom);
      continue;
    }
    const rule = parseHornRule(axiom);
    if (rule) rules.push(rule);
  }
  return { facts, rules };
}

function parseHornRule(axiom) {
  // Shape: ∀v_1,...,v_k. (P_1(...) ∧ ... ∧ P_n(...)) → Q(...)
  // Walk universal stack, collect bound vars, then implication body.
  const boundVars = [];
  let current = axiom;
  while (isShape(current) && current["@type"] === "fol:Universal") {
    if (typeof current.variable !== "string") return null;
    boundVars.push(current.variable);
    current = current.body;
  }
  if (boundVars.length === 0) return null;
  if (!isShape(current) || current["@type"] !== "fol:Implication") return null;
  const ant = current.antecedent;
  const con = current.consequent;
  if (!isShape(ant) || !isShape(con)) return null;

  // Body: Atom or Conjunction of atoms
  let bodyAtoms;
  if (ant["@type"] === "fol:Atom") {
    bodyAtoms = [ant];
  } else if (ant["@type"] === "fol:Conjunction") {
    if (!Array.isArray(ant.conjuncts)) return null;
    bodyAtoms = [];
    for (const c of ant.conjuncts) {
      if (!isShape(c) || c["@type"] !== "fol:Atom") return null;
      bodyAtoms.push(c);
    }
  } else {
    // Non-Horn body (Negation, Equality, etc.) — stub doesn't process these.
    return null;
  }

  // Head: must be Atom (Horn)
  if (con["@type"] !== "fol:Atom") return null;

  return { head: con, body: bodyAtoms, boundVars };
}

// ---- Backward-chain proof ----

function backwardChain(goal, facts, rules, stepsRemaining, visited) {
  if (stepsRemaining <= 0) return false;
  const goalKey = atomKey(goal);
  if (visited.has(goalKey)) return false;

  // Try facts first (cheaper; deterministic source order).
  for (const fact of facts) {
    if (atomsEqual(fact, goal)) return true;
  }

  // Try rules. visitedNext tracks the proof-path closure so we don't
  // recurse on a goal we're already trying to prove.
  const visitedNext = new Set(visited);
  visitedNext.add(goalKey);
  for (const rule of rules) {
    const subst = unifyHeadWithGoal(rule.head, goal);
    if (!subst) continue;
    // Substitute the rule body. If any body atom remains with unbound
    // variables (rule has body-only variables, e.g., Transitive's `y`),
    // the stub does NOT search for bindings — return 'undetermined' for
    // this rule attempt per "binding-level entailment only" capability.
    let allProved = true;
    let stepsConsumed = 1;
    for (const bodyAtom of rule.body) {
      const substituted = substituteAtom(bodyAtom, subst);
      if (!isClosedAtom(substituted)) {
        allProved = false;
        break;
      }
      if (!backwardChain(substituted, facts, rules, stepsRemaining - stepsConsumed, visitedNext)) {
        allProved = false;
        break;
      }
      stepsConsumed++;
    }
    if (allProved) return true;
  }
  return false;
}

// ---- Unification + substitution ----

/**
 * Unify a rule's head atom (with variables) against a goal atom (with
 * constants). Returns a substitution map (varName → fol:Constant) on
 * success; null on conflict.
 */
function unifyHeadWithGoal(head, goal) {
  if (!isShape(head) || !isShape(goal)) return null;
  if (head.predicate !== goal.predicate) return null;
  if (!Array.isArray(head.arguments) || !Array.isArray(goal.arguments)) return null;
  if (head.arguments.length !== goal.arguments.length) return null;
  const subst = new Map();
  for (let i = 0; i < head.arguments.length; i++) {
    const h = head.arguments[i];
    const g = goal.arguments[i];
    if (!isShape(h) || !isShape(g)) return null;
    if (h["@type"] === "fol:Variable") {
      if (!isConstantTerm(g)) return null;
      const existing = subst.get(h.name);
      if (existing !== undefined && existing.iri !== g.iri) return null;
      subst.set(h.name, g);
    } else if (h["@type"] === "fol:Constant") {
      if (!isConstantTerm(g) || h.iri !== g.iri) return null;
    } else {
      return null;
    }
  }
  return subst;
}

/**
 * Substitute variables in an atom's arguments per the substitution map.
 * Variables not in the map are preserved verbatim.
 */
function substituteAtom(atom, subst) {
  const newArgs = atom.arguments.map((a) => {
    if (isShape(a) && a["@type"] === "fol:Variable") {
      const replacement = subst.get(a.name);
      if (replacement !== undefined) return replacement;
    }
    return a;
  });
  return { "@type": "fol:Atom", predicate: atom.predicate, arguments: newArgs };
}

// ---- Term-shape predicates ----

function isShape(x) {
  return typeof x === "object" && x !== null && typeof x["@type"] === "string";
}

function isConstantTerm(t) {
  return isShape(t) && t["@type"] === "fol:Constant" && typeof t.iri === "string";
}

function isVariableNamedTerm(t, varName) {
  return isShape(t) && t["@type"] === "fol:Variable" && t.name === varName;
}

function isClosedAtom(atom) {
  if (!isShape(atom) || atom["@type"] !== "fol:Atom") return false;
  if (!Array.isArray(atom.arguments)) return false;
  return atom.arguments.every(isConstantTerm);
}

function atomsEqual(a, b) {
  if (a.predicate !== b.predicate) return false;
  if (a.arguments.length !== b.arguments.length) return false;
  for (let i = 0; i < a.arguments.length; i++) {
    const ai = a.arguments[i];
    const bi = b.arguments[i];
    if (ai["@type"] !== bi["@type"]) return false;
    if (ai["@type"] === "fol:Constant" && ai.iri !== bi.iri) return false;
    if (ai["@type"] === "fol:Variable" && ai.name !== bi.name) return false;
  }
  return true;
}

function atomKey(atom) {
  // Deterministic canonical key for the atom's identity (predicate + arg
  // sequence). Used for the visited-cycle guard during backward-chain.
  const argKeys = atom.arguments.map((a) => {
    if (a["@type"] === "fol:Constant") return `c:${a.iri}`;
    if (a["@type"] === "fol:Variable") return `v:${a.name}`;
    return `?:${a["@type"]}`;
  });
  return `${atom.predicate}(${argKeys.join(",")})`;
}
