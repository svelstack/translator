type Dictionary = {
	[domain: string]: Record<string, string>;
};

export type TranslatorOptions = {
	language: string;
	fallbackLanguage: string;
	dictionaries: {
		[lang: string]: (() => Promise<Dictionary>) | Dictionary;
	},
	formatters?: MessageFormatter[];
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

	transMessage(message: TranslatableMessage): string;

	protected changed(): void;
}

export interface TypesafeTranslator<Mapping extends Record<string, Record<string, string>>> extends Translator {

	trans<Domain extends keyof Mapping, Key extends keyof Mapping[Domain]>(
		domain: Domain,
		key: Key,
		...rest: Mapping[Domain][Key] extends never ? [parameters?: undefined] : [parameters: Record<Mapping[Domain][Key], string>]
	): string;

}

export type TranslatableMessage = {
	domain: string;
	key: string;
	parameters?: Record<string, string|number>;
};

export function createTranslatableMessageFactory<Mapping extends Record<string, Record<string, string>>>(): <
	Domain extends keyof Mapping,
	Key extends keyof Mapping[Domain]
>(
	domain: Domain,
	key: Key,
	...rest: Mapping[Domain][Key] extends never
		? [parameters?: undefined]
		: [parameters: Record<Mapping[Domain][Key], string>]
) => { domain: Domain, key: Key, parameters: Mapping[Domain][Key] extends never ? undefined : Record<Mapping[Domain][Key], string> };

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

	constructor(settings: { parameterPlaceholder: { start: string; end: string } });

	format(message: string, options: MessageFormatterOptions): string;

}
