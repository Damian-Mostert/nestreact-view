// build-client.mjs
const { build } = require("esbuild");
const { join } = require("path");

const entry = join(__dirname, "client.tsx"); // or client.js
const outdir = join(__dirname,"../dist");

build({
  entryPoints: [entry],
  bundle: true,
  minify: true,
  sourcemap: true,
  outfile: join(outdir, "client.js"),
  target: ["es2017"],
  format: "iife",
  platform: "browser",
}).then(() => {
  console.log("✅ Client script built successfully!");
}).catch((err) => {
  console.error("❌ Build failed:", err);
  process.exit(1);
});
