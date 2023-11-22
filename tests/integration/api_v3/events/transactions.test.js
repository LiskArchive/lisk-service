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

const { subscribeAndReturn, closeAllConnections } = require('../../../helpers/socketIoSubscribe');

const { goodRequestSchema, metaSchema } = require('../../../schemas/httpGenerics.schema');

const {
	transactionSchema,
	postTransactionSchema,
} = require('../../../schemas/api_v3/transaction.schema');

const { createTokenTransferTx } = require('../txUtil/createTx');
const { encodeTransaction } = require('../txUtil/encodeTx');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;

const endpoint = `${config.SERVICE_ENDPOINT_RPC}/blockchain`;
const authEndpoint = `${baseUrlV3}/auth`;

describe('Test subscribe API transaction event', () => {
	it('event new.transactions', async () => {
		const transaction = await createTokenTransferTx(authEndpoint);
		const encodedTx = await encodeTransaction(transaction, baseUrlV3);

		// Post signed transaction to lisk-core (test blockchain CI)
		const postTransaction = await api.post(`${baseUrlV3}/transactions`, {
			transaction: encodedTx,
		});
		expect(postTransaction).toMap(postTransactionSchema);

		// Subscribe to event update.transactions
		const response = await subscribeAndReturn(endpoint, 'new.transactions');
		expect(response).toMap(goodRequestSchema);
		response.data.forEach(tx => expect(tx).toMap(transactionSchema));
		expect(response.meta).toMap(metaSchema);
	});

	afterAll(done => {
		closeAllConnections();
		done();
	});
});
