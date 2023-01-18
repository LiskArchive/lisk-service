/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const { MoleculerError } = require('moleculer').Errors;

const currentSvcStatus = {
	indexerSvcReady: false,
	connectorSvcReady: false,
	feeSvcReady: false,
	newsfeedSvcReady: false,
	marketSvcReady: false,
	statisticsSvcReady: false,
};

const getReady = async () => {
	try {
		const servicesStatus = !Object.keys(currentSvcStatus).some(value => !currentSvcStatus[value]);
		if (servicesStatus) return Promise.resolve({ services: currentSvcStatus });
		return Promise.reject(new MoleculerError('Service Unavailable', 503, 'SERVICES_NOT_READY', currentSvcStatus));
	} catch (_) {
		return Promise.reject(new MoleculerError('Service Unavailable', 503, 'SERVICES_NOT_READY', currentSvcStatus));
	}
};

const updateSvcStatus = data => {
	const {
		isIndexerSvcReady,
		isConnectorSvcReady,
		isFeeSvcReady,
		isNewsfeedSvcReady,
		isMarketSvcReady,
		isStatisticsSvcReady,
	} = data;

	if (isIndexerSvcReady) currentSvcStatus.indexerSvcReady = isIndexerSvcReady;
	if (isConnectorSvcReady) currentSvcStatus.connectorSvcReady = isConnectorSvcReady;
	if (isFeeSvcReady) currentSvcStatus.feeSvcReady = isFeeSvcReady;
	if (isNewsfeedSvcReady) currentSvcStatus.newsfeedSvcReady = isNewsfeedSvcReady;
	if (isMarketSvcReady) currentSvcStatus.marketSvcReady = isMarketSvcReady;
	if (isStatisticsSvcReady) currentSvcStatus.statisticsSvcReady = isStatisticsSvcReady;
};

const getIndexStatus = async () => currentSvcStatus.indexer;

module.exports = {
	getReady,
	updateSvcStatus,
	getIndexStatus,
};
