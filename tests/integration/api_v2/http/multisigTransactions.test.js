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
	let inputTransaction;
	let refTransaction;
	beforeAll(async () => {
		const response1 = await api.get(`${endpoint}?limit=1`);
		[refTransaction] = response1.data;

		inputTransaction = {
			nonce: '0',
			senderPublicKey: 'b1d6bc6c7edd0673f5fed0681b73de6eb70539c21278b300f07ade277e1962cd',
			moduleAssetId: '2:0',
			asset: {
				amount: '500000000',
				recipientId: 'lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99',
				data: 'Multisig token transfer transaction',
			},
			fee: '1000000',
			// expires: Math.floor(Date.now() / 1000) + 31556952,
			signatures: [
				{
					publicKey: '968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b',
					signature: '72c9b2aa734ec1b97549718ddf0d4737fd38a7f0fd105ea28486f2d989e9b3e399238d81a93aa45c27309d91ce604a5db9d25c9c90a138821f2011bc6636c60a',
				},
			],
		};
	});

	describe('Create and update multisignature transactions in the pool', () => {
		it('POST a new multisignature transaction', async () => {
			const response = await api.post(`${endpoint}`, inputTransaction);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBe(1);
			response.data.forEach(multisigTxn => expect(multisigTxn).toMap(multisigTransactionSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('PATCH an existing multisignature transaction: add a new signature', async () => {
			const signaturePatch = {
				// serviceId: refTransaction.serviceId,
				serviceId: 'a3fb4bbf-3a07-4499-af9f-ca26d23d32a0',
				signatures: [{
					publicKey: '968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b',
					signature: 'a3733254aad600fa787d6223002278c3400be5e8ed4763ae27f9a15b80e20c22ac9259dc926f4f4cabdf0e4f8cec49308fa8296d71c288f56b9d1e11dfe81e07',
				}],
			};

			const response = await api.patch(`${endpoint}`, signaturePatch);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBe(1);
			response.data.forEach(multisigTxn => {
				expect(multisigTxn).toMap(multisigTransactionSchema);
				expect(multisigTxn.signatures.some(entry => entry.signature === signaturePatch[0].signature))
					.toBeTruthy();
			});
			expect(response.meta).toMap(metaSchema);
		});
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
			const response = await api.get(`${endpoint}?address=lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99`);
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
				.toMap(multisigTransactionSchema, { senderPublicKey: refTransaction.senderPublicKey }));
			expect(response.meta).toMap(metaSchema);
		});
	});
});
