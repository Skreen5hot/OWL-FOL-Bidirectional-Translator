# Phase 3 Parity-Canary Reactivation Results — Per-Canary Publication Artifact

**Date:** 2026-05-09 (Step 2 reactivation completed; SME publication-artifact authoring at Step 9.1 exit cadence — original §1-§6); 2026-05-10 (Q-3-Step9-A extension for No-Collapse adversarial corpus + Layer A consistency-check parity + hypothetical-axiom corpus per-canary tagging — §7 + §8)
**Cycle:** Phase 3 Step 9.1 exit cadence (per Q-Frank-4 architect ratification 2026-05-07: per-canary publication commitment; per Q-3-A architect ratification 2026-05-08: Step 2 deliverable; per Q-3-F architect ratification 2026-05-08: §3.6 risk-estimate schema canonical; SME-domain placement at this path) + Q-3-Step9-A disposition extension (per architect ruling 2026-05-10: per-canary publication tag taxonomy extends to cover No-Collapse adversarial corpus per disposition-split discipline)
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

## 7. Q-3-Step9-A extension — No-Collapse adversarial corpus + Layer A consistency-check parity per-canary tagging

**Per architect Q-3-Step9-A ruling 2026-05-10:** Phase 3 cannot close without the per-canary publication shipping for the live-deploy `checkConsistency()` divergences surfaced post-amendment-3. The disposition-split (D2 + three structural refinements) requires per-canary tagging that captures the bounded-fix-scope component (closed pre-exit) + forward-track-scope components (Layer A affirmation gap + count divergence) per the disposition-split discipline.

The original §1 outcome taxonomy was specific to Phase 2 stub-evaluated parity canaries. The Q-3-Step9-A extension introduces three new tag classes for the No-Collapse adversarial corpus and the Phase 1 Layer A fixture re-exercised at Phase 3 demo's Case B:

| Outcome label | Meaning |
|---|---|
| `survived-post-fix` | The fixture's expected outcome did NOT match real `checkConsistency()` at initial Phase 3 implementation; a bounded fix landed in a corrective sub-cycle (Step 9.4-amendment-N) closing the gap; the fixture now passes against the post-fix implementation. Used for Q-3-Step9-A's `nc_self_complement` disposition. |
| `survived-with-X-forward-tracked` | The fixture's primary outcome assertions hold (e.g., `'undetermined'` + `coherence_indeterminate` for non-Horn-disjunctive); a secondary assertion (e.g., `unverifiedAxioms` count semantics) diverges in a way that routes to next-phase architect ratification rather than v0.X spec-divergence. Used for Q-3-Step9-A's `nc_horn_incomplete_disjunctive` disposition. |
| `failed-revealed-implementation-gap-forward-tracked` | The fixture's expected outcome does NOT match real `checkConsistency()`; the gap is documented as v0.1 spec-divergence per Phase 2 Step 9.1 honest-admission framing precedent; v0.X closure path named in the Phase 3 exit packet's §6 forward-tracks. Used for Q-3-Step9-A's `p1_bfo_clif_classical` Layer A consistency-check parity disposition. |

Banked discipline: **per-canary publication tag taxonomy extends to cover disposition-split outcomes when an exit-blocking finding produces multi-component dispositions.** The original three tags (`survived` / `failed-revealed-stub-limit` / `not-yet-reactivated`) cover the simpler stub→real-evaluator transition; the three new tags cover the disposition-split transitions (bounded-fix-closes-pre-exit / secondary-assertion-forward-tracks / primary-assertion-becomes-documented-spec-divergence). Phase 4+ adversarial-corpus extensions inherit the unified six-tag taxonomy; the Phase 4 entry-cycle methodology refinement candidate per Q-3-Step9-A AUTHORING_DISCIPLINE banking discusses generalization.

### 7.1 No-Collapse adversarial corpus (4 fixtures)

| Canary | Pre-fix verdict | Post-fix verdict (live deploy 2026-05-10) | Tag | Disposition |
|---|---|---|---|---|
| `nc_self_complement` | `'undetermined'` / `coherence_indeterminate` (Q-3-Step9-A finding evidence) | `'false'` / `inconsistent` per Step 9.4-amendment-4 commit 7526973 | **`survived-post-fix`** | Frame I ruling 2026-05-10 + Refinement 1 bounded fix (Developer hypothesis investigation per (a) iff-unfolding gap OR (b) FOLFalse-in-head detection scope; CI green). The fixture's `discriminatesAgainst` field stands as authoritative per corpus-as-contract discipline. |
| `nc_horn_incomplete_disjunctive` | Primary: `'undetermined'` / `coherence_indeterminate` ✓; Secondary: `unverifiedAxioms` count = 1 (fixture: count ≥ 2) | Same — primary holds, secondary count-divergence persists | **`survived-with-count-divergence-forward-tracked-to-phase-4-entry`** | Q-3-Step9-A Refinement 3: count semantics is a corpus-discriminator-scope question (not a spec-interpretation-scope question) routed to Phase 4 entry-cycle for architect ratification on whether the corpus discriminator should specify count semantics OR the implementation should always emit all non-Horn axioms regardless of transitive implications. |
| `nc_horn_incomplete_existential` | (not exercised in demo; test suite verdict) | Per test suite: `'undetermined'` / `coherence_indeterminate` matching expected | **`survived`** | Sibling to `nc_horn_incomplete_disjunctive`'s primary outcome; not exercised in the live demo (per per-phase disposability scope), but the test suite verifies it. Phase 4 entry-cycle re-examines whether the existential variant has analogous count-semantics surface to the disjunctive variant. |
| `nc_silent_pass_canary` | `'undetermined'` / `coherence_indeterminate` with 3 unverifiedAxioms (matches `MUST NOT be 'true'` + acceptable verdicts criteria) | Same | **`survived`** | The catchall MUST-NOT-be-true assertion holds; the v0.1 Horn-only path correctly admitted Horn-fragment-escape with populated `unverifiedAxioms` per spec §8.5.5. Acceptable verdict per fixture's `expectedConsistencyResultAcceptable: ["undetermined", "false"]`. |

### 7.2 Layer A consistency-check parity (Phase 1 fixture re-exercised at Phase 3 demo Case B)

| Canary | Pre-fix verdict | Post-fix verdict (live deploy 2026-05-10) | Tag | Disposition |
|---|---|---|---|---|
| `p1_bfo_clif_classical` Layer A | `'undetermined'` / `coherence_indeterminate` with `unverifiedAxioms: [<BFO_0000002 ∧ BFO_0000003 → False>]` | Unchanged (no implementation fix per D2 + Refinement 2 — Layer A affirmation gap is forward-track-scope, not bounded-fix-scope) | **`failed-revealed-implementation-gap-forward-tracked`** | Q-3-Step9-A Refinement 2: documented v0.1 spec-divergence per Phase 2 Step 9.1 honest-admission framing precedent. Spec §8.5.1's Horn-checkable fragment requires `'true'` for this subset (no individual asserted to both Continuant and Occurrent); the implementation flags simple disjointness as `unverifiedAxioms` rather than affirming consistency on subsets where no individual triggers the body. v0.2 ELK closure absorbs the Horn-fragment classifier refinement (distinguishing Horn-expressible-but-not-exercised from non-Horn-expressible) alongside ELK's broader Horn-fragment expansion. |

### 7.3 Hypothetical-axiom corpus (4 fixtures — per Phase 3 entry packet §3.4)

| Canary | Live verdict | Tag | Notes |
|---|---|---|---|
| `hypothetical_clean` | Call 1: `'true'` / `consistent`; Call 2: `'true'` / `consistent` (non-persistence verified) | **`survived`** | Phase 3 demo Case B.5 exercises this; all three assertions pass. The two-call non-persistence guarantee per API §8.1.2 holds. |
| `hypothetical_inconsistency` | (test suite) Call 1: `'false'` / `inconsistent`; Call 2: `'true'` / `consistent` (non-persistence verified) | **`survived`** | The hypothetical axiomSet introduces FOLFalse-in-head inconsistency; Step 7 detects it; Call 2 confirms the hypothetical did not persist. |
| `hypothetical_horn_incompleteness` | (test suite) Call 1: `'undetermined'` / `coherence_indeterminate` with populated `unverifiedAxioms` | **`survived`** | The hypothetical axiomSet introduces non-Horn machinery without inconsistency; the v0.1 Horn-only path correctly admits Horn-fragment-escape per spec §8.5.5. |
| `hypothetical_non_persistence` | (test suite) Two-call protocol against the same session; Call 2 sees the original session state, not the hypothetical extension | **`survived`** | The non-persistence guarantee per API §8.1.2 is verified by the discriminating two-call protocol. |

---

## 8. Aggregate summary (post-Q-3-Step9-A extension)

**Phase 2 stub-evaluated parity canaries (3):** all 3 `survived` (per §2-§3 above). At-risk-tag-conservatism observation forward-tracked to Phase 3 exit retro per §4.

**No-Collapse adversarial corpus (4):** 1 `survived-post-fix` (`nc_self_complement` per Step 9.4-amendment-4); 1 `survived-with-count-divergence-forward-tracked-to-phase-4-entry` (`nc_horn_incomplete_disjunctive`); 2 `survived` (`nc_horn_incomplete_existential`, `nc_silent_pass_canary`).

**Layer A consistency-check parity (1):** 1 `failed-revealed-implementation-gap-forward-tracked` (`p1_bfo_clif_classical` Layer A — documented v0.1 spec-divergence per Q-3-Step9-A Refinement 2; v0.2 ELK closure path).

**Hypothetical-axiom corpus (4):** 4 `survived` (clean, inconsistency, horn-incompleteness, non-persistence).

**Total at Phase 3 close: 12 canaries published per Q-Frank-4 commitment + Q-3-Step9-A extension.** 11 survive (with 1 of those tagged `survived-post-fix` and 1 tagged `survived-with-count-divergence-forward-tracked`); 1 fails-as-documented-v0.1-spec-divergence with named v0.2 ELK closure path. The honest-admission discipline is preserved across the publication contract; Phase 3 closes with the per-canary verdicts published rather than aggregated, per the Q-Frank-4 commitment + Q-3-Step9-A disposition-split discipline extension.

The disposition-split discipline's load-bearing property is visible at this aggregate: forward-track-scope failures (1 of 12) ship with documented honest-admission framing rather than masking the divergence; bounded-fix-scope failures (1 of 12 — the `nc_self_complement` arm) close pre-exit; primary-passes-with-secondary-divergence (1 of 12 — the disjunctive count case) ship with explicit forward-track tagging. The publication contract preserves verifiable discipline integrity even in the presence of the v0.1 contract's documented gaps.

---

**Q-3-Step9-A per-canary publication extension complete. The disposition-split discipline (Banked Principle 3) operationalizes the publication-tag-taxonomy extension. Phase 3 close cadence proceeds with 12 canaries published per the unified Q-Frank-4 + Q-3-Step9-A taxonomy.**

— SME, 2026-05-10
