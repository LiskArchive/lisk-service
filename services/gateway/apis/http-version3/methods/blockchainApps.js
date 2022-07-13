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
const blockchainAppsSchemaSource = require('../../../sources/version3/blockchainAppsSchema');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../shared/regex');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/blockchain/apps',
	rpcMethod: 'get.blockchain.apps',
	tags: ['Blockchain Applications'],
	params: {
		chainID: { optional: true, type: 'string', min: 1, max: 21, pattern: regex.CHAINID_RANGE },
		isDefault: { optional: true, type: 'boolean' },
		name: { optional: true, type: 'string', min: 1, max: 20, pattern: regex.NAME },
		state: { optional: true, type: 'string', enum: ['registered', 'active', 'terminated', 'any'], default: 'any' },
		search: { optional: true, type: 'string' },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
	},
	source: blockchainAppsSchemaSource,
	envelope,
};
