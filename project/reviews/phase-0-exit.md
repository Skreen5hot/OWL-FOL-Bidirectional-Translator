# Phase 0 Exit Review

**Date:** 2026-05-02 (amended after architect review)
**Phase:** 0 — Foundations
**Plan reference:** `OFBT_implementation_plan_v1 (1).md` §3.1
**Roadmap reference:** `project/ROADMAP.md` Phase 0 (sub-sections 0.1-0.8)
**Status:** **EXITED** — all gates verified green locally; pending Orchestrator commit pass per the Architect Amendment Cycle below.

---

## Architect Amendment Cycle (per architect Phase 0 review 2026-05-02)

The architect approved Phase 0 exit conditional on three gating items. Status of each:

### Gating item 1 — `npm run ci` green-light
- ✅ **PASSING locally.** Three independent runs of `npm run clean && npm run ci` were executed within this session, all reporting:
  - `npm run build` — clean
  - `npm test` — **47/47 tests passing across 7 files** (determinism, no-network, snapshot, errors, reason-codes, version, session)
  - `npm run test:purity` — **8 kernel files checked, no purity violations** under the tightened ADR-006 ruleset (forbids all `node:*` except `node:crypto`; forbids `process.argv/stdout/stderr/exit/cwd/pid`; forbids `console.*`; forbids `crypto.X` where X is not `subtle.digest`)
  - `npm run test:corpus-manifest` — **manifest valid** (0 entries, 0 fixture files)
- ⚠️ **Commit SHA pending Orchestrator action.** Per CLAUDE.md §4, no commit was created by the developer. All Phase 0 work currently sits on the working tree. The architect-required commit SHA + CI run ID will be inserted into this section after Aaron commits and the GitHub Actions CI run completes on the pushed commit. Suggested commit message:
  > `Phase 0 exit: foundations complete (errors, REASON_CODES, version surface, session lifecycle, ARC scaffolding, corpus manifest); CLI restructured to src/adapters/cli.ts per ADR-005; purity rules tightened per ADR-006`
- **Insert here after commit:** `Commit SHA: <sha>` / `CI run ID: <run-id>` / `CI run URL: <url>`

### Gating item 2 — CLI restructure landed in Phase 0 (not deferred to Phase 1)
- ✅ **DONE in this session.** Per ADR-005:
  - `src/kernel/index.ts` rewritten as kernel-only public barrel (no I/O, no `process.*`, no `node:fs`)
  - `src/adapters/cli.ts` carries the file-I/O / stdout / stderr / process.exit logic
  - `src/index.ts` is the new top-level package barrel re-exporting kernel + composition
  - `package.json` `main`/`types`/`exports["."]` repointed at `dist/index.js`
  - CI `Verify CLI` step invokes `dist/adapters/cli.js`
  - `node dist/adapters/cli.js examples/input.jsonld` verified working in this session
- ✅ **No orphaned kernel CLI file.** `ls src/kernel/` shows: `canonicalize.ts errors.ts index.ts reason-codes.ts tau-prolog-probe.ts transform.ts version-constants.ts version.ts` — all kernel-pure, all passing the tightened purity check.
- ✅ **Tightened purity rules** (ADR-006) close the underlying class of violation: any future contributor reintroducing `process.argv` / `process.stdout` / `node:fs` / `console.*` into `src/kernel/` triggers a CI failure. The architect's diagnosis ("if the checker doesn't fire on it today, the checker is mis-implemented") is addressed: the SME caught this hole as B1 in the same session, and ADR-006 closes it.

### Gating item 3 — Module-column workstream scheduled as parallel work starting Phase 1
- ✅ **Captured in Phase 1 entry expectations** in this exit summary (see "Phase 1 Entry Recommendations" below) and in ROADMAP Phase 1 as a parallel-workstream note. Per plan §5.2, ARC content authoring begins in Phase 0 and proceeds throughout — Aaron's parallel workstream activates at Phase 1 entry rather than waiting for Phase 4.
- This is an expectation-setting item, not a code item. It belongs in the Phase 1 entry review when that lands.

---

## Exit Criteria — Per Roadmap

### 0.1 Package and Build Tooling
- [x] `package.json` declares `tau-prolog@0.3.4` as peer dependency per API spec §13.7
- [x] `package.json` declares `rdf-canonize` as runtime dependency
- [x] ES Module structure per API spec §13.1; named exports preferred via `exports` field
- [x] esbuild configuration in place ([`esbuild.config.js`](../../esbuild.config.js)) for browser + Node bundles
- [x] Bundle measurement script ([`scripts/measure-bundle.js`](../../scripts/measure-bundle.js)) — measurement only, no enforcement
- [x] CI pipeline ([`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)) extended with: build, spec tests, purity check, corpus manifest gate, ARC lint, bundle measurement
- [x] **OFBT-specific purity checker** at [`scripts/ensure-kernel-purity.ts`](../../scripts/ensure-kernel-purity.ts) implementing the architect's allowlist ruling: forbids Date/RNG/env/I/O/sort-without-comparator non-determinism patterns; allowlists `tau-prolog`, `rdf-canonize`, and (when relevant) `crypto.subtle.digest`
- [⚠️] Package imports successfully in Node v18+ and modern browsers — **NOT YET VERIFIED**: `node_modules/` does not exist; `npm install` + `npm run build` required

### 0.2 Typed Error Class Hierarchy
- [x] `OFBTError` base class with `code` + `libraryVersion` fields
- [x] All 11 subclasses + `TauPrologVersionMismatchError` implemented in [`src/kernel/errors.ts`](../../src/kernel/errors.ts)
- [x] Every subclass extends `OFBTError`; documented fields present
- [x] Unit tests: [`tests/errors.test.ts`](../../tests/errors.test.ts) — 13 cases covering instantiation, field shape, inheritance chain, code mapping

### 0.3 Frozen REASON_CODES Enum
- [x] `REASON_CODES` exported as `Object.freeze`d constant in [`src/kernel/reason-codes.ts`](../../src/kernel/reason-codes.ts)
- [x] All 16 members present per API spec §11
- [x] Mutation attempts throw at runtime (verified by tests)
- [x] Consumers can switch exhaustively over `ReasonCode` discriminated union
- [x] Unit tests: [`tests/reason-codes.test.ts`](../../tests/reason-codes.test.ts) — 7 cases

### 0.4 Version Surfacing and Tau Prolog Verification
- [x] Sync `getVersionInfo()` returns documented shape with `apiSpecVersion: '0.1.7'`
- [x] `buildTimestamp` omitted in published-build path per §9.1.1
- [x] Sync `verifyTauPrologVersion()` returns discriminating result (no throw on mismatch)
- [x] Probe seam (`registerTauPrologProbe`) for testability without peer dep installed; defaults to `globalThis.pl?.version` (Tau Prolog's standard browser registration)
- [x] Unit tests: [`tests/version.test.ts`](../../tests/version.test.ts) — 9 cases

### 0.5 Session Lifecycle Skeletons
- [x] `createSession()` calls `verifyTauPrologVersion()` internally per API spec §13.7.2
- [x] `createSession()` throws `TauPrologVersionMismatchError` with populated expected/found/resolution on mismatch
- [x] Frozen-config snapshot per session (mutation throws)
- [x] `disposeSession()` flips disposed flag; idempotent on re-call
- [x] `disposeSession(null)` and `disposeSession(undefined)` throw `SessionRequiredError`
- [x] No module-level singleton; each call returns a fresh handle
- [x] Unit tests: [`tests/session.test.ts`](../../tests/session.test.ts) — 11 cases

### 0.6 ARC Manifest TSV→JSON-LD Migration
- [x] [`scripts/build-arc.js`](../../scripts/build-arc.js) — TSV → five JSON-LD module files compiler
- [x] [`scripts/regenerate-arc-tsv.js`](../../scripts/regenerate-arc-tsv.js) — JSON-LD → TSV regenerator
- [x] [`scripts/round-trip-arc.js`](../../scripts/round-trip-arc.js) — orchestrator with non-strict / strict modes
- [x] [`arc/module-assignments.example.json`](../../arc/module-assignments.example.json) — transition affordance until SME folds Module column into TSV
- [⚠️] **TSV `Module` column NOT YET ADDED** — explicit SME (Aaron) deliverable; engineering ships the compiler scaffolding here. The round-trip script runs in non-strict mode by default until the Module column lands. Acceptance criterion "Module column added to TSV" remains open as a Phase-4-entry-blocking SME task.
- [⚠️] **Disjointness commitments in Notes (rows 65-66)** not yet formalized into machine-readable axiom entries — Phase 7 ARC Authoring Exit Criterion per ROADMAP.

### 0.7 SME Tooling and Authoring Infrastructure
- [x] [`scripts/build-arc.js`](../../scripts/build-arc.js) (compiler — also part of 0.6)
- [x] [`scripts/lint-arc.js`](../../scripts/lint-arc.js) — flags `[VERIFY]` tags, missing fixtures (informational in Phase 0), broken `subPropertyOf` parents
- [x] [`arc/AUTHORING_DISCIPLINE.md`](../../arc/AUTHORING_DISCIPLINE.md) — per-entry sign-off ritual, state machine, peer-review checklist, bridge-axiom & disjointness completeness, module dependencies, per-phase exit checklists, failure-triage handoff
- [x] [`tests/corpus/README.md`](../../tests/corpus/README.md) — fixture-authoring conventions, naming, manifest-update-on-add discipline, cross-phase activation pattern, ELK-upgrade tracking
- [x] [`tests/corpus/manifest.json`](../../tests/corpus/manifest.json) — initial empty manifest

### 0.8 Test Corpus Manifest
- [x] [`tests/corpus/manifest.schema.json`](../../tests/corpus/manifest.schema.json) — JSON-Schema with all required columns (fixtureId, phase, specSections, acceptanceCriteria, arcEntries, regime, expectedOutcome, expectedLossSignatureReasons, intendedToCatch, expected_v0.1_verdict, expected_v0.2_elk_verdict)
- [x] [`scripts/check-corpus-manifest.ts`](../../scripts/check-corpus-manifest.ts) — CI gate enforcing orphan-file / orphan-entry / required-field / fixtureId-pattern / regime-enum / non-empty-intent rules
- [x] Wired into `npm run test:corpus-manifest` and the CI workflow

## Risk Retrospective (per plan §6.3)

### Risks materialized during Phase 0

1. **`node_modules/` not installed in dev environment.** All TypeScript compilation, test execution, and CI verification require `npm install` to land before Phase 1 work begins. Diagnostics from `@types/node` not being resolvable surface in the IDE; these clear after install. **Mitigation:** Aaron runs `npm install` followed by `npm run ci` to validate Phase 0 end-to-end before Phase 1 entry review.

2. ~~**Existing template CLI at `src/kernel/index.ts` violates the architect's adapter-vs-kernel ruling.**~~ **RESOLVED 2026-05-02 via ADR-005.** Restructured during Phase 0 cleanup: CLI moved to `src/adapters/cli.ts`; `src/kernel/index.ts` rewritten as kernel-only barrel; new `src/index.ts` is the top-level package barrel re-exporting across kernel + composition. `package.json` main/exports/start updated; CI `Verify CLI` step updated. All 47/47 tests + purity check + corpus manifest pass after the move.

3. **TSV `Module` column is an open SME deliverable.** The ARC build round-trip cannot run in strict mode until the column lands. **Mitigation:** captured as Phase 4 entry checklist item in ROADMAP §3.5; build-arc.js runs in tolerant mode for Phase 0; no behavior gates on the round-trip yet.

### Risks identified but not materialized

- Tau Prolog peer-dep verification at runtime — the probe seam (`registerTauPrologProbe`) makes this fully testable without the peer dep installed. Tests injection-mock the version string.

### Pre-existing kernel violations caught and fixed

- **`src/kernel/canonicalize.ts` used `.sort()` without a comparator.** Discovered on the first `npm run ci` run after `npm install`. Fixed by passing an explicit lexicographic comparator. Determinism behavior is unchanged (default and explicit sort produce identical orderings on string keys), but the explicit comparator removes the dependency on V8's sort-stability guarantee and aligns with the architect's purity ruling. The snapshot test continued to pass through the fix, confirming the canonicalization output is byte-stable.

### New risks observed for downstream phases

- ~~**Phase 1 entry-blocker (medium):** the CLI restructure described in risk (2) above.~~ **RESOLVED via ADR-005.**
- **Phase 4 entry-blocker (high, already known):** the TSV Module column. Tracked in ROADMAP §3.5 entry checklist.

## Verification Status

| Check | Status |
|---|---|
| TypeScript build (`npm run build`) | ✅ PASS (verified 2026-05-02 after `npm install`) |
| Spec tests (`npm test`) | ✅ PASS — 47/47 tests across 7 files (template determinism + no-network + snapshot, plus Phase 0.2-0.5 unit tests) |
| Kernel purity check (`npm run test:purity`) | ✅ PASS after fixing `canonicalize.ts` bare-sort violation |
| Corpus manifest gate (`npm run test:corpus-manifest`) | ✅ PASS (empty fixtures array; trivially valid) |
| ARC lint (`npm run lint:arc`) | NOT YET RUN — non-blocking; runs in tolerant mode in Phase 0 |
| Bundle measurement | NOT YET RUN — non-blocking; informational only through Phase 6 |
| Existing template spec tests (determinism, no-network, snapshot) | ✅ PASS — still applicable to the identity transform until Phase 1 replaces it |

Phase 0 exit gates are green. ARC lint and bundle measurement are non-blocking informational checks in Phase 0 (they activate as gates in Phases 4-7 / Phase 7 respectively).

## ADRs Logged This Phase

- ADR-002: OFBT-specific kernel purity allowlist ruling (architect-approved; recorded in `project/DECISIONS.md`)
- ADR-003: ARC TSV `Module` column as SME deliverable; engineering ships the compiler scaffolding (recorded in `project/DECISIONS.md`)
- ADR-004: Tau Prolog probe seam for testability without peer dep installed (recorded in `project/DECISIONS.md`)
- ADR-005: CLI restructure — kernel/index.ts split into kernel barrel + top-level package barrel + adapter CLI (recorded in `project/DECISIONS.md`)
- ADR-006: Tighten purity checker — close node:* hole, add process.* / console.* rules, enforce expected_v0.2_elk_verdict and worked-example coverage (recorded in `project/DECISIONS.md`; closes SME Phase 0 review B1/B2/B3/S1/S2/S3/S4 plus N1-N3 nits)

## Phase 1 Entry Recommendations

When Aaron initiates Phase 1 entry review, the following items from this Phase 0 retrospective should be addressed:

1. ~~Run `npm install` and `npm run ci`~~ — done locally; CI verified green (47/47 tests, purity check, corpus manifest gate). The architect-required commit SHA + GitHub Actions CI run ID will be inserted into the "Architect Amendment Cycle" section above after the Orchestrator's commit pass.
2. ~~Decide CLI restructure~~ — done via ADR-005 in Phase 0 itself (not deferred to Phase 1, per architect ruling); CLI lives at `src/adapters/cli.ts`; kernel index is a clean barrel; tightened purity rules (ADR-006) prevent regression.
3. **Architect gating item 3 — Module-column parallel workstream commitment.** Per plan §5.2, the ARC manifest content workstream begins in Phase 1 (not Phase 4). Aaron's commitment to enter at Phase 1 entry review:
   - Annotate `project/relations_catalogue_v3.tsv` with the `Module` column for at least the BFO 2020 core rows (the Phase 4 entry blocker), with IAO / CCO / OFI rows following on the Phase 5 / 6 / 7 entry schedules.
   - The transition affordance (`arc/module-assignments.json`) is acceptable interim during Phase 1, but the canonical column-in-TSV is the Phase 4 entry deliverable per ADR-003.
   - Engineering monitors progress via `scripts/build-arc.js` skip-warning output during Phase 1-3 development.
4. **Phase 1 corpus authoring** per ROADMAP Phase 1 Test Corpus subsection — every fixture registered in `tests/corpus/manifest.json` per the discipline established in 0.7 + 0.8. The architect specifically flagged three load-bearing correctness defenses for Phase 1 review: §3.7.1 PROV-O structural fixture, the Wrong-Translation Canary Set, and §13.1 punted-construct rejection paths.
