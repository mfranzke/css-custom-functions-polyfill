# GitHub Copilot Instructions for CSS Custom Functions polyfill

## Project Overview

This is a JavaScript polyfill and PostCSS plugin for [CSS Custom Function functionality](https://developer.mozilla.org/en-US/docs/Web/CSS/if). The polyfill provides browser support for the CSS Custom Function function with style(), media(), and supports() conditions as specified in the WCAG (Web Content Accessibility Guidelines).

<!-- TODO: Update this section if the official specification changes.
https://www.w3.org/TR/css-mixins-1/ -->

## Official WCAG CSS Custom Function Function Specification

### Abstract

This module defines the ability for authors to define custom functions, acting similar to parametrized custom properties. They can use the full power of CSS’s values and conditional rules.

### 1. Introduction

This section is not normative.

Note: At this time, this specification only defines [custom functions](https://drafts.csswg.org/css-mixins-1/#custom-function), which operate at the level of CSS values. It is expected that it will define "mixins" later, which are functions that operate at the style rule level.

Custom properties give authors a lot of power to define useful, sometimes complex values in one place, and then re-use them across their stylesheet. They can vary across the document, or based on Media Queries or other conditionals, making them very flexible and responsive.

However, their values are fixed at the point they’re defined, unable to be changed except by fully overriding their previous definition: a `--shadow: 2px 2px var(--shadow-color)` declaration takes its `--shadow-color` value from the element it’s declared on, and later changes to --shadow-color on descendant elements don’t alter the value of --shadow for them; they continue to use the shadow color defined where `--shadow` was defined. This is a common source of confusion for authors making heavy use of composite variables like this.

[Custom functions](https://drafts.csswg.org/css-mixins-1/#custom-function) allow authors the same power as [custom properties](https://drafts.csswg.org/css-variables-2/#custom-property), but parameterized: they have the same flexibility and conditionality as a custom property definition, but take values from other custom properties (or explicitly as arguments) at the _point of use_. For example, instead of a `--shadow` custom property, a `--shadow()` custom function could be defined instead, like:

```css
@function --shadow(--shadow-color <color>: inherit) {
	/* If --shadow-color argument isn't passed,
	or doesn't successfully parse as a <color>,
	try to use the --shadow-color *property*
	from the element instead */

	/* var(--shadow-color) refers to the --shadow-color parameter,
	rather than a custom property,
	but can still use a fallback value as normal */
	result: 2px 2px var(--shadow-color, black);
}

.foo {
	--shadow-color: blue;
	box-shadow: --shadow(); /* produces a blue shadow */
	/* or just */
	box-shadow: --shadow(blue);
}
```

### 2. Defining Custom Functions

A [custom function](https://drafts.csswg.org/css-mixins-1/#custom-function) can be thought of as an advanced [custom property](https://drafts.csswg.org/css-variables-2/#custom-property), which instead of being substituted by a single fixed value, computes its substitution value based on [function parameters](https://drafts.csswg.org/css-mixins-1/#function-parameter) and the value of custom properties at the point it’s invoked. Rather than the [`var()`](https://drafts.csswg.org/css-variables-2/#funcdef-var) syntax that custom properties use for substitution, custom functions are invoked by [`<dashed-function>`](https://drafts.csswg.org/css-mixins-1/#typedef-dashed-function) syntax, allowing additional values to be passed as arguments.

Example 1:
A simple [custom function](https://drafts.csswg.org/css-mixins-1/#custom-function) to negate a value can be defined as follows:

```css
@function --negative(--value) {
	result: calc(-1 \* var(--value));
}
```

Then, that function can be referenced with `--negative()` in some declaration:

```css
html {
	--gap: 1em;
	padding: --negative(var(--gap));
	/* or by passing the value explicitly, like: */
	padding: --negative(1em);
}
```

[`<dashed-function>`](https://drafts.csswg.org/css-mixins-1/#typedef-dashed-function)s are [arbitrary substitution functions](https://drafts.csswg.org/css-values-5/#arbitrary-substitution-function), like [`var()`](https://drafts.csswg.org/css-variables-2/#funcdef-var). Their presence in a property’s value causes it to be assumed valid at parse time, and only evaluated and parsed at computed-value time, after [arbitrary substitution](https://drafts.csswg.org/css-values-5/#substitute-arbitrary-substitution-function) has occurred.

2.1. The `@function` Rule
The [`@function`](https://drafts.csswg.org/css-mixins-1/#at-ruledef-function) rule defines a **_custom function_**, and consists of a name, a list of [parameters](https://drafts.csswg.org/css-mixins-1/#function-parameter), a **_function body_**, and optionally a **_return type_** described by a [syntax definition](https://drafts.css-houdini.org/css-properties-values-api-1/#syntax-definition).

Each **_function parameter_** consists of a name ([`<custom-property-name>`](https://drafts.csswg.org/css-variables-2/#typedef-custom-property-name)); optionally a **_parameter type_**, described by a [syntax definition](https://drafts.css-houdini.org/css-properties-values-api-1/#syntax-definition); and optionally a **_default value_**.

```text
<@function> = @function <function-token> <function-parameter>#? )
[ returns <css-type> ]?
{
<declaration-rule-list>
}

<function-parameter> = <custom-property-name> <css-type>? [ : <default-value> ]?
<css-type> = <syntax-component> | <type()>
<default-value> = <declaration-value>
<type()> = type( <syntax> )
```

If a [default value](https://drafts.csswg.org/css-mixins-1/#default-value) and a [parameter type](https://drafts.csswg.org/css-mixins-1/#parameter-type) are both provided, then the default value must [parse](https://drafts.csswg.org/css-syntax-3/#css-parse-something-according-to-a-css-grammar) successfully according to that parameter type’s syntax. Otherwise, the [`@function`](https://drafts.csswg.org/css-mixins-1/#at-ruledef-function) rule is invalid.

#### 2.1.1. The Function Preamble

The [`<function-token>`](https://drafts.csswg.org/css-syntax-3/#typedef-function-token) production must start with two dashes (U+002D HYPHEN-MINUS), similar to [`<dashed-ident>`](https://drafts.csswg.org/css-values-4/#typedef-dashed-ident), or else the definition is invalid.

The name of the resulting [custom function](https://drafts.csswg.org/css-mixins-1/#custom-function) is given by the name of the [`<function-token>`](https://drafts.csswg.org/css-syntax-3/#typedef-function-token), the optional [function parameters](https://drafts.csswg.org/css-mixins-1/#function-parameter) are given by the <function-parameter> values (defaulting to an empty set), and the optional [return type](https://drafts.csswg.org/css-mixins-1/#custom-function-return-type) is given by the [`<css-type>`](https://drafts.csswg.org/css-mixins-1/#typedef-css-type) following the `returns` keyword (defaulting to `type(*)`).

Example 2:
If the [`<css-type>`](https://drafts.csswg.org/css-mixins-1/#typedef-css-type) of a [function parameter](https://drafts.csswg.org/css-mixins-1/#function-parameter) or [return type](https://drafts.csswg.org/css-mixins-1/#custom-function-return-type) can be described by a single [`<syntax-component>`](https://drafts.csswg.org/css-values-5/#typedef-syntax-component), then the [`type()`](https://drafts.csswg.org/css-mixins-1/#funcdef-function-type) function can be omitted:

```css
@function --foo(--a <length>) {
	/* ... */
}
@function --foo(--a <color>) {
	/* ... */
}
@function --foo(--a <length> +) {
	/* ... */
}
```

However, any [`<syntax>`](https://drafts.csswg.org/css-values-5/#typedef-syntax) that requires a [`<syntax-combinator>`](https://drafts.csswg.org/css-values-5/#typedef-syntax-combinator) needs to be wrapped in the [`type()`](https://drafts.csswg.org/css-mixins-1/#funcdef-function-type) function:

```css
@function --foo(--a type(<number> | <percentage>)) {
	/* ... */
}
```

The name of a [`@function`](https://drafts.csswg.org/css-mixins-1/#at-ruledef-function) rule is a [tree-scoped name](https://drafts.csswg.org/css-scoping-1/#css-tree-scoped-name). If more than one `@function` exists for a given name, then the rule in the stronger cascade layer wins, and rules defined later win within the same layer.

If the [function parameters](https://drafts.csswg.org/css-mixins-1/#function-parameter) contain the same [`<custom-property-name>`](https://drafts.csswg.org/css-variables-2/#typedef-custom-property-name) more than once, then the [`@function`](https://drafts.csswg.org/css-mixins-1/#at-ruledef-function) rule is invalid.

#### 2.1.2. The Function Body

The body of a [`@function`](https://drafts.csswg.org/css-mixins-1/#at-ruledef-function) rule accepts [conditional group rules](https://drafts.csswg.org/css-conditional-3/#conditional-group-rule), such as [`@media`](https://drafts.csswg.org/css-conditional-3/#at-ruledef-media). Additionally, it accepts the following descriptors:

- The [`result`](https://drafts.csswg.org/css-mixins-1/#descdef-function-result) descriptor, which determines the result of [evaluating the function](https://drafts.csswg.org/css-mixins-1/#evaluate-a-custom-function). If no `result` descriptor exists, the function is valid, but always returns the [guaranteed-invalid value](https://drafts.csswg.org/css-variables-2/#guaranteed-invalid-value).
- [Custom properties](https://drafts.csswg.org/css-variables-2/#custom-property), providing **_local variables_**.

Unknown descriptors are invalid and ignored, but do not make the [`@function`](https://drafts.csswg.org/css-mixins-1/#at-ruledef-function) rule itself invalid.

#### 2.2. The [`result`](https://drafts.csswg.org/css-mixins-1/#descdef-function-result) Descriptor

<dl><dt>Name:</dt><dd>**_result_**</dd>
<dt>For</dt><dd>[`@function`](https://drafts.csswg.org/css-mixins-1/#at-ruledef-function)</dd>
<dt>Value:</dt><dd>[`<declaration-value>`?](https://drafts.csswg.org/css-syntax-3/#typedef-declaration-value)</dd>
<dt>Initial:</dt><dd>n/a (see prose)</dd>
</dl>

The [`result`](https://drafts.csswg.org/css-mixins-1/#descdef-function-result) descriptor defines the result of [evaluating](https://drafts.csswg.org/css-mixins-1/#evaluate-a-custom-function) the [custom function](https://drafts.csswg.org/css-mixins-1/#custom-function) defined by its [`@function`](https://drafts.csswg.org/css-mixins-1/#at-ruledef-function) rule. Using [`var()`](https://drafts.csswg.org/css-variables-2/#funcdef-var) functions, it can reference [function parameters](https://drafts.csswg.org/css-mixins-1/#function-parameter), [local variables](https://drafts.csswg.org/css-mixins-1/#local-variables), as well as other custom functions via [`<dashed-function>`](https://drafts.csswg.org/css-mixins-1/#typedef-dashed-function)s.

The [`result`](https://drafts.csswg.org/css-mixins-1/#descdef-function-result) descriptor itself does not have a type, but its [resolved](https://drafts.csswg.org/css-mixins-1/#resolve-function-styles) value is type-checked during the [substitution](https://drafts.csswg.org/css-mixins-1/#replace-a-dashed-function) of a [`<dashed-function>`](https://drafts.csswg.org/css-mixins-1/#typedef-dashed-function).

#### 2.3. Arguments & Local Variables

Within a [custom function’s](https://drafts.csswg.org/css-mixins-1/#custom-function) [function body](https://drafts.csswg.org/css-mixins-1/#custom-function-function-body), the [`var()`](https://drafts.csswg.org/css-variables-2/#funcdef-var) function can access [local variables](https://drafts.csswg.org/css-mixins-1/#local-variables) (the [custom properties](https://drafts.csswg.org/css-variables-2/#custom-property) defined in the function body), [function parameters](https://drafts.csswg.org/css-mixins-1/#function-parameter) (the values passed to the function, or set to default values), and custom properties defined at the _call site_ (an element, or another custom function).

In that list, earlier things "win" over later things of the same name—​if you have a [local variable](https://drafts.csswg.org/css-mixins-1/#local-variables) named `--foo`, `var(--foo)` will be substituted by that local variable, not by an argument or a custom property defined outside. The other values can still be `accessed`, however: setting the `--foo` local variable to [`initial`](https://drafts.csswg.org/css-cascade-5/#valdef-all-initial) will resolve it to the `--foo` parameter, while [`inherit`](https://drafts.csswg.org/css-cascade-5/#valdef-all-inherit) will resolve it to the `--foo` custom property from the call site.

Example 3:
A [custom function](https://drafts.csswg.org/css-mixins-1/#custom-function) can access [local variables](https://drafts.csswg.org/css-mixins-1/#local-variables) and [function parameters](https://drafts.csswg.org/css-mixins-1/#function-parameter) from functions higher up in the call stack:

```css
@function --outer(--outer-arg) {
	--outer-local: 2;
	result: --inner();
}
@function --inner() returns <number> {
	result: calc(var(--outer-arg) + var(--outer-local));
}
div {
	z-index: --outer(1); /* 3 */
}
```

Similarly, [custom properties](https://drafts.csswg.org/css-variables-2/#custom-property) are implicitly available:

```css
@function --double-z() returns <number> {
	result: calc(var(--z) * 2);
}
div {
	--z: 3;
	z-index: --double-z(); /* 6 */
}
```

But [function parameters](https://drafts.csswg.org/css-mixins-1/#function-parameter) "shadow" [custom properties](https://drafts.csswg.org/css-variables-2/#custom-property), and [local variables](https://drafts.csswg.org/css-mixins-1/#local-variables) "shadow" both:

```css
@function --add-a-b-c(--b, --c) {
	--c: 300;
	result: calc(var(--a) + var(--b) + var(--c));
	/* uses the --a from the call site's custom property,
	the --b from the function parameter,
	and the --c from the local variable */
}
div {
	--a: 1;
	--b: 2;
	--c: 3;
	z-index: --add-a-b-c(20, 30); /* 321 */
}
```

### 3. Using Custom Functions

Similar to how the value of a [custom property](https://drafts.csswg.org/css-variables-2/#custom-property) can be substituted into the value of another property with [`var()`](https://drafts.csswg.org/css-variables-2/#funcdef-var), the result of a [custom function](https://drafts.csswg.org/css-mixins-1/#custom-function) evaluation can be substituted into the value of a property with a [<dashed-function>](https://drafts.csswg.org/css-mixins-1/#typedef-dashed-function).

A [`<dashed-function>`](https://drafts.csswg.org/css-mixins-1/#typedef-dashed-function) is a [functional notation](https://drafts.csswg.org/css-values-4/#functional-notation) whose function name starts with two dashes (U+002D HYPHEN-MINUS). Its [argument grammar](https://drafts.csswg.org/css-values-5/#argument-grammar) is:

<dashed-function> = --[\*](https://drafts.csswg.org/css-values-4/#mult-zero-plus)( [<declaration-value>](https://drafts.csswg.org/css-syntax-3/#typedef-declaration-value)[#](https://drafts.csswg.org/css-values-4/#mult-comma)[?](https://drafts.csswg.org/css-values-4/#mult-opt) )

If a property contains one or more [<dashed-function>](https://drafts.csswg.org/css-mixins-1/#typedef-dashed-function)s, the entire property’s grammar must be assumed to be valid at parse time. At computed-value time, every <dashed-function> must be [replaced](https://drafts.csswg.org/css-mixins-1/#replace-a-dashed-function) before finally being checked against the property’s grammar.

Note: Within the body of a [custom function](https://drafts.csswg.org/css-mixins-1/#custom-function), [`var()`](https://drafts.csswg.org/css-variables-2/#funcdef-var) functions might resolve differently than on the element the [<dashed-function>](https://drafts.csswg.org/css-mixins-1/#typedef-dashed-function) is used on. See [§ 3.1 Evaluating Custom Functions](https://drafts.csswg.org/css-mixins-1/#evaluating-custom-functions).

A [<dashed-function>](https://drafts.csswg.org/css-mixins-1/#typedef-dashed-function) is evaluated in some context: either in a property value on an element (or in a descriptor that is eventually treated like a property on an element, such as in [`@keyframes`](https://drafts.csswg.org/css-animations-1/#at-ruledef-keyframes)), or in a descriptor in the [function body](https://drafts.csswg.org/css-mixins-1/#custom-function-function-body) of another [custom function](https://drafts.csswg.org/css-mixins-1/#custom-function) that is being applied to a "hypothetical" element. Either way, this provides a **_calling context_**, which contains the property or descriptor name containing the <dashed-function>, and the element (or "hypothetical" element) that property/descriptor is being applied to.

As [calling contexts](https://drafts.csswg.org/css-mixins-1/#calling-context) are nested by [<dashed-function>](https://drafts.csswg.org/css-mixins-1/#typedef-dashed-function) evaluations inside of [custom functions](https://drafts.csswg.org/css-mixins-1/#custom-function), a calling context’s **_root element_** is the real element at the root of the calling context stack.

To **_replace a dashed function_** _dashed function_, with a list of arguments:

1. Let _function_ be the result of dereferencing the _dashed function_’s name as a [tree-scoped reference](https://drafts.csswg.org/css-scoping-1/#css-tree-scoped-reference). If no such name exists, return the [guaranteed-invalid value](https://drafts.csswg.org/css-variables-2/#guaranteed-invalid-value).

2. For each _arg_ in _arguments_, [substitute arbitrary substitution functions](https://drafts.csswg.org/css-values-5/#substitute-arbitrary-substitution-function) in _arg_, and replace _arg_ with the result.
   Note: This may leave some (or all) arguments as the [guaranteed-invalid value](https://drafts.csswg.org/css-variables-2/#guaranteed-invalid-value), triggering [default values](https://drafts.csswg.org/css-mixins-1/#default-value) (if any).

3. If _dashed function_ is being substituted into a property on an element, let _calling_ context be a [calling context](https://drafts.csswg.org/css-mixins-1/#calling-context) with that element and that property

Otherwise, it’s being substituted into a descriptor on a "hypothetical element", while evaluating another [custom function](https://drafts.csswg.org/css-mixins-1/#custom-function). Let calling context be a [calling context](https://drafts.csswg.org/css-mixins-1/#calling-context) with that "hypothetical element" and that descriptor.

4. [Evaluate a custom function](https://drafts.csswg.org/css-mixins-1/#evaluate-a-custom-function), using _function_, _arguments_, and _calling context_, and return the [equivalent token sequence](https://drafts.css-houdini.org/css-properties-values-api-1/#equivalent-token-sequence) of the value resulting from the evaluation.

Example 4:
A [comma-containing value](https://drafts.csswg.org/css-values-5/#comma-containing-productions) may be passed as a single argument by wrapping the value in curly braces, `{}`:

```css
@function --max-plus-x(--list, --x) {
	result: calc(max(var(--list)) + var(--x));
}
div {
	width: --max-plus-x({1px, 7px, 2px}, 3px); /* 10px */
}
```

Example 5:
In the following, `--foo()` is in a cycle with itself:

```css
@function --foo(--x) {
	result: --foo(10);
}
```

Similarly, `--bar()` is in a cycle with itself, even though the local variable `--x` is never referenced by [`result`](https://drafts.csswg.org/css-mixins-1/#descdef-function-result):

```css
@function --bar() {
	--x: --bar();
	result: 1;
}
```

However, `--baz()` is not in a cycle with itself here, since we never evaluate the `result` declaration within the `@media` rule:

```css
@function --baz(--x) {
	@media (unknown-feature) {
		result: --baz(42);
	}
	result: 1;
}
```

Example 6:
The function `--baz()` is not in a cycle in the example below: even though `var(--x)` and `var(--y)` appear in the function body, they refer to a [function parameter](https://drafts.csswg.org/css-mixins-1/#function-parameter) and [local variable](https://drafts.csswg.org/css-mixins-1/#local-variables), respectively. The [custom properties](https://drafts.csswg.org/css-variables-2/#custom-property) `--x` and `--y` both reference `--baz()`, but that’s fine: those custom properties are not referenced within `--baz()`.

```css
@function --baz(--x) {
	--y: 10px;
	result: calc(var(--x) + var(--y));
}

div {
	--x: --baz(1px);
	--y: --baz(2px);
	width: var(--x); /* 11px */
	height: var(--y); /* 12px */
}
```

#### 3.1. Evaluating Custom Functions

[Custom functions](https://drafts.csswg.org/css-mixins-1/#custom-function) are evaluated by, essentially, pretending their function body is a [style rule](https://drafts.csswg.org/css-syntax-3/#style-rule) being applied to a hypothetical element, resolving styles as normal, and then returning the value of the [result](https://drafts.csswg.org/css-mixins-1/#descdef-function-result) descriptor on that hypothetical element. The hypothetical element "inherits" the values of all custom properties as if it were a child of its [calling context](https://drafts.csswg.org/css-mixins-1/#calling-context), with its [function parameters](https://drafts.csswg.org/css-mixins-1/#function-parameter) overriding "inherited" custom properties of the same name.

To **_evaluate a custom function_** _custom function_, given a [calling context](https://drafts.csswg.org/css-mixins-1/#calling-context) _calling context_ and a list of CSS values arguments, returning a CSS value:

1. Let _substitution context_ be a [substitution context](https://drafts.csswg.org/css-values-5/#substitution-context) containing «"function", custom function».

Note: Due to [tree-scoping](https://drafts.csswg.org/css-scoping-1/#css-tree-scoped-name), the same function name may appear multiple times on the stack while referring to different [custom functions](https://drafts.csswg.org/css-mixins-1/#custom-function). For this reason, the custom function itself is included in the [substitution context](https://drafts.csswg.org/css-values-5/#substitution-context), not just its name.

2. [Guard](https://drafts.csswg.org/css-values-5/#guarded) _substitution context_ for the remainder of this algorithm. If substitution context is marked as [cyclic](https://drafts.csswg.org/css-values-5/#cyclic-substitution-contexts), return the [guaranteed-invalid value](https://drafts.csswg.org/css-variables-2/#guaranteed-invalid-value).

3. If the number of items in arguments is greater than the number of [function parameters](https://drafts.csswg.org/css-mixins-1/#function-parameter) in custom function, return the [guaranteed-invalid value](https://drafts.csswg.org/css-variables-2/#guaranteed-invalid-value).

4. Let _registrations_ be an initially empty set of [custom property registrations](https://drafts.css-houdini.org/css-properties-values-api-1/#custom-property-registration).

5. For each [function parameter](https://drafts.csswg.org/css-mixins-1/#function-parameter) of custom function, create a [custom property registration](https://drafts.css-houdini.org/css-properties-values-api-1/#custom-property-registration) with the parameter’s name, a syntax of the [parameter type](https://drafts.csswg.org/css-mixins-1/#parameter-type), an inherit flag of "true", and no initial value. Add the registration to registrations.

6. If custom function has a [return type](https://drafts.csswg.org/css-mixins-1/#custom-function-return-type), create a [custom property registration](https://drafts.css-houdini.org/css-properties-values-api-1/#custom-property-registration) with the name "return" (violating the usual rules for what a registration’s name can be), a syntax of the return type, an inherit flag of "false", and no initial value. Add the registration to registrations.

7. Let _argument rule_ be an initially empty [style rule](https://drafts.csswg.org/css-syntax-3/#style-rule).

8. For each [function parameter](https://drafts.csswg.org/css-mixins-1/#function-parameter) of custom function:
    1. Let arg value be the value of the corresponding argument in arguments, or the [guaranteed-invalid value](https://drafts.csswg.org/css-variables-2/#guaranteed-invalid-value) if there is no corresponding argument.

    2. Let default value be the parameter’s [default value](https://drafts.csswg.org/css-mixins-1/#default-value).

    3. Add a [custom property](https://drafts.csswg.org/css-variables-2/#custom-property) to argument rule with a name of the parameter’s name, and a value of `first-valid(arg value, default value)`.

9. [Resolve function styles](https://drafts.csswg.org/css-mixins-1/#resolve-function-styles) using _custom function_, _argument rule_, _registrations_, and _calling context_. Let _argument styles_ be the result.

10. Let _body rule_ be the [function body](https://drafts.csswg.org/css-mixins-1/#custom-function-function-body) of _custom function_, as a [style rule](https://drafts.csswg.org/css-syntax-3/#style-rule).

11. For each [custom property registration](https://drafts.css-houdini.org/css-properties-values-api-1/#custom-property-registration) of _registrations_ except the registration with the name "result", set its initial value to the corresponding value in argument styles, set its syntax to the [universal syntax definition](https://drafts.css-houdini.org/css-properties-values-api-1/#universal-syntax-definition), and prepend a [custom property](https://drafts.csswg.org/css-variables-2/#custom-property) to _body rule_ with the property name and value in _argument styles_.

12. [Resolve function styles](https://drafts.csswg.org/css-mixins-1/#resolve-function-styles) using _custom function_, _body rule_, _registrations_, and _calling context_. Let _body styles_ be the result.

13. If _substitution context_ is marked as a [cyclic substitution context](https://drafts.csswg.org/css-values-5/#cyclic-substitution-contexts), return the [guaranteed-invalid value](https://drafts.csswg.org/css-variables-2/#guaranteed-invalid-value).

Note: Nested [arbitrary substitution functions](https://drafts.csswg.org/css-values-5/#arbitrary-substitution-function) may have marked _substitution context_ as [cyclic](https://drafts.csswg.org/css-values-5/#cyclic-substitution-contexts) at some point after step 2, for example when resolving [`result`](https://drafts.csswg.org/css-mixins-1/#descdef-function-result).

14. Return the value of the [`result`](https://drafts.csswg.org/css-mixins-1/#descdef-function-result) property in _body styles_.

To **_resolve function styles_**, given a [custom function](https://drafts.csswg.org/css-mixins-1/#custom-function) _custom function_, a style rule _rule_, a set of [custom property registrations](https://drafts.css-houdini.org/css-properties-values-api-1/#custom-property-registration) _registrations_, and a [calling context](https://drafts.csswg.org/css-mixins-1/#calling-context) _calling context_, returning a set of [computed](https://drafts.csswg.org/css-cascade-5/#computed-value) styles:

1. Create a "hypothetical element" _el_ that acts as a child of _calling context_’s element. _el_ is [featureless](https://drafts.csswg.org/selectors-4/#featureless), and only [custom properties](https://drafts.csswg.org/css-variables-2/#custom-property) and the [`result`](https://drafts.csswg.org/css-mixins-1/#descdef-function-result) descriptor apply to it.

2. Apply _rule_ to _el_ to the [specified value](https://drafts.csswg.org/css-cascade-5/#specified-value) stage, with the following changes:
    - Only the [custom property registrations](https://drafts.css-houdini.org/css-properties-values-api-1/#custom-property-registration) in registrations are visible; all other [custom properties](https://drafts.csswg.org/css-variables-2/#custom-property) are treated as unregistered.

    - The [inherited value](https://drafts.csswg.org/css-cascade-5/#inherited-value) of calling context’s property is the [guaranteed-invalid value](https://drafts.csswg.org/css-variables-2/#guaranteed-invalid-value).

    - On custom properties, the [CSS-wide keywords](https://drafts.csswg.org/css-values-4/#css-wide-keywords) have the following effects:

    [initial](https://drafts.csswg.org/css-cascade-5/#valdef-all-initial)
    Resolves to the initial value of the custom property within registrations.
    [inherit](https://drafts.csswg.org/css-cascade-5/#valdef-all-inherit)
    Resolves like an [inherit()](https://drafts.csswg.org/css-values-5/#funcdef-inherit) function with the custom property name as its one and only argument.
    Note: This ensures that a [function parameter](https://drafts.csswg.org/css-mixins-1/#function-parameter) defaulted to [inherit](https://drafts.csswg.org/css-cascade-5/#valdef-all-inherit) is reinterpreted using the local [parameter type](https://drafts.csswg.org/css-mixins-1/#parameter-type).

    any other [CSS-wide keyword](https://drafts.csswg.org/css-values-4/#css-wide-keywords)
    Resolves to the [guaranteed-invalid value](https://drafts.csswg.org/css-variables-2/#guaranteed-invalid-value).
    Note: [initial](https://drafts.csswg.org/css-cascade-5/#valdef-all-initial) references the [custom property registration](https://drafts.css-houdini.org/css-properties-values-api-1/#custom-property-registration) created from the [function parameters](https://drafts.csswg.org/css-mixins-1/#function-parameter), letting you "reset" a property to the passed value. [inherit](https://drafts.csswg.org/css-cascade-5/#valdef-all-inherit) inherits from the [calling context](https://drafts.csswg.org/css-mixins-1/#calling-context)’s element.\

    On [result](https://drafts.csswg.org/css-mixins-1/#descdef-function-result), all [CSS-wide keywords](https://drafts.csswg.org/css-values-4/#css-wide-keywords) are left unresolved.

    Note: [result: inherit](https://drafts.csswg.org/css-mixins-1/#descdef-function-result), for example, will cause the [<dashed-function>](https://drafts.csswg.org/css-mixins-1/#typedef-dashed-function) to evaluate to the [inherit](https://drafts.csswg.org/css-cascade-5/#valdef-all-inherit) keyword, similar to var(--unknown, inherit).
    - For a given [custom property](https://drafts.csswg.org/css-variables-2/#custom-property) prop, during [property replacement](https://drafts.csswg.org/css-values-5/#property-replacement) for that property, the [substitution context](https://drafts.csswg.org/css-values-5/#substitution-context) also includes custom function. In other words, the substitution context is «"property", prop’s name, custom function»

    Note: Due to dynamic scoping, the same property name may appear multiple times on the stack while referring to different [custom properties](https://drafts.csswg.org/css-variables-2/#custom-property). For this reason, the [custom function](https://drafts.csswg.org/css-mixins-1/#custom-function) itself is included in the [substitution context](https://drafts.csswg.org/css-values-5/#substitution-context), not just its name.

3. Determine the [computed value](https://drafts.csswg.org/css-cascade-5/#computed-value) of all [custom properties](https://drafts.csswg.org/css-variables-2/#custom-property) and the [result](https://drafts.csswg.org/css-mixins-1/#descdef-function-result) "property" on el, as defined in [CSS Properties and Values API 1 § 2.4 Computed Value-Time Behavior](https://drafts.css-houdini.org/css-properties-values-api-1/#calculation-of-computed-values), with changes from the previous step, and the following:
    - Aside from references to [custom properties](https://drafts.csswg.org/css-variables-2/#custom-property) (which use the values on el as normal) and numbers/percentages (which are left unresolved in custom properties, as normal), all values which would normally refer to the element being styled instead refer to calling context’s [root element](https://drafts.csswg.org/css-mixins-1/#calling-context-root-element).

    Note: For example, [attr()](https://drafts.csswg.org/css-values-5/#funcdef-attr) in a property, or [@container](https://drafts.csswg.org/css-conditional-5/#at-ruledef-container) queries in the rule.

4. Return el’s styles.
   Note: Only [custom properties](https://drafts.csswg.org/css-variables-2/#custom-property) and the [result](https://drafts.csswg.org/css-mixins-1/#descdef-function-result) descriptor will be used from these styles.

### 4. Execution Model of Custom Functions

Like the rest of CSS, [custom functions](https://drafts.csswg.org/css-mixins-1/#custom-function) adhere to a declarative model.

The [local variable](https://drafts.csswg.org/css-mixins-1/#local-variables) descriptors and [result](https://drafts.csswg.org/css-mixins-1/#descdef-function-result) descriptor can appear in any order, and may be provided multiple times. If this happens, then declarations appearing later win over earlier ones.

Example 7:

```css
@function --mypi() {
	result: 3;
	result: 3.14;
}
```

The value of the [`result`](https://drafts.csswg.org/css-mixins-1/#descdef-function-result) descriptor of `--mypi` is `3.14`.

Example 8:

```css
@function --circle-area(--r) {
	result: calc(pi _ var(--r2));
	--r2: var(--r) _ var(--r);
}
```

[Local variable](https://drafts.csswg.org/css-mixins-1/#local-variables) descriptors may appear before or after they are referenced.

#### 4.1. Conditional Rules

A [conditional group rule](https://drafts.csswg.org/css-conditional-3/#conditional-group-rule) that appears within a [@function](https://drafts.csswg.org/css-mixins-1/#at-ruledef-function) becomes a [nested group rule](https://drafts.csswg.org/css-nesting-1/#nested-group-rules), with the additional restriction that only descriptors allowed within @function are allowed within the nested group rule.

[Conditional group rules](https://drafts.csswg.org/css-conditional-3/#conditional-group-rule) within [@function](https://drafts.csswg.org/css-mixins-1/#at-ruledef-function) are [processed](https://drafts.csswg.org/css-conditional-3/#processing) as normal, acting as if the contents of the rule were present at the conditional group rule’s location when the condition is true, or acting as if nothing exists at that location otherwise.

Example 9:

```css
@function --suitable-font-size() {
	result: 16px;
	@media (width > 1000px) {
		result: 20px;
	}
}
```

The value of the [result](https://drafts.csswg.org/css-mixins-1/#descdef-function-result) descriptor is 20px if the media query’s condition is true, and 16px otherwise.

Example 10:
Note that due to the execution model, "early return" is not possible within a [@function](https://drafts.csswg.org/css-mixins-1/#at-ruledef-function):

```css
@function --suitable-font-size() {
	@media (width > 1000px) {
		result: 20px;
	}
	result: 16px;
}
```

The value of the [`result`](https://drafts.csswg.org/css-mixins-1/#descdef-function-result) descriptor is always `16px` in the above example.

[Local variables](https://drafts.csswg.org/css-mixins-1/#local-variables) are also valid within conditional rules:

```css
@function --suitable-font-size() {
	--size: 16px;
	@media (width > 1000px) {
		--size: 20px;
	}
	result: var(--size);
}
```

## Project Structure and Key Components

### Core Packages

- `packages/css-custom-functions-polyfill/` - Main JavaScript polyfill
- `packages/postcss-custom-function/` - PostCSS plugin for build-time transformation

### Key Files

- `packages/css-custom-functions-polyfill/src/index.js` - Main polyfill runtime
- `packages/css-custom-functions-polyfill/src/transform.js` - CSS transformation logic
- `test/fixtures/` - CSS test fixture pairs (_.input.css / _.expected.css)
- `test/fixtures-validation/` - Playwright-based browser validation tests

### Testing Infrastructure

- Vitest for unit tests
- Playwright for browser-based fixture validation
- XO for linting (strict ESLint configuration)

## Syntax Rules and Implementation Guidelines

### CSS Custom Function Function Syntax

When working with CSS Custom Function functions, always follow the official WCAG specification syntax as included in the previous section "Official WCAG CSS Custom Function Function Specification".

### Code Style Requirements

- Use ES modules with modern JavaScript syntax
- Follow XO linting rules (extends ESLint strict configuration)
- Use `/* eslint-disable rule-name */` blocks only when necessary for browser automation
- Prefer functional programming patterns
- Use meaningful variable names and comprehensive JSDoc comments, instead of TypeScript within our source code, but still provide type definitions for public APIs

### Testing Requirements

- All new CSS syntax must have corresponding fixture pairs in `test/fixtures/`
- Fixture files must follow naming convention: `name.input.css` / `name.expected.css`
- Browser validation tests must pass in Chromium, Firefox, and WebKit
- Unit tests should cover edge cases and error conditions

### Browser Compatibility

- Support modern browsers with ES module capability
- Graceful degradation for older browsers via UMD build
- Auto-initialization in browser environments
- Clean cleanup of event listeners and observers

## Development Workflow

1. **CSS Syntax Changes**: Update both polyfill logic and PostCSS plugin
2. **New Features**: Add fixture tests first, then implement functionality
3. **Bug Fixes**: Create minimal reproduction test case before fixing
4. **Performance**: Profile with large CSS files and many DOM elements

## Important Implementation Notes

### Polyfill Behavior

- Must evaluate conditions at runtime based on current browser state
- Should handle dynamic viewport changes for media queries
- Must respect CSS cascade and specificity rules
- Should not interfere with native CSS Custom Function support when available

### Error Handling

- Debug mode should provide helpful error messages
- Should not break page rendering on malformed CSS

### Performance Considerations

- Minimize DOM queries and style recalculations
- Cache compiled CSS transformations when possible

## File Naming and Organization

- Use kebab-case for files and directories
- Suffix test files with `.test.js`
- Suffix fixture files with `.input.css` / `.expected.css`
- Group related functionality in dedicated directories
- Keep configuration files at appropriate levels (root, package, or feature-specific)

## When Making Changes

1. **Always** check the WCAG specification above for syntax correctness
2. **Always** add fixture tests for new CSS functionality
3. **Always** run the full test suite including browser validation
4. **Always** update documentation when changing public APIs
5. **Always** bear in mind that the developer's main job is to read, not write, code. Therefore, avoid unnecessary complexity, abbreviations and short forms of parameters, for example in CLI usage.
6. **Consider** performance impact on large stylesheets and DOM trees

This project aims to provide a complete, specification-compliant implementation of CSS Custom Function functionality for browsers that don't yet support it natively.
