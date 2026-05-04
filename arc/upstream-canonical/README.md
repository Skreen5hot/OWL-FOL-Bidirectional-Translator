# Upstream Canonical Sources

Verbatim copies of upstream canonical specifications used as ground truth for OFBT's lifter / projector / validator correctness verification. Sibling directory to [`arc/vocabulary-cache/`](../vocabulary-cache/README.md) — the cache holds OFBT-derived JSON forms of canonical IRIs; this directory holds the canonical sources themselves, byte-for-byte from upstream.

## Why vendor instead of fetch-on-demand

- **Edge-canonical principle.** OFBT runs offline-first per spec §11. Vendoring keeps the canonical-source-comparison discipline available without a network dependency at validation time.
- **Reproducibility.** A given OFBT commit pins to a specific upstream snapshot. Upstream releases that drift in semantics post-snapshot are visible in the next vendor refresh's diff, not silently absorbed.
- **Audit trail.** Every CLIF/KIF citation in `tests/corpus/*.fixture.js`'s `clifGroundTruth` array references a specific line in a vendored file. Reviewers verify against the in-repo file rather than chasing upstream URLs that may have moved.
- **Same discipline as `package-lock.json`.** Pinning the upstream snapshot is the canonical-source equivalent of pinning npm dependency versions.

## Files in this directory

Each vendored file `X` ships with a sidecar `X.SOURCE` capturing provenance metadata (URL, commit/version, retrieval date, SHA-256, license, attribution). Without the sidecar, "vendored from upstream" becomes "this file came from somewhere, sometime."

Current contents:

| File | Purpose | First consumer |
|---|---|---|
| `owl-axiomatization.clif` | CLIF axiomatization of OWL 2 primitives (defines what `SubClassOf`, `Transitive`, `InverseObjectProperties`, `DisjointClasses`, `ObjectPropertyDomain`, etc. mean in CLIF). Authored by Fabian Neuhaus, version 0.1. | Phase 1 fixture `tests/corpus/p1_bfo_clif_classical.fixture.js` — `clifGroundTruth` entries cite specific axiom blocks in this file as the canonical CLIF semantics OFBT's lifter must implement. |
| `owl-axiomatization.clif.SOURCE` | Provenance sidecar for the above. | (Metadata) |

Future expansions (anticipated, not yet vendored):

| File | Purpose | First consumer |
|---|---|---|
| `bfo-2020.clif` | BFO 2020's CLIF release — the canonical FOL definition of BFO's class hierarchy, disjointness map, ternary parthood, etc. | Phase 4 ARC content authoring + Phase 4 fixtures verifying BFO ARC entries faithfully transcribe upstream. |
| `iao.owl` / `iao.clif` | IAO release. | Phase 5 ARC content authoring. |
| `ro.owl` | OBO Foundry RO release. | Phase 4-7 cross-cutting. |
| `cco-2.0.owl` | Common Core Ontologies 2.0 release. | Phase 6 ARC content authoring. |

## Two layers of CLIF parity (architectural framing)

The vendored CLIF files split into two conceptually-distinct layers:

### Layer A — OWL semantics in CLIF

Files like `owl-axiomatization.clif` define what OWL constructs MEAN in canonical FOL. They tell us, for example, that `SubClassOf(X, Y)` is canonically `(forall (z) (if (X z) (Y z)))` (modulo Class typing predicates). This layer is what OFBT's **lifter** implements — for each OWL construct it processes, the lifter's output FOL must be semantically equivalent to the canonical CLIF axiomatization of that construct.

**Phase 1 ground truth lives here.** The Phase 1 lifter handles standard OWL constructs only; correctness is measured against the OWL CLIF axiomatization. The `owl-axiomatization.clif` file is the Phase 1 ground-truth source.

### Layer B — Domain-ontology content in CLIF

Files like (the future) `bfo-2020.clif` declare specific BFO content: which classes exist, their hierarchy, their disjointness commitments, ternary parthood relations, bridge axioms, etc. Layer B is what OFBT's **ARC manifest content** transcribes — for each ARC entry, the entry's `formalDefinition` field must faithfully transcribe the corresponding axiom from the canonical CLIF.

**Phase 4-7 ground truth lives here.** Phase 4 BFO ARC content is verified against `bfo-2020.clif`; Phase 5 IAO ARC content against `iao.clif`; etc.

The two layers are **complementary, not duplicative.** Phase 1's `p1_bfo_clif_classical` fixture exercises Layer A (verifying the lifter's OWL-construct handling) using BFO IRIs as input. Phase 4's BFO ARC fixtures will exercise Layer B (verifying the ARC content transcription) using the same lifter.

## Vendoring discipline

When adding a new vendored file:

1. **Pin to a specific upstream commit/version.** Branch-pinned references drift; commit-pinned references don't.
2. **Verify the file parses** as its declared format before committing (CLIF parses as CLIF, OWL parses as OWL, etc.).
3. **Author the `.SOURCE` sidecar** in the same commit as the vendored file. Required fields per the sidecar template:
   - `upstream-url`: commit-pinned URL where the file was retrieved
   - `upstream-version`: commit SHA, release tag, or named version
   - `retrieved-at`: ISO-8601 timestamp
   - `sha256`: SHA-256 of the vendored file (verify with `sha256sum <file>`)
   - `license`: license identifier from the upstream's LICENSE file
   - `attribution`: required-by-license attribution text
   - `notes`: any caveats (e.g., "minor whitespace normalization to enforce LF line endings", "appended trailing newline for POSIX compliance")
4. **Commit prefix:** `chore: vendor <upstream-name> <version> for <consumer>` (e.g., `chore: vendor owl-axiomatization.clif v0.1 for Phase 1 BFO/CLIF parity fixture`).
5. **Refresh discipline:** when upstream advances, re-vendor by replacing the file AND updating the sidecar's `upstream-version`, `retrieved-at`, and `sha256` fields. The diff on the file content is the visible change; reviewers can decide whether the upstream-semantic shift is benign (typo fix, comment-only) or load-bearing (axiom changed, predicate renamed).

## License compliance

Each vendored file carries its own license per its upstream source. The `.SOURCE` sidecar's `license` and `attribution` fields capture what the upstream requires. The repo's top-level [LICENSE](../../LICENSE) covers OFBT-authored content; vendored content is governed by its respective upstream license.

If an upstream license is incompatible with OFBT's distribution model (e.g., GPL when OFBT ships under MIT), the vendored file MUST NOT be committed; the SME validates against an out-of-repo local copy instead and the [VERIFY] discipline accepts that the citation is unverifiable in the repo's own CI.
