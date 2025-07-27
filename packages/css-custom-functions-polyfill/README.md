# CSS Custom Function Function Polyfill v0.0

[![MIT license](https://img.shields.io/npm/l/css-custom-functions-polyfill.svg "license badge")](https://opensource.org/licenses/mit-license.php)

[![Default CI/CD Pipeline](https://github.com/mfranzke/css-custom-functions-polyfill/actions/workflows/default.yml/badge.svg)](https://github.com/mfranzke/css-custom-functions-polyfill/actions/workflows/default.yml)
[![Total downloads ~ Npmjs](https://img.shields.io/npm/dt/css-custom-functions-polyfill.svg "Count of total downloads – NPM")](https://npmjs.com/package/css-custom-functions-polyfill "CSS Custom Function function polyfill – on NPM")
[![jsDelivr CDN downloads](https://data.jsdelivr.com/v1/package/npm/css-custom-functions-polyfill/badge "Count of total downloads – jsDelivr")](https://www.jsdelivr.com/package/npm/css-custom-functions-polyfill "CSS Custom Function function polyfill – on jsDelivr")

[![css-custom-functions-polyfill on Npmjs](https://img.shields.io/npm/v/css-custom-functions-polyfill.svg?color=rgb%28237%2C%2028%2C%2036%29 "npm version")](https://npmjs.com/package/css-custom-functions-polyfill "CSS Custom Function function polyfill – on NPM")
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Open Source Love](https://badges.frapsoft.com/os/v3/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.0-4baaaa.svg)](CODE-OF-CONDUCT.md)

A modern JavaScript polyfill for the [CSS Custom Functions](https://drafts.csswg.org/css-mixins-1/) with **hybrid build-time and runtime processing**. Transforms CSS Custom Functions with `@function` definitions to optimized CSS where possible, with runtime fallback for dynamic conditions.

## Features

- ✅ **Hybrid Architecture** with build-time + runtime processing
- ✅ **Native CSS Generation** for `media()` and `supports()` conditions
- ✅ **Runtime Processing** for dynamic `style()` conditions
- ✅ **CLI Tool** for build-time transformation with statistics
- ✅ **Multiple conditions** within a single if() function
- ✅ **Shorthand property support** for complex CSS values
- ✅ **Automatic fallback** for unsupported browsers
- ✅ **Real-time processing** of dynamic stylesheets
- ✅ **TypeScript support** with full type definitions
- ✅ **Zero dependencies** - Pure JavaScript implementation
- ✅ **Comprehensive test suite** with 95%+ coverage
- ✅ **Multiple build formats** (ES6, CommonJS, UMD)

## Installation

```bash
npm install css-custom-functions-polyfill
```

## Quick Start

### Build-time Transformation (Recommended)

```bash
# Transform CSS during build
npx css-custom-functions-polyfill input.css output.css --minify --stats
```

### Runtime Processing

```javascript
import { init } from "css-custom-functions-polyfill";

// Initialize with hybrid processing
init({ useNativeTransform: true });
```

## Usage

### Automatic Initialization (Recommended)

Simply import the polyfill and it will automatically initialize:

```javascript
import "css-custom-functions-polyfill";
```

Or include it via script tag:

```html
<script src="https://cdn.jsdelivr.net/npm/css-custom-functions-polyfill/dist/index.umd.min.js"></script>
```

### Manual Initialization

```javascript
import { init } from "css-custom-functions-polyfill";

// Initialize with options
const polyfill = init({
	debug: true,
	autoInit: true
});
```

### Processing CSS Text

```javascript
import { processCSSText } from "css-custom-functions-polyfill";

const css = `
@function --theme-color(--color) {
  @media (prefers-color-scheme: dark) {
    result: var(--color, #ffffff);
  }
  result: var(--color, #000000);
}

.button { 
  color: --theme-color(blue); 
}
`;
const processed = processCSSText(css);
console.log(processed); // Transformed CSS with media queries
```

## CSS Custom Function Syntax

The polyfill supports the following CSS Custom Function syntax:

```css
@function --negative(--value) {
	result: calc(-1 * var(--value));
}

.example {
	margin: --negative(10px);
}
```

## Enhanced Features

### 1. Multiple Conditions with CSS Custom Functions

You can now use conditional logic within CSS Custom Functions using `@media` and `@supports` rules:

```css
@function --responsive-background(--scheme) {
	@media (prefers-color-scheme: dark) {
		result: linear-gradient(#1a1a1a, #333333);
	}
	@media (min-width: 768px) {
		result: linear-gradient(#f0f9ff, #e0f2fe);
	}
	result: linear-gradient(#e5e7eb, #f9fafb);
}

.element {
	background: --responsive-background();
}
```

### 2. Advanced CSS Custom Functions

Use CSS Custom Functions for complex styling logic:

```css
@function --border-style() {
	@supports (border-style: dashed) {
		result: dashed;
	}
	result: solid;
}

@function --responsive-font() {
	@media (min-width: 1200px) {
		result:
			bold 20px / 1.5 system-ui,
			sans-serif;
	}
	@media (min-width: 768px) {
		result:
			600 18px / 1.5 system-ui,
			sans-serif;
	}
	result:
		normal 16px / 1.5 system-ui,
		sans-serif;
}

.element {
	border: 3px --border-style() #6b7280;
	font: --responsive-font();
}
```

## Supported Condition Types

### 1. Media Queries with `@media`

```css
@function --responsive-font() {
	@media (min-width: 1200px) {
		result: 24px;
	}
	@media (min-width: 768px) {
		result: 18px;
	}
	result: 16px;
}

.responsive-text {
	font-size: --responsive-font();
}
```

### 2. Feature Detection with `@supports`

```css
@function --modern-display() {
	@supports (display: subgrid) {
		result: subgrid;
	}
	@supports (display: grid) {
		result: grid;
	}
	@supports (display: flex) {
		result: flex;
	}
	result: block;
}

.modern-layout {
	display: --modern-display();
}
```

### 3. Custom Property Conditions

```css
@function --theme-color(--theme, --fallback) {
	result: var(--theme, var(--fallback, #374151));
}

.theme-aware {
	color: --theme-color(var(--primary-color), #2563eb);
}
```

### 4. Combined Conditions

```css
@function --debug-style(--enabled) {
	@media (prefers-color-scheme: dark) {
		result: 2px solid #ef4444;
	}
	result: var(--enabled, none);
}

.debug-mode {
	border: --debug-style(var(--debug));
	opacity: var(--debug, 1);
}
```

## Advanced Examples

### Theme-Based Styling

```css
@function --card-background(--scheme) {
	/* Ice theme */
	result: linear-gradient(135deg, #caf0f8, #f0f9ff, #caf0f8);
}

@function --theme-text-color(--theme) {
	result: var(--theme, #374151);
}

.card {
	background: --card-background();
	color: --theme-text-color(var(--text-color));
}
```

### Progressive Enhancement

```css
@function --enhanced-display() {
	@supports (display: subgrid) {
		result: subgrid;
	}
	@supports (display: grid) {
		result: grid;
	}
	@supports (display: flex) {
		result: flex;
	}
	result: block;
}

@function --spacing() {
	@supports (gap) {
		result: 20px;
	}
	result: 0;
}

.feature-demo {
	display: --enhanced-display();
	gap: --spacing();
}
```

### Responsive Design with Multiple Breakpoints

```css
@function --responsive-padding() {
	@media (min-width: 1200px) {
		result: 40px;
	}
	@media (min-width: 768px) {
		result: 30px;
	}
	@media (min-width: 480px) {
		result: 20px;
	}
	result: 15px;
}

@function --responsive-font() {
	@media (min-width: 1200px) {
		result: 20px;
	}
	@media (min-width: 768px) {
		result: 18px;
	}
	result: 16px;
}

.responsive-element {
	padding: --responsive-padding();
	font-size: --responsive-font();
}
```

### Accessibility-Aware Animations

```css
@function --safe-transition() {
	@media (prefers-reduced-motion: reduce) {
		result: none;
	}
	@supports (transition) {
		result: all 0.3s ease;
	}
	result: none;
}

@function --safe-transform() {
	@media (prefers-reduced-motion: reduce) {
		result: none;
	}
	@supports (transform) {
		result: scale(1);
	}
	result: none;
}

.animated-element {
	transition: --safe-transition();
	transform: --safe-transform();
}
```

## API Reference

### `init(options)`

Initialize the polyfill with optional configuration.

```javascript
const polyfill = init({
	debug: false, // Enable debug logging
	autoInit: true // Automatically process existing stylesheets
});
```

### `processCSSText(cssText, options)`

Process CSS text containing CSS Custom Functions.

```javascript
const processed = processCSSText(`
@function --theme-color(--mode) {
  @media (prefers-color-scheme: dark) {
    result: #e2e8f0;
  }
  result: #2d3748;
}

.test {
  color: --theme-color();
}
`);
```

### `hasNativeSupport()`

Check if the browser has native CSS Custom Function support.

```javascript
if (hasNativeSupport()) {
	console.log("Native support available!");
}
```

### Instance Methods

```javascript
const polyfill = init();

// Manually refresh/reprocess all stylesheets
polyfill.refresh();

// Check if polyfill is needed
polyfill.hasNativeSupport();

// Process specific CSS text
polyfill.processCSSText(cssText);
```

## Browser Support

The polyfill works in all modern browsers that support:

- ES6 (ECMAScript 2015)
- CSS Object Model
- MutationObserver
- matchMedia API

**Tested browsers:**

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance Considerations

- The polyfill only activates when native CSS Custom Function support is not available
- Uses efficient CSS parsing with minimal DOM manipulation
- Caches evaluation results for better performance
- Processes stylesheets incrementally to avoid blocking
- Optimized parsing for multiple conditions and complex shorthand properties

## Examples

The package includes comprehensive examples:

- `examples/basic-examples.html` - Basic CSS Custom Function usage
- `examples/simple-examples.html` - Straightforward CSS Custom Function examples
- `examples/advanced.html` - Advanced conditional styling
- `examples/enhanced.html` - Enhanced CSS Custom Functions with complex features
- `examples/enhanced-simple.html` - Streamlined enhanced examples
- `examples/multiple-conditions.html` - Multiple conditions within single function
- `examples/multiple-conditions-simple.html` - Streamlined multiple conditions examples
- `examples/media-query-tracking.html` - Media query tracking and dynamic updates
- `examples/native-css-approach.html` - Native CSS approach examples

## Contributing

Please have a look at our [CONTRIBUTION guidelines](https://github.com/mfranzke/css-custom-functions-polyfill/blob/main/CONTRIBUTING.md).

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

- Pure JavaScript implementation with custom CSS parsing
- Inspired by the CSS Working Group's conditional CSS proposals
- Thanks to all contributors and testers

## Related

- [postcss-custom-function](https://github.com/mfranzke/css-custom-functions-polyfill/tree/main/packages/postcss-custom-function/) - PostCSS plugin for build-time transformation
- [CSS Conditional Rules](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_conditional_rules) - MDN documentation for @media and @supports
