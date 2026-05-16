# Phase 4 Step 6 Q-4-Step6-A regularityCheck — Verification Ritual Report

**Date:** 2026-05-14/15 (Pass 2b verification ritual run on SME path-fence-authored artifacts, pre-routing per binding-immediately discipline).
**Cycle:** Phase 4 Step 6 Q-4-Step6-A mid-phase architectural-gap micro-cycle Pass 2b authoring (architect ruling 2026-05-14/15 + implicit canonical-sources sub-ruling: spec §6.1.2 + §6.2.1 + Horrocks et al. 2007 reference).
**Predecessors:**
- [`phase-4-step6-regularity-check.md`](./phase-4-step6-regularity-check.md) — Q-4-Step6-A routing-cycle artifact (RATIFIED 2026-05-14/15)
- Architect Q-4-Step6-A canonical-sources sub-ruling 2026-05-14/15 (implicit): spec §6.1.2 (SROIQ R feature + regularity restriction citing Horrocks, Kutz, and Sattler 2007) + §6.2.1 (chain projection + regularity_scope_warning emission); Layer B CLIF parity deferred per Q-4-C amendment
- [`phase-4-step5-connected-with-bridge-verification-ritual-report.md`](./phase-4-step5-connected-with-bridge-verification-ritual-report.md) (Q-4-Step5-A precedent; production-catch history table extended here with Catch 5; non-linear-acceleration trajectory continues)

---

## 1. Ritual scope per Q-4-Step6-A implicit canonical-sources sub-ruling

Per architect canonical-sources sub-ruling 2026-05-14/15 (implicit), SME runs the 8-category ritual against:

1. **Q-4-Step6-A routing-cycle artifact** (`project/reviews/phase-4-step6-regularity-check.md`)
2. **`regularity_check_clears_warning.fixture.js`** — chain over BFO non-transitive roles + expected RecoveryPayload shape per Sub-option α affirmative-skip-warning
3. **`regularity_check_keeps_warning.fixture.js`** — chain containing owl:TransitiveProperty role + expected RecoveryPayload shape per Sub-option α conservative-default keeps-warning
4. **Manifest entries** (`tests/corpus/manifest.json` 2 new entries)
5. **`project/v0.2-roadmap.md` amendment** — new v0.2-09 entry per Q-4-Step6-A.3 forward-track
6. **Phase 4 entry packet amendment** (§3 corpus count 57→59 + §12 6 new bankings + cycle accounting (mid-phase counter 2→3 EXACT MATCH) + §13 forward-reference + Phase 4 exit retro candidates section update + closing status banner update)

Canonical sources per architect: spec §6.1.2 + §6.2.1 + Horrocks, Kutz, and Sattler (2007) reference.

---

## 2. Categories run per the established 8-category ritual

| # | Category | Scope | Findings count |
|---|---|---|---|
| Cat 1 | Spec-section-existence verification (spec §6.1.2 + §6.2.1 cited; both verified existing per `project/OFBT_spec_v0.1.7.md` grep at lines 991 + 1064) | Routing artifact + 2 fixtures + entry packet amendment | 0 |
| Cat 2 | ADR cross-reference verification (ADR-007 §1 + ADR-007 §11 + ADR-013 in DECISIONS.md cited in fixtures; ADR-011 cited per architect verbatim transcription in routing artifact + entry packet Banking 6) | Routing artifact + 2 fixtures + entry packet | **1 finding** (Finding 1 below — Cat 2+7+8 cross-category — ADR-011 mis-citation in fixtures' relatedADRs; corrected pre-routing per Q-4-Step5-A Pass 2b Banking 3 disambiguation discipline) |
| Cat 3 | Q-ruling cross-reference verification (Q-4-Step6-A.1 + .1.1 + .2 + .3 + .4 + Q-4-Step5-A precedent + Q-4-Step4-A precedent + Q-4-C amendment + Q-4-A + Q-4-D + Q-3-D + Q-3-E + Q-Step6-1 all cited correctly) | Routing artifact + fixtures + entry packet | 0 |
| Cat 4 | Reason-code-against-frozen-enum verification (no new reason-code citations; regularityCheck returns 'regularity-certified' / 'cannot-certify' enum values, NOT reason-codes per spec §6.2.1) | Routing artifact + fixtures | 0 |
| Cat 5 | FOL @type vs OWL @type discriminator verification (fixtures use OWL @type for input ABox + RBox: `ObjectPropertyAssertion`, `SubObjectPropertyOf`, `ObjectPropertyChain`; no fol: @types since fixtures are projector-side not lifter-side) | Both fixtures | 0 |
| Cat 6 | Manifest mirror consistency verification (manifest entries mirror fixtures' expectedRecoveryPayloadShape + canaryRole + corpusActivationTiming + stepBinding) | Manifest + 2 fixtures | 0 |
| Cat 7 | Cross-phase + cross-amendment cross-reference verification (routing artifact references entry packet + Q-4-Step5-A predecessor + Q-4-Step4-A predecessor + Q-4-C amendment + Phase 2 Q-Step6-1; fixtures reference siblings + sub-rulings; entry packet §13 forward-reference to routing artifact; v0.2-roadmap.md cross-references) | All 5+ artifacts | **1 finding** (Finding 1 below — Cat 2+7+8 cross-category — ADR-registry/banked-principle conflation; corrected pre-routing) |
| Cat 8 | Multi-canonical-source verification (spec §6.1.2 + §6.2.1 + Horrocks et al. 2007 + DECISIONS.md ADR-007/ADR-013; ADR-011 in DECISIONS.md is 'Audit-artifact @id content-addressing' + spec §10 ADR-011 is 'SLD termination via cycle-detection guards' — neither matches 'behavioral-contract evolution discipline' which is verbal-banked) | Routing artifact + fixtures + entry packet | **1 finding** (Finding 1 below — Cat 2+7+8 cross-category — same root cause as Cat 2 + Cat 7 surfaces; resolved pre-routing) |

**Total findings: 1 (surfaced through Cat 2 + Cat 7 + Cat 8 cross-category — same root cause: SME-self-error in fixture relatedADRs ADR-011 mis-citation; resolved pre-routing).** FIFTH production catch in this engagement's verification ritual history.

---

## 3. Findings

### Finding 1 (Cat 2 + Cat 7 + Cat 8 cross-category) — ADR-011 mis-citation in fixtures' relatedADRs corrected pre-routing — FIFTH PRODUCTION CATCH

**Surface:** The SME's initial path-fence-author of both `regularity_check_clears_warning.fixture.js` + `regularity_check_keeps_warning.fixture.js` cited `relatedADRs: ["ADR-011 (DECISIONS.md ADR-011 — behavioral-contract evolution discipline; ...)"]`. Pre-routing Cat 2 + Cat 7 + Cat 8 cross-category verification surfaced the conflation:

**Sub-error details (parallel-registry-conflation continuing surfacing):**

| ADR registry | ADR-011 actual content | Match to "behavioral-contract evolution discipline"? |
|---|---|---|
| `project/DECISIONS.md` ADR-011 (line 537) | "Audit-artifact `@id` content-addressing scheme — LossSignature + RecoveryPayload" | NO |
| `project/OFBT_spec_v0.1.7.md` §10 ADR-011 (line 1406) | "SLD termination via cycle-detection guards (v0.1.2) with SLG tabling planned for v0.2" | NO |

**Neither ADR-011 registry entry matches "behavioral-contract evolution discipline".** The "behavioral-contract evolution discipline" is **verbally-banked** (architect-banked principle from prior cycles + Q-4-Step6-A Banking 6 verbatim transcription), NOT formalized as a numbered ADR in either registry.

This is the SECOND instance of the same conflation pattern in this engagement (Q-4-Step5-A Catch 4 was the FIRST — ADR-012 mis-citation; Q-4-Step6-A is the SECOND — ADR-011 mis-citation). The corpus fixture cross-reference field retroactive audit forward-track candidate (banked at Q-4-Step5-A Pass 2b Banking 3) gains supporting evidence: at least two Phase 4 step-N-bind fixtures (now corrected) carried the ADR-vs-banked-principle conflation pattern; the retroactive audit at Phase 4 exit retro will surface whether other fixtures carry the same pattern.

**Architect verbatim transcription preservation note:** The architect's Q-4-Step6-A ruling banking 6 verbatim cites "ADR-011 evolution discipline" — per §11 verbatim-transcription discipline, this transcription is preserved in the routing artifact + entry packet Banking 6 transcription. The fixture's relatedADRs field is SME-authored (NOT architect verbatim); SME-domain mechanical fix per the disambiguation discipline corrects the fixture's citation while preserving the architect's verbatim transcription.

**Disposition:** **Resolved pre-routing per binding-immediately discipline + Q-4-Step5-A Pass 2b Banking 3 disambiguation discipline.** Both fixtures' `relatedADRs` field was corrected to remove the ADR-011 citation; the "behavioral-contract evolution discipline" + Q-4-Step6-A Banking 6 transcription moves to `relatedBankedPrinciples` with explicit disambiguation note linking to this Catch 5 finding.

**Audit-trail entry:** Inline `relatedADRs` + `relatedBankedPrinciples` field updates in both fixtures document the Cat 2 + Cat 7 + Cat 8 cross-category production catch + corrective action; routing artifact preserves architect verbatim transcription per §11 discipline.

**Banking observation (verbal, formalize at Phase 4 exit doc-pass — composes with prior bankings):**

This finding extends the Q-4-Step5-A Pass 2b brief confirmation cycle Banking 2 (non-linear-acceleration pattern: detection scope expands as ritual run history accumulates). The Q-4-Step6-A cycle's Cat 2 + Cat 7 + Cat 8 cross-category catch surfaces the **REPEATED ADR-registry/banked-principle conflation pattern** — Catch 4 (Q-4-Step5-A) caught the first instance (ADR-012); Catch 5 (this cycle) caught the second instance (ADR-011). The repetition supports the retroactive corpus fixture cross-reference field audit candidate forward-tracked at Q-4-Step5-A Pass 2b; the audit will surface whether other Phase 1-3 fixtures + Phase 4 step-N-bind fixtures carry the same pattern.

**This is the verification ritual's FIFTH production catch in this engagement** (after Phase 3 Step 5 Cat 6; Q-4-C amendment Cat 5; Q-4-Step4-A Cat 6+8; Q-4-Step5-A Cat 2+7+8 first instance; Q-4-Step6-A Cat 2+7+8 second instance). The detection-scope-expansion pattern continues per Q-4-Step4-A Banking 4 + Q-4-Step5-A Pass 2b Banking 2 non-linear-acceleration extension.

**Composability observation:** This production catch (Catch 5) is structurally identical to Catch 4 (Q-4-Step5-A) — same failure-mode-class (ADR-registry-conflation-vs-banked-principle-conflation), same disposition (pre-routing correction + relatedBankedPrinciples field disambiguation per Q-4-Step5-A Pass 2b Banking 3). The pattern repetition strengthens the retroactive corpus fixture cross-reference field audit forward-track candidacy at Phase 4 exit retro.

---

## 4. Aggregate disposition

**1 finding total:** Finding 1 (Cat 2 + Cat 7 + Cat 8 cross-category SME-self-error in fixture relatedADRs ADR-011 mis-citation): **Resolved pre-routing per binding-immediately discipline.** Both fixtures' relatedADRs corrected; relatedBankedPrinciples field includes explicit disambiguation note; verification ritual's FIFTH production catch in this engagement; second instance of the parallel-registry-conflation pattern (Q-4-Step5-A Catch 4 first; this cycle Catch 5 second).

**No architect routing required for the ritual finding** — dispositioned within SME-domain (mechanical correction). The architect's Q-4-Step6-A Banking 6 verbatim transcription preserved per §11 discipline (independent of the SME-fixture-citation correction).

**Disposition shape:**

| Finding | Cycle disposition | Cadence |
|---|---|---|
| Finding 1 (Cat 2+7+8 cross-category ADR-011 mis-citation) | Pre-routing correction (SME-domain mechanical fix per Q-4-Step5-A Pass 2b Banking 3 disambiguation discipline) | Pre-routing |

**No [VERIFY] markers introduced this cycle** — Q-4-Step6-A.3 forward-track means no ARC schema extension; no Connected With ARCEntry domain/range deferrals like Q-4-Step5-A; no canonical-source-fetch dependencies beyond the canonical-source citations (spec §6.1.2 + §6.2.1 + Horrocks et al. 2007) which are verified existing.

---

## 5. Verification ritual production-catch + production-miss history (extends Q-4-Step5-A Pass 2b precedent; Catch 5 banked per non-linear-acceleration pattern)

Per Q-4-Step4-A Pass 2b brief confirmation cycle Banking 4 (granularity-expansion pattern) + Q-4-Step5-A Pass 2b Banking 2 (non-linear-acceleration extension):

| Catch/Miss # | Cycle | Surface category | Cross-surface | Disposition | Failure-mode-class | Detection granularity |
|---|---|---|---|---|---|---|
| Catch 1 | Phase 3 Step 5 2026-05-08 | Cat 6 spec-section-existence | single-surface | pre-routing correction | reference-non-existence | low |
| Catch 2 | Q-4-C amendment 2026-05-10 | Cat 5 FOL @type discriminator | single-surface | pre-routing correction | type-system-vocabulary-misalignment | low |
| Catch 3 | Q-4-Step4-A 2026-05-11 | Cat 6 + Cat 8 cross-category | multi-surface | pre-routing correction + [VERIFY] marker deferral | IRI-reuse-across-semantically-distinct-classes | medium |
| Miss 1 | Q-4-Step5-A surfacing 2026-05-14 | Cat 7 reference-existence-vs-reference-consistency boundary | multi-surface (boundary) | Developer-side implementation reconnaissance complementary catch | reference-existence-pass + reference-consistency-fail | boundary |
| Catch 4 | Q-4-Step5-A 2026-05-14 | Cat 2 + Cat 7 + Cat 8 cross-category | multi-surface | pre-routing correction | ADR-registry-conflation-vs-banked-principle-conflation (ADR-012 first instance) | high |
| **Catch 5** | **Q-4-Step6-A 2026-05-14/15 (this cycle)** | **Cat 2 + Cat 7 + Cat 8 cross-category** | **multi-surface** | **pre-routing correction** | **ADR-registry-conflation-vs-banked-principle-conflation (ADR-011 SECOND INSTANCE — repetition strengthens retroactive audit candidacy)** | **high (repeated)** |

**Non-linear-acceleration trajectory continuation (per Q-4-Step5-A Pass 2b Banking 2):**
- Catches 1-2: single-surface single-category, low granularity
- Catch 3: multi-surface cross-category (2-category), medium granularity
- Catches 4-5: multi-surface cross-category (3-category), high granularity + **same failure-mode-class repetition**

**REPETITION OBSERVATION (banking-worthy verbal-banking, formalize at Phase 4 exit doc-pass):**

The same failure-mode-class (ADR-registry-conflation-vs-banked-principle-conflation) caught at consecutive cycles (Catches 4 + 5) strengthens the retroactive corpus fixture cross-reference field audit forward-track candidate banked at Q-4-Step5-A Pass 2b Banking 3. The pattern: SME path-fence-author of fixture metadata systematically introduces this conflation; the verification ritual catches it at high granularity post-architect-ruling-transcription; pre-routing correction + disambiguation discipline. The retroactive audit at Phase 4 exit retro should evaluate: (a) whether prior Phase 1-3 fixtures carry the same conflation; (b) whether Q-4-Step5-A Pass 2b Banking 3 disambiguation discipline (relatedADRs vs relatedBankedPrinciples) should formalize as fixture-template requirement; (c) whether the verification ritual category coverage should evolve to catch the conflation at fixture-authoring-time rather than post-architect-ruling.

---

## 6. Phase-cadence observation

This is the **fourth mid-phase verification ritual run** in Phase 4 (after Q-4-C amendment re-run; Q-4-Step4-A; Q-4-Step5-A; Q-4-Step6-A this cycle). Phase 4 patterns continue:

- Mid-phase architectural-gap micro-cycles produce path-fence-authored artifact sets requiring binding-immediately verification ritual before architect brief confirmation
- Cross-category cross-reference verification (Cat 2 + Cat 7 + Cat 8) surfaces ADR-registry conflation + banked-principle conflation failure modes at high granularity
- Architect canonical-sources sub-rulings bound the ritual scope to architect-ratified canonical sources
- **NEW at Q-4-Step6-A:** repetition of a failure-mode-class across consecutive cycles strengthens the retroactive corpus fixture cross-reference field audit forward-track candidacy

The discipline pattern continues; no new banking required at this report-update beyond what Q-4-Step6-A's six rulings cover + the repetition observation above.

---

## 7. Cross-references

- Architect Q-4-Step6-A ruling 2026-05-14/15 (Q-4-Step6-A.1 + .1.1 + .2 + .3 + .4 + meta-observation forward-track + 6 banked principles + tight-projection-match data point banking)
- [`phase-4-step6-regularity-check.md`](./phase-4-step6-regularity-check.md) — Q-4-Step6-A routing-cycle artifact (RATIFIED 2026-05-14/15)
- [`phase-4-entry.md`](./phase-4-entry.md) §3 + §12 + cycle accounting + §13 + Phase 4 exit retro candidates section + closing status banner (amended per this cycle)
- [`phase-4-step5-connected-with-bridge-verification-ritual-report.md`](./phase-4-step5-connected-with-bridge-verification-ritual-report.md) (Q-4-Step5-A verification ritual report; production-catch history table extended here with Catch 5; non-linear-acceleration trajectory continued)
- [`phase-4-step4-disjointness-schema-verification-ritual-report.md`](./phase-4-step4-disjointness-schema-verification-ritual-report.md) (Q-4-Step4-A verification ritual report; earlier precedent for production-catch history)
- AUTHORING_DISCIPLINE.md "SME-Persona Verification of Vendored Canonical Sources" subsection (8-category ritual definition; Cat 2+7+8 cross-category extension per Q-4-Step5-A Pass 2b Banking 2 non-linear-acceleration pattern continued at Catch 5)
- `tests/corpus/regularity_check_clears_warning.fixture.js` (Catch 5 surface — Finding 1; pre-routing correction + relatedBankedPrinciples field disambiguation per Q-4-Step5-A Pass 2b Banking 3)
- `tests/corpus/regularity_check_keeps_warning.fixture.js` (Catch 5 surface — Finding 1; same disposition pattern)
- `tests/corpus/manifest.json` (2 new entries mirroring fixtures per Cat 6 consistency)
- `arc/core/bfo-2020.json` (no amendment this cycle per Q-4-Step6-A.3 forward-track ruling; existing 4 entries with owlCharacteristics owl:TransitiveProperty support Sub-option α certification logic)
- `project/v0.2-roadmap.md` (new v0.2-09 entry per Q-4-Step6-A.3 forward-track)
- Spec §6.1.2 + §6.2.1 (canonical sources per architect implicit canonical-sources sub-ruling; SROIQ R feature + regularity restriction + chain projection + regularity_scope_warning emission)
- Horrocks, Kutz, and Sattler (2007) — canonical SROIQ regularity restriction reference per spec §6.1.2
- DECISIONS.md ADR-007 + ADR-013 (verified canonical citations in fixtures); DECISIONS.md ADR-011 + spec §10 ADR-011 (Catch 5 disambiguation surface)

---

**Q-4-Step6-A verification ritual report complete. 1 finding dispositioned: Finding 1 (Cat 2+7+8 cross-category SME-self-error in fixture relatedADRs ADR-011 mis-citation; SECOND INSTANCE of the parallel-registry-conflation pattern after Q-4-Step5-A Catch 4 first instance) resolved pre-routing per binding-immediately discipline + Q-4-Step5-A Pass 2b Banking 3 disambiguation discipline + FIFTH production catch in this engagement. No architect routing required for ritual finding; Pass 2b architect brief confirmation cycle gates on the AMENDED artifact set per the architect-ratified sequencing.**

— SME, 2026-05-14/15 (Q-4-Step6-A verification ritual run, pre-routing)

---

## 8. Brief confirmation cycle integration (2026-05-14/15)

Per architect Q-4-Step6-A Pass 2b brief confirmation cycle 2026-05-14/15: this verification ritual report verified at correspondence-check granularity per banking observation 2 (non-linear-acceleration trajectory continuation) — the §5 production-catch history table's Catch 5 entry banks the pattern-recognition-expansion phase as exemplary practice. Banking 1 (Catch 5 disambiguation reuse) anchors the Finding 1 disposition (discipline ratified at Q-4-Step5-A Pass 2b operated immediately without re-routing). Banking 2 (pattern repetition strengthening) anchors the strengthening of the corpus fixture cross-reference field retroactive audit forward-track candidacy at Phase 4 exit retro.

Architect brief confirmation closes the Q-4-Step6-A mid-phase architectural-gap micro-cycle pending Pass 2b commit + remote CI green; no [VERIFY] markers introduced this cycle (Q-4-Step6-A.3 forward-track eliminates Pass-2b-vendoring-analog-time canonical-source-fetch dependency surface).

**Updated verification ritual production-catch history (Catch 5 banked at brief confirmation per non-linear-acceleration pattern-recognition-expansion phase):**

| Catch/Miss # | Cycle | Surface category | Cross-surface | Disposition | Failure-mode-class | Detection granularity | Trajectory phase |
|---|---|---|---|---|---|---|---|
| Catch 1 | Phase 3 Step 5 2026-05-08 | Cat 6 | single-surface | pre-routing correction | reference-non-existence | low | scope-expansion baseline |
| Catch 2 | Q-4-C amendment 2026-05-10 | Cat 5 | single-surface | pre-routing correction | type-system-vocabulary-misalignment | low | scope-expansion baseline |
| Catch 3 | Q-4-Step4-A 2026-05-11 | Cat 6 + Cat 8 | multi-surface | pre-routing correction + [VERIFY] | IRI-reuse-across-semantically-distinct-classes | medium | **scope expansion** (single→multi-surface) |
| Miss 1 | Q-4-Step5-A surfacing 2026-05-14 | Cat 7 boundary | multi-surface (boundary) | Developer reconnaissance complementary catch | reference-existence-pass + reference-consistency-fail | boundary | (boundary surfacing) |
| Catch 4 | Q-4-Step5-A 2026-05-14 | Cat 2 + Cat 7 + Cat 8 | multi-surface | pre-routing correction | ADR-registry-conflation-vs-banked-principle-conflation (ADR-012 first instance) | high | **granularity expansion** (Cat 6+8 → Cat 2+7+8) |
| **Catch 5** | **Q-4-Step6-A 2026-05-14/15** | **Cat 2 + Cat 7 + Cat 8** | **multi-surface** | **pre-routing correction (discipline-reuse per Q-4-Step5-A Pass 2b Banking 3)** | **ADR-registry-conflation-vs-banked-principle-conflation (ADR-011 SECOND INSTANCE)** | **high (repeated)** | **pattern-recognition expansion** (first-instance → second-instance) |

**Trajectory phase summary per Q-4-Step6-A Pass 2b Banking 2:**
- Phase 1: scope expansion (Catches 1-2 → Catch 3) — single-surface to multi-surface
- Phase 2: granularity expansion (Catch 3 → Catch 4) — Cat 6+8 to Cat 2+7+8
- Phase 3: **pattern-recognition expansion** (Catch 4 → Catch 5) — first-instance to second-instance same-failure-mode-class

The trajectory's non-linear-acceleration character: each expansion phase increases the discipline's detection sophistication; pattern-recognition expansion surfaces when previously-singleton catches recur. The discipline's sophistication accumulates at the pattern-recognition surface.

— SME, 2026-05-14/15 (Q-4-Step6-A Pass 2b brief confirmation cycle integration close)

---

## 9. Corrective sub-amendment integration (2026-05-15) — Cat 8 production catch surfaced at Developer Pass 2b verification ritual; Miss 2 + Catch 6

### 9.1 Surface

Developer Pass 2b verification ritual 2026-05-15 (post-architect-Pass-2b-brief-confirmation; pre-Pass-2b-commit) surfaced a Cat 8 production catch on both step-N-bind fixtures' RBox shape:

**SME path-fence-author error 2026-05-14:** Both `regularity_check_clears_warning.fixture.js` + `regularity_check_keeps_warning.fixture.js` encoded the property chain in the RBox via:

```js
rbox: [
  {
    "@type": "SubObjectPropertyOf",
    subPropertyChain: { "@type": "ObjectPropertyChain", properties: [...] },
    superProperty: ...,
  },
]
```

This shape is OWL 2 DL grammar BUT does NOT match the project's canonical RBox axiom interface declarations per `src/kernel/owl-types.ts`:
- `SubObjectPropertyOfAxiom` (lines 210-214) declares `subProperty: string` (single IRI; NO chain field)
- `ObjectPropertyChainAxiom` (lines 227-231) declares as a TOP-LEVEL `RBoxAxiom` union member with `chain: string[]` + `superProperty: string`

**Failure mode:** Lifter encountered the malformed shape, found `subProperty` undefined, called `canonicalizeIRI(undefined, prefixes)` → threw `IRIFormatError: "IRI must be a non-empty string"`. Both Step 6 fixtures threw at lift time; `determinism-100-run.test.js` failed (lifts every corpus fixture 100x); Step 6 activation tests blocked.

### 9.2 Disposition — pre-routing correction within open Pass 2b window per binding-immediately discipline + Q-4-Step6-A Pass 2b Banking 1

Both fixtures' RBox shapes amended pre-Pass-2b-commit:

```js
// BEFORE (malformed):
{ "@type": "SubObjectPropertyOf",
  subPropertyChain: { "@type": "ObjectPropertyChain", properties: [...] },
  superProperty: ... }

// AFTER (canonical per src/kernel/owl-types.ts:227-231):
{ "@type": "ObjectPropertyChain", chain: [...], superProperty: ... }
```

Both fixtures' audit-trail headers updated with corrective-sub-amendment entry per Q-4-Step5-A.1 four-contract consistency discipline. SME-domain mechanical fix per Q-4-Step6-A Pass 2b Banking 1 (Catch 5 disambiguation reuse — disciplines ratified at prior cycles operate immediately on subsequent findings without re-routing); the disambiguation reuse banking generalizes here from "ADR-registry conflation" to "type-field-structure conflation" as the structural discipline pattern.

**No architect routing required** — corrective sub-amendment within open Pass 2b window per established discipline.

### 9.3 Miss 2 + Catch 6 — production-history table extension

This finding surfaces as TWO entries in the verification ritual production-history (similar to Q-4-Step5-A Miss 1 + Catch 4 pattern):

- **Miss 2 — SME pre-routing ritual (2026-05-14):** Cat 5 + Cat 6 + Cat 8 categories did NOT catch the type-field-structure mismatch. The current ritual category coverage verifies @type STRINGS (does "SubObjectPropertyOf" exist as a canonical OWL @type? YES) but does NOT verify @type FIELD STRUCTURE (does the object's field shape — `subPropertyChain` field name + nested `properties` array — match the canonical interface declaration's field shape — `subProperty` field name as single string, NO chain support?). This is structurally analogous to the Q-4-Step5-A Miss 1 reference-existence-vs-reference-consistency boundary; here it's @type-existence-vs-@type-field-structure-consistency boundary.
- **Catch 6 — Developer Pass 2b verification ritual (2026-05-15):** Developer-side complementary discipline (running fixtures through lifter at activation time) caught the failure mode that SME pre-routing ritual missed. Mirrors Q-4-Step5-A Miss 1 + Catch 4 complementary-discipline pattern.

### 9.4 Cat 10 type-field-structure consistency candidacy — Phase 4 exit retro forward-track

**SIXTH Phase 4 exit retro forward-track candidate** banked at this corrective sub-amendment: **Cat 10 type-field-structure consistency** — for each @type-tagged object in path-fence-authored artifacts, verify the object's field shape matches the canonical interface declaration's field shape (per `src/kernel/owl-types.ts`, `src/kernel/fol-types.ts`, etc.). Structurally distinct from Cat 5 (verifies @type STRING exists) and Cat 6 (verifies manifest mirror of fixture's expectedOutcome) and Cat 9 candidacy (verifies cited-content consistency of references).

This is the SECOND verification ritual category-expansion candidate forward-tracked to Phase 4 exit retro (Cat 9 was the first; both are evidence-grounded by production misses per Q-4-Step5-A Banking 5 — verification ritual category-expansion candidates evidence-grounded by production misses forward-track to phase exit retro candidacy).

The architectural property: Cat 5 + Cat 6 + Cat 8 categories operate at @type-EXISTENCE granularity; Cat 9 + Cat 10 candidacies operate at @type-CONSISTENCY granularity (field-structure-consistency for Cat 10; cited-content-consistency for Cat 9). The pattern: verification ritual category coverage gaps surface as production misses; complementary disciplines (Developer-side implementation reconnaissance, fixture-lift-at-activation-time) catch what the ritual misses; the gap surfaces inform retro deliberation per Q-4-Step5-A Banking 5.

### 9.5 Updated production-history table (Catch 6 + Miss 2 banked at this corrective sub-amendment)

| Catch/Miss # | Cycle | Surface category | Cross-surface | Disposition | Failure-mode-class | Detection granularity | Trajectory phase |
|---|---|---|---|---|---|---|---|
| Catch 1 | Phase 3 Step 5 2026-05-08 | Cat 6 | single-surface | pre-routing | reference-non-existence | low | scope baseline |
| Catch 2 | Q-4-C amendment 2026-05-10 | Cat 5 | single-surface | pre-routing | type-system-vocabulary-misalignment | low | scope baseline |
| Catch 3 | Q-4-Step4-A 2026-05-11 | Cat 6 + Cat 8 | multi-surface | pre-routing + [VERIFY] | IRI-reuse-across-semantically-distinct-classes | medium | scope expansion |
| Miss 1 | Q-4-Step5-A surfacing 2026-05-14 | Cat 7 boundary | multi-surface (boundary) | Developer reconnaissance complementary catch | reference-existence-pass + reference-consistency-fail | boundary | (boundary surfacing — Cat 9 candidacy) |
| Catch 4 | Q-4-Step5-A 2026-05-14 | Cat 2 + Cat 7 + Cat 8 | multi-surface | pre-routing | ADR-registry-conflation (ADR-012 first instance) | high | granularity expansion |
| Catch 5 | Q-4-Step6-A 2026-05-14/15 | Cat 2 + Cat 7 + Cat 8 | multi-surface | pre-routing (discipline-reuse) | ADR-registry-conflation (ADR-011 SECOND INSTANCE) | high (repeated) | pattern-recognition expansion |
| **Miss 2** | **Q-4-Step6-A SME pre-routing ritual 2026-05-14** | **Cat 5/6/8 type-field-structure-consistency boundary** | **multi-surface (boundary)** | **Developer Pass 2b ritual complementary catch** | **type-field-structure-mismatch (SubObjectPropertyOf vs ObjectPropertyChain)** | **boundary** | **(SECOND boundary surfacing — Cat 10 candidacy)** |
| **Catch 6** | **Q-4-Step6-A Developer Pass 2b verification ritual 2026-05-15** | **Cat 8 (with Cat 5/6 boundary)** | **multi-surface (Developer-side)** | **pre-Pass-2b-commit correction within open window per Banking 1 reuse** | **type-field-structure-mismatch (RBox shape SubObjectPropertyOf with subPropertyChain field)** | **high** | **complementary-discipline expansion** |

**Trajectory phase summary updated post-Catch-6:**
- Phase 1: scope expansion (Catches 1-2 → 3) — single-surface to multi-surface
- Phase 2: granularity expansion (Catch 3 → 4) — Cat 6+8 to Cat 2+7+8
- Phase 3: pattern-recognition expansion (Catch 4 → 5) — first-instance to second-instance
- **Phase 4: complementary-discipline expansion (Miss 2 + Catch 6) — SME pre-routing ritual surfaces boundary; Developer-side complementary discipline catches at lift-at-activation-time; same pattern as Q-4-Step5-A Miss 1 + Catch 4 (Developer reconnaissance complementary catch on Cat 7 boundary; this cycle Developer Pass 2b ritual complementary catch on Cat 5/6/8 boundary)**

**Two complementary-discipline catches now banked** (Q-4-Step5-A: Developer reconnaissance; Q-4-Step6-A: Developer Pass 2b ritual). The pattern: SME pre-routing ritual operates within ritual category coverage; Developer-side disciplines (reconnaissance + activation-time ritual) operate at boundary surfaces beyond ritual coverage; together compose into overlapping coverage. Phase 4 exit retro deliberates whether the boundary surfaces should formalize as new ritual categories (Cat 9 + Cat 10) OR remain bounded-by-complementary-discipline.

### 9.6 Banking observation (verbal-pending Phase 4 exit doc-pass)

**Cat 8 production catch at Developer Pass 2b verification ritual cadence is the SECOND complementary-discipline catch in this engagement** (Q-4-Step5-A Catch 4 was the first via Developer reconnaissance; Q-4-Step6-A Catch 6 via Developer Pass 2b ritual run). The pattern: complementary-discipline catches operate at cycle phases distinct from SME pre-routing ritual cadence (reconnaissance is Developer-side at architectural-gap surfacing time; Pass 2b ritual run is Developer-side at activation-test time). Banking the cadence-distinct-complementary-discipline pattern: complementary disciplines catching ritual-boundary surfaces operate at multiple cadence phases (architectural-gap surfacing time + activation-test time + commit-readiness-verification time); each cadence's catches inform Phase 4 exit retro candidacy with cadence-specific evidence.

— SME, 2026-05-15 (Q-4-Step6-A Pass 2b corrective sub-amendment integration close)
