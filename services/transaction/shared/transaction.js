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
const { v4: uuidv4 } = require('uuid');
const {
	Exceptions: { ServiceUnavailableException },
} = require('lisk-service-framework');

const mysqlIndex = require('./indexdb/mysql');
const multisignatureTxIndexSchema = require('./schema/multisignature');

const getMultiSignatureTxIndex = () => mysqlIndex('MultisignatureTx', multisignatureTxIndexSchema);

const createMultisignatureTx = async inputTransaction => {
	const multisignatureTxDB = await getMultiSignatureTxIndex();
	const transaction = {
		data: [],
		meta: {},
	};

	// TODO: Place holder for actual implementation
	// Return mock response for now
	inputTransaction = {
		nonce: 1,
		senderPublicKey: '3e50549cd4d98760064ff2fe51801afba4e5e8623335275cece0eeff8495a81b',
		asset: '{"numberOfSignatures":2,"mandatoryKeys":["228c865b903dab827342aa6611676bf883e982e7cd467c9168a7966cdabb391c","9bc945f92141d5e11e97274c275d127dc7656dda5c8fcbf1df7d44827a732664"],"optionalKeys":[]}',
		moduleAssetId: '4:0',
		fee: '314000',
		rejected: false,
	};

	transaction.data.push({ ...inputTransaction, serviceId: uuidv4() });
	transaction.meta.count = transaction.data.length;
	transaction.meta.total = await multisignatureTxDB.count();

	await multisignatureTxDB.upsert(transaction.data);
	if (!transaction.data.length) throw new ServiceUnavailableException('Service is not ready yet');

	return transaction;
};

module.exports = {
	createMultisignatureTx,
};
