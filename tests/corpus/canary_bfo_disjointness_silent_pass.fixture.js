/**
 * Phase 4 fixture — Silent-pass canary for BFO Disjointness Map (Layer B
 * analog of Phase 3's nc_silent_pass_canary).
 *
 * Per ROADMAP §3.4 Phase 4 Wrong-Translation Canary Set + Phase 4 entry
 * packet §3.2 + Q-4-B architect ruling 2026-05-10 (corpus-before-code):
 *
 *   "canary_bfo_disjointness_silent_pass.fixture.js — Continuant + Occurrent
 *    assertion on the same individual; asserts checkConsistency returns
 *    false with the BFO Disjointness Map witness, NOT silently true."
 *
 * Status: Draft (NEW Phase 4 authoring); promotes to Verified at Phase 4
 * exit when Step 4 (BFO Disjointness Map firings) ships.
 *
 * ── Discrimination from nc_bfo_continuant_occurrent (sibling) ──────────
 *
 * `nc_bfo_continuant_occurrent` is the canonical adversarial fixture for
 * BFO Disjointness Map firing — it asserts the implementation MUST return
 * `consistent: 'false'` with the witness chain. That fixture's primary
 * assertion is POSITIVE (explicit verdict + witness pattern).
 *
 * THIS fixture (canonical silent-pass catchall for BFO Layer B) asserts
 * the implementation MUST NOT return `consistent: 'true'`. The primary
 * assertion is NEGATIVE — the same regression-density discipline pattern
 * Phase 3's `nc_silent_pass_canary` operationalized for Layer A non-Horn
 * machinery, now applied to Layer B BFO content.
 *
 * Why two fixtures with overlapping outcomes? The discipline per Phase 3
 * Q-Frank-4 ratification:
 *   - The catchall canary's primary assertion is negative because the
 *     No-Collapse Guarantee's failure mode is *silent passing*, not falsely
 *     failing
 *   - A consistency checker that returns 'false' for the wrong reason
 *     (e.g., flagging Continuant ⊓ Occurrent as inconsistent because of an
 *     unrelated axiom) might pass `nc_bfo_continuant_occurrent`'s positive
 *     verdict assertion but fail this fixture's "MUST NOT be 'true' for
 *     the right reasons" implicit framing
 *   - Phase 4 demo's Case A canary (per Q-Frank-Step9-A Ask 7) exercises
 *     `nc_bfo_continuant_occurrent` directly; this canary stays in the
 *     test suite as the catchall regression-density check
 *
 * ── KB shape and Layer B inconsistency ──────────────────────────────────
 *
 * The KB shape mirrors `nc_bfo_continuant_occurrent` in its assertions but
 * adds compounded structure to make the silent-pass failure mode harder to
 * miss:
 *
 *   ClassAssertion(Continuant, alice)
 *   ClassAssertion(Occurrent, alice)
 *   ClassAssertion(Process, alice)            -- Process ⊑ Occurrent (BFO ARC)
 *   ObjectPropertyAssertion(part_of, alice, bob)
 *   ClassAssertion(Continuant, bob)
 *
 * Classical FOL: alice is Continuant + Occurrent + Process; BFO Disjointness
 * declares Continuant ⊓ Occurrent disjoint; alice is also part_of bob who is
 * Continuant. Multiple paths to the contradiction:
 *   Path 1: Continuant(alice) ∧ Occurrent(alice) → ⊥ (direct)
 *   Path 2: Process(alice) → Occurrent(alice) (subsumption) → contradicts Continuant(alice)
 *   Path 3: part_of_transitivity + alice ∈ Continuant ∩ Occurrent = ⊥
 *
 * The catchall MUST NOT silently pass: any one of the three paths fires
 * the contradiction. An implementation that misses all three is the silent-
 * pass failure mode this canary catches.
 *
 * Acceptable verdicts:
 *   ✓ consistent: 'false' (Step 7 FOLFalse-in-head proof reaches the
 *     contradiction via any path)
 *   ✓ consistent: 'undetermined' with populated unverifiedAxioms (the v0.1
 *     Horn-only path correctly admits Horn-fragment-escape if the BFO ARC's
 *     subsumption chains exceed the Horn-checkable fragment per spec §8.5.1
 *     — though Continuant ⊓ Occurrent itself is Horn-decidable, the
 *     compounded chains may surface non-Horn structure depending on the
 *     ARC content's depth)
 *
 * Unacceptable verdict:
 *   ✗ consistent: 'true' — the silent-pass failure mode this canary exists
 *     to catch
 *
 * ── What this fixture catches ─────────────────────────────────────────────
 *
 * The canonical SILENT-PASS failure mode for the No-Collapse Guarantee
 * against BFO Layer B content. Specific failure modes:
 *   - Implementation runs Horn resolution against the loaded BFO ARC,
 *     fails to derive `inconsistent`, and silently returns `consistent: 'true'`
 *   - Implementation has the Step 7 FOLFalse-in-head proof but the proof
 *     fails to fire when subsumption chains stretch across multiple BFO
 *     ARC entries
 *   - Implementation correctly detects the direct path (alice ∈ Continuant
 *     ∧ alice ∈ Occurrent) but fails on the indirect path (alice ∈ Process
 *     → alice ∈ Occurrent → contradicts Continuant)
 */

const PREFIX = "http://example.org/test/canary_bfo_disjointness_silent_pass/";
const BFO_CONTINUANT = "http://purl.obolibrary.org/obo/BFO_0000002";
const BFO_OCCURRENT = "http://purl.obolibrary.org/obo/BFO_0000003";
const BFO_PROCESS = "http://purl.obolibrary.org/obo/BFO_0000015"; // Process ⊑ Occurrent in BFO 2020
const BFO_PART_OF = "http://purl.obolibrary.org/obo/BFO_0000050";
const ALICE = PREFIX + "alice";
const BOB = PREFIX + "bob";

/** @type {object} */
export const fixture = {
  input: {
    ontologyIRI: "http://example.org/test/canary_bfo_disjointness_silent_pass",
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
      {
        "@type": "ClassAssertion",
        class: { "@type": "Class", iri: BFO_PROCESS },
        individual: ALICE,
      },
      {
        "@type": "ObjectPropertyAssertion",
        property: BFO_PART_OF,
        source: ALICE,
        target: BOB,
      },
      {
        "@type": "ClassAssertion",
        class: { "@type": "Class", iri: BFO_CONTINUANT },
        individual: BOB,
      },
    ],
    rbox: [],
  },

  loadOntologyConfig: {
    arcModules: ["core/bfo-2020"],
  },

  expectedOutcome: {
    summary:
      "checkConsistency on the lifted FOL state (with BFO 2020 ARC loaded) MUST NOT return consistent: 'true'. " +
      "Acceptable verdicts: 'false' (Step 7 FOLFalse-in-head proof reaches the contradiction via any of three " +
      "paths — direct Continuant∧Occurrent on alice; subsumption Process→Occurrent on alice; or part_of " +
      "interaction with the disjointness) OR 'undetermined' with populated unverifiedAxioms (if BFO ARC " +
      "subsumption chains exceed the Horn-checkable fragment). Unacceptable verdict: consistent: 'true' — the " +
      "silent-pass failure mode this canary catches.",
    fixtureType: "consistency-check-with-arc-modules",
    expectedConsistencyResultMustNotBe: "true",
    expectedConsistencyResultAcceptable: ["false", "undetermined"],
    canaryRole: "no-collapse-adversarial-bfo-disjointness-silent-pass-catchall",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "the canonical SILENT-PASS failure mode for the No-Collapse Guarantee against BFO Layer B content: " +
    "checkConsistency returning consistent: 'true' on a KB with multiple paths to a BFO Disjointness Map " +
    "contradiction. This fixture is the regression-density catch-all for the silent-pass class against " +
    "BFO content — it does not assert a SPECIFIC verdict ('false' vs 'undetermined' both acceptable) but " +
    "ASSERTS consistent: 'true' is wrong. Specific failure modes caught: (1) implementation runs Horn " +
    "resolution against loaded BFO ARC, fails to derive inconsistent, silently returns 'true'; (2) Step 7 " +
    "FOLFalse-in-head proof fails to fire when subsumption chains stretch across multiple BFO ARC entries; " +
    "(3) implementation detects the direct path (alice ∈ Continuant ∧ alice ∈ Occurrent) but fails on " +
    "indirect paths through subsumption or part_of.",

  "expected_v0.1_verdict": {
    ringStatus: "ring3-arc-content-extension-bfo-silent-pass-catchall",
    phaseAuthored: 4,
    phaseActivated: 4,
    expectedConsistencyResultMustNotBe: "true",
    expectedConsistencyResultAcceptable: ["false", "undetermined"],
    expectedUnverifiedAxiomsMinCountIfUndetermined: 1,
    discriminatesAgainst:
      "checkConsistency returning consistent: 'true' on this KB (the silent-pass failure mode); checkConsistency " +
      "returning 'undetermined' with empty unverifiedAxioms (violates spec §8.5.5)",
  },

  "expected_v0.2_elk_verdict": {
    notes:
      "v0.2 ELK + tableau extensions close any non-Horn pathways through subsumption chains. The canary's " +
      "MUST-NOT-be-true assertion holds across all v0.X versions — silent-pass on a classically-inconsistent " +
      "KB is always wrong, regardless of which mechanisms close the proof.",
  },

  meta: {
    verifiedStatus: "Draft",
    phase: 4,
    activationTiming: "corpus-before-code",
    stepBinding: 4,
    authoredAt: "2026-05-10",
    authoredBy: "SME persona, Phase 4 entry packet Pass 2a authoring per Q-4-B architect ratification 2026-05-10",
    relatedSpecSections: [
      "spec §3.4.1 (BFO Disjointness Map framing)",
      "spec §8.5.1 (Horn-checkable fragment scope)",
      "spec §8.5.2 (FOLFalse-in-head inconsistency proof outcome ordering)",
      "spec §8.5.5 (surfacing Horn-fragment limit to consumers)",
      "API §8.1 (checkConsistency signature)",
      "API §8.1.1 (unverifiedAxioms field)",
    ],
    relatedADRs: [
      "ADR-009 (six-CCO-module expansion + BFO core ARC framing)",
      "ADR-013 (visited-ancestor cycle-guard pattern)",
    ],
    relatedFixtures: [
      "nc_bfo_continuant_occurrent (Phase 4 sibling: positive-verdict canary; primary assertion is consistent: 'false')",
      "nc_silent_pass_canary (Phase 3 Layer A analog: silent-pass catchall for non-Horn machinery; THIS fixture is the BFO Layer B analog)",
      "p4_bfo_clif_layer_b (Phase 4 sibling: Layer B CLIF parity citations validate the lifted FOL semantics against canonical BFO 2020 CLIF)",
    ],
    architectAuthorization:
      "ROADMAP §3.4 Phase 4 Wrong-Translation Canary Set + Phase 4 entry packet §3.2 ratified 2026-05-10 (Q-4-B architect ruling); corpus-before-code per Q-4-B; Step 4 binding per Q-4-A explicit-step-assignment framing; Layer B silent-pass discipline analog to Phase 3 nc_silent_pass_canary per Q-Frank-4 publication discipline.",
  },
};

export const meta = fixture.meta;
