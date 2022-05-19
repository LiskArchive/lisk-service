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

const { parseToJSONCompatObj } = require('../../shared/parser');

module.exports = [
	{
		name: 'decodeBlockSerialized',
		params: {
			encodedBlock: { optional: false, type: 'string' },
		},
		controller: ({ encodedBlock }) => parseToJSONCompatObj(
			decodeBlock(encodedBlock),
		),
	},
	{
		name: 'decodeTransactionSerialized',
		params: {
			encodedTransaction: { optional: false, type: 'string' },
		},
		controller: ({ encodedTransaction }) => parseToJSONCompatObj(
			decodeTransaction(encodedTransaction),
		),
	},
	{
		name: 'decodeEventPayload',
		params: {
			eventName: { optional: false, type: 'string' },
			payload: { optional: false, type: 'object' },
		},
		controller: ({ eventName, payload }) => decodeEventPayload(eventName, payload),
	},
	{
		name: 'decodeResponse',
		params: {
			endpoint: { optional: false, type: 'string' },
			response: { optional: false, type: 'string' },
		},
		controller: ({ endpoint, response }) => decodeResponse(endpoint, response),
	},
];
