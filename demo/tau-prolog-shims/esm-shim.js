// ESM bridge shim for the `tau-prolog` UMD peer dependency.
//
// Phase 3 Step 9.4-amendment-2 per Aaron's routing dispatch 2026-05-09
// (sibling to 9.4-amendment per SME pre-anticipation note in 06ce193).
//
// ── Why this shim exists ──────────────────────────────────────────────
//
// Tau Prolog (`tau-prolog@0.3.4`) ships as a UMD package: its `core.js`
// uses the classic `if(typeof module !== 'undefined') { module.exports = pl; }
// else { window.pl = pl; }` dual-target pattern with NO ESM `export
// default`. The OFBT bundle's composition-layer entry
// (`src/composition/load-ontology.ts:45`) does
//
//     import pl from "tau-prolog";
//
// which is a default-import; in a browser ESM context loading
// `core.js` directly fails with
//
//     SyntaxError: The requested module 'tau-prolog' does not provide
//     an export named 'default'
//
// The Phase 3 Step 9.4-amendment's import-map alone wasn't sufficient:
// it pointed `tau-prolog` → `./tau-prolog/core.js`, but core.js still
// has no ESM default export, so the SyntaxError persists.
//
// ── How this shim resolves it ─────────────────────────────────────────
//
// The deploy artifact loads `core.js` as a SYNC `<script>` in `<head>`
// BEFORE the module-script context evaluates. The UMD branch with no
// `module` defined runs, setting `window.pl = pl`. This shim is then
// loaded as the `tau-prolog` ESM specifier (per the import map) and
// re-exports `globalThis.pl` as its default export — bridging the
// UMD-initialized object into the bundle's ESM expectation.
//
// The sequencing is load-bearing:
//   1. Sync `<script src="./tau-prolog/core.js">`  — sets globalThis.pl
//   2. Sync `<script src="./tau-prolog/lists.js">` — registers lists module
//   3. Module `<script type="module">` evaluates — bundle imports
//      `tau-prolog`, the import-map routes to this shim, this shim's
//      `globalThis.pl` is the UMD-initialized object
//
// ── Phase 4+ inheritance ──────────────────────────────────────────────
//
// Phase 4+ per-phase demos that exercise the composition layer
// (`createSession`, `loadOntology`, `evaluate`, `checkConsistency`)
// inherit this bridge-shim discipline. Banked at `demo/README.md`
// "Adding a new phase demo" step 3 per Phase 3 Step 9.4-amendment-2.
//
// ── Cross-references ──────────────────────────────────────────────────
//
//   - `src/composition/load-ontology.ts:45-47` (the tau-prolog imports)
//   - `demo/demo_p3.html` `<head>` block (sync-script + import-map order)
//   - `.github/workflows/pages.yml` staging block (cp commands)
//   - `demo/README.md` "Adding a new phase demo" step 3 (canonical pattern)
//   - `p3-walkthrough.md` §0 pre-flight checklist (deploy-readiness gate)

export default globalThis.pl;
