"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/helpers.ts
var helpers_exports = {};
__export(helpers_exports, {
  extractClientAndServer: () => extractClientAndServer,
  extractClientComponentsAndModules: () => extractClientComponentsAndModules
});
module.exports = __toCommonJS(helpers_exports);
var import_fs = require("fs");
function extractClientComponentsAndModules(source) {
  const components = {};
  let importLines = "";
  const clientClassRegex = /@Client\(\)\s*@Use\(([\s\S]*?)\)\s*class\s+([A-Za-z0-9_]+)\s*{([\s\S]*?)^\}/gm;
  const clientMatch = clientClassRegex.exec(source);
  if (!clientMatch) return { components, imports: "" };
  const [, useBody, className, classBody] = clientMatch;
  try {
    const useObj = eval(`(${useBody})`);
    importLines = Object.entries(useObj).map(([key, mod]) => String(mod).includes("./") ? `import ${key} from "${mod}";` : `import * as ${key} from "${mod}";`).join("\n");
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
  const fileContent = (0, import_fs.readFileSync)(`${filePath}`, "utf-8");
  const imports = fileContent.match(/^import .*?;$/gm)?.join("\n") ?? "";
  const clientBlock = extractClassBlock(fileContent, "@Client");
  const serverBlock = extractClassBlock(fileContent, "@Server");
  return {
    client: `${clientBlock}`.trim(),
    server: `${imports}

${serverBlock}`.trim()
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  extractClientAndServer,
  extractClientComponentsAndModules
});
