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

const {
	mockedMainchainID,
	mockedBlockchainAppsValidResponse,
	mockedEscrowedAmounts,
	mockedBlockchainAppsDatabaseRes,
	mockedNetworkStatus,
} = require('../../../constants/blockchainApps');

const mockNetworkPath = resolve(
	`${__dirname}/../../../../../../shared/dataService/business/network`,
);
const mockMainchainPath = resolve(
	`${__dirname}/../../../../../../shared/dataService/business/interoperability/mainchain`,
);
const mockRequestPath = resolve(`${__dirname}/../../../../../../shared/utils/request`);
const mockBlockchainAppsPath = resolve(
	`${__dirname}/../../../../../../shared/dataService/business/interoperability/blockchainApps`,
);

describe('getBlockchainApps', () => {
	beforeEach(() => {
		jest.resetModules();
		jest.clearAllMocks();
	});

	it('should fetch and process blockchain applications', async () => {
		const params = {
			limit: 10,
			offset: 0,
		};

		jest.mock('lisk-service-framework', () => ({
			DB: {
				MySQL: {
					getTableInstance: jest.fn(() => ({
						find: jest.fn(() => mockedBlockchainAppsDatabaseRes),
						count: jest.fn(() => mockedBlockchainAppsValidResponse.meta.count),
					})),
				},
			},
		}));

		jest.mock(mockNetworkPath, () => ({
			getNetworkStatus: jest.fn(() => mockedNetworkStatus),
		}));

		jest.mock(mockRequestPath, () => ({
			requestConnector: jest.fn(() => mockedEscrowedAmounts),
		}));

		jest.mock(mockMainchainPath, () => ({
			getMainchainID: jest.fn(() => mockedMainchainID),
		}));

		const { getBlockchainApps } = require(mockBlockchainAppsPath);
		const result = await getBlockchainApps(params);
		expect(result.data).toHaveLength(1);
		expect(result.meta.count).toBe(1);
		expect(result).toEqual(mockedBlockchainAppsValidResponse);
	});

	it('should throw an error if the database is not reachable', async () => {
		const params = {
			limit: 10,
			offset: 0,
		};

		jest.mock('lisk-service-framework', () => ({
			DB: {
				MySQL: {
					getTableInstance: jest.fn(() => ({
						find: jest.fn(() => {
							throw Error('Database not reachable');
						}),
						count: jest.fn(() => mockedBlockchainAppsValidResponse.meta.count),
					})),
				},
			},
		}));

		jest.mock(mockNetworkPath, () => ({
			getNetworkStatus: jest.fn(() => mockedNetworkStatus),
		}));

		jest.mock(mockRequestPath, () => ({
			requestConnector: jest.fn(() => mockedEscrowedAmounts),
		}));

		jest.mock(mockMainchainPath, () => ({
			getMainchainID: jest.fn(() => mockedMainchainID),
		}));

		const { getBlockchainApps } = require(mockBlockchainAppsPath);
		await expect(getBlockchainApps(params)).rejects.toThrow();
	});

	it('should throw an error if network status is not reachable', async () => {
		const params = {
			limit: 10,
			offset: 0,
		};

		jest.mock('lisk-service-framework', () => ({
			DB: {
				MySQL: {
					getTableInstance: jest.fn(() => ({
						find: jest.fn(() => mockedBlockchainAppsDatabaseRes),
						count: jest.fn(() => mockedBlockchainAppsValidResponse.meta.count),
					})),
				},
			},
		}));

		jest.mock(mockNetworkPath, () => ({
			getNetworkStatus: jest.fn(() => {
				throw Error('Network status not reachable');
			}),
		}));

		jest.mock(mockRequestPath, () => ({
			requestConnector: jest.fn(() => mockedEscrowedAmounts),
		}));

		jest.mock(mockMainchainPath, () => ({
			getMainchainID: jest.fn(() => mockedMainchainID),
		}));

		const { getBlockchainApps } = require(mockBlockchainAppsPath);
		await expect(getBlockchainApps(params)).rejects.toThrow();
	});

	it('should throw an error if the connector is not reachable', async () => {
		const params = {
			limit: 10,
			offset: 0,
		};

		jest.mock('lisk-service-framework', () => ({
			DB: {
				MySQL: {
					getTableInstance: jest.fn(() => ({
						find: jest.fn(() => mockedBlockchainAppsDatabaseRes),
						count: jest.fn(() => mockedBlockchainAppsValidResponse.meta.count),
					})),
				},
			},
		}));

		jest.mock(mockNetworkPath, () => ({
			getNetworkStatus: jest.fn(() => mockedNetworkStatus),
		}));

		jest.mock(mockRequestPath, () => ({
			requestConnector: jest.fn(() => {
				throw Error('Connector not reachable');
			}),
		}));

		jest.mock(mockMainchainPath, () => ({
			getMainchainID: jest.fn(() => mockedMainchainID),
		}));

		const { getBlockchainApps } = require(mockBlockchainAppsPath);
		await expect(getBlockchainApps(params)).rejects.toThrow();
	});
});

describe('getLSKTokenID', () => {
	beforeEach(() => {
		jest.resetModules();
		jest.clearAllMocks();
	});

	it('should generate the token ID based on the mainchain ID', async () => {
		jest.mock(mockMainchainPath, () => ({
			getMainchainID: jest.fn(() => mockedMainchainID),
		}));

		const { getLSKTokenID } = require(mockBlockchainAppsPath);
		await expect(getLSKTokenID()).resolves.not.toThrow();
	});

	it('should throw an error if MainchainID is not found', async () => {
		jest.mock(mockMainchainPath, () => ({
			getMainchainID: jest.fn(() => {
				throw Error('MainchainID not found');
			}),
		}));

		const { getLSKTokenID } = require(mockBlockchainAppsPath);
		await expect(getLSKTokenID()).rejects.toThrow();
	});
});
