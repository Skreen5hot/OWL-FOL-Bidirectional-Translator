/**
 * Phase 4 fixture — No-Collapse adversarial canary: BFO Disjointness Map
 * firing on Continuant ⊓ Occurrent.
 *
 * Per ROADMAP §3.4 Phase 3 No-Collapse Adversarial Corpus + Phase 4 entry
 * packet §3.2 + Q-4-B architect ruling 2026-05-10 (corpus-before-code):
 *
 *   "nc_bfo_continuant_occurrent.fixture.js — gated on Phase 4 BFO ARC;
 *    Continuant ⊓ Occurrent disjointness from BFO Disjointness Map; MUST
 *    return consistent: 'false' once BFO ARC loaded; held as Draft fixture
 *    in Phase 3 corpus, activated in Phase 4."
 *
 * Status: Draft (held inactive at Phase 3 per ROADMAP gate); **activates
 * at Phase 4 entry per Q-4-B corpus-before-code ratification 2026-05-10**.
 * Promotes to Verified at Phase 4 exit when checkConsistency() against
 * loaded BFO 2020 ARC produces consistent: 'false' with the Continuant ⊓
 * Occurrent witness chain.
 *
 * ── Why this is the canonical Layer-B Horn-detectable inconsistency ──────
 *
 * BFO 2020's Disjointness Map declares Continuant (BFO_0000002) and
 * Occurrent (BFO_0000003) disjoint as a top-level mereological axiom of the
 * upper ontology: nothing is both a Continuant and an Occurrent (the
 * Continuant/Occurrent distinction is exclusive). When the loaded BFO ARC
 * declares this disjointness AND an individual is asserted to BOTH classes,
 * the lifted FOL contains:
 *
 *   ∀x. Continuant(x) ∧ Occurrent(x) → False    (BFO Disjointness axiom, lifted)
 *   Continuant(alice)                            (asserted)
 *   Occurrent(alice)                             (asserted)
 *
 * The contradiction is decidable in the Horn-checkable fragment per spec
 * §8.5.1 (FOLFalse-in-head clause + ABox witness; Phase 3 Step 7 FOLFalse-in-
 * head inconsistency proof handles the case directly). This is the **Layer
 * B analog** of Phase 3's `nc_self_complement` (Layer A Horn-decidable
 * inconsistency on equivalent-to-complement) — the canonical Phase-4
 * BFO-content adversarial case for the No-Collapse Guarantee.
 *
 * Discrimination from `p1_bfo_clif_classical` (Phase 3 Layer A consistency-
 * affirmation gap, pulled from `demo_p3.html` per Q-Frank-Step9-A Ask 1):
 * `p1_bfo_clif_classical` has NO individual asserted to both Continuant and
 * Occurrent — the v0.1 Horn-fragment classifier flags the disjointness as
 * `unverifiedAxioms` rather than affirming consistency (the documented v0.1
 * implementation gap with v0.2 ELK closure path per `project/v0.2-roadmap.md`
 * v0.2-01). THIS fixture has alice asserted to both — the disjointness
 * triggers; the contradiction proof fires; consistent: 'false' returns. The
 * consistency-rejection direction works in v0.1 (Step 7 FOLFalse-in-head
 * proof) regardless of the consistency-affirmation gap.
 *
 * ── Phase 4 Step binding ──────────────────────────────────────────────────
 *
 * Per Phase 4 entry packet §7 step ledger (per Q-4-A explicit-step-assignment
 * framing): Step 4 ships BFO Disjointness Map firings. This fixture activates
 * at Step 4; the Phase 4 demo's Case A canary (per Q-Frank-Step9-A Ask 7)
 * exercises this fixture as the BFO Disjointness Map firing demonstration.
 *
 * ── What this fixture catches ─────────────────────────────────────────────
 *
 * The canonical silent-pass failure mode for the No-Collapse Guarantee
 * against BFO Layer B content:
 *   - checkConsistency that misses the BFO Disjointness Map firing and
 *     returns consistent: 'true' (silent pass on Layer-B-decidable
 *     inconsistency)
 *   - Implementation that loads BFO ARC but fails to lift the Disjointness
 *     Map's commitments as FOLFalse-in-head axioms (ARC loader gap)
 *   - Implementation that lifts correctly but the Step 7 inconsistency proof
 *     fails to fire when the body's atoms are derived through Layer-B
 *     subsumption rather than asserted directly
 */

const PREFIX = "http://example.org/test/nc_bfo_continuant_occurrent/";
const BFO_CONTINUANT = "http://purl.obolibrary.org/obo/BFO_0000002";
const BFO_OCCURRENT = "http://purl.obolibrary.org/obo/BFO_0000003";
const ALICE = PREFIX + "alice";

/** @type {object} */
export const fixture = {
  /**
   * OWL ontology input — alice asserted to BOTH Continuant and Occurrent.
   * The BFO Disjointness Map (declared in the loaded BFO 2020 ARC) provides
   * the contradiction trigger; lifter materializes the disjointness as a
   * FOLFalse-in-head clause; Step 7 inconsistency proof fires.
   *
   * Note: this fixture's input does NOT carry the Disjointness axiom inline;
   * the Disjointness commitment lives in the loaded BFO ARC module per the
   * spec §3.4.1 framing. The fixture's expected outcome assumes
   * loadOntology(session, ontology, { arcModules: ['core/bfo-2020'] }) — the
   * test runner passes the arcModules parameter at runtime per Phase 4 ARC
   * module loader infrastructure (Step 1).
   */
  input: {
    ontologyIRI: "http://example.org/test/nc_bfo_continuant_occurrent",
    prefixes: {
      bfo: "http://purl.obolibrary.org/obo/",
      ex: PREFIX,
    },
    tbox: [],
    abox: [
      {
        "@type": "ClassAssertion",
        class: { "@type": "Class", iri: BFO_CONTINUANT },
        individual: ALICE,
      },
      {
        "@type": "ClassAssertion",
        class: { "@type": "Class", iri: BFO_OCCURRENT },
        individual: ALICE,
      },
    ],
    rbox: [],
  },

  /**
   * loadOntology config — declares the BFO 2020 ARC module dependency.
   * Phase 4 Step 1 ships the arcModules parameter on LifterConfiguration
   * per spec §3.6.2; the test runner passes this config when invoking
   * loadOntology against the input ontology.
   */
  loadOntologyConfig: {
    arcModules: ["core/bfo-2020"],
  },

  expectedOutcome: {
    summary:
      "checkConsistency on the lifted FOL state (with BFO 2020 ARC loaded) returns consistent: 'false'. " +
      "The BFO Disjointness Map declares Continuant ⊓ Occurrent disjoint; alice is asserted to both; " +
      "the lifted FOL contains the Disjointness axiom (∀x. Continuant(x) ∧ Occurrent(x) → False) plus " +
      "the two ClassAssertions. Step 7 FOLFalse-in-head inconsistency proof fires: the body Continuant(alice) " +
      "∧ Occurrent(alice) is provable from the asserted facts; the contradiction is decidable in the " +
      "Horn-checkable fragment per spec §8.5.1.",
    fixtureType: "consistency-check-with-arc-modules",
    expectedConsistencyResult: "false",
    expectedReason: "inconsistent",
    canaryRole: "no-collapse-adversarial-bfo-disjointness-map-layer-b",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "checkConsistency silently returning consistent: 'true' on the canonical BFO Disjointness Map " +
    "firing (Continuant ⊓ Occurrent on alice). Specific failure modes: (a) ARC loader fails to " +
    "lift the Disjointness Map's commitments as FOLFalse-in-head axioms; (b) Step 7 inconsistency " +
    "proof fails to fire when the body's atoms are derived through Layer-B subsumption rather than " +
    "asserted directly; (c) implementation correctly lifts but mis-classifies the Disjointness " +
    "axiom as non-Horn (per the Phase 3 Layer A consistency-affirmation gap forward-tracked to " +
    "v0.2 ELK closure per v0.2-roadmap.md v0.2-01) — note this fixture's case has the body " +
    "TRIGGERED by alice's dual assertion, so the consistency-rejection direction works in v0.1 " +
    "regardless of the affirmation-gap; the No-Collapse Guarantee MUST hold here.",

  "expected_v0.1_verdict": {
    ringStatus: "ring3-arc-content-extension-bfo-disjointness-firing",
    phaseAuthored: 3,
    phaseActivated: 4,
    expectedConsistencyResult: "false",
    expectedReason: "inconsistent",
    expectedUnverifiedAxiomsCount: 0,
    expectedWitnessPattern:
      "witness names alice + the lifted BFO Disjointness axiom (∀x. Continuant(x) ∧ Occurrent(x) → False) " +
      "+ both ClassAssertions; structurally: { individual: alice, axiom: <BFO Disjointness lifted form>, " +
      "contradictionStep: 'Continuant(alice) ∧ Occurrent(alice) ∧ (∀x. Continuant(x) ∧ Occurrent(x) → False)' }",
    discriminatesAgainst:
      "any checkConsistency implementation that returns consistent: 'true' (silent pass on canonical BFO " +
      "Disjointness Map firing); any implementation that returns 'undetermined' with coherence_indeterminate " +
      "(this case is decidable in the Horn-checkable fragment per spec §8.5.1; the body is triggered by " +
      "alice's dual assertion, so the FOLFalse-in-head proof at Step 7 fires)",
  },

  "expected_v0.2_elk_verdict": {
    notes:
      "ELK (EL profile) handles this case identically — Continuant ⊓ Occurrent disjointness with both " +
      "ClassAssertions on alice is an EL-decidable contradiction. v0.2 ELK integration validates the " +
      "v0.1 verdict without divergence.",
  },

  meta: {
    verifiedStatus: "Draft",
    phase: 4,
    activationTiming: "corpus-before-code",
    stepBinding: 4,
    authoredAt: "2026-05-10",
    authoredBy: "SME persona, Phase 4 entry packet Pass 2a authoring per Q-4-B architect ratification 2026-05-10",
    relatedSpecSections: [
      "spec §3.4.1 (Connected With + BFO Disjointness Map framing)",
      "spec §3.6.2 (arcModules parameter on LifterConfiguration)",
      "spec §8.5.1 (Horn-checkable fragment scope — simple disjointness is Horn-checkable per Q-Frank-Step9-A Banked Principle)",
      "spec §8.5.2 (FOLFalse-in-head inconsistency proof outcome ordering)",
      "API §8.1 (checkConsistency signature)",
    ],
    relatedADRs: [
      "ADR-009 (six-CCO-module expansion + BFO core ARC framing)",
      "ADR-013 (visited-ancestor cycle-guard pattern; not exercised by this fixture but BFO transitive predicates surface other Class instances)",
    ],
    relatedFixtures: [
      "nc_self_complement (Phase 3 Layer A Horn-decidable inconsistency analog; sibling discriminating outcome)",
      "p1_bfo_clif_classical (Phase 1 BFO Layer A subset; consistency-affirmation gap forward-tracked to v0.2 ELK per v0.2-roadmap.md v0.2-01; THIS fixture has the body TRIGGERED, so the rejection direction works in v0.1)",
      "canary_bfo_disjointness_silent_pass (Phase 4 sibling: silent-pass canary for BFO Disjointness Map; primary assertion is MUST-NOT-be-true)",
    ],
    architectAuthorization:
      "ROADMAP §3.4 Phase 3 No-Collapse Adversarial Corpus + Phase 4 entry packet §3.2 ratified 2026-05-10 (Q-4-B architect ruling); corpus-before-code per Q-4-B + Q-3-E split; Step 4 binding per Q-4-A explicit-step-assignment framing; canonical BFO Disjointness Map firing per ROADMAP Phase 3 No-Collapse Adversarial Corpus.",
  },
};

export const meta = fixture.meta;
