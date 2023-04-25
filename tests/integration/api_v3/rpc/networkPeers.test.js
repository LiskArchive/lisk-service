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

describe('Peers API', () => {
	describe('get.peers', () => {
		it('without request params -> ok', async () => {
			const response = await requestPeers({});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('empty ip -> ok', async () => {
			const response = await requestPeers({ ip: '' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('invalid ip -> bad request', async () => {
			const response = await requestPeers({ ip: '0' });
			expect(response).toMap(invalidParamsSchema);
		});

		it('valid networkVersion -> ok', async () => {
			const response = await requestPeers({ networkVersion: '2.0' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('empty networkVersion -> ok', async () => {
			const response = await requestPeers({ networkVersion: '' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('non-existent networkVersion -> empty response', async () => {
			const error = await requestPeers({ networkVersion: '9.99.0' });
			expect(error).toMap(emptyResponseSchema);
		});

		it('invalid networkVersion -> invalid param', async () => {
			const error = await requestPeers({ networkVersion: 'v3.0' });
			expect(error).toMap(invalidParamsSchema);
		});

		it('\'connected\' state -> ok', async () => {
			const response = await requestPeers({ state: 'connected' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('\'disconnected\' state -> ok', async () => {
			const response = await requestPeers({ state: 'disconnected' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('\'any\' state -> ok', async () => {
			const response = await requestPeers({ state: 'any' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('empty state -> ok', async () => {
			const response = await requestPeers({ state: '' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('invalid state 1 -> invalid param', async () => {
			const error = await requestPeers({ state: 'invalid' });
			expect(error).toMap(invalidParamsSchema);
		});

		it('invalid state 2 -> invalid param', async () => {
			const error = await requestPeers({ state: 1 });
			expect(error).toMap(invalidParamsSchema);
		});

		it('empty height -> ok', async () => {
			const response = await requestPeers({ height: '' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('non-existent height -> empty response', async () => {
			const error = await requestPeers({ height: 1000000000 });
			expect(error).toMap(emptyResponseSchema);
		});

		it('invalid height -> bad request', async () => {
			const error = await requestPeers({ height: -10 });
			expect(error).toMap(invalidParamsSchema);
		});

		it('limit=100 -> ok', async () => {
			const response = await requestPeers({ limit: 100 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(100);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('empty limit -> ok', async () => {
			const response = await requestPeers({ limit: '' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('empty offset -> ok', async () => {
			const response = await requestPeers({ offset: '' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('too big offset -> empty response', async () => {
			const response = await requestPeers({ offset: 1000000 });
			expect(response).toMap(emptyResponseSchema);
		});

		it('empty sort -> ok', async () => {
			const response = await requestPeers({ sort: '' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('wrong sort -> invalid param', async () => {
			const response = await requestPeers({ sort: 'height:ascc' });
			expect(response).toMap(invalidParamsSchema);
		});

		it('invalid request param -> invalid param', async () => {
			const response = await requestPeers({ invalidParam: 'invalid' });
			expect(response).toMap(invalidParamsSchema);
		});

		it('wrong url -> invalid request', async () => {
			const response = await request(wsRpcUrl, 'get.peers.connected', {});
			expect(response).toMap(wrongMethodSchema);
		});
	});

	describe('Peers sorted by height', () => {
		it('returns 10 peers sorted by height descending', async () => {
			const response = await requestPeers({ sort: 'height:desc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
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

		it('returns 10 peers sorted by height ascending', async () => {
			const response = await requestPeers({ sort: 'height:asc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
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
		it('returns 10 peers sorted by networkVersion descending', async () => {
			const response = await requestPeers({ sort: 'networkVersion:desc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevPeer = result.data[i - 1];
					const currPeer = result.data[i];
					expect(semver.gte(
						semver.coerce(prevPeer.networkVersion),
						semver.coerce(currPeer.networkVersion),
					)).toBeTruthy();
				}
			}
			expect(result.meta).toMap(metaSchema);
		});

		it('returns 10 peers sorted by networkVersion ascending', async () => {
			const response = await requestPeers({ sort: 'networkVersion:desc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(peer => expect(peer).toMap(networkPeerSchema));
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevPeer = result.data[i - 1];
					const currPeer = result.data[i];
					expect(semver.lte(
						semver.coerce(prevPeer.networkVersion),
						semver.coerce(currPeer.networkVersion),
					)).toBeTruthy();
				}
			}
			expect(result.meta).toMap(metaSchema);
		});
	});
});
