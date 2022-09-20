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
const { HTTP, Utils, Logger } = require('lisk-service-framework');

const { requestConnector } = require('./utils/request');

const { isObject } = Utils.Data;

const config = require('../config');

const logger = Logger();

const staticUrl = config.endpoints.liskStatic;

let knowledge = {};

const getAccountKnowledge = (address) => {
	if (knowledge[address]) return knowledge[address];
	return {};
};

// TODO: Test the response once static endpoint response will be updated with chainID
const reloadKnowledge = async () => {
	logger.debug('Reloading known accounts...');

	try {
		const netStatus = await requestConnector('getNetworkStatus');
		const { chainID } = netStatus;

		const knownNetworks = await HTTP.request(`${staticUrl}/networks.json`);
		if (knownNetworks.data[chainID]) {
			const knownAccounts = await HTTP.request(`${staticUrl}/known_${knownNetworks.data[chainID]}.json`);
			if (isObject(knownAccounts.data)) {
				knowledge = knownAccounts.data;
				logger.debug(`Updated known accounts database with ${Object.keys(knowledge).length} entries`);
			}
		} else {
			logger.debug(`ChainID '${chainID}' does not exist in the database`);
		}
	} catch (err) {
		logger.debug(`Could not reload known accounts: ${err.message}`);
	}
};

module.exports = {
	reloadKnowledge,
	getAccountKnowledge,
};
