export function parseParameters(str: string, regexp: RegExp): string[] {
	return Array.from(str.matchAll(regexp).map((match) => match[1]));
}

export function createParameterRegex(placeholderStart: string, placeholderEnd: string): RegExp {
	return new RegExp(`${escapeRegExp(placeholderStart)}\\s*(\\w+)\\s*${escapeRegExp(placeholderEnd)}`, 'g');
}

function escapeRegExp(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
