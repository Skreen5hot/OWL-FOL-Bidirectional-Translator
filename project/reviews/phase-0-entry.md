# Phase 0 Entry Review

**Date:** 2026-05-02
**Phase:** 0 — Foundations
**Plan reference:** `OFBT_implementation_plan_v1 (1).md` §3.1

## Entry Criteria — Confirmation

| Criterion | Status | Evidence |
|---|---|---|
| Spec v0.1.7 frozen and published | ✅ | [`project/OFBT_spec_v0.1.7.md`](../OFBT_spec_v0.1.7.md), [`project/OFBT_API_v0.1.7.md`](../OFBT_API_v0.1.7.md) present and immutable per spec §0.2 |
| Implementation team assembled | ✅ | Aaron (Orchestrator + SME), Developer persona ([`config/developer.yaml`](../../config/developer.yaml)) |
| Package name reserved on npm (`@ontology-of-freedom/ofbt`) | ⚠️ Pending external action | Reservation step is outside Phase 0 implementation scope; flagged for Aaron. Local `package.json` will declare the name regardless. |
| Tau Prolog v0.3.4 confirmed available as peer dependency | ✅ | Available on npm registry per spec §11; will be declared as peer dep in Phase 0.1. |

## Roadmap Cross-Reference

This phase delivers `ROADMAP.md` sections **0.1 through 0.8** plus the Phase 0 Exit Review. Sub-section 0.1 is an extension of plan §3.1 ("build tooling: esbuild configuration, CI pipeline skeleton") with the OFBT-specific purity-checker allowlist baked in per the architect's ruling. Sub-sections 0.6-0.8 are roadmap additions closing architect/SME gaps not present in plan v1.0; they are roadmap-level commitments per plan §8 (revisable).

## Scope Boundaries

**In scope this phase:**
- Package skeleton, peer-dep declaration, runtime dep declaration
- All 12 typed error classes
- Frozen 16-member REASON_CODES enum
- `getVersionInfo`, `verifyTauPrologVersion`
- `createSession` / `disposeSession` skeletons (allocation/release; no conversion logic)
- Build tooling, bundle measurement (no enforcement until Phase 7)
- OFBT-specific purity checker
- ARC TSV→JSON-LD compiler scaffolding (the actual ARC content authoring is parallel SME workstream that completes against Phase 4-7 entry gates, not Phase 0)
- SME tooling and authoring discipline docs
- Test corpus manifest schema and CI gate

**NOT in scope this phase (deferred per plan §3.1):**
- The lifter (Phase 1)
- The projector (Phase 2)
- The validator, evaluation, consistency check (Phase 3)
- ARC manifest *content* (Phases 4-7; only the *infrastructure* lands in Phase 0)
- Bundle budget enforcement (Phase 7)
- Validation rings — N/A for Phase 0 (no conversion or evaluation logic to validate)

## Risk Notes Carried Into Phase 0

- The template's existing identity `transform()` in [`src/kernel/transform.ts`](../../src/kernel/transform.ts) and the spec tests exercising it ([`tests/determinism.test.ts`](../../tests/determinism.test.ts), [`tests/no-network.test.ts`](../../tests/no-network.test.ts), [`tests/snapshot.test.ts`](../../tests/snapshot.test.ts)) MUST be preserved through Phase 0 per CLAUDE.md §4 ("MUST NOT modify spec tests"). They are replaced wholesale by `owlToFol` in Phase 1; until then, they validate the build/CI scaffolding stays green.
- Tau Prolog peer-dep verification at runtime cannot be exercised in unit tests without the peer dep installed; the test suite exercises the version-mismatch error path via dependency injection rather than relying on the actual peer-dep version.

## Entry Summary Sign-Off

Entry criteria are met (modulo the npm reservation flagged above, which does not block local implementation). Phase 0 begins.
