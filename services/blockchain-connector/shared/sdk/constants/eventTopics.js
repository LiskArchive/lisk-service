/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
	MODULE_NAME_AUTH,
	EVENT_NAME_MULTISIGNATURE_REGISTERED,
	EVENT_NAME_INVALID_SIGNATURE,

	MODULE_NAME_VALIDATORS,
	EVENT_NAME_GENERATOR_KEY_REGISTRATION,
	EVENT_NAME_BLS_KEY_REGISTRATION,

	MODULE_NAME_TOKEN,
	EVENT_NAME_TRANSFER,
	EVENT_NAME_TRANSFER_CROSS_CHAIN,
	EVENT_NAME_CCM_TRANSFER,
	EVENT_NAME_MINT,
	EVENT_NAME_BURN,
	EVENT_NAME_LOCK,
	EVENT_NAME_UNLOCK,
	EVENT_NAME_INITIALIZE_TOKEN,
	EVENT_NAME_INITIALIZE_USER_ACCOUNT,
	EVENT_NAME_INITIALIZE_ESCROW_ACCOUNT,
	EVENT_NAME_RECOVER,
	EVENT_NAME_BEFORE_CCC_EXECUTION,
	EVENT_NAME_BEFORE_CCM_FORWARDING,
	EVENT_NAME_ALL_TOKENS_SUPPORTED,
	EVENT_NAME_ALL_TOKENS_SUPPORT_REMOVED,
	EVENT_NAME_ALL_TOKENS_FROM_CHAIN_SUPPORTED,
	EVENT_NAME_ALL_TOKENS_FROM_CHAIN_SUPPORT_REMOVED,
	EVENT_NAME_TOKEN_ID_SUPPORTED,
	EVENT_NAME_TOKEN_ID_SUPPORT_REMOVED,

	MODULE_NAME_FEE,
	EVENT_NAME_FEE_PROCESSED,
	EVENT_NAME_INSUFFICIENT_FEE,
	EVENT_NAME_RELAYER_FEE_PROCESSED,

	MODULE_NAME_INTEROPERABILITY,
	EVENT_NAME_INVALID_REGISTRATION_SIGNATURE,
	EVENT_NAME_CHAIN_ACCOUNT_UPDATED,
	EVENT_NAME_CCM_SENT_SUCCESS,
	EVENT_NAME_CCM_SENT_FAILED,
	EVENT_NAME_CCM_PROCESSED,
	EVENT_NAME_TERMINATED_STATE_CREATED,
	EVENT_NAME_TERMINATED_OUTBOX_CREATED,

	MODULE_NAME_POS,
	EVENT_NAME_VALIDATOR_REGISTERED,
	EVENT_NAME_VALIDATOR_STAKED,
	EVENT_NAME_VALIDATOR_PUNISHED,
	EVENT_NAME_VALIDATOR_BANNED,
	EVENT_NAME_COMMISSION_CHANGE,
	EVENT_NAME_REWARDS_ASSIGNED,

	MODULE_NAME_RANDOM,

	MODULE_NAME_DYNAMIC_BLOCK_REWARDS,
	EVENT_NAME_REWARD_MINTED,

	MODULE_NAME_LEGACY,
	EVENT_NAME_ACCOUNT_RECLAIMED,
	EVENT_NAME_KEYS_REGISTERED,
} = require('./names');

const COMMAND_EXECUTION_RESULT_TOPICS = ['transactionID'];

// TODO: Remove when SDK exposes topics information in metadata
const EVENT_TOPIC_MAPPINGS_BY_MODULE = {
	[MODULE_NAME_AUTH]: {
		[EVENT_NAME_MULTISIGNATURE_REGISTERED]: ['senderAddress'],
		[EVENT_NAME_INVALID_SIGNATURE]: ['senderAddress'],
	},
	[MODULE_NAME_VALIDATORS]: {
		[EVENT_NAME_GENERATOR_KEY_REGISTRATION]: ['defaultTopic', 'validatorAddress'],
		[EVENT_NAME_BLS_KEY_REGISTRATION]: ['defaultTopic', 'validatorAddress'],
	},
	[MODULE_NAME_TOKEN]: {
		[EVENT_NAME_TRANSFER]: ['defaultTopic', 'senderAddress', 'recipientAddress'],
		[EVENT_NAME_TRANSFER_CROSS_CHAIN]: ['defaultTopic', 'senderAddress', 'recipientAddress', 'receivingChainID'],
		[EVENT_NAME_CCM_TRANSFER]: ['defaultTopic', 'senderAddress', 'recipientAddress', 'ownChainID'],
		[EVENT_NAME_MINT]: ['defaultTopic', 'address'],
		[EVENT_NAME_BURN]: ['defaultTopic', 'address'],
		[EVENT_NAME_LOCK]: ['transactionID', 'address'],
		[EVENT_NAME_UNLOCK]: ['transactionID', 'address'],
		[EVENT_NAME_INITIALIZE_TOKEN]: ['defaultTopic', 'tokenID'],
		[EVENT_NAME_INITIALIZE_USER_ACCOUNT]: ['transactionID', 'userAccountAddress'],
		[EVENT_NAME_INITIALIZE_ESCROW_ACCOUNT]: ['defaultTopic', 'chainID'],
		[EVENT_NAME_RECOVER]: ['defaultTopic', 'address'],
		[EVENT_NAME_BEFORE_CCC_EXECUTION]: ['defaultTopic', 'relayerAddress', 'messageFeeTokenID'],
		[EVENT_NAME_BEFORE_CCM_FORWARDING]: ['defaultTopic', 'sendingChainID', 'receivingChainID'],
		[EVENT_NAME_ALL_TOKENS_SUPPORTED]: [],
		[EVENT_NAME_ALL_TOKENS_SUPPORT_REMOVED]: [],
		[EVENT_NAME_ALL_TOKENS_FROM_CHAIN_SUPPORTED]: ['defaultTopic', 'chainID'],
		[EVENT_NAME_ALL_TOKENS_FROM_CHAIN_SUPPORT_REMOVED]: ['defaultTopic', 'chainID'],
		[EVENT_NAME_TOKEN_ID_SUPPORTED]: ['defaultTopic', 'tokenID'],
		[EVENT_NAME_TOKEN_ID_SUPPORT_REMOVED]: ['defaultTopic', 'tokenID'],
	},
	[MODULE_NAME_FEE]: {
		[EVENT_NAME_FEE_PROCESSED]: ['defaultTopic', 'senderAddress', 'generatorAddress'],
		[EVENT_NAME_INSUFFICIENT_FEE]: [],
		[EVENT_NAME_RELAYER_FEE_PROCESSED]: ['defaultTopic', 'relayerAddress'],
	},
	[MODULE_NAME_INTEROPERABILITY]: {
		[EVENT_NAME_INVALID_REGISTRATION_SIGNATURE]: ['chainID'],
		[EVENT_NAME_CHAIN_ACCOUNT_UPDATED]: ['sendingChainID'],
		[EVENT_NAME_CCM_SENT_SUCCESS]: ['sendingChainID', 'receivingChainID', 'sentCCMID'],
		[EVENT_NAME_CCM_SENT_FAILED]: [],
		[EVENT_NAME_CCM_PROCESSED]: ['sendingChainID', 'receivingChainID', 'ccmID'],
		[EVENT_NAME_TERMINATED_STATE_CREATED]: ['chainID'],
		[EVENT_NAME_TERMINATED_OUTBOX_CREATED]: ['chainID'],
	},
	[MODULE_NAME_POS]: {
		[EVENT_NAME_VALIDATOR_REGISTERED]: ['validatorAddress'],
		[EVENT_NAME_VALIDATOR_STAKED]: ['stakerAddress', 'validatorAddress'],
		[EVENT_NAME_VALIDATOR_PUNISHED]: ['validatorAddress'],
		[EVENT_NAME_VALIDATOR_BANNED]: ['validatorAddress'],
		[EVENT_NAME_COMMISSION_CHANGE]: ['validatorAddress'],
		[EVENT_NAME_REWARDS_ASSIGNED]: ['stakerAddress'],
	},
	[MODULE_NAME_RANDOM]: {
		// No events defined in LIP
	},
	[MODULE_NAME_DYNAMIC_BLOCK_REWARDS]: {
		[EVENT_NAME_REWARD_MINTED]: ['defaultTopic', 'generatorAddress'],
	},
	[MODULE_NAME_LEGACY]: {
		[EVENT_NAME_ACCOUNT_RECLAIMED]: ['legacyAddress', 'newAddress'],
		[EVENT_NAME_KEYS_REGISTERED]: ['validatorAddress', 'generatorKey', 'blsKey'],
	},
};

module.exports = {
	EVENT_TOPIC_MAPPINGS_BY_MODULE,
	COMMAND_EXECUTION_RESULT_TOPICS,
};
