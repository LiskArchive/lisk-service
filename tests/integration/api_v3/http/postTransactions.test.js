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
const { api } = require('../../../helpers/api');

const {
	badRequestSchema,
	wrongInputParamSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	postTransactionSchema,
} = require('../../../schemas/api_v3/transaction.schema');
const { encodeTransaction } = require('../txUtil/encodeTx');
const { createTokenTransferTx } = require('../txUtil/createTx');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/transactions`;
const authEndpoint = `${baseUrlV3}/auth`;
const networkStatus = `${baseUrlV3}/network/status`;

const INVALID_TRANSACTION = '0802100018002080c2d72f2a2027f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a322e0880a0cebdf3ef171214aebd99f07218109162a905d0e0c91e58bedc83c51a0e746f6b656e207472616e736665723a40a30998db4e96911a3d784b0a01b817baf64ec9745d7c0407255967506cb01764220e2e6ce66183d07';

describe('Post transactions API', () => {
	let isDevnet = false;

	beforeAll(async () => {
		const response = await api.get(networkStatus);
		if (response && response.data) {
			isDevnet = response.data.chainID === '04000000';
		}
	});

	it('should post transaction successfully', async () => {
		if (isDevnet) {
			const transaction = await createTokenTransferTx(authEndpoint);
			const encodedTx = await encodeTransaction(transaction, baseUrlV3);

			const postTransaction = await api.post(
				endpoint,
				{ transaction: encodedTx },
			);
			expect(postTransaction).toMap(postTransactionSchema);
		}
	});

	it('should return bad request when posting invalid binary transaction', async () => {
		if (isDevnet) {
			const postTransaction = await api.post(
				endpoint,
				{ transaction: INVALID_TRANSACTION },
				400,
			);
			expect(postTransaction).toMap(badRequestSchema);
		}
	});

	it('should return bad request in case of invalid query params', async () => {
		if (isDevnet) {
			const postTransaction = await api.post(
				endpoint,
				{ transactions: INVALID_TRANSACTION },
				400,
			);
			expect(postTransaction).toMap(wrongInputParamSchema);
		}
	});
});
