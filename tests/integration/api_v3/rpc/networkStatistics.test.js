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
	jsonRpcEnvelopeSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	goodRequestSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	networkStatisticsSchema,
} = require('../../../schemas/api_v3/networkStatistics.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getNetworkStatistics = async (params) => request(wsRpcUrl, 'get.network.statistics', params);

describe('get.network.statistics', () => {
	it('returns network statistics', async () => {
		const response = await getNetworkStatistics();
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(result.data).toMap(networkStatisticsSchema);
	});

	it('invalid request param -> invalid param', async () => {
		const response = await getNetworkStatistics({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});
});
