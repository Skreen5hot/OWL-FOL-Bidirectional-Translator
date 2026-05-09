# Phase 3 Step 5 Architectural-Gap Micro-Cycle — RATIFIED

**Date:** 2026-05-09 (initial DRAFT); 2026-05-09 (architect rulings on Q-3-Step5-A + Q-3-Step5-B + Q-3-Step5-C + side-finding + verification-ritual production-catch banking + cycle-accounting observation); 2026-05-09 (SME path-fence-authoring of ADR-013 + cross-references + spec §13 update post-rulings)
**Cycle type:** Phase 3 in-Step architectural-gap micro-cycle (third instance; Steps 3 + 4 micro-cycles preceded at `a6753d3` and `b66c6e2`)
**Surfaced by:** Developer reconnaissance during Step 5 framing 2026-05-09
**Status:** **RATIFIED 2026-05-09.** Cycle history: (1) Developer dispatch 2026-05-09 surfaced Q-3-Step5-A/B/C + side-finding → (2) SME initial DRAFT 2026-05-09 routed to architect with Option (i) + Strategy (A) recommendations + verification ritual run pre-routing (caught spec §3.4.4 reference error, fixed inline) → (3) **architect ruling 2026-05-09:** Q-3-Step5-A Option (i) APPROVED with two refinements (determinism statement explicit citation of spec §0.1 three-tier framing; SLG migration framing with Phase 4-7 escape clause); Q-3-Step5-B Strategy (A) APPROVED; Q-3-Step5-C 6 sub-questions APPROVED with three refinements; side-finding APPROVED with bounded fix this cycle + Phase 3 exit retro forward-track; verification-ritual production-catch banked explicitly; cycle-accounting projection-exceedance observation banked as Phase 3 exit retro candidate; 5 substantive principles + 1 meta-principle banked → (4) AMENDED packet (this version) folds rulings: §9 + §10 filled with rulings + 6 banked principles verbatim per the verbatim-transcription discipline; §7 cycle accounting refined; Phase 3 exit retro forward-tracks recorded.

**Blocks:** Phase 3 Step 5 implementation. Does NOT block any pending parallel cycles (Pass 2b queue: I5/I6/I7/I8 still pending separate cycles).

**Predecessors:**
- [`phase-3-step3-architectural-gap.md`](./phase-3-step3-architectural-gap.md) (RATIFIED + Pass 2b PROMOTED 2026-05-09)
- [`phase-3-step4-architectural-gap.md`](./phase-3-step4-architectural-gap.md) (RATIFIED 2026-05-09 with verification-ritual operationalization)

---

## 1. Surfaced architectural gaps (verbatim from Developer dispatch 2026-05-09)

### 1.1 Q-3-Step5-A — ADR-011 numbering collision + missing visited-ancestor canonical ADR

The cycle-guard ADR-011 referenced throughout spec §5.4, ADR-007 §1, and ADR-007 §11 (committed at `a6753d3`) does NOT exist as a substantive ADR in `project/DECISIONS.md`. The number ADR-011 in DECISIONS.md is taken by the audit-artifact `@id` content-addressing scheme (line 533 — verified by SME `Grep`).

**Cross-references that need resolution:**
- spec §13 ADR index line 1406 (currently lists ADR-011 as "SLD termination via cycle-detection guards")
- ADR-007 §1 (DECISIONS.md lines 144-150, "Cycle-guarded SLD ingestion (visited-ancestor list per ADR-011) is the Phase 3 evaluator's concern")
- ADR-007 §11 (DECISIONS.md, "The cycle-guarded SLD ingestion per ADR-011 (visited-ancestor list) wraps the translation")

**Verified:** SME read DECISIONS.md ADR-011 directly — it is "Audit-artifact `@id` content-addressing scheme — LossSignature + RecoveryPayload" (line 533). The cycle-guard pattern referenced in spec §13 + ADR-007 has no corresponding implementation-side ADR.

### 1.2 Q-3-Step5-B — Step 5 cycle-termination implementation strategy

Three candidate strategies (per Developer dispatch):

| Strategy | Spec-faithful? | Implementation surface | Pros | Cons |
|---|---|---|---|---|
| (A) Visited-ancestor encoding | ✅ Spec §5.4 literal | FOL→Prolog translator rewrites cycle-prone predicates to thread visited-ancestor list arg | Spec-faithful; deterministic cycle catch; produces `cycle_detected` cleanly | Substantive translator rework; per-predicate cycle-prone flagging needs architect rules |
| (B) Tau Prolog step-bound only | ❌ | None (already wired) | Trivial | NOT spec-faithful; can't distinguish `cycle_detected` from `step_cap_exceeded` (Step 8 binding); fails cycle fixtures' contract semantically |
| (C) Hybrid: Tau Prolog step-bound + cycle-distinguisher heuristic | ⚠ Partial | Augment evaluate()'s step-cap-exhaust handler with per-predicate-recursion-depth tracker | Implementable in evaluator code; doesn't require translator rework | Heuristic can have false positives/negatives; not directly aligned with spec §5.4's visited-ancestor model |

### 1.3 Q-3-Step5-C — Six architect-ratification questions

1. ADR numbering: Option (i) new ADR-013 in DECISIONS.md vs Option (ii) re-number existing ADR-011
2. ADR text scope: visited-ancestor pattern only, or includes the depth-bound interaction (`closure_truncated` LossSignature emission)?
3. Step 5 strategy: A / B / C
4. Cycle-prone predicate classification (which lifter-emitted predicates get the visited-ancestor wrapping)
5. Step 5 scope (does Step 5 minimum include `closure_truncated` LossSignature emission, or strictly `cycle_detected`?)
6. Spec §13 ADR index update: editorial correction within v0.1.7 freeze per Q-3-Step3-A precedent + Q-Frank-1 generalization?

---

## 2. Q-3-Step5-A — SME-routable resolution: new ADR-013 in DECISIONS.md

### 2.1 Recommended option: **(i) new ADR-013 with next available DECISIONS.md number**

SME's strong preference per the blast-radius + audit-trail-unity-per-surface lens. Two reasons (i) wins over (ii):

**1. Blast radius.** Option (i) creates one new ADR section in DECISIONS.md + updates 2-3 cross-references in ADR-007 (§1 + §11) + 1 spec §13 ADR index entry refinement = ~4 file touches. Option (ii) re-numbers existing ADR-011 (audit-artifact @id), breaking every existing cross-reference to ADR-011 audit-artifact discipline — verified via `Grep`: 11 audit-artifact `@id` cross-references in DECISIONS.md alone (the §11 reuse-existing-reason-code reasoning, the LossSignature `@id` schema, the RecoveryPayload `@id` schema), plus references in API spec §6.4.1, behavioral spec §7.5, fixture metadata, manifest entries, and CI gate. ~30+ file touches against an architectural-commitment-tier surface. Per Q-3-Step4-A banked principle 1: **"Among options that preserve the same architectural commitment, the smaller-blast-radius option wins absent asymmetric benefit."**

**2. Audit-trail-unity-per-surface preserves per Q-3-G banking.** Option (ii) corrupts the audit trail for two ADRs at once: re-numbered ADR-011 audit-artifact @id loses its single-SHA promotion history (Phase 2 Step 4 spec-binding cycle 2026-05-07), and the new visited-ancestor ADR inherits a number with prior audit history attached. Option (i) creates fresh audit trail for the visited-ancestor ADR with its own promotion history; ADR-011 audit-artifact @id keeps its history intact.

### 2.2 Numbering note (parallel-registry observation)

DECISIONS.md currently has ADR-001 through ADR-012 (12 ADRs). The next available number is **ADR-013**.

**Side-finding:** spec §13's ADR table has 21 entries (ADR-001 through ADR-021) — verified via `Grep`. The two registers (spec §13 ADR table vs DECISIONS.md) appear to use different numbering systems entirely; the cross-references in DECISIONS.md (e.g., ADR-007 §1 "per ADR-011") implicitly disambiguate by reading context (DECISIONS.md ADR-011 is audit @id; spec §13 ADR-011 is cycle-guard, but no canonical ADR text exists for it). This broader parallel-registry disconnect is detailed in §5 below as a Phase 3 exit retro candidate; for THIS micro-cycle, the bounded fix is creating ADR-013 in DECISIONS.md and updating the 2-3 cross-references.

### 2.3 Proposed ADR-013 ratified text (SME draft)

> ## ADR-013: Visited-ancestor cycle-guard pattern for cycle-prone predicates [PROPOSED at Phase 3 Step 5 architectural-gap micro-cycle 2026-05-09]
>
> **Status:** Proposed (architect ratifies at this micro-cycle's architect-ratification cycle).
>
> **Decision:** Phase 3 evaluator implements cycle termination for SLD resolution via the visited-ancestor list pattern. At FOL → Tau Prolog translation time (per ADR-007 §11), cycle-prone predicates are rewritten to thread an additional `Visited` list argument; SLD resolution checks before each recursive expansion whether the proposed expansion's binding is already in the visited list. If yes, emit `cycle_detected` reason code (per API §11.1 reason enum) rather than expand. The visited list grows monotonically per resolution path; backtracking does not pollute parallel paths.
>
> **Pattern:** for cycle-prone predicate `p(X, Y)` with body `p(X, Z), p(Z, Y)` (transitive closure), the translation rewrites to:
>
> ```prolog
> p(X, Y) :- p_guard(X, Y, []).
> p_guard(X, Y, Visited) :-
>   p_orig(X, Y).
> p_guard(X, Y, Visited) :-
>   p_orig(X, Z),
>   \+ member(Z, Visited),
>   p_guard(Z, Y, [Z | Visited]).
> ```
>
> Where `p_orig(X, Y)` is the directly-asserted form (per ADR-007 §9 reserved-predicate canonical form discipline + spec §5.5's identity machinery patterns).
>
> **Cycle-prone predicate classification (architect ratifies in Q-3-Step5-C item 4):** Predicates eligible for visited-ancestor wrapping include:
>   1. `TransitiveObjectProperty`-derived rules (∀x,y,z. P(x,y) ∧ P(y,z) → P(x,z))
>   2. `SymmetricObjectProperty`-derived rules (∀x,y. P(x,y) → P(y,x))
>   3. Recursive `SubClassOf` chains where transitive closure can re-enter the chain (e.g., A ⊑ B ⊑ A via EquivalentClasses)
>   4. `same_as` identity propagation rules per spec §5.5 + ADR-010 (DECISIONS.md ADR-010 is the license-verification ADR; this references the parallel-registry spec §13 ADR-010 "Identity handling via rule-based same_as propagation" — see §5 disambiguation note)
>   5. `InverseObjectProperties`-derived bidirectional implication pair per ADR-007 §4 (cycles potential when paired with transitive)
>   6. Connected-With bridge axiom per spec §3.4.1 (parthood-extension via the inferential closure under the bridge axiom; the bridge is `P(x,y) → ∀z. C(z,x) → C(z,y)` per spec §3.4.1)
>
> **Detection emission:** when SLD resolution attempts to expand a goal whose binding-set is already in the visited list, the evaluator returns `cycle_detected` per API §11.1 reason enum + emits no LossSignature for this case (cycle is a termination signal, not an information loss). Closure-truncation cases (resolution depth bound exceeded per spec §5.4) emit `closure_truncated` LossSignature per Step 8 surface; cycle-detection cases stay clean.
>
> **Determinism:** the visited-ancestor pattern is deterministic per spec §0.1 + API §6.1.1's byte-stability contract — the rewrite at translation time is deterministic; the SLD resolution order is bounded by spec §5.4's depth bound; the cycle check is order-invariant within a single resolution path.
>
> **v0.2 path:** SLG tabling (per spec §13's deferred v0.2 entry) replaces the visited-ancestor list with full tabled-resolution semantics. The v0.1 visited-ancestor pattern is the bounded predecessor; v0.2 SLG migration does not break audit artifacts (cycle_detected stays in the reason enum; the wrapping pattern's evidence — translated Prolog rules — is regenerable from FOL state).
>
> **Implementation status:** Proposed at Phase 3 Step 5 micro-cycle 2026-05-09; implementation lands at Step 5 close per Q-3-Step5-B Strategy (A) ratification. Cross-references from ADR-007 §1 + §11 update from "per ADR-011" to "per ADR-013" at the editorial-correction commit per Q-3-Step5-C item 6.
>
> **Banked principles from this ADR:**
> 1. Cycle termination at SLD ingestion uses the visited-ancestor pattern; spec §5.4 literal framing is binding.
> 2. Cycle-prone predicate classification is an architect-ratified set; Phase 3 ratification covers six classes (transitive, symmetric, recursive subClassOf, same_as, inverse pairs, parthood-extension); Phase 4+ ARC content may extend.

### 2.4 Required cross-reference updates (3-4 file touches)

| Surface | Current | Proposed |
|---|---|---|
| `project/DECISIONS.md` | (no ADR-013) | NEW: ADR-013 ratified text per §2.3 above |
| `project/DECISIONS.md` ADR-007 §1 lines 144-150 | "Cycle-guarded SLD ingestion (visited-ancestor list per ADR-011) is the Phase 3 evaluator's concern" | "Cycle-guarded SLD ingestion (visited-ancestor list per ADR-013) is the Phase 3 evaluator's concern" |
| `project/DECISIONS.md` ADR-007 §11 implementation notes | "The cycle-guarded SLD ingestion per ADR-011 (visited-ancestor list) wraps the translation" | "The cycle-guarded SLD ingestion per ADR-013 (visited-ancestor list) wraps the translation" |
| `project/OFBT_spec_v0.1.7.md` §13 ADR index line 1406 | "ADR-011 \| SLD termination via cycle-detection guards (v0.1.2) with SLG tabling planned for v0.2 \| Accepted" | (per Q-3-Step5-C item 6 ruling — editorial correction within v0.1.7 freeze; spec ADR table cross-references to DECISIONS.md ADR-013 OR retains the spec-side ADR number with disambiguation; see §5 broader-finding for full reconciliation discussion) |

### 2.5 Open architect rulings (Q-3-Step5-A)

1. **Option (i) vs (ii):** SME recommends (i). Architect-final.
2. **ADR-013 ratified text scope:** SME-drafted §2.3 text covers the pattern + classification + emission + determinism + v0.2 path. Architect-final or routes refinements (item 4 ratification refines the classification list).
3. **Cross-reference update:** SME proposes 3 in-DECISIONS.md updates (ADR-013 new + ADR-007 §1 + ADR-007 §11). Spec §13 ADR index update folded into Q-3-Step5-C item 6.

---

## 3. Q-3-Step5-B — SME-routable resolution: Strategy (A) visited-ancestor encoding

### 3.1 Recommended Strategy: **(A) Visited-ancestor encoding**

SME's strong preference. Three reasons (A) wins over (B) and (C):

**1. Spec §5.4 literal framing is binding.** Spec §5.4: "the lifter rewrites these axioms to thread visited-ancestor lists." Per the Q-Step6-1 banked principle ("Spec interpretation defaults to literal framing"), the literal framing is binding when both options are technically defensible. Strategy (A) honors the spec literally; (B) ignores the spec; (C) partially aligns but uses heuristic-inference rather than the spec's structural pattern.

**2. Reason-code semantic alignment.** Strategy (A) produces `cycle_detected` cleanly when the visited-list check fires — matches the API §11.1 reason enum's `cycle_detected` member's documented semantic ("predicate has a cycle"). Strategy (B) cannot distinguish `cycle_detected` from `step_cap_exceeded` (Step 8 binding); a fixture asserting `expectedReason: "cycle_detected"` would fail under (B). Strategy (C)'s heuristic could produce false positives (`cycle_detected` when actual cause is depth-bound) or false negatives (`step_cap_exceeded` when actual cause is cycle).

**3. v0.2 forward-compat.** v0.2's planned SLG tabling per spec §13 deferred-v0.2 entry replaces the visited-ancestor list with tabled-resolution semantics. Strategy (A)'s implementation is the natural predecessor — the same translation-time rewrite point in v0.2 swaps visited-ancestor for tabled call/answer table. (B) and (C) have no clean v0.2 migration path; they'd need fresh implementation work at v0.2 because their current implementation surface doesn't match the SLG tabling surface.

### 3.2 Implementation overhead bounded

The Developer's observation is correct: the lifter already emits classical FOL for known-cycle-prone predicates (transitive, symmetric, etc.); the rewrite is a translator post-pass on those specific patterns at `loadOntology` time per ADR-007 §11. The translator post-pass:
1. Classifies each lifted FOLAxiom against the cycle-prone-predicate classification (item 4 architect ratification)
2. For cycle-prone axioms, rewrites the Prolog clause to thread the `Visited` list argument
3. For non-cycle-prone axioms, emits the standard Prolog clause unchanged

The classification step is deterministic per spec §0.1 + API §6.1.1 + ADR-007 §9 reserved-predicate canonical form discipline.

### 3.3 Open architect rulings (Q-3-Step5-B)

1. **Strategy (A) vs (B) vs (C):** SME recommends (A). Architect-final.
2. **Implementation cadence:** SME proposes Step 5 ships (A) end-to-end. Architect can adjust if (C) hybrid is preferred as Step-5-minimum with (A) as Phase 4+ deliverable.

---

## 4. Q-3-Step5-C — Six architect-ratification questions

| # | Question | SME-routable proposal |
|---|---|---|
| 1 | ADR numbering: Option (i) new ADR-013 vs Option (ii) re-number ADR-011 | **(i)** per §2.1 blast-radius + audit-trail-unity-per-surface reasoning |
| 2 | ADR text scope: visited-ancestor pattern only, or includes depth-bound interaction (closure_truncated emission)? | **Visited-ancestor pattern only** — closure_truncated stays at Step 8 binding per current Phase 3 entry packet step ledger; the two surfaces are structurally adjacent but emit at different points (cycle = reason code; depth-bound = LossSignature lossType). Architect rules. |
| 3 | Step 5 strategy: A / B / C | **(A)** per §3.1 reasoning |
| 4 | Cycle-prone predicate classification | SME proposes 6 classes per §2.3 ADR text: transitive, symmetric, recursive subClassOf, same_as identity propagation, InverseObjectProperties bidirectional pair, Connected-With parthood-extension bridge. Architect ratifies the list (or constrains/extends). |
| 5 | Step 5 scope: includes `closure_truncated` emission, or strictly `cycle_detected`? | **Strictly `cycle_detected`** per current Phase 3 entry packet step ledger — closure_truncated stays at Step 8. Architect rules. |
| 6 | Spec §13 ADR index update: editorial correction within v0.1.7 freeze? | **Yes, editorial correction** per Q-Frank-1 generalization (Pass 2b banked principle 2; Q-3-Step3-A precedent; Q-3-Step4-A precedent). The reference is editorial language tightening to point at the canonical implementation-side ADR. Architect rules. |

---

## 5. Side-finding: parallel-registry disconnect (spec §13 ADR table vs DECISIONS.md)

**Discovered during SME `Grep`-based verification of Q-3-Step5-A.** The two ADR registers diverge across most/all numbers, not just ADR-011:

| ADR-NN | Spec §13 ADR table title | DECISIONS.md ADR title |
|---|---|---|
| ADR-001 | Tau Prolog as the FOL engine | Use JSON-LD Deterministic Service Template |
| ADR-002 | No external OWL reasoner dependency | OFBT-specific kernel purity allowlist |
| ADR-003 | Round-trip parity as primary correctness | ARC TSV Module column as SME deliverable |
| ADR-004 | Connected With as primitive with bridge axioms | Tau Prolog probe seam for testability |
| ADR-005 | Deterministic Skolemization for missing temporal indices | CLI restructure |
| ADR-006 | Oxigraph and Tau Prolog as separated, coupled stores | Tighten purity checker |
| ADR-007 | Class expression lifting algorithm (Forthcoming) | Phase 1 lifter determinism + cycle-guard layer |
| ADR-008 | Property chain regularity check algorithm (Forthcoming) | OFI deontic deferred from v0.1 to v0.2 |
| ADR-009 | Negation projection rules | Four new ARC modules added per v0.1 corpus evidence |
| ADR-010 | Identity handling via rule-based same_as propagation | Vendored canonical source license-verification corrective action |
| ADR-011 | SLD termination via cycle-detection guards | Audit-artifact @id content-addressing scheme |
| ADR-012 | Blank node Skolemization via content-hash registry | Cardinality routing — Direct Mapping with n-tuple matching |
| ADR-013–021 | (9 more spec §13 entries) | (none) |

**Hypothesis:** spec §13's ADR table was authored at v0.1.4 spec era as an aspirational/prospective register of behavioral-spec ADRs; DECISIONS.md is the implementation-side ADR register (different numbering, drafted as actual decisions surfaced). The two registers grew in parallel without reconciliation.

**For THIS micro-cycle:** the bounded fix is creating ADR-013 in DECISIONS.md (next available number in that register) and updating cross-references. The Q-3-Step5-C item 6 spec §13 ADR index update is the spec-side editorial correction.

**For Phase 3 exit retro:** the broader parallel-registry disconnect surfaces as a candidate retro item:
- (a) Reconcile the registers (one register, common numbering) — high blast radius (every cross-reference updates)
- (b) Document the parallel-registry framing explicitly in spec §13 + DECISIONS.md — low blast radius (clarification commit)
- (c) Migrate one register's entries into the other — high blast radius

SME-routable observation: (b) is the lowest-blast-radius path. Phase 3 exit retro architect-final.

**Banking proposal:** Verification ritual Cat 8 (ADR section references) surfaces parallel-registry disconnects when path-fence-authored text references "ADR-NN" without disambiguating the register. Phase 3 exit retro absorbs the broader reconciliation; in-Step micro-cycles bound corrections to the affected ADR pair. Folding into AUTHORING_DISCIPLINE at Phase 3 exit doc-pass.

---

## 6. Verification Ritual Report (run on this artifact pre-routing)

Per the Step 4 cycle's binding-from-this-cycle-forward discipline (architect ratification 2026-05-09): SME ran the 8-category verification ritual on this artifact BEFORE routing to architect. The ritual is binding on every path-fence-authored artifact going forward.

### Ritual scope (8 check categories per architect-ratified scope)

| # | Category | Canonical source | Result |
|---|---|---|---|
| 1 | Reason-code references | `src/kernel/reason-codes.ts` | ✅ All references valid (`cycle_detected` line 38, `step_cap_exceeded` line 36) |
| 2 | LossType references | API §6.4.1 enumeration | ✅ `closure_truncated` confirmed (API line 1125) |
| 3 | FOLAxiom @type discriminators | `src/kernel/fol-types.ts` | n/a (no FOL @type discriminators introduced in this cycle's content) |
| 4 | OWLAxiom @type discriminators | `src/kernel/owl-types.ts` | n/a (no OWL @type discriminators introduced) |
| 5 | Reason enum stability statements | Count canonical enum | n/a (no enum-count claims in this cycle's content) |
| 6 | Spec section references | `project/OFBT_spec_v0.1.7.md` | ⚠ **1 finding (fixed inline)** — see below |
| 7 | API spec section references | `project/OFBT_API_v0.1.7.md` | ✅ §6.1.1 (line 997), §6.4.1 (line 1105), §11.1 (line 1691) all confirmed |
| 8 | ADR section references | `project/DECISIONS.md` + Q-rulings traceable | ✅ ADR-007 §1 (line 144), §4 (line 169), §9 (line 220), §11 (line 264 area) all confirmed; ADR-010 (line 425, license-verification) + ADR-011 (line 533, audit @id) confirmed; spec §13 ADR-010 + ADR-011 confirmed (parallel-registry references explicitly disambiguated per §5 side-finding); Q-3-Step3-A/B/C, Q-3-Step4-A, Q-3-G, Q-Frank-1, Q-Step6-1 all traceable to architect ratification messages |

### In-scope finding (Cat 6 spec section reference) — fixed inline

| Finding | Class | Disposition |
|---|---|---|
| `spec §3.4.4` referenced as parthood-extension bridge in §2.3 ADR text classification list (cycle-prone predicate class 6) | Cat 6 (spec section reference) — §3.4.4 does not exist; only §3.4.1 exists in spec §3.4 | ✅ FIXED in-line: rewrote class 6 to cite `spec §3.4.1` only with the actual bridge-axiom formula `P(x,y) → ∀z. C(z,x) → C(z,y)` from §3.4.1's "Inferential closure under the bridge axiom" |

### Banking from this ritual run

Second run of the ritual (first was the Step 4 cycle's three-file correction). The ritual continues to pay its dividend: catches reference-correctness errors at SME-handoff time rather than at architect ratification or later. The §3.4.4 finding would have surfaced at Developer-implementation time (Step 5 cycle-prone classification implementation cross-references the spec section to verify the bridge-axiom formula) and forced a back-routing cycle; catching it at SME-pre-handoff prevents that.

The Step 4 banking principle (mechanical character, scope to 8 categories, binding-from-Step-4-forward) holds. No new banking proposals from this run beyond what's already proposed in §5 side-finding (Cat 8 parallel-registry disconnect surfacing).

### Second ritual run — post-architect-ratification path-fence-authored content (2026-05-09)

Per the binding-immediately discipline + Cat 8 multi-canonical-source banking refinement (architect ruling 2026-05-09): SME ran the ritual a second time on the path-fence-authored content produced after architect ratification (ADR-013 in DECISIONS.md + ADR-007 §1/§11 cross-references + spec §13 ADR-011 cross-reference annotation + Phase 3 entry packet §7 Step 8 closure_truncated bundling amendment).

| # | Category | Result |
|---|---|---|
| 1 | Reason-code references | ✅ `cycle_detected` (line 38 reason-codes.ts) confirmed; `step_cap_exceeded` (line 36) confirmed; `no_strategy_applies` correctly identified as Q-3-C-pending Step 8 addition |
| 2 | LossType references | ✅ `closure_truncated` confirmed at API §6.4.1 (line 1125); correctly identified as LossType not reason code throughout ADR-013 |
| 3 | FOL @type | n/a |
| 4 | OWL @type | n/a |
| 5 | Reason enum stability | ✅ "16 + Q-3-C pending = 17 at Phase 3 close" verified by direct read of reason-codes.ts |
| 6 | Spec section references | ✅ §0.1 (line 72), §0.2.3 (line 109), §3.4.1 (line 300), §5.4 (line 575), §5.5 (line 585), §13 (line 1469), §13 ADR-011 (line 1406) all confirmed |
| 7 | API spec section references | ✅ §4, §5.5 (line 917), §6.1.1 (line 997), §6.4.1 (line 1105), §11.1 (line 1691) all confirmed |
| 8 | ADR section references | ✅ ADR-007 §1 (line 144), §4 (line 169), §9 (line 220), §11 (line 264 area) confirmed; ADR-010 (DECISIONS.md line 425) + ADR-011 (DECISIONS.md line 533) + new ADR-013 (DECISIONS.md line 891+) + Q-3-Step5-A/B/C, Q-3-Step3-A/B/C, Q-3-Step4-A, Q-3-A/B/C/G, Q-Frank-1/2/4/6, Q-Step6-1/3 all traceable to architect ratification messages or prior-cycle artifacts |

### Cat 8 multi-canonical-source surfacing (per architect 2026-05-09 banking refinement)

**Multi-source state for ADR-013 number** (per Cat 8 expansion: "the verification flags the multi-source state as a finding for routing rather than confirming on a single source"):

| Number | Spec §13 ADR table | DECISIONS.md |
|---|---|---|
| ADR-010 | "Identity handling via rule-based same_as propagation" | "Vendored canonical source license-verification corrective action" |
| ADR-011 | "SLD termination via cycle-detection guards" (now annotated to cross-reference DECISIONS.md ADR-013) | "Audit-artifact `@id` content-addressing scheme" |
| ADR-013 | "Projection provenance: preserved ontology IRI, fresh version IRI, PROV-O activity record" | NEW: "Visited-ancestor cycle-guard pattern for cycle-prone predicates" |

The multi-source state for ADR-010, ADR-011, and the new ADR-013 are **all surfaced for routing** per the Cat 8 banking. Disposition: **already covered by the parallel-registry-reconciliation Phase 3 exit retro forward-track** (§11.1 above). Not a new finding requiring this-cycle action; the bounded fix per architect Q-3-Step5-C item 6 + side-finding ruling is the spec §13 ADR-011 cross-reference annotation (already applied) + DECISIONS.md ADR-013 cross-references with explicit disambiguation (already applied throughout ADR-013 text).

**Banking confirmation:** The Cat 8 multi-canonical-source surfacing operationalizes immediately on this cycle's content. The first production case (ADR-013 number collision) routes correctly to the existing Phase 3 exit retro forward-track without spawning a new cycle. The discipline-tightening pattern (banked at Pass 2b cycle 2026-05-09 banking principle 7) confirms: discipline tightenings ratified at one cycle pay their dividend at the next production cadence catch.

### Findings from second ritual run

**No new in-scope findings.** All references in path-fence-authored content (ADR-013, ADR-007 §1/§11 cross-ref updates, spec §13 ADR-011 annotation, Phase 3 entry packet §7 closure_truncated bundling amendment) verify against canonical sources. Multi-source states for ADR-010/011/013 are surfaced and already routed.

**Ritual continues to operationalize as designed.** Two production runs (Step 4's three-file correction + Step 5's first run on routing artifact + Step 5's second run on post-ratification content) all paid dividends or confirmed clean.

---

## 7. Cycle accounting

Per architect's banked cycle-accounting principles 3 + 6:

- **Phase 3 entry-cycle counter:** 2 (closed 2026-05-08)
- **Phase 3 mid-phase counter:** **moves from 2 → 3** (Step 3 + Step 4 + Step 5 architectural-gap micro-cycles)
- **Phase 2 mid-phase counter:** 6 (closed)
- **Cumulative cycle counter:** not tracked

**Substantive-scope-weighting projection observation:** Phase 3 mid-phase counter at 3 after Step 5 framing; the architect-ratified projection of "~3 by Phase 3 close" is hit at Step 5 with **4 Steps remaining (Steps 6, 7, 8, 9)**. Per the Pass 2b banked principle "Substantive-scope-weighting projections at phase entry remain useful predictors of mid-phase cycle counts when the per-phase architectural surface count is correctly estimated at entry," this may signal under-projection of Phase 3's substantive scope at entry-cycle authoring 2026-05-08.

**Phase 3 exit retro candidate:** SME proposes Phase 3 exit retro examines whether substantive-scope-weighting was under-projected for Phase 3, and whether the entry-cycle architectural-surface estimation methodology should refine for Phase 4+ entry packets.

---

## 8. Sequencing per architect ratification (when received)

1. **Now** — SME draft routes to architect (this cycle)
2. **Architect ratifies Q-3-Step5-A + Q-3-Step5-B + Q-3-Step5-C 6 items + side-finding routing**
3. **SME path-domain post-ratification work:**
   - Author ADR-013 ratified text in DECISIONS.md per ratified scope (item 2)
   - Update ADR-007 §1 + §11 cross-references (3 in-DECISIONS.md updates)
   - Update spec §13 ADR index entry per item 6 ratification
   - Run verification ritual on the corrected artifacts (binding from Step 4 cycle forward)
4. **Pass 2b commit OR bundled Step 5 commit** — per Q-3-Step3-C-style discipline; Developer's call
5. **Step 5 implementation** — visited-ancestor encoding per Strategy (A); proceeds against ratified contracts
6. **Step 5 close commit** — implementation lands; remote CI green verification
7. **Phase 3 Step 6 begins** per the SME-proposed step ledger

---

## 9. Architect Q-rulings resolved (2026-05-09)

| Q | Disposition | Reasoning excerpt |
|---|---|---|
| **Q-3-Step5-A** | ✅ Option (i) new ADR-013 APPROVED with two refinements | *"Blast radius ratio is ~7-8x; both options serve the same architectural commitment; no asymmetric benefit favors (ii)... Audit-trail-unity-per-surface preserves... Option (ii) corrupts two ADRs' audit trails simultaneously: ADR-007 is the encoding-convention surface; ADR-011 is the audit-artifact @id surface. Cycle detection is structurally distinct from both — it is the inference-time invariant preservation surface."* **Refinement 1:** determinism statement explicit citation of spec §0.1 three-tier framing (cycle detection via visited-ancestor is implementation-choice tier; commitment is to cycle-free closure regardless of encoding). **Refinement 2:** SLG migration framing with Phase 4-7 escape clause (v0.2 is natural cycle, NOT binding; if Phase 4-7 surfaces practical-depth issues, migration routes as own cycle per spec §0.2.3). |
| **Q-3-Step5-B** | ✅ Strategy (A) Visited-ancestor encoding APPROVED | *"Spec §5.4 literal framing is binding per Q-Step6-1 banking... Reason-code semantic alignment: only Strategy (A) produces cycle_detected cleanly... v0.2 forward-compatibility: SLG tabling subsumes visited-ancestor encoding."* |
| **Q-3-Step5-C item 1 (Option i/ii)** | ✅ Option (i) APPROVED | (per Q-3-Step5-A ruling) |
| **Q-3-Step5-C item 2 (ADR text scope)** | ✅ APPROVED visited-ancestor pattern only; closure_truncated stays Step 8 | *"Surfaces are structurally adjacent but emit at different points (cycle = reason code; depth-bound = LossSignature lossType)."* |
| **Q-3-Step5-C item 3 (Strategy A/B/C)** | ✅ Strategy (A) APPROVED | (per Q-3-Step5-B ruling) |
| **Q-3-Step5-C item 4 (cycle-prone classification)** | ✅ 6-class list APPROVED with bridge-axiom citation refinement | Refinement: per SME's verification ritual finding (§6 of routing artifact), spec §3.4.4 does not exist; rewrite class 6 to cite §3.4.1 only with the actual bridge-axiom formula. SME's inline fix is correct. **Banking the catch-and-fix as exemplary verification-ritual operation.** |
| **Q-3-Step5-C item 5 (Step 5 scope)** | ✅ Strictly cycle_detected APPROVED | Refinement: closure_truncated bundled at Step 8 with NoStrategyAppliesError + structural_annotation_mismatch + arc_manifest_version_mismatch + SessionStepCapExceededError + step_cap_aggregate per typed-error-hierarchy-completion-bundling discipline. SME amends Phase 3 entry packet's §7 if not already explicit. |
| **Q-3-Step5-C item 6 (spec §13 editorial correction)** | ✅ Editorial correction within v0.1.7 freeze APPROVED with bounded scope | Refinement: §13 ADR index update is bounded to ADR-013's addition only. Broader parallel-registry disconnect (side-finding) handled separately. The §13 ADR index update lands as part of the Pass 2b commit promoting ADR-013 (audit-trail-unity-per-surface). |
| **Side-finding (parallel-registry disconnect)** | ✅ Bounded fix this cycle + Phase 3 exit retro forward-track APPROVED | *"The ADR-013 addition is in scope for this cycle... Registry-wide reconciliation is out of scope for this cycle... The Phase 3 exit retro is the natural cycle."* Phase 3 exit packet gains item under deferred-with-structural-requirements bucket (architect text recorded in §11 forward-tracks). |
| **Verification-ritual production-catch banking** | ✅ Banked explicitly | *"The verification ritual just ratified at Step 4 has paid its first production dividend... This is the same pattern as the SME-Persona Verification of Vendored Canonical Sources discipline's first production catch (license-type defect at Phase 2 entry verification ritual, 2026-05-06 → ADR-010). Pattern: discipline ratified after surfaced gap → discipline operationalizes immediately → first production catch follows shortly → catch validates the discipline at production cadence."* |
| **Cycle-accounting projection-exceedance observation** | ✅ Phase 3 exit retro candidate APPROVED | *"The projection exceedance is not yet a discipline failure... The methodology refinement requires Phase 3 closure for analysis... Phase 3 exit retro is the natural reflection cycle."* Phase 3 exit packet gains second item under deferred-with-structural-requirements bucket. |

---

## 10. Architect-banked principles from this cycle (verbatim per the §11 verbatim-transcription discipline)

Banked verbally by the architect at the ratification cycle 2026-05-09; formalize at AUTHORING_DISCIPLINE Phase 3 exit doc-pass alongside principles from prior Phase 3 cycles. Per the §11 transcription discipline, transcribed verbatim from architect ruling text.

### Substantive principles (5)

1. **Reason-code semantic distinguishability is a binding constraint on inference-time strategy choice.** When alternative strategies cannot produce the canonical reason codes, they are refused regardless of implementation simplicity. *(Q-3-Step5-B reasoning #2 — visited-ancestor encoding produces `cycle_detected` cleanly while alternative strategies cannot distinguish from `step_cap_exceeded`)*

2. **When multiple inference-time strategies serve the same architectural commitment, the strategy with the cleanest forward-compatibility path to known v0.2+ work wins absent asymmetric Phase 1 benefit.** Forward-compatibility is a load-bearing comparator. *(Q-3-Step5-B reasoning #3 — SLG tabling subsumes visited-ancestor encoding cleanly)*

3. **Verification ritual categories expand to surface multi-canonical-source states as findings for routing rather than confirming on a single source.** Multi-source states are themselves discipline gaps requiring architect routing. *(Side-finding ruling — Cat 8 expansion to surface parallel-registry disconnects)*

4. **Disciplines ratified after surfaced production gaps validate their effectiveness at the next production cadence catch.** *(Verification-ritual production-catch banking — Step 4 binding-immediately discipline's first production dividend at Step 5: spec §3.4.4 → §3.4.1 correction caught pre-routing)*

5. **Verification ritual catches and fixes are disclosed in the routing artifact's verification-ritual section, surfacing the discipline's operation rather than burying it.** Disclosure preserves the discipline-effectiveness audit trail. *(SME transparent disclosure banking — §6 of this routing artifact's verification-ritual report)*

### Meta-principle (1)

6. **Methodology refinements (substantive-scope-weighting projection accuracy, cycle-counter operational definitions, etc.) surface at phase exit retros with complete phase data, not mid-phase.** Mid-phase methodology critique is premature; exit retro reflection is the natural cycle. *(Methodology-refinement-cycle banking — cycle-accounting projection-exceedance observation routes to Phase 3 exit retro)*

---

## 11. Phase 3 exit retro forward-tracks (per architect ratification 2026-05-09)

Two items recorded for Phase 3 exit packet's deferred-with-structural-requirements bucket per architect ruling. SME path-fence-authors these into the Phase 3 exit packet when authored.

### 11.1 Parallel-registry reconciliation (side-finding)

**Architect-required text for Phase 3 exit packet:**

> "Parallel-registry reconciliation: spec §13 ADR table (post-ADR-013 update: 22 entries) and project/DECISIONS.md (post-ADR-013 promotion: 13 ADRs) diverge across ADR-001 through ADR-012 numbering and titles. SME hypothesis (Phase 3 Step 5 routing 2026-05-XX): spec §13 is v0.1.4-era aspirational behavioral-spec-decision register; DECISIONS.md is implementation-side register that grew in parallel. Phase 3 exit retro routes the reconciliation as its own architect cycle with three options: (a) merge into a single canonical register, (b) document parallel framing with cross-references, (c) migrate one register's content into the other. Architect-final on the option."

### 11.2 Substantive-scope-weighting methodology refinement (cycle-accounting observation)

**Architect-required text for Phase 3 exit packet:**

> "Substantive-scope-weighting methodology refinement: Phase 3 mid-phase counter at Step 5 reached the entry-packet projection (~3) with 4 Steps remaining (6, 7, 8, 9). Phase 3 exit retro routes the methodology refinement as its own analysis: (i) was Phase 3's substantive-scope-weighting systematically under-projected, (ii) what refinement applies at Phase 4+ entry packets, (iii) is the projection mechanism itself sound or does it require a different cadence-prediction approach. Architect-final on the methodology refinement."

---

**End of RATIFIED packet. SME path-domain post-ratification work proceeds: ADR-013 path-fence-authoring with two refinements + ADR-007 cross-references + spec §13 ADR index update + Phase 3 entry packet §7 closure_truncated bundling check + verification ritual run on all corrected artifacts.**

— SME, 2026-05-09
