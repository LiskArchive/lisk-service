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
const blocksSource = require('../../../sources/version3/blocks');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');
const regex = require('../../../shared/regex');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/blocks',
	rpcMethod: 'get.blocks',
	tags: ['Blocks'],
	params: {
		blockID: { optional: true, type: 'string', min: 1, max: 64, pattern: regex.BLOCK_ID },
		height: { optional: true, type: 'string', min: 0, pattern: regex.HEIGHT_RANGE },
		timestamp: { optional: true, type: 'string', min: 1, pattern: regex.TIMESTAMP_RANGE },
		generatorAddress: { optional: true, type: 'string', min: 38, max: 41, pattern: regex.ADDRESS_LISK32 },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10, pattern: regex.LIMIT },
		offset: { optional: true, type: 'number', min: 0, default: 0, pattern: regex.OFFSET },
		sort: {
			optional: true,
			type: 'string',
			enum: ['height:asc', 'height:desc', 'timestamp:asc', 'timestamp:desc'],
			default: 'height:desc',
		},
	},
	get schema() {
		const blockSchema = {};
		blockSchema[this.swaggerApiPath] = { get: {} };
		blockSchema[this.swaggerApiPath].get.tags = this.tags;
		blockSchema[this.swaggerApiPath].get.summary = 'Requests blocks data';
		blockSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns block data',
		});
		blockSchema[this.swaggerApiPath].get.parameters = transformParams('blocks', this.params);
		blockSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of blocks',
				schema: {
					$ref: '#/definitions/BlocksWithEnvelope',
				},
			},
		};
		Object.assign(blockSchema[this.swaggerApiPath].get.responses, response);
		return blockSchema;
	},
	source: blocksSource,
	envelope,
};
