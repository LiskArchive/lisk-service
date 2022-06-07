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
const { api } = require('../../../helpers/api');

const {
	wrongInputParamSchema,
	notFoundSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	timelineItemSchema,
	transactionStatisticsSchema,
	goodRequestSchema,
	metaSchema,
} = require('../../../schemas/api_v2/transactionStatistics.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV1 = `${baseUrl}/api/v2`;
const baseEndpoint = `${baseUrlV1}/transactions/statistics`;

describe('Transaction statistics API', () => {
	describe('GET /transactions/statistics/{aggregateBy}', () => {
		[{
			aggregateBy: 'day',
			dateFormat: 'YYYY-MM-DD',
		},
		{
			aggregateBy: 'month',
			dateFormat: 'YYYY-MM',
		}].forEach(({ aggregateBy, dateFormat }) => {
			describe(`GET /transactions/statistics/${aggregateBy}`, () => {
				const endpoint = `${baseEndpoint}/${aggregateBy}`;
				const startOfUnitUtc = moment().utc().startOf(aggregateBy);

				it(`returns stats for last 10 ${aggregateBy}s if called without any params`, async () => {
					const response = await api.get(`${baseEndpoint}/${aggregateBy}`);
					expect(response).toMap(goodRequestSchema);
					expect(response.data).toMap(transactionStatisticsSchema);
					response.data.timeline.forEach((timelineItem, i) => {
						const date = moment(startOfUnitUtc).subtract(i, aggregateBy);
						expect(timelineItem).toMap(timelineItemSchema, {
							date: date.format(dateFormat),
							timestamp: date.unix(),
						});
					});
					expect(response.meta).toMap(metaSchema);
				});

				it(`returns stats for this ${aggregateBy} if called with ?limit=1`, async () => {
					const limit = 1;
					const response = await api.get(`${endpoint}?limit=${limit}`);
					expect(response).toMap(goodRequestSchema);
					expect(response.data.timeline).toHaveLength(1);
					response.data.timeline.forEach(timelineItem => expect(timelineItem)
						.toMap(timelineItemSchema, {
							date: startOfUnitUtc.format(dateFormat),
							timestamp: startOfUnitUtc.unix(),
						}));
					expect(response.meta).toMap(metaSchema, { limit });
				});

				it(`returns stats for previous ${aggregateBy} if called with ?limit=1&offset=1`, async () => {
					if (aggregateBy === 'day') {
						const limit = 1;
						const offset = 1;
						const startOfYesterday = moment(startOfUnitUtc).subtract(1, aggregateBy);

						const response = await api.get(`${endpoint}?limit=${limit}&offset=${offset}`);
						expect(response).toMap(goodRequestSchema);
						expect(response.data).toMap(transactionStatisticsSchema);
						expect(response.data.timeline).toHaveLength(1);
						response.data.timeline.forEach(timelineItem => expect(timelineItem)
							.toMap(timelineItemSchema, {
								date: startOfYesterday.format(dateFormat),
								timestamp: startOfYesterday.unix(),
							}));
						expect(response.meta).toMap(metaSchema, {
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

						const response = await api.get(`${endpoint}?limit=${limit}&offset=${offset}`);
						expect(response).toMap(goodRequestSchema);
						expect(response.data).toMap(transactionStatisticsSchema);
						expect(response.data.timeline).toBeInstanceOf(Array);
						expect(response.data.timeline.length).toBeGreaterThanOrEqual(1);
						expect(response.data.timeline.length).toBeLessThanOrEqual(limit);
						response.data.timeline.forEach((timelineItem, i) => {
							const date = moment(startOfUnitUtc).subtract(i + offset, aggregateBy);
							expect(timelineItem).toMap(timelineItemSchema, {
								date: date.format(dateFormat),
								timestamp: date.unix(),
							});
						});
						expect(response.meta).toMap(metaSchema, {
							limit,
							offset,
							dateFormat,
						});
					}
				});

				it('returns error 400 if called with ?limit=101 or higher', async () => {
					const response = await api.get(`${endpoint}?limit=101`, 400);
					expect(response).toMap(wrongInputParamSchema);
				});

				// TODO implement this case in the API
				it.todo('returns error 404 if called with ?offset=365 or higher as only last year is guaranteed');
			});
		});

		describe('GET /transactions/statistics/year', () => {
			const endpoint = `${baseEndpoint}/year`;

			it('returns error 404 if called without any params as years are not supported', async () => {
				const response = await api.get(endpoint, 404);
				expect(response).toMap(notFoundSchema);
			});
		});
	});
});
