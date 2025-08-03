/* global document, describe, test, expect, beforeEach, afterEach */

import {
	evaluateFunction,
	hasNativeSupport,
	init,
	processCSSText
} from '../src/index.js';
import { extractFunctions } from '../src/transform.js';

describe('CSS Custom Functions polyfill', () => {
	beforeEach(() => {
		// Reset CSS.supports mock
		globalThis.CSS.supports.mockClear();

		// Reset matchMedia mock
		globalThis.matchMedia.mockClear();
	});

	afterEach(() => {
		document.head.innerHTML = '';
		document.body.innerHTML = '';
	});

	describe('Initialization', () => {
		test('should have named function exports', () => {
			expect(typeof init).toBe('function');
			expect(typeof processCSSText).toBe('function');
			expect(typeof hasNativeSupport).toBe('function');
			expect(typeof evaluateFunction).toBe('function');
		});
	});

	describe('Native Support Detection', () => {
		test('should detect lack of native support', () => {
			expect(hasNativeSupport()).toBe(false);
		});

		test('should use exported function', () => {
			expect(hasNativeSupport()).toBe(false);
		});
	});

	describe('Function Definition and Evaluation', () => {
		test('should extract CSS Custom Function definitions', () => {
			const cssText = `
				@function --color-theme(--mode) {
					result: var(--mode, blue);
				}
			`;

			const functions = extractFunctions(cssText);
			expect(functions).toHaveProperty('--color-theme');
			expect(functions['--color-theme'].parameters).toEqual(['--mode']);
		});

		test('should evaluate simple CSS Custom Function calls', () => {
			const cssText = `
				@function --color-theme(--mode) {
					result: var(--mode, blue);
				}
				.test { color: --color-theme(red); }
			`;

			const result = processCSSText(cssText);
			expect(result).toContain('color: red');
			expect(result).not.toContain('@function');
		});

		test('should handle CSS Custom Functions with default values', () => {
			const cssText = `
				@function --spacing(--size) {
					result: var(--size, 16px);
				}
				.test { margin: --spacing(); }
			`;

			const result = processCSSText(cssText);
			expect(result).toContain('margin: 16px');
		});

		test('should handle CSS Custom Functions with media queries', () => {
			// Mock a matching media query
			globalThis.matchMedia.mockReturnValue({ matches: true });

			const cssText = `
				@function --responsive-size(--size) {
					@media (min-width: 768px) {
						result: calc(var(--size) * 1.5);
					}
					result: var(--size);
				}
				.test { font-size: --responsive-size(16px); }
			`;

			const result = processCSSText(cssText);
			expect(result).toContain('font-size: calc(16px * 1.5)');
		});

		test('should handle CSS Custom Functions with supports queries', () => {
			// Mock CSS.supports to return true
			globalThis.CSS.supports.mockReturnValue(true);

			const cssText = `
				@function --modern-display(--fallback) {
					@supports (display: grid) {
						result: grid;
					}
					result: var(--fallback);
				}
				.test { display: --modern-display(block); }
			`;

			const result = processCSSText(cssText);
			expect(result).toContain('display: grid');
		});
	});

	describe('CSS Text Processing', () => {
		test('should process multiple CSS Custom Functions', () => {
			const cssText = `
				@function --spacing(--size) {
					result: var(--size, 16px);
				}
				@function --color(--hue) {
					result: hsl(var(--hue), 50%, 50%);
				}
				.test {
					margin: --spacing(24px);
					color: --color(200deg);
				}
			`;

			const result = processCSSText(cssText);
			expect(result).toContain('margin: 24px');
			expect(result).toContain('color: hsl(200deg, 50%, 50%)');
			expect(result).not.toContain('@function');
		});

		test('should handle CSS Custom Functions without parameters', () => {
			const cssText = `
				@function --primary-color() {
					result: #007bff;
				}
				.test { color: --primary-color(); }
			`;

			const result = processCSSText(cssText);
			expect(result).toContain('color: #007bff');
		});

		test('should preserve CSS that does not contain Custom Functions', () => {
			const cssText = `
				.test {
					color: blue;
					margin: 16px;
				}
			`;

			const result = processCSSText(cssText);
			expect(result).toContain('color: blue');
			expect(result).toContain('margin: 16px');
		});

		test('should handle nested CSS Custom Function calls', () => {
			const cssText = `
				@function --double(--value) {
					result: calc(var(--value) * 2);
				}
				@function --triple(--value) {
					result: --double(calc(var(--value) * 1.5));
				}
				.test { width: --triple(10px); }
			`;

			const result = processCSSText(cssText);
			expect(result).toContain('width: calc(calc(10px * 1.5) * 2)');
		});
	});

	describe('Public API', () => {
		test('should export init function', () => {
			expect(typeof init).toBe('function');
		});

		test('should export processCSSText function', () => {
			const result = processCSSText(`
				@function --test() {
					result: red;
				}
				.test { color: --test(); }
			`);
			expect(result).toContain('color: red');
		});

		test('should handle processCSSText with options', () => {
			const result = processCSSText(
				`
				@function --test() {
					result: blue;
				}
				.test { color: --test(); }
			`,
				{},
				{ debug: true }
			);
			expect(result).toContain('color: blue');
		});
	});

	describe('Error Handling', () => {
		test('should handle invalid function calls gracefully', () => {
			const cssText = `
				.test { color: --nonexistent-function(red); }
			`;

			const result = processCSSText(cssText);
			expect(result).toContain('color: --nonexistent-function(red)');
		});

		test('should handle malformed function definitions', () => {
			const cssText = `
				@function invalid syntax {
					result: red;
				}
				.test { color: blue; }
			`;

			const result = processCSSText(cssText);
			expect(result).toContain('color: blue');
		});

		test('should handle CSS.supports errors', () => {
			globalThis.CSS.supports.mockImplementation(() => {
				throw new Error('CSS.supports error');
			});

			const cssText = `
				@function --test() {
					@supports (display: grid) {
						result: grid;
					}
					result: block;
				}
				.test { display: --test(); }
			`;

			const result = processCSSText(cssText);
			expect(result).toContain('display: block');
		});

		test('should handle matchMedia errors', () => {
			globalThis.matchMedia.mockImplementation(() => {
				throw new Error('matchMedia error');
			});

			const cssText = `
				@function --test() {
					@media (min-width: 768px) {
						result: large;
					}
					result: small;
				}
				.test { font-size: --test(); }
			`;

			const result = processCSSText(cssText);
			expect(result).toContain('font-size: small');
		});
	});
});
