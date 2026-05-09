/**
 * OFBT Package Public Barrel
 *
 * Top-level entry point for `import { ... } from "@ontology-of-freedom/ofbt"`.
 *
 * Re-exports across layers:
 *   - Kernel (errors, reason codes, version surface, transform/canonicalize)
 *   - Composition (session lifecycle, configuration types)
 *
 * Adapters (CLI, future HTTP wrappers, compatibility shim) are NOT
 * re-exported from here — they ship as separate package entry points or
 * separate npm packages per the architect's adapter-vs-kernel ruling.
 *
 * Phase 1 adds the lifter (owlToFol) re-export from the kernel layer.
 */

// Whole-namespace re-exports keep the barrel narrow; consumers can also
// reach individual submodules via the package.json `exports` map for
// finer-grained tree-shaking.
export * from "./kernel/index.js";
export {
  createSession,
  disposeSession,
} from "./composition/session.js";
export type {
  Session,
  LifterConfiguration,
  SessionConfiguration,
} from "./composition/session.js";

// Phase 3 Step 1b: evaluate() composition-layer wrapper per API §7.1.
// Kernel-pure types + validateEvaluableQuery re-export via the kernel barrel.
export { evaluate } from "./composition/evaluate.js";

// Phase 3 Step 3: loadOntology composition function per API §5.5.
// Lifts the ontology, translates FOL→Prolog per ADR-007 §11, asserts
// clauses into the session's Tau Prolog state. Source kernel-pure
// translator re-exports via the kernel barrel.
export { loadOntology, registerTauPrologFactory } from "./composition/load-ontology.js";
export type {
  LoadOntologyResult,
  TauPrologFactory,
} from "./composition/load-ontology.js";

// Phase 3 Step 6: checkConsistency composition function per API §8.1.
// Three-state ConsistencyResult per Q-3-Step6-A option (α) editorial
// correction; No-Collapse Guarantee surface per spec §8.5;
// unverifiedAxioms honest-admission surface per API §8.1.1.
export { checkConsistency } from "./composition/check-consistency.js";
export type {
  ConsistencyResult,
  InconsistencyWitness,
} from "./composition/check-consistency.js";
