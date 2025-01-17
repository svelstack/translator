import { getLocaleNumber, getNumberOfPluralParts } from '../../internal/utils.js';

export class ChainMessageFormatter {
	/**
	 * @type {MessageFormatter[]}
	 */
	#formatters;

	/**
	 * @param {MessageFormatter[]} formatters - An array of message formatters.
	 */
	constructor(formatters) {
		this.#formatters = formatters;
	}

	/**
	 * Applies all formatters to the message sequentially.
	 * @param {string} message - The message to format.
	 * @param {import('types.js').MessageFormatterOptions} options - The options for formatting.
	 * @returns {string} The formatted message.
	 */
	format(message, options) {
		for (const formatter of this.#formatters) {
			message = formatter.format(message, options);
		}

		return message;
	}
}

export class PluralMessageFormatter {

	/**
	 * Formats the message based on the pluralization rules of the given language.
	 * @param {string} message - The message to format.
	 * @param {import('types.js').MessageFormatterOptions} options - The options for formatting.
	 * @returns {string} The formatted message.
	 */
	format(message, options) {
		const count = options.parameters?.count;

		if (count === undefined) {
			return message;
		}

		if (!message.includes('|')) {
			if (getNumberOfPluralParts(options.language) > 0) {
				options.report(new Error(`Translator(${options.domain}.${options.key}): Missing plural separator "|" in message.`));
			}
			return message;
		}

		const parts = message.split('|');

		if (parts.length !== getNumberOfPluralParts(options.language)) {
			options.report(new Error(`Translator(${options.domain}.${options.key}): Invalid number of plural parts in message, expected ${getNumberOfPluralParts(options.language)}, ${parts.length} given.`));
		}

		const number = typeof count === 'string' ? parseInt(count, 10) : count;

		if (isNaN(number)) {
			options.report(new Error(`Translator(${options.domain}.${options.key}): Invalid count parameter, ${count} given.`));
			return parts[0];
		}

		const partNumber = getLocaleNumber(options.language, number);
		const part = parts[partNumber];

		if (part == null) {
			options.report(new Error(`Translator(${options.domain}.${options.key}): Missing plural part for language "${options.language}" and number ${number}.`));
			return parts[0];
		}

		return part;
	}
}

export class ParameterMessageFormatter {

	/**
	 * Formats the message by replacing placeholders with parameter values.
	 * @param {string} message - The message to format.
	 * @param {import('types.js').MessageFormatterOptions} options - The options for formatting.
	 * @returns {string} The formatted message.
	 */
	format(message, options) {
		const parameters = options.parameters;

		if (parameters === undefined) {
			return message;
		}

		return message.replace(/\{\s*(.*?)\s*}/g, (_, key) => {
			const val = parameters[key];

			if (val == null) {
				return `{${key}}`;
			}

			return val.toString();
		});
	}
}
