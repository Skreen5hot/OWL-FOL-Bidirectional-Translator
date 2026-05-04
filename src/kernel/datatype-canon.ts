/**
 * XSD Datatype Canonicalization
 *
 * Per spec §5.6.5. Numeric, boolean, and date/dateTime literals are
 * normalized to their W3C XML Schema Datatypes 1.1 §4 canonical lexical
 * form on lift. Language tags are lowercased per BCP 47 / RFC 5646.
 * Plain (untyped) literals are typed as xsd:string per RDF 1.1.
 *
 * Invalid lexical forms (e.g., "42.0"^^xsd:integer) are rejected with
 * a typed ParseError carrying construct: "invalid-literal-lexical-form"
 * and the offending value/datatype in the message.
 *
 * Value-space equality is NOT performed in v0.1 per spec §5.6.5
 * "Value-space equality" paragraph: "42"^^xsd:integer and
 * "42.0"^^xsd:decimal lift as DISTINCT literals. v0.2 may revisit.
 *
 * Pure: no Date, no random, no I/O. Reads only the input literal value.
 */

import { ParseError } from "./errors.js";
import type { TypedLiteral } from "./owl-types.js";

const XSD = "http://www.w3.org/2001/XMLSchema#";

const XSD_STRING = XSD + "string";
const XSD_BOOLEAN = XSD + "boolean";
const XSD_INTEGER = XSD + "integer";
const XSD_DECIMAL = XSD + "decimal";
const XSD_DATE = XSD + "date";
const XSD_DATETIME = XSD + "dateTime";

// xsd:integer derived types (e.g., xsd:long, xsd:int, xsd:positiveInteger,
// xsd:nonNegativeInteger, etc.) all share the same canonical lexical form
// rules as xsd:integer. v0.1 normalizes the same way; the datatype IRI is
// preserved as-is on output.
const INTEGER_DERIVED = new Set<string>([
  XSD + "long",
  XSD + "int",
  XSD + "short",
  XSD + "byte",
  XSD + "nonNegativeInteger",
  XSD + "positiveInteger",
  XSD + "nonPositiveInteger",
  XSD + "negativeInteger",
  XSD + "unsignedLong",
  XSD + "unsignedInt",
  XSD + "unsignedShort",
  XSD + "unsignedByte",
]);

/**
 * Canonicalize a TypedLiteral to its XSD canonical lexical form per §5.6.5.
 *
 * Returns a NEW TypedLiteral; the input is not mutated.
 *
 * Throws ParseError when:
 *   - the value cannot be parsed as the declared datatype
 *     (e.g., "abc"^^xsd:integer; "42.0"^^xsd:integer; "2026-13-01"^^xsd:date)
 */
export function canonicalizeLiteral(literal: TypedLiteral): TypedLiteral {
  const value = literal["@value"];
  const datatype = literal["@type"];
  const language = literal["@language"];

  // Plain (untyped) literals: per RDF 1.1, all untyped literals are
  // xsd:string. The TypedLiteral type already requires "@type", so this
  // path is for literals where the caller passed an empty or whitespace
  // datatype string. Defensive: treat as xsd:string.
  const effectiveDatatype = datatype && datatype.trim() !== "" ? datatype : XSD_STRING;

  let canonicalValue: string;

  if (effectiveDatatype === XSD_STRING) {
    // Strings: no canonicalization. Lexical form = value-space form.
    canonicalValue = value;
  } else if (effectiveDatatype === XSD_BOOLEAN) {
    canonicalValue = canonicalizeBoolean(value);
  } else if (effectiveDatatype === XSD_INTEGER || INTEGER_DERIVED.has(effectiveDatatype)) {
    canonicalValue = canonicalizeInteger(value, effectiveDatatype);
  } else if (effectiveDatatype === XSD_DECIMAL) {
    canonicalValue = canonicalizeDecimal(value);
  } else if (effectiveDatatype === XSD_DATE) {
    canonicalValue = canonicalizeDate(value);
  } else if (effectiveDatatype === XSD_DATETIME) {
    canonicalValue = canonicalizeDateTime(value);
  } else {
    // Unrecognized datatype IRI: pass-through. v0.1 supports the basic
    // XSD types per spec §3.7; richer datatype handling (faceted
    // restrictions) is §13.1 punted and detected upstream by the
    // lifter's punted-construct pre-scan.
    canonicalValue = value;
  }

  // Build canonical TypedLiteral. Language tag lowercased per BCP 47.
  const out: TypedLiteral = {
    "@value": canonicalValue,
    "@type": effectiveDatatype,
  };
  if (language && language.trim() !== "") {
    out["@language"] = language.toLowerCase();
  }
  return out;
}

// ---------------------------------------------------------------------------
// Per-datatype canonicalizers
// ---------------------------------------------------------------------------

/** xsd:boolean canonical form: "true" | "false". Accepts "1" / "0" as input. */
function canonicalizeBoolean(value: string): string {
  if (value === "true" || value === "1") return "true";
  if (value === "false" || value === "0") return "false";
  throw new ParseError(
    `Invalid xsd:boolean lexical form: "${value}". Accepted: "true", "false", "1", "0".`,
    { construct: "invalid-literal-lexical-form" }
  );
}

/**
 * xsd:integer canonical form per W3C XSD 1.1 §3.4.13:
 *   - Optional minus sign for negatives; no plus sign on canonical form
 *   - No leading zeros (except for the value "0" itself)
 *   - "-0" canonicalizes to "0"
 *
 * "42.0" is NOT a valid xsd:integer lexical form (decimal point is for
 * xsd:decimal, not xsd:integer). Rejected with diagnostic per spec §5.6.5.
 */
function canonicalizeInteger(value: string, datatypeIRI: string): string {
  if (!/^[+-]?\d+$/.test(value)) {
    throw new ParseError(
      `Invalid xsd:integer (or derived) lexical form: "${value}" for datatype <${datatypeIRI}>. Lexical form must match [+-]?[0-9]+ — no decimal point, no exponent.`,
      { construct: "invalid-literal-lexical-form" }
    );
  }
  // Strip leading + sign; preserve - on negatives.
  // Strip leading zeros via numeric reparse; "00" → "0"; "-0" → "0".
  let s = value;
  let negative = false;
  if (s[0] === "+") s = s.slice(1);
  if (s[0] === "-") {
    negative = true;
    s = s.slice(1);
  }
  // Strip leading zeros; if all zeros, leave one "0".
  let i = 0;
  while (i < s.length - 1 && s[i] === "0") i += 1;
  s = s.slice(i);
  // Treat "-0" as "0" (canonical for zero is unsigned).
  if (s === "0") return "0";
  return negative ? "-" + s : s;
}

/**
 * xsd:decimal canonical form per W3C XSD 1.1 §3.3.3:
 *   - Optional minus sign; no plus sign
 *   - Decimal point present
 *   - At least one digit before AND after the decimal point
 *   - No leading zeros before the decimal point (except a single "0" if
 *     value is in (-1, 1))
 *   - No trailing zeros after the decimal point (except a single "0" if
 *     value is integral, e.g., "1.0")
 *
 * Examples: "+1.5" → "1.5"; "1.50" → "1.5"; "0.50" → "0.5"; "1" → "1.0"
 * (per the spec's "decimal point present" + "at least one digit after"
 * rules — although "1" without a decimal point is also a valid xsd:decimal
 * lexical form; canonical adds the ".0").
 */
function canonicalizeDecimal(value: string): string {
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(value)) {
    throw new ParseError(
      `Invalid xsd:decimal lexical form: "${value}". Lexical form must match [+-]?(\\d+\\.?\\d*|\\.\\d+).`,
      { construct: "invalid-literal-lexical-form" }
    );
  }
  let s = value;
  let negative = false;
  if (s[0] === "+") s = s.slice(1);
  if (s[0] === "-") {
    negative = true;
    s = s.slice(1);
  }
  // Split into integer and fractional parts.
  let intPart: string;
  let fracPart: string;
  if (s.includes(".")) {
    const [a, b] = s.split(".");
    intPart = a === "" ? "0" : a;
    fracPart = b === "" ? "0" : b;
  } else {
    intPart = s;
    fracPart = "0";
  }
  // Strip leading zeros from integer part.
  let i = 0;
  while (i < intPart.length - 1 && intPart[i] === "0") i += 1;
  intPart = intPart.slice(i);
  // Strip trailing zeros from fractional part — but keep at least one digit.
  let j = fracPart.length;
  while (j > 1 && fracPart[j - 1] === "0") j -= 1;
  fracPart = fracPart.slice(0, j);
  // Treat "-0.0" as "0.0".
  if (intPart === "0" && fracPart === "0") return "0.0";
  return (negative ? "-" : "") + intPart + "." + fracPart;
}

/**
 * xsd:date canonical form per W3C XSD 1.1 §3.3.10:
 *   - YYYY-MM-DD with zero-padded month and day
 *   - Year MUST be at least 4 digits (zero-padded for 0001 - 0999;
 *     no leading zeros otherwise)
 *   - Optional timezone suffix (Z, +HH:MM, -HH:MM); preserved as-is in
 *     v0.1 (no TZ normalization)
 *
 * Examples: "2026-5-1" → "2026-05-01"; "2026-05-01" → "2026-05-01"
 */
function canonicalizeDate(value: string): string {
  // Match year (1+ digit), month (1-2 digit), day (1-2 digit) plus
  // optional timezone suffix.
  const m = /^(-?)(\d+)-(\d{1,2})-(\d{1,2})(Z|[+-]\d{2}:\d{2})?$/.exec(value);
  if (!m) {
    throw new ParseError(
      `Invalid xsd:date lexical form: "${value}". Lexical form must match (-)?YYYY[Y...]-MM-DD[(Z|±HH:MM)]?.`,
      { construct: "invalid-literal-lexical-form" }
    );
  }
  const [, sign, year, month, day, tz] = m;
  const monthNum = Number(month);
  const dayNum = Number(day);
  if (monthNum < 1 || monthNum > 12) {
    throw new ParseError(
      `Invalid xsd:date: month "${month}" out of range 1-12 in "${value}".`,
      { construct: "invalid-literal-lexical-form" }
    );
  }
  if (dayNum < 1 || dayNum > 31) {
    throw new ParseError(
      `Invalid xsd:date: day "${day}" out of range 1-31 in "${value}".`,
      { construct: "invalid-literal-lexical-form" }
    );
  }
  // Year zero-padded to at least 4 digits.
  const paddedYear = year.length < 4 ? year.padStart(4, "0") : year;
  const paddedMonth = monthNum.toString().padStart(2, "0");
  const paddedDay = dayNum.toString().padStart(2, "0");
  return sign + paddedYear + "-" + paddedMonth + "-" + paddedDay + (tz ?? "");
}

/**
 * xsd:dateTime canonical form per W3C XSD 1.1 §3.3.8:
 *   - YYYY-MM-DDTHH:MM:SS[.fff][TZ] with zero-padded components
 *   - 'T' separator between date and time
 *   - Optional timezone suffix (Z, +HH:MM, -HH:MM); preserved as-is in v0.1
 *
 * v0.1 preserves the input timezone as-is. v0.2 may add timezone
 * normalization to UTC.
 */
function canonicalizeDateTime(value: string): string {
  const m =
    /^(-?)(\d+)-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/.exec(value);
  if (!m) {
    throw new ParseError(
      `Invalid xsd:dateTime lexical form: "${value}". Lexical form must match (-)?YYYY-MM-DDTHH:MM:SS[.fff][(Z|±HH:MM)]?.`,
      { construct: "invalid-literal-lexical-form" }
    );
  }
  const [, sign, year, month, day, hour, minute, second, fraction, tz] = m;
  const paddedYear = year.length < 4 ? year.padStart(4, "0") : year;
  const paddedMonth = month.padStart(2, "0");
  const paddedDay = day.padStart(2, "0");
  const paddedHour = hour.padStart(2, "0");
  const paddedMinute = minute.padStart(2, "0");
  const paddedSecond = second.padStart(2, "0");
  return (
    sign +
    paddedYear +
    "-" +
    paddedMonth +
    "-" +
    paddedDay +
    "T" +
    paddedHour +
    ":" +
    paddedMinute +
    ":" +
    paddedSecond +
    (fraction ?? "") +
    (tz ?? "")
  );
}
