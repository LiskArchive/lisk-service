/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const { api } = require('../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
} = require('../../schemas/rpcGenerics.schema');

const {
	goodRequestSchema,
	networkStatisticsSchema,
} = require('../../schemas/networkStatistics.schema');

const requestNetworkStatistics = async params => api.getJsonRpcV1('get.network.statistics', params);

describe('get.network.statistics', () => {
	it('returns network statistics', async () => {
		const response = await requestNetworkStatistics();
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(networkStatisticsSchema);
	});

	xit('params not supported -> 400 BAD REQUEST', async () => {
		const response = await requestNetworkStatistics({ someparam: 'not_supported' }).catch(e => e);
		expect(response).toMap(invalidParamsSchema);
	});
});
