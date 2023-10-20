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
const { api } = require('../../../helpers/api');

const { badRequestSchema } = require('../../../schemas/httpGenerics.schema');

const { invokeResponseSchema } = require('../../../schemas/api_v3/invoke.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/invoke`;

describe('Invoke API', () => {
	it('should return response when valid SDK endpoint invoked', async () => {
		const response = await api.post(endpoint, { endpoint: 'system_getNodeInfo' });
		expect(response).toMap(invokeResponseSchema);
	});

	it('should return response when valid SDK endpoint invoked with valid params', async () => {
		const response = await api.post(endpoint, {
			endpoint: 'chain_getBlockByHeight',
			params: { height: 1 },
		});
		const [block] = (await api.get(`${baseUrlV3}/blocks?height=1`)).data;
		expect(response).toMap(invokeResponseSchema);

		const blockIDSDK = response.data.header.id;
		const blockIDService = block.id;
		expect(blockIDSDK).toEqual(blockIDService);
	});

	it('should return bad request when requested with valid SDK endpoint invoked with invalid params', async () => {
		const response = await api.post(
			endpoint,
			{ endpoint: 'chain_getBlockByHeight', params: { height: 'abc' } },
			400,
		);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request when requested with invalid SDK endpoint invoked', async () => {
		const response = await api.post(endpoint, { endpoint: 'chain_%' }, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request when requested with invalid request param', async () => {
		const response = await api.post(endpoint, { invalidParams: 'invalid' }, 400);
		expect(response).toMap(badRequestSchema);
	});
});
