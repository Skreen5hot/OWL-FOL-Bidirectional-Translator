/**
 * Phase 3 fixture — No-Collapse adversarial canary: class equivalent to its own complement.
 *
 * Per ROADMAP §3.4 Phase 3 No-Collapse Adversarial Corpus + architect Q-3-E ratification
 * 2026-05-08 (corpus-before-code, architectural-commitment-tier):
 *
 *   "nc_self_complement.fixture.js — class equivalent to its own complement;
 *    MUST return consistent: false with the equivalent-to-complement witness chain"
 *
 * Status: Draft. Authored corpus-before-code at Phase 3 entry packet final ratification
 * cycle 2026-05-08 (architect-ratified Q-3-E split: this is one of 4 No-Collapse adversarial
 * fixtures landing at Pass 2a). Promotes to Verified at Phase 3 exit when checkConsistency()
 * implementation is verified to produce consistent: false with the witness chain.
 *
 * ── Why this is the canonical Horn-detectable inconsistency ────────────────
 *
 * `EquivalentClasses(C, ObjectComplementOf(C))` declares that C is identical to its own
 * complement. In classical FOL: ∀x. (C(x) ↔ ¬C(x)) — a contradiction by the law of
 * non-contradiction (no individual can both be C and not be C). The Horn-fragment
 * resolution discipline catches this as a single-step proof of `inconsistent`:
 *
 *   1. Suppose Skolem witness c_C such that C(c_C) (asserting C is satisfiable)
 *   2. EquivalentClasses unfolds to: C(c_C) → ¬C(c_C) AND ¬C(c_C) → C(c_C)
 *   3. From (1) + (2): C(c_C) ∧ ¬C(c_C) → ⊥
 *
 * This contradiction is decidable in the Horn-checkable fragment per spec §8.5.1
 * because the inconsistency does not require disjunctive case-analysis or non-Horn
 * tableau reasoning; it is a direct proof from the axiom shape.
 *
 * ── What this fixture catches ─────────────────────────────────────────────
 *
 * The canonical silent-pass failure mode for the No-Collapse Guarantee: a checkConsistency
 * implementation that misses the equivalent-to-complement contradiction and returns
 * consistent: true. Specific failure modes:
 *   - Skolem-witness assertion not introduced for satisfiability check (the Horn-resolution
 *     check per spec §8.5.2 requires asserting a Skolem witness)
 *   - EquivalentClasses unfolding incomplete (only one direction of the iff resolved)
 *   - Resolution depth bound terminates before the contradiction is reached (spec §5.4
 *     bound applied too aggressively)
 *
 * ── spec §8.5 Horn-checkable contract reference ───────────────────────────
 *
 * This fixture is decidable within the Horn-checkable fragment per spec §8.5.1.
 * Expected outcome per spec §8.5.2 outcome table: "inconsistent provable → C is
 * unsatisfiable (under Horn-checkable axioms) → consistent: false." The
 * `unverifiedAxioms` field MUST be empty (no axioms outside the fragment).
 *
 * ── Phase 3 Step 6 binding ────────────────────────────────────────────────
 *
 * Per architect Q-3-A step ledger ratification 2026-05-08: Step 6 ships
 * checkConsistency() + No-Collapse Guarantee + unverifiedAxioms surface. This
 * fixture is exercised at Step 6 closure as the canonical Horn-detectable
 * inconsistency case.
 */

const PREFIX = "http://example.org/test/nc_self_complement/";
const PARADOX_CLASS = PREFIX + "ParadoxClass";

/** @type {object} */
export const fixture = {
  /**
   * OWL ontology input — single TBox axiom: EquivalentClasses(ParadoxClass,
   * ObjectComplementOf(ParadoxClass)). Lifted to FOL as the iff:
   * ∀x. (ParadoxClass(x) ↔ ¬ParadoxClass(x)).
   */
  input: {
    ontologyIRI: "http://example.org/test/nc_self_complement",
    prefixes: { ex: PREFIX },
    tbox: [
      {
        "@type": "EquivalentClasses",
        classes: [
          { "@type": "Class", iri: PARADOX_CLASS },
          {
            "@type": "ObjectComplementOf",
            class: { "@type": "Class", iri: PARADOX_CLASS },
          },
        ],
      },
    ],
    abox: [],
    rbox: [],
  },

  expectedOutcome: {
    summary:
      "checkConsistency on the lifted FOL state returns consistent: false. The witness " +
      "chain names ParadoxClass and the EquivalentClasses-with-ObjectComplementOf pattern " +
      "as the source of the contradiction. unverifiedAxioms MUST be empty (the inconsistency " +
      "is decidable in the Horn-checkable fragment per spec §8.5.1).",
    fixtureType: "consistency-check",
    expectedConsistencyResult: "false",
    expectedReason: "inconsistent",
    canaryRole: "no-collapse-adversarial-horn-detectable-inconsistency",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "checkConsistency silently returning consistent: true on the canonical equivalent-to-complement " +
    "contradiction; specific failure modes: Skolem-witness assertion not introduced (the Horn-resolution " +
    "check per spec §8.5.2 requires asserting a Skolem witness for satisfiability); EquivalentClasses " +
    "unfolding incomplete (only one direction of the iff resolved); resolution depth bound (spec §5.4) " +
    "terminates before the contradiction is reached. Each of these is a No-Collapse Guarantee violation " +
    "of the silent-pass class — the test suite would have surfaced an inconsistency that the implementation " +
    "missed, producing wrong downstream inferences against any KB containing equivalent-to-complement patterns.",

  "expected_v0.1_verdict": {
    ringStatus: "ring3-passes-with-horn-inconsistency-detected",
    phaseAuthored: 3,
    phaseActivated: 3,
    expectedConsistencyResult: "false",
    expectedReason: "inconsistent",
    expectedUnverifiedAxiomsCount: 0,
    expectedWitnessPattern:
      "witness names ParadoxClass + the EquivalentClasses-with-ObjectComplementOf axiom; " +
      "structurally: { class: ParadoxClass, axiom: <the EquivalentClasses node>, " +
      "contradictionStep: 'C(c) ∧ ¬C(c)' }",
    discriminatesAgainst:
      "any checkConsistency implementation that returns consistent: true (silent pass); " +
      "any implementation that returns 'undetermined' with coherence_indeterminate " +
      "(this case is decidable in the Horn-checkable fragment, NOT outside it)",
  },

  "expected_v0.2_elk_verdict": {
    notes:
      "ELK (EL profile) handles this case identically — equivalent-to-complement " +
      "contradiction is decidable in EL and produces the same consistent: false verdict. " +
      "v0.2 ELK integration validates the v0.1 Horn-checkable result without divergence.",
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
      "spec §8.5.2 (how the check is performed)",
      "spec §8.5.4 (limitations — sound for Horn-expressible contradictions)",
      "API §8.1 (checkConsistency signature)",
      "API §8.1.1 (unverifiedAxioms field)",
    ],
    relatedADRs: [
      "ADR-002 (no external OWL reasoner dependency for v0.1 validation)",
      "ADR-003 (structural round-trip parity as primary correctness criterion — the No-Collapse Guarantee per §8.5 is the orthogonal correctness criterion this fixture exercises)",
    ],
    architectAuthorization:
      "Phase 3 entry packet §3.3 ratified 2026-05-08; corpus-before-code per Q-3-E split; " +
      "Step 6 binding per Q-3-A step ledger ratification; canonical Horn-detectable inconsistency " +
      "per ROADMAP Phase 3 No-Collapse Adversarial Corpus.",
  },
};

export const meta = fixture.meta;
