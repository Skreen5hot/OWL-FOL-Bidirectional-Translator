/**
 * Phase 3 fixture — Per-predicate CWA: open predicate produces 'undetermined' with open_world_undetermined.
 *
 * Per Phase 3 entry packet §3.5 + architect Q-3-E ratification 2026-05-08 (step-N-bind):
 * Step 4 (closedPredicates + per-predicate CWA per spec §6.3 + §6.3.2; closedPredicates is the `QueryParameters.closedPredicates` field per API §2 consumed by `evaluate` per API §7.1) authoring
 * fills full body. Stub at Pass 2a; reason-code label corrected per Q-3-Step4-A
 * ratification 2026-05-09.
 *
 * Status: Draft (stub). Step 4 binding.
 *
 * Exercises: same query as cwa_closed_predicate sibling but WITHOUT closedPredicates.
 * Default OWA per spec §6.3 produces 'undetermined' with open_world_undetermined reason
 * (canonical reason code per src/kernel/reason-codes.ts line 31; the OWA-stance
 * "neither query nor its negation provable" semantic). Discriminates the OWA-default
 * behavior from the CWA-closed-per-predicate behavior; the pair together verify that
 * closedPredicates is the ONLY trigger for CWA-derived 'false'.
 */

const PREFIX = "http://example.org/test/cwa_open_predicate/";

/** @type {object} */
export const fixture = {
  input: {
    ontologyIRI: "http://example.org/test/cwa_open_predicate",
    prefixes: { ex: PREFIX },
    tbox: [],
    abox: [
      { "@type": "ClassAssertion", class: { "@type": "Class", iri: PREFIX + "Person" }, individual: PREFIX + "alice" },
    ],
    rbox: [],
  },

  query: {
    "@type": "fol:Atom",
    predicate: PREFIX + "Knows",
    arguments: [
      { "@type": "fol:Constant", iri: PREFIX + "alice" },
      { "@type": "fol:Constant", iri: PREFIX + "bob" },
    ],
  },

  // No closedPredicates — default OWA applies
  closedPredicates: undefined,

  expectedOutcome: {
    summary:
      "Step 4 implementation contract: query Knows(alice, bob)? without closedPredicates " +
      "produces 'undetermined' with open_world_undetermined reason (default OWA per spec §6.3 " +
      "— no proof of Knows, no proof of negation, predicate not closed; canonical reason code " +
      "per Q-3-Step4-A ruling 2026-05-09).",
    fixtureType: "evaluate-default-owa",
    canaryRole: "per-predicate-cwa-open-discriminator",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "OWA-default failure: implementation applies CWA globally and returns 'false' instead of " +
    "'undetermined' (the wrong silent-failure mode); implementation returns 'undetermined' but " +
    "with wrong reason code (e.g., unbound_predicate instead of open_world_undetermined per " +
    "Q-3-Step4-A Option γ refusal — the open-predicate NAF case is an OWA-stance semantic, " +
    "not a predicate-state semantic).",

  "expected_v0.1_verdict": {
    ringStatus: "ring3-passes-step-4-implementation",
    phaseAuthored: 3,
    phaseActivated: 3,
    expectedResult: "undetermined",
    expectedReason: "open_world_undetermined",
  },

  "expected_v0.2_elk_verdict": null,

  meta: {
    verifiedStatus: "Verified",
    phase: 3,
    activationTiming: "step-N-bind",
    stepBinding: 4,
    authoredAt: "2026-05-08",
    authoredBy: "SME persona, Pass 2a stub authoring; Step 4 micro-cycle reason-code correction 2026-05-09; Step 4 implementation cycle stub-fill 2026-05-09",
    relatedSpecSections: [
      "spec §6.3 (default OWA framing)",
      "spec §6.3.2 (per-predicate CWA)",
      "API §2 (QueryParameters.closedPredicates field)",
      "API §7.1 (evaluate consumes QueryParameters)",
      "ADR-007 §11 (FOL → Tau Prolog clause translation; open-predicate reason mapping)",
    ],
    relatedFixtures: ["cwa_closed_predicate (sibling: closed predicate produces 'false' via CWA)"],
    architectAuthorization: "Phase 3 entry packet §3.5 ratified 2026-05-08; step-N-bind per Q-3-E split; Q-3-Step4-A option β ratified 2026-05-09.",
  },
};

export const meta = fixture.meta;
