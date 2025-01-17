import { TypesafeTranslator, Translator, TranslatorOptions } from '@svelstack/translator';

export class SvelteTranslator extends Translator {

	static of(): SvelteTranslator;

	static maybeOf(): SvelteTranslator | undefined;

}

export type TypesafeSvelteTranslatorConstructor<Mapping extends Record<string, Record<string, string>>> = {

	new(options: TranslatorOptions): TypesafeSvelteTranslator<Mapping>;

	of(): TypesafeSvelteTranslator<Mapping>;

	maybeOf(): TypesafeSvelteTranslator<Mapping> | undefined;
};

export interface TypesafeSvelteTranslator<Mapping extends Record<string, Record<string, string>>> extends TypesafeTranslator<Mapping> {

}

