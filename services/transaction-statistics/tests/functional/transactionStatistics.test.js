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

describe('Functional tests for transactionStatistics', () => {
	describe('getSelector', () => {
		afterAll(() => jest.clearAllMocks());

		jest.spyOn(request, 'requestIndexer').mockReturnValue(networkStatus);
		it('should return correct response with valid params ->  day interval', async () => {
			const params = {
				dataFormat: DATE_FORMAT.DAY,
				dateTo: moment().utc().endOf(this.dataFormat),
				dateFrom: moment(this.dateTo).startOf(this.dataFormat),
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
				dateFrom: moment(this.dateTo).startOf(this.dataFormat),
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
	});
});
