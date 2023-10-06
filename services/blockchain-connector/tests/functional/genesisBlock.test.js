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
const { ServiceBroker } = require('moleculer');
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

describe('Test getGenesisAssets method', () => {
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

describe('Test getGenesisAssetsLength method', () => {
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
