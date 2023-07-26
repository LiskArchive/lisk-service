/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
const path = require('path');
const fsPromises = require('node:fs/promises');
const {
	mkdir,
	rmdir,
	rm,
	write,
	read,
	mv,
	stats,
	getFiles,
	getDirectories,
	exists,
	getFilesAndDirs,
	isFile,
} = require('../../src/fs');

const testData = {
	chain_name: 'testApp',
	chain_id: 123,
	network: 'mainnet',
};

describe('Test filesystem util methods', () => {
	const dirPath = `${path.dirname(__dirname)}/testDir`;
	const filePath = `${dirPath}/chain.json`;

	afterAll(async () => {
		// Remove test directory
		await rmdir(dirPath, { recursive: true, force: true });
	});

	it('should make a directory when mkdir() method is called', async () => {
		expect(exists(dirPath)).resolves.toBe(false);
		await mkdir(dirPath);
		expect(exists(dirPath)).resolves.toBe(true);
	});

	it('should reject when dirPath is empty or invalid', async () => {
		await expect(mkdir('')).rejects.toThrow();
		await expect(mkdir(null)).rejects.toThrow();
		await expect(mkdir(123)).rejects.toThrow();
	});

	it('should write to file when write() method is called', async () => {
		expect(exists(filePath)).resolves.toBe(false);

		// Write data into the file
		await write(filePath, JSON.stringify(testData));

		// Verify if data is written into the file
		expect(exists(filePath)).resolves.toBe(true);

		const fileStats = await stats(filePath);
		expect(fileStats.size).toBeGreaterThan(0);
	});

	it('should read from file when read() method is called', async () => {
		expect(exists(filePath)).resolves.toBe(true);
		// Read data from file
		const result = await read(filePath);
		expect(result).toEqual(JSON.stringify(testData));
	});

	it('should get directories when getDirectories() method is called', async () => {
		const availableDirs = await getDirectories(`${path.dirname(__dirname)}`);
		expect(availableDirs.length).toBeGreaterThanOrEqual(1);
		expect(availableDirs).toContain(dirPath);
	});

	it('should get files when getFiles() method is called', async () => {
		const availableFiles = await getFiles(dirPath);
		expect(availableFiles.length).toBeGreaterThanOrEqual(1);
		expect(availableFiles).toContain(filePath);
	});

	it('should get files and directories when getFilesAndDirs() method is called', async () => {
		const subDirPath = path.join(dirPath, 'testDir');
		const subFilePath = path.join(dirPath, 'testFile');
		await mkdir(subDirPath);
		await write(subFilePath, JSON.stringify(testData));

		const availableFilesAndDirs = await getFilesAndDirs(dirPath);
		expect(availableFilesAndDirs).toContain(subDirPath);
		expect(availableFilesAndDirs).toContain(subFilePath);
	});

	it('should move file when mv() method is called', async () => {
		const subDirPath = path.join(dirPath, 'test');
		const subDirPathNew = path.join(dirPath, 'testNew');

		expect(exists(subDirPath)).resolves.toBe(false);
		await mkdir(subDirPath);
		expect(exists(subDirPath)).resolves.toBe(true);

		expect(exists(subDirPathNew)).resolves.toBe(false);
		await mv(subDirPath, subDirPathNew);
		expect(exists(subDirPathNew)).resolves.toBe(true);
	});

	it('should return false for a directory when calling isFile() method', async () => {
		expect(await isFile(dirPath)).toBe(false);

		const tempFilePath = `${dirPath}/testfile.csv`;
		await write(tempFilePath, JSON.stringify(testData));
		expect(await isFile(tempFilePath)).toBe(true);
	});

	it('should resolve with false when filePath is not a string or is empty', async () => {
		await expect(exists(null)).resolves.toBe(false);
		await expect(exists(undefined)).resolves.toBe(false);
		await expect(exists(123)).resolves.toBe(false);
		await expect(exists('')).resolves.toBe(false);
	});

	it('should reject when filePath is not a string or is empty', async () => {
		await expect(write(null, 'content')).rejects.toThrow();
		await expect(write(undefined, 'content')).rejects.toThrow();
		await expect(write(123, 'content')).rejects.toThrow();
		await expect(write('', 'content')).rejects.toThrow();
	});

	it('should reject when directoryPath is not a string or is empty', async () => {
		await expect(getDirectories(null)).rejects.toThrow();
		await expect(getDirectories(undefined)).rejects.toThrow();
		await expect(getDirectories(123)).rejects.toThrow();
		await expect(getDirectories('')).rejects.toThrow();
	});

	it('should reject when directoryPath is not a string or is empty', async () => {
		await expect(getFiles(null)).rejects.toThrow();
		await expect(getFiles(undefined)).rejects.toThrow();
		await expect(getFiles(123)).rejects.toThrow();
		await expect(getFiles('')).rejects.toThrow();
	});

	it('should reject when oldName or newName is not a string or is empty', async () => {
		await expect(mv(null, 'newName')).rejects.toThrow();
		await expect(mv('oldName', null)).rejects.toThrow();
		await expect(mv(undefined, 'newName')).rejects.toThrow();
		await expect(mv('oldName', undefined)).rejects.toThrow();
		await expect(mv(123, 'newName')).rejects.toThrow();
		await expect(mv('oldName', 123)).rejects.toThrow();
		await expect(mv('', 'newName')).rejects.toThrow();
		await expect(mv('oldName', '')).rejects.toThrow();
	});
});

describe('Test rm method', () => {
	const dirPath = `${__dirname}/temp`;

	beforeEach(() => mkdir(dirPath));
	afterAll(() => rmdir(dirPath));

	it('should delete file when called with existing file', async () => {
		// Create file and check existence
		const tempFilePath = `${dirPath}/temp.txt`;
		await fsPromises.writeFile(tempFilePath, 'Hello content!');
		expect(await exists(tempFilePath)).toEqual(true);

		// Delete file
		const response = await rm(tempFilePath);
		expect(response).toEqual(true);
		expect(await exists(tempFilePath)).toEqual(false);
	});

	it('should return false when called with non-existing file', async () => {
		const nonExistingFile = 'sdfsd/werwerwe/sdfsdfs.txt';
		expect(await exists(nonExistingFile)).toEqual(false);

		const response = await rm(nonExistingFile);
		expect(response).toEqual(false);
		expect(await exists(nonExistingFile)).toEqual(false);
	});

	it('should return false when called with a directory path', async () => {
		expect(await exists(dirPath)).toEqual(true);
		const response = await rm(dirPath);
		expect(response).toEqual(false);
		expect(await exists(dirPath)).toEqual(true);
	});

	it('should delete directory when called with a directory path and recursive:true', async () => {
		expect(await exists(dirPath)).toEqual(true);
		const response = await rm(dirPath, { recursive: true });
		expect(response).toEqual(true);
		expect(await exists(dirPath)).toEqual(false);
	});

	it('should return false when called with empty string', async () => {
		const response = await rm('');
		expect(response).toEqual(false);
	});

	it('should throw error when called with null', async () => {
		expect(() => rm(null)).rejects.toThrow();
	});

	it('should throw error when called with undefined', async () => {
		expect(() => rm(undefined)).rejects.toThrow();
	});
});
