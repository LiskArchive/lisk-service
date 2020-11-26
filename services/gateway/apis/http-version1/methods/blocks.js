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
const blocksSource = require('../../../sources/blocks');
const envelope = require('../../../sources/mappings/stdEnvelope');
const { transformParams, response } = require('../swagger/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/blocks',
	rpcMethod: 'get.blocks',
	tags: ['Blocks'],
	params: {
		id: { optional: true, type: 'string', min: 1, max: 24 },
		height: { optional: true, type: 'number', min: 1 },
		from: { optional: true, type: 'number' },
		to: { optional: true, type: 'number' },
		address: { optional: true, type: 'string', min: 2 },
		username: { optional: true, type: 'string', min: 1 },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
		sort: {
			optional: true,
			type: 'string',
			enum: [
				'height:asc', 'height:desc',
				'totalAmount:asc', 'totalAmount:desc',
				'totalFee:asc', 'totalFee:desc',
				'timestamp:asc', 'timestamp:desc',
			],
			default: 'height:desc',
		},
	},
	get schema() {
		const blockSchema = {};
		blockSchema[this.swaggerApiPath] = { get: {} };
		blockSchema[this.swaggerApiPath].get.tags = this.tags;
		blockSchema[this.swaggerApiPath].get.parameters = transformParams('blocks', this.params);
		blockSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'array of blocks',
				schema: {
					type: 'array',
					items: {
						$ref: '#/definitions/BlocksWithEnvelope',
					},
				},
			},
		};
		Object.assign(blockSchema[this.swaggerApiPath].get.responses, response);
		return blockSchema;
	},
	source: blocksSource,
	envelope,
};
