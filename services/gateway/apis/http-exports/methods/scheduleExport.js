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
const scheduleExport = require('../../../sources/version3/scheduleExport');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/export/transactions',
	rpcMethod: 'get.export.transactions',
	tags: ['Transaction Export'],
	params: {
		address: { optional: true, type: 'string', min: 3, max: 41, pattern: regex.ADDRESS_LISK32 },
		publicKey: { optional: true, type: 'string', min: 64, max: 64, pattern: regex.PUBLIC_KEY },
		interval: { optional: true, type: 'string', min: 10, max: 21, pattern: regex.INTERVAL },
	},
	paramsRequired: true,
	validParamPairings: [
		['address'],
		['publicKey'],
		['address', 'interval'],
		['publicKey', 'interval'],
	],
	get schema() {
		const exportSchema = {};
		exportSchema[this.swaggerApiPath] = { get: {} };
		exportSchema[this.swaggerApiPath].get.tags = this.tags;
		exportSchema[this.swaggerApiPath].get.parameters = transformParams(
			'export',
			this.params,
		);
		exportSchema[this.swaggerApiPath].get.summary = 'Requests to schedule export of transaction history for a given account';
		exportSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns transaction history export scheduling information',
		});
		exportSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'CSV file to download',
				schema: {
					$ref: '#/definitions/ExportFileUrlWithEnvelope',
				},
			},
			202: {
				description: 'Schedule transaction history export',
				schema: {
					$ref: '#/definitions/ExportScheduledWithEnvelope',
				},
			},
		};
		Object.assign(exportSchema[this.swaggerApiPath].get.responses, response);
		return exportSchema;
	},
	source: scheduleExport,
	envelope,
};
