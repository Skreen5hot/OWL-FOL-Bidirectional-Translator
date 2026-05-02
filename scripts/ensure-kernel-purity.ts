/**
 * Kernel Purity Check (OFBT-specific)
 *
 * Static analysis script that scans compiled kernel files to ensure:
 *   (1) Imports respect layer boundaries (kernel → kernel only, plus a small allowlist)
 *   (2) The kernel does not call any non-deterministic runtime API
 *       enumerated by spec §0.1, §12.9, and Fandaws Consumer Requirement §1.3
 *
 * Allowlisted external imports in kernel:
 *   - "tau-prolog" — peer dep, FOL execution substrate (deterministic)
 *   - "rdf-canonize" — RDFC-1.0 canonical labeling (deterministic)
 *   - "node:crypto" / globalThis.crypto — but ONLY for `subtle.digest` (SHA-256)
 *
 * Run via: npm run test:purity
 */

import { readFile, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Compiled kernel files live at dist-tests/src/kernel/ when invoked via npm run test:purity
const kernelDir = join(__dirname, "..", "src", "kernel");

interface Rule {
  name: string;
  pattern: RegExp;
  message: string;
  // Optional callback: returns true if the match should be treated as ALLOWED rather than violated.
  // Used to allowlist `crypto.subtle.digest` while forbidding `crypto.getRandomValues`.
  isAllowed?: (matchedLine: string) => boolean;
}

const ALLOWLISTED_PACKAGES = new Set(["tau-prolog", "rdf-canonize"]);
// node: builtin allowlist. Per ADR-002, only node:crypto is allowed and only
// for subtle.digest (deterministic SHA-256). All other node: builtins are
// I/O or non-deterministic and forbidden in the kernel.
const ALLOWLISTED_NODE_BUILTINS = new Set(["node:crypto"]);

const RULES: Rule[] = [
  // --- Layer-boundary rules ---
  {
    name: "no-adapter-import",
    pattern: /from\s+["'][^"']*\/adapters\//,
    message: "kernel must not import from src/adapters/",
  },
  {
    name: "no-composition-import",
    pattern: /from\s+["'][^"']*\/composition\//,
    message: "kernel must not import from src/composition/",
  },
  {
    name: "no-cjs-require",
    pattern: /(^|[^.\w])require\s*\(\s*["']/,
    message: "kernel must use ES Module import, not CommonJS require",
  },
  {
    name: "no-dynamic-import-with-variable",
    // matches `import(varName)` or `import(\`...${x}...\`)` — but NOT `import("literal")` or static `import` statements
    pattern: /(?<![A-Za-z0-9_$])import\s*\(\s*[^"')\s]/,
    message: "kernel must not use dynamic import() with a non-literal specifier",
  },
  {
    name: "node-builtin-allowlist",
    // matches imports from node: builtins, e.g., from "node:fs/promises"
    pattern: /from\s+["'](node:[^"']+)["']/,
    message:
      "kernel may only import node:crypto (and only for subtle.digest). " +
      "node:fs, node:path, node:http, node:child_process, etc. are I/O / non-determinism vectors and are forbidden.",
    isAllowed: (line) => {
      const m = line.match(/from\s+["'](node:[^"']+)["']/);
      if (!m) return true;
      const root = m[1].split("/")[0]; // "node:crypto", "node:fs", etc. (strip subpath like /promises)
      return ALLOWLISTED_NODE_BUILTINS.has(root);
    },
  },
  {
    name: "external-import-allowlist",
    // matches bare-specifier imports (not relative, not node: builtins)
    pattern: /from\s+["'](?!\.\/|\.\.\/|node:)([^"']+)["']/,
    message: "kernel external imports are restricted to the allowlist (tau-prolog, rdf-canonize)",
    isAllowed: (line) => {
      const m = line.match(/from\s+["'](?!\.\/|\.\.\/|node:)([^"']+)["']/);
      if (!m) return true;
      // Match either bare package name or scoped/sub-path under it.
      const spec = m[1];
      const root = spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0];
      return ALLOWLISTED_PACKAGES.has(root);
    },
  },
  {
    name: "no-crypto-without-subtle-digest",
    // catches direct top-level crypto.X access where X is not subtle.
    // crypto.subtle.digest is allowlisted; crypto.getRandomValues / randomUUID
    // are caught by their dedicated rules below; this catches everything else.
    pattern: /(^|[^.\w])crypto\.(?!subtle\b)([A-Za-z_$][A-Za-z0-9_$]*)/,
    message:
      "kernel may only use crypto.subtle.digest (SHA-256). Other crypto methods " +
      "are RNG / non-deterministic and forbidden.",
    isAllowed: (line) => {
      // Permit comment lines and string literals only — handled by comment-stripping in checkFile.
      // Permit `crypto.subtle.<anything>.digest(...)` chains by re-checking explicitly:
      return /crypto\.subtle\b/.test(line);
    },
  },

  // --- Determinism rules: temporal non-determinism ---
  {
    name: "no-date-now",
    pattern: /\bDate\.now\s*\(/,
    message: "Date.now() is forbidden in kernel (temporal non-determinism)",
  },
  {
    name: "no-new-date",
    pattern: /\bnew\s+Date\s*\(/,
    message: "new Date() is forbidden in kernel (temporal non-determinism)",
  },
  {
    name: "no-date-getTime",
    pattern: /\.getTime\s*\(\s*\)/,
    message: "Date.prototype.getTime() is forbidden in kernel (temporal non-determinism)",
  },

  // --- Determinism rules: RNG non-determinism ---
  {
    name: "no-math-random",
    pattern: /\bMath\.random\s*\(/,
    message: "Math.random() is forbidden in kernel (RNG non-determinism)",
  },
  {
    name: "no-crypto-random-uuid",
    pattern: /\.randomUUID\s*\(/,
    message: "crypto.randomUUID() is forbidden in kernel (RNG non-determinism)",
  },
  {
    name: "no-crypto-get-random-values",
    pattern: /\.getRandomValues\s*\(/,
    message: "crypto.getRandomValues() is forbidden in kernel (RNG non-determinism)",
  },

  // --- Determinism rules: environment non-determinism ---
  {
    name: "no-process-env",
    pattern: /\bprocess\.env\b/,
    message: "process.env is forbidden in kernel (environment non-determinism; also breaks edge-canonical)",
  },
  {
    name: "no-process-hrtime",
    pattern: /\bprocess\.hrtime\s*\(/,
    message: "process.hrtime() is forbidden in kernel (temporal non-determinism)",
  },
  {
    name: "no-process-platform",
    pattern: /\bprocess\.platform\b/,
    message: "process.platform is forbidden in kernel (environment non-determinism)",
  },
  {
    name: "no-process-argv",
    pattern: /\bprocess\.argv\b/,
    message: "process.argv is forbidden in kernel (CLI is an adapter concern; move to src/adapters/)",
  },
  {
    name: "no-process-stdout",
    pattern: /\bprocess\.stdout\b/,
    message: "process.stdout is forbidden in kernel (I/O is an adapter concern)",
  },
  {
    name: "no-process-stderr",
    pattern: /\bprocess\.stderr\b/,
    message: "process.stderr is forbidden in kernel (I/O is an adapter concern)",
  },
  {
    name: "no-process-exit",
    pattern: /\bprocess\.exit\s*\(/,
    message: "process.exit() is forbidden in kernel (process control is an adapter concern)",
  },
  {
    name: "no-process-cwd",
    pattern: /\bprocess\.cwd\s*\(/,
    message: "process.cwd() is forbidden in kernel (filesystem state is non-deterministic)",
  },
  {
    name: "no-process-pid",
    pattern: /\bprocess\.pid\b/,
    message: "process.pid is forbidden in kernel (environment non-determinism)",
  },
  {
    name: "no-console",
    // catches console.log/info/warn/error/debug — kernel must not write to console
    pattern: /\bconsole\.(log|info|warn|error|debug|trace|dir|table)\s*\(/,
    message: "console.* is forbidden in kernel (I/O is an adapter concern; emit Loss Signatures or throw typed errors instead)",
  },

  // --- Determinism rules: I/O non-determinism ---
  {
    name: "no-fetch",
    pattern: /(^|[^.\w])fetch\s*\(/,
    message: "fetch() is forbidden in kernel (I/O non-determinism)",
  },
  {
    name: "no-xhr",
    pattern: /\bXMLHttpRequest\b/,
    message: "XMLHttpRequest is forbidden in kernel (I/O non-determinism)",
  },

  // --- Determinism rules: ordering ---
  {
    name: "no-bare-sort",
    // sort() with no comparator passed; rely on explicit comparators for stability
    pattern: /\.sort\s*\(\s*\)/,
    message: "Array.prototype.sort() without explicit comparator is forbidden in kernel",
  },
];

interface Violation {
  file: string;
  line: number;
  ruleName: string;
  message: string;
  text: string;
}

let totalViolations: Violation[] = [];

async function checkFile(filePath: string): Promise<void> {
  const content = await readFile(filePath, "utf-8");
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    // Strip block-comment + line-comment content to avoid false positives in JSDoc
    const line = rawLine.replace(/\/\*.*?\*\//g, "").replace(/\/\/.*$/, "");
    if (line.trim() === "") continue;

    for (const rule of RULES) {
      if (!rule.pattern.test(line)) continue;
      if (rule.isAllowed && rule.isAllowed(line)) continue;

      totalViolations.push({
        file: filePath,
        line: i + 1,
        ruleName: rule.name,
        message: rule.message,
        text: rawLine.trim(),
      });
    }
  }
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await walk(p)));
    } else if (e.isFile() && e.name.endsWith(".js")) {
      out.push(p);
    }
  }
  return out;
}

async function main(): Promise<void> {
  console.log("Checking OFBT kernel purity (per ROADMAP cross-cutting Layer Boundaries)...\n");

  let files: string[] = [];
  try {
    files = await walk(kernelDir);
  } catch (err) {
    console.error(`  ✗ FAIL: Could not read kernel directory: ${kernelDir}`);
    console.error(`    ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.error("  ✗ FAIL: No compiled kernel files found");
    process.exit(1);
  }

  for (const file of files) {
    await checkFile(file);
  }

  if (totalViolations.length > 0) {
    console.error(`\n  ✗ FAIL: ${totalViolations.length} purity violation(s) in kernel\n`);
    for (const v of totalViolations) {
      console.error(`  ${v.file}:${v.line} [${v.ruleName}]`);
      console.error(`    ${v.text}`);
      console.error(`    → ${v.message}\n`);
    }
    process.exit(1);
  }

  console.log(`  ✓ PASS: ${files.length} kernel file(s) checked, no purity violations`);
  console.log("    (allowlist: tau-prolog, rdf-canonize, crypto.subtle.digest only)");
}

await main();
