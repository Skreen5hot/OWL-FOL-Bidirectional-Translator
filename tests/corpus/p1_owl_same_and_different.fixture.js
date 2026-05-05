/**
 * Phase 1 fixture: owl:sameAs and owl:differentFrom between named individuals.
 *
 * Status: Draft. Per behavioral spec §5.5:
 *   owl:sameAs lifts to a same_as/2 fact with reflexivity / symmetry /
 *     transitivity axioms injected.
 *   owl:differentFrom lifts to a different_from/2 fact with symmetry only
 *     (differentFrom is irreflexive and not transitive).
 *
 * This fixture verifies the lifter wires up the identity discipline. The
 * canary_same_as_propagation fixture verifies identity propagates through
 * other predicates — different concern, different fixture.
 *
 * ============================================================================
 * AMENDMENT AUDIT TRAIL — Step 5 entry housekeeping, 2026-05-02
 * ============================================================================
 *
 * (a) Contradiction discovered. During Step 4 implementation of the identity
 *     machinery (spec §5.5.1: reflexivity / symmetry / transitivity for
 *     owl:sameAs; symmetry-only for owl:differentFrom), the SME / Cynical-
 *     Auditor pass surfaced an internal contradiction in this fixture:
 *     - `intent` (this file): "identity-equivalence axiomatization
 *       (reflexivity/symmetry/transitivity for sameAs ...) must be injected
 *       by the lifter per spec §5.5.1"
 *     - manifest `expectedOutcome.summary` (tests/corpus/manifest.json):
 *       "sameAs equivalence axiomatization (reflexivity/symmetry/transitivity)
 *        injected"
 *     - original `expectedFOL` (this file, pre-amendment): contained ONLY
 *       the two bare ABox facts (sameAs + differentFrom atoms), with NO
 *       equivalence axioms.
 *     Two prose contracts asserted equivalence axiomatization; the byte-
 *     exact form omitted it. The byte-exact form was incomplete relative
 *     to the prose contracts that already existed.
 *
 * (b) Direction of alignment. expectedFOL was aligned UPWARD to match
 *     `intent` and `expectedOutcome.summary` — NOT the other way around,
 *     and NOT to match the implementation. The amendment is justified by
 *     the pre-existing prose contracts, not by what the Step 4 lifter
 *     produces. The lifter was implemented to satisfy the prose contracts
 *     per spec §5.5.1; the fixture's expectedFOL is amended to match the
 *     same prose contracts. The lifter and the fixture independently align
 *     to the spec — neither aligns to the other.
 *
 * (c) Spec citation. Behavioral spec §5.5.1 (identity discipline:
 *     reflexivity / symmetry / transitivity for owl:sameAs; symmetry-only
 *     for owl:differentFrom which is irreflexive and non-transitive).
 *
 * (d) Architect ruling reference. Approved 2026-05-02 by the architect's
 *     "Phase 1 mid-phase escalation ruling" Ruling 1 ("Draft-fixture
 *     amendment: APPROVED"). The amendment is approved on its specific
 *     merits (pre-existing two-of-three internal contracts pointing at
 *     the same spec section; Draft state explicitly admitting amendment;
 *     contradiction surfaced during implementation, not invented by the
 *     implementer). NOT a general license for Draft-fixture amendments —
 *     each future amendment requires its own escalation per the
 *     Failure-Triage Handoff Protocol.
 *
 * Side effect of the amendment: the fixture's `expectedFOL` is now ~6x
 * longer (2 facts → 2 facts + 4 equivalence/symmetry axioms). The amendment
 * does NOT change the input ABox; it changes only the asserted output
 * shape to match what the spec §5.5.1 contract requires the lifter to
 * produce.
 *
 * Promotion gate: this fixture cannot promote Draft → Verified at Phase 1
 * exit while carrying any internal contradiction. Post-amendment, intent /
 * expectedOutcome.summary / expectedFOL are mutually consistent, satisfying
 * the architect-ratified promotion criterion.
 * ============================================================================
 *
 * AMENDMENT AUDIT TRAIL — Step 5 close cycle, 2026-05-02 (re-amendment)
 * ============================================================================
 *
 * (a) Re-amendment scope. Reserved-predicate `owl:sameAs` and
 *     `owl:differentFrom` predicate-name strings flipped from CURIE form
 *     ("owl:sameAs", "owl:differentFrom") to expanded full-URI form
 *     ("http://www.w3.org/2002/07/owl#sameAs",
 *      "http://www.w3.org/2002/07/owl#differentFrom") throughout
 *     `expectedFOL`. Six atom-predicate strings updated. No other content
 *     change.
 *
 * (b) Direction of alignment. The flip aligns expectedFOL with API §3.10.3
 *     ("FOLAtom.predicate and FOLConstant.iri strings in OFBT's FOL output
 *     use expanded full URI form by default"). The Step 4 amendment was
 *     correct in shape (equivalence axioms injected) but used CURIE-form
 *     reserved-predicate names that were inconsistent with the spec's
 *     canonical-form rule for user-supplied predicates. SME O1 escalation
 *     surfaced the inconsistency; architect Ruling 3 of the Step 5 cycle
 *     resolved: reserved predicates use full-URI form per API §3.10.3,
 *     no exception.
 *
 * (c) Spec citation. API specification §3.10.3 (Output: FOL predicates
 *     and constants) — the canonical form rule that reserved OWL
 *     predicates were not previously honoring. Spec §0.2 governs the
 *     no-spec-carve-out rationale (Resolution B was not on the table
 *     without implementation evidence).
 *
 * (d) Architect ruling reference. Architect Ruling 3 of the Phase 1
 *     Step 5 mid-phase cycle, 2026-05-02 ("RESOLVE NOW; PICK
 *     RESOLUTION A"). ADR-007 §9 promoted from "Step 6 placeholder"
 *     to "Resolved in Step 5 close commit" with the canonical-form
 *     decision recorded.
 *
 * Note on the audit-trail format. The (a/b/c/d) lettered subsections
 * are emerging as the canonical Draft-fixture amendment audit-trail
 * shape. The Step 4 amendment used the same shape (above); this Step 5
 * re-amendment continues the pattern. Per SME's Step 5 review, the
 * pattern itself should be banked into AUTHORING_DISCIPLINE.md at
 * Phase 1 exit doc pass.
 * ============================================================================
 */

/** @type {object} */
export const fixture = {
  input: {
    ontologyIRI: "http://example.org/test/p1_same_diff",
    prefixes: { ex: "http://example.org/test/" },
    tbox: [],
    rbox: [],
    abox: [
      {
        "@type": "SameIndividual",
        individuals: [
          "http://example.org/test/superman",
          "http://example.org/test/clarkkent",
        ],
      },
      {
        "@type": "DifferentIndividuals",
        individuals: [
          "http://example.org/test/superman",
          "http://example.org/test/lexluthor",
        ],
      },
    ],
  },
  expectedFOL: [
    // Bare ABox facts (Step 1).
    {
      "@type": "fol:Atom",
      predicate: "http://www.w3.org/2002/07/owl#sameAs",
      arguments: [
        { "@type": "fol:Constant", iri: "http://example.org/test/superman" },
        { "@type": "fol:Constant", iri: "http://example.org/test/clarkkent" },
      ],
    },
    {
      "@type": "fol:Atom",
      predicate: "http://www.w3.org/2002/07/owl#differentFrom",
      arguments: [
        { "@type": "fol:Constant", iri: "http://example.org/test/superman" },
        { "@type": "fol:Constant", iri: "http://example.org/test/lexluthor" },
      ],
    },
    // Identity machinery (Step 4) — owl:sameAs equivalence axioms.
    // Reflexivity: ∀x. owl:sameAs(x,x).
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Atom",
        predicate: "http://www.w3.org/2002/07/owl#sameAs",
        arguments: [
          { "@type": "fol:Variable", name: "x" },
          { "@type": "fol:Variable", name: "x" },
        ],
      },
    },
    // Symmetry: ∀x,y. owl:sameAs(x,y) → owl:sameAs(y,x).
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Universal",
        variable: "y",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Atom",
            predicate: "http://www.w3.org/2002/07/owl#sameAs",
            arguments: [
              { "@type": "fol:Variable", name: "x" },
              { "@type": "fol:Variable", name: "y" },
            ],
          },
          consequent: {
            "@type": "fol:Atom",
            predicate: "http://www.w3.org/2002/07/owl#sameAs",
            arguments: [
              { "@type": "fol:Variable", name: "y" },
              { "@type": "fol:Variable", name: "x" },
            ],
          },
        },
      },
    },
    // Transitivity: ∀x,y,z. owl:sameAs(x,y) ∧ owl:sameAs(y,z) → owl:sameAs(x,z).
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
                {
                  "@type": "fol:Atom",
                  predicate: "http://www.w3.org/2002/07/owl#sameAs",
                  arguments: [
                    { "@type": "fol:Variable", name: "x" },
                    { "@type": "fol:Variable", name: "y" },
                  ],
                },
                {
                  "@type": "fol:Atom",
                  predicate: "http://www.w3.org/2002/07/owl#sameAs",
                  arguments: [
                    { "@type": "fol:Variable", name: "y" },
                    { "@type": "fol:Variable", name: "z" },
                  ],
                },
              ],
            },
            consequent: {
              "@type": "fol:Atom",
              predicate: "http://www.w3.org/2002/07/owl#sameAs",
              arguments: [
                { "@type": "fol:Variable", name: "x" },
                { "@type": "fol:Variable", name: "z" },
              ],
            },
          },
        },
      },
    },
    // Identity machinery — owl:differentFrom symmetry (no reflexivity:
    // differentFrom is irreflexive; no transitivity).
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Universal",
        variable: "y",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Atom",
            predicate: "http://www.w3.org/2002/07/owl#differentFrom",
            arguments: [
              { "@type": "fol:Variable", name: "x" },
              { "@type": "fol:Variable", name: "y" },
            ],
          },
          consequent: {
            "@type": "fol:Atom",
            predicate: "http://www.w3.org/2002/07/owl#differentFrom",
            arguments: [
              { "@type": "fol:Variable", name: "y" },
              { "@type": "fol:Variable", name: "x" },
            ],
          },
        },
      },
    },
  ],
};

export const meta = {
  fixtureId: "p1_owl_same_and_different",
  intent:
    "owl:sameAs and owl:differentFrom must lift to facts with reserved predicate names (NOT discarded as 'metadata'); identity-equivalence axiomatization (reflexivity/symmetry/transitivity for sameAs; symmetry-only for differentFrom which is irreflexive and non-transitive) must be injected by the lifter per spec §5.5.1",
  verifiedStatus: "Verified",
};
