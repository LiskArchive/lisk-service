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
	HTTP,
	Logger,
} = require('lisk-service-framework');

const { requestIndexer } = require('./request');

const config = require('../../config');

const logger = Logger();

const getChainIDByName = async (name, network) => {
	try {
		const [response] = await requestIndexer('blockchain.apps', { name });
		return response.chainID;
	} catch (error) {
		logger.debug('Unable to fetch blockchain application information from indexer, fetching directly using HTTP call');
		const serviceURL = config.serviceURL[network];
		const [response] = HTTP.get(`${serviceURL}/api/v3/blockchain/apps`, { name });
		return response.chainID;
	}
};

module.exports = {
	getChainIDByName,
};
