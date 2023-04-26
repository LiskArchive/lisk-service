/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
const indexStatusSource = require('../../../sources/version3/indexStatus');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const { getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/index/status',
	rpcMethod: 'get.index.status',
	tags: ['Index Status'],
	get schema() {
		const indexStatusSchema = {};
		indexStatusSchema[this.swaggerApiPath] = { get: {} };
		indexStatusSchema[this.swaggerApiPath].get.tags = this.tags;
		indexStatusSchema[this.swaggerApiPath].get.summary = 'Requests current indexing status.';
		indexStatusSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns current indexing status.',
		});
		indexStatusSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns the current index status information.',
				schema: {
					$ref: '#/definitions/IndexStatus',
				},
			},
		};
		return indexStatusSchema;
	},
	source: indexStatusSource,
	envelope,
};
