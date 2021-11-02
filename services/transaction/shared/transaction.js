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
const multisignatureTxIndexSchema = require('./schema/multisignature');
const signaturePoolSchema = require('./schema/signaturePool');

const getMultiSignatureTxIndex = () => mysqlIndex('MultisignatureTx', multisignatureTxIndexSchema);
const getMultisigSignaturePool = () => mysqlIndex('MultisigSignaturePool', signaturePoolSchema);

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
	const total = await multisignatureTxDB.count(params);

	if (resultSet.length) {
		transaction.data = await BluebirdPromise.map(
			resultSet,
			async transaction => {
				const signatures = await multisigSignaturePool.find({ serviceId: transaction.serviceId }, ['signature']);
				return {
					...transaction,
					asset: JSON.parse(transaction.asset),
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
			{ concurrency: signatures.length },
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

module.exports = {
	getMultisignatureTx,
	createMultisignatureTx,
	updateMultisignatureTx,
};
