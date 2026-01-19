import {expect, test} from 'vitest';
import { Translator, createTranslatableMessageFactory, ParameterMessageFormatter } from '../src';

test('sync messages', () => {
	const translator = new Translator({
		language: 'en',
		fallbackLanguage: 'en',
		dictionaries: {
			en: {
				messages: {
					hello: 'Hello',
				},
			},
		},
	});

	expect(translator.language).toBe('en');
	expect(translator.trans('messages', 'hello')).toBe('Hello');
});

test('change language', () => {
	const translator = new Translator({
		language: 'en',
		fallbackLanguage: 'en',
		dictionaries: {
			en: {
				messages: {
					hello: 'Hello',
				}
			},
			de: {
				messages: {
					hello: 'Hallo',
				},
			},
		},
	});

	translator.changeLanguage('de');
	expect(translator.trans('messages', 'hello')).toBe('Hallo');
});

test('non-existing message', () => {
	const translator = new Translator({
		language: 'en',
		fallbackLanguage: 'en',
		dictionaries: {
			en: {
				messages: {},
			},
		},
	});

	expect(translator.trans('messages', 'hello')).toBe('messages.hello');
});

test('parameters', () => {
	const translator = new Translator({
		language: 'en',
		fallbackLanguage: 'en',
		dictionaries: {
			en: {
				messages: {
					hello: 'Hello, {name}',
				},
			},
		},
	});

	expect(translator.trans('messages', 'hello', { name: 'world!' })).toBe('Hello, world!');
});

test('custom parameter placeholder', () => {
	const translator = new Translator({
		language: 'en',
		fallbackLanguage: 'en',
		dictionaries: {
			en: {
				messages: {
					hello: 'Hello, %name%',
				},
			},
		},
		formatters: [
			new ParameterMessageFormatter({ parameterPlaceholder: { start: '%', end: '%' } }),
		],
	});

	expect(translator.trans('messages', 'hello', { name: 'world!' })).toBe('Hello, world!');
});

test('change to language which does not exist', () => {
	const translator = new Translator({
		language: 'en',
		fallbackLanguage: 'en',
		dictionaries: {
			en: {
				messages: {},
			},
		},
	});

	expect(translator.language).toBe('en');
	translator.changeLanguage('de');
	expect(translator.language).toBe('en');
});

test('async messages', async () => {
	const translator = new Translator({
		language: 'en',
		fallbackLanguage: 'en',
		dictionaries: {
			en: () => Promise.resolve({
				messages: {
					hello: 'Hello',
				},
			}),
		},
	});

	expect(translator.language).toBe('en');
	expect(translator.trans('messages', 'hello')).toBe('');

	await translator.wait();

	expect(translator.trans('messages', 'hello')).toBe('Hello');
});

test('async language change', async () => {
	const translator = new Translator({
		language: 'en',
		fallbackLanguage: 'en',
		dictionaries: {
			en: () => Promise.resolve({
				messages: {
					hello: 'Hello',
				},
			}),
			de: () => Promise.resolve({
				messages: {
					hello: 'Hallo',
				},
			}),
		},
	});

	await translator.wait();

	expect(translator.trans('messages', 'hello')).toBe('Hello');

	translator.changeLanguage('de');

	expect(translator.trans('messages', 'hello')).toBe('Hello');
	expect(translator.language).toBe('en');

	await translator.wait();

	expect(translator.trans('messages', 'hello')).toBe('Hallo');
	expect(translator.language).toBe('de');
});

test('plural', () => {
	const translator = new Translator({
		language: 'en',
		fallbackLanguage: 'en',
		dictionaries: {
			en: {
				messages: {
					apple: '{count} apple|{count} apples',
				},
			},
		},
	});

	expect(translator.trans('messages', 'apple', { count: 1 })).toBe('1 apple');
	expect(translator.trans('messages', 'apple', { count: 2 })).toBe('2 apples');
});

test('plural missing', () => {
	let reported = false;

	const translator = new Translator({
		language: 'en',
		fallbackLanguage: 'en',
		dictionaries: {
			en: {
				messages: {
					apple: '{count} apple',
				},
			},
		},
		report() { reported = true },
	});

	expect(translator.trans('messages', 'apple', { count: 1 })).toBe('1 apple');
	expect(translator.trans('messages', 'apple', { count: 2 })).toBe('2 apple');
	expect(reported).toBe(true);
});

test('plural missing part', () => {
	let reported = false;

	const translator = new Translator({
		language: 'cs',
		fallbackLanguage: 'cs',
		dictionaries: {
			cs: {
				messages: {
					apple: '{count} jablko|{count} jablka',
				},
			},
		},
		report() { reported = true },
	});

	expect(translator.trans('messages', 'apple', { count: 1 })).toBe('1 jablko');
	expect(translator.trans('messages', 'apple', { count: 2 })).toBe('2 jablka');
	expect(reported).toBe(true);
	expect(translator.trans('messages', 'apple', { count: 10 })).toBe('10 jablko');
});

test('plural with custom message', () => {
	const translator = new Translator({
		language: 'en',
		fallbackLanguage: 'en',
		dictionaries: {
			en: {
				messages: {
					apple: '{str} apple|{str} apples',
				},
			},
		},
	});

	expect(translator.trans('messages', 'apple', { count: 1, str: 'one' })).toBe('one apple');
	expect(translator.trans('messages', 'apple', { count: 2, str: 'two' })).toBe('two apples');
});

test('transMessage', () => {
	const translator = new Translator({
		language: 'en',
		fallbackLanguage: 'en',
		dictionaries: {
			en: {
				messages: {
					hello: 'Hello, {name}',
				},
			},
		},
	});

	expect(translator.transMessage({ domain: 'messages', key: 'hello', parameters: { name: 'world' } })).toBe('Hello, world');
});

test('transMessage without parameters', () => {
	const translator = new Translator({
		language: 'en',
		fallbackLanguage: 'en',
		dictionaries: {
			en: {
				messages: {
					hello: 'Hello',
				},
			},
		},
	});

	expect(translator.transMessage({ domain: 'messages', key: 'hello' })).toBe('Hello');
});

test('createTranslatableMessageFactory', () => {
	const createMessage = createTranslatableMessageFactory();

	const message = createMessage('messages', 'hello', { name: 'world' });

	expect(message.domain).toBe('messages');
	expect(message.key).toBe('hello');
	expect(message.parameters).toEqual({ name: 'world' });
});

test('createTranslatableMessageFactory without parameters', () => {
	const createMessage = createTranslatableMessageFactory();

	const message = createMessage('messages', 'hello');

	expect(message.domain).toBe('messages');
	expect(message.key).toBe('hello');
	expect(message.parameters).toBeUndefined();
});

test('createTranslatableMessageFactory with transMessage', () => {
	const translator = new Translator({
		language: 'en',
		fallbackLanguage: 'en',
		dictionaries: {
			en: {
				messages: {
					hello: 'Hello, {name}',
				},
			},
		},
	});

	const createMessage = createTranslatableMessageFactory();
	const message = createMessage('messages', 'hello', { name: 'world' });

	expect(translator.transMessage(message)).toBe('Hello, world');
});
