// ESM bridge shim for the `tau-prolog/modules/lists.js` UMD module.
//
// Phase 3 Step 9.4-amendment-2 per Aaron's routing dispatch 2026-05-09
// (sibling to 9.4-amendment per SME pre-anticipation note in 06ce193).
//
// ── Why this shim exists ──────────────────────────────────────────────
//
// Tau Prolog's `modules/lists.js` is also UMD: in the CJS branch it
// exports a function `function(p) { pl = p; new pl.type.Module("lists",
// ...); }`; in the browser-direct-load branch (no `module` defined) it
// IMMEDIATELY calls `new pl.type.Module("lists", predicates(), exports,
// options())` against the closure-bound `pl` (which is `window.pl` at
// that point because core.js sync-loaded first).
//
// The OFBT bundle's `src/composition/load-ontology.ts:46-47` does
//
//     import listsModule from "tau-prolog/modules/lists.js";
//     listsModule(pl);
//
// expecting a function-shaped default export to call with `pl`. The
// UMD `lists.js` has no ESM default export — same SyntaxError surface
// as the parent `tau-prolog` import.
//
// ── How this shim resolves it ─────────────────────────────────────────
//
// The deploy artifact loads `lists.js` as a SYNC `<script>` in `<head>`
// AFTER `core.js` and BEFORE the module-script context evaluates. The
// UMD browser-direct-load branch runs, registering the lists module on
// `globalThis.pl` at script-load time.
//
// This shim's default export is then a no-op function: when the bundle
// calls `listsModule(pl)`, the call returns inertly because the
// registration already happened during the sync-script load. The shim
// preserves the bundle's call shape without re-invoking the
// `new pl.type.Module(...)` constructor (which would clobber the
// already-registered module).
//
// ── Sequencing (mirrors esm-shim.js) ──────────────────────────────────
//
//   1. Sync `<script src="./tau-prolog/core.js">`  — sets globalThis.pl
//   2. Sync `<script src="./tau-prolog/lists.js">` — registers lists module
//      on globalThis.pl via the UMD browser-direct-load branch
//   3. Module `<script type="module">` evaluates — bundle imports
//      `tau-prolog/modules/lists.js`, the import-map routes to this
//      shim, the bundle calls `listsModule(pl)` which is this no-op
//
// ── Phase 4+ inheritance ──────────────────────────────────────────────
//
// Inherited by Phase 4+ composition-layer-using demos per the same
// banking as the parent `esm-shim.js`. `demo/README.md` "Adding a new
// phase demo" step 3 names both shims as the canonical pattern.
//
// ── Cross-references ──────────────────────────────────────────────────
//
//   - `src/composition/load-ontology.ts:46-47` (the lists import + call)
//   - `demo/tau-prolog-shims/esm-shim.js` (sibling parent-package shim)
//   - `node_modules/tau-prolog/modules/lists.js` (UMD source — IIFE
//     `(function(pl) { ... })(pl)` self-registers when `pl` is global)

export default function listsModuleNoOp(/* pl */) {
  // Lists module already registered on globalThis.pl via the sync
  // `<script src="./tau-prolog/lists.js">` load BEFORE this ESM shim
  // resolves. Re-running `new pl.type.Module("lists", ...)` here would
  // clobber the existing registration; preserving the bundle's call
  // shape with a no-op is the safe shape per the bridge-shim discipline.
}
