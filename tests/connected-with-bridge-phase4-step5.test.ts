/**
 * Phase 4 Step 5 — Connected With bridge axioms activation tests.
 *
 * Per Q-4-Step5-A architect ratification 2026-05-14 + Pass 2b commit
 * 0a09e43 (schema + 3 spec-literal bridge axioms + Connected With
 * ARCEntry) + phase-4-entry.md §7 step ledger Step 5 deliverable:
 * "Connected With as primitive + bridge axiom per spec §3.4.1 +
 * activation of canary_connected_with_overlap fixture."
 *
 * Activates the wrong-translation canary end-to-end against the
 * Pass 2b infrastructure — no new architectural changes; pure
 * activation against the schema + emitter landed at 0a09e43.
 *
 * Verifies the fixture's 4 requiredPatterns + 1 forbiddenPattern:
 *   1. Connected With present as primitive binary atom
 *   2. Reflexivity: ∀x. C(x, x)
 *   3. Symmetry: ∀x,y. C(y, x) → C(x, y)
 *   4. Parthood-extension: ∀x,y,z. P(x, y) ∧ C(z, x) → C(z, y)
 *   5. (FORBIDDEN) Reverse-direction connected_with → overlaps
 *      (the defined-as-overlap collapse the canary guards against)
 *
 * Q-4-Step5-A.4 Developer reconnaissance findings:
 *   - lifter.ts:849 Symmetric case fires only on input ontology
 *     ObjectPropertyCharacteristic axioms (not on ARC entries'
 *     owlCharacteristics text field)
 *   - lifter.ts:868 Reflexive explicitly NOT implemented (noop)
 *   - arc-axiom-emitter.ts only matches exact "owl:TransitiveProperty"
 *     from ARC entries; doesn't parse Symmetric/Reflexive
 *   - bridgeAxioms is the SOLE emission surface for Connected With's
 *     symmetry + reflexivity in v0.1
 *   - NO double-emission risk; Q-4-Step5-B contingency NOT triggered
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
import { registerTauPrologProbe } from "../src/kernel/tau-prolog-probe.js";
import type {
  FOLAtom,
  FOLAxiom,
  FOLConjunction,
  FOLImplication,
  FOLUniversal,
  FOLVariable,
} from "../src/kernel/fol-types.js";
import type { OWLOntology } from "../src/kernel/owl-types.js";
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

const CCO_CONNECTED_WITH = "https://www.commoncoreontologies.org/ont00001810";
const BFO_CONTINUANT_PART_OF = "http://purl.obolibrary.org/obo/BFO_0000176";
const RO_OVERLAPS = "http://purl.obolibrary.org/obo/RO_0002131";

interface CorpusFixture {
  input: OWLOntology;
  loadOntologyConfig?: { arcModules?: string[] };
}

async function loadCorpus<T>(filename: string): Promise<T> {
  const path = resolve(projectRoot, "tests", "corpus", filename);
  await readFile(path, "utf-8");
  const url = "file:///" + path.replace(/\\/g, "/");
  const mod = (await import(url)) as { fixture: T };
  return mod.fixture;
}

async function loadBFOArcModule(): Promise<void> {
  const path = resolve(projectRoot, "arc", "core", "bfo-2020.json");
  registerARCModule(JSON.parse(await readFile(path, "utf-8")));
}

/** Strip 0+ outer fol:Universal wrappers, returning the innermost body. */
function stripUniversals(ax: FOLAxiom): FOLAxiom {
  let cur: FOLAxiom = ax;
  while ((cur as { "@type"?: unknown })["@type"] === "fol:Universal") {
    cur = (cur as FOLUniversal).body;
  }
  return cur;
}

/** True iff `node` is a fol:Atom with the given predicate IRI. */
function isAtomWithPredicate(node: unknown, predicate: string): boolean {
  if (node === null || typeof node !== "object") return false;
  const n = node as { "@type"?: unknown; predicate?: unknown };
  return n["@type"] === "fol:Atom" && n.predicate === predicate;
}

/** Recursively check if any sub-axiom (anywhere in the tree) is a fol:Atom with the given predicate. */
function containsAtomWithPredicate(node: unknown, predicate: string): boolean {
  if (node === null || typeof node !== "object") return false;
  const n = node as Record<string, unknown>;
  if (isAtomWithPredicate(n, predicate)) return true;
  for (const value of Object.values(n)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (containsAtomWithPredicate(item, predicate)) return true;
      }
    } else if (typeof value === "object" && value !== null) {
      if (containsAtomWithPredicate(value, predicate)) return true;
    }
  }
  return false;
}

/**
 * Required pattern 2: reflexivity — ∀x. C(x, x).
 * Match: outer Universal(s), innermost body is an Atom with the given
 * predicate, both arguments are the same Variable.
 */
function matchesReflexivity(ax: FOLAxiom, predicate: string): boolean {
  const inner = stripUniversals(ax);
  if (!isAtomWithPredicate(inner, predicate)) return false;
  const atom = inner as FOLAtom;
  if (atom.arguments.length !== 2) return false;
  const a = atom.arguments[0] as FOLVariable;
  const b = atom.arguments[1] as FOLVariable;
  if (a["@type"] !== "fol:Variable" || b["@type"] !== "fol:Variable") return false;
  return a.name === b.name;
}

/**
 * Required pattern 3: symmetry — ∀x,y. C(y, x) → C(x, y).
 * Match: outer Universals, innermost body is an Implication where
 * antecedent + consequent are both Atoms with the given predicate.
 */
function matchesSymmetry(ax: FOLAxiom, predicate: string): boolean {
  const inner = stripUniversals(ax);
  if ((inner as { "@type"?: unknown })["@type"] !== "fol:Implication") return false;
  const impl = inner as FOLImplication;
  return (
    isAtomWithPredicate(impl.antecedent, predicate) &&
    isAtomWithPredicate(impl.consequent, predicate)
  );
}

/**
 * Required pattern 4: parthood-extension — ∀x,y,z. P(x,y) ∧ C(z,x) → C(z,y).
 * Match: outer Universals, innermost body is an Implication where
 * antecedent is a Conjunction of [P-Atom, C-Atom] (any order),
 * consequent is a C-Atom.
 */
function matchesParthoodExtension(
  ax: FOLAxiom,
  cPredicate: string,
  pPredicate: string
): boolean {
  const inner = stripUniversals(ax);
  if ((inner as { "@type"?: unknown })["@type"] !== "fol:Implication") return false;
  const impl = inner as FOLImplication;
  if (!isAtomWithPredicate(impl.consequent, cPredicate)) return false;
  if ((impl.antecedent as { "@type"?: unknown })["@type"] !== "fol:Conjunction") return false;
  const conj = impl.antecedent as FOLConjunction;
  if (conj.conjuncts.length !== 2) return false;
  // Multiset match: one P + one C, in any order.
  const hasP = conj.conjuncts.some((c) => isAtomWithPredicate(c, pPredicate));
  const hasC = conj.conjuncts.some((c) => isAtomWithPredicate(c, cPredicate));
  return hasP && hasC;
}

/**
 * Forbidden pattern: reverse-direction defined-as-overlap collapse —
 * ∀x,y. C(x, y) → overlaps(x, y). Match: outer Universals, innermost
 * body is Implication where antecedent is C-Atom, consequent is
 * overlaps-Atom (the wrong-direction bridge axiom).
 */
function matchesReverseDirImplication(
  ax: FOLAxiom,
  cPredicate: string,
  overlapsPredicate: string
): boolean {
  const inner = stripUniversals(ax);
  if ((inner as { "@type"?: unknown })["@type"] !== "fol:Implication") return false;
  const impl = inner as FOLImplication;
  return (
    isAtomWithPredicate(impl.antecedent, cPredicate) &&
    isAtomWithPredicate(impl.consequent, overlapsPredicate)
  );
}

async function main(): Promise<void> {
  __resetARCModuleRegistryForTesting();
  registerTauPrologProbe(() => "0.3.4");
  await loadBFOArcModule();

  // -----------------------------------------------------------
  // canary_connected_with_overlap (corpus-before-code activation)
  // -----------------------------------------------------------

  await checkAsync(
    "Step 5 / canary: requiredPattern 1 — Connected With present as primitive binary atom",
    async () => {
      const fixture = await loadCorpus<CorpusFixture>(
        "canary_connected_with_overlap.fixture.js"
      );
      const axioms = await owlToFol(fixture.input, fixture.loadOntologyConfig);
      const found = axioms.some((ax) =>
        containsAtomWithPredicate(ax, CCO_CONNECTED_WITH)
      );
      ok(found, "Connected With Atom appears in lifted FOL state");
    }
  );

  await checkAsync(
    "Step 5 / canary: requiredPattern 2 — reflexivity ∀x. C(x, x) emitted from bridgeAxioms",
    async () => {
      const fixture = await loadCorpus<CorpusFixture>(
        "canary_connected_with_overlap.fixture.js"
      );
      const axioms = await owlToFol(fixture.input, fixture.loadOntologyConfig);
      const found = axioms.some((ax) => matchesReflexivity(ax, CCO_CONNECTED_WITH));
      ok(found, "reflexivity axiom (∀x. C(x, x)) found in lifted FOL state");
    }
  );

  await checkAsync(
    "Step 5 / canary: requiredPattern 3 — symmetry ∀x,y. C(y, x) → C(x, y) emitted from bridgeAxioms",
    async () => {
      const fixture = await loadCorpus<CorpusFixture>(
        "canary_connected_with_overlap.fixture.js"
      );
      const axioms = await owlToFol(fixture.input, fixture.loadOntologyConfig);
      const found = axioms.some((ax) => matchesSymmetry(ax, CCO_CONNECTED_WITH));
      ok(found, "symmetry axiom (∀x,y. C(y,x) → C(x,y)) found in lifted FOL state");
    }
  );

  await checkAsync(
    "Step 5 / canary: requiredPattern 4 — parthood-extension ∀x,y,z. P(x,y) ∧ C(z,x) → C(z,y)",
    async () => {
      const fixture = await loadCorpus<CorpusFixture>(
        "canary_connected_with_overlap.fixture.js"
      );
      const axioms = await owlToFol(fixture.input, fixture.loadOntologyConfig);
      const found = axioms.some((ax) =>
        matchesParthoodExtension(ax, CCO_CONNECTED_WITH, BFO_CONTINUANT_PART_OF)
      );
      ok(
        found,
        "parthood-extension axiom (∀x,y,z. P(x,y) ∧ C(z,x) → C(z,y)) found in lifted FOL state"
      );
    }
  );

  await checkAsync(
    "Step 5 / canary: forbiddenPattern — reverse-direction connected_with → overlaps NOT emitted (defined-as-overlap collapse forbidden)",
    async () => {
      const fixture = await loadCorpus<CorpusFixture>(
        "canary_connected_with_overlap.fixture.js"
      );
      const axioms = await owlToFol(fixture.input, fixture.loadOntologyConfig);
      const found = axioms.some((ax) =>
        matchesReverseDirImplication(ax, CCO_CONNECTED_WITH, RO_OVERLAPS)
      );
      ok(
        !found,
        "wrong-direction implication connected_with(x, y) → overlaps(x, y) MUST NOT appear in lifted FOL state"
      );
    }
  );

  // -----------------------------------------------------------
  // Q-4-Step5-A.4 reconnaissance regression guards
  // -----------------------------------------------------------

  await checkAsync(
    "Step 5 / Q-4-Step5-A.4 reconnaissance: bridgeAxioms emits exactly 1 reflexivity + 1 symmetry + 1 parthood-extension axiom for Connected With (no double-emit from owlCharacteristics text field)",
    async () => {
      const fixture = await loadCorpus<CorpusFixture>(
        "canary_connected_with_overlap.fixture.js"
      );
      const axioms = await owlToFol(fixture.input, fixture.loadOntologyConfig);
      const reflexivityCount = axioms.filter((ax) =>
        matchesReflexivity(ax, CCO_CONNECTED_WITH)
      ).length;
      const symmetryCount = axioms.filter((ax) =>
        matchesSymmetry(ax, CCO_CONNECTED_WITH)
      ).length;
      const parthoodCount = axioms.filter((ax) =>
        matchesParthoodExtension(ax, CCO_CONNECTED_WITH, BFO_CONTINUANT_PART_OF)
      ).length;
      strictEqual(reflexivityCount, 1, "exactly 1 reflexivity axiom emitted (no double-emit)");
      strictEqual(symmetryCount, 1, "exactly 1 symmetry axiom emitted (no double-emit)");
      strictEqual(parthoodCount, 1, "exactly 1 parthood-extension axiom emitted (no double-emit)");
    }
  );

  await checkAsync(
    "Step 5 / regression guard: without BFO ARC loaded, no bridge axioms emitted",
    async () => {
      __resetARCModuleRegistryForTesting();
      // Do NOT load BFO ARC.
      const fixture = await loadCorpus<CorpusFixture>(
        "canary_connected_with_overlap.fixture.js"
      );
      // Lift WITHOUT arcModules config so the lifter doesn't query the
      // (now-empty) registry. Result should contain only input-derived
      // axioms — no Connected With Atoms, no bridge-axiom shapes.
      const axioms = await owlToFol(fixture.input);
      const hasConnectedWith = axioms.some((ax) =>
        containsAtomWithPredicate(ax, CCO_CONNECTED_WITH)
      );
      const hasReflexivity = axioms.some((ax) =>
        matchesReflexivity(ax, CCO_CONNECTED_WITH)
      );
      ok(!hasConnectedWith, "no Connected With Atom without BFO ARC");
      ok(!hasReflexivity, "no reflexivity axiom without BFO ARC");
    }
  );

  console.log("");
  console.log(`  ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
