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
const semver = require('semver');
const config = require('../../../config');
const { api } = require('../../../helpers/api');

const {
	goodRequestSchema,
	metaSchema,
	badRequestSchema,
	urlNotFoundSchema,
} = require('../../../schemas/httpGenerics.schema');

const { networkPeerSchema } = require('../../../schemas/api_v3/networkPeer.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/network/peers`;
const invokeEndpoint = `${baseUrlV3}/invoke`;

describe('Network peers API', () => {
	describe('GET /peers', () => {
		it('should work without request params', async () => {
			const response = await api.get(`${endpoint}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(0);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('should work with empty ip', async () => {
			const response = await api.get(`${endpoint}?ip=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(0);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('should return a bad request for an invalid IP', async () => {
			const response = await api.get(`${endpoint}?ip=0`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('should work with a valid networkVersion', async () => {
			const invokeRes = await api.post(invokeEndpoint, { endpoint: 'system_getNodeInfo' });
			const { networkVersion } = invokeRes.data;

			const response = await api.get(`${endpoint}?networkVersion=${networkVersion}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(0);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('should work with empty networkVersion', async () => {
			const response = await api.get(`${endpoint}?networkVersion=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(0);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('should return no peers for a non-existent networkVersion', async () => {
			const response = await api.get(`${endpoint}?networkVersion=9.99.0`);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBe(0);
			expect(response.meta).toMap(metaSchema);
		});

		it('should return a bad request for an invalid networkVersion', async () => {
			const response = await api.get(`${endpoint}?networkVersion=v3.0`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('should work with state=connected', async () => {
			const response = await api.get(`${endpoint}?state=connected`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(0);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('should work with state=disconnected', async () => {
			const response = await api.get(`${endpoint}?state=disconnected`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(0);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('should work with state=any', async () => {
			const response = await api.get(`${endpoint}?state=any`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(0);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('should work with empty state', async () => {
			const response = await api.get(`${endpoint}?state=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(0);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('should return a bad request for an invalid state', async () => {
			const response = await api.get(`${endpoint}?state=invalid`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('should return a bad request for an invalid state', async () => {
			const response = await api.get(`${endpoint}?state=1`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('should work with empty height', async () => {
			const response = await api.get(`${endpoint}?height=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(0);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('should return no peers for a non-existent height', async () => {
			const response = await api.get(`${endpoint}?height=${Number.MAX_SAFE_INTEGER}`);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBe(0);
			expect(response.meta).toMap(metaSchema);
		});

		it('should return a bad request for an invalid height', async () => {
			const response = await api.get(`${endpoint}?height=-10`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('should work with limit=100', async () => {
			const response = await api.get(`${endpoint}?limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(0);
			expect(response.data.length).toBeLessThanOrEqual(100);
			response.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('should work with empty limit', async () => {
			const response = await api.get(`${endpoint}?limit=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(0);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('should work with empty offset', async () => {
			const response = await api.get(`${endpoint}?offset=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(0);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('should return no peers for a too big offset', async () => {
			const response = await api.get(`${endpoint}?offset=1000000`);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBe(0);
			expect(response.meta).toMap(metaSchema);
		});

		it('should work with empty sort', async () => {
			const response = await api.get(`${endpoint}?sort=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(0);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('should return a bad request for a wrong sort', async () => {
			const response = await api.get(`${endpoint}?sort=height:ascc`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('should return a bad request for an invalid request param', async () => {
			const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('should return 404 NOT FOUND for a wrong URL', async () => {
			const response = await api.get(`${endpoint}/112`, 404);
			expect(response).toMap(urlNotFoundSchema);
		});
	});

	describe('Peers sorted by height', () => {
		it('should return 10 peers sorted by height descending', async () => {
			const response = await api.get(`${endpoint}?sort=height:desc`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(0);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			if (response.data.length > 1) {
				for (let i = 1; i < response.data.length; i++) {
					const prevPeer = response.data[i - 1];
					const currPeer = response.data[i];
					expect(prevPeer.height).toBeGreaterThanOrEqual(currPeer.height);
				}
			}
			expect(response.meta).toMap(metaSchema);
		});

		it('should return 10 peers sorted by height ascending', async () => {
			const response = await api.get(`${endpoint}?sort=height:asc`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(0);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			if (response.data.length > 1) {
				for (let i = 1; i < response.data.length; i++) {
					const prevPeer = response.data[i - 1];
					const currPeer = response.data[i];
					expect(prevPeer.height).toBeLessThanOrEqual(currPeer.height);
				}
			}
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Peers sorted by networkVersion', () => {
		it('should return 10 peers sorted by networkVersion descending', async () => {
			const response = await api.get(`${endpoint}?sort=networkVersion:desc`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(0);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			if (response.data.length > 1) {
				for (let i = 1; i < response.data.length; i++) {
					const prevPeer = response.data[i - 1];
					const currPeer = response.data[i];
					expect(
						semver.gte(
							semver.coerce(prevPeer.networkVersion),
							semver.coerce(currPeer.networkVersion),
						),
					).toBeTruthy();
				}
			}
			expect(response.meta).toMap(metaSchema);
		});

		it('should return 10 peers sorted by networkVersion ascending', async () => {
			const response = await api.get(`${endpoint}?sort=networkVersion:asc`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(0);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			if (response.data.length > 1) {
				for (let i = 1; i < response.data.length; i++) {
					const prevPeer = response.data[i - 1];
					const currPeer = response.data[i];
					expect(
						semver.lte(
							semver.coerce(prevPeer.networkVersion),
							semver.coerce(currPeer.networkVersion),
						),
					).toBeTruthy();
				}
			}
			expect(response.meta).toMap(metaSchema);
		});
	});
});
