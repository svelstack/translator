# TypeSafe Internationalization

Features:
- Converting translations from YAML to .ts files
- Loading translations from .ts files
- Variable interpolation
- Typechecking for keys and domains
- Typechecking for variable interpolation
- Pluralization support
- Svelte5 plugin

## Installation

```bash
npm i @svelstack/translator
npm i @svelstack/translator-svelte # optional
```

## Standalone usage

First, create a YAML file with translations in `translations/domain.en.yaml`:
```yaml
hello: 'Hello!'
advanced:
  hello: 'Hello, {name}!'
```

Generate dictionaries, d.ts files:

```bash
npx @svelstack/translator-extractor translations output
```

The output will be:
```
- dictionary
    - en.ts
- types.d.ts
- dictionaries.ts
```

Create instance of Translator:

```typescript
import { Translator } from '@svelstack/translator';
import { dictionaries } from './output/dictionaries';

const translator = new Translator({
	language: 'en',
	fallbackLanguage: 'en',
	dictionaries,
});

// first argument is a domain (from filename), second is a key
console.log(translator.trans('domain', 'hello')); // Hello!
console.log(translator.trans('domain', 'advanced.hello', { name: 'John' })); // Hello, John!
```

## Typechecking

```typescript
import { Translator } from '@svelstack/translator';
import { dictionaries } from './output/dictionaries';
import type { MappingForTranslator } from './output/types';

export type AppTranslator = TypesafeTranslator<MappingForTranslator>;

const translator = new Translator({
	language: 'en',
	fallbackLanguage: 'en',
	dictionaries,
}) as AppTranslator;

translator.trans('domain', 'hello'); // IDE will suggest domains, keys and variables

translator.trans('messages', 'hello'); // Error: messages is not a valid domain
translator.trans('domain', 'hello', {}); // Error: hello does not accept variables
translator.trans('domain', 'advanced.hello'); // Error: advanced.hello requires variables 
translator.trans('domain', 'advanced.hello', { name: 'John', extra: '' }); // Error: unexpected variable extra

```

## Svelte

```sveltehtml
<script lang="ts">
	import { SvelteTranslator, type TypesafeSvelteTranslatorConstructor } from '@svelstack/translator-svelte';
	import { dictionaries } from './output/dictionaries';
	import type { MappingForTranslator } from './output/types';
	import { setContext } from 'svelte';

	export const AppTranslator = SvelteTranslator as TypesafeSvelteTranslatorConstructor<MappingForTranslator>;

	const translator = new AppTranslator({
		language: 'en',
		fallbackLanguage: 'en',
		dictionaries,
	});
	
	setContext(AppTranslator, translator);
</script>

<!-- Translations are loaded asynchronously -->
{#await translator.wait()}
    Loading translations...
{:then _}
    ....
{/await}

{translator.trans('domain', 'hello')} <!-- Fully reactive -->
{translator.language} <!-- Fully reactive -->

<button onclick={() => translator.changeLanguage('de')}>Change language</button>
```

Another component:
```sveltehtml
<script lang="ts">
    const translator = AppTranslator.of();
</script>

{translator.trans('domain', 'hello')}
```
