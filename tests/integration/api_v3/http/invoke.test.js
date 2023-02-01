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

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;

const {
	badRequestSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	invokeResponseSchema,
	errorSchema,
} = require('../../../schemas/api_v3/invoke.schema');

const endpoint = `${baseUrlV3}/invoke`;

describe('Invoke API', () => {
	it('Returns response when valid SDK endpoint invoked', async () => {
		const response = await api.post(endpoint, { endpoint: 'system_getNodeInfo' });
		expect(response).toMap(invokeResponseSchema);
	});

	it('Returns error when invalid SDK endpoint invoked', async () => {
		const response = await api.post(endpoint, { endpoint: 'invalid_endpoint' });
		expect(response).toMap(invokeResponseSchema);
		expect(response.data.error).toMap(errorSchema);
	});

	it('Invalid request param -> bad request', async () => {
		const response = await api.post(endpoint, { invalidParams: 'invalid' }, 400);
		expect(response).toMap(badRequestSchema);
	});
});
