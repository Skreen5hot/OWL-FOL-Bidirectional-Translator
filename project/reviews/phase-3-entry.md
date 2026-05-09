# Phase 3 Entry Review — AMENDED + RATIFIED

**Date:** 2026-05-08 (initial DRAFT); 2026-05-08 (amendment cycle per architect initial-review rulings on Q-3-A through Q-3-G + §3 corpus shape + cycle-2 sequencing); 2026-05-08 (architect final ratification on amended packet)
**Phase:** 3 — Validator, Evaluation, and Consistency Check
**Plan reference:** [`OFBT_implementation_plan_v1 (1).md`](../OFBT_implementation_plan_v1%20(1).md) §3.4
**Roadmap reference:** [`project/ROADMAP.md`](../ROADMAP.md) Phase 3
**Predecessor:** [`project/reviews/phase-2-exit.md`](./phase-2-exit.md) (closed `97e9ade` 2026-05-07; stakeholder remediation cycle landed 2026-05-08)
**Status:** **AMENDED + RATIFIED 2026-05-08.** Cycle history: (1) Initial DRAFT 2026-05-08 → (2) architect initial-review rulings on Q-3-A through Q-3-G + §3 corpus shape ratification + cycle-2 two-pass sequencing + 7 banked principles + cycle-accounting principle → (3) AMENDED packet folding all rulings (Step ledger framings per Q-3-A + Q-3-B + Q-3-C; corpus activation-timing tagging per Q-3-E; cycle-2 split into Pass 2a + Pass 2b per Q-3-G; §11 + §12 filled from architect ruling text verbatim) → (4) **architect final ratification on amended packet 2026-05-08 with amendment-shape verification across all nine correspondence checks (✓ all match)** + 2 additional banked principles (three-way disposition ladder + §11 verbatim transcription discipline) + cycle-accounting refinement (per-phase entry-cycle counters increment per ratification cycle within phase entry; this cycle's counter at 2). Per the cycle-discipline principle banked at Phases 1 and 2 entry — *the corpus is the contract the implementation must satisfy; signing off on the contract before code is written prevents the failure mode where the implementation passes tests because the tests were retrofitted to the implementation* — Phase 3 entry packet ratification precedes Phase 3 implementation Step 1. **Pass 2a developer commit unblocked: amended entry packet + 8 corpus-before-code fixtures + manifest entries.** Pass 2b cycles (I5 ADR-007 §10 promotion + I6 Phase 2 exit packet update + I7 strategy_routing_annotated fixture amendment) route in parallel; do not gate Phase 3 Step 1.

---

## 0. Why this packet routes to the architect first

Cycle-discipline principle from Phase 1 + Phase 2 entry, applied identically to Phase 3:

> *The corpus is the contract the implementation must satisfy. Signing off on the contract before code is written prevents the failure mode where the implementation passes tests because the tests were retrofitted to the implementation.*

Phase 3 is the **first phase exit where the full validation pipeline (Rings 1–3) operates against built-in OWL**. The novel ring is Ring 3 (Validator + Consistency Check). Three new API surfaces — `evaluate()`, `checkConsistency()`, plus the per-API error surface — land in this phase. Each is constrained by the frozen v0.1.7 spec/API contracts and by inherited items from Phase 2's exit cycle. The entry packet enumerates:

1. **Entry-criteria confirmation** against plan §3.4 + ROADMAP — §1.
2. **Phase 3 build target** against the spec/API frozen surface — §2.
3. **Phase 3 corpus + canary inventory** — §3. *This is the contract.* Architect sign-off (received 2026-05-08) freezes the corpus for Phase 3.
4. **Inherited items from Phase 2 exit + stakeholder-remediation cycle 2** — §4.
5. **Architectural questions ruled** (Q-3-A through Q-3-G) — §5.
6. **Validation rings status** — §6.
7. **Phase 3 Step Ledger** (per Q-3-A ratification) — §7.
8. **Risk notes carried into Phase 3** — §8.
9. **What architect final ratification opens — Pass 2a vs Pass 2b** — §9.
10. **SME certification** — §10.
11. **Architect Q-rulings resolved** — §11.
12. **Architect-banked principles from this cycle** — §12.
13. **Forward-references** — §13.

Developer scaffolds Phase 3 Step 1 AFTER architect issues final ratification on this AMENDED packet AND the Pass 2a final ratification commit lands and remote CI is green. Pass 2b (I5 ADR-007 §10 + I6 Phase 2 exit packet update + I7 fixture reconciliation) routes in parallel via separate cycles per Q-3-G two-pass sequencing; does not block Step 1.

---

## 1. Entry Criteria — Confirmation Against Plan §3.4 + ROADMAP

Plan §3.4 names one entry criterion. ROADMAP Phase 3 Entry Review names two. All resolve below.

| # | Criterion | Source | Status | Evidence |
|---|---|---|---|---|
| 1 | Phase 2 exited (Rings 1 and 2 passing on built-in OWL corpus) | Plan §3.4; ROADMAP | ✅ | [`project/reviews/phase-2-exit.md`](./phase-2-exit.md) closed 2026-05-07 at commit `97e9ade`; stakeholder-remediation cycle landed 2026-05-08 at commit `b2c555e`. 27 corpus fixtures (15 Phase 1 + 12 Phase 2) passing; Ring 1 (Conversion Correctness) + Ring 2 (Round-Trip Parity + Audit Artifacts) green. |
| 2 | Audit artifact type definitions stable | Plan §3.3 carryforward | ✅ | API §6.4.1–§6.4.3 frozen at v0.1.7; `LossSignature` 8-level severity ordering exported as `LOSS_SIGNATURE_SEVERITY_ORDER` per API §6.4.1; `RecoveryPayload` + `ProjectionManifest` schemas stable; `@id` content-addressing per ADR-011 (Accepted 2026-05-07). |
| 3 | Three-strategy projector operational | Phase 2 close | ✅ | Direct Mapping (Steps 2 + 3a + 3b + 3c), Property-Chain Realization (Step 6), Annotated Approximation (Step 4a) all shipped. Strategy router with tiered fallthrough at Step 5; per-axiom strategy attribution recorded per API §6.4. |
| 4 | Round-trip parity validator (`roundTripCheck`) operational | Phase 2 Step 7 | ✅ | API §6.3 contract per spec §8.1, now framed as **structural round-trip parity** per Q-Frank-1 editorial correction 2026-05-08 (qualifier landed at commit `b2c555e`). Forward-tracking note in spec §8.1 distinguishes structural from model-theoretic / axiomatic / entailment-preserving senses. |
| 5 | Stub-evaluator harness for parity canaries | Phase 2 Step 8 | ✅ | `tests/corpus/_stub-evaluator.js` per architect Q3 ruling 2026-05-06; SME-authored leading-JSDoc capability table; bounded-Horn-resolution evaluator. 3 parity canaries (`parity_canary_query_preservation`, `parity_canary_negative_query`, `parity_canary_visual_equivalence_trap`) ship with `phase3Reactivation` discriminating-query / expected-result / divergence-trigger fields. |
| 6 | Phase 2 exit deliverables committed and pushed | Phase 2 exit packet §1 | ✅ | All six α-cadence sub-step commits landed (`5bd9da7` through `97e9ade`); stakeholder-remediation cycle landed `b2c555e` 2026-05-08. Phase 2 exit packet ratified; ROADMAP Phase 2 status flipped to ✅ Closed. |
| 7 | Phase 2 entry-checklist Phase 4 vendoring item carried forward | Phase 2 entry packet §1 Item 6 + ADR-010 | ⏭ Forward-track | License-verification block for `bfo-2020.clif` Layer B vendoring lands at Phase 4 entry per banked principle from ADR-010 Q-γ ruling. Not a Phase 3 gate. |
| 8 | Cycle 2 architect-mediated work — splits two passes per Q-3-G ruling 2026-05-08 | Q-Frank-2 + Q-Frank-4 + I7 (this packet §4) | ⏭ Two-pass sequencing | **Pass 2a:** Phase 3 entry packet final ratification commit lands the amended entry packet + 8 corpus-before-code fixtures (4 No-Collapse adversarial + 4 hypothetical-axiom per Q-3-E). **Pass 2b (parallel, separate routing):** I5 ADR-007 §10 promotion, I6 Phase 2 exit packet update (Q-Frank-4 publication commitment + Q-3-C closure reference), I7 `strategy_routing_annotated` fixture amendment — each gets its own SME→architect→Developer routing cycle. Pass 2a unblocks Phase 3 Step 1; Pass 2b proceeds in parallel without blocking implementation. |

**Item 8 disposition (per architect Q-3-G ruling 2026-05-08):** **two passes, not one.** Entry-packet-internal amendments (Q-3-A through Q-3-F substance) land in Pass 2a alongside this packet's final ratification. ADR-007 §10 promotion + Phase 2 exit packet update + `strategy_routing_annotated` fixture amendment have substantive ratification surfaces of their own and route in Pass 2b — preserves the audit-trail-unity-per-surface discipline (same as the bundled ADR-008/009 cycle precedent). Phase 3 implementation Step 1 begins after Pass 2a final ratification commit lands and remote CI is green; Pass 2b proceeds in parallel without blocking Step 1.

---

## 2. Phase 3 Build Target

Per plan §3.4 + ROADMAP Phase 3 Deliverables Checklist + frozen API spec §7 + §8 + §2 + §6 + frozen behavioral spec §5.4 + §6.3 + §8.5:

### 2.1 `evaluate()` — API §7.1 + §7.5

- `evaluate(folState, query, options?)` per API §7.1 returning the three-state result
- `EvaluableQuery = FOLAtom | FOLConjunction` restriction per API §7.5
- `UnsupportedConstructError` thrown for FOLAxiom variants outside the `EvaluableQuery` subset, with the documented `suggestion` field per API §7.5

### 2.2 Three-state result + reason enum — API §7.2

- Three-state result: `'true'` | `'false'` | `'undetermined'` per API §7.2
- 16-member reason enum per API §7.2:
  - `'derivation_complete'`, `'no_derivation_found'`, `'closed_world_negation'`, `'naf_residue'`, `'cycle_detected'`, `'step_cap_exceeded'`, `'aggregate_step_cap_exceeded'`, `'unknown_relation'`, `'closure_truncated'`, `'una_residue'`, `'arity_flattening'`, `'coherence_indeterminate'`, `'coherence_violation'`, `'bnode_introduced'`, `'lexical_distinct_value_equal'`, `'horn_incomplete'`
  - Each code returned in the documented circumstances per spec §6.3 + §8.5

### 2.3 Step caps — API §7.2 + §7.4

- Per-query default 10K step cap per API §7.2
- Optional aggregate session cap per API §7.4
- Configurable throw-on-cap behavior per API §7.4
- `step_cap_exceeded` reason code returned (or thrown per consumer config)

### 2.4 Typed-error hierarchy completion — API §10 + spec §6.1

- `UnsupportedConstructError` thrown for FOLAxiom variants outside `EvaluableQuery` subset; `suggestion` field populated per API §7.5 (Step 1 deliverable)
- **`NoStrategyAppliesError`** introduced as the **13th** typed error class in API §10's hierarchy per architect Q-3-C ruling 2026-05-08 (Option (a) Throw discipline closing Item 8 from Phase 2 exit risk retrospective). Carries `folAxiom` field (the offending axiom), `attempted: ProjectionStrategy[]` field (the strategies tried), and `code: 'no_strategy_applies'` field per the existing `OFBTError.code` convention. Phase 2's strategy router silent-fallthrough path is amended to throw `NoStrategyAppliesError` per spec §6.1 literal framing
- **`no_strategy_applies`** added as the **17th** member of the reason enum (per ADR-011 banked principle 2 + spec §11.2's additive-enum minor-version-bump discipline; no ADR-011 amendment required — the discipline anticipates additive enum growth)
- `structural_annotation_mismatch`, `arc_manifest_version_mismatch`, `SessionStepCapExceededError` complete the typed-error hierarchy (Step 8 deliverable; see §7 step ledger)

### 2.5 `checkConsistency()` + No-Collapse Guarantee — API §8.1 + spec §8.5

- `checkConsistency(folState, options?)` per API §8.1
- No-Collapse Guarantee per spec §8.5 (scoped to Horn-checkable fragment per §8.5.1)
- Three outcomes per §8.5.2: `inconsistent` provable → `consistent: false`; closure complete + no `inconsistent` proof → `consistent: true`; closure truncated or non-Horn axioms involved → `'undetermined'`

### 2.6 `unverifiedAxioms` — API §8.1.1

- `ConsistencyResult.unverifiedAxioms` populated when `result === 'undetermined'` and `reason === 'coherence_indeterminate'`
- Field surfaces axioms outside the Horn-checkable fragment per spec §8.5.5
- Behavioral commitment: validator implementation tracks which axioms are outside the fragment as it runs, not merely flags the verdict

### 2.7 Hypothetical-axiom case — API §8.1.2

- `axiomSet` parameter participates in `checkConsistency(session, axiomSet)` per API §8.1.2
- Contributes to `unverifiedAxioms` if the hypothetical axioms are non-Horn
- Does not persist: a subsequent `checkConsistency(session)` call MUST see the original session state, not the hypothetical extension

### 2.8 Cycle detection — spec §5.4 + ADR-011

- Cycle detection per spec §5.4's visited-ancestor list + ADR-011's v0.1 cycle-guard policy
- `cycle_detected` reason code returned
- Optional throw-on-cycle per consumer config

### 2.9 `closedPredicates` / per-predicate CWA — spec §6.3.2 + API §6.3

- `closedPredicates` parameter on `evaluate` per API §6.3
- Per-predicate CWA per spec §6.3.2: a query with `closedPredicates: {p}` produces `'false'` for failing `\+ p(x, y)` goals on named individuals
- Same query without `closedPredicates` produces `'undetermined'` with `naf_residue` reason instead

### 2.10 Structural annotation declaration consistency — API §2.1.1

- `structural_annotation_mismatch` thrown when caller-declared structural annotations diverge from the projection's recorded annotation declaration

### 2.11 ARC manifest version mismatch — API §2.1.2

- `arc_manifest_version_mismatch` thrown when session and conversion ARC versions diverge

### 2.12 Session-aggregate step cap — API §2.1

- `SessionStepCapExceededError` thrown when `maxAggregateSteps` is exceeded across queries within a session

### 2.13 NOT in Phase 3 (deferred to later phases per plan)

- ARC content correctness (spec §12 ARC-content criteria) — Phases 4–7
- ELK integration (per spec §13) — v0.2 candidate
- SLG tabling for SLD termination (per spec §13 / ADR-011 v0.2 upgrade) — v0.2
- Compatibility shim, bundle budget enforcement, coverage matrix CI per ADR-008 Option A — Phase 7
- Lifter `ObjectPropertyChain` support — disposition under Q-3-D (Phase 3 surfacing OR Phase 4 deferral)
- OFI deontic ARC module — v0.2 per ADR-008
- Meta-vocabulary reification opt-in per ADR-007 §10 forward-compat clause — v0.2

---

## 3. Phase 3 Test Corpus — SME-Proposed Inventory for Architect Sign-Off

**This is the contract the validator must satisfy.** Architect ratification of §3 (received 2026-05-08) freezes the corpus for Phase 3; Developer scaffolds against it.

**Corpus activation timing per Q-3-E ruling 2026-05-08.** Each fixture below is tagged with one of two activation-timing categories per the architect-banked corpus-before-code-vs-step-N-bind discipline:

- **corpus-before-code** (architectural-commitment-tier; lands in Pass 2a alongside this entry packet's final ratification commit, before Phase 3 Step 1) — exercises spec-named guarantees or API-spec-named behavior contracts
- **step-N-bind** (implementation-detail-tier; lands during Phase 3 implementation alongside the Step that ships the feature) — exercises specific implementation conventions chosen during the corresponding Step

SME's election (per Q-3-E architect-permitted choice): **convention-only, no manifest schema tightening.** Activation-timing tags live as documentation in this entry packet's §3 tables; no `corpusActivationTiming` field added to `manifest.schema.json`. This keeps the entry-packet ratification scope tight; manifest schema tightening can fold into a later cycle if need surfaces.

### 3.1 Phase 1 + Phase 2 corpus continues (27 fixtures, no new authoring)

The 27 existing fixtures (15 Phase 1 + 12 Phase 2, all `verifiedStatus: 'Verified'`) continue to pass Rings 1 and 2 throughout Phase 3 work. No regression in `roundTripCheck` outcomes expected; Ring 3 adds new assertions on top.

### 3.2 Re-exercise gate — 3 Phase 2 parity canaries against real `evaluate()` (per Q-Step6 + Q3 inherited gates)

Per architect Q3 ruling 2026-05-06 (the Phase 3 entry gate item from Phase 2 exit forward-track): **before Phase 3 implementation work proceeds past its Step 1 (`evaluate()` skeleton), every Phase 2 stub-evaluated parity canary is re-exercised against the real `evaluate()`.** The 3 canaries:

| Fixture | Stub-validated assertion | Discriminating query | Expected real-evaluate result |
|---|---|---|---|
| `parity_canary_query_preservation` | Round-trip preserves SubClassOf-chain entailment | `Person(alice)?` | `'true'` (matches stub) |
| `parity_canary_negative_query` | OWA preservation; round-trip does not introduce CWA-collapse | (per fixture's `phase3Reactivation` field) | (per fixture's `phase3Reactivation`) |
| `parity_canary_visual_equivalence_trap` | Wrong-strategy emission catchable by query-based detection | (per fixture's `phase3Reactivation` field) | (per fixture's `phase3Reactivation`) |

Per Q-Frank-4 ruling 2026-05-07 (per-canary publication commitment): each canary's reactivation outcome publishes per-canary, not aggregated, with the SME-authored risk-estimate tag (`expected-to-survive`, `at-risk-horn-fragment-closure`, `requires-non-horn-evaluator`) authored as part of this entry packet (§3.6 below).

### 3.3 Phase 3 No-Collapse Adversarial Corpus — 4 fixtures + 2 BFO-gated Drafts (per ROADMAP)

The canonical adversarial set the SME role exists to author. Each fixture engineered to expose a specific class of silent-pass failure in the No-Collapse Guarantee machinery.

| Fixture | Status at Phase 3 entry | Activation timing | Ratified outcome | Catches |
|---|---|---|---|---|
| `nc_self_complement.fixture.js` | Draft | **corpus-before-code** | `consistent: false` with equivalent-to-complement witness chain | Class equivalent to its own complement; the canonical Horn-detectable inconsistency |
| `nc_horn_incomplete_disjunctive.fixture.js` | Draft | **corpus-before-code** | `'undetermined'` with populated `unverifiedAxioms` (NOT silently `consistent: true`) | Non-Horn inconsistency requiring tableau reasoning the Horn fragment cannot reach |
| `nc_horn_incomplete_existential.fixture.js` | Draft | **corpus-before-code** | `'undetermined'` with different reason than disjunctive case | Incompleteness from existential quantification the Horn fragment cannot witness |
| `nc_silent_pass_canary.fixture.js` | Draft | **corpus-before-code** | `consistent: true` MUST NOT be returned | KB classical FOL would judge inconsistent but naive Horn-only check would judge true; the silent-pass failure mode |
| `nc_bfo_continuant_occurrent.fixture.js` | Draft (BFO-gated) | held inactive at Phase 3 | Activates at Phase 4 with `consistent: false` | Continuant ⊓ Occurrent disjointness from BFO Disjointness Map |
| `nc_sdc_gdc.fixture.js` | Draft (BFO-gated) | held inactive at Phase 3 | Activates at Phase 4 (or Phase 7 if SDC/GDC live in OFI deontic) | SDC ∩ GDC disjointness via property-chain decomposition |

### 3.4 Phase 3 Hypothetical-Axiom Set (API §8.1.2) — 4 fixtures (per ROADMAP)

Three canonical hypothetical-reasoning cases plus an explicit non-persistence verification.

| Fixture | Activation timing | Ratified outcome |
|---|---|---|
| `hypothetical_inconsistency.fixture.js` | **corpus-before-code** | base KB consistent; `axiomSet` introduces inconsistency; `checkConsistency(session, axiomSet)` returns `consistent: false` with witnesses |
| `hypothetical_horn_incompleteness.fixture.js` | **corpus-before-code** | base KB consistent; `axiomSet` introduces Horn-incompleteness without inconsistency; returns `'undetermined'` with populated `unverifiedAxioms` |
| `hypothetical_clean.fixture.js` | **corpus-before-code** | base KB consistent; `axiomSet` extends consistently; returns `consistent: true` |
| `hypothetical_non_persistence.fixture.js` | **corpus-before-code** | runs `checkConsistency(session, axiomSet)` then `checkConsistency(session)`; second call MUST see original session state, not hypothetical extension; verifies API §8.1.2 non-persistence guarantee |

### 3.5 Cycle / CWA / step-cap / error-surface fixtures — 8 fixtures (Step-N-bind per Q-3-E ratification 2026-05-08)

| Fixture (proposed) | Activation timing | Step binding | Exercises |
|---|---|---|---|
| `cycle_equivalent_classes.fixture.js` | **step-N-bind** | Step 5 | Class hierarchy with `EquivalentClasses` cycle; some valid OWL ontologies declare such cycles; `cycle_detected` reason code returned |
| `cycle_recursive_predicate.fixture.js` | **step-N-bind** | Step 5 | Recursive predicate definition that would loop without cycle protection; ADR-011's visited-ancestor list catches it |
| `cwa_closed_predicate.fixture.js` | **step-N-bind** | Step 4 | Query with `closedPredicates: {p}` produces `'false'` for failing `\+ p(x, y)` |
| `cwa_open_predicate.fixture.js` | **step-N-bind** | Step 4 | Same query without `closedPredicates` produces `'undetermined'` with `naf_residue` reason |
| `step_cap_per_query.fixture.js` | **step-N-bind** | Step 1 (per-query 10K cap; emits in `evaluate()` skeleton) | Query exhausts 10K default cap; `step_cap_exceeded` reason returned |
| `step_cap_aggregate.fixture.js` | **step-N-bind** | Step 8 (aggregate session cap + `SessionStepCapExceededError`) | Session exhausts aggregate cap; `SessionStepCapExceededError` thrown |
| `error_structural_annotation_mismatch.fixture.js` | **step-N-bind** | Step 8 | Caller-declared annotation diverges from projection's recorded annotation; `structural_annotation_mismatch` thrown |
| `error_arc_manifest_version_mismatch.fixture.js` | **step-N-bind** | Step 8 | Session and conversion ARC versions diverge; `arc_manifest_version_mismatch` thrown |

**Step 8 also activates `strategy_routing_no_match.fixture.js`** (already in carryforward, currently held with `phase3Reactivation.expectedOutcomeOptionA` documenting the throw discipline). Per Q-3-C ruling 2026-05-08, Option (a) Throw discipline closes Item 8 from Phase 2 exit; the existing fixture's `phase3Reactivation.expectedOutcomeOptionA` becomes the live contract — no new fixture authoring required. Step 8 wires `NoStrategyAppliesError` to fire on the bare `fol:False`-shaped axiom the fixture exercises. The fixture's Option (b) alternative is documented as the rejected closure for audit-trail completeness.

### 3.6 Per-canary risk estimate (Q-Frank-4 deliverable, SME-authored at this entry packet)

Per Q-Frank-4 ruling 2026-05-07: each Phase 2 stub-validated parity canary is tagged with one of three risk categories. The tagging is authored at Phase 3 entry packet (this section). Per architect Q-3-B ruling 2026-05-08: **pre-emptive review on the two at-risk canaries' assertions against real `evaluate()` semantics is a Phase 3 Step 1 deliverable** (see §7 step ledger). Step 2 then produces the per-canary publication artifact carrying actual reactivation outcomes per Q-3-A framing requirement.

| Canary | Risk tag (SME estimate, pre-Step-1) | Rationale |
|---|---|---|
| `parity_canary_query_preservation` | **expected-to-survive** | Atomic positive entailment; SubClassOf chain is Horn-decidable; real `evaluate()` follows the same backward-chain trace as the stub |
| `parity_canary_negative_query` | **at-risk-horn-fragment-closure** | OWA-vs-CWA discrimination depends on `closedPredicates` semantics + `naf_residue` reason emission; real `evaluate()` may surface entailments the bounded-Horn-resolution stub misses, particularly around closed-predicate edge cases. **Step 1 pre-emptive review required per Q-3-B.** |
| `parity_canary_visual_equivalence_trap` | **at-risk-horn-fragment-closure** | Cross-section defense pair half; the discriminating query depends on whether the lifted FOL distinguishes the two semantically-shifted shapes; real `evaluate()` resolves the distinction more sharply than the stub. SME hypothesis: survives, but the query may need refinement at Phase 3 corpus-amendment cycle if the stub's discriminating query was tighter than the real evaluator can resolve. **Step 1 pre-emptive review required per Q-3-B.** |

**No canary tagged `requires-non-horn-evaluator` at Phase 2 close.** All 3 are decidable within bounded-Horn-resolution semantics; the at-risk tags reflect Horn-fragment-closure proof-tree-depth concerns rather than non-Horn-evaluator requirements.

**Pre-emptive review outcomes per Q-3-B (filled at Step 1; stub for now):**

| Canary | Step 1 pre-emptive-review outcome |
|---|---|
| `parity_canary_query_preservation` | (no review required; expected-to-survive) |
| `parity_canary_negative_query` | ✓ **expected-to-survive after pre-emptive review** (Step 1a 2026-05-08). Discriminating query `Knows(alice, bob)?` is a single `FOLAtom` (in EvaluableQuery per API §7.1). Real `evaluate()` SLD trace: lifted FOL state has `Person(alice)`, `Person(bob)` only — no Knows-deriving rules, no Knows facts; SLD fails to unify; default OWA (no `closedPredicates`) maps fail-to-prove → `'undetermined'`, reason `'open_world_undetermined'`. Matches stub's `'undetermined'`. No amendment required. |
| `parity_canary_visual_equivalence_trap` | ⚠ **anticipated-divergence; phase3Reactivation pre-amended** (Step 1a 2026-05-08). Tier 1 (atomic queries Q_1 `Person(bob)?` + Q_2 `hasChild(alice, bob)?`) is in v0.1 EvaluableQuery scope; real `evaluate()` returns `'true'`/`'true'` against asserted ABox facts; matches stub. Tier 2 enhanced kind-swap discriminator `∃y. hasChild(alice, y) ∧ ¬Person(y)?` under `closedPredicates` falls outside v0.1 EvaluableQuery — `FOLExistential` + `FOLNegation` both throw `UnsupportedConstructError` per API §7.5; the Tier 2 case is the exact "canary needs STRENGTHENING" path the fixture's own `divergenceTrigger` (lines 313-323) pre-anticipates. **Pre-amendment is forward-track-clarification only (Tier 1 v0.1-in-scope / Tier 2 v0.2-deferred), NOT primary-assertion-amendment.** The fixture's `Verified` status routes the actual amendment through cycle 2 architect-mediated cycle (per Aaron's Step 1a routing 2026-05-08 + the just-banked Phase 2 Track-2 principle "Verified-fixture vs implementation drift routes to next phase's entry packet, not to silent SME edit"); see new I8 in §4 below. |

If Step 1 pre-emptive review reveals genuine semantic divergence requiring corpus amendment of either at-risk canary's primary assertion, that surfaces as a Phase 3 entry-cycle micro-cycle for architect ratification BEFORE Step 2 reactivation runs. This is the Q-3-B-ratified pre-emptive-vs-reactive cycle pattern.

**Step 3 publication outcomes per Q-Frank-4 publication commitment** (UPGRADED from Step 2 baseline at Step 3 SLD landing; updated at each subsequent Step that meaningfully changes evaluator capability; final binding at Phase 3 exit summary per Q-3-F):

| Canary | Stub result (Phase 2) | Step 1b skeleton (`c2a9867`) | Step 3 SLD result (this commit) | Disposition |
|---|---|---|---|---|
| `parity_canary_query_preservation` | `'true'` (Person(alice) entailed via SubClassOf chain) | `'undetermined'` (skeleton uniform) | `'true'` / `'consistent'` (Tau Prolog Horn-rule chain via Mother→Female→Person resolves to asserted Mother(alice)) | ✓ **SURVIVED** at Step 3 |
| `parity_canary_negative_query` | `'undetermined'` (OWA, no Knows facts/rules) | `'undetermined'` (skeleton matches stub trivially) | `'undetermined'` / `'open_world_undetermined'` (SLD on Knows(alice,bob) backtracks; default OWA per spec §6.3 maps fail-to-prove to undetermined) | ✓ **SURVIVED** at Step 3 |
| `parity_canary_visual_equivalence_trap` Tier 1 (Q_1: `Person(bob)?` + Q_2: `hasChild(alice, bob)?`) | `'true'`/`'true'` (asserted ABox facts) | `'undetermined'`/`'undetermined'` (skeleton uniform) | `'true'`/`'true'` / `'consistent'`/`'consistent'` (SLD finds asserted ABox facts directly) | ✓ **SURVIVED** at Step 3 |
| `parity_canary_visual_equivalence_trap` Tier 2 (`∃y. hasChild(alice,y) ∧ ¬Person(y)?`) | n/a (Phase 3 enhanced; SME-authored at Phase 2 close) | n/a (out of v0.1 EvaluableQuery — `FOLExistential` + `FOLNegation` throw `UnsupportedConstructError` per API §7.5) | n/a (still out of v0.1 EvaluableQuery scope) | ⏭ **deferred to v0.2** via I8 cycle-2 routing (Step 1a finding 2026-05-08) |

**Step 3 outcome summary:** **3 of 3 canaries SURVIVED** at the Step 3 SLD-resolved evaluator. All Tier 1 atomic queries match their Phase 2 stub-results exactly. Tier 2 enhanced discriminator remains deferred to v0.2 via I8 cycle-2 routing.

**Step 2 baseline (committed at `8b4fb77`) is now superseded by Step 3 outcomes** but preserved as historical record at `tests/evaluate-phase3-step2-reexercise.test.ts` git history. The current test file's assertions reflect Step 3 SLD outcomes; commit message at Step 3 implementation cycle (`<this commit's SHA>`) records the upgrade transition.

**Per Q-3-F publication-artifact format ratification:** the canonical publication artifact location at Phase 3 exit is appended to the exit summary (cross-referenced to risk-estimate tags). At intermediate Steps (this section is the Step 3 binding), the §3.6 outcomes table serves as the running publication; each Step's commit updates the outcome column as evaluator capability advances. Steps 4-8 may further refine outcomes for `parity_canary_negative_query` if `closedPredicates` semantics or other capabilities surface canary divergences not visible at Step 3.

### 3.7 Total Phase 3 corpus

- **Phase 1 + Phase 2 carryforward:** 27 fixtures (re-exercised through Ring 3)
- **Re-exercise gate (Phase 2 canaries against real `evaluate()`):** 3 fixtures (already authored; reactivation discipline)
- **Phase 3 No-Collapse adversarial:** 4 active + 2 BFO-gated Drafts (held inactive)
- **Phase 3 Hypothetical-axiom:** 4 fixtures
- **Cycle / CWA / step-cap / error-surface:** 8 fixtures (proposed; subject to Q-3-E ratification)

**Total active at Phase 3:** 27 + 3 + 4 + 4 + 8 = **46 fixtures** (plus 2 BFO-gated Drafts held inactive).

Architect Q-3-E ratifies the corpus shape: fixture count + which fixtures land at corpus-before-code (entry-cycle) vs Step-N (during-Phase-3-implementation).

---

## 4. Inherited Items from Phase 2 Exit + Stakeholder-Remediation Cycle 2

The architecturally-routable items the entry packet must ratify or document. Each is dispositioned below; some require architect rulings (cross-referenced to §5 questions).

### I1 — Re-exercise gate per architect Q3 ruling 2026-05-06

**Source:** Phase 2 exit packet §6 "To Phase 3 entry" + per-canary `phase3Reactivation` field on each of 3 parity canaries.

**Disposition: ✅ OPERATIONALIZED at Phase 3 Step 2 per Q-3-A ratification 2026-05-08.** Step 1 (`evaluate()` skeleton + types + `UnsupportedConstructError` + pre-emptive review on at-risk canaries per Q-3-B) ships first; Step 2 re-exercises the 3 parity canaries against the real `evaluate()` AND produces the per-canary publication artifact per Q-3-A framing requirement (publication artifact is a Step 2 deliverable, not a Phase 3 exit deliverable rolled forward). Each canary's `phase3Reactivation` field is the machine-checkable contract; §3.6's risk estimate is the SME-authored qualitative hypothesis; §7 step ledger codifies Step 2's two-deliverable framing.

### I2 — Item 8 closure: `strategy_routing_no_match` no-strategy-applies behavior

**Source:** Phase 2 exit Item 8 risk retrospective + architect Step 9.1 ruling 2026-05-XX (Option (c) deferral with three structural requirements).

**Phase 2 ships with documented spec-non-compliance for the no-strategy-applies behavior (silent fallthrough on bare `fol:False`).** The fixture's `phase3Reactivation` field documents both candidate closures:

- **Option (a)** — throw discipline per spec §6.1 literal framing. The projector raises a documented diagnostic when no strategy applies. Composes with API §10.4 typed-error hierarchy.
- **Option (b)** — always-emit-LossSignature per spec §0.1 framing. The projector emits a Loss Signature rather than throwing. Composes with API §8.1.1 `unverifiedAxioms` surface.

**Disposition: ✅ CLOSED 2026-05-08 per architect Q-3-C ruling — Option (a) Throw discipline.** Phase 3 strategy router amends to throw `NoStrategyAppliesError` per spec §6.1 literal framing. Reason enum gains `no_strategy_applies` as 17th member (per ADR-011 banked principle 2 + spec §11.2 minor-version-bump discipline). Step ledger placement: Step 8 (typed-error-hierarchy completion — see §7). Phase 2 exit packet's Item 8 risk-retrospective entry updates with closure reference to this ruling — that update is part of cycle 2 Pass 2b (I6).

### I3 — Lifter `ObjectPropertyChain` support

**Source:** Architect Q-Step6-3 ruling 2026-05-XX (Phase 3 OR Phase 4 surfacing; whichever surfaces the demand first).

**Disposition: ✅ CLOSED 2026-05-08 per architect Q-3-D ruling — Option (b) Phase 4 deferral.** Phase 3 explicitly does NOT include lifter `ObjectPropertyChain` support. Phase 4 entry packet inherits the work as an inheritance item (forward-tracked in §13 below). Phase 3 evaluator's cycle-guarded chain rules per ADR-011 use projector-direct synthetic chain inputs (lifter-bypassing) per Q-Step6-3 convention; no lifter chain surface required for Phase 3's corpus. Phase 4 ARC content (BFO 2020 transitive parthood + dependence relations) is the natural surfacing context.

### I4 — Q-Frank-4 publication commitment

**Source:** Architect Q-Frank-4 ruling 2026-05-07 (deferred-with-structural-requirements at Phase 2 exit; per-canary publication of stub→real outcomes).

**Disposition:** Inherited as Phase 3 EXIT deliverable. Per-canary risk estimate authored at this entry packet (§3.6 above). Publication format ratified under Q-3-F:

- Per-canary outcome with one of three labels: `survived` / `failed-revealed-stub-limit` / `not-yet-reactivated`
- Cross-reference to the per-canary risk-estimate tag (this entry packet §3.6)
- Format: appended to Phase 3 exit summary as a per-canary table

### I5 — ADR-007 §10 promotion

**Source:** Architect Q-Frank-2 ruling 2026-05-07 (architect-mediated cycle 2 from Phase 2 stakeholder-remediation cycle).

**Disposition: ⏭ Cycle 2 Pass 2b deliverable per Q-3-G ruling 2026-05-08.** SME path-fence-authors the §10 ratified text per Q-Frank-2 (SME's drafted soundness statement + architect's boundary-statement refinement: punning rejection per spec §13.1 explicit; broader meta-vocabulary input acknowledged as v0.2-specification surface). Pass 2b routes I5 in its OWN architect cycle (separate from this entry packet's final ratification), preserving audit-trail-unity-per-surface per Q-3-G. Pass 2b proceeds in parallel with Phase 3 Step 1 work; does not block Step 1 since the ADR-007 §10 surface is architectural-documentation rather than implementation-gating.

### I6 — Phase 2 exit packet update for Q-Frank-4 publication commitment + Q-3-C closure reference

**Source:** Q-Frank-4 ruling 2026-05-07 + Q-3-C ruling 2026-05-08.

**Disposition: ⏭ Cycle 2 Pass 2b deliverable per Q-3-G ruling 2026-05-08.** Phase 2 exit packet's deferred-with-structural-requirements bucket gains two entries: (1) Q-Frank-4 publication commitment recording the per-canary publication artifact as a Phase 3 EXIT-packet pointer; (2) Q-3-C closure reference recording that Item 8 risk-retrospective entry's open architectural question closed at this entry packet's ruling. Pass 2b routes I6 in its own architect cycle. Per the Q-3-C banked principle: cross-phase deferred architectural closures resolve at the closing cycle and update the deferring cycle's exit packet to reflect closure.

### I7 — `strategy_routing_annotated` fixture-vs-implementation reconciliation (NEW from cycle 2)

**Source:** Q-Frank-6 ruling 2026-05-08 Track 2 (surfaced during R5 demo authoring; the fixture's `expected_v0.1_verdict.expectedLossSignatureCount: 2` is stale relative to the projector's per-unique-predicate emission semantics; actual is 4 = 1 `naf_residue` + 3 `unknown_relation`).

**Disposition: ⏭ Cycle 2 Pass 2b deliverable per Q-3-G ruling 2026-05-08.** SME drafts the fixture update (`expectedLossSignatureCount: 4` plus expanded `expectedLossSignatureLossTypes` array reflecting per-predicate emission); architect ratifies per the schema-evolution discipline (Verified-status fixtures get architect-mediated update cycles, not silent SME edits) — same shape as the Phase 1 Step 4 fixture amendment cycle. Pass 2b routes I7 in its own architect cycle. Demo Case C's honest-divergence callout references the Pass 2b reconciliation explicitly so the gap is auditable until Pass 2b lands.

**Banking principle (now banked per architect Q-3-G ruling 2026-05-08, codified at this entry packet's §12):** *Verified-fixture vs implementation drift discovered at phase close routes to the next phase's entry packet, not to silent SME edit. The cycle-discipline preserves the Verified-status-as-architect-ratified guarantee.*

### I8 — `parity_canary_visual_equivalence_trap` phase3Reactivation tier-split pre-amendment (NEW from Step 1a 2026-05-08)

**Source:** Step 1a pre-emptive review per Q-3-B 2026-05-08 (see §3.6 outcomes table). The fixture's Tier 2 enhanced kind-swap discriminator (`∃y. hasChild(alice, y) ∧ ¬Person(y)?` under `closedPredicates`) falls outside v0.1 EvaluableQuery — `FOLExistential` + `FOLNegation` both throw `UnsupportedConstructError` per API §7.5. The fixture's own `divergenceTrigger` (lines 313-323) anticipates this exact case; pre-amendment is forward-track-clarification only (Tier 1 in v0.1 / Tier 2 deferred to v0.2), NOT primary-assertion-amendment.

**Disposition: ⏭ Cycle 2 Pass 2b deliverable per Aaron Step 1a routing 2026-05-08.** SME path-fence-authors the `phase3Reactivation` field tier-split (`tier1_v01_in_scope`: Q_1 + Q_2 atomic queries against real `evaluate()` expected `'true'`/`'true'`; `tier2_v02_deferred`: original existential-conjunction-negation discriminator deferred to v0.2 with rationale per API §7.5); architect ratifies per the just-banked Track-2 principle (Verified-fixture amendment routes through architect-mediated cycle, not silent SME edit); Developer commits. Pass 2b routes I8 in its own architect cycle alongside I5 + I6 + I7.

**Does NOT block Phase 3 Step 1b** (`evaluate()` skeleton code). The fixture's primary assertion (Tier 1) survives at Phase 3 fidelity; the Tier 2 amendment is forward-track-clarification documentation, parallel to code work.

---

## 5. Architectural Questions — All Ruled 2026-05-08 Initial-Review Cycle

All seven Q items received architect rulings in the initial-review cycle 2026-05-08. The §11 Q-Rulings Resolved table records each ruling's exact disposition + reasoning excerpt. The subsections below preserve the SME's pre-ruling framing for audit-trail completeness; ✅ disposition annotations are appended to each.

### Q-3-A — Phase 3 step granularity ✅ APPROVED with framing requirement

**Proposed (SME):**

| Step | Deliverable |
|---|---|
| Step 1 | `evaluate()` skeleton + types + `UnsupportedConstructError` |
| Step 2 | **Re-exercise gate** — 3 Phase 2 parity canaries against real `evaluate()` (closes I1) |
| Step 3 | `EvaluableQuery` evaluation against built-in OWL with three-state result + reason enum (16 codes) |
| Step 4 | `closedPredicates` + per-predicate CWA per spec §6.3.2 |
| Step 5 | Cycle detection per spec §5.4 + ADR-011 (`cycle_detected` reason code) |
| Step 6 | `checkConsistency()` + No-Collapse Guarantee (§8.5) + `unverifiedAxioms` surface (§8.1.1) |
| Step 7 | Hypothetical-axiom case per API §8.1.2 (`axiomSet` participation + non-persistence) |
| Step 8 | Session/error-surface remainders (`structural_annotation_mismatch`, `arc_manifest_version_mismatch`, `SessionStepCapExceededError`) |
| Step 9 | Exit cadence (per-canary publication per Q-Frank-4 commitment + Phase 3 exit packet) |

**Question:** Architect ratifies the step granularity. Proposed shape mirrors Phase 2's α-cadence single-substep-per-commit pattern (banked at Step 9 ruling). Step 2's placement before Step 3 is per architect Q3 ruling 2026-05-06: the re-exercise gate runs BEFORE Phase 3 implementation work proceeds past Step 1. Alternative orderings: Step 5 (cycle detection) could merge with Step 3 (atomic query evaluation) since cycle detection is part of SLD termination; Step 8's three error-surface items could split across Steps 6 and 7 if they naturally bind to those features.

### Q-3-B — Per-canary `phase3Reactivation` review ✅ APPROVED (pre-emptive review at Step 1)

**Question:** Verify each of the 3 parity canaries' `phase3Reactivation` content (discriminating query / expected result / divergence trigger) remains sound at Phase 3 entry. If any canary's discriminating query is too tight for the real evaluator (e.g., the stub's bounded-Horn-resolution treated a query as decidable but the real evaluator's richer semantics produces `'undetermined'` for the same query), the fixture amends at Phase 3 corpus-amendment cycle BEFORE Step 2 re-exercise gate runs.

**SME observation:** Per §3.6 risk estimate, `parity_canary_negative_query` and `parity_canary_visual_equivalence_trap` are flagged `at-risk-horn-fragment-closure`. The architect may want to pre-emptively review their discriminating queries for Phase 3 alignment, or defer that review to the Step 2 reactivation cycle where actual real-evaluator outcomes inform amendments.

### Q-3-C — `strategy_routing_no_match` Item 8 closure ✅ Option (a) Throw discipline ratified

**Options:**

- **(a) Throw discipline** per spec §6.1 literal framing. Projector raises a documented diagnostic (typed error per API §10.4) when no strategy applies. Tightens the conformance-gap surface immediately. Composes with the API typed-error hierarchy.
- **(b) Always-emit-LossSignature** per spec §0.1 framing. Projector emits a Loss Signature rather than throwing; the silent fallthrough becomes documented audit-trail emission. Composes with API §8.1.1 `unverifiedAxioms` surface (the Loss Signature's `lossType` becomes a new entry in the frozen severity ordering OR uses an existing code with extended semantics).

**SME-routable observation:** Both options are technically defensible. Option (a) is the spec §6.1 literal-framing reading; Option (b) is the spec §0.1 honest-admission-discipline reading. The conformance gap surfaced at Phase 2 Step 9.1 micro-cycle; ratification at Phase 3 entry closes it before Phase 3 implementation introduces new strategy-router code paths.

### Q-3-D — Lifter `ObjectPropertyChain` support timing ✅ Option (b) Phase 4 deferral ratified

**Options:**

- **(a) Phase 3 surfacing.** Lifter chain support ships during Phase 3 implementation, gated on Phase 3 corpus demand. SME's current corpus inventory (§3) does not directly require it, but adversarial fixtures may surface demand during Step 6 (`checkConsistency`) or Step 7 (hypothetical-axiom).
- **(b) Phase 4 deferral.** Lifter chain support waits for BFO ARC content (Phase 4) where parthood transitivity heavily exercises chains. Phase 3 corpus uses chain-free axioms only.

**SME-routable observation:** (b) is the cycle-discipline-conservative choice — defer surfacing until corpus demand is concrete. (a) is the cycle-discipline-aggressive choice — ship the support alongside the validator since `evaluate()` exercises SLD inference and chain rules are a natural extension. SME weak preference for (b) per the *step scope bounded by entry packet* banked principle: Phase 3's corpus does not currently require chain rules; surfacing them speculatively expands Phase 3 scope.

### Q-3-E — Phase 3 corpus shape ratification ✅ APPROVED 8 corpus-before-code + 8 step-N-bind

**Components for ratification:**

- 4 No-Collapse adversarial fixtures (§3.3) — Verified targets with documented expected outcomes
- 2 BFO-gated Draft fixtures (§3.3) — held inactive at Phase 3; activate at Phase 4
- 4 Hypothetical-axiom fixtures (§3.4) — per API §8.1.2 contract
- 8 cycle/CWA/step-cap/error-surface fixtures (§3.5) — SME-proposed; subject to architect refinement
- Total active at Phase 3: 46 fixtures (27 carryforward + 3 re-exercise + 4 No-Collapse + 4 hypothetical + 8 ancillary)

**Authoring cadence question (cycle-discipline):** which fixtures land at corpus-before-code (entry-cycle, before Step 1) versus at Step-N (during-Phase-3-implementation alongside the feature they exercise)?

**SME-routable proposal:**

- **Corpus-before-code (entry-cycle):** the 4 No-Collapse adversarial + 4 hypothetical-axiom = 8 fixtures. These are the contract for Steps 6 + 7; landing them before Step 1 prevents the test-retrofit failure mode.
- **Step-N during implementation:** the 8 ancillary (cycle/CWA/step-cap/error-surface). These bind to specific features (Step 5 cycle, Step 4 CWA, Steps 1+8 step-caps + error-surfaces); landing them at the matching Step-N keeps blast radius bounded.

Architect ratifies (or refines) the cadence choice.

### Q-3-F — Q-Frank-4 publication artifact format ✅ APPROVED (§3.6 schema canonical)

**Components for ratification:**

- Per-canary risk-estimate schema: `{ expected-to-survive | at-risk-horn-fragment-closure | requires-non-horn-evaluator }` (per §3.6 SME draft)
- Publication artifact format: per-canary outcome table appended to Phase 3 exit summary, cross-referenced to risk-estimate tags
- Gate cadence: Phase 3 exit publishes per-canary outcomes alongside the existing exit summary; CI gate on the publication artifact's presence at exit

**Question:** Architect ratifies the schema, format, and gate cadence. SME-routable observation: §3.6's risk-estimate tagging should be the canonical reference (SME-authored at entry; architect ratified at this packet); Phase 3 exit's publication binds against it.

### Q-3-G — Cycle 2 architect-mediated bundle scope ✅ Two-pass sequencing ratified

**Components for ratification (cycle 2 bundle):**

1. ADR-007 §10 ratified text (per Q-Frank-2 ruling) — SME drafts using SME's drafted soundness statement + architect's boundary-statement refinement
2. Phase 2 exit packet update for Q-Frank-4 publication commitment (per I6) — gain entry in deferred-with-structural-requirements bucket
3. Phase 3 entry packet inheritance language (this packet's §4 captures the inheritance; architect ratifies the language at §10 fill)
4. `strategy_routing_annotated` fixture reconciliation (per I7) — `expectedLossSignatureCount: 2` → `4`; `expectedLossSignatureLossTypes` expanded to per-predicate semantics

**Sequencing question:** architect ratifies cycle 2 within or alongside this entry packet's Q-3-A through Q-3-F rulings? Bundling avoids a separate architect cycle for substantively related items. Aaron's election determines.

---

## 6. Validation Rings Status

| Ring | Status | Note |
|---|---|---|
| Ring 1 (Conversion Correctness — Phase 1 lifter) | Continues green | Phase 1 corpus + Phase 2 corpus both exercise lifter; no regression expected at Phase 3 |
| Ring 2 (Round-Trip Parity + Audit Artifacts — Phase 2 projector) | Continues green | All 27 corpus fixtures × `roundTripCheck`; parity-canary harness shipped at Phase 2 Step 8; structural round-trip parity per spec §8.1 |
| **Ring 3 (Validator + Consistency Check)** | **EXERCISED — Phase 3's novel ring** | All 12 deliverables (§2) exercise Ring 3. First phase exit where the full validation pipeline operates against built-in OWL. |

Ring 3 closes at Phase 3 exit. Phase 4+ exercises Rings 1–3 against ARC content (BFO 2020 core, IAO information bridge, CCO modules, OFI deontic).

---

## 7. Phase 3 Step Ledger (per Q-3-A ratification 2026-05-08)

The 9-step ledger ratified by Q-3-A. Step 2 placement before Step 3 honors the Q3 ruling 2026-05-06 (re-exercise gate runs before Phase 3 implementation work proceeds past Step 1). Step 1's first deliverable per Q-3-B framing requirement is pre-emptive review on the 2 at-risk-horn-fragment-closure parity canaries. Step 2 produces both reactivation results AND the per-canary publication artifact per Q-3-A framing requirement. Step 8 is the canonical typed-error-hierarchy completion step bundling `NoStrategyAppliesError` + `structural_annotation_mismatch` + `arc_manifest_version_mismatch` + `SessionStepCapExceededError` per Q-3-C placement.

| Step | Deliverable | Framing requirements (per architect rulings 2026-05-08) |
|---|---|---|
| **1** | `evaluate()` skeleton + types + `UnsupportedConstructError` + per-query 10K step cap | **Per Q-3-B framing requirement:** Step 1's first deliverable is pre-emptive review of the 2 at-risk-horn-fragment-closure parity canaries' assertions (`parity_canary_negative_query`, `parity_canary_visual_equivalence_trap`) against real `evaluate()` semantics. Three-way disposition: (a) confirmation banked into §3.6 as "expected-to-survive after pre-emptive review"; (b) anticipated-divergence with the canary's `phase3Reactivation` field pre-amended with what real `evaluate()` will produce; (c) genuine semantic divergence requiring corpus amendment of the canary's primary assertion — surfaces as a Phase 3 entry-cycle micro-cycle for architect ratification BEFORE Step 2 reactivation runs. Per-query 10K step cap shipping at Step 1 exercises `step_cap_per_query.fixture.js`. |
| **2** | Re-exercise gate — 3 parity canaries against real `evaluate()` (closes I1) | **Per Q-3-A framing requirement + Q-Frank-4 commitment:** Step 2 produces BOTH (a) the reactivation test results AND (b) the per-canary publication artifact per §3.6 risk-estimate schema. Publication artifact is a Step 2 deliverable, NOT a Phase 3 exit deliverable rolled forward. Format per §3.6 schema; lands at `project/reviews/phase-3-reactivation-results.md` (SME-domain placement per Q-3-F suggestion). Each canary's outcome carries one of three labels: `survived` / `failed-revealed-stub-limit` / `not-yet-reactivated`; cross-referenced to the canary's `phase3Reactivation` field in the manifest + the §3.6 risk-estimate tag. |
| **3** | `EvaluableQuery` evaluation against built-in OWL with three-state result + 16-code reason enum | (No special framing; standard implementation against §2.1 + §2.2 contracts) |
| **4** | `closedPredicates` + per-predicate CWA per spec §6.3.2 | (Exercises `cwa_closed_predicate` + `cwa_open_predicate` step-N-bind fixtures from §3.5) |
| **5** | Cycle detection per spec §5.4 + ADR-011 | (Emits `cycle_detected` reason code; exercises `cycle_equivalent_classes` + `cycle_recursive_predicate` step-N-bind fixtures from §3.5) |
| **6** | `checkConsistency()` + No-Collapse Guarantee + `unverifiedAxioms` surface | (Exercises 4 corpus-before-code No-Collapse adversarial fixtures from §3.3 + the inside-fragment vs outside-fragment regimes per spec §8.5.1) |
| **7** | Hypothetical-axiom case per API §8.1.2 | (Exercises 4 corpus-before-code hypothetical-axiom fixtures from §3.4; verifies non-persistence guarantee) |
| **8** | **Typed-error-hierarchy completion** | **Per Q-3-C placement (architect's preference for cohesion):** introduces `NoStrategyAppliesError` as the **13th** typed error class in API §10's hierarchy (carries `folAxiom`, `attempted: ProjectionStrategy[]`, `code: 'no_strategy_applies'` fields per OFBTError convention). Adds `no_strategy_applies` as the **17th** member of the reason enum (per ADR-011 banked principle 2 + spec §11.2 minor-version-bump discipline; no ADR-011 amendment required). Phase 2's strategy router silent-fallthrough path amended to throw `NoStrategyAppliesError`. Exercises the existing `strategy_routing_no_match.fixture.js` via its `phase3Reactivation.expectedOutcomeOptionA` field (now the live contract). Bundles with `structural_annotation_mismatch`, `arc_manifest_version_mismatch`, `SessionStepCapExceededError` + `step_cap_aggregate.fixture.js` for cohesion. |
| **9** | Phase 3 exit cadence | (Exit packet authoring; CI gate verification; per-canary publication artifact validated against §3.6 schema; ROADMAP Phase 3 status flip; demo `demo_p3.html` post-exit per the post-exit demo cadence + two-case banked template) |

**What Phase 3 explicitly does NOT include (per Q-3-D ruling):** lifter `ObjectPropertyChain` support. Phase 3 evaluator's cycle-guarded chain rules use projector-direct synthetic chain inputs per Q-Step6-3 convention; Phase 4 entry packet inherits the lifter-side work as its own inheritance item.

---

## 8. Risk Notes Carried into Phase 3

### 7.1 Stub-bounded validation per Q-Frank-4 commitment

The Phase 2 stub-evaluator harness validated 3 parity canaries with bounded-Horn-resolution semantics. Real `evaluate()` ships richer semantics (closed-predicate support, Skolem-witness derivation, non-Horn fallback per spec §8.5). Per §3.6 risk estimate: 1 canary expected-to-survive, 2 at-risk-horn-fragment-closure. Phase 3 Step 2 re-exercise gate is the ground-truth test; outcomes publish per Q-Frank-4 commitment.

### 7.2 No-Collapse Guarantee scoped to Horn-checkable fragment

Per spec §8.5.1, the No-Collapse Guarantee applies to the Horn-checkable fragment of OWL 2 DL. Axioms outside the fragment return `'undetermined'` with `coherence_indeterminate` reason. Phase 3 corpus exercises both regimes:
- Inside-fragment: `nc_self_complement` + `cwa_closed_predicate` etc.
- Outside-fragment: `nc_horn_incomplete_disjunctive` + `nc_horn_incomplete_existential` + `hypothetical_horn_incompleteness`

The honest-scope discipline applies: Horn-incomplete returns are not silent passes; they surface via `unverifiedAxioms` per spec §8.5.5 + API §8.1.1.

### 7.3 ELK integration is v0.2 candidate

Phase 3 stays Horn-bounded. ELK integration (per spec §13) is v0.2 candidate; `unverifiedAxioms` field surfaces the EL-profile axioms that ELK could close at v0.2.

### 7.4 ARC content not loaded at Phase 3

Phase 3 corpus uses built-in OWL only. The 2 BFO-gated Draft fixtures (`nc_bfo_continuant_occurrent`, `nc_sdc_gdc`) hold inactive until Phase 4. The cross-phase reactivation pattern (banked at Phase 1 entry; reused at Phase 2) applies: each Draft fixture's metadata names the Phase that activates it.

### 7.5 Cycle detection's v0.1 visited-ancestor bound

Per ADR-011 (cycle-guard policy), Phase 3's cycle detection uses visited-ancestor list with the spec §5.4 resolution-depth bound. Pathological cases beyond the bound return `'undetermined'` with `closure_truncated` reason rather than infinite-loop. v0.2 SLG tabling upgrade is the v0.2 path to richer cycle handling.

### 7.6 Stakeholder-precision discipline carries forward

Per Q-Frank-1 banking 2026-05-07, Phase 3's external-facing materials (demo `demo_p3.html`, walkthrough, Q&A) must continue the precision-discipline pattern: claims must match what the engineering establishes, no more. Phase 3 exit's per-canary publication artifact (per Q-Frank-4) is the canonical example; Phase 3 demo authoring discipline inherits the dual ontology-stakeholder + logic-stakeholder gate framing per Q-Frank-1's banked principle.

---

## 9. What Architect Final Ratification Opens (Pass 2a vs Pass 2b)

Architect final ratification on this amended packet (initial-review rulings already received 2026-05-08) unblocks the two-pass Q-3-G sequencing:

### Pass 2a — Phase 3 entry packet final ratification commit

Single architect cycle for final ratification on the amended packet. The Pass 2a commit lands:

1. **Amended entry packet** — this document, reflecting all Q-3-A through Q-3-G rulings
2. **8 corpus-before-code fixtures** (per Q-3-E):
   - 4 No-Collapse adversarial: `nc_self_complement`, `nc_horn_incomplete_disjunctive`, `nc_horn_incomplete_existential`, `nc_silent_pass_canary` (§3.3)
   - 4 Hypothetical-axiom: `hypothetical_inconsistency`, `hypothetical_horn_incompleteness`, `hypothetical_clean`, `hypothetical_non_persistence` (§3.4)
3. **No manifest schema change** — SME elected convention-only per Q-3-E permitted choice; activation-timing tags live in this entry packet's §3 prose

**Pass 2a unblocks Phase 3 implementation Step 1** (Developer-domain). Step 1's first deliverable is pre-emptive review on the 2 at-risk parity canaries per Q-3-B. Step 2's re-exercise gate runs after Step 1 closes (or after any entry-cycle micro-cycle for canary amendment if pre-emptive review surfaces genuine semantic divergence).

### Pass 2b — Cycle 2 architect-mediated work in parallel (separate routing cycles)

Pass 2b proceeds in parallel with Phase 3 Step 1 work; does not block Step 1. Each item routes in its own SME→architect→Developer cycle preserving audit-trail-unity-per-surface per Q-3-G:

- **I5 — ADR-007 §10 promotion** per Q-Frank-2 ruling (SME path-fence-authors ratified text + boundary-statement refinement → architect ratifies → developer commits)
- **I6 — Phase 2 exit packet update** for Q-Frank-4 publication commitment + Q-3-C closure reference (SME amends → architect ratifies → developer commits)
- **I7 — `strategy_routing_annotated` fixture amendment** for `expectedLossSignatureCount: 2 → 4` reconciliation per Q-Frank-6 ruling Track 2 (SME path-fence-authors fixture amendment → architect ratifies → developer commits)

### Phase 3 forward deliverables (after Phase 3 implementation closes)

1. **Phase 3 demo (`demo_p3.html`)** authored at Phase 3 exit per the post-exit demo cadence + two-case banked template
2. **Phase 4 entry packet drafting** — inherits Phase 3 exit's forward-tracks (BFO ARC content, Layer B vendoring license-verification, regularity-check upgrade per Q-Step6-1, lifter `ObjectPropertyChain` support per Q-3-D Phase 4 deferral)

---

## 10. SME Certification

SME-role certification per AUTHORING_DISCIPLINE Section 0 path-fencing + single-committer model. **Amended 2026-05-08 to reflect architect initial-review rulings folded:**

1. **Phase 2 exit ratified** — exit packet committed at `97e9ade`; stakeholder-remediation cycle landed `b2c555e`. All Phase 2 forward-tracks documented in §6 of phase-2-exit.md.
2. **Phase 3 corpus inventoried + activation-timing-tagged** — §3 above; 46 active fixtures + 2 BFO-gated Drafts; architect ratified corpus shape per Q-3-E ruling 2026-05-08 (8 corpus-before-code + 8 step-N-bind + 4 No-Collapse + 4 hypothetical + Phase 1+2 carryforward + 3 re-exercise; activation-timing tags in §3 prose; SME convention-only choice on manifest schema).
3. **Inherited items dispositioned** — §4 above; I1 ✅ operationalized at Step 2 per Q-3-A; I2 ✅ closed per Q-3-C Option (a) Throw discipline; I3 ✅ deferred to Phase 4 per Q-3-D Option (b); I4 ✅ operationalized at Step 2 publication artifact per Q-3-F + §3.6; I5 + I6 + I7 ⏭ routed in Pass 2b (separate cycles) per Q-3-G two-pass sequencing.
4. **Architectural questions ruled** — §5 above; all 7 (Q-3-A through Q-3-G) received initial-review architect rulings 2026-05-08; §11 records exact dispositions + reasoning; final ratification cycle on this amended packet pending.
5. **Spec/API frozen surface honored** — Phase 3 build target (§2) cited against frozen v0.1.7 spec §5.4 + §6.3 + §8.1 + §8.5 + frozen API §2.1 + §6.3 + §7 + §8. **One additive change confirmed under v0.1.7 minor-version-bump discipline:** new reason enum member `no_strategy_applies` (the 17th); new typed error class `NoStrategyAppliesError` (the 13th in API §10's hierarchy). Both per architect Q-3-C ruling + ADR-011 banked principle 2 + spec §11.2 minor-version-bump discipline; no ADR-011 amendment required.
6. **Validation rings status documented** — §6 above; Ring 3 is Phase 3's novel ring.
7. **Step ledger codified** — §7 above per Q-3-A ratification; Step 1 Q-3-B framing requirement + Step 2 Q-3-A framing requirement + Step 8 Q-3-C placement + Q-3-D Phase 3 exclusion all explicit.
8. **Risk notes captured** — §8 above; 6 items spanning stub-bounded validation, No-Collapse scope, ELK deferral, ARC deferral, cycle bound, stakeholder-precision discipline.
9. **Pass 2b deliverables identified** — §9 above; I5/I6/I7 each route in their own SME→architect→Developer cycle preserving audit-trail-unity-per-surface per Q-3-G.

SME does not initiate Developer-domain code work. Developer scaffolds Phase 3 Step 1 AFTER architect issues final ratification on THIS amended packet AND the Pass 2a final ratification commit lands and remote CI is green. Pass 2b proceeds in parallel without blocking Step 1. Per CLAUDE.md §5: SME path-fence-authors content; Developer commits per single-committer model.

---

## 11. Architect Q-Rulings Resolved (initial-review cycle + final ratification cycle 2026-05-08)

Each ruling below records the architect's exact disposition + reasoning excerpt from the initial-review cycle. **Final ratification cycle 2026-05-08 verified amendment-shape correspondence across all nine checks (✓ all match): seven Q rulings + §3 corpus shape ratification + cycle-2 audit-trail-unity-per-surface.** The architect closed the final ratification with two additional banked principles (recorded in §12) + a cycle-accounting refinement.

| Q | Disposition | Reasoning excerpt |
|---|---|---|
| **Q-3-A** | ✅ APPROVED with framing requirement | *"9-step ledger approved as proposed. Step 2 placement before Step 3 per the Q3-2026-05-06 ruling preserved... Required of the Step 2 framing in the entry packet's §7 step ledger: explicit naming that Step 2 produces both (a) the reactivation test results and (b) the per-canary publication artifact per Q-Frank-4 + §3.6 risk estimate. The artifact is a Step 2 deliverable, not a Phase 3 exit deliverable rolled forward."* |
| **Q-3-B** | ✅ APPROVED — pre-emptive review at Step 1 | *"Concur with SME observation. Pre-emptive review on parity_canary_negative_query + parity_canary_visual_equivalence_trap warranted before Step 2 reactivation... Required of Step 1 framing: pre-emptive review of the two at-risk canaries' assertions against real evaluate() semantics is a Step 1 deliverable. Outcome: either confirmation that stub-validated assertion matches real semantics... or anticipated-divergence with pre-amended canary phase3Reactivation field... If pre-emptive review reveals genuine semantic divergence that requires corpus amendment of the canary's primary assertion, that surfaces as a Phase 3 entry-cycle micro-cycle for architect ratification before Step 2 reactivation runs."* |
| **Q-3-C** | ✅ Option (a) Throw discipline | *"Phase 3 strategy router raises a documented diagnostic on no-strategy-applies... Spec §6.1 literal framing is binding... Adding NoStrategyAppliesError as the 13th typed error class composes cleanly with the existing hierarchy: it carries the offending FOL axiom in a folAxiom field, the attempted strategies in an attempted: ProjectionStrategy[] field, and a code: 'no_strategy_applies' field per the existing OFBTError.code convention. Consumers catch NoStrategyAppliesError specifically or OFBTError generically per the existing pattern... The throw discipline introduces no_strategy_applies as the 17th reason code... adding no_strategy_applies is a minor version bump that ADR-011 + spec §11.2 already accommodate. No ADR-011 amendment required... Required of the entry packet: explicit Step assignment for the NoStrategyAppliesError introduction. The SME's call on which Step; my preference is folding into whichever Step ships the typed-error hierarchy completion, for cohesion."* |
| **Q-3-D** | ✅ Option (b) Phase 4 deferral | *"Phase 3 corpus does not demand lifter ObjectPropertyChain support... Phase 4 ARC content surfaces the natural demand. When BFO 2020 ARC content lands at Phase 4, real chain axioms appear in the loaded modules... Phase 3 evaluator's cycle-guarded chain rules can use synthetic projector-direct chain inputs in the interim... Required of the entry packet: Phase 3 explicitly does NOT include lifter ObjectPropertyChain support; Phase 4 entry packet inherits the work as a Phase 4 inheritance item."* |
| **Q-3-E** | ✅ APPROVED 8/8 split | *"The 8 corpus-before-code fixtures (4 No-Collapse adversarial + 4 hypothetical-axiom per API §8.1.2) are correctly identified as architectural-commitment-tier fixtures requiring corpus sign-off before code... The 8 ancillary fixtures (cycle/CWA/step-cap/error-surface) are correctly identified as Step-N-bind... Required of the entry packet: The §3 corpus structure must explicitly tag each Phase 3 fixture as corpus-before-code or step-N-bind... If the SME chooses convention-only, no schema change; documentation in the entry packet's §3 covers the discipline."* |
| **Q-3-F** | ✅ APPROVED — §3.6 schema canonical | *"§3.6 risk estimate is the canonical reference for the Phase 3 reactivation publication artifact format. SME-proposed schema approved... The SME's tagging... matches the canonical Q-Frank-4 schema. Approved as drafted... Required of the publication artifact: produced as Step 2 deliverable per Q-3-A framing requirement; format per §3.6 schema; cross-references each canary's phase3Reactivation field in the manifest; lands in project/reviews/phase-3-reactivation-results.md (suggested SME-domain placement; SME judges on naming/path)."* |
| **Q-3-G** | ✅ Two-pass sequencing | *"Cycle 2 lands in two passes, not one. Pass 2a — Phase 3 entry packet amendments... Pass 2b — Cycle 2 architect-mediated work [I5/I6/I7] are architect-mediated but not entry-packet-internal. They have substantive content of their own that warrants architect ratification at their own routing... Why two passes: Entry packet ratification has its own ratification surface... Audit-trail unity per surface... Pass 2a unblocks Phase 3 implementation Step 1. Pass 2b's I5/I6/I7 work proceeds in parallel without blocking implementation."* |
| **§3 corpus shape** | ✅ APPROVED as proposed | *"Total active count: 46 fixtures + 2 BFO-gated Drafts. Phase 1 closed with 18 fixtures; Phase 2 closed with 27. Phase 3 expanding to 46 active reflects the substantive scope of Phase 3 (evaluator + consistency + cycle detection + per-predicate CWA + structural annotation mismatch + ARC manifest version mismatch + session-aggregate step cap). The scaling is correct."* |
| **Cycle accounting** | Banked | *"This is the Phase 3 entry-packet ratification cycle (initial review)... per-phase entry cycles are not in the same cadence category as mid-phase escalations or between-phase architectural cycles. They are part of the per-phase pattern. The Phase 3 entry-cycle increments the per-phase entry-cycle counter; it does not increment Phase 2's mid-phase counter (which closed at 6) or any cumulative cycle counter."* |

---

## 12. Architect-Banked Principles from This Cycle

Banked verbally by the architect at the initial-review cycle 2026-05-08; formalize at AUTHORING_DISCIPLINE Phase 3 exit doc-pass under "Phase 3 Banked Principles" alongside the principles banked from Phases 1 and 2. Per the cycle-accounting principle (item 8 below), this cycle is the Phase 3 entry-packet ratification cycle and operates in its own bucket independent of prior-phase mid-phase counters.

1. **At-risk-tagged stub-validated assertions warrant pre-emptive review at the next phase's entry, not just reactive amendment when the real implementation surfaces divergence.** Pre-emptive review converts reactive cycle pressure into proactive cycle work, which compounds favorably. *(per Q-3-B)*

2. **Cross-phase deferred architectural closures resolve at the next phase's entry packet ratification cycle when the deferral language explicitly named that target.** The closing cycle's ratification updates the deferring cycle's exit packet to reflect closure, completing the deferral round-trip. *(per Q-3-C)*

3. **When the natural surfacing-context for deferred work spans multiple candidate phases, defer to the phase whose corpus or content demands the work, not the phase whose cycle is next.** Cycle-proximity is not corpus-demand. *(per Q-3-D)*

4. **Corpus-before-code applies to fixtures that exercise architectural-commitment-tier contracts (e.g., spec-named guarantees, API-spec-named behavior contracts).** Implementation-detail fixtures bind to Step-N. The split is binary at corpus authoring time; mixed shapes require routing. *(per Q-3-E)*

5. **Per-canary publication artifact schemas inherit from their forward-tracking origin** (Q-Frank-4 risk-estimate schema, in this case). The publication artifact is the resolution of the risk-estimate forward-track, not a fresh schema design. *(per Q-3-F)*

6. **Cycle 2 architect-mediated work splits by ratification surface:** entry-packet-internal amendments land with the entry packet final ratification commit; ADR promotions, prior-phase exit packet updates, and fixture amendments land in their own routing cycles. The audit-trail-unity-per-surface discipline applies. *(per Q-3-G)*

7. **Verified-fixture vs implementation drift discovered at phase close routes to the next phase's entry packet, not to silent SME edit.** The cycle-discipline preserves the Verified-status-as-architect-ratified guarantee. *(SME pre-banked at I7 disposition; ratified at this entry packet's §4 + Q-3-G ruling)*

8. **Per-phase entry packet ratification cycles operate in their own bucket and do not interact with prior-phase mid-phase counters.** *(cycle-accounting principle, initial-review cycle)*

### Additional banked principles from final ratification cycle 2026-05-08

The architect's amendment-shape verification cycle banked two further principles + a cycle-accounting refinement, all forward-folding to AUTHORING_DISCIPLINE at Phase 3 exit doc-pass alongside principles 1–8 above and the principles banked from Phases 1 and 2.

9. **Pre-emptive review disposition ladders should include a bounded-amendment tier between confirmed-survives and architect-routing-required.** The bounded tier is where the discipline pays its dividend; without it, pre-emptive review collapses to a binary that loses the proactive-conversion benefit. *(per Q-3-B operationalization; three-way disposition ladder: confirmed-survives / pre-amended-divergence / requires-architect-routing)*

10. **Banked principle phrasing transmits verbatim across cycles until formal AUTHORING_DISCIPLINE folding-in.** Paraphrasing at intermediate transmissions risks drift; verbatim preserves load-bearing language. *(per §11 transcription discipline; preserves load-bearing phrasing across architect's banking → entry packet §11 → Phase 3 exit doc-pass formalization → AUTHORING_DISCIPLINE permanent record chain)*

### Cycle-accounting refinement (final ratification cycle 2026-05-08)

The cycle-accounting principle (item 8 above) refines as follows:

**Per-phase entry-cycle counters increment per ratification cycle within the phase entry. Initial review + amendment ratification + corrective sub-cycles each count toward the entry-cycle counter, not toward mid-phase or cumulative counters.**

This cycle's counter: Phase 3 entry-cycle counter at 2 (initial review 2026-05-08 + amendment ratification 2026-05-08). Phase 3 mid-phase counter at 0 (Phase 3 hasn't started). Phase 2 mid-phase counter remains at 6 (closed at Phase 2 exit).

---

## 13. Forward-References

### To Phase 3 implementation (Steps 1–9 per Q-3-A proposed granularity)

| Step | Deliverable | Source |
|---|---|---|
| 1 | `evaluate()` skeleton + types + `UnsupportedConstructError` | §2.1 + §2.4 |
| 2 | Re-exercise gate (3 Phase 2 parity canaries) | §3.2 + I1 |
| 3 | Three-state result + 16-code reason enum | §2.2 |
| 4 | `closedPredicates` + per-predicate CWA | §2.9 |
| 5 | Cycle detection | §2.8 |
| 6 | `checkConsistency` + No-Collapse + `unverifiedAxioms` | §2.5 + §2.6 |
| 7 | Hypothetical-axiom case | §2.7 |
| 8 | Session/error-surface remainders | §2.10 + §2.11 + §2.12 |
| 9 | Phase 3 exit cadence | §8 |

### To Phase 4 entry

| Forward-track | Source |
|---|---|
| BFO 2020 ARC content authoring (parallel workstream) | Plan §3.5 |
| BFO 2020 CLIF Layer B vendoring sidecar with populated license-verification block | ADR-010 + ROADMAP Phase 4 entry checklist |
| Regularity-check upgrade per spec §6.2.1 (Q-Step6-1 ruling) | Phase 2 exit forward-track |
| Activation of 2 BFO-gated Draft fixtures (`nc_bfo_continuant_occurrent`, `nc_sdc_gdc`) | §3.3 above |
| Per-fixture `phase4Reactivation` content for chain fixtures + visual-equivalence-trap | Phase 2 exit forward-track |

### To v0.2

| Forward-track | Source |
|---|---|
| ELK reasoner integration (per spec §13) | Spec §13 |
| SLG tabling for SLD termination (per spec §13 / ADR-011 v0.2 upgrade) | Spec §13 |
| Meta-vocabulary reification opt-in per ADR-007 §10 forward-compat clause | ADR-007 §10 (per Q-Frank-2 promotion) |
| Stronger-than-structural round-trip parity claim (semantic / model-theoretic / axiomatic / entailment-preserving) per Q-Frank-1 forward-tracking note | Spec §8.1 forward-tracking subsection |
| Input `NegativeObjectPropertyAssertion` / `NegativeDataPropertyAssertion` ingestion (currently one-direction-rejected per spec §13.1) | `project/owl-construct-coverage.md` §3 |

---

**End of SME draft. Awaits architect ratification cycle.**

— SME, 2026-05-08
