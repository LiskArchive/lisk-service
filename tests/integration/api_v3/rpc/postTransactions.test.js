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

const { request } = require('../../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
	invalidRequestSchema,
} = require('../../../schemas/rpcGenerics.schema');

const { postTransactionSchema } = require('../../../schemas/api_v3/transaction.schema');
const { createTokenTransferTx } = require('../txUtil/createTx');
const { encodeTransaction } = require('../txUtil/encodeTx');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const postTransaction = async params => request(wsRpcUrl, 'post.transactions', params);
const networkStatus = async params => request(wsRpcUrl, 'get.network.status', params);

const INVALID_TRANSACTION =
	'0802100018002080c2d72f2a2027f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a322e0880a0cebdf3ef171214aebd99f07218109162a905d0e0c91e58bedc83c51a0e746f6b656e207472616e736665723a40a30998db4e96911a3d784b0a01b817baf64ec9745d7c0407255967506cb01764220e2e6ce66183d07';

const baseUrlV3 = `${config.SERVICE_ENDPOINT}/api/v3`;
const authEndpoint = `${baseUrlV3}/auth`;

describe('Method post.transactions', () => {
	let isDevnet = false;

	beforeAll(async () => {
		const response = await networkStatus({});
		if (response && response.data) {
			isDevnet = response.data.chainID === '04000000';
		}
	});

	it('should post transaction successfully', async () => {
		if (isDevnet) {
			const transaction = await createTokenTransferTx(authEndpoint);
			const encodedTx = await encodeTransaction(transaction, baseUrlV3);

			const response = await postTransaction({
				transaction: encodedTx,
			});
			const { result } = response;

			expect(result).toBeInstanceOf(Object);
			expect(result).toMap(postTransactionSchema);
		}
	});

	it('should return error when posting invalid binary transaction', async () => {
		if (isDevnet) {
			const response = await postTransaction({ transaction: INVALID_TRANSACTION }).catch(e => e);
			expect(response).toMap(invalidRequestSchema);
		}
	});

	it('should return error in case of invalid query params', async () => {
		if (isDevnet) {
			const response = await postTransaction({ transactions: INVALID_TRANSACTION }).catch(e => e);
			expect(response).toMap(invalidParamsSchema);
		}
	});
});
