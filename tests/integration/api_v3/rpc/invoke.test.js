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
	jsonRpcEnvelopeSchema,
	invalidParamsSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	invokeResponseSchema,
	errorSchema,
} = require('../../../schemas/api_v3/invoke.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const invoke = async (params) => request(wsRpcUrl, 'post.invoke', params);

describe('post.invoke', () => {
	it('returns response when valid SDK endpoint invoked', async () => {
		const response = await invoke({ endpoint: 'system_getNodeInfo' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(invokeResponseSchema);
	});

	it('returns error when invalid SDK endpoint invoked', async () => {
		const response = await invoke({ endpoint: 'invalid_endpoint' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(invokeResponseSchema);
		expect(result.data.error).toMap(errorSchema);
	});

	it('Invalid request param -> bad request', async () => {
		const response = await invoke({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});
});
