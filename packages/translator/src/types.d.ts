type Dictionary = {
	[domain: string]: Record<string, string>;
};

export type TranslatorOptions = {
	language: string;
	fallbackLanguage: string;
	dictionaries: {
		[lang: string]: (() => Promise<Dictionary>) | Dictionary;
	},
	report?: (error: any) => void;
};

export class Translator {

	constructor(options: TranslatorOptions);

	changeLanguage(val: string): Promise<void>;

	get language(): string;

	/**
	 * Wait for the translations to be loaded.
	 */
	wait(): Promise<void>;

	trans(domain: string, key: string, parameters?: Record<string, string|number>): string;

	protected changed(): void;
}

export interface TypesafeTranslator<Mapping extends Record<string, Record<string, string>>> extends Translator {

	trans<Domain extends keyof Mapping, Key extends keyof Mapping[Domain]>(
		domain: Domain,
		key: Key,
		...rest: Mapping[Domain][Key] extends never ? [parameters?: undefined] : [parameters: Record<Mapping[Domain][Key], string>]
	): string;

}

export interface MessageFormatter {

	format(message: string, options: MessageFormatterOptions): string;

}

export type MessageFormatterOptions = {
	language: string;
	domain: string;
	key: string;
	report: (error: any) => void;
	parameters?: Record<string, string|number>;
};

export class ChainMessageFormatter implements MessageFormatter {

	constructor(formatters: MessageFormatter[]);

	format(message: string, options: MessageFormatterOptions): string;

}

export class PluralMessageFormatter implements MessageFormatter {

	format(message: string, options: MessageFormatterOptions): string;

}

export class ParameterMessageFormatter implements MessageFormatter {

	format(message: string, options: MessageFormatterOptions): string;

}
