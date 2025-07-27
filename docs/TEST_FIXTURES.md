# CSS Custom Functions polyfill Test Fixtures

This document demonstrates the centralized test fixture system that provides a single source of truth for CSS test cases across all test suites.

## Basic Custom Function

<!-- FIXTURE: basic-function -->

<!-- Note: This content is automatically generated from test fixtures. Do not edit the code blocks directly - they will be overwritten during the build process. To modify test cases, edit the corresponding .input.css and .expected.css files in the test/fixtures/ directory -->

**Input CSS:**

```css
/* Basic custom function definition and usage */
@function --negative(--value) {
	result: calc(-1 * var(--value));
}

html {
	--gap: 1em;
	padding: --negative(var(--gap));
}

.example {
	margin: --negative(10px);
}
```

**Expected Output:**

```css
/* Basic custom function definition and usage */
/* @function --negative(--value) {
	result: calc(-1 * var(--value));
} */

html {
	--gap: 1em;
	padding: calc(-1 * 1em);
}

.example {
	margin: calc(-1 * 10px);
}
```

<!-- /FIXTURE -->

## Conditional Media Queries

<!-- FIXTURE: conditional-media -->

<!-- Note: This content is automatically generated from test fixtures. Do not edit the code blocks directly - they will be overwritten during the build process. To modify test cases, edit the corresponding .input.css and .expected.css files in the test/fixtures/ directory -->

**Input CSS:**

```css
/* Function with conditional rules (media queries) */
@function --suitable-font-size() {
	result: 16px;

	@media (width > 1000px) {
		result: 20px;
	}
}

.text {
	font-size: --suitable-font-size();
}
```

**Expected Output:**

```css
/* Function with conditional rules (media queries) */
/* @function --suitable-font-size() {
	result: 16px;
	@media (width > 1000px) {
		result: 20px;
	}
} */

.text {
	font-size: 16px;
}

@media (width > 1000px) {
	.text {
		font-size: 20px;
	}
}
```

<!-- /FIXTURE -->

## Conditional Variables

<!-- FIXTURE: conditional-variables -->

<!-- Note: This content is automatically generated from test fixtures. Do not edit the code blocks directly - they will be overwritten during the build process. To modify test cases, edit the corresponding .input.css and .expected.css files in the test/fixtures/ directory -->

**Input CSS:**

```css
/* Function with local variables in conditionals */
@function --responsive-size() {
	--size: 16px;
	@media (width > 1000px) {
		--size: 20px;
	}
	result: var(--size);
}

.element {
	font-size: --responsive-size();
	padding: --responsive-size();
}
```

**Expected Output:**

```css
/* Function with local variables in conditionals */
/* @function --responsive-size() {
	--size: 16px;
	@media (width > 1000px) {
		--size: 20px;
	}
	result: var(--size);
} */

.element {
	font-size: 16px;
	padding: 16px;
}

@media (width > 1000px) {
	.element {
		font-size: 20px;
		padding: 20px;
	}
}
```

<!-- /FIXTURE -->

## Return Type Specification

<!-- FIXTURE: return-type -->

<!-- Note: This content is automatically generated from test fixtures. Do not edit the code blocks directly - they will be overwritten during the build process. To modify test cases, edit the corresponding .input.css and .expected.css files in the test/fixtures/ directory -->

**Input CSS:**

```css
/* Function with return type specification */
@function --double-z() returns <number> {
	result: calc(var(--z) * 2);
}

div {
	--z: 3;
	z-index: --double-z();
}
```

**Expected Output:**

```css
/* Function with return type specification */
/* @function --double-z() returns <number> {
	result: calc(var(--z) * 2);
} */

div {
	--z: 3;
	z-index: calc(3 * 2);
}
```

<!-- /FIXTURE -->

## Nested Function Calls

<!-- FIXTURE: nested-functions -->

<!-- Note: This content is automatically generated from test fixtures. Do not edit the code blocks directly - they will be overwritten during the build process. To modify test cases, edit the corresponding .input.css and .expected.css files in the test/fixtures/ directory -->

**Input CSS:**

```css
/* Nested function calls */
@function --outer(--outer-arg) {
	--outer-local: 2;
	result: --inner();
}

@function --inner() returns <number> {
	result: calc(var(--outer-arg) + var(--outer-local));
}

div {
	z-index: --outer(1);
}
```

**Expected Output:**

```css
/* Nested function calls */
/* @function --outer(--outer-arg) {
	--outer-local: 2;
	result: --inner();
}

@function --inner() returns <number> {
	result: calc(var(--outer-arg) + var(--outer-local));
} */

div {
	z-index: calc(1 + 2);
}
```

<!-- /FIXTURE -->

## Property Shadowing

<!-- FIXTURE: property-shadowing -->

<!-- Note: This content is automatically generated from test fixtures. Do not edit the code blocks directly - they will be overwritten during the build process. To modify test cases, edit the corresponding .input.css and .expected.css files in the test/fixtures/ directory -->

**Input CSS:**

```css
/* Function accessing custom properties from call site */
@function --add-a-b-c(--b, --c) {
	--c: 300;
	result: calc(var(--a) + var(--b) + var(--c));
}

div {
	--a: 1;
	--b: 2;
	--c: 3;
	z-index: --add-a-b-c(20, 30);
}
```

**Expected Output:**

```css
/* Function accessing custom properties from call site */
/* @function --add-a-b-c(--b, --c) {
	--c: 300;
	result: calc(var(--a) + var(--b) + var(--c));
} */

div {
	--a: 1;
	--b: 2;
	--c: 3;
	z-index: calc(1 + 20 + 300);
}
```

<!-- /FIXTURE -->

## Comma-Containing Values

<!-- FIXTURE: comma-values -->

<!-- Note: This content is automatically generated from test fixtures. Do not edit the code blocks directly - they will be overwritten during the build process. To modify test cases, edit the corresponding .input.css and .expected.css files in the test/fixtures/ directory -->

**Input CSS:**

```css
/* Function with comma-containing value in curly braces */
@function --max-plus-x(--list, --x) {
	result: calc(max(var(--list)) + var(--x));
}

div {
	width: --max-plus-x({1px, 7px, 2px}, 3px);
}
```

**Expected Output:**

```css
/* Function with comma-containing value in curly braces */
/* @function --max-plus-x(--list, --x) {
	result: calc(max(var(--list)) + var(--x));
} */

div {
	width: calc(max(1px, 7px, 2px) + 3px);
}
```

<!-- /FIXTURE -->

## CSS-Wide Keywords

<!-- FIXTURE: css-wide-keywords -->

<!-- Note: This content is automatically generated from test fixtures. Do not edit the code blocks directly - they will be overwritten during the build process. To modify test cases, edit the corresponding .input.css and .expected.css files in the test/fixtures/ directory -->

**Input CSS:**

```css
/* Function with CSS-wide keywords */
@function --inherited-color(--fallback <color>: blue) {
	--color: inherit;
	result: var(--color, var(--fallback));
}

.parent {
	color: red;
}

.child {
	color: --inherited-color();
	background: --inherited-color(green);
}
```

**Expected Output:**

```css
/* Function with CSS-wide keywords */
/* @function --inherited-color(--fallback <color>: blue) {
	--color: inherit;
	result: var(--color, var(--fallback));
} */

.parent {
	color: red;
}

.child {
	color: inherit;
	background: green;
}
```

<!-- /FIXTURE -->

## Supports Conditionals

<!-- FIXTURE: supports-conditional -->

<!-- Note: This content is automatically generated from test fixtures. Do not edit the code blocks directly - they will be overwritten during the build process. To modify test cases, edit the corresponding .input.css and .expected.css files in the test/fixtures/ directory -->

**Input CSS:**

```css
/* Function with supports conditional */
@function --modern-display() {
	result: block;
	@supports (display: grid) {
		result: grid;
	}
}

.layout {
	display: --modern-display();
}
```

**Expected Output:**

```css
/* Function with supports conditional */
/* @function --modern-display() {
	result: block;
	@supports (display: grid) {
		result: grid;
	}
} */

.layout {
	display: block;
}

@supports (display: grid) {
	.layout {
		display: grid;
	}
}
```

<!-- /FIXTURE -->

## No Custom Functions

<!-- FIXTURE: no-custom-functions -->

<!-- Note: This content is automatically generated from test fixtures. Do not edit the code blocks directly - they will be overwritten during the build process. To modify test cases, edit the corresponding .input.css and .expected.css files in the test/fixtures/ directory -->

**Input CSS:**

```css
/* No custom functions - should pass through unchanged */
.normal {
	color: red;
	background: blue;
	font-size: 16px;
}

.also-normal {
	display: flex;
	justify-content: center;
}
```

**Expected Output:**

```css
/* No custom functions - should pass through unchanged */
.normal {
	color: red;
	background: blue;
	font-size: 16px;
}

.also-normal {
	display: flex;
	justify-content: center;
}
```

<!-- /FIXTURE -->

---

**Note:** This content is automatically generated from test fixtures. Do not edit the code blocks directly - they will be overwritten during the build process. To modify test cases, edit the corresponding `.input.css` and `.expected.css` files in the `test/fixtures/` directory.

To regenerate this documentation, run:

```bash
pnpm run build:docs
```
