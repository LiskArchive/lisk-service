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
jest.setTimeout(50000);
const { resolve, dirname } = require('path');

const {
	downloadAndExtractTarball,
	downloadJSONFile,
	downloadAndUnzipFile,
	downloadFile,
} = require('../../shared/utils/download');

const { exists, mkdir, rm } = require('../../shared/utils/fs');

const config = require('../../config');

describe('Functional tests for download utility', () => {
	const directoryPath = resolve(`${dirname(__dirname)}/testDir`);

	beforeAll(async () => {
		// Create test directory
		await mkdir(directoryPath, { recursive: true });
	});

	afterAll(async () => {
		await rm(directoryPath, { recursive: true, force: true });
	});

	it('should download and extract tar file -> valid url', async () => {
		const [{ genesisBlockUrl }] = config.networks.LISK.filter(network => network.name === 'mainnet');
		const filePath = `${directoryPath}/genesis_block.json`;
		expect(exists(filePath)).resolves.toBe(false);
		await downloadAndExtractTarball(genesisBlockUrl, directoryPath);
		expect(exists(filePath)).resolves.toBe(true);
	});

	it('should download and extract tar file -> invalid url', async () => {
		const url = 'https://downloads.lisk.com/lisk/testnet/genesis_block_invalid.json';
		expect(downloadAndExtractTarball(url, directoryPath)).rejects.toThrow();
	});

	it('should download JSON file -> valid url', async () => {
		const url = 'https://raw.githubusercontent.com/LiskHQ/lisk-service/development/services/gateway/apis/http-version3/swagger/apiJson.json';
		const filePath = `${directoryPath}/apiJson.json`;
		expect(exists(filePath)).resolves.toBe(false);
		await downloadJSONFile(url, filePath);
		expect(exists(filePath)).resolves.toBe(true);
	});

	it('should download JSON file -> invalid url', async () => {
		const url = 'https://downloads.lisk.com/lisk/testnet/genesis_block.json';
		const filePath = `${directoryPath}/genesis_block.json`;
		expect(downloadJSONFile(url, filePath)).rejects.toThrow();
	});

	it('should download and unzip file -> valid url', async () => {
		const snapshotUrl = 'https://snapshots.lisk.io/testnet/service.sql.gz';
		const filePath = `${directoryPath}/service-core-snapshot.sql`;
		expect(exists(filePath)).resolves.toBe(false);
		await downloadAndUnzipFile(snapshotUrl, filePath);
		expect(exists(filePath)).resolves.toBe(true);
	});

	it('should download and unzip file -> invalid url', async () => {
		const url = 'https://downloads.lisk.com/lisk/testnet/service-core-snapshot-invalid.sql.gz';
		const filePath = `${directoryPath}/service-core-snapshot-invalid.sql`;
		expect(downloadAndUnzipFile(url, filePath)).rejects.toThrow();
	});

	it('should download file -> valid url', async () => {
		const url = 'https://raw.githubusercontent.com/LiskHQ/lisk-service/development/services/gateway/apis/http-version3/swagger/apiJson.json';
		const filePath = `${directoryPath}/testFile.json`;
		expect(exists(filePath)).resolves.toBe(false);
		await downloadFile(url, directoryPath);
		expect(exists(filePath)).resolves.toBe(true);
	});

	it('should download file -> invalid url', async () => {
		const url = 'https://downloads.lisk.com/lisk/testnet/genesis_block.json';
		expect(downloadJSONFile(url, directoryPath)).rejects.toThrow();
	});
});
