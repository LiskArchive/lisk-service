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

const { badRequestSchema, goodRequestSchema } = require('../../../schemas/httpGenerics.schema');

const {
	tokenBalancesSchema,
	tokenBalancesMetaSchema,
} = require('../../../schemas/api_v3/tokenBalances.schema');
const {
	invalidAddresses,
	invalidTokenIDs,
	invalidLimits,
	invalidOffsets,
} = require('../constants/invalidInputs');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/token/balances`;

describe('Tokens API', () => {
	let refValidator;
	let currTokenID;

	beforeAll(async () => {
		const validators = await api.get(`${baseUrlV3}/pos/validators`);
		[refValidator] = validators.data;

		const networkStatus = await api.get(`${baseUrlV3}/network/status`);
		currTokenID = networkStatus.data.chainID.substring(0, 2).padEnd(16, '0');
	});
	it('should return tokens info when call with address', async () => {
		const response = await api.get(`${endpoint}?address=${refValidator.address}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.forEach(tokenEntry => expect(tokenEntry).toMap(tokenBalancesSchema));
		expect(response.meta).toMap(tokenBalancesMetaSchema);
	});

	it('should return token info when call with address and limit 10', async () => {
		const response = await api.get(`${endpoint}?address=${refValidator.address}&limit=10`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(1);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.forEach(tokenEntry => expect(tokenEntry).toMap(tokenBalancesSchema));
		expect(response.meta).toMap(tokenBalancesMetaSchema);
	});

	it('should return token info when call with address, limit=10 and offset=1', async () => {
		const response = await api.get(`${endpoint}?address=${refValidator.address}&limit=10&offset=1`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toBeGreaterThanOrEqual(0);
		expect(response.data.length).toBeLessThanOrEqual(10);
		response.data.forEach(tokenEntry => expect(tokenEntry).toMap(tokenBalancesSchema));
		expect(response.meta).toMap(tokenBalancesMetaSchema);
	});

	it('should return token info when call with address and tokenID', async () => {
		const response = await api.get(
			`${endpoint}?address=${refValidator.address}&tokenID=${currTokenID}`,
		);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toBeInstanceOf(Array);
		expect(response.data.length).toEqual(1);
		response.data.forEach(tokenEntry => expect(tokenEntry).toMap(tokenBalancesSchema));
		expect(response.meta).toMap(tokenBalancesMetaSchema);
	});

	it('should return bad request when requested with invalid address', async () => {
		for (let i = 0; i < invalidAddresses.length; i++) {
			const response = await api.get(
				`${endpoint}?address=${invalidAddresses[i]}&tokenID=${currTokenID}`,
				400,
			);
			expect(response).toMap(badRequestSchema);
		}
	});

	it('should return bad request when requested with invalid tokenIDs', async () => {
		for (let i = 0; i < invalidTokenIDs.length; i++) {
			const response = await api.get(
				`${endpoint}?address=${refValidator.address}&tokenID=${invalidTokenIDs[i]}`,
				400,
			);
			expect(response).toMap(badRequestSchema);
		}
	});

	it('should return bad request when requested with invalid limit', async () => {
		for (let i = 0; i < invalidLimits.length; i++) {
			const response = await api.get(
				`${endpoint}?address=${refValidator.address}&tokenID=${currTokenID}&limit=${invalidLimits[i]}`,
				400,
			);
			expect(response).toMap(badRequestSchema);
		}
	});

	it('should return bad request when requested with invalid offset', async () => {
		for (let i = 0; i < invalidOffsets.length; i++) {
			const response = await api.get(
				`${endpoint}?address=${refValidator.address}&tokenID=${currTokenID}&offset=${invalidOffsets[i]}`,
				400,
			);
			expect(response).toMap(badRequestSchema);
		}
	});

	it('should return bad request when requested without address', async () => {
		const response = await api.get(endpoint, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request when requested with tokenID but without address', async () => {
		const response = await api.get(`${endpoint}?}tokenID=${currTokenID}`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request when requested with invalid param', async () => {
		const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request when requested with empty invalid param', async () => {
		const response = await api.get(`${endpoint}?invalidParam=`, 400);
		expect(response).toMap(badRequestSchema);
	});
});
