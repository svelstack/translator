import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.js'],
	format: ['esm'],
	splitting: true,
	clean: true,
	dts: false,
})
