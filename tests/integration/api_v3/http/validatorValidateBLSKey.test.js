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
const { api } = require('../../../helpers/api');
const { BLS_KEY, PROOF_OF_POSSESSION } = require('../constants/validatorValidateBLSKey');

const { validateBLSKeySchema, validateBLSKeyGoodRequestSchema } = require('../../../schemas/api_v3/validatorSchema.schema');
const { badRequestSchema } = require('../../../schemas/httpGenerics.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/validator/validateBLSKey`;

describe('validate BLS Key API', () => {
	it('Returns true for valid blsKey and proofOfPossession pair', async () => {
		const response = await api.post(
			endpoint,
			{
				blsKey: BLS_KEY.VALID,
				proofOfPossession: PROOF_OF_POSSESSION.VALID,
			},
		);

		expect(response).toMap(validateBLSKeyGoodRequestSchema);
		expect(response.data).toMap(validateBLSKeySchema);
		expect(response.data.isValid).toEqual(true);
	});

	it('Returns false for wrong blsKey', async () => {
		const response = await api.post(
			endpoint,
			{
				blsKey: BLS_KEY.INVALID,
				proofOfPossession: PROOF_OF_POSSESSION.VALID,
			},
		);

		expect(response).toMap(validateBLSKeyGoodRequestSchema);
		expect(response.data).toMap(validateBLSKeySchema);
		expect(response.data.isValid).toEqual(false);
	});

	it('Returns false for wrong proofOfPossession message', async () => {
		const response = await api.post(
			endpoint,
			{
				blsKey: BLS_KEY.VALID,
				proofOfPossession: PROOF_OF_POSSESSION.INVALID,
			},
		);

		expect(response).toMap(validateBLSKeyGoodRequestSchema);
		expect(response.data).toMap(validateBLSKeySchema);
		expect(response.data.isValid).toEqual(false);
	});

	it('No param -> bad request', async () => {
		const response = await api.post(endpoint, {}, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('Invalid param -> bad request', async () => {
		const response = await api.post(endpoint,
			{
				blsKey: BLS_KEY.VALID,
				proofOfPossession: PROOF_OF_POSSESSION.VALID,
				invalidParam: 'value',
			},
			400,
		);
		expect(response).toMap(badRequestSchema);
	});
});
