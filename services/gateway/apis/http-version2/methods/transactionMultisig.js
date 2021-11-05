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
const multisigTransactionsSource = require('../../../sources/version2/multisigTransactionsSource');
const envelope = require('../../../sources/version2/mappings/stdEnvelope');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/transactions/multisig',
	rpcMethod: 'get.transactions.multisig',
	tags: ['Multisignature Transactions'],
	params: {
		serviceId: { optional: true, type: 'string', min: 1, max: 64 },
		address: { optional: true, type: 'string', min: 38, max: 41, pattern: /^lsk[a-hjkm-z2-9]{38}$/ },
		publicKey: { optional: true, type: 'string', min: 64, max: 64, pattern: /^([A-Fa-f0-9]{2}){32}$/ },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10, pattern: /^\b((?:[1-9][0-9]?)|100)\b$/ },
		offset: { optional: true, type: 'number', min: 0, default: 0, pattern: /^\b([0-9][0-9]*)\b$/ },
	},
	paramsRequired: true,
	validParamPairings: [
		['serviceId'],
		['address'],
		['publicKey'],
	],
	get schema() {
		const multisigTransactionSchema = {};
		multisigTransactionSchema[this.swaggerApiPath] = { get: {} };
		multisigTransactionSchema[this.swaggerApiPath].get.tags = this.tags;
		multisigTransactionSchema[this.swaggerApiPath].get.summary = 'Requests multisignature transactions';
		multisigTransactionSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns multisignature transactions',
		});
		multisigTransactionSchema[this.swaggerApiPath].get.parameters = transformParams('multisignature', this.params);
		multisigTransactionSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'array of multisignature transactions with details',
				schema: {
					$ref: '#/definitions/MultisigTransactionsWithEnvelope',
				},
			},
		};
		Object.assign(multisigTransactionSchema[this.swaggerApiPath].get.responses, response);
		return multisigTransactionSchema;
	},
	source: multisigTransactionsSource,
	envelope,
};
