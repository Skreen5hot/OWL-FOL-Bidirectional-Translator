/**
 * Phase 4 fixture — Wrong-translation canary: Connected With as primitive
 * (NOT defined as overlap).
 *
 * Per ROADMAP §3.4 Phase 4 Wrong-Translation Canary Set + Phase 4 entry
 * packet §3.2 + Q-4-B architect ruling 2026-05-10 (corpus-before-code):
 *
 *   "canary_connected_with_overlap.fixture.js — Connected With must be
 *    lifted as a primitive plus the spec §3.4.1 bridge axiom; asserts the
 *    lifter does NOT collapse it to a defined-as-overlap form (the wrong
 *    translation that loses the primitive's load-bearing role in
 *    mereotopological closure)."
 *
 * Status: Draft (NEW Phase 4 authoring); promotes to Verified at Phase 4
 * exit when Step 5 (Connected With as primitive + bridge axiom) ships.
 *
 * ── Why Connected With as a primitive matters for v0.1 ───────────────────
 *
 * BFO 2020's mereotopological closure depends on Connected With as a
 * primitive predicate. Per spec §3.4.1: Connected With is one of the
 * "bridge axioms" that BFO commits to — relating mereological connection
 * (parts overlapping or sharing a connection point) to topological
 * connection (regions sharing a boundary).
 *
 * The wrong translation collapses Connected With to a defined-as-overlap
 * form: `connected_with(x, y) :=def overlaps(x, y)`. This lifting is wrong
 * because:
 *
 * 1. Connected With is NOT defined as overlap in BFO 2020 — it's a
 *    primitive. Two regions can be connected without overlapping (sharing
 *    a boundary without sharing parts).
 *
 * 2. The spec §3.4.1 bridge axiom relates Connected With to overlap as a
 *    one-way implication (`overlaps(x,y) → connected_with(x,y)`) — overlap
 *    implies connection, but connection does NOT imply overlap. Defining
 *    them as equivalent corrupts the mereotopological closure (the
 *    asymmetry between connection and overlap is what gives BFO the
 *    expressivity to talk about boundary-sharing without part-sharing).
 *
 * 3. Downstream inference relying on Connected With's primitive status
 *    (e.g., a query `connected_with(region_a, region_b)?` against a KB where
 *    region_a and region_b share only a boundary) would silently return
 *    'false' under the wrong translation (because they don't overlap),
 *    when the correct verdict per BFO is 'true' (because they share a
 *    boundary).
 *
 * The wrong-translation canary asserts that the Phase 4 lifter emits
 * Connected With as a primitive predicate atom + the spec §3.4.1 bridge
 * axiom (overlaps → connected_with), NOT as a defined-as-overlap predicate.
 *
 * ── Phase 4 Step binding ──────────────────────────────────────────────────
 *
 * Per Phase 4 entry packet §7 step ledger: Step 5 ships Connected With as
 * primitive + bridge axiom. This canary fixture validates Step 5's lift
 * correctness via assertRequiredPattern + assertForbiddenPatterns.
 *
 * ── What this fixture catches ─────────────────────────────────────────────
 *
 * The silent-failure failure mode for mereotopological closure: a Phase 4
 * lifter that conflates Connected With with overlap. Specific failure modes:
 *   - Lifter pattern-matches Connected With as a definitional axiom and
 *     emits the wrong defined-as-overlap form
 *   - Lifter correctly emits Connected With as a primitive atom but FAILS
 *     to emit the spec §3.4.1 bridge axiom (incomplete; downstream
 *     inference loses the overlap → connected_with implication)
 *   - Lifter emits both directions of the bridge axiom (connected_with ↔
 *     overlaps) — the symmetric form that corrupts BFO's mereotopological
 *     asymmetry
 */

const PREFIX = "http://example.org/test/canary_connected_with_overlap/";
const BFO_REGION = "http://purl.obolibrary.org/obo/BFO_0000006"; // SpatialRegion
const RO_CONNECTED_WITH = "http://purl.obolibrary.org/obo/RO_0002170"; // connected to
const RO_OVERLAPS = "http://purl.obolibrary.org/obo/RO_0002131"; // overlaps
const REGION_A = PREFIX + "region_a";
const REGION_B = PREFIX + "region_b";

/** @type {object} */
export const fixture = {
  /**
   * OWL ontology input — two regions; one assertion of overlaps; the BFO
   * ARC content provides the bridge axiom (overlaps → connected_with) when
   * the ARC module is loaded.
   */
  input: {
    ontologyIRI: "http://example.org/test/canary_connected_with_overlap",
    prefixes: {
      bfo: "http://purl.obolibrary.org/obo/",
      ro: "http://purl.obolibrary.org/obo/",
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
   * Required-pattern assertions: Connected With MUST appear as a primitive
   * binary atom on the lifted FOL state's predicate-call graph; the bridge
   * axiom (overlaps → connected_with) MUST appear as a one-way implication.
   */
  requiredPatterns: [
    {
      description: "Connected With present as primitive binary atom (NOT defined as overlap)",
      pattern: {
        "@type": "fol:Atom",
        predicate: RO_CONNECTED_WITH,
      },
    },
    {
      description: "Bridge axiom: overlaps(x, y) → connected_with(x, y) — one-way implication per spec §3.4.1",
      pattern: {
        "@type": "fol:Universal",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Atom",
            predicate: RO_OVERLAPS,
          },
          consequent: {
            "@type": "fol:Atom",
            predicate: RO_CONNECTED_WITH,
          },
        },
      },
    },
  ],

  /**
   * Forbidden-pattern assertions: the wrong defined-as-overlap form MUST
   * NOT appear in the lifted FOL state. Per ADR-007 §1 + §4: biconditionals
   * decompose into two universal-implications in classical FOL emission
   * (the same shape as `EquivalentClasses` and `InverseObjectProperties`
   * lifting). The wrong translation manifests as the reverse-direction
   * implication `connected_with → overlaps` appearing alongside the
   * required forward-direction `overlaps → connected_with`. Detecting the
   * reverse-direction implication's presence is sufficient to catch the
   * biconditional/symmetric emission (since the required forward direction
   * is already asserted by `requiredPatterns` above).
   *
   * (Verification ritual Cat 5 finding 2026-05-10: original draft used
   * `fol:Biconditional` which does NOT exist in the canonical FOL @type
   * set per src/kernel/fol-types.ts; canonical types are fol:Implication,
   * fol:Conjunction, fol:Disjunction, fol:Negation, fol:Universal,
   * fol:Existential, fol:Atom, fol:Equality, fol:False. Corrected to use
   * the reverse-direction-implication detection pattern per ADR-007 §4
   * decomposition convention.)
   */
  forbiddenPatterns: [
    {
      description:
        "Reverse-direction implication connected_with(x, y) → overlaps(x, y) — the wrong-direction bridge axiom that would corrupt mereotopological closure. If this fires AND the required forward direction `overlaps → connected_with` is present, the lifter has emitted the biconditional/symmetric form (per ADR-007 §4 decomposition: a biconditional is two universal-implications, one each direction).",
      pattern: {
        "@type": "fol:Universal",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Atom",
            predicate: RO_CONNECTED_WITH,
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
      "Phase 4 lift of an ontology asserting overlaps(region_a, region_b), with BFO 2020 ARC loaded, " +
      "produces lifted FOL containing: (1) the Connected With primitive predicate atom in the predicate-call " +
      "graph, (2) the spec §3.4.1 bridge axiom as a one-way implication (overlaps → connected_with), and " +
      "(3) NO reverse-direction implication (the symmetric/biconditional emission per ADR-007 §4 decomposition would fire as `connected_with → overlaps` — the forbidden pattern). " +
      "The two requiredPatterns must match; the one forbiddenPattern must NOT match.",
    fixtureType: "lift-correctness-with-arc-modules",
    canaryRole: "wrong-translation-canary-connected-with-as-primitive",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "Phase 4 lifter's silent collapse of Connected With to a defined-as-overlap form. Specific failure " +
    "modes: (1) lifter pattern-matches Connected With as a definitional axiom and emits the wrong defined-" +
    "as-overlap biconditional; (2) lifter correctly emits Connected With as a primitive atom but FAILS to " +
    "emit the spec §3.4.1 bridge axiom (incomplete lift; downstream inference loses the overlap → " +
    "connected_with implication); (3) lifter emits both directions of the bridge axiom (the symmetric form " +
    "that corrupts BFO's mereotopological asymmetry).",

  "expected_v0.1_verdict": {
    ringStatus: "ring1-lift-correctness-arc-content-extension",
    phaseAuthored: 4,
    phaseActivated: 4,
    expectedRequiredPatternsMatched: 2,
    expectedForbiddenPatternsMatched: 0,
    discriminatesAgainst:
      "any Phase 4 lifter that emits the reverse-direction implication connected_with(x, y) → overlaps(x, y); any lifter that emits both directions of the bridge axiom simultaneously (per ADR-007 §4 decomposition this is the structural-FOL form of the biconditional / defined-as-overlap form, which corrupts BFO's mereotopological asymmetry); any lifter that omits the bridge axiom entirely (Connected With present but no overlaps → connected_with implication relating it to overlap)",
  },

  "expected_v0.2_elk_verdict": null,

  meta: {
    verifiedStatus: "Draft",
    phase: 4,
    activationTiming: "corpus-before-code",
    stepBinding: 5,
    authoredAt: "2026-05-10",
    authoredBy: "SME persona, Phase 4 entry packet Pass 2a authoring per Q-4-B architect ratification 2026-05-10",
    relatedSpecSections: [
      "spec §3.4.1 (Connected With as primitive + bridge axiom; mereotopological closure framing)",
      "spec §3.6.2 (arcModules parameter on LifterConfiguration)",
    ],
    relatedADRs: [
      "ADR-009 (six-CCO-module expansion + BFO core ARC framing)",
      "ADR-007 §1 (lifter emits classical FOL — Connected With primitive emission consistent with classical-FOL discipline)",
    ],
    relatedFixtures: [
      "p4_bfo_clif_layer_b (Phase 4 sibling: Layer B parity citations against vendored BFO 2020 CLIF; bridge axiom appears in canonical CLIF as well)",
      "canary_bfo_disjointness_silent_pass (Phase 4 sibling: silent-pass canary for BFO Disjointness Map)",
    ],
    architectAuthorization:
      "ROADMAP §3.4 Phase 4 Wrong-Translation Canary Set + Phase 4 entry packet §3.2 ratified 2026-05-10 (Q-4-B architect ruling); corpus-before-code per Q-4-B; Step 5 binding per Q-4-A explicit-step-assignment framing.",
  },
};

export const meta = fixture.meta;
