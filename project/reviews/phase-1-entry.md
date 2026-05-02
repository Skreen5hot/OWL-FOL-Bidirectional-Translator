# Phase 1 Entry Review

**Date:** 2026-05-02
**Phase:** 1 — Built-In OWL Lifter
**Plan reference:** `OFBT_implementation_plan_v1 (1).md` §3.2
**Roadmap reference:** [`project/ROADMAP.md`](../ROADMAP.md) Phase 1
**Architect sign-off:** **Received 2026-05-02** — corpus + canaries approved; rationale preserved in §6 of this document.
**Status:** Phase 0 closed; corpus and canaries approved by the architect; Phase 1 implementation may begin upon commit of this review.

---

## 1. Entry Criteria — Confirmation Against the Architect's Four-Item Bar

The architect named four entry-gate items at the close of the Phase 0 amendment cycle. All four resolve below.

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | Phase 0 CI green and held | ✅ | Phase 0 exit summary: clean build, 47/47 tests, purity check (8 kernel files, no violations under tightened rules per ADR-006), corpus manifest gate. See [`project/reviews/phase-0-exit.md`](./phase-0-exit.md). |
| 2 | Aaron's Module-column workstream commitment captured | ✅ | Tracked as a Phase 4 entry blocker in ROADMAP §3.5 entry checklist; ADR-003 records the SME-vs-engineering split. The workstream begins in parallel with Phase 1 and gates Phase 4 entry, not Phase 1. |
| 3 | Built-in OWL test corpus authored and registered | ✅ | 9 standard fixtures + 4 wrong-translation canaries = 13 fixtures total, all registered in [`tests/corpus/manifest.json`](../../tests/corpus/manifest.json) with complete 11-column entries. Manifest gate passes (mirroring `check-corpus-manifest.ts` rules including `hasOwnProperty` on both ELK columns). |
| 4 | Wrong-translation canaries (ROADMAP lines 182-185) confirmed in scope, not deferred | ✅ | All four canaries authored, registered with `phase: 1`, and approved by the architect as exemplary discipline. See §3 below. |

---

## 2. Phase 1 Build Target

Per plan §3.2 and ROADMAP Phase 1 deliverables checklist:

- `owlToFol()` per API spec §6.1 with structured-OWL input handling per API §3
- Class expressions, restrictions, ABox, RBox per API §3.2-§3.7
- **HIGH PRIORITY:** `ObjectPropertyDomain` and `ObjectPropertyRange` lift to **conditional implications**, NOT existential restrictions (API §3.7.1, behavioral §5.8). Two fixtures defend this requirement: [`p1_prov_domain_range`](../../tests/corpus/p1_prov_domain_range.fixture.js) (right shape) + [`canary_domain_range_existential`](../../tests/corpus/canary_domain_range_existential.fixture.js) (wrong shape's absence).
- IRI canonicalization per API §3.10 — three input forms canonicalize identically (canary fixture).
- Datatype canonicalization per spec §5.6.5 (XSD canonical lexical forms).
- Identity rules per spec §5.5 (`owl:sameAs` propagation, with the canary fixture asserting propagation through other predicates).
- RDFC-1.0 blank-node canonicalization via `rdf-canonize`.
- JSON-LD-shaped FOL output per API §4.
- ARC manifest stub: `arcCoverage: 'permissive'` always; properties go through §6.4 fallback with `unknown_relation` Loss Signature. (Strict-mode operational behavior arrives in Phase 4.)
- Lifter rejects all spec §13.1 punted constructs with typed `UnsupportedConstructError` carrying construct-specific identifiers (canary fixture exercises five cases).

---

## 3. Phase 1 Test Corpus — Architect-Approved Inventory

### 3.1 Standard Phase 1 corpus (9 fixtures)

Approved by architect with regime classifications confirmed (`reversible` for cardinality, `equivalent` for the rest).

| Fixture | ROADMAP line | Spec/API sections covered |
|---|---|---|
| [`p1_subclass_chain`](../../tests/corpus/p1_subclass_chain.fixture.js) | 170 | API §3.2, behavioral §5.3 |
| [`p1_equivalent_and_disjoint_named`](../../tests/corpus/p1_equivalent_and_disjoint_named.fixture.js) | 171 | API §3.2, behavioral §5.3 |
| [`p1_restrictions_object_value`](../../tests/corpus/p1_restrictions_object_value.fixture.js) | 172 | API §3.4 (someValuesFrom/allValuesFrom/hasValue) |
| [`p1_restrictions_cardinality`](../../tests/corpus/p1_restrictions_cardinality.fixture.js) | 172 | API §3.4 (cardinality variants); regime: `reversible` |
| [`p1_abox_assertions`](../../tests/corpus/p1_abox_assertions.fixture.js) | 173 | API §3.5, behavioral §5.6 |
| [`p1_owl_same_and_different`](../../tests/corpus/p1_owl_same_and_different.fixture.js) | 174 | Behavioral §5.5 (identity handling — load-bearing) |
| [`p1_property_characteristics`](../../tests/corpus/p1_property_characteristics.fixture.js) | 175 | API §3.7 (Functional/Transitive/Symmetric/InverseOf) |
| [`p1_prov_domain_range`](../../tests/corpus/p1_prov_domain_range.fixture.js) | 176 | API §3.7.1 (canonical) — structural verification per architect's Gap C resolution |
| [`p1_blank_node_anonymous_restriction`](../../tests/corpus/p1_blank_node_anonymous_restriction.fixture.js) | 177 | Behavioral §5.7 (RDFC-1.0) |

### 3.2 Wrong-Translation Canaries (4 fixtures, ROADMAP lines 182-185) — IN SCOPE FOR PHASE 1

The architect approved this set and **banked the discipline as exemplary** for future phases: each canary asserts the wrong shape is absent, not just that the right shape is present.

| Fixture | What it forbids the lifter from doing |
|---|---|
| [`canary_domain_range_existential`](../../tests/corpus/canary_domain_range_existential.fixture.js) | Synthesizing an existential successor on every class member when only domain/range is asserted (API §3.7.1.2 forbidden translations) |
| [`canary_same_as_propagation`](../../tests/corpus/canary_same_as_propagation.fixture.js) | Lifting `owl:sameAs` facts but skipping the identity-aware predicate variants — leaving substituted-name queries silently `'undetermined'` |
| [`canary_iri_canonicalization`](../../tests/corpus/canary_iri_canonicalization.fixture.js) | Leaking surface IRI form (CURIE / bracketed / bare) into the canonical FOL state — same axiom in three forms must lift to byte-identical FOL |
| [`canary_punned_construct_rejection`](../../tests/corpus/canary_punned_construct_rejection.fixture.js) | Silently accepting §13.1 punted constructs OR throwing generic `Error` rather than typed `UnsupportedConstructError` with the documented `construct` field (5 cases: `owl:hasKey`, `NegativeObjectPropertyAssertion`, `punning`, `faceted-datatype-restriction`, `annotation-on-annotation`) |

### 3.3 Defense-in-depth on the high-correctness-risk requirement

API §3.7.1 / behavioral §5.8 domain-range existential-restriction wrong translation is the highest-risk requirement in Phase 1. Two fixtures defend it:

- **`p1_prov_domain_range`** — asserts the RIGHT shape (conditional universals).
- **`canary_domain_range_existential`** — asserts the WRONG shape's absence (no synthesized `∀x. Domain(x) → ∃y. P(x,y)`; no `SubClassOf(Domain, ObjectSomeValuesFrom(P, owl:Thing))`; query `∃y. P(lonely_entity, y)` returns `'undetermined'`, not `'true'` via fabricated Skolem).

Two-fixture defense approved without modification by the architect.

### 3.4 Cross-phase activation pattern (banked)

`p1_prov_domain_range` carries an explicit `phase4Reactivation` field on `expectedOutcome` per the architect's Gap C resolution: at Phase 4, the same fixture re-activates with an entailment-query expectation against PROV-O ARC content. The architect banked this pattern as reusable for any fixture whose verification is gated on later-phase ARC content (notably the BFO-gated No-Collapse adversarial fixtures at ROADMAP lines 312-313).

---

## 4. Phase 1 Validation Rings

Per plan §2 and ROADMAP Phase 1:

- **Ring 1 (Conversion Correctness):** EXERCISED. All 13 corpus fixtures must lift with semantically correct FOL output, byte-identical across 100 runs.
- **Ring 2 (Round-Trip Parity + Audit Artifacts):** DEFERRED. Projector does not exist yet (Phase 2 deliverable).
- **Ring 3 (Validator + Consistency Check):** DEFERRED. Validator does not exist yet (Phase 3 deliverable).

The PROV-O entailment-query verification on `p1_prov_domain_range` is also deferred per ROADMAP line 191 — it requires PROV-O ARC content (Phase 4). The Phase 1 fixture verifies structural FOL-tree shape only.

---

## 5. Phase 1 Forward-Tracked Commitments

Banked from the architect's sign-off as Phase 1 **exit** commitments (NOT entry gates):

### 5.1 Skolem-naming convention ADR

When the developer fills in the byte-exact `expectedFOL` literal for the first STRUCTURAL_ONLY fixture during Phase 1, the chosen Skolem-naming convention becomes part of API §6.1.1's determinism contract. **An ADR records the convention** so future implementers know it is load-bearing, not arbitrary. The convention covers:

- Cardinality witness Skolem-naming.
- The exact form of the rule rewrite for Transitive + visited-ancestor threading.
- The canonical form of the RDFC-1.0 b-node Skolem prefix.

ADR lands in [`project/DECISIONS.md`](../DECISIONS.md) before Phase 1 exit review.

### 5.2 STRUCTURAL_ONLY placeholder fill-ins

The three fixtures shipping with `expectedFOL: "STRUCTURAL_ONLY — ..."` placeholders ([`p1_restrictions_cardinality`](../../tests/corpus/p1_restrictions_cardinality.fixture.js), [`p1_property_characteristics`](../../tests/corpus/p1_property_characteristics.fixture.js), [`p1_blank_node_anonymous_restriction`](../../tests/corpus/p1_blank_node_anonymous_restriction.fixture.js)) get byte-exact `expectedFOL` literals consistent with the §5.1 ADR. **One convention, applied consistently across all three fixtures** — no fixture-by-fixture Skolem naming.

The fixtures' `intendedToCatch` and assertion contracts are already complete; only the byte-exact term-tree literals remain.

### 5.3 verifiedStatus promotion

All 13 fixtures carry `verifiedStatus: 'Draft'` in their `meta` exports. Phase 1 exit promotes Draft → Verified once the lifter passes them against running code.

---

## 6. Architect Sign-Off — Preserved Verbatim

Architect approved this corpus and canary set on 2026-05-02. Approval rationale, banked for future-phase precedent:

- **Standard corpus (9 fixtures) — approved.** Coverage is complete; regime classifications are correct (cardinality `reversible`; rest `equivalent`).
- **Canaries (4 fixtures) — approved, banked as exemplary discipline.** Each canary asserts the wrong shape is absent rather than only that the right shape is present. The `intendedToCatch` framing is sharp and audit-ready.
- **High-correctness-risk defense-in-depth — approved without modification.** Two fixtures defend §3.7.1 / §5.8 domain-range correctness.
- **`phase4Reactivation` field on `expectedOutcome` — banked as a reusable pattern.** Any fixture whose verification is gated on later-phase ARC content carries an explicit reactivation field naming the gating phase. Reusable for Phase 3's BFO-gated No-Collapse adversarial fixtures.
- **Snake_case schema rename — approved without amendment.** Banked principle: when an artifact is machine-checkable and a roadmap entry contradicts it, **the artifact wins**. The roadmap is documentation; the schema is enforcement. Third gap of this category surfaced cleanly.
- **STRUCTURAL_ONLY placeholders — approved as scoped, with §5.1 and §5.2 commitments tracked for Phase 1 exit.**
- **`hasOwnProperty` discrimination on ELK columns — approved.** Banked the rigor: `hasOwnProperty` rather than `in` is the right operator for column-presence checks (the developer chose correctly during the S1 amendment cycle).

Banked cycle-discipline principle (architect's words, second clean surfacing): **asking the architect for sign-off on the corpus before implementing the lifter against it is the correct sequencing.** The corpus is the contract the lifter must satisfy; signing off on the contract before code is written prevents the failure mode where the lifter passes tests because the tests were retrofitted to the implementation rather than vice versa.

---

## 7. Risk Notes Carried Into Phase 1

- **Identity transform retirement.** The template's `src/kernel/transform.ts` and the existing spec tests (`tests/determinism.test.ts`, `tests/no-network.test.ts`, `tests/snapshot.test.ts`) are retired this phase as `owlToFol` ships. Per CLAUDE.md §4 ("MUST NOT modify spec tests"), retirement is a deliberate replacement: the spec-test suite expands to exercise the new corpus rather than the identity baseline. The replacement happens *with* `owlToFol` shipping, not before.
- **Tau Prolog peer-dep at runtime.** Phase 0 ships the probe seam ([`src/kernel/tau-prolog-probe.ts`](../../src/kernel/tau-prolog-probe.ts)) for testability without the peer dep installed. Phase 1's ARC fallback path (`§6.4`) and identity-aware predicate rewrites still exercise the seam pattern; the seam is not retired in Phase 1.
- **Cardinality + non-Horn fragments.** The `p1_restrictions_cardinality` fixture is `regime: 'reversible'` because some cardinality semantics fall outside Direct Mapping. Phase 1 lifter must emit the cardinality FOL plus a Loss Signature record so the Phase 2 projector can route to Annotated Approximation. The fixture's `expectedLossSignatureReasons: ["unsupported_construct"]` reflects this.
- **Aaron's parallel workstream.** TSV `Module` column annotation and `[VERIFY]` resolution on rows 49-50 (BFO_0000222 / BFO_0000223) and the canonical-vocabulary cache refresh proceed in parallel with Phase 1 implementation. None gates Phase 1 entry; all gate Phase 4 entry.

---

## 8. Phase 1 Begins

Entry criteria met. Architect sign-off received. Corpus is the approved contract the lifter must satisfy.

**Routing:** Phase 1 implementation work begins after this entry review is committed. Phase 1 exit review will audit:
- All 13 corpus fixtures pass against running `owlToFol`.
- 100-run determinism on each fixture.
- Skolem-naming-convention ADR landed in `project/DECISIONS.md`.
- Three STRUCTURAL_ONLY placeholders filled in consistently with that ADR.
- `verifiedStatus: 'Draft'` on each fixture's `meta` promoted to `'Verified'`.
- Phase 0 CI checks (build, spec tests, purity, corpus manifest, ARC lint) continue to pass.

Phase 1 starts.
