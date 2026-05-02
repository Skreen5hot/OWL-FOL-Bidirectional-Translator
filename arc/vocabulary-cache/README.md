# Canonical-Vocabulary IRI Cache

Phase 0.7 SME deliverable per [ROADMAP](../../project/ROADMAP.md). This directory holds per-vocabulary offline caches of canonical IRIs against which `scripts/lint-arc.js` validates every ARC-entry IRI.

## Purpose

ARC entries reference IRIs from upstream canonical releases (BFO 2020, IAO, RO, CCO 2.0, PROV-O, plus the OFI-minted extension). When an entry references `http://purl.obolibrary.org/obo/BFO_0000050`, the linter must verify that IRI actually exists in the corresponding canonical release. Without the cache, a typo in the catalogue's IRI column ships silently and the lifter emits a malformed predicate at runtime.

The cache IS the offline truth source. Edge-canonical: no network at lint time; the cache is checked-in JSON; refresh is a separate developer-tool step that consumes user-supplied `.owl`/`.ttl` files.

## Files

| File | Vocabulary | Phase that needs it |
|---|---|---|
| `bfo-2020.json` | Basic Formal Ontology 2020 | Phase 4 |
| `iao.json` | Information Artifact Ontology | Phase 5 |
| `ro.json` | OBO Foundry Relation Ontology | Phase 4-7 (cross-cutting) |
| `cco-2.0.json` | Common Core Ontologies 2.0 | Phase 6 |
| `prov-o.json` | W3C PROV Ontology | Phase 1 (PROV-O domain/range fixture) |
| `ofi-extension.json` | OFI-minted relations | Phase 7 (OFI deontic) |
| `schema.json` | JSON Schema for cache files | (validates the rest) |

## Phase 0 status: hand-seeded only

Every entry currently in the cache files carries `"unverified": true` (or a `seedSource` field) — the IRIs were extracted from `project/relations_catalogue_v3.tsv` and the OFBT spec/API documents. None has been confirmed against the canonical `.owl`/`.ttl` release.

Pre-Phase-4 SME (Aaron) work:

1. Obtain the canonical `.owl`/`.ttl` for each vocabulary (download once, store outside the repo).
2. Run `npm run refresh:vocab-cache -- --vocab=<id> --source=<local-path>` to parse the local file and update the cache.
3. The refresh clears `unverified: true` flags and populates `retrievedAt` + `version`.
4. Commit the refreshed cache.

## Cache file format

See [schema.json](./schema.json) for the normative shape. Summary:

```json
{
  "vocabularyId": "bfo-2020",
  "displayName": "Basic Formal Ontology 2020",
  "namespaceURI": "http://purl.obolibrary.org/obo/",
  "iriPattern": "^http://purl\\.obolibrary\\.org/obo/BFO_\\d{7}$",
  "version": "2020",
  "retrievedAt": null,
  "sourceURL": "http://purl.obolibrary.org/obo/bfo/2020/bfo.owl",
  "entries": [
    { "iri": "http://purl.obolibrary.org/obo/BFO_0000050", "type": "object-property", "label": "part of" }
  ]
}
```

`iriPattern` is the load-bearing field for routing: the linter routes an arbitrary entry IRI to the correct cache by **regex match against `iriPattern`**, not by manual tagging. BFO and IAO share the OBO Foundry namespace prefix; the iriPattern discriminates `BFO_\d{7}` from `IAO_\d{7}`.

## Refresh process (offline)

The refresh script lives at [`scripts/refresh-vocab-cache.js`](../../scripts/refresh-vocab-cache.js). Usage:

```bash
# Single vocabulary, from a locally-downloaded canonical .owl/.ttl file
npm run refresh:vocab-cache -- --vocab=bfo-2020 --source=/path/to/bfo-2020.owl

# Dry-run: show what would change without writing
npm run refresh:vocab-cache -- --vocab=bfo-2020 --source=/path/to/bfo-2020.owl --dry-run
```

The script:

1. Parses the user-supplied file via a minimal RDF/OWL parser (no network, no Tau Prolog dependency).
2. Extracts every IRI matching the cache's `iriPattern`.
3. Classifies each IRI by OWL entity type (Class, ObjectProperty, etc.).
4. Merges results into the existing cache file:
   - Entries present in the canonical release lose their `unverified` flag.
   - Entries absent from the canonical release are flagged in the diff but NOT removed automatically (preserves SME-curated `seedSource` notes; SME decides whether to delete).
5. Updates `retrievedAt` to the current ISO-8601 timestamp (developer-tool only — never invoked from the kernel, so timestamping is fine here).
6. Writes the cache back, sorted by IRI for stable diffs.

## Linter integration

`scripts/lint-arc.js` consumes the cache to enforce, per ARC entry:

1. **IRI existence.** Every `iri` field in every ARC entry must resolve to an entry in some cache file (matched by regex-pattern against each cache's `iriPattern`).
2. **Type agreement.** An ARC entry declared `object-property` whose IRI's cache type is `class` is a hard error.
3. **Unverified-IRI surfacing.** In `--strict` mode, an ARC entry referencing a cache entry with `"unverified": true` fails the lint. This makes the [VERIFY] state machine in `arc/AUTHORING_DISCIPLINE.md` enforceable at the IRI level too, not only at the entry-state level.
4. **Deprecated-IRI warning.** Entries pointing at cache IRIs marked `deprecated: true` get a warning.

## What this cache is NOT

- **Not a runtime dependency of the lifter or projector.** Kernel code never reads from it. The cache is a developer-tool artifact for ARC authoring; runtime IRI handling per spec §4.2.1 operates on the input graph alone.
- **Not a TBox.** The cache stores IRIs and their entity-type classification only. Class hierarchy, property characteristics, domain/range — all of that lives in the ARC manifest itself, not here.
- **Not exhaustive.** Phase 0 ships seeds drawn from the v3 relations catalogue. Phases 4-7 entry checklists require the SME to refresh against the actual canonical releases.

## Why per-vocabulary files instead of one big cache

1. **Versioning independence.** BFO 2020, IAO 2024-11, CCO 2.0 release on independent cadences. Per-file `version` + `retrievedAt` makes each refreshable independently.
2. **Diff hygiene.** Refreshing BFO touches only `bfo-2020.json`; the diff is reviewable in isolation.
3. **Scope alignment.** A consumer running OFBT against BFO-only ontologies can audit just `bfo-2020.json`; CCO content is not load-bearing for that workflow.

This mirrors the modular ARC manifest discipline (spec §3.6).
