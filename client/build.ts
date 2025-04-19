import { buildSync, transformSync } from "esbuild";
export function buildClientFromString(code:string) {
  console.log('in',code)
  try {
    const result = buildSync({
      stdin: {
        contents: code,
        resolveDir: process.cwd(),
        sourcefile: "client.tsx",
        loader: "tsx",
      },
      bundle: true,
      minify: true,
      sourcemap: false,
      write: false,
      target: ["es2017"],
      format: "iife",
      platform: "browser",
    });

    const output = result.outputFiles[0].text;
    return output;
  } catch (err) {
    console.error("❌ Build failed:", err);
    throw err;
  }
}

export function tsToJsString(tsxCode: string): string {
  const result = transformSync(tsxCode, {
    loader: 'tsx',
    format: 'esm',
    jsx: 'transform',
    minify: true,
    target: 'es2015',
  });

  return result.code;
}
