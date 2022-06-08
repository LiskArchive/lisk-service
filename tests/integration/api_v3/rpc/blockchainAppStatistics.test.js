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
	blockchainAppStatsSchema,
	goodRequestSchema,
} = require('../../../schemas/api_v3/blockchainAppStatsSchema.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getBlockchainAppStatistics = async (params) => request(wsRpcUrl, 'get.blockchain.apps.statistics', params);

describe('get.blockchain.apps.statistics', () => {
	it('returns apps statistics', async () => {
		const response = await getBlockchainAppStatistics();
		const { result } = response;
		expect(result).toMap(goodRequestSchema);
		expect(result.data).toMap(blockchainAppStatsSchema);
	});

	it('invalid request param -> invalid param', async () => {
		const response = await getBlockchainAppStatistics({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});
});
