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
} = require('../../../schemas/rpcGenerics.schema');

const {
	goodRequestSchemaForAuth,
	authAccountInfoSchema,
	authAccountMetaSchema,
} = require('../../../schemas/api_v3/authAccountSchema.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getAuthAccountInfo = async (params) => request(wsRpcUrl, 'get.auth', params);
const getTransactions = async (params) => request(wsRpcUrl, 'get.transactions', params);

describe('get.auth', () => {
	let refTransaction;
	beforeAll(async () => {
		const response = await getTransactions({ moduleCommand: 'auth:registerMultisignature', limit: 1 });
		[refTransaction] = response.result.data;
	});

	it('returns auth account info', async () => {
		const response = await getAuthAccountInfo({ address: refTransaction.sender.address });
		expect(response).toMap(goodRequestSchemaForAuth);
		expect(response.data).toMap(authAccountInfoSchema);
		expect(response.meta).toMap(authAccountMetaSchema);
	});

	it('invalid address -> invalid params', async () => {
		const response = await getAuthAccountInfo({ address: 'lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('invalid request param -> invalid param', async () => {
		const response = await getAuthAccountInfo({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('No address -> invalid param', async () => {
		const response = await getAuthAccountInfo();
		expect(response).toMap(invalidParamsSchema);
	});
});
