/**
 * Phase 1 wrong-translation canary: IRI canonicalization.
 *
 * Status: Draft. IN SCOPE FOR PHASE 1, NOT DEFERRED.
 *
 * Per behavioral spec §4.2.1 and API §3.10: the lifter accepts IRIs in
 * full URI form, CURIE form, and bare URI form. All three forms MUST
 * produce byte-identical lifted FOL.
 *
 * This fixture authors three input variants of the SAME axiom set, each
 * using a different IRI form. The Phase 1 exit criterion is that all three
 * lift to byte-identical FOL output (after the determinism normalization
 * via stableStringify).
 */

const FOL_BFO_50 = "http://purl.obolibrary.org/obo/BFO_0000050";

const SUBJECT = "http://example.org/test/heart";
const TARGET = "http://example.org/test/body";

/** @type {object} */
export const fixture = {
  // Three structurally-equivalent inputs — same triples, three IRI forms.
  inputs: {
    fullURI: {
      ontologyIRI: "http://example.org/test/iri_canon_full",
      prefixes: {},
      tbox: [],
      rbox: [],
      abox: [
        {
          "@type": "ObjectPropertyAssertion",
          property: FOL_BFO_50,
          source: SUBJECT,
          target: TARGET,
        },
      ],
    },
    curie: {
      ontologyIRI: "http://example.org/test/iri_canon_curie",
      prefixes: {
        obo: "http://purl.obolibrary.org/obo/",
        ex: "http://example.org/test/",
      },
      tbox: [],
      rbox: [],
      abox: [
        {
          "@type": "ObjectPropertyAssertion",
          property: "obo:BFO_0000050",
          source: "ex:heart",
          target: "ex:body",
        },
      ],
    },
    bareURI: {
      ontologyIRI: "http://example.org/test/iri_canon_bare",
      prefixes: {},
      tbox: [],
      rbox: [],
      abox: [
        {
          "@type": "ObjectPropertyAssertion",
          property: "http://purl.obolibrary.org/obo/BFO_0000050",
          source: "http://example.org/test/heart",
          target: "http://example.org/test/body",
        },
      ],
    },
  },
  // Phase 1 exit assertion: stableStringify(lift(inputs.fullURI)) ===
  //                        stableStringify(lift(inputs.curie)) ===
  //                        stableStringify(lift(inputs.bareURI))
  // All three must produce the same expanded full-URI form internally
  // per spec §4.2.1.
  expectedFOLAcrossInputs: [
    {
      "@type": "fol:Atom",
      predicate: "http://purl.obolibrary.org/obo/BFO_0000050",
      arguments: [
        { "@type": "fol:Constant", iri: "http://example.org/test/heart" },
        { "@type": "fol:Constant", iri: "http://example.org/test/body" },
      ],
    },
  ],
};

export const meta = {
  fixtureId: "canary_iri_canonicalization",
  intent:
    "catches a lifter that fails to expand CURIEs against the prefix table or stores prefix-shorthand-form internally. The three input forms must produce byte-identical lifted FOL after IRI normalization to expanded full-URI form. Surface form must NOT leak into the canonical FOL state.",
  verifiedStatus: "Verified",
};
