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
	formatBlock,
	formatTransaction,
	decodeAPIClientEventPayload,
	decodeResponse,
	formatEvent,
} = require('../../shared/sdk/decoder');

const { parseToJSONCompatObj } = require('../../shared/utils/parser');

module.exports = [
	{
		name: 'formatBlock',
		params: {
			block: { optional: false, type: 'object' },
		},
		controller: ({ block }) => parseToJSONCompatObj(
			formatBlock(block),
		),
	},
	{
		name: 'formatTransaction',
		params: {
			transaction: { optional: false, type: 'object' },
		},
		controller: ({ transaction }) => parseToJSONCompatObj(
			formatTransaction(transaction),
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
		name: 'formatEvent',
		params: {
			event: { optional: false, type: 'object' },
		},
		controller: ({ event }) => formatEvent(event),
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
