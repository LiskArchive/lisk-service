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

const {
	exists,
	mkdir,
	rmdir,
	write,
} = require('../../../../shared/utils/fsUtils');

const { deleteEmptyFoldersAndNonMetaFiles } = require('../../../../shared/deleteNonMetaFiles');

const testData = {
	chain_name: 'testApp',
	chain_id: 123,
	network: 'mainnet',
};

describe('Test filesystem util methods', () => {
	const dirPath = `${path.dirname(__dirname)}/testDir`;
	const subDirPath = path.join(dirPath, 'emptyDir');
	const subFilePath = path.join(subDirPath, '.gitKeep');

	beforeAll(async () => {
		await mkdir(subDirPath);
		await write(subFilePath, JSON.stringify(testData));
	});

	afterAll(async () => {
		// Remove test directory
		await rmdir(dirPath, { recursive: true, force: true });
	});

	it('deleteEmptyFoldersAndNonMetaFiles() method', async () => {
		await deleteEmptyFoldersAndNonMetaFiles(dirPath);
		expect(exists(subFilePath)).resolves.toBe(false);
		expect(exists(subDirPath)).resolves.toBe(false);
	});
});
