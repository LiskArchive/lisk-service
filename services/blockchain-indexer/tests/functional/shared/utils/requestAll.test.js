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
const { ServiceBroker } = require('moleculer');

const requestAll = require('../../../../shared/utils/requestAll');
const request = require('../../../../shared/utils/request');
const config = require('../../../../config');
const { MODULE, MODULE_SUB_STORE } = require('../../../../shared/constants');

const broker = new ServiceBroker({
	transporter: config.transporter,
	logLevel: 'warn',
	requestTimeout: 15 * 1000,
	logger: console,
});

xdescribe('Test requestAll method', () => {
	beforeAll(async () => {
		await broker.start();
		await request.setAppContext({
			requestRpc: (method, params) => new Promise((resolve, reject) => {
				broker
					.call(method, params)
					.then(res => resolve(res))
					.catch(err => {
						console.error(`Error occurred! ${err.message}`);
						reject(err);
					});
			}),
		});
	});
	afterAll(() => broker.stop());

	it('should return proper response', async () => {
		const totalLimit = 27;
		const genesisAsset = await request.requestConnector('getGenesisAssetByModule', { module: MODULE.TOKEN, subStore: MODULE_SUB_STORE.TOKEN.USER, limit: totalLimit });
		const result = await requestAll(request.requestConnector, 'getGenesisAssetByModule', { module: MODULE.TOKEN, subStore: MODULE_SUB_STORE.TOKEN.USER, limit: 10 }, totalLimit);
		expect(result).toBeInstanceOf(Object);
		expect(result).toEqual(genesisAsset);
	});

	it('should throw error -> invalid method', async () => {
		expect(() => requestAll(request.requestConnector, 'invalid', {})).rejects.toThrow();
	});

	it('should throw error -> undefined method', async () => {
		expect(() => requestAll(request.requestConnector, undefined, {})).rejects.toThrow();
	});

	it('should throw error -> null method', async () => {
		expect(() => requestAll(request.requestConnector, null, {})).rejects.toThrow();
	});
});

