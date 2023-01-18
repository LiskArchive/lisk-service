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
	indexerReady: false,
	connectorReady: false,
	feeReady: false,
	newsfeedReady: false,
	marketReady: false,
	statisticsReady: false,
};

const getReady = async () => {
	try {
		const servicesStatus = !Object.keys(currentSvcStatus).some(value => !currentSvcStatus[value]);
		if (servicesStatus) return Promise.resolve({ services: currentSvcStatus });
		return Promise.reject(new MoleculerError('Core Service Unavailable', 503, 'CORE_SERVICES_NOT_READY', currentSvcStatus));
	} catch (_) {
		return Promise.reject(new MoleculerError('Core Service Unavailable', 503, 'CORE_SERVICES_NOT_READY', currentSvcStatus));
	}
};

const updateSvcStatus = data => {
	const {
		isIndexerReady,
		isConnectorReady,
		isFeeReady,
		isNewsfeedReady,
		isMarketReady,
		isStatisticsReady,
	} = data;

	currentSvcStatus.indexerReady = isIndexerReady || false;
	currentSvcStatus.connectorReady = isConnectorReady || false;
	currentSvcStatus.feeReady = isFeeReady || false;
	currentSvcStatus.newsfeedReady = isNewsfeedReady || false;
	currentSvcStatus.marketReady = isMarketReady || false;
	currentSvcStatus.statisticsReady = isStatisticsReady || false;
};

const getIndexStatus = async () => currentSvcStatus.indexer;

module.exports = {
	getReady,
	updateSvcStatus,
	getIndexStatus,
};
