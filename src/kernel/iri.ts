/**
 * IRI Canonicalization
 *
 * Per API spec §3.10. Accepts three input forms and canonicalizes to
 * expanded full URI form internally and on FOL output:
 *
 *   - Full URI form:       "http://purl.obolibrary.org/obo/BFO_0000050"
 *   - CURIE form:          "bfo:BFO_0000050" (requires prefix declaration)
 *   - Bracketed full form: "<http://purl.obolibrary.org/obo/BFO_0000050>"
 *
 * Canonical output: bare expanded full URI (no brackets, no prefix abbreviation).
 *
 * Pure: no Date, no random, no I/O.
 */

import { IRIFormatError } from "./errors.js";

// Reserved prefixes recognized without explicit declaration. These are the
// W3C standard prefixes universally understood; any other prefix MUST be
// declared in OWLOntology.prefixes (per §3.10.1) or the lookup throws
// IRIFormatError with form: 'curie'.
const STANDARD_PREFIXES: Readonly<Record<string, string>> = Object.freeze({
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
  owl: "http://www.w3.org/2002/07/owl#",
  xsd: "http://www.w3.org/2001/XMLSchema#",
});

const SCHEME_RE = /^[A-Za-z][A-Za-z0-9+\-.]*:/;
// CURIE prefix component: letters, digits, underscore, hyphen; must start
// with a letter. Local part: any non-whitespace.
const CURIE_RE = /^([A-Za-z][A-Za-z0-9_-]*):([^\s<>]*)$/;
// Bracketed full URI: angle-bracket-delimited full URI.
const BRACKETED_RE = /^<(.+)>$/;

/**
 * Canonicalize a single IRI string against an optional prefix table.
 *
 * Returns the expanded full URI form (bare, no brackets, no prefix shorthand).
 *
 * Throws IRIFormatError when:
 *   - The input is empty / not a string
 *   - The CURIE prefix is not declared in `prefixes` and not a standard prefix
 *   - The input is not recognizable as any of the three accepted forms
 */
export function canonicalizeIRI(
  iri: string,
  prefixes?: Readonly<Record<string, string>>
): string {
  if (typeof iri !== "string" || iri.length === 0) {
    throw new IRIFormatError("IRI must be a non-empty string", {
      iri: String(iri),
      form: "unrecognized",
    });
  }

  // (1) Bracketed full URI: strip brackets, then return the inner URI.
  const bracketMatch = BRACKETED_RE.exec(iri);
  if (bracketMatch) {
    const inner = bracketMatch[1];
    if (!SCHEME_RE.test(inner)) {
      throw new IRIFormatError(
        `Bracketed IRI does not contain a valid absolute URI: ${iri}`,
        { iri, form: "full-uri" }
      );
    }
    return inner;
  }

  // (2) CURIE lookup FIRST. SCHEME_RE matches both `http:` and `obo:` so
  // discrimination by scheme alone treats CURIEs as URIs. The prefix table
  // is the authoritative discriminator: if the `prefix:local` form's prefix
  // is in the table (or a standard W3C prefix), expand it. Otherwise fall
  // through to scheme-check below.
  const curieMatch = CURIE_RE.exec(iri);
  if (curieMatch) {
    const [, prefix, local] = curieMatch;
    const namespace =
      (prefixes && prefixes[prefix]) ?? STANDARD_PREFIXES[prefix];
    if (namespace !== undefined) {
      return namespace + local;
    }
    // Prefix not declared. Continue: maybe this is `http://...` (which also
    // matches CURIE_RE with prefix=http, local=//...) — handled below by
    // SCHEME_RE matching against the full input.
  }

  // (3) Full URI form: scheme present, no matching CURIE prefix. Per §3.10.1
  // OFBT does not normalize URI scheme/host casing or percent-encoding —
  // the input string is already canonical for purposes of identity.
  if (SCHEME_RE.test(iri)) {
    return iri;
  }

  // (4) Looked CURIE-shaped but no prefix matched and not a URI scheme:
  // explicit CURIE-prefix-not-declared error (per §3.10.5).
  if (curieMatch) {
    throw new IRIFormatError(
      `CURIE prefix '${curieMatch[1]}' is not declared in OWLOntology.prefixes and is not a standard W3C prefix`,
      { iri, form: "curie" }
    );
  }

  // (5) Not recognizable as any of the three forms.
  throw new IRIFormatError(
    `IRI '${iri}' is not recognizable as a full URI, CURIE, or bracketed URI`,
    { iri, form: "unrecognized" }
  );
}

/**
 * Convenience: canonicalize against an OWLOntology's prefix table directly.
 * Returns expanded full URI form.
 */
export function canonicalizeWithOntology(
  iri: string,
  ontology: { prefixes?: Record<string, string> }
): string {
  return canonicalizeIRI(iri, ontology.prefixes);
}
