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
const moment = require('moment');

const { networkStatus } = require('../constants/networkStatus');
const { DATE_FORMAT } = require('../../shared/utils/constants');
const request = require('../../shared/utils/request');
const {
	getSelector,
} = require('../../shared/transactionStatistics');

jest.mock('../../shared/utils/request');

describe('Tests transactionStatistics', () => {
	describe('getSelector', () => {
		afterAll(() => jest.clearAllMocks());

		jest.spyOn(request, 'requestIndexer').mockReturnValue(networkStatus);
		it('should return correct response with valid params ->  day interval', async () => {
			const params = {
				dataFormat: DATE_FORMAT.DAY,
				dateTo: moment().utc().endOf(this.dataFormat),
				dateFrom: moment(moment().utc().endOf(this.dataFormat)).startOf(this.dataFormat),
				tokenIDs: ['0400000000000000'],
			};
			const result = await getSelector(params);
			expect(typeof result).toBe('object');
			expect(result).toMatchObject({
				sort: 'date:desc',
				limit: (networkStatus.data.moduleCommands.length + 1) * 366,
				propBetweens: [{
					property: 'date',
					from: params.dateFrom.unix(),
					to: params.dateTo.unix(),
				}],
			});
		});

		it('should return correct response with valid params -> month interval', async () => {
			const params = {
				dataFormat: DATE_FORMAT.MONTH,
				dateTo: moment().utc().endOf(this.dataFormat),
				dateFrom: moment(moment().utc().endOf(this.dataFormat)).startOf(this.dataFormat),
				tokenIDs: ['0400000000000000'],
			};
			const result = await getSelector(params);
			expect(typeof result).toBe('object');
			expect(result).toMatchObject({
				sort: 'date:desc',
				limit: (networkStatus.data.moduleCommands.length + 1) * 366,
				propBetweens: [{
					property: 'date',
					from: params.dateFrom.unix(),
					to: params.dateTo.unix(),
				}],
			});
		});

		it('should return proper response -> day interval with only dateFrom', async () => {
			const params = {
				dataFormat: DATE_FORMAT.MONTH,
				dateFrom: moment().utc().endOf(this.dataFormat),
				tokenIDs: ['0400000000000000'],
			};
			const result = await getSelector(params);
			expect(typeof result).toBe('object');
			expect(result).toMatchObject({
				sort: 'date:desc',
				limit: (networkStatus.data.moduleCommands.length + 1) * 366,
				propBetweens: [{
					property: 'date',
					from: params.dateFrom.unix(),
				}],
			});
		});

		it('should return proper response -> day interval with only dateTo', async () => {
			const params = {
				dataFormat: DATE_FORMAT.MONTH,
				dateTo: moment().utc().endOf(this.dataFormat),
				tokenIDs: ['0400000000000000'],
			};
			const result = await getSelector(params);
			expect(typeof result).toBe('object');
			expect(result).toMatchObject({
				sort: 'date:desc',
				limit: (networkStatus.data.moduleCommands.length + 1) * 366,
				propBetweens: [{
					property: 'date',
					to: params.dateTo.unix(),
				}],
			});
		});

		it('should return proper response -> empty object params', async () => {
			const params = {};
			const result = await getSelector(params);
			expect(typeof result).toBe('object');
			expect(result).toMatchObject({
				sort: 'date:desc',
				limit: (networkStatus.data.moduleCommands.length + 1) * 366,
				propBetweens: [{ property: 'date' }],
			});
		});

		it('should throw error in case of no params', async () => {
			expect(getSelector()).rejects.toThrow();
		});

		it('should throw error in case of undefined params', async () => {
			expect(getSelector(undefined)).rejects.toThrow();
		});

		it('should throw error in case of null params', async () => {
			expect(getSelector(null)).rejects.toThrow();
		});
	});
});
