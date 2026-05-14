/**
 * ARC Axiom Emitter — Phase 4 Step 3 (per spec §3.4.1 + phase-4-entry.md
 * §2.5 + §7 step ledger Step 3).
 *
 * Kernel-pure emission of FOL axioms derived from loaded ARC modules.
 * Called by the lifter (src/kernel/lifter.ts) after the input ontology's
 * own axioms have been lifted; the resulting ARC-derived axioms are
 * appended to the lifter output so the FOL state held in the session
 * reflects both the input and the loaded ARC commitments.
 *
 * Step 3 minimum-viable scope (per phase-4-entry.md §2.5 + the v0.1
 * BFO catalogue's actual content):
 *
 *   - **Parthood transitivity** + other Transitive properties — for each
 *     ARCEntry with `owlCharacteristics: "owl:TransitiveProperty"`, emit
 *     the classical FOL transitivity rule:
 *
 *       ∀x,y,z. P(x,y) ∧ P(y,z) → P(x,z)
 *
 *     The shape matches what `liftRBoxAxiom` produces for the OWL
 *     `ObjectPropertyCharacteristic(P, Transitive)` axiom at
 *     lifter.ts:800. This is load-bearing: the FOL→Prolog translator's
 *     ADR-013 visited-ancestor cycle-guard (Phase 3 Step 5) recognizes
 *     this exact shape via `detectTransitivePredicate` and emits the
 *     cycle-guarded clause set automatically.
 *
 * Step 3 explicitly OUT OF SCOPE (forward-tracked):
 *
 *   - Domain/range axioms from ARCEntry.domain / .range. The v0.1
 *     catalogue stores these as prose names ("Independent Continuant")
 *     rather than IRIs; lifting them would require a separate
 *     class-name → IRI map. Routed to a future-step authoring or
 *     ARC-schema enrichment cycle.
 *   - Subproperty hierarchies from ARCEntry.subPropertyOf. All v0.1
 *     BFO entries declare `"—"` (no parent). Activates if/when a future
 *     ARC module declares a subproperty graph.
 *   - Property characteristics beyond Transitive (Symmetric, Functional,
 *     InverseFunctional, etc.). Not present in v0.1 BFO catalogue;
 *     would extend trivially when needed.
 *
 * Determinism: emitted axioms are sorted by canonicalized predicate IRI
 * for byte-stable output across runs.
 *
 * Pure: no Date, no random, no I/O. Pure structural transform from
 * ARCModule[] to FOLAxiom[].
 */

import type { ARCModule, DisjointnessAxiom } from "./arc-types.js";
import type {
  FOLAtom,
  FOLAxiom,
  FOLConjunction,
  FOLFalse,
  FOLImplication,
  FOLUniversal,
  FOLVariable,
} from "./fol-types.js";
import { canonicalizeIRI } from "./iri.js";

function variable(name: string): FOLVariable {
  return { "@type": "fol:Variable", name };
}

function atom(predicate: string, args: FOLVariable[]): FOLAtom {
  return { "@type": "fol:Atom", predicate, arguments: args };
}

function conjunction(conjuncts: FOLAxiom[]): FOLConjunction {
  return { "@type": "fol:Conjunction", conjuncts };
}

function implication(antecedent: FOLAxiom, consequent: FOLAxiom): FOLImplication {
  return { "@type": "fol:Implication", antecedent, consequent };
}

function universal(varName: string, body: FOLAxiom): FOLUniversal {
  return { "@type": "fol:Universal", variable: varName, body };
}

/**
 * Build the canonical transitivity-axiom FOL shape:
 *   ∀x,y,z. P(x,y) ∧ P(y,z) → P(x,z)
 *
 * Identical structure to the lifter's `ObjectPropertyCharacteristic`
 * Transitive case (lifter.ts:800-825) — same variable names "x", "y",
 * "z", same triple-nested Universal, same Conjunction-then-Implication
 * shape. This identity is load-bearing for ADR-013's
 * `detectTransitivePredicate` recognition.
 */
function falsum(): FOLFalse {
  return { "@type": "fol:False" };
}

/**
 * Phase 4 Step 4 (Q-4-Step4-A.1): build one pairwise binary disjointness
 * axiom from two class IRIs:
 *
 *   ∀x. C₁(x) ∧ C₂(x) → False
 *
 * Identical shape to the lifter's `DisjointWith` emission
 * (lifter.ts:587-604) — single Universal binding "x" + Implication
 * with Conjunction body + fol:False consequent. This identity is
 * load-bearing for Step 7's `isFalseHeadAxiom` recognition + Skolem-
 * witness inconsistency-proof firing on the lifted ABox.
 */
function pairwiseDisjointnessAxiom(class1IRI: string, class2IRI: string): FOLUniversal {
  const x = variable("x");
  return universal(
    "x",
    implication(
      conjunction([atom(class1IRI, [x]), atom(class2IRI, [x])]),
      falsum()
    )
  );
}

function transitivityAxiom(propIRI: string): FOLUniversal {
  const x = variable("x");
  const y = variable("y");
  const z = variable("z");
  return universal(
    "x",
    universal(
      "y",
      universal(
        "z",
        implication(
          conjunction([atom(propIRI, [x, y]), atom(propIRI, [y, z])]),
          atom(propIRI, [x, z])
        )
      )
    )
  );
}

/**
 * Emit the FOL axioms derived from the given loaded ARC modules.
 *
 * At Step 3 minimum: walks every ARCEntry across the modules; for any
 * entry whose `owlCharacteristics` field contains the literal
 * "owl:TransitiveProperty", emits the classical transitivity rule
 * with the entry's canonicalized IRI as the predicate.
 *
 * Output is sorted by canonicalized predicate IRI for byte-stable
 * determinism across runs + accumulation orderings.
 *
 * The caller (lifter.ts) is responsible for concatenating the result
 * onto the input-derived axioms. Source-order discipline: ARC-derived
 * axioms append AFTER input-derived axioms so the canonical output
 * always reads input-first.
 */
export function emitARCAxioms(
  modules: ReadonlyArray<ARCModule>,
  prefixes?: Record<string, string>
): FOLAxiom[] {
  // Collect (sortKey, axiom) pairs first; sort; then strip the sort key
  // for the return value. Sort key composition: "<emission-class>::<iri-or-pair>"
  // — emission-class prefix ('transitive', 'disjoint') keeps the two
  // emission surfaces partitioned in deterministic output, with within-
  // class ordering by canonical IRI / IRI-pair.
  const collected: Array<{ key: string; axiom: FOLAxiom }> = [];
  for (const m of modules) {
    // (1) Property-characteristic emission per Step 3 (Transitive only at
    // v0.1 minimum).
    for (const entry of m.entries) {
      if (typeof entry.iri !== "string" || entry.iri.length === 0) continue;
      if (entry.owlCharacteristics === "owl:TransitiveProperty") {
        const canonical = canonicalizeIRI(entry.iri, prefixes);
        collected.push({
          key: "transitive::" + canonical,
          axiom: transitivityAxiom(canonical),
        });
      }
    }
    // (2) Phase 4 Step 4 (Q-4-Step4-A.1): disjointness emission per the
    // optional `disjointnessAxioms` field. For each N-ary axiom, expand
    // pairwise to N(N-1)/2 binary `∀x. Cᵢ(x) ∧ Cⱼ(x) → False` axioms
    // (i < j enumeration). Validator at arc-validation.ts guards
    // N ≥ 2 + IRI well-formedness; emitter trusts those invariants and
    // skips defensively-malformed entries (length < 2 or non-string).
    const disjointnessAxioms = m.disjointnessAxioms;
    if (Array.isArray(disjointnessAxioms)) {
      for (const ax of disjointnessAxioms as DisjointnessAxiom[]) {
        if (!Array.isArray(ax.classes) || ax.classes.length < 2) continue;
        const canonicalIRIs: string[] = [];
        for (const iri of ax.classes) {
          if (typeof iri === "string" && iri.length > 0) {
            canonicalIRIs.push(canonicalizeIRI(iri, prefixes));
          }
        }
        if (canonicalIRIs.length < 2) continue;
        for (let i = 0; i < canonicalIRIs.length; i++) {
          for (let j = i + 1; j < canonicalIRIs.length; j++) {
            // Stable pair-ordering: lexicographically smaller IRI first
            // so the emitted axiom shape is deterministic across input
            // orderings of `classes`. (Architect Q-4-Step4-A.1 ratifies
            // pairwise expansion semantics; pair-internal ordering is an
            // emitter implementation choice that we lock to lex-order
            // for byte-stability.)
            const a = canonicalIRIs[i];
            const b = canonicalIRIs[j];
            const lo = a < b ? a : b;
            const hi = a < b ? b : a;
            collected.push({
              key: "disjoint::" + lo + "::" + hi,
              axiom: pairwiseDisjointnessAxiom(lo, hi),
            });
          }
        }
      }
    }
  }
  collected.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  return collected.map((c) => c.axiom);
}
