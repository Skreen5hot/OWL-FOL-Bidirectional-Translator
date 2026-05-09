/**
 * Phase 3 fixture — Cycle detection: recursive predicate definition.
 *
 * Per Phase 3 entry packet §3.5 + architect Q-3-E ratification 2026-05-08
 * (step-N-bind): Step 5 (cycle detection per spec §5.4 + ADR-013) authoring
 * fills full body. Stub at Pass 2a; full content lands at Step 5
 * implementation cycle 2026-05-09 per Q-3-Step5-A architect ratification.
 *
 * Status: Verified. Step 5 implementation cycle stub-fill complete.
 *
 * Exercises: Class 1 cycle-prone predicate per ADR-013 (TransitiveObjectProperty-
 * derived rule with cyclic ABox facts that would loop indefinitely under naive
 * SLD). The lifter emits the transitive rule
 * ∀x,y,z. ancestor(x,y) ∧ ancestor(y,z) → ancestor(x,z); the FOL→Prolog
 * translator (per ADR-013 visited-ancestor pattern) detects the transitive
 * shape, replaces the rule with visited-ancestor-guarded clauses, and
 * rewrites all ancestor-fact assertions to the p_orig functor. Per-query
 * cycle-detection marker (CYCLE_DETECTED_MARKER_PREDICATE) signals when
 * the visited-list member-check blocks a cycle attempt; evaluate() surfaces
 * 'cycle_detected' reason code per ADR-013 §detection-emission-contract.
 *
 * Discrimination from cycle_equivalent_classes sibling: this fixture's cycle is
 * in PREDICATE definition (Class 1 transitive); the sibling's is in CLASS
 * hierarchy via mutual EquivalentClasses (Class 3 — forward-tracked beyond
 * Step 5 minimum per Q-3-Step5-B Strategy (A) Class 1-first scope ruling).
 *
 * Worked example:
 *   ABox facts: ancestor(a, b). ancestor(b, a).
 *   Lifted FOL: ∀x,y,z. ancestor(x,y) ∧ ancestor(y,z) → ancestor(x,z)
 *   Translator output (per ADR-013):
 *     'ancestor'(X, Y) :- 'ancestor/guard'(X, Y, []).
 *     'ancestor/guard'(X, Y, _V) :- 'ancestor/orig'(X, Y).
 *     'ancestor/guard'(X, Y, V) :- 'ancestor/orig'(X, Z),
 *                                  \+ member(Z, V),
 *                                  'ancestor/guard'(Z, Y, [Z | V]).
 *     'ancestor/guard'(X, Y, V) :- 'ancestor/orig'(X, Z),
 *                                  member(Z, V),
 *                                  assertz(ofbt_cycle_detected),
 *                                  fail.
 *     'ancestor/orig'(a, b). 'ancestor/orig'(b, a).
 *
 *   Query: ancestor(a, c)?
 *   SLD trace: p_guard(a, c, []) → p_orig(a, b) succeeds → p_guard(b, c, [b])
 *   → p_orig(b, a) succeeds → p_guard(a, c, [a, b]) → p_orig(a, b) succeeds
 *   → \+ member(b, [a, b]) FAILS (cycle) → cycle clause fires →
 *   assertz(ofbt_cycle_detected), fail. SLD ultimately fails (c not reachable);
 *   evaluate() detects marker → returns { result: 'undetermined', reason:
 *   'cycle_detected' }.
 */

const PREFIX = "http://example.org/test/cycle_recursive_predicate/";
const ANCESTOR = PREFIX + "ancestor";
const A = PREFIX + "a";
const B = PREFIX + "b";
const C = PREFIX + "c";

/** @type {object} */
export const fixture = {
  input: {
    ontologyIRI: "http://example.org/test/cycle_recursive_predicate",
    prefixes: { ex: PREFIX },
    tbox: [],
    abox: [
      // Cyclic ancestor-relation facts: a is ancestor of b, b is ancestor of a.
      // Forms a 2-cycle through the transitive closure rule.
      {
        "@type": "ObjectPropertyAssertion",
        property: ANCESTOR,
        source: A,
        target: B,
      },
      {
        "@type": "ObjectPropertyAssertion",
        property: ANCESTOR,
        source: B,
        target: A,
      },
    ],
    rbox: [
      // TransitiveObjectProperty: lifter emits the transitive closure rule
      // ∀x,y,z. ancestor(x,y) ∧ ancestor(y,z) → ancestor(x,z). Visited-
      // ancestor pattern per ADR-013 wraps this for cycle-safe SLD.
      {
        "@type": "ObjectPropertyCharacteristic",
        characteristic: "Transitive",
        property: ANCESTOR,
      },
    ],
  },

  /**
   * Discriminating query: ancestor(a, c)?
   *
   * c is NOT reachable from a (no fact asserts ancestor(_, c) or ancestor(c, _)).
   * SLD on transitive ancestor with cyclic ABox would loop a → b → a → b → ...
   * indefinitely under naive evaluation. The visited-ancestor pattern per
   * ADR-013 catches the cycle attempt at the second visit to (a) (the visited
   * list is [a, b] when SLD attempts to recurse on a again) and fires the
   * cycle-detection marker. SLD ultimately fails (no proof path to c);
   * evaluate() returns 'undetermined' / 'cycle_detected'.
   */
  query: {
    "@type": "fol:Atom",
    predicate: ANCESTOR,
    arguments: [
      { "@type": "fol:Constant", iri: A },
      { "@type": "fol:Constant", iri: C },
    ],
  },

  expectedOutcome: {
    summary:
      "Step 5 implementation contract: query ancestor(a, c)? against TransitiveObjectProperty(ancestor) " +
      "with cyclic ABox {ancestor(a,b), ancestor(b,a)} produces 'undetermined' with reason 'cycle_detected' " +
      "per ADR-013 visited-ancestor pattern (Class 1 cycle-prone predicate). The translator detects the " +
      "transitive rule shape, emits visited-ancestor-guarded clauses + cycle-detection marker; the " +
      "evaluator queries the marker after SLD and surfaces 'cycle_detected' reason code per ADR-013 " +
      "§detection-emission-contract. SLD fails (c not reachable); cycle attempt was blocked by visited-list " +
      "member-check.",
    fixtureType: "evaluate-cycle-detection",
    canaryRole: "cycle-detection-class-1-transitive-recursive-predicate",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "cycle detection failure on transitive recursive predicate definitions: implementation enters infinite " +
    "loop on the cyclic ABox; implementation terminates via Tau Prolog step-bound but mis-reports as " +
    "'open_world_undetermined' rather than 'cycle_detected' (the silent-pass failure mode for cycle " +
    "detection); implementation reports 'cycle_detected' but throws instead of returning the reason code " +
    "(when consumer config requested non-throwing behavior — Step 5 minimum is non-throwing per spec §6.3 " +
    "default; throwOnCycle is Step 8 territory).",

  "expected_v0.1_verdict": {
    ringStatus: "ring3-passes-step-5-implementation",
    phaseAuthored: 3,
    phaseActivated: 3,
    expectedResult: "undetermined",
    expectedReason: "cycle_detected",
  },

  "expected_v0.2_elk_verdict": null,

  meta: {
    verifiedStatus: "Verified",
    phase: 3,
    activationTiming: "step-N-bind",
    stepBinding: 5,
    authoredAt: "2026-05-08",
    authoredBy:
      "SME persona, Pass 2a stub authoring; Step 5 implementation cycle stub-fill 2026-05-09",
    relatedSpecSections: [
      "spec §5.4 (resolution depth bound + cycle detection)",
      "ADR-013 (visited-ancestor cycle-guard pattern; Class 1 TransitiveObjectProperty scope at Step 5 minimum)",
      "ADR-007 §11 (FOL → Tau Prolog clause translation; visited-ancestor wrapping at translator post-pass)",
      "API §11.1 (reason enum; cycle_detected reason code emission contract)",
    ],
    relatedFixtures: [
      "cycle_equivalent_classes (sibling: class-hierarchy cycle via mutual EquivalentClasses; Class 3 cycle-prone — forward-tracked beyond Step 5 minimum per Q-3-Step5-B Strategy (A) Class 1-first scope ruling)",
      "p1_property_characteristics (Phase 1 TransitiveObjectProperty lifting precedent)",
    ],
    architectAuthorization:
      "Phase 3 entry packet §3.5 ratified 2026-05-08; step-N-bind per Q-3-E split; ADR-013 ratified 2026-05-09 per Q-3-Step5-A option (i) + 2 refinements; Q-3-Step5-B Strategy (A) Visited-ancestor encoding ratified 2026-05-09.",
  },
};

export const meta = fixture.meta;
