# ARC Authoring Discipline

This document defines the per-entry sign-off ritual for ARC manifest content. It applies to every relation entry that ships in any of the five v0.1 ARC modules per spec §3.6.1:

- `arc/core/bfo-2020.json`
- `arc/core/iao-information.json`
- `arc/cco/realizable-holding.json`
- `arc/cco/mereotopology.json`
- `arc/ofi/deontic.json`

Phase 0 ships this discipline; ARC content authoring is the SME (Aaron) workstream that runs in parallel through Phases 0-7 and gates each ARC-bearing phase entry (4, 5, 6, 7).

## State Machine

Every entry carries one of three states in its `notes` field (or via a dedicated `verifiedStatus` field once introduced):

- **Verified** — the entry has been peer-reviewed against canonical literature, has at least one passing fixture, and is ready to ship in the named phase.
- **[VERIFY]** — the entry's IRI, OWL characteristics, FOL definition, or domain/range needs confirmation against canonical literature before it can ship. Any entry carrying `[VERIFY]` blocks the phase entry of the module containing it.
- **Draft** — entry is provisional, not yet peer-reviewed. Acceptable in working files; MUST be promoted to Verified or removed before the entry's module is loaded by an ARC-bearing phase.

Transitions:

```
Draft ──peer-review─→ [VERIFY] ──canonical-citation─→ Verified
        │                                                  ↑
        └──canonical-citation-on-first-pass────────────────┘
```

`scripts/lint-arc.js` fails CI on any `[VERIFY]` tag in a module that the corresponding phase entry checklist requires Verified.

## Required Fields per Entry

Every Verified entry MUST carry:

| Field | Source | Purpose |
|---|---|---|
| `name` | TSV `Relation Name` | human-readable identifier |
| `level` | TSV `Level` | Meta / Class-level / Object-level / etc. |
| `context` | TSV `Context` | mathematical context (Set Theory, Mereology, etc.) |
| `notation` | TSV `Notation` | canonical mathematical notation |
| `formalDefinition` | TSV `Formal Definition` | the FOL definition in CL or KIF |
| `owlCharacteristics` | TSV `OWL Characteristics` | declared OWL property characteristics |
| `owlRealization` | TSV `OWL / CCO Realization` | the OWL/CCO IRI realizing the relation |
| `iri` | TSV `IRI` | canonical IRI; resolves against the module's vocabulary cache |
| `subPropertyOf` | TSV `subPropertyOf` | parent-property IRI(s), comma- or semicolon-separated; `—` permitted when the relation has no parent. `lint-arc.js` validates that each non-`—` value resolves to an entry in the same module or a declared dependency (per `MODULE_DEPS`). |
| `domain` | TSV `Domain` | domain class IRI (or `—` if unconstrained) |
| `range` | TSV `Range` | range class IRI (or `—` if unconstrained) |
| `notes` | TSV `Notes` | citation, disjointness commitments, divergence notes |

## Per-Entry Peer-Review Checklist

Before promoting from Draft / [VERIFY] to Verified:

- [ ] Citation to canonical literature recorded in `notes` (BFO 2020 spec, RO release, IAO release, CCO 2.0 release, RDM v1.2.1 spec, or constitution.ttl as appropriate)
- [ ] OWL characteristics declared exactly as the canonical OWL file declares them; divergence between OWL and CL (e.g., reflexivity declared in CL but not OWL) explicitly noted in `notes`
- [ ] FOL definition uses the relation's standard variable conventions; ternary or higher-arity definitions name the temporal-index parameter explicitly
- [ ] Domain and range classes are themselves Verified entries in the same module or a declared dependency
- [ ] Inverse / property-chain dependencies enumerated in `notes` with the dependency relation also Verified
- [ ] At least one worked-example fixture exists in `tests/corpus/` and is registered in `tests/corpus/manifest.json` with the entry's IRI in its `arcEntries` array
- [ ] The entry's IRI appears in the corresponding canonical-vocabulary cache file under `arc/vocabulary-cache/`, refreshed via `npm run refresh:vocab-cache -- --vocab=<id> --source=<local-path>` against the canonical `.owl`/`.ttl` release. `lint-arc.js --strict` flags any IRI not present in the cache, or present but flagged `unverified: true`.

## Canonical-Vocabulary IRI Cache

Every entry's `iri` field is validated against an offline cache of canonical IRIs under `arc/vocabulary-cache/`. See [`arc/vocabulary-cache/README.md`](./vocabulary-cache/README.md) for the format, refresh process, and per-vocabulary status. Phase 0 ships hand-seeded caches drawn from `relations_catalogue_v3.tsv` and the OFBT spec; pre-Phase-4 SME work refreshes each cache against the actual canonical release using the offline refresh tool.

The cache check in `lint-arc.js` operates as:

1. **Routing.** Each entry's IRI is matched against every cache file's `iriPattern` regex; the first match claims the IRI.
2. **Existence.** If the IRI's pattern matches a cache but the IRI itself is absent from that cache's entries — hard error (typo in the catalogue, or canonical release does not declare it).
3. **Type agreement.** Object-level entries are expected to resolve to `object-property` cache entries; mismatch is a hard error.
4. **Unverified surfacing.** In `--strict` mode (which the Phase 4-7 ARC Authoring Exit Criteria invoke), references to cache entries with `"unverified": true` fail the lint. SME refreshes the cache against the canonical release to clear the flag.
5. **Unrouted IRIs.** If no cache claims the IRI's pattern, the linter emits a warning so the SME notices the gap and either adds a cache file for the new vocabulary or corrects the IRI.

## Bridge-Axiom and Disjointness-Axiom Completeness

Per ROADMAP cross-cutting "ARC Authoring Discipline":

- **Bridge axioms** (e.g., Connected With per spec §3.4.1) MUST appear in their owning module's `entries` with the explicit FOL definition in CL or KIF, not as a free-floating note.
- **Disjointness commitments** declared in TSV Notes (e.g., rows 65-66 `discharges`/`violates`) MUST be formalized into machine-readable axiom entries in the appropriate module before that module's phase exit.
- The BFO Disjointness Map is the canonical source for cross-module disjointness; entries that participate (Continuant ⊓ Occurrent, SDC ⊓ GDC, etc.) MUST cross-reference the Map's authoritative listing.

## Module Dependencies

Per spec §3.6.4 and `MODULE_DEPS` in `scripts/lint-arc.js`:

```
core/bfo-2020             (root)
core/iao-information      depends on: core/bfo-2020
cco/realizable-holding    depends on: core/bfo-2020
cco/mereotopology         depends on: core/bfo-2020
ofi/deontic               depends on: core/bfo-2020, core/iao-information
```

An entry's `subPropertyOf` IRI MUST resolve to an entry in the same module or one of its declared dependencies. `lint-arc.js` flags violations.

## Per-Phase Exit Checklists

Each ARC-bearing phase has explicit ARC Authoring Exit Criteria in `project/ROADMAP.md`. Summary:

- **Phase 4** (BFO 2020 core): every Verified BFO entry has a fixture; BFO Disjointness Map commitments formalized; bridge axioms (Connected With) present with FOL definitions; lint passes.
- **Phase 5** (IAO information): every Verified IAO entry has a fixture; lint passes.
- **Phase 6** (CCO realizable-holding + mereotopology): every Verified CCO entry has a fixture; lint passes.
- **Phase 7** (OFI deontic): every Verified OFI entry has a fixture; directive/commitment disjointness commitments formalized (rows 65-66 from Phase 0.6); lint passes.

## Failure-Triage Handoff

Per ROADMAP cross-cutting "Failure-Triage Handoff Protocol":

When a Ring N failure is suspected to be ARC-content rather than conversion machinery, engineering files an issue with the failing fixture ID, observed result, expected result, and the witness chain (or its absence) Tau Prolog produced. The SME reclassifies as ARC bug / fixture bug / machinery bug and routes accordingly. Module-content corrections enter via the same Draft → [VERIFY] → Verified state machine described above.
