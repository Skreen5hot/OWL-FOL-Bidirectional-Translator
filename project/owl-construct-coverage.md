# OWL 2 DL Construct Coverage Matrix

**Status:** Living document. Authored at Phase 2 close per architect Q-Frank-7 ruling 2026-05-07 (in response to Frank's stakeholder critique §7: "27 fixtures total" framing understates how narrow the corpus is for a full OWL 2 DL translator). Updated at each phase exit as new constructs land.

**Cycle binding:** This artifact is the SME-authored response to the coverage-acknowledgment ask in Frank's logic-stakeholder review. It maps OWL 2 DL constructs to fixture counts in `tests/corpus/`, names the constructs with zero direct fixture coverage in v0.1, and forward-tracks fixture growth across the remaining phase ledger.

**Scope and honest framing:** This is **direct fixture coverage**, not entailment coverage. A construct marked "covered" has at least one fixture that exercises the construct's lifter or projector path; it does not certify that every semantic edge case of the construct is exercised. Per the Q-Frank-1-banked principle "claims must match what the engineering establishes, no more": this matrix establishes *fixture density per construct*, not *coverage of the construct's full semantic surface*.

---

## 1. Aggregate counts (Phase 2 close, 2026-05-07)

- **Total fixtures:** 27 in `tests/corpus/`
- **Phase 1 fixtures:** 15 (lifter coverage)
- **Phase 2 fixtures:** 12 (projector + audit-artifact + parity-canary coverage)
- **Constructs with at least one direct fixture:** see §2 below
- **Constructs with zero direct v0.1 fixture coverage:** see §3 below
- **Constructs explicitly out of scope per spec §13.1:** see §4 below

---

## 2. Coverage per OWL 2 DL construct

Legend: ✅ covered (≥1 fixture); ⚠ partial (covered indirectly or by canary only); ❌ no v0.1 fixture; 🚫 explicitly punted per spec §13.1.

### 2.1 Class axioms (TBox)

| Construct | Status | Fixtures | Notes |
|---|---|---|---|
| `SubClassOf` (named subclass / superclass) | ✅ | `p1_subclass_chain`, `p1_restrictions_object_value`, `p1_restrictions_cardinality`, `p1_complement_of`, `p1_bfo_clif_classical`, `strategy_routing_direct`, `p2_blank_node_class_expression_projection`, `p2_bfo_clif_layer_a_roundtrip` | Densely covered; the most exercised TBox axiom |
| `SubClassOf` with class-expression consequent | ✅ | `p1_restrictions_object_value` (Case A demo input) | Class-expression reconstruction canary; defense-in-depth pair with absent-shape assertions |
| `EquivalentClasses` (named) | ✅ | `p1_equivalent_and_disjoint_named`, `strategy_routing_direct` | Lifter ratifies converse-SubClassOf pair pattern; projector pair-matches at Step 3a |
| `DisjointClasses` / `DisjointWith` | ✅ | `p1_equivalent_and_disjoint_named`, `p1_bfo_clif_classical` | |
| `DisjointUnion` | ❌ | — | Construct lifts to a 3-axiom decomposition (one EquivalentClasses + pairwise DisjointClasses); projector pair-matching would re-collapse but no v0.1 fixture exercises it. Forward-track to Phase 3 corpus growth. |

### 2.2 Class expressions

| Construct | Status | Fixtures | Notes |
|---|---|---|---|
| `ObjectIntersectionOf` | ✅ | `p1_restrictions_object_value` | Recursive class-expression reconstruction (Step 3b) |
| `ObjectUnionOf` | ⚠ | `p1_complement_of` (partial) | `p1_complement_of` exercises complement; union not directly fixtureed. Forward-track. |
| `ObjectComplementOf` | ✅ | `p1_complement_of` | |
| `ObjectOneOf` (nominal) | ❌ | — | Punning-adjacent; not punted by spec but no v0.1 fixture. Forward-track to Phase 3 or v0.2. |
| `ObjectSomeValuesFrom` | ✅ | `p1_restrictions_object_value` | Class-expression canary's first kind |
| `ObjectAllValuesFrom` | ✅ | `p1_restrictions_object_value` | Class-expression canary's second kind |
| `ObjectHasValue` | ✅ | `p1_restrictions_object_value` | Class-expression canary's third kind |
| `ObjectHasSelf` | ❌ | — | Reflexive self-restriction. Forward-track to Phase 3 or v0.2. |
| `ObjectMinCardinality` | ✅ | `p1_restrictions_cardinality` | Step 4b n-tuple matcher per ADR-012 |
| `ObjectMaxCardinality` | ✅ | `p1_restrictions_cardinality` | Step 4b n-tuple matcher per ADR-012 |
| `ObjectExactCardinality` | ✅ | `p1_restrictions_cardinality` | Step 4b n-tuple matcher per ADR-012 |
| `ObjectQualifiedCardinality` (with class filler) | ⚠ | `p1_restrictions_cardinality` (partial) | Basic cardinality covered; qualified cardinality with class filler is less explicitly exercised. Forward-track. |
| `DataSomeValuesFrom` / `DataAllValuesFrom` / `DataHasValue` | ❌ | — | Data-property restriction analogs. v0.1 corpus is object-property-heavy. Forward-track to Phase 3. |
| `DataMinCardinality` / `DataMaxCardinality` / `DataExactCardinality` | ❌ | — | Same as above. |

### 2.3 Object property axioms (RBox)

| Construct | Status | Fixtures | Notes |
|---|---|---|---|
| `SubObjectPropertyOf` | ⚠ | `p1_property_characteristics` (indirect) | Not the central construct of any fixture; appears in `p1_property_characteristics` context. Forward-track for explicit fixture. |
| `ObjectPropertyChain` (lifter) | ❌ | — | Per architect Q-Step6-3 ruling: lifter chain support deferred until corpus demand surfaces (Phase 3 or 4). |
| `ObjectPropertyChain` (projector) | ✅ | `p2_property_chain_realization_simplified`, `strategy_routing_chain` | Step 6 projector-only chain detection with always-emit `regularity_scope_warning` per Q-Step6-1 |
| `EquivalentObjectProperties` | ❌ | — | Forward-track. |
| `DisjointObjectProperties` | ❌ | — | Forward-track. |
| `InverseObjectProperties` | ✅ | `p1_bfo_clif_classical` | 8→9→8 lift-decompose-recollapse demonstration (Case B's load-bearing pair-matching example) |
| `ObjectPropertyDomain` | ✅ | `p1_prov_domain_range`, `strategy_routing_direct` | PROV-O domain/range conditional translation; the wrong existential-synthesis form's absence is canary-asserted in `canary_domain_range_existential` |
| `ObjectPropertyRange` | ✅ | `p1_prov_domain_range`, `strategy_routing_direct` | Same as above |
| `FunctionalObjectProperty` | ✅ | `p1_property_characteristics`, `strategy_routing_direct` | |
| `InverseFunctionalObjectProperty` | ⚠ | `p1_property_characteristics` (partial) | Forward-track for explicit fixture. |
| `ReflexiveObjectProperty` | ❌ | — | Forward-track. |
| `IrreflexiveObjectProperty` | ❌ | — | Forward-track. |
| `SymmetricObjectProperty` | ✅ | `strategy_routing_direct` | |
| `AsymmetricObjectProperty` | ❌ | — | Forward-track. |
| `TransitiveObjectProperty` | ✅ | `p1_property_characteristics`, `p1_bfo_clif_classical`, `strategy_routing_direct` | Densely covered |

### 2.4 Data property axioms

| Construct | Status | Fixtures | Notes |
|---|---|---|---|
| `SubDataPropertyOf` | ❌ | — | v0.1 corpus is object-property-heavy. Forward-track to Phase 3. |
| `EquivalentDataProperties` | ❌ | — | Same. |
| `DisjointDataProperties` | ❌ | — | Same. |
| `DataPropertyDomain` | ⚠ | `p1_abox_assertions` (indirect) | Lifter handles data property assertions; explicit domain/range fixtures forward-track. |
| `DataPropertyRange` | ⚠ | Same | Same. |
| `FunctionalDataProperty` | ❌ | — | Forward-track. |

### 2.5 Individual axioms (ABox)

| Construct | Status | Fixtures | Notes |
|---|---|---|---|
| `ClassAssertion` | ✅ | `p1_abox_assertions`, `strategy_routing_direct`, `p1_owl_same_and_different` | |
| `ObjectPropertyAssertion` | ✅ | `p1_abox_assertions`, `strategy_routing_direct` | |
| `NegativeObjectPropertyAssertion` | ⚠ | — | Per spec §13.1: projector emits negative property assertions on output; lifter does NOT ingest them as input (rejected with `UnsupportedConstructError`). One-direction support. Forward-track for input ingestion to v0.2. |
| `DataPropertyAssertion` | ✅ | `p1_abox_assertions` | |
| `NegativeDataPropertyAssertion` | ⚠ | — | Same as `NegativeObjectPropertyAssertion`. |
| `SameIndividual` | ✅ | `p1_owl_same_and_different`, `canary_same_as_propagation` | Reserved-predicate ABox per Step 3c |
| `DifferentIndividuals` | ✅ | `p1_owl_same_and_different` | Same. |

### 2.6 Annotation axioms

| Construct | Status | Fixtures | Notes |
|---|---|---|---|
| `AnnotationAssertion` (structural per spec §5.9) | ⚠ | — | Spec §5.9 specifies caller-declared structural annotation behavior; corpus-level fixture for structural-annotation round-trip is deferred. Forward-track. |
| `SubAnnotationPropertyOf` | ❌ | — | Forward-track. |
| `AnnotationPropertyDomain` / `AnnotationPropertyRange` | ❌ | — | Forward-track. |

### 2.7 Phase 2-specific projector behavior (no direct OWL 2 DL construct)

| Behavior | Status | Fixtures | Notes |
|---|---|---|---|
| Annotated Approximation strategy (`naf_residue` trigger) | ✅ | `p2_lossy_naf_residue`, `strategy_routing_annotated` | |
| Annotated Approximation strategy (`unknown_relation` trigger) | ✅ | `p2_unknown_relation_fallback`, `strategy_routing_annotated` | |
| Strategy router (Tier-2 Direct Mapping) | ✅ | `strategy_routing_direct` | |
| Strategy router (Tier-3 Property-Chain Realization) | ✅ | `strategy_routing_chain` | |
| Strategy router (Tier-default Annotated Approximation) | ✅ | `strategy_routing_annotated` | |
| Strategy router (no-strategy-applies diagnostic) | ✅ | `strategy_routing_no_match` | Phase 2 baseline; Phase 3 entry packet inherits the closure-decision item per Step 9.1 ruling |
| Stub-evaluator parity canaries (positive query preservation) | ✅ | `parity_canary_query_preservation` | |
| Stub-evaluator parity canaries (OWA vs CWA collapse) | ✅ | `parity_canary_negative_query` | |
| Stub-evaluator parity canaries (visual-equivalence trap) | ✅ | `parity_canary_visual_equivalence_trap` | |
| Blank-node class expression projection | ✅ | `p2_blank_node_class_expression_projection`, `p1_blank_node_anonymous_restriction` | |
| BFO Layer A canonical CLIF round-trip | ✅ | `p2_bfo_clif_layer_a_roundtrip`, `p1_bfo_clif_classical` | |
| IRI canonicalization canary | ✅ | `canary_iri_canonicalization` | |
| Punned-construct rejection canary | ✅ | `canary_punned_construct_rejection` | Per spec §13.1 |

---

## 3. Constructs with zero direct v0.1 fixture coverage

Honest enumeration. None of these are blockers for v0.1's structural round-trip parity claim — that claim is specifically about the corpus exercised — but they are gaps relative to "full OWL 2 DL coverage":

- `DisjointUnion`
- `ObjectOneOf` (nominal)
- `ObjectHasSelf`
- `EquivalentObjectProperties`, `DisjointObjectProperties`
- `ReflexiveObjectProperty`, `IrreflexiveObjectProperty`, `AsymmetricObjectProperty`
- `SubDataPropertyOf`, `EquivalentDataProperties`, `DisjointDataProperties`, `FunctionalDataProperty`
- `DataSomeValuesFrom`, `DataAllValuesFrom`, `DataHasValue`, `DataMinCardinality`, `DataMaxCardinality`, `DataExactCardinality`
- `SubAnnotationPropertyOf`, `AnnotationPropertyDomain`, `AnnotationPropertyRange`
- `DatatypeDefinition`, `DataIntersectionOf`, `DataUnionOf`, `DataOneOf` (data range constructs)
- Lifter `ObjectPropertyChain` (projector-only at v0.1; lifter at Phase 3 or 4 per Q-Step6-3)
- Input `NegativeObjectPropertyAssertion` and `NegativeDataPropertyAssertion` (output-only at v0.1)
- Lifter direct fixture for `OWL 2 punning` rejection (rejection is canary-tested but punning not directly exercised in normal-input corpus)

These are tracked for fixture growth in §5 below.

---

## 4. Constructs explicitly out of scope per spec §13.1

These are **deliberate** exclusions, not gaps. Spec §13.1 documents the rationale for each:

- **OWL 2 punning** — using the same IRI as a class, property, and individual simultaneously. Lifter rejects with `UnsupportedConstructError`. Canary fixture: `canary_punned_construct_rejection` exercises rejection.
- **Datatype restrictions beyond basic XSD types** (faceted datatype definitions, e.g., integers between 0 and 100). Lifter rejects with `UnsupportedConstructError`.
- **`owl:hasKey`** — composite-key declarations on classes. Lifter rejects.
- **Negative property assertions at the source level** — input ingestion of `NegativeObjectPropertyAssertion` / `NegativeDataPropertyAssertion`. Output emission is supported per §6.3.2; input is one-direction-rejected.
- **Annotation reasoning beyond §5.9** — annotation hierarchies, annotation-on-annotation, annotation property characteristics.

These exclusions stay. The honest-scope discipline per spec §0.1 is that exclusions are *named*, not silently skipped.

---

## 5. Forward-track plan for fixture growth

Phase 3 entry packet inherits the construct gaps named in §3. The schedule follows the architect-banked phase ledger with stakeholder-deliverable framing:

| Phase | Constructs surfacing for new fixture coverage |
|---|---|
| **Phase 3 (validator + `evaluate()` + No-Collapse)** | `DisjointUnion`; `ObjectHasSelf`; `Reflexive` / `Irreflexive` / `Asymmetric` ObjectProperty; lifter `ObjectPropertyChain` (cycle-guarded, per Q-Step6-3); structural-annotation round-trip fixture; data property axioms (Sub/Equivalent/Disjoint/Functional Data Property); data property restriction class expressions (`DataSomeValuesFrom` etc.) |
| **Phase 4 (BFO 2020 ARC)** | BFO-specific Layer B fixtures (ternary parthood, temporalized relations); `EquivalentObjectProperties` / `DisjointObjectProperties` from BFO axiomatization |
| **Phase 5 (IAO information bridge)** | Annotation-axiom fixtures (`SubAnnotationPropertyOf`, `AnnotationPropertyDomain` / `Range`) |
| **Phase 6 (CCO realizable-holding + mereotopology + measurement + aggregate + organizational + deontic)** | Datatype constructs (`DatatypeDefinition`, `DataIntersectionOf`, `DataUnionOf`, `DataOneOf`); cardinality with class-filler (qualified) explicit fixture |
| **Phase 7 (OFI deontic + compatibility shim)** | OFI-specific fixtures; `ObjectOneOf` if OFI exercises nominals |
| **v0.2 candidate** | Input `NegativeObjectPropertyAssertion` / `NegativeDataPropertyAssertion` ingestion (currently one-direction-rejected) |

The fixture growth is corpus-driven: each phase adds fixtures for the constructs its ARC content exercises. The Phase 3 entry packet's stakeholder-deliverable section will name the specific fixture additions and the constructs each closes.

---

## 6. Update protocol

This document is the SME's responsibility. Update at each phase exit:

1. Re-grep `tests/corpus/*.fixture.js` for new fixture additions
2. Update §2 status / fixtures column for each construct that gained a fixture
3. Move closed gaps from §3 to §2
4. Update §5 forward-track plan for the next phase

Banking: this is the canonical answer to stakeholder "how broad is the coverage?" questions. Frank's §7 ask is permanently addressable by linking to this document.

---

## 7. References

- Frank's stakeholder critique 2026-05-07: §7 ("the '27 fixtures total' framing understates how narrow the corpus is")
- Architect Q-Frank-7 ruling 2026-05-07: SME path-domain remediation; weak preference for standalone artifact at this path
- Spec §13.1: Explicitly punted OWL constructs
- Spec §12: Acceptance criteria
- API §14.11: Test corpus coverage matrix (corpus × acceptance-criterion grid; this document is the corpus × OWL-construct grid as a complement)
- `tests/corpus/manifest.json`: machine-readable fixture inventory
- `tests/corpus/_stub-evaluator.js`: parity-canary harness contract
- ADR-007 §10 (promoted to Accepted per Q-Frank-2 ruling 2026-05-07): meta-typing-predicate elision; bounds the implicit-typing assumption to OWL 2 DL inputs
