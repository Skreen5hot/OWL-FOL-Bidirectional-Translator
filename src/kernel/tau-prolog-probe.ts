/**
 * Tau Prolog Probe
 *
 * Internal seam for reading the loaded Tau Prolog version.
 *
 * Phase 0 deliverable, supporting verifyTauPrologVersion() (API spec §9.2)
 * and createSession()'s internal version check (§13.7.2).
 *
 * Lookup order:
 *   1. Explicitly registered probe (registerTauPrologProbe), if set
 *   2. globalThis.pl?.version — Tau Prolog's browser/global registration
 *   3. null — no Tau Prolog detected
 *
 * Phase 0 cannot rely on the peer-dep being installed in this repo's
 * own test environment. The probe seam lets tests register a stub
 * version without requiring the actual tau-prolog package to be present.
 *
 * Pure: no Date, no random, no I/O. Reads only from a module-local
 * registration slot and globalThis.
 */

export type TauPrologProbe = () => string | null;

let registeredProbe: TauPrologProbe | null = null;

/**
 * Register a probe that returns the loaded Tau Prolog version, or null.
 *
 * Intended for two callers:
 *   (a) Test harnesses injecting a known version
 *   (b) Node ESM consumers who load tau-prolog explicitly and want
 *       to bind it to OFBT without relying on globalThis.pl
 *
 * Calling with `null` clears any previously registered probe.
 */
export function registerTauPrologProbe(probe: TauPrologProbe | null): void {
  registeredProbe = probe;
}

/**
 * Read the currently-detected Tau Prolog version, or null if not detectable.
 */
export function readTauPrologVersion(): string | null {
  if (registeredProbe) {
    try {
      return registeredProbe();
    } catch {
      return null;
    }
  }

  // Fallback: globalThis.pl is Tau Prolog's standard browser registration.
  const g = globalThis as { pl?: { version?: string } };
  if (g.pl && typeof g.pl.version === "string") {
    return g.pl.version;
  }

  return null;
}
