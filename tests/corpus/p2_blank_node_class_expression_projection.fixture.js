/**
 * Phase 2 fixture — blank-node class-expression round-trip.
 *
 * Per Phase 2 entry packet §3.2 (architect-ratified 2026-05-06):
 *
 *   "Anonymous class expressions where the projector must reconstruct the
 *    b-node identifier (e.g., ObjectIntersectionOf(C1, ObjectSomeValuesFrom(P, C2))
 *    lifted through RDFC-1.0 to a Skolemized FOL state, then projected back
 *    to OWL — the projector must allocate b-nodes deterministically)."
 *
 * Status: Draft. Authored at Phase 2 Step 4 spec-binding ratification cycle
 * 2026-05-07; promoted to Verified at Phase 2 exit per the standard
 * AUTHORING_DISCIPLINE state-machine progression.
 *
 * ── Worked example ────────────────────────────────────────────────────────
 *
 *   Input axiom (lift+project round-trip):
 *     SubClassOf(
 *       Parent,
 *       ObjectIntersectionOf(
 *         ObjectSomeValuesFrom(hasChild, Person),
 *         ObjectAllValuesFrom(hasChild, Happy)
 *       )
 *     )
 *
 *   Lifted FOL (Step 3b's class-expression reconstruction):
 *     ∀x. Parent(x) → (
 *       (∃y. hasChild(x, y) ∧ Person(y))
 *       ∧
 *       (∀z. hasChild(x, z) → Happy(z))
 *     )
 *
 *   Projected back (Step 3b's class-expression reconstruction in reverse):
 *     SubClassOf(
 *       Parent,
 *       ObjectIntersectionOf(
 *         Restriction(onProperty: hasChild, someValuesFrom: Person),
 *         Restriction(onProperty: hasChild, allValuesFrom: Happy)
 *       )
 *     )
 *
 *   Round-trip parity: projected output is structurally-equivalent to input
 *   modulo OWL serialization convention (ObjectIntersectionOf vs Restriction
 *   nesting; placeholder ontologyIRI / projectedFrom strings).
 *
 * ── Why this exercises the blank-node CE projection path ──────────────────
 *
 * The ObjectIntersectionOf class expression has NO IRI of its own — it's an
 * anonymous (blank-node) class expression. Its sub-restrictions are also
 * anonymous. The projector must reconstruct the class-expression hierarchy
 * inline without inventing IRIs that the source ontology never declared.
 *
 * Step 3b's class-expression reconstruction handles this via recursive
 * descent into the FOL state's nested existential / universal / conjunction /
 * disjunction structures, mapping each FOL shape to its OWL anonymous-class-
 * expression equivalent. No fresh b-node IRIs are introduced (per ADR-007
 * §8's RDFC-1.0 b-node Skolem prefix discipline; b-node introduction only
 * arises for cardinality witnesses which are deferred to Step 4b).
 *
 * ── Phase 5 entry re-exercise ─────────────────────────────────────────────
 *
 * Per Phase 2 entry packet §10.1's banked phaseNReactivation discipline: this
 * fixture currently asserts ROUND-TRIP STRUCTURAL EQUIVALENCE only. Step 5's
 * strategy router will add explicit per-axiom strategy reporting; at Phase 5
 * entry re-exercise, this fixture's assertion strengthens to "strategy
 * chosen = 'direct'" alongside the structural assertion.
 */

const PREFIX = "http://example.org/test/p2_blank_node_class_expression_projection/";
const PARENT = PREFIX + "Parent";
const HAS_CHILD = PREFIX + "hasChild";
const PERSON = PREFIX + "Person";
const HAPPY = PREFIX + "Happy";

const VAR_X = { "@type": "fol:Variable", name: "x" };
const VAR_Y = { "@type": "fol:Variable", name: "y" };
const VAR_Z = { "@type": "fol:Variable", name: "z" };

/** @type {object} */
export const fixture = {
  /**
   * Lift+project round-trip fixture: input is OWL ontology (not FOL state).
   * Test runner dispatches via folToOwl(owlToFol(input)) for round-trip.
   */
  input: {
    ontologyIRI: "http://example.org/test/p2_blank_node_class_expression_projection",
    prefixes: {
      ex: PREFIX,
    },
    tbox: [
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: PARENT },
        superClass: {
          "@type": "ObjectIntersectionOf",
          classes: [
            {
              "@type": "Restriction",
              onProperty: HAS_CHILD,
              someValuesFrom: { "@type": "Class", iri: PERSON },
            },
            {
              "@type": "Restriction",
              onProperty: HAS_CHILD,
              allValuesFrom: { "@type": "Class", iri: HAPPY },
            },
          ],
        },
      },
    ],
    abox: [],
    rbox: [],
  },

  expectedOutcome: {
    summary:
      "Lift+project round-trip preserves the ObjectIntersectionOf anonymous class " +
      "expression with both Restriction sub-expressions intact. The projector " +
      "reconstructs the class-expression hierarchy via Step 3b's recursive descent " +
      "without inventing fresh b-node IRIs. Projected output is structurally-" +
      "equivalent to input modulo OWL serialization convention and placeholder " +
      "manifest fields.",
    fixtureType: "lift-and-project-round-trip",
    projectionStrategy: "direct",
  },

  expectedFOL: [
    // ∀x. Parent(x) → ((∃y. hasChild(x,y) ∧ Person(y)) ∧ (∀z. hasChild(x,z) → Happy(z)))
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Implication",
        antecedent: {
          "@type": "fol:Atom",
          predicate: PARENT,
          arguments: [VAR_X],
        },
        consequent: {
          "@type": "fol:Conjunction",
          conjuncts: [
            // ∃y. hasChild(x,y) ∧ Person(y)
            {
              "@type": "fol:Existential",
              variable: "y",
              body: {
                "@type": "fol:Conjunction",
                conjuncts: [
                  {
                    "@type": "fol:Atom",
                    predicate: HAS_CHILD,
                    arguments: [VAR_X, VAR_Y],
                  },
                  {
                    "@type": "fol:Atom",
                    predicate: PERSON,
                    arguments: [VAR_Y],
                  },
                ],
              },
            },
            // ∀z. hasChild(x,z) → Happy(z)
            {
              "@type": "fol:Universal",
              variable: "z",
              body: {
                "@type": "fol:Implication",
                antecedent: {
                  "@type": "fol:Atom",
                  predicate: HAS_CHILD,
                  arguments: [VAR_X, VAR_Z],
                },
                consequent: {
                  "@type": "fol:Atom",
                  predicate: HAPPY,
                  arguments: [VAR_Z],
                },
              },
            },
          ],
        },
      },
    },
  ],

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "the projector silently dropping one of the ObjectIntersectionOf sub-expressions " +
    "(emitting a single Restriction instead of the full intersection); collapsing the " +
    "intersection to ObjectUnionOf (semantic shift); inventing a fresh b-node IRI for " +
    "the anonymous ObjectIntersectionOf when the source ontology used inline nesting; " +
    "or losing the property+filler structure of either Restriction sub-expression.",

  "expected_v0.1_verdict": {
    ringStatus: "ring2-passes",
    phaseAuthored: 2,
    phaseActivated: 2,
    expectedRoundTripBehavior: {
      structuralEquivalence: "input ObjectIntersectionOf preserved with both Restriction sub-expressions intact",
      lossSignatureCount: 0,
      recoveryPayloadCount: 0,
    },
  },

  "expected_v0.2_elk_verdict": null,

  phase5Reactivation: {
    gatedOn: "step-5-strategy-router-explicit-per-axiom-strategy-reporting",
    expectedOutcome:
      "Once Step 5 ships explicit per-axiom strategy reporting (manifest.activity " +
      "or per-axiom annotation), this fixture's assertion strengthens to: " +
      "strategy chosen for the SubClassOf axiom = 'direct'. The Annotated " +
      "Approximation fallback path is NOT triggered (no Loss Signature emitted). " +
      "Re-exercises against the same input + expected-projected-output but adds " +
      "the explicit strategy assertion.",
    divergenceTrigger:
      "If Step 5's strategy router reports strategy != 'direct' (e.g., " +
      "'annotated-approximation' would mean Direct Mapping is incorrectly failing " +
      "for this case), ESCALATE: regression in Step 3b's class-expression " +
      "reconstruction.",
  },

  meta: {
    verifiedStatus: "Draft",
    phase: 2,
    authoredAt: "2026-05-07",
    authoredBy: "SME persona, Phase 2 Step 4 spec-binding cycle parallel SME workload",
    relatedFixtures: [
      "p1_restrictions_object_value",
      "p1_blank_node_anonymous_restriction",
    ],
    relatedSpecSections: [
      "spec §5.3 (TBox lifting)",
      "spec §6.1.1 (Direct Mapping)",
      "API §3.4 (Restriction class expressions)",
      "API §3.4.1 (ObjectIntersectionOf / ObjectUnionOf / ObjectComplementOf)",
      "ADR-007 §8 (RDFC-1.0 b-node Skolem prefix — informs projection path)",
    ],
  },
};

export const meta = fixture.meta;
