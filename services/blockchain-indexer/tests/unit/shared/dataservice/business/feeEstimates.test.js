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

const mockFeeEstimatesFilePath = resolve(`${__dirname}/../../../../../shared/dataService/business/feeEstimates`);

const { requestFeeEstimator } = require('../../../../../shared/utils/request');
const { mockTxFeeEstimate } = require('../../constants/transactionEstimateFees');

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

jest.mock('../../../../../shared/utils/request', () => ({
	requestFeeEstimator: jest.fn(() => mockTxFeeEstimate),
}));

describe('Fee estimates', () => {
	afterEach(() => {
		jest.clearAllMocks();
		jest.resetModules();
	});

	it('should call requestFeeEstimator if payload is undefined', async () => {
		const { getFeeEstimates, reloadFeeEstimates } = require(mockFeeEstimatesFilePath);

		await reloadFeeEstimates(undefined);

		const feeEstimates = await getFeeEstimates();

		expect(requestFeeEstimator).toHaveBeenCalledTimes(1);
		expect(feeEstimates).toEqual(mockTxFeeEstimate);
	});

	it('should assign payload to feeEstimates if payload is defined', async () => {
		const { getFeeEstimates, reloadFeeEstimates } = require(mockFeeEstimatesFilePath);

		await reloadFeeEstimates(mockTxFeeEstimate);
		const feeEstimates = await getFeeEstimates();

		expect(requestFeeEstimator).toHaveBeenCalledTimes(0);
		expect(feeEstimates).toEqual(mockTxFeeEstimate);
	});
});
