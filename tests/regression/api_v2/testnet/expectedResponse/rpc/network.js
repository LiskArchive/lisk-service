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
const networkStatus = {
	jsonrpc: '2.0',
	result: {
		data: {
			height: '14631556',
			finalizedHeight: 14631399,
			milestone: [
				'500000000',
				'400000000',
				'300000000',
				'200000000',
				'100000000',
			],
			networkVersion: '3.0',
			networkIdentifier: '15f0dacc1060e91818224a94286b13aa04279c640bd5d6f193182031d133df7c',
			currentReward: 100000000,
			rewards: {
				milestones: [
					'500000000',
					'400000000',
					'300000000',
					'200000000',
					'100000000',
				],
				offset: 2160,
				distance: 3000000,
			},
			registeredModules: [
				'token',
				'sequence',
				'keys',
				'dpos',
				'legacyAccount',
			],
			moduleAssets: [
				{
					id: '2:0',
					name: 'token:transfer',
				},
				{
					id: '4:0',
					name: 'keys:registerMultisignatureGroup',
				},
				{
					id: '5:0',
					name: 'dpos:registerDelegate',
				},
				{
					id: '5:1',
					name: 'dpos:voteDelegate',
				},
				{
					id: '5:2',
					name: 'dpos:unlockToken',
				},
				{
					id: '5:3',
					name: 'dpos:reportDelegateMisbehavior',
				},
				{
					id: '1000:0',
					name: 'legacyAccount:reclaimLSK',
				},
			],
			blockTime: 10,
			communityIdentifier: 'Lisk',
			minRemainingBalance: '5000000',
			maxPayloadLength: 15360,
		},
		meta: {
			lastUpdate: 1632232066,
			lastBlockHeight: '14631556',
			lastBlockId: 'a44415e17cc0e5eab59ff515498f8a0e446f47052208ecbc19eb3263fc4ee8ac',
		},
	},
	id: 1,
};

module.exports = {
	networkStatus,
};
