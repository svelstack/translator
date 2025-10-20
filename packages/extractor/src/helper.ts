import type { Dictionaries } from './types';

export function flatten(val: any, result: Record<string, string> = {}, parentKey = ''): Record<string, string> {
	if (val == null) {
		result[parentKey] = '';

		return result;
	}

	if (Array.isArray(val)) {
		val.forEach((item, key) => {
			flatten(item, result, parentKey !== '' ? `${parentKey}.${key}` : key.toString());
		});

		return result;
	}

	if (typeof val === 'object') {
		Object.entries(val).forEach(([key, value]) => {
			flatten(value, result, parentKey !== '' ? `${parentKey}.${key}` : key);
		});

		return result;
	}

	result[parentKey] = val.toString();

	return result;
}

export type DifferenceResult = {
	missingInFirst: string[];
	missingInSecond: string[];
};

export function compareTranslations(
	reference: Set<string>,
	record2: Record<string, any>
): DifferenceResult {
	const keys2 = new Set(Object.keys(record2));

	const missingInFirst: string[] = [];
	const missingInSecond: string[] = [];

	// Find keys that are in record2 but not in record1
	for (const key of keys2) {
		if (!reference.has(key)) {
			missingInFirst.push(key);
		}
	}

	// Find keys that are in record1 but not in record2
	for (const key of reference) {
		if (!keys2.has(key)) {
			missingInSecond.push(key);
		}
	}

	return {
		missingInFirst,
		missingInSecond,
	};
}

function createReporter() {
	let errors = false;
	return {
		get hasErrors() { return errors; },
		report(msg: string) {
			console.error(msg);

			errors = true;
		}
	};
}

export function validateDictionaries(dictionaries: Dictionaries, options: { skipValidation?: string|boolean }): boolean {
	if (options.skipValidation === true) {
		return true;
	}

	let reference: {
		lang: string;
		domains: Map<string, Set<string>>;
	} | undefined;

	const reporter = createReporter();

	const languagesToSkip = new Set<string>();
	if (typeof options.skipValidation === 'string') {
		options.skipValidation.split(',').map(l => l.trim()).forEach(l => languagesToSkip.add(l));
	}

	// Compare keys
	Object.entries(dictionaries).forEach(([lang, domains]) => {
		if (languagesToSkip.has(lang)) {
			return;
		}

		if (!reference) {
			const ref = {
				lang,
				domains: new Map<string, Set<string>>(),
			};

			Object.entries(domains).forEach(([domain, translations]) => {
				ref.domains.set(domain, new Set(Object.keys(translations)));
			});

			reference = ref;

			return;
		}

		const ref = reference;

		Object.entries(domains).forEach(([domain, translations]) => {
			const refDomain = ref.domains.get(domain);

			if (!refDomain) {
				reporter.report(`Domain ${domain} not found in ${ref.lang}, but found in ${lang}`);

				return;
			}

			const { missingInFirst, missingInSecond } = compareTranslations(refDomain, translations);

			if (missingInFirst.length) {
				reporter.report(`Missing keys in ${lang}: ${missingInFirst.join(', ')}`);
			}

			if (missingInSecond.length) {
				reporter.report(`Missing keys in ${ref.lang}: ${missingInSecond.join(', ')}`);
			}
		});
	});

	return !(reference == null || reporter.hasErrors);
}
