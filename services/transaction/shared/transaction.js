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
const BluebirdPromise = require('bluebird');

const { v4: uuidv4 } = require('uuid');

const {
	Exceptions: { NotFoundException },
} = require('lisk-service-framework');

const { getBase32AddressFromPublicKey } = require('./accountUtils');

const mysqlIndex = require('./indexdb/mysql');
const multisignatureTxIndexSchema = require('./schema/multisigTransaction');
const multisigSignaturePoolSchema = require('./schema/multisigSignaturePool');

const getMultiSignatureTxIndex = () => mysqlIndex('MultisigTransaction', multisignatureTxIndexSchema);
const getMultisigSignaturePool = () => mysqlIndex('MultisigSignaturePool', multisigSignaturePoolSchema);

const getMultisignatureTx = async params => {
	const multisignatureTxDB = await getMultiSignatureTxIndex();
	const multisigSignaturePool = await getMultisigSignaturePool();
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

	if (resultSet.length) {
		transaction.data = await BluebirdPromise.map(
			resultSet,
			async txn => {
				const signatures = await multisigSignaturePool.find({ serviceId: txn.serviceId }, ['signature']);
				return {
					...txn,
					asset: JSON.parse(txn.asset),
					signatures: signatures.map(entry => JSON.parse(entry.signature)),
				};
			},
			{ concurrency: resultSet.length },
		);
	}

	transaction.meta = {
		offset: params.offset || 0,
		count: transaction.data.length,
		total,
	};

	return transaction;
};

const createMultisignatureTx = async inputTransaction => {
	const multisignatureTxDB = await getMultiSignatureTxIndex();
	const multisigSignaturePool = await getMultisigSignaturePool();
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
		// Persist the signatures and the transaction into the database
		// TODO: Add transactional support and validations
		await BluebirdPromise.map(
			inputTransaction.signatures,
			async signature => multisigSignaturePool.upsert({
				serviceId: inputTransaction.serviceId,
				signature: JSON.stringify(signature),
			}),
			{ concurrency: inputTransaction.signatures.length },
		);
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

const updateMultisignatureTx = async transactionPatch => {
	const multisignatureTxDB = await getMultiSignatureTxIndex();
	const multisigSignaturePool = await getMultisigSignaturePool();
	const transaction = {
		data: [],
		meta: {},
	};
	const { serviceId, signatures } = transactionPatch;

	// Find the transaction from the pool
	const [pooledTransaction] = await multisignatureTxDB.find({ serviceId });
	if (!pooledTransaction) throw new NotFoundException(`Transaction with serviceId: ${serviceId} does not exist in the pool`);

	try {
		// Validate and add the signatures into the pool
		// TODO: Add transactional support and validations
		await BluebirdPromise.map(
			signatures,
			async signature => multisigSignaturePool.upsert({
				serviceId: transactionPatch.serviceId,
				signature: JSON.stringify(signature),
			}),
			{ concurrency: 1 },
		);
	} catch (err) {
		// TODO: Send appropriate named exception
		throw new Error(`Unable to create the transaction: ${err.message}`);
	}

	const response = await getMultisignatureTx({ serviceId });
	if (response.data) transaction.data = response.data;
	if (response.meta) transaction.meta = response.meta;

	return transaction;
};

const rejectMultisignatureTx = async params => {
	const multisignatureTxDB = await getMultiSignatureTxIndex();
	const transaction = {
		data: [],
		meta: {},
	};

	// TODO: Add validations
	const [response] = await multisignatureTxDB.find({ serviceId: params.serviceId });
	const total = await multisignatureTxDB.count({ serviceId: params.serviceId });

	// Update the multisignature transaction with rejected flag as true
	const rejectTransaction = { ...response, rejected: true };
	await multisignatureTxDB.upsert(rejectTransaction);

	if (response) transaction.data = [rejectTransaction]
		.map(acc => ({ ...acc, asset: JSON.parse(acc.asset) }));

	transaction.meta = {
		offset: params.offset || 0,
		count: transaction.data.length,
		total,
	};

	return transaction;
};

module.exports = {
	getMultisignatureTx,
	createMultisignatureTx,
	updateMultisignatureTx,
	rejectMultisignatureTx,
};
