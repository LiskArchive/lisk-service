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
const { downloadAndExtractTarball, downloadFile } = require('../../shared/utils/downloadUtils');
const { mkdir, rmdir, exists } = require('../../shared/utils/fsUtils');

const dirPath = `${__dirname}/test_data/`;
const url = 'https://codeload.github.com/LiskHQ/lisk-service/tar.gz/refs/tags/v0.6.4';

beforeEach(async () => mkdir(dirPath));

afterEach(async () => rmdir(dirPath));

describe('Test downloadAndExtractTarball method', () => {
	it('Downloads and extracts correctly when url and data directory is valid', async () => {
		await downloadAndExtractTarball(url, dirPath);
		expect(await exists(`${dirPath}/lisk-service-0.6.4`)).toEqual(true);
	});

	it('Throws error when url is invalid', async () => {
		expect(downloadAndExtractTarball(`${url}/invalid_file`, dirPath)).rejects.toThrow();
	});

	it('Throws error when url is undefined', async () => {
		expect(downloadAndExtractTarball(undefined, dirPath)).rejects.toThrow();
	});

	it('Throws error when url is null', async () => {
		expect(downloadAndExtractTarball(null, dirPath)).rejects.toThrow();
	});

	it('Throws error when dirPath is undefined', async () => {
		expect(downloadAndExtractTarball(url, undefined)).rejects.toThrow();
	});

	it('Throws error when dirPath is null', async () => {
		expect(downloadAndExtractTarball(url, null)).rejects.toThrow();
	});
});

describe('Test downloadFile method', () => {
	const fileUrl = 'https://raw.githubusercontent.com/LiskHQ/lisk-service/v0.6.0/known_accounts/known_mainnet.json';
	const filePath = `${dirPath}/test.json`;

	it('Downloads file for a correct url and file path', async () => {
		await mkdir(dirPath);
		await downloadFile(fileUrl, filePath);

		expect(await exists(filePath)).toEqual(true);
		await rmdir(filePath);
	});

	it('Throws error when url is invalid', async () => {
		expect(downloadFile(`${fileUrl}/invalid_file`, filePath)).rejects.toThrow();
	});

	it('Throws error when url is undefined', async () => {
		expect(downloadFile(undefined, filePath)).rejects.toThrow();
	});

	it('Throws error when url is null', async () => {
		expect(downloadFile(null, filePath)).rejects.toThrow();
	});

	it('Throws error when file path is undefined', async () => {
		expect(downloadFile(url, undefined)).rejects.toThrow();
	});

	it('Throws error when file path is null', async () => {
		expect(downloadFile(url, null)).rejects.toThrow();
	});
});
