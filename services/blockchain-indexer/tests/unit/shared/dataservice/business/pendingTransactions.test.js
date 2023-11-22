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
const {
	mockPendingTransactions,
	mockSenderAddress,
	mockSenderAccountDetails,
	mockRecipientAddress,
} = require('../../constants/pendingTransactions');

const {
	getCurrentChainID,
} = require('../../../../../shared/dataService/business/interoperability/chain');

jest.mock('lisk-service-framework', () => {
	const actual = jest.requireActual('lisk-service-framework');
	return {
		...actual,
		DB: {
			...actual.DB,
			MySQL: {
				...actual.DB.MySQL,
				KVStore: {
					...actual.DB.KVStore,
					getKeyValueTable: jest.fn(),
				},
			},
		},
		CacheRedis: jest.fn(),
		CacheLRU: jest.fn(),
	};
});

jest.mock('../../../../../shared/utils/request', () => ({
	requestConnector: jest.fn(() => mockPendingTransactions),
}));

jest.mock('../../../../../shared/utils/account', () => ({
	getLisk32AddressFromPublicKey: jest.fn(() => mockSenderAddress),
}));

jest.mock('../../../../../shared/dataService/utils/account', () => ({
	getIndexedAccountInfo: jest.fn(() => mockSenderAccountDetails),
}));

jest.mock('../../../../../shared/dataService/business/interoperability/chain', () => ({
	getCurrentChainID: jest.fn(),
}));

const {
	validateParams,
	loadAllPendingTransactions,
	getPendingTransactions,
} = require('../../../../../shared/dataService/business/pendingTransactions');

describe('Test validateParams method', () => {
	it('should return validated params when called with valid params', async () => {
		const params = {
			moduleCommand: 'token:transfer',
			address: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
			sort: 'timestamp:desc',
		};

		const result = await validateParams(params);
		expect(result).toEqual(params);
	});

	it('should throw error when called with nonce without senderAddress', async () => {
		const params = { nonce: 1 };
		expect(() => validateParams(params)).rejects.toThrow();
	});

	it('should throw error when called with undefined', async () => {
		expect(() => validateParams(undefined)).rejects.toThrow();
	});

	it('should throw error when called with null', async () => {
		expect(() => validateParams(null)).rejects.toThrow();
	});
});

describe('Test getPendingTransactions method', () => {
	beforeAll(async () => {
		await loadAllPendingTransactions();
	});

	beforeEach(async () => {
		jest.resetModules();
	});

	it('should return all pending transactions without any filters', async () => {
		const params = {
			sort: 'id:asc',
			offset: 0,
			limit: 10,
		};

		const result = await getPendingTransactions(params);
		expect(result.data.length).toBe(mockPendingTransactions.length);
	});

	it('should return pending transactions with tx id', async () => {
		const params = {
			id: mockPendingTransactions[0].id,
			sort: 'id:asc',
			offset: 0,
			limit: 10,
		};

		const result = await getPendingTransactions(params);
		expect(result.data.length).toBe(1);
	});

	it('should return pending transactions with recipientAddress', async () => {
		const params = {
			recipientAddress: mockRecipientAddress,
			sort: 'id:asc',
			offset: 0,
			limit: 10,
		};

		const result = await getPendingTransactions(params);

		let txCountWithParams = 0;
		mockPendingTransactions.forEach(transaction => {
			if (transaction.params && transaction.params.recipientAddress === mockRecipientAddress) {
				txCountWithParams++;
			}
		});

		expect(result.data.length).toBe(txCountWithParams);
	});

	it('should return pending transactions with receivingChainID and receivingChainID is not currentChainID', async () => {
		const params = {
			receivingChainID: '02000000',
			sort: 'id:asc',
			offset: 0,
			limit: 10,
		};

		getCurrentChainID.mockResolvedValue('02000001');

		const result = await getPendingTransactions(params);

		let txCountWithParams = 0;
		mockPendingTransactions.forEach(transaction => {
			if (transaction.params && transaction.params.receivingChainID === '02000000') {
				txCountWithParams++;
			}
		});

		expect(result.data.length).toBe(txCountWithParams);
	});

	it('should return pending transactions with receivingChainID and receivingChainID is currentChainID', async () => {
		const params = {
			receivingChainID: '02000000',
			sort: 'id:asc',
			offset: 0,
			limit: 10,
		};

		getCurrentChainID.mockResolvedValue('02000000');

		const result = await getPendingTransactions(params);

		let txCountWithParams = 0;
		mockPendingTransactions.forEach(transaction => {
			if (transaction.params && !transaction.params.receivingChainID) {
				txCountWithParams++;
			}
		});

		expect(result.data.length).toBe(txCountWithParams);
	});

	it('should throw ValidationException for invalid parameters', async () => {
		const params = {
			nonce: 123,
		};

		await expect(validateParams(params)).rejects.toThrow();
	});
});
