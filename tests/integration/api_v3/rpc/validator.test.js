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
	goodRequestSchemaForValidator,
	validatorInfoSchema,
	validatorMetaSchema,
} = require('../../../schemas/api_v3/validatorSchema.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getValidator = async (params) => request(wsRpcUrl, 'get.validator', params);
const getGenerators = async (params) => request(wsRpcUrl, 'get.generators', params);

// TODO: Enable when test blockchain is updated
xdescribe('get.validator', () => {
	let refGenerator;
	beforeAll(async () => {
		const response = await getGenerators({ limit: 1 });
		[refGenerator] = response.result.data;
	});

	it('returns validator info', async () => {
		const response = await getValidator({ address: refGenerator.address });
		expect(response).toMap(goodRequestSchemaForValidator);
		expect(response.data).toMap(validatorInfoSchema);
		expect(response.meta).toMap(validatorMetaSchema);
	});

	it('invalid address -> invalid params', async () => {
		const response = await getValidator({ address: 'lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('invalid request param -> invalid param', async () => {
		const response = await getValidator({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('No address -> invalid param', async () => {
		const response = await getValidator();
		expect(response).toMap(invalidParamsSchema);
	});
});
