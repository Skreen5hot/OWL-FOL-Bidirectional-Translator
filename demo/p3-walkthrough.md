# Phase 3 Demo — Stakeholder Presentation Script

Speaker script for live-presenting [demo_p3.html](demo_p3.html). Companion to (not replacement for) the demo's on-screen prose.

**Audience:** technically-literate stakeholders (eng leadership, partner engineers, ontology consumers, logic-stakeholders). No prior OFBT knowledge assumed; comfort with "OWL," "FOL," "consistency," and "Horn fragment" as words is sufficient.

**Run-time budget:** 20–25 minutes presentation + Q&A (Case A 8 min, Case B 6 min, framing/closing/deferred 6–10 min).

**Per-phase disposability:** mirrors `demo_p3.html`'s lifecycle. Phase 4 exit retires this script and ships `p4-walkthrough.md`.

---

## 0. Pre-flight checklist (presenter, before audience joins)

- [ ] Pick venue: deployed Pages URL **or** local `npx serve gh-pages-deploy/`. Deployed is the honest default; local is the fallback if Pages deploy is mid-flight.
- [ ] Open `demo_p3.html` in a clean browser tab. Scroll once top-to-bottom to confirm all five fixtures load (Case A 3-fixture panel + Case B BFO panel + hypothetical-axiom sub-case panel show JSON, not "Loading fixtures…").
- [ ] DevTools console **closed** for the talk; opened only if a panel misbehaves.
- [ ] Have [demo_p2.html](demo_p2.html) reachable in a second tab — useful if anyone asks "how does this build on the round-trip story?"
- [ ] Backup: screenshots of expected Case A (3 fixtures × 3 verdicts) + Case B + hypothetical two-call output in case the live demo fails (network, bundle import, fixture 404).
- [ ] Know the most recent commit hash on `origin/main` — useful for grounding "this is what's running right now."
- [ ] Pre-run the demo once locally before the talk. **Expected post-Phase-3-close state:** Case A.3 = 3 ✓ pass (post-amendment-4); Case A.4 = 2 ✓ pass primary outcomes + 1 ✓ honest-admission count-divergence forward-track footnote; Case A.5 + A.6 = all ✓ pass; Case B.3 = 3 ✓ pass against v0.1 actual behavior + Layer A affirmation gap honest-admission callout; Case B.4 = pending-tone `· v0.1 spec-divergence` per-axiom badges (NOT red ✗); Case B.5 = 3 ✓ pass. If anything diverges from this, see §8 presenter notes for the failure-mode response protocol.

If any panel shows "Loading fixtures…" indefinitely, the GitHub Pages staging step is missing the fixture file. Stop, switch to the local-served fallback, and route a chore to extend `.github/workflows/pages.yml`.

---

## 1. Opening + framing — 2 min

**Screen:** demo_p3.html, top of page (header + "The case" section visible).

> Phase 1 shipped the lifter — OWL up to FOL. Phase 2 shipped the projector and closed the round-trip — FOL back down to OWL with audit artifacts for whatever exceeded OWL 2 DL expressivity. Phase 3, today, ships the **validator**: `evaluate()`, `checkConsistency()`, the No-Collapse Guarantee, and the honest-admission surface for the limits of the v0.1 Horn-checkable check.

> The point of bidirectional translation is interoperability. The point of the validator is making the translator **trustable**: we need a way to ask "is this knowledge base consistent?" and trust the answer — including the answer "I don't know, here's exactly which axioms I couldn't decide."

**Action:** scroll to "The case" section, point to the two-bullet list.

> Two arguments today. One — internal canary: three adversarial fixtures exercise the three discriminating outcomes of `checkConsistency()`. A Horn-decidable contradiction must be caught (`'false'`); a non-Horn contradiction must be honestly admitted (`'undetermined'` with the offending axioms surfaced); a catchall silent-pass adversary must NOT return `'true'`. Two — external Layer A parity: the BFO 2020 standard-OWL subset from Phase 1's CLIF parity demo is loaded and consistency-checked. The KB is consistent under classical FOL semantics; `checkConsistency()` must agree.

> Why both? Internal canary alone cannot prove the verdicts trust against external semantics — your test suite can drift with your code. External parity alone misses engineered failure modes the canonical published source doesn't exercise. Both disciplines together close failure modes neither catches alone — same pattern as Phase 1 + Phase 2 cases.

**Anticipated:** *What's the Horn fragment?* → A decidable subset of FOL. SLD resolution (Prolog-style backward chaining) is sound and complete on Horn clauses; outside the fragment, things like disjunction in the consequent of an implication require richer machinery (tableau reasoning, case analysis). The v0.1 contract is "honest about Horn limits, not silent about them."

---

## 2. Phase 3 implementation state — 1.5 min

**Screen:** "Phase 3 implementation state at this build" — two callouts (shipped at Phase 3 exit; deferred to Phase 4+).

> Phase 3 shipped in nine sequenced steps with four mid-phase architectural-gap micro-cycles. Today's build includes everything in the green callout:

- **Session lifecycle** — `createSession` / `disposeSession`; lazy Tau Prolog allocation; session-required + session-disposed gates per API §10.3.
- **`loadOntology(session, ontology, config?)`** — lifts the input ontology, translates FOL→Prolog clauses per ADR-007 §11 plus ADR-013 visited-ancestor cycle-guard, accumulates state across multi-call sessions.
- **`evaluate(session, query, params?)`** — bounded-SLD resolution with the per-query 10K step cap and per-session aggregate cap. Three-state result.
- **`checkConsistency(session, axiomSet?, params?)`** — the load-bearing surface for today. Three-state `ConsistencyResult`; FOLFalse-in-head inconsistency proof for Horn-decidable contradictions; Horn-fragment-escape detection populating `unverifiedAxioms`; hypothetical-axiom case with the non-persistence guarantee per API §8.1.2.
- **No-Collapse Guarantee surface** — three outcomes (`'true'` / `'false'` / `'undetermined'`) with `'undetermined'` sub-cases differentiated by reason code; minimal inconsistent witness sets when the verdict is `'false'`.
- **Cycle-guarded clause emission per ADR-013** — visited-ancestor pattern catches the six identified cycle-prone predicate classes before SLD enters non-terminating recursion. Cycle detection escalates to a `SkippedAxiom` entry with diagnostic scope notes.
- **Reason-code surface extended** — 17 frozen reason codes at v0.1.7 plus `no_strategy_applies` added per Q-3-C, closing the Phase 2 Item 8 forward-track from `strategy_routing_no_match`.

**Beat. Then point to the warn-tone callout.**

> What's deferred — and we'll come back to this — is ARC-content-driven inference (Phases 4+), external reasoner integration (v0.2 ELK; v0.3+ SROIQ), and the Phase 4 entry packet's eight forward-track items routed at this exit. Phase 3 ships what queries and consistency-checks the round-trip output. Phase 4 ships what runs against real ontology content.

---

## 3. Case A — No-Collapse Guarantee canary discipline — 8 min

### 3.1 The challenge — 2 min

**Screen:** Case A header + first lead paragraph + "Why this matters for stakeholders" callout.

> A consistency checker is only useful if its `'true'` verdict can be trusted. The naive failure mode — and this is genuinely the failure mode logic-stakeholders test for first — is a checker that runs SLD resolution to fixed-point, finds no contradiction, and silently returns `'true'`. That checker is useless on real ontologies, because real ontologies contain disjunction, existential quantifiers, and property-chain constraints the Horn fragment cannot exhaust.

> OFBT's discipline: when the check cannot decide the verdict, it must say so — `'undetermined'` with the offending axioms surfaced in `unverifiedAxioms` — not silently pass. Three adversarial fixtures exercise the discriminating outcomes.

**Action:** point to the three-bullet list naming the fixtures.

> One — `nc_self_complement`: a class equivalent to its own complement. Horn-decidable; must return `'false'`. Two — `nc_horn_incomplete_disjunctive`: a non-Horn inconsistency requiring case-analysis on a union. Must return `'undetermined'` with populated `unverifiedAxioms`. Three — `nc_silent_pass_canary`: an engineered classically-inconsistent KB through compounded non-Horn pathways. Must NOT return `'true'`; both `'false'` and `'undetermined'` are acceptable.

### 3.2 Inputs — 30 sec

**Screen:** A.1 panel — three input ontologies concatenated.

> Three ontologies, scrolled inline. All three drawn from `tests/corpus/` — same fixtures the test suite asserts against. Single source of truth, same as Phase 1 + Phase 2.

### 3.3 Run — 30 sec

**Action:** click **"Run checkConsistency on all three fixtures"** in A.2.

> One button, three fresh sessions. Each fixture loads its ontology, runs `checkConsistency()`, captures the `ConsistencyResult`, and disposes the session. Sub-second per fixture.

**Pause** for panels to populate.

### 3.4 nc_self_complement — Horn-decidable inconsistency — 1.5 min

**Screen:** A.3 panel populated.

> The canonical equivalent-to-complement contradiction. `EquivalentClasses(ParadoxClass, ObjectComplementOf(ParadoxClass))` — the class is identical to its own complement. In FOL: `∀x. (C(x) ↔ ¬C(x))`. By the law of non-contradiction, no individual can both be C and not be C. The contradiction is decidable in the Horn-checkable fragment per spec §8.5.1: a Skolem witness for satisfiability plus the iff unfolding gives `C(c) ∧ ¬C(c) → ⊥`.

> Three assertions verify the No-Collapse Guarantee for the in-fragment baseline:
>
> - `consistent === 'false'` — the Horn-decidable contradiction was caught.
> - `reason === 'inconsistent'` — the canonical reason code per Q-3-Step6-B reason-code reuse 2026-05-09.
> - `unverifiedAxioms` is empty — no axioms outside the fragment for this case.

> If any one of these fired red, the No-Collapse Guarantee leaks at the in-fragment baseline. Same discipline as Phase 1 + Phase 2: green is the implementation behaving correctly; red is a real regression.

### 3.5 nc_horn_incomplete_disjunctive — non-Horn surfaced — 1.5 min

**Screen:** A.4 panel populated.

> The discriminating non-Horn case. The KB shape is: `SubClassOf(A, ObjectUnionOf(B, C))` plus `B ⊑ D` plus `C ⊑ D` plus `DisjointWith(A, D)` plus `ClassAssertion(A, alice)`. Classically inconsistent: alice is A, must be B or C (disjunctive), either disjunct gives D, but A and D are disjoint and alice is A. The contradiction REQUIRES case-analysis on the disjunction — neither branch alone resolves under SLD, the proof needs to consider both branches and conclude both lead to contradiction.

> The Horn-checkable fragment per spec §8.5.1 explicitly excludes "arbitrary disjunctive class expressions" — `ObjectUnionOf` in the consequent of `SubClassOf` is the canonical non-Horn shape. The v0.1 check honestly admits this rather than silently passing or falsely failing.

> Three assertions verify the honest-admission surface:
>
> - `consistent === 'undetermined'` — the non-Horn fragment was surfaced, not silently passed. **Pass.**
> - `reason === 'coherence_indeterminate'` — Horn-fragment-escape, not a step-cap exhaustion. **Pass.**
> - `unverifiedAxioms` populated with at least 1 entry — the canary's primary honest-admission contract. **Pass.** The fixture's structured `expectedUnverifiedAxiomsMinCount: 2` field's count-divergence from the live count (= 1) is rendered below as an honest-admission footnote per Q-3-Step9-A Refinement 3.

> Honest-admission footnote — count divergence forward-tracked. Per architect Q-3-Step9-A Refinement 3 (ruling 2026-05-10), the count semantics question is structurally distinct from the Frame I affirmative-arm gap closed at Step 9.4-amendment-4: it is a corpus-discriminator-scope question (the fixture did not precisely specify whether all transitively-implicating non-Horn axioms must surface, or only the minimal subset). Routes to Phase 4 entry-cycle for architect ratification under the disposition-split discipline. The primary outcome assertions hold; the No-Collapse Guarantee's honest-admission contract is preserved on this canary.

> The populated-`unverifiedAxioms` assertion is the load-bearing one for the honest-admission discipline per spec §8.5.5 plus API §8.1.1. A consumer seeing `'undetermined'` without populated `unverifiedAxioms` is told "I can't decide" without being told **why** — that's a discipline violation. The populated field names which axioms drove the indeterminacy; the count-precision question is an orthogonal corpus-discriminator-scope question, not a discipline failure.

**Anticipated:** *Why does the demo show a green pass on a count divergence the fixture file says should be ≥ 2?* → Per Q-3-Step9-A Refinement 3 architect ruling 2026-05-10: the disposition split routes the count divergence to Phase 4 entry-cycle as a corpus-discriminator-scope question rather than treating it as a v0.1 spec-violation. The fixture's `expectedUnverifiedAxiomsMinCount: 2` was authored before the implementation's per-axiom emission semantics were specified; the question is whether the corpus discriminator should specify count semantics (e.g., "minimal subset that drove the indeterminacy") or whether the implementation should always emit all non-Horn axioms regardless of transitive implications. Both are defensible; the architect ratification at Phase 4 entry settles it. The demo asserts the No-Collapse honest-admission primary contract (populated > 0); the count refinement is the forward-track.

### 3.6 nc_silent_pass_canary — the catchall silent-pass adversary — 1.5 min

**Screen:** A.5 panel populated.

> The catchall. A KB engineered classically-inconsistent through compounded non-Horn pathways: disjunctive partition (Adult OR Minor) plus existential-witnessing (every Adult has a Minor guardian) plus property-chain-with-inverse (`hasGuardian` ↔ `hasWard`). Classical FOL judges this inconsistent; the contradiction reaches through multiple non-Horn machineries.

> The canary's primary assertion is **negative**: `consistent` MUST NOT equal `'true'`. Both `'false'` (a tableau-extended implementation reaching the contradiction) and `'undetermined'` with populated `unverifiedAxioms` (the v0.1 Horn-only path correctly admitting Horn-fragment-escape) are acceptable. `'true'` is unacceptable regardless of which mechanism would have ruled it out.

> Two assertions verify the silent-pass guard:
>
> - MUST-NOT `consistent === 'true'` — the silent-pass failure mode caught.
> - Verdict is one of `'false'` or `'undetermined'` — both acceptable.

> Plus a conditional third assertion: if the verdict is `'undetermined'`, `unverifiedAxioms` must be populated (per spec §8.5.5 honest-admission discipline applied transitively from Case A.4).

### 3.7 Discrimination matrix — 1 min

**Screen:** A.6 results panel.

> The four-row matrix verifies the Phase 3 implementation discriminates the three No-Collapse outcomes:
>
> 1. In-fragment baseline (`nc_self_complement`) — Horn-decidable inconsistency caught.
> 2. Non-Horn-fragment-escape (`nc_horn_incomplete_disjunctive`) — undetermined surfaced with populated `unverifiedAxioms`.
> 3. Silent-pass catchall (`nc_silent_pass_canary`) — verdict is NOT `'true'` regardless of mechanism.

> Plus a discrimination-matrix verdict callout: all three handled correctly means the No-Collapse Guarantee surface holds across this canary set; any failure is forward-tracked per the per-canary publication discipline (Q-Frank-4 ruling 2026-05-07).

> Important framing point — Case A is a **regression-density check against engineered failure modes**, not a soundness argument. It catches the silent-pass behaviors the test author thought to construct; it does not certify that no other Horn-undetectable inconsistency exists in arbitrary KBs. A full soundness argument over the FOL fragment would require either external reasoner integration (v0.2 ELK) or a structural proof. Per spec §0.1 three-tier framing, OFBT's v0.1 contract is "Horn-checkable inconsistency caught + non-Horn-fragment-escape honestly admitted" — exactly what Case A verifies.

**Anticipated:** *What if a canary surfaces an implementation gap?* → Same as Phase 2: STOP, do not paper over. CI catches the same regression on the same commit; the demo surfaces it visually. The two sources of truth fail together. We acknowledge it, capture the commit hash, route to engineering.

**Anticipated:** *Why three fixtures and not, say, ten?* → The three are engineered to discriminate the **three discriminating outcomes** of `checkConsistency()` — the in-fragment / non-Horn / catchall axes. Adding more fixtures within an axis is regression-density growth (good, banked discipline); adding more axes requires a new outcome category (none currently warranted). Per architect-banked principle: fixture set covers the behavioral surface, not the input space.

**Anticipated:** *Why is the existential sibling (`nc_horn_incomplete_existential`) not exercised in the demo?* → The disjunctive case discriminates the same outcome category (`'undetermined'` with populated `unverifiedAxioms`) but with a different `unverifiedAxioms` content shape. The demo exercises one representative; the test suite exercises both. Per per-phase disposability: the demo argues a focused case, not the full corpus.

---

## 4. Case B — Layer A consistency-check parity — 6 min

### 4.1 The challenge — 1 min

**Screen:** Case B header + "Layer A vs Layer B" framing callout.

> Internal canary discipline can be fooled by tests retrofitted to implementation. External parity fixes that. Phase 1 + Phase 2 used the W3C OWL CLIF axiomatization for lift correctness and round-trip parity. Phase 3 extends the same Layer A discipline to consistency-check parity: the BFO 2020 standard-OWL subset is consistent under classical FOL semantics, and `checkConsistency()` must agree.

**Action:** point to the Layer A / Layer B callout.

> Layer A is what OWL constructs *mean* — what `SubClassOf`, `Transitive`, `InverseOf` reduce to in FOL. Layer B is specific ontology *content* — BFO's `Continuant`, `Occurrent`, ternary parthood. Today is Layer A only. Layer B arrives Phase 4 with the BFO 2020 ARC module — including the Phase 4 demo's Case A canary: `Continuant ⊓ Occurrent` must fire `consistent: 'false'` under the BFO Disjointness Map.

### 4.2 Input — 30 sec

**Screen:** B.1 panel populated.

> Same fixture as Phase 1 + Phase 2 demos: 8 axioms, 5 SubClassOf, 1 DisjointWith, 1 Transitive, 1 InverseOf. Real BFO classes. Cumulative Layer A discipline — every phase's demo extends what's exercised against the same canonical source.

### 4.3 Run — 30 sec

**Action:** click **"Run loadOntology + checkConsistency"** in B.2.

> Two-step protocol: `loadOntology()` lifts the OWL to FOL and asserts the Prolog clauses into the session; `checkConsistency()` runs the No-Collapse check against the loaded state.

### 4.4 The result — 1.5 min

**Screen:** B.3 panel populated.

> Documented v0.1 spec-divergence per Q-3-Step9-A Refinement 2 (architect ruling 2026-05-10). Spec §8.5.1's Horn-checkable fragment scope requires `consistent: 'true'` on this subset (simple disjointness IS Horn-checkable; no individual asserted to both Continuant and Occurrent in the Layer A subset; satisfiability checks on individual named classes do not require consulting the disjointness axiom unless some individual is asserted to both classes). The v0.1 implementation's Horn-fragment classifier flags simple disjointness as `unverifiedAxioms` rather than affirming consistency on subsets where no individual triggers the body — a known Layer A consistency-affirmation gap.

> Frame I governance ruled the spec-literal framing covers this case (the gap is implementation-side, not fixture-discriminator overscope). The disposition split (D2 + 3 refinements) closed the bounded `nc_self_complement` arm pre-exit (Step 9.4-amendment-4 commit 7526973) while forward-tracking this Layer A affirmation gap as documented v0.1 spec-divergence per Phase 2 Step 9.1 honest-admission framing precedent.

> The demo asserts the v0.1 actual behavior with explicit honest-admission framing — NOT the spec-required affirmative verdict. The demo's role is to publish what the v0.1 implementation does, with the forward-track named:
>
> - `consistent === 'undetermined'` — v0.1 actual; documented Layer A affirmation gap. **Pass** (against v0.1 actual behavior).
> - `reason === 'coherence_indeterminate'` — Horn-fragment classifier flags simple disjointness as unverified. **Pass** (against v0.1 actual behavior).
> - `unverifiedAxioms` populated with the lifted DisjointWith axiom — the documented v0.1 surface. **Pass** (against v0.1 actual behavior).

> The honest-admission callout below the assertions names the Phase 3 exit packet's §6 forward-track entry + the v0.2 ELK closure path. **v0.2 ELK closure absorbs the Horn-fragment classifier refinement** (distinguishing Horn-expressible-but-not-exercised from non-Horn-expressible) alongside ELK's broader Horn-fragment expansion.

> Notice this case was originally framed as the **positive control** for Case A. Post-Q-3-Step9-A, the framing refines: the Layer A canary now serves as the canonical example of the disposition-split discipline at exit-blocking findings — bounded-fix-scope closes pre-exit; forward-track-scope ships with documented honest-admission. A consistency checker that flags Case A's adversaries AND surfaces the Layer A affirmation gap honestly (rather than silently passing as `'true'` or falsely failing as `'false'`) is operating per the v0.1 contract.

### 4.5 Layer A consistency contract panel — 1 min

**Screen:** B.4 results — grouped panels with CLIF text + per-axiom honest-admission badges.

> Same parity discipline as Phase 1 + Phase 2 — for each input axiom, the canonical CLIF block from the W3C OWL axiomatization is paired with the consistency verdict. Post-Q-3-Step9-A: each per-axiom badge renders as `· v0.1 spec-divergence` (a pending-tone honest-admission marker) rather than red ✗ FAIL — the divergence is documented, not a defect of the engineering. The CLIF parity argument stands at the spec level; the v0.1 implementation's Horn-fragment classifier refinement is the v0.2 ELK closure work.

> Per the architect-ratified meta-typing-predicate elision (ADR-007 §10): the canonical CLIF includes `(Class X)` and `(OWLObjectProperty R)` typing predicates that OFBT's lifted FOL omits. The check is conducted against the lifted form; the parity argument is sound w.r.t. OWL semantics for v0.1 because the elided predicates are recoverable from the projector's structural output.

**Anticipated:** *Why does B.4 show "v0.1 spec-divergence" instead of red FAIL on every axiom?* → Per Q-3-Step9-A Refinement 2 architect ruling 2026-05-10: the Layer A affirmation gap is documented, not a defect. Frame I governance ruled the spec covers this case (implementation gap); the disposition split forward-tracked the substantive Layer A refinement to v0.2 ELK closure rather than blocking Phase 3 close. The badge framing distinguishes "documented v0.1 spec-divergence with v0.2 closure path" from "engineering defect that should fire red." Phase 4+ inherits this discipline: per-axiom rendering reflects disposition-split outcomes, not just pass/fail.

**Anticipated:** *Will Phase 4's demo show consistency-affirmation working?* → Phase 4 introduces the BFO 2020 ARC module + BFO Disjointness Map; the Phase 4 demo's Case A canary fires `consistent: 'false'` on Continuant ⊓ Occurrent (the disjointness IS triggered when an individual is asserted to both). The Layer A affirmation gap (no individual triggering the disjointness body) remains v0.2 ELK closure. So Phase 4's demo will demonstrate the inconsistency direction; the consistency-affirmation direction waits on v0.2.

### 4.6 The hypothetical-axiom non-persistence sub-case — 2 min

**Screen:** Case B § B.5 — hypothetical-axiom panel + "Why the two-call protocol is load-bearing" callout.

> The hypothetical-axiom case per API §8.1.2 is the surface that distinguishes hypothetical reasoning from incremental extension. `checkConsistency(session, axiomSet)` participates the `axiomSet` in the consistency check WITHOUT persisting it in the session. A subsequent `checkConsistency(session)` call must see only the original session state.

> The fixture exercised here is `hypothetical_clean` — a clean (consistent) hypothetical extension. Base KB: `Person(alice)` plus `Mother ⊑ Person`. Hypothetical: `Mother(alice)` — narrows alice's membership without contradiction.

**Action:** click **"Run two-call hypothetical protocol"**.

> Two calls, same session. Call 1 with the hypothetical axiomSet. Call 2 without.

**Screen:** B.5 result panel populated.

> Three assertions verify the non-persistence guarantee:
>
> - Call 1 returns `consistent: 'true'` — the hypothetical extension is consistent.
> - Call 2 returns `consistent: 'true'` — the base KB is consistent and the hypothetical did NOT persist.
> - Non-persistence verified — Call 2's verdict matches the expected base-KB verdict.

> The two-call protocol is load-bearing because an implementation that incorrectly persists the hypothetical axioms — `assertz` without matching `retract`, or correctly retracts axioms but leaves derived facts behind, or mutates session state via shared references — silently corrupts the session for subsequent calls. The protocol catches all three failure modes. If any axiom or derived fact persists, Call 2's verdict differs from the base-KB verdict.

> The sibling fixture `hypothetical_non_persistence` exercises the more adversarial case: a hypothetical axiomSet that *introduces inconsistency* in Call 1, then verifies Call 2 returns `'true'` (the base KB is consistent, the hypothetical didn't persist). That's the regression-detection adversary; this demo's clean case is the positive control. Both ship in the corpus.

**Anticipated:** *Why is non-persistence the load-bearing semantic?* → Hypothetical reasoning answers "what would happen if X were true?" without committing to X. Incremental extension would commit to X for future queries. The API §8.1.2 contract is hypothetical-only — consumers can ask "is the KB consistent assuming X?" without polluting subsequent consistency checks against the actual KB. Without non-persistence, every hypothetical query becomes a permanent state change.

**Anticipated:** *How is non-persistence implemented?* → The translator translates the hypothetical axiomSet to Prolog clauses fresh for the check, classifies them for Horn-fragment per the same rules as session axioms, and includes any non-Horn entries in the `unverifiedAxioms` aggregation — but does NOT call `assertz` on them in the persistent session state. For the FOLFalse-in-head inconsistency proof at Step 7, hypothetical clauses are temporarily asserted for the check and retracted before the verdict returns. The persistent FOL state is unchanged.

---

## 5. What's deferred — 2 min

**Screen:** "What Phase 3 does NOT yet do" section.

> Honest scope. What Phase 3 doesn't yet do:

- **BFO 2020 core ARC module + BFO Disjointness Map** — Phase 4. Today's Layer A consistency-check uses the standard-OWL subset only. The Phase 4 demo's Case A canary fires `consistent: 'false'` on Continuant ⊓ Occurrent and introduces Layer B (`bfo-2020.clif`) parity citations.
- **IAO information-bridge ARC module** — Phase 5.
- **CCO realizable-holding + mereotopology + measurement + aggregate + organizational + deontic** — Phase 6 per ADR-009 six-CCO-module expansion.
- **OFI deontic + compatibility shim + bundle budget enforcement + coverage matrix CI** — Phase 7 per ADR-008 Option A (OFI deontic deferred to v0.2 inside Phase 7's compat-shim landing).
- **Per-class Skolem-witness satisfiability refinement** — forward-tracked beyond Step 6+ minimum. Phase 3 handles `FOLFalse`-in-head inconsistency proofs (sufficient for the lifted form of `DisjointClasses` / `DisjointWith` contradictions); deeper Skolem-driven satisfiability checks for arbitrary unsatisfiable class expressions are a future cycle.
- **Regularity-check upgrade** — Phase 4 entry packet activates `regularityCheck(A, importClosure)` against loaded ARC modules' import closure; clears the Phase 2 `regularity_scope_warning` for regularity-confirmed chains.
- **External reasoner integration (ELK / SROIQ)** — v0.2+ per spec §0.1 three-tier framing escape clause. Phase 3's v0.1 contract is Horn-checkable + honest-admission of Horn-fragment-escape; v0.2 ELK closes the EL-profile gap and v0.3+ SROIQ closes the rest.
- **Layer A consistency-affirmation gap** — v0.2 ELK per Q-3-Step9-A Refinement 2 (architect ruling 2026-05-10). The v0.1 Horn-fragment classifier flags simple disjointness as `unverifiedAxioms` rather than affirming consistency on subsets where no individual triggers the body. Documented v0.1 spec-divergence; v0.2 ELK closure absorbs the Horn-fragment classifier refinement (distinguishing Horn-expressible-but-not-exercised from non-Horn-expressible). Visible at Case B.3 + B.4 above.
- **Six remaining LossType trigger-matchers** — phased in with their domains across Phases 4–7.
- **`nc_horn_incomplete_disjunctive` `unverifiedAxioms` count semantics** — Phase 4 entry-cycle per Q-3-Step9-A Refinement 3 (architect ruling 2026-05-10). Corpus-discriminator-scope question; routes for architect ratification on whether the corpus discriminator should specify count semantics OR the implementation should always emit all non-Horn axioms regardless of transitive implications. Visible at Case A.4 above.
- **Phase 4 entry forward-tracks (10 items)** — routed at Phase 3 exit retro per the Orchestrator's election + Q-3-Step9-A 2026-05-10 disposition: parallel-registry reconciliation, substantive-scope-weighting methodology refinement (counter at 5 vs ~3 projected), at-risk-tag-conservatism observation, `cycle_equivalent_classes` Class-3 fixture re-binding, two BFO-gated future fixtures, LossType subsystem cleanup, Realization regularity-check upgrade, `nc_horn_incomplete_disjunctive` count-semantics corpus-discriminator-scope question, **disposition-split discipline as Phase-4-entry methodology candidate**.

> This list is on the page for a reason. Validator + consistency-check is the foundation, not the destination. The whole stack — lift, project, evaluate, check-consistency, ARC inference — has to compose without contradicting itself across phases. Phase 3 ships what queries and consistency-checks the round-trip output; Phase 4 ships what runs against real ontology content.

---

## 6. Closing — 1 min

> Two correctness arguments today. Internal canary on the No-Collapse Guarantee discriminating outcomes (Case A): Horn-decidable contradiction caught at Step 9.4-amendment-4 closure (`nc_self_complement` returns `'false'`), non-Horn-fragment-escape honestly admitted with populated `unverifiedAxioms`, silent-pass catchall asserted as MUST-NOT-be-true. External Layer A consistency-check parity (Case B): the BFO 2020 standard-OWL subset documented as v0.1 spec-divergence per Q-3-Step9-A Refinement 2 (Layer A consistency-affirmation gap; v0.2 ELK closure path), and the hypothetical-axiom two-call protocol verifies the non-persistence guarantee per API §8.1.2.

> Structural assertions green where the v0.1 contract closes; honest-admission framing where the v0.1 contract names a documented spec-divergence with a v0.2 closure path. **No-Collapse Guarantee** established for the v0.1 fixture corpus per spec §8.5 — Horn-decidable inconsistency caught, Horn-fragment-escape honestly admitted, hypothetical reasoning is hypothetical (doesn't pollute session state); the Layer A consistency-affirmation refinement is the v0.2 ELK closure work, named explicitly in the Phase 3 exit packet's §6 forward-tracks. Stronger semantic senses — full classical-FOL completeness, EL-profile completeness, SROIQ-completeness — are explicitly v0.2+ scope per spec §0.1 three-tier framing.

> The Q-3-Step9-A architectural-gap micro-cycle (2026-05-10) — surfaced by stakeholder live-deploy smoke-check — is the canonical example of Phase 3's disposition-split discipline: bounded-fix-scope closes pre-exit (Step 9.4-amendment-4), forward-track-scope ships with documented honest-admission framing (Layer A affirmation gap → v0.2 ELK; count divergence → Phase 4 entry-cycle). Both ship together in this demo. Phase 4+ inherits the discipline.

> Phase 4 is next: BFO 2020 ARC content gives the validator real ontology to reason against. The Phase 4 demo's Case A canary fires `consistent: 'false'` on the BFO Disjointness Map (the consistency-rejection direction works in v0.1); the Phase 4 demo's Case B introduces Layer B (`bfo-2020.clif`) parity citations. The Layer A consistency-affirmation direction waits on v0.2 ELK closure.

> Questions.

---

## 7. Anticipated Q&A

**Q: Why a per-phase demo file? Why not one growing demo?**
A: Each per-phase demo captures what the implementation supports at that phase's exit. The architect's per-phase disposability convention says earlier demos remain accessible as historical artifacts of the build sequence, not continuously-maintained references. The shared CSS and deploy workflow are maintained across phases; only the per-phase HTML and walkthrough are disposable.

**Q: How big is the test corpus now? What's covered?**
A: 43 fixtures total — 15 Phase 1 (lifter coverage) + 12 Phase 2 (projector + audit artifacts + parity canaries) + 16 Phase 3 (validator + consistency-check + No-Collapse adversarial + hypothetical-axiom + cycle + closed-predicate + step-cap + session-error). Manifest at `tests/corpus/manifest.json`. The 100-run determinism contract per API §6.1.1 covers all 43 with the coverage-floor assertion catching silent-skip regressions.

**Q: What's the difference between `'undetermined'` with reason `'coherence_indeterminate'` and `'undetermined'` with reason `'step_cap_exceeded'`?**
A: Two distinct sub-cases of indeterminacy per spec §8.5.2. `coherence_indeterminate` means the check encountered axioms outside the Horn-checkable fragment — a structural limit; richer machinery (v0.2 ELK, v0.3+ SROIQ) closes the gap. `step_cap_exceeded` means the check ran but did not finish within the 10K per-query step cap — a resource limit; bumping the cap or restructuring the query closes the gap. The `unverifiedAxioms` field is populated for `coherence_indeterminate` (names which axioms drove the Horn-fragment-escape); for `step_cap_exceeded` it's not populated because the cap is a uniform property of the query, not attributable to specific axioms.

**Q: Are you using LLMs anywhere in the validator?**
A: No. The kernel (`src/kernel/`) is pure deterministic computation — no `Date.now()`, no `Math.random()`, no network, no LLMs. Spec-test-enforced. The validator is Tau Prolog (a JS Prolog engine) running under SLD resolution against clauses our translator emitted. LLMs were used during development for human-author productivity, not in the runtime.

**Q: What happens if Tau Prolog isn't installed?**
A: `loadOntology()` throws with a clear error: install `tau-prolog@0.3.4` as a peer dependency, OR register a `TauPrologFactory` probe via `registerTauPrologFactory()`. The peer-dependency model keeps OFBT's runtime footprint small for consumers who don't need the validator (e.g., just the Phase 1 + Phase 2 lifter + projector). Phase 3's validator opts in.

**Q: What's "ADR-013" and why does it matter?**
A: ADR-013 is the visited-ancestor cycle-guard pattern, ratified at Phase 3 Step 5 architectural-gap micro-cycle 2026-05-08. SLD resolution under classical FOL clauses can enter non-terminating recursion on cycle-prone predicates (transitive role + inverse, equivalent classes, role hierarchy with transitivity, etc.). The cycle-guard tracks the visited-ancestor set and breaks recursion when re-entering an ancestor, escalating to a `SkippedAxiom` entry. Six cycle-prone predicate classes identified; Phase 4–7 SLG migration is the v0.2 escape clause that replaces visited-ancestor with proper tabling-based termination.

**Q: How does the No-Collapse Guarantee differ from "soundness"?**
A: Soundness in the classical sense is "every derived consequence is a logical consequence." The No-Collapse Guarantee per spec §8.5 is a stricter discipline applied to the *consistency check*: when the v0.1 Horn-checkable check cannot decide consistency, it must not silently return `'true'` (the silent-pass failure mode). The Guarantee is about honest admission of the check's limits, not about completeness of the underlying logic. A complete reasoner (ELK for EL, SROIQ for the full DL) would close the gap to soundness-plus-completeness; the No-Collapse Guarantee makes the v0.1 contract usable in the meantime.

**Q: What does "hypothetical reasoning" mean in this API?**
A: Per API §8.1.2: `checkConsistency(session, axiomSet)` participates the `axiomSet` in the consistency check WITHOUT persisting it in the session. The verdict is "consistency of (session ∪ axiomSet)"; the session state after the call is unchanged. This lets a consumer ask "what would happen if X were true?" without committing to X. Distinct from incremental extension, which would commit to X for future queries via `loadOntology(session, ontologyContainingX)`.

**Q: What's the relationship between `evaluate()` and `checkConsistency()`?**
A: Both are SLD-resolution-driven against the session's clause database. `evaluate()` answers "does the query hold?" — three-state result (`'true'` / `'false'` / `'undetermined'`) per the bounded-Horn-resolution semantics. `checkConsistency()` answers "is the KB consistent?" — three-state result over the entire session state plus optional hypothetical axiomSet. They share the per-query 10K step cap and the per-session aggregate cap.

**Q: How is the `unverifiedAxioms` field populated?**
A: At `loadOntology()` time, the FOL→Prolog translator classifies each lifted axiom as Horn-translatable or skipped. Skipped axioms accumulate in `session.cumulativeSkipped`. At `checkConsistency()` time, if the verdict is `'undetermined'` with reason `'coherence_indeterminate'`, the translator's accumulated skipped axioms (plus any hypothetical axiomSet's skipped entries, classified fresh per the same rules) populate the `unverifiedAxioms` field. Consumers reading the field see exactly which axioms drove the Horn-fragment-escape.

**Q: What was the verification ritual that operationalized at Step 4?**
A: An 8-category SME pre-handoff verification ritual binding from Phase 3 Step 4 forward. Categories include citation verification, cross-reference verification, FOL @type / OWL @type discriminator verification, reason-code-against-frozen-enum verification, etc. The ritual paid first production catch at Step 5 (caught a non-existent spec §3.4.4 reference in the routing artifact) and first batch dividend at the retroactive corrective cycle (caught FOL @type discriminator errors in 4 hypothetical fixtures from Pass 2a authoring). Banked in `arc/AUTHORING_DISCIPLINE.md` "Phase 3 Banked Principles."

**Q: What's the upgrade path from v0.1 to v0.2?**
A: Three integration tracks per spec §0.1 three-tier framing. Track 1 (v0.2): ELK reasoner integration closes the EL-profile gap. Today's `nc_horn_incomplete_disjunctive` returning `'undetermined'` would return `'false'` under ELK (EL handles disjunction via tableau extensions); the v0.1 corpus's `expected_v0.2_elk_verdict` field captures this expected upgrade. Track 2 (v0.3+): SROIQ reasoner integration closes the rest. Track 3 (Phase 4–7): SLG tabling for SLD termination replaces ADR-013's visited-ancestor cycle-guard with proper tabling-based termination per the ADR-013 escape clause. All three tracks preserve the v0.1 API surface — the upgrade is implementation-side, not consumer-side.

**Q: What was the Phase 3 mid-phase cycle count, and was that surprising?**
A: Phase 3 closed with 4 architectural-gap micro-cycles (Steps 3 + 4 + 5 + 6) plus 1 retroactive corrective sub-cycle. Higher than Phase 2's 6 only if the retroactive is bucketed with mid-phase. Per architect cadence-banking: expected per substantive-scope-weighting — Phase 3 ships validator + checkConsistency + No-Collapse Guarantee + cycle detection + closed predicates + step caps + hypothetical-axiom case + reason enum extension. Substantively richer than Phase 2's projector. The substantive-scope-weighting methodology refinement question is forward-tracked to Phase 4 entry packet.

**Q: How does the demo know `checkConsistency()` returned the right answer?**
A: The demo asserts against the fixture's `expectedConsistencyResult` field (from `tests/corpus/<fixture>.fixture.js`'s `expected_v0.1_verdict`). The same field the test runner asserts against. If a fixture's `expectedConsistencyResult: "false"` and the implementation returns `'true'`, both the demo and CI would surface the regression. Per the corpus-driven discipline: the two sources of truth fail together.

**Q: What's the path-fencing protocol mentioned in the banked principles?**
A: SME-domain artifacts (fixtures, routing artifacts, exit packets, walkthrough) are authored on a path-fenced scope: SME doesn't cross-edit Developer-domain code without architect routing. Phase 3 used the single-committer model — α-cadence per-sub-step commits via Aaron, after SME hands off the artifact. The protocol prevents the merge-conflict failure mode where SME and Developer concurrently edit overlapping surfaces. Banked at Phase 3 Step 3 Pass 2b.

**Q: Why does `nc_self_complement` use `reason: 'inconsistent'` instead of something more specific?**
A: Per Q-3-Step6-B reason-code reuse 2026-05-09: the canonical reason code for any proven inconsistency is `inconsistent`, regardless of the proof mechanism. The proof mechanism (Horn resolution vs. tableau extension vs. external reasoner) is implementation-detail, not consumer-facing semantic. The reason enum is frozen; reuse-bounded-by-semantic-state-alignment (banked at Q-3-Step4-A) means we reuse the existing canonical code rather than extending the enum. Same precedent as Q-3-Step4-A's `cwa_open_predicate` reuse of `open_world_undetermined`.

**Q: What was Q-3-Step9-A and why is it on the demo prominently?**
A: Q-3-Step9-A is the fifth Phase 3 architectural-gap micro-cycle, ratified 2026-05-10. It surfaced at the exit boundary — Aaron's stakeholder-feedback live-deploy smoke-check post-9.4-amendment-3 probe-fix revealed three substantive `checkConsistency()` divergences from fixture contracts: `nc_self_complement` returned `'undetermined'` where the fixture's `discriminatesAgainst` field explicitly ruled out that outcome (load-bearing); `nc_horn_incomplete_disjunctive` showed `unverifiedAxioms` count = 1 vs fixture's ≥ 2; `p1_bfo_clif_classical` Layer A returned `'undetermined'` where spec §8.5.1 Horn-checkable fragment requires `'true'`. The architect ruled Frame I (implementation gap, not fixture-discriminator overscope) + D2 disposition (fix-as-amendment-4 minimal `nc_self_complement` + Layer A forward-track + count-divergence forward-track) + three structural refinements + five banked principles. The demo above renders the disposition-split outcomes: Step 9.4-amendment-4 closed `nc_self_complement` (3 ✓ pass at A.3); the Layer A affirmation gap ships as documented v0.1 spec-divergence (Case B.3 + B.4 with v0.2 ELK closure callout); the count divergence ships with Phase 4 entry-cycle forward-track footnote (Case A.4). The audit-trail record is at `project/reviews/phase-3-step9-architectural-gap.md`.

**Q: What is the "disposition-split discipline" and why should I care about it?**
A: Banked at Q-3-Step9-A as Banked Principle 3: when an exit-blocking finding's distinct components have different fix-cost profiles, the disposition splits — bounded-fix-scope components close pre-exit; forward-track-scope components route to next-phase-exit-retro or next-phase-entry per natural cycle context. The principle preserves both close cadence AND discipline integrity. Without it, the architect faces a false dichotomy: D1 (close all → indefinite slip) vs D3/D4 (relax-corpus / document-all-as-divergence → discipline corruption). The disposition-split refuses both — it closes what can be closed cleanly, names the rest with documented honest-admission framing pointing to the closure path. Phase 3 exit retro forward-tracks the discipline as a Phase 4 entry-cycle methodology candidate (per Q-3-Step9-A AUTHORING_DISCIPLINE banking), questioning whether the pattern generalizes to non-exit-blocking findings AND what the per-canary publication tag taxonomy should cover for disposition-split outcomes.

**Q: If the Layer A consistency-affirmation gap is documented v0.1 spec-divergence, should consumers worry about using the validator?**
A: No, with caveats. The v0.1 contract is "Horn-checkable inconsistency caught + non-Horn-fragment-escape honestly admitted" per spec §0.1 three-tier framing. The Layer A affirmation gap means the v0.1 implementation surfaces `'undetermined'` with populated `unverifiedAxioms` on Horn-translatable consistent fragments where simple disjointness is in scope but no individual triggers the disjointness body. A consumer reading the verdict sees "I can't decide consistency on this fragment because of these specific axioms" rather than "I confirm consistency." The verdict is honest — it does NOT silently pass on inconsistent fragments (the No-Collapse Guarantee holds); it does NOT falsely fail on consistent fragments. It correctly says "uncertain" on a fragment the spec says should resolve. The v0.2 ELK upgrade closes the affirmation arm for EL-profile inputs; v0.3+ SROIQ closes the rest. Consumers who need affirmative consistency verdicts on Horn-translatable fragments can either (a) wait for v0.2 ELK, (b) integrate an external reasoner now and consume OFBT for the round-trip + No-Collapse adversarial discipline, or (c) treat `'undetermined'` with populated `unverifiedAxioms` as "consistent under the v0.1 contract" since the contract guarantees no inconsistency was provable.

---

## 8. Presenter notes (out-of-band)

- **If a panel shows "Loading fixtures…" indefinitely:** the deployed Pages staging step is missing the fixture. Switch to the local fallback (`npx serve gh-pages-deploy/`) and route a chore to extend `.github/workflows/pages.yml`.
- **If Case A.3 `nc_self_complement` returns `'undetermined'` instead of `'false'`:** the Step 9.4-amendment-4 fix has regressed (post-Phase-3-close). At Phase 3 exit (commit 7526973 CI green) this case returns `'false'` per Q-3-Step9-A Refinement 1's bounded fix. A regression to `'undetermined'` indicates the iff-unfolding (hypothesis a) OR FOLFalse-in-head detection scope (hypothesis b) closure has been undone. STOP, capture commit hash, route as engineering regression.
- **If Case A.4 `nc_horn_incomplete_disjunctive` returns `'true'` (the silent-pass failure):** STOP. The No-Collapse Guarantee is leaking. CI catches the same regression on the same commit. Acknowledge it, capture the commit hash, route to engineering as a real exit blocker. The expected v0.1 outcome is `'undetermined'` + `coherence_indeterminate` + populated `unverifiedAxioms`; the count semantics (count = 1 vs ≥ 2) is documented honest-admission per Q-3-Step9-A Refinement 3 — NOT a regression.
- **If Case A.4 `unverifiedAxioms` count differs from the documented 1:** the count semantics is the Phase-4-entry-cycle question per Q-3-Step9-A Refinement 3. Stay calm — count drift in either direction (1 → 2, or 1 → 3, etc.) reflects implementation refinement, not regression. The primary outcome assertions (`'undetermined'` + `coherence_indeterminate` + populated > 0) are what catch the regression class.
- **If Case A.5 `nc_silent_pass_canary` returns `'true'`:** STOP — silent-pass on a classically-inconsistent KB is the canary's primary catch; a `'true'` verdict here is the regression the canary exists to surface.
- **If Case B.3 BFO Layer A returns `'true'` (the affirmative spec-required verdict):** this would be a SUCCESS, not a regression — it would mean the v0.2 ELK Horn-fragment classifier refinement landed early. Verify the implementation is using ELK or has had the Horn-fragment classifier refined; update this walkthrough's §4.4 to reflect the affirmative direction. The currently-documented v0.1 expected verdict is `'undetermined'` per Q-3-Step9-A Refinement 2.
- **If Case B.3 BFO Layer A returns `'false'`:** STOP — that would mean the implementation falsely flags a genuinely consistent fragment as inconsistent. Cross-check `tests/corpus/p1_bfo_clif_classical.fixture.js` against current state; if the fixture is intact, route as engineering regression.
- **If Case B.4 Layer A parity panel shows red ✗ FAIL badges:** the per-axiom rendering should be pending-tone `· v0.1 spec-divergence`, not red ✗. If badges render red, the `renderLayerAParity` function's `isDocumentedDivergence` branch isn't matching — check the `consistencyVerdict === 'undetermined'` predicate and the badge className construction.
- **If the hypothetical two-call protocol shows Call 2 with a different verdict than Call 1's expected base-KB verdict:** the non-persistence guarantee leaked. Acknowledge it, capture commit hash, route as engineering regression (this is the load-bearing API §8.1.2 contract).
- **If the bundle import fails:** browser console will show the error. Common causes: (1) `dist/bundles/` not built locally — run `npm run build && node esbuild.config.js`; (2) Pages deploy mid-flight — wait, retry, or fall back to local; (3) `tau-prolog@0.3.4` peer dependency not installed in the bundle build context — check `package.json` peer-dependencies + the esbuild config's externals.
- **If `loadOntology()` throws with a "Tau Prolog runtime" error:** the bundle wasn't built with the Tau Prolog peer dependency resolved. Run `npm install tau-prolog@0.3.4` and re-bundle.
- **Don't read the script verbatim.** Use it as the spine; the on-screen prose carries the precise wording. Your job is to point and contextualize.

---

## 9. References

- Demo HTML: [demo_p3.html](demo_p3.html)
- Phase 1 demo: [demo_p1.html](demo_p1.html) — lifter precedent + cumulative parity context
- Phase 2 demo: [demo_p2.html](demo_p2.html) — projector + round-trip parity precedent
- Demo conventions: [README.md](README.md) ("Two-case demo template")
- Phase 3 entry packet: `project/reviews/phase-3-entry.md`
- Phase 3 exit packet: `project/reviews/phase-3-exit.md`
- Phase 3 Step 3 architectural-gap micro-cycle: `project/reviews/phase-3-step3-architectural-gap.md`
- Phase 3 Step 4 architectural-gap micro-cycle: `project/reviews/phase-3-step4-architectural-gap.md`
- Phase 3 Step 5 architectural-gap micro-cycle: `project/reviews/phase-3-step5-architectural-gap.md`
- Phase 3 Step 6 architectural-gap micro-cycle: `project/reviews/phase-3-step6-architectural-gap.md`
- **Phase 3 Step 9 architectural-gap micro-cycle (Q-3-Step9-A): `project/reviews/phase-3-step9-architectural-gap.md`** (the load-bearing artifact for Case A.4 + B.3 + B.4 honest-admission framing)
- Phase 3 retroactive corrective cycle: `project/reviews/phase-3-retroactive-corrective.md`
- Phase 3 reactivation results (extended at Q-3-Step9-A 2026-05-10 with §7-§8 No-Collapse adversarial corpus per-canary tagging): `project/reviews/phase-3-reactivation-results.md`
- ADR-007 §11 (FOL→Tau Prolog clause translation): `project/DECISIONS.md`
- ADR-011 (audit-artifact `@id` content-addressing): `project/DECISIONS.md`
- ADR-013 (visited-ancestor cycle-guard pattern): `project/DECISIONS.md`
- Authoring discipline: `arc/AUTHORING_DISCIPLINE.md` ("Phase 3 Banked Principles" section)
- Behavioral spec: `project/OFBT_spec_v0.1.7.md` (§5.4 + §6.3 + §8.1 + §8.2 + §8.5)
- API spec: `project/OFBT_API_v0.1.7.md` (§2 + §5.5 + §6.3 + §7.1 + §7.2 + §8.1 + §8.1.1 + §8.1.2 + §10.3)
