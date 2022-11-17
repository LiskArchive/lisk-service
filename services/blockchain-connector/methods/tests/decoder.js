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
	decodeAPIClientEventPayload,
	decodeResponse,
	decodeEvent,
} = require('../../shared/sdk/decoder');

const { parseToJSONCompatObj } = require('../../shared/utils/parser');

module.exports = [
	{
		name: 'decodeBlock',
		params: {
			block: { optional: false, type: 'object' },
		},
		controller: ({ block }) => parseToJSONCompatObj(
			decodeBlock(block),
		),
	},
	{
		name: 'decodeTransaction',
		params: {
			transaction: { optional: false, type: 'object' },
		},
		controller: ({ transaction }) => parseToJSONCompatObj(
			decodeTransaction(transaction),
		),
	},
	{
		name: 'decodeAPIClientEventPayload',
		params: {
			eventName: { optional: false, type: 'string' },
			payload: { optional: false, type: 'object' },
		},
		controller: ({ eventName, payload }) => decodeAPIClientEventPayload(eventName, payload),
	},
	{
		name: 'decodeEvent',
		params: {
			event: { optional: false, type: 'object' },
		},
		controller: ({ event }) => decodeEvent(event),
	},
	{
		name: 'decodeResponse',
		params: {
			endpoint: { optional: false, type: 'string' },
			response: { optional: false, type: 'object' },
		},
		controller: ({ endpoint, response }) => decodeResponse(endpoint, response),
	},
];
