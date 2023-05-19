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
	blockchainAppsStatsSchema,
	goodRequestSchemaForStats,
} = require('../../../schemas/api_v3/blockchainApps.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getBlockchainAppsStatistics = async (params) => request(wsRpcUrl, 'get.blockchain.apps.statistics', params);

describe('get.blockchain.apps.statistics', () => {
	it('returns apps statistics', async () => {
		const response = await getBlockchainAppsStatistics();
		const { result } = response;
		expect(result).toMap(goodRequestSchemaForStats);
		expect(result.data).toMap(blockchainAppsStatsSchema);
	});

	it('invalid request param -> invalid param', async () => {
		const response = await getBlockchainAppsStatistics({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});
});
