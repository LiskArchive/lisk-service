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
	mockTxRequest,
	mockTransferCrossChainTxRequest,
} = require('../../constants/transactionEstimateFees');

const {
	validateParams,
	normalizeTransactions,
} = require('../../../../../shared/dataService/business/transactions');

jest.mock('lisk-service-framework', () => {
	const actual = jest.requireActual('lisk-service-framework');
	return {
		...actual,
		DB: {
			...actual.DB,
			MySQL: {
				...actual.DB.MySQL,
				KVStore: {
					...actual.DB.MySQL.KVStore,
					getKeyValueTable: jest.fn(),
				},
			},
		},
		CacheRedis: jest.fn(),
		CacheLRU: jest.fn(),
	};
});

describe('Test validateParams method', () => {
	it('should return validated params when called with valid params', async () => {
		const params = { height: '10:1000' };
		const result = await validateParams(params);

		const expectedResult = {
			propBetweens: [
				{
					property: 'height',
					from: 10,
					to: 1000,
				},
			],
		};
		expect(result).toEqual(expectedResult);
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

describe('Test normalizeTransactions method', () => {
	it('should return normalized transactions when called with valid transactions', async () => {
		const transactions = [mockTxRequest.transaction, mockTransferCrossChainTxRequest.transaction];
		const normalizedTransactions = await normalizeTransactions(transactions);

		const expectedResult = [
			{
				...mockTxRequest.transaction,
				moduleCommand: `${mockTxRequest.transaction.module}:${mockTxRequest.transaction.command}`,
			},
			{
				...mockTransferCrossChainTxRequest.transaction,
				moduleCommand: `${mockTransferCrossChainTxRequest.transaction.module}:${mockTransferCrossChainTxRequest.transaction.command}`,
			},
		];

		expect(normalizedTransactions.length).toEqual(transactions.length);
		expect(normalizedTransactions).toEqual(expectedResult);
	});

	it('should throw error when called with null', async () => {
		expect(() => normalizeTransactions(null)).rejects.toThrow();
	});

	it('should throw error when called with undefined', async () => {
		expect(() => normalizeTransactions(null)).rejects.toThrow();
	});
});
