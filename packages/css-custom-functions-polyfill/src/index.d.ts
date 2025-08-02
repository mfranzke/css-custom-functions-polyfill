/**
 * CSS Custom Functions Polyfill Type Definitions
 * Provides support for CSS Custom Functions with @function definitions and conditional logic
 */

export {
	buildTimeTransform,
	extractFunctions,
	runtimeTransform
} from './transform.js';

export type PolyfillOptions = {
	/** Enable debug logging */
	debug?: boolean;
	/** Auto-initialize on module load */
	autoInit?: boolean;
	/** Use native CSS transformation when available */
	useNativeTransform?: boolean;
};

export type FunctionDefinition = {
	/** Function name (without --) */
	name: string;
	/** Parameter names */
	parameters: string[];
	/** Function body with conditional blocks */
	body: FunctionBodyBlock[];
};

export type FunctionBodyBlock = {
	/** Block type */
	type: 'result' | 'media' | 'supports';
	/** Block value (for result blocks) */
	value?: string;
	/** Condition (for media/supports blocks) */
	condition?: string;
	/** Nested rules */
	rules?: FunctionBodyBlock[];
};

export type EvaluationContext = {
	/** Current media query state */
	mediaQueries?: Record<string, boolean>;
	/** Support information */
	supports?: Record<string, boolean>;
	/** Whether to assume match for media queries in non-browser environments */
	assumeMatch?: boolean;
	/** Whether to assume support for features in non-browser environments */
	assumeSupported?: boolean;
};

/**
 * Initialize the CSS Custom Functions polyfill
 * @param options - Configuration options
 */
export function init(options?: PolyfillOptions): void;

/**
 * Clean up polyfill resources and event listeners
 */
export function cleanup(): void;

/**
 * Check if the browser has native CSS Custom Functions support
 * @returns True if native support is available
 */
export function hasNativeSupport(): boolean;

/**
 * Process CSS text and resolve function calls
 * @param cssText - The CSS text to process
 * @param functions - Function definitions
 * @param context - Evaluation context
 * @returns Processed CSS with function calls resolved
 */
export function processCssText(
	cssText: string,
	functions?: Record<string, FunctionDefinition>,
	context?: EvaluationContext
): string;

/**
 * Evaluate a CSS function with given arguments
 * @param functionName - The function name
 * @param args - Array of argument values
 * @param functions - Function definitions
 * @param context - Evaluation context
 * @returns Resolved value or undefined if not resolvable
 */
export function evaluateFunction(
	functionName: string,
	args: string[],
	functions: Record<string, FunctionDefinition>,
	context?: EvaluationContext
): string | undefined;

/**
 * Debug logging function
 * @param args - Arguments to log
 */
export function log(...args: any[]): void;

/**
 * Global namespace for script tag usage
 */
declare global {
	type Window = {
		CSSCustomFunctions?: {
			init: typeof init;
			cleanup: typeof cleanup;
			hasNativeSupport: typeof hasNativeSupport;
			processCssText: typeof processCssText;
			evaluateFunction: typeof evaluateFunction;
		};
	};
}

const api = {
	init,
	cleanup,
	hasNativeSupport,
	processCssText,
	evaluateFunction,
	log
};

export default api;
