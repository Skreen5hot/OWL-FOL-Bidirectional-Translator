# OFBT Demo Site

Per-phase demos hosted on GitHub Pages. Each phase ships a focused, disposable demo file (`demo_p1.html`, `demo_p2.html`, ...) that argues one specific case the corresponding phase's implementation supports. The landing page (`index.html`) lists shipped and upcoming phase demos.

## Structure

```
demo/
  index.html           Landing page — lists all phase demos.
  demo_p1.html         Phase 1 — lifter (PROV-O domain/range conditional translation).
  demo_p2.html         Phase 2 — projector + round-trip parity. (Lands at Phase 2 exit.)
  ...
  demo.css             Shared stylesheet across all phase demos.
  README.md            This file.
```

At deploy time, the GitHub Actions workflow stages the following artifact directory and uploads it to GitHub Pages:

```
gh-pages-deploy/
  index.html
  demo_pN.html         (one per shipped phase)
  demo.css
  bundles/
    ofbt-core.browser.min.js   (esbuild output)
  fixtures/
    p1_prov_domain_range.fixture.js
    canary_domain_range_existential.fixture.js
    (additional fixtures as later phases ship)
```

## SME-role discipline

The demo site is **corpus-driven**: every demo input is an actual fixture from `tests/corpus/`. The demo runs the same `owlToFol` (and, in later phases, the same projector / validator) the test suite runs, against the same input, and shows the same output. There is no demo-only ontology and no parallel demo code path.

If a demo run produces output that contradicts the corresponding fixture's `expectedFOL`, the test suite would catch the same regression on the next CI run. The two sources of truth (test runner assertions + demo visual output) cannot drift in opposite directions; they would fail together.

The demo does **not** promote any fixture from Draft to Verified. Promotion is a Phase exit deliverable. The demo runs Draft fixtures at their Draft status; the demo's "right-shape present / wrong-shape absent" verdicts are visual confirmations of the test runner's assertions, not separate verification.

## Per-phase disposability

Each `demo_pN.html` is **disposable** per the architect's per-phase demo-file convention. The Phase N demo captures what the implementation supports at the time of Phase N's exit. It is not maintained against later-phase changes; if Phase N+1 changes API surface that the Phase N demo depends on, the Phase N demo may become non-functional. That is the intended behavior — earlier demos remain accessible as historical artifacts of the build sequence, not as continuously-maintained references.

The shared `demo.css` and the deploy workflow ARE maintained across phases; only the per-phase HTML files are disposable.

## Adding a new phase demo

When a phase exits and is ready for stakeholder demo:

1. Create `demo/demo_pN.html` per the existing demo's structure (header, sections, status badge, run button, output panel, provenance).
2. Update `demo/index.html` — flip the upcoming-phase list item to `class="shipped"` and add the link.
3. Update `.github/workflows/pages.yml` — extend the staging step to copy any new fixture files the Phase N demo imports.
4. Push. CI deploys.

## Local preview

The demo files are static HTML/CSS/JS. After running the project's build pipeline (`npm run build && node esbuild.config.js`), serve the staged deploy directory with any static-file server, for example:

```bash
mkdir -p gh-pages-deploy/bundles gh-pages-deploy/fixtures
cp demo/*.html demo/*.css gh-pages-deploy/
cp dist/bundles/ofbt-core.browser.min.js gh-pages-deploy/bundles/
cp tests/corpus/p1_prov_domain_range.fixture.js \
   tests/corpus/canary_domain_range_existential.fixture.js \
   gh-pages-deploy/fixtures/
npx serve gh-pages-deploy
```

Then open `http://localhost:3000/` in a browser. The same paths that work locally work on GitHub Pages.

## GitHub Pages settings

The repo's GitHub Pages source must be set to **GitHub Actions** (not a branch). Repository → Settings → Pages → Source → "GitHub Actions". The deploy workflow handles the rest.
