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
const path = require('path');
const fs = require('fs');

const {
	exists,
	mkdir,
	getDirectories,
	read,
	write,
	getFiles,
	rename,
} = require('../../shared/utils/fsUtils');

const testData = {
	chain_name: 'testApp',
	chain_id: 123,
	network: 'mainnet',
};

describe('Test filesystem util methods', () => {
	let dirPath;
	beforeAll(async () => {
		// Test directory
		dirPath = `${path.dirname(__dirname)}/testDir`;
	});

	afterAll(async () => {
		// Remove test directory
		await fs.rmdirSync(dirPath, { recursive: true, force: true });
	});

	it('mkdir() method', async () => {
		await mkdir(dirPath);
		const isExists = await exists(dirPath);
		expect(isExists).toBe(true);
	});

	it('write() method', async () => {
		const filePath = `${dirPath}/chain.json`;

		// Write data into the file
		await write(filePath, JSON.stringify(testData));

		// Verify if data is written into the file
		expect((fs.statSync(filePath)).size).toBeGreaterThan(0);
	});

	it('read() method', async () => {
		const filePath = `${dirPath}/chain.json`;

		// Read data from file
		const result = await read(filePath);
		expect(result).toEqual(JSON.stringify(testData));
	});

	it('getDirectories() method', async () => {
		const availableDir = await getDirectories(`${path.dirname(__dirname)}`);
		expect(availableDir.length).toBeGreaterThanOrEqual(1);
	});

	it('getFiles() method', async () => {
		const availableFiles = await getFiles(dirPath);
		expect(availableFiles.length).toBeGreaterThanOrEqual(1);
	});

	it('rename() method', async () => {
		const oldDir = dirPath;
		dirPath = `${path.dirname(__dirname)}/testDirNew`;
		await rename(oldDir, dirPath);

		const isExists = await exists(dirPath);
		expect(isExists).toBe(true);
	});
});
