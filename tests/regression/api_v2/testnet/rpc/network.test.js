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
const config = require('../../../../config');
const { request } = require('../../../../helpers/socketIoRpcRequest');

const {
	networkStatus,
} = require('../expectedResponse/rpc/network');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v2`;
const getNetworkStatus = async () => request(wsRpcUrl, 'get.network.status');

describe('Network API', () => {
	it('Retrieve network status', async () => {
		const response = await getNetworkStatus();

		// response.result.data
		expect(Number(response.result.data.height))
			.toBeGreaterThanOrEqual(Number(networkStatus.result.data.height));
		expect(Number(response.result.data.finalizedHeight))
			.toBeGreaterThanOrEqual(Number(networkStatus.result.data.finalizedHeight));
		expect(response.result.data.milestone)
			.toStrictEqual(networkStatus.result.data.milestone);
		expect(response.result.data.milestone)
			.toStrictEqual(networkStatus.result.data.milestone);
		expect(response.result.data.networkVersion)
			.toStrictEqual(networkStatus.result.data.networkVersion);
		expect(response.result.data.networkIdentifier)
			.toStrictEqual(networkStatus.result.data.networkIdentifier);
		expect(response.result.data.currentReward)
			.toStrictEqual(networkStatus.result.data.currentReward);
		expect(response.result.data.rewards)
			.toStrictEqual(networkStatus.result.data.rewards);
		expect(response.result.data.registeredModules)
			.toStrictEqual(networkStatus.result.data.registeredModules);
		expect(response.result.data.moduleAssets)
			.toStrictEqual(networkStatus.result.data.moduleAssets);
		expect(response.result.data.blockTime)
			.toStrictEqual(networkStatus.result.data.blockTime);
		expect(response.result.data.communityIdentifier)
			.toStrictEqual(networkStatus.result.data.communityIdentifier);
		expect(response.result.data.minRemainingBalance)
			.toStrictEqual(networkStatus.result.data.minRemainingBalance);
		expect(response.result.data.maxPayloadLength)
			.toStrictEqual(networkStatus.result.data.maxPayloadLength);

		// response.result.meta
		expect(response.result.meta.lastUpdate)
			.toBeGreaterThanOrEqual(networkStatus.result.meta.lastUpdate);
		expect(Number(response.result.meta.lastBlockHeight))
			.toBeGreaterThanOrEqual(Number(networkStatus.result.meta.lastBlockHeight));
	});
});
