"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Client: () => Client,
  Component: () => Component,
  Render: () => Render,
  Server: () => Server,
  Use: () => Use,
  default: () => NestReactEngine
});
module.exports = __toCommonJS(index_exports);
var import_server = __toESM(require("react-dom/server"));

// src/helpers.ts
var import_fs = require("fs");
function extractClientComponentsAndModules(source, nestReactBuild) {
  const components = {};
  let importLines = "";
  const clientClassRegex = /@Client\(\)\s*@Use\(([\s\S]*?)\)\s*class\s+([A-Za-z0-9_]+)\s*{([\s\S]*?)^\}/gm;
  const clientMatch = clientClassRegex.exec(source);
  if (!clientMatch) return { components, imports: "" };
  const [, useBody, className, classBody] = clientMatch;
  try {
    if (!useBody) throw "@Client must follow with @Use";
    const useObj = eval(`(${useBody})`);
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
  const fileContent = (0, import_fs.readFileSync)(`${filePath}`, "utf-8");
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

// src/index.ts
var import_react = __toESM(require("react"));

// client/build.ts
var import_esbuild = require("esbuild");
function buildClientFromString(code) {
  try {
    const result = (0, import_esbuild.buildSync)({
      stdin: {
        contents: code,
        resolveDir: process.cwd()
      },
      bundle: true,
      minify: false,
      write: false,
      sourcemap: false,
      jsx: "transform",
      target: ["es2017"],
      format: "iife",
      platform: "browser",
      loader: { ".js": "jsx" }
    });
    const output = result.outputFiles[0].text;
    return output;
  } catch (err) {
    console.error("\u274C Build failed:", err);
    throw err;
  }
}
function tsToJsString(tsxCode) {
  const result = (0, import_esbuild.transformSync)(tsxCode, {
    loader: "tsx",
    format: "esm",
    jsx: "transform",
    minify: true,
    target: "es2015"
  });
  return result.code;
}

// src/index.ts
var import_fs2 = require("fs");
var import_path = require("path");
global.nestReactBuild = { Client: {}, Server: {}, use: {} };
async function Engine(filePath, options = {}, callback) {
  const { client } = extractClientAndServer(`${filePath}`);
  await import(filePath.replace("src/views", "dist/views").replace(".tsx", ".js"));
  const { components: components2, imports } = extractClientComponentsAndModules(client, global.nestReactBuild.use);
  const Client2 = {};
  Object.keys(components2).map((k) => {
    Client2[k] = function(props) {
      const config = {
        props,
        body: tsToJsString(`${components2[k].component}`),
        type: components2[k].componentType,
        id: `Elm-${k}`,
        modules: Object.keys(nestReactBuild.use).map((k2) => k2).join(", ")
      };
      return import_react.default.createElement(import_react.default.Fragment, null, [
        import_react.default.createElement(components2[k].componentType.slice(1, -1), { id: config.id, key: 1 }),
        import_react.default.createElement("script", { "nestclient": JSON.stringify(config), key: 2 })
      ]);
    };
  });
  const element = await global.nestReactBuild.Server.render({
    Client: Client2,
    props: options
  });
  return callback(null, `<!DOCTYPE html><script id="nest_init" defer>${buildClientFromString(`${imports}${(0, import_fs2.readFileSync)((0, import_path.join)(__dirname, "../client/client.tsx")).toString().replace("{{MODULES}}", Object.keys(nestReactBuild.use).map((k) => k).join(", "))}`)};document.getElementById('nest_init').remove()</script>` + import_server.default.renderToString(element));
}
function NestReactEngine(app) {
  app.set("views", (0, import_path.join)(process.cwd(), "./src/views"));
  app.engine("tsx", Engine);
  app.set("view engine", "tsx");
}
function Component(type = '"div"') {
  return function(target, propertyKey, descriptor) {
    if (!target.__components) target.__components = {};
    const originalFn = descriptor.value;
    target.__components[propertyKey] = function(...args) {
      const boundFn = originalFn.bind(this);
      return boundFn(...args);
    };
  };
}
function Render() {
  return function(target, propertyKey, descriptor) {
    if (!target.__components) target.__components = {};
    const originalFn = descriptor.value;
    target.__components[propertyKey] = function(...args) {
      const boundFn = originalFn.bind(this);
      return boundFn(...args);
    };
  };
}
function Client() {
  return function(constructor) {
    const instance = new constructor();
    const collected = {};
    const proto = constructor.prototype;
    if (proto.__components) {
      for (const key of Object.keys(proto.__components)) {
        collected[key] = proto.__components[key].bind(instance);
      }
    }
    if (proto.__modules) {
      for (const [key, module2] of Object.entries(proto.__modules)) {
        try {
          if (!proto.components) proto.components = {};
          proto.components[key] = module2;
        } catch (err) {
        }
      }
      globalThis.nestReactBuild.Client = {
        ...globalThis.nestReactBuild.Client,
        ...proto.__modules
      };
    }
    if (!globalThis.nestReactBuild.Client.components) {
      globalThis.nestReactBuild.Client.components = {};
    }
    globalThis.nestReactBuild.Client.components[constructor.name] = collected;
  };
}
function Server() {
  return function(constructor) {
    const instance = new constructor();
    const collected = {};
    const proto = constructor.prototype;
    if (proto.__components) {
      for (const key of Object.keys(proto.__components)) {
        collected[key] = proto.__components[key].bind(instance);
      }
    }
    if (proto.__modules) {
      for (const [key, module2] of Object.entries(proto.__modules)) {
        try {
          proto[key] = module2;
        } catch (err) {
        }
      }
      globalThis.nestReactBuild.Server = { ...globalThis.nestReactBuild.Server };
    }
    globalThis.nestReactBuild.Server = { ...globalThis.nestReactBuild.Server, ...collected };
  };
}
function Use(modules) {
  global.nestReactBuild.use = modules;
  return function(constructor) {
    const proto = constructor.prototype;
    proto.__modules = proto.__modules || {};
    for (const [key, module2] of Object.entries(modules)) {
      if (!proto.__modules.use) {
        const bld = {};
        bld[key] = module2;
        proto.__modules.use = bld;
      } else proto.__modules.use[key] = module2;
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Client,
  Component,
  Render,
  Server,
  Use
});
