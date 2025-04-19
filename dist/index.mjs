import {
  extractClientAndServer,
  extractClientComponentsAndModules
} from "./chunk-VY2XA7MD.mjs";

// src/index.ts
import ReactDOMServer from "react-dom/server";
import React from "react";
import { readFileSync } from "fs";
import { join } from "path";
import esbuild from "esbuild";
global.nestReactBuild = { Client: {}, Server: {}, use: {} };
var script = [
  "/__nestreact.js",
  (req, res) => {
    res.setHeader("Content-Type", "application/javascript");
    res.send(`${readFileSync(join(__dirname, "./client.js")).toString()}`);
  }
];
function tsToJsString(tsxCode) {
  const result = esbuild.transformSync(tsxCode, {
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
  const { components, imports } = extractClientComponentsAndModules(client, global.nestReactBuild.use);
  const Client2 = {};
  Object.keys(components).map((k) => {
    Client2[k] = function(props) {
      const config = {
        props,
        body: tsToJsString(`${imports};${components[k].component}`),
        type: components[k].componentType,
        id: `Elm-${k}`
      };
      return React.createElement(React.Fragment, null, [
        React.createElement(components[k].componentType.slice(1, -1), { id: config.id, key: 1 }),
        React.createElement("script", { "nestclient": JSON.stringify(config), key: 2 })
      ]);
    };
  });
  const element = await global.nestReactBuild.Server.render({
    Client: Client2,
    props: options
  });
  return callback(null, `<!DOCTYPE html><script src="${script[0]}" defer></script>` + ReactDOMServer.renderToString(element));
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
      for (const [key, module] of Object.entries(proto.__modules)) {
        try {
          if (!proto.components) proto.components = {};
          proto.components[key] = module;
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
      for (const [key, module] of Object.entries(proto.__modules)) {
        try {
          proto[key] = module;
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
    for (const [key, module] of Object.entries(modules)) {
      if (!proto.__modules.use) {
        const bld = {};
        bld[key] = module;
        proto.__modules.use = bld;
      } else proto.__modules.use[key] = module;
    }
  };
}
export {
  Client,
  Component,
  Render,
  Server,
  Use,
  index_default as default,
  script,
  tsToJsString
};
