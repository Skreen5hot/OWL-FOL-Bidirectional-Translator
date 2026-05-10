# Phase 3 Step 9 Architectural-Gap Micro-Cycle — Q-3-Step9-A + Q-Frank-Step9-A corrective overlay — RATIFIED

**Date:** 2026-05-09 (initial DRAFT — Aaron's stakeholder-feedback dispatch surfacing live-deploy divergences); 2026-05-10 (architect ruling on Q-3-Step9-A: Frame I + D2 disposition + 3 structural refinements + 5 banked principles); **2026-05-10 (same day, Q-Frank-Step9-A corrective ruling: 3 banking withdrawals + 7 new bankings + 1 meta-banking + 4 Asks executed in corrective commit, in response to Frank's stakeholder critique)**
**Cycle type:** Phase 3 in-Step architectural-gap micro-cycle (FIFTH instance) + first stakeholder-routing corrective sub-cycle (Q-Frank-Step9-A); surfaced at the exit boundary by the original Q-3-Step9-A finding, then corrected at the same-day Q-Frank-Step9-A ruling.
**Surfaced by:** Aaron's stakeholder feedback 2026-05-09 — browser smoke-check on commit 7216cd4 (deployed Phase 3 demo, Case A.3 + Case B.3) post-9.4-amendment-3 probe-fix that restored a clean console; **Q-Frank-Step9-A corrective ruling surfaced by Frank's stakeholder critique 2026-05-10 ([`demo/Phase3DemoCritique.md`](../../demo/Phase3DemoCritique.md))**
**Status:** **RATIFIED 2026-05-10 (with Q-Frank-Step9-A corrective overlay).** Cycle history: (1) Aaron stakeholder smoke-check 2026-05-09 surfaced three substantive divergences from fixture contracts → (2) SME path-fence-authored Q-3-Step9-A routing dispatch with two interpretive frames + four disposition options + three hypothesized root causes + load-bearing question → (3) **architect ruling 2026-05-10 (original):** Frame I governs; D2 disposition; three structural refinements; five banked principles → (4) Step 9.4-amendment-4 implementation commit lands the bounded fix → (5) **Frank's stakeholder critique 2026-05-10** flagged the Layer A "documented v0.1 spec-divergence" framing as procedural language papering over a real gap, the disposition-split discipline as post-hoc rationalization, the count-divergence forward-tracking as shipping mutually inconsistent fixtures and code → (6) **Q-Frank-Step9-A architect corrective ruling 2026-05-10 (same day):** 3 banking withdrawals + 7 new bankings + 1 meta-banking; 4 Asks executed in corrective commit (pull Case B + amend count + promote ADR-007 §10 + author v0.2-roadmap.md). This packet captures the audit-trail record with the corrective overlay applied.

---

## CORRECTIVE OVERLAY — Q-Frank-Step9-A ruling 2026-05-10

**Frank's stakeholder critique surfaced concerns that hold on the merits.** The architect issued a corrective ruling same-day. This overlay records the withdrawals + new dispositions + new bankings; the original Q-3-Step9-A ruling text below is preserved for audit-trail integrity, but the dispositions named in §5.3-§5.4 below have been REVISED per the corrective ruling. Read the overlay first, then the original; treat the overlay as governing where they conflict.

### Overlay 1 — Frame ruling preserved; Layer A disposition REVISED

**Frame I governance stands** (the original ruling's spec-literal-framing reasoning was correct: spec §8.5.1 covers equivalent-to-complement and Layer A consistency-affirmation; corpus discriminators align with the literal framing; Frame II readings are refused on corpus-as-contract grounds). The two preserved bankings stand on their own merits:

1. ✅ **Spec interpretation framing rulings on exit-blocking findings default to spec-literal framing when corpus discriminators align with the literal framing** (preserved)
2. ✅ **Simple disjointness assertions per spec §8.5.1 are Horn-checkable** (preserved)

**Layer A disposition REVISED from forward-track-with-soft-framing to PULL-FROM-DEMO.** The original Refinement 2 ("Layer A forward-tracked as documented v0.1 spec-divergence") used soft-language framing in a consumer-facing artifact (the demo). Frank's §2 critique correctly identified this as the soft-language-of-schedule-pressure pattern. The corrective ruling **pulls Case B from the demo entirely**: the v0.1 implementation does not yet satisfy spec §8.5.1's required affirmative verdict on the canonical positive control; per banked principle "demos do not claim what the implementation cannot demonstrate," the case is pulled. The Layer A closure path is forward-tracked via the consolidated [`project/v0.2-roadmap.md`](../v0.2-roadmap.md), not via soft demo framing. Honest-admission framing for spec-non-compliance applies to internal exit-summary artifacts, not to consumer-facing demo artifacts.

### Overlay 2 — Count-divergence disposition REVISED from forward-track to RESOLVE-NOW

The original Refinement 3 ("count divergence forward-tracked to Phase 4 entry-cycle as corpus-discriminator-scope question") was **withdrawn** per Frank's §4.1 critique: forward-tracking the choice ships mutually inconsistent fixtures and code. The corrective ruling RESOLVES-NOW: the architect ruled the implementation is correct on the merits (only the disjunctive-consequent SubClassOf is non-Horn; the disjointness is Horn-expressible). The fixture's `expectedUnverifiedAxiomsMinCount` was amended 2 → 1 in the corrective commit. The withdrawn forward-track also withdraws from the Phase 4 entry-packet inheritance.

### Overlay 3 — Disposition-split discipline WITHDRAWN as banked principle

The original ruling's three bankings related to the disposition-split discipline (BP 3, BP 4, BP 5) were **withdrawn** per Frank's §3 critique: the discipline was invented in the same cycle as its founding case, lacked an exclusion criterion, and had no test for in-scope vs out-of-scope beyond "the architect rules." The corrective ruling refuses the discipline as banked principle. Withdrawals listed:

- ❌ **WITHDRAWN:** "Disposition spectrum rulings on exit-blocking findings split scopes when the finding's distinct components have different fix-cost profiles" (was BP 3)
- ❌ **WITHDRAWN:** "Frame I ruling does not extend to non-Horn-fragment fixtures' unverifiedAxioms count semantics, which require their own analysis" (was BP 4)
- ❌ **WITHDRAWN:** "Phase exit packet's deferred-with-structural-requirements bucket inherits exit-blocking finding components per the disposition-split discipline" (was BP 5)

**The Q-3-Step9-A resolution stands as case-specific reasoning** (the `nc_self_complement` arm closed pre-exit; the Layer A arm pulled from demo per the corrective ruling), **but the discipline is not banked as architectural-commitment-tier methodology.** The Phase 4 entry-packet "disposition-split discipline as Phase-4-entry methodology candidate" forward-track is also withdrawn.

### Overlay 4 — New bankings from Q-Frank-Step9-A corrective ruling

Seven new bankings + one meta-banking issued at the corrective ruling:

1. ✅ **NEW:** When a phase's implementation does not yet satisfy a spec requirement on a canonical positive control, the demo does not claim what the implementation cannot demonstrate. Pulling the case from the demo is preferable to soft-language framing. (Ask 1)
2. ✅ **NEW:** Honest-admission framing for spec-non-compliance applies to internal exit-summary artifacts, not to consumer-facing demo artifacts. Demos pull cases that the implementation does not yet establish. (Ask 1 distinction)
3. ✅ **NEW:** When fixture-vs-implementation count divergences surface at exit boundaries, the resolution requires architect ruling on which is correct. Forward-tracking ships mutually inconsistent fixtures and code, which is refused. (Ask 2)
4. ✅ **NEW:** Stakeholder-flagged demo gaps that span multiple phase cycles get explicit phase-deliverable commitments at the next phase entry packet, not soft "v0.X may include this" framing. Three-cycle drift is sufficient evidence. (Ask 4)
5. ✅ **NEW:** Disciplines invented in response to specific findings do not get banked as architectural-commitment-tier methodology in the same cycle. Banking requires the discipline to have been tested against at least one independent case; pre-banking would canonize rationalization. (Ask 5)
6. ✅ **NEW:** Disciplines that absorb findings without exclusion criteria are schedule-protection mechanisms, not quality-protection mechanisms; they are refused as banked principles. (Ask 5 second)
7. ✅ **NEW:** When deferred-closure-path framing accumulates across phases, a consolidated roadmap artifact at the next phase boundary lists every commitment with scope/owner/timeline. (Ask 6)
8. ✅ **META-BANKING:** Frank's Phase 3 letter is the canonical articulation of the post-hoc-discipline-canonization risk pattern. Future cycles facing pressure to bank disciplines invented in response to specific findings reference [`demo/Phase3DemoCritique.md`](../../demo/Phase3DemoCritique.md) as the cautionary precedent. The architect issues banking corrections (withdrawals and new bankings) when stakeholder critique surfaces concerns that hold on the merits. The architectural-commitment surface is preserved by clean revision when prior rulings were structurally incorrect, not by procedural defense of prior rulings.

### Overlay 5 — Eight Asks executed in corrective commit

| Ask | Disposition | Action |
|---|---|---|
| Ask 1 | Pull Case B from Phase 3 demo | `demo/demo_p3.html` Case B section + Case B JS handlers + Layer A parity render function removed; hypothetical-axiom sub-case relocated under Case A as A.7. `demo/p3-walkthrough.md` §4 (Case B) removed; framing revised to single-argument Case A; A.7 narration added. |
| Ask 2 | Resolve count divergence now | `tests/corpus/nc_horn_incomplete_disjunctive.fixture.js` `expectedUnverifiedAxiomsMinCount: 2 → 1`; audit-trail header (a/b/c/d) added; manifest mirror update. |
| Ask 3 | Promote ADR-007 §10 to Accepted | `project/DECISIONS.md` ADR-007 §10 status header revised to "ACCEPTED with Q-Frank-2 boundary-statement refinement, promoted at Q-Frank-Step9-A Ask 3 ruling 2026-05-10"; boundary-statement section added; promotion audit trail. |
| Ask 4 | Commit Case C to Phase 4 explicitly | Phase 4 entry-packet inheritance: Case C — Lossy round-trip — as Phase 4 exit deliverable, not forward-track. Documented in `project/reviews/phase-3-exit.md` §6 Forward-Tracks + this overlay. |
| Ask 5 | Withdraw disposition-split discipline | `arc/AUTHORING_DISCIPLINE.md` Step 9 architectural-gap subsection: 3 bankings withdrawn (BP 3, 4, 5) + 7 new bankings + 1 meta-banking added. |
| Ask 6 | Author v0.2-roadmap.md | New artifact `project/v0.2-roadmap.md` consolidating every "v0.X closes Y" commitment from across Phases 1-3 with source / scope / owner / timeline. |
| Ask 7 | Surface Phase 2 reactivation results | SME elected Phase 4 demo inclusion path (vs Phase 3 demo update). Phase 4 entry-packet inherits the reactivation surface as cumulative-discipline-credibility opening. |
| Ask 8 | Purpose-built Phase 3 Layer A fixture | Phase 4 entry-packet question; not a Phase 3 close action. Forward-track to Phase 4 entry-cycle deliberation. |

### Overlay 6 — Cycle accounting (revised)

Phase 3 mid-phase counter remains at **5** (closed at Q-3-Step9-A original ruling); Q-Frank-Step9-A is a stakeholder-routing corrective sub-cycle that does NOT increment mid-phase or entry-cycle counters per the prior banking ("stakeholder-routing cycles after phase close are corrective sub-cycles in the exit-cycle bucket"). Phase 3 stakeholder-routing cycles increment a separate corrective sub-cycle counter (currently at 1, this cycle).

The Phase 3 exit retro forward-tracked methodology refinement item gains additional data: the Q-Frank-Step9-A cycle issues banking corrections, which is itself a methodological data point for the retro analysis. Banking-correction discipline (the architect's clean revision in response to stakeholder critique that holds on the merits) is the **fourth** Phase 3 exit retro candidate (alongside parallel-registry, substantive-scope-weighting methodology, at-risk-tag-conservatism).

---

## ORIGINAL Q-3-Step9-A RULING TEXT (preserved for audit-trail integrity; superseded by overlay above where dispositions diverge)

**Post-ratification SME work (in order):**
1. Step 9.4-amendment-4 commit (Developer-domain) — bounded fix per the Developer hypothesis investigation; CI green on 7526973 (LANDED)
2. Path-fence-author Q-3-Step9-A routing artifact (this document) — RATIFIED audit-trail record
3. Fold 5 banked principles into AUTHORING_DISCIPLINE.md "Phase 3 Banked Principles" Step 9 architectural-gap subsection (LANDED at deliverable #1)
4. Re-draft `phase-3-exit.md` with Q-3-Step9-A as Item 11 in §7 risk retrospective + Layer A + count-divergence forward-tracks (deliverable #2)
5. Extend `phase-3-reactivation-results.md` with No-Collapse adversarial corpus per-canary tagging (deliverable #3)
6. Update `demo_p3.html` Case A.4 + B.3 + B.4 assertions to honest-admission framing (deliverable #4)
7. Update `p3-walkthrough.md` narration for Case A.4 + B.3 + B.4 (deliverable #5)

**Blocks (PRE-RULING):** Phase 3 Step 9.5 + Step 9.6 + reactivation publication + demo update + walkthrough update — all waited on this disposition. UNBLOCKED at architect ruling 2026-05-10.

**Predecessors:**
- [`phase-3-step3-architectural-gap.md`](./phase-3-step3-architectural-gap.md) (RATIFIED 2026-05-09)
- [`phase-3-step4-architectural-gap.md`](./phase-3-step4-architectural-gap.md) (RATIFIED 2026-05-09; verification-ritual operationalized)
- [`phase-3-step5-architectural-gap.md`](./phase-3-step5-architectural-gap.md) (RATIFIED 2026-05-09; ADR-013 promoted)
- [`phase-3-step6-architectural-gap.md`](./phase-3-step6-architectural-gap.md) (RATIFIED 2026-05-09; three-state ConsistencyResult)
- [`phase-3-retroactive-corrective.md`](./phase-3-retroactive-corrective.md) (RATIFIED 2026-05-09; Cat 3 FOL @type discriminator findings)
- [`phase-3-reactivation-results.md`](./phase-3-reactivation-results.md) (Q-Frank-4 per-canary publication; this packet's disposition extends to No-Collapse adversarial corpus tagging)

---

## 1. Evidence (verbatim from SME dispatch 2026-05-09)

The 9.4-amendment-3 probe fix (commit 7216cd4) restored a clean console on the deployed demo. With the bundle now actually executing `checkConsistency()` in the browser, three substantive divergences from fixture contracts surfaced:

| Fixture | Path | Fixture-required outcome | Live `checkConsistency()` outcome |
|---|---|---|---|
| `nc_self_complement` | `tests/corpus/nc_self_complement.fixture.js:108-123` | `consistent: 'false'`, `reason: 'inconsistent'`, `unverifiedAxioms: []` | `consistent: 'undetermined'`, `reason: 'coherence_indeterminate'`, `unverifiedAxioms: [<C(x)→¬C(x)>]` |
| `nc_horn_incomplete_disjunctive` | (loaded in demo Case A.4) | `'undetermined'` + `coherence_indeterminate` + `unverifiedAxioms` count ≥ 2 | matches first two; count = 1 |
| `p1_bfo_clif_classical` (Layer A consistency-check parity, demo Case B) | (Phase 1 fixture exercised by Phase 3 demo) | `consistent: 'true'`, `reason: 'consistent'`, `unverifiedAxioms: []` | `consistent: 'undetermined'`, `reason: 'coherence_indeterminate'`, `unverifiedAxioms: [<BFO_0000002 ∧ BFO_0000003 → False>]` |

The `nc_self_complement` fixture is the load-bearing one because its `discriminatesAgainst` field explicitly rules out the implementation's actual outcome:

> "any implementation that returns 'undetermined' with coherence_indeterminate (this case is decidable in the Horn-checkable fragment, NOT outside it)"

`nc_silent_pass_canary` and `hypothetical_clean` (B.5) survive — the catchall MUST-NOT-be-true assertion holds, and the two-call non-persistence guarantee passes. The gap is specifically in the **affirmative arms** of the verdict (proving `'false'` for Horn-decidable inconsistency; proving `'true'` for Horn-translatable consistent fragments).

## 2. SME-hypothesized root causes (Developer-side, pending architect concurrence)

Three candidate mechanisms, none verified at routing time:

**(a) iff-unfolding gap.** `EquivalentClasses(C, ObjectComplementOf(C))` should lift to ∀x. (C(x) ↔ ¬C(x)), then translate to two Prolog clauses (the iff-unfolding the fixture's witness chain step (2) names). If the Phase 3 lifter only emits one direction, the Horn-resolver has no path from `C(c)` to false.

**(b) FOLFalse-in-head detection scope.** Step 7's `isFalseHeadAxiom` may only fire on axioms whose consequent is the explicit `FOLFalse` constructor (i.e., the lifted form of `DisjointClasses` / `DisjointWith`), not on the `not C(x) :- C(x).` Prolog form derived from `EquivalentClasses-with-complement`. If so, the equivalent-to-complement contradiction needs its own detection arm.

**(c) Layer A consistency-affirmation gap.** The BFO Layer A axioms include `DisjointWith(Continuant, Occurrent)` which lifts to `BFO_0000002(x) ∧ BFO_0000003(x) → False`. The implementation flags this axiom as `unverifiedAxioms` rather than affirming consistency — suggests the Horn-only checker treats any FOLFalse-in-head clause as Horn-fragment-escape rather than checking whether any individual triggers it. The Layer A subset has no individual asserted to both classes, so a correct Horn-affirming check should emit `'true'`.

These were hypotheses, not diagnoses. The architect's first decision point was whether Developer should run them down before disposition.

## 3. Two interpretive frames (SME framing)

**Frame I (implementation gap):** Spec §8.5.1's Horn-checkable fragment scope DOES cover equivalent-to-complement and Layer A consistency. Implementation is incomplete; gaps must be closed before exit OR explicitly forward-tracked with documented spec-divergence.

**Frame II (fixture-discriminator overscope):** Spec §8.5.1's fragment is narrower than the fixture's `discriminatesAgainst` claims. The implementation's `'undetermined'` is the correct v0.1 verdict; the fixture's discriminator should be relaxed (corpus-amendment), and the demo's assertion bar should be re-baselined.

## 4. Disposition spectrum (SME framing)

| Disposition | Cost | Risk |
|---|---|---|
| **D1** — fix-before-exit (9.4-amendment-4 lands implementation closure for both arms; Phase 3 exit cleanly) | High (substantive Step 6/7 work; possibly ADR amendment) | Slips Phase 3 close; well-understood patch scope |
| **D2** — fix-as-amendment-4 minimal (close just the nc_self_complement arm; document Layer A affirmation gap as forward-track) | Medium | Demo still shows one FAIL; honest-admission story for B.3 |
| **D3** — fixture-relax + demo re-baseline + forward-track (architect rules Frame II; SME amends fixtures' discriminatesAgainst to permit `'undetermined'`; demo assertions follow) | Low (SME-only) | Loosens No-Collapse contract; future ELK integration absorbs |
| **D4** — document-and-forward-track (architect rules Frame I but ships v0.1 with documented spec-divergence; phase-3-reactivation-results.md extends to cover No-Collapse canaries with honest-admission outcomes; v0.2 ELK closes) | Low | Demo's discrimination matrix surfaces FAILs; presents as honest-admission |

## 5. Architect ruling 2026-05-10 — Frame I + D2 + three structural refinements

### 5.1 Frame ruling — Frame I governs

Frame I governs. The fixture-discriminator scope is correct; the implementation is incomplete relative to spec §8.5.1's Horn-checkable fragment scope.

**Why Frame I is correct on `nc_self_complement`:** spec §8.5.1's "simple disjointness assertions" framing covers equivalent-to-complement (the most extreme form of disjointness — `C` is disjoint from itself, modulo complement). The lifted FOL form `∀x. (C(x) ↔ ¬C(x))` produces two Horn clauses (`not C(x) :- C(x).` + `C(x) :- not C(x).`); both Horn-clause-expressible; inconsistency provable in Horn resolution per spec §8.5.2's check pattern. Frame II would require reading spec §8.5.1 as excluding equivalent-to-complement, which contradicts the spec's literal "simple disjointness assertions" framing — banking the ADR-012 principle 1 application: "Spec interpretation defaults to literal framing, not conservative emission strategy."

**Why Frame I is correct on `p1_bfo_clif_classical` Layer A:** `DisjointWith(Continuant, Occurrent)` lifts to `∀x. ¬(Continuant(x) ∧ Occurrent(x))` ≡ `∀x. Continuant(x) ∧ Occurrent(x) → False` per ADR-007 §11. Layer A has no individual asserted to both classes; spec §8.5.2's check on each named class produces no contradiction; closure complete; satisfiable; consistency holds. The implementation's flagging of the disjointness axiom as `unverifiedAxioms` is a Horn-fragment misclassification: simple disjointness IS Horn-expressible per spec §8.5.1.

**Why Frame I matters for the v0.1 contract:** Frame II would relax the fixture corpus's discriminator scope — corpus-side amendment to permit `'undetermined'` where the spec's Horn-checkable fragment requires `'false'` or `'true'`. Refusing Frame II preserves spec §8.5.1's literal framing + the fixture corpus's `discriminatesAgainst` discipline (architect-ratified Q-3-E corpus-before-code at Phase 3 entry cycle) + the No-Collapse Guarantee's load-bearing-claim character. Accepting Frame II would corrupt the corpus-as-contract discipline.

### 5.2 Critical refinement on Frame I scope

Frame I ruling does NOT extend to `nc_horn_incomplete_disjunctive` count divergence (live: count = 1; required: count ≥ 2). That fixture's outcome is plausibly an implementation artifact of how the Horn-fragment classifier reports unverified axioms when one axiom transitively implies multiple non-Horn surfaces. This is a separate question from the Frame I/II framing on the affirmative arms; it requires its own analysis at Phase 4 entry-cycle.

### 5.3 Disposition ruling — D2 fix-as-amendment-4 minimal, with three structural refinements

D2 with three structural refinements. Phase 3 closes with bounded implementation closure + documented forward-track for Layer A affirmation.

**Refinement 1:** `nc_self_complement` fix scope is bounded to specific implementation hypotheses (a) and (b). Developer runs them down to diagnose the actual gap; bounded fix follows. If diagnosis is something else, routes back to architect for ADR consideration.

**Refinement 2:** Layer A affirmation gap forward-tracked as documented v0.1 spec-divergence. Phase 3 exit packet's deferred-with-structural-requirements bucket gains an item naming v0.2 ELK closure path. Honest-admission framing per the Phase 2 Step 9.1 "documented spec-non-compliance" precedent applies.

**Refinement 3:** `nc_horn_incomplete_disjunctive` count divergence routes as Phase 4 entry-cycle question. Documented in Phase 3 reactivation results publication per Q-Frank-4 + forward-tracked to Phase 4 entry-cycle for architect ratification on whether the corpus discriminator should specify count semantics, or the implementation should always emit all non-Horn axioms regardless of transitive implications.

### 5.4 What's explicitly not authorized

- No Frame II ruling
- No D1 disposition (Layer A affirmation gap too substantive to close before exit)
- No D3 disposition (Frame II refused; corpus-relax refused)
- No D4 disposition (`nc_self_complement` arm is bounded-fix-scope; should close before exit)
- No skipping of the Developer hypothesis investigation
- No skipping of the verification ritual on the Step 9.4-amendment-4 commit
- No expansion of the fix scope beyond `nc_self_complement` arm closure
- No corpus discriminator amendment on `nc_self_complement`
- No closure of Phase 3 without the Phase 3 reactivation results publication shipping

## 6. Five banked principles

[Folded into AUTHORING_DISCIPLINE.md "Phase 3 Banked Principles" Step 9 architectural-gap subsection at deliverable #1; transcribed verbatim per the §11 verbatim-transcription discipline.]

1. **Spec interpretation framing rulings on exit-blocking findings default to spec-literal framing when corpus discriminators align with the literal framing.** Frame II readings narrowing the spec post-hoc are refused on corpus-as-contract grounds.

2. **Simple disjointness assertions per spec §8.5.1 are Horn-checkable.** The FOL translation `∀x. C(x) ∧ D(x) → False` is a Horn clause; satisfiability checks on individual named classes do not require consulting the disjointness axiom unless some individual is asserted to both classes. Implementation must distinguish "this axiom is non-Horn" from "this axiom is Horn-expressible but not exercised on this subset."

3. **Disposition spectrum rulings on exit-blocking findings split scopes when the finding's distinct components have different fix-cost profiles.** Bounded-fix-scope components close before exit; forward-track-scope components route to next-phase-exit-retro or next-phase-entry per natural cycle context.

4. **Frame I rulings cover affirmative-arm correctness gaps** (decidable cases producing `'undetermined'` instead of `'false'`/`'true'`). It does not extend to non-Horn-fragment fixtures' `unverifiedAxioms` count semantics, which require their own analysis.

5. **Phase exit packet's deferred-with-structural-requirements bucket inherits exit-blocking finding components per the disposition-split discipline.** Honest-admission framing per the Phase 2 Step 9.1 banking applies.

## 7. Cycle accounting

Phase 3 mid-phase counter moves **4 → 5** (Step 3 + Step 4 + Step 5 + Step 6 + Step 9 architectural-gap micro-cycles). Counter at 5 exceeds the entry-packet projection (~3) by 2.

The Phase 3 exit retro forward-tracked methodology refinement item carries this final data point: substantive-scope-weighting projection at Phase 3 entry was significantly under-projected (~3 projected vs 5 actual). Methodology refinement question for retro now has full Phase 3 data:

(i) was the under-projection systematic across phase types or specific to Phase 3's evaluator+consistency+cycle-detection scope,
(ii) what refinement to substantive-scope-weighting methodology applies at Phase 4+ entry,
(iii) does the retroactive ritual's phase-boundary discipline tool generalize to absorbing some of the cycle pressure that would otherwise surface as mid-phase escalations?

The methodology refinement item now has full Phase 3 data; retro analysis proceeds with complete evidence.

## 8. Cross-references

- Architect ruling 2026-05-10 (Frame I + D2 + three structural refinements + 5 banked principles)
- SME dispatch 2026-05-09 (this routing artifact's §1-§4)
- 9.4-amendment-4 commit 7526973 (Developer-domain bounded fix; CI green)
- `tests/corpus/nc_self_complement.fixture.js` `discriminatesAgainst` field (load-bearing fixture-as-contract)
- `tests/corpus/nc_horn_incomplete_disjunctive.fixture.js` `expectedUnverifiedAxiomsMinCount: 2` field (count-divergence forward-track)
- `tests/corpus/p1_bfo_clif_classical.fixture.js` Layer A subset (Layer A affirmation gap forward-track)
- Q-Frank-4 per-canary publication discipline (extension target for No-Collapse adversarial corpus per deliverable #3)
- ADR-007 §11 (FOL→Tau Prolog clause translation rules; relevant to the Layer A affirmation gap's ∀x. C(x) ∧ D(x) → False translation)
- ADR-012 banked principle 1 (spec interpretation defaults to literal framing) — referenced in Frame I ruling
- Phase 2 Step 9.1 honest-admission framing (precedent for Refinement 2's Layer A forward-track framing)
- AUTHORING_DISCIPLINE.md "Phase 3 Banked Principles" Step 9 architectural-gap subsection (the 5 banked principles' permanent home)

---

**Q-3-Step9-A architectural-gap micro-cycle complete. Frame I governs; D2 disposition with three structural refinements ratified; five banked principles folded into AUTHORING_DISCIPLINE.md. Phase 3 mid-phase counter at 5 (final). Phase 3 close cadence proceeds.**

— SME, 2026-05-10
