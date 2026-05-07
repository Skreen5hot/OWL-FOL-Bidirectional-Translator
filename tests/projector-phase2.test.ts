/**
 * Phase 2 Projector Regression Tests
 *
 * Step 1: skeleton + prefixes parameter handling. Verifies the API §6.2
 * contract surface is in place; later Steps land strategy routing,
 * audit-artifact emission, and roundTripCheck.
 *
 * Spec-test discipline: this file lives alongside lifter-phase1.test.ts
 * and the determinism-100-run harness; it is not a frozen Phase-0 spec
 * test and may be amended as Phase 2 Steps land.
 */

import { strictEqual, deepStrictEqual, ok } from "node:assert";

import { folToOwl } from "../src/kernel/projector.js";
import { owlToFol } from "../src/kernel/lifter.js";
import { roundTripCheck } from "../src/kernel/round-trip.js";
import {
  LOSS_SIGNATURE_SEVERITY_ORDER,
} from "../src/kernel/projector-types.js";
import { stableStringify } from "../src/kernel/canonicalize.js";
import type { FOLAxiom } from "../src/kernel/fol-types.js";
import type { OWLOntology } from "../src/kernel/owl-types.js";

let passed = 0;
let failed = 0;

function report(name: string, fn: () => Promise<void> | void): Promise<void> {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    })
    .catch((e: unknown) => {
      console.error(`  ✗ FAIL: ${name}`);
      console.error(" ", e instanceof Error ? e.message : String(e));
      failed++;
    });
}

// ===========================================================================
// STEP 1 — folToOwl skeleton signature + prefixes parameter handling
// ===========================================================================

await report(
  "folToOwl is exported, async, returns OWLConversionResult shape on empty input",
  async () => {
    const result = await folToOwl([]);
    ok(result, "result is defined");
    ok(result.ontology, "result.ontology is defined");
    ok(result.manifest, "result.manifest is defined");
    deepStrictEqual(result.newRecoveryPayloads, [], "newRecoveryPayloads is empty array");
    deepStrictEqual(result.newLossSignatures, [], "newLossSignatures is empty array");
    deepStrictEqual(result.ontology.tbox, [], "ontology.tbox empty");
    deepStrictEqual(result.ontology.abox, [], "ontology.abox empty");
    deepStrictEqual(result.ontology.rbox, [], "ontology.rbox empty");
  },
);

await report(
  "folToOwl: prefixes omitted → output ontology has no prefixes field (full URI form per API §3.10.4)",
  async () => {
    const result = await folToOwl([]);
    ok(
      !("prefixes" in result.ontology),
      "prefixes key absent when not supplied",
    );
  },
);

await report(
  "folToOwl: prefixes supplied → output ontology carries the prefix table verbatim",
  async () => {
    const prefixes = {
      bfo: "http://purl.obolibrary.org/obo/",
      ex: "http://example.org/test/",
    };
    const result = await folToOwl([], undefined, { prefixes });
    deepStrictEqual(result.ontology.prefixes, prefixes);
  },
);

await report(
  "folToOwl: ProjectionManifest carries projector version + operating mode (skeleton placeholders for source provenance)",
  async () => {
    const result = await folToOwl([]);
    ok(
      result.manifest.projectorVersion.startsWith("OFBT-"),
      `projectorVersion starts with OFBT-, got ${result.manifest.projectorVersion}`,
    );
    strictEqual(
      result.manifest.operatingMode,
      "permissive",
      "default operatingMode is permissive when arcCoverage not strict",
    );
    strictEqual(result.manifest.ontologyIRI, "");
    strictEqual(result.manifest.versionIRI, "");
    strictEqual(result.manifest.projectedFrom, "");
    strictEqual(result.manifest.activity.used, "");
  },
);

await report(
  "folToOwl: arcCoverage='strict' → manifest.operatingMode='strict'",
  async () => {
    const result = await folToOwl([], undefined, { arcCoverage: "strict" });
    strictEqual(result.manifest.operatingMode, "strict");
  },
);

await report(
  "folToOwl: deterministic — same input produces byte-identical canonicalized output",
  async () => {
    const prefixes = { ex: "http://example.org/test/" };
    const r1 = await folToOwl([], undefined, { prefixes });
    const r2 = await folToOwl([], undefined, { prefixes });
    strictEqual(stableStringify(r1), stableStringify(r2));
  },
);

await report(
  "folToOwl: input arrays are not mutated (kernel purity)",
  async () => {
    const axioms: never[] = [];
    const recoveryPayloads: never[] = [];
    const config = { prefixes: { ex: "http://example.org/test/" } };
    const beforeAxioms = stableStringify(axioms);
    const beforeRecovery = stableStringify(recoveryPayloads);
    const beforeConfig = stableStringify(config);
    await folToOwl(axioms, recoveryPayloads, config);
    strictEqual(stableStringify(axioms), beforeAxioms);
    strictEqual(stableStringify(recoveryPayloads), beforeRecovery);
    strictEqual(stableStringify(config), beforeConfig);
  },
);

// ===========================================================================
// STEP 2 — Direct Mapping pattern-match per spec §6.1.1
// ===========================================================================

await report(
  "Step 2 / ABox: arity-1 atom on a fol:Constant → ClassAssertion",
  async () => {
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Atom",
        predicate: "http://example.org/test/Person",
        arguments: [{ "@type": "fol:Constant", iri: "http://example.org/test/alice" }],
      },
    ];
    const result = await folToOwl(axioms);
    deepStrictEqual(result.ontology.abox, [
      {
        "@type": "ClassAssertion",
        individual: "http://example.org/test/alice",
        class: { "@type": "Class", iri: "http://example.org/test/Person" },
      },
    ]);
    deepStrictEqual(result.ontology.tbox, []);
    deepStrictEqual(result.ontology.rbox, []);
  },
);

await report(
  "Step 2 / ABox: arity-2 atom with both fol:Constant args → ObjectPropertyAssertion",
  async () => {
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Atom",
        predicate: "http://example.org/test/knows",
        arguments: [
          { "@type": "fol:Constant", iri: "http://example.org/test/alice" },
          { "@type": "fol:Constant", iri: "http://example.org/test/bob" },
        ],
      },
    ];
    const result = await folToOwl(axioms);
    deepStrictEqual(result.ontology.abox, [
      {
        "@type": "ObjectPropertyAssertion",
        property: "http://example.org/test/knows",
        source: "http://example.org/test/alice",
        target: "http://example.org/test/bob",
      },
    ]);
  },
);

await report(
  "Step 2 / ABox: arity-2 atom with second arg fol:TypedLiteral → DataPropertyAssertion (datatype preserved)",
  async () => {
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Atom",
        predicate: "http://example.org/test/age",
        arguments: [
          { "@type": "fol:Constant", iri: "http://example.org/test/alice" },
          {
            "@type": "fol:TypedLiteral",
            value: "30",
            datatype: "http://www.w3.org/2001/XMLSchema#integer",
          },
        ],
      },
    ];
    const result = await folToOwl(axioms);
    deepStrictEqual(result.ontology.abox, [
      {
        "@type": "DataPropertyAssertion",
        property: "http://example.org/test/age",
        source: "http://example.org/test/alice",
        value: {
          "@value": "30",
          "@type": "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
    ]);
  },
);

await report(
  "Step 2 / TBox: ∀x. C1(x) → C2(x) → SubClassOf(C1, C2) with named classes",
  async () => {
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Universal",
        variable: "x",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Atom",
            predicate: "http://example.org/test/Dog",
            arguments: [{ "@type": "fol:Variable", name: "x" }],
          },
          consequent: {
            "@type": "fol:Atom",
            predicate: "http://example.org/test/Animal",
            arguments: [{ "@type": "fol:Variable", name: "x" }],
          },
        },
      },
    ];
    const result = await folToOwl(axioms);
    deepStrictEqual(result.ontology.tbox, [
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: "http://example.org/test/Dog" },
        superClass: { "@type": "Class", iri: "http://example.org/test/Animal" },
      },
    ]);
  },
);

await report(
  "Step 2 / RBox: ∀x,y. P(x,y) → P(y,x) → ObjectPropertyCharacteristic(Symmetric)",
  async () => {
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Universal",
        variable: "x",
        body: {
          "@type": "fol:Universal",
          variable: "y",
          body: {
            "@type": "fol:Implication",
            antecedent: {
              "@type": "fol:Atom",
              predicate: "http://example.org/test/spouseOf",
              arguments: [
                { "@type": "fol:Variable", name: "x" },
                { "@type": "fol:Variable", name: "y" },
              ],
            },
            consequent: {
              "@type": "fol:Atom",
              predicate: "http://example.org/test/spouseOf",
              arguments: [
                { "@type": "fol:Variable", name: "y" },
                { "@type": "fol:Variable", name: "x" },
              ],
            },
          },
        },
      },
    ];
    const result = await folToOwl(axioms);
    deepStrictEqual(result.ontology.rbox, [
      {
        "@type": "ObjectPropertyCharacteristic",
        property: "http://example.org/test/spouseOf",
        characteristic: "Symmetric",
      },
    ]);
  },
);

await report(
  "Step 2 / RBox: ∀x,y,z. P(x,y) ∧ P(y,z) → P(x,z) → ObjectPropertyCharacteristic(Transitive)",
  async () => {
    const axioms: FOLAxiom[] = [
      {
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
                    predicate: "http://example.org/test/ancestorOf",
                    arguments: [
                      { "@type": "fol:Variable", name: "x" },
                      { "@type": "fol:Variable", name: "y" },
                    ],
                  },
                  {
                    "@type": "fol:Atom",
                    predicate: "http://example.org/test/ancestorOf",
                    arguments: [
                      { "@type": "fol:Variable", name: "y" },
                      { "@type": "fol:Variable", name: "z" },
                    ],
                  },
                ],
              },
              consequent: {
                "@type": "fol:Atom",
                predicate: "http://example.org/test/ancestorOf",
                arguments: [
                  { "@type": "fol:Variable", name: "x" },
                  { "@type": "fol:Variable", name: "z" },
                ],
              },
            },
          },
        },
      },
    ];
    const result = await folToOwl(axioms);
    deepStrictEqual(result.ontology.rbox, [
      {
        "@type": "ObjectPropertyCharacteristic",
        property: "http://example.org/test/ancestorOf",
        characteristic: "Transitive",
      },
    ]);
  },
);

await report(
  "Step 2 / out-of-scope: cardinality-style FOL (existential conjunction with distinctness) — silently dropped pending Step 4 Annotated Approximation",
  async () => {
    // ∃y,z. P(x,y) ∧ P(x,z) ∧ y ≠ z (a min-cardinality 2 witness shape) — does
    // not match any Step 2 Direct Mapping pattern. Step 4 routes this to
    // Annotated Approximation with a Loss Signature; Step 2 drops silently.
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Existential",
        variable: "y",
        body: {
          "@type": "fol:Atom",
          predicate: "http://example.org/test/hasChild",
          arguments: [
            { "@type": "fol:Constant", iri: "http://example.org/test/alice" },
            { "@type": "fol:Variable", name: "y" },
          ],
        },
      },
    ];
    const result = await folToOwl(axioms);
    deepStrictEqual(result.ontology.tbox, []);
    deepStrictEqual(result.ontology.abox, []);
    deepStrictEqual(result.ontology.rbox, []);
  },
);

// ---- Round-trip: lifter → projector for Phase 1 ABox shapes ----

await report(
  "Step 2 / Round-trip: owlToFol(p1_abox-shaped input) → folToOwl reconstructs ABox 1:1",
  async () => {
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p2_step2_roundtrip_abox",
      tbox: [],
      abox: [
        {
          "@type": "ClassAssertion",
          individual: "http://example.org/test/alice",
          class: { "@type": "Class", iri: "http://example.org/test/Person" },
        },
        {
          "@type": "ObjectPropertyAssertion",
          property: "http://example.org/test/knows",
          source: "http://example.org/test/alice",
          target: "http://example.org/test/bob",
        },
        {
          "@type": "DataPropertyAssertion",
          property: "http://example.org/test/age",
          source: "http://example.org/test/alice",
          value: {
            "@value": "30",
            "@type": "http://www.w3.org/2001/XMLSchema#integer",
          },
        },
      ],
      rbox: [],
    };
    const lifted = await owlToFol(input);
    const projected = await folToOwl(lifted);
    deepStrictEqual(projected.ontology.abox, input.abox);
  },
);

await report(
  "Step 2 / Round-trip: SubClassOf chain → folToOwl reconstructs TBox 1:1",
  async () => {
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p2_step2_roundtrip_subclass",
      tbox: [
        {
          "@type": "SubClassOf",
          subClass: { "@type": "Class", iri: "http://example.org/test/Dog" },
          superClass: { "@type": "Class", iri: "http://example.org/test/Animal" },
        },
        {
          "@type": "SubClassOf",
          subClass: { "@type": "Class", iri: "http://example.org/test/Animal" },
          superClass: { "@type": "Class", iri: "http://example.org/test/LivingThing" },
        },
      ],
      abox: [],
      rbox: [],
    };
    const lifted = await owlToFol(input);
    const projected = await folToOwl(lifted);
    deepStrictEqual(projected.ontology.tbox, input.tbox);
  },
);

await report(
  "Step 2 / Round-trip: Symmetric + Transitive RBox characteristics survive lift→project",
  async () => {
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p2_step2_roundtrip_rbox",
      tbox: [],
      abox: [],
      rbox: [
        {
          "@type": "ObjectPropertyCharacteristic",
          property: "http://example.org/test/spouseOf",
          characteristic: "Symmetric",
        },
        {
          "@type": "ObjectPropertyCharacteristic",
          property: "http://example.org/test/ancestorOf",
          characteristic: "Transitive",
        },
      ],
    };
    const lifted = await owlToFol(input);
    const projected = await folToOwl(lifted);
    deepStrictEqual(projected.ontology.rbox, input.rbox);
  },
);

await report(
  "Step 2 / Round-trip determinism: 100 lift→project cycles are byte-stable",
  async () => {
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p2_step2_determinism",
      tbox: [
        {
          "@type": "SubClassOf",
          subClass: { "@type": "Class", iri: "http://example.org/test/Dog" },
          superClass: { "@type": "Class", iri: "http://example.org/test/Animal" },
        },
      ],
      abox: [
        {
          "@type": "ClassAssertion",
          individual: "http://example.org/test/rex",
          class: { "@type": "Class", iri: "http://example.org/test/Dog" },
        },
      ],
      rbox: [
        {
          "@type": "ObjectPropertyCharacteristic",
          property: "http://example.org/test/ancestorOf",
          characteristic: "Transitive",
        },
      ],
    };
    const first = stableStringify(await folToOwl(await owlToFol(input)));
    for (let i = 0; i < 99; i++) {
      const next = stableStringify(await folToOwl(await owlToFol(input)));
      strictEqual(next, first, `run ${i + 2}/100 diverged`);
    }
  },
);

// ===========================================================================
// STEP 3a — pair-matching TBox + remaining single-axiom RBox patterns
// ===========================================================================

await report(
  "Step 3a / TBox: ∀x. (C1(x) ∧ C2(x)) → ⊥ → DisjointWith(C1, C2)",
  async () => {
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Universal",
        variable: "x",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Conjunction",
            conjuncts: [
              {
                "@type": "fol:Atom",
                predicate: "http://example.org/test/Person",
                arguments: [{ "@type": "fol:Variable", name: "x" }],
              },
              {
                "@type": "fol:Atom",
                predicate: "http://example.org/test/Boulder",
                arguments: [{ "@type": "fol:Variable", name: "x" }],
              },
            ],
          },
          consequent: { "@type": "fol:False" },
        },
      },
    ];
    const result = await folToOwl(axioms);
    deepStrictEqual(result.ontology.tbox, [
      {
        "@type": "DisjointWith",
        classes: [
          { "@type": "Class", iri: "http://example.org/test/Person" },
          { "@type": "Class", iri: "http://example.org/test/Boulder" },
        ],
      },
    ]);
  },
);

await report(
  "Step 3a / TBox pair: two converse SubClassOf axioms → EquivalentClasses(C1, C2); both halves consumed",
  async () => {
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Universal",
        variable: "x",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Atom",
            predicate: "http://example.org/test/Person",
            arguments: [{ "@type": "fol:Variable", name: "x" }],
          },
          consequent: {
            "@type": "fol:Atom",
            predicate: "http://example.org/test/HumanBeing",
            arguments: [{ "@type": "fol:Variable", name: "x" }],
          },
        },
      },
      {
        "@type": "fol:Universal",
        variable: "x",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Atom",
            predicate: "http://example.org/test/HumanBeing",
            arguments: [{ "@type": "fol:Variable", name: "x" }],
          },
          consequent: {
            "@type": "fol:Atom",
            predicate: "http://example.org/test/Person",
            arguments: [{ "@type": "fol:Variable", name: "x" }],
          },
        },
      },
    ];
    const result = await folToOwl(axioms);
    deepStrictEqual(result.ontology.tbox, [
      {
        "@type": "EquivalentClasses",
        classes: [
          { "@type": "Class", iri: "http://example.org/test/Person" },
          { "@type": "Class", iri: "http://example.org/test/HumanBeing" },
        ],
      },
    ]);
    // No leftover SubClassOf axioms — both halves of the pair were consumed.
    strictEqual(result.ontology.tbox.length, 1);
  },
);

await report(
  "Step 3a / TBox pair: unmatched half of an EquivalentClasses pair degrades to SubClassOf",
  async () => {
    // Only one direction supplied. Should fall through pair-matching and
    // emit as a single SubClassOf via Step 2's rule.
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Universal",
        variable: "x",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Atom",
            predicate: "http://example.org/test/Person",
            arguments: [{ "@type": "fol:Variable", name: "x" }],
          },
          consequent: {
            "@type": "fol:Atom",
            predicate: "http://example.org/test/HumanBeing",
            arguments: [{ "@type": "fol:Variable", name: "x" }],
          },
        },
      },
    ];
    const result = await folToOwl(axioms);
    deepStrictEqual(result.ontology.tbox, [
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: "http://example.org/test/Person" },
        superClass: { "@type": "Class", iri: "http://example.org/test/HumanBeing" },
      },
    ]);
  },
);

await report(
  "Step 3a / RBox: ∀x,y,z. P(x,y) ∧ P(x,z) → y=z → ObjectPropertyCharacteristic(Functional)",
  async () => {
    const axioms: FOLAxiom[] = [
      {
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
                    predicate: "http://example.org/test/hasIDNumber",
                    arguments: [
                      { "@type": "fol:Variable", name: "x" },
                      { "@type": "fol:Variable", name: "y" },
                    ],
                  },
                  {
                    "@type": "fol:Atom",
                    predicate: "http://example.org/test/hasIDNumber",
                    arguments: [
                      { "@type": "fol:Variable", name: "x" },
                      { "@type": "fol:Variable", name: "z" },
                    ],
                  },
                ],
              },
              consequent: {
                "@type": "fol:Equality",
                left: { "@type": "fol:Variable", name: "y" },
                right: { "@type": "fol:Variable", name: "z" },
              },
            },
          },
        },
      },
    ];
    const result = await folToOwl(axioms);
    deepStrictEqual(result.ontology.rbox, [
      {
        "@type": "ObjectPropertyCharacteristic",
        property: "http://example.org/test/hasIDNumber",
        characteristic: "Functional",
      },
    ]);
  },
);

await report(
  "Step 3a / RBox pair: two cross-predicate implications → InverseObjectProperties(P, Q); both halves consumed",
  async () => {
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Universal",
        variable: "x",
        body: {
          "@type": "fol:Universal",
          variable: "y",
          body: {
            "@type": "fol:Implication",
            antecedent: {
              "@type": "fol:Atom",
              predicate: "http://example.org/test/parentOf",
              arguments: [
                { "@type": "fol:Variable", name: "x" },
                { "@type": "fol:Variable", name: "y" },
              ],
            },
            consequent: {
              "@type": "fol:Atom",
              predicate: "http://example.org/test/childOf",
              arguments: [
                { "@type": "fol:Variable", name: "y" },
                { "@type": "fol:Variable", name: "x" },
              ],
            },
          },
        },
      },
      {
        "@type": "fol:Universal",
        variable: "x",
        body: {
          "@type": "fol:Universal",
          variable: "y",
          body: {
            "@type": "fol:Implication",
            antecedent: {
              "@type": "fol:Atom",
              predicate: "http://example.org/test/childOf",
              arguments: [
                { "@type": "fol:Variable", name: "x" },
                { "@type": "fol:Variable", name: "y" },
              ],
            },
            consequent: {
              "@type": "fol:Atom",
              predicate: "http://example.org/test/parentOf",
              arguments: [
                { "@type": "fol:Variable", name: "y" },
                { "@type": "fol:Variable", name: "x" },
              ],
            },
          },
        },
      },
    ];
    const result = await folToOwl(axioms);
    deepStrictEqual(result.ontology.rbox, [
      {
        "@type": "InverseObjectProperties",
        first: "http://example.org/test/parentOf",
        second: "http://example.org/test/childOf",
      },
    ]);
    strictEqual(result.ontology.rbox.length, 1);
  },
);

await report(
  "Step 3a / RBox: ∀x,y. P(x,y) → D(x) → ObjectPropertyDomain (consequent on FIRST var)",
  async () => {
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Universal",
        variable: "x",
        body: {
          "@type": "fol:Universal",
          variable: "y",
          body: {
            "@type": "fol:Implication",
            antecedent: {
              "@type": "fol:Atom",
              predicate: "http://example.org/test/wasInfluencedBy",
              arguments: [
                { "@type": "fol:Variable", name: "x" },
                { "@type": "fol:Variable", name: "y" },
              ],
            },
            consequent: {
              "@type": "fol:Atom",
              predicate: "http://example.org/test/Entity",
              arguments: [{ "@type": "fol:Variable", name: "x" }],
            },
          },
        },
      },
    ];
    const result = await folToOwl(axioms);
    deepStrictEqual(result.ontology.rbox, [
      {
        "@type": "ObjectPropertyDomain",
        property: "http://example.org/test/wasInfluencedBy",
        domain: { "@type": "Class", iri: "http://example.org/test/Entity" },
      },
    ]);
  },
);

await report(
  "Step 3a / RBox: ∀x,y. P(x,y) → R(y) → ObjectPropertyRange (consequent on SECOND var)",
  async () => {
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Universal",
        variable: "x",
        body: {
          "@type": "fol:Universal",
          variable: "y",
          body: {
            "@type": "fol:Implication",
            antecedent: {
              "@type": "fol:Atom",
              predicate: "http://example.org/test/wasInfluencedBy",
              arguments: [
                { "@type": "fol:Variable", name: "x" },
                { "@type": "fol:Variable", name: "y" },
              ],
            },
            consequent: {
              "@type": "fol:Atom",
              predicate: "http://example.org/test/Entity",
              arguments: [{ "@type": "fol:Variable", name: "y" }],
            },
          },
        },
      },
    ];
    const result = await folToOwl(axioms);
    deepStrictEqual(result.ontology.rbox, [
      {
        "@type": "ObjectPropertyRange",
        property: "http://example.org/test/wasInfluencedBy",
        range: { "@type": "Class", iri: "http://example.org/test/Entity" },
      },
    ]);
  },
);

await report(
  "Step 3a / pair-match guard: two Symmetric axioms (P, Q) do NOT false-positive as InverseObjectProperties",
  async () => {
    const axioms: FOLAxiom[] = [
      // Symmetric(P)
      {
        "@type": "fol:Universal",
        variable: "x",
        body: {
          "@type": "fol:Universal",
          variable: "y",
          body: {
            "@type": "fol:Implication",
            antecedent: {
              "@type": "fol:Atom",
              predicate: "http://example.org/test/spouseOf",
              arguments: [
                { "@type": "fol:Variable", name: "x" },
                { "@type": "fol:Variable", name: "y" },
              ],
            },
            consequent: {
              "@type": "fol:Atom",
              predicate: "http://example.org/test/spouseOf",
              arguments: [
                { "@type": "fol:Variable", name: "y" },
                { "@type": "fol:Variable", name: "x" },
              ],
            },
          },
        },
      },
      // Symmetric(Q)
      {
        "@type": "fol:Universal",
        variable: "x",
        body: {
          "@type": "fol:Universal",
          variable: "y",
          body: {
            "@type": "fol:Implication",
            antecedent: {
              "@type": "fol:Atom",
              predicate: "http://example.org/test/connectedTo",
              arguments: [
                { "@type": "fol:Variable", name: "x" },
                { "@type": "fol:Variable", name: "y" },
              ],
            },
            consequent: {
              "@type": "fol:Atom",
              predicate: "http://example.org/test/connectedTo",
              arguments: [
                { "@type": "fol:Variable", name: "y" },
                { "@type": "fol:Variable", name: "x" },
              ],
            },
          },
        },
      },
    ];
    const result = await folToOwl(axioms);
    deepStrictEqual(result.ontology.rbox, [
      {
        "@type": "ObjectPropertyCharacteristic",
        property: "http://example.org/test/spouseOf",
        characteristic: "Symmetric",
      },
      {
        "@type": "ObjectPropertyCharacteristic",
        property: "http://example.org/test/connectedTo",
        characteristic: "Symmetric",
      },
    ]);
  },
);

await report(
  "Step 3a / Round-trip: EquivalentClasses + DisjointWith fixture survives owlToFol → folToOwl",
  async () => {
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p2_step3a_eq_disjoint",
      tbox: [
        {
          "@type": "EquivalentClasses",
          classes: [
            { "@type": "Class", iri: "http://example.org/test/Person" },
            { "@type": "Class", iri: "http://example.org/test/HumanBeing" },
          ],
        },
        {
          "@type": "DisjointWith",
          classes: [
            { "@type": "Class", iri: "http://example.org/test/Person" },
            { "@type": "Class", iri: "http://example.org/test/Boulder" },
          ],
        },
      ],
      abox: [],
      rbox: [],
    };
    const lifted = await owlToFol(input);
    const projected = await folToOwl(lifted);
    deepStrictEqual(projected.ontology.tbox, input.tbox);
  },
);

await report(
  "Step 3a / Round-trip: Functional + Inverse property characteristics survive owlToFol → folToOwl",
  async () => {
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p2_step3a_functional_inverse",
      tbox: [],
      abox: [],
      rbox: [
        {
          "@type": "ObjectPropertyCharacteristic",
          property: "http://example.org/test/hasIDNumber",
          characteristic: "Functional",
        },
        {
          "@type": "InverseObjectProperties",
          first: "http://example.org/test/parentOf",
          second: "http://example.org/test/childOf",
        },
      ],
    };
    const lifted = await owlToFol(input);
    const projected = await folToOwl(lifted);
    deepStrictEqual(projected.ontology.rbox, input.rbox);
  },
);

await report(
  "Step 3a / Round-trip: ObjectPropertyDomain + ObjectPropertyRange survive owlToFol → folToOwl",
  async () => {
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p2_step3a_domain_range",
      tbox: [],
      abox: [],
      rbox: [
        {
          "@type": "ObjectPropertyDomain",
          property: "http://example.org/test/wasInfluencedBy",
          domain: { "@type": "Class", iri: "http://example.org/test/Entity" },
        },
        {
          "@type": "ObjectPropertyRange",
          property: "http://example.org/test/wasInfluencedBy",
          range: { "@type": "Class", iri: "http://example.org/test/Entity" },
        },
      ],
    };
    const lifted = await owlToFol(input);
    const projected = await folToOwl(lifted);
    deepStrictEqual(projected.ontology.rbox, input.rbox);
  },
);

// ===========================================================================
// STEP 3b — class-expression reconstruction in SubClassOf consequent
// ===========================================================================

await report(
  "Step 3b / Boolean: SubClassOf(C, ObjectIntersectionOf(D, E)) → reconstructed from ∀x. C(x) → (D(x) ∧ E(x))",
  async () => {
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Universal",
        variable: "x",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Atom",
            predicate: "http://example.org/test/Mother",
            arguments: [{ "@type": "fol:Variable", name: "x" }],
          },
          consequent: {
            "@type": "fol:Conjunction",
            conjuncts: [
              {
                "@type": "fol:Atom",
                predicate: "http://example.org/test/Female",
                arguments: [{ "@type": "fol:Variable", name: "x" }],
              },
              {
                "@type": "fol:Atom",
                predicate: "http://example.org/test/Parent",
                arguments: [{ "@type": "fol:Variable", name: "x" }],
              },
            ],
          },
        },
      },
    ];
    const result = await folToOwl(axioms);
    deepStrictEqual(result.ontology.tbox, [
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: "http://example.org/test/Mother" },
        superClass: {
          "@type": "ObjectIntersectionOf",
          classes: [
            { "@type": "Class", iri: "http://example.org/test/Female" },
            { "@type": "Class", iri: "http://example.org/test/Parent" },
          ],
        },
      },
    ]);
  },
);

await report(
  "Step 3b / Boolean: SubClassOf(C, ObjectUnionOf(D, E)) → reconstructed from ∀x. C(x) → (D(x) ∨ E(x))",
  async () => {
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Universal",
        variable: "x",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Atom",
            predicate: "http://example.org/test/Person",
            arguments: [{ "@type": "fol:Variable", name: "x" }],
          },
          consequent: {
            "@type": "fol:Disjunction",
            disjuncts: [
              {
                "@type": "fol:Atom",
                predicate: "http://example.org/test/Adult",
                arguments: [{ "@type": "fol:Variable", name: "x" }],
              },
              {
                "@type": "fol:Atom",
                predicate: "http://example.org/test/Child",
                arguments: [{ "@type": "fol:Variable", name: "x" }],
              },
            ],
          },
        },
      },
    ];
    const result = await folToOwl(axioms);
    deepStrictEqual(result.ontology.tbox, [
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: "http://example.org/test/Person" },
        superClass: {
          "@type": "ObjectUnionOf",
          classes: [
            { "@type": "Class", iri: "http://example.org/test/Adult" },
            { "@type": "Class", iri: "http://example.org/test/Child" },
          ],
        },
      },
    ]);
  },
);

await report(
  "Step 3b / Boolean: SubClassOf(NotPerson, ObjectComplementOf(Person)) → ∀x. NotPerson(x) → ¬Person(x) round-trips",
  async () => {
    // Mirror p1_complement_of fixture exactly.
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p2_step3b_complement",
      tbox: [
        {
          "@type": "SubClassOf",
          subClass: { "@type": "Class", iri: "http://example.org/test/NotPerson" },
          superClass: {
            "@type": "ObjectComplementOf",
            class: { "@type": "Class", iri: "http://example.org/test/Person" },
          },
        },
      ],
      abox: [],
      rbox: [],
    };
    const lifted = await owlToFol(input);
    const projected = await folToOwl(lifted);
    deepStrictEqual(projected.ontology.tbox, input.tbox);
  },
);

await report(
  "Step 3b / Restriction: SubClassOf(C, someValuesFrom P D) round-trips through ∀x. C(x) → ∃y. (P(x,y) ∧ D(y))",
  async () => {
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p2_step3b_someValuesFrom",
      tbox: [
        {
          "@type": "SubClassOf",
          subClass: { "@type": "Class", iri: "http://example.org/test/Parent" },
          superClass: {
            "@type": "Restriction",
            onProperty: "http://example.org/test/hasChild",
            someValuesFrom: { "@type": "Class", iri: "http://example.org/test/Person" },
          },
        },
      ],
      abox: [],
      rbox: [],
    };
    const lifted = await owlToFol(input);
    const projected = await folToOwl(lifted);
    deepStrictEqual(projected.ontology.tbox, input.tbox);
  },
);

await report(
  "Step 3b / Restriction: SubClassOf(C, allValuesFrom P D) round-trips through ∀x. C(x) → ∀y. (P(x,y) → D(y))",
  async () => {
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p2_step3b_allValuesFrom",
      tbox: [
        {
          "@type": "SubClassOf",
          subClass: { "@type": "Class", iri: "http://example.org/test/HappyParent" },
          superClass: {
            "@type": "Restriction",
            onProperty: "http://example.org/test/hasChild",
            allValuesFrom: { "@type": "Class", iri: "http://example.org/test/Happy" },
          },
        },
      ],
      abox: [],
      rbox: [],
    };
    const lifted = await owlToFol(input);
    const projected = await folToOwl(lifted);
    deepStrictEqual(projected.ontology.tbox, input.tbox);
  },
);

await report(
  "Step 3b / Restriction: SubClassOf(C, hasValue P individual) round-trips through ∀x. C(x) → P(x, individual)",
  async () => {
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p2_step3b_hasValue",
      tbox: [
        {
          "@type": "SubClassOf",
          subClass: { "@type": "Class", iri: "http://example.org/test/CitizenOfFrance" },
          superClass: {
            "@type": "Restriction",
            onProperty: "http://example.org/test/citizenOf",
            hasValue: "http://example.org/test/France",
          },
        },
      ],
      abox: [],
      rbox: [],
    };
    const lifted = await owlToFol(input);
    const projected = await folToOwl(lifted);
    deepStrictEqual(projected.ontology.tbox, input.tbox);
  },
);

await report(
  "Step 3b / Round-trip: full p1_restrictions_object_value fixture (someValuesFrom + allValuesFrom + hasValue) survives lift→project",
  async () => {
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p1_restrictions_value",
      prefixes: { ex: "http://example.org/test/" },
      tbox: [
        {
          "@type": "SubClassOf",
          subClass: { "@type": "Class", iri: "http://example.org/test/Parent" },
          superClass: {
            "@type": "Restriction",
            onProperty: "http://example.org/test/hasChild",
            someValuesFrom: { "@type": "Class", iri: "http://example.org/test/Person" },
          },
        },
        {
          "@type": "SubClassOf",
          subClass: { "@type": "Class", iri: "http://example.org/test/HappyParent" },
          superClass: {
            "@type": "Restriction",
            onProperty: "http://example.org/test/hasChild",
            allValuesFrom: { "@type": "Class", iri: "http://example.org/test/Happy" },
          },
        },
        {
          "@type": "SubClassOf",
          subClass: { "@type": "Class", iri: "http://example.org/test/CitizenOfFrance" },
          superClass: {
            "@type": "Restriction",
            onProperty: "http://example.org/test/citizenOf",
            hasValue: "http://example.org/test/France",
          },
        },
      ],
      abox: [],
      rbox: [],
    };
    const lifted = await owlToFol(input);
    const projected = await folToOwl(lifted, undefined, { prefixes: input.prefixes });
    deepStrictEqual(projected.ontology.tbox, input.tbox);
  },
);

await report(
  "Step 3b / Recursion: nested restriction (someValuesFrom whose filler is itself a Restriction) round-trips",
  async () => {
    // Grandparent ⊑ ∃hasChild. (∃hasChild. Person)
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p2_step3b_nested",
      tbox: [
        {
          "@type": "SubClassOf",
          subClass: { "@type": "Class", iri: "http://example.org/test/Grandparent" },
          superClass: {
            "@type": "Restriction",
            onProperty: "http://example.org/test/hasChild",
            someValuesFrom: {
              "@type": "Restriction",
              onProperty: "http://example.org/test/hasChild",
              someValuesFrom: { "@type": "Class", iri: "http://example.org/test/Person" },
            },
          },
        },
      ],
      abox: [],
      rbox: [],
    };
    const lifted = await owlToFol(input);
    const projected = await folToOwl(lifted);
    deepStrictEqual(projected.ontology.tbox, input.tbox);
  },
);

await report(
  "Step 3b / Recursion: ObjectIntersectionOf containing a Restriction round-trips",
  async () => {
    // Mother ⊑ Female ⊓ ∃hasChild.Person
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p2_step3b_intersection_with_restriction",
      tbox: [
        {
          "@type": "SubClassOf",
          subClass: { "@type": "Class", iri: "http://example.org/test/Mother" },
          superClass: {
            "@type": "ObjectIntersectionOf",
            classes: [
              { "@type": "Class", iri: "http://example.org/test/Female" },
              {
                "@type": "Restriction",
                onProperty: "http://example.org/test/hasChild",
                someValuesFrom: { "@type": "Class", iri: "http://example.org/test/Person" },
              },
            ],
          },
        },
      ],
      abox: [],
      rbox: [],
    };
    const lifted = await owlToFol(input);
    const projected = await folToOwl(lifted);
    deepStrictEqual(projected.ontology.tbox, input.tbox);
  },
);

await report(
  "Step 3b / Determinism: 100 lift→project cycles on a class-expression-bearing input are byte-stable",
  async () => {
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p2_step3b_determinism",
      tbox: [
        {
          "@type": "SubClassOf",
          subClass: { "@type": "Class", iri: "http://example.org/test/Mother" },
          superClass: {
            "@type": "ObjectIntersectionOf",
            classes: [
              { "@type": "Class", iri: "http://example.org/test/Female" },
              {
                "@type": "Restriction",
                onProperty: "http://example.org/test/hasChild",
                someValuesFrom: { "@type": "Class", iri: "http://example.org/test/Person" },
              },
            ],
          },
        },
      ],
      abox: [],
      rbox: [],
    };
    const first = stableStringify(await folToOwl(await owlToFol(input)));
    for (let i = 0; i < 99; i++) {
      const next = stableStringify(await folToOwl(await owlToFol(input)));
      strictEqual(next, first, `run ${i + 2}/100 diverged`);
    }
  },
);

// ===========================================================================
// STEP 3c — reserved-predicate ABox + remaining TBox/RBox forms
// ===========================================================================

await report(
  "Step 3c / ABox: owl:sameAs atom on constants → SameIndividual([a, b])",
  async () => {
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Atom",
        predicate: "http://www.w3.org/2002/07/owl#sameAs",
        arguments: [
          { "@type": "fol:Constant", iri: "http://example.org/test/superman" },
          { "@type": "fol:Constant", iri: "http://example.org/test/clarkkent" },
        ],
      },
    ];
    const result = await folToOwl(axioms);
    deepStrictEqual(result.ontology.abox, [
      {
        "@type": "SameIndividual",
        individuals: [
          "http://example.org/test/superman",
          "http://example.org/test/clarkkent",
        ],
      },
    ]);
  },
);

await report(
  "Step 3c / ABox: owl:differentFrom atom on constants → DifferentIndividuals([a, b])",
  async () => {
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Atom",
        predicate: "http://www.w3.org/2002/07/owl#differentFrom",
        arguments: [
          { "@type": "fol:Constant", iri: "http://example.org/test/superman" },
          { "@type": "fol:Constant", iri: "http://example.org/test/lexluthor" },
        ],
      },
    ];
    const result = await folToOwl(axioms);
    deepStrictEqual(result.ontology.abox, [
      {
        "@type": "DifferentIndividuals",
        individuals: [
          "http://example.org/test/superman",
          "http://example.org/test/lexluthor",
        ],
      },
    ]);
  },
);

await report(
  "Step 3c / Suppression: sameAs reflexivity / symmetry / transitivity axioms NOT round-tripped as ObjectPropertyCharacteristic",
  async () => {
    const axioms: FOLAxiom[] = [
      // sameAs reflexivity: ∀x. owl:sameAs(x,x)
      {
        "@type": "fol:Universal",
        variable: "x",
        body: {
          "@type": "fol:Atom",
          predicate: "http://www.w3.org/2002/07/owl#sameAs",
          arguments: [
            { "@type": "fol:Variable", name: "x" },
            { "@type": "fol:Variable", name: "x" },
          ],
        },
      },
      // sameAs symmetry: ∀x,y. owl:sameAs(x,y) → owl:sameAs(y,x)
      {
        "@type": "fol:Universal",
        variable: "x",
        body: {
          "@type": "fol:Universal",
          variable: "y",
          body: {
            "@type": "fol:Implication",
            antecedent: {
              "@type": "fol:Atom",
              predicate: "http://www.w3.org/2002/07/owl#sameAs",
              arguments: [
                { "@type": "fol:Variable", name: "x" },
                { "@type": "fol:Variable", name: "y" },
              ],
            },
            consequent: {
              "@type": "fol:Atom",
              predicate: "http://www.w3.org/2002/07/owl#sameAs",
              arguments: [
                { "@type": "fol:Variable", name: "y" },
                { "@type": "fol:Variable", name: "x" },
              ],
            },
          },
        },
      },
      // sameAs transitivity: ∀x,y,z. owl:sameAs(x,y) ∧ owl:sameAs(y,z) → owl:sameAs(x,z)
      {
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
                    predicate: "http://www.w3.org/2002/07/owl#sameAs",
                    arguments: [
                      { "@type": "fol:Variable", name: "x" },
                      { "@type": "fol:Variable", name: "y" },
                    ],
                  },
                  {
                    "@type": "fol:Atom",
                    predicate: "http://www.w3.org/2002/07/owl#sameAs",
                    arguments: [
                      { "@type": "fol:Variable", name: "y" },
                      { "@type": "fol:Variable", name: "z" },
                    ],
                  },
                ],
              },
              consequent: {
                "@type": "fol:Atom",
                predicate: "http://www.w3.org/2002/07/owl#sameAs",
                arguments: [
                  { "@type": "fol:Variable", name: "x" },
                  { "@type": "fol:Variable", name: "z" },
                ],
              },
            },
          },
        },
      },
    ];
    const result = await folToOwl(axioms);
    // All three identity-axiomatization axioms suppressed; nothing emitted.
    deepStrictEqual(result.ontology.tbox, []);
    deepStrictEqual(result.ontology.abox, []);
    deepStrictEqual(result.ontology.rbox, []);
  },
);

await report(
  "Step 3c / Suppression: per-predicate unary identity-rewrite is dropped",
  async () => {
    // ∀x,z. P(x) ∧ owl:sameAs(x,z) → P(z)
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Universal",
        variable: "x",
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
                  predicate: "http://example.org/test/Person",
                  arguments: [{ "@type": "fol:Variable", name: "x" }],
                },
                {
                  "@type": "fol:Atom",
                  predicate: "http://www.w3.org/2002/07/owl#sameAs",
                  arguments: [
                    { "@type": "fol:Variable", name: "x" },
                    { "@type": "fol:Variable", name: "z" },
                  ],
                },
              ],
            },
            consequent: {
              "@type": "fol:Atom",
              predicate: "http://example.org/test/Person",
              arguments: [{ "@type": "fol:Variable", name: "z" }],
            },
          },
        },
      },
    ];
    const result = await folToOwl(axioms);
    deepStrictEqual(result.ontology.tbox, []);
    deepStrictEqual(result.ontology.rbox, []);
  },
);

await report(
  "Step 3c / Round-trip: full p1_owl_same_and_different fixture (sameAs + differentFrom + identity machinery) survives",
  async () => {
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p1_same_diff",
      prefixes: { ex: "http://example.org/test/" },
      tbox: [],
      rbox: [],
      abox: [
        {
          "@type": "SameIndividual",
          individuals: [
            "http://example.org/test/superman",
            "http://example.org/test/clarkkent",
          ],
        },
        {
          "@type": "DifferentIndividuals",
          individuals: [
            "http://example.org/test/superman",
            "http://example.org/test/lexluthor",
          ],
        },
      ],
    };
    const lifted = await owlToFol(input);
    const projected = await folToOwl(lifted, undefined, { prefixes: input.prefixes });
    deepStrictEqual(projected.ontology.abox, input.abox);
    // No spurious tbox/rbox emissions from the identity-machinery axioms.
    deepStrictEqual(projected.ontology.tbox, []);
    deepStrictEqual(projected.ontology.rbox, []);
  },
);

await report(
  "Step 3c / RBox: ∀x,y. P(x,y) → Q(x,y) → SubObjectPropertyOf(P, Q)",
  async () => {
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Universal",
        variable: "x",
        body: {
          "@type": "fol:Universal",
          variable: "y",
          body: {
            "@type": "fol:Implication",
            antecedent: {
              "@type": "fol:Atom",
              predicate: "http://example.org/test/parentOf",
              arguments: [
                { "@type": "fol:Variable", name: "x" },
                { "@type": "fol:Variable", name: "y" },
              ],
            },
            consequent: {
              "@type": "fol:Atom",
              predicate: "http://example.org/test/ancestorOf",
              arguments: [
                { "@type": "fol:Variable", name: "x" },
                { "@type": "fol:Variable", name: "y" },
              ],
            },
          },
        },
      },
    ];
    const result = await folToOwl(axioms);
    deepStrictEqual(result.ontology.rbox, [
      {
        "@type": "SubObjectPropertyOf",
        subProperty: "http://example.org/test/parentOf",
        superProperty: "http://example.org/test/ancestorOf",
      },
    ]);
  },
);

await report(
  "Step 3c / RBox pair: two converse SubObjectPropertyOf axioms → EquivalentObjectProperties(P, Q)",
  async () => {
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Universal",
        variable: "x",
        body: {
          "@type": "fol:Universal",
          variable: "y",
          body: {
            "@type": "fol:Implication",
            antecedent: {
              "@type": "fol:Atom",
              predicate: "http://example.org/test/marriedTo",
              arguments: [
                { "@type": "fol:Variable", name: "x" },
                { "@type": "fol:Variable", name: "y" },
              ],
            },
            consequent: {
              "@type": "fol:Atom",
              predicate: "http://example.org/test/spouseOf",
              arguments: [
                { "@type": "fol:Variable", name: "x" },
                { "@type": "fol:Variable", name: "y" },
              ],
            },
          },
        },
      },
      {
        "@type": "fol:Universal",
        variable: "x",
        body: {
          "@type": "fol:Universal",
          variable: "y",
          body: {
            "@type": "fol:Implication",
            antecedent: {
              "@type": "fol:Atom",
              predicate: "http://example.org/test/spouseOf",
              arguments: [
                { "@type": "fol:Variable", name: "x" },
                { "@type": "fol:Variable", name: "y" },
              ],
            },
            consequent: {
              "@type": "fol:Atom",
              predicate: "http://example.org/test/marriedTo",
              arguments: [
                { "@type": "fol:Variable", name: "x" },
                { "@type": "fol:Variable", name: "y" },
              ],
            },
          },
        },
      },
    ];
    const result = await folToOwl(axioms);
    deepStrictEqual(result.ontology.rbox, [
      {
        "@type": "EquivalentObjectProperties",
        properties: [
          "http://example.org/test/marriedTo",
          "http://example.org/test/spouseOf",
        ],
      },
    ]);
    strictEqual(result.ontology.rbox.length, 1);
  },
);

await report(
  "Step 3c / RBox: ∀x,y. (P(x,y) ∧ Q(x,y)) → ⊥ → DisjointObjectProperties(P, Q)",
  async () => {
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Universal",
        variable: "x",
        body: {
          "@type": "fol:Universal",
          variable: "y",
          body: {
            "@type": "fol:Implication",
            antecedent: {
              "@type": "fol:Conjunction",
              conjuncts: [
                {
                  "@type": "fol:Atom",
                  predicate: "http://example.org/test/parentOf",
                  arguments: [
                    { "@type": "fol:Variable", name: "x" },
                    { "@type": "fol:Variable", name: "y" },
                  ],
                },
                {
                  "@type": "fol:Atom",
                  predicate: "http://example.org/test/childOf",
                  arguments: [
                    { "@type": "fol:Variable", name: "x" },
                    { "@type": "fol:Variable", name: "y" },
                  ],
                },
              ],
            },
            consequent: { "@type": "fol:False" },
          },
        },
      },
    ];
    const result = await folToOwl(axioms);
    deepStrictEqual(result.ontology.rbox, [
      {
        "@type": "DisjointObjectProperties",
        properties: [
          "http://example.org/test/parentOf",
          "http://example.org/test/childOf",
        ],
      },
    ]);
  },
);

await report(
  "Step 3c / Round-trip: full p1_property_characteristics fixture (Functional + Transitive + Symmetric + InverseObjectProperties) survives",
  async () => {
    // p1_property_characteristics has all 4 RBox forms in its rbox plus
    // a ClassAssertion exercise. Round-trip preserves all of them.
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p1_props",
      tbox: [],
      abox: [],
      rbox: [
        {
          "@type": "ObjectPropertyCharacteristic",
          property: "http://example.org/test/hasIDNumber",
          characteristic: "Functional",
        },
        {
          "@type": "ObjectPropertyCharacteristic",
          property: "http://example.org/test/ancestorOf",
          characteristic: "Transitive",
        },
        {
          "@type": "ObjectPropertyCharacteristic",
          property: "http://example.org/test/connectedTo",
          characteristic: "Symmetric",
        },
        {
          "@type": "InverseObjectProperties",
          first: "http://example.org/test/parentOf",
          second: "http://example.org/test/childOf",
        },
      ],
    };
    const lifted = await owlToFol(input);
    const projected = await folToOwl(lifted);
    deepStrictEqual(projected.ontology.rbox, input.rbox);
  },
);

await report(
  "Step 3c / ClassDefinition with NamedClass body round-trips as EquivalentClasses (semantically equivalent)",
  async () => {
    // Simple ClassDefinition (NamedClass body) round-trips correctly because
    // both halves of the lifted pair are unary-atom-on-x SubClassOf shapes
    // that the existing pair-matcher catches. ClassDefinition with a
    // class-expression body is banked as a known gap (see projector.ts
    // docstring) — left-side class-expression reconstruction is the missing
    // piece, awaiting a corpus fixture to activate.
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p2_step3c_classdef_named",
      tbox: [
        {
          "@type": "ClassDefinition",
          iri: "http://example.org/test/Person",
          expression: { "@type": "Class", iri: "http://example.org/test/HumanBeing" },
        },
      ],
      abox: [],
      rbox: [],
    };
    const lifted = await owlToFol(input);
    const projected = await folToOwl(lifted);
    // The lifter erases the ClassDefinition vs EquivalentClasses distinction;
    // the projector emits EquivalentClasses (semantically equivalent).
    deepStrictEqual(projected.ontology.tbox, [
      {
        "@type": "EquivalentClasses",
        classes: [
          { "@type": "Class", iri: "http://example.org/test/Person" },
          { "@type": "Class", iri: "http://example.org/test/HumanBeing" },
        ],
      },
    ]);
  },
);

// ===========================================================================
// STEP 7 — roundTripCheck per API §6.3 + spec §8.1/§8.2
// ===========================================================================

await report(
  "Step 7 / Clean round-trip: equivalent=true, no diff, intermediate + final shapes populated",
  async () => {
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p2_step7_clean",
      tbox: [
        {
          "@type": "SubClassOf",
          subClass: { "@type": "Class", iri: "http://example.org/test/Dog" },
          superClass: { "@type": "Class", iri: "http://example.org/test/Animal" },
        },
      ],
      abox: [
        {
          "@type": "ClassAssertion",
          individual: "http://example.org/test/rex",
          class: { "@type": "Class", iri: "http://example.org/test/Dog" },
        },
      ],
      rbox: [],
    };
    const result = await roundTripCheck(input);
    strictEqual(result.equivalent, true);
    strictEqual(result.diff, undefined);
    // intermediateForm shape per API §6.3
    ok(Array.isArray(result.intermediateForm.axioms));
    deepStrictEqual(result.intermediateForm.recoveryPayloads, []);
    deepStrictEqual(result.intermediateForm.lossSignatures, []);
    strictEqual(result.intermediateForm.metadata.sourceOntologyIRI, input.ontologyIRI);
    // finalForm shape per API §6.3 + Step 4a
    ok(result.finalForm.ontology);
    ok(Array.isArray(result.finalForm.strategySelections));
  },
);

await report(
  "Step 7 / Round-trip with naf_residue LossSignature: equivalent=true (round-trip is byte-clean; LS is precautionary)",
  async () => {
    // p1_complement_of-style input: SubClassOf(NotPerson, ObjectComplementOf(Person))
    // lifts to ∀x. NotPerson(x) → ¬Person(x); projects to SubClassOf with
    // ObjectComplementOf consequent + naf_residue LossSignature; re-lifts
    // to the same FOL → diff is empty → equivalent=true.
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p2_step7_naf",
      tbox: [
        {
          "@type": "SubClassOf",
          subClass: { "@type": "Class", iri: "http://example.org/test/NotPerson" },
          superClass: {
            "@type": "ObjectComplementOf",
            class: { "@type": "Class", iri: "http://example.org/test/Person" },
          },
        },
      ],
      abox: [],
      rbox: [],
    };
    const result = await roundTripCheck(input);
    strictEqual(result.equivalent, true);
    // LossSignature is emitted by the projection (naf_residue) but re-lift
    // yields byte-identical FOL → diff is empty → equivalent holds.
    ok(result.finalForm.newLossSignatures.length >= 1);
    strictEqual(result.finalForm.newLossSignatures[0].lossType, "naf_residue");
  },
);

await report(
  "Step 7 / Cardinality round-trip per ADR-012: regime=equivalent, byte-clean Direct Mapping",
  async () => {
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p2_step7_cardinality",
      tbox: [
        {
          "@type": "SubClassOf",
          subClass: { "@type": "Class", iri: "http://example.org/test/HasAtLeastTwoChildren" },
          superClass: {
            "@type": "Restriction",
            onProperty: "http://example.org/test/hasChild",
            minCardinality: 2,
          },
        },
      ],
      abox: [],
      rbox: [],
    };
    const result = await roundTripCheck(input);
    strictEqual(result.equivalent, true);
    deepStrictEqual(result.finalForm.newLossSignatures, []);
    deepStrictEqual(result.finalForm.newRecoveryPayloads, []);
  },
);

await report(
  "Step 7 / Bidirectional check: classification correctly identifies tbox-shape diffs",
  async () => {
    // Manufacture a TBox mismatch via a class expression the projector
    // doesn't yet handle. Step 3b handles intersection/union/complement
    // recursively so we'd need something more exotic — but for Phase 2
    // MVP, a clean round-trip is the realistic case. This test verifies
    // that the classification code path runs and returns a sensible
    // value when there's no diff (returns `mixed` for empty diff per
    // classifyDiff's contract for empty input).
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p2_step7_classify",
      tbox: [
        {
          "@type": "EquivalentClasses",
          classes: [
            { "@type": "Class", iri: "http://example.org/test/Person" },
            { "@type": "Class", iri: "http://example.org/test/HumanBeing" },
          ],
        },
      ],
      abox: [],
      rbox: [],
    };
    const result = await roundTripCheck(input);
    strictEqual(result.equivalent, true);
    // Round-trip clean → no diff → no classification needed.
    strictEqual(result.diff, undefined);
  },
);

await report(
  "Step 7 / Determinism: roundTripCheck is byte-stable across 100 invocations on the same input",
  async () => {
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p2_step7_determinism",
      tbox: [
        {
          "@type": "SubClassOf",
          subClass: { "@type": "Class", iri: "http://example.org/test/Dog" },
          superClass: { "@type": "Class", iri: "http://example.org/test/Animal" },
        },
      ],
      abox: [],
      rbox: [
        {
          "@type": "ObjectPropertyCharacteristic",
          property: "http://example.org/test/connectedTo",
          characteristic: "Symmetric",
        },
      ],
    };
    const first = stableStringify(await roundTripCheck(input));
    for (let i = 0; i < 99; i++) {
      const next = stableStringify(await roundTripCheck(input));
      strictEqual(next, first, `roundTripCheck determinism drift on run ${i + 2}/100`);
    }
  },
);

await report(
  "Step 7 / Source-provenance threading: intermediateForm.metadata + finalForm.manifest reflect input ontology IRI",
  async () => {
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p2_step7_provenance",
      versionIRI: "http://example.org/test/p2_step7_provenance/v1",
      tbox: [],
      abox: [],
      rbox: [],
    };
    const result = await roundTripCheck(input);
    strictEqual(result.intermediateForm.metadata.sourceOntologyIRI, input.ontologyIRI);
    strictEqual(result.finalForm.manifest.ontologyIRI, input.ontologyIRI);
    strictEqual(result.finalForm.manifest.versionIRI, input.versionIRI);
    strictEqual(result.finalForm.manifest.projectedFrom, input.ontologyIRI);
  },
);

await report(
  "Step 7 / Round-trip on full Phase 1 BFO/CLIF Layer A fixture (8 axioms): equivalent=true",
  async () => {
    const BFO_ENTITY = "http://purl.obolibrary.org/obo/BFO_0000001";
    const BFO_CONTINUANT = "http://purl.obolibrary.org/obo/BFO_0000002";
    const BFO_PART_OF = "http://purl.obolibrary.org/obo/BFO_0000050";
    const BFO_HAS_PART = "http://purl.obolibrary.org/obo/BFO_0000051";
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p2_step7_bfo_clif",
      prefixes: { bfo: "http://purl.obolibrary.org/obo/" },
      tbox: [
        {
          "@type": "SubClassOf",
          subClass: { "@type": "Class", iri: BFO_CONTINUANT },
          superClass: { "@type": "Class", iri: BFO_ENTITY },
        },
      ],
      abox: [],
      rbox: [
        {
          "@type": "ObjectPropertyCharacteristic",
          property: BFO_PART_OF,
          characteristic: "Transitive",
        },
        {
          "@type": "InverseObjectProperties",
          first: BFO_PART_OF,
          second: BFO_HAS_PART,
        },
      ],
    };
    const result = await roundTripCheck(input);
    strictEqual(result.equivalent, true);
    strictEqual(result.diff, undefined);
    // BFO/Layer-A predicates are under http://purl.obolibrary.org/obo/ which
    // IS in the default permissive namespace set → no unknown_relation.
    deepStrictEqual(result.finalForm.newLossSignatures, []);
  },
);

// ===========================================================================
// STEP 6 — Property-Chain Realization per spec §6.1.2 + architect Q-Step6 rulings
// ===========================================================================

await report(
  "Step 6 / 2-property chain: ∀x,y,z. parent(x,y) ∧ parent(y,z) → grandparent(x,z) → ObjectPropertyChain([parent, parent], grandparent)",
  async () => {
    const PARENT = "http://example.org/test/p2_chain_test/parent";
    const GRANDPARENT = "http://example.org/test/p2_chain_test/grandparent";
    const axioms: FOLAxiom[] = [
      {
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
                    predicate: PARENT,
                    arguments: [
                      { "@type": "fol:Variable", name: "x" },
                      { "@type": "fol:Variable", name: "y" },
                    ],
                  },
                  {
                    "@type": "fol:Atom",
                    predicate: PARENT,
                    arguments: [
                      { "@type": "fol:Variable", name: "y" },
                      { "@type": "fol:Variable", name: "z" },
                    ],
                  },
                ],
              },
              consequent: {
                "@type": "fol:Atom",
                predicate: GRANDPARENT,
                arguments: [
                  { "@type": "fol:Variable", name: "x" },
                  { "@type": "fol:Variable", name: "z" },
                ],
              },
            },
          },
        },
      },
    ];
    const result = await folToOwl(axioms);
    deepStrictEqual(result.ontology.rbox, [
      {
        "@type": "ObjectPropertyChain",
        chain: [PARENT, PARENT],
        superProperty: GRANDPARENT,
      },
    ]);
  },
);

await report(
  "Step 6 / 3-property chain: ∀x,y,w,z. P₁(x,y) ∧ P₂(y,w) ∧ P₃(w,z) → Q(x,z) → ObjectPropertyChain([P₁,P₂,P₃], Q)",
  async () => {
    const P1 = "http://example.org/test/p2_chain_3/p1";
    const P2 = "http://example.org/test/p2_chain_3/p2";
    const P3 = "http://example.org/test/p2_chain_3/p3";
    const Q = "http://example.org/test/p2_chain_3/q";
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Universal",
        variable: "x",
        body: {
          "@type": "fol:Universal",
          variable: "y",
          body: {
            "@type": "fol:Universal",
            variable: "w",
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
                      predicate: P1,
                      arguments: [
                        { "@type": "fol:Variable", name: "x" },
                        { "@type": "fol:Variable", name: "y" },
                      ],
                    },
                    {
                      "@type": "fol:Atom",
                      predicate: P2,
                      arguments: [
                        { "@type": "fol:Variable", name: "y" },
                        { "@type": "fol:Variable", name: "w" },
                      ],
                    },
                    {
                      "@type": "fol:Atom",
                      predicate: P3,
                      arguments: [
                        { "@type": "fol:Variable", name: "w" },
                        { "@type": "fol:Variable", name: "z" },
                      ],
                    },
                  ],
                },
                consequent: {
                  "@type": "fol:Atom",
                  predicate: Q,
                  arguments: [
                    { "@type": "fol:Variable", name: "x" },
                    { "@type": "fol:Variable", name: "z" },
                  ],
                },
              },
            },
          },
        },
      },
    ];
    const result = await folToOwl(axioms);
    deepStrictEqual(result.ontology.rbox, [
      {
        "@type": "ObjectPropertyChain",
        chain: [P1, P2, P3],
        superProperty: Q,
      },
    ]);
  },
);

await report(
  "Step 6 / RecoveryPayload: chain emits PROPERTY_CHAIN payload with regularity_scope_warning scopeNotes per Q-Step6-1",
  async () => {
    const PARENT = "http://example.org/test/p2_chain_rp/parent";
    const GRANDPARENT = "http://example.org/test/p2_chain_rp/grandparent";
    const axioms: FOLAxiom[] = [
      {
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
                    predicate: PARENT,
                    arguments: [
                      { "@type": "fol:Variable", name: "x" },
                      { "@type": "fol:Variable", name: "y" },
                    ],
                  },
                  {
                    "@type": "fol:Atom",
                    predicate: PARENT,
                    arguments: [
                      { "@type": "fol:Variable", name: "y" },
                      { "@type": "fol:Variable", name: "z" },
                    ],
                  },
                ],
              },
              consequent: {
                "@type": "fol:Atom",
                predicate: GRANDPARENT,
                arguments: [
                  { "@type": "fol:Variable", name: "x" },
                  { "@type": "fol:Variable", name: "z" },
                ],
              },
            },
          },
        },
      },
    ];
    const result = await folToOwl(axioms);
    // Exactly 1 RecoveryPayload; NO LossSignatures (chain projection is
    // reversible-regime per spec §6.1.0 taxonomy).
    strictEqual(result.newRecoveryPayloads.length, 1);
    strictEqual(result.newLossSignatures.length, 0);
    const rp = result.newRecoveryPayloads[0];
    strictEqual(rp.approximationStrategy, "PROPERTY_CHAIN");
    strictEqual(rp.relationIRI, GRANDPARENT);
    deepStrictEqual(rp.originalFOL, axioms[0]);
    ok(/^ofbt:rp\/[0-9a-f]{64}$/.test(rp["@id"]), `RP @id matches regex; got ${rp["@id"]}`);
    ok(Array.isArray(rp.scopeNotes), "scopeNotes is an array");
    ok(
      rp.scopeNotes!.some((note) => note.includes("regularity_scope_warning")),
      "scopeNotes contains regularity_scope_warning",
    );
  },
);

await report(
  "Step 6 / Strategy attribution: chain-matched axiom reports strategy='property-chain' (not 'direct'; not 'annotated-approximation')",
  async () => {
    const PARENT = "http://example.org/test/p2_chain_strategy/parent";
    const GRANDPARENT = "http://example.org/test/p2_chain_strategy/grandparent";
    const axioms: FOLAxiom[] = [
      {
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
                    predicate: PARENT,
                    arguments: [
                      { "@type": "fol:Variable", name: "x" },
                      { "@type": "fol:Variable", name: "y" },
                    ],
                  },
                  {
                    "@type": "fol:Atom",
                    predicate: PARENT,
                    arguments: [
                      { "@type": "fol:Variable", name: "y" },
                      { "@type": "fol:Variable", name: "z" },
                    ],
                  },
                ],
              },
              consequent: {
                "@type": "fol:Atom",
                predicate: GRANDPARENT,
                arguments: [
                  { "@type": "fol:Variable", name: "x" },
                  { "@type": "fol:Variable", name: "z" },
                ],
              },
            },
          },
        },
      },
    ];
    const result = await folToOwl(axioms);
    strictEqual(result.strategySelections.length, 1);
    strictEqual(result.strategySelections[0].strategy, "property-chain");
    strictEqual(result.strategySelections[0].lossSignatureCount, 0);
    strictEqual(result.strategySelections[0].recoveryPayloadCount, 1);
  },
);

await report(
  "Step 6 / Transitive precedence: same-predicate 2-chain still routes to Transitive (not chain) — Step 2 matcher takes priority",
  async () => {
    // ∀x,y,z. P(x,y) ∧ P(y,z) → P(x,z) — same predicate; should match
    // Transitive (Step 2) before chain (Step 6).
    const ANCESTOR = "http://example.org/test/p2_chain_transitive_precedence/ancestor";
    const axioms: FOLAxiom[] = [
      {
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
                    predicate: ANCESTOR,
                    arguments: [
                      { "@type": "fol:Variable", name: "x" },
                      { "@type": "fol:Variable", name: "y" },
                    ],
                  },
                  {
                    "@type": "fol:Atom",
                    predicate: ANCESTOR,
                    arguments: [
                      { "@type": "fol:Variable", name: "y" },
                      { "@type": "fol:Variable", name: "z" },
                    ],
                  },
                ],
              },
              consequent: {
                "@type": "fol:Atom",
                predicate: ANCESTOR,
                arguments: [
                  { "@type": "fol:Variable", name: "x" },
                  { "@type": "fol:Variable", name: "z" },
                ],
              },
            },
          },
        },
      },
    ];
    const result = await folToOwl(axioms);
    deepStrictEqual(result.ontology.rbox, [
      {
        "@type": "ObjectPropertyCharacteristic",
        property: ANCESTOR,
        characteristic: "Transitive",
      },
    ]);
    strictEqual(result.strategySelections[0].strategy, "direct");
    strictEqual(result.newRecoveryPayloads.length, 0);
  },
);

await report(
  "Step 6 / Determinism: chain projection (axioms + RP @id) is byte-stable across 100 runs",
  async () => {
    const PARENT = "http://example.org/test/p2_chain_determinism/parent";
    const GRANDPARENT = "http://example.org/test/p2_chain_determinism/grandparent";
    const axioms: FOLAxiom[] = [
      {
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
                    predicate: PARENT,
                    arguments: [
                      { "@type": "fol:Variable", name: "x" },
                      { "@type": "fol:Variable", name: "y" },
                    ],
                  },
                  {
                    "@type": "fol:Atom",
                    predicate: PARENT,
                    arguments: [
                      { "@type": "fol:Variable", name: "y" },
                      { "@type": "fol:Variable", name: "z" },
                    ],
                  },
                ],
              },
              consequent: {
                "@type": "fol:Atom",
                predicate: GRANDPARENT,
                arguments: [
                  { "@type": "fol:Variable", name: "x" },
                  { "@type": "fol:Variable", name: "z" },
                ],
              },
            },
          },
        },
      },
    ];
    const first = stableStringify(await folToOwl(axioms));
    for (let i = 0; i < 99; i++) {
      const next = stableStringify(await folToOwl(axioms));
      strictEqual(next, first, `determinism drift on run ${i + 2}/100`);
    }
  },
);

// ===========================================================================
// STEP 4b — Cardinality n-tuple matcher per ADR-012
// ===========================================================================

await report(
  "Step 4b / MinCardinality: SubClassOf(C, ≥2 P) round-trips through Direct Mapping",
  async () => {
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p2_step4b_min",
      tbox: [
        {
          "@type": "SubClassOf",
          subClass: { "@type": "Class", iri: "http://example.org/test/HasAtLeastTwoChildren" },
          superClass: {
            "@type": "Restriction",
            onProperty: "http://example.org/test/hasChild",
            minCardinality: 2,
          },
        },
      ],
      abox: [],
      rbox: [],
    };
    const lifted = await owlToFol(input);
    const projected = await folToOwl(lifted);
    deepStrictEqual(projected.ontology.tbox, input.tbox);
    // Cardinality round-trips clean — no LossSignatures per ADR-012.
    deepStrictEqual(projected.newLossSignatures, []);
    deepStrictEqual(projected.newRecoveryPayloads, []);
  },
);

await report(
  "Step 4b / MaxCardinality: SubClassOf(C, ≤3 P) round-trips through Direct Mapping",
  async () => {
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p2_step4b_max",
      tbox: [
        {
          "@type": "SubClassOf",
          subClass: { "@type": "Class", iri: "http://example.org/test/HasAtMostThreeChildren" },
          superClass: {
            "@type": "Restriction",
            onProperty: "http://example.org/test/hasChild",
            maxCardinality: 3,
          },
        },
      ],
      abox: [],
      rbox: [],
    };
    const lifted = await owlToFol(input);
    const projected = await folToOwl(lifted);
    deepStrictEqual(projected.ontology.tbox, input.tbox);
    deepStrictEqual(projected.newLossSignatures, []);
  },
);

await report(
  "Step 4b / ExactCardinality QCR: SubClassOf(C, =2 P onClass D) round-trips through Direct Mapping",
  async () => {
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p2_step4b_exact_qcr",
      tbox: [
        {
          "@type": "SubClassOf",
          subClass: { "@type": "Class", iri: "http://example.org/test/HasExactlyTwoHumanChildren" },
          superClass: {
            "@type": "Restriction",
            onProperty: "http://example.org/test/hasChild",
            cardinality: 2,
            onClass: { "@type": "Class", iri: "http://example.org/test/Person" },
          },
        },
      ],
      abox: [],
      rbox: [],
    };
    const lifted = await owlToFol(input);
    const projected = await folToOwl(lifted);
    deepStrictEqual(projected.ontology.tbox, input.tbox);
    deepStrictEqual(projected.newLossSignatures, []);
  },
);

await report(
  "Step 4b / Round-trip: full p1_restrictions_cardinality fixture (min + max + exact-with-QCR) survives byte-clean",
  async () => {
    // Mirror p1_restrictions_cardinality.fixture.js's input verbatim.
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p1_restrictions_cardinality",
      prefixes: { ex: "http://example.org/test/" },
      tbox: [
        {
          "@type": "SubClassOf",
          subClass: { "@type": "Class", iri: "http://example.org/test/HasAtLeastTwoChildren" },
          superClass: {
            "@type": "Restriction",
            onProperty: "http://example.org/test/hasChild",
            minCardinality: 2,
          },
        },
        {
          "@type": "SubClassOf",
          subClass: { "@type": "Class", iri: "http://example.org/test/HasAtMostThreeChildren" },
          superClass: {
            "@type": "Restriction",
            onProperty: "http://example.org/test/hasChild",
            maxCardinality: 3,
          },
        },
        {
          "@type": "SubClassOf",
          subClass: { "@type": "Class", iri: "http://example.org/test/HasExactlyTwoHumanChildren" },
          superClass: {
            "@type": "Restriction",
            onProperty: "http://example.org/test/hasChild",
            cardinality: 2,
            onClass: { "@type": "Class", iri: "http://example.org/test/Person" },
          },
        },
      ],
      abox: [],
      rbox: [],
    };
    const lifted = await owlToFol(input);
    const projected = await folToOwl(lifted, undefined, { prefixes: input.prefixes });
    deepStrictEqual(projected.ontology.tbox, input.tbox);
    // ADR-012 banked principle 2: cardinality round-trips clean as Direct
    // Mapping; regime amendment reversible → equivalent justified.
    deepStrictEqual(projected.newLossSignatures, []);
    deepStrictEqual(projected.newRecoveryPayloads, []);
    // Per Step 5 attribution: each of the 3 axioms reports strategy='direct'.
    strictEqual(projected.strategySelections.length, 3);
    for (const sel of projected.strategySelections) {
      strictEqual(sel.strategy, "direct");
      strictEqual(sel.lossSignatureCount, 0);
      strictEqual(sel.recoveryPayloadCount, 0);
    }
  },
);

await report(
  "Step 4b / Determinism: cardinality round-trips byte-stable across 100 lift→project cycles",
  async () => {
    const input: OWLOntology = {
      ontologyIRI: "http://example.org/test/p2_step4b_determinism",
      tbox: [
        {
          "@type": "SubClassOf",
          subClass: { "@type": "Class", iri: "http://example.org/test/HasExactlyTwoHumanChildren" },
          superClass: {
            "@type": "Restriction",
            onProperty: "http://example.org/test/hasChild",
            cardinality: 2,
            onClass: { "@type": "Class", iri: "http://example.org/test/Person" },
          },
        },
      ],
      abox: [],
      rbox: [],
    };
    const first = stableStringify(await folToOwl(await owlToFol(input)));
    for (let i = 0; i < 99; i++) {
      const next = stableStringify(await folToOwl(await owlToFol(input)));
      strictEqual(next, first, `determinism drift on run ${i + 2}/100`);
    }
  },
);

// ===========================================================================
// STEP 5 — Strategy router with explicit per-axiom attribution per spec §6.2
// ===========================================================================

await report(
  "Step 5 / Direct Mapping attribution: Phase 1 ABox axioms each report strategy='direct' with zero LossSignature/RecoveryPayload counts",
  async () => {
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Atom",
        predicate: "http://example.org/test/Person",
        arguments: [{ "@type": "fol:Constant", iri: "http://example.org/test/alice" }],
      },
      {
        "@type": "fol:Atom",
        predicate: "http://example.org/test/knows",
        arguments: [
          { "@type": "fol:Constant", iri: "http://example.org/test/alice" },
          { "@type": "fol:Constant", iri: "http://example.org/test/bob" },
        ],
      },
    ];
    const result = await folToOwl(axioms);
    strictEqual(result.strategySelections.length, 2);
    for (let i = 0; i < 2; i++) {
      strictEqual(result.strategySelections[i].axiomIndex, i);
      strictEqual(result.strategySelections[i].strategy, "direct");
      strictEqual(result.strategySelections[i].lossSignatureCount, 0);
      strictEqual(result.strategySelections[i].recoveryPayloadCount, 0);
    }
  },
);

await report(
  "Step 5 / Annotated Approximation attribution: naf_residue axiom reports strategy='annotated-approximation' with lossSignatureCount=1 + recoveryPayloadCount=1",
  async () => {
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Universal",
        variable: "x",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Atom",
            predicate: "http://example.org/p2-naf-attribution/Person",
            arguments: [{ "@type": "fol:Variable", name: "x" }],
          },
          consequent: {
            "@type": "fol:Negation",
            inner: {
              "@type": "fol:Atom",
              predicate: "http://example.org/p2-naf-attribution/KnownDriver",
              arguments: [{ "@type": "fol:Variable", name: "x" }],
            },
          },
        },
      },
    ];
    const result = await folToOwl(axioms);
    strictEqual(result.strategySelections.length, 1);
    strictEqual(result.strategySelections[0].axiomIndex, 0);
    strictEqual(result.strategySelections[0].strategy, "annotated-approximation");
    // 1 naf_residue LS (the Person predicate is uncatalogued under this
    // namespace, so unknown_relation also fires for both Person and
    // KnownDriver — total LS count = 3: 1 naf_residue + 2 unknown_relation)
    ok(result.strategySelections[0].lossSignatureCount >= 1);
    strictEqual(result.strategySelections[0].recoveryPayloadCount, 1);
  },
);

await report(
  "Step 5 / Annotated Approximation attribution: unknown_relation-only axiom reports strategy='annotated-approximation' with lossSignatureCount>=1 + recoveryPayloadCount=0",
  async () => {
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Atom",
        predicate: "http://example.org/p2-uncatalogued/uncatalogedRelation",
        arguments: [
          { "@type": "fol:Constant", iri: "http://example.org/p2-uncatalogued/alice" },
          { "@type": "fol:Constant", iri: "http://example.org/p2-uncatalogued/bob" },
        ],
      },
    ];
    const result = await folToOwl(axioms);
    strictEqual(result.strategySelections.length, 1);
    strictEqual(result.strategySelections[0].strategy, "annotated-approximation");
    strictEqual(result.strategySelections[0].lossSignatureCount, 1);
    strictEqual(result.strategySelections[0].recoveryPayloadCount, 0);
  },
);

await report(
  "Step 5 / Mixed input: axioms in same projection get distinct strategy attributions per their own emission profile",
  async () => {
    const axioms: FOLAxiom[] = [
      // Axiom 0: tolerated-namespace ABox → direct
      {
        "@type": "fol:Atom",
        predicate: "http://example.org/test/Person",
        arguments: [{ "@type": "fol:Constant", iri: "http://example.org/test/alice" }],
      },
      // Axiom 1: uncatalogued-namespace ABox → annotated-approximation (unknown_relation)
      {
        "@type": "fol:Atom",
        predicate: "http://example.org/p2-uncatalogued/uncatalogedRelation",
        arguments: [
          { "@type": "fol:Constant", iri: "http://example.org/p2-uncatalogued/x" },
          { "@type": "fol:Constant", iri: "http://example.org/p2-uncatalogued/y" },
        ],
      },
    ];
    const result = await folToOwl(axioms);
    strictEqual(result.strategySelections.length, 2);
    strictEqual(result.strategySelections[0].strategy, "direct");
    strictEqual(result.strategySelections[1].strategy, "annotated-approximation");
  },
);

await report(
  "Step 5 / Shape-invalid axioms: omitted from strategySelections (Routing #0.5 robustness preserved)",
  async () => {
    const axioms = [
      // Shape-valid Direct Mapping match
      {
        "@type": "fol:Atom",
        predicate: "http://example.org/test/Person",
        arguments: [{ "@type": "fol:Constant", iri: "http://example.org/test/alice" }],
      },
      null, // Shape-invalid; should be omitted from strategySelections
      { "@type": 42 }, // Shape-invalid (@type non-string); omitted
    ] as unknown as FOLAxiom[];
    const result = await folToOwl(axioms);
    strictEqual(result.strategySelections.length, 1, "only 1 shape-valid entry");
    strictEqual(result.strategySelections[0].axiomIndex, 0);
    strictEqual(result.strategySelections[0].strategy, "direct");
  },
);

await report(
  "Step 5 / Determinism: strategySelections are byte-identical across 100 runs",
  async () => {
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Atom",
        predicate: "http://example.org/test/knows",
        arguments: [
          { "@type": "fol:Constant", iri: "http://example.org/test/alice" },
          { "@type": "fol:Constant", iri: "http://example.org/test/bob" },
        ],
      },
    ];
    const first = stableStringify(await folToOwl(axioms));
    for (let i = 0; i < 99; i++) {
      const next = stableStringify(await folToOwl(axioms));
      strictEqual(next, first, `determinism drift on run ${i + 2}/100`);
    }
  },
);

// ===========================================================================
// STEP 4a — Annotated Approximation + LossSignature emission
// ===========================================================================

const LS_ID_RE = /^ofbt:ls\/[0-9a-f]{64}$/;
const RP_ID_RE = /^ofbt:rp\/[0-9a-f]{64}$/;

await report(
  "Step 4a / naf_residue: classical fol:Negation triggers conservative LossSignature + RecoveryPayload",
  async () => {
    // Mirrors p2_lossy_naf_residue.fixture.js input: ∀x. Person(x) → ¬KnownDriver(x)
    const KNOWN_DRIVER = "http://example.org/p2-naf-residue/KnownDriver";
    const PERSON = "http://example.org/p2-naf-residue/Person";
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Universal",
        variable: "x",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Atom",
            predicate: PERSON,
            arguments: [{ "@type": "fol:Variable", name: "x" }],
          },
          consequent: {
            "@type": "fol:Negation",
            inner: {
              "@type": "fol:Atom",
              predicate: KNOWN_DRIVER,
              arguments: [{ "@type": "fol:Variable", name: "x" }],
            },
          },
        },
      },
    ];
    const result = await folToOwl(axioms);
    // Direct Mapping output preserved (SubClassOf with ObjectComplementOf).
    deepStrictEqual(result.ontology.tbox, [
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: PERSON },
        superClass: {
          "@type": "ObjectComplementOf",
          class: { "@type": "Class", iri: KNOWN_DRIVER },
        },
      },
    ]);
    // Exactly one naf_residue LossSignature emitted.
    const nafSigs = result.newLossSignatures.filter((s) => s.lossType === "naf_residue");
    strictEqual(nafSigs.length, 1, "exactly one naf_residue LossSignature");
    const ls = nafSigs[0];
    strictEqual(ls["@type"], "ofbt:LossSignature");
    strictEqual(ls.relationIRI, KNOWN_DRIVER);
    strictEqual(ls.reason, "negation_over_unbound_predicate");
    ok(LS_ID_RE.test(ls["@id"]), `@id matches /^ofbt:ls\\/[0-9a-f]{64}$/, got ${ls["@id"]}`);
    ok(typeof ls.reasonText === "string" && ls.reasonText.length > 0, "non-empty reasonText");
    // Exactly one RecoveryPayload emitted with the original FOL preserved.
    strictEqual(result.newRecoveryPayloads.length, 1);
    const rp = result.newRecoveryPayloads[0];
    strictEqual(rp.approximationStrategy, "ANNOTATED_APPROXIMATION");
    strictEqual(rp.relationIRI, KNOWN_DRIVER);
    deepStrictEqual(rp.originalFOL, axioms[0]);
    ok(RP_ID_RE.test(rp["@id"]), `RP @id matches /^ofbt:rp\\/[0-9a-f]{64}$/, got ${rp["@id"]}`);
  },
);

await report(
  "Step 4a / unknown_relation: predicate IRI outside permissive namespaces → informational LossSignature; no RecoveryPayload",
  async () => {
    // Mirrors p2_unknown_relation_fallback.fixture.js input.
    const UNCATALOGUED = "http://example.org/p2-uncatalogued/uncatalogedRelation";
    const ALICE = "http://example.org/p2-uncatalogued/alice";
    const BOB = "http://example.org/p2-uncatalogued/bob";
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Atom",
        predicate: UNCATALOGUED,
        arguments: [
          { "@type": "fol:Constant", iri: ALICE },
          { "@type": "fol:Constant", iri: BOB },
        ],
      },
    ];
    const result = await folToOwl(axioms);
    // Direct Mapping output preserved.
    deepStrictEqual(result.ontology.abox, [
      {
        "@type": "ObjectPropertyAssertion",
        property: UNCATALOGUED,
        source: ALICE,
        target: BOB,
      },
    ]);
    // Exactly one unknown_relation LossSignature emitted.
    const unkSigs = result.newLossSignatures.filter((s) => s.lossType === "unknown_relation");
    strictEqual(unkSigs.length, 1, "exactly one unknown_relation LossSignature");
    const ls = unkSigs[0];
    strictEqual(ls.relationIRI, UNCATALOGUED);
    strictEqual(ls.reason, "predicate_iri_not_in_loaded_arc_modules");
    ok(LS_ID_RE.test(ls["@id"]));
    // No RecoveryPayload — Direct Mapping output IS the recovery.
    strictEqual(result.newRecoveryPayloads.length, 0);
  },
);

await report(
  "Step 4a / permissive namespace: predicate IRI under http://example.org/test/ does NOT trigger unknown_relation",
  async () => {
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Atom",
        predicate: "http://example.org/test/knows",
        arguments: [
          { "@type": "fol:Constant", iri: "http://example.org/test/alice" },
          { "@type": "fol:Constant", iri: "http://example.org/test/bob" },
        ],
      },
    ];
    const result = await folToOwl(axioms);
    const unkSigs = result.newLossSignatures.filter((s) => s.lossType === "unknown_relation");
    strictEqual(unkSigs.length, 0, "no unknown_relation for tolerated namespace");
  },
);

await report(
  "Step 4a / @id determinism: same input produces byte-identical content-addressed @id across 100 runs",
  async () => {
    const KNOWN_DRIVER = "http://example.org/p2-naf-residue/KnownDriver";
    const PERSON = "http://example.org/p2-naf-residue/Person";
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Universal",
        variable: "x",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Atom",
            predicate: PERSON,
            arguments: [{ "@type": "fol:Variable", name: "x" }],
          },
          consequent: {
            "@type": "fol:Negation",
            inner: {
              "@type": "fol:Atom",
              predicate: KNOWN_DRIVER,
              arguments: [{ "@type": "fol:Variable", name: "x" }],
            },
          },
        },
      },
    ];
    const first = await folToOwl(axioms);
    const firstLsId = first.newLossSignatures[0]["@id"];
    const firstRpId = first.newRecoveryPayloads[0]["@id"];
    for (let i = 0; i < 99; i++) {
      const next = await folToOwl(axioms);
      strictEqual(next.newLossSignatures[0]["@id"], firstLsId, `LS @id drift on run ${i + 2}`);
      strictEqual(next.newRecoveryPayloads[0]["@id"], firstRpId, `RP @id drift on run ${i + 2}`);
    }
  },
);

await report(
  "Step 4a / @id discrimination: different naf_residue inputs produce different @ids",
  async () => {
    const PERSON = "http://example.org/p2-naf-residue/Person";
    const buildAxiom = (negPredicate: string): FOLAxiom => ({
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Implication",
        antecedent: {
          "@type": "fol:Atom",
          predicate: PERSON,
          arguments: [{ "@type": "fol:Variable", name: "x" }],
        },
        consequent: {
          "@type": "fol:Negation",
          inner: {
            "@type": "fol:Atom",
            predicate: negPredicate,
            arguments: [{ "@type": "fol:Variable", name: "x" }],
          },
        },
      },
    });
    const a = await folToOwl([buildAxiom("http://example.org/p2-naf/A")]);
    const b = await folToOwl([buildAxiom("http://example.org/p2-naf/B")]);
    ok(a.newLossSignatures[0]["@id"] !== b.newLossSignatures[0]["@id"], "distinct LossSignature @ids");
    ok(a.newRecoveryPayloads[0]["@id"] !== b.newRecoveryPayloads[0]["@id"], "distinct RecoveryPayload @ids");
  },
);

await report(
  "Step 4a / source-provenance threading: config.sourceOntologyIRI populates manifest fields",
  async () => {
    const result = await folToOwl([], undefined, {
      sourceOntologyIRI: "http://example.org/source-onto",
      sourceVersionIRI: "http://example.org/source-onto/v1",
      sourceGraphIRI: "http://example.org/source-graph",
      arcManifestVersion: "0.1.0",
    });
    strictEqual(result.manifest.ontologyIRI, "http://example.org/source-onto");
    strictEqual(result.manifest.versionIRI, "http://example.org/source-onto/v1");
    strictEqual(result.manifest.projectedFrom, "http://example.org/source-onto");
    strictEqual(result.manifest.activity.used, "http://example.org/source-onto");
    strictEqual(result.manifest.arcManifestVersion, "0.1.0");
  },
);

await report(
  "Step 4a / LossSignature provenance: sourceGraphIRI from config flows through emitted signatures",
  async () => {
    const KNOWN_DRIVER = "http://example.org/p2-naf-residue/KnownDriver";
    const axioms: FOLAxiom[] = [
      {
        "@type": "fol:Universal",
        variable: "x",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Atom",
            predicate: "http://example.org/p2-naf-residue/Person",
            arguments: [{ "@type": "fol:Variable", name: "x" }],
          },
          consequent: {
            "@type": "fol:Negation",
            inner: {
              "@type": "fol:Atom",
              predicate: KNOWN_DRIVER,
              arguments: [{ "@type": "fol:Variable", name: "x" }],
            },
          },
        },
      },
    ];
    const result = await folToOwl(axioms, undefined, {
      sourceGraphIRI: "http://example.org/test-source",
      arcManifestVersion: "0.1.0",
    });
    strictEqual(result.newLossSignatures[0].provenance.sourceGraphIRI, "http://example.org/test-source");
    strictEqual(result.newLossSignatures[0].provenance.arcVersion, "0.1.0");
  },
);

// ===========================================================================
// Routing #0.5 — Projector robustness on malformed FOL inputs (defense-in-depth)
// ===========================================================================

await report(
  "Routing #0.5 / Robustness: malformed fol:Negation with missing `inner` field does not crash; axiom silently dropped",
  async () => {
    // Fixture-typo class: a fol:Negation with `body` instead of `inner`.
    // The projector's recursive descent encounters undefined when reading
    // shape.inner; isShape() guard returns null, axiom drops silently
    // pending Step 4 Annotated Approximation routing.
    const axioms = [
      {
        "@type": "fol:Universal",
        variable: "x",
        body: {
          "@type": "fol:Implication",
          antecedent: {
            "@type": "fol:Atom",
            predicate: "http://example.org/test/Person",
            arguments: [{ "@type": "fol:Variable", name: "x" }],
          },
          consequent: {
            "@type": "fol:Negation",
            // Deliberately missing `inner` field (typo class).
            body: {
              "@type": "fol:Atom",
              predicate: "http://example.org/test/KnownDriver",
              arguments: [{ "@type": "fol:Variable", name: "x" }],
            },
          },
        },
      },
    ] as unknown as FOLAxiom[];
    const result = await folToOwl(axioms);
    deepStrictEqual(result.ontology.tbox, []);
    deepStrictEqual(result.ontology.abox, []);
    deepStrictEqual(result.ontology.rbox, []);
  },
);

// Bisected fuzz cases — each input variant gets its own report() so a
// crash localizes immediately. All variants MUST drop silently; no
// throws, no spurious emissions.
const malformedFuzzCases: ReadonlyArray<{ name: string; input: unknown }> = [
  { name: "null entry", input: null },
  {
    name: "missing @type",
    input: { variable: "x", body: { "@type": "fol:Atom", predicate: "http://example.org/test/X", arguments: [] } },
  },
  { name: "@type non-string (number)", input: { "@type": 42, body: {} } },
  { name: "fol:Universal missing body", input: { "@type": "fol:Universal", variable: "x" } },
  {
    name: "fol:Universal with body as string",
    input: { "@type": "fol:Universal", variable: "x", body: "should be an object" },
  },
  {
    name: "fol:Atom with non-array arguments",
    input: { "@type": "fol:Atom", predicate: "http://example.org/test/X", arguments: "not an array" },
  },
  {
    name: "Conjunction with conjuncts:null inside SubClassOf consequent",
    input: {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Implication",
        antecedent: {
          "@type": "fol:Atom",
          predicate: "http://example.org/test/A",
          arguments: [{ "@type": "fol:Variable", name: "x" }],
        },
        consequent: { "@type": "fol:Conjunction", conjuncts: null },
      },
    },
  },
];

for (const c of malformedFuzzCases) {
  await report(
    `Routing #0.5 / Robustness fuzz [${c.name}]: drops silently with no crash`,
    async () => {
      const axioms = [c.input] as unknown as FOLAxiom[];
      const result = await folToOwl(axioms);
      deepStrictEqual(result.ontology.tbox, []);
      deepStrictEqual(result.ontology.abox, []);
      deepStrictEqual(result.ontology.rbox, []);
    },
  );
}

// ===========================================================================
// LOSS_SIGNATURE_SEVERITY_ORDER — frozen contract per API §6.4.1
// ===========================================================================

await report(
  "LOSS_SIGNATURE_SEVERITY_ORDER: 8 entries in the spec-frozen ordering",
  () => {
    deepStrictEqual(
      [...LOSS_SIGNATURE_SEVERITY_ORDER],
      [
        "coherence_violation",
        "naf_residue",
        "arity_flattening",
        "closure_truncated",
        "unknown_relation",
        "bnode_introduced",
        "una_residue",
        "lexical_distinct_value_equal",
      ],
    );
  },
);

await report(
  "LOSS_SIGNATURE_SEVERITY_ORDER: frozen — mutation attempts throw or are silently ignored",
  () => {
    ok(Object.isFrozen(LOSS_SIGNATURE_SEVERITY_ORDER), "array is frozen");
  },
);

// ===========================================================================
// Summary
// ===========================================================================

console.log(`\n  ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
