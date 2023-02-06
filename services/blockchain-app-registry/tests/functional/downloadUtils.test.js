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
jest.setTimeout(15000);
const { downloadAndExtractTarball, downloadFile } = require('../../shared/utils/downloadUtils');
const { mkdir, rmdir, exists } = require('../../shared/utils/fsUtils');

const dirPath = `${__dirname}/test_data/`;
const url = 'https://codeload.github.com/LiskHQ/lisk-service/tar.gz/refs/tags/v0.6.4';

beforeEach(async () => mkdir(dirPath));

afterEach(async () => rmdir(dirPath));

describe('Test downloadAndExtractTarball method', () => {
	it('Downloads and extracts correctly for right url and data directory', async () => {
		await downloadAndExtractTarball(url, dirPath);

		expect(await exists(`${dirPath}/lisk-service-0.6.4`)).toEqual(true);
	});
});

describe('Test downloadFile method', () => {
	it('Downloads file for a correct url and directory path', async () => {
		await mkdir(dirPath);
		const fileUrl = 'https://raw.githubusercontent.com/LiskHQ/lisk-service/v0.6.0/known_accounts/known_mainnet.json';
		const filePath = `${dirPath}/test.json`;
		await downloadFile(fileUrl, filePath);

		expect(await exists(filePath)).toEqual(true);
	});
});
