# Phase 4 Entry Packet — Q-4-C Source-State Amendment Cycle — RATIFIED

**Date:** 2026-05-10 (Pass 2a Q-4-C source-state finding surfaced by Aaron-Developer repo-traversal evidence; SME analysis + 5-banking-anchor recommendation routed same day; architect amendment ruling issued same day).
**Cycle type:** **Phase 4 contingency-operationalization sub-cycle** (NOT a corrective sub-cycle in the architect-error-correction sense). Per architect Ruling 4 ratification 2026-05-10: contingency-operationalization sub-cycles are distinct from corrective sub-cycles; pre-ratified contingency framings that trigger on evidence operationalize as the ratified disposition. This cycle is the FIRST production operationalization of the §8.2 contingency the Phase 4 entry packet authored.
**Surfaced by:** Aaron-Developer Pass 2a repo-traversal evidence 2026-05-10 — BFO-ontology/BFO repo @ master HEAD `857be9f15100531c7202ef0eb73142f95b70f3a7` does NOT contain a canonical `bfo-2020.clif` at the granularity Q-4-C ratification (2026-05-10 initial-review cycle) assumed.
**Status:** **RATIFIED 2026-05-10.** Cycle history: (1) Pass 2a vendoring paused at Developer-traversal step 2026-05-10 → (2) Aaron-Developer finding packet to SME (5 option candidates a/b/c/d/e) → (3) SME 5-banking-anchor analysis + Option (d) + (d-1) recommendation → (4) **architect amendment ruling 2026-05-10:** Option (d) forward-track Layer B vendoring to Phase 5 APPROVED + Option (d-1) pull `p4_bfo_clif_layer_b.fixture.js` APPROVED + Q-4-C language amendment APPROVED + contingency-operationalization sub-cycle bucket framing APPROVED with refinement + 7 new banked principles → (5) SME path-fence-authors amendments per the rulings (this artifact + entry packet amendment + fixture pull + manifest update + verification ritual report update + sidecar shell marked Phase-5-forward-tracked).

---

## 1. Triggering condition — Developer-traversal evidence

The §8.2 contingency was authored at AMENDED packet (2026-05-10 initial-review cycle) explicitly anticipating:

> "If the canonical source is harder to locate than expected, Pass 2a may slip; architect can amend to a different source or scope-reduce the Layer B parity discipline at Phase 4 (forward-track to Phase 5 if needed)."

The architect ratified §8.2 at AMENDED packet final ratification 2026-05-10. The Developer's Pass 2a repo-traversal evidence (per Aaron's finding packet) confirmed the triggering condition:

| Path | Size | Status |
|---|---|---|
| `src/ontology/fol-group/owl-axiomatization.clif` | 33.5 KB | Layer A — already vendored at Phase 1 |
| `src/ontology/fol-mungall/fol-{src,derived}/*.clif` (7 files) | 8–30 KB each | Experimental per Mungall's README ("More discussion required on what features of CLIF we should use") |
| `src/ontology/fol-mungall/meta/*.clif` (3 files) | small | Metadata; not BFO content |
| `src/ontology/fol-ressler/BFO-FOL-alpha-2012-{05-21,07-20}.clif` | 36.7 KB / similar | 2012 alpha — pre-BFO-2020 |

**Zero files in the BFO-ontology/BFO repo match `bfo-2020*` or `bfo_2020*` at any depth.**

The BFO repo's own README pointer references `ontohub.org/bfo` (canonical BFO 2.0 CLIF draft); upstream marks itself "Unfinished" per the file's own header comment.

The triggering condition for §8.2 is met. The contingency operationalizes.

---

## 2. SME analysis — 5 option candidates

(See Aaron's finding packet §4 + SME response §SME-side-option-analysis for full detail.)

Three options corrupt the parity claim in structurally distinct ways:

- **Option (a) ontohub.org/bfo** — upstream-acknowledged-unfinished + vocabulary-coverage gap + source-authority-chain extension required
- **Option (b) Mungall's bfo-taxonomy-src.clif** — upstream-acknowledged-experimental
- **Option (c) Ressler's BFO-FOL-alpha-2012-05-21.clif** — vocabulary mismatch (2012-alpha pre-dates BFO 2020 by 8 years)

Two options resolve the corruption:

- **Option (d) Forward-track Layer B vendoring to Phase 5** per §8.2 contingency — SME-recommended
- **Option (e) Architect-supplied source** — requires architect BFO-ecosystem knowledge surfacing a fourth candidate

SME's recommendation: **(d) + sub-option (d-1) pull the fixture** anchored in five banking principles (see §3 below).

---

## 3. Architect ruling 2026-05-10 — Option (d) + (d-1) APPROVED with refinements

### 3.1 Ruling 1 — Option (d) Forward-track Layer B vendoring to Phase 5

The architect ratified Option (d). Verbatim from the ruling text:

> Option (d) governs. Layer B vendoring forward-tracks to Phase 5 per §8.2 contingency.
>
> The SME's five-banking-anchor reasoning is correct.

Auditing each banking anchor (per architect ruling verbatim transcription):

1. **§8.2 contingency operationalization** — "Pre-ratified contingency framings that trigger on evidence operationalize as the ratified disposition, not as corrective sub-cycles."
2. **Cross-cycle banking generalization** — demo-discipline (Q-Frank-Step9-A Ask 1) + v0.2 forward-track (Q-4-D) banking compose to corpus fixtures: "fixtures do not claim canonical parity against sources that are upstream-acknowledged-unfinished, upstream-acknowledged-experimental, or vocabulary-mismatched."
3. **Q-4-C source-authority-chain banking holds at Phase 5** — license-verification-at-vendoring-time inheritance per ADR-010 is phase-agnostic.
4. **Cumulative external-parity discipline composes correctly** — Phase 1 Layer A intact / Phase 2 round-trip intact / Phase 3 pulled per Q-Frank-Step9-A / Phase 4 Layer A continues + Layer B defers / Phase 5 Layer B introduction.
5. **Phase 4 substantive scope preservation** — BFO ARC content + ARC inference + Case C + BFO Disjointness Map + Connected With + arity_flattening + regularityCheck all preserved; Layer B parity demonstration alone defers.

Options (a)/(b)/(c)/(e) refused per the architect's ruling text:

> Each of (a) (b) (c) corrupts the parity claim per the SME's analysis above; refused on architectural-commitment grounds.
>
> Option (e) — architect-supplied source — would require me to surface a fourth candidate from BFO-ecosystem knowledge. I do not have a fourth candidate that resolves all three corruption modes simultaneously: upstream-acknowledged-stable + vocabulary-aligned-with-BFO-2020 + accessible-via-source-authority-chain. The honest acknowledgment: the canonical Layer B source for BFO 2020 may not currently exist in the form Q-4-C ratification assumed.

### 3.2 Ruling 2 — Option (d-1) Pull `p4_bfo_clif_layer_b.fixture.js` entirely

The architect ratified the pull. Verbatim:

> Pull `p4_bfo_clif_layer_b.fixture.js` entirely. Corpus-before-code count 5 → 4.

Three reasons (per architect ruling):

1. **Corpus-reduction-transparency banking applies cleanly** (from this engagement's final-ratification cycle).
2. **Stub-fixture architectural-honesty concern** — corpus-before-code tier requires architectural-commitment-tier contract; a stub fixture whose canonical source is pending claims a contract that cannot yet be exercised; corrupts the discipline.
3. **Carrying cost preservation** — (d-1) pulls entirely; (d-2) keeps stub fixture with non-zero carrying cost across Phase 4 implementation work.

Required of the fixture pull (per architect ruling):

- `tests/corpus/p4_bfo_clif_layer_b.fixture.js` **deleted** (SME elected deletion over hold per the cleaner-discipline disposition; git history preserves the work-in-progress)
- `tests/corpus/manifest.json` entry **removed**
- Phase 4 entry packet §3.2 amends with explicit attribution per corpus-reduction-transparency banking ("Q-4-C source-state amendment 2026-05-10; Layer B parity forward-tracked to Phase 5 per §8.2 contingency")
- Phase 5 entry packet authoring (when surfaced) inherits the Layer B vendoring + fixture re-authoring as forward-track items

### 3.3 Ruling 3 — Q-4-C language amendment for phase-4-entry.md

The architect ratified the language amendment as **editorial correction within v0.1.7 freeze** per the Pass 2b banking (Phase 3 cycle 2026-05-09: "Editorial corrections within v0.1.7 freeze include both terminology sharpening and language tightening to reflect newly-introduced API surfaces that were architecturally implicit but not textually explicit." Same banking generalizes to corpus-shape corrections.).

Required amendments per architect ruling:

| Surface | Amendment |
|---|---|
| §1 status header | "AMENDED + RATIFIED" + Q-4-C amendment cycle integration note |
| §2.10 Layer A consistency-affirmation gap visibility | Layer B introduction framing revised: defers to Phase 5 |
| §3.2 corpus-before-code list | 5 → 4; explicit attribution ("Q-4-C source-state amendment 2026-05-10; Layer B parity forward-tracked to Phase 5 per §8.2 contingency") |
| §3.4 Layer A vs Layer B framing | Revised: Phase 4 ships Layer A continuation; Layer B introduction defers to Phase 5 |
| §6 To-Phase-5-entry inheritance manifest | New entry: Layer B vendoring + `p4_bfo_clif_layer_b` re-authoring forward-tracked |
| §7 Step ledger | Step 3 (BFO 2020 ARC content lift correctness) preserved; the Pass 2a Layer B vendoring task pulled; Step 8 demo work's Case B element shifts to Layer A continuation |
| §8.2 contingency framing | Append contingency-operationalization note: §8.2 operationalized at Q-4-C amendment cycle 2026-05-10; first production operationalization of a ratified contingency framing |
| §11 Q-4-C verbatim transcription | Amend with Phase 5 forward-track + source-authority-chain banking extension to Phase 5 |
| §12 cycle accounting | Add **Phase 4 contingency-operationalization sub-cycle counter** at 1 (this cycle; closes when Pass 2a commit lands per the amendment); 7 new bankings appended verbal-pending-Phase-4-exit-doc-pass |

### 3.4 Ruling 4 — Contingency-operationalization sub-cycle bucket framing APPROVED with refinement

The architect ratified the SME-proposed own-bucket framing **with refinement on bucket naming**:

> The naming distinction matters because the cycle accounting framing should distinguish:
>
> - **Corrective sub-cycles:** architect-error-correction cycles where prior rulings were structurally incorrect (e.g., Q-Frank-Step9-A in Phase 3 corrected three prior Q-3-Step9-A rulings)
> - **Contingency-operationalization sub-cycles:** cycles where pre-ratified contingency framings trigger on evidence and the ratified disposition activates (this cycle)
>
> Both stay in their own buckets distinct from per-phase counters; but they are different bucket categories.

Cycle-counter buckets (post-Q-4-C-amendment):

- Phase 4 entry-cycle counter: **2** (closed at final ratification 2026-05-10; this cycle does NOT increment)
- Phase 4 mid-phase counter: **0** (Phase 4 hasn't started)
- Phase 4 stakeholder-routing corrective sub-cycle counter: **0**
- **Phase 4 contingency-operationalization sub-cycle counter: 1** (this cycle; closes when Pass 2a commit lands per the amendment)
- BFO ARC content authoring workstream bucket: pre-existing; not affected

---

## 4. Seven new banked principles (architect ruling 2026-05-10)

Verbatim transcription per the §11 verbatim-transcription discipline. **All seven bank now (verbally), formalize at Phase 4 EXIT doc-pass alongside the prior cycles' bankings.**

1. **Pre-ratified contingency framings that trigger on evidence operationalize as the ratified disposition**, not as corrective sub-cycles. The triggering condition surfaces; the disposition activates; no architect ruling-correction required. (Ruling 1 anchor 1 banking)
2. **The architect does not have privileged knowledge that resolves all canonical-source-state corruption modes when the upstream ecosystem does not provide a clearly canonical source.** Forward-tracking to a later cycle when source-state may have improved is the architecturally-correct response; speculative source-supplying without evidence-grounded ratification is refused. (Ruling 1 Option (e) refusal banking)
3. **Fixture-pull dispositions under contingency-triggered cycles delete or hold the fixture entirely rather than restage as stub.** Stub-fixture at corpus-before-code tier would claim architectural commitment without commitment substance; refused on discipline-integrity grounds. (Ruling 2 disposition discipline banking)
4. **Cycle accounting buckets distinguish corrective sub-cycles (architect-error-correction) from contingency-operationalization sub-cycles (pre-ratified contingency triggering on evidence).** Both stay distinct from per-phase counters; the naming distinction preserves architectural integrity of the discipline. (Ruling 4 bucket framing banking)
5. **Pre-ratified contingency framings reduce corrective overhead when ratification anticipates triggering conditions.** The architect-routing surface at operationalization time is narrower than at fresh-architecture time. Future entry packets should include contingency framings for known evidence-dependent surfaces (canonical source state, peer-dependency availability, infrastructure readiness, etc). (Pattern banking)
6. **Pre-ratified disciplines validate their effectiveness at first production operationalization.** Banking the operationalization as exemplar extends the discipline's authority for subsequent cycles. (First-production-operationalization banking)
7. **Architect-side discipline acknowledges bounded knowledge surfaces** (e.g., upstream-ecosystem state, peer-dependency availability) and refuses speculative ratification without evidence. The discipline preserves through honest acknowledgment of bounded knowledge rather than supplying unsupported architectural commitments to resolve cycle pressure. (Architect bounded-knowledge meta-banking)

---

## 5. Sequencing — SME amendment work

Per architect ruling 2026-05-10:

1. ✅ **Now** — Architect rulings issued (this cycle's ratification)
2. ⏳ **SME path-fence-authors the Q-4-C amendments** (in progress):
   - This routing artifact (`phase-4-entry-q-4-c-amendment.md`) — landed
   - Phase 4 entry packet amendments per §3.3 above
   - `tests/corpus/p4_bfo_clif_layer_b.fixture.js` deleted ✅
   - `tests/corpus/manifest.json` entry removed ✅
   - `arc/upstream-canonical/bfo-2020.clif.SOURCE` marked Phase-5-forward-tracked (preserved as SME work-in-progress reference for Phase 5)
   - `phase-4-entry-verification-ritual-report.md` updated for Q-4-C amendment + Cat 8 disposition
   - Phase 5 forward-track item documented in Phase 4 entry packet §6
3. ⏳ **SME runs verification ritual** on the amended Pass 2a artifacts pre-routing per binding-immediately discipline
4. ⏳ **Architect issues brief confirmation** on the amended Pass 2a artifact set (mirrors the brief confirmation cycle for path-fence-authored amendments)
5. ⏳ **Pass 2a commit**: developer commits AMENDED Phase 4 entry packet + 4 corpus-before-code fixtures + manifest entries + verification ritual report + v0.2-roadmap.md (unchanged); remote CI green verification
6. ⏳ **Phase 4 Step 1 begins** — first deliverable per the §7 step ledger; revised step ledger reflects Layer B parity step content shift per the amendment

---

## 6. Cross-references

- Phase 4 entry packet `project/reviews/phase-4-entry.md` (AMENDED + RATIFIED at final ratification 2026-05-10; further AMENDED at this Q-4-C amendment cycle 2026-05-10)
- Phase 4 entry packet §8.2 contingency framing (ratified at AMENDED packet final ratification; operationalized at this cycle)
- Phase 4 entry packet §11 Q-4-C original ratification transcription (amends per Ruling 3)
- Phase 4 entry verification ritual report `project/reviews/phase-4-entry-verification-ritual-report.md` (updates for Q-4-C amendment)
- Aaron-Developer Pass 2a repo-traversal evidence (relayed at Pass 2a vendoring pause 2026-05-10)
- ADR-010 (license-verification-at-vendoring-time discipline; phase-agnostic; holds at Phase 5)
- Phase 3 close `project/reviews/phase-3-exit.md` (corpus-as-contract discipline + Q-Frank-Step9-A precedents informing this cycle's banking-anchor reasoning)
- `project/v0.2-roadmap.md` (v0.2-08 entry unchanged at this cycle; Layer B vendoring forward-tracks to Phase 5, not v0.2)
- Phase 5 ROADMAP `project/ROADMAP.md` Phase 5 section (IAO Information Bridge; will inherit Layer B vendoring + `p4_bfo_clif_layer_b` re-authoring forward-track at Phase 5 entry-cycle authoring)

---

**Q-4-C source-state amendment cycle RATIFIED 2026-05-10. Phase 4 contingency-operationalization sub-cycle counter at 1; closes when Pass 2a commit lands per the amendment. Seven new banked principles forward-fold to Phase 4 exit doc-pass.**

— SME, 2026-05-10 (Q-4-C source-state amendment cycle close)

---

## 7. Brief confirmation cycle close (architect confirmation 2026-05-10)

Per architect Q-4-C amendment brief confirmation cycle 2026-05-10: the six modified artifacts (this artifact + entry packet + manifest + sidecar + verification ritual report + fixture deletion) verified against the four rulings + seven banked principles. **All six correspondence checks pass.** Three new banked principles from the brief confirmation cycle observing the SME's amendment shape as exemplary practice; all three bank verbally + forward-fold to Phase 4 exit doc-pass per architect directive.

### 7.1 Three new banked principles (Q-4-C amendment brief confirmation cycle 2026-05-10)

Verbatim transcription per the §11 verbatim-transcription discipline.

1. **Forward-tracked vendoring sidecars preserve the original ratification shell with explicit forward-tracked status banner.** The shell remains audit-trail artifact for the ratification cycle and inheritance reference for the forward-tracked phase's authoring. Three reasons: (i) the shell represents architect-ratified work from the prior ratification cycle — deletion loses the audit-trail artifact for what the prior ratification authorized; (ii) the forward-tracked phase's entry packet authoring inherits the shell as structural reference (license-verification block format, cited-blocks structure, verified-canonical-values placement) — reducing forward-tracked phase's authoring cost; (iii) the explicit status banner prevents misreading by future readers. (Sidecar SHELL preservation banking)

2. **Verification ritual re-runs on amendment-cycle artifacts produce dedicated re-run report sections with explicit finding counts.** Zero-finding re-runs validate the amendments; non-zero finding re-runs route per the standard disposition cadence (pre-routing resolution or architect routing). The dedicated section preserves audit trail at finding-set granularity. (Re-run report discipline banking)

3. **Contingency-operationalization sub-cycles produce standalone routing-cycle artifacts** (e.g., `phase-N-entry-Q-N-X-amendment.md`) rather than folding into the parent entry packet. The standalone artifact preserves the sub-cycle's distinct audit trail and serves as inheritance exemplar for subsequent contingency-operationalization sub-cycles. (Standalone routing-cycle artifact banking)

### 7.2 Cycle accounting refinement (per architect brief confirmation 2026-05-10)

- **Phase 4 contingency-operationalization sub-cycle counter: 1 → 1 (CLOSED at brief confirmation cycle 2026-05-10; formalization at Pass 2a commit + remote CI green).** Brief confirmation cycle does NOT increment any counter per the architect-banked principle "brief follow-up confirmation cycles for path-fence-authored amendments whose substance was ratified at the prior cycle do not increment cycle-cadence counters" (Phase 3 entry-packet final-ratification cycle banking 2026-05-08; reaffirmed at Q-4-C amendment brief confirmation 2026-05-10).

### 7.3 Pass 2a contents — 8-artifact set per architect required-of-the-Pass-2a-commit list 2026-05-10

Per architect brief confirmation 2026-05-10 "Required of the Pass 2a commit" section, the developer commits the following 8-artifact set:

1. **Phase 4 entry packet AMENDED + RATIFIED** — `project/reviews/phase-4-entry.md` (with Q-4-C amendment folded in)
2. **4 corpus-before-code fixtures (post-pull):**
   - NEW: `tests/corpus/nc_bfo_continuant_occurrent.fixture.js`
   - NEW: `tests/corpus/canary_connected_with_overlap.fixture.js`
   - NEW: `tests/corpus/canary_bfo_disjointness_silent_pass.fixture.js`
   - AMENDED: `tests/corpus/cycle_equivalent_classes.fixture.js`
3. **Manifest** — `tests/corpus/manifest.json` (1 amended entry: `cycle_equivalent_classes` + 3 new entries with `corpusActivationTiming: 'corpus-before-code'`)
4. **Sidecar SHELL preserved (Phase-5-forward-tracked status)** — `arc/upstream-canonical/bfo-2020.clif.SOURCE`
5. **Q-4-C amendment routing artifact** — `project/reviews/phase-4-entry-q-4-c-amendment.md` (this artifact)
6. **Phase 4 entry verification ritual report (with §4.5 re-run section)** — `project/reviews/phase-4-entry-verification-ritual-report.md`
7. **v0.2-roadmap.md (unchanged from prior cycle authoring)** — `project/v0.2-roadmap.md`
8. **Deletion** — `tests/corpus/p4_bfo_clif_layer_b.fixture.js` (git history preserves)

Standard commit message format per architect brief confirmation:

```
docs: Phase 4 entry packet RATIFIED + Q-4-C contingency operationalized (Layer B → Phase 5)
```

Body references per architect brief confirmation:

- Architect final ratification 2026-05-10 (prior cycle)
- Architect Q-4-C amendment brief confirmation 2026-05-10 (this cycle)
- §8.2 contingency operationalization per Option (d) + (d-1) per the architect rulings
- Phase 5 forward-track manifest item for Layer B vendoring + `p4_bfo_clif_layer_b` re-authoring
- Cycle accounting: Phase 4 entry-cycle counter at 2 (closed); Phase 4 contingency-operationalization sub-cycle counter at 1 (closes when this commit lands + CI green)

Standard close-commit cadence applies: remote GitHub Actions CI green verification before Phase 4 Step 1 begins.

### 7.4 What architect explicitly NOT authorizing (per brief confirmation 2026-05-10)

1. No further amendments to the Q-4-C amendment cycle artifacts. The amendments are stable; the artifact set is ready; the developer commits.
2. No re-introduction of `p4_bfo_clif_layer_b` in Phase 4 absent fresh evidence per the prior cycle's Ruling 1 + Option (e) refusal framing.
3. No expansion of Pass 2a contents beyond the 8 artifacts named. Further additions route as their own architect cycles.
4. No bypassing of the §6.1 (NEW) Phase 5 forward-track inheritance section. Phase 5 entry packet authoring depends on the inheritance manifest's accuracy; the section must persist through Pass 2a commit.
5. No silent omission of the verbal-pending bankings. The 7 new bankings from the prior cycle + 3 new bankings from this cycle (10 total) formalize at Phase 4 exit doc-pass per the verbal-pending discipline.

### 7.5 Sequencing reaffirmed (per architect brief confirmation 2026-05-10)

In order:

1. **NOW (closed)** — Brief confirmation issued on Q-4-C amendments (this cycle close)
2. **Pass 2a commit** — developer commits 8-artifact set per the contents above; remote CI green verification
3. **Phase 4 Step 1 begins** — first deliverable per the §7 step ledger (revised per Q-4-C amendment); BFO ARC content lifter integration is the load-bearing Step 1 deliverable
4. **Phase 4 implementation Steps 2-8** per the SME-proposed step ledger; standard cycle cadence applies for any mid-phase escalations

---

**Q-4-C amendment brief confirmation cycle CLOSED 2026-05-10. Phase 4 contingency-operationalization sub-cycle CLOSED at brief confirmation (formalization at Pass 2a commit + remote CI green). 3 new banked principles forward-fold to Phase 4 exit doc-pass (10 total from Q-4-C source-state amendment cycle + brief confirmation cycle combined). Pass 2a UNBLOCKED — developer commits the 8-artifact set per the architect-ratified contents.**

— SME, 2026-05-10 (Q-4-C amendment brief confirmation cycle close)
