import { readFileSync } from "fs";

export function extractClientComponentsAndModules(source: string,nestReactBuild:any) {
	const components: Record<string, { type: string; component: string,componentType:string }> = {};
	let importLines = "";
	const clientClassRegex =
	/@Client\(\)\s*@Use\(([\s\S]*?)\)\s*class\s+([A-Za-z0-9_]+)\s*{([\s\S]*?)^\}/gm;
	const clientMatch = clientClassRegex.exec(source);

	if (!clientMatch) return { components, imports: "" };
	const [, useBody, className, classBody] = clientMatch;
	try {
		console.log(useBody,global.nestReactBuild.use)
		const useObj =global.nestReactBuild.use;
		importLines = Object.entries(useObj?useObj:{})
			.map(([key, mod]) => String(mod).includes("./")||String(mod).includes("@")?`import ${key} from "${mod}";`: `import * as ${key} from "${mod}";`)
			.join("\n");
	} catch (err) {
		console.error("Failed to parse @Use body:", err);
	}

	// 3. Extract all @Component() methods with full body brace matching
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
      componentType:decoratorArg,
			type: args.trim(),
			component: `function ${name}(${args.trim()}) {${body}`,
		};
	}

	return {
		components,
		imports: importLines,
	};
}

function extractClassBlock(content: string, decorator: "@Client" | "@Server") {
	const decoratorIndex = content.indexOf(decorator);
	if (decoratorIndex === -1) return "";

	// Slice from decorator to the end
	const sliced = content.slice(decoratorIndex);

	// Match from class to matching closing brace
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

export function extractClientAndServer(filePath: string) {
	const fileContent = readFileSync(`${filePath}`, "utf-8");

	const imports = fileContent.match(/^import .*?;$/gm)?.join("\n") ?? "";
  
	const clientBlock = extractClassBlock(fileContent, "@Client");
	const serverBlock = extractClassBlock(fileContent, "@Server");

	return {
		client: `${imports}\n\n${clientBlock}`.trim(),
		server: `${imports}\n\n${serverBlock}`.trim(),
	};
}
