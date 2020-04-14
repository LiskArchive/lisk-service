/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
	getBlocks,
	getLastBlocks,
	getBestBlocks,
} = require('./controllers/blocks');

module.exports = [
	{
		name: 'blocks',
		controller: getBlocks,
		params: {
			blockId: { required: false },
			height: { required: false },
			limit: { required: false },
			offset: { required: false },
			sort: { required: false },
			address: { required: false },
			fromTimestamp: { required: false },
			toTimestamp: { required: false },
		},
	},
	{
		name: 'blocks.last',
		controller: getLastBlocks,
		params: {
			limit: { required: false },
			offset: { required: false },
		},
	},
	{
		name: 'blocks.best',
		controller: getBestBlocks,
		params: {
			limit: { required: false },
			offset: { required: false },
		},
	},
];
