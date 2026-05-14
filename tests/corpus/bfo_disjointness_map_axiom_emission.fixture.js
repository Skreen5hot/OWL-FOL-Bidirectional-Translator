/**
 * Phase 4 fixture — BFO Disjointness Map axiom emission (Step 4 unit-level).
 *
 * Per Phase 4 entry packet §3.3 + Q-4-Step4-A architect ruling 2026-05-11
 * (mid-phase architectural-gap micro-cycle):
 *
 *   "Step-N-bind fixture `bfo_disjointness_map_axiom_emission.fixture.js`
 *    per the SME's proposal — unit-level emission verification, distinct
 *    from the corpus-before-code consistency-rejection fixtures."
 *
 * Status: Draft (NEW Phase 4 authoring per Q-4-Step4-A); Step 4 binding;
 * promotes to Verified when Step 4 ships the disjointnessAxioms emission
 * path through arc-axiom-emitter.ts.
 *
 * ── Discrimination from nc_bfo_continuant_occurrent + canary_bfo_disjointness_silent_pass ──
 *
 * THIS fixture is unit-level emission verification (step-N-bind tier):
 * given a BFO ARC module with disjointnessAxioms field populated, the
 * lifter MUST emit pairwise binary FOL universal-implications with False
 * consequent per architect Q-4-Step4-A.1 ruling.
 *
 * `nc_bfo_continuant_occurrent` (corpus-before-code tier) is end-to-end
 * consistency-rejection: given Continuant(x) ∧ Occurrent(x), checkConsistency
 * returns `consistent: 'false'` via FOLFalse-in-head proof through Step 7.
 *
 * `canary_bfo_disjointness_silent_pass` (corpus-before-code tier) is the
 * regression-density catchall: checkConsistency MUST NOT return 'true' on
 * the multi-path KB; either 'false' or 'undetermined' acceptable.
 *
 * THIS fixture is upstream of both: it verifies the LIFTER emits the right
 * FOL axioms from the loaded disjointnessAxioms; downstream evaluation
 * (whether checkConsistency proves inconsistency) is the corpus-before-code
 * fixtures' scope. Unit-level emission separation from end-to-end semantic
 * verdict preserves the discipline at the appropriate audit granularity.
 *
 * ── What gets verified per Q-4-Step4-A.1 emitter implementation note ──
 *
 * Architect ruling 2026-05-11 (Q-4-Step4-A.1 implementation note):
 *
 *   "The emitter expands N-ary to pairwise binary axioms: disjointness({C₁,
 *    C₂, ..., Cₙ}) emits ∀x. Cᵢ(x) ∧ Cⱼ(x) → False for each pair (i < j).
 *    This is the standard OWL DisjointClasses semantics; preserves Horn-
 *    checkability per spec §8.5.1."
 *
 * The verification asserts both shape (the pairwise binary universal-
 * implication shape) AND coverage (every required pair appears).
 *
 * For the root Continuant ⊓ Occurrent binary axiom:
 *   - 1 pairwise binary FOL axiom expected:
 *     ∀x. Continuant(x) ∧ Occurrent(x) → False
 *
 * For the ternary IC/SDC/GDC axiom:
 *   - 3 pairwise binary FOL axioms expected (one per ordered pair i<j):
 *     ∀x. IC(x) ∧ SDC(x) → False
 *     ∀x. IC(x) ∧ GDC(x) → False
 *     ∀x. SDC(x) ∧ GDC(x) → False
 *
 * For the 4-ary Occurrent sub-partition axiom (Process/ProcessBoundary/
 * TemporalRegion/SpatiotemporalRegion):
 *   - 6 pairwise binary FOL axioms expected (C(4,2) = 6 pairs)
 *
 * General formula: an N-ary disjointnessAxiom emits N(N-1)/2 pairwise
 * binary axioms.
 *
 * ── Input shape ───────────────────────────────────────────────────────
 *
 * Empty input ontology (no TBox / ABox / RBox) — the fixture's purpose
 * is to verify that loading the BFO ARC module emits the disjointness
 * axioms from the ARC content alone, independent of input ontology
 * content. The lifter MUST emit the disjointnessAxioms-derived FOL
 * regardless of whether the input ontology references the BFO classes.
 *
 * (Distinction from `nc_bfo_continuant_occurrent`: that fixture asserts
 * Continuant(x) AND Occurrent(x) on an individual, exercising the
 * downstream consistency-rejection inference. THIS fixture verifies the
 * emission shape itself, with no input ontology content; the lifted FOL
 * state should contain the disjointness universal-implications regardless.)
 */

const PREFIX = "http://example.org/test/bfo_disjointness_map_axiom_emission/";
const BFO_CONTINUANT = "http://purl.obolibrary.org/obo/BFO_0000002";
const BFO_OCCURRENT = "http://purl.obolibrary.org/obo/BFO_0000003";
const BFO_INDEPENDENT_CONTINUANT = "http://purl.obolibrary.org/obo/BFO_0000004";
const BFO_SPECIFICALLY_DEPENDENT_CONTINUANT = "http://purl.obolibrary.org/obo/BFO_0000020";
const BFO_GENERICALLY_DEPENDENT_CONTINUANT = "http://purl.obolibrary.org/obo/BFO_0000031";
const BFO_PROCESS = "http://purl.obolibrary.org/obo/BFO_0000015";
const BFO_PROCESS_BOUNDARY = "http://purl.obolibrary.org/obo/BFO_0000035";
const BFO_TEMPORAL_REGION = "http://purl.obolibrary.org/obo/BFO_0000008";
const BFO_SPATIOTEMPORAL_REGION = "http://purl.obolibrary.org/obo/BFO_0000011";

/** @type {object} */
export const fixture = {
  /**
   * Empty input ontology — the disjointness axioms come from the loaded
   * BFO 2020 ARC module's disjointnessAxioms field (per Q-4-Step4-A
   * schema extension), not from the input.
   */
  input: {
    ontologyIRI: "http://example.org/test/bfo_disjointness_map_axiom_emission",
    prefixes: {
      bfo: "http://purl.obolibrary.org/obo/",
      ex: PREFIX,
    },
    tbox: [],
    abox: [],
    rbox: [],
  },

  loadOntologyConfig: {
    arcModules: ["core/bfo-2020"],
  },

  /**
   * Required-pattern assertions: each pairwise binary universal-implication
   * derived from the BFO Disjointness Map MUST appear in the lifted FOL
   * state. The patterns assert the canonical shape per Q-4-Step4-A.1
   * emitter implementation note.
   *
   * Coverage: this fixture asserts emission for 3 disjointnessAxioms from
   * `arc/core/bfo-2020.json` covering the binary + ternary + 4-ary cases:
   *   - Binary (Continuant_Occurrent_root): 1 pairwise axiom expected
   *   - Ternary (Continuant_subkinds IC/SDC/GDC): 3 pairwise axioms expected
   *   - 4-ary (Occurrent_subkinds Process/PB/TR/STR): 6 pairwise axioms expected
   *
   * Coverage of all 11 disjointnessAxioms is not required at unit-level;
   * the three classes (binary, ternary, 4-ary) exercise the pairwise-
   * expansion machinery sufficiently to discriminate against emission
   * failures.
   */
  requiredPatterns: [
    // Binary case: Continuant ⊓ Occurrent
    {
      description: "Continuant_Occurrent_root binary axiom: ∀x. Continuant(x) ∧ Occurrent(x) → False",
      pattern: {
        "@type": "fol:Universal",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Conjunction",
            conjuncts: [
              { "@type": "fol:Atom", predicate: BFO_CONTINUANT },
              { "@type": "fol:Atom", predicate: BFO_OCCURRENT },
            ],
          },
          consequent: { "@type": "fol:False" },
        },
      },
    },

    // Ternary case: IC/SDC/GDC pairwise expansion (3 pairs)
    {
      description: "Continuant_subkinds pair 1: ∀x. IndependentContinuant(x) ∧ SpecificallyDependentContinuant(x) → False",
      pattern: {
        "@type": "fol:Universal",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Conjunction",
            conjuncts: [
              { "@type": "fol:Atom", predicate: BFO_INDEPENDENT_CONTINUANT },
              { "@type": "fol:Atom", predicate: BFO_SPECIFICALLY_DEPENDENT_CONTINUANT },
            ],
          },
          consequent: { "@type": "fol:False" },
        },
      },
    },
    {
      description: "Continuant_subkinds pair 2: ∀x. IndependentContinuant(x) ∧ GenericallyDependentContinuant(x) → False",
      pattern: {
        "@type": "fol:Universal",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Conjunction",
            conjuncts: [
              { "@type": "fol:Atom", predicate: BFO_INDEPENDENT_CONTINUANT },
              { "@type": "fol:Atom", predicate: BFO_GENERICALLY_DEPENDENT_CONTINUANT },
            ],
          },
          consequent: { "@type": "fol:False" },
        },
      },
    },
    {
      description: "Continuant_subkinds pair 3: ∀x. SpecificallyDependentContinuant(x) ∧ GenericallyDependentContinuant(x) → False",
      pattern: {
        "@type": "fol:Universal",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Conjunction",
            conjuncts: [
              { "@type": "fol:Atom", predicate: BFO_SPECIFICALLY_DEPENDENT_CONTINUANT },
              { "@type": "fol:Atom", predicate: BFO_GENERICALLY_DEPENDENT_CONTINUANT },
            ],
          },
          consequent: { "@type": "fol:False" },
        },
      },
    },

    // 4-ary case: Occurrent sub-partition pairwise expansion (6 pairs = C(4,2))
    // Sampling 2 of the 6 pairs as load-bearing assertions on the pairwise-expansion machinery
    // (the other 4 are emitted by the same code path; spot-checking 2 discriminates against
    // the emission failure mode without over-asserting on canonical-ordering brittleness)
    {
      description: "Occurrent_subkinds pair Process×ProcessBoundary: ∀x. Process(x) ∧ ProcessBoundary(x) → False",
      pattern: {
        "@type": "fol:Universal",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Conjunction",
            conjuncts: [
              { "@type": "fol:Atom", predicate: BFO_PROCESS },
              { "@type": "fol:Atom", predicate: BFO_PROCESS_BOUNDARY },
            ],
          },
          consequent: { "@type": "fol:False" },
        },
      },
    },
    {
      description: "Occurrent_subkinds pair TemporalRegion×SpatiotemporalRegion: ∀x. TemporalRegion(x) ∧ SpatiotemporalRegion(x) → False",
      pattern: {
        "@type": "fol:Universal",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Conjunction",
            conjuncts: [
              { "@type": "fol:Atom", predicate: BFO_TEMPORAL_REGION },
              { "@type": "fol:Atom", predicate: BFO_SPATIOTEMPORAL_REGION },
            ],
          },
          consequent: { "@type": "fol:False" },
        },
      },
    },
  ],

  /**
   * Forbidden-pattern assertions: the wrong emission shapes MUST NOT
   * appear. Two failure modes guarded:
   *
   * 1. Symmetric direction emission (a pair emitted twice — once as
   *    (C_i, C_j) and once as (C_j, C_i)). Per Q-4-Step4-A.1 implementation
   *    note: "∀x. Cᵢ(x) ∧ Cⱼ(x) → False for each pair (i < j)" — pairs
   *    emitted in canonical i<j order; reverse-ordered duplicates are
   *    forbidden. (Detecting one reverse-ordered pair sample suffices to
   *    discriminate against the failure mode.)
   *
   * 2. N-ary single-axiom emission (instead of pairwise expansion). If
   *    the emitter naively encodes the N-ary disjointnessAxiom as a single
   *    FOL axiom with N conjuncts, the resulting axiom would have the
   *    shape `∀x. C₁(x) ∧ ... ∧ Cₙ(x) → False` — which is satisfiable as
   *    long as no individual is asserted to ALL N classes simultaneously
   *    (correct semantics requires NO individual asserted to any PAIR).
   *    The 3-conjunct shape on the IC/SDC/GDC axiom is the canonical
   *    failure pattern; if it appears, the N-ary emission is wrong.
   */
  forbiddenPatterns: [
    // Reverse-direction sample (Occurrent before Continuant in conjunction)
    {
      description:
        "Reverse-ordered binary axiom Occurrent×Continuant — the canonical-ordering discipline failure. Per Q-4-Step4-A.1 emitter implementation note: pairs emit in i<j canonical order; reverse-direction is the duplicate-emission failure mode.",
      pattern: {
        "@type": "fol:Universal",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Conjunction",
            conjuncts: [
              { "@type": "fol:Atom", predicate: BFO_OCCURRENT },
              { "@type": "fol:Atom", predicate: BFO_CONTINUANT },
            ],
          },
          consequent: { "@type": "fol:False" },
        },
      },
    },

    // N-ary single-axiom emission (3-conjunct on ternary IC/SDC/GDC)
    {
      description:
        "N-ary single-axiom emission on IC/SDC/GDC ternary — the pairwise-expansion failure mode where the emitter encodes the ternary disjointnessAxiom as a single 3-conjunct axiom instead of expanding to 3 pairwise binary axioms. Per Q-4-Step4-A.1 ruling: emitter MUST expand N-ary to N(N-1)/2 pairwise binary axioms.",
      pattern: {
        "@type": "fol:Universal",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Conjunction",
            conjuncts: [
              { "@type": "fol:Atom", predicate: BFO_INDEPENDENT_CONTINUANT },
              { "@type": "fol:Atom", predicate: BFO_SPECIFICALLY_DEPENDENT_CONTINUANT },
              { "@type": "fol:Atom", predicate: BFO_GENERICALLY_DEPENDENT_CONTINUANT },
            ],
          },
          consequent: { "@type": "fol:False" },
        },
      },
    },
  ],

  expectedOutcome: {
    summary:
      "Lift of an empty input ontology with BFO 2020 ARC module loaded produces lifted FOL containing the " +
      "pairwise binary universal-implication axioms derived from the BFO Disjointness Map per Q-4-Step4-A.1 " +
      "emitter implementation note. Spot-checked: (1) binary Continuant_Occurrent_root — 1 pairwise axiom; " +
      "(2) ternary Continuant_subkinds (IC/SDC/GDC) — 3 pairwise axioms; (3) 4-ary Occurrent_subkinds " +
      "(Process/PB/TR/STR) — 6 pairwise axioms (2 sampled). 6 requiredPatterns must match; 2 forbiddenPatterns " +
      "must NOT match.",
    fixtureType: "lift-correctness-with-arc-modules",
    canaryRole: "bfo-disjointness-map-axiom-emission-unit-level",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "Phase 4 Step 4 BFO Disjointness Map axiom emission failure modes: " +
    "(1) lifter loads disjointnessAxioms field but fails to emit any FOL axioms (Disjointness Map silently " +
    "dropped); (2) lifter emits N-ary single-axiom shape instead of pairwise-expanded binary shape per " +
    "Q-4-Step4-A.1 implementation note (consistency-rejection would fail on classical inconsistency because " +
    "no single individual triggers all N predicates); (3) lifter emits each pair twice (forward + reverse " +
    "direction) corrupting determinism + Step-7 proof structure; (4) lifter emits the wrong False-in-head " +
    "shape (e.g., universal-quantified disjunction instead of universal-quantified implication-to-False).",

  "expected_v0.1_verdict": {
    ringStatus: "ring1-lift-correctness-arc-content-extension-disjointness",
    phaseAuthored: 4,
    phaseActivated: 4,
    expectedRequiredPatternsMatched: 6,
    expectedForbiddenPatternsMatched: 0,
    discriminatesAgainst:
      "any Phase 4 Step 4 lifter that fails to emit pairwise binary universal-implications from the BFO " +
      "Disjointness Map loaded via disjointnessAxioms field per Q-4-Step4-A.1 ruling; any lifter that emits " +
      "N-ary single-axiom shape (3-conjunct on ternary disjointnessAxiom); any lifter that emits reverse-" +
      "ordered duplicate axioms (canonical-ordering discipline failure); any lifter that fails to emit " +
      "any disjointness FOL when the BFO ARC's disjointnessAxioms field is populated.",
  },

  "expected_v0.2_elk_verdict": null,

  meta: {
    verifiedStatus: "Draft",
    phase: 4,
    activationTiming: "step-N-bind",
    stepBinding: 4,
    corpusActivationTiming: "step-N-bind",
    authoredAt: "2026-05-11",
    authoredBy: "SME persona, Phase 4 Step 4 Q-4-Step4-A mid-phase architectural-gap micro-cycle path-fence-authoring per architect ruling 2026-05-11",
    relatedSpecSections: [
      "spec §3.4.1 (BFO Disjointness Map normative scope; lifter emits classical FOL with FOLFalse-in-head)",
      "spec §3.6.1 (BFO core ARC module scope; Disjointness Map is part of BFO core)",
      "spec §3.6.2 (arcModules parameter on LifterConfiguration; tree-shaking semantics)",
      "spec §8.5.1 (Horn-checkability scope for emitted axioms — pairwise binary axioms preserve Horn-checkability)",
    ],
    relatedADRs: [
      "ADR-007 §1 (lifter emits classical FOL — pairwise binary universal-implications consistent with classical-FOL discipline)",
      "ADR-007 §4 (decomposition convention for N-ary axioms into binary axioms)",
    ],
    relatedFixtures: [
      "nc_bfo_continuant_occurrent (Phase 4 corpus-before-code sibling: end-to-end consistency-rejection via FOLFalse-in-head on the same Continuant_Occurrent_root disjointness; activates via downstream consistency check)",
      "canary_bfo_disjointness_silent_pass (Phase 4 corpus-before-code sibling: regression-density catchall for silent-pass on BFO Disjointness Map; activates via MUST-NOT-be-true verdict)",
    ],
    architectAuthorization:
      "Q-4-Step4-A architect ruling 2026-05-11 + Q-4-Step4-A.1 N-ary semantics ruling + Q-4-Step4-A.2 simple-disjointness-only ruling + Q-4-Step4-A.3 disjointnessAxioms field naming ruling per `project/reviews/phase-4-step4-disjointness-schema.md`. Step 4 binding per architect Required-of-the-fixture-addition framing.",
  },
};

export const meta = fixture.meta;
