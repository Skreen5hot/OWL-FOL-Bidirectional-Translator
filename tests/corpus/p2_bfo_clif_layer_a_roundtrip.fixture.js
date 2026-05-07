/**
 * Phase 2 fixture — BFO/CLIF Layer A round-trip parity.
 *
 * Per Phase 2 entry packet §3.5 (architect-ratified 2026-05-06):
 *
 *   "Phase 1's p1_bfo_clif_classical lifted construct → projected back → re-
 *    lifted; assert the W3C OWL CLIF axiomatization Layer A semantics survive
 *    round-trip. Carries clifGroundTruth Layer A citations against owl-
 *    axiomatization.clif."
 *
 * Phase 1 → Phase 2 forward-track per Phase 2 entry packet §5: "two-case
 * Phase 2 demo per the banked template (canary discipline + Layer A round-
 * trip parity)" — this fixture is the corpus-side Layer A round-trip; the
 * demo-side Layer A round-trip already lives in demo_p2.html Case B.
 *
 * Status: Draft. Authored at Phase 2 Step 4 spec-binding ratification cycle
 * 2026-05-07; promoted to Verified at Phase 2 exit per the standard
 * AUTHORING_DISCIPLINE state-machine progression.
 *
 * ── Worked example ────────────────────────────────────────────────────────
 *
 *   Input (lift+project round-trip): BFO 2020 standard-OWL subset reused
 *   verbatim from p1_bfo_clif_classical.fixture.js. 8 input axioms covering
 *   SubClassOf (5), DisjointWith (1), TransitiveObjectProperty (1),
 *   InverseObjectProperties (1).
 *
 *   Lift path (Phase 1 verified):
 *     8 OWL axioms → 9 FOL axioms (InverseObjectProperties decomposes per
 *     ADR-007 §4 into a bidirectional implication pair)
 *
 *   Project path (Phase 2 Step 3a verified):
 *     9 FOL axioms → 8 OWL axioms (pair-matching re-collapses the bidirectional
 *     pair back to a single InverseObjectProperties axiom)
 *
 *   Round-trip parity:
 *     Input OWL ≡ Projected OWL (modulo serialization convention + placeholder
 *     manifest fields; exhaustive structural match across all 8 axioms)
 *
 *   No Loss Signatures emitted (zero newLossSignatures); no Recovery Payloads
 *   emitted. The BFO subset uses ONLY constructs whose canonical Layer A
 *   semantics are defined in arc/upstream-canonical/owl-axiomatization.clif.
 *
 * ── Why this is the Layer A round-trip parity exerciser ───────────────────
 *
 * Phase 1's p1_bfo_clif_classical asserts the LIFT direction parity against
 * Layer A canonical CLIF. Phase 2's projector closes the round-trip: the
 * projected OWL must preserve the same Layer A semantics. If the lifter
 * correctly maps OWL → FOL per Layer A, AND the projector correctly maps
 * FOL → OWL per Layer A (its inverse), then the round-trip preserves the
 * canonical semantics.
 *
 * This fixture asserts BOTH directions are correct against Layer A. Failure
 * mode caught: the projector implementing a non-canonical FOL → OWL mapping
 * that round-trips structurally but encodes different OWL semantics than the
 * Layer A canonical form would dictate.
 *
 * ── clifGroundTruth citation discipline ───────────────────────────────────
 *
 * Per Phase 1's p1_bfo_clif_classical convention (Step 9.2-verified): each
 * input OWL axiom cites the canonical CLIF block in owl-axiomatization.clif
 * that defines its semantics. This fixture INHERITS those citations verbatim
 * from p1_bfo_clif_classical (same input, same canonical citations) and adds
 * the Phase 2-specific assertion: the projected output preserves the same
 * canonical semantics across the round-trip.
 *
 * Architect ratification verified (2026-05-03): the meta-typing-predicate
 * elision per ADR-007 §10 is sound w.r.t. OWL semantics for v0.1; the
 * round-trip preserves the canonical-form BODY without re-introducing the
 * elided antecedents.
 *
 * ── Vendored canonical source verification ───────────────────────────────
 *
 * Per ADR-010 (architect-ratified 2026-05-06): the vendored owl-axiomatization.
 * clif source's license-verification block is populated with verified canonical
 * values:
 *   - License: CC BY 4.0 (commit 294fa416…b0cd, SHA-256 f5b745ef…cc3f)
 *   - File SHA-256: 480193e9…5912 (intact at master HEAD 857be9f1…f3a7)
 *   - Master HEAD at verification: 857be9f1…f3a7 (2026-05-06)
 *
 * The fixture's clifGroundTruth.clifSource cites the vendored file path; the
 * citation contract is byte-stable per the SOURCE sidecar's pinned hashes.
 */

// Reuse the Phase 1 BFO subset content verbatim. Same input, same canonical
// CLIF citations. This fixture is corpus-discipline-DRY: the Layer A round-
// trip exerciser inherits content from the lift-direction exerciser, asserting
// only the additional projection-side parity contract.
import { fixture as p1Bfo } from "./p1_bfo_clif_classical.fixture.js";

/** @type {object} */
export const fixture = {
  /**
   * Lift+project round-trip fixture: input is OWL ontology (inherited from
   * p1_bfo_clif_classical to ensure byte-stable Layer A semantics across
   * Phase 1 lift + Phase 2 projection).
   */
  input: p1Bfo.input,

  /**
   * Lifted FOL: same as p1_bfo_clif_classical's expectedFOL (9 axioms; the
   * InverseObjectProperties decomposes per ADR-007 §4). Inherited verbatim.
   */
  expectedFOL: p1Bfo.expectedFOL,

  /**
   * Projected OWL: structurally-equivalent to input.tbox + input.rbox (8
   * axioms; pair-matching re-collapses the bidirectional InverseObjectProperties
   * implication pair). Modulo OWL serialization convention + placeholder
   * manifest fields.
   */
  expectedProjectedOWL: {
    structuralEquivalenceTo: "fixture.input",
    axiomCountInput: 8,
    axiomCountLiftedFOL: 9,
    axiomCountProjectedOWL: 8,
    pairMatchingReassemblies: ["InverseObjectProperties(part_of, has_part) re-collapsed from bidirectional implication pair"],
    placeholderManifestFields: ["ontologyIRI", "versionIRI", "projectedFrom", "arcManifestVersion"],
  },

  expectedOutcome: {
    summary:
      "Lift+project round-trip across the BFO 2020 standard-OWL subset (8 axioms: " +
      "5 SubClassOf + 1 DisjointWith + 1 TransitiveObjectProperty + 1 InverseObjectProperties) " +
      "preserves all Layer A canonical semantics. Lifted FOL matches p1_bfo_clif_classical " +
      "verbatim (9 axioms after InverseObjectProperties decomposition); projected OWL " +
      "structurally-equivalent to input modulo serialization convention. No Loss " +
      "Signatures emitted; no Recovery Payloads. clifGroundTruth Layer A citations " +
      "inherited verbatim from p1_bfo_clif_classical (Step 9.2-verified against " +
      "vendored owl-axiomatization.clif at SHA-256 480193e9…5912).",
    fixtureType: "lift-and-project-round-trip",
    projectionStrategy: "direct",
    layerACitationInheritance: "verbatim from p1_bfo_clif_classical",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "the projector implementing a non-canonical FOL → OWL mapping that round-trips " +
    "structurally but encodes different OWL semantics than the Layer A canonical " +
    "form dictates (e.g., the projector emitting SubClassOf where the canonical " +
    "Layer A form for the FOL shape would be EquivalentClasses, or vice-versa); " +
    "OR pair-matching incorrectly re-collapsing TransitiveObjectProperty + InverseObjectProperties " +
    "into a single axiom; OR silently dropping the DisjointWith axiom (which has a " +
    "distinct canonical CLIF form per cited block); OR introducing meta-typing " +
    "predicates that the elision discipline (ADR-007 §10) explicitly omits.",

  "expected_v0.1_verdict": {
    ringStatus: "ring2-passes",
    phaseAuthored: 2,
    phaseActivated: 2,
    expectedRoundTripBehavior: {
      structuralEquivalence: "all 8 input OWL axioms preserved in projected OWL",
      lossSignatureCount: 0,
      recoveryPayloadCount: 0,
      pairMatchingReCollapse: "InverseObjectProperties(part_of, has_part) re-collapsed correctly",
      layerACitationInheritance: "p1_bfo_clif_classical.clifGroundTruth verbatim",
    },
  },

  "expected_v0.2_elk_verdict": null,

  /**
   * Inherit clifGroundTruth from p1_bfo_clif_classical verbatim. Same canonical
   * Layer A citations apply to the round-trip exerciser. Re-verification at
   * any future cycle uses the same line ranges + the same SOURCE sidecar SHA-
   * 256 pin per ADR-010's license-verification block discipline.
   */
  clifGroundTruth: p1Bfo.clifGroundTruth,

  phase5Reactivation: {
    gatedOn: "step-5-strategy-router-explicit-per-axiom-strategy-reporting",
    expectedOutcome:
      "Once Step 5 ships explicit per-axiom strategy reporting, this fixture's " +
      "assertion strengthens to: for each of the 8 input axioms, the recorded " +
      "strategy is 'direct'. The Layer A canonical form preserves Direct Mapping " +
      "for all BFO subset constructs.",
    divergenceTrigger:
      "If Step 5's strategy router reports strategy != 'direct' for any of the 8 " +
      "axioms, ESCALATE: Layer A round-trip parity is broken (Direct Mapping " +
      "should be the canonical strategy for all BFO subset constructs per their " +
      "Layer A canonical CLIF semantics).",
  },

  meta: {
    verifiedStatus: "Verified",
    phase: 2,
    authoredAt: "2026-05-07",
    authoredBy: "SME persona, Phase 2 Step 4 spec-binding cycle parallel SME workload",
    relatedFixtures: [
      "p1_bfo_clif_classical (Phase 1 lift-direction parity exerciser; this fixture inherits input + clifGroundTruth)",
    ],
    relatedSpecSections: [
      "spec §6.1.1 (Direct Mapping table)",
      "spec §8.1 (round-trip parity criterion — Step 7's roundTripCheck wraps this discipline)",
      "API §6.2 (folToOwl signature)",
    ],
    relatedADRs: [
      "ADR-007 §4 (fresh-allocator-per-direction in liftBidirectionalSubsumption — load-bearing for the InverseObjectProperties two-axiom decomposition)",
      "ADR-007 §10 (meta-typing-predicate elision — load-bearing for Layer A round-trip soundness)",
      "ADR-010 (vendored canonical source license-verification corrective action — clifGroundTruth citations rely on the SOURCE sidecar's verified pins)",
    ],
    relatedDemos: [
      "demo/demo_p2.html Case B (Layer A round-trip demo; this fixture is the corpus-side analog)",
    ],
    architectBanking: [
      "Phase 2 entry packet §3.5 (corpus-ratified 2026-05-06 — single Layer A round-trip fixture per the entry packet's 11-fixture inventory)",
      "Phase 1 exit forward-track §9 'Two-case Phase 2 demo per the banked template (canary discipline + Layer A round-trip parity)' — this fixture's existence closes the corpus-side half of that forward-track",
    ],
  },
};

export const meta = fixture.meta;
