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

const {
	badRequestSchema,
	metaSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	unlockSchema,
} = require('../../../schemas/api_v3/unlock.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/dpos/unlocks`;

describe('DPoS Unlocks API', () => {
	let refTransaction;
	beforeAll(async () => {
		const response = await api.get(`${baseUrlV3}/transactions?limit=1&moduleCommand=dpos:registerDelegate`);
		[refTransaction] = response.data;
	});

	describe(`GET ${endpoint}`, () => {
		it('Returns unlocks when requested for existing account by address', async () => {
			const response = await api.get(`${endpoint}?address=${refTransaction.sender.address}`);
			expect(response.data).toMap(unlockSchema);
			expect(response.data.unlocking.length).toBeGreaterThanOrEqual(1);
			expect(response.data.unlocking.length).toBeLessThanOrEqual(10);
			expect(response.meta).toMap(metaSchema);
		});

		it('Returns unlocks when requested for existing account by name', async () => {
			if (refTransaction.sender.name) {
				const response = await api.get(`${endpoint}?name=${refTransaction.sender.name}`);
				expect(response.data).toMap(unlockSchema);
				expect(response.data.unlocking.length).toBeGreaterThanOrEqual(1);
				expect(response.data.unlocking.length).toBeLessThanOrEqual(10);
				expect(response.meta).toMap(metaSchema);
			}
		});

		it('Returns unlocks when requested for existing account by publicKey', async () => {
			if (refTransaction.sender.publicKey) {
				const response = await api.get(`${endpoint}?publicKey=${refTransaction.sender.publicKey}`);
				expect(response.data).toMap(unlockSchema);
				expect(response.data.unlocking.length).toBeGreaterThanOrEqual(1);
				expect(response.data.unlocking.length).toBeLessThanOrEqual(10);
				expect(response.meta).toMap(metaSchema);
			}
		});

		it('Returns unlocks when requested for existing account by address and limit=5', async () => {
			const response = await api.get(`${endpoint}?address=${refTransaction.sender.address}&limit=5`);
			expect(response.data).toMap(unlockSchema);
			expect(response.data.unlocking.length).toBeGreaterThanOrEqual(1);
			expect(response.data.unlocking.length).toBeLessThanOrEqual(5);
			expect(response.meta).toMap(metaSchema);
		});

		it('Returns unlocks when requested for existing account by address, limit=5 and offset=1', async () => {
			const response = await api.get(`${endpoint}?address=${refTransaction.sender.address}&limit=5&offset=1`);
			expect(response.data).toMap(unlockSchema);
			expect(response.data.unlocking.length).toBeGreaterThanOrEqual(1);
			expect(response.data.unlocking.length).toBeLessThanOrEqual(5);
			expect(response.meta).toMap(metaSchema);
		});

		it('Returns unlocks when requested for existing account by address, name and limit=5', async () => {
			if (refTransaction.sender.name) {
				const response = await api.get(`${endpoint}?address=${refTransaction.sender.address}&name=${refTransaction.sender.name}&limit=5`);
				expect(response.data).toMap(unlockSchema);
				expect(response.data.unlocking.length).toBeGreaterThanOrEqual(1);
				expect(response.data.unlocking.length).toBeLessThanOrEqual(5);
				expect(response.meta).toMap(metaSchema);
			}
		});

		it('Returns unlocks when requested for existing account by address, publicKey and limit=5', async () => {
			if (refTransaction.sender.publicKey) {
				const response = await api.get(`${endpoint}?address=${refTransaction.sender.address}&publicKey=${refTransaction.sender.publicKey}&limit=5`);
				expect(response.data).toMap(unlockSchema);
				expect(response.data.unlocking.length).toBeGreaterThanOrEqual(1);
				expect(response.data.unlocking.length).toBeLessThanOrEqual(5);
				expect(response.meta).toMap(metaSchema);
			}
		});

		it('No params -> bad request', async () => {
			const response = await api.get(endpoint, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('invalid address -> bad request', async () => {
			const response = await api.get(`${endpoint}?address=lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('invalid publicKey -> bad request', async () => {
			const response = await api.get(`${endpoint}?publicKey=invalid_pk`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('invalid request param -> bad request', async () => {
			const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});
});
