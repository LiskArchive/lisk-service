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
const blockchainAppTokenMetadata = require('./mappings/blockchainAppTokenMetadata');

module.exports = {
	type: 'moleculer',
	method: 'app-registry.blockchain.apps.meta.tokens.supported',
	params: {
		chainID: '=,string',
		offset: '=,number',
		limit: '=,number',
		sort: '=,string',
	},
	definition: {
		data: ['data', blockchainAppTokenMetadata],
		meta: {
			count: '=,number',
			offset: '=,number',
			total: '=,number',
		},
		links: {},
	},
};
