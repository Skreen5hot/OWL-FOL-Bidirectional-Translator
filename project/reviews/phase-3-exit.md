# Phase 3 Exit Review

**Date:** 2026-05-09 (initial draft); 2026-05-10 (Q-3-Step9-A disposition integration post-architect-ruling + amendment-4 landing); **2026-05-10 (same day, Q-Frank-Step9-A corrective ruling integration: 3 banking withdrawals + 7 new bankings + 1 meta-banking; Case B pulled from demo; count divergence resolved via fixture amendment; ADR-007 §10 promoted to Accepted; v0.2-roadmap.md authored; disposition-split discipline withdrawn)**
**Phase:** 3 — Validator, Evaluation, and Consistency Check
**Plan reference:** `OFBT_implementation_plan_v1 (1).md` §3.4
**Roadmap reference:** [`project/ROADMAP.md`](../ROADMAP.md) Phase 3
**Predecessor:** [`project/reviews/phase-3-entry.md`](./phase-3-entry.md) (RATIFIED + AMENDED 2026-05-08)
**Status:** Phase 3 closed; Phase 4 entry conditions surfaced (not yet ratified — Phase 4 entry's work).

---

## 1. Executive Summary

Phase 3 ships the validator pipeline. `evaluate()` per API §7.1 (bounded-SLD resolution + per-query 10K step cap + per-session aggregate cap), `checkConsistency()` per API §8.1 (three-state ConsistencyResult per Q-3-Step6-A option (α) editorial correction; No-Collapse Guarantee surface per spec §8.5; `unverifiedAxioms` honest-admission per API §8.1.1; hypothetical-axiom case per API §8.1.2 with non-persistence guarantee), `loadOntology()` per API §5.5 (FOL→Tau Prolog clause translation per ADR-007 §11; `cumulativeAxioms` + `cumulativeSkipped` accumulation across multi-call sessions), and the session lifecycle (`createSession` / `disposeSession`; lazy Tau Prolog allocation; session-required + session-disposed gates per API §10.3) close the bidirectional pipeline's third validation ring against built-in OWL content. The Phase 3 demo (`demo/demo_p3.html`) ships a single-argument structure — No-Collapse adversarial canary discipline (Case A) + hypothetical-axiom non-persistence sub-case (A.7) — claiming what the implementation establishes and not claiming what it cannot demonstrate.

**Five** architectural cycles surfaced and ratified within Phase 3 (Steps 3, 4, 5, 6 + Step 9 architectural-gap micro-cycles) plus one retroactive corrective ritual + one stakeholder-routing corrective sub-cycle (Q-Frank-Step9-A). The Step 9 cycle (Q-3-Step9-A 2026-05-10) is the canonical exit-blocking-finding example — surfaced by Aaron's stakeholder-feedback live-deploy smoke-check post-9.4-amendment-3 probe-fix; the original ruling was Frame I (implementation gap, not fixture-discriminator overscope) + D2 disposition with three structural refinements. Step 9.4-amendment-4 commit (7526973, CI green) closed the bounded `nc_self_complement` fix.

**The Q-Frank-Step9-A corrective ruling 2026-05-10** (same day as Q-3-Step9-A) followed Frank's stakeholder critique. The architect issued **3 banking withdrawals + 7 new bankings + 1 meta-banking**: (1) the original "documented v0.1 spec-divergence" framing for Layer A was a soft-language pattern; Case B was **pulled from the demo entirely** (banked principle: demos do not claim what the implementation cannot demonstrate); (2) the count-divergence forward-tracking shipped mutually inconsistent fixtures and code, so the divergence was **resolved now** via fixture amendment (`expectedUnverifiedAxiomsMinCount: 2 → 1`; the implementation is correct on the merits); (3) the disposition-split discipline was **withdrawn** as banked principle (banked principle: disciplines invented in response to specific findings do not get canonized as architectural-commitment-tier methodology in the same cycle); (4) **Case C — Lossy round-trip — committed to Phase 4 as exit deliverable** (stakeholder-flagged demo gaps that span multiple phase cycles get explicit phase-deliverable commitments); (5) **ADR-007 §10 promoted to Accepted** with Q-Frank-2 boundary-statement refinement; (6) **`project/v0.2-roadmap.md` authored** consolidating every "v0.2 ELK closes that" commitment from across Phases 1-3.

One new ADR landed (ADR-013, visited-ancestor cycle-guard pattern; six cycle-prone predicate classes; ratified at the Step 5 architectural-gap micro-cycle 2026-05-08); one new reason code added to the API §7's frozen enum (`no_strategy_applies` per Q-3-C, closing the Phase 2 Item 8 forward-track from `strategy_routing_no_match`); ADR-007 extended with §11 (FOL→Tau Prolog clause translation rules per-variant table). Three architectural surfaces editorially corrected in tandem with Steps 4 and 6: `cwa_open_predicate` reason-code reuse (`naf_residue` → `open_world_undetermined` per Q-3-Step4-A); ConsistencyResult three-state shape (`consistent: boolean` → `result: 'true' | 'false' | 'undetermined'` per Q-3-Step6-A); `nc_self_complement` reason-code reuse (`horn_inconsistency_proven` → `inconsistent` per Q-3-Step6-B). The verification ritual operationalized at Step 4 (8-category SME pre-handoff verification, binding from Step 4 forward) paid first production dividends at Step 5 (caught a non-existent spec §3.4.4 reference) and again at the retroactive corrective cycle (caught FOL @type discriminator errors in 4 hypothetical fixtures from Pass 2a authoring).

~50 verbally-banked principles formalized into AUTHORING_DISCIPLINE.md at Step 9.5 doc-pass (~46 from prior cycles + 2 preserved from Q-3-Step9-A original + 7 new + 1 meta-banking from Q-Frank-Step9-A corrective ruling, MINUS 3 withdrawn Q-3-Step9-A bankings; verbatim-transcription discipline preserved in section "Phase 3 Banked Principles"; cycle-stratified by entry packet initial review, entry packet final ratification, Step 3 / Step 3 Pass 2b / Step 4 / Step 5 / Step 5 Pass 2b / Step 6 / Step 9 architectural-gap with Q-Frank-Step9-A corrective overlay / retroactive corrective). Four Phase 3 exit retro forward-track candidates routed to Phase 4 entry packet authoring: parallel-registry reconciliation; substantive-scope-weighting methodology refinement; at-risk-tag-conservatism observation; **banking-correction discipline** (new from Q-Frank-Step9-A; the architect issues banking corrections — withdrawals + new bankings — when stakeholder critique surfaces concerns that hold on the merits).

Forward-tracks hand to Phase 4 entry (refined inheritance per Q-Frank-Step9-A: Case C as exit deliverable, Phase 2 reactivation surface as opening, purpose-built Layer A consistency-check parity fixture question, banking-correction discipline retro analysis; **NOT** the disposition-split discipline as methodology candidate — that forward-track is withdrawn) and v0.2 (Layer A consistency-affirmation gap + ELK / SROIQ integration; closure commitments consolidated in [`project/v0.2-roadmap.md`](../v0.2-roadmap.md)).

Ring 1 (Conversion Correctness — Phase 1 lifter) and Ring 2 (Round-Trip Parity + Audit Artifacts — Phase 2 projector) continue green throughout Phase 3's validator work. Ring 3 (Validator + Consistency Check) closed at Step 7 (FOLFalse-in-head inconsistency proof) and Step 8 (closure_truncated bundling per Q-3-Step5-C item 5 Pass 2b promotion), with Step 9.4-amendment-4 closing the `nc_self_complement` Horn-decidable inconsistency gap. The Layer A consistency-affirmation surface is a v0.1 implementation gap with named v0.2 ELK closure path per [`project/v0.2-roadmap.md`](../v0.2-roadmap.md); per Q-Frank-Step9-A Ask 1 it was pulled from the demo (the demo claims what the implementation establishes, not what it cannot demonstrate).

---

## 2. Steps 1-9 Ledger

| Step / Sub-step | Subject |
|---|---|
| Phase 3 entry | Phase 3 entry packet `phase-3-entry.md` ratified 2026-05-08; 9-step ledger; corpus-before-code/step-N-bind 8/8 split per Q-3-E; Pass 2a corpus authoring landed 16 fixtures |
| 1 | `evaluate()` skeleton + per-query 10K step cap per API §7.2; `EvaluableQuery` validation per §7.5 |
| 1b | `evaluate()` composition-layer wrapper per API §7.1 |
| 2 | Phase 2 stub-evaluator parity-canary reactivation against real `evaluate()` per Q-Frank-4 ruling 2026-05-07 + Phase 3 entry packet §3.6 SME risk estimates; 3/3 survived; per-canary publication artifact `phase-3-reactivation-results.md` |
| 3 | `loadOntology()` composition function per API §5.5 + ADR-007 §11 placement (Step 3 architectural-gap micro-cycle 2026-05-08; Q-3-Step3-A + Q-3-Step3-B + Q-3-Step3-C ratifications; Pass 2b 3 banked principles) |
| 4 | Closed-predicates / CWA per API §6.3 + spec §6.3.2; `closedPredicates` parameter operational; `open_world_undetermined` reason-code reuse for `cwa_open_predicate` per Q-3-Step4-A ratification 2026-05-08; verification ritual operationalized 8 categories binding from Step 4 forward |
| 5 | Cycle detection per spec §5.4 + ADR-013 visited-ancestor cycle-guard pattern (Step 5 architectural-gap micro-cycle 2026-05-08; Q-3-Step5-A + Q-3-Step5-B + Q-3-Step5-C ratifications; ADR-013 ratified Accepted; Pass 2b 2 banked principles; first production dividend of verification ritual on routing artifact's spec §3.4.4 reference error) |
| 6 | `checkConsistency()` per API §8.1 + No-Collapse Guarantee per spec §8.5 + `unverifiedAxioms` honest-admission surface per API §8.1.1 (Step 6 architectural-gap micro-cycle 2026-05-09; Q-3-Step6-A three-state ConsistencyResult; Q-3-Step6-B `inconsistent` reason-code reuse; Q-3-Step6-C ratifications; retroactive corrective ritual surfaced Cat 3 FOL @type discriminator errors in 4 hypothetical fixtures from Pass 2a; first production batch dividend of retroactive ritual) |
| 7 | FOLFalse-in-head inconsistency proof per spec §8.5.2 outcome ordering (inconsistency proof takes precedence over Horn-fragment-incompleteness); hypothetical-axiom case per API §8.1.2 (axiomSet participates without persistence) |
| 8 | Step caps + session-aggregate cap + closure_truncated bundling per Q-3-Step5-C item 5 Pass 2b promotion; `SessionStepCapExceededError` per API §10; structural annotation declaration consistency per API §2.1.1 + ARC manifest version mismatch per API §2.1.2 |
| 9.1 | Per-canary publication artifact `phase-3-reactivation-results.md` (Q-Frank-4 commitment delivered; 3× survived; at-risk-tag-conservatism observation forward-tracked) |
| 9.2 | Determinism harness verification — 43 fixtures × 100 runs (smoke check at RUNS=3 yielded 147 invocations against the 129 floor; CI runs 100 per API §6.1.1 contract); harness's three-shape dispatcher (`cases[]` / `inputs{}` / `input`) + projector-direct discriminator covers all 43 manifest entries |
| 9.3 | 8 Phase 3 fixtures `verifiedStatus: "Draft"` → `"Verified"` (`nc_self_complement`, `nc_horn_incomplete_disjunctive`, `nc_horn_incomplete_existential`, `nc_silent_pass_canary`, `hypothetical_clean`, `hypothetical_horn_incompleteness`, `hypothetical_non_persistence`, `step_cap_per_query`); 1 Draft remains forward-tracked (`cycle_equivalent_classes` Class 3 per Q-3-Step5-B); 2 BFO-gated future fixtures defer to Phase 4 (`nc_bfo_continuant_occurrent`, `nc_sdc_gdc`) |
| 9.4 | `demo_p3.html` two-case template per `demo/README.md` (Case A No-Collapse Guarantee canary discipline + Case B Layer A consistency-check parity + hypothetical-axiom non-persistence sub-case); `demo/index.html` flipped to Phase 3 shipped |
| 9.4-amendment-1 | tau-prolog import-map deploy fix (browser ESM cannot resolve bare module specifiers); SME path-fence-amendment per Aaron's routing dispatch 2026-05-09 + Phase 2 Step 9 R5 amendment precedent |
| 9.4-amendment-2 | UMD-to-ESM bridge shim (3-step bridge: sync `<script>` for UMD init + import-map routing to bridge shims `demo/tau-prolog-shims/{esm-shim,lists-esm-shim}.js`); SME pre-anticipated at amendment-1 dispatch |
| 9.4-amendment-3 | tau-prolog version probe fix (restored clean console on deployed demo); commit 7216cd4 |
| 9.4-amendment-4 | `nc_self_complement` Horn-decidable inconsistency gap closure per Q-3-Step9-A Refinement 1 (Developer hypothesis investigation + bounded fix per (a) iff-unfolding OR (b) FOLFalse-in-head detection scope extension); commit 7526973, CI green |
| Step 9 arch-gap | Q-3-Step9-A architectural-gap micro-cycle ratification 2026-05-10 (Frame I + D2 disposition + three structural refinements + 5 banked principles); `phase-3-step9-architectural-gap.md` audit-trail record |
| 9.5 | AUTHORING_DISCIPLINE.md folding-in — Phase 3 Banked Principles section (~51 principles total: ~46 from prior cycles + 5 new from Q-3-Step9-A Step 9 architectural-gap subsection; transcribed verbatim per the verbatim-transcription discipline; cycle-stratified subsections) |
| 9.6 | (this commit) Phase 3 exit summary + ROADMAP Phase 3 close grounding (post-Q-3-Step9-A integration) |

Cross-cutting routing-cycle commits (interleaved with the Step ledger):

| Cycle | Subject |
|---|---|
| Phase 3 entry initial review (2026-05-07) | 8 banked principles per `phase-3-entry.md` initial-review amendment cycle |
| Phase 3 entry final ratification (2026-05-08) | Q-3-A through Q-3-G rulings; 3 banked principles |
| Step 3 architectural-gap (2026-05-08) | Q-3-Step3-A / Q-3-Step3-B / Q-3-Step3-C; `phase-3-step3-architectural-gap.md`; 2 banked principles + Pass 2b 3 |
| Step 4 architectural-gap (2026-05-08) | Q-3-Step4-A; verification ritual operationalized; `phase-3-step4-architectural-gap.md`; 8 banked principles |
| Step 5 architectural-gap (2026-05-08) | Q-3-Step5-A / Q-3-Step5-B / Q-3-Step5-C; ADR-013 ratified; `phase-3-step5-architectural-gap.md`; 6 banked principles + Pass 2b 2 |
| Step 6 architectural-gap (2026-05-09) | Q-3-Step6-A / Q-3-Step6-B / Q-3-Step6-C; `phase-3-step6-architectural-gap.md`; 10 banked principles |
| Retroactive corrective ritual (2026-05-09) | Cat 3 FOL @type discriminator errors in 4 hypothetical fixtures; `phase-3-retroactive-corrective.md`; 3 banked principles |
| **Step 9 architectural-gap (2026-05-10, original)** | Q-3-Step9-A exit-blocking finding (live-deploy `checkConsistency()` divergences); Frame I ruling + D2 disposition + 3 structural refinements; `phase-3-step9-architectural-gap.md`; 5 banked principles; counter 4 → 5 |
| **Q-Frank-Step9-A stakeholder-routing corrective sub-cycle (2026-05-10, same day)** | Frank's stakeholder critique [`demo/Phase3DemoCritique.md`](../../demo/Phase3DemoCritique.md) flagged Layer A "documented v0.1 spec-divergence" framing as procedural language papering over a real gap; disposition-split discipline as post-hoc rationalization; count-divergence forward-tracking as shipping mutually inconsistent fixtures and code. **Architect corrective ruling: 3 banking withdrawals + 7 new bankings + 1 meta-banking + 4 Asks executed in corrective commit** (pull Case B + amend count + promote ADR-007 §10 + author v0.2-roadmap.md). Stakeholder-routing corrective sub-cycle (does NOT increment phase mid-phase counter; counter remains 5). Banking-correction discipline operationalized; Frank's letter banked as exemplar of post-hoc-discipline-canonization risk pattern. |

---

## 3. Acceptance-Criteria Coverage Matrix

### Spec §12 (behavioral acceptance criteria)

| Criterion | Phase 3 status | Coverage |
|---|---|---|
| §12.1 Lifter correctness on built-in OWL | ✅ Continues from Phase 1 close (Ring 1) | 15 Phase 1 corpus fixtures + 3 inline regressions; Ring 1 green throughout Phase 3 |
| §12 Round-trip parity | ✅ Continues from Phase 2 close (Ring 2) | 12 Phase 2 corpus fixtures × `roundTripCheck` + parity-canary harness; Ring 2 green throughout Phase 3 |
| §12 Determinism | ✅ Closed at Phase 3 | Determinism harness covers all 43 manifest entries (15 Phase 1 + 12 Phase 2 + 16 Phase 3 = 43); 100-run contract per API §6.1.1; coverage-floor assertion catches silent-skip regressions |
| §12 Honest-admission (spec §0.1) | ✅ Closed at Phase 3 | `unverifiedAxioms` populated per API §8.1.1 when reason === `coherence_indeterminate`; `cumulativeSkipped` aggregation across multi-call sessions; `no_strategy_applies` reason code added per Q-3-C closing the Phase 2 Item 8 forward-track |
| §12 Strategy router correctness | ✅ Continues from Phase 2 close (Step 5 + Step 6) | Phase 2's strategy-routing canary discipline holds; Phase 3 adds `no_strategy_applies` reason code per Q-3-C |
| §12 Audit artifact emission | ✅ Continues from Phase 2 close (Step 4a) | LossSignature + RecoveryPayload + ProjectionManifest with content-addressed `@id` per ADR-011; closure_truncated trigger-matcher landed at Step 8 per Q-3-Step5-C item 5 Pass 2b |
| §12 Consistency-check / No-Collapse Guarantee per §8.5 | ✅ Closed at Phase 3 (Ring 3) on the engineered adversarial corpus | 4 No-Collapse adversarial fixtures + 4 hypothetical-axiom fixtures + 2 cycle fixtures + 2 closed-predicate fixtures + 2 step-cap fixtures + 2 session-error fixtures = 16 Phase 3 corpus fixtures; three-state ConsistencyResult per Q-3-Step6-A; `unverifiedAxioms` per API §8.1.1; FOLFalse-in-head inconsistency proof per spec §8.5.2 outcome ordering at Step 7 + `nc_self_complement` Horn-decidable inconsistency closure at Step 9.4-amendment-4. **v0.1 implementation gap:** Layer A consistency-affirmation gap (`p1_bfo_clif_classical` returns `'undetermined'` where spec §8.5.1 Horn-checkable fragment requires `'true'`); per Q-Frank-Step9-A Ask 1 the gap is named honestly in this internal exit summary but the consumer-facing demo does not claim Layer A consistency-check parity (Case B was pulled). v0.2 ELK closure path per [`project/v0.2-roadmap.md`](../v0.2-roadmap.md). **Count divergence resolved on the merits:** `nc_horn_incomplete_disjunctive` `expectedUnverifiedAxiomsMinCount` amended 2 → 1 per Q-Frank-Step9-A Ask 2 (the implementation is correct; only the disjunctive-consequent SubClassOf is non-Horn). |
| §12 ARC content correctness | Phase 4-7 ARC content | Phases 4-7 |

### API §14 (API-level acceptance criteria)

| Criterion | Phase 3 status |
|---|---|
| API-1 (sessions) | ✅ Closed (`createSession` / `disposeSession`; lazy Tau Prolog allocation; session-required + session-disposed gates per API §10.3) |
| API-2 (loadOntology) | ✅ Closed (Step 3 per API §5.5; FOL→Prolog translation per ADR-007 §11; `cumulativeAxioms` + `cumulativeSkipped` accumulation) |
| API-3 (evaluate) | ✅ Closed (Steps 1 + 1b + 2 per API §7.1; bounded-SLD resolution; per-query 10K step cap per API §7.2; aggregate cap per API §2.1) |
| API-4 (checkConsistency) | ✅ Closed (Step 6 + Step 7 per API §8.1; three-state ConsistencyResult; No-Collapse Guarantee; FOLFalse-in-head inconsistency proof) |
| API-5 (unverifiedAxioms) | ✅ Closed (Step 6 per API §8.1.1; populated when reason === `coherence_indeterminate`) |
| API-6 (hypothetical axioms) | ✅ Closed (Step 7 per API §8.1.2; `axiomSet` participates without persistence; non-persistence guarantee verified by `hypothetical_non_persistence` two-call protocol fixture) |
| API-7 (cycle detection) | ✅ Closed (Step 5 per ADR-013 visited-ancestor cycle-guard pattern; six cycle-prone predicate classes; `cycle_detected` reason code) |
| §6.1 `owlToFol` | ✅ Continues from Phase 1 close |
| §6.2 `folToOwl` + strategy router | ✅ Continues from Phase 2 close |
| §6.3 `roundTripCheck` | ✅ Continues from Phase 2 close |
| §6.3 `closedPredicates` parameter | ✅ Closed at Step 4 per Q-3-Step4-A |
| §7.1 `evaluate` signature | ✅ Closed (Step 1 + Step 1b) |
| §7.2 step caps + three-state result | ✅ Closed (Steps 1 + 8) |
| §7.4 configurable throw-on-cap | ✅ Closed (Step 8) |
| §7.5 `EvaluableQuery` restriction | ✅ Closed (Step 1; `UnsupportedConstructError` with `suggestion` field for FOLAxiom variants outside the EvaluableQuery subset) |
| §8.1 `checkConsistency` signature + ConsistencyResult | ✅ Closed (Step 6 per Q-3-Step6-A three-state shape) |
| §8.1.1 `unverifiedAxioms` field | ✅ Closed (Step 6) |
| §8.1.2 hypothetical-axiom case | ✅ Closed (Step 7; non-persistence guarantee) |
| §10.3 session-required / session-disposed | ✅ Closed (Step 3 lifecycle gates on every consuming API) |
| §10.7 TauPrologVersionMismatchError | ✅ Closed (Step 3 + version probe per `src/kernel/tau-prolog-probe.ts`) |
| §2.1.1 structural annotation declaration consistency | ✅ Closed (Step 8; `structural_annotation_mismatch` thrown on detection) |
| §2.1.2 ARC manifest version mismatch | ✅ Closed (Step 8; `arc_manifest_version_mismatch` thrown when session and conversion versions diverge) |

---

## 4. Validation Rings Status

| Ring | Phase 3 status | Notes |
|---|---|---|
| Ring 1 (Conversion Correctness) | ✅ Continues green throughout Phase 3 | Phase 1 lifter unchanged; Phase 1 + Phase 2 corpus continues to pass |
| Ring 2 (Round-Trip Parity + Audit Artifacts) | ✅ Continues green throughout Phase 3 | Phase 2 projector unchanged; Phase 2 corpus + parity-canary harness continues to pass |
| Ring 3 (Validator + Consistency Check) | ✅ Closed at Step 7 + Step 9.4-amendment-4 on the engineered adversarial corpus; Layer A consistency-affirmation gap is a v0.1 implementation gap with v0.2 ELK closure path | 16 Phase 3 corpus fixtures × Ring 3 verification; FOLFalse-in-head inconsistency proof per spec §8.5.2; `unverifiedAxioms` honest-admission surface populated per API §8.1.1 when reason === `coherence_indeterminate`. `nc_self_complement` Horn-decidable inconsistency closure at Step 9.4-amendment-4 (Frame I ruling). Layer A affirmation gap named honestly in this internal exit summary; Case B pulled from the consumer-facing demo per Q-Frank-Step9-A Ask 1 (banked principle: demos do not claim what the implementation cannot demonstrate; honest-admission framing applies to internal exit-summary artifacts, not to consumer-facing demo artifacts). |

The 100-run determinism contract per API §6.1.1 extends to Phase 3 at Step 9.2: 43 fixtures (15 Phase 1 + 12 Phase 2 + 16 Phase 3) × 100 runs = 4,300 invocation floor. Coverage-floor assertion in `tests/determinism-100-run.test.ts` catches the silent-skip failure mode where a future cycle's harness regression bypasses fixtures without raising any per-fixture exception.

---

## 5. Phase 3 Banked Principles Inventory

~51 principles surfaced across Phase 3's eight cycles (entry packet initial review + final ratification + Step 3 / Step 3 Pass 2b / Step 4 / Step 5 / Step 5 Pass 2b / Step 6 / retroactive corrective + Step 9 architectural-gap). All folded into [`arc/AUTHORING_DISCIPLINE.md`](../../arc/AUTHORING_DISCIPLINE.md) at Step 9.5 doc-pass under the "Phase 3 Banked Principles" section.

Cycle attribution:

- **Phase 3 entry initial review (2026-05-07):** 8 principles (entry-packet authoring discipline; corpus-before-code/step-N-bind cleavage criteria; cycle-accounting bucket framing — entry-cycle vs mid-phase vs corrective-sub-cycle)
- **Phase 3 entry final ratification (2026-05-08):** 3 principles (Q-3-A step-granularity ratification; Q-3-E corpus-before-code 8/8 split; Q-3-F SME-domain placement of risk-estimate publication artifacts)
- **Step 3 architectural-gap (2026-05-08):** 2 principles (Q-3-Step3-A loadOntology API §5.5 sole authoritative placement; Q-3-Step3-B ADR-007 §11 placement)
- **Step 3 Pass 2b (2026-05-08):** 3 principles (path-fencing + single-committer protocol; behavioral-contract surface stricter than schema-contract surface; SME pre-handoff verification ritual — operationalization-pending state)
- **Step 4 architectural-gap (2026-05-08):** 8 principles (Q-3-Step4-A reason-code-reuse-bounded-by-semantic-state-alignment; verification ritual operationalized 8 categories; LossType vs reason-code distinction; spec-section-existence verification before citation; verification ritual production-dividend banking)
- **Step 5 architectural-gap (2026-05-08):** 6 principles (Q-3-Step5-A ADR-013 visited-ancestor pattern; Q-3-Step5-B six cycle-prone predicate classes; Q-3-Step5-C closure_truncated bundling; verification ritual production-dividend on routing artifact spec §3.4.4 reference; ADR numbering parallel-registry surfaced; Phase 4-7 SLG migration escape clause)
- **Step 5 Pass 2b (2026-05-08):** 2 principles (architect ratification → operationalization → first production deliverable cadence; substantive-scope-weighting cycle-accounting refinement)
- **Step 6 architectural-gap (2026-05-09):** 10 principles (Q-3-Step6-A three-state ConsistencyResult; Q-3-Step6-B reason-code reuse for `inconsistent`; vocabulary alignment with EvaluationResult.result; FOLFalse-in-head inconsistency proof outcome ordering per spec §8.5.2; per-class Skolem-witness satisfiability forward-track precedent; ADR-013-style forward-track precedent)
- **Retroactive corrective ritual (2026-05-09):** 3 principles (retroactive-ritual-pattern banking; FOL @type discriminator vs OWL-axiom-shape @type discriminator distinction; Pass 2a authoring three-instance error pattern triggers retroactive ritual)
- **Step 9 architectural-gap (2026-05-10) + Q-Frank-Step9-A corrective overlay (same day):** **2 preserved + 7 new + 1 meta-banking, MINUS 3 withdrawn = net 7 principles** (preserved: spec-literal framing rulings on exit-blocking findings; simple disjointness Horn-checkability. NEW from Q-Frank-Step9-A corrective ruling: demos do not claim what the implementation cannot demonstrate (Ask 1); honest-admission framing for spec-non-compliance applies to internal exit-summary artifacts, not consumer-facing demos (Ask 1 distinction); count divergences at exit boundaries require architect ruling on which is correct, not forward-track (Ask 2); stakeholder-flagged demo gaps spanning multiple phase cycles get explicit phase-deliverable commitments (Ask 4); disciplines invented in response to specific findings do not get banked as architectural-commitment-tier methodology in the same cycle (Ask 5); disciplines without exclusion criteria are schedule-protection mechanisms, refused as banked principles (Ask 5 second); deferred-closure-path framing accumulating across phases warrants consolidated roadmap artifact (Ask 6). META-BANKING: Frank's letter as canonical exemplar of post-hoc-discipline-canonization risk pattern + architect issues banking corrections when stakeholder critique surfaces concerns that hold on the merits. WITHDRAWN: disposition-split discipline (was BP 3); Frame I ruling does not extend to count semantics (was BP 4); exit packet bucket inherits via disposition-split discipline (was BP 5).)

The principles fold into AUTHORING_DISCIPLINE.md under named subsections at Step 9.5; this exit summary references the inventory rather than re-stating each principle. Future phases' banked principles append in the same section.

---

## 6. Forward-Tracks

### To Phase 4 entry (post-Q-Frank-Step9-A inheritance)

| Forward-track | Source |
|---|---|
| `cycle_equivalent_classes` Class-3 fixture re-binding | Q-3-Step5-B forward-track (Class 3 cycle-prone predicate forward-tracked beyond Step 5 minimum) |
| `nc_bfo_continuant_occurrent.fixture.js` Phase-4-deferred fixture | Per ROADMAP §3.4 Phase 3 No-Collapse Adversarial Corpus + Phase 3 entry packet ratification (BFO ARC content gate) |
| `nc_sdc_gdc.fixture.js` Phase-4-deferred fixture | Per ROADMAP §3.4 Phase 3 No-Collapse Adversarial Corpus (BFO ARC content OR Phase 7 OFI deontic gate) |
| Parallel-registry reconciliation (DECISIONS.md ADR-NN ↔ spec §13 ADR-NN numbering) | Step 5 architectural-gap micro-cycle side-finding 2026-05-08 (ADR-011 numbering collision: DECISIONS.md ADR-011 = audit-artifact @id; spec §13 ADR-011 = cycle-guard) |
| Substantive-scope-weighting methodology refinement | Step 5 + Step 6 + Step 9 cycle-accounting bankings (Phase 3 mid-phase counter closed at 5 reflects substantive-scope; methodology refinement question for Phase 4 entry packet now has full Phase 3 data: ~3 projected vs 5 actual) |
| At-risk-tag-conservatism observation | Phase 3 reactivation results §4 + §5 (2 of 2 at-risk canaries survived; methodology refinement question for Phase 4 entry packet's risk-estimate authoring) |
| LossType trigger-matcher subsystem cleanup (`arity_flattening`, `closure_truncated` refinements, `una_residue`, `coherence_violation`, `bnode_introduced`, `lexical_distinct_value_equal`) | Phase 2 exit + Phase 3 Step 8 closure_truncated landing per Q-3-Step5-C; remaining 5 LossTypes phase in across Phases 4-7 |
| Realization regularity-check upgrade (`regularityCheck(A, importClosure)`) | Phase 2 exit forward-track + ADR-007 §11 forward-compat clause + Phase 4 entry packet's BFO ARC import-closure machinery |
| **Case C — Lossy round-trip — as Phase 4 EXIT DELIVERABLE (not forward-track)** | **Q-Frank-Step9-A Ask 4 ruling 2026-05-10.** Three-cycle drift on Frank's stakeholder-flagged Case C is sufficient evidence to require explicit phase-deliverable commitment. Phase 4 entry packet's deliverable list names Case C (Annotated Approximation OWL output + Loss Signature ledger + Recovery Payload artifacts) as a Phase 4 exit deliverable, not a forward-track. |
| **Phase 2 reactivation surface as Phase 4 demo opening** | Q-Frank-Step9-A Ask 7 SME election 2026-05-10. Phase 4 demo opens with the cumulative-discipline-credibility surface (3× survived against real `evaluate()` from Phase 2 reactivation results). |
| **Purpose-built Layer A consistency-check parity fixture question** | Q-Frank-Step9-A Ask 8 forward-track 2026-05-10 (with Case B pulled from Phase 3 demo, the question of whether a purpose-built fixture would surface different gaps becomes a Phase 4 entry-cycle deliberation) |
| **Banking-correction discipline retro analysis** | Q-Frank-Step9-A meta-banking 2026-05-10 (the architect's clean revision in response to stakeholder critique that holds on the merits — the fourth Phase 3 exit retro candidate with full Phase 3 data) |

**WITHDRAWN forward-tracks (per Q-Frank-Step9-A corrective ruling 2026-05-10):**

| ❌ Withdrawn | Reason |
|---|---|
| ~~`nc_horn_incomplete_disjunctive` count-semantics corpus-discriminator-scope question~~ | Resolved on the merits at Q-Frank-Step9-A Ask 2 (fixture amended `expectedUnverifiedAxiomsMinCount: 2 → 1`); does not forward-track. |
| ~~Disposition-split discipline as Phase-4-entry methodology candidate~~ | Withdrawn at Q-Frank-Step9-A Ask 5 (banked principle: disciplines invented in response to specific findings do not get banked as architectural-commitment-tier methodology in the same cycle). The discipline is not an inheritance for Phase 4. |

### To v0.2 — consolidated artifact at [`project/v0.2-roadmap.md`](../v0.2-roadmap.md)

Per Q-Frank-Step9-A Ask 6 ruling 2026-05-10: every "v0.X closes Y" commitment from Phases 1-3 is consolidated in [`project/v0.2-roadmap.md`](../v0.2-roadmap.md) with source phase / source gap / scope / owner / timeline. The exit packet's §6 To-v0.2 row references the roadmap rather than re-listing commitments inline, phasing out the soft "v0.2 ELK closes that" placeholder pattern Frank correctly flagged.

Headline v0.2 commitments visible at the consolidated roadmap:

- **Layer A consistency-affirmation gap** (the load-bearing entry; the gap Case B was pulled for) — v0.2 ELK closure absorbs the Horn-fragment classifier refinement (distinguishing Horn-expressible-but-not-exercised from non-Horn-expressible) alongside ELK's broader Horn-fragment expansion.
- ELK reasoner integration (closes the EL-profile gap on `nc_horn_incomplete_disjunctive` etc.) — spec §0.1 three-tier framing escape clause.
- SROIQ reasoner integration (closes the rest of the Horn-fragment-escape surface) — spec §0.1 three-tier framing v0.3+ escape clause.
- SLG tabling for SLD termination (replaces ADR-013 visited-ancestor cycle-guard) — ADR-013 Phase 4-7 SLG migration escape clause.
- Per-class Skolem-witness satisfiability checking refinement — Step 6 architectural-gap micro-cycle forward-track.
- OFI deontic ARC module (per ADR-008 deferral) — Phase 7 OR v0.2.
- Multi-consumer verification gate participation (post-v0.1-publish).

### v0.2 architectural candidates (banked for Phase 8 entry consideration)

Architect-banked at the Step 5 architectural-gap micro-cycle: parallel-registry reconciliation between DECISIONS.md ADR-NN and spec §13 ADR-NN numbering conventions. The collision surfaced at Step 5 (DECISIONS.md ADR-011 = audit-artifact @id; spec §13 ADR-011 = cycle-guard) was resolved by allocating ADR-013 (the new visited-ancestor pattern) in DECISIONS.md; the parallel-registry methodology question is forward-tracked to Phase 4 entry packet for systematic resolution.

---

## 7. Risk Retrospective

Items surfaced during Phase 3 implementation, with dispositions. Each item is captured for forward-track to Phase 4 / v0.2 as appropriate.

### Item 1 — Pass 2a OWL @type discriminator errors (Pass 2a CI catches)

The SME-authored `nc_horn_incomplete_existential.fixture.js` and `nc_silent_pass_canary.fixture.js` initially used `@type: "ObjectSomeValuesFrom"` instead of the canonical `@type: "Restriction"` discriminator; `properties: [...]` instead of `first/second` for `InverseObjectProperties`. Caught at Pass 2a CI by the Developer.

Disposition: **resolved at Pass 2a fix cycle 2026-05-08.** Both fixtures inline-amended; SME pre-handoff verification ritual operationalization moved from "operationalization-pending" to "binding from Step 4 forward."

Banked principle: **SME pre-handoff verification ritual for FOL-input fixtures + OWL-axiom-shape fixtures** — cross-reference `src/kernel/owl-types.ts` for canonical `@type` discriminator names per OWL construct before authoring; smoke-test the fixture against the lifter before handing to Developer; ABox `ObjectPropertyAssertion` uses `source` + `target` (NOT `subject` + `object`); RBox `InverseObjectProperties` uses `first` + `second` (NOT `properties`). Asymmetric field-name conventions across structurally-similar types are a known SME typo-vector — same pattern as Phase 2 Item 3 (FOL `body` vs `inner`).

### Item 2 — Step 4 cwa_open_predicate naf_residue reason-code error (verification ritual catch)

The `cwa_open_predicate.fixture.js` initially asserted `reason: 'naf_residue'`, but `naf_residue` exists only as a LossSignature `lossType` per ADR-011 — not in the API §7 frozen reason enum.

Disposition: **resolved at Q-3-Step4-A ratification 2026-05-08.** Reason code reused: `naf_residue` → `open_world_undetermined` (existing reason code semantically aligned with default-OWA negation context). Verification ritual operationalized binding from Step 4 forward.

Banked principle: **reason-code reuse is bounded by semantic-state alignment** — when a fixture's expected reason code does not exist in the frozen enum, the corrective action is reuse-with-alignment-verification, NOT enum extension. Enum extension requires architect ratification per the API surface freeze contract.

### Item 3 — Step 4 ritual run also caught two collateral errors (production dividend)

The Step 4 verification ritual run caught two additional errors in the architectural-gap routing artifact:
1. `closure_truncated` cited as a reason code (it's a LossType, not a reason code).
2. API §6.3 cited as the closedPredicates location (§6.3 is `roundTripCheck`; closedPredicates is at API §2 + §7.1).

Disposition: **both resolved at Q-3-Step4-A ratification 2026-05-08.** First production dividend of the operationalized verification ritual.

Banked principle: **the verification ritual catches errors in routing artifacts the SME authors as well as in fixtures** — citation-check is a category-1 verification step regardless of the artifact under authoring.

### Item 4 — Step 5 spec §3.4.4 reference error (verification ritual production catch)

The Step 5 architectural-gap routing artifact cited spec §3.4.4 (which does not exist; only §3.4.1 exists). Caught by SME ritual run on the routing artifact during pre-handoff.

Disposition: **resolved at Q-3-Step5-A ratification 2026-05-08.** First production dividend of the verification ritual on a routing artifact (vs Item 3's dividend on the architectural-gap routing artifact's claim language).

Banked principle: **spec-section-existence verification before citation** — the ritual's category 1 (citation verification) catches non-existent section references in artifacts the SME authors. This category pays dividends across all artifact types (routing artifacts, fixtures, exit packets).

### Item 5 — Step 5 ADR-011 numbering collision (parallel-registry surfaced)

DECISIONS.md ADR-011 (audit-artifact @id; ratified at Phase 2 Step 4a) collided in number with spec §13 ADR-011 (cycle-guard, originally drafted as a placeholder). The Step 5 architectural-gap micro-cycle's new visited-ancestor pattern needed an ADR slot.

Disposition: **resolved at Q-3-Step5-A Option (i) ratification 2026-05-08.** Allocated ADR-013 in DECISIONS.md for the new visited-ancestor pattern; spec §13 ADR-011 entry annotated with cross-reference to DECISIONS.md ADR-013 (preserving spec §13's original placeholder while routing the new pattern through DECISIONS.md). Parallel-registry reconciliation forward-tracked to Phase 4 entry packet.

Banked principle: **parallel registries (DECISIONS.md ADR-NN vs spec §13 ADR-NN) require systematic numbering reconciliation; ad-hoc resolution at collision time defers but does not solve the systemic issue.** Forward-track to Phase 4 entry packet authoring for systematic methodology.

### Item 6 — Step 6 nc_self_complement horn_inconsistency_proven reason-code error

The `nc_self_complement.fixture.js` initially asserted `reason: 'horn_inconsistency_proven'`, but this reason code does not exist in the API §7 frozen enum.

Disposition: **resolved at Q-3-Step6-B ratification 2026-05-09.** Reason code reused: `horn_inconsistency_proven` → `inconsistent` per the same Q-3-Step4-A precedent (reason-code reuse bounded by semantic-state alignment).

Banked principle: **the Q-3-Step4-A reason-code-reuse-bounded-by-semantic-state-alignment principle generalizes to Step 6** — second instance of the SME-side error pattern (Pass 2a OWL @types + Step 4 reason code + Step 6 reason code = three-instance pattern). Three-instance threshold triggers retroactive ritual scoping at Step 6 close.

### Item 7 — Step 6 ConsistencyResult shape (boolean → three-state)

The original API §8.1 ConsistencyResult shape used `consistent: boolean`; this conflicts with the No-Collapse Guarantee's three-outcome surface (true / false / undetermined per spec §8.5.2).

Disposition: **resolved at Q-3-Step6-A option (α) editorial correction 2026-05-09.** ConsistencyResult shape changed: `consistent: boolean` → `result: 'true' | 'false' | 'undetermined'`. Vocabulary aligned with EvaluationResult.result per API §7.1.

Banked principle: **vocabulary alignment across adjacent API surfaces (EvaluationResult.result vs ConsistencyResult.consistent) is a load-bearing surface; misalignment surfaces at composition time, not at isolated authoring time.** Editorial correction at the Step 6 architectural-gap micro-cycle preserves the v0.1.7 contract surface.

### Item 8 — Retroactive ritual: 4 hypothetical fixtures FOL @type errors (first batch dividend)

The retroactive verification ritual scope (triggered by the three-instance pattern: Pass 2a OWL @types + Step 4 reason code + Step 6 reason code) surfaced Cat 3 errors in 4 hypothetical fixtures from Pass 2a authoring:
- `hypothetical_clean.axiomSet`: `fol:ClassAssertionAxiom` → `fol:Atom`
- `hypothetical_inconsistency.axiomSet`: `fol:DisjointClassesAxiom` → `fol:Universal + Implication + Conjunction + False`
- `hypothetical_non_persistence.axiomSet`: `fol:DisjointClassesAxiom` → same as above
- `hypothetical_horn_incompleteness.axiomSet`: `fol:SubClassOfAxiom + fol:ObjectUnionOf` → `fol:Universal + Implication + Disjunction`

Disposition: **resolved at retroactive corrective ratification 2026-05-09.** All 4 fixtures rewritten to canonical FOL types per `src/kernel/evaluate-types.ts` + `src/kernel/fol-to-prolog.ts`. First production batch dividend of the retroactive ritual.

Banked principle: **retroactive ritual scoping at three-instance error pattern threshold** — when the same SME-side error pattern surfaces three times, the corrective scope is retroactive (covering existing artifacts) rather than purely prospective (preventing future artifacts). Three-instance threshold balances false-positive cost (excessive re-verification) against false-negative cost (missed errors persist into shipped artifacts).

### Item 9 — Mid-phase cycle count (cadence)

Phase 3 closed with **5 mid-phase architectural-gap cycles** (Steps 3 + 4 + 5 + 6 + 9) plus 1 retroactive corrective sub-cycle. Counter at 5 exceeds the entry-packet projection (~3) by 2; the Step 9 architectural-gap cycle was the canonical exit-blocking-finding instance, surfacing post-amendment-3 deploy via Aaron's stakeholder-feedback live-deploy smoke-check (distinguishing it from the prior in-Step micro-cycles which surfaced during their respective Step framings).

Disposition: **architect cadence-banking 2026-05-08 + 2026-05-10 → expected per substantive-scope-weighting.** Phase 3 ships validator + checkConsistency + No-Collapse Guarantee + cycle detection + closed predicates + step caps + hypothetical-axiom case + reason enum extension — substantively richer than Phase 2's projector scope. Higher mid-phase cycle counts at Phase 3 reflect the substantive scope, NOT cycle-density growth in the concerning sense.

Banked principle: **substantive-scope-weighting cycle-accounting refinement** — cycle counts at different phases must be normalized against substantive-scope weightings before comparison. Methodology refinement question forward-tracked to Phase 4 entry packet authoring with full Phase 3 data: (i) was the under-projection systematic across phase types or specific to Phase 3's evaluator+consistency+cycle-detection scope, (ii) what refinement to substantive-scope-weighting methodology applies at Phase 4+ entry, (iii) does the retroactive ritual's phase-boundary discipline tool generalize to absorbing some of the cycle pressure that would otherwise surface as mid-phase escalations?

### Item 10 — At-risk-tag-conservatism observation (Phase 3 reactivation results §4 + §5)

Per `phase-3-reactivation-results.md` §4 + §5: 2 of 2 at-risk-horn-fragment-closure tagged canaries (parity_canary_negative_query + parity_canary_visual_equivalence_trap) survived after Step 1 pre-emptive review. The at-risk tags were conservative (preserved discipline integrity) but did not manifest as actual divergence.

Disposition: **observed; methodology refinement forward-tracked to Phase 4 entry packet.** Not a discipline failure; the conservative tagging preserved the integrity of the Q-Frank-4 publication contract.

Banked principle: **methodology refinements surface at phase exit retros with complete phase data, not mid-phase.** Conservative tagging at risk-estimate authoring time is acceptable when it preserves discipline integrity, even when it doesn't manifest as actual divergence; refinement-question routing waits for full phase data.

### Item 11 — Q-3-Step9-A exit-blocking architectural finding (with Q-Frank-Step9-A corrective overlay 2026-05-10)

The 9.4-amendment-3 probe fix (commit 7216cd4) restored a clean console on the deployed demo. With the bundle now actually executing `checkConsistency()` in the browser, three substantive divergences from fixture contracts surfaced — Aaron's stakeholder-feedback smoke-check 2026-05-09:

- `nc_self_complement` (load-bearing): live `'undetermined'` / `coherence_indeterminate` where fixture's `discriminatesAgainst` field explicitly rules out that outcome
- `nc_horn_incomplete_disjunctive`: live `unverifiedAxioms` count = 1; fixture required count ≥ 2
- `p1_bfo_clif_classical` Layer A consistency-check parity (then-existing Phase 3 demo Case B): live `'undetermined'` / `coherence_indeterminate` where spec §8.5.1 Horn-checkable fragment requires `'true'`

**Disposition (revised at Q-Frank-Step9-A corrective ruling 2026-05-10):**

The original Q-3-Step9-A architect ruling 2026-05-10 ratified Frame I + D2 disposition with three structural refinements + 5 banked principles. **Same-day, Frank's stakeholder critique** ([`demo/Phase3DemoCritique.md`](../../demo/Phase3DemoCritique.md)) flagged: (a) the Layer A "documented v0.1 spec-divergence" framing was procedural language papering over a real gap; (b) the disposition-split discipline was banked the same day it was invented and used to absorb its founding case (post-hoc rationalization); (c) the count-divergence forward-tracking shipped mutually inconsistent fixtures and code. **The architect issued a Q-Frank-Step9-A corrective ruling same day** with 3 banking withdrawals + 7 new bankings + 1 meta-banking + 4 Asks executed in the corrective commit.

**Component dispositions (post-corrective):**

- **`nc_self_complement` (bounded)**: Step 9.4-amendment-4 commit 7526973 (CI green) closed via Developer hypothesis investigation per Refinement 1. Disposition unchanged.
- **Layer A affirmation gap**: **REVISED at Q-Frank-Step9-A Ask 1.** Original disposition was "documented v0.1 spec-divergence per Refinement 2" — soft-language framing in a consumer-facing artifact. Corrective ruling: **Case B pulled from `demo_p3.html` entirely** per banked principle "demos do not claim what the implementation cannot demonstrate." Layer A closure path forward-tracked via consolidated [`project/v0.2-roadmap.md`](../v0.2-roadmap.md), not via soft demo framing. Honest-admission framing applies to internal exit-summary artifacts (this packet) but NOT to consumer-facing demo artifacts.
- **Count divergence**: **REVISED at Q-Frank-Step9-A Ask 2.** Original disposition was "forward-track to Phase 4 entry-cycle as corpus-discriminator-scope question" — shipped mutually inconsistent fixtures and code. Corrective ruling: **resolved on the merits at Phase 3 close**. The implementation is correct (only the disjunctive-consequent SubClassOf is non-Horn; the disjointness is Horn-expressible per spec §8.5.1). Fixture amended `expectedUnverifiedAxiomsMinCount: 2 → 1` with audit-trail header (a/b/c/d) per the AUTHORING_DISCIPLINE four-contract consistency check.

**Banked principles (post-corrective):**

The original 5 bankings revised: 3 withdrawn, 2 preserved on their own merits (Frame I ruling spec-literal framing; simple disjointness Horn-checkability). The Q-Frank-Step9-A corrective ruling adds 7 new bankings + 1 meta-banking — see Section 5 of this exit packet for the full inventory + AUTHORING_DISCIPLINE.md "Phase 3 Banked Principles" Step 9 architectural-gap subsection (with corrective overlay).

**Withdrawn forward-tracks:**

- ~~`nc_horn_incomplete_disjunctive` count-semantics corpus-discriminator-scope question~~ (resolved at Ask 2)
- ~~Disposition-split discipline as Phase-4-entry methodology candidate~~ (withdrawn at Ask 5)

**This finding is the canonical example of:** (a) the exit-blocking-finding pattern (the original surfacing); (b) the post-hoc-discipline-canonization risk pattern (Frank's letter banked as exemplar); (c) the architect's banking-correction discipline (clean revision in response to stakeholder critique that holds on the merits — the meta-banking from Q-Frank-Step9-A). All three patterns fold into Phase 3 exit retro forward-track candidates.

### Item 12 — Q-Frank-Step9-A stakeholder-routing corrective sub-cycle

Frank's stakeholder critique 2026-05-10 ([`demo/Phase3DemoCritique.md`](../../demo/Phase3DemoCritique.md)) is the second Phase 3 stakeholder-routing cycle (Phase 2 had its own at Q-Frank-* 2026-05-07). Per banked principle, stakeholder-routing cycles after phase close are corrective sub-cycles in the exit-cycle bucket; they do NOT increment phase mid-phase counters.

**Disposition:** the architect issued banking corrections in response to Frank's critique because the concerns held on the merits. Three withdrawals + seven new bankings + one meta-banking — see Item 11's "Banked principles (post-corrective)" cross-reference + Section 5 inventory.

**Corrective commit scope (one bundled commit per audit-trail-unity-per-surface):**

1. `demo/demo_p3.html` — Case B section + JS handlers + Layer A parity render function removed; hypothetical-axiom sub-case relocated under Case A as A.7
2. `demo/p3-walkthrough.md` — §4 (Case B) section removed; framing revised to single-argument Case A; A.7 narration added; Q&A revised
3. `tests/corpus/nc_horn_incomplete_disjunctive.fixture.js` — `expectedUnverifiedAxiomsMinCount: 2 → 1` + audit-trail header (a/b/c/d) + manifest mirror update
4. `project/DECISIONS.md` — ADR-007 §10 status header revised to ACCEPTED with Q-Frank-2 boundary-statement refinement; promotion audit trail
5. `project/reviews/phase-3-step9-architectural-gap.md` — corrective overlay added documenting the 3 withdrawals + 7 new bankings + 1 meta-banking + 4 Asks
6. `project/reviews/phase-3-exit.md` (this packet) — §1 / §2 ledger / §3 / §4 / §5 / §6 / §7 Item 11 + new Item 12 revised
7. `project/reviews/phase-3-reactivation-results.md` — Layer A tag revised to reflect pulled-from-demo state; disposition-split discipline framing removed
8. `project/v0.2-roadmap.md` — NEW artifact authored consolidating every "v0.X closes Y" commitment from Phases 1-3
9. `arc/AUTHORING_DISCIPLINE.md` — Step 9 architectural-gap subsection revised (3 withdrawn + 7 new + 1 meta-banking)
10. `project/ROADMAP.md` — Phase 3 close grounding revised (Layer A pulled from demo; disposition-split forward-track withdrawn; count divergence resolved)

**Banked principle from this cycle (the meta-banking):** the architect issues banking corrections (withdrawals and new bankings) when stakeholder critique surfaces concerns that hold on the merits. The architectural-commitment surface is preserved by clean revision when prior rulings were structurally incorrect, not by procedural defense of prior rulings. Frank's letter banked as canonical exemplar of the post-hoc-discipline-canonization risk pattern; future cycles facing pressure to bank disciplines invented in response to specific findings reference Frank's letter as the cautionary lens.

---

## 8. Phase 3 Close Certification

I, in the SME / Logic Tester role, certify that:

1. **All Phase 3 entry-criteria from the architect-ratified Phase 3 entry packet (per [`project/reviews/phase-3-entry.md`](./phase-3-entry.md)) are satisfied:**
   - `evaluate()` per API §7.1 + `EvaluableQuery` restriction per §7.5 ✅
   - Three-state result per API §7.2; full reason enum producing correct codes (17 + `no_strategy_applies`) ✅
   - Step caps per API §7.2 + §7.4: per-query default 10K + optional aggregate session cap + configurable throw-on-cap ✅
   - `UnsupportedConstructError` thrown for FOLAxiom variants outside `EvaluableQuery` subset with `suggestion` field populated ✅
   - `checkConsistency()` per API §8.1 with No-Collapse Guarantee per spec §8.5 (three-state ConsistencyResult; FOLFalse-in-head inconsistency proof; honest-admission of Horn-fragment-escape) ✅
   - `unverifiedAxioms` populated per API §8.1.1 when reason === `coherence_indeterminate` ✅
   - Hypothetical-axiom case per API §8.1.2 (`axiomSet` participates without persistence; non-persistence guarantee verified) ✅
   - Cycle detection per spec §5.4 + ADR-013 visited-ancestor pattern (six cycle-prone predicate classes); `cycle_detected` reason code; optional throw ✅
   - Per-predicate CWA per spec §6.3.2 + API §6.3 — `closedPredicates` parameter operational ✅
   - Structural annotation declaration consistency per API §2.1.1 — `structural_annotation_mismatch` thrown on detection ✅
   - ARC manifest version mismatch per API §2.1.2 — `arc_manifest_version_mismatch` thrown when session and conversion versions diverge ✅
   - Session-aggregate step cap per API §2.1 — `SessionStepCapExceededError` thrown when `maxAggregateSteps` exceeded ✅
   - Phase 3 corpus complete: 16 of 16 architect-ratified Phase 3 fixtures (4 No-Collapse adversarial + 4 hypothetical-axiom + 2 cycle + 2 closed-predicate + 2 step-cap + 2 session-error) ✅
   - 100-run determinism contract per API §6.1.1 extended for Phase 3 fixtures (43-fixture coverage; smoke check at RUNS=3 confirmed dispatcher coverage) ✅
   - Risk retrospective recorded (Section 7 above) ✅
   - Per-canary publication artifact per Q-Frank-4 (`phase-3-reactivation-results.md`) ✅

2. **One new ADR landed during Phase 3 is Accepted:**
   - ADR-013 (visited-ancestor cycle-guard pattern; ratified Step 5 architectural-gap micro-cycle 2026-05-08; six cycle-prone predicate classes; spec §0.1 three-tier framing alignment + Phase 4-7 SLG migration escape clause)

3. **One reason-code addition landed during Phase 3 is Accepted:**
   - `no_strategy_applies` per Q-3-C ratification 2026-05-08 (closes Phase 2 Item 8 forward-track from `strategy_routing_no_match`)

4. **One ADR extension landed during Phase 3:**
   - ADR-007 §11 (FOL→Tau Prolog clause translation rules per-variant table; ratified at Step 3 architectural-gap micro-cycle 2026-05-08)

5. **No open architectural commitments remain** unaddressed. All architect rulings from Phase 3's eight cycles (including the Q-3-Step9-A exit-blocking finding ratification 2026-05-10) are folded into committed artifacts (entry packet, ADR-013, ADR-007 §11, AUTHORING_DISCIPLINE.md, all five Step architectural-gap routing artifacts, retroactive corrective routing artifact, this exit summary, ROADMAP).

6. **The four-contract consistency check** (intent ↔ expectedOutcome.summary ↔ expected_v0.1_verdict ↔ phaseNReactivation where present) holds across all 16 Phase 3 fixtures at `verifiedStatus: Verified` (8 promoted at Step 9.3) + 1 forward-tracked Draft (`cycle_equivalent_classes`) + 2 BFO-gated future fixtures deferred to Phase 4. **One documented v0.1 spec-divergence** per Q-3-Step9-A Refinement 2: Phase 1 fixture `p1_bfo_clif_classical` Layer A consistency-check parity returns `'undetermined'` where spec §8.5.1 Horn-checkable fragment requires `'true'`; documented honestly per Phase 2 Step 9.1 framing precedent; v0.2 ELK closure path.

7. **Forward-tracks are recorded** for Phase 4 entry (10 items: 8 prior + Layer A affirmation gap + count-divergence corpus-discriminator question per Q-3-Step9-A Refinements 2 + 3) and v0.2 (Section 6 above; Layer A affirmation gap absorbs into ELK Horn-fragment classifier refinement).

8. **~51 verbally-banked principles formalized** into AUTHORING_DISCIPLINE.md at Step 9.5 doc-pass under the "Phase 3 Banked Principles" section (~46 from prior cycles + 5 new from Q-3-Step9-A Step 9 architectural-gap subsection). The verbatim-transcription discipline preserved per the architect-banked principle from Phase 2 exit.

9. **Phase 4 entry conditions surfaced** in this document (Section 6 "To Phase 4 entry") for Phase 4 entry's ratification work; Phase 3 exit does NOT pre-empt Phase 4 entry.

10. **Per-canary publication artifact extension** (per Q-Frank-4 commitment + Q-3-Step9-A disposition): `phase-3-reactivation-results.md` extends to cover the No-Collapse adversarial corpus (4 fixtures) + the Layer A consistency-check parity case + the count-divergence case. Tags: `survived-post-fix` (`nc_self_complement` post-amendment-4), `survived` (`nc_silent_pass_canary`, `hypothetical_clean`), `survived-with-count-divergence-forward-tracked-to-phase-4-entry` (`nc_horn_incomplete_disjunctive`), `failed-revealed-implementation-gap-forward-tracked` (`p1_bfo_clif_classical` Layer A consistency-check parity).

---

## 9. Phase 3 Closes

Phase 3 implementation is complete. Rings 1 + 2 + 3 all pass green on built-in OWL content (the engineered No-Collapse adversarial corpus + hypothetical-axiom non-persistence). The validator pipeline is operational; the No-Collapse Guarantee surface holds across the canonical adversarial corpus (Horn-decidable inconsistency caught at Step 9.4-amendment-4 closure; non-Horn-fragment-escape honestly admitted; silent-pass catchall asserted as MUST-NOT-be-true). The hypothetical-axiom non-persistence guarantee per API §8.1.2 is verified by the two-call protocol fixture.

The Phase 3 demo (`demo/demo_p3.html`) ships single-argument structure — No-Collapse adversarial canary discipline + hypothetical-axiom non-persistence sub-case — claiming what the implementation establishes and not claiming what it cannot demonstrate. The Layer A consistency-affirmation gap is a v0.1 implementation gap; the closure path is the consolidated [`project/v0.2-roadmap.md`](../v0.2-roadmap.md). Phase 4's demo will re-introduce Layer A/B parity at the consistency-rejection direction (BFO Disjointness Map firing `consistent: 'false'`); the consistency-affirmation direction waits on v0.2 ELK.

Phase 4 inherits the BFO 2020 ARC content authoring obligation per the parallel workstream commitment, alongside the refined forward-track inheritance per Q-Frank-Step9-A: Case C as Phase 4 exit deliverable; Phase 2 reactivation surface as Phase 4 demo opening; purpose-built Layer A consistency-check parity fixture question; banking-correction discipline retro analysis. The disposition-split discipline is **NOT** inherited as methodology candidate — the Q-Frank-Step9-A corrective ruling withdrew that forward-track on the banked principle that disciplines invented in response to specific findings do not get banked as architectural-commitment-tier methodology in the same cycle.

The Q-3-Step9-A exit-blocking finding + Q-Frank-Step9-A corrective ruling together constitute the canonical Phase 3 exemplar of the architect's banking-correction discipline: the architectural-commitment surface is preserved by clean revision when prior rulings were structurally incorrect, not by procedural defense of prior rulings. Frank's letter is banked as the canonical articulation of the post-hoc-discipline-canonization risk pattern. The corpus-as-contract discipline is preserved (Frame I governed; corpus discriminators stand or are amended on the merits; the count divergence resolved via fixture amendment in this cycle). The spec/implementation alignment is preserved on the canonical adversarial case (`nc_self_complement` closed). The Layer A affirmation gap is named honestly in this internal exit summary with named v0.2 ELK closure path; the consumer-facing demo does not claim what the implementation cannot demonstrate.

— SME, 2026-05-10
