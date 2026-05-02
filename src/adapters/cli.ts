/**
 * OFBT CLI (Adapter Layer)
 *
 * Reads a JSON-LD file from the command line, invokes the kernel transform,
 * and writes the canonicalized result to stdout.
 *
 * Usage: node dist/adapters/cli.js <input-file.jsonld>
 *
 * Lives in src/adapters/ per the architect's layer-boundary ruling
 * (kernel must not perform I/O; CLI is infrastructure-adjacent).
 *
 * Phase 1 will replace the underlying call from `transform` (the template
 * identity transform) to `owlToFol`.
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { transform } from "../kernel/transform.js";
import { stableStringify } from "../kernel/canonicalize.js";

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    process.stderr.write(
      "Usage: node dist/adapters/cli.js <input-file.jsonld>\n"
    );
    process.exit(1);
  }

  const inputPath = resolve(args[0]);

  try {
    const raw = await readFile(inputPath, "utf-8");
    const input: unknown = JSON.parse(raw);
    const output = transform(input);
    process.stdout.write(stableStringify(output, true) + "\n");
  } catch (error) {
    if (error instanceof SyntaxError) {
      process.stderr.write(`Invalid JSON in input file: ${error.message}\n`);
    } else if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      process.stderr.write(`File not found: ${inputPath}\n`);
    } else {
      process.stderr.write(
        `Error: ${error instanceof Error ? error.message : String(error)}\n`
      );
    }
    process.exit(1);
  }
}

main();
