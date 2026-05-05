/**
 * Phase 1 fixture: blank-node-bearing class expression (anonymous restriction).
 *
 * Status: Draft. Per behavioral spec §5.7 and API §6.1.1, blank-node
 * identifiers must be canonicalized via RDFC-1.0 (rdf-canonize). The
 * canonical Skolem form is deterministic — same input → same Skolem ID
 * across runs.
 *
 * ============================================================================
 * AMENDMENT AUDIT TRAIL — Step 6 STRUCTURAL_ONLY fill-in, 2026-05-03
 * ============================================================================
 *
 * (a) Placeholder fill-in. The original `expectedFOL` was the architect-
 *     ratified STRUCTURAL_ONLY string ("exact Skolem-IDs pinned during
 *     Phase 1 implementation. Lifter MUST canonicalize blank nodes via
 *     rdf-canonize (RDFC-1.0). Determinism check: 100 lift runs must
 *     produce byte-identical Skolem IDs."). Step 6 fills in the
 *     byte-exact form.
 *
 * (b) Layer-translation decision (ADR-007 §8). The fixture's input uses
 *     inline-restriction syntax (anonymous nested ClassExpression objects)
 *     rather than RDF b-node references. In structured-JS form, anonymous
 *     restrictions are inline objects, NOT b-node identifiers — there is
 *     no `_:label` to canonicalize via rdf-canonize. The lifter's existing
 *     class-expression recursion (Step 2) handles this deterministically
 *     via ADR-007 §2's variable-allocator letter sequence: outer existential
 *     binds 'y', inner binds 'z'. No Skolem identifiers are minted; the
 *     existential variables ARE the witnesses.
 *
 *     The b-node Skolem prefix from ADR-007 §8 (BNODE_SKOLEM_PREFIX) governs
 *     a different code path — the `_:label` form recognized by canonicalizeIRI
 *     — exercised by an inline regression test in tests/lifter-phase1.test.ts
 *     (`Step 6 b-node IRI canonicalization regression`). Phase 4+ when
 *     parseOWL materializes RDF input with real b-nodes (BFO/CCO releases
 *     use b-nodes for class expressions) will exercise the BNODE_SKOLEM_PREFIX
 *     path against canonical RDFC-1.0 labels.
 *
 *     Determinism for THIS fixture is provided by ADR-007 §2 (variable
 *     allocator) at the existential-witness level. The 100-run byte-
 *     identical Skolem-ID check the fixture's intent describes is
 *     trivially satisfied because no Skolems are minted — the lifted
 *     output is deterministic by construction of the variable allocator,
 *     which uses no Date / random / set-iteration-order state.
 *
 * (c) Spec citation. Behavioral spec §5.7 (RDFC-1.0 b-node canonicalization
 *     — applies when b-node identifiers are present, which this fixture's
 *     structured-JS input does not contain). API §6.1.1 (determinism
 *     guarantee — satisfied by ADR-007 §2 variable allocator at the
 *     existential-witness level).
 *
 * (d) Architect ruling reference. ADR-007 §8 (Accepted at Step 5 close per
 *     architect Ruling 1; §8 placeholder filled in at Step 6 close — see
 *     project/DECISIONS.md). The fixture's expectedFOL is byte-exact per
 *     ADR-007 §2 (variable allocator) + §5 (TBox processing order) + §1
 *     (lifter emits classical FOL).
 *
 * Internal contract consistency (per AUTHORING_DISCIPLINE.md): the amended
 * `expectedFOL` aligns with the prose in `intent` (modulo the
 * layer-translation explained in (b)) and with the manifest's
 * `expectedOutcome.summary`. Promotion gate: this fixture is ready to
 * promote Draft → Verified at Phase 1 exit per ADR-007 §8 ratification.
 * ============================================================================
 */

const COUSIN = "http://example.org/test/Cousin";
const HAS_PARENT = "http://example.org/test/hasParent";
const HAS_SIBLING = "http://example.org/test/hasSibling";
const PERSON = "http://example.org/test/Person";

const VAR_X = { "@type": "fol:Variable", name: "x" };
const VAR_Y = { "@type": "fol:Variable", name: "y" };
const VAR_Z = { "@type": "fol:Variable", name: "z" };

/** @type {object} */
export const fixture = {
  input: {
    ontologyIRI: "http://example.org/test/p1_blank_node",
    prefixes: { ex: "http://example.org/test/" },
    tbox: [
      // Anonymous restriction: Cousin ⊑ ∃hasParent.(∃hasSibling.Person)
      {
        "@type": "SubClassOf",
        subClass: { "@type": "Class", iri: "http://example.org/test/Cousin" },
        superClass: {
          "@type": "Restriction",
          onProperty: "http://example.org/test/hasParent",
          someValuesFrom: {
            "@type": "Restriction",
            onProperty: "http://example.org/test/hasSibling",
            someValuesFrom: { "@type": "Class", iri: "http://example.org/test/Person" },
          },
        },
      },
    ],
    abox: [],
    rbox: [],
  },
  expectedFOL: [
    // ∀x. Cousin(x) → ∃y. (hasParent(x,y) ∧ ∃z. (hasSibling(y,z) ∧ Person(z)))
    {
      "@type": "fol:Universal",
      variable: "x",
      body: {
        "@type": "fol:Implication",
        antecedent: {
          "@type": "fol:Atom",
          predicate: COUSIN,
          arguments: [VAR_X],
        },
        consequent: {
          "@type": "fol:Existential",
          variable: "y",
          body: {
            "@type": "fol:Conjunction",
            conjuncts: [
              {
                "@type": "fol:Atom",
                predicate: HAS_PARENT,
                arguments: [VAR_X, VAR_Y],
              },
              {
                "@type": "fol:Existential",
                variable: "z",
                body: {
                  "@type": "fol:Conjunction",
                  conjuncts: [
                    {
                      "@type": "fol:Atom",
                      predicate: HAS_SIBLING,
                      arguments: [VAR_Y, VAR_Z],
                    },
                    {
                      "@type": "fol:Atom",
                      predicate: PERSON,
                      arguments: [VAR_Z],
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  ],
};

export const meta = {
  fixtureId: "p1_blank_node_anonymous_restriction",
  intent:
    "Blank-node-bearing class expressions must lift with deterministic existential-witness identifiers. Run-to-run determinism is the Phase 1 exit criterion this fixture targets — non-deterministic existential-witness naming would produce different output each run, breaking byte-stable output. The lifter's variable allocator (ADR-007 §2) provides determinism at the existential-witness level; the b-node Skolem prefix (ADR-007 §8) governs the separate code path for `_:label`-form b-node IRI inputs (exercised by an inline regression test, not by this fixture's structured-JS input).",
  verifiedStatus: "Verified",
};
