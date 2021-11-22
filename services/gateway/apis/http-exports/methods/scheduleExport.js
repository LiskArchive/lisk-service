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
const exportSource = require('../../../sources/version2/scheduleExport');
const envelope = require('../../../sources/version2/mappings/stdEnvelope');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/transactions/export',
	rpcMethod: 'get.transactions.export',
	tags: ['Transaction Export'],
	params: {
		address: { optional: true, type: 'string', min: 3, max: 41, pattern: /^lsk[a-hjkm-z2-9]{38}$/ },
		publicKey: { optional: true, type: 'string', min: 64, max: 64, pattern: /^([A-Fa-f0-9]{2}){32}$/ },
		interval: { optional: true, type: 'string', min: 10, max: 21, pattern: /^\b((\d{4})-((1[012])|(0?[1-9]))-([012][1-9])|([123]0)|31)(:(\d{4})-((1[012])|(0?[1-9]))-([012][1-9])|([123]0)|31)?\b$/g },
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
		exportSchema[this.swaggerApiPath]
			.get.summary = 'Requests to schedule export of transaction history for a given account';
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
