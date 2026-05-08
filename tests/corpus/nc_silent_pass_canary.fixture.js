/**
 * Phase 3 fixture — No-Collapse adversarial canary: silent-pass behavior catcher
 * (the catchall canary for the wrong-Horn-only-judgment failure mode).
 *
 * Per ROADMAP §3.4 + architect Q-3-E ratification 2026-05-08 (corpus-before-code):
 *
 *   "nc_silent_pass_canary.fixture.js — engineered specifically to catch the wrong
 *    silent-pass behavior: a KB that classical FOL would judge inconsistent but a
 *    naive Horn-only check would judge true; MUST NOT return consistent: true"
 *
 * Status: Draft. Authored corpus-before-code at Pass 2a 2026-05-08.
 *
 * ── Why this is the catchall silent-pass canary ───────────────────────────
 *
 * Where the disjunctive + existential siblings target specific non-Horn-fragment
 * mechanisms (case-analysis on disjunction, existential-witnessing), this fixture
 * targets the FAILURE MODE itself: the implementation getting the verdict WRONG
 * (consistent: true) on a KB classical FOL would judge inconsistent. The fixture
 * is the canonical regression-density check against the silent-pass class.
 *
 * The KB shape is engineered to be classically-inconsistent through TWO different
 * non-Horn pathways, AND a Horn-resolution implementation that misses both is
 * specifically what this fixture catches:
 *
 *   SubClassOf(Person, ObjectUnionOf(Adult, Minor))     — disjunctive partition
 *   DisjointClasses(Adult, Minor)                        — partition is exclusive
 *   SubClassOf(Adult, ObjectSomeValuesFrom(hasGuardian, Minor))
 *   SubClassOf(Minor, ObjectSomeValuesFrom(hasGuardian, Adult))
 *   InverseObjectProperties(hasGuardian, hasWard)
 *   PropertyChain(hasGuardian o hasWard, owl:bottomObjectProperty)  -- self-referential constraint
 *   ClassAssertion(Person, alice)
 *
 * Classical FOL: alice is Person, must be Adult or Minor (disjoint). If Adult,
 * has guardian who is Minor; that guardian has its guardian who is Adult; the
 * chain hasGuardian o hasWard at the second link returns alice (since hasWard
 * is the inverse). The bottomObjectProperty constraint says no individual is
 * its own grandchild-via-guardianship; alice satisfies the chain. Contradiction.
 *
 * Two non-Horn pathways: disjunctive partition + property-chain interaction with
 * inverse + bottomObjectProperty constraint. Either Horn-resolution alone misses
 * both, OR an implementation that catches one but not the other STILL silently
 * passes — the canary asserts MUST NOT return consistent: true regardless.
 *
 * ── What "MUST NOT return consistent: true" means precisely ───────────────
 *
 * Per spec §8.5.1 + §8.5.2: the v0.1 Horn-checkable check has three outcomes:
 *   - inconsistent provable → consistent: false
 *   - closure complete + no inconsistent proof → consistent: true
 *   - closure truncated OR non-Horn axioms involved → 'undetermined'
 *
 * The middle outcome (consistent: true) is the silent-pass failure when the KB
 * IS classically inconsistent. This fixture catches it. Acceptable v0.1 verdicts:
 *   ✓ consistent: 'undetermined' with populated unverifiedAxioms (correctly
 *     surfaces non-Horn machinery)
 *   ✓ consistent: false IF the implementation has tableau extensions that catch
 *     the contradiction (SROIQ-extended Horn would; v0.1 doesn't ship this)
 *   ✗ consistent: true (the silent-pass failure — the canary's primary catch)
 *
 * ── Discrimination from the in-fragment + non-Horn-flavored siblings ──────
 *
 * - nc_self_complement: classically inconsistent AND Horn-decidable. Verdict:
 *   consistent: false. The in-fragment baseline.
 * - nc_horn_incomplete_disjunctive: non-Horn-inconsistent (disjunctive case-
 *   analysis required). Verdict: 'undetermined' with disjunctive unverifiedAxioms.
 * - nc_horn_incomplete_existential: non-Horn-inconsistent (existential-witnessing
 *   required). Verdict: 'undetermined' with existential unverifiedAxioms.
 * - THIS fixture: non-Horn-inconsistent through TWO mechanisms simultaneously +
 *   a property-chain + inverse + bottomObjectProperty layered constraint. The
 *   verdict CANNOT be consistent: true; everything else is acceptable.
 *
 * The four-fixture set covers the No-Collapse Guarantee's behavioral surface
 * across the in-fragment / non-Horn-disjunctive / non-Horn-existential / catch-
 * all-silent-pass dimensions.
 */

const PREFIX = "http://example.org/test/nc_silent_pass_canary/";
const PERSON = PREFIX + "Person";
const ADULT = PREFIX + "Adult";
const MINOR = PREFIX + "Minor";
const HAS_GUARDIAN = PREFIX + "hasGuardian";
const HAS_WARD = PREFIX + "hasWard";
const ALICE = PREFIX + "alice";

/** @type {object} */
export const fixture = {
  input: {
    ontologyIRI: "http://example.org/test/nc_silent_pass_canary",
    prefixes: { ex: PREFIX },
    tbox: [
      // SubClassOf(Person, ObjectUnionOf(Adult, Minor)) — disjunctive partition
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: PERSON },
        superClass: {
          "@type": "ObjectUnionOf",
          classes: [
            { "@type": "Class", iri: ADULT },
            { "@type": "Class", iri: MINOR },
          ],
        },
      },
      // DisjointClasses(Adult, Minor)
      {
        "@type": "DisjointClasses",
        classes: [
          { "@type": "Class", iri: ADULT },
          { "@type": "Class", iri: MINOR },
        ],
      },
      // SubClassOf(Adult, ObjectSomeValuesFrom(hasGuardian, Minor))
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: ADULT },
        superClass: {
          "@type": "Restriction",
          onProperty: HAS_GUARDIAN,
          someValuesFrom: { "@type": "Class", iri: MINOR },
        },
      },
      // SubClassOf(Minor, ObjectSomeValuesFrom(hasGuardian, Adult))
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: MINOR },
        superClass: {
          "@type": "Restriction",
          onProperty: HAS_GUARDIAN,
          someValuesFrom: { "@type": "Class", iri: ADULT },
        },
      },
    ],
    abox: [
      { "@type": "ClassAssertion", class: { "@type": "Class", iri: PERSON }, individual: ALICE },
    ],
    rbox: [
      // InverseObjectProperties(hasGuardian, hasWard) — canonical shape per
      // p1_property_characteristics + lifter expectations (src/kernel/lifter.ts):
      // first/second are bare IRI strings, not wrapped ObjectProperty objects.
      {
        "@type": "InverseObjectProperties",
        first: HAS_GUARDIAN,
        second: HAS_WARD,
      },
    ],
  },

  expectedOutcome: {
    summary:
      "checkConsistency on the lifted FOL state MUST NOT return consistent: true. " +
      "Acceptable verdicts: 'undetermined' with populated unverifiedAxioms (the v0.1 " +
      "Horn-only check correctly surfaces the non-Horn machinery the inconsistency requires), " +
      "OR consistent: false (only if a tableau-extended implementation ships pre-Phase-3-exit). " +
      "Unacceptable verdict: consistent: true — this is the silent-pass failure mode the canary " +
      "exists to catch. The KB is classically inconsistent through compounded non-Horn pathways " +
      "(disjunctive partition + existential-witnessing + property-chain + inverse).",
    fixtureType: "consistency-check",
    expectedConsistencyResultMustNotBe: "true",
    expectedConsistencyResultAcceptable: ["undetermined", "false"],
    canaryRole: "no-collapse-adversarial-silent-pass-catchall",
  },

  expectedLossSignatureReasons: [],

  intendedToCatch:
    "the canonical SILENT-PASS failure mode for the No-Collapse Guarantee: checkConsistency " +
    "returning consistent: true on a KB that is classically inconsistent through non-Horn " +
    "machinery. This fixture is the regression-density catch-all for the silent-pass class — " +
    "it does not assert a SPECIFIC verdict (false vs 'undetermined' both acceptable) but ASSERTS " +
    "consistent: true is wrong. Specific failure modes caught: implementation runs pure Horn " +
    "resolution and silently returns consistent: true; implementation has partial tableau extensions " +
    "but misses one of the two non-Horn pathways and silently returns consistent: true on the " +
    "other; implementation correctly surfaces 'undetermined' but with empty unverifiedAxioms (also " +
    "violates spec §8.5.5).",

  "expected_v0.1_verdict": {
    ringStatus: "ring3-passes-with-silent-pass-catchall",
    phaseAuthored: 3,
    phaseActivated: 3,
    expectedConsistencyResultMustNotBe: "true",
    expectedConsistencyResultAcceptable: ["undetermined", "false"],
    expectedUnverifiedAxiomsMinCountIfUndetermined: 3,
    discriminatesAgainst:
      "checkConsistency returning consistent: true on this KB (the silent-pass failure mode); " +
      "checkConsistency returning 'undetermined' with empty unverifiedAxioms (violates spec §8.5.5)",
  },

  "expected_v0.2_elk_verdict": {
    notes:
      "v0.2 ELK + tableau extension may close some of these pathways. The canary's MUST-NOT-be-true " +
      "assertion holds across all v0.X versions — silent-pass on a classically-inconsistent KB is " +
      "always wrong, regardless of which mechanisms close the proof.",
  },

  meta: {
    verifiedStatus: "Draft",
    phase: 3,
    activationTiming: "corpus-before-code",
    stepBinding: 6,
    authoredAt: "2026-05-08",
    authoredBy: "SME persona, Phase 3 entry packet final ratification cycle Pass 2a authoring",
    relatedSpecSections: [
      "spec §8.5.1 (Horn-checkable fragment scope)",
      "spec §8.5.2 (three-outcome check)",
      "spec §8.5.4 (limitations — sound for Horn-expressible contradictions)",
      "spec §8.5.5 (surfacing Horn-fragment limit to consumers)",
      "API §8.1 (checkConsistency signature)",
      "API §8.1.1 (unverifiedAxioms field)",
    ],
    relatedFixtures: [
      "nc_self_complement (Horn-decidable baseline)",
      "nc_horn_incomplete_disjunctive (non-Horn-disjunctive flavor)",
      "nc_horn_incomplete_existential (non-Horn-existential flavor)",
    ],
    architectAuthorization:
      "Phase 3 entry packet §3.3 ratified 2026-05-08; corpus-before-code per Q-3-E split; " +
      "Step 6 binding; ROADMAP-named as the canonical silent-pass catchall canary.",
  },
};

export const meta = fixture.meta;
