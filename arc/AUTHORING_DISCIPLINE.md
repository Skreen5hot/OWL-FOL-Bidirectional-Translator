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

Per spec §3.6.4 and `MODULE_DEPS` in `scripts/lint-arc.js`:

```
core/bfo-2020             (root)
core/iao-information      depends on: core/bfo-2020
cco/realizable-holding    depends on: core/bfo-2020
cco/mereotopology         depends on: core/bfo-2020
ofi/deontic               depends on: core/bfo-2020, core/iao-information
```

An entry's `subPropertyOf` IRI MUST resolve to an entry in the same module or one of its declared dependencies. `lint-arc.js` flags violations.

## Per-Phase Exit Checklists

Each ARC-bearing phase has explicit ARC Authoring Exit Criteria in `project/ROADMAP.md`. Summary:

- **Phase 4** (BFO 2020 core): every Verified BFO entry has a fixture; BFO Disjointness Map commitments formalized; bridge axioms (Connected With) present with FOL definitions; lint passes.
- **Phase 5** (IAO information): every Verified IAO entry has a fixture; lint passes.
- **Phase 6** (CCO realizable-holding + mereotopology): every Verified CCO entry has a fixture; lint passes.
- **Phase 7** (OFI deontic): every Verified OFI entry has a fixture; directive/commitment disjointness commitments formalized (rows 65-66 from Phase 0.6); lint passes.

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
