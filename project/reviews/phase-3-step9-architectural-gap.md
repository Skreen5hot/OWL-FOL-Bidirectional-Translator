# Phase 3 Step 9 Architectural-Gap Micro-Cycle — Q-3-Step9-A — RATIFIED

**Date:** 2026-05-09 (initial DRAFT — Aaron's stakeholder-feedback dispatch surfacing live-deploy divergences); 2026-05-10 (architect ruling on Q-3-Step9-A: Frame I + D2 disposition + 3 structural refinements + 5 banked principles)
**Cycle type:** Phase 3 in-Step architectural-gap micro-cycle (FIFTH instance; Steps 3 + 4 + 5 + 6 micro-cycles preceded; this surfaced at the exit boundary, distinguishing it from the prior in-Step micro-cycles which surfaced during their respective Step framings)
**Surfaced by:** Aaron's stakeholder feedback 2026-05-09 — browser smoke-check on commit 7216cd4 (deployed Phase 3 demo, Case A.3 + Case B.3) post-9.4-amendment-3 probe-fix that restored a clean console
**Status:** **RATIFIED 2026-05-10.** Cycle history: (1) Aaron stakeholder smoke-check 2026-05-09 surfaced three substantive divergences from fixture contracts → (2) SME path-fence-authored Q-3-Step9-A routing dispatch with two interpretive frames + four disposition options + three hypothesized root causes + load-bearing question → (3) **architect ruling 2026-05-10:** Frame I governs (implementation gap, not fixture-discriminator overscope); D2 disposition (fix-as-amendment-4 minimal nc_self_complement + Layer A forward-track + count-divergence forward-track); three structural refinements; five banked principles → (4) Step 9.4-amendment-4 implementation commit lands the bounded fix; this packet (RATIFIED) captures the audit-trail record.

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
