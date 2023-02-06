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
	exists,
	extractTarBall,
	mkdir,
	read,
	rm,
} = require('../../shared/utils/fs');

const { genesisBlock } = require('../constants/blocks');

describe('Unit tests for filesystem utilities', () => {
	const dirPath = resolve(`${dirname(__dirname)}/testDir`);
	const filePath = resolve(`${process.cwd()}/tests/constants/genesis_block.json`);
	const tarFilePath = resolve(`${process.cwd()}/tests/constants/genesis_block.json.tar.gz`);

	afterAll(async () => {
		// Remove test directory
		await rm(dirPath, { recursive: true, force: true });
	});

	it('mkdir() method', async () => {
		expect(exists(dirPath)).resolves.toBe(false);
		await mkdir(dirPath, { recursive: true });
		expect(exists(dirPath)).resolves.toBe(true);
	});

	it('extractTarBall() method', async () => {
		const outputPath = `${dirPath}/genesis_block.json`;
		expect(exists(outputPath)).resolves.toBe(false);

		// Extract tar file
		await extractTarBall(tarFilePath, dirPath);
		expect(exists(outputPath)).resolves.toBe(true);
	});

	it('read() method', async () => {
		expect(exists(filePath)).resolves.toBe(true);
		// Read data from file
		const result = await read(filePath);
		const parsedResult = JSON.parse(result);
		expect(parsedResult).toMatchObject(genesisBlock);
	});
});
