// src/helpers.ts
import { readFileSync } from "fs";
function extractClientComponentsAndModules(source) {
  const components = {};
  let importLines = "";
  const clientClassRegex = /@Client\(\)\s*@Use\(([\s\S]*?)\)\s*class\s+([A-Za-z0-9_]+)\s*{([\s\S]*?)^\}/gm;
  const clientMatch = clientClassRegex.exec(source);
  if (!clientMatch) return { components, imports: "" };
  const [, useBody, className, classBody] = clientMatch;
  try {
    console.log(useBody, global.nestReactBuild.use);
    const useObj = global.nestReactBuild.use;
    importLines = Object.entries(useObj ? useObj : {}).map(([key, mod]) => String(mod).includes("./") || String(mod).includes("@") ? `import ${key} from "${mod}";` : `import * as ${key} from "${mod}";`).join("\n");
  } catch (err) {
    console.error("Failed to parse @Use body:", err);
  }
  const componentStartRegex = /@Component\s*\(([^)]*)\)?\s*(\w+)\s*\(([^)]*)\)\s*{/g;
  let match;
  while ((match = componentStartRegex.exec(classBody)) !== null) {
    const [s, decoratorArg, name, args] = match;
    const startIndex = componentStartRegex.lastIndex;
    let braceCount = 1;
    let i = startIndex;
    while (i < classBody.length && braceCount > 0) {
      if (classBody[i] === "{") braceCount++;
      else if (classBody[i] === "}") braceCount--;
      i++;
    }
    const body = classBody.slice(startIndex, i);
    components[name] = {
      componentType: decoratorArg,
      type: args.trim(),
      component: `function ${name}(${args.trim()}) {${body}`
    };
  }
  return {
    components,
    imports: importLines
  };
}
function extractClassBlock(content, decorator) {
  const decoratorIndex = content.indexOf(decorator);
  if (decoratorIndex === -1) return "";
  const sliced = content.slice(decoratorIndex);
  const classStart = sliced.indexOf("class ");
  if (classStart === -1) return "";
  let i = sliced.indexOf("{", classStart);
  let depth = 0;
  let end = i;
  while (i < sliced.length) {
    if (sliced[i] === "{") depth++;
    if (sliced[i] === "}") depth--;
    if (depth === 0) {
      end = i;
      break;
    }
    i++;
  }
  return sliced.slice(0, end + 1);
}
function extractClientAndServer(filePath) {
  const fileContent = readFileSync(`${filePath}`, "utf-8");
  const imports = fileContent.match(/^import .*?;$/gm)?.join("\n") ?? "";
  const clientBlock = extractClassBlock(fileContent, "@Client");
  const serverBlock = extractClassBlock(fileContent, "@Server");
  return {
    client: `${imports}

${clientBlock}`.trim(),
    server: `${imports}

${serverBlock}`.trim()
  };
}

export {
  extractClientComponentsAndModules,
  extractClientAndServer
};
