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
const registerApi = require('./shared/registerHttpApi');

module.exports = [
	registerApi('http-version1', {
		path: '/v1',

		whitelist: [
			'$node.*',
		],

		aliases: {
			'GET health': '$node.health',
		},

		callOptions: {
			timeout: 3000,
			retries: 3,
			fallbackResponse: 'Static fallback response',
		},

		authorization: false,
		mergeParams: true,

		mappingPolicy: 'restrict',

		bodyParsers: {
			json: true,
			urlencoded: { extended: true },
		},

		uses: [],
	}),
];
