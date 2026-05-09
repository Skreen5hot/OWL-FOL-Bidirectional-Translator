/**
 * Phase 3 Step 7 — Hypothetical-axiom case: FOLFalse-in-head inconsistency
 * detection + witness extraction per API §8.1.2 + spec §8.5.2.
 *
 * Per architect Q-3-A step-granularity ratification 2026-05-08 + ADR-007 §11.
 * Most of the hypothetical-axiom contract was already exercised at Step 6
 * (axiomSet participation per API §8.1.2; non-persistence per the
 * load-bearing semantic; Horn-fragment-escape detection covering 3 of 4
 * hypothetical_* fixtures). Step 7 ADDS:
 *
 *   - FOLFalse-in-head inconsistency detection: scans session +
 *     axiomSet for ∀x. body → False shapes; queries body against
 *     session; if provable → consistent: 'false' with witnesses
 *   - Witness extraction: ConsistencyResult.witnesses populated with
 *     the False-in-head axiom + body atoms per API §8.1 contract
 *   - Outcome ordering per spec §8.5.2: inconsistency proof takes
 *     precedence over Horn-fragment-incompleteness (so even when
 *     the FOLFalse-in-head axiom itself surfaces as a Horn-fragment-
 *     escape per Step 6 minimum, the contradiction-via-body-proof
 *     fires first)
 *
 * Step 7 minimum scope: covers hypothetical_inconsistency fixture
 * (axiomSet introduces FOLFalse-in-head whose body is Horn-provable
 * against base session). Per-class Skolem-witness satisfiability
 * checking (covers nc_self_complement) remains forward-tracked
 * beyond Step 7.
 *
 * Tests cover:
 *   - hypothetical_inconsistency fixture end-to-end: 'false' / 'inconsistent'
 *     + witnesses populated (axiomSet's FOLFalse-in-head axiom + body atoms)
 *   - Outcome ordering: inconsistency takes precedence over coherence-
 *     indeterminate (FOLFalse-in-head with provable body returns 'false'
 *     even when other axioms are non-Horn)
 *   - Hypothetical non-persistence (re-verification per API §8.1.2):
 *     subsequent checkConsistency() without axiomSet returns base-state
 *     verdict
 *   - hypothetical_inconsistency-style synthetic case with explicit
 *     witness inspection
 */

import { strictEqual, ok } from "node:assert";
import {
  createSession,
  __resetSessionCounterForTesting,
} from "../src/composition/session.js";
import {
  loadOntology,
  registerTauPrologFactory,
  __resetLoadOntologyCacheForTesting,
} from "../src/composition/load-ontology.js";
import { checkConsistency } from "../src/composition/check-consistency.js";
import { REASON_CODES } from "../src/kernel/reason-codes.js";
import { registerTauPrologProbe } from "../src/kernel/tau-prolog-probe.js";
import type { OWLOntology } from "../src/kernel/owl-types.js";
import type { FOLAxiom } from "../src/kernel/fol-types.js";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pl from "tau-prolog";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..", "..");
const corpusDir = resolve(projectRoot, "tests", "corpus");

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

interface HypotheticalFixture {
  input?: OWLOntology;
  base?: OWLOntology;
  axiomSet: ReadonlyArray<FOLAxiom>;
  "expected_v0.1_verdict": {
    expectedConsistencyResult?: "true" | "false" | "undetermined";
    expectedReason?: string;
  };
}

async function loadFixture<T>(filename: string): Promise<T> {
  const path = resolve(corpusDir, filename);
  await readFile(path, "utf-8");
  const url = "file:///" + path.replace(/\\/g, "/");
  const mod = (await import(url)) as { fixture: T };
  return mod.fixture;
}

const PREFIX = "http://example.org/test/step7/";

async function main(): Promise<void> {
  __resetSessionCounterForTesting();
  __resetLoadOntologyCacheForTesting();
  registerTauPrologProbe(() => "0.3.4");
  registerTauPrologFactory(() => pl.create(2000));

  // -----------------------------------------------------------
  // hypothetical_inconsistency fixture end-to-end
  // -----------------------------------------------------------

  await checkAsync(
    "Step 7 / hypothetical_inconsistency fixture: → 'false' / 'inconsistent' + witnesses populated",
    async () => {
      const fixture = await loadFixture<HypotheticalFixture>(
        "hypothetical_inconsistency.fixture.js"
      );
      const session = createSession();
      const baseInput = fixture.input ?? fixture.base;
      if (baseInput) await loadOntology(session, baseInput);
      const result = await checkConsistency(session, fixture.axiomSet);
      strictEqual(result.consistent, "false");
      strictEqual(result.reason, REASON_CODES.inconsistent);
      ok(Array.isArray(result.witnesses), "witnesses is array");
      ok(
        result.witnesses!.length > 0,
        "witnesses is non-empty (at least one minimal inconsistent subset)"
      );
      // Each witness has axioms array
      for (const w of result.witnesses!) {
        ok(Array.isArray(w.axioms), "witness has axioms array");
        ok(w.axioms.length > 0, "witness axioms non-empty");
      }
    }
  );

  // -----------------------------------------------------------
  // Outcome ordering per spec §8.5.2: inconsistency takes precedence
  // over coherence-indeterminate
  // -----------------------------------------------------------

  await checkAsync(
    "Step 7 / Outcome ordering: inconsistency proof precedes coherence_indeterminate per spec §8.5.2",
    async () => {
      // Even when the FOLFalse-in-head axiom (axiomSet) itself surfaces
      // as a Horn-fragment-escape per Step 6 minimum, the contradiction
      // proof via body-Horn-resolution fires first and returns 'false'.
      // hypothetical_inconsistency exercises this contract: its axiomSet
      // is ∀x. (Adult(x) ∧ Person(x)) → False (FOLFalse in head — Step 6
      // would surface as Horn-fragment-escape), but the body
      // (Adult(alice) ∧ Person(alice)) is Horn-provable from base
      // session state → contradiction → 'false' / 'inconsistent'.
      const fixture = await loadFixture<HypotheticalFixture>(
        "hypothetical_inconsistency.fixture.js"
      );
      const session = createSession();
      if (fixture.input) await loadOntology(session, fixture.input);
      const result = await checkConsistency(session, fixture.axiomSet);
      // Result is 'false', NOT 'undetermined' — outcome ordering verified
      strictEqual(result.consistent, "false");
      strictEqual(result.reason, REASON_CODES.inconsistent);
      // unverifiedAxioms is undefined or empty (inconsistency took precedence)
      ok(
        result.unverifiedAxioms === undefined ||
          result.unverifiedAxioms.length === 0,
        "unverifiedAxioms is not surfaced when inconsistency proven (outcome ordering)"
      );
    }
  );

  // -----------------------------------------------------------
  // Hypothetical non-persistence re-verification per API §8.1.2
  // (full sequence: inconsistent hypothetical → consistent base)
  // -----------------------------------------------------------

  await checkAsync(
    "Step 7 / Non-persistence: hypothetical_inconsistency axiomSet does NOT persist; subsequent base check returns 'true'",
    async () => {
      const fixture = await loadFixture<HypotheticalFixture>(
        "hypothetical_inconsistency.fixture.js"
      );
      const session = createSession();
      if (fixture.input) await loadOntology(session, fixture.input);
      // First call WITH axiomSet → 'false'
      const result1 = await checkConsistency(session, fixture.axiomSet);
      strictEqual(result1.consistent, "false");
      // Second call WITHOUT axiomSet → 'true' (base session state alone
      // is consistent; hypothetical did not persist per API §8.1.2)
      const result2 = await checkConsistency(session);
      strictEqual(result2.consistent, "true");
      strictEqual(result2.reason, REASON_CODES.consistent);
    }
  );

  // -----------------------------------------------------------
  // Synthetic FOLFalse-in-head inconsistency case with witness inspection
  // -----------------------------------------------------------

  await checkAsync(
    "Step 7 / Synthetic FOLFalse-in-head: contradiction via session-state + axiomSet inconsistency rule",
    async () => {
      // Base: Person(alice).  axiomSet: ∀x. Person(x) → False
      // Body: Person(alice) — provable directly. Contradiction.
      const ontology: OWLOntology = {
        ontologyIRI: PREFIX + "synthetic-false-in-head",
        prefixes: { ex: PREFIX },
        tbox: [],
        abox: [
          {
            "@type": "ClassAssertion",
            class: { "@type": "Class", iri: PREFIX + "Person" },
            individual: PREFIX + "alice",
          },
        ],
        rbox: [],
      };
      const axiomSet: FOLAxiom[] = [
        {
          "@type": "fol:Universal",
          variable: "x",
          body: {
            "@type": "fol:Implication",
            antecedent: {
              "@type": "fol:Atom",
              predicate: PREFIX + "Person",
              arguments: [{ "@type": "fol:Variable", name: "x" }],
            },
            consequent: { "@type": "fol:False" },
          },
        },
      ];
      const session = createSession();
      await loadOntology(session, ontology);
      const result = await checkConsistency(session, axiomSet);
      strictEqual(result.consistent, "false");
      strictEqual(result.reason, REASON_CODES.inconsistent);
      ok(result.witnesses!.length > 0);
      // First witness's axioms array starts with the FOLFalse-in-head axiom
      const w = result.witnesses![0];
      strictEqual(w.axioms.length, 2, "witness contains False-in-head axiom + 1 body atom");
    }
  );

  // -----------------------------------------------------------
  // Negative case: FOLFalse-in-head body NOT provable → consistent
  // -----------------------------------------------------------

  await checkAsync(
    "Step 7 / FOLFalse-in-head with NON-provable body: 'undetermined' / 'coherence_indeterminate' (no contradiction proven, but axiom is non-Horn)",
    async () => {
      // Base: Person(alice).  axiomSet: ∀x. Mammal(x) → False
      // Body: Mammal(alice) — NOT provable (no Mammal facts/rules).
      // No contradiction CAN be PROVEN (body unprovable), but the
      // FOLFalse-in-head axiom IS non-Horn-translatable per Step 6
      // minimum (consequent not FOLAtom). Per spec §8.5.4 honest-
      // admission: when no inconsistency proven AND non-Horn axioms
      // present, return 'undetermined' / 'coherence_indeterminate'
      // with unverifiedAxioms (NOT 'true' — we can't prove consistent
      // when richer reasoning could still surface inconsistency).
      const ontology: OWLOntology = {
        ontologyIRI: PREFIX + "synthetic-false-in-head-nonprov",
        prefixes: { ex: PREFIX },
        tbox: [],
        abox: [
          {
            "@type": "ClassAssertion",
            class: { "@type": "Class", iri: PREFIX + "Person" },
            individual: PREFIX + "alice",
          },
        ],
        rbox: [],
      };
      const axiomSet: FOLAxiom[] = [
        {
          "@type": "fol:Universal",
          variable: "x",
          body: {
            "@type": "fol:Implication",
            antecedent: {
              "@type": "fol:Atom",
              predicate: PREFIX + "Mammal",
              arguments: [{ "@type": "fol:Variable", name: "x" }],
            },
            consequent: { "@type": "fol:False" },
          },
        },
      ];
      const session = createSession();
      await loadOntology(session, ontology);
      const result = await checkConsistency(session, axiomSet);
      // Body NOT provable → no inconsistency-proof success → fall
      // through to Step 6 Horn-fragment-escape detection. The
      // FOLFalse-in-head axiom itself is non-Horn → unverifiedAxioms
      // populated → 'undetermined' / 'coherence_indeterminate'.
      strictEqual(result.consistent, "undetermined");
      strictEqual(result.reason, REASON_CODES.coherence_indeterminate);
      ok(
        result.unverifiedAxioms !== undefined &&
          result.unverifiedAxioms.length > 0,
        "FOLFalse-in-head axiom surfaces as unverifiedAxioms when body unprovable"
      );
    }
  );

  // -----------------------------------------------------------
  // Session-state FOLFalse-in-head inconsistency (not just axiomSet)
  // -----------------------------------------------------------

  await checkAsync(
    "Step 7 / FOLFalse-in-head in session state (not axiomSet): contradiction detected via body-provable check",
    async () => {
      // The session itself contains a DisjointWith-derived FOLFalse-in-
      // head axiom AND the contradiction-fact. Verify checkConsistency
      // detects the inconsistency without an axiomSet hypothetical.
      const ontology: OWLOntology = {
        ontologyIRI: PREFIX + "session-false-in-head",
        prefixes: { ex: PREFIX },
        tbox: [
          // Adult ⊑ Person
          {
            "@type": "SubClassOf",
            subClass: { "@type": "Class", iri: PREFIX + "Adult" },
            superClass: { "@type": "Class", iri: PREFIX + "Person" },
          },
          // DisjointWith(Adult, Person) → ∀x. (Adult(x) ∧ Person(x)) → False
          {
            "@type": "DisjointWith",
            classes: [
              { "@type": "Class", iri: PREFIX + "Adult" },
              { "@type": "Class", iri: PREFIX + "Person" },
            ],
          },
        ],
        abox: [
          // Adult(alice) — combined with Adult ⊑ Person + DisjointWith
          // produces inconsistency
          {
            "@type": "ClassAssertion",
            class: { "@type": "Class", iri: PREFIX + "Adult" },
            individual: PREFIX + "alice",
          },
        ],
        rbox: [],
      };
      const session = createSession();
      await loadOntology(session, ontology);
      const result = await checkConsistency(session);
      strictEqual(result.consistent, "false");
      strictEqual(result.reason, REASON_CODES.inconsistent);
      ok(result.witnesses!.length > 0, "session-state inconsistency witnesses populated");
    }
  );

  console.log("");
  console.log(`  ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main();
