/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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

import api from '../../helpers/api';
import config from '../../config';
import {
	goodRequestSchema, dataSchema, metaSchema, timelineItemSchema,
} from '../../schemas/transactionStatistics.schema';

const invalidRequestSchema = {
	message: 'string',
	errors: 'array',
};

const notFoundSchema = {
	error: 'string',
	url: 'string',
};

describe('GET /transactions/statistics/{aggregateBy}', () => {
	const baseUrl = `${config.SERVICE_ENDPOINT}/api/v1/transactions/statistics`;

	[{
		aggregateBy: 'day',
		dateFormat: 'YYYY-MM-DD',
	}, {
		aggregateBy: 'month',
		dateFormat: 'YYYY-MM',
	}].forEach(({ aggregateBy, dateFormat }) => {
		describe(`GET /transactions/statistics/${aggregateBy}`, () => {
			const endpoint = `${baseUrl}/${aggregateBy}`;
			const startOfUnitUtc = moment().utc().startOf(aggregateBy);

			it(`returns stats for last 10 ${aggregateBy}s if called without any params`, async () => {
				const response = await api.get(endpoint);
				expect(response).toMap(goodRequestSchema);
				expect(response.meta).toMap(metaSchema);
				expect(response.data).toMap(dataSchema);

				expect(response.data.timeline).toHaveLength(10);
				response.data.timeline.forEach((item, i) => {
					const date = moment(startOfUnitUtc).subtract(i, aggregateBy);

					expect(item).toMap(timelineItemSchema, {
						date: date.format(dateFormat),
						timestamp: date.unix(),
					});
				});
			});

			it(`returns stats for this ${aggregateBy} if called with ?limit=1`, async () => {
				const limit = 1;
				const response = await api.get(`${endpoint}?limit=${limit}`);
				expect(response).toMap(goodRequestSchema);
				expect(response.meta).toMap(metaSchema, { limit });
				expect(response.data).toMap(dataSchema);

				expect(response.data.timeline).toHaveLength(1);
				expect(response.data.timeline[0]).toMap(timelineItemSchema, {
					date: startOfUnitUtc.format(dateFormat),
					timestamp: startOfUnitUtc.unix(),
				});
			});

			it(`returns stats for previous ${aggregateBy} if called with ?limit=1&offset=1`, async () => {
				const limit = 1;
				const offset = 1;
				const starOfYestarday = moment(startOfUnitUtc).subtract(1, aggregateBy);

				const response = await api.get(`${endpoint}?limit=${limit}&offset=${offset}`);

				expect(response.meta).toMap(metaSchema, {
					offset,
					dateFormat,
					dateFrom: starOfYestarday.format(dateFormat),
					dateTo: starOfYestarday.format(dateFormat),
				});

				expect(response.data.timeline).toHaveLength(1);
				expect(response.data.timeline[0]).toMap(timelineItemSchema, {
					date: starOfYestarday.format(dateFormat),
					timestamp: starOfYestarday.unix(),
				});
			});

			it(`returns stats for previous ${aggregateBy} and the ${aggregateBy} before if called with ?limit=2&offset=1`, async () => {
				const offset = 1;
				const response = await api.get(`${endpoint}?limit=2&offset=${offset}`);

				expect(response.data.timeline).toHaveLength(2);
				response.data.timeline.forEach((item, i) => {
					const date = moment(startOfUnitUtc).subtract(i + offset, aggregateBy);

					expect(item).toMap(timelineItemSchema, {
						date: date.format(dateFormat),
						timestamp: date.unix(),
					});
				});
			});

			it('returns error 400 if called with ?limit=101 or higher', async () => {
				const response = await api.get(`${endpoint}?limit=101`, 400);
				expect(response).toMapRequiredSchema(invalidRequestSchema);
				expect(response.errors[0]).toMapRequiredSchema({
					...invalidRequestSchema,
					code: 'INVALID_REQUEST_PARAMETER',
				});
			});

			// TODO implement this case in the API
			it.todo('returns error 404 if called with ?offset=365 or higher as only last year is guarantied');
		});
	});

	describe('GET /transactions/statistics/year', () => {
		const endpoint = `${baseUrl}/year`;

		it('returns error 404 if called without any params as years are not supported', async () => {
			const response = await api.get(endpoint, 404);
			expect(response).toMapRequiredSchema(notFoundSchema);
		});
	});
});
