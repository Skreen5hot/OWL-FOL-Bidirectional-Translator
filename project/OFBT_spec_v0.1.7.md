# OFBT Specification v0.1.7

**OWL ↔ FOL Bidirectional Translator — Functional Specification**

*Document version: 0.1.7 (formal, pre-implementation freeze)*
*Status: pre-implementation FREEZE candidate — see §0.2*
*Scope: standalone OWL ↔ Tau Prolog round-trip translator with verified ARC grounding, deliverable as a JS library with stable API*

---

## 0. Revision History

### v0.1.7 (this revision — FREEZE candidate)

This revision incorporates the Fandaws Architect critique of v0.1.6 (received post-publication). The architect's review scored v0.1.6 at 31/33 against the v1.0 Consumer Requirements (with two qualified items, both addressed in this revision) and recommended approval for v0.1 implementation start with three categories of follow-up: (1) correctness/budget items before implementation freeze, (2) clarifications before consumer migration, (3) process commitments. v0.1.7 closes all three categories and **declares this version the pre-implementation freeze**.

**§0.2 (new) — Pre-implementation freeze declaration.** v0.1.7 is the last pre-implementation revision. v0.2 starts implementation. Spec changes after v0.2 require implementation evidence (profile data, benchmarks, ADR). Addresses architect P1.

**Behavioral spec changes:**

- §3.6 (new) — **Modular ARC manifest**: ARC entries are organized into per-relation-family modules (BFO core, IAO information bridge, CCO realizable-holding, deontic, etc.) so consumers can tree-shake unused modules and meet the bundle budget. Closes architect G1 at the behavioral level.
- §15 (extended) — **Verification gate authority chain**: explicit specification of who authors which gate artifact (OFBT defines mechanism; Fandaws defines content). Closes architect P2.
- §17.7 (extended) — **Interim IRI list accommodation**: Fandaws may begin OFBT consumption with an interim structural-annotation IRI list before the Reified Constitutive Relations Specification §3 publishes. Closes architect P4.
- §17.8 (new) — **Compatibility shim location and maintenance**: the shim lives in OFBT's repo as a sub-package for v0.1.x with shared maintenance; post-cutover relocation is a v0.2+ decision. Closes architect P3.

**API specification changes** (in companion document `OFBT_API_v0.1.7.md`):

- ARC manifest module structure with bundle budget split (G1)
- `arcManifestVersion` mismatch detection (G2)
- `evaluate` query type restriction with semantics for each FOLAxiom variant (G3)
- `axiomSet` participation in coherence check, non-persistence (G4)
- Sync `verifyTauPrologVersion()` function (G5)
- `folToOwl` accepts prefixes parameter (C1)
- `ProofTrace` cycle_break split into two specific values (C2)
- Loss Signature severity ordering committed as part of API contract (C3)
- I/O contract documented per function (C4)
- Test corpus coverage matrix (C5)
- `LifterConfiguration` base type with `SessionConfiguration extends LifterConfiguration` (C6)

Architectural skeleton, ADRs 1–21, and behavioral content of §1–§14 are otherwise unchanged.

### v0.1.6

Fandaws Dev critique response: domain/range correctness at API surface, IRI canonicalization at API surface, blank-node ID determinism commitment, audit artifact types defined, Horn-fragment limit surfacing on consistency check, Tau Prolog peer-dependency contract, expected-divergence baselines for verification gate.

### v0.1.5

Companion API specification published as `OFBT_API_v0.1.5.md`. The two documents are co-versioned per ADR-021.

### v0.1.4

Fandaws alignment: dual-nature framing (specification + artifact), unified configuration model (ARC coverage, closure scope, structural annotations), domain/range semantics with HIGH-RISK explicit non-requirement, caller-declarable structural annotations, per-predicate CWA, IRI canonicalization contract, Tau Prolog version pin, three-version surfacing, §17 Fandaws Alignment Statement.

### v0.1.3

Substantive revision: separated equivalent encoding / reversible approximation / true loss; split Loss Signature into three artifacts (Loss Signature / Recovery Payload / Projection Manifest); tightened §8.5 No-Collapse Guarantee to Horn-checkable fragment; adopted W3C RDFC-1.0 for blank node canonicalization; specified storage precedence between Oxigraph and Tau Prolog; added Status of Claims preamble distinguishing architectural commitments, implementation choices, and correctness aspirations; resolved Q1-Q4.

### v0.1.2

Operational guardrails: blank node Skolemization, projection provenance, No-Collapse Guarantee, SLD termination via cycle detection.

### v0.1.1

Sharpening revision: SROIQ(D) framing, UNA axis, identity handling, datatype properties, TBox/ABox vocabulary, R-feature grounding for property chains, expanded references.

### v0.1

Initial formal specification.

---

## 0.1 Status of Claims

This document mixes three levels of certainty deliberately. Readers should distinguish them:

**Architectural commitments** are decisions that have been made and are recorded in the ADR register (§10). These are stable. Changing them constitutes a major revision (v0.2, not v0.1.x). Examples: "Tau Prolog is the FOL engine" (ADR-001), "no external OWL reasoner dependency for v0.1 validation" (ADR-002), "Connected With as primitive with bridge axioms" (ADR-004).

**Implementation choices** are decisions that have been made for v0.1.x but are subject to revision once code lands and reveals practical constraints. These appear throughout the body of the spec. Examples: the resolution depth bound of 50 (§5.4), the specific Skolem hash length (§5.7), the visited-ancestor approach to cycle detection (§5.4, §10/ADR-011 with v0.2 upgrade noted).

**Correctness aspirations** are statements of what "correct OFBT behavior" means. These define the validation contract. They are not claims that the implementation already achieves them — they are the bar the implementation must reach to be considered correct. Examples: structural round-trip parity (§8.1), the No-Collapse Guarantee (§8.5), determinism (§7.4).

The v0.1.2 spec sometimes stated correctness aspirations in language that read as if they were architectural commitments — for instance, asserting bidirectional satisfiability preservation as a property of the system rather than a property the validator checks. This revision corrects that. Where a claim is aspirational, it is now labeled as such and accompanied by the validation mechanism that *checks* it (§8.5's Horn-resolution check, for example, is explicitly the validator for the No-Collapse Guarantee, and the guarantee itself is restricted to the fragment that validator can reach).

Implementers should read architectural commitments as binding, implementation choices as defaults open to negotiation, and correctness aspirations as the test suite they must pass.

---

## 0.2 Pre-implementation Freeze Declaration

**v0.1.7 is the last pre-implementation revision of this specification.** v0.2 starts implementation.

### 0.2.1 What freeze means

After v0.1.7 publishes, this specification is treated as complete for the purpose of starting v0.1 implementation. The OFBT team commits to:

- **No new spec sections** until v0.2.
- **No new ADRs** until v0.2 unless implementation surfaces an architectural conflict.
- **No new API surface** until v0.2 unless implementation surfaces a missing function.
- **Editorial corrections only** between v0.1.7 and v0.2 — typo fixes, clarification of existing language, broken-link repairs.

### 0.2.2 What freeze does not mean

Freeze does not mean the spec is perfect. It means the spec is complete enough that implementation can proceed against a stable target. Discoveries during implementation will produce one of three outcomes:

- **Editorial revision** (v0.1.7.x patch): the spec was unclear; the implementation makes a reasonable choice; the spec is updated to reflect what the implementation does.
- **Implementation deferral** (v0.2 backlog): the spec is correct but implementation reveals the chosen approach is impractical; v0.2 specification revises the approach with implementation evidence.
- **Pre-implementation correction** (rare): a true bug in the spec is discovered before implementation has progressed far. Resolved as a v0.1.7.x patch with explicit deviation note.

### 0.2.3 Spec changes after v0.2 require implementation evidence

Once v0.2 implementation begins, spec changes require an ADR with one of:

- **Profile data** demonstrating an implementation choice has measurable consequences (e.g., bundle size hit, latency degradation).
- **Benchmark results** demonstrating performance falls outside acceptance criteria.
- **Correctness counterexample** demonstrating the spec produces wrong results on a test corpus member.
- **Consumer-facing breakage** demonstrating that a downstream consumer cannot integrate against the current spec.

Speculative spec changes ("we should also support X") are not accepted post-freeze. They go on the v0.3 candidate list.

### 0.2.4 Why declare freeze now

The Fandaws Architect critique of v0.1.6 (P1) raised the concern that pre-implementation specifications can drift indefinitely, leaving consumers unable to plan migration timing. The architect noted: "v0.1.7 starts implementation, finds something doesn't work in JS reality, and the spec accumulates patches. A multi-version pre-implementation drift can leave the spec authoritatively contradictory at the point of consumption."

v0.1.7 declares freeze to prevent that drift. The spec has been through six revision cycles since v0.1; the v1.0 Consumer Requirements alignment is at 31/33 (with the two qualified items addressed in this revision); both Fandaws Dev and Fandaws Architect critiques have been substantively absorbed. Further pre-implementation revision yields diminishing returns; implementation evidence is what the spec needs next.

### 0.2.5 Process consequences

For Fandaws (as the primary consumer): the spec is now stable enough to plan migration timing against. Bucket C helper signature inventory work and the Reified Constitutive Relations Specification §3 can begin in earnest.

For OFBT implementers: the spec is the build target. Disagreements with the spec during implementation should be raised as ADR proposals, not as silent implementation deviations.

For future reviewers: post-freeze critiques are still welcome and should be incorporated into v0.2 planning. They will not block v0.1 implementation.

---

## 1. Project Scope and Objectives

OFBT is a round-trip translator between OWL 2 DL ontologies and First-Order Logic, mediated by Tau Prolog as the FOL execution engine. The translator's job is to maintain a synchronized representation in both formats, projecting between them according to declared fidelity contracts, so that downstream consumers can choose their reasoning regime per query without losing axiomatic content.

### 1.1 The expressivity gap

OFBT exists because OWL 2 DL and FOL differ along four axes simultaneously. OWL 2 DL corresponds, in standard Description Logic nomenclature, to the language SROIQ(D) — the central reference point for OWL 2's expressivity, decidability, and tooling. References throughout this document use both vocabularies (OWL 2 DL when describing the projection target as ontology engineers see it; SROIQ(D) when describing the formal fragment).

The first axis is **decidability**. OWL 2 DL is decidable; classical FOL is not. This is the well-known gap and is the source of OWL's tractability constraints (the simple-property requirement, the regular-expression restriction on property chains, and so on).

The second axis is **expressivity within the open-world stance**. Both OWL 2 DL and classical FOL operate under the Open World Assumption — neither treats absence of evidence as evidence of absence. But FOL admits arbitrary-arity predicates, full negation, nested quantification, and unrestricted equality reasoning, none of which OWL 2 DL supports. OWL's restrictions exist for decidability, not because of any disagreement about what counts as a valid inference.

The third axis is **operational semantics**. Tau Prolog, as a Prolog implementation, evaluates queries via SLD resolution with negation-as-failure (NAF). NAF is a closed-world operator, locally and operationally — it is *not* the same as the classical negation in FOL. NAF results are evidence that a fact has not been proven, not evidence that its classical negation holds. This distinction is load-bearing for projection (§6.4) and validation (§8).

The fourth axis is **identity assumptions**. OWL 2 DL does not make the Unique Name Assumption (UNA): two distinct identifiers may, by inference, refer to the same individual (declared via `owl:sameAs`) or be forced apart (declared via `owl:differentFrom`). Tau Prolog, like all standard Prolog implementations, effectively does make UNA: distinct ground terms are treated as distinct individuals, with no native mechanism for asserting their equality. Identity reasoning is therefore something OFBT must handle explicitly in both directions: lifting `owl:sameAs` triples must inject identity-preserving inference into the FOL layer, and projecting Prolog results that assume distinctness must not over-commit to OWL distinctness assertions that the source did not make. §5.5 specifies the handling rules; ADR-010 records the architectural decision.

Earlier drafts of this work characterized the gap as "OWA vs CWA." That framing is incorrect: classical FOL is open-world, and CWA is a meta-assumption that arrives only when an operational engine like Prolog adds it. OFBT inherits CWA only from Tau Prolog, locally and provisionally, and must not propagate that assumption back into the projected OWL. The same is true of UNA: Tau Prolog brings UNA operationally, but OFBT must not propagate UNA into the projected OWL.

### 1.2 Objectives

- **ARC grounding.** Every relation handled by the translator must trace to a verified entry in the Axiomatic Relational Core (ARC). ARC is the source of truth.
- **Three-strategy projection.** The projector must select between Direct Mapping, Property-Chain Realization, and Annotated Approximation per axiom, with the selection traceable.
- **Structural round-trip parity.** A graph G lifted to FOL, processed, and projected back to OWL must re-lift to a structurally equivalent FOL state (same FOL facts modulo explicit Loss Signature residue). This is the content-equivalence criterion at the lifted-FOL level; stronger semantic senses (model-theoretic, axiomatic, entailment-preserving) are deferred to v0.2+ per §8.1.
- **Edge-canonical execution.** No infrastructure dependencies; runs unmodified in browser or via `node index.js`; deterministic byte-stable output.
- **No silent loss.** Every axiom that cannot be projected as Direct Mapping or Property-Chain Realization must emit a Loss Signature record with sufficient information to reconstruct the FOL form.

### 1.3 Non-goals for v0.1

The following are explicitly out of scope for v0.1 and are deferred to later versions:

- TagTeam.js integration as upstream parser (deferred to v0.3+, post-Fandaws-vocabulary completion)
- Fandaws integration as orchestration layer (deferred to v0.4+)
- External OWL reasoner integration (HermiT, Pellet, ELK) — see §8 for rationale
- Multi-graph reasoning across imports
- SHACL validation (separate concern)
- SPARQL endpoint exposure

### 1.4 OFBT as specification and as deliverable artifact

OFBT has two related but distinct natures, and this specification addresses both:

**OFBT as specification.** A behavioral description of the bridge between OWL 2 DL and First-Order Logic, grounded in the ARC manifest of verified relations. The specification defines what "correct OFBT behavior" means: structural round-trip parity (§8.1), the No-Collapse Guarantee, the three-strategy projection router, the audit-artifact taxonomy. This is the content of §1 through §10 and §15.

**OFBT as deliverable artifact.** A JavaScript library (`@ontology-of-freedom/ofbt` or successor name) that implements the specification and is consumed by Fandaws-Sentinel and other future consumers. The library satisfies a concrete API contract (function signatures, error classes, async semantics, configuration models) and ships with an independent test corpus, semver-versioned releases, and a compatibility shim for primary consumers. This is the content of §11 (technical stack), §12 (acceptance criteria), §16 (forward-referenced), and §17 (consumer alignment).

The two natures are coupled: the artifact must satisfy the specification, and the specification must be implementable as the artifact under edge-canonical constraints. v0.1.3 leaned heavily on the specification framing and underspecified the artifact-side commitments (API surface, library packaging, consumer contracts). v0.1.4 reframes OFBT to acknowledge both natures explicitly. v0.1.5 will close the API surface specification, which is the largest remaining artifact-side gap.

**Implications.** Where the specification says "the projector emits...", the deliverable artifact must expose that emission through a stable API. Where the specification says "the validator checks...", the deliverable artifact must offer that check as a first-class function call rather than only as an internal mechanism. This is the connective tissue between the behavioral and artifact natures, and it is what consumer alignment (Fandaws Consumer Requirements v1.0, see §17) makes concrete.

---

## 2. System Architecture

OFBT v0.1 is a four-component system. All components are JavaScript-native and edge-canonical-compliant.

```
┌─────────────────────────────────────────────────────────────┐
│                       OFBT v0.1                             │
│                                                             │
│   OWL Input ──┐                              ┌── OWL Output │
│              │                              │              │
│              ▼                              ▼              │
│        ┌──────────┐                   ┌──────────┐         │
│        │  Lifter  │                   │ Projector│         │
│        └────┬─────┘                   └─────▲────┘         │
│             │                               │              │
│             ▼                               │              │
│        ┌──────────────────────────────────────┐            │
│        │    Tau Prolog FOL Environment        │            │
│        │    + ARC Axiom Set (loaded)          │            │
│        └──────────────────────────────────────┘            │
│                                                             │
│        ┌──────────────────────────────────────┐            │
│        │    Oxigraph RDF Store (canonical)    │            │
│        └──────────────────────────────────────┘            │
│                                                             │
│        ┌──────────────────────────────────────┐            │
│        │    Loss Signature Ledger (JSON-LD)   │            │
│        └──────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

The four components:

- **Oxigraph** — the canonical RDF store. Holds the input OWL graph and accumulates the projected output graph. Authoritative for the OWL representation at all times.
- **Tau Prolog FOL Environment** — the inference layer. Holds the lifted predicate facts, the ARC axiom set, and the inference closure. Authoritative for the FOL representation.
- **Lifter** — translates Oxigraph triples into Tau Prolog predicates and injects the corresponding ARC axioms.
- **Projector** — translates Tau Prolog inference results back into Oxigraph triples, selecting per-axiom between the three projection strategies.

The two stores (Oxigraph, Tau Prolog) hold the same content in different representations. They are kept synchronized by the lifter and projector. Neither is more authoritative than the other in steady state; the relationship is defined by the structural round-trip parity contract (§8).

### 2.1 TBox and ABox content

Following standard Description Logic vocabulary, OFBT distinguishes two categories of content the lifter and projector handle differently:

- **TBox content** (terminological): class hierarchies, property characteristics (transitivity, symmetry, etc.), domain and range declarations, property chains, equivalences, and disjointness axioms. This is the schema-level content of the ontology.
- **ABox content** (assertional): individual class assertions (`x rdf:type C`), individual property assertions (`x p y`), and identity declarations (`owl:sameAs`, `owl:differentFrom`).

Both stores hold both kinds of content. The distinction matters operationally: in projection (§6), TBox content is where the three-strategy router operates — Direct Mapping, Property-Chain Realization, or Annotated Approximation. ABox content is almost always Direct Mapping; the strategies do not normally apply. §6.4's fallback path is also primarily a TBox concern.

This terminology aligns OFBT with the broader DL community (Baader et al., 2003; Krötzsch et al., 2012) and makes the strategy-selection logic in §6 readable to ontology engineers approaching the spec from a DL background.

---

## 3. The ARC (Axiomatic Relational Core) Manifest

ARC is the catalogue of verified relations the translator operates over. The canonical manifest is the file `relations_catalogue_v3.tsv` (or successor), which is loaded at OFBT initialization. The manifest is not duplicated in this specification; it is referenced as the single source of truth. Any relation not present in the loaded ARC manifest is treated as untyped and is handled by §6.4's fallback path.

### 3.1 ARC entry structure

Each row in the ARC manifest specifies, for one relation:

| Field | Purpose |
|---|---|
| Relation Name | Human-readable label |
| Level | Meta / Class-level / Object-level |
| Context | Logical or ontological category (FOL, Set Theory, Mereology, Dependence, etc.) |
| Notation | Canonical FOL symbol for the relation |
| Formal Definition | The FOL axiom (in CL or KIF) defining the relation's semantics |
| OWL Characteristics | The `owl:*Property` declarations actually attached to the IRI |
| OWL/CCO Realization | The IRI used in the OWL representation |
| subPropertyOf | Real BFO/RO/CCO parent (not `owl:topObjectProperty`) |
| Domain, Range | With disjointness implications made explicit |
| IRI | The actual URI |
| Notes | Divergences between formal definition and OWL realization, verification status, bridge axioms |

### 3.2 ARC coverage for v0.1

The v0.1 ARC manifest must cover, at minimum:

- The full BFO 2020 core relation set (parthood, dependence, realization, participation, spatial, temporal, time-indexing)
- The standard mereotopological connection relation, taken as primitive with the bridge axiom `P(x,y) → ∀z (C(z,x) → C(z,y))` declared in ARC and injected by the lifter
- The IAO information-bridge layer (`is_about`, `denotes`, etc.)
- The CCO realizable-holding relations (`has_role`, `has_disposition`, `has_function`, `agent_in`, `patient_in`)

The deontic sublayer (`prescribed_by`, `realizes_directive`, `discharges`, `violates`, etc.) is included but flagged as draft until RDM v1.2.1 chains are stable in OFI extension namespace.

### 3.3 ARC verification states and operating modes

Every ARC entry must declare its verification state in the Notes column. Permitted states:

- **Verified** — IRI confirmed against current ontology release; FOL axiom confirmed against canonical literature
- **[VERIFY]** — IRI or axiom unconfirmed; usable but flagged in audit when invoked
- **Draft** — entry under active development; usable in permissive mode but excluded from strict-mode acceptance

OFBT supports two **co-equal operating modes**, selected at ingestion:

**Strict mode** (`--strict`). Every property IRI in the input graph must have a Verified ARC entry. Unknown properties cause ingestion to fail; [VERIFY] and Draft entries cause ingestion to fail. This mode targets curated workflows: validation pipelines, regression tests, ontology releases. The acceptance criteria in §12 (especially the No-Collapse Guarantee in §8.5) apply at full strength only in strict mode.

**Permissive mode** (default, or `--permissive`). Unknown properties are handled by the fallback path (§6.4); [VERIFY] entries are usable; Draft entries are usable with annotation. This mode targets exploratory work: ingesting a new ontology to see what OFBT can do with it, working with ontologies that include CCO extensions or domain-specific properties not yet in ARC. Loss Signature records (§7) flag every unverified or fallback step.

The two modes are not "default versus override" — they target different use cases and both are first-class. Documentation, error messages, and acceptance criteria are written for both. The default is permissive because exploratory ingestion is the more common use case for v0.1; this is a documentation choice, not a precedence claim.

ADR-002 records the dual-mode commitment.

### 3.4 Connected With: definition policy

The relation Connected With (`cco:ont00001810`) is declared **primitive** in ARC. It is *not* defined as overlap, restricted overlap, or shared-immaterial-part. The defining content of the relation is supplied by:

1. Property characteristics: `owl:SymmetricProperty`, `owl:ReflexiveProperty`
2. The bridge axiom in ARC: `P(x,y) → ∀z (C(z,x) → C(z,y))` (parts inherit connections)

This policy reverses the v0.0 draft's reduction of C to overlap. Reducing C to overlap conflates external connection (boundary contact without shared parts) with overlap (shared parts), which is incorrect in standard mereotopology and produces wrong inferences in spatial reasoning. The primitive treatment with the bridge axiom recovers all the inferential reach of mereotopology without committing to the bad reduction. ADR-004 records this decision.

### 3.4.1 Inferential closure under the bridge axiom

The bridge axiom alone is not sufficient to specify Connected With's behavior; its interaction with parthood transitivity and with cycle detection (§5.4, ADR-011) needs to be made explicit.

**The full axiom set for C in ARC:**

```
C(X, X)                                              [reflexivity]
C(X, Y) :- C(Y, X)                                   [symmetry]
C(Z, Y) :- P(X, Y), C(Z, X)                          [parthood-extension bridge]
P(X, Z) :- P(X, Y), P(Y, Z)                          [parthood transitivity]
```

The bridge composes with parthood transitivity: if `P(a, b)` and `P(b, c)` and `C(z, a)`, then by transitivity `P(a, c)`, and by the bridge `C(z, c)`. The closure is correct, finite for finite graphs, and computable under the visited-ancestor cycle detection of ADR-011.

**Worked example.** Consider three immaterial regions:

```
P(boundary_1, region_a)
P(region_a, region_b)
C(observer, boundary_1)
```

Inferences:
1. `P(boundary_1, region_b)` by transitivity (parts of parts).
2. `C(observer, region_a)` by the bridge axiom on `P(boundary_1, region_a)` and `C(observer, boundary_1)`.
3. `C(observer, region_b)` by the bridge on `P(boundary_1, region_b)` (from step 1) and `C(observer, boundary_1)`. Equivalently, by the bridge on `P(region_a, region_b)` and `C(observer, region_a)` (from step 2).
4. By symmetry, `C(region_a, observer)`, `C(region_b, observer)`, `C(boundary_1, observer)`.
5. By reflexivity, `C(observer, observer)`, `C(region_a, region_a)`, etc.

The closure terminates because the universe of individuals is finite and the visited-ancestor list prevents revisits.

**What does *not* hold.** Two regions both connected to a third are *not* automatically connected to each other. There is no transitivity-like axiom for C in standard mereotopology, and ARC does not introduce one. `C(a, b) ∧ C(b, c) → C(a, c)` is not in the axiom set. This is correct: two cubes both touching a wall are not thereby touching each other. Implementations must not add a transitivity axiom for C as a "convenience."

**Distinguishing C from RCC's primitives.** ARC's C corresponds to RCC's "C" (connection), not to "EC" (external connection) or "PO" (proper overlap). When OFBT ingests a graph using RCC-style fine-grained relations, the lifter maps EC and PO to derived predicates over C and parthood, not as primitives. The mapping rules are documented as part of the ARC manifest's Notes column where applicable.

**Cycle detection interaction.** Because C is symmetric and reflexive, naive resolution loops immediately. The visited-ancestor list (ADR-011) carries pairs `(individual_a, individual_b)` for C-goals and prevents revisits. The bridge axiom, being non-symmetric in form (parthood on one side, connection on the other), composes correctly with this guard.

### 3.5 Unified Configuration Model

OFBT's configurable behavior decomposes into three orthogonal axes. v0.1.3 introduced the ARC coverage axis but treated the others as ad-hoc flag families that did not compose cleanly. v0.1.4 unifies them.

#### 3.5.1 Axis A: ARC coverage

Already specified in §3.3. Two values:

- `strict` — every property IRI must be a Verified ARC entry; unknown or [VERIFY] or Draft entries cause ingestion failure.
- `permissive` (default) — unknown properties handled by §6.4 fallback; [VERIFY] and Draft entries usable with annotation.

#### 3.5.2 Axis B: Closure scope

Specifies where closed-world reasoning may apply. v0.1.3 §1.1 established OWA as the default semantic stance and forbade propagating Prolog's CWA outward. v0.1.4 refines this: OWA is the default, but per-predicate CWA is supported as an opt-in for specific named predicates.

Two values:

- `owa` (default) — full open-world reasoning; absence of evidence is not evidence of absence; `\+ p(x,y)` results are not projected as classical negation.
- `cwa-per-predicate` — a caller-supplied set of property IRIs are treated as closed-world for the duration of the query. NAF results on closed predicates project to `NegativeObjectPropertyAssertion`; NAF results on open predicates remain in FOL with `naf_residue` Loss Signature records.

The closed-predicate set is supplied at query time, not at session creation. This is critical: the semantic stance is determined per evaluation, not as a global session setting. §6.3 specifies the projection rules.

The whole-ontology CWA is explicitly *not* supported. Closure is per-predicate, on a curated finite set. This matches Fandaws Consumer Requirement §3.9.2 and the broader architectural commitment to OWA reasoning.

#### 3.5.3 Axis C: Structural annotation declaration

OWL standard treats annotation properties as opaque metadata that does not participate in inference. Some consumers (notably Fandaws via its BFO bucket inference) require specific annotation property IRIs to be treated as load-bearing — translated to FOL predicates that participate in reasoning.

OFBT supports this via a caller-supplied list:

- `structuralAnnotations` — a set of annotation property IRIs to be treated as inference-relevant for the duration of a session.

Default: empty set (full OWL-standard behavior). When non-empty, the lifter (§5.9) emits FOL predicates for the listed properties; the projector preserves them on round trip.

This is configured at session creation (or its equivalent in the lifter API), not per query, because it changes the lifter's behavior rather than the projector's.

#### 3.5.4 Composition

The three axes are independent. Any combination is valid. The configuration model is:

```
Configuration = {
    arcCoverage: 'strict' | 'permissive',           // axis A, default 'permissive'
    structuralAnnotations: Set<IRI>,                // axis C, default ∅
    // axis B (closure scope) is per-query, not per-configuration
}
```

Per-query parameters that compose with the configuration:

```
QueryParameters = {
    closedPredicates: Set<IRI>,                     // axis B, default ∅
    stepCap: number,                                // §5.4, default 50
}
```

The full configuration surface is specified in v0.1.5's API specification (forward-referenced as §16). v0.1.4 commits to the architectural decomposition; v0.1.5 binds it to function signatures.

#### 3.5.5 Interactions

**Strict + closed predicates.** When ARC coverage is strict, the closed-predicate set must reference only Verified ARC entries. Closing a predicate that is not in ARC (or is [VERIFY]/Draft) causes the query to fail with a typed error.

**Structural annotations + ARC.** Structural annotations declared by the caller bypass the ARC manifest's coverage check — they are caller-asserted, not ARC-verified. The lifter emits them with a `structural_annotation_caller_declared` audit note in the Recovery Payload, so consumers know which FOL predicates derive from caller assertion versus ARC.

**OWA + structural annotations.** Annotation predicates are subject to the same OWA discipline as object predicates. Including a structural annotation in `closedPredicates` is permitted; it closes that specific annotation predicate for the query.

### 3.6 Modular ARC Manifest

The ARC manifest is organized into per-relation-family modules, not as a monolithic file. This serves two purposes: (a) consumers can tree-shake unused modules to meet the bundle budget (companion API spec §13.4), and (b) module boundaries make ARC additions reviewable in isolation.

#### 3.6.1 Module structure

The v0.1 ARC manifest decomposes into the following modules, each in its own file under the package's `arc/` directory:

| Module | Contents | Approximate size (minified JSON-LD) |
|---|---|---|
| `core/bfo-2020.json` | BFO 2020 core relations: parthood, dependence, realization, participation, spatial, temporal, time-indexing | ≤ 40 KB |
| `core/iao-information.json` | IAO information bridge: `is_about`, `denotes` (and v0.2+ `is_token_of` per ADR-008 deferral) | ≤ 10 KB |
| `cco/realizable-holding.json` | CCO realizable-holding (individual realizable-holding pattern): `agent_in`, `affects`, `has_input`, `has_output`, etc. | ≤ 15 KB |
| `cco/mereotopology.json` | CCO Connected With primitive + bridge axioms (§3.4.1); coincides with, externally connects, partially overlaps; tangential and nontangential parthood | ≤ 5 KB |
| `cco/measurement.json` | CCO measurement vocabulary: measurement units, reference systems, time zones, geospatial coordinate reference systems | ≤ 8 KB |
| `cco/aggregate.json` | CCO aggregate vocabulary: collective bearer-of, aggregate capability, aggregate quality, inheres-in-aggregate | ≤ 5 KB |
| `cco/organizational.json` | CCO organizational vocabulary: affiliation, supervision, organizational context, subordinate roles, interest-bearing, delimitation | ≤ 12 KB |
| `cco/deontic.json` | CCO deontic vocabulary (Directive→Action): `prescribes`, `prohibits`, `permits`, `requires`, plus inverses | ≤ 8 KB |

Total v0.1 default ARC: ≤ 103 KB minified across the eight modules, of which `core/bfo-2020.json` (~40 KB) is the only mandatory module.

**Module-list evolution (architect-ratified post-freeze changes per §0.2.3):**

- v0.1.7 (frozen): 5 modules — `core/bfo-2020`, `core/iao-information`, `cco/realizable-holding`, `cco/mereotopology`, `ofi/deontic`.
- v0.1 implementation amendments (post-freeze evidence-gated changes per §0.2.3):
  - **ADR-008 (Accepted 2026-05-05):** `ofi/deontic.json` deferred from v0.1 to v0.2. The 8 OFI deontic relations are preserved in `project/relations_catalogue_v3_3.tsv` with module assignment `[V0.2-CANDIDATE]`; v0.1 build pipeline does not load them. OFI returns to scope at v0.2 when the external Reified Constitutive Relations Specification §3 publishes (or when SME-led decision finalizes the OFI namespace authority).
  - **ADR-009 (Accepted 2026-05-05):** Four CCO modules added per v0.1 corpus evidence: `cco/measurement`, `cco/aggregate`, `cco/organizational`, `cco/deontic`. Evidence base is `project/relations_catalogue_v3_3.tsv` (committed pre-ratification per architect's procedural gating ruling); 35 CCO rows from v0.1 test corpus that don't fit the original 5-module taxonomy fit the four new modules cleanly per the deterministic module-assignment rule (namespace + property-path closure to BFO ancestor).

Net v0.1 module count: **8 modules** (5 original − 1 deferred + 4 added).

#### 3.6.2 Tree-shaking and consumer selection

Consumers select which ARC modules to load via the optional `arcModules` parameter on `SessionConfiguration` (companion API spec §2.1). Default behavior loads all v0.1 modules. Consumers wanting only BFO core (the minimal viable ARC) declare:

```javascript
createSession({ arcModules: ['core/bfo-2020'] });
```

Modules not declared are not bundled. This is real tree-shaking, not runtime gating: the bundler sees no import for unused modules and drops them entirely.

#### 3.6.3 ARC coverage check interaction

The ARC coverage check (§3.3, §4.4) operates over the loaded modules only. A property IRI not present in any loaded module is treated as unknown — `unknown_relation` Loss Signature in permissive mode, ingestion failure in strict mode. Loading additional modules expands the coverage; unloading shrinks it.

A consumer using strict mode with a minimal ARC selection commits to ingesting only ontologies whose properties are covered by that selection. This is a deliberate design choice: strict mode is meant to enforce vocabulary discipline, and that discipline includes vocabulary scope.

#### 3.6.4 Module dependencies

Modules may depend on other modules. Currently:

- `cco/realizable-holding.json` depends on `core/bfo-2020.json` (uses BFO realization relations)
- `cco/mereotopology.json` depends on `core/bfo-2020.json` (uses BFO part_of for the bridge axiom)
- `cco/measurement.json` depends on `core/bfo-2020.json` (uses `BFO_0000084` specifically_depends_on, `BFO_0000101` generically_depends_on)
- `cco/aggregate.json` depends on `core/bfo-2020.json` (Object Aggregate is a BFO category; multi-ancestor to `BFO_0000196` bearer_of and `BFO_0000194` specifically_depended_on_by)
- `cco/organizational.json` depends on `core/bfo-2020.json` (Organization is a BFO category)
- `cco/deontic.json` depends on `core/iao-information.json` (Directive is an Information Content Entity per IAO)
- `ofi/deontic.json` (v0.2+ per ADR-008) depends on `cco/realizable-holding.json` (RDM chain uses Roles); not loaded in v0.1

The lifter validates dependencies at `createSession()` and throws `ARCManifestError` if a declared module's dependencies are not also loaded. The error message includes the missing dependencies for diagnostic purposes.

#### 3.6.5 Why modular vs monolithic

Three reasons:

1. **Bundle budget compliance.** v0.1's 200 KB bundle budget (companion API spec §13.4) cannot accommodate a monolithic ARC manifest growing past ~80 KB while leaving room for OFBT core code and `rdf-canonize`. Modularity lets consumers pay only for what they use.

2. **Review boundaries.** ARC additions in v0.2+ (CCO Modal Relations, expanded deontic sublayer) can land as new module files reviewed in isolation. A monolithic manifest grows as a single artifact and reviewers must understand all of it to evaluate any change.

3. **Ontology scope alignment.** Real consumers care about specific ontology subdomains. A consumer working only with BFO core does not need CCO realizable-holding axioms to be loaded into Tau Prolog (where they consume memory and resolution time). Modularity makes this explicit.

ADR-022 (forward-referenced; will be added when v0.2 lands and this commitment is implementation-validated) records the modular-manifest decision.

---

## 4. Input Specification

### 4.1 Supported input formats

OFBT v0.1 accepts:

- **JSON-LD** (primary; canonical form per the edge-canonical principle)
- **Turtle** (secondary; required for ingesting BFO/CCO releases as shipped)
- **RDF/XML** (tertiary; required for legacy BFO releases)

OWL Functional Syntax is not supported in v0.1 (deferred). All inputs are normalized to Oxigraph's internal representation on ingestion.

### 4.2 Required input metadata

Each input graph must declare the following or have it injected by the loader:

- An ontology IRI (used for round-trip identifier scoping)
- A list of imported ontologies (for ARC manifest coverage check)
- The intended BFO version (2020 is the v0.1 default; earlier versions are not supported)

### 4.2.1 IRI canonicalization contract

OFBT must accept IRIs in any of the three forms commonly produced by RDF parsers, normalize internally to a single canonical form, and emit on output in a form that supports round-trip stability.

**Input forms accepted.** The lifter accepts IRIs in any of:

- **Full URI form**: `<http://purl.obolibrary.org/obo/BFO_0000050>` — angle-bracketed absolute URI as used in Turtle and SPARQL
- **CURIE form**: `bfo:0000050` — prefix:local notation, requiring an associated `@prefix` declaration
- **Bare URI form**: `http://purl.obolibrary.org/obo/BFO_0000050` — unbracketed string form as may emerge from JSON-LD or programmatic input

The lifter does not require callers to normalize beforehand. All three forms produce identical lifted predicates.

**Internal canonical form.** Internally, OFBT uses **expanded full URI form** without angle brackets — e.g., `http://purl.obolibrary.org/obo/BFO_0000050`. CURIEs are expanded against the prefix table at ingestion. This canonical form is what the lifter passes to the predicate-name normalization step and what the registry stores.

The expanded form is used because it is the only form whose identity is independent of the prefix table — two graphs using different prefix shorthands for the same URI are correctly recognized as referencing the same entity.

**Output form.** The projector emits IRIs in the form that matches the dominant input convention of the source graph: if the source used CURIEs, the projection re-introduces matching prefixes and uses CURIEs; if the source used bracketed full URIs, the projection emits bracketed full URIs. The Projection Manifest records the prefix table used for the projection so consumers can reproduce the IRI normalization step.

**Round-trip stability.** Because the internal canonical form is stable and the output form derives from the source's convention, structural round-trip parity (§8.1) is independent of the surface form chosen by the input. A graph using bracketed full URIs produces the same lifted FOL state as the same graph using CURIEs.

**Error surface.** IRIs that cannot be normalized — malformed URIs, unbound prefixes, mixed forms within a single triple — cause ingestion to fail with a typed error (forward-referenced to v0.1.5's API specification: `IRIFormatError`). The error carries the offending source IRI and the failure reason for diagnostic purposes.

### 4.3 Temporal index policy

BFO 2020 declares several relations as ternary in the formal CL specification but as binary in the OWL release (notably `continuant_part_of`, `bearer_of`, `inheres_in`, `participates_in`, and the location relations). The lifter must restore the temporal argument when expanding to FOL. The policy for restoration, in order of precedence:

1. **Reified n-ary form present.** If the source graph uses BFO's n-ary relation reification pattern (a relation instance with separate properties for relata and time), the lifter extracts the temporal index from the reified form. No Loss Signature emitted; this is direct lift.

2. **Annotation property present.** If the source graph carries a temporal context annotation (`bfo:temporalContext` or equivalent ARC-declared property) on the binary triple, the lifter uses that value. No Loss Signature emitted.

3. **Skolemization fallback.** If neither (1) nor (2) is present, the lifter introduces a fresh Skolem constant `t_<hash>` for the temporal argument, where `<hash>` is a deterministic content hash of the triple. A Loss Signature record of type `temporal_skolemization` is emitted, allowing the projector to either drop the index (returning to binary form, with annotation) or preserve it (in n-ary reified form) on the way back out.

The Skolemization is deterministic (same triple content → same Skolem constant) so that structural round-trip parity holds across runs. ADR-005 records this policy.

### 4.4 ARC manifest coverage check

On ingestion, OFBT scans every property IRI used in the input graph. Behavior depends on operating mode (§3.3):

- **Strict mode.** Any IRI not present as a Verified ARC entry causes ingestion to fail with a clear diagnostic. This is the validation-pipeline mode.
- **Permissive mode** (default). Unknown properties are treated by §6.4's fallback path. [VERIFY] entries are usable. Draft entries are usable with annotation. Unknown-property occurrences emit `unknown_relation` Loss Signature records but do not block ingestion.

The two modes use the same lifter and projector engines; only the coverage-check stringency differs. Structural round-trip parity (§8) is checked in both modes; the No-Collapse Guarantee (§8.5) applies at full strength only in strict mode (in permissive mode, fallback-path axioms cannot be coherence-checked because their semantics are not fully specified in ARC).

---

## 5. Lifting Engine (OWL → FOL)

### 5.1 Triple-to-predicate mapping

Each RDF triple `(s, p, o)` in the source graph becomes a Tau Prolog predicate of the form:

- Binary form: `p(s, o).` for relations ARC declares as binary
- Ternary form: `p(s, o, t).` for relations ARC declares as ternary, with `t` supplied per §4.3
- N-ary reified form: `p(id, s, o, t, ...)` for relations with additional declared arguments

The predicate symbol is the local fragment of the property IRI, normalized to a Prolog-safe identifier. The full IRI is preserved in a parallel `iri_of/2` predicate so projection can recover the original URI.

### 5.2 Axiom injection

For each property used in the source graph, the lifter (`owlToFol` per API §6.1) emits the corresponding ARC axioms as part of its `FOLConversionResult.axioms` array. The session-state assertion of these axioms is performed by `loadOntology` (API §5.5) — the composition function that asserts the lifter's output into the session's Tau Prolog state per ADR-007 §11's per-FOLAxiom-variant translation rules. The lifter itself is session-pure per API §6.1; `loadOntology` is the canonical session-mutating API. The axiom set for a single property can include:

- **Property-characteristic axioms** (transitivity, symmetry, reflexivity, functionality, asymmetry, irreflexivity)
- **Subproperty axioms** (`P(x,y) → Q(x,y)` where Q is the declared parent in ARC)
- **Inverse axioms** (`P(x,y) ↔ Q(y,x)`)
- **Domain and range axioms** (typed via `rdf:type` predicates)
- **Bridge axioms** (relation-specific, e.g., the C-extension axiom for Connected With)
- **Disjointness axioms** (`SDC` and `GDC` disjoint, etc., when classes are touched)

Axiom injection is monotonic and de-duplicating: loading an axiom that's already present is a no-op. The order of injection is deterministic (lexicographic by ARC manifest IRI) to support byte-stable output.

### 5.3 Class-level lifting

Class assertions (`x rdf:type C`) become unary predicates `c(x).` Class hierarchy from `rdfs:subClassOf` becomes implication axioms `c(X) :- c_sub(X)`. Equivalent classes generate biconditional axioms.

OWL class expressions (intersection, union, complement, restrictions) are lifted to corresponding Prolog forms. Existential restrictions (`owl:someValuesFrom`) are lifted with a Skolem constant per restriction instance to preserve the existential. Universal restrictions (`owl:allValuesFrom`) become implications. ADR-007 (forthcoming) will record the full class expression lifting algorithm.

### 5.4 Inference closure

After lifting and axiom injection, the projector requests the inference closure of the FOL state for any property/class set the user queries. The closure is computed by Tau Prolog's standard SLD resolution with cycle-detection guards (per ADR-011). Tau Prolog's native SLD resolution is incomplete on recursive Horn clauses — symmetry, transitivity, and identity-propagation axioms loop indefinitely under naive evaluation. The lifter rewrites these axioms to thread visited-ancestor lists, guaranteeing termination on finite graphs.

The closure may still be partial in practice (deep chains can hit a configurable depth bound even with cycle detection); v0.1.2 sets the bound at 50 by default and emits a `closure_truncated` Loss Signature record if the bound is hit. v0.2 will replace the visited-ancestor approach with proper SLG tabling (memoization), removing both the looping problem and the depth-bound heuristic.

**Proof-path multiplication.** Identity propagation under `same_as` (§5.5) and connection propagation under the parthood-extension bridge (§3.4.1) can produce many equivalent proof paths to the same conclusion. Under the v0.1.x cycle-detection approach, this manifests as repeated work: the resolver may derive `C(observer, region_b)` via two distinct chains (see §3.4.1's worked example) and explore both. Cycle detection prevents non-termination, but does not deduplicate semantically-equivalent derivations. v0.2's SLG tabling addresses this directly via answer memoization. For v0.1.x, implementations may add an answer-deduplication pass over the closure as an optimization; it is not required for correctness.

SLD resolution is sound and complete only for the Horn-clause fragment. ARC's axioms are deliberately restricted to the Horn fragment to preserve this completeness; any non-Horn axiom encountered (e.g., disjunctive consequents) is handled via Annotated Approximation rather than by extending the resolution algorithm. This is a deliberate scope choice consistent with edge-canonical execution: implementing a tableau reasoner in JavaScript is feasible (ELK demonstrates it for the EL profile) but is out of scope for v0.1.

### 5.5 Identity handling (UNA axis)

OWL 2 DL does not make the Unique Name Assumption; Tau Prolog does. The lifter must bridge this gap so that identity reasoning in the source OWL is preserved in the lifted FOL state.

#### 5.5.1 owl:sameAs lifting

Each `owl:sameAs` triple `x owl:sameAs y` lifts to a fact in a dedicated `same_as/2` predicate:

```prolog
same_as(x, y).
```

The lifter injects the standard equivalence-relation axioms for `same_as`:

```prolog
same_as(X, X) :- entity(X).                       % reflexivity (guarded)
same_as(X, Y) :- same_as(Y, X).                   % symmetry
same_as(X, Z) :- same_as(X, Y), same_as(Y, Z).    % transitivity
```

This makes `same_as` an equivalence relation in the FOL layer.

#### 5.5.2 Identity propagation

Identity must propagate through other relations: if `same_as(a, b)` holds and `p(a, c)` is a fact, then `p(b, c)` must also hold (and conversely). The lifter implements this by injecting, for every binary predicate `p` used in the graph, identity-aware variants:

```prolog
p(X, Y) :- same_as(X, X1), p_orig(X1, Y).
p(X, Y) :- p_orig(X, Y1), same_as(Y1, Y).
```

where `p_orig` is the directly-asserted form. In practice the lifter rewrites the original `p(a, b)` facts as `p_orig(a, b)` and uses the two rules above to define `p`. This preserves source identifiers (no rewriting of the graph), making structural round-trip parity straightforward, at the cost of additional resolution steps per query.

An alternative implementation — pre-computing equivalence classes and rewriting all identifiers to canonical class representatives — is faster but loses traceability to the original `owl:sameAs` triples and complicates projection. ADR-010 records the choice of the rule-based approach for v0.1.

#### 5.5.3 owl:differentFrom lifting

Each `owl:differentFrom` triple `x owl:differentFrom y` lifts to:

```prolog
different_from(x, y).
different_from(X, Y) :- different_from(Y, X).     % symmetry
```

Critically, `different_from` is *not* the same as `\+ same_as`. The former is an asserted distinctness; the latter is failure-to-prove-equality, which under OWA does not entail distinctness. ARC injects the consistency axiom:

```prolog
inconsistent :- different_from(X, Y), same_as(X, Y).
```

so that the validator can detect contradictions but does not collapse the two notions.

#### 5.5.4 Projection back to OWL

When projecting Prolog results back to OWL, the projector does *not* introduce `owl:differentFrom` assertions for individuals merely shown to be distinct under Prolog's UNA. Distinctness in the projected OWL is asserted only when:

- the source graph already contained the `owl:differentFrom` triple, or
- the inference produced a `different_from` fact via ARC's identity reasoning over source `same_as` and `different_from` data

Spurious distinctness from Prolog's operational UNA is suppressed, with a `una_residue` Loss Signature record emitted for any Prolog-level distinctness that does not survive this filter.

### 5.6 Datatype property handling

OWL distinguishes object properties (relating individuals to individuals) from datatype properties (relating individuals to typed literals). The lifter handles both, but the FOL forms differ.

#### 5.6.1 Lifting datatype assertions

A datatype property assertion `x p "literal"^^xsd:type` lifts to a Prolog fact with the literal carried as a typed term:

```prolog
p(x, literal('value', xsd_string)).
p(x, literal('42', xsd_integer)).
p(x, literal('2026-05-01', xsd_date)).
```

The two-argument `literal/2` term preserves both the lexical form and the datatype IRI, allowing round-trip projection without lossy conversion. ARC declares `literal/2` as a reserved predicate; user ontologies must not use this name.

#### 5.6.2 Datatype property characteristics

OWL 2 permits datatype properties to be declared functional (one value per subject). The lifter injects functionality as a constraint axiom:

```prolog
inconsistent :- p(X, literal(V1, T)), p(X, literal(V2, T)), V1 \= V2.
```

Other DL property characteristics (transitivity, symmetry, inverse) do not apply to datatype properties.

#### 5.6.3 Projection back to OWL

Datatype property assertions project as Direct Mapping in all cases. Property-Chain Realization and Annotated Approximation do not apply: chains over datatype properties are not permitted in OWL 2 DL, and there is no DL feature beyond which a datatype property assertion would need approximation.

#### 5.6.4 Datatype reasoning

OFBT v0.1 does *not* perform datatype-value reasoning (e.g., inferring that `42 < 50` or that `"2026-05-01"` precedes `"2026-06-01"`). Such reasoning belongs to OWL 2's `(D)` extension and to specific datatype reasoners. The lifter preserves the literals; ARC does not inject ordering or arithmetic axioms. This is consistent with the edge-canonical scope and with ARC's restriction to ontological relations rather than concrete-domain reasoning.

#### 5.6.5 Lexical canonicalization and language tags

For round-trip fidelity to be byte-stable (acceptance criterion §12.9), datatype literals must be normalized to canonical form on lift. v0.1 specifies:

**XSD canonical lexical forms.** Numeric and date literals are converted to their XSD canonical lexical form (W3C XML Schema Datatypes 1.1, §4 "Lexical Mappings"). Examples:

- `"42"^^xsd:integer` → `"42"^^xsd:integer` (already canonical)
- `"+42"^^xsd:integer` → `"42"^^xsd:integer` (sign normalized)
- `"42.0"^^xsd:integer` → invalid; rejected with diagnostic
- `"2026-5-1"^^xsd:date` → `"2026-05-01"^^xsd:date` (zero-padded)
- `"true"^^xsd:boolean` → `"true"^^xsd:boolean` (already canonical)
- `"1"^^xsd:boolean` → `"true"^^xsd:boolean` (canonical form)

The canonical form is stored in the `literal/2` term. Round-trip preserves the canonical form: a source `"+42"^^xsd:integer` projects back as `"42"^^xsd:integer`. This is a deliberate canonicalization, not loss; the original lexical form is recoverable from a Recovery Payload (§7.3) if the user requests strict-byte-preservation mode.

**Language tags.** RDF language-tagged literals (`"hello"@en`, `"bonjour"@fr`) lift to a three-argument literal term:

```prolog
p(x, literal('hello', xsd_string, 'en')).
p(x, literal('bonjour', xsd_string, 'fr')).
```

Language tags are normalized to lowercase per BCP 47 / RFC 5646. Two literals with the same lexical form but different language tags are not equal in the FOL layer.

**Value-space equality.** Two literals with different lexical forms but the same value (e.g., `"42"^^xsd:integer` and `"42.0"^^xsd:decimal`) are *not* equated by OFBT v0.1. They lift as distinct `literal/2` terms. Implementing value-space reasoning is out of scope for v0.1; v0.2 may revisit if ARC extends to concrete-domain relations. A `lexical_distinct_value_equal` Loss Signature record is emitted if the validator detects a graph that depends on this equality holding.

**Plain literals (rdf:langString and untyped).** Untyped string literals lift as `literal('value', xsd_string, '')` (empty language tag). RDF 1.1 mandates that all untyped literals are `xsd:string`; OFBT follows this rule.

### 5.7 Blank node Skolemization

OWL ontologies use blank nodes (b-nodes) pervasively for anonymous instances and complex class expressions: every `owl:Restriction`, `owl:intersectionOf` list, `owl:unionOf` list, axiom annotation, and `owl:Class` defined by extension introduces b-nodes. RDF treats b-nodes as locally-scoped existential variables — their identity is meaningful only within the graph that introduces them, and any serialization round trip is permitted to mint new b-node identifiers.

This is incompatible with OFBT's structural round-trip parity contract (§8). Tau Prolog has no native b-node concept, and Oxigraph may legitimately re-mint b-node IDs on serialization. Without deterministic handling, a graph with b-nodes cannot satisfy structural round-trip parity even if every other aspect of the lift and project is correct.

#### 5.7.1 Canonicalization via RDFC-1.0

OFBT delegates b-node canonicalization to the W3C standard algorithm: **RDF Dataset Canonicalization 1.0** (W3C Recommendation, 2024). RDFC-1.0 is an isomorphism-safe canonical labeling algorithm developed precisely to solve the problem of stable b-node identity across serialization round trips. It supersedes the URDNA2015 algorithm (which RDFC-1.0 calls RDFC-1.0) and is the standard tooling for content-hashing RDF graphs, including for verifiable credentials and data integrity proofs.

The v0.1.2 spec sketched a "triple closure with fixed point" approach. That sketch was an under-specification — it did not solve the canonicalization problem for graphs with cyclic or symmetric b-node subgraphs, where naive closure-based hashing produces different outputs for isomorphic graphs. RDFC-1.0 handles these cases via its hash-based label assignment with iterative refinement. Adopting RDFC-1.0 closes that gap completely.

#### 5.7.2 Algorithm summary

The RDFC-1.0 specification defines the procedure in full; OFBT does not restate it. Briefly:

1. The lifter applies RDFC-1.0 to the input graph, producing a canonical N-Quads serialization in which every b-node has been assigned a deterministic identifier of the form `_:c14n<N>`.
2. The lifter Skolemizes the canonical b-node identifiers as Prolog atoms: `_:c14n0` becomes `bn_c14n0`, `_:c14n1` becomes `bn_c14n1`, etc.
3. A registry is maintained: `bnode_registry: Map<source_bnode_id, canonical_id>` and `Map<canonical_id, source_bnode_id>` (bidirectional).

The RDFC-1.0 output is byte-stable for isomorphic inputs, satisfying the determinism requirement of acceptance criterion §12.9.

#### 5.7.3 Lifting b-nodes to Prolog

Every triple involving a source b-node lifts with the canonical Skolem atom in place of the b-node. From Tau Prolog's perspective, b-nodes are simply named individuals with the prefix `bn_c14n`.

#### 5.7.4 Projection: restoring b-nodes

When projecting the FOL state back to OWL, the projector consults the registry:

- Skolem atoms matching registered canonical IDs are restored to their source b-node identifiers (via the reverse map). This preserves the user-facing b-node labels they had on input.
- Skolem atoms *not* in the registry — introduced during FOL inference, not present in the source — are emitted as fresh b-nodes with `_:ofbt_<hash>` identifiers, distinguishable from source b-nodes. A `bnode_introduced` Loss Signature record is emitted.

#### 5.7.5 Implementation note

RDFC-1.0 reference implementations exist in JavaScript (the `rdf-canonize` library, used by jsonld.js and other widely-deployed tools) and in Rust (used by Oxigraph). v0.1.x SHOULD use one of these reference implementations rather than re-implementing the algorithm. ADR-016 records the dependency and notes that this is the only external library dependency outside the core stack (Tau Prolog, Oxigraph) — and is justified because RDFC-1.0 is sufficiently complex that a from-scratch implementation would be a significant correctness risk.

#### 5.7.6 Interaction with owl:sameAs

If a `owl:sameAs` triple involves a b-node — e.g., `:Alice owl:sameAs _:b01` — the b-node is canonicalized as usual, then identity propagation (§5.5.2) treats the canonical Skolem constant as it would any other named individual. In effect, asserting `sameAs` between a named individual and a b-node collapses the b-node's identity to the named individual's, which is the correct OWL semantics.

The order of operations during ingestion: (1) RDFC-1.0 canonicalization, (2) class assertion lifting, (3) property assertion lifting, (4) identity-propagation rule injection. Reversing these steps causes registry-lookup failures (the identity rules generate `_orig`-suffixed predicates that the canonicalization step would not have indexed).

### 5.8 Domain and range semantics

This section addresses a high-correctness-risk pattern in OWL-to-FOL translation. Per Fandaws Consumer Requirement §3.5 (HIGH RISK, §10.1), domain and range axioms have a specific FOL meaning that is easy to mistranslate. Both the lifter implementer and downstream consumers will be tempted to existentialize them. The wrong translation produces false universal axioms that pass casual tests and corrupt downstream reasoning. This section specifies the correct translation explicitly and forbids the wrong one.

#### 5.8.1 The correct translation

**`rdfs:domain(P, X)` lifts to:**

```prolog
x(S) :- p(S, _).
```

corresponding to the FOL axiom:

```
∀x,y. P(x,y) → X(x)
```

**`rdfs:range(P, X)` lifts to:**

```prolog
x(O) :- p(_, O).
```

corresponding to the FOL axiom:

```
∀x,y. P(x,y) → X(y)
```

These are **conditional axioms**. They state: *if* a property assertion `P(a, b)` holds, *then* `a` is in the domain class and `b` is in the range class. The conditional form is essential. Domain and range constrain types where the property is asserted; they do not require the property to be asserted on every member of the domain class.

#### 5.8.2 The wrong translation, explicitly forbidden

The lifter MUST NOT translate domain/range axioms as existential restrictions on the class:

```
WRONG: rdfs:domain(P, X) → X ⊑ ∃P.⊤
WRONG: rdfs:range(P, X)  → ⊤ ⊑ ∀P.X
```

The first wrong translation says: *every* member of `X` participates in `P` with some target. This is a synthesized universal axiom that is not in the source. It produces false conclusions: under this translation, asserting `X(a)` would entail the existence of a successor `b` such that `P(a, b)`, which the source did not assert.

The second wrong translation says: every property `P` assertion has a range in `X`. While this is closer to correct, the universal-restriction form is over-strong in OWL DL: it commits to the closure that `P` only ever has range members in `X`, which is not what `rdfs:range` asserts under standard semantics.

#### 5.8.3 Worked example

**Source OWL:**

```turtle
prov:wasInfluencedBy rdfs:domain prov:Entity .
prov:wasInfluencedBy rdfs:range  prov:Entity .

:project_alpha prov:wasInfluencedBy :project_beta .
```

**Correct lifted FOL:**

```prolog
% Conditional domain axiom
prov_entity(S) :- prov_wasinfluencedby(S, _).

% Conditional range axiom
prov_entity(O) :- prov_wasinfluencedby(_, O).

% Asserted property
prov_wasinfluencedby(project_alpha, project_beta).
```

Querying `prov_entity(X)` returns: `project_alpha`, `project_beta`. Both are correctly derived as Entity instances *because* they participate in the property assertion. Other individuals not participating in the property are not falsely inferred to be Entities.

**Wrong lifted FOL (must not emit):**

```prolog
% WRONG: existentialize on domain — synthesizes a universal axiom not in source
prov_wasinfluencedby(X, skolem_for_X) :- prov_entity(X).

% WRONG: universalize on range — over-strong commitment
% (no clean Horn rendering; would corrupt closure)
```

Under the wrong translation, asserting any new `prov_entity(X)` would synthesize a `prov_wasinfluencedby` assertion for a Skolem successor — a fact not in the source.

#### 5.8.4 Why this is high-risk

The wrong translation passes most casual tests:

- Structural round-trip parity may pass because the wrong axioms are also stable under round-trip
- Direct queries on the source's actual assertions may return correct results
- The wrong axioms become visible only when the user asserts a *new* class membership and the system synthesizes successors that the user did not authorize

The visible failure mode is downstream: BFO Disjointness Map firing on the synthesized successors, falsely concluding that a graph is inconsistent because the wrong-translation axioms forced individuals into classes their source membership did not warrant.

#### 5.8.5 Test fixtures (mandatory)

The v0.1 test corpus (§14 Q5) MUST include explicit test fixtures verifying the conditional translation:

1. A fixture asserting `rdfs:domain(P, X)` and a property assertion `P(a, b)`. After lift, querying `X(a)` must succeed; querying `X(c)` for an unrelated `c` must not succeed by entailment.
2. A fixture asserting `rdfs:range(P, X)` and `P(a, b)`. After lift, querying `X(b)` must succeed; querying `X(d)` for unrelated `d` must not succeed by entailment.
3. A fixture asserting `rdfs:domain(P, X)` with no property assertions. After lift, no individual is an `X` (the domain axiom alone does not populate the class).

The fixtures are part of acceptance criteria §12 (criterion 13, added in v0.1.4).

### 5.9 Caller-declarable structural annotations

Standard OWL semantics treats annotation properties as opaque metadata: they round-trip but do not participate in inference. This is correct for the broad case (labels, comments, provenance metadata).

Some consumers, however, use specific annotation property IRIs as *structural signals* that must participate in inference. Fandaws Consumer Requirement §3.6 cites `fandaws:bfoSubcategory`, `fandaws:relationCharacteristics`, and similar properties whose values drive the BFO bucket inference and Workbench Phase 3 orphan rule.

The library cannot know in advance which annotation IRIs are inference-relevant — that decision belongs to the consumer. OFBT therefore exposes a per-session declaration:

```
configuration.structuralAnnotations: Set<IRI>
```

For every IRI in this set, the lifter treats annotation triples involving that IRI as load-bearing: they emit FOL predicates that participate in resolution, just as object property triples do. Annotation triples involving IRIs *not* in this set are skipped per OWL standard (preserved in Oxigraph for round-trip but not lifted to Tau Prolog).

#### 5.9.1 Lifting rules for declared annotations

For an annotation triple `(s, p, o)` where `p` is in the declared set:

- **Object as IRI.** Lift as `p(s, o).` — same form as an object property assertion.
- **Object as typed literal.** Lift as `p(s, literal('value', xsd_type)).` — same form as datatype property (§5.6).
- **Object as plain string literal.** Lift as `p(s, literal('value', xsd_string, '')).`

The lifter does not inject ARC axioms for declared structural annotations — there are no domain/range, characteristics, or hierarchy declarations on annotation properties. The predicates exist as facts; reasoning over them depends on caller-supplied rules or queries.

#### 5.9.2 Recovery Payload

Every fact lifted from a declared structural annotation emits a Recovery Payload entry of type `structural_annotation_caller_declared`. This makes the caller's declaration visible to downstream consumers reading the projection: a consumer can see which FOL predicates were caller-asserted versus ARC-derived.

#### 5.9.3 Round-trip preservation

On projection, the projector reads the Recovery Payload entries and restores annotation triples to their original form. This preserves:

- The triple's annotation status (still an annotation in the projection)
- The original literal form (lexical and datatype, post-canonicalization per §5.6.5)
- Co-occurring annotations on the same subject

Structural round-trip parity holds because the structural-annotation declaration is itself part of the projection metadata: on re-lift, the same declaration recreates the lifted predicates.

#### 5.9.4 Interaction with closure scope

A declared structural annotation may be added to `closedPredicates` (Axis B, §3.5.2) at query time. This closes that specific annotation predicate for the query, supporting the per-predicate CWA pattern. NAF on a closed structural annotation projects to a negative annotation assertion in the output Manifest's Recovery Payload set; the OWL graph itself does not assert annotation negation (there is no standard OWL construct for that).

---

## 6. Projection Engine (FOL → OWL)

### 6.1 Projection strategies

#### 6.1.0 Semantic preservation taxonomy

Before specifying the three projection strategies, this section establishes the vocabulary the rest of §6 and §7 use. The v0.1.2 spec used "loss" inconsistently — calling property-chain realization "informational, not a defect" in one place and a "loss type" in another. v0.1.3 separates three distinct relationships between the FOL form of an axiom and its OWL projection:

**Equivalent encoding.** The OWL form is *logically equivalent* to the FOL form. No semantic content is added or removed; the encoding is just different. Examples: an OWL `TransitiveObjectProperty` declaration is logically equivalent to its Prolog rule form `p(X,Z) :- p(X,Y), p(Y,Z)`. A `SubClassOf` declaration is equivalent to a Horn implication. Equivalent encodings need no recovery metadata; they are perfectly bidirectional.

**Reversible approximation.** The OWL form is *weaker* than the FOL form (it doesn't entail everything the FOL form does), but the FOL form is *fully recoverable* from accompanying metadata. The annotation carries the original FOL axiom; the lifter, on reading the annotation, restores the FOL form exactly. Examples: a property chain that captures part but not all of an FOL implication, with the FOL form preserved in `ofbt:originalFOL`. An axiom that exceeds OWL 2 DL but is preserved as an annotation. Reversible approximations need a Recovery Payload (§7.3) to make structural round-trip parity work.

**True loss.** Information is genuinely lost — not recoverable from the projected output, even with the metadata. Examples: closure truncation (a fact that would have been derived if depth bound permitted, but wasn't); NAF residue (a complex refutation that cannot be projected and isn't preserved). True losses need a Loss Signature (§7.2) so the validator and human reviewers can see what was given up.

#### 6.1.0.1 The three strategies, by taxonomy

| Strategy | Taxonomy class | Recovery? |
|---|---|---|
| Direct Mapping | Equivalent encoding | Not needed |
| Property-Chain Realization | Equivalent encoding (when chain captures FOL exactly) or Reversible approximation (when chain is an OWL-side encoding of an FOL implication preserved in annotation) | Recovery Payload, conditional |
| Annotated Approximation | Reversible approximation | Recovery Payload, always |

True loss does not arise from strategy selection. It arises from operational limits (depth bounds, NAF, fallback-path unknowns). Loss Signature records are emitted by these mechanisms, not by the strategy router.

#### 6.1.0.2 Projection provenance (mandatory preamble)

Every projected output graph carries provenance metadata, regardless of which strategy was used for any individual axiom. The hazard this addresses: if OFBT projects a modified version of `bfo-2020.owl` and the output retains the source ontology's `owl:versionIRI`, downstream consumers conflating the two graphs receive contradictory inference results from what they believe to be the same ontology. This is the "semantic poison pill" hazard.

**Required output provenance — the Projection Manifest.** Every projected graph must include the following triples on its ontology declaration:

```turtle
<projected-ontology-iri> a owl:Ontology ;
    owl:versionIRI <ofbt-minted-version-iri> ;
    ofbt:projectedFrom <source-version-iri-or-content-hash> ;
    ofbt:projectionTimestamp "<ISO8601>"^^xsd:dateTime ;
    ofbt:projectorVersion "OFBT-0.1.3" ;
    ofbt:arcManifestVersion "<ARC-version>" ;
    ofbt:operatingMode "strict" | "permissive" ;
    prov:wasGeneratedBy [
        a ofbt:ProjectionActivity ;
        prov:startedAtTime "<ISO8601>"^^xsd:dateTime ;
        prov:endedAtTime "<ISO8601>"^^xsd:dateTime ;
        prov:used <source-graph-iri> ;
    ] .
```

**Rules for the `owl:ontologyIRI`:** Preserved. If the source carried `<X> a owl:Ontology`, the projection retains `<X>` as the ontology IRI. This identifies the ontology's logical identity, which is unchanged by projection.

**Rules for the `owl:versionIRI`:** Always minted fresh, under an OFBT-controlled namespace:
```
https://ofbt.example.org/projection/<source-content-hash>/<timestamp>
```
This IRI must differ from any version IRI in the source. The projected graph must not claim to be the source version.

**Rules for `ofbt:projectedFrom`:** Points to the source `owl:versionIRI` if the source had one. Otherwise points to a content-hash IRI of the source graph: `urn:sha256:<hex>`.

**Rules for the projection activity:** A `prov:wasGeneratedBy` triple references an `ofbt:ProjectionActivity` blank node recording start time, end time, and the source graph used. This enables W3C PROV-O-compatible tooling to trace projection lineage.

#### 6.1.0.3 Reading the projection metadata: consumer guidance

The provenance metadata makes both consumer interpretations possible. Consumers should choose based on their task:

**Substitution consumers** want to use the projection in place of the source. They should:
- Verify `ofbt:projectedFrom` points to the version they expect
- Use `ofbt:operatingMode` to gauge the soundness level
- Inspect Loss Signatures (§7.2) for any genuine information loss before substituting

**Augmentation consumers** want to combine the projection with the source. They should:
- Treat the projection as a derived view, not a replacement
- Resolve conflicts in favor of the source where they disagree
- Read Recovery Payloads (§7.3) to understand the FOL the projection encodes

The spec does not pick one of these as "the right way" — both are legitimate, and the metadata supports both. ADR-013 records this dual-consumer commitment.

**Annotation-only mode.** If a user wants OFBT to *check* structural round-trip parity without producing a fresh graph (e.g., for CI validation), the `--no-output` flag suppresses graph emission entirely. Provenance applies only to emitted graphs.

The projector applies one of three strategies per axiom or inferred fact:

#### 6.1.1 Direct Mapping

Used when the FOL axiom is directly expressible in OWL 2 DL. Examples:

| FOL form | OWL realization |
|---|---|
| `c(x).` | `ClassAssertion(C, x)` |
| `c1(X) :- c2(X).` | `SubClassOf(C2, C1)` |
| `p(x,y).` | `ObjectPropertyAssertion(P, x, y)` |
| `p(X,Y) :- p(Y,X).` | `SymmetricObjectProperty(P)` |
| `p(X,Z) :- p(X,Y), p(Y,Z).` | `TransitiveObjectProperty(P)` |
| `\+ p(x,y).` (where x, y are named individuals and p is simple) | `NegativeObjectPropertyAssertion(P, x, y)` |

No Loss Signature is emitted for Direct Mapping. The projection is lossless.

#### 6.1.2 Property-Chain Realization

Used when the FOL axiom is a derived implication of the form `P₁(x,y) ∧ P₂(y,z) → P₃(x,z)` or its n-step generalization, and the chain is a regular role inclusion (per OWL 2 DL's regular property hierarchy constraint). Realized as `owl:propertyChainAxiom`.

Property-Chain Realization targets the **R feature** in SROIQ — limited complex role inclusion axioms. SROIQ admits chains under a regularity constraint (Horrocks, Kutz, and Sattler, 2007) precisely because unrestricted chain composition leads to undecidability. The "limited" in "limited complex role inclusion" is exactly the constraint OFBT enforces in §6.2's strategy selector. This grounds the strategy's behavior in the standard DL literature: OFBT does not invent the regularity restriction, it imports it from SROIQ as the defining constraint of the R feature.

The canonical example is the deontic chain from RDM v1.2.1:

```
realizes(P, R) ∧ concretizes(R, D) → realizesDirective(P, D)
```

projected as:

```turtle
ofi:realizesDirective owl:propertyChainAxiom (
  obo:BFO_0000055   # realizes
  obo:BFO_0000058   # concretizes
) .
```

A Loss Signature record of type `property_chain_realization` is emitted, recording the original FOL form and the chain used. The Loss Signature is informational, not a defect — structural round-trip parity holds because the lifter, on reading the chain, regenerates the original implication.

#### 6.1.3 Annotated Approximation

Used when the FOL axiom exceeds OWL 2 DL expressivity. Categories:

- Axiom violates the simple-property restriction (transitive + asymmetric, transitive + functional, etc.)
- Axiom uses arity greater than supported (after temporal flattening)
- Axiom uses negation in non-projectable contexts
- Axiom uses unrestricted quantification

The OWL projection drops the axiom from the asserted graph and emits an annotation property carrying:

```turtle
ofbt:annotatedAxiom [
  ofbt:lossSignatureId "<UUID>" ;
  ofbt:originalFOL "<CL or KIF string>" ;
  ofbt:approximationStrategy "<strategy_name>" ;
  ofbt:reason "<DL_violation_category>" ;
] .
```

The lifter, on reading an annotated approximation, restores the original FOL axiom from the `ofbt:originalFOL` payload. This is the mechanism that makes structural round-trip parity possible across the expressivity gap.

### 6.2 Strategy selection algorithm

For a candidate axiom `A` to be projected:

```
function selectStrategy(A):
    // Tier 1: Coherence guard (§8.5)
    if directMappingOrChainOf(A) would cause coherence collapse:
        return ANNOTATED_APPROXIMATION  // with coherence_violation Loss Signature

    // Tier 2: Direct Mapping eligibility
    if A matches Direct Mapping pattern:
        return DIRECT_MAPPING

    // Tier 3: Property Chain eligibility
    elif A is a regular role inclusion P₁ o P₂ o ... o Pₙ ⊑ Q:
        if regularityCheck(A, importClosure) succeeds:
            return PROPERTY_CHAIN
        elif regularityCheck(A, currentGraph) succeeds:
            return PROPERTY_CHAIN  // with regularity_scope_warning Recovery Payload note
        else:
            // Falls through

    return ANNOTATED_APPROXIMATION
```

The selection is deterministic given a fixed input, fixed ARC manifest, and fixed import closure.

#### 6.2.1 Tiebreaking for borderline cases

Three cases that v0.1.2's terser algorithm did not address:

**Case A: Regularity holds only under specific imports.** A property chain may be regular when the full import closure is loaded but not when only a subset is. OFBT v0.1.x evaluates regularity against the *currently-loaded* graph, not against the abstract closure. If regularity holds in the loaded graph but the loaded graph is incomplete relative to the source's `owl:imports`, the projector emits the chain with a `regularity_scope_warning` annotation in the Recovery Payload, naming the imports actually loaded. Consumers loading additional imports later may need to re-validate.

**Case B: Direct Mapping eligible but coherence-collapsing.** When an axiom is patternable as Direct Mapping but the resulting OWL would force a class to `owl:Nothing` (cf. §8.5), the projector diverts to Annotated Approximation. This is Tier 1 of the algorithm. Example: a property characteristic that, combined with existing disjointness, makes a class unsatisfiable. The FOL form is preserved in the Recovery Payload; the OWL omits the characteristic and adds the annotation. A `coherence_violation` Loss Signature is also emitted (this is the only case where a true Loss Signature accompanies a Recovery Payload — the loss is the OWL form's reduced strength, the recovery is the FOL preservation).

**Case C: Multiple valid encodings.** Some axioms are expressible in OWL via more than one DL feature. For example, an inverse functional property could be projected as `InverseFunctionalProperty(P)` directly, or as a Direct Mapping derivation involving `owl:sameAs`. OFBT prefers the **most specific direct DL feature** in this case: `InverseFunctionalProperty` is preferred over the equivalent `sameAs`-based encoding. The preference order is encoded per-relation in the ARC manifest's "preferred OWL encoding" column (added in v0.1.3); for relations without an explicit preference, the algorithm uses the first matching pattern in the order: characteristic → restriction → equivalence → SubClassOf → SubPropertyOf → annotation.

#### 6.2.2 Determinism guarantee

Strategy selection is part of byte-stable output (acceptance criterion §12.9). Implementations must ensure:

- Pattern matching is deterministic — no hash-table iteration order leakage
- The regularity check is deterministic — no random tiebreaking in cycle detection
- The preference order is fixed by the ARC manifest, not by configuration

A deterministic selection means: given the same input graph, ARC manifest version, and operating mode, the projector always produces the same output. This is testable directly and is part of the v0.1.x test suite.

### 6.3 Negation handling (open-world default, per-predicate closure)

OWL is open-world; Tau Prolog's NAF is closed-world; the projector must mediate this gap correctly. v0.1.3's negation handling treated this as a binary OWA/CWA choice. v0.1.4 refines it to per-predicate closure scope per §3.5.2 (Axis B), which is what real consumers (Fandaws Consumer Requirement §3.9.2) actually need.

#### 6.3.1 Default behavior (OWA, no closed predicates)

When no `closedPredicates` set is supplied at query time, OFBT operates in pure OWA mode:

- NAF results for any predicate remain in FOL only. They do *not* project to OWL.
- Each NAF result emits a `naf_residue` Loss Signature record with the failing goal preserved as FOL string.
- The earlier draft's use of `owl:disjointWith` for projecting refuted facts is forbidden: `owl:disjointWith` is a class-level relation only and does not express individual-level negation. ADR-009 records the corrected negation projection rules.

This is the default and matches the architectural commitment in §1.1: Prolog's CWA is local and operational; OFBT does not propagate it into projected OWL.

#### 6.3.2 Per-predicate CWA mode

When the caller supplies a `closedPredicates` set at query time, the listed property IRIs are treated as closed-world for that query. NAF results on those predicates project to OWL negation:

- `\+ p(x, y)` where `p ∈ closedPredicates`, `x` and `y` are named individuals, and `p` is simple → `NegativeObjectPropertyAssertion(P, x, y)`
- `\+ c(x)` where the class `C` is treated as closed (via inclusion in `closedPredicates` for a class-membership predicate) → `ClassAssertion(ObjectComplementOf(C), x)`
- General `\+ φ` where `φ` involves any unclosed predicate, or where `φ` is a complex formula spanning closed and open predicates → not projected. Result remains in FOL with `naf_residue` Loss Signature.

The closed-predicate set is supplied per-query, not per-session. This matches the Fandaws pattern where Wave 0/1 helpers operate over curated finite lists per-predicate, with the closure scope determined by the helper's intent rather than as a global setting.

#### 6.3.3 What "closed" means semantically

Closing a predicate `p` for a query means: for the duration of that query, OFBT treats the explicitly-asserted `p`-facts and their inference closure as exhaustive. If the closure does not contain `p(a, b)`, then `\+ p(a, b)` succeeds and is projected as a negative assertion.

This is sound only when the caller has a justified reason to believe the closure is exhaustive — typically because the predicate represents a curated finite list (a roster, a registry, an enumerated set of valid roles). Closing a predicate that is not actually exhaustive in the closure is a caller error and produces incorrect projections.

OFBT does not validate the caller's exhaustiveness claim. The closed-predicate set is trusted at face value. Validating exhaustiveness would require the OWL reasoner OFBT explicitly does not depend on (§13). The contract with the caller is: you assert the predicate is closed; OFBT projects accordingly; you are responsible for the soundness of that assertion.

#### 6.3.4 Whole-ontology CWA explicitly not supported

OFBT does not support whole-ontology CWA. Closure is per-predicate, on a curated finite set. A caller asking to "treat the whole graph as closed-world" must enumerate every predicate they want closed; there is no single flag to flip the entire graph into CWA.

This restriction is intentional. Whole-ontology CWA collapses the open-world reasoning that OWL was designed for and is rarely the right semantic in real ontology engineering. Per-predicate CWA, scoped to specific curated lists, is what real consumers need. ADR-020 (forward-referenced) records this commitment.

#### 6.3.5 Composition with structural annotations

A declared structural annotation predicate (§5.9) may appear in `closedPredicates`. The closure scope applies to it the same way it applies to ARC-managed predicates. NAF on a closed annotation predicate projects to a negative annotation assertion in the Recovery Payload (the OWL graph does not assert annotation negation directly; there is no standard OWL construct for that).

### 6.4 Fallback path for unknown relations

If a property in the lifted state has no ARC entry (per §4.4's coverage check), the projector cannot apply ARC-grounded strategies. The fallback:

- Class assertions and basic triples still project as Direct Mapping (these don't require ARC content)
- Inferred facts involving unknown properties are projected as Direct Mapping with a `unknown_relation` Loss Signature record
- No property characteristics are projected (the lifter never injected any)

Strict mode (`--strict`) refuses ingestion if any property lacks ARC coverage; default mode degrades gracefully to this fallback.

---

## 7. Audit Artifacts: Loss Signature, Recovery Payload, Projection Manifest

### 7.1 Why three artifacts, not one

The v0.1.2 spec used a single "Loss Signature" artifact for five different purposes: audit trail, recovery payload, parity residue, provenance record, and debugging surface. SME review correctly identified this as conceptual overload — five responsibilities in one schema means the schema will expand in incompatible directions over time as different consumers extend it for different needs.

v0.1.3 separates them into three distinct artifacts:

- **Loss Signature** — true loss only. Information that was genuinely dropped and is not recoverable from the projected output. Audit/debugging surface.
- **Recovery Payload** — reversible approximations. Information that was preserved as annotation; the FOL form is recoverable by re-lifting.
- **Projection Manifest** — provenance and metadata. What was done, when, by which projector, in which mode.

The three artifacts are co-located in the projected graph but use distinct vocabularies and distinct semantics. ADR-014 records this separation.

### 7.2 Loss Signature

**Purpose.** Records true information loss for audit, debugging, and validation accounting.

**When emitted.** Only when information is genuinely lost — not recoverable from the projection output.

**Schema** (JSON-LD):

```json
{
  "@type": "ofbt:LossSignature",
  "@id": "ofbt:ls/<content-hash>",
  "ofbt:lossType": "<type>",
  "ofbt:relationIRI": "<URI>",
  "ofbt:reason": "<machine-readable reason code>",
  "ofbt:reasonText": "<human-readable explanation>",
  "ofbt:provenance": {
    "ofbt:sourceGraphIRI": "<URI>",
    "ofbt:arcVersion": "<version>",
    "ofbt:timestamp": "<ISO8601>"
  }
}
```

Note the absence of `ofbt:originalFOL` here — true loss means the FOL is not preserved in the artifact.

**Loss types (true loss only):**

| Type | When emitted |
|---|---|
| `closure_truncated` | Tau Prolog inference depth bound hit |
| `naf_residue` | NAF result not safely projectable, kept in FOL only |
| `unknown_relation` | Property has no ARC entry; fallback path applied; unrecoverable in strict-mode round trip |
| `arity_flattening` | n-ary FOL axiom flattened to binary OWL with information loss |
| `bnode_introduced` | New b-node introduced during FOL inference, not present in source registry |
| `coherence_violation` | Direct Mapping or Property-Chain Realization would collapse a class; diverted (loss is the OWL strength, recovery is in the Payload) |
| `lexical_distinct_value_equal` | Source graph depends on value-space equality across distinct lexical forms; not implemented in v0.1 |
| `una_residue` | Spurious distinctness from Prolog's UNA suppressed in projection |

### 7.3 Recovery Payload

**Purpose.** Carries the FOL form of a reversible approximation so the lifter can reconstitute it on round trip.

**When emitted.** When the projection uses Property-Chain Realization with FOL beyond the chain, or Annotated Approximation. Always recoverable.

**Schema** (JSON-LD):

```json
{
  "@type": "ofbt:RecoveryPayload",
  "@id": "ofbt:rp/<content-hash>",
  "ofbt:approximationStrategy": "PROPERTY_CHAIN | ANNOTATED_APPROXIMATION",
  "ofbt:relationIRI": "<URI>",
  "ofbt:originalFOL": "<CL or KIF string>",
  "ofbt:projectedForm": "<OWL/Turtle fragment>",
  "ofbt:axiomTemplate": "<template>",
  "ofbt:bindings": { "<var>": "<value>", ... },
  "ofbt:scopeNotes": [
    "regularity_scope_warning: chain regular under loaded imports only",
    ...
  ]
}
```

The lifter MUST be able to reconstruct the FOL state from the projected OWL plus the Recovery Payloads. Structural round-trip parity (§8) depends on this.

**A Recovery Payload may co-exist with a Loss Signature.** The `coherence_violation` case from §6.2.1 is the canonical example: the OWL output is weaker (Loss Signature) but the FOL is preserved in annotation (Recovery Payload). The two artifacts together describe the full transformation.

### 7.4 Projection Manifest

**Purpose.** Provenance metadata for the entire projection: what graph was projected, when, by which projector, in which mode.

**When emitted.** Once per projection, attached to the output ontology declaration. See §6.1.0.2 for the full schema.

**Distinguishing from the other two:** The Manifest describes the *projection event*. Loss Signatures and Recovery Payloads describe individual *axiom transformations*. A projection produces one Manifest and zero-or-more Loss Signatures and zero-or-more Recovery Payloads.

### 7.5 Determinism (across all three artifacts)

Loss Signature IDs and Recovery Payload IDs are content-addressed (hash of the relevant FOL axiom plus provenance). The Projection Manifest's content is determined by the projection event, except for timestamps which are recorded but excluded from the byte-stability hash. Identical inputs and identical ARC versions produce identical Loss Signature ledgers, identical Recovery Payload sets, and Manifest content that differs only in timestamp fields. This is required for reproducible round-trip validation.

---

## 8. Structural Round-Trip Parity Validation

### 8.1 The structural parity criterion

OFBT v0.1 defines correctness as **structural round-trip parity**:

> For an input graph G₁ in the v0.1 supported formats, let:
> - F₁ = lift(G₁)
> - F₂ = closure(F₁ ∪ ARC_axioms)
> - G₂ = project(F₂)
> - F₃ = lift(G₂)
>
> Structural round-trip parity holds iff F₃ ≡ F₂ modulo the Loss Signature ledger L.

The "modulo L" qualifier means: facts in F₂ but not F₃ must be reconstructible from L by the lifter, and facts in F₃ but not F₂ must be derivable by the closure step from F₃ ∪ ARC_axioms.

#### What "structural" means here, and what it does not claim

The v0.1 contract is **structural** in the FOL-state-content-equivalence sense: F₃ and F₂ contain the same FOL facts modulo the recorded Loss Signature ledger. This is a content-equivalence criterion at the lifted-FOL level — it tests that lift+project+re-lift reaches a state with the same axiom content (modulo recorded losses), not stronger semantic notions.

Specifically, structural round-trip parity is **necessary but not sufficient** for the following stronger senses:

- **Model-theoretic equivalence** — every model of the input graph is a model of the round-tripped graph and vice versa. v0.1 does not certify this; certifying it requires evaluator semantics that ship in Phase 3 (`evaluate()` per API §7.1) and a model-theoretic check beyond v0.1's scope.
- **Axiomatic equivalence** — `input ⊢ round-tripped` and `round-tripped ⊢ input` under classical FOL deduction. v0.1 does not certify this; the lifted FOL state's equivalence under structural parity is a content-content match modulo Loss Signatures, not a deductive bidirectional entailment proof.
- **Entailment-preserving** — every entailment of the input is an entailment of the round-tripped graph. v0.1's `evaluate()`-equivalent surface (the Phase 2 stub-evaluator harness) provides bounded-Horn-resolution checks against curated query fixtures; it is not a general entailment-preservation certificate. Phase 3's real `evaluate()` plus the per-canary reactivation discipline (Q-Frank-4 ruling 2026-05-07) is the v0.2 path to a stronger claim.

Stakeholder communications, demo materials, and downstream tooling MUST use the qualified term "structural round-trip parity" when referring to the v0.1 contract. Reserve unqualified "round-trip parity" or stronger phrases ("semantic round-trip parity", "entailment-preserving round-trip") for v0.2+ claims that ship the corresponding evaluator-witnessed certificates. This distinction is load-bearing for logic-stakeholder credibility per the banked principle "claims must match what the engineering establishes, no more."

### 8.2 Bidirectional check

Parity is a set equality, not a subset relation. Both directions must be checked:

- **Soundness of the lifter+projector:** every entailment of F₂ either survives projection (in F₃) or appears in L.
- **No fabrication:** every fact in F₃ traces either to F₂ or to a closure step over F₃ + ARC.

The earlier draft only checked the first direction (`E₁ ⊆ Entailments(O₂)`). The second is equally important: a buggy projector or lifter could over-assert, producing entailments not present in the source. The bidirectional check catches this.

### 8.3 Why no external OWL reasoner

The earlier draft proposed HermiT as a "Gold Standard" oracle for validation. v0.1 declines this dependency for three reasons:

1. **Edge-canonical violation.** HermiT requires Java; OFBT requires browser/Node-only.
2. **Authority misplacement.** If OFBT is the bridge, OFBT is the source of truth for what the bridged graph entails. Validating against a third-party reasoner subordinates OFBT's authority to that reasoner.
3. **Structural round-trip parity is the right test.** What we care about is that OFBT preserves content across the expressivity gap. That's a property of OFBT's lifter and projector, testable internally without an oracle.

Users who want an external sanity check can run any OWL reasoner against the projected output independently. v0.1 does not require, depend on, or integrate with any. ADR-002 records this decision.

### 8.4 Fault isolation

When parity fails, the validator must localize the fault. v0.1 implements a bisection protocol:

1. Re-run the round trip with each ARC axiom individually disabled
2. Re-run with each projection strategy individually forced to Annotated Approximation
3. Re-run with each property's lift suppressed

The first axiom/strategy/property whose toggling restores parity is reported as the suspected fault. This is heuristic, not deterministic, but is sufficient for v0.1's debugging needs.

### 8.5 TBox coherence and satisfiability

Structural round-trip parity (§8.1) is necessary but not sufficient. It catches *entailment* loss but is silent on *satisfiability collapse* — the failure mode in which a class satisfiable in the source becomes unsatisfiable in the projection (or vice versa).

#### 8.5.1 The No-Collapse Guarantee (scoped)

OFBT guarantees the following correctness aspiration (§0.1):

> **For every named class C in G₁'s TBox, restricted to the Horn-checkable fragment of OWL 2 DL:**
> - If C is satisfiable as determined by the §8.5.2 check, C is satisfiable post-round-trip. *(no spurious collapses)*
> - If C is unsatisfiable as determined by the §8.5.2 check, C is unsatisfiable post-round-trip. *(no spurious satisfiability)*

This is the No-Collapse Guarantee, scoped explicitly. The v0.1.2 spec stated this guarantee unconditionally for full SROIQ; that overcommits the mechanism. Horn resolution cannot decide satisfiability for axioms that require disjunctive case analysis or non-Horn reasoning. The scoped form is what the v0.1.x mechanism actually delivers.

**What "Horn-checkable fragment" means.** The fragment of OWL 2 DL whose axioms can be expressed as Horn clauses without information loss. This includes: simple subclass declarations, property characteristics (transitivity, symmetry, functionality, irreflexivity), property hierarchies, simple property chains, domain and range constraints, simple disjointness assertions, and inverse properties. It excludes: nominals (`owl:oneOf`), arbitrary disjunctive class expressions, qualified cardinality restrictions in negative position, and complex role compositions involving negation.

**Behavior outside the fragment.** When a TBox axiom falls outside the Horn-checkable fragment, the §8.5.2 check returns "indeterminate" rather than satisfiable or unsatisfiable. Indeterminate classes do not contribute to the No-Collapse Guarantee — they pass through projection with a `coherence_indeterminate` Recovery Payload note, alerting consumers that v0.1.x cannot verify their satisfiability behavior. v0.2's optional ELK integration will close this gap for the EL profile.

#### 8.5.2 How the check is performed

For each named class C in the TBox, the validator attempts to prove `inconsistent` from the FOL state extended with `c(skolem_C)` (asserting that some Skolem individual is a C). The Horn closure is computed under the cycle-detection regime (§5.4). Three outcomes:

- **`inconsistent` provable** → C is unsatisfiable (under Horn-checkable axioms).
- **No proof of `inconsistent`, closure complete (no `closure_truncated` Loss Signature)** → C is satisfiable (under Horn-checkable axioms).
- **No proof of `inconsistent`, closure truncated, or non-Horn axioms involved** → indeterminate.

The check is run twice: once on the lifted source state F₁, once on the lifted post-round-trip state F₃. Their satisfiability sets must agree on every determinately-classified class.

#### 8.5.3 What happens on collapse detection

If the No-Collapse Guarantee is violated (a class satisfiable in F₁ becomes unsatisfiable in F₃, or vice versa) on a determinately-classified class:

1. The projector identifies the specific axiom whose Direct Mapping or Property-Chain Realization caused the collapse (or, for the spurious-satisfiability direction, the axiom whose dropping in projection caused the change).
2. The projection is re-run with that axiom diverted to Annotated Approximation, preserving the FOL form in the Recovery Payload.
3. A `coherence_violation` Loss Signature is emitted, recording which class would have collapsed and which axiom was diverted.
4. The validator re-runs the round trip with the diversion in place to confirm coherence is restored.

This is the same defensive pattern as the `realizes_directive` property-chain handling in v0.1's RDM example: when a strategy choice would create a contradiction with established disjointness, the projection downgrades to a safer strategy rather than asserting the contradiction.

#### 8.5.4 Limitations (explicit)

The Horn-resolution-based check is:

- **Sound for Horn-expressible contradictions.** If the check reports unsatisfiability, the class is genuinely unsatisfiable.
- **Incomplete for full SROIQ.** A class may be unsatisfiable in OWL 2 DL via reasoning the Horn fragment cannot express (e.g., requires case analysis on a disjunction). v0.2 will optionally validate against ELK for the EL profile.
- **Bounded by §5.4's resolution depth.** Deep contradiction proofs may not be discovered before the bound. The bound is conservative: when in doubt, the class is classified indeterminate.

These limitations are in §0.1's "correctness aspiration" category: they define what v0.1.x can verify, and v0.2's ELK integration is the planned remedy. The architecture is not at fault — the Horn-only mechanism is a deliberate v0.1.x choice (no Java, no infrastructure dependency). The honest scope is the Horn-checkable fragment, and that is what §8.5.1 now states.

#### 8.5.5 Surfacing the Horn-fragment limit to consumers

The Horn-fragment limitation must be **visible to API consumers**, not retained as internal implementation detail. When a consistency check returns `'undetermined'` with reason `coherence_indeterminate`, the consumer needs to know *which axioms* fell outside the Horn-checkable fragment so that downstream tooling can surface honest-admission of unchecked content.

Per Fandaws Consumer Requirement §7.1 (honest-admission discipline), a consumer cannot silently treat `'undetermined'` consistency results as "probably consistent." Fandaws's Phase 3 sandbox surfaces every consistency violation as a Phase 3 warning; if OFBT's check is Horn-incomplete, the sandbox needs to know which axioms might harbor undetected contradictions.

The API specification (companion document `OFBT_API_v0.1.7.md` §8.1) defines `ConsistencyResult.unverifiedAxioms` as the field that surfaces this set. When `result === 'undetermined'` and `reason === 'coherence_indeterminate'`, the field MUST be populated with the axioms outside the Horn-checkable fragment that contributed to the indeterminate verdict. Consumers can then:

- Surface the unverified count in their own diagnostics
- Skip the Phase-3-warning emission for genuinely Horn-incomplete cases (rather than treating them as silent passes)
- Optionally pass the unverified axioms to an external reasoner (ELK in v0.2) for deeper checking

This is a behavioral commitment, not just an API binding: the validator implementation must track which axioms are outside the Horn-checkable fragment as it runs, not merely flag the verdict. ADR-022 (forthcoming) will record this commitment if v0.1.7 finds it worth promoting to ADR status; for v0.1.6, the requirement is recorded here and bound in the API spec.

---

## 9. Storage Layer

### 9.1 Oxigraph (RDF) and Tau Prolog (FOL): roles and precedence

Oxigraph is the canonical store for the **graph artifact** — the OWL ontology as serialized triples. It holds the input graph throughout the lifecycle and accumulates the projected output graph. All RDF queries (SPARQL, Turtle round-trip), all serialization-bound output, and all consumer-facing artifacts come from Oxigraph.

Tau Prolog is the canonical store for the **inference state** — the FOL closure under ARC axioms. It holds the lifted predicate facts, the ARC axiom set, and any derivations computed by SLD resolution. All FOL queries, all inference-bound work (closure computation, satisfiability checking, identity propagation), and all reasoning go through Tau Prolog.

These two roles are not interchangeable, and they have explicit precedence when they disagree.

### 9.2 Precedence rules

The v0.1.2 spec said "neither is authoritative" — this was operationally imprecise. v0.1.3 specifies:

**For OWL output**: Oxigraph wins. The serialized OWL is whatever Oxigraph holds after projection. Inferences not reflected in Oxigraph (because they would require Annotated Approximation, exceed OWL DL, or hit the §5.4 depth bound) are *not* present in the OWL output. They are present in Tau Prolog and recorded in Recovery Payloads (for reversible cases) or Loss Signatures (for true loss).

**For FOL queries**: Tau Prolog wins. A query asking "what does the FOL state entail?" is answered from Tau Prolog's closure, including derivations that have no OWL representation. The OWL output is an approximation of the FOL state; the FOL state is the full reasoning content.

**For structural round-trip parity** (§8): The check is `lift(G_OWL) ≡ F_FOL modulo Recovery Payloads + Loss Signatures`. Both stores participate. Disagreement is fault, not policy — the lifter and projector are responsible for keeping the stores synchronized through the audit artifacts.

**For consumer-facing claims**: Whatever is written in Oxigraph and emitted as OWL is what OFBT *asserts*. Whatever is in Tau Prolog beyond that is what OFBT *knows* but does not assert. This distinction matters for downstream consumers: a consumer running an OWL reasoner against the projection will see only what Oxigraph emitted; a consumer using OFBT's API to query the inference state will see the Tau Prolog closure.

ADR-015 records this precedence rule.

### 9.3 Synchronization protocol

The lifter is the only writer to Tau Prolog (from Oxigraph). The projector is the only writer to Oxigraph (from Tau Prolog). Direct cross-store writes are forbidden; all changes flow through the translation engines so that the audit artifacts (Loss Signatures, Recovery Payloads, Projection Manifest) capture every transformation.

### 9.4 Concurrency

v0.1 is single-threaded. Concurrent modifications to either store during a round trip produce undefined behavior. Concurrent OFBT support is deferred to v0.4+.

---

## 10. Architecture Decision Records

ADRs recorded in this specification:

| # | Decision | Status |
|---|---|---|
| ADR-001 | Tau Prolog as the FOL engine (over server-side alternatives) | Accepted |
| ADR-002 | No external OWL reasoner dependency for v0.1 validation | Accepted |
| ADR-003 | Structural round-trip parity as the primary correctness criterion | Accepted |
| ADR-004 | Connected With as primitive with bridge axioms | Accepted |
| ADR-005 | Deterministic Skolemization for missing temporal indices | Accepted |
| ADR-006 | Oxigraph and Tau Prolog as separated, coupled stores | Accepted |
| ADR-007 | Class expression lifting algorithm | Forthcoming (v0.1.1) |
| ADR-008 | Property chain regularity check algorithm | Forthcoming (v0.1.1) |
| ADR-009 | Negation projection rules (correcting `owl:disjointWith` misuse) | Accepted |
| ADR-010 | Identity handling via rule-based `same_as` propagation (not canonical rewriting) | Accepted |
| ADR-011 | SLD termination via cycle-detection guards (v0.1.2) with SLG tabling planned for v0.2 — implementation-side architectural commitment ratified at `project/DECISIONS.md` ADR-013 (Visited-ancestor cycle-guard pattern, 2026-05-09; per Q-3-Step5-A ruling); broader parallel-registry reconciliation forward-tracked to Phase 3 exit retro per Q-3-Step5 side-finding ruling | Accepted |
| ADR-012 | Blank node Skolemization via content-hash registry | Accepted |
| ADR-013 | Projection provenance: preserved ontology IRI, fresh version IRI, PROV-O activity record | Accepted |
| ADR-014 | Audit artifact separation: Loss Signature / Recovery Payload / Projection Manifest as three distinct artifacts | Accepted |
| ADR-015 | Storage precedence: Oxigraph canonical for graph artifact, Tau Prolog canonical for inference state | Accepted |
| ADR-016 | RDFC-1.0 adopted for blank node canonicalization; reference implementation `rdf-canonize` is sole external dependency | Accepted |
| ADR-017 | JSON-LD-shaped term tree as canonical FOL output format with explicit `@type` discrimination | Accepted |
| ADR-018 | Structured JS input as primary input format for v0.1.5+; text formats (Turtle, JSON-LD, RDF/XML) supported as secondary | Accepted |
| ADR-019 | Caller-owned Tau Prolog session lifecycle, no module-level singleton, explicit-per-call session threading | Accepted |
| ADR-020 | Per-predicate CWA via query-time `closedPredicates` set; whole-ontology CWA explicitly not supported | Accepted |
| ADR-021 | Two-document structure: behavioral specification (this document) + API specification (companion `OFBT_API_v0.1.5.md`), co-versioned, read together as the complete deliverable | Accepted |

---

## 11. Technical Stack

| Component | Choice | Rationale |
|---|---|---|
| RDF store | Oxigraph (Wasm/Rust) | Edge-canonical; SPARQL support; JSON-LD native |
| FOL engine | Tau Prolog **v0.3.4** (pinned) | Edge-canonical; ISO Prolog compatible; embeddable. Pin justified per Fandaws Consumer Requirement §6.5 — Tau Prolog upgrade is a major version event, not a minor revision. |
| Blank node canonicalization | `rdf-canonize` (W3C RDFC-1.0 reference impl) | ADR-016; only external dependency outside core stack |
| Loss Signature serialization | JSON-LD | Edge-canonical primary format |
| Hashing | SHA-256 (content addressing) | Standard, deterministic, browser-available |
| Test runner | Node.js native test runner | No external test framework dependency |

External OWL reasoners (HermiT, Pellet, ELK) are explicitly *not* part of the stack. They may be invoked by consumers of OFBT as independent sanity checks; OFBT itself does not depend on them.

### 11.1 Version surfacing

OFBT exposes versioning information at runtime via `getVersionInfo()` (full signature in v0.1.5's API specification). Three independent version strings are surfaced:

- `libraryVersion` — semver string for the OFBT library release (e.g., `"0.1.4"`). Bumped per the standard semver rules (§6.4).
- `conversionRulesVersion` — semver string for the conversion semantics specifically. Bumped on any behavioral change to the lifter or projector, even when the API signature is unchanged. Per Fandaws Consumer Requirement §6.1.1, conversion-semantics changes require minor version bump minimum.
- `tauPrologVersion` — the pinned Tau Prolog version, currently `"0.3.4"`. Tau Prolog upgrade requires a library major version bump.

The three versions are independent because they evolve on different schedules. A bug fix in the projector that does not change behavior bumps `libraryVersion` patch but leaves `conversionRulesVersion` unchanged. A change to how `owl:hasKey` translates (when v0.2 lifts the punted construct) bumps `conversionRulesVersion` minor but does not change the function signatures, leaving `libraryVersion` minor — bumped because conversion rules constitute API for downstream consumers via the audit artifacts.

Fandaws DP-2 records embed all three values so future researchers can identify which library version, conversion rule set, and Tau Prolog implementation produced a given evidence record. The values flow into the Projection Manifest (§7.4) on every projection.

---

## 12. Acceptance Criteria for v0.1

A v0.1 release is acceptable when all of the following hold:

1. **ARC manifest loaded.** OFBT loads `relations_catalogue_v3.tsv` (or successor) on initialization and reports any malformed entries.
2. **Lift-only round trip.** For any input graph using only properties with verified ARC entries, `lift(G) → project(lift(G))` produces a graph with bidirectional parity to G modulo the Loss Signature.
3. **Closure round trip.** For any input graph as in (2), the lift-closure-project round trip produces a graph whose lift is logically equivalent to the inference closure of the original.
4. **Three strategies exercised.** Test corpus exercises Direct Mapping, Property-Chain Realization, and Annotated Approximation, with Loss Signature records correctly emitted for the latter two.
5. **Connected With handled correctly.** Test cases involving external connection (boundary contact without shared parts) produce correct inferences. The bridge axiom `P(x,y) → ∀z (C(z,x) → C(z,y))` is exercised and verified.
6. **Temporal Skolemization deterministic.** Same input triple produces same Skolem constant across runs; round-trip preserves the temporal indexing semantics.
7. **NAF projection correct.** NAF results project to `NegativeObjectPropertyAssertion` or `ObjectComplementOf` only when individuals and properties are simple; complex refutations stay in FOL with `naf_residue` Loss Signature.
8. **Edge-canonical execution.** Full test suite passes via `node index.js` with no infrastructure dependencies. Browser execution produces byte-identical output.
9. **Determinism.** Two runs over the same input (same graph, same ARC manifest version, same operating mode, same depth bound) produce byte-identical OWL output, byte-identical Loss Signature ledger, byte-identical Recovery Payload set, and byte-identical Tau Prolog state dump. The Tau Prolog state dump format is specified as: a canonical S-expression serialization of all asserted facts and rules, sorted lexicographically by predicate name and then by argument tuple, with one fact or rule per line, no comments, ASCII-only output. The Projection Manifest's timestamp fields are excluded from the byte-stability hash but recorded in the Manifest itself.
10. **Fault isolation.** When parity intentionally fails (mutated ARC axiom, suppressed property), the validator reports the responsible component within one bisection cycle.
11. **No-Collapse Guarantee (§8.5).** For a test corpus including BFO 2020 core, no named class satisfiable in the source becomes unsatisfiable in the projection, and no class unsatisfiable in the source becomes satisfiable in the projection. Coherence violations detected during projection are correctly diverted to Annotated Approximation with `coherence_violation` Loss Signature records.
12. **Blank node round-trip (§5.7).** For input graphs containing blank nodes (verified against real BFO/CCO releases, both of which use b-nodes for class expressions), every source b-node has a stable Skolem constant across runs (RDFC-1.0 canonical labeling), and the projected graph either preserves the source b-node identifier (where present in the registry) or marks the b-node as `_:ofbt_*` with a `bnode_introduced` Loss Signature record.
13. **Domain/range correctness (§5.8).** Test fixtures verify the conditional translation explicitly: `rdfs:domain(P, X)` lifts to `x(S) :- p(S, _).` and not to an existential restriction. The wrong existential translation must not be emitted by the lifter under any input. Three named fixtures are required (per §5.8.5): asserted property + domain, asserted property + range, and domain alone with no property assertions.
14. **Structural annotation round-trip (§5.9).** A graph with caller-declared structural annotations round-trips through the lifter and projector with the annotations preserved. Querying the lifted predicates returns the annotation values; structural round-trip parity holds modulo the structural annotation declaration in the Projection Manifest.
15. **Per-predicate CWA (§3.5.2, §6.3).** A query with `closedPredicates: {p}` produces `NegativeObjectPropertyAssertion` projections for failing `\+ p(x, y)` goals on named individuals; the same query without `closedPredicates` produces `naf_residue` Loss Signature records instead. Open predicates outside the closed set produce `naf_residue` records regardless of closure scope on other predicates.

---

## 13. Out of Scope (v0.1)

Documented for completeness; deferred to later versions:

- Natural-language ingestion (TagTeam.js bridge) — v0.3+
- Fandaws integration as orchestration layer — v0.4+
- **External OWL reasoner integration as optional sanity check** — v0.2 candidate. The realistic target is ELK (Kazakov, Krötzsch, Simančík), which handles the EL profile, is JS-portable (elk.js exists), and covers the bulk of BFO/CCO content. Integration would be optional and additive: a `--validate-with-elk` flag that runs ELK against the projected output and compares its inference closure to OFBT's own. ELK does not subsume OFBT's authority — structural round-trip parity (§8) remains the primary correctness criterion. HermiT, Pellet, FaCT++, and RACER are permanently excluded as direct dependencies because they require Java or other infrastructure incompatible with edge-canonical execution; users may run them independently against OFBT's projected output, but OFBT will not call them.
- SHACL validation — separate spec
- SPARQL endpoint — v0.2 candidate
- Multi-graph reasoning across imports — v0.3+
- Concurrent round-trip support — v0.4+
- OWL Functional Syntax input — v0.2 candidate
- BFO versions earlier than 2020 — not planned

### 13.1 Explicitly punted OWL constructs

Per Fandaws Consumer Requirement §3.7, the following OWL constructs are explicitly out of scope for v0.1 because they are not currently exercised by Fandaws's Bucket C helpers or consistency-sandbox. They may be lifted in v0.1.x if a consumer requires them, with conversion-rules version bump.

- **OWL 2 punning** — using the same IRI as a class, property, and individual simultaneously. Lifting requires careful disambiguation that v0.1 does not implement; the lifter rejects punning patterns with `UnsupportedConstructError`.
- **Datatype restrictions beyond basic XSD types** — `owl:withRestrictions`, faceted datatype definitions (e.g., integers between 0 and 100). The lifter accepts the basic XSD types specified in §5.6 but does not lift faceted restrictions; encountered, they emit `UnsupportedConstructError`.
- **`owl:hasKey`** — composite-key declarations on classes. Lifting requires multi-argument unification logic that v0.1 does not implement.
- **Negative property assertions** at the source level — `owl:NegativePropertyAssertion` constructs in the input graph. The projector emits negative property assertions on output (per §6.3.2) but the lifter does not currently consume them as input. They emit `UnsupportedConstructError` on ingestion.
- **Annotation reasoning beyond §5.9** — reasoning over annotation hierarchies, annotation-on-annotation patterns, and annotation property characteristics. v0.1's structural-annotation handling is the floor; richer reasoning is deferred.

The lifter throws `UnsupportedConstructError` (typed, with `construct` field naming the specific construct) on encountering any of these. This honors Fandaws Consumer Requirement §7.1: failure surface is honest-admission, not silent skip. v0.1.5's API specification will pin the error class hierarchy.

---

## 14. Open Questions and Resolutions

v0.1.2 listed five open questions. v0.1.3 resolves four:

**Q1 (RESOLVED).** ARC manifest format: TSV vs JSON-LD. **Decision: JSON-LD primary, TSV as a generated view.** Edge-canonical principle commits to JSON-LD; ARC is internal data, no exception. The TSV form remains useful as a human-readable view and will be auto-generated from the JSON-LD source. Migration scheduled for v0.1.4.

**Q2 (RESOLVED).** Annotation property namespace for OFBT-minted vocabulary. **Decision: `https://ofbt.ontology-of-freedom.org/ns/0.1/`.** Permanent base for `ofbt:LossSignature`, `ofbt:RecoveryPayload`, `ofbt:ProjectionActivity`, etc. Versioned prefix in the path (`/0.1/`) allows v0.2 to introduce incompatible vocabulary changes without breaking v0.1.x consumers. ADR-013 is updated.

**Q3 (RESOLVED).** Loss Signature ledger persistence. **Decision: in-memory by default; `--persist-ledger=<path>` writes to disk for debugging.** Default is in-memory because the ledger is regeneratable from the projected output (Recovery Payloads carry the FOL form; Loss Signatures and Manifest are reproducible from inputs and ARC version). Persistence is for debugging the projector, not for downstream consumers.

**Q4 (RESOLVED).** Strict mode default. **Decision: permissive is the default; strict is an explicit flag.** v0.1.3's §3.3 makes strict and permissive co-equal supported configurations. Permissive is the default because exploratory ingestion is the more common use case for v0.1.x; strict is the documented escalation path for validation pipelines and ontology releases. This is a documentation choice, not a precedence claim.

**Q5 (RESOLVED).** Test corpus composition. **Decision: BFO 2020 core, PROV-O, CCO Geospatial, CCO Agent, plus the constitution.ttl Article I §2 pipeline.** This composition aligns with Fandaws Consumer Requirement §5.3.1 and provides corpus diversity across the formal-ontology spectrum:

- **BFO 2020 core** — the upper-level ontology that grounds OFBT's ARC manifest. Required for testing parthood, dependence, realization, and the time-indexing axes.
- **PROV-O** — the W3C provenance ontology. Important for testing OFBT's own Projection Manifest provenance vocabulary and for exercising domain/range correctness on a real-world ontology with extensive `prov:wasInfluencedBy`-style assertions (the canonical example in §5.8.3).
- **CCO Geospatial** — the CCO module covering spatial regions and locations. Exercises the mereotopological connection layer and the bridge axiom for Connected With (§3.4.1).
- **CCO Agent** — the CCO module covering agents and roles. Exercises the realizable-holding relations (`has_role`, `has_disposition`, `has_function`) and the deontic sublayer.
- **constitution.ttl Article I §2** — the smoke-test for the deontic sublayer and the canonical RDM v1.2.1 chain. Already validated in earlier work (per project memoranda).

The federal CMS/DHS Data Exchange MOA from TagTeam ISA testing is deferred to v0.2 as it depends on TagTeam.js bridge integration (out of scope for v0.1).

**Acceptance harness commitment.** v0.1.4 acceptance requires *all five* in-scope corpora to pass the structural round-trip parity check (§8.1), the No-Collapse Guarantee check (in strict mode), and the new §12 criteria 13-15 (domain/range correctness, structural annotation round-trip, per-predicate CWA correctness). Failure of any single corpus on any single criterion blocks the v0.1 release.

---

## 15. References

### Standards and Software

- BFO 2020 specification: https://github.com/BFO-ontology/BFO-2020
- CCO 2.0 specification: https://github.com/CommonCoreOntology/CommonCoreOntologies
- Tau Prolog: http://tau-prolog.org/ — pinned to v0.3.4 per §11
- Oxigraph: https://github.com/oxigraph/oxigraph
- ELK reasoner: https://liveontologies.github.io/elk-reasoner/
- **RDF Dataset Canonicalization 1.0** (W3C Recommendation, 2024): https://www.w3.org/TR/rdf-canon/
- **rdf-canonize** (JavaScript reference implementation): https://github.com/digitalbazaar/rdf-canonize
- **W3C XML Schema Definition Language (XSD) 1.1 Part 2: Datatypes**: https://www.w3.org/TR/xmlschema11-2/
- **W3C OWL 2 Web Ontology Language Direct Semantics** (W3C Recommendation, 2012): https://www.w3.org/TR/owl2-direct-semantics/ — definitive source for `rdfs:domain` and `rdfs:range` semantics referenced in §5.8.
- **W3C OWL 2 Web Ontology Language Primer** (W3C Recommendation, 2012): https://www.w3.org/TR/owl2-primer/
- **W3C PROV-O: The PROV Ontology** (W3C Recommendation, 2013): https://www.w3.org/TR/prov-o/
- **Fandaws Consumer Requirements v1.0** (2026-04-29): authoritative Fandaws-side requirements set, source for §1.4, §3.5, §5.8, §5.9, §6.3 revisions in v0.1.4.
- **Fandaws Dev Critique of OFBT v0.1.5 API**: post-publication review, source for v0.1.6 revisions including the verification-gate expected-divergence mechanism (§17.7.1) and the Horn-fragment surfacing requirement (§8.5.5).
- ARC Manifest: `relations_catalogue_v3.tsv` (current), companion document to this specification.

### Description Logic Foundations

- **Baader, F., Calvanese, D., McGuinness, D.L., Nardi, D., Patel-Schneider, P.F. (eds.) (2003).** *The Description Logic Handbook: Theory, Implementation, Applications.* Cambridge University Press. — The canonical DL reference; defines the formal semantics OFBT's projection target inherits.
- **Krötzsch, M., Simančík, F., Horrocks, I. (2012).** "A Description Logic Primer." arXiv:1201.4089. — Short, recent, and freely available; the recommended starting point for readers approaching this spec without a DL background.
- **Hitzler, P., Krötzsch, M., Rudolph, S. (2009).** *Foundations of Semantic Web Technologies.* CRC Press. — Standard textbook covering OWL 2 specifically, including the SROIQ(D) correspondence.

### Projection-Specific Foundations

- **Horrocks, I., Kutz, O., Sattler, U. (2007).** "The Even More Irresistible SROIQ." *KR 2006.* — Defines SROIQ and the regularity restriction on complex role inclusion that grounds §6.1.2 (Property-Chain Realization) and §6.2 (strategy selection).
- **Reiter, R. (1977).** "On Closed World Data Bases." *Logic and Data Bases.* — The foundational paper on CWA, relevant to §1.1's separation of OWA, CWA, and operational NAF.

### Mereotopology

- **Casati, R., Varzi, A. (1999).** *Parts and Places: The Structures of Spatial Representation.* MIT Press. — Standard reference for the mereotopological treatment of Connected With as primitive (§3.4) rather than as defined overlap.

---

## 16. API Specification

The full OFBT API surface is specified in the companion document **`OFBT_API_v0.1.5.md`**, co-versioned with this specification. The two documents are read together as the complete OFBT v0.1.5 deliverable.

The split into two documents reflects different reading audiences: this specification describes what OFBT does and why; the API specification describes how to use it. The API specification covers function signatures, error classes, the async contract, the three-state evaluation result schema and reason enum, step cap parameters, session lifecycle, structured JS input format, JSON-LD-shaped FOL output format, the compatibility shim package contract, ES Module packaging, the bundle size budget, and API-level acceptance criteria.

The API specification is bound to this specification by:

- **Architectural decisions** — every ADR in §10 that affects API shape (ADRs 017, 018, 019, 020 in particular) is honored by the API specification. The API specification cannot relax or contradict ADRs.
- **Behavioral commitments** — every behavioral commitment in §1–§9 (structural round-trip parity, No-Collapse Guarantee, three-strategy projection router, audit artifact taxonomy, configuration model) is exposed through the API specification as concrete function signatures and parameter shapes.
- **Acceptance criteria** — §12's behavioral acceptance criteria carry through to the API specification, supplemented by API-specific criteria (compatibility shim parallel-run, bundle budget, ES Module compatibility, etc.).

Changes to the API specification require corresponding spec revisions when the change reflects a behavioral shift; purely API-shape changes (e.g., refactoring a parameter object) are recorded only in the API specification's revision history and require minor version bump per §6.1.1.

Future versions: v0.2 will revise both documents together when the API surface stabilizes against real Fandaws integration. The companion-document structure persists across versions per ADR-021.

---

## 17. Fandaws Alignment Statement

This section summarizes OFBT v0.1.4's alignment with the Fandaws Consumer Requirements v1.0 (2026-04-29). It serves as the connective tissue between the specification and the consumer-side requirements document, and as the inventory of what remains for v0.1.5.

### 17.1 Architectural alignment (Fandaws §1)

| Fandaws Requirement | OFBT v0.1.4 Status |
|---|---|
| §1.1 Edge-canonical (browser + Node) | Met — ADR-001, ADR-002, §1.1 |
| §1.2 No required infrastructure | Met — ADR-002, §13 |
| §1.3 Deterministic | Met — §0.1 (correctness aspiration), §12.9 (state dump format) |
| §1.3.1 Blank-node identity contract | Met — §5.7 (RDFC-1.0 canonicalization), ADR-016 |
| §1.4 No probabilistic core | Met — §1.1, §1.2 (no LLMs/RNG anywhere in conversion path) |
| §1.5 Stateless or caller-owned state | Met — ADR-019 (caller-owned session lifecycle); detailed signatures in v0.1.5 |
| §1.6 ES Modules + tree-shakeable | Deferred to v0.1.5 (packaging concern) |
| §1.6.1 Bundle ≤ 200 KB minified | Deferred to v0.1.5 (CI gate); §11 commitment to minimal dependencies supports this |
| §1.7 Zero or minimal runtime deps | Met — Tau Prolog and rdf-canonize only; ADR-016 |
| §1.8 esbuild compatibility | Deferred to v0.1.5 (packaging concern) |
| §1.9 IRI canonicalization contract | Met — §4.2.1 |

### 17.2 API surface alignment (Fandaws §2)

The full API surface specification is deferred to v0.1.5 per §16. v0.1.4 commits to the architectural decisions:

- ADR-017: JSON-LD-shaped term tree as canonical FOL output (Fandaws §2.7) — committed
- ADR-018: structured JS input as primary (Fandaws §2.6) — committed
- ADR-019: caller-owned session lifecycle (Fandaws §2.1, §2.2) — committed

### 17.3 Functional coverage alignment (Fandaws §3)

| Fandaws Requirement | OFBT v0.1.4 Status |
|---|---|
| §3.1 OWL TBox constructs | Met — §1.1 SROIQ(D) framing; specifics in ARC manifest |
| §3.2 OWL RBox constructs | Met — §1.1 R feature for property chains; ARC manifest |
| §3.3 OWL ABox constructs | Met — §5.5 identity handling, §5.1-5.3 lifting rules |
| §3.4 Restriction input shape (OWL 2 standard JSON-LD) | Deferred to v0.1.5 (input format binding) |
| **§3.5 Domain/range semantics (HIGH RISK)** | **Met — §5.8 with explicit non-requirement, worked example, mandatory test fixtures** |
| §3.6 Caller-declarable structural annotations | Met — §5.9, §3.5.3 |
| §3.7 Punted constructs (enumerated) | Met — §13.1 |
| §3.8 Consistency-checking API as first-class | Architectural commitment in §1.4 (artifact nature); function signature deferred to v0.1.5 |
| §3.9 OWA default, per-predicate CWA opt-in | Met — §3.5.2, §6.3 |

### 17.4 Performance, verification, governance (Fandaws §4-6)

| Fandaws Requirement | OFBT v0.1.4 Status |
|---|---|
| §4.1-4.3 Performance | Deferred to v0.1.5 (implementation concerns) |
| §5.1 Reproducibility hash | Met — §7.5 (audit artifact determinism); §12.9 (byte-stable output) |
| §5.2 Provenance attribution | Met — §11.1 (three-version surface), §7.4 (Projection Manifest) |
| §5.3.1 Test corpus members | Met — §14 Q5 resolution |
| §6.1 Semver | Deferred to v0.1.5 (release governance) |
| §6.1.1 Conversion semantics versioning | Met — §11.1 (`conversionRulesVersion` surface) |
| §6.2 README OWL+FOL fragment table | Deferred to v0.1.5 (documentation deliverable) |
| §6.3 Compatibility shim package | Architectural commitment per §1.4; specifics deferred to v0.1.5 |
| §6.4 Independent CI | Implementation concern, not specification |
| §6.5 Tau Prolog version pinning | Met — §11 (pinned to v0.3.4) |

### 17.5 Items addressed in v0.1.5 vs deferred to v0.2

The following Fandaws requirements were deferred from v0.1.4 to v0.1.5. v0.1.5 status:

| Item | v0.1.5 Status |
|---|---|
| 1. Full API surface specification | **Met** — companion document `OFBT_API_v0.1.5.md` |
| 2. Structured JS input format | **Met** — companion §3 |
| 3. OWL 2 standard JSON-LD restriction shape | **Met** — companion §3.4 |
| 4. Compatibility shim package contract | **Met** — companion §12 |
| 5. Bundle size budget (≤200 KB) | **Met** — companion §13.4, CI gate specified |
| 6. ES Module packaging | **Met** — companion §13.1-13.3 |
| 7. Verification cycle gate | **Met** — companion §15 |

The following remain deferred to v0.2 or later:

- ELK reasoner integration as optional sanity check (v0.2 candidate per §13)
- SPARQL endpoint exposure (v0.2 candidate per §13)
- OWL Functional Syntax input (v0.2 candidate per §13)
- TagTeam.js bridge (v0.3+ per §1.3)
- Fandaws-Sentinel orchestration integration (v0.4+ per §1.3)
- SLG tabling for SLD termination (planned for v0.2 per ADR-011)

### 17.6 Two-way dependency tracking

Per Fandaws §8, the following spec dependencies are tracked between OFBT and Fandaws:

**OFBT decisions waiting on Fandaws specs:**
- §3.5.3 structural annotation IRIs — specific Fandaws-side annotation property IRIs (e.g., `fandaws:bfoSubcategory`) depend on the Reified Constitutive Relations Specification publication
- Compatibility shim signatures — depend on Fandaws-side signature inventory of legacy Bucket C helpers (companion §12)

**Fandaws decisions waiting on OFBT:**
- Bucket C helper migration plan — **unblocked by v0.1.5** (full API surface available)
- `consistency-sandbox.js` retirement plan — **unblocked by v0.1.5** (`checkConsistency` API specified)
- DP-2 record format extension for FOL evidence — **unblocked by v0.1.5** (JSON-LD term tree shape specified)

This list is reviewed at every spec-touch on either side.

### 17.7 Consumer migration prerequisites

Before Fandaws can begin consumption of OFBT, the following preparatory work must be in place on the Fandaws side. This list is informational — OFBT does not gate on it — but it documents the consumer-side preparation that makes integration tractable.

**Reified Constitutive Relations Specification published.** This Fandaws spec carries the canonical structural annotation IRIs (`fandaws:bfoSubcategory` etc.) that OFBT's caller-declarable structural annotations (§5.9) require. Without this, Fandaws cannot supply `structuralAnnotations` correctly.

**Bucket C helper signature inventory.** Fandaws must enumerate the current Bucket C helper functions, their signatures, and their semantics so the compatibility shim (`@library/fandaws-compat`) can target the right interfaces. Companion §12 specifies the shim contract from OFBT's side; the Fandaws-side mapping is required to instantiate it.

**Tau Prolog v0.3.4 alignment.** Fandaws currently uses Tau Prolog v0.3.4 per the d0a6619 workaround. OFBT pins to the same version (§11). Both sides are aligned; this is a checkpoint, not a gating item.

**DP-2 record format extension plan.** Fandaws's DP-2 records will need to carry OFBT version metadata, conversion-rules version, and JSON-LD-shaped FOL evidence. The format extension is Fandaws-side work that depends on OFBT v0.1.5's stable shape — now available.

**Verification cycle plan.** Per Fandaws §7.3, a formal verification cycle must run Fandaws's 70/70 D1.6 AVC + bundle v6 SWC + Bucket C helper tests against OFBT's reference implementation (via the compatibility shim) before any consumption-side migration. This cycle is Fandaws-orchestrated; OFBT supports it via the test corpus (§14 Q5) and the parallel-run mode in the compatibility shim (companion §12.3).

#### 17.7.1 Expected-divergence baselines for the verification gate

A naive "all parallel-run results match" gate has a subtle failure mode: if Fandaws's legacy Bucket C helpers contain known correctness bugs (per Fandaws Step 7.19 — false universal axioms from existentialized domain/range — and Step 7.20 — missing disjointness export), then a strict parallel-run match would force OFBT to *replicate those bugs*. That defeats the purpose of the migration.

OFBT v0.1.6 commits the verification gate to support **expected-divergence baselines**. The gate accommodates two categories of results:

- **Matching results** — OFBT and legacy produce equivalent output. Parallel-run records and tracks count.
- **Expected divergence** — OFBT's correct behavior differs from legacy's known-broken behavior in a documented way. Parallel-run records the divergence against a baseline file; divergences within the baseline pass the gate, divergences outside it fail.

Concretely, the compatibility shim's parallel-run mode (companion §12.3) accepts an `expectedDivergences` parameter:

```typescript
enableParallelRun({
  legacyImplementation: ...,
  comparator: ...,
  onMismatch: ...,
  expectedDivergences: ExpectedDivergence[]   // new in v0.1.6
});

interface ExpectedDivergence {
  callPattern: string;                         // matcher for the call shape
  fandawsIssueRef: string;                     // e.g., "Step 7.19"
  legacyBehavior: string;                      // human-readable description of bug
  ofbtBehavior: string;                        // human-readable description of correct
  expectedSince: string;                       // version of OFBT that introduced fix
}
```

When parallel-run encounters a divergence matching an `ExpectedDivergence` entry, it records the match against the baseline (telemetry + audit) but does not invoke the `onMismatch` handler. Unexpected divergences (not matching any baseline entry) invoke `onMismatch` per the standard parallel-run contract.

This mechanism lets the migration proceed:

- Fandaws documents known legacy bugs as `ExpectedDivergence` entries in a Fandaws-side baseline file
- Parallel-run against the OFBT reference implementation passes the gate when only baseline divergences are observed
- Unexpected divergences (which would be either real OFBT bugs or undocumented legacy bugs) fail the gate and require investigation

The expected-divergence baselines themselves are Fandaws-side artifacts (Fandaws documents which legacy bugs it has) but the mechanism is OFBT-provided. Without this accommodation, Fandaws would face an impossible choice: replicate legacy bugs in OFBT to pass the gate, or fix legacy bugs first (delaying migration indefinitely). The accommodation lets correctness improve monotonically through the migration rather than in a flag-day jump.

This commitment is specified in the API specification companion document at §15.3 of that document.

#### 17.7.2 Interim structural-annotation IRI list (Reified Constitutive Relations Specification dependency)

OFBT's structural-annotation API (§5.9; companion API spec §3.8 and §2.1) accepts caller-declared IRIs as a Set. The mechanism is fully implementable without the Fandaws-side Reified Constitutive Relations Specification §3 being published — whatever IRIs the caller supplies are treated structurally.

This means **Fandaws may begin OFBT consumption with an interim structural-annotation IRI list** before the Reified Constitutive Relations Specification publishes. Specifically:

- Fandaws consumes OFBT v0.1 with an interim list of structural annotations (e.g., `fandaws:bfoSubcategory` plus whatever else current Fandaws code requires).
- When the Reified Constitutive Relations Specification §3 publishes the canonical IRI list, Fandaws updates the structural-annotation set passed to OFBT.
- The migration cost is bounded: OFBT does not pin specific IRIs, only accepts the caller-supplied set. Updating the set is an integration-level change, not a re-validation of correctness.

**Recommendation, not requirement.** The Reified Constitutive Relations Specification §3 is *recommended* for OFBT consumption rather than *required*. Fandaws may begin consumption with an interim list and update later. The interim cost is the migration step when the spec lands; the alternative (waiting for the spec before starting consumption) imposes a larger cost in delayed integration.

This unblocks parallel work: OFBT v0.1 implementation and Reified Constitutive Relations Specification §3 publication can proceed independently. Closes architect P4.

### 17.8 Compatibility shim package: location and maintenance

The compatibility shim package (`@ontology-of-freedom/ofbt-compat-fandaws`, companion API spec §12) lives in **OFBT's repository as a sub-package** for v0.1.x. This commitment makes ownership explicit:

#### 17.8.1 Repository location for v0.1.x

The shim package is a sibling sub-package of the core OFBT package within the OFBT monorepo. Layout:

```
ofbt/
├── packages/
│   ├── ofbt/                      # core: @ontology-of-freedom/ofbt
│   └── ofbt-compat-fandaws/       # shim: @ontology-of-freedom/ofbt-compat-fandaws
└── ...
```

Both packages publish to npm independently; the monorepo manages source-level co-evolution.

#### 17.8.2 Maintenance arrangement

- **Mechanism (parallel-run mode, expected-divergence baselines, shim contract):** maintained by OFBT team. These are general-purpose facilities applicable to any consumer.
- **Content (specific Bucket C helper signatures, expected-divergence entries):** contributed by Fandaws team. Fandaws's signature inventory (§17.7) feeds into the shim's exported function list.
- **Integration tests:** authored jointly. The shim's CI runs against both OFBT's test corpus and Fandaws's test fixtures.
- **Release coordination:** shim version bumps are coordinated with OFBT major versions (OFBT v0.2 → shim v0.2). Shim minor/patch bumps are independent.

#### 17.8.3 Post-cutover relocation

After Fandaws cutover (companion API spec §12.4 step 5), the shim is largely retired — Fandaws calls OFBT directly. The shim's continued existence depends on:

- **Other consumers needing similar legacy-shim patterns:** if a future consumer needs comparable parallel-run + expected-divergence facilities, the shim's general-purpose machinery may be extracted into a separate `@ontology-of-freedom/ofbt-compat-utils` package.
- **Long-tail Fandaws callers:** if some Fandaws subsystems remain on the shim post-cutover (gradual migration), the shim continues maintenance until they migrate.

The decision to extract or retire is a v0.2+ decision, not a v0.1.7 commitment. v0.1.7 commits to the v0.1.x location (OFBT monorepo) and the shared-maintenance arrangement.

Closes architect P3.

### 17.9 Verification gate authority chain

The verification gate (companion API spec §15) is a Fandaws-side process supported by OFBT-provided mechanism. Authority for each gate artifact:

| Artifact | Author | Approver | Notes |
|---|---|---|---|
| Parallel-run mechanism | OFBT team | OFBT team | Shim package code, exported `enableParallelRun` API |
| Expected-divergence baseline file | Fandaws Architect | Fandaws Architect | Lists Fandaws-side legacy bugs OFBT correctly does not replicate |
| Soak window length | Fandaws governance | Fandaws governance | Determined by Fandaws release engineering policies |
| Test corpus selection | OFBT team | Joint review | OFBT proposes; Fandaws confirms applicability |
| Mismatch handler logic | Fandaws team | Fandaws team | Fandaws decides whether mismatches log, throw, or record to baseline |
| Cutover decision | Fandaws team | Fandaws governance | Final go/no-go for migration |
| Acceptance criteria for OFBT correctness | OFBT team | OFBT team | Companion API spec §14 |
| Acceptance criteria for shim correctness | OFBT team | Joint review | Shim must satisfy both teams' expectations |

**Principle:** OFBT defines mechanism; Fandaws defines content; both contribute to correctness criteria.

This division is intentional: OFBT cannot know Fandaws's release engineering practices (soak window length, mismatch handling policy) and Fandaws cannot know OFBT's internal correctness model (acceptance criteria). The gate succeeds when both teams contribute their respective expertise; it fails when either team is asked to author something outside its domain.

Closes architect P2.

---

*End of OFBT Specification v0.1.7.*
