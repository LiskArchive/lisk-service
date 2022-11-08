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

let networkFees;
let genesisConfig;

// TODO: Resolve networkFeeConstants once SDK exposes relevant information
const networkFeeConstants = {
	minFeePerByte: undefined,
	baseFeeByModuleCommandName: {},
};

const resolveModuleCommands = (data) => {
	let result = [];
	data.forEach(liskModule => {
		if (liskModule.commands.length) {
			result = result.concat(
				liskModule.commands.map(command => {
					const id = String(liskModule.id).concat(':').concat(command.id);
					if (liskModule.name && command.name) {
						const name = liskModule.name.concat(':').concat(command.name);
						return { id, name };
					}
					return { id };
				}),
			);
		}
	});
	return result;
};

const resolveBaseFees = (networkConstants) => {
	networkConstants.genesis.baseFees.forEach(entry => {
		const moduleCommandID = String(entry.moduleID).concat(':').concat(entry.commandID);
		networkConstants.commands = resolveModuleCommands(networkConstants.registeredModules);
		const [moduleCommand] = networkConstants.commands.filter(o => o.id === moduleCommandID);
		networkFeeConstants.baseFeeByModuleCommandName[moduleCommand.name] = entry.baseFee;
	});
	networkFeeConstants.minFeePerByte = networkConstants.genesis.minFeePerByte;

	return networkFeeConstants;
};

const setNetworkFeeConstants = async () => {
	if (!networkFees) {
		const result = await requestConnector('getNetworkStatus');
		// Enable once network fee constants is available from SDK
		// networkFees = resolveBaseFees(result);
		networkFees = result.genesis.baseFees ? resolveBaseFees(result) : networkFeeConstants;
	}
};

const setGenesisConfig = async () => {
	if (!genesisConfig) {
		const result = await requestConnector('getNetworkStatus');
		genesisConfig = result.genesis;
	}
};

const getNetworkFeeConstants = () => networkFees;

const getGenesisConfig = () => genesisConfig;

const init = async () => {
	await setGenesisConfig();
	await setNetworkFeeConstants();
};

module.exports = {
	init,
	getNetworkFeeConstants,
	getGenesisConfig,
};
