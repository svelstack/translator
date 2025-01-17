import { defineConfig } from 'tsup';

export default defineConfig({
	entry: {
		index: 'src/script.ts',
	},
	format: ['cjs', 'esm'],
	target: 'es2021',
	shims: true,
	splitting: false,
	clean: true,
	banner: ({ format }) => {
		if (format === "esm") return ({
			js: `#!/usr/bin/env node\n\nimport { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
		});
		return {
			js: `#!/usr/bin/env node\n`,
		};
	},
});
