/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
import Joi from '@hapi/joi';
import to from 'await-to-js';
import { api } from '../../helpers/socketIoRpcRequest';
import { JSON_RPC } from '../../helpers/errorCodes';
import { badRequestSchema, goodRequestSchema } from '../../helpers/schemas';

const newsfeedEndpoint = 'get.newsfeed';

const newsfeedItemSchema = Joi.object({
	content: Joi.string().required(),
	source: Joi.string().required(),
	sourceId: Joi.string().required(),
	title: Joi.string().allow('').optional(),
	timestamp: Joi.number().required(),
	url: Joi.string().uri().required(),
	image_url: Joi.string().uri().allow(null).optional(),
	author: Joi.string().required(),
});

const dataSchema = Joi.array().items(newsfeedItemSchema);

describe(`Endpoint ${newsfeedEndpoint}`, () => {
	it('is able to get news', async () => {
		const limit = 10;
		const response = await api.getJsonRpcV1('get.newsfeed', { limit });
		expect(response.data).toMap(dataSchema.length(limit));
	});

	it('is able to return recent endpoints using a source name', async () => {
		const source = 'drupal_lisk_general';
		const response = await api.getJsonRpcV1(newsfeedEndpoint, { source });
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toHaveLength(10);
		response.data.forEach((item) => {
			expect(item).toMap(newsfeedItemSchema, { source });
		});
	});

	it('is able to return recent tweets using "twitter_lisk" source', async () => {
		const source = 'twitter_lisk';
		const response = await api.getJsonRpcV1(newsfeedEndpoint, { source });
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toHaveLength(10);
		response.data.forEach((item) => {
			expect(item).toMap(newsfeedItemSchema, { source });
		});
	});

	it('is able to return recent endpoints using multiple coma-separated source names', async () => {
		const source = ['drupal_lisk_general', 'twitter_lisk'];
		const response = await api.getJsonRpcV1(newsfeedEndpoint, { source });
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dataSchema.length(10));
	});

	it('is able to return recent endpoints as a merged list of many sources', async () => {
		const response = await api.getJsonRpcV1(newsfeedEndpoint);
		expect(response.data).toMap(dataSchema.length(10));
	});

	it('is able to return recent endpoints using limit', async () => {
		const limit = 2;
		const response = await api.getJsonRpcV1(newsfeedEndpoint, { limit });
		expect(response.data).toMap(dataSchema.length(limit));
	});

	it('is able to return recent endpoints using offset', async () => {
		const response = await api.getJsonRpcV1(newsfeedEndpoint, { offset: 1 });
		expect(response.data).toMap(dataSchema.length(10));
	});

	it('returns a proper error when unknown source', async () => {
		const [error] = await to(api.getJsonRpcV1(newsfeedEndpoint, { source: 'invalid' }));
		expect(error).toMap(badRequestSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});

	it('returns error when limit is too big', async () => {
		const [error] = await to(api.getJsonRpcV1(newsfeedEndpoint, { limit: 101 }));
		expect(error).toMap(badRequestSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});

	it('returns error when limit is too small', async () => {
		const [error] = await to(api.getJsonRpcV1(newsfeedEndpoint, { limit: 101 }));
		expect(error).toMap(badRequestSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});
});
