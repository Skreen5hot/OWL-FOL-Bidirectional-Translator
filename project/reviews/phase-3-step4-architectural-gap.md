# Phase 3 Step 4 Architectural-Gap Micro-Cycle — RATIFIED

**Date:** 2026-05-09 (initial DRAFT); 2026-05-09 (architect ruling on Q-3-Step4-A + editorial-correction approval + verification-ritual banking ratification); 2026-05-09 (SME applies three-file correction + runs verification ritual)
**Cycle type:** Phase 3 in-Step architectural-gap micro-cycle (second instance; Step 3 micro-cycle was the first 2026-05-09)
**Surfaced by:** Developer reconnaissance during Step 4 implementation framing 2026-05-09
**Status:** **RATIFIED 2026-05-09.** Cycle history: (1) Developer dispatch 2026-05-09 surfaced Q-3-Step4-A architectural gap → (2) SME initial DRAFT 2026-05-09 routed to architect with Option (β) recommendation + banking proposal → (3) architect ruling 2026-05-09: Q-3-Step4-A Option (β) APPROVED; editorial-correction-within-v0.1.7-freeze APPROVED; verification-ritual banking APPROVED with 8-category scope refinement; 4 banked principles + 3 meta-principles → (4) SME applies three-file correction (ADR-007 §11 + cwa_open_predicate fixture + manifest entry) → (5) **SME runs verification ritual on three corrected artifacts per architect's "operationalizes immediately" directive**; ritual catches 3 additional in-scope errors during run + surfaces 1 side-finding (sister fixture has Pass-2a-era same-class error, out-of-scope per architect's "no expansion" directive).

**Blocks:** Phase 3 Step 4 implementation. Does NOT block any Pass 2b parallel work (I5/I6/I7/I8 already absorbed at Pass 2b 2026-05-09).

**Predecessor:** [`phase-3-step3-architectural-gap.md`](./phase-3-step3-architectural-gap.md) (AMENDED + RATIFIED + Pass 2b PROMOTED 2026-05-09); ADR-007 §11 ratified text + new API §5.5 + 5 editorial corrections all on disk awaiting Developer commit cycles.

---

## 1. Surfaced architectural gap (verbatim from Developer's dispatch 2026-05-09)

ADR-007 §11 specifies for the FOLNegation translation rule:

> "If predicate NOT in closedPredicates: 'undetermined' with reason `naf_residue` (matching the LossSignature lossType from API §6.4.1)."

AND in the closing notes:

> "Reason enum stability: The translation rules introduce no new reason codes. `inconsistent` and `naf_residue` exist in the v0.1.7-frozen reason enum; `coherence_indeterminate` exists."

**The gap:** [src/kernel/reason-codes.ts](src/kernel/reason-codes.ts) lines 23-49 + API §11.1 ([OFBT_API_v0.1.7.md:1693-1722](project/OFBT_API_v0.1.7.md)) both list **16 members** and `naf_residue` is **not** among them. `naf_residue` exists ONLY as a **LossType** per API §6.4.1 LossSignature taxonomy — different surface (projector audit at lift time vs evaluator output at query time).

**Verified:** I confirmed by reading reason-codes.ts directly. Members present: `consistent`, `inconsistent`, `satisfiable`, `unsatisfiable`, `open_world_undetermined`, `model_not_found`, `coherence_indeterminate`, `step_cap_exceeded`, `aggregate_step_cap_exceeded`, `cycle_detected`, `unbound_predicate`, `unsupported_construct`, `iri_format_error`, `parse_error`, `tau_prolog_version_mismatch`, `arc_manifest_version_mismatch`. No `naf_residue`.

**Closed-predicate side is clean:** ADR-007 §11 specifies `'false'` with reason `inconsistent`; `inconsistent` IS in the frozen enum (line 26). No amendment needed there.

**Downstream:** [tests/corpus/cwa_open_predicate.fixture.js](tests/corpus/cwa_open_predicate.fixture.js) (Pass 2a SME stub authoring) carries `expectedReason: "naf_residue"` — same gap propagated from the ADR.

---

## 2. Q-3-Step4-A — SME-routable resolution

### 2.1 Recommended option: **(β) Reuse existing `open_world_undetermined`**

SME's strong preference per the spec-vocabulary-alignment + reason-enum-stability lens. Three reasons (β) wins over (α) and (γ):

**1. Semantic alignment with spec §6.3 default-OWA framing.** ADR-007 §11's text for the open-predicate FOLNegation case explicitly cites spec §6.3: "Spec §6.3 default-OWA: `\+ p` succeeding maps to `'undetermined'` (no proof) NOT `'false'`, UNLESS predicate `p` is in `closedPredicates`." The reason code that exists in the frozen enum to name this exact semantic state is `open_world_undetermined` ("OWA: neither query nor its negation provable" per [src/kernel/reason-codes.ts:31](src/kernel/reason-codes.ts#L31) inline doc). This is the existing canonical vocabulary; (α) would create a parallel synonym, (γ) would use a less-aligned label.

**2. Reason-enum-stability discipline preserved.** Pass 2b banking principle 4 (2026-05-09): "Ratified ADR text includes explicit statements of any architectural commitments the section preserves... so future readers can verify the architectural claim without re-deriving it from cycle history." Keeping the enum at 16 members + the architect-ratified `no_strategy_applies` addition pending Q-3-C Step 8 implementation = 17-on-arrival is the explicit commitment the §11 text claimed; (β) honors that commitment. (α) would re-open the enum-stability question (16 → 17 + `naf_residue` = 18) that Pass 2b just closed.

**3. Minimal blast radius.** (β) requires:
- ADR-007 §11 amendment: replace 1 occurrence of `naf_residue` → `open_world_undetermined` in the FOLNegation row + clarify the closing reason-enum-stability statement
- `cwa_open_predicate` fixture stub-fill: replace 1 occurrence of `expectedReason: "naf_residue"` → `expectedReason: "open_world_undetermined"`
- Manifest entry for `cwa_open_predicate`: same 1-line replacement

(α) would require: REASON_CODES literal addition + REASON_CODES_LIST + API §11.1 enum + §11.3 mapping table + §11 member-count statements + ADR-007 §11 reason-enum-stability + ADR-011 reason-enum-stability + package.json + spec cross-references + manifest schema if applicable. ~10-12 file touches. Reopens ratified architectural-commitment-tier surface for a problem (β) solves with 3 file touches.

### 2.2 Why (γ) `unbound_predicate` is rejected

`unbound_predicate` per [reason-codes.ts:39](src/kernel/reason-codes.ts#L39) carries the literal "predicate has no facts/rules" semantic. The open-predicate FOLNegation case is NOT about the predicate being unbound — it's about the predicate being **open** (default OWA), which is a meta-semantic stance, not a facts/rules-availability claim. A predicate `p` may have many facts and rules and STILL produce `\+ p(specific_args)` succeeding under OWA. Using `unbound_predicate` here would mis-attribute the indeterminacy to predicate-state rather than to the OWA framing.

### 2.3 Required ADR-007 §11 amendment

**Single-row amendment + closing-statement amendment:**

| Surface | Current text (per Pass 2b ratified 2026-05-09) | Proposed amendment |
|---|---|---|
| §11 per-variant table FOLNegation row "If predicate NOT in `closedPredicates`" clause | `'undetermined'` with reason `naf_residue` (matching the LossSignature `lossType` per API §6.4.1) | `'undetermined'` with reason **`open_world_undetermined`** (matching spec §6.3 default-OWA framing + the existing reason enum entry per [src/kernel/reason-codes.ts:31](src/kernel/reason-codes.ts#L31); the `naf_residue` lossType per API §6.4.1 is the projector-side audit-artifact label and is structurally distinct from the evaluator-side reason code per the audit-vs-evaluator-surface separation) |
| §11 per-variant table FOLNegation row reason-code column | `inconsistent` (closed-predicate); `naf_residue` (open-predicate default OWA) | `inconsistent` (closed-predicate); `open_world_undetermined` (open-predicate default OWA) |
| §11 closing "Reason enum stability" statement | "`inconsistent` and `naf_residue` exist in the v0.1.7-frozen reason enum; `coherence_indeterminate` exists." | "`inconsistent`, `open_world_undetermined`, and `coherence_indeterminate` all exist in the v0.1.7-frozen reason enum (16 members at v0.1.7 freeze; `no_strategy_applies` adds at Step 8 per Q-3-C 2026-05-08 ratification → 17 members at Phase 3 close). The translation rules introduce no new reason codes. The `naf_residue` lossType per API §6.4.1 is the projector-side audit-artifact label and is structurally distinct from any evaluator-side reason code — the two surfaces correlate semantically (both name NAF-failure-to-prove cases) but use different vocabularies because they record different events (projector audit at lift time vs evaluator output at query time)." |

### 2.4 Required cwa_open_predicate fixture amendment

[tests/corpus/cwa_open_predicate.fixture.js](tests/corpus/cwa_open_predicate.fixture.js) — single-line change:

```diff
   "expected_v0.1_verdict": {
     ...
-    expectedReason: "naf_residue",
+    expectedReason: "open_world_undetermined",
     stepBinding: 4,
     activationTiming: "step-N-bind"
   },
```

Plus the manifest entry's mirror update at [tests/corpus/manifest.json](tests/corpus/manifest.json) for `cwa_open_predicate`.

The fixture's `expectedOutcome.summary` prose should also amend to reference `open_world_undetermined` rather than `naf_residue` to keep prose + structured field aligned.

### 2.5 Open architect rulings (Q-3-Step4-A)

Architect ratifies:

1. **Option (α/β/γ):** SME recommends (β) per §2.1 reasoning. Architect-final.
2. **ADR-007 §11 amendment scope:** SME-drafted §2.3 amendment table covers the FOLNegation row + the closing reason-enum-stability statement. Architect-final on the exact amendment text or routes refinements.
3. **cwa_open_predicate fixture amendment:** SME proposes 2 file touches (fixture + manifest entry). Architect-final.
4. **Editorial-correction within v0.1.7 freeze vs Pass 2b-style separate-cycle ratification:** SME proposes editorial-correction-within-v0.1.7-freeze treatment per the Pass 2b banked principle 2 ("editorial corrections include language tightening to reflect newly-introduced API surfaces architecturally implicit but not textually explicit"). The reason-code reference is editorial: ADR-007 §11's substance (open-predicate NAF maps to `'undetermined'` reason code) is unchanged; only the exact reason-code label corrects to the canonical enum value. Architect-final.

---

## 3. Banking proposal — verification-ritual extension to spec/ADR layer

This is the **second instance** of the same class of error this cycle has surfaced:

- **Phase 2 Step 4 Concern B:** `body` vs `inner` for `fol:Negation` (FOL-input fixture; canonical type-shape vs SME-authored shape mismatch)
- **Phase 3 Pass 2a:** `@type: "ObjectSomeValuesFrom"` vs `"Restriction"` + `properties: [...]` vs `first/second` (OWL-input fixtures; canonical JSON-LD discriminator vs SME-authored discriminator mismatch)
- **Phase 3 Step 4 (this cycle):** `naf_residue` vs `open_world_undetermined` (spec/ADR layer; canonical enum-value vs SME-authored enum-value mismatch)

The first two surfaced at fixture layer and were banked at Phase 3 entry packet doc-pass via the SME pre-handoff verification ritual extension. This third surfaces at spec/ADR layer — a class the existing banking did not cover.

**Proposed banking principle (architect ratifies; folds at Phase 3 exit doc-pass):**

> **SME pre-handoff verification ritual extends to spec/ADR layer.** ADR or spec text referencing reason codes / lossTypes / other frozen-enum members MUST cross-reference the canonical enum file (`src/kernel/reason-codes.ts`; `src/kernel/projector-types.ts`; analogous canonical-enum files for future enums) at authoring time. The verification ritual: before architect ratification, SME confirms each enum-member reference in the proposed text appears verbatim in the canonical enum file. This catches the gap before architect ratification rather than at Step-N implementation. Same discipline as the OWL-input/FOL-input fixture verification rituals (Pass 2a banking + Phase 2 Step 4 Concern B precedent), now extended to the spec/ADR layer.

The verification ritual is mechanical — `Grep` for each candidate enum-member name in the canonical file before the artifact routes for ratification. The architect's trust posture ("I have not read the actual artifact text") makes SME-side verification the only effective gate; the ritual operationalizes that.

**Architectural-commitment-tier framing:** The architect explicitly noted at Pass 2b: "Ratified ADR text includes explicit statements of any architectural commitments the section preserves so future readers can verify the architectural claim without re-deriving it from cycle history." The verification ritual extends this discipline backward: **not just the future reader needs to verify the architectural claim — the SME at authoring time needs to verify the architectural claim against the canonical enum file BEFORE the ratified text is written.**

---

## 4. Cycle accounting

Per the Pass 2b banked cycle-accounting refinement (§5 banked principle 3 + 6 of phase-3-step3-architectural-gap.md):

- **Phase 3 entry-cycle counter:** 2 (closed 2026-05-08)
- **Phase 3 mid-phase counter:** **moves from 1 → 2** (Step 3 architectural-gap micro-cycle 2026-05-09 + this Step 4 architectural-gap micro-cycle 2026-05-09)
- **Phase 2 mid-phase counter:** 6 (closed)
- **Cumulative cycle counter:** not tracked

Pass 2b confirmation cycles still don't increment per Pass 2b banked principle 6. The Pass 2b that may follow this Step 4 ratification (if architect routes ADR-007 §11 amendment as a separate Pass 2b cycle rather than editorial-correction-within-v0.1.7-freeze) does not increment.

**Substantive-scope-weighting projection:** Phase 3 mid-phase counter at 2 after Step 4 framing; the projected ~3 by Phase 3 close is on track.

---

## 5. Sequencing per architect ratification (when received)

1. **Now** — SME draft routes to architect (this cycle)
2. **Architect ratifies Q-3-Step4-A** + the banking proposal + editorial-correction disposition
3. **SME path-domain work post-ratification:**
   - Amend ADR-007 §11 per §2.3 amendment table
   - Amend [tests/corpus/cwa_open_predicate.fixture.js](tests/corpus/cwa_open_predicate.fixture.js) per §2.4
   - Amend [tests/corpus/manifest.json](tests/corpus/manifest.json) entry for cwa_open_predicate
4. **Developer commit** — bundled into Step 4 implementation commit OR standalone per Q-3-Step3-C-style ratification (Developer's call)
5. **Step 4 implementation proceeds** against ratified contracts

Post-ratification work mirrors the Step 3 micro-cycle's Pass 2b shape: SME path-fence-authors → architect ratifies (or absorbs as editorial correction) → Developer commits.

---

## 6. Architect Q-rulings resolved (2026-05-09)

| Q | Disposition | Reasoning excerpt |
|---|---|---|
| **Q-3-Step4-A** | ✅ Option (β) APPROVED | *"Reuse open_world_undetermined for the open-predicate FOLNegation case under default-OWA. Approved as the SME drafted... Spec §6.3 vocabulary alignment is the load-bearing structural reason... Reason-enum-stability discipline preservation... Pass 2b banked principle binds: ratified ADR text includes explicit statements of architectural commitments... Among options that preserve the same architectural commitment, the smaller-blast-radius option wins absent asymmetric benefit."* |
| **Editorial-correction disposition** | ✅ APPROVED within v0.1.7 freeze | *"The reason-code reference correction is the analog at the ADR ratified-text layer: language tightening to reflect the canonical enum that was architecturally implicit (ADR-007 §11's substantive intent) but not textually explicit (the wrong label was written). The Pass 2b banking generalizes correctly."* |
| **Verification-ritual banking** | ✅ APPROVED with refinement | *"The banking proposal is the architecturally-correct response to the surfaced error pattern... Three-instance pattern is real... Discipline gap operationalizes the architect's trust posture... Mechanical character of the verification ritual."* Refinement scope: 8 check categories (reason-code references, LossType references, FOLAxiom @type discriminators, OWLAxiom @type discriminators, reason-enum-stability statements, spec section references, API spec section references, ADR section references). |

---

## 7. Architect-banked principles from this cycle (verbatim per the §11 verbatim-transcription discipline)

Banked verbally by the architect at the ratification cycle 2026-05-09; formalize at AUTHORING_DISCIPLINE Phase 3 exit doc-pass alongside principles 1–10 from Phase 3 entry cycles + 6 from Step 3 micro-cycle. Per the §11 transcription discipline, transcribed verbatim from architect ruling text.

### Substantive principles (4)

1. **Among options that preserve the same architectural commitment, the smaller-blast-radius option wins absent asymmetric benefit.** Blast radius is a load-bearing comparator. *(Q-3-Step4-A reasoning #3)*

2. **Reason-code reuse is bounded by semantic-state alignment, not just textual fit.** When two existing reason codes plausibly fit a new case, choose the one whose canonical semantic exactly matches the case; refuse the looser fit even if the textual fit is closer. *(Q-3-Step4-A Option (γ) refusal reasoning)*

3. **Editorial corrections within v0.1.7 freeze include reason-code label corrections in ratified ADR text** when the canonical enum value differs from the as-written label and the ADR's substantive intent is unchanged. *(Editorial-correction generalization of Pass 2b banking)*

4. **SME pre-handoff verification rituals are mechanical canonical-source checks against artifact text references, scoped to the canonical enums, type discriminators, section references, and cross-reference anchors that path-fence-authored artifacts reference.** The ritual operationalizes the architect's trust posture by catching reference-correctness issues at SME-handoff time rather than post-ratification. *(SME pre-handoff verification ritual banking)*

### Meta-principles (3)

5. **Pass 2b banked principles bind subsequent cycles' ratifications.** Explicit-statement discipline is not just documentation polish; it is a load-bearing constraint. *(Reason-enum-stability binding effect)*

6. **Pre-handoff verification ritual is mechanical, not architectural-judgment-exercising.** Mechanical character is the load-bearing operational property. *(Verification-ritual character banking)*

7. **Discipline tightenings follow the same routing pattern as architectural commitments:** surfaced gap → proposed tightening → ratification → AUTHORING_DISCIPLINE folding-in. Speculative discipline-tightening is refused. *(Discipline-tightening-cycle banking)*

### Cycle-accounting refinement (architect-banked 2026-05-09)

**Substantive-scope-weighting projections at phase entry remain useful predictors of mid-phase cycle counts when the per-phase architectural surface count is correctly estimated at entry.** Phase 3's projected ~3 mid-phase cycles aligns with current trajectory. *(Cycle-accounting projection accuracy banking)*

---

## 8. Verification Ritual Report (2026-05-09)

Per architect's "operationalizes immediately on this cycle's three-file correction" directive: SME ran the 8-category verification ritual on the three corrected artifacts BEFORE routing the Pass 2b commit.

### Ritual scope (per architect-ratified 8 check categories)

| # | Category | Canonical source |
|---|---|---|
| 1 | Reason-code references | `src/kernel/reason-codes.ts` |
| 2 | LossType references | API §6.4.1 enumeration |
| 3 | FOLAxiom @type discriminators | `src/kernel/fol-types.ts` (or canonical FOL types file) |
| 4 | OWLAxiom @type discriminators | `src/kernel/owl-types.ts` |
| 5 | Reason enum stability statements | Count canonical enum |
| 6 | Spec section references | `project/OFBT_spec_v0.1.7.md` |
| 7 | API spec section references | `project/OFBT_API_v0.1.7.md` |
| 8 | ADR section references | `project/DECISIONS.md` + Q-rulings traceable to architect ratifications |

### In-scope corrections applied during ritual run

The ritual surfaced 3 additional reference errors during its run on the three target artifacts:

| Finding | Class | Disposition |
|---|---|---|
| `cwa_open_predicate.fixture.js` JSDoc lines 2 + 11 still cited old `naf_residue` reason | Cat 1 (reason-code reference) — stale post-correction prose | ✅ FIXED in-line: corrected to `open_world_undetermined` |
| `closure_truncated` cited as wrong reason code in fixture + manifest `intendedToCatch` | Cat 1 (reason-code reference) — `closure_truncated` is a LossType per API §6.4.1, NOT a reason code; cannot be a wrong reason code | ✅ FIXED in-line: removed `closure_truncated`; kept `unbound_predicate` (real reason code per Q-3-Step4-A Option γ refusal reasoning) |
| `API §6.3` cited as `closedPredicates` location in DECISIONS.md, fixture JSDoc + relatedSpecSections, manifest specSections | Cat 7 (API spec section reference) — API §6.3 is `roundTripCheck`; `closedPredicates` lives at API §2 `QueryParameters.closedPredicates`, consumed by `evaluate` per API §7.1 | ✅ FIXED in-line: 3 occurrences corrected to "API §2 (QueryParameters.closedPredicates) + API §7.1 (evaluate consumes)" |

### Side-finding (out-of-scope for this cycle)

| Finding | Class | Disposition |
|---|---|---|
| `cwa_closed_predicate.fixture.js` (sister fixture) has same `API §6.3` Pass-2a-era error | Cat 7 — same-class error in sister fixture; NOT in this cycle's three-file scope | ⏭ **Surface to architect/Aaron as separate finding.** Per architect's "No expansion of the verification-ritual scope beyond the eight check categories enumerated. Future expansions route as their own cycles when surfaced by real production catches" — the verification ritual surfacing the same-class error in a sister fixture IS the surfaced production catch warranting a separate cycle. SME proposes a small follow-on cycle (or absorption into Step 4 implementation commit's editorial-correction discipline) to fix the sister fixture's `API §6.3` reference. Architect-final on routing. |

### Categories with no findings on this cycle's three artifacts

- Cat 2 (LossType): `naf_residue` correctly identified as LossType per API §6.4.1 (verified at line 1126); no false positives
- Cat 3 (FOLAxiom @type): no FOL @type discriminators introduced in this cycle's corrections
- Cat 4 (OWLAxiom @type): no OWL @type discriminators introduced in this cycle's corrections
- Cat 5 (reason enum stability count): "16 members at v0.1.7 freeze; 17 at Phase 3 close per Q-3-C addition" verified by direct read of reason-codes.ts (16 members confirmed)
- Cat 6 (spec section references): §6.3, §6.3.2, §13.1 confirmed exist
- Cat 8 (ADR/Q-ruling references): Q-3-Step3-B, Q-3-Step4-A, Q-3-C, Q-3-E, ADR-007 §11, ADR-011 all traceable

### Banking from ritual run

The ritual surfaced 3 in-scope errors that would have passed architect ratification (per the architect's stated trust posture: "I have not read the actual artifact text directly"). The banked discipline operationalizes immediately and pays its dividend on its first run — exactly the discipline-tightening-cycle pattern banked at meta-principle 7.

The side-finding (sister-fixture same-class error) demonstrates a second discipline property: **the ritual run on a corrected artifact often surfaces same-class errors in adjacent artifacts that are out-of-scope for the current cycle but warrant their own cycles.** Folding into AUTHORING_DISCIPLINE at Phase 3 exit doc-pass under "Verification ritual side-finding discipline" — the ritual scope is binding (per architect "no expansion"), but side-findings surface naturally and route as their own cycles.

---

## 9. Sequencing per architect ratification 2026-05-09

In order:

1. **Now** — Architect ruling on Q-3-Step4-A + editorial-correction + verification-ritual banking received (this cycle, this RATIFIED packet records the rulings)
2. ✅ **SME path-fence-authors three-file correction:** ADR-007 §11 per-variant table + cwa_open_predicate fixture + manifest entry
3. ✅ **SME runs verification ritual on corrected artifacts** — operationalized immediately per architect directive; 3 in-scope corrections applied during run; 1 side-finding surfaced for separate routing
4. **⏳ Pass 2b commit** — Developer commits the three-file correction (now four-file with the in-scope ritual-surfaced corrections folded in: same three target artifacts, just with additional fixes in the same files); commit body cites architect ratification + verification-ritual report; bundled with Step 4 implementation OR standalone `docs:` per Developer's call
5. **⏳ Side-finding routing** — `cwa_closed_predicate.fixture.js` sister-fixture `API §6.3` reference correction: SME-routable proposal is to absorb into Step 4 implementation commit's editorial-correction discipline (since the same wrong-section-reference-class error and the same `closedPredicates` semantic) OR route as a separate micro-cycle. Architect-final on routing.
6. **⏳ Step 4 implementation** — proceeds against ratified contracts; Developer-only cycle
7. **⏳ Step 4 close commit** — implementation lands; remote CI green verification
8. **⏳ Phase 3 Step 5 begins** per the SME-proposed step ledger

The verification ritual operationalizes immediately on this cycle and is binding from this cycle forward per architect ruling.

---

**End of RATIFIED packet. SME path-fence-authoring + verification ritual complete; Developer commits authorized.**

— SME, 2026-05-09
