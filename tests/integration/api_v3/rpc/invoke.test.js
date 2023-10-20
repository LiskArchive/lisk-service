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
	invalidRequestSchema,
} = require('../../../schemas/rpcGenerics.schema');

const { invokeResponseSchema } = require('../../../schemas/api_v3/invoke.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const invoke = async params => request(wsRpcUrl, 'post.invoke', params);
const getBlocks = async params => request(wsRpcUrl, 'get.blocks', params);

describe('post.invoke', () => {
	it('should return response when valid SDK endpoint invoked', async () => {
		const response = await invoke({ endpoint: 'system_getNodeInfo' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(invokeResponseSchema);
	});

	it('should return response when valid SDK endpoint invoked with valid params', async () => {
		const response = await invoke({ endpoint: 'chain_getBlockByHeight', params: { height: 1 } });
		const [block] = (await getBlocks({ height: '1' })).result.data;
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(invokeResponseSchema);

		const blockIDSDK = result.data.header.id;
		const blockIDService = block.id;
		expect(blockIDSDK).toEqual(blockIDService);
	});

	it('should return invalid request when requested with valid SDK endpoint invoked with invalid params', async () => {
		const response = await invoke({
			endpoint: 'chain_getBlockByHeight',
			params: { height: 'abc' },
		});
		expect(response).toMap(invalidRequestSchema);
	});

	it('should return invalid request when requested with invalid SDK endpoint invoked', async () => {
		const response = await invoke({ endpoint: 'chain_%' });
		expect(response).toMap(invalidRequestSchema);
	});

	it('should return invalid params when requested with invalid request param', async () => {
		const response = await invoke({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});
});
