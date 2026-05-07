/**
 * Phase 2 fixture — parity canary: visual-equivalence trap for strategy-
 * routing wrong-shape detection.
 *
 * Per Phase 2 entry packet §3.4 (architect-ratified 2026-05-06):
 *
 *   "parity_canary_visual_equivalence_trap.fixture.js — Engineered such that
 *    naive graph-shape comparison reports `equivalent: true` but semantic
 *    content has shifted; query MUST detect the shift (this is the 'correct
 *    emission of the wrong projection' failure mode — Ring 2 alone misses
 *    it; Ring 2 + query verification catches it)."
 *
 * Per Phase 2 entry packet §3.7 + §10.8 (architect-banked cross-section
 * defense pair refinement 2026-05-06): this canary is the WRONG-shape-
 * absent half of the two-fixture defense-in-depth pair for strategy-routing
 * correctness. The POSITIVE half is `strategy_routing_direct.fixture.js`
 * (already authored at Slot 3 corpus commit). The pair spans two corpus
 * sections (§3.3 strategy-routing + §3.4 parity-canary) by design — the
 * canary's natural home is §3.4 because its assertion mechanism (query-
 * based detection) belongs with the parity-canary harness.
 *
 * Status: Draft. Authored at Phase 2 Step 8 stub-evaluator + parity-canary
 * SME path-fence-authoring pass; promoted to Verified at Phase 2 exit per
 * the standard AUTHORING_DISCIPLINE state-machine progression.
 *
 * ── The "visual equivalence trap" failure mode ────────────────────────────
 *
 * Strategy-routing correctness is Phase 2's high-correctness-risk requirement
 * per Phase 2 entry packet §3.7. A correct emission of the WRONG strategy is
 * a Ring 2 pass that hides a real bug:
 *
 *   - The projector might mis-route a Direct-Mapping-eligible axiom to
 *     Annotated Approximation. The OWL surface is graph-shape-similar
 *     (the SubClassOf is still emitted), but a Loss Signature + Recovery
 *     Payload appear — consumer tooling treating Loss Signatures as "this
 *     didn't round-trip cleanly" mis-categorizes the axiom.
 *
 *   - The projector might mis-route to Property-Chain Realization on an
 *     axiom that doesn't have a chain shape. The output emits an
 *     ObjectPropertyChain that wasn't in the input, plus a Recovery
 *     Payload — graph-shape comparison via byte-comparison would FAIL
 *     (different RBox count), but a buggy graph-shape comparison that
 *     groups axioms by predicate might silently accept it.
 *
 *   - The projector might emit an ALL VALUESFROM where SOMEVALUESFROM was
 *     the lift's class expression. The OWL surface looks similar
 *     (Restriction shape; same property; same filler), but quantifier kind
 *     is shifted. A naive byte-comparison detects this; a "structural
 *     equivalence" that abstracts over Restriction kinds misses it.
 *
 * The canary engineers the THIRD failure mode with auxiliary facts that
 * BOTH the correct and the buggy round-trip produce the same answer for
 * STUB-evaluator capabilities. Phase 3's real evaluator (with richer
 * semantics) MAY surface the kind-swap; if the round-trip actually was
 * buggy, the divergence is detected at Phase 3 reactivation.
 *
 * ── Worked example ────────────────────────────────────────────────────────
 *
 *   Input OWL:
 *     SubClassOf(ParentOfPerson, ObjectSomeValuesFrom(hasChild, Person))
 *     ClassAssertion(ParentOfPerson, alice)
 *     ObjectPropertyAssertion(hasChild, alice, bob)
 *     ClassAssertion(Person, bob)
 *
 *   Auxiliary facts (hasChild + Person assertions about bob) are LOAD-
 *   BEARING for the trap design: they provide the entailment witnesses
 *   that the stub-evaluator can ground regardless of the SubClassOf class-
 *   expression's quantifier kind.
 *
 *   Expected lift F_1 (via owlToFol):
 *     ∀x. ParentOfPerson(x) → ∃y. hasChild(x, y) ∧ Person(y)   ← someValuesFrom
 *     ParentOfPerson(alice)
 *     hasChild(alice, bob)
 *     Person(bob)
 *
 *   Expected project (via folToOwl — Step 3b correct class-expression reconstruction):
 *     SubClassOf(ParentOfPerson, ObjectSomeValuesFrom(hasChild, Person))
 *     ClassAssertion(ParentOfPerson, alice)
 *     ObjectPropertyAssertion(hasChild, alice, bob)
 *     ClassAssertion(Person, bob)
 *
 *   Expected re-lift F_3:
 *     Same as F_1 (round-trip clean).
 *
 *   Discriminating query Q := Person(bob)?
 *     Stub on F_1: directly asserted; returns 'true'.
 *     Stub on F_3: directly asserted; returns 'true'.
 *
 *   Auxiliary discriminating query Q' := hasChild(alice, bob)?
 *     Stub on F_1: directly asserted; returns 'true'.
 *     Stub on F_3: directly asserted; returns 'true'.
 *
 * ── Why these queries ─────────────────────────────────────────────────────
 *
 * The stub-evaluator's atomic-positive-query capability (per entry packet
 * §3.4 row 1) is sufficient to verify that the auxiliary facts survive the
 * round-trip. Both queries return 'true' on F_1 and F_3; the trap is at the
 * CLASS EXPRESSION level, not the ABox level.
 *
 * The Phase 2 stub-evaluator's "binding-level entailment only" capability
 * (per entry packet §3.4 row 3) means the existential ∃y. hasChild(alice, y)
 * ∧ Person(y) might be derivable from the SubClassOf rule + ParentOfPerson
 * (alice) — but the stub doesn't support Skolem-witness derivation. The
 * auxiliary facts ARE the witness binding; the stub uses them.
 *
 * If the projector mis-routed someValuesFrom → allValuesFrom (the
 * engineered shift):
 *   - F_3 has ∀x. ParentOfPerson(x) → ∀y. hasChild(x, y) → Person(y)
 *   - Stub queries Person(bob)? and hasChild(alice, bob)? still return
 *     'true' (auxiliary facts still asserted)
 *   - The kind-swap is INVISIBLE under stub semantics
 *
 * Phase 3's real evaluator with closedPredicates: ['hasChild'] would change
 * the negation semantics differently for the two kinds. The phase3
 * Reactivation field documents the discriminating Phase 3 query that
 * surfaces the kind-swap.
 *
 * ── Phase 2 canary value ──────────────────────────────────────────────────
 *
 * At Phase 2 stub-fidelity, this canary asserts a BASELINE: the round-trip
 * preserves stub-detectable entailments + does NOT introduce spurious Loss
 * Signatures / Recovery Payloads on Direct-Mapping-eligible axioms. The
 * baseline catches the mis-routing-to-Annotated-Approximation failure mode
 * (assertions 2 + 3 below).
 *
 * The kind-swap detection is Phase 3 territory; the canary's
 * phase3Reactivation field documents the contract for that future cycle.
 *
 * ── Cross-section defense pair (architect-banked 2026-05-06) ──────────────
 *
 * Per Phase 2 entry packet §10.8 banked principle: defense-in-depth pairs
 * MAY cross corpus sections when the canary's natural home is a different
 * section than the positive fixture's. This canary lives in §3.4 (parity
 * canaries); its sibling positive `strategy_routing_direct.fixture.js`
 * lives in §3.3 (strategy-routing fixtures). The pairing is named
 * explicitly in both fixtures' leading comments + manifest entries so the
 * cross-section relationship is auditable.
 *
 * ── Phase 3 entry re-exercise per architect Q3 ruling 2026-05-06 ──────────
 *
 * Phase 3's real evaluate() per API §7.1 ships closedPredicates support.
 * The Phase 3 re-exercise uses a discriminating query that distinguishes
 * someValuesFrom from allValuesFrom semantics — closedPredicates: ['hasChild']
 * with an existential query exposes the kind-swap.
 */

const PREFIX = "http://example.org/test/parity_canary_visual_equivalence_trap/";
const PARENT_OF_PERSON = PREFIX + "ParentOfPerson";
const HAS_CHILD = PREFIX + "hasChild";
const PERSON = PREFIX + "Person";
const ALICE = PREFIX + "alice";
const BOB = PREFIX + "bob";

/** @type {object} */
export const fixture = {
  /**
   * Lift+project+re-lift round-trip fixture: input is OWL ontology.
   * Test runner dispatches via owlToFol(input) → folToOwl(F_1) → owlToFol(projected) → F_3.
   * Stub-evaluator runs the discriminating queries on both F_1 and F_3.
   * Audit-artifact assertions check that no spurious Loss Signatures /
   * Recovery Payloads are emitted (mis-routing-to-Annotated-Approximation
   * detection).
   */
  input: {
    ontologyIRI: "http://example.org/test/parity_canary_visual_equivalence_trap",
    prefixes: {
      ex: PREFIX,
    },
    tbox: [
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: PARENT_OF_PERSON },
        superClass: {
          "@type": "Restriction",
          onProperty: HAS_CHILD,
          someValuesFrom: { "@type": "Class", iri: PERSON },
        },
      },
    ],
    abox: [
      {
        "@type": "ClassAssertion",
        class: { "@type": "Class", iri: PARENT_OF_PERSON },
        individual: ALICE,
      },
      {
        "@type": "ObjectPropertyAssertion",
        property: HAS_CHILD,
        source: ALICE,
        target: BOB,
      },
      {
        "@type": "ClassAssertion",
        class: { "@type": "Class", iri: PERSON },
        individual: BOB,
      },
    ],
    rbox: [],
  },

  /**
   * Discriminating queries for stub-evaluator. Both atomic positive queries
   * grounded in asserted facts.
   *
   * Q_1 := Person(bob)? — stub returns 'true' (asserted)
   * Q_2 := hasChild(alice, bob)? — stub returns 'true' (asserted)
   *
   * The stub-evaluator's "binding-level entailment only" capability (per
   * entry packet §3.4) means the kind-swap (someValuesFrom vs allValuesFrom)
   * is invisible at this fidelity — the auxiliary facts ground the
   * entailments regardless of class-expression quantifier kind. Phase 3's
   * real evaluator with closedPredicates surfaces the kind-swap.
   */
  discriminatingQueries: [
    {
      label: "Q_1: Person(bob)?",
      query: {
        "@type": "fol:Atom",
        predicate: PERSON,
        arguments: [{ "@type": "fol:Constant", iri: BOB }],
      },
      expectedStubResult: "true",
    },
    {
      label: "Q_2: hasChild(alice, bob)?",
      query: {
        "@type": "fol:Atom",
        predicate: HAS_CHILD,
        arguments: [
          { "@type": "fol:Constant", iri: ALICE },
          { "@type": "fol:Constant", iri: BOB },
        ],
      },
      expectedStubResult: "true",
    },
  ],

  expectedOutcome: {
    summary:
      "Cross-section defense-in-depth canary half (sibling: " +
      "strategy_routing_direct in §3.3). Engineered such that the round-trip's " +
      "graph-shape comparison reports clean (auxiliary facts about bob ground " +
      "the entailment witnesses regardless of class-expression quantifier " +
      "kind). At Phase 2 stub-fidelity, the canary asserts baseline " +
      "preservation: round-trip OWL surface byte-equivalent, no spurious Loss " +
      "Signatures (mis-routing-to-Annotated-Approximation detection), no " +
      "spurious Recovery Payloads, stub queries return 'true' on both F_1 " +
      "and F_3. Phase 3 reactivation surfaces the engineered kind-swap " +
      "detection via closedPredicates: ['hasChild'] discriminating query.",
    fixtureType: "round-trip-with-stub-evaluator-query-and-audit-artifact-checks",
    discriminatingQueriesAllStubResult: "true",
    canaryRole: "cross-section-defense-pair-canary-half",
    siblingPositiveFixture: "strategy_routing_direct (Phase 2 entry packet §3.3 + §3.7)",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "the projector silently mis-routing the Direct-Mapping-eligible " +
    "SubClassOf-with-someValuesFrom-Restriction axiom to Annotated " +
    "Approximation (would emit Loss Signature + Recovery Payload when the " +
    "round-trip is structurally clean and Direct Mapping is the correct " +
    "strategy); OR mis-routing to Property-Chain Realization (would emit " +
    "ObjectPropertyChain + Recovery Payload + change RBox axiom count); " +
    "OR mis-routing to a non-existent third strategy that produces " +
    "structurally-similar-but-semantically-shifted output. The audit-" +
    "artifact assertions (newLossSignatures.length === 0, " +
    "newRecoveryPayloads.length === 0) catch (1) and (2). The kind-swap " +
    "(someValuesFrom → allValuesFrom) detection is Phase 3 territory; the " +
    "phase3Reactivation field documents that re-exercise.",

  "expected_v0.1_verdict": {
    ringStatus: "ring2-passes-with-stub-evaluator-and-audit-artifact-baseline",
    phaseAuthored: 2,
    phaseActivated: 2,
    expectedRoundTripBehavior: {
      structuralEquivalence: "F_3 byte-equivalent to F_1 (modulo canonicalization)",
      lossSignatureCount: 0,
      recoveryPayloadCount: 0,
      stubQuery_PersonBob_OnF1: "true",
      stubQuery_PersonBob_OnF3: "true",
      stubQuery_hasChildAliceBob_OnF1: "true",
      stubQuery_hasChildAliceBob_OnF3: "true",
      auxiliaryFactsPreservation: "Person(bob) and hasChild(alice, bob) ABox facts preserved through round-trip",
    },
    expectedProjectionStrategy: "direct",
    crossSectionDefensePairAssertion:
      "paired with strategy_routing_direct (positive half) per architect-banked §10.8 cross-section pattern",
  },

  "expected_v0.2_elk_verdict": null,

  /**
   * Phase 3 entry re-exercise per architect Q3 ruling 2026-05-06. Phase 3's
   * real evaluate() per API §7.1 ships closedPredicates support, which is
   * the discriminating mechanism for the engineered kind-swap detection at
   * Phase 3 fidelity.
   */
  phase3Reactivation: {
    gatedOn: "real-evaluator-via-API-§7.1-with-closedPredicates-support",
    query:
      "evaluate(F_3, query: '∃y. hasChild(alice, y) ∧ ¬Person(y)?', closedPredicates: ['hasChild', 'Person']) — discriminating kind-swap detection query under closed-predicate semantics",
    expectedResult:
      "matches stub for the simple atomic queries (Person(bob) and " +
      "hasChild(alice, bob) both 'true'); for the discriminating Phase 3 " +
      "query under closedPredicates: ['hasChild', 'Person'], the result " +
      "depends on the projection's correctness: under correct " +
      "someValuesFrom round-trip, ∃y. hasChild(alice, y) ∧ ¬Person(y) " +
      "evaluates to 'false' (the only y with hasChild(alice, y) is bob; " +
      "Person(bob) is closed and asserted; ¬Person(bob) is 'false' under " +
      "CWA). Under buggy allValuesFrom mis-routing, F_3 has different " +
      "structural semantics; Phase 3's evaluator surfaces the kind-swap.",
    divergenceTrigger:
      "If real evaluate() divergence in EITHER direction on the " +
      "discriminating query, ESCALATE: the engineered semantic shift is now " +
      "visible to the real evaluator and the round-trip's wrongness is " +
      "confirmed (round-trip is buggy — the projector mis-routed the " +
      "class-expression's quantifier kind). Alternatively, if Phase 3's " +
      "evaluator gives the same answer regardless of kind-swap (i.e., the " +
      "auxiliary facts dominate the evaluation), the canary needs " +
      "STRENGTHENING — the engineered case wasn't actually detectable at " +
      "Phase 3 fidelity either, and the canary's design needs revision " +
      "before Phase 4 ARC content lands.",
  },

  meta: {
    verifiedStatus: "Verified",
    phase: 2,
    authoredAt: "2026-05-XX",
    authoredBy:
      "SME persona, Phase 2 Step 8 stub-evaluator + parity-canary path-fence-authoring pass",
    relatedFixtures: [
      "strategy_routing_direct (positive half of cross-section defense pair per Phase 2 entry packet §3.7 + §10.8 banked refinement)",
      "p1_restrictions_object_value (Phase 1 verified-status someValuesFrom/allValuesFrom/hasValue exerciser; this canary's input mirrors p1_restrictions_object_value's pattern at the SubClassOf-with-Restriction level)",
      "parity_canary_query_preservation (sibling parity canary — positive entailment preservation)",
      "parity_canary_negative_query (sibling parity canary — OWA preservation)",
    ],
    relatedSpecSections: [
      "spec §6.1.1 (Direct Mapping table — canonical strategy for SubClassOf-with-Restriction)",
      "spec §6.2 (strategy selection algorithm — Tier-2 dispatch)",
      "spec §6.3 (default OWA + closedPredicates option for Phase 3 reactivation)",
      "spec §8.1 (round-trip parity criterion)",
      "API §3.4 (Restriction class expressions — someValuesFrom/allValuesFrom kind discrimination)",
      "API §6.2 (folToOwl signature)",
      "API §6.3 (roundTripCheck — Step 7 shipped at 44447c9)",
      "API §7.1 (evaluate — Phase 3 deliverable; closedPredicates ships here)",
    ],
    relatedADRs: [
      "ADR-007 §1 (lifter emits classical FOL — informs default-OWA semantics under stub)",
    ],
    architectAuthorization:
      "Phase 2 entry packet §3.4 (architect-ratified 2026-05-06); §3.7 + §10.8 cross-section defense pair banking; architect Q3 ruling on stub-evaluator harness contract + Phase 3 re-exercise gate.",
  },
};

export const meta = fixture.meta;
