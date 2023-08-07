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
jest.setTimeout(30000);

const config = require('../../../config');
const { api } = require('../../../helpers/api');
const {
	TRANSACTION_OBJECT_VALID,
	TRANSACTION_OBJECT_INVALID,
	TRANSACTION_OBJECT_PENDING,
	TRANSACTION_ENCODED_VALID,
	TRANSACTION_ENCODED_PENDING,
	TRANSACTION_ENCODED_INVALID,
	UNSIGNED_TRANSACTION_OBJECT,
} = require('../constants/transactionsDryRun');
const { waitMs } = require('../../../helpers/utils');

const {
	badRequestSchema,
	wrongInputParamSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	dryrunTransactionSuccessResponseSchema,
	dryrunTxSuccessSchemaWithSkipDecode,
	dryrunTransactionInvalidResponseSchema,
	dryrunTransactionPendingResponseSchema,
	metaSchema,
	goodRequestSchemaForTransactionsDryRun,
} = require('../../../schemas/api_v3/transactionsDryRun.schema');
const { invalidAddresses, invalidPublicKeys } = require('../constants/invalidInputs');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/transactions/dryrun`;
const postTransactionEndpoint = `${baseUrlV3}/transactions`;

describe('Post dryrun transactions API', () => {
	it('should return proper response (fail) when transaction object has less than required fee', async () => {
		const response = await api.post(endpoint, { transaction: TRANSACTION_OBJECT_PENDING });
		expect(response).toMap(goodRequestSchemaForTransactionsDryRun);
		expect(response.data).toMap(dryrunTransactionPendingResponseSchema);
		expect(response.meta).toMap(metaSchema);
	});

	it('should return proper response (fail) when transaction string has less than required fee', async () => {
		const response = await api.post(endpoint, { transaction: TRANSACTION_ENCODED_PENDING });
		expect(response).toMap(goodRequestSchemaForTransactionsDryRun);
		expect(response.data).toMap(dryrunTransactionPendingResponseSchema);
		expect(response.meta).toMap(metaSchema);
	});

	it('should post dryrun transaction succesfully with only transaction object', async () => {
		const response = await api.post(endpoint, { transaction: TRANSACTION_OBJECT_VALID });
		expect(response).toMap(goodRequestSchemaForTransactionsDryRun);
		expect(response.data).toMap(dryrunTransactionSuccessResponseSchema);
		expect(response.meta).toMap(metaSchema);
	});

	it('should post dryrun transaction succesfully with only transaction string', async () => {
		const response = await api.post(endpoint, { transaction: TRANSACTION_ENCODED_VALID });
		expect(response).toMap(goodRequestSchemaForTransactionsDryRun);
		expect(response.data).toMap(dryrunTransactionSuccessResponseSchema);
		expect(response.meta).toMap(metaSchema);
	});

	it('should return proper response (success) when posting unsigned transaction with strict: false', async () => {
		const response = await api.post(
			endpoint,
			{ transaction: UNSIGNED_TRANSACTION_OBJECT, strict: false },
		);
		expect(response).toMap(goodRequestSchemaForTransactionsDryRun);
		expect(response.data).toMap(dryrunTransactionSuccessResponseSchema);
		expect(response.data.events.length).toBeGreaterThan(0);
		expect(response.meta).toMap(metaSchema);
	});

	it('should return proper response (invalid) when posting unsigned transaction with strict: true', async () => {
		const response = await api.post(
			endpoint,
			{ transaction: UNSIGNED_TRANSACTION_OBJECT, strict: true },
		);
		expect(response).toMap(goodRequestSchemaForTransactionsDryRun);
		expect(response.data).toMap(dryrunTransactionInvalidResponseSchema);
		expect(response.meta).toMap(metaSchema);
	});

	it('should post dryrun transaction succesfully with only transaction skipping verification', async () => {
		const response = await api.post(
			endpoint,
			{ transaction: TRANSACTION_OBJECT_VALID, skipVerify: true },
		);
		expect(response).toMap(goodRequestSchemaForTransactionsDryRun);
		expect(response.data).toMap(dryrunTransactionSuccessResponseSchema);
		expect(response.data.events.length).toBeGreaterThan(0);
		expect(response.meta).toMap(metaSchema);
	});

	it('should post dryrun transaction succesfully with skipDecode: true', async () => {
		const response = await api.post(
			endpoint,
			{ transaction: TRANSACTION_ENCODED_VALID, skipDecode: true },
		);
		expect(response).toMap(goodRequestSchemaForTransactionsDryRun);
		expect(response.data).toMap(dryrunTxSuccessSchemaWithSkipDecode);
		expect(response.meta).toMap(metaSchema);
	});

	it('should return proper response (invalid) when transaction string has less than minimum required fee', async () => {
		const response = await api.post(endpoint, { transaction: TRANSACTION_ENCODED_INVALID });
		expect(response).toMap(goodRequestSchemaForTransactionsDryRun);
		expect(response.data).toMap(dryrunTransactionInvalidResponseSchema);
		expect(response.meta).toMap(metaSchema);
	});

	it('should return bad request when requested with invalid public key', async () => {
		const { senderPublicKey, ...remTransactionObject } = TRANSACTION_OBJECT_VALID;
		for (let i = 0; i < invalidPublicKeys.length; i++) {
			remTransactionObject.senderPublicKey = invalidPublicKeys[i];
			// eslint-disable-next-line no-await-in-loop
			const response = await api.post(endpoint, { transaction: remTransactionObject }, 400);
			expect(response).toMap(badRequestSchema);
		}
	});

	it('should return bad request when requested with invalid address', async () => {
		const { params, ...remTransactionObject } = TRANSACTION_OBJECT_VALID;
		for (let i = 0; i < invalidAddresses.length; i++) {
			remTransactionObject.params = {
				...params,
				recipientAddress: invalidAddresses[i],
			};
			// eslint-disable-next-line no-await-in-loop
			const response = await api.post(endpoint, { transaction: remTransactionObject }, 400);
			expect(response).toMap(badRequestSchema);
		}
	});

	xit('should return proper response (invalid) for duplicate transaction', async () => {
		// Check dryrun passes
		const firstResponse = await api.post(endpoint, { transaction: TRANSACTION_OBJECT_VALID });
		expect(firstResponse).toMap(goodRequestSchemaForTransactionsDryRun);
		expect(firstResponse.data).toMap(dryrunTransactionSuccessResponseSchema);
		expect(firstResponse.data.events.length).toBeGreaterThan(0);
		expect(firstResponse.meta).toMap(metaSchema);

		// Send transaction and wait for it to be included in the next block
		await api.post(postTransactionEndpoint, { transaction: TRANSACTION_ENCODED_VALID });
		await waitMs(15000);

		// Check dry run fails for duplicate transaction
		const secondResponse = await api.post(endpoint, { transaction: TRANSACTION_OBJECT_VALID });
		expect(secondResponse).toMap(goodRequestSchemaForTransactionsDryRun);
		expect(secondResponse.data).toMap(dryrunTransactionInvalidResponseSchema);
		expect(secondResponse.data.events.length).toBe(0);
		expect(secondResponse.meta).toMap(metaSchema);
	});

	it('should return bad request when posting invalid transaction', async () => {
		const dryrunTransaction = await api.post(
			endpoint,
			{ transaction: TRANSACTION_OBJECT_INVALID },
			400,
		);
		expect(dryrunTransaction).toMap(badRequestSchema);
	});

	it('should return bad request when called with no transaction', async () => {
		const response = await api.post(endpoint, {}, 400);
		expect(response).toMap(wrongInputParamSchema);
	});

	it('should return error in case of invalid query params', async () => {
		const dryrunTransaction = await api.post(
			endpoint,
			{
				transaction: TRANSACTION_OBJECT_VALID,
				transactions: TRANSACTION_OBJECT_INVALID,
			},
			400,
		);
		expect(dryrunTransaction).toMap(wrongInputParamSchema);
	});
});
