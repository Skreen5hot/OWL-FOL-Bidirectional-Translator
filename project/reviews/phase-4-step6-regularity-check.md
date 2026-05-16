# Phase 4 Step 6 Architectural-Gap Micro-Cycle — Q-4-Step6-A regularityCheck Multi-Gap — RATIFIED

**Date:** 2026-05-14/15 (Developer-surfaced four-gap finding at Step 6 implementation reconnaissance; SME routing same day with Q-letter recommendation + Reading-3 hybrid endorsement; architect ruling same day on Q-4-Step6-A.1 + Q-4-Step6-A.1.1 + Q-4-Step6-A.2 + Q-4-Step6-A.3 + Q-4-Step6-A.4 + meta-observation forward-track + 6 banked principles; SME path-fence-author + verification ritual close pre-Pass-2b-brief-confirmation).
**Cycle type:** **Phase 4 mid-phase architectural-gap micro-cycle (THIRD instance; hits Q-4-A's ~3 projection exactly).** Per Q-4-A projection: ~3 mid-phase architectural-gap micro-cycles projected for Phase 4; Q-4-Step4-A first (2026-05-11); Q-4-Step5-A second (2026-05-14); Q-4-Step6-A third (2026-05-14/15); counter increments 2 → 3; on-projection exact match. **Phase 3 exit retro candidate #2 (substantive-scope-weighting methodology refinement) tracks tightly** — entry-cycle projection matches exact mid-phase cycle count at Step 6.
**Surfaced by:** Developer reconnaissance during Phase 4 Step 6 implementation framing 2026-05-14/15 — four distinct gaps (A: algorithm scope ambiguity; B: corpus content gap; C: ARC content sparseness; D: Step 6 / Step 8 boundary).
**Status:** **RATIFIED 2026-05-14/15.** Cycle history: (1) Developer dispatch 2026-05-14/15 surfaced four-gap finding routing-artifact draft + Option-A endorsement spectrum → (2) SME refinement 2026-05-14/15 (Q-letter Q-4-Step6-A + sub-question Q-4-Step6-A.1.1 certification logic + Reading-3 endorsement reasoning + banking-worthy meta-observation on Phase 4 multi-gap pattern across Steps 4/5/6) → (3) architect ruling 2026-05-14/15: Reading 3 hybrid APPROVED + Sub-option α non-transitive chain certification APPROVED + SME dispatch APPROVED + Forward-track full SROIQ to v0.2 APPROVED + Step 6 = warning emission control only APPROVED + multi-gap pattern observation forward-track to Phase 4 exit retro + 6 banked principles → (4) SME path-fence-authors this routing artifact + 2 step-N-bind fixtures + v0.2-roadmap.md amendment + entry packet update + verification ritual report → (5) Pass 2b architect brief confirmation cycle.

**Blocks:** Phase 4 Step 6 implementation (regularityCheck(A, importClosure) machinery per spec §6.2.1 + activation of `regularity_check_clears_warning` + `regularity_check_keeps_warning` step-N-bind fixtures + Phase 2 Step 6 forward-track closure). Does NOT block Phase 4 Steps 7-9 work that is independent of regularityCheck.

**Predecessors:**
- [`phase-4-step5-connected-with-bridge.md`](./phase-4-step5-connected-with-bridge.md) (Phase 4 mid-phase architectural-gap micro-cycle 2; standalone routing-cycle artifact shape inherited; multi-gap pattern observation extended at this cycle)
- [`phase-4-step4-disjointness-schema.md`](./phase-4-step4-disjointness-schema.md) (Phase 4 mid-phase architectural-gap micro-cycle 1; four-anchor schema reasoning + bounded-scope discipline inherited)
- [`phase-4-entry.md`](./phase-4-entry.md) §2.6 (regularityCheck deliverable; spec §6.2.1 + Phase 2 Step 6 forward-track closure per Q-Step6-1); §11 Q-4-A Step 6 binding
- `arc/core/bfo-2020.json` @ post-Q-4-Step5-A state (41 ARCEntry + 11 disjointnessAxioms + 3 bridgeAxioms; 4 entries with owlCharacteristics owl:TransitiveProperty; subPropertyOf sparse — 1 explicit entry only)
- `project/OFBT_spec_v0.1.7.md` §6.1.2 (SROIQ R feature + regularity restriction citing Horrocks, Kutz, and Sattler 2007); §6.2.1 (chain projection + regularity_scope_warning emission)

---

## 1. Surfaced architectural gap (verbatim from Developer dispatch 2026-05-14/15)

Phase 4 Step 6 implementation (regularityCheck(A, importClosure) machinery per spec §6.2.1 + activation of `regularity_check_clears_warning` + `regularity_check_keeps_warning` step-N-bind fixtures + Phase 2 Step 6 forward-track closure per architect Q-Step6-1) blocked at Developer scope — three load-bearing gaps + a boundary question surfaced by reconnaissance.

### Gap A — Algorithm scope ambiguity

Three readings of "regularity-confirmed under loaded ARC modules' import closure":
- **Reading 1 (heuristic)** — `arcModules` declared + has loaded modules → import closure is "complete enough" → skip warning. Trivial impl; corrupts spec semantic.
- **Reading 2 (formal SROIQ Horrocks)** — strict-partial-order regularity criterion using loaded ARC modules' subPropertyOf entries as the role hierarchy. Spec-formally-correct; substantial impl; BFO catalogue insufficient.
- **Reading 3 (hybrid)** — vocabulary presence + subPropertyOf where present + heuristic elsewhere.

### Gap B — Corpus content gap (step-N-bind fixtures don't exist)

`regularity_check_clears_warning.fixture.js` + `regularity_check_keeps_warning.fixture.js` NOT in `tests/corpus/`; per recent practice (Steps 4 + 5), step-N-bind corpus fixtures are SME-authored at the binding step.

### Gap C — ARC content gap (subPropertyOf field sparse)

40 RELATION entries have `"subPropertyOf": "—"`; only 1 explicit entry (Has Member Part → Has Continuant Part). The BFO 2020 RELATION catalogue does not currently encode the role hierarchy needed for formal SROIQ regularity certification.

### Gap D — Fall-through semantics

Per spec §6.2.1: chains the check CANNOT certify "fall through to Annotated Approximation" — Step 8 (arity_flattening LossType) territory. Step 6 / Step 8 boundary requires explicit architect ratification.

---

## 2. Q-4-Step6-A — SME-routable resolution

### 2.1 Q-4-Step6-A.1 — regularityCheck algorithm scope: Reading 3 (hybrid) endorsed

Bounded implementation cost; activates corpus demand; preserves the spec §6.2.1 strengthening framing per phase-4-entry.md §2.6 "non-breaking strengthening per ADR-011 behavioral-contract evolution." Reading 1 refused (spurious clearance corrupts spec semantic); Reading 2 deferred to v0.2 ELK closure path per Q-3-D banking principle.

### 2.2 Q-4-Step6-A.1.1 — Sub-option α (non-transitive chain certification) endorsed

Chain regularity-certified when no role in chain is `owl:TransitiveProperty`. Spec-formally-correct per Horrocks, Kutz, and Sattler 2007 (transitivity is THE canonical regularity-restricting characteristic in SROIQ); uses existing BFO catalogue data (4 entries have owl:TransitiveProperty); activates both step-N-bind fixtures. Sub-options β (+ subPropertyOf integration) and γ (conservative-only) refused.

### 2.3 Q-4-Step6-A.2 — Corpus fixture authorship: SME dispatch endorsed

SME path-fence-authors both step-N-bind fixtures per ratified algorithm. Same pattern as Q-4-Step4-A + Q-4-Step5-A.

### 2.4 Q-4-Step6-A.3 — ARC schema/content disposition: Forward-track full SROIQ to v0.2 endorsed

No ARC schema extension this cycle; new entry to `project/v0.2-roadmap.md` (v0.2-09) per Q-4-D pattern. Phase 4 uses existing owlCharacteristics data as-is.

### 2.5 Q-4-Step6-A.4 — Step 6 / Step 8 boundary: Step 6 = affirmative skip-warning only endorsed

Step 6 ships warning emission control (certification path); Step 8 ships LossSignature emission + strategy router (Annotated Approximation fall-through). Clean Q-Step6-1 Phase 2 baseline preservation mirror; audit-trail-unity-per-surface preserved.

### 2.6 Meta-observation — Multi-gap pattern across Phase 4 substantive Steps

Phase 4's three substantive-content Steps (4, 5, 6) each surfaced multi-gap routing-cycle work (3 sub-questions; 4 gaps; 4 gaps). Pattern "Step implementation reconnaissance → multi-gap routing-cycle" is now consistent across Phase 4's substantive Steps. Two interpretive frames: (I) intrinsic to Phase 4 BFO ARC content scope; (II) methodology refinement candidate. Distinguishing the frames requires Phase 5+6 evidence; forward-track to Phase 4 exit retro.

---

## 3. Architect rulings 2026-05-14/15 (verbatim transcription per §11 discipline)

### 3.1 Q-4-Step6-A.1 ruling — Reading 3 (hybrid) with minimum-viable certification APPROVED

> Hybrid reading: minimum-viable certification at v0.1; formal SROIQ Horrocks regularityCheck defers to v0.2 ELK closure. Approved as the SME endorses.
>
> **Why Reading 1 (heuristic-only) is refused:** Heuristic-only certification would clear regularity_scope_warning spuriously for any loaded arcModules, corrupting the spec §6.2.1 "regularity-confirmed" semantic. The semantic is load-bearing: when the projector clears the warning, downstream consumers infer the chain is regular under SROIQ's regularity restriction; spurious clearance produces false-positive regularity claims.
>
> **Why Reading 2 (formal SROIQ Horrocks) defers to v0.2:** Substantial implementation cost; BFO catalogue data insufficient; v0.2 ELK closure path is the natural home. Per Q-3-D banking principle (Phase 3 entry cycle, 2026-05-08): "When the natural surfacing-context for deferred work spans multiple candidate phases, defer to the phase whose corpus or content demands the work, not the phase whose cycle is next." Phase 4 corpus does not demand formal SROIQ certification; v0.2 ELK closure context does. Defer.
>
> **Why Reading 3 (hybrid) is correct:** Bounded implementation cost (minimum-viable certification using existing BFO catalogue's owlCharacteristics data; no schema extension; no role hierarchy authoring); Activates corpus demand (both step-N-bind fixtures need a certification logic that distinguishes the two cases; hybrid certification activates both); Preserves the spec §6.2.1 strengthening framing (Reading 3 honors the strengthening; the strengthening is bounded but non-trivial).

### 3.2 Q-4-Step6-A.1.1 ruling — Sub-option α (non-transitive chain certification) APPROVED

> Chain regularity-certified when no role in chain is owl:TransitiveProperty. Approved as the SME proposes.
>
> Three anchors:
>
> 1. **Spec-formally-correct anchor** — Transitivity is THE canonical regularity-restricting characteristic in SROIQ per Horrocks, Kutz, and Sattler (2007). Spec §6.1.2 cites this directly. A chain with no transitive role is provably regular under SROIQ's regularity restriction.
>
> 2. **Existing BFO catalogue data anchor** — owlCharacteristics field carries owl:TransitiveProperty on 4 entries. Sub-option α uses this existing data without requiring schema extension or new ARC content authoring.
>
> 3. **Both fixtures activated anchor** — Sub-option α produces a non-trivial certified set AND a non-trivial conservative-default set. Both fixtures find non-trivial test surface.
>
> **Required of the certification logic:**
>
> ```typescript
> function regularityCheck(chain: PropertyChain, arcContent: ARCContent): 'regularity-certified' | 'cannot-certify' {
>   // Sub-option α minimum-viable certification:
>   for (const roleIRI of chain.roles) {
>     const arcEntry = arcContent.lookup(roleIRI);
>     if (arcEntry?.owlCharacteristics?.includes('owl:TransitiveProperty')) {
>       return 'cannot-certify';
>     }
>   }
>   return 'regularity-certified';
> }
> ```
>
> Projector behavior:
> - `'regularity-certified'` → omit regularity_scope_warning from emitted RecoveryPayload
> - `'cannot-certify'` → emit regularity_scope_warning (Phase 2 baseline preserved)

### 3.3 Q-4-Step6-A.2 ruling — SME dispatch APPROVED

> SME path-fence-authors both step-N-bind fixtures (`regularity_check_clears_warning.fixture.js` + `regularity_check_keeps_warning.fixture.js`) per the ratified Reading 3 + Sub-option α certification logic.
>
> Same pattern as Q-4-Step4-A + Q-4-Step5-A. The SME-dispatch discipline is now consistent across all three Phase 4 mid-phase architectural-gap micro-cycles.
>
> **Required of the fixture authoring:** Two fixtures exercise the certification logic at unit-level. `clears_warning` — synthetic chain over non-transitive roles; expected projector output omits regularity_scope_warning. `keeps_warning` — synthetic chain containing at least one owl:TransitiveProperty role; expected projector output includes regularity_scope_warning (Phase 2 baseline preserved). Both `corpusActivationTiming: 'step-N-bind'`.

### 3.4 Q-4-Step6-A.3 ruling — Forward-track full SROIQ to v0.2 APPROVED

> Forward-track full SROIQ regularity certification + structured role hierarchy authoring to v0.2 ELK closure path. New project/v0.2-roadmap.md entry authoring at Pass 2b. Phase 4 disposition: use existing BFO catalogue's owlCharacteristics data as-is; no schema extension; no new ARC content authoring this cycle.
>
> Three counts: (1) symmetric application of corpus-bounded scope banking (Q-4-Step4-A Banking 3 + Q-4-Step5-A.2 banking generalization); (2) reduced Pass 2b scope vs prior cycles (no schema extension); (3) v0.2-roadmap.md amendment pattern preserved (Q-4-D pattern extends).
>
> **Required v0.2-roadmap.md entry:** v0.2-NN per SME discretion on number; entry shape aligns with established pattern (Source phase + Source gap + Closure mechanism + Scope + Owner + Timeline + Cross-references + Status).

### 3.5 Q-4-Step6-A.4 ruling — Step 6 ships affirmative skip-warning only APPROVED

> Step 6 = warning emission control; Step 8 = LossSignature emission + strategy router fall-through. Clean Q-Step6-1 Phase 2 baseline preservation mirror.
>
> **Step 2 (Phase 2 baseline, preserved):** Projector emits regularity_scope_warning unconditionally on chain projection.
>
> **Step 6 (this cycle's deliverable):** Projector consults regularityCheck(chain, arcContent); conditionally omits the warning when check returns 'regularity-certified'; defaults to emitting when check returns 'cannot-certify'. Non-breaking strengthening per ADR-011 (omission is signal-preserving — omission means certified — not signal-corrupting).
>
> **Step 8 (separate deliverable):** Projector's strategy router fall-through-to-Annotated-Approximation when chain can't be regularity-certified AND can't be lift-correctly emitted; emits arity_flattening LossSignature. Structurally distinct from Step 6's warning emission control; bundles with Step 8's typed-error-hierarchy completion per Phase 3 entry cycle Q-3-C ruling generalization.
>
> The Step 6 / Step 8 boundary preserves audit-trail-unity-per-surface (per Q-3-G banking, Phase 3 entry cycle): Step 6 ratifies warning emission control; Step 8 ratifies LossSignature emission + strategy router. Conflating them in Step 6 would corrupt the per-surface ratification discipline.

### 3.6 Meta-observation ruling — Multi-gap pattern forward-track to Phase 4 exit retro

> The SME's meta-observation surfaces a structurally significant pattern. Forward-track to Phase 4 exit retro candidacy.
>
> Phase 4's three substantive-content Steps (4, 5, 6) each surfaced multi-gap routing-cycle work. Two interpretive frames cannot be distinguished at mid-Phase-4 without Phase 5 + Phase 6 evidence:
>
> **Frame I — Intrinsic to Phase 4 BFO ARC content scope.** Phase-4-specific; does not generalize.
>
> **Frame II — Methodology refinement candidate.** Phase entry packets under-project the architectural-gap surface; Step-N-bind fixtures over-defer to step-N implementation; verification ritual phase-boundary retroactive batch under-covers Step-implementation-surface gaps.
>
> Phase 4 exit retro evaluates with Phase 5 + Phase 6 early evidence + retroactive ritual run history.
>
> **Required forward-track at Phase 4 exit retro:** Architect ratification at retro: (a) confirm Frame I (Phase-4-specific; no methodology change); (b) ratify Frame II + propose methodology refinement; (c) defer further until Phase 5/6 evidence accumulates.

---

## 4. Six new banked principles (architect ruling 2026-05-14/15)

Verbatim transcription per the §11 verbatim-transcription discipline. **All six bank now (verbally), formalize at Phase 4 EXIT doc-pass per architect directive** — NOT at Phase 4 entry.

1. **Minimum-viable certification logic for chain regularity at v0.1 operates on the spec's identified canonical regularity-violation source (transitivity per Horrocks et al. 2007).** The minimum-viable scope: chain certified when no role is owl:TransitiveProperty; cannot-certify otherwise. Formal SROIQ Horrocks regularity check defers to v0.2 ELK closure path per the natural surfacing-context discipline. (Q-4-Step6-A.1 + .1.1 banking)

2. **SME path-fence-authoring of step-N-bind fixtures is the consistent disposition across Phase 4 mid-phase architectural-gap micro-cycles.** The discipline preserves through the consistent dispatch + verification ritual binding-immediately + Pass 2b brief confirmation pattern. (Q-4-Step6-A.2 consistency banking)

3. **Mid-phase architectural-gap micro-cycle Pass 2b scope varies by gap shape;** some cycles extend schema, some operate within existing schema. The scope variation reflects the gap-shape diagnosis; uniform Pass 2b scope across cycles is not required. (Q-4-Step6-A.3 scope variation banking)

4. **Step boundaries within phases preserve audit-trail-unity-per-surface** when distinct architectural surfaces ratify at distinct Steps. Conflating surfaces into single Step deliverables corrupts the per-surface ratification discipline; clean separation preserves through Step boundary respect. (Q-4-Step6-A.4 step boundary banking)

5. **Pattern observations spanning multiple cycles within a phase forward-track to phase exit retro for methodology refinement candidacy.** Mid-cycle pattern interpretation refused; complete-phase evidence + early-next-phase evidence supports clean Frame I vs Frame II ruling. (Meta-observation banking)

6. **Non-breaking strengthening of behavioral contracts** (e.g., conditional warning omission preserving Phase 2 unconditional baseline) honors ADR-011 evolution discipline when the strengthening is signal-preserving (omission means strengthened certification) rather than signal-corrupting (omission could mean either certification or implementation gap). (Strengthening framing banking)

These six forward-fold to Phase 4 exit doc-pass; not formalized at Phase 4 entry per architect directive.

**Plus tight-projection-match data point banking** (from "On the cycle accounting" section of architect ruling): **Phase 4 substantive-scope-weighting projection at entry (~3 mid-phase architectural-gap micro-cycles) matches exact mid-phase cycle count at Step 6. Tight projection-match validates the methodology at Phase 4; Phase 3 exit retro forward-tracked candidate #2 gains supporting evidence.**

---

## 5. SME post-ratification work scope + sequencing

### 5.1 SME path-fence-author scope (this turn)

1. **This routing-cycle artifact** — `project/reviews/phase-4-step6-regularity-check.md`
2. **`tests/corpus/regularity_check_clears_warning.fixture.js`** — chain over non-transitive roles; expected projector output omits regularity_scope_warning per Sub-option α certification
3. **`tests/corpus/regularity_check_keeps_warning.fixture.js`** — chain containing owl:TransitiveProperty role; expected projector output includes regularity_scope_warning (Phase 2 baseline preserved)
4. **`tests/corpus/manifest.json` amendment** — 2 new step-N-bind entries
5. **`project/v0.2-roadmap.md` amendment** — new v0.2-09 entry per Q-4-Step6-A.3 forward-track
6. **`project/reviews/phase-4-entry.md` §3 + §12 + cycle accounting + Phase 4 exit retro candidates + §13 amendment**
7. **Verification ritual binding-immediately** on path-fence-authored artifacts per Cat 6 (spec sections) + Cat 8 (cross-references); canonical sources: spec §6.1.2 + §6.2.1 + Horrocks et al. 2007 reference

### 5.2 Developer-side post-ratification work scope (post-architect-Pass-2b-brief-confirmation; reduced scope vs Q-4-Step4-A/Step5-A per Q-4-Step6-A.3 no-schema-extension)

1. **NEW kernel function `regularityCheck(chain, arcContent)`** — kernel-pure; Sub-option α minimum-viable certification logic
2. **`src/kernel/projector.ts` amendment** — `emitChainRecoveryPayload` line 1961 conditionally emits warning per `regularityCheck` result
3. **`FolToOwlConfig` extension** — thread `arcModules` through projector's config surface
4. **Dev-side activation test** — verifies both step-N-bind fixtures pass end-to-end

**No ARC schema extension this cycle** per Q-4-Step6-A.3 forward-track ruling; reduces file-touch count vs Q-4-Step4-A/Step5-A precedents (Q-4-Step6-A.3 scope variation banking applies).

### 5.3 Sequencing (per architect ruling)

In order:

1. **Now (closed)** — Architect rulings on Q-4-Step6-A.1 + .1.1 + .2 + .3 + .4 + meta-observation forward-track + 6 banked principles received
2. **SME path-fence-authors** — routing artifact + 2 step-N-bind fixtures + v0.2-roadmap.md amendment + entry packet update + verification ritual report
3. **SME runs verification ritual** on path-fence-authored artifacts
4. **Pass 2b architect brief confirmation cycle** on SME-authored artifacts
5. **Developer commits the consolidated Pass 2b set** per audit-trail-unity-per-surface
6. **Phase 4 Step 6 implementation continues** post-Pass-2b-commit-green
7. **Phase 4 implementation Steps 7-9** per the SME-proposed step ledger; standard cycle cadence applies for any mid-phase escalations
8. **Phase 4 exit retro inherits** the multi-cycle pattern observation candidacy alongside Cat 9 ritual category candidacy + corpus fixture cross-reference field retroactive audit candidacy + verbal-pending queue divergence reconciliation

### 5.4 Cycle accounting (post-Q-4-Step6-A-architect-ruling)

- **Phase 4 mid-phase architectural-gap counter: 2 → 3** (Q-4-Step4-A closed at commit `427eff5`; Q-4-Step5-A closes at its Pass 2b commit; Q-4-Step6-A this cycle; closes when this cycle's Pass 2b commit lands + remote CI green). **Hits Q-4-A's ~3 mid-phase projection EXACT MATCH** — Phase 3 exit retro candidate #2 (substantive-scope-weighting methodology refinement) tracking tightly.
- Phase 4 entry-cycle counter: 2 (closed at final ratification 2026-05-10)
- Phase 4 contingency-operationalization sub-cycle counter: 1 (Q-4-C; closed; formalized at commit `1f2cff6`)
- Phase 4 stakeholder-routing corrective sub-cycle counter: 0
- BFO ARC content authoring workstream bucket: pre-existing
- **Phase 4 verbal-pending bankings queue per architect Q-4-Step6-A ruling: 39 (architect verbatim) / 44 (SME running);** 5-count divergence persists per Q-4-Step5-A Pass 2b Banking 4 (queue divergence deferral); reconciliation defers to Phase 4 exit doc-pass.

If Phase 4 mid-phase counter increments further (Q-4-Step5-B if Q-4-Step5-A.4 reconnaissance surfaces gap; Q-4-StepN-X if Step 7/8/9 escalation): the projection over-shoots; methodology refinement candidacy strengthens per the meta-observation banking framework.

### 5.5 What architect explicitly NOT authorizing (per ruling)

1. No Reading 1 (heuristic-only) or Reading 2 (formal SROIQ) for v0.1. Reading 3 hybrid is binding.
2. No Sub-option β or γ for the certification logic. Sub-option α is binding.
3. No ARC schema extension at this cycle. Forward-track to v0.2 is binding.
4. No Step 6 / Step 8 boundary conflation. Clean separation is binding; Step 6 ships warning emission control only.
5. No mid-cycle methodology refinement on the multi-gap pattern. Forward-track to Phase 4 exit retro is binding.
6. No bypassing of the v0.2-roadmap.md entry authoring.
7. No silent fixture authoring without verification ritual binding-immediately run.
8. No further architect routing on Phase 4 Step 6 implementation work absent surfacing of additional architectural-commitment-tier escalation.

---

## 6. Cross-references

- [`phase-4-step5-connected-with-bridge.md`](./phase-4-step5-connected-with-bridge.md) — Phase 4 mid-phase architectural-gap micro-cycle 2 (standalone routing-cycle artifact shape inherited; multi-gap pattern extended at this cycle)
- [`phase-4-step4-disjointness-schema.md`](./phase-4-step4-disjointness-schema.md) — Phase 4 mid-phase architectural-gap micro-cycle 1 (four-anchor schema reasoning + bounded-scope discipline inherited)
- [`phase-4-entry.md`](./phase-4-entry.md) — Phase 4 entry packet (§2.6 regularityCheck deliverable + §11 Q-4-A Step 6 binding); §3 + §12 amend per this cycle
- [`phase-4-entry-q-4-c-amendment.md`](./phase-4-entry-q-4-c-amendment.md) — Q-4-C source-state amendment cycle (standalone routing-cycle artifact banking generalization inherited)
- [`phase-4-step6-regularity-check-verification-ritual-report.md`](./phase-4-step6-regularity-check-verification-ritual-report.md) — verification ritual report for this cycle's path-fence-authored artifacts
- `tests/corpus/regularity_check_clears_warning.fixture.js` (NEW step-N-bind; chain over non-transitive roles)
- `tests/corpus/regularity_check_keeps_warning.fixture.js` (NEW step-N-bind; chain containing owl:TransitiveProperty role)
- `arc/core/bfo-2020.json` (post-Q-4-Step5-A state; 4 entries have owlCharacteristics owl:TransitiveProperty: continuant_part_of BFO_0000176, has_continuant_part BFO_0000178, has_occurrent_part BFO_0000117, plus part_of and has_part per existing data)
- `project/v0.2-roadmap.md` (new v0.2-09 entry per Q-4-Step6-A.3 forward-track)
- `project/OFBT_spec_v0.1.7.md` §6.1.2 (SROIQ R feature + regularity restriction citing Horrocks, Kutz, and Sattler 2007); §6.2.1 (chain projection + regularity_scope_warning emission); §6.2.1 + ADR-011 framing for non-breaking strengthening
- `project/DECISIONS.md` ADR-011 (behavioral-contract evolution discipline; ADR-013 cycle-prone predicate classes; ADR-007 §1 lifter classical-FOL emission)
- Horrocks, Kutz, and Sattler (2007) — canonical SROIQ regularity restriction reference per spec §6.1.2

---

**Q-4-Step6-A regularityCheck multi-gap cycle RATIFIED 2026-05-14/15. Phase 4 mid-phase architectural-gap counter at 3 (HITS Q-4-A ~3 PROJECTION EXACT MATCH); closes when Pass 2b commit lands + remote CI green per the architect-ratified sequencing. Six new banked principles + tight-projection-match data point banking forward-fold to Phase 4 exit doc-pass. Multi-gap pattern observation forward-tracks to Phase 4 exit retro (Frame I vs Frame II evaluation with Phase 5+6 evidence).**

— SME, 2026-05-14/15 (Q-4-Step6-A architect ruling close; SME path-fence-author phase opens)

---

## 7. Brief confirmation cycle close (architect confirmation 2026-05-14/15)

Per architect Q-4-Step6-A Pass 2b brief confirmation cycle 2026-05-14/15: the 7 path-fence-authored artifacts (4 new + 3 modified) verified against the five sub-rulings + multi-gap pattern forward-track + 6 banked principles + tight-projection-match data point banking. **All seven correspondence checks pass.** Five new banked principles from the brief confirmation cycle observing the SME's path-fence-author shape + Catch 5 disposition + non-linear-acceleration trajectory continuation + tight-projection-match preservation + 5-candidate Phase 4 exit retro list accumulation as exemplary practice; all five bank verbally + forward-fold to Phase 4 exit doc-pass per architect directive.

### 7.1 Five new banked principles (Q-4-Step6-A Pass 2b brief confirmation cycle 2026-05-14/15)

Verbatim transcription per the §11 verbatim-transcription discipline.

1. **Disciplines ratified at prior cycles operate immediately on subsequent structurally-identical findings without requiring re-routing.** The reuse-without-re-routing pattern validates the discipline's portability across cycles; subsequent instances strengthen the discipline's audit-trail authority. (Catch 5 disambiguation reuse banking)

2. **Forward-tracked candidates whose underlying pattern repeats across cycles gain supporting evidence for retro deliberation.** The strengthening discipline preserves through cycle-history accumulation; repeated patterns reach retro with stronger evidence base than singletons. The corpus fixture cross-reference field retroactive audit candidate STRENGTHENED at Q-4-Step6-A by Catch 5 repetition. (Pattern repetition strengthening banking)

3. **Verification ritual production catch trajectory passes through expansion phases:** scope expansion (single-surface → multi-surface across Catches 1-2 → 3); granularity expansion (Cat 6+8 → Cat 2+7+8 across Catches 3 → 4); **pattern-recognition expansion** (Cat 2+7+8 first instance → Cat 2+7+8 second instance across Catches 4 → 5). (Trajectory pattern banking)

4. **Substantive-scope-weighting projection accuracy data points are preserved at the cycle where the projection is satisfied.** The data points accumulate for phase exit retro methodology refinement deliberation; preservation at cycle-of-occurrence prevents data-point loss between cycle and retro. Two-data-point trajectory: Phase 3 over-shoot 5/~3 + Phase 4 exact-match 3/~3. (Projection-match data-point preservation banking)

5. **Phase exit retro candidates list accumulation across cycles validates the forward-track-to-retro discipline.** Mid-phase candidate counts preserve the discipline's operational integrity; retro deliberation operates on full-phase candidate evidence. 5-candidate count at this cycle. (Candidate accumulation meta-banking)

**Plus data-point-trajectory observation banking:** **Substantive-scope-weighting projection accuracy varies across phases; one Phase-3 over-shoot + one Phase-4 exact-match constitutes two-data-point evidence. Phase 4 exit retro deliberation operates on the cumulative trajectory; methodology refinement candidacy strengthens or weakens per the trajectory pattern.**

### 7.2 Cycle accounting refinement (per architect brief confirmation 2026-05-14/15)

- **Phase 4 mid-phase architectural-gap counter: 3 → 3 (Q-4-Step6-A CLOSED at Pass 2b brief confirmation cycle 2026-05-14/15; formalization at Pass 2b commit + remote CI green).** Brief confirmation cycle does NOT increment any counter.
- **Phase 4 verbal-pending bankings queue:** architect verbatim 39 + 5 = **44**; SME running 44 + 5 = **49**; queue divergence persists at 5 entries per Banking 4 deferral.
- **Architect-noted sub-divergence vector:** the architect's count of 5 new bankings this brief-confirmation cycle vs the SME's reported 6 in the Q-4-Step6-A commit message creates a secondary divergence; resolution: the SME's "6" referenced Q-4-Step6-A architect-ruling cycle bankings 1-6 (folded earlier at entry packet §12); this brief-confirmation cycle's bankings are the new 5 (per architect verbatim). Sub-divergence reconciles cleanly via sub-cycle stratification.
- **Phase 4 exit retro candidate count:** 5 (Cat 9 + corpus fixture cross-reference audit STRENGTHENED + queue divergence reconciliation + multi-gap pattern Frame I vs Frame II + tight-projection-match data point); cumulative two-data-point trajectory on substantive-scope-weighting (Phase 3 over-shoot 5/~3 + Phase 4 exact-match 3/~3).

### 7.3 Pass 2b commit contents — 7-artifact set + Developer-side work per architect required-of-the-Pass-2b-commit list 2026-05-14/15

**NEW files:**
1. `project/reviews/phase-4-step6-regularity-check.md` (this artifact)
2. `project/reviews/phase-4-step6-regularity-check-verification-ritual-report.md`
3. `tests/corpus/regularity_check_clears_warning.fixture.js`
4. `tests/corpus/regularity_check_keeps_warning.fixture.js`

**MODIFIED files:**
5. `tests/corpus/manifest.json` (2 new step-N-bind entries)
6. `project/v0.2-roadmap.md` (new v0.2-09 entry per Q-4-Step6-A.3 forward-track; cross-cutting summary 7→9)
7. `project/reviews/phase-4-entry.md` (§3.3 amendment + §3.8 cycle history 57→59 + §12 two banking subsections 6+5 + cycle accounting + Phase 4 exit retro candidates section expanded to 5 + §13 forward-reference + closing status banner)

**Developer-side implementation work per the Q-4-Step6-A.3 ruling's no-schema-extension framing:**
- NEW kernel function `regularityCheck(chain, arcContent)` per Sub-option α (transitivity-only certification)
- `src/kernel/projector.ts` amendment — `emitChainRecoveryPayload` conditionally emits warning per check result
- `FolToOwlConfig` extension — thread `arcModules` through projector config surface
- Dev-side activation test for both step-N-bind fixtures

**No ARC schema extension** per Q-4-Step6-A.3 forward-track (Banking 3 scope variation discipline applies); reduces Pass 2b file-touch count vs Q-4-Step4-A/Step5-A precedents.

**Out-of-scope per Banking 5 (don't include in Pass 2b commit):** `.claude/settings.local.json`, `arc/cco/`, `project/MAREP_v2.1.md`. The discipline preserves through this third Pass 2b cycle.

**Standard commit message format per architect brief confirmation approval.** Architect approved the SME's drafted commit message as preserving the architect-ruling-reference + tight-projection-match data point + Catch 5 documentation + Phase 4 exit retro candidates accumulation + cycle accounting at the audit-trail surface.

### 7.4 What architect explicitly NOT authorizing (per brief confirmation 2026-05-14/15)

1. No further amendments to the Q-4-Step6-A Pass 2b artifact set.
2. No inclusion of out-of-scope artifacts per Banking 5 (Q-4-Step5-A Pass 2b).
3. No ARC schema extension at this cycle.
4. No bypassing of the disambiguation discipline for Catch 5 resolution.
5. No silent fixture authoring without verification ritual binding-immediately run.
6. No verbal-pending bankings queue divergence reconciliation mid-cycle per Q-4-Step5-A Pass 2b Banking 4 deferral.
7. No mid-cycle methodology refinement on the substantive-scope-weighting tight-projection-match.
8. No further architect routing on Phase 4 Step 6 implementation work absent additional architectural-commitment-tier escalation.

### 7.5 Sequencing reaffirmed (per architect brief confirmation 2026-05-14/15)

In order:

1. **NOW (closed)** — Brief Pass 2b confirmation issued (this cycle close)
2. **Pass 2b commit** — developer commits 7-artifact set + Developer-side implementation work; remote CI green verification
3. **Phase 4 Step 6 implementation continues** — kernel regularityCheck + projector amendment + FolToOwlConfig extension + Dev-side activation test
4. **Phase 4 implementation Steps 7-8** per the SME-proposed step ledger; standard cycle cadence applies for any mid-phase escalations
5. **Phase 4 exit retro inherits 5 candidates** + cumulative two-data-point substantive-scope-weighting trajectory for retro deliberation
6. **If Q-4-Step7-A or Q-4-Step8-A surfaces:** mid-phase counter increments beyond 3; trajectory shifts from exact-match to over-shoot; methodology refinement candidacy strengthens toward Frame II framing
7. **If no further escalations:** Phase 4 closes at exact-match; projection methodology validates at Phase 4; strengthens Frame I framing

---

**Q-4-Step6-A Pass 2b brief confirmation cycle CLOSED 2026-05-14/15. Phase 4 mid-phase architectural-gap sub-cycle CLOSED at brief confirmation (formalization at Pass 2b commit + remote CI green). 5 new banked principles + data-point-trajectory observation forward-fold to Phase 4 exit doc-pass (11 total from Q-4-Step6-A regularityCheck cycle + Pass 2b brief confirmation combined). Five Phase 4 exit retro forward-track candidates accumulated + cumulative two-data-point substantive-scope-weighting trajectory. Pass 2b UNBLOCKED — developer commits the 7-artifact set + Developer-side implementation per the architect-ratified contents.**

— SME, 2026-05-14/15 (Q-4-Step6-A Pass 2b brief confirmation cycle close)

---

## 8. Corrective sub-amendment (2026-05-15) — Cat 8 production catch surfaced at Developer Pass 2b verification ritual

### 8.1 Surface

Developer Pass 2b verification ritual 2026-05-15 (post-architect-Pass-2b-brief-confirmation; pre-Pass-2b-commit) surfaced both step-N-bind fixtures throwing `IRIFormatError: "IRI must be a non-empty string"` at lift time. Cat 8 production catch on RBox shape mismatch:

- **SME path-fence-author 2026-05-14** used `SubObjectPropertyOf` with `subPropertyChain: { "@type": "ObjectPropertyChain", properties: [...] }` field shape — OWL 2 DL grammar BUT does NOT match canonical `src/kernel/owl-types.ts` interface declarations:
  - `SubObjectPropertyOfAxiom` (lines 210-214): `subProperty: string` (single IRI; NO chain support)
  - `ObjectPropertyChainAxiom` (lines 227-231): TOP-LEVEL `RBoxAxiom` with `chain: string[]` + `superProperty: string`

### 8.2 Disposition — pre-routing correction within open Pass 2b window per Q-4-Step6-A Pass 2b Banking 1 reuse

Both fixtures' RBox amended to canonical top-level `ObjectPropertyChain` shape:

```js
// BEFORE (malformed):
{ "@type": "SubObjectPropertyOf",
  subPropertyChain: { "@type": "ObjectPropertyChain", properties: [...] },
  superProperty: ... }

// AFTER (canonical per src/kernel/owl-types.ts:227-231):
{ "@type": "ObjectPropertyChain", chain: [...], superProperty: ... }
```

Both fixtures' audit-trail headers updated with corrective-sub-amendment entry per Q-4-Step5-A.1 four-contract consistency discipline. **No architect re-routing required** — SME-domain mechanical fix per Q-4-Step6-A Pass 2b Banking 1 (Catch 5 disambiguation reuse generalizes from ADR-registry-conflation to type-field-structure-conflation as the structural-discipline pattern).

### 8.3 Catch 6 + Miss 2 banked at corrective sub-amendment

- **Catch 6** — Developer Pass 2b verification ritual (2026-05-15) Cat 8 catch on type-field-structure-mismatch (RBox shape `SubObjectPropertyOf` with `subPropertyChain` field). Verification ritual SIXTH production catch in this engagement.
- **Miss 2** — SME pre-routing ritual (2026-05-14) @type-existence-vs-@type-field-structure-consistency boundary surfacing. Verification ritual SECOND production miss; mirrors Q-4-Step5-A Miss 1 reference-existence-vs-reference-consistency pattern.

### 8.4 Cat 10 type-field-structure consistency candidacy — SIXTH Phase 4 exit retro forward-track candidate

Cat 5/6/8 categories verify @type STRING existence but NOT @type FIELD STRUCTURE consistency against canonical interface declarations. Cat 10 candidacy = for each @type-tagged object in path-fence-authored artifacts, verify object's field shape matches the canonical interface declaration's field shape per `src/kernel/owl-types.ts` + `src/kernel/fol-types.ts` etc.

Forward-tracks to Phase 4 exit retro alongside Cat 9 candidacy (both evidence-grounded by production misses per Q-4-Step5-A Banking 5 — verification ritual category-expansion candidates evidence-grounded by production misses forward-track to phase exit retro candidacy). The two-pattern composability: Cat 9 + Cat 10 candidacies both operate at @type-CONSISTENCY granularity (Cat 9 = cited-content; Cat 10 = field-structure); structurally distinct from Cat 5/6/8 @type-EXISTENCE granularity.

### 8.5 Verbal-banking observation (cadence-distinct-complementary-discipline pattern)

**Two complementary-discipline catches now banked** in this engagement:
- Q-4-Step5-A Miss 1 + Catch 4 — Developer reconnaissance complementary catch at architectural-gap surfacing time
- Q-4-Step6-A Miss 2 + Catch 6 — Developer Pass 2b ritual complementary catch at activation-test time

The pattern: complementary disciplines catching ritual-boundary surfaces operate at multiple cadence phases (architectural-gap surfacing time + activation-test time + commit-readiness-verification time); each cadence's catches inform Phase 4 exit retro candidacy with cadence-specific evidence. Verbal-banking observation forward-folds to Phase 4 exit doc-pass alongside Cat 10 candidacy.

### 8.6 Pass 2b commit unblocked + Developer follow-up scope

Pass 2b commit unblocked post-corrective-amendment. Developer follow-up:
1. Re-run verification ritual on amended Pass 2b artifact set (determinism harness + new e2e tests)
2. Investigate projector chain-detection path (Developer-domain follow-up; per Aaron's note, even with canonical RBox shape, synthetic e2e tests didn't produce chain RecoveryPayloads via folToOwl; the projector's `positionedEntry.strategy === "property-chain"` path requires lifted FOL state shape that the chain-strategy matcher recognizes — this investigation is Developer-domain at Step 6 activation follow-up commit, NOT a separate architectural-gap micro-cycle absent surfacing of architectural-commitment-tier escalation)
3. Commit Pass 2b bundle per audit-trail-unity-per-surface

If chain-detection investigation surfaces architectural-commitment-tier escalation: Q-4-Step6-B mid-phase architectural-gap micro-cycle escalates as separate cycle; Phase 4 mid-phase counter would increment 3 → 4 (over-shoots Q-4-A's ~3 projection by 1). If chain-detection investigation resolves within Developer-domain: Pass 2b commit lands; Phase 4 Step 6 closes; Phase 4 mid-phase counter holds at 3 (exact-match preserved).

— SME, 2026-05-15 (Q-4-Step6-A Pass 2b corrective sub-amendment close)
