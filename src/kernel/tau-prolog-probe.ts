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
 * pl.version shape: Tau Prolog 0.3.x exposes pl.version as an object
 * `{ major, minor, patch, status }` (see node_modules/tau-prolog/modules/
 * core.js line ~4). Older internal builds returned a plain string. The
 * fallback handles both shapes; status (e.g. "beta") is dropped to keep
 * the comparison key as the pinned "M.m.p" form.
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
  // pl.version is an object { major, minor, patch, status } in 0.3.x;
  // earlier internal builds returned a string. Handle both — drop status
  // so the comparison key is the pinned "M.m.p" form.
  const g = globalThis as {
    pl?: {
      version?:
        | string
        | { major?: number; minor?: number; patch?: number; status?: string };
    };
  };
  const v = g.pl?.version;
  if (typeof v === "string") {
    return v;
  }
  if (
    v &&
    typeof v === "object" &&
    typeof v.major === "number" &&
    typeof v.minor === "number" &&
    typeof v.patch === "number"
  ) {
    return `${v.major}.${v.minor}.${v.patch}`;
  }

  return null;
}
