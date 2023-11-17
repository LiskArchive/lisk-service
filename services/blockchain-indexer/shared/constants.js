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
const { Signals } = require('lisk-service-framework');
const { requestConnector } = require('./utils/request');

let genesisConfig;
let genesisHeight;
let currentHeight;
let moduleCommands;
let registeredModules;
let registeredEndpoints;
let systemMetadata;
let finalizedHeight;
let engineEndpoints;
let allRegisteredEndpoints;

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
	if (typeof currentHeight !== 'number') {
		const networkStatus = await requestConnector('getNetworkStatus');
		currentHeight = networkStatus.height;
	}
	return currentHeight;
};

const getGenesisConfig = async () => {
	if (!genesisConfig) genesisConfig = await requestConnector('getGenesisConfig');
	return genesisConfig;
};

const resolveModuleCommands = systemMeta => {
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

const getRegisteredEndpoints = async () => {
	if (!registeredEndpoints) {
		registeredEndpoints = await requestConnector('getRegisteredEndpoints');
	}
	return registeredEndpoints;
};

const getEngineEndpoints = async () => {
	if (!engineEndpoints) {
		engineEndpoints = await requestConnector('getEngineEndpoints');
	}
	return engineEndpoints;
};

const getAllRegisteredEndpoints = async () => {
	if (!allRegisteredEndpoints) {
		const _registeredEndpoints = await getRegisteredEndpoints();
		const _engineEndpoints = await getEngineEndpoints();

		allRegisteredEndpoints = _engineEndpoints.map(e => e.name).concat(_registeredEndpoints);
	}

	return allRegisteredEndpoints;
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
	CHANGE_COMMISSION: 'changeCommission',
	TRANSFER: 'transfer',
	TRANSFER_CROSS_CHAIN: 'transferCrossChain',
	REGISTER_SIDECHAIN: 'registerSidechain',
	REGISTER_MAINCHAIN: 'registerMainchain',
});

const LENGTH_CHAIN_ID = 4 * 2; // Each byte is represented with 2 nibbles
const LENGTH_TOKEN_LOCAL_ID = 4 * 2; // Each byte is represented with 2 nibbles
const PATTERN_ANY_TOKEN_ID = '*';
const PATTERN_ANY_CHAIN_TOKEN_ID = '*'.repeat(LENGTH_TOKEN_LOCAL_ID);
const LENGTH_TOKEN_ID = LENGTH_CHAIN_ID + LENGTH_TOKEN_LOCAL_ID;
const LENGTH_NETWORK_ID = 1 * 2; // Each byte is represented with 2 nibbles
const LENGTH_BYTE_SIGNATURE = 64;
const LENGTH_BYTE_ID = 32;
const DEFAULT_NUM_OF_SIGNATURES = 1;
const LENGTH_ID = LENGTH_BYTE_ID * 2; // Each byte is represented with 2 nibbles

const MAX_COMMISSION = BigInt('10000');

const KV_STORE_KEY = Object.freeze({
	PREFIX: {
		TOTAL_LOCKED: 'total_locked_',
		TOTAL_STAKED: 'total_staked_',
		TOTAL_SELF_STAKED: 'total_self_staked_',
	},
});

const TRANSACTION_STATUS = Object.freeze({
	SUCCESSFUL: 'successful',
	FAILED: 'failed',
	PENDING: 'pending',
});

const EVENT = Object.freeze({
	LOCK: 'lock',
	UNLOCK: 'unlock',
	COMMAND_EXECUTION_RESULT: 'commandExecutionResult',
	REWARD_MINTED: 'rewardMinted',
	CCM_SEND_SUCCESS: 'ccmSendSuccess',
	CCM_SENT_FAILED: 'ccmSentFailed',
});

const CCM_SENT_FAILED_ERROR_MESSAGE = Object.freeze({
	1: 'Receiving chain is not active.',
	11: 'Failed to pay message fee.',
	12: 'Invalid params provided.',
	13: 'Invalid CCM format.',
	14: 'Sending chain cannot be the receiving chain.',
});

const EVENT_TOPIC_PREFIX = Object.freeze({
	TX_ID: '04',
	CCM_ID: '05',
});

const TRANSACTION_VERIFY_RESULT = {
	INVALID: -1,
	PENDING: 0,
	VALID: 1,
};

const initNodeConstants = async () => {
	// Initialize the finalizedHeight at init
	await updateFinalizedHeight();

	const nodeInfoListener = async payload => {
		// Caching all node constants
		genesisHeight = payload.genesisHeight;
		genesisConfig = payload.genesis;
		currentHeight = payload.height;
		finalizedHeight = payload.finalizedHeight;
	};
	Signals.get('nodeInfo').add(nodeInfoListener);
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
	getRegisteredEndpoints,
	getSystemMetadata,
	getEngineEndpoints,
	getAllRegisteredEndpoints,
	initNodeConstants,

	LENGTH_CHAIN_ID,
	PATTERN_ANY_TOKEN_ID,
	PATTERN_ANY_CHAIN_TOKEN_ID,
	LENGTH_TOKEN_ID,
	LENGTH_NETWORK_ID,
	MODULE,
	MODULE_SUB_STORE,
	COMMAND,
	EVENT,
	EVENT_TOPIC_PREFIX,
	MAX_COMMISSION,
	KV_STORE_KEY,
	TRANSACTION_STATUS,
	TRANSACTION_VERIFY_RESULT,
	LENGTH_BYTE_SIGNATURE,
	LENGTH_BYTE_ID,
	LENGTH_ID,
	DEFAULT_NUM_OF_SIGNATURES,
	CCM_SENT_FAILED_ERROR_MESSAGE,
};
