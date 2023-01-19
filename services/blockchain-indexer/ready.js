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
const { Logger, Signals } = require('lisk-service-framework');

const dataService = require('./shared/dataService');
const { getIndexReadyStatus } = require('./shared/indexer/indexStatus');

const logger = Logger();

const serviceTasks = {
	isBlockchainIndexReady: false,
	isGeneratorsListReady: false,
	isTransactionsEndpointReady: false,
	isEventsEndpointReady: false,
	isNetworkStatusEndpointReady: false,
	isSchemasEndpointReady: false,
};

const isIndexerServiceReady = () => !Object.keys(serviceTasks).some(value => !serviceTasks[value]);

const newBlockListener = async () => {
	if (!isIndexerServiceReady()) {
		serviceTasks.isBlockchainIndexReady = getIndexReadyStatus();

		const events = await dataService.getEvents({ limit: 1 });
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
	}

	logger.debug(`============== 'indexerServiceReady' signal: ${Signals.get('indexerServiceReady')} ==============`);
	if (isIndexerServiceReady()) Signals.get('indexerServiceReady').dispatch(true);
};

const getCurrentSvcStatus = async () => serviceTasks;

Signals.get('chainNewBlock').add(newBlockListener);

module.exports = {
	getCurrentSvcStatus,
};
