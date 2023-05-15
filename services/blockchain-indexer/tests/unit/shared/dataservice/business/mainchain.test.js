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
/* eslint-disable import/no-dynamic-require */
const { resolve } = require('path');
const config = require('../../../../../config');

const mockedFilePath = resolve(`${__dirname}/../../../../../shared/dataService/business/network`);
const dataServicePath = resolve(`${__dirname}/../../../../../shared/dataService`);

beforeEach(() => jest.resetModules());

describe('Test isMainchain method', () => {
	jest.mock('lisk-service-framework', () => {
		const actual = jest.requireActual('lisk-service-framework');
		return {
			...actual,
			CacheRedis: jest.fn(),
			CacheLRU: jest.fn(),
		};
	});

	it('should return false when chainID is undefined', async () => {
		jest.mock(mockedFilePath, () => {
			const actual = jest.requireActual(mockedFilePath);
			return {
				...actual,
				getNetworkStatus() {
					return { data: { chainID: undefined } };
				},
			};
		});

		const { isMainchain } = require(dataServicePath);
		const result = await isMainchain();
		expect(typeof result).toBe('boolean');
		expect(result).toBe(false);
	});

	it('should return false when chainID is null', async () => {
		jest.mock(mockedFilePath, () => {
			const actual = jest.requireActual(mockedFilePath);
			return {
				...actual,
				getNetworkStatus() {
					return { data: { chainID: null } };
				},
			};
		});

		const { isMainchain } = require(dataServicePath);
		const result = await isMainchain();
		expect(typeof result).toBe('boolean');
		expect(result).toBe(false);
	});

	it('should return true when mainchain chainID is valid', async () => {
		jest.mock(mockedFilePath, () => {
			const actual = jest.requireActual(mockedFilePath);
			return {
				...actual,
				getNetworkStatus() {
					return { data: { chainID: '04000000' } };
				},
			};
		});

		const { isMainchain } = require(dataServicePath);
		const result = await isMainchain();
		expect(typeof result).toBe('boolean');
		expect(result).toBe(true);
	});

	it('should return false when sidechain chainID is valid', async () => {
		jest.mock(mockedFilePath, () => {
			const actual = jest.requireActual(mockedFilePath);
			return {
				...actual,
				getNetworkStatus() {
					return { data: { chainID: '04000001' } };
				},
			};
		});

		const { isMainchain } = require(dataServicePath);
		const result = await isMainchain();
		expect(typeof result).toBe('boolean');
		expect(result).toBe(false);
	});

	it('should return false when chainID is valid', async () => {
		jest.mock(mockedFilePath, () => {
			const actual = jest.requireActual(mockedFilePath);
			return {
				...actual,
				getNetworkStatus() {
					return { data: { chainID: 'invalid' } };
				},
			};
		});

		const { isMainchain } = require(dataServicePath);
		const result = await isMainchain();
		expect(typeof result).toBe('boolean');
		expect(result).toBe(false);
	});
});

describe('Test resolveMainchainServiceURL method', () => {
	it('should return devnet mainchain URL when devnet mainchain chainID is valid', async () => {
		const chainID = '04000000';
		jest.mock(mockedFilePath, () => {
			const actual = jest.requireActual(mockedFilePath);
			return {
				...actual,
				getNetworkStatus() {
					return { data: { chainID } };
				},
			};
		});

		const { resolveMainchainServiceURL } = require(dataServicePath);
		const result = await resolveMainchainServiceURL();

		const { serviceURL } = config.networks.LISK.find(c => chainID === c.chainID);
		expect(result).toBe(serviceURL);
	});

	it('should return betanet mainchain URL when betanet mainchain chainID is valid', async () => {
		const chainID = '02000000';
		jest.mock(mockedFilePath, () => {
			const actual = jest.requireActual(mockedFilePath);
			return {
				...actual,
				getNetworkStatus() {
					return { data: { chainID } };
				},
			};
		});

		const { resolveMainchainServiceURL } = require(dataServicePath);
		const result = await resolveMainchainServiceURL();

		const { serviceURL } = config.networks.LISK.find(c => chainID === c.chainID);
		expect(result).toBe(serviceURL);
	});

	it('should return undefined when chainID is invalid', async () => {
		jest.mock(mockedFilePath, () => {
			const actual = jest.requireActual(mockedFilePath);
			return {
				...actual,
				getNetworkStatus() {
					return { data: { chainID: 'invalid' } };
				},
			};
		});

		const { resolveMainchainServiceURL } = require(dataServicePath);
		const result = await resolveMainchainServiceURL();
		expect(result).toBe(undefined);
	});
});
