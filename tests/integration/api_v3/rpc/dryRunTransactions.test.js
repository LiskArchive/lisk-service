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
const { VALID_TRANSACTION, INVALID_TRANSACTION } = require('../constants/dryRunTransactions');

const {
	request,
} = require('../../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
	serverErrorSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	dryrunTransactionSchema,
	metaSchema,
} = require('../../../schemas/api_v3/dryrunTransaction.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const postDryrunTransaction = async params => request(wsRpcUrl, 'post.transactions.dryrun', params);

describe('Method post.transactions', () => {
	it('Post transaction succesfully', async () => {
		const response = await postDryrunTransaction(
			{
				transaction: VALID_TRANSACTION,
			},
		);
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result.data).toBeInstanceOf(Object);
		expect(result.data).toMap(dryrunTransactionSchema);
		expect(result.meta).toMap(metaSchema);
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

	it('invalid query parameter -> -32602', async () => {
		const response = await postDryrunTransaction({
			transaction: VALID_TRANSACTION,
			transactions: INVALID_TRANSACTION,
		}).catch(e => e);
		expect(response).toMap(invalidParamsSchema);
	});
});
