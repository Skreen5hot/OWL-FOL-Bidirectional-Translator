/**
 * Type declarations for the SME-authored _stub-evaluator.js. The harness
 * lives in tests/corpus/ (SME path domain per AUTHORING_DISCIPLINE Section
 * 0); this declaration file lets TypeScript test files import it
 * type-safely without the JS source needing JSDoc-derived types.
 */

import type { FOLAxiom } from "../../src/kernel/fol-types.js";

export type StubResult = "true" | "false" | "undetermined";

export interface StubOptions {
  closedPredicates?: ReadonlyArray<string>;
}

export class UnsupportedHarnessFeatureError extends Error {
  feature: string;
  constructor(feature: string);
}

/**
 * Synchronous, in-process query evaluator over a FOL state per the
 * Phase 2 entry packet §3.4 contract. See _stub-evaluator.js's leading
 * JSDoc for the architect-ratified capability table.
 */
export function evaluateStub(
  folState: FOLAxiom[],
  query: unknown,
  options?: StubOptions,
): StubResult;
