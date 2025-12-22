# postcss-custom-function

[![Default CI/CD Pipeline](https://github.com/mfranzke/css-custom-functions-polyfill/actions/workflows/default.yml/badge.svg)](https://github.com/mfranzke/css-custom-functions-polyfill/actions/workflows/default.yml)
[![npm version](https://badge.fury.io/js/postcss-custom-function.svg)](https://badge.fury.io/js/postcss-custom-function)
[![Build Status](https://github.com/mfranzke/css-custom-functions-polyfill/workflows/CI/badge.svg)](https://github.com/mfranzke/css-custom-functions-polyfill/actions)

A [PostCSS](https://postcss.org/) plugin for transforming CSS Custom Functionss into native CSS `@media` and `@supports` rules at build time.

This plugin is part of the [css-custom-functions-polyfill](https://github.com/mfranzke/css-custom-functions-polyfill/tree/main/packages/css-custom-functions-polyfill/) project and provides build-time transformation of conditional CSS, eliminating the need for runtime JavaScript processing when using only `media()` and `supports()` functions.

## Installation

```bash
npm install postcss-custom-function postcss
```

## Usage

### PostCSS CLI

```bash
# Transform CSS using PostCSS CLI
npx postcss input.css --output output.css --use postcss-custom-function

# With custom PostCSS config file
npx postcss input.css --output output.css --config postcss.config.js
```

### Basic Programmatic Usage

```js
// Named export (recommended)
import postcss from "postcss";
import { postcssIfFunction } from "postcss-custom-function";

// Or default export (for compatibility)
import postcss from "postcss";
import postcssIfFunction from "postcss-custom-function";

const css = `
.example {
  color: if(@media (max-width: 768px) { result: blue; }; else: red);
  font-size: if(supports(display: grid): 1.2rem; else: 1rem);
}
`;

const result = await postcss([postcssIfFunction()]).process(css, {
	from: undefined
});

console.log(result.css);
```

**Output:**

```css
.example {
	color: red;
}
@media (max-width: 768px) {
	.example {
		color: blue;
	}
}
.example {
	font-size: 1rem;
}
@supports (display: grid) {
	.example {
		font-size: 1.2rem;
	}
}
```

### With Options

```js
const result = await postcss([
	postcssIfFunction({
		logTransformations: true,
		preserveOriginal: false,
		skipSelectors: [".no-transform"]
	})
]).process(css, { from: undefined });
```

### With PostCSS Config File

```js
// postcss.config.js
import { postcssIfFunction } from "postcss-custom-function";

export default {
	plugins: [
		postcssIfFunction({
			logTransformations: process.env.NODE_ENV === "development"
		})
	]
};
```

### With Popular PostCSS Tools

#### Vite

```js
// vite.config.js
import { defineConfig } from "vite";
import { postcssIfFunction } from "postcss-custom-function";

export default defineConfig({
	css: {
		postcss: {
			plugins: [
				postcssIfFunction({
					logTransformations: process.env.NODE_ENV === "development"
				})
			]
		}
	}
});
```

#### Webpack

```js
// webpack.config.js
module.exports = {
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					"style-loader",
					"css-loader",
					{
						loader: "postcss-loader",
						options: {
							postcssOptions: {
								plugins: [
									[
										"postcss-custom-function",
										{
											logTransformations: true
										}
									]
								]
							}
						}
					}
				]
			}
		]
	}
};
```

#### Next.js

```js
// next.config.js
module.exports = {
	experimental: {
		postcss: {
			plugins: {
				"postcss-custom-function": {
					logTransformations: process.env.NODE_ENV === "development"
				}
			}
		}
	}
};
```

## Options

| Option               | Type       | Default | Description                                                                |
| -------------------- | ---------- | ------- | -------------------------------------------------------------------------- |
| `preserveOriginal`   | `boolean`  | `false` | Whether to preserve original CSS alongside transformations (for debugging) |
| `logTransformations` | `boolean`  | `false` | Whether to log transformation statistics to console                        |
| `skipSelectors`      | `string[]` | `[]`    | Array of selectors to skip transformation for                              |

## Supported Transformations

### Media Queries

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

### Feature Support Queries

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

## Limitations

- **Style Functions Not Supported**: This plugin only transforms `media()` and `supports()` functions. For `style()` functions (which depend on runtime DOM state), use the [css-custom-functions-polyfill](https://github.com/mfranzke/css-custom-functions-polyfill/tree/main/packages/css-custom-functions-polyfill/) runtime (browser) library
- **Static Analysis Only**: The plugin performs static analysis and cannot handle dynamically generated CSS
- **PostCSS Compatibility**: Requires PostCSS 8.0.0 or higher

## Integration with Runtime Polyfill

For complete CSS `if()` support including `style()` functions, combine this plugin with the runtime polyfill:

1. Use this PostCSS plugin for build-time transformation of `media()` and `supports()`
2. Use [css-custom-functions-polyfill](https://github.com/mfranzke/css-custom-functions-polyfill/tree/main/packages/css-custom-functions-polyfill/) runtime for `style()` functions

```html
<!-- For style() functions only -->
<script src="https://cdn.jsdelivr.net/npm/css-custom-functions-polyfill/dist/index.modern.js"></script>
```

## Performance Considerations

This plugin is designed for optimal build-time performance, transforming CSS Custom Functionss to native CSS without runtime overhead. However, there are some architectural considerations:

### Current Implementation

- **Double Parsing**: The plugin currently parses CSS twice - once by PostCSS and once by the transformation engine
- **String-based Transformation**: The transformation engine outputs CSS strings that are re-parsed into PostCSS AST nodes

### Future Optimization Opportunities

- **Reduced CSS Code**: We'll make use of CSS Nesting capabilities as soon as any of the browsers are EOL ([#35](https://github.com/mfranzke/css-custom-functions-polyfill/issues/35)).
- **Direct AST Transformation**: The transformation engine could be modified to output PostCSS AST nodes directly, eliminating the double parsing overhead
- **Streaming Processing**: For very large CSS files, streaming transformation could reduce memory usage

For most typical usage scenarios, the current performance is excellent and the double parsing overhead is negligible compared to the benefits of build-time transformation.

## Contributing

See the main [Contributing Guide](https://github.com/mfranzke/css-custom-functions-polyfill/blob/main/CONTRIBUTING.md) for details on how to contribute to this project.

## License

MIT © [Maximilian Franzke](https://github.com/mfranzke)

## Related

- [css-custom-functions-polyfill](https://github.com/mfranzke/css-custom-functions-polyfill/tree/main/packages/css-custom-functions-polyfill/) - Runtime polyfill for CSS Custom Functionss
- [PostCSS](https://postcss.org/) - Tool for transforming CSS with JavaScript
- [CSS Conditional Rules](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_conditional_rules) - MDN documentation for @media and @supports
