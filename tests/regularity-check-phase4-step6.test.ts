/**
 * Phase 4 Step 6 — regularityCheck activation tests.
 *
 * Per Q-4-Step6-A architect ratification 2026-05-14/15 + Pass 2b commit
 * (this commit) + phase-4-entry.md §7 step ledger Step 6 deliverable:
 * "regularityCheck(A, importClosure) machinery per spec §6.2.1 + Phase 2
 * Step 6 forward-track closure; regularity_scope_warning cleared for
 * chains regularity-confirmed under loaded BFO ARC import closure."
 *
 * Activates two corpus fixtures (step-N-bind):
 *
 *   1. regularity_check_clears_warning — chain over non-transitive roles
 *      (bearer_of ∘ has_participant). regularityCheck returns
 *      'regularity-certified'; projector OMITS the
 *      regularity_scope_warning from the emitted RecoveryPayload's
 *      scopeNotes.
 *
 *   2. regularity_check_keeps_warning — chain containing transitive roles
 *      (continuant_part_of ∘ has_continuant_part). regularityCheck returns
 *      'cannot-certify'; projector EMITS the regularity_scope_warning
 *      (Phase 2 baseline preserved).
 *
 * Sub-option α minimum-viable certification per Q-4-Step6-A.1.1: chain
 * regularity-certified iff no role's owlCharacteristics in loaded ARC
 * content includes "owl:TransitiveProperty". Spec-formally-correct anchor
 * per Horrocks, Kutz, and Sattler (2007). Forward-track to full SROIQ at
 * v0.2 ELK closure path per project/v0.2-roadmap.md v0.2-09.
 *
 * Q-4-Step6-A.4 boundary: this test exercises ONLY the warning emission
 * control surface. The Step 8 fall-through-to-Annotated-Approximation
 * path is structurally distinct (separate strategy router concern).
 */

import { strictEqual, ok } from "node:assert";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { folToOwl } from "../src/kernel/projector.js";
import {
  registerARCModule,
  __resetARCModuleRegistryForTesting,
} from "../src/kernel/arc-module-registry.js";
import { registerTauPrologProbe } from "../src/kernel/tau-prolog-probe.js";
import {
  regularityCheck,
  type RegularityCheckResult,
} from "../src/kernel/arc-vocabulary.js";
import type { ARCModule } from "../src/kernel/arc-types.js";
import type { FOLAxiom } from "../src/kernel/fol-types.js";
import type { RecoveryPayload } from "../src/kernel/projector-types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..", "..");

let passed = 0;
let failed = 0;

async function checkAsync(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(" ", e instanceof Error ? e.message : String(e));
    failed++;
  }
}

async function loadBFOArcModule(): Promise<void> {
  const path = resolve(projectRoot, "arc", "core", "bfo-2020.json");
  registerARCModule(JSON.parse(await readFile(path, "utf-8")));
}

const REGULARITY_WARNING_NEEDLE = "regularity_scope_warning";

const BFO_BEARER_OF = "http://purl.obolibrary.org/obo/BFO_0000196"; // non-transitive
const BFO_HAS_PARTICIPANT = "http://purl.obolibrary.org/obo/BFO_0000057"; // non-transitive
const BFO_CONTINUANT_PART_OF = "http://purl.obolibrary.org/obo/BFO_0000176"; // owl:TransitiveProperty
const BFO_HAS_CONTINUANT_PART = "http://purl.obolibrary.org/obo/BFO_0000178"; // owl:TransitiveProperty

async function main(): Promise<void> {
  __resetARCModuleRegistryForTesting();
  registerTauPrologProbe(() => "0.3.4");
  await loadBFOArcModule();

  const path = resolve(projectRoot, "arc", "core", "bfo-2020.json");
  const bfoModule = JSON.parse(await readFile(path, "utf-8")) as ARCModule;

  // -----------------------------------------------------------
  // regularityCheck pure unit tests
  // -----------------------------------------------------------

  await checkAsync(
    "Step 6 / regularityCheck: chain over non-transitive BFO roles → 'regularity-certified'",
    async () => {
      const result: RegularityCheckResult = regularityCheck(
        [BFO_BEARER_OF, BFO_HAS_PARTICIPANT],
        [bfoModule]
      );
      strictEqual(result, "regularity-certified");
    }
  );

  await checkAsync(
    "Step 6 / regularityCheck: chain containing one BFO transitive role → 'cannot-certify'",
    async () => {
      const result: RegularityCheckResult = regularityCheck(
        [BFO_CONTINUANT_PART_OF, BFO_HAS_CONTINUANT_PART],
        [bfoModule]
      );
      strictEqual(result, "cannot-certify");
    }
  );

  await checkAsync(
    "Step 6 / regularityCheck: empty modules array → 'regularity-certified' (no transitive roles known)",
    async () => {
      const result = regularityCheck(
        [BFO_CONTINUANT_PART_OF, BFO_HAS_CONTINUANT_PART],
        []
      );
      strictEqual(result, "regularity-certified");
    }
  );

  await checkAsync(
    "Step 6 / regularityCheck: chain with role NOT in loaded modules → 'regularity-certified' (treats unknown as non-transitive)",
    async () => {
      const result = regularityCheck(["http://example.org/some/unknownProp"], [bfoModule]);
      strictEqual(result, "regularity-certified");
    }
  );

  await checkAsync(
    "Step 6 / regularityCheck: short-circuits on first transitive role (mixed chain)",
    async () => {
      // First role transitive — should immediately return cannot-certify
      // even though second role is non-transitive.
      const result = regularityCheck(
        [BFO_CONTINUANT_PART_OF, BFO_BEARER_OF],
        [bfoModule]
      );
      strictEqual(result, "cannot-certify");
    }
  );

  await checkAsync(
    "Step 6 / regularityCheck: substring-match accommodates multi-characteristic strings (non-transitive entry with comma list still passes)",
    async () => {
      // Connected With has owlCharacteristics: "owl:SymmetricProperty, owl:ReflexiveProperty"
      // (no Transitive substring) — should certify.
      const CCO_CONNECTED_WITH = "https://www.commoncoreontologies.org/ont00001810";
      const result = regularityCheck([CCO_CONNECTED_WITH], [bfoModule]);
      strictEqual(result, "regularity-certified");
    }
  );

  // -----------------------------------------------------------
  // Projector end-to-end activation tests
  // -----------------------------------------------------------

  // -----------------------------------------------------------
  // Synthetic end-to-end activation (FOL-direct chain construction
  // bypasses lifter per Phase 2 Step 6 test pattern in
  // projector-phase2.test.ts:2293+). The lifter currently noops on
  // ObjectPropertyChain RBox input (lifter.ts:747 "deferred. Phase 1");
  // matchPropertyChain in the projector identifies chains from the FOL
  // universal-implication shape, not from RBox round-trip. These
  // synthetic tests construct the canonical chain FOL directly and pass
  // to folToOwl, validating the Step 6 emission-control surface.
  // -----------------------------------------------------------

  /**
   * Build the canonical chain FOL shape per spec §6.1.2 / projector-
   * phase2.test.ts:2293+ canonical example:
   *   ∀x,y,z. P1(x, y) ∧ P2(y, z) → Q(x, z)
   */
  function chainFOL(p1IRI: string, p2IRI: string, qIRI: string): FOLAxiom {
    return {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Universal",
        variable: "y",
        body: {
          "@type": "fol:Universal",
          variable: "z",
          body: {
            "@type": "fol:Implication",
            antecedent: {
              "@type": "fol:Conjunction",
              conjuncts: [
                {
                  "@type": "fol:Atom",
                  predicate: p1IRI,
                  arguments: [
                    { "@type": "fol:Variable", name: "x" },
                    { "@type": "fol:Variable", name: "y" },
                  ],
                },
                {
                  "@type": "fol:Atom",
                  predicate: p2IRI,
                  arguments: [
                    { "@type": "fol:Variable", name: "y" },
                    { "@type": "fol:Variable", name: "z" },
                  ],
                },
              ],
            },
            consequent: {
              "@type": "fol:Atom",
              predicate: qIRI,
              arguments: [
                { "@type": "fol:Variable", name: "x" },
                { "@type": "fol:Variable", name: "z" },
              ],
            },
          },
        },
      },
    };
  }

  async function projectFOLChainAndFindRP(
    folChainAxiom: FOLAxiom,
    config?: { arcModules?: string[]; prefixes?: Record<string, string> }
  ): Promise<RecoveryPayload | null> {
    const result = await folToOwl([folChainAxiom], undefined, config);
    const chainRPs = result.newRecoveryPayloads.filter(
      (rp: RecoveryPayload) => rp.approximationStrategy === "PROPERTY_CHAIN"
    );
    return chainRPs.length > 0 ? chainRPs[0] : null;
  }

  await checkAsync(
    "Step 6 / synthetic e2e: chain over non-transitive roles + arcModules loaded → RecoveryPayload OMITS regularity_scope_warning",
    async () => {
      const SYNTHETIC_Q = "http://example.org/test/step6/bearerHasParticipant";
      const rp = await projectFOLChainAndFindRP(
        chainFOL(BFO_BEARER_OF, BFO_HAS_PARTICIPANT, SYNTHETIC_Q),
        { arcModules: ["core/bfo-2020"] }
      );
      if (rp === null) throw new Error("chain RecoveryPayload not emitted");
      const scopeNotes = rp.scopeNotes ?? [];
      const hasWarning = scopeNotes.some((note: string) =>
        note.includes(REGULARITY_WARNING_NEEDLE)
      );
      ok(
        !hasWarning,
        `regularity_scope_warning MUST be omitted (chain over non-transitive roles); scopeNotes: ${JSON.stringify(scopeNotes)}`
      );
    }
  );

  await checkAsync(
    "Step 6 / synthetic e2e: chain containing transitive roles + arcModules loaded → RecoveryPayload INCLUDES regularity_scope_warning (Phase 2 baseline preserved)",
    async () => {
      const SYNTHETIC_Q = "http://example.org/test/step6/partOfHasPart";
      const rp = await projectFOLChainAndFindRP(
        chainFOL(BFO_CONTINUANT_PART_OF, BFO_HAS_CONTINUANT_PART, SYNTHETIC_Q),
        { arcModules: ["core/bfo-2020"] }
      );
      if (rp === null) throw new Error("chain RecoveryPayload not emitted");
      const scopeNotes = rp.scopeNotes ?? [];
      const hasWarning = scopeNotes.some((note: string) =>
        note.includes(REGULARITY_WARNING_NEEDLE)
      );
      ok(
        hasWarning,
        `regularity_scope_warning MUST be present (chain over transitive roles → cannot-certify); scopeNotes: ${JSON.stringify(scopeNotes)}`
      );
    }
  );

  await checkAsync(
    "Step 6 / synthetic e2e: no arcModules declared → regularity_scope_warning ALWAYS present (Phase 2 baseline regression guard)",
    async () => {
      const SYNTHETIC_Q = "http://example.org/test/step6/noArc";
      // Same chain over non-transitive roles, but NO arcModules in config.
      // Phase 2 baseline path: warning emitted regardless of role
      // characteristics.
      const rp = await projectFOLChainAndFindRP(
        chainFOL(BFO_BEARER_OF, BFO_HAS_PARTICIPANT, SYNTHETIC_Q)
      );
      if (rp === null) throw new Error("chain RecoveryPayload not emitted");
      const scopeNotes = rp.scopeNotes ?? [];
      const hasWarning = scopeNotes.some((note: string) =>
        note.includes(REGULARITY_WARNING_NEEDLE)
      );
      ok(
        hasWarning,
        "regularity_scope_warning present without arcModules (Phase 2 baseline)"
      );
    }
  );

  console.log("");
  console.log(`  ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
