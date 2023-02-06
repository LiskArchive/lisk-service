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
jest.setTimeout(25000);
const fs = require('fs');
const path = require('path');
const { Logger } = require('lisk-service-framework');

const {
	downloadAndExtractTarball,
	downloadJSONFile,
	downloadAndUnzipFile,
	downloadFile,
} = require('../../shared/utils/download');

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
		const [{ genesisBlockUrl }] = config.networks.LISK.filter(network => network.name === 'mainnet');
		const filePath = `${directoryPath}/genesis_block.json`;
		await downloadAndExtractTarball(genesisBlockUrl, directoryPath);
		const isFileExists = !!(await fs.promises.stat(filePath).catch(() => null));
		expect(isFileExists).toEqual(true);
	});

	it('downloadAndExtractTarball -> invalid url', async () => {
		const url = 'https://downloads.lisk.com/lisk/testnet/genesis_block_invalid.json';
		expect(downloadAndExtractTarball(url, directoryPath)).rejects.toThrow();
	});

	it('downloadJSONFile -> valid url', async () => {
		const url = 'https://raw.githubusercontent.com/LiskHQ/lisk-service/v0.6.0/known_accounts/known_mainnet.json';
		const filePath = `${directoryPath}/testFile1.json`;
		await downloadJSONFile(url, filePath);
		const isFileExists = !!(await fs.promises.stat(filePath).catch(() => null));
		expect(isFileExists).toEqual(true);
	});

	it('downloadJSONFile -> invalid url', async () => {
		const url = 'https://downloads.lisk.com/lisk/testnet/genesis_block.json';
		const filePath = `${directoryPath}/genesis_block.json`;
		expect(downloadJSONFile(url, filePath)).rejects.toThrow();
	});

	it('downloadAndUnzipFile -> valid url', async () => {
		const snapshotUrl = 'https://snapshots.lisk.io/testnet/service.sql.gz';
		const filePath = `${directoryPath}/service-core-snapshot.sql`;
		await downloadAndUnzipFile(snapshotUrl, filePath);
		const isFileExists = !!(await fs.promises.stat(filePath).catch(() => null));
		expect(isFileExists).toEqual(true);
	});

	it('downloadAndUnzipFile -> invalid url', async () => {
		const url = 'https://downloads.lisk.com/lisk/testnet/service-core-snapshot-invalid.sql.gz';
		const filePath = `${directoryPath}/service-core-snapshot-invalid.sql`;
		expect(downloadAndUnzipFile(url, filePath)).rejects.toThrow();
	});

	it('downloadFile -> valid url', async () => {
		const url = 'https://raw.githubusercontent.com/LiskHQ/lisk-service/v0.6.0/known_accounts/known_mainnet.json';
		const filePath = `${directoryPath}/known_mainnet.json`;
		await downloadFile(url, directoryPath);
		const isFileExists = !!(await fs.promises.stat(filePath).catch(() => null));
		expect(isFileExists).toEqual(true);
	});

	it('downloadFile -> invalid url', async () => {
		const url = 'https://downloads.lisk.com/lisk/testnet/genesis_block.json';
		expect(downloadJSONFile(url, directoryPath)).rejects.toThrow();
	});
});
