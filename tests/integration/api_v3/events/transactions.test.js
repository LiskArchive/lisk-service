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
	subscribeAndReturn,
	closeAllConnections,
} = require('../../../helpers/socketIoSubscribe');

const {
	goodRequestSchema,
	metaSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	transactionSchema,
	postTransactionSchema,
} = require('../../../schemas/api_v3/transaction.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV2 = `${baseUrl}/api/v3`;

const endpoint = `${config.SERVICE_ENDPOINT_RPC}/blockchain`;

describe('Test subscribe API transaction event', () => {
	it('event update.transactions', async () => {
		// Post signed transaction to lisk-core (test blockchain CI)
		const postTransaction = await api.post(
			`${baseUrlV2}/transactions`,
			{ transaction: '0802100018002080c2d72f2a200fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a32240880c2d72f1214df0e187bb3895806261c87cf66e1772566ee8e581a07746573742074783a40a972e48ab2ed5222311538ba7bbd3ab139e2d1e8ce07096a277e53859beaedd3641b6cd5498d489514a2f9dbeb1092c4ceb27cd4f387ca3687dd8c3cfc833d02' },
		);
		expect(postTransaction).toMap(postTransactionSchema);

		// Subscribe to event update.transactions
		const response = await subscribeAndReturn(endpoint, 'update.transactions');
		expect(response).toMap(goodRequestSchema);
		response.data.forEach(tx => expect(tx).toMap(transactionSchema));
		expect(response.meta).toMap(metaSchema);
	});

	afterAll(done => {
		closeAllConnections();
		done();
	});
});
