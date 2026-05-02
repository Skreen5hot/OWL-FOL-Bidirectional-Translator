/**
 * Session Lifecycle (Composition Layer)
 *
 * Per API spec §5. Sessions are caller-owned, explicitly created, and
 * explicitly disposed. No module-level state. No implicit session.
 *
 * Phase 0 ships skeletons:
 *   - createSession(): allocates session state and verifies the Tau Prolog
 *     peer dep up-front; throws TauPrologVersionMismatchError on mismatch.
 *   - disposeSession(): releases resources; idempotent on already-disposed
 *     sessions; throws SessionRequiredError on null/undefined.
 *
 * Phase 1+ wires actual Tau Prolog session allocation, ARC manifest
 * loading, blank-node registry, audit ledger, and aggregate step counter.
 *
 * Layer note: this lives in src/composition/ per the architect's ruling.
 * Lifter/projector/validator code in src/kernel/ never imports from here.
 */

import {
  SessionRequiredError,
  TauPrologVersionMismatchError,
} from "../kernel/errors.js";
import { verifyTauPrologVersion } from "../kernel/version.js";
import { ARC_MANIFEST_VERSION } from "../kernel/version-constants.js";

// --- Types (per API spec §2.0, §2.1) ---

export interface LifterConfiguration {
  arcCoverage?: "strict" | "permissive";
  structuralAnnotations?: Set<string>;
  arcManifestVersion?: string;
  arcModules?: string[];
  emitLossSignaturesToConsole?: boolean;
}

export interface SessionConfiguration extends LifterConfiguration {
  maxAggregateSteps?: number;
  persistLedger?: string;
}

/**
 * Opaque session handle. Internal shape may evolve across phases;
 * consumers must treat it as a black-box value passed through OFBT calls.
 *
 * Phase 0 fields:
 *   - id: deterministic-ish stable identifier (derived from a per-process
 *     counter, NOT timestamp/random — keeps determinism for trace-comparison
 *     within a single process even though IDs are NOT cross-process stable)
 *   - disposed: marker flag flipped by disposeSession
 *   - config: frozen snapshot of the SessionConfiguration the session was created with
 *   - aggregateSteps: running counter for SessionStepCapExceededError checks
 *
 * Phase 1+ adds: tauPrologSession, arcManifest, bnodeRegistry, auditLedger.
 */
export interface Session {
  readonly id: string;
  disposed: boolean;
  readonly config: Readonly<SessionConfiguration>;
  aggregateSteps: number;
}

// Module-local per-process session counter. Not a singleton holding
// session state — just a monotonic id-source. Reset on module reload.
let sessionCounter = 0;

/**
 * Create a new session.
 *
 * Verifies the Tau Prolog peer dependency synchronously per API spec §13.7.2;
 * a mismatch throws TauPrologVersionMismatchError before any allocation.
 *
 * Sync per API spec §5.1.
 */
export function createSession(config: SessionConfiguration = {}): Session {
  const tpv = verifyTauPrologVersion();
  if (!tpv.match) {
    throw new TauPrologVersionMismatchError(
      `Tau Prolog peer dependency mismatch: expected ${tpv.expected}, found ${tpv.found ?? "(not loaded)"}.`,
      {
        expected: tpv.expected,
        found: tpv.found,
        resolution:
          "Install tau-prolog@" +
          tpv.expected +
          " as a peer dependency, or register a probe via registerTauPrologProbe() pointing at your loaded copy.",
      }
    );
  }

  sessionCounter += 1;
  const id = `ofbt-session-${sessionCounter}`;

  const frozenConfig: Readonly<SessionConfiguration> = Object.freeze({
    arcCoverage: config.arcCoverage ?? "permissive",
    structuralAnnotations: config.structuralAnnotations
      ? new Set(config.structuralAnnotations)
      : new Set<string>(),
    arcManifestVersion: config.arcManifestVersion ?? ARC_MANIFEST_VERSION,
    arcModules: config.arcModules ? [...config.arcModules] : undefined,
    emitLossSignaturesToConsole: config.emitLossSignaturesToConsole ?? false,
    maxAggregateSteps: config.maxAggregateSteps,
    persistLedger: config.persistLedger,
  });

  return {
    id,
    disposed: false,
    config: frozenConfig,
    aggregateSteps: 0,
  };
}

/**
 * Dispose a session. Idempotent on already-disposed sessions.
 *
 * Throws SessionRequiredError on null / undefined per API spec §5.2's
 * "symmetric with the rest of the API" guarantee — consumers using
 * generic OFBTError catching catch this case without a separate
 * TypeError handler.
 *
 * Phase 1+ will release Tau Prolog state, audit ledger, ARC manifest
 * references, and bnode registry. Phase 0 simply flips the disposed flag.
 */
export function disposeSession(session: Session | null | undefined): void {
  if (session === null || session === undefined) {
    throw new SessionRequiredError("disposeSession");
  }
  if (session.disposed) {
    return; // idempotent
  }
  session.disposed = true;
  session.aggregateSteps = 0;
}

/**
 * Internal helper used by Phase 0 tests to reset the session counter
 * between test runs so id strings are predictable. NOT exported from
 * the package entry point.
 *
 * Phase 1+ will likely retire this in favor of dependency-injection
 * patterns for the id source.
 */
export function __resetSessionCounterForTesting(): void {
  sessionCounter = 0;
}
