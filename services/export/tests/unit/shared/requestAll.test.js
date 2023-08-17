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

const {
	transactions,
} = require('../../constants/transaction');

const { requestAllStandard, requestAllCustom } = require('../../../shared/requestAll');

const mockedRequestFilePath = resolve(`${__dirname}/../../../shared/helpers/request`);

const getResponseOfLength = (n, singleRequestLimit) => new Array(n).fill().map((e, i) => ({
	extra_param: 'extra_value',
	offset: singleRequestLimit * i,
	limit: singleRequestLimit,
}));

describe('Test requestAllStandard method', () => {
	const func = async (params) => ({
		data: [params],
		meta: {
			total: 1000,
		},
	});

	it('should call passed function multiple times when total limit > single response limit', async () => {
		const singleRequestLimit = 5;
		const expectedResponse = getResponseOfLength(4, singleRequestLimit);
		const response = await requestAllStandard(func, { limit: singleRequestLimit, extra_param: 'extra_value' }, 20);
		expect(response).toEqual(expectedResponse);
	});

	it('should call passed function only once when total limit > single response limit but function return total < single response limit', async () => {
		const singleRequestLimit = 50;
		const expectedResponse = getResponseOfLength(1, singleRequestLimit);
		const func2 = async (params) => ({
			data: [params],
			meta: {
				total: singleRequestLimit - 1,
			},
		});
		const response = await requestAllStandard(func2, { limit: singleRequestLimit, extra_param: 'extra_value' }, singleRequestLimit * 10);
		expect(response).toEqual(expectedResponse);
	});

	it('should call passed function only once when total limit < single response limit', async () => {
		const singleRequestLimit = 50;
		const expectedResponse = getResponseOfLength(1, singleRequestLimit);
		const response = await requestAllStandard(func, { limit: singleRequestLimit, extra_param: 'extra_value' }, 20);
		expect(response).toEqual(expectedResponse);
	});

	it('should throw error if passed function is null', async () => {
		expect(async () => requestAllStandard(null, { limit: 50, extra_param: 'extra_value' }, 20)).rejects.toThrow();
	});

	it('should throw error if passed function is undefined', async () => {
		expect(async () => requestAllStandard(undefined, { limit: 50, extra_param: 'extra_value' }, 20)).rejects.toThrow();
	});
});

describe('Test requestAllCustom method', () => {
	it('should return proper response', async () => {
		/* eslint-disable-next-line import/no-dynamic-require */
		const { requestConnector } = require(mockedRequestFilePath);

		jest.mock(mockedRequestFilePath, () => ({
			requestConnector: jest.fn(),
		}));

		requestConnector
			.mockResolvedValue([transactions.tokenTransfer, transactions.tokenTransferCrossChain]);

		const response = await requestAllCustom(requestConnector, 'transactions', { limit: 2 }, 2);
		expect(response).toEqual([transactions.tokenTransfer, transactions.tokenTransferCrossChain]);
		expect(response.length).toBe(2);
	});

	it('should throw error when called with invalid function', async () => {
		expect(requestAllCustom('invalidFunc', 'transactions')).rejects.toThrow();
	});
});
