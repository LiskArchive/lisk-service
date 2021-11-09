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
const { hash } = require('@liskhq/lisk-cryptography');
const { getBytes } = require('@liskhq/lisk-transactions');

const { getHexAddressFromBase32 } = require('./accountUtils');
const {
	getAssetSchema,
	hasMinimalBalance,
	isMultisigAccount,
	isWithinExpirationTime,
	isMultisigRegistration,
	isWithinPoolLimit,
	isValidCoreTransaction,
	isValidSignature,
	hasValidNonce,
} = require('./validators');

const { requestRpc } = require('./rpcBroker');

const MODULE_ASSET_ID = {
	TOKEN_TRANSFER: '2:0',
	KEYS_REGISTER_MULTISIGNATURE_GROUP: '4:0',
	DPOS_REGISTER_DELEGATE: '5:0',
	DPOS_VOTE_DELEGATE: '5:1',
	DPOS_UNLOCK_TOKEN: '5:2',
	DPOS_REPORT_DELEGATE_MISBEHAVIOUR: '5:3',
	LEGACY_ACCOUNT_RECLAIM_LSK: '1000:0',
};

const computeServiceId = (transaction) => {
	const {
		nonce, senderPublicKey, moduleAssetId, fee, asset,
	} = transaction;

	const serviceId = hash(Buffer.from([nonce, senderPublicKey, moduleAssetId, fee, JSON.stringify(asset)]), 'hex');
	return serviceId.toString('hex');
};

const makeAssetCoreCompliant = (moduleAssetId, asset) => {
	if (moduleAssetId === MODULE_ASSET_ID.TOKEN_TRANSFER) {
		asset.recipientAddress = getHexAddressFromBase32(asset.recipientAddress);
	}

	if (moduleAssetId === MODULE_ASSET_ID.KEYS_REGISTER_MULTISIGNATURE_GROUP) {
		asset.mandatoryKeys = asset.mandatoryKeys.map(k => Buffer.from(k, 'hex'));
		asset.optionalKeys = asset.optionalKeys.map(k => Buffer.from(k, 'hex'));
	}

	if (moduleAssetId === MODULE_ASSET_ID.DPOS_VOTE_DELEGATE) {
		asset.votes = asset.votes.map(a => Buffer.from(a, 'hex'));
	}

	if (moduleAssetId === MODULE_ASSET_ID.DPOS_UNLOCK_TOKEN) {
		asset.unlockObjects = asset.unlockObjects
			.map(u => ({ ...u, delegateAddress: getHexAddressFromBase32(u.delegateAddress) }));
	}

	return asset;
};

const convertToCoreTransaction = (transaction) => {
	const {
		moduleAssetId,
		nonce,
		fee,
		senderPublicKey,
		asset,
		signatures,
	} = transaction;

	const [moduleID, assetID] = moduleAssetId.split(':');
	const coreTransaction = {
		moduleID,
		assetID,
		nonce,
		fee,
		senderPublicKey: Buffer.from(senderPublicKey, 'hex'),
		asset: makeAssetCoreCompliant(moduleAssetId, asset),
		signatures: signatures.map(s => Buffer.from(s, 'hex')),
	};

	return coreTransaction;
};

const validateNewTransaction = async (transaction) => {
	const errors = [];
	const { data: [account] } = await requestRpc('core.accounts', { publicKey: transaction.senderPublicKey });
	const coreTransaction = convertToCoreTransaction(transaction);

	if (!isValidCoreTransaction(transaction)) {
		errors.push('Invalid transaction');
	}

	if (transaction.signatures.some(s => !isValidSignature(coreTransaction, s))) {
		errors.push('Invalid signature');
	}

	if (!isWithinExpirationTime(transaction)) {
		errors.push('Transaction expired');
	}

	if (!isMultisigRegistration(transaction) && !isMultisigAccount(account)) {
		errors.push('Not a multisignature transaction');
		errors.push('Sender account not registered as a multisig account');
	}

	if (!hasValidNonce(transaction, account)) {
		errors.push('Invalid nonce');
	}

	if (!isWithinPoolLimit(account)) {
		errors.push('Pool limit exceeded');
	}

	if (!hasMinimalBalance(account, transaction, coreTransaction)) {
		errors.push('INsufficient balance');
	}

	return errors;
};

const validateUpdateTransaction = async (transaction) => {
	const errors = [];
	const { data: [account] } = await requestRpc('core.accounts', { publicKey: transaction.senderPublicKey });
	const coreTransaction = convertToCoreTransaction(transaction);

	if (transaction.signatures.some(s => !isValidSignature(coreTransaction, s))) {
		errors.push('Invalid signature');
	}

	if (!isWithinExpirationTime(transaction)) {
		errors.push('Transaction expired');
	}

	if (!hasValidNonce(transaction, account)) {
		errors.push('Invalid nonce');
	}

	if (!isWithinPoolLimit(account)) {
		errors.push('Pool limit exceeded');
	}

	return errors;
};

const validateRejectTransaction = async (transaction) => {
	const errors = [];
	const { data: [account] } = await requestRpc('core.accounts', { publicKey: transaction.senderPublicKey });
	const coreTransaction = convertToCoreTransaction(transaction);

	if (transaction.signatures.some(s => !isValidSignature(coreTransaction, s))) {
		errors.push('Invalid signature');
	}

	if (!isWithinExpirationTime(transaction)) {
		errors.push('Transaction expired');
	}

	if (!hasValidNonce(transaction, account)) {
		errors.push('Invalid nonce');
	}

	if (!isWithinPoolLimit(account)) {
		errors.push('Pool limit exceeded');
	}

	return errors;
};

const broadcastTransaction = async (transaction) => {
	const { data: [{ schema: txAssetSchema }] } = await getAssetSchema(transaction.moduleAssetId);
	const txBytes = getBytes(txAssetSchema, convertToCoreTransaction(transaction));
	return requestRpc('core.transactions.post', { transaction: txBytes.toString('hex') });
};

module.exports = {
	computeServiceId,
	convertToCoreTransaction,
	validateNewTransaction,
	validateUpdateTransaction,
	validateRejectTransaction,
	broadcastTransaction,
};
