# OFBT Demo Site

Per-phase demos hosted on GitHub Pages. Each phase ships a focused, disposable demo file (`demo_p1.html`, `demo_p2.html`, ...) that argues one specific case the corresponding phase's implementation supports. The landing page (`index.html`) lists shipped and upcoming phase demos.

## Structure

```
demo/
  index.html           Landing page — lists all phase demos.
  demo_p1.html         Phase 1 — lifter (PROV-O domain/range conditional translation).
  demo_p2.html         Phase 2 — projector + structural round-trip parity (spec §8.1). (Lands at Phase 2 exit.)
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

1. Create `demo/demo_pN.html` per the **two-case demo template** (see below; banked at Phase 1 exit doc pass per the architect's standing demo-workstream ruling).
2. Update `demo/index.html` — flip the upcoming-phase list item to `class="shipped"` and add the link.
3. Update `.github/workflows/pages.yml` — extend the staging step to copy any new fixture files the Phase N demo imports + any newly-vendored canonical sources under `arc/upstream-canonical/`. **If the Phase N demo exercises the composition layer (`createSession`, `loadOntology`, `evaluate`, `checkConsistency`):** the bundle transitively imports `tau-prolog` as a bare specifier; browser ESM cannot resolve bare specifiers, so (a) add an `<script type="importmap">` block to the demo HTML mapping `tau-prolog` → `./tau-prolog/core.js` and `tau-prolog/modules/lists.js` → `./tau-prolog/lists.js`, AND (b) extend the staging block to `cp node_modules/tau-prolog/modules/core.js node_modules/tau-prolog/modules/lists.js gh-pages-deploy/tau-prolog/`. Banked at Phase 3 Step 9.4-amendment 2026-05-09; first instance is `demo_p3.html` (Phase 3 is the first per-phase demo whose bundle pulls tau-prolog into the browser ESM context). Phase 4+ composition-layer-using demos inherit this pattern.
4. Push. CI deploys.

### Two-case demo template

[Banked at Phase 1 exit doc pass; first instance is `demo_p1.html`'s PROV-O canary + BFO/CLIF Layer A parity structure.]

Every per-phase demo argues **two correctness cases** — one defense-in-depth and one external-ground-truth — with a clear delineation between them. Stakeholders see both arguments and recognize that OFBT's correctness is measured by complementary disciplines, not by a single internal claim.

**Case A — Defense-in-depth canary discipline.** The phase's lifter / projector / validator implementation correctly produces the right shape for some specific construct AND the test suite asserts the wrong shape's absence. The "wrong shape's absence" assertion is what catches the silent-failure-with-degraded-output failure mode.

**Case B — External CLIF/canonical ground truth.** The phase's lifted/projected/validated FOL is parity-checked against a canonical published source (Layer A for OWL-construct semantics; Layer B for ontology content). External ground truth catches divergence that internal canary discipline alone could miss (the "tests retrofitted to implementation" failure mode).

Per-phase concrete shapes:

| Phase | Case A (canary) | Case B (CLIF parity) |
|---|---|---|
| Phase 1 (shipped) | PROV-O domain/range conditional translation; the wrong existential-synthesis form's absence | BFO 2020 OWL subset → Layer A (W3C OWL CLIF axiomatization); cumulative parity flag |
| Phase 2 | Structural round-trip parity canary (NAF residues against open predicates; lossy fixtures with documented Loss Signatures) | Layer A structural round-trip parity (lift → project → re-lift produces FOL structurally equivalent to the canonical CLIF, modulo OFBT's encoding choices per spec §8.1 + ADR-007 §10) |
| Phase 3 | No-Collapse Guarantee canary (deliberate-inconsistency fixtures fire `consistent: false`; deliberate-Horn-incompleteness fixtures fire `coherence_indeterminate` not silently `consistent: true`) | Layer A consistency-check parity (the validator's verdicts match what classical FOL semantics would conclude on the canonical CLIF axiomatization) |
| Phase 4 | BFO Disjointness Map canary (Continuant ⊓ Occurrent fires `consistent: false` with witnesses) | Layer A + **Layer B introduction** — `bfo-2020.clif` vendored, BFO-specific content (ternary parthood, bridge axioms) parity-checked against it |
| Phase 5 | IAO information-bridge canary | Layer B for IAO (`iao.clif` vendored if available; otherwise scope-document) |
| Phase 6 | CCO realizable-holding + mereotopology canaries | Layer B for CCO 2.0 (CCO's authoritative source is OWL not CLIF; this is a scope-document case) |
| Phase 7 | OFI deontic canary (RDM v1.2.1 chain decomposition; `discharges`/`violates` disjointness firing `consistent: false`) | Layer B for OFI (constitution.ttl Article I §2 pipeline; spec §14 Q5) |

Each demo's HTML structure mirrors `demo_p1.html`:

- Header + intro + "two correctness arguments" framing callout.
- Section "Case A — &lt;canary discipline&gt;" with input panel + run button + output panel + right-shape-present + wrong-shape-absent.
- Section "Case B — &lt;CLIF parity discipline&gt;" with input panel + run button + output panel + Layer A/B parity panel (renders the fixture's `clifGroundTruth` array, grouping consecutive entries that cite the same canonical block).
- Section "What Phase N does NOT yet do" — honest scope statement; names the next phase that closes each scope gap.
- Section "Provenance" — links to fixtures, vendored sources, implementation files, ADR references.

The shared `demo.css` provides classes (`.section`, `.callout`, `.panel`, `.assertion-row`, `.badge`, `.lead`, `.lead.spaced`, `.back-link`, `.section h3`, etc.); `.callout ul/ol` for callout lists. Inline styles are forbidden — IDE-lint enforces this.

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
