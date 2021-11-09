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
// TODO: Remove the following lint disable directive
/* eslint-disable no-unused-vars,max-len */
const POOL_LIMIT = 64; // move it to config
const REG_MULTISIG_GROUP_MA_ID = '4:0'; // can be retrieved from networkStatus
const TOKEN_TRANSFER = '2:0';
const MIN_ACCOUNT_BALANCE = 5000000; // Defined by the protocol - not implemented by the SDK yet

const { verifyData } = require('@liskhq/lisk-cryptography');

const {
	validateTransaction,
	computeMinFee,
} = require('@liskhq/lisk-transactions');

const { requestRpc } = require('./rpcBroker');

const mysqlIndex = require('./indexdb/mysql');
const multisignatureTxIndexSchema = require('./schema/multisigTransaction');

const getMsTxIndex = () => mysqlIndex('MultisignatureTx', multisignatureTxIndexSchema);

const getCurrentTimestamp = () => (new Date()).getTime();

const getAssetSchema = (moduleAssetId) => requestRpc('core.transactions.schemas', { moduleAssetId });

const hasMinimalBalance = (account, coreTrx) => {
	let transferAmount = 0;
	const moduleAssetId = `${coreTrx.moduleID}:${coreTrx.assetID}`;
	const assetSchema = getAssetSchema(moduleAssetId);
	const minimumFee = computeMinFee(
		assetSchema,
		coreTrx,
		{
			numberOfSignatures: 1, // TODO: Update with number of signatures
		});
	/* options are optional
		  options?: {
			minFeePerByte: number,
			baseFees: { moduleID: number, assetID: number, baseFee: number}[],
			numberOfSignatures: number,
		  }
	*/

	if (moduleAssetId === TOKEN_TRANSFER) {
		transferAmount = coreTrx.asset.amount;
	}
	if (account.token.balance >= minimumFee + transferAmount + MIN_ACCOUNT_BALANCE) return true;
	return false;
};

const isMultisigAccount = account => {
	if (account.isMultisignature === true) return true;
	return false;
};

const isWithinExpirationTime = transaction => {
	const currentTs = getCurrentTimestamp();
	if (currentTs < transaction.expires) return true;
	return false;
};

const isMultisigRegistration = transaction => {
	if (transaction.moduleAssetId === REG_MULTISIG_GROUP_MA_ID) return true;
	return false;
};

const isWithinPoolLimit = async account => {
	const multisignatureTxDB = await getMsTxIndex();
	const result = await multisignatureTxDB.count({ senderPublicKey: account.publicKey });
	if (result <= POOL_LIMIT) return true;
	return false;
};

const isValidServiceId = str => /^[a-fA-F0-9]{64}$/.test(str);

const hasValidServiceId = transaction => {
	if (transaction.serviceId && isValidServiceId(transaction.serviceId)) return true;
	return false;
};

const isValidCoreTransaction = async (coreTrx) => {
	const assetSchema = await getAssetSchema(`${coreTrx.moduleID}:${coreTrx.assetID}`);
	// validateTransaction(
	// 	// schema defined in custom asset to be signed
	// 	assetSchema: Schema,
	// 	// transaction object in JavaScript object format
	// 	transactionObject: Record<string, unknown>,
	//   ): LiskValidationError | Error | undefined;

	return validateTransaction(assetSchema, coreTrx);
};

const isValidSignature = (coreTransaction, s) => verifyData(
	coreTransaction, s.signature, s.publicKey);

const hasValidNonce = (transaction, account) => {
	if (transaction.nonce >= account.sequence.nonce) return true;
	return false;
};

module.exports = {
	// Account
	hasMinimalBalance,
	isMultisigAccount,

	// Transaction
	isWithinExpirationTime,
	isMultisigRegistration,
	isWithinPoolLimit,
	hasValidServiceId,
	isValidCoreTransaction,
	isValidSignature,
	hasValidNonce,
};
