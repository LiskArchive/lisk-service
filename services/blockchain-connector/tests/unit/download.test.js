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
const { resolve } = require('path');
const { verifyFileChecksum } = require('../../shared/utils/download');

const genesisBlockFilePath = resolve(`${process.cwd()}/tests/constants/genesis_block.json`);
const checksumFilePath = resolve(`${process.cwd()}/tests/constants/genesis_block.json.SHA256`);
const invalidChecksumFilePath = resolve(`${process.cwd()}/tests/constants/invalid_genesis_block.json.SHA256`);

describe('Unit test for download utility -> verifyFileChecksum method', () => {
	it('should return true in case of valid checksum', async () => {
		const result = await verifyFileChecksum(genesisBlockFilePath, checksumFilePath);
		expect(result).toEqual(true);
	});

	it('should return false in case of invalid checksum', async () => {
		const result = await verifyFileChecksum(genesisBlockFilePath, invalidChecksumFilePath);
		expect(result).toEqual(false);
	});
});
