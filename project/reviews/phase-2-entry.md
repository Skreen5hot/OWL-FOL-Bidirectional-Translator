# Phase 2 Entry Review — AMENDED + RE-CONFIRMED (Conditional on Commit 1 Landing)

**Date:** 2026-05-06 (initial draft); 2026-05-06 (amendment cycle per architect rulings); 2026-05-06 (architect confirmation of amendments); 2026-05-06 (architect re-confirmation cycle following Phase 2 entry verification ritual surfacing license-type defect — ADR-010 corrective action ratified)
**Phase:** 2 — Built-In OWL Projector and Round-Trip Parity
**Plan reference:** `OFBT_implementation_plan_v1 (1).md` §3.3
**Roadmap reference:** [`project/ROADMAP.md`](../ROADMAP.md) Phase 2
**Predecessor:** [`project/reviews/phase-1-exit.md`](./phase-1-exit.md)
**Status:** **AMENDED + RE-CONFIRMED 2026-05-06 (conditional on Commit 1 landing per Q1).** Cycle history: (1) Initial DRAFT 2026-05-06 → (2) architect conditional ratification with seven Q-rulings + two procedural-gate items → (3) AMENDED packet folding all nine items → (4) architect confirmation 2026-05-06 verifying amendments correct → (5) Phase 2 entry verification ritual 2026-05-06 surfaced license-type defect (`BSD-3-Clause` asserted, `CC BY 4.0` actual; commit `783a3f7` does not exist) → (6) ADR-010 corrective action drafted with broaden-to-all-vendored-sources Q-β refinement → (7) architect re-confirmation 2026-05-06 ratifying all four amendment artifacts + Q-α/β/γ rulings + five-way-aligned Commit 3 shape. **Re-confirmation activates as written once Commit 1 (v3.3 catalogue) lands per the procedural gate; no further architect cycle is required.** Developer lands the five-way-aligned Commit 3 per §7.2 (this packet + manifest schema regex + CI gate + corrected sidecar with populated license-verification block + AUTHORING_DISCIPLINE update + ADR-010 + ROADMAP Phase 4 entry-checklist item + `package.json` files-field whitelist). Pre-Step-1 verification ritual is COMPLETE at Commit 3 landing (license-verification block ships populated, not as placeholder). Phase 2 Step 1 begins after Commits 1, 2, 3 all green on remote.

---

## 0. Why this packet routes to the architect first

The cycle-discipline principle banked at Phase 1 entry — **the corpus is the contract the implementation must satisfy; signing off on the contract before code is written prevents the failure mode where the implementation passes tests because the tests were retrofitted to the implementation rather than vice versa** — applies identically to Phase 2.

**Cycle status (2026-05-06).** Initial DRAFT routed to architect on 2026-05-06; architect issued conditional ratification with seven Q-rulings + two procedural-gate items the same day. AMENDED version routed back same day; architect issued conditional confirmation verifying all nine items folded correctly + banking one cross-section defense-pair refinement (now recorded at §10.8). **Confirmation is conditional on Commit 1 (v3.3 catalogue) landing per the Q1 procedural gate; once Commit 1 lands, the confirmation applies as written.**

This packet contains:

1. **Entry-criteria confirmation** against plan §3.3 + ROADMAP Phase 2 entry checklist — §1 below. (Includes the two procedural-gate items per architect Procedural items 1 + 2.)
2. **Phase 2 build target** restated against the spec/API frozen surface — §2 below.
3. **Phase 2 corpus + canary inventory** — §3 below. **This is the contract; architect Q2 + Q3 + Q4 + Q5 rulings APPROVED the corpus + per-canary `phase3Reactivation` content + two-fixture defense-in-depth folding + cross-phase reactivation generalization.**
4. **Validation rings clarification** — §4 below.
5. **Forward-track items inherited from Phase 1 exit** — §5 below.
6. **Risk notes carried into Phase 2** — §6 below. (§6.1 license-verification gate item per architect Procedural item 1; §6.2 other risk notes including Q1 commit-ordering + Q6 three-tier schema-evolution discipline.)
7. **What architect confirmation of amendments opens** — §7 below.
8. **SME certification** — §8 below.
9. **Architect Q-rulings resolved** — §9 below.
10. **Architect-banked principles from this cycle** — §10 below.
11. **Forward-references** — §11 below.

The Developer scaffolds AFTER the architect confirms these amendments AND the four-way-aligned confirmation-cycle commit lands AND the license-verification block is committed AND the bundled ADR-008/009 commit lands. SME does not initiate code work; Developer does not commit code against an unratified corpus.

---

## 1. Entry Criteria — Confirmation Against Plan §3.3 + ROADMAP

Plan §3.3 names two entry criteria; ROADMAP Phase 2 Entry Review names three. All five resolve below.

| # | Criterion | Source | Status | Evidence |
|---|---|---|---|---|
| 1 | Phase 1 exited (Ring 1 passing on built-in OWL corpus) | Plan §3.3; ROADMAP | ✅ | [`project/reviews/phase-1-exit.md`](./phase-1-exit.md) closed 2026-05-05 at commit `12cc5e9`; CI run `25377642295` green. 15 corpus fixtures + 3 inline regressions + 1 BFO/CLIF Layer A parity fixture passing; all `verifiedStatus: 'Verified'` (Step 9.5 commit `acd0b7b`). |
| 2 | Audit artifact type definitions stable (frozen in API spec §6.4) | Plan §3.3; ROADMAP | ✅ | API spec §6.4.1-§6.4.3 frozen at v0.1.7 with C3 critique resolution: `LossSignature` 8-level severity ordering committed with semver consequences (added/reorder/rename rules); `RecoveryPayload` schema stable; `ProjectionManifest` schema stable; `@id` content-addressing rules frozen. Library will export `LOSS_SIGNATURE_SEVERITY_ORDER` as frozen array constant per §6.4.1. |
| 3 | ADR-007 §§1-10 all Resolved | ROADMAP §0.6 + Phase 1 Exit | ✅ | ADR-007 closed at Phase 1 exit per [`project/reviews/phase-1-exit.md`](./phase-1-exit.md) §10 certification item 2. No open Phase-1-deferred architectural commitments. |
| 4a | v3.3 catalogue commit (Commit 1 from prior cycle's procedural gate) landed | Phase 1 exit forward-track + 2026-05-05 architect ruling + Q1 amended ruling | ⚠️ Pending | Per Q1 ruling: **the v3.3 catalogue commit MUST land before Phase 2 entry ratification completes** because §3.5's BFO/CLIF Layer A round-trip fixture depends on the vendored canonical source the v3.3 catalogue grounds. Working tree currently has `project/relations_catalogue_v3_3.tsv` and `project/v3.3-CHANGE-SUMMARY.md` as untracked. **Action: Developer commits the v3.3 catalogue (Commit 1) before the architect confirms this amended entry packet.** |
| 4b | Bundled ADR-008 + ADR-009 ratification commit landed | Phase 1 exit forward-track + 2026-05-05 architect ruling + Q1 amended ruling | ✅ Disposition | Per Q1 ruling: **bundled commit can land before OR after Phase 2 entry ratification, but MUST land before Phase 2 implementation Step 1 begins.** Phase 2 implementation surface (lifter→projector→audit) is structurally independent of Phase 6's expanded module taxonomy and Phase 7's OFI deferral. The bundled commit is independent workstream relative to Phase 2 entry ratification. |
| 5 | Phase 1 exit forward-tracks to Phase 2 entry surfaced | Phase 1 exit §9 | ✅ | Three forward-tracks: Ring 2 closure, audit artifact emission per spec §7, `folToOwl` API surface per API §6.2, two-case Phase 2 demo per banked template. All four addressed in this packet. |
| 6 | License verification of vendored BFO repo LICENSE file | Phase 1 closeout forward-track per architect Procedural item 1 | ⚠️ Pending pre-Step-1 | Per architect Procedural item 1 (Phase 2 entry packet ruling): **before Phase 2 implementation Step 1, confirm the BFO repo `LICENSE` file at the vendored commit (`783a3f7`) is BSD-3-Clause; record SHA-256 of that LICENSE file in `arc/upstream-canonical/owl-axiomatization.clif.SOURCE` as a new `license-verification` block.** The current sidecar (commit `a5b1189`) carries `license: BSD-3-Clause` (asserted) and `license-compatibility: Yes` but does NOT pin a SHA-256 against the BFO repo's actual LICENSE file at the retrieval commit. See §6.1 for the full gating rationale and the artifact spec. |

**Item 4 disposition (per architect Q1 ruling):** ratification of this entry packet is CONCURRENT with the bundled ADR-008/009 commit landing — NOT hard-prerequisite ordering. **Single constraint:** Item 4a (v3.3 catalogue commit) MUST land before architect confirms this amended packet. Item 4b (bundled ratification commit) can land in either order relative to this packet's ratification but MUST land before Phase 2 Step 1.

**Item 6 disposition (per architect Procedural item 1):** the license-verification gate item is recorded as a Phase 2 entry forward-track with explicit pre-Step-1 gating. The full gating contract lives in §6.1 below. Phase 2 implementation Step 1 does NOT begin until this is closed.

---

## 2. Phase 2 Build Target

Per plan §3.3 + ROADMAP Phase 2 Deliverables Checklist + frozen API spec §6.2-§6.4 + frozen behavioral spec §6.1-§6.3 + §7 + §8.1:

### 2.1 Projector (`folToOwl`) — API §6.2

- `folToOwl(folState, options?)` projecting structured FOL (per API §4) back to OWL 2 DL structured output
- `prefixes` parameter per API §6.2 + the C1 closure: when supplied, output uses CURIE form; when omitted, output uses full-URI form
- Three-strategy router per spec §6.2 strategy selection algorithm, applied per-axiom

### 2.2 Three projection strategies — spec §6.1

| Strategy | Spec § | Recovery Payload | Loss Signature |
|---|---|---|---|
| **Direct Mapping** | §6.1.1 | None (lossless) | None |
| **Property-Chain Realization** | §6.1.2 | Conditional (when chain encodes an FOL implication beyond the chain itself) | None for chain-equivalent; emit if chain is partial cover |
| **Annotated Approximation** | §6.1.3 | Always | Required |

ABox content always projects as Direct Mapping (no strategy router invoked). Datatype property assertions always project as Direct Mapping (per spec §6.1 explicit statement). The router operates over TBox content.

### 2.3 Audit artifacts — API §6.4 + spec §7

- `LossSignature` per API §6.4.1 + spec §7.2: 8 severity levels with the frozen ordering (`coherence_violation` > `naf_residue` > `arity_flattening` > `closure_truncated` > `unknown_relation` > `bnode_introduced` > `una_residue` > `lexical_distinct_value_equal`)
- `RecoveryPayload` per API §6.4.2 + spec §7.3: reversible-approximation reconstitution data
- `ProjectionManifest` per API §6.4 + spec §7.4: per-projection summary record
- `@id` content-addressing per spec §7.5: `ofbt:ls/<hash>`, `ofbt:rp/<hash>`, `ofbt:pm/<hash>` — byte-identical across runs for byte-identical inputs
- Frozen severity ordering EXPORTED as `LOSS_SIGNATURE_SEVERITY_ORDER` per API §6.4.1

### 2.4 Round-trip parity (`roundTripCheck`) — API §6.3 + spec §8.1

- `roundTripCheck(owlInput, options?)` returning the §8.1 parity criterion result
- Returns `equivalent: true` for clean fixtures (Direct Mapping + Property-Chain Realization that captures FOL exactly)
- Returns `equivalent: true` modulo Recovery Payloads for reversible fixtures (per spec §7.3)
- Returns `equivalent: false` with documented `diff` field for lossy fixtures
- Default OWA negation handling per spec §6.3 — NO `closedPredicates` parameter yet (that ships with `evaluate` in Phase 3, per plan §3.4)

### 2.5 Strategy selection algorithm — spec §6.2

The strategy selection algorithm has explicit tiered fallthrough. The router must:

- Try Direct Mapping eligibility first.
- If Direct Mapping fails, try Property-Chain Realization.
- If Property-Chain Realization fails, fall back to Annotated Approximation (always emits Loss Signature + Recovery Payload).
- If no strategy applies, raise a documented diagnostic per spec §6.1 — silent strategy-pick is a category error.

### 2.6 NOT in Phase 2 (deferred to later phases per plan)

- `evaluate(folState, query, options?)` per API §7.1 — Phase 3
- `checkConsistency(folState, options?)` per API §8.1 — Phase 3
- `closedPredicates` parameter on `evaluate`/`checkConsistency` per spec §6.3 — Phase 3
- ARC content correctness (spec §12 ARC-content criteria) — Phases 4-7
- Compatibility shim, bundle budget enforcement, coverage matrix CI per ADR-008 Option A — Phase 7
- constitution.ttl Article I §2 pipeline per ADR-008 Option A — Phase 8

---

## 3. Phase 2 Test Corpus — SME-Proposed Inventory for Architect Sign-Off

**This is the contract the projector must satisfy.** Architect ratification of §3 = the corpus is frozen for Phase 2; Developer scaffolds against it.

### 3.1 Phase 1 corpus exercised through `roundTripCheck` (15 fixtures, no new authoring)

The 15 Phase 1 fixtures (now `verifiedStatus: 'Verified'`) get re-exercised through `roundTripCheck`. Each fixture's existing `regime` field (`equivalent` for 14, `reversible` for `p1_restrictions_cardinality`) determines the expected `roundTripCheck` outcome:

| Regime | `roundTripCheck` expected return |
|---|---|
| `equivalent` (14 fixtures) | `{ equivalent: true, recoveryPayloads: [], lossSignatures: [] }` |
| `reversible` (1 fixture: `p1_restrictions_cardinality`) | `{ equivalent: true, recoveryPayloads: [...], lossSignatures: [...] }` — non-empty Recovery Payload + Loss Signature for cardinality semantics that fall outside Direct Mapping (spec §7.3 reversible approximation; `unsupported_construct` Loss Signature reason matches the existing `expectedLossSignatureReasons` field on the fixture) |

**No fixture authoring required for §3.1** — these are the Phase 1 fixtures unchanged, with their `roundTripCheck` outcomes derived from existing fields.

### 3.2 New Phase 2 fixtures — projection edge cases (3 fixtures)

| Fixture | Purpose | Spec/API sections covered |
|---|---|---|
| [`p2_blank_node_class_expression_projection`](../../tests/corpus/p2_blank_node_class_expression_projection.fixture.js) | Anonymous class expressions where the projector must reconstruct the b-node identifier (e.g., `ObjectIntersectionOf(C1, ObjectSomeValuesFrom(P, C2))` lifted through RDFC-1.0 to a Skolemized FOL state, then projected back to OWL — the projector must allocate b-nodes deterministically) | API §6.2; spec §6.1.1; ADR-007 §8 (b-node Skolem prefix) |
| [`p2_property_chain_realization_simplified`](../../tests/corpus/p2_property_chain_realization_simplified.fixture.js) | Property-chain realization in built-in OWL form (NOT the full RDM v1.2.1 chain — that's Phase 7-deferred per ADR-008). Exercises `owl:propertyChainAxiom` emission with a 2-property chain whose FOL implication is captured exactly. | API §6.2; spec §6.1.2 |
| [`p2_lossy_naf_residue`](../../tests/corpus/p2_lossy_naf_residue.fixture.js) | Negation-as-failure residue against open predicates: a deliberately constructed FOL state whose projection MUST emit a non-empty `LossSignature` with `lossType: 'naf_residue'` (severity rank 2). Tests both the Loss Signature emission AND the severity-ordering contract. | API §6.4.1; spec §7.2 |

### 3.3 Phase 2 strategy-routing fixtures (4 fixtures, ROADMAP-listed)

A correct emission of the **wrong** projection strategy is a Ring 2 pass that hides a real bug. These fixtures hand-label each axiom with its expected strategy and assert the projector chose it.

| Fixture | Asserts strategy chosen |
|---|---|
| [`strategy_routing_direct.fixture.js`](../../tests/corpus/strategy_routing_direct.fixture.js) | Axioms expressible in OWL 2 DL (subClassOf, equivalentClass, property characteristics) → strategy `'direct'` |
| [`strategy_routing_chain.fixture.js`](../../tests/corpus/strategy_routing_chain.fixture.js) | Derived implication is a property chain → strategy `'property-chain'`; emitted `owl:propertyChainAxiom` matches expected chain |
| [`strategy_routing_annotated.fixture.js`](../../tests/corpus/strategy_routing_annotated.fixture.js) | Axioms exceeding OWL 2 DL expressivity → strategy `'annotated-approximation'`; structural annotation + machine-readable FOL string + round-trip identifier present per spec §6.1 |
| [`strategy_routing_no_match.fixture.js`](../../tests/corpus/strategy_routing_no_match.fixture.js) | Pathological axiom for which no strategy applies → projector raises documented diagnostic per spec §6.1 (NOT silent strategy-pick) |

These four fixtures lift directly from ROADMAP Phase 2 §"Strategy-Routing Fixtures" — they were architect-pre-approved at the ROADMAP authoring stage. Repeated here for completeness.

**Two-fixture defense-in-depth on strategy-routing correctness (folded in from former §3.7 per Q4 + Q2 architect rulings).** Strategy-routing correctness is Phase 2's high-correctness-risk requirement: a correct emission of the *wrong* strategy is a Ring 2 pass that hides a real bug. The defense pair is:

- **Positive half (this section):** `strategy_routing_direct.fixture.js` — the canonical RIGHT strategy choice on Direct-Mapping-eligible axioms. (The other three §3.3 fixtures — `chain`, `annotated`, `no_match` — are also positive-routing assertions but each on a different strategy; `direct` is the canonical-positive case for the defense pair.)
- **Wrong-shape-absent canary half (cross-reference §3.4):** `parity_canary_visual_equivalence_trap.fixture.js` — engineered such that naive graph-shape comparison reports `equivalent: true` but semantic content has shifted. Asserts the WRONG strategy's symptoms are detectable via query (graph-shape-equivalent but semantically-shifted output).

This pair is the Phase 2 analogue of Phase 1's domain/range high-risk defense (`p1_prov_domain_range` + `canary_domain_range_existential`). Per Q4 ruling, the two-fixture defense-in-depth pattern is portable across phases and folds into AUTHORING_DISCIPLINE.md as Phase 2's worked example.

The pair spans §3.3 (positive half) + §3.4 (canary half) by design — the canary discipline lives with the parity canaries because its assertion mechanism (query-based detection) belongs with the parity canary harness, not the strategy-routing fixture set. The naming convention preserves traceability: any `strategy_routing_*` positive fixture combined with `parity_canary_visual_equivalence_trap` constitutes the worked-example pair.

### 3.4 Phase 2 parity canaries (3 fixtures, ROADMAP-listed) — query-based, not graph-shape-based

The architect banked at Phase 1 entry: **canaries assert the wrong shape is absent, not just that the right shape is present.** Phase 2's canary discipline extends this to query-preservation: a graph-shape comparison can pass when semantic content has shifted; query evaluation catches the shift.

| Fixture | What it forbids the projector from doing |
|---|---|
| [`parity_canary_query_preservation.fixture.js`](../../tests/corpus/parity_canary_query_preservation.fixture.js) | Producing a round-tripped output where a query `Q` that previously evaluated to `true` now evaluates to `'undetermined'` — silent collapse of an entailment through projection |
| [`parity_canary_negative_query.fixture.js`](../../tests/corpus/parity_canary_negative_query.fixture.js) | Producing a round-tripped output where a query `Q` that previously evaluated to `'undetermined'` now evaluates to `false` — silent CWA-collapse through projection (open-world preservation per spec §6.3 default) |
| [`parity_canary_visual_equivalence_trap.fixture.js`](../../tests/corpus/parity_canary_visual_equivalence_trap.fixture.js) | Engineered such that naive graph-shape comparison reports `equivalent: true` but semantic content has shifted; query MUST detect the shift (this is the "correct emission of the wrong projection" failure mode — Ring 2 alone misses it; Ring 2 + query verification catches it) |

These three canaries lift from ROADMAP Phase 2 §"Parity Canaries (query-based, not graph-shape-based)".

**Stub-evaluator harness — approved per Q3 with explicit Phase 3 re-exercise gate.** These canaries depend on a query-evaluation harness. Phase 3 ships `evaluate()` per API §7.1; Phase 2's canary harness uses a stub-evaluator (synchronous, in-process) that gets replaced by the real `evaluate` at Phase 3 entry.

**Stub-evaluator harness contract.** The Phase 2 stub-evaluator lives at `tests/corpus/_stub-evaluator.js` (Developer-implemented). It MUST document explicitly what it does and does not support. The contract is:

| Capability | Stub-evaluator behavior |
|---|---|
| Atomic positive query (`P(a, b)`) | Supported. Returns `'true'` / `'false'` / `'undetermined'` per the lifted FOL state. |
| Atomic negative query (`¬P(a, b)`) | Supported under default OWA (per spec §6.3). Returns `'undetermined'` unless `P(a, b)` is explicitly entailed (then `false`). NO closed-predicate semantics. |
| Existential query (`∃x. P(a, x)`) | Supported with binding-level entailment only — returns `'true'` if a binding is entailed; `'undetermined'` otherwise. |
| Conjunction / disjunction in query body | Supported via decomposition into atomic queries (correctness limited by the underlying atomic behavior). |
| `closedPredicates` parameter | NOT supported — Phase 3's `evaluate` ships this. Stub MUST throw `UnsupportedHarnessFeatureError` if exercised. |
| Cardinality-bearing query (`∃≥2 y. P(x, y)`) | NOT supported — Phase 3's Horn-fragment check + non-Horn fallback handles this. Stub returns `'undetermined'` and emits a harness-level diagnostic. |
| ARC-content-dependent entailment | NOT supported — Phase 4+ adds ARC content. Stub operates on built-in OWL semantics only. |
| Determinism contract | Same input → same output, byte-stable across 100 runs (matches API §6.1.1 / determinism-100-run harness pattern). |

The stub-evaluator harness contract is documented at `tests/corpus/_stub-evaluator.js` as the file's leading JSDoc block. The contract is the audit-trail for what each canary DID assert under the stub; Phase 3 entry re-exercises the canaries against the real `evaluate` and any divergence is a Phase 3 entry escalation per the gate below.

**Per-canary `phase3Reactivation` content.** Each Phase 2 parity canary fixture carries an explicit `phase3Reactivation` field with three sub-fields per architect Q3 ruling: (a) which query is re-exercised, (b) expected result against real evaluator, (c) divergence-from-stub trigger condition.

| Canary | `phase3Reactivation.query` | `phase3Reactivation.expectedResult` | `phase3Reactivation.divergenceTrigger` |
|---|---|---|---|
| `parity_canary_query_preservation` | `Q := <fixture-defined entailed query>` | `'true'` (must match stub) | If real `evaluate` returns `'undetermined'` where stub returned `'true'`, ESCALATE: round-trip lost an entailment. If real returns `'true'` where stub returned `'undetermined'`, NORMAL: stub was too conservative (Phase 3's evaluator handles more cases). |
| `parity_canary_negative_query` | `Q := <fixture-defined unentailed query>` | `'undetermined'` (must match stub; CWA-collapse forbidden) | If real `evaluate` returns `'false'` where stub returned `'undetermined'`, ESCALATE: open-world-preservation broken (a CWA assumption leaked through round-trip). |
| `parity_canary_visual_equivalence_trap` | `Q := <fixture-defined diagnostic query>` | matches stub (`'true'` or `'false'`, fixture-defined) | If real `evaluate` divergence in EITHER direction, ESCALATE: the engineered semantic shift is now visible to the real evaluator and the round-trip's wrongness is confirmed (or the round-trip semantically passes, in which case the canary needs strengthening). |

**Phase 3 entry gate item (per Q3 ruling — required of Phase 3 entry packet authoring).** Phase 3 entry MUST include a gate item: "Re-exercise every Phase 2 stub-evaluated canary against the real `evaluate()` BEFORE Phase 3 implementation work proceeds past its Step 1." Divergence-from-stub triggers Phase 3 entry escalation per each canary's `phase3Reactivation.divergenceTrigger`. This gate item is recorded here so Phase 3 entry packet authoring inherits the obligation without re-litigation.

### 3.5 BFO/CLIF Layer A parity round-trip case (1 new fixture)

Phase 1 banked the BFO/CLIF Layer A parity discipline at exit (`p1_bfo_clif_classical` fixture; commits `55111f2`, `46b7a82`, `a5b1189`, `e1a4973`; Layer A canonical citations against vendored `owl-axiomatization.clif`). The Phase 1 exit forward-track to Phase 2 explicitly asks for **two-case Phase 2 demo per the banked template (canary discipline + Layer A round-trip parity)** — see `phase-1-exit.md` §9.

| Fixture | Purpose |
|---|---|
| [`p2_bfo_clif_layer_a_roundtrip.fixture.js`](../../tests/corpus/p2_bfo_clif_layer_a_roundtrip.fixture.js) | Phase 1's `p1_bfo_clif_classical` lifted construct → projected back → re-lifted; assert the W3C OWL CLIF axiomatization Layer A semantics survive round-trip. Carries `clifGroundTruth` Layer A citations against `owl-axiomatization.clif` (NOT against `bfo-2020.clif`, which is Phase 4 Layer B per AUTHORING_DISCIPLINE.md "Canonical Source Citation Discipline"). |

### 3.6 Total Phase 2 corpus

| Category | Count | New authoring required? |
|---|---|---|
| §3.1 Phase 1 corpus exercised through `roundTripCheck` | 15 fixtures (existing) | No — manifest extension only |
| §3.2 Projection edge cases | 3 fixtures | Yes |
| §3.3 Strategy-routing fixtures | 4 fixtures | Yes |
| §3.4 Parity canaries | 3 fixtures | Yes |
| §3.5 BFO/CLIF Layer A round-trip | 1 fixture | Yes |
| **Total Phase 2 fixtures** | **26** (15 existing + 11 new) | **11 new fixtures** |

**Manifest discipline (Phase 0.8):** all 11 new fixtures register in `tests/corpus/manifest.json` with `phase: 2`. Existing 15 fixtures gain a `phase2RoundTripExpected` derived field (or equivalent — Developer's mechanism choice subject to Phase 0.8 manifest schema).

### 3.7 Defense-in-depth on the high-correctness-risk requirement (cross-reference)

**Folded into §3.3 + §3.4 per Q2 + Q4 architect rulings.** The two-fixture defense pair (`strategy_routing_direct.fixture.js` from §3.3 + `parity_canary_visual_equivalence_trap.fixture.js` from §3.4) is fully described at the end of §3.3. Phase 2's high-correctness-risk requirement is strategy-routing correctness; the defense pair is its worked-example mitigation.

The two-fixture defense-in-depth pattern is approved as portable across phases per Q4 ruling. AUTHORING_DISCIPLINE.md folding-in (post-ratification work) records the principle: **two-fixture defense-in-depth applies to any high-risk requirement where the wrong behavior produces output that would otherwise pass the corpus's structural assertions; per-phase corpus authoring includes one such pair per high-risk requirement.**

### 3.8 Cross-phase activation pattern — generalized per Q5

**Q5 ruling APPROVED.** Phase 1 banked `phase4Reactivation` field on `expectedOutcome` for fixtures gated on later-phase ARC content. Phase 2 generalizes the naming convention to `phaseNReactivation` where N is the activating phase. Phase 2's parity canaries (§3.4) carry `phase3Reactivation` for the stub-evaluator → real-evaluator transition. Phase 2's `p2_property_chain_realization_simplified` carries `phase7Reactivation: { gatedOn: 'compatibility-shim-and-bundle-budget-CI', expectedOutcome: ... }` for the property-chain strategy reactivation point.

**Manifest schema + CI gate update — required four-way alignment per Q5 + the prior schema-evolution discipline (BFO/CLIF parity cycle banked principle: when a manifest discipline changes, schema + gate + manifest entries + fixtures all four-way align in one commit).**

Per Q5 ruling, the schema + gate update lands in **the same routing-cycle commit** as the Phase 2 entry packet ratification, NOT a separate cycle. The four artifacts that must align:

1. `tests/corpus/manifest.schema.json` — adds the generalized field discrimination: recognized field names match `^phase[1-9][0-9]*Reactivation$` regex pattern; structural shape per fixture is the same as the existing `phase4Reactivation` (object with `gatedOn`, `expectedOutcome`, optional `divergenceTrigger` per Q3 canary discipline).
2. `scripts/check-corpus-manifest.ts` — the corpus-manifest CI gate updates to recognize the regex pattern. Manifest entries with field names matching the pattern but with the wrong structural shape fail the gate. Field names NOT matching the pattern but starting with `phase` and ending with `Reactivation` are flagged as suspicious typos (e.g., `phase04Reactivation` with leading zero — invalid per the `^phase[1-9][0-9]*Reactivation$` rule).
3. Existing `phase4Reactivation` entries in current fixtures (Phase 1's `p1_prov_domain_range`) — no rename required because the regex matches the existing name. The grandfathered entries keep working.
4. New Phase 2 fixtures register their `phaseNReactivation` content per §3.4 (canaries carrying `phase3Reactivation`) and §3.6 (`p2_property_chain_realization_simplified` carrying `phase7Reactivation` if applicable).

Banking principle (per Q5 ruling): **field-name generalization patterns apply forward to all subsequent phases without re-routing.** AUTHORING_DISCIPLINE.md folding-in (post-ratification work) records the principle under "Cross-phase reactivation discipline."

---

## 4. Phase 2 Validation Rings

Per plan §2 + ROADMAP Phase 2:

- **Ring 1 (Conversion Correctness):** EXERCISED via §3.1 — Phase 1 fixtures continue to lift. Phase 1 exit criteria continue to hold per ROADMAP Phase 2 Exit Criteria first item.
- **Ring 2 (Round-Trip Parity + Audit Artifacts):** EXERCISED — this is Phase 2's novel ring. All 26 fixtures exercise `roundTripCheck`; the audit artifacts (`LossSignature`, `RecoveryPayload`, `ProjectionManifest`) emit per the §6.4 contract.
- **Ring 3 (Validator + Consistency Check):** DEFERRED. `evaluate` and `checkConsistency` are Phase 3 deliverables. The Phase 2 parity canaries (§3.4) use a stub-evaluator harness as noted in §3.4.

The 100-run determinism contract per API §6.1.1 extends to Phase 2: all 26 fixtures × 100 runs = 2,600 round-trip invocations, all canonicalized outputs byte-identical (mirroring Phase 1's Step 9.3 harness, extended).

---

## 5. Phase 1 Exit Forward-Tracks Inherited at Phase 2 Entry

Per `phase-1-exit.md` §9 "To Phase 2 entry":

| Forward-track | Disposition in this packet |
|---|---|
| Round-trip parity (Ring 2) closure | §2 build target + §3 corpus + §4 validation rings |
| Audit artifact emission (Loss Signature, Recovery Payload, Projection Manifest) per spec §7 | §2.3 build target + §3.2 `p2_lossy_naf_residue` exercises severity ordering |
| `folToOwl` API surface per API §6.2 | §2.1 build target |
| Two-case Phase 2 demo per banked template (canary discipline + Layer A round-trip parity) | §3.4 (canary discipline) + §3.5 (Layer A round-trip); §7 below proposes `demo_p2.html` as a Phase 2 exit deliverable |

All four Phase 1 → Phase 2 forward-tracks are addressed.

---

## 6. Risk Notes Carried Into Phase 2

### 6.1 License-verification gate item (per architect Procedural item 1) — pre-Step-1 GATING

**Forward-track from Phase 1 closeout per Option A; required of Phase 2 entry packet per architect Procedural item 1 ruling 2026-05-06.**

The Phase 1 closeout ratification forward-tracked the BFO/CLIF Layer A vendored source's license verification to Phase 2 entry. The contract:

> "Pre-Phase-2-implementation: confirm and record the actual license type at the BFO repo's LICENSE file at the vendored commit; record SHA-256 of the LICENSE file in the SOURCE sidecar's license-verification field."

(Original Phase 1 closeout forward-track wording assumed BSD-3-Clause; corrected per architect re-confirmation cycle 2026-05-06 + ADR-010.)

**Current state (as of sidecar authoring 2026-05-03; corrected at Phase 2 entry verification ritual 2026-05-06).** The original sidecar at commit `a5b1189` carried `license: BSD-3-Clause` (asserted UNVERIFIED-against-canonical from a layperson reading of the file's preamble note "the repo-level LICENSE governs") and `license-compatibility: Yes`. The 2026-05-06 verification ritual surfaced the actual upstream license is **CC BY 4.0** (BFO repo `LICENSE` file at commit `294fa4167f2e59784abb1e1abb9467f7de37b0cd`, SHA-256 `f5b745ef…cc3f`, 395 lines, first line "Attribution 4.0 International"). The asserted commit reference `783a3f7` does not exist in BFO-ontology/BFO (GitHub Search Commits API: total_count: 0). The CLIF file content SHA-256 (`480193e9…5912`) verifies intact at master HEAD `857be9f15…f3a7`. ADR-010 documents the corrective action; the corrected sidecar lives at [`arc/upstream-canonical/owl-axiomatization.clif.SOURCE`](../../arc/upstream-canonical/owl-axiomatization.clif.SOURCE) post-Commit 3 (five-way-aligned per architect ruling).

**Required artifact (closes the gap, populated with verified canonical values per ADR-010).** The `owl-axiomatization.clif.SOURCE` sidecar gains a top-level `license-verification` block of the following shape (full structure in the post-Commit-3 sidecar):

```yaml
license-verification:
  bfo-repo-license-url: https://github.com/BFO-ontology/BFO/blob/294fa4167f2e59784abb1e1abb9467f7de37b0cd/LICENSE
  bfo-repo-license-commit-sha: 294fa4167f2e59784abb1e1abb9467f7de37b0cd  # "Create LICENSE" (2022-04-19, OBO-Foundry initiative PR)
  bfo-repo-master-head-at-verification: 857be9f15100531c7202ef0eb73142f95b70f3a7
  license-text-confirmed: CC-BY-4.0
  license-file-sha256: f5b745ef98087f531e719ee8ca6a96809444573ecc7173c6fa68eaad39b3cc3f
  license-file-line-count: 395
  license-first-line: "Attribution 4.0 International"
  cc-by-attribution-url: https://creativecommons.org/licenses/by/4.0/
  modifications-to-vendored-file: none (file content byte-stable since 2024-05-23 retrieval; SHA-256 matches upstream)
  discrepancy-resolution-cycle: ADR-010
  verified-by: SME persona, in-repo SME-persona verification ritual per AUTHORING_DISCIPLINE
  verified-at: 2026-05-06
```

**Verification ritual already complete** (per AUTHORING_DISCIPLINE.md "SME-Persona Verification of Vendored Canonical Sources" — second originating example added at this cycle): the SME persona via Orchestrator-side direct fetch from the BFO-ontology/BFO repo on 2026-05-06 confirmed the CC BY 4.0 text matches the canonical Creative Commons boilerplate, computed SHA-256 of the LICENSE file's 395 lines, and wrote both the confirmation and the SHA-256 to the sidecar. **Pre-Step-1 verification ritual is COMPLETE at Commit 3 landing — no separate verification commit needed** per architect commit-shape ruling 2026-05-06.

**Gating contract.** Phase 2 implementation Step 1 does NOT begin until the `license-verification` block is committed (now part of the five-way-aligned Commit 3 per architect ruling). This is a hard gate — same boundary class as Phase 1 entry's "no implementation work before architect-ratified corpus" rule.

**Discrepancy active and resolved by ADR-010.** The 2026-05-06 verification ritual DID surface a discrepancy: the asserted `BSD-3-Clause` is incorrect (actual license is `CC BY 4.0`); the asserted commit reference `783a3f7` does not exist. The SME escalation cycle ran on 2026-05-06 (architect re-confirmation cycle); ADR-010 documents the corrective action with banked principles. **The discipline functioned as designed** — the verification gate caught the discrepancy *before* any Phase 2 implementation work landed and *before* the four-way-aligned Commit 3 fixed an incorrect license-verification block into the repo. The 3-day latency between assertion (2026-05-03) and verification (2026-05-06) is the "first-use-time verification" gap that ADR-010's tightening (license-verification at vendoring time, applied to all vendored canonical sources regardless of format per Q-β refinement) closes for future vendoring.

### 6.2 Other risk notes

- **Strategy-routing correctness is the high-risk requirement.** §3.3 + §3.4 cross-referenced two-fixture defense pair (`strategy_routing_direct.fixture.js` + `parity_canary_visual_equivalence_trap.fixture.js`) is the worked-example mitigation per Q4 ruling. Pattern banked as portable across phases.
- **Stub-evaluator harness for parity canaries — per Q3 ruling.** Stub-evaluator at `tests/corpus/_stub-evaluator.js` with the fidelity contract documented in §3.4. Phase 3 entry MUST re-exercise every Phase 2 stub-evaluated canary against the real `evaluate()` BEFORE Phase 3 implementation work proceeds past its Step 1 (Phase 3 entry gate item recorded in §3.4).
- **Reversible-regime fixtures' Recovery Payload contracts — per Q6 three-tier discipline.** The single Phase 1 reversible fixture (`p1_restrictions_cardinality`) is the first fixture to exercise non-empty `RecoveryPayload` emission in Phase 2. The Recovery Payload schema (API §6.4.2) is frozen but never exercised in Phase 1. **If amendment is needed under Phase 2 real exercise, route per the architect's Q6 three-tier discipline (banked principle):** (i) **Additive optional fields** — §0.2.2 editorial revision (SME drafts; Developer commits; no ADR required); (ii) **New required fields, renamings, or removals** — §0.2.3 evidence-gated change with ADR + implementation evidence + full architect ratification cycle; (iii) **Internal shape refinements within an existing optional field** (sub-field required-vs-optional flips, enum gains a member, etc.) — case-by-case, defaulting to §0.2.3 unless provably non-breaking. **This three-tier discipline applies to ALL frozen API schema types — `LossSignature`, `RecoveryPayload`, `ProjectionManifest`, `ConsistencyResult`, `EvaluationResult`, etc. — not just Recovery Payload.** SME does not initiate Phase 2 schema changes outside this discipline.
- **The 100-run determinism harness extends from Phase 1.** Phase 1's `tests/determinism-100-run.test.ts` exercises 15 fixtures × 100 lifts = 2,100 invocations. Phase 2 extends to 26 fixtures × 100 round-trips = 2,600 invocations. Risk: harness runtime grows linearly with fixture count; at Phase 6 (BFO + IAO + 6 CCO modules per ADR-009) we may be at ~50+ fixtures × 100 runs. SME proposal: track harness runtime as a Phase 2 exit observation; if it grows beyond an architect-named threshold, trigger a harness-tier review at Phase 4 entry. NOT entry-gating.
- **ADR-008 / ADR-009 bundled commits — Q1 commit-ordering constraint.** Per Q1 ruling: the **v3.3 catalogue commit (Commit 1 from prior cycle's procedural gate) MUST land before architect confirms this amended entry packet** (§1 Item 4a). The **bundled ratification commit (Commit 2)** can land before or after Phase 2 entry ratification but MUST land before Phase 2 implementation Step 1 begins (§1 Item 4b). Phase 2 implementation surface is structurally independent of ADR-008/009's Phase 6/7 content shifts; the constraint is procedural (the v3.3 catalogue is the in-repo evidence base grounding §3.5's BFO/CLIF Layer A round-trip fixture), not substantive.

---

## 7. What Architect Confirmation of Amendments Opens

Per the architect's conditional ratification 2026-05-06: the substance of §3 + §4 + §6 is approved per Q1-Q7 rulings; the procedural gate items (license verification + v3.3 catalogue commit) are recorded; this packet's amendments fold all of the above. **Architect confirmation of these amendments completes the Phase 2 entry ratification.**

### 7.1 Pre-confirmation prerequisites (per architect Q1 ruling)

Before architect confirmation completes, the following must land:

1. **v3.3 catalogue commit (Commit 1 from prior cycle's procedural gate)** — Developer commits `project/relations_catalogue_v3_3.tsv` + `project/v3.3-CHANGE-SUMMARY.md` per the prior cycle's specification. (Bundled ADR-008/009 ratification commit can land before or after this entry packet's confirmation.)

### 7.2 Confirmation cycle commit (single four-way-aligned commit per Q5 schema-evolution discipline)

On architect confirmation, Developer commits a single four-way-aligned commit landing:

1. **This entry packet** (`project/reviews/phase-2-entry.md`) — the AMENDED version with status promoted from "AMENDED — awaiting confirmation" to "AMENDED + CONFIRMED" plus the architect's confirmation message preserved verbatim.
2. **Manifest schema update** (`tests/corpus/manifest.schema.json`) — adds the regex pattern `^phase[1-9][0-9]*Reactivation$` per Q5 ruling.
3. **Manifest CI gate update** (`scripts/check-corpus-manifest.ts`) — recognizes the regex pattern; flags suspicious non-matching `phase*Reactivation` field names per Q5.
4. **License-verification block** in `arc/upstream-canonical/owl-axiomatization.clif.SOURCE` per §6.1 spec (closes the Phase 1 closeout forward-track and the architect's Procedural item 1).

### 7.3 Pre-Step-1 prerequisites (after confirmation cycle, before Phase 2 Step 1)

After the confirmation cycle commit lands and before Phase 2 implementation Step 1 begins:

1. **Bundled ADR-008/009 ratification commit (Commit 2 from prior cycle)** — must be on remote with CI green per Q1 ruling.
2. **License-verification block confirmed** — per §6.1, hard pre-Step-1 gate.

### 7.4 Phase 2 implementation step ledger (proposed; Developer-side step granularity)

On all prerequisites cleared, Developer scaffolds Phase 2 per plan §3.3, mirroring Phase 1's Step ledger discipline. Proposed steps (Developer-side detail; SME does not pre-empt):

- **Step 1:** `folToOwl` skeleton + `prefixes` parameter handling
- **Step 2:** Direct Mapping strategy + 14 Phase 1 fixtures' round-trip clean
- **Step 3:** Property-Chain Realization strategy + `p2_property_chain_realization_simplified` + `strategy_routing_chain.fixture.js`
- **Step 4:** Annotated Approximation strategy + `p2_lossy_naf_residue` + `strategy_routing_annotated.fixture.js`
- **Step 5:** Strategy-routing fallthrough + `strategy_routing_no_match.fixture.js`
- **Step 6:** B-node projection + `p2_blank_node_class_expression_projection`
- **Step 7:** `roundTripCheck` + `p1_restrictions_cardinality` reversible-regime exercise (first non-empty `RecoveryPayload` exercise)
- **Step 8:** Audit artifact emission + content-addressing + frozen severity ordering export (`LOSS_SIGNATURE_SEVERITY_ORDER`)
- **Step 9:** Phase 2 exit close-out — parity canaries against stub harness, Layer A round-trip, 2,600-invocation determinism harness, fixture promotion Draft → Verified, exit review

**Note (per Q7 ruling):** `demo_p2.html` is a Phase 2 *post-exit* deliverable per the banked two-case template, NOT a Phase 2 exit gate. Removed from the Step ledger; recorded as a forward-track in §10.

### 7.5 What's NOT covered by this ratification

- **AUTHORING_DISCIPLINE.md folding-ins** (Q4 + Q5 + Q7 banking): post-ratification work; lands in a separate routine commit on the natural cadence of doc updates, not this confirmation cycle.
- **ROADMAP.md cross-cutting "Stakeholder Demo Workstream" folding-in** (Q7 banking): post-ratification work; same cadence as above.
- **Any future Recovery Payload schema amendments** during Phase 2: routed per Q6 three-tier discipline; not pre-authorized by this entry packet.

---

## 8. SME Certification (AMENDED + CONFIRMED — conditional on Commit 1 landing)

I, in the SME / Logic Tester role, attest that:

1. The Phase 2 entry criteria per plan §3.3 + ROADMAP are met or have explicit dispositions (§1 above), including the architect's two procedural-gate items (Procedural item 1 license verification + Procedural item 2 v3.3 catalogue commit).
2. The Phase 2 build target per §2 is faithful to the frozen v0.1.7 spec/API contract — no scope creep, no scope drift.
3. The Phase 2 corpus per §3 is the SME-best-judgment contract for `folToOwl` correctness, audit artifact discipline, and round-trip parity. **It is the contract the projector must satisfy; ratifying it before code is written is the cycle-discipline correct sequencing.** Architect Q2 ruling: corpus APPROVED at 26 fixtures.
4. The two-fixture defense pattern (now folded into §3.3 + §3.4 cross-reference per Q2 + Q4) is portable from Phase 1's domain/range high-risk discipline. Architect Q4 ruling: pattern APPROVED as portable across phases; banked.
5. The cross-phase reactivation pattern (§3.8) generalizes Phase 1's `phase4Reactivation` to `phaseNReactivation`. Architect Q5 ruling: APPROVED with regex-pattern manifest schema update + four-way-aligned commit at confirmation cycle.
6. The parity canary stub-evaluator (§3.4) is a deliberate scoping choice with documented harness contract + per-canary `phase3Reactivation` content + Phase 3 entry re-exercise gate. Architect Q3 ruling: APPROVED.
7. The risks in §6 are surfaced honestly with SME-best-judgment dispositions; the license verification gate (§6.1) and the Recovery Payload three-tier discipline (§6.2) per Q6 are explicitly captured.
8. The seven open questions (formerly §9) have all been ruled on by the architect 2026-05-06; rulings are folded into the body of this amended packet and recorded in §9 below.

**Routing (post-confirmation):**

- **Architect:** confirmation issued 2026-05-06 (conditional on Commit 1 landing per Q1). Confirmation message preserved at §9.1 below. **No further architect cycle is required for the entry packet itself**; if Commit 3's actual artifact-shape diverges from the §7.2 spec (e.g., manifest schema regex doesn't match the ratified pattern, license-verification block YAML diverges from §6.1), that surfaces as a separate escalation.
- **Orchestrator:** route Commit 1 (v3.3 catalogue + change summary) to Developer to clear the Q1 pre-confirmation gate. After Commit 1 lands, the architect's confirmation activates as written; no further architect cycle. Then route Commit 3 (four-way-aligned entry-cycle commit per §7.2) to Developer. Bundled ADR-008/009 ratification commit (Commit 2) lands independently per Q1.
- **Developer:** lands Commit 1 first (path-fenced `corpus:` prefix per architect's reminder); then lands Commit 3 (four-way-aligned: this packet AMENDED+CONFIRMED + manifest schema + CI gate + license-verification block YAML structure with the SHA-256 sub-field as a placeholder pending pre-Step-1 verification ritual); Commit 2 lands at any point relative to Commits 1+3 but before Phase 2 Step 1; pre-Step-1 verification ritual lands as a tiny standalone commit OR folded into a follow-up per Developer preference (the SHA-256 fills in at this step).
- **SME (post-confirmation):** ready to perform the SHA-256 verification ritual once given access to the BFO repo `LICENSE` file at commit `783a3f7`; alternatively the ritual happens at Developer's preferred time.

This packet's substance is APPROVED + CONFIRMED per the architect's rulings 2026-05-06. The remaining work is procedural (commits land in the architect-specified order) and the pre-Step-1 SHA-256 verification ritual.

---

## 9. Architect Q-Rulings — Resolved (2026-05-06)

### 9.1 Architect confirmation of amendments (2026-05-06)

After the AMENDED packet was routed back, the architect verified all nine items (seven Q-rulings + two procedural-gate items) folded correctly. The verification table:

| Ruling | Required fold | Reported fold | Match |
|---|---|---|---|
| Procedural item 1 — license verification gate | §6 risk note with named gating | §1 Item 6 entry criteria + §6.1 full YAML artifact spec | **Exceeds required — promoted to entry criteria with full sidecar block specification; banked as exemplary documentation discipline** |
| Procedural item 2 — v3.3 catalogue commit gate | Documented in entry packet | §1 Item 4a; §7.1 | Correct |
| Q1 — concurrent ratification with v3.3 catalogue constraint | §6 + §7 explicit framing | §1 Items 4a/4b split; §6.2 fifth bullet; §7.1 + §7.3 | Correct |
| Q2 — 26-fixture scope APPROVED; §3.7 clarification | Either two-of-§3.3 or 28-total clarification | Cross-section defense pair: §3.3 `strategy_routing_direct.fixture.js` + §3.4 `parity_canary_visual_equivalence_trap.fixture.js`; §3.7 reduced to cross-reference | **Correct, with refinement noted at §10.8 below** |
| Q3 — stub-evaluator with Phase 3 re-exercise gate | Per-canary `phase3Reactivation` documentation | §3.4 expanded: 8-capability harness contract table + 3-canary `phase3Reactivation` table + Phase 3 entry gate paragraph | **Exceeds required — banked the 8-capability harness contract as exemplary scoping discipline** |
| Q4 — defense-in-depth pattern portability | Banked | §3.3 + §3.7; §10.2 banked principle | Correct |
| Q5 — `phaseNReactivation` regex + four-way-aligned commit | Schema/gate/manifest/fixture aligned in one commit | §3.8 generalized; §7.2 four-way commit spec including license-verification block; §10.3 + §10.7 banked | **Correct — banking that the SME naturally extended "four-way-aligned" to include the license-verification block; the artifact-shape consistency principle generalizes when more artifacts share the cycle** |
| Q6 — three-tier discipline applies to all frozen API schemas | All schema types | §6.2 third bullet; §10.4 banked | Correct |
| Q7 — `demo_p2.html` post-exit, all phases | Step 10 removed from step ledger; banked principle | §7.4 step ledger note; §10.5 banked | Correct |

**All nine items verified.** New sections (§6.1, §6.2, §7.1-7.5, §9, §10, §11) appropriately scoped and follow prior packet structure.

**Confirmation status:** Phase 2 entry packet amendments are CONFIRMED conditional on Commit 1 (v3.3 catalogue + change summary) landing per the procedural gate from the prior cycle. Once Commit 1 lands, this confirmation applies as written. **No further architect cycle is required for the entry packet itself.**

The architect's banking on cycle cadence (re-affirmed): "This is a clean confirmation cycle — short, bounded, no new escalation surface. The prior cycle ratified substantively; this cycle verifies the amendments matched the rulings; both close together as the per-phase entry pattern. No counter-increment for either mid-phase or between-phase cadence buckets — entry-cycle ratification is its own category per the prior cycle's banking."

### 9.2 Q-Rulings table — folded (re-stated for traceability)

The seven open questions in the initial DRAFT received architect rulings on 2026-05-06. Each ruling is folded into the body of this amended packet at the indicated section. Rulings recorded verbatim-shape here for traceability.

| Q | Topic | Ruling | Folded at |
|---|---|---|---|
| Q1 | Concurrent ratification vs hard-prerequisite ordering | **CONCURRENT, with one constraint** — v3.3 catalogue commit (Commit 1) MUST land before architect confirms this packet; bundled ADR-008/009 commit (Commit 2) can land in either order relative to confirmation but MUST land before Phase 2 Step 1. | §1 Items 4a/4b; §6.2 fifth bullet; §7.1 + §7.3 |
| Q2 | 26-fixture corpus scope | **APPROVED as drafted; do not add or remove fixtures.** §3.7 framing folded into §3.3 to clarify the two-fixture defense pair spans §3.3 (positive half) + §3.4 (canary half). | §3.3 closing paragraph; §3.7 cross-reference |
| Q3 | Stub-evaluator harness for parity canaries | **APPROVED with explicit Phase 3 re-exercise gate.** Stub-evaluator harness contract documented at `tests/corpus/_stub-evaluator.js`. Per-canary `phase3Reactivation` field documenting (a) re-exercise query, (b) expected real-evaluator result, (c) divergence-from-stub trigger condition. Phase 3 entry packet inherits the obligation to re-exercise every Phase 2 stub-evaluated canary against real `evaluate()` BEFORE Phase 3 Step 1. | §3.4 stub-evaluator harness contract table + per-canary `phase3Reactivation` table + Phase 3 entry gate item paragraph |
| Q4 | Two-fixture defense-in-depth pattern portability | **APPROVED. Pattern banked as portable across phases.** Per-phase corpus authoring includes one such pair per high-risk requirement. AUTHORING_DISCIPLINE.md folding-in (post-ratification work). | §3.3 closing paragraph; §3.7 cross-reference; §10 banked principles |
| Q5 | `phaseNReactivation` field generalization | **APPROVED.** Manifest schema gains regex pattern `^phase[1-9][0-9]*Reactivation$`; CI gate updated to recognize the pattern; **four-way-aligned commit at confirmation cycle** (schema + gate + manifest entries + fixtures). Field-name generalization patterns apply forward without re-routing. AUTHORING_DISCIPLINE folding under "Cross-phase reactivation discipline" (post-ratification). | §3.8 generalized; §7.2 four-way commit spec; §10 banked principles |
| Q6 | Recovery Payload schema amendment path | **THREE-TIER DISCIPLINE** mirroring spec's §0.2.x freeze-and-evidence-gated discipline: (i) additive optional fields → §0.2.2 editorial; (ii) new required / renamings / removals → §0.2.3 evidence-gated with ADR; (iii) internal shape refinements → case-by-case, default heavy. **Applies to ALL frozen API schema types** (`LossSignature`, `RecoveryPayload`, `ProjectionManifest`, `ConsistencyResult`, `EvaluationResult`, etc.). | §6.2 third bullet; §10 banked principles |
| Q7 | `demo_p2.html` timing | **POST-EXIT, NOT exit gate.** Phase 2 closes when its exit criteria pass per the ratified roadmap; the demo update for Phase 2 follows post-exit. **Cadence applies to all phases.** ROADMAP.md "Stakeholder Demo Workstream" cross-cutting section folding-in (post-ratification). | §7.4 step ledger note; §10 forward-reference; §10 banked principles |

**Two procedural gate items** (architect ruling 2026-05-06, in addition to Q1-Q7):

| # | Topic | Ruling | Folded at |
|---|---|---|---|
| Procedural item 1 | License verification of vendored BFO source | **Required pre-Step-1 gating.** Sidecar gains `license-verification` block (BFO repo `LICENSE` URL/commit-SHA + license text confirmation + LICENSE-file SHA-256 + SME-persona verifier + verification date). | §1 Item 6; §6.1 (full artifact spec) |
| Procedural item 2 | v3.3 catalogue commit status | **Required pre-confirmation gate.** Phase 2 entry ratification cannot complete until the v3.3 catalogue commit lands. | §1 Item 4a; §7.1 |

**The architect's banking on cycle cadence** (recorded for posterity): "Phase entry cycles are not in the same cadence category as mid-phase escalations or between-phase architectural cycles. They are part of the per-phase pattern and do not increment cycle-density counters." The seven open questions in the initial DRAFT is per-phase entry-cycle discipline operating as designed, NOT cycle-density growth.

---

## 10. Architect-Banked Principles from This Cycle

Recorded for traceability and as input to AUTHORING_DISCIPLINE.md / ROADMAP.md folding-in (post-ratification work):

### 10.1 Stub-harness ↔ real-implementation re-exercise discipline (Q3)
**Stub harnesses validate behavior at one level of fidelity; the real implementation re-exercises at full fidelity at the next phase.** The cross-phase reactivation discipline (`phaseNReactivation` field per Q5) makes this transition auditable. Future phases inherit this pattern when a fixture's assertion mechanism is gated on later-phase implementation.

### 10.2 Two-fixture defense-in-depth pattern portability (Q4)
**Two-fixture defense-in-depth applies to any high-risk requirement where the wrong behavior produces output that would otherwise pass the corpus's structural assertions.** Per-phase corpus authoring includes one such pair per high-risk requirement: one positive fixture establishing what the right behavior looks like, plus one canary asserting the wrong behavior's symptoms are absent. The pair MAY span fixture categories (Phase 2's pair spans strategy-routing positives in §3.3 + parity canary in §3.4) when the assertion mechanism for each half lives more naturally in different categories.

### 10.3 Field-name generalization patterns (Q5)
**Field-name generalization patterns apply forward to all subsequent phases without re-routing.** When a phase generalizes a field name (e.g., `phase4Reactivation` → `phaseNReactivation`), the regex-discriminated schema update covers all future phases. Subsequent phases use the generalized field without further architect routing for naming.

### 10.4 Frozen-API schema evolution discipline (Q6)
**Frozen-API schema evolution during implementation follows the same three-tier discipline as the spec itself**: editorial (lightweight, §0.2.2) for additive optional fields; evidence-gated (full ADR process, §0.2.3) for new required fields / renamings / removals; case-by-case (defaulting to heavy) for internal shape refinements. **The schema is the consumer contract; treating its evolution as anything less than the spec's discipline corrupts the freeze.** Applies to ALL API schema types.

### 10.5 Post-exit demo cadence applies to all phases (Q7)
**The post-exit demo cadence applies to all phases, not just Phase 1.** Each phase carries an optional demo deliverable scheduled within the phase but not gating its exit. Stakeholder visibility is real engineering work, but it lives parallel to the build's discipline, not inside it.

### 10.6 Phase entry cycles are a separate cadence category (architect cycle-cadence reading)
**Phase entry cycles are not in the same cadence category as mid-phase escalations or between-phase architectural cycles.** They are part of the per-phase pattern and do not increment cycle-density counters. Per-phase entry-cycle discipline (corpus sign-off + Q-rulings + amendment cycle) is bounded by the corpus contract and resolves before any implementation code is cut. This is the discipline operating as designed, not cycle-density growth.

### 10.7 Schema-evolution four-way alignment (re-banking from BFO/CLIF parity cycle, applied to Q5)
**When a manifest discipline changes, schema + gate + manifest entries + fixtures all four-way align in one commit.** The Q5 confirmation-cycle commit is the canonical example for Phase 2: schema regex update + CI gate update + grandfathered Phase 1 entries + new Phase 2 entries with `phaseNReactivation` content all land together. Applies to any future manifest-discipline evolution.

**Architect-banked extension at confirmation (2026-05-06):** the SME naturally extended "four-way-aligned" to include the license-verification block (a fifth artifact riding the same cycle). **The artifact-shape consistency principle generalizes when more artifacts share the cycle** — "four-way" is the canonical shorthand, but the principle is "all artifacts whose discipline-level coherence binds them together align in one commit." Future cycles MAY ride more or fewer artifacts as the discipline-level coherence dictates; the alignment-in-one-commit rule scales with them.

### 10.8 Cross-section defense-in-depth pair pattern (architect refinement at confirmation 2026-05-06)
**Defense-in-depth pairs MAY cross corpus sections when the canary's natural home is a different section than the positive fixture's. The pairing is named explicitly in the entry packet so the cross-section relationship is auditable.**

The refinement clarifies §10.2's portability principle: the Phase 1 pair (`p1_prov_domain_range` in standard corpus + `canary_domain_range_existential` in canary set) was cross-section *by accident* because the canary set is a structural sibling of the standard corpus. The Phase 2 pair (`strategy_routing_direct.fixture.js` from §3.3 strategy-routing positive + `parity_canary_visual_equivalence_trap.fixture.js` from §3.4 parity canary) is cross-section *by design* because:

- Strategy routing being correct is defended both by a positive routing assertion (§3.3 confirms the right strategy was chosen) and by a negative semantic-shift assertion (§3.4 confirms the wrong strategy didn't produce visual-equivalence-trap output that would silently pass round-trip parity).
- The canary's natural home is §3.4 because it asserts a parity-side concern (round-trip preservation of query semantics), even though the bug it defends against (wrong strategy routing) is a §3.3 concern.

**Banking the pattern as design-time (not accidental):** future phases MAY pair fixtures across different sections when the assertion mechanisms naturally live in different categories. The pairing is named explicitly in the entry packet (this packet's §3.3 closing paragraph + §3.7 cross-reference) so the cross-section relationship is auditable.

**AUTHORING_DISCIPLINE folding deferred to Phase 2 exit doc pass** per architect ruling: "Folding into AUTHORING_DISCIPLINE under the existing 'Two-fixture defense-in-depth pattern' subsection at Phase 2 exit doc pass — not now; the refinement banks here and formalizes when the discipline has been exercised through Phase 2." Banked here for Phase 2 exit packet authoring to inherit.

---

## 11. Forward-References

- Phase 2 exit review template (to be authored at Phase 2 close): `project/reviews/phase-2-exit.md`
- `demo_p2.html` (per Q7 ruling, post-exit): `demo/demo_p2.html`
- New Phase 2 fixtures (11): `tests/corpus/p2_*.fixture.js`, `tests/corpus/strategy_routing_*.fixture.js`, `tests/corpus/parity_canary_*.fixture.js`
- Manifest extension: `tests/corpus/manifest.json` gains 11 new entries with `phase: 2` (existing schema field name; the schema documents the field as "phase that the fixture activates in") plus per-fixture `phaseNReactivation` content where applicable
- Manifest schema regex update: `tests/corpus/manifest.schema.json` adds `^phase[1-9][0-9]*Reactivation$` pattern (per Q5)
- Manifest CI gate update: `scripts/check-corpus-manifest.ts` recognizes the regex pattern (per Q5)
- License-verification block: `arc/upstream-canonical/owl-axiomatization.clif.SOURCE` gains `license-verification` block (per Procedural item 1 + §6.1)
- 100-run determinism harness extension: `tests/determinism-100-run.test.ts` extends to round-trip invocations (Phase 2 Step 9 deliverable)
- AUTHORING_DISCIPLINE.md folding-ins (post-ratification, separate commit): banked principles 10.1, 10.2, 10.3, 10.4 per Q3/Q4/Q5/Q6 rulings
- ROADMAP.md "Stakeholder Demo Workstream" cross-cutting folding-in (post-ratification, separate commit): banked principle 10.5 per Q7 ruling

---

**End of AMENDED + CONFIRMED Phase 2 Entry Review (conditional on Commit 1 landing).** Architect confirmed amendments 2026-05-06; confirmation activates as written once Commit 1 lands per Q1. Developer then lands Commit 3 (four-way-aligned confirmation-cycle commit per §7.2). Pre-Step-1 SHA-256 ritual fills in license-verification block per §6.1. Phase 2 implementation Step 1 begins thereafter.
