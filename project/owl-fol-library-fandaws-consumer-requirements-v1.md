# OWL↔FOL Library — Fandaws Consumer Requirements (v1.0)

**Status:** DRAFT 2026-04-29. Authoritative requirements set the OWL↔FOL JS library must satisfy before Fandaws-Sentinel can consume it.
**Owner:** Fandaws-Sentinel SME, on behalf of the consuming project.
**Audience:** OWL↔FOL library author/team; Fandaws Dev team (consumption-side).
**Source:** Initial requirements derived from Fandaws's 6 architectural non-negotiables, X6 §6.2 prologSession lifecycle lock, X7 dispatcher integration, Phase D2 consistency-sandbox, and DP-2 record patterns. **Critique-incorporated v1.0** folds in Steps 7.6-7.20 surfacings (IRI canonicalization, blank-node identity, restriction extraction, domain/range semantics, structural annotations).
**Scope fence:** describes Fandaws's *consumption-side* requirements only. The library's broader audience (other semantic-web consumers) may have a superset of requirements; this document does not constrain that. The library MAY exceed these requirements freely; it MUST NOT fall short.
**Companion artifacts (forward-flagged):**
- Reified Constitutive Relations Specification (in progress; Section 8 dependency)
- Library scoping document (forthcoming; library author to draft)
- Fandaws migration plan (post-library-v1.0; Fandaws-side cycle to be scoped)

---

## 1. Architectural / Packaging Requirements

### 1.1 Edge-Canonical (Non-Negotiable #1)

Library MUST run unmodified in browser AND Node.js. No native bindings, no Node-only modules in the runtime path, no FFI. ES Modules (`import`/`export`); no CommonJS-only.

### 1.2 No Required Infrastructure (Non-Negotiable #2)

No databases, servers, message brokers, or background workers as hard dependencies. Worker-mode for performance MAY be offered as an opt-in; the default path MUST be in-process synchronous-or-await JS.

### 1.3 Deterministic (Non-Negotiable #3)

Same input ontology → same FOL output → same Tau Prolog evaluation outcome. Prohibited in conversion or evaluation paths:

- `Date.now()`, timestamps
- `Math.random()`, RNG-derived values
- UUID generation
- Iteration over insertion-order-non-deterministic structures (use `Map`, not plain `Object`)

**1.3.1 Blank-node identity contract.** When the library introduces blank nodes (Skolem constants for existentials, anonymous restriction targets, etc.), the IDs MUST be deterministic functions of input content. Same input ontology → same blank-node IDs across runs across processes across machines. Explicit documentation required. Without this, round-trip equivalence and reproducibility hash (§5.1) break.

Any other documented non-determinism MUST be bounded and documented in the README.

### 1.4 No Probabilistic Core

No LLMs, neural networks, statistical inference, or non-deterministic heuristics inside the library. Tau Prolog evaluation is deterministic; OWL↔FOL conversion is deterministic. README MUST state this prohibition explicitly — Fandaws has a hard rule.

### 1.5 Stateless or Caller-Owned State

Conversion functions (`owlToFol`, `folToOwl`, `roundTripCheck`) MUST be pure. Tau Prolog evaluation is unavoidably stateful (session-based) but session lifecycle MUST be caller-managed and explicit (§2.1). No module-level singletons. No hidden state across calls.

### 1.6 ES Modules + Tree-Shakeable

Named exports preferred over default exports so unused conversion paths can be dropped by esbuild.

**1.6.1 Bundle size budget — HARD requirement.** Library footprint added to Fandaws's current ~956 KB bundle MUST NOT exceed **200 KB minified** (excluding Tau Prolog, which is already present). This is a CI-gated regression-trackable budget. Library CI MUST enforce; Fandaws CI MUST verify on dependency update.

### 1.7 Zero or Minimal Runtime Dependencies

Tau Prolog itself is acceptable (already in Fandaws). Anything else needs explicit justification in the library README. No lodash, rxjs, or large utility libs.

### 1.8 esbuild Compatibility

Fandaws builds with esbuild. Library MUST be esbuild-friendly:

- No dynamic `require()`
- No conditional `import()`
- No Node built-ins requiring polyfill-at-bundle-time
- If polyfills ARE required, document which; verify they're in Fandaws's externalization list (Node built-ins externalized at d0a6619)

### 1.9 IRI Canonicalization Contract

Library MUST specify, in README and runtime API:

1. **Input forms accepted:** any combination of `<full URI>`, `prefix:local`, raw URI string. Fandaws produces all three forms via `ontology-parser.js`; library MUST handle all without caller-side normalization.
2. **Internal canonicalization:** state which canonical form the library uses internally and document the transformation rule.
3. **Output form:** state the form on FOL emission and round-trip outputs. SHOULD match canonical input form for round-trip stability.

If the library accepts only one form, Fandaws will require a normalization shim at the boundary — flag this as a v0.x limitation requiring v1.0 resolution.

---

## 2. API Surface Requirements

### 2.1 Caller-Owned Tau Prolog Session Lifecycle (X6 §6.2 L2 Lock)

Fandaws's pattern: orchestrator creates a session at ingestion start, threads it through every helper call, tears it down at session end.

Library MUST support:

- `createSession(options): Session` — returns explicit handle
- `evaluate(session, query, options): Promise<Result>` — operates on caller's handle
- `disposeSession(session): void` — releases resources fully

NO module-level Tau Prolog singleton. NO automatic session creation on first call. NO leaked state across `disposeSession` calls.

### 2.2 Explicit-Per-Call Session Threading

Library functions requiring Prolog evaluation MUST take session as an explicit parameter. Absent → throw `SessionRequiredError` (typed; per Fandaws's throw-not-warn discipline). No implicit/global session.

### 2.3 Async Contract

Tau Prolog uses `setTimeout(0)` callback model. Library MUST wrap this as Promise/async-await at its API boundary. No naked callbacks leaked.

- Every async function returns a `Promise`
- Rejections on cycle-detection / step-cap-exceeded / parse-error MUST throw typed errors (§2.9)

### 2.4 Step Cap Enforcement

Per X6 deliberation lock (Option C, 10K step cap), library MUST expose a configurable step-cap parameter on `evaluate()`.

**2.4.1 Per-query budget (default).** Step cap is applied **per query**, not per session. Default value: 10,000 steps (matching Fandaws's X6 lock). Exceeding the cap throws `StepCapExceededError` (typed).

**2.4.2 Optional aggregate session budget.** Library MAY offer a `maxAggregateSteps` parameter on `createSession()` for runaway-session protection. When set, exceeding aggregate steps throws `SessionStepCapExceededError`. Default: unbounded.

Fandaws-side fallback (structural-correspondence) keys off these typed error classes.

### 2.5 Three-State Evaluation Result

Fandaws's NC dispatcher uses trichotomy `{satisfied, unsatisfied, undetermined}`. Library evaluation API MUST return:

```
{
  result: 'true' | 'false' | 'undetermined',
  reason?: string,        // enum-valued; see §2.5.1
  steps?: number,         // Prolog steps consumed
  bindings?: any[]
}
```

The `undetermined` case (open-world, step-cap, parse failure, no model found, missing ground predicates) is a **load-bearing third state** — not a degraded `false`.

**2.5.1 Reason enum stability — DP-2 invariant I4 (Dictionary Discipline).** The library MUST publish a canonical enum of `reason` strings. Fandaws DP-2 records embed these directly; per I4, dictionary churn is a load-bearing event. Required enum entries minimum:

- `step_cap_exceeded`
- `cycle_detected`
- `unbound_predicate`
- `unsupported_construct`
- `model_not_found`
- `consistent`
- `inconsistent`
- `open_world_undetermined`

Library MAY extend the enum (additive only on minor version per §6.1.1). Library MUST NOT emit unenumerated reason strings.

### 2.6 OWL Input Format

Library MUST accept already-parsed OWL data structures, NOT raw text. Fandaws keeps its `ontology-parser.js` (uses N3.js); library's input is structured JS form (TBox + ABox + RBox).

This separates parsing concerns from the library and avoids duplicated RDF/XML/Turtle/N-Triples support.

### 2.7 FOL Output Format = JSON-LD-Shaped Term Tree

FOL emitted by the library MUST be a **JSON-LD-shaped term tree** with explicit `@type` discrimination. Rationale:

- Fandaws DP-2 records are already JSON-LD-shaped (per Step 7.13 restriction-object format)
- Embedding FOL evidence as DP-2 `explanation.fol` requires zero encoding shim
- Round-trip + diff tooling can leverage standard JSON-LD libraries

Opaque/string-only FOL is rejected — evidence surfacing breaks at DP-2 boundary.

### 2.8 Round-Trip Identity

`folToOwl(owlToFol(axiom))` MUST be assertion-equivalent for the supported fragment.

Library MUST expose:

```
roundTripCheck(axiom): {
  equivalent: boolean,
  diff?: <structured diff of non-equivalence>
}
```

Fandaws will use this as defense-in-depth at conversion boundaries.

### 2.9 Typed Error Classes Per Failure Family

Per Fandaws's `feedback_throw_not_warn_enforcement.md` discipline, library MUST export specific error classes. Fandaws code catches by class, not message:

- `ParseError` — input axiom set malformed
- `UnsupportedConstructError` — OWL construct outside supported fragment; carries `construct: string` field
- `StepCapExceededError` — per-query step cap hit; carries `query`, `steps` fields
- `SessionStepCapExceededError` — aggregate session cap hit
- `SessionRequiredError` — session-required API called without session
- `SessionDisposedError` — session used after `disposeSession`
- `RoundTripError` — `folToOwl(owlToFol(x))` non-equivalent; carries `diff` field
- `CycleDetectedError` — see §2.10
- `IRIFormatError` — IRI input form unrecognized

### 2.10 Cycle Detection Contract

Tau Prolog can loop on cyclic ancestor chains; OWL ontologies CAN declare class-hierarchy cycles (rare but legal under OWA).

Library MUST specify behavior in two surfaces:

- **OWL→FOL conversion:** does the library detect cycles in input class hierarchy via `subClassOf`? If yes → throw `CycleDetectedError`. If no → README MUST document this so Fandaws keeps `buildTransitiveAncestorChain`'s `seen` Set defense (per Step 7.7).
- **Evaluation:** does the library detect cycles in recursive Prolog rules? If yes → throw `CycleDetectedError`. If no → README MUST document.

Defense-in-depth: Fandaws maintains its own cycle defense regardless; library detection is additive insurance.

---

## 3. Functional Coverage Requirements

The library MUST, at minimum, support every OWL construct currently exercised by Bucket C helpers + consistency-sandbox + DP-2 patterns.

### 3.1 OWL Constructs (TBox)

- `rdfs:subClassOf` (named + complex class expressions)
- `owl:equivalentClass`
- `owl:disjointWith` (BFO Disjointness Map enforcement depends on this)
- `owl:Restriction` with `owl:someValuesFrom`, `owl:allValuesFrom`, `owl:hasValue`
- Cardinality: `owl:minCardinality`, `owl:maxCardinality`, `owl:cardinality` (qualified + unqualified)
- `owl:intersectionOf`, `owl:unionOf`, `owl:complementOf`
- `owl:Class`, `owl:Thing`, `owl:Nothing`

### 3.2 OWL Constructs (RBox)

- `rdfs:subPropertyOf`
- `owl:inverseOf`
- Property characteristics: `Functional`, `InverseFunctional`, `Transitive`, `Symmetric`, `Asymmetric`, `Reflexive`, `Irreflexive`
- `owl:propertyChainAxiom` (used by some BFO patterns)
- `rdfs:domain`, `rdfs:range` — see §3.5 (correctness requirement)
- `owl:disjointObjectProperties`

### 3.3 OWL Constructs (ABox)

- Class assertions, property assertions
- `owl:sameAs`, `owl:differentFrom`

### 3.4 Restriction Input Shape

Library input MUST accept restrictions in the **OWL 2 standard JSON-LD shape**:

```json
{
  "@type": "owl:Restriction",
  "owl:onProperty": "<IRI>",
  "owl:someValuesFrom": "<IRI or class expression>",
  ...
}
```

This is the shape Fandaws produces at parsed.classes[i].restrictions per Step 7.13. Library MUST consume this directly without caller-side transformation. If library expects a different shape, that's an integration tax flagged as a v0.x limitation.

### 3.5 Domain/Range Semantics — EXPLICIT NON-REQUIREMENT (HIGH RISK)

**Library MUST NOT translate `rdfs:domain X` / `rdfs:range Y` into `subClassOf [Restriction someValuesFrom Y]` on `X`.**

Domain and range axioms are **conditional axioms used for argument-position type-checking**, not universal-existential structural axioms. The correct FOL translation:

- `rdfs:domain(P, X)` →  `∀x,y. P(x,y) → X(x)` (conditional)
- `rdfs:range(P, X)` →  `∀x,y. P(x,y) → X(y)` (conditional)

The **wrong** translation (which Fandaws was doing on its own side, surfaced and banked at Step 7.19 HIGH-priority):

- `rdfs:domain(P, X)` → ❌ `X ⊑ ∃P.⊤` (existential — synthesizes a FALSE universal axiom)
- `rdfs:range(P, X)` →  ❌ `⊤ ⊑ ∀P.X` (synthesizes a FALSE universal axiom)

**Worked example of correct translation:**

```
Input OWL:
  prov:wasInfluencedBy rdfs:domain prov:Entity .
  prov:wasInfluencedBy rdfs:range prov:Entity .

Correct FOL:
  ∀x,y. prov:wasInfluencedBy(x,y) → prov:Entity(x)
  ∀x,y. prov:wasInfluencedBy(x,y) → prov:Entity(y)

WRONG FOL (must not emit):
  prov:Entity ⊑ ∃prov:wasInfluencedBy.⊤
  ⊤ ⊑ ∀prov:wasInfluencedBy.prov:Entity
```

This is a HIGH-RISK correctness requirement because both library author and Fandaws Dev team will be tempted to existentialize. The wrong translation produces subtly-wrong reasoning (false instance constraints, invalid disjointness firing) that passes most casual tests.

Library MUST include test fixtures explicitly verifying the conditional, non-existential translation.

### 3.6 Annotation Property Handling — Caller-Declarable Structural Annotations

"Annotations should round-trip but not participate in inference" is the OWL-standard default.

**Fandaws exception:** Fandaws uses certain annotation-property IRIs as **structural signals** consumed by:

- Workbench Phase 3 orphan rule
- BFO Disjointness Map
- DP-2 records
- Bucket inference (e.g., `fandaws:bfoSubcategory`)

The library cannot know which annotation properties are inference-relevant in the consumer.

**Requirement:** Library MUST allow caller-side declaration of structural-annotation properties:

```js
createSession({
  structuralAnnotations: [
    'fandaws:bfoSubcategory',
    'fandaws:relationCharacteristics',
    'fandaws:isImported',
    'fandaws:reproducibilityHash',
  ]
})
```

For declared IRIs, the library treats them as load-bearing for evaluation (translates to FOL predicates participating in inference) rather than as opaque metadata. Otherwise → library skips them per OWL standard.

Without this, Fandaws's BFO bucket inference breaks.

### 3.7 Punted Constructs (v1.0 may defer to v1.x)

Acceptable to defer if not currently exercised by Bucket C / consistency-sandbox:

- OWL 2 punning (same IRI as class + property + individual)
- Datatype restrictions beyond basic xsd types
- `owl:hasKey`
- Negative property assertions
- Annotation reasoning beyond §3.6

Library README MUST explicitly enumerate punted constructs so Fandaws knows the boundary.

### 3.8 Consistency-Checking API — First-Class

Phase D2 `consistency-sandbox.js` does more than evaluate queries — it checks classification consistency under the BFO Disjointness Map.

**Requirement:** Library MUST expose consistency-checking as a first-class API, not just query evaluation:

```
checkConsistency(session, axiomSet): {
  consistent: boolean,
  witnesses?: <list of inconsistent axiom subset(s)>,
  reason?: string  // enum from §2.5.1
}
```

Without this, Fandaws's Phase 3 consistency-sandbox stays in Fandaws and the library is doing only partial duty (query evaluation is a subset of the substrate need).

### 3.9 OWA Default, CWA Opt-In with Per-Predicate Closure

Per `feedback_absence_not_evidence.md`: absence of an axiom is NOT evidence of negation.

**3.9.1 OWA is the default mode.** `undetermined` is load-bearing.

**3.9.2 CWA mode opt-in via `closedPredicates` parameter:**

```
evaluate(session, query, {
  closedPredicates: new Set([
    'fandaws:bfoSubcategory',
    'fandaws:hasCuratedRoot',
    ...
  ])
})
```

Only listed predicates are closed; all others remain open. Whole-ontology CWA is a different semantic and is rejected — Wave 0/1 helpers operate over curated finite lists per-predicate. The library MUST match this discipline.

---

## 4. Performance Requirements

### 4.1 Initialization Cost Bounded

`createSession()` MUST not exceed current Tau Prolog session creation cost (~50-200 ms documented baseline). Library README MUST document the cost; CI MUST track regression.

### 4.2 Per-Evaluation Budget

Bucket C helpers run at NC-evaluation time; current 6 helpers per CAU per phase.

Library MUST support evaluating ~30-50 queries per session within the 10K-step-per-query cap (§2.4.1) without thrashing. Profile + document.

### 4.3 No Memory Leak Across Sessions

Sessions disposed via `disposeSession()` MUST release Tau Prolog state fully. Long-running browser sessions ingest multiple ontologies; leaking is unacceptable.

CI MUST include session-creation/disposal stress test verifying memory recovery.

---

## 5. Verification + Provenance Requirements

### 5.1 Reproducibility Hash on Conversion Output

Fandaws DP-2 invariant I3 (Deterministic Hash) requires content-addressed evidence.

Library conversion output MUST be canonicalizable:

- Stable JSON serialization (sorted keys, deterministic order)
- Deterministic blank-node IDs (per §1.3.1)
- Deterministic IRI form (per §1.9)

Fandaws hashes the FOL output and embeds in DP-2 records. If output is non-canonicalizable, DP-2 invariant I3 breaks.

### 5.2 Provenance Attribution

Library version + conversion-rule version MUST be retrievable:

```
getVersionInfo(): {
  libraryVersion: string,        // semver, e.g., "1.0.0"
  conversionRulesVersion: string, // see §6.1.1
  tauPrologVersion: string,
  ...
}
```

Fandaws DP-2 records embed this so future researchers can identify which library version produced a given evidence record.

Library version bumps become load-bearing events Fandaws CI MUST track.

### 5.3 Test Corpus Exposure with Fandaws-Verified Ontologies

Library MUST ship its own test corpus as importable test data:

- OWL fixtures
- Expected FOL outputs
- Expected evaluation outcomes
- Expected consistency-check outcomes

**5.3.1 Required corpus members (Fandaws-verified ontologies).** To enable integration testing without reinvention, the corpus MUST include:

- BFO 2020 core
- PROV-O excerpt (full PROV-O preferred)
- CCO Geospatial
- CCO Agent

Fandaws can re-run its existing dry-runs against the library, dramatically simplifying integration testing.

Fandaws's test suite will run a subset against the library at integration boundary to catch drift between library versions.

---

## 6. Documentation + Governance Requirements

### 6.1 Public API Stability — Semver

Semver compliance:

- **Major** = breaking API
- **Minor** = additive
- **Patch** = bugfix

Fandaws will pin to a major; minor/patch bumps trigger CI verification (70/70 D1.6 AVC + bundle v6 SWC + Bucket C helpers) before merge.

**6.1.1 Conversion semantics versioning.** API-shape semver alone is insufficient. Conversion-semantics changes (e.g., how `owl:hasKey` translates) MUST require **minor version bump minimum** even when API signature is unchanged.

The conversion-rule version MUST be exposed via `getVersionInfo().conversionRulesVersion` so DP-2 records track it. Without this, content-addressable evidence ages silently across library updates.

### 6.2 README Specifies OWL + FOL Fragments

Tabular documentation:

- OWL constructs supported
- FOL fragment emitted
- Constructs round-tripped cleanly
- Constructs lossy (with description of loss)
- Constructs explicitly punted

Without this, Fandaws cannot decide which Bucket C helpers can migrate cleanly vs. which need workarounds.

### 6.3 Migration Guide — Runnable Migration Kit, Not a Doc

When the library is ready to consume, Fandaws will need:

(a) Replace Bucket C helper internals with library calls
(b) Replace `consistency-sandbox.js` with library calls
(c) Update DP-2 record format to carry library's version + FOL evidence

The library MUST ship more than docs:

**6.3.1 Compatibility shim package.** Library MUST ship `@library/fandaws-compat` (or equivalent name) — a shim package exposing the legacy Bucket C helper signatures, backed by library calls. Drop-in replacement test surface.

**6.3.2 Parallel-run mode.** Shim MUST support a parallel-run mode where shim and current Fandaws implementation BOTH evaluate and Fandaws asserts equality on every call. Cutover-via-parallel-validation, not cutover-via-leap-of-faith.

**6.3.3 Cutover path.** Documented sequence: parallel-run → assertion baseline → soak window → cutover → shim retirement.

Without (6.3.2), the cutover is risky. STRONGLY RECOMMENDED the library team commit to this from project inception, not as an afterthought.

### 6.4 Independent CI + Test Suite

Library CI MUST be independent of Fandaws. Fandaws cannot be a blocking dependency for library development. The library proves its own correctness; Fandaws then verifies its consumption is correct.

### 6.5 Tau Prolog Version Pinning

Library MUST pin Tau Prolog to a specific known-bundle-compatible version (currently v0.3.4 per Fandaws's d0a6619 workaround for Node-only `require`).

Tau Prolog upgrade is a **library major version event** — bundle compatibility regressions must not surface mid-flight.

---

## 7. Process Requirements

### 7.1 Conversion Failure Surface = Honest-Admission

Per `feedback_proof_discipline.md`: if the library encounters an OWL construct it cannot convert, throw `UnsupportedConstructError` with a `construct` field naming what's unsupported.

Don't silently degrade. Don't auto-skip. Don't emit `// TODO` placeholder FOL. Fandaws will demote affected NC helpers to heuristic mode at the boundary.

### 7.2 No Backwards-Compat Hacks at Conversion Boundary

Per Fandaws's "don't add backwards-compatibility shims" rule: when library conversion rules change between versions, version bump cleanly. Don't accumulate version-detection code inside conversion functions.

The compatibility shim package (§6.3.1) is the sanctioned location for compat code; the conversion engine itself stays clean.

### 7.3 Verification Cycle Gate Before Fandaws Consumption

The library passing its own CI is **necessary but not sufficient** for Fandaws consumption.

**Required gate:** before any Fandaws consumption-side migration starts, a formal verification cycle in which Fandaws re-runs its 70/70 D1.6 AVC + bundle v6 SWC + Bucket C helper tests against the library's reference implementation (via the compatibility shim, §6.3.1).

This is the cycle-discipline analog of X-arc reception memos: library output is reviewed by the consuming team before integration commits.

---

## 8. Spec Dependencies

Two-way dependency tracking prevents either side from blocking the other inadvertently. Maintained list:

### 8.1 Library decisions waiting on Fandaws specs

- **§1.9 IRI canonicalization contract** — depends on Fandaws's Reified Constitutive Relations Specification §3 IRI canonicalization rule (Step 7.17 banked, dependency on spec landing).
- **§3.6 Structural-annotation property list** — depends on Reified Constitutive Relations Specification (canonical Fandaws annotation IRIs).

### 8.2 Fandaws decisions waiting on library

- **Bucket C helper migration plan** — depends on library v1.0 with §3.1-§3.8 coverage and §6.3 compatibility shim.
- **`consistency-sandbox.js` retirement plan** — depends on library §3.8 first-class consistency-checking API.
- **DP-2 record format extension for FOL evidence** — depends on library §2.7 JSON-LD-shaped term tree + §5.2 version metadata.

### 8.3 Independent items

- **§3.5 Domain/range semantics** — both teams have surfaced the bug independently (Step 7.19 on Fandaws side); requirement stands regardless of spec dependencies.
- **§3.9 OWA / CWA boundary** — settled discipline on Fandaws side; library inherits.

This list MUST be reviewed at every spec-touch on either side.

---

## 9. TL;DR — Minimum Bar Checklist

### Architectural

- [ ] Edge-canonical (browser + Node, no FFI)
- [ ] ES Modules, esbuild-compatible
- [ ] Bundle ≤ 200 KB minified additive (HARD requirement, CI-gated)
- [ ] Deterministic, no probabilistic anything
- [ ] Blank-node ID determinism (same input → same Skolem IDs across runs)
- [ ] IRI canonicalization contract specified (input forms accepted, internal canonical, output form)

### API

- [ ] Caller-owned session lifecycle, explicit-per-call threading
- [ ] Async API via Promise/async-await (no naked callbacks)
- [ ] Three-state evaluation result `{satisfied|unsatisfied|undetermined}` with reason enum
- [ ] Reason enum stability (DP-2 I4 dictionary discipline; canonical enum published)
- [ ] Step cap per-query; optional `maxAggregateSteps` for session-wide
- [ ] Typed error classes per failure family
- [ ] OWL input as parsed JS structure (not raw text)
- [ ] FOL output as JSON-LD-shaped term tree (DP-2 evidence embeds without encoding shim)
- [ ] Round-trip identity-assertion API
- [ ] Cycle detection contract documented (or typed `CycleDetectedError`)

### Functional Coverage

- [ ] OWL TBox: subClassOf, equivalentClass, disjointWith, Restriction (some/all/has-value), cardinality, intersection/union/complement
- [ ] OWL RBox: subPropertyOf, inverseOf, characteristics, propertyChainAxiom, domain/range, disjointObjectProperties
- [ ] OWL ABox: class/property assertions, sameAs/differentFrom
- [ ] Restriction input shape = OWL 2 standard JSON-LD (matches Fandaws Step 7.13)
- [ ] **Domain/range correctness asserted (NOT translated to existential restrictions on domain class — HIGH RISK)**
- [ ] Caller-declarable structural-annotation properties (load-bearing annotations preserved)
- [ ] Consistency-checking API as first-class (not just query evaluation)
- [ ] OWA default; CWA mode accepts `closedPredicates` parameter (per-predicate, not whole-ontology)

### Verification + Provenance

- [ ] Reproducibility hash on conversion output (canonicalizable)
- [ ] Provenance: library version + conversion-rules version exposed via `getVersionInfo()`
- [ ] Test corpus includes BFO 2020, PROV-O, CCO Geospatial, CCO Agent

### Governance

- [ ] Semver, with conversion-semantics changes requiring minor bump minimum
- [ ] README specifies OWL + FOL fragments tabularly
- [ ] Tau Prolog version pinned (upgrade = library major)
- [ ] Independent CI + test suite

### Process

- [ ] `@library/fandaws-compat` shim package with parallel-run mode
- [ ] Verification cycle gate before Fandaws consumption (70/70 D1.6 AVC + bundle v6 SWC pass)
- [ ] Two-way spec dependency tracking maintained (§8)

---

## 10. Highest-Risk Items (Special Attention)

### 10.1 Domain/Range Semantics (§3.5)

**Highest correctness risk in this requirements set.** Both library author and Fandaws Dev team will be looking at OWL property-position axioms; both will be tempted to existentialize them; both will produce subtly-wrong reasoning if not explicitly prohibited.

Fandaws surfaced this bug on its own side at Step 7.19 (banked HIGH-priority). The library MUST get this right from day one — retrofitting the correct semantic after corpus has been built on the wrong translation is expensive.

Required: explicit non-requirement language in §3.5, worked example showing wrong translation, and test fixtures verifying conditional (non-existential) FOL emission.

### 10.2 Compatibility Shim + Parallel-Run (§6.3.1-§6.3.2)

**Highest process risk.** A drop-in replacement claim is risky without empirical equivalence verification. The shim package + parallel-run discipline turns a leap-of-faith cutover into a measurable migration.

Required: library team commits to the shim package + parallel-run mode from project inception, not as an afterthought. Library v1.0 ships with the shim; without it, Fandaws cannot safely consume.

---

## 11. Document Provenance + Acknowledgements

**v1.0 — 2026-04-29.** Initial draft. Source: Fandaws's 6 architectural non-negotiables; X6 §6.2 / X7 / Phase D2 substrate dependencies; DP-2 invariants I1-I4; Steps 7.13-7.20 surfacings (IRI canonicalization, blank-node identity, restriction extraction, domain/range semantics, structural annotations).

**Critique-incorporated.** This v1.0 folds in eight gaps (G1-G8), six clarifications (C1-C6), and four process concerns (P1-P4) raised in critique cycle 2026-04-29. Critique authorship retained on Fandaws SME side; gaps and process concerns map to:

- G1 → §1.9
- G2 → §1.3.1
- G3 → §3.8
- G4 → §2.4.1, §2.4.2
- G5 → §3.4
- G6 → §3.5 (HIGH-RISK, §10.1)
- G7 → §3.6
- G8 → §2.10
- C1 → §1.6.1
- C2 → §2.5.1
- C3 → §2.7
- C4 → §3.9
- C5 → §5.3.1
- C6 → §6.1.1
- P1 → §7.3
- P2 → §6.5
- P3 → §6.3 (HIGH-RISK, §10.2)
- P4 → §8

**Forward-flagged for v1.1:**
- Library author response to requirements
- Reified Constitutive Relations Specification §3 publication (unblocks §1.9 + §3.6)
- Library scoping document publication (closes the requirements↔scope loop)

---

**End of Requirements v1.0.**
