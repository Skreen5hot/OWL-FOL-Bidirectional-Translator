# Architecture Decision Records

<!--
  Log decisions here so they survive between AI sessions.
  An AI agent has no memory of yesterday. This file IS its memory.

  Format: Date | Decision | Context | Consequences
-->

## ADR-001: Use JSON-LD Deterministic Service Template

**Date:** 2026-04-15 (template adoption — backfilled from repo creation; predates OFBT spec freeze v0.1.7 on 2026-04-29)

**Decision:** Adopt the JSON-LD Deterministic Service Template as the base architecture.

**Context:** We need a service that produces deterministic, reproducible transformations on structured data. The template provides a pure kernel with spec tests, layered boundaries (kernel/composition/adapters), and zero runtime dependencies.

**Consequences:**
- All transformation logic lives in `src/kernel/transform.ts` as pure functions
- Kernel MUST NOT perform I/O, reference time, randomness, or environment state
- Infrastructure (HTTP, persistence, scheduling) lives in `src/adapters/`
- Spec tests (determinism, no-network, snapshot, purity) MUST pass before any merge

---

<!--
  Add new decisions below. Use the format:

  ## ADR-NNN: [Decision Title]

  **Date:** YYYY-MM-DD

  **Decision:** One sentence stating the choice.

  **Context:** Why this decision was needed. What alternatives were considered.

  **Consequences:** What follows from this decision. What is now easier or harder.
-->

---

## ADR-002: OFBT-specific kernel purity allowlist

**Date:** 2026-05-02

**Decision:** Rewrite `scripts/ensure-kernel-purity.ts` with an OFBT-specific allowlist: forbid Date/RNG/env/I-O/sort-without-comparator non-determinism patterns; allowlist `tau-prolog`, `rdf-canonize`, and `crypto.subtle.digest` (SHA-256 only) as legitimate kernel imports. Tau Prolog is treated as a kernel dependency, not an adapter.

**Context:** The template's default purity check only enforced layer boundaries (no imports leaving `src/kernel/`). The architect's ruling (recorded in conversation 2026-05-02) requires the checker to also enforce the determinism prohibitions in spec §0.1, §12.9, and Fandaws Consumer Requirement §1.3 — and ruled that Tau Prolog goes in the kernel, not an adapter, because routing it through `src/adapters/` would let kernel code escape the purity gate.

**Consequences:**
- The kernel may import `tau-prolog` and `rdf-canonize` directly; no other external imports are permitted.
- `crypto.subtle.digest` is permitted for deterministic SHA-256 content addressing; `crypto.getRandomValues` and `crypto.randomUUID` remain forbidden.
- `setTimeout(0)` cooperative scheduling (used by Tau Prolog's async chain) does not violate purity — determinism is about the content of an answer, not the timing of its return.
- Adding new external dependencies to the kernel requires an ADR.

---

## ADR-003: ARC TSV Module column as SME deliverable

**Date:** 2026-05-02

**Decision:** The `Module` column in `project/relations_catalogue_v3.tsv` (assigning each row to one of the five v0.1 ARC modules per spec §3.6.1) is an SME deliverable, not an engineering deliverable. Phase 0 ships the compiler scaffolding (`scripts/build-arc.js`, `regenerate-arc-tsv.js`, `round-trip-arc.js`) plus a transition affordance (`arc/module-assignments.json`) that lets engineering tooling run end-to-end before the SME folds the column in. The column itself blocks Phase 4 entry.

**Context:** ROADMAP §0.6 lists "TSV gains a Module column" as a Phase 0 acceptance criterion, but unilaterally assigning rows to modules is an SME judgment that engineering shouldn't make. The compiler needs to handle two states: TSV with column (canonical) and TSV without column (transition).

**Consequences:**
- `scripts/build-arc.js` reads from the TSV `Module` column when present, else falls back to `arc/module-assignments.json`. Rows with no assignment under either mechanism are skipped with a warning.
- `scripts/round-trip-arc.js` runs in non-strict mode by default; flips to strict at Phase 4 entry once the SME has folded the Module column into the canonical TSV.
- The Phase 4 entry checklist already requires `[VERIFY]` resolution on rows 49-50; adding the Module column for those rows is part of that pre-Phase-4 deliverable.

---

## ADR-004: Tau Prolog probe seam for testability without installed peer dep

**Date:** 2026-05-02

**Decision:** Tau Prolog version detection routes through an internal probe seam (`registerTauPrologProbe`) defaulting to `globalThis.pl?.version`. Tests inject a mock probe to simulate version-match / mismatch / absent scenarios without requiring the actual `tau-prolog` package to be present in this repo's `node_modules/`.

**Context:** API spec §9.2 requires `verifyTauPrologVersion()` to be sync. The spec assumes Tau Prolog has already been loaded by the consumer. In this repo's own test environment, the peer dep may not be installed; tests must still exercise both match and mismatch paths.

**Consequences:**
- `registerTauPrologProbe(probe)` lets Node ESM consumers explicitly bind their loaded Tau Prolog to OFBT instead of relying on the browser-style `globalThis.pl` registration.
- Tests have a clean injection seam (`registerTauPrologProbe(() => "0.3.4")` for match path, etc.).
- The probe is mutable module state — the only such state in OFBT — but it is intentional: it's a registry for the consumer-controlled peer dep, not OFBT-internal state.

---

## ADR-005: CLI restructure — kernel/index.ts split into kernel barrel + top-level package barrel + adapter CLI

**Date:** 2026-05-02

**Decision:** The template-inherited CLI at `src/kernel/index.ts` is split into three files matching the OFBT layer ruling:
- `src/adapters/cli.ts` — the CLI itself (file I/O, process.argv, stdout/stderr)
- `src/kernel/index.ts` — kernel-only public barrel (errors, reason codes, version, transform/canonicalize)
- `src/index.ts` — top-level package barrel re-exporting kernel + composition

`package.json` `main`, `types`, and `exports["."]` repoint at `dist/index.js`. The `start` and new `cli` scripts invoke `dist/adapters/cli.js`. The CI `Verify CLI` step likewise updates.

**Context:** Phase 0 exit retrospective flagged this as risk (2): the existing CLI lived in `src/kernel/` but performed I/O, violating the architect's adapter-vs-kernel ruling (ADR-002). The OFBT purity checker only catches specific forbidden APIs (Date.now, Math.random, fetch, etc.), not the broader "kernel performs no I/O" principle in spec §0.2 — so a regex check wouldn't have flagged it, but the layering principle still applied.

Phase 1 will replace the underlying call (currently the template `transform` identity function) with `owlToFol`. Doing the restructure in a Phase 0 cleanup PR keeps Phase 1 focused on lifter implementation rather than scaffolding.

**Consequences:**
- Consumers `import { ... } from "@ontology-of-freedom/ofbt"` reach the top-level barrel which re-exports across kernel + composition.
- Submodule paths (`/errors`, `/reason-codes`, `/version`, `/session`, `/kernel`) remain available for tree-shaking via the package.json `exports` map.
- Kernel barrel does NOT re-export from composition (would violate purity check). The composition surface is reachable via `/session` submodule path or via the top-level barrel.
- CI `Verify CLI` step now invokes `dist/adapters/cli.js`.
- esbuild bundles target `src/index.ts` (the full public API), not the kernel-only barrel.
- 47/47 tests + purity check + corpus manifest all green after restructure.

---

## ADR-006: Tighten purity checker — close node:* hole, add process.* / console.* rules, enforce expected_v0.2_elk_verdict and worked-example coverage

**Date:** 2026-05-02

**Decision:** Tighten `scripts/ensure-kernel-purity.ts` and the corpus manifest gate in response to SME Phase 0 review:

- (B1) Forbid all `node:*` builtins in the kernel except `node:crypto` (and only for `subtle.digest`). Previously the rule allowed any `node:` import.
- (B2-companion) Add explicit kernel rules forbidding `process.argv`, `process.stdout`, `process.stderr`, `process.exit`, `process.cwd`, `process.pid`, and `console.*`. Catches the CLI-pattern class of violation that risk (2) flagged.
- (B1-companion) Add `no-crypto-without-subtle-digest` rule: any `crypto.X` access where `X` is not on the `subtle` chain is forbidden in kernel.
- (S1) Make `expected_v0.2_elk_verdict` REQUIRED in `tests/corpus/manifest.schema.json` and `scripts/check-corpus-manifest.ts`. `null` permitted; absent forbidden — collapsing the ELK regression-suite signal is a load-bearing failure.
- (S2) Promote `lint-arc.js` worked-example coverage check from informational to enforced under `--require-fixtures-for-verified` (folded into `--strict`). Phase 4-7 ARC Authoring Exit Criteria now invoke `--strict`.
- (S3) Add `scripts/build-arc.js --strict` "0 skipped rows" gate to Phase 4, 5, 6, 7 ARC Authoring Exit Criteria — prevents silent row-drop when a TSV row has no Module assignment.
- (S4) Reconcile Node-version claim: ROADMAP now says Node v22+ to match `package.json` `engines.node`.

**Context:** SME Phase 0 review (2026-05-02) caught three blockers and four structural items not in the exit summary. The B1 hole specifically would have allowed a future contributor to import `node:fs` directly into kernel code with no warning — exactly the failure mode the architect's ADR-002 ruling was designed to prevent.

**Consequences:**
- The kernel can no longer import `node:fs`, `node:path`, `node:http`, `node:child_process`, etc. Only `node:crypto` (and only for `subtle.digest`) and the two allowlisted external packages (`tau-prolog`, `rdf-canonize`) are permitted.
- CLI pattern (`process.argv` / `process.stdout` / `process.exit` / `readFile`) cannot regress into the kernel without failing CI.
- Corpus manifest entries MUST explicitly set `expected_v0.2_elk_verdict` to either an outcome or `null` — silent omission is no longer accepted.
- Phase 4-7 ARC content authoring is on a stricter gate: every Verified entry needs a fixture; every TSV row needs a Module assignment.
- 47/47 tests + tightened purity check + tightened corpus manifest gate all green after the rule-tightening — confirming the prior CLI restructure (ADR-005) cleaned the kernel sufficiently for the new rules.
