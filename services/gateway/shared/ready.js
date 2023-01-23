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
const BluebirdPromise = require('bluebird');
const { MoleculerError } = require('moleculer').Errors;

const { Logger } = require('lisk-service-framework');

const logger = Logger();
const { getAppContext } = require('./appContext');

const currentSvcStatus = {
	indexer: false,
	connector: false,
	fees: false,
	market: false,
	newsfeed: false,
	'app-registry': false,
	statistics: false,
};

const knownMicroservices = [
	'indexer',
	'connector',
	'fees',
	'market',
	'newsfeed',
	'app-registry',
	'statistics',
];

const updateSvcStatus = async () => {
	await BluebirdPromise.map(
		knownMicroservices,
		async microservice => {
			const broker = (await getAppContext()).getBroker();
			currentSvcStatus[microservice] = await broker.call(`${microservice}.status`).catch((err) => {
				logger.error(err);
				return false;
			});
		},
	);
};

const getReady = async () => {
	try {
		const servicesStatus = !Object.keys(currentSvcStatus).some(value => !currentSvcStatus[value]);
		if (servicesStatus) return Promise.resolve({ services: currentSvcStatus });
		logger.debug(`Current service status: ${currentSvcStatus}`);
		return Promise.reject(new MoleculerError('Service Unavailable', 503, 'SERVICES_NOT_READY', currentSvcStatus));
	} catch (_) {
		logger.error(`Current service status: ${currentSvcStatus}`);
		return Promise.reject(new MoleculerError('Service Unavailable', 503, 'SERVICES_NOT_READY', currentSvcStatus));
	}
};

const getIndexStatus = async () => currentSvcStatus.indexer;

module.exports = {
	getReady,
	updateSvcStatus,
	getIndexStatus,
};
