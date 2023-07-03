/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const fs = require('fs');
const {
	init,
	write,
	read,
	remove,
	list,
	purge,
	exists,
	isFile,
} = require('../../../../shared/helpers/file');

const {
	dynamicFieldsCustomDelimiter,
} = require('../../../constants/csv');

describe('Test filesystem interface', () => {
	let dirPath;
	const testData = dynamicFieldsCustomDelimiter.expectedCsv;

	beforeAll(async () => {
		// Test directory
		dirPath = `${path.dirname(__dirname)}/testDir`;
	});

	afterAll(async () => {
		// Remove test directory
		await fs.rmdirSync(dirPath);
	});

	it('should create a directory when calling init() method', async () => {
		await init({ dirPath });
		const isExists = await exists(dirPath);
		expect(isExists).toBe(true);
	});

	it('should write data to a file when calling write() method', async () => {
		const filePath = `${dirPath}/testfile.csv`;

		// Write data into the file
		await write(filePath, testData);

		// Verify if data is written into the file
		expect((fs.statSync(filePath)).size).toBeGreaterThan(0);
	});

	it('should return the data from a file when calling read() method', async () => {
		const filePath = `${dirPath}/testfile.csv`;

		// Read data from file
		const result = await read(filePath);
		expect(result).toEqual(testData);
	});

	it('should remove a file when calling remove() method', async () => {
		const filePath = `${dirPath}/testfile.csv`;
		let isExists = await exists(filePath);
		expect(isExists).toBe(true);

		await remove(filePath);
		isExists = await exists(filePath);
		expect(isExists).toBe(false);
	});

	it('should return the list of files in a directory when calling list() method', async () => {
		const filePath1 = `${dirPath}/testfile1.csv`;
		const filePath2 = `${dirPath}/testfile2.csv`;

		await write(filePath1, testData);
		await write(filePath2, testData);

		const files = await list(dirPath);
		expect(files.length).toBe(2);
	});

	it('should return false for a directory when calling isFile() method', async () => {
		expect(await isFile(dirPath)).toBe(false);

		const filePath = `${dirPath}/testfile.csv`;
		await write(filePath, testData);
		expect(await isFile(filePath)).toBe(true);
	});

	it('should remove all files in a directory when calling purge() method', async () => {
		let files = await list(dirPath);
		expect(files.length).toBe(3);

		await purge(dirPath, 0);

		files = await list(dirPath);
		expect(files.length).toBe(0);
	});
});
