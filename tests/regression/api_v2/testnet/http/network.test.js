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
const { api } = require('../../../../helpers/api');

const {
	networkStatus,
} = require('../expectedResponse/http/network');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV2 = `${baseUrl}/api/v2`;
const endpoint = `${baseUrlV2}/network`;

describe('Network API', () => {
	it('Retrieve network status', async () => {
		const response = await api.get(`${endpoint}/status`);

		// response.data
		expect(Number(response.data.height)).toBeGreaterThanOrEqual(Number(networkStatus.data.height));
		expect(Number(response.data.finalizedHeight))
			.toBeGreaterThanOrEqual(Number(networkStatus.data.finalizedHeight));
		expect(response.data.milestone).toStrictEqual(networkStatus.data.milestone);
		expect(response.data.milestone).toStrictEqual(networkStatus.data.milestone);
		expect(response.data.networkVersion).toStrictEqual(networkStatus.data.networkVersion);
		expect(response.data.networkIdentifier).toStrictEqual(networkStatus.data.networkIdentifier);
		expect(response.data.currentReward).toStrictEqual(networkStatus.data.currentReward);
		expect(response.data.rewards).toStrictEqual(networkStatus.data.rewards);
		expect(response.data.registeredModules).toStrictEqual(networkStatus.data.registeredModules);
		expect(response.data.moduleAssets).toStrictEqual(networkStatus.data.moduleAssets);
		expect(response.data.blockTime).toStrictEqual(networkStatus.data.blockTime);
		expect(response.data.communityIdentifier).toStrictEqual(networkStatus.data.communityIdentifier);
		expect(response.data.minRemainingBalance).toStrictEqual(networkStatus.data.minRemainingBalance);
		expect(response.data.maxPayloadLength).toStrictEqual(networkStatus.data.maxPayloadLength);

		// response.meta
		expect(response.meta.lastUpdate).toBeGreaterThanOrEqual(networkStatus.meta.lastUpdate);
		expect(Number(response.meta.lastBlockHeight))
			.toBeGreaterThanOrEqual(Number(networkStatus.meta.lastBlockHeight));
	});
});
