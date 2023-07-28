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
	request,
} = require('../../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
	serverErrorSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	dryrunTransactionSuccessResponseSchema,
	dryrunTxSuccessSchemaWithSkipDecode,
	dryrunTransactionInvalidResponseSchema,
	dryrunTransactionPendingResponseSchema,
	metaSchema,
	goodRequestSchemaFortransactionsDryRun,
} = require('../../../schemas/api_v3/transactionsDryRun.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const postDryrunTransaction = async params => request(wsRpcUrl, 'post.transactions.dryrun', params);
const postTransaction = async params => request(wsRpcUrl, 'post.transactions', params);

describe('Method post.transactions.dryrun', () => {
	it('should return proper response (Fail) when transaction string has less than required fee', async () => {
		const response = await postDryrunTransaction({ transaction: TRANSACTION_ENCODED_PENDING });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodRequestSchemaFortransactionsDryRun);
		expect(result.data).toBeInstanceOf(Object);
		expect(result.data).toMap(dryrunTransactionPendingResponseSchema);
		expect(result.meta).toMap(metaSchema);
	});

	it('should return proper response (Fail) when transaction object has less than required fee', async () => {
		const response = await postDryrunTransaction({ transaction: TRANSACTION_OBJECT_PENDING });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodRequestSchemaFortransactionsDryRun);
		expect(result.data).toBeInstanceOf(Object);
		expect(result.data).toMap(dryrunTransactionPendingResponseSchema);
		expect(result.meta).toMap(metaSchema);
	});

	it('should post dryrun transaction succesfully with only transaction object', async () => {
		const response = await postDryrunTransaction({ transaction: TRANSACTION_OBJECT_VALID });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodRequestSchemaFortransactionsDryRun);
		expect(result.data).toBeInstanceOf(Object);
		expect(result.data).toMap(dryrunTransactionSuccessResponseSchema);
		expect(result.meta).toMap(metaSchema);
	});

	it('should post dryrun transaction succesfully with only transaction string', async () => {
		const response = await postDryrunTransaction({ transaction: TRANSACTION_ENCODED_VALID });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodRequestSchemaFortransactionsDryRun);
		expect(result.data).toBeInstanceOf(Object);
		expect(result.data).toMap(dryrunTransactionSuccessResponseSchema);
		expect(result.meta).toMap(metaSchema);
	});

	it('should post dryrun transaction succesfully skipping verification', async () => {
		const response = await postDryrunTransaction(
			{
				transaction: TRANSACTION_OBJECT_VALID,
				skipVerify: true,
			},
		);
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodRequestSchemaFortransactionsDryRun);
		expect(result.data).toBeInstanceOf(Object);
		expect(result.data).toMap(dryrunTransactionSuccessResponseSchema);
		expect(result.meta).toMap(metaSchema);
	});

	it('should post dryrun transaction succesfully with skipDecode: true', async () => {
		const response = await postDryrunTransaction(
			{
				transaction: TRANSACTION_ENCODED_VALID, skipDecode: true,
			},
		);
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodRequestSchemaFortransactionsDryRun);
		expect(result.data).toBeInstanceOf(Object);
		expect(result.data).toMap(dryrunTxSuccessSchemaWithSkipDecode);
		expect(result.meta).toMap(metaSchema);
	});

	it('should return proper response (Success) when calling with unsigned transaction with strict: false', async () => {
		const response = await postDryrunTransaction(
			{
				transaction: UNSIGNED_TRANSACTION_OBJECT,
				strict: false,
			},
		);
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodRequestSchemaFortransactionsDryRun);
		expect(result.data).toBeInstanceOf(Object);
		expect(result.data).toMap(dryrunTransactionSuccessResponseSchema);
		expect(result.meta).toMap(metaSchema);
	});

	it('should return proper response (Invalid) when calling with unsigned transaction with strict: true', async () => {
		const response = await postDryrunTransaction(
			{
				transaction: UNSIGNED_TRANSACTION_OBJECT,
				strict: true,
			},
		);
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodRequestSchemaFortransactionsDryRun);
		expect(result.data).toBeInstanceOf(Object);
		expect(result.data).toMap(dryrunTransactionInvalidResponseSchema);
		expect(result.meta).toMap(metaSchema);
	});

	it('should return proper response (Invalid) when transaction string has less than minimum required fee', async () => {
		const response = await postDryrunTransaction({ transaction: TRANSACTION_ENCODED_INVALID });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodRequestSchemaFortransactionsDryRun);
		expect(result.data).toBeInstanceOf(Object);
		expect(result.data).toMap(dryrunTransactionInvalidResponseSchema);
		expect(result.meta).toMap(metaSchema);
	});

	xit('should return proper response (Invalid) for duplicate transaction', async () => {
		// Check dryrun passes
		const firstResponse = await postDryrunTransaction({ transaction: TRANSACTION_OBJECT_VALID });
		expect(firstResponse).toMap(jsonRpcEnvelopeSchema);

		const { result: firstResult } = firstResponse;
		expect(firstResult).toMap(goodRequestSchemaFortransactionsDryRun);
		expect(firstResult.data).toBeInstanceOf(Object);
		expect(firstResult.data).toMap(dryrunTransactionSuccessResponseSchema);
		expect(firstResult.meta).toMap(metaSchema);

		// Send transaction and wait for it to be included in the next block
		await postTransaction({ transaction: TRANSACTION_ENCODED_VALID });
		await waitMs(15000);

		// Check dry run fails for duplicate transaction
		const secondResponse = await postDryrunTransaction({ transaction: TRANSACTION_OBJECT_VALID });
		expect(secondResponse).toMap(jsonRpcEnvelopeSchema);

		const { result: secondResult } = secondResponse;
		expect(secondResult).toMap(goodRequestSchemaFortransactionsDryRun);
		expect(secondResult.data).toBeInstanceOf(Object);
		expect(secondResult.data).toMap(dryrunTransactionInvalidResponseSchema);
		expect(secondResult.meta).toMap(metaSchema);
	});

	it('should return empty response when called with invalid transaction', async () => {
		const response = await postDryrunTransaction({
			transaction: TRANSACTION_OBJECT_INVALID,
		}).catch(e => e);
		expect(response).toMap(serverErrorSchema);
	});

	it('should return invalid params when called with no transaction', async () => {
		const response = await postDryrunTransaction();
		expect(response).toMap(invalidParamsSchema);
	});

	it('should throw error when called with invalid query parameter', async () => {
		const response = await postDryrunTransaction({
			transaction: TRANSACTION_OBJECT_VALID,
			transactions: TRANSACTION_OBJECT_INVALID,
		}).catch(e => e);
		expect(response).toMap(invalidParamsSchema);
	});
});
