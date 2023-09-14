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
const config = require('../../../../../../config');

const mockedFilePath = resolve(`${__dirname}/../../../../../../shared/dataService/business/network`);
const dataServicePath = resolve(`${__dirname}/../../../../../../shared/dataService`);
const mockedRequestFilePath = resolve(`${__dirname}/../../../../../../shared/utils/request`);

const { mockChannelInfo } = require('../../../constants/transactionEstimateFees');

beforeEach(() => {
	jest.resetModules();

	jest.mock('lisk-service-framework', () => {
		const actualLiskServiceFramework = jest.requireActual('lisk-service-framework');
		return {
			...actualLiskServiceFramework,
			DB: {
				...actualLiskServiceFramework.DB,
				MySQL: {
					...actualLiskServiceFramework.DB.MySQL,
					KVStore: {
						...actualLiskServiceFramework.DB.MySQL.KVStore,
						getKeyValueTable: jest.fn(),
					},
				},
			},
			CacheRedis: jest.fn(),
			CacheLRU: jest.fn(),
		};
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

describe('Test resolveChannelInfo method', () => {
	it('should return channel info', async () => {
		const currentChainID = '04000000';

		jest.mock(mockedFilePath, () => {
			const actual = jest.requireActual(mockedFilePath);
			return {
				...actual,
				getNetworkStatus() {
					return { data: { chainID: currentChainID } };
				},
			};
		});

		jest.mock(mockedRequestFilePath, () => {
			const actual = jest.requireActual(mockedRequestFilePath);
			return {
				...actual,
				requestConnector() {
					return mockChannelInfo;
				},
			};
		});

		const { resolveChannelInfo } = require(dataServicePath);
		const result = await resolveChannelInfo('04000001');
		expect(result).toEqual(mockChannelInfo);
	});

	it('should throw error when current chain and receiving chain is same', async () => {
		const currentChainID = '04000000';

		jest.mock(mockedFilePath, () => {
			const actual = jest.requireActual(mockedFilePath);
			return {
				...actual,
				getNetworkStatus() {
					return { data: { chainID: currentChainID } };
				},
			};
		});

		const { resolveChannelInfo } = require(dataServicePath);
		expect(resolveChannelInfo(currentChainID)).rejects.toThrow();
	});
});
