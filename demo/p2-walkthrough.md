# Phase 2 Demo — Stakeholder Presentation Script

Speaker script for live-presenting [demo_p2.html](demo_p2.html). Companion to (not replacement for) the demo's on-screen prose.

**Audience:** technically-literate stakeholders (eng leadership, partner engineers, ontology consumers). No prior OFBT knowledge assumed; comfort with "OWL," "FOL," and "round-trip" as words is sufficient.

**Run-time budget:** 20–25 minutes presentation + Q&A (Case A 5 min, Case B 5 min, Case C 5 min, framing/closing/deferred 5–10 min).

**Per-phase disposability:** mirrors `demo_p2.html`'s lifecycle. Phase 3 exit retires this script and ships `p3-walkthrough.md`.

---

## 0. Pre-flight checklist (presenter, before audience joins)

- [ ] Pick venue: deployed Pages URL **or** local `npx serve gh-pages-deploy/`. Deployed is the honest default; local is the fallback if Pages deploy is mid-flight.
- [ ] Open `demo_p2.html` in a clean browser tab. Scroll once top-to-bottom to confirm all three fixtures load (panels show JSON, not "Loading fixture…").
- [ ] DevTools console **closed** for the talk; opened only if a panel misbehaves.
- [ ] Have [demo_p1.html](demo_p1.html) reachable in a second tab — useful if anyone asks "what shipped before this?"
- [ ] Backup: screenshots of expected Case A + Case B + Case C output in case the live demo fails (network, bundle import, fixture 404).
- [ ] Know the most recent commit hash on `origin/main` — useful for grounding "this is what's running right now."

If any panel shows "Loading fixture…" indefinitely, the GitHub Pages staging step is missing the fixture file. Stop, switch to the local-served fallback, and route a chore to extend `.github/workflows/pages.yml`.

---

## 1. Opening + framing — 2 min

**Screen:** demo_p2.html, top of page (header + "The case" section visible).

> OWL is the standard description-logic language for ontologies — what most consumer tools speak. FOL — first-order logic — is the more expressive substrate underneath. OFBT is a bidirectional translator between the two: lift OWL up to FOL, then project FOL back down to OWL. Phase 1 shipped the lifter. Phase 2, today, ships the projector and closes the round-trip.

> The point of bidirectional is interoperability: tools on either side can compose without surprises. The point of *correctness* is that the round-trip preserves what the original ontology *meant*, not just what it *looked like*.

**Action:** scroll to "The case" section, point to the two-bullet list.

> Two arguments today. One — internal canary: the projector reconstructs the right shape, AND the test suite proves the wrong shape's absence. Two — external ground truth: a published BFO 2020 ontology lifted, projected back, and parity-checked against the W3C's canonical CLIF axiomatization of OWL.

> Why both? Internal canary alone can't catch divergence from the standard — your tests can drift with your code if you wrote them after. External parity alone can't catch construct-conflation bugs that happen to land on a different but still-valid OWL shape. Both disciplines together catch failure modes neither catches alone.

**Anticipated:** *What's CLIF?* → Common Logic Interchange Format, ISO/IEC 24707-2007. The standard serialization for first-order logic. The W3C's CLIF axiomatization of OWL is the published authoritative semantics for OWL constructs.

---

## 2. Phase 2 implementation state — 1.5 min

**Screen:** "Phase 2 implementation state at this build" — three callouts (shipped Steps 1–4a; additional Steps 4b–8; deferred to Phase 3+).

> Phase 2 shipped in nine sequenced sub-steps. Today's build includes everything in the green callouts:

- **Direct Mapping** — single-axiom and pair-matched OWL constructs (SubClassOf, EquivalentClasses, InverseOf, property characteristics, domain/range, ABox assertions).
- **Class-expression reconstruction** — recursive rebuild of intersection, union, complement, someValuesFrom, allValuesFrom, hasValue inside SubClassOf consequents.
- **Cardinality matching** — `min`/`max`/`exact` cardinality projects as native OWL Restriction.
- **Strategy router with tiered fallthrough** — every axiom gets an explicit strategy attribution: Direct Mapping → Property-Chain Realization → Annotated Approximation.
- **Property-Chain Realization** — chain detection with always-emit `regularity_scope_warning` Recovery Payload note per architect Q-Step6-1 ruling. v0.1 Realization emits the `ObjectPropertyChain` axiom **and** the warning unconditionally; Phase 4 entry activates `regularityCheck(A, importClosure)` against loaded ARC modules' import closure and clears the warning for regularity-confirmed chains. The v0.1 form is the architect-ratified always-emit-with-loss-marker Realization (not deferred-Realization); see Q&A below for the precise distinction.
- **Annotated Approximation** — FOL shapes that don't fit OWL 2 DL get structurally-valid OWL output plus Loss Signatures documenting what didn't translate.
- **`roundTripCheck()`** — the parity-criterion contract from the spec, callable as one function.
- **Parity-canary harness + 12 corpus fixtures** — the same inputs the test suite asserts against.

**Beat. Then point to the warn-tone callout.**

> What's deferred — and we'll come back to this — is the validator and `evaluate()`, full ARC-content inference, and the lifter's chain support. Phase 2 ships the round-trip story. Phase 3 ships what queries it.

---

## 3. Case A — Class-expression reconstruction canary — 5 min

### 3.1 The challenge — 1 min

**Screen:** Case A header + first lead paragraph + "Why this matters for stakeholders" callout.

> OWL has three flavors of class expression involving a property and a class. They mean very different things:
>
> - **someValuesFrom** — "every Parent has at least one Person child."
> - **allValuesFrom** — "every Parent's children are all Persons (if they have any)."
> - **hasValue** — "every Parent has Bob specifically as a child."
>
> When these lift to FOL, they all involve quantifiers and atoms in superficially-similar shapes. A naive projector that's shape-blind can collapse one to another — emit syntactically-valid OWL that means something different than what came in. Downstream queries return wrong answers silently. That's the failure mode this canary catches.

### 3.2 Input — 30 sec

**Screen:** A.1 panel — Input OWL ontology (populated on page load).

> Three SubClassOf axioms. Same surface depth, different restriction kinds. Pulled from `tests/corpus/p1_restrictions_object_value.fixture.js` — the same fixture the test suite asserts against. Single source of truth.

### 3.3 Run — 30 sec

**Action:** click **"Run owlToFol → folToOwl"** in A.2.

> I'm running the round-trip live. The lifter converts each SubClassOf to a universally-quantified implication in FOL. The projector walks the FOL back to OWL.

**Pause** for panels to populate (sub-second).

### 3.4 Lifted FOL — 1 min

**Screen:** A.3 panel populated.

> Here's the intermediate FOL. Three universal implications — one has an existential in the consequent (that's the someValuesFrom shape), one has a nested universal (allValuesFrom), one has an atom against a constant (hasValue). Different patterns. Pattern-match-distinguishable.

### 3.5 Projected OWL — 1 min

**Screen:** A.4 panel populated.

> Here's the round-trip output. Three SubClassOf axioms, each with a Restriction of the matching kind. Modulo prefix bookkeeping and ontology-IRI placeholders, this is shape-equal to the input. The projector recursively rebuilt each class expression from its FOL pattern.

### 3.6 Right shape present + absence of known failure-mode patterns — 1 min

**Screen:** A.5 + A.6 results panels (green check marks expected).

> A.5 confirms each input axiom round-trips to the matching restriction kind. A.6 is the silent-failure guard for **known** wrong shapes: it asserts that no someValuesFrom slid to allValuesFrom, no existential filler became an intersection, no hasValue lost its named individual. Both panels green — **stub-validated**.

> Important calibration point on what "green" means here. The verdicts are validated by the Phase 2 stub-evaluator harness: bounded-Horn-resolution sufficient for structural shape verification but not for non-Horn entailments, deeper proof trees beyond the resolution bound, or model-theoretic equivalence. Phase 3 entry packet inherits the per-canary publication commitment per Q-Frank-4 ruling 2026-05-07 — each Phase 2 canary is re-exercised against the real `evaluate()` and the per-canary outcome (survived / failed-revealed-stub-limit / not-yet-reactivated) is published.

> Important framing point — A.6 is a **regression-density check**, not a soundness argument. It catches the specific failure modes we thought to look for; it does not certify that no other wrong shape is possible. A full soundness argument over the OWL 2 DL grammar is not a v0.1 deliverable. The canary is strictly better than no canary, and the listed failure modes are exactly the silent-failure surface a logic-stakeholder would test first. The discipline for extending the canary as new failure modes are discovered is documented in the SME canary-extension note (see Q&A).

**Anticipated:** *What if A.6 fired red?* → That would be a real regression. CI would catch the same regression on the same commit; the demo would surface it visually too. The two sources of truth — test runner assertions and demo visual output — fail together, not separately. We don't paper over a red panel.

**Anticipated:** *Why is the wrong-shape check separate from the right-shape check?* → Defense in depth. A test that only asserts "the expected shape is present" passes even if multiple shapes are emitted. An absence-of-known-failure-modes assertion catches the case where the projector emits the right shape *and also* a wrong shape, or where it emits a structurally-similar-but-semantically-different shape — for the patterns the canary author thought to encode.

**Anticipated:** *Doesn't "wrong shape absent" claim more than "absence of known failure modes"?* → Yes, which is why the panel was renamed. The earlier framing implied a soundness argument; the corrected framing matches what the canary actually establishes. Per the architect-banked principle "claims must match what the engineering establishes, no more" (Q-Frank-4 ruling 2026-05-07).

---

## 4. Case B — BFO/CLIF Layer A structural round-trip parity — 5 min

### 4.1 The challenge — 1 min

**Screen:** Case B header + "Layer A vs Layer B" framing callout.

> Internal canary discipline can be fooled by tests retrofitted to implementation. If you wrote your tests after writing your translator, both can drift together away from what the standard actually says, and your suite is still green.

> External ground truth fixes that. We compare against the W3C's canonical CLIF axiomatization of OWL — that's published, it's not ours, we don't get to change it. If our round-trip produces FOL that diverges from the canonical CLIF, our parity panel catches it.

**Action:** point to the Layer A / Layer B callout.

> Layer A is what OWL constructs *mean* — what `SubClassOf`, `Transitive`, `InverseOf` reduce to in FOL. Layer B is specific ontology *content* — BFO's `Continuant`, `Occurrent`, ternary parthood. Today is Layer A only. Layer B arrives Phase 4 with the BFO 2020 ARC module.

### 4.2 Input — 30 sec

**Screen:** B.1 panel populated.

> BFO 2020 standard-OWL subset. 8 axioms — 5 SubClassOf, 1 DisjointWith, 1 Transitive, 1 InverseOf. Real BFO classes: `Continuant`, `Occurrent`, `IndependentContinuant`, `MaterialEntity`. Same fixture as the Phase 1 Layer A demo, now exercised through Phase 2's projector.

### 4.3 Run — 30 sec

**Action:** click **"Run owlToFol → folToOwl"** in B.2.

> Same protocol — lift, then project.

### 4.4 Lifted FOL: 8 → 9 — 1 min

**Screen:** B.4 panel populated.

> Notice: 8 input OWL axioms become 9 FOL axioms. The InverseObjectProperties axiom decomposes into a bidirectional implication pair — two FOL axioms encoding one OWL axiom. That's a load-bearing detail: the projector has to recognize the pair and re-collapse it on the way back.

### 4.5 Projected OWL: back to 8 — 30 sec

**Screen:** B.4 panel.

> And the projection is back to 8. Pair-matching identified the bidirectional `part_of` ↔ `has_part` implications and emitted a single InverseObjectProperties. The other axioms project as straight Direct Mapping.

### 4.6 Structural round-trip parity panel — 30 sec

**Screen:** B.5 results.

> Eight green checks. Each input axiom found a structurally-equivalent counterpart in the round-trip output. **Stub-validated** per the same calibration as §3.6: bounded-Horn-resolution covers structural verification; Phase 3 reactivation publishes per-canary outcomes against the real `evaluate()`.

### 4.7 Layer A CLIF parity panel — 1.5 min

**Screen:** B.6 results — grouped panels with CLIF text + citations + Verified badges.

> The deeper check. For each input axiom, the canonical CLIF block from the W3C OWL axiomatization paired with our lifted FOL. Where multiple input axioms exercise the same OWL construct — like the five SubClassOf axioms here — they all cite the same canonical block.

> Each badge says "Verified," meaning a Subject Matter Expert hand-checked the FOL against the CLIF and signed off. The badges aren't hardcoded into this HTML — they render at runtime from the fixture file's `verificationStatus` field. If the fixture flipped a row from Verified back to `[VERIFY]`, the badge would change without any change to the demo HTML.

**Anticipated:** *How do we know the CLIF file we're checking against is what it claims to be?* → Vendored under CC BY 4.0; license verified at vendoring time per ADR-010; SHA-256 of the source pinned in the SOURCE sidecar; LICENSE SHA-256 + canonical commit recorded. The verification block lives at `arc/upstream-canonical/owl-axiomatization.clif.SOURCE`. If you change one byte of the vendored file, CI will surface the SHA-256 mismatch.

**Anticipated:** *Why doesn't your lifted FOL include the typing predicates `(Class X)` and `(OWLObjectProperty R)` I see in the canonical CLIF?* → Encoding choice per ADR-007 §10 (promoted from banked to ratified text per architect Q-Frank-2 ruling 2026-05-07; the soundness statement names the implicit-typing assumption explicitly and bounds its scope to OWL 2 DL inputs). They're recoverable from the projection's structural output. The round-trip is sound w.r.t. OWL semantics for v0.1; meta-vocabulary reasoning over Class / OWLObjectProperty as predicates is out of scope and is documented as such.

---

## 5. Case C — Lossy round-trip (Annotated Approximation strategy) — 5 min

### 5.1 Why this case exists

**Screen:** Case C header + "Why Case C exists" callout.

> Cases A and B exercise round-trip-clean fixtures — every input axiom maps cleanly to OWL 2 DL. That's exactly the easy half of OFBT's bidirectional value proposition. The hard half — and the load-bearing differentiator — is what happens when an input axiom *exceeds* OWL 2 DL expressivity. Real ARC content from BFO 2020, IAO, CCO, and OFI deontic will exercise that surface heavily.

> Case C makes the Annotated Approximation strategy visible. Stakeholders see what the fallback OWL output looks like, what the Loss Signature ledger contains, what the Recovery Payload preserves, and how a downstream consumer would re-evaluate against the FOL substrate. This is the case Frank's stakeholder critique flagged as missing from the original demo (his §6); per architect Q-Frank-6 ruling 2026-05-07, it ships now.

### 5.2 The two trigger paths in one fixture

**Screen:** C.1 input panel.

> Two FOL axioms, exercising both Annotated-Approximation-routing trigger paths simultaneously:
>
> - **Axiom 1:** `∀x. Person(x) → ¬KnownProfession(x)` — classical negation over an unbound predicate. Triggers `naf_residue` (severity rank 2). The OWL-side translation cannot natively express "every Person is not a KnownProfession" without committing to a closed-world reading of KnownProfession; OFBT's open-world semantics push this to Annotated Approximation.
> - **Axiom 2:** `unfamiliarBond(alice, bob)` — binary atom over a predicate IRI outside any loaded ARC module. Triggers `unknown_relation` (severity rank 5). OFBT cannot certify the predicate's semantics without an ARC entry; the projector emits the assertion structurally with a Loss Signature noting the unknown-relation status.

> Two trigger paths, one input. Demonstrates multi-Loss-Signature emission plus the frozen severity-ordering contract from API §6.4.1.

### 5.3 Run the projection

**Action:** click **"Run folToOwl on lossy FOL input"** in C.2.

> Notice this case is projector-direct: no `owlToFol` step. The fixture's input is FOL axioms array directly, exercising what happens when a downstream consumer hands OFBT FOL that exceeds OWL 2 DL.

### 5.4 Annotated Approximation OWL output

**Screen:** C.3 panel populated.

> Each input axiom produced an OWL annotation per spec §6.1.3 carrying three load-bearing fields: `ofbt:originalFOL` (machine-readable FOL string), `ofbt:roundTripID` (content-addressed identifier per ADR-011), and `ofbt:strategy: "annotated-approximation"`. A consumer that doesn't read the audit artifacts sees the annotation; a consumer that does read them recovers the FOL substrate.

### 5.5 Loss Signature ledger

**Screen:** C.4 results — multiple panels, one per Loss Signature.

> Four Loss Signatures emitted on this input. The projector emits **one `unknown_relation` LossSignature per unique uncatalogued predicate** (per-predicate, not per-axiom), so this two-axiom input produces:
>
> - 1 `naf_residue` (from the negation in axiom 1)
> - 3 `unknown_relation` (one each for `Person`, `KnownProfession`, `unfamiliarBond`)
>
> Each carries a content-addressed `@id` (`ofbt:ls/<sha256-hex>` per ADR-011), a `lossType` field, severity rank, the original FOL form, and machine-readable scope notes.

> The frozen `LOSS_SIGNATURE_SEVERITY_ORDER` exported from API §6.4.1 means consumers who request severity-ordered output get all `naf_residue` (rank 2) entries before any `unknown_relation` (rank 5) entries. C.6 below verifies this rank-monotonic invariant holds in the emitted ledger.

> **Honest note for stakeholders.** The fixture's structured `expectedLossSignatureCount` field claims `2`; the actual emission is `4`. The fixture's prose docstring more correctly says "at least 2." The implementation's per-unique-predicate semantics is correct; the fixture's structured field is stale. Reconciliation is forward-tracked to Phase 3 entry packet authoring per Q-Frank-6 ruling 2026-05-08 Track 2 — fixtures with `Verified` status get architect-mediated update cycles, not silent SME edits. Same class of fixture-vs-implementation gap as the `strategy_routing_no_match` Step 9.1 deferral.

### 5.6 Recovery Payload set

**Screen:** C.5 results.

> Recovery Payloads preserve the FOL state for downstream re-lifting. Each carries a content-addressed `@id` (`ofbt:rp/<sha256-hex>` per ADR-011), the original FOL axiom (so the lifter can reconstruct it on re-lift — that's the load-bearing reversibility claim), and the strategy that produced the payload.

> The bidirectional translator's claim is structural: lift → approximate → annotate → recover gives back the same FOL structure modulo the recorded approximation. The semantic claim Phase 3 will make on top of that is: every entailment of the FOL state is preserved through the round trip.

### 5.7 Strategy attribution + severity-ordering contract verification

**Screen:** C.6 results panel — four green check marks plus an honest-divergence callout.

> Four assertions verify the projector behaved per the implementation's emission contract:
>
> 1. **At least 2 Loss Signatures emitted** (fixture's prose contract; actual is 4 because the projector emits per unique uncatalogued predicate).
> 2. **`naf_residue` lossType present** in the ledger.
> 3. **`unknown_relation` lossType present** in the ledger.
> 4. **Severity ordering preserved**: in the sorted ledger, all `naf_residue` (rank 2) entries precede all `unknown_relation` (rank 5) entries per `LOSS_SIGNATURE_SEVERITY_ORDER` — rank-monotonic invariant.
> 5. **All `@id` fields match `ofbt:ls/<sha256-hex>`** per ADR-011.

> A green-checkmark panel does NOT mean "matches the fixture's structured `expectedLossSignatureCount` field" — that field is stale. It means the implementation behaved correctly per its emission semantics and the fixture's prose contract. The honest-divergence callout below the assertions surfaces this gap explicitly. If any of these assertions fired red, that's a real regression — the demo surfaces it visually; CI catches it on the same commit. Same discipline as Cases A and B.

> **Why we ship this divergence visibly instead of papering over it.** Per architect-banked principle "claims must match what the engineering establishes, no more" (Q-Frank-1 ruling 2026-05-07): the demo's job is to show what the implementation actually does, not to match a stale fixture field. The fixture-vs-implementation reconciliation is real follow-on work; it's not a problem the demo can or should hide. Track 2 of Q-Frank-6 ruling 2026-05-08 routes the fixture update to Phase 3 entry packet authoring (architect-mediated since the fixture is `Verified`).

### 5.8 Downstream consumer protocol

**Screen:** C.7 prose section.

> The most important part of Case C for stakeholders. A consumer ingesting Annotated Approximation output has three paths:
>
> 1. **Treat the OWL annotation as the canonical artifact.** OWL-only tooling consumes it as-is. The consumer accepts the annotation captures FOL content the OWL syntax cannot natively express; downstream OWL reasoners treat it as opaque metadata.
> 2. **Read the Loss Signature ledger.** The ledger names exactly what was approximated, with `lossType` and `scopeNotes` fields. A Phase-3-warning surface (per Fandaws Consumer Requirement §7.1's honest-admission discipline) translates Loss Signatures into "this axiom required approximation" warnings for the user.
> 3. **Use the Recovery Payload to re-lift to FOL.** The payload preserves the original FOL form. A consumer with FOL-capable inference (Phase 3+'s `evaluate()`) re-lifts the annotation, recovers the FOL state, and reasons over the substrate directly. Nothing is lost; everything is recoverable.

**Anticipated:** *Is Annotated Approximation a fallback strategy or a first-class strategy?* → First-class. Per spec §6.1.3 and §6.2's tiered fallthrough, Annotated Approximation is one of three projection strategies (Direct Mapping, Property-Chain Realization, Annotated Approximation). It's the strategy that handles FOL shapes exceeding OWL 2 DL — which is exactly the case where bidirectional translation matters most. Demoting it to "fallback" would understate its role.

**Anticipated:** *What's the structural claim Case C makes vs. what it doesn't?* → Per the architect-banked principle from Q-Frank-1 ruling: the structural claim is exactly that lift+project+annotation+recovery preserves FOL structure modulo recorded approximation. The semantic claim — that re-lifted FOL is logically equivalent to the original FOL under classical-FOL evaluation — requires Phase 3's real `evaluate()` plus the per-canary reactivation discipline (Q-Frank-4 ruling 2026-05-07). Case C demonstrates structural; Phase 3 will demonstrate semantic.

**Anticipated:** *Why is `unknown_relation` rank 5 instead of rank 1 or rank 2?* → The `LOSS_SIGNATURE_SEVERITY_ORDER` is frozen per API §6.4.1. The order encodes architect-banked judgment about consumer-impact severity: `naf_residue` and `closure_truncated` are bounded losses (the FOL substrate captures them); `unknown_relation` is a deeper concern because it indicates the projector encountered semantics it cannot certify against any loaded ARC module. The ordering is what consumers sort by when triaging.

---

## 6. What's deferred — 2 min

**Screen:** "What Phase 2 does NOT yet do" section.

> Honest scope. What Phase 2 doesn't yet do:

- **Validator + `evaluate()`** — Phase 3. Today's parity-canary harness uses a bounded-Horn-resolution stub for corpus tests. The real `evaluate()` ships richer semantics in Phase 3.
- **`checkConsistency()` + No-Collapse Guarantee** — Phase 3. The third leg of the validation pipeline.
- **ARC-content inference** — Phases 4–7. BFO 2020 (Phase 4); IAO information bridge (Phase 5); CCO realizable-holding, mereotopology, measurement, aggregate, organizational, deontic (Phase 6); compatibility shim, bundle budgets, coverage matrix (Phase 7).
- **Regularity-check upgrade** — Phase 4 entry. Today's chain projection always emits a `regularity_scope_warning` Recovery Payload note. Phase 4 activates `regularityCheck(A, importClosure)` against loaded ARC modules; chains regularity-confirmed under import closure emit without the warning.
- **Lifter ObjectPropertyChain support** — Phase 3 or Phase 4. Today's chain detection is projector-only.
- **Six of eight loss-signature trigger-matchers** — phased in with their domains. Two ship today (`naf_residue`, `unknown_relation`); the others arrive at the phase that introduces the relevant content.

> This list is on the page for a reason. Structural round-trip parity is the foundation, not the destination. The whole stack — lift, project, evaluate, check-consistency, ARC inference — has to compose without contradicting itself across phases. Phase 2 ships the projector and certifies that lift+project+re-lift produces the same FOL state modulo recorded losses; Phase 3 ships what queries it (the real `evaluate()`) and lets us strengthen the claim toward semantic round-trip parity.

---

## 7. Closing — 1 min

> Three correctness arguments today. Internal canary on class expressions (Case A): right shape present, absence of known failure-mode patterns confirmed. External CLIF parity on the BFO Layer A subset (Case B): lifted FOL matches the W3C canonical axiomatization. Lossy round-trip via Annotated Approximation (Case C): four Loss Signatures emitted (one naf_residue plus three unknown_relation per the projector's per-unique-predicate emission semantics) with the frozen severity ordering preserved as a rank-monotonic invariant; Recovery Payloads preserve the FOL state for downstream re-lifting. All structural assertions green. **Structural** round-trip parity established for the v0.1 fixture corpus per spec §8.1 — content equivalence at the lifted-FOL level modulo Loss Signatures, with the load-bearing Annotated Approximation strategy now visible end-to-end. Stronger semantic senses (model-theoretic, axiomatic, entailment-preserving) are explicitly Phase 3+ scope; the Q-Frank-4 publication commitment means each Phase 2 stub-validated canary will be re-exercised against the real `evaluate()` and the per-canary outcome published.

> Phase 3 is next: validator and `evaluate()` give us answer-equivalence on top of shape-equivalence. After that, ARC content drives real inference against published ontologies.

> Questions.

---

## 8. Anticipated Q&A

**Q: Why a per-phase demo file? Why not one growing demo?**
A: Each per-phase demo captures what the implementation supports at that phase's exit. The architect's per-phase disposability convention says earlier demos remain accessible as historical artifacts of the build sequence, not continuously-maintained references. The shared CSS and deploy workflow are maintained across phases; only the per-phase HTML is disposable.

**Q: How big is the test corpus? What's covered?**
A: 27 fixtures total — 15 Phase 1 (lifter coverage) + 12 Phase 2 (projector coverage including strategy-routing canaries, parity canaries, and a defense-in-depth pair). Manifest at `tests/corpus/manifest.json`. The CI step `check-corpus-manifest` flags drift.

**Q: What if a fixture status changes from Verified to something else?**
A: The badge in the parity panel re-renders from the fixture's `verificationStatus` field at next page load. There's no manual demo-side update path; the demo cannot drift from what the fixture asserts.

**Q: Are you using LLMs anywhere in the translation pipeline?**
A: No. The kernel (`src/kernel/`) is pure deterministic computation — no `Date.now()`, no `Math.random()`, no network, no LLMs. Spec-test-enforced. The translator is rule-based pattern matching. LLMs were used during development for human-author productivity, not in the runtime.

**Q: What's the licensing posture?**
A: Project license per repo root. Vendored canonical sources have their own licenses recorded in SOURCE sidecars with SHA-256 verification. The W3C OWL CLIF axiomatization specifically is CC BY 4.0 — a Phase 2 entry verification ritual surfaced and corrected an earlier unverified BSD-3-Clause assertion (ADR-010). The corrective discipline is now banked: every vendored canonical source's license is verified at vendoring time.

**Q: How do you handle constructs that aren't in OWL 2 DL?**
A: Annotated Approximation strategy. The projector emits structurally-valid OWL with a structural annotation pointing to the original FOL string and a round-trip identifier. Audit artifacts called Loss Signatures document what didn't translate. Recovery Payloads preserve the original FOL state so a downstream consumer can re-evaluate against the FOL substrate. Today's demo is round-trip-clean fixtures only; the Annotated Approximation surface is exercised in dedicated corpus fixtures (`p2_lossy_naf_residue`, `p2_unknown_relation_fallback`, `strategy_routing_annotated`) — not on this demo page.

**Q: What's "structural round-trip parity," precisely?**
A: Per spec §8.1: the v0.1 contract is **structural** round-trip parity — content equivalence at the lifted-FOL level modulo the Loss Signature ledger. Concretely: an OWL ontology lifted to FOL and projected back to OWL produces an OWL ontology that is structurally equivalent to the input modulo serialization placeholders, OR — for fixtures classified as `reversible-regime` — equivalent modulo Recovery Payloads that preserve the FOL state for re-lifting. `roundTripCheck()` from API §6.3 wraps this contract as a callable function. The "structural" qualifier is load-bearing: the contract does **not** certify model-theoretic equivalence (every model of the input is a model of the round-tripped graph and vice versa), axiomatic equivalence (`input ⊢ round-tripped` and vice versa under classical FOL deduction), or general entailment-preservation. Those stronger semantic senses ship in v0.2+ when Phase 3's real `evaluate()` plus the per-canary reactivation discipline (Q-Frank-4 ruling 2026-05-07) gives us the evaluator-witnessed certificates.

**Q: What about consistency? Can your translator produce contradictory FOL from valid OWL?**
A: That's the No-Collapse Guarantee — Phase 3. The translator must not collapse OWL's intended distinctions when it crosses to FOL, and the validator must surface any genuine contradictions in the lifted FOL rather than silently accepting them. Today's Phase 2 demo shows shape preservation; Phase 3 will show consistency preservation.

**Q: What happens if the lifter and projector disagree on a construct?**
A: Structural round-trip parity catches it. If the projector emits a different OWL shape than the input, B.5's parity panel goes red. If the projector emits the right OWL shape but the lifted FOL diverges from the canonical CLIF, B.6's Layer A parity panel goes red. The two panels are not redundant — they catch different failure modes. (Both panels operate at the structural level — content equivalence on the lifted-FOL state. Neither certifies model-theoretic or general entailment-preserving equivalence; Phase 3's evaluator surfaces the stronger checks.)

**Q: Phase 2 is "closed" — what does that mean operationally?**
A: All Phase 2 entry-packet deliverables are committed and pushed; the exit packet is ratified; the roadmap is updated; the demo is deployed. The single open carryover is documented in the Phase 3 entry packet inheritance list (e.g., re-exercising stub-evaluated parity canaries against the real `evaluate()` once it ships).

**Q: How does the absent-shape canary get extended when new failure modes are discovered?**
A: SME-authored discipline (banked here per Q-Frank-4 ruling's "absence of known failure-mode patterns" framing):

1. **Trigger.** A new failure mode is discovered when (a) a test against real-world ARC content produces a wrong-shape output that A.6 didn't cover, (b) a stakeholder review names a class-expression conflation pattern not in the current canary, or (c) a Phase 3+ evaluator surfaces a structural divergence the v0.1 canary missed.
2. **Author.** SME path-fence-authors a new entry in the canary fixture's `forbiddenPatterns` array (or analogous fixture-level mechanism). The pattern is encoded structurally (`assertForbiddenPatterns`-style) and accompanied by a one-line rationale: what the wrong shape looks like, what the right shape would have been, why a shape-blind projector might emit it.
3. **Verify.** SME checks that the new pattern would have been emitted by the failure-mode it captures (i.e., the canary actually catches the bug it was authored against). The verification is a deliberately-broken-projector mutation test, not a passing run alone.
4. **Bank.** The new pattern lands in the regression suite. The Phase-N exit packet's deferred-with-structural-requirements bucket records the pattern's discovery context (which fixture/stakeholder/evaluator surfaced it) so the canary's growth is auditable.
5. **Re-frame.** The A.6 panel still says "absence of known failure-mode patterns" — the canary's growth doesn't change the framing's accuracy. v0.1 never claims soundness; it claims known-pattern-density coverage.

This discipline is portable across phases — Phase 3 will extend the canary for evaluator-surfaced shapes; Phase 4 will extend for ARC-content-driven shapes.

**Q: What does "Property-Chain Realization" actually do in v0.1, and what changes at Phase 4?**
A: The architect ratified at Q-Step6-1 (and reaffirmed at Q-Frank-3) that v0.1 Property-Chain Realization is *realization-with-loss-marker*, not *deferred-realization*. Concretely:

- **What v0.1 emits for every detected chain:** the OWL `ObjectPropertyChain` axiom **plus** a Recovery Payload carrying a `regularity_scope_warning` note. The warning is **unconditional** in Phase 2 because the regularity check itself ships at Phase 4 entry — v0.1 cannot certify any specific chain's regularity, so it conservatively warns on all of them.
- **What Phase 4 entry adds:** the `regularityCheck(A, importClosure)` machinery that evaluates each chain against loaded ARC modules' import closure per spec §6.2.1. Chains regularity-confirmed under that check emit the `ObjectPropertyChain` axiom **without** the warning; chains the check cannot certify keep the warning.
- **Why the v0.1 form is still called Realization, not Detection:** the OWL `ObjectPropertyChain` axiom IS emitted (that's realization). The warning is a *loss marker* indicating the v0.1 system cannot certify regularity, not a flag that the realization didn't happen. A consumer reading the projected OWL sees the chain axiom and can use it; the warning tells the consumer to handle the chain conservatively until Phase 4's regularity check is available.
- **Stakeholder reading:** if a logic-savvy reader prefers the term "Property-Chain Detection (Realization deferred to Phase 4)," that reading is technically defensible but the architect ruled the term "Realization" stays — the always-emit-warning behavior is realization with documented scope, not deferred work. The parenthetical clarification on this page makes the v0.1 limitation/Phase 4 resolution explicit at the user-facing surface.

---

## 9. Presenter notes (out-of-band)

- **If a panel shows "Loading fixture…" indefinitely:** the deployed Pages staging step is missing the fixture. Switch to the local fallback (`npx serve gh-pages-deploy/`) and route a chore to extend `.github/workflows/pages.yml`.
- **If A.6 (absence of known failure-mode patterns) fires red:** STOP. Do not paper over. CI would catch the same regression; the demo is honest about it. Acknowledge it, capture the commit hash, route to engineering as a real bug.
- **If B.6 (Layer A parity) shows a `[VERIFY]` badge instead of `Verified`:** that means a SubClassOf row's `verificationStatus` was rolled back. Acknowledge it as in-progress SME work, point to `tests/corpus/p1_bfo_clif_classical.fixture.js` for current state.
- **If C.4 emits zero or one Loss Signature:** STOP. The implementation should emit at least 2 (one naf_residue + at least one unknown_relation). One or zero indicates a trigger path was silently dropped — exactly the failure mode Frank's stakeholder critique flagged at §6. Same response as A.6: acknowledge, capture commit, route as a real bug.
- **If C.4 emits a different count than 4 (e.g., 2 or 5):** the implementation may have changed since 2026-05-08 (this walkthrough was authored when the projector emitted 4 LS for this input — 1 naf_residue + 3 unknown_relation per unique uncatalogued predicate). Cross-check against `src/kernel/projector.ts emitUnknownRelationsIfApplicable`. If the projector's per-predicate semantics changed, update this walkthrough's §5.5 narration. The C.6 honest-divergence note already explains the per-predicate emission mechanism; a count change reflects either a fixture update or a projector emission-rule change.
- **If C.6 (severity ordering) fires red:** the frozen `LOSS_SIGNATURE_SEVERITY_ORDER` contract was violated. This is an API §6.4.1 commitment; not a presentation issue. Same protocol.
- **If the bundle import fails:** browser console will show the error. Common causes: (1) `dist/bundles/` not built locally — run `npm run build && node esbuild.config.js`; (2) Pages deploy mid-flight — wait, retry, or fall back to local.
- **Don't read the script verbatim.** Use it as the spine; the on-screen prose carries the precise wording. Your job is to point and contextualize.

---

## 10. References

- Demo HTML: [demo_p2.html](demo_p2.html)
- Phase 1 demo (precedent + cumulative parity context): [demo_p1.html](demo_p1.html)
- Demo conventions: [README.md](README.md) ("Two-case demo template")
- Phase 2 entry packet: `project/reviews/phase-2-entry.md`
- Phase 2 exit packet: `project/reviews/phase-2-exit.md`
- ADR-010 (license verification): `project/DECISIONS.md`
- ADR-011 (audit-artifact `@id`): `project/DECISIONS.md`
- ADR-012 (cardinality routing): `project/DECISIONS.md`
- Authoring discipline: `arc/AUTHORING_DISCIPLINE.md`
