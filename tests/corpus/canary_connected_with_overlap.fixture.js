/**
 * Phase 4 fixture — Wrong-translation canary: Connected With as primitive
 * (NOT defined as overlap).
 *
 * ── Audit-trail header (per Q-4-Step5-A 2026-05-14 four-contract consistency discipline) ─
 *
 * (a) **Cycle reference:** Q-4-Step5-A architect ruling 2026-05-14
 *     (Phase 4 mid-phase architectural-gap micro-cycle 2/~3 per Q-4-A projection);
 *     routing-cycle artifact `project/reviews/phase-4-step5-connected-with-bridge.md`.
 *
 * (b) **SME-self-error origin** (per Q-4-Step5-A Banking 6 SME-self-error
 *     acknowledgment discipline): the original Phase 4 entry-packet path-fence-
 *     author 2026-05-10 introduced two errors caught at Phase 4 Step 5
 *     implementation reconnaissance 2026-05-14 (Developer-side complementary
 *     discipline to the verification ritual; the Q-4-G phase-boundary
 *     retroactive batch 2026-05-10 did NOT catch these errors per Cat 7
 *     reference-existence vs reference-consistency boundary):
 *       (i) IRI error: used RO_0002170 (RO "connected to") instead of
 *           spec §3.4 ratified cco:ont00001810 (CCO Connected With);
 *       (ii) axiom-shape error: requiredPattern `overlaps → connected_with`
 *            cited spec §3.4.1 but was NOT in §3.4.1's ratified axiom set
 *            (mathematically valid in BFO mereotopology but speculative wrt
 *            spec ratification per ADR-012 spec-literal framing discipline).
 *
 * (c) **Spec-literal alignment correction** (per Q-4-Step5-A.1 + Q-4-Step5-A.3
 *     architect rulings 2026-05-14):
 *       • REMOVED requiredPattern: ∀x,y. overlaps(x,y) → connected_with(x,y)
 *         (not in spec §3.4.1's ratified axiom set; speculative)
 *       • ADDED 3 spec-literal requiredPatterns per spec §3.4.1 lines 304-311
 *         ratified axiom set:
 *           - Reflexivity: ∀x. C(x, x)
 *           - Symmetry: ∀x,y. C(y, x) → C(x, y)
 *           - Parthood-extension bridge: ∀x,y,z. P(x, y) ∧ C(z, x) → C(z, y)
 *       • PRESERVED forbiddenPattern: reverse-direction connected_with → overlaps
 *         (wrong-translation canary; independent of forward-direction
 *         ratification; the defined-as-overlap collapse remains forbidden
 *         regardless of which spec axioms are ratified)
 *       • SWAPPED IRI: RO_0002170 → cco:ont00001810 per spec-literal canonical
 *
 * (d) **Corpus-as-contract anchor** (per Q-4-Step5-A.1 Banking 1 +
 *     Q-4-Step4-A Banking 3 symmetric application): Fixture-asserted
 *     patterns are bounded by spec-ratified content. Speculative patterns
 *     mathematically valid but not in the ratified axiom set defer to their
 *     natural surfacing-context cycle (v0.2 ELK closure, future-phase forcing
 *     case, fresh architect cycle). The fixture-amendment is editorial-
 *     correction-within-v0.1.7-freeze per the Pass 2b banking generalization.
 *
 * ── Status ───────────────────────────────────────────────────────────────
 *
 * Status: Draft (Phase 4 entry-packet authoring 2026-05-10; AMENDED at
 * Q-4-Step5-A 2026-05-14); promotes to Verified at Phase 4 exit when Step 5
 * ships Connected With primitive + spec-literal bridge axioms via the
 * bridgeAxioms field on ARCModule per Q-4-Step5-A.2 schema extension.
 *
 * ── Why Connected With as a primitive matters for v0.1 ───────────────────
 *
 * BFO 2020's mereotopological closure depends on Connected With as a
 * primitive predicate. Per spec §3.4: Connected With is declared primitive
 * in ARC and NOT defined as overlap (which conflates external connection
 * with overlap and produces wrong inferences in spatial reasoning).
 *
 * Per spec §3.4.1, the ratified axiom set for C in ARC is:
 *
 *   C(X, X)                                              [reflexivity]
 *   C(X, Y) :- C(Y, X)                                   [symmetry]
 *   C(Z, Y) :- P(X, Y), C(Z, X)                          [parthood-extension bridge]
 *   P(X, Z) :- P(X, Y), P(Y, Z)                          [parthood transitivity — Step 3]
 *
 * The first three are the bridge axioms Step 5 ships via the ARC content's
 * bridgeAxioms field (per Q-4-Step5-A.2 schema extension); the fourth is
 * already covered by Step 3's parthood transitivity emission.
 *
 * The wrong translation collapses Connected With to a defined-as-overlap
 * form: `connected_with(x, y) :=def overlaps(x, y)`. This lifting is wrong
 * because:
 *
 * 1. Connected With is NOT defined as overlap in BFO 2020 — it's a
 *    primitive. Two regions can be connected without overlapping (sharing
 *    a boundary without sharing parts).
 *
 * 2. The spec's bridge axiom set (reflexivity + symmetry + parthood-
 *    extension) gives Connected With its inferential reach without
 *    committing to the bad reduction. A biconditional connected_with ↔
 *    overlaps would corrupt BFO's mereotopological asymmetry (overlap
 *    implies connection but connection does NOT imply overlap).
 *
 * 3. Downstream inference relying on Connected With's primitive status
 *    (e.g., the parthood-extension bridge propagating connection through
 *    parthood chains) would silently fail under the wrong translation.
 *
 * The wrong-translation canary asserts that the Phase 4 lifter emits
 * Connected With as a primitive predicate atom + the 3 spec-literal bridge
 * axioms loaded from the ARC content's bridgeAxioms field, NOT as a
 * defined-as-overlap predicate.
 *
 * ── Phase 4 Step binding ──────────────────────────────────────────────────
 *
 * Per Phase 4 entry packet §7 step ledger: Step 5 ships Connected With as
 * primitive + spec-literal bridge axioms (per Q-4-Step5-A.1 + Q-4-Step5-A.2
 * + Q-4-Step5-A.3 architect rulings 2026-05-14). This canary fixture
 * validates Step 5's lift correctness via assertRequiredPattern (4 patterns)
 * + assertForbiddenPatterns (1 pattern).
 *
 * ── What this fixture catches ─────────────────────────────────────────────
 *
 * The silent-failure failure mode for mereotopological closure: a Phase 4
 * lifter that conflates Connected With with overlap OR fails to emit the
 * spec-literal bridge axioms. Specific failure modes:
 *
 *   - Lifter pattern-matches Connected With as a definitional axiom and
 *     emits the wrong defined-as-overlap form (caught by forbiddenPattern)
 *   - Lifter correctly emits Connected With as a primitive atom but FAILS
 *     to emit the spec-literal bridge axioms from ARC content (caught by
 *     the 3 spec-literal requiredPatterns)
 *   - Lifter emits both directions of a defined-as-overlap form
 *     (connected_with ↔ overlaps) — the biconditional shape corrupts BFO's
 *     mereotopological asymmetry (caught by forbiddenPattern)
 */

const PREFIX = "http://example.org/test/canary_connected_with_overlap/";
const BFO_REGION = "http://purl.obolibrary.org/obo/BFO_0000006"; // SpatialRegion
const BFO_CONTINUANT_PART_OF = "http://purl.obolibrary.org/obo/BFO_0000176"; // P (continuant_part_of; parthood per spec §3.4.1 bridge axiom)
// CCO Connected With per spec §3.4 canonical cco:ont00001810. Verified at
// Pass 2b vendoring-analog-time 2026-05-15 against
// CommonCoreOntologies/CommonCoreOntologies@develop/src/cco-modules/
// ExtendedRelationOntology.ttl: cco: prefix maps to
// https://www.commoncoreontologies.org/ (per @prefix declaration).
const CCO_CONNECTED_WITH = "https://www.commoncoreontologies.org/ont00001810"; // Connected With per spec §3.4 ratified canonical IRI
// Overlaps remains at RO_0002131 per fixture's input ABox (overlaps assertion);
// architect Q-4-Step5-A.3 ruling specifically addressed Connected With IRI; the
// fixture's overlaps assertion in the input is not the spec-ratified axiom
// surface (it's input ontology content the lifter receives).
const RO_OVERLAPS = "http://purl.obolibrary.org/obo/RO_0002131"; // overlaps (input ABox; not in spec-ratified axiom set)
const REGION_A = PREFIX + "region_a";
const REGION_B = PREFIX + "region_b";

/** @type {object} */
export const fixture = {
  /**
   * OWL ontology input — two regions; one assertion of overlaps. The BFO
   * 2020 ARC content (loaded via arcModules) provides the 3 spec-literal
   * bridge axioms (reflexivity + symmetry + parthood-extension) per
   * Q-4-Step5-A.2 schema extension's bridgeAxioms field on ARCModule.
   *
   * The input ABox's overlaps assertion is independent of the requiredPatterns
   * (which assert structural shapes of FOL emitted from ARC content). The
   * overlaps input remains the wrong-translation-canary discrimination
   * surface: a lifter that wrongly conflates connected_with with overlap
   * would emit a reverse-direction implication (connected_with → overlaps)
   * caught by the forbiddenPattern below.
   */
  input: {
    ontologyIRI: "http://example.org/test/canary_connected_with_overlap",
    prefixes: {
      bfo: "http://purl.obolibrary.org/obo/",
      ro: "http://purl.obolibrary.org/obo/",
      cco: "https://www.commoncoreontologies.org/", // Verified at Pass 2b vendoring-analog-time 2026-05-15 against CommonCoreOntologies/CommonCoreOntologies@develop/src/cco-modules/ExtendedRelationOntology.ttl @prefix declaration
      ex: PREFIX,
    },
    tbox: [],
    abox: [
      {
        "@type": "ClassAssertion",
        class: { "@type": "Class", iri: BFO_REGION },
        individual: REGION_A,
      },
      {
        "@type": "ClassAssertion",
        class: { "@type": "Class", iri: BFO_REGION },
        individual: REGION_B,
      },
      {
        "@type": "ObjectPropertyAssertion",
        property: RO_OVERLAPS,
        source: REGION_A,
        target: REGION_B,
      },
    ],
    rbox: [],
  },

  loadOntologyConfig: {
    arcModules: ["core/bfo-2020"],
  },

  /**
   * Required-pattern assertions (4 patterns; amended per Q-4-Step5-A.1
   * architect ruling 2026-05-14 from the original 2 patterns):
   *
   * 1. Connected With present as primitive binary atom — guards against
   *    the lifter dropping the predicate entirely
   *
   * 2-4. Three spec-literal bridge axioms per spec §3.4.1 lines 304-311
   *    ratified axiom set, emitted from the ARC content's bridgeAxioms
   *    field per Q-4-Step5-A.2 schema extension:
   *      - Reflexivity: ∀x. C(x, x) — Universal body = Atom (no Implication)
   *      - Symmetry: ∀x,y. C(y, x) → C(x, y) — Universal body = Implication
   *        where both antecedent + consequent atoms have C predicate
   *      - Parthood-extension: ∀x,y,z. P(x, y) ∧ C(z, x) → C(z, y) —
   *        Universal body = Implication where antecedent = Conjunction of
   *        P + C atoms, consequent = C atom
   */
  requiredPatterns: [
    {
      description: "Connected With present as primitive binary atom (NOT defined as overlap; Q-4-Step5-A.1 + Q-4-Step5-A.3 amendment preserves structural-presence guard)",
      pattern: {
        "@type": "fol:Atom",
        predicate: CCO_CONNECTED_WITH,
      },
    },
    {
      description: "Spec §3.4.1 ratified axiom: reflexivity C(X, X) — ∀x. C(x, x). Emitted from ARC content's bridgeAxioms[axiomForm:'reflexivity'] per Q-4-Step5-A.2.1 discriminated-union schema. Structural shape: Universal body is a Connected-With Atom (NO Implication wrapper).",
      pattern: {
        "@type": "fol:Universal",
        body: {
          "@type": "fol:Atom",
          predicate: CCO_CONNECTED_WITH,
        },
      },
    },
    {
      description: "Spec §3.4.1 ratified axiom: symmetry C(X, Y) :- C(Y, X) — ∀x,y. C(y, x) → C(x, y). Emitted from ARC content's bridgeAxioms[axiomForm:'symmetry']. Structural shape: Universal body is Implication where both antecedent + consequent are Connected-With Atoms (per Q-4-Step5-A.2.1 emitter implementation note; canonical emission shape per Prolog clause form).",
      pattern: {
        "@type": "fol:Universal",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Atom",
            predicate: CCO_CONNECTED_WITH,
          },
          consequent: {
            "@type": "fol:Atom",
            predicate: CCO_CONNECTED_WITH,
          },
        },
      },
    },
    {
      description: "Spec §3.4.1 ratified axiom: parthood-extension bridge C(Z, Y) :- P(X, Y), C(Z, X) — ∀x,y,z. P(x, y) ∧ C(z, x) → C(z, y). Emitted from ARC content's bridgeAxioms[axiomForm:'parthood-extension']. Structural shape: Universal body is Implication where antecedent is Conjunction of P-Atom + C-Atom, consequent is C-Atom. This is the spec-named 'bridge axiom' that propagates connection through parthood chains (the load-bearing semantic surface for BFO mereotopological closure).",
      pattern: {
        "@type": "fol:Universal",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Conjunction",
            conjuncts: [
              { "@type": "fol:Atom", predicate: BFO_CONTINUANT_PART_OF },
              { "@type": "fol:Atom", predicate: CCO_CONNECTED_WITH },
            ],
          },
          consequent: {
            "@type": "fol:Atom",
            predicate: CCO_CONNECTED_WITH,
          },
        },
      },
    },
  ],

  /**
   * Forbidden-pattern assertions (1 pattern; preserved across Q-4-Step5-A
   * amendment per architect ruling 2026-05-14): the wrong defined-as-overlap
   * form MUST NOT appear in the lifted FOL state. Per ADR-007 §1 + §4:
   * biconditionals decompose into two universal-implications in classical
   * FOL emission. The wrong translation manifests as the reverse-direction
   * implication `connected_with → overlaps`. Detecting the reverse-direction
   * implication's presence is sufficient to catch the biconditional/symmetric
   * defined-as-overlap emission.
   *
   * The forbiddenPattern is INDEPENDENT of the forward-direction ratification
   * status (per architect Q-4-Step5-A.1 ruling): even though the forward-
   * direction overlaps→connected_with is no longer a requiredPattern (per the
   * spec-literal amendment), the reverse-direction connected_with→overlaps
   * remains forbidden — the wrong-translation canary discipline is preserved
   * through the forbiddenPattern surface regardless of which spec axioms are
   * ratified in the forward direction.
   *
   * (Prior verification ritual finding 2026-05-10 Cat 5: original draft used
   * `fol:Biconditional` which does NOT exist in the canonical FOL @type set
   * per src/kernel/fol-types.ts; corrected to reverse-direction `fol:Implication`
   * pattern per ADR-007 §4 decomposition convention. Preserved at this Q-4-Step5-A
   * amendment.)
   */
  forbiddenPatterns: [
    {
      description:
        "Reverse-direction implication connected_with(x, y) → overlaps(x, y) — the wrong-direction bridge axiom that would corrupt mereotopological closure. The defined-as-overlap collapse is forbidden regardless of which spec axioms are ratified in the forward direction (independent of Q-4-Step5-A.1 amendment). If this fires, the lifter has emitted the biconditional/symmetric defined-as-overlap form (per ADR-007 §4 decomposition).",
      pattern: {
        "@type": "fol:Universal",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Atom",
            predicate: CCO_CONNECTED_WITH,
          },
          consequent: {
            "@type": "fol:Atom",
            predicate: RO_OVERLAPS,
          },
        },
      },
    },
  ],

  expectedOutcome: {
    summary:
      "Phase 4 lift of an ontology asserting overlaps(region_a, region_b), with BFO 2020 ARC loaded (including bridgeAxioms field per Q-4-Step5-A.2 schema extension), produces lifted FOL containing: (1) the Connected With (cco:ont00001810) primitive predicate atom in the predicate-call graph; (2) reflexivity C(X, X) emitted from bridgeAxioms[axiomForm:'reflexivity']; (3) symmetry C(X, Y) :- C(Y, X) emitted from bridgeAxioms[axiomForm:'symmetry']; (4) parthood-extension bridge C(Z, Y) :- P(X, Y), C(Z, X) emitted from bridgeAxioms[axiomForm:'parthood-extension']; AND (5) NO reverse-direction connected_with → overlaps implication. The 4 requiredPatterns must match; the 1 forbiddenPattern must NOT match.",
    fixtureType: "lift-correctness-with-arc-modules",
    expectedRequiredPatternsCount: 4,
    expectedForbiddenPatternsCount: 1,
    canaryRole: "wrong-translation-canary-connected-with-as-primitive-with-spec-literal-bridge-axioms",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "Phase 4 lifter's silent collapse of Connected With to a defined-as-overlap form OR failure to emit the spec-literal bridge axioms from ARC content. Specific failure modes: (1) lifter pattern-matches Connected With as a definitional axiom and emits the wrong defined-as-overlap biconditional (caught by forbiddenPattern reverse-direction implication); (2) lifter correctly emits Connected With as a primitive atom but FAILS to emit the spec §3.4.1 ratified bridge axioms (reflexivity + symmetry + parthood-extension) from ARC content's bridgeAxioms field (caught by 3 spec-literal requiredPatterns); (3) lifter emits both directions of a defined-as-overlap form (the symmetric biconditional that corrupts BFO's mereotopological asymmetry; caught by forbiddenPattern); (4) lifter emits the spec-literal forward bridge axioms but ALSO emits the speculative-non-spec overlaps→connected_with axiom (caught by absence of that pattern in requiredPatterns — speculative axioms are no longer asserted; if the lifter emits them gratuitously, no test failure but no test pass either; fixture-amendment shifts the discipline to spec-literal-coverage rather than speculative-axiom-presence).",

  "expected_v0.1_verdict": {
    ringStatus: "ring1-lift-correctness-arc-content-extension-bridge-axioms",
    phaseAuthored: 4,
    phaseActivated: 4,
    expectedRequiredPatternsMatched: 4,
    expectedForbiddenPatternsMatched: 0,
    discriminatesAgainst:
      "any Phase 4 lifter that emits the reverse-direction implication connected_with(x, y) → overlaps(x, y) [the defined-as-overlap form collapse]; any lifter that emits both directions of a defined-as-overlap form simultaneously [the symmetric biconditional]; any lifter that fails to emit the spec §3.4.1 ratified bridge axioms (reflexivity + symmetry + parthood-extension) from ARC content's bridgeAxioms field per Q-4-Step5-A.2 + Q-4-Step5-A.2.1 schema discriminated-union; any lifter that emits the speculative overlaps → connected_with axiom (no longer asserted as requiredPattern per Q-4-Step5-A.1 spec-literal amendment) without ALSO emitting the spec-literal bridge axioms (incomplete coverage failure mode).",
  },

  "expected_v0.2_elk_verdict": null,

  meta: {
    verifiedStatus: "Draft",
    phase: 4,
    activationTiming: "corpus-before-code",
    stepBinding: 5,
    corpusActivationTiming: "corpus-before-code",
    authoredAt: "2026-05-10",
    amendedAt: "2026-05-14",
    authoredBy: "SME persona, Phase 4 entry packet Pass 2a authoring per Q-4-B architect ratification 2026-05-10",
    amendedBy: "SME persona, Q-4-Step5-A mid-phase architectural-gap micro-cycle path-fence-authoring per architect rulings 2026-05-14",
    amendmentHistory: [
      {
        cycle: "Q-4-Step5-A architect ruling 2026-05-14",
        rulings: [
          "Q-4-Step5-A.1 Option (d) spec-literal + fixture amendment APPROVED",
          "Q-4-Step5-A.3 cco:ont00001810 spec-literal IRI APPROVED",
        ],
        amendmentShape: "Removed overlaps→connected_with requiredPattern; added 3 spec-literal requiredPatterns (reflexivity + symmetry + parthood-extension); preserved forbiddenPattern (reverse-direction connected_with→overlaps); swapped IRI RO_0002170→cco:ont00001810",
        amendmentRationale: "SME-self-error correction per Q-4-Step5-A Banking 6 SME-self-error acknowledgment discipline; fixture-vs-spec-ratification alignment per Q-4-Step5-A Banking 1 corpus-as-contract symmetric application; verification ritual first production miss per Cat 7 reference-existence-vs-reference-consistency boundary surface (Cat 9 candidacy forward-tracks to Phase 4 exit retro per Meta-observation banking)",
      },
    ],
    relatedSpecSections: [
      "spec §3.4 (Connected With definition policy: primitive + cco:ont00001810 + owl:SymmetricProperty + owl:ReflexiveProperty)",
      "spec §3.4.1 (Inferential closure under the bridge axiom — full ratified axiom set: reflexivity + symmetry + parthood-extension bridge + parthood transitivity)",
      "spec §3.6.2 (arcModules parameter on LifterConfiguration)",
    ],
    relatedADRs: [
      "spec §10 ADR-004 (Connected With as primitive with bridge axioms — Accepted per spec §10 ADR registry line 1399; parallel-registry-reconciliation forward-track candidate per Phase 3 retro: spec ADR registry §10 vs DECISIONS.md ADR registry. DECISIONS.md ADR-004 is 'Tau Prolog probe seam' — distinct identity. SME uses spec-§10-ADR-NN form for spec citations to disambiguate; Phase 4 verification ritual Q-4-Step5-A path-fence-author 2026-05-14 production catch corrected the prior fixture's bare 'ADR-004' citation per binding-immediately discipline.)",
      "ADR-007 §1 (DECISIONS.md ADR-007 — lifter emits classical FOL — Connected With primitive emission consistent with classical-FOL discipline)",
      "ADR-007 §4 (decomposition convention for biconditionals into universal-implications)",
      "ADR-007 §11 (FOL→Prolog per-variant translation table; per Q-4-Step5-A.2.1 emitter implementation cohesion anchor)",
      "ADR-009 (DECISIONS.md ADR-009 — six-CCO-module expansion + BFO core ARC framing)",
      "ADR-013 (DECISIONS.md ADR-013 — visited-ancestor cycle-guard pattern; Connected With's symmetry + reflexivity are non-cycle-prone per ADR-013 framing)",
    ],
    relatedBankedPrinciples: [
      "Verbal-banked 'spec-literal framing default discipline' per architect Q-4-Step5-A.1 anchor 1 (Phase 4 exit doc-pass formalization queue); NOT a numbered ADR in either spec §10 ADR registry or DECISIONS.md ADR registry (Q-4-Step5-A verification ritual production catch 2026-05-14: prior fixture's bare ADR-012 citation was incorrect — DECISIONS.md ADR-012 is 'Cardinality routing'; spec §10 ADR-012 is 'Blank node Skolemization'; neither matches the spec-literal framing principle which is verbal-banked-not-formalized-as-ADR).",
      "Q-4-Step4-A Banking 3 (corpus-bounded scope discipline; symmetric application at Q-4-Step5-A.1 Banking 1)",
      "Q-4-Step5-A Banking 6 (SME-self-error acknowledgment discipline; surfaces this fixture's audit-trail header per four-contract consistency)",
    ],
    relatedFixtures: [
      "canary_bfo_disjointness_silent_pass (Phase 4 corpus-before-code sibling: silent-pass canary for BFO Disjointness Map)",
      "bfo_disjointness_map_axiom_emission (Phase 4 step-N-bind sibling: unit-level emission verification for Q-4-Step4-A disjointnessAxioms field; this fixture's bridgeAxioms field is the Q-4-Step5-A.2 parallel schema extension)",
      "nc_bfo_continuant_occurrent (Phase 4 corpus-before-code sibling: end-to-end consistency-rejection via BFO Disjointness Map)",
    ],
    architectAuthorization:
      "Original Phase 4 entry packet §3.2 ratified 2026-05-10 (Q-4-B architect ruling); corpus-before-code per Q-4-B; Step 5 binding per Q-4-A explicit-step-assignment framing. AMENDED at Q-4-Step5-A architect ruling 2026-05-14 (Phase 4 mid-phase architectural-gap micro-cycle 2/~3 per Q-4-A projection; 6 banked principles forward-fold to Phase 4 exit doc-pass).",
  },
};

export const meta = fixture.meta;
