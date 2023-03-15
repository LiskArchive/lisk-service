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

const {
	exists,
	mkdir,
	rmdir,
	getDirectories,
	read,
	write,
	getFiles,
	rename,
	stats,
} = require('../../../../shared/utils/fsUtils');

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

	it('mkdir() method', async () => {
		expect(exists(dirPath)).resolves.toBe(false);
		await mkdir(dirPath);
		expect(exists(dirPath)).resolves.toBe(true);
	});

	it('write() method', async () => {
		expect(exists(filePath)).resolves.toBe(false);

		// Write data into the file
		await write(filePath, JSON.stringify(testData));

		// Verify if data is written into the file
		expect(exists(filePath)).resolves.toBe(true);

		const fileStats = await stats(filePath);
		expect(fileStats.size).toBeGreaterThan(0);
	});

	it('read() method', async () => {
		expect(exists(filePath)).resolves.toBe(true);
		// Read data from file
		const result = await read(filePath);
		expect(result).toEqual(JSON.stringify(testData));
	});

	it('getDirectories() method', async () => {
		const availableDirs = await getDirectories(`${path.dirname(__dirname)}`);
		expect(availableDirs.length).toBeGreaterThanOrEqual(1);
		expect(availableDirs).toContain(dirPath);
	});

	it('getFiles() method', async () => {
		const availableFiles = await getFiles(dirPath);
		expect(availableFiles.length).toBeGreaterThanOrEqual(1);
		expect(availableFiles).toContain(filePath);
	});

	it('rename() method', async () => {
		const subDirPath = path.join(dirPath, 'test');
		const subDirPathNew = path.join(dirPath, 'testNew');

		expect(exists(subDirPath)).resolves.toBe(false);
		await mkdir(subDirPath);
		expect(exists(subDirPath)).resolves.toBe(true);

		expect(exists(subDirPathNew)).resolves.toBe(false);
		await rename(subDirPath, subDirPathNew);
		expect(exists(subDirPathNew)).resolves.toBe(true);
	});
});
