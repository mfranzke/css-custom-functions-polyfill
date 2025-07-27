/**
 * CSS Custom Functions Polyfill
 * Provides support for CSS Custom Functions with @function definitions and conditional logic
 * Syntax: @function --name(params) { result: value; @media/supports... }
 * Function calls: --name(args)
 */

/* global document, Node, MutationObserver */

import { extractFunctions, runtimeTransform } from './transform.js';

// Global state
let polyfillOptions = {
	debug: false,
	autoInit: true,
	useNativeTransform: true
};

// Registry for tracking media queries and their associated elements
const mediaQueryRegistry = new Map();
const mediaQueryListeners = new Map();

/**
 * Log debug messages
 * @param {...any} arguments_ - Arguments to log
 */
const log = (...arguments_) => {
	if (polyfillOptions.debug) {
		console.log('[CSS Custom Functions polyfill]', ...arguments_);
	}
};

/**
 * Check if browser has native CSS Custom Functions support
 * @returns {boolean} - Whether native support is available
 */
const hasNativeSupport = () => {
	if (globalThis.window === undefined || !globalThis.CSS) {
		return false;
	}

	try {
		// Test if CSS Custom Functions are supported by testing @function syntax
		return globalThis.CSS.supports(
			'@function --test() { result: red; }',
			''
		);
	} catch {
		return false;
	}
};

/**
 * Evaluate a condition based on type (@media or @supports)
 * @param {string} condition - The condition string
 * @param {Object} context - Current context (media queries, support info)
 * @returns {boolean} - Whether the condition is true
 */
const evaluateCondition = (condition, context = {}) => {
	if (!condition) return false;

	const trimmedCondition = condition.trim();
	log('Evaluating condition:', trimmedCondition);

	// Handle @media conditions
	if (trimmedCondition.startsWith('(') && trimmedCondition.endsWith(')')) {
		return evaluateMediaCondition(trimmedCondition, context);
	}

	// Handle @supports conditions
	if (
		trimmedCondition.includes(':') ||
		trimmedCondition.includes('selector(')
	) {
		return evaluateSupportsCondition(trimmedCondition, context);
	}

	return false;
};

/**
 * Substitute parameter placeholders in a value string
 * @param {string} value - Value containing parameter placeholders
 * @param {Object} bindings - Parameter name to value mappings
 * @returns {string} - Value with parameters substituted
 */
const substituteParameters = (value, bindings) => {
	// Handle parameter substitution with $paramName syntax
	let result = value;
	const pattern = /\$([a-zA-Z][\w-]*)/g;
	for (const match of value.matchAll(pattern)) {
		const parameterName = match[1];
		const replacement = bindings[parameterName] || match[0];
		result = result.replaceAll(match[0], replacement);
	}

	return result;
};

/**
 * Helper function to find result in rule blocks
 * @param {Array} rules - Array of rule blocks
 * @param {Object} bindings - Parameter bindings
 * @returns {string|null} - Found result or null
 */
const findResultInRules = (rules, bindings) => {
	for (const innerBlock of rules) {
		if (innerBlock.type === 'result') {
			return substituteParameters(innerBlock.value, bindings);
		}
	}

	return null;
};

/**
 * Evaluate a CSS function definition for given arguments
 * @param {string} functionName - The function name
 * @param {Array} arguments_ - Array of argument values
 * @param {Object} functions - Function definitions from parsed CSS
 * @param {Object} context - Current CSS context
 * @returns {string|null} - Resolved value or null if not resolvable
 */
const evaluateFunction = (
	functionName,
	arguments_,
	functions,
	context = {}
) => {
	const functionDefinition = functions[functionName];
	if (!functionDefinition) {
		log(`Function ${functionName} not found`);
		return null;
	}

	log(`Evaluating function ${functionName} with arguments:`, arguments_);

	try {
		// Create parameter bindings
		const bindings = {};
		for (const [
			index,
			parameter
		] of functionDefinition.parameters.entries()) {
			bindings[parameter] = arguments_[index] || '';
		}

		// Evaluate conditional blocks to find the result
		for (const block of functionDefinition.body) {
			if (block.type === 'result') {
				// Direct result declaration
				return substituteParameters(block.value, bindings);
			}

			if (block.type === 'media' || block.type === 'supports') {
				// Check if condition matches and extract result
				if (!evaluateCondition(block.condition, context)) {
					continue;
				}

				const result = findResultInRules(block.rules, bindings);
				if (result) return result;
			}
		}

		return null;
	} catch (error) {
		log('Error evaluating function:', error);
		return null;
	}
};

/**
 * Evaluate a media query condition
 * @param {string} condition - Media query condition like "(min-width: 768px)"
 * @param {Object} context - Current context
 * @returns {boolean} - Whether the media query matches
 */
const evaluateMediaCondition = (condition, context = {}) => {
	if (globalThis.window === undefined) {
		return context.assumeMatch !== false;
	}

	try {
		const mediaQuery = globalThis.window.matchMedia(condition);
		log('Media query evaluation:', condition, '→', mediaQuery.matches);
		return mediaQuery.matches;
	} catch (error) {
		log('Media query evaluation failed:', error);
		return false;
	}
};

/**
 * Evaluate a supports query condition
 * @param {string} condition - CSS supports condition like "display: grid"
 * @param {Object} context - Current context
 * @returns {boolean} - Whether the feature is supported
 */
const evaluateSupportsCondition = (condition, context = {}) => {
	if (
		globalThis.CSS === undefined ||
		typeof globalThis.CSS.supports !== 'function'
	) {
		return context.assumeSupported !== false;
	}

	try {
		// Handle various supports syntax formats
		let supports;
		if (condition.includes(':')) {
			// Property: value format
			const [property, value] = condition.split(':', 2);
			supports = globalThis.CSS.supports(property.trim(), value.trim());
		} else {
			// Full declaration format
			supports = globalThis.CSS.supports(condition);
		}

		log('Supports query evaluation:', condition, '→', supports);
		return supports;
	} catch (error) {
		log('Supports query evaluation failed:', error);
		return false;
	}
};

/**
 * Process CSS text and resolve function calls
 * @param {string} cssText - The CSS text to process
 * @param {Object} functions - Function definitions
 * @param {Object} context - Current context
 * @returns {string} - Processed CSS with function calls resolved
 */
const processCSSText = (cssText, functions = {}, context = {}) => {
	if (!cssText) return cssText;

	log('Processing CSS text');

	try {
		return runtimeTransform(cssText, functions, context);
	} catch (error) {
		log('Error processing CSS text:', error);
		return cssText;
	}
};

/**
 * Register a media query for change tracking
 * @param {string} mediaQuery - Media query string
 * @param {HTMLElement} element - Element to track
 * @param {string} originalContent - Original CSS content
 * @param {MediaQueryList} mediaQueryList - MediaQueryList object
 */
const _registerMediaQuery = (
	mediaQuery,
	element,
	originalContent,
	mediaQueryList
) => {
	if (!mediaQueryRegistry.has(mediaQuery)) {
		mediaQueryRegistry.set(mediaQuery, new Set());
	}

	mediaQueryRegistry.get(mediaQuery).add({
		element,
		originalContent
	});

	if (!mediaQueryListeners.has(mediaQuery)) {
		const listener = () => {
			log(`Media query changed: ${mediaQuery}`);
			updateElementsForMediaQuery(mediaQuery);
		};

		mediaQueryList.addEventListener('change', listener);
		mediaQueryListeners.set(mediaQuery, {
			mediaQueryList,
			listener
		});
	}
};

/**
 * Update elements when media query changes
 * @param {string} mediaQuery - Media query that changed
 */
const updateElementsForMediaQuery = (mediaQuery) => {
	const elementSet = mediaQueryRegistry.get(mediaQuery);
	if (!elementSet) return;

	for (const { element, originalContent } of elementSet) {
		if (element && element.isConnected) {
			// Re-process the original CSS content
			const functions = extractFunctions(originalContent);
			const processedCSS = processCSSText(originalContent, functions);

			if (element.textContent !== processedCSS) {
				element.textContent = processedCSS;
				log('Updated element for media query change:', mediaQuery);
			}
		}
	}
};

/**
 * Process a style or link element
 * @param {HTMLElement} element - Element to process
 */
const processElement = (element) => {
	if (element.dataset.cssCustomFunctionsProcessed) {
		return;
	}

	try {
		let cssText = '';

		if (element.tagName === 'STYLE') {
			cssText = element.textContent || '';
		} else if (element.tagName === 'LINK' && element.rel === 'stylesheet') {
			// For external stylesheets, we'd need to fetch and process
			// This is more complex and would require CORS considerations
			log('External stylesheet processing not implemented yet');
			return;
		}

		if (!cssText.trim()) return;

		// Extract function definitions from CSS
		const functions = extractFunctions(cssText);

		// Process the CSS text
		const processedCSS = processCSSText(cssText, functions);

		if (processedCSS !== cssText) {
			element.textContent = processedCSS;
			log('Processed element:', element.tagName);
		}

		element.dataset.cssCustomFunctionsProcessed = 'true';
	} catch (error) {
		log('Error processing element:', error);
	}
};

/**
 * Process all style elements in the document
 */
const processStyleElements = () => {
	if (hasNativeSupport()) {
		log('Native CSS Custom Functions support detected, skipping polyfill');
		return;
	}

	log('Processing style elements');

	const styleElements = document.querySelectorAll(
		'style:not([data-css-custom-functions-processed])'
	);
	for (const element of styleElements) {
		processElement(element);
	}

	const linkElements = document.querySelectorAll(
		'link[rel="stylesheet"]:not([data-css-custom-functions-processed])'
	);
	for (const element of linkElements) {
		processElement(element);
	}
};

/**
 * Initialize the polyfill
 * @param {Object} options - Configuration options
 */
const init = (options = {}) => {
	polyfillOptions = { ...polyfillOptions, ...options };

	log('Initializing CSS Custom Functions polyfill');

	if (hasNativeSupport()) {
		log('Native support detected, polyfill not needed');
		return;
	}

	// Process existing elements
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', processStyleElements);
	} else {
		processStyleElements();
	}

	// Set up mutation observer for dynamic content
	if (globalThis.MutationObserver) {
		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				for (const node of mutation.addedNodes) {
					if (node.nodeType !== Node.ELEMENT_NODE) continue;

					const element = node;
					if (
						element.tagName === 'STYLE' ||
						(element.tagName === 'LINK' &&
							element.rel === 'stylesheet')
					) {
						processElement(element);
					}

					// Check for nested style elements
					const nestedStyles = element.querySelectorAll?.(
						'style, link[rel="stylesheet"]'
					);
					if (!nestedStyles) continue;

					for (const nestedStyle of nestedStyles) {
						processElement(nestedStyle);
					}
				}
			}
		});

		observer.observe(document, {
			childList: true,
			subtree: true
		});
	}
};

/**
 * Clean up media query listeners
 */
const cleanup = () => {
	for (const [, { mediaQueryList, listener }] of mediaQueryListeners) {
		mediaQueryList.removeEventListener('change', listener);
	}

	mediaQueryListeners.clear();
	mediaQueryRegistry.clear();
};

/**
 * Build-time transform for static processing
 * @param {string} cssText - CSS text to transform
 * @param {Object} options - Build options
 * @returns {Object} - Result with transformed CSS and stats
 */
const buildTimeTransform = (cssText, options = {}) => {
	const functions = extractFunctions(cssText);
	const transformedCSS = runtimeTransform(cssText, functions);

	const stats = {
		originalSize: cssText.length,
		transformedSize: transformedCSS.length,
		functionsFound: Object.keys(functions).length,
		compression:
			cssText.length === 0
				? '0%'
				: (
						((cssText.length - transformedCSS.length) /
							cssText.length) *
						100
					).toFixed(2) + '%'
	};

	return {
		css: transformedCSS,
		stats: options.stats ? stats : undefined
	};
};

/**
 * Clean up media query listeners (alias for cleanup)
 */
const cleanupMediaQueryListeners = cleanup;

// Auto-initialize if enabled
if (typeof document !== 'undefined' && polyfillOptions.autoInit) {
	init();
}

// Export public API
export {
	init,
	cleanup,
	cleanupMediaQueryListeners,
	hasNativeSupport,
	processCSSText,
	evaluateFunction,
	buildTimeTransform,
	log
};

// Make available globally for script tags
if (typeof globalThis !== 'undefined') {
	globalThis.CSSCustomFunctions = {
		init,
		cleanup,
		hasNativeSupport,
		processCSSText,
		evaluateFunction
	};
}
