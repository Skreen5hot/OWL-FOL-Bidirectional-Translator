/**
 * Phase 1 fixture: BFO 2020 — classical OWL subset with CLIF parity citations.
 *
 * Status: Draft. CLIF citations carry [VERIFY] markers pending Aaron's
 * verification against the canonical BFO 2020 CLIF release
 * (bfo-2020.clif from https://github.com/BFO-ontology/BFO-2020).
 *
 * ============================================================================
 * THE END-GOAL FRAMING — BFO/CLIF parity
 * ============================================================================
 *
 * This fixture plants the BFO/CLIF parity flag at Phase 1. BFO 2020 ships in
 * two canonical forms: an OWL release (bfo-2020.owl) and a CLIF release
 * (bfo-2020.clif). The CLIF release is the canonical FOL definition; the
 * OWL release is explicitly an approximation of the CLIF that fits within
 * OWL 2 DL's decidability constraints.
 *
 * The OFBT end goal — measured at every phase exit — is that lifting the
 * BFO 2020 OWL release through OFBT produces FOL that is semantically
 * equivalent to the canonical BFO 2020 CLIF release, modulo:
 *   - axioms the OWL release deliberately omits (e.g., reflexivity +
 *     antisymmetry of part_of, which OWL cannot decidably represent
 *     alongside transitivity)
 *   - axioms the lifter cannot reach without ARC content (e.g., ternary
 *     temporal-index restoration on continuant_part_of, bridge axioms for
 *     Connected With) — these land at Phases 4-7 as ARC modules ship
 *
 * Each phase's demo extends the CLIF coverage:
 *   - Phase 1 (THIS fixture): the standard-OWL subset (class hierarchy +
 *     disjointness + property characteristics + inverses). All 8 axioms
 *     map cleanly to canonical CLIF forms.
 *   - Phase 4: BFO ARC content lands; ternary parthood, the BFO Disjointness
 *     Map, bridge axioms become CLIF-checkable.
 *   - Phase 7: the full BFO/CLIF parity assertion — every axiom in
 *     bfo-2020.owl that has a CLIF counterpart lifts to FOL semantically
 *     equivalent to that counterpart.
 *
 * ============================================================================
 * Phase 1 scope (this fixture)
 * ============================================================================
 *
 * The 8 axioms below use ONLY standard OWL constructs — no ARC content
 * required. The Phase 1 lifter produces complete, correct FOL for them
 * via Steps 2 (TBox), 3 (RBox domain/range — not used here), 5 (RBox
 * property characteristics + inverses) per the existing implementation.
 *
 * What's deliberately ABSENT from this fixture (Phase 4+ deliverable):
 *   - Ternary parthood: continuant_part_of(x, y, t)
 *   - Reflexivity + antisymmetry of part_of (CLIF declares; OWL release
 *     omits — OFBT recovers via ARC injection at Phase 4)
 *   - Bridge axioms: Connected With per spec §3.4.1 (Phase 4 ARC content)
 *   - BFO Disjointness Map cross-module commitments
 *
 * ============================================================================
 * Verification status
 * ============================================================================
 *
 * Each clifGroundTruth entry carries a verificationStatus per the
 * AUTHORING_DISCIPLINE state machine:
 *   - Verified: confirmed against the canonical bfo-2020.clif release
 *   - [VERIFY]: hand-cited from SME knowledge; awaits canonical-source
 *     verification before Phase 1 exit promotion
 *   - Draft: provisional; not yet peer-reviewed
 *
 * Phase 1 entry: all 8 entries ship [VERIFY]. Pre-Phase-1-exit Aaron
 * verifies against the canonical CLIF and clears the markers (or amends
 * the CLIF text as appropriate). The fixture's expectedFOL is independently
 * verifiable by the test runner (deepStrictEqual against the lifter's
 * actual output) — the [VERIFY] markers gate only the CLIF cross-citation
 * column, not the lift-correctness assertion.
 *
 * ============================================================================
 */

// BFO 2020 canonical IRIs (per arc/vocabulary-cache/bfo-2020.json + the
// catalogue rows; class IRIs added by SME knowledge — also [VERIFY] against
// canonical bfo-2020.owl release).
const BFO_ENTITY = "http://purl.obolibrary.org/obo/BFO_0000001";
const BFO_CONTINUANT = "http://purl.obolibrary.org/obo/BFO_0000002";
const BFO_OCCURRENT = "http://purl.obolibrary.org/obo/BFO_0000003";
const BFO_INDEPENDENT_CONTINUANT = "http://purl.obolibrary.org/obo/BFO_0000004";
const BFO_MATERIAL_ENTITY = "http://purl.obolibrary.org/obo/BFO_0000040";
const BFO_PROCESS = "http://purl.obolibrary.org/obo/BFO_0000015";
const BFO_PART_OF = "http://purl.obolibrary.org/obo/BFO_0000050";
const BFO_HAS_PART = "http://purl.obolibrary.org/obo/BFO_0000051";

const VAR_X = { "@type": "fol:Variable", name: "x" };
const VAR_Y = { "@type": "fol:Variable", name: "y" };
const VAR_Z = { "@type": "fol:Variable", name: "z" };

/** @type {object} */
export const fixture = {
  input: {
    ontologyIRI: "http://example.org/test/p1_bfo_clif_classical",
    prefixes: {
      bfo: "http://purl.obolibrary.org/obo/",
    },
    tbox: [
      // (1) Continuant ⊑ Entity
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: BFO_CONTINUANT },
        superClass: { "@type": "Class", iri: BFO_ENTITY },
      },
      // (2) Occurrent ⊑ Entity
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: BFO_OCCURRENT },
        superClass: { "@type": "Class", iri: BFO_ENTITY },
      },
      // (3) IndependentContinuant ⊑ Continuant
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: BFO_INDEPENDENT_CONTINUANT },
        superClass: { "@type": "Class", iri: BFO_CONTINUANT },
      },
      // (4) MaterialEntity ⊑ IndependentContinuant
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: BFO_MATERIAL_ENTITY },
        superClass: { "@type": "Class", iri: BFO_INDEPENDENT_CONTINUANT },
      },
      // (5) Process ⊑ Occurrent
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: BFO_PROCESS },
        superClass: { "@type": "Class", iri: BFO_OCCURRENT },
      },
      // (6) DisjointWith(Continuant, Occurrent) — THE foundational BFO disjointness
      {
        "@type": "DisjointWith",
        classes: [
          { "@type": "Class", iri: BFO_CONTINUANT },
          { "@type": "Class", iri: BFO_OCCURRENT },
        ],
      },
    ],
    abox: [],
    rbox: [
      // (7) Transitive(part_of) — declared in the OWL release per the
      // catalogue row 14 OWL Characteristics column ("owl:TransitiveProperty (only)")
      {
        "@type": "ObjectPropertyCharacteristic",
        property: BFO_PART_OF,
        characteristic: "Transitive",
      },
      // (8) InverseObjectProperties(part_of, has_part) — per catalogue row 15
      {
        "@type": "InverseObjectProperties",
        first: BFO_PART_OF,
        second: BFO_HAS_PART,
      },
    ],
  },

  expectedFOL: [
    // (1) ∀x. Continuant(x) → Entity(x)
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Implication",
        antecedent: { "@type": "fol:Atom", predicate: BFO_CONTINUANT, arguments: [VAR_X] },
        consequent: { "@type": "fol:Atom", predicate: BFO_ENTITY, arguments: [VAR_X] },
      },
    },
    // (2) ∀x. Occurrent(x) → Entity(x)
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Implication",
        antecedent: { "@type": "fol:Atom", predicate: BFO_OCCURRENT, arguments: [VAR_X] },
        consequent: { "@type": "fol:Atom", predicate: BFO_ENTITY, arguments: [VAR_X] },
      },
    },
    // (3) ∀x. IndependentContinuant(x) → Continuant(x)
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Implication",
        antecedent: { "@type": "fol:Atom", predicate: BFO_INDEPENDENT_CONTINUANT, arguments: [VAR_X] },
        consequent: { "@type": "fol:Atom", predicate: BFO_CONTINUANT, arguments: [VAR_X] },
      },
    },
    // (4) ∀x. MaterialEntity(x) → IndependentContinuant(x)
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Implication",
        antecedent: { "@type": "fol:Atom", predicate: BFO_MATERIAL_ENTITY, arguments: [VAR_X] },
        consequent: { "@type": "fol:Atom", predicate: BFO_INDEPENDENT_CONTINUANT, arguments: [VAR_X] },
      },
    },
    // (5) ∀x. Process(x) → Occurrent(x)
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Implication",
        antecedent: { "@type": "fol:Atom", predicate: BFO_PROCESS, arguments: [VAR_X] },
        consequent: { "@type": "fol:Atom", predicate: BFO_OCCURRENT, arguments: [VAR_X] },
      },
    },
    // (6) ∀x. (Continuant(x) ∧ Occurrent(x)) → ⊥
    // Logically equivalent to CLIF's (forall (x) (not (and (continuant x) (occurrent x))))
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Implication",
        antecedent: {
          "@type": "fol:Conjunction",
          conjuncts: [
            { "@type": "fol:Atom", predicate: BFO_CONTINUANT, arguments: [VAR_X] },
            { "@type": "fol:Atom", predicate: BFO_OCCURRENT, arguments: [VAR_X] },
          ],
        },
        consequent: { "@type": "fol:False" },
      },
    },
    // (7) ∀x,y,z. part_of(x,y) ∧ part_of(y,z) → part_of(x,z)
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Universal",
        variable: "y",
        body: {
          "@type": "fol:Universal",
          variable: "z",
          body: {
            "@type": "fol:Implication",
            antecedent: {
              "@type": "fol:Conjunction",
              conjuncts: [
                { "@type": "fol:Atom", predicate: BFO_PART_OF, arguments: [VAR_X, VAR_Y] },
                { "@type": "fol:Atom", predicate: BFO_PART_OF, arguments: [VAR_Y, VAR_Z] },
              ],
            },
            consequent: { "@type": "fol:Atom", predicate: BFO_PART_OF, arguments: [VAR_X, VAR_Z] },
          },
        },
      },
    },
    // (8) Inverse(part_of, has_part) — bidirectional implication pair per ADR-007 §4
    // Forward: ∀x,y. part_of(x,y) → has_part(y,x)
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Universal",
        variable: "y",
        body: {
          "@type": "fol:Implication",
          antecedent: { "@type": "fol:Atom", predicate: BFO_PART_OF, arguments: [VAR_X, VAR_Y] },
          consequent: { "@type": "fol:Atom", predicate: BFO_HAS_PART, arguments: [VAR_Y, VAR_X] },
        },
      },
    },
    // Reverse: ∀x,y. has_part(x,y) → part_of(y,x) (alpha-renamed from
    // ∀x,y. has_part(y,x) → part_of(x,y) so both implications bind 'x' and 'y'
    // per ADR-007 §4 fresh-allocator-per-direction convention)
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Universal",
        variable: "y",
        body: {
          "@type": "fol:Implication",
          antecedent: { "@type": "fol:Atom", predicate: BFO_HAS_PART, arguments: [VAR_X, VAR_Y] },
          consequent: { "@type": "fol:Atom", predicate: BFO_PART_OF, arguments: [VAR_Y, VAR_X] },
        },
      },
    },
  ],

  /**
   * Canonical CLIF ground-truth citations. Each entry pairs an OFBT-lifted
   * FOL axiom (by index in expectedFOL) with the canonical CLIF axiom from
   * bfo-2020.clif and a verification status.
   *
   * Field shape per architect Ruling 2 of the BFO/CLIF parity routing cycle
   * (2026-05-03): clifSource (canonical file URL), clifAxiomRef (line or
   * named-axiom reference into the canonical source), clifText (verbatim
   * axiom), verificationStatus (per spec §3.3 state machine), mappingNote
   * (free-text explaining non-trivial OWL-vs-CLIF encoding mappings),
   * expectedFOLIndex + owlAxiomLabel (fixture-runtime convenience fields).
   *
   * Phase 1 demo reads this array to render the lifted-vs-CLIF comparison
   * panel. Phase 4+ test infrastructure can add an
   * `assertSemanticEquivalenceToCLIF` helper that parses the CLIF text and
   * asserts equivalence (modulo Skolemization / variable renaming).
   */
  clifGroundTruth: [
    {
      clifSource: "https://github.com/BFO-ontology/BFO-2020/blob/master/src/owl/bfo-2020.clif",
      clifAxiomRef: "[VERIFY] line/named-axiom — Aaron pre-Phase-1-exit verification against canonical bfo-2020.clif",
      clifText: "(forall (x) (if (continuant x) (entity x)))",
      verificationStatus: "[VERIFY]",
      mappingNote: "Direct equivalence — both forms are first-order conditional universals.",
      expectedFOLIndex: 0,
      owlAxiomLabel: "Continuant ⊑ Entity",
    },
    {
      clifSource: "https://github.com/BFO-ontology/BFO-2020/blob/master/src/owl/bfo-2020.clif",
      clifAxiomRef: "[VERIFY] line/named-axiom",
      clifText: "(forall (x) (if (occurrent x) (entity x)))",
      verificationStatus: "[VERIFY]",
      mappingNote: "Direct equivalence.",
      expectedFOLIndex: 1,
      owlAxiomLabel: "Occurrent ⊑ Entity",
    },
    {
      clifSource: "https://github.com/BFO-ontology/BFO-2020/blob/master/src/owl/bfo-2020.clif",
      clifAxiomRef: "[VERIFY] line/named-axiom",
      clifText: "(forall (x) (if (independent_continuant x) (continuant x)))",
      verificationStatus: "[VERIFY]",
      mappingNote: "Direct equivalence.",
      expectedFOLIndex: 2,
      owlAxiomLabel: "IndependentContinuant ⊑ Continuant",
    },
    {
      clifSource: "https://github.com/BFO-ontology/BFO-2020/blob/master/src/owl/bfo-2020.clif",
      clifAxiomRef: "[VERIFY] line/named-axiom",
      clifText: "(forall (x) (if (material_entity x) (independent_continuant x)))",
      verificationStatus: "[VERIFY]",
      mappingNote: "Direct equivalence.",
      expectedFOLIndex: 3,
      owlAxiomLabel: "MaterialEntity ⊑ IndependentContinuant",
    },
    {
      clifSource: "https://github.com/BFO-ontology/BFO-2020/blob/master/src/owl/bfo-2020.clif",
      clifAxiomRef: "[VERIFY] line/named-axiom",
      clifText: "(forall (x) (if (process x) (occurrent x)))",
      verificationStatus: "[VERIFY]",
      mappingNote: "Direct equivalence.",
      expectedFOLIndex: 4,
      owlAxiomLabel: "Process ⊑ Occurrent",
    },
    {
      clifSource: "https://github.com/BFO-ontology/BFO-2020/blob/master/src/owl/bfo-2020.clif",
      clifAxiomRef: "[VERIFY] line/named-axiom",
      clifText: "(forall (x) (not (and (continuant x) (occurrent x))))",
      verificationStatus: "[VERIFY]",
      mappingNote:
        "Semantic equivalence modulo encoding: OFBT's '(P ∧ Q) → ⊥' is logically equivalent to CLIF's '(not (and P Q))' under classical FOL. The 'implies-False' form is OFBT's canonical encoding per the lifter's TBox DisjointWith handler; the CLIF form is BFO's canonical encoding.",
      expectedFOLIndex: 5,
      owlAxiomLabel: "DisjointWith(Continuant, Occurrent)",
    },
    {
      clifSource: "https://github.com/BFO-ontology/BFO-2020/blob/master/src/owl/bfo-2020.clif",
      clifAxiomRef: "[VERIFY] line/named-axiom",
      clifText: "(forall (x y z) (if (and (part_of x y) (part_of y z)) (part_of x z)))",
      verificationStatus: "[VERIFY]",
      mappingNote: "Direct equivalence — both forms are the classical transitivity axiom.",
      expectedFOLIndex: 6,
      owlAxiomLabel: "Transitive(part_of)",
    },
    {
      clifSource: "https://github.com/BFO-ontology/BFO-2020/blob/master/src/owl/bfo-2020.clif",
      clifAxiomRef: "[VERIFY] line/named-axiom",
      clifText: "(forall (x y) (iff (part_of x y) (has_part y x)))",
      verificationStatus: "[VERIFY]",
      mappingNote:
        "Semantic equivalence modulo encoding: OFBT emits the biconditional as a forward-and-reverse implication PAIR per ADR-007 §4 (fresh allocator per direction). The two implications together are logically equivalent to CLIF's single iff form. Two-axiom decomposition is OFBT's canonical encoding; iff is BFO's.",
      expectedFOLIndex: [7, 8],
      owlAxiomLabel: "InverseObjectProperties(part_of, has_part)",
    },
  ],

  /**
   * What this fixture deliberately does NOT cover (deferred to later phases).
   * Surfaces the cumulative coverage narrative for stakeholder demos.
   */
  deferredToLaterPhases: [
    {
      capability: "Ternary temporal-indexed parthood",
      clifAxiom: "(forall (x y t) (if (continuant_part_of x y t) (continuant x)))",
      reason: "Requires ARC content to restore the temporal index dropped by the OWL release's binary form. Phase 4 deliverable.",
      targetPhase: 4,
    },
    {
      capability: "Reflexivity of part_of",
      clifAxiom: "(forall (x) (if (entity x) (part_of x x)))",
      reason:
        "BFO CLIF declares reflexivity; the OWL release does NOT (combining Reflexive + Transitive falls outside OWL 2 DL's decidability constraints). OFBT recovers this via ARC axiom injection at Phase 4.",
      targetPhase: 4,
    },
    {
      capability: "Antisymmetry of part_of",
      clifAxiom: "(forall (x y) (if (and (part_of x y) (part_of y x)) (= x y)))",
      reason: "Same as reflexivity — CLIF declares, OWL omits, OFBT recovers via ARC at Phase 4.",
      targetPhase: 4,
    },
    {
      capability: "Connected With bridge axiom",
      clifAxiom: "(forall (x y z) (if (and (part_of x y) (connected_with z x)) (connected_with z y)))",
      reason:
        "Per spec §3.4.1 — Connected With is primitive in BFO/CCO; the bridge axiom that recovers mereotopological reach is in the ARC manifest, not in BFO OWL or CLIF directly. Phase 4 deliverable for the cco/mereotopology module.",
      targetPhase: 6,
    },
    {
      capability: "BFO Disjointness Map (full)",
      clifAxiom:
        "(and (forall (x) (not (and (sdc x) (gdc x)))) (forall (x) (not (and (process x) (object x)))) ...)",
      reason:
        "Phase 1 covers Continuant ⊓ Occurrent (the foundational disjointness). The full Disjointness Map across all BFO categories lands at Phase 4 with the BFO core ARC module.",
      targetPhase: 4,
    },
  ],
};

export const meta = {
  fixtureId: "p1_bfo_clif_classical",
  intent:
    "BFO 2020 OWL standard-construct subset (class hierarchy + DisjointWith + Transitive + InverseOf) lifts to FOL semantically equivalent to the canonical bfo-2020.clif axioms for the same content. Plants the BFO/CLIF parity flag at Phase 1; subsequent phases extend CLIF coverage as ARC content lands. Catches a lifter that produces FOL diverging from canonical BFO CLIF for the standard-OWL-construct subset (the divergence would be invisible to internal canary discipline alone — external ground truth is the discriminator).",
  verifiedStatus: "Draft",
};
