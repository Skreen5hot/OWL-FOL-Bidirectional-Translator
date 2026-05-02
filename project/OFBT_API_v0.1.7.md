# OFBT API Specification v0.1.7

**OWL ↔ FOL Bidirectional Translator — API Specification**

*Document version: 0.1.7 (companion to OFBT_spec_v0.1.7.md)*
*Status: pre-implementation FREEZE candidate — see behavioral spec §0.2*
*Audience: implementers, integrators, and consumers writing code against OFBT*

---

## 0. Reading this document

This is the API specification for OFBT v0.1.7. It is the companion to **`OFBT_spec_v0.1.7.md`** (the behavioral specification), and the two documents are read together as the complete OFBT v0.1.7 deliverable.

The behavioral specification describes **what** OFBT does and **why**. This document describes **how** to use it.

The API specification:

- **Cannot relax or contradict** any architectural decision (ADR) in the behavioral specification
- **Must expose** every behavioral commitment in the behavioral specification through concrete function signatures and parameter shapes
- **May add** API-specific acceptance criteria, packaging requirements, and consumer-facing details that are out of scope for the behavioral specification

If the two documents conflict, the behavioral specification is authoritative on behavior; this document is authoritative on API surface. In practice such conflicts are bugs in one or the other and should be reported and resolved before publication.

### 0.1 Revision History

#### v0.1.7 (this revision — FREEZE candidate)

This revision incorporates the Fandaws Architect critique of v0.1.6 and addresses all five substantive gaps (G1-G5) plus all six clarifications (C1-C6). Per behavioral specification §0.2, **v0.1.7 is the last pre-implementation revision**; v0.2 starts implementation.

Architect-flagged substantive gaps (closed):

- §13.4 (revised) — **G1**: Bundle budget split with explicit per-component caps; ARC manifest tree-shakeable per behavioral spec §3.6 module structure.
- §2.1.2 (new) — **G2**: `arcManifestVersion` mismatch detection between session and conversion paths, parallel to v0.1.6's `structuralAnnotations` mismatch detection.
- §7.1 (revised) and §7.5 (new) — **G3**: `evaluate` query type restricted to Horn-clause-safe subset for v0.1; semantics specified per FOLAxiom variant; `UnsupportedConstructError` thrown on richer queries.
- §8.1.2 (new) — **G4**: `axiomSet` participation in coherence check is specified explicitly; hypothetical axioms participate in the check but do not persist in the session.
- §9.2 (new) — **G5**: Sync `verifyTauPrologVersion()` function added so consumers can fail-fast pre-session without side-effect-heavy patterns.

Architect-flagged clarifications (closed):

- §6.2 (revised) — **C1**: `folToOwl` accepts `prefixes` parameter; signature updated.
- §6.4.3 (revised) — **C2**: `cycle_break` step type split into `cycle_detected_branch_aborted` and `cycle_break_visited_ancestor_applied`; semantics for each.
- §6.4.1 (revised) — **C3**: Loss Signature severity ordering committed as part of the API contract with semver consequences for changes.
- §0.2 (new) — **C4**: I/O contract documented per function (sync vs async, what touches disk/network/Tau Prolog).
- §14.11 (new) — **C5**: Test corpus coverage matrix mapping corpus members to acceptance criteria.
- §2.0 (new) — **C6**: `LifterConfiguration` base type introduced; `SessionConfiguration extends LifterConfiguration`; sessionless functions take the base type.

Smaller items also closed:

- ARC module declaration (`arcModules?: string[]`) added to `LifterConfiguration` per behavioral spec §3.6.2

#### v0.1.6

Fandaws Dev critique response: domain/range correctness at API surface, IRI canonicalization at API surface, blank-node ID determinism commitment, audit artifact types defined, Horn-fragment limit surfacing on consistency check, Tau Prolog peer-dependency contract, expected-divergence baselines for verification gate.

#### v0.1.5

Initial publication of the API specification as a companion to the behavioral specification.

---

## 0.2 I/O Contract Per Function

Per the architect's C4 clarification, this section documents which functions touch disk/network/Tau Prolog and which are pure CPU. Consumers integrating OFBT into latency-sensitive paths can use this table to plan call sites.

| Function | Sync/Async | Tau Prolog? | I/O? | Notes |
|---|---|---|---|---|
| `createSession` | Sync | Yes (init) | No | Allocates Tau Prolog session; does not load files. ARC modules are statically imported per §3.6 of behavioral spec. |
| `disposeSession` | Sync | Yes (cleanup) | No | Releases Tau Prolog state. |
| `getVersionInfo` | Sync | No | No | Pure constant access. |
| `verifyTauPrologVersion` | Sync | Yes (read version) | No | Reads Tau Prolog's exposed version string; no inference. |
| `owlToFol` | Async | Yes (lifter normalization) | No | Calls `rdf-canonize` for blank node canonicalization (which is async); calls Tau Prolog for predicate-name normalization. No file I/O. |
| `folToOwl` | Async | Yes (projection normalization) | No | Same I/O profile as `owlToFol`. |
| `roundTripCheck` | Async | Yes (lift + project) | No | Composes `owlToFol` and `folToOwl`; no additional I/O. |
| `evaluate` | Async | Yes (SLD resolution) | No | Tau Prolog inference; bounded by `stepCap`. |
| `checkConsistency` | Async | Yes (Horn check) | No | Same as `evaluate` plus class-satisfiability inference. |
| `parseOWL` | Async | No | No (input is in-memory string) | Wraps a parser library (N3.js or similar). Async because parser libraries are async. |

**Why no file I/O.** OFBT operates on already-loaded data (in-memory `OWLOntology` structures). File I/O is consumer responsibility — `parseOWL` accepts an in-memory string, not a file path. This honors the edge-canonical principle (browser-compatible by default; no Node-only `fs` dependencies).

**Why createSession is sync.** ARC manifest modules are statically imported (per behavioral spec §3.6.1 and tree-shaking commitment) — they are part of the bundle, not loaded at runtime. This keeps `createSession` synchronous and avoids forcing consumers into async contexts for session setup.

**Tau Prolog interaction notes.** All async functions that call Tau Prolog are bounded by step caps (`stepCap` per query, `maxAggregateSteps` per session). Tau Prolog uses `setTimeout(0)` chains internally for cooperative scheduling; this composes cleanly with Promise-returning APIs but does mean OFBT calls yield to the event loop frequently. Consumers in tight UI loops should call OFBT functions in non-blocking patterns (via `requestIdleCallback` or task queues).

---

## 1. Overview

OFBT ships as a single npm package, edge-canonical, ES Module-only, with a small surface of named exports. The complete public API consists of:

- **3 conversion functions**: `owlToFol`, `folToOwl`, `roundTripCheck`
- **2 session lifecycle functions**: `createSession`, `disposeSession`
- **2 evaluation functions**: `evaluate`, `checkConsistency`
- **1 introspection function**: `getVersionInfo`
- **11 typed error classes**
- **1 stable reason enum** (14 members)
- **A handful of TypeScript-style type definitions** for inputs, outputs, and configuration

The full surface is specified below. v0.1.5 does not commit to TypeScript types as the source of truth — the package ships with hand-authored `.d.ts` files derived from this specification — but the type shapes documented here are normative.

### 1.1 Package layout

```
@ontology-of-freedom/ofbt/        # main package
  - core API: createSession, evaluate, checkConsistency, ...
  - error classes
  - reason enum
  - type definitions

@ontology-of-freedom/ofbt-compat-fandaws/   # compatibility shim
  - Bucket C helper signatures backed by OFBT calls
  - parallel-run mode
```

The `-compat-fandaws` package is a separate npm package that depends on the core. Other consumers may write their own compat packages following the same pattern.

### 1.2 Edge-canonical commitment

The core package and its dependencies satisfy the edge-canonical principle:

- **Browser:** runs unmodified via `<script type="module">` or any modern bundler
- **Node.js:** runs unmodified via `import` (ESM); v18+ recommended (for native test runner support)
- **No native bindings, no FFI, no Node-only modules in the runtime path**

The only runtime dependencies outside Tau Prolog (which is assumed already-present in consuming environments per ADR-016) are `rdf-canonize` (RDFC-1.0 reference implementation, JS-native) and the package's own code.

---

## 2. Configuration Types

The unified configuration model from the behavioral specification §3.5 binds to two TypeScript-style types organized hierarchically: `LifterConfiguration` is the base for sessionless conversion; `SessionConfiguration` extends it with session-specific fields.

### 2.0 LifterConfiguration (base type for sessionless conversion)

Per the architect's C6 clarification: stateless functions like `owlToFol` and `folToOwl` do not need session-specific configuration. They take `LifterConfiguration`, which carries only the fields relevant to conversion behavior.

```typescript
interface LifterConfiguration {
  // Axis A: ARC coverage (behavioral spec §3.3, §3.5.1)
  arcCoverage?: 'strict' | 'permissive';   // default: 'permissive'

  // Axis C: Structural annotations (behavioral spec §3.5.3, §5.9)
  structuralAnnotations?: Set<string>;     // default: new Set()

  // ARC manifest version pin (behavioral spec §3, §11.1)
  // Optional — default to library-default ARC manifest
  arcManifestVersion?: string;

  // ARC modules to load (behavioral spec §3.6.2)
  // Optional — default loads all v0.1 modules
  // Examples: ['core/bfo-2020'] for minimal; full default loads everything
  arcModules?: string[];

  // Diagnostic options
  emitLossSignaturesToConsole?: boolean;   // default: false
}
```

All fields are optional; an empty `{}` is valid and produces a default lifter configuration suitable for browsing-grade conversion.

### 2.1 SessionConfiguration (extends LifterConfiguration)

Passed to `createSession()`. Adds session-lifecycle and resource-budget fields on top of `LifterConfiguration`.

```typescript
interface SessionConfiguration extends LifterConfiguration {
  // Step cap on aggregate session usage (behavioral spec §5.4)
  // Optional — default unbounded
  maxAggregateSteps?: number;

  // Persist Loss Signature ledger to disk for debugging
  // Optional — default in-memory only
  persistLedger?: string;
}
```

`SessionConfiguration` is a structural superset of `LifterConfiguration`. Any object satisfying `SessionConfiguration` also satisfies `LifterConfiguration` and may be passed to sessionless conversion functions. The reverse is not true: a `LifterConfiguration` instance lacks session-specific fields.

#### 2.1.1 Consistency between session and conversion configurations

When the same OWL ontology is both converted and evaluated within the same logical workflow, the `structuralAnnotations` set MUST be identical at both call sites. Mismatched declarations cause silent inference-behavior divergence: a predicate lifted as load-bearing during conversion but not declared structural at evaluation time produces queries that find no facts on that predicate.

OFBT detects mismatches at evaluation time. When a session evaluates a query referencing a predicate that was lifted as a structural annotation by some prior `owlToFol()` call (visible via the FOL state's metadata), but the session's own `structuralAnnotations` does not declare that predicate, the evaluation throws `OFBTError` with code `structural_annotation_mismatch`.

Strict callers should declare a single configuration object once and reuse it across both `owlToFol()` and `createSession()` to avoid drift. Because `SessionConfiguration` extends `LifterConfiguration`, a single `SessionConfiguration` literal can be passed to both call sites (sessionless functions ignore the session-only fields).

#### 2.1.2 ARC manifest version mismatch detection (G2)

Per the architect's G2 critique, `arcManifestVersion` is subject to the same mismatch hazard as `structuralAnnotations`. A consumer calling `owlToFol(ontology, { arcManifestVersion: '3.1' })` then `createSession({ arcManifestVersion: '3.0' })` and `evaluate(session, query)` over the converted FOL produces silent semantic drift: the lifted FOL was produced under v3.1 ARC axioms but evaluated against v3.0 axiom set.

OFBT detects this mismatch at evaluation time. The mechanism uses the existing `ConversionMetadata.arcManifestVersion` field (recorded by `owlToFol` per §6.1) — when a session evaluates against FOL state whose conversion metadata records a different `arcManifestVersion` than the session's own, the evaluation throws `OFBTError` with code `arc_manifest_version_mismatch` and reason code `arc_manifest_version_mismatch` (added in v0.1.7 as the 16th enum member, additive per §11.2).

The error's `expected` field carries the session's version; `found` carries the conversion metadata's version; `resolution` carries the hint `"Reconvert ontology under matching ARC version, or recreate session with matching version."`

This detection is symmetric with §2.1.1's structural-annotation mismatch detection. Together they ensure that conversion-and-evaluation pairs maintain semantic consistency across the API boundary.

### 2.2 QueryParameters

Passed to `evaluate()` and `checkConsistency()`. Determines per-query behavior.

```typescript
interface QueryParameters {
  // Axis B: Closure scope (behavioral spec §3.5.2, §6.3)
  // Default: empty set (full OWA)
  closedPredicates?: Set<string>;

  // Step cap per query (behavioral spec §5.4, this doc §11)
  // Default: 10000
  stepCap?: number;

  // Bindings to extract from satisfying assignments (evaluate only)
  // Default: undefined (no bindings extracted)
  // Example: ['x', 'y'] requests bindings for variables named 'x' and 'y'
  // in the query. Returned as Binding[] = [{x: <FOLTerm>, y: <FOLTerm>}, ...]
  extractBindings?: string[];
}
```

### 2.3 Mode interactions

Per behavioral specification §3.5.5:

- **Strict + closedPredicates**: any IRI in `closedPredicates` must be a Verified ARC entry. Closing an unknown IRI in strict mode throws `IRIFormatError` at query time.
- **Permissive + closedPredicates**: any IRI may be closed. Closing an unknown IRI emits a `unknown_relation` Loss Signature record but does not error.
- **structuralAnnotations + closedPredicates**: a structural annotation IRI may appear in either or both. If declared structural and closed, the predicate is treated as inference-relevant *and* closed-world for the relevant query.

---

## 3. Input Types

OFBT v0.1.5 accepts already-parsed structured JS as the primary input format per ADR-018. Text-format inputs (Turtle, JSON-LD, RDF/XML) are supported via a separate parsing helper but are not the primary path.

### 3.1 Structured ontology input

The library accepts an OWL ontology as a structured JS object with TBox, ABox, and RBox sections:

```typescript
interface OWLOntology {
  // Ontology metadata
  ontologyIRI: string;
  versionIRI?: string;
  imports?: string[];
  prefixes?: Record<string, string>;       // prefix → namespace URI

  // TBox: terminological axioms
  tbox: TBoxAxiom[];

  // ABox: assertional axioms
  abox: ABoxAxiom[];

  // RBox: role-axioms
  rbox: RBoxAxiom[];

  // Annotations (treated per structuralAnnotations declaration)
  annotations?: AnnotationAxiom[];
}
```

The format is deliberately structured rather than raw triples: it matches what RDF parsers like N3.js produce after parsing (Fandaws Consumer Requirement §2.6) and avoids duplicating parsing concerns inside OFBT.

### 3.2 TBox axioms

```typescript
type TBoxAxiom =
  | SubClassOfAxiom
  | EquivalentClassesAxiom
  | DisjointWithAxiom
  | ClassDefinitionAxiom;

interface SubClassOfAxiom {
  '@type': 'SubClassOf';
  subClass: ClassExpression;
  superClass: ClassExpression;
}

interface EquivalentClassesAxiom {
  '@type': 'EquivalentClasses';
  classes: ClassExpression[];   // length >= 2
}

interface DisjointWithAxiom {
  '@type': 'DisjointWith';
  classes: ClassExpression[];   // length >= 2
}

interface ClassDefinitionAxiom {
  '@type': 'ClassDefinition';
  iri: string;                  // the named class
  expression: ClassExpression;  // its definition
}
```

### 3.3 Class expressions

Class expressions are the recursive structure used in TBox axioms:

```typescript
type ClassExpression =
  | NamedClass
  | ClassIntersection
  | ClassUnion
  | ClassComplement
  | ObjectSomeValuesFrom
  | ObjectAllValuesFrom
  | ObjectHasValue
  | ObjectMinCardinality
  | ObjectMaxCardinality
  | ObjectExactCardinality
  | OneOf;

interface NamedClass {
  '@type': 'Class';
  iri: string;
}

interface ClassIntersection {
  '@type': 'ObjectIntersectionOf';
  classes: ClassExpression[];
}

interface ClassUnion {
  '@type': 'ObjectUnionOf';
  classes: ClassExpression[];
}

interface ClassComplement {
  '@type': 'ObjectComplementOf';
  class: ClassExpression;
}
```

### 3.4 Restrictions (OWL 2 standard JSON-LD shape)

Restrictions match the OWL 2 standard JSON-LD shape per Fandaws Consumer Requirement §3.4:

```typescript
interface ObjectSomeValuesFrom {
  '@type': 'Restriction';
  onProperty: string;                  // property IRI
  someValuesFrom: ClassExpression;
}

interface ObjectAllValuesFrom {
  '@type': 'Restriction';
  onProperty: string;
  allValuesFrom: ClassExpression;
}

interface ObjectHasValue {
  '@type': 'Restriction';
  onProperty: string;
  hasValue: string;                    // individual IRI
}

interface ObjectMinCardinality {
  '@type': 'Restriction';
  onProperty: string;
  minCardinality: number;
  onClass?: ClassExpression;           // qualified
}

interface ObjectMaxCardinality {
  '@type': 'Restriction';
  onProperty: string;
  maxCardinality: number;
  onClass?: ClassExpression;
}

interface ObjectExactCardinality {
  '@type': 'Restriction';
  onProperty: string;
  cardinality: number;
  onClass?: ClassExpression;
}
```

The `@type: 'Restriction'` tag is shared across the four restriction kinds, which are distinguished by which secondary field is present (`someValuesFrom`, `allValuesFrom`, `hasValue`, or one of the cardinality fields). This matches OWL 2's JSON-LD encoding and the shape Fandaws's `ontology-parser.js` produces.

### 3.5 ABox axioms

```typescript
type ABoxAxiom =
  | ClassAssertion
  | ObjectPropertyAssertion
  | DataPropertyAssertion
  | NegativeObjectPropertyAssertion
  | SameIndividual
  | DifferentIndividuals;

interface ClassAssertion {
  '@type': 'ClassAssertion';
  individual: string;                  // IRI
  class: ClassExpression;
}

interface ObjectPropertyAssertion {
  '@type': 'ObjectPropertyAssertion';
  property: string;                    // IRI
  source: string;                      // subject IRI
  target: string;                      // object IRI
}

interface DataPropertyAssertion {
  '@type': 'DataPropertyAssertion';
  property: string;
  source: string;
  value: TypedLiteral;
}

interface SameIndividual {
  '@type': 'SameIndividual';
  individuals: string[];               // length >= 2
}

interface DifferentIndividuals {
  '@type': 'DifferentIndividuals';
  individuals: string[];               // length >= 2
}
```

### 3.6 Typed literals

```typescript
interface TypedLiteral {
  '@value': string;                    // canonical lexical form per behavioral spec §5.6.5
  '@type': string;                     // datatype IRI (xsd:string by default)
  '@language'?: string;                // BCP 47 language tag, lowercase
}
```

### 3.7 RBox axioms

```typescript
type RBoxAxiom =
  | SubObjectPropertyOfAxiom
  | EquivalentObjectPropertiesAxiom
  | InverseObjectPropertiesAxiom
  | ObjectPropertyChainAxiom
  | ObjectPropertyDomainAxiom
  | ObjectPropertyRangeAxiom
  | DisjointObjectPropertiesAxiom
  | ObjectPropertyCharacteristicAxiom;

interface SubObjectPropertyOfAxiom {
  '@type': 'SubObjectPropertyOf';
  subProperty: string;
  superProperty: string;
}

interface ObjectPropertyChainAxiom {
  '@type': 'ObjectPropertyChain';
  chain: string[];                     // sequence of property IRIs
  superProperty: string;               // implied property
}

interface ObjectPropertyDomainAxiom {
  '@type': 'ObjectPropertyDomain';
  property: string;
  domain: ClassExpression;
}

interface ObjectPropertyRangeAxiom {
  '@type': 'ObjectPropertyRange';
  property: string;
  range: ClassExpression;
}

interface ObjectPropertyCharacteristicAxiom {
  '@type': 'ObjectPropertyCharacteristic';
  property: string;
  characteristic: 'Functional' | 'InverseFunctional' | 'Transitive' |
                  'Symmetric' | 'Asymmetric' | 'Reflexive' | 'Irreflexive';
}
```

### 3.7.1 Domain and range correctness — API-level non-requirement (HIGH PRIORITY)

`ObjectPropertyDomainAxiom` and `ObjectPropertyRangeAxiom` (§3.7) are the API surface for `rdfs:domain` and `rdfs:range` declarations. The lifter rule for these axioms is specified in behavioral specification §5.8 and is reproduced here at the API level because of its high-correctness-risk status: both library implementers and downstream consumers will be tempted to existentialize these axioms, and the wrong translation produces false universal axioms that pass casual tests.

#### 3.7.1.1 The correct translation

`ObjectPropertyDomainAxiom { property: P, domain: X }` lifts to the FOL axiom:

```
∀x,y. P(x,y) → X(x)
```

In the JSON-LD-shaped FOL output (§4):

```javascript
{
  '@type': 'fol:Universal',
  variable: 'x',
  body: {
    '@type': 'fol:Universal',
    variable: 'y',
    body: {
      '@type': 'fol:Implication',
      antecedent: {
        '@type': 'fol:Atom',
        predicate: '<P-IRI>',
        arguments: [
          { '@type': 'fol:Variable', name: 'x' },
          { '@type': 'fol:Variable', name: 'y' }
        ]
      },
      consequent: {
        '@type': 'fol:Atom',
        predicate: '<X-IRI>',
        arguments: [{ '@type': 'fol:Variable', name: 'x' }]
      }
    }
  }
}
```

Range axioms lift symmetrically: `consequent` becomes `X(y)` rather than `X(x)`.

#### 3.7.1.2 Forbidden translations

The lifter MUST NOT emit any of the following for `rdfs:domain(P, X)`:

```
WRONG: X ⊑ ∃P.⊤                    (universal-existential restriction on X)
WRONG: ∀x. X(x) → ∃y. P(x,y)        (synthesized universal axiom)
WRONG: SubClassOf(X, ∃P.⊤) in OWL  (existential restriction shape)
```

The wrong translation says: *every* member of `X` participates in `P` with some target. This is a synthesized universal axiom that is not in the source. Asserting `X(a)` would entail the existence of a Skolem successor `b` such that `P(a, b)` — a fact the source did not assert.

Symmetric forbidden patterns apply to `rdfs:range`.

#### 3.7.1.3 Worked example (PROV-O)

The example below is part of the v0.1 test corpus (behavioral spec §14 Q5).

**Source ontology (structured JS input):**

```javascript
const ontology = {
  ontologyIRI: 'http://example.org/test',
  prefixes: {
    prov: 'http://www.w3.org/ns/prov#'
  },
  rbox: [
    {
      '@type': 'ObjectPropertyDomain',
      property: 'http://www.w3.org/ns/prov#wasInfluencedBy',
      domain: { '@type': 'Class', iri: 'http://www.w3.org/ns/prov#Entity' }
    },
    {
      '@type': 'ObjectPropertyRange',
      property: 'http://www.w3.org/ns/prov#wasInfluencedBy',
      range: { '@type': 'Class', iri: 'http://www.w3.org/ns/prov#Entity' }
    }
  ],
  abox: [
    {
      '@type': 'ObjectPropertyAssertion',
      property: 'http://www.w3.org/ns/prov#wasInfluencedBy',
      source: 'http://example.org/project_alpha',
      target: 'http://example.org/project_beta'
    }
  ],
  tbox: []
};
```

**Correct lifted FOL (after `owlToFol`):**

```javascript
[
  // Domain axiom (conditional, NOT existential)
  { '@type': 'fol:Universal', variable: 'x', body: {
    '@type': 'fol:Universal', variable: 'y', body: {
      '@type': 'fol:Implication',
      antecedent: { '@type': 'fol:Atom', predicate: 'prov:wasInfluencedBy',
                    arguments: [{...x}, {...y}] },
      consequent: { '@type': 'fol:Atom', predicate: 'prov:Entity',
                    arguments: [{...x}] }
    }}
  },
  // Range axiom (conditional, NOT universal-on-property)
  { '@type': 'fol:Universal', variable: 'x', body: {
    '@type': 'fol:Universal', variable: 'y', body: {
      '@type': 'fol:Implication',
      antecedent: { '@type': 'fol:Atom', predicate: 'prov:wasInfluencedBy',
                    arguments: [{...x}, {...y}] },
      consequent: { '@type': 'fol:Atom', predicate: 'prov:Entity',
                    arguments: [{...y}] }
    }}
  },
  // Asserted property
  { '@type': 'fol:Atom', predicate: 'prov:wasInfluencedBy',
    arguments: [{ '@type': 'fol:Constant', iri: 'project_alpha' },
                { '@type': 'fol:Constant', iri: 'project_beta' }] }
]
```

**Querying** `prov:Entity(project_alpha)` returns `'true'` with reason `'consistent'`. **Querying** `prov:Entity(unrelated_individual)` for an individual that does not participate in the property returns `'undetermined'` with reason `'open_world_undetermined'`. The conditional translation does not falsely entail Entity membership for non-participants.

#### 3.7.1.4 API-level test fixtures (mandatory)

The API specification's acceptance criteria (§14, criterion API-9 added in v0.1.6) require explicit test fixtures in the library's CI verifying the conditional translation. Three fixtures minimum:

1. **Asserted-property fixture.** Domain axiom + property assertion. Verify domain-class membership entailed for the subject only.
2. **Range fixture.** Range axiom + property assertion. Verify range-class membership entailed for the object only.
3. **No-assertion fixture.** Domain axiom alone, no property assertions. Verify no individual is entailed to be in the domain class.

Each fixture must verify both the *positive* expected entailment (the asserted-participant is in the class) and the *negative* expected non-entailment (unrelated individuals are not).

#### 3.7.1.5 Why this is at the API level

The behavioral specification §5.8 already states this requirement. It is restated at the API level because:

1. The Fandaws Dev critique identified the absence of API-level commitment as a high-priority gap (G4).
2. Library implementers reading only the API spec (a common pattern) would otherwise miss the requirement.
3. The wrong translation passes casual tests and only surfaces as downstream BFO Disjointness Map violations, making it expensive to detect after corpus has been built. Pinning at the API level catches the mistake earlier in the implementation lifecycle.

### 3.8 Annotations

```typescript
interface AnnotationAxiom {
  '@type': 'Annotation';
  property: string;                    // annotation property IRI
  subject: string;                     // any IRI (class, individual, axiom)
  value: string | TypedLiteral;
}
```

Annotations whose `property` IRI is in the session's `structuralAnnotations` set are lifted to FOL per behavioral specification §5.9. Other annotations are preserved in the OWL output round-trip but do not participate in inference.

### 3.9 Text format inputs (secondary path)

For consumers without a pre-parsed structured object, OFBT provides a separate parsing helper:

```typescript
async function parseOWL(
  source: string,
  format: 'turtle' | 'json-ld' | 'rdf-xml' | 'n-triples'
): Promise<OWLOntology>;
```

This is a thin wrapper around standard RDF parsing libraries. It is not part of the conversion path — it exists only to make the structured input format accessible from text. Consumers using N3.js or similar parsers should construct the `OWLOntology` directly rather than going through this helper.

**Error contract.** `parseOWL` throws `ParseError` (the same class used by conversion-time parse errors per §10.2) on malformed input. The `ParseError.position` field is populated when the underlying parser provides line/column information; otherwise undefined. The `ParseError.construct` field is populated only when the failure is attributable to a specific OWL construct shape (e.g., a malformed `owl:Restriction`); generic syntax errors leave it undefined.

`parseOWL` is the only function in OFBT that performs RDF/text parsing. The conversion functions (`owlToFol`, `folToOwl`, `roundTripCheck`) operate on already-parsed `OWLOntology` structures.

### 3.10 IRI canonicalization at the API surface

Behavioral specification §4.2.1 specifies the IRI canonicalization contract. This section binds that contract to the API surface — what consumers can pass in, what comes back out.

#### 3.10.1 Input: forms accepted

OFBT accepts IRIs in any of three forms within `OWLOntology` and `FOLAxiom` inputs:

- **Full URI form**: `'http://purl.obolibrary.org/obo/BFO_0000050'` — bare absolute URI (no angle brackets in the JS string)
- **CURIE form**: `'bfo:BFO_0000050'` — prefix:local notation, requires a corresponding entry in `OWLOntology.prefixes`
- **Bracketed full URI form**: `'<http://purl.obolibrary.org/obo/BFO_0000050>'` — angle-bracketed; accepted but stripped on canonicalization

CURIE acceptance requires the prefix to be declared in `OWLOntology.prefixes`. A CURIE referencing an undeclared prefix throws `IRIFormatError` with `form: 'curie'`.

The same IRI in two different forms within the same `OWLOntology` is treated as referring to the same entity. For example, `'bfo:BFO_0000050'` and `'http://purl.obolibrary.org/obo/BFO_0000050'` (when the prefix is declared) lift to the same FOL predicate.

#### 3.10.2 Internal canonicalization

Internally, OFBT canonicalizes all IRIs to **expanded full URI form** (no angle brackets, no prefix abbreviation). CURIEs are expanded against the prefix table at ingestion. This canonical form is what the lifter passes to predicate-name normalization, what the blank-node registry stores, and what the audit artifacts (`LossSignature`, `RecoveryPayload`, `ProjectionManifest`) record.

The expanded form is used because it is the only form whose identity is independent of the prefix table — two graphs using different prefix shorthands for the same URI are correctly recognized as referencing the same entity.

#### 3.10.3 Output: FOL predicates and constants

`FOLAtom.predicate` and `FOLConstant.iri` strings in OFBT's FOL output use **expanded full URI form** by default. This is the canonical internal form and is what consumers receive from `owlToFol`, `evaluate` results, audit artifacts, and `ConsistencyResult.witnesses`.

For example, the OWL axiom `:Student rdfs:subClassOf :Person` (with prefix `:` declared as `http://example.org/`) lifts to:

```javascript
{
  '@type': 'fol:Universal',
  variable: 'x',
  body: {
    '@type': 'fol:Implication',
    antecedent: {
      '@type': 'fol:Atom',
      predicate: 'http://example.org/Student',   // full URI, not 'Student' or ':Student'
      arguments: [{ '@type': 'fol:Variable', name: 'x' }]
    },
    consequent: {
      '@type': 'fol:Atom',
      predicate: 'http://example.org/Person',    // full URI
      arguments: [{ '@type': 'fol:Variable', name: 'x' }]
    }
  }
}
```

This is non-negotiable for FOL output: round-trip determinism (§6.1) requires the canonical form be stable, and prefix-dependent predicate strings would break that.

#### 3.10.4 Output: OWL projection (folToOwl)

`folToOwl` projects FOL back to OWL. The output `OWLOntology` carries IRIs in a form determined by the source's prefix table:

- If the source `OWLOntology` (before lifting) used CURIEs and declared their prefixes, the projection re-introduces matching prefixes and uses CURIEs in the output (preserving round-trip stability of the surface form).
- If the source used full URIs without prefixes, the projection emits full URIs.
- The `OWLOntology.prefixes` field of the output reflects the prefix table used.

This means a round-trip `folToOwl(owlToFol(input))` produces an `OWLOntology` whose surface IRI form matches the input's convention. Round-trip parity (§6.3) holds at the FOL level regardless; surface-form preservation is an additional ergonomic guarantee.

For consumers calling `folToOwl` with FOL constructed by hand (no prior `owlToFol` call), the output uses full URI form unless the caller supplies a `prefixes` mapping in the optional configuration.

#### 3.10.5 Error contract

`IRIFormatError` is thrown when:

- An input string cannot be normalized to canonical form (malformed URI, missing scheme, invalid characters)
- A CURIE references an undeclared prefix
- The same IRI appears in two different forms within a context where consistent identity is required (e.g., the same b-node referenced both with and without canonical form within a single graph)

The error's `form` field discriminates the failure kind: `'full-uri'`, `'curie'`, `'bare-uri'`, or `'unrecognized'`.

---

## 4. Output Types — JSON-LD-Shaped FOL Term Tree

Per ADR-017, OFBT emits FOL as a JSON-LD-shaped term tree with explicit `@type` discrimination. This format embeds cleanly in Fandaws DP-2 records and is amenable to standard JSON-LD tooling.

### 4.1 The FOLAxiom tree

```typescript
type FOLAxiom =
  | FOLImplication
  | FOLConjunction
  | FOLDisjunction
  | FOLNegation
  | FOLUniversal
  | FOLExistential
  | FOLAtom
  | FOLEquality;

interface FOLImplication {
  '@type': 'fol:Implication';
  antecedent: FOLAxiom;
  consequent: FOLAxiom;
}

interface FOLConjunction {
  '@type': 'fol:Conjunction';
  conjuncts: FOLAxiom[];
}

interface FOLDisjunction {
  '@type': 'fol:Disjunction';
  disjuncts: FOLAxiom[];
}

interface FOLNegation {
  '@type': 'fol:Negation';
  inner: FOLAxiom;
}

interface FOLUniversal {
  '@type': 'fol:Universal';
  variable: string;                    // variable name (e.g., 'x')
  body: FOLAxiom;
}

interface FOLExistential {
  '@type': 'fol:Existential';
  variable: string;
  body: FOLAxiom;
}

interface FOLAtom {
  '@type': 'fol:Atom';
  predicate: string;                   // predicate IRI
  arguments: FOLTerm[];
}

interface FOLEquality {
  '@type': 'fol:Equality';
  left: FOLTerm;
  right: FOLTerm;
}
```

### 4.2 FOL terms

```typescript
type FOLTerm =
  | FOLVariable
  | FOLConstant
  | FOLLiteral;

interface FOLVariable {
  '@type': 'fol:Variable';
  name: string;
}

interface FOLConstant {
  '@type': 'fol:Constant';
  iri: string;
}

interface FOLLiteral {
  '@type': 'fol:Literal';
  value: TypedLiteral;
}
```

### 4.3 Why JSON-LD-shaped

The `@type` discrimination means standard JSON-LD frame matching, JSON Schema validation, and structural diff tools work on FOL output without custom code. Fandaws DP-2 records embed FOL evidence directly:

```json
{
  "@context": "...",
  "@type": "fandaws:DP2Record",
  "explanation": {
    "fol": {
      "@type": "fol:Implication",
      "antecedent": { ... },
      "consequent": { ... }
    }
  }
}
```

No encoding shim is needed at the DP-2 boundary. This is the load-bearing reason for ADR-017.

### 4.4 Worked example

The OWL axiom `Student SubClassOf Person` lifts to:

```javascript
{
  '@type': 'fol:Universal',
  variable: 'x',
  body: {
    '@type': 'fol:Implication',
    antecedent: {
      '@type': 'fol:Atom',
      predicate: 'http://example.org/Student',
      arguments: [{ '@type': 'fol:Variable', name: 'x' }]
    },
    consequent: {
      '@type': 'fol:Atom',
      predicate: 'http://example.org/Person',
      arguments: [{ '@type': 'fol:Variable', name: 'x' }]
    }
  }
}
```

Corresponding to the FOL axiom `∀x. Student(x) → Person(x)`.

---

## 5. Session Lifecycle

Per ADR-019, OFBT does not maintain module-level state. Sessions are caller-owned, explicitly created, and explicitly disposed. There is no implicit session, no automatic creation on first call, and no shared state between sessions.

### 5.1 createSession

```typescript
function createSession(
  config?: SessionConfiguration
): Session;
```

Creates a new Tau Prolog session and OFBT context. Returns a `Session` handle that must be passed to subsequent function calls.

The returned `Session` is an opaque type from the consumer's perspective. Internally it holds the Tau Prolog session, the current configuration, the ARC manifest, the blank node registry, the audit ledger, and the aggregate step counter.

**Synchronous.** Session creation does not perform any async work — it allocates and initializes data structures. Cost is bounded per behavioral specification §11 implementation note (target: <50ms).

### 5.2 disposeSession

```typescript
function disposeSession(session: Session): void;
```

Releases all resources held by the session: Tau Prolog state, blank node registry, audit ledger, ARC manifest reference. After disposal, any function call referencing the session throws `SessionDisposedError`.

**Idempotent.** Calling `disposeSession` on an already-disposed session is a no-op.

**Null/undefined handling.** Calling `disposeSession(null)` or `disposeSession(undefined)` throws `SessionRequiredError` (the same class used by other session-requiring functions per §10.3). This is symmetric with the rest of the API: any function that needs a session and doesn't receive one throws `SessionRequiredError`. Consumers using generic `OFBTError` catching catch this case correctly without needing a separate `TypeError` handler.

### 5.3 Lifecycle pattern

The standard pattern for consumers:

```javascript
import { createSession, disposeSession, evaluate } from '@ontology-of-freedom/ofbt';

const session = createSession({ arcCoverage: 'permissive' });
try {
  const result = await evaluate(session, query, { stepCap: 5000 });
  // ...
} finally {
  disposeSession(session);
}
```

Long-running consumers (e.g., browser apps ingesting multiple ontologies) MUST dispose sessions between ontology contexts. Failure to dispose causes Tau Prolog state accumulation and eventual memory exhaustion.

### 5.4 Session-required errors

Any function that requires a session — `evaluate`, `checkConsistency`, the lifter and projector internals exposed via `owlToFol` and `folToOwl` when called with a session — throws `SessionRequiredError` if called without one. This is a typed error per the throw-not-warn discipline.

---

## 6. Conversion Functions

The three conversion functions implement the lifter and projector specified in behavioral specification §5 and §6. They are async because the lifter calls `rdf-canonize` for blank node canonicalization, which is async.

### 6.1 owlToFol

```typescript
async function owlToFol(
  ontology: OWLOntology,
  config?: LifterConfiguration
): Promise<FOLConversionResult>;
```

Converts an OWL ontology to its FOL representation. Pure: does not require or modify a session. The optional `config` controls lifter behavior (most importantly `arcCoverage`, `structuralAnnotations`, and `arcModules`).

The function accepts `LifterConfiguration` (the base type, §2.0). Callers may also pass `SessionConfiguration` (the derived type, §2.1) — session-only fields like `maxAggregateSteps` are simply ignored by `owlToFol`. This permits the single-config-object pattern recommended in §2.1.1 for ensuring consistency between conversion and evaluation.

```typescript
interface FOLConversionResult {
  axioms: FOLAxiom[];                  // the lifted FOL axioms
  recoveryPayloads: RecoveryPayload[]; // per behavioral spec §7.3, type defined in §6.4
  lossSignatures: LossSignature[];     // per behavioral spec §7.2, type defined in §6.4
  metadata: ConversionMetadata;
}

interface ConversionMetadata {
  sourceOntologyIRI: string;
  bnodeRegistry: Map<string, string>;  // source bnode → canonical Skolem
  arcCoverage: 'strict' | 'permissive';
  arcManifestVersion: string;
}
```

The result includes both the FOL axioms and the audit artifacts. Consumers writing DP-2 records embed the audit artifacts alongside the conversion output.

#### 6.1.1 Determinism guarantee

**Same input + same `arcManifestVersion` → byte-identical output.** Specifically:

- The FOL `axioms` array is byte-identical (same axioms in same order)
- The `bnodeRegistry` mapping is byte-identical (same source b-node → same canonical Skolem ID across runs, across processes, across machines)
- The `recoveryPayloads` and `lossSignatures` arrays are byte-identical (content-addressed by FOL axiom hash per behavioral spec §7.5)
- The `metadata` is byte-identical except for any optional fields explicitly documented as non-reproducible

This guarantee is grounded in:

- RDFC-1.0 canonical labeling for blank nodes (behavioral spec §5.7, ADR-016)
- Deterministic predicate-name normalization
- Sorted iteration over input collections (no dependence on JS object insertion order; `Map` iteration is deterministic)
- No `Date.now()`, no `Math.random()`, no UUID generation in the conversion path (behavioral spec §0.1)

The determinism enables Fandaws DP-2 records to embed the conversion output's content hash and verify byte-stability across CI runs.

**ARC manifest version dependency.** When `arcManifestVersion` differs between two calls on the same input ontology, the FOL output may differ (different ARC entries can change which axioms inject and in what form). The version is part of the determinism contract: same input + same ARC version → same output. This is why the version is recorded in `metadata` and surfaced in the projection manifest.

#### 6.1.2 Throws

- `ParseError` — input ontology is malformed (e.g., a TBox axiom missing required fields)
- `UnsupportedConstructError` — input contains a punted construct (per behavioral spec §13.1)
- `IRIFormatError` — IRI in input cannot be normalized (§3.10)
- `CycleDetectedError` with `inSubsystem: 'class-hierarchy'` — input contains a cycle in the class hierarchy via `SubClassOf` or `EquivalentClasses` chains. Some valid OWL ontologies declare such cycles (rare under OWA), and OFBT detects them at conversion time rather than emitting a cyclic FOL representation that would loop at evaluation.
- `TauPrologVersionMismatchError` — pinned Tau Prolog version not satisfied by the consumer environment (§10.7, §13.7)

### 6.2 folToOwl

```typescript
interface FolToOwlConfig extends LifterConfiguration {
  // Prefix table for the OWL output (§3.10.4).
  // Optional — when omitted, output uses full URI form for all IRIs.
  // When provided, IRIs in the output use CURIE form for matching prefixes.
  prefixes?: Record<string, string>;
}

async function folToOwl(
  axioms: FOLAxiom[],
  recoveryPayloads?: RecoveryPayload[],
  config?: FolToOwlConfig
): Promise<OWLConversionResult>;
```

Converts FOL axioms back to OWL. The `recoveryPayloads` parameter is optional but recommended: it carries the FOL forms of reversible approximations needed for round-trip parity per behavioral specification §7.3.

The `config.prefixes` field controls the surface form of IRIs in the output. When `folToOwl` is called as part of a round trip (after `owlToFol`), the original ontology's prefix table is the natural value for `prefixes`:

```javascript
const lifted = await owlToFol(originalOntology, config);
const projected = await folToOwl(
  lifted.axioms,
  lifted.recoveryPayloads,
  { ...config, prefixes: originalOntology.prefixes }
);
```

When `folToOwl` is called with FOL constructed by hand (no prior `owlToFol`), omitting `prefixes` produces full-URI output; supplying `prefixes` produces CURIE output where prefixes match.

```typescript
interface OWLConversionResult {
  ontology: OWLOntology;               // the projected OWL ontology
  manifest: ProjectionManifest;        // per behavioral spec §7.4
  newRecoveryPayloads: RecoveryPayload[];
  newLossSignatures: LossSignature[];
}
```

**Throws:** same set as `owlToFol` plus:
- `RoundTripError` — projection produced an inconsistent or coherence-violating output (rare; only when validation finds an internal bug)

### 6.3 roundTripCheck

```typescript
async function roundTripCheck(
  ontology: OWLOntology,
  config?: SessionConfiguration
): Promise<RoundTripResult>;
```

Performs a complete round trip on an ontology and validates parity per behavioral specification §8. This is the canonical defense-in-depth call for consumers who need to verify their input round-trips cleanly.

```typescript
interface RoundTripResult {
  equivalent: boolean;
  diff?: RoundTripDiff;                // populated when equivalent === false
  intermediateForm: FOLConversionResult;
  finalForm: OWLConversionResult;
}

interface RoundTripDiff {
  missingFromOutput: FOLAxiom[];       // present in source FOL, absent from re-lifted output
  extraInOutput: FOLAxiom[];           // present in re-lifted output, absent from source FOL
  classification: 'tbox' | 'abox' | 'rbox' | 'mixed';
}
```

When `equivalent === false`, the diff is structured per behavioral specification §8.1's parity criterion. `missingFromOutput` corresponds to source entailments lost in projection; `extraInOutput` corresponds to spurious entailments introduced by projection.

`equivalent === true` means strict parity holds modulo the Loss Signature ledger. It does not mean byte-identity — Loss Signatures and Recovery Payloads are expected differences and do not affect the equivalence verdict.

### 6.4 Audit artifact types

The behavioral specification §7 defines three audit artifacts. This section binds them to the API surface with explicit type definitions.

#### 6.4.1 LossSignature

A `LossSignature` records true information loss — content from the source FOL state that did not survive projection and is not recoverable from the projected output.

```typescript
interface LossSignature {
  '@id': string;                       // content-addressed: ofbt:ls/<hash>
  '@type': 'ofbt:LossSignature';
  lossType: LossType;                  // discriminator
  relationIRI: string;                 // affected predicate (full URI form)
  reason: string;                      // machine-readable reason code
  reasonText: string;                  // human-readable explanation
  provenance: {
    sourceGraphIRI: string;
    arcVersion: string;
    timestamp?: string;                // omitted in reproducibility-mode runs
  };
}

type LossType =
  | 'closure_truncated'
  | 'naf_residue'
  | 'unknown_relation'
  | 'arity_flattening'
  | 'bnode_introduced'
  | 'coherence_violation'
  | 'lexical_distinct_value_equal'
  | 'una_residue';
```

**Severity ordering — committed contract.** When consumers want to triage Loss Signatures by severity, the canonical ordering (most severe first) is:

1. `coherence_violation` — projection would have collapsed a class
2. `naf_residue` — refutation lost
3. `arity_flattening` — n-ary structure flattened
4. `closure_truncated` — depth bound hit (may indicate need for `stepCap` increase)
5. `unknown_relation` — fallback path applied
6. `bnode_introduced` — FOL-level b-node not in source registry
7. `una_residue` — Prolog distinctness suppressed
8. `lexical_distinct_value_equal` — value-space equality not implemented

**This ordering is part of the API contract.** Per the architect's C3 critique, "advisory" severity ordering is ambiguous because consumers will use it for triage display and adjacent tooling will key behavior off it. v0.1.7 commits the ordering with semver consequences:

- **Adding a new severity level** in the middle of the list is a minor version bump.
- **Reordering existing levels** is a major version bump (downstream tooling may be sorting against the ordering).
- **Removing a level** is a major version bump (matches the LossType enum stability rules).
- **Renaming a level** is a major version bump.

The library exports the ordering as a frozen array constant so consumers can reference it programmatically:

```javascript
import { LOSS_SIGNATURE_SEVERITY_ORDER } from '@ontology-of-freedom/ofbt';
// LOSS_SIGNATURE_SEVERITY_ORDER === ['coherence_violation', 'naf_residue', ...]
// frozen; attempting modification throws
```

Consumers MAY apply their own ordering if their use case requires it; the OFBT-published ordering is the *default* expected by tooling that integrates with OFBT's audit artifacts.

**Consumer contract.** Loss Signatures are inspectable: consumers MAY read fields and surface them in their own diagnostics (e.g., DP-2 records). The `@id` is content-addressed for deduplication across CI runs. The schema is stable — additive changes (new `LossType` members) require minor version bump per behavioral spec §11.1; removing or renaming members requires major version bump.

#### 6.4.2 RecoveryPayload

A `RecoveryPayload` records a reversible approximation — content where the FOL form is preserved as annotation-bearing metadata so re-lifting reconstitutes the original FOL.

```typescript
interface RecoveryPayload {
  '@id': string;                       // content-addressed: ofbt:rp/<hash>
  '@type': 'ofbt:RecoveryPayload';
  approximationStrategy: 'PROPERTY_CHAIN' | 'ANNOTATED_APPROXIMATION';
  relationIRI: string;
  originalFOL: FOLAxiom;               // the recoverable FOL form (full structure)
  projectedForm: string;               // Turtle fragment of OWL projection
  axiomTemplate?: string;              // reusable template if applicable
  bindings?: Record<string, string>;   // template variable bindings
  scopeNotes?: string[];               // e.g., 'regularity_scope_warning'
}
```

**Consumer contract.** Recovery Payloads are inspectable but their primary purpose is round-trip recovery, not consumer-side reasoning. Consumers writing DP-2 records SHOULD embed them as opaque structures (read `@id`, `approximationStrategy`, `relationIRI` for telemetry; pass through the rest unchanged). Consumers attempting to read `originalFOL` and reason over it are using the FOL state directly and should call `evaluate` rather than inspecting recovery payloads.

The schema is stable per the same rules as `LossSignature`. The `originalFOL` field is the full structured FOL (per §4) — it is not opaque, but most consumers should treat it as opaque-by-contract.

#### 6.4.3 ProofTrace

A `ProofTrace` records the derivation steps that led to a particular FOL conclusion. Used in `ConsistencyResult.witnesses[].proof` (§8.1) when consumers need to understand *why* an inconsistency was found.

```typescript
interface ProofTrace {
  '@id': string;
  '@type': 'ofbt:ProofTrace';
  conclusion: FOLAxiom;                // what was proved
  steps: ProofStep[];                  // the derivation chain
  ruleApplications: number;            // total inference steps
}

interface ProofStep {
  rule: 'modus_ponens' | 'unification' | 'arc_axiom' | 'fact'
      | 'cycle_detected_branch_aborted'
      | 'cycle_break_visited_ancestor_applied';
  inputs: FOLAxiom[];                  // the axioms this step used
  output: FOLAxiom;                    // the axiom this step derived
  ruleSource?: string;                 // ARC IRI or fact provenance
}
```

**Step type semantics:**

- **`modus_ponens`** — standard implication elimination: from `A → B` and `A`, derive `B`.
- **`unification`** — bound a variable to a term during SLD resolution.
- **`arc_axiom`** — applied an axiom from the loaded ARC manifest. `ruleSource` carries the ARC entry IRI.
- **`fact`** — used a directly asserted fact (not derived). `ruleSource` carries the assertion's provenance (typically the source ontology IRI).
- **`cycle_detected_branch_aborted`** — resolution detected that this branch would loop and aborted it. The conclusion was *not* reached on this path; another path (recorded elsewhere in the proof tree) reached it. Per the architect's C2 critique, this is the case where cycle detection prevented runaway resolution but the ultimate conclusion succeeded via a different route.
- **`cycle_break_visited_ancestor_applied`** — the visited-ancestor list (per behavioral spec ADR-011) prevented re-entry to a recursive predicate during this step. The conclusion was reached *because* the cycle break was applied — without it, the resolution would not have terminated. This is the case where cycle detection actively contributed to finding the proof.

The two cycle-related step types are semantically distinct: the first marks a *failed* branch; the second marks a *successful* branch that depended on cycle protection. Consumers debugging proof traces can distinguish "did the proof succeed despite a cycle?" from "did the proof succeed because cycle protection enabled progress?"

**Future additions.** The `rule` enum may grow in minor versions per the same stability rules as `LossType` (additive only; removing or renaming requires major version bump).

**Consumer contract.** Proof traces are diagnostic, not reasoning surfaces. Consumers MAY render them for human inspection (especially in development tooling) but SHOULD NOT attempt to reason over their structure. The `rule` field is a small enum of inference primitives; future versions MAY add to this enum (additive only).

Proof traces are *optional* in `ConsistencyResult.witnesses[]` — they are populated only when the validator can produce them within the step cap. Long proofs may be truncated; the `ruleApplications` count includes truncated steps even when not all are returned.

#### 6.4.4 Why these are defined here

The Fandaws Dev critique of v0.1.5 (gaps C1, C2, C8) identified that v0.1.5 referenced these types in function signatures but did not define them in the API doc. This required consumers to read the behavioral specification to understand the data they were receiving. v0.1.6 brings the type definitions into the API doc directly so consumers writing code against OFBT have everything they need in one document.

The behavioral specification's §7 remains authoritative on the *meaning* of these artifacts (what they record, when they are emitted, why); this section is authoritative on the *shape* consumers see in API returns.

---

## 7. Evaluation Function

### 7.1 evaluate

```typescript
async function evaluate(
  session: Session,
  query: EvaluableQuery,
  params?: QueryParameters
): Promise<EvaluationResult>;

// Horn-clause-safe query subset for v0.1
type EvaluableQuery = FOLAtom | FOLConjunction;

// Note: FOLConjunction's conjuncts are restricted to FOLAtom for v0.1.
// Richer FOL queries (FOLImplication, FOLDisjunction, FOLNegation,
// FOLUniversal, FOLExistential, FOLEquality) are NOT supported in v0.1.
// See §7.5 for the per-variant disposition.
```

Evaluates a query against the session's FOL state. The query is either a single atom (e.g., `Person(alice)`) or a conjunction of atoms (e.g., `Person(alice), age(alice, X)`). Returns a three-state result per behavioral specification §6.3 and Fandaws Consumer Requirement §2.5.

The query type is **deliberately restricted** to a Horn-clause-safe subset for v0.1 per the architect's G3 critique. Tau Prolog's SLD resolution natively handles atom-or-conjunction goals; richer FOL formulas (with implications, disjunctions, negations, quantifiers) require theorem-proving semantics that v0.1 does not commit to. v0.2 may extend the supported subset based on implementation experience and consumer demand.

```typescript
interface EvaluationResult {
  result: 'true' | 'false' | 'undetermined';
  reason: ReasonCode;                  // see §11
  steps: number;                       // Prolog steps consumed
  bindings?: Binding[];                // present if extractBindings was set
}

interface Binding {
  [variableName: string]: FOLTerm;
}
```

### 7.2 The three states

- **`'true'`**: the query is provable from the session's FOL state plus ARC axioms. Reason is one of the success codes (`consistent` typically, or specific success codes for specific queries).
- **`'false'`**: the query is refutable. In OWA mode, this requires the *negation* of the query to be provable; mere absence of evidence is `'undetermined'`. In per-predicate CWA mode (Axis B), `'false'` may also arise from NAF on closed predicates.
- **`'undetermined'`**: the query is neither provable nor refutable. This is **not** a degraded `'false'` — it is the load-bearing third state per Fandaws Consumer Requirement §2.5. Reason codes distinguish the cause: step cap exceeded, cycle detected, unbound predicate, model not found, OWA undetermined.

**Step cap scoping.** The `stepCap` parameter on `evaluate` is **per-query**, not per-session. Default value: 10,000. Each `evaluate` call gets a fresh budget of 10,000 steps unless the caller overrides via `params.stepCap`. Sessions do *not* accumulate query-cap budgets; a session that runs 100 queries with the default cap permits up to 1,000,000 total steps unless the optional session-aggregate budget is set.

The session-aggregate budget is configured separately via `SessionConfiguration.maxAggregateSteps` (§2.1) and applies *across* queries in the session. Default: unbounded. When set, exceeding the aggregate causes `SessionStepCapExceededError` to be thrown (always; not configurable). This is the runaway-protection mechanism for long-running sessions.

### 7.3 Worked examples

**OWA query, no closure:**

```javascript
const q = makeAtom('http://example.org/Person', [makeConstant('alice')]);
const result = await evaluate(session, q);
// If alice is asserted to be a Person:
//   { result: 'true', reason: 'consistent', steps: 12 }
// If alice is asserted to NOT be a Person:
//   { result: 'false', reason: 'inconsistent', steps: 14 }
// If alice's Person status is not entailed either way:
//   { result: 'undetermined', reason: 'open_world_undetermined', steps: 8 }
```

**Per-predicate CWA query:**

```javascript
const result = await evaluate(session, q, {
  closedPredicates: new Set(['http://example.org/Person'])
});
// If alice is not asserted as Person and Person is closed:
//   { result: 'false', reason: 'inconsistent', steps: 6 }
// (Closure converts "no evidence" to "evidence of negation" for closed predicates only)
```

**Step cap exceeded:**

```javascript
const result = await evaluate(session, deepQuery, { stepCap: 100 });
//   { result: 'undetermined', reason: 'step_cap_exceeded', steps: 100 }
```

### 7.4 Throws

- `SessionRequiredError` — called without a session
- `SessionDisposedError` — session was disposed
- `StepCapExceededError` — only when `stepCap` is breached *and* the consumer set `throwOnStepCap: true` (default: false; default behavior is to return `'undetermined'` with `step_cap_exceeded` reason)
- `SessionStepCapExceededError` — aggregate session step cap breached (always throws; configurable via `maxAggregateSteps` on session)
- `CycleDetectedError` — only when consumer requests strict cycle detection; default behavior returns `'undetermined'` with `cycle_detected` reason
- `IRIFormatError` — query contains an unparseable IRI
- `UnsupportedConstructError` — query contains a FOLAxiom variant outside the v0.1 `EvaluableQuery` subset (see §7.5)

### 7.5 Per-FOLAxiom-variant disposition

The `EvaluableQuery` subset for v0.1 is `FOLAtom | FOLConjunction` (§7.1). The remaining FOLAxiom variants from §4.1 are *not* supported in v0.1, but the table below documents the intended semantics for each so consumers know what is coming and what to expect when v0.2 extends the subset.

Per the architect's G3 critique: under-specifying these would let early implementations diverge on what each variant means. The per-variant table pins the contract even before implementation.

| FOLAxiom variant | v0.1 disposition | Intended semantics (when supported) |
|---|---|---|
| `FOLAtom` | **Supported** | Provable-from-session-state under SLD resolution. The canonical case Tau Prolog handles natively. |
| `FOLConjunction` (over atoms) | **Supported** | Conjunctive goal: all conjuncts must be provable under a consistent variable binding. Maps directly to Tau Prolog's `,` operator. |
| `FOLConjunction` (with non-atoms) | **Throws `UnsupportedConstructError`** | Mixed conjunctions (e.g., atom AND implication) require theorem-proving semantics not in v0.1's scope. |
| `FOLImplication` | **Throws `UnsupportedConstructError`** | "Is this implication entailed?" is theorem-proving over the FOL state. v0.2 candidate via Horn-implication querying (caller-asserted antecedent → check consequent). |
| `FOLDisjunction` | **Throws `UnsupportedConstructError`** | Disjunctive goals require model-finding semantics (find a model satisfying at least one disjunct) that Tau Prolog SLD does not natively support. v0.2 candidate via branching evaluation with explicit `OR` semantics. |
| `FOLNegation` | **Throws `UnsupportedConstructError`** | Wrapping a query in `FOLNegation` is ambiguous in OWA: "is this provably false?" vs "is the negation provable?" Use per-predicate CWA (§6.3.2) plus atom queries to express the closed-world refutation case. The compound-negation form is deferred to v0.2 when its semantics are pinned. |
| `FOLUniversal` | **Throws `UnsupportedConstructError`** | Universal-quantified queries (`∀x. P(x) → Q(x)`) ask "is this universal axiom entailed by the session state?" — a theorem-proving problem. v0.2 candidate via inductive proof tactics over the Horn fragment. |
| `FOLExistential` | **Throws `UnsupportedConstructError`** | Existential queries (`∃x. P(x)`) are expressible as atom queries with extracted bindings (`evaluate(session, P(_x), { extractBindings: ['_x'] })` returns bindings if any witness exists). The compound `FOLExistential` form is unnecessary at the API surface for v0.1; treated as redundant and rejected. |
| `FOLEquality` | **Throws `UnsupportedConstructError`** | Equality queries between named individuals (`a = b`) are expressible via the `same_as` predicate (§5.5 of behavioral spec). The compound `FOLEquality` form requires unification semantics that v0.1 does not surface as a query primitive. |

#### 7.5.1 Why these variants are deferred

The unsupported variants share a common property: they require theorem-proving or model-finding semantics that Tau Prolog's SLD resolution does not natively support. v0.1 commits to the Horn-clause-safe subset because:

- The supported subset covers Fandaws's Bucket C helper signatures (per the legacy-helper inventory inferred from companion §12.2)
- Theorem-proving extensions require careful semantic specification before implementation; rushing them in v0.1 risks committing to a contract that needs to break in v0.2
- ELK integration in v0.2 (per behavioral spec §13) provides a cleaner path for theorem-proving queries: ELK handles them; OFBT delegates

#### 7.5.2 Error contract for unsupported variants

When `evaluate` receives an unsupported variant, it throws `UnsupportedConstructError` with:

- `construct` — the `@type` field of the offending FOLAxiom (e.g., `'fol:Implication'`, `'fol:Universal'`)
- `suggestion` — the v0.2 disposition note from the table above, or a workaround using supported variants (e.g., for `FOLExistential`: "use FOLAtom with extractBindings to find witnesses")
- `code` — `'unsupported_construct'` (matches reason enum §11)

The error is thrown synchronously from `evaluate` before any Tau Prolog work begins, so consumers can detect unsupported queries cheaply.

---

## 8. Consistency-Check Function

### 8.1 checkConsistency

```typescript
async function checkConsistency(
  session: Session,
  axiomSet?: FOLAxiom[],
  params?: QueryParameters
): Promise<ConsistencyResult>;
```

Checks whether the session's FOL state (plus the optional `axiomSet`) is consistent. Implements the No-Collapse Guarantee check from behavioral specification §8.5 as a first-class API.

If `axiomSet` is provided, the check evaluates consistency *with those axioms added*. This is useful for hypothetical reasoning: "is the KB still consistent if we assume X?"

```typescript
interface ConsistencyResult {
  consistent: boolean;
  witnesses?: InconsistencyWitness[];   // present when consistent === false
  reason: ReasonCode;
  steps: number;

  // New in v0.1.6: surfaces the Horn-fragment limit
  // Present when reason === 'coherence_indeterminate'
  unverifiedAxioms?: FOLAxiom[];
}

interface InconsistencyWitness {
  axioms: FOLAxiom[];                  // a minimal inconsistent subset
  proof?: ProofTrace;                  // optional: how inconsistency was derived (§6.4.3)
}
```

#### 8.1.1 The unverifiedAxioms field (honest-admission discipline)

When `result === 'undetermined'` and `reason === 'coherence_indeterminate'`, the `unverifiedAxioms` field MUST be populated with the axioms that fell outside the Horn-checkable fragment of OWL 2 DL (per behavioral spec §8.5.5).

This field is the API surface for the Horn-fragment limitation. Per Fandaws Consumer Requirement §7.1 (honest-admission discipline), consumers must not silently treat `'undetermined'` consistency results as "probably consistent." Surfacing the unverified set lets consumers:

- **Surface the unverified count** in their own diagnostics. Fandaws Phase 3 sandbox can emit a Phase 3 warning saying "consistency not fully verified for N axioms" rather than silently passing.
- **Skip silent-pass treatment.** A `'undetermined'` with empty `unverifiedAxioms` is qualitatively different from one with non-empty `unverifiedAxioms` — the former hit a step cap or other resource limit; the latter hit a fragment limit, and may harbor undetected contradictions.
- **Optionally pass to external reasoner.** When ELK integration lands in v0.2, consumers can pass the unverified axioms to ELK for deeper checking. The `unverifiedAxioms` field is the handoff point.

**When unverifiedAxioms is empty.** When `reason !== 'coherence_indeterminate'`, the field is undefined or empty. This is the case for:

- `consistent` / `inconsistent` — Horn check produced a definite verdict
- `step_cap_exceeded` — Horn check ran but did not finish; the unverified set is not the issue
- Other failure modes — the issue is not fragment limit

The presence of `unverifiedAxioms` thus carries information: a populated array means the Horn-fragment limit was hit; an empty or undefined array means it was not.

**Why this matters at the API surface.** The behavioral specification's §8.5 already states the Horn-fragment limit. v0.1.5 did not surface it through the API, leaving consumers without a way to honor the honest-admission discipline. The Fandaws Dev critique of v0.1.5 (gap G3) identified this as a required revision; v0.1.6 closes it.

#### 8.1.2 The axiomSet parameter and hypothetical reasoning (G4)

Per the architect's G4 critique, v0.1.6 was silent on how the optional `axiomSet` parameter interacts with the coherence check, the Horn-fragment classification, and the `unverifiedAxioms` accounting. v0.1.7 specifies:

**Hypothetical axioms participate in the coherence check.** When `axiomSet` is provided, the check evaluates consistency of the union `(session FOL state) ∪ axiomSet`. The hypothetical axioms are temporarily added to the working set for the duration of the check; the contradiction-search runs over the union, not over the session state alone. This is what makes hypothetical reasoning meaningful: "is the KB still consistent if we assume X?" requires checking against the assumption.

**Hypothetical axioms participate in Horn-fragment classification.** Each hypothetical axiom is classified as Horn-checkable or not, by the same rules used for session axioms. A hypothetical axiom outside the Horn fragment contributes to `unverifiedAxioms` exactly as a session axiom would.

**Hypothetical axioms appear in `unverifiedAxioms` when applicable.** When `reason === 'coherence_indeterminate'`, the `unverifiedAxioms` field includes any hypothetical axioms that fell outside the Horn fragment, alongside session axioms that did. The field does not distinguish session-source from hypothetical-source axioms — consumers needing that distinction track it externally by comparing against their own `axiomSet`.

**Hypothetical axioms appear in `witnesses[].axioms` when contradictions are found.** When `consistent === false`, the witness's minimal inconsistent subset may include hypothetical axioms. This lets consumers see which assumption combined with which session axioms produced the contradiction.

**Hypothetical axioms do NOT persist in the session.** This is the load-bearing semantic: `axiomSet` is *hypothetical*. Whether the check returns `consistent: true` or `consistent: false`, the session's persistent FOL state is unchanged after the call returns. Subsequent queries against the session see only the original state. This makes `checkConsistency(session, axiomSet)` safe to call repeatedly with different `axiomSet` values without accumulating state — the canonical pattern for "what-if" exploration.

**Edge case: hypothetical axiom outside the Horn fragment that would collapse a class.** If a hypothetical axiom is structurally outside the Horn-checkable fragment AND would (under full SROIQ semantics) collapse a class to ⊥, the v0.1.7 check returns `'undetermined'` with reason `'coherence_indeterminate'`, listing the offending hypothetical axiom in `unverifiedAxioms`. The check does NOT return `'inconsistent'` in this case — that would require the full SROIQ reasoning that v0.1.x explicitly defers to ELK in v0.2. Honest-admission applies: the check tells the consumer it could not decide.

**Why hypothetical axioms must participate.** Excluding hypothetical axioms from the coherence check would defeat the parameter's purpose: hypothetical reasoning that doesn't actually reason against the hypothesis returns information about the session state alone, which the consumer already has access to via `checkConsistency(session)` without `axiomSet`. The participation semantic is what makes the parameter useful.

### 8.2 What "consistent" means

Per behavioral specification §8.5.1, consistent means: no provable contradiction in the Horn-checkable fragment of the FOL state. This is sound for Horn-expressible contradictions (if reported inconsistent, genuinely is) but incomplete for full SROIQ.

The reason code distinguishes:

- **`'consistent'`**: no contradiction proved; checked under Horn-checkable fragment within step cap
- **`'inconsistent'`**: contradiction proved; witnesses list the minimal inconsistent subset
- **`'undetermined'`** with reason `step_cap_exceeded`: contradiction may exist but proof was truncated
- **`'undetermined'`** with reason `coherence_indeterminate`: axioms outside the Horn-checkable fragment prevented decisive answer

### 8.3 Worked example

```javascript
// Direct consistency check on session state
const result = await checkConsistency(session);
//   { consistent: true, reason: 'consistent', steps: 47 }

// Hypothetical: would adding "Bird is a SubClassOf Mammal" cause inconsistency?
const hypothetical = [makeImplication(
  makeAtom('Bird', [makeVar('x')]),
  makeAtom('Mammal', [makeVar('x')])
)];
const result2 = await checkConsistency(session, hypothetical);
// If Bird is already DisjointWith Mammal in the KB:
//   {
//     consistent: false,
//     witnesses: [...],
//     reason: 'inconsistent',
//     steps: 31
//   }
```

---

## 9. Version Surfacing

### 9.1 getVersionInfo

```typescript
function getVersionInfo(): VersionInfo;
```

Returns the three-version surface specified in behavioral specification §11.1. Synchronous; does not require a session.

```typescript
interface VersionInfo {
  libraryVersion: string;              // semver, e.g., "0.1.7"
  conversionRulesVersion: string;      // semver, separately versioned
  tauPrologVersion: string;            // pinned: "0.3.4"
  arcManifestVersion: string;          // current ARC manifest version
  buildTimestamp?: string;             // ISO 8601, optional (see §9.1.1)
  apiSpecVersion: string;              // this document's version: "0.1.7"
}
```

The `apiSpecVersion` is new in v0.1.5 and tracks the API specification document version specifically. It allows consumers to detect API spec drift independent of library version drift.

#### 9.1.1 The buildTimestamp field

`buildTimestamp` is **build-time-stripped** for production builds, not runtime-toggleable. Specifically:

- **Development/CI builds** include `buildTimestamp` for diagnostic purposes
- **Production library builds** (the published npm package) omit `buildTimestamp` entirely; the field is `undefined`

This avoids non-reproducibility in DP-2 records that embed `getVersionInfo()` output. A DP-2 record built against the published library is reproducible byte-for-byte across machines and times because no timestamp is present in the embedded version info. A DP-2 record built against a development build of the library is *not* reproducible — but this is an acceptable trade for development diagnostics.

The library's release process strips the timestamp at build time. Consumers receiving a published package should never see a populated `buildTimestamp`. If they do, that is a packaging bug.

### 9.2 verifyTauPrologVersion (sync)

```typescript
function verifyTauPrologVersion(): {
  match: boolean;
  expected: string;
  found: string | null;
};
```

Synchronous fail-fast check that the Tau Prolog peer dependency satisfies the pinned version (§13.7). Returns a discriminating result rather than throwing on mismatch — consumers explicitly opt into the failure mode they want.

Per the architect's G5 critique: v0.1.6 placed Tau Prolog version detection inside `createSession`, which forced consumers wanting to verify the peer dependency to create a side-effect-bearing session and catch the resulting error. v0.1.7 exposes the check as a sync function so consumers can fail-fast pre-session without that ceremony.

**Return shape:**

- `match: boolean` — true if the loaded Tau Prolog version exactly matches the pinned version
- `expected: string` — the pinned version string (currently `"0.3.4"`)
- `found: string | null` — the version string read from the loaded Tau Prolog module, or `null` if the module is not loadable at all

**Use cases:**

```javascript
import { verifyTauPrologVersion } from '@ontology-of-freedom/ofbt';

// Fail-fast check at consumer's app startup
const tpv = verifyTauPrologVersion();
if (!tpv.match) {
  console.error(`Tau Prolog version mismatch: expected ${tpv.expected}, found ${tpv.found}`);
  process.exit(1);  // or whatever the consumer's error path is
}

// Diagnostic display
console.log(`OFBT requires Tau Prolog ${tpv.expected}; loaded version is ${tpv.found || 'NOT FOUND'}`);
```

**Internal use.** `createSession()` calls `verifyTauPrologVersion()` internally and throws `TauPrologVersionMismatchError` (§10.7) when `match === false`. Consumers calling `createSession()` directly do not need to call `verifyTauPrologVersion()` first — the check happens regardless. The exposed sync function exists for the pre-session fail-fast pattern, not as a precondition for `createSession()`.

**Why sync.** The check reads a version string from an already-loaded JS module. No async work is required. Making it sync keeps it cheap and composable in synchronous startup paths.

### 9.3 Stability commitments

Per behavioral specification §6.4 (semver) and §11.1 (three-version surface):

- **`libraryVersion`** bumps per standard semver: major for breaking changes, minor for additive, patch for bugfix.
- **`conversionRulesVersion`** bumps separately. Any behavioral change to the lifter or projector requires minor bump minimum, even when the API signature is unchanged. Ensures DP-2 records can detect conversion-semantics drift.
- **`tauPrologVersion`** is pinned. Tau Prolog upgrade requires a major library version bump.
- **`apiSpecVersion`** bumps when this document changes meaningfully. Editorial-only revisions (fixing typos) do not bump.

---

## 10. Error Class Hierarchy

All errors thrown by OFBT are typed and exported as named classes. Per Fandaws Consumer Requirement §2.9, callers catch by class, not by message.

### 10.1 Base class

```typescript
class OFBTError extends Error {
  readonly code: string;               // machine-readable code
  readonly libraryVersion: string;     // version that threw
  constructor(message: string, code: string);
}
```

All OFBT errors extend `OFBTError`. Consumers can catch the base class to handle any OFBT failure generically:

```javascript
try {
  await evaluate(session, query);
} catch (err) {
  if (err instanceof OFBTError) {
    // OFBT-specific handling
  } else {
    throw err;  // re-throw unrelated errors
  }
}
```

### 10.2 Conversion errors

```typescript
class ParseError extends OFBTError {
  readonly construct?: string;         // which input construct failed
  readonly position?: ParsePosition;
}

class UnsupportedConstructError extends OFBTError {
  readonly construct: string;          // e.g., "owl:hasKey"
  readonly suggestion?: string;        // e.g., "deferred to v0.2"
}

class IRIFormatError extends OFBTError {
  readonly iri: string;                // the offending IRI
  readonly form: 'full-uri' | 'curie' | 'bare-uri' | 'unrecognized';
}

class RoundTripError extends OFBTError {
  readonly diff: RoundTripDiff;
}
```

### 10.3 Session errors

```typescript
class SessionRequiredError extends OFBTError {
  readonly functionName: string;       // which function was called
}

class SessionDisposedError extends OFBTError {
  readonly disposalTimestamp?: string;
}
```

### 10.4 Evaluation errors

```typescript
class StepCapExceededError extends OFBTError {
  readonly query: FOLAxiom;
  readonly steps: number;
  readonly stepCap: number;
}

class SessionStepCapExceededError extends OFBTError {
  readonly aggregateSteps: number;
  readonly maxAggregateSteps: number;
}

class CycleDetectedError extends OFBTError {
  readonly cycle: string[];            // sequence of predicates/individuals
  readonly inSubsystem: 'sld-resolution' | 'class-hierarchy';
}
```

### 10.5 Manifest and configuration errors

```typescript
class ARCManifestError extends OFBTError {
  readonly missingProperties?: string[];
  readonly malformedEntries?: string[];
}
```

### 10.6 IRI errors

(See §10.2 for `IRIFormatError` covering input-side IRI normalization failures.)

### 10.7 Tau Prolog peer-dependency error

```typescript
class TauPrologVersionMismatchError extends OFBTError {
  readonly expected: string;            // pinned version, e.g., "0.3.4"
  readonly found: string | null;        // detected version, or null if not found
  readonly resolution: string;          // hint for fixing
}
```

Thrown at `createSession()` when the consumer's environment does not provide the pinned Tau Prolog version (per §13.7's peer-dependency contract). Carries the expected and detected versions plus a resolution hint.

The class corresponds to reason code `tau_prolog_version_mismatch` (§11). Catching either the typed class or the reason code identifies the same failure.

### 10.8 Hierarchy diagram

```
Error (built-in)
└── OFBTError
    ├── ParseError
    ├── UnsupportedConstructError
    ├── IRIFormatError
    ├── RoundTripError
    ├── SessionRequiredError
    ├── SessionDisposedError
    ├── StepCapExceededError
    ├── SessionStepCapExceededError
    ├── CycleDetectedError
    ├── ARCManifestError
    └── TauPrologVersionMismatchError
```

**Twelve typed classes total** (eleven in v0.1.5 plus `TauPrologVersionMismatchError` added in v0.1.6 for the peer-dependency contract).

---

## 11. The Reason Enum

The `reason` field in `EvaluationResult` and `ConsistencyResult` is a string drawn from a published, stable, additive-only enum. Per Fandaws DP-2 invariant I4 (Dictionary Discipline) and Fandaws Consumer Requirement §2.5.1, this enum is contractual: members may be added in minor versions but never removed or renamed without a major version bump.

### 11.1 The canonical enum (v0.1.7)

```typescript
type ReasonCode =
  // Success outcomes
  | 'consistent'                       // query proved true / consistency check passed
  | 'inconsistent'                     // query proved false / inconsistency demonstrated
  | 'satisfiable'                      // class satisfiability check succeeded
  | 'unsatisfiable'                    // class satisfiability check failed

  // Indeterminate outcomes (load-bearing third state)
  | 'open_world_undetermined'          // OWA: neither query nor its negation provable
  | 'model_not_found'                  // no satisfying assignment under closure
  | 'coherence_indeterminate'          // outside Horn-checkable fragment

  // Failure outcomes
  | 'step_cap_exceeded'                // per-query step cap hit
  | 'aggregate_step_cap_exceeded'      // session aggregate cap hit
  | 'cycle_detected'                   // cycle in resolution
  | 'unbound_predicate'                // predicate has no facts/rules
  | 'unsupported_construct'            // query uses unsupported construct
  | 'iri_format_error'                 // IRI in query unparseable
  | 'parse_error'                      // query itself malformed

  // Environment failures (added in v0.1.6, additive per §11.2)
  | 'tau_prolog_version_mismatch'      // peer-dependency version mismatch

  // Configuration mismatch failures (added in v0.1.7, additive per §11.2)
  | 'arc_manifest_version_mismatch';   // session/conversion ARC version drift (§2.1.2)
```

**Sixteen members in v0.1.7** (fifteen in v0.1.6 plus `arc_manifest_version_mismatch` added for the session/conversion mismatch detection per §2.1.2).

### 11.2 Stability commitment

The enum is **published as part of the library API** and bound to its `apiSpecVersion`. Changes:

- **Adding a member** is a minor version bump on `apiSpecVersion` and `libraryVersion`. Existing consumers unaffected.
- **Removing or renaming a member** is a **major** version bump, both on `apiSpecVersion` and `libraryVersion`. This is intentionally expensive; per DP-2 invariant I4, dictionary churn is a load-bearing event for downstream consumers.
- **Changing the meaning of a member** is also a major version bump. Even keeping the spelling but shifting what it means is a contract break.

This stability commitment means the enum should be **complete** at publication. Adding members is cheap; renaming or removing is expensive. v0.1.5 ships fourteen members covering every outcome OFBT can produce against the v0.1 behavioral surface.

### 11.3 Mapping reason codes to result fields

| Reason | Typical `result` value | Typical context |
|---|---|---|
| `consistent` | `'true'` | query provable, OR consistency check positive |
| `inconsistent` | `'false'` | query refutable, OR consistency check negative |
| `satisfiable` | `'true'` | class satisfiability check (checkConsistency on class) |
| `unsatisfiable` | `'false'` | class satisfiability check |
| `open_world_undetermined` | `'undetermined'` | OWA gap, no closure on relevant predicates |
| `model_not_found` | `'undetermined'` | per-predicate CWA, no satisfying assignment |
| `coherence_indeterminate` | `'undetermined'` | coherence check beyond Horn fragment |
| `step_cap_exceeded` | `'undetermined'` | per-query budget exhausted |
| `aggregate_step_cap_exceeded` | (always throws) | session-level budget |
| `cycle_detected` | `'undetermined'` | resolution detected cycle, query halted |
| `unbound_predicate` | `'undetermined'` | predicate has no source facts |
| `unsupported_construct` | (always throws) | input contained punted construct |
| `iri_format_error` | (always throws) | IRI normalization failed |
| `parse_error` | (always throws) | input malformed |
| `tau_prolog_version_mismatch` | (always throws at createSession) | peer-dependency mismatch (§13.7) |
| `arc_manifest_version_mismatch` | (always throws at evaluation) | session/conversion ARC version drift (§2.1.2) |

The "always throws" rows correspond to error classes per §10. The reason code on the error matches the code on what would have been the result.

---

## 12. Compatibility Shim Package

The compatibility shim is a separate package: `@ontology-of-freedom/ofbt-compat-fandaws`. It depends on the core package and exposes Fandaws's legacy Bucket C helper signatures, backed by OFBT calls.

### 12.1 Why a separate package

Per Fandaws Consumer Requirement §6.3.1-6.3.2, the shim must support a parallel-run mode where both shim and current Fandaws implementation evaluate every call and assert equality. This is a specifically Fandaws-side concern; other consumers don't need it. Separating it into its own package:

- Keeps the core package consumer-agnostic
- Allows the shim to evolve on Fandaws's schedule, not OFBT's
- Lets other consumers write their own compat packages following the same pattern

### 12.2 Shim surface (illustrative)

The exact Fandaws Bucket C helper signatures are an input to this work — they come from Fandaws-side inventory (per §17.7 in the behavioral specification). The shim exposes them with their original names backed by OFBT calls:

```javascript
// (illustrative — actual signatures depend on Fandaws inventory)
import { isClassDescendantOf } from '@ontology-of-freedom/ofbt-compat-fandaws';

// Internally calls OFBT evaluate() with a SubClassOf query
const result = await isClassDescendantOf(session, classIri, ancestorIri);
```

Each shimmed function:

1. Translates its arguments to OFBT calls
2. Calls the appropriate OFBT API (`evaluate`, `checkConsistency`, etc.)
3. Translates the OFBT result back to the legacy return shape

### 12.3 Parallel-run mode

```typescript
import { enableParallelRun } from '@ontology-of-freedom/ofbt-compat-fandaws';

enableParallelRun({
  legacyImplementation: legacyBucketCHelpers,  // Fandaws's current code
  comparator: deepEqual,                       // how to compare results
  onMismatch: (call, legacyResult, ofbtResult) => {
    // Fandaws's chosen mismatch handler:
    //   - log to telemetry
    //   - throw to fail loudly
    //   - record to baseline file
  },
  expectedDivergences: [...]                   // new in v0.1.6, see §12.3.1
});
```

When enabled, every shim call invokes both the legacy implementation and the OFBT-backed implementation, compares results, and invokes `onMismatch` if they differ — *unless* the divergence matches an entry in `expectedDivergences`.

Parallel-run is a runtime-toggleable mode, not a separate code path; the same shim functions support both modes.

#### 12.3.1 Expected-divergence baselines

A naive parallel-run gate has a subtle problem: if the legacy implementation contains known correctness bugs, a strict match would force OFBT to *replicate those bugs*. That defeats the migration's purpose — OFBT is supposed to be the *correct* implementation.

The Fandaws Dev critique of v0.1.5 (gap I2) identified two specific Fandaws-side legacy bugs:

- **Step 7.19**: false universal axioms from existentialized domain/range (the bug §3.7.1 forbids OFBT from making)
- **Step 7.20**: missing disjointness export

A strict parallel-run match would require OFBT to reproduce both bugs. v0.1.6 introduces **expected-divergence baselines** to accommodate known legacy bugs:

```typescript
interface ExpectedDivergence {
  callPattern: string;                         // matcher for the call shape
  fandawsIssueRef: string;                     // e.g., "Step 7.19"
  legacyBehavior: string;                      // human-readable description
  ofbtBehavior: string;                        // human-readable description
  expectedSince: string;                       // OFBT version that introduced fix
}
```

When parallel-run encounters a divergence whose `callPattern` matches an `ExpectedDivergence` entry, the divergence is:

- **Recorded to telemetry** with the `fandawsIssueRef` for audit
- **Counted against the baseline** rather than against unexpected mismatches
- **Not invoking onMismatch** — the handler is reserved for unexpected divergences

Unexpected divergences (no matching baseline entry) invoke `onMismatch` per the standard contract. They represent either:

- Real OFBT bugs (OFBT got something wrong)
- Undocumented legacy bugs (the consumer-side bug inventory is incomplete)

Either case requires investigation before passing the verification gate.

#### 12.3.2 Baseline file format

Consumers maintain `expectedDivergences` as a versioned file (typically YAML or JSON5 for human readability):

```yaml
# fandaws-divergence-baseline.yaml
- callPattern: "isClassAncestorOf(*)"
  fandawsIssueRef: "Step 7.19"
  legacyBehavior: "Synthesizes false universal axiom on domain class"
  ofbtBehavior: "Conditional implication, no synthesized axiom"
  expectedSince: "0.1.4"

- callPattern: "checkDisjointness(*)"
  fandawsIssueRef: "Step 7.20"
  legacyBehavior: "Missing disjointness export from BFO Disjointness Map"
  ofbtBehavior: "Full disjointness export per ARC manifest"
  expectedSince: "0.1.4"
```

The file is consumer-side; OFBT does not ship a baseline. The shim package consumes the file at parallel-run setup.

#### 12.3.3 Why this is a load-bearing addition

Without expected-divergence baselines, Fandaws faces an impossible choice:

- **Replicate legacy bugs in OFBT** to pass the gate (defeating the migration's purpose)
- **Fix legacy bugs first** before parallel-run starts (delaying migration indefinitely; some bugs may require schema migrations)

The accommodation lets correctness improve **monotonically** through the migration. Each known bug is documented in the baseline, parallel-run records its presence, and the migration proceeds with OFBT being more-correct than legacy in documented ways.

This commitment is also recorded in the behavioral specification §17.7.1.

### 12.4 Cutover sequence

The standard migration:

1. **Parallel-run with mismatch logging.** Both implementations run; mismatches logged but legacy result is returned. Used for baseline collection.
2. **Parallel-run with mismatch baseline.** Mismatches compared against expected-mismatch baseline; new mismatches logged or thrown.
3. **Soak window.** Parallel-run continues for N days/weeks with mismatches at zero (or only expected baseline mismatches).
4. **Cutover.** OFBT-backed result is returned; legacy implementation called only for sanity.
5. **Shim retirement.** Legacy implementation removed; shim becomes a thin wrapper around OFBT calls; eventually consumers migrate to direct OFBT API and the shim is deleted.

This is a Fandaws-side process; OFBT's role is providing the shim package and the parallel-run infrastructure.

### 12.5 Versioning relationship

The shim package versions independently from the core. A shim version is compatible with a core version range; the shim's `package.json` records the compatible range. Major shim version bumps may be required when Fandaws changes its legacy helper signatures (Fandaws-side breaking change), even if the core OFBT API is stable.

---

## 13. Packaging Requirements

### 13.1 ES Module distribution

The package is distributed as ES Modules only:

- `package.json` has `"type": "module"`
- The main entry exports named exports per §1
- No CommonJS distribution (consumers using CJS must use dynamic `import()`)
- `.mjs` extensions explicit where needed for older bundlers

### 13.2 Tree-shakeable

All exports are named (no default exports). Bundlers like esbuild and Rollup can drop unused exports. Specifically:

- Each error class is a named export
- Each function is a named export
- The reason enum is a named export (`REASON_CODES` as a frozen object)
- Type definitions are in a separate `index.d.ts` and tree-shaken automatically

### 13.3 esbuild compatibility

Per Fandaws Consumer Requirement §1.8:

- No dynamic `require()` calls
- No conditional `import()` calls (except in the optional text-format parser at §3.9, which is a separate sub-export)
- No Node built-ins that require polyfills at bundle time
- Browser-compatible default; Node-only paths are explicit sub-exports

The package's `package.json` `exports` field declares the entry points:

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./parser": "./dist/parser.js",
    "./compat-fandaws": "./dist/compat-fandaws/index.js"
  }
}
```

Consumers importing only the core (`import { evaluate } from '@ontology-of-freedom/ofbt'`) do not pull in the parser or shim code.

### 13.4 Bundle size budget

Per Fandaws Consumer Requirement §1.6.1: **the OFBT core, when added to a consumer's bundle, MUST NOT exceed 200 KB minified**, excluding Tau Prolog (already present in consuming environments).

This is a HARD requirement and is CI-gated:

- The library's own CI runs `esbuild --minify --bundle` on the public entry points and asserts the output is ≤ 200 KB
- The library's own CI tracks size over time; regressions block PRs
- Consumer-side CI (Fandaws) runs an equivalent check on dependency update

#### 13.4.1 Per-component caps (G1)

Per the architect's G1 critique: v0.1.6 said "ARC manifest is in budget" without bounding it, creating a real risk that OFBT lands at v0.1, ARC manifest is 80 KB, OFBT code is 140 KB, rdf-canonize is 40 KB → 260 KB and bundle gate fails. v0.1.7 commits to an explicit split with per-component caps:

| Component | Cap (minified) | Notes |
|---|---|---|
| OFBT core code | ≤ 100 KB | Lifter, projector, validator, audit emitters, error classes, configuration handling |
| `rdf-canonize` | ≤ 50 KB | The only external runtime dependency outside Tau Prolog (peer-dep, not bundled). Cap reflects current measured size with tree-shaking. |
| ARC core (BFO 2020 + IAO essentials) | ≤ 50 KB | The mandatory ARC modules (`core/bfo-2020.json` + `core/iao-information.json` per behavioral spec §3.6.1). All consumers pay this cost. |
| **Total mandatory budget** | **≤ 200 KB** | Matches Fandaws's HARD requirement |
| Optional ARC modules | (loaded separately) | `cco/realizable-holding`, `cco/mereotopology`, `ofi/deontic` per behavioral spec §3.6.1. Tree-shaken when not declared in `arcModules` (§2.0). Each module ≤ 15-20 KB. |

The mandatory budget is conservative: it leaves headroom against measured implementation reality. If `rdf-canonize` measures at 40 KB, OFBT core has 110 KB to work with; if ARC core measures at 45 KB, OFBT has 105 KB. The caps are *upper bounds* per component, not target sizes.

#### 13.4.2 Why the split

Three reasons:

1. **Bundle accountability.** A single 200 KB cap with no internal structure makes regression diagnosis difficult: when CI fires, the team must measure each component to find the culprit. Per-component caps make regressions immediately attributable.

2. **Tree-shaking enforcement.** The optional ARC modules (CCO, deontic) are explicitly out of the mandatory budget. Consumers using only BFO core (`arcModules: ['core/bfo-2020']`) pay only the mandatory budget; consumers loading all modules pay extra. The split makes that pricing visible.

3. **v0.2 expansion budget.** When v0.2 adds CCO Modal Relations, expanded deontic chains, or other ARC content, the mandatory budget should not grow. New content goes into optional modules. The per-component caps establish that discipline now, before v0.2 is implemented.

#### 13.4.3 CI-gating mechanism

Library CI runs three measurements per build:

```bash
# OFBT core only (no ARC modules loaded)
esbuild --minify --bundle src/index.js --external:tau-prolog | wc -c
# Asserts ≤ 100 KB

# Mandatory bundle (OFBT core + rdf-canonize + ARC core)
esbuild --minify --bundle src/index.js --external:tau-prolog | wc -c
# Asserts ≤ 200 KB

# Per ARC module
for mod in arc/*.json; do
  cat "$mod" | esbuild --minify --loader=json | wc -c
done
# Asserts each ≤ documented cap
```

Regressions in any measurement block PRs. The CI script is part of the library's repo and is consumer-replicable: Fandaws CI runs the same measurement against its OFBT pin to verify no bundle creep.

#### 13.4.4 Tau Prolog explicitly excluded

Tau Prolog is a peer dependency (§13.7), not bundled. It contributes zero bytes to OFBT's bundle measurement. Consumers loading Tau Prolog separately (as Fandaws does) see Tau Prolog's bundle cost in their own measurement, not in OFBT's. This is consistent with Fandaws Consumer Requirement §1.6.1 ("excluding Tau Prolog").

### 13.5 Async contract

Per Fandaws Consumer Requirement §2.3 and ADR-019:

- Every conversion function (`owlToFol`, `folToOwl`, `roundTripCheck`) returns a `Promise`
- Every evaluation function (`evaluate`, `checkConsistency`) returns a `Promise`
- Session lifecycle functions (`createSession`, `disposeSession`) and version surfacing (`getVersionInfo`) are synchronous
- Tau Prolog's callback-based evaluation is wrapped as Promises at the API boundary; no naked callbacks leak out of OFBT

Promise rejections deliver typed errors per §10. Unhandled rejections are not silently swallowed; consumers using top-level `await` or `.then().catch()` patterns receive errors normally.

### 13.6 No probabilistic core

Per Fandaws Consumer Requirement §1.4: no LLMs, neural networks, statistical inference, or non-deterministic heuristics anywhere in OFBT. The README states this explicitly. CI does not need to enforce — there are no candidate libraries that would be added accidentally — but the commitment is documented.

### 13.7 Tau Prolog peer-dependency contract

OFBT declares Tau Prolog as a **peer dependency**, not a bundled dependency. The reasoning: Fandaws ships Tau Prolog v0.3.4 already; bundling it into OFBT would cause dual-load issues. Other consumers similarly may have Tau Prolog as part of their existing stack.

#### 13.7.1 Package.json declaration

```json
{
  "name": "@ontology-of-freedom/ofbt",
  "version": "0.1.6",
  "type": "module",
  "peerDependencies": {
    "tau-prolog": "0.3.4"
  },
  "peerDependenciesMeta": {
    "tau-prolog": {
      "optional": false
    }
  }
}
```

The version is **pinned exactly** to 0.3.4. Tau Prolog upgrade is a major library version event per behavioral specification §11.

#### 13.7.2 Detection at session creation

`createSession()` MUST verify that the available Tau Prolog version matches the pinned version. The verification:

1. Imports the Tau Prolog module
2. Reads its version metadata
3. Compares against the pinned version string

If the versions do not match, `createSession` throws `TauPrologVersionMismatchError` (§10.7) with:

```typescript
new TauPrologVersionMismatchError(
  "Tau Prolog version mismatch: OFBT requires 0.3.4, found 0.3.5",
  {
    expected: "0.3.4",
    found: "0.3.5",
    resolution: "Pin tau-prolog to 0.3.4 in your package.json or upgrade OFBT to a version compatible with your Tau Prolog."
  }
);
```

The thrown error's `code` is `tau_prolog_version_mismatch`, the 15th member of the reason enum (§11).

#### 13.7.3 Detection at conversion

`owlToFol` and `folToOwl` (§6.1, §6.2) MUST also perform the version check before calling Tau Prolog (the lifter and projector both use Tau Prolog internally for normalization steps even though they don't take a session). The same `TauPrologVersionMismatchError` is thrown.

`getVersionInfo()` (§9.1) reports the *expected* Tau Prolog version (the pinned one), not the *detected* one. Consumers wanting to verify the actual loaded version can call `createSession()` and catch the error, or read the peer-dependency declaration directly from the consumer's `package-lock.json`.

#### 13.7.4 Why peer-dependency, not bundled

Bundling Tau Prolog inside OFBT would:

- **Inflate bundle size.** Tau Prolog is ~400 KB; bundling it would blow the 200 KB budget §13.4.
- **Cause dual-load.** Fandaws and other consumers already ship Tau Prolog; OFBT would load a second copy.
- **Hide version conflicts.** A bundled dependency masks version mismatches that the peer-dependency declaration surfaces explicitly.

Peer-dependency declaration is the standard JS practice for this case. The version-mismatch detection at runtime is a hardening measure: even if the consumer's `package.json` declares a compatible peer version, the actually-loaded module might differ (especially in browser environments without npm's resolution guarantees).

---

## 14. API-Level Acceptance Criteria

Supplementing the behavioral acceptance criteria in OFBT_spec_v0.1.5.md §12, the API specification adds eight criteria:

### 14.1 (API-1) ES Module compatibility

The package imports successfully in:
- Node.js v18+ via `import { ... } from '@ontology-of-freedom/ofbt'`
- Modern browsers via `<script type="module">`
- esbuild bundle of a consumer app
- Vite bundle of a consumer app

### 14.2 (API-2) Bundle size budget

Library's own CI demonstrates the public entry points minify to ≤ 200 KB. Consumer-side regression tracking shows no growth above budget on dependency updates.

### 14.3 (API-3) Function signature stability

The eight public function signatures match this specification exactly. Type signatures verified against `.d.ts` declarations. Argument orders and optional parameters as specified.

### 14.4 (API-4) Error class hierarchy

All eleven error classes are exported, all extend `OFBTError`, all carry the documented fields. Catching `OFBTError` catches all of them; catching specific classes catches only those.

### 14.5 (API-5) Reason enum stability

All fourteen reason codes are exported as frozen string constants. The exported object is read-only. Tests verify that adding a new reason code at runtime fails (frozen).

### 14.6 (API-6) Async contract conformance

All async functions return `Promise` (not thenable, not callback-based). Tests verify Promise behavior with `await`, `.then()`, `.catch()`, and `Promise.all()`.

### 14.7 (API-7) Session disposal correctness

After `disposeSession`, all subsequent calls referencing the session throw `SessionDisposedError`. Memory does not leak: a stress test creating and disposing 10,000 sessions shows no memory growth (verified via heap snapshots).

### 14.8 (API-8) Compatibility shim parallel-run mode

The shim package's parallel-run mode invokes both implementations on every call, compares results, and invokes the configured mismatch handler. Tests verify the mode can be enabled, configured, and disabled at runtime. Tests also verify the `expectedDivergences` mechanism: known-broken legacy behaviors matching baseline entries pass without invoking `onMismatch`, while unmatched divergences invoke the handler.

### 14.9 (API-9) Domain/range correctness (HIGH PRIORITY)

Per §3.7.1 and behavioral specification §5.8, the lifter MUST produce conditional FOL implications for `rdfs:domain` and `rdfs:range` axioms. Three test fixtures are required, each exercising both positive and negative entailment:

1. **Asserted-property fixture.** Domain axiom + property assertion. Positive: subject is entailed to be in domain class. Negative: unrelated individual is *not* entailed to be in domain class.
2. **Range fixture.** Range axiom + property assertion. Positive: object in range class. Negative: unrelated individual not in range class.
3. **No-assertion fixture.** Domain axiom alone, no property assertions. Negative: no individual entailed to be in domain class.

The fixtures must use real-world property/class IRIs from the test corpus (PROV-O `wasInfluencedBy` is the canonical example; behavioral spec §14 Q5 lists corpus members). Fixtures using synthetic predicate names are insufficient — the test must verify the rule holds against the ontologies OFBT will encounter in practice.

Fixtures must verify by querying the lifted FOL state via `evaluate`, not by inspecting the FOL output structurally. Structural inspection misses cases where a wrong translation produces the same shape as a right one but with different semantics.

### 14.10 (API-10) Tau Prolog peer-dependency verification

`createSession()` and the conversion functions verify the Tau Prolog version per §13.7. Tests cover three cases:

1. **Matching version.** Tau Prolog v0.3.4 available; `createSession()` succeeds.
2. **Mismatched version.** Tau Prolog v0.3.5 (or any non-0.3.4) mocked; `createSession()` throws `TauPrologVersionMismatchError` with `expected: '0.3.4'` and `found: '0.3.5'`.
3. **Missing dependency.** Tau Prolog not available; `createSession()` throws `TauPrologVersionMismatchError` with `found: null`.

### 14.11 (API-11) Test corpus coverage matrix (C5)

Per the architect's C5 critique: corpus members are named in behavioral spec §14 Q5 but no matrix shows which OWL constructs each corpus exercises and which acceptance criteria each enables. Without the matrix, "the corpus passes" is ambiguous: it might exercise some criteria and silently skip others.

v0.1.7 commits to the following coverage matrix. The library's CI runs each acceptance criterion against each applicable corpus member; cells marked "exercised" require a passing test, cells marked "n/a" require explicit documentation of why.

| Criterion | BFO 2020 core | PROV-O | CCO Geospatial | CCO Agent | constitution.ttl |
|---|---|---|---|---|---|
| **Behavioral spec §12** | | | | | |
| 1. Round-trip parity | exercised | exercised | exercised | exercised | exercised |
| 2. ARC coverage | exercised | partial | exercised | exercised | exercised |
| 3. Identity rules | exercised | n/a | exercised | exercised | exercised |
| 4. Datatype canonicalization | n/a | partial | exercised | exercised | partial |
| 5. Property chains | exercised | n/a | exercised | exercised | exercised |
| 6. Connected With | exercised | n/a | exercised | partial | n/a |
| 7. Strict mode | exercised | exercised | exercised | exercised | exercised |
| 8. Permissive mode | exercised | exercised | exercised | exercised | exercised |
| 9. Audit artifacts | exercised | exercised | exercised | exercised | exercised |
| 10. RDFC-1.0 b-node canonicalization | exercised | exercised | exercised | exercised | exercised |
| 11. No-Collapse Guarantee | exercised | partial | exercised | exercised | exercised |
| 12. Blank node round-trip | exercised | partial | exercised | exercised | partial |
| 13. **Domain/range correctness** | partial | **exercised (canonical)** | exercised | exercised | partial |
| 14. Structural annotation round-trip | n/a | n/a | n/a | n/a | exercised |
| 15. Per-predicate CWA | partial | partial | exercised | exercised | exercised |
| **API spec §14** | | | | | |
| API-1 ESM compatibility | n/a (test infra) | n/a | n/a | n/a | n/a |
| API-2 Bundle size budget | exercised (corpus loaded for measurement) | exercised | exercised | exercised | exercised |
| API-3 Function signature stability | n/a (signature tests) | n/a | n/a | n/a | n/a |
| API-4 Error class hierarchy | exercised (error-fixture corpus) | exercised | exercised | exercised | exercised |
| API-5 Reason enum stability | n/a (enum tests) | n/a | n/a | n/a | n/a |
| API-6 Async contract conformance | exercised | exercised | exercised | exercised | exercised |
| API-7 Session disposal correctness | n/a (lifecycle tests) | n/a | n/a | n/a | n/a |
| API-8 Compat shim parallel-run | n/a (shim-specific) | n/a | n/a | n/a | n/a |
| API-9 **Domain/range correctness fixtures** | partial | **exercised (canonical)** | exercised | exercised | partial |
| API-10 Tau Prolog peer-dep verification | n/a (env tests) | n/a | n/a | n/a | n/a |

**Reading the matrix:**

- **`exercised`** — the corpus member contains constructs that meaningfully test the criterion. Test failure on this cell blocks release.
- **`partial`** — the corpus member touches the criterion but does not fully exercise it. Test failure is investigated but may not block release if other corpora cover the gap.
- **`exercised (canonical)`** — the corpus is the canonical example for this criterion (e.g., PROV-O for domain/range per §3.7.1.3). Test failure absolutely blocks release.
- **`n/a`** — the criterion is corpus-independent (infrastructure, test-only) and is not measured against this corpus member.

**Coverage gaps and rationale:**

- **PROV-O on identity rules (3): n/a.** PROV-O does not use `owl:sameAs` or `owl:differentFrom` in its core. Identity rule coverage comes from BFO + CCO.
- **BFO on datatype canonicalization (4): n/a.** BFO core is class-and-property heavy; datatype literal coverage comes from CCO and partial from PROV-O timestamps.
- **BFO + CCO Agent on Connected With (6): partial.** BFO defines the relation; CCO Agent does not use it heavily. CCO Geospatial is the canonical exerciser.
- **constitution.ttl on structural annotations (14): exercised.** This corpus is the canonical exerciser for `fandaws:bfoSubcategory`-style annotations because constitution.ttl is the deontic-sublayer test fixture.

The matrix is a contract: each cell's status is part of the v0.1.7 specification. v0.2 may extend coverage (adding corpus members or upgrading "partial" to "exercised") but cannot regress without a major version bump.

---

## 15. Verification Cycle Gate

Per Fandaws Consumer Requirement §7.3, before any Fandaws consumption-side migration begins, a formal verification cycle must run. This is the consumer-side gate that complements the library's own acceptance criteria.

### 15.1 The gate

The library passing its own CI (behavioral spec §12 + this document §14) is **necessary but not sufficient** for Fandaws consumption.

**Required:** Fandaws re-runs its 70/70 D1.6 AVC + bundle v6 SWC + Bucket C helper tests against OFBT's reference implementation (via the compatibility shim's parallel-run mode). Any failure or unexplained mismatch blocks consumption.

This is the cycle-discipline analog of X-arc reception memos: library output is reviewed by the consuming team before integration commits.

### 15.2 OFBT's responsibilities at the gate

OFBT does not gate on its consumers' verification cycles, but it provides the infrastructure to support them:

- The compatibility shim package (§12) with parallel-run mode
- The test corpus (behavioral spec §14 Q5: BFO 2020, PROV-O, CCO Geospatial, CCO Agent, constitution.ttl Article I §2)
- Reproducibility hash capability so consumers can verify byte-stable conversion across CI runs
- Stable API surface (this document) so consumers can write integration tests against published types

### 15.3 What "passing the gate" looks like

For Fandaws specifically, the gate passes when:

1. The compatibility shim is installed in Fandaws
2. Parallel-run mode runs Fandaws's full test suite (70/70 AVC, bundle v6 SWC, Bucket C helpers)
3. All tests pass with both legacy and OFBT-backed implementations producing matching results, **OR** divergences are documented in the expected-divergence baseline (§12.3.1) and reflect known legacy bugs OFBT correctly does not replicate
4. Any expected-baseline divergences are reviewed and approved
5. Soak window (length to be determined Fandaws-side) completes with zero unexpected mismatches

After the gate, Fandaws migrates per §12.4's cutover sequence.

#### 15.3.1 Expected divergences are first-class

The gate explicitly accommodates the case where OFBT is *more correct* than legacy. This is critical: without this accommodation, the gate would force OFBT to replicate legacy bugs in order to "pass," defeating the migration's purpose.

The expected-divergence baseline is consumer-side (Fandaws documents which legacy bugs it has). The mechanism is OFBT-provided (the shim's parallel-run mode supports `expectedDivergences` per §12.3.1). Together they let the migration improve correctness monotonically.

### 15.4 Documentation requirement

OFBT v0.1.5 ships with a "Verification Gate Guide" document describing the gate process for Fandaws specifically, with instructions for installing the shim, configuring parallel-run, and interpreting mismatches. This is consumer-facing documentation, not part of the spec proper.

---

## 16. Revision History

See §0.1 for the v0.1.7 revision history (and prior revisions). The section is at the top of the document so it is visible immediately on opening.

---

## 17. References

### Documents

- **OFBT Specification v0.1.7** (`OFBT_spec_v0.1.7.md`) — the behavioral specification, co-versioned with this document. Authoritative on OFBT's behavior.
- **Fandaws Consumer Requirements v1.0** (2026-04-29) — the requirements set OFBT v0.1.5 satisfies as a deliverable artifact.
- **W3C OWL 2 Web Ontology Language Direct Semantics** (W3C Recommendation, 2012) — reference for the OWL 2 standard JSON-LD restriction shape.
- **W3C RDF 1.1 Concepts and Abstract Syntax** — reference for IRI handling and blank node semantics.
- **RDF Dataset Canonicalization 1.0** (W3C Recommendation, 2024) — used internally for blank node canonicalization per ADR-016.

### Implementations

- **rdf-canonize**: https://github.com/digitalbazaar/rdf-canonize — RDFC-1.0 reference implementation, the only external dependency outside Tau Prolog.
- **Tau Prolog**: http://tau-prolog.org/ — pinned to v0.3.4.

---

*End of OFBT API Specification v0.1.7.*
