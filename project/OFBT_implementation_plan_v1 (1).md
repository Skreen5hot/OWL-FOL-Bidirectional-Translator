# OFBT v0.1 Implementation Sequencing Plan

*Document version: 1.0*
*Status: planning document, accompanies frozen v0.1.7 specification*
*Audience: OFBT implementation team, plus reviewers tracking implementation progress*

---

## 0. Reading this document

### 0.1 What this document is

This is the **implementation sequencing plan** for OFBT v0.1. It operationalizes the frozen v0.1.7 specification into a concrete build sequence with explicit phases, validation rings, and gates between phases. It exists to:

- Make failure attribution local. When something breaks during implementation, the phased structure tells implementers which earlier phase's assumptions are now in question.
- Prevent the "build everything then validate at the end" failure mode where a subtle interaction between (e.g.) BFO Disjointness Map firings and §6.3 NAF projection rules surfaces only after all components are integrated.
- Surface parallel-developable workstreams explicitly so the implementation team can plan staffing and timing.
- Give Fandaws (and other consumers) visibility into what exists at each phase, supporting parallel consumer-side preparation work.

### 0.2 What this document is not

- **Not part of the specification.** The spec (`OFBT_spec_v0.1.7.md` + `OFBT_API_v0.1.7.md`) is frozen. This plan does not extend, amend, or constrain the spec. Where the plan makes sequencing decisions the spec doesn't constrain, it does so as a plan-level commitment.
- **Not implementation-language guidance.** TypeScript vs. plain JavaScript with `.d.ts`, choice of test framework, file/directory structure, build tooling — these are team decisions outside this document's scope.
- **Not a commit-by-commit decomposition.** Too granular, obsolete on contact with implementation reality.
- **Not effort estimates.** Estimates vary too widely with team composition and experience to be useful in a public planning document. Effort estimation is an internal team activity.

### 0.3 Relationship to the spec/API doc pair

| Document | Versioning | Authority | Editable |
|---|---|---|---|
| `OFBT_spec_v0.1.7.md` | Frozen at v0.1.7 | Authoritative on behavior | Editorial corrections only until v0.2 |
| `OFBT_API_v0.1.7.md` | Frozen at v0.1.7 | Authoritative on API surface | Editorial corrections only until v0.2 |
| `OFBT_implementation_plan_v1.md` (this document) | Independent versioning | Operational guidance | Revisable as implementation proceeds |

This document evolves as implementation reveals which sequencing choices were correct and which need adjustment. Plan revisions are recorded in §9. Spec changes remain governed by spec §0.2 (evidence-gated post-freeze change control).

### 0.4 Reading order

The document is structured for sequential reading:

- §1 establishes the build target and scope
- §2 defines the **validation pipeline** — the three rings every phase must pass through
- §3 decomposes the build into **eight phases** with entry/exit criteria
- §4 maps **spec sections to phases**
- §5 surfaces **parallel-development opportunities**
- §6 is the **risk register**
- §7 covers **implementation team coordination** during phase transitions
- §8 documents the **plan revision policy**
- §9 is the **revision history** for this document

---

## 1. Build Target and Scope

### 1.1 Build target

The v0.1.7 frozen specification (`OFBT_spec_v0.1.7.md` + `OFBT_API_v0.1.7.md`) is the build target. All phase deliverables are evaluated against the spec's acceptance criteria (spec §12 + API spec §14).

Per spec §0.2, deviations from the v0.1.7 contract require an ADR with implementation evidence (profile data, benchmarks, correctness counterexamples, or consumer breakage). Speculative deviations are out of scope.

### 1.2 What "v0.1 complete" means

v0.1 is complete when:

- All v0.1.7 spec acceptance criteria pass (behavioral spec §12 criteria 1-15, API spec §14 criteria API-1 through API-11)
- All v0.1 ARC modules listed in spec §3.6.1 are loaded and validated
- The compatibility shim package (`@ontology-of-freedom/ofbt-compat-fandaws`) is published with parallel-run mode and expected-divergence baseline support
- Bundle budget per API spec §13.4.1 is verified by CI
- The library's own CI runs the test corpus coverage matrix (API spec §14.11) end-to-end

The verification gate (API spec §15) runs after v0.1 implementation completes and before any consumer migration begins. The gate is a Fandaws-side process supported by OFBT's deliverables; v0.1 completion does not gate on the Fandaws-side process.

### 1.3 What v0.1 does not include

Per spec §13 and §17.5:

- ELK reasoner integration (deferred to v0.2)
- SPARQL endpoint (v0.2 candidate)
- OWL Functional Syntax input (v0.2 candidate)
- TagTeam.js bridge (v0.3+)
- Fandaws-Sentinel orchestration integration (v0.4+)
- SLG tabling for SLD termination (v0.2 planned)
- **OFI deontic ARC module** — deferred to v0.2 per ADR-008 (ratified 2026-05-05) because the OFI specification it depends on has not stabilized. CCO deontic (Directive→Action) is retained in v0.1 as a Phase 6 deliverable per ADR-009 and is semantically distinct from OFI deontic (Directive→Issuing-Agent). The compatibility shim, bundle budget enforcement, and constitution.ttl Article I §2 pipeline (rolled forward to Phase 8) all remain v0.1-bearing.

These do not appear in any v0.1 phase below.

---

## 2. The Validation Pipeline

The validation pipeline is the discipline that runs at every phase exit. It consists of **three concentric rings**, each the validation gate for the next. Earlier rings are subsets of later rings: passing Ring 3 implies passing Ring 1 and Ring 2 against the same content.

The same three rings run at every phase. What changes between phases is **what content the rings exercise**: built-in OWL only in Phase 1, plus BFO core in Phase 4, plus IAO in Phase 5, etc. The rings themselves do not change; the corpus does.

This structure means the validator implementation (Phase 3) can be developed in parallel with the lifter/projector implementation (Phases 1-2) as long as the validator doesn't merge until the lifter/projector pipeline it validates against is operational.

### 2.1 Ring 1 — Conversion Correctness

**What it tests:** The lifter (`owlToFol`) and projector (`folToOwl`) produce semantically correct output on the phase's input corpus.

**Concrete criteria:**

- Every input axiom in the corpus produces the correct FOL output per spec §5 lifting rules
- The §3.7.1 PROV-O domain/range non-requirement holds: no existential restriction synthesis on `rdfs:domain`/`rdfs:range`
- Determinism (API spec §6.1.1): same input + same `arcManifestVersion` → byte-identical FOL output across runs
- Blank node Skolem IDs are deterministic per spec §5.7 (RDFC-1.0 canonical labeling)
- IRI canonicalization (API spec §3.10) produces full-URI canonical form internally; output FOL uses full URIs in `FOLAtom.predicate` and `FOLConstant.iri`
- Datatype canonicalization (spec §5.6.5) produces XSD canonical lexical forms

**Pass criterion:** all conversion fixtures in the phase's corpus produce expected output, byte-identically across runs.

**Failure attribution:** Ring 1 failures are lifter or projector bugs in isolation. They do not implicate the validator (Phase 3) or the audit artifact emission (Ring 2).

### 2.2 Ring 2 — Round-Trip Parity Plus Audit Artifacts

**What it tests:** The lifter and projector compose correctly. The audit artifacts (`LossSignature`, `RecoveryPayload`, `ProjectionManifest`) emit correctly during conversion.

**Concrete criteria:**

- `roundTripCheck` (spec §8.1, API spec §6.3) returns `equivalent: true` for every corpus member that should round-trip cleanly
- For corpus members with known reversible approximations: `roundTripCheck` returns `equivalent: true` modulo the Recovery Payload ledger (the §7.3 reversible-approximation case)
- For corpus members with known true loss: `roundTripCheck` returns `equivalent: false` with a non-empty `diff` and a populated Loss Signature ledger
- Audit artifact content addressing (spec §7.5): same input produces same `@id` for every audit record across runs
- Severity ordering (API spec §6.4.1) is honored: emitted Loss Signatures sort consistently per the published ordering

**Pass criterion:** every corpus member's actual round-trip behavior matches its expected behavior (clean / reversible / lossy with documented reason).

**Failure attribution:** Ring 2 failures implicate the lifter/projector composition or the audit artifact emission, but only after Ring 1 passes. A Ring 2 failure with Ring 1 still passing means the individual conversions are correct but their composition is not — typically a bug in the audit ledger threading or in the projector's use of Recovery Payloads.

### 2.3 Ring 3 — Validator and Consistency Check

**What it tests:** The No-Collapse Guarantee check (spec §8.5), the consistency check API (spec §8.5, API spec §8), and the Horn-fragment surfacing (`unverifiedAxioms`) work correctly on the phase's content.

**Concrete criteria:**

- `checkConsistency(session)` returns `consistent: true` for every corpus member whose source is consistent
- `checkConsistency(session)` returns `consistent: false` for the deliberate-inconsistency fixtures (e.g., a class equivalent to its complement)
- `unverifiedAxioms` (API spec §8.1.1) is correctly populated when `reason === 'coherence_indeterminate'`
- The hypothetical-axiom case (`checkConsistency(session, axiomSet)` per API spec §8.1.2): hypothetical axioms participate in the check, contribute to `unverifiedAxioms` when applicable, and do not persist in the session
- The §8.5 No-Collapse Guarantee fires on its corpus: classes that should collapse to ⊥ are detected; classes that should not collapse are not falsely reported

**Pass criterion:** every consistency-check fixture in the phase's corpus produces the expected verdict, with the expected `unverifiedAxioms` content for the indeterminate cases.

**Failure attribution:** Ring 3 failures implicate the validator after Rings 1 and 2 pass. A Ring 3 failure with Rings 1 and 2 passing means conversion and round-trip are correct but the consistency machinery is not — typically a bug in the Horn-fragment classification or the witness extraction.

### 2.4 What "the rings pass" means at a phase exit

A phase exits when **all three rings pass against the phase's corpus**. The corpus grows phase by phase:

- Phase 1: built-in OWL fixtures
- Phase 2: built-in OWL fixtures + projection-specific fixtures
- Phase 3: built-in OWL fixtures + consistency-check fixtures
- Phase 4: above + BFO 2020 core fixtures
- Phase 5: above + IAO information-bridge fixtures
- Phase 6: above + (six CCO modules: realizable-holding, mereotopology, measurement, aggregate, organizational, deontic)
- Phase 7: above + compatibility shim parallel-run fixtures + bundle budget + coverage matrix CI (OFI deontic deferred to v0.2 per ADR-008)
- Phase 8: above + constitution.ttl Article I §2 pipeline (rolled forward from Phase 7 per ADR-008 Option A)

The phase exit gate is automatic: CI runs all three rings against all corpus members in scope; failure on any single combination blocks exit. Manual review confirms the failures (if any) are the *expected* failures (the Loss Signature ledger correctly captures the documented losses, etc.).

### 2.5 Anti-pattern: skipping rings

The rings are concentric, not optional. A phase that passes Ring 1 but skips Ring 2 to "save time on the projector" produces an unsafe phase exit: Ring 3 against the same corpus may then fail in ways that are difficult to attribute because the projector wasn't actually validated.

If implementation reveals that a particular ring is not exercisable for a particular phase (e.g., Ring 3 has no meaningful fixture against an empty ARC manifest), the plan should be revised (per §8) to make the ring's vacuity explicit, not silently skipped.

---

## 3. Phase Decomposition

The build is decomposed into **eight phases**. Each phase has explicit entry criteria, deliverables, and exit criteria. Phases are gated: Phase N+1 cannot begin until Phase N's exit criteria are met. Within a phase, parallel development is encouraged where the dependency graph allows; cross-phase parallelism is covered in §5.

### 3.1 Phase 0 — Foundations

**Goal:** Establish the package structure, peer-dependency contract, and error-class hierarchy. No conversion or evaluation logic yet.

**Entry criteria:**

- Spec v0.1.7 frozen and published
- Implementation team assembled
- Package name reserved on npm (`@ontology-of-freedom/ofbt`)
- Tau Prolog v0.3.4 confirmed available as peer dependency

**Deliverables:**

- Package skeleton with ES Module structure per API spec §13.1
- `package.json` with peer-dependency declaration per API spec §13.7
- All eleven typed error classes per API spec §10 (`OFBTError`, `ParseError`, `UnsupportedConstructError`, `IRIFormatError`, `RoundTripError`, `SessionRequiredError`, `SessionDisposedError`, `StepCapExceededError`, `SessionStepCapExceededError`, `CycleDetectedError`, `ARCManifestError`) plus `TauPrologVersionMismatchError` (12th class)
- The reason enum (16 members) per API spec §11 as a frozen `REASON_CODES` constant
- Sync `verifyTauPrologVersion()` per API spec §9.2
- Sync `getVersionInfo()` per API spec §9.1
- `createSession()` and `disposeSession()` skeletons that allocate/release Tau Prolog state per API spec §5; `createSession()` calls `verifyTauPrologVersion()` internally per API spec §13.7.2
- Build tooling: esbuild configuration, CI pipeline skeleton
- Bundle budget measurement script per API spec §13.4.3 (measurements only; no enforcement until Phase 7)

**Exit criteria:**

- Package imports successfully in Node v18+ and modern browsers
- All twelve error classes can be instantiated, extend `OFBTError`, carry documented fields
- The reason enum is a frozen object; mutation attempts throw
- `verifyTauPrologVersion()` returns `{match: true, expected: '0.3.4', found: '0.3.4'}` when Tau Prolog v0.3.4 is loaded; returns `{match: false, ...}` when a different version is loaded
- `getVersionInfo()` returns the documented shape with `apiSpecVersion: '0.1.7'`
- `createSession()` succeeds when Tau Prolog v0.3.4 is available; throws `TauPrologVersionMismatchError` otherwise
- `disposeSession(null)` throws `SessionRequiredError` per API spec §5.2
- The bundle measurement script reports current sizes (no caps enforced yet)

**Validation rings:** N/A — no conversion or evaluation logic to validate.

**What this phase intentionally does not include:** the lifter, the projector, the validator, ARC manifest content, evaluation. All conversion and evaluation logic is Phases 1+.

### 3.2 Phase 1 — Built-In OWL Lifter

**Goal:** Implement the lifter for OWL constructs whose semantics are fixed by the OWL standard, independent of any ARC manifest content. This is the smallest meaningful slice that produces FOL output.

**Entry criteria:**

- Phase 0 exited
- Built-in OWL test corpus authored (see "Test corpus" below)

**Deliverables:**

- `owlToFol()` implementing the lifter per API spec §6.1
- Structured OWL input handling per API spec §3 for: `Class`, `SubClassOf`, `EquivalentClasses`, `DisjointWith`, `ClassDefinition`, `ObjectIntersectionOf`, `ObjectUnionOf`, `ObjectComplementOf`, restrictions per §3.4 (`ObjectSomeValuesFrom`, `ObjectAllValuesFrom`, `ObjectHasValue`, cardinality variants), ABox per §3.5, RBox per §3.7 (including the high-priority `ObjectPropertyDomain` and `ObjectPropertyRange` per §3.7.1)
- IRI canonicalization per API spec §3.10 (input forms accepted, internal canonical, FOL output in full URI form)
- Datatype canonicalization per spec §5.6.5
- Identity rules per spec §5.5 (`owl:sameAs` propagation)
- RDFC-1.0 blank node canonicalization per spec §5.7 via `rdf-canonize`
- JSON-LD-shaped FOL output per API spec §4
- ARC manifest stub: `arcCoverage: 'permissive'` always, no ARC modules loaded, all properties go through the §6.4 fallback path (lifted with `unknown_relation` Loss Signature)
- The §3.7.1 PROV-O domain/range fixtures pass with the conditional translation; the existential-restriction wrong translation is verified absent

**Test corpus for Phase 1:**

- Simple `subClassOf` chains (Student ⊑ Person ⊑ Agent)
- `EquivalentClasses` between named classes
- `DisjointWith` between named classes
- `ObjectSomeValuesFrom` and `ObjectAllValuesFrom` restrictions
- `ObjectHasValue` restrictions with named individuals
- All cardinality restriction variants
- ABox class assertions, object property assertions, datatype property assertions
- `owl:sameAs` and `owl:differentFrom` between named individuals
- Property characteristics: `Functional`, `Transitive`, `Symmetric`, `InverseOf`
- The §3.7.1 PROV-O fixtures: `wasInfluencedBy` with domain and range both `Entity`, plus a property assertion
- Blank node-bearing class expressions (anonymous restrictions)

**Exit criteria — Ring 1 only:**

- All test corpus members lift successfully to FOL with semantically correct output
- §6.1.1 determinism guarantee verified: each fixture produces byte-identical output across 100 runs
- The §3.7.1 PROV-O fixtures pass: `prov_entity(project_alpha)` and `prov_entity(project_beta)` are entailed via the conditional implications; no Skolem successors are synthesized
- Blank node Skolem IDs are deterministic per RDFC-1.0
- IRI normalization handles all three input forms (full URI, CURIE, bracketed) producing identical lifted FOL

**Rings 2 and 3 deferred:** projector and validator do not exist yet. Round-trip and consistency check criteria do not apply.

**Parallel development opportunity:** the projector (Phase 2) can begin in parallel as soon as the JSON-LD-shaped FOL output format is stable (which it is, per the frozen API spec §4). Projector developers do not need to wait for Phase 1's lifter implementation to be complete; they need only the type definitions.

### 3.3 Phase 2 — Built-In OWL Projector and Round-Trip Parity

**Goal:** Implement the projector for the same built-in OWL constructs Phase 1 covers, plus the audit artifact emission. This closes the bidirectional pipeline for built-in OWL.

**Entry criteria:**

- Phase 1 exited (Ring 1 passing on built-in OWL corpus)
- Audit artifact type definitions stable (already frozen in API spec §6.4)

**Deliverables:**

- `folToOwl()` implementing the projector per API spec §6.2 (including the `prefixes` parameter per C1 closure)
- Audit artifact emission: `LossSignature`, `RecoveryPayload`, `ProjectionManifest` per API spec §6.4 with content-addressing and severity ordering
- Three projection strategies per spec §6.1: Direct Mapping, Property-Chain Realization, Annotated Approximation
- `roundTripCheck()` per API spec §6.3 implementing the §8.1 parity criterion
- Negation handling per spec §6.3 (default OWA, no `closedPredicates` yet — that comes with the evaluation function in Phase 3)

**Test corpus for Phase 2:**

- Phase 1's corpus, with each member exercised through `roundTripCheck`
- Additional fixtures specifically for projection edge cases: blank-node-bearing class expressions where the projector must reconstruct the b-node identifier
- Property-chain realization fixtures (the RDM v1.2.1 chain decomposition pattern, simplified for built-in OWL — full RDM chain comes in Phase 7)
- Lossy fixtures: deliberately constructed inputs that should produce non-empty Loss Signatures (NAF residues against open predicates, true arity flattenings)

**Exit criteria — Rings 1 and 2:**

- Ring 1 still passes (Phase 1's exit criteria continue to hold)
- All round-trip fixtures pass: `roundTripCheck` returns `equivalent: true` for clean fixtures, `equivalent: true` modulo Recovery Payloads for reversible fixtures, `equivalent: false` with documented `diff` for lossy fixtures
- Audit artifact `@id` content-addressing produces stable identifiers across runs
- Loss Signature severity ordering (API spec §6.4.1) is honored in emitted artifacts
- The `prefixes` parameter on `folToOwl` produces CURIE output when prefixes are provided, full-URI output when omitted

**Ring 3 deferred:** the validator does not exist yet. Consistency check criteria do not apply.

### 3.4 Phase 3 — Validator, Evaluation, and Consistency Check

**Goal:** Implement the validator and the evaluation/consistency-check API. This closes Ring 3 against built-in OWL content, completing the validation pipeline at the smallest meaningful scope.

**Entry criteria:**

- Phase 2 exited (Rings 1 and 2 passing on built-in OWL corpus)

**Deliverables:**

- `evaluate()` per API spec §7.1 with the `EvaluableQuery = FOLAtom | FOLConjunction` restriction per §7.5
- Three-state result per API spec §7.2 with the full reason enum (16 members) producing correct codes
- Step cap handling per API spec §7.2 and §7.4: per-query default 10K, optional aggregate session cap, configurable throw-on-cap behavior
- `UnsupportedConstructError` thrown for FOLAxiom variants outside the `EvaluableQuery` subset per API spec §7.5
- `checkConsistency()` per API spec §8.1 with the No-Collapse Guarantee check per spec §8.5
- `unverifiedAxioms` field correctly populated per API spec §8.1.1 when `reason === 'coherence_indeterminate'`
- The hypothetical-axiom case per API spec §8.1.2: `axiomSet` participates in the check, contributes to `unverifiedAxioms`, does not persist
- Cycle detection per spec §5.4 and ADR-011 (visited-ancestor list) — `cycle_detected` reason code returned, optionally throwing per consumer config
- Per-predicate CWA per spec §6.3.2 and API spec §6.3 — `closedPredicates` parameter operational
- Structural annotation declaration consistency per API spec §2.1.1 — `structural_annotation_mismatch` thrown on detection
- ARC manifest version mismatch detection per API spec §2.1.2 — `arc_manifest_version_mismatch` thrown when session and conversion versions diverge
- Session-aggregate step cap per API spec §2.1 — `SessionStepCapExceededError` thrown when `maxAggregateSteps` is exceeded

**Test corpus for Phase 3:**

- Phase 1 + Phase 2 corpus
- Consistency-check fixtures: deliberately consistent KBs (consistency check returns `true`), deliberately inconsistent KBs (e.g., `Class equivalent to ObjectComplementOf(Class)` — returns `false` with witnesses), Horn-incomplete KBs (returns `'undetermined'` with populated `unverifiedAxioms`)
- Hypothetical-reasoning fixtures: KB plus `axiomSet` that introduces inconsistency; KB plus `axiomSet` that introduces Horn-incompleteness without inconsistency
- Cycle fixtures: class hierarchy with `EquivalentClasses` cycle (some valid OWL ontologies declare such cycles); recursive predicate definition that would loop without cycle protection
- Per-predicate CWA fixtures: queries with `closedPredicates` set producing `false` results that the same query without closure produces as `'undetermined'`
- Step cap fixtures: queries that exhaust the 10K default cap; sessions that exhaust an aggregate cap

**Exit criteria — Rings 1, 2, and 3 all passing on built-in OWL corpus:**

- All Phase 1 and Phase 2 exit criteria continue to hold
- Spec §12 acceptance criteria 1-15 pass on the built-in OWL corpus where applicable (some, like §12.13 PROV-O domain/range, were exercised in Phase 1; others, like §12.15 per-predicate CWA, are exercised here for the first time)
- API spec §14 acceptance criteria API-1 through API-7 pass (the API surface is operational)
- The full `EvaluableQuery` restriction enforcement: every unsupported FOLAxiom variant throws `UnsupportedConstructError` with the documented `suggestion` field

**Significance:** Phase 3 exit is the **first phase exit where the full validation pipeline operates against real content**. Rings 1, 2, 3 all green against built-in OWL means the bidirectional pipeline plus the validation machinery work as a system. Subsequent phases add ARC content; the pipeline structure does not change.

### 3.5 Phase 4 — BFO 2020 Core ARC Module

**Goal:** Author and load the first real ARC manifest module. Re-run the full validation pipeline against BFO 2020 core content. This is the first phase where ARC manifest content matters.

**Entry criteria:**

- Phase 3 exited (Rings 1-3 passing on built-in OWL)
- BFO 2020 ARC manifest content authored — see "ARC manifest authoring" below

**Deliverables:**

- `arc/core/bfo-2020.json` per spec §3.6.1 (≤ 40 KB minified target)
- ARC module loader per spec §3.6.2: `arcModules` parameter on `LifterConfiguration` operational; default loads all v0.1 modules; tree-shaking when modules are not declared
- ARC module dependency validation per spec §3.6.4: throws `ARCManifestError` if a declared module's dependencies are not also loaded
- Strict mode operational against BFO 2020 vocabulary: properties not in the BFO ARC are rejected in strict mode, fallback-handled in permissive mode
- BFO Disjointness Map firings against the built-in OWL `DisjointWith` machinery from Phase 1
- Connected With as primitive (spec §3.4.1) with the bridge axiom and inferential closure machinery
- Test corpus members for BFO 2020 (per API spec §14.11 matrix)

**ARC manifest authoring (parallel workstream, must complete before Phase 4 entry):**

The BFO 2020 ARC content is itself a deliverable, distinct from the loader code that consumes it. It is authored against the v3 relations catalogue (`relations_catalogue_v3.tsv`) plus the BFO 2020 specification. Authoring includes:

- Entries for parthood (proper part, has part, part of, etc.), dependence (specifically depends on, generically depends on), realization (realizes, is realized by), participation, spatial relations, temporal relations, time-indexing axes
- Verified status for each entry per spec §3.3 (Verified, [VERIFY], or Draft)
- Worked-example test fixtures for each entry exercising the BFO Disjointness Map and the Connected With bridge axiom

This authoring is **not part of the loader implementation** and proceeds as a parallel workstream during Phases 0-3 so it is ready when Phase 4 begins. Authoring is Aaron's domain expertise; loader implementation is the engineering team's.

**Test corpus expansion for Phase 4:**

- The Phase 1-3 built-in OWL corpus continues to be exercised
- BFO 2020 core fixtures: parthood transitivity, dependence relations, realization chains
- BFO Disjointness Map fixtures: Continuant ⊓ Occurrent should be ⊥ (deliberately inconsistent), SDC ⊓ GDC should be ⊥ (related to RDM v1.2.1 chain), and so on
- Connected With fixtures exercising the bridge axiom (spec §3.4.1) against the cycle detection
- Strict mode tests: input ontologies whose properties are entirely covered by BFO 2020 ARC succeed; input ontologies with non-BFO properties fail with `ARCManifestError`

**Exit criteria — Rings 1-3 all passing on built-in OWL + BFO 2020 corpus:**

- All Phase 3 exit criteria continue to hold
- All BFO 2020 corpus members pass Rings 1-3
- Strict + permissive mode behaviors verified against the BFO 2020 vocabulary
- BFO Disjointness Map fires correctly: `checkConsistency` returns `false` with witnesses for the deliberately-inconsistent fixtures; returns `true` for the consistent ones
- Connected With closure under the bridge axiom produces the expected entailments without infinite resolution loops (cycle protection working)
- ARC module dependency check: declaring `arcModules: ['cco/realizable-holding']` without `core/bfo-2020` throws `ARCManifestError`; the error message names the missing dependency

**Failure attribution:** Phase 4 failures are typically BFO ARC content bugs (the manifest entry is wrong) or BFO-specific interactions with the conversion machinery. Because Phases 1-3 already passed against built-in OWL, BFO content can be debugged in isolation.

### 3.6 Phase 5 — IAO Information Bridge ARC Module

**Goal:** Add the IAO information-bridge ARC module on top of BFO 2020 core. Re-run validation against BFO + IAO content.

**Entry criteria:**

- Phase 4 exited
- IAO information-bridge ARC content authored

**Deliverables:**

- `arc/core/iao-information.json` per spec §3.6.1 (≤ 10 KB minified target) covering `is_about`, `denotes`, `is_token_of`
- Test corpus members for IAO

**Test corpus expansion for Phase 5:**

- Built-in OWL + BFO 2020 + IAO fixtures
- Information-bridge fixtures: an Information Content Entity that `is_about` a Material Entity, with the dependence relations correctly entailed
- Cross-module fixtures: BFO realization of an IAO Document that `denotes` a BFO Continuant

**Exit criteria — Rings 1-3 passing on built-in OWL + BFO + IAO corpus.**

This phase is structurally similar to Phase 4 but with a smaller content scope. It serves as a "second integration test" of the modular ARC structure: if BFO loaded correctly in isolation, does adding IAO break anything? If not, the modularity discipline is working.

### 3.7 Phase 6 — CCO Modules (six modules)

**Goal:** Add the six CCO ARC modules — realizable-holding, mereotopology, measurement, aggregate, organizational, and deontic. Re-run validation against BFO + IAO + (six CCO modules) content.

**Per ADR-009 (ratified 2026-05-05):** Phase 6 scope expanded from 2 CCO modules to 6 CCO modules. Four new modules — `cco/measurement`, `cco/aggregate`, `cco/organizational`, `cco/deontic` — were added when v3.3 catalogue regeneration surfaced 39 catalogue rows that did not fit the original 5-module taxonomy. Per-module size budgets are enumerated in spec §13.4. The CCO `cco/deontic` module covers Directive→Action machinery and is semantically distinct from OFI deontic (Directive→Issuing-Agent), which is deferred to v0.2 per ADR-008.

**Entry criteria:**

- Phase 5 exited
- All six CCO ARC modules' content authored, reviewed, and ingested
- Per-module size-budget pre-check (advisory until Phase 7 enforcement) reported and triaged

**Deliverables:**

- `arc/cco/realizable-holding.json` per spec §3.6.1 (≤ 15 KB minified per §13.4) — `has_role`, `has_disposition`, `has_function`, `agent_in`, `patient_in`
- `arc/cco/mereotopology.json` per spec §3.6.1 (≤ 5 KB minified per §13.4) — Connected With as primitive plus the CCO-specific bridge axioms
- `arc/cco/measurement.json` per spec §3.6.1 (≤ 8 KB minified per §13.4) — measurement processes, units, magnitudes
- `arc/cco/aggregate.json` per spec §3.6.1 (≤ 5 KB minified per §13.4) — aggregate-of-individuals patterns
- `arc/cco/organizational.json` per spec §3.6.1 (≤ 12 KB minified per §13.4) — organizational membership, roles, structural relations
- `arc/cco/deontic.json` per spec §3.6.1 (≤ 8 KB minified per §13.4) — CCO Directive→Action deontic vocabulary; disjointness commitments formalized as machine-readable axioms
- Test corpus members for each of the six CCO modules

**Test corpus expansion for Phase 6:**

- Built-in OWL + BFO + IAO + (six CCO modules) corpus
- CCO realizable-holding fixtures: agents with roles, dispositions, functions
- CCO mereotopology fixtures: spatial regions, locations, mereotopological closures
- CCO measurement fixtures: measurement-of relations, unit assertions
- CCO aggregate fixtures: aggregates and their part-individuals
- CCO organizational fixtures: organization-membership and structural relations
- CCO deontic fixtures: Directive→Action with disjointness witnesses (CCO-side; OFI-side deferred)
- Cross-module fixtures: a CCO Agent (CCO) that participates_in (BFO) a process described by IAO documentation

**Exit criteria — Rings 1-3 passing on built-in OWL + BFO + IAO + (six CCO modules) corpus.**

This is the largest content expansion in v0.1 and the most likely phase to surface module-interaction bugs. CCO realizable-holding interacts heavily with BFO realization relations; the §3.4.1 Connected With closure interacts with both BFO parthood and CCO spatial relations; CCO organizational and CCO deontic span agent / process / disposition territory shared with realizable-holding. Validation against this expanded corpus exercises the most complex content combinations v0.1 supports.

### 3.8 Phase 7 — Compatibility Shim, Bundle Budget Enforcement, Coverage Matrix CI

**Goal:** Implement the compatibility shim package. Land the bundle budget enforcement and the test corpus coverage matrix CI.

**Per ADR-008 Option A (ratified 2026-05-05):** OFI deontic ARC content is deferred to v0.2 because the OFI specification it depends on has not stabilized. Phase 7 retains the compatibility shim, bundle budget CI, and coverage matrix CI as v0.1-IMPLEMENTATION-COMPLETE-bearing deliverables. The OFI-bearing fixtures and `arc/ofi/deontic.json` are removed from v0.1 scope. The constitution.ttl Article I §2 pipeline is rolled forward to Phase 8 — it exercises CCO deontic + IAO + BFO machinery without OFI dependence.

**Entry criteria:**

- Phase 6 exited (all six CCO modules ratified)
- Fandaws Bucket C helper signature inventory provided (per spec §17.7) — required for shim function-list

**Deliverables:**

- The `@ontology-of-freedom/ofbt-compat-fandaws` package per API spec §12 with all Bucket C helper signatures backed by OFBT calls (shim retained per ADR-008 Option A — Fandaws-side interface stability obligation is independent of OFI ARC content)
- Parallel-run mode per API spec §12.3 with the `expectedDivergences` mechanism per §12.3.1
- Bundle budget enforcement per API spec §13.4: per-component caps gated in CI, regressions block PRs (per-CCO-module caps from §13.4.1 enforced)
- Test corpus coverage matrix CI per API spec §14.11: every cell in the matrix exercised across the 8 active modules; OFI cells annotated "deferred to v0.2 per ADR-008"
- `npm run test:arc-roundtrip -- --strict` wired into CI as a gated step (skips `[V0.2-CANDIDATE]`-tagged catalogue rows per ADR-008)

**Test corpus expansion for Phase 7:**

- Built-in OWL + BFO + IAO + (six CCO modules) corpus; OFI deontic fixtures deferred to v0.2 per ADR-008
- Structural annotation fixtures using the (interim, per spec §17.7.2) `fandaws:bfoSubcategory` and similar IRIs (shim parallel-run cases)

**Deferred to v0.2 per ADR-008 (NOT Phase 7 deliverables):**

- `arc/ofi/deontic.json` directives, commitments, RDM v1.2.1 chain (DirectiveICE + PlanSpecification + RealizableEntity + VerbPhrase DiscourseReferent)
- `realizes_directive` property-chain decomposition canary fixture
- OFI Directive→Issuing-Agent disjointness silent-pass canary fixture

(The constitution.ttl Article I §2 pipeline is not deleted — it rolls forward to Phase 8. CCO Directive→Action deontic is a Phase 6 deliverable and is not deferred.)

**Exit criteria:**

- Rings 1-3 passing on the v0.1 active corpus (built-in OWL + BFO + IAO + six CCO modules)
- All v0.1.7 spec acceptance criteria pass: behavioral §12 criteria 1-15 (OFI-gated criteria carry the ADR-008 deferral note), API §14 criteria API-1 through API-11
- The compatibility shim parallel-run mode operational
- Bundle budget CI passing: OFBT core ≤ 100 KB, rdf-canonize ≤ 50 KB, ARC core ≤ 50 KB, total mandatory ≤ 200 KB; per-module CCO caps enforced per spec §13.4
- The test corpus coverage matrix from API spec §14.11 fully exercised across the 8 active modules; every "exercised" and "exercised (canonical)" cell has a passing test; OFI cells annotated "deferred to v0.2 per ADR-008"; other "n/a" cells have documentation explaining why
- The compatibility shim's expected-divergence mechanism verified against synthetic baseline entries (real entries are Fandaws-side)

**Significance:** Phase 7 exit, plus the Phase 8 constitution.ttl pipeline rolled forward per Option A, marks **v0.1 implementation complete**. The library is ready for the verification gate (API spec §15), which is the Fandaws-side process that runs in Phase 8.

### 3.9 Phase 8 — Verification Gate Support, constitution.ttl Pipeline, and Release

**Goal:** Support Fandaws's verification cycle gate. Exercise the constitution.ttl Article I §2 pipeline (rolled forward from Phase 7 per ADR-008 Option A). Tag and publish v0.1.0.

**Per ADR-008 Option A (ratified 2026-05-05):** the constitution.ttl Article I §2 pipeline (spec §14 Q5) is rolled forward from Phase 7 to Phase 8. The pipeline exercises CCO deontic Directive→Action machinery against the v0.1 active module set (BFO + IAO + six CCO modules); OFI-specific extensions are deferred to v0.2 alongside the OFI deontic ARC module.

**Entry criteria:**

- Phase 7 exited (compatibility shim, bundle budget CI, coverage matrix CI all green)
- Fandaws ready to run the verification gate (Bucket C inventory complete, expected-divergence baseline drafted, parallel-run setup ready)

**Deliverables:**

- constitution.ttl Article I §2 pipeline fixture (spec §14 Q5) exercised against the v0.1 active module set; OFI-specific extensions documented as v0.2 follow-up
- The verification-gate-supporting documentation: Verification Gate Guide per API spec §15.4 with installation instructions, parallel-run configuration, mismatch interpretation
- Response to Fandaws-side gate findings: any unexpected mismatches investigated, attributed (OFBT bug vs undocumented legacy bug), and either fixed (OFBT bug → patch release) or added to baseline (undocumented legacy bug → Fandaws-side baseline update)
- The npm publish pipeline executed: `@ontology-of-freedom/ofbt@0.1.0` and `@ontology-of-freedom/ofbt-compat-fandaws@0.1.0` published
- Tagged release, changelog, README finalized
- v0.2 OFI-deferral forward-track recorded in release notes (links ADR-008 + the OFI candidacy entries in `relations_catalogue_v3_3.tsv`)

**Exit criteria:**

- constitution.ttl Article I §2 pipeline exercises green against the v0.1 active module set (BFO + IAO + six CCO modules)
- Fandaws's verification gate passes (per API spec §15.3 and the §15.3.1 expected-divergence accommodation)
- npm packages published and installable
- Any Phase 8 patch releases (responding to gate findings) are themselves green per Phases 1-7 validation rings

**This phase is fundamentally collaborative:** it cannot complete without Fandaws-side participation. OFBT side is responsive, not proactive. The gate timeline is determined by Fandaws governance per §17.9 of the spec.

---

## 4. Spec-Section-to-Phase Mapping

This table shows which v0.1.7 spec sections each phase implements. Use it for forward-mapping (planning a phase: which spec sections do I need to read?) or reverse-mapping (encountering a spec section: which phase implements it?).

| Spec section | Implementing phase | Notes |
|---|---|---|
| Behavioral §1 (scope) | Phase 0 | Scope acknowledged; no code |
| Behavioral §2 (architecture) | Phases 1-3 | Component architecture realized |
| Behavioral §3.1-3.5 (ARC structure, configuration) | Phase 0 (config types) + Phase 4+ (ARC content) | Configuration types in Phase 0; ARC content lands in Phase 4+ |
| Behavioral §3.6 (modular ARC manifest) | Phase 4 | Loader implementation; modules land in Phases 4-7 |
| Behavioral §4 (input specification) | Phase 1 | Input types are part of lifter |
| Behavioral §4.2.1 (IRI canonicalization) | Phase 1 | |
| Behavioral §5 (lifting engine) | Phase 1 | |
| Behavioral §5.7 (RDFC-1.0) | Phase 1 | |
| Behavioral §5.8 (domain/range) | Phase 1 | The §3.7.1 PROV-O fixtures land here |
| Behavioral §5.9 (structural annotations) | Phase 3 (machinery) + Phase 7 (Fandaws-specific IRIs) | |
| Behavioral §6 (projection engine) | Phase 2 | |
| Behavioral §6.3 (negation handling, per-predicate CWA) | Phase 3 | |
| Behavioral §7 (audit artifacts) | Phase 2 | |
| Behavioral §8 (round-trip parity) | Phase 2 (Ring 2) | |
| Behavioral §8.5 (No-Collapse Guarantee) | Phase 3 (Ring 3) | |
| Behavioral §9 (storage layer) | Phases 1-2 | Oxigraph + Tau Prolog precedence per ADR-015 |
| Behavioral §11 (technical stack) | Phase 0 | Peer-dependency declaration |
| Behavioral §12 (acceptance criteria) | Phases 1-7 (each criterion validated as its content lands) | |
| Behavioral §13 (out of scope) | N/A | Not implemented |
| Behavioral §17 (Fandaws alignment) | Phases 7-8 (shim + gate) | |
| API §0.2 (I/O contract) | Phases 0-3 (each function honors its documented I/O profile) | |
| API §2 (configuration types) | Phase 0 | |
| API §3 (input types) | Phase 1 | |
| API §3.7.1 (domain/range — HIGH PRIORITY) | Phase 1 | Canonical fixture in Phase 1 corpus |
| API §3.10 (IRI canonicalization) | Phase 1 | |
| API §4 (FOL output types) | Phase 1 | |
| API §5 (session lifecycle) | Phase 0 (skeletons) + Phase 3 (full operational) | |
| API §6 (conversion functions) | Phases 1-2 | |
| API §6.4 (audit artifact types) | Phase 2 | |
| API §7 (evaluation) | Phase 3 | |
| API §7.5 (per-variant disposition) | Phase 3 | `UnsupportedConstructError` thrown for non-EvaluableQuery variants |
| API §8 (consistency check) | Phase 3 | |
| API §9 (version surfacing) | Phase 0 | |
| API §10 (error class hierarchy) | Phase 0 | All 12 classes |
| API §11 (reason enum) | Phase 0 (defined) + Phases 1-3 (correctly returned per outcome) | |
| API §12 (compatibility shim) | Phase 7 | |
| API §13 (packaging) | Phase 0 (structure) + Phase 7 (bundle budget enforcement) | |
| API §13.7 (Tau Prolog peer-dep) | Phase 0 | |
| API §14 (acceptance criteria) | Phases 1-7 (each criterion validated as its content lands) | |
| API §14.11 (test corpus coverage matrix) | Phase 7 | Full matrix CI lands here |
| API §15 (verification gate) | Phase 8 | Fandaws-collaborative |

---

## 5. Parallel Development Opportunities

The phase decomposition is sequential by validation-ring necessity (Phase N+1 cannot exit until Phase N's rings pass), but development within and across phases can proceed concurrently in several places. This section names the explicit parallelism opportunities so the implementation team can plan staffing.

### 5.1 Within-phase parallelism

**Phase 0:** All twelve error classes can be authored concurrently. The reason enum can be authored independently of the error classes (only the mapping table in §11.3 requires both to exist). The peer-dependency contract and `verifyTauPrologVersion()` can be authored independently of the session lifecycle skeletons.

**Phase 1:** The lifter for different OWL constructs can be developed in parallel. Class expressions, restrictions, ABox axioms, RBox axioms — each can have its own implementer. The IRI canonicalization machinery and the RDFC-1.0 wiring are also independent of the construct-specific lifting code.

**Phase 2:** Projector for different OWL constructs in parallel, mirroring Phase 1. Audit artifact emission (the three types) can be developed in parallel with the projection logic — projectors emit to a ledger interface; the ledger implementation is independent.

**Phase 3:** `evaluate` and `checkConsistency` are largely independent of each other; both depend on the validator infrastructure but their query/check semantics differ enough that two implementers can work in parallel.

**Phases 4-7:** The ARC module for each phase is loaded by a single piece of code (the ARC loader from Phase 4) so the loading itself is not parallelizable, but the test corpus authoring and the per-module fixture writing can proceed in parallel with adjacent phases.

### 5.2 Cross-phase parallelism

**Phase 1 lifter and Phase 2 projector** can be developed in parallel as soon as the JSON-LD-shaped FOL output format (API spec §4) is treated as the contract. Projector developers code against the type definitions; lifter developers code against the same. They merge when both can demonstrate Ring 1 / Ring 2 fixtures passing against shared corpus.

**Phase 3 validator** can begin in parallel with Phase 2, with the same caveat: validator developers code against the FOL state interface; merge happens when Ring 3 fixtures are exercisable (after Phase 2 exit).

**ARC manifest content authoring** (BFO 2020 core for Phase 4, IAO for Phase 5, CCO for Phase 6, OFI deontic for Phase 7) is a parallel workstream that begins in Phase 0 and proceeds throughout. Each phase's content must be ready when its phase entry criteria are evaluated. This is Aaron's domain expertise; it does not block engineering work in earlier phases.

**Compatibility shim mechanism** (parallel-run mode, expected-divergence baselines) can be designed and prototyped during Phases 1-6. The shim's specific function-list waits on Fandaws's Bucket C inventory but the mechanism is generic. By Phase 7 entry, the mechanism should be complete; the function-list inventory then gets bound in.

**Bundle budget tooling** (the measurement script per API spec §13.4.3) lands in Phase 0 as measurement-only. CI gating is added in Phase 7. Throughout Phases 1-6, the script reports current sizes so the team has visibility into bundle drift even before enforcement is on.

### 5.3 Recommended team structure (illustrative)

A team of four implementers could organize as:

- **Implementer A** (lifter focus): Phases 1, 4-7 lifter contributions
- **Implementer B** (projector focus): Phases 2, 4-7 projector contributions
- **Implementer C** (validator/evaluator focus): Phases 3, 4-7 validator contributions
- **Implementer D** (infrastructure focus): Phase 0, packaging, bundle tooling, shim mechanism, ARC loader, CI

Aaron's content-authoring workstream runs in parallel throughout, providing ARC manifest content and test fixtures as each phase needs them.

This is illustrative; teams of different sizes will distribute differently. The principle is that the phase boundaries are gates for *integration*, not for *individual work*, and within-phase parallelism is encouraged.

---

## 6. Risk Register

The phased structure protects against several specific failure modes. This section names them, plus the failure modes the phasing does *not* protect against.

### 6.1 Failure modes the phasing protects against

**Misattribution of BFO Disjointness Map firings.** Without Phase 4's separation of BFO content from the conversion pipeline, a BFO Disjointness Map firing during round-trip could be attributed to a lifter bug, a projector bug, or a BFO axiom bug — and it would take effort to disambiguate. With the phasing, Phases 1-3 already validated lifter/projector/validator on built-in OWL; a Phase 4 failure is BFO-specific by construction.

**Subtle interactions between modules surfacing late.** Without Phases 5-7's incremental module loading, an interaction between (e.g.) CCO realizable-holding and OFI deontic chains could surface only at v0.1 release, requiring backtracking through multiple modules to attribute. With the phasing, each module loads alone first; cross-module interactions are introduced one pair at a time.

**Domain/range existential-restriction wrong translation surviving to release.** The §3.7.1 PROV-O fixture lands in Phase 1, the smallest possible scope. The wrong translation cannot survive Phase 1 exit. Without the early-fixture commitment, the wrong translation could pass casual tests in Phases 1-3 and only surface as BFO Disjointness Map firings in Phase 4, where misattribution is more likely.

**Bundle budget regression.** Without bundle measurement starting in Phase 0, drift accumulates silently and only surfaces at Phase 7 enforcement, requiring expensive late-phase optimization. With Phase 0 measurement and Phase 7 enforcement, the team has visibility throughout and can make sizing decisions early.

**Validator implementation lagging the conversion pipeline.** Without the parallel-development opportunity in §5.2, validator implementation might begin only after Phase 2 exit, delaying Phase 3. With the parallel opportunity, validator development begins early and is integration-ready when Phase 2 exits.

### 6.2 Failure modes the phasing does NOT protect against

**OFBT spec defects discovered during implementation.** The spec is frozen but not infallible. If Phase 1 implementation reveals that a spec requirement is impossible or contradictory, the spec must be patched per §0.2 of the spec (editorial revision or pre-implementation correction). The phasing surfaces such defects earlier than a "build everything then validate" approach but does not prevent them from existing.

**Tau Prolog version-pinning issues.** The Phase 0 peer-dependency contract verifies Tau Prolog v0.3.4 is loaded but cannot guarantee Tau Prolog itself is bug-free. If Tau Prolog v0.3.4 has a bug that affects OFBT's correctness (e.g., the d0a6619 workaround Fandaws relies on), OFBT inherits it. Mitigation: comprehensive corpus testing surfaces such issues; resolution is upstream Tau Prolog work or a Tau Prolog version bump (which is a major OFBT version event).

**ARC manifest content errors.** The phasing protects against attribution confusion when ARC content is wrong, but does not prevent ARC content from being wrong. ARC authoring discipline (the v3 relations catalogue review process, the Verified/[VERIFY]/Draft status taxonomy per spec §3.3) is the primary defense. The phasing's contribution is making ARC content errors surface as Phase-N-specific failures rather than monolithic v0.1 failures.

**Fandaws-side legacy bug discovery during shim parallel-run.** When the shim runs in Phase 8's verification gate, Fandaws may discover legacy bugs not previously documented (i.e., bugs not in the expected-divergence baseline). These will surface as unexpected mismatches blocking the gate. Resolution is collaborative: Fandaws investigates; if the bug is legacy, it's added to the baseline; if the bug is OFBT, it's a patch release. The phasing protects OFBT's confidence (Phases 1-7 already passed) but does not eliminate the need for collaborative investigation.

**Consumer integration patterns that the spec underspecifies.** The spec specifies the API surface but consumers may use it in patterns the spec didn't anticipate. The §8.1.2 attribution edge case Aaron banked is one example: the spec is correct, but composing two `checkConsistency` calls with set-difference on `unverifiedAxioms` is a usage pattern the spec doesn't directly endorse. Mitigation: the consumer-side usage guide (Fandaws-authored, post-cutover) carries such patterns. Implementation cannot anticipate them all.

### 6.3 Risk monitoring during implementation

Each phase exit should include a brief retrospective: which risks materialized, which were absent, which new risks were observed. This information feeds back into the plan revision policy (§8) — if a risk consistently materializes in a particular phase, the next plan revision should address it (split the phase, add a fixture, adjust the validation ring, etc.).

---

## 7. Implementation Team Coordination

### 7.1 Phase entry and exit reviews

Each phase begins with an **entry review**: the team confirms the entry criteria are met, the test corpus is ready, the parallel workstreams are caught up. Each phase ends with an **exit review**: the team confirms the validation rings pass, the deliverables are complete, the risk retrospective is recorded.

Reviews are lightweight: a meeting plus a written summary committed to the repo. They are not gates against the spec (the spec doesn't require them); they are gates against the plan.

### 7.2 Cross-team handoffs

Three cross-team handoffs occur during v0.1 implementation:

**Aaron → engineering team for ARC manifest content.** ARC content authoring is Aaron's domain. Engineering consumes the authored content via the ARC loader. The handoff happens at each phase's entry: BFO content for Phase 4, IAO for Phase 5, CCO for Phase 6, OFI deontic for Phase 7. Engineering provides feedback on content that doesn't load cleanly or produces unexpected validation failures; Aaron revises and re-handoffs.

**Fandaws → OFBT team for Bucket C signature inventory.** This handoff happens once, before Phase 7 entry. Fandaws provides the inventory; OFBT consumes it to populate the shim's function list. Subsequent Bucket C additions on the Fandaws side may produce shim version bumps in Phase 8 or later.

**OFBT → Fandaws for v0.1 release.** This handoff happens at Phase 8 exit. OFBT publishes; Fandaws begins consumption. Subsequent OFBT patch releases (responding to verification gate findings) re-trigger the handoff.

### 7.3 Communication protocols

- **Spec questions during implementation:** raise as ADR proposals per spec §0.2.3. If the question is editorial (clarification, typo, broken link), it can be resolved as a patch revision; if substantive, it requires the post-freeze evidence-gated process.
- **API surface questions during implementation:** same as spec questions — the API spec is also frozen.
- **Plan questions during implementation:** raise as plan revision proposals per §8 of this document. Plan revisions are lighter-weight than spec revisions; they don't require the same evidence gates.
- **Cross-team blockers:** escalate immediately. ARC content blocks should escalate to Aaron; Fandaws-side blocks should escalate to Fandaws Architect.

---

## 8. Plan Revision Policy

This document is revisable in a way the spec is not. Revisions are expected as implementation reveals which sequencing choices were correct and which need adjustment.

### 8.1 What revisions are appropriate

- **Phase boundary adjustments:** if a phase is too large or too small, split or merge. If a phase's exit criteria are revealed to be over- or under-specified, adjust.
- **Validation ring refinements:** if a ring needs additional fixtures, add them. If a ring's pass criterion needs sharpening (e.g., "100 runs" becomes "1000 runs" for determinism), adjust.
- **Risk register additions:** as new risks surface during implementation, add them. As risks are resolved, mark them resolved (do not delete — historical visibility matters).
- **Spec-section-to-phase mapping corrections:** if a spec section is implemented in a different phase than originally planned, update the mapping.
- **Parallel-development opportunity additions:** as the team discovers new opportunities, document them.

### 8.2 What revisions are NOT appropriate

- **Spec-changing revisions:** the plan cannot extend, amend, or constrain the frozen spec. If implementation reveals a need to change the spec, that's a spec change governed by spec §0.2, not a plan revision.
- **Acceptance criteria changes:** the spec defines acceptance; the plan does not relax acceptance criteria. If a criterion is unachievable, that's a spec issue, not a plan issue.
- **Bundle budget relaxation:** the plan does not relax the §13.4.1 per-component caps. If implementation reveals the caps are unachievable, that's a spec change requiring the post-freeze evidence-gated process.

### 8.3 Revision process

Plan revisions are proposed in PRs, reviewed by the implementation team plus Aaron, and merged when consensus is reached. There is no formal review board. The revision history (§9) records all changes.

Revisions to this plan do not require coordination with Fandaws (the plan is OFBT-internal). Spec changes do require coordination per spec §0.2.

---

## 9. Plan Revision History

### v1.0 (this revision)

Initial publication of the implementation sequencing plan. Drafted alongside spec freeze (v0.1.7) to operationalize the frozen contract into a concrete build sequence.

Substantive content:

- Three-ring validation pipeline structure (§2)
- Eight-phase decomposition (§3)
- Spec-section-to-phase mapping (§4)
- Parallel development opportunities (§5)
- Risk register with explicit failure modes (§6)
- Implementation team coordination protocols (§7)
- Plan revision policy distinct from spec revision policy (§8)

The plan is expected to revise as implementation reveals which sequencing choices were correct and which need adjustment. Future revisions will be recorded in this section.

---

*End of OFBT v0.1 Implementation Sequencing Plan v1.0.*
