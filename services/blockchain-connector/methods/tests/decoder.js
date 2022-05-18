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
	decodeBlock,
	decodeTransaction,
	decodeEventPayload,
	decodeResponse,
} = require('../../shared/sdk/decoder');

module.exports = [
	{
		name: 'decodeBlock',
		controller: async ({ encodedBlock }) => decodeBlock(encodedBlock),
		params: {
			encodedBlock: { optional: false, type: 'string' },
		},
	},
	{
		name: 'decodeTransaction',
		controller: async ({ encodedTransaction }) => decodeTransaction(encodedTransaction),
		params: {
			encodedTransaction: { optional: false, type: 'string' },
		},
	},
	{
		name: 'decodeEventPayload',
		controller: async ({ eventName, payload }) => decodeEventPayload(eventName, payload),
		params: {
			eventName: { optional: false, type: 'string' },
			payload: { optional: false, type: 'object' },
		},
	},
	{
		name: 'decodeResponse',
		controller: async ({ action, response }) => decodeResponse(action, response),
		params: {
			action: { optional: false, type: 'string' },
			response: { optional: false, type: 'string' },
		},
	},
];
