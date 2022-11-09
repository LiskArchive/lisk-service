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
const { VALID_TRANSACTION, INVALID_TRANSACTION, ENCODED_VALID_TRANSACTION } = require('../constants/dryRunTransactions');
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
	dryrunTransactionResponseSchema,
	goodRequestSchema,
	metaSchema,
} = require('../../../schemas/api_v3/dryrunTransaction.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const postDryrunTransaction = async params => request(wsRpcUrl, 'post.transactions.dryrun', params);
const postTransaction = async params => request(wsRpcUrl, 'post.transactions', params);

describe('Method post.transactions.dryrun', () => {
	it('Post dryrun transaction succesfully with only transaction', async () => {
		const response = await postDryrunTransaction(
			{
				transaction: VALID_TRANSACTION,
			},
		);
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(result.data).toBeInstanceOf(Object);
		expect(result.data).toMap(dryrunTransactionResponseSchema);
		expect(result.meta).toMap(metaSchema);
		expect(result.data.events.length).toBeGreaterThan(0);
	});

	it('Post dryrun transaction succesfully skipping verification', async () => {
		const response = await postDryrunTransaction(
			{
				transaction: VALID_TRANSACTION,
				isSkipVerify: true,
			},
		);
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(result.data).toBeInstanceOf(Object);
		expect(result.data).toMap(dryrunTransactionResponseSchema);
		expect(result.meta).toMap(metaSchema);
		expect(result.data.events.length).toBeGreaterThan(0);
	});

	it('Returns proper response for duplicate transaction', async () => {
		// Check dryrun passes
		const firstResponse = await postDryrunTransaction({ VALID_TRANSACTION });
		expect(firstResponse).toMap(jsonRpcEnvelopeSchema);

		const { result: firstResult } = firstResponse;
		expect(firstResult).toMap(goodRequestSchema);
		expect(firstResult.data).toBeInstanceOf(Object);
		expect(firstResult.data).toMap(dryrunTransactionResponseSchema);
		expect(firstResult.meta).toMap(metaSchema);
		expect(firstResult.data.events.length).toBeGreaterThan(0);

		// Send transaction and wait for it to be included in the next block
		await postTransaction({ ENCODED_VALID_TRANSACTION });
		await waitMs(15000);

		// Check dry run fails for duplicate transaction
		const secondResponse = await postDryrunTransaction({ VALID_TRANSACTION });
		expect(secondResponse).toMap(jsonRpcEnvelopeSchema);

		const { result: secondResult } = secondResponse;
		expect(secondResult).toMap(goodRequestSchema);
		expect(secondResult.data).toBeInstanceOf(Object);
		expect(secondResult.data).toMap(dryrunTransactionResponseSchema);
		expect(secondResult.data.events.length).toBe(0);
		expect(secondResult.data.success).toBe(false);
		expect(secondResult.meta).toMap(metaSchema);
	});

	it('invalid binary transaction -> empty response', async () => {
		const response = await postDryrunTransaction({
			transaction: INVALID_TRANSACTION,
		}).catch(e => e);
		expect(response).toMap(serverErrorSchema);
	});

	it('No transaction -> invalid param', async () => {
		const response = await postDryrunTransaction();
		expect(response).toMap(invalidParamsSchema);
	});

	it('Invalid query parameter -> -32602', async () => {
		const response = await postDryrunTransaction({
			transaction: VALID_TRANSACTION,
			transactions: INVALID_TRANSACTION,
		}).catch(e => e);
		expect(response).toMap(invalidParamsSchema);
	});
});
