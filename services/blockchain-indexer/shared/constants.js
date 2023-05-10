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
const { requestConnector } = require('./utils/request');

let genesisConfig;
let genesisHeight;
let moduleCommands;
let registeredModules;
let systemMetadata;
let finalizedHeight;

const updateFinalizedHeight = async () => {
	const { finalizedHeight: latestFinalizedHeight } = await requestConnector('getNetworkStatus');
	finalizedHeight = latestFinalizedHeight;
};

const getFinalizedHeight = async () => {
	if (typeof finalizedHeight !== 'number') {
		await updateFinalizedHeight();
	}
	return finalizedHeight;
};

const getGenesisHeight = async () => {
	if (typeof genesisHeight !== 'number') {
		genesisHeight = await requestConnector('getGenesisHeight');
	}
	return genesisHeight;
};

const getCurrentHeight = async () => {
	const { height } = await requestConnector('getNetworkStatus');
	return height;
};

const getGenesisConfig = async () => {
	if (!genesisConfig) genesisConfig = await requestConnector('getGenesisConfig');
	return genesisConfig;
};

const resolveModuleCommands = (systemMeta) => {
	const moduleCommandList = [];
	systemMeta.forEach(module => {
		module.commands.forEach(command => {
			moduleCommandList.push(`${module.name}:${command.name}`);
		});
	});
	return moduleCommandList;
};

const getAvailableModuleCommands = async () => {
	if (!moduleCommands) {
		const response = await requestConnector('getSystemMetadata');
		moduleCommands = resolveModuleCommands(response.modules);
	}
	return moduleCommands;
};

const getRegisteredModules = async () => {
	if (!registeredModules) {
		const response = await requestConnector('getSystemMetadata');
		registeredModules = response.modules.map(module => module.name);
	}
	return registeredModules;
};

const getSystemMetadata = async () => {
	if (!systemMetadata) {
		systemMetadata = await requestConnector('getSystemMetadata');
	}
	return systemMetadata;
};

const MODULE = Object.freeze({
	POS: 'pos',
	AUTH: 'auth',
	DYNAMIC_REWARD: 'dynamicReward',
	REWARD: 'reward',
	TOKEN: 'token',
	INTEROPERABILITY: 'interoperability',
});

const MODULE_SUB_STORE = Object.freeze({
	TOKEN: {
		USER: 'userSubstore',
	},
	POS: {
		STAKERS: 'stakers',
		VALIDATORS: 'validators',
	},
});

const COMMAND = Object.freeze({
	REGISTER_VALIDATOR: 'registerValidator',
	STAKE: 'stake',
	TRANSFER: 'transfer',
	TRANSFER_CROSS_CHAIN: 'transferCrossChain',
});

const LENGTH_CHAIN_ID = 4 * 2; // Each byte is represented with 2 nibbles
const LENGTH_TOKEN_LOCAL_ID = 4 * 2; // Each byte is represented with 2 nibbles
const PATTERN_ANY_TOKEN_ID = '*';
const PATTERN_ANY_CHAIN_TOKEN_ID = '*'.repeat(LENGTH_TOKEN_LOCAL_ID);
const LENGTH_TOKEN_ID = LENGTH_CHAIN_ID + LENGTH_TOKEN_LOCAL_ID;
const LENGTH_NETWORK_ID = 1 * 2; // Each byte is represented with 2 nibbles

const MAX_COMMISSION = BigInt('10000');

const KV_STORE_KEY = Object.freeze({
	PREFIX: {
		TOTAL_LOCKED: 'total_locked_',
		TOTAL_STAKED: 'total_staked_',
		TOTAL_SELF_STAKED: 'total_self_staked_',
	},
});

const TRANSACTION_STATUS = Object.freeze({
	SUCCESS: 'success',
	FAIL: 'fail',
});

const EVENT = Object.freeze({
	LOCK: 'lock',
	UNLOCK: 'unlock',
	COMMAND_EXECUTION_RESULT: 'commandExecutionResult',
	REWARD_MINTED: 'rewardMinted',
	CCM_SEND_SUCCESS: 'ccmSendSuccess',
});

const TRANSACTION_VERIFY_RESULT = {
	INVALID: -1,
	PENDING: 0,
	OK: 1,
};

module.exports = {
	updateFinalizedHeight,
	getFinalizedHeight,
	getCurrentHeight,
	getGenesisConfig,
	getGenesisHeight,
	getAvailableModuleCommands,
	resolveModuleCommands,
	getRegisteredModules,
	getSystemMetadata,

	LENGTH_CHAIN_ID,
	PATTERN_ANY_TOKEN_ID,
	PATTERN_ANY_CHAIN_TOKEN_ID,
	LENGTH_TOKEN_ID,
	LENGTH_NETWORK_ID,
	MODULE,
	MODULE_SUB_STORE,
	COMMAND,
	EVENT,
	MAX_COMMISSION,
	KV_STORE_KEY,
	TRANSACTION_STATUS,
	TRANSACTION_VERIFY_RESULT,
};
