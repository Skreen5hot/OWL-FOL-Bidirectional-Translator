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
// API_SPEC_VERSION bumped 0.1.7 → 0.1.8 at Phase 3 Step 8 implementation
// cycle 2026-05-09 per Q-3-Step8-A routing option 1 (proceed under
// Step 6 Finding 4 pre-ratification). The bump reflects the additive
// REASON_CODES extension (structural_annotation_mismatch) per API §11.2
// minor-version-bump discipline.
export const API_SPEC_VERSION = "0.1.8";
export const TAU_PROLOG_PINNED_VERSION = "0.3.4";
export const ARC_MANIFEST_VERSION = "0.1.0";
