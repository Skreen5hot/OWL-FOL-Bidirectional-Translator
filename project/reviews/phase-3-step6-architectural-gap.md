# Phase 3 Step 6 Architectural-Gap Micro-Cycle — RATIFIED

**Date:** 2026-05-09 (initial DRAFT); 2026-05-09 (architect rulings on Q-3-Step6-A + Q-3-Step6-B + Q-3-Step6-C + side-finding + three additional ratifications + 8 banked principles)
**Cycle type:** Phase 3 in-Step architectural-gap micro-cycle (FOURTH instance; Steps 3 + 4 + 5 micro-cycles preceded at `a6753d3`, `b66c6e2`, `d24e6a4`)
**Surfaced by:** Developer reconnaissance during Step 6 framing 2026-05-09
**Status:** **RATIFIED 2026-05-09.** Cycle history: (1) Developer dispatch 2026-05-09 surfaced Q-3-Step6-A/B/C + side-finding (3-instance SME error pattern) → (2) SME initial DRAFT 2026-05-09 routed to architect with Option (α-2) + Option (α') recommendations + retroactive verification ritual proposal + verification ritual run pre-routing (no findings) → (3) **architect ruling 2026-05-09:** Q-3-Step6-A Option (α-2) APPROVED (rename `consistent` → `result` with three-state type); Q-3-Step6-B Option (α') APPROVED (reuse `inconsistent`); Q-3-Step6-C concrete data noted for Phase 3 exit retro forward-track; **side-finding APPROVED with three structural requirements**: scope EXTENDED to ADR-007 + ADR-011 + ADR-013 (not just 16 fixtures), routing BATCHED into single corrective cycle, timing BEFORE Step 7 begins; three additional rulings (all-4 No-Collapse fixtures + proof-tree-axioms witness extraction + API §8.1 documentation refinement); 8 banked principles → (4) AMENDED packet (this version) folds rulings: §8 Q-rulings + §9 banked principles transcribed verbatim per the §11 verbatim-transcription discipline.

**Post-ratification SME work (in order):**
1. **Run retroactive verification ritual** on 16 Pass 2a-era fixtures + ADR-007 (all sections) + ADR-011 + ADR-013 — IMMEDIATE per architect directive
2. **Path-fence-author retroactive corrective routing artifact** documenting findings (or closure-only if zero findings)
3. **Architect ratifies retroactive corrective cycle** (single ratification per routing ruling)
4. **Developer commits retroactive corrective + Step 6 implementation + editorial corrections** before Phase 3 Step 7 begins

**Blocks:** Phase 3 Step 6 implementation. Does NOT block any pending parallel cycles.

**Predecessors:**
- [`phase-3-step3-architectural-gap.md`](./phase-3-step3-architectural-gap.md) (RATIFIED + Pass 2b PROMOTED 2026-05-09)
- [`phase-3-step4-architectural-gap.md`](./phase-3-step4-architectural-gap.md) (RATIFIED 2026-05-09; verification-ritual operationalized)
- [`phase-3-step5-architectural-gap.md`](./phase-3-step5-architectural-gap.md) (RATIFIED 2026-05-09; ADR-013 promoted)

---

## 1. Surfaced architectural gaps (verbatim from Developer dispatch 2026-05-09)

### 1.1 Q-3-Step6-A — ConsistencyResult.consistent field type discrepancy

**The gap:**

API §8.1's interface (line 1380) declares:

```typescript
interface ConsistencyResult {
  consistent: boolean;
  witnesses?: InconsistencyWitness[];
  reason: ReasonCode;
  steps: number;
  unverifiedAxioms?: FOLAxiom[];
}
```

API §8.1.1's narrative (line 1399 — verified by SME `Grep`) ALREADY uses three-state `result`:

> "When `result === 'undetermined'` and `reason === 'coherence_indeterminate'`..."

Plus three corpus-before-code fixtures (architect-ratified Q-3-E 2026-05-08) require the third state:

| Fixture | Expected verdict |
|---|---|
| `nc_horn_incomplete_disjunctive` | `expectedConsistencyResult: "undetermined"` + `expectedReason: "coherence_indeterminate"` |
| `nc_horn_incomplete_existential` | Same shape |
| `nc_silent_pass_canary` | `expectedConsistencyResultAcceptable: ["undetermined", "false"]` (explicitly three-state) |

`consistent: boolean` cannot represent `'undetermined'`. The four-state-via-boolean+reason workaround (e.g., `{ consistent: false, reason: 'coherence_indeterminate' }`) is **semantically wrong** — indeterminate ≠ false; it means "could not decide."

**Internal inconsistency:** API §8.1.1's `result` references suggest the field was originally three-state and was simplified to `consistent: boolean` at some point without updating §8.1.1. This is exactly the editorial-correction-language-tightening case.

### 1.2 Q-3-Step6-B — `horn_inconsistency_proven` reason code does not exist

**The gap:** [tests/corpus/nc_self_complement.fixture.js](tests/corpus/nc_self_complement.fixture.js) (Verified-status, Step 6 binding, lines 92-93 + 112-113) expects `expectedReason: "horn_inconsistency_proven"`. SME-verified by direct read of `src/kernel/reason-codes.ts`: this reason code is NOT in the v0.1.7 frozen REASON_CODES enum (16 members per API §11.1).

**The canonical reason** for `consistent: false` per API §11.1 + §11.3 mapping table is `inconsistent` (line 26 of reason-codes.ts).

**This is the same class as Q-3-Step4-A** (`naf_residue` not in enum, ratified 2026-05-09 with Option (β) reuse-existing-reason-code resolution). Resolution mirrors.

### 1.3 Q-3-Step6-C — Cycle-accounting refinement (now actionably evidenced)

This is the **fourth** Phase 3 in-Step architectural-gap micro-cycle. Phase 3 mid-phase counter moves **3 → 4** — exceeding the architect-projected ~3 by Phase 3 close at Step 6 with **3 Steps remaining (7, 8, 9)**.

The Phase 3 exit retro candidate "substantive-scope-weighting methodology refinement" (banked at Step 5 micro-cycle 2026-05-09 per architect Q-3-Step5 cycle-accounting observation ruling) is now **actionably evidenced** — Phase 3's substantive scope clearly exceeds the 3-cycle projection, and the Phase 3 exit retro should refine the projection methodology for Phase 4+ entry packets.

---

## 2. Q-3-Step6-A — SME-routable resolution: Option (α) editorial correction with `result` field rename

### 2.1 Recommended option: **(α-2) Editorial correction + rename `consistent` → `result` with three-state type**

SME's strong preference per cross-API-vocabulary-alignment + §8.1.1-narrative-preservation lens. Three reasons:

**1. Cross-API vocabulary alignment.** API §7.1 (`evaluate`) returns `EvaluationResult` with `result: 'true' | 'false' | 'undetermined'`. Renaming `consistent` to `result` in `ConsistencyResult` aligns the two API surfaces' three-state vocabulary — single mental model for consumers; consistent fixture-stub conventions; matches the corpus's de-facto `expectedConsistencyResult` (which itself implicitly uses result-as-three-state-string).

**2. §8.1.1 narrative preservation.** API §8.1.1 already uses `result === 'undetermined'` references (verified at line 1399). Option (α-2) preserves §8.1.1 verbatim; the interface declaration tightens to match the narrative. Per the Q-Frank-1 banked principle generalization (Pass 2b banked principle 2): "editorial corrections include language tightening to reflect [substance] architecturally implicit but not textually explicit." Here the substance was implicit in §8.1.1's narrative; the interface tightens to match.

**3. JS truthiness gotcha avoided.** A field named `consistent` with three-state string values invites consumer-side `if (result.consistent) { ... }` truthiness checks that succeed on any non-empty string (including `'false'` and `'undetermined'`) — silent-failure mode in consumer code. Renaming to `result` removes the boolean-association naming cue; consumers naturally write `if (result.result === 'true')`.

### 2.2 Sub-option discrimination

| Sub-option | Field name | Trade-off |
|---|---|---|
| (α-1) Keep `consistent` | `consistent: 'true' \| 'false' \| 'undetermined'` | Smaller interface change; preserves field name continuity. Cons: JS truthiness gotcha (consumers may check `if (result.consistent)`); §8.1.1 references `result` not `consistent` (narrative-vs-interface mismatch persists). |
| **(α-2) Rename to `result`** | `result: 'true' \| 'false' \| 'undetermined'` | Cross-API alignment with `EvaluationResult.result`; preserves §8.1.1 verbatim; avoids truthiness gotcha. Cons: field rename break for any v0.1.6-era consumers reading `result.consistent`. |

SME recommends **(α-2)** per the three reasons in §2.1.

### 2.3 Required API §8.1 spec text amendment (SME draft)

> ```typescript
> interface ConsistencyResult {
>   /** Three-state result per API §7.1 EvaluationResult.result vocabulary alignment.
>    *  'true'        — KB consistent (Horn-decidable proof of satisfiability)
>    *  'false'       — KB inconsistent (Horn-decidable proof of contradiction; witnesses populated)
>    *  'undetermined' — Horn-fragment cannot decide (reason coherence_indeterminate; unverifiedAxioms populated) */
>   result: 'true' | 'false' | 'undetermined';
>
>   witnesses?: InconsistencyWitness[];   // present when result === 'false'
>   reason: ReasonCode;
>   steps: number;
>   unverifiedAxioms?: FOLAxiom[];        // present when result === 'undetermined' && reason === 'coherence_indeterminate'
> }
> ```

The interface change is editorial-correction within v0.1.7 freeze per the Q-Frank-1 generalization (Pass 2b banked principle 2 + Q-3-Step3-A + Q-3-Step5-C item 6 precedents). The substance (three-state consistency check per spec §8.5) is unchanged; only the type narrows to match the spec text.

### 2.4 Required corpus fixture amendments (3 fixtures)

The 4 No-Collapse adversarial fixtures + the strategy_routing_no_match fixture's `phase3Reactivation` already use `expectedConsistencyResult: "true" | "false" | "undetermined"` strings. With (α-2) ratified, the fixture metadata field name `expectedConsistencyResult` stays as-is (it's fixture-side convention, not API-mirrored), OR architect rules a parallel rename to `expectedResult`. SME-routable proposal: leave fixture-side metadata as `expectedConsistencyResult` for clarity (the fixtures are FOR ConsistencyResult assertions); rename only at API surface.

### 2.5 Open architect rulings (Q-3-Step6-A)

1. **Option (α-1) vs (α-2) vs (β) vs (γ):** SME recommends (α-2). Architect-final.
2. **Editorial correction within v0.1.7 freeze:** SME proposes Yes per the Q-Frank-1 generalization. Architect-final.
3. **Fixture-side field rename:** SME proposes No (fixture metadata stays `expectedConsistencyResult`). Architect-final.

---

## 3. Q-3-Step6-B — SME-routable resolution: Option (α') reuse `inconsistent` per Q-3-Step4-A precedent

### 3.1 Recommended option: **(α') Reuse existing `inconsistent` reason code**

Per the Q-3-Step4-A precedent (architect-ratified 2026-05-09): when an SME-authored reference uses a non-existent reason code that semantically aligns with an existing canonical code, the resolution is reuse-not-extend per the reason-enum-stability discipline.

`horn_inconsistency_proven` semantically names exactly what `inconsistent` already names — a Horn-decidable proof of contradiction. The architectural distinction (whether the inconsistency was Horn-derived vs disjunctive-tableau-derived) is not currently a reason-code-level distinction in the v0.1.7 frozen enum; per spec §8.5.4's framing, all Horn-decidable inconsistencies map to `inconsistent` and non-Horn-incomplete cases map to `coherence_indeterminate`.

Per Q-3-Step4-A banked principle 2 (architect-ratified 2026-05-09): **"Reason-code reuse is bounded by semantic-state alignment, not just textual fit. When two existing reason codes plausibly fit a new case, choose the one whose canonical semantic exactly matches the case."** `inconsistent` fits exactly; `horn_inconsistency_proven` is a name without an enum entry.

### 3.2 Required nc_self_complement fixture amendment

Single-fixture amendment + manifest mirror (mirrors Q-3-Step4-A's three-file correction shape):

| Surface | Current text | Proposed amendment |
|---|---|---|
| `tests/corpus/nc_self_complement.fixture.js` `expectedReason` field (line ~93 + ~113) | `expectedReason: "horn_inconsistency_proven"` | `expectedReason: "inconsistent"` |
| `tests/corpus/nc_self_complement.fixture.js` `expectedOutcome.summary` + `intendedToCatch` prose | references `horn_inconsistency_proven` | references `inconsistent` |
| `tests/corpus/manifest.json` `nc_self_complement` entry | mirror updates | mirror updates |

### 3.3 Banking the SME error pattern (third instance in Phase 3)

This is the **third** instance of an SME-authored canonical-enum-reference error in Phase 3:

1. **Pass 2a (Step 4 cycle catch):** `cwa_open_predicate.fixture.js` used `expectedReason: "naf_residue"` — caught at Step 4 micro-cycle 2026-05-09 (Q-3-Step4-A); fixed to `open_world_undetermined`.
2. **Pass 2a (Step 4 cycle catch):** `cwa_closed_predicate.fixture.js` + `cwa_open_predicate.fixture.js` used `API §6.3` for closedPredicates — caught during Step 4 verification ritual run (Cat 7); fixed to `API §2 + API §7.1`.
3. **Pass 2a (this cycle's catch):** `nc_self_complement.fixture.js` used `expectedReason: "horn_inconsistency_proven"` — caught now at Step 6 framing.

**Discipline timing observation:** the verification ritual was banked at Step 4 (binding-from-Step-4-forward). Pass 2a fixtures (authored 2026-05-08) were authored BEFORE the ritual was banked; the ritual didn't run retroactively. The Step 4 + Step 5 cycles caught Pass 2a errors as their owning Step's framing surfaced them (cwa_* at Step 4; this nc_* at Step 6).

**SME-routable proposal (banking + remediation):** 

1. **Banking principle:** Verification rituals ratified mid-phase do NOT retroactively apply to pre-ratification path-fence-authored content. Pre-ratification content surfaces its errors at the next production cadence catch (when the affected artifact gets used or referenced); the production catch validates the discipline AS IF the ritual had run pre-ratification.
2. **Remediation proposal:** SME runs a one-shot retroactive verification ritual against the 16 Pass 2a fixtures (8 corpus-before-code + 8 step-N-bind) before Phase 3 Step 7 begins, surfacing any remaining canonical-enum-reference errors as a single batched routing rather than waiting for each Step's framing to catch one. **Architect-final on whether to run the retroactive batch** (SME-domain work; ~30 minutes of grep + manifest update; bounded scope).

### 3.4 Open architect rulings (Q-3-Step6-B)

1. **Option (α') vs (β'):** SME recommends (α') per Q-3-Step4-A precedent. Architect-final.
2. **Banking the SME error pattern + retroactive verification ritual:** SME proposes the retroactive batch. Architect-final.

---

## 4. Additional architect-ratification questions (per Aaron dispatch)

### 4.1 Step 6 implementation strategy — scope

**Question:** Implement `checkConsistency()` against all 4 No-Collapse adversarial fixtures (corpus-before-code per Q-3-E ratification), or scope subset?

**SME-routable proposal:** Implement against all 4 — they're the architectural-commitment-tier contract per Q-3-E. Subset scoping would defeat the corpus-before-code discipline. The 4 fixtures cover:
- `nc_self_complement` — Horn-decidable inconsistency baseline (`inconsistent` reason)
- `nc_horn_incomplete_disjunctive` — non-Horn disjunctive incompleteness (`coherence_indeterminate` reason; populated `unverifiedAxioms`)
- `nc_horn_incomplete_existential` — non-Horn existential incompleteness (`coherence_indeterminate` reason; different unverifiedAxioms)
- `nc_silent_pass_canary` — silent-pass catchall (`MUST NOT` return `result: 'true'`; either `'false'` or `'undetermined'` acceptable)

Architect ratifies all-4 vs subset.

### 4.2 Inconsistency witness extraction — minimum-viable Step 6

**Question:** How minimal must `witnesses[].axioms` be at v0.1?

**Spec/API reference:** API §8.1's interface line 1392: `axioms: FOLAxiom[]; // a minimal inconsistent subset`. The "minimal" annotation is aspirational; the spec doesn't define minimality precisely.

**SME-routable proposal:** Step 6 minimum-viable contract:
- Witnesses contain the **proof-tree axioms** (axioms whose Horn-resolution participated in deriving `inconsistent`)
- "Minimal" means the proof-tree axioms, not the full FOL state
- v0.1 does not commit to set-minimal witnesses (i.e., removing any axiom from the witness still yields an inconsistency proof) — that's an algorithmic minimization beyond Horn-resolution's natural output
- Per spec §8.5.5 + Fandaws Consumer Requirement §7.1's honest-admission discipline: witnesses are sufficient for downstream consumers to identify the contradiction's source

Architect rules whether to tighten to set-minimal at Step 6 or accept proof-tree witnesses as Step 6 minimum.

### 4.3 Cycle-accounting refinement (Q-3-Step6-C)

**Already actionably evidenced.** Phase 3 mid-phase counter at 4 with 3 Steps remaining; the Step 5 banked Phase 3 exit retro candidate "substantive-scope-weighting methodology refinement" surfaces concrete data:

- Phase 3 entry-packet projection: ~3 mid-phase cycles by Phase 3 close
- Phase 3 actual at Step 6: 4 mid-phase cycles (Steps 3, 4, 5, 6)
- Phase 3 actual at Step 9 (projected): possibly 5-7 mid-phase cycles (each remaining Step may surface its own architectural gap)

**SME-routable proposal:** Phase 3 exit retro absorbs three methodology-refinement questions per architect Q-3-Step5-C banking:
1. Was Phase 3's substantive-scope-weighting systematically under-projected, or is the projection mechanism sound but Phase 3 happens to be a high-cycle-density phase?
2. What refinement applies at Phase 4+ entry packets — higher base projection? Per-Step-architectural-surface analysis at entry-cycle?
3. Is the projection mechanism sound at all, or does it require a different cadence-prediction approach (e.g., bayesian-update-from-rolling-evidence)?

Architect-final at Phase 3 exit retro. This cycle just records the actionable evidence.

---

## 5. Side-finding: SME error pattern + retroactive verification ritual proposal

**Pattern:** Three SME-authored canonical-enum-reference errors in Phase 3 (Pass 2a-era + Step 4-cycle ritual catches + this Step 6-cycle catch). All from Pass 2a-era authoring (2026-05-08) before the verification ritual was banked (2026-05-09 at Step 4 cycle).

**Discipline-timing gap:** Verification rituals ratified mid-phase do not retroactively cover pre-ratification content. The discipline-tightening pattern (banked at Pass 2b cycle) operates forward only; Pass 2a content remains un-vetted until each fixture's owning Step surfaces its error.

**SME-routable remediation proposal:** Run a one-shot retroactive verification ritual against all 16 Pass 2a-era fixtures + the related manifest entries before Phase 3 Step 7 begins. Bounded scope: ~30 minutes of grep + manifest entry checks + targeted file reads. Surfaces any remaining errors as a single batched routing rather than per-Step.

**Banking proposal:** Verification rituals ratified mid-phase MAY be applied retroactively to pre-ratification content via a one-shot batch run scoped to the artifacts the ritual would cover. The retroactive run is SME-domain work (mechanical canonical-source checks per the ritual's mechanical character per Step 4 banking principle 6); architect ratifies the run scope; findings route as separate follow-on cycles per their substance. Folding into AUTHORING_DISCIPLINE at Phase 3 exit doc-pass under the verification-ritual subsection.

**Architect-final on:**
1. Run the retroactive batch (yes/no)?
2. Scope: 16 Pass 2a-era fixtures only, or extended to ADR-007 §11 ratified text (pre-Step-3 cycle authoring, also un-vetted)?
3. Findings routing: batch into a single cycle, or per-finding cycles?

---

## 6. Cycle accounting

Per architect's banked cycle-accounting principles:

- **Phase 3 entry-cycle counter:** 2 (closed 2026-05-08)
- **Phase 3 mid-phase counter:** **moves from 3 → 4** (Steps 3 + 4 + 5 + 6 architectural-gap micro-cycles)
- **Phase 2 mid-phase counter:** 6 (closed)
- **Cumulative cycle counter:** not tracked

Counter at 4 exceeds the entry-packet projection at Step 6 with 3 Steps remaining. **Phase 3 exit retro now has actionable evidence for the substantive-scope-weighting methodology refinement** (already banked at Step 5 cycle 2026-05-09).

---

## 7. Sequencing per architect ratification (when received)

1. **Now** — SME draft routes to architect (this cycle); verification ritual run pre-routing per binding-immediately discipline (§10 below)
2. **Architect ratifies Q-3-Step6-A + Q-3-Step6-B + 4.1/4.2/4.3 + side-finding routing**
3. **SME path-domain post-ratification work:**
   - Apply API §8.1 interface amendment per Q-3-Step6-A ruling (rename `consistent` → `result`, three-state type)
   - Apply nc_self_complement fixture amendment per Q-3-Step6-B ruling (`horn_inconsistency_proven` → `inconsistent`)
   - Apply manifest entry mirror update for nc_self_complement
   - (If architect approves the retroactive batch) Run retroactive verification ritual on 16 Pass 2a-era fixtures + ADR-007 §11; surface findings as separate routing
   - Run verification ritual on all corrected artifacts pre-routing per binding-immediately discipline
4. **Pass 2b commit OR bundled Step 6 commit** — Developer's call per Q-3-Step3-C-style discipline
5. **Step 6 implementation** — `checkConsistency()` against all 4 No-Collapse adversarial fixtures per ratified strategy
6. **Step 6 close commit** — implementation lands; remote CI green verification
7. **Phase 3 Step 7 begins** per the SME-proposed step ledger
8. **Phase 3 exit retro forward-tracks:** substantive-scope-weighting methodology refinement now actionably-evidenced; parallel-registry reconciliation (from Step 5); per-canary publication artifact validation (from Q-Frank-4)

---

## 8. Architect Q-rulings resolved (2026-05-09)

| Q | Disposition | Reasoning excerpt |
|---|---|---|
| **Q-3-Step6-A** (consistent type) | ✅ Option (α-2) APPROVED — rename `consistent` → `result` with three-state type | *"Cross-API vocabulary alignment with `EvaluationResult.result` per API §7.1... §8.1.1 narrative preservation... JS truthiness gotcha avoided. Boolean-type-suggesting field names with non-boolean values invite consumer-side truthiness gotchas. Renaming removes the boolean-association cue."* Editorial-correction within v0.1.7 freeze authorized per Pass 2b banking generalization. |
| **Q-3-Step6-B** (horn_inconsistency_proven) | ✅ Option (α') APPROVED — reuse `inconsistent` | *"Per the Q-3-Step4-A banked principle (2026-05-09)... 'Reason-code reuse is bounded by semantic-state alignment, not just textual fit.' The closed-predicate FOLNegation case and the No-Collapse Guarantee inconsistency-proven case both name the same canonical semantic state — refutation proven."* 17-member enum stability holds. |
| **Q-3-Step6-C** (cycle-accounting) | ✅ Concrete data noted; Phase 3 exit retro forward-track stands | *"The Step 6 counter increment from 3 → 4 (exceeding entry-packet projection at Step 6 with 3 Steps remaining) is concrete data, not a mid-phase methodology critique. The SME correctly identifies it as data feeding the Phase 3 exit retro item already forward-tracked."* |
| **§4.1** (Step 6 implementation strategy) | ✅ All 4 No-Collapse fixtures APPROVED — subset refused | *"Either all 4 satisfy at Step 6 close, or Step 6 does not close. Banking: Corpus-before-code fixtures bind their owning Step's implementation as a whole-set contract; subset implementation is refused."* |
| **§4.2** (witness extraction minimum-viable) | ✅ Proof-tree-axioms APPROVED | *"Set-minimization is a separate algorithm... Proof-tree-axioms are sufficient for downstream consumer use... Witness extraction returns proof-tree-axioms (the axioms actually used in the proof) for v0.1; algorithmic set-minimization defers to v0.2+ as optimization."* Editorial correction to API §8.1 adds clarifying sentence about v0.1 minimum-viable. |
| **§4.3** (cycle-accounting at Phase 3 exit retro) | ✅ Forward-tracked item gains data point | Phase 3 exit packet inherits the Step 5 forward-tracked methodology refinement item with this Step 6 data point added: "Phase 3 mid-phase counter reached 4 at Step 6 with 3 Steps remaining (7, 8, 9). Substantive-scope-weighting projection at Phase 3 entry was ~3; Phase 3 exceeds projection by Step 6." |
| **Side-finding** (retroactive verification ritual) | ✅ APPROVED with three structural requirements | **Scope EXTENDED:** 16 Pass 2a-era fixtures + ADR-007 (all sections) + ADR-011 + ADR-013. **Routing BATCHED:** single corrective cycle (per-finding routing refused). **Timing:** before Phase 3 Step 7 begins. Reasoning: error pattern persistence (3 instances confirmed real); mechanical character preserved; one-shot scope bounded; per-finding routing fragments audit trail; before-Step-7 prevents Step 7 framing from re-catching same class. |

---

## 9. Architect-banked principles from this cycle (verbatim per the §11 verbatim-transcription discipline)

Banked verbally by the architect at the ratification cycle 2026-05-09; formalize at AUTHORING_DISCIPLINE Phase 3 exit doc-pass alongside principles from prior Phase 3 cycles. Per the §11 transcription discipline, transcribed verbatim from architect ruling text.

### Substantive principles (6)

1. **Cross-API vocabulary alignment for semantically identical state shapes is binding when the alternative produces multiple mental models for the same state.** *(Q-3-Step6-A reasoning #1)*

2. **Boolean-type-suggesting field names with non-boolean values invite consumer-side truthiness gotchas — rename or retype removes the boolean-association cue.** *(Q-3-Step6-A reasoning #3)*

3. **Phase exit retro forward-tracked items accumulate evidence across mid-phase cycles between forward-track creation and exit retro execution.** Concrete-data observations during this window strengthen the retro's analysis foundation without re-routing the methodology question mid-phase. *(Q-3-Step6-C reinforcement)*

4. **Retroactive ritual scope extends to all artifacts whose ratified text references canonical-source artifacts the ritual would cover at current authoring discipline.** The retroactive scope mirrors the forward scope; both are bounded by the canonical-source-reference criterion. *(Side-finding scope ruling)*

5. **Retroactive ritual batch findings route as a single corrective cycle.** Per-finding routing fragments the audit trail and defeats the consolidation purpose of the retroactive ritual. *(Side-finding routing ruling)*

6. **Corpus-before-code fixtures bind their owning Step's implementation as a whole-set contract; subset implementation is refused.** *(Step 6 implementation strategy ruling)*

### Operational principles (2)

7. **Witness extraction returns proof-tree-axioms for v0.1; algorithmic set-minimization defers to v0.2+ as optimization.** Both readings of "minimal inconsistent subset" satisfy the API §8.1 contract; the v0.1 reading is operationally sufficient for downstream triage. *(Witness extraction minimum-viable ruling)*

8. **Verification rituals serve dual operational purposes: surfacing errors that become routing substance, and validating that path-fence-authored content is clean against canonical sources.** Both purposes are load-bearing; neither subsumes the other. *(Verification ritual dual-purpose banking)*

### Side-finding bankings (also approved)

9. **Verification rituals ratified mid-phase do NOT retroactively apply by default** — they operate forward only; pre-ratification content surfaces errors at next production cadence catch. *(Default-forward-only banking)*

10. **Verification rituals MAY be applied retroactively via one-shot batch runs** scoped to the artifacts the ritual would cover. *(Retroactive-batch-option banking; operationalized this cycle)*

---

## 10. Verification Ritual Report (run on this artifact pre-routing)

Per the binding-immediately discipline + Cat 8 multi-canonical-source banking refinement (architect ruling 2026-05-09): SME ran the 8-category verification ritual on this artifact BEFORE routing to architect.

### Ritual scope (8 check categories)

| # | Category | Result |
|---|---|---|
| 1 | Reason-code references | ✅ All references valid: `inconsistent` (line 26 reason-codes.ts), `coherence_indeterminate` (line 33), `step_cap_exceeded` (line 36); `naf_residue` (LossType not reason; correctly disambiguated); `horn_inconsistency_proven` correctly identified as **NOT** in canonical enum (this is the gap being routed) |
| 2 | LossType references | n/a (no LossType references introduced in this artifact's content beyond `naf_residue` mention as Q-3-Step4-A precedent) |
| 3 | FOL @type | n/a |
| 4 | OWL @type | n/a |
| 5 | Reason enum stability | ✅ "16 + Q-3-C `no_strategy_applies` pending = 17 at Phase 3 close" claim consistent with prior cycles |
| 6 | Spec section references | ✅ §8.5 (line 1281), §8.5.4 (line 1318), §8.5.5 (line 1330) all confirmed exist (per prior-cycle verification + this ritual's spot-check); §0.1 verified |
| 7 | API spec section references | ✅ §7.1 (line 1237 — `evaluate`), §8.1 (line 1365 — `checkConsistency`), §8.1.1 (line 1397 — `unverifiedAxioms`), §11.1 (line 1691 — reason enum), §11.3 (mapping table) all confirmed |
| 8 | ADR/Q-ruling references | ✅ Q-3-Step4-A (Step 4 cycle precedent), Q-3-Step3-A + Q-3-Step5-C item 6 (editorial-correction precedents), Q-Frank-1 (banking generalization), Q-3-E (corpus ratification), Q-3-C (no_strategy_applies addition) all traceable |

### No findings

This artifact's path-fence-authored content verifies clean against canonical sources. The artifact's substance is the routing of TWO existing-canonical-source errors (Q-3-Step6-A interface mismatch + Q-3-Step6-B `horn_inconsistency_proven` non-existence); the artifact CITES these errors but does not introduce new errors.

### Banking from this ritual run

Third production run of the ritual (Step 4 + Step 5 first run + Step 5 second post-ratification run + this Step 6 first run = fourth total run). Continues operationalizing as designed. The ritual's own catch in §1.2 (verifying `horn_inconsistency_proven` is NOT in the enum) was the routing's substance — the ritual operates as both surfacing-mechanism (when errors are introduced) and validation-mechanism (when errors are routed).

---

**End of SME draft. Awaits architect Q-3-Step6-A + Q-3-Step6-B + 4.1/4.2/4.3 + side-finding rulings.**

— SME, 2026-05-09
