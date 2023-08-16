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

const { request } = require('../../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
	invalidRequestSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	dryrunTransactionSuccessResponseSchema,
	dryrunTxSuccessSchemaWithSkipDecode,
	dryrunTransactionInvalidResponseSchema,
	dryrunTransactionPendingResponseSchema,
	metaSchema,
	goodRequestSchemaForTransactionsDryRun,
} = require('../../../schemas/api_v3/transactionsDryRun.schema');
const { invalidAddresses, invalidPublicKeys } = require('../constants/invalidInputs');
const { createTokenTransferTx } = require('../txUtil/createTx');
const { encodeTransaction } = require('../txUtil/encodeTx');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const postDryrunTransaction = async params => request(wsRpcUrl, 'post.transactions.dryrun', params);
const postTransaction = async params => request(wsRpcUrl, 'post.transactions', params);
const networkStatus = async params => request(wsRpcUrl, 'get.network.status', params);

const baseUrlV3 = `${config.SERVICE_ENDPOINT}/api/v3`;
const authEndpoint = `${baseUrlV3}/auth`;

describe('Method post.transactions.dryrun', () => {
	let isDevnet = false;

	beforeAll(async () => {
		const response = await networkStatus({});
		const { result } = response;
		if (result && result.data) {
			isDevnet = result.data.chainID === '04000000';
		}
	});

	it('should return proper response (pending) when transaction string has less than required fee', async () => {
		if (isDevnet) {
			const response = await postDryrunTransaction({ transaction: TRANSACTION_ENCODED_PENDING });
			expect(response).toMap(jsonRpcEnvelopeSchema);

			const { result } = response;
			expect(result).toMap(goodRequestSchemaForTransactionsDryRun);
			expect(result.data).toBeInstanceOf(Object);
			expect(result.data).toMap(dryrunTransactionPendingResponseSchema);
			expect(result.meta).toMap(metaSchema);
		}
	});

	it('should return proper response (pending) when transaction object has less than required fee', async () => {
		if (isDevnet) {
			const response = await postDryrunTransaction({ transaction: TRANSACTION_OBJECT_PENDING });
			expect(response).toMap(jsonRpcEnvelopeSchema);

			const { result } = response;
			expect(result).toMap(goodRequestSchemaForTransactionsDryRun);
			expect(result.data).toBeInstanceOf(Object);
			expect(result.data).toMap(dryrunTransactionPendingResponseSchema);
			expect(result.meta).toMap(metaSchema);
		}
	});

	it('should post dryrun transaction successfully with only transaction object', async () => {
		if (isDevnet) {
			const response = await postDryrunTransaction({ transaction: TRANSACTION_OBJECT_VALID });
			expect(response).toMap(jsonRpcEnvelopeSchema);

			const { result } = response;
			expect(result).toMap(goodRequestSchemaForTransactionsDryRun);
			expect(result.data).toBeInstanceOf(Object);
			expect(result.data).toMap(dryrunTransactionSuccessResponseSchema);
			expect(result.meta).toMap(metaSchema);
		}
	});

	it('should post dryrun transaction successfully with only transaction string', async () => {
		if (isDevnet) {
			const response = await postDryrunTransaction({ transaction: TRANSACTION_ENCODED_VALID });
			expect(response).toMap(jsonRpcEnvelopeSchema);

			const { result } = response;
			expect(result).toMap(goodRequestSchemaForTransactionsDryRun);
			expect(result.data).toBeInstanceOf(Object);
			expect(result.data).toMap(dryrunTransactionSuccessResponseSchema);
			expect(result.meta).toMap(metaSchema);
		}
	});

	it('should post dryrun transaction successfully skipping verification', async () => {
		if (isDevnet) {
			const response = await postDryrunTransaction({
				transaction: TRANSACTION_OBJECT_VALID,
				skipVerify: true,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);

			const { result } = response;
			expect(result).toMap(goodRequestSchemaForTransactionsDryRun);
			expect(result.data).toBeInstanceOf(Object);
			expect(result.data).toMap(dryrunTransactionSuccessResponseSchema);
			expect(result.meta).toMap(metaSchema);
		}
	});

	it('should post dryrun transaction successfully with skipDecode: true', async () => {
		if (isDevnet) {
			const response = await postDryrunTransaction({
				transaction: TRANSACTION_ENCODED_VALID,
				skipDecode: true,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);

			const { result } = response;
			expect(result).toMap(goodRequestSchemaForTransactionsDryRun);
			expect(result.data).toBeInstanceOf(Object);
			expect(result.data).toMap(dryrunTxSuccessSchemaWithSkipDecode);
			expect(result.meta).toMap(metaSchema);
		}
	});

	it('should return proper response (valid) when calling with unsigned transaction with strict: false', async () => {
		if (isDevnet) {
			const response = await postDryrunTransaction({
				transaction: UNSIGNED_TRANSACTION_OBJECT,
				strict: false,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);

			const { result } = response;
			expect(result).toMap(goodRequestSchemaForTransactionsDryRun);
			expect(result.data).toBeInstanceOf(Object);
			expect(result.data).toMap(dryrunTransactionSuccessResponseSchema);
			expect(result.meta).toMap(metaSchema);
		}
	});

	it('should return proper response (invalid) when calling with unsigned transaction with strict: true', async () => {
		if (isDevnet) {
			const response = await postDryrunTransaction({
				transaction: UNSIGNED_TRANSACTION_OBJECT,
				strict: true,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);

			const { result } = response;
			expect(result).toMap(goodRequestSchemaForTransactionsDryRun);
			expect(result.data).toBeInstanceOf(Object);
			expect(result.data).toMap(dryrunTransactionInvalidResponseSchema);
			expect(result.meta).toMap(metaSchema);
		}
	});

	it('should return proper response (invalid) when transaction string has less than minimum required fee', async () => {
		if (isDevnet) {
			const response = await postDryrunTransaction({ transaction: TRANSACTION_ENCODED_INVALID });
			expect(response).toMap(jsonRpcEnvelopeSchema);

			const { result } = response;
			expect(result).toMap(goodRequestSchemaForTransactionsDryRun);
			expect(result.data).toBeInstanceOf(Object);
			expect(result.data).toMap(dryrunTransactionInvalidResponseSchema);
			expect(result.meta).toMap(metaSchema);
		}
	});

	it('should return invalid param when requested with invalid public key', async () => {
		if (isDevnet) {
			const { senderPublicKey, ...remTransactionObject } = TRANSACTION_OBJECT_VALID;
			for (let i = 0; i < invalidPublicKeys.length; i++) {
				remTransactionObject.senderPublicKey = invalidPublicKeys[i];
				// eslint-disable-next-line no-await-in-loop
				const response = await postDryrunTransaction({ transaction: remTransactionObject });
				expect(response).toMap(invalidParamsSchema);
			}
		}
	});

	it('should return invalid request when requested with invalid address', async () => {
		if (isDevnet) {
			const { params, ...remTransactionObject } = TRANSACTION_OBJECT_VALID;
			for (let i = 0; i < invalidAddresses.length; i++) {
				remTransactionObject.params = {
					...params,
					recipientAddress: invalidAddresses[i],
				};
				// eslint-disable-next-line no-await-in-loop
				const response = await postDryrunTransaction({ transaction: remTransactionObject });
				expect(response).toMap(invalidRequestSchema);
			}
		}
	});

	it('should return proper response (invalid) for duplicate transaction', async () => {
		if (isDevnet) {
			const transaction = await createTokenTransferTx(authEndpoint);
			const encodedTx = await encodeTransaction(transaction, baseUrlV3);

			// Check dryrun passes
			const firstResponse = await postDryrunTransaction({ transaction, strict: true });
			expect(firstResponse).toMap(jsonRpcEnvelopeSchema);

			const { result: firstResult } = firstResponse;
			expect(firstResult).toMap(goodRequestSchemaForTransactionsDryRun);
			expect(firstResult.data).toBeInstanceOf(Object);
			expect(firstResult.data).toMap(dryrunTransactionSuccessResponseSchema);
			expect(firstResult.meta).toMap(metaSchema);

			// Send transaction and wait for it to be included in the next block
			await postTransaction({ transaction: encodedTx });
			await waitMs(15000);

			// Check dry run fails for duplicate transaction
			const secondResponse = await postDryrunTransaction({ transaction, strict: true });
			expect(secondResponse).toMap(jsonRpcEnvelopeSchema);

			const { result: secondResult } = secondResponse;
			expect(secondResult).toMap(goodRequestSchemaForTransactionsDryRun);
			expect(secondResult.data).toBeInstanceOf(Object);
			expect(secondResult.data).toMap(dryrunTransactionInvalidResponseSchema);
			expect(secondResult.meta).toMap(metaSchema);
		}
	});

	it('should return invalid request when called with invalid transaction', async () => {
		if (isDevnet) {
			const response = await postDryrunTransaction({
				transaction: TRANSACTION_OBJECT_INVALID,
			}).catch(e => e);
			expect(response).toMap(invalidRequestSchema);
		}
	});

	it('should return invalid params when called with no transaction', async () => {
		if (isDevnet) {
			const response = await postDryrunTransaction();
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should throw error when called with invalid query parameter', async () => {
		if (isDevnet) {
			const response = await postDryrunTransaction({
				transaction: TRANSACTION_OBJECT_VALID,
				transactions: TRANSACTION_OBJECT_INVALID,
			}).catch(e => e);
			expect(response).toMap(invalidParamsSchema);
		}
	});
});
