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
const eventsSource = require('../../../sources/version3/events');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/events',
	rpcMethod: 'get.events',
	tags: ['Events'],
	params: {
		transactionID: { optional: true, type: 'string', min: 1, max: 64, pattern: regex.HASH_SHA256 },
		senderAddress: { optional: true, type: 'string', min: 3, max: 41, pattern: regex.ADDRESS_LISK32 },
		topic: { optional: true, type: 'string', min: 1, pattern: regex.TOPIC_CSV },
		blockID: { optional: true, type: 'string', min: 1, max: 64, pattern: regex.BLOCK_ID },
		height: { optional: true, type: 'string', min: 1, pattern: regex.HEIGHT_RANGE },
		timestamp: { optional: true, type: 'string', min: 1, pattern: regex.TIMESTAMP_RANGE },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
		sort: {
			optional: true,
			type: 'string',
			enum: [
				'height:asc',
				'height:desc',
				'timestamp:asc',
				'timestamp:desc',
			],
			default: 'timestamp:desc',
		},
		order: { optional: true, type: 'string', enum: ['index:asc', 'index:desc'], default: 'index:asc' },
	},
	get schema() {
		const eventsSchema = {};
		eventsSchema[this.swaggerApiPath] = { get: {} };
		eventsSchema[this.swaggerApiPath].get.tags = this.tags;
		eventsSchema[this.swaggerApiPath].get.summary = 'Requests events data';
		eventsSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns events data',
		});
		eventsSchema[this.swaggerApiPath].get.parameters = transformParams('events', this.params);
		eventsSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of events',
				schema: {
					$ref: '#/definitions/eventsWithEnvelope',
				},
			},
		};
		Object.assign(eventsSchema[this.swaggerApiPath].get.responses, response);
		return eventsSchema;
	},
	source: eventsSource,
	envelope,
};
