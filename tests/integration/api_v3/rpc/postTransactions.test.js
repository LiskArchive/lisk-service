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

const { INVALID_TRANSACTION } = require('../constants/postTransactions');

const {
	request,
} = require('../../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	postTransactionSchema,
} = require('../../../schemas/api_v3/transaction.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const postTransaction = async params => request(wsRpcUrl, 'post.transactions', params);

describe('Method post.transactions', () => {
	it('Post transaction succesfully', async () => {
		const response = await postTransaction(
			{
				transaction: '0a05746f6b656e12087472616e7366657218012080c2d72f2a20a3f96c50d0446220ef2f98240898515cbba8155730679ca35326d98dcfb680f032270a0800000000000000001080c2d72f1a1474e3ba5ade3e94451bd4de9d19917c8e6eff624d22003a403881faa16364f5d6a08fb50736ec4809f4d50bba90a3e00c3b10d4f96b85fe50268bf545e95632d582d4ccac750953a09faa5da9d6d49f441baea7f888e5c007',
			},
		);
		const { result } = response;

		expect(result).toBeInstanceOf(Object);
		expect(result).toMap(postTransactionSchema);
	});

	it('invalid binary transaction -> empty response', async () => {
		const response = await postTransaction({ transaction: INVALID_TRANSACTION }).catch(e => e);
		expect(response).toMap(jsonRpcEnvelopeSchema);
	});

	it('invalid query parameter -> -32602', async () => {
		const response = await postTransaction({ transactions: INVALID_TRANSACTION }).catch(e => e);
		expect(response).toMap(invalidParamsSchema);
	});
});
