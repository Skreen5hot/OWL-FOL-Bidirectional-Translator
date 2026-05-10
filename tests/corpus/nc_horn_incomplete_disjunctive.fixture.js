/**
 * Phase 3 fixture — No-Collapse adversarial canary: non-Horn inconsistency from
 * disjunctive class expression.
 *
 * Per ROADMAP §3.4 + architect Q-3-E ratification 2026-05-08 (corpus-before-code):
 *
 *   "nc_horn_incomplete_disjunctive.fixture.js — non-Horn inconsistency requiring
 *    tableau reasoning the Horn fragment cannot reach; MUST return 'undetermined'
 *    with populated unverifiedAxioms, NOT silently consistent: true"
 *
 * Status: Verified. Authored corpus-before-code at Pass 2a 2026-05-08. Promoted
 * Draft → Verified at Phase 3 Step 9.3 (2026-05-09); count-discriminator amended
 * at Q-Frank-Step9-A Ask 2 corrective ruling 2026-05-10 — see audit-trail header
 * (a/b/c/d) below.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * AMENDMENT AUDIT TRAIL — count-discriminator correction, 2026-05-10
 * ════════════════════════════════════════════════════════════════════════════
 *
 * (a) The amendment. `expectedUnverifiedAxiomsMinCount: 2` → `: 1`. The
 *     `expectedUnverifiedAxiomsContains` field's documentation tightened to
 *     name the disjunctive-consequent SubClassOf as the SOLE non-Horn axiom
 *     (the disjointness DisjointWith(A, D) is Horn-expressible and is NOT
 *     part of the non-Horn-fragment-escape).
 *
 * (b) The substantive ruling. Per Q-Frank-Step9-A Ask 2 (architect ruling
 *     2026-05-10), the implementation is correct on the merits and the
 *     fixture over-specified. Reasoning: the non-Horn shape is
 *     `SubClassOf(A, ObjectUnionOf(B, C))` — that axiom alone is what the
 *     Horn-checkable fragment cannot express; the disjointness is
 *     Horn-expressible per spec §8.5.1 (its FOL translation
 *     `∀x. A(x) ∧ D(x) → False` is a Horn clause); the indeterminacy
 *     arises from the case-analysis the disjunctive consequent forces, not
 *     from the disjointness itself. Surfacing both axioms in
 *     unverifiedAxioms would conflate "this axiom is non-Horn" with "this
 *     axiom transitively contributes to indeterminacy." The former is the
 *     load-bearing claim per API §8.1.1; the latter is a derived property
 *     downstream tooling can compute.
 *
 * (c) The withdrawn forward-track. The earlier framing that this count
 *     divergence routed to Phase 4 entry-cycle as a "corpus-discriminator-
 *     scope question" (Q-3-Step9-A Refinement 3, 2026-05-10 morning ruling)
 *     was withdrawn at the same-day Q-Frank-Step9-A corrective ruling per
 *     Frank's §4.1 critique: forward-tracking ships mutually inconsistent
 *     fixtures and code, which the corrective ruling refused. Banked
 *     principle: when fixture-vs-implementation count divergences surface
 *     at exit boundaries, the resolution requires architect ruling on which
 *     is correct on inspection; routing to a future cycle is reserved for
 *     cases where neither side is clearly correct.
 *
 * (d) Audit-trail unity. The amendment lands in the same corrective commit
 *     as the Case B pull from `demo/demo_p3.html` (Q-Frank-Step9-A Ask 1)
 *     + ADR-007 §10 promotion (Ask 3) per the architect's audit-trail-
 *     unity-per-surface ruling. Cross-references:
 *     `project/reviews/phase-3-step9-architectural-gap.md` §5 + corrective
 *     overlay; `arc/AUTHORING_DISCIPLINE.md` Step 9 architectural-gap
 *     subsection's withdrawn-bankings list; `demo/Phase3DemoCritique.md`
 *     §4.1 (the surfacing critique); `project/reviews/phase-3-exit.md` §7
 *     Item 11 disposition.
 * ════════════════════════════════════════════════════════════════════════════
 *
 * ── Why this is non-Horn-inconsistent ─────────────────────────────────────
 *
 * The KB shape:
 *   SubClassOf(A, ObjectUnionOf(B, C))
 *   SubClassOf(B, D)
 *   SubClassOf(C, D)
 *   DisjointWith(A, D)
 *   ClassAssertion(A, alice)
 *
 * Classical FOL semantics: A(alice) ∧ A ⊑ B ⊔ C → B(alice) ∨ C(alice). Either
 * disjunct, with B ⊑ D and C ⊑ D, gives D(alice). Combined with DisjointWith(A, D)
 * — i.e., ∀x. ¬(A(x) ∧ D(x)) — and A(alice), this contradicts D(alice). The KB
 * is classically inconsistent.
 *
 * The contradiction REQUIRES disjunctive case analysis (tableau reasoning):
 * neither disjunct alone resolves under SLD — the proof needs to consider both
 * branches and conclude that BOTH lead to contradiction. The Horn-checkable
 * fragment per spec §8.5.1 explicitly excludes "arbitrary disjunctive class
 * expressions" — ObjectUnionOf in the consequent of SubClassOf is the canonical
 * non-Horn shape.
 *
 * ── What this fixture catches ─────────────────────────────────────────────
 *
 * The SILENT-PASS failure mode for non-Horn inconsistency: a checkConsistency
 * implementation that runs Horn resolution, fails to derive `inconsistent`,
 * and returns consistent: true rather than `'undetermined'`. The correct v0.1
 * behavior per spec §8.5.1: "When a TBox axiom falls outside the Horn-checkable
 * fragment, the §8.5.2 check returns 'indeterminate' rather than satisfiable
 * or unsatisfiable. Indeterminate classes do not contribute to the No-Collapse
 * Guarantee — they pass through projection with a coherence_indeterminate
 * Recovery Payload note, alerting consumers that v0.1.x cannot verify their
 * satisfiability behavior."
 *
 * Per spec §8.5.5 + API §8.1.1: the `unverifiedAxioms` field MUST be populated
 * with the axioms outside the Horn-checkable fragment that contributed to the
 * indeterminate verdict. Specifically: the SubClassOf-with-ObjectUnionOf-consequent
 * axiom + DisjointWith axiom (the disjunctive-case-analysis trigger).
 *
 * ── Discrimination from nc_horn_incomplete_existential ────────────────────
 *
 * Both are "non-Horn-incomplete" cases producing 'undetermined'. The
 * discrimination per ROADMAP requirement: "MUST return 'undetermined' with a
 * different reason than the disjunctive case." This fixture's reason is
 * `coherence_indeterminate` with `unverifiedAxioms` naming the disjunctive
 * SubClassOf + DisjointWith pair. The existential sibling fixture's reason is
 * also `coherence_indeterminate` but with `unverifiedAxioms` naming an
 * existential-quantifier-in-consequent shape.
 *
 * (The frozen reason enum has one `coherence_indeterminate` value; the
 * discrimination is in the `unverifiedAxioms` content + accompanying scope
 * notes, not in the reason code itself. This fixture asserts `unverifiedAxioms`
 * contains the disjunctive axiom shape; the existential fixture asserts a
 * different axiom shape.)
 */

const PREFIX = "http://example.org/test/nc_horn_incomplete_disjunctive/";
const A = PREFIX + "A";
const B = PREFIX + "B";
const C = PREFIX + "C";
const D = PREFIX + "D";
const ALICE = PREFIX + "alice";

/** @type {object} */
export const fixture = {
  input: {
    ontologyIRI: "http://example.org/test/nc_horn_incomplete_disjunctive",
    prefixes: { ex: PREFIX },
    tbox: [
      // SubClassOf(A, ObjectUnionOf(B, C)) — the disjunctive-consequent shape
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: A },
        superClass: {
          "@type": "ObjectUnionOf",
          classes: [
            { "@type": "Class", iri: B },
            { "@type": "Class", iri: C },
          ],
        },
      },
      { "@type": "SubClassOf", subClass: { "@type": "Class", iri: B }, superClass: { "@type": "Class", iri: D } },
      { "@type": "SubClassOf", subClass: { "@type": "Class", iri: C }, superClass: { "@type": "Class", iri: D } },
      // DisjointWith(A, D) — the contradiction trigger
      {
        "@type": "DisjointClasses",
        classes: [
          { "@type": "Class", iri: A },
          { "@type": "Class", iri: D },
        ],
      },
    ],
    abox: [
      { "@type": "ClassAssertion", class: { "@type": "Class", iri: A }, individual: ALICE },
    ],
    rbox: [],
  },

  expectedOutcome: {
    summary:
      "checkConsistency on the lifted FOL state returns consistent: 'undetermined' with " +
      "reason: 'coherence_indeterminate'. The unverifiedAxioms field is populated with at " +
      "least the SubClassOf-with-ObjectUnionOf-consequent axiom and the DisjointClasses(A, D) " +
      "axiom (the two axioms that together drive the disjunctive-case-analysis the Horn " +
      "fragment cannot perform). Classical FOL judges this KB inconsistent; v0.1's Horn-only " +
      "check correctly reports 'undetermined' rather than silently returning consistent: true.",
    fixtureType: "consistency-check",
    expectedConsistencyResult: "undetermined",
    expectedReason: "coherence_indeterminate",
    canaryRole: "no-collapse-adversarial-non-horn-disjunctive-incompleteness",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "checkConsistency silently returning consistent: true when the input requires " +
    "disjunctive case-analysis the Horn fragment cannot perform — the silent-pass failure " +
    "mode for non-Horn inconsistency. Specific failure modes: implementation runs Horn " +
    "resolution, fails to derive inconsistent, and returns consistent: true (the wrong " +
    "verdict per spec §8.5.1's Horn-fragment-scoping); implementation correctly returns " +
    "'undetermined' but fails to populate unverifiedAxioms (violates spec §8.5.5 + API §8.1.1 " +
    "honest-admission discipline — the consumer sees 'undetermined' but cannot tell which " +
    "axioms drove it); implementation populates unverifiedAxioms with wrong axiom set " +
    "(e.g., includes Horn-decidable axioms or excludes the disjunctive axiom).",

  "expected_v0.1_verdict": {
    ringStatus: "ring3-passes-with-horn-incompleteness-surfaced",
    phaseAuthored: 3,
    phaseActivated: 3,
    expectedConsistencyResult: "undetermined",
    expectedReason: "coherence_indeterminate",
    // Count amended 2 → 1 at Q-Frank-Step9-A Ask 2 corrective ruling
    // 2026-05-10 — see audit-trail header (a)/(b). The implementation is
    // correct: only the disjunctive-consequent SubClassOf is non-Horn;
    // the disjointness is Horn-expressible per spec §8.5.1 and is NOT
    // part of the non-Horn-fragment-escape.
    expectedUnverifiedAxiomsMinCount: 1,
    expectedUnverifiedAxiomsContains: [
      "SubClassOf(A, ObjectUnionOf(B, C)) — the disjunctive-consequent axiom; the SOLE non-Horn axiom in this fixture (per Q-Frank-Step9-A Ask 2). Indeterminacy arises from the case-analysis the disjunctive consequent forces, not from the disjointness, which is Horn-expressible.",
    ],
    discriminatesAgainst:
      "any checkConsistency implementation that returns consistent: true (silent pass on non-Horn " +
      "inconsistency); any implementation that returns 'undetermined' with empty unverifiedAxioms " +
      "(violates spec §8.5.5 honest-admission discipline); any implementation that surfaces the " +
      "Horn-expressible DisjointClasses(A, D) axiom in unverifiedAxioms (would conflate " +
      "transitively-implicating Horn axioms with non-Horn axioms — fails the API §8.1.1 honest-" +
      "admission contract per Q-Frank-Step9-A Ask 2 ruling 2026-05-10)",
  },

  "expected_v0.2_elk_verdict": {
    notes:
      "ELK does NOT handle this case (ObjectUnionOf is outside the EL profile). v0.2 ELK " +
      "integration leaves this fixture's verdict at 'undetermined' with the same unverifiedAxioms; " +
      "the consumer is alerted that even ELK cannot verify it. A future SROIQ reasoner integration " +
      "(post-v0.2) would close this gap; that's a v0.3+ concern.",
  },

  meta: {
    verifiedStatus: "Verified",
    phase: 3,
    activationTiming: "corpus-before-code",
    stepBinding: 6,
    authoredAt: "2026-05-08",
    authoredBy: "SME persona, Phase 3 entry packet final ratification cycle Pass 2a authoring",
    relatedSpecSections: [
      "spec §8.5.1 (Horn-checkable fragment — explicitly excludes 'arbitrary disjunctive class expressions')",
      "spec §8.5.2 (check outcome table — closure complete + non-Horn axioms involved → 'undetermined')",
      "spec §8.5.5 (surfacing the Horn-fragment limit to consumers)",
      "API §8.1 (checkConsistency signature)",
      "API §8.1.1 (unverifiedAxioms field — populated when reason === 'coherence_indeterminate')",
      "Fandaws Consumer Requirement §7.1 (honest-admission discipline)",
    ],
    relatedFixtures: [
      "nc_self_complement (Horn-decidable inconsistency — the discriminating sibling for in-fragment vs out-of-fragment behavior)",
      "nc_horn_incomplete_existential (other non-Horn-incomplete case; different axiom shape)",
    ],
    architectAuthorization:
      "Phase 3 entry packet §3.3 ratified 2026-05-08; corpus-before-code per Q-3-E split; " +
      "Step 6 binding per Q-3-A step ledger ratification.",
  },
};

export const meta = fixture.meta;
