# ARC Authoring Discipline

This document is the standing reference for content-authoring discipline across the project. The first two sections describe the cross-cutting collaboration model (path-fencing + single-committer); the remaining sections describe the per-entry sign-off ritual for ARC manifest content and corpus-fixture content.

## Section 0 — Path-Fencing Protocol

[Introduced at Phase 1 mid-phase ratification 2026-05-02; formalized at Phase 1 exit doc pass.]

The project operates with multiple content-authoring roles (SME, Developer, Architect) all working in the same repository. Path-fencing prevents authoring authority from colliding with commit authority. Six items:

1. **Path-domain ownership.** Each role owns a path domain. Content authored in another role's domain routes through that role's discipline before commit.

   | Role | Path domain |
   |---|---|
   | SME | `demo/`, `.github/workflows/pages.yml`, `arc/vocabulary-cache/`, `arc/upstream-canonical/`, `arc/AUTHORING_DISCIPLINE.md`, fixture content under `tests/corpus/*.fixture.js`, manifest entries in `tests/corpus/manifest.json` |
   | Developer | `src/kernel/`, `src/composition/`, `src/adapters/`, `tests/lifter-phase1.test.ts`, `scripts/`, `project/DECISIONS.md`, `project/ROADMAP.md`, `project/reviews/` |
   | Architect | (read-only on substance; ratification text routes through Developer / Orchestrator) |

   Authoring content in another role's path domain is permitted (e.g., SME authors fixture files that physically live under `tests/corpus/`); the routing discipline applies at COMMIT time, not at authoring time.

2. **Pull-before-commit.** Before each commit run `git fetch` and check whether `origin/main` has advanced. If it has, `git pull --rebase` to absorb upstream commits into local history before pushing. Linear history; no merge commits muddying the audit trail.

3. **Explicit `git add <paths>` only.** Never `git add .` or `git add -A`. Stage files by explicit path. This guarantees that other roles' work-in-progress files in the same working tree don't accidentally land in the wrong commit.

4. **Pre-commit `git status --short` review with explicit naming.** Before staging, verify the working tree state. Any file present that isn't part of the planned commit gets named explicitly ("flagging X — not mine; staying unstaged"). Catches both accidental staging and partial-commit-not-pushed ambiguity.

5. **Commit-message prefix discipline.** Distinguishable prefixes for `git log --grep` filterability:

   | Prefix | Scope |
   |---|---|
   | `Phase N Step M:` | Developer-domain work on the lifter / projector / validator implementation |
   | `corpus:` | SME-domain content (fixtures, manifest entries, vocabulary-cache updates, ARC content) committed by Developer per single-committer model |
   | `chore: vendor` | Upstream canonical sources vendored into `arc/upstream-canonical/` |
   | `chore:` | General housekeeping (config, tooling, dependency updates) |
   | `docs:` | Documentation-only changes (this file, ADRs, READMEs, doc-pass formalizations) |
   | `demo:` | Demo-site and Pages-deploy-workflow work in the SME `demo/` path domain |
   | `Phase N:` | Cross-cutting Phase entry/exit reviews and risk retrospectives |

6. **Boundary-violation escalation as routing decision, not implementation decision.** When path-domain overlap surfaces (e.g., SME content needs a developer-domain commit, or vice versa), escalate the routing question rather than autonomously resolving. Same posture as architect/SME escalation cycles. The boundary discipline is what prevents two-role contamination; resolving via routing preserves it.

Banked observation from the BFO/CLIF parity routing cycle: the SME catching their own path-boundary crossing mid-cycle, stopping, and routing for ratification rather than continuing to cascade is the discipline working as designed.

## Section 0.1 — Single-Committer Model

[Introduced at Phase 1 mid-phase ratification 2026-05-04; extension of path-fencing.]

After the BFO/CLIF parity routing cycle's reconciliation work surfaced two-role-commit-coordination issues (partial-commit-not-pushed ambiguity, push-ordering confusion when both SME and Developer hold commit authority), the project adopted a single-committer model:

1. **Sole committer: Developer.** Every `git add` / `git commit` / `git push` operation runs through Developer.

2. **SME role: content authorship + review-via-natural-language.** SME authors content into the working tree (path-fenced per Section 0); routes proposed commits to Developer with the suggested commit message + scope; Developer reviews the substance and either commits (with the routed message or a revision), holds, or requests changes via natural-language reply.

3. **Path-fencing stays unchanged for AUTHORSHIP.** SME authors content in their path domain (and may author content destined for the Developer's path domain when the architect-banked discipline assigns content-authorship to SME — e.g., corpus fixtures, manifest entries, vocabulary cache, ARC entries). Developer authors implementation in their path domain. The single-committer model only consolidates COMMIT authority.

4. **Commit-prefix discipline (Section 0 Item 5) distinguishes authorship.** A commit prefixed `corpus:` is SME-authored content committed by Developer; a commit prefixed `Phase N Step M:` is Developer-authored implementation. `git log --grep="^corpus:"` recovers the SME-authored content trail; `git log --grep="^Phase 1 Step"` recovers the Developer-authored implementation trail.

5. **Orchestrator override, when invoked, routes through Developer.** Per CLAUDE.md §4, the Orchestrator may explicitly authorize SME-side commit authority for a specific commit ("Option B" pattern). When invoked, the Orchestrator override is documented in the commit body and the override stays bounded to the named commit; future cycles return to single-committer default.

Banked observation from the BFO/CLIF parity reconciliation: two-role commit authority creates synchronization gaps that the single-committer model eliminates. The protocol holds going forward unless an explicit Orchestrator override authorizes deviation.

---

## Per-Entry Sign-Off Ritual (ARC manifest content)

The remaining sections of this document apply specifically to ARC manifest content authoring under SME role. Phase 0 ships this discipline; ARC content authoring is the SME workstream that runs in parallel through Phases 0-7 and gates each ARC-bearing phase entry (4, 5, 6, 7).

ARC manifest content lands in the five v0.1 ARC modules per spec §3.6.1:

- `arc/core/bfo-2020.json`
- `arc/core/iao-information.json`
- `arc/cco/realizable-holding.json`
- `arc/cco/mereotopology.json`
- `arc/ofi/deontic.json`

## State Machine

Every entry carries one of three states in its `notes` field (or via a dedicated `verifiedStatus` field once introduced):

- **Verified** — the entry has been peer-reviewed against canonical literature, has at least one passing fixture, and is ready to ship in the named phase.
- **[VERIFY]** — the entry's IRI, OWL characteristics, FOL definition, or domain/range needs confirmation against canonical literature before it can ship. Any entry carrying `[VERIFY]` blocks the phase entry of the module containing it.
- **Draft** — entry is provisional, not yet peer-reviewed. Acceptable in working files; MUST be promoted to Verified or removed before the entry's module is loaded by an ARC-bearing phase.

Transitions:

```
Draft ──peer-review─→ [VERIFY] ──canonical-citation─→ Verified
        │                                                  ↑
        └──canonical-citation-on-first-pass────────────────┘
```

`scripts/lint-arc.js` fails CI on any `[VERIFY]` tag in a module that the corresponding phase entry checklist requires Verified.

## Required Fields per Entry

Every Verified entry MUST carry:

| Field | Source | Purpose |
|---|---|---|
| `name` | TSV `Relation Name` | human-readable identifier |
| `level` | TSV `Level` | Meta / Class-level / Object-level / etc. |
| `context` | TSV `Context` | mathematical context (Set Theory, Mereology, etc.) |
| `notation` | TSV `Notation` | canonical mathematical notation |
| `formalDefinition` | TSV `Formal Definition` | the FOL definition in CL or KIF |
| `owlCharacteristics` | TSV `OWL Characteristics` | declared OWL property characteristics |
| `owlRealization` | TSV `OWL / CCO Realization` | the OWL/CCO IRI realizing the relation |
| `iri` | TSV `IRI` | canonical IRI; resolves against the module's vocabulary cache |
| `subPropertyOf` | TSV `subPropertyOf` | parent-property IRI(s), comma- or semicolon-separated; `—` permitted when the relation has no parent. `lint-arc.js` validates that each non-`—` value resolves to an entry in the same module or a declared dependency (per `MODULE_DEPS`). |
| `domain` | TSV `Domain` | domain class IRI (or `—` if unconstrained) |
| `range` | TSV `Range` | range class IRI (or `—` if unconstrained) |
| `notes` | TSV `Notes` | citation, disjointness commitments, divergence notes |

## Per-Entry Peer-Review Checklist

Before promoting from Draft / [VERIFY] to Verified:

- [ ] Citation to canonical literature recorded in `notes` (BFO 2020 spec, RO release, IAO release, CCO 2.0 release, RDM v1.2.1 spec, or constitution.ttl as appropriate)
- [ ] OWL characteristics declared exactly as the canonical OWL file declares them; divergence between OWL and CL (e.g., reflexivity declared in CL but not OWL) explicitly noted in `notes`
- [ ] FOL definition uses the relation's standard variable conventions; ternary or higher-arity definitions name the temporal-index parameter explicitly
- [ ] Domain and range classes are themselves Verified entries in the same module or a declared dependency
- [ ] Inverse / property-chain dependencies enumerated in `notes` with the dependency relation also Verified
- [ ] At least one worked-example fixture exists in `tests/corpus/` and is registered in `tests/corpus/manifest.json` with the entry's IRI in its `arcEntries` array
- [ ] The entry's IRI appears in the corresponding canonical-vocabulary cache file under `arc/vocabulary-cache/`, refreshed via `npm run refresh:vocab-cache -- --vocab=<id> --source=<local-path>` against the canonical `.owl`/`.ttl` release. `lint-arc.js --strict` flags any IRI not present in the cache, or present but flagged `unverified: true`.
- [ ] **Internal contract consistency.** For every fixture, verify that `intent`, `expectedOutcome.summary` (in `tests/corpus/manifest.json`), and `expectedFOL` describe the same lifter behavior at three levels of precision (free-text, structured summary, byte-exact form). If any two of the three contradict, the fixture is incomplete and cannot be promoted Draft → Verified. When a contradiction is discovered during implementation, escalate per the Failure-Triage Handoff Protocol (ROADMAP cross-cutting §"Failure-Triage Handoff Protocol"); do not autonomously align byte-exact form to implementation — align upward to the prose contracts grounded in spec citations. (Banked from the architect's Phase 1 mid-phase escalation ruling 2026-05-02; first instance: `p1_owl_same_and_different.fixture.js` Step 4 amendment audit-trail.)

## Canonical-Vocabulary IRI Cache

Every entry's `iri` field is validated against an offline cache of canonical IRIs under `arc/vocabulary-cache/`. See [`arc/vocabulary-cache/README.md`](./vocabulary-cache/README.md) for the format, refresh process, and per-vocabulary status. Phase 0 ships hand-seeded caches drawn from `relations_catalogue_v3.tsv` and the OFBT spec; pre-Phase-4 SME work refreshes each cache against the actual canonical release using the offline refresh tool.

The cache check in `lint-arc.js` operates as:

1. **Routing.** Each entry's IRI is matched against every cache file's `iriPattern` regex; the first match claims the IRI.
2. **Existence.** If the IRI's pattern matches a cache but the IRI itself is absent from that cache's entries — hard error (typo in the catalogue, or canonical release does not declare it).
3. **Type agreement.** Object-level entries are expected to resolve to `object-property` cache entries; mismatch is a hard error.
4. **Unverified surfacing.** In `--strict` mode (which the Phase 4-7 ARC Authoring Exit Criteria invoke), references to cache entries with `"unverified": true` fail the lint. SME refreshes the cache against the canonical release to clear the flag.
5. **Unrouted IRIs.** If no cache claims the IRI's pattern, the linter emits a warning so the SME notices the gap and either adds a cache file for the new vocabulary or corrects the IRI.

## Bridge-Axiom and Disjointness-Axiom Completeness

Per ROADMAP cross-cutting "ARC Authoring Discipline":

- **Bridge axioms** (e.g., Connected With per spec §3.4.1) MUST appear in their owning module's `entries` with the explicit FOL definition in CL or KIF, not as a free-floating note.
- **Disjointness commitments** declared in TSV Notes (e.g., rows 65-66 `discharges`/`violates`) MUST be formalized into machine-readable axiom entries in the appropriate module before that module's phase exit.
- The BFO Disjointness Map is the canonical source for cross-module disjointness; entries that participate (Continuant ⊓ Occurrent, SDC ⊓ GDC, etc.) MUST cross-reference the Map's authoritative listing.

## Module Dependencies

Per spec §3.6.4 (post-ADR-009) and `MODULE_DEPS` in `scripts/lint-arc.js`:

```
core/bfo-2020             (root)
core/iao-information      depends on: core/bfo-2020
cco/realizable-holding    depends on: core/bfo-2020
cco/mereotopology         depends on: core/bfo-2020
cco/measurement           depends on: core/bfo-2020
cco/aggregate             depends on: core/bfo-2020
cco/organizational        depends on: core/bfo-2020
cco/deontic               depends on: core/bfo-2020, core/iao-information
ofi/deontic               (DEFERRED to v0.2 per ADR-008; absent from v0.1 active modules)
```

An entry's `subPropertyOf` IRI MUST resolve to an entry in the same module or one of its declared dependencies. `lint-arc.js` flags violations.

### CCO vs OFI deontic — semantic distinction (do not conflate)

CCO `cco/deontic` and OFI `ofi/deontic` (the latter deferred to v0.2 per ADR-008) cover deontic territory but with **different semantics**. Both modules use the word "directive" but the relationships they encode are not interchangeable:

- **CCO deontic (`cco/deontic`)** — Directive → Action. The directive specifies what the agent is to do; the consummation is the agent's action. Disjointness commitments (Directive ↔ Action) are formalized as machine-readable axioms in `arc/cco/deontic.json`.
- **OFI deontic (`ofi/deontic`)** — Directive → Issuing-Agent. The directive identifies the agent who issued it; downstream the realizing chain (RDM v1.2.1) decomposes via VerbPhrase DiscourseReferent + DirectiveICE + PlanSpecification + RealizableEntity. The disjointness commitments differ from CCO deontic and live with the OFI specification — deferred to v0.2.

**Authoring rule:** when an ARC entry concerns "directive" semantics, the SME MUST identify which Layer the entry belongs to (CCO Directive→Action vs OFI Directive→Issuing-Agent). The Module column assignment follows this distinction. A row that conflates the two layers is a content bug — surface it under the Failure-Triage Handoff protocol below.

### External-dependency management — when v0.1 doesn't ship dependent content

When an OFBT v0.1 module depends on an external specification that has not yet stabilized (e.g., the OFI specification at the time of the v3.3 catalogue regeneration), the dependent ARC content MUST be deferred to a later release (typically v0.2) rather than authored against an unstable target. The deferral path is:

1. SME identifies that the external dependency has not stabilized (provenance markers like `[V0.2-CANDIDATE]` in the catalogue Module column flag the affected rows).
2. SME files a routing packet to the Architect proposing deferral, citing the deterministic-rule evidence (which rows, which provenance markers, why the external dependency is unstable).
3. Architect ratifies via ADR (deferral pattern: see ADR-008 OFI deontic deferral as the originating example).
4. The catalogue rows carry `[V0.2-CANDIDATE]` in the Module column; `scripts/build-arc.js --strict` skips them rather than failing on missing module routing; the v0.2 forward-track is recorded in the release notes.

**Authoring rule:** SME does NOT speculatively author content against an unstable external specification "to be safe." The deferral path is the correct channel; speculative content is content debt that must be re-litigated when the external spec stabilizes.

## Per-Phase Exit Checklists

Each ARC-bearing phase has explicit ARC Authoring Exit Criteria in `project/ROADMAP.md`. Summary:

- **Phase 4** (BFO 2020 core): every Verified BFO entry has a fixture; BFO Disjointness Map commitments formalized; bridge axioms (Connected With) present with FOL definitions; lint passes.
- **Phase 5** (IAO information): every Verified IAO entry has a fixture; lint passes.
- **Phase 6** (six CCO modules — realizable-holding, mereotopology, measurement, aggregate, organizational, deontic per ADR-009): every Verified CCO entry across all six modules has a fixture; CCO deontic Directive↔Action disjointness commitments formalized; lint passes.
- **Phase 7** (compatibility shim, bundle budget enforcement, coverage matrix CI per ADR-008 Option A): no new ARC modules; OFI deontic deferred to v0.2; OFI-bearing fixtures absent from v0.1 corpus; coverage matrix annotates OFI cells as "deferred to v0.2 per ADR-008".
- **Phase 8** (verification gate + constitution.ttl pipeline rolled forward per ADR-008 Option A): constitution.ttl Article I §2 pipeline exercises CCO deontic + IAO + BFO machinery against the v0.1 active module set.

## Failure-Triage Handoff

Per ROADMAP cross-cutting "Failure-Triage Handoff Protocol":

When a Ring N failure is suspected to be ARC-content rather than conversion machinery, engineering files an issue with the failing fixture ID, observed result, expected result, and the witness chain (or its absence) Tau Prolog produced. The SME reclassifies as ARC bug / fixture bug / machinery bug and routes accordingly. Module-content corrections enter via the same Draft → [VERIFY] → Verified state machine described above.

---

## Canonical Source Citation Discipline (Layer A vs Layer B)

[Introduced at the BFO/CLIF parity routing cycle 2026-05-03; formalized at Phase 1 exit doc pass.]

When a fixture's correctness depends on parity with an upstream canonical FOL/CLIF/KIF source, the fixture's `clifGroundTruth` array carries citations against that source. Two distinct layers exist; citations must target the layer that matches what the fixture is testing.

### Layer A — Construct semantics (W3C / spec-level)

**What lives here:** the canonical FOL semantics of OWL/RDF constructs themselves. What `SubClassOf`, `Transitive`, `InverseObjectProperties`, `DisjointClasses`, `ObjectMinCardinality` etc. MEAN as constructs.

**Authoritative source:** `arc/upstream-canonical/owl-axiomatization.clif` (W3C OWL CLIF axiomatization, BFO repository, BSD-3-Clause). Future analogues for RDF / RDFS / SHACL similarly vendored under `arc/upstream-canonical/`.

**Phase 1 fixtures cite Layer A** because Phase 1 tests OWL-construct semantics without ARC content. Construct lifting is what Phase 1's lifter implements; Layer A is its canonical reference.

### Layer B — Ontology content (BFO / CCO / IAO / RO / OFI)

**What lives here:** specific ontology-content semantics in CLIF/KIF. What BFO's `Continuant`, `Occurrent`, ternary parthood, the BFO Disjointness Map etc. MEAN as domain content.

**Authoritative sources (vendored as Phase 4-7 ARC content lands):** `arc/upstream-canonical/bfo-2020.clif`, `arc/upstream-canonical/iao.clif`, etc.

**Phase 4-7 fixtures cite Layer B** because those phases test ARC manifest content fidelity to upstream domain ontologies. ARC entries must transcribe domain content faithfully; Layer B is the reference.

### The discipline: citation layer matches fixture-test layer

| Fixture tests | Cite |
|---|---|
| OWL-construct lifting (Phase 1) | Layer A only |
| Specific ontology content (Phase 4-7) | Layer B (domain content) + optionally Layer A (for the constructs the content uses) |
| Mixed-layer assertions | Per-citation `clifLayer: 'A' | 'B'` discrimination explicit on each `clifGroundTruth` entry |

**Banked principle (architect, BFO/CLIF cycle 2026-05-03):** "Citing a Layer B source for OWL-construct semantics is redirecting through one ontology to reach another's authoritative source. Cut out the indirection — Layer A citations live where the construct semantics live."

### Implementation

The `clifGroundTruth` field on a fixture object (and on the corresponding manifest entry) lists citations per architect Ruling 2 of the BFO/CLIF parity routing cycle:

```json
{
  "clifSource": "arc/upstream-canonical/owl-axiomatization.clif",
  "clifAxiomRef": "lines 1006-1015 (SubClassOf definition)",
  "clifText": "(forall (X Y) (iff (SubClassOf X Y) (and (Class X) (Class Y) (forall (z) (if (X z) (Y z))))))",
  "verificationStatus": "Verified",
  "mappingNote": "...",
  "expectedFOLIndex": 0,
  "owlAxiomLabel": "SubClassOf(Continuant, Entity)"
}
```

The schema for `clifGroundTruth` and `ClifGroundTruthEntry` is in [`tests/corpus/manifest.schema.json`](../tests/corpus/manifest.schema.json); the CI gate validates structural shape only (citation accuracy is the SME's pre-Phase-N-exit responsibility per spec §3.3 [VERIFY] discipline).

`clifGroundTruth` is **opt-in.** Pure-OWL fixtures (PROV-O domain/range, owl:sameAs, etc.) do not require it. Only fixtures that derive their semantics from a canonical CLIF/KIF source must populate it.

### Vendored canonical source discipline

See [`arc/upstream-canonical/README.md`](./upstream-canonical/README.md) for the full vendoring policy. Key points:

- **No fetch at CI time.** Edge-canonical principle. Sources vendored into the repo with provenance sidecars.
- **Pinning to commit-SHA.** Branch-pinned references drift; commit-pinned references don't.
- **Provenance sidecar (`<file>.SOURCE`)** per the README's required-fields list.
- **License compatibility verified before vendoring.** BSD-3-Clause / CC-BY 4.0 / Apache-2.0 / MIT are compatible; GPL is not (separate handling required).

---

## Regression-Test Lifecycle Discipline

[Introduced at Step 7 SME review 2026-05-03; formalized at Phase 1 exit doc pass.]

When a fixture-deferred construct (e.g., cardinality at Steps 1-6, structural annotations at Steps 1-7) is later implemented in a subsequent step, any inline regression test that protected against the wrong-shape behavior of the deferred construct **graduates** to fixture-level `deepStrictEqual` rather than being deleted outright.

### The pattern

**Phase before implementation:**
1. Lifter throws `UnsupportedConstructError` (or rejects) for the deferred construct.
2. An inline regression in `tests/lifter-phase1.test.ts` (or equivalent) verifies the throw — protecting against silent acceptance with degraded output.

**Phase the implementation lands:**
1. Lifter implements the construct correctly.
2. The inline regression's protection target shifts: from "throws X" to "produces correct Y."
3. The fixture-level `deepStrictEqual` against the new `expectedFOL` becomes the protection mechanism. Same protection scope, different test mechanism.
4. The inline regression is removed in the same commit that implements the construct.

### Why graduate vs. delete or keep

- **Delete-without-graduation** loses the protection. The wrong-shape behavior could regress silently.
- **Keep-as-throw-test** breaks once the construct is implemented (the throw no longer happens). Test runner shows red CI for the wrong reason.
- **Graduate to fixture-level `deepStrictEqual`** keeps the protection, in a stronger form: any wrong-shape regression (including but not limited to the specific shape the original inline test caught) breaks the byte-exact match.

Originating example: B2 SME-fix at Step 2 (cardinality throws `UnsupportedConstructError` until Step 7 implementation). Step 7 close commit removes the inline regression and graduates protection to `p1_restrictions_cardinality.expectedFOL`'s `deepStrictEqual`. ADR-007 §7 documents the graduation.

### Required of the graduating commit

When the implementing step's commit removes an inline regression:

1. **Document the graduation in the commit body.** "Inline regression X (added at Step N for B-fix Y) graduates to fixture-level `deepStrictEqual` against `<fixture-id>.expectedFOL` per the regression-test lifecycle discipline."
2. **Verify the fixture's `expectedFOL` covers the original wrong-shape.** The byte-exact match must catch the same wrong shape the inline regression caught. For B2 cardinality: any unary-atom-of-binary-predicate regression breaks the byte-exact match.
3. **Document the framing-correction transparency** when the implementation reveals a placeholder framing was wrong (e.g., ADR-007 §7's "Skolem-witness prefix" → "∃-bindings, no Skolems" reframing). Resolution text in the ADR explicitly documents the framing-correction, not silent substitution.

---

## Defense-in-Depth at Multiple Boundary Points

[Introduced at Step 8 SME review 2026-05-03; formalized at Phase 1 exit doc pass.]

When a punted construct or invariant is detected at a single primary boundary (the lifter's entry, the corpus-manifest gate, etc.), downstream emit sites that COULD encounter the construct via future code paths or direct callers should **also** defensively guard.

### The pattern

**Primary detection** at the canonical boundary point. Examples:
- `rejectPuntedConstructs()` at the lifter's entry (`src/kernel/lifter.ts`) for spec §13.1 punted constructs.
- `check-corpus-manifest.ts` for orphan files / orphan entries / required-field shape.
- `lint-arc.js` for `[VERIFY]` tags in modules requiring Verified status.

**Defense-in-depth at downstream emit sites** that could encounter the punted/forbidden shape if the primary detector is bypassed (e.g., direct caller, future code path that doesn't route through the primary detector).

Pattern actions:
- **Throw** if the construct represents corruption (B2-style: cardinality threw at the punted-construct pre-scan AND at the class-expression `liftClassExpression` switch — defense-in-depth meant either path catches the punted state).
- **Silently skip** if the construct is just out-of-scope content for the current code path (the structural-annotation emitter's defensive skip of annotation-on-annotation patterns even though they're already rejected upstream — silent skip is correct here because the emitter would skip a non-applicable annotation regardless).

### Why defense-in-depth

Single-boundary detection is sufficient for the standard call path. But:
- A future contributor adds a new entry point that bypasses the primary detector.
- A direct caller (e.g., a unit test, a debug script, a downstream consumer of the kernel API) invokes the downstream emit site without going through the primary boundary.
- A refactor moves the primary detector but forgets to update one downstream site.

Defense-in-depth at downstream emit sites catches all three failure modes without coupling them tightly to the primary detector's existence.

### Originating examples

- **B2 cardinality (Step 2 SME fix):** cardinality throws at `rejectPuntedConstructs` (primary) AND at `liftClassExpression`'s Restriction-without-known-secondary fallthrough (defense-in-depth).
- **Annotation-on-annotation (Step 8):** rejected at `rejectPuntedConstructs` (primary); silently skipped at `emitStructuralAnnotations` (defense-in-depth).

---

## SME-Persona Verification of Vendored Canonical Sources

[Introduced at Phase 1 exit Step 9.2 close 2026-05-04; formalized at Phase 1 exit doc pass.]

Once a canonical source is vendored into `arc/upstream-canonical/`, the [VERIFY] resolution discipline shifts from "Aaron-the-human verifies out-of-channel" to "SME-persona reads the vendored file in-repo and confirms."

### The transition

**Before vendoring:** `[VERIFY]` markers on `clifGroundTruth` entries (or on `arc/vocabulary-cache/` entries) require the human SME to obtain the canonical source out-of-channel (download from upstream, locate the cited line range, confirm the verbatim text). The verification is human-out-of-channel work; CI cannot validate it.

**After vendoring:** the canonical source is in-repo at a known path with a SHA-256 pinned in the `.SOURCE` sidecar. The SME persona (or Developer, with access via `Read`) opens the vendored file at the cited line range and confirms the `clifText` matches verbatim modulo whitespace normalization for JSON embedding. The verification becomes a mechanical content-check.

### Why this matters

1. **Verification cost drops from "hours of cross-referencing" to "minutes of read + visual confirmation."**
2. **The verification record is reproducible.** The SHA-256 in the `.SOURCE` sidecar pins the file's content; future re-verification confirms against the same bytes. Drift surfaces as a SHA-256 mismatch on the next refresh.
3. **The discipline doesn't depend on human-out-of-channel availability.** Verification proceeds at any cycle's pace.

### Implementation at Step 9.2 (originating example)

Phase 1 exit Step 9.2 closed all 8 `verificationStatus: "[VERIFY]"` markers on `p1_bfo_clif_classical.fixture.js` by:

1. SME persona reads `arc/upstream-canonical/owl-axiomatization.clif` at the 4 distinct cited line ranges (1006-1015, 1038-1046 + 1548-1557, 1310-1324, 1214-1226).
2. Confirms each cited `clifText` matches the file's actual content verbatim (modulo whitespace).
3. Flips all 8 `verificationStatus` fields from `"[VERIFY]"` to `"Verified"` in both the fixture file and the manifest entry.
4. Updates the manifest entry's `expected_v0.1_verdict.clifCitationsStatus` from "pending" to "Verified — all 8 citations confirmed at Phase 1 exit Step 9.2 (2026-05-04)."

The Step 9.2 commit body documents the verification pass, the cited line ranges, and the SHA-256 pin from the `.SOURCE` sidecar — full audit trail for any future reviewer or v0.2 vendoring refresh.

### Required of any [VERIFY] resolution against a vendored source

1. **Cite the vendored file's path** in the `clifSource` field, not an upstream URL. Upstream URLs live in the `.SOURCE` sidecar's `upstream-url` field.
2. **Cite line ranges** in `clifAxiomRef` that match the actual file content. Re-verification = grep + visual confirmation.
3. **Confirm the SHA-256 in the `.SOURCE` sidecar matches the current file's hash** before flipping `[VERIFY]` → `Verified`. If the hash diverges, the file was modified post-vendoring; re-verify against the current bytes or refresh the sidecar.
4. **Document the verification pass** in the Step's commit body (commit-prefix discipline per Section 0 Item 5: `corpus: resolve [VERIFY] markers...`).

### Second originating example (Phase 2 entry verification ritual, 2026-05-06)

The discipline caught its first license-type defect. `arc/upstream-canonical/owl-axiomatization.clif.SOURCE` at commit `a5b1189` carried `license: BSD-3-Clause` (asserted UNVERIFIED-against-canonical from a layperson reading of the file's preamble note "the repo-level LICENSE governs"). The Phase 2 entry verification ritual (per architect Procedural item 1 + entry-packet §6.1 license-verification gate) surfaced the actual upstream license is **CC BY 4.0** — BFO repo `LICENSE` file at commit `294fa4167f2e59784abb1e1abb9467f7de37b0cd`, SHA-256 `f5b745ef…cc3f`, 395 lines, first line "Attribution 4.0 International". The asserted commit reference `783a3f7` does not exist in BFO-ontology/BFO. The CLIF file content SHA-256 (`480193e9…5912`) verified intact at master HEAD `857be9f15…f3a7`; only the license-related metadata was wrong.

ADR-010 documents the corrective action (sidecar correction + entry-packet §6.1 correction + this discipline tightening + ROADMAP Phase 4 entry-checklist item + `package.json` `files`-field whitelist). The 3-day latency between assertion (2026-05-03 sidecar authoring) and verification (2026-05-06 ritual) is the "first-use-time verification" gap the discipline tightening below closes.

**The discipline functioned as designed:** the verification gate caught the discrepancy *before* any Phase 2 implementation work landed and *before* the four-way-aligned Commit 3 fixed an incorrect license-verification block into the repo. First production catch banked.

### Discipline tightening (per ADR-010)

**License-verification ritual MUST run BEFORE the vendored source's first commit. Applies to all vendored canonical sources regardless of format.**

Specifically, the SME-persona reads the upstream repo's LICENSE file at the vendoring commit, computes SHA-256, writes the populated `license-verification` block to the SOURCE sidecar AT vendoring time, NOT at first-downstream-use time. The first commit landing the vendored source includes the `license-verification` block populated with verified canonical values.

**Required fields of the `license-verification` block** (per ADR-010 schema, the canonical example being `arc/upstream-canonical/owl-axiomatization.clif.SOURCE` post-Commit-3):

- `<repo>-license-url` — the upstream LICENSE file URL pinned at the verified commit
- `<repo>-license-commit-sha` — the commit SHA where the LICENSE was created or last modified (auditable canonical reference)
- `<repo>-master-head-at-verification` — the upstream master HEAD at verification time (snapshot for SHA-divergence detection)
- `license-text-confirmed` — the actual license type as a stable identifier (e.g., `CC-BY-4.0`, `MIT`, `Apache-2.0`)
- `license-file-sha256` — SHA-256 of the LICENSE file's bytes
- `license-file-line-count` — line count for sanity-check
- `license-first-line` — first line of the LICENSE file (sanity-check + canonical-license-boilerplate match)
- License-type-specific fields (e.g., `cc-by-attribution-url` for CC BY family; `mit-copyright-line` for MIT family) — fields adapt to the license but the verification ritual is uniform
- `modifications-to-vendored-file` — declarations of any post-retrieval modifications (default: none if SHA-256 matches upstream)
- `discrepancy-resolution-cycle` — populated only if the verification ritual surfaced a defect; references the corrective-action ADR
- `verified-by` + `verified-at` — SME-persona-and-date audit trail

**Format-agnostic application.** The discipline applies to all vendored canonical sources regardless of format (CLIF, KIF, OWL, TTL, RDF/XML, JSON-LD, etc.). When v0.2 or later vendors a non-CLIF canonical source (e.g., a TTL release of CCO 2.0 if Phase 6 vendors directly), the same ritual applies. The license-verification fields' shape adapts to the license type; the ritual itself is uniform.

**Phase 4 BFO 2020 CLIF Layer B vendoring** + all subsequent phase vendoring inherit this discipline. ROADMAP Phase 4 entry checklist gains the explicit item (per architect Q-γ ruling 2026-05-06).

### Required of any new vendoring under the tightened discipline

1. **Verify before vendoring.** The SME-persona reads the upstream repo's LICENSE at the target commit *before* `git add` of the vendored content. The `license-verification` block ships in the first commit landing the vendored source.
2. **Vendor commit body documents the verification ritual.** Per Section 0 Item 5 commit-prefix discipline (`chore: vendor`), the commit body enumerates the verified canonical values + cites the SME-persona ritual + cross-references the vendoring-discipline subsection of this document.
3. **No layperson reading of upstream preamble notes.** A note like "the repo-level LICENSE governs" inside the vendored file is a hint, not a verified fact. Verification ritual MUST fetch the actual LICENSE file at the target commit and confirm its bytes.
4. **No asserted-but-unverified commit SHA references.** All commit SHAs in the sidecar (`upstream-version-*`, `<repo>-license-commit-sha`, `<repo>-master-head-at-verification`) MUST be confirmed-existent in the upstream repo (via GitHub Search Commits API or direct repo fetch). Asserting a SHA without confirming its existence is the failure mode `783a3f7` exemplifies.

---

## Phase 2 Banked Principles (folded in at Phase 2 exit doc-pass)

[Folded in at Phase 2 Step 9.5 doc pass. Captures architect-banked principles + SME-banked observations from Phase 2's six cycles: Phase 2 entry confirmation (2026-05-06), license-verification corrective action (2026-05-06), Step 4 spec-binding + ADR-011 ratification (2026-05-07), Step 6 routing (2026-05-XX), and Step 8 stub-evaluator + parity-canary cycle. Per architect cadence-banking 2026-05-07: phase-mid-cycle counts are weighted by phase substantive scope; Phase 2's six cycles reflect its load-bearing architectural surface (projector + audit artifacts + strategy router + cardinality + chain realization + parity-canary harness), not cycle-density growth.]

### Spec interpretation defaults to literal framing

[Architect-banked at Step 4 spec-binding cycle 2026-05-07 (ADR-012 banked principle 1) + reinforced at Q-Step6-1 ruling 2026-05-XX.]

When the SME / Developer reads the spec to choose between implementation options, the default is **literal framing of the spec text**, not a conservative emission strategy that goes beyond what the spec requires. Q6's "default to heavier path" applies to corrective-action ratification (ADR vs amendment), NOT to spec interpretation.

Two manifestations from Phase 2:

1. **Q-E ruling (cardinality routing Option β).** Spec §6.1.3 says Annotated Approximation is "for FOL shapes that don't map to OWL 2 DL." Cardinality DOES map to OWL 2 DL (via `minCardinality` / `maxCardinality` / `cardinality` Restrictions). Routing cardinality to Annotated Approximation would have been a category error — emitting Loss Signatures on axioms that round-trip cleanly. The literal framing wins.

2. **Q-Step6-1 ruling (always-emit `regularity_scope_warning`).** Spec §6.2.1 says: "If regularity holds in the loaded graph but the loaded graph is incomplete relative to the source's owl:imports, the projector emits the chain with a `regularity_scope_warning` annotation in the Recovery Payload." Phase 2 has no import closure → loaded graph is bounding-case incomplete → emit the warning per literal spec framing. NOT "assume regularity at Phase 2" (more permissive than spec) and NOT "defer chain emission entirely" (more conservative than spec). The literal framing's "conservative-emission policy" is the spec's load-bearing framing, not architect-imposed conservatism.

The principle generalizes in the **strengthening direction** — literal framing applies even when literal framing is more conservative than other options. Future spec-interpretation questions default here.

### Behavioral contracts follow stricter evolution discipline than schema contracts

[Architect-banked at ADR-011 ratification cycle 2026-05-07 (Q-3 banking).]

Q6's three-tier discipline (additive-optional / required-or-rename-or-remove / case-by-case) governs **schema contracts** — what fields exist, what required-vs-optional means, what enum members are allowed. The **discriminating-field set** of an audit artifact's content-addressing scheme is a **behavioral contract** orthogonal to the schema contract — it specifies how content-addressing is computed.

Two distinct contracts; the stricter rule applies to the behavioral contract because the behavioral contract is the load-bearing one for cross-installation byte-stability.

Specifically (per ADR-011 §5):

- **Adding a field to the discriminating-field set:** §0.2.3 evidence-gated change. Major version bump.
- **Removing a field from the discriminating-field set:** §0.2.3 evidence-gated. Major version bump.
- **Renaming a field in the discriminating-field set:** §0.2.3 evidence-gated. Major version bump.
- **Changing canonicalization rules for a nested object within a discriminating field:** case-by-case, defaulting to §0.2.3.
- **Changing the hash function (e.g., SHA-256 → SHA-512):** §0.2.3 evidence-gated. Major version bump (changes ALL `@id`s).

Generalizes beyond audit-artifact `@id`: future cycles touching other behavioral contracts inherit the same stricter discipline. Architect-named candidates: deterministic strategy-selection algorithm (spec §6.2); round-trip parity criterion (spec §8.1); No-Collapse Guarantee Horn-fragment classification (spec §8.5). When an evolution proposal touches a behavioral contract, default to §0.2.3 regardless of the schema-contract change category.

### Hierarchical schema fields enter discriminating sets at hierarchical position

[Architect-banked at ADR-011 ratification cycle 2026-05-07 (Q-1 banking).]

When a discriminating field is itself a structured object (e.g., LossSignature's `provenance: {sourceGraphIRI, arcVersion}`), the discriminating-field-set entry is the **hierarchical reference** (`provenance`), not promoted top-level fields. The `stableStringify` canonicalization preserves the hierarchy, and the byte-stability contract operates on the hierarchical canonicalization.

Promotion (e.g., flattening to top-level `sourceGraphIRI` + `arcVersion`) would fragment the discriminator and risk discrepancies if the underlying `provenance` schema gains additional fields — those new fields would be silently outside the discriminator.

This principle applies to any future discriminating-field-bearing audit artifact (ProofTrace per API §6.4.3, ConsistencyResult per Phase 3 spec §8, etc.).

### Audit-artifact discriminating-field sets exclude documentation-polish-tier fields

[Architect-banked at ADR-011 ratification cycle 2026-05-07 (Q-4 banking).]

Documentation-polish-tier fields (free-text explanations, suggestions, hints, timestamps, self-referential identifiers, type discriminators carried by prefix) are **excluded** from discriminating sets.

**Inclusion criteria:** the field's value affects whether two payloads represent the same semantic content; if not, exclude.

Per ADR-011 §7's worked-example exclusions:

- `provenance.timestamp` — non-deterministic; including it defeats byte-stability
- `reasonText` — human-readable explanation that may evolve with documentation polish
- `@type` — discriminator-by-type-existence not by-value; implicit in the prefix
- `@id` — self-referential

Future free-text fields added to schemas SHOULD NOT enter the discriminating set unless they discriminate semantic content (e.g., `clifGroundTruth.mappingNote` per Phase 1 fixture-corpus convention IS semantic discrimination — included where applicable).

### Stub-harness ↔ real-implementation re-exercise discipline

[Architect-banked at Phase 2 entry packet §10.1 (architect Q3 ruling 2026-05-06) + reinforced at Step 8 close.]

Stub harnesses validate behavior at one fidelity level; the real implementation re-exercises at full fidelity at the next phase. The cross-phase reactivation discipline (`phaseNReactivation` field per ADR-011 schema-aligned Q5 ruling) makes this transition auditable.

Manifestations:
- Phase 2 stub-evaluator at `tests/corpus/_stub-evaluator.js` (bounded SLD resolution; binding-level entailment only; no closedPredicates) → Phase 3's real `evaluate()` per API §7.1 (full-fidelity Horn resolution + closed-world semantics + non-Horn fallback)
- Phase 2 chain-projection's `regularity_scope_warning` (always-emit) → Phase 4's `regularityCheck(A, importClosure)` (clears warning for regularity-confirmed chains)

When a fixture's assertion mechanism is gated on later-phase implementation, the fixture's `phaseNReactivation` field documents the re-exercise contract: which query / behavior is re-exercised, expected result against the real implementation, divergence-from-stub trigger condition. Phase entry packets inherit the obligation to re-exercise BEFORE implementation work proceeds past Step 1.

### Cross-phase reactivation discipline (`phaseNReactivation` field naming)

[Architect-banked at Phase 2 entry packet §10.3 (architect Q5 ruling 2026-05-06).]

Field-name generalization patterns apply forward to all subsequent phases without re-routing. The `phaseNReactivation` regex pattern `^phase[1-9][0-9]*Reactivation$` is recognized by `tests/corpus/manifest.schema.json` + `scripts/check-corpus-manifest.ts`; subsequent phases use the generalized field without further architect routing for naming.

Field structure per the schema:

- `gatedOn` — short identifier of what the reactivation depends on (e.g., `real-evaluator-via-API-§7.1`, `phase4-arc-content-loaded-with-import-closure-machinery`)
- `expectedOutcome` — the result the fixture EXPECTS once the gating phase activates
- `divergenceTrigger` — OPTIONAL; the condition that, if observed at reactivation, escalates as a phase-entry escalation

### Schema-evolution four-way alignment (extended at ADR-011 ratification)

[Architect-banked at BFO/CLIF parity cycle 2026-05-03 + Q5 schema-evolution discipline + extended at ADR-011 ratification 2026-05-07.]

When a manifest discipline changes, schema + gate + manifest entries + fixtures all four-way align in **one commit**. The Q5 confirmation-cycle commit was the canonical example for Phase 2: schema regex update + CI gate update + grandfathered Phase 1 entries + new Phase 2 entries with `phaseNReactivation` content all landed together.

**Architect-banked extension at ADR-011 ratification (2026-05-07):** the SME naturally extended "four-way-aligned" to include the license-verification block (a fifth artifact riding the same cycle). The artifact-shape consistency principle generalizes when more artifacts share the cycle — "four-way" is the canonical shorthand, but the principle is "all artifacts whose discipline-level coherence binds them together align in one commit." Future cycles MAY ride more or fewer artifacts as the discipline-level coherence dictates; the alignment-in-one-commit rule scales with them.

### Cross-section defense-in-depth pair pattern

[Architect-banked at Phase 2 entry packet §10.8 (architect refinement 2026-05-06; first instantiation: `strategy_routing_direct` ↔ `parity_canary_visual_equivalence_trap`).]

Defense-in-depth pairs MAY cross corpus sections when the canary's natural home is a different section than the positive fixture's. The pairing is named explicitly in the entry packet so the cross-section relationship is auditable.

Phase 1's pair (`p1_prov_domain_range` standard corpus + `canary_domain_range_existential` canary set) was cross-section by accident because the canary set is a structural sibling of the standard corpus. Phase 2's pair (`strategy_routing_direct` from §3.3 strategy-routing positive + `parity_canary_visual_equivalence_trap` from §3.4 parity canary) is cross-section by design — strategy-routing correctness is defended by both a positive routing assertion AND a negative semantic-shift assertion; the canary's natural home is §3.4 because it asserts a parity-side concern (round-trip preservation of query semantics).

Future phases MAY pair fixtures across different sections when the assertion mechanisms naturally live in different categories. The pairing must be NAMED EXPLICITLY in both fixtures' leading comments + manifest entries so the cross-section relationship is auditable.

### Two-fixture defense-in-depth pattern portability

[Architect-banked at Phase 2 entry packet §10.2 (architect Q4 ruling 2026-05-06).]

Two-fixture defense-in-depth applies to any high-risk requirement where the wrong behavior produces output that would otherwise pass the corpus's structural assertions. Per-phase corpus authoring includes one such pair per high-risk requirement: one positive fixture establishing what the right behavior looks like, plus one canary asserting the wrong behavior's symptoms are absent.

Manifestations:
- Phase 1: domain/range correctness — `p1_prov_domain_range` (right shape) + `canary_domain_range_existential` (wrong shape's absence)
- Phase 2: strategy-routing correctness — `strategy_routing_direct` (right strategy) + `parity_canary_visual_equivalence_trap` (wrong strategy's symptoms detectable via query)

The pair MAY span fixture categories (Phase 2's pair spans §3.3 + §3.4) when the assertion mechanism for each half lives more naturally in different categories.

### Cycle-cadence categorization

[Architect-banked across multiple Phase 2 cycles + reinforced at Q-Step6 cycle ruling 2026-05-XX.]

Three distinct cadence categories:

1. **Phase entry cycles** — corpus sign-off + Q-rulings + amendment cycles. Bounded by the corpus contract; resolves before any implementation code is cut. Phase entry cycles are NOT in the same cadence category as mid-phase escalations or between-phase architectural cycles. They do NOT increment cycle-density counters.

2. **Mid-phase escalations** — architectural questions surfacing during phase implementation. Phase 1's mid-phase count: 4 (Step 4 fixture amendment, Step 5 ADR-007 + reserved-predicate, BFO/CLIF parity initial, BFO/CLIF Layer A correction; the fourth was completion-of-prior-surface, not new-surface). Phase 2's mid-phase count: 6 (Phase 2 entry confirmation; license-verification corrective action; Step 4 spec-binding + ADR-011; Q-Step6 routing cycle; ADR-011 ratification follow-up; Step 8 stub-evaluator routing).

3. **Between-phase architectural cycles** — work between phase exits + entries that touches multiple phases' content (e.g., the bundled ADR-008 + ADR-009 cycle).

**Substantive-scope-weighting:** phase mid-cycle counts are weighted by the phase's substantive scope. Phase 1 (lifter-only) absorbs ~3-4 mid-phase cycles before density-pressure flags. Phase 2 (projector + audit artifacts + strategy router + cardinality + chain realization + parity-canary harness) absorbs higher counts (~6) without indicating density growth in the concerning sense. Per the architect's banking 2026-05-07: "phases shipping multiple coordinated architectural surfaces absorb correspondingly higher mid-phase cycle counts without indicating cycle-density growth."

**Per-phase entry-cycle corrective sub-cycles** stay in the entry-cycle bucket. Phase 2 entry's license-verification corrective action was a sub-cycle of the entry-cycle, not a new mid-phase escalation.

**Path-fence-author → architect-ratify cycles for prior-cycle-shape-ratified artifacts** do not increment cycle-cadence counters. They are completion of the prior cycle, not new cycles.

### Step scope is bounded by entry packet ratification + corpus-demanded surface

[Architect-banked at Q-Step6-3 ruling 2026-05-XX.]

Step scope is bounded by:
1. The Phase entry packet's ratification (which Steps are named; which deliverables they cover)
2. The corpus-demanded surface (what the architect-ratified fixtures actually exercise)

Round-trip symmetry is a fixture-regime concern, NOT a Step-scope expansion criterion. If a Step's entry-packet-ratified scope is "projector-only," expanding it to "bidirectional" because of round-trip-symmetry aesthetics violates the discipline.

Manifestation: Step 6 (Property-Chain Realization) shipped projector-only per Q-Step6-3 Option (α). Lifter `ObjectPropertyChain` support deferred to Phase 3 OR Phase 4 entry packet (whichever surfaces the demand first). The asymmetry between projector and lifter is expected under the regime taxonomy (chain fixtures classified as `regime: "reversible"` projector-direct); forcing symmetry by expanding Step 6 scope would be doing work for an unbounded reason.

### Borderline corrective actions default to ADR

[Architect-banked at ADR-010 (Q-β banking) + ADR-011 (Q6 generalization).]

Q6's "default to heavier path" applies to corrective-action ratification: when a corrective action straddles "amendment vs ADR" routing, default to ADR.

Discipline first-production-catches are architecturally significant and warrant ADR-level documentation. Generalization: when the SME-Persona Verification of Vendored Canonical Sources discipline (or similar) catches its first production defect, the originating-example-with-defect-caught is more pedagogically useful than the discipline framing alone for future phases inheriting the discipline.

### License-verification at vendoring time, format-agnostic

[Architect-banked at ADR-010 (license-verification corrective action 2026-05-06; Q-β refinement broadening to all formats).]

Vendoring discipline requires SME-persona verification of upstream license + commit SHA + LICENSE file SHA-256 BEFORE the first commit landing the vendored source. The verified `license-verification` block ships in the first commit.

**Format-agnostic application:** CLIF, KIF, OWL, TTL, RDF/XML, JSON-LD, etc. — the verification ritual is uniform; the license-verification fields' shape adapts to the license type. Phase 4 BFO 2020 CLIF Layer B vendoring + Phase 5 IAO + Phase 6 CCO 2.0 + all subsequent phase vendoring inherit this discipline regardless of source format.

**Discipline tightening principles** (per ADR-010 banked principles 1-5):
1. License-verification at vendoring time, not first-use time
2. Layperson reading of upstream license preambles is unverified-against-canonical (a note like "the repo-level LICENSE governs" inside the vendored file is a hint, not a verified fact)
3. Commit SHA references in sidecars require verified existence (asserting a SHA without confirming its existence is the failure mode the `783a3f7` defect exemplifies)
4. The verification gate's first production catch is banking-worthy (3-day latency between defect introduction and discipline-driven catch is the gap the discipline closes)
5. Closed phase exit retrospectives are not reopened for forward-discovered events (forward discoveries land in their natural target location — typically AUTHORING_DISCIPLINE for discipline-level events, ADRs for architectural-level events — and reference the closed retrospective, not the reverse)

### v0.2 distribution-model change is the legal-review trigger

[Architect-banked at ADR-010 Q-α banking 2026-05-06.]

If v0.2 introduces a runtime ARC manifest loaded directly from `arc/upstream-canonical/` paths (currently the manifest is bundled as JSON-LD modules per spec §3.6), the distribution model changes and CC BY 4.0 obligations may extend into the runtime artifact. That is the natural trigger for a formal legal review pass.

v0.1's moderate compatibility analysis in the SOURCE sidecar suffices until then. v0.1 ships with `package.json`'s `files` field excluding `arc/upstream-canonical/` from the npm package, bounding the CC BY 4.0 compliance scope to the GitHub repo.

### Self-containedness of ADRs over cross-reference dependency

[Architect-banked at ADR-011 banked principle 10.7 (2026-05-07).]

When an ADR captures corrective action plus discipline-level lessons, consolidating banked principles from the cycle into the ADR's banked-principles section makes the ADR self-contained for future readers rather than requiring cross-reference to multiple architect rulings.

Manifestation: ADR-011's banked-principles expansion (4 principles in the prior cycle's banking → 9 principles in the SME-drafted ADR-011) consolidated principles scattered across prior architect rulings into the ADR itself. Self-containedness over cross-reference dependency, when both are available.

This generalizes: ADR-008 (OFI deferral), ADR-009 (CCO module expansion), ADR-010 (license-verification), ADR-011 (audit-artifact `@id`), ADR-012 (cardinality routing) all follow the self-containedness pattern.

### Post-exit demo cadence applies to all phases

[Architect-banked at Phase 2 entry packet §10.5 (architect Q7 ruling 2026-05-06).]

The post-exit demo cadence applies to all phases, not just Phase 1. Each phase carries an optional demo deliverable scheduled within the phase but not gating its exit. Stakeholder visibility is real engineering work, but it lives parallel to the build's discipline, not inside it.

For Phase 2: `demo/demo_p2.html` shipped at commit `adcee39` (un-pocketed during Step 4a integration); refreshed at Step 9.4 doc pass to reflect Steps 4b/5/6/7/8 features + ADR-011/012 cross-references.

### SME pre-handoff verification ritual for FOL-input fixtures

[SME-banked at Concern B fixture-amendment cycle 2026-05-06 (`p2_lossy_naf_residue` `body` → `inner` typo correction).]

When the SME authors a FOL-input fixture for projector-direct exercise (mirrors `p2_lossy_naf_residue`, `strategy_routing_annotated`, `p2_property_chain_realization_simplified`, etc.), the SME's pre-handoff verification ritual:

1. **Cross-reference `src/kernel/fol-types.ts`** for the exact field-name convention per FOL term type. **Asymmetric field-name conventions across structurally-similar types are a known typo-vector:**
   - `fol:Negation` uses `inner: FOLAxiom`
   - `fol:Universal` and `fol:Existential` use `body: FOLAxiom`
   - `fol:Implication` uses `antecedent` + `consequent`
   - `fol:Atom` uses `predicate` + `arguments`
   - `fol:Variable` uses `name`
   - `fol:Constant` uses `iri`

2. **Smoke-test the fixture against the projector** (`folToOwl(fixture.input)`) before handing to Developer. A clean smoke-test catches structural validity errors that would otherwise surface as Developer-side test failures.

3. **For OWL-input fixtures (lift+project round-trip):** cross-reference `src/kernel/owl-types.ts` for the exact OWL axiom field-name convention. ABox `ObjectPropertyAssertion` uses `source` + `target` (NOT `subject` + `object`).

This ritual closes the gap surfaced at Concern B routing (the SME-typo `body: <inner>` for `fol:Negation` that the Developer caught via projector crash). Banking the routing-discipline principle: when SME-authored content diverges from a frozen-spec field name, the Developer routes back to SME with both options framed (typo vs deliberate amendment); SME confirms which. Prevents silent override of architect-ratified content.

### Stub-harness contract inline-in-JSDoc

[SME-banked at Step 8 stub-evaluator cycle 2026-05-XX.]

When authoring a test-corpus utility whose contract is architect-ratified at a routing cycle (e.g., `_stub-evaluator.js` per Phase 2 entry packet §3.4), the SME-authored leading JSDoc IS the audit-trail. Developer implements the function body per the leading JSDoc.

This pattern preserves audit-trail unity: the contract + the implementation live in the same file; future readers don't have to chase the contract across multiple documents (entry packet vs ADR vs source). Combined with the self-containedness-of-ADRs principle, the file's leading JSDoc is the load-bearing audit artifact for the harness's behavior.

### Deferral language has cycle-binding semantics

[Architect-banked at Step 9.1 conformance-gap routing cycle 2026-05-XX.]

When a phase or step's commit body or routing artifact uses deferral language naming a triggering condition (e.g., "diagnostic-throw deferred until SME-authored `strategy_routing_no_match` fixture surfaces a concrete pathological-axiom case"), the deferral language means: **ratification cycle starts when the condition is met, NOT that ratification is automatic on condition satisfaction.**

The triggering condition is the cycle-start signal; the architectural ratification still requires explicit architect routing in the appropriate cycle context. Holding that deferral language has cycle-binding semantics preserves its discipline-integrity. If "deferred until X" meant "ratify whenever after X," the deferral language would carry no cycle-binding semantics and the architect's deferral cadence could be unilaterally retracted by ratification timing.

Manifestation: Step 5's "diagnostic-throw deferred until SME fixture surfaces concrete case" — the SME's surfacing of the concrete case at Step 9.1 was the trigger; the architect's ratification (this cycle ruling (c)) is the appropriate-cycle response. The trigger does not pre-determine the closure substance.

### Architectural composition deferral

[Architect-banked at Step 9.1 conformance-gap routing cycle 2026-05-XX.]

**Architectural decisions with material composition surface in adjacent unimplemented phases defer to those phases' ratification cycles, not because deferral is conservative, but because composition reveals constraints that isolated ratification cannot.**

When ruling on a substantive architectural question at a current-phase micro-cycle would pre-commit a decision that interacts with a future-phase implementation context (typed-error class hierarchy in evaluator at Phase 3; honest-admission surfaces like `unverifiedAxioms` at Phase 3; ARC content with bridge axioms at Phase 4; etc.), the architect's correct posture is to defer ratification to the natural cycle context — even when the substantive question is well-formed at the current micro-cycle.

The discipline distinguishes:
- **Ruling-now is wrong because the decision composes badly across phases** (this principle's territory)
- **Ruling-now is wrong because cycle budget is tight** (corrupt cycle-discipline; not architect's reasoning)

The cycle-density framing (Phase 2 mid-phase count at 6 within substantive-scope-weighted bound) is a confirming observation, not the load-bearing argument. The load-bearing argument is composition.

### Honest-admission documentation of non-compliant baseline

[Architect-banked at Step 9.1 conformance-gap routing cycle 2026-05-XX.]

**Honest-admission documentation of non-compliant baseline is a valid regression-detection artifact when paired with explicit forward-tracking to the compliance ratification cycle.**

When a phase ships with a documented spec-non-compliance (e.g., Phase 2's `strategy_routing_no_match` silent-fallthrough on bare `fol:False` violating both spec §0.1 and §6.1), the corresponding fixture's expected-baseline contract:

- Documents the actual current behavior (NOT the spec-target behavior)
- Asserts the actual behavior via test-runner integration (regression-detection)
- Captures the spec-target behavior via `phaseNReactivation` forward-track (machine-checkable)
- Carries cross-references to the human-readable forward-track in the phase exit summary

The fixture's role pivots from "assertion of target contract" to "regression-detection on baseline + forward-track for target." This pivot is valid AS LONG AS the documentation is honest about the non-compliance — euphemism corrupts the discipline (see "Documented spec-non-compliance framing requirement" below).

### Multiple-architectural-item bundling at Phase entry packet ratification is efficiency-positive

[Architect-banked at Step 9.1 conformance-gap routing cycle 2026-05-XX.]

**When multiple architectural items naturally bundle at a Phase entry packet's ratification, the bundling is efficiency-positive, not competition-negative.**

The architect's per-cycle bandwidth absorbs bundled architectural items as a single cycle, not N parallel cycles. Phase entry packet authoring naturally surfaces multiple architectural items at once (Phase 3 entry will surface: `evaluate()` API surface; `checkConsistency()` surface; `unverifiedAxioms` field; cycle detection; per-predicate CWA; structural annotation mismatch; ARC manifest version mismatch; session-aggregate step cap; plus the no-strategy-applies closure inherited from Phase 2 Item 8). Routing them as a single ratification cycle is the canonical pattern; routing each as a separate parallel cycle would compound architect bandwidth without composition benefit.

Manifestations from prior cycles: Step 4 spec-binding cycle (3 architectural items in one cycle); Q-Step6 cycle (3 architectural items in one cycle); Phase 2 entry confirmation cycle (7 Q-rulings in one cycle). The pattern is canonical.

### Documented spec-non-compliance framing requirement

[Architect-banked at Step 9.1 conformance-gap routing cycle 2026-05-XX.]

**When phases close with deferred architectural closures that ship non-spec-compliant baselines, the deferral language must explicitly use "documented spec-non-compliance" framing in exit summaries. Euphemistic deferral framing ("implementation pending," "future work," "TODO," "deferred to a later phase") corrupts the honest-admission discipline.**

The framing requirement applies to:
- Phase exit summary risk-retrospective items
- Forward-track tables
- Fixture leading-comment documentation
- ADR-class architectural commitment text

The discipline costs the SME nothing (the framing is accurate) and pays consumer-trust dividends (downstream readers see the gap clearly, not buried in deferral language). Manifestation: Phase 2 exit Item 8 explicitly names the spec §0.1 + §6.1 non-compliance under the "documented spec-non-compliance" framing; alternative framings (e.g., "implementation gap" or "TODO at Phase 3") are refused.

This framing requirement composes with the honest-admission baseline documentation principle above: the fixture documents non-compliance as baseline; the exit summary names the non-compliance directly; both align via the framing convention.

### Exit-cycle and pre-exit micro-cycles for deferral-with-structural-requirements stay in the corrective-sub-cycle bucket

[Architect-banked at Step 9.1 conformance-gap routing cycle 2026-05-XX. Extends the cycle-cadence categorization principle.]

Exit-cycle and pre-exit micro-cycles for resolving documented gaps via **deferral-with-structural-requirements** (NOT substance ratification) stay in the corrective-sub-cycle bucket per the prior 2026-05-07 cadence-banking. They do NOT increment phase mid-phase counters.

Manifestation: Phase 2 Step 9.1 micro-cycle (this cycle) resolves the conformance gap via deferral-with-three-structural-requirements. This cycle does not increment Phase 2's mid-phase counter (which stays at 6 per the substantive-scope-weighted Phase 2 cycle reading); it is resolution work for an existing implementation gap, with the resolution being deferral rather than substance.

The bucket logic for entry-cycle corrective sub-cycles (banked at the license-verification corrective action 2026-05-06) generalizes to exit-cycle resolution work. Future cycles touching the same shape inherit the bucket-bounded cadence treatment.

**Distinction from substance-ratifying cycles:** if a future micro-cycle ratifies the substantive closure of a documented gap (e.g., Phase 3 entry packet ratifies Option (a) or Option (b) for the no-strategy-applies closure), THAT cycle is an entry-cycle architectural item (substantive ratification), not a corrective sub-cycle. The bucket distinction tracks substance-ratification vs deferral-with-structural-requirements.

---

## Phase 3 Banked Principles (folded in at Phase 3 exit doc-pass)

[Folded in at Phase 3 Step 9.5 doc pass. Captures architect-banked principles + SME-banked observations across Phase 3's cycles: entry packet ratification (initial review + final ratification both 2026-05-08), four in-Step architectural-gap micro-cycles (Steps 3 + 4 + 5 + 6 all 2026-05-09), and the retroactive corrective cycle (2026-05-09). Per architect cycle-accounting refinement 2026-05-09: Phase 3 mid-phase counter at 4 hits the entry-packet substantive-scope-weighting projection of ~3 at Step 6 with 3 Steps remaining; methodology refinement question forward-tracked to Phase 3 exit retro per the cycle-accounting-projection-accuracy banking. Approximately 46 banked principles transcribed verbatim per the §11-verbatim-transcription discipline.]

### Phase 3 entry packet — initial review (2026-05-08)

[Architect-banked at Q-3-A through Q-3-G initial-review cycle, 2026-05-08. Folded from `project/reviews/phase-3-entry.md` §12.]

#### At-risk-tagged stub-validated assertions warrant pre-emptive review at next phase entry

When stub-validated assertions are tagged at-risk-horn-fragment-closure or analogous risk tier, the next phase's entry cycle includes pre-emptive review BEFORE re-exercise gate runs. Pre-emptive review converts reactive cycle pressure into proactive cycle work, which compounds favorably. (Q-3-B operationalization)

#### Cross-phase deferred architectural closures resolve at the next phase's entry packet ratification cycle

When the deferral language explicitly named that target. The closing cycle's ratification updates the deferring cycle's exit packet to reflect closure, completing the deferral round-trip. (Q-3-C)

#### Defer to the phase whose corpus or content demands the work, not the phase whose cycle is next

When the natural surfacing-context for deferred work spans multiple candidate phases. Cycle-proximity is not corpus-demand. (Q-3-D)

#### Corpus-before-code applies to fixtures that exercise architectural-commitment-tier contracts

(e.g., spec-named guarantees, API-spec-named behavior contracts). Implementation-detail fixtures bind to Step-N. The split is binary at corpus authoring time; mixed shapes require routing. (Q-3-E)

#### Per-canary publication artifact schemas inherit from their forward-tracking origin

(Q-Frank-4 risk-estimate schema, in this case). The publication artifact is the resolution of the risk-estimate forward-track, not a fresh schema design. (Q-3-F)

#### Cycle 2 architect-mediated work splits by ratification surface

Entry-packet-internal amendments land with the entry packet final ratification commit; ADR promotions, prior-phase exit packet updates, and fixture amendments land in their own routing cycles. The audit-trail-unity-per-surface discipline applies. (Q-3-G)

#### Verified-fixture vs implementation drift discovered at phase close routes to the next phase's entry packet

Not to silent SME edit. The cycle-discipline preserves the Verified-status-as-architect-ratified guarantee. (I7 disposition; ratified at Q-3-G)

#### Per-phase entry packet ratification cycles operate in their own bucket and do not interact with prior-phase mid-phase counters

(cycle-accounting principle, initial-review cycle)

### Phase 3 entry packet — final ratification (2026-05-08)

[Architect-banked at amendment-shape verification cycle 2026-05-08. Folded from `project/reviews/phase-3-entry.md` §12 additional banked principles + cycle-accounting refinement.]

#### Pre-emptive review disposition ladders should include a bounded-amendment tier

Between confirmed-survives and architect-routing-required. The bounded tier is where the discipline pays its dividend; without it, pre-emptive review collapses to a binary that loses the proactive-conversion benefit. (Three-way disposition ladder banking)

#### Banked principle phrasing transmits verbatim across cycles until formal AUTHORING_DISCIPLINE folding-in

Paraphrasing at intermediate transmissions risks drift; verbatim preserves load-bearing language. Preserves load-bearing phrasing across the architect's banking → entry packet §11 → Phase 3 exit doc-pass formalization → AUTHORING_DISCIPLINE permanent record chain. (§11 transcription discipline)

#### Cycle-accounting refinement: per-phase entry-cycle counters increment per ratification cycle within the phase entry

Initial review + amendment ratification + corrective sub-cycles each count toward the entry-cycle counter, not toward mid-phase or cumulative counters.

### Step 3 architectural-gap micro-cycle (2026-05-09)

[Architect-banked at Q-3-Step3-A/B/C ratification cycle, 2026-05-09. Folded from `project/reviews/phase-3-step3-architectural-gap.md` §5.]

#### Architectural commitments adjacent to existing ADR architectural surfaces fold into the existing ADR as numbered sections rather than spawn new ADRs

Single-SHA audit-trail-per-architectural-surface preserves through ADR section growth. (Q-3-Step3-B framing — ADR-007 §11 placement; generalization of Q-3-G audit-trail-unity-per-surface)

#### Editorial corrections within v0.1.7 freeze include both terminology sharpening and language tightening to reflect newly-introduced API surfaces that were architecturally implicit but not textually explicit

The substance-preserving criterion governs both cases. (Editorial-correction ruling — generalization of Q-Frank-1)

### Step 3 Pass 2b confirmation cycle (2026-05-09)

[Architect-banked at Pass 2b ratification cycle, 2026-05-09. Folded from `project/reviews/phase-3-step3-architectural-gap.md` §5 additional banked principles.]

#### Ratified ADR text includes explicit statements of any architectural commitments the section preserves

(e.g., enum stability counts, version-bump dispositions, cross-section invariants) so future readers can verify the architectural claim without re-deriving it from cycle history. (Pass 2b banking — explicit-reason-enum-stability-statement discipline)

#### When ADR architectural surfaces grow through numbered section additions across cycles, the ADR's closing sections (Context, Consequences, Cross-references) update to reflect the accumulated architectural surface

Self-containedness preserves through architectural-surface growth. (Pass 2b banking — ADR-closing-section-update discipline)

#### Pass 2b architect-mediated cycles for ratifying path-fence-authored artifacts whose substance was ratified at the prior architect cycle do not increment cycle-cadence counters

They are completion of the prior cycle's resolution per the audit-trail-unity-per-surface discipline. (Pass 2b cycle-accounting note)

### Step 4 architectural-gap micro-cycle (2026-05-09)

[Architect-banked at Q-3-Step4-A ratification cycle, 2026-05-09. Folded from `project/reviews/phase-3-step4-architectural-gap.md` §7.]

#### Among options that preserve the same architectural commitment, the smaller-blast-radius option wins absent asymmetric benefit

Blast radius is a load-bearing comparator. (Q-3-Step4-A reasoning #3)

#### Reason-code reuse is bounded by semantic-state alignment, not just textual fit

When two existing reason codes plausibly fit a new case, choose the one whose canonical semantic exactly matches the case; refuse the looser fit even if the textual fit is closer. (Q-3-Step4-A Option (γ) refusal reasoning)

#### Editorial corrections within v0.1.7 freeze include reason-code label corrections in ratified ADR text

When the canonical enum value differs from the as-written label and the ADR's substantive intent is unchanged. (Editorial-correction generalization of Pass 2b banking)

#### SME pre-handoff verification rituals are mechanical canonical-source checks against artifact text references

Scoped to the canonical enums, type discriminators, section references, and cross-reference anchors that path-fence-authored artifacts reference. The ritual operationalizes the architect's trust posture by catching reference-correctness issues at SME-handoff time rather than post-ratification. (SME pre-handoff verification ritual banking)

#### Pass 2b banked principles bind subsequent cycles' ratifications

Explicit-statement discipline is not just documentation polish; it is a load-bearing constraint. (Reason-enum-stability binding effect)

#### Pre-handoff verification ritual is mechanical, not architectural-judgment-exercising

Mechanical character is the load-bearing operational property. (Verification-ritual character banking)

#### Discipline tightenings follow the same routing pattern as architectural commitments

Surfaced gap → proposed tightening → ratification → AUTHORING_DISCIPLINE folding-in. Speculative discipline-tightening is refused. (Discipline-tightening-cycle banking)

#### Verification ritual eight check categories (architect-ratified scope)

(1) Reason-code references → `src/kernel/reason-codes.ts`; (2) LossType references → API §6.4.1 enumeration; (3) FOLAxiom @type discriminators → `src/kernel/fol-types.ts` (or `evaluate-types.ts` + `fol-to-prolog.ts`); (4) OWLAxiom @type discriminators → `src/kernel/owl-types.ts`; (5) Reason enum stability statements → count canonical enum; (6) Spec section references → `project/OFBT_spec_v0.1.7.md`; (7) API spec section references → `project/OFBT_API_v0.1.7.md`; (8) ADR section references → `project/DECISIONS.md` + Q-rulings traceable.

### Step 5 architectural-gap micro-cycle (2026-05-09)

[Architect-banked at Q-3-Step5-A/B/C ratification cycle, 2026-05-09. Folded from `project/reviews/phase-3-step5-architectural-gap.md` §5.]

#### Reason-code semantic distinguishability is a binding constraint on inference-time strategy choice

When alternative strategies cannot produce the canonical reason codes, they are refused regardless of implementation simplicity. (Q-3-Step5-B reasoning #2 — visited-ancestor encoding produces `cycle_detected` cleanly while alternative strategies cannot distinguish from `step_cap_exceeded`)

#### When multiple inference-time strategies serve the same architectural commitment, the strategy with the cleanest forward-compatibility path to known v0.2+ work wins absent asymmetric Phase 1 benefit

Forward-compatibility is a load-bearing comparator. (Q-3-Step5-B reasoning #3 — SLG tabling subsumes visited-ancestor encoding cleanly)

#### Verification ritual categories expand to surface multi-canonical-source states as findings for routing rather than confirming on a single source

Multi-source states are themselves discipline gaps requiring architect routing. (Side-finding ruling — Cat 8 expansion to surface parallel-registry disconnects)

#### Disciplines ratified after surfaced production gaps validate their effectiveness at the next production cadence catch

(Verification-ritual production-catch banking — Step 4 binding-immediately discipline's first production dividend at Step 5: spec §3.4.4 → §3.4.1 correction caught pre-routing)

#### Verification ritual catches and fixes are disclosed in the routing artifact's verification-ritual section, surfacing the discipline's operation rather than burying it

Disclosure preserves the discipline-effectiveness audit trail. (SME transparent disclosure banking)

#### Methodology refinements (substantive-scope-weighting projection accuracy, cycle-counter operational definitions, etc.) surface at phase exit retros with complete phase data, not mid-phase

Mid-phase methodology critique is premature; exit retro reflection is the natural cycle. (Methodology-refinement-cycle banking — cycle-accounting projection-exceedance observation routes to Phase 3 exit retro)

### Step 5 Pass 2b confirmation cycle (2026-05-09)

[Architect-banked at ADR-013 promotion Pass 2b cycle, 2026-05-09. Folded from `project/reviews/phase-3-step5-architectural-gap.md` §5 additional banked principles.]

#### The visited-ancestor encoding is implementation-choice tier per spec §0.1; the architectural commitment is to cycle-free inference closure regardless of encoding

v0.2 SLG migration changes the encoding without changing the commitment; the architectural commitment migrates cleanly across encoding changes. (ADR-013 Refinement 1)

#### v0.2 is the natural SLG migration cycle, NOT the binding cycle

Phase 4-7 implementation surfaces of practical-depth issues route as own architect cycles with implementation evidence per spec §0.2.3; v0.1 visited-ancestor encoding is not a hard floor on encoding migration timing. (ADR-013 Refinement 2)

### Step 6 architectural-gap micro-cycle (2026-05-09)

[Architect-banked at Q-3-Step6-A/B/C ratification cycle, 2026-05-09. Folded from `project/reviews/phase-3-step6-architectural-gap.md` §9.]

#### Cross-API vocabulary alignment for semantically identical state shapes is binding when the alternative produces multiple mental models for the same state

(Q-3-Step6-A reasoning #1 — `ConsistencyResult.consistent: boolean` → `ConsistencyResult.result: 'true' | 'false' | 'undetermined'` aligning with `EvaluationResult.result`)

#### Boolean-type-suggesting field names with non-boolean values invite consumer-side truthiness gotchas — rename or retype removes the boolean-association cue

(Q-3-Step6-A reasoning #3)

#### Phase exit retro forward-tracked items accumulate evidence across mid-phase cycles between forward-track creation and exit retro execution

Concrete-data observations during this window strengthen the retro's analysis foundation without re-routing the methodology question mid-phase. (Q-3-Step6-C reinforcement)

#### Retroactive ritual scope extends to all artifacts whose ratified text references canonical-source artifacts the ritual would cover at current authoring discipline

The retroactive scope mirrors the forward scope; both are bounded by the canonical-source-reference criterion. (Side-finding scope ruling)

#### Retroactive ritual batch findings route as a single corrective cycle

Per-finding routing fragments the audit trail and defeats the consolidation purpose of the retroactive ritual. (Side-finding routing ruling)

#### Corpus-before-code fixtures bind their owning Step's implementation as a whole-set contract; subset implementation is refused

(Step 6 implementation strategy ruling)

#### Witness extraction returns proof-tree-axioms for v0.1; algorithmic set-minimization defers to v0.2+ as optimization

Both readings of "minimal inconsistent subset" satisfy the API §8.1 contract; the v0.1 reading is operationally sufficient for downstream triage. (Witness extraction minimum-viable ruling)

#### Verification rituals serve dual operational purposes: surfacing errors that become routing substance, and validating that path-fence-authored content is clean against canonical sources

Both purposes are load-bearing; neither subsumes the other. (Verification ritual dual-purpose banking)

#### Verification rituals ratified mid-phase do NOT retroactively apply by default

They operate forward only; pre-ratification content surfaces errors at next production cadence catch. (Default-forward-only banking)

#### Verification rituals MAY be applied retroactively via one-shot batch runs scoped to the artifacts the ritual would cover

(Retroactive-batch-option banking; operationalized at Phase 3 retroactive corrective cycle 2026-05-09)

### Step 9 architectural-gap micro-cycle — Q-3-Step9-A exit-blocking finding (2026-05-10) + corrective ruling per Q-Frank-Step9-A stakeholder critique (2026-05-10)

[Architect-banked at Q-3-Step9-A ruling, 2026-05-10; corrective ruling and banking revisions issued same-day per Q-Frank-Step9-A stakeholder critique. Folded from `project/reviews/phase-3-step9-architectural-gap.md` (the routing artifact, with corrective overlay) + `demo/Phase3DemoCritique.md` (Frank's critique) + the architect's banking-correction ruling. Cycle type: fifth Phase 3 mid-phase architectural-gap micro-cycle + first stakeholder-routing corrective sub-cycle.]

**Banking-correction discipline applied:** the architect issued banking corrections (3 withdrawals + 7 new bankings + 1 meta-banking) when the Frank stakeholder critique surfaced concerns that hold on the merits. The architectural-commitment surface is preserved by clean revision when prior rulings were structurally incorrect, not by procedural defense. This subsection records both the original ruling's preserved bankings AND the corrective ruling's withdrawals + new bankings.

---

#### Withdrawn bankings (corrections to the original Q-3-Step9-A ruling)

The following three bankings issued at the original Q-3-Step9-A ruling are **WITHDRAWN** per the Q-Frank-Step9-A corrective ruling 2026-05-10:

- **Withdrawn:** "Disposition spectrum rulings on exit-blocking findings split scopes when the finding's distinct components have different fix-cost profiles" (was BP 3) — Frank's §3 reasoning correctly identified this as post-hoc rationalization; a discipline tested only against the case it was invented to address is not a discipline.
- **Withdrawn:** "Phase exit packet's deferred-with-structural-requirements bucket inherits exit-blocking finding components per the disposition-split discipline" (was BP 5) — derives from withdrawn BP 3.
- **Withdrawn:** "Frame I ruling does not extend to non-Horn-fragment fixtures' unverifiedAxioms count semantics, which require their own analysis" (was BP 4) — count-semantics analysis is bounded to resolution cycles when the architect can rule on the merits, not a future-cycle forward-track by default.

**The disposition-split discipline is not a banked principle.** The Q-3-Step9-A resolution stands as case-specific reasoning (the `nc_self_complement` arm closed pre-exit; the Layer A arm pulled from demo per the corrective ruling), but the discipline is not banked as architectural-commitment-tier methodology. Phase 4 entry packet does NOT inherit a "disposition-split discipline as Phase-4-entry methodology candidate" forward-track; that forward-track is also withdrawn.

---

#### Preserved bankings from the original Q-3-Step9-A ruling (stand on their own merits)

The following two bankings issued at the original Q-3-Step9-A ruling stand as architectural-commitment claims on their own merits, not as disposition-split discipline derivatives:

#### Spec interpretation framing rulings on exit-blocking findings default to spec-literal framing when corpus discriminators align with the literal framing

Frame II readings narrowing the spec post-hoc are refused on corpus-as-contract grounds. The fixture corpus's `discriminatesAgainst` field is the architect-ratified canary-discrimination contract (per Q-3-E corpus-before-code at Phase 3 entry); accepting Frame II to relax that scope to permit `'undetermined'` where Horn-checkable fragment requires `'false'` / `'true'` corrupts the corpus-as-contract discipline. **Why:** spec §8.5.1's literal framing is binding (per ADR-012 banked principle 1, "spec interpretation defaults to literal framing"); narrowing the spec post-hoc to accommodate implementation gaps is the inverse of the discipline. **How to apply:** when an exit-blocking finding surfaces an implementation/corpus divergence, audit whether the corpus's discriminator framing aligns with the spec's literal framing first; if yes, the implementation is incomplete (Frame I); if no, the corpus may be overscoped and corpus-amendment is the disposition. The Q-3-Step9-A finding's `nc_self_complement` and Layer A arms both passed the corpus/spec-literal alignment test, so Frame I governed.

#### Simple disjointness assertions per spec §8.5.1 are Horn-checkable

The FOL translation `∀x. C(x) ∧ D(x) → False` is a Horn clause (negative-head form per ADR-007 §11). Satisfiability checks on individual named classes do not require consulting the disjointness axiom unless some individual is asserted to both classes. **Why:** spec §8.5.1's Horn-checkable fragment definition explicitly includes "simple disjointness assertions"; the FOL translation produces a Horn-clause-expressible form. The implementation must distinguish "this axiom is non-Horn" from "this axiom is Horn-expressible but not exercised on this subset"; conflating the two over-classifies as `coherence_indeterminate` and corrupts the affirmative-arm verdict. **How to apply:** when a `FOLFalse`-in-head clause is loaded, the Horn-fragment classifier must classify it as Horn-translatable; the consistency check then runs Horn resolution to either prove the contradiction (per spec §8.5.2 outcome 1) OR affirm consistency by exhausting the body without proof (per spec §8.5.2 outcome 2). Defaulting to `coherence_indeterminate` for FOLFalse-in-head clauses regardless of whether any individual triggers the body is the canonical Layer A affirmation gap (forward-tracked to v0.2 ELK closure per `project/v0.2-roadmap.md`).

---

#### New bankings from Q-Frank-Step9-A corrective ruling (2026-05-10)

The architect's corrective ruling in response to Frank's stakeholder critique issues seven new bankings + one meta-banking:

#### When a phase's implementation does not yet satisfy a spec requirement on a canonical positive control, the demo does not claim what the implementation cannot demonstrate

Pulling the case from the demo is preferable to soft-language framing. **Why:** the spec defines a contract; the implementation either satisfies it or does not. There is no third state called "documented divergence" in formal verification practice; soft-language framing ("documented v0.1 spec-divergence; v0.X closure absorbs the gap") uses procedural language to avoid choosing between (a) acknowledging implementation defect and roadmapping, (b) amending the spec with independent evidence, or (c) pulling the case from the consumer-facing artifact. **How to apply:** at exit-blocking findings where the implementation falls short of a spec-required affirmative verdict on a canonical positive control, the demo pulls the case entirely; the gap forward-tracks via the consolidated v0.X-roadmap artifact (not via soft demo framing). The Layer A consistency-affirmation gap at Q-3-Step9-A is the canonical example: Case B was authored, surfaced as falling short of spec §8.5.1's required affirmative verdict, soft-framed as "documented v0.1 spec-divergence" at the original ruling, and pulled from the demo at the corrective ruling. (Ask 1 banking)

#### Honest-admission framing for spec-non-compliance applies to internal exit-summary artifacts, not to consumer-facing demo artifacts

The Phase 2 Step 9.1 honest-admission banking for documented spec-non-compliance stands as written for exit summaries (internal audit artifacts); it does NOT extend to demos (consumer-facing trust-building artifacts). **Why:** exit summaries are internal artifacts whose audience can read the documentation context (the forward-track entry, the v0.X closure path, the architect ratification cycle) alongside the spec-non-compliance acknowledgment. Demos are external artifacts whose audience reads only what the demo shows; soft-language framing in a demo conflates "documented gap with closure path" with "passing canary," and a logic-savvy consumer correctly reads the demo as making a claim it cannot deliver. **How to apply:** at demo authoring, the demo claims what the implementation establishes; what the implementation does not yet establish does not appear in the demo. Internal exit packets retain the honest-admission documentation discipline. (Ask 1 distinction banking)

#### When fixture-vs-implementation count divergences surface at exit boundaries, the resolution requires architect ruling on which is correct

Forward-tracking the choice as a "corpus-discriminator-scope question" ships mutually inconsistent fixtures and code, which is refused. **Why:** when a fixture's structured field disagrees with the implementation's behavior, exactly one is correct on the merits and the other should be amended. Forward-tracking the choice means shipping a v0.1 baseline where the fixture's authoritative-contract status (per the Q-3-E corpus-before-code discipline) and the implementation's actual behavior are simultaneously presented as correct, which is incoherent. **How to apply:** at exit-blocking count divergences, the architect rules on which side is correct on inspection (typically by reasoning from the spec's load-bearing claims about which axioms are Horn vs non-Horn), and the corrective commit amends the loser to match. Routing to a future cycle is reserved for cases where neither side is clearly correct on inspection. The `nc_horn_incomplete_disjunctive` count divergence at Q-Frank-Step9-A is the canonical example: the implementation is correct (only the disjunctive-consequent SubClassOf is non-Horn; the disjointness is Horn-expressible); the fixture over-specified; the fixture's `expectedUnverifiedAxiomsMinCount` field amended. (Ask 2 banking)

#### Stakeholder-flagged demo gaps that span multiple phase cycles get explicit phase-deliverable commitments at the next phase entry packet

Three-cycle drift on a stakeholder-flagged gap is sufficient evidence to require explicit commitment, not soft "v0.X may include this" framing. **Why:** stakeholder-flagged gaps that drift across phases without explicit deliverable commitments accumulate into pattern, where "we'll get to it eventually" becomes the project's de facto position on consequential capabilities. The three-cycle threshold is conservative enough to avoid premature commitment-creation but firm enough to break the drift pattern. **How to apply:** when a stakeholder critique flags a demo gap and the gap appears in two or more subsequent demo critique cycles, the next phase entry packet's deliverable list names the gap-closure as an exit deliverable (not a forward-track). Frank's three-cycle Case C flag at Phase 3 close triggers this discipline: Phase 4 entry packet's deliverable list explicitly includes Case C — Lossy round-trip — as a Phase 4 exit deliverable, not a forward-track. (Ask 4 banking)

#### Disciplines invented in response to specific findings do not get banked as architectural-commitment-tier methodology in the same cycle

Banking requires the discipline to have been tested against at least one independent case; pre-banking would canonize rationalization. **Why:** a discipline that emerges in the middle of resolving a specific crisis, immediately gets ratified, and then gets used to absorb the crisis it was invented to address is structurally suspicious. Frank's §3 reasoning is correct: a discipline tested only against the case it was invented to address is not a discipline; it is a rationalization. **How to apply:** when a cycle resolution requires reasoning that resembles a generalizable pattern, the case-specific reasoning ratifies for the case at hand only; the generalizable pattern bankings wait for an independent case to validate. The disposition-split reasoning that resolved Q-3-Step9-A's nc_self_complement closure + Layer A pull is preserved as case-specific reasoning; the corresponding "discipline" is NOT banked. (Ask 5 banking)

#### Disciplines that absorb findings without exclusion criteria are schedule-protection mechanisms, not quality-protection mechanisms; they are refused as banked principles

A discipline must include a test for what it refuses to absorb; without one, it is structurally a schedule-protection mechanism. **Why:** Frank's three-question framing surfaces the structural concern: (a) Did the discipline exist before the finding? (b) What is the test for in-scope vs out-of-scope? (c) Will the discipline ever produce a "this is a v0.X blocker, period, ship is delayed" outcome? Without principled answers to all three, the discipline absorbs anything because it is designed to absorb. **How to apply:** at banking-decision time for any discipline that operates on findings, audit the three questions; if any answer is "no" or "the architect rules," the discipline is refused as banked principle and only operates as case-specific reasoning. The disposition-split discipline failed all three tests at Q-Frank-Step9-A and is refused as banked principle. (Ask 5 second banking)

#### When deferred-closure-path framing accumulates across phases, a consolidated roadmap artifact at the next phase boundary lists every commitment with scope/owner/timeline

Without consolidation, deferred-closure framing becomes placeholder pattern that ships unfixed semantics without accountability. **Why:** each invocation of "v0.X closes Y" is a deferred commitment that has to be tracked and honored; absent consolidation, no single artifact lists all such commitments and a critic can correctly observe that "v0.X" is doing structural work without commensurate accountability. **How to apply:** at phase exit, when the cumulative count of "v0.X closes Y" invocations across the phase's demos / walkthroughs / exit packets / ADRs exceeds a small threshold, a consolidated `vX.Y-roadmap.md` artifact lists every commitment with source phase, source gap, scope (named features), owner (or "TBD"), and timeline (or "TBD"). The `project/v0.2-roadmap.md` artifact authored at Phase 3 close per Q-Frank-Step9-A Ask 6 is the canonical example. (Ask 6 banking)

---

#### Meta-banking — Frank's letter as exemplar + banking-correction discipline

#### Frank's Phase 3 letter is the canonical articulation of the post-hoc-discipline-canonization risk pattern

Future cycles facing pressure to bank disciplines invented in response to specific findings reference [`demo/Phase3DemoCritique.md`](../demo/Phase3DemoCritique.md) as the cautionary precedent. **Why:** Frank's §3 reasoning identifies the structural pattern by which serious projects develop the soft language of schedule pressure: a discipline emerges in resolving a specific crisis, immediately ratifies, and gets used to absorb its founding case; once canonized, it is available for the next crisis; after three or four crises, the discipline has hardened into the project's normal mode. The letter names this pattern explicitly while it was small enough to interrupt. **How to apply:** at any banking-decision cycle where a discipline is proposed in response to a specific finding, reference Frank's letter as the cautionary lens; the architect's three-question test (precedent existence, in-scope/out-of-scope criterion, exclusion-criterion existence) operationalizes the lens.

#### The architect issues banking corrections (withdrawals and new bankings) when stakeholder critique surfaces concerns that hold on the merits

The architectural-commitment surface is preserved by clean revision when prior rulings were structurally incorrect, not by procedural defense of prior rulings. **Why:** the discipline this project commits to requires the architect to push back on prior rulings when stakeholder critique surfaces concerns that hold on the merits. Procedural defense of structurally-incorrect prior rulings corrupts the architectural-commitment surface more than clean revision does. **How to apply:** at stakeholder-routing cycles after phase close, when the critique surfaces concerns that hold on the merits, the architect issues explicit banking corrections (withdrawals + new bankings) rather than refining prior framings with sub-clauses. The Q-Frank-Step9-A cycle's three withdrawals + seven new bankings + this meta-banking constitute the canonical example. (This cycle's banking-correction discipline)

### Phase 3 retroactive corrective cycle (2026-05-09)

[Architect-banked at retroactive-corrective Pass 2b cycle, 2026-05-09. Folded from `project/reviews/phase-3-retroactive-corrective.md` §7.]

#### Hypothetical-axiom fixtures testing Horn-fragment escape must use the canonical FOL Disjunction-in-consequent shape per spec §8.5.4 to exercise the unverifiedAxioms surface correctly

OWL-axiom-shape disjunction (ObjectUnionOf) does not exercise the FOL-layer Horn-fragment classifier. (Finding 2 substantive banking)

#### Machine-readable identifier conventions across surfaces (reason codes, error codes, expectedThrows fixture fields, audit-artifact discriminators) align to snake_case per OFBT convention

PascalCase is reserved for TypeScript class names. (Finding 3 ruling banking)

#### The retroactive ritual's first production batch dividend confirms the discipline-tightening pattern

Future retroactive ritual runs at phase boundaries inherit the same batch-dividend expectation. Discipline-tightening pattern (banked at Pass 2b 2026-05-09) confirmed at production cadence: ratification → operationalization → first batch run → catches expected error class as single consolidated cycle. (Retroactive ritual production-dividend banking)

### Cross-cycle banking summary

Phase 3 banked the verification ritual as a discipline-tightening pattern + operationalized it within-cycle (Step 4 ratification → Step 5 first production catch → Step 6 retroactive batch run → first production dividend confirmation). The pattern's load-bearing properties:

- **Mechanical character** — grep-based canonical-source checks; not architectural judgment
- **Dual operational purpose** — surfacing errors as routing substance + validating path-fence-authored content clean
- **Forward-only by default** — but retroactively applicable via one-shot batch runs per architect ruling
- **Disclosed in routing artifacts** — surfacing the discipline's operation preserves the audit trail

Future phases inherit the verification ritual as binding-from-Step-4-of-Phase-3-forward; phase boundaries are natural retroactive-batch-run scope when discipline ratifications occur mid-phase.

Phase 3 originally banked the **disposition-split discipline** at Step 9 architectural-gap micro-cycle (Q-3-Step9-A 2026-05-10), but the discipline was **withdrawn** at the Q-Frank-Step9-A corrective ruling (same day) per Frank's stakeholder critique. The withdrawal banks two principles instead: (1) disciplines invented in response to specific findings do not get banked as architectural-commitment-tier methodology in the same cycle, and (2) disciplines that absorb findings without exclusion criteria are schedule-protection mechanisms, not quality-protection mechanisms. The Q-3-Step9-A resolution stands as case-specific reasoning (`nc_self_complement` closed pre-exit; Layer A pulled from demo per the corrective ruling; count divergence resolved via fixture amendment); the corresponding "discipline" is not banked.

The architect's banking-correction discipline at Q-Frank-Step9-A is itself banked as meta-principle: the architectural-commitment surface is preserved by clean revision when prior rulings were structurally incorrect, not by procedural defense of prior rulings.

### Phase 3 exit retro forward-track candidates

Four methodology-refinement candidates for Phase 3 exit retro per the architect-banked methodology-refinement-cycle banking (Step 5 micro-cycle + Q-3-Step9-A 2026-05-10):

1. **Parallel-registry reconciliation** — spec §13 ADR table (22 entries post-ADR-013 update) vs `project/DECISIONS.md` (13 ADRs post-ADR-013 promotion) diverge across ADR-001 through ADR-012 numbering and titles. SME hypothesis: spec §13 is v0.1.4-era aspirational behavioral-spec-decision register; DECISIONS.md is implementation-side register that grew in parallel. Phase 3 exit retro routes the reconciliation as its own architect cycle with three options: (a) merge into a single canonical register, (b) document parallel framing with cross-references, (c) migrate one register's content into the other.

2. **Substantive-scope-weighting methodology refinement** — Phase 3 mid-phase counter closed at **5 of 5** Steps (3 + 4 + 5 + 6 + 9 architectural-gap micro-cycles). Substantive-scope-weighting projection at Phase 3 entry was ~3; Phase 3 exceeds projection by 2. Methodology refinement question for retro now has full Phase 3 data: (i) was the under-projection systematic across phase types or specific to Phase 3's evaluator+consistency+cycle-detection scope, (ii) what refinement to substantive-scope-weighting methodology applies at Phase 4+ entry, (iii) does the retroactive ritual's phase-boundary discipline tool generalize to absorbing some of the cycle pressure that would otherwise surface as mid-phase escalations?

3. **At-risk-tag-conservatism observation** — 2 of 2 at-risk-horn-fragment-closure parity canaries survived at Step 2 reactivation; conservative tagging preserved the integrity of the publication contract but did not manifest as actual divergence. Methodology refinement question for retro: should at-risk tagging methodology refine to distinguish structural-shape-bounded-Horn from semantic-content-bounded-Horn? Should "expected-to-survive after pre-emptive review" become a recognized risk-estimate transition state?

4. **Banking-correction discipline at stakeholder-routing cycles** (per Q-Frank-Step9-A 2026-05-10) — the architect issues banking corrections (withdrawals + new bankings) when stakeholder critique surfaces concerns that hold on the merits. Methodology refinement question for retro: (a) what is the threshold for "concerns that hold on the merits" — when does the architect revise vs defend? (b) what cadence should banking corrections follow when multiple prior bankings need revision (single corrective cycle vs sequential revision)? (c) does the banking-correction discipline generalize to non-stakeholder-routing cycles (e.g., when an architect notices a prior ruling was structurally incorrect during their own review)? Frank's letter (`demo/Phase3DemoCritique.md`) banked as canonical exemplar of the post-hoc-discipline-canonization risk pattern.

These four exit-retro candidates are documented in `project/reviews/phase-3-exit.md` deferred-with-structural-requirements bucket; the broader 8 forward-track items (parallel-registry, substantive-scope-weighting, retroactive-ritual-pattern, DisjointClasses lifter case, per-class Skolem-witness, closure_truncated emission, Tau Prolog step extraction, spec-file rename) all forward-track to Phase 4 entry packet per Aaron's routing election 2026-05-09. The Q-Frank-Step9-A corrective ruling adds the following Phase 4 entry-packet inheritance: (a) Case C — Lossy round-trip — as Phase 4 exit deliverable (NOT forward-track) per Ask 4; (b) purpose-built Phase 3/4 Layer A consistency-check parity fixture question per Ask 8; (c) Layer A consistency-affirmation gap closure path per the consolidated `project/v0.2-roadmap.md` (NOT a "disposition-split discipline" methodology candidate — that forward-track is withdrawn per Ask 5).
