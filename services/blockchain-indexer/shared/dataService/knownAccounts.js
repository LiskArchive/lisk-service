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
const util = require('util');

const config = require('../../config');
const { LENGTH_NETWORK_ID } = require('../constants');
const { getNetworkStatus } = require('./business/network');

const logger = Logger();

const networkConfig = Object.values(config.networks);
const staticUrl = config.endpoints.liskStatic;

let knowledge = {};

const getAccountKnowledge = (address) => knowledge[address] ? knowledge[address] : {};

const resolveNetworkByChainID = (chainID) => {
	const networkID = chainID.substring(0, LENGTH_NETWORK_ID);

	const matchingNetwork = networkConfig.flatMap((network) => network)
		.find((network) => network.chainID.startsWith(networkID));

	return matchingNetwork ? matchingNetwork.name : null;
};

const reloadAccountKnowledge = async () => {
	logger.debug('Reloading known accounts...');

	try {
		const { data: { chainID } } = await getNetworkStatus();
		const networkName = resolveNetworkByChainID(chainID);

		if (networkName) {
			const res = await HTTP.get(`${staticUrl}/known_${networkName}.json`);

			if (res.status === 200 && res.data) {
				const knownAccounts = res.data;

				if (typeof knownAccounts === 'object') {
					knowledge = knownAccounts;
					logger.info(`Updated known accounts cache with ${Object.keys(knowledge).length} entries.`);
				}
			} else {
				logger.warn('Lisk static URL did not respond with valid data.');
				logger.debug(`Recieved: ${util.inspect(res)}.`);
			}
		} else {
			logger.warn(`Static information anavailable for the current chainID: ${chainID}.`);
		}
	} catch (err) {
		logger.error(`Could not reload known accounts: ${err.message}.`);
		logger.debug(err.stack);
	}
};

module.exports = {
	getAccountKnowledge,
	reloadAccountKnowledge,

	// Testing
	resolveNetworkByChainID,
};
