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
	const testDir = resolve(`${dirname(__dirname)}/testDir`);

	beforeAll(async () => {
		// Create test directory
		await mkdir(testDir, { recursive: true });
	});

	afterAll(async () => {
		await rm(testDir, { recursive: true, force: true });
	});

	afterEach(async () => {
		await rm(`${testDir}/genesis_block.json`);
		await rm(`${testDir}/apiJson.json`);
	});

	describe('Test downloadAndExtractTarball method', () => {
		const [{ genesisBlockUrl }] = config.networks.LISK.filter(network => network.name === 'testnet');
		it('should download and extract tar file -> valid url', async () => {
			const filePath = `${testDir}/genesis_block.json`;
			expect(exists(filePath)).resolves.toBe(false);
			await downloadAndExtractTarball(genesisBlockUrl, testDir);
			expect(exists(filePath)).resolves.toBe(true);
		});

		it('should throw error -> invalid url', async () => {
			const invalidUrl = 'https://downloads.lisk.com/lisk/testnet/genesis_block_invalid.json';
			expect(downloadAndExtractTarball(invalidUrl, testDir)).rejects.toThrow();
		});

		it('should throw error -> empty string url', async () => {
			expect(downloadAndExtractTarball('', testDir)).rejects.toThrow();
		});

		it('should throw error -> undefined url', async () => {
			expect(downloadAndExtractTarball(undefined, testDir)).rejects.toThrow();
		});

		it('should throw error -> null url', async () => {
			expect(downloadAndExtractTarball(null, testDir)).rejects.toThrow();
		});
	});

	describe('Test downloadJSONFile method', () => {
		it('should download JSON file -> valid url', async () => {
			const url = 'https://raw.githubusercontent.com/LiskHQ/lisk-service/development/services/gateway/apis/http-version3/swagger/apiJson.json';
			const filePath = `${testDir}/apiJson.json`;
			expect(exists(filePath)).resolves.toBe(false);
			await downloadJSONFile(url, filePath);
			expect(exists(filePath)).resolves.toBe(true);
		});

		it('should throw error -> invalid url', async () => {
			const url = 'https://downloads.lisk.com/lisk/testnet/genesis_block.json';
			const filePath = `${testDir}/genesis_block.json`;
			expect(downloadJSONFile(url, filePath)).rejects.toThrow();
		});

		it('should throw error -> empty string url', async () => {
			const filePath = `${testDir}/genesis_block.json`;
			expect(downloadJSONFile('', filePath)).rejects.toThrow();
		});

		it('should throw error -> undefined url', async () => {
			const filePath = `${testDir}/genesis_block.json`;
			expect(downloadJSONFile(undefined, filePath)).rejects.toThrow();
		});

		it('should throw error -> null url', async () => {
			const filePath = `${testDir}/genesis_block.json`;
			expect(downloadJSONFile(null, filePath)).rejects.toThrow();
		});
	});

	describe('Test downloadAndUnzipFile method', () => {
		it('should download and unzip file -> valid url', async () => {
			const [{ genesisBlockUrl }] = config.networks.LISK.filter(network => network.name === 'testnet');
			const filePath = `${testDir}/genesis_block.json`;
			expect(exists(filePath)).resolves.toBe(false);
			await downloadAndUnzipFile(genesisBlockUrl, filePath);
			expect(exists(filePath)).resolves.toBe(true);
		});

		it('should throw error -> invalid url', async () => {
			const url = 'https://downloads.lisk.com/lisk/testnet/service-core-snapshot-invalid.sql.gz';
			const filePath = `${testDir}/service-core-snapshot-invalid.sql`;
			expect(downloadAndUnzipFile(url, filePath)).rejects.toThrow();
		});

		it('should throw error -> empty string url', async () => {
			const filePath = `${testDir}/genesis_block.json`;
			expect(downloadAndUnzipFile('', filePath)).rejects.toThrow();
		});

		it('should throw error -> undefined url', async () => {
			const filePath = `${testDir}/genesis_block.json`;
			expect(downloadAndUnzipFile(undefined, filePath)).rejects.toThrow();
		});

		it('should throw error -> null url', async () => {
			const filePath = `${testDir}/genesis_block.json`;
			expect(downloadAndUnzipFile(null, filePath)).rejects.toThrow();
		});
	});

	describe('Test downloadFile method', () => {
		it('should download file -> valid url', async () => {
			const url = 'https://raw.githubusercontent.com/LiskHQ/lisk-service/development/services/gateway/apis/http-version3/swagger/apiJson.json';
			const filePath = `${testDir}/apiJson.json`;
			expect(exists(filePath)).resolves.toBe(false);
			await downloadFile(url, testDir);
			expect(exists(filePath)).resolves.toBe(true);
		});

		it('should throw error -> invalid url', async () => {
			const url = 'https://downloads.lisk.com/lisk/testnet/genesis_block.json';
			expect(downloadFile(url, testDir)).rejects.toThrow();
		});

		it('should throw error -> empty string url', async () => {
			expect(downloadFile('', testDir)).rejects.toThrow();
		});

		it('should throw error -> undefined url', async () => {
			expect(downloadFile(undefined, testDir)).rejects.toThrow();
		});

		it('should throw error -> null url', async () => {
			expect(downloadFile(null, testDir)).rejects.toThrow();
		});
	});
});
