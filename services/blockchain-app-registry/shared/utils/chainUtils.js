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
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const { requestIndexer } = require('./request');

const config = require('../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const applicationsIndexSchema = require('../database/schema/applications');

const getApplicationsIndex = () => getTableInstance(
	applicationsIndexSchema.tableName,
	applicationsIndexSchema,
	MYSQL_ENDPOINT,
);

const logger = Logger();

const getChainIDByName = async (name, network) => {
	try {
		const [response] = await requestIndexer('blockchain.apps', { name });
		return response.chainID;
	} catch (error) {
		logger.debug('Unable to fetch blockchain application information from indexer, fetching directly using HTTP call');
		const serviceURL = config.serviceURL[network];
		const response = HTTP.get(`${serviceURL}/api/v3/blockchain/apps`, { name });
		const { chainID } = response.data[0];
		return chainID;
	}
};

const resolveChainNameByFilePath = async (filePath) => {
	const applicationsDB = await getApplicationsIndex();
	const [network, appDirName] = filePath.split('/');
	const EMPTY_STRING = '';
	const [{ chainName = EMPTY_STRING } = {}] = await applicationsDB.find({ network, appDirName }, ['chainName']);
	return chainName.filter(n => n !== EMPTY_STRING);
};

module.exports = {
	getChainIDByName,
	resolveChainNameByFilePath,
};
