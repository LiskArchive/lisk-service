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
const deleteMultisigTransactionsSource = require('../../../sources/version2/deleteMultisigTransactionsSource');
const envelope = require('../../../sources/version2/mappings/stdEnvelope');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/transactions/multisig',
	httpMethod: 'DELETE',
	rpcMethod: 'delete.transactions.multisig',
	tags: ['Multisignature Transactions'],
	params: {
		serviceId: { optional: true, type: 'string', min: 1, max: 64 },
		signatures: { optional: false, type: 'array' },
	},
	get schema() {
		const multisigTransactionSchema = {};
		multisigTransactionSchema[this.swaggerApiPath] = { post: {} };
		multisigTransactionSchema[this.swaggerApiPath].post.tags = this.tags;
		multisigTransactionSchema[this.swaggerApiPath].post.summary = 'Delete a transaction in the multisignature pool';
		multisigTransactionSchema[this.swaggerApiPath].post.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Delete a transaction in the multisignature pool and returns the transaction',
		});
		multisigTransactionSchema[this.swaggerApiPath].post.parameters = transformParams('multisignature', { multisigTransaction: '' });
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
	source: deleteMultisigTransactionsSource,
	envelope,
};
