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
	getAddressFromPublicKey,
	getBase32AddressFromAddress,
} = require('@liskhq/lisk-cryptography');

const {
	Exceptions: { ServiceUnavailableException },
} = require('lisk-service-framework');

const mysqlIndex = require('./indexdb/mysql');
const multisignatureTxIndexSchema = require('./schema/multisignature');

const getMultiSignatureTxIndex = () => mysqlIndex('MultisignatureTx', multisignatureTxIndexSchema);

const getHexAddressFromPublicKey = publicKey => {
	const binaryAddress = getAddressFromPublicKey(Buffer.from(publicKey, 'hex'));
	return binaryAddress.toString('hex');
};

const getBase32AddressFromHex = address => {
	const base32Address = getBase32AddressFromAddress(Buffer.from(address, 'hex'));
	return base32Address;
};

const getBase32AddressFromPublicKey = publicKey => {
	const hexAddress = getHexAddressFromPublicKey(publicKey);
	const base32Address = getBase32AddressFromHex(hexAddress);
	return base32Address;
};

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
		senderPublicKey: '6f733511ab060f07d9a76a55820b68876f1ea8532d91cf146b58b2c0b9115e89',
		asset: '{"numberOfSignatures":2,"mandatoryKeys":["228c865b903dab827342aa6611676bf883e982e7cd467c9168a7966cdabb391c","9bc945f92141d5e11e97274c275d127dc7656dda5c8fcbf1df7d44827a732664"],"optionalKeys":[]}',
		moduleAssetId: '4:0',
		fee: '314000',
		rejected: false,
	};
	
	transaction.data.push({
		...inputTransaction,
		serviceId: uuidv4(),
		address: getBase32AddressFromPublicKey(inputTransaction.senderPublicKey),
	});

	transaction.meta.count = transaction.data.length;
	transaction.meta.total = await multisignatureTxDB.count();

	await multisignatureTxDB.upsert(transaction.data);
	if (!transaction.data.length) throw new ServiceUnavailableException('Service is not ready yet');

	return transaction;
};

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

	// Temporary logic for test case, remove after finishing real implementation
	await multisignatureTxDB.upsert({
		serviceId: uuidv4(),
		nonce: 1,
		address: 'lsk2dp8gf6me3hafoqgtqej8dk96uusdhykvnkbrr',
		senderPublicKey: '6f733511ab060f07d9a76a55820b68876f1ea8532d91cf146b58b2c0b9115e89',
		asset: '{"numberOfSignatures":2,"mandatoryKeys":["228c865b903dab827342aa6611676bf883e982e7cd467c9168a7966cdabb391c","9bc945f92141d5e11e97274c275d127dc7656dda5c8fcbf1df7d44827a732664"],"optionalKeys":[]}',
		moduleAssetId: '4:0',
		fee: '314000',
		rejected: false,
		expiresAt: 1665690343,
	});

	const resultSet = await multisignatureTxDB.find(params);
	const total = await multisignatureTxDB.count(params);

	if (resultSet.length) transaction.data = resultSet
		.map(acc => ({ ...acc, asset: JSON.parse(acc.asset) }));


	transaction.meta = {
		offset: params.offset || 0,
		count: transaction.data.length,
		total,
	};

	return transaction;
};

module.exports = {
	createMultisignatureTx,
	getMultisignatureTx,
};
