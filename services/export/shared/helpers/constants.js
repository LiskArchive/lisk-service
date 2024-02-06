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
const MODULE = Object.freeze({
	DYNAMIC_REWARD: 'dynamicReward',
	REWARD: 'reward',
	TOKEN: 'token',
	LEGACY: 'legacy',
	POS: 'pos',
	FEE: 'fee',
	INTEROPERABILITY: 'interoperability',
});

const COMMAND = Object.freeze({
	TRANSFER: 'transfer',
	TRANSFER_CROSS_CHAIN: 'transferCrossChain',
	RECLAIM_LSK: 'reclaimLSK',
});

const TRANSACTION_STATUS = Object.freeze({
	SUCCESSFUL: 'successful',
	FAILED: 'failed',
});

const EVENT = Object.freeze({
	LOCK: 'lock',
	MINT: 'mint',
	CCM_TRANSFER: 'ccmTransfer',
	CCM_PROCESSED: 'ccmProcessed',
	CCM_SEND_SUCCESS: 'ccmSendSuccess',
	CCM_SENT_FAILED: 'ccmSentFailed',
	REWARD_MINTED: 'rewardMinted',
	REWARDS_ASSIGNED: 'rewardsAssigned',
	GENERATOR_FEE_PROCESSED: 'generatorFeeProcessed',
	RELAYER_FEE_PROCESSED: 'relayerFeeProcessed',
	BEFORE_CCC_EXECUTION: 'beforeCCCExecution',
	TRANSFER_CROSS_CHAIN: 'transferCrossChain',
	ACCOUNT_RECLAIMED: 'accountReclaimed',
});

const MODULE_SUB_STORE = Object.freeze({
	TOKEN: {
		USER: 'userSubstore',
	},
	LEGACY: {
		ACCOUNTS: 'accounts',
	},
});

const LENGTH_BYTE_ID = 32;
const LENGTH_ID = LENGTH_BYTE_ID * 2; // Each byte is represented with 2 nibbles

const LENGTH_BYTE_DEFAULT_TOPIC = 1;
const LENGTH_DEFAULT_TOPIC = LENGTH_BYTE_DEFAULT_TOPIC * 2; // Each byte is represented with 2 nibbles

const EVENT_TOPIC_PREFIX = Object.freeze({
	TX_ID: '04',
	CCM_ID: '05',
});

const STATUS = Object.freeze({
	EVENT_CCM_TRANSFER_RESULT: {
		SUCCESSFUL: 0,
	},
});

module.exports = {
	MODULE,
	COMMAND,
	TRANSACTION_STATUS,
	EVENT,
	MODULE_SUB_STORE,
	LENGTH_ID,
	EVENT_TOPIC_PREFIX,
	LENGTH_DEFAULT_TOPIC,
	STATUS,
};
