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
const POOL_LIMIT = 64;
const REG_MULTISIG_GROUP_MA_ID = '4:0';
const TOKEN_TRANSFER = '2:0';

const {
	Microservice,
	Logger,
} = require('lisk-service-framework');

const { verifyData } = require('@liskhq/lisk-cryptography');

const {
	validateTransaction,
	computeMinFee,
} = require('@liskhq/lisk-transactions');

const logger = Logger();

const mysqlIndex = require('./indexdb/mysql');
const multisignatureTxIndexSchema = require('./schema/multisignature');

const getMsTxIndex = () => mysqlIndex('MultisignatureTx', multisignatureTxIndexSchema);

const getCurrentTimestamp = (new Date()).getTime();

// TODO: Write logic for testing against SHA256
const isSHA256 = (input) => true;
const verifySHA256 = (input, hash) => true;

const requestRpc = (method, params) => new Promise((resolve, reject) => {
	Microservice.broker.call(method, params).then(res => resolve(res))
		.catch(err => {
			logger.error(`Error occurred! ${err.message}`);
			reject(err);
		});
});

const getAssetSchema = (moduleAssetId) => requestRpc('core.transactions.schemas', { moduleAssetId });

const hasMinimalBalance = (account, transaction, coreTransaction) => {
	let transferAmount = 0;
	const assetSchema = getAssetSchema(transaction.moduleAssetId);
	const minimumFee = computeMinFee(assetSchema, coreTransaction); // options
	/* options are optional
		  options?: {
			minFeePerByte: number,
			baseFees: { moduleID: number, assetID: number, baseFee: number}[],
			numberOfSignatures: number,
		  }
	*/

	if (transaction.moduleAssetId === TOKEN_TRANSFER) {
		transferAmount = transaction.asset.amount;
	}
	if (account.token.balance >= minimumFee + transferAmount) return true;
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

const hasValidServiceId = transaction => {
	if (transaction.serviceId && isSHA256(transaction.serviceId)) return true;
	return false;
};

const getLiskTransaction = () => {

};

const isValidCoreTransaction = async (transaction, coreTransaction) => {
	const assetSchema = await getAssetSchema(transaction.moduleAssetId);
	// validateTransaction(
	// 	// schema defined in custom asset to be signed
	// 	assetSchema: Schema,
	// 	// transaction object in JavaScript object format
	// 	transactionObject: Record<string, unknown>,
	//   ): LiskValidationError | Error | undefined;

	return validateTransaction(assetSchema, coreTransaction);
};

const hasValidSignatures = transaction => {
	if (transaction.signatures.every(
		o => verifyData(getLiskTransaction(transaction), o.signature, o.publicKey))) {
		return true;
	}
	return false;
};

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
	hasValidSignatures,
	hasValidNonce,
};
