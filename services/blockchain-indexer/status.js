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
const packageJson = require('./package.json');
const dataService = require('./shared/dataService');
const { getIndexReadyStatus } = require('./shared/indexer/indexStatus');

const status = {
	service: packageJson.name,
	version: packageJson.version,
	isReady: false,
};

const serviceTasks = {
	isBlockchainIndexReady: false,
	isGeneratorsListReady: false,
	isTransactionsEndpointReady: false,
	isEventsEndpointReady: false,
	isNetworkStatusEndpointReady: false,
	isSchemasEndpointReady: false,
};

const isIndexerServiceReady = () => Object.values(serviceTasks).every(v => v === true);

const getStatus = async () => {
	if (!status.isReady) {
		serviceTasks.isBlockchainIndexReady = getIndexReadyStatus();

		const events = await dataService.getEvents({ limit: 1, sort: 'timestamp:desc' });
		if (events.data.length) serviceTasks.isEventsEndpointReady = true;

		const generators = await dataService.getGenerators({ limit: 1, offset: 0 });
		if (generators.data.length) serviceTasks.isGeneratorsListReady = true;

		const networkStatus = await dataService.getNetworkStatus();
		if (Object.getOwnPropertyNames(networkStatus.data).length) {
			serviceTasks.isNetworkStatusEndpointReady = true;
		}

		const transactions = await dataService.getTransactions({ limit: 1 });
		if (transactions.data.length) serviceTasks.isTransactionsEndpointReady = true;

		const schemas = await dataService.getSchemas();
		if (Object.getOwnPropertyNames(schemas.data).length) serviceTasks.isSchemasEndpointReady = true;

		if (isIndexerServiceReady()) status.isReady = true;
	}
	return status;
};

module.exports = {
	getStatus,
};
