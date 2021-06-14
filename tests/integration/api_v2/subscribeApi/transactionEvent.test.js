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
	transactionSchemaVersion5,
	postTransactionSchema,
} = require('../../../schemas/transaction.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV2 = `${baseUrl}/api/v2`;

const endpoint = `${config.SERVICE_ENDPOINT_RPC}/blockchain`;

describe('Test subscribe API transaction confirmed event', () => {
	it('event update.transactions.confirmed', async () => {
		const postTransactions = await api.post(`${baseUrlV2}/transactions?transaction=0802100018002080c2d72f2a200fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a32270880c2d72f1214ab0041a7d3f7b2c290b5b834d46bdc7b7eb858151a0a73656e6420746f6b656e3a40ff340ed1eb838a4db3b9c225a39406b577ff91e0e5bb17dfd0a8b15e300aad5f153a0f4a03d093f24234682864dac7b0578c6dc4f96713ccba5f172da9243c07`);
		expect(postTransactions).toMap(postTransactionSchema);
		const response = await subscribeAndReturn(endpoint, 'update.transactions.confirmed');
		expect(response).toMap(goodRequestSchema);
		response.data.forEach(tx => expect(tx).toMap(transactionSchemaVersion5));
		expect(response.meta).toMap(metaSchema);
	});

	afterAll(done => {
		closeAllConnections();
		done();
	});
});
