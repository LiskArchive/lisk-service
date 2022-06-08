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
	request,
} = require('../../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	networkStatisticsSchema,
	goodRequestSchema,
} = require('../../../schemas/api_v3/networkStatistics.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getNetworkStatistics = async () => request(wsRpcUrl, 'get.network.statistics');

// TODO: Enable when peers endpoint is available from sdk
xdescribe('get.network.statistics', () => {
	it('returns network statistics', async () => {
		const response = await getNetworkStatistics();
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(networkStatisticsSchema);
	});

	it('invalid request param -> invalid param', async () => {
		const response = await getNetworkStatistics({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});
});
