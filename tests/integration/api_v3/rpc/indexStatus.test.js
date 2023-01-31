/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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

const {
	request,
} = require('../../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	indexStatusResponseSchema,
	goodResponseSchema,
	indexStatusMetaResponseSchema,
} = require('../../../schemas/api_v3/indexStatus.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getIndexStatus = async (params) => request(wsRpcUrl, 'get.index.status', params);

describe('get.index.status', () => {
	it('Retrieves index status', async () => {
		const response = await getIndexStatus({});
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodResponseSchema);
		expect(result.data).toBeInstanceOf(Object);
		expect(result.data).toMap(indexStatusResponseSchema);
		expect(result.meta).toMap(indexStatusMetaResponseSchema);
	});

	it('Invalid request param -> invalid param', async () => {
		const response = await getIndexStatus({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});
});
