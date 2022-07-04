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
const exportSource = require('../../../sources/version3/export');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/export/download',
	params: {
		filename: { optional: false, type: 'string' },
	},
	tags: ['Transaction Export'],
	get schema() {
		const exportSchema = {};
		exportSchema[this.swaggerApiPath] = { get: {} };
		exportSchema[this.swaggerApiPath].get.tags = this.tags;
		exportSchema[this.swaggerApiPath].get.parameters = transformParams(
			'export',
			this.params,
		);
		exportSchema[this.swaggerApiPath].get.summary = 'Requests transaction history for a given account';
		exportSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns transaction history',
		});
		exportSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'CSV file',
			},
			404: {
				schema: {
					$ref: '#/responses/notFound',
				},
			},
		};
		Object.assign(exportSchema[this.swaggerApiPath].get.responses, response);
		return exportSchema;
	},
	source: exportSource,
	envelope,
};
