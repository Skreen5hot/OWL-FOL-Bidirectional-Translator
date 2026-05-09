# Phase 3 Retroactive Verification Ritual — Corrective Routing

**Date:** 2026-05-09 (initial DRAFT)
**Cycle type:** Phase 3 retroactive corrective cycle (architect-ratified at Step 6 micro-cycle 2026-05-09; binds before Phase 3 Step 7 begins)
**Surfaced by:** SME running the retroactive verification ritual on Pass 2a-era fixtures + ADR-007 (all sections) + ADR-011 + ADR-013 per architect Step 6 side-finding ruling 2026-05-09
**Routing:** Single corrective routing per architect side-finding ruling (per-finding routing refused; batch-into-single-cycle binding)

**Scope per architect Step 6 ruling 2026-05-09:**
- 16 Pass 2a-era fixtures (8 corpus-before-code + 8 step-N-bind)
- ADR-007 (all sections — DECISIONS.md lines 138-309 area)
- ADR-011 (audit-artifact `@id` discipline — DECISIONS.md line 533 area)
- ADR-013 (visited-ancestor cycle-guard pattern — DECISIONS.md line 891 area, current Draft text post-Step-5-cycle-promotion)

---

## 1. Findings summary

The retroactive ritual surfaced **3 categories of findings + 1 forward-track**:

| # | Class | Fixture(s) / artifact | Disposition |
|---|---|---|---|
| 1 | Cat 1 reason-code reference | `nc_self_complement.fixture.js` | **Already-routed by Q-3-Step6-B** (this cycle's primary gap; architect-ratified amendment: `horn_inconsistency_proven` → `inconsistent`) |
| 2 | Cat 3 FOL @type discriminator | 4 hypothetical fixtures | **Substantive (NEW; SME-proposed amendments below)** |
| 3 | Editorial (fixture convention) | `expectedThrows` field | **Minor; architect rules** |
| 4 | Step 8 framing forward-track | `structural_annotation_mismatch` reason code | **NOT this cycle's scope; surfaces at Step 8 framing per Q-3-C precedent** |

Findings (1) is fully covered by the Step 6 architect ratification; this corrective routing primarily covers finding (2) — substantive 4-fixture amendment — and surfaces (3) + (4) for architect-final disposition.

---

## 2. Finding 1: nc_self_complement `horn_inconsistency_proven` (already-routed)

**Cat 1 reason-code reference.** SME ran `Grep` for `expectedReason` values across all corpus fixtures + verified each against `src/kernel/reason-codes.ts`. All 13 `expectedReason` values verify clean against the canonical 16-member enum **except** `nc_self_complement.fixture.js`:

```
tests/corpus/nc_self_complement.fixture.js:93:    expectedReason: "horn_inconsistency_proven",
tests/corpus/nc_self_complement.fixture.js:113:   expectedReason: "horn_inconsistency_proven",
```

`horn_inconsistency_proven` is NOT in the canonical enum. Architect-ratified Q-3-Step6-B resolution 2026-05-09: reuse `inconsistent` per Q-3-Step4-A precedent (semantic-state alignment).

**Disposition:** Already-routed; amendments land in this corrective commit alongside the substantive finding (2) amendments.

**Required amendments:**
- `tests/corpus/nc_self_complement.fixture.js` lines 93 + 113: `expectedReason: "horn_inconsistency_proven"` → `expectedReason: "inconsistent"`
- `tests/corpus/nc_self_complement.fixture.js` `expectedOutcome.summary` + `intendedToCatch` prose: replace `horn_inconsistency_proven` references with `inconsistent`
- `tests/corpus/manifest.json` `nc_self_complement` entry mirror updates

---

## 3. Finding 2: Hypothetical fixtures — OWL @types in `axiomSet` (Cat 3, NEW substantive)

**Cat 3 FOL @type discriminator finding.** SME ran `Grep` for `"@type": "fol:` across corpus + verified each value against `src/kernel/evaluate-types.ts` + `src/kernel/fol-to-prolog.ts` canonical FOL type enumeration.

**Canonical FOL @types** (per evaluate-types.ts switch + fol-to-prolog.ts switch):
- `fol:Atom` — predicate(args)
- `fol:Conjunction` — P ∧ Q
- `fol:Disjunction` — P ∨ Q
- `fol:Negation` — ¬P
- `fol:Universal` — ∀x. φ
- `fol:Existential` — ∃x. φ
- `fol:Implication` — P → Q
- `fol:Equality` — t1 = t2
- `fol:False` — ⊥
- `fol:Variable` — variable term
- `fol:Constant` — constant term

**Findings — 4 hypothetical fixtures use OWL-axiom-shaped @types in `axiomSet` field:**

| Fixture | Current (incorrect) | Architectural intent |
|---|---|---|
| `hypothetical_clean.fixture.js` line 55 | `"@type": "fol:ClassAssertionAxiom"` (plus class + individual fields) | OWL ClassAssertion(Mother, alice) lifted to FOL Atom: `Mother(alice)` |
| `hypothetical_inconsistency.fixture.js` line 59 | `"@type": "fol:DisjointClassesAxiom"` (plus classes array) | OWL DisjointClasses(Adult, Person) lifted to FOL: ∀x. (Adult(x) ∧ Person(x)) → ⊥ |
| `hypothetical_horn_incompleteness.fixture.js` line 56 + 59 | `"@type": "fol:SubClassOfAxiom"` + `"@type": "fol:ObjectUnionOf"` | OWL SubClassOf(Person, ObjectUnionOf(Adult, Minor)) lifted to FOL: ∀x. Person(x) → (Adult(x) ∨ Minor(x)) |
| `hypothetical_non_persistence.fixture.js` line 82 | `"@type": "fol:DisjointClassesAxiom"` | Same as hypothetical_inconsistency |

**Class of error:** Same pattern as Phase 2 Step 4 Concern B (body/inner FOL.Negation typo) and Pass 2a OWL fixture errors (@type "Restriction" discriminator). I conflated OWL axiom-shape vocabulary with FOL axiom-shape vocabulary when authoring the `axiomSet` field. API §8.1.2's `axiomSet: FOLAxiom[]` requires FOL axioms — the lifted form, not the OWL form.

**This is the third class of the same Pass 2a error pattern in Phase 3** (alongside the OWL @type "Restriction" + reason-code + spec-section-reference errors caught at Steps 4 + 6).

### 3.1 Proposed amendments (SME draft FOL @types)

**hypothetical_clean.fixture.js** axiomSet (line 53-57 area):

```javascript
// CURRENT (incorrect):
axiomSet: [
  {
    "@type": "fol:ClassAssertionAxiom",
    class: MOTHER,
    individual: ALICE,
  },
],

// PROPOSED (FOL Atom):
axiomSet: [
  // OWL ClassAssertion(Mother, alice) lifted to FOL Atom Mother(alice).
  {
    "@type": "fol:Atom",
    predicate: MOTHER,
    arguments: [{ "@type": "fol:Constant", iri: ALICE }],
  },
],
```

**hypothetical_inconsistency.fixture.js** axiomSet (line 57-62 area):

```javascript
// CURRENT (incorrect):
axiomSet: [
  {
    "@type": "fol:DisjointClassesAxiom",
    classes: [ADULT, PERSON],
  },
],

// PROPOSED (FOL Universal + Implication + Conjunction + False):
axiomSet: [
  // OWL DisjointClasses(Adult, Person) lifted to FOL: ∀x. (Adult(x) ∧ Person(x)) → ⊥
  {
    "@type": "fol:Universal",
    variable: "x",
    body: {
      "@type": "fol:Implication",
      antecedent: {
        "@type": "fol:Conjunction",
        conjuncts: [
          {
            "@type": "fol:Atom",
            predicate: ADULT,
            arguments: [{ "@type": "fol:Variable", name: "x" }],
          },
          {
            "@type": "fol:Atom",
            predicate: PERSON,
            arguments: [{ "@type": "fol:Variable", name: "x" }],
          },
        ],
      },
      consequent: { "@type": "fol:False" },
    },
  },
],
```

**hypothetical_horn_incompleteness.fixture.js** axiomSet (line 54-65 area):

```javascript
// CURRENT (incorrect):
axiomSet: [
  {
    "@type": "fol:SubClassOfAxiom",
    subClass: PERSON,
    superClass: {
      "@type": "fol:ObjectUnionOf",
      classes: [ADULT, MINOR],
    },
  },
],

// PROPOSED (FOL Universal + Implication + Disjunction):
axiomSet: [
  // OWL SubClassOf(Person, ObjectUnionOf(Adult, Minor)) lifted to FOL:
  // ∀x. Person(x) → (Adult(x) ∨ Minor(x))
  // The Disjunction-in-consequent is the canonical Horn-fragment-escape shape per spec §8.5.4 +
  // ADR-007 §11 FOLDisjunction-in-head per-variant table row (architect-ratified 2026-05-09).
  {
    "@type": "fol:Universal",
    variable: "x",
    body: {
      "@type": "fol:Implication",
      antecedent: {
        "@type": "fol:Atom",
        predicate: PERSON,
        arguments: [{ "@type": "fol:Variable", name: "x" }],
      },
      consequent: {
        "@type": "fol:Disjunction",
        disjuncts: [
          {
            "@type": "fol:Atom",
            predicate: ADULT,
            arguments: [{ "@type": "fol:Variable", name: "x" }],
          },
          {
            "@type": "fol:Atom",
            predicate: MINOR,
            arguments: [{ "@type": "fol:Variable", name: "x" }],
          },
        ],
      },
    },
  },
],
```

**hypothetical_non_persistence.fixture.js** axiomSet (line 80-85 area):

```javascript
// CURRENT (incorrect):
axiomSet: [
  {
    "@type": "fol:DisjointClassesAxiom",
    classes: [ADULT, PERSON],
  },
],

// PROPOSED (same as hypothetical_inconsistency — disjointness lifted to ∀x. (Adult(x) ∧ Person(x)) → ⊥):
axiomSet: [
  {
    "@type": "fol:Universal",
    variable: "x",
    body: {
      "@type": "fol:Implication",
      antecedent: {
        "@type": "fol:Conjunction",
        conjuncts: [
          {
            "@type": "fol:Atom",
            predicate: ADULT,
            arguments: [{ "@type": "fol:Variable", name: "x" }],
          },
          {
            "@type": "fol:Atom",
            predicate: PERSON,
            arguments: [{ "@type": "fol:Variable", name: "x" }],
          },
        ],
      },
      consequent: { "@type": "fol:False" },
    },
  },
],
```

Plus prose updates to each fixture's `expectedOutcome.summary` and `intendedToCatch` to reference the FOL form rather than the OWL form.

### 3.2 Manifest mirror updates

The 4 manifest entries (`hypothetical_clean`, `hypothetical_inconsistency`, `hypothetical_horn_incompleteness`, `hypothetical_non_persistence`) reference the fixtures' contracts but don't directly cite `@type` discriminators. Mirror updates to `expectedOutcome.summary` text where it references the (incorrect) OWL-shaped axiomSet.

---

## 4. Finding 3: `expectedThrows` field convention inconsistency (editorial; architect rules)

**Cat 1/8 boundary case.** Two error fixtures use snake_case reason-code-style `expectedThrows`:

```
error_structural_annotation_mismatch.fixture.js:52: expectedThrows: "structural_annotation_mismatch"
error_arc_manifest_version_mismatch.fixture.js:56:  expectedThrows: "arc_manifest_version_mismatch"
```

One step-cap fixture uses CamelCase typed-error-class-name `expectedThrows`:

```
step_cap_aggregate.fixture.js:58: expectedThrows: "SessionStepCapExceededError"
```

**Substantive question:** does `expectedThrows` reference the typed error class NAME (CamelCase) or the error's `code` field VALUE (snake_case reason-code-aligned)? Currently fixtures use both conventions ad-hoc.

**SME-routable proposal (architect-final):**

- (a) Standardize on snake_case reason-code-aligned: `step_cap_aggregate` amends to `expectedThrows: "aggregate_step_cap_exceeded"` (the existing reason code per reason-codes.ts line 37; SessionStepCapExceededError's code field per typed-error-hierarchy convention)
- (b) Standardize on CamelCase typed-error-class-name: `error_structural_annotation_mismatch` and `error_arc_manifest_version_mismatch` amend to `expectedThrows: "OFBTError"` + add `expectedErrorCode: "structural_annotation_mismatch"` (since per API §2.1.1 line 183, the throw is `OFBTError` with code, not a dedicated subclass)
- (c) Permit both conventions explicitly with disambiguation: `expectedThrowsClass` (CamelCase) + `expectedThrowsCode` (snake_case) as separate fields

**Disposition:** Editorial fixture-convention question. Architect rules; SME applies the chosen convention across the 3 error fixtures.

---

## 5. Finding 4: `structural_annotation_mismatch` not in canonical enum (Step 8 framing forward-track)

**Cat 1 boundary case.** Per Phase 3 entry packet §2.10 + Q-3-C precedent (architect-ratified 2026-05-08): `structural_annotation_mismatch` is a Phase 3 Step 8 deliverable. Currently NOT in `src/kernel/reason-codes.ts` canonical enum (16 members; Q-3-C addition pending Step 8 implementation makes 17; structural_annotation_mismatch not yet enumerated for addition).

**Disposition:** **NOT this cycle's scope.** Surfaces at Step 8 framing per Q-3-C precedent (additive enum minor-version-bump pattern via spec §11.2). When Step 8 framing cycle runs, the Developer dispatch will surface this as a Q-3-Step8-X architectural-gap (analogous to Q-3-C's no_strategy_applies pattern) and the architect ruling will ratify the addition.

**No this-cycle action required.** Flagging for completeness of the retroactive ritual report.

---

## 6. Categories with no findings

- **Cat 2 LossType references:** All `expectedLossSignatureReasons: []` arrays are empty across the new fixtures; no LossType references to verify.
- **Cat 4 OWLAxiom @type discriminators:** SME ran `Grep` for `"@type": "[A-Z]..."` across all corpus fixtures; all values (Class, ClassAssertion, ObjectPropertyAssertion, ObjectPropertyDomain, Restriction, SubClassOf, SameIndividual, NegativeObjectPropertyAssertion, HasKey, ClassDefinition, DatatypeRestriction, Annotation, ObjectPropertyCharacteristic, EquivalentClasses, DisjointClasses, ObjectComplementOf, ObjectUnionOf, InverseObjectProperties, TransitiveObjectProperty) verify clean against `src/kernel/owl-types.ts`.
- **Cat 5 reason-enum stability statements:** ADR-007 §11 statement "16 + Q-3-C `no_strategy_applies` pending = 17 at Phase 3 close" verified against direct read of reason-codes.ts (16 members confirmed); ADR-013 statement consistent.
- **Cat 6 spec section references:** Spot-checked spec §0.1, §0.2.3, §3.4.1, §5.4, §5.5, §6.3, §8.5, §8.5.1, §8.5.2, §8.5.4, §8.5.5, §13 — all confirmed exist.
- **Cat 7 API spec section references:** Spot-checked API §2.1, §2.1.1, §2.1.2, §5.5, §6.1, §6.4.1, §7.1, §7.5, §8.1, §8.1.1, §8.1.2, §11.1, §11.3 — all confirmed exist.
- **Cat 8 ADR/Q-ruling references:** ADR-001 through ADR-013 (DECISIONS.md register) all confirmed exist; spec §13 ADR table parallel-registry references explicitly disambiguated per Step 5 cycle banking; all Q-rulings traceable to architect ratification messages.

---

## 7. Banking from this retroactive ritual run

**Three-instance pattern confirmed AT THE SPEC/ADR/FIXTURE LAYER:**

1. **Phase 2 Step 4 Concern B (FOL fixture body/inner)** — caught in implementation; no verification ritual existed
2. **Phase 3 Pass 2a (OWL fixture @type Restriction + InverseObjectProperties shape)** — caught at routing-cycle ritual; led to verification ritual banking
3. **Phase 3 Step 4 (cwa_*.fixture naf_residue + API §6.3)** — caught by Step 4 verification ritual run on routing artifact
4. **Phase 3 Step 6 + retroactive ritual (nc_self_complement horn_inconsistency_proven + 4 hypothetical fixtures FOL @type errors)** — caught by Q-3-Step6-B routing + retroactive ritual

The retroactive ritual operationalized for the first time on this cycle. **First production catch:** the 4-fixture FOL @type error in hypothetical fixtures, which would have otherwise surfaced at Step 7 (`Hypothetical-axiom case per API §8.1.2`) implementation framing — forcing a Step-7 micro-cycle. The retroactive batch consolidates into this single corrective cycle as designed.

**Banking proposal (architect ratifies; folds at Phase 3 exit doc-pass):**

> **Retroactive verification ritual operationalization confirmed: first production batch run surfaced 1 substantive finding (4 hypothetical fixtures FOL @type errors) + 1 already-routed finding (nc_self_complement) + 2 minor/forward-track findings.** The batch consolidation pattern works as the architect-ratified discipline anticipated: errors that would have surfaced at successor Steps' framing cycles consolidate into one corrective cycle. Discipline-tightening pattern (banked at Pass 2b 2026-05-09) confirmed at production cadence: ratification → operationalization → first batch run → catches.

---

## 8. Required amendments — total file touches

| File | Class of change |
|---|---|
| `tests/corpus/nc_self_complement.fixture.js` | Cat 1 reason-code: `horn_inconsistency_proven` → `inconsistent` (lines 93, 113, prose) |
| `tests/corpus/hypothetical_clean.fixture.js` | Cat 3 FOL @type: axiomSet rewrite to fol:Atom |
| `tests/corpus/hypothetical_inconsistency.fixture.js` | Cat 3 FOL @type: axiomSet rewrite to fol:Universal+Implication+Conjunction+False |
| `tests/corpus/hypothetical_horn_incompleteness.fixture.js` | Cat 3 FOL @type: axiomSet rewrite to fol:Universal+Implication+Disjunction |
| `tests/corpus/hypothetical_non_persistence.fixture.js` | Cat 3 FOL @type: axiomSet rewrite to fol:Universal+Implication+Conjunction+False |
| `tests/corpus/manifest.json` | Mirror updates for the 5 amended fixtures (5 manifest entries) |
| (per architect Q-3-C) `tests/corpus/error_structural_annotation_mismatch.fixture.js` + `error_arc_manifest_version_mismatch.fixture.js` + `step_cap_aggregate.fixture.js` | Editorial: `expectedThrows` convention alignment per architect ratification of Finding 3 |

**Total:** 6 fixture files + manifest.json + (3 more if Finding 3 ratified). Single corrective commit per architect routing ruling.

---

## 9. Open architect rulings

| Q | Disposition |
|---|---|
| Finding 1 (nc_self_complement) | ✅ Already-routed by Q-3-Step6-B; amendments land in this corrective commit |
| Finding 2 (4 hypothetical fixtures FOL @type) | ⏳ SME-proposed amendments per §3.1; architect ratifies the FOL-formula-shape correctness for each fixture |
| Finding 3 (expectedThrows convention) | ⏳ Architect rules (a) snake_case / (b) CamelCase / (c) explicit disambiguation |
| Finding 4 (structural_annotation_mismatch enum addition) | ⏭ Out-of-scope for this cycle; Step 8 framing surface per Q-3-C precedent |
| Banking (retroactive ritual operationalization confirmation) | ⏳ Architect ratifies for AUTHORING_DISCIPLINE Phase 3 exit doc-pass |

---

## 10. Sequencing per architect ratification

1. **Now** — SME draft routes to architect (this cycle)
2. **Architect ratifies findings 1 + 2 + 3 + banking** (single corrective routing per the architect's Step 6 routing ruling)
3. **SME applies amendments per ratification:**
   - Finding 1 amendments (nc_self_complement → `inconsistent`)
   - Finding 2 amendments (4 hypothetical fixtures FOL @type rewrites)
   - Finding 3 amendments (per ratified convention)
   - Manifest mirror updates
4. **SME runs verification ritual on the corrective amendments** before routing the corrective commit (binding-immediately discipline)
5. **Pass 2b corrective commit** — Developer commits all amendments per audit-trail-unity-per-surface; commit body cites this corrective routing's architect ratification
6. **Step 6 implementation commit** — proceeds against ratified contracts; can run in parallel with corrective commit per architect Step 6 sequencing
7. **Phase 3 Step 7 begins** AFTER both corrective commit + Step 6 close commit land + remote CI green per architect Step 6 timing ruling

---

## 11. Verification ritual — run on this artifact pre-routing

Per the binding-immediately discipline + Cat 8 multi-canonical-source banking refinement: SME ran the 8-category ritual on this corrective routing artifact before routing.

| # | Category | Result |
|---|---|---|
| 1 | Reason-code references | ✅ All references valid: `inconsistent`, `coherence_indeterminate`, `cycle_detected`, `step_cap_exceeded`, `aggregate_step_cap_exceeded`, `arc_manifest_version_mismatch` confirmed in canonical enum; `horn_inconsistency_proven` correctly identified as NOT in enum (this is the routed gap); `structural_annotation_mismatch` correctly identified as Step-8-pending |
| 2 | LossType references | n/a |
| 3 | FOL @type discriminators | ✅ All proposed amendment @types (`fol:Atom`, `fol:Universal`, `fol:Implication`, `fol:Conjunction`, `fol:Disjunction`, `fol:False`, `fol:Variable`, `fol:Constant`) verified against `src/kernel/evaluate-types.ts` + `src/kernel/fol-to-prolog.ts` canonical enumeration |
| 4 | OWLAxiom @type | n/a |
| 5 | Reason enum stability | ✅ "16 + Q-3-C pending = 17" claim consistent |
| 6 | Spec section references | ✅ §8.5.4, §11.2, §6.3 etc. confirmed exist |
| 7 | API spec section references | ✅ §2.1.1, §6.4.1, §7.5, §8.1.2, §11.1, §11.3 confirmed exist |
| 8 | ADR/Q-ruling references | ✅ ADR-007 §11, ADR-013, Q-3-Step6-A/B, Q-3-Step5-A, Q-3-Step4-A, Q-3-C, Q-3-Step3-B all traceable |

**No findings on this artifact's path-fence-authored content.** Ritual continues operationalizing as designed.

---

**End of SME draft. Awaits architect ratification on Finding 2 amendments + Finding 3 convention + banking confirmation.**

— SME, 2026-05-09
