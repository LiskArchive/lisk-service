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
const { request } = require('../../../helpers/socketIoRpcRequest');

const {
	jsonRpcEnvelopeSchema,
	invalidParamsSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	tokenConstantsSchema,
	tokenConstantsMetaSchema,
} = require('../../../schemas/api_v3/tokenConstants.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;

const getTokenConstants = async () => request(wsRpcUrl, 'get.token.constants');

describe('get.token.constants', () => {
	it('returns Token module constants', async () => {
		const response = await getTokenConstants();
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result.data).toMap(tokenConstantsSchema);
		expect(result.meta).toMap(tokenConstantsMetaSchema);
	});

	it('params not supported -> INVALID_PARAMS (-32602)', async () => {
		const response = await getTokenConstants({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});
});
