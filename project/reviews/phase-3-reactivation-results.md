# Phase 3 Parity-Canary Reactivation Results — Per-Canary Publication Artifact

**Date:** 2026-05-09 (Step 2 reactivation completed; SME publication-artifact authoring at Step 9.1 exit cadence — original §1-§6); 2026-05-10 (Q-3-Step9-A extension for No-Collapse adversarial corpus + Layer A consistency-check parity + hypothetical-axiom corpus per-canary tagging — §7 + §8); **2026-05-10 (same day, Q-Frank-Step9-A corrective overlay: Layer A tag revised to reflect pulled-from-demo state; disposition-split discipline framing removed; tag taxonomy extension scope-narrowed to case-specific reasoning rather than discipline-derived)**
**Cycle:** Phase 3 Step 9.1 exit cadence (per Q-Frank-4 architect ratification 2026-05-07) + Q-3-Step9-A disposition extension 2026-05-10 (architect ruling) + **Q-Frank-Step9-A corrective overlay 2026-05-10** (architect corrective ruling in response to Frank's stakeholder critique; disposition-split discipline withdrawn as banked principle; tag-taxonomy framing tightened to case-specific reasoning).
**Predecessors:**
- Phase 2 exit packet `project/reviews/phase-2-exit.md` §6 (per-canary publication forward-track to Phase 3 entry packet)
- Phase 3 entry packet `project/reviews/phase-3-entry.md` §3.6 (SME-authored risk estimates) + §7 Step 2 framing requirement (publication artifact as Step 2 deliverable, NOT Phase 3 exit deliverable rolled forward)
- Q-3-Step9-A architectural-gap routing artifact `project/reviews/phase-3-step9-architectural-gap.md` (RATIFIED 2026-05-10) — Frame I + D2 + 3 structural refinements + 5 banked principles; the disposition that drives §7 + §8 below

---

## 1. Publication-artifact contract

Per Q-Frank-4 architect ratification 2026-05-07: every Phase 2 stub-evaluated parity canary is re-exercised against the real `evaluate()` at Phase 3 Step 2 (the re-exercise gate). The per-canary outcome publishes per-canary, not aggregated. Schema per §3.6 of the Phase 3 entry packet:

| Outcome label | Meaning |
|---|---|
| `survived` | Real `evaluate()` produced the same outcome the stub-evaluator harness recorded; the canary's stub-validated assertion holds under richer semantics. |
| `failed-revealed-stub-limit` | Real `evaluate()` produced a different outcome from the stub; the stub-bounded validation missed an entailment the real evaluator surfaces. Fixture amendment routed at Step 2 reactivation cycle. |
| `not-yet-reactivated` | Reactivation deferred past Phase 3 (e.g., requires non-Horn evaluator); fixture stays at stub-validated status. Phase 3 exit retro forward-tracks. |

Per architect Q-3-F ratification: cross-reference each canary's `phase3Reactivation` field in the manifest + the §3.6 risk-estimate tag.

---

## 2. Per-canary results

Phase 3 Step 2 closed 2026-05-09 with all three Phase 2 stub-validated parity canaries re-exercised against real `evaluate()`. **All three survived.** The publication artifact records the per-canary outcome alongside the SME-authored risk-estimate tag from Phase 3 entry packet §3.6 + the canary's manifest `phase3Reactivation` field's expected-real-evaluate-result.

| Canary | §3.6 risk-estimate tag (pre-Step-1) | Step 1 pre-emptive review outcome | Step 2 reactivation outcome | Disposition |
|---|---|---|---|---|
| `parity_canary_query_preservation` | **expected-to-survive** | (no review required; tagged expected-to-survive) | ✅ **survived** | Real `evaluate()` returned `'true'` for the discriminating query `Person(alice)?` matching the stub's backward-chain trace through Mother → Female → Person SubClassOf chain. Risk-estimate verdict held. |
| `parity_canary_negative_query` | **at-risk-horn-fragment-closure** | Per Q-3-B Step 1 deliverable: SME pre-emptive review confirmed the discriminating query under closedPredicates-empty default-OWA semantics maps cleanly to `'undetermined'` with `open_world_undetermined` reason (per Q-3-Step4-A canonical reason code); banked into §3.6 as "expected-to-survive after pre-emptive review" | ✅ **survived** | Real `evaluate()` returned `'undetermined'` with reason `open_world_undetermined` for the discriminating negative-query against the open predicate, matching the pre-emptively-reviewed assertion. The at-risk-horn-fragment-closure tag was conservative; the canary's structural shape (no closedPredicates; default OWA) aligned with the canonical reason-code semantic post-Q-3-Step4-A correction. Risk-estimate at-risk tag did NOT manifest as actual divergence. |
| `parity_canary_visual_equivalence_trap` | **at-risk-horn-fragment-closure** | Per Q-3-B Step 1 deliverable: SME pre-emptive review confirmed the cross-section defense pair's discriminating query distinguishes the two semantically-shifted shapes via the lifted-FOL atom-shape signature (not requiring richer semantics than the stub provided); banked into §3.6 as "expected-to-survive after pre-emptive review" | ✅ **survived** | Real `evaluate()` returned the pre-emptively-reviewed expected outcome for the cross-section visual-equivalence-trap discriminating query. The at-risk tag was conservative; the canary's stub-validated assertion held under richer semantics because the discriminator structure was bounded-Horn-decidable. |

---

## 3. Aggregate summary

- **3 canaries re-exercised, 3 survived.** Zero `failed-revealed-stub-limit` outcomes; zero `not-yet-reactivated` deferrals.
- Per-canary publication validates the Phase 2 stub-evaluator harness's structural-shape contract for all three canaries against richer Phase 3 semantics.
- The two at-risk-horn-fragment-closure tags (per §3.6 SME risk estimates) did NOT manifest as actual divergence; both at-risk canaries survived after Step 1 pre-emptive review confirmed structural alignment.

---

## 4. Methodology observations (forward-tracked to Phase 3 exit retro)

The publication artifact's at-risk-tag-conservatism observation is a Phase 3 exit retro candidate alongside the methodology refinements already banked at Step 5 + Step 6 cycles:

> **At-risk-horn-fragment-closure tags applied at Phase 3 entry packet §3.6 may be over-cautious for canaries whose structural shape is bounded-Horn-decidable post-architect-corrections.** Phase 3 retro examines whether the at-risk tagging methodology should refine: (a) tighter risk-tag criteria distinguishing structural-shape-bounded-Horn from semantic-content-bounded-Horn; (b) Step 1 pre-emptive review's "expected-to-survive after pre-emptive review" sub-tag becomes a recognized risk-estimate transition state; (c) banking the at-risk-tag-conservatism observation as a known-good outcome (over-caution preserves discipline integrity even when it doesn't manifest as actual divergence).

Forward-tracks to Phase 3 exit retro alongside:
- Parallel-registry reconciliation (per Step 5 side-finding)
- Substantive-scope-weighting methodology refinement (per Step 5/6 cycle-accounting bankings)
- Retroactive-ritual-pattern banking (per retroactive corrective cycle)
- Other Phase 3 exit retro candidates per `phase-3-exit.md` deferred-with-structural-requirements bucket

---

## 5. Banking from this publication artifact

The per-canary publication operationalizes Q-Frank-4's commitment per architect ratification 2026-05-07:

> **The Q-Frank-4 publication commitment delivered as designed.** Three canaries' outcomes published per-canary (not aggregated) with cross-reference to risk-estimate tags + manifest `phase3Reactivation` fields. Discipline-tightening pattern (banked at Pass 2b 2026-05-09) confirms: ratification → operationalization → first production deliverable → publication validates the discipline at production cadence.

> **At-risk-horn-fragment-closure tag conservatism observed: 2 of 2 at-risk canaries survived.** Not a discipline failure; the conservative tagging preserved the integrity of the publication contract. Methodology refinement question routes to Phase 3 exit retro per the architect-banked principle "Methodology refinements surface at phase exit retros with complete phase data, not mid-phase."

---

## 6. Cross-references

- Architect Q-Frank-4 ruling 2026-05-07 (per-canary publication commitment)
- Architect Q-3-A ruling 2026-05-08 (Step 2 framing requirement: publication artifact as Step 2 deliverable)
- Architect Q-3-B ruling 2026-05-08 (Step 1 pre-emptive review on at-risk canaries; three-way disposition ladder)
- Architect Q-3-F ruling 2026-05-08 (§3.6 schema canonical; this artifact's path SME-domain placement)
- Phase 3 entry packet §3.6 (SME-authored risk estimates)
- Phase 3 entry packet §7 Step 2 framing
- `tests/corpus/parity_canary_query_preservation.fixture.js` `phase3Reactivation` field
- `tests/corpus/parity_canary_negative_query.fixture.js` `phase3Reactivation` field
- `tests/corpus/parity_canary_visual_equivalence_trap.fixture.js` `phase3Reactivation` field
- Phase 3 exit retro forward-track: at-risk-tag-conservatism methodology refinement candidate

---

**Per-canary publication artifact (initial §1-§6) complete. Q-Frank-4 commitment delivered for the Phase 2 stub-evaluated parity canary set. Phase 3 Step 9.1 exit cadence sub-step closes at this artifact's commit.**

— SME, 2026-05-09

---

## 7. No-Collapse adversarial corpus + Layer A consistency-check parity per-canary tagging (with Q-Frank-Step9-A corrective overlay 2026-05-10)

The original §1 outcome taxonomy was specific to Phase 2 stub-evaluated parity canaries. Phase 3's exit cadence extends per-canary publication to the No-Collapse adversarial corpus + the Phase 1 Layer A fixture (originally re-exercised at the now-pulled Phase 3 demo Case B). Tag taxonomy extension is scoped to case-specific reasoning per Q-Frank-Step9-A corrective ruling 2026-05-10 — the original framing as "tag taxonomy extension per the disposition-split discipline" was withdrawn because the disposition-split discipline itself was withdrawn as banked principle; the tags below operationalize the per-canary publication contract per Q-Frank-4 directly, without claiming methodology-tier status.

| Outcome label | Meaning |
|---|---|
| `survived-post-fix` | The fixture's expected outcome did NOT match real `checkConsistency()` at initial Phase 3 implementation; a bounded fix landed in a corrective sub-cycle (Step 9.4-amendment-N) closing the gap; the fixture now passes against the post-fix implementation. Used for `nc_self_complement` disposition. |
| `survived-with-X-resolved-on-merits` | The fixture's primary outcome assertions hold; a secondary assertion (e.g., a count discriminator) was resolved at architect ruling on the merits (typically by amending the fixture or the implementation). Used for `nc_horn_incomplete_disjunctive` count divergence per Q-Frank-Step9-A Ask 2 — fixture amended `expectedUnverifiedAxiomsMinCount: 2 → 1` because the implementation is correct on the merits. |
| `pulled-from-demo-with-v0.2-closure` | The fixture's expected outcome does NOT match real `checkConsistency()`; the v0.1 implementation gap is named honestly in the internal exit summary but the consumer-facing demo does NOT claim what the implementation cannot demonstrate (banked principle: demos pull cases that the implementation does not yet establish). v0.X closure path is named in the consolidated `project/v0.2-roadmap.md`. Used for `p1_bfo_clif_classical` Layer A consistency-check parity disposition per Q-Frank-Step9-A Ask 1. |

### 7.1 No-Collapse adversarial corpus (4 fixtures)

| Canary | Pre-fix verdict | Post-fix verdict (live deploy 2026-05-10) | Tag | Disposition |
|---|---|---|---|---|
| `nc_self_complement` | `'undetermined'` / `coherence_indeterminate` (Q-3-Step9-A finding evidence) | `'false'` / `inconsistent` per Step 9.4-amendment-4 commit 7526973 | **`survived-post-fix`** | Frame I ruling 2026-05-10 + Refinement 1 bounded fix (Developer hypothesis investigation per (a) iff-unfolding gap OR (b) FOLFalse-in-head detection scope; CI green). The fixture's `discriminatesAgainst` field stands as authoritative per corpus-as-contract discipline. |
| `nc_horn_incomplete_disjunctive` | Primary: `'undetermined'` / `coherence_indeterminate` ✓; Secondary: `unverifiedAxioms` count = 1 (original fixture: count ≥ 2) | Primary holds + count divergence resolved at Q-Frank-Step9-A Ask 2 by amending the fixture (`expectedUnverifiedAxiomsMinCount: 2 → 1`) | **`survived-with-count-resolved-on-merits`** | Q-Frank-Step9-A Ask 2 corrective ruling 2026-05-10: implementation is correct (only the disjunctive-consequent SubClassOf is non-Horn; the disjointness is Horn-expressible per spec §8.5.1); fixture over-specified; corrective action is fixture amendment. The earlier "forward-track to Phase 4 entry-cycle" framing was withdrawn at the corrective ruling per Frank's §4.1 critique (forward-tracking ships mutually inconsistent fixtures and code). |
| `nc_horn_incomplete_existential` | (not exercised in demo; test suite verdict) | Per test suite: `'undetermined'` / `coherence_indeterminate` matching expected | **`survived`** | Sibling to `nc_horn_incomplete_disjunctive`'s primary outcome; not exercised in the live demo (per per-phase disposability scope), but the test suite verifies it. Phase 4 entry-cycle re-examines whether the existential variant has analogous count-semantics surface to the disjunctive variant. |
| `nc_silent_pass_canary` | `'undetermined'` / `coherence_indeterminate` with 3 unverifiedAxioms (matches `MUST NOT be 'true'` + acceptable verdicts criteria) | Same | **`survived`** | The catchall MUST-NOT-be-true assertion holds; the v0.1 Horn-only path correctly admitted Horn-fragment-escape with populated `unverifiedAxioms` per spec §8.5.5. Acceptable verdict per fixture's `expectedConsistencyResultAcceptable: ["undetermined", "false"]`. |

### 7.2 Layer A consistency-check parity (Phase 1 fixture; Case B pulled from Phase 3 demo per Q-Frank-Step9-A Ask 1)

| Canary | Pre-fix verdict | Live verdict (unchanged) | Tag | Disposition |
|---|---|---|---|---|
| `p1_bfo_clif_classical` Layer A | `'undetermined'` / `coherence_indeterminate` with `unverifiedAxioms: [<BFO_0000002 ∧ BFO_0000003 → False>]` | Unchanged (the v0.1 implementation gap stands; closure path is v0.2 ELK refinement of Horn-fragment classifier) | **`pulled-from-demo-with-v0.2-closure`** | Q-Frank-Step9-A Ask 1 corrective ruling 2026-05-10: Case B was originally authored asserting the v0.1 actual `'undetermined'` verdict against a fixture that requires `'true'` per spec §8.5.1; the original "documented v0.1 spec-divergence" framing in the demo was procedural language papering over a real gap. The corrective ruling pulls Case B from the consumer-facing demo per banked principle "demos do not claim what the implementation cannot demonstrate." Honest-admission framing for spec-non-compliance applies to internal exit-summary artifacts (`phase-3-exit.md` §3 + §7 Item 11) but NOT to consumer-facing demo artifacts. The Layer A consistency-affirmation gap closure path is named in the consolidated [`project/v0.2-roadmap.md`](../v0.2-roadmap.md): v0.2 ELK closure absorbs the Horn-fragment classifier refinement (distinguishing Horn-expressible-but-not-exercised from non-Horn-expressible) alongside ELK's broader Horn-fragment expansion. The `p1_bfo_clif_classical` fixture itself stays at its existing Verified status for Phase 1 lift correctness + Phase 2 round-trip parity (those parity claims still hold); Phase 3 consistency-check parity is not claimed by the fixture nor by the demo. |

### 7.3 Hypothetical-axiom corpus (4 fixtures — per Phase 3 entry packet §3.4)

| Canary | Live verdict | Tag | Notes |
|---|---|---|---|
| `hypothetical_clean` | Call 1: `'true'` / `consistent`; Call 2: `'true'` / `consistent` (non-persistence verified) | **`survived`** | Phase 3 demo Case B.5 exercises this; all three assertions pass. The two-call non-persistence guarantee per API §8.1.2 holds. |
| `hypothetical_inconsistency` | (test suite) Call 1: `'false'` / `inconsistent`; Call 2: `'true'` / `consistent` (non-persistence verified) | **`survived`** | The hypothetical axiomSet introduces FOLFalse-in-head inconsistency; Step 7 detects it; Call 2 confirms the hypothetical did not persist. |
| `hypothetical_horn_incompleteness` | (test suite) Call 1: `'undetermined'` / `coherence_indeterminate` with populated `unverifiedAxioms` | **`survived`** | The hypothetical axiomSet introduces non-Horn machinery without inconsistency; the v0.1 Horn-only path correctly admits Horn-fragment-escape per spec §8.5.5. |
| `hypothetical_non_persistence` | (test suite) Two-call protocol against the same session; Call 2 sees the original session state, not the hypothetical extension | **`survived`** | The non-persistence guarantee per API §8.1.2 is verified by the discriminating two-call protocol. |

---

## 8. Aggregate summary (post-Q-Frank-Step9-A corrective overlay)

**Phase 2 stub-evaluated parity canaries (3):** all 3 `survived` (per §2-§3 above). At-risk-tag-conservatism observation forward-tracked to Phase 3 exit retro per §4.

**No-Collapse adversarial corpus (4):** 1 `survived-post-fix` (`nc_self_complement` per Step 9.4-amendment-4); 1 `survived-with-count-resolved-on-merits` (`nc_horn_incomplete_disjunctive` per Q-Frank-Step9-A Ask 2 fixture amendment); 2 `survived` (`nc_horn_incomplete_existential`, `nc_silent_pass_canary`).

**Layer A consistency-check parity (1):** 1 `pulled-from-demo-with-v0.2-closure` (`p1_bfo_clif_classical` Layer A — Case B pulled from `demo_p3.html` per Q-Frank-Step9-A Ask 1; v0.1 implementation gap with v0.2 ELK closure path per `project/v0.2-roadmap.md`).

**Hypothetical-axiom corpus (4):** 4 `survived` (clean, inconsistency, horn-incompleteness, non-persistence).

**Total at Phase 3 close: 12 canaries published per Q-Frank-4 commitment.** All 12 published; 11 survive (with 1 tagged `survived-post-fix` and 1 tagged `survived-with-count-resolved-on-merits`); 1 tagged `pulled-from-demo-with-v0.2-closure` (the Layer A case where the v0.1 implementation gap is named honestly in the internal exit summary but the consumer-facing demo does not claim what the implementation cannot demonstrate).

The honest-admission discipline holds across the publication contract; what changes at Q-Frank-Step9-A is **where** honest admission lives. Per banked principle: honest-admission framing for spec-non-compliance applies to internal exit-summary artifacts (this packet, the Phase 3 exit packet's §3 + §7 Item 11), NOT to consumer-facing demo artifacts (the demo does not claim Layer A consistency-check parity; Case B was pulled). The publication contract preserves discipline integrity by separating internal honest-admission documentation from consumer-facing claim-what-the-implementation-establishes.

---

**Per-canary publication extension complete with Q-Frank-Step9-A corrective overlay. Phase 3 close cadence proceeds with 12 canaries published per the Q-Frank-4 commitment, with the Layer A tag revised to reflect pulled-from-demo state and the count divergence resolved on the merits via fixture amendment. The disposition-split-discipline framing was withdrawn at the corrective ruling — the tag taxonomy extension is operationalized as case-specific reasoning per Q-Frank-4 directly, not as discipline-derived methodology.**

— SME, 2026-05-10
