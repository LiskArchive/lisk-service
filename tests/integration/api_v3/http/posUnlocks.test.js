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
const { invalidOffsets, invalidLimits, invalidNames, invalidPublicKeys, invalidAddresses } = require('../constants/invalidInputs');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/pos/unlocks`;

describe('PoS Unlocks API', () => {
	let refTransaction;
	beforeAll(async () => {
		const response = await api.get(`${baseUrlV3}/transactions?limit=1&moduleCommand=pos:registerValidator`);
		[refTransaction] = response.data;
	});

	describe(`GET ${endpoint}`, () => {
		it('should return unlocks when requested for existing account by address', async () => {
			const response = await api.get(`${endpoint}?address=${refTransaction.sender.address}`);
			expect(response.data).toMap(unlockSchema);
			expect(response.data.pendingUnlocks.length).toBeGreaterThanOrEqual(1);
			expect(response.data.pendingUnlocks.length).toBeLessThanOrEqual(10);
			expect(response.meta).toMap(metaSchema);
		});

		it('should return unlocks when requested for existing account by address and isLocked = false', async () => {
			const response = await api.get(`${endpoint}?address=${refTransaction.sender.address}&isLocked=false`);
			expect(response.data).toMap(unlockSchema);
			expect(response.data.pendingUnlocks.length).toBeGreaterThanOrEqual(0);
			expect(response.data.pendingUnlocks.length).toBeLessThanOrEqual(10);
			response.data.pendingUnlocks.forEach(entry => {
				expect(entry.isLocked).toBe(false);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('should return unlocks when requested for existing account by address and isLocked = true', async () => {
			const response = await api.get(`${endpoint}?address=${refTransaction.sender.address}&isLocked=true`);
			expect(response.data).toMap(unlockSchema);
			expect(response.data.pendingUnlocks.length).toBeGreaterThanOrEqual(1);
			expect(response.data.pendingUnlocks.length).toBeLessThanOrEqual(10);
			response.data.pendingUnlocks.forEach(entry => {
				expect(entry.isLocked).toBe(true);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('should return unlocks when requested for existing account by publicKey', async () => {
			if (refTransaction.sender.publicKey) {
				const response = await api.get(`${endpoint}?publicKey=${refTransaction.sender.publicKey}`);
				expect(response.data).toMap(unlockSchema);
				expect(response.data.pendingUnlocks.length).toBeGreaterThanOrEqual(1);
				expect(response.data.pendingUnlocks.length).toBeLessThanOrEqual(10);
				expect(response.meta).toMap(metaSchema);
			}
		});

		it('should return unlocks when requested for existing account by publicKey and isLocked = false', async () => {
			if (refTransaction.sender.publicKey) {
				const response = await api.get(`${endpoint}?publicKey=${refTransaction.sender.publicKey}&isLocked=false`);
				expect(response.data).toMap(unlockSchema);
				expect(response.data.pendingUnlocks.length).toBeGreaterThanOrEqual(0);
				expect(response.data.pendingUnlocks.length).toBeLessThanOrEqual(10);
				response.data.pendingUnlocks.forEach(entry => {
					expect(entry.isLocked).toBe(false);
				});
				expect(response.meta).toMap(metaSchema);
			}
		});

		it('should return unlocks when requested for existing account by publicKey and isLocked = true', async () => {
			if (refTransaction.sender.publicKey) {
				const response = await api.get(`${endpoint}?publicKey=${refTransaction.sender.publicKey}&isLocked=true`);
				expect(response.data).toMap(unlockSchema);
				expect(response.data.pendingUnlocks.length).toBeGreaterThanOrEqual(1);
				expect(response.data.pendingUnlocks.length).toBeLessThanOrEqual(10);
				response.data.pendingUnlocks.forEach(entry => {
					expect(entry.isLocked).toBe(true);
				});
				expect(response.meta).toMap(metaSchema);
			}
		});

		it('should return unlocks when requested for existing account by name', async () => {
			if (refTransaction.sender.name) {
				const response = await api.get(`${endpoint}?name=${refTransaction.sender.name}`);
				expect(response.data).toMap(unlockSchema);
				expect(response.data.pendingUnlocks.length).toBeGreaterThanOrEqual(1);
				expect(response.data.pendingUnlocks.length).toBeLessThanOrEqual(10);
				expect(response.meta).toMap(metaSchema);
			}
		});

		it('should return unlocks when requested for existing account by name and isLocked = false', async () => {
			if (refTransaction.sender.name) {
				const response = await api.get(`${endpoint}?name=${refTransaction.sender.name}&isLocked=false`);
				expect(response.data).toMap(unlockSchema);
				expect(response.data.pendingUnlocks.length).toBeGreaterThanOrEqual(0);
				expect(response.data.pendingUnlocks.length).toBeLessThanOrEqual(10);
				response.data.pendingUnlocks.forEach(entry => {
					expect(entry.isLocked).toBe(false);
				});
				expect(response.meta).toMap(metaSchema);
			}
		});

		it('should return unlocks when requested for existing account by name and isLocked = true', async () => {
			if (refTransaction.sender.name) {
				const response = await api.get(`${endpoint}?name=${refTransaction.sender.name}&isLocked=true`);
				expect(response.data).toMap(unlockSchema);
				expect(response.data.pendingUnlocks.length).toBeGreaterThanOrEqual(1);
				expect(response.data.pendingUnlocks.length).toBeLessThanOrEqual(10);
				response.data.pendingUnlocks.forEach(entry => {
					expect(entry.isLocked).toBe(true);
				});
				expect(response.meta).toMap(metaSchema);
			}
		});

		it('should return unlocks when requested for existing account by address and limit=5', async () => {
			const response = await api.get(`${endpoint}?address=${refTransaction.sender.address}&limit=5`);
			expect(response.data).toMap(unlockSchema);
			expect(response.data.pendingUnlocks.length).toBeGreaterThanOrEqual(1);
			expect(response.data.pendingUnlocks.length).toBeLessThanOrEqual(5);
			expect(response.meta).toMap(metaSchema);
		});

		it('should return unlocks when requested for existing account by address, limit=5 and offset=1', async () => {
			const response = await api.get(`${endpoint}?address=${refTransaction.sender.address}&limit=5&offset=1`);
			expect(response.data).toMap(unlockSchema);
			expect(response.data.pendingUnlocks.length).toBeGreaterThanOrEqual(0);
			expect(response.data.pendingUnlocks.length).toBeLessThanOrEqual(5);
			expect(response.meta).toMap(metaSchema);
		});

		it('should return unlocks when requested for existing account by address, name and limit=5', async () => {
			if (refTransaction.sender.name) {
				const response = await api.get(`${endpoint}?address=${refTransaction.sender.address}&name=${refTransaction.sender.name}&limit=5`);
				expect(response.data).toMap(unlockSchema);
				expect(response.data.pendingUnlocks.length).toBeGreaterThanOrEqual(1);
				expect(response.data.pendingUnlocks.length).toBeLessThanOrEqual(5);
				expect(response.meta).toMap(metaSchema);
			}
		});

		it('should return unlocks when requested for existing account by address, publicKey and limit=5', async () => {
			if (refTransaction.sender.publicKey) {
				const response = await api.get(`${endpoint}?address=${refTransaction.sender.address}&publicKey=${refTransaction.sender.publicKey}&limit=5`);
				expect(response.data).toMap(unlockSchema);
				expect(response.data.pendingUnlocks.length).toBeGreaterThanOrEqual(1);
				expect(response.data.pendingUnlocks.length).toBeLessThanOrEqual(5);
				expect(response.meta).toMap(metaSchema);
			}
		});

		it('should return bad request if address, publicKey and name is missing', async () => {
			const response = await api.get(endpoint, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('should return bad request for invalid address', async () => {
			for (let i = 0; i < invalidAddresses.length; i++) {
				// eslint-disable-next-line no-await-in-loop
				const response = await api.get(`${endpoint}?address=${invalidAddresses[i]}`, 400);
				expect(response).toMap(badRequestSchema);
			}
		});

		it('should return bad request for invalid publicKey', async () => {
			for (let i = 0; i < invalidPublicKeys.length; i++) {
				// eslint-disable-next-line no-await-in-loop
				const response = await api.get(`${endpoint}?publicKey=${invalidPublicKeys[i]}`, 400);
				expect(response).toMap(badRequestSchema);
			}
		});

		it('should return bad request for invalid name', async () => {
			for (let i = 0; i < invalidNames.length; i++) {
				// eslint-disable-next-line no-await-in-loop
				const response = await api.get(`${endpoint}?name=${invalidNames[i]}`, 400);
				expect(response).toMap(badRequestSchema);
			}
		});

		it('should return bad request for invalid limit', async () => {
			for (let i = 0; i < invalidLimits.length; i++) {
				// eslint-disable-next-line no-await-in-loop
				const response = await api.get(`${endpoint}?address=${refTransaction.sender.address}&limit=${invalidLimits[i]}`, 400);
				expect(response).toMap(badRequestSchema);
			}
		});

		it('should return bad request for invalid offset', async () => {
			for (let i = 0; i < invalidOffsets.length; i++) {
				// eslint-disable-next-line no-await-in-loop
				const response = await api.get(`${endpoint}?address=${refTransaction.sender.address}&offset=${invalidOffsets[i]}`, 400);
				expect(response).toMap(badRequestSchema);
			}
		});

		it('should return bad request if requested without any of address, name and public key', async () => {
			const response = await api.get(endpoint, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('should return bad request if requested with invalid param', async () => {
			const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('should return bad request if requested with empty invalid param', async () => {
			const response = await api.get(`${endpoint}?invalidParam=`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});
});
