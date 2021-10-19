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
const patchMultisigTransactionsSource = require('../../../sources/version2/patchMultisigTransactionsSource');
const envelope = require('../../../sources/version2/mappings/stdEnvelope');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/transactions/multisig',
	httpMethod: 'PATCH',
	rpcMethod: 'patch.transactions.multisig',
	tags: ['Multisignature Transactions'],
	params: {
		serviceId: { optional: false, type: 'string' },
		signatures: { optional: false, type: 'array' },
	},
	get schema() {
		const multisigTransactionSchema = {};
		multisigTransactionSchema[this.swaggerApiPath] = { patch: {} };
		multisigTransactionSchema[this.swaggerApiPath].patch.tags = this.tags;
		multisigTransactionSchema[this.swaggerApiPath].patch.summary = 'Add a signature to an existing transaction in the multisignature pool';
		multisigTransactionSchema[this.swaggerApiPath].patch.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Adds a new signature to an existing multisignature transaction within the pool',
		});
		multisigTransactionSchema[this.swaggerApiPath].patch.parameters = transformParams('multisignature', { patchMultisigTransaction: '' });
		multisigTransactionSchema[this.swaggerApiPath].patch.responses = {
			200: {
				description: 'Updated multisignature transaction',
				schema: {
					$ref: '#/definitions/MultisigTransactionsWithEnvelope',
				},
			},
		};
		Object.assign(multisigTransactionSchema[this.swaggerApiPath].patch.responses, response);
		return multisigTransactionSchema;
	},
	source: patchMultisigTransactionsSource,
	envelope,
};
