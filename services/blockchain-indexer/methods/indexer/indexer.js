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
	getMissingBlocks,
	getIndexVerifiedHeight,
	setIndexVerifiedHeight,
} = require('../../shared/indexer/blockchainIndex');

const {
	getCurrentHeight,
	getGenesisHeight,
} = require('../../shared/constants');

module.exports = [
	{
		name: 'getMissingBlocks',
		controller: getMissingBlocks,
		params: {
			from: { optional: false, type: 'any' },
			to: { optional: false, type: 'any' },
		},
	},
	{
		name: 'getCurrentHeight',
		controller: getCurrentHeight,
		params: {},
	},
	{
		name: 'getGenesisHeight',
		controller: getGenesisHeight,
		params: {},
	},
	{
		name: 'getIndexVerifiedHeight',
		controller: getIndexVerifiedHeight,
		params: {},
	},
	{
		name: 'setIndexVerifiedHeight',
		controller: setIndexVerifiedHeight,
		params: {
			height: { optional: false, type: 'number' },
		},
	},
];
