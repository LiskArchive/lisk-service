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

const mockTransactionsDryRunFilePath = resolve(
	`${__dirname}/../../../../../shared/dataService/business/transactionsDryRun`,
);
const { requestConnector } = require('../../../../../shared/utils/request');
const { mockTxRequestConnector } = require('../../constants/transactionEstimateFees');
const {
	mockTransactionsDryRunResultFromNode,
	mockTransactionsDryRunResult,
} = require('../../constants/transactionsDryRun');

jest.mock('lisk-service-framework', () => {
	const actual = jest.requireActual('lisk-service-framework');
	return {
		...actual,
		Logger: () => ({
			debug: jest.fn(),
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
		}),
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

jest.mock('../../../../../shared/utils/request', () => ({
	requestConnector: jest.fn(() => mockTransactionsDryRunResultFromNode),
}));

describe('Transactions DryRun', () => {
	afterEach(() => {
		jest.clearAllMocks();
		jest.resetModules();
	});

	it('should return proper response when called with valid transactions', async () => {
		const { dryRunTransactions } = require(mockTransactionsDryRunFilePath);

		const response = await dryRunTransactions({
			transaction: mockTxRequestConnector,
		});

		expect(requestConnector).toHaveBeenCalledTimes(1);

		expect(response).toEqual(mockTransactionsDryRunResult);
	});
});
