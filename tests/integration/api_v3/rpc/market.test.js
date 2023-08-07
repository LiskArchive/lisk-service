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
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
	serviceUnavailableSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	marketPriceSchema,
	marketPriceMetaSchema,
} = require('../../../schemas/api_v3/marketPrice.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getMarketPrices = async params => request(wsRpcUrl, 'get.market.prices', params);

describe('Method get.market.prices', () => {
	describe('is able to retrieve market prices', () => {
		it('should return market prices or SERVICE UNAVAILABLE when requested with no params', async () => {
			try {
				const response = await getMarketPrices({});
				expect(response).toMap(jsonRpcEnvelopeSchema);
				const { result } = response;
				expect(result.data).toBeInstanceOf(Array);
				expect(result.data.length).toBeGreaterThanOrEqual(1);
				result.data.forEach(account => expect(account).toMap(marketPriceSchema));
				expect(result.meta).toMap(marketPriceMetaSchema);
			} catch (_) {
				const response = await getMarketPrices({}).catch(e => e);
				expect(response).toMap(serviceUnavailableSchema);
			}
		});

		it('should return bad request when requested with invalid params', async () => {
			const response = await getMarketPrices({ limit: 10 });
			expect(response).toMap(invalidParamsSchema);
		});

		it('should return bad request when requested with empty invalid param', async () => {
			const response = await getMarketPrices({ limit: '' });
			expect(response).toMap(invalidParamsSchema);
		});
	});
});
