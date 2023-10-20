/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
const { TRANSACTION_OBJECT_VALID } = require('./transactionsDryRun');

const ESTIMATE_FEES_BASE_TRANSACTION = {
	module: 'module',
	command: 'command',
	nonce: '1',
	senderPublicKey: TRANSACTION_OBJECT_VALID.senderPublicKey,
	params: {},
};

const TOKEN_TRANSFER_TRANSACTION_OBJECT = {
	...ESTIMATE_FEES_BASE_TRANSACTION,
	module: 'token',
	command: 'transfer',
	params: {
		amount: '1000000000000',
		recipientAddress: 'lskv6v53emsaen6cwbbk226wusdpa6ojdonunka4x',
		data: '',
		tokenID: '0400000000000000',
	},
};

const AUTH_REGISTER_MULTI_SIGNATURE_TRANSACTION_OBJECT = {
	...ESTIMATE_FEES_BASE_TRANSACTION,
	module: 'auth',
	command: 'registerMultisignature',
	params: {
		numberOfSignatures: 1,
		mandatoryKeys: [],
		optionalKeys: [],
		signatures: [
			'cd3e42528d47d63c643832297162e0786cfeabdf92b3adb8d33fdc40a65b1f367a93355b2a25c0abd74b26bba46c0fb47184fac2f49cd172c286836dd707af03',
		],
	},
};

const POS_REGISTER_VALIDATOR_TRANSACTION_OBJECT = {
	...ESTIMATE_FEES_BASE_TRANSACTION,
	module: 'pos',
	command: 'registerValidator',
	params: {
		name: 'test_validator',
		blsKey:
			'8aeba1cc038ad2cf1ba6ae1479f293f1e3c074369c3afe623e6921ac4cd6c959647ca85fe197228c38dda1df18812d32',
		proofOfPossession:
			'abb6c31f5885022765301fbfcc6c34686ef9a9b0eec34cb487433558071ab57fd28852752f81dda00447e69d61f63f48174c10a0a0a2d34d230b9a75d903a0befdef82708e5f869ff75090c1b5ce85565e8a17e5e06c4cae305c5efb1f37d996',
		generatorKey: '59274923432b74133be4def9c9f8e544bf032184a2153b0ca34b1dd5669f5fdf',
	},
};

const POS_UNLOCK_TRANSACTION_OBJECT = {
	...ESTIMATE_FEES_BASE_TRANSACTION,
	module: 'pos',
	command: 'unlock',
	params: {},
};

const POS_REPORT_MISBEHAVIOR_TRANSACTION_OBJECT = {
	...ESTIMATE_FEES_BASE_TRANSACTION,
	module: 'pos',
	command: 'reportMisbehavior',
	params: {
		header1: '5dfaeae5cb8e8165ddabeef9acfe055d8422bd14f3992297b615b225ce7b02ed',
		header2: '588ca03cb3fa2b26893a7bde9d2401ca04d937755fe005a5802b4a719789a585',
	},
};

const POS_UPDATE_GENERATOR_KEY_TRANSACTION_OBJECT = {
	...ESTIMATE_FEES_BASE_TRANSACTION,
	module: 'pos',
	command: 'updateGeneratorKey',
	params: {
		generatorKey: '59274923432b74133be4def9c9f8e544bf032184a2153b0ca34b1dd5669f5fdf',
	},
};

const POS_STAKE_TRANSACTION_OBJECT = {
	...ESTIMATE_FEES_BASE_TRANSACTION,
	module: 'pos',
	command: 'stake',
	params: {
		stakes: [
			{
				validatorAddress: 'lskguo9kqnea2zsfo3a6qppozsxsg92nuuma3p7ad',
				amount: '1000000000000',
			},
			{
				validatorAddress: 'lskx7rscmxc3k9yokbqpxspjj92zz6fue84e2xw92',
				amount: '2000000000000',
			},
		],
	},
};

const POS_CHANGE_COMMISSION_TRANSACTION_OBJECT = {
	...ESTIMATE_FEES_BASE_TRANSACTION,
	module: 'pos',
	command: 'changeCommission',
	params: {
		newCommission: '10000',
	},
};

const POS_CLAIM_REWARDS_TRANSACTION_OBJECT = {
	...ESTIMATE_FEES_BASE_TRANSACTION,
	module: 'pos',
	command: 'claimRewards',
	params: {},
};

const LEGACY_RECLAIM_LSK = {
	...ESTIMATE_FEES_BASE_TRANSACTION,
	module: 'legacy',
	command: 'reclaimLSK',
	params: {
		amount: '1000000000000',
	},
};

const LEGACY_REGISTER_KEYS_TRANSACTION_OBJECT = {
	...ESTIMATE_FEES_BASE_TRANSACTION,
	module: 'legacy',
	command: 'registerKeys',
	params: {
		blsKey:
			'8aeba1cc038ad2cf1ba6ae1479f293f1e3c074369c3afe623e6921ac4cd6c959647ca85fe197228c38dda1df18812d32',
		proofOfPossession:
			'abb6c31f5885022765301fbfcc6c34686ef9a9b0eec34cb487433558071ab57fd28852752f81dda00447e69d61f63f48174c10a0a0a2d34d230b9a75d903a0befdef82708e5f869ff75090c1b5ce85565e8a17e5e06c4cae305c5efb1f37d996',
		generatorKey: '59274923432b74133be4def9c9f8e544bf032184a2153b0ca34b1dd5669f5fdf',
	},
};

const transactionsMap = {
	'token:transfer': TOKEN_TRANSFER_TRANSACTION_OBJECT,
	'auth:registerMultisignature': AUTH_REGISTER_MULTI_SIGNATURE_TRANSACTION_OBJECT,
	'pos:registerValidator': POS_REGISTER_VALIDATOR_TRANSACTION_OBJECT,
	'pos:unlock': POS_UNLOCK_TRANSACTION_OBJECT,
	'pos:updateGeneratorKey': POS_UPDATE_GENERATOR_KEY_TRANSACTION_OBJECT,
	'pos:reportMisbehavior': POS_REPORT_MISBEHAVIOR_TRANSACTION_OBJECT,
	'pos:stake': POS_STAKE_TRANSACTION_OBJECT,
	'pos:changeCommission': POS_CHANGE_COMMISSION_TRANSACTION_OBJECT,
	'pos:claimRewards': POS_CLAIM_REWARDS_TRANSACTION_OBJECT,

	'legacy:reclaimLSK': LEGACY_RECLAIM_LSK,
	'legacy:registerKeys': LEGACY_REGISTER_KEYS_TRANSACTION_OBJECT,
};

module.exports = {
	// Token
	TOKEN_TRANSFER_TRANSACTION_OBJECT,

	// Auth
	AUTH_REGISTER_MULTI_SIGNATURE_TRANSACTION_OBJECT,

	// PoS
	POS_REGISTER_VALIDATOR_TRANSACTION_OBJECT,
	POS_UNLOCK_TRANSACTION_OBJECT,
	POS_REPORT_MISBEHAVIOR_TRANSACTION_OBJECT,
	POS_UPDATE_GENERATOR_KEY_TRANSACTION_OBJECT,
	POS_STAKE_TRANSACTION_OBJECT,
	POS_CHANGE_COMMISSION_TRANSACTION_OBJECT,
	POS_CLAIM_REWARDS_TRANSACTION_OBJECT,

	// Legacy
	LEGACY_RECLAIM_LSK,
	LEGACY_REGISTER_KEYS_TRANSACTION_OBJECT,

	transactionsMap,
};
