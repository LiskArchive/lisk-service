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
const multisigTransaction = require('./mappings/multisigTransaction');

module.exports = {
	type: 'moleculer',
	method: 'transaction.multisig.create',
	params: {
		nonce: '=,string',
		senderPublicKey: '=,string',
		moduleAssetId: '=,string',
		asset: '=,object',
		fee: '=,string',
		expires: '=,string',
		signatures: '=,array',
	},
	definition: {
		data: ['data', multisigTransaction],
		meta: {
			count: '=,number',
			offset: '=,number',
			total: '=,number',
		},
		links: {},
	},
};
