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
const postMultisigTransactionsSource = require('../../../sources/version2/postMultisigTransactionsSource');
const envelope = require('../../../sources/version2/mappings/stdEnvelope');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/transactions/multisig',
	rpcMethod: 'post.transactions.multisig',
	tags: ['Multisignature Transactions'],
	params: {
		transaction: { optional: true, type: 'string' },
	},
	get schema() {
		const multisigTransactionSchema = {};
		multisigTransactionSchema[this.swaggerApiPath] = { post: {} };
		multisigTransactionSchema[this.swaggerApiPath].post.tags = this.tags;
		multisigTransactionSchema[this.swaggerApiPath].post.summary = 'Requests multisignature transactions';
		multisigTransactionSchema[this.swaggerApiPath].post.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns multisignature transactions',
		});
		multisigTransactionSchema[this.swaggerApiPath].post.parameters = transformParams('multisignature', this.params);
		multisigTransactionSchema[this.swaggerApiPath].post.responses = {
			200: {
				description: 'Updated multisignature transaction',
				schema: {
					$ref: '#/definitions/MultisigTransactionsWithEnvelope',
				},
			},
		};
		Object.assign(multisigTransactionSchema[this.swaggerApiPath].post.responses, response);
		return multisigTransactionSchema;
	},
	source: postMultisigTransactionsSource,
	envelope,
};
