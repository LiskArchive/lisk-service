/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
	wrongMethodSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	timelineItemSchema,
	transactionStatisticsSchema,
	goodRequestSchema,
	metaSchema,
} = require('../../../schemas/api_v2/transactionStatistics.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v2`;
const requestTransactionStatistics = async (mode, params) => request(wsRpcUrl, `get.transactions.statistics.${mode}`, params);

describe('get.transactions.statistics.{aggregateBy}', () => {
	[{
		aggregateBy: 'day',
		dateFormat: 'YYYY-MM-DD',
	},
	{
		aggregateBy: 'month',
		dateFormat: 'YYYY-MM',
	}].forEach(({ aggregateBy, dateFormat }) => {
		describe(`get.transactions.statistics.${aggregateBy}`, () => {
			const startOfUnitUtc = moment().utc().startOf(aggregateBy);

			it(`returns stats for aggregated by ${aggregateBy}, if called without any params`, async () => {
				const response = await requestTransactionStatistics(aggregateBy);
				expect(response).toMap(jsonRpcEnvelopeSchema);
				const { result } = response;
				expect(result).toMap(goodRequestSchema);
				expect(result.data).toMap(transactionStatisticsSchema);
				expect(result.meta).toMap(metaSchema);
			});

			it(`returns stats for this ${aggregateBy} if called with ?limit=1`, async () => {
				const limit = 1;
				const response = await requestTransactionStatistics(aggregateBy, { limit });
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

			it(`returns stats for previous ${aggregateBy} if called with ?limit=1&offset=1`, async () => {
				if (aggregateBy === 'day') {
					const limit = 1;
					const offset = 1;
					const startOfYesterday = moment(startOfUnitUtc).subtract(1, aggregateBy);

					const response = await requestTransactionStatistics(aggregateBy, { limit, offset });
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

			it(`returns stats for previous ${aggregateBy} and the ${aggregateBy} before if called with ?limit=2&offset=1`, async () => {
				if (aggregateBy === 'day') {
					const limit = 2;
					const offset = 1;

					const response = await requestTransactionStatistics(aggregateBy, { limit, offset });
					expect(response).toMap(jsonRpcEnvelopeSchema);
					const { result } = response;
					expect(result).toMap(goodRequestSchema);
					expect(result.data).toMap(transactionStatisticsSchema);
					expect(result.data.timeline).toHaveLength(2);
					result.data.timeline.forEach((timelineItem, i) => {
						const date = moment(startOfUnitUtc).subtract(i + offset, aggregateBy);
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
				const response = await requestTransactionStatistics(aggregateBy, { limit: 101 });
				expect(response).toMap(invalidParamsSchema);
			});

			// TODO implement this case in the API
			it.todo('returns error 404 if called with ?offset=365 or higher as only last year is guaranteed');
		});
	});

	describe('GET get.transactions.statistics.year', () => {
		it('returns error METHOD_NOT_FOUND (-32601)) if called without any params as years are not supported', async () => {
			const response = await requestTransactionStatistics('year');
			expect(response).toMap(wrongMethodSchema);
		});
	});
});
