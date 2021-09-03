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
	Exceptions: { ServiceUnavailableException },
} = require('lisk-service-framework');

const mysqlIndex = require('./indexdb/mysql');
const MultisigTxIndexSchema = require('./schema/multisignature');

const getMultiSigTxIndex = () => mysqlIndex('MultisignatureTx', MultisigTxIndexSchema);

const createMultisigTransaction = async () => {
	const multisignatureTxDB = await getMultiSigTxIndex();

	// Replace when implementation for create multisignature is done
	const transaction = {
		data: [{
			serviceId: 'dc3e23b-f840-4a73-b793',
			nonce: '1',
			senderPublicKey: '3e50549cd4d98760064ff2fe51801afba4e5e8623335275cece0eeff8495a81b',
			asset: '{"numberOfSignatures":2,"mandatoryKeys":["228c865b903dab827342aa6611676bf883e982e7cd467c9168a7966cdabb391c","9bc945f92141d5e11e97274c275d127dc7656dda5c8fcbf1df7d44827a732664"],"optionalKeys":[]}',
			moduleAssetId: '4:0',
			fee: '314000',
			createdAt: 1629276090,
			modifiedAt: 1629276090,
			expiresAt: 1629276090,
			rejected: false,
		}],
		meta: {
			count: 1, Offset: 0, total: 1,
		},
	};

	await multisignatureTxDB.upsert(transaction.data);
	if (!transaction.data.length) throw new ServiceUnavailableException('Service is not ready yet');

	return transaction;
};

module.exports = {
	createMultisigTransaction,
};
