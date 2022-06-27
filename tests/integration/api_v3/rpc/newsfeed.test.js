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
const config = require('../../../config');
const { request } = require('../../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
	serviceUnavailableSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	newsfeedSchema,
	newsfeedMetaSchema,
} = require('../../../schemas/api_v3/newsfeed.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getNewsfeed = async params => request(wsRpcUrl, 'get.newsfeed', params);

describe('Method get.newsfeed.articles', () => {
	describe('is able to retrieve news/blog posts', () => {
		it('returns news', async () => {
			try {
				const response = await getNewsfeed({});
				expect(response).toMap(jsonRpcEnvelopeSchema);
				const { result } = response;
				expect(result.data).toBeInstanceOf(Array);
				expect(result.data.length).toBeGreaterThanOrEqual(1);
				expect(result.data.length).toBeLessThanOrEqual(10);
				result.data.forEach(news => expect(news).toMap(newsfeedSchema));
				expect(result.meta).toMap(newsfeedMetaSchema);
			} catch (_) {
				const response = await getNewsfeed({}).catch(e => e);
				expect(response).toMap(serviceUnavailableSchema);
			}
		});

		it('retrieve news by param: drupal_lisk_general', async () => {
			const response = await getNewsfeed({ source: 'drupal_lisk_general' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(news => {
				expect(news).toMap(newsfeedSchema);
				expect(news.source).toEqual('drupal_lisk_general');
			});
			expect(result.meta).toMap(newsfeedMetaSchema);
		});

		xit('retrieve news by param: twitter_lisk', async () => {
			const response = await getNewsfeed({ source: 'twitter_lisk' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(news => {
				expect(news).toMap(newsfeedSchema);
				expect(news.source).toEqual('twitter_lisk');
			});
			expect(result.meta).toMap(newsfeedMetaSchema);
		});

		it('retrieve news by multiple sources', async () => {
			const response = await getNewsfeed({ source: 'drupal_lisk_general,drupal_lisk_announcements' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(news => {
				expect(news).toMap(newsfeedSchema);
				expect(news.source).toMatch(/^\bdrupal_lisk(?:_general|_announcements)\b$/);
			});
			expect(result.meta).toMap(newsfeedMetaSchema);
		});

		it('retrieve news with limit & offset', async () => {
			const limit = 5;
			const offset = 1;
			const response = await getNewsfeed({
				source: 'drupal_lisk_general',
				limit,
				offset,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(limit);
			result.data.forEach(news => {
				expect(news).toMap(newsfeedSchema);
				expect(news.source).toEqual('drupal_lisk_general');
			});
			expect(result.meta).toMap(newsfeedMetaSchema);
			expect(result.meta.offset).toEqual(offset);
		});

		it('retrieve news by multiple params with limit & offset', async () => {
			const limit = 5;
			const offset = 1;
			const response = await getNewsfeed({
				source: 'drupal_lisk_general,drupal_lisk_announcements',
				limit,
				offset,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(limit);
			result.data.forEach(news => {
				expect(news).toMap(newsfeedSchema);
				expect(news.source).toMatch(/^\b(?:(?:drupal_lisk(?:_general|_announcements)|),?)+\b$/);
			});
			expect(result.meta).toMap(newsfeedMetaSchema);
			expect(result.meta.offset).toEqual(offset);
		});

		it('ensure retrieved news is in reverse chronology', async () => {
			const response = await getNewsfeed({});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((news, index) => {
				expect(news).toMap(newsfeedSchema);
				expect(news.source).toMatch(/^\b(?:(?:drupal_lisk(?:_general|_announcements)|twitter_lisk),?)+\b$/);
				if (index) {
					const prevNews = result.data[index - 1];
					expect(prevNews.createdAt).toBeGreaterThanOrEqual(news.createdAt);
				}
			});
			expect(result.meta).toMap(newsfeedMetaSchema);
		});

		it('error when invalid params', async () => {
			const response = await getNewsfeed({ invalidParam: '4584a7d2db15920e130eeaf1014f87c99b5af329' });
			expect(response).toMap(invalidParamsSchema);
		});
	});
});
