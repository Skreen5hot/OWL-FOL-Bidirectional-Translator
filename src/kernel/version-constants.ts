/**
 * Library Version Constants
 *
 * Single-source-of-truth constants used by both the typed error classes
 * (errors.ts) and the public version-surfacing API (version.ts).
 *
 * Kept in a separate module to avoid a circular dependency between
 * errors.ts and version.ts (errors carry libraryVersion; version-info
 * may eventually need to surface error-class metadata).
 *
 * The values MUST stay in sync with package.json `version` and the
 * frozen API spec version.
 */

export const LIBRARY_VERSION = "0.1.0";
export const API_SPEC_VERSION = "0.1.7";
export const TAU_PROLOG_PINNED_VERSION = "0.3.4";
export const ARC_MANIFEST_VERSION = "0.1.0";
