/**
 * Version Surfacing
 *
 * Per API spec §9. Two sync entry points:
 *   - getVersionInfo()         — three-version surface (lib, conv, tau-prolog) + ARC + apiSpec
 *   - verifyTauPrologVersion() — fail-fast peer-dep check returning a discriminating result
 *
 * Both are sync. Per spec §9.2 ("Why sync"): both read pre-loaded module
 * state, never perform I/O, never await.
 */

import {
  LIBRARY_VERSION,
  API_SPEC_VERSION,
  TAU_PROLOG_PINNED_VERSION,
  ARC_MANIFEST_VERSION,
} from "./version-constants.js";
import { readTauPrologVersion } from "./tau-prolog-probe.js";

/**
 * The conversion-rules version is separately bumped from the library version
 * so that DP-2 records can detect conversion-semantics drift (Fandaws Consumer
 * Requirement §6.1.1). Phase 0 ships v0.1.0 = baseline.
 */
const CONVERSION_RULES_VERSION = "0.1.0";

export interface VersionInfo {
  libraryVersion: string;
  conversionRulesVersion: string;
  tauPrologVersion: string;
  arcManifestVersion: string;
  buildTimestamp?: string;
  apiSpecVersion: string;
}

export interface TauPrologVerification {
  match: boolean;
  expected: string;
  found: string | null;
}

/**
 * Returns the documented version surface per API spec §9.1.
 *
 * The reported `tauPrologVersion` is the **pinned** version OFBT requires;
 * to detect what the consumer actually loaded, call verifyTauPrologVersion().
 *
 * `buildTimestamp` is intentionally omitted in published builds per §9.1.1
 * (the production package is reproducible byte-for-byte; embedding a
 * timestamp would defeat that). Development builds may set it via a
 * separate build-time injection step (not part of Phase 0).
 */
export function getVersionInfo(): VersionInfo {
  return {
    libraryVersion: LIBRARY_VERSION,
    conversionRulesVersion: CONVERSION_RULES_VERSION,
    tauPrologVersion: TAU_PROLOG_PINNED_VERSION,
    arcManifestVersion: ARC_MANIFEST_VERSION,
    apiSpecVersion: API_SPEC_VERSION,
    // buildTimestamp intentionally omitted in published builds (§9.1.1)
  };
}

/**
 * Sync fail-fast check that the loaded Tau Prolog version matches the pinned
 * version. Returns a discriminating result rather than throwing — consumers
 * decide their failure mode.
 *
 * Internally called by createSession(); a mismatch there throws
 * TauPrologVersionMismatchError per API spec §10.7 / §13.7.2.
 */
export function verifyTauPrologVersion(): TauPrologVerification {
  const found = readTauPrologVersion();
  return {
    match: found === TAU_PROLOG_PINNED_VERSION,
    expected: TAU_PROLOG_PINNED_VERSION,
    found,
  };
}
