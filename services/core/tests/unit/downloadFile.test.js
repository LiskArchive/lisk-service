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
const path = require('path');

const {
	downloadAndExtractTarball,
	downloadJSONFile,
} = require('../../shared/downloadFile');

const config = require('../../config');

const directoryPath = path.join(__dirname, 'testDir');

describe('downloadFile utility tests', () => {
	beforeAll(async () => {
		// Create test directory
		await fs.mkdirSync(directoryPath);
	});

	afterAll(async () => {
		// Remove files from test directory
		await fs.readdirSync(directoryPath).forEach(file => fs.unlinkSync(`${directoryPath}/${file}`));
		// Remove test directory
		await fs.rmdirSync(directoryPath);
	});

	it('downloadAndExtractTarball -> valid url', async () => {
		const url = config.networks.filter(acc => acc.name === 'testnet')[0];
		const filePath = `${directoryPath}/genesis_block.json`;
		await downloadAndExtractTarball(url.genesisBlockUrl, directoryPath);
		const result = !!(await fs.promises.stat(filePath).catch(() => null));
		expect(result).toEqual(true);
	});

	it('downloadAndExtractTarball -> invalid url', async () => {
		const url = 'https://downloads.lisk.com/lisk/testnet/genesis_block1.json.tar.gz';
		expect(downloadAndExtractTarball(url, directoryPath)).rejects.toThrow();
	});

	xit('downloadJSONFile -> valid url', async () => {
		const url = 'https://github.com/LiskHQ/lisk-service/blob/development/known_accounts/networks.json';
		const filePath = `${directoryPath}/networks.json`;
		await downloadJSONFile(url, directoryPath);
		const result = !!(await fs.promises.stat(filePath).catch(() => null));
		expect(result).toEqual(true);
	});

	it('downloadJSONFile -> invalid url', async () => {
		const url = 'https://downloads.lisk.com/lisk/testnet/genesis_block.json';
		expect(downloadJSONFile(url, directoryPath)).rejects.toThrow();
	});
});
