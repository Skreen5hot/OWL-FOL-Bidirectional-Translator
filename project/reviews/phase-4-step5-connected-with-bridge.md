# Phase 4 Step 5 Architectural-Gap Micro-Cycle — Q-4-Step5-A Connected With Bridge Multi-Gap — RATIFIED

**Date:** 2026-05-14 (Developer-surfaced four-gap finding at Step 5 implementation reconnaissance; SME routing same day with Q-letter recommendation + Option-A endorsement for each architect question; architect ruling same day on Q-4-Step5-A.1 + Q-4-Step5-A.2 + Q-4-Step5-A.2.1 + Q-4-Step5-A.3 + Q-4-Step5-A.4 + meta-observation forward-track + 6 banked principles; SME path-fence-author + verification ritual close pre-Pass-2b-brief-confirmation).
**Cycle type:** **Phase 4 mid-phase architectural-gap micro-cycle (SECOND instance).** Per Q-4-A projection: ~3 mid-phase architectural-gap micro-cycles projected for Phase 4; Q-4-Step4-A was first (2026-05-11); this is second; counter increments 1 → 2; on-projection. Distinct from contingency-operationalization sub-cycle (no pre-ratified §8.2-style contingency); distinct from stakeholder-routing corrective sub-cycle (no stakeholder surface); distinct from BFO ARC content authoring workstream bucket (relations + disjointness authoring; bridge axioms are a separate schema surface).
**Surfaced by:** Developer reconnaissance during Phase 4 Step 5 implementation framing 2026-05-14 — four distinct gaps (A: ARC content gap; B: ARC schema gap; C: spec-vs-fixture axiom shape discrepancy; D: IRI discrepancy).
**Status:** **RATIFIED 2026-05-14.** Cycle history: (1) Developer dispatch 2026-05-14 surfaced four-gap finding routing-artifact draft + Option-A endorsement spectrum → (2) SME refinement 2026-05-14 (Q-letter Q-4-Step5-A + sub-question Q-4-Step5-A.2.1 BridgeAxiom shape + SME-self-error acknowledgment for Gaps C+D + banking-worthy meta-observation on verification ritual first production miss + Cat 9 ritual category proposal) → (3) architect ruling 2026-05-14: Option (d) spec-literal + fixture amendment APPROVED + Option A bridgeAxioms field APPROVED + discriminated-union with enum APPROVED + cco:ont00001810 spec-literal IRI APPROVED + Developer reconnaissance defer APPROVED + Cat 9 forward-track to Phase 4 exit retro APPROVED + 6 banked principles → (4) SME path-fence-authors this routing artifact + fixture amendment + ARC content amendment + manifest update + entry packet amendments + verification ritual report → (5) Developer reconnaissance on Phase 1 emitter handling of owl:SymmetricProperty + owl:ReflexiveProperty for cco:ont00001810 → (6) Pass 2b architect brief confirmation cycle.

**Blocks:** Phase 4 Step 5 implementation (Connected With as primitive + bridge axiom + activation of `canary_connected_with_overlap` corpus-before-code fixture). Does NOT block Phase 4 Steps 6-9 work that is independent of Connected With.

**Predecessors:**
- [`phase-4-step4-disjointness-schema.md`](./phase-4-step4-disjointness-schema.md) (Phase 4 mid-phase architectural-gap micro-cycle 1; standalone routing-cycle artifact shape inherited; four-anchor schema reasoning extended at this cycle)
- [`phase-4-entry.md`](./phase-4-entry.md) §2.4 (Connected With as primitive deliverable; §11 Q-4-A explicit step assignment Step 5)
- `tests/corpus/canary_connected_with_overlap.fixture.js` @ Phase 4 entry-packet authoring 2026-05-10 (SME-self-error origin: cited spec §3.4.1 with non-spec-literal axiom + used RO_0002170 instead of cco:ont00001810)
- `arc/core/bfo-2020.json` @ commit `6c59d59` (post-Q-4-Step4-A amendment 2026-05-11; 40 relations-only ARCEntry + 11 disjointnessAxioms; NO Connected With entry + NO Overlaps entry + NO bridgeAxioms field)
- `project/OFBT_spec_v0.1.7.md` §3.4 (Connected With definition policy + cco:ont00001810 canonical IRI + owl:SymmetricProperty + owl:ReflexiveProperty); §3.4.1 (Inferential closure under the bridge axiom — full axiom set: reflexivity + symmetry + parthood-extension bridge + parthood transitivity)

---

## 1. Surfaced architectural gap (verbatim from Developer dispatch 2026-05-14)

Phase 4 Step 5 implementation (Connected With as primitive + bridge axiom per spec §3.4.1 + activation of `canary_connected_with_overlap` corpus-before-code fixture) blocked at Developer scope — four load-bearing gaps surfaced by reconnaissance against current ARC content + spec + fixture.

### Gap A — ARC content gap (BFO catalogue lacks the relations)

| Required IRI | Status |
|---|---|
| Connected With (RO_0002170 per fixture; cco:ont00001810 per spec) | NOT in `arc/core/bfo-2020.json` (grep returns 0 matches across RO_0002170, RO_0002131, connected, overlap, bridge) |
| Overlaps (RO_0002131 per fixture) | NOT in catalogue |
| Bridge axiom encoding | No structured field; same pattern as the Disjointness Map gap from Step 4 |

### Gap B — ARC schema gap

ARCModule has no `bridgeAxioms?` (or analogous) field for declaring Connected With axioms. The Step 4 precedent added `disjointnessAxioms?: DisjointnessAxiom[]` per Q-4-Step4-A. A parallel extension would be `bridgeAxioms?: BridgeAxiom[]` with shape TBD per architect ruling.

### Gap C — Spec §3.4.1 vs fixture: bridge axiom SHAPE discrepancy

| Source | Bridge axiom asserted |
|---|---|
| Fixture `canary_connected_with_overlap.fixture.js:132-145` | ∀x,y. overlaps(x, y) → connected_with(x, y) (one-way: overlap implies connection) |
| Spec §3.4 line 296 | P(x,y) → ∀z (C(z,x) → C(z,y)) (parts inherit connections) |
| Spec §3.4.1 lines 304-311 (full axiom set) | C(X, X) reflexivity; C(X, Y) :- C(Y, X) symmetry; C(Z, Y) :- P(X, Y), C(Z, X) parthood-extension bridge; P(X, Z) :- P(X, Y), P(Y, Z) parthood transitivity (already covered by Step 3) |

The fixture's overlaps → connected_with axiom is NOT in spec §3.4.1's ratified axiom set. Both forms are legitimate in BFO mereotopology (overlap-implies-connection AND parthood-extension-bridge are both valid), but only the parthood-extension form is in the canonical spec. Fixture's `relatedSpecSections: ["spec §3.4.1 (Connected With as primitive + bridge axiom...)"]` cites the section but asserts a different axiom.

### Gap D — IRI discrepancy (Connected With canonical form)

| Source | IRI |
|---|---|
| Spec §3.4 line 293 | `cco:ont00001810` |
| Fixture line 73 | `RO_0002170` (Relation Ontology — "connected to") |

Different vocabularies for the same concept; both appear in BFO 2020-adjacent literature. Architect rules which is canonical for v0.1 + whether both should be supported (e.g., via `owl:equivalentProperty` alias).

### SME-self-error origin acknowledgment (per Q-4-Step5-A Banking 6)

Gaps C + D originate from the SME's Phase 4 entry-packet path-fence-author work 2026-05-10 — the original `canary_connected_with_overlap` fixture was authored with these errors. The Q-4-G phase-boundary retroactive batch ritual run 2026-05-10 did NOT catch the errors (Cat 7 reference-existence check reported 0 findings because §3.4.1 exists, but reference-consistency check is not in the current ritual's category coverage). Phase 4 Step 5 implementation reconnaissance (Developer-side complementary discipline) caught what the ritual missed.

This SME-self-error origin acknowledgment + the verification ritual first production miss observation surface as load-bearing meta-discipline for the architect's Cat 9 ritual category forward-track ruling (§3.6 below).

---

## 2. Q-4-Step5-A — SME-routable resolution

### 2.1 Q-4-Step5-A.1 — Bridge axiom shape: Option (d) endorsed

Spec-literal bridge axioms + fixture amendment. Three anchors:

1. **Spec governs in v0.1.7 freeze** per ADR-012 banked principle: "Spec interpretation defaults to literal framing, not conservative emission strategy"
2. **Corpus-as-contract requires fixture-spec alignment** (symmetric application of Q-4-Step4-A Banking 3)
3. **Fixture-amendment shape** preserves wrong-translation canary discipline (forbiddenPattern for reverse-direction connected_with→overlaps stays)

### 2.2 Q-4-Step5-A.2 — ARC schema extension: Option (A) endorsed

Top-level `bridgeAxioms?: BridgeAxiom[]` field on ARCModule per Q-4-Step4-A four-anchor reasoning extension (OWL-semantic-mirroring + module-level commitment + minimal-disruption + tree-shaking). Options B + C refused.

### 2.3 Q-4-Step5-A.2.1 — BridgeAxiom shape: discriminated union with enum endorsed

Sub-option α: `axiomForm: "reflexivity" | "symmetry" | "parthood-extension"` enum. Sub-option β (direct FOL structure) refused per Q-4-Step4-A Banking 3 corpus-bounded scope discipline.

### 2.4 Q-4-Step5-A.3 — Connected With IRI: cco:ont00001810 spec-literal endorsed

Option (a) cco:ont00001810 per spec §3.4 ratified canonical; fixture amendment swaps RO_0002170 → cco:ont00001810. Equivalent-property bridge (Option c) defers to v0.2 ELK closure or fresh architect cycle against consumer evidence.

### 2.5 Q-4-Step5-A.4 — Property characteristics: Developer reconnaissance + defer endorsed

Phase 1 emitter already handles non-cycle-prone OWL property characteristics per ADR-013 framing. Developer reconnaissance on Phase 1's handling of owl:SymmetricProperty + owl:ReflexiveProperty for cco:ont00001810 informs Step 5 emitter-scope decision; if Phase 1 handling is complete, no new scope; if incomplete, Q-4-Step5-B escalation as separate cycle.

### 2.6 Meta-observation — Verification ritual first production miss + Cat 9 proposal

Q-4-G phase-boundary retroactive batch ritual missed Gaps C + D at Phase 4 entry-cycle (Cat 7 cross-reference verification reported 0 findings). The ritual's 8 categories operate at reference-existence layer (does spec §3.4.1 exist?), not reference-consistency layer (does fixture's overlaps→connected_with assertion match §3.4.1's ratified axiom content?). Banking-worthy meta-observation surfacing for architect Cat 9 ritual category proposal — forward-tracks to Phase 4 exit retro candidacy per the SME's recommendation (Cat 9 = cited-content consistency, structurally distinct from Cat 6-8 reference-existence).

---

## 3. Architect rulings 2026-05-14 (verbatim transcription per §11 discipline)

### 3.1 Q-4-Step5-A.1 ruling — Option (d) Spec-literal bridge axioms + fixture amendment APPROVED

> Spec §3.4.1 ratified axiom set governs. Fixture amends to remove non-spec-literal patterns + add three spec-literal required patterns.
>
> The SME's three-anchor reasoning is correct. Auditing each:
>
> 1. **Spec governs in v0.1.7 freeze** — Spec §3.4.1's ratified axiom set is binding on Phase 4 implementation. The three ratified axioms (reflexivity, symmetry, parthood-extension) constitute the v0.1 Connected With semantic surface. The fixture's overlaps → connected_with requiredPattern is mathematically valid in BFO mereotopology but cites the wrong source: not §3.4.1. Per ADR-012 banked principle: "Spec interpretation defaults to literal framing, not conservative emission strategy." Spec-literal framing means the ratified axiom set is the binding source; mathematically-valid-but-unspec'd axioms route as fresh ratification, not as fixture assertions.
>
> 2. **Corpus-as-contract requires fixture-spec alignment** — The Q-4-Step4-A Banking 3 principle: "Schema extension scope is bounded by corpus-demanded surfaces; speculative schema fields whose natural surfacing context is a later phase or version defer to that cycle." The SME's symmetric application is correct: fixture-asserted patterns are bounded by spec-ratified content; speculative patterns whose natural surfacing context is v0.2 ELK closure or future-phase forcing case defer to that cycle.
>
> 3. **Fixture-amendment shape** — Remove the overlaps → connected_with requiredPattern; Add 3 spec-literal requiredPatterns (reflexivity, symmetry, parthood-extension); Keep the forbiddenPattern (reverse-direction connected_with → overlaps) — this is a wrong-translation canary, independent of forward-direction ratification; Update fixture's intendedToCatch + summary to reflect spec-literal coverage.
>
> The fixture-amendment is editorial-correction-within-v0.1.7-freeze per the Pass 2b banking generalization. The audit-trail header (a/b/c/d) per the four-contract consistency discipline documents the amendment cycle reference + the SME-self-error origin + the spec-literal-alignment correction + the corpus-as-contract anchor.

### 3.2 Q-4-Step5-A.2 ruling — Option (A) bridgeAxioms field APPROVED

> Top-level `bridgeAxioms?: BridgeAxiom[]` field on ARCModule. Approved per Q-4-Step4-A precedent extension.
>
> The Q-4-Step4-A four-anchor reasoning (OWL-semantic-mirroring + module-level commitment + minimal-disruption + tree-shaking) applies identically here. The SME's framing is correct: the same architectural reasoning that governed disjointnessAxioms field placement governs bridgeAxioms field placement.

### 3.3 Q-4-Step5-A.2.1 ruling — Sub-option A.2.1.α discriminated union with axiomForm enum APPROVED

> BridgeAxiom shape: discriminated union with `axiomForm: "reflexivity" | "symmetry" | "parthood-extension"` enum. Emitter looks up canonical FOL per axiomForm. Approved as the SME proposes.
>
> Three reasons (α) is correct over (β):
>
> 1. **Schema honesty about cardinality** — The BFO mereotopology bridge axioms constitute a small finite canonical set per spec §3.4.1. The discriminated union with enum honors this honestly: the schema names what the set contains; the emitter knows how to materialize each.
>
> 2. **Speculative schema expansion refused** per Q-4-Step4-A Banking 3 — Option (β) direct FOL structure would invite speculative schema expansion. The discriminated union with enum bounds the schema to spec-ratified canonical forms.
>
> 3. **Emitter implementation cohesion** — Per ADR-007 §11: the FOL→Prolog translation has a per-variant translation table. The axiomForm enum's three canonical values map cleanly to three emitter functions; direct FOL structure (β) would conflate ARC-content emission with the general FOL→Prolog translation surface.
>
> **Required of the BridgeAxiom interface:**
>
> ```typescript
> interface BridgeAxiom {
>   axiomForm: "reflexivity" | "symmetry" | "parthood-extension";
>   // SME's discretion on additional metadata fields (sourceReference, comment, etc.)
> }
> ```

### 3.4 Q-4-Step5-A.3 ruling — Option (a) cco:ont00001810 spec-literal IRI APPROVED

> Connected With canonical IRI: cco:ont00001810 per spec §3.4. Fixture amends to use spec-literal IRI. Equivalent-property bridge (Option c) defers.
>
> The SME's reasoning is correct: spec §3.4 ratifies cco:ont00001810 as the canonical Connected With IRI for v0.1. The fixture's prior use of RO_0002170 was an SME-enumeration-error from Phase 4 entry packet path-fence-author work; the correction amends to spec-literal.
>
> Per the symmetric application of the corpus-as-contract discipline: fixture-asserted IRIs are bounded by spec-ratified canonical IRIs. Speculative equivalent-property bridges defer to their natural surfacing-context cycle.

### 3.5 Q-4-Step5-A.4 ruling — Developer reconnaissance + SME-recommended defer APPROVED

> Developer reconnaissance on Phase 1 emitter handling of owl:SymmetricProperty + owl:ReflexiveProperty for Connected With's lift. No emitter-scope extension at Step 5 unless reconnaissance surfaces gap.
>
> Three observations: (1) Phase 1 emitter already handles non-cycle-prone OWL property characteristics per ADR-013 framing; (2) Reconnaissance-first preserves implementation-evidence discipline per spec §0.2.3; (3) Bounded scope expansion preserves Phase 4 substantive-scope-weighting projection.
>
> **Required of the Developer reconnaissance:** Aaron-Developer's Step 5 implementation reconnaissance verifies Phase 1 emitter handling of owl:SymmetricProperty + owl:ReflexiveProperty declaration on cco:ont00001810. Verification checks: correct FOL emission per OWL 2 DL semantics; no silent drop (LossSignature would indicate incomplete handling); composability with the bridgeAxioms field's three canonical forms (reflexivity from owl:ReflexiveProperty + reflexivity from bridgeAxioms should not double-emit).
>
> If reconnaissance surfaces gap → Q-4-Step5-B escalation. If complete → no Step 5 emitter-scope expansion required.

### 3.6 Meta-observation ruling — Cat 9 ritual category APPROVED for Phase 4 exit retro candidacy

> The SME's banking-worthy meta-observation surfaces a structurally significant verification ritual category coverage question. Banking the observation now; the Cat 9 ritual category proposal forward-tracks to Phase 4 exit retro candidacy.
>
> **Reference-existence vs reference-consistency distinction:** The verification ritual's 8 categories operate at the reference-existence layer (does spec §3.4.1 exist?); none verify reference-consistency (does the cited content in the referenced surface match what the citing artifact asserts?). The Q-4-Step5-A surfacing is the verification ritual's first production miss: Cat 7 (spec §3.4.1) cross-reference reported "0 findings" because §3.4.1 exists; but the fixture's overlaps → connected_with requiredPattern is not in §3.4.1's ratified axiom set. Reference-existence held; reference-consistency failed.
>
> **Cat 9 proposal:** A new ritual category covering: for each cited-reference in path-fence-authored artifacts, verify the cited surface's actual content matches what the citing artifact asserts. Cat 9 operates at higher detection granularity per the Q-4-Step4-A Banking 4 granularity-expansion pattern.
>
> **Why Cat 9 forward-tracks to Phase 4 exit retro, not fresh cycle now:** (1) Phase 4 exit retro is the natural cycle for methodology refinement; (2) The Cat 9 category addition is a verification-ritual-architecture surface, not Step-5-implementation-blocking; (3) Speculative ritual-category expansion refused per Q-4-Step4-A Banking 3; evidence-grounded category expansion deferred to retro for full-phase-evidence deliberation.
>
> **Required forward-track at Phase 4 exit retro candidacy:** Phase 4 exit retro inherits the candidate: "Cat 9 ritual category — cited-content consistency. Surfaced at Q-4-Step5-A (2026-05-14) as verification ritual first production miss. Architect ratification at Phase 4 exit retro: (a) ratify Cat 9 category addition; (b) defer to v0.2 methodology refinement; (c) maintain status quo + accept reference-consistency gap as bounded-by-implementation-reconnaissance discipline."

---

## 4. Six new banked principles (architect ruling 2026-05-14)

Verbatim transcription per the §11 verbatim-transcription discipline. **All six bank now (verbally), formalize at Phase 4 EXIT doc-pass per architect directive** — NOT at Phase 4 entry.

1. **Fixture-asserted patterns are bounded by spec-ratified content.** Speculative patterns mathematically valid but not in the ratified axiom set defer to their natural surfacing-context cycle (v0.2 closure, future-phase forcing case, fresh architect cycle). The fixture-vs-spec-ratification alignment preserves corpus-as-contract discipline through the fixture surface. (Q-4-Step5-A.1 symmetric application of Q-4-Step4-A Banking 3)

2. **Schema extensions adding axiom-set fields to `ARCModule` follow the Q-4-Step4-A four-anchor reasoning** (OWL-semantic-mirroring + module-level commitment + minimal-disruption + tree-shaking). The four-anchor pattern generalizes across axiom-set extensions; Options B (heterogeneous entries) and C (subsidiary modules) refused under the same precedent. (Q-4-Step5-A.2 pattern generalization)

3. **Schema-storable axiom shapes use discriminated unions with enum discriminators** where the architectural surface admits a small finite canonical set (per spec ratification). Direct structural storage refused for small-finite-set surfaces; the enum bounds schema scope per the corpus-as-contract discipline. (Q-4-Step5-A.2.1 banking)

4. **Mid-phase architectural-gap rulings defer scope-expansion decisions pending Developer reconnaissance** when prior-phase implementation coverage status is unverified. Reconnaissance-first preserves implementation-evidence discipline + bounded-scope discipline + substantive-scope-weighting projection compliance. (Q-4-Step5-A.4 banking)

5. **Verification ritual category-expansion candidates evidence-grounded by production misses forward-track to phase exit retro candidacy** rather than fresh ratification cycles. Phase exit retro provides phase-cadence methodology-refinement context; speculative category-expansion refused; evidence-grounded category-expansion deferred to retro for full-phase-evidence deliberation. (Meta-observation banking)

6. **SME-self-error origins acknowledged in routing artifacts preserve audit-trail honesty.** Error attribution at the path-fence-author surface where the error originated supports cycle accountability discipline. (SME-self-error acknowledgment banking)

**Plus complementary observation banking** (from "On the verification ritual's first production miss" section of architect ruling): **The verification ritual's first production miss surfaces the ritual's detection boundary at the reference-existence-vs-reference-consistency layer. Production misses are not discipline failures; they are discipline boundary surfacings that inform methodology refinement candidacy at phase exit retro. Complementary disciplines (Developer-side implementation reconnaissance, stakeholder-routing review) operating alongside the verification ritual produce overlapping coverage; gap surfaces inform refinement.**

These six (plus the complementary observation) forward-fold to Phase 4 exit doc-pass; not formalized at Phase 4 entry per architect directive.

---

## 5. SME post-ratification work scope + sequencing

### 5.1 SME path-fence-author scope (this turn)

1. **This routing-cycle artifact** — `project/reviews/phase-4-step5-connected-with-bridge.md` (documents cycle substance; mirrors `phase-4-step4-disjointness-schema.md` shape)
2. **`tests/corpus/canary_connected_with_overlap.fixture.js` amendment** — per Q-4-Step5-A.1 + Q-4-Step5-A.3: remove overlaps → connected_with requiredPattern; add 3 spec-literal requiredPatterns (reflexivity + symmetry + parthood-extension); keep forbiddenPattern (reverse-direction connected_with → overlaps); IRI swap RO_0002170 → cco:ont00001810; audit-trail header (a/b/c/d) per four-contract consistency discipline
3. **`arc/core/bfo-2020.json` amendment** — add `bridgeAxioms` field with 3 spec-literal canonical forms (reflexivity + symmetry + parthood-extension); add Connected With ARCEntry (cco:ont00001810); add Overlaps ARCEntry if Phase 4 corpus demands (otherwise defer)
4. **`tests/corpus/manifest.json` amendment** — update `canary_connected_with_overlap` manifest entry per fixture changes
5. **`project/reviews/phase-4-entry.md` §3 + §12 + cycle accounting amendment** — fixture-amendment audit-trail + 6 new bankings appended verbal-pending + cycle accounting (mid-phase counter 1 → 2)
6. **Verification ritual binding-immediately** on path-fence-authored artifacts per Cat 6 (spec sections) + Cat 8 (cross-references); canonical sources: spec §3.4.1 + §3.4 per architect Q-4-Step5-A.5 sub-ruling implicit

### 5.2 Developer-side post-ratification work scope (post-architect-Pass-2b-brief-confirmation)

1. **Developer reconnaissance on Phase 1 emitter handling** — verify owl:SymmetricProperty + owl:ReflexiveProperty handling for cco:ont00001810 per Q-4-Step5-A.4 ruling
2. **`src/kernel/arc-types.ts`** — `BridgeAxiom` interface (discriminated union with `axiomForm` enum) + optional `bridgeAxioms?: BridgeAxiom[]` field on `ARCModule`
3. **`src/kernel/arc-validation.ts`** — validate the new shape (axiomForm enum values, no other unrecognized fields)
4. **`src/kernel/arc-axiom-emitter.ts`** — emit canonical FOL per axiomForm (3 emitter functions: reflexivity → ∀x. C(x,x); symmetry → ∀x,y. C(y,x) → C(x,y); parthood-extension → ∀x,y,z. P(x,y) ∧ C(z,x) → C(z,y))
5. **Step-N-bind fixture activation** — `canary_connected_with_overlap.fixture.js` (amended) test passes end-to-end with 4 requiredPatterns + 1 forbiddenPattern + ARC content's bridgeAxioms loaded

### 5.3 Sequencing (per architect ruling)

In order:

1. **Now (closed)** — Architect rulings on Q-4-Step5-A.1 through .4 + meta-observation + 6 banked principles received
2. **SME path-fence-authors** — this routing artifact + fixture amendment + ARC content amendment + manifest update + entry packet amendment + verification ritual report
3. **SME runs verification ritual** on path-fence-authored artifacts (canonical sources: spec §3.4.1 + §3.4)
4. **Developer reconnaissance** on Phase 1 emitter handling of owl:SymmetricProperty + owl:ReflexiveProperty for cco:ont00001810
5. **Pass 2b architect brief confirmation cycle** on SME-authored artifacts + Developer reconnaissance results
6. **Developer commits the consolidated Pass 2b set** per audit-trail-unity-per-surface
7. **Phase 4 Step 5 implementation continues** against ratified contracts
8. **Phase 4 exit retro inherits the Cat 9 ritual category candidacy** per Meta-observation forward-track

### 5.4 Cycle accounting (post-Q-4-Step5-A-architect-ruling)

- **Phase 4 mid-phase architectural-gap counter: 1 → 2** (Q-4-Step4-A closed at commit `427eff5` 2026-05-11; Q-4-Step5-A this cycle; closes when Pass 2b commit lands + remote CI green)
- Phase 4 entry-cycle counter: 2 (closed at final ratification 2026-05-10)
- Phase 4 contingency-operationalization sub-cycle counter: 1 (Q-4-C; closed; formalized at commit `1f2cff6`)
- Phase 4 stakeholder-routing corrective sub-cycle counter: 0
- BFO ARC content authoring workstream bucket: pre-existing
- **Phase 4 verbal-pending bankings queue per architect: 24 Phase 4 + 3 Phase 3 inheritance + 6 from this cycle = 33 entries** (per architect verbatim; SME internal running count notes prior cycles' bankings sum to 29 + 6 = 35 Phase 4 + 3 = 38; the architect's 24-base may reflect a different stratification distinguishing "still verbal-pending vs partially committed"; reconciliation deferred to Phase 4 exit doc-pass per the §11 verbatim-transcription discipline)

If Developer reconnaissance surfaces gap (Q-4-Step5-A.4 incomplete coverage): Q-4-Step5-B escalates as separate mid-phase architectural-gap micro-cycle; Phase 4 mid-phase counter increments 2 → 3 at Q-4-Step5-B close; still within Q-4-A's ~3 projection.

### 5.5 What architect explicitly NOT authorizing

1. No retention of the overlaps → connected_with requiredPattern. Q-4-Step5-A.1 fixture-amendment shape is binding.
2. No RO_0002170 IRI usage in Phase 4 fixtures. Q-4-Step5-A.3 spec-literal cco:ont00001810 is binding.
3. No Option B or C for the schema extension shape. Q-4-Step5-A.2 Option A is binding per Q-4-Step4-A precedent extension.
4. No direct FOL structure for BridgeAxiom. Q-4-Step5-A.2.1 discriminated union with enum is binding.
5. No proactive emitter-scope expansion at Step 5 absent reconnaissance evidence. Q-4-Step5-A.4 reconnaissance-first is binding.
6. No fresh ratification cycle for Cat 9 ritual category at this cycle. Forward-track to Phase 4 exit retro is binding.
7. No bypassing of the audit-trail header documenting SME-self-error origin. The SME-self-error acknowledgment banking discipline applies; the audit-trail preservation is non-optional.
8. No silent fixture amendment without verification ritual re-run. Pass 2b artifacts pre-routing ritual run preserves binding-immediately discipline.

---

## 6. Cross-references

- [`phase-4-step4-disjointness-schema.md`](./phase-4-step4-disjointness-schema.md) — Phase 4 mid-phase architectural-gap micro-cycle 1 (standalone routing-cycle artifact shape inherited; four-anchor schema reasoning extended)
- [`phase-4-entry.md`](./phase-4-entry.md) — Phase 4 entry packet (§2.4 Connected With as primitive + §3.2 corpus-before-code canary_connected_with_overlap + §11 Q-4-A Step 5 binding); §3 + §12 amend per this cycle
- [`phase-4-entry-q-4-c-amendment.md`](./phase-4-entry-q-4-c-amendment.md) — Q-4-C source-state amendment cycle (standalone routing-cycle artifact banking generalization inherited)
- [`phase-4-entry-verification-ritual-report.md`](./phase-4-entry-verification-ritual-report.md) — Phase 4 entry-cycle Q-4-G ritual run report (Cat 7 0-findings on `canary_connected_with_overlap` reflected reference-existence-passing; Q-4-Step5-A surfacing reveals reference-consistency boundary not in Cat 7 coverage — first production miss)
- [`phase-4-step4-disjointness-schema-verification-ritual-report.md`](./phase-4-step4-disjointness-schema-verification-ritual-report.md) — Q-4-Step4-A verification ritual report (production-catch history table; Q-4-Step5-A is the first production miss complementing the three production catches)
- `tests/corpus/canary_connected_with_overlap.fixture.js` (SME-self-error origin: pre-amendment; post-amendment per Q-4-Step5-A.1 + Q-4-Step5-A.3)
- `arc/core/bfo-2020.json` (post-Q-4-Step4-A: 40 ARCEntry + 11 disjointnessAxioms; post-this-cycle: + Connected With ARCEntry + bridgeAxioms field with 3 canonical forms)
- `project/OFBT_spec_v0.1.7.md` §3.4 (Connected With definition policy: primitive + cco:ont00001810 + owl:SymmetricProperty + owl:ReflexiveProperty); §3.4.1 (Inferential closure under the bridge axiom — full axiom set ratified)
- `project/DECISIONS.md` ADR-004 (Connected With primitive treatment per spec §3.4); ADR-007 §11 (FOL→Prolog per-variant translation table per Q-4-Step5-A.2.1 anchor 3); ADR-013 (cycle-prone predicate classes); ADR-012 (spec-literal framing default discipline per Q-4-Step5-A.1 anchor 1)
- BFO 2020 canonical reference: `bfo-2020.owl` (per Q-4-Step4-A canonical-sources sub-ruling; v0.1 Connected With + Overlaps IRI verification at Pass 2b vendoring-analog time); spec §3.4 + §3.4.1 verbatim for axiom shapes

---

**Q-4-Step5-A Connected With bridge multi-gap cycle RATIFIED 2026-05-14. Phase 4 mid-phase architectural-gap counter at 2; closes when Pass 2b commit lands + remote CI green per the architect-ratified sequencing. Six new banked principles + complementary observation banking forward-fold to Phase 4 exit doc-pass. Cat 9 ritual category candidacy forward-tracks to Phase 4 exit retro deliberation.**

— SME, 2026-05-14 (Q-4-Step5-A architect ruling close; SME path-fence-author phase opens)

---

## 7. Brief confirmation cycle close (architect confirmation 2026-05-14)

Per architect Q-4-Step5-A Pass 2b brief confirmation cycle 2026-05-14: the 7 path-fence-authored artifacts (2 new + 5 modified) verified against the four sub-rulings + Cat 9 forward-track + 6 banked principles + Developer reconnaissance deferral. **All seven correspondence checks pass.** Five new banked principles from the brief confirmation cycle observing the SME's path-fence-author shape + verification ritual fourth production catch + fixture disambiguation + queue divergence honesty as exemplary practice; all five bank verbally + forward-fold to Phase 4 exit doc-pass per architect directive.

### 7.1 Five new banked principles (Q-4-Step5-A Pass 2b brief confirmation cycle 2026-05-14)

Verbatim transcription per the §11 verbatim-transcription discipline.

1. **Verification ritual reports' production-history tables enumerate both catches (validation events) and misses (boundary-surfacing events) at the same audit-trail surface.** The dual-enumeration preserves cumulative discipline state visibility; tables that show only catches misrepresent the discipline's operational boundary. Structurally similar to the Phase 3 doc-pass §5 enumeration discipline. (Production-catch history table extension banking)

2. **Verification ritual detection scope expansion accelerates across production catches; later catches operate at higher cross-category granularity than earlier ones.** The expansion pattern is non-linear; each catch validates the ritual's expanding boundary while the misses surface further-expansion candidacy. Trajectory: Catches 1-2 single-surface → Catch 3 multi-surface cross-category (Cat 6+8) → Catch 4 multi-surface cross-category at higher granularity (Cat 2+7+8). (Cat 2+7+8 cross-category catch banking; extends Q-4-Step4-A Pass 2b Banking 4 granularity-expansion pattern with non-linear-acceleration sub-observation)

3. **Corpus fixture cross-reference fields for architectural-commitment-tier references disambiguate by surface:** `relatedADRs` for ADR-tier; `relatedBankedPrinciples` for banked-principle-tier. Single-field-for-multiple-surfaces invites conflation; the disambiguation discipline preserves through the fixture-cross-reference surface. (Disambiguation discipline banking — surfaced by SME's Catch 4 corrective response; pattern generalizes; future fixtures author against the disambiguated shape)

4. **Verbal-pending bankings queue divergences between architect verbatim count and SME running count surface at routing cycles; reconciliation defers to phase exit doc-pass** for full-queue audit. Mid-cycle reconciliation risks recovery-cycle pressure; deferred reconciliation preserves cycle cadence. (Queue divergence deferral banking — honest discipline operation)

5. **Pass 2b commit handoff includes explicit out-of-scope artifact list to prevent accidental inclusion.** Working-tree state with multiple artifact categories requires explicit scope-boundary acknowledgment to preserve commit hygiene. (Out-of-scope artifact acknowledgment meta-banking)

### 7.2 Required follow-on Phase 4 exit retro candidate (from disambiguation discipline banking)

> The disambiguation pattern raises a question for Phase 4 exit retro: should other corpus fixtures carrying `relatedADRs` fields be retroactively audited for ADR-vs-banked-principle conflation? This is analogous to the Q-3-Step6-A retroactive ritual cycle's surface-extension question. Banking the candidacy: forward-track to Phase 4 exit retro alongside the Cat 9 candidacy.

Phase 4 exit retro candidates accumulating at this cycle: Cat 9 ritual category candidacy + corpus fixture cross-reference field retroactive audit + verbal-pending bankings queue divergence reconciliation (per Banking 4 deferral) + Phase 3 inheritance forward-tracks.

### 7.3 Cycle accounting refinement (per architect brief confirmation 2026-05-14)

- **Phase 4 mid-phase architectural-gap counter: 2 → 2 (Q-4-Step5-A CLOSED at Pass 2b brief confirmation cycle 2026-05-14; formalization at Pass 2b commit + remote CI green).** Brief confirmation cycle does NOT increment any counter.
- **Phase 4 verbal-pending bankings queue:** architect verbatim 33 + 5 = **38**; SME running 38 + 5 = **43**; queue divergence persists at 5 entries per Banking 4 deferral.

### 7.4 Pass 2b commit contents — 7-artifact set + Developer-side work per architect required-of-the-Pass-2b-commit list 2026-05-14

**NEW files:**
1. `project/reviews/phase-4-step5-connected-with-bridge.md` (this artifact)
2. `project/reviews/phase-4-step5-connected-with-bridge-verification-ritual-report.md`

**MODIFIED files:**
3. `arc/core/bfo-2020.json` (Connected With ARCEntry + bridgeAxioms field; `[VERIFY]` markers awaiting Aaron Pass 2b vendoring-analog-time fetch)
4. `tests/corpus/canary_connected_with_overlap.fixture.js` (full rewrite + audit-trail header (a/b/c/d) + relatedADRs disambiguation + relatedBankedPrinciples field per Catch 4 correction)
5. `tests/corpus/manifest.json` (`canary_connected_with_overlap` entry amended)
6. `project/reviews/phase-4-entry.md` (§12 6 + 5 new bankings + cycle accounting + §13 + closing status banner + Phase 4 exit retro candidates section)

**Developer-side implementation work per the prior cycle's Required-of-post-Pass-2b-brief-confirmation:**
- `src/kernel/arc-types.ts` — `BridgeAxiom` discriminated-union interface + optional `bridgeAxioms?: BridgeAxiom[]` field on `ARCModule`
- `src/kernel/arc-validation.ts` — validate axiomForm enum values
- `src/kernel/arc-axiom-emitter.ts` — 3 emitter functions per axiomForm (reflexivity + symmetry + parthood-extension)
- Developer reconnaissance: Phase 1 emitter handling of `owl:SymmetricProperty` + `owl:ReflexiveProperty` for cco:ont00001810 per Q-4-Step5-A.4

**Developer-side `[VERIFY]` marker flip per Q-4-Step4-A canonical-source-verification-at-fetch-time discipline generalization:**
- Aaron-Developer fetches canonical CCO source at Pass 2b commit time and flips CCO IRI prefix + Connected With ARCEntry domain/range markers

**Out-of-scope (don't include in Pass 2b commit; explicit per Banking 5 out-of-scope artifact acknowledgment):** `.claude/settings.local.json`, `arc/cco/`, `project/MAREP_v2.1.md`.

**Standard commit message format per architect brief confirmation approval.** Architect approved the SME's drafted commit message as preserving the architect-ruling-reference + production-catch + production-miss documentation + cycle accounting + verbal-pending queue divergence acknowledgment at the audit-trail surface.

Standard close-commit cadence applies: remote GitHub Actions CI green verification before Phase 4 Step 5 implementation continues.

### 7.5 What architect explicitly NOT authorizing (per brief confirmation 2026-05-14)

1. No further amendments to the Q-4-Step5-A Pass 2b artifact set. The amendments are stable; the artifact set is ready; the developer commits.
2. No inclusion of out-of-scope artifacts. The SME's explicit out-of-scope list is binding.
3. No bypassing of the `[VERIFY]` marker vendoring-time flip per Q-4-Step4-A canonical-source-verification-at-fetch-time discipline generalization.
4. No silent fixture amendment without audit-trail header per the four-contract consistency discipline (a/b/c/d).
5. No verbal-pending bankings queue divergence reconciliation mid-cycle. Deferral to Phase 4 exit doc-pass is binding per Banking 4.
6. No retroactive corpus fixture cross-reference field audit at this Pass 2b cycle. Forward-track to Phase 4 exit retro is binding.
7. No re-litigation of Q-4-Step5-A rulings. The rulings + their banking generalizations are stable.

### 7.6 Sequencing reaffirmed (per architect brief confirmation 2026-05-14)

In order:

1. **NOW (closed)** — Brief Pass 2b confirmation issued on Q-4-Step5-A artifact set (this cycle close)
2. **Pass 2b commit** — developer commits 7-artifact set + Developer-side implementation work + `[VERIFY]` marker flip from canonical CCO source fetch; remote CI green verification
3. **Developer-side reconnaissance** on Phase 1 emitter handling of owl:SymmetricProperty + owl:ReflexiveProperty for cco:ont00001810 per Q-4-Step5-A.4 deferral
4. **Phase 4 Step 5 implementation continues** post-Pass-2b-commit-green + reconnaissance results
5. **Phase 4 implementation Steps 6-8** per the SME-proposed step ledger; standard cycle cadence applies for any mid-phase escalations
6. **If reconnaissance surfaces gap:** Q-4-Step5-B escalates as separate mid-phase architectural-gap micro-cycle; counter 2 → 3 (still within Q-4-A ~3 projection)

---

**Q-4-Step5-A Pass 2b brief confirmation cycle CLOSED 2026-05-14. Phase 4 mid-phase architectural-gap sub-cycle CLOSED at brief confirmation (formalization at Pass 2b commit + remote CI green). 5 new banked principles forward-fold to Phase 4 exit doc-pass (11 total from Q-4-Step5-A schema extension cycle + Pass 2b brief confirmation combined). Three Phase 4 exit retro forward-track candidates accumulated. Pass 2b UNBLOCKED — developer commits the 7-artifact set + Developer-side implementation + `[VERIFY]` marker flip from canonical CCO source fetch per the architect-ratified contents.**

— SME, 2026-05-14 (Q-4-Step5-A Pass 2b brief confirmation cycle close)
