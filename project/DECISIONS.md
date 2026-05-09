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

### 7. Cardinality witness convention [RESOLVED in Step 7 close commit]

When ADR-007 was first drafted at Step 5, this section was framed as a "Skolem-witness prefix" placeholder, on the assumption that `minCardinality` / `exactCardinality` would Skolemize witnesses to fresh constants under a documented prefix. **Step 7 implementation revealed the framing was wrong:** classical-FOL cardinality lifting uses **existential bindings**, not Skolem constants, so no prefix is needed.

**Decision:** cardinality lifting uses ∃-bindings allocated from the standard variable allocator per ADR-007 §2 (the same `x, y, z, w, v, u, t, s, r, q, v_n` letter sequence used by `someValuesFrom` and `allValuesFrom`). No new prefix declared; no Skolem constants minted.

**Concrete shapes:**
- `minCardinality(P, n)[onClass C]` → `∃ y₁..yₙ. (⋀ᵢ<ⱼ ¬(yᵢ=yⱼ)) ∧ (⋀ᵢ P(x, yᵢ) [∧ C(yᵢ)])`
- `maxCardinality(P, n)[onClass C]` → `∀ y₁..y_{n+1}. (⋀ᵢ P(x, yᵢ) [∧ C(yᵢ)]) → (⋁ᵢ<ⱼ yᵢ=yⱼ)`
- `exactCardinality(P, n)[onClass C]` → `min(P, n)[C] ∧ max(P, n)[C]` (conjunction at the consequent level of the wrapping `SubClassOf` universal)

**QCR (qualified cardinality restriction)** with `onClass` recursively lifts the class expression against each witness via `liftClassExpression(onClass, witness, prefixes, alloc)` — supports complex `onClass` shapes structurally even though the Phase 1 corpus exercises only `NamedClass`.

**Edge cases:**
- `n = 0` for `minCardinality`: emits empty `fol:Conjunction` (logically ⊤). API §4 has no `fol:True` primitive; the empty conjunction is the canonical encoding.
- `n = 0` for `maxCardinality`: emits `fol:False` consequent ("a single witness already contradicts at-most-zero"). Uses the same `fol:False` primitive Step 2's `DisjointWith` handler introduced.

**Variable-allocation under exactCardinality:** since `exactCardinality` decomposes to `min ∧ max` sharing the outer `SubClassOf` allocator (per ADR-007 §2's "inner calls share the allocator"), the min part allocates `y, z, …` and the max part continues with `w, v, u, …` from the same sequence. Witnesses do not collide because the allocator is monotonic.

**B2 protection graduation:** the SME B2 inline regression test ("cardinality throws `UnsupportedConstructError`") is removed at Step 7 close — cardinality no longer throws. The protection graduates to fixture-level `deepStrictEqual` against `p1_restrictions_cardinality.expectedFOL`: any wrong-arity emission (e.g., a unary atom of an object-property predicate, the failure mode B2 was authored to catch) now breaks the fixture's byte-exact match. This is the architect-banked "tests must catch the wrong shape's absence, not pass coincidentally" discipline applied at the natural graduation point.

### 8. RDFC-1.0 b-node Skolem prefix [RESOLVED in Step 6 close commit]

When the input carries a Turtle / RDF 1.1 blank-node identifier (`_:label`), `canonicalizeIRI` mints a deterministic Skolem constant by concatenating the OFBT-minted vocabulary prefix with the b-node label:

- **Prefix:** `https://ofbt.ontology-of-freedom.org/ns/0.1/bnode/` (per spec §17.2 Q2 — the permanent OFBT-minted vocabulary base; the `bnode/` segment isolates Skolemized b-nodes from other minted IRIs).
- **Transformation:** `_:label` → `https://ofbt.ontology-of-freedom.org/ns/0.1/bnode/label`.
- **RDFC-1.0 canonicalization responsibility:** the caller (typically the `parseOWL` adapter when it materializes RDF input into structured-JS form) is responsible for canonicalizing the b-node labels via `rdf-canonize` BEFORE passing them to the lifter. Phase 1 corpus exercises only structured-JS inputs without b-node references; the b-node IRI form is structurally supported by the lifter (verified by the inline regression test in `tests/lifter-phase1.test.ts`), but full Phase 4+ corpus exercise (real BFO/CCO releases use b-nodes for class expressions) waits on the `parseOWL` adapter wiring.
- **Recognized form:** `BNODE_RE = /^_:([A-Za-z0-9_][A-Za-z0-9_.\-]*)$/` per the Turtle PN_LOCAL grammar. Strict subset of the W3C Turtle b-node label grammar, sufficient for RDFC-1.0 canonical labels (which use `c14nN` form).

`p1_blank_node_anonymous_restriction` does NOT exercise the b-node IRI path because its input uses inline-restriction syntax (anonymous nested ClassExpression objects in the structured-JS form) rather than RDF b-node references. The fixture's determinism is provided by ADR-007 §2 (variable-allocator letter sequence) at the existential-witness level; the b-node Skolem prefix is exercised by an inline regression test at Step 6 and will be exercised by Phase 4+ corpus when `parseOWL` materializes b-node-bearing RDF.

### 9. Reserved-predicate canonical form [RESOLVED in Step 5 close commit per architect Ruling 3]

Reserved OWL predicates (`owl:sameAs`, `owl:differentFrom`) previously minted in CURIE-form when emitted from `SameIndividual` / `DifferentIndividuals` axioms and from the identity-machinery emission (Step 4); user-supplied predicate IRIs went through `canonicalizeIRI` and landed in expanded full-URI form. **Consequence (now closed):** a user-supplied `ObjectPropertyAssertion(property: "owl:sameAs", ...)` with `prefixes.owl` declared produced a fact with the expanded URI form, which would have been treated as a different predicate from the lifter-minted `owl:sameAs` CURIE form. SME O1 from the Step 4 review surfaced this; SME's Step 5 review re-escalated for resolution in the Step 5 cycle.

**Decision (architect Ruling 3 of the Step 5 close cycle, 2026-05-02):** **Resolution A** — internal canonical form is full URI per API §3.10.3 ("FOLAtom.predicate and FOLConstant.iri strings in OFBT's FOL output use expanded full URI form by default"). Reserved OWL predicates are no exception. The lifter canonicalizes reserved predicates the same as user-supplied ones — minted constants land as `http://www.w3.org/2002/07/owl#sameAs` (and `http://www.w3.org/2002/07/owl#differentFrom`), not as `owl:sameAs` (and `owl:differentFrom`).

Resolution B (distinct OFBT-internal namespace for reserved predicates) was rejected because (i) it would require a spec carve-out from API §3.10.3, (ii) post-freeze spec changes per §0.2 require implementation evidence not present here, and (iii) the visual minted-vs-user distinction concern (the only argument for Resolution B) lives in the rendering layer (CURIE form for human-facing diagnostics per API §3.10.4), not in the canonical FOL state.

**Implementation status:** Implemented in the Step 5 close commit. Two constants `OWL_SAME_AS_IRI` and `OWL_DIFFERENT_FROM_IRI` declared in `src/kernel/lifter.ts` carrying the expanded full-URI form; four mint sites updated (SameIndividual ABox, DifferentIndividuals ABox, identity-machinery equivalence-axiom emissions, identity-machinery per-predicate identity-rewrite-rule inner sameAs atoms); reserved-predicate exclusion check in per-predicate identity-rewrite emission switched to the expanded-form match. Coordinated re-amendment of `tests/corpus/p1_owl_same_and_different.fixture.js` updates expectedFOL from CURIE to expanded form (six atom-predicate strings) with audit-trail addendum.

**Banked principle:** "When the spec already pins a canonical form, 'we'll figure it out later' is not a deferral, it's a contradiction with the spec that compounds with each step. Resolve at the moment the contradiction surfaces." (Architect Ruling 3 of Step 5 close cycle, 2026-05-02.)

### 10. OFBT meta-vocabulary encoding choice — implicit-typing of class / object-property IRIs [RESOLVED at Phase 1 exit Step 9.4 doc pass]

Architect-ratified at the BFO/CLIF parity routing cycle 2026-05-03 ("yes the elision is sound") and formalized here at Phase 1 exit Step 9.4 doc pass.

**Decision:** OFBT's lifter elides meta-typing predicates (`(Class X)`, `(OWLObjectProperty R)`) that appear in the canonical OWL CLIF axiomatization. The lifted FOL is the canonical form's BODY universal-implication; meta-typing antecedents are omitted per OFBT's encoding choice — **every IRI used in a class position is implicitly a Class; every IRI used in an object-property position is implicitly an OWLObjectProperty.** No separate Class reification or OWLObjectProperty reification is performed.

**Concrete examples** (canonical CLIF vs. OFBT lifted form):

| Construct | Canonical CLIF (`owl-axiomatization.clif`) | OFBT lifted FOL |
|---|---|---|
| `SubClassOf(C, D)` | `(forall (X Y) (iff (SubClassOf X Y) (and (Class X) (Class Y) (forall (z) (if (X z) (Y z))))))` | `∀x. C(x) → D(x)` (the canonical form's body universal-implication; `(Class X)` and `(Class Y)` antecedents elided) |
| `Transitive(P)` | `(forall (R) (iff (TransitiveObjectProperty R) (and (OWLObjectProperty R) (forall (x y z) (if (and (R x y) (R y z)) (R x z))))))` | `∀x,y,z. P(x,y) ∧ P(y,z) → P(x,z)` (`(OWLObjectProperty R)` antecedent elided) |
| `InverseObjectProperties(P, Q)` | `(forall (R1 R2) (iff (InverseObjectProperties R1 R2) (and (OWLObjectProperty R1) (OWLObjectProperty R2) (forall (x y) (iff (R1 x y) (R2 y x))))))` | Bidirectional implication pair per ADR-007 §4: `∀x,y. P(x,y) → Q(y,x)` AND `∀x,y. Q(x,y) → P(y,x)` (both `(OWLObjectProperty)` antecedents elided) |

**Rationale.** Three points support the elision:

1. **Soundness w.r.t. OWL semantics.** Per OWL 2 Direct Semantics (§5.3), an IRI's role in an axiom (class position vs object-property position) is determined syntactically by where it appears. OFBT's encoding makes this implicit rather than explicit: the IRI's role is recoverable from its position in the lifted FOL. A consumer reasoning about the lifted FOL state can re-derive the typing from the term shape; no information is lost.

2. **Encoding cost vs. benefit.** Carrying meta-typing antecedents through every lifted axiom would roughly double the size of the FOL state for v0.1 corpus content and add a redundant universal-implication antecedent to every TBox axiom. The size cost is real (bundle budget per API §13.4); the benefit (explicit meta-typing) is recoverable from the term shape on demand.

3. **Layer separation per ADR-007 §1.** The lifter emits classical FOL semantics. Meta-vocabulary reification (if needed) is a Phase 4+ ARC-content concern, not a lifter concern. If a Phase 4+ consumer needs to query "is X a Class?", the consumer-side machinery walks the FOL state's term-shape, not a meta-typing axiom.

**Edge cases and forward-compat:**

- **Phase 4+ cross-ontology integrity checks.** If a consumer needs to verify "this IRI is used as a class in ontology A and as an object property in ontology B" (punning detection at consumer-side), the punning detector walks the FOL state's atom-shape. OFBT's lifter already rejects punning at lift time via `rejectPuntedConstructs` per spec §13.1; the §10 elision doesn't introduce a new punning vulnerability. Phase 1 punning detection is verified by `canary_punned_construct_rejection.fixture.js`.

- **v0.2 evolution.** If a future spec revision (post-v0.1) introduces a meta-vocabulary reification requirement (e.g., for a Phase 5+ ontology that relies on `(Class X)` as a load-bearing predicate), this ADR is revisited. v0.1 commits to the elision; v0.2 may add an opt-in reification mode via a new `LifterConfig.reifyMetaVocabulary?: boolean` field.

**Banked principle:** "Soundness w.r.t. OWL semantics is preserved as long as the syntactic role of an IRI is recoverable from its position in the lifted FOL. Explicit meta-typing antecedents are an encoding choice, not a soundness requirement — choose the encoding that minimizes state size." (Architect ruling at the BFO/CLIF parity routing cycle 2026-05-03.)

**Implementation status:** Implemented since Step 1 (the lifter has emitted classical-form bodies without meta-typing antecedents from the start). The §10 formalization documents the discipline rather than introducing new behavior. The `mappingNote` field on every `clifGroundTruth` entry that carries Layer A citations (`p1_bfo_clif_classical.fixture.js`'s 8 entries) explicitly documents the elision per-entry.

**Related discipline:** Section "Defense-in-Depth at Multiple Boundary Points" in `arc/AUTHORING_DISCIPLINE.md` covers the related pattern for ensuring the elision doesn't introduce silent corruption — `rejectPuntedConstructs` enforces at lift entry; downstream emit sites defensively guard.

### 11. FOL → Tau Prolog clause translation rule set [RESOLVED at Phase 3 Step 3 architectural-gap micro-cycle 2026-05-09; PROMOTED Draft → Accepted at Pass 2b cycle 2026-05-09]

Architect-ratified at the Phase 3 Step 3 architectural-gap micro-cycle 2026-05-09 (Q-3-Step3-B ruling). Promoted Draft → Accepted at Pass 2b architect cycle 2026-05-09 with eleven-of-eleven amendment-shape correspondence checks passing + 2 additional banked principles (explicit-reason-enum-stability-statement discipline + ADR-closing-section-update discipline) + cycle-accounting note (Pass 2b confirmation cycles do not increment counters). The per-variant translation rules were a documented gap pre-Step-3: ADR-007 §1 named cycle-guarded SLD ingestion as "Phase 3 evaluator's concern" but did not enumerate the per-FOLAxiom-variant rules that operationalize it. §11 fills that gap as a sibling section to §1 (lifter emits classical FOL) + §7 (n-tuple matcher) + §8 (RDFC-1.0 b-node Skolem prefix) + §10 (meta-vocabulary elision), preserving single-SHA audit-trail-per-architectural-surface per the Q-3-G banking.

**Decision:** Per-FOLAxiom-variant translation rules to Tau Prolog clauses, scoped per the Phase 3 step ledger (Q-3-A). Step 3 ships the minimum 5 variants (FOLAtom + FOLConjunction + FOLImplication + Skolem consumption + canonicalization); Steps 4 and 6 extend per the forward-tracks below.

**Per-variant translation table:**

| FOL variant | Translation strategy | Step scope | Reason code (when surfaced as evaluator result) |
|---|---|---|---|
| `FOLAtom` (P(t1, …, tn)) | **State assertion**: `assertz(p(T1, …, Tn))`. **EvaluableQuery goal**: `?- p(T1, …, Tn)`. Predicate IRI normalized via `canonicalIRI(p)` per §9 + spec §5.1. Variables → uppercase Prolog vars; constants → canonicalized atoms. | **Step 3 minimum** | n/a (success or no-derivation path) |
| `FOLConjunction` (P ∧ Q) | **EvaluableQuery**: `?- p(X), q(X)`. **Implication body**: `q(X) :- p(X), r(X)` (Prolog comma-separated body). | **Step 3 minimum** | n/a |
| `FOLImplication` (∀x. P(x) → Q(x)) | **State only** (lifter emits per §1; rejected at API §7.5 in queries). Universal absorbed by Prolog's implicit-universal-over-vars. Translated as Prolog rule: `q(X) :- p(X)`. Multiple antecedent atoms via comma-separated body. | **Step 3 minimum** | n/a |
| Skolem-constant existentials | Lifter Skolemizes per spec §5.7 + ADR-005; constants become deterministic Prolog atoms; existential implicit in unification at evaluator time. Step 3 consumes; no re-Skolemization. | **Step 3 minimum** | n/a |
| Variable + predicate-IRI canonicalization | Prolog atoms via `canonicalIRI(iri)` (deterministic per §9 reserved-predicate canonical form). Variables → Prolog uppercase vars with deterministic alpha-renaming for fresh vars. | **Step 3 minimum** | n/a |
| `FOLNegation` (¬P) | **EvaluableQuery**: rejected per API §7.5. **Implication body**: Prolog `\+ p(X)` (negation-as-failure). Spec §6.3 default-OWA: `\+ p` succeeding maps to `'undetermined'` (no proof) NOT `'false'`, UNLESS predicate `p` is in `closedPredicates`. **If in `closedPredicates`:** `\+ p` → `'false'` with reason **`inconsistent`** (REUSED existing reason code per Q-3-Step3-B refinement 1, 2026-05-09 — the closed-predicate NAF case is structurally a refutation under closed-world semantics, matching the existing `inconsistent` reason; no 18th `closed_world_negation` reason code introduced). **If predicate NOT in `closedPredicates`:** `'undetermined'` with reason `naf_residue` (matching the LossSignature `lossType` per API §6.4.1). | **Step 4 forward-track** (closedPredicates implementation) | `inconsistent` (closed-predicate); `naf_residue` (open-predicate default OWA) |
| `FOLDisjunction` (P ∨ Q) | **EvaluableQuery**: rejected per API §7.5. **Implication body**: Prolog `;` disjunction. **Implication head**: NOT native Prolog. **Per spec §8.5.4 (Q-3-Step3-B refinement 2, 2026-05-09 — explicit cross-reference):** "Sound for Horn-expressible contradictions. ... Incomplete for full SROIQ. A class may be unsatisfiable in OWL 2 DL via reasoning the Horn fragment cannot express (e.g., requires case analysis on a disjunction)." Per spec §8.5.1, disjunctive consequents are outside the Horn-checkable fragment; classes whose definitions involve them are classified `'undetermined'`/`coherence_indeterminate` per spec §8.5.2; offending axioms surface in `unverifiedAxioms` per API §8.1.1. **Translation rule:** skip Horn-resolution; mark axiom for `unverifiedAxioms` surfacing. **Flag-not-reject discipline** preserves §1's cycle-discipline (lifter emits classical FOL; evaluator surfaces non-Horn axioms honestly rather than the lifter rejecting them). | **Step 6 forward-track** (`unverifiedAxioms` surfacing) | `coherence_indeterminate` (when contributing to consistency check verdict) |
| `FOLEquality` (t1 = t2) | **EvaluableQuery**: rejected per API §7.5. **At lift level**: `same_as` predicate per spec §5.5 + ADR-010 with identity-rewrite rules. Prolog `=` is unification (different from classical equality); `==` is syntactic identity (also different). The same_as discipline handles state-level equality. | **Step 6 forward-track** (same_as discipline + No-Collapse interaction) | n/a (handled via same_as predicate; not a direct evaluator surface) |
| `FOLUniversal` in body (∀x. … in implication body) | Lifter never emits universal-in-body per §1 (universals at outermost binding only); body universals would be a punted construct rejected with `UnsupportedConstructError`. If encountered in `axiomSet` (hypothetical reasoning per API §8.1.2): outside Horn fragment per spec §8.5.1; surfaces as `unverifiedAxioms`. | **Out-of-Step-3 scope** (lift-time rejection per §1 + spec §13.1) | n/a (rejection at lift; or `coherence_indeterminate` if surfaced via axiomSet) |
| `FOLFalse` (⊥) | **EvaluableQuery**: rejected per API §7.5. **At checkConsistency level (Step 6)**: reified via `inconsistent` predicate per spec §8.5.2. Tau Prolog has no native `false`; `assertz(inconsistent)` is the contradiction-detection signal. | **Step 6 reserved** (checkConsistency machinery) | `inconsistent` |

**Implementation notes for Step 3 minimum:**

- The translation runs at `loadOntology` time per API §5.5 (the `loadOntology` composition function ratified at Q-3-Step3-A 2026-05-09): each lifted FOLAxiom in the `FOLConversionResult.axioms` array is translated to a Prolog clause and `assertz`'d into the session's Tau Prolog state.
- The translation is deterministic per the spec §0.1 + API §6.1.1 byte-stability contract: same FOL state translated in any order produces byte-identical Prolog clause set. The multi-ontology accumulation determinism per Q-3-Step3-A refinement 2 (order-independence across `loadOntology` calls) follows from the per-clause translation determinism.
- The cycle-guarded SLD ingestion per ADR-011 (visited-ancestor list) wraps the translation: each translated clause carries the visited-ancestor metadata at evaluator time. §1's "Phase 3 evaluator's concern" is operationalized by the ADR-011 wrapping, not by the per-variant translation rules in this section.

**Step 4 forward-track:** When Step 4 implements `closedPredicates` per API §6.3 + spec §6.3.2, the FOLNegation translation rule's closed-predicate branch wires up: predicates in `closedPredicates` get `\+ p` translation with the `inconsistent` reason code on succeeding NAF; predicates outside get the default-OWA `'undetermined'` + `naf_residue` reason.

**Step 6 forward-track:** When Step 6 implements `checkConsistency` + No-Collapse Guarantee per spec §8.5, the FOLDisjunction-in-head + FOLEquality (same_as) + FOLFalse (`inconsistent` reified) translation rules activate. The `unverifiedAxioms` surface per API §8.1.1 collects the axioms whose translation rule is "skip Horn-resolution; mark for unverifiedAxioms" (FOLDisjunction-in-head; FOLUniversal-in-body if surfaced via hypothetical reasoning).

**Reason enum stability:** The translation rules introduce no new reason codes. `inconsistent` and `naf_residue` exist in the v0.1.7-frozen reason enum; `coherence_indeterminate` exists. The closed-predicate NAF case reuses `inconsistent` per Q-3-Step3-B refinement 1 — this is a deliberate architectural choice to keep the reason enum stable (17 members per Q-3-C addition; no Phase 3 minor-version-bump beyond the `no_strategy_applies` addition).

**Banked principle from this section:** "FOL → Prolog translation rules are scoped per Phase Step. Each Step's implementation activates the variants its corpus exercises; forward-tracks document which Step ships which variant. The per-variant table is the canonical contract; deviations require ADR amendment with implementation evidence." (Architect-banked at Q-3-Step3-B ratification 2026-05-09; folds into AUTHORING_DISCIPLINE at Phase 3 exit doc-pass.)

---

**Context for ADR-007 as a whole:** Step 5 implementation surfaced three concrete needs for these conventions: (1) Functional/Transitive/Symmetric/InverseObjectProperties emission requires the variable-allocator and per-direction allocator-freshness conventions; (2) the `p1_property_characteristics` STRUCTURAL_ONLY placeholder fill-in commits the lifter to a byte-exact term-tree shape that becomes the determinism contract per API §6.1.1; (3) the cycle-guard layer-translation question (lifter vs evaluator responsibility) cannot be deferred — it is a load-bearing decision for what the FOL term tree is allowed to contain. Subsequent steps (Steps 6, 7, 8) added §§7-9 resolutions, Step 9.4 doc-pass formalizes §10, and Phase 3 Step 3 architectural-gap micro-cycle (2026-05-09) adds §11.

**Consequences:**
- Future contributors implementing Phase 1 Steps 6-9 (or any post-Phase-1 lifter extension) inherit these conventions; deviations require a follow-up ADR with implementation evidence.
- The Phase 3 evaluator's Prolog-rule-emission algorithm has a documented contract per §11: per-variant translation rules with Step-scoped activation; ingest classical-FOL term trees and apply the visited-ancestor cycle-guard at ingestion time per ADR-011 wrapping.
- ADR-007 sections §§1-10 are Resolved at Phase 1 exit; §11 is Resolved at Phase 3 Step 3 architectural-gap micro-cycle 2026-05-09. Phase 2+ extensions to ADR-007 land as new sections in the same document; pre-existing sections do not get re-litigated without architect-banked implementation evidence per spec §0.2.

---

## ADR-008: OFI deontic deferred from v0.1 to v0.2

**Date:** 2026-05-05 (drafted at v3.3 catalogue closeout per Orchestrator architectural concern; ratified Accepted at architect's bundled ADR-008 + ADR-009 routing cycle ruling 2026-05-05)

**Status:** Accepted (architect-ratified post-freeze spec change per spec §0.2.3, evidence-gated change category "consumer-facing breakage")

**Decision:** Remove `ofi/deontic.json` from spec §3.6.1's v0.1 ARC module list. The eight OFI deontic relation rows authored in `project/relations_catalogue_v3_3.tsv` (rows 129-136) are preserved with module assignment changed from `ofi/deontic` to `[V0.2-CANDIDATE]`; they do NOT compile to a v0.1 ARC module and are NOT loaded by the v0.1 build pipeline. OFI deontic content returns to scope at v0.2.

**Context.** v3.3 catalogue regeneration discipline surfaced that the eight OFI rows carry interim placeholder IRIs `ofi:0000001` through `ofi:0000008`. Finalization of these IRIs depends on the external Reified Constitutive Relations Specification §3 (referenced in spec §17.7), which has not yet published. Shipping placeholder IRIs in v0.1 creates a consumer-facing commitment OFBT cannot honor without the external spec's stabilization.

The Orchestrator (2026-05-05) raised the architectural concern: "OFI doesn't belong in v0.1 — it's not a real ontology in the BFO/CCO sense; it's OFBT-internally-minted content pending an external specification." Bundled with ADR-009 into one architect routing cycle.

**Implementation evidence per spec §0.2.3.** Falls under "consumer-facing breakage" evidence category:

- v3.3 catalogue's 8 OFI rows carry `[PROVENANCE-AUTHORED]` markers explicitly (no source ontology to verify against).
- Interim IRIs are not stable; the external spec may finalize them differently.
- Shipping placeholder IRIs in v0.1 commits downstream consumers to IRIs that may change at v0.2 — exactly what §0.2.3 evidence-gating exists to prevent.
- v0.1 test corpus does not currently exercise OFI deontic content (Phases 1-6 use BFO/CCO/IAO; only Phase 7 was scoped to exercise OFI). Removing OFI from v0.1 does not break any existing fixture.

**Architect ruling (verbatim, 2026-05-05):** "The evidence is exactly what §0.2.3 was designed to gate on... Treating OFI as a real ontology in v0.1 alongside BFO/CCO/IAO conflates two structurally different things: BFO/CCO/IAO are upstream-canonical with stable IRIs; OFI is OFBT-internal with provisional IRIs. Spec §3.6.1's module list should reflect that distinction. v0.2 is the right reintroduction point — when the external dependency has stabilized, OFI returns via a new ADR with implementation evidence."

**Phase 7 scope ruling (Option A):** Phase 7 retains scope reduction. Compatibility shim work + parallel-run mode + expected-divergence baseline + bundle budget CI gating + coverage matrix CI all stay in Phase 7. `constitution.ttl` Article I §2 pipeline rolls forward to Phase 8 as a verification-gate-prep deliverable. Phase 8 scope under Option A: Verification Gate Guide + Fandaws-side gate response + npm publish + tagged release + the rolled-forward `constitution.ttl` pipeline as the migration-discipline-demonstrating artifact.

**Banked principle (architect-ratified):** "When OFBT depends on an external specification that has not yet stabilized, OFBT does not ship dependent content in v0.1. The dependent content is authored as a v0.2 candidate and added back via ADR when the external dependency stabilizes." This generalizes spec §0.2.3 honest-admission discipline to external-dependency management. Folded into `arc/AUTHORING_DISCIPLINE.md` "External-dependency management — when v0.1 doesn't ship dependent content" subsection.

**Consequences (post-ratification implementation):**

- Spec §3.6.1 module list: `ofi/deontic.json` removed (editorial revision per §0.2.1)
- Spec §3.6.4 module dependencies: `ofi/deontic` removed from dependency graph
- ROADMAP Phase 7 scope: OFI deontic ARC module deliverable removed; compatibility shim retained
- ROADMAP Phase 8 scope: `constitution.ttl` Article I §2 pipeline rolled forward as verification-gate-prep deliverable
- Plan §3.8 (Phase 7) revised per Option A
- Plan §3.9 (Phase 8) revised to receive the rolled-forward `constitution.ttl` work
- Plan §1.3 (out of scope for v0.1): adds OFI deferral
- v3.3 catalogue rows 129-136: Module column flipped from `ofi/deontic` to `[V0.2-CANDIDATE]`
- `scripts/build-arc.js`: skip-`[V0.2-CANDIDATE]` logic added for v0.1 module emission
- `arc/AUTHORING_DISCIPLINE.md`: External-dependency management section added per banked principle
- ADR record: this entry, references architect ruling 2026-05-05

---

## ADR-009: Four new ARC modules added per v0.1 corpus evidence

**Date:** 2026-05-05 (drafted at v3.3 catalogue closeout; ratified Accepted at architect's bundled ADR-008 + ADR-009 routing cycle ruling 2026-05-05)

**Status:** Accepted (architect-ratified post-freeze spec change per spec §0.2.3, evidence-gated change category "consumer-facing breakage")

**Decision:** Add four ARC modules to spec §3.6.1's v0.1 module list:

| Module | Row count in v3.3 | Primary CCO content |
|---|---|---|
| `cco/measurement.json` | 8 | Measurement units, reference systems, time zones, geospatial coordinate reference systems |
| `cco/aggregate.json` | 5 | Object aggregate bearer-of, inheres-in-aggregate, capability-of-aggregate |
| `cco/organizational.json` | 14 | Affiliation, supervision, organizational context, subordinate roles, interest-bearing, delimitation |
| `cco/deontic.json` | 8 | CCO's deontic vocabulary: prescribes, prohibits, permits, requires (Directive→Action) |

**Context.** v3.3 catalogue regeneration (verified against loaded BFO 2020 + CCO + IAO triplestore via SPARQL) surfaced 35 CCO rows that do not fit the existing five-module taxonomy from spec §3.6.1. The deterministic module-assignment rule (namespace + property-path closure to BFO ancestor) places these rows in modules the spec doesn't currently enumerate.

**Implementation evidence per spec §0.2.3.** Falls under "consumer-facing breakage" evidence category:

- v0.1 CCO Geospatial test corpus exercises `is_geospatial_coordinate_reference_system_of` and `uses_geospatial_coordinate_reference_system`. These don't fit `cco/realizable-holding` or `cco/mereotopology`; they belong in `cco/measurement`.
- v0.1 CCO Agent test corpus exercises affiliation, supervision, organizational hierarchies. These don't fit `cco/realizable-holding`; they belong in `cco/organizational`.
- CCO aggregate vocabulary: collective bearer-of pattern doesn't fit `cco/realizable-holding`'s individual realizable-holding pattern. Belongs in `cco/aggregate`.
- CCO deontic vocabulary: distinct from OFI deontic. CCO covers Directive→Action; OFI (deferred per ADR-008) covers Directive→Issuing-Agent and the RDM v1.2.1 chain. Belongs in `cco/deontic`.

Without these four modules, 35 CCO rows have no valid module assignment in v0.1. Spec's five-module taxonomy is provably insufficient for v0.1's actual CCO content scope.

**Architect ruling (verbatim, 2026-05-05):** "The evidence is the v3.3 catalogue itself, which is the most rigorous evidence form §0.2.3 admits. The deterministic module-assignment rule's outputs are the evidence... Approving the four-module addition aligns the spec with what the deterministic rule produces, rather than forcing 35 rows into ill-fitting existing modules."

**Module dependencies (per spec §3.6.4 pattern):**

- `cco/measurement` depends on `core/bfo-2020` (uses `BFO_0000084` specifically_depends_on, `BFO_0000101` generically_depends_on)
- `cco/aggregate` depends on `core/bfo-2020` (Object Aggregate is a BFO category; multi-ancestor to `BFO_0000196` bearer_of and `BFO_0000194` specifically_depended_on_by)
- `cco/organizational` depends on `core/bfo-2020` (Organization is a BFO category)
- `cco/deontic` depends on `core/iao-information` (Directive is an Information Content Entity per IAO)

**Per-module size budgets (architect-ratified):**

- `cco/measurement.json` ≤ 8 KB minified
- `cco/aggregate.json` ≤ 5 KB minified
- `cco/organizational.json` ≤ 12 KB minified
- `cco/deontic.json` ≤ 8 KB minified

Architect's additional refinement: API spec §13.4 must enumerate the per-module caps so the Phase 7 bundle CI gate can enforce per-module rather than per-total. Current spec §13.4.1's "≤ 15-20 KB" generic optional-module size is insufficient documentation; v0.1.7.x patch updates §13.4 with the per-CCO-module table.

**Cross-module compatibility — `cco/deontic` vs `ofi/deontic`:** load-bearing distinction even with ADR-008's OFI deferral. CCO covers Directive→Action; OFI covers Directive→Issuing-Agent. v0.1 ships `cco/deontic` only; v0.2's eventual OFI re-introduction adds `ofi/deontic` alongside (not replacing). Naming distinction matters now, not just at v0.2. Folded into `arc/AUTHORING_DISCIPLINE.md` "CCO vs OFI deontic distinction" subsection.

**Banked principle (architect-ratified):** "When v0.1 implementation reveals that the spec's module taxonomy is insufficient for the actual content scope, the taxonomy expands via §0.2.3 evidence-gated change rather than the content being forced into ill-fitting existing modules. The deterministic module-assignment rule's outputs are the evidence." Generalizes the §0.2.3 discipline beyond OFI/external-dependency cases to any case where deterministic-rule outputs disagree with frozen-spec taxonomy.

**Consequences (post-ratification implementation):**

- Spec §3.6.1 module list: four modules added (editorial revision per §0.2.1; combined with ADR-008's removal, list grows from 5 to 8)
- Spec §3.6.4 module dependencies: four new dependency entries
- API spec §13.4: per-CCO-module size budget table enumerated; CI gate enforces per-module caps
- ROADMAP Phase 6 scope: extended to six CCO modules (original two + four new)
- Plan §3.7 (Phase 6) revised
- `scripts/lint-arc.js`: `MODULE_DEPS` map extended with four new modules
- `scripts/build-arc.js`: four new module emitters
- `arc/AUTHORING_DISCIPLINE.md`: "CCO vs OFI deontic distinction" subsection added per banked principle
- ADR record: this entry, references architect ruling 2026-05-05

---

## Bankable observations from the bundled ADR-008 + ADR-009 routing cycle

**Cycle-density mid-vs-between-phase distinction (architect-banked 2026-05-05).** Mid-phase escalations and between-phase architectural cycles are different cadence categories. The same numeric count at different positions has different implications. Phase 1's mid-phase count: 3 (Step 4 fixture amendment, Step 5 ADR-007 + reserved-predicate, BFO/CLIF parity initial) plus 1 cycle-completion (BFO/CLIF Layer A correction). Between-phase count: 1 (this ADR-008 + ADR-009 cycle). Future Phase 2+ mid-phase cycles weigh against Phase 1's 3, not against the cumulative 5. Between-phase cycles increment a separate counter.

**External-dependency management discipline.** Per ADR-008 banked principle. v0.1 does not ship content dependent on unstable external specifications. Pattern: author the dependent content as `[V0.2-CANDIDATE]` in catalogue; do not include in v0.1 ARC module compilation; reintroduce via new ADR when external dependency stabilizes.

**Module taxonomy expansion via deterministic-rule evidence.** Per ADR-009 banked principle. When deterministic-rule outputs disagree with frozen-spec taxonomy, the spec expands via §0.2.3 evidence-gated change rather than forcing content into ill-fitting existing modules.

---

## ADR-010: Vendored canonical source license-verification corrective action — owl-axiomatization.clif sidecar (CC BY 4.0)

**Status:** Accepted (architect re-confirmation 2026-05-06)
**Date:** 2026-05-06
**Predecessors:** ADR-007 (Phase 1 architectural commitments); architect-banked SME-Persona Verification of Vendored Canonical Sources discipline (Phase 1 Step 9.2 close, formalized at Step 9.4 doc pass `c0e2eea`).
**Successor:** None pending. Discipline tightening folds into AUTHORING_DISCIPLINE.md "SME-Persona Verification of Vendored Canonical Sources" subsection per Decision section 3 below.

### Context

`arc/upstream-canonical/owl-axiomatization.clif.SOURCE` (committed at `a5b1189` 2026-05-03) carried `license: BSD-3-Clause` and an `upstream-version: master at commit 783a3f7 (or latest as of retrieval)` reference. The license assertion was based on a layperson reading of the file's preamble note "the repo-level LICENSE governs" without an actual fetch of the upstream LICENSE file.

The Phase 1 closeout forward-tracked a license-verification gate item to Phase 2 entry per Option A. The architect's 2026-05-06 ruling on the Phase 2 entry packet promoted this gate item to a pre-Step-1 hard prerequisite (entry-packet §6.1).

The Phase 2 entry verification ritual ran on 2026-05-06 against the BFO-ontology/BFO repo via direct API fetch. It surfaced:

- **Actual license:** CC BY 4.0 (Creative Commons Attribution 4.0 International), NOT BSD-3-Clause. LICENSE file at commit `294fa4167f2e59784abb1e1abb9467f7de37b0cd` (created 2022-04-19, "Create LICENSE" — OBO-Foundry initiative PR), SHA-256 `f5b745ef98087f531e719ee8ca6a96809444573ecc7173c6fa68eaad39b3cc3f`, 395 lines, first line "Attribution 4.0 International".
- **Asserted commit `783a3f7` does not exist** in BFO-ontology/BFO (GitHub Search Commits API: total_count: 0; direct API: 422). The actual CLIF-file last-modification commit is `7bb52bd46d73ad61cb9fbfae591bd4203e446dcb` (2013-03-19, "CLIF axiomatization of OWL from Fabian (draft)"). File byte-stable since.
- **CLIF file content SHA-256 intact:** `480193e976720fef74b68acda7883b095f3bf4666a1b091c5204b58d78035912` matches upstream master HEAD `857be9f15100531c7202ef0eb73142f95b70f3a7` at verification time.

The CLIF file content provenance is sound (Phase 1 Step 9.2 SME-persona content verification against the file's actual semantics remains valid). The license-related metadata and commit-SHA reference are wrong.

### Decision

Adopt five coordinated corrective actions (the five-way-aligned Commit 3 + two architect-added developer items):

1. **Sidecar correction** — `arc/upstream-canonical/owl-axiomatization.clif.SOURCE` updated:
   - `upstream-version` split into `upstream-version-file-stable-since` (`7bb52bd…`) + `upstream-version-master-head-at-verification` (`857be9f1…`)
   - `license: BSD-3-Clause` → `license: CC-BY-4.0` + `license-url: https://creativecommons.org/licenses/by/4.0/`
   - `attribution` rewritten to satisfy CC BY 4.0 (license link, attribution to original creator, source citation)
   - `modifications-to-vendored-file` field added (none; byte-stable since 2024-05-23 retrieval)
   - `license-compatibility` rewritten to address CC BY 4.0 attribution + change-disclosure requirements + downstream-redistribution flag for forks + npm-package files-field cross-reference
   - New `license-verification` block populated with verified canonical values (full schema in entry-packet §6.1 + the corrected sidecar)

2. **Entry-packet §6.1 correction** — four edits (2a/2b/2c/2d) in [`project/reviews/phase-2-entry.md`](reviews/phase-2-entry.md):
   - Contract quote framing
   - Current-state framing acknowledging the verified discrepancy
   - YAML structure populated with verified canonical values
   - Discrepancy-active acknowledgment subsection ("the discipline functioned as designed")

3. **Discipline tightening** — [`arc/AUTHORING_DISCIPLINE.md`](../arc/AUTHORING_DISCIPLINE.md) "SME-Persona Verification of Vendored Canonical Sources" subsection adds (a) second originating example documenting the license-type defect catch and (b) tightened discipline requiring license-verification at vendoring time, NOT first-use time. **The discipline applies to all vendored canonical sources regardless of format** (CLIF, KIF, OWL, TTL, RDF/XML, JSON-LD, etc.) per architect Q-β refinement 2026-05-06. Phase 4 BFO 2020 CLIF Layer B vendoring + Phase 5 IAO + Phase 6 CCO 2.0 + all subsequent phase vendoring inherit this discipline regardless of source format.

4. **ROADMAP Phase 4 entry checklist** — [`project/ROADMAP.md`](ROADMAP.md) Phase 4 entry checklist gains the architect-ratified item: "Phase 4 BFO 2020 CLIF Layer B vendoring sidecar (`arc/upstream-canonical/bfo-2020.clif.SOURCE` or successor path) ships with a populated, verified `license-verification` block in the first commit landing the vendored source. Verification per `arc/AUTHORING_DISCIPLINE.md` 'SME-Persona Verification of Vendored Canonical Sources' subsection. The verification ritual runs at vendoring time, not first-use time."

5. **`package.json` `files`-field whitelist** — [`package.json`](../package.json) gains a `files` field whitelisting only the npm-distribution-essential paths (`dist/` and any other runtime artifacts). This excludes `arc/upstream-canonical/` from the npm package, bounding the CC BY 4.0 compliance scope to the GitHub repo per architect Q-α ruling 2026-05-06. Fork authors who alter the `files` field to include `arc/upstream-canonical/` inherit the CC BY 4.0 obligations downstream.

### Consequences

**Positive:**
- License compliance restored: CC BY 4.0 attribution + license link satisfied per the sidecar's updated `attribution`, `license`, and `license-url` fields.
- Discipline first-production-catch documented: future SME-persona verification rituals inherit the originating-example-with-defect-caught.
- Format-agnostic discipline tightening: future vendoring (Phase 4 BFO 2020 CLIF, Phase 5 IAO, Phase 6 CCO 2.0 in TTL or other formats, future v0.2 vendoring) ships with verified `license-verification` block from the first commit; first-use-time-verification gap closed across all formats.
- npm-distribution scope bounded: `arc/upstream-canonical/` excluded from the published artifact per `files`-field whitelist; CC BY 4.0 compliance scope is the GitHub repo only.

**Negative:**
- Phase 2 entry confirmation cycle required architect re-confirmation with corrected facts (this ADR + the four coordinated amendments + two developer items).
- Slight delay to the four-way-aligned Commit 3 (now five-way-aligned per architect ruling, including this ADR + the corrected sidecar + AUTHORING_DISCIPLINE update + ROADMAP Phase 4 entry-checklist item + `package.json` `files`-field whitelist) and to Phase 2 implementation Step 1.

**Neutral:**
- The original `attribution` text in the sidecar remains substantively correct (Fabian Neuhaus, Barry Smith, Chris Mungall as primary contributors); only the license-frame metadata required correction.
- The CLIF file content itself is unaffected; Phase 1 Step 9.2 SME-persona content verification against the file's actual semantics remains valid (SHA-256 intact at `480193e9…5912`).
- ADR-010 is corrective-action ADR scope — it documents this specific corrective cycle and the discipline tightening derived from it. A separate "vendoring policy ADR" (general policy beyond the discipline tightening) is NOT folded into ADR-010 per architect ruling 2026-05-06; if wanted, that routes as its own cycle.

### Banked principles

1. **License-verification at vendoring time, not first-use time.** Vendoring discipline requires SME-persona verification of upstream license + commit SHA + LICENSE file SHA-256 BEFORE the first commit landing the vendored source. The verified `license-verification` block ships in the first commit. AUTHORING_DISCIPLINE.md folding-in records this.

2. **License-verification-at-vendoring-time discipline applies to all vendored canonical sources regardless of format.** CLIF, KIF, OWL, TTL, RDF/XML, JSON-LD, etc. — the verification ritual is uniform; the license-verification fields' shape adapts to the license type. Per architect Q-β refinement 2026-05-06.

3. **Layperson reading of upstream license preambles is unverified-against-canonical.** A note like "the repo-level LICENSE governs" inside the vendored file is a hint, not a verified fact. Verification ritual MUST fetch the actual LICENSE file at the target commit and confirm its bytes.

4. **Commit SHA references in sidecars require verified existence.** Asserting a commit SHA without confirming its existence in the upstream repo (via GitHub Search Commits API or direct repo fetch) is unverified-against-canonical. The verification ritual confirms the SHA exists AND points to the asserted file at the asserted location.

5. **The verification gate's first production catch is banking-worthy.** The SME-Persona Verification of Vendored Canonical Sources discipline has paid dividends in real time (3-day latency between defect introduction and discipline-driven catch). Future phases inherit the discipline AND the originating-example-with-defect-caught.

6. **Borderline corrective actions default to ADR, not amendment-only.** Generalization of the Q6 schema-evolution discipline ("default to heavier path") to corrective-action discipline. Per architect Q-β ruling 2026-05-06: when a corrective action straddles "amendment vs ADR" routing, default to ADR. Borderline resolved cleanly via ADR-010.

7. **Discipline first-production-catches are architecturally significant and warrant ADR-level documentation.** Generalization of the SME's Q-β reasoning. The SME-Persona Verification discipline shifted from "zero defects in Phase 1 Step 9.2" to "one license-type defect at Phase 2 entry verification ritual"; the originating-example-with-defect-caught is more pedagogically useful than the discipline framing alone for future phases inheriting the discipline.

8. **v0.2 distribution-model change is the legal-review trigger.** Per architect Q-α ruling 2026-05-06: if v0.2 introduces a runtime ARC manifest loaded directly from `arc/upstream-canonical/` paths (currently the manifest is bundled as JSON-LD modules per spec §3.6), the distribution model changes and CC BY 4.0 obligations may extend into the runtime artifact. That is the natural trigger for a formal legal review pass. v0.1's moderate compatibility analysis in the sidecar suffices until then.

9. **Per-phase entry cycles can have corrective-action sub-cycles when verification gates surface defects; the sub-cycle stays within the entry-cycle bucket.** Per architect cycle-cadence ruling 2026-05-06. The corrective-action sub-cycle (this ADR + amendments) increments per-phase entry-cycle effort, not the cadence-density mid-phase or between-phase counters. Phase entry cycles remain a separate cadence category from mid-phase escalations and between-phase architectural cycles.

### Implementation evidence

- **Verified canonical facts table (Orchestrator routing 2026-05-06):**
  - LICENSE file path: `/LICENSE` at repo root
  - LICENSE type: CC BY 4.0 (Creative Commons Attribution 4.0 International)
  - LICENSE first line: "Attribution 4.0 International"
  - LICENSE SHA-256: `f5b745ef98087f531e719ee8ca6a96809444573ecc7173c6fa68eaad39b3cc3f`
  - LICENSE line count: 395
  - LICENSE creating commit: `294fa4167f2e59784abb1e1abb9467f7de37b0cd` (2022-04-19, "Create LICENSE" — OBO-Foundry initiative PR)
  - Asserted commit `783a3f7`: does not exist in BFO-ontology/BFO (Search Commits API: total_count: 0; direct API: 422)
  - CLIF file last-modification commit: `7bb52bd46d73ad61cb9fbfae591bd4203e446dcb` (2013-03-19, file byte-stable since)
  - CLIF file SHA-256: `480193e976720fef74b68acda7883b095f3bf4666a1b091c5204b58d78035912` (matches existing sidecar)
  - Master HEAD at verification: `857be9f15100531c7202ef0eb73142f95b70f3a7`
- **Source:** GitHub API direct fetch from BFO-ontology/BFO repository on 2026-05-06.

### Cross-references

- Entry-packet §6.1 — license-verification gate item full artifact spec
- AUTHORING_DISCIPLINE.md "SME-Persona Verification of Vendored Canonical Sources" subsection — discipline tightening + second originating example documented
- ROADMAP.md §Phase 4 entry checklist — gains item per Decision section 4 above
- `arc/upstream-canonical/owl-axiomatization.clif.SOURCE` — corrected sidecar with populated `license-verification` block
- `package.json` `files` field — whitelist excluding `arc/upstream-canonical/` from npm package per Decision section 5
- Re-confirmation cycle architect ruling (verbatim, 2026-05-06): preserved in entry-packet §9 + this ADR's Decision section.

---

## ADR-011: Audit-artifact `@id` content-addressing scheme — LossSignature + RecoveryPayload

**Status:** Accepted (architect ratification 2026-05-07 — Step 4 spec-binding routing cycle's brief follow-up confirmation cycle; per architect cadence-banking, this completion does not increment the Phase 2 mid-phase counter)
**Date:** 2026-05-07
**Predecessors:** ADR-002 (kernel purity allowlist — `crypto.subtle.digest` for SHA-256); ADR-007 §1 (lifter emits classical FOL — determinism precedent); API §6.4 (audit artifact types frozen at v0.1.7); Phase 2 entry packet §6.2 (Q6 three-tier schema-evolution discipline, architect-ratified 2026-05-06).
**Successor:** None pending. Future audit-artifact types (ProofTrace per API §6.4.3; ConsistencyResult per Phase 3 spec §8) extend this discipline forward; their discriminating-field sets land in successor ADRs or extensions of this one.

### Context

API §6.4.1 + §6.4.2 introduce LossSignature and RecoveryPayload types with `@id` fields specified as content-addressed:

- **LossSignature:** `ofbt:ls/<hash>` (per API §6.4.1)
- **RecoveryPayload:** `ofbt:rp/<hash>` (per API §6.4.2)

Spec §7.5 names the convention but does NOT formalize:

1. The hash function (assumed SHA-256 per kernel determinism discipline + ADR-002 allowlist)
2. The exact discriminating-field set per type
3. The hex-case + string-encoding conventions
4. The byte-stability contract scope (cross-run / cross-process / cross-installation)
5. The schema-evolution discipline for changing the discriminating-field set

Step 4 (Annotated Approximation strategy + LossSignature emission per Phase 2 entry packet §3.2 + §6.1.3) cannot ship without these formalized — two implementations differing in canonicalization choice would produce different `@id`s for byte-identical inputs, violating spec §0.1's determinism contract and breaking deduplication across consumers + CI runs.

The Phase 2 Step 4 spec-binding routing cycle (SME-routed 2026-05-07; architect-ratified Q-E / Q-G / ADR-011 / Q-D in the same cycle) named the formalization as ADR-011-tier work. The architect's ruling on ADR-011 scope: "SHA-256 of stableStringify({originalFOL, relationIRI, approximationStrategy}) for RecoveryPayload; corresponding scheme for LossSignature per the existing API §6.4.1 contract; lower-case hex; prefixed `ofbt:rp/` and `ofbt:ls/` respectively."

### Decision

Adopt the following audit-artifact `@id` content-addressing scheme.

#### 1. Hash function: SHA-256, lower-case hex digest

The 64-character lower-case hex string forms the `<hash>` portion of the `@id`. Computed via `crypto.subtle.digest('SHA-256', utf8Bytes)` per the kernel purity allowlist (ADR-002 — `crypto.subtle.digest` permitted for deterministic SHA-256; `crypto.getRandomValues` and `crypto.randomUUID` remain forbidden).

Hex casing: lower-case throughout. The regex `/^[0-9a-f]{64}$/` validates the `<hash>` portion. Mixed-case or upper-case hex is a violation of this ADR.

#### 2. Hash input: `stableStringify` of discriminating-field object

The hash is computed over `stableStringify(<discriminating-fields-object>)` per the existing kernel `canonicalize.ts` discipline. `stableStringify` produces:

- Lexicographically-sorted JSON keys at every nesting level
- No whitespace variation (no leading/trailing spaces; no newlines; minified separators)
- Canonical UTF-8 byte encoding
- Deterministic across runs, processes, OFBT installations at the same library + ARC manifest version

The UTF-8 bytes are passed to `crypto.subtle.digest`; the resulting `ArrayBuffer` is converted to lower-case hex via the standard byte-to-hex conversion.

#### 3. Discriminating-field set per type

##### 3.1 LossSignature (`ofbt:ls/<hash>`)

```typescript
{
  lossType: LossType,                    // 8-member discriminator per LOSS_SIGNATURE_SEVERITY_ORDER
  relationIRI: string,                   // full URI form per API §3.10.3 (not CURIE)
  reason: string,                        // machine-code reason (e.g., "negation_over_unbound_predicate")
  provenance: {
    sourceGraphIRI: string,              // full URI of the source ontology graph
    arcVersion: string                   // ARC manifest version active at emission time
    // NOTE: timestamp INTENTIONALLY EXCLUDED — see §7 below
  }
}
```

Rationale per discriminating field:

- **`lossType`** discriminates emissions of different severity / category on the same axiom (e.g., a single axiom could in principle trigger both `naf_residue` and `unknown_relation` if the negated predicate is also unbound; each gets a distinct `@id`).
- **`relationIRI`** discriminates emissions on different relations sharing the same `lossType` and `reason`.
- **`reason`** discriminates emissions on the same relation under different trigger conditions (a single relation could trigger `naf_residue` via multiple distinct conditions in future Phase 3+ contexts).
- **`provenance.sourceGraphIRI`** discriminates emissions on the same relation across different source ontologies. Two consumers emitting from different graphs produce distinct `@id`s.
- **`provenance.arcVersion`** discriminates emissions across ARC manifest version boundaries. Same FOL + same relation but different ARC manifest versions can produce semantically-different emissions (because the relation's known-relation classification differs); the `@id` reflects this.

##### 3.2 RecoveryPayload (`ofbt:rp/<hash>`)

```typescript
{
  originalFOL: <canonicalized FOL axiom>,    // per kernel canonicalize.ts canonicalization
  relationIRI: string,                       // full URI form per API §3.10.3
  approximationStrategy: ProjectionStrategy  // "annotated-approximation" | future strategies
}
```

Per architect ruling 2026-05-07. Rationale per discriminating field:

- **`originalFOL`** is load-bearing — without it, two RecoveryPayloads with the same relation but different FOL content (e.g., different cardinality counts on the same property under future Phase 3+ contexts) would dedupe to the same `@id`.
- **`relationIRI`** discriminates payloads on different relations sharing the same FOL shape.
- **`approximationStrategy`** discriminates payloads where the same FOL+relation could in principle route to different strategies under different config (e.g., a future config flag changing `naf_residue` to bypass Annotated Approximation).

#### 4. Byte-stability contract

Same input → same `@id` across runs, across processes, across OFBT installations at the same library + ARC manifest version. This is a hard contract per spec §0.1's determinism discipline.

Specifically:

- LossSignatures with byte-identical discriminating fields produce byte-identical `@id`s. Deduplication across consumers, across CI runs, across OFBT-bundle environments (browser / Node / edge) is guaranteed.
- RecoveryPayloads with byte-identical discriminating fields produce byte-identical `@id`s.
- Across major versions of OFBT that change the discriminating-field set per §5: `@id`s diverge by definition. This is intentional — see §5.

#### 5. Schema-evolution discipline (per Q6 three-tier — discriminating-field-set changes)

Changes to the discriminating-field set per type are governed by Phase 2 entry packet §6.2's Q6 three-tier discipline, with one additional constraint:

> **Discriminating-field-set changes are §0.2.3 evidence-gated — major version bump — REGARDLESS of the type-schema change category.**

Rationale: even an "additive optional field" added to the discriminating set changes `@id` computation for new inputs. Cross-version deduplication breaks. The schema-stability rules from API §6.4.1 (additive = minor; reorder/remove/rename = major) apply to the TYPE schema, but the DISCRIMINATING-FIELD SET is more sensitive — any change is consumer-breaking.

Specifically:

- **Adding a field to the discriminating-field set:** §0.2.3 evidence-gated change. ADR with implementation evidence. Major version bump.
- **Removing a field from the discriminating-field set:** §0.2.3 evidence-gated change. Major version bump.
- **Renaming a field in the discriminating-field set:** §0.2.3 evidence-gated change. Major version bump.
- **Changing the canonicalization rule for a nested object within a discriminating field:** case-by-case, defaulting to §0.2.3 unless provably non-breaking (per Q6 third tier).
- **Changing the hash function (e.g., SHA-256 → SHA-512):** §0.2.3 evidence-gated change. Major version bump (changes ALL `@id`s).

Per architect Q6 banking 2026-05-06: "default to heavier path." Applies here.

#### 6. Empty-array vs absent-field convention (kernel canonicalize.ts inheritance)

For RecoveryPayload's `originalFOL` field: the FOL axiom is canonicalized per kernel `canonicalize.ts` rules before stableStringify. Empty arrays are `[]` (NOT `null`, NOT absent). Optional fields are absent (NOT `null`, NOT `undefined`).

For nested objects within discriminating fields: stableStringify recursively applies the same key-sorting + no-whitespace + UTF-8 rules at every level.

#### 7. Excluded fields (do NOT participate in `@id` discrimination)

The following fields are INTENTIONALLY EXCLUDED from the discriminating-field set:

- **`provenance.timestamp` (LossSignature):** Timestamps would defeat byte-stability — every emission would produce a unique `@id`. Cross-CI-run deduplication requires byte-identical `@id`s for byte-identical inputs. Consumers needing temporal provenance can index LossSignatures by emission time externally.
- **`reasonText` (LossSignature):** Free-text human-readable explanation; redundant with `reason` for discrimination. Two emissions with identical `reason` but stylistically-different `reasonText` are semantically the same emission; `@id` should match.
- **`@type` (both):** Constant per type (`"ofbt:LossSignature"` / `"ofbt:RecoveryPayload"`); excluding it from discriminating fields keeps the hash input compact.
- **`@id` (both):** Self-referential; trivially excluded.
- **Future free-text descriptive fields:** Per the precedent set by `reasonText`'s exclusion, future free-text fields added to LossSignature / RecoveryPayload schemas SHOULD NOT enter the discriminating set unless they discriminate semantic content (in which case they're not free-text).

### Consequences

**Positive:**

- Step 4 implementation has a stable `@id` contract; no canonicalization ambiguity. Two implementations of `folToOwl` that follow this ADR will produce byte-identical `@id`s on byte-identical inputs.
- Cross-consumer deduplication: two consumers emitting LossSignatures from the same FOL input produce identical `@id`s; downstream tools indexing by `@id` (e.g., DP-2 records per spec §15.4) deduplicate cleanly across consumers.
- Cross-CI-run reproducibility: same fixture inputs produce same `@id`s; CI snapshots are byte-stable; the 100-run determinism harness (per API §6.1.1) extends to audit artifacts cleanly.
- Phase 3+ audit artifacts (ProofTrace per API §6.4.3, future ConsistencyResult per spec §8) can extend the same discipline forward; the discriminating-field-set discipline + Q6 three-tier evolution rules are reusable.
- The architect-banked principle "audit-artifact `@id` content-addressing is architectural-commitment-tier" is the same tier as ADR-007 §1's lifter-emits-classical-FOL ruling — non-negotiable, ADR-routed for future evolution.

**Negative:**

- Schema-evolution friction: changing the discriminating-field set is a major version bump per §0.2.3. Future evolutionary pressure (e.g., adding a new severity level requires LOSS_TYPE addition per existing API §6.4.1, but that's a minor bump per the type-schema discipline; if the new type is added to the discriminating set, this ADR's §5 says major bump). This is intentional but increases the routing cost of evolutionary changes.
- Implementation cost at Step 4: the canonical-stringification + SHA-256 computation must be deterministic across browser-vs-Node bundles. The `crypto.subtle.digest` allowlist (ADR-002) covers both runtimes; verified at Step 4 implementation time.
- The `provenance.timestamp` exclusion means LossSignatures emitted at different times for the same input deduplicate by `@id`. Consumers wanting temporal provenance must index externally; this is consumer-side cost.

**Neutral:**

- The `@id` is not human-readable; consumers wanting human-readable identifiers use the `reason` field (LossSignature) or the `relationIRI` field (both).
- Future v0.2 may extend the discriminating-field set per §0.2.3; that's a major version bump per the schema-evolution discipline. Banked: this is the right friction for a load-bearing contract.
- The `originalFOL` field's canonicalization depends on kernel `canonicalize.ts`; that's a separate component with its own discipline. If `canonicalize.ts` changes its canonicalization rules in a way that affects `originalFOL` byte representation, this ADR's §5 third-tier (case-by-case) applies.

### Banked principles

1. **Audit-artifact `@id` content-addressing is architectural-commitment-tier per spec §0.1.** Same tier as ADR-007 §1's lifter-emits-classical-FOL ruling. Determinism and byte-stability are non-negotiable; deviations require ADR-level routing.

2. **Discriminating-field-set changes are §0.2.3 evidence-gated regardless of type-schema change category.** "Default to heavier path" applies. Q6 three-tier discipline governs, with the additional constraint that ANY discriminating-field-set change is at least §0.2.3-tier.

3. **Timestamp fields are NOT in the discriminating set.** Temporal provenance is consumer-side concern; `@id` determinism takes precedence. Generalizes to any field whose value is non-deterministic relative to the FOL+relation+strategy input triple.

4. **`stableStringify` is the canonical canonicalization for hash-input.** Per kernel `canonicalize.ts`. Lexicographic key sorting; no whitespace variation; UTF-8 byte encoding. Reusable across all audit-artifact types.

5. **Future audit-artifact types extend the same discipline.** ProofTrace per API §6.4.3, ConsistencyResult per Phase 3 spec §8, and any v0.2+ types inherit the `@id` content-addressing pattern. Per-type discriminating-field sets land in successor ADRs or extensions of this one.

6. **Free-text descriptive fields SHOULD NOT enter the discriminating set unless they discriminate semantic content.** Generalization of the `reasonText` exclusion. Future schema additions follow this precedent; if a free-text field is added to the discriminating set, justify in the ratifying ADR.

### Implementation evidence

- Phase 2 Step 4 implementation will instantiate the `@id` generation per this ADR; `tests/projector-phase2.test.ts` will exercise the byte-stability contract via 100-run determinism harness extension (per API §6.1.1) — same input × 100 runs produces 100 byte-identical `@id`s.
- Phase 2 fixture `tests/corpus/p2_lossy_naf_residue.fixture.js` (corpus commit pending Developer dispatch as of this ADR's Draft authoring) declares its `expected_v0.1_verdict.expectedLossSignatures[0]` with shape-fingerprint regex `/^ofbt:ls\/[0-9a-f]{64}$/` — verifies the `@id` format produced by this ADR.
- Phase 2 fixture `tests/corpus/p2_unknown_relation_fallback.fixture.js` (forthcoming per architect Q-G ruling 2026-05-07; +1 fixture authorized) will exercise the same `@id` format for the `unknown_relation` LossType.
- Future Phase 3+ ProofTrace and ConsistencyResult `@id`s extend this discipline.

### Cross-references

- API §6.4.1 (LossSignature schema with content-addressed `@id` specified)
- API §6.4.2 (RecoveryPayload schema with content-addressed `@id` specified)
- API §6.4.3 (ProofTrace — successor inheritance candidate)
- spec §7.5 (content-addressed `@id` discipline framing)
- spec §0.1 (determinism contract)
- ADR-002 (kernel purity allowlist — `crypto.subtle.digest` for SHA-256)
- ADR-007 §1 (lifter emits classical FOL — determinism precedent; same architectural-commitment tier)
- Phase 2 entry packet §6.2 (Q6 three-tier schema-evolution discipline)
- Phase 2 entry packet §3.2 (`p2_lossy_naf_residue` fixture spec)
- `src/kernel/canonicalize.ts` (`stableStringify` implementation)
- `src/kernel/projector-types.ts` (LossType enum + LossSignature/RecoveryPayload interfaces + frozen `LOSS_SIGNATURE_SEVERITY_ORDER`)
- Step 4 spec-binding routing cycle architect rulings 2026-05-07 (preserved in ADR commit body + this ADR's Decision section)

### Architect ratification (2026-05-07) — Q-rulings + additional banked principles

Architect-routing 2026-05-07 ratified ADR-011 Draft → Accepted. Five Q-rulings (one per ADR section); three additional banked principles surfaced from the ratification cycle's analysis. Recorded for traceability.

**Q-rulings (verified shape):**

| Q | Topic | Architect ruling |
|---|---|---|
| Q-1 | LossSignature 5-field discriminating set | CONCUR — each field's load-bearing role audited and confirmed |
| Q-2 | RecoveryPayload 3-field discriminating set | CONCUR — preserved from Step 4 spec-binding cycle ratification |
| Q-3 | Stricter-than-Q6 schema-evolution discipline (§5) | CONCUR — strictening is correct; behavioral-contract evolution is more sensitive than schema-contract evolution |
| Q-4 | Excluded-fields list + future-free-text generalization (§7) | CONCUR — exclusion criteria sound; generalization principle approved |
| Q-5 | Commit shape (Option A standalone vs Option B bundled into Step 4a) | Developer-domain; weak architect preference for Option B (bundled) per audit-trail unity; either path accepted |

**Three additional banked principles from this ratification cycle (forward-folding to AUTHORING_DISCIPLINE at Phase 2 exit doc-pass):**

#### Banked principle (architect Q-1 audit) — Hierarchical schema fields enter the discriminating-field set at their hierarchical position

When a discriminating field is itself a structured object (e.g., `provenance: {sourceGraphIRI, arcVersion}` in LossSignature), the discriminating-field-set entry is the **hierarchical reference** (`provenance`), not promoted top-level fields. The `stableStringify` canonicalization preserves the hierarchy, and the byte-stability contract operates on the hierarchical canonicalization. Promotion (e.g., flattening to top-level `sourceGraphIRI` + `arcVersion`) would fragment the discriminator and risk discrepancies if the underlying `provenance` schema gains additional fields (those new fields would be silently outside the discriminator).

Architect's words: "Hierarchical schema fields enter the discriminating-field set at their hierarchical position rather than being promoted; the canonical-stringify output preserves the hierarchy and the byte-stability contract operates on the hierarchical canonicalization."

Generalization: this principle applies to any future discriminating-field-bearing audit artifact. Folding into AUTHORING_DISCIPLINE under "Audit-artifact content-addressing discipline" alongside the §7 exclusion criteria.

#### Banked principle (architect Q-3 strictening) — Behavioral contracts follow stricter evolution discipline than schema contracts

Q6's three-tier discipline (additive-optional / required-or-rename-or-remove / case-by-case) governs **schema contracts** — what fields exist, what required-vs-optional means, what enum members are allowed. The **discriminating-field set** is a **behavioral contract** orthogonal to the schema contract — it specifies how content-addressing is computed. Two distinct contracts; the stricter rule applies to the behavioral contract because the behavioral contract is the load-bearing one for cross-installation byte-stability.

Architect's words: "Behavioral contracts (e.g., content-addressing computation) are governed by stricter evolution discipline than schema contracts (e.g., field shapes), even when the underlying type definition is shared. §0.2.3 evidence-gating applies to behavioral-contract changes regardless of the schema-contract change category."

Generalization beyond audit-artifact `@id`: future cycles touching other behavioral contracts inherit the same stricter discipline. Architect-named candidates: deterministic strategy-selection algorithm (spec §6.2); round-trip parity criterion (spec §8.1); No-Collapse Guarantee Horn-fragment classification (spec §8.5). Folding into AUTHORING_DISCIPLINE at Phase 2 exit doc-pass under "Schema-vs-behavioral-contract evolution discipline."

#### Banked principle (architect Q-4 inclusion criteria) — Audit-artifact discriminating-field sets exclude documentation-polish-tier fields

Documentation-polish-tier fields (free-text explanations, suggestions, hints, timestamps, self-referential identifiers, type discriminators carried by prefix) are excluded from discriminating sets. **Inclusion criteria:** the field's value affects whether two payloads represent the same semantic content; if not, exclude.

Architect's words: "Audit-artifact discriminating-field sets exclude documentation-polish-tier fields. Inclusion criteria: the field's value affects whether two payloads represent the same semantic content; if not, exclude."

Generalization: applies to future audit-artifact types. ProofTrace's `humanReadableExplanation`, `diagnosticHint`, `suggestion` fields (if any) are documentation-polish-tier and excluded. Free-text fields that DO encode semantic content (e.g., `clifGroundTruth.mappingNote` per Phase 1 fixture-corpus convention — semantically tracks how the OWL approximates the CLIF) are NOT documentation-polish-tier and may be included if discrimination is needed. Folding into AUTHORING_DISCIPLINE alongside the §7 exclusion convention.

### Implementation cross-checks (post-ratification)

- LossSignature `@id` regex: `/^ofbt:ls\/[0-9a-f]{64}$/` — ratified.
- RecoveryPayload `@id` regex: `/^ofbt:rp\/[0-9a-f]{64}$/` — ratified.
- Phase 2 fixture `p2_lossy_naf_residue.fixture.js`'s `expected_v0.1_verdict.expectedLossSignatures[0]['@id']` regex assertion conforms to the ratified contract.
- Phase 2 fixture `p2_unknown_relation_fallback.fixture.js` (forthcoming SME path-fence-authoring per architect Q-G ruling 2026-05-07; +1 fixture authorized) will exercise the same `@id` format for the `unknown_relation` LossType.
- 100-run determinism harness (per API §6.1.1) extends to Step 4's Loss Signature / RecoveryPayload `@id` byte-stability verification.

---

## ADR-012: Cardinality routing — Direct Mapping with n-tuple matching (Option β)

**Status:** Accepted (architect ratification 2026-05-07 — Step 4 spec-binding routing cycle's Q-E ruling, captured in committed form 2026-05-07)
**Date:** 2026-05-07 (architect ruling); 2026-05-07 (committed-form capture)
**Predecessors:** ADR-007 §7 (cardinality lifting convention — Phase 1 Step 7's non-Horn FOL emission); Phase 2 entry packet §3.1 (cardinality fixture's reversible regime); Phase 2 entry packet §6.2 (Q6 three-tier schema-evolution discipline); Step 4 spec-binding routing cycle architect rulings 2026-05-07.
**Successor:** None pending.

### Context

The Step 4 spec-binding routing cycle (SME-routed 2026-05-07) surfaced two candidate routings for cardinality round-trip:

- **Option α** — emit cardinality via Annotated Approximation with `LossSignature(lossType: "arity_flattening")` and a `RecoveryPayload` carrying the original FOL. `roundTripCheck` returns `equivalent: true` modulo recovery payload.
- **Option β** — emit cardinality as native OWL `Restriction { onProperty, minCardinality / maxCardinality / cardinality, onClass? }` directly under Direct Mapping. No Loss Signature. Round-trip byte-clean.

Per Aaron's Q-C "direct to architect" disposition at the prior cycle, the SME's Option β recommendation routed direct-to-architect for ratification.

The architect ratified Option β at the Step 4 spec-binding routing cycle 2026-05-07 (verbatim as the architect's Q-E ruling). The ruling's full reasoning is preserved in the cycle transcript + this ADR's Decision section. Step 4a (commit `1278860`) implemented the spec-binding cycle's other deliverables (LossSignature emission machinery + naf_residue + unknown_relation + ADR-011); Step 4b implements the cardinality n-tuple matcher per this ADR.

This ADR captures the Q-E ruling in committed form for traceability, per the architect's banked principle "self-containedness of ADRs over cross-reference dependency when both are available" (ADR-011's banked principle 10.7) and the SME's banked observation "borderline routing decisions default to ADR per architect Q-β banking."

### Decision

Adopt **Option β: Direct Mapping with n-tuple matching for cardinality patterns.**

Cardinality projects as native OWL `Restriction` axioms with the appropriate cardinality field (`minCardinality` / `maxCardinality` / `cardinality`) and qualified `onClass` filler if present. No Loss Signature emitted; the round-trip is byte-clean.

### Implementation contract

The Step 4b implementation adds an n-tuple matcher to the projector recognizing the three cardinality FOL shapes per ADR-007 §7:

#### MinCardinality(P, n, F)

Lifted FOL shape:
```
∀x. C(x) → ∃y_0,...,y_{n-1}. (
  ⋀_i P(x, y_i)            // n binary atoms binding the property
  ∧ ⋀_i F(y_i)             // n filler atoms (qualified case; absent in unqualified)
  ∧ ⋀_{i<j} y_i ≠ y_j      // n*(n-1)/2 pairwise distinctness atoms
)
```

Projects as:
```
SubClassOf(
  C,
  ObjectMinCardinality(n, P, F)   // qualified
  // OR: ObjectMinCardinality(n, P)  // unqualified (no filler)
)
```

#### MaxCardinality(P, n, F)

Lifted FOL shape:
```
∀x. C(x) → ¬∃y_0,...,y_n. (    // n+1 existentials, then negate
  ⋀_i P(x, y_i)
  ∧ ⋀_i F(y_i)
  ∧ ⋀_{i<j} y_i ≠ y_j
)
```

Projects as:
```
SubClassOf(C, ObjectMaxCardinality(n, P, F))
```

#### ExactCardinality(P, n, F)

Conjunction of MinCardinality(P, n, F) AND MaxCardinality(P, n, F). Projector recognizes the pattern AND emits a single `ObjectExactCardinality(n, P, F)` Restriction (not two separate Min + Max axioms).

### Consequences

**Positive:**

- **Spec-aligned per §6.1.3 framing.** Annotated Approximation is "for FOL shapes that don't map to OWL 2 DL." Cardinality DOES map to OWL 2 DL via min/max/exact restrictions. Routing it to Annotated Approximation (Option α) would have been a category error.
- **Round-trip byte-clean.** `p1_restrictions_cardinality.fixture.js`'s regime flips `reversible` → `equivalent` at Step 4b landing. The fixture's `expectedLossSignatureReasons` becomes `[]`. Manifest entry receives a regime annotation update (NOT corpus expansion) per architect Q-E banking principle 2 ("Fixture regime annotations are provisional during phases pre-shipping the matching pipeline component").
- **Forward-compatibility to Phase 4+.** ARC content with cardinality constraints (BFO occurs-at-time has cardinality constraints; CCO realizable-holding has cardinality-bearing patterns) round-trips cleanly without per-phase special handling.
- **Audit-trail unity.** Step 4b's commit references this ADR; future readers reconstruct the architectural commitment without re-litigating the architect ruling from the cycle transcript.

**Negative:**

- **Step 4b implementation cost.** The n-tuple matcher is more complex than Step 3a's pair-matching for `InverseObjectProperties` — it must recognize variable counts (the `n` parameter), pairwise distinctness atoms (n*(n-1)/2 of them), optional filler atoms, and the negation-wrapping discrimination between Min vs Max. Deterministic + well-specified per ADR-007 §7, but materially more work than pair-matching.
- **Step 4a's Annotated Approximation machinery is not exercised by cardinality** (under Option β, cardinality goes Direct Mapping, not Annotated Approximation). Per architect Q-G ruling 2026-05-07, the Annotated Approximation machinery is exercised by `p2_lossy_naf_residue` (naf_residue) and `p2_unknown_relation_fallback` (unknown_relation); cardinality stays Direct Mapping.

**Neutral:**

- **`p1_restrictions_cardinality` manifest amendment** at Step 4b landing: regime `reversible` → `equivalent`; `expectedLossSignatureReasons: ["unsupported_construct"]` → `[]`. Per architect Q-E banking principle 2, this is annotation-tracking work, not corpus expansion. Lands as part of the Step 4b commit.

### Banked principles (verbatim from architect Q-E ruling 2026-05-07)

1. **Spec interpretation defaults to literal framing, not conservative emission strategy.** Q6's "default to heavier path" applies to corrective-action ratification (ADR vs amendment), NOT to spec interpretation. Spec interpretation defaults to literal framing (spec §6.1.3 says "for FOL shapes that don't map to OWL 2 DL"; cardinality maps; therefore cardinality is not Annotated Approximation territory).

2. **Fixture regime annotations are provisional during phases pre-shipping the matching pipeline component.** Updating regime annotations when the component lands is annotation-tracking work, not corpus expansion. The architect's "no expansion of 26-fixture scope" rule applies to count and substance, not annotations that track pipeline maturity.

3. **Forward-compatibility prioritization for ARC-content phases.** When a Phase 2 routing decision affects how Phase 4-7 ARC content with the same construct will round-trip, the forward-compatibility argument is load-bearing. Routing cardinality to Annotated Approximation in Phase 2 would have forced every cardinality-bearing ARC fixture in Phases 4-7 to either accept reversible-approximation semantics or carry per-fixture special handling. Direct Mapping shipped at Step 4b obviates that.

These three principles bank verbally at the Step 4 spec-binding cycle; formal AUTHORING_DISCIPLINE folding deferred to Phase 2 exit doc-pass alongside the prior cycles' deferred banking.

### Implementation evidence

- **Step 4b implementation commit (forthcoming):** adds n-tuple matcher to `src/kernel/projector.ts`; updates `tests/projector-phase2.test.ts` with cardinality round-trip tests; updates `tests/corpus/manifest.json` with the `p1_restrictions_cardinality` regime annotation flip.
- **`p1_restrictions_cardinality.fixture.js`:** Phase 1 fixture exercising cardinality lifting per ADR-007 §7. Becomes the canonical Step 4b round-trip exerciser.
- **100-run determinism harness extension:** Step 4b adds cardinality round-trip to the byte-stability verification suite.

### Cross-references

- ADR-007 §7 (cardinality lifting convention — Phase 1 Step 7's non-Horn FOL emission)
- ADR-011 (audit-artifact `@id` content-addressing — Step 4 spec-binding cycle's other architectural deliverable)
- spec §6.1.1 (Direct Mapping table — extended at Step 4b to include cardinality patterns)
- spec §6.1.3 (Annotated Approximation framing — explicit "for FOL shapes that don't map to OWL 2 DL")
- spec §6.1.2 (Property-Chain Realization — Step 6 deliverable; not exercised by cardinality)
- API §6.1 / §6.2 (`owlToFol` / `folToOwl` signatures)
- Phase 2 entry packet §3.1 (cardinality fixture regime — provisional `reversible` per architect Q-E banking principle 2; flips to `equivalent` at Step 4b)
- Step 4 spec-binding routing cycle architect rulings 2026-05-07 (preserved verbatim in cycle transcript; Q-E ruling captured here for traceability)
- `tests/corpus/p1_restrictions_cardinality.fixture.js` (the canonical exerciser)
