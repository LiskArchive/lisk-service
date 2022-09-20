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
module.exports = {
	type: 'moleculer',
	params: {},
	method: 'indexer.network.status',
	definition: {
		data: {
			version: '=,string',
			networkVersion: '=,string',
			chainID: '=,string',
			lastBlockID: '=,string',
			height: '=,number',
			finalizedHeight: '=,number',
			syncing: '=,boolean',
			unconfirmedTransactions: '=,number',
			genesis: '=',
			registeredModules: '=',
			moduleCommands: '=',
			network: '=',
		},
		meta: {
			lastUpdate: 'data.lastUpdate,number',
			lastBlockHeight: 'data.height,number',
			lastBlockID: 'data.lastBlockID,string',
		},
		links: {},
	},
};
