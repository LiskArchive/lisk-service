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
const config = require('../../config');
const { request } = require('../../helpers/socketIoRpcRequest');

const {
	goodRequestSchema,
	jsonRpcEnvelopeSchema,
	invalidParamsSchema,
} = require('../../schemas/rpcGenerics.schema');

const {
	networkStatusSchema,
} = require('../../schemas/networkStatus.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v1`;
const requestNetworkStatus = async params => request(wsRpcUrl, 'get.network.status', params);

describe('get.network.status', () => {
	it('returns network status', async () => {
		const response = await requestNetworkStatus();
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(networkStatusSchema);
	});

	it('params not supported -> 400 BAD REQUEST', async () => {
		const response = await requestNetworkStatus({ someparam: 'not_supported' }).catch(e => e);
		expect(response).toMap(invalidParamsSchema);
	});
});
