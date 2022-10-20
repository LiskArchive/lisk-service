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
const blockAssetsSource = require('../../../sources/version3/blockAssets');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');
const regex = require('../../../shared/regex');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/blocks/assets',
	rpcMethod: 'get.blocks.assets',
	tags: ['Blocks'],
	params: {
		blockID: { optional: true, type: 'string', min: 1, max: 64, pattern: regex.HASH_SHA256 },
		height: { optional: true, type: 'string', min: 0, pattern: regex.HEIGHT_RANGE },
		timestamp: { optional: true, type: 'string', min: 1, pattern: regex.TIMESTAMP_RANGE },
		module: { optional: true, type: 'string', min: 1, pattern: regex.MODULE },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
		sort: {
			optional: true,
			type: 'string',
			enum: ['height:asc', 'height:desc', 'timestamp:asc', 'timestamp:desc'],
			default: 'height:desc',
		},
	},
	get schema() {
		const blockAssetSchema = {};
		blockAssetSchema[this.swaggerApiPath] = { get: {} };
		blockAssetSchema[this.swaggerApiPath].get.tags = this.tags;
		blockAssetSchema[this.swaggerApiPath].get.summary = 'Requests block assets data';
		blockAssetSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns block assets data',
		});
		blockAssetSchema[this.swaggerApiPath].get.parameters = transformParams('blocks', this.params);
		blockAssetSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of block assets',
				schema: {
					$ref: '#/definitions/BlocksAssetsWithEnvelope',
				},
			},
		};
		Object.assign(blockAssetSchema[this.swaggerApiPath].get.responses, response);
		return blockAssetSchema;
	},
	source: blockAssetsSource,
	envelope,
};
