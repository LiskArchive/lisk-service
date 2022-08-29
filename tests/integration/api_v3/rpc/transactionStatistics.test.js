/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
import moment from 'moment';

const config = require('../../../config');
const { request } = require('../../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	timelineItemSchema,
	transactionStatisticsSchema,
	goodRequestSchema,
	metaSchema,
} = require('../../../schemas/api_v3/transactionStatistics.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const requestTransactionStatistics = async (params) => request(wsRpcUrl, 'get.transactions.statistics', params);

describe('get.transactions.statistics', () => {
	[{
		interval: 'day',
		dateFormat: 'YYYY-MM-DD',
	},
	{
		interval: 'month',
		dateFormat: 'YYYY-MM',
	}].forEach(({ interval, dateFormat }) => {
		describe(`get.transactions.statistics by interval as ${interval}`, () => {
			const startOfUnitUtc = moment().utc().startOf(interval);

			it(`returns stats for aggregated by ${interval}, if called without any params`, async () => {
				const response = await requestTransactionStatistics({ interval });
				expect(response).toMap(jsonRpcEnvelopeSchema);
				const { result } = response;
				expect(result).toMap(goodRequestSchema);
				expect(result.data).toMap(transactionStatisticsSchema);
				expect(result.meta).toMap(metaSchema);
			});

			it(`returns stats for this ${interval} if called with ?limit=1`, async () => {
				const limit = 1;
				const response = await requestTransactionStatistics({ interval, limit });
				expect(response).toMap(jsonRpcEnvelopeSchema);
				const { result } = response;
				expect(result).toMap(goodRequestSchema);
				expect(result.data).toMap(transactionStatisticsSchema);
				expect(result.data.timeline).toHaveLength(1);
				result.data.timeline.forEach(timelineItem => expect(timelineItem)
					.toMap(timelineItemSchema, {
						date: startOfUnitUtc.format(dateFormat),
						timestamp: startOfUnitUtc.unix(),
					}));
				expect(result.meta).toMap(metaSchema, { limit });
			});

			it(`returns stats for previous ${interval} if called with ?limit=1&offset=1`, async () => {
				if (interval === 'day') {
					const limit = 1;
					const offset = 1;
					const startOfYesterday = moment(startOfUnitUtc).subtract(1, interval);

					const response = await requestTransactionStatistics({ interval, limit, offset });
					expect(response).toMap(jsonRpcEnvelopeSchema);
					const { result } = response;
					expect(result).toMap(goodRequestSchema);
					expect(result.data).toMap(transactionStatisticsSchema);
					expect(result.data.timeline).toHaveLength(1);
					result.data.timeline.forEach(timelineItem => expect(timelineItem)
						.toMap(timelineItemSchema, {
							date: startOfYesterday.format(dateFormat),
							timestamp: startOfYesterday.unix(),
						}));
					expect(result.meta).toMap(metaSchema, {
						limit,
						offset,
						dateFormat,
						dateFrom: startOfYesterday.format(dateFormat),
						dateTo: startOfYesterday.format(dateFormat),
					});
				}
			});

			it(`returns stats for previous ${interval} and the ${interval} before if called with ?limit=2&offset=1`, async () => {
				if (interval === 'day') {
					const limit = 2;
					const offset = 1;

					const response = await requestTransactionStatistics({ interval, limit, offset });
					expect(response).toMap(jsonRpcEnvelopeSchema);
					const { result } = response;
					expect(result).toMap(goodRequestSchema);
					expect(result.data).toMap(transactionStatisticsSchema);
					expect(result.data.timeline).toHaveLength(2);
					result.data.timeline.forEach((timelineItem, i) => {
						const date = moment(startOfUnitUtc).subtract(i + offset, interval);
						expect(timelineItem).toMap(timelineItemSchema, {
							date: date.format(dateFormat),
							timestamp: date.unix(),
						});
					});
					expect(result.meta).toMap(metaSchema, {
						limit,
						offset,
						dateFormat,
					});
				}
			});

			it('returns invalid param error (-32602) if called with ?limit=101 or higher', async () => {
				const response = await requestTransactionStatistics({ interval, limit: 101 });
				expect(response).toMap(invalidParamsSchema);
			});
		});
	});

	describe('GET get.transactions.statistics with interval: \'year\'', () => {
		it('returns invalid param error (-32602) if called without any params as years are not supported', async () => {
			const response = await requestTransactionStatistics({ interval: 'year' });
			expect(response).toMap(invalidParamsSchema);
		});
	});
});
