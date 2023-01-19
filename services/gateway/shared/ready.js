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

const { Logger } = require('lisk-service-framework');

const currentSvcStatus = {
	appRegistrySvcReady: false,
	connectorSvcReady: false,
	indexerSvcReady: false,
	feeSvcReady: false,
	marketSvcReady: false,
	newsfeedSvcReady: false,
	statisticsSvcReady: false,
};

const getReady = async () => {
	try {
		const servicesStatus = !Object.keys(currentSvcStatus).some(value => !currentSvcStatus[value]);
		if (servicesStatus) return Promise.resolve({ services: currentSvcStatus });
		Logger.debug(`Current service status: ${currentSvcStatus}`);
		return Promise.reject(new MoleculerError('Service Unavailable', 503, 'SERVICES_NOT_READY', currentSvcStatus));
	} catch (_) {
		return Promise.reject(new MoleculerError('Service Unavailable', 503, 'SERVICES_NOT_READY', currentSvcStatus));
	}
};

const updateSvcStatus = data => {
	const {
		isAppRegistrySvcReady,
		isConnectorSvcReady,
		isIndexerSvcReady,
		isFeeSvcReady,
		isMarketSvcReady,
		isNewsfeedSvcReady,
		isStatisticsSvcReady,
	} = data;

	if (isAppRegistrySvcReady) currentSvcStatus.appRegistrySvcReady = isAppRegistrySvcReady;
	if (isConnectorSvcReady) currentSvcStatus.connectorSvcReady = isConnectorSvcReady;
	if (isIndexerSvcReady) currentSvcStatus.indexerSvcReady = isIndexerSvcReady;
	if (isFeeSvcReady) currentSvcStatus.feeSvcReady = isFeeSvcReady;
	if (isMarketSvcReady) currentSvcStatus.marketSvcReady = isMarketSvcReady;
	if (isNewsfeedSvcReady) currentSvcStatus.newsfeedSvcReady = isNewsfeedSvcReady;
	if (isStatisticsSvcReady) currentSvcStatus.statisticsSvcReady = isStatisticsSvcReady;
};

const getIndexStatus = async () => currentSvcStatus.indexer;

module.exports = {
	getReady,
	updateSvcStatus,
	getIndexStatus,
};
