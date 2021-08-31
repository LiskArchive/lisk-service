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
const config = require('../../../config');
const { api } = require('../../../helpers/api');

const {
	goodRequestSchema,
	badRequestSchema,
	serviceUnavailableSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	metaSchema,
	newsfeedSchema,
} = require('../../../schemas/newsfeed.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV2 = `${baseUrl}/api/v2`;
const endpoint = `${baseUrlV2}/newsfeed`;

describe('Newsfeed API', () => {
	describe('Retrieve news/blog posts', () => {
		it('returns news or 503 SERVICE UNAVAILABLE', async () => {
			try {
				const response = await api.get(`${endpoint}`);
				expect(response).toMap(goodRequestSchema);
				expect(response.data).toBeInstanceOf(Array);
				expect(response.data.length).toBeGreaterThanOrEqual(1);
				expect(response.data.length).toBeLessThanOrEqual(10);
				response.data.forEach(news => expect(news).toMap(newsfeedSchema));
				expect(response.meta).toMap(metaSchema);
			} catch (err) {
				const expectedResponseCode = 503;
				const response = await api.get(`${endpoint}`, expectedResponseCode);
				expect(response).toMap(serviceUnavailableSchema);
			}
		});

		it('retrieve news by param: drupal_lisk_general', async () => {
			const response = await api.get(`${endpoint}?source=drupal_lisk_general`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(news => {
				expect(news).toMap(newsfeedSchema);
				expect(news.source).toEqual('drupal_lisk_general');
			});
			expect(response.meta).toMap(metaSchema);
		});

		xit('retrieve news by param: twitter_lisk', async () => {
			const response = await api.get(`${endpoint}?source=twitter_lisk`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(news => {
				expect(news).toMap(newsfeedSchema);
				expect(news.source).toEqual('twitter_lisk');
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('retrieve news by multiple params', async () => {
			const response = await api.get(`${endpoint}?source=drupal_lisk_general,drupal_lisk_announcements`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(news => {
				expect(news).toMap(newsfeedSchema);
				expect(news.source).toMatch(/^\b(?:(?:drupal_lisk(?:_general|_announcements)|),?)+\b$/);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('retrieve news with limit & offset', async () => {
			const limit = 5;
			const offset = 1;
			const response = await api.get(`${endpoint}?source=drupal_lisk_general&limit=${limit}&offset=${offset}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(limit);
			response.data.forEach(news => {
				expect(news).toMap(newsfeedSchema);
				expect(news.source).toEqual('drupal_lisk_general');
			});
			expect(response.meta).toMap(metaSchema);
			expect(response.meta.offset).toEqual(offset);
		});

		it('retrieve news by multiple params with limit & offset', async () => {
			const limit = 5;
			const offset = 1;
			const response = await api.get(`${endpoint}?source=drupal_lisk_general,drupal_lisk_announcements&limit=${limit}&offset=${offset}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(limit);
			response.data.forEach(news => {
				expect(news).toMap(newsfeedSchema);
				expect(news.source).toMatch(/^\bdrupal_lisk(?:_general|_announcements)\b$/);
			});
			expect(response.meta).toMap(metaSchema);
			expect(response.meta.offset).toEqual(offset);
		});

		it('returns 400 BAD REQUEST with invalid params', async () => {
			const expectedResponseCode = 400;
			const response = await api.get(`${endpoint}?invalidParam=4584a7d2db15920e130eeaf1014f87c99b5af329`, expectedResponseCode);
			expect(response).toMap(badRequestSchema);
		});
	});
});
