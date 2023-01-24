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

const logger = require('lisk-service-framework').Logger();
const { getAppContext } = require('./appContext');
const config = require('../config');

const currentSvcStatus = {
	indexer: false,
	connector: false,
	fees: false,
	market: false,
	newsfeed: false,
	'app-registry': false,
	statistics: false,
};

const updateSvcStatus = async () => {
	await BluebirdPromise.map(
		Object.keys(currentSvcStatus),
		async microservice => {
			const broker = (await getAppContext()).getBroker();
			currentSvcStatus[microservice] = await broker.call(`${microservice}.status`)
				.then((res) => res.isReady)
				.catch((err) => {
					logger.error(err);
					return false;
				});
		},
	);
};

const getReady = async () => {
	const includeSvcForReadiness = Object.entries(currentSvcStatus)
		.filter(([key]) => config.brokerDependencies.includes(key));
	const includeSvcForReadinessObj = Object.fromEntries(includeSvcForReadiness);
	try {
		const servicesStatus = !Object.keys(includeSvcForReadinessObj)
			.some(value => !includeSvcForReadinessObj[value]);
		if (servicesStatus) return Promise.resolve({ services: includeSvcForReadinessObj });
		logger.debug(`Current service status: ${includeSvcForReadinessObj}`);
		return Promise.reject(new MoleculerError('Service Unavailable', 503, 'SERVICES_NOT_READY', includeSvcForReadinessObj));
	} catch (_) {
		logger.error(`Current service status: ${includeSvcForReadinessObj}`);
		return Promise.reject(new MoleculerError('Service Unavailable', 503, 'SERVICES_NOT_READY', includeSvcForReadinessObj));
	}
};

const getIndexStatus = async () => currentSvcStatus.indexer;

module.exports = {
	getReady,
	updateSvcStatus,
	getIndexStatus,
};
