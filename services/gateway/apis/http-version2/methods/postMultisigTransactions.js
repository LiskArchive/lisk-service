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

module.exports = {
	version: '2.0',
	swaggerApiPath: '/transactions/multisig',
	rpcMethod: 'post.transactions.multisig',
	tags: ['Multisignature Transactions'],
	params: {
		transaction: { optional: true, type: 'string' },
	},
	source: postMultisigTransactionsSource,
	envelope,
};
