import { expect, test } from 'vitest';
import { flushSync } from "svelte";
import { SvelteTranslator } from "../src/index.js";

test('reactive trans()', () => {
	const translator = new SvelteTranslator({
		language: 'en',
		fallbackLanguage: 'en',
		dictionaries: {
			en: {
				messages: {
					hello: 'Hello',
				},
			},
			de: {
				messages: {
					hello: 'Hallo',
				},
			}
		},
	});

	effectRootAsync(async () => {
		let history = [];

		$effect(() => {
			history.push(translator.trans('messages', 'hello'));
		});

		expect(history).toEqual(['Hello']);

		await translator.changeLanguage('de');

		expect(history).toEqual(['Hello']);

		flushSync();

		expect(history).toEqual(['Hello', 'Hallo']);
	});
});

test('reactive language', () => {
	const translator = new SvelteTranslator({
		language: 'en',
		fallbackLanguage: 'en',
		dictionaries: {
			en: {
				messages: {
					hello: 'Hello',
				},
			},
			de: {
				messages: {
					hello: 'Hallo',
				},
			}
		},
	});

	effectRootAsync(async () => {
		let history = [];

		$effect(() => {
			history.push(translator.language);
		});

		expect(history).toEqual(['en']);

		await translator.changeLanguage('de');

		expect(history).toEqual(['en']);

		flushSync();

		expect(history).toEqual(['en', 'de']);
	});
});

export async function effectRootAsync(fn) {
	let promise;

	const cleanup = $effect.root(() => {
		promise = fn();
	});

	const promiseCleanup = await promise;

	cleanup();

	if (promiseCleanup) {
		promiseCleanup();
	}
}
