# Phase 3 Demo — Stakeholder Presentation Script

Speaker script for live-presenting [demo_p3.html](demo_p3.html). Companion to (not replacement for) the demo's on-screen prose.

**Audience:** technically-literate stakeholders (eng leadership, partner engineers, ontology consumers, logic-stakeholders). No prior OFBT knowledge assumed; comfort with "OWL," "FOL," "consistency," and "Horn fragment" as words is sufficient.

**Run-time budget:** 15–20 minutes presentation + Q&A (Case A 8 min including A.7 hypothetical sub-case, framing/closing/deferred 6–10 min). Single-argument structure post-Q-Frank-Step9-A corrective ruling 2026-05-10 — Case B (Layer A consistency-check parity) was pulled because the v0.1 implementation does not yet satisfy spec §8.5.1's required affirmative verdict on the canonical positive control; the Layer A closure path is forward-tracked via [`project/v0.2-roadmap.md`](../project/v0.2-roadmap.md), not via soft demo framing.

**Per-phase disposability:** mirrors `demo_p3.html`'s lifecycle. Phase 4 exit retires this script and ships `p4-walkthrough.md`.

---

## 0. Pre-flight checklist (presenter, before audience joins)

- [ ] Pick venue: deployed Pages URL **or** local `npx serve gh-pages-deploy/`. Deployed is the honest default; local is the fallback if Pages deploy is mid-flight.
- [ ] Open `demo_p3.html` in a clean browser tab. Scroll once top-to-bottom to confirm all four fixtures load (Case A 3-fixture panel + A.7 hypothetical-axiom sub-case panel show JSON, not "Loading fixtures…").
- [ ] DevTools console **closed** for the talk; opened only if a panel misbehaves.
- [ ] Have [demo_p2.html](demo_p2.html) reachable in a second tab — useful if anyone asks "how does this build on the round-trip story?"
- [ ] Backup: screenshots of expected Case A (3 fixtures × 3 verdicts) + A.7 hypothetical two-call output in case the live demo fails (network, bundle import, fixture 404).
- [ ] Know the most recent commit hash on `origin/main` — useful for grounding "this is what's running right now."
- [ ] Pre-run the demo once locally before the talk. **Expected post-Phase-3-close state:** Case A.3 = 3 ✓ pass (post-amendment-4); Case A.4 = 3 ✓ pass (count assertion now matches the amended fixture's `expectedUnverifiedAxiomsMinCount: 1` per Q-Frank-Step9-A Ask 2 ruling 2026-05-10); Case A.5 = 3 ✓ pass (one rendered as `· info` "✓ ok" for the acceptable-verdicts info row); Case A.6 = 3 ✓ pass + discrimination-matrix-verdict callout; A.7 = 3 ✓ pass on the hypothetical-axiom two-call non-persistence protocol. If anything diverges from this, see §7 presenter notes for the failure-mode response protocol.
- [ ] **Be ready to acknowledge Frank's critique honestly if asked.** Stakeholders familiar with the project may ask why Case B isn't here. The answer is direct: Frank's stakeholder critique 2026-05-10 surfaced that the v0.1 implementation's Horn-fragment classifier does not yet affirm consistency on Horn-translatable subsets where simple disjointness is in scope but no individual triggers the body. The architect's corrective ruling pulled Case B from the demo (banked principle: demos do not claim what the implementation cannot demonstrate). The Layer A closure path is in [`project/v0.2-roadmap.md`](../project/v0.2-roadmap.md). Phase 4's demo will exercise the consistency-rejection direction (BFO Disjointness Map firing `consistent: 'false'`); the consistency-affirmation direction waits on v0.2 ELK.

If any panel shows "Loading fixtures…" indefinitely, the GitHub Pages staging step is missing the fixture file. Stop, switch to the local-served fallback, and route a chore to extend `.github/workflows/pages.yml`.

---

## 1. Opening + framing — 2 min

**Screen:** demo_p3.html, top of page (header + "The case" section visible).

> Phase 1 shipped the lifter — OWL up to FOL. Phase 2 shipped the projector and closed the round-trip — FOL back down to OWL with audit artifacts for whatever exceeded OWL 2 DL expressivity. Phase 3, today, ships the **validator**: `evaluate()`, `checkConsistency()`, the No-Collapse Guarantee, and the honest-admission surface for the limits of the v0.1 Horn-checkable check.

> The point of bidirectional translation is interoperability. The point of the validator is making the translator **trustable**: we need a way to ask "is this knowledge base consistent?" and trust the answer — including the answer "I don't know, here's exactly which axioms I couldn't decide."

**Action:** scroll to "The case" section.

> One argument today, narrowly scoped. Internal canary discipline against the No-Collapse Guarantee: three adversarial fixtures exercise the three discriminating outcomes of `checkConsistency()`. A Horn-decidable contradiction must be caught (`'false'`); a non-Horn contradiction must be honestly admitted (`'undetermined'` with the offending axioms surfaced); a catchall silent-pass adversary must NOT return `'true'`. Plus a separate sub-case (A.7) verifying the hypothetical-axiom non-persistence guarantee per API §8.1.2.

> What this demo does **not** claim. Earlier drafts of the Phase 3 demo included a Case B — "Layer A consistency-check parity" — that loaded the BFO 2020 standard-OWL subset and asserted consistency-affirmation against the canonical CLIF axiomatization. That case was pulled at the architect's corrective ruling 2026-05-10 in response to Frank's stakeholder critique. The reason was direct: the v0.1 implementation does not yet satisfy spec §8.5.1's required affirmative verdict on the canonical positive control. The fixture is consistent; the implementation flags simple disjointness as `unverifiedAxioms` rather than affirming consistency on subsets where no individual triggers the body. Per the banked principle that demos do not claim what the implementation cannot demonstrate, Case B was pulled rather than soft-framed. The Layer A closure path is in [`project/v0.2-roadmap.md`](../project/v0.2-roadmap.md).

**Anticipated:** *What's the Horn fragment?* → A decidable subset of FOL. SLD resolution (Prolog-style backward chaining) is sound and complete on Horn clauses; outside the fragment, things like disjunction in the consequent of an implication require richer machinery (tableau reasoning, case analysis). The v0.1 contract is "honest about Horn limits, not silent about them."

**Anticipated:** *Why was Case B pulled — what changed?* → Frank's logic-stakeholder critique 2026-05-10 (preserved at [`demo/Phase3DemoCritique.md`](Phase3DemoCritique.md)) flagged the original demo's "documented v0.1 spec-divergence" framing as procedural language papering over a real gap. The architect issued a corrective ruling: Case B was authored asserting the v0.1 actual `'undetermined'` verdict against a fixture that requires `'true'` per the spec; that's the implementation failing a specification requirement on a canonical positive control, not a "documented divergence." Pulling the case is the architecturally-correct response — it honors the spec without amending it, honors the corpus-as-contract discipline, and avoids the soft-language-of-schedule-pressure pattern. The closure path is the v0.2 ELK refinement of the Horn-fragment classifier.

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

> The Horn-checkable fragment per spec §8.5.1 explicitly excludes "arbitrary disjunctive class expressions" — `ObjectUnionOf` in the consequent of `SubClassOf` is the canonical non-Horn shape. The v0.1 check honestly admits this rather than silently passing or falsely failing. The disjointness `DisjointWith(A, D)` itself is Horn-expressible (its FOL translation `∀x. A(x) ∧ D(x) → False` is a Horn clause); only the disjunctive-consequent SubClassOf is non-Horn.

> Three assertions verify the honest-admission surface:
>
> - `consistent === 'undetermined'` — the non-Horn fragment was surfaced, not silently passed. **Pass.**
> - `reason === 'coherence_indeterminate'` — Horn-fragment-escape, not a step-cap exhaustion. **Pass.**
> - `unverifiedAxioms` populated with at least 1 entry — the canary's primary honest-admission contract. **Pass.** The implementation surfaces the disjunctive-consequent SubClassOf (the proximate non-Horn axiom). The fixture's `expectedUnverifiedAxiomsMinCount` was originally `2` but was amended to `1` at the Q-Frank-Step9-A corrective ruling 2026-05-10 because the implementation is correct on the merits — the disjointness is Horn-expressible and not part of the non-Horn-fragment-escape; only the disjunctive axiom is.

> The populated-`unverifiedAxioms` assertion is the load-bearing one for the honest-admission discipline per spec §8.5.5 plus API §8.1.1. A consumer seeing `'undetermined'` without populated `unverifiedAxioms` is told "I can't decide" without being told **why** — that's a discipline violation. The populated field names which axioms drove the indeterminacy.

**Anticipated:** *Why was the fixture amended rather than the implementation fixed?* → Per Q-Frank-Step9-A Ask 2 architect ruling 2026-05-10: the implementation is correct on the merits. The non-Horn shape is `SubClassOf(A, ObjectUnionOf(B, C))` — that axiom alone is what the Horn-checkable fragment cannot express; the disjointness is Horn-expressible per spec §8.5.1; the indeterminacy arises from the case-analysis the disjunctive consequent forces, not from the disjointness itself. Surfacing both axioms in `unverifiedAxioms` would conflate "this axiom is non-Horn" with "this axiom transitively contributes to indeterminacy." The former is the load-bearing claim per API §8.1.1; the latter is a derived property downstream tooling can compute. The fixture's earlier `expectedUnverifiedAxiomsMinCount: 2` over-specified; the corrective action was to amend the fixture's discriminator. (The architect's earlier "forward-track to Phase 4 entry-cycle" framing was withdrawn at the corrective ruling — Frank's §4.1 critique correctly pointed out that forward-tracking the choice ships mutually inconsistent fixtures and code.)

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

### 3.8 Hypothetical-axiom non-persistence sub-case (A.7) — 2 min

**Screen:** A.7 hypothetical-axiom panel + "Why the two-call protocol is load-bearing" callout.

> The hypothetical-axiom case per API §8.1.2 is the surface that distinguishes hypothetical reasoning from incremental extension. `checkConsistency(session, axiomSet)` participates the `axiomSet` in the consistency check WITHOUT persisting it in the session. A subsequent `checkConsistency(session)` call must see only the original session state. This sub-case was originally B.5 in earlier drafts of the demo; it relocated under Case A as A.7 at the Q-Frank-Step9-A corrective ruling 2026-05-10 because the non-persistence guarantee is genuine Phase 3 content unrelated to the (pulled) Layer A consistency-check parity case.

> The fixture exercised here is `hypothetical_clean` — a clean (consistent) hypothetical extension. Base KB: `Person(alice)` plus `Mother ⊑ Person`. Hypothetical: `Mother(alice)` — narrows alice's membership without contradiction.

**Action:** click **"Run two-call hypothetical protocol"**.

> Two calls, same session. Call 1 with the hypothetical axiomSet. Call 2 without.

**Screen:** A.7 result panel populated.

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

## 4. What's deferred — 2 min

**Screen:** "What Phase 3 does NOT yet do" section.

> Honest scope. What Phase 3 doesn't yet do:

- **BFO 2020 core ARC module + BFO Disjointness Map** — Phase 4. Today's Layer A consistency-check uses the standard-OWL subset only. The Phase 4 demo's Case A canary fires `consistent: 'false'` on Continuant ⊓ Occurrent and introduces Layer B (`bfo-2020.clif`) parity citations.
- **IAO information-bridge ARC module** — Phase 5.
- **CCO realizable-holding + mereotopology + measurement + aggregate + organizational + deontic** — Phase 6 per ADR-009 six-CCO-module expansion.
- **OFI deontic + compatibility shim + bundle budget enforcement + coverage matrix CI** — Phase 7 per ADR-008 Option A (OFI deontic deferred to v0.2 inside Phase 7's compat-shim landing).
- **Per-class Skolem-witness satisfiability refinement** — forward-tracked beyond Step 6+ minimum. Phase 3 handles `FOLFalse`-in-head inconsistency proofs (sufficient for the lifted form of `DisjointClasses` / `DisjointWith` contradictions); deeper Skolem-driven satisfiability checks for arbitrary unsatisfiable class expressions are a future cycle.
- **Regularity-check upgrade** — Phase 4 entry packet activates `regularityCheck(A, importClosure)` against loaded ARC modules' import closure; clears the Phase 2 `regularity_scope_warning` for regularity-confirmed chains.
- **External reasoner integration (ELK / SROIQ)** — v0.2+ per spec §0.1 three-tier framing escape clause. Phase 3's v0.1 contract is Horn-checkable + honest-admission of Horn-fragment-escape; v0.2 ELK closes the EL-profile gap and v0.3+ SROIQ closes the rest. Closure commitments consolidated in [`project/v0.2-roadmap.md`](../project/v0.2-roadmap.md).
- **Layer A consistency-affirmation gap** — v0.2 ELK closure per [`project/v0.2-roadmap.md`](../project/v0.2-roadmap.md). The v0.1 Horn-fragment classifier flags simple disjointness as `unverifiedAxioms` rather than affirming consistency on subsets where no individual triggers the body. Per the Q-Frank-Step9-A corrective ruling 2026-05-10, Case B was pulled from this demo (banked principle: demos do not claim what the implementation cannot demonstrate); the closure path is the v0.2 ELK refinement of the Horn-fragment classifier (distinguishing Horn-expressible-but-not-exercised from non-Horn-expressible). Phase 4's demo will exercise the consistency-rejection direction (BFO Disjointness Map firing `consistent: 'false'`); the consistency-affirmation direction waits on v0.2.
- **Six remaining LossType trigger-matchers** — phased in with their domains across Phases 4–7.
- **Case C — Lossy round-trip demonstration** — Phase 4 exit deliverable per Q-Frank-Step9-A Ask 4 (architect ruling 2026-05-10). The Annotated Approximation strategy + Loss Signature ledger + Recovery Payload artifacts have been shipping since Phase 2 but have never been demonstrated in a per-phase demo. Three-cycle drift on Frank's repeated request triggered the explicit deliverable commitment: Phase 4 entry packet's deliverable list names Case C as a Phase 4 exit deliverable, not a forward-track.
- **Phase 4 entry forward-tracks** — routed at Phase 3 exit retro + Q-Frank-Step9-A corrective ruling 2026-05-10: parallel-registry reconciliation, substantive-scope-weighting methodology refinement (counter at 5 vs ~3 projected), at-risk-tag-conservatism observation, `cycle_equivalent_classes` Class-3 fixture re-binding, two BFO-gated future fixtures, LossType subsystem cleanup, Realization regularity-check upgrade, Phase 2 reactivation surface as Phase 4 demo opening (cumulative-discipline-credibility), purpose-built Layer A consistency-check parity fixture question, banking-correction discipline retro analysis. **NOT inherited:** the disposition-split discipline (withdrawn per Q-Frank-Step9-A Ask 5 — banked principle: disciplines invented in response to specific findings do not get banked as architectural-commitment-tier methodology in the same cycle).

> This list is on the page for a reason. Validator + consistency-check is the foundation, not the destination. The whole stack — lift, project, evaluate, check-consistency, ARC inference — has to compose without contradicting itself across phases. Phase 3 ships what queries and consistency-checks the round-trip output; Phase 4 ships what runs against real ontology content.

---

## 5. Closing — 1 min

> One correctness argument today, narrowly scoped. Internal canary on the No-Collapse Guarantee discriminating outcomes: Horn-decidable contradiction caught at Step 9.4-amendment-4 closure (`nc_self_complement` returns `'false'`), non-Horn-fragment-escape honestly admitted with populated `unverifiedAxioms`, silent-pass catchall asserted as MUST-NOT-be-true. The hypothetical-axiom two-call protocol (A.7) verifies the non-persistence guarantee per API §8.1.2.

> What this demo does **not** claim. Earlier drafts included a Case B for Layer A consistency-check parity. That case was pulled at the architect's Q-Frank-Step9-A corrective ruling 2026-05-10 in response to Frank's stakeholder critique, because the v0.1 implementation does not yet satisfy spec §8.5.1's required affirmative verdict on the canonical positive control. The Layer A closure path is in [`project/v0.2-roadmap.md`](../project/v0.2-roadmap.md). The banked principle: demos do not claim what the implementation cannot demonstrate; pulling the case is preferable to soft-language framing that papers over a real gap.

> **No-Collapse Guarantee** established for the engineered adversarial corpus per spec §8.5 — Horn-decidable inconsistency caught, Horn-fragment-escape honestly admitted, hypothetical reasoning is hypothetical (doesn't pollute session state). Stronger semantic senses — full classical-FOL completeness, EL-profile completeness, SROIQ-completeness — are explicitly v0.2+ scope per spec §0.1 three-tier framing. The Layer A consistency-affirmation refinement is named v0.2 ELK closure work, with scope/owner/timeline tracked in `project/v0.2-roadmap.md`.

> The Q-Frank-Step9-A corrective ruling (2026-05-10) is the cycle Frank's stakeholder critique produced. The architect issued three banking withdrawals + seven new bankings + one meta-banking, including: pulling Case B from this demo, amending the disjunctive fixture's count discriminator on the merits, promoting ADR-007 §10 to Accepted, committing Case C to Phase 4 as exit deliverable, withdrawing the disposition-split discipline as banked principle, and authoring the consolidated `project/v0.2-roadmap.md`. The architectural-commitment surface is preserved through clean revision when prior rulings were structurally incorrect — that's the discipline this project commits to. Frank's letter banked as canonical exemplar of the post-hoc-discipline-canonization risk pattern.

> Phase 4 is next: BFO 2020 ARC content gives the validator real ontology to reason against. Phase 4's demo will fire `consistent: 'false'` on the BFO Disjointness Map (the consistency-rejection direction works in v0.1); Phase 4 introduces Layer B (`bfo-2020.clif`) parity citations and ships Case C — Lossy round-trip — as a Phase 4 exit deliverable. The Layer A consistency-affirmation direction waits on v0.2 ELK closure.

> Questions.

---

## 6. Anticipated Q&A

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

**Q: What was Q-3-Step9-A, and what changed at Q-Frank-Step9-A on 2026-05-10?**
A: Q-3-Step9-A was the fifth Phase 3 architectural-gap micro-cycle, ratified 2026-05-10. It surfaced at the exit boundary — Aaron's stakeholder-feedback live-deploy smoke-check post-9.4-amendment-3 probe-fix revealed three substantive `checkConsistency()` divergences from fixture contracts: `nc_self_complement` returned `'undetermined'` where the fixture's `discriminatesAgainst` field explicitly ruled out that outcome; `nc_horn_incomplete_disjunctive` showed `unverifiedAxioms` count = 1 vs fixture's ≥ 2; `p1_bfo_clif_classical` Layer A returned `'undetermined'` where spec §8.5.1 Horn-checkable fragment requires `'true'`. The architect's original ruling was Frame I (implementation gap, not fixture-discriminator overscope) + D2 disposition (fix-as-amendment-4 minimal `nc_self_complement` + Layer A forward-track + count-divergence forward-track) + three structural refinements. **Frank's stakeholder critique 2026-05-10** ([`demo/Phase3DemoCritique.md`](Phase3DemoCritique.md)) flagged that the Layer A "documented v0.1 spec-divergence" framing was procedural language papering over a real gap; that the just-invented "disposition-split discipline" was a post-hoc rationalization being canonized in the same cycle as its founding case; and that the count-divergence forward-tracking shipped mutually inconsistent fixtures and code. The architect issued the **Q-Frank-Step9-A corrective ruling** same day: pull Case B entirely (banked principle: demos do not claim what the implementation cannot demonstrate), amend the count discriminator on the merits (the implementation is correct; fixture over-specified), promote ADR-007 §10 to Accepted (three demo cycles is enough), commit Case C to Phase 4 as exit deliverable (three-cycle drift on Frank's flag is sufficient evidence), withdraw the disposition-split discipline as banked principle (disciplines tested only against their founding case are rationalizations, not disciplines), author consolidated `project/v0.2-roadmap.md` (consolidate every "v0.2 ELK closes that" commitment with scope/owner/timeline). The audit-trail record is at `project/reviews/phase-3-step9-architectural-gap.md` with the Q-Frank-Step9-A corrective overlay.

**Q: Why was the disposition-split discipline withdrawn?**
A: Frank's three-question framing surfaced the structural concern. **Question 1:** Did the discipline exist before Q-3-Step9-A? No — invented in response to it. **Question 2:** What's the test for in-scope vs out-of-scope? "The architect rules" — procedural, not principled. **Question 3:** Will the discipline ever produce a "v0.1 blocker, period, ship is delayed" outcome? The discipline as banked had no exclusion criterion. Without principled answers to all three, the discipline absorbs anything because it is designed to absorb — structurally a schedule-protection mechanism, not a quality-protection mechanism. The architect's ruling: disciplines invented in response to specific findings do not get banked as architectural-commitment-tier methodology in the same cycle; banking requires the discipline to have been tested against at least one independent case; pre-banking would canonize rationalization. The Q-3-Step9-A resolution stands as case-specific reasoning (the `nc_self_complement` arm closed pre-exit; the Layer A arm pulled from demo); the corresponding "discipline" is not banked. The Phase 4 entry-cycle methodology-candidate forward-track is also withdrawn.

**Q: If the Layer A consistency-affirmation gap exists, should consumers worry about using the validator?**
A: No, with caveats. The v0.1 contract is "Horn-checkable inconsistency caught + non-Horn-fragment-escape honestly admitted" per spec §0.1 three-tier framing. The Layer A affirmation gap means the v0.1 implementation surfaces `'undetermined'` with populated `unverifiedAxioms` on Horn-translatable consistent fragments where simple disjointness is in scope but no individual triggers the disjointness body. A consumer reading the verdict sees "I can't decide consistency on this fragment because of these specific axioms" rather than "I confirm consistency." The verdict is honest — it does NOT silently pass on inconsistent fragments (the No-Collapse Guarantee holds); it does NOT falsely fail on consistent fragments. It correctly says "uncertain" on a fragment the spec says should resolve. The v0.2 ELK upgrade closes the affirmation arm for EL-profile inputs; v0.3+ SROIQ closes the rest. The closure commitment with scope/owner/timeline is in [`project/v0.2-roadmap.md`](../project/v0.2-roadmap.md). Consumers who need affirmative consistency verdicts on Horn-translatable fragments can either (a) wait for v0.2 ELK, (b) integrate an external reasoner now and consume OFBT for the round-trip + No-Collapse adversarial discipline, or (c) treat `'undetermined'` with populated `unverifiedAxioms` as "consistent under the v0.1 contract" since the contract guarantees no inconsistency was provable.

**Q: Why is Frank's critique referenced so prominently? Is there a process for stakeholder pushback?**
A: Yes. The architect's discipline includes responding to logic-stakeholder review cycles with banking corrections when the critique surfaces concerns that hold on the merits. Frank's Phase 2 letter resulted in the Q-Frank-1..6 ruling cycle 2026-05-07 that banked the per-canary publication discipline, the structural-vs-semantic distinction, and the Annotated Approximation Case C requirement. Frank's Phase 3 letter resulted in the Q-Frank-Step9-A corrective ruling 2026-05-10 with three banking withdrawals + seven new bankings + one meta-banking. The architectural-commitment surface is preserved through clean revision when prior rulings were structurally incorrect — that's the project's banking-correction discipline. Frank's letter at [`demo/Phase3DemoCritique.md`](Phase3DemoCritique.md) is banked as canonical exemplar of the post-hoc-discipline-canonization risk pattern; future cycles facing pressure to bank disciplines invented in response to specific findings reference the letter as the cautionary lens.

---

## 7. Presenter notes (out-of-band)

- **If a panel shows "Loading fixtures…" indefinitely:** the deployed Pages staging step is missing the fixture. Switch to the local fallback (`npx serve gh-pages-deploy/`) and route a chore to extend `.github/workflows/pages.yml`.
- **If Case A.3 `nc_self_complement` returns `'undetermined'` instead of `'false'`:** the Step 9.4-amendment-4 fix has regressed (post-Phase-3-close). At Phase 3 exit (commit 7526973 CI green) this case returns `'false'` per Q-3-Step9-A Refinement 1's bounded fix. A regression to `'undetermined'` indicates the iff-unfolding (hypothesis a) OR FOLFalse-in-head detection scope (hypothesis b) closure has been undone. STOP, capture commit hash, route as engineering regression.
- **If Case A.4 `nc_horn_incomplete_disjunctive` returns `'true'` (the silent-pass failure):** STOP. The No-Collapse Guarantee is leaking. CI catches the same regression on the same commit. Acknowledge it, capture the commit hash, route to engineering as a real exit blocker.
- **If Case A.4 `unverifiedAxioms` count differs from the documented 1:** post-Q-Frank-Step9-A Ask 2 (2026-05-10), the fixture's `expectedUnverifiedAxiomsMinCount: 1` matches the implementation's emit-only-non-Horn-axioms semantics. A drift to count = 2 or more would indicate the implementation now surfaces transitively-implicating axioms (e.g., the disjointness in addition to the disjunctive SubClassOf); that's a behavior change requiring re-routing through architect ratification, not a regression in itself. A drift to count = 0 is a regression — `'undetermined'` without populated `unverifiedAxioms` violates spec §8.5.5 honest-admission.
- **If Case A.5 `nc_silent_pass_canary` returns `'true'`:** STOP — silent-pass on a classically-inconsistent KB is the canary's primary catch; a `'true'` verdict here is the regression the canary exists to surface.
- **If A.7 hypothetical two-call protocol shows Call 2 with a different verdict than Call 1's expected base-KB verdict:** the non-persistence guarantee leaked. Acknowledge it, capture commit hash, route as engineering regression (this is the load-bearing API §8.1.2 contract).
- **If a stakeholder asks why Case B is missing:** acknowledge it directly. Frank's stakeholder critique 2026-05-10 (preserved at `demo/Phase3DemoCritique.md`) flagged the original Case B's "documented v0.1 spec-divergence" framing as procedural language papering over a real gap; the architect's Q-Frank-Step9-A corrective ruling pulled Case B because the v0.1 implementation does not yet satisfy spec §8.5.1's required affirmative verdict on the canonical positive control. Banked principle: demos do not claim what the implementation cannot demonstrate. The Layer A closure path is in `project/v0.2-roadmap.md`. Phase 4's demo will exercise the consistency-rejection direction (BFO Disjointness Map firing `consistent: 'false'`); the consistency-affirmation direction waits on v0.2 ELK.
- **If the bundle import fails:** browser console will show the error. Common causes: (1) `dist/bundles/` not built locally — run `npm run build && node esbuild.config.js`; (2) Pages deploy mid-flight — wait, retry, or fall back to local; (3) `tau-prolog@0.3.4` peer dependency not installed in the bundle build context — check `package.json` peer-dependencies + the esbuild config's externals.
- **If `loadOntology()` throws with a "Tau Prolog runtime" error:** the bundle wasn't built with the Tau Prolog peer dependency resolved. Run `npm install tau-prolog@0.3.4` and re-bundle.
- **Don't read the script verbatim.** Use it as the spine; the on-screen prose carries the precise wording. Your job is to point and contextualize.

---

## 8. References

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
- **Phase 3 Step 9 architectural-gap micro-cycle (Q-3-Step9-A + Q-Frank-Step9-A corrective overlay): [`project/reviews/phase-3-step9-architectural-gap.md`](../project/reviews/phase-3-step9-architectural-gap.md)** (the load-bearing artifact for the corrective ruling that pulled Case B, amended the count discriminator, withdrew the disposition-split discipline)
- **Frank's stakeholder critique: [`demo/Phase3DemoCritique.md`](Phase3DemoCritique.md)** (banked as canonical exemplar of the post-hoc-discipline-canonization risk pattern; produced the Q-Frank-Step9-A corrective ruling)
- Phase 3 retroactive corrective cycle: `project/reviews/phase-3-retroactive-corrective.md`
- Phase 3 reactivation results (extended at Q-Frank-Step9-A 2026-05-10 with No-Collapse adversarial corpus per-canary tagging + Layer A pulled-from-demo state): `project/reviews/phase-3-reactivation-results.md`
- **v0.2-roadmap consolidated artifact: [`project/v0.2-roadmap.md`](../project/v0.2-roadmap.md)** (Layer A consistency-affirmation gap + every "v0.2 ELK closes that" commitment from Phases 1-3 with scope/owner/timeline; authored at Phase 3 close per Q-Frank-Step9-A Ask 6)
- ADR-007 §11 (FOL→Tau Prolog clause translation): `project/DECISIONS.md`
- ADR-011 (audit-artifact `@id` content-addressing): `project/DECISIONS.md`
- ADR-013 (visited-ancestor cycle-guard pattern): `project/DECISIONS.md`
- Authoring discipline: `arc/AUTHORING_DISCIPLINE.md` ("Phase 3 Banked Principles" section)
- Behavioral spec: `project/OFBT_spec_v0.1.7.md` (§5.4 + §6.3 + §8.1 + §8.2 + §8.5)
- API spec: `project/OFBT_API_v0.1.7.md` (§2 + §5.5 + §6.3 + §7.1 + §7.2 + §8.1 + §8.1.1 + §8.1.2 + §10.3)
