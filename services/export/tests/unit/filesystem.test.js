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
} = require('../../shared/filesystem');

describe('Test filesystem interface', () => {
	it('Test init method', async () => {
		const dirPath = `${path.dirname(__dirname)}/constants`;
		await init({ dirPath });
		expect(fs.existsSync(`${path.dirname(__dirname)}/constants`)).toBe(true);
	});

	it('Test read and write method', async () => {
		const testData = {
			created_at: 1612965420,
			modified_at: 1612965420,
		};
		const filePath = `${path.dirname(__dirname)}/constants/testfile.json`;
		await write(filePath, testData);
		const result = await read(filePath);
		expect(result).toBeInstanceOf(Object);
		expect(result).toEqual(testData);
	});

	xit('Test remove', async () => {
		const filePath = `${path.dirname(__dirname)}/constants/testfile.json`;
		await remove(filePath);
		expect(fs.existsSync(filePath)).toBe(false);
	});

	it('Test list', async () => {
		const testData = {
			created_at: 1612965420,
			modified_at: 1612965420,
		};

		const filePath1 = `${path.dirname(__dirname)}/constants/testfile1.json`;
		const filePath2 = `${path.dirname(__dirname)}/constants/testfile2.json`;

		await write(filePath1, testData);
		await write(filePath2, testData);

		const files = await list(`${path.dirname(__dirname)}/constants`);
		expect(files).toBeInstanceOf(Array);
		expect(files.length).toBe(3);
	});

	it('Test purge', async () => {
		const dirPath = `${path.dirname(__dirname)}/constants`;
		await purge(dirPath, 1);
	});
});
