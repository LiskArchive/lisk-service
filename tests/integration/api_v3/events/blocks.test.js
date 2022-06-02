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
	subscribeAndReturn,
	closeAllConnections,
} = require('../../../helpers/socketIoSubscribe');

const {
	goodRequestSchema,
	metaSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	blockSchema,
} = require('../../../schemas/api_v3/block.schema');

const endpoint = `${config.SERVICE_ENDPOINT_RPC}/blockchain`;

describe('Test subscribe API latest block event', () => {
	it('event update.block', async () => {
		const response = await subscribeAndReturn(endpoint, 'update.block');
		expect(response).toMap(goodRequestSchema);
		expect(response.data.length).toEqual(1);
		response.data.forEach(block => expect(block).toMap(blockSchema));
		expect(response.meta).toMap(metaSchema);
	});

	afterAll(done => {
		closeAllConnections();
		done();
	});
});
