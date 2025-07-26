# Unsupported CSS Custom Functions Fixtures

This directory contains CSS Custom Functions test fixtures that use advanced or experimental syntax that may not be fully supported by the current polyfill implementation.

These files are excluded from:
- Prettier formatting (via `.prettierignore`)
- Lint-staged processing
- Documentation generation

## Purpose

These fixtures are used to:
1. Test edge cases and complex scenarios
2. Validate error handling for unsupported features
3. Prepare for future CSS Custom Functions specification updates
4. Ensure the polyfill gracefully handles advanced syntax

## Note

The CSS files in this directory contain `@function` syntax that standard CSS parsers don't recognize yet. This is intentional and expected.
