/**
 * Phase 3 fixture — Per-predicate CWA: closed predicate produces 'false'.
 *
 * Per Phase 3 entry packet §3.5 + architect Q-3-E ratification 2026-05-08 (step-N-bind):
 * Step 4 (closedPredicates + per-predicate CWA per spec §6.3 + §6.3.2; closedPredicates
 * is the QueryParameters.closedPredicates field per API §2 consumed by `evaluate` per
 * API §7.1) authoring fills full body. Stub at Pass 2a; reason-code label corrected
 * + API spec section reference corrected per Q-3-Step4-A ratification 2026-05-09 +
 * Cat 7 verification-ritual side-finding (cwa_closed_predicate sister-fixture editorial-
 * correction absorbed into Step 4 implementation commit per Aaron Step 4 routing 2026-05-09).
 *
 * Status: Verified. Step 4 binding fills body.
 *
 * Exercises: query with closedPredicates: {Knows} produces 'false' for failing
 * SLD goal on named individuals. Discrimination from cwa_open_predicate
 * sibling: this fixture exercises CLOSED predicate behavior (CWA-derived 'false'
 * with reason 'inconsistent' per ADR-007 §11 reuse-existing-reason-code discipline);
 * the sibling exercises OPEN predicate behavior (default OWA producing 'undetermined'
 * with reason 'open_world_undetermined' per Q-3-Step4-A option β ratification).
 */

const PREFIX = "http://example.org/test/cwa_closed_predicate/";

/** @type {object} */
export const fixture = {
  input: {
    ontologyIRI: "http://example.org/test/cwa_closed_predicate",
    prefixes: { ex: PREFIX },
    tbox: [],
    abox: [
      { "@type": "ClassAssertion", class: { "@type": "Class", iri: PREFIX + "Person" }, individual: PREFIX + "alice" },
    ],
    rbox: [],
  },

  // Stub query — Step 4 authoring fills closedPredicates + discriminating query
  query: {
    "@type": "fol:Atom",
    predicate: PREFIX + "Knows",
    arguments: [
      { "@type": "fol:Constant", iri: PREFIX + "alice" },
      { "@type": "fol:Constant", iri: PREFIX + "bob" },
    ],
  },

  closedPredicates: [PREFIX + "Knows"],

  expectedOutcome: {
    summary:
      "Step 4 implementation contract: query Knows(alice, bob)? with closedPredicates: " +
      "{Knows} produces 'false' with reason 'inconsistent' (CWA-derived; the predicate is " +
      "closed; no derivation succeeds; the closed-predicate NAF case is structurally a " +
      "refutation under closed-world semantics, matching the existing 'inconsistent' reason " +
      "per ADR-007 §11 reuse-existing-reason-code discipline; no 'closed_world_negation' " +
      "code introduced per Q-3-Step3-B refinement 1 2026-05-09).",
    fixtureType: "evaluate-with-closedPredicates",
    canaryRole: "per-predicate-cwa-closed-discriminator",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "closedPredicates failure: implementation ignores closedPredicates parameter and returns " +
    "'undetermined' instead of 'false'; implementation applies CWA globally instead of per-predicate; " +
    "implementation populates wrong reason code (e.g., uses non-existent 'closed_world_negation' " +
    "instead of the canonical 'inconsistent' per ADR-007 §11).",

  "expected_v0.1_verdict": {
    ringStatus: "ring3-passes-step-4-implementation",
    phaseAuthored: 3,
    phaseActivated: 3,
    expectedResult: "false",
    expectedReason: "inconsistent",
  },

  "expected_v0.2_elk_verdict": null,

  meta: {
    verifiedStatus: "Verified",
    phase: 3,
    activationTiming: "step-N-bind",
    stepBinding: 4,
    authoredAt: "2026-05-08",
    authoredBy: "SME persona, Pass 2a stub authoring; Step 4 implementation cycle stub-fill 2026-05-09",
    relatedSpecSections: [
      "spec §6.3 (default OWA framing)",
      "spec §6.3.2 (per-predicate CWA)",
      "API §2 (QueryParameters.closedPredicates field)",
      "API §7.1 (evaluate consumes QueryParameters)",
      "ADR-007 §11 (FOL → Tau Prolog clause translation; closed-predicate reason mapping)",
    ],
    relatedFixtures: ["cwa_open_predicate (sibling: open predicate produces 'undetermined' with open_world_undetermined)"],
    architectAuthorization: "Phase 3 entry packet §3.5 ratified 2026-05-08; step-N-bind per Q-3-E split; Q-3-Step4-A option β ratified 2026-05-09; Cat 7 verification-ritual side-finding absorbed per Aaron Step 4 routing 2026-05-09.",
  },
};

export const meta = fixture.meta;
