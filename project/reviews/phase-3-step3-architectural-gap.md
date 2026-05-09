# Phase 3 Step 3 Architectural-Gap Micro-Cycle — AMENDED + RATIFIED

**Date:** 2026-05-09 (initial DRAFT); 2026-05-09 (architect rulings on Q-3-Step3-A + Q-3-Step3-B + editorial-correction + cycle-accounting refinement); 2026-05-09 (AMENDED per refinements); 2026-05-09 (Pass 2b architect ratification — ADR-007 §11 promoted Draft → Accepted)
**Cycle type:** Phase 3 in-Step architectural-gap micro-cycle (first instance for in-Step work; mirrors the Q-3-B Phase 3 entry-cycle micro-cycle pattern). Mid-phase counter increment from primary cycle (Pass 2b confirmation cycle does not increment per architect Pass 2b ruling 2026-05-09).
**Surfaced by:** Developer reconnaissance during Step 3 framing 2026-05-09
**Status:** **AMENDED + RATIFIED 2026-05-09 + Pass 2b §11 PROMOTED 2026-05-09.** Cycle history: (1) SME initial DRAFT 2026-05-09 routed to architect → (2) architect rulings 2026-05-09: Q-3-Step3-A Option (α) APPROVED with idempotency-no-op + multi-ontology-determinism refinements; Q-3-Step3-B ADR-007 §11 placement APPROVED with NAF-reason-code-reuse + spec-§8.5.4-cross-reference refinements; editorial-correction within v0.1.7 freeze APPROVED; cycle-accounting refinement APPROVED with banking; 3 new banked principles → (3) AMENDED packet folding rulings: §2.2 spec text refinements folded; §3 per-variant table refinements folded; §5 banked principles transcribed verbatim; §6 cycle accounting refined → (4) SME path-fence-authored ADR-007 §11 ratified text + 5 editorial corrections + new API §5.5 → (5) **Pass 2b architect ratification 2026-05-09: ADR-007 §11 promoted Draft → Accepted with eleven-of-eleven amendment-shape correspondence checks passing + 2 additional banked principles (explicit-reason-enum-stability + ADR-closing-section-update) + cycle-accounting note (Pass 2b confirmation cycles do not increment counters).** Pass 2b commit authorized; Developer's call on standalone vs bundled commit shape per Q-3-G discipline.

**Routing:** SME path-domain post-ratification work (no further architect cycle for amendments): (a) SME amends §2.2 spec text per refinements [done in this version]; (b) SME path-fence-authors ADR-007 §11 ratified text → routes Pass 2b architect cycle (mirrors I5/I6/I7); (c) SME path-fence-authors 5 editorial corrections → bundles with Step 3 implementation commit OR standalone docs commit per Developer's call.

**Blocks:** Phase 3 Step 3 implementation. Does NOT block Pass 2b parallel cycles (I5 ADR-007 §10 + I6 Phase 2 exit packet update + I7 strategy_routing_annotated fixture amendment + I8 visual_equivalence_trap).

**Predecessor:** [`project/reviews/phase-3-entry.md`](./phase-3-entry.md) (AMENDED + RATIFIED 2026-05-08); Pass 2a developer commit landed; Step 1 + Step 2 framings covered the at-risk-canary pre-emptive review + parity-canary publication artifact.

---

## 1. Surfaced architectural gaps (Aaron's routing dispatch context)

Two genuine spec/API gaps surfaced during Step 3 (`evaluate()` skeleton + `EvaluableQuery` evaluation against built-in OWL). Both must close before Step 3 code work can proceed under the corpus-before-code discipline.

### 1.1 Q-3-Step3-A — FOL-state-loading API surface

**The contradiction:**

- **API §6.1** (`owlToFol`): "Pure: does not require or modify a session."
- **API §5.4** (Session-required errors): "the lifter and projector internals exposed via `owlToFol` and `folToOwl` when called **with a session**" — implicitly contradicts §6.1's purity claim.
- **Spec §5.2** (Lifter): "the lifter loads the corresponding ARC axioms into the Tau Prolog session" — direct contradiction with §6.1's "does not modify a session."
- **API §5.3** (Lifecycle pattern): example shows `createSession()` → `evaluate(session, query)` with **nothing between them**. `evaluate()` per §7.1 queries against the session's FOL state, but no API exposes how that state gets there.

The gap is real: there is no spec'd composition function that loads a lifted ontology into a session. Phase 1's `owlToFol` returns a `FOLConversionResult`; nothing receives it.

### 1.2 Q-3-Step3-B — FOL → Tau Prolog clause translation rule set

**The omission:** ADR-007 was promised "forthcoming" for class-expression lifting algorithm; ADR-007 §1 names cycle-guarded SLD ingestion as "Phase 3 evaluator's concern." But the per-FOLAxiom-variant translation rules to Prolog clauses are not enumerated in either spec or any current ADR.

Step 3 needs the rules for at least:
- `FOLAtom` (state assertion + EvaluableQuery goal)
- `FOLConjunction` (in EvaluableQuery + in implication body)
- `FOLImplication` (state — lifter emits these)
- Skolem-constant existentials (Phase 1 already mints these at lift time)
- Variable + predicate-IRI canonicalization to Prolog atoms

Forward-tracks for Step 6 (`checkConsistency`) need:
- `FOLNegation` (NAF semantics + closedPredicates interaction)
- `FOLDisjunction` (non-Horn flag → unverifiedAxioms)
- `FOLEquality` (same_as discipline per spec §5.5 + ADR-010)
- `FOLFalse` (reified via `inconsistent` predicate per spec §8.5.2)

---

## 2. Q-3-Step3-A — SME-routable resolution: loadOntology API surface

### 2.1 Recommended option: **(α) `loadOntology(session, ontology)` composition function**

SME's strong preference per the existing-API-conventions lens:

- **Top-level functions**: matches `createSession`, `disposeSession`, `owlToFol`, `folToOwl`, `evaluate`, `checkConsistency`, `roundTripCheck` — all top-level. Adding a top-level function continues the pattern; method-on-session (option γ) breaks the opaque-handle convention from §5.1.
- **Async for I/O-touching operations**: matches `owlToFol` (rdf-canonize is async). `loadOntology` calls `owlToFol` internally → must be async.
- **Composition over coupling**: `createSession` + `loadOntology` as separate calls preserves the multi-ontology session pattern (load N ontologies into one session, then query). Option (β)'s `createSession(config?, ontology?)` overloads session creation with an ontology dependency that may not be known at session creation time.

Option (γ) — session methods — was rejected at ADR-019 (per API §5: "Session is an opaque type from the consumer's perspective"). The opaque-handle contract is load-bearing for the immutable-session-from-outside discipline.

### 2.2 Proposed API §5.5 spec text (SME draft)

> ### 5.5 loadOntology
>
> ```typescript
> async function loadOntology(
>   session: Session,
>   ontology: OWLOntology,
>   config?: LifterConfiguration
> ): Promise<FOLConversionResult>;
> ```
>
> Composes `owlToFol` with session-state mutation. Calls `owlToFol(ontology, config)` internally; asserts the resulting lifted FOL axioms into the session's Tau Prolog state via the same protocol as `assertz`. Loads the corresponding ARC manifest entries into the session per behavioral spec §5.2.
>
> Returns the `FOLConversionResult` from the internal `owlToFol` call so consumers can inspect Recovery Payloads, Loss Signatures, and the Projection Manifest immediately after loading.
>
> **Multi-ontology semantics.** A session MAY have `loadOntology` called multiple times with different ontologies; the FOL state accumulates per spec §5.5.3. The session's audit-artifact ledger accumulates Loss Signatures and Recovery Payloads across all loaded ontologies. Subsequent `evaluate(session, query)` calls run against the cumulative FOL state.
>
> **Multi-ontology accumulation determinism.** When multiple ontologies load into the same session, the resulting FOL state is the union of each ontology's lifted FOL plus any cross-ontology entailments. **The order of `loadOntology` calls MUST NOT affect the final FOL state's content.** Same set of ontologies loaded in any order produces byte-identical FOL state per the determinism contract from spec §0.1 + API §6.1.1. Per architect Q-3-Step3-A refinement 2 ruling 2026-05-09.
>
> **Idempotency (no-op contract).** Calling `loadOntology` twice with the byte-identical ontology (by content hash) into the same session is a **no-op**: the second call returns success without re-lifting and returns the cached `LoadOntologyResult` from the prior load. This preserves spec §7.4's deterministic `@id` discipline AND supports consumers writing graph-merge or import-resolution code that naturally calls `loadOntology` repeatedly across overlapping ontology sets — raising on duplicate would force consumers to maintain their own loaded-set tracking. Per architect Q-3-Step3-A refinement 1 ruling 2026-05-09.
>
> **Throws:**
> - `SessionRequiredError` if `session` is null/undefined per §10.3 convention
> - `SessionDisposedError` if the session has been disposed per §5.2
> - All errors `owlToFol` throws (`UnsupportedConstructError`, `IRIFormatError`, etc.) propagate
> - `arc_manifest_version_mismatch` per §2.1.2 if `config.arcManifestVersion` differs from session's recorded version
> - `structural_annotation_mismatch` per §2.1.1 if the ontology declares structural annotations that diverge from the session's declared set

### 2.3 Editorial corrections required (within v0.1.7 freeze)

SME-routable: this is an **editorial correction of omission** — the contradiction in §5.2 + §6.1 implies the API surface must exist; the spec just didn't enumerate it. Per the Q-Frank-1 banked principle (terminology naming a contract weaker than its natural semantic loading is editorially-correctable within freeze), adding `loadOntology` to fill the contract gap is analogous and should fall under the same discipline. Architect rules whether to treat as v0.1.7 editorial or v0.1.8 minor-version-bump.

Required corrections:

| Surface | Current | Proposed |
|---|---|---|
| API §5.3 Lifecycle pattern | `createSession()` → `evaluate(session, query)` | Insert `loadOntology(session, ontology)` between them; rewrite worked example to show full lifecycle |
| API §5.4 Session-required errors | "owlToFol and folToOwl when called with a session" | Strike "with a session" — owlToFol/folToOwl are session-pure; the session-mutating API is `loadOntology` |
| API §6.1 owlToFol intro | "Pure: does not require or modify a session." | Keep verbatim. Add cross-reference: "To compose `owlToFol` with a session, see `loadOntology` (§5.5)." |
| Spec §5.2 Lifter | "the lifter loads the corresponding ARC axioms into the Tau Prolog session" | "`loadOntology` (API §5.5) composes the lifter with session-state assertion. The lifter itself (`owlToFol` per API §6.1) is pure — it returns a `FOLConversionResult`; `loadOntology` asserts that result into the session." |
| ADR-019 (session as opaque handle) | unchanged | Cross-reference §5.5 as the canonical session-mutating API |

### 2.4 Architect rulings on Q-3-Step3-A — RESOLVED 2026-05-09

| Sub-question | Ruling |
|---|---|
| Option (α/β/γ) | ✅ **Option (α) APPROVED** — top-level `async loadOntology(session, ontology, config?)` composition function. ADR-019 + API §5.1 + API §6.1 contracts preserve. Option (β) rejected (would force createSession async, embed lifter inside session lifecycle, mutate session implicitly). Option (γ) rejected (breaks opaque-handle convention from §5.1). |
| Spec section | ✅ **API §5.5 APPROVED** between §5.4 Session-required errors and §6 Conversion Functions |
| Idempotency contract | ✅ **No-op APPROVED** (refinement 1) — second call returns cached `LoadOntologyResult`; raises consumer-friendly behavior per the rationale that consumers writing graph-merge or import-resolution code naturally call `loadOntology` repeatedly across overlapping ontology sets. Reflected in §2.2 spec text amendment above. |
| Multi-ontology semantics | ✅ **Order-independent determinism APPROVED** (refinement 2) — same set of ontologies loaded in any order produces byte-identical FOL state per spec §0.1 + API §6.1.1 determinism contract. Reflected in §2.2 spec text amendment above. |
| Editorial correction within v0.1.7 vs v0.1.8 | ✅ **Editorial correction within v0.1.7 freeze APPROVED.** Per architect's generalization of Q-Frank-1 banked principle (§5 banked principle 2 below): editorial corrections include both terminology sharpening AND language tightening to reflect newly-introduced API surfaces architecturally implicit but not textually explicit. |
| Async vs sync | ✅ **Async APPROVED** (matches `owlToFol` per API §0.2 I/O contract) |

---

## 3. Q-3-Step3-B — SME-routable resolution: FOL → Tau Prolog translation rule set

### 3.1 Per-variant translation table (SME draft)

| FOL variant | Translation strategy | Step 3 scope | Spec/ADR ref |
|---|---|---|---|
| `FOLAtom` (P(t1, …, tn)) | **As state assertion**: `assertz(p(T1, …, Tn))`. **As EvaluableQuery goal**: `?- p(T1, …, Tn)`. Predicate IRI normalized to a Prolog atom via `canonicalIRI(p)` per spec §4.2. Variables become uppercase Prolog vars; constants stay as canonicalized atoms. | **In scope** — both state + query | spec §5.1 (Triple-to-predicate mapping); ADR-007 §1 |
| `FOLConjunction` (P ∧ Q) | **In EvaluableQuery**: `?- p(X), q(X)` (Prolog comma-separated goals). **In implication body**: `q(X) :- p(X), r(X)` (canonical Prolog conjunction in body). | **In scope** — both surface | spec §5.1; API §7.5 EvaluableQuery |
| `FOLImplication` (∀x. P(x) → Q(x)) | **State only** (lifter emits these per ADR-007 §1; never appears in queries — rejected at API §7.5). Universal quantifier absorbed by Prolog's implicit-universal-over-vars convention. Translated as Prolog rule: `q(X) :- p(X)`. Multiple antecedent atoms via conjunction. | **In scope** — state only | spec §5.1; ADR-007 §1 |
| Skolem-constant existentials (∃y. R(x, y) — already lifted) | Lifter Skolemizes per spec §5.7 + ADR-005 to `R(x, sk_y(...))` at lift time; Skolem constants become deterministic Prolog atoms; existential is implicit in unification at evaluator time. | **In scope** — lift-time work; Step 3 just consumes | spec §5.7; ADR-005 |
| Variable + predicate-IRI canonicalization | Prolog atoms via `canonicalIRI(iri)` (deterministic). Variables (`{ "@type": "fol:Variable", name: "x" }`) → Prolog uppercase vars (`X`, `Y`, … with deterministic alpha-renaming for fresh vars). | **In scope** | spec §5.6 (IRI normalization) + §4.2 (canonical form) |
| `FOLNegation` (¬P) | **In EvaluableQuery**: rejected per API §7.5 (not in EvaluableQuery subset). **In implication body**: Prolog `\+ p(X)` (negation-as-failure). Spec §6.3 default-OWA: `\+ p` succeeding maps to `'undetermined'` (no proof) NOT `'false'`, UNLESS predicate `p` is in `closedPredicates`. **Per architect Q-3-Step3-B refinement 1 ruling 2026-05-09:** if predicate in closedPredicates, `\+ p` → `'false'` with reason **`inconsistent`** (REUSED existing reason code — not introducing new `closed_world_negation` reason; the closed-predicate NAF case is structurally a refutation under closed-world semantics, matching the existing `inconsistent` reason). If predicate NOT in closedPredicates: `'undetermined'` with reason `naf_residue` (matching the LossSignature lossType from API §6.4.1). | **Forward-track to Step 4 (closedPredicates)** + **Step 6 (No-Collapse)** | spec §6.3 + §6.3.2; API §6.3 closedPredicates; API §11 reason enum (no new code) |
| `FOLDisjunction` (P ∨ Q) | **In EvaluableQuery**: rejected per API §7.5. **In implication body**: Prolog `;` disjunction. **In implication head**: NOT native Prolog (disjunctive heads not allowed). Per **spec §8.5.4** (architect Q-3-Step3-B refinement 2 ruling 2026-05-09 — explicit cross-reference): "Sound for Horn-expressible contradictions. ... Incomplete for full SROIQ. A class may be unsatisfiable in OWL 2 DL via reasoning the Horn fragment cannot express (e.g., requires case analysis on a disjunction)." Per spec §8.5.1, disjunctive consequents are outside the Horn-checkable fragment; classes whose definitions involve them are classified `'undetermined'`/`coherence_indeterminate` per spec §8.5.2; the offending axioms surface in `unverifiedAxioms` per API §8.1.1. ADR-007 §11 text covers the Tau Prolog translation rule (skip Horn-resolution; mark for `unverifiedAxioms`); the per-variant table cross-references spec §8.5.4 as the architecturally-binding framing. Flag-not-reject discipline preserves ADR-007 §1's cycle-discipline of lifter emitting classical FOL. | **Forward-track to Step 6** (`unverifiedAxioms` surfacing) | spec §8.5.1 + **§8.5.4** (binding framing); spec §8.5.2; ADR-007 §1; API §8.1.1 |
| `FOLEquality` (t1 = t2) | **In EvaluableQuery**: rejected per API §7.5. **At lift level**: `same_as` predicate per spec §5.5 + ADR-010 with identity-rewrite rules. Prolog `=` is unification (different from classical equality); `==` is syntactic identity (also different). The same_as discipline handles state-level equality. | **Out of Step 3 query scope; forward-track to Step 6 same_as discipline** | spec §5.5; ADR-010 |
| `FOLUniversal` in body (∀x. … in implication body) | Lifter never emits universal-in-body per ADR-007 §1 (universals are at outermost binding only); body universals would be a punted construct rejected with `UnsupportedConstructError`. If encountered in `axiomSet` (hypothetical reasoning, API §8.1.2): outside Horn fragment per spec §8.5.1; surfaces as `unverifiedAxioms`. | **Out of Step 3 scope** (lift-time rejection per ADR-007 §1) | ADR-007 §1; spec §13.1 |
| `FOLFalse` (⊥) | **In EvaluableQuery**: rejected per API §7.5. **At checkConsistency level (Step 6)**: reified via `inconsistent` predicate per spec §8.5.2. Tau Prolog has no native `false`; `assertz(inconsistent)` is the contradiction-detection signal. | **Reserved for Step 6 checkConsistency machinery** | spec §8.5.2 |

### 3.2 Step 3 minimum + Step 6 forward-tracks

**Step 3 minimum (in-scope per Q-3-Step3-B SME framing):**
- FOLAtom (assertz state + ?- query)
- FOLConjunction (in EvaluableQuery + in implication body)
- FOLImplication (state-only Prolog rule)
- Skolem-constant consumption (lift-time output)
- Variable + predicate-IRI canonicalization

**Step 4 forward-track (`closedPredicates` + per-predicate CWA):**
- FOLNegation NAF semantics + closedPredicates table interaction

**Step 6 forward-track (`checkConsistency` + No-Collapse):**
- FOLNegation + FOLDisjunction + FOLEquality (same_as) handling
- FOLDisjunction-in-head → unverifiedAxioms surfacing
- FOLFalse → `inconsistent` predicate reification per spec §8.5.2
- FOLUniversal-in-body → unverifiedAxioms surfacing (out-of-Horn-fragment)

### 3.3 ADR placement: extend ADR-007 with §11 vs new ADR

**SME proposes: extend ADR-007 with new §11 "FOL → Tau Prolog clause translation rule set."**

Rationale:
- ADR-007 already houses the "lifter emits classical FOL" decision (§1) + "n-tuple matcher conventions" (§7) + "RDFC-1.0 b-node Skolem prefix" (§8) + "meta-vocabulary encoding" (§10 — promoted at Pass 2b I5)
- The FOL → Prolog translation rules are a natural sibling: lifter (§1) → projector (§7) → ARC handling (§8) → meta-vocabulary (§10) → evaluator clause translation (§11)
- New ADR (e.g., ADR-022) would create a separate audit-trail surface; absorbing into ADR-007 preserves single-SHA audit per Q-3-G banked discipline

**Alternative (architect-final):** new ADR if architect prefers separate audit-trail-per-ADR for evaluator-side decisions vs lifter-side decisions.

### 3.4 Architect rulings on Q-3-Step3-B — RESOLVED 2026-05-09

| Sub-question | Ruling |
|---|---|
| Step 3 scope | ✅ **APPROVED as drafted** — FOLAtom + FOLConjunction + FOLImplication + Skolem consumption + canonicalization as Step 3 minimum |
| FOLNegation NAF semantics for Step 4 | ✅ **APPROVED with refinement 1** — closed-predicate case → `'false'` with reason **`inconsistent`** (reuse existing reason code; do NOT introduce 18th `closed_world_negation` code). Open-predicate case → `'undetermined'` with reason `naf_residue` (matches LossSignature lossType per API §6.4.1). Reflected in §3.1 per-variant table amendment above. |
| FOLDisjunction in head — lift-reject vs evaluator-flag | ✅ **Flag-not-reject APPROVED with refinement 2** — explicit cross-reference to spec §8.5.4 framing in §3.1 per-variant table; preserves ADR-007 §1 cycle-discipline. Reflected in §3.1 amendment above. |
| FOLEquality forward-track | ✅ APPROVED — Step 6 same_as discipline per spec §5.5 + ADR-010 |
| FOLFalse forward-track | ✅ APPROVED — Step 6 reified via `inconsistent` predicate per spec §8.5.2 |
| FOLUniversal-in-body out-of-scope | ✅ APPROVED — lift-time rejection per ADR-007 §1 + spec §13.1 |
| ADR placement | ✅ **ADR-007 §11 APPROVED** (sibling to §1 lifter / §7 n-tuple matcher / §8 RDFC-1.0 b-node Skolem prefix / §10 meta-vocabulary). New ADR rejected (would fragment encoding-convention audit trail; ADR-007 §11 preserves single-SHA audit-trail-per-architectural-surface per Q-3-G discipline). |

---

## 4. Required commits sequence (per Aaron's Q-3-Step3-C ratification)

**Single Step 3 architectural-gap ratification commit** lands before Step 3 code work:

1. **API §5.5** new section (`loadOntology`) per Q-3-Step3-A ruling
2. **API §5.3 + §5.4 + §6.1** editorial corrections per Q-3-Step3-A ruling
3. **Spec §5.2** editorial correction per Q-3-Step3-A ruling
4. **ADR-007 §11** (or new ADR) per Q-3-Step3-B ruling
5. **Phase 3 entry packet §7 step ledger** Step 3 framing extended to reference loadOntology + ADR-007 §11 translation rules
6. **Phase 3 entry packet §1 + §11 + §12** updated with Q-3-Step3-A/B/C disposition + new banked principles

After this commit lands and remote CI is green, Step 3 code work proceeds as a single commit per Q-3-Step3-C ratification.

---

## 5. Banked principles from this cycle (architect-ratified 2026-05-09)

Banked verbally by the architect at the ratification cycle 2026-05-09; formalize at AUTHORING_DISCIPLINE Phase 3 exit doc-pass under "Phase 3 Banked Principles" alongside the principles banked from Phases 1, 2 and Phase 3 entry cycles. Per the §11 verbatim-transcription discipline (Phase 3 entry packet §12 banked principle 10), transcribed verbatim from architect ruling text.

1. **Architectural commitments adjacent to existing ADR architectural surfaces fold into the existing ADR as numbered sections rather than spawn new ADRs.** Single-SHA audit-trail-per-architectural-surface preserves through ADR section growth. *(Q-3-Step3-B framing — ADR-007 §11 placement; generalization of Q-3-G audit-trail-unity-per-surface)*

2. **Editorial corrections within v0.1.7 freeze include both terminology sharpening and language tightening to reflect newly-introduced API surfaces that were architecturally implicit but not textually explicit.** The substance-preserving criterion governs both cases. *(Editorial-correction ruling — generalization of Q-Frank-1)*

3. **Cycle-accounting buckets split by surface:** in-Step micro-cycles increment mid-phase counter; entry-packet ratification cycles increment entry-cycle counter; exit-cycle corrective sub-cycles + stakeholder-routing cycles stay in corrective sub-cycle bucket. **Substantive-scope-weighting operationalizes per phase: mid-phase counter is bounded by the phase's architectural-surface count, not a uniform threshold across phases.** *(Cycle-accounting refinement — operationalization of Q-E 2026-05-06 substantive-scope-weighting principle)*

### Additional banked principles from Pass 2b cycle 2026-05-09

The Pass 2b architect ratification cycle (ADR-007 §11 promotion) banked two further principles + a cycle-accounting note. Verbatim transcription per the §11 discipline.

4. **Ratified ADR text includes explicit statements of any architectural commitments the section preserves** (e.g., enum stability counts, version-bump dispositions, cross-section invariants) so future readers can verify the architectural claim without re-deriving it from cycle history. *(Pass 2b banking — explicit-reason-enum-stability-statement discipline; pattern-aligned with the architectural-commitment-tier marker on ADR-007 §1)*

5. **When ADR architectural surfaces grow through numbered section additions across cycles, the ADR's closing sections (Context, Consequences, Cross-references) update to reflect the accumulated architectural surface.** Self-containedness preserves through architectural-surface growth. *(Pass 2b banking — ADR-closing-section-update discipline; pattern-aligned with the ADR-011 banked-principles consolidation at Phase 2 Step 4 cycle 2026-05-07)*

6. **Pass 2b architect-mediated cycles for ratifying path-fence-authored artifacts whose substance was ratified at the prior architect cycle do not increment cycle-cadence counters.** They are completion of the prior cycle's resolution per the audit-trail-unity-per-surface discipline. *(Pass 2b cycle-accounting note — generalization of Phase 1 entry-cycle precedent for brief follow-up confirmation cycles)*

---

## 6. Cycle accounting (architect-refined 2026-05-09)

**This is a Phase 3 in-Step architectural-gap micro-cycle (first instance).** Per the architect's cycle-accounting refinement banking 2026-05-09 (§5 banked principle 3) + Pass 2b cycle-accounting note 2026-05-09 (§5 banked principle 6):

- **Phase 3 entry-cycle counter:** 2 (initial review + amendment ratification, both 2026-05-08; closed)
- **Phase 3 mid-phase counter:** **1** (this cycle's primary architect-ratification 2026-05-09; the Pass 2b §11 promotion confirmation cycle 2026-05-09 does NOT increment per §5 banked principle 6)
- **Phase 2 mid-phase counter:** 6 (closed)
- **Cumulative cycle counter:** not tracked per the prior banking

The refinement disambiguates: mid-phase counter = in-Step architectural-gap micro-cycles surfacing from Step implementation work. Corrective sub-cycles (per Step 9.1 banking) and stakeholder-routing cycles stay in corrective sub-cycle bucket. Entry-packet ratification cycles increment entry-cycle counter. **Pass 2b architect-mediated cycles for ratifying path-fence-authored artifacts whose substance was ratified at the prior cycle do not increment any counter** — they are completion of the prior cycle's resolution per the audit-trail-unity-per-surface discipline (architect Pass 2b ruling 2026-05-09).

**Substantive-scope-weighting projection (architect ruling 2026-05-09):** Phase 3 has 9 Steps; current cadence is one architectural-gap micro-cycle per ~3 Steps; projection is mid-phase counter ending at ~3 by Phase 3 close, within bounds for Phase 3's substantive scope (evaluator + consistency + cycle detection + per-predicate CWA + structural annotation mismatch + ARC manifest version mismatch + session-aggregate step cap + typed-error hierarchy completion).

---

## 7. Sequencing per architect ratification 2026-05-09

In order:

1. **Now** — Architect rulings on Q-3-Step3-A + Q-3-Step3-B + editorial-correction + cycle-accounting refinement received (this cycle, this AMENDED packet records the rulings)
2. **SME path-domain work** (✅ all complete 2026-05-09):
   - ✅ Amend §2.2 spec text per Q-3-Step3-A refinements (idempotency no-op + multi-ontology determinism)
   - ✅ Path-fence-author **ADR-007 §11 ratified text** per Q-3-Step3-B + refinements (NAF closed → `inconsistent` reuse + FOLDisjunction-in-head spec §8.5.4 cross-reference + reason-enum-stability statement)
   - ✅ Path-fence-author **5 editorial corrections** (API §5.3 lifecycle + §5.4 session-required errors + §6.1 owlToFol intro + spec §5.2 lifter + ADR-019 cross-reference) + **new API §5.5** loadOntology section per the editorial-correction-within-v0.1.7-freeze ruling
3. **✅ Pass 2b architect cycle for ADR-007 §11 promotion 2026-05-09** — eleven-of-eleven amendment-shape correspondence checks passing; promoted Draft → Accepted; 2 additional banked principles + cycle-accounting note recorded in §5 + §6
4. **⏳ Developer commits ADR-007 §11 promotion** — standalone `docs:` commit OR bundled with Step 3 implementation per developer's call; commit body cites Pass 2b ratification message
5. **⏳ Developer commits editorial corrections + new API §5.5** — bundled into Step 3 implementation commit OR standalone `docs:` commit per developer's call; authorized by editorial-correction-within-v0.1.7-freeze ruling (no further architect routing)
6. **⏳ Developer commits Step 3 implementation** — `loadOntology` (API §5.5) wires up via ADR-007 §11's per-variant translation rules; commit body references this micro-cycle's rulings
7. **⏳ Phase 3 Step 3 closes** when all commits land + remote CI green
8. **⏳ Phase 3 Step 4 begins** per the SME-proposed step ledger from the Phase 3 entry packet

Step 3 substantive work proceeds against ratified contracts (loadOntology API §5.5 + ADR-007 §11 FOL → Prolog translation rules). No further architect routing required for Step 3 unless implementation surfaces additional architectural-commitment-tier escalations.

---

**End of AMENDED + RATIFIED + Pass 2b PROMOTED packet. All SME path-domain work complete; Developer commits authorized.**

— SME, 2026-05-09
