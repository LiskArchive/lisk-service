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
const forgersSoruce = require('../../../sources/version2/forgers');
const envelope = require('../../../sources/version2/mappings/stdEnvelope');

module.exports = {
    version: '2.0',
    swaggerApiPath: '/forgers',
    rpcMethod: 'get.forgers',
	params: {
		limit: { optional: true, min: 1, max: 103, type: 'number' },
		offset: { optional: true, min: 0, type: 'number' },
	},
    tags: ['Forgers'],
    source: forgersSoruce,
    envelope,
};
