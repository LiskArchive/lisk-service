/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const feeEstimatesSource = require('../../../sources/version2/fees');
const envelope = require('../../../sources/version2/mappings/stdEnvelope');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/fees',
	rpcMethod: 'get.fees',
	tags: ['Fee'],
	get schema() {
		const feeEstimatePerByteSchema = {};
		feeEstimatePerByteSchema[this.swaggerApiPath] = { get: {} };
		feeEstimatePerByteSchema[this.swaggerApiPath].get.tags = this.tags;
		feeEstimatePerByteSchema[this.swaggerApiPath].get.summary = 'Requests fee estimates';
		feeEstimatePerByteSchema[this.swaggerApiPath].get.description = 'Returns fee estimates';
		feeEstimatePerByteSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'fee estimate per byte',
				schema: {
					items: {
						$ref: '#/definitions/FeeEstimateEnvelope',
					},
				},
			},
			404: {
				$ref: '#/responses/notFound',
			},
		};
		return feeEstimatePerByteSchema;
	},
	source: feeEstimatesSource,
	envelope,
};
