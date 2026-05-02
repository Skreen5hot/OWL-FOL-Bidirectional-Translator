# OFBT v0.1 Roadmap

This is the task tracker for the OFBT (OWL ↔ FOL Bidirectional Translator) v0.1 build. It is the operational view of [`OFBT_implementation_plan_v1 (1).md`](OFBT_implementation_plan_v1%20(1).md), which is the authoritative sequencing document. The frozen build target is [`OFBT_spec_v0.1.7.md`](OFBT_spec_v0.1.7.md) + [`OFBT_API_v0.1.7.md`](OFBT_API_v0.1.7.md).

**Current Phase:** Phase 1 — Built-In OWL Lifter (IN PROGRESS, Steps 1-3 of 9 complete; CI green on commit `33dd01e`, run `25259482075`). Phase 0 EXITED 2026-05-02 (CI runs `25258319623` and `25258966785` green on remote).

**Validation discipline:** every phase exits only when all three rings (Conversion Correctness, Round-Trip Parity + Audit Artifacts, Validator + Consistency Check) pass against the phase's corpus. See implementation plan §2.

**Phase gates:** Phase N+1 cannot begin until Phase N's exit criteria are met. Skipping a ring at a phase exit creates an unsafe phase exit.

---

## Phase 0 — Foundations

**Goal:** Establish package structure, peer-dependency contract, and error-class hierarchy. No conversion or evaluation logic yet.

**Status:** EXITED 2026-05-02. CI green (47/47 tests across 7 files; purity check + corpus manifest gate passing). See [`project/reviews/phase-0-exit.md`](reviews/phase-0-exit.md).

**Plan reference:** §3.1

### 0.1 Package and Build Tooling

**Status:** ✅ COMPLETE 2026-05-02 (commit `0ef7827`) | **Priority:** High

**Acceptance Criteria:**
- [x] `package.json` declares `tau-prolog@0.3.4` as peer dependency per API spec §13.7
- [x] `package.json` declares `rdf-canonize` as runtime dependency
- [x] ES Module structure per API spec §13.1; named exports preferred
- [x] esbuild configuration in place for browser + Node bundles
- [x] Bundle measurement script per API spec §13.4.3 (measurement only; no enforcement)
- [x] CI pipeline skeleton runs `npm run build`, `npm test`, `npm run test:purity`
- [x] **Purity checker (`scripts/ensure-kernel-purity.ts`) updated for OFBT-specific allowlist** (tightened further by ADR-006):
  - Forbidden in `src/kernel/`: `Date.now()`, `new Date()`, `Date.prototype.getTime()`, `Math.random()`, `crypto.getRandomValues`, `crypto.randomUUID`, `process.env`, `process.hrtime()`, `process.platform`, `process.argv`, `process.stdout`, `process.stderr`, `process.exit()`, `process.cwd()`, `process.pid`, `console.*`, `fetch`, `XMLHttpRequest`, dynamic `import('...')` with non-literal specifier, `require('fs')`, `require('http')`, all `node:*` builtins except `node:crypto`, all `crypto.*` except `crypto.subtle.digest`, iteration over plain `Object` literals where order matters (use `Map` with sorted keys), `Array.prototype.sort` without explicit comparator
  - **Allowlisted in `src/kernel/`:** `tau-prolog`, `rdf-canonize`, `crypto.subtle.digest` (SHA-256 only)
  - Imports from `src/composition/` or `src/adapters/` remain forbidden
- [x] Package imports successfully in Node v22+ (per `package.json` `engines.node`) and modern browsers

### 0.2 Typed Error Class Hierarchy

**Status:** ✅ COMPLETE 2026-05-02 (commit `0168fce`) | **Priority:** High

Implement all twelve error classes per API spec §10 plus `TauPrologVersionMismatchError`.

**Acceptance Criteria:**
- [x] `OFBTError` base class with documented fields (`code`, `libraryVersion`)
- [x] All 11 subclasses implemented: `ParseError`, `UnsupportedConstructError`, `IRIFormatError`, `RoundTripError`, `SessionRequiredError`, `SessionDisposedError`, `StepCapExceededError`, `SessionStepCapExceededError`, `CycleDetectedError`, `ARCManifestError`, `TauPrologVersionMismatchError`
- [x] Every subclass extends `OFBTError` and carries documented fields
- [x] Unit tests verify instantiation and field shape for each class (13 cases in `tests/errors.test.ts`)

### 0.3 Frozen Reason Enum

**Status:** ✅ COMPLETE 2026-05-02 (commit `0168fce`) | **Priority:** High

**Acceptance Criteria:**
- [x] `REASON_CODES` exported as `Object.freeze`d constant per API spec §11
- [x] All 16 enum members present
- [x] Mutation attempts throw at runtime (verified by 7 tests in `tests/reason-codes.test.ts`)
- [x] Consumers can switch exhaustively over the enum (`ReasonCode` discriminated union)

### 0.4 Version Surfacing and Tau Prolog Verification

**Status:** ✅ COMPLETE 2026-05-02 (commit `0168fce`; ADR-004 records the probe seam) | **Priority:** High

**Acceptance Criteria:**
- [x] Sync `getVersionInfo()` returns documented shape with `apiSpecVersion: '0.1.7'` per API spec §9.1
- [x] Sync `verifyTauPrologVersion()` per API spec §9.2: returns `{match: true, expected: '0.3.4', found: '0.3.4'}` when v0.3.4 is loaded; `{match: false, ...}` otherwise
- [x] Mismatches throw `TauPrologVersionMismatchError` with `expected`, `found`, `resolution` fields populated (verified by 9 tests in `tests/version.test.ts` via the `registerTauPrologProbe` testing seam per ADR-004)

### 0.5 Session Lifecycle Skeletons

**Status:** ✅ COMPLETE 2026-05-02 (commit `0168fce`) | **Priority:** High

**Acceptance Criteria:**
- [x] `createSession()` allocates Tau Prolog state and calls `verifyTauPrologVersion()` internally per API spec §13.7.2
- [x] `disposeSession()` releases resources fully (idempotent on re-call)
- [x] `disposeSession(null)` and `disposeSession(undefined)` throw `SessionRequiredError` per API spec §5.2
- [x] Session is caller-owned; no module-level singletons; frozen-config snapshot (verified by 11 tests in `tests/session.test.ts`)

### 0.6 ARC Manifest TSV→JSON-LD Migration

**Status:** ✅ Engineering scaffolding COMPLETE 2026-05-02 (commit `d990353`); SME-side Module-column population is the Aaron-led parallel workstream (per ADR-003) gating Phase 4 entry, not Phase 0 exit. | **Priority:** High | **Owner:** Aaron (Module column) + engineering (compiler tooling)

The current ARC catalogue is TSV-only (`project/relations_catalogue_v3.tsv`). Phases 4-7 cannot begin until the five JSON-LD modules per spec §3.6.1 exist. Per ADR-003 the engineering compiler scaffolding ships in Phase 0; the SME-authored `Module` column / `arc/module-assignments.json` population is the parallel SME workstream.

**Acceptance Criteria:**
- [ ] **(Aaron parallel workstream, gates Phase 4 entry)** `relations_catalogue_v3.tsv` gains a `Module` column assigning each row to one of the five modules from spec §3.6.1 — OR `arc/module-assignments.json` is populated as the transition affordance per ADR-003
- [x] Compiler scaffolding for five JSON-LD module file targets: `arc/core/bfo-2020.json`, `arc/core/iao-information.json`, `arc/cco/realizable-holding.json`, `arc/cco/mereotopology.json`, `arc/ofi/deontic.json` (`scripts/build-arc.js`; populates from TSV Module column or `arc/module-assignments.json`)
- [ ] **(Phase 7 deliverable per architect)** Disjointness commitments currently in the Notes column (rows 65-66 `discharges`/`violates`) are formalized into machine-readable axiom entries in `arc/ofi/deontic.json`
- [x] TSV remains as auto-generated human-readable view per spec §14 Q1 resolution (`scripts/regenerate-arc-tsv.js`)
- [x] Round-trip script: TSV → JSON-LD modules → regenerated TSV produces byte-identical TSV (`scripts/round-trip-arc.js`; runs in non-strict mode in Phase 0; `--strict` gates Phase 4 entry per the per-phase ARC Authoring Exit Criteria below)

### 0.7 SME Tooling and Authoring Infrastructure

**Status:** ✅ COMPLETE 2026-05-02 (commit `d990353`) | **Priority:** High | **Owner:** Engineering (tooling) + Aaron (conventions)

The Logic SME role authors ARC entries and test fixtures across Phases 1-7. Without explicit tooling and conventions in Phase 0, the SME workstream improvises and the engineering team can't lint authored content.

**Acceptance Criteria:**
- [x] `scripts/build-arc.js` — TSV → JSON-LD ARC module compiler (drives the round-trip script in 0.6)
- [x] `scripts/lint-arc.js` — checks every Verified ARC entry has at least one fixture (enforced under `--strict` per ADR-006 / S2 amendment); checks IRIs resolve against an offline canonical-vocabulary cache (BFO 2020, CCO 2.0, RO release, IAO release, PROV-O — see 0.7.1); checks declared parent properties exist in the entry's module or its declared dependencies; fails CI on violation under `--strict`
- [x] `arc/AUTHORING_DISCIPLINE.md` — per-entry sign-off ritual: required fields (including `subPropertyOf` per N2 amendment), Verified/[VERIFY]/Draft state machine, peer-review checklist
- [x] `tests/corpus/README.md` — fixture-authoring conventions: file-naming convention (`<phase>_<theme>_<intent>.fixture.js`), the plain-objects + JSDoc DSL discipline (no test-framework lock-in), the manifest-update-on-add discipline (see 0.8)
- [x] `tests/corpus/manifest.json` — initial empty manifest with schema documented (see 0.8)

#### 0.7.1 Canonical-Vocabulary IRI Cache (sub-item of 0.7)

**Status:** Code-complete (hand-seeded; canonical refresh is pre-Phase-4 SME work) | **Priority:** High | **Owner:** Engineering (infrastructure) + Aaron (canonical refresh)

`scripts/lint-arc.js` validates every ARC-entry IRI against an offline cache of canonical IRIs under `arc/vocabulary-cache/`. The cache IS the offline truth source; edge-canonical principle applies (no network at lint time). Phase 0 ships the infrastructure plus hand-seeded caches drawn from `relations_catalogue_v3.tsv` and the OFBT spec; pre-Phase-4 SME work refreshes each cache against actual canonical releases.

**Acceptance Criteria:**
- [x] `arc/vocabulary-cache/schema.json` — JSON Schema for cache files (vocabularyId, displayName, namespaceURI, iriPattern, version, retrievedAt, sourceURL, entries[]); per-entry fields include `type` (class / object-property / data-property / annotation-property / named-individual / datatype), optional `label`, `deprecated`, `unverified`, `seedSource`
- [x] Six per-vocabulary cache files seeded from existing repo content: `bfo-2020.json` (32 entries), `iao.json`, `ro.json`, `cco-2.0.json`, `prov-o.json`, `ofi-extension.json` — every seed entry carries `seedSource` provenance and (where pulled without canonical confirmation) `unverified: true`
- [x] `arc/vocabulary-cache/README.md` — purpose, format, refresh process, linter integration, scope (NOT a runtime dependency, NOT a TBox, NOT exhaustive)
- [x] `scripts/refresh-vocab-cache.js` — offline refresh tool consuming a user-supplied local `.owl`/`.ttl`/`.rdf`/`.nt`/`.xml` path; extracts IRIs via Turtle + RDF/XML regex parsers (no full-RDF parser dependency); merges into cache preserving SME-curated `seedSource` notes by default; supports `--dry-run` and `--prune`
- [x] `npm run refresh:vocab-cache` script wired in `package.json`
- [x] `scripts/lint-arc.js` extended with: cache loader, IRI routing by `iriPattern` regex, IRI-existence check (hard error), type-agreement check (object-property vs class — hard error), unverified-IRI surfacing (hard error in `--strict`), deprecated-IRI warning, unrouted-IRI warning. Lint summary line reports `cacheCheckedCount / cacheUnknownCount / cacheUnverifiedCount`.
- [x] `arc/AUTHORING_DISCIPLINE.md` updated: per-entry peer-review checklist gains the cache-presence item; new "Canonical-Vocabulary IRI Cache" section explains routing / existence / type-agreement / unverified-surfacing / unrouted-IRI behavior

**Pre-Phase-4 SME deliverable (NOT blocking Phase 0 exit; gating Phase 4 entry):**
- [ ] BFO 2020 cache refreshed against canonical `bfo-2020.owl` release; `unverified` flags cleared; `version` set to canonical release identifier
- [ ] `[VERIFY]` flags on rows 49 / 50 (BFO_0000222 / BFO_0000223) resolved against current `bfo-2020.owl`
- [ ] IAO, RO, CCO 2.0, PROV-O caches refreshed against their canonical releases
- [ ] `npm run lint:arc -- --strict` passes against the BFO module's seeded ARC content with zero unverified-IRI errors

### 0.8 Test Corpus Manifest

**Status:** ✅ COMPLETE 2026-05-02 (commit `d990353`; tightened by ADR-006 / S1 amendment requiring `expected_v0.2_elk_verdict` presence) | **Priority:** High | **Owner:** Aaron + engineering

The corpus needs machine-checkable traceability from fixture → spec section → ARC entry → expected outcome. API §14.11's coverage matrix CI lands at Phase 7, but per-phase corpus authoring (Phases 1-6) requires equivalent traceability from day one or fixtures drift from criteria.

**Acceptance Criteria:**
- [x] `tests/corpus/manifest.json` schema defined ([`tests/corpus/manifest.schema.json`](../tests/corpus/manifest.schema.json)) with the following per-fixture columns:
  - `fixtureId` (stable string, matches filename, pattern `^[a-z0-9_]+$`)
  - `phase` (1-7)
  - `specSections` (array of spec / API spec section refs)
  - `acceptanceCriteria` (array of §12 / API §14 criterion IDs the fixture exercises)
  - `arcEntries` (array of ARC entry IRIs the fixture exercises; empty for Phase 1-3 built-in OWL fixtures)
  - `regime` (`equivalent` | `reversible` | `true_loss`)
  - `expectedOutcome` (free-form structured per fixture type — entailment-set, consistency verdict, round-trip diff, etc.)
  - `expectedLossSignatureReasons` (array of reason-enum members; empty for clean round-trip fixtures)
  - `intendedToCatch` (free-text — what wrong translation or silent failure this fixture is engineered to expose; required non-empty)
  - `expected_v0.1_verdict` (the verdict v0.1 produces today)
  - `expected_v0.2_elk_verdict` (REQUIRED per ADR-006; `null` permitted but absent forbidden — collapses the ELK regression-suite signal otherwise). When ELK lands, fixtures whose v0.2 verdict differs from v0.1 are tracked as expected-upgrades; fixtures whose v0.1 verdict was `'undetermined'` and v0.2 verdict is definite are the regression-suite signal that ELK is doing what it should.
- [x] CI gate: every fixture under `tests/corpus/` has a manifest entry; every manifest entry references an existing fixture file; orphan entries and orphan fixtures fail CI (`scripts/check-corpus-manifest.ts`; runs in `npm run ci` and CI workflow)
- [x] Manifest update is part of the Definition of Done for any fixture-authoring PR (see `tests/corpus/README.md` from 0.7)

### Phase 0 Entry Review
- [x] Entry criteria confirmed met (spec v0.1.7 frozen, team assembled, Tau Prolog v0.3.4 confirmed; npm name reservation flagged as external, non-blocking)
- [x] Entry summary committed to repo: [`project/reviews/phase-0-entry.md`](reviews/phase-0-entry.md)

### Phase 0 Exit Review
- [x] All listed exit criteria pass in CI — verified 2026-05-02 locally then on remote (GitHub Actions runs `25258319623` and `25258966785`, both green); 47/47 tests pass; purity check green after fixing `canonicalize.ts` bare-sort
- [x] Risk retrospective recorded (per plan §6.3) in [`project/reviews/phase-0-exit.md`](reviews/phase-0-exit.md)
- [x] Exit summary committed to repo: [`project/reviews/phase-0-exit.md`](reviews/phase-0-exit.md) (commit SHAs + run IDs inserted in commit `7cefc25`)
- [x] ADRs logged: ADR-002 (purity allowlist), ADR-003 (TSV Module column ownership), ADR-004 (Tau Prolog probe seam), ADR-005 (CLI restructure), ADR-006 (tightened purity rules) in [`project/DECISIONS.md`](DECISIONS.md)

**Validation Rings:** N/A — no conversion or evaluation logic exists yet.

**NOT in scope:**
- Lifter, projector, validator (Phases 1-3)
- ARC manifest content (Phases 4-7)
- Bundle budget enforcement (Phase 7)

---

## Phase 1 — Built-In OWL Lifter

**Goal:** Implement `owlToFol` for OWL constructs whose semantics are fixed by the OWL standard, independent of any ARC manifest content.

**Status:** IN PROGRESS — Steps 1-3 of 9 complete (see Phase 1 Implementation Progress below). Phase 1 Entry Review committed 2026-05-02 ([`project/reviews/phase-1-entry.md`](reviews/phase-1-entry.md)). HIGH-PRIORITY domain/range correctness contract per API §3.7.1 closed at Step 3 with defense-in-depth: `p1_prov_domain_range` (right shape) + `canary_domain_range_existential` (wrong shape's absence via `assertForbiddenPatterns` helper).

**Plan reference:** §3.2

### Phase 1 Implementation Progress (Step-level tracker)

The architect ratified the corpus + canaries as the contract; the developer's internal nine-step sequencing per [`phase-1-entry.md`](reviews/phase-1-entry.md) §"Phase 1 Implementation Sequencing" is non-binding for the architect but useful for grounding here. Each Step activates a slice of the Deliverables Checklist below:

| Step | Scope | Status | Activates |
|---|---|---|---|
| 1 | `owlToFol` skeleton, IRI canonicalization (§3.10), JSON-LD-shaped output type definitions, §13.1 punted-construct rejection from day one, ABox lifting | ✅ Complete (commit `75d7c62`) | `canary_punned_construct_rejection`, `canary_iri_canonicalization`, `p1_abox_assertions`, `p1_owl_same_and_different` |
| 2 | TBox: SubClassOf / EquivalentClasses / DisjointWith / ClassDefinition; class-expression lifting for someValuesFrom / allValuesFrom / hasValue / IntersectionOf / UnionOf / ComplementOf | ✅ Complete (commit `33dd01e`; includes SME B1/B2/S2/S3/N1 amendments) | `p1_subclass_chain`, `p1_equivalent_and_disjoint_named`, `p1_restrictions_object_value` |
| 3 | RBox `ObjectPropertyDomain` + `ObjectPropertyRange` conditional translation (HIGH-PRIORITY per §3.7.1) | ✅ Complete (this session, pending commit; CI green locally 12/12 active tests) | `canary_domain_range_existential`, `p1_prov_domain_range` |
| 4 | `owl:sameAs` identity-aware predicate variants per spec §5.5.2 (propagation through other predicates, beyond Step 1's reserved-predicate facts) | ⏳ Pending | `canary_same_as_propagation` |
| 5 | RBox property characteristics (`Functional`, `Transitive`, `Symmetric`, `InverseOf`) with cycle-guarded rewrites per ADR-011 + **Skolem-naming convention ADR (anticipated ADR-007)** committing to one convention propagated to all STRUCTURAL_ONLY fixtures | ⏳ Pending | `p1_property_characteristics` |
| 6 | RDFC-1.0 blank-node canonicalization via `rdf-canonize`; uses Skolem prefix from Step 5 ADR | ⏳ Pending | `p1_blank_node_anonymous_restriction` |
| 7 | Cardinality restrictions (min / max / exact + qualified `onClass`); fills the second STRUCTURAL_ONLY placeholder using the Step 5 ADR convention | ⏳ Pending | `p1_restrictions_cardinality` |
| 8 | Datatype canonicalization per spec §5.6.5 (XSD canonical lexical-form normalization beyond pass-through); structural annotation declaration consistency machinery skeleton | ⏳ Pending | (informational; supports later phases) |
| 9 | 100-run determinism harness per API §6.1.1; STRUCTURAL_ONLY placeholders' byte-exact `expectedFOL` literals filled in consistently with the Step 5 ADR; `verifiedStatus: 'Draft'` → `'Verified'` promotion across the 13 fixtures | ⏳ Pending | (drives Phase 1 Exit Review) |

### Deliverables Checklist
Per-deliverable status reflects which Steps have landed. `~` indicates partially complete; `✅` complete; `⏳` pending.

- [~] `owlToFol()` per API spec §6.1 with structured OWL input handling per API spec §3 (Steps 1-3 complete; Steps 4-9 outstanding)
- [~] Class expressions: `Class`, `SubClassOf`, `EquivalentClasses`, `DisjointWith`, `ClassDefinition`, `ObjectIntersectionOf`, `ObjectUnionOf`, `ObjectComplementOf` (✅ all complete in Step 2)
- [~] Restrictions per API spec §3.4: `ObjectSomeValuesFrom`, `ObjectAllValuesFrom`, `ObjectHasValue` (✅ Step 2); all cardinality variants (⏳ Step 7 — currently throws `UnsupportedConstructError(construct: 'cardinality-restriction')` per SME B2 fix; honest-admission failure rather than wrong-arity emission)
- [~] ABox per API spec §3.5 (✅ Step 1); RBox `ObjectPropertyDomain` + `ObjectPropertyRange` (✅ Step 3); other RBox kinds (⏳ Step 5)
- [x] **HIGH PRIORITY:** `ObjectPropertyDomain` and `ObjectPropertyRange` lift to **conditional implications**, NOT existential restrictions (API spec §3.7.1, behavioral spec §5.8). PROV-O fixture (`p1_prov_domain_range`) verifies the right shape; canary (`canary_domain_range_existential`) verifies the wrong shape's absence. ✅ Step 3
- [x] IRI canonicalization per API spec §3.10 (input forms accepted, internal canonical, FOL output in full URI form) — Step 1; canary verifies three input forms produce byte-identical FOL
- [ ] Datatype canonicalization per spec §5.6.5 (XSD canonical lexical forms) — ⏳ Step 8 (Step 1 ships pass-through TypedLiteral handling)
- [~] Identity rules per spec §5.5 (`owl:sameAs` propagation) — Step 1 ships sameAs facts; Step 4 wires identity-aware predicate variants per §5.5.2
- [ ] RDFC-1.0 blank node canonicalization per spec §5.7 via `rdf-canonize` — ⏳ Step 6
- [x] JSON-LD-shaped FOL output per API spec §4 — Step 1
- [x] ARC manifest stub: `arcCoverage: 'permissive'` always (callers cannot select strict in Phase 1; strict-mode operational behavior arrives in Phase 4); properties go through §6.4 fallback with `unknown_relation` Loss Signature
- [x] Lifter rejects all spec §13.1 punted constructs with `UnsupportedConstructError`. The `construct` field names the specific construct (e.g., `'owl:hasKey'`, `'owl:NegativeObjectPropertyAssertion'`, `'punning'`, `'faceted-datatype-restriction'`, `'annotation-on-annotation'`). One test fixture per punted construct verifies the rejection. — Step 1; `canary_punned_construct_rejection` exercises all 5 cases

### Phase 1 Test Corpus
All 13 fixtures below are registered in [`tests/corpus/manifest.json`](../tests/corpus/manifest.json) per Phase 0.8 with `intendedToCatch` populated; manifest gate green. "Active" indicates the lifter passes the fixture; "deferred" indicates the activating Step has not yet landed.

- [x] **active** — Simple `subClassOf` chains ([`p1_subclass_chain`](../tests/corpus/p1_subclass_chain.fixture.js); Step 2)
- [x] **active** — `EquivalentClasses` and `DisjointWith` between named classes ([`p1_equivalent_and_disjoint_named`](../tests/corpus/p1_equivalent_and_disjoint_named.fixture.js); Step 2)
- [~] **partial** — Restriction variants: `ObjectSomeValuesFrom`, `ObjectAllValuesFrom`, `ObjectHasValue` active ([`p1_restrictions_object_value`](../tests/corpus/p1_restrictions_object_value.fixture.js); Step 2); cardinality deferred ([`p1_restrictions_cardinality`](../tests/corpus/p1_restrictions_cardinality.fixture.js); Step 7)
- [x] **active** — ABox class assertions, object property assertions, datatype property assertions ([`p1_abox_assertions`](../tests/corpus/p1_abox_assertions.fixture.js); Step 1)
- [x] **active** — `owl:sameAs` and `owl:differentFrom` between named individuals ([`p1_owl_same_and_different`](../tests/corpus/p1_owl_same_and_different.fixture.js); Step 1)
- [ ] **deferred** — Property characteristics: `Functional`, `Transitive`, `Symmetric`, `InverseOf` ([`p1_property_characteristics`](../tests/corpus/p1_property_characteristics.fixture.js); Step 5)
- [x] **active** — **PROV-O domain/range fixtures** (`prov:wasInfluencedBy` with domain + range both `prov:Entity`, plus property assertion) — verifies the conditional translation, asserts the existential wrong translation is absent ([`p1_prov_domain_range`](../tests/corpus/p1_prov_domain_range.fixture.js); Step 3)
- [ ] **deferred** — Blank-node-bearing class expressions (anonymous restrictions) ([`p1_blank_node_anonymous_restriction`](../tests/corpus/p1_blank_node_anonymous_restriction.fixture.js); Step 6)

#### Phase 1 Wrong-Translation Canary Set
Each canary asserts the **wrong** shape is absent, not just that the right shape is present. Failure of a canary indicates the lifter has regressed into a known-bad translation pattern.

- [x] **active** — [`canary_domain_range_existential.fixture.js`](../tests/corpus/canary_domain_range_existential.fixture.js) — PROV-O domain/range; asserts no `subClassOf [Restriction someValuesFrom Y]` synthesis on `X` (Step 3; uses `assertForbiddenPatterns` helper from SME N1)
- [ ] **deferred** — [`canary_same_as_propagation.fixture.js`](../tests/corpus/canary_same_as_propagation.fixture.js) — `same_as(a,b) ∧ p(a,c)` lifted; query for `p(b,c)` MUST be entailed; asserts the lifter does not silently drop identity propagation per spec §5.5 (renamed from `canary_sameAs_propagation` for Phase 0.8 manifest schema conformance — fixtureId pattern is `^[a-z0-9_]+$`) (Step 4)
- [x] **active** — [`canary_iri_canonicalization.fixture.js`](../tests/corpus/canary_iri_canonicalization.fixture.js) — same axiom expressed in three input IRI forms (full URI, CURIE, bracketed); asserts byte-identical lifted FOL across all three per API spec §3.10 (Step 1; bug-found-and-fixed during initial implementation, see commit `75d7c62` body)
- [x] **active** — [`canary_punned_construct_rejection.fixture.js`](../tests/corpus/canary_punned_construct_rejection.fixture.js) — input containing each spec §13.1 punted construct; asserts `UnsupportedConstructError` thrown with the construct-specific `construct` field, not silent acceptance with degraded output (Step 1; all 5 cases pass)

### Exit Criteria — Ring 1 only
- [ ] All corpus members lift to FOL with semantically correct output
- [ ] Determinism: each fixture produces byte-identical output across 100 runs
- [ ] PROV-O fixtures pass **structurally**: lifted FOL contains the conditional implication `∀x,y. wasInfluencedBy(x,y) → Entity(x)`, the symmetric range axiom, and the property assertion. The lifted FOL output structure is verified directly per API spec §3.7.1.1's example tree. Existential-restriction wrong translation is verified absent.
- [ ] **Entailment-query verification deferred:** `prov_entity(project_alpha)` cannot be tested at this phase — Phase 1 has no ARC modules loaded, so no `prov_entity` predicate exists from ARC. Entailment verification waits until PROV-O ARC content lands (Phase 4 or wherever PROV-O is incorporated).
- [ ] Blank node Skolem IDs are deterministic per RDFC-1.0
- [ ] IRI normalization handles all three input forms producing identical lifted FOL

**Rings 2 and 3:** deferred (projector and validator do not exist yet).

**Parallel opportunity:** projector (Phase 2) can begin in parallel against the stable JSON-LD-shaped FOL output type definitions.

**Aaron-led parallel workstream (per architect Phase 0 review gating item 3, plan §5.2):** ARC manifest content authoring begins at Phase 1 entry (not Phase 4 entry) and proceeds throughout Phases 1-7. The first deliverable is annotating `project/relations_catalogue_v3.tsv` with the `Module` column (or populating `arc/module-assignments.json`) so `scripts/build-arc.js --strict` can run with 0 skipped rows by Phase 4 entry. Beginning this in parallel with Phase 1 lifter implementation prevents Phase 4 from slipping when the ARC content workstream catches up to engineering.

### Phase 1 Entry Review
- [x] Entry criteria confirmed met (Phase 0 exited with green CI; built-in OWL test corpus authored — 9 standard fixtures + 4 wrong-translation canaries; Aaron's parallel ARC workstream commitment captured)
- [x] Test corpus ready for ingestion (13 fixtures registered in [`tests/corpus/manifest.json`](../tests/corpus/manifest.json) with complete 11-column entries; manifest gate green)
- [x] **Architect sign-off received 2026-05-02** on the corpus + canary scope, with banked principles: defense-in-depth on §3.7.1 / §5.8 (two fixtures), `phase4Reactivation` cross-phase activation pattern, schema-as-source-of-truth-over-roadmap, `hasOwnProperty` discrimination on column-presence checks
- [x] Entry summary committed to repo: [`project/reviews/phase-1-entry.md`](reviews/phase-1-entry.md)

### Phase 1 Exit Review
- [ ] All 13 corpus fixtures pass against running `owlToFol` (Ring 1)
- [ ] 100-run determinism on each fixture per API §6.1.1
- [ ] **Skolem-naming-convention ADR landed in [`project/DECISIONS.md`](DECISIONS.md)** (architect-banked Phase 1 exit commitment) — one convention covering cardinality witnesses, transitive/symmetric visited-ancestor threading, and RDFC-1.0 b-node Skolem prefix; tied to API §6.1.1 determinism contract
- [ ] **Three STRUCTURAL_ONLY placeholder fixtures filled in with byte-exact `expectedFOL` literals** consistent with the Skolem-naming ADR, applied uniformly (no fixture-by-fixture conventions): [`p1_restrictions_cardinality`](../tests/corpus/p1_restrictions_cardinality.fixture.js), [`p1_property_characteristics`](../tests/corpus/p1_property_characteristics.fixture.js), [`p1_blank_node_anonymous_restriction`](../tests/corpus/p1_blank_node_anonymous_restriction.fixture.js)
- [ ] `verifiedStatus: 'Draft'` on each fixture's `meta` promoted to `'Verified'`
- [ ] All listed exit criteria pass in CI
- [ ] Risk retrospective recorded (per plan §6.3)
- [ ] Exit summary committed to repo

---

## Phase 2 — Built-In OWL Projector and Round-Trip Parity

**Goal:** Implement `folToOwl` for the same constructs Phase 1 covers, plus audit artifact emission. Closes the bidirectional pipeline for built-in OWL.

**Status:** Not Started

**Plan reference:** §3.3

### Deliverables Checklist
- [ ] `folToOwl()` per API spec §6.2 (including `prefixes` parameter per C1 closure)
- [ ] Audit artifacts: `LossSignature`, `RecoveryPayload`, `ProjectionManifest` per API spec §6.4 with content-addressing and severity ordering per §6.4.1
- [ ] Three projection strategies per spec §6.1: Direct Mapping, Property-Chain Realization, Annotated Approximation
- [ ] `roundTripCheck()` per API spec §6.3 implementing the spec §8.1 parity criterion
- [ ] Default OWA negation handling per spec §6.3 (no `closedPredicates` yet — that ships with evaluation in Phase 3)

### Phase 2 Test Corpus
Every fixture below MUST be registered in `tests/corpus/manifest.json` per Phase 0.8.

- [ ] Phase 1 corpus exercised through `roundTripCheck`
- [ ] Blank-node class-expression projection edge cases
- [ ] Property-chain realization fixtures (simplified built-in OWL form; full RDM chain in Phase 7)
- [ ] Lossy fixtures with non-empty Loss Signatures (NAF residues against open predicates, true arity flattenings)

#### Phase 2 Strategy-Routing Fixtures
A correct emission of the **wrong** projection strategy is a Ring 2 pass that hides a real bug. These fixtures hand-label each axiom with its expected strategy and assert the projector chose it.

- [ ] `strategy_routing_direct.fixture.js` — axioms expressible in OWL 2 DL (subClassOf, equivalentClass, property characteristics); asserts strategy chosen is `'direct'`
- [ ] `strategy_routing_chain.fixture.js` — axioms whose derived implication is a property chain; asserts strategy chosen is `'property-chain'` and the emitted `owl:propertyChainAxiom` matches the expected chain
- [ ] `strategy_routing_annotated.fixture.js` — axioms exceeding OWL 2 DL expressivity; asserts strategy chosen is `'annotated-approximation'` and the structural annotation + machine-readable FOL string + round-trip identifier are all present per spec §6.1
- [ ] `strategy_routing_no_match.fixture.js` — pathological axiom for which no strategy applies; asserts the projector raises a documented diagnostic per spec §6.1 rather than silently picking a strategy

#### Phase 2 Parity Canaries (query-based, not graph-shape-based)
Lift, project, re-lift, then evaluate a query whose answer must match before/after. Catches lifter/projector composition bugs that aren't visible to either function in isolation.

- [ ] `parity_canary_query_preservation.fixture.js` — base KB has entailment `Q`; after lift→project→re-lift, query `Q` MUST still evaluate to `true` (not `'undetermined'`)
- [ ] `parity_canary_negative_query.fixture.js` — base KB has `Q` evaluating to `'undetermined'`; after round-trip, query `Q` MUST still evaluate to `'undetermined'` — NOT silently `false` (open-world preservation)
- [ ] `parity_canary_visual_equivalence_trap.fixture.js` — engineered such that a naive graph-shape comparison reports equivalence but the semantic content has shifted; query MUST detect the shift

### Exit Criteria — Rings 1 and 2
- [ ] Ring 1 still passes (Phase 1 exit criteria continue to hold)
- [ ] `roundTripCheck` returns `equivalent: true` for clean fixtures
- [ ] `roundTripCheck` returns `equivalent: true` modulo Recovery Payloads for reversible fixtures (spec §7.3)
- [ ] `roundTripCheck` returns `equivalent: false` with documented `diff` for lossy fixtures
- [ ] Audit artifact `@id` content-addressing produces stable identifiers across runs
- [ ] Loss Signature severity ordering honored
- [ ] `prefixes` parameter produces CURIE output when supplied; full-URI output when omitted

**Ring 3:** deferred.

### Phase 2 Entry Review
- [ ] Entry criteria confirmed met (Phase 1 exited with Ring 1 passing on built-in OWL corpus)
- [ ] Audit artifact type definitions stable (frozen in API spec §6.4)
- [ ] Entry summary committed to repo

### Phase 2 Exit Review
- [ ] All listed exit criteria pass in CI
- [ ] Risk retrospective recorded (per plan §6.3)
- [ ] Exit summary committed to repo

---

## Phase 3 — Validator, Evaluation, and Consistency Check

**Goal:** Implement validator and evaluation/consistency-check API. Closes Ring 3 against built-in OWL content. **First phase exit where the full validation pipeline operates against real content.**

**Status:** Not Started

**Plan reference:** §3.4

### Deliverables Checklist
- [ ] `evaluate()` per API spec §7.1 with `EvaluableQuery = FOLAtom | FOLConjunction` restriction per §7.5
- [ ] Three-state result per API spec §7.2; full reason enum producing correct codes
- [ ] Step caps per API spec §7.2 and §7.4: per-query default 10K; optional aggregate session cap; configurable throw-on-cap
- [ ] `UnsupportedConstructError` thrown for FOLAxiom variants outside `EvaluableQuery` subset, with `suggestion` field populated
- [ ] `checkConsistency()` per API spec §8.1 with No-Collapse Guarantee per spec §8.5
- [ ] `unverifiedAxioms` populated per API spec §8.1.1 when `reason === 'coherence_indeterminate'`
- [ ] Hypothetical-axiom case per API spec §8.1.2: `axiomSet` participates, contributes to `unverifiedAxioms`, does not persist
- [ ] Cycle detection per spec §5.4 and ADR-011 (visited-ancestor list); `cycle_detected` reason code; optional throw
- [ ] Per-predicate CWA per spec §6.3.2 and API spec §6.3 — `closedPredicates` parameter operational
- [ ] Structural annotation declaration consistency per API spec §2.1.1 — `structural_annotation_mismatch` thrown on detection
- [ ] ARC manifest version mismatch per API spec §2.1.2 — `arc_manifest_version_mismatch` thrown when session and conversion versions diverge
- [ ] Session-aggregate step cap per API spec §2.1 — `SessionStepCapExceededError` thrown when `maxAggregateSteps` exceeded

### Phase 3 Test Corpus
Every fixture below MUST be registered in `tests/corpus/manifest.json` per Phase 0.8. Both `expected_v0.1_verdict` and `expected_v0.2_elk_verdict` columns MUST be populated — `'undetermined'` fixtures with definite v0.2 verdicts will be the regression-suite signal that ELK has been integrated correctly.

- [ ] Phase 1 + Phase 2 corpus continues
- [ ] Consistent KBs (consistency check returns `true`)
- [ ] Inconsistent KBs (e.g., `Class equivalent to ObjectComplementOf(Class)`) — returns `false` with witnesses
- [ ] Horn-incomplete KBs — returns `'undetermined'` with populated `unverifiedAxioms`
- [ ] Cycle fixtures: class hierarchy with `EquivalentClasses` cycle; recursive predicate definition
- [ ] Per-predicate CWA fixtures: queries with `closedPredicates` set producing `false` results that the same query without closure produces as `'undetermined'`
- [ ] Step cap fixtures: queries exhausting 10K default; sessions exhausting aggregate cap

#### Phase 3 No-Collapse Adversarial Corpus
The canonical adversarial set the SME role exists to author. Each fixture is engineered to expose a specific class of silent-pass failure in the No-Collapse Guarantee machinery. Fixtures with BFO-vocabulary dependencies are gated on Phase 4 ARC content and re-exercised at Phase 4 exit (noted inline).

- [ ] `nc_self_complement.fixture.js` — class equivalent to its own complement; MUST return `consistent: false` with the equivalent-to-complement witness chain
- [ ] `nc_horn_incomplete_disjunctive.fixture.js` — non-Horn inconsistency requiring tableau reasoning the Horn fragment cannot reach; MUST return `'undetermined'` with populated `unverifiedAxioms`, NOT silently `consistent: true`
- [ ] `nc_horn_incomplete_existential.fixture.js` — similar to disjunctive but the incompleteness arises from existential quantification the Horn fragment cannot witness; MUST return `'undetermined'` with a different reason than the disjunctive case
- [ ] `nc_silent_pass_canary.fixture.js` — engineered specifically to catch the wrong silent-pass behavior: a KB that classical FOL would judge inconsistent but a naive Horn-only check would judge `true`; MUST NOT return `consistent: true`
- [ ] `nc_bfo_continuant_occurrent.fixture.js` — **gated on Phase 4 BFO ARC**; Continuant ⊓ Occurrent disjointness from BFO Disjointness Map; MUST return `consistent: false` once BFO ARC loaded; held as Draft fixture in Phase 3 corpus, activated in Phase 4
- [ ] `nc_sdc_gdc.fixture.js` — **gated on Phase 4 BFO ARC (or Phase 7 if SDC/GDC distinction lives in OFI deontic content)**; SDC ∩ GDC disjointness via property-chain decomposition

#### Phase 3 Hypothetical-Axiom Set (API §8.1.2)
Three fixtures pinning down the canonical hypothetical-reasoning cases plus an explicit non-persistence verification.

- [ ] `hypothetical_inconsistency.fixture.js` — base KB consistent; `axiomSet` introduces inconsistency; `checkConsistency(session, axiomSet)` returns `consistent: false` with witnesses
- [ ] `hypothetical_horn_incompleteness.fixture.js` — base KB consistent; `axiomSet` introduces Horn-incompleteness without inconsistency; `checkConsistency(session, axiomSet)` returns `consistent: 'undetermined'` with populated `unverifiedAxioms`
- [ ] `hypothetical_clean.fixture.js` — base KB consistent; `axiomSet` extends consistently; `checkConsistency(session, axiomSet)` returns `consistent: true`
- [ ] `hypothetical_non_persistence.fixture.js` — runs `checkConsistency(session, axiomSet)` then `checkConsistency(session)` against the same session; second call MUST see the original session state, not the hypothetical extension; verifies the API §8.1.2 non-persistence guarantee

### Exit Criteria — Rings 1, 2, and 3 all passing on built-in OWL
- [ ] All Phase 1 and Phase 2 exit criteria continue to hold
- [ ] Spec §12 acceptance criteria 1-15 pass on built-in OWL corpus where applicable
- [ ] API spec §14 acceptance criteria API-1 through API-7 pass
- [ ] Every unsupported FOLAxiom variant throws `UnsupportedConstructError` with documented `suggestion` field

### Phase 3 Entry Review
- [ ] Entry criteria confirmed met (Phase 2 exited; Rings 1 and 2 passing on built-in OWL)
- [ ] Entry summary committed to repo

### Phase 3 Exit Review
- [ ] All listed exit criteria pass in CI
- [ ] Risk retrospective recorded (per plan §6.3)
- [ ] Exit summary committed to repo

---

## Phase 4 — BFO 2020 Core ARC Module

**Goal:** Author and load the first real ARC manifest module. Re-run the full validation pipeline against BFO 2020 core content.

**Status:** Not Started

**Plan reference:** §3.5

**Parallel workstream (Aaron-led, must complete before Phase 4 entry):** BFO 2020 ARC content authoring against the v3 relations catalogue.

### Phase 4 Entry Checklist (must close before phase begins)
- [ ] **All BFO 2020 ARC entries are status Verified; no `[VERIFY]` or Draft entries remain in BFO core module**
- [ ] **Resolve `[VERIFY]` on rows 49 (First Instant Of) and 50 (Last Instant Of) against current `bfo-2020.owl` release**
- [ ] BFO 2020 ARC content authored, reviewed, and ingested into `arc/core/bfo-2020.json`

### Phase 4 ARC Authoring Exit Criteria (per `arc/AUTHORING_DISCIPLINE.md`)
- [ ] Every Verified BFO entry has at least one passing fixture in `tests/corpus/` registered in the manifest
- [ ] Every Verified BFO entry has been peer-reviewed against canonical literature (BFO 2020 spec, RO release) with the citation captured in the entry's metadata
- [ ] All BFO Disjointness Map commitments declared in the catalogue Notes are formalized as machine-readable axioms in `arc/core/bfo-2020.json`
- [ ] All bridge axioms (Connected With per spec §3.4.1) are present with explicit FOL definitions in CL or KIF
- [ ] `scripts/lint-arc.js --strict` passes against the BFO module with zero violations (worked-example coverage enforced; not just informational)
- [ ] `scripts/build-arc.js --strict` reports 0 skipped rows for the BFO module — no row in `relations_catalogue_v3.tsv` lacks a `Module` assignment that would silently drop it from the bundle
- [ ] `scripts/round-trip-arc.js --strict` passes (TSV → JSON-LD → TSV byte-equivalent over shared columns)

### Deliverables Checklist
- [ ] `arc/core/bfo-2020.json` per spec §3.6.1 (≤ 40 KB minified target) — *generated from TSV per Phase 0.6 migration*
- [ ] ARC module loader per spec §3.6.2; `arcModules` parameter on `LifterConfiguration` operational
- [ ] Tree-shaking when modules are not declared
- [ ] ARC module dependency validation per spec §3.6.4: throws `ARCManifestError` if a declared module's dependencies are not also loaded; error message names the missing dependency
- [ ] Strict mode operational against BFO 2020 vocabulary
- [ ] BFO Disjointness Map firings against built-in OWL `DisjointWith`
- [ ] Connected With as primitive (spec §3.4.1) with bridge axiom and inferential closure

### Phase 4 Test Corpus
Every fixture below MUST be registered in `tests/corpus/manifest.json` per Phase 0.8.

- [ ] Phase 1-3 corpus continues
- [ ] Parthood transitivity, dependence relations, realization chains
- [ ] BFO Disjointness Map: Continuant ⊓ Occurrent → ⊥; SDC ⊓ GDC → ⊥
- [ ] Connected With fixtures exercising bridge axiom against cycle detection
- [ ] Strict mode: BFO-only ontologies succeed; non-BFO properties fail with `ARCManifestError`
- [ ] Activate the Phase 3 No-Collapse adversarial fixtures gated on BFO ARC (`nc_bfo_continuant_occurrent.fixture.js`; `nc_sdc_gdc.fixture.js` if SDC/GDC live in BFO core rather than OFI deontic)
- [ ] PROV-O entailment fixture (deferred from Phase 1): once BFO ARC plus PROV-O alignment is loaded, `prov_entity(project_alpha)` and `prov_entity(project_beta)` MUST be entailed via the conditional implications

#### Phase 4 Wrong-Translation Canary Set
- [ ] `canary_connected_with_overlap.fixture.js` — Connected With must be lifted as a primitive plus the spec §3.4.1 bridge axiom; asserts the lifter does NOT collapse it to a defined-as-overlap form (the wrong translation that loses the primitive's load-bearing role in mereotopological closure)
- [ ] `canary_bfo_disjointness_silent_pass.fixture.js` — Continuant + Occurrent assertion on the same individual; asserts `checkConsistency` returns `false` with the BFO Disjointness Map witness, NOT silently `true`

### Exit Criteria — Rings 1-3 on built-in OWL + BFO 2020
- [ ] All Phase 3 exit criteria continue to hold
- [ ] All BFO 2020 corpus members pass Rings 1-3
- [ ] Strict + permissive mode behaviors verified
- [ ] BFO Disjointness Map firings produce expected witnesses
- [ ] Connected With closure produces expected entailments without infinite resolution loops
- [ ] **Coverage matrix (API §14.11) cells attributable to BFO 2020 corpus exercised by passing tests:** criteria 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 13 (partial), 15 (partial); plus API-2, API-4, API-6, API-9 (partial)

### Phase 4 Exit Review
- [ ] All listed exit criteria pass in CI
- [ ] Risk retrospective recorded (per plan §6.3) — BFO content interactions surfaced, attributed, logged
- [ ] Exit summary committed to repo

---

## Phase 5 — IAO Information Bridge ARC Module

**Goal:** Add IAO information-bridge ARC on top of BFO 2020 core.

**Status:** Not Started

**Plan reference:** §3.6

### Phase 5 Entry Checklist (must close before phase begins)
- [ ] **All IAO ARC entries are Verified — resolve `[VERIFY]` on rows 53-55 (Denotes, Designates, Is Token Of)**
- [ ] IAO ARC content authored, reviewed, and ingested into `arc/core/iao-information.json`

### Phase 5 ARC Authoring Exit Criteria (per `arc/AUTHORING_DISCIPLINE.md`)
- [ ] Every Verified IAO entry has at least one passing fixture in `tests/corpus/` registered in the manifest
- [ ] Every Verified IAO entry has been peer-reviewed against canonical literature (IAO release) with citation captured
- [ ] `scripts/lint-arc.js --strict` passes against the IAO module with zero violations
- [ ] `scripts/build-arc.js --strict` reports 0 skipped rows for the IAO module

### Deliverables Checklist
- [ ] `arc/core/iao-information.json` per spec §3.6.1 (≤ 10 KB minified target) covering `is_about`, `denotes`, `is_token_of`

### Phase 5 Test Corpus
Every fixture MUST be registered in `tests/corpus/manifest.json`.

- [ ] Built-in OWL + BFO 2020 + IAO fixtures
- [ ] ICE that `is_about` a Material Entity with dependence relations entailed
- [ ] Cross-module: BFO realization of IAO Document that `denotes` a BFO Continuant

### Exit Criteria — Rings 1-3 on built-in OWL + BFO + IAO
- [ ] All Phase 4 exit criteria continue to hold
- [ ] All IAO corpus members pass Rings 1-3
- [ ] **Coverage matrix (API §14.11) cells attributable to PROV-O corpus where covered by current ARC content exercised:** criteria 1, 2 (partial), 4 (partial), 7, 8, 9, 10, 11 (partial), 12 (partial), 13 (canonical), 15 (partial); plus API-2, API-4, API-6, API-9 (canonical)

Structural smoke test of the modular ARC discipline.

### Phase 5 Exit Review
- [ ] All listed exit criteria pass in CI
- [ ] Risk retrospective recorded (per plan §6.3)
- [ ] Exit summary committed to repo

---

## Phase 6 — CCO Modules

**Goal:** Add CCO realizable-holding and mereotopology ARC modules.

**Status:** Not Started

**Plan reference:** §3.7

### Phase 6 Entry Checklist (must close before phase begins)
- [ ] **All CCO realizable-holding entries are Verified — resolve `[VERIFY CCO IRI]` on rows 56-60 (Has Role, Has Disposition, Has Function, Agent In, Patient In)**
- [ ] CCO realizable-holding and mereotopology ARC content authored, reviewed, and ingested

### Phase 6 ARC Authoring Exit Criteria (per `arc/AUTHORING_DISCIPLINE.md`)
- [ ] Every Verified CCO realizable-holding entry has at least one passing fixture in `tests/corpus/` registered in the manifest
- [ ] Every Verified CCO mereotopology entry has at least one passing fixture
- [ ] Every Verified CCO entry has been peer-reviewed against canonical literature (CCO 2.0 release) with citation captured
- [ ] `scripts/lint-arc.js --strict` passes against both CCO modules with zero violations
- [ ] `scripts/build-arc.js --strict` reports 0 skipped rows for the CCO modules

### Deliverables Checklist
- [ ] `arc/cco/realizable-holding.json` per spec §3.6.1 (≤ 15 KB minified target) covering `has_role`, `has_disposition`, `has_function`, `agent_in`, `patient_in`
- [ ] `arc/cco/mereotopology.json` per spec §3.6.1 (≤ 5 KB minified target) — Connected With CCO-specific extensions

### Phase 6 Test Corpus
Every fixture MUST be registered in `tests/corpus/manifest.json`.

- [ ] Built-in OWL + BFO + IAO + CCO fixtures
- [ ] CCO Geospatial: spatial regions, locations, mereotopological closures
- [ ] CCO Agent: agents with roles, dispositions, functions
- [ ] Cross-module: CCO Agent participates_in (BFO) a process described by IAO documentation

### Exit Criteria — Rings 1-3 on built-in OWL + BFO + IAO + CCO
- [ ] All Phase 5 exit criteria continue to hold
- [ ] All CCO corpus members pass Rings 1-3
- [ ] **Coverage matrix (API §14.11) cells for CCO Geospatial and CCO Agent exercised**
- [ ] **Domain/range canonical exerciser (criterion 13) passing both via PROV-O (already in scope) and CCO patterns**

Largest content expansion; most likely phase to surface module-interaction bugs.

### Phase 6 Exit Review
- [ ] All listed exit criteria pass in CI
- [ ] Risk retrospective recorded (per plan §6.3) — module-interaction bugs surfaced, attributed, logged
- [ ] Exit summary committed to repo

---

## Phase 7 — OFI Deontic ARC Module and Compatibility Shim

**Goal:** Add the final v0.1 ARC module (OFI deontic, RDM v1.2.1 chain). Implement the compatibility shim. Land bundle budget enforcement and test corpus coverage matrix CI.

**Status:** Not Started

**Plan reference:** §3.8

**Cross-team dependency:** Fandaws Bucket C helper signature inventory (per spec §17.7) required before Phase 7 entry.

### Phase 7 ARC Authoring Exit Criteria (per `arc/AUTHORING_DISCIPLINE.md`)
- [ ] Every Verified OFI deontic entry has at least one passing fixture in `tests/corpus/` registered in the manifest
- [ ] Every Verified OFI entry has been peer-reviewed against canonical literature (RDM v1.2.1 spec, constitution.ttl Article I) with citation captured
- [ ] All directive/commitment disjointness commitments declared in the catalogue Notes are formalized as machine-readable axioms in `arc/ofi/deontic.json` (resolves rows 65-66 `discharges`/`violates` from Phase 0.6)
- [ ] `scripts/lint-arc.js --strict` passes against the OFI deontic module with zero violations
- [ ] `scripts/build-arc.js --strict` reports 0 skipped rows for the OFI deontic module
- [ ] `npm run test:arc-roundtrip -- --strict` wired into CI as a gated step

### Deliverables Checklist
- [ ] `arc/ofi/deontic.json` per spec §3.6.1 (≤ 15 KB minified target) — directives, commitments, RDM v1.2.1 chain
- [ ] `@ontology-of-freedom/ofbt-compat-fandaws` package per API spec §12 with all Bucket C helper signatures backed by OFBT calls
- [ ] Parallel-run mode per API spec §12.3 with `expectedDivergences` mechanism per §12.3.1
- [ ] Bundle budget CI gating per API spec §13.4: regressions block PRs
- [ ] Test corpus coverage matrix CI per API spec §14.11

### Phase 7 Test Corpus
Every fixture MUST be registered in `tests/corpus/manifest.json`.

- [ ] Built-in OWL + BFO + IAO + CCO + OFI deontic
- [ ] constitution.ttl Article I §2 pipeline (spec §14 Q5)
- [ ] Full RDM v1.2.1 chain fixture exercising property-chain realization
- [ ] Structural annotation fixtures using interim Fandaws IRIs

#### Phase 7 Wrong-Translation Canary Set
- [ ] `canary_realizes_directive_naive_subproperty.fixture.js` — `realizes_directive` MUST decompose into the property chain (VerbPhrase DiscourseReferent + DirectiveICE + PlanSpecification + RealizableEntity); asserts the projector does NOT collapse it to a naive `subPropertyOf` (the wrong translation that loses the chain decomposition the RDM v1.2.1 contract depends on). The test verifies the property-chain realization strategy fired, not that the output round-trips.
- [ ] `canary_directive_disjointness_silent_pass.fixture.js` — directive that simultaneously discharges and violates a commitment; `checkConsistency` MUST return `false` with the OFI deontic disjointness witness, NOT silently `true`

### Exit Criteria — v0.1 IMPLEMENTATION COMPLETE
- [ ] Rings 1-3 passing on full v0.1 corpus
- [ ] All v0.1.7 spec §12 acceptance criteria 1-15 pass
- [ ] All API spec §14 acceptance criteria API-1 through API-11 pass
- [ ] Compatibility shim parallel-run mode operational
- [ ] Bundle budget CI passing: OFBT core ≤ 100 KB, rdf-canonize ≤ 50 KB, ARC core ≤ 50 KB, total mandatory ≤ 200 KB
- [ ] Coverage matrix fully exercised end-to-end; per-phase cells (Phases 4, 5, 6) consolidated; "n/a" cells documented with rationale
- [ ] Expected-divergence mechanism verified against synthetic baseline entries

### Phase 7 Entry Review
- [ ] Entry criteria confirmed met (Phase 6 exited; OFI deontic ARC content authored; Fandaws Bucket C inventory provided)
- [ ] Entry summary committed to repo

### Phase 7 Exit Review
- [ ] All listed exit criteria pass in CI
- [ ] Risk retrospective recorded (per plan §6.3)
- [ ] Exit summary committed to repo — **marks v0.1 implementation complete**

---

## Phase 8 — Verification Gate Support and Release

**Goal:** Support Fandaws's verification cycle gate. Tag and publish v0.1.0.

**Status:** Not Started

**Plan reference:** §3.9

**Fundamentally collaborative:** cannot complete without Fandaws-side participation.

### Deliverables Checklist
- [ ] Verification Gate Guide per API spec §15.4 (installation, parallel-run config, mismatch interpretation)
- [ ] Response to Fandaws-side gate findings: investigate, attribute (OFBT bug vs undocumented legacy bug), fix or baseline
- [ ] `@ontology-of-freedom/ofbt@0.1.0` and `@ontology-of-freedom/ofbt-compat-fandaws@0.1.0` published to npm
- [ ] Tagged release, changelog, README finalized

### Exit Criteria
- [ ] Fandaws verification gate passes per API spec §15.3 + §15.3.1
- [ ] npm packages published and installable
- [ ] Any Phase 8 patch releases are themselves green per Phases 1-7 validation rings

### Phase 8 Entry Review
- [ ] Entry criteria confirmed met (Phase 7 exited; Fandaws ready to run gate)
- [ ] Entry summary committed to repo

### Phase 8 Exit Review
- [ ] All listed exit criteria pass in CI
- [ ] Risk retrospective recorded (per plan §6.3)
- [ ] Exit summary committed to repo — **v0.1.0 release tagged and published**

---

## Cross-cutting Concerns

These run continuously across phases, not as discrete tasks.

### Determinism Discipline (every phase)
No `Date.now()`, `Math.random()`, UUID generation, or insertion-order-dependent iteration in conversion or evaluation paths. Blank node Skolem IDs come from RDFC-1.0 canonical labeling. Same input + same `arcManifestVersion` + same library version → byte-identical output.

### Bundle Budget Visibility (Phases 0-6 measurement; Phase 7 enforcement)
Bundle measurement script reports current sizes throughout. Per-component caps from API spec §13.4.1 are upper bounds, not target sizes.

### ADR Discipline
Spec deviations require ADR proposals with implementation evidence per spec §0.2. Plan revisions follow plan §8 (lighter-weight than spec revisions). All ADRs land in [`DECISIONS.md`](DECISIONS.md).

### Layer Boundaries (per OFBT project conventions; enforced by `npm run test:purity`)
- `src/kernel/` (purity-enforced): lifter, projector, validator, RDFC-1.0 canonicalization, ARC axiom injection, audit artifact emission, Tau Prolog session orchestration, JSON-LD canonicalization, content-hash addressing
- `src/composition/`: session lifecycle (`createSession`/`disposeSession`), ARC module loader, configuration types, mismatch detection (`structural_annotation_mismatch`, `arc_manifest_version_mismatch`)
- `src/adapters/`: `parseOWL` (text-format parser wrapper, the only function that touches text parsing per API §0.2), npm packaging, ESM entry points, optional CLI, compatibility shim package
- Kernel imports nothing from composition or adapters. **Allowlisted external imports in kernel:** `tau-prolog`, `rdf-canonize`, `crypto.subtle.digest` (deterministic SHA-256 only — `crypto.getRandomValues` and `crypto.randomUUID` remain forbidden).
- **Why Tau Prolog goes in the kernel, not the adapter:** Tau Prolog is the FOL execution substrate, not infrastructure peripheral to it. Same input clauses + same query → same answer set; the non-determinism risk is how the kernel uses Tau Prolog, not Tau Prolog itself. Routing it through `src/adapters/` would let kernel code escape the purity gate. The `setTimeout(0)` cooperative-scheduling chain Tau Prolog uses internally does not violate purity — determinism is about the content of the answer, not the timing of its return.
- The purity checker enforces the prohibitions in spec §0.1, §12.9, and Fandaws Consumer Requirement §1.3.

### Phase Entry/Exit Review Discipline (plan §7.1)
Every phase carries explicit Entry Review and Exit Review checklists in this roadmap. Reviews are committed as written summaries to the repo (e.g., `project/reviews/phase-N-entry.md`, `project/reviews/phase-N-exit.md`). They are gates against the plan, not the spec. Skipping reviews under deadline pressure is the failure mode this discipline exists to prevent.

### ARC Authoring Discipline (Phases 4-7)
SME-authored ARC content has its own gates separate from engineering deliverables: per-entry sign-off (Verified / [VERIFY] / Draft), peer-review against canonical literature with citation capture, worked-example coverage (every Verified entry has at least one passing fixture), bridge-axiom and disjointness-axiom completeness. The full ritual lives in `arc/AUTHORING_DISCIPLINE.md` (Phase 0.7 deliverable). Each ARC-bearing phase (4, 5, 6, 7) carries an explicit "ARC Authoring Exit Criteria" subsection enumerating the per-module checks; `scripts/lint-arc.js` enforces in CI.

### Test Corpus Manifest Discipline (every phase that authors fixtures)
Every fixture under `tests/corpus/` MUST be registered in `tests/corpus/manifest.json` per the schema in Phase 0.8. Orphan fixtures (no manifest entry) and orphan entries (no fixture file) fail CI. The manifest is the machine-checkable traceability layer that lets the API §14.11 coverage-matrix CI in Phase 7 verify per-phase claims rather than re-validating from scratch. The `expected_v0.2_elk_verdict` column is the regression-suite signal for ELK integration: fixtures whose v0.1 verdict is `'undetermined'` and whose v0.2 verdict is definite are the ones ELK MUST upgrade once it lands.

### Failure-Triage Handoff Protocol (Engineering ↔ SME, Phases 4-7)
Plan §7.2 covers Aaron → engineering content handoff. The reverse handoff is equally load-bearing: when a Ring N failure is suspected to be ARC-content rather than conversion machinery, engineering files an issue with: failing fixture ID (per manifest), observed result, expected result, and the witness chain Tau Prolog produced (or the absence of one). Aaron reclassifies as ARC bug / fixture bug / machinery bug and routes accordingly. Without this protocol, Phase 4-7 failures sit in a no-mans-land between engineering and SME ownership.

---

## Out of Scope for v0.1

Per spec §13 and §17.5 (do not work on these in any v0.1 phase):
- ELK reasoner integration (v0.2)
- SPARQL endpoint (v0.2 candidate)
- OWL Functional Syntax input (v0.2 candidate)
- TagTeam.js bridge (v0.3+)
- Fandaws-Sentinel orchestration integration (v0.4+)
- SLG tabling for SLD termination (v0.2 planned)
