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
