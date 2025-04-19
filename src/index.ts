import ReactDOMServer from "react-dom/server";
import BuildClient from "../client/build-imports.js"
declare global {
	var nestReactBuild: {
		Client: Record<string, any>;
		Server: Record<string, any>;
	};
}

global.nestReactBuild={Client:{},Server:{}}

import {extractClientAndServer, extractClientComponentsAndModules} from "./helpers";
import React from "react";
import { Request, Response } from "express";
import { readFileSync } from "fs";
import { join } from "path";
export const script = [
	"/__nestreact.js",
	(req:Request,res:Response)=>{
		res.setHeader("Content-Type", "application/javascript");
		res.send(`${BuildClient(`
			import ReactParallaxTilt from "react-parallax-tilt"
		`)}${readFileSync(join(__dirname,"./client.js")).toString()}`);
	}
]
import esbuild from 'esbuild';

export function tsToJsString(tsxCode: string): string {
  const result = esbuild.transformSync(tsxCode, {
    loader: 'tsx',
    format: 'esm',
    jsx: 'transform',
    minify: true,
    target: 'es2015',
  });

  return result.code;
}

async function Engine(filePath:string, options:any = {}, callback:(err:any,response?:string)=>void) {
	const {client} = extractClientAndServer(`${filePath}`);
	(await import(filePath.replace("src/views","dist/views").replace(".tsx",".js")));
	const {components} = extractClientComponentsAndModules(client) 
	const Client:any = {};
	Object.keys(components).map(k=>{
		Client[k] = function(props:any){
			const config = {
				props,
				body:tsToJsString(components[k].component),
				type:components[k].componentType,
				id:`Elm-${k}`,
			}
			return React.createElement(React.Fragment,null,[
				React.createElement(components[k].componentType.slice(1,-1),{id:config.id,key:1}),
				React.createElement("script",{'nestclient':JSON.stringify(config),key:2})
			])
		}
	})
	const element =await global.nestReactBuild.Server.render({
		Client,
		props:options
	})
	return callback(null, `<!DOCTYPE html><script src="${script[0]}" defer></script>` + ReactDOMServer.renderToString(element))
}
export default Engine;
// -- Component Decorator
export function Component(type:string = '"div"') {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		if (!target.__components) target.__components = {};

		const originalFn = descriptor.value;

		target.__components[propertyKey] = function (...args: any[]) {
			const boundFn = originalFn.bind(this);
			return boundFn(...args);
		};
	};
}

// -- Render Decorator
export function Render() {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		if (!target.__components) target.__components = {};

		const originalFn = descriptor.value;

		target.__components[propertyKey] = function (...args: any[]) {
			const boundFn = originalFn.bind(this);
			return boundFn(...args);
		};
	};
}

// -- Client Decorator
export function Client() {
	return function (constructor: Function) {
		const instance = new (constructor as any)();
		const collected: Record<string, any> = {};
		const proto = constructor.prototype;

		if (proto.__components) {
			for (const key of Object.keys(proto.__components)) {
				collected[key] = proto.__components[key].bind(instance);
			}
		}

		// Add modules to the global client object (from @Use decorator)
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
				...proto.__modules,
			};
		}

		// Ensure the global object has `Client.components`
		if (!globalThis.nestReactBuild.Client.components) {
			globalThis.nestReactBuild.Client.components = {};
		}

		// Store collected methods under `Client.components.ComponentName`
		globalThis.nestReactBuild.Client.components[constructor.name] = collected;

	};
}


// -- Server Decorator
export function Server() {
	return function (constructor: Function) {
		const instance = new (constructor as any)();
		const collected: Record<string, any> = {};
		const proto = constructor.prototype;

		if (proto.__components) {
			for (const key of Object.keys(proto.__components)) {
				collected[key] = proto.__components[key].bind(instance);
			}
		}

		// Add modules to the global server object (from @Use decorator)
		if (proto.__modules) {
			for (const [key, module] of Object.entries(proto.__modules)) {
				try {
					proto[key] = module;
				} catch (err) {
				}

			}
			// Add modules to the global server build object
			globalThis.nestReactBuild.Server = { ...globalThis.nestReactBuild.Server, ...proto.__modules };
		}

		// Store methods in the global object
		globalThis.nestReactBuild.Server = { ...globalThis.nestReactBuild.Server, ...collected };
	};
}

// -- Use Decorator (to be used inside Client or Server decorator)
export function Use(modules: { [key: string]: string }) {
	return function (constructor: Function) {
		const proto = constructor.prototype;

		// Assign modules to the class prototype for later access inside methods
		proto.__modules = proto.__modules || {};

		// Store the modules to be injected
		for (const [key, module] of Object.entries(modules)) {
			if(!proto.__modules.use){
				const bld = {};
				//@ts-expect-error
				bld[key] = module;
				proto.__modules.use = bld
			}
			else proto.__modules.use[key] = module
		}

	};
}

export {};
