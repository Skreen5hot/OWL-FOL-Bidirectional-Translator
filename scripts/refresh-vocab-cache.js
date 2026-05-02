#!/usr/bin/env node
/**
 * Canonical-Vocabulary IRI Cache Refresh Tool
 *
 * Phase 0.7 SME deliverable per ROADMAP. Offline. No network. The SME
 * supplies a path to a locally-downloaded canonical .owl/.ttl/.rdf file;
 * this script extracts IRIs and merges them into arc/vocabulary-cache/<id>.json.
 *
 * Usage:
 *
 *   node scripts/refresh-vocab-cache.js --vocab=<id> --source=<path> [--dry-run] [--prune]
 *
 *   --vocab     Cache id matching arc/vocabulary-cache/<id>.json (e.g., bfo-2020)
 *   --source    Local file path to the canonical release (.owl, .ttl, .rdf, or .nt)
 *   --dry-run   Print the diff without writing
 *   --prune     Remove cache entries that the canonical release does NOT contain
 *               (default: keep them and flag in the diff — SME-curated seedSource
 *                notes are preserved unless --prune is explicit)
 *
 * Parser scope: minimal regex-based scan that extracts IRIs and OWL/RDFS
 * type declarations. NOT a full RDF parser; sufficient for IRI-existence
 * + entity-type classification, which is what the cache needs.
 *
 * For richer content (rdfs:label, deprecation), the SME edits the cache
 * file directly after refresh.
 */

import { readFile, writeFile } from "node:fs/promises";
import { join, dirname, resolve, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const cacheDir = join(root, "arc", "vocabulary-cache");

function parseArgs(argv) {
  const out = { vocab: null, source: null, dryRun: false, prune: false };
  for (const a of argv) {
    if (a.startsWith("--vocab=")) out.vocab = a.slice("--vocab=".length);
    else if (a.startsWith("--source=")) out.source = a.slice("--source=".length);
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--prune") out.prune = true;
  }
  return out;
}

const TYPE_HINTS = [
  { rx: /owl:Class\b/, type: "class" },
  { rx: /owl:ObjectProperty\b/, type: "object-property" },
  { rx: /owl:DatatypeProperty\b/, type: "data-property" },
  { rx: /owl:AnnotationProperty\b/, type: "annotation-property" },
  { rx: /owl:NamedIndividual\b/, type: "named-individual" },
  { rx: /rdfs:Datatype\b/, type: "datatype" },
];

const OBO_RDF_TYPE_HINTS = [
  // RDF/XML form: <rdf:type rdf:resource=".../owl#Class"/>
  { rx: /rdf:resource=["'][^"']*owl#Class["']/, type: "class" },
  { rx: /rdf:resource=["'][^"']*owl#ObjectProperty["']/, type: "object-property" },
  { rx: /rdf:resource=["'][^"']*owl#DatatypeProperty["']/, type: "data-property" },
  { rx: /rdf:resource=["'][^"']*owl#AnnotationProperty["']/, type: "annotation-property" },
  { rx: /rdf:resource=["'][^"']*owl#NamedIndividual["']/, type: "named-individual" },
];

function extractIRIsAndTypes(text, iriPatternRe) {
  // Heuristic block extraction: find every <foo>...</foo> or `foo a owl:X.` block
  // and grab the (subject, type) pairs whose subject matches the cache's iriPattern.

  const found = new Map(); // iri → type (last-write-wins; OWL files are well-formed)

  // (1) Turtle-ish: "<IRI> a owl:Class" or "<IRI> a owl:ObjectProperty"
  const ttlRe = /<([^>\s]+)>\s+(?:a|rdf:type)\s+([^;.\s]+)/g;
  let m;
  while ((m = ttlRe.exec(text)) !== null) {
    const iri = m[1];
    if (!iriPatternRe.test(iri)) continue;
    const typeRef = m[2];
    for (const h of TYPE_HINTS) {
      if (h.rx.test(typeRef)) {
        found.set(iri, h.type);
        break;
      }
    }
  }

  // (2) RDF/XML: <owl:Class rdf:about="IRI"> ... </owl:Class>
  const rdfXmlRe = /<(owl:Class|owl:ObjectProperty|owl:DatatypeProperty|owl:AnnotationProperty|owl:NamedIndividual)\s+[^>]*rdf:about=["']([^"']+)["']/g;
  while ((m = rdfXmlRe.exec(text)) !== null) {
    const tag = m[1];
    const iri = m[2];
    if (!iriPatternRe.test(iri)) continue;
    const type = tag === "owl:Class" ? "class"
      : tag === "owl:ObjectProperty" ? "object-property"
      : tag === "owl:DatatypeProperty" ? "data-property"
      : tag === "owl:AnnotationProperty" ? "annotation-property"
      : "named-individual";
    found.set(iri, type);
  }

  // (3) RDF/XML with rdf:Description + rdf:type:
  //     <rdf:Description rdf:about="IRI"> <rdf:type rdf:resource=".../owl#Class"/> ...
  const descRe = /<rdf:Description\s+[^>]*rdf:about=["']([^"']+)["'][^>]*>([\s\S]*?)<\/rdf:Description>/g;
  while ((m = descRe.exec(text)) !== null) {
    const iri = m[1];
    if (!iriPatternRe.test(iri)) continue;
    const body = m[2];
    for (const h of OBO_RDF_TYPE_HINTS) {
      if (h.rx.test(body)) {
        found.set(iri, h.type);
        break;
      }
    }
  }

  return found;
}

async function loadCache(vocab) {
  const path = join(cacheDir, `${vocab}.json`);
  const raw = await readFile(path, "utf-8");
  return { path, doc: JSON.parse(raw) };
}

function sortEntries(entries) {
  return [...entries].sort((a, b) => a.iri.localeCompare(b.iri));
}

function diff(oldEntries, newMap, prune) {
  const oldByIri = new Map(oldEntries.map((e) => [e.iri, e]));
  const merged = [];
  const added = [];
  const refreshed = [];
  const orphaned = [];

  // Existing entries: refresh those present in the canonical release.
  for (const old of oldEntries) {
    if (newMap.has(old.iri)) {
      const newType = newMap.get(old.iri);
      const next = { ...old, type: newType };
      delete next.unverified;
      delete next.seedSource;
      merged.push(next);
      if (old.unverified || old.seedSource || old.type !== newType) {
        refreshed.push({ iri: old.iri, oldType: old.type, newType });
      }
    } else {
      orphaned.push(old.iri);
      if (!prune) merged.push(old);
    }
  }

  // New entries from the canonical release that the cache didn't have.
  for (const [iri, type] of newMap.entries()) {
    if (!oldByIri.has(iri)) {
      merged.push({ iri, type });
      added.push({ iri, type });
    }
  }

  return { merged: sortEntries(merged), added, refreshed, orphaned };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.vocab || !args.source) {
    console.error(
      "Usage: node scripts/refresh-vocab-cache.js --vocab=<id> --source=<path> [--dry-run] [--prune]"
    );
    process.exit(2);
  }

  let cache;
  try {
    cache = await loadCache(args.vocab);
  } catch (e) {
    console.error(`✗ Could not load cache for vocab=${args.vocab}: ${e.message}`);
    process.exit(1);
  }

  const sourcePath = resolve(args.source);
  let sourceText;
  try {
    sourceText = await readFile(sourcePath, "utf-8");
  } catch (e) {
    console.error(`✗ Could not read source file ${sourcePath}: ${e.message}`);
    process.exit(1);
  }

  const ext = extname(sourcePath).toLowerCase();
  if (![".owl", ".ttl", ".rdf", ".nt", ".xml"].includes(ext)) {
    console.warn(
      `! Source file extension "${ext}" not in known set (.owl/.ttl/.rdf/.nt/.xml); proceeding anyway.`
    );
  }

  const iriPattern = new RegExp(cache.doc.iriPattern);
  const found = extractIRIsAndTypes(sourceText, iriPattern);

  const { merged, added, refreshed, orphaned } = diff(
    cache.doc.entries,
    found,
    args.prune
  );

  console.log(`\nRefresh report for ${args.vocab}:`);
  console.log(`  Source: ${sourcePath} (${basename(sourcePath)})`);
  console.log(`  Source IRIs found: ${found.size}`);
  console.log(`  Cache entries before: ${cache.doc.entries.length}`);
  console.log(`  Cache entries after:  ${merged.length}`);
  console.log(`  Added: ${added.length}`);
  console.log(`  Refreshed (unverified flag cleared or type updated): ${refreshed.length}`);
  console.log(
    `  In cache but absent from source: ${orphaned.length} ${args.prune ? "(pruned)" : "(retained)"}`
  );

  if (added.length > 0 && added.length <= 20) {
    console.log("\n  + Added IRIs:");
    for (const a of added) console.log(`    + ${a.type.padEnd(20)} ${a.iri}`);
  }
  if (refreshed.length > 0 && refreshed.length <= 20) {
    console.log("\n  ~ Refreshed IRIs:");
    for (const r of refreshed) {
      const typeNote = r.oldType !== r.newType ? `  (type ${r.oldType} → ${r.newType})` : "";
      console.log(`    ~ ${r.iri}${typeNote}`);
    }
  }
  if (orphaned.length > 0 && orphaned.length <= 20) {
    console.log(
      `\n  ${args.prune ? "−" : "?"} Orphaned IRIs (in cache, not in source):`
    );
    for (const iri of orphaned) console.log(`    ${args.prune ? "−" : "?"} ${iri}`);
  }

  if (args.dryRun) {
    console.log("\n(dry-run — no file written)");
    return;
  }

  cache.doc.entries = merged;
  cache.doc.retrievedAt = new Date().toISOString();
  if (cache.doc.version === "unverified" || cache.doc.version.endsWith("-unverified")) {
    console.log(
      `  ! Note: cache.version is currently "${cache.doc.version}". ` +
      "After review, edit the file to set version to the canonical release identifier " +
      "(e.g., '2020' for BFO; release date for IAO/RO; commit SHA for CCO snapshots)."
    );
  }
  await writeFile(cache.path, JSON.stringify(cache.doc, null, 2) + "\n", "utf-8");
  console.log(`\n  ✓ Wrote ${cache.path}`);
  console.log(
    "  Next: review the diff, set 'version' to the canonical release identifier if still unverified, commit."
  );
}

await main().catch((e) => {
  console.error("✗ FAIL: " + (e instanceof Error ? e.stack || e.message : String(e)));
  process.exit(1);
});
