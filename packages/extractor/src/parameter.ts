export function parseParameters(str: string): string[] {
	return Array.from(str.matchAll(/\{\s*(\w+)\s*}/g).map((match) => match[1]));
}
