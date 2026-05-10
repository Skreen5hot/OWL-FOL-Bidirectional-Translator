/**
 * Phase 3 Step 9.4-amendment-4 — nc_self_complement bounded fix verification.
 *
 * Per Q-3-Step9-A architect ruling 2026-05-09 (Frame I + D2 disposition +
 * Refinement 1 hypothesis (b)): Step 7's isFalseHeadAxiom + extractBodyAtoms
 * extend to recognize fol:Negation-of-Atom in consequent (logically equivalent
 * to FOLFalse-in-head per A→¬B ≡ A∧B→False), and the inconsistency loop
 * asserts Skolem witnesses per spec §8.5.2 for unique unary predicates in
 * any FOLFalse-in-head body.
 *
 * Tests verify the post-fix verdict on the canonical adversarial case AND
 * that the bounded fix does not disturb the other Phase 3 fixtures' verdicts
 * per the architect's "no scope expansion beyond nc_self_complement arm" guard.
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
import { registerTauPrologProbe } from "../src/kernel/tau-prolog-probe.js";
import type { OWLOntology } from "../src/kernel/owl-types.js";
import pl from "tau-prolog";

let passed = 0;
let failed = 0;

async function check(name: string, fn: () => Promise<void>): Promise<void> {
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

const PARADOX_PREFIX = "http://example.org/test/nc_self_complement/";
const PARADOX_CLASS = PARADOX_PREFIX + "ParadoxClass";

async function main(): Promise<void> {
  __resetSessionCounterForTesting();
  __resetLoadOntologyCacheForTesting();
  registerTauPrologProbe(() => "0.3.4");
  registerTauPrologFactory(() => pl.create(2000));

  await check(
    "nc_self_complement: EquivalentClasses(C, complementOf(C)) returns consistent: 'false' / inconsistent (Q-3-Step9-A Refinement 1 hypothesis (b) bounded fix)",
    async () => {
      const session = createSession();
      const ontology: OWLOntology = {
        ontologyIRI: "http://example.org/test/nc_self_complement",
        prefixes: { ex: PARADOX_PREFIX },
        tbox: [
          {
            "@type": "EquivalentClasses",
            classes: [
              { "@type": "Class", iri: PARADOX_CLASS },
              {
                "@type": "ObjectComplementOf",
                class: { "@type": "Class", iri: PARADOX_CLASS },
              },
            ],
          },
        ],
        abox: [],
        rbox: [],
      };
      await loadOntology(session, ontology);
      const result = await checkConsistency(session);
      strictEqual(result.consistent, "false");
      strictEqual(result.reason, "inconsistent");
      ok(result.witnesses !== undefined && result.witnesses.length > 0);
      ok(
        result.unverifiedAxioms === undefined ||
          result.unverifiedAxioms.length === 0,
        "consistent: 'false' return path omits unverifiedAxioms"
      );
    }
  );

  // Regression guard: nc_silent_pass_canary still survives (must NOT be 'true')
  await check(
    "nc_silent_pass_canary regression guard: verdict still NOT 'true' after fix",
    async () => {
      const PFX = "http://example.org/test/nc_silent_pass_canary/";
      const session = createSession();
      const ontology: OWLOntology = {
        ontologyIRI: "http://example.org/test/nc_silent_pass_canary",
        prefixes: { ex: PFX },
        tbox: [
          {
            "@type": "SubClassOf",
            subClass: { "@type": "Class", iri: PFX + "Person" },
            superClass: {
              "@type": "ObjectUnionOf",
              classes: [
                { "@type": "Class", iri: PFX + "Adult" },
                { "@type": "Class", iri: PFX + "Minor" },
              ],
            },
          },
          {
            "@type": "DisjointWith",
            classes: [
              { "@type": "Class", iri: PFX + "Adult" },
              { "@type": "Class", iri: PFX + "Minor" },
            ],
          },
        ],
        abox: [
          {
            "@type": "ClassAssertion",
            class: { "@type": "Class", iri: PFX + "Person" },
            individual: PFX + "alice",
          },
        ],
        rbox: [],
      };
      await loadOntology(session, ontology);
      const result = await checkConsistency(session);
      ok(
        result.consistent !== "true",
        `MUST NOT be 'true'; actual ${result.consistent}`
      );
    }
  );

  // Regression guard: hypothetical_clean still passes (B.5)
  await check(
    "hypothetical_clean (B.5) regression guard: clean session still 'true'",
    async () => {
      const PFX = "http://example.org/test/hypothetical_clean/";
      const session = createSession();
      const ontology: OWLOntology = {
        ontologyIRI: "http://example.org/test/hypothetical_clean",
        prefixes: { ex: PFX },
        tbox: [
          {
            "@type": "SubClassOf",
            subClass: { "@type": "Class", iri: PFX + "Mother" },
            superClass: { "@type": "Class", iri: PFX + "Person" },
          },
        ],
        abox: [
          {
            "@type": "ClassAssertion",
            class: { "@type": "Class", iri: PFX + "Person" },
            individual: PFX + "alice",
          },
        ],
        rbox: [],
      };
      await loadOntology(session, ontology);
      const result = await checkConsistency(session);
      strictEqual(result.consistent, "true");
      strictEqual(result.reason, "consistent");
    }
  );

  console.log("");
  console.log(`  ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main();
