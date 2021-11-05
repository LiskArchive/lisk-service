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

const { getBase32AddressFromPublicKey } = require('./accountUtils');

const mysqlIndex = require('./indexdb/mysql');
const multisignatureTxIndexSchema = require('./schema/multisignature');

const getMultiSignatureTxIndex = () => mysqlIndex('MultisignatureTx', multisignatureTxIndexSchema);

const getMultisignatureTx = async params => {
	const multisignatureTxDB = await getMultiSignatureTxIndex();
	const transaction = {
		data: [],
		meta: {},
	};

	if (params.publicKey) {
		const { publicKey, ...remParams } = params;
		params = remParams;
		params.senderPublicKey = publicKey;
	}

	const resultSet = await multisignatureTxDB.find(params);
	if (!resultSet.length) throw new Error('Transaction does not exists in the database');
	const total = await multisignatureTxDB.count(params);

	// TODO: Add signature to response once issue #161 is done
	if (resultSet.length) transaction.data = resultSet
		.map(acc => ({ ...acc, asset: JSON.parse(acc.asset) }));


	transaction.meta = {
		offset: params.offset || 0,
		count: transaction.data.length,
		total,
	};

	return transaction;
};

const createMultisignatureTx = async inputTransaction => {
	const multisignatureTxDB = await getMultiSignatureTxIndex();
	const transaction = {
		data: [],
		meta: {},
	};

	// Assign the transaction a serviceId
	inputTransaction.serviceId = uuidv4();

	// Stringify the transaction asset object
	inputTransaction.asset = JSON.stringify(inputTransaction.asset);
	inputTransaction.senderAddress = getBase32AddressFromPublicKey(inputTransaction.senderPublicKey);

	try {
		// Persist the transaction into the database
		await multisignatureTxDB.upsert(inputTransaction);
	} catch (err) {
		// TODO: Send appropriate named exception
		throw new Error(`Unable to create the transaction: ${err.message}`);
	}

	// Fetch the transaction from the pool and return as a response
	const response = await getMultisignatureTx({ serviceId: inputTransaction.serviceId });
	if (response.data) transaction.data = response.data;
	if (response.meta) transaction.meta = response.meta;

	return transaction;
};

module.exports = {
	getMultisignatureTx,
	createMultisignatureTx,
};
