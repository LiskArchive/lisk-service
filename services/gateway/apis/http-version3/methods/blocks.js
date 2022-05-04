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
const blocksSource = require('../../../sources/version3/blocks');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/blocks',
	rpcMethod: 'get.blocks',
	tags: ['Blocks'],
	params: {},
	source: blocksSource,
	envelope,
};
