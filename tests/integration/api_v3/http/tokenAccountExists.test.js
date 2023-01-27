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

const { badRequestSchema } = require('../../../schemas/httpGenerics.schema');
const { tokenAccountExistsSchema } = require('../../../schemas/api_v3/tokenAccountExists.schema');

const endpoint = `${baseUrlV3}/tokens/account/exists`;

describe('tokens/account/exists API', () => {
	let refValidator;
	let refTokenID;
	const unknownTokenID = '9999999999999999';
	beforeAll(async () => {
		let refValidatorAddress;
		do {
			// eslint-disable-next-line no-await-in-loop
			const { data: [stakeTx] = [] } = await api.get(`${baseUrlV3}/transactions?moduleCommand=pos:stake&limit=1`);
			if (stakeTx) {
				// Destructure to refer first entry of all the sent votes within the transaction
				const { params: { stakes: [stake] } } = stakeTx;
				refValidatorAddress = stake.validatorAddress;
			}
		} while (!refValidatorAddress);
		// Fetch validator
		const validatorsResponse = await api.get(`${baseUrlV3}/pos/validators?address=${refValidatorAddress}`);
		[refValidator] = validatorsResponse.data;
		// Fetch tokenID
		const tokenConstantsResponse = await api.get(`${baseUrlV3}/pos/constants`);
		refTokenID = tokenConstantsResponse.data.posTokenID;
	});

	describe(`GET ${endpoint}`, () => {
		it('Returns isExists:true when requested for known address', async () => {
			const response = await api.get(`${endpoint}?address=${refValidator.address}&tokenID=${refTokenID}`);
			expect(response).toMap(tokenAccountExistsSchema);
			expect(response.data.isExists).toBe(true);
		});

		it('Returns isExists:false when requested for unknown address', async () => {
			const response = await api.get(`${endpoint}?address=lskvmcf8bphtskyv49xg866u9a9dm7ftkxremzbkr&tokenID=${refTokenID}`);
			expect(response).toMap(tokenAccountExistsSchema);
			expect(response.data.isExists).toBe(false);
		});

		it('Returns isExists:false when requested for incorrect tokenID with known address', async () => {
			const response = await api.get(`${endpoint}?address=${refValidator.address}&tokenID=${unknownTokenID}`);
			expect(response).toMap(tokenAccountExistsSchema);
			expect(response.data.isExists).toBe(false);
		});

		it('Returns isExists:true requested for known publicKey', async () => {
			const response = await api.get(`${endpoint}?publicKey=${refValidator.publicKey}&tokenID=${refTokenID}`);
			expect(response).toMap(tokenAccountExistsSchema);
			expect(response.data.isExists).toBe(true);
		});

		it('Returns isExists:false requested for unknown publicKey', async () => {
			const response = await api.get(`${endpoint}?publicKey=7dda7d86986775bd9ee4bc2f974e31d58b5280e02513c216143574866933bbdf&tokenID=${refTokenID}`);
			expect(response).toMap(tokenAccountExistsSchema);
			expect(response.data.isExists).toBe(false);
		});

		it('Returns isExists:false requested for incorrect tokenID with known publicKey', async () => {
			const response = await api.get(`${endpoint}?publicKey=${refValidator.publicKey}&tokenID=${unknownTokenID}`);
			expect(response).toMap(tokenAccountExistsSchema);
			expect(response.data.isExists).toBe(false);
		});

		it('Returns isExists:true when requested for known validator name', async () => {
			const response = await api.get(`${endpoint}?name=${refValidator.name}&tokenID=${refTokenID}`);
			expect(response).toMap(tokenAccountExistsSchema);
			expect(response.data.isExists).toBe(true);
		});

		it('Returns isExists:false when requested for unknown validator name', async () => {
			const response = await api.get(`${endpoint}?name=yyyy&tokenID=${refTokenID}`);
			expect(response).toMap(tokenAccountExistsSchema);
			expect(response.data.isExists).toBe(false);
		});

		it('Returns isExists:false when requested for incorrect tokenID with know validator name', async () => {
			const response = await api.get(`${endpoint}?name=${refValidator.name}&tokenID=${unknownTokenID}`);
			expect(response).toMap(tokenAccountExistsSchema);
			expect(response.data.isExists).toBe(false);
		});

		it('No address -> bad request', async () => {
			const response = await api.get(endpoint, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('Invalid request param -> bad request', async () => {
			const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('Only address -> bad request', async () => {
			const response = await api.get(`${endpoint}?address=${refValidator.address}`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('Only publicKey -> bad request', async () => {
			const response = await api.get(`${endpoint}?address=${refValidator.publicKey}`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('Only name -> bad request', async () => {
			const response = await api.get(`${endpoint}?address=${refValidator.name}`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});
});
