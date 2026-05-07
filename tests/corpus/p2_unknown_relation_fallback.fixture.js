/**
 * Phase 2 fixture — unknown_relation Loss Signature emission canary.
 *
 * Per architect Q-G ruling 2026-05-07 (Step 4 spec-binding routing cycle):
 *
 *   "Author one minimal p2_unknown_relation_fallback.fixture.js — a projector-
 *    direct fixture with a single property IRI explicitly outside the loaded
 *    ARC modules, expecting unknown_relation Loss Signature emission."
 *
 * Architect explicitly authorized +1 fixture as part of Step 4 ratification:
 * "Architect-ratified emission paths added during a phase justify minimal
 *  corresponding fixture additions to exercise them" (Q-G banked principle
 *  2026-05-07).
 *
 * Status: Draft. Authored at Phase 2 Step 4 spec-binding ratification cycle
 * 2026-05-07; promoted to Verified at Phase 2 exit per the standard
 * AUTHORING_DISCIPLINE state-machine progression.
 *
 * ── Convention: projector-direct fixture (mirrors p2_lossy_naf_residue) ───
 *
 * The `input` field is a FOL axioms array (not OWL ontology). Test runner
 * dispatches via folToOwl(fixture.input), bypassing the lifter. Same
 * convention as p2_lossy_naf_residue.fixture.js — authored at the same
 * ratification cycle.
 *
 * ── unknown_relation emission contract ────────────────────────────────────
 *
 * Per spec §6.4.1's unknown_relation entry: "fallback path applied"
 * (severity rank 5 in the frozen LOSS_SIGNATURE_SEVERITY_ORDER).
 *
 * Trigger condition: the projector encounters a predicate IRI that is NOT
 * registered in any loaded ARC module's known-relations registry. Direct
 * Mapping output is preserved (the OWL form is structurally valid); the
 * unknown_relation Loss Signature is INFORMATIONAL — it lets downstream
 * consumers know that the predicate has no ARC-content backing for further
 * semantic interpretation.
 *
 * Phase 2 permissive-registry semantics (per architect 2026-05-07): Phase 1
 * fixtures using the http://example.org/test/ namespace are tolerated by
 * Phase 2's permissive registry; the projector does NOT emit unknown_relation
 * for those predicates. This fixture uses a DELIBERATELY DISTINCT namespace
 * (http://example.org/p2-uncatalogued/) that is NOT in the permissive-tolerance
 * set, triggering unknown_relation emission.
 *
 * Implementation detail (Developer-domain at Step 4): the discrimination
 * mechanism between "permissive-tolerated" and "explicitly outside ARC" is
 * the Step 4 implementation's choice. Candidate mechanisms:
 *   (i)  namespace allowlist (test-prefix tolerated; other prefixes not);
 *   (ii) per-fixture projectorConfig flag (e.g., strictRegistryCheck: true);
 *   (iii) vocabulary-cache lookup with informational emission for cache misses
 *        in non-test prefixes.
 * The fixture documents the expected outcome; the Developer's Step 4
 * implementation chooses the trigger mechanism. This authoring is
 * config-agnostic.
 *
 * Banked principle (per architect Q-G banking 2026-05-07): "When emission
 * machinery is shared across multiple type variants, ship at least two type-
 * variant exercises in the first cycle that lands the machinery, even if
 * only one is corpus-mandatory." This fixture is the second variant
 * (alongside p2_lossy_naf_residue's naf_residue) exercising the Step 4
 * Loss Signature emission machinery.
 *
 * ── Worked example ────────────────────────────────────────────────────────
 *
 *   FOL input (1 axiom):
 *     uncatalogedRelation(alice, bob)
 *
 *   Where:
 *     - uncatalogedRelation is a binary predicate IRI under
 *       http://example.org/p2-uncatalogued/ (NOT in any loaded ARC module
 *       AND NOT in the Phase 2 permissive-tolerance namespace)
 *     - alice, bob are individual constants under the same namespace
 *
 *   Expected projector output:
 *
 *     {
 *       ontology: {
 *         ...,
 *         abox: [
 *           // Direct Mapping output preserved
 *           {
 *             "@type": "ObjectPropertyAssertion",
 *             property: "http://example.org/p2-uncatalogued/uncatalogedRelation",
 *             subject: "http://example.org/p2-uncatalogued/alice",
 *             object: "http://example.org/p2-uncatalogued/bob",
 *           },
 *         ],
 *       },
 *       lossSignatures: [
 *         {
 *           "@id": "ofbt:ls/<sha256-hex>",
 *           "@type": "ofbt:LossSignature",
 *           lossType: "unknown_relation",
 *           relationIRI: "http://example.org/p2-uncatalogued/uncatalogedRelation",
 *           reason: "predicate_iri_not_in_loaded_arc_modules",
 *           reasonText: "Predicate IRI not registered in any loaded ARC module at projector emission time; fallback path applied per spec §6.4 unknown_relation contract; downstream consumers may load additional ARC modules or accept the fallback projection.",
 *           provenance: { sourceGraphIRI: <fixture-IRI>, arcVersion: <arc-manifest-version> },
 *         },
 *       ],
 *       recoveryPayloads: [],  // unknown_relation does NOT emit a RecoveryPayload — Direct Mapping output is the recovery
 *       manifest: { ..., projectorVersion: "OFBT-0.1.0", operatingMode: "permissive" },
 *     }
 *
 * ── Round-trip behavior ───────────────────────────────────────────────────
 *
 * Re-lifting the projected OWL via owlToFol produces a FOL state byte-equivalent
 * to fixture.input (the ObjectPropertyAssertion round-trips to fol:Atom). The
 * Loss Signature is informational; round-trip is structurally clean.
 *
 * Per spec §7's regime taxonomy: this fixture is `equivalent` — the round-trip
 * is byte-clean modulo informational Loss Signature emission. The Loss Signature
 * does NOT indicate true information loss; it indicates "ARC content not loaded
 * for further semantic interpretation."
 *
 * Discrimination from `reversible` regime (e.g., p2_lossy_naf_residue): in
 * `reversible` regime, the RecoveryPayload preserves information needed for
 * downstream re-evaluation under different operational modes. In `equivalent`
 * regime with informational Loss Signatures, no RecoveryPayload is needed —
 * the Direct Mapping output is the full recovery.
 *
 * ── Phase 4 entry re-exercise ─────────────────────────────────────────────
 *
 * Phase 4 ships ARC content with the Verified state machine per spec §3.3.
 * In strict mode (Phase 4 entry default), unknown_relation transitions from
 * "informational" to "rejection" — predicate IRIs not in any loaded ARC module
 * trigger errors rather than informational Loss Signatures. This fixture's
 * phase4Reactivation field documents the re-exercise contract for that
 * transition.
 */

const PREFIX = "http://example.org/p2-uncatalogued/";
const UNCATALOGUED = PREFIX + "uncatalogedRelation";
const ALICE = PREFIX + "alice";
const BOB = PREFIX + "bob";

/** @type {object} */
export const fixture = {
  /**
   * Projector-direct input: FOL axioms array (not OWL ontology).
   * Test runner dispatches via folToOwl(fixture.input), NOT owlToFol.
   *
   * The input is a single binary atom representing an ObjectPropertyAssertion-
   * shaped FOL axiom with a property IRI deliberately outside the Phase 2
   * permissive-tolerance namespace.
   */
  input: [
    // uncatalogedRelation(alice, bob)
    {
      "@type": "fol:Atom",
      predicate: UNCATALOGUED,
      arguments: [
        { "@type": "fol:Constant", iri: ALICE },
        { "@type": "fol:Constant", iri: BOB },
      ],
    },
  ],

  expectedOutcome: {
    summary:
      "Projection emits Direct Mapping ObjectPropertyAssertion(uncatalogedRelation, alice, bob) " +
      "AND a single informational LossSignature carrying lossType: 'unknown_relation', " +
      "relationIRI matching the predicate IRI, reason: 'predicate_iri_not_in_loaded_arc_modules', " +
      "and a stable content-addressed @id matching /^ofbt:ls\\/[0-9a-f]{64}$/. " +
      "Per spec §7 regime taxonomy: equivalent (round-trip byte-clean modulo informational " +
      "Loss Signature). No RecoveryPayload emitted — Direct Mapping output is the full recovery.",
    projectionStrategy: "direct",
    fixtureType: "projector-direct",
    lossEmissionMode: "informational",
  },

  expectedLossSignatureReasons: ["predicate_iri_not_in_loaded_arc_modules"],

  intendedToCatch:
    "The projector silently emitting Direct Mapping output WITHOUT the informational " +
    "unknown_relation Loss Signature when the predicate IRI has no ARC-content backing. " +
    "Without the Loss Signature, downstream consumers cannot distinguish a predicate " +
    "with full ARC-content semantic backing (e.g., a BFO/CCO/IAO relation at Phase 4+) " +
    "from a predicate that round-tripped structurally but has no semantic interpretation " +
    "machinery available. Phase 4 strict-mode operation per spec §3.3 will require this " +
    "discrimination as a hard contract; Phase 2's informational emission lays the " +
    "groundwork.",

  "expected_v0.1_verdict": {
    ringStatus: "ring2-passes-with-informational-loss-signature",
    phaseAuthored: 2,
    phaseActivated: 2,
    expectedLossSignatures: [
      // Shape-fingerprint, NOT byte-exact: the @id depends on the SHA-256 hash
      // of the canonicalized discriminating fields per ADR-011 (architect-
      // ratified 2026-05-07). The test runner verifies regex match on @id +
      // structural equality on remaining fields.
      {
        "@type": "ofbt:LossSignature",
        lossType: "unknown_relation",
        relationIRI: UNCATALOGUED,
        reason: "predicate_iri_not_in_loaded_arc_modules",
        // @id pattern: /^ofbt:ls\/[0-9a-f]{64}$/
        // reasonText: free-text per spec §6.4.1 reasonText guidance; verified
        //   for non-empty content but not byte-exact equality.
        // provenance: { sourceGraphIRI, arcVersion }; verified for required-
        //   field presence but not byte-exact content.
      },
    ],
    expectedRecoveryPayloadCount: 0,
    expectedProjectionStrategy: "direct",
    expectedRoundTripBehavior: {
      reLiftEquivalence: "byte-equivalent-modulo-canonicalization",
      directMappingOutput: "ObjectPropertyAssertion preserved",
      informationalLossSignature: true,
    },
  },

  "expected_v0.2_elk_verdict": null,

  /**
   * Phase 4 entry re-exercise per spec §3.3 strict-mode operation. At Phase 4
   * entry, ARC content ships with Verified state machine; unknown_relation
   * transitions from informational (Phase 2) to rejection (Phase 4 strict
   * mode). Phase 4 entry packet authoring inherits the obligation to either
   * (a) load this fixture's namespace as ARC content (clearing the unknown_
   * relation trigger) OR (b) document the rejection-mode behavior as the
   * expected Phase 4 outcome.
   */
  phase4Reactivation: {
    gatedOn: "phase4-arc-content-loaded-with-strict-mode-default",
    expectedOutcome:
      "Under Phase 4 strict-mode operation per spec §3.3, the predicate IRI " +
      "http://example.org/p2-uncatalogued/uncatalogedRelation either (a) is " +
      "loaded as ARC content (this fixture's namespace promoted to a test ARC " +
      "module) and round-trips cleanly without unknown_relation emission, OR " +
      "(b) the projector throws a documented strict-mode rejection error per " +
      "spec §3.3's rejection contract. Phase 4 entry packet picks (a) or (b).",
    divergenceTrigger:
      "If Phase 4 strict mode silently emits informational unknown_relation " +
      "(Phase 2 behavior) where the strict-mode contract requires either ARC " +
      "loading OR rejection, ESCALATE: strict-mode promotion not propagated " +
      "from spec §3.3 to projector implementation.",
  },

  meta: {
    verifiedStatus: "Verified",
    phase: 2,
    authoredAt: "2026-05-07",
    authoredBy: "SME persona, Phase 2 Step 4 spec-binding ratification cycle (architect Q-G ruling 2026-05-07 +1 fixture authorization)",
    relatedFixtures: [
      "p2_lossy_naf_residue",
      "p1_abox_assertions",
    ],
    relatedADRs: [
      "ADR-011 (Accepted 2026-05-07 — audit-artifact @id content-addressing scheme; this fixture's expected @id format matches /^ofbt:ls\\/[0-9a-f]{64}$/ per ADR-011 §1)",
      "Phase 2 entry packet §10.1 (banked stub-evaluator → real-implementation re-exercise discipline; this fixture's phase4Reactivation field follows the same pattern, generalized to ARC-content-loading transition)",
    ],
    relatedSpecSections: [
      "spec §6.4 (unknown_relation contract — fallback path applied)",
      "spec §6.4.1 (LossSignature schema)",
      "spec §3.3 (Verified state machine + strict-mode operation)",
      "spec §7.2 (Loss Signature taxonomy — informational vs true-loss discrimination)",
      "API §6.4 (audit artifact types)",
    ],
    architectAuthorization:
      "Q-G ruling 2026-05-07 (Step 4 spec-binding ratification cycle): " +
      "'+1 fixture authorized to exercise the architect-ratified unknown_relation " +
      "emission path' — bounded scope, not corpus expansion in the speculative-" +
      "fixture sense.",
  },
};

export const meta = fixture.meta;
