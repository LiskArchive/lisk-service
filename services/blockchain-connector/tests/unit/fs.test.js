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
	const testDir = resolve(`${dirname(__dirname)}/testDir`);
	const JsonfilePath = resolve(`${dirname(__dirname)}/constants/genesis_block.json`);
	const tarFilePath = resolve(`${dirname(__dirname)}/constants/genesis_block.json.tar.gz`);

	// Remove test directory
	afterAll(async () => rm(testDir, { recursive: true, force: true }));

	describe('Test mkdir method', () => {
		it('should create directory', async () => {
			expect(exists(testDir)).resolves.toBe(false);
			await mkdir(testDir, { recursive: true });
			expect(exists(testDir)).resolves.toBe(true);
		});

		it('should throw error -> undefined directory path', async () => {
			expect(mkdir(undefined, { recursive: true })).rejects.toThrow();
		});

		it('should throw error -> null directory path', async () => {
			expect(mkdir(null, { recursive: true })).rejects.toThrow();
		});
	});

	describe('Test extractTarBall method', () => {
		it('should extract tar file', async () => {
			const outputPath = `${testDir}/genesis_block.json`;
			expect(exists(outputPath)).resolves.toBe(false);

			// Extract tar file
			await extractTarBall(tarFilePath, testDir);
			expect(exists(outputPath)).resolves.toBe(true);
		});

		it('should throw error -> invalid filepath', async () => {
			const filePath = 'invalid';
			expect(extractTarBall(filePath, testDir)).rejects.toThrow();
		});

		it('should throw error -> undefined tar filepath', async () => {
			expect(extractTarBall(undefined, testDir)).rejects.toThrow();
		});

		it('should throw error -> undefined directoryPath', async () => {
			expect(extractTarBall(tarFilePath, undefined)).rejects.toThrow();
		});

		it('should throw error -> null tar filepath', async () => {
			expect(extractTarBall(null, testDir)).rejects.toThrow();
		});

		it('should throw error -> null directoryPath', async () => {
			expect(extractTarBall(tarFilePath, null)).rejects.toThrow();
		});

		it('should throw error -> empty string tar filepath', async () => {
			expect(extractTarBall('', testDir)).rejects.toThrow();
		});

		it('should throw error -> empty string directoryPath', async () => {
			expect(extractTarBall(tarFilePath, '')).rejects.toThrow();
		});
	});

	describe('Test read method', () => {
		it('should read data from file', async () => {
			expect(exists(JsonfilePath)).resolves.toBe(true);
			// Read data from file
			const result = await read(JsonfilePath);
			const parsedResult = JSON.parse(result);
			expect(parsedResult).toMatchObject(genesisBlock);
		});

		it('should throw error -> invalid filepath', async () => {
			const filePath = 'invalid';
			expect(read(filePath)).rejects.toThrow();
		});

		it('should throw error -> undefined filepath', async () => {
			expect(read(undefined)).rejects.toThrow();
		});

		it('should throw error -> null filepath', async () => {
			expect(read(null)).rejects.toThrow();
		});

		it('should throw error -> empty string filepath', async () => {
			expect(read('')).rejects.toThrow();
		});
	});
});
