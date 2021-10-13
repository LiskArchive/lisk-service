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
const { request } = require('../../../helpers/socketIoRpcRequest');

const {
	resultEnvelopeSchema,
	jsonRpcEnvelopeSchema,
	metaSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	multisigTransactionSchema,
} = require('../../../schemas/api_v2/multisigTransaction.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v2`;
const getTransactions = async params => request(wsRpcUrl, 'get.transactions.multisig', params);

describe('Method get.transactions.multisig', () => {
	let refTransaction;
	beforeAll(async () => {
		const response1 = await getTransactions({ limit: 1 });
		[refTransaction] = response1.result.data;
	});

	describe('is able to retrieve multisig transaction', () => {
		it('list of multisig transactions', async () => {
			const response = await getTransactions();
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeArrayOfSize(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => expect(transaction).toMap(multisigTransactionSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('Known multisig transaction by serviceId', async () => {
			const response = await getTransactions({ serviceId: refTransaction.serviceId });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeArrayOfSize(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => expect(transaction).toMap(multisigTransactionSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('Known multisig transaction by address', async () => {
			const response = await getTransactions({ address: refTransaction.address });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeArrayOfSize(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => expect(transaction).toMap(multisigTransactionSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('Known multisig transaction by publicKey', async () => {
			const response = await getTransactions({ publicKey: refTransaction.publicKey });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeArrayOfSize(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(transaction => expect(transaction).toMap(multisigTransactionSchema));
			expect(result.meta).toMap(metaSchema);
		});
	});
});
