/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
const {
	TRANSACTION_OBJECT_VALID,
	TRANSACTION_ENCODED_VALID,
} = require('../constants/transactionsDryRun');

const {
	request,
} = require('../../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
	serverErrorSchema,
} = require('../../../schemas/rpcGenerics.schema');

const { transactionCalculateFees } = require('../../../schemas/api_v3/transactionsCalculateFees.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const calculateTransactionFees = async params => request(wsRpcUrl, 'post.transactions.calculate-fees', params);

describe('Method post.transactions.calculate-fees', () => {
	it('should return transaction fees with valid transaction object', async () => {
		const response = await calculateTransactionFees({ transaction: TRANSACTION_OBJECT_VALID });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(transactionCalculateFees);
	});

	it('should return transaction fees with valid transaction string', async () => {
		const response = await calculateTransactionFees({ transaction: TRANSACTION_ENCODED_VALID });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(transactionCalculateFees);
	});

	it('should throw error in case of invalid transaction', async () => {
		const response = await calculateTransactionFees({ transaction: 'INVALID_TRANSACTION' });
		expect(response).toMap(serverErrorSchema);
	});

	it('No transaction -> invalid param', async () => {
		const response = await calculateTransactionFees();
		expect(response).toMap(invalidParamsSchema);
	});

	it('Invalid query parameter -> -32602', async () => {
		const response = await calculateTransactionFees({ transactions: TRANSACTION_OBJECT_VALID });
		expect(response).toMap(invalidParamsSchema);
	});
});
