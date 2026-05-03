# Architecture Decision Records

<!--
  Log decisions here so they survive between AI sessions.
  An AI agent has no memory of yesterday. This file IS its memory.

  Format: Date | Decision | Context | Consequences
-->

## ADR-001: Use JSON-LD Deterministic Service Template

**Date:** 2026-04-15 (template adoption — backfilled from repo creation; predates OFBT spec freeze v0.1.7 on 2026-04-29)

**Decision:** Adopt the JSON-LD Deterministic Service Template as the base architecture.

**Context:** We need a service that produces deterministic, reproducible transformations on structured data. The template provides a pure kernel with spec tests, layered boundaries (kernel/composition/adapters), and zero runtime dependencies.

**Consequences:**
- All transformation logic lives in `src/kernel/transform.ts` as pure functions
- Kernel MUST NOT perform I/O, reference time, randomness, or environment state
- Infrastructure (HTTP, persistence, scheduling) lives in `src/adapters/`
- Spec tests (determinism, no-network, snapshot, purity) MUST pass before any merge

---

<!--
  Add new decisions below. Use the format:

  ## ADR-NNN: [Decision Title]

  **Date:** YYYY-MM-DD

  **Decision:** One sentence stating the choice.

  **Context:** Why this decision was needed. What alternatives were considered.

  **Consequences:** What follows from this decision. What is now easier or harder.
-->

---

## ADR-002: OFBT-specific kernel purity allowlist

**Date:** 2026-05-02

**Decision:** Rewrite `scripts/ensure-kernel-purity.ts` with an OFBT-specific allowlist: forbid Date/RNG/env/I-O/sort-without-comparator non-determinism patterns; allowlist `tau-prolog`, `rdf-canonize`, and `crypto.subtle.digest` (SHA-256 only) as legitimate kernel imports. Tau Prolog is treated as a kernel dependency, not an adapter.

**Context:** The template's default purity check only enforced layer boundaries (no imports leaving `src/kernel/`). The architect's ruling (recorded in conversation 2026-05-02) requires the checker to also enforce the determinism prohibitions in spec §0.1, §12.9, and Fandaws Consumer Requirement §1.3 — and ruled that Tau Prolog goes in the kernel, not an adapter, because routing it through `src/adapters/` would let kernel code escape the purity gate.

**Consequences:**
- The kernel may import `tau-prolog` and `rdf-canonize` directly; no other external imports are permitted.
- `crypto.subtle.digest` is permitted for deterministic SHA-256 content addressing; `crypto.getRandomValues` and `crypto.randomUUID` remain forbidden.
- `setTimeout(0)` cooperative scheduling (used by Tau Prolog's async chain) does not violate purity — determinism is about the content of an answer, not the timing of its return.
- Adding new external dependencies to the kernel requires an ADR.

---

## ADR-003: ARC TSV Module column as SME deliverable

**Date:** 2026-05-02

**Decision:** The `Module` column in `project/relations_catalogue_v3.tsv` (assigning each row to one of the five v0.1 ARC modules per spec §3.6.1) is an SME deliverable, not an engineering deliverable. Phase 0 ships the compiler scaffolding (`scripts/build-arc.js`, `regenerate-arc-tsv.js`, `round-trip-arc.js`) plus a transition affordance (`arc/module-assignments.json`) that lets engineering tooling run end-to-end before the SME folds the column in. The column itself blocks Phase 4 entry.

**Context:** ROADMAP §0.6 lists "TSV gains a Module column" as a Phase 0 acceptance criterion, but unilaterally assigning rows to modules is an SME judgment that engineering shouldn't make. The compiler needs to handle two states: TSV with column (canonical) and TSV without column (transition).

**Consequences:**
- `scripts/build-arc.js` reads from the TSV `Module` column when present, else falls back to `arc/module-assignments.json`. Rows with no assignment under either mechanism are skipped with a warning.
- `scripts/round-trip-arc.js` runs in non-strict mode by default; flips to strict at Phase 4 entry once the SME has folded the Module column into the canonical TSV.
- The Phase 4 entry checklist already requires `[VERIFY]` resolution on rows 49-50; adding the Module column for those rows is part of that pre-Phase-4 deliverable.

---

## ADR-004: Tau Prolog probe seam for testability without installed peer dep

**Date:** 2026-05-02

**Decision:** Tau Prolog version detection routes through an internal probe seam (`registerTauPrologProbe`) defaulting to `globalThis.pl?.version`. Tests inject a mock probe to simulate version-match / mismatch / absent scenarios without requiring the actual `tau-prolog` package to be present in this repo's `node_modules/`.

**Context:** API spec §9.2 requires `verifyTauPrologVersion()` to be sync. The spec assumes Tau Prolog has already been loaded by the consumer. In this repo's own test environment, the peer dep may not be installed; tests must still exercise both match and mismatch paths.

**Consequences:**
- `registerTauPrologProbe(probe)` lets Node ESM consumers explicitly bind their loaded Tau Prolog to OFBT instead of relying on the browser-style `globalThis.pl` registration.
- Tests have a clean injection seam (`registerTauPrologProbe(() => "0.3.4")` for match path, etc.).
- The probe is mutable module state — the only such state in OFBT — but it is intentional: it's a registry for the consumer-controlled peer dep, not OFBT-internal state.

---

## ADR-005: CLI restructure — kernel/index.ts split into kernel barrel + top-level package barrel + adapter CLI

**Date:** 2026-05-02

**Decision:** The template-inherited CLI at `src/kernel/index.ts` is split into three files matching the OFBT layer ruling:
- `src/adapters/cli.ts` — the CLI itself (file I/O, process.argv, stdout/stderr)
- `src/kernel/index.ts` — kernel-only public barrel (errors, reason codes, version, transform/canonicalize)
- `src/index.ts` — top-level package barrel re-exporting kernel + composition

`package.json` `main`, `types`, and `exports["."]` repoint at `dist/index.js`. The `start` and new `cli` scripts invoke `dist/adapters/cli.js`. The CI `Verify CLI` step likewise updates.

**Context:** Phase 0 exit retrospective flagged this as risk (2): the existing CLI lived in `src/kernel/` but performed I/O, violating the architect's adapter-vs-kernel ruling (ADR-002). The OFBT purity checker only catches specific forbidden APIs (Date.now, Math.random, fetch, etc.), not the broader "kernel performs no I/O" principle in spec §0.2 — so a regex check wouldn't have flagged it, but the layering principle still applied.

Phase 1 will replace the underlying call (currently the template `transform` identity function) with `owlToFol`. Doing the restructure in a Phase 0 cleanup PR keeps Phase 1 focused on lifter implementation rather than scaffolding.

**Consequences:**
- Consumers `import { ... } from "@ontology-of-freedom/ofbt"` reach the top-level barrel which re-exports across kernel + composition.
- Submodule paths (`/errors`, `/reason-codes`, `/version`, `/session`, `/kernel`) remain available for tree-shaking via the package.json `exports` map.
- Kernel barrel does NOT re-export from composition (would violate purity check). The composition surface is reachable via `/session` submodule path or via the top-level barrel.
- CI `Verify CLI` step now invokes `dist/adapters/cli.js`.
- esbuild bundles target `src/index.ts` (the full public API), not the kernel-only barrel.
- 47/47 tests + purity check + corpus manifest all green after restructure.

---

## ADR-006: Tighten purity checker — close node:* hole, add process.* / console.* rules, enforce expected_v0.2_elk_verdict and worked-example coverage

**Date:** 2026-05-02

**Decision:** Tighten `scripts/ensure-kernel-purity.ts` and the corpus manifest gate in response to SME Phase 0 review:

- (B1) Forbid all `node:*` builtins in the kernel except `node:crypto` (and only for `subtle.digest`). Previously the rule allowed any `node:` import.
- (B2-companion) Add explicit kernel rules forbidding `process.argv`, `process.stdout`, `process.stderr`, `process.exit`, `process.cwd`, `process.pid`, and `console.*`. Catches the CLI-pattern class of violation that risk (2) flagged.
- (B1-companion) Add `no-crypto-without-subtle-digest` rule: any `crypto.X` access where `X` is not on the `subtle` chain is forbidden in kernel.
- (S1) Make `expected_v0.2_elk_verdict` REQUIRED in `tests/corpus/manifest.schema.json` and `scripts/check-corpus-manifest.ts`. `null` permitted; absent forbidden — collapsing the ELK regression-suite signal is a load-bearing failure.
- (S2) Promote `lint-arc.js` worked-example coverage check from informational to enforced under `--require-fixtures-for-verified` (folded into `--strict`). Phase 4-7 ARC Authoring Exit Criteria now invoke `--strict`.
- (S3) Add `scripts/build-arc.js --strict` "0 skipped rows" gate to Phase 4, 5, 6, 7 ARC Authoring Exit Criteria — prevents silent row-drop when a TSV row has no Module assignment.
- (S4) Reconcile Node-version claim: ROADMAP now says Node v22+ to match `package.json` `engines.node`.

**Context:** SME Phase 0 review (2026-05-02) caught three blockers and four structural items not in the exit summary. The B1 hole specifically would have allowed a future contributor to import `node:fs` directly into kernel code with no warning — exactly the failure mode the architect's ADR-002 ruling was designed to prevent.

**Consequences:**
- The kernel can no longer import `node:fs`, `node:path`, `node:http`, `node:child_process`, etc. Only `node:crypto` (and only for `subtle.digest`) and the two allowlisted external packages (`tau-prolog`, `rdf-canonize`) are permitted.
- CLI pattern (`process.argv` / `process.stdout` / `process.exit` / `readFile`) cannot regress into the kernel without failing CI.
- Corpus manifest entries MUST explicitly set `expected_v0.2_elk_verdict` to either an outcome or `null` — silent omission is no longer accepted.
- Phase 4-7 ARC content authoring is on a stricter gate: every Verified entry needs a fixture; every TSV row needs a Module assignment.
- 47/47 tests + tightened purity check + tightened corpus manifest gate all green after the rule-tightening — confirming the prior CLI restructure (ADR-005) cleaned the kernel sufficiently for the new rules.

---

## ADR-007: Phase 1 lifter determinism conventions + cycle-guard layer translation

**Date:** 2026-05-02 (drafted at Step 5 implementation; ratified Accepted at Step 5 close cycle per architect Ruling 1 of the same cycle)

**Status:** Accepted (architectural commitment per spec §0.1; routes future lifter/evaluator boundary questions). Section 1 (cycle-guard layer translation) is the architectural commitment; sections 2-9 are implementation-choice-tier conventions per spec §0.1 and are approved as authored within the developer's domain.

**Decision:** Pin the eight determinism conventions the Phase 1 lifter has settled on, and document the cycle-guard layer translation that resolves the tension between spec §5.4 ("the lifter rewrites these axioms to thread visited-ancestor lists") and API §4 (which has no list / visited-ancestor primitive in FOLAxiom).

### 1. Cycle-guard layer translation [ARCHITECTURAL COMMITMENT per spec §0.1]

**This section is the load-bearing architectural commitment of ADR-007. It routes future lifter/evaluator boundary questions.** Architect Ruling 1 of the Step 5 close cycle: "Lifter outputs classical FOL form per spec §5; evaluator implementation details (cycle guards, tabling, step caps) are evaluator-side concerns and do not appear in lifted FOL."

The lifter emits CLASSICAL FOL semantic axioms (e.g., `∀x,y,z. P(x,y) ∧ P(y,z) → P(x,z)` for Transitive). Cycle-guarded SLD ingestion (visited-ancestor list per ADR-011) is the **Phase 3 evaluator's** concern, not the lifter's. The FOL term tree carries the equivalent encoding per spec §6.2 ("An OWL TransitiveObjectProperty declaration is logically equivalent to its Prolog rule form `p(X,Z) :- p(X,Y), p(Y,Z)`"); the Phase 3 evaluator (when it lands) translates the FOL state into cycle-guarded Prolog rules at ingestion time per ADR-011's visited-ancestor pattern.

This is the only resolution consistent with API §4 (no list primitive in FOLAxiom). Spec §5.4's "lifter rewrites" language refers to the conceptual lifter→evaluator pipeline; the rewrite to visited-list Prolog form happens at evaluator-ingestion time, not in the FOL term tree.

Architect-banked architectural consequences (from Ruling 1):
- Honors spec §0.1's three-tier framing — keeps the §0.1 implementation-choice tier (cycle guard) out of the §0.1 architectural-commitment tier (lifter output semantics). v0.2's planned SLG tabling requires only evaluator rework, not lifter rework.
- Honors API §6.1.1's determinism contract cleanly — the contract bounds to the classical-FOL form, not to a visited-ancestor encoding scheme.
- Honors round-trip parity per spec §8.1 — `lift(G₂) ≡ F₂ modulo Loss Signatures` is a property of the classical FOL state. v0.2 SLG migration will not break parity for stored audit artifacts.

### 2. Variable-allocator letter sequence

`makeVarAllocator()` yields fresh `FOLVariable` records with names from the sequence `["x", "y", "z", "w", "v", "u", "t", "s", "r", "q", "v10", "v11", ...]`. Index 0 = "x", index 1 = "y", and so on; from index 10, names switch to `v<index>` to avoid collisions with the alphabetic tail.

A fresh allocator is created at every top-level lift call (each TBox / RBox axiom; each ABox axiom). Inner calls (e.g., `liftClassExpression` recursing into restrictions) share the allocator with their enclosing top-level call — so nested restrictions allocate from index 2 onward (z, w, v, ...) without colliding with the outer `x` and `y`.

### 3. Pairwise i<j emission for set-based axioms

For axioms whose input is a set of N classes / individuals (`SameIndividual`, `DifferentIndividuals`, `EquivalentClasses`, `DisjointWith`), the lifter emits one or two FOL axioms per pair `(i, j)` with `i < j`. Within a single set, the iteration order is the source-array order. For `EquivalentClasses` the per-pair emission is BOTH directions (forward then reverse, each with a fresh allocator per direction so both bind `x`); for `SameIndividual` / `DifferentIndividuals` it is the bare pairwise atom; for `DisjointWith` it is the conjunction-implies-False shape.

### 4. Fresh-allocator-per-direction in `liftBidirectionalSubsumption`

When emitting `EquivalentClasses` mutual implications or `ClassDefinition` biconditionals, each direction allocates a fresh `makeVarAllocator()` so both emitted universals bind `x` rather than `x` and `y`. This is a determinism contract; the architect-banked convention from corpus sign-off.

### 5. Top-level pipeline order

`owlToFol` processes the input ontology in this order:
1. `rejectPuntedConstructs` (pre-scan; throws on §13.1 punted patterns)
2. TBox lifting (`SubClassOf`, `EquivalentClasses`, `DisjointWith`, `ClassDefinition`)
3. RBox lifting (`ObjectPropertyDomain`, `ObjectPropertyRange`, `ObjectPropertyCharacteristic`, `InverseObjectProperties`, …)
4. ABox lifting (`ClassAssertion`, `ObjectPropertyAssertion`, `DataPropertyAssertion`, `SameIndividual`, `DifferentIndividuals`)
5. Identity machinery emission (`emitIdentityMachinery`) — equivalence axioms + per-predicate identity-rewrite rules

Within each stage, source-array order is preserved.

### 6. Lexicographic sort for predicate sets

Where the lifter iterates over a *set* of predicate IRIs (e.g., `emitIdentityMachinery`'s per-predicate identity-rewrite rule emission), the iteration is a lexicographic sort of the canonical (expanded full-URI) form. Same input set in different traversal order produces the same axiom sequence.

### 7. Cardinality-witness Skolem prefix (Step 7 — to be filled in)

[TO BE COMPLETED at Step 7 implementation, when the cardinality fixture's STRUCTURAL_ONLY placeholder is filled.] Cardinality restrictions require Skolem witnesses for `minCardinality` and `exactCardinality`; the prefix and naming convention land here.

### 8. RDFC-1.0 b-node Skolem prefix (Step 6 — to be filled in)

[TO BE COMPLETED at Step 6 implementation, when the blank-node fixture's STRUCTURAL_ONLY placeholder is filled and `rdf-canonize` is wired in.] The RDFC-1.0 canonical b-node label gets transformed to a Skolem constant IRI using a documented prefix; the prefix and the transformation rule land here.

### 9. Reserved-predicate canonical form [RESOLVED in Step 5 close commit per architect Ruling 3]

Reserved OWL predicates (`owl:sameAs`, `owl:differentFrom`) previously minted in CURIE-form when emitted from `SameIndividual` / `DifferentIndividuals` axioms and from the identity-machinery emission (Step 4); user-supplied predicate IRIs went through `canonicalizeIRI` and landed in expanded full-URI form. **Consequence (now closed):** a user-supplied `ObjectPropertyAssertion(property: "owl:sameAs", ...)` with `prefixes.owl` declared produced a fact with the expanded URI form, which would have been treated as a different predicate from the lifter-minted `owl:sameAs` CURIE form. SME O1 from the Step 4 review surfaced this; SME's Step 5 review re-escalated for resolution in the Step 5 cycle.

**Decision (architect Ruling 3 of the Step 5 close cycle, 2026-05-02):** **Resolution A** — internal canonical form is full URI per API §3.10.3 ("FOLAtom.predicate and FOLConstant.iri strings in OFBT's FOL output use expanded full URI form by default"). Reserved OWL predicates are no exception. The lifter canonicalizes reserved predicates the same as user-supplied ones — minted constants land as `http://www.w3.org/2002/07/owl#sameAs` (and `http://www.w3.org/2002/07/owl#differentFrom`), not as `owl:sameAs` (and `owl:differentFrom`).

Resolution B (distinct OFBT-internal namespace for reserved predicates) was rejected because (i) it would require a spec carve-out from API §3.10.3, (ii) post-freeze spec changes per §0.2 require implementation evidence not present here, and (iii) the visual minted-vs-user distinction concern (the only argument for Resolution B) lives in the rendering layer (CURIE form for human-facing diagnostics per API §3.10.4), not in the canonical FOL state.

**Implementation status:** Implemented in the Step 5 close commit. Two constants `OWL_SAME_AS_IRI` and `OWL_DIFFERENT_FROM_IRI` declared in `src/kernel/lifter.ts` carrying the expanded full-URI form; four mint sites updated (SameIndividual ABox, DifferentIndividuals ABox, identity-machinery equivalence-axiom emissions, identity-machinery per-predicate identity-rewrite-rule inner sameAs atoms); reserved-predicate exclusion check in per-predicate identity-rewrite emission switched to the expanded-form match. Coordinated re-amendment of `tests/corpus/p1_owl_same_and_different.fixture.js` updates expectedFOL from CURIE to expanded form (six atom-predicate strings) with audit-trail addendum.

**Banked principle:** "When the spec already pins a canonical form, 'we'll figure it out later' is not a deferral, it's a contradiction with the spec that compounds with each step. Resolve at the moment the contradiction surfaces." (Architect Ruling 3 of Step 5 close cycle, 2026-05-02.)

**Context:** Step 5 implementation surfaces three concrete needs for these conventions: (1) Functional/Transitive/Symmetric/InverseObjectProperties emission requires the variable-allocator and per-direction allocator-freshness conventions; (2) the `p1_property_characteristics` STRUCTURAL_ONLY placeholder fill-in commits the lifter to a byte-exact term-tree shape that becomes the determinism contract per API §6.1.1; (3) the cycle-guard layer-translation question (lifter vs evaluator responsibility) cannot be deferred — it is a load-bearing decision for what the FOL term tree is allowed to contain.

**Consequences:**
- Future contributors implementing Phase 1 Steps 6-9 (or any post-Phase-1 lifter extension) inherit these conventions; deviations require a follow-up ADR with implementation evidence.
- The Phase 3 evaluator's Prolog-rule-emission algorithm has a documented contract: ingest classical-FOL term trees and apply the visited-ancestor cycle-guard at ingestion time.
- The ADR-007 placeholder text for §7 (cardinality Skolem) and §8 (RDFC-1.0 b-node Skolem) must be filled in at Steps 7 and 6 respectively before Phase 1 exit; they are not omitted but explicitly deferred.
- Per architect ruling 2026-05-02: ADR-007 promotes Draft → Accepted on architect ratification; until then, fixture amendments referencing it (notably `p1_property_characteristics` Step 5 fill-in) are also Draft.

