# Phase3DemoCritique.md

**Re:** OFBT Phase 3 demo — No-Collapse Guarantee + Layer A consistency-check parity
**From:** Frank, Logic/Technical Stakeholder — formal methods background, DL/FOL semantics, theorem-proving
**To:** Product Owner, Architect, SME
**Stance:** Substantive concerns of two distinct kinds. The Phase 3 engineering is real and the No-Collapse adversarial discipline (Case A) is sound. The Layer A framing (Case B), as currently shipped, is the kind of move I have to push back on hard. Specifics below.

---

## Executive read

Phase 3 ships the validator pipeline. That is a real, hard piece of engineering — `loadOntology()`, `evaluate()`, `checkConsistency()`, the visited-ancestor cycle-guard, the hypothetical-axiom non-persistence semantic, the session lifecycle. The code does substantially what spec §8 commits the validator to do, and the discrimination matrix in Case A demonstrates the No-Collapse Guarantee surface holds against three engineered adversaries. I am not skeptical of the engineering.

I am skeptical of the **framing**. Specifically, of how the Layer A consistency-affirmation gap, the unverifiedAxioms count divergence, and the just-invented "disposition-split discipline" interact in this demo to absorb three findings that the spec literally calls out as required behavior. The pattern is recognizable and it is the pattern by which serious projects develop the soft language of schedule pressure.

Two cases at once: a real engineering achievement and a real framing problem. They are not the same problem and they should not be evaluated together.

---

## Part 1 — What Phase 3 got right

I want to lead with this because the rest of the critique is sharper. The team has earned the right to be heard before the pushback.

### 1.1 The discrimination matrix is the right shape for a No-Collapse canary

Three fixtures, three discriminating outcomes, one negative assertion. `nc_self_complement` must return `'false'`; `nc_horn_incomplete_disjunctive` must return `'undetermined'` with populated `unverifiedAxioms`; `nc_silent_pass_canary` MUST NOT return `'true'`. The asymmetry between the first two and the third is exactly what a No-Collapse canary should look like — the catchall adversary's primary assertion is negative, because the No-Collapse Guarantee's failure mode is *silent passing*, not falsely failing. A logic stakeholder reads this discipline and recognizes it.

### 1.2 The Horn-decidable Self-Complement closure is real

The walkthrough mentions Step 9.4-amendment-4 in passing, but that closure is consequential. A class equivalent to its own complement gives `∀x. (C(x) ↔ ¬C(x))` — directly contradictory once any individual is asserted in the class. The Horn-decidable direction was the bounded-fix arm of Q-3-Step9-A and the team closed it pre-exit. The result panel showing `consistent: 'false'`, `reason: 'inconsistent'`, empty `unverifiedAxioms`, and a one-axiom `witnesses` array is the right verdict shape and it is hard-won.

### 1.3 The hypothetical-axiom non-persistence protocol is well-designed

The two-call protocol catches three distinct failure modes: `assertz` without matching `retract`, correct retraction with derived-fact leakage, and shared-state mutation via reference. The fact that the failure modes are enumerated in the demo callout — not just mentioned but identified individually — is the kind of careful design I want to see. Hypothetical reasoning that pollutes the session would silently corrupt every subsequent query; this protocol catches it.

### 1.4 The cycle-guard work is foundational

ADR-013's visited-ancestor pattern, ratified at Step 5, addresses a real failure mode in SLD resolution against transitive predicates with inverses. Without it, Tau Prolog would enter non-terminating recursion on cycle-prone predicates and the validator would hang or timeout. The fact that the pattern landed mid-phase, with its own architectural-gap micro-cycle, suggests the team encountered the failure mode in practice and addressed it structurally rather than working around it. Six cycle-prone predicate classes identified is a real architectural deliverable.

### 1.5 Phase 2 carryover did meaningfully close

The Phase 2 critique I wrote flagged eight concerns. Some closed in Phase 3:

- The stub evaluator is gone. Phase 2's parity canaries ran against `_stub-evaluator.js`; Phase 3 runs against real Tau Prolog. The provenance section references `phase-3-reactivation-results.md` claiming "3× survived against real `evaluate()`." That is a real result, even if the demo doesn't surface it visibly.
- The 27-fixture corpus has grown to 43. Coverage breadth improved by ~60%.
- The `evaluate()` function exists with three-state results, replacing Phase 2's bounded-Horn stub.

Other carryover items did not close (Case C still missing; "round-trip parity" terminology unchanged; ADR-007 §10 still referenced rather than ratified; finite-pattern canary still finite). I'll come back to these.

### 1.6 Q-3-Step9-A surfacing at the exit boundary is credibility-positive

The walkthrough says Q-3-Step9-A was "surfaced by stakeholder live-deploy smoke-check." Read literally: the team caught three substantive divergences from fixture contracts at the exit boundary, *before* deploying. That is a process working as intended — a discipline catching its own gap before the artifact reaches consumers. I respect that. The team didn't hide what the smoke-check found. The micro-cycle exists in `project/reviews/phase-3-step9-architectural-gap.md` and the demo references it openly.

These are real engineering wins. I want them on the record before anything else.

---

## Part 2 — The Layer A "spec-divergence" framing is a serious problem

Now the harder part. I am going to be direct about this because the framing is consequential and a logic stakeholder who lets it pass without pushback is doing the project a disservice.

### 2.1 What the spec says vs. what the implementation does

Spec §8.5.1 defines the Horn-checkable fragment scope. The walkthrough's own §4.4 acknowledges the spec-required verdict on the BFO Layer A subset:

> "Per spec §8.5.1's Horn-checkable fragment scope, simple disjointness assertions ARE Horn-checkable; the FOL translation `∀x. C(x) ∧ D(x) → False` is a Horn clause; satisfiability checks on individual named classes do not require consulting the disjointness axiom unless some individual is asserted to both classes. The BFO Layer A subset has no individual asserted to both Continuant and Occurrent, so the spec-required verdict is `'true'` with empty `unverifiedAxioms`."

The implementation returns `'undetermined'` with populated `unverifiedAxioms`.

This is not "spec-divergence" in any reading I find defensible. The spec defines a Horn-checkable fragment, defines what consistency means on it, identifies the case as in-scope, and specifies the verdict. The implementation returns a different verdict.

That is **the implementation failing a specification requirement on a canonical positive control**.

The walkthrough's framing — "documented v0.1 spec-divergence per Q-3-Step9-A Refinement 2 (architect ruling 2026-05-10); v0.2 ELK closure path absorbs the gap" — uses the phrase "spec-divergence" as if it were a soft category that lives between "compliant" and "broken." It isn't. The spec says X. The implementation does not-X. There is no third state called "documented divergence" in formal verification practice. There are bugs (which get fixed) and there are spec amendments (which get negotiated). Calling the gap "documented v0.1 spec-divergence" is using procedural language to avoid choosing one or the other.

### 2.2 Case B's role has been disposed without being replaced

Phase 1 used `p1_bfo_clif_classical` as the **positive control** for external CLIF parity — a known-consistent BFO subset that the lifter's verdict should match against the W3C canonical CLIF axiomatization. Phase 2 reused the fixture for round-trip parity — same positive-control role.

Phase 3 reuses the same fixture for consistency-check parity. The verdict diverges. The walkthrough acknowledges this in §4.4:

> "Notice this case was originally framed as the positive control for Case A. Post-Q-3-Step9-A, the framing refines: the Layer A canary now serves as the canonical example of the disposition-split discipline at exit-blocking findings."

That is a pivot, and the pivot is what concerns me. A positive control that fails its expected verdict and is reframed as "the canonical example of the discipline that handles failed positive controls" is no longer a positive control. The original epistemic role has been disposed. There is no replacement positive control for Layer A consistency-check parity in this demo.

What this means concretely: a logic-savvy auditor reading Phase 1, Phase 2, Phase 3 demos in sequence sees the same fixture used to establish three different parity claims. At Phase 1 it confirms lift correctness against canonical CLIF. At Phase 2 it confirms round-trip parity. At Phase 3 it does not confirm consistency-check parity — it instead anchors a new disposition framework. The cumulative-Layer-A-discipline argument that worked across Phase 1 and Phase 2 has stopped working at Phase 3, and the walkthrough has not acknowledged that this is what happened.

### 2.3 The demo's signal color has been compromised on its load-bearing case

Look at Case B.4. Six per-axiom badges. All six render as pending-tone "· v0.1 spec-divergence." None green. None red.

A demo whose load-bearing external-parity case shows zero green and zero red is a demo that has stopped distinguishing pass from fail on that case. It distinguishes only "documented" from "not yet documented" — and since everything in the demo is documented, the badges convey no information about whether the parity claim holds.

The walkthrough's §4.5 rationale is:

> "The badge framing distinguishes 'documented v0.1 spec-divergence with v0.2 closure path' from 'engineering defect that should fire red.'"

I understand the intent. The intent is to avoid the demo lighting up red on a known-acknowledged gap. But what gets lost in that distinction is the consumer's ability to read the demo as a verdict on whether the parity discipline holds. Pending-tone badges on every Layer A axiom mean the discipline produces no verdict. A logic stakeholder reading this concludes that Layer A consistency-check parity is not currently established for v0.1 — full stop. The walkthrough's framing tries to soften this conclusion; the badge color tells the truth.

### 2.4 Specific request

Replace Case B's framing with one of three options, picked deliberately:

**Option 1 — Acknowledge the spec violation directly.** Rename the badges to red ✗ FAIL with text "v0.1 implementation does not meet spec §8.5.1 requirement on this fixture; closure pending." Be honest that the demo shows a real failure of the parity discipline; treat the closure path as a roadmap commitment rather than a softening of the failure.

**Option 2 — Amend the spec.** If the team's actual position is "the spec §8.5.1 requirement is too strong for v0.1 and we will narrow it," then the spec gets a numbered amendment, the §8.5.1 text is revised to scope the affirmative verdict more narrowly, and the demo asserts against the revised spec. The amendment is visible and reviewable.

**Option 3 — Pull the Case B claim entirely.** If the team's position is "we cannot ship Layer A consistency-check parity in v0.1," then Case B does not exist in the Phase 3 demo. Phase 3 ships Case A only and acknowledges that the Layer A consistency-check parity argument waits for a later phase or a later release.

Any of these three is defensible. The current framing — "documented v0.1 spec-divergence with v0.2 ELK closure" — is none of them. It is a procedural language that tries to do all three at once and ends up doing none of them clearly.

---

## Part 3 — The disposition-split discipline is doing too much work

I want to flag this separately because I think it is a more dangerous pattern than the Layer A framing alone.

### 3.1 What the discipline says

Per the walkthrough's Q&A: "When an exit-blocking finding's distinct components have different fix-cost profiles, the disposition splits — bounded-fix-scope components close pre-exit; forward-track-scope components route to next-phase-exit-retro or next-phase-entry per natural cycle context."

In the abstract this is reasonable. Some bugs are cheap to fix; others are expensive. Triaging on cost is a normal engineering activity. I have no objection to the discipline as a tool.

### 3.2 What concerns me about the discipline as deployed

Three things, taken together:

**The discipline was invented in response to Q-3-Step9-A.** It is "Banked Principle 3" from this very phase, ratified the same day Q-3-Step9-A surfaced its findings. A discipline that emerges in the middle of resolving a specific crisis, immediately gets ratified, and then gets used to absorb the crisis it was invented to address, is structurally suspicious. A discipline tested only against the case it was invented to address is not a discipline; it is a rationalization.

**The discipline justifies the resolution of every Q-3-Step9-A finding without an independent test.** Three findings: `nc_self_complement` count divergence (closed pre-exit); Layer A affirmation gap (forward-tracked to v0.2); count divergence on `nc_horn_incomplete_disjunctive` (forward-tracked to Phase 4 entry). The discipline says: of three exit-blocking findings, close one and forward-track two. Without the discipline, one might ask: why exactly two of three? Why is the affirmation gap forward-track-scope rather than bounded-fix-scope? With the discipline, the answer is "different fix-cost profiles." The discipline becomes its own justification.

**The discipline is forward-tracked to Phase 4 entry as methodology.** From the deferred section:

> "**disposition-split discipline as Phase-4-entry methodology candidate**"

This is concerning. A discipline invented to absorb a specific crisis, immediately deployed to ship that crisis, and then forward-tracked as a permanent methodology, is on a trajectory I recognize from many software projects. The discipline gets canonized because it worked once. Once canonized, it is available for the next crisis. After three or four crises, the discipline has hardened into the project's normal mode of operation, and the original crisis-response framing has been lost.

### 3.3 What I would ask the team

I would put three questions to the architect, in this order:

**Did the disposition-split discipline exist as a documented practice before Q-3-Step9-A surfaced its three findings?**

If yes, point to the precedent. (Phase 2 Step 9.1 is referenced in the demo as setting "honest-admission framing precedent" — but that is a different precedent for a different kind of finding.)

If no, the discipline is a post-hoc construction. That is not necessarily fatal — sometimes the right discipline is invented in response to a problem that surfaces it. But the architect should be explicit: "We invented this discipline this week, in response to this finding, to handle this and future findings of this kind." The honesty matters. The discipline being invented to absorb its first case is structurally different from the discipline existing first and being applied to one case.

**What is the test for whether a finding is 'bounded-fix-scope' versus 'forward-track-scope'?**

If the test is "the architect rules" — that is procedural, not principled. Anything can be either depending on what the architect decides. The discipline becomes a slot for the architect's judgment, not a check on it.

If the test is "fix-cost above threshold X" — what is X? Was the Layer A affirmation gap fix actually estimated and found to exceed X? Or was it routed to v0.2 ELK without an explicit cost estimate?

If the test is something else — what?

**Will the discipline ever produce a 'this is a v0.1 blocker, period, ship is delayed' outcome?**

If yes, what kind of finding would trigger that outcome? A logic stakeholder reads the current demo and sees a Layer A spec-violation absorbed by the discipline. I want to know what the discipline looks like *not* working — what category of finding does the discipline refuse to absorb?

If no, the discipline is structurally a schedule-protection mechanism, not a quality-protection mechanism. It will absorb anything because it is designed to absorb.

---

## Part 4 — Smaller concerns worth surfacing

These are less consequential than Layer A and the discipline question, but I want them on the record.

### 4.1 The unverifiedAxioms count divergence

Case A.4. The fixture's `expectedUnverifiedAxiomsMinCount: 2`. The implementation surfaces 1. Walkthrough's framing: "corpus-discriminator-scope question forward-tracked to Phase 4 entry-cycle for architect ratification on whether the corpus discriminator should specify count semantics OR the implementation should always emit all non-Horn axioms regardless of transitive implications."

The framing presents this as an abstract question about corpus discriminator design. The reality is simpler: the fixture's author and the implementation's author disagree about what should happen, and the disagreement was found at the exit boundary.

Either the fixture is wrong (the author over-specified — the implementation is correct in surfacing only the disjunctive axiom; the disjointness is a derived consequence, not a non-Horn-fragment-escape) or the implementation is wrong (it should be surfacing both axioms because both contributed to indeterminacy). One of those should ship; the other should be fixed. Forward-tracking the choice itself, as a "discriminator-scope question," means shipping code and fixtures that are mutually inconsistent.

### 4.2 The "v0.2 ELK closure" framing is doing structural work

Throughout the demo and walkthrough, "v0.2 ELK" is invoked as the closure path for multiple gaps:

- Layer A consistency-affirmation gap → v0.2 ELK
- The `nc_horn_incomplete_disjunctive` non-Horn case → "expected_v0.2_elk_verdict" field
- The Horn-fragment classifier refinement → v0.2 ELK
- The EL-profile gap broadly → v0.2 ELK

A logic stakeholder asks: what is v0.2 ELK as a project commitment? Is there:

- A scoped roadmap document?
- A timeline?
- A budget?
- A named owner?
- An entry-criterion checklist?

If yes to any of these, point me to them. If no, "v0.2 ELK" is a placeholder that lets v0.1 ship with known unfixed semantics. The placeholder pattern is the same one I flagged in Phase 2 with "Phase 3 reactivation will close the stub-evaluator gap" — and to the team's credit, that one closed. So the pattern can be honored. But each invocation of "v0.X closes Y" is a deferred commitment that has to be tracked and honored, and a critic will count them.

I would value a single artifact — call it `v0.2-roadmap.md` — that lists every "v0.2 ELK closes that" commitment from across the v0.1 phases, with their source phase and gap, and assigns each a scope/owner/timeline. Without that artifact, the v0.2 framing is doing more work than it is being held accountable for.

### 4.3 ADR-007 §10 is still referenced as "architect-ratified" without evidence of ratification

Same concern as my Phase 2 critique. ADR-007 §10 (the meta-typing-predicate elision) is referenced four times in the demo as architect-ratified justification. I have not seen the ratified text. The Phase 2 critique flagged this as banked rather than published; Phase 3 references it as ratified.

If §10 is now actually ratified text in `project/DECISIONS.md`, this is closed. If it is still banked and referenced as ratified, that is a procedural drift worth catching now.

### 4.4 Case C still missing

The Phase 2 critique's biggest concrete ask was a "Case C — Lossy round-trip" demonstration showing Annotated Approximation, Loss Signatures, and Recovery Payloads. Phase 3 does not include this. The deferred section continues to reference "six remaining LossType trigger-matchers" as Phase 4-7 work, which is fine for the trigger-matchers themselves, but the existing two trigger-matchers (`naf_residue` and `unknown_relation`) have been shipping since Phase 2 and have never been demonstrated in a demo.

The most consequential capability of OFBT's audit ledger discipline remains invisible. This is the third demo cycle in which I have flagged this.

### 4.5 No new Layer A canary purpose-designed for consistency-check parity

The Phase 1 fixture was designed for lift correctness. The Phase 2 fixture was the same fixture reused for round-trip parity. The Phase 3 fixture is the same fixture again, now reused for consistency-check parity. At each phase, the same fixture is exercised in a new role. That is acceptable for some claims; it is dubious for others.

A purpose-designed Phase 3 Layer A consistency-check parity fixture might exhibit different gaps than the bent-from-Phase-1 fixture exhibits. The team should consider whether the choice to reuse rather than purpose-build has hidden anything.

### 4.6 The Phase 2 reactivation results are not surfaced in the demo

The Phase 2 critique flagged this as a load-bearing forward-track. The provenance section references `phase-3-reactivation-results.md` claiming "3× survived against real `evaluate()`." That is good. But the demo does not surface the result. A consumer reading the demo cannot see which Phase 2 canaries reactivated successfully and which (if any) didn't.

This is a missed opportunity. The reactivation result is exactly the kind of evidence that builds cumulative-discipline credibility across phases. Showing it in the demo would strengthen the trust argument significantly.

---

## Part 5 — Recommendation

I would not yet sign off on the claim that "Phase 3 establishes the No-Collapse Guarantee for v0.1." I would sign off on the narrower claim that "Phase 3 establishes the No-Collapse Guarantee for the three engineered adversarial fixtures in Case A, and ships the validator pipeline + session lifecycle + cycle-guard pattern + hypothetical-axiom non-persistence semantic. The Layer A consistency-check parity claim has not been established and the demo's framing of that gap should be revised before public release."

**Concrete asks before sign-off:**

1. Replace the Layer A "documented v0.1 spec-divergence" framing with one of three explicit options: (a) acknowledge red FAIL and treat as roadmap, (b) amend the spec with a numbered, reviewable amendment, or (c) pull Case B from the Phase 3 demo entirely.

2. Address the unverifiedAxioms count divergence in Case A.4 by either fixing the fixture, fixing the implementation, or amending the spec. Forward-tracking it as a "corpus-discriminator-scope question" defers a choice that should be made now.

3. Publish ADR-007 §10 as ratified text. Three demo cycles is enough.

4. Add Case C — Lossy round-trip — to the Phase 3 demo or commit explicitly to it as Phase 4. Three demo cycles is enough.

5. Document the disposition-split discipline before deploying it as a forward-going methodology. Specifically: (a) was it precedent-supported before Q-3-Step9-A, (b) what is the test for bounded vs. forward-track scope, (c) what category of finding does it refuse to absorb.

6. Produce a consolidated `v0.2-roadmap.md` listing every "v0.2 ELK closes that" commitment from v0.1 phases with scope/owner/timeline.

7. Surface the Phase 2 reactivation results in the demo. The "3× survived" finding is not visible to a consumer reading the demo and it should be.

8. Consider whether reusing `p1_bfo_clif_classical` for three different parity claims is hiding fixture-design issues. A purpose-built Phase 3 Layer A consistency-check parity fixture might reveal different gaps.

---

## Part 6 — A note on tone

The Phase 2 critique was substantive but the engineering was soft enough that the critique could afford to be precise without being sharp. Phase 3 is different. The engineering is more substantial — the validator is a real piece of work — but the framing has hardened in ways I think are concerning. I have been sharper in this review because the framing concerns are sharper.

I want to be clear that the sharpness is in service of the project. A logic stakeholder who lets "documented v0.1 spec-divergence" framing pass without pushback is teaching the team that such framing is acceptable on the next demo cycle. If I let it pass at Phase 3, Phase 4 will produce more of it. The most useful thing I can do as a reviewer is name the pattern explicitly while it is small.

The Q-3-Step9-A architectural-gap micro-cycle existing at all is a credibility-positive event. The team caught its own gap at the exit boundary. The disposition-split discipline as the response to that catch is where I have concerns — not because the discipline is wrong in the abstract, but because deploying it as the response to its own founding case sets a pattern I want to interrupt now rather than later.

The right version of Phase 3 is one where the team's response to this critique is "you're right, the Layer A framing is procedural language papering over a real gap; here is what we're doing about it." The wrong version is one where the response is to refine the framing further with more sub-clauses and cross-references. A logic stakeholder six months from now reviewing the Phase 4 demo should be able to say: "Phase 3 closed Layer A explicitly, and the discipline framing was tightened in response to feedback." That is the bar.

— Frank, Logic/Technical Stakeholder
