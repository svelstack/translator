import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as ts from 'typescript';
import { assertExistsDir, findFiles, mkdir, writeToFile } from './filesystem';
import { flatten, validateDictionaries } from './helper';
import { type Loader, YamlLoader } from './loader';
import { createParameterRegex, parseParameters } from './parameter';
import type { Dictionaries } from './types';

const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
const program = new Command();

type ProgramOptions = {
	placeholderStart: string;
	placeholderEnd: string;
};

function main(transDir: string, outputDir: string, options: ProgramOptions) {
	transDir = join(process.cwd(), transDir);
	outputDir = join(process.cwd(), outputDir);

	assertExistsDir(transDir);
	mkdir(outputDir);
	assertExistsDir(outputDir);

	const dictionaryDir = join(outputDir, 'dictionary');
	mkdir(dictionaryDir);
	assertExistsDir(dictionaryDir);

	const loaders: Loader[] = [
		new YamlLoader(),
	];

	const files = findFiles(transDir);
	// lang => domain => { key: trans }
	const dictionaries: Dictionaries = {};

	for (const file of files) {
		const matches = file.match(/\/(\w+)\.(\w+)\.[a-zA-Z]+$/);

		if (!matches) {
			continue;
		}

		const domain = matches[1];
		const lang = matches[2];
		let found = false;

		for (const loader of loaders) {
			if (loader.supports(file)) {
				dictionaries[lang] ??= {};
				dictionaries[lang][domain] ??= {};

				flatten(loader.load(readFileSync(file, 'utf8')), dictionaries[lang][domain]);

				found = true;

				break;
			}
		}

		if (!found) {
			console.error(`No loader found for ${file}`);
		}
	}

	if (!validateDictionaries(dictionaries)) {
		return;
	}

	let first = true;
	Object.entries(dictionaries).forEach(([lang, domains]) => {
		if (first) {
			writeToFile(`${outputDir}/types.d.ts`, createMappingFile(domains, options));
		}

		writeToFile(`${dictionaryDir}/${lang}.ts`, createTranslationFile(domains));

		first = false;
	});

	writeToFile(`${outputDir}/dictionaries.ts`, createDictionariesFile(Object.keys(dictionaries)));
}

program
	.argument('<transDir>', 'Directory containing translations')
	.argument('<outputDir>', 'Output directory')
	.option('-ps, --placeholder-start <string>', 'Parameter placeholder start delimiter', '{')
	.option('-pe, --placeholder-end <string>', 'Parameter placeholder end delimiter', '}')
	.action((transDir: string, outputDir: string, options: ProgramOptions) => {
		main(transDir, outputDir, options);
	})
	.parse();

function createDictionariesFile(languages: string[]) {
	const propertyAssignments = languages.map((lang) => {
		const importExpression = ts.factory.createCallExpression(
			ts.factory.createIdentifier('import'),
			undefined,
			[ts.factory.createStringLiteral(`./dictionary/${lang}`)],
		);

		const thenExpression = ts.factory.createCallExpression(
			ts.factory.createPropertyAccessExpression(importExpression, 'then'),
			undefined, // No type arguments
			[
				ts.factory.createArrowFunction(
					undefined, // No modifiers
					undefined, // No type parameters
					[
						ts.factory.createParameterDeclaration(
							undefined, // No modifiers
							undefined, // No dot-dot-dot token
							'v', // Parameter name
							undefined, // No question token
							undefined, // No type
							undefined // No initializer
						),
					],
					undefined, // No return type
					ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken), // `=>`
					ts.factory.createPropertyAccessExpression(
						ts.factory.createIdentifier('v'),
						'default'
					),
				),
			]
		);

		return ts.factory.createPropertyAssignment(
			ts.factory.createIdentifier(lang),
			ts.factory.createArrowFunction(
				undefined, // No modifiers
				undefined, // No type parameters
				[], // No parameters
				undefined, // No return type
				ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken), // `=>`
				thenExpression // The body of the arrow function
			)
		);
	});

	const dictionariesObject = ts.factory.createVariableStatement(
		[ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)], // `export` modifier
		ts.factory.createVariableDeclarationList(
			[
				ts.factory.createVariableDeclaration(
					ts.factory.createIdentifier('dictionaries'), // Variable name
					undefined, // No type annotation
					undefined, // No initializer type
					ts.factory.createObjectLiteralExpression(
						propertyAssignments, // Properties
						true // Multiline formatting
					)
				),
			],
			ts.NodeFlags.Const // `const` keyword
		)
	);

	const sourceFile = ts.factory.createSourceFile(
		[dictionariesObject],
		ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
		ts.NodeFlags.None
	);

	return printer.printFile(sourceFile);
}

function createTranslationFile(domains: Record<string, Record<string, string>>) {
	const objectLiteral = ts.factory.createObjectLiteralExpression(
		Object.entries(domains).map(([domain, translations]) => {
			return ts.factory.createPropertyAssignment(
				ts.factory.createStringLiteral(domain),
				ts.factory.createObjectLiteralExpression(
					Object.entries(translations).map(([key, value]) => ts.factory.createPropertyAssignment(
						ts.factory.createStringLiteral(key),
						ts.factory.createStringLiteral(value),
					)),
					true, // Multiline formatting
				),
			);
		}),
		true, // Multiline formatting
	);
	const exportDefaultNode = ts.factory.createExportAssignment(
		undefined, // Decorators
		undefined, // Modifiers
		objectLiteral,
	);
	const sourceFile = ts.factory.createSourceFile(
		[exportDefaultNode],
		ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
		ts.NodeFlags.None
	);

	return printer.printFile(sourceFile);
}

function createMappingFile(domains: Record<string, Record<string, string>>, options: ProgramOptions) {
	const types: ts.PropertySignature[] = [];
	const never = ts.factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword);
	const parametersRegex = createParameterRegex(options.placeholderStart, options.placeholderEnd);

	Object.entries(domains).forEach(([domain, translations]) => {
		const typesForDomain: ts.PropertySignature[] = [];

		Object.entries(translations).forEach(([key, translation]) => {
			const params = parseParameters(translation, parametersRegex);
			let type: ts.TypeNode = never;

			if (params.length > 0) {
				type = ts.factory.createUnionTypeNode(params.map(
					(param) => ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(param))
				));
			}

			typesForDomain.push(ts.factory.createPropertySignature(
				undefined,
				ts.factory.createStringLiteral(key),
				undefined,
				type,
			));
		});

		types.push(ts.factory.createPropertySignature(
			undefined,
			ts.factory.createStringLiteral(domain),
			undefined,
			ts.factory.createTypeLiteralNode(typesForDomain),
		));
	});

	const mappingTypeNode = ts.factory.createTypeAliasDeclaration(
		[ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)], // Decorators
		'MappingForTranslator',
		undefined,
		ts.factory.createTypeLiteralNode(types),
	);
	const sourceFile = ts.factory.createSourceFile(
		[mappingTypeNode],
		ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
		ts.NodeFlags.None,
	);

	return printer.printFile(sourceFile);
}
