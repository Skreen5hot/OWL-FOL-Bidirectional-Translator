/**
 * Phase 2 fixture — NAF-residue Loss Signature emission canary.
 *
 * Per project/reviews/phase-2-entry.md §3.2 (architect-ratified 2026-05-06):
 *
 *   "deliberately constructed FOL state whose projection MUST emit a non-empty
 *    LossSignature with lossType: 'naf_residue' (severity rank 2). Tests both
 *    the Loss Signature emission AND the severity-ordering contract."
 *
 * Status: Draft. Authored at Phase 2 Step 4 spec-binding routing cycle
 * 2026-05-07; promoted to Verified at Phase 2 exit per the standard
 * AUTHORING_DISCIPLINE state-machine progression.
 *
 * ── Convention: projector-direct fixture ──────────────────────────────────
 *
 * This is the FIRST Phase 2 corpus entry whose `input` field is a FOL axiom
 * array (not an OWL ontology). The lifter is NOT invoked for this fixture;
 * the projector consumes `fixture.input` directly via folToOwl(input).
 *
 * Rationale: NAF-residue cannot arise from a lifter-derived FOL state because
 * the lifter emits classical FOL only (per ADR-007 §1's architectural
 * commitment "the lifter's emission discipline is classical-FOL-only"). To
 * exercise the projector's NAF-residue emission machinery, the fixture must
 * supply a FOL state directly — bypassing the lifter and signaling the
 * projector that the FOL's negation-context is unmarked (i.e., the projector
 * cannot prove the negation was lifter-derived classical).
 *
 * Manifest entry's `expectedOutcome` documents the projector-direct convention
 * so the test runner dispatches `fixture.input` to folToOwl rather than owlToFol.
 *
 * ── NAF-residue emission contract ──────────────────────────────────────────
 *
 * Per spec §6.4.1's naf_residue entry: "refutation lost" (severity rank 2 in
 * the frozen LOSS_SIGNATURE_SEVERITY_ORDER).
 *
 * Trigger condition: the projector encounters a fol:Negation over a predicate
 * IRI that is NOT registered in any loaded ARC module's known-relations
 * registry. The projector cannot determine whether the FOL was:
 *   (a) lifter-derived classical (round-trip clean — no actual loss);
 *   (b) hand-authored with NAF intent (round-trip lossy — classical projection
 *       loses the default-negation semantics).
 *
 * Conservative-emission policy: when in doubt, emit naf_residue. Downstream
 * consumers can choose to trust the classical projection or invoke the
 * RecoveryPayload to reconstitute the FOL with negation-context preserved.
 *
 * Banked principle (forward-tracked to AUTHORING_DISCIPLINE Phase 2 exit
 * doc-pass per the architect's Q-β cycle banking): "When the projector cannot
 * determine the negation's intended semantics, default to Annotated
 * Approximation with naf_residue. Direct Mapping is for cases where round-trip
 * equivalence is provably maintained." Generalization of the Q6 schema-
 * evolution discipline to projection-strategy discipline.
 *
 * ── Worked example ─────────────────────────────────────────────────────────
 *
 *   FOL input (1 axiom):
 *     ∀x. Person(x) → ¬KnownDriver(x)
 *
 *   Where:
 *     - Person and KnownDriver are predicate IRIs under
 *       http://example.org/test/p2_lossy_naf_residue/
 *     - KnownDriver is intentionally NOT bound by any loaded ARC module
 *       (the ARC ontology registry at v0.1.0 does not include it).
 *
 *   Expected projector output (Annotated Approximation strategy):
 *
 *     {
 *       ontology: {
 *         ...,
 *         tbox: [
 *           // Direct Mapping shape preserved for downstream consumers that
 *           // trust the classical projection — the ObjectComplementOf
 *           // form is structurally valid OWL 2 DL.
 *           {
 *             "@type": "SubClassOf",
 *             subClass: { "@type": "Class", iri: <Person> },
 *             superClass: { "@type": "ObjectComplementOf", class: { "@type": "Class", iri: <KnownDriver> } },
 *           },
 *         ],
 *       },
 *       lossSignatures: [
 *         {
 *           "@id": "ofbt:ls/<sha256-hex-of-canonical-input>",
 *           "@type": "ofbt:LossSignature",
 *           lossType: "naf_residue",
 *           relationIRI: "http://example.org/test/p2_lossy_naf_residue/KnownDriver",
 *           reason: "negation_over_unbound_predicate",
 *           reasonText: "Classical negation applied over a predicate not registered in any loaded ARC module's known-relations registry; cannot determine whether the source FOL was lifter-derived classical (round-trip clean) or hand-authored with NAF intent (round-trip lossy); precautionary Loss Signature emitted per spec §6.4.1 naf_residue contract.",
 *           provenance: { sourceGraphIRI: <fixture-IRI>, arcVersion: <arc-manifest-version> },
 *         },
 *       ],
 *       recoveryPayloads: [
 *         {
 *           "@id": "ofbt:rp/<sha256-hex-of-canonical-original-FOL>",
 *           "@type": "ofbt:RecoveryPayload",
 *           relationIRI: "http://example.org/test/p2_lossy_naf_residue/KnownDriver",
 *           approximationStrategy: "annotated-approximation",
 *           originalFOL: <the input FOL axiom verbatim>,
 *         },
 *       ],
 *       manifest: { ..., projectorVersion: "OFBT-0.1.0", operatingMode: "permissive" },
 *     }
 *
 * ── Round-trip behavior ────────────────────────────────────────────────────
 *
 * Re-lifting the projected OWL via owlToFol produces a classical FOL state
 * structurally byte-equivalent to fixture.input (the ObjectComplementOf
 * round-trips to fol:Negation). The "loss" recorded by naf_residue is
 * SEMANTIC, not structural: classical OWL under default OWA may not match
 * the original FOL's interpretation under a CWA-evaluator (Phase 3
 * `closedPredicates` per spec §6.3). The RecoveryPayload preserves the
 * original FOL state for downstream re-evaluation under whatever closed-
 * world configuration the consumer chooses.
 *
 * Per spec §7's regime taxonomy: this fixture is `reversible` — the round-
 * trip is structurally clean modulo the recovery payload that preserves the
 * NAF-discrimination signal.
 *
 * ── Phase 3 entry re-exercise ──────────────────────────────────────────────
 *
 * Per Phase 2 entry packet §3.4 (Q3 phase3Reactivation discipline) and §10.1
 * banked principle: this fixture's stub-evaluator-equivalent assertion (that
 * naf_residue is emitted) re-exercises against the real `evaluate()` at
 * Phase 3 entry. The phase3Reactivation field below names the re-exercise
 * contract.
 */

const PREFIX = "http://example.org/test/p2_lossy_naf_residue/";
const PERSON = PREFIX + "Person";
const KNOWN_DRIVER = PREFIX + "KnownDriver";
const VAR_X = { "@type": "fol:Variable", name: "x" };

/** @type {object} */
export const fixture = {
  /**
   * Projector-direct input: FOL axioms array (not OWL ontology).
   * Test runner dispatches via folToOwl(fixture.input), NOT owlToFol.
   */
  input: [
    // ∀x. Person(x) → ¬KnownDriver(x)
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Implication",
        antecedent: {
          "@type": "fol:Atom",
          predicate: PERSON,
          arguments: [VAR_X],
        },
        consequent: {
          "@type": "fol:Negation",
          inner: {
            "@type": "fol:Atom",
            predicate: KNOWN_DRIVER,
            arguments: [VAR_X],
          },
        },
      },
    },
  ],

  expectedOutcome: {
    summary:
      "Projection emits Annotated Approximation strategy with at least one " +
      "LossSignature carrying lossType: 'naf_residue', relationIRI matching " +
      "the negated-predicate IRI (KnownDriver), reason: " +
      "'negation_over_unbound_predicate', and a stable content-addressed " +
      "@id matching the regex /^ofbt:ls\\/[0-9a-f]{64}$/. The associated " +
      "RecoveryPayload preserves the original FOL universal-implication-with-" +
      "negation shape so re-lifting reconstitutes the FOL state for downstream " +
      "CWA-evaluator re-assessment per Phase 3.",
    projectionStrategy: "annotated-approximation",
    fixtureType: "projector-direct",
  },

  expectedLossSignatureReasons: ["negation_over_unbound_predicate"],

  intendedToCatch:
    "The projector silently emitting SubClassOf(Person, ObjectComplementOf(KnownDriver)) " +
    "as Direct Mapping (which is structurally valid OWL but loses the precautionary " +
    "naf_residue discrimination signal). Without the Loss Signature, downstream " +
    "consumers cannot distinguish a lifter-derived classical negation (round-trip " +
    "clean — no consumer-visible difference) from a hand-authored FOL state where " +
    "NAF/CWA semantics may be intended (round-trip lossy under a CWA-evaluator at " +
    "Phase 3). The naf_residue Loss Signature is the discrimination contract.",

  "expected_v0.1_verdict": {
    ringStatus: "ring2-passes-with-loss-signature",
    phaseAuthored: 2,
    phaseActivated: 2,
    expectedLossSignatures: [
      // Shape-fingerprint, NOT byte-exact: the @id depends on the SHA-256 hash
      // of the canonicalized input FOL, computed at projector emission time.
      // The test runner verifies regex match on @id + structural equality on
      // remaining fields. Per architect Q5 ruling 2026-05-06's schema-shape
      // recognition discipline + ADR-011 (RecoveryPayload @id content-addressing
      // — pending architect ratification per the Step 4 spec-binding routing cycle).
      {
        "@type": "ofbt:LossSignature",
        lossType: "naf_residue",
        relationIRI: KNOWN_DRIVER,
        reason: "negation_over_unbound_predicate",
        // @id pattern: /^ofbt:ls\/[0-9a-f]{64}$/
        // reasonText: free-text per spec §6.4.1 reasonText guidance; verified
        //   for non-empty content but not byte-exact equality.
        // provenance: { sourceGraphIRI, arcVersion }; verified for required-
        //   field presence but not byte-exact content.
      },
    ],
    expectedRecoveryPayloadCount: 1,
    expectedRoundTripBehavior: {
      reLiftEquivalence: "byte-equivalent-modulo-canonicalization",
      naf_residue_signal_present: true,
    },
  },

  "expected_v0.2_elk_verdict": null,

  /**
   * Phase 3 entry re-exercise per architect Q3 ruling 2026-05-06.
   * The stub-evaluator-equivalent assertion (naf_residue emitted) re-exercises
   * against the real evaluate() at Phase 3 entry. Phase 3 entry packet
   * authoring inherits the obligation per entry-packet §3.4's Phase 3 entry
   * gate item paragraph.
   */
  phase3Reactivation: {
    gatedOn: "real-evaluator-via-API-§7.1-with-closedPredicates-support",
    expectedOutcome:
      "evaluate(folInput, query: 'KnownDriver(alice)?', closedPredicates: ['KnownDriver']) returns 'true' (CWA-derived); evaluate(folInput, query: 'KnownDriver(alice)?') under default OWA returns 'undetermined'. The projection's RecoveryPayload preserves the FOL state needed for the CWA evaluation; re-lifting the projected OWL alone (under default OWA) cannot reach the CWA-derived 'true' verdict.",
    divergenceTrigger:
      "If real evaluate() under OWA returns 'true' (matching the CWA evaluation) where the stub-equivalent and the spec §6.3 default-OWA contract say 'undetermined', ESCALATE: open-world-preservation broken (a CWA assumption leaked through projection without the Loss Signature flagging it).",
  },

  meta: {
    verifiedStatus: "Verified",
    phase: 2,
    authoredAt: "2026-05-07",
    authoredBy: "SME persona, Phase 2 Step 4 spec-binding routing cycle",
    relatedFixtures: [
      "p1_complement_of",
      "p1_restrictions_cardinality",
    ],
    relatedADRs: [
      "ADR-007 §1 (lifter emits classical FOL — load-bearing for the projector-direct fixture convention)",
      "ADR-011 (pending — RecoveryPayload @id content-addressing scheme; Step 4 spec-binding cycle banking)",
    ],
    relatedSpecSections: [
      "spec §6.1.3 (Annotated Approximation strategy)",
      "spec §6.4.1 (LossSignature naf_residue contract)",
      "spec §7.2 (Loss Signature taxonomy)",
      "spec §7.3 (RecoveryPayload reversible-regime contract)",
      "spec §7.5 (content-addressed @id discipline)",
      "API §6.4 (audit artifact types)",
    ],
  },
};

export const meta = fixture.meta;
