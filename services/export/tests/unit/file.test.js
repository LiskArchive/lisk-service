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
} = require('../../shared/helpers/file');

describe('Test filesystem interface', () => {
	let dirPath;
	beforeAll(async () => {
		// Create test directory
		dirPath = `${path.dirname(__dirname)}/testDir`;
	});

	afterAll(async () => {
		// Remove test directory
		await fs.rmdirSync(dirPath);
	});

	it('Test init method', async () => {
		expect(fs.existsSync(dirPath)).toBe(false);

		// Create directory
		await init({ dirPath });
		expect(fs.existsSync(dirPath)).toBe(true);
	});

	it('Test read and write method', async () => {
		const testData = {
			created_at: 1612965420,
			modified_at: 1612965420,
		};

		const filePath = `${dirPath}/testfile.json`;

		// Write data into the file
		await write(filePath, testData);

		// Read data from file
		const result = await read(filePath);
		expect(result).toBeInstanceOf(Object);
		expect(result).toEqual(testData);
	});

	it('Test remove', async () => {
		const filePath = `${dirPath}/testfile.json`;
		expect(fs.existsSync(filePath)).toBe(true);
		await remove(filePath).then(() => expect(fs.existsSync(filePath)).toBe(false));
	});

	it('Test list', async () => {
		const testData = {
			created_at: 1612965420,
			modified_at: 1612965420,
		};

		const filePath1 = `${dirPath}/testfile1.json`;
		const filePath2 = `${dirPath}/testfile2.json`;

		await write(filePath1, testData);
		await write(filePath2, testData);

		const files = await list(dirPath);
		expect(files.length).toBe(2);
	});

	it('Test purge', async () => {
		let files = await list(dirPath);
		expect(files.length).toBe(2);

		await purge(dirPath, 0);

		files = await list(dirPath);
		expect(files.length).toBe(0);
	});
});
