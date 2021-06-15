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

const {
	subscribeAndReturn,
	closeAllConnections,
} = require('../../../helpers/socketIoSubscribe');

const {
	feeEstimateSchema,
	goodRequestSchema,
	metaSchema,
} = require('../../../schemas/api_v2/fees.schema');

const endpoint = `${config.SERVICE_ENDPOINT_RPC}/blockchain`;

describe('Test subscribe API fees estimates event', () => {
	it('event update.fee_estimates', async () => {
		const response = await subscribeAndReturn(endpoint, 'update.fee_estimates');
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(feeEstimateSchema);
		expect(response.meta).toMap(metaSchema);
	});
	afterAll(done => {
		closeAllConnections();
		done();
	});
});
