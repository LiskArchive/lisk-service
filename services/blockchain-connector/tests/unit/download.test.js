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
const { verifyFileChecksum } = require('../../shared/utils/download');

const genesisBlockFilePath = resolve(`${dirname(__dirname)}/constants/genesis_block.json`);
const checksumFilePath = resolve(`${dirname(__dirname)}/constants/genesis_block.json.SHA256`);
const invalidChecksumFilePath = resolve(`${dirname(__dirname)}/constants/invalid_genesis_block.json.SHA256`);

describe('Unit test for download utility -> verifyFileChecksum method', () => {
	it('should return true in case of valid checksum', async () => {
		const result = await verifyFileChecksum(genesisBlockFilePath, checksumFilePath);
		expect(result).toEqual(true);
	});

	it('should return false in case of invalid checksum', async () => {
		const result = await verifyFileChecksum(genesisBlockFilePath, invalidChecksumFilePath);
		expect(result).toEqual(false);
	});

	it('should return false in case of null filePath', async () => {
		const result = await verifyFileChecksum(null, null);
		expect(result).toEqual(false);
	});

	it('should return false in case of undefined filePath', async () => {
		const result = await verifyFileChecksum(undefined, undefined);
		expect(result).toEqual(false);
	});

	it('should return false in case of empty string filePath', async () => {
		const result = await verifyFileChecksum('', '');
		expect(result).toEqual(false);
	});

	it('should throw error in case of invalid filePath', async () => {
		const invalidFilePath = 'invalid';
		const result = await verifyFileChecksum(invalidFilePath, invalidFilePath);
		expect(result).toEqual(false);
	});
});
