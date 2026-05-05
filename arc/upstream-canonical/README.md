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

## Version evolution — what happens when an upstream releases a new version

Authored at Phase 2 entry housekeeping (post-Phase-1 stakeholder feedback flagged this as a production-deployment-planning concern).

Upstream canonical sources evolve. BFO 2020 will be followed by BFO 2.5 / 3.0; IAO has periodic releases; CCO 2.0 will eventually be CCO 3.0; W3C OWL has had revisions. OFBT's vendoring discipline must answer the question: when an upstream releases a new version, what happens?

### Refresh model

**Manual, on-demand.** Upstream version refreshes are NOT automatic. There is no scheduled job that pulls the latest upstream and rewrites the vendored file. Refresh is a deliberate developer action, triggered by:

- A downstream consumer requiring newer upstream content (e.g., Fandaws migrates to BFO 3.0).
- A specific upstream fix that affects OFBT's correctness (e.g., a CLIF axiom corrected in a point release).
- Periodic SME-led discipline review (e.g., during a phase-entry retrospective).

The justification for manual-refresh: automatic refresh would re-introduce the failure mode this discipline exists to prevent. If a future upstream release introduces a semantic change OFBT didn't audit, automatic refresh would silently propagate the change to OFBT's lifted FOL. Manual refresh forces an explicit SME-persona content-check before the change lands.

### Refresh procedure

When refreshing a vendored file:

1. **SME obtains the new upstream version** (download from the upstream-pinned URL at a specific commit/tag).
2. **SME computes the SHA-256 of the new file** and compares against the `.SOURCE` sidecar's pinned SHA. If they match, no refresh needed (the file hasn't changed at the cited commit). If they differ, proceed.
3. **SME diffs the new content against the current vendored content.** The diff surfaces upstream changes; SME audits each change for semantic impact.
4. **For each change with semantic impact**, SME identifies which OFBT artifacts depend on the affected content (fixtures with `clifGroundTruth` citations against the file; ARC manifest entries that transcribe the file; documentation that quotes the file). Each dependent artifact is updated.
5. **SME refreshes the `.SOURCE` sidecar** with the new SHA-256, new `upstream-version`, new `retrieved-at` timestamp.
6. **Routing: if any dependent artifact's substance changed**, the refresh is architect-routable (substance change requires architect ratification). If only the SHA-256 / version-string / timestamp changed (no semantic change in dependent artifacts), the refresh is a `chore: refresh vendored <file> from upstream <version>` commit, no architect routing.
7. **Updated test suite verifies** all fixtures with citations against the refreshed file still pass; CI green required before commit lands.

### Version-mismatch detection at runtime

OFBT's lifter does not currently detect "input ontology declares unsupported BFO version" because Phase 1 does not load BFO ARC content (no `bfo-2020.json` or successor module exists yet). Version-mismatch detection is therefore a **Phase 4+ deliverable** — when ARC manifest content lands, version-pinning per spec §3 enables the lifter to detect inputs that reference IRIs from an unsupported upstream version.

Anticipated Phase 4+ pattern:

- ARC modules carry an `upstreamVersion` field (e.g., `"upstreamVersion": "BFO 2020"`).
- The lifter compares input ontology IRI patterns against the loaded ARC modules' `upstreamVersion`.
- Mismatch surfaces as a Loss Signature record (reason code `unsupported_construct` or a new `unsupported_upstream_version` reason if the spec adds one in v0.2).
- Strict mode (`arcCoverage: 'strict'`) fails ingestion on version mismatch; permissive mode flags via Loss Signature and continues.

This is similar in shape to the Phase 0 Tau Prolog version-probe pattern (ADR-004) but operates at the ARC-content layer rather than the runtime-dependency layer.

Until Phase 4 lands the ARC modules and the version-mismatch detection, OFBT's behavior on input ontologies referencing IRIs from a newer upstream version is: **input lifts via the §6.4 fallback path with `unknown_relation` Loss Signatures**. The fallback is honest (Loss Signatures fire; the input is not silently corrupted), but the lift loses the upstream's semantic content for the unrecognized IRIs. Consumers requiring strict version-matching wait for Phase 4+ ARC content.

### What about downstream ontologies built against newer upstream?

A real-world scenario: a domain ontology (e.g., a CCO extension) is published referencing BFO 3.0, but OFBT only vendors BFO 2020 CLIF. What happens when that ontology is lifted?

- **Phase 1 (current)**: lifter doesn't load BFO ARC content; the BFO 3.0 IRIs lift via the standard OWL machinery as if they were any other IRI. No version-mismatch detection. Output is structurally valid FOL but loses BFO-specific semantics.
- **Phase 4+ with strict ARC**: lifter detects the BFO 3.0 IRIs are not in the loaded ARC manifest (which targets BFO 2020); strict mode fails ingestion with a clear diagnostic. Permissive mode flags `unknown_relation` Loss Signatures.
- **Refresh path to BFO 3.0**: SME refreshes `bfo-2020.clif` → `bfo-3.0.clif` (or the future canonical name) per the refresh procedure above; ARC modules are updated; fixtures' `clifGroundTruth` citations are updated; CI verifies.

### Forward-tracks

- **Phase 4 entry packet**: includes the version-mismatch detection mechanism design as a deliverable (extends ARC manifest schema with `upstreamVersion` field; extends lifter with version comparison; adds a fixture exercising the mismatch detection).
- **v0.2 candidate**: automatic upstream-refresh tooling (a script that fetches the latest upstream, computes the SHA-256, compares, surfaces a "refresh available" signal — but does NOT auto-apply the refresh; the SME-persona content-check stays manual).
- **v0.2+ candidate**: `unsupported_upstream_version` reason code in the spec's reason-code enum (currently `unknown_relation` carries this case; a distinct code would let consumers discriminate "missing ARC entry" from "input references a version OFBT doesn't know about").
