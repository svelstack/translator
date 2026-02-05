import { ChainMessageFormatter, ParameterMessageFormatter, PluralMessageFormatter } from './formatter';

export class Translator {

	/**
	 * @private
	 * @type {Record<string, Record<string, string>> | undefined}
	 */
	translations = undefined;

	/**
	 * @private
	 * @type {Record<string, Record<string, string>> | undefined}
	 */
	fallbackTranslations = undefined;

	/**
	 * @private
	 * @type {Promise<any> | undefined}
	 */
	_promise = undefined;

	/**
	 * @private
	 * @type {Promise<any> | undefined}
	 */
	_fallbackPromise = undefined;

	/**
	 * @private
	 * @type {string}
	 */
	_language;

	/**
	 * @private
	 * @type {(error: any) => void}
	 */
	report;

	/**
	 * @private
	 * @type {ChainMessageFormatter}
	 */
	formatter;

	/**
	 * @param {import('./types.js').TranslatorOptions} options - Configuration options for the Translator.
	 * @throws {Error} If the fallback language is not in the dictionaries.
	 */
	constructor(options) {
		this.options = options;

		if (!(this.options.fallbackLanguage in this.options.dictionaries)) {
			throw new Error(`Fallback language \"${this.options.fallbackLanguage}\" is not available in the dictionaries.`);
		}

		this._language = this.getLanguage(this.options.language);
		this.report = this.options.report || function () {};

		if (Array.isArray(options.formatters)) {
			this.formatter = new ChainMessageFormatter(options.formatters);
		} else {
			this.formatter = new ChainMessageFormatter([
				new PluralMessageFormatter(),
				new ParameterMessageFormatter({ parameterPlaceholder: { start: '{', end: '}' } }),
			]);
		}

		this.load(this._language);

		if (this._language !== this.options.fallbackLanguage) {
			this.loadFallback();
		}
	}

	/**
	 * Changes the current language and reloads translations.
	 * @param {string} val - The new language to switch to.
	 * @returns {Promise<void>} Resolves when the language is successfully changed.
	 */
	async changeLanguage(val) {
		val = this.getLanguage(val);

		if (this._language !== val) {
			await this.load(val);
			this._language = val;
			this.changed();
		}
	}

	/**
	 * Gets the current language.
	 * @returns {string} The currently set language.
	 */
	get language() {
		return this._language;
	}

	/**
	 * Waits for any ongoing translation loading to finish.
	 * @returns {Promise<void>} Resolves when loading is complete.
	 */
	async wait() {
		await Promise.all([this._promise, this._fallbackPromise]);
	}

	/**
	 * Translates a key within a given domain using optional parameters.
	 * @param {string} domain - The domain of the translation key.
	 * @param {string} key - The key to translate.
	 * @param {Record<string, string|number>} [parameters] - Optional parameters for formatting the translation.
	 * @returns {string} The translated string, or a fallback if not found.
	 */
	trans(domain, key, parameters) {
		if (this.translations === undefined) {
			return '';
		}

		const translation = this.translations[domain]?.[key]
			?? this.fallbackTranslations?.[domain]?.[key];

		if (translation === undefined) {
			return `${domain}.${key}`;
		}

		return this.formatter.format(translation, {
			language: this._language,
			domain,
			key,
			report: this.report,
			parameters
		});
	}

	transMessage(message) {
		return this.trans(message.domain, message.key, message.parameters);
	}

	/**
	 * Loads translations for a specified language.
	 * @private
	 * @param {string} lang - The language to load.
	 * @returns {Promise<void>} Resolves when the translations are loaded.
	 */
	async load(lang) {
		const dictionary = this.options.dictionaries[lang];

		if (typeof dictionary === 'function') {
			const promise = this._promise = dictionary();
			this.translations = await promise;
			this._promise = undefined;
		} else {
			this.translations = dictionary;
		}
	}

	/**
	 * Loads fallback translations.
	 * @private
	 * @returns {Promise<void>} Resolves when the fallback translations are loaded.
	 */
	async loadFallback() {
		const fallbackDictionary = this.options.dictionaries[this.options.fallbackLanguage];

		if (typeof fallbackDictionary === 'function') {
			const promise = this._fallbackPromise = fallbackDictionary();
			this.fallbackTranslations = await promise;
			this._fallbackPromise = undefined;
		} else {
			this.fallbackTranslations = fallbackDictionary;
		}
	}

	/**
	 * Determines the appropriate language to use.
	 * @private
	 * @param {string} lang - The desired language.
	 * @returns {string} The language to use, falling back if necessary.
	 */
	getLanguage(lang) {
		return lang in this.options.dictionaries ? lang : this.options.fallbackLanguage;
	}

	/**
	 * Called when the translations/language have changed. Can be overridden in subclasses.
	 * @protected
	 */
	changed() {}
}

export function createTranslatableMessageFactory() {
	return (domain, key, parameters) => {
		return { domain, key, parameters };
	}
}

export { PluralMessageFormatter, ParameterMessageFormatter, ChainMessageFormatter }
