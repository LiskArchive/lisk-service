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

const { BLS_KEY, PROOF_OF_POSSESSION, EXTRA_PARAM } = require('../constants/validatorValidateBLSKey');

const { request } = require('../../../helpers/socketIoRpcRequest');

const { jsonRpcEnvelopeSchema, invalidParamsSchema } = require('../../../schemas/rpcGenerics.schema');

const { validateBLSKeySchema } = require('../../../schemas/api_v3/validatorSchema.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const validateBLSKey = async params => request(wsRpcUrl, 'post.validator.validateBLSKey', params);

describe('Method post.validator.validateBLSKey', () => {
	it('Returns true for valid blsKey and proofOfPossession pair', async () => {
		const response = await validateBLSKey({
			blsKey: BLS_KEY.valid,
			proofOfPossession: PROOF_OF_POSSESSION.valid,
		});
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result.data).toBeInstanceOf(Object);
		expect(result.data).toMap(validateBLSKeySchema);
		expect(result.data.isValid).toEqual(true);
	});

	it('Returns false for invalid blsKey', async () => {
		const response = await validateBLSKey({
			blsKey: BLS_KEY.invalid,
			proofOfPossession: PROOF_OF_POSSESSION.valid,
		});
		const { result } = response;

		expect(result.data).toBeInstanceOf(Object);
		expect(result.data).toMap(validateBLSKeySchema);
		expect(result.data.isValid).toEqual(false);
	});

	it('Returns true for invalid proofOfPossession message', async () => {
		const response = await validateBLSKey({
			blsKey: BLS_KEY.valid,
			proofOfPossession: PROOF_OF_POSSESSION.invalid,
		});
		const { result } = response;

		expect(result.data).toBeInstanceOf(Object);
		expect(result.data).toMap(validateBLSKeySchema);
		expect(result.data.isValid).toEqual(false);
	});

	it('No param -> invalid param', async () => {
		const response = await validateBLSKey({});
		expect(response).toMap(invalidParamsSchema);
	});

	it('extra param -> invalid param', async () => {
		const response = await validateBLSKey({
			blsKey: BLS_KEY.valid,
			proofOfPossession: PROOF_OF_POSSESSION.valid,
			extra_param: EXTRA_PARAM,
		});
		expect(response).toMap(invalidParamsSchema);
	});
});
