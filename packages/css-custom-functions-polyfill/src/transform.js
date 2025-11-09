/**
 * CSS Custom Functions Transform Engine
 * Handles parsing and transformation of @function definitions and function calls
 */

/**
 * Extract @function definitions from CSS text
 * @param {string} cssText - CSS text containing @function definitions
 * @returns {Object} - Object mapping function names to their definitions
 */
export function extractFunctions(cssText) {
	const functions = {};

	if (!cssText) return functions;

	// Match @function definitions
	const functionRegex =
		/@function\s+(--[\w-]+)\s*\(\s*([^)]*)\s*\)\s*{([^}]*(?:{[^}]*}[^}]*)*)}/g;
	let match;

	while ((match = functionRegex.exec(cssText)) !== null) {
		const [, name, parameterString, bodyString] = match;
		const functionName = name.startsWith('--') ? name : `--${name}`;
		const parameters = parameterString
			? parameterString.split(',').map((parameter) => parameter.trim())
			: [];
		const body = parseFunctionBody(bodyString.trim());

		functions[functionName] = {
			name: functionName,
			parameters,
			body
		};
	}

	return functions;
}

/**
 * Parse function body content into structured blocks
 * @param {string} bodyString - Function body content
 * @returns {Array} - Array of parsed body blocks
 */
function parseFunctionBody(bodyString) {
	const blocks = [];
	const lines = bodyString
		.split(';')
		.map((line) => line.trim())
		.filter(Boolean);

	for (const line of lines) {
		if (line.startsWith('result:')) {
			blocks.push({
				type: 'result',
				value: line.slice(7).trim()
			});
		} else if (line.startsWith('@media')) {
			const mediaMatch = line.match(/@media\s+(.+)\s*{(.+)}/);
			if (mediaMatch) {
				const [, condition, content] = mediaMatch;
				blocks.push({
					type: 'media',
					condition: condition.trim(),
					rules: parseFunctionBody(content)
				});
			}
		} else if (line.startsWith('@supports')) {
			const supportsMatch = line.match(/@supports\s+(.+)\s*{(.+)}/);
			if (supportsMatch) {
				const [, condition, content] = supportsMatch;
				blocks.push({
					type: 'supports',
					condition: condition.trim(),
					rules: parseFunctionBody(content)
				});
			}
		}
	}

	return blocks;
}

/**
 * Find all function calls in CSS text
 * @param {string} cssText - CSS text to search
 * @returns {Array} - Array of function call objects
 */
export function findFunctionCalls(cssText) {
	const calls = [];

	// Match --functionName(args) calls
	const callRegex = /--([\w-]+)\s*\(\s*([^)]*)\s*\)/g;
	let match;

	while ((match = callRegex.exec(cssText)) !== null) {
		const [fullMatch, functionName, argumentsString] = match;
		const argumentsArray = argumentsString
			? argumentsString.split(',').map((argument) => argument.trim())
			: [];

		calls.push({
			match: fullMatch,
			functionName,
			arguments: argumentsArray,
			startIndex: match.index,
			endIndex: match.index + fullMatch.length
		});
	}

	return calls;
}

/**
 * Build-time transform: Process @function definitions and calls
 * @param {string} cssText - Input CSS text
 * @returns {string} - Transformed CSS with functions resolved
 */
export function buildTimeTransform(cssText) {
	// Extract function definitions
	const functions = extractFunctions(cssText);

	// Remove @function definitions from output
	let transformedCSS = cssText.replaceAll(
		/@function\s+--[\w-]+\s*\([^)]*\)\s*{[^}]*(?:{[^}]*}[^}]*)*}/g,
		''
	);

	// Find and resolve function calls
	const calls = findFunctionCalls(transformedCSS);

	// Process calls in reverse order to maintain string indices
	for (let index = calls.length - 1; index >= 0; index--) {
		const call = calls[index];
		const resolvedValue = evaluateFunction(
			call.functionName,
			call.arguments,
			functions
		);

		if (resolvedValue !== null) {
			transformedCSS =
				transformedCSS.slice(0, call.startIndex) +
				resolvedValue +
				transformedCSS.slice(call.endIndex);
		}
	}

	return transformedCSS.trim();
}

/**
 * Runtime transform: Process function calls with current context
 * @param {string} cssText - Input CSS text
 * @param {Object} functions - Pre-extracted function definitions
 * @param {Object} context - Current runtime context
 * @returns {string} - Transformed CSS
 */
export function runtimeTransform(cssText, functions = {}, context = {}) {
	if (!cssText) return cssText;

	let transformedCSS = cssText;

	// Extract function definitions if not provided
	if (Object.keys(functions).length === 0) {
		functions = extractFunctions(cssText);
	}

	// Remove @function definitions from output CSS
	transformedCSS = transformedCSS.replaceAll(
		/@function\s+--[\w-]+\s*\([^)]*\)\s*(?:returns\s+[^{]+)?\s*{[^}]+(?:{[^}]*}[^}]*)*}/gi,
		''
	);

	// Find and resolve function calls
	const calls = findFunctionCalls(transformedCSS);

	// Process calls in reverse order to maintain string indices
	for (let index = calls.length - 1; index >= 0; index--) {
		const call = calls[index];
		const resolvedValue = evaluateFunction(
			call.functionName,
			call.arguments,
			functions,
			context
		);

		if (resolvedValue !== null) {
			transformedCSS =
				transformedCSS.slice(0, call.startIndex) +
				resolvedValue +
				transformedCSS.slice(call.endIndex);
		}
	}

	return transformedCSS;
}

/**
 * Evaluate a function call with given arguments
 * @param {string} functionName - Name of the function to call
 * @param {Array} arguments_ - Array of argument values
 * @param {Object} functions - Available function definitions
 * @param {Object} context - Current evaluation context
 * @returns {string|null} - Resolved value or null if unresolvable
 */
function evaluateFunction(functionName, arguments_, functions, context = {}) {
	const fullFunctionName = functionName.startsWith('--')
		? functionName
		: `--${functionName}`;
	const functionDefinition = functions[fullFunctionName];

	if (!functionDefinition) {
		return null;
	}

	// Create parameter bindings
	const bindings = {};
	for (const [index, parameter] of functionDefinition.parameters.entries()) {
		bindings[parameter] = arguments_[index] || '';
	}

	// Evaluate function body
	for (const block of functionDefinition.body) {
		if (block.type === 'result') {
			return substituteParameters(block.value || '', bindings);
		}

		if (
			(block.type === 'media' || block.type === 'supports') &&
			evaluateCondition(block.condition || '', context)
		) {
			const result = findResultInRules(block.rules || [], bindings);
			if (result) return result;
		}
	}

	return null;
}

/**
 * Find result declaration in rule blocks
 * @param {Array} rules - Array of rule blocks
 * @param {Object} bindings - Parameter bindings
 * @returns {string|null} - Found result value or null
 */
function findResultInRules(rules, bindings) {
	for (const rule of rules) {
		if (rule.type === 'result' && rule.value) {
			return substituteParameters(rule.value, bindings);
		}
	}

	return null;
}

/**
 * Substitute parameter placeholders in a value
 * @param {string} value - Value string with parameter placeholders
 * @param {Object} bindings - Parameter bindings
 * @returns {string} - Value with parameters substituted
 */
function substituteParameters(value, bindings) {
	return value.replaceAll(
		/var\((--[\w-]+)(?:,\s*([^)]+))?\)/g,
		(match, variableName, fallback) =>
			bindings[variableName] || fallback || match
	);
}

/**
 * Evaluate a condition (media query or supports query)
 * @param {string} condition - Condition string
 * @param {Object} context - Evaluation context
 * @returns {boolean} - Whether condition is met
 */
function evaluateCondition(condition, context) {
	if (!condition) return false;

	// Basic media query evaluation
	if (condition.startsWith('(') && condition.endsWith(')')) {
		if (
			typeof globalThis !== 'undefined' &&
			globalThis.window &&
			globalThis.window.matchMedia
		) {
			try {
				return globalThis.window.matchMedia(condition).matches;
			} catch {
				return false;
			}
		}

		return context.assumeMatch !== false;
	}

	// Basic supports query evaluation
	if (condition.includes(':')) {
		if (
			typeof globalThis !== 'undefined' &&
			globalThis.CSS &&
			globalThis.CSS.supports
		) {
			try {
				return globalThis.CSS.supports(condition);
			} catch {
				return false;
			}
		}

		return context.assumeSupported !== false;
	}

	return false;
}

/**
 * Legacy alias for extractFunctions (for test compatibility)
 * @param {string} cssText - CSS text to parse
 * @returns {Array} - Array of function calls
 */
export function extractIfFunctions(cssText) {
	// For CSS Custom Functions, we'll extract function calls instead
	const functionCalls = [];

	// Pattern to match function calls like --myFunction(args)
	const callPattern = /--([\w-]+)\s*\(([^)]*)\)/g;

	let match;
	while ((match = callPattern.exec(cssText)) !== null) {
		functionCalls.push({
			name: `--${match[1]}`,
			args: match[2]
				? match[2].split(',').map((argument) => argument.trim())
				: [],
			fullMatch: match[0]
		});
	}

	return functionCalls;
}

/**
 * Legacy function for test compatibility - parse CSS Custom Function call
 * @param {string} content - Function call content
 * @returns {Object} - Parsed function call
 */
export function parseIfFunction(content) {
	// For CSS Custom Functions, parse the function call syntax
	const match = content.match(/^(--[\w-]+)\s*\(([^)]*)\)$/);

	if (!match) {
		throw new Error(`Invalid CSS Custom Function call: ${content}`);
	}

	const [, name, argumentsString] = match;
	const arguments_ = argumentsString
		? argumentsString.split(',').map((argument) => argument.trim())
		: [];

	return {
		functionName: name,
		arguments: arguments_,
		type: 'function-call'
	};
}
