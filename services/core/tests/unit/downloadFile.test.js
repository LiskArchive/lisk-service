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
const { Logger } = require('lisk-service-framework');

const {
	downloadAndExtractTarball,
	downloadJSONFile,
} = require('../../shared/downloadFile');

const config = require('../../config');

const logger = Logger();

const directoryPath = path.join(__dirname, 'testDir');

describe('downloadFile utility tests', () => {
	beforeAll(async () => {
		// Create test directory
		await fs.mkdir(directoryPath, (err) => logger.error(err));
	});

	afterAll(async () => {
		// Remove test directory and its content
		await fs.rmdir(
			directoryPath,
			{
				recursive: true,
				force: true,
			},
			(err) => logger.error(err),
		);
	});

	it('downloadAndExtractTarball -> valid url', async () => {
		const [{ genesisBlockUrl }] = config.networks.filter(network => network.name === 'testnet');
		const filePath = `${directoryPath}/genesis_block.json`;
		await downloadAndExtractTarball(genesisBlockUrl, directoryPath);
		const result = !!(await fs.promises.stat(filePath).catch(() => null));
		expect(result).toEqual(true);
	});

	it('downloadAndExtractTarball -> invalid url', async () => {
		const url = 'https://downloads.lisk.com/lisk/testnet/genesis_block_invalid.json';
		expect(downloadAndExtractTarball(url, directoryPath)).rejects.toThrow();
	});

	it('downloadJSONFile -> valid url', async () => {
		const url = 'https://raw.githubusercontent.com/LiskHQ/lisk-service/v0.6.0/known_accounts/known_mainnet.json';
		const filePath = `${directoryPath}/networks.json`;
		await downloadJSONFile(url, filePath);
		const result = !!(await fs.promises.stat(filePath).catch(() => null));
		expect(result).toEqual(true);
	});

	it('downloadJSONFile -> invalid url', async () => {
		const url = 'https://downloads.lisk.com/lisk/testnet/genesis_block.json';
		expect(downloadJSONFile(url, directoryPath)).rejects.toThrow();
	});
});
