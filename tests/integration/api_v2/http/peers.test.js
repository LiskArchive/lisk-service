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
	metaSchema,
	badRequestSchema,
	urlNotFoundSchema,
	notFoundSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	peerSchema,
} = require('../../../schemas/api_v2/peer.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV2 = `${baseUrl}/api/v2`;
const endpoint = `${baseUrlV2}/peers`;

describe('Peers API', () => {
	describe('GET /peers', () => {
		xit('without request params -> ok', async () => {
			const response = await api.get(`${endpoint}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(peerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		xit('empty ip -> ok', async () => {
			const response = await api.get(`${endpoint}?ip=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(peerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid ip -> bad request', async () => {
			const response = await api.get(`${endpoint}?ip=0`, 400);
			expect(response).toMap(badRequestSchema);
		});

		xit('valid networkVersion -> ok', async () => {
			const response = await api.get(`${endpoint}?networkVersion=2.0`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(peerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		xit('empty networkVersion -> ok', async () => {
			const response = await api.get(`${endpoint}?networkVersion=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(peerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('non-existent networkVersion -> not found', async () => {
			const response = await api.get(`${endpoint}?networkVersion=9.99.0`, 404);
			expect(response).toMap(urlNotFoundSchema);
		});

		it('invalid networkVersion -> bad request', async () => {
			const response = await api.get(`${endpoint}?networkVersion=v2.0`, 400);
			expect(response).toMap(badRequestSchema);
		});

		xit('\'connected\' state -> ok', async () => {
			const response = await api.get(`${endpoint}?state=connected`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(peerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		xit('\'disconnected\' state -> ok', async () => {
			const response = await api.get(`${endpoint}?state=disconnected`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(peerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		xit('\'any\' state -> ok', async () => {
			const response = await api.get(`${endpoint}?state=any`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(peerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		xit('empty state -> ok', async () => {
			const response = await api.get(`${endpoint}?state=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(peerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid state 1 -> bad request', async () => {
			const response = await api.get(`${endpoint}?state=invalid`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('invalid state 2 -> bad request', async () => {
			const response = await api.get(`${endpoint}?state=1`, 400);
			expect(response).toMap(badRequestSchema);
		});

		xit('empty height -> ok', async () => {
			const response = await api.get(`${endpoint}?height=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(peerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('non-existent height -> not found error', async () => {
			const response = await api.get(`${endpoint}?height=1000000000`, 404);
			expect(response).toMap(notFoundSchema);
		});

		it('invalid height -> bad request', async () => {
			const response = await api.get(`${endpoint}?height=-10`, 400);
			expect(response).toMap(badRequestSchema);
		});

		xit('limit=100 -> ok', async () => {
			const response = await api.get(`${endpoint}?limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(100);
			response.data.forEach(peer => expect(peer).toMap(peerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		xit('empty limit -> ok', async () => {
			const response = await api.get(`${endpoint}?limit=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(peerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		xit('empty offset -> ok', async () => {
			const response = await api.get(`${endpoint}?offset=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(peerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('too big offset -> not found error', async () => {
			const response = await api.get(`${endpoint}?offset=1000000`, 404);
			expect(response).toMap(notFoundSchema);
		});

		xit('empty sort -> ok', async () => {
			const response = await api.get(`${endpoint}?sort=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(peerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('wrong sort -> bad request error', async () => {
			const response = await api.get(`${endpoint}?sort=height:ascc`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('invalid request param -> bad request', async () => {
			const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('wrong url -> not found', async () => {
			const response = await api.get(`${endpoint}/112`, 404);
			expect(response).toMap(urlNotFoundSchema);
		});
	});
});
