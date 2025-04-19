// build-client.mjs
import { buildSync } from "esbuild";

export default function BuildClient(scriptString:string) {
  try {
    const result = buildSync({
      stdin: {
        contents: scriptString,
        resolveDir: process.cwd(), // so imports work
        sourcefile: "input.jsx",
        loader: "jsx",
      },
      bundle: true,
      minify: true,
      write: false,
      sourcemap: false,
      target: ["es2017"],
      format: "iife",
      platform: "browser",
    });

    return result.outputFiles[0].text;
  } catch (err) {
    console.error("❌ Build failed:", err);
    return null;
  }
}
