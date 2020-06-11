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
import api from '../../helpers/api';
import config from '../../config';

const newsfeedEndpoint = `${config.SERVICE_ENDPOINT}/api/v1/market/newsfeed`;

const goodRequestSchema = {
	data: 'array',
	meta: 'object',
	links: 'object',
};

const badRequestSchema = {
	errors: 'array',
	message: 'string',
};

const newsfeedItemSchema = {
	timestamp: 'number',
	content: 'string',
	source: 'string',
	title: 'string',
	url: 'string',
	author: 'string',
};

describe(`Endpoint ${newsfeedEndpoint}`, () => {
	it('is able to return recent endpoints using a source name', async () => {
		const source = 'drupal_lisk_general';
		const response = await api.get(`${newsfeedEndpoint}?source=${source}`);
		expect(response).toMapRequiredSchema(goodRequestSchema);
		expect(response.data).toHaveLength(10);
		response.data.forEach((item) => {
			expect(item).toMapRequiredSchema({
				...newsfeedItemSchema,
				source,
			});
		});
	});

	it('is able to return recent tweets using "twitter_lisk" source', async () => {
		const source = 'twitter_lisk';
		const response = await api.get(`${newsfeedEndpoint}?source=${source}`);
		expect(response).toMapRequiredSchema(goodRequestSchema);
		expect(response.data).toHaveLength(10);
		response.data.forEach((item) => {
			expect(item).toMapRequiredSchema({
				...newsfeedItemSchema,
				source,
			});
		});
	});

	it('is able to return recent endpoints using multiple coma-separated source names', async () => {
		const source = 'drupal_lisk_general,twitter_lisk';
		const response = await api.get(`${newsfeedEndpoint}?source=${source}`);
		expect(response).toMapRequiredSchema(goodRequestSchema);
		expect(response.data).toHaveLength(10);
		response.data.forEach((item) => {
			expect(item).toMapRequiredSchema(newsfeedItemSchema);
		});
	});

	it('is able to return recent endpoints as a merged list of many sources', async () => {
		const response = await api.get(newsfeedEndpoint);
		expect(response.data).toHaveLength(10);
		response.data.forEach((item) => {
			expect(item).toMapRequiredSchema(newsfeedItemSchema);
		});
	});

	it('is able to return recent endpoints using limit', async () => {
		const limit = 2;
		const response = await api.get(`${newsfeedEndpoint}?limit=${limit}`);
		expect(response.data).toHaveLength(limit);
		response.data.forEach((item) => {
			expect(item).toMapRequiredSchema(newsfeedItemSchema);
		});
	});

	it('is able to return recent endpoints using offset', async () => {
		const response = await api.get(`${newsfeedEndpoint}?offset=1`);
		expect(response.data).toHaveLength(10);
		response.data.forEach((item) => {
			expect(item).toMapRequiredSchema(newsfeedItemSchema);
		});
	});

	it('returns a proper error when unknown source', async () => {
		const response = await api.get(`${newsfeedEndpoint}?source=invalid`, 400);
		expect(response).toMapRequiredSchema(badRequestSchema);
	});

	it('returns error when limit is too big', async () => {
		const response = await api.get(`${newsfeedEndpoint}?limit=101`, 400);
		expect(response).toMapRequiredSchema(badRequestSchema);
	});
});
