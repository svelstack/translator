import { readdirSync, statSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export function findFiles(dir: string): string[] {
	return _findFiles(dir, []);
}

export function assertExistsDir(dir: string): void {
	if (!existsSync(dir)) {
		throw new Error(`Directory ${dir} does not exist`);
	}
	const stats = statSync(dir);

	if (!stats.isDirectory()) {
		throw new Error(`${dir} is not a directory`);
	}
}

export function writeToFile(file: string, content: string) {
	writeFileSync(file, content, { encoding: 'utf8' });
}

export function mkdir(dir: string) {
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
}

function _findFiles(dir: string, fileList: string[]): string[] {
	const files = readdirSync(dir);

	files.forEach((file) => {
		const filePath = join(dir, file);
		const stats = statSync(filePath);

		if (stats.isDirectory()) {
			_findFiles(filePath, fileList);
		} else if (stats.isFile()) {
			fileList.push(filePath);
		}
	});

	return fileList;
}
