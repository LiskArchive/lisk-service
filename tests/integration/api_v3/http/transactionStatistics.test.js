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
const { api } = require('../../../helpers/api');

const {
	wrongInputParamSchema,
	badRequestSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	timelineItemSchema,
	transactionStatisticsSchema,
	goodRequestSchema,
	metaSchema,
} = require('../../../schemas/api_v3/transactionStatistics.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const baseEndpoint = `${baseUrlV3}/transactions/statistics`;

describe('Transaction statistics API', () => {
	describe('GET /transactions/statistics', () => {
		[{
			interval: 'day',
			dateFormat: 'YYYY-MM-DD',
		},
		{
			interval: 'month',
			dateFormat: 'YYYY-MM',
		}].forEach(({ interval, dateFormat }) => {
			describe(`GET /transactions/statistics?interval=${interval}`, () => {
				const startOfUnitUtc = moment().utc().startOf(interval);

				it(`returns stats for last 10 ${interval}s if called without any params`, async () => {
					const response = await api.get(`${baseEndpoint}?interval=${interval}`);
					expect(response).toMap(goodRequestSchema);
					expect(response.data).toMap(transactionStatisticsSchema);
					const tokensList = Object.keys(response.data.timeline);
					tokensList.forEach((token) => {
						const tokenStatsTimeline = response.data.timeline[token];
						tokenStatsTimeline.forEach((timelineItem, i) => {
							const date = moment(startOfUnitUtc).subtract(i, interval);
							expect(timelineItem).toMap(timelineItemSchema, {
								date: date.format(dateFormat),
								timestamp: date.unix(),
							});
						});
					});

					expect(response.meta).toMap(metaSchema);
				});

				it(`returns stats for this ${interval} if called with ?limit=1`, async () => {
					const limit = 1;
					const response = await api.get(`${baseEndpoint}?interval=${interval}&limit=${limit}`);
					expect(response).toMap(goodRequestSchema);
					expect(response.data).toMap(transactionStatisticsSchema);
					const tokensList = Object.keys(response.data.timeline);
					tokensList.forEach((token) => {
						const tokenStatsTimeline = response.data.timeline[token];
						expect(tokenStatsTimeline).toHaveLength(1);
						tokenStatsTimeline.forEach(timelineItem => expect(timelineItem)
							.toMap(timelineItemSchema, {
								date: startOfUnitUtc.format(dateFormat),
								timestamp: startOfUnitUtc.unix(),
							}));
					});
					expect(response.meta).toMap(metaSchema, { limit });
				});

				it(`returns stats for previous ${interval} if called with ?limit=1&offset=1`, async () => {
					if (interval === 'day') {
						const limit = 1;
						const offset = 1;
						const startOfYesterday = moment(startOfUnitUtc).subtract(1, interval);

						const response = await api.get(`${baseEndpoint}?interval=${interval}&limit=${limit}&offset=${offset}`);
						expect(response).toMap(goodRequestSchema);
						expect(response.data).toMap(transactionStatisticsSchema);
						const tokensList = Object.keys(response.data.timeline);
						tokensList.forEach((token) => {
							const tokenStatsTimeline = response.data.timeline[token];
							expect(tokenStatsTimeline).toHaveLength(1);
							tokenStatsTimeline.forEach(timelineItem => expect(timelineItem)
								.toMap(timelineItemSchema, {
									date: startOfYesterday.format(dateFormat),
									timestamp: startOfYesterday.unix(),
								}));
						});
						expect(response.meta).toMap(metaSchema, {
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

						const response = await api.get(`${baseEndpoint}?interval=${interval}&limit=${limit}&offset=${offset}`);
						expect(response).toMap(goodRequestSchema);
						expect(response.data).toMap(transactionStatisticsSchema);
						const tokensList = Object.keys(response.data.timeline);
						tokensList.forEach((token) => {
							const timeline = response.data.timeline[token];
							expect(timeline).toBeInstanceOf(Array);
							expect(timeline.length).toBeGreaterThanOrEqual(1);
							expect(timeline.length).toBeLessThanOrEqual(limit);
							timeline.forEach((timelineItem, i) => {
								const date = moment(startOfUnitUtc).subtract(i + offset, interval);
								expect(timelineItem).toMap(timelineItemSchema, {
									date: date.format(dateFormat),
									timestamp: date.unix(),
								});
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
					const response = await api.get(`${baseEndpoint}?interval=${interval}&limit=101`, 400);
					expect(response).toMap(wrongInputParamSchema);
				});
			});
		});

		describe('GET /transactions/statistics?interval=year', () => {
			it('returns error if called without any params as years are not supported', async () => {
				const response = await api.get(`${baseEndpoint}?interval=year}`, 400);
				expect(response).toMap(badRequestSchema);
			});
		});
	});
});
