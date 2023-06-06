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
const { HTTP, Logger } = require('lisk-service-framework');

const config = require('../../config');
const { LENGTH_NETWORK_ID } = require('../constants');
const { getNetworkStatus } = require('./business/network');

const logger = Logger();

const staticUrl = config.endpoints.liskStatic;

let knowledge = {};

const getAccountKnowledge = (address) => {
	if (knowledge[address]) return knowledge[address];
	return {};
};

const getNameByChainID = (chainID) => {
	const networkID = chainID.substring(0, LENGTH_NETWORK_ID);
	const networks = Object.values(config.networks);

	for (let i = 0; i < networks.length; i++) {
		const network = networks[i].find(
			(ntwk) => ntwk.chainID.substring(0, LENGTH_NETWORK_ID) === networkID);

		if (network) {
			return network.name;
		}
	}

	return null; // Return null if chainID is not found in any network
};

const fetchAccountKnowledge = async () => {
	logger.debug('Reloading known accounts...');

	try {
		const { data: { chainID } } = await getNetworkStatus();
		const networkName = getNameByChainID(chainID);

		if (networkName) {
			const res = await HTTP.request(`${staticUrl}/known_${networkName}.json`);

			if (res && res.data && res.status === 200) {
				const knownAccounts = res.data;

				if (typeof knownAccounts === 'object') {
					knowledge = knownAccounts;
					logger.info(`Updated known accounts database with ${Object.keys(knowledge).length} entries.`);
				}
			} else {
				logger.warn('Lisk static URL did not respond with valid data.');
			}
		} else {
			logger.warn(`ChainID does not exist in the database: ${chainID}.`);
		}
	} catch (err) {
		logger.error(`Could not reload known accounts: ${err.message}.`);
	}
};

module.exports = {
	getAccountKnowledge,
	fetchAccountKnowledge,

	// Testing
	getNameByChainID,
};
