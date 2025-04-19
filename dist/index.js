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
  default: () => index_default,
  script: () => script,
  tsToJsString: () => tsToJsString
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
    console.log(useBody, nestReactBuild.use);
    const useObj = nestReactBuild.use;
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
var import_fs2 = require("fs");
var import_path = require("path");
var import_esbuild = __toESM(require("esbuild"));
global.nestReactBuild = { Client: {}, Server: {}, use: {} };
var script = [
  "/__nestreact.js",
  (req, res) => {
    res.setHeader("Content-Type", "application/javascript");
    res.send(`${(0, import_fs2.readFileSync)((0, import_path.join)(__dirname, "./client.js")).toString()}`);
  }
];
function tsToJsString(tsxCode) {
  const result = import_esbuild.default.transformSync(tsxCode, {
    loader: "tsx",
    format: "esm",
    jsx: "transform",
    minify: true,
    target: "es2015"
  });
  return result.code;
}
async function Engine(filePath, options = {}, callback) {
  const { client } = extractClientAndServer(`${filePath}`);
  await import(filePath.replace("src/views", "dist/views").replace(".tsx", ".js"));
  const { components } = extractClientComponentsAndModules(client, global.nestReactBuild.use);
  const Client2 = {};
  Object.keys(components).map((k) => {
    Client2[k] = function(props) {
      const config = {
        props,
        body: tsToJsString(`${components[k].component}`),
        type: components[k].componentType,
        id: `Elm-${k}`
      };
      return import_react.default.createElement(import_react.default.Fragment, null, [
        import_react.default.createElement(components[k].componentType.slice(1, -1), { id: config.id, key: 1 }),
        import_react.default.createElement("script", { "nestclient": JSON.stringify(config), key: 2 })
      ]);
    };
  });
  const element = await global.nestReactBuild.Server.render({
    Client: Client2,
    props: options
  });
  return callback(null, `<!DOCTYPE html><script src="${script[0]}" defer></script>` + import_server.default.renderToString(element));
}
var index_default = Engine;
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
  Use,
  script,
  tsToJsString
});
