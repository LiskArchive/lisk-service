/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
import config from '../../../config';

const {
	subscribeAndReturn,
	closeAllConnections,
} = require('../../../helpers/socketIoSubscribe');

const {
	blockSchema,
} = require('../../../schemas/block.schema');

const endpoint = `${config.SERVICE_ENDPOINT}/blockchain`;

describe(`Recieve event from update.block from ${config.SERVICE_ENDPOINT}`, () => {
	it('event update.block', async () => {
		const result = await subscribeAndReturn(endpoint, 'update.block');
		expect(result.data).toMap(blockSchema);
	});

	afterAll(done => {
		closeAllConnections();
		done();
	});
});
