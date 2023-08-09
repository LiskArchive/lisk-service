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

const {
	request,
} = require('../../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	goodRequestSchemaForAuth,
	authAccountInfoSchema,
	authAccountMetaSchema,
} = require('../../../schemas/api_v3/authAccountSchema.schema');

const {
	invalidAddresses,
} = require('../constants/invalidInputs');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getAuthAccountInfo = async (params) => request(wsRpcUrl, 'get.auth', params);
const getTransactions = async (params) => request(wsRpcUrl, 'get.transactions', params);

describe('get.auth', () => {
	let refTransaction;
	beforeAll(async () => {
		const response = await getTransactions({ moduleCommand: 'auth:registerMultisignature', limit: 1 });
		[refTransaction] = response.result.data;
	});

	it('should retrieve auth account info for a valid address', async () => {
		const response = await getAuthAccountInfo({ address: refTransaction.sender.address });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchemaForAuth);
		expect(result.data).toMap(authAccountInfoSchema);
		expect(result.meta).toMap(authAccountMetaSchema);
	});

	it('should return invalid params for missing address parameter', async () => {
		const response = await getAuthAccountInfo();
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return invalid params for an invalid address', async () => {
		for (let i = 0; i < invalidAddresses.length; i++) {
			// eslint-disable-next-line no-await-in-loop
			const response = await getAuthAccountInfo({ address: invalidAddresses[i] });
			expect(response).toMap(invalidParamsSchema);
		}
	});
});
