/**
 * Phase 4 Step 3 — ARC Content Lift Correctness Tests.
 *
 * Per spec §3.4.1 + phase-4-entry.md §2.5 + §7 step ledger Step 3.
 *
 * Step 3 minimum-viable scope: parthood transitivity emission from
 * loaded ARC modules' ARCEntries with owlCharacteristics:
 * "owl:TransitiveProperty". The shape must match the lifter's
 * existing ObjectPropertyCharacteristic Transitive emission so the
 * FOL→Prolog translator's ADR-013 visited-ancestor cycle-guard
 * (Phase 3 Step 5) recognizes it via detectTransitivePredicate.
 *
 * Developer-side tests (corpus-side bfo_parthood_transitivity /
 * bfo_dependence_relations / bfo_realization_chain are step-N-bind
 * SME-domain authoring, dispatched separately).
 *
 * Verifies:
 *   - Loading BFO ARC + empty ontology emits exactly the transitivity
 *     rules for the 4 catalogue entries with TransitiveProperty
 *   - Each rule's FOL shape matches the canonical pattern (Universal
 *     ×3 → Implication, Conjunction body, same predicate IRI)
 *   - Predicate IRIs are canonicalized (prefix expansion against
 *     ontology.prefixes)
 *   - Output is deterministic (sorted by canonical IRI)
 *   - When arcModules is omitted, no ARC axioms are emitted (regression
 *     guard: existing tests don't see new axioms appear)
 *   - When arcModules names a non-registered id, that module is silently
 *     skipped (composition-layer is responsible for register-before-lift)
 *   - End-to-end: load BFO ARC + ABox declaring a parthood chain;
 *     evaluate() returns the expected transitive consequence
 *   - Permissive mode emits ARC axioms (independent of arcCoverage)
 *   - Strict mode + BFO-only input passes (positive control unchanged)
 */

import { strictEqual, ok } from "node:assert";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { owlToFol } from "../src/kernel/lifter.js";
import {
  registerARCModule,
  __resetARCModuleRegistryForTesting,
} from "../src/kernel/arc-module-registry.js";
import { emitARCAxioms } from "../src/kernel/arc-axiom-emitter.js";
import {
  createSession,
  __resetSessionCounterForTesting,
} from "../src/composition/session.js";
import {
  loadOntology,
  registerTauPrologFactory,
  __resetLoadOntologyCacheForTesting,
} from "../src/composition/load-ontology.js";
import { evaluate } from "../src/composition/evaluate.js";
import { registerTauPrologProbe } from "../src/kernel/tau-prolog-probe.js";
import type { OWLOntology } from "../src/kernel/owl-types.js";
import type {
  FOLAxiom,
  FOLAtom,
  FOLConjunction,
  FOLImplication,
  FOLUniversal,
} from "../src/kernel/fol-types.js";
import type { EvaluableQuery } from "../src/kernel/evaluate-types.js";
import pl from "tau-prolog";

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

const BFO_PFX = "http://purl.obolibrary.org/obo/";

async function loadBFOArcModule(): Promise<void> {
  const path = resolve(projectRoot, "arc", "core", "bfo-2020.json");
  const raw = await readFile(path, "utf-8");
  registerARCModule(JSON.parse(raw));
}

function primeTestEnv(): void {
  registerTauPrologProbe(() => "0.3.4");
  registerTauPrologFactory(() => pl.create(2000));
}

/**
 * Pattern-match a transitivity axiom against the canonical shape
 * (∀x,y,z. P(x,y) ∧ P(y,z) → P(x,z)). Returns the predicate IRI on
 * match, null otherwise.
 */
function asTransitivityAxiom(ax: FOLAxiom): string | null {
  // Walk three nested Universals.
  let inner: FOLAxiom = ax;
  const vars: string[] = [];
  for (let i = 0; i < 3; i++) {
    if ((inner as { "@type"?: unknown })["@type"] !== "fol:Universal") return null;
    const u = inner as FOLUniversal;
    vars.push(u.variable);
    inner = u.body;
  }
  if ((inner as { "@type"?: unknown })["@type"] !== "fol:Implication") return null;
  const impl = inner as FOLImplication;
  if ((impl.antecedent as { "@type"?: unknown })["@type"] !== "fol:Conjunction") return null;
  const conj = impl.antecedent as FOLConjunction;
  if (conj.conjuncts.length !== 2) return null;
  const a1 = conj.conjuncts[0];
  const a2 = conj.conjuncts[1];
  const c = impl.consequent;
  if (
    (a1 as { "@type"?: unknown })["@type"] !== "fol:Atom" ||
    (a2 as { "@type"?: unknown })["@type"] !== "fol:Atom" ||
    (c as { "@type"?: unknown })["@type"] !== "fol:Atom"
  ) {
    return null;
  }
  const a1a = a1 as FOLAtom;
  const a2a = a2 as FOLAtom;
  const ca = c as FOLAtom;
  if (a1a.predicate !== a2a.predicate || a1a.predicate !== ca.predicate) return null;
  return a1a.predicate;
}

async function main(): Promise<void> {
  __resetSessionCounterForTesting();
  __resetLoadOntologyCacheForTesting();
  __resetARCModuleRegistryForTesting();
  primeTestEnv();
  await loadBFOArcModule();

  // --- Pure emitter unit tests ---

  await checkAsync(
    "Step 3 / emitARCAxioms: BFO module emits 8 transitivity axioms (the catalogue's 8 owl:TransitiveProperty entries)",
    async () => {
      const path = resolve(projectRoot, "arc", "core", "bfo-2020.json");
      const bfo = JSON.parse(await readFile(path, "utf-8"));
      const axioms = emitARCAxioms([bfo]);
      // Filter to transitivity-shape only — emitARCAxioms also emits
      // disjointness axioms at Phase 4 Step 4 (Q-4-Step4-A pairwise
      // expansion); this test scopes the assertion to the transitivity
      // emission surface only.
      const transitive = axioms
        .map(asTransitivityAxiom)
        .filter((p): p is string => p !== null);
      strictEqual(transitive.length, 8);
      for (const pred of transitive) {
        ok(typeof pred === "string" && pred.length > 0);
      }
    }
  );

  await checkAsync(
    "Step 3 / emitARCAxioms: output is deterministic (sorted by canonical IRI)",
    async () => {
      const path = resolve(projectRoot, "arc", "core", "bfo-2020.json");
      const bfo = JSON.parse(await readFile(path, "utf-8"));
      const a = emitARCAxioms([bfo]);
      const b = emitARCAxioms([bfo]);
      strictEqual(JSON.stringify(a), JSON.stringify(b));
      // Verify sort order
      const preds = a.map((ax) => asTransitivityAxiom(ax)!);
      const sorted = [...preds].sort();
      strictEqual(JSON.stringify(preds), JSON.stringify(sorted));
    }
  );

  await checkAsync(
    "Step 3 / emitARCAxioms: empty modules array → empty axioms",
    async () => {
      const axioms = emitARCAxioms([]);
      strictEqual(axioms.length, 0);
    }
  );

  await checkAsync(
    "Step 3 / emitARCAxioms: module with no TransitiveProperty entries → empty",
    async () => {
      const axioms = emitARCAxioms([
        {
          "@type": "ARCModule",
          moduleId: "core/test-no-transitive",
          arcManifestVersion: "0.1.0",
          entries: [
            {
              "@type": "ARCEntry",
              name: "Plain",
              level: "Instance-level",
              context: "Test",
              notation: "—",
              formalDefinition: "—",
              owlCharacteristics: "—", // non-transitive
              owlRealization: "Test",
              subPropertyOf: "—",
              domain: "Thing",
              range: "Thing",
              iri: "http://example.org/test#plain",
              notes: "no characteristics",
            },
          ],
        },
      ]);
      strictEqual(axioms.length, 0);
    }
  );

  await checkAsync(
    "Step 3 / emitARCAxioms: canonicalizes prefixed IRIs against passed prefix map",
    async () => {
      const axioms = emitARCAxioms(
        [
          {
            "@type": "ARCModule",
            moduleId: "core/test-canon",
            arcManifestVersion: "0.1.0",
            entries: [
              {
                "@type": "ARCEntry",
                name: "Test Transitive",
                level: "Instance-level",
                context: "Test",
                notation: "—",
                formalDefinition: "—",
                owlCharacteristics: "owl:TransitiveProperty",
                owlRealization: "Test",
                subPropertyOf: "—",
                domain: "Thing",
                range: "Thing",
                iri: "obo:TestProp",
                notes: "",
              },
            ],
          },
        ],
        { obo: BFO_PFX }
      );
      strictEqual(axioms.length, 1);
      const pred = asTransitivityAxiom(axioms[0]);
      strictEqual(pred, BFO_PFX + "TestProp");
    }
  );

  // --- Lifter integration ---

  await checkAsync(
    "Step 3 / lifter: empty input ontology + arcModules:['core/bfo-2020'] yields the 8 transitivity rules",
    async () => {
      const ontology: OWLOntology = {
        ontologyIRI: "http://example.org/test/empty-with-bfo",
        prefixes: { obo: BFO_PFX },
        tbox: [],
        abox: [],
        rbox: [],
      };
      const axioms = await owlToFol(ontology, { arcModules: ["core/bfo-2020"] });
      // All 4 emitted axioms should be transitivity rules.
      const transitive = axioms
        .map(asTransitivityAxiom)
        .filter((p): p is string => p !== null);
      strictEqual(transitive.length, 8);
    }
  );

  await checkAsync(
    "Step 3 / lifter: arcModules NOT declared → no ARC-derived axioms emitted (regression guard)",
    async () => {
      const ontology: OWLOntology = {
        ontologyIRI: "http://example.org/test/empty-no-arc",
        prefixes: {},
        tbox: [],
        abox: [],
        rbox: [],
      };
      const axioms = await owlToFol(ontology);
      strictEqual(axioms.length, 0);
    }
  );

  await checkAsync(
    "Step 3 / lifter: arcModules names UNREGISTERED id → silently skipped (no throw, no ARC axioms)",
    async () => {
      const ontology: OWLOntology = {
        ontologyIRI: "http://example.org/test/empty-unregistered",
        prefixes: {},
        tbox: [],
        abox: [],
        rbox: [],
      };
      const axioms = await owlToFol(ontology, {
        arcModules: ["core/never-registered"],
      });
      strictEqual(axioms.length, 0);
    }
  );

  await checkAsync(
    "Step 3 / lifter: ARC-derived axioms append AFTER input axioms (source-order discipline)",
    async () => {
      const SUB = "http://example.org/test/source-order";
      const ontology: OWLOntology = {
        ontologyIRI: SUB,
        prefixes: { obo: BFO_PFX, ex: SUB + "/" },
        tbox: [],
        abox: [
          {
            "@type": "ClassAssertion",
            class: { "@type": "Class", iri: SUB + "/Thing" },
            individual: SUB + "/x",
          },
        ],
        rbox: [],
      };
      const axioms = await owlToFol(ontology, { arcModules: ["core/bfo-2020"] });
      // First axiom should be the input-derived ClassAssertion atom.
      ok(axioms.length >= 9);
      const first = axioms[0] as FOLAtom;
      strictEqual(first["@type"], "fol:Atom");
      // Remaining axioms are ARC-derived (8 transitivity rules + N
      // pairwise disjointness axioms from the BFO Disjointness Map per
      // Phase 4 Step 4). Source-order discipline: ARC-derived axioms
      // append AFTER the single input-derived axiom; assert that the
      // input atom isn't intermixed with ARC-derived axioms (the
      // input atom is at index 0 only).
      for (let i = 1; i < axioms.length; i++) {
        const t = (axioms[i] as { "@type"?: unknown })["@type"];
        ok(
          t === "fol:Universal",
          `axioms[${i}]: ARC-derived axioms are all fol:Universal-rooted (transitivity or disjointness); got ${String(t)}`
        );
      }
    }
  );

  await checkAsync(
    "Step 3 / lifter: strict mode + BFO-only input + arcModules:['core/bfo-2020'] → no throw + ARC axioms emitted (positive control)",
    async () => {
      const BEARER_OF = BFO_PFX + "BFO_0000196";
      const ontology: OWLOntology = {
        ontologyIRI: "http://example.org/test/strict-bfo-with-arc",
        prefixes: { obo: BFO_PFX },
        tbox: [],
        abox: [
          {
            "@type": "ObjectPropertyAssertion",
            property: BEARER_OF,
            source: "http://example.org/test/x",
            target: "http://example.org/test/y",
          },
        ],
        rbox: [],
      };
      const axioms = await owlToFol(ontology, {
        arcCoverage: "strict",
        arcModules: ["core/bfo-2020"],
      });
      const transitive = axioms
        .map(asTransitivityAxiom)
        .filter((p): p is string => p !== null);
      strictEqual(transitive.length, 8);
    }
  );

  // --- End-to-end: loadOntology + evaluate against parthood chain ---

  await checkAsync(
    "Step 3 / end-to-end: load BFO ARC + Continuant Part Of chain in ABox; evaluate transitive consequence returns 'true'",
    async () => {
      __resetSessionCounterForTesting();
      __resetLoadOntologyCacheForTesting();
      __resetARCModuleRegistryForTesting();
      primeTestEnv();
      await loadBFOArcModule();

      const CONT_PART_OF = BFO_PFX + "BFO_0000176"; // verified in catalogue + owl:TransitiveProperty
      const PFX = "http://example.org/test/parthood/";
      const A = PFX + "a";
      const B = PFX + "b";
      const C = PFX + "c";

      const session = createSession({ arcModules: ["core/bfo-2020"] });
      const ontology: OWLOntology = {
        ontologyIRI: "http://example.org/test/parthood-chain",
        prefixes: { obo: BFO_PFX, ex: PFX },
        tbox: [],
        abox: [
          {
            "@type": "ObjectPropertyAssertion",
            property: CONT_PART_OF,
            source: A,
            target: B,
          },
          {
            "@type": "ObjectPropertyAssertion",
            property: CONT_PART_OF,
            source: B,
            target: C,
          },
        ],
        rbox: [],
      };
      await loadOntology(session, ontology);

      // Direct fact should be true.
      const directQuery: EvaluableQuery = {
        "@type": "fol:Atom",
        predicate: CONT_PART_OF,
        arguments: [
          { "@type": "fol:Constant", iri: A },
          { "@type": "fol:Constant", iri: B },
        ],
      };
      const direct = await evaluate(session, directQuery);
      strictEqual(direct.result, "true", "direct fact A→B should be true");

      // Transitive consequence (A part_of B + B part_of C ⊨ A part_of C)
      // must succeed via the ARC-emitted transitivity rule + ADR-013
      // cycle-guard.
      const transitiveQuery: EvaluableQuery = {
        "@type": "fol:Atom",
        predicate: CONT_PART_OF,
        arguments: [
          { "@type": "fol:Constant", iri: A },
          { "@type": "fol:Constant", iri: C },
        ],
      };
      const trans = await evaluate(session, transitiveQuery);
      strictEqual(
        trans.result,
        "true",
        "transitive consequence A→C should be true via ARC-emitted transitivity"
      );
    }
  );

  console.log("");
  console.log(`  ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
