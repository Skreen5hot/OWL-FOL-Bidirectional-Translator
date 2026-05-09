/**
 * Phase 3 fixture — No-Collapse adversarial canary: non-Horn incompleteness from
 * existential quantification.
 *
 * Per ROADMAP §3.4 + architect Q-3-E ratification 2026-05-08 (corpus-before-code):
 *
 *   "nc_horn_incomplete_existential.fixture.js — similar to disjunctive but the
 *    incompleteness arises from existential quantification the Horn fragment
 *    cannot witness; MUST return 'undetermined' with a different reason than
 *    the disjunctive case"
 *
 * Status: Draft. Authored corpus-before-code at Pass 2a 2026-05-08.
 *
 * ── Why this is non-Horn-incomplete from existential quantification ───────
 *
 * The KB shape:
 *   SubClassOf(A, ObjectSomeValuesFrom(R, B))    — every A has at least one R-related B
 *   SubClassOf(B, ObjectComplementOf(C))         — B's are not C
 *   SubClassOf(D, ObjectAllValuesFrom(R, C))     — every D's R-related things are all C
 *   EquivalentClasses(A, D)                       — A and D are the same class
 *   ClassAssertion(A, alice)
 *
 * Classical FOL semantics: A(alice) ∧ A ≡ D ∧ A ⊑ ∃R.B → ∃y. R(alice, y) ∧ B(y).
 * Same individual: D(alice) ∧ D ⊑ ∀R.C → ∀y. R(alice, y) → C(y). Combined:
 * R(alice, y) ∧ B(y) ∧ C(y), but B ⊑ ¬C, so B(y) ∧ ¬C(y) — contradiction with C(y).
 * The KB is classically inconsistent.
 *
 * The contradiction REQUIRES witnessing the existential's bound variable: the proof
 * must instantiate the ∃R.B with a Skolem witness y, then propagate the universal
 * ∀R.C to y, then derive the B(y) ∧ C(y) contradiction. The Horn-checkable fragment
 * cannot witness existentials — Horn clauses lack the existential-witnessing
 * machinery (Skolem-witness derivation per the architect-banked spec §6.3 + §7.1
 * coverage of evaluator semantics).
 *
 * ── Discrimination from nc_horn_incomplete_disjunctive ────────────────────
 *
 * Both produce 'undetermined' with `coherence_indeterminate` reason. The
 * discrimination is in `unverifiedAxioms` content + scope notes:
 *   - Disjunctive sibling: ObjectUnionOf in SubClassOf consequent + DisjointClasses
 *   - This fixture: ObjectSomeValuesFrom + ObjectAllValuesFrom + ObjectComplementOf
 *
 * The unverifiedAxioms field discriminates which non-Horn machinery is required
 * (case-analysis-on-disjunction vs Skolem-witness-derivation-from-existential).
 * Phase 3 evaluator's `evaluate()` per API §7.1 will witness existentials when
 * Skolem-witness derivation ships; until then, both cases stay 'undetermined'.
 *
 * ── What this fixture catches ─────────────────────────────────────────────
 *
 * Same silent-pass failure mode as the disjunctive case: implementation runs
 * Horn resolution, fails to derive inconsistent (because existential-witnessing
 * isn't a Horn capability), and returns consistent: true. Correct v0.1 verdict
 * is 'undetermined' with unverifiedAxioms naming the existential + universal
 * + complement axioms.
 *
 * Discrimination assertion: this fixture's unverifiedAxioms MUST contain the
 * existential-quantifier-in-consequent axiom, NOT just the disjunctive axiom
 * shape. A wrong unverifiedAxioms population that lists only disjunctive shapes
 * indicates the implementation fails to detect existential-witnessing as a
 * Horn-fragment escape.
 */

const PREFIX = "http://example.org/test/nc_horn_incomplete_existential/";
const A = PREFIX + "A";
const B = PREFIX + "B";
const C = PREFIX + "C";
const D = PREFIX + "D";
const R = PREFIX + "R";
const ALICE = PREFIX + "alice";

/** @type {object} */
export const fixture = {
  input: {
    ontologyIRI: "http://example.org/test/nc_horn_incomplete_existential",
    prefixes: { ex: PREFIX },
    tbox: [
      // SubClassOf(A, ObjectSomeValuesFrom(R, B)) — the existential-consequent
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: A },
        superClass: {
          "@type": "Restriction",
          onProperty: R,
          someValuesFrom: { "@type": "Class", iri: B },
        },
      },
      // SubClassOf(B, ObjectComplementOf(C))
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: B },
        superClass: {
          "@type": "ObjectComplementOf",
          class: { "@type": "Class", iri: C },
        },
      },
      // SubClassOf(D, ObjectAllValuesFrom(R, C))
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: D },
        superClass: {
          "@type": "Restriction",
          onProperty: R,
          allValuesFrom: { "@type": "Class", iri: C },
        },
      },
      // EquivalentClasses(A, D)
      {
        "@type": "EquivalentClasses",
        classes: [
          { "@type": "Class", iri: A },
          { "@type": "Class", iri: D },
        ],
      },
    ],
    abox: [
      { "@type": "ClassAssertion", class: { "@type": "Class", iri: A }, individual: ALICE },
    ],
    rbox: [],
  },

  expectedOutcome: {
    summary:
      "checkConsistency on the lifted FOL state returns consistent: 'undetermined' with " +
      "reason: 'coherence_indeterminate'. The unverifiedAxioms field is populated with the " +
      "existential SubClassOf, the universal SubClassOf, and the ObjectComplementOf SubClassOf " +
      "axioms (the three axioms whose interaction requires existential-witnessing the Horn " +
      "fragment cannot perform). Discriminates from the disjunctive sibling: unverifiedAxioms " +
      "contains existential-quantifier-in-consequent shapes, NOT ObjectUnionOf shapes.",
    fixtureType: "consistency-check",
    expectedConsistencyResult: "undetermined",
    expectedReason: "coherence_indeterminate",
    canaryRole: "no-collapse-adversarial-non-horn-existential-incompleteness",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "checkConsistency silently returning consistent: true when the input's inconsistency " +
    "requires existential-witnessing the Horn fragment cannot perform — the silent-pass failure " +
    "mode for non-Horn-via-existential incompleteness. Discrimination from the disjunctive " +
    "sibling fixture: this fixture also catches the case where unverifiedAxioms is populated " +
    "but only with disjunctive shapes (missing the existential trigger), indicating the " +
    "implementation fails to detect existential-witnessing as a Horn-fragment escape.",

  "expected_v0.1_verdict": {
    ringStatus: "ring3-passes-with-horn-incompleteness-surfaced-existential-flavor",
    phaseAuthored: 3,
    phaseActivated: 3,
    expectedConsistencyResult: "undetermined",
    expectedReason: "coherence_indeterminate",
    expectedUnverifiedAxiomsMinCount: 3,
    expectedUnverifiedAxiomsContains: [
      "SubClassOf(A, ObjectSomeValuesFrom(R, B)) — existential consequent",
      "SubClassOf(D, ObjectAllValuesFrom(R, C)) — universal consequent (paired)",
      "SubClassOf(B, ObjectComplementOf(C)) — complement axiom completing the contradiction",
    ],
    expectedUnverifiedAxiomsDoesNotContain: [
      "any ObjectUnionOf-in-consequent axiom (the disjunctive sibling's signature; this fixture's incompleteness is existential-flavored, not disjunctive)",
    ],
    discriminatesAgainst:
      "checkConsistency silently returning consistent: true (the silent-pass failure mode); " +
      "checkConsistency returning 'undetermined' with unverifiedAxioms populated only with " +
      "disjunctive-shape axioms (failure to detect existential-witnessing as Horn-escape)",
  },

  "expected_v0.2_elk_verdict": {
    notes:
      "ELK handles existentials within EL — ObjectSomeValuesFrom + ObjectAllValuesFrom (with " +
      "the appropriate cardinality bounds) are EL-decidable in some configurations. Whether v0.2 " +
      "ELK integration closes this fixture's verdict depends on whether the specific axiom shape " +
      "falls within ELK's EL profile. v0.2 entry packet ratification rules per fixture.",
  },

  meta: {
    verifiedStatus: "Verified",
    phase: 3,
    activationTiming: "corpus-before-code",
    stepBinding: 6,
    authoredAt: "2026-05-08",
    authoredBy: "SME persona, Phase 3 entry packet final ratification cycle Pass 2a authoring",
    relatedSpecSections: [
      "spec §8.5.1 (Horn-checkable fragment scope)",
      "spec §8.5.5 (surfacing Horn-fragment limit to consumers)",
      "API §7.1 (evaluate() — Skolem-witness derivation per Phase 3 deliverable)",
      "API §8.1.1 (unverifiedAxioms field)",
    ],
    relatedFixtures: [
      "nc_self_complement (Horn-decidable; in-fragment baseline)",
      "nc_horn_incomplete_disjunctive (other non-Horn-incomplete case; disjunctive flavor)",
    ],
    architectAuthorization:
      "Phase 3 entry packet §3.3 ratified 2026-05-08; corpus-before-code per Q-3-E split; " +
      "Step 6 binding; ROADMAP-named discrimination from disjunctive sibling.",
  },
};

export const meta = fixture.meta;
