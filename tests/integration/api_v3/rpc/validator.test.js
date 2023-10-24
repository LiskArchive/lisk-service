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
} = require('../../../schemas/rpcGenerics.schema');

const {
	goodRequestSchemaForValidator,
	validatorInfoSchema,
	validatorMetaSchema,
} = require('../../../schemas/api_v3/validatorSchema.schema');
const { invalidAddresses } = require('../constants/invalidInputs');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getValidator = async params => request(wsRpcUrl, 'get.validator', params);
const getGenerators = async params => request(wsRpcUrl, 'get.generators', params);

describe('get.validator', () => {
	let refGenerator;
	beforeAll(async () => {
		const response = await getGenerators({ limit: 1 });
		[refGenerator] = response.result.data;
	});

	it('should return validator info', async () => {
		const response = await getValidator({ address: refGenerator.address });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchemaForValidator);
		expect(result.data).toMap(validatorInfoSchema);
		expect(result.meta).toMap(validatorMetaSchema);
	});

	it('should return invalid params when requested without address', async () => {
		const response = await getValidator();
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return invalid params when requested with invalid address', async () => {
		for (let i = 0; i < invalidAddresses.length; i++) {
			const response = await getValidator({ address: invalidAddresses[i] });
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return invalid params when requested with address CSV', async () => {
		const response = await getValidator({
			address: `${refGenerator.address},${refGenerator.address}`,
		});
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return invalid params when requested with invalid param', async () => {
		const response = await getValidator({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return invalid params when requested with empty invalid param', async () => {
		const response = await getValidator({ invalidParam: '' });
		expect(response).toMap(invalidParamsSchema);
	});
});
