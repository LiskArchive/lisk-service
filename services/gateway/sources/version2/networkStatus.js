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
module.exports = {
	type: 'moleculer',
	params: {},
	method: 'core.network.status',
	definition: {
		data: {
			height: '=,number',
			finalizedHeight: '=,number',
			networkVersion: '=,string',
			networkIdentifier: '=,string',
			milestone: '=,string',
			currentReward: '=,string',
			rewards: 'data.genesisConfig.rewards',
			supply: '=,string',
			registeredModules: '=',
			moduleAssets: '=',
			blockTime: 'data.genesisConfig.blockTime,number',
			communityIdentifier: 'data.genesisConfig.communityIdentifier,string',
			minRemainingBalance: 'data.genesisConfig.minRemainingBalance,string',
			maxPayloadLength: 'data.genesisConfig.maxPayloadLength,number',
		},
		meta: {
			lastUpdate: 'data.lastUpdate,number',
			lastBlockHeight: 'data.height,number',
			lastBlockId: 'data.lastBlockID,string',
		},
		links: {},
	},
};
