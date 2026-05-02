# Test Corpus

Phase 0.7 deliverable per ROADMAP. This directory holds every fixture exercising spec acceptance criteria and ARC entries. Fixtures author-themselves once Phase 1 begins; Phase 0 ships the discipline.

## Fixture-Authoring Conventions

### File-naming

`<phase>_<theme>_<intent>.fixture.js`

Examples (from ROADMAP):

- `canary_domain_range_existential.fixture.js` (Phase 1 wrong-translation canary)
- `nc_self_complement.fixture.js` (Phase 3 No-Collapse adversarial corpus)
- `strategy_routing_direct.fixture.js` (Phase 2 strategy-routing fixture)
- `parity_canary_query_preservation.fixture.js` (Phase 2 parity canary)
- `hypothetical_inconsistency.fixture.js` (Phase 3 hypothetical-axiom set)

The `<phase>_` prefix groups fixtures by the phase that authors them (Phase 1 lifter fixtures, Phase 2 projector fixtures, Phase 3 validator fixtures, etc.). Cross-phase fixtures (e.g., adversarial fixtures gated on a later phase's ARC content) use the prefix matching the phase they were *introduced* in, not the phase they activate in.

### Plain-objects + JSDoc DSL discipline

No test-framework lock-in. Each `.fixture.js` exports plain objects with JSDoc-typed shapes, consumed by the spec-test runner (`tests/run-tests.js`). This keeps fixtures portable across test infrastructure changes and machine-readable for the manifest gate (`scripts/check-corpus-manifest.js`).

Example fixture skeleton:

```javascript
/**
 * @typedef {import('../src/kernel/types.js').OWLOntology} OWLOntology
 * @typedef {import('../src/kernel/types.js').FOLAxiom} FOLAxiom
 */

/** @type {{ input: OWLOntology, expectedFOL: FOLAxiom[] }} */
export const fixture = {
  input: { /* OWL TBox / ABox / RBox */ },
  expectedFOL: [ /* expected lifted axioms */ ],
};

export const meta = {
  // mirrors corresponding manifest.json entry; manifest is the source of truth
  fixtureId: "canary_domain_range_existential",
  intent: "PROV-O domain/range; asserts no existential restriction synthesis on X",
};
```

### Manifest-update-on-add discipline

**Every fixture MUST have a corresponding entry in `tests/corpus/manifest.json`.**

The manifest carries the load-bearing traceability: spec sections, acceptance criteria, ARC entries, expected outcomes, expected Loss Signature reasons, intended-to-catch description, and the ELK-upgrade columns.

Adding a fixture without updating the manifest is a CI failure (`scripts/check-corpus-manifest.js`). The DoD for any fixture-authoring PR is:

1. Fixture file added under `tests/corpus/`
2. Manifest entry added with all required columns populated
3. `scripts/check-corpus-manifest.js` passes
4. The relevant phase's exit-criteria checklist in ROADMAP shows the fixture covered

Removing a fixture symmetrically requires removing its manifest entry; orphan entries also fail CI.

## Manifest Schema

The schema is documented in `tests/corpus/manifest.schema.json`. Per-fixture columns:

| Column | Type | Purpose |
|---|---|---|
| `fixtureId` | string | matches filename minus `.fixture.js` |
| `phase` | integer 1-7 | phase that authors this fixture |
| `specSections` | array of strings | spec / API spec section refs (e.g., `["§3.7.1", "API §6.1"]`) |
| `acceptanceCriteria` | array of strings | criterion IDs from spec §12 / API §14 (e.g., `["§12.13", "API-2"]`) |
| `arcEntries` | array of IRIs | ARC entry IRIs the fixture exercises (empty for built-in OWL fixtures) |
| `regime` | enum | `equivalent` / `reversible` / `true_loss` |
| `expectedOutcome` | object | structured per fixture type |
| `expectedLossSignatureReasons` | array of reason-enum members | empty for clean round-trip |
| `intendedToCatch` | string | what wrong translation or silent failure this fixture exposes |
| `expected_v0.1_verdict` | object | the verdict v0.1 produces today |
| `expected_v0.2_elk_verdict` | object \| null | verdict v0.2 should produce after ELK lands; `null` if no expected change |

## Cross-Phase Activation Pattern

Some fixtures introduced in earlier phases are inert until a later phase's ARC content lands (e.g., `nc_bfo_continuant_occurrent.fixture.js` is authored in Phase 3 but only exercises BFO disjointness once Phase 4 BFO ARC is loaded).

Convention: such fixtures land in their authoring phase's corpus subdirectory but their manifest entry sets `phase` to the **activating** phase. The fixture file itself ships a guard:

```javascript
// ILLUSTRATIVE — `src/composition/arc-loader.js` and `hasARCModule` are
// Phase 4 deliverables and do not yet exist. The exact import path and
// guard helper name will be set by the Phase 4 ARC-loader implementation.
import { hasARCModule } from "../../src/composition/arc-loader.js";
export const skipUnless = (session) => hasARCModule(session, "core/bfo-2020");
```

When the activating phase's ARC content is not loaded, the test runner records the fixture as `skipped` rather than `failed`. The Phase 7 coverage matrix CI verifies that no fixture is permanently skipped.

## ELK-Upgrade Tracking

The `expected_v0.2_elk_verdict` column is the regression-suite signal for ELK integration:

- Fixtures whose v0.1 verdict is `'undetermined'` and whose v0.2 verdict is **definite** (`true` or `false`) MUST flip to that definite verdict once ELK lands. If they don't, ELK isn't doing what it should.
- Fixtures whose v0.1 verdict is definite and whose v0.2 verdict is **identical** MUST NOT change. If they do, ELK has introduced a regression in the Horn-decidable subset.
- Fixtures with `expected_v0.2_elk_verdict: null` are explicitly outside ELK's scope.

This column has no behavioral effect in v0.1; it is captured at fixture-authoring time so the v0.2 ELK migration has a built-in regression suite.
