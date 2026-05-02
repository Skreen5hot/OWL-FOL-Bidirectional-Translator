#!/usr/bin/env node
/**
 * Bundle Size Measurement
 *
 * Phase 0.1 deliverable per API spec §13.4.3.
 * Reports current minified bundle sizes for OFBT components.
 * Phase 0-6: measurement only (no enforcement).
 * Phase 7: CI enforcement against per-component caps from API spec §13.4.1.
 */

import { stat, readdir } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const bundlesDir = join(root, "dist", "bundles");

const CAPS_KB = {
  "ofbt-core.min.js": 100,
  "ofbt-core.node.min.js": 100,
  "ofbt-core.browser.min.js": 100,
};

async function fileSizeKB(p) {
  const s = await stat(p);
  return s.size / 1024;
}

async function main() {
  let entries;
  try {
    entries = await readdir(bundlesDir);
  } catch {
    console.error(`No bundles found at ${bundlesDir}. Run \`npm run build:bundles\` first.`);
    process.exit(1);
  }

  console.log("\nBundle size report\n==================\n");
  console.log("File".padEnd(40) + "Size (KB)".padStart(12) + "Cap (KB)".padStart(12) + "Status".padStart(12));
  console.log("-".repeat(76));

  let anyOver = false;
  for (const e of entries.sort()) {
    const p = join(bundlesDir, e);
    const sizeKB = await fileSizeKB(p);
    const cap = CAPS_KB[e];
    const status = cap === undefined ? "n/a" : sizeKB <= cap ? "OK" : "OVER";
    if (status === "OVER") anyOver = true;
    console.log(
      e.padEnd(40) +
      sizeKB.toFixed(2).padStart(12) +
      (cap === undefined ? "—" : String(cap)).padStart(12) +
      status.padStart(12)
    );
  }

  console.log("\nNote: caps not enforced until Phase 7 (per ROADMAP §7 deliverables).");
  // Exit 0 always in Phase 0-6; Phase 7 will flip this to `process.exit(anyOver ? 1 : 0)`.
  process.exit(0);
}

await main();
