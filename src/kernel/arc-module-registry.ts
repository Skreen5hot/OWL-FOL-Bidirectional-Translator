/**
 * ARC Module Registry — Phase 4 Step 1 (per spec §3.6.2 +
 * phase-4-entry.md §7 step ledger).
 *
 * Kernel-pure registration seam for ARC modules. Composition / adapter
 * layers parse JSON files from `arc/core/` and register the resulting
 * ARCModule objects here; the lifter (Phase 4 Step 3+) consults the
 * registry by `moduleId` when the caller declares `arcModules` in
 * SessionConfiguration / LifterConfiguration.
 *
 * Architectural pattern: mirrors `tau-prolog-probe.ts`. Kernel itself
 * has no filesystem I/O capability (Layer 0 purity); the registry
 * exposes a slot the composition / adapter layer populates before the
 * lifter runs. The registry IS module-local state — call
 * `__resetARCModuleRegistryForTesting()` between test runs to avoid
 * leakage.
 *
 * All registrations are structurally validated per
 * `arc-validation.ts` `validateARCModule()` before they enter the
 * registry; the register function throws on invalid input. This
 * preserves the invariant that any module the lifter consults is
 * structurally well-formed (semantic validation routes to Step 2+).
 *
 * Pure: no Date, no random, no I/O. Reads only from a module-local
 * Map; writes only via the explicit register / reset entry points.
 */

import type { ARCModule } from "./arc-types.js";
import { validateARCModule } from "./arc-validation.js";

const registeredModules = new Map<string, ARCModule>();

/**
 * Register an ARC module into the kernel-pure registry. The module is
 * structurally validated before insertion; throws when validation
 * fails with the collected errors as the message.
 *
 * Re-registration with the same `moduleId` replaces the prior entry
 * (overwrite semantics) — consumers needing append-only behavior
 * should check membership via `getARCModule()` first.
 */
export function registerARCModule(value: unknown): void {
  const result = validateARCModule(value);
  if (!result.valid) {
    throw new Error(
      "registerARCModule: invalid ARC module:\n  " +
        result.errors.join("\n  ")
    );
  }
  registeredModules.set(result.module.moduleId, result.module);
}

/**
 * Look up a registered ARC module by `moduleId`. Returns `null` when
 * no module is registered under that id.
 */
export function getARCModule(moduleId: string): ARCModule | null {
  const m = registeredModules.get(moduleId);
  return m === undefined ? null : m;
}

/**
 * Return the list of currently-registered module ids in sorted order.
 * Deterministic for the canonicalization invariant; consumers iterating
 * the registry should rely on this rather than `Map.keys()` directly.
 */
export function listRegisteredARCModules(): string[] {
  return Array.from(registeredModules.keys()).sort((a, b) =>
    a < b ? -1 : a > b ? 1 : 0
  );
}

/**
 * Reset the registry. Intended ONLY for test harnesses; calling this
 * in production drops all loaded ARC modules and would corrupt
 * subsequent lifter calls.
 */
export function __resetARCModuleRegistryForTesting(): void {
  registeredModules.clear();
}
