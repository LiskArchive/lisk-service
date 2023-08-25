/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
const nftHistory = require('./mappings/nft');

module.exports = {
	type: 'moleculer',
	method: 'indexer.nft.history',
	params: {
		nftID: '=,string',
		type: '=,string',
		limit: '=,number',
		offset: '=,number',
		sort: '=,string',
	},
	definition: {
		data: ['data', nftHistory],
		meta: {
			id: '=,string',
			nft: {
				chainID: '=,string',
				collectionID: '=,string',
				index: '=,number',
			},
		},
	},
};
