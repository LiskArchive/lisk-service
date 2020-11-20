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
const config = require('../../config');
const { api } = require('../../helpers/api');

const {
	goodRequestSchema,
	metaSchema,
	badRequestSchema,
	urlNotFoundSchema,
	notFoundSchema,
} = require('../../schemas/httpGenerics.schema');

const {
	peerSchema,
} = require('../../schemas/peer.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV1 = `${baseUrl}/api/v1`;
const endpoint = `${baseUrlV1}/peers`;

describe('Peers API', () => {
	describe('GET /peers', () => {
		it('required and optional properties -> ok', async () => {
			const response = await api.get(`${endpoint}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(peer => expect(peer).toMap(peerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('wrong ip -> not found error', async () => {
			const response = await api.get(`${endpoint}?ip=0`, 404);
			expect(response).toMap(notFoundSchema);
		});

		it('wrong url -> not found error', async () => {
			const response = await api.get(`${endpoint}/112`, 404);
			expect(response).toMap(urlNotFoundSchema);
		});

		it('wrong httpPort -> bad request error', async () => {
			const response = await api.get(`${endpoint}?httpPort=70000000`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('wrong wsPort -> bad request error', async () => {
			const response = await api.get(`${endpoint}?wsPort=70000000`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('wrong os -> not found error', async () => {
			const response = await api.get(`${endpoint}?os=linux4.4.0-134-generic0000000`, 404);
			expect(response).toMap(notFoundSchema);
		});

		it('empty version -> ignore', async () => {
			const response = await api.get(`${endpoint}?version=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(peer => expect(peer).toMap(peerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid version -> bad request error', async () => {
			const response = await api.get(`${endpoint}?state=3`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('non-existent height -> not found error', async () => {
			const response = await api.get(`${endpoint}?height=1000000000`, 404);
			expect(response).toMap(notFoundSchema);
		});

		it('non-existent broadhash -> not found error', async () => {
			const response = await api.get(`${endpoint}?broadhash=bf8b9d02a2167933be8c4a22b90992aee55204dca4452b3844208754a3baeb7b000000`, 404);
			expect(response).toMap(notFoundSchema);
		});

		it('limit=100 -> ok', async () => {
			const response = await api.get(`${endpoint}?limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data).toBeArrayOfSize(100);
			response.data.forEach(peer => expect(peer).toMap(peerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('empty limit -> return all', async () => {
			const response = await api.get(`${endpoint}?limit=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(peer => expect(peer).toMap(peerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('empty offset -> return all', async () => {
			const response = await api.get(`${endpoint}?offset=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(peer => expect(peer).toMap(peerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('too big offset -> not found error', async () => {
			const response = await api.get(`${endpoint}?offset=1000000`, 404);
			expect(response).toMap(notFoundSchema);
		});

		it('empty sort -> ignore', async () => {
			const response = await api.get(`${endpoint}?sort=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(peer => expect(peer).toMap(peerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('wrong sort -> bad request error', async () => {
			const response = await api.get(`${endpoint}?sort=height:ascc`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('retrieves connected peers by state name', async () => {
			const response = await api.get(`${endpoint}?state=connected`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(peer => expect(peer).toMap(peerSchema, { state: 2, stateName: 'connected' }));
			expect(response.meta).toMap(metaSchema);
		});

		it('retrieves disconnected peers by state name', async () => {
			const response = await api.get(`${endpoint}?state=disconnected`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(peer => expect(peer).toMap(peerSchema, { state: 1, stateName: 'disconnected' }));
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('GET /peers/connected', () => {
		it('returns connected peers', async () => {
			const response = await api.get(`${endpoint}/connected`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(peer => expect(peer).toMap(peerSchema, { state: 2, stateName: 'connected' }));
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('GET /peers/disconnected', () => {
		it('returns disconnected peers', async () => {
			const response = await api.get(`${endpoint}/disconnected`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			response.data.forEach(peer => expect(peer).toMap(peerSchema, { state: 1, stateName: 'disconnected' }));
			expect(response.meta).toMap(metaSchema);
		});
	});
});
