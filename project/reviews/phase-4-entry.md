# Phase 4 Entry Review — AMENDED + RATIFIED (Q-4-C source-state amendment cycle integrated)

**Date:** 2026-05-10 (initial DRAFT, post-Phase-3-close); 2026-05-10 (same day, AMENDED packet folding architect initial-review cycle rulings on Q-4-A through Q-4-H + §3 corpus shape + Pass 2a/2b sequencing + 6 new banked principles); 2026-05-10 (same day, architect final ratification ISSUED on amended packet + 3 new bankings from brief follow-up cycle observing the SME's amendment shape as exemplary practice); **2026-05-10 (same day, Q-4-C source-state amendment cycle: Developer-traversal evidence triggered §8.2 contingency; architect rulings on Option (d) forward-track Layer B vendoring to Phase 5 + Option (d-1) pull `p4_bfo_clif_layer_b.fixture.js` + Q-4-C language amendment + contingency-operationalization sub-cycle bucket framing + 7 new banked principles; first production operationalization of a ratified contingency framing)**.
**Phase:** 4 — BFO 2020 Core ARC Module
**Plan reference:** [`OFBT_implementation_plan_v1 (1).md`](../OFBT_implementation_plan_v1%20(1).md) §3.5
**Roadmap reference:** [`project/ROADMAP.md`](../ROADMAP.md) Phase 4
**Predecessor:** [`project/reviews/phase-3-exit.md`](./phase-3-exit.md) (RATIFIED + CLOSED 2026-05-10 with Q-Frank-Step9-A corrective overlay + exit-packet ratification cycle + doc-pass confirmation).
**Status:** ✅ **AMENDED + RATIFIED 2026-05-10 (Q-4-C source-state amendment integrated).** Cycle history: (1) Initial DRAFT 2026-05-10 → (2) architect initial-review rulings 2026-05-10 + 6 new bankings → (3) AMENDED packet (folded rulings; §11 + §12 populated verbatim) → (4) architect final ratification ISSUED 2026-05-10 + 3 new bankings observing the SME's amendment shape → (5) **Q-4-C source-state amendment cycle 2026-05-10** (per `phase-4-entry-q-4-c-amendment.md`): Developer-traversal evidence confirmed BFO-ontology/BFO repo does NOT contain canonical `bfo-2020.clif` at the granularity Q-4-C ratification assumed; **§8.2 contingency operationalized** for the first production case; architect ratified Option (d) Layer B vendoring forward-tracked to Phase 5 + Option (d-1) `p4_bfo_clif_layer_b.fixture.js` pulled + Q-4-C language amendment + contingency-operationalization sub-cycle bucket framing; 7 new banked principles forward-fold to Phase 4 exit doc-pass; **corpus-before-code count 5 → 4**; Phase 4 contingency-operationalization sub-cycle counter at 1 (closes when Pass 2a commit lands per the amendment); Pass 2a contents revised (Layer B vendoring artifacts removed; entry packet text amended; verification ritual report updated for Cat 8 disposition).

---

## 0. Why this packet routes to the architect first

Cycle-discipline principle from Phase 1 + Phase 2 + Phase 3 entry, applied identically to Phase 4:

> *The corpus is the contract the implementation must satisfy. Signing off on the contract before code is written prevents the failure mode where the implementation passes tests because the tests were retrofitted to the implementation.*

Phase 4 is the **first phase exit where the full validation pipeline (Rings 1–3) operates against real ARC content** — BFO 2020 core. The novel surface is ARC-content-driven inference: BFO Disjointness Map firings, Connected With as primitive with bridge axiom, parthood transitivity + dependence + realization chains under a strict mode that rejects non-BFO predicates. Two new architectural surfaces — `arcModules` parameter on `LifterConfiguration` + `regularityCheck(A, importClosure)` machinery — land in this phase.

**Phase 4 is also the first phase whose entry packet inherits a substantial Q-Frank-Step9-A corrective overlay from Phase 3 close.** That inheritance is load-bearing for the entry packet's ratification: Phase 4 entry packet's deliverable list must include items the Q-Frank-Step9-A corrective ruling explicitly committed to Phase 4 (Case C as exit deliverable per Ask 4; purpose-built consistency-check parity fixture question per Ask 8; `project/v0.2-roadmap.md` as inherited tracking surface per Ask 6; disposition-split discipline NON-inheritance per Ask 5). The packet enumerates inherited items at §4.

The entry packet enumerates:

1. **Entry-criteria confirmation** against plan §3.5 + ROADMAP — §1.
2. **Phase 4 build target** against the spec/API frozen surface + ARC content surface — §2.
3. **Phase 4 corpus + canary inventory** — §3. *This is the contract.* Architect sign-off freezes the corpus for Phase 4.
4. **Inherited items from Phase 3 exit + Q-Frank-Step9-A corrective overlay + exit-packet ratification + doc-pass cycles** — §4.
5. **Architectural questions for architect ruling** (Q-4-A through Q-4-H) — §5.
6. **Validation rings status** — §6.
7. **Phase 4 Step Ledger** (per Q-4-A ratification) — §7.
8. **Risk notes carried into Phase 4** — §8.
9. **What architect final ratification opens — Pass 2a vs Pass 2b** — §9.
10. **SME certification** — §10.
11. **Architect Q-rulings to be resolved** (placeholder for ratification cycle) — §11.
12. **Architect-banked principles to fold** (placeholder; Phase 3 doc-pass's verbal bankings formalize at Phase 4 exit) — §12.
13. **Forward-references** — §13.

Developer scaffolds Phase 4 Step 1 AFTER architect issues final ratification on this packet AND the Pass 2a final ratification commit lands and remote CI is green. Pass 2b items (any architect-mediated work surfaced at the initial-review cycle) route in parallel via separate cycles per the Phase 3 Q-3-G two-pass sequencing precedent; do not block Step 1.

---

## 1. Entry Criteria — Confirmation Against Plan §3.5 + ROADMAP

Plan §3.5 names BFO 2020 ARC content authoring as the parallel workstream gate. ROADMAP Phase 4 Entry Checklist names four items. All resolve below.

| # | Criterion | Source | Status | Evidence |
|---|---|---|---|---|
| 1 | Phase 3 exited (Rings 1, 2, and 3 passing on built-in OWL corpus) | Plan §3.5; ROADMAP | ✅ | [`project/reviews/phase-3-exit.md`](./phase-3-exit.md) RATIFIED + CLOSED 2026-05-10 (corrective commit `9dc5e8a`; doc-pass confirmation cycle close); 43 corpus fixtures (15 Phase 1 + 12 Phase 2 + 16 Phase 3) verified; Ring 1 + Ring 2 + Ring 3 green. |
| 2 | All BFO 2020 ARC entries are status Verified; no [VERIFY] or Draft entries remain | ROADMAP Phase 4 Entry Checklist | ✅ | `arc/core/bfo-2020.json` — 40 ARCEntry instances, 0 [VERIFY] markers. Per-entry `notes` field carries "Verified against loaded BFO 2020 in triplestore" status indicator (per the embedded verification convention from the Aaron-led parallel workstream). |
| 3 | Resolve [VERIFY] on rows 49 (First Instant Of) and 50 (Last Instant Of) against current `bfo-2020.owl` release | ROADMAP Phase 4 Entry Checklist | ✅ | 4 mentions of First/Last Instant in `arc/core/bfo-2020.json`; 0 [VERIFY] markers remain. SME spot-check confirms Aaron-led BFO ARC authoring resolved these against the current release. **Architect spot-check welcome at initial-review cycle.** |
| 4 | BFO 2020 ARC content authored, reviewed, and ingested into `arc/core/bfo-2020.json` | ROADMAP Phase 4 Entry Checklist | ✅ | `arc/core/bfo-2020.json` ships 40 verified entries; ingested from the Aaron-led parallel workstream against the v3 relations catalogue. |
| 5 | Phase 4 BFO 2020 CLIF Layer B vendoring sidecar with populated, verified `license-verification` block | ROADMAP Phase 4 Entry Checklist + ADR-010 + Q-β refinement 2026-05-06 | ⏳ **Pending Pass 2a** | `arc/upstream-canonical/bfo-2020.clif` + `bfo-2020.clif.SOURCE` NOT YET vendored. The Layer B canonical source vendoring + license-verification ritual + sidecar authoring lands in Pass 2a alongside this entry packet's final ratification commit per the architect's Phase 4 entry-checklist gate item. SME proposes the source candidate + verification ritual at §5 Q-4-C below. |
| 6 | Phase 3 exit deliverables committed, pushed, and remote CI green | Phase 3 exit packet §1 | ✅ | All Phase 3 close commits landed including the Q-Frank-Step9-A corrective commit `9dc5e8a`; remote CI green per https://github.com/Skreen5hot/OWL-FOL-Bidirectional-Translator/actions/runs/25628583953. Phase 3 exit packet RATIFIED at exit-packet ratification cycle 2026-05-10; ROADMAP Phase 3 status flipped to ✅ Closed. |
| 7 | Phase 3 inherited items (per Q-Frank-Step9-A corrective overlay 2026-05-10) routed to Phase 4 entry packet authoring | Q-Frank-Step9-A corrective ruling 2026-05-10 + Phase 3 exit packet §6 | ⏳ **In this packet** | Inherited items enumerated at §4 below. Including: Case C as Phase 4 EXIT DELIVERABLE per Ask 4; purpose-built consistency-check parity fixture question per Ask 8; `project/v0.2-roadmap.md` inheritance per Ask 6; disposition-split discipline NON-inheritance per Ask 5; 4 reconciled retro candidates; Phase 3 exit-packet ratification cycle's three new bankings (§5/§6/retro-replacement disciplines); two new verbal bankings from doc-pass formalize at Phase 4 exit doc-pass. |
| 8 | Cycle 2 architect-mediated work — splits per Q-3-G two-pass sequencing precedent (if any item surfaces at initial-review cycle) | Q-3-G ruling 2026-05-08 (Phase 3 entry-cycle precedent) | ⏭ **TBD at initial-review cycle** | Pass 2a vs Pass 2b sequencing decided after architect initial-review cycle. SME proposes provisional bundling at §9 below; architect ratifies at initial-review. |

**Item 5 disposition (per ROADMAP gate item):** the Layer B CLIF vendoring requires architect ratification on the source candidate + verification ritual scope (see §5 Q-4-C). SME proposes the W3C BFO 2020 CLIF source from the BFO-ontology repository as the candidate; license verification per the ADR-010 discipline (license URL, license commit SHA, LICENSE file SHA-256, license-text-confirmed, master-head-at-verification). Pass 2a lands the vendored source + sidecar + license-verification block; this entry packet's final ratification commit bundles them per audit-trail-unity-per-surface.

**Item 7 disposition:** Phase 3's inherited items are load-bearing for Phase 4 entry packet authoring. The Q-Frank-Step9-A corrective overlay's explicit commitments to Phase 4 (Case C as exit deliverable, etc.) are NOT forward-tracks the architect can re-relitigate at Phase 4 entry-cycle ratification — they're inherited dispositions that Phase 4 entry packet enumerates and honors. Re-litigation is explicitly refused per the Q-Frank-Step9-A "no re-introduction of the disposition-split discipline" pattern.

---

## 2. Phase 4 Build Target

Per plan §3.5 + ROADMAP Phase 4 Deliverables Checklist + frozen API spec §2.1.2 + §3.6 + frozen behavioral spec §3.4.1 + §3.6.1–§3.6.4 + §6.2.1 + Phase 3 forward-tracks per Q-Frank-Step9-A corrective overlay:

### 2.1 ARC module loader — spec §3.6.2 + API §2.1.2

- `arcModules` parameter on `LifterConfiguration` per spec §3.6.2 — accepts an array of ARC module identifiers (e.g., `["core/bfo-2020"]`) to load
- ARC module loader resolves each declared module from `arc/core/<module-id>.json`; loads + validates per the ARC manifest schema
- Tree-shaking when modules are not declared: `LifterConfiguration` without `arcModules` produces a lifter with NO ARC content loaded; bundle size matches Phase 3 baseline
- ARC module dependency validation per spec §3.6.4: throws `ARCManifestError` if a declared module's dependencies are not also loaded; error message names the missing dependency
- ARC manifest version mismatch per API §2.1.2 — `arc_manifest_version_mismatch` thrown when session and conversion ARC versions diverge (Step 8 Phase 3 deliverable; Phase 4 verifies the surface stays green under ARC-content-driven sessions)

### 2.2 Strict mode — spec §3.6.3 (per Q-4-F lift-rejection ruling 2026-05-10)

- `LifterConfiguration.strictMode: 'strict' | 'permissive'` per spec §3.6.3 (frozen at v0.1.7)
- **Strict mode behavior (against BFO 2020 vocabulary) per Q-4-F architect ruling:** **lift-rejection** is the canonical strict-mode behavior on legacy non-BFO axioms — the lifter REFUSES TO LOAD the ontology if any axiom uses a predicate IRI outside the loaded ARC modules' vocabulary. Throws `UnsupportedConstructError` (canonical typed-error class; extends to cover ARC-conformance-failures); error's `construct` field names the offending axiom IRI; error's `code` field aligns with the snake_case identifier discipline per the Q-Frank-Step9-A retroactive corrective Finding 3 banking. Incremental skip and LossSignature alternatives are **explicitly refused** per Q-4-F: incremental skip silently drops content (corrupts No-Collapse Guarantee); LossSignature emission conflates strict-mode rejection with round-trip approximation surface (corrupts LossSignatures' discriminating purpose).
- **Permissive mode behavior:** non-BFO predicate IRIs lift normally; consumer accepts that the lifted FOL state may include predicates whose semantics are not verified against any loaded ARC module
- The strict-mode rejection is at lift time (not evaluator time); a strict-mode lift that throws does not produce any FOL state
- **Reason-code disposition:** SME proposes reusing existing `unsupported_construct` reason code per the Q-3-Step6-B reason-code-reuse-bounded-by-semantic-state-alignment principle (the rejection IS structurally an "unsupported construct" — the construct uses an IRI outside the loaded ARC vocabulary). If Phase 4 implementation surfaces evidence that a new code (e.g., `arc_conformance_failure`) is required (semantic-state misalignment with `unsupported_construct`), Phase 4 mid-phase architect cycle ratifies the new code per ADR-011 §5 + spec §0.2.3 evidence-gated discipline. Step-N-bind fixture `bfo_strict_mode_rejection.fixture.js` (per §3.3 below) exercises the canonical throw.

### 2.3 BFO Disjointness Map — spec §3.4.1 + ROADMAP

- BFO Disjointness Map firings against built-in OWL `DisjointWith`: when the loaded BFO 2020 ARC declares `Continuant` and `Occurrent` disjoint (via the canonical Disjointness Map), `checkConsistency()` returns `consistent: 'false'` with the BFO Disjointness Map witness when an individual is asserted to both classes
- The BFO Disjointness Map declarations land as ARC-content-derived axioms (lifted from the loaded `arc/core/bfo-2020.json`); they do NOT modify the lifter's classical-FOL-emission contract per ADR-007 §1
- All BFO Disjointness Map commitments declared in the catalogue Notes are formalized as machine-readable axioms in `arc/core/bfo-2020.json` (per the ROADMAP entry-checklist gate)

### 2.4 Connected With as primitive — spec §3.4.1

- Connected With (BFO bridge axiom) lifted as a **primitive** plus the spec §3.4.1 bridge axiom (NOT defined as overlap; the wrong translation that would lose the primitive's load-bearing role in mereotopological closure)
- Bridge axiom enables inferential closure under cycle detection (per ADR-013 visited-ancestor cycle-guard pattern; Connected With closure produces expected entailments without infinite resolution loops)
- Wrong-translation canary `canary_connected_with_overlap.fixture.js` asserts the lifter does NOT emit the defined-as-overlap form (silent-failure regression guard)

### 2.5 Parthood transitivity, dependence, realization chains

- BFO 2020 ARC content drives parthood transitivity per spec §3.4.1 + ADR-013 (visited-ancestor cycle-guard pattern handles the transitive `part_of` + inverse `has_part` cycle-prone predicate class — one of the six classes ratified at Phase 3 Step 5)
- Dependence relations per BFO 2020 ARC (`bearer_of`, `concretizes`, `inheres_in`, etc.) lift to FOL with the appropriate domain/range constraints
- Realization chains per BFO 2020 ARC (`realizes`, `realized_in`) interact with cycle detection per ADR-013

### 2.6 `regularityCheck(A, importClosure)` — spec §6.2.1

- Activates the `regularityCheck(A, importClosure)` machinery per Phase 2 Step 6 forward-track + architect Q-Step6-1 ruling
- Phase 2's projector chain projection emits `regularity_scope_warning` unconditionally; Phase 4 closes this for chains regularity-confirmed under loaded ARC modules' import closure
- The regularity check runs against the loaded BFO 2020 ARC's import closure; chains regularity-confirmed under the closure emit WITHOUT the warning (a non-breaking strengthening of the contract per ADR-011's behavioral-contract evolution discipline)
- Chains the check cannot certify keep the warning (per the conservative emission discipline)

### 2.7 Lifter `ObjectPropertyChain` support

- Per Phase 2 forward-track + Q-Step6-3 ruling 2026-05-XX (deferred to Phase 3 OR Phase 4; SME proposes Phase 4 surfacing per the BFO ARC content forcing case)
- BFO 2020 ARC content includes property chains (e.g., `part_of` ∘ `part_of` → `part_of` is the canonical transitivity chain; other chains in the catalogue surface at lift time)
- Cycle-guarded chain rule emission per ADR-007 §1 + ADR-013 visited-ancestor pattern
- `ObjectPropertyChain` axiom shape per OWL 2 DL grammar; lifter pattern-matches and emits the canonical `∀x,y₁,...,yₙ. P₁(x,y₁) ∧ ... ∧ Pₙ(yₙ₋₁,y) → Q(x,y)` form per ADR-007 §11

### 2.8 Activate the Phase 3 BFO-gated No-Collapse fixtures

- `nc_bfo_continuant_occurrent.fixture.js` activates with `consistent: 'false'` once BFO ARC loaded (held inactive at Phase 3; activates at Phase 4 per ROADMAP §3.4 gate)
- `nc_sdc_gdc.fixture.js` activates if SDC/GDC distinction lives in BFO core rather than OFI deontic content (per ROADMAP §3.4 gate)

### 2.9 PROV-O entailment fixture activation

- Once BFO ARC plus PROV-O alignment is loaded, `prov_entity(project_alpha)` and `prov_entity(project_beta)` MUST be entailed via the conditional implications (Phase 1 deferred fixture per ROADMAP §3.4)

### 2.10 NEW from Phase 3: Layer A consistency-affirmation gap visibility + Layer B introduction defers per Q-4-C amendment

- Phase 4's demo MUST exercise the consistency-rejection direction (BFO Disjointness Map firing `consistent: 'false'` on Continuant ⊓ Occurrent when an individual is asserted to both classes) — this is the Phase 4 demo's Case A canary
- The consistency-affirmation direction (Horn-fragment classifier refinement to affirm consistency on Horn-translatable subsets where simple disjointness is in scope but no individual triggers the body) is **NOT** a Phase 4 deliverable per Q-Frank-Step9-A Refinement 2 — the Layer A consistency-affirmation gap waits on v0.2 ELK closure per `project/v0.2-roadmap.md` v0.2-01
- **NEW per Q-4-C source-state amendment cycle 2026-05-10:** Layer B introduction (BFO ontology content in CLIF) **forward-tracked to Phase 5** per §8.2 contingency operationalization. The Developer-traversal evidence at Pass 2a vendoring time confirmed the BFO-ontology/BFO repo does not contain a canonical `bfo-2020.clif` at the granularity Q-4-C ratification assumed; per the architect's banked principle (Ruling 1 anchor 2): *"fixtures do not claim canonical parity against sources that are upstream-acknowledged-unfinished, upstream-acknowledged-experimental, or vocabulary-mismatched."* Phase 4 ships Layer A continuation (Phase 1+2+3 cumulative discipline preserved); Layer B introduction defers to Phase 5 entry-cycle when the canonical Layer B source can be ratified per source-authority-chain banking. Phase 4 demo Case B (originally framed as Layer B parity citations) shifts to Layer A continuation framing per the §3.4 amendment.

### 2.11 NEW from Phase 3: Case C — Lossy round-trip — as Phase 4 EXIT DELIVERABLE

- Per Q-Frank-Step9-A Ask 4 corrective ruling 2026-05-10: Case C (Lossy round-trip demonstration) is committed to Phase 4 as **exit deliverable**, not forward-track
- Phase 4 demo's authoring scope explicitly includes Case C demonstrating Annotated Approximation OWL output, Loss Signature ledger entries, Recovery Payload, and downstream consumer use of the artifacts
- Phase 4 demo's authoring scope explicitly uses the existing trigger-matcher fixtures (`p2_lossy_naf_residue`, `p2_unknown_relation_fallback`, `strategy_routing_annotated`) PLUS any new Phase 4 trigger-matcher fixtures (BFO ternary parthood surfaces `arity_flattening` LossType; CCO content surfaces additional triggers in Phase 6)
- Phase 4 exit cannot close without Case C shipping in the demo

### 2.12 Coverage matrix — API §14.11

- Coverage matrix cells attributable to BFO 2020 corpus exercised by passing tests: criteria 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 13 (partial), 15 (partial); plus API-2, API-4, API-6, API-9 (partial)
- Coverage matrix is a Phase 7 deliverable per ADR-008 Option A; Phase 4 contributes the BFO-attributable cells

### 2.13 NOT in Phase 4 (deferred to later phases per plan + Q-4-D + Q-4-E rulings)

- IAO information-bridge ARC module — Phase 5
- CCO realizable-holding + mereotopology + measurement + aggregate + organizational + deontic ARC modules — Phase 6 per ADR-009 six-CCO-module expansion
- OFI deontic ARC module + compatibility shim + bundle budget enforcement + coverage matrix CI — Phase 7 per ADR-008 Option A; OFI deontic deferred to v0.2
- **`nc_sdc_gdc.fixture.js` activation per Q-4-E ruling 2026-05-10:** SDC/GDC distinction's natural surfacing context is OFI deontic content (Phase 7), NOT BFO core (Phase 4). Activating `nc_sdc_gdc` at Phase 4 against BFO core would force authoring synthetic SDC/GDC content that doesn't exist in BFO 2020's actual relations. Phase 7 forward-track binding; per banked principle "when the natural surfacing-context for deferred work spans multiple candidate phases, defer to the phase whose corpus or content demands the work."
- ELK reasoner integration — v0.2 (per `project/v0.2-roadmap.md` v0.2-02)
- Layer A consistency-affirmation closure (Horn-fragment classifier refinement) — v0.2 ELK per `project/v0.2-roadmap.md` v0.2-01
- **Purpose-built consistency-check parity fixture per Q-4-D ruling 2026-05-10:** v0.2 forward-track approved. Phase 4 does NOT author a purpose-built consistency-check parity fixture; the fixture's value increases with v0.2 ELK closure path completion, and pre-authoring against incomplete v0.1 Horn-fragment classifier corrupts the value. New entry added to `project/v0.2-roadmap.md` (v0.2-08) per architect directive; Phase 4 maintains the artifact's currency per I3.
- SROIQ reasoner integration — v0.3+ (per `project/v0.2-roadmap.md` v0.2-03)
- SLG tabling for SLD termination — Phase 4-7 OR v0.2 (per ADR-013 escape clause + `project/v0.2-roadmap.md` v0.2-04)
- Per-class Skolem-witness satisfiability checking refinement — v0.2 (per `project/v0.2-roadmap.md` v0.2-05)
- Disposition-split discipline as methodology — **WITHDRAWN** per Q-Frank-Step9-A Ask 5; explicitly NOT inherited at Phase 4 entry packet per the **withdrawn-discipline-non-inheritance banking** (new Q-4 ruling cycle banking: Phase 4 entry packet inheriting Phase 3 close's withdrawn-discipline-non-inheritance preserves the discipline-correction discipline forward across phase boundaries)

---

## 3. Phase 4 Test Corpus — SME-Proposed Inventory for Architect Sign-Off

**This is the contract the BFO 2020 ARC integration must satisfy.** Architect ratification of §3 freezes the corpus for Phase 4; Developer scaffolds against it.

**Corpus activation timing per Q-3-E precedent.** Each fixture below is tagged with one of two activation-timing categories per the architect-banked corpus-before-code-vs-step-N-bind discipline (carries forward from Phase 3):

- **corpus-before-code** (architectural-commitment-tier; lands in Pass 2a alongside this entry packet's final ratification commit, before Phase 4 Step 1) — exercises spec-named guarantees or API-spec-named behavior contracts
- **step-N-bind** (implementation-detail-tier; lands during Phase 4 implementation alongside the Step that ships the feature) — exercises specific implementation conventions chosen during the corresponding Step

SME's election (per Q-3-E precedent): **convention-only, no manifest schema tightening.**

### 3.1 Phase 1 + Phase 2 + Phase 3 corpus continues (43 fixtures, no new authoring + 1 reactivation)

The 43 existing fixtures (15 Phase 1 + 12 Phase 2 + 16 Phase 3, all `verifiedStatus: 'Verified'` or per Phase 3 close inheritance) continue to pass Rings 1, 2, and 3 throughout Phase 4 work. **One re-binding** per Q-3-Step5-B Phase 3 forward-track: `cycle_equivalent_classes` Class-3 fixture re-binds at Phase 4 entry-cycle when BFO ARC content surfaces the cycle-prone predicate forcing case.

### 3.2 BFO 2020 ARC content fixtures — corpus-before-code (per Q-4-B + Q-4-E rulings 2026-05-10 + Q-4-C source-state amendment cycle 2026-05-10)

Per Q-4-B + Q-4-E rulings 2026-05-10 + **Q-4-C source-state amendment cycle 2026-05-10**: **4 corpus-before-code fixtures** (2 less than the initial DRAFT's 6, via two reductions: (i) `nc_sdc_gdc` forward-tracked to Phase 7 per Q-4-E at AMENDED packet final ratification → 6 to 5; (ii) **`p4_bfo_clif_layer_b.fixture.js` pulled at Q-4-C source-state amendment cycle 2026-05-10** per Ruling 2 — Layer B parity forward-tracked to Phase 5 per §8.2 contingency operationalization → 5 to 4).

| Fixture | Activation timing | Ratified outcome | Catches |
|---|---|---|---|
| `nc_bfo_continuant_occurrent.fixture.js` | **corpus-before-code** (activates at Phase 4 entry; `corpusActivationTiming: 'corpus-before-code'`) | `consistent: 'false'` with BFO Disjointness Map witness | Continuant ⊓ Occurrent disjointness from BFO Disjointness Map; was held inactive at Phase 3 per ROADMAP gate |
| `canary_connected_with_overlap.fixture.js` | **corpus-before-code** (NEW Phase 4 authoring; `corpusActivationTiming: 'corpus-before-code'`) | Connected With lifted as primitive + bridge axiom; defined-as-overlap form ABSENT | Wrong-translation canary: Connected With collapsed to defined-as-overlap (loses primitive's role in mereotopological closure) |
| `canary_bfo_disjointness_silent_pass.fixture.js` | **corpus-before-code** (NEW Phase 4 authoring; `corpusActivationTiming: 'corpus-before-code'`) | `checkConsistency` returns `consistent: 'false'` with BFO Disjointness Map witness; silent-pass MUST NOT occur | Silent-pass canary for BFO Disjointness Map (the BFO analog of Phase 3's `nc_silent_pass_canary` adversarial discipline) |
| `cycle_equivalent_classes.fixture.js` (re-binding) | **corpus-before-code** (`corpusActivationTiming: 'corpus-before-code'`) | Per Q-3-Step5-B forward-track: re-binds at Phase 4 entry-cycle once BFO ARC content surfaces the Class-3 cycle-prone predicate forcing case | Class 3 cycle-prone predicate (held forward-tracked beyond Step 5 minimum) |

**Withdrawn from corpus-before-code per Q-4-E ruling 2026-05-10:** `nc_sdc_gdc.fixture.js` — Phase 7 OFI deontic forward-track approved (SDC/GDC distinction's natural surfacing context is OFI deontic content, not BFO core); fixture stays Draft at Phase 4 + activates at Phase 7 if OFI deontic ships, else forward-tracks to v0.2 if OFI deontic stays deferred per ADR-008.

**Pulled at Q-4-C source-state amendment cycle 2026-05-10 (per Ruling 2):** `p4_bfo_clif_layer_b.fixture.js` — Layer B parity forward-tracked to Phase 5 per §8.2 contingency operationalization. Aaron-Developer Pass 2a repo-traversal evidence confirmed BFO-ontology/BFO repo @ master HEAD `857be9f15100531c7202ef0eb73142f95b70f3a7` does NOT contain a canonical `bfo-2020.clif` at the granularity Q-4-C initial ratification (AMENDED packet) assumed; available candidates (ontohub.org/bfo / Mungall fol-mungall / Ressler 2012-alpha) each corrupt the parity claim per a banked principle (upstream-acknowledged-unfinished, upstream-acknowledged-experimental, vocabulary-mismatched). Fixture deleted entirely from `tests/corpus/` + manifest entry removed per Ruling 2 disposition discipline ("Fixture-pull dispositions under contingency-triggered cycles delete or hold the fixture entirely rather than restage as stub"); git history preserves the work-in-progress for Phase 5 re-authoring. Sidecar shell `arc/upstream-canonical/bfo-2020.clif.SOURCE` marked Phase-5-forward-tracked. See `phase-4-entry-q-4-c-amendment.md` for the full cycle artifact; see §6.1 below for the Phase 5 inheritance manifest.

### 3.3 Phase 4 BFO ARC content fixtures — step-N-bind

| Fixture | Step binding | Ratified outcome | Catches |
|---|---|---|---|
| `bfo_parthood_transitivity.fixture.js` | step-N-bind (Step where parthood transitivity ships) | Transitivity entailment under cycle-guard | Lift correctness for `part_of` + inverse `has_part` per BFO ARC; cycle-guard handles cycle-prone class |
| `bfo_dependence_relations.fixture.js` | step-N-bind | Dependence relations lift with appropriate domain/range constraints | `bearer_of`, `concretizes`, `inheres_in` lift correctness |
| `bfo_realization_chain.fixture.js` | step-N-bind | Realization chains interact correctly with cycle detection | `realizes`, `realized_in` interaction with ADR-013 |
| `bfo_strict_mode_rejection.fixture.js` | step-N-bind (Step where strict mode ships) | Non-BFO predicate IRIs throw `ARCManifestError` in strict mode | Strict mode discrimination from permissive mode |
| `bfo_strict_mode_acceptance.fixture.js` | step-N-bind | BFO-only ontologies succeed under strict mode | Positive control for strict mode |
| `arc_module_dependency_validation.fixture.js` | step-N-bind (Step where ARC module loader ships) | `ARCManifestError` thrown when declared module's dependencies missing; error names missing dependency | Spec §3.6.4 dependency validation |
| `regularity_check_clears_warning.fixture.js` | step-N-bind (Step where `regularityCheck(A, importClosure)` ships) | Chains regularity-confirmed under BFO import closure emit WITHOUT the `regularity_scope_warning` | Phase 2 Step 6 forward-track closure |
| `regularity_check_keeps_warning.fixture.js` | step-N-bind | Chains the check cannot certify keep the warning | Conservative emission discipline preserved |
| `prov_o_entailment.fixture.js` | step-N-bind (Phase 1 deferred fixture activates) | `prov_entity(project_alpha)` and `prov_entity(project_beta)` entailed via conditional implications once BFO ARC + PROV-O alignment loaded | Phase 1 deferred PROV-O entailment activation |

### 3.4 Layer A vs Layer B framing — Phase 4 ships Layer A continuation; Layer B introduction defers to Phase 5 per Q-4-C source-state amendment cycle 2026-05-10

**Framing revised at Q-4-C source-state amendment cycle 2026-05-10.** Per `arc/upstream-canonical/README.md` two-layer framing:

- **Layer A** (Phase 1+2+3+4 cumulative) — what `SubClassOf`, `Transitive`, `InverseOf` *mean* in FOL (vendored at `arc/upstream-canonical/owl-axiomatization.clif`); **Phase 4 continues the Layer A discipline unchanged** (no new Layer A vendoring at Phase 4; Phase 1's owl-axiomatization.clif covers Phase 4's OWL-construct semantics in toto)
- **Layer B** (introduction **forward-tracked to Phase 5** per Q-4-C source-state amendment cycle 2026-05-10) — what BFO's `Continuant`, `Occurrent`, ternary parthood *mean* in FOL. Phase 4 entry packet (AMENDED final ratification) initially ratified Layer B vendoring at Phase 4 Pass 2a (BFO-ontology repo's BFO 2020 CLIF per Q-4-C); Aaron-Developer Pass 2a repo-traversal evidence subsequently confirmed the canonical source did not exist at the granularity Q-4-C ratification assumed; **§8.2 contingency operationalized** at Q-4-C source-state amendment cycle 2026-05-10 per architect Ruling 1 → Layer B vendoring forward-tracked to Phase 5 entry-cycle (when source-state may have improved OR architect may surface an evidence-grounded alternative).

**What "Layer A continuation" means at Phase 4:** the cumulative external-parity discipline composes correctly (Phase 1 Layer A lift correctness intact; Phase 2 Layer A round-trip parity intact; Phase 3 Case B Layer A consistency-check parity pulled per Q-Frank-Step9-A; Phase 4 Layer A discipline preserved through inherited owl-axiomatization.clif). Phase 4 substantive scope is preserved in full — BFO ARC content + ARC inference + Case C + BFO Disjointness Map + Connected With + arity_flattening + regularityCheck all ship at Phase 4 per the architect's ratification; only Layer B parity *demonstration* defers.

**What forward-tracks to Phase 5:** Layer B canonical source vendoring (`arc/upstream-canonical/bfo-2020.clif` + sidecar with populated license-verification block per ADR-010); `p4_bfo_clif_layer_b.fixture.js` re-authoring (the deleted Phase 4 fixture per Ruling 2; git history preserves work-in-progress as Phase 5 starting point). See §6.1 below for the consolidated Phase 5 inheritance manifest.

**Banked principle anchoring the deferral (Ruling 1 anchor 2):** *"fixtures do not claim canonical parity against sources that are upstream-acknowledged-unfinished, upstream-acknowledged-experimental, or vocabulary-mismatched."* The available candidates at Q-4-C source-state amendment cycle (ontohub.org/bfo / Mungall fol-mungall / Ressler BFO-FOL-alpha-2012-05-21) each corrupt the parity claim per one of these three modes; Phase 5 awaits evidence-grounded source improvement before re-authoring the Layer B parity surface.

### 3.5 Phase 4 demo fixtures — Case A + Case C scope per Q-Frank-Step9-A Asks

Phase 4 demo's authoring scope explicitly includes (Case B amended at Q-4-C source-state amendment cycle 2026-05-10):

- **Case A canary:** BFO Disjointness Map firing `consistent: 'false'` on `Continuant ⊓ Occurrent` (uses `nc_bfo_continuant_occurrent` activated at Phase 4)
- **Case B Layer A continuation citations (AMENDED at Q-4-C source-state amendment cycle 2026-05-10):** Layer A parity discipline continued at Phase 4 against the inherited `arc/upstream-canonical/owl-axiomatization.clif` vendored at Phase 1; demo asserts cumulative-external-parity-discipline composes correctly through Phase 4 without introducing Layer B parity citations. **Layer B parity citations forward-tracked to Phase 5 demo authoring** per §3.4 + §6.1 + §8.2 contingency operationalization (initial Q-4-C ratification's Layer B demonstration framing deferred to Phase 5 entry-cycle).
- **Case C — Lossy round-trip — Phase 4 EXIT DELIVERABLE per Q-Frank-Step9-A Ask 4:** uses existing `p2_lossy_naf_residue` + `p2_unknown_relation_fallback` + `strategy_routing_annotated` PLUS new Phase 4 fixtures (BFO ternary parthood surfaces `arity_flattening` LossType — see §3.6 below)
- **Demo opening: Phase 2 reactivation surface per Q-Frank-Step9-A Ask 7 SME election:** brief reactivation-results panel showing the 3 Phase 2 canaries' reactivation outcomes (3× survived per `phase-3-reactivation-results.md`)

### 3.6 Phase 4 LossType trigger-matcher fixtures — step-N-bind

Per Phase 2 + Phase 3 forward-track: 5 of 8 LossType trigger-matchers remain to phase in. Phase 4 ships `arity_flattening`:

| Fixture | Step binding | LossType | Catches |
|---|---|---|---|
| `p4_bfo_ternary_parthood.fixture.js` | step-N-bind (Step where `arity_flattening` ships) | `arity_flattening` | BFO ternary parthood (e.g., `part_of_at_t(x, y, t)`) flattens to binary representation in OWL 2 DL via Annotated Approximation; LossType `arity_flattening` emitted with severity rank 4 per `LOSS_SIGNATURE_SEVERITY_ORDER` |

Remaining LossType trigger-matchers (`closure_truncated` refinements, `una_residue`, `coherence_violation`, `bnode_introduced`, `lexical_distinct_value_equal`) phase in at Phases 5-7 per the LossType-by-phase split.

### 3.7 Per-canary risk estimate (Q-Frank-4 deliverable, SME-authored at this entry packet)

Per Q-Frank-4 ruling 2026-05-07 (per-canary publication commitment) — the per-canary publication discipline carries forward to Phase 4. Each Phase 4 fixture flagged with risk-estimate tag at this packet:

| Fixture | Risk-estimate tag | Reasoning |
|---|---|---|
| `nc_bfo_continuant_occurrent` | **expected-to-survive** | Activates with explicit BFO Disjointness Map firing on individual asserted to both classes; FOLFalse-in-head detection per Phase 3 Step 7 covers the case |
| `nc_sdc_gdc` | **at-risk-bfo-vs-ofi-deontic-classification** | Activation gated on whether SDC/GDC live in BFO core (activates here) or OFI deontic content (forward-tracks to Phase 7); architect ruling at initial-review cycle (Q-4-?) needed |
| `canary_connected_with_overlap` | **expected-to-survive** | Wrong-translation canary; assertForbiddenPatterns catches the defined-as-overlap form |
| `canary_bfo_disjointness_silent_pass` | **expected-to-survive** | Silent-pass canary follows the Phase 3 `nc_silent_pass_canary` pattern (banked discipline) |
| `cycle_equivalent_classes` (re-binding) | **expected-to-survive after Class-3 forcing case binding** | Class-3 cycle-prone predicate; ADR-013 visited-ancestor pattern handles |
| `bfo_parthood_transitivity` | **expected-to-survive** | Cycle-guard exercises the canonical part_of + has_part transitivity pattern |
| `prov_o_entailment` | **at-risk-arc-loading-mechanism** | Activation contingent on BFO ARC + PROV-O alignment loading mechanism; SME pre-emptive review at Step 1 needed |
| ~~`p4_bfo_clif_layer_b`~~ | ~~**at-risk-vendoring-source-mismatch**~~ | **Pulled at Q-4-C source-state amendment cycle 2026-05-10 (Ruling 2).** The at-risk-tag prediction proved correct: the vendoring source did not exist at the granularity Q-4-C initial ratification assumed; per §8.2 contingency operationalization, fixture forward-tracked to Phase 5. The at-risk-tag-conservatism observation banked at Phase 3 retro composes here: the conservative at-risk tag tracked the actual outcome (mismatch surfaced; fixture pulled). |
| `p4_bfo_ternary_parthood` | **expected-to-survive** | Annotated Approximation strategy with `arity_flattening` LossType; Phase 2 strategy router infrastructure handles |

### 3.8 Total Phase 4 corpus (amended at Q-4-C source-state amendment cycle 2026-05-10)

- 43 inherited fixtures (Phases 1+2+3, no new authoring; `cycle_equivalent_classes` re-binds)
- **4 corpus-before-code fixtures** (BFO No-Collapse + wrong-translation + silent-pass + cycle re-binding; Layer B parity pulled at Q-4-C source-state amendment cycle per §3.2 + §3.4)
- 9 step-N-bind fixtures (BFO ARC content authoring + strict mode + ARC module loader + regularity check + PROV-O entailment + arity_flattening)

**Total at Phase 4 close: 56 corpus fixtures + 4 demo cases (A: BFO Disjointness firing; B: Layer A continuation citations per Q-4-C amendment; C: Lossy round-trip exit deliverable; opening: Phase 2 reactivation surface).** Corpus expansion from Phase 3's 43 to 56 reflects the substantive Phase 4 scope (ARC content + Case C + 1 reactivation); Layer B parity demonstration forward-tracked to Phase 5 (count differential 57→56 attributable solely to the Layer B parity fixture pull per Q-4-C source-state amendment cycle 2026-05-10).

---

## 4. Inherited Items from Phase 3 Exit + Q-Frank-Step9-A Corrective Overlay + Exit-Packet Ratification + Doc-Pass Cycles

Phase 3 closed through a four-cycle sequence (corrective overlay → exit-packet ratification → doc-pass confirmation → Phase 4 entry-packet authoring as next architect-routing event). Phase 4 entry packet inherits load-bearing items from each:

### I1 — Case C as Phase 4 EXIT DELIVERABLE (per Q-Frank-Step9-A Ask 4)

**Source:** Q-Frank-Step9-A corrective ruling 2026-05-10 Ask 4. Stakeholder-flagged demo gap (Frank's letter §4.4) over three demo cycles; explicit phase-deliverable commitment is the corrective. **Banked principle:** stakeholder-flagged demo gaps that span multiple phase cycles get explicit phase-deliverable commitments at the next phase entry packet, not soft "v0.X may include this" framing.

**Phase 4 disposition:** Case C is committed at §2.11 + §3.5 above as Phase 4 exit deliverable. Phase 4 exit cannot close without Case C shipping in the demo. NOT a forward-track; NOT optional.

### I2 — Purpose-built Layer A consistency-check parity fixture question (per Q-Frank-Step9-A Ask 8)

**Source:** Q-Frank-Step9-A Ask 8 corrective ruling 2026-05-10. Phase 3 exit packet pulled Case B (Layer A consistency-check parity) from `demo_p3.html` because the v0.1 implementation does not yet satisfy spec §8.5.1's required affirmative verdict; the question of whether a purpose-built Layer A consistency-check parity fixture (separate from `p1_bfo_clif_classical` which was authored for lift correctness) would surface different gaps becomes a Phase 4 entry-cycle deliberation.

**Phase 4 disposition:** SME proposes at §5 Q-4-D below — the architect rules on whether Phase 4 corpus authoring includes a purpose-built Layer A or Layer B consistency-check parity fixture as part of Phase 4 corpus authoring. With the Phase 4 demo's Case A canary firing `consistent: 'false'` (consistency-rejection direction works in v0.1) and Case B introducing Layer B parity citations (different parity claim than consistency-check parity), the question is whether Phase 4 needs a purpose-built fixture to exercise consistency-check parity at Layer A or Layer B.

### I3 — `project/v0.2-roadmap.md` as inherited tracking surface (per Q-Frank-Step9-A Ask 6)

**Source:** Q-Frank-Step9-A Ask 6 corrective ruling 2026-05-10. Authored at Phase 3 close; consolidates 7 v0.2 commitments with source/scope/owner/timeline. **Banked principle:** when deferred-closure-path framing accumulates across phases, a consolidated roadmap artifact at the next phase boundary lists every commitment with scope/owner/timeline.

**Phase 4 disposition:** Phase 4 maintains the artifact's currency. As Phase 4 implementation work surfaces new "v0.X closes that" commitments (e.g., Phase 4 may surface additional ELK-EL-profile gaps, additional SROIQ-needed cases), they land as new entries in `v0.2-roadmap.md` rather than as inline-in-demo soft framing. Phase 4 exit packet's §6 To-v0.2 row points to the consolidated artifact (not inline re-listing).

### I4 — Disposition-split discipline NON-inheritance (per Q-Frank-Step9-A Ask 5)

**Source:** Q-Frank-Step9-A Ask 5 corrective ruling 2026-05-10. The disposition-split discipline was withdrawn as banked principle at Phase 3 close. Phase 4 entry packet **does NOT** inherit the disposition-split discipline as methodology candidate. **Banked principle:** disciplines invented in response to specific findings do not get banked as architectural-commitment-tier methodology in the same cycle; banking requires the discipline to have been tested against at least one independent case.

**Phase 4 disposition:** explicit non-inheritance. If a Phase 4 finding requires similar handling (multi-component disposition with bounded vs forward-track scopes), it routes as its own architect cycle without precedent-claim from Q-3-Step9-A. The Q-3-Step9-A resolution stands as case-specific reasoning; the corresponding "discipline" is not banked. Phase 4 honors this non-inheritance by routing analogous findings on their own merits.

### I5 — Four reconciled Phase 3 exit retro candidates forward-track to Phase 4 entry-cycle methodology

**Source:** Phase 3 exit-packet ratification cycle 2026-05-10 (architect's authoritative 4-item list). Per the ratification cycle's three new bankings (§5 enumeration discipline + §6 WITHDRAWN subsection discipline + retro candidate replacement discipline), Phase 4 inherits the 4 retro candidates as Phase 4 entry-cycle methodology questions:

| Retro candidate | Phase 4 methodology question |
|---|---|
| Parallel-registry reconciliation (DECISIONS.md ADR-NN ↔ spec §13 ADR-NN) | Should Phase 4 entry-cycle attempt the reconciliation, or forward-track to Phase 5? SME proposal: forward-track again; reconciliation is its own architect cycle scope |
| Substantive-scope-weighting methodology refinement | Phase 3 exceeded ~3 projection by 2 (5 actual). Phase 4 projection: SME proposal at §7 step ledger below — projects 3 mid-phase architectural-gap micro-cycles given BFO ARC content scope + Case C scope + regularity-check scope + Layer B vendoring scope. Architect rules on the projection at initial-review cycle |
| Retroactive-ritual-pattern-confirmation (with at-risk-tag-conservatism sub-observation) | Phase 4 inherits the retroactive ritual as binding-from-Step-4-of-Phase-3-forward; phase boundaries are natural retroactive-batch-run scope. Phase 4 entry-cycle: does the ritual run pre-emptively at Phase 4 entry against the 5 corpus-before-code fixtures + the v0.2-roadmap.md artifact? SME proposal at §5 Q-4-? |
| Banking-correction discipline retro analysis | Phase 3 cycle issued banking corrections; Phase 4 inherits the meta-discipline. If a Phase 4 architect ruling later proves structurally incorrect on stakeholder critique, the corrective response uses the same Q-Frank-Step9-A clean-revision pattern. No methodology-candidate forward-track to Phase 5 yet (waits for second instance) |

### I6 — §5/§6/retro-replacement disciplines from Phase 3 exit-packet ratification cycle

**Source:** Phase 3 exit-packet ratification cycle 2026-05-10. Three new bankings observing the SME's exit-packet shape as exemplary practice:

1. Phase exit packets containing banking corrections enumerate the §5 inventory as withdrawn + preserved + new + meta-banking categories with explicit counts and per-item attribution.
2. Phase exit packets carrying banking corrections include a WITHDRAWN forward-tracks subsection at §6.
3. When phase exit retro candidates are withdrawn by corrective cycles, the slot is repurposed for retro candidates that the corrective cycle itself produces.

**Phase 4 disposition:** these disciplines apply to Phase 4 exit packet authoring (when Phase 4 closes). They're inherited at the entry-packet authoring time (this packet) as forward-going disciplines; Phase 4 exit packet will apply them if Phase 4 contains banking corrections.

### I7 — Two new verbal bankings from Phase 3 doc-pass cycle (formalize at Phase 4 exit doc-pass)

**Source:** Phase 3 doc-pass confirmation cycle 2026-05-10. Three banked principles (Reconciliation 1 sub-observation folding discipline + Reconciliation 2 architect ruling-clarity discipline + architect-side discipline meta-banking).

**Phase 4 disposition:** these are verbally banked at Phase 3 doc-pass; per architect directive, formalize at **Phase 4 exit doc-pass**, not at Phase 4 entry. The Phase 4 entry packet acknowledges them in §4 (this section) for inheritance audit-trail; the AUTHORING_DISCIPLINE.md formalization waits for Phase 4 exit.

### I8 — Phase 2 reactivation surface as Phase 4 demo opening (per Q-Frank-Step9-A Ask 7 SME election)

**Source:** Q-Frank-Step9-A Ask 7 architect-permitted choice 2026-05-10; SME elected Phase 4 demo inclusion path (vs Phase 3 demo update which would have conflated pull-content with add-content motions in the same corrective commit).

**Phase 4 disposition:** Phase 4 demo opens with a brief reactivation-results panel showing the 3 Phase 2 canaries' reactivation outcomes (3× survived per `phase-3-reactivation-results.md` §2). Cumulative-discipline-credibility surface for stakeholders reading the Phase 4 demo: Phase 2 stub-evaluator parity canaries reactivated against real `evaluate()` at Phase 3; outcomes published per Q-Frank-4 commitment; Phase 4 carries the discipline forward.

### I9 — Phase 4-deferred fixtures activate per ROADMAP gates

**Source:** Phase 3 entry packet §3.3 + ROADMAP §3.4 BFO-gated fixtures. `nc_bfo_continuant_occurrent` activates here per BFO ARC loading; `nc_sdc_gdc` activates here OR forward-tracks to Phase 7 OFI deontic depending on architect ruling at Q-4-?.

**Phase 4 disposition:** §3.2 above lands `nc_bfo_continuant_occurrent` as corpus-before-code; `nc_sdc_gdc` ratification depends on architect ruling at initial-review cycle.

### I10 — LossType trigger-matcher subsystem cleanup (`arity_flattening` ships at Phase 4)

**Source:** Phase 2 + Phase 3 LossType-by-phase split. 5 of 8 trigger-matchers remain after Phase 3 (Phase 2 shipped `naf_residue` + `unknown_relation`; Phase 3 partially shipped `closure_truncated`).

**Phase 4 disposition:** `arity_flattening` ships at Phase 4 as forced by BFO ternary parthood (per §3.6 above). Remaining 4 LossTypes (`closure_truncated` refinements, `una_residue`, `coherence_violation`, `bnode_introduced`, `lexical_distinct_value_equal`) phase in at Phases 5-7.

### I11 — Realization regularity-check upgrade (`regularityCheck(A, importClosure)`)

**Source:** Phase 2 Step 6 forward-track + architect Q-Step6-1 ruling. Phase 2's projector chain projection emits `regularity_scope_warning` unconditionally; Phase 4 closes this for chains regularity-confirmed under loaded ARC modules' import closure.

**Phase 4 disposition:** §2.6 above commits the closure. Per ADR-011's behavioral-contract evolution discipline, the closure is a non-breaking strengthening (chains regularity-confirmed emit WITHOUT the warning; chains the check cannot certify keep the warning).

---

## 5. Architectural Questions — for Architect Initial-Review Cycle

Per the Phase 1 + Phase 2 + Phase 3 entry-packet pattern: SME enumerates architectural questions surfaced by entry packet authoring; architect issues initial-review rulings; SME folds rulings into AMENDED packet; architect issues final ratification.

### Q-4-A — Phase 4 step granularity

**Question:** Phase 4's substantive scope (BFO 2020 ARC content + Layer B vendoring + ARC module loader + strict mode + BFO Disjointness Map + Connected With + parthood/dependence/realization + regularity check + lifter ObjectPropertyChain support + arity_flattening LossType + Case A/B/C demo) is large. SME proposes the step ledger at §7 below (provisional 8-step framing). Architect ratifies the step granularity?

**SME proposal:** 8-step framing per §7 below.

**Architect ruling needed:** approve or amend the step granularity; ratify the framing requirement (mirrors Q-3-A pattern).

### Q-4-B — Per-fixture corpus activation timing tags + corpus shape ratification

**Question:** §3 above tags 5 fixtures as corpus-before-code (BFO Disjointness adversarial + wrong-translation canary + silent-pass canary + cycle re-binding + Layer B parity) and 9 as step-N-bind. Per Q-3-E precedent, tagging convention-only with no manifest schema tightening. Architect ratifies the §3 corpus shape + activation-timing assignments + per-canary risk estimates per §3.7?

**SME proposal:** Per §3 inventory. Risk estimates per §3.7 tagged appropriately given the BFO ARC content readiness state.

**Architect ruling needed:** approve or amend the §3 corpus shape; sign off on activation-timing assignments + risk estimates. This freezes the Phase 4 corpus contract (the test contract Phase 4 implementation must satisfy).

### Q-4-C — Layer B CLIF vendoring source candidate + verification ritual scope

**Question:** ROADMAP Phase 4 Entry Checklist requires `arc/upstream-canonical/bfo-2020.clif` + `bfo-2020.clif.SOURCE` with a populated, verified `license-verification` block in the first commit landing the vendored source. SME proposes the candidate source: the W3C BFO-ontology repository's BFO 2020 CLIF axiomatization (canonical source maintained by the BFO-ontology project). License verification per ADR-010 discipline.

**SME proposal:**
- Source candidate: BFO-ontology project's BFO 2020 CLIF (TBD: exact path within the BFO-ontology GitHub repo; SME spot-checks at Pass 2a vendoring time per the binding-immediately verification ritual)
- Verification ritual: license URL, license commit SHA, LICENSE file SHA-256, license-text-confirmed, master-head-at-verification per ADR-010 + Q-β refinement 2026-05-06
- Vendoring lands in Pass 2a alongside this entry packet's final ratification commit (audit-trail-unity-per-surface)
- Sidecar shape mirrors `owl-axiomatization.clif.SOURCE` per the Phase 1 vendoring precedent

**Architect ruling needed:** ratify the source candidate (or amend); confirm the verification ritual scope; confirm Pass 2a bundling.

### Q-4-D — Purpose-built Layer A or Layer B consistency-check parity fixture authoring scope

**Question:** Per Q-Frank-Step9-A Ask 8 forward-track to Phase 4 entry-cycle: with Case B (Layer A consistency-check parity) pulled from `demo_p3.html` because the v0.1 implementation does not yet satisfy spec §8.5.1's required affirmative verdict, does Phase 4 corpus authoring include a purpose-built Layer A or Layer B consistency-check parity fixture (separate from existing fixtures authored for lift correctness or round-trip parity)?

**SME proposal:** Forward-track to v0.2 entry packet. Reasoning: a purpose-built consistency-check parity fixture would land as `'undetermined'` under the v0.1 Horn-fragment classifier (the same gap that pulled Case B from Phase 3 demo); authoring the fixture now would surface the same v0.2 ELK closure-path commitment that v0.2-roadmap.md already tracks at v0.2-01. The fixture would not exercise new architectural surface beyond what v0.2-roadmap.md v0.2-01 names. Phase 4 entry packet's deliverable list does NOT include a purpose-built consistency-check parity fixture; the question is forward-tracked to v0.2 entry packet authoring (when v0.1 closes and v0.2 begins).

**Alternative:** Architect could rule that Phase 4 authors a Layer B consistency-check parity fixture (different from Layer A; exercises BFO content under `checkConsistency`) as part of Phase 4 corpus authoring — Layer B has more substantive content than Layer A and may surface fixture-design questions that Layer A reuse cannot.

**Architect ruling needed:** ratify the v0.2 forward-track (SME proposal) OR amend to commit Phase 4 to authoring a Layer B consistency-check parity fixture.

### Q-4-E — `nc_sdc_gdc` activation gate (BFO core vs OFI deontic)

**Question:** ROADMAP §3.4 names `nc_sdc_gdc` as gated on whether SDC/GDC (Specifically Dependent Continuant / Generically Dependent Continuant) live in BFO core or OFI deontic content. The current `arc/core/bfo-2020.json` does not appear to declare SDC/GDC disjointness explicitly (the 40 entries focus on parthood, dependence, realization). Architect ruling: does SDC/GDC disjointness ship at Phase 4 (as part of BFO core ARC content) or forward-track to Phase 7 OFI deontic?

**SME proposal:** Forward-track to Phase 7 OFI deontic. Reasoning: SDC/GDC disjointness via property-chain decomposition is more naturally aligned with deontic ARC content than with BFO core mereology; the `nc_sdc_gdc` fixture stays Draft at Phase 4 and activates at Phase 7 if OFI deontic ships, OR forward-tracks to v0.2 if OFI deontic stays deferred per ADR-008.

**Alternative:** Architect could rule that Phase 4 includes SDC/GDC in BFO core ARC authoring (forces an addition to `arc/core/bfo-2020.json`), activating `nc_sdc_gdc` at Phase 4.

**Architect ruling needed:** ratify the Phase 7 forward-track (SME proposal) OR amend to commit Phase 4 to SDC/GDC inclusion.

### Q-4-F — Strict mode behavior on legacy non-BFO axioms in mixed inputs

**Question:** Spec §3.6.3 names strict mode behavior. SME interprets: when `LifterConfiguration.strictMode === 'strict'` AND `arcModules: ['core/bfo-2020']` is loaded AND the input ontology contains both BFO predicates and non-BFO predicates (e.g., a domain-specific predicate `myDomain:hasOwner`), strict mode rejects the lift with `ARCManifestError` naming the offending predicate. Architect confirms or amends?

**SME proposal:** Strict mode rejects the entire lift if any predicate is outside the loaded ARC modules' vocabulary. This is the spec-literal interpretation per §3.6.3.

**Alternative interpretation 1:** Strict mode rejects at the first non-ARC predicate encountered, allowing the consumer to lift incrementally (problematic; partial lift state is corrupt).

**Alternative interpretation 2:** Strict mode emits a `LossSignature` for each non-ARC predicate (less aggressive; competes with permissive mode's behavior; arguably collapses the strict/permissive distinction).

**Architect ruling needed:** ratify SME proposal (lift-rejection at any non-ARC predicate) OR amend to a different interpretation. Behavior is binding for the `bfo_strict_mode_rejection` fixture's expected outcome.

### Q-4-G — Verification ritual pre-emptive run scope at Phase 4 entry

**Question:** Per Phase 3 retro candidate #3 (retroactive-ritual-pattern-confirmation) — should the verification ritual run pre-emptively at Phase 4 entry against the 5 corpus-before-code fixtures + the v0.2-roadmap.md artifact + the BFO Layer B vendoring sidecar (when authored at Pass 2a)?

**SME proposal:** Yes. The verification ritual runs pre-Pass-2a-commit on (a) the 5 corpus-before-code fixtures' canonical-source citations, (b) the v0.2-roadmap.md artifact's cross-references, (c) the BFO Layer B vendoring sidecar's license-verification block. Findings (if any) land in the Pass 2a commit alongside the corrective amendments per audit-trail-unity-per-surface. **First instance of Phase-4-boundary retroactive-batch-run** per the verification ritual's banked phase-boundary discipline.

**Architect ruling needed:** ratify the pre-emptive-run scope OR amend (e.g., scope only to corpus-before-code fixtures, not to v0.2-roadmap.md or vendoring sidecar).

### Q-4-H — Counter accounting for BFO ARC content authoring's parallel workstream

**Question:** BFO ARC content authoring is the parallel workstream Aaron led pre-Phase-4-entry. The 40-entry `arc/core/bfo-2020.json` lands as input to Phase 4 entry-cycle (not as Phase 4 implementation work). Counter accounting: does this parallel workstream count toward Phase 4 mid-phase counter, entry-cycle counter, or its own bucket?

**SME proposal:** Own bucket — "ARC content authoring parallel workstream counter" tracked per phase that lands new ARC content (Phase 4 BFO; Phase 5 IAO; Phase 6 CCO ×6). Does NOT increment Phase 4 mid-phase or entry-cycle counters. Cycle accounting transparency: the parallel workstream's substantive scope is non-trivial (40 entries × verification ritual against canonical sources) but is a different category from the phase's implementation cycles.

**Architect ruling needed:** ratify the own-bucket framing (SME proposal) OR amend (e.g., absorb into entry-cycle counter; bank a different cadence-discipline framing).

---

## 6. Validation Rings Status

| Ring | Phase 4 entry status | Notes |
|---|---|---|
| Ring 1 (Conversion Correctness) | Inherited green from Phase 1 close | Phase 1 lifter unchanged through Phases 2 + 3; 15 Phase 1 corpus fixtures continue passing |
| Ring 2 (Round-Trip Parity + Audit Artifacts) | Inherited green from Phase 2 close | Phase 2 projector unchanged through Phase 3; 12 Phase 2 corpus fixtures + parity-canary harness continue passing |
| Ring 3 (Validator + Consistency Check) | Inherited green from Phase 3 close (with Layer A consistency-affirmation gap as documented v0.1 implementation gap; v0.2 ELK closure path per `v0.2-roadmap.md` v0.2-01) | 16 Phase 3 corpus fixtures × Ring 3 verification; FOLFalse-in-head inconsistency proof at Step 7 + `nc_self_complement` Horn-decidable inconsistency closure at Step 9.4-amendment-4 |
| Ring 3 ARC-content extension (NEW at Phase 4) | ⏳ Pending Phase 4 implementation | BFO Disjointness Map firings + Connected With closure + parthood transitivity under cycle-guard + strict mode discrimination + regularity check + Layer B parity citations + Case C lossy round-trip demonstration |

Phase 4 is the first phase where Ring 3 operates against ARC content (Phase 3 operated only on built-in OWL). Phase 4 exit closes Ring 3 ARC-content extension on BFO 2020 core; Phases 5-7 extend to IAO + CCO + OFI deontic.

### 6.1 Phase 5 forward-track inheritance manifest (NEW at Q-4-C source-state amendment cycle 2026-05-10)

Per Q-4-C source-state amendment cycle 2026-05-10 Ruling 3 amendment table — new entry: "Layer B vendoring + `p4_bfo_clif_layer_b` re-authoring forward-tracked." Consolidated forward-track items the Phase 5 entry packet inherits:

| Forward-track item | Source | Phase 5 inheritance disposition |
|---|---|---|
| `arc/upstream-canonical/bfo-2020.clif` canonical source vendoring | Q-4-C source-state amendment cycle 2026-05-10 Ruling 1 (§8.2 contingency operationalization → Phase 5 forward-track) | Phase 5 entry-cycle re-authors Q-4-C analog: source-state survey + architect ratification on the BFO-2020 Layer B canonical source candidate (BFO-ontology repo if source-state has improved; ontohub.org/bfo if upstream finalized; new candidate if surfaced by BFO-ecosystem evolution). License verification per ADR-010 + license-verification-inheritance banking (Phase 1 owl-axiomatization.clif LICENSE inheritance applies if same-source-repo at Phase 5 vendoring time). |
| `arc/upstream-canonical/bfo-2020.clif.SOURCE` sidecar authoring | Q-4-C source-state amendment cycle 2026-05-10 Ruling 1 + binding-immediately verification ritual | Phase 5 SME path-fence-authors sidecar at Phase 5 Pass 2a; Aaron-Developer fetches canonical values + flips `[VERIFY]` markers at vendoring time. Sidecar shell `bfo-2020.clif.SOURCE` preserved at Phase 4 close as Phase-5-forward-tracked reference (do NOT delete; preserves SME work-in-progress per Ruling 2 disposition discipline analog — distinct from the fixture pull which deleted entirely). |
| `tests/corpus/p4_bfo_clif_layer_b.fixture.js` re-authoring | Q-4-C source-state amendment cycle 2026-05-10 Ruling 2 (fixture pulled entirely; git history preserves work-in-progress) | Phase 5 entry-cycle re-authors fixture against the Phase-5-ratified Layer B canonical source. Renaming to `p5_bfo_clif_layer_b.fixture.js` plausible per phase-prefix convention; SME proposes at Phase 5 entry-cycle authoring. |
| Phase 5 demo Case B (Layer B parity citations) authoring | §3.5 Case B amendment 2026-05-10 (Phase 4 demo shifts to Layer A continuation) | Phase 5 demo `demo_p5.html` authoring opens Layer B parity citations as Phase 5 Case B; mirrors Phase 2 Case B Layer A pattern, now extended to Layer B per the original Phase 4 framing but at Phase 5 entry-cycle binding. |
| Source-authority-chain banking extension to Phase 5 | Q-4-C amendment Ruling 1 anchor 3 (license-verification-at-vendoring-time inheritance per ADR-010 is phase-agnostic) | Phase 5 license-verification ritual at Pass 2a vendoring time per ADR-010; cited-blocks discipline applies per the Phase 1 owl-axiomatization.clif.SOURCE precedent. |

**Discipline preservation note:** the forward-track items above carry the Phase 4 substantive scope preservation (Ruling 1 anchor 5) — only Layer B parity *demonstration* defers. Phase 4 implementation continues to lift BFO ARC content + activate BFO Disjointness Map + emit Connected With as primitive + cycle-guard parthood transitivity per spec §3.4.1 against the loaded `arc/core/bfo-2020.json` ARC module; the Layer B *canonical-source-parity citation* (which would have been a fifth corpus-before-code surface) defers to Phase 5 without affecting Phase 4's other deliverables.

---

## 7. Phase 4 Step Ledger (per Q-4-A architect ruling 2026-05-10 — explicit-step-assignment framing requirement; amended at Q-4-C source-state amendment cycle 2026-05-10)

8-step ledger ratified per Q-4-A. Per the architect's framing requirement: explicit step assignments for the load-bearing Phase 4 deliverables (Case C demo work; BFO Disjointness Map firings; Connected With bridge axiom; regularityCheck activation). **Step ledger amended at Q-4-C source-state amendment cycle 2026-05-10 per Ruling 3:** Pass 2a Layer B vendoring task pulled (forward-tracked to Phase 5 per §6.1); Step 8 demo Case B shifts to Layer A continuation citations per §3.5 amendment; remaining steps preserved unchanged (Phase 4 substantive scope preservation per Ruling 1 anchor 5).

| Step | Substantive work | Activation timing | Load-bearing deliverable attribution | Depends on |
|---|---|---|---|---|
| **Pass 2a** (amended at Q-4-C source-state amendment cycle 2026-05-10) | Phase 4 entry packet AMENDED final ratification (Q-4-C amendments integrated) + **4 corpus-before-code fixtures** (Layer B parity fixture pulled per Ruling 2) + verification ritual report (Q-4-C amendment note + Cat 8 disposition). **Layer B vendoring artifacts forward-tracked to Phase 5 Pass 2a** per Q-4-C source-state amendment cycle Ruling 1 + §6.1 inheritance manifest. | corpus-before-code | Phase 4 entry packet AMENDED final ratification + 4 corpus-before-code fixtures + verification ritual report | Architect brief confirmation on Q-4-C amendments + remote CI green |
| 1 | ARC module loader skeleton + `arcModules` parameter on `LifterConfiguration` per spec §3.6.2; ARC module schema validation | step-N-bind | ARC module loader infrastructure | Pass 2a |
| 2 | Strict mode + ARC module dependency validation per spec §3.6.3 + §3.6.4; **lift-rejection behavior on legacy non-BFO axioms** per Q-4-F | step-N-bind | **Strict mode lift-rejection** per Q-4-F binding | Step 1 |
| 3 | BFO 2020 ARC content lift correctness — parthood transitivity, dependence relations, realization chains (uses inherited cycle-guard ADR-013 from Phase 3) | step-N-bind | BFO ARC content lift correctness | Step 1 |
| 4 | **BFO Disjointness Map firings** per spec §3.4.1 — `Continuant ⊓ Occurrent → ⊥` + activation of `nc_bfo_continuant_occurrent` fixture (corpus-before-code activation per §3.2) | corpus-before-code activation | **BFO Disjointness Map firings** per Q-4-A explicit attribution requirement | Step 3 |
| 5 | **Connected With as primitive + bridge axiom** per spec §3.4.1 — closure interaction with cycle detection per ADR-013; activation of `canary_connected_with_overlap` corpus-before-code fixture | step-N-bind + corpus-before-code | **Connected With bridge axiom inference** per Q-4-A explicit attribution requirement | Steps 3 + 4 |
| 6 | **`regularityCheck(A, importClosure)` machinery** per spec §6.2.1 — Phase 2 Step 6 forward-track closure; `regularity_scope_warning` cleared for chains regularity-confirmed under loaded BFO ARC import closure | step-N-bind | **regularityCheck activation** per Q-4-A explicit attribution requirement (Phase 3 forward-tracked Phase 4 entry item) | Step 1 + ADR-013 from Phase 3 |
| 7 | Lifter `ObjectPropertyChain` support per Q-Step6-3 forward-track — cycle-guarded chain rule emission per ADR-007 §11; activation of property-chain corpus from BFO ARC | step-N-bind | Lifter chain support | Steps 1 + 3 + 6 |
| 8 (amended at Q-4-C source-state amendment cycle 2026-05-10) | `arity_flattening` LossType trigger-matcher (BFO ternary parthood) + **Case C demo authoring** per Q-Frank-Step9-A Ask 4 (Phase 4 EXIT DELIVERABLE) + **Case B Layer A continuation citations** (amended from "Layer B parity demo" per §3.5 amendment; Layer B parity demo forward-tracked to Phase 5 per §6.1) + **Phase 2 reactivation surface as demo opening** per Ask 7 | step-N-bind + demo authoring | **Case C demo + Case B Layer A continuation citations + reactivation opening** per Q-4-A explicit attribution requirement | Steps 3 + 4 + 5 + 7 (Pass 2a Layer B vendoring dependency removed per amendment) |
| 9 | Phase 4 exit cadence (mirrors Phase 2 + Phase 3 Step 9 pattern) | step-N-bind + demo authoring | Phase 4 close cadence | All prior steps |

**Provisional cycle-cadence projection per Q-4-H + substantive-scope-weighting:** 3 mid-phase architectural-gap micro-cycles projected (Phase 4 ships ARC module loader + strict mode + BFO Disjointness Map + Connected With + regularity check + lifter ObjectPropertyChain + Case C demo + arity_flattening — substantively comparable to Phase 3's 5 actual). Layer B vendoring scope no longer counts toward Phase 4 mid-phase projection per Q-4-C source-state amendment cycle (Phase 5 entry-cycle inherits per §6.1). The projection feeds Phase 4 exit retro analysis per Phase 3 retro candidate #2 methodology refinement.

**Step 9 sub-step framing per Phase 2 + Phase 3 Step 9 precedent (α-cadence; amended at Q-4-C source-state amendment cycle 2026-05-10):** 9.1 Per-canary publication artifact extension (Phase 4 No-Collapse adversarial + wrong-translation canaries; **Layer B parity per-canary publication forward-tracked to Phase 5** per §6.1); 9.2 Determinism harness verification (**56 fixtures** per §3.8 amended total); 9.3 verifiedStatus review; 9.4 demo_p4.html + p4-walkthrough.md authoring (Case A BFO Disjointness firing + **Case B Layer A continuation citations** per §3.5 amendment + Case C lossy round-trip per Q-Frank-Step9-A Ask 4 + opening Phase 2 reactivation surface per Ask 7); 9.5 AUTHORING_DISCIPLINE Phase 4 banked principles fold-in (Phase 3 doc-pass's 3 verbal bankings + this cycle's 6 initial-review bankings + 3 final-ratification bankings + **7 Q-4-C source-state amendment cycle bankings** + new Phase 4 mid-phase bankings if any); 9.6 phase-4-exit.md + ROADMAP Phase 4 close grounding + `project/v0.2-roadmap.md` currency update + Phase 5 entry packet inheritance manifest pointer (§6.1 of this packet).

---

## 8. Risk Notes Carried into Phase 4

### 8.1 BFO ARC content readiness state

The 40-entry `arc/core/bfo-2020.json` ships as input from the Aaron-led parallel workstream. SME spot-check confirmed 0 [VERIFY] markers + 4 First/Last Instant references. Architect spot-check at initial-review cycle is welcome before Pass 2a commit lands (per the Phase 4 entry-checklist gate item). If the architect spot-check surfaces gaps, Pass 2a delays until resolved.

### 8.2 BFO Layer B vendoring source uncertainty (operationalized at Q-4-C source-state amendment cycle 2026-05-10 — FIRST production operationalization of a ratified contingency framing)

§5 Q-4-C names the source candidate as TBD pending architect ratification. SME has not yet identified the exact path within the BFO-ontology repository; SME spot-checks at Pass 2a vendoring time per the binding-immediately verification ritual. If the canonical source is harder to locate than expected, Pass 2a may slip; architect can amend to a different source or scope-reduce the Layer B parity discipline at Phase 4 (forward-track to Phase 5 if needed).

**Contingency operationalization 2026-05-10 (Q-4-C source-state amendment cycle):** the §8.2 contingency framing — authored at AMENDED packet (initial-review cycle integration 2026-05-10), ratified at final ratification 2026-05-10, anticipating "if the canonical source is harder to locate than expected" — **triggered on Aaron-Developer Pass 2a repo-traversal evidence 2026-05-10**: BFO-ontology/BFO repo @ master HEAD `857be9f15100531c7202ef0eb73142f95b70f3a7` does NOT contain `bfo-2020.clif` at any depth; available candidates (ontohub.org/bfo / Mungall fol-mungall / Ressler 2012-alpha) each corrupt the parity claim per one of three banked corruption modes (upstream-acknowledged-unfinished, upstream-acknowledged-experimental, vocabulary-mismatched). Per architect Q-4-C source-state amendment ruling 2026-05-10 (`phase-4-entry-q-4-c-amendment.md`): Layer B vendoring forward-tracked to Phase 5 per the §8.2 contingency's ratified disposition. **This is the FIRST production operationalization of a ratified contingency framing in the project's cycle history** (banked principle from Q-4-C amendment Ruling 1 anchor 1: *"Pre-ratified contingency framings that trigger on evidence operationalize as the ratified disposition, not as corrective sub-cycles."*); operationalization route surfaces in cycle accounting as the **Phase 4 contingency-operationalization sub-cycle counter** (distinct from corrective sub-cycle bucket) per §12 cycle accounting amendment + Q-4-C amendment Ruling 4 bucket framing. The contingency-operationalization route reduces corrective overhead vs fresh-architecture routing (per banked principle 5 of the Q-4-C amendment bankings).

### 8.3 Case C scope risk

Per Q-Frank-Step9-A Ask 4: Case C is committed as Phase 4 EXIT DELIVERABLE, not forward-track. If Phase 4 implementation surfaces blockers that would slip Case C to Phase 5, the architect must rule on a cycle (not silent rollover). The discipline: stakeholder-flagged demo gaps that span multiple phase cycles get explicit phase-deliverable commitments — the commitment was made at Phase 3 close.

### 8.4 `regularityCheck(A, importClosure)` substantive complexity

Per Q-Step6-1 ruling: the regularity check is a non-breaking strengthening of Phase 2's chain projection. Substantive complexity: the check inspects the loaded ARC modules' import closure to determine whether each chain is regularity-confirmed. SME has not yet implemented the import-closure inspection at the lifter or projector level (Phase 4 surfaces this work). Architect cycle-cadence projection at Q-4-H assumes Step 6 is one of the 3 projected mid-phase architectural-gap micro-cycles.

### 8.5 Layer A consistency-affirmation gap forward-tracking discipline

Per Q-Frank-Step9-A Ask 1: Layer A consistency-affirmation gap is a v0.1 implementation gap with v0.2 ELK closure path per `v0.2-roadmap.md` v0.2-01. **NOT a Phase 4 deliverable.** Phase 4's demo Case A exercises the consistency-rejection direction (BFO Disjointness Map firing `'false'`); the consistency-affirmation direction waits on v0.2. If a Phase 4 stakeholder critique flags this asymmetry, the corrective response uses the Q-Frank-Step9-A clean-revision pattern (architect-side banking-correction discipline retro candidate from Phase 3) — not silent re-introduction of the disposition-split discipline (which is withdrawn per Ask 5; explicit non-inheritance per I4).

### 8.6 Stakeholder-precision discipline carries forward

Per Q-Frank-1..6 Phase 2 cycle + Q-Frank-Step9-A Phase 3 cycle: stakeholder critique cycles produce architectural corrections. Phase 4 entry packet anticipates: a third Frank stakeholder critique on Phase 4's deployed demo is plausible; the project's banking-correction discipline (architect issues clean revision when concerns hold on the merits) handles it without procedural defense. Phase 4 entry-cycle methodology question (per retro candidate #4): does the banking-correction discipline pattern generalize across phases, or is each cycle bespoke?

---

## 9. What Architect Final Ratification Opens (Pass 2a vs Pass 2b ratified per architect 2026-05-10)

### Pass 2a — Phase 4 entry packet final ratification commit (ratified contents per architect; **AMENDED at Q-4-C source-state amendment cycle 2026-05-10**)

Per architect Pass 2a/2b sequencing ruling 2026-05-10 + Q-4-C source-state amendment cycle ruling 2026-05-10:

- This entry packet AMENDED text (Q-4-A through Q-4-H rulings folded per §11; **Q-4-C source-state amendment cycle rulings folded per §11 Q-4-C transcription amendment + §12 cycle accounting amendment**; §3 corpus shape ratified per §3.2 + §3.3 — corpus-before-code count revised 5→4 per Q-4-C Ruling 2; §7 step ledger amended with explicit-step-assignment framing per Q-4-A + Pass 2a Layer B vendoring task pulled per Q-4-C Ruling 1; §11 Q-rulings + §12 bankings populated verbatim per the §11 verbatim-transcription discipline)
- **4 corpus-before-code fixtures** (amended from 5 at Q-4-C source-state amendment cycle 2026-05-10 — `p4_bfo_clif_layer_b.fixture.js` pulled per Ruling 2) registered in `tests/corpus/manifest.json` with `phaseActivated: 4` + `corpusActivationTiming: 'corpus-before-code'`:
  - `nc_bfo_continuant_occurrent.fixture.js` (activates per Phase 3 BFO-gated forward-track)
  - `canary_connected_with_overlap.fixture.js` (NEW Phase 4 authoring)
  - `canary_bfo_disjointness_silent_pass.fixture.js` (NEW Phase 4 authoring)
  - `cycle_equivalent_classes.fixture.js` (re-binding per Q-3-Step5-B)
- **Layer B vendoring artifacts FORWARD-TRACKED TO PHASE 5** per Q-4-C source-state amendment cycle 2026-05-10 Ruling 1 + §6.1 inheritance manifest:
  - `arc/upstream-canonical/bfo-2020.clif` — **NOT vendored at Phase 4**; Phase 5 entry-cycle re-authors Q-4-C analog source-state survey + architect ratification
  - `arc/upstream-canonical/bfo-2020.clif.SOURCE` — sidecar shell preserved at Phase 4 close as Phase-5-forward-tracked SME work-in-progress reference (do NOT delete; per Ruling 2 disposition discipline distinction — sidecar shell preserves vs fixture deletion)
- Manifest schema updates per Q-4-B convention-only path (no schema tightening; `corpusActivationTiming` annotation lives in fixture-file metadata + manifest entries, not in the manifest schema)
- Phase 4 entry packet's verification ritual run report (AMENDED for Q-4-C source-state amendment cycle 2026-05-10: Cat 8 Layer B canonical-value verification finding disposition NO LONGER RELEVANT for Phase 4 per Layer B vendoring forward-track; finding cross-references to Phase 5 entry-cycle inheritance manifest) — first phase-boundary retroactive batch findings per Q-4-G
- `project/v0.2-roadmap.md` updated per Q-4-D (new entry v0.2-08 for purpose-built consistency-check parity fixture); **unchanged at Q-4-C source-state amendment cycle 2026-05-10** (Layer B vendoring forward-tracks to Phase 5, NOT v0.2; v0.2-08 entry unaffected)
- **NEW at Q-4-C source-state amendment cycle 2026-05-10:** `project/reviews/phase-4-entry-q-4-c-amendment.md` — Q-4-C source-state amendment cycle routing artifact (mirrors `phase-3-step9-architectural-gap.md` cycle-artifact pattern)

Pass 2a unblocks Phase 4 Step 1.

### Pass 2b — Cycle-2 architect-mediated work in parallel

Per architect Pass 2a/2b sequencing ruling 2026-05-10: **no Pass 2b cycle is mandatory** — no ADR promotions or prior-phase amendments surfaced at this initial-review cycle. Pass 2b candidates conditional on verification ritual findings:

- If the verification ritual phase-boundary retroactive batch (Q-4-G) finds canonical-source-reference issues requiring architect ratification, those route as Pass 2b cycles
- If architect spot-check on `arc/core/bfo-2020.json` content (40 entries × literature peer-review per ROADMAP entry-checklist) prefers per-entry verification over spot-check, that routes as Pass 2b

Pass 2b proceeds in parallel via separate routing cycles per the Phase 3 Q-3-G two-pass sequencing precedent; does not block Step 1.

### Phase 4 forward deliverables (after Phase 4 implementation closes)

- `tests/corpus/<phase-4-step-N-bind-fixtures>` — 9 step-N-bind fixtures land alongside their respective implementation Steps
- `demo/demo_p4.html` + `demo/p4-walkthrough.md` — Phase 4 demo authoring at Step 9.4 per the per-phase disposable demo discipline
- `project/reviews/phase-4-exit.md` — Phase 4 exit packet (ratifies through the same architect-ratification cycle pattern as Phases 1-3)
- `project/reviews/phase-4-exit-architectural-gap.md` (if any mid-phase architectural-gap micro-cycles surface)
- `project/v0.2-roadmap.md` — Phase 4 maintains currency; new "v0.X closes that" commitments surfaced during Phase 4 implementation land as new entries

---

## 10. SME Certification

I, in the SME / Logic Tester role, certify that:

1. **The seven Phase 4 entry-criteria from plan §3.5 + ROADMAP Phase 4 Entry Checklist are confirmed met** (item 5 pending Pass 2a vendoring; items 7 + 8 routed to this packet's §4 + §9):
   - Phase 3 exited (Rings 1+2+3 passing on built-in OWL) ✅
   - All BFO 2020 ARC entries Verified; no [VERIFY] or Draft remain ✅
   - First/Last Instant rows resolved ✅
   - BFO 2020 ARC content authored, reviewed, ingested ✅
   - BFO 2020 CLIF Layer B vendoring sidecar (Pass 2a) ⏳
   - Phase 3 exit deliverables committed + remote CI green ✅
   - Phase 3 inherited items routed to this packet ✅
   - Cycle-2 architect-mediated work TBD at initial-review cycle ⏭

2. **The Phase 4 build target is enumerated at §2** with cross-references to spec/API frozen surfaces + Phase 3 forward-tracks per Q-Frank-Step9-A.

3. **The Phase 4 corpus inventory is enumerated at §3** with activation-timing tags per Q-3-E precedent + per-canary risk estimates per Q-Frank-4 commitment.

4. **Inherited items from Phase 3 close are enumerated at §4** — eleven items including Q-Frank-Step9-A's 4 explicit Phase-4 commitments + Phase 3 exit retro candidates + verbal bankings to formalize at Phase 4 exit doc-pass.

5. **Architectural questions Q-4-A through Q-4-H are enumerated at §5** for architect initial-review ruling — each with SME proposal + alternatives + ruling-needed framing.

6. **Validation rings status at Phase 4 entry is documented at §6** — Rings 1+2+3 inherited green from Phase 3 close; Ring 3 ARC-content extension is NEW at Phase 4.

7. **The Phase 4 step ledger is provisional at §7** pending Q-4-A architect ratification; 8-step framing + 3 mid-phase architectural-gap projection per substantive-scope-weighting.

8. **Risk notes carried into Phase 4 are documented at §8** — six items including ARC content readiness, Layer B vendoring source uncertainty, Case C scope risk, regularity check substantive complexity, Layer A consistency-affirmation gap forward-tracking discipline, stakeholder-precision discipline.

9. **Pass 2a vs Pass 2b sequencing is provisional at §9** pending architect ratification at initial-review cycle.

10. **Phase 3 inherited items are honored explicitly:** Case C as Phase 4 EXIT DELIVERABLE per Ask 4 (§2.11 + §3.5 + §8.3); v0.2-roadmap.md as inherited tracking surface per Ask 6 (I3); disposition-split discipline NON-inheritance per Ask 5 (I4 + §2.13); Phase 2 reactivation surface as Phase 4 demo opening per Ask 7 (§3.5 + I8); purpose-built fixture question routes through Q-4-D (§5).

11. **The corpus is the contract.** Phase 4 entry packet's §3 corpus inventory + §4 inherited items list freezes at architect final ratification. Developer scaffolds against the frozen contract; the implementation passes tests because the tests precede the implementation, not because the tests were retrofitted.

— SME, 2026-05-10 (initial DRAFT, awaiting architect initial-review cycle)

---

## 11. Architect Q-Rulings Resolved (initial-review cycle 2026-05-10)

Per the §11 verbatim-transcription discipline (banked at Phase 3 entry packet final ratification cycle 2026-05-08): architect ruling text transcribes verbatim to preserve audit-trail integrity.

### Q-4-A — 8-step granularity APPROVED with framing requirement

> 8-step ledger approved as proposed. Phase-4-close cadence sub-step framing per Phase 2 + Phase 3 Step 9 pattern preserved.
>
> The SME's proposed 8-step shape is correct for Phase 4's substantive scope (BFO ARC content ingestion + ARC inference + strict mode operational + Connected With + Layer B parity + Case C demo + bundle budget visibility + regularityCheck activation). Phase 3 used 9 steps for similar substantive scope; Phase 4's 8-step proposal reflects ARC inference being a unified surface rather than separated into evaluator + consistency check + cycle detection like Phase 3.
>
> Required framing requirement on the step ledger: explicit step assignments for the load-bearing Phase 4 deliverables. Specifically:
>
> - Case C demo work must slot into a specific Step (likely the closing Steps for demo authoring discipline)
> - Layer B vendoring + sidecar work must slot into Pass 2a per the SME's §9 framing; the actual Layer B parity demo work slots into a specific Step
> - BFO Disjointness Map firings + Connected With bridge axiom inference must have explicit step attribution
> - regularityCheck activation per the Phase 3 forward-tracked Phase 4 entry item must slot into a specific Step
>
> Per the Q-3-A framing precedent (Phase 3 entry cycle): the step ledger names deliverables explicitly so audit trail preserves. Same discipline applies.

**SME amendment per Q-4-A:** §7 step ledger amended to explicit-step-assignment framing (Step 4 BFO Disjointness Map firings; Step 5 Connected With bridge axiom; Step 6 regularityCheck activation; Step 8 Case C demo work + Layer B parity demo; Pass 2a Layer B vendoring + sidecar). Audit-trail per the Q-3-A framing precedent preserved.

### Q-4-B — Corpus shape APPROVED per Q-3-E precedent

> Corpus shape: 43 inherited + 5 corpus-before-code + 9 step-N-bind = 57 fixtures. Approved as proposed.
>
> Per Q-3-E ruling (Phase 3 entry cycle): "Corpus-before-code applies to fixtures that exercise architectural-commitment-tier contracts. Implementation-detail fixtures bind to Step-N. The split is binary at corpus authoring time."
>
> The SME's 5 corpus-before-code fixtures (BFO No-Collapse adversarial + wrong-translation canary + silent-pass canary + cycle re-binding + Layer B parity) are architectural-commitment-tier:
>
> - BFO No-Collapse adversarial canaries exercise the No-Collapse Guarantee against ARC content (load-bearing for Phase 4's substantive scope)
> - Wrong-translation canary exercises Phase 4's lift correctness against BFO axioms
> - Silent-pass canary exercises Phase 4's Horn-fragment classifier against ARC content
> - Cycle re-binding exercises ADR-013 visited-ancestor pattern against BFO transitive predicates
> - Layer B parity exercises canonical CLIF parity against BFO 2020 CLIF (the load-bearing external-parity surface for Phase 4)
>
> All five satisfy the architectural-commitment-tier criterion. Approved as corpus-before-code.
>
> The 9 step-N-bind fixtures cover implementation-detail surfaces (strict mode + ARC manifest version mismatch + structural annotations + cycle predicates + etc) appropriate for step-N binding.
>
> The 1 PROV-O entailment fixture activation honors the Phase 1 deferred-fixture forward-track per Phase 1 corpus sign-off; correctly activated at Phase 4 when ARC content makes the entailment query exercisable.
>
> Required of the entry packet: §3 corpus tagging per Q-3-E convention-only path: each fixture's `corpusActivationTiming` field marks `corpus-before-code` or `step-N-bind`. Same pattern as Phase 3 corpus.

**SME amendment per Q-4-B:** §3 corpus tags explicitly applied per the convention-only path (no manifest schema tightening); each fixture in §3.2 + §3.3 carries `corpusActivationTiming` field annotation.

### Q-4-C — Layer B CLIF vendoring source: BFO-ontology repo BFO 2020 CLIF APPROVED (initial-review cycle 2026-05-10); **AMENDED at Q-4-C source-state amendment cycle 2026-05-10 — Layer B vendoring forward-tracked to Phase 5 per §8.2 contingency operationalization**

#### Q-4-C initial-review ratification 2026-05-10 (verbatim transcription preserved)

> BFO 2020 CLIF from BFO-ontology repo per the SME's recommendation. License verification per ADR-010 binding.
>
> The SME's source candidate is correct on three counts:
>
> 1. **Source authority** — BFO-ontology/BFO repo is the canonical upstream source for BFO 2020 content. The Phase 1 + Phase 2 + Phase 3 demos already vendored owl-axiomatization.clif from this same repo (per ADR-010 license verification 2026-05-06); Phase 4's BFO 2020 CLIF vendoring extends the same source-authority chain.
>
> 2. **License-verification ritual inheritance** — Per ADR-010 (architect-ratified 2026-05-06) and the SME-Persona Verification of Vendored Canonical Sources discipline tightening (binding from Phase 4 forward per the discipline-tightening at Phase 2 close): vendoring discipline requires license-verification at vendoring time, not first-use time. Phase 4 Layer B vendoring inherits this discipline; the Pass 2a sidecar lands with populated license-verification block from the first commit landing the vendored source.
>
> 3. **Layer B vs Layer A distinction surfacing** — The SME's §3.4 introduction of the Layer B vs Layer A distinction at Phase 4 is the correct cycle. Phase 1-3 vendored Layer A only (owl-axiomatization.clif covering OWL constructs' canonical FOL semantics). Phase 4 introduces Layer B (bfo-2020.clif covering BFO content's canonical FOL semantics). The two-layer discipline operationalizes per the ADR-010 banked principle generalization: "License-verification-at-vendoring-time discipline applies to all vendored canonical sources regardless of format."

#### Q-4-C source-state amendment cycle 2026-05-10 (verbatim transcription — amendment SUPERSEDES initial-review disposition for Phase 4; carries forward to Phase 5 per §6.1)

Aaron-Developer Pass 2a repo-traversal evidence 2026-05-10 surfaced the contingency-triggering condition for §8.2: BFO-ontology/BFO repo @ master HEAD `857be9f15100531c7202ef0eb73142f95b70f3a7` does NOT contain `bfo-2020.clif` at any depth. Available candidates each corrupt the parity claim per a banked corruption mode (ontohub.org/bfo upstream-acknowledged-unfinished; Mungall fol-mungall upstream-acknowledged-experimental; Ressler BFO-FOL-alpha-2012-05-21 vocabulary-mismatched). Per architect Q-4-C source-state amendment cycle 2026-05-10 Ruling 1 — verbatim:

> Option (d) governs. Layer B vendoring forward-tracks to Phase 5 per §8.2 contingency.
>
> The SME's five-banking-anchor reasoning is correct.

The five banking anchors per the architect ruling verbatim:

1. **§8.2 contingency operationalization** — *"Pre-ratified contingency framings that trigger on evidence operationalize as the ratified disposition, not as corrective sub-cycles."*
2. **Cross-cycle banking generalization** — demo-discipline (Q-Frank-Step9-A Ask 1) + v0.2 forward-track (Q-4-D) banking compose to corpus fixtures: *"fixtures do not claim canonical parity against sources that are upstream-acknowledged-unfinished, upstream-acknowledged-experimental, or vocabulary-mismatched."*
3. **Q-4-C source-authority-chain banking holds at Phase 5** — license-verification-at-vendoring-time inheritance per ADR-010 is phase-agnostic.
4. **Cumulative external-parity discipline composes correctly** — Phase 1 Layer A intact / Phase 2 round-trip intact / Phase 3 pulled per Q-Frank-Step9-A / Phase 4 Layer A continues + Layer B defers / Phase 5 Layer B introduction.
5. **Phase 4 substantive scope preservation** — BFO ARC content + ARC inference + Case C + BFO Disjointness Map + Connected With + arity_flattening + regularityCheck all preserved; Layer B parity demonstration alone defers.

Options (a)/(b)/(c)/(e) refused per the architect's ruling text:

> Each of (a) (b) (c) corrupts the parity claim per the SME's analysis above; refused on architectural-commitment grounds.
>
> Option (e) — architect-supplied source — would require me to surface a fourth candidate from BFO-ecosystem knowledge. I do not have a fourth candidate that resolves all three corruption modes simultaneously: upstream-acknowledged-stable + vocabulary-aligned-with-BFO-2020 + accessible-via-source-authority-chain. The honest acknowledgment: the canonical Layer B source for BFO 2020 may not currently exist in the form Q-4-C ratification assumed.

Architect Ruling 2 verbatim — fixture pull discipline:

> Pull `p4_bfo_clif_layer_b.fixture.js` entirely. Corpus-before-code count 5 → 4.

The fixture-pull disposition per architect Ruling 2's three reasons:

1. **Corpus-reduction-transparency banking applies cleanly** (from this engagement's final-ratification cycle).
2. **Stub-fixture architectural-honesty concern** — corpus-before-code tier requires architectural-commitment-tier contract; a stub fixture whose canonical source is pending claims a contract that cannot yet be exercised; corrupts the discipline.
3. **Carrying cost preservation** — (d-1) pulls entirely; (d-2) keeps stub fixture with non-zero carrying cost across Phase 4 implementation work.

**Source-authority-chain banking extends to Phase 5** per Ruling 1 anchor 3: license-verification-at-vendoring-time inheritance (ADR-010) is phase-agnostic; the Phase 1 owl-axiomatization.clif.SOURCE LICENSE inheritance applies at Phase 5 vendoring time if same-source-repo (BFO-ontology/BFO repo) is ratified by Phase 5 entry-cycle (per license-verification-inheritance banking from this engagement's final-ratification cycle 2026-05-10).

**SME amendment per Q-4-C initial ratification 2026-05-10 (superseded for Phase 4 deliverables by Q-4-C source-state amendment cycle 2026-05-10):** ~~Pass 2a Layer B vendoring authoring per the architect's required sequencing — SME path-fence-authors `arc/upstream-canonical/bfo-2020.clif` + `arc/upstream-canonical/bfo-2020.clif.SOURCE` sidecar with populated license-verification block from the first commit; verification ritual runs on the sidecar pre-routing per binding-immediately discipline; Pass 2a commit lands the vendored CLIF + populated sidecar + Phase 4 entry packet final-ratification + 5 corpus-before-code fixtures.~~ **Superseded — Layer B vendoring deferred to Phase 5 per Q-4-C source-state amendment cycle Ruling 1 + §6.1 inheritance manifest.**

**SME amendment per Q-4-C source-state amendment cycle 2026-05-10 (current binding):** Pass 2a contents revised per Ruling 3 amendment table — Layer B vendoring artifacts pulled from Pass 2a (forward-tracked to Phase 5); `p4_bfo_clif_layer_b.fixture.js` deleted entirely per Ruling 2 (git history preserves work-in-progress); `bfo-2020.clif.SOURCE` sidecar shell preserved at Phase 4 close as Phase-5-forward-tracked reference; corpus-before-code count 5 → 4 per Ruling 2; Phase 5 entry packet inheritance manifest authored at §6.1.

### Q-4-D — Purpose-built consistency-check parity fixture: v0.2 forward-track APPROVED

> SME proposal approved. Phase 4 does NOT author a purpose-built consistency-check parity fixture; v0.2 forward-track per the disposition.
>
> Per Q-Frank-Step9-A Ask 8 (architect ruling 2026-05-10): "Phase 4 entry-cycle question; do not author at Phase 3 close." The Phase 4 entry-cycle deliberation is now: should Phase 4 author the purpose-built fixture, or forward-track to v0.2?
>
> Three reasons v0.2 forward-track is correct:
>
> 1. **Phase 4's substantive scope is already at the edge** — Phase 4 ships BFO ARC content + ARC inference + strict mode + Connected With + Layer B parity + Case C demo + bundle budget visibility + regularityCheck activation. Adding a purpose-built consistency-check parity fixture surface would expand Phase 4's substantive scope beyond what the entry packet's 8-step ledger accommodates.
>
> 2. **The fixture's purpose is most useful with v0.2 ELK closure** — The Phase 1 fixture reuse-question Frank surfaced (§4.5 Phase 3 critique) is bounded by what v0.1 establishes vs what v0.2 establishes. The Layer A consistency-affirmation gap is forward-tracked to v0.2 ELK closure per Q-Frank-Step9-A Ask 1. A purpose-built consistency-check parity fixture authored against v0.1's incomplete Horn-fragment classifier would be authored to validate-current-incomplete-behavior; the same fixture authored after v0.2 ELK lands would validate-corrected-behavior. The latter is more architecturally useful.
>
> 3. **Phase 4 corpus's Layer B parity covers the cumulative external-parity discipline** — Phase 4's §3 corpus includes a Layer B parity fixture exercising canonical CLIF parity against BFO 2020 CLIF. This extends the cumulative external-parity discipline (Phase 1 lift correctness + Phase 2 round-trip parity + Phase 3 demo attempted consistency-check parity + Phase 4 BFO content lift correctness) at the appropriate Phase-4 surface. The purpose-built consistency-check parity fixture would be a fifth surface; deferring to v0.2 is the right cadence.
>
> Required of the v0.2 forward-track: The `project/v0.2-roadmap.md` artifact gains an entry: "Purpose-built consistency-check parity fixture: authored against v0.2 ELK Horn-fragment classifier refinement; validates the corrected affirmative-arm verdict; closes the Frank §4.5 Phase 3 critique reuse-question. Owner: SME at v0.2. Scope: one fixture exercising Layer A consistency affirmation against ELK-validated subset. Timeline: aligned with v0.2 ELK closure cycle."

**SME amendment per Q-4-D:** new entry v0.2-08 added to `project/v0.2-roadmap.md` per the architect's required text. §2.13 NOT-in-Phase-4 list updated.

### Q-4-E — `nc_sdc_gdc` activation gate: Phase 7 OFI deontic APPROVED

> SME proposal approved. `nc_sdc_gdc` activates at Phase 7 OFI deontic, not Phase 4 BFO core.
>
> The SDC/GDC distinction's natural surfacing context is OFI deontic content, not BFO core content. Per ADR-008 (architect-ratified 2026-05-05) + the corpus's named SDC/GDC content: the deontic chain (DirectiveICE + PlanSpecification + RealizableEntity + VerbPhrase DiscourseReferent) is the canonical demand surface for SDC/GDC distinctness; BFO core content does not exercise it.
>
> Activating `nc_sdc_gdc` at Phase 4 against BFO core would force authoring synthetic SDC/GDC content that doesn't exist in BFO 2020's actual relations; deferring to Phase 7 lets the fixture exercise real OFI deontic content per the natural surfacing context.
>
> Per the prior banking from Q-3-D: "When the natural surfacing-context for deferred work spans multiple candidate phases, defer to the phase whose corpus or content demands the work, not the phase whose cycle is next." The same principle applies. Phase 7 forward-track approved.

**SME amendment per Q-4-E:** §3.2 corpus-before-code list excludes `nc_sdc_gdc` (forward-tracked to Phase 7); §2.13 NOT-in-Phase-4 list adds the explicit forward-track entry. Total corpus-before-code fixtures count revised from 6 (initial DRAFT) → 5 (architect-ratified) — corpus-before-code count of 5 per Q-4-B ratification.

### Q-4-F — Strict mode on legacy non-BFO axioms: Lift-rejection APPROVED

> SME proposal approved. Lift-rejection is the correct strict mode behavior on legacy non-BFO axioms.
>
> Three reasons:
>
> 1. **Strict mode's purpose is rejection of unverified content** — Per spec §3.3 (strict mode operational): strict mode rejects content that doesn't conform to loaded ARC modules. Legacy non-BFO axioms in input ontologies fail this conformance criterion; rejection is the spec-literal-framing behavior.
>
> 2. **Incremental + LossSignature alternatives corrupt strict mode's contract** — Incremental mode (lift the BFO axioms; skip the legacy ones) silently drops content; corrupts the No-Collapse Guarantee (skipped axioms might have been Horn-checkable inconsistencies). LossSignature mode (lift everything but emit LossSignatures on legacy axioms) conflates strict-mode rejection with the round-trip Loss Signature surface; corrupts the discriminating purpose of LossSignatures. Lift-rejection (refuse to load the ontology if any axioms fail BFO conformance) preserves both contracts: strict mode rejects unverified content; LossSignatures continue exercising round-trip approximation cases.
>
> 3. **Lift-rejection aligns with the existing typed-error hierarchy** — `UnsupportedConstructError` is the canonical typed-error class for axiom-shape rejections; extending it to cover ARC-conformance-failures preserves the existing hierarchy. The error's `construct` field names the offending axiom IRI; consumers catch by class per the standard pattern.
>
> Required of the strict mode implementation: Step-N-bind fixture exercising strict mode rejection on a synthetic legacy non-BFO axiom; expected throw is `UnsupportedConstructError` with `code: 'arc_conformance_failure'` (or similar canonical code aligned with the snake_case identifier discipline per the Q-Frank-Step9-A retroactive corrective Finding 3 banking). If a new reason code is required for the throw (vs reusing existing `unsupported_construct`): routes as a Phase 4 mid-phase architect cycle for enum-stability ratification per ADR-011 §5 + spec §0.2.3 evidence-gated discipline.

**SME amendment per Q-4-F:** §2.2 strict mode section folds the lift-rejection ruling explicitly + names the reason-code disposition (SME proposes reusing existing `unsupported_construct` per the Q-3-Step6-B reason-code-reuse-bounded-by-semantic-state-alignment principle; if Phase 4 implementation surfaces semantic-state-misalignment, mid-phase architect cycle for new-code ratification).

### Q-4-G — Verification ritual pre-emptive scope at Phase 4 entry: APPROVED with explicit categories

> Pre-emptive run approved as first phase-boundary retroactive batch. Categories per the existing 8-category ritual, scoped to Phase 4 entry packet artifacts.
>
> Per the Q-3-Step6 retroactive ritual + Q-3-Step5 verification ritual production-catch banking + Phase 3 Step 5 finding-pattern banking: the verification ritual operates as both surfacing-mechanism + validation-mechanism. First phase-boundary retroactive batch run extends the discipline to phase-boundary cadence.
>
> Required scope: SME runs the 8-category ritual against:
>
> - Phase 4 entry packet artifact text (this packet)
> - 5 corpus-before-code fixtures' path-fence-authored content
> - Layer B vendoring sidecar (`bfo-2020.clif.SOURCE`)
> - BFO ARC manifest entries (the 40-entry Verified ARC content per §1 entry criteria)
> - Cross-phase cross-references (Phase 1 + Phase 2 + Phase 3 demo references; ADR cross-references; Q-ruling cross-references)
>
> Findings dispositioned per the established pattern:
>
> - Cat 1-8 findings → corrective amendments before Pass 2a final-ratification commit
> - Multi-canonical-source findings (per Step 5 Cat 8 expansion) → routed for architect ratification if surfaced
> - Zero findings → closure reported in Phase 4 entry packet ratification cycle
>
> Why first phase-boundary retroactive batch: Phase 3 closed with three retroactive ritual surfaces: the Step 5 first production catch, the retroactive corrective cycle's first batch dividend, and the Phase 3 close work's continued ritual operation. Phase 4 entry inherits the discipline; the first phase-boundary retroactive batch operationalizes the discipline at phase-cadence rather than mid-phase-step-cadence.

**SME amendment per Q-4-G:** SME executes the 8-category ritual against Pass 2a artifacts pre-routing; findings (or zero-findings closure) report lands as separate artifact alongside Pass 2a commit. Verification ritual report cross-referenced from §9 Pass 2a contents.

### Q-4-H — BFO ARC content authoring parallel workstream counter: own-bucket APPROVED

> SME proposal approved. BFO ARC content authoring's parallel workstream counts in its own bucket, not in Phase 4 mid-phase or entry-cycle counters.
>
> The BFO ARC content authoring workstream is structurally distinct from Phase 4 implementation work: it is corpus-content authoring that pre-existed Phase 4 entry (per §1 entry criteria: BFO ARC content ingested ✅; 0 [VERIFY] markers; 40 entries Verified). The workstream's own cycle history (license verification work, IRI canonicalization, Verified-status promotion across cycles) is distinct from Phase 4 architectural-gap micro-cycles.
>
> Counting BFO ARC content authoring cycles in Phase 4 mid-phase counter would conflate two structurally different workstream categories. Own-bucket framing preserves the cadence reading.
>
> Required of the cycle accounting: Phase 4 entry packet's §1 + §2 + §11 cycle accounting framing names:
>
> - Phase 4 entry-cycle counter: increments per Phase 4 entry-packet ratification cycles (initial review + amendment + any corrective sub-cycles)
> - Phase 4 mid-phase counter: increments per in-Step architectural-gap micro-cycles
> - Phase 4 stakeholder-routing corrective sub-cycle bucket: increments per stakeholder-routing corrective sub-cycles
> - BFO ARC content authoring workstream bucket: increments per BFO ARC content authoring cycles (separate counter; pre-existed Phase 4 entry)

**SME amendment per Q-4-H:** §11 cycle accounting names four explicit buckets per the architect-required framing.

### §3 Corpus shape ratification

> Corpus shape APPROVED as proposed.
>
> Total active count: 57 fixtures + 4 demo cases. Breakdown per the SME:
>
> - 43 inherited (Phase 1 + Phase 2 + Phase 3 carryforward)
> - 5 corpus-before-code (architectural-commitment-tier, Q-4-B ratified)
> - 9 step-N-bind (implementation-detail, Q-4-B ratified)
> - Demo Cases A + B + C + opening (Phase 2 reactivation surface per Q-Frank-Step9-A Ask 7)
>
> The 1 PROV-O entailment fixture activation is the Phase 1 deferred-fixture forward-track honored at Phase 4 corpus surface. Approved.
>
> Phase 1 closed with 18 fixtures; Phase 2 closed with 27; Phase 3 closed with 43; Phase 4 expanding to 57 reflects substantive corpus growth per ARC content + Phase 4-specific surfaces. The scaling is correct.

### Pass 2a / Pass 2b sequencing ratification

> Pass 2a sequencing APPROVED with structural requirements.
>
> Per Q-3-G two-pass sequencing precedent: Pass 2a covers entry-packet-internal substance + corpus-before-code fixtures + same-cycle architectural artifacts. Pass 2b covers separable architectural surfaces (ADR promotions, prior-phase exit packet updates, fixture amendments).
>
> **Pass 2a contents:** Phase 4 entry packet (AMENDED + RATIFIED post-amendment); 5 corpus-before-code fixtures registered in `tests/corpus/manifest.json` with `phaseActivated: 4` + `corpusActivationTiming: 'corpus-before-code'`; Layer B vendoring artifacts: `arc/upstream-canonical/bfo-2020.clif` + `arc/upstream-canonical/bfo-2020.clif.SOURCE` (with populated license-verification block); manifest schema updates if Q-4-B chooses schema tightening over convention-only; Phase 4 entry packet's verification ritual run report (the first phase-boundary retroactive batch findings).
>
> **Pass 2b candidates depending on architect rulings:** Per this cycle's rulings, no Pass 2b cycle is mandatory (no ADR promotions or prior-phase amendments surfaced); but if the verification ritual finds canonical-source-reference issues requiring architect ratification, those route as Pass 2b cycles.

**SME amendment per §3 + sequencing rulings:** §9 Pass 2a contents enumerate per the architect-required list; Pass 2b candidates conditional on verification ritual findings.

---

## 12. Architect-Banked Principles from This Cycle

### Six new banked principles (architect initial-review ruling 2026-05-10)

Verbatim transcription per the §11 verbatim-transcription discipline. All six bank now (verbally), formalize at Phase 4 exit doc-pass alongside the prior cycles' bankings.

1. **Phase-boundary canonical source vendoring inherits the ADR-010 license-verification-at-vendoring-time discipline.** Sidecar lands with populated license-verification block from the first commit landing the vendored source; first-use-time gap closed per the discipline tightening. (Q-4-C)

2. **Stakeholder-flagged fixture-design questions whose architectural utility depends on subsequent-version closure paths defer to those versions** rather than authoring against incomplete current-phase behavior. The fixture's value increases with the closure path's completion; pre-authoring corrupts the value. (Q-4-D)

3. **Strict mode rejection of legacy non-BFO axioms uses lift-rejection** (refuse to load) rather than incremental skip or LossSignature emission. The behavior preserves both strict mode's rejection contract and LossSignatures' round-trip approximation purpose. (Q-4-F)

4. **Verification ritual phase-boundary retroactive batch runs operationalize the discipline at phase-cadence;** pre-Phase-N-Step-1 batch runs cover Phase N entry packet + corpus-before-code fixtures + canonical source vendoring + cross-phase cross-references. The phase-cadence batch consolidates findings into single corrective routing rather than per-Step micro-cycles. (Q-4-G)

5. **Pre-existing parallel workstream cycle counters** (canonical source vendoring, ARC content authoring, etc) operate in their own buckets distinct from per-phase cycle counters. Conflating distinct workstream categories corrupts cadence reading. (Q-4-H)

6. **Phase 4 entry packet inheriting Phase 3 close's withdrawn-discipline-non-inheritance preserves the discipline-correction discipline forward across phase boundaries.** (Implicit from §2.13 disposition-split NON-inheritance per Q-Frank-Step9-A Ask 5)

### Verbal bankings inherited from Phase 3 doc-pass (formalize at Phase 4 exit doc-pass per architect directive)

1. Architect-authoritative retro candidate counts ratify as written; SME-side observations not in the authoritative count are folded as sub-observations under semantically-adjacent candidates rather than dropped or self-elevated. (Reconciliation 1 banking, Phase 3 doc-pass cycle 2026-05-10)
2. Architect rulings naming counts + lists must distinguish between additions to the named list and additions to a different artifact category that affect inheritance through their own surface. (Reconciliation 2 banking, Phase 3 doc-pass cycle 2026-05-10)
3. Architect-side discipline includes ruling-clarity (naming counts/lists/categories with sufficient precision for unambiguous SME parsing) and ruling-correction (acknowledging ambiguity or error and correcting the phrasing principle for future cycles). The discipline preserves through clean revision rather than procedural defense. (Architect-side discipline meta-banking, Phase 3 doc-pass cycle 2026-05-10)

These three forward-fold to Phase 4 exit doc-pass; not formalized at Phase 4 entry per architect directive.

### Cycle-accounting framing per Q-4-H ruling 2026-05-10 + Q-4-C source-state amendment cycle Ruling 4 refinement 2026-05-10

Phase 4 cycle-counter buckets (amended at Q-4-C source-state amendment cycle 2026-05-10 — new contingency-operationalization sub-cycle bucket per Ruling 4):

- **Phase 4 entry-cycle counter:** at **2** (initial-review cycle + final-ratification brief follow-up cycle); closes at Phase 4 entry-packet ratification — **closed 2026-05-10 at final ratification**; the Q-4-C source-state amendment cycle does NOT increment this counter per Ruling 4 framing distinction (contingency-operationalization bucket separate from entry-cycle bucket).
- **Phase 4 mid-phase counter:** at 0 (no in-Step architectural-gap micro-cycles surfaced yet); projected ~3 per substantive-scope-weighting (Phase 3 retro candidate #2 forward-track).
- **Phase 4 stakeholder-routing corrective sub-cycle bucket:** at 0.
- **Phase 4 contingency-operationalization sub-cycle counter (NEW at Q-4-C source-state amendment cycle 2026-05-10 per Ruling 4 framing):** at **1** (Q-4-C source-state amendment cycle 2026-05-10 — first production operationalization of a ratified contingency framing in the project's cycle history); **brief confirmation cycle 2026-05-10 closes the sub-cycle** per architect Q-4-C amendment brief confirmation 2026-05-10; closure formalizes when Pass 2a commit lands + remote CI green. Brief confirmation cycle does NOT increment any counter per the architect-banked principle "brief follow-up confirmation cycles for path-fence-authored amendments whose substance was ratified at the prior cycle do not increment cycle-cadence counters" (Phase 3 entry-packet final-ratification cycle banking 2026-05-08; reaffirmed at Q-4-C amendment brief confirmation 2026-05-10). Distinct from the stakeholder-routing corrective sub-cycle bucket; distinct from the entry-cycle counter; per architect Ruling 4: *"Corrective sub-cycles (architect-error-correction) and contingency-operationalization sub-cycles (pre-ratified contingency triggering on evidence) are different bucket categories."*
- **BFO ARC content authoring workstream bucket:** own counter (pre-existed Phase 4 entry per Aaron-led parallel workstream); does NOT increment Phase 4 entry-cycle, mid-phase, stakeholder-routing-corrective, or contingency-operationalization counters per Q-4-H ruling.

### Three new banked principles (architect final-ratification cycle 2026-05-10)

Verbatim transcription per the §11 verbatim-transcription discipline. **All three bank now (verbally), formalize at Phase 4 EXIT doc-pass per architect directive** — NOT at Phase 4 entry. The Phase 4 exit packet's §5 inventory will fold these alongside the Phase 4 mid-phase + close-cadence bankings; the Phase 4 entry packet records them here for inheritance audit-trail.

1. **Corpus-shape changes during entry-packet amendment cycles are flagged with explicit count delta + per-item attribution** rather than silent landing of the changed list. The auditability discipline preserves through count-change-transparency. (Corpus reduction transparency banking; surfaced by the SME's §3.2 list reduction "6 → 5 (Q-4-E `nc_sdc_gdc` removed)" framing at the AMENDED packet — corpus-shape changes during amendment cycles are auditable through count delta when the change is explicit; silent reduction would lose the audit-trail for why the count changed.)

2. **When same-source-repo canonical sources are vendored across phases, the license-verification block inherits from the prior-phase sidecar where applicable** (same upstream LICENSE + same SHA-256). Source-specific verification surfaces (commit SHA, master HEAD, cited-blocks) preserve the at-vendoring-time discipline through their own [VERIFY] markers. (License-verification inheritance banking; surfaced by the SME's `bfo-2020.clif.SOURCE` inheritance from `owl-axiomatization.clif.SOURCE` — both files come from BFO-ontology/BFO repo; both inherit the same CC BY 4.0 LICENSE; the LICENSE file SHA-256 is identical. Inheritance avoids re-running the Layer A license-verification ritual against an artifact whose canonical license-source is identical.)

3. **Verification ritual phase-boundary retroactive batch findings disposition into pre-routing-resolution (mechanical corrections) or vendoring-time-deferral (Pass-2a-creation-dependent verifications) without architect routing when both dispositions stay in SME-domain.** Architect routing reserved for findings requiring substantive architectural ratification. (Disposition cadence banking; surfaced by the SME's verification ritual report disposition pattern — 1 Cat 5 finding resolved pre-routing (`fol:Biconditional` corrected); 1 Cat 8 finding deferred to Pass 2a vendoring time (Layer B canonical-value verification per vendoring-time fetch). Both stayed in SME-domain; no architect routing required.)

These three forward-fold to Phase 4 exit doc-pass; not formalized at Phase 4 entry per architect directive.

### Seven new banked principles (architect Q-4-C source-state amendment cycle 2026-05-10)

Verbatim transcription per the §11 verbatim-transcription discipline. **All seven bank now (verbally), formalize at Phase 4 EXIT doc-pass per architect directive** — NOT at Phase 4 entry. These compose with the prior cycles' Phase 4 bankings (6 initial-review + 3 final-ratification + 7 Q-4-C source-state amendment cycle = 16 verbal-pending Phase 4 bankings, plus 3 Phase 3 doc-pass verbal-pending inheritances, formalize together at Phase 4 exit doc-pass).

1. **Pre-ratified contingency framings that trigger on evidence operationalize as the ratified disposition**, not as corrective sub-cycles. The triggering condition surfaces; the disposition activates; no architect ruling-correction required. (Ruling 1 anchor 1 banking)

2. **The architect does not have privileged knowledge that resolves all canonical-source-state corruption modes when the upstream ecosystem does not provide a clearly canonical source.** Forward-tracking to a later cycle when source-state may have improved is the architecturally-correct response; speculative source-supplying without evidence-grounded ratification is refused. (Ruling 1 Option (e) refusal banking)

3. **Fixture-pull dispositions under contingency-triggered cycles delete or hold the fixture entirely rather than restage as stub.** Stub-fixture at corpus-before-code tier would claim architectural commitment without commitment substance; refused on discipline-integrity grounds. (Ruling 2 disposition discipline banking)

4. **Cycle accounting buckets distinguish corrective sub-cycles (architect-error-correction) from contingency-operationalization sub-cycles (pre-ratified contingency triggering on evidence).** Both stay distinct from per-phase counters; the naming distinction preserves architectural integrity of the discipline. (Ruling 4 bucket framing banking)

5. **Pre-ratified contingency framings reduce corrective overhead when ratification anticipates triggering conditions.** The architect-routing surface at operationalization time is narrower than at fresh-architecture time. Future entry packets should include contingency framings for known evidence-dependent surfaces (canonical source state, peer-dependency availability, infrastructure readiness, etc). (Pattern banking)

6. **Pre-ratified disciplines validate their effectiveness at first production operationalization.** Banking the operationalization as exemplar extends the discipline's authority for subsequent cycles. (First-production-operationalization banking)

7. **Architect-side discipline acknowledges bounded knowledge surfaces** (e.g., upstream-ecosystem state, peer-dependency availability) and refuses speculative ratification without evidence. The discipline preserves through honest acknowledgment of bounded knowledge rather than supplying unsupported architectural commitments to resolve cycle pressure. (Architect bounded-knowledge meta-banking)

These seven forward-fold to Phase 4 exit doc-pass; not formalized at Phase 4 entry per architect directive.

### Three new banked principles (architect Q-4-C amendment brief confirmation cycle 2026-05-10)

Verbatim transcription per the §11 verbatim-transcription discipline. All three bank now (verbally), formalize at Phase 4 EXIT doc-pass alongside the prior cycles' bankings. These bank from the architect's brief confirmation cycle observing the SME's Q-4-C amendment shape as exemplary practice on three discipline operations.

1. **Forward-tracked vendoring sidecars preserve the original ratification shell with explicit forward-tracked status banner.** The shell remains audit-trail artifact for the ratification cycle and inheritance reference for the forward-tracked phase's authoring. Three reasons: (i) the shell represents architect-ratified work from the prior ratification cycle — deletion loses the audit-trail artifact for what the prior ratification authorized; (ii) the forward-tracked phase's entry packet authoring inherits the shell as structural reference (license-verification block format, cited-blocks structure, verified-canonical-values placement) — reducing forward-tracked phase's authoring cost; (iii) the explicit status banner prevents misreading by future readers. (Sidecar SHELL preservation banking)

2. **Verification ritual re-runs on amendment-cycle artifacts produce dedicated re-run report sections with explicit finding counts.** Zero-finding re-runs validate the amendments; non-zero finding re-runs route per the standard disposition cadence (pre-routing resolution or architect routing). The dedicated section preserves audit trail at finding-set granularity. The ritual operates as both surfacing-mechanism + validation-mechanism per prior verification-ritual-production-catch banking (Phase 3 Step 5); zero-finding re-runs are the validation-mechanism succeeding. (Re-run report discipline banking)

3. **Contingency-operationalization sub-cycles produce standalone routing-cycle artifacts** (e.g., `phase-N-entry-Q-N-X-amendment.md`) rather than folding into the parent entry packet. The standalone artifact preserves the sub-cycle's distinct audit trail and serves as inheritance exemplar for subsequent contingency-operationalization sub-cycles. Three reasons: (i) the contingency-operationalization sub-cycle has its own cycle history distinct from the parent entry-cycle — folding conflates audit trails; (ii) future contingency-operationalization sub-cycles inherit the standalone-artifact pattern as exemplar; (iii) precise cross-linking from other artifacts (manifest, entry packet, verification ritual report, ROADMAP) by file path enables clean audit-trail link-graph traversal. (Standalone routing-cycle artifact banking)

These three forward-fold to Phase 4 exit doc-pass; not formalized at Phase 4 entry per architect directive.

### Banking accounting summary (post-Q-4-C-amendment-brief-confirmation 2026-05-10)

Phase 4 verbal-pending bankings (formalize at Phase 4 exit doc-pass per architect directive):

- 6 from Phase 4 entry-cycle initial-review (Q-4-A through Q-4-H rulings 2026-05-10)
- 3 from Phase 4 entry-cycle final-ratification (corpus-reduction-transparency + license-verification-inheritance + disposition-cadence; 2026-05-10)
- 7 from Q-4-C source-state amendment cycle (2026-05-10)
- **3 from Q-4-C amendment brief confirmation cycle (2026-05-10) — sidecar SHELL preservation + re-run report discipline + standalone routing-cycle artifact**

Phase 3 verbal-pending bankings (forward-fold to Phase 4 exit doc-pass per architect directive):

- 3 from Phase 3 doc-pass confirmation cycle (Reconciliation 1 + Reconciliation 2 + architect-side discipline meta-banking; 2026-05-10)

**Total Phase 4 exit doc-pass formalization queue: 19 Phase 4 cycle bankings + 3 Phase 3 doc-pass inheritances = 22 banking entries.** Bankings stratify by sub-cycle origin per the cycle-stratification discipline banked at Phase 3 doc-pass; AUTHORING_DISCIPLINE.md fold-in at Phase 4 Step 9.5 per the amended Step 9 sub-step framing.

---

## 13. Forward-References

- `project/reviews/phase-3-exit.md` — predecessor (RATIFIED + CLOSED 2026-05-10)
- `project/reviews/phase-3-step9-architectural-gap.md` — Q-3-Step9-A original ruling + Q-Frank-Step9-A corrective overlay (load-bearing for §4 inherited items)
- `project/reviews/phase-3-reactivation-results.md` — Phase 2 reactivation surface (Phase 4 demo opening per Q-Frank-Step9-A Ask 7)
- **`project/reviews/phase-4-entry-q-4-c-amendment.md` — Q-4-C source-state amendment cycle routing artifact 2026-05-10 (FIRST production operationalization of a ratified contingency framing; mirrors Q-3-Step9-A architectural-gap cycle-artifact pattern)**
- **`project/reviews/phase-4-entry-verification-ritual-report.md` — Phase 4 entry-cycle 8-category verification ritual report (AMENDED for Q-4-C amendment cycle 2026-05-10: Cat 8 Layer B canonical-value finding disposition no longer relevant for Phase 4 per Layer B vendoring forward-track to Phase 5)**
- `demo/Phase3DemoCritique.md` — Frank's Phase 3 stakeholder critique (banked as canonical exemplar of post-hoc-discipline-canonization risk pattern)
- `project/v0.2-roadmap.md` — consolidated v0.2 closure-path commitments artifact (Phase 4 maintains currency per I3)
- `arc/core/bfo-2020.json` — 40-entry BFO 2020 ARC module (input to Phase 4 entry-cycle from Aaron-led parallel workstream)
- `arc/upstream-canonical/bfo-2020.clif` + `bfo-2020.clif.SOURCE` — Pass 2a deliverable per Q-4-C ratification
- `arc/AUTHORING_DISCIPLINE.md` — "Phase 3 Banked Principles" section (Phase 4 entry-cycle bankings will append; Phase 4 exit doc-pass formalizes the verbal bankings + new Phase 4 bankings)
- `project/DECISIONS.md` — ADR-002, ADR-007, ADR-008, ADR-009, ADR-010, ADR-011, ADR-013 cross-references
- `project/OFBT_spec_v0.1.7.md` — §3.4.1, §3.6.1-§3.6.4, §6.2.1 frozen contract surfaces
- `project/OFBT_API_v0.1.7.md` — §2.1.2, §3.6 frozen contract surfaces
- `project/ROADMAP.md` — Phase 4 deliverables checklist + Phase 4 ARC authoring exit criteria + Phase 4 test corpus framing

---

**Phase 4 entry packet INITIAL DRAFT complete. Routing to architect for initial-review cycle.**

**[STATUS UPDATE 2026-05-10]** Phase 4 entry packet AMENDED + RATIFIED at architect initial-review + final-ratification cycles 2026-05-10. **[STATUS UPDATE 2026-05-10 — Q-4-C source-state amendment cycle]** Further AMENDED at Q-4-C source-state amendment cycle 2026-05-10 per architect Ruling 3 amendment table — sections §1, §2.10, §3.2, §3.4, §3.5, §3.7, §3.8, §6.1 (NEW), §7, §8.2, §9, §11 Q-4-C, §12, §13 amended. Layer B vendoring + `p4_bfo_clif_layer_b` forward-tracked to Phase 5 per §6.1 inheritance manifest; 7 new banked principles forward-fold to Phase 4 exit doc-pass per §12. Pass 2a contents revised (4 corpus-before-code fixtures; Layer B vendoring artifacts pulled). **[STATUS UPDATE 2026-05-10 — Q-4-C amendment brief confirmation cycle]** Architect brief confirmation ISSUED 2026-05-10 on the Q-4-C amendment artifact set: 6 modified artifacts verified against the four rulings + seven banked principles; 3 new banked principles from the brief confirmation cycle (sidecar SHELL preservation + re-run report discipline + standalone routing-cycle artifact) appended to §12 verbal-pending. **Phase 4 contingency-operationalization sub-cycle CLOSED at brief confirmation cycle**; formalization at Pass 2a commit lands + remote CI green. Pass 2a UNBLOCKED for developer commit per architect-ratified 8-artifact set; Phase 4 Step 1 begins after Pass 2a commit + CI green verification.

— SME, 2026-05-10
