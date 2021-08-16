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

describe('Test subscribe API transaction event', () => {
	it('event update.transactions', async () => {
		// Post signed transaction to lisk-core (test blockchain CI)
		const postTransaction = await api.post(
			`${baseUrlV2}/transactions`,
			{ transaction: '080210001884012080c2d72f2a200fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a322b0880c2d72f1214df0e187bb3895806261c87cf66e1772566ee8e581a0e746f6b656e207472616e736665723a406a61964c4040f168ff2b0390a336347163aaf50db32eba4878a8c9b3f09da0b3489592d6738ce4658a835187d2428bad5aa5bf3b9552880f5678d83530c91707' },
		);
		expect(postTransaction).toMap(postTransactionSchema);

		// Subscribe to event update.transactions
		const response = await subscribeAndReturn(endpoint, 'update.transactions');
		expect(response).toMap(goodRequestSchema);
		response.data.forEach(tx => expect(tx).toMap(transactionSchemaVersion5));
		expect(response.meta).toMap(metaSchema);
	});

	afterAll(done => {
		closeAllConnections();
		done();
	});
});
