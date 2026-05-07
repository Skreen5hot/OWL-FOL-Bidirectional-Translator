/**
 * Round-trip parity validator (Phase 2 Step 7).
 *
 * Per API §6.3 + spec §8.1 parity criterion + spec §8.2 bidirectional check.
 *
 * The contract: given an input OWL ontology, lift it to FOL (F₁), project
 * back to OWL (G₂), re-lift the projection (F₃), and report whether F₃ ≡
 * F₁ modulo the Loss Signature ledger L. Phase 2 has no ARC content, so
 * F₂ = F₁ (no closure step).
 *
 * "Modulo L" interpretation (Phase 2 MVP): facts in F₁ but not F₃ are
 * tolerated when they appear in a Recovery Payload's `originalFOL` field
 * (the projector preserved them as audit-artifact metadata). Loss
 * Signatures alone do not absolve diffs — they signal information loss
 * but don't recover it. Recovery Payloads do.
 *
 * Bidirectional check per spec §8.2: both `missingFromOutput` (soundness
 * direction; F₁ \ F₃ minus L-recovered) and `extraInOutput` (no-fabrication
 * direction; F₃ \ F₁) must be empty for `equivalent === true`.
 *
 * Phase 2 scope:
 *   - No ARC closure (F₂ = F₁ at Phase 2)
 *   - No `closedPredicates` parameter (Phase 3 territory per API §6.3
 *     comment)
 *   - No external OWL reasoner (per spec §8.3 declined dependency)
 *   - No fault-isolation bisection (spec §8.4 deferred)
 *   - No coherence guard (spec §8.5 No-Collapse Guarantee deferred to
 *     Phase 3 evaluator activation)
 *
 * Phase 4+ refinements (forward-tracked):
 *   - F₂ = closure(F₁ ∪ ARC_axioms) when ARC content lands
 *   - regularityCheck for chain projections updated against import closure
 *     per architect Q-Step6-1 ruling
 */

import { stableStringify } from "./canonicalize.js";
import { owlToFol } from "./lifter.js";
import { folToOwl } from "./projector.js";
import { ARC_MANIFEST_VERSION } from "./version-constants.js";
import type { LifterConfig } from "./lifter.js";
import type { FOLAtom, FOLAxiom, FOLUniversal } from "./fol-types.js";
import type { OWLOntology } from "./owl-types.js";
import type {
  FOLConversionResult,
  FolToOwlConfig,
  RoundTripDiff,
  RoundTripResult,
} from "./projector-types.js";

/**
 * Round-trip an OWL ontology through `owlToFol → folToOwl → owlToFol` and
 * report parity per spec §8.1.
 *
 * The optional `config` flows through to both lifter and projector calls.
 * `prefixes` and source-ontology-IRI threading on the projector are
 * inferred from the input `ontology` automatically.
 */
export async function roundTripCheck(
  ontology: OWLOntology,
  config?: LifterConfig & FolToOwlConfig,
): Promise<RoundTripResult> {
  // F₁ = lift(G₁): the source FOL.
  const sourceFOL = await owlToFol(ontology, config);

  // Wrap into FOLConversionResult per API §6.1 / §6.3 contract. Phase 1
  // lifter doesn't emit audit artifacts; manufacture empty arrays +
  // minimal metadata. When the lifter is later refactored per the API
  // §6.1 FOLConversionResult contract, this wrapping logic moves there.
  const intermediateForm: FOLConversionResult = {
    axioms: sourceFOL,
    recoveryPayloads: [],
    lossSignatures: [],
    metadata: {
      sourceOntologyIRI: ontology.ontologyIRI,
      bnodeRegistry: new Map(),
      arcCoverage: config?.arcCoverage ?? "permissive",
      arcManifestVersion: config?.arcManifestVersion ?? ARC_MANIFEST_VERSION,
    },
  };

  // G₂ = project(F₂); F₂ = F₁ at Phase 2 (no ARC closure).
  const projConfig: FolToOwlConfig = {
    ...config,
    prefixes: config?.prefixes ?? ontology.prefixes,
    sourceOntologyIRI: config?.sourceOntologyIRI ?? ontology.ontologyIRI,
    sourceVersionIRI: config?.sourceVersionIRI ?? ontology.versionIRI,
    sourceGraphIRI: config?.sourceGraphIRI ?? ontology.ontologyIRI,
  };
  const finalForm = await folToOwl(sourceFOL, undefined, projConfig);

  // F₃ = lift(G₂): re-lift the projected ontology.
  const reLiftedFOL = await owlToFol(finalForm.ontology, config);

  // Compute set diff via stableStringify canonicalization.
  const sourceCanon = sourceFOL.map((a) => stableStringify(a));
  const reLiftedCanon = reLiftedFOL.map((a) => stableStringify(a));
  const sourceSet = new Set(sourceCanon);
  const reLiftedSet = new Set(reLiftedCanon);

  // Recovery Payload coverage — facts in F₁ that the projector preserved
  // as audit-artifact metadata are "modulo L" tolerated.
  const recoveredCanon = new Set(
    finalForm.newRecoveryPayloads.map((rp) => stableStringify(rp.originalFOL)),
  );

  const missingFromOutput: FOLAxiom[] = [];
  for (let i = 0; i < sourceFOL.length; i++) {
    const c = sourceCanon[i];
    if (reLiftedSet.has(c)) continue;
    if (recoveredCanon.has(c)) continue;
    missingFromOutput.push(sourceFOL[i]);
  }

  const extraInOutput: FOLAxiom[] = [];
  for (let i = 0; i < reLiftedFOL.length; i++) {
    if (!sourceSet.has(reLiftedCanon[i])) {
      extraInOutput.push(reLiftedFOL[i]);
    }
  }

  const equivalent = missingFromOutput.length === 0 && extraInOutput.length === 0;

  if (equivalent) {
    return { equivalent, intermediateForm, finalForm };
  }

  const classification = classifyDiff([...missingFromOutput, ...extraInOutput]);
  const diff: RoundTripDiff = {
    missingFromOutput,
    extraInOutput,
    classification,
  };
  return { equivalent, diff, intermediateForm, finalForm };
}

/**
 * Coarse FOL-shape classification per API §6.3. Examines the diff axioms
 * to bucket them into TBox / ABox / RBox / mixed:
 *   - ABox: bare fol:Atom (class assertion or property assertion shape)
 *   - TBox: fol:Universal whose body's atomic slots use unary atoms
 *     (class predicates)
 *   - RBox: fol:Universal whose body's atomic slots use binary atoms
 *     (property predicates)
 *   - mixed: otherwise (heterogeneous diff)
 */
function classifyDiff(axioms: FOLAxiom[]): RoundTripDiff["classification"] {
  if (axioms.length === 0) return "mixed";
  const buckets = new Set<RoundTripDiff["classification"]>();
  for (const a of axioms) {
    buckets.add(classifyOne(a));
  }
  if (buckets.size === 1) {
    const only = [...buckets][0];
    return only;
  }
  return "mixed";
}

function classifyOne(axiom: FOLAxiom): RoundTripDiff["classification"] {
  if (axiom["@type"] === "fol:Atom") return "abox";
  if (axiom["@type"] === "fol:Universal") {
    return universalArity(axiom);
  }
  // Equality / Existential / Disjunction / Conjunction / Negation / False
  // at the top level: not cleanly classifiable; bucket as mixed.
  return "mixed";
}

/**
 * Walk a fol:Universal stack to find the innermost atomic slot's arity:
 *   - All atomic slots unary → tbox (class-predicate shape)
 *   - All atomic slots binary → rbox (property-predicate shape)
 *   - Mixed → mixed
 */
function universalArity(u: FOLUniversal): RoundTripDiff["classification"] {
  const arities = new Set<"unary" | "binary" | "other">();
  walkAtomArities(u, arities);
  if (arities.size === 1) {
    const only = [...arities][0];
    if (only === "unary") return "tbox";
    if (only === "binary") return "rbox";
  }
  return "mixed";
}

function walkAtomArities(
  shape: unknown,
  out: Set<"unary" | "binary" | "other">,
): void {
  if (typeof shape !== "object" || shape === null) return;
  const obj = shape as { "@type"?: unknown };
  if (typeof obj["@type"] !== "string") return;
  switch (obj["@type"]) {
    case "fol:Atom": {
      const args = (obj as FOLAtom).arguments;
      if (Array.isArray(args)) {
        if (args.length === 1) out.add("unary");
        else if (args.length === 2) out.add("binary");
        else out.add("other");
      } else {
        out.add("other");
      }
      return;
    }
    case "fol:Universal":
    case "fol:Existential":
    case "fol:Negation":
      walkAtomArities((obj as { body?: unknown; inner?: unknown }).body, out);
      walkAtomArities((obj as { body?: unknown; inner?: unknown }).inner, out);
      return;
    case "fol:Implication":
      walkAtomArities((obj as { antecedent?: unknown }).antecedent, out);
      walkAtomArities((obj as { consequent?: unknown }).consequent, out);
      return;
    case "fol:Conjunction": {
      const cs = (obj as { conjuncts?: unknown }).conjuncts;
      if (Array.isArray(cs)) for (const c of cs) walkAtomArities(c, out);
      return;
    }
    case "fol:Disjunction": {
      const ds = (obj as { disjuncts?: unknown }).disjuncts;
      if (Array.isArray(ds)) for (const d of ds) walkAtomArities(d, out);
      return;
    }
    default:
      return;
  }
}
