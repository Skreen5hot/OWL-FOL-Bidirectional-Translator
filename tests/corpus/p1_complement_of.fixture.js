/**
 * Phase 1 fixture: ObjectComplementOf class expression.
 *
 * Status: Draft. Per behavioral spec §5.3 and API §3.3:
 *   ObjectComplementOf(C) lifts to fol:Negation around the inner class's
 *   lifted form. Membership form: ¬C(t) for term t.
 *
 * SME B3 origin (Step 4 review observation): the lifter ships ObjectComplementOf
 * support via liftClassExpression's ComplementOf branch (Step 2 implementation),
 * but the Phase 1 entry corpus did not exercise the path. The Step 4 review
 * flagged this as a coverage gap; Step 9.1 closes the gap with this fixture
 * before Phase 1 exit.
 *
 * The fixture is intentionally minimal: a single SubClassOf axiom whose
 * superClass is an ObjectComplementOf of a NamedClass. The lifter emits the
 * canonical conditional-universal form with a fol:Negation as the consequent's
 * inner class membership.
 *
 * Worked example:
 *   Input axiom:  SubClassOf(NotPerson, ObjectComplementOf(Person))
 *   Lifted FOL:   ∀x. NotPerson(x) → ¬Person(x)
 *
 * Interaction with Phase 2 / Phase 3:
 *   - Phase 2 projector: classical fol:Negation projects to owl:complementOf
 *     under Direct Mapping. (NAF residue is a different concern; classical
 *     negation per spec §1.1 third axis is what this fixture exercises.)
 *   - Phase 3 evaluator: classical negation falls outside the Horn fragment;
 *     queries depending on it return coherence_indeterminate per spec §8.5
 *     honest-admission discipline. Banked for Phase 3 entry corpus authoring.
 *
 * Spec citation:
 *   - Behavioral §5.3 (TBox lifting; ObjectComplementOf membership form)
 *   - API §3.3 (ClassExpression union, ObjectComplementOf shape)
 *   - ADR-007 §1 (lifter emits classical FOL; classical-vs-NAF discrimination
 *     is Phase 2 projector / Phase 3 evaluator concern)
 *
 * Internal contract consistency (per AUTHORING_DISCIPLINE.md):
 *   - intent (this docstring + meta.intent) describes the canonical FOL form.
 *   - manifest's expectedOutcome.summary aligns.
 *   - expectedFOL below is byte-exact per the lifter's existing
 *     liftClassExpression ComplementOf branch.
 *
 * verifiedStatus: Draft until Phase 1 exit Step 9.5 promotes Draft → Verified
 * after the determinism harness (Step 9.3) confirms 100-run byte-stability.
 */

const NOT_PERSON = "http://example.org/test/NotPerson";
const PERSON = "http://example.org/test/Person";

const VAR_X = { "@type": "fol:Variable", name: "x" };

/** @type {object} */
export const fixture = {
  input: {
    ontologyIRI: "http://example.org/test/p1_complement_of",
    prefixes: { ex: "http://example.org/test/" },
    tbox: [
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: "http://example.org/test/NotPerson" },
        superClass: {
          "@type": "ObjectComplementOf",
          class: { "@type": "Class", iri: "http://example.org/test/Person" },
        },
      },
    ],
    abox: [],
    rbox: [],
  },
  expectedFOL: [
    // ∀x. NotPerson(x) → ¬Person(x)
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Implication",
        antecedent: {
          "@type": "fol:Atom",
          predicate: NOT_PERSON,
          arguments: [VAR_X],
        },
        consequent: {
          "@type": "fol:Negation",
          inner: {
            "@type": "fol:Atom",
            predicate: PERSON,
            arguments: [VAR_X],
          },
        },
      },
    },
  ],
};

export const meta = {
  fixtureId: "p1_complement_of",
  intent:
    "ObjectComplementOf class expressions must lift via liftClassExpression's ComplementOf branch to fol:Negation around the inner class's lifted form. The lifted FOL is classical negation (not NAF residue); classical-vs-NAF discrimination is the Phase 2 projector / Phase 3 evaluator's concern per ADR-007 §1's layer separation. Catches a lifter that drops ObjectComplementOf silently, lifts it as a positive atom on a synthesized 'NotPerson'-style predicate (semantic leak — fabricates a predicate the source did not declare), or routes complement to NAF rather than classical negation (would be a §1.1 third-axis violation surfacing only at Phase 3 evaluation).",
  verifiedStatus: "Verified",
};
