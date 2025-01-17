import { defineConfig } from 'vitest/config';
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
	plugins: [svelte()],
	resolve: process.env.VITEST
		? {
			conditions: ['browser']
		}
		: undefined,
	test: {
		include: ['tests/**/*.{test,spec}.svelte.{js,ts}']
	}
});
