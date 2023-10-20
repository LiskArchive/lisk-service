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
const { request } = require('../../../helpers/socketIoRpcRequest');

const {
	wrongMethodSchema,
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
	metaSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	emptyResponseSchema,
	networkPeerSchema,
} = require('../../../schemas/api_v3/networkPeer.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const requestPeers = async params => request(wsRpcUrl, 'get.network.peers', params);
const invoke = async params => request(wsRpcUrl, 'post.invoke', params);

describe('Network peers API', () => {
	describe('get.peers', () => {
		it('should return peers without request params', async () => {
			const response = await requestPeers({});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('should return peers with empty IP', async () => {
			const response = await requestPeers({ ip: '' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('should return a bad request for invalid IP', async () => {
			const response = await requestPeers({ ip: '0' });
			expect(response).toMap(invalidParamsSchema);
		});

		it('should return peers with valid networkVersion', async () => {
			const invokeRes = await invoke({ endpoint: 'system_getNodeInfo' });
			const { networkVersion } = invokeRes.result.data;

			const response = await requestPeers({ networkVersion });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('should return peers with empty networkVersion', async () => {
			const response = await requestPeers({ networkVersion: '' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('should return an empty response for non-existent networkVersion', async () => {
			const error = await requestPeers({ networkVersion: '9.99.0' });
			expect(error).toMap(emptyResponseSchema);
		});

		it('should return a bad request for an invalid networkVersion', async () => {
			const error = await requestPeers({ networkVersion: 'v3.0' });
			expect(error).toMap(invalidParamsSchema);
		});

		it('should return peers in the "connected" state', async () => {
			const response = await requestPeers({ state: 'connected' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('should return peers in the "disconnected" state', async () => {
			const response = await requestPeers({ state: 'disconnected' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('should return peers in the "any" state', async () => {
			const response = await requestPeers({ state: 'any' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('should return peers with empty state', async () => {
			const response = await requestPeers({ state: '' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('should return a bad request for an invalid state 1', async () => {
			const error = await requestPeers({ state: 'invalid' });
			expect(error).toMap(invalidParamsSchema);
		});

		it('should return a bad request for an invalid state 2', async () => {
			const error = await requestPeers({ state: 1 });
			expect(error).toMap(invalidParamsSchema);
		});

		it('should return peers with empty height', async () => {
			const response = await requestPeers({ height: '' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('should return an empty response for a non-existent height', async () => {
			const error = await requestPeers({ height: Number.MAX_SAFE_INTEGER });
			expect(error).toMap(emptyResponseSchema);
		});

		it('should return a bad request for an invalid height', async () => {
			const error = await requestPeers({ height: -10 });
			expect(error).toMap(invalidParamsSchema);
		});

		it('should return up to 100 peers with limit=100', async () => {
			const response = await requestPeers({ limit: 100 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(100);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('should return peers with empty limit', async () => {
			const response = await requestPeers({ limit: '' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('should return peers with empty offset', async () => {
			const response = await requestPeers({ offset: '' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('should return an empty response for a too big offset', async () => {
			const response = await requestPeers({ offset: 1000000 });
			expect(response).toMap(emptyResponseSchema);
		});

		it('should return peers with empty sort', async () => {
			const response = await requestPeers({ sort: '' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('should return a bad request for a wrong sort', async () => {
			const response = await requestPeers({ sort: 'height:ascc' });
			expect(response).toMap(invalidParamsSchema);
		});

		it('should return a bad request for an invalid request param', async () => {
			const response = await requestPeers({ invalidParam: 'invalid' });
			expect(response).toMap(invalidParamsSchema);
		});

		it('should return an invalid request for a wrong URL', async () => {
			const response = await request(wsRpcUrl, 'get.peers.connected', {});
			expect(response).toMap(wrongMethodSchema);
		});
	});

	describe('Peers sorted by height', () => {
		it('should return 10 peers sorted by height descending', async () => {
			const response = await requestPeers({ sort: 'height:desc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevPeer = result.data[i - 1];
					const currPeer = result.data[i];
					expect(prevPeer.height).toBeGreaterThanOrEqual(currPeer.height);
				}
			}
			expect(result.meta).toMap(metaSchema);
		});

		it('should return 10 peers sorted by height ascending', async () => {
			const response = await requestPeers({ sort: 'height:asc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevPeer = result.data[i - 1];
					const currPeer = result.data[i];
					expect(prevPeer.height).toBeLessThanOrEqual(currPeer.height);
				}
			}
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('Peers sorted by networkVersion', () => {
		it('should return 10 peers sorted by networkVersion descending', async () => {
			const response = await requestPeers({ sort: 'networkVersion:desc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevPeer = result.data[i - 1];
					const currPeer = result.data[i];
					expect(
						semver.gte(
							semver.coerce(prevPeer.networkVersion),
							semver.coerce(currPeer.networkVersion),
						),
					).toBeTruthy();
				}
			}
			expect(result.meta).toMap(metaSchema);
		});

		it('should return 10 peers sorted by networkVersion ascending', async () => {
			const response = await requestPeers({ sort: 'networkVersion:asc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(0);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevPeer = result.data[i - 1];
					const currPeer = result.data[i];
					expect(
						semver.lte(
							semver.coerce(prevPeer.networkVersion),
							semver.coerce(currPeer.networkVersion),
						),
					).toBeTruthy();
				}
			}
			expect(result.meta).toMap(metaSchema);
		});
	});
});
