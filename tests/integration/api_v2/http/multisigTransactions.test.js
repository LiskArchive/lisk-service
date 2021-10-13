/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
	goodRequestSchema,
	metaSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	multisigTransactionSchema,
} = require('../../../schemas/api_v2/multisigTransaction.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV2 = `${baseUrl}/api/v2`;
const endpoint = `${baseUrlV2}/transactions/multisig`;

describe('Multisignature Transactions API', () => {
	let refTransaction;
	beforeAll(async () => {
		const response1 = await api.get(`${endpoint}?limit=1`);
		[refTransaction] = response1.data;
	});
	describe('Retrieve multisignature transaction lists', () => {
		it('returns list of multisignature transactions', async () => {
			const response = await api.get(`${endpoint}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(transaction => expect(transaction).toMap(multisigTransactionSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('returns multisignature transactions with known serviceId', async () => {
			const response = await api.get(`${endpoint}?serviceId=${refTransaction.serviceId}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(transaction => expect(transaction)
				.toMap(multisigTransactionSchema, { serviceId: refTransaction.serviceId }));
			expect(response.meta).toMap(metaSchema);
		});

		it('returns multisignature transactions with known address', async () => {
			const response = await api.get(`${endpoint}?address=${refTransaction.address}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(transaction => expect(transaction)
				.toMap(multisigTransactionSchema, { address: refTransaction.address }));
			expect(response.meta).toMap(metaSchema);
		});

		it('returns multisignature transactions with known publicKey', async () => {
			const response = await api.get(`${endpoint}?publicKey=${refTransaction.senderPublicKey}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(transaction => expect(transaction)
				.toMap(multisigTransactionSchema, { publicKey: refTransaction.senderPublicKey }));
			expect(response.meta).toMap(metaSchema);
		});
	});
});
