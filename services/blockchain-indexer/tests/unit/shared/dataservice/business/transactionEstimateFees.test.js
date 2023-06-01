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
const { inputTransaction } = require('../../../../constants/transactions');

jest.mock('lisk-service-framework', () => {
	const actual = jest.requireActual('lisk-service-framework');
	return {
		...actual,
		MySQL: {
			...actual.MySQL,
			KVStore: {
				...actual.KVStore,
				getKeyValueTable: jest.fn(),
			},
		},
		CacheRedis: jest.fn(),
		CacheLRU: jest.fn(),
	};
});

const {
	calcDynamicFeeEstimates,
	mockOptionalProperties,
} = require('../../../../../shared/dataService/business/transactionsEstimateFees');

describe('Test calcDynamicFeeEstimates method', () => {
	const feeEstimatePerByte = { low: 0, med: 10, high: 50 };
	const minFee = 150000;
	const size = 150;

	it('should return dynamic fee estimates', async () => {
		const expectedResponse = {
			low: BigInt('150000'),
			medium: BigInt('151500'),
			high: BigInt('157500'),
		};

		const dynamicFeeEstimates = calcDynamicFeeEstimates(feeEstimatePerByte, minFee, size);
		expect(Object.getOwnPropertyNames(dynamicFeeEstimates).length).toBe(3);
		expect(dynamicFeeEstimates).toMatchObject(expectedResponse);
	});

	it('should throw error when feeEstimatePerByte is undefined', async () => {
		expect(() => {
			calcDynamicFeeEstimates(undefined, minFee, size);
		}).toThrow(TypeError);
	});

	it('should throw error when minFee is undefined', async () => {
		expect(() => {
			calcDynamicFeeEstimates(feeEstimatePerByte, undefined, size);
		}).toThrow(TypeError);
	});

	it('should throw error when transaction size is undefined', async () => {
		expect(() => {
			calcDynamicFeeEstimates(feeEstimatePerByte, minFee, undefined);
		}).toThrow(TypeError);
	});

	it('should throw error when feeEstimatePerByte is null', async () => {
		expect(() => {
			calcDynamicFeeEstimates(null, minFee, size);
		}).toThrow(TypeError);
	});

	it('should throw error when minFee is null', async () => {
		expect(() => {
			calcDynamicFeeEstimates(feeEstimatePerByte, null, size);
		}).toThrow(TypeError);
	});

	it('should throw error when transaction size is null', async () => {
		expect(() => {
			calcDynamicFeeEstimates(feeEstimatePerByte, minFee, null);
		}).toThrow(TypeError);
	});
});

describe('Test mockOptionalProperties method', () => {
	it('should return transaction when called with all valid params', async () => {
		const transaction = mockOptionalProperties(inputTransaction);
		expect(transaction).toMatchObject(inputTransaction);
	});

	it('should return transaction when called transaction without id', async () => {
		const { id, ...remParams } = inputTransaction;
		const transaction = mockOptionalProperties(remParams);

		const expectedResponse = {
			...inputTransaction,
			id: transaction.id,
		};

		expect(transaction).toMatchObject(expectedResponse);
	});

	it('should return transaction when called transaction without fee', async () => {
		const { fee, ...remParams } = inputTransaction;
		const transaction = mockOptionalProperties(remParams);

		const expectedResponse = {
			...inputTransaction,
			fee: '0',
		};

		expect(transaction).toMatchObject(expectedResponse);
	});

	it('should return transaction when called transaction without signatures', async () => {
		const { signatures, ...remParams } = inputTransaction;
		const transaction = mockOptionalProperties(remParams);

		const expectedResponse = {
			...inputTransaction,
			signatures: transaction.signatures,
		};

		expect(transaction).toMatchObject(expectedResponse);
	});

	it('should throw error when transaction is undefined', async () => {
		expect(() => { mockOptionalProperties(undefined); }).toThrow(TypeError);
	});

	it('should throw error when transaction is null', async () => {
		expect(() => { mockOptionalProperties(null); }).toThrow(TypeError);
	});
});
