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
const {
	getBlockchainAppsMetadata,
	getBlockchainAppsMetaList,
	getBlockchainAppsTokenMetadata,
} = require('./controllers/metadata');

module.exports = [
	{
		name: 'blockchain.apps.meta',
		params: {
			chainID: { optional: true, type: 'string' },
			chainName: { optional: true, type: 'string' },
			network: { optional: true, type: 'string' },
			search: { optional: true, type: 'string' },
			limit: { optional: true, type: 'number' },
			offset: { optional: true, type: 'number' },
			sort: { optional: true, type: 'string' },
		},
		controller: getBlockchainAppsMetadata,
	},
	{
		name: 'blockchain.apps.meta.list',
		params: {
			chainName: { optional: true, type: 'string' },
			network: { optional: true, type: 'string' },
			search: { optional: true, type: 'string' },
			limit: { optional: true, type: 'number' },
			offset: { optional: true, type: 'number' },
			sort: { optional: true, type: 'string' },
		},
		controller: getBlockchainAppsMetaList,
	},
	{
		name: 'blockchain.apps.meta.tokens',
		params: {
			chainName: { optional: true, type: 'string' },
			chainID: { optional: true, type: 'string' },
			tokenName: { optional: true, type: 'string' },
			tokenID: { optional: true, type: 'string' },
			network: { optional: false, type: 'string', min: 1, default: 'mainnet', enum: ['mainnet', 'testnet', 'betanet'] },
			search: { optional: true, type: 'string' },
			limit: { optional: true, type: 'number' },
			offset: { optional: true, type: 'number' },
			sort: { optional: true, type: 'string' },
		},
		controller: getBlockchainAppsTokenMetadata,
	},
];
