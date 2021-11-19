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
} = require('../../shared/helpers/file');

describe('Test filesystem interface', () => {
	let dirPath;
	const testData = {
		a: '1',
		b: '2',
		c: '3',
		d: '4',
	};

	beforeAll(async () => {
		// Test directory
		dirPath = `${path.dirname(__dirname)}/testDir`;
	});

	afterAll(async () => {
		// Remove test directory
		await fs.rmdirSync(dirPath);
	});

	it('init() method', async () => {
		await init({ dirPath });
		const isExists = await exists(dirPath);
		expect(isExists).toBe(true);
	});

	it('write() method', async () => {
		const filePath = `${dirPath}/testfile.json`;

		// Write data into the file
		await write(filePath, testData);

		// Verify if data is written into the file
		expect((fs.statSync(filePath)).size).toBeGreaterThan(0);
	});

	it('read() method', async () => {
		const filePath = `${dirPath}/testfile.json`;

		// Read data from file
		const result = await read(filePath);
		expect(result).toBeInstanceOf(Object);
		expect(result).toEqual(testData);
	});

	it('remove() method', async () => {
		const filePath = `${dirPath}/testfile.json`;
		let isExists = await exists(filePath);
		expect(isExists).toBe(true);

		await remove(filePath);
		isExists = await exists(filePath);
		expect(isExists).toBe(false);
	});

	it('list() method', async () => {
		const filePath1 = `${dirPath}/testfile1.json`;
		const filePath2 = `${dirPath}/testfile2.json`;

		await write(filePath1, testData);
		await write(filePath2, testData);

		const files = await list(dirPath);
		expect(files.length).toBe(2);
	});

	it('purge() method', async () => {
		let files = await list(dirPath);
		expect(files.length).toBe(2);

		await purge(dirPath, 0);

		files = await list(dirPath);
		expect(files.length).toBe(0);
	});
});
