#!/usr/bin/env node

/**
 * Migration script to convert from CSS CSS Custom Functions to CSS Custom Functions syntax
 * Usage: node migrate-to-custom-functions.js [file-or-directory]
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const EXTENSIONS_TO_PROCESS = [
	'.md',
	'.html',
	'.css',
	'.js',
	'.ts',
	'.yml',
	'.yaml'
];
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

// Migration patterns
const PATTERNS = [
	// Basic CSS Custom Function patterns
	{
		name: 'CSS Custom Function calls',
		pattern: /if\(\s*([^)]+)\s*\)/g,
		replacement: (match) => match // Keep original for manual review
	},

	// Media query patterns
	{
		name: 'media() references in documentation',
		pattern: /media\(([^)]+)\):\s*([^;]+)/g,
		replacement: '@media ($1) { result: $2; }'
	},

	// CSS if() color examples
	{
		name: 'simple if() color examples',
		pattern:
			/color:\s*if\(\s*media\(([^)]+)\):\s*([^;]+);\s*else:\s*([^)]+)\s*\);?/g,
		replacement: (match, mediaQuery, trueValue, falseValue) =>
			`color: --conditional-color(); /* @function --conditional-color() { @media (${mediaQuery}) { result: ${trueValue}; } result: ${falseValue}; } */`
	},

	// Documentation references
	{
		name: 'CSS CSS Custom Function references',
		pattern: /CSS `if\(\)` function/g,
		replacement: 'CSS Custom Functions'
	},

	// MDN links
	{
		name: 'MDN if() links',
		pattern:
			/https:\/\/developer\.mozilla\.org\/en-US\/docs\/Web\/CSS\/if/g,
		replacement: 'https://drafts.csswg.org/css-mixins-1/'
	},

	// Color names that trigger lint warnings
	{
		name: 'problematic color names',
		pattern: /:\s*(white|black)\s*;/g,
		replacement(match, color) {
			const colorMap = {
				white: '#ffffff',
				black: '#000000'
			};

			return match.replace(color, colorMap[color] || color);
		}
	},

	// If() in examples
	{
		name: 'CSS Custom Function examples in docs',
		pattern: /if\(\s*style\(([^)]+)\):\s*([^;]+);\s*else:\s*([^)]+)\s*\)/g,
		replacement:
			'--custom-function($1) /* Define: @function --custom-function(--param) { result: var(--param, $3); } */'
	}
];

// Simple examples to replace
const SIMPLE_REPLACEMENTS = [
	// Documentation text
	{ from: 'CSS Custom Functions', to: 'CSS Custom Functions' },
	{ from: 'CSS Custom Functions', to: 'CSS Custom Functions' },
	{ from: 'CSS Custom Function', to: 'CSS Custom Function' },
	{
		from: 'Multiple conditions within CSS Custom Functions',
		to: 'Multiple conditions within CSS Custom Functions'
	},
	{
		from: 'within CSS Custom Functions',
		to: 'within CSS Custom Functions'
	},
	{ from: 'Use CSS Custom Functions', to: 'Use CSS Custom Functions' },
	{
		from: 'multiple CSS Custom Functions',
		to: 'multiple CSS Custom Functions'
	},
	{
		from: 'Multiple conditions within CSS Custom Functions',
		to: 'Multiple conditions with CSS Custom Functions'
	},
	{
		from: 'preserve CSS without CSS Custom Functions',
		to: 'preserve CSS without CSS Custom Functions'
	},
	{
		from: 'handle multiple separate CSS Custom Functions',
		to: 'handle multiple separate CSS Custom Functions'
	},
	{
		from: 'handle multiple CSS Custom Functions conditions',
		to: 'handle multiple CSS Custom Functions conditions'
	},
	{ from: 'CSS Custom Functions', to: 'CSS Custom Functions' },

	// File descriptions
	{
		from: 'CSS Custom Functions with complex features',
		to: 'CSS Custom Functions with complex features'
	},
	{
		from: 'Multiple conditions within CSS Custom Functions',
		to: 'Multiple conditions within CSS Custom Functions'
	},

	// API descriptions
	{
		from: 'containing CSS Custom Functions',
		to: 'containing CSS Custom Functions'
	},
	{
		from: 'CSS Custom Functions support',
		to: 'CSS Custom Functions support'
	},

	// Color fixes for lint
	{ from: ': #ffffff;', to: ': #ffffff;' },
	{ from: ': #000000;', to: ': #000000;' },
	{ from: '#ffffff,', to: '#ffffff,' },
	{ from: '#000000,', to: '#000000,' }
];

/**
 * Log messages based on verbosity
 */
function log(message, level = 'info') {
	if (level === 'error' || VERBOSE || level === 'warn') {
		const prefix =
			level === 'error'
				? '❌'
				: level === 'warn'
					? '⚠️'
					: level === 'success'
						? '✅'
						: 'ℹ️';
		console.log(`${prefix} ${message}`);
	}
}

/**
 * Apply simple text replacements
 */
function applySimpleReplacements(content) {
	let modified = content;
	let changeCount = 0;

	for (const { from, to } of SIMPLE_REPLACEMENTS) {
		const before = modified;
		modified = modified.replaceAll(from, to);
		if (modified !== before) {
			changeCount++;
			log(`  Replaced: "${from}" → "${to}"`, 'info');
		}
	}

	return { content: modified, changes: changeCount };
}

/**
 * Apply pattern-based replacements
 */
function applyPatternReplacements(content) {
	let modified = content;
	let changeCount = 0;

	for (const pattern of PATTERNS) {
		const before = modified;
		modified =
			typeof pattern.replacement === 'function'
				? modified.replace(pattern.pattern, pattern.replacement)
				: modified.replace(pattern.pattern, pattern.replacement);

		if (modified !== before) {
			changeCount++;
			log(`  Applied pattern: ${pattern.name}`, 'info');
		}
	}

	return { content: modified, changes: changeCount };
}

/**
 * Process a single file
 */
function processFile(filePath) {
	try {
		const content = readFileSync(filePath, 'utf8');

		// Apply simple replacements
		const simpleResult = applySimpleReplacements(content);

		// Apply pattern replacements
		const patternResult = applyPatternReplacements(simpleResult.content);

		const totalChanges = simpleResult.changes + patternResult.changes;

		if (totalChanges > 0) {
			log(`📝 ${filePath}: ${totalChanges} changes`, 'success');

			if (DRY_RUN) {
				log(`  🔍 DRY RUN: Would update file`, 'warn');
			} else {
				writeFileSync(filePath, patternResult.content, 'utf8');
				log(`  ✅ File updated`, 'success');
			}
		} else {
			log(`📄 ${filePath}: No changes needed`, 'info');
		}

		return totalChanges;
	} catch (error) {
		log(`Error processing ${filePath}: ${error.message}`, 'error');
		return 0;
	}
}

/**
 * Process a directory recursively
 */
function processDirectory(directoryPath) {
	const items = readdirSync(directoryPath);
	let totalChanges = 0;

	for (const item of items) {
		const itemPath = path.join(directoryPath, item);
		const stat = statSync(itemPath);

		if (stat.isDirectory()) {
			// Skip node_modules, .git, and other common directories
			if (
				[
					'node_modules',
					'.git',
					'dist',
					'coverage',
					'.next',
					'build'
				].includes(item)
			) {
				log(`⏭️  Skipping directory: ${itemPath}`, 'info');
				continue;
			}

			totalChanges += processDirectory(itemPath);
		} else if (stat.isFile()) {
			const ext = path.extname(itemPath);
			if (EXTENSIONS_TO_PROCESS.includes(ext)) {
				totalChanges += processFile(itemPath);
			} else {
				log(
					`⏭️  Skipping file (extension not processed): ${itemPath}`,
					'info'
				);
			}
		}
	}

	return totalChanges;
}

/**
 * Main execution
 */
function main() {
	const target =
		process.argv.slice(2).find((argument) => !argument.startsWith('--')) ||
		process.cwd();

	log('🚀 CSS Custom Functions Migration Script', 'info');
	log(`📁 Target: ${target}`, 'info');
	log(`🔍 Extensions: ${EXTENSIONS_TO_PROCESS.join(', ')}`, 'info');

	if (DRY_RUN) {
		log('🔍 DRY RUN MODE - No files will be modified', 'warn');
	}

	console.log('');

	try {
		const stat = statSync(target);
		let totalChanges = 0;

		if (stat.isFile()) {
			totalChanges = processFile(target);
		} else if (stat.isDirectory()) {
			totalChanges = processDirectory(target);
		}

		console.log('');
		log(`🎉 Migration complete! Total changes: ${totalChanges}`, 'success');

		if (totalChanges > 0) {
			log('📋 Next steps:', 'info');
			log('  1. Review the changes made', 'info');
			log('  2. Update complex if() patterns manually', 'info');
			log('  3. Test your examples and documentation', 'info');
			log('  4. Run your linter to catch any issues', 'info');
		}
	} catch (error) {
		log(`Error: ${error.message}`, 'error');
		process.exit(1);
	}
}

// Run the script
main();
