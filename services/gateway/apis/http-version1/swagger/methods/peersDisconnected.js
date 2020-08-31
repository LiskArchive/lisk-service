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

const peersDisconnected = require('../../methods/peersDisconnected');

const key = peersDisconnected.swaggerApiPath;
const peerSchema = {};
peerSchema[key] = { get: {} };
peerSchema[key] = { get: { tags: ['Peers'] } };
peerSchema[key].get.responses = {
	200: {
		description: 'array of connected peers',
		schema: {
			type: 'array',
			items: {
				$ref: '#/definitions/PeersWithEnvelope',
			},
		},
	},
	400: {
		description: 'bad input parameter',
	},
	404: {
		description: 'Not found',
	},
};
module.exports = peerSchema;
