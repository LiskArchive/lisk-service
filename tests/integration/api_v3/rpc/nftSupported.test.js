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

const { nftSupportedSchema } = require('../../../schemas/api_v3/nftSupported.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;

const getNFTSupported = async (params) => request(wsRpcUrl, 'get.nft.supported', params);

describe('get.nft.supported', () => {
	it('returns NFT module supported', async () => {
		const response = await getNFTSupported();
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(nftSupportedSchema);
	});

	it('params not supported -> INVALID_PARAMS (-32602)', async () => {
		const response = await getNFTSupported(
			{ someparam: 'not_supported' },
		).catch(e => e);
		expect(response).toMap(invalidParamsSchema);
	});
});
