# Phase 3 Parity-Canary Reactivation Results — Per-Canary Publication Artifact

**Date:** 2026-05-09 (Step 2 reactivation completed; SME publication-artifact authoring at Step 9.1 exit cadence)
**Cycle:** Phase 3 Step 9.1 exit cadence (per Q-Frank-4 architect ratification 2026-05-07: per-canary publication commitment; per Q-3-A architect ratification 2026-05-08: Step 2 deliverable; per Q-3-F architect ratification 2026-05-08: §3.6 risk-estimate schema canonical; SME-domain placement at this path)
**Predecessors:**
- Phase 2 exit packet `project/reviews/phase-2-exit.md` §6 (per-canary publication forward-track to Phase 3 entry packet)
- Phase 3 entry packet `project/reviews/phase-3-entry.md` §3.6 (SME-authored risk estimates) + §7 Step 2 framing requirement (publication artifact as Step 2 deliverable, NOT Phase 3 exit deliverable rolled forward)

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

**Per-canary publication artifact complete. Q-Frank-4 commitment delivered. Phase 3 Step 9.1 exit cadence sub-step closes at this artifact's commit.**

— SME, 2026-05-09
