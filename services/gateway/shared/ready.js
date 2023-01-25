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

const getReady = () => {
	try {
		const includeSvcForReadiness = {};
		Object.entries(currentSvcStatus).forEach(([service, isReady]) => {
			if (isReady) includeSvcForReadiness[service] = isReady;
			else if (config.brokerDependencies.includes(service)) throw new MoleculerError();
		});
		return { services: includeSvcForReadiness };
	} catch (_) {
		logger.error(`Current service status: ${currentSvcStatus}`);
		throw new MoleculerError('Service Unavailable', 503, 'SERVICES_NOT_READY');
	}
};

const getIndexStatus = async () => currentSvcStatus.indexer;

module.exports = {
	getReady,
	updateSvcStatus,
	getIndexStatus,
};
