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
const nftSupported = require('../../mappings/nftSupported');

module.exports = {
	type: 'moleculer',
	method: 'indexer.nft.supported',
	params: {},
	definition: {
		data: nftSupported,
		meta: {},
	},
};
