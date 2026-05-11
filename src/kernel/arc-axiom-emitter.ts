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

import type { ARCModule } from "./arc-types.js";
import type {
  FOLAtom,
  FOLAxiom,
  FOLConjunction,
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
  // Collect (canonicalIRI, axiom) pairs first; sort; then strip the
  // sort key for the return value.
  const collected: Array<{ key: string; axiom: FOLAxiom }> = [];
  for (const m of modules) {
    for (const entry of m.entries) {
      if (typeof entry.iri !== "string" || entry.iri.length === 0) continue;
      // Property-characteristic emission (Step 3 minimum: Transitive only).
      // The catalogue stores characteristics as a free-text field per the
      // upstream convention; we match the exact `"owl:TransitiveProperty"`
      // marker. Future characteristics would extend this switch.
      if (entry.owlCharacteristics === "owl:TransitiveProperty") {
        const canonical = canonicalizeIRI(entry.iri, prefixes);
        collected.push({ key: canonical, axiom: transitivityAxiom(canonical) });
      }
    }
  }
  collected.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  return collected.map((c) => c.axiom);
}
