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
const {
	getNFTs,
	getNFTConstants,
	getNFTSupported,
} = require('../controllers/nft');

module.exports = [
	{
		name: 'nft',
		controller: getNFTs,
		params: {
			nftID: { optional: true, type: 'string' },
			chainID: { optional: true, type: 'string' },
			collectionID: { optional: true, type: 'string' },
			index: { optional: true, type: 'number' },
			owner: { optional: true, type: 'string' },
			escrowChainID: { optional: true, type: 'string' },
			limit: { optional: true, type: 'number' },
			offset: { optional: true, type: 'number' },
		},
	},
	{
		name: 'nft.constants',
		controller: getNFTConstants,
		params: {},
	},
	{
		name: 'nft.supported',
		controller: getNFTSupported,
		params: {},
	},
];
