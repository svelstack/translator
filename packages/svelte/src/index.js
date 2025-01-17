import { Translator } from '@svelstack/translator';
import { getContext } from 'svelte';
import { createSubscriber } from 'svelte/reactivity';

export class SvelteTranslator extends Translator {

	#subscribe;

	constructor(...args) {
		super(...args);

		this.#subscribe = createSubscriber((update) => {
			this.update = update;

			return () => {
				this.update = undefined;
			};
		});
	}

	static of() {
		const val = this.maybeOf();

		if (val === undefined) {
			throw new Error('Translator is not available in the context.');
		}

		return val;
	}

	static maybeOf() {
		return getContext(this) || undefined;
	}

	get language() {
		this.#subscribe();

		return super.language;
	}

	trans(...args) {
		this.#subscribe();

		return super.trans(...args);
	}

	changed() {
		if (this.update) {
			this.update();
		}

		super.changed();
	}
}
