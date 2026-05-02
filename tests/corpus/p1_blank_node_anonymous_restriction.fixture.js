/**
 * Phase 1 fixture: blank-node-bearing class expression (anonymous restriction).
 *
 * Status: Draft. Per behavioral spec §5.7 and API §6.1.1, blank-node
 * identifiers must be canonicalized via RDFC-1.0 (rdf-canonize). The
 * canonical Skolem form is deterministic — same input → same Skolem ID
 * across runs.
 */

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
  expectedFOL: "STRUCTURAL_ONLY — exact Skolem-IDs pinned during Phase 1 implementation. Lifter MUST canonicalize blank nodes via rdf-canonize (RDFC-1.0). Determinism check: 100 lift runs must produce byte-identical Skolem IDs.",
};

export const meta = {
  fixtureId: "p1_blank_node_anonymous_restriction",
  intent:
    "Blank-node-bearing class expressions must lift with deterministic Skolem identifiers. Run-to-run determinism is the Phase 1 exit criterion this fixture targets — non-canonical blank-node naming would produce different Skolem IDs each run, breaking byte-stable output.",
  verifiedStatus: "Draft",
};
