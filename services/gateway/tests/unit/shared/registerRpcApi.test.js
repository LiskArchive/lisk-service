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
const { registerApi } = require('../../../shared/registerRpcApi');

const { expectedResponseForRegisterRpcApi } = require('../../constants/registerApi');

describe('Test registerApi method', () => {
	const apiNames = ['http-version3', 'http-exports'];
	const config = {
		whitelist: [],
		aliases: {},
	};
	const registeredModuleNames = ['fee', 'interoperability', 'legacy', 'pos', 'random', 'token', 'validators'];

	it('should return correct api info when called with valid inputs', async () => {
		const response = await registerApi(apiNames, config, registeredModuleNames);
		expect(response.events.request).toEqual({
			onBeforeCall: response.events.request.onBeforeCall,
			onAfterCall: response.events.request.onAfterCall,
			...expectedResponseForRegisterRpcApi.events.request,
		});
		expect(typeof response.events.request.onBeforeCall).toEqual('function');
		expect(typeof response.events.request.onAfterCall).toEqual('function');
	});

	it('should throw error when called with null apiNames or config or registeredModuleNames', async () => {
		expect(() => registerApi(null, config, registeredModuleNames)).toThrow();
		expect(() => registerApi(apiNames, null, registeredModuleNames)).toThrow();
		expect(() => registerApi(apiNames, config, null)).toThrow();
	});

	it('should throw error when called with null inputs', async () => {
		expect(() => registerApi(null, null, null)).toThrow();
	});

	it('should throw error when called with undefined apiNames or config or registeredModuleNames', async () => {
		expect(() => registerApi(undefined, config, registeredModuleNames)).toThrow();
		expect(() => registerApi(apiNames, undefined, registeredModuleNames)).toThrow();
		expect(() => registerApi(apiNames, config, undefined)).toThrow();
	});

	it('should throw error when called with undefined inputs', async () => {
		expect(() => registerApi(undefined, undefined, undefined)).toThrow();
	});
});
