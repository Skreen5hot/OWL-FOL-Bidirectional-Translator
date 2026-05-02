/**
 * Phase 1 Lifter Test Helpers
 *
 * Extracted from tests/lifter-phase1.test.ts at Step 5 entry per the
 * architect's O3 ruling. Shared assertion machinery for the Phase 1
 * fixture runner; consumed by lifter-phase1.test.ts and (when needed)
 * future test files in the same domain.
 *
 * Three primary helpers:
 *   - assertForbiddenPatterns(lifted, patterns) — used by canary fixtures
 *     whose intent is "the wrong shape MUST be absent" (e.g.,
 *     canary_domain_range_existential's existential-synthesis patterns).
 *   - assertRequiredPattern(lifted, pattern, description) — symmetric
 *     counterpart used by Step 4+'s identity-machinery checks where the
 *     lifter must inject specific axioms (e.g., per-predicate identity-
 *     rewrite rules) but the canary fixtures don't carry explicit
 *     expectedFOL.
 *   - assertExpectedQueries(expectedQueries, evaluate | null) — wired for
 *     Phase 4 cross-phase activation; no-ops in Phase 1 per the helper's
 *     null-evaluator contract.
 *
 * The structural-pattern matcher (subtreeMatchesAnywhere + matchesShape) is
 * shared between assertForbiddenPatterns and assertRequiredPattern. A
 * pattern is a partial FOLAxiom-shaped object; matchesShape requires
 * every key the pattern declares to be matched, with extra keys in the
 * lifted subtree permitted.
 */

/**
 * Assert that NONE of the given forbidden FOL patterns is structurally
 * present anywhere in the lifted FOL state.
 */
export function assertForbiddenPatterns(
  lifted: unknown,
  forbiddenPatterns: Array<{ description: string; pattern: unknown }>
): void {
  if (!Array.isArray(forbiddenPatterns)) {
    throw new Error(
      "assertForbiddenPatterns: forbiddenPatterns must be an array (got " +
        typeof forbiddenPatterns +
        ")"
    );
  }
  for (const fp of forbiddenPatterns) {
    if (subtreeMatchesAnywhere(lifted, fp.pattern)) {
      throw new Error(
        `Forbidden FOL pattern present in lifted state: ${fp.description}`
      );
    }
  }
}

/**
 * Assert that AT LEAST ONE subtree of the lifted FOL state structurally
 * matches the required pattern. Failure message includes `description`
 * for diagnostic context.
 */
export function assertRequiredPattern(
  lifted: unknown,
  pattern: unknown,
  description: string
): void {
  if (pattern === undefined || pattern === null) {
    throw new Error(
      "assertRequiredPattern: pattern argument must not be null/undefined (got " +
        String(pattern) +
        ")"
    );
  }
  if (!subtreeMatchesAnywhere(lifted, pattern)) {
    throw new Error(
      `Required FOL pattern absent from lifted state: ${description}`
    );
  }
}

/**
 * Assert that the expected-query expectations from a canary fixture hold
 * against an evaluator. Phase 1 has no evaluator (Phase 3 deliverable);
 * this helper is wired now so canary fixtures whose `expectedQueries`
 * field activates at Phase 4 (cross-phase activation per architect Gap C
 * resolution) can use it without inventing assertion machinery on the
 * day. Pass null for `evaluate` in Phase 1 — helper no-ops.
 */
export async function assertExpectedQueries(
  expectedQueries: Array<{
    query: string;
    expectedResult: string;
    reason?: string;
    note?: string;
  }>,
  evaluate:
    | ((query: string) => Promise<{ result: string; reason?: string }>)
    | null
): Promise<void> {
  if (evaluate === null) return;
  for (const eq of expectedQueries) {
    const r = await evaluate(eq.query);
    if (r.result !== eq.expectedResult) {
      throw new Error(
        `Query "${eq.query}" returned result "${r.result}", expected "${eq.expectedResult}"${eq.note ? ` (${eq.note})` : ""}`
      );
    }
    if (eq.reason !== undefined && r.reason !== eq.reason) {
      throw new Error(
        `Query "${eq.query}" returned reason "${r.reason}", expected "${eq.reason}"`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Internal: structural pattern matching
// ---------------------------------------------------------------------------

export function subtreeMatchesAnywhere(node: unknown, pattern: unknown): boolean {
  if (matchesShape(node, pattern)) return true;
  if (Array.isArray(node)) {
    return node.some((child) => subtreeMatchesAnywhere(child, pattern));
  }
  if (node !== null && typeof node === "object") {
    return Object.values(node as Record<string, unknown>).some((child) =>
      subtreeMatchesAnywhere(child, pattern)
    );
  }
  return false;
}

export function matchesShape(node: unknown, pattern: unknown): boolean {
  if (pattern === undefined) return true;
  if (pattern === null) return node === null;
  if (typeof pattern !== "object") return node === pattern;
  if (Array.isArray(pattern)) {
    if (!Array.isArray(node)) return false;
    if (node.length < pattern.length) return false;
    return pattern.every((p, i) => matchesShape(node[i], p));
  }
  if (node === null || typeof node !== "object") return false;
  return Object.keys(pattern as Record<string, unknown>).every((k) =>
    matchesShape(
      (node as Record<string, unknown>)[k],
      (pattern as Record<string, unknown>)[k]
    )
  );
}
