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
const path = require('path');
const { ServiceBroker } = require('moleculer');
const fs = require('fs');
const crypto = require('crypto');

const { exists } = require('../../shared/utils/fs');
const config = require('../../config');

const broker = new ServiceBroker({
	transporter: config.transporter,
	logLevel: 'warn',
	requestTimeout: 15 * 1000,
	logger: console,
});

const moduleName = 'token';
const subStoreName = 'userSubstore';

beforeAll(() => broker.start());
afterAll(() => broker.stop());

describe('Genesis Block import tests', () => {
	let genesisBlockFilePath;

	xit('Verify if genesis block is downloaded successfully', async () => {
		const { chainID } = await broker.call('connector.getNetworkStatus');
		genesisBlockFilePath = path.resolve(`${__dirname}/../../data/${chainID}/genesis_block.json.tar.gz`);

		const isExists = await exists(genesisBlockFilePath);
		expect(isExists).toBe(true);
	});

	xit('Validate genesis block', async () => {
		const genesisBlockSHAFilePath = genesisBlockFilePath.concat('.SHA256');
		const isExists = await exists(genesisBlockSHAFilePath);
		expect(isExists).toBe(true);

		const expectedHash = (fs.readFileSync(genesisBlockSHAFilePath, 'utf8')).split(' ')[0];

		const fileStream = fs.createReadStream(genesisBlockFilePath);
		const dataHash = crypto.createHash('sha256');

		const fileHash = await new Promise(resolve => {
			fileStream.on('data', (data) => { dataHash.update(data); });
			fileStream.on('end', () => { resolve(dataHash.digest().toString('hex')); });
		});

		expect(expectedHash).toEqual(fileHash);
	});
});

xdescribe('Test getGenesisAssets method', () => {
	it('should return token module data when called with module:token', async () => {
		const response = await broker.call('connector.getGenesisAssetByModule', { module: moduleName });
		expect(Object.keys(response).length).toBe(4);
	});

	it('should return token module userSubstore data when called with module:token and subStore:userSubstore', async () => {
		const response = await broker.call('connector.getGenesisAssetByModule', { module: moduleName, subStore: subStoreName });
		expect(Object.keys(response).length).toBe(1);
		expect(Object.keys(response)[0]).toBe(subStoreName);
		expect(response[subStoreName].length).toBeGreaterThan(1);
	});

	it('should return token module userSubstore data when called with module:token, subStore:userSubstore, offset:0, limit: 10', async () => {
		const limit = 10;
		const response = await broker.call('connector.getGenesisAssetByModule', { module: moduleName, subStore: subStoreName, offset: 0, limit });
		expect(Object.keys(response).length).toBe(1);
		expect(Object.keys(response)[0]).toBe(subStoreName);
		expect(response[subStoreName].length).toBeGreaterThanOrEqual(1);
		expect(response[subStoreName].length).toBeLessThanOrEqual(limit);
	});
});

xdescribe('Test getGenesisAssetsLength method', () => {
	it('should return all modules when called without any params', async () => {
		const response = await broker.call('connector.getGenesisAssetsLength');
		expect(Object.keys(response).length).toBeGreaterThan(1);
	});

	it('should return token module data length when called with module:token', async () => {
		const response = await broker.call('connector.getGenesisAssetsLength', { module: moduleName });
		expect(Object.keys(response)[0]).toBe(moduleName);
		expect(Object.keys(response[moduleName]).length).toBe(4);
	});

	it('should return token module userSubstore length when called with module:token and subStore:userSubstore', async () => {
		const response = await broker.call('connector.getGenesisAssetsLength', { module: moduleName, subStore: subStoreName });
		expect(Object.keys(response).length).toBe(1);
		expect(Object.keys(response)[0]).toBe(moduleName);
		expect(Object.keys(response[moduleName])[0]).toBe(subStoreName);
		expect(Object.keys(response[moduleName]).length).toBe(1);
	});
});
