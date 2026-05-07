/**
 * Phase 2 fixture — parity canary: query-preservation through round-trip.
 *
 * Per Phase 2 entry packet §3.4 (architect-ratified 2026-05-06):
 *
 *   "parity_canary_query_preservation.fixture.js — Producing a round-tripped
 *    output where a query Q that previously evaluated to `'true'` now
 *    evaluates to `'undetermined'` — silent collapse of an entailment
 *    through projection."
 *
 * Status: Draft. Authored at Phase 2 Step 8 stub-evaluator + parity-canary
 * SME path-fence-authoring pass; promoted to Verified at Phase 2 exit per
 * the standard AUTHORING_DISCIPLINE state-machine progression.
 *
 * ── Canary discipline ─────────────────────────────────────────────────────
 *
 * The architect-banked Phase 1 canary discipline: canaries assert the WRONG
 * shape is absent, not just that the right shape is present. Phase 2's
 * canary discipline extends this to query-preservation: a graph-shape
 * comparison can pass when semantic content has shifted; query evaluation
 * catches the shift.
 *
 * This canary forbids the projector from producing a round-tripped output
 * where a previously-entailed query Q silently degrades to `'undetermined'`.
 * Failure mode the canary defends against: the projector silently drops a
 * SubClassOf axiom (or similar entailment-bearing structure) from the OWL
 * surface; round-trip OWL surface is graph-shape-similar (via lossy
 * compaction); but re-lifted FOL state lacks the rule needed to derive Q.
 *
 * ── Worked example ────────────────────────────────────────────────────────
 *
 *   Input OWL:
 *     SubClassOf(Mother, Female)
 *     SubClassOf(Female, Person)
 *     ClassAssertion(Mother, alice)
 *
 *   Expected lift F_1 (via owlToFol — Phase 1 verified):
 *     ∀x. Mother(x) → Female(x)
 *     ∀x. Female(x) → Person(x)
 *     Mother(alice)
 *
 *   Expected project (via folToOwl — Phase 2 Steps 2/3a/3b):
 *     SubClassOf(Mother, Female)
 *     SubClassOf(Female, Person)
 *     ClassAssertion(Mother, alice)
 *
 *   Expected re-lift F_3:
 *     Same as F_1 (round-trip clean).
 *
 *   Discriminating query Q := Person(alice)?
 *
 *   Stub-evaluator on F_1:
 *     Backward-chain from Person(alice)? →
 *       rule ∀x. Female(x) → Person(x) matches; need Female(alice) →
 *       rule ∀x. Mother(x) → Female(x) matches; need Mother(alice) →
 *       fact Mother(alice) ✓
 *     Returns 'true'.
 *
 *   Stub-evaluator on F_3:
 *     Same backward-chain trace; returns 'true'.
 *
 *   Round-trip preservation: stub-result on F_1 == stub-result on F_3.
 *
 * ── Forbidden failure mode (the canary catches) ─────────────────────────
 *
 * The projector silently drops `SubClassOf(Female, Person)` from the OWL
 * surface (e.g., a buggy pair-matcher mis-collapses two unrelated SubClassOf
 * axioms into a spurious EquivalentClasses, dropping one). F_3 lacks the
 * rule ∀x. Female(x) → Person(x); backward-chain from Person(alice)?
 * exhausts at Female(alice) → Mother(alice) ✓, but the Female → Person
 * derivation is missing → returns 'undetermined' instead of 'true'.
 *
 * The canary asserts: stub-result on F_3 == 'true' (matches F_1). Buggy
 * projector that drops the rule produces stub-result on F_3 == 'undetermined'
 * → test failure → silent-entailment-collapse caught.
 *
 * ── Phase 3 entry re-exercise per architect Q3 ruling 2026-05-06 ──────────
 *
 * Phase 3's real evaluate() per API §7.1 re-exercises this canary's
 * discriminating query. Per phase3Reactivation.divergenceTrigger below:
 * if real evaluate returns 'undetermined' where the stub returned 'true',
 * ESCALATE — the round-trip lost an entailment. If real returns 'true' as
 * the stub did, NORMAL.
 */

const PREFIX = "http://example.org/test/parity_canary_query_preservation/";
const MOTHER = PREFIX + "Mother";
const FEMALE = PREFIX + "Female";
const PERSON = PREFIX + "Person";
const ALICE = PREFIX + "alice";

/** @type {object} */
export const fixture = {
  /**
   * Lift+project+re-lift round-trip fixture: input is OWL ontology.
   * Test runner dispatches via owlToFol(input) → folToOwl(F_1) → owlToFol(projected) → F_3.
   * Then stub-evaluator runs the discriminating query on both F_1 and F_3.
   */
  input: {
    ontologyIRI: "http://example.org/test/parity_canary_query_preservation",
    prefixes: {
      ex: PREFIX,
    },
    tbox: [
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: MOTHER },
        superClass: { "@type": "Class", iri: FEMALE },
      },
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: FEMALE },
        superClass: { "@type": "Class", iri: PERSON },
      },
    ],
    abox: [
      {
        "@type": "ClassAssertion",
        class: { "@type": "Class", iri: MOTHER },
        individual: ALICE,
      },
    ],
    rbox: [],
  },

  /**
   * Discriminating query for stub-evaluator. Atomic positive query.
   *
   * Q := Person(alice)?
   *
   * Stub evaluation: backward-chain via two SubClassOf-derived rules
   * (Mother → Female → Person), terminating at the asserted Mother(alice)
   * fact. Returns 'true' on both F_1 (lifted FOL) and F_3 (re-lifted FOL
   * after lift→project→re-lift round-trip).
   */
  discriminatingQuery: {
    "@type": "fol:Atom",
    predicate: PERSON,
    arguments: [{ "@type": "fol:Constant", iri: ALICE }],
  },

  expectedOutcome: {
    summary:
      "Round-trip preservation of an entailed query. Lift+project+re-lift " +
      "of the OWL input produces F_3 byte-equivalent to F_1 (modulo " +
      "canonicalization). Stub-evaluator on the discriminating query " +
      "Person(alice)? returns 'true' on both F_1 and F_3 via backward-chain " +
      "through two SubClassOf-derived rules + the Mother(alice) ABox fact. " +
      "Failure mode: projector silently drops one of the SubClassOf rules " +
      "(e.g., buggy pair-matching) → F_3 lacks the entailment chain → " +
      "stub returns 'undetermined' on F_3 instead of 'true' → canary fires.",
    fixtureType: "round-trip-with-stub-evaluator-query",
    discriminatingQueryStubResult: "true",
    canaryRole: "query-preservation-positive-case",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "the projector producing a round-tripped OWL surface where a previously- " +
    "entailed query Q silently degrades to 'undetermined' (lost-entailment " +
    "failure mode); specifically: silently dropping SubClassOf axioms via " +
    "buggy pair-matching that mis-collapses two unrelated SubClassOf into a " +
    "spurious EquivalentClasses, OR dropping one SubClassOf during " +
    "class-expression reconstruction recursion, OR similar entailment-chain- " +
    "breaking projector bugs.",

  "expected_v0.1_verdict": {
    ringStatus: "ring2-passes-with-stub-evaluator-query-preservation",
    phaseAuthored: 2,
    phaseActivated: 2,
    expectedRoundTripBehavior: {
      structuralEquivalence: "F_3 byte-equivalent to F_1 (modulo canonicalization)",
      lossSignatureCount: 0,
      recoveryPayloadCount: 0,
      stubQueryOnF1: "true",
      stubQueryOnF3: "true",
      stubQueryPreservation: "F_3 result equals F_1 result",
    },
    expectedProjectionStrategy: "direct",
  },

  "expected_v0.2_elk_verdict": null,

  /**
   * Phase 3 entry re-exercise per architect Q3 ruling 2026-05-06. Phase 3's
   * real evaluate() per API §7.1 replaces the stub-evaluator. The real
   * evaluator MAY have richer semantics (Skolem elimination, closed-world
   * support, non-Horn fallback) that the stub lacks; the divergence-trigger
   * documents the meaningful divergence direction for this canary.
   */
  phase3Reactivation: {
    gatedOn: "real-evaluator-via-API-§7.1",
    query: "Person(alice)? — atomic positive entailment query",
    expectedResult:
      "'true' (must match stub) — real evaluator's Horn-resolution chain through " +
      "the two SubClassOf-derived rules terminating at Mother(alice) is identical " +
      "to the stub's backward-chain trace.",
    divergenceTrigger:
      "If real evaluate() returns 'undetermined' where the stub returned 'true', " +
      "ESCALATE: round-trip lost the SubClassOf-chain entailment between Phase 2 and " +
      "Phase 3 — possibly a regression in the projector's class-expression handling " +
      "or pair-matching during the Phase 3 work. " +
      "If real returns 'true' (matching stub), NORMAL — Phase 3's evaluator handles " +
      "this case at least as well as the stub did.",
  },

  meta: {
    verifiedStatus: "Verified",
    phase: 2,
    authoredAt: "2026-05-XX",
    authoredBy:
      "SME persona, Phase 2 Step 8 stub-evaluator + parity-canary path-fence-authoring pass",
    relatedFixtures: [
      "p1_subclass_chain (Phase 1 verified-status SubClassOf-chain lifter exerciser; this canary's input is a 2-hop chain mirroring p1_subclass_chain's pattern)",
      "p1_abox_assertions (ClassAssertion convention precedent)",
      "parity_canary_negative_query (sibling canary — OWA-preservation through round-trip)",
      "parity_canary_visual_equivalence_trap (sibling canary — engineered semantic-shift detection)",
    ],
    relatedSpecSections: [
      "spec §6.3 (default OWA negation handling)",
      "spec §8.1 (round-trip parity criterion — Phase 2 entry packet §3.4 extends to query-preservation)",
      "API §6.2 (folToOwl signature)",
      "API §6.3 (roundTripCheck — Step 7 shipped at 44447c9)",
      "API §7.1 (evaluate — Phase 3 deliverable; replaces stub-evaluator)",
    ],
    relatedADRs: [
      "ADR-007 §1 (lifter emits classical FOL — informs the stub-evaluator's classical-Horn-resolution discipline)",
    ],
    architectAuthorization:
      "Phase 2 entry packet §3.4 (architect-ratified 2026-05-06); architect Q3 ruling on stub-evaluator harness contract + Phase 3 re-exercise gate.",
  },
};

export const meta = fixture.meta;
