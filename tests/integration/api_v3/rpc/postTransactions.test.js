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

const INVALID_TRANSACTION = '0802100018002080c2d72f2a2027f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a322e0880a0cebdf3ef171214aebd99f07218109162a905d0e0c91e58bedc83c51a0e746f6b656e207472616e736665723a40a30998db4e96911a3d784b0a01b817baf64ec9745d7c0407255967506cb01764220e2e6ce66183d07';

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

	it('Invalid binary transaction -> empty response', async () => {
		const response = await postTransaction({ transaction: INVALID_TRANSACTION }).catch(e => e);
		expect(response).toMap(jsonRpcEnvelopeSchema);
	});

	it('Invalid query parameter -> -32602', async () => {
		const response = await postTransaction({ transactions: INVALID_TRANSACTION }).catch(e => e);
		expect(response).toMap(invalidParamsSchema);
	});
});
