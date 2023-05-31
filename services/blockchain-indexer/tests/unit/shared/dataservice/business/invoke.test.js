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

const mockedFilePath = resolve(`${__dirname}/../../../../../shared/constants`);

jest.mock('../../../../../shared/constants', () => {
	const { registeredEndpoints, engineEndpoints, allRegisteredEndpoints } = require('../../../../constants/endpoints');
	const { metadata } = require('../../../../constants/metadata');
	const actual = jest.requireActual(mockedFilePath);
	return {
		...actual,
		getAllRegisteredEndpoints() { return allRegisteredEndpoints; },
		getRegisteredEndpoints() { return registeredEndpoints; },
		getEngineEndpoints() { return engineEndpoints; },
		getSystemMetadata() { return metadata; },
	};
});

const { checkIfEndpointRegistered, validateEndpointParams } = require('../../../../../shared/dataService/business/invoke');

describe('Test checkIfEndpointRegistered method', () => {
	it('should return true when called with valid registered endpoint', async () => {
		const endpoint = 'chain_getBlockByHeight';
		const isRegisteredEndpoint = await checkIfEndpointRegistered(endpoint);
		expect(isRegisteredEndpoint).toBe(true);
	});

	it('should return false when called with valid non-registered endpoint', async () => {
		const endpoint = 'system_getBlockByHeight';
		const isRegisteredEndpoint = await checkIfEndpointRegistered(endpoint);
		expect(isRegisteredEndpoint).toBe(false);
	});

	it('should return false when endpoint is null', async () => {
		const isRegisteredEndpoint = await checkIfEndpointRegistered(null);
		expect(isRegisteredEndpoint).toBe(false);
	});

	it('should return false when endpoint is undefined', async () => {
		const isRegisteredEndpoint = await checkIfEndpointRegistered(undefined);
		expect(isRegisteredEndpoint).toBe(false);
	});
});

describe('Test validateEndpointParams method', () => {
	it('should resolve when called with valid endpoint with valid params', async () => {
		const endpointParams = {
			endpoint: 'chain_getBlockByHeight',
			params: {
				height: 10,
			},
		};
		expect(validateEndpointParams(endpointParams)).resolves.toBe(undefined);
	});

	it('should resolve when called with valid endpoint which require no params', async () => {
		const endpointParams = {
			endpoint: 'system_getNodeInfo',
			params: {},
		};
		expect(validateEndpointParams(endpointParams)).resolves.toBe(undefined);
	});

	it('should resolve when called with valid endpoint with no params', async () => {
		const endpointParams = { endpoint: 'system_getNodeInfo' };
		expect(validateEndpointParams(endpointParams)).resolves.toBe(undefined);
	});

	it('should resolve when called with valid endpoint params', async () => {
		const endpointParams = {
			endpoint: 'auth_getAuthAccount',
			params: {
				address: 'lskt62aft4puvypbjauw5udysh4gktefxsakp6edg',
			},
		};
		expect(validateEndpointParams(endpointParams)).resolves.toBe(undefined);
	});

	it('should reject when called with valid endpoint with invalid params', async () => {
		const endpointParams = {
			endpoint: 'system_getNodeInfo',
			params: {
				height: 10,
			},
		};
		expect(validateEndpointParams(endpointParams)).rejects.toThrow();
	});

	it('should reject when called with invalid endpoint params', async () => {
		const endpointParams = {
			endpoint: 'chain_getBlockByHeight',
			params: {
				id: 'd6218c25b1979378f6154fb96de3435787e224ff44271d1dc73452bf26b71314',
			},
		};
		expect(validateEndpointParams(endpointParams)).rejects.toThrow();
	});

	it('should reject when endpoint params are undefined', async () => {
		expect(validateEndpointParams(undefined)).rejects.toThrow();
	});

	it('should reject when endpoint params arw null', async () => {
		expect(validateEndpointParams(null)).rejects.toThrow();
	});
});
