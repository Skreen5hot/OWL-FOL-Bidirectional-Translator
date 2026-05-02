import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = __dirname;

const COMMON = {
  bundle: true,
  format: "esm",
  target: "es2022",
  minify: true,
  sourcemap: false,
  treeShaking: true,
  external: ["tau-prolog"],
  metafile: true,
};

const ENTRIES = [
  { name: "ofbt-core", entry: resolve(root, "src/index.ts"), out: resolve(root, "dist/bundles/ofbt-core.min.js"), platform: "neutral" },
  { name: "ofbt-core-node", entry: resolve(root, "src/index.ts"), out: resolve(root, "dist/bundles/ofbt-core.node.min.js"), platform: "node" },
  { name: "ofbt-core-browser", entry: resolve(root, "src/index.ts"), out: resolve(root, "dist/bundles/ofbt-core.browser.min.js"), platform: "browser" },
];

const results = {};

for (const e of ENTRIES) {
  try {
    const r = await build({
      ...COMMON,
      entryPoints: [e.entry],
      outfile: e.out,
      platform: e.platform,
    });
    results[e.name] = r.metafile;
  } catch (err) {
    console.error(`Bundle ${e.name} failed:`, err.message);
    process.exit(1);
  }
}

console.log("Bundles written to dist/bundles/");
