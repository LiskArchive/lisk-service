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
import { invalidLimits, invalidOffsets } from '../constants/invalidInputs';

const config = require('../../../config');
const regex = require('../../../schemas/api_v3/regex');
const { api } = require('../../../helpers/api');

const { wrongInputParamSchema, badRequestSchema } = require('../../../schemas/httpGenerics.schema');

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
		[
			{
				interval: 'day',
				dateFormat: 'YYYY-MM-DD',
			},
			{
				interval: 'month',
				dateFormat: 'YYYY-MM',
			},
		].forEach(({ interval, dateFormat }) => {
			describe(`GET /transactions/statistics?interval=${interval}`, () => {
				const startOfIntervalInUTC = moment().utc().startOf(interval);

				it(`should return stats for last 10 ${interval}s if called without any params`, async () => {
					const response = await api.get(`${baseEndpoint}?interval=${interval}`);
					expect(response).toMap(goodRequestSchema);
					expect(response.data).toMap(transactionStatisticsSchema);

					const tokensListEntries = Object.entries(response.data.timeline);
					tokensListEntries.forEach(([tokenID, timeline]) => {
						expect(tokenID).toMatch(regex.TOKEN_ID);
						timeline.forEach((timelineItem, i) => {
							const date = moment(startOfIntervalInUTC).subtract(i, interval);
							expect(timelineItem).toMap(timelineItemSchema, {
								date: date.format(dateFormat),
								timestamp: date.unix(),
							});
						});
					});

					expect(response.meta).toMap(metaSchema);
				});

				it(`should return stats for this ${interval} if called with ?limit=1`, async () => {
					const limit = 1;
					const response = await api.get(`${baseEndpoint}?interval=${interval}&limit=${limit}`);
					expect(response).toMap(goodRequestSchema);
					expect(response.data).toMap(transactionStatisticsSchema);
					const tokensListEntries = Object.entries(response.data.timeline);
					tokensListEntries.forEach(([tokenID, timeline]) => {
						expect(tokenID).toMatch(regex.TOKEN_ID);
						expect(timeline).toHaveLength(1);
						timeline.forEach(timelineItem =>
							expect(timelineItem).toMap(timelineItemSchema, {
								date: startOfIntervalInUTC.format(dateFormat),
								timestamp: startOfIntervalInUTC.unix(),
							}),
						);
					});
					expect(response.meta).toMap(metaSchema, { limit });
				});

				it(`should return stats for previous ${interval} if called with ?limit=1&offset=1`, async () => {
					if (interval === 'day') {
						const limit = 1;
						const offset = 1;
						const startOfYesterday = moment(startOfIntervalInUTC).subtract(1, interval);

						const response = await api.get(
							`${baseEndpoint}?interval=${interval}&limit=${limit}&offset=${offset}`,
						);
						expect(response).toMap(goodRequestSchema);
						expect(response.data).toMap(transactionStatisticsSchema);
						const tokensListEntries = Object.entries(response.data.timeline);
						tokensListEntries.forEach(([tokenID, timeline]) => {
							expect(tokenID).toMatch(regex.TOKEN_ID);
							expect(timeline.length).toBeGreaterThanOrEqual(0);
							timeline.forEach(timelineItem =>
								expect(timelineItem).toMap(timelineItemSchema, {
									date: startOfYesterday.format(dateFormat),
									timestamp: startOfYesterday.unix(),
								}),
							);
						});

						expect(response.meta.duration).toMatchObject({
							format: dateFormat,
							from: startOfYesterday.format(dateFormat),
							to: startOfYesterday.format(dateFormat),
						});
						expect(response.meta).toMap(metaSchema, { limit, offset });
					}
				});

				it(`should return stats for previous ${interval} and the ${interval} before if called with ?limit=2&offset=1`, async () => {
					if (interval === 'day') {
						const limit = 2;
						const offset = 1;

						const response = await api.get(
							`${baseEndpoint}?interval=${interval}&limit=${limit}&offset=${offset}`,
						);
						expect(response).toMap(goodRequestSchema);
						expect(response.data).toMap(transactionStatisticsSchema);
						const tokensListEntries = Object.entries(response.data.timeline);
						tokensListEntries.forEach(([tokenID, timeline]) => {
							expect(tokenID).toMatch(regex.TOKEN_ID);
							expect(timeline).toBeInstanceOf(Array);
							expect(timeline.length).toBeGreaterThanOrEqual(0);
							expect(timeline.length).toBeLessThanOrEqual(limit);
							timeline.forEach((timelineItem, i) => {
								const date = moment(startOfIntervalInUTC).subtract(i + offset, interval);
								expect(timelineItem).toMap(timelineItemSchema, {
									date: date.format(dateFormat),
									timestamp: date.unix(),
								});
							});
						});

						expect(response.meta.duration).toMatchObject({ format: dateFormat });
						expect(response.meta).toMap(metaSchema, { limit, offset });
					}
				});

				it('should return error 400 if called with invalid limits', async () => {
					for (let i = 0; i < invalidLimits.length; i++) {
						const response = await api.get(
							`${baseEndpoint}?interval=${interval}&limit=${invalidLimits[i]}`,
							400,
						);
						expect(response).toMap(wrongInputParamSchema);
					}
				});

				it('should return error 400 if called with invalid offset', async () => {
					for (let i = 0; i < invalidLimits.length; i++) {
						const response = await api.get(
							`${baseEndpoint}?interval=${interval}&offset=${invalidOffsets[i]}`,
							400,
						);
						expect(response).toMap(wrongInputParamSchema);
					}
				});
			});
		});

		describe('GET /transactions/statistics?interval=year', () => {
			it('should return error if called without any params as years are not supported', async () => {
				const response = await api.get(`${baseEndpoint}?interval=year}`, 400);
				expect(response).toMap(badRequestSchema);
			});
		});
	});
});
