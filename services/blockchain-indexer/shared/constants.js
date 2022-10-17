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

const MODULE = {
	DPOS: 'dpos',
};

const COMMAND = {
	REGISTER_DELEGATE: 'registerDelegate',
	VOTE_DELEGATE: 'voteDelegate',
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

	MODULE,
	COMMAND,
};
