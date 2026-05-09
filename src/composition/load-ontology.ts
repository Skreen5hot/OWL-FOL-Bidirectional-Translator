/**
 * Phase 3 Step 3 — loadOntology composition function per API §5.5.
 *
 * Per architect Q-3-Step3-A ratification 2026-05-09 (architectural-gap
 * micro-cycle):
 *
 *   "Top-level async loadOntology(session, ontology, config?) composition
 *    function. ADR-019 + API §5.1 + API §6.1 contracts preserve."
 *
 * Composes the pure owlToFol (API §6.1) with session-state mutation:
 * lifts the ontology, translates the lifted FOL state to Prolog clauses
 * per ADR-007 §11, asserts them into the session's Tau Prolog session.
 *
 * Per API §5.5 contract:
 *   - Idempotency: byte-identical ontology re-loaded → no-op (alreadyLoaded)
 *   - Multi-ontology accumulation determinism: order-independent set of
 *     loaded clauses per Q-3-Step3-A refinement 2
 *   - Throws SessionRequiredError / SessionDisposedError; propagates
 *     owlToFol errors (UnsupportedConstructError / IRIFormatError etc.)
 *
 * Layer note: this lives in src/composition/ per the architect's purity
 * ruling. The kernel-pure FOL→Prolog translator lives in
 * src/kernel/fol-to-prolog.ts; the composition layer owns the Tau Prolog
 * session lifecycle + clause assertion.
 */

import { owlToFol } from "../kernel/lifter.js";
import {
  translateFOLToPrologClauses,
  type PrologTranslation,
} from "../kernel/fol-to-prolog.js";
import { stableStringify } from "../kernel/canonicalize.js";
import {
  SessionRequiredError,
  SessionDisposedError,
} from "../kernel/errors.js";
import type { OWLOntology } from "../kernel/owl-types.js";
import type { FOLAxiom } from "../kernel/fol-types.js";
import type { LifterConfiguration, Session } from "./session.js";

/**
 * The result of a loadOntology call per API §5.5.
 *
 * Extends the lifter's FOLConversionResult shape with two
 * loadOntology-specific fields:
 *   - axiomsAsserted: number of FOL axioms translated to Prolog clauses
 *     and asserted into the session's Tau Prolog state. May be 0 if the
 *     idempotency contract triggered (alreadyLoaded === true).
 *   - alreadyLoaded: true if the byte-identical ontology was already
 *     loaded into this session (idempotency no-op per API §5.5).
 *
 * The other fields (axioms, recoveryPayloads, lossSignatures, metadata)
 * mirror the FOLConversionResult shape from owlToFol per API §6.1.
 */
export interface LoadOntologyResult {
  axioms: FOLAxiom[];
  recoveryPayloads: ReadonlyArray<unknown>;
  lossSignatures: ReadonlyArray<unknown>;
  metadata: {
    sourceOntologyIRI?: string;
    arcCoverage?: "strict" | "permissive";
    arcManifestVersion?: string;
  };
  axiomsAsserted: number;
  alreadyLoaded: boolean;
}

/**
 * Per-session cache of the LoadOntologyResult for content-hash → result
 * mapping. The idempotency contract per API §5.5 requires that a second
 * loadOntology call with the byte-identical ontology returns the cached
 * result (alreadyLoaded:true / axiomsAsserted:0).
 *
 * The cache is keyed by session.id + content hash to avoid cross-session
 * leakage. WeakMap on Session would be cleaner but Session lifetime is
 * already bounded by createSession/disposeSession, so a simple module-
 * local Map keyed by `${sessionId}::${contentHash}` is sufficient.
 *
 * disposeSession does not need to clear this cache; entries are reachable
 * only via the session.id and the session is no longer usable post-dispose.
 */
const ontologyResultCache = new Map<string, LoadOntologyResult>();

/**
 * Tau Prolog session factory probe. The composition layer asks this probe
 * for a fresh Tau Prolog session whenever a session needs one (typically
 * on first loadOntology call).
 *
 * Lookup order mirrors the version probe in src/kernel/tau-prolog-probe.ts:
 *   1. Explicitly registered factory probe (registerTauPrologFactory)
 *   2. globalThis.pl.create — Tau Prolog's standard browser registration
 *   3. throws — no Tau Prolog runtime detectable
 *
 * Tests register a stub factory; production code uses globalThis.pl.create.
 */
export type TauPrologFactory = () => unknown;

let registeredFactory: TauPrologFactory | null = null;

/**
 * Register a Tau Prolog session factory. Calling with `null` clears.
 *
 * Test harnesses register a stub factory returning a mock Prolog session
 * with .consult / .query / .answer methods; production code uses the
 * globalThis.pl.create fallback.
 */
export function registerTauPrologFactory(factory: TauPrologFactory | null): void {
  registeredFactory = factory;
}

function allocateTauPrologSession(): unknown {
  if (registeredFactory) {
    return registeredFactory();
  }
  const g = globalThis as { pl?: { create?: (limit?: number) => unknown } };
  if (g.pl && typeof g.pl.create === "function") {
    return g.pl.create();
  }
  throw new Error(
    "loadOntology requires a Tau Prolog runtime. Either install tau-prolog@0.3.4 as a peer dependency (so globalThis.pl is available) or register a TauPrologFactory probe via registerTauPrologFactory()."
  );
}

/**
 * Async loadOntology per API §5.5.
 *
 * Workflow:
 *   1. Validate session lifecycle (SessionRequiredError / SessionDisposedError)
 *   2. Compute content hash via stableStringify(ontology) for idempotency
 *   3. If hash already in session.loadedOntologyHashes → return cached
 *      LoadOntologyResult with alreadyLoaded:true
 *   4. Lift ontology via owlToFol (pure; propagates lifter errors)
 *   5. Translate lifted FOL state via translateFOLToPrologClauses (pure)
 *   6. Allocate Tau Prolog session lazily on first call
 *   7. assertz each Prolog clause into the session via a single consult call
 *   8. Update session state (loadedOntologyHashes + cumulativeAxioms)
 *   9. Cache the result + return
 */
export async function loadOntology(
  session: Session | null | undefined,
  ontology: OWLOntology,
  config?: LifterConfiguration
): Promise<LoadOntologyResult> {
  // --- Session lifecycle gates per API §5.4 ---
  if (session === null || session === undefined) {
    throw new SessionRequiredError("loadOntology");
  }
  if (session.disposed) {
    throw new SessionDisposedError(
      "loadOntology() called against a disposed session. Create a new session via createSession() before loading."
    );
  }

  // --- Idempotency check per API §5.5 ---
  // Content hash via stableStringify (deterministic, content-addressed
  // per spec §0.1 + API §6.1.1 byte-stability contract).
  const contentHash = await sha256Hex(stableStringify(ontology));
  const cacheKey = session.id + "::" + contentHash;
  if (session.loadedOntologyHashes.has(contentHash)) {
    // Re-load no-op per API §5.5 idempotency contract.
    const cached = ontologyResultCache.get(cacheKey);
    if (cached !== undefined) {
      return { ...cached, alreadyLoaded: true, axiomsAsserted: 0 };
    }
    // Defensive: hash present but cache missing (shouldn't happen unless
    // someone mutated the session externally). Re-derive minimal result.
    return {
      axioms: [],
      recoveryPayloads: [],
      lossSignatures: [],
      metadata: { sourceOntologyIRI: ontology.ontologyIRI },
      axiomsAsserted: 0,
      alreadyLoaded: true,
    };
  }

  // --- Lift ontology (pure; propagates lifter errors per API §5.5 throws) ---
  const folAxioms = await owlToFol(ontology, config);

  // --- Translate FOL → Prolog clauses per ADR-007 §11 (pure) ---
  // The translator emits sorted clauses for multi-ontology accumulation
  // determinism per Q-3-Step3-A refinement 2.
  const translation: PrologTranslation = translateFOLToPrologClauses(folAxioms);

  // --- Allocate Tau Prolog session lazily on first loadOntology call ---
  if (session.tauPrologSession === null) {
    session.tauPrologSession = allocateTauPrologSession();
  }
  const tps = session.tauPrologSession as {
    consult: (
      program: string,
      options?: {
        file?: boolean;
        url?: boolean;
        html?: boolean;
        script?: boolean;
        text?: boolean;
        success?: () => void;
        error?: (err: unknown) => void;
      }
    ) => unknown;
  };

  // --- Assert clauses via Tau Prolog consult ---
  // Tau Prolog's consult parses + asserts a Prolog program string. We
  // build a single program from all clauses and consult once per
  // loadOntology call. Empty clause set short-circuits.
  //
  // The default consult options enable file/url/html/script paths which
  // trigger async fs/XHR/DOM lookups before falling through to text-path
  // parsing — that races our subsequent evaluate() calls. We pass
  // explicit `{ file: false, url: false, html: false, script: false }`
  // to force the text path (synchronous parseProgram inside the
  // success callback), and promisify the success/error callbacks so
  // the await fence guarantees consult-completion before this function
  // returns. Per Tau Prolog source code (modules/core.js Thread.consult
  // ~line 2785-2845): without these options, fs.readFile fires first
  // in node and parseProgram runs inside its callback.
  if (translation.clauses.length > 0) {
    const program = translation.clauses.join("\n");
    await new Promise<void>((resolve, reject) => {
      tps.consult(program, {
        file: false,
        url: false,
        html: false,
        script: false,
        text: true,
        success: () => resolve(),
        error: (err) => reject(err instanceof Error ? err : new Error(String(err))),
      });
    });
  }

  // --- Update session state ---
  session.loadedOntologyHashes.add(contentHash);
  // cumulativeAxioms accumulates the lifted FOL axioms across loadOntology
  // calls per the multi-ontology semantics. Used by evaluate() +
  // checkConsistency() for surfacing context (e.g., unverifiedAxioms).
  for (const ax of folAxioms) {
    (session.cumulativeAxioms as FOLAxiom[]).push(ax);
  }

  // --- Build + cache result ---
  const result: LoadOntologyResult = {
    axioms: folAxioms,
    recoveryPayloads: [],
    lossSignatures: [],
    metadata: {
      sourceOntologyIRI: ontology.ontologyIRI,
      arcCoverage: config?.arcCoverage,
      arcManifestVersion: config?.arcManifestVersion,
    },
    axiomsAsserted: translation.clauses.length,
    alreadyLoaded: false,
  };
  ontologyResultCache.set(cacheKey, result);
  return result;
}

/**
 * Compute a hex SHA-256 hash of a UTF-8 string via the Web Crypto subtle
 * digest. Same primitive ADR-011's content-addressed @id discipline uses;
 * shared mechanism keeps determinism across the codebase.
 *
 * Async because crypto.subtle.digest is async.
 */
async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(hashBuffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i].toString(16);
    hex += b.length === 1 ? "0" + b : b;
  }
  return hex;
}

// Internal export for test reset between runs.
export function __resetLoadOntologyCacheForTesting(): void {
  ontologyResultCache.clear();
  registeredFactory = null;
}

// Re-export the FOL-translation surface for downstream use; provides
// callers a single import for the loadOntology composition without needing
// to reach into the kernel directly.
export {
  translateFOLToPrologClauses,
  translateEvaluableQueryToPrologGoal,
} from "../kernel/fol-to-prolog.js";
export type {
  PrologTranslation,
  SkippedAxiom,
} from "../kernel/fol-to-prolog.js";
