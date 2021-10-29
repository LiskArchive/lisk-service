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
const {
	createMultisignatureTx,
	getMultisignatureTx,
} = require('./controllers/transaction');

module.exports = [
	{
		name: 'multisig.create',
		controller: createMultisignatureTx,
		params: {
			nonce: { optional: true, type: 'any' },
			senderPublicKey: { optional: false, type: 'any' },
			moduleAssetId: { optional: false, type: 'any' },
			asset: { optional: false, type: 'any' },
			fee: { optional: false, type: 'any' },
			expires: { optional: true, type: 'any' },
			signatures: { optional: false, type: 'any' },
		},
	},
	{
		name: 'multisig',
		controller: getMultisignatureTx,
		params: {
			serviceId: { optional: true, type: 'any' },
			address: { optional: true, type: 'any' },
			publicKey: { optional: true, type: 'any' },
			limit: { optional: true, type: 'any' },
			offset: { optional: true, type: 'any' },
		},
	},
];
