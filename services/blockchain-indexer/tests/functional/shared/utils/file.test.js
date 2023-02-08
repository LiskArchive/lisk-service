/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
const fs = require('fs');

const {
	getAllDirectories,
	getAllJSFiles,
} = require('../../../../shared/utils/file');

// Utility functions for the tests
const mkdir = async (dirPath) => fs.promises.mkdir(
	dirPath,
	{ recursive: true },
);

const rmdir = async (dirPath) => fs.promises.rmdir(
	dirPath,
	{ recursive: true, force: true },
);

const createFile = async (filePath) => fs.promises.writeFile(filePath, '', { flag: 'w' });

describe('Unit tests for file utilities', () => {
	const nonExistentTestDir = `${__dirname}/nonExistentTestDir`;
	const emptyTestDir = `${__dirname}/emptyTestDir`;
	const testDir = `${__dirname}/testDir`;
	const testSubDirs = ['subDir1', 'subDir2', 'subDir3'];
	const testFiles = ['testFILE1.js', 'testFILE2.js', 'testFILE3.js'];
	const testFilesCamelConsecutiveUpper = ['testFILE1', 'testFILE2', 'testFILE3'];
	const testFilesCamelNoConsecutiveUpper = ['testFile1', 'testFile2', 'testFile3'];
	const testFilesPascalConsecutiveUpper = ['TestFILE1', 'TestFILE2', 'TestFILE3'];
	const testFilesPascalNoConsecutiveUpper = ['TestFile1', 'TestFile2', 'TestFile3'];

	beforeAll(async () => {
		// Create the directories
		await mkdir(emptyTestDir);
		await mkdir(testDir);
		await Promise.all(testSubDirs.map(d => mkdir(`${testDir}/${d}`)));

		// Create the files
		await Promise.all(testFiles.map(f => createFile(`${testDir}/${f}`)));
	});

	afterAll(async () => {
		// Remove all the directories and files
		await rmdir(emptyTestDir);
		await rmdir(testDir);
	});

	describe('Test \'getAllDirectories\'', () => {
		it('Throws error when the source directory does not exist', async () => {
			expect(getAllDirectories(nonExistentTestDir)).rejects.toThrow();
		});

		it('Returns empty list when source directory does not contain sub-directories', async () => {
			const result = await getAllDirectories(emptyTestDir);
			expect(Array.isArray(result)).toBeTruthy();
			expect(result.length).toBe(0);
		});

		it('Returns list of sub-directories contained within the source directory', async () => {
			const result = await getAllDirectories(testDir);
			expect(Array.isArray(result)).toBeTruthy();
			expect(result.length).toBe(testSubDirs.length);
			expect(result).toEqual(testSubDirs);
		});
	});

	describe('Test \'getAllJSFiles\'', () => {
		it('Throws error when the source directory does not exist', async () => {
			expect(getAllJSFiles(nonExistentTestDir)).rejects.toThrow();
		});

		it('Returns empty list when source directory does not contain \'.js\' files', async () => {
			const result = await getAllJSFiles(emptyTestDir);
			expect(result).toBeInstanceOf(Object);
			expect(Object.keys(result).length).toBe(0);
		});

		it('Returns only list of files without the extenstion when source directory contains sub-directories and \'.js\' files', async () => {
			const result = await getAllJSFiles(testDir);
			expect(result).toBeInstanceOf(Object);
			expect(Object.keys(result).length).toBe(testFiles.length);
			expect(Object.keys(result)).toEqual(testFiles.map(f => f.split('.')[0]));
		});

		it('Returns list of files (camelCase and consecutiveUppercase) without the extension when source directory contains \'.js\' files', async () => {
			const result = await getAllJSFiles(testDir, false, true);
			expect(result).toBeInstanceOf(Object);
			expect(Object.keys(result).length).toBe(testFiles.length);
			expect(Object.keys(result)).toEqual(testFilesCamelConsecutiveUpper);
		});

		it('Returns list of files (camelCase and no consecutiveUppercase) without the extension when source directory contains \'.js\' files', async () => {
			const result = await getAllJSFiles(testDir, false, false);
			expect(result).toBeInstanceOf(Object);
			expect(Object.keys(result).length).toBe(testFiles.length);
			expect(Object.keys(result)).toEqual(testFilesCamelNoConsecutiveUpper);
		});

		it('Returns list of files (pascalCase and consecutiveUppercase) without the extension when source directory contains \'.js\' files', async () => {
			const result = await getAllJSFiles(testDir, true, true);
			expect(result).toBeInstanceOf(Object);
			expect(Object.keys(result).length).toBe(testFiles.length);
			expect(Object.keys(result)).toEqual(testFilesPascalConsecutiveUpper);
		});

		it('Returns list of files (pascalCase and no consecutiveUppercase) without the extension when source directory contains \'.js\' files', async () => {
			const result = await getAllJSFiles(testDir, true, false);
			expect(result).toBeInstanceOf(Object);
			expect(Object.keys(result).length).toBe(testFiles.length);
			expect(Object.keys(result)).toEqual(testFilesPascalNoConsecutiveUpper);
		});
	});
});
