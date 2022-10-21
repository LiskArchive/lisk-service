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
const { VALID_TRANSACTION, INVALID_TRANSACTION } = require('../constants/dryRunTransactions');
const { waitMs } = require('../../../utils');

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
	it('Post dryrun transaction succesfully', async () => {
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

	it('Returns proper response for duplicate transaction', async () => {
		const transaction = '0a05746f6b656e12087472616e7366657218082080c2d72f2a20a3f96c50d0446220ef2f98240898515cbba8155730679ca35326d98dcfb680f032270a0800000000000000001080c2d72f1a1474e3ba5ade3e94451bd4de9d19917c8e6eff624d22003a404d84fa6e2d39ddf0898b9df5c783e01b760b627db72f4d89a3610b42a1a17ab8861d480cfd0b297f4a16b70078c3e1ea4cd6c0e7aca41296d668dfc019a31f05';
		// Check dryrun passes
		const firstResponse = await postDryrunTransaction({ transaction });
		expect(firstResponse).toMap(jsonRpcEnvelopeSchema);

		const { result: firstResult } = firstResponse;
		expect(firstResult).toMap(goodRequestSchema);
		expect(firstResult.data).toBeInstanceOf(Object);
		expect(firstResult.data).toMap(dryrunTransactionResponseSchema);
		expect(firstResult.meta).toMap(metaSchema);
		expect(firstResult.data.events.length).toBeGreaterThan(0);

		// Send transaction and wait for it to be included in the next block
		await postTransaction({ transaction });
		await waitMs(15000);

		// Check dry run fails for duplicate transaction
		const secondResponse = await postDryrunTransaction({ transaction });
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
