import { parse } from 'yaml';

export interface Loader {

	supports(file: string): boolean;

	load(contents: string): any;

}

export class YamlLoader implements Loader {

	supports(file: string) {
		return file.endsWith('.yaml') || file.endsWith('.yml');
	}

	load(contents: string) {
		return parse(contents);
	}

}
