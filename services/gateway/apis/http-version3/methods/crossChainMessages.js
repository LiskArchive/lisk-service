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
const crossChainMessagesSource = require('../../../sources/version3/crossChainMessages');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/ccm',
	rpcMethod: 'get.ccm',
	tags: ['Interoperability'],
	params: {
		id: { optional: true, type: 'string', min: 1, max: 64, pattern: regex.HASH_SHA256 },
		transactionID: { optional: true, type: 'string', min: 1, max: 64, pattern: regex.HASH_SHA256 },
		moduleCrossChainCommandID: { optional: true, type: 'string', min: 1, max: 21 },
		moduleCrossChainCommandName: { optional: true, type: 'string', min: 1 },
		senderAddress: { optional: true, type: 'string', min: 3, max: 41, pattern: regex.ADDRESS_LISK32 },
		status: { optional: true, type: 'string', pattern: regex.CCM_STATUS },
		nonce: { optional: true, type: 'string', min: 1, pattern: regex.NONCE },
		timestamp: { optional: true, type: 'string', min: 1, pattern: regex.TIMESTAMP_RANGE },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
		sort: {
			optional: true,
			type: 'string',
			enum: ['timestamp:asc', 'timestamp:desc'],
			default: 'timestamp:desc',
		},
	},
	get schema() {
		const crossChainMessagesSchema = {};
		crossChainMessagesSchema[this.swaggerApiPath] = { get: {} };
		crossChainMessagesSchema[this.swaggerApiPath].get.tags = this.tags;
		crossChainMessagesSchema[this.swaggerApiPath].get.summary = 'Requests CCM data';
		crossChainMessagesSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns CCMs',
		});
		crossChainMessagesSchema[this.swaggerApiPath].get.parameters = transformParams('interoperability', this.params);
		crossChainMessagesSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of CCMs',
				schema: {
					$ref: '#/definitions/crossChainMessagesWithEnvelope',
				},
			},
		};
		Object.assign(crossChainMessagesSchema[this.swaggerApiPath].get.responses, response);
		return crossChainMessagesSchema;
	},
	source: crossChainMessagesSource,
	envelope,
};
