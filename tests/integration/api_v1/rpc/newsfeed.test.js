/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
	metaSchema,
	serviceUnavailableSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	newsfeedSchema,
} = require('../../../schemas/newsfeed.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v1`;
const getNewsfeed = async params => request(wsRpcUrl, 'get.newsfeed.articles', params);

describe('Method get.newsfeed.articles', () => {
	describe('is able to retrieve news/blog posts', () => {
		it('returns news', async () => {
			try {
				const response = await getNewsfeed({});
				expect(response).toMap(jsonRpcEnvelopeSchema);
				const { result } = response;
				expect(result.data).toBeInstanceOf(Array);
				expect(result.data.length).toBeGreaterThanOrEqual(1);
				expect(result.data.length).toBeLessThanOrEqual(10);
				result.data.forEach(news => expect(news).toMap(newsfeedSchema));
				expect(result.meta).toMap(metaSchema);
			} catch (_) {
				const response = await getNewsfeed({}).catch(e => e);
				expect(response).toMap(serviceUnavailableSchema);
			}
		});

		it('error when invalid params', async () => {
			const response = await getNewsfeed({ invalidParam: '4584a7d2db15920e130eeaf1014f87c99b5af329' });
			expect(response).toMap(invalidParamsSchema);
		});
	});
});
