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

// Mock config
jest.mock('../../../../config', () => ({
	endpoints: {
		liskStatic: 'http://mocked-static-url',
	},
	networks: {
		Lisk: [
			{ chainID: '00000000', name: 'mainnet' },
			{ chainID: '01000000', name: 'testnet' },
		],
	},
}));

const chainID = '00000000';

describe('reloadAccountKnowledge', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		jest.resetModules();
	});

	it('should log the number of entries added to the knowledge object', async () => {
		// Mock lisk-service-framework
		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			const { mockedValidKnowledge } = require('../constants/accountKnowledge');
			return {
				...actual,
				HTTP: {
					get: jest.fn(() => Promise.resolve(mockedValidKnowledge)),
				},
				Logger: () => ({
					debug: jest.fn(),
					info: async (data) => expect(data).toEqual('Updated known accounts cache with 2 entries.'),
					warn: jest.fn(),
					error: jest.fn(),
				}),
			};
		});

		// Mock getNetworkStatus function to resolve valid chainID
		const { getNetworkStatus } = require('../../../../shared/dataService/business/network');
		jest.mock('../../../../shared/dataService/business/network');
		getNetworkStatus.mockResolvedValueOnce({ data: { chainID } });

		// Reload account knowledge
		const { reloadAccountKnowledge } = require('../../../../shared/dataService/knownAccounts');
		await reloadAccountKnowledge();
	});

	it('should log a warning if the Lisk static URL does not respond with valid data', async () => {
		// Mock lisk-service-framework
		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			return {
				...actual,
				HTTP: {
					get: jest.fn(() => Promise.resolve({ data: null, status: 200 })),
				},
				Logger: () => ({
					debug: jest.fn(),
					info: jest.fn(),
					warn: async (data) => expect(data).toEqual('Lisk static URL did not respond with valid data.'),
					error: jest.fn(),
				}),
			};
		});

		// Mock getNetworkStatus function to resolve valid chainID
		const { getNetworkStatus } = require('../../../../shared/dataService/business/network');
		jest.mock('../../../../shared/dataService/business/network');
		getNetworkStatus.mockResolvedValueOnce({ data: { chainID } });

		// Reload account knowledge
		const { reloadAccountKnowledge } = require('../../../../shared/dataService/knownAccounts');
		await reloadAccountKnowledge();
	});

	it('should log an error if an error occurs during the process', async () => {
		// Mock lisk-service-framework
		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			return {
				...actual,
				HTTP: {
					get: jest.fn(() => Promise.reject(new Error('Test error message'))),
				},
				Logger: () => ({
					debug: jest.fn(),
					info: jest.fn(),
					warn: jest.fn(),
					error: async (data) => expect(data).toEqual('Could not reload known accounts: Test error message.'),
				}),
			};
		});

		// Mock getNetworkStatus function to resolve valid chainID
		const { getNetworkStatus } = require('../../../../shared/dataService/business/network');
		jest.mock('../../../../shared/dataService/business/network');
		getNetworkStatus.mockResolvedValueOnce({ data: { chainID } });

		// Reload account knowledge
		const { reloadAccountKnowledge } = require('../../../../shared/dataService/knownAccounts');
		await reloadAccountKnowledge();
	});

	it('should log a warning if the chain ID does not exist in the database', async () => {
		// Mock lisk-service-framework
		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			return {
				...actual,
				HTTP: {
					get: jest.fn(() => Promise.reject(new Error('Test error message'))),
				},
				Logger: () => ({
					debug: jest.fn(),
					info: jest.fn(),
					warn: async (data) => expect(data).toEqual('Static information anavailable for the current chainID: invalidChainID.'),
					error: jest.fn(),
				}),
			};
		});

		// Mock getNetworkStatus function to resolve invalid chainID
		const { getNetworkStatus } = require('../../../../shared/dataService/business/network');
		jest.mock('../../../../shared/dataService/business/network');
		getNetworkStatus.mockResolvedValueOnce({ data: { chainID: 'invalidChainID' } });

		// Reload account knowledge
		const { reloadAccountKnowledge } = require('../../../../shared/dataService/knownAccounts');
		await reloadAccountKnowledge();
	});

	it('should update the knowledge object with retrieved known accounts', async () => {
		// Mock lisk-service-framework
		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			const { mockedValidKnowledge } = require('../constants/accountKnowledge');
			return {
				...actual,
				HTTP: {
					get: jest.fn(() => Promise.resolve(mockedValidKnowledge)),
				},
				Logger: () => ({
					debug: jest.fn(),
					info: async (data) => expect(data).toEqual('Updated known accounts cache with 2 entries.'),
					warn: jest.fn(),
					error: jest.fn(),
				}),
			};
		});

		// Mock getNetworkStatus function to resolve valid chainID
		const { getNetworkStatus } = require('../../../../shared/dataService/business/network');
		jest.mock('../../../../shared/dataService/business/network');
		getNetworkStatus.mockResolvedValueOnce({ data: { chainID } });

		// Reload account knowledge
		const { reloadAccountKnowledge, getAccountKnowledge } = require('../../../../shared/dataService/knownAccounts');
		await reloadAccountKnowledge();

		// fetch and assert account knowledge
		expect(getAccountKnowledge('address1')).toEqual({
			owner: 'LiskHQ',
			description: 'Initial seed',
		});

		expect(getAccountKnowledge('address2')).toEqual({
			owner: 'Genesis',
			description: 'Initial seed',
		});
	});
});

describe('resolveNetworkByChainID', () => {
	it('should return the network name for a valid chain ID', () => {
		const {
			resolveNetworkByChainID,
		} = require('../../../../shared/dataService/knownAccounts');

		const result = resolveNetworkByChainID(chainID);
		expect(result).toEqual('mainnet');
	});

	it('should return the network name for a valid network ID', () => {
		const {
			resolveNetworkByChainID,
		} = require('../../../../shared/dataService/knownAccounts');

		const validSidechainID = '00000001';
		const result = resolveNetworkByChainID(validSidechainID);
		expect(result).toEqual('mainnet');
	});

	it('should return null if the chain ID does not exist in any network', () => {
		const {
			resolveNetworkByChainID,
		} = require('../../../../shared/dataService/knownAccounts');

		const invalidChainID = '99999999';
		const result = resolveNetworkByChainID(invalidChainID);
		expect(result).toBeNull();
	});
});

describe('getAccountKnowledge', () => {
	beforeAll(async () => {
		jest.resetModules();
		jest.resetAllMocks();

		// Mock lisk-service-framework
		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			const { mockedValidKnowledge } = require('../constants/accountKnowledge');
			return {
				...actual,
				HTTP: {
					get: jest.fn(() => Promise.resolve(mockedValidKnowledge)),
				},
				Logger: () => ({
					debug: jest.fn(),
					info: async (data) => expect(data).toEqual('Updated known accounts cache with 2 entries.'),
					warn: jest.fn(),
					error: jest.fn(),
				}),
			};
		});

		// Mock getNetworkStatus function to resolve valid chainID
		const { getNetworkStatus } = require('../../../../shared/dataService/business/network');
		jest.mock('../../../../shared/dataService/business/network');
		getNetworkStatus.mockResolvedValueOnce({ data: { chainID } });

		// Reload account knowledge
		const { reloadAccountKnowledge } = require('../../../../shared/dataService/knownAccounts');
		await reloadAccountKnowledge();
	});

	it('should return the account knowledge if it exists', () => {
		const { getAccountKnowledge } = require('../../../../shared/dataService/knownAccounts');
		expect(getAccountKnowledge('address1')).toEqual({
			owner: 'LiskHQ',
			description: 'Initial seed',
		});

		expect(getAccountKnowledge('address2')).toEqual({
			owner: 'Genesis',
			description: 'Initial seed',
		});
	});

	it('should return an empty object if the account knowledge does not exist', () => {
		const { getAccountKnowledge } = require('../../../../shared/dataService/knownAccounts');

		expect(getAccountKnowledge('nonexistentAddress')).toEqual({});
	});
});
