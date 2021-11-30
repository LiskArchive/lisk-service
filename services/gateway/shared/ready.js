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

const config = require('../config');

const currentStatus = {
	indexReadyStatus: false,
	transactionStatsStatus: false,
	feesStatus: false,
	delegatesStatus: false,
};

const getReady = async broker => {
	const coreMethods = {
		lisk_accounts: 'core.accounts',
		lisk_blocks: 'core.blocks',
		lisk_transactions: 'core.transactions',
		// lisk_peers: 'core.peers',
	};
	try {
		const services = await BluebirdPromise.map(
			Object.getOwnPropertyNames(coreMethods),
			async key => {
				const service = {};
				const response = await broker.call(coreMethods[key], { limit: 10 });
				service[key] = !!response.data.length;
				return service;
			},
		);
		let allServices;
		if (config.includeCoreReadiness) {
			allServices = Object.assign(...services, currentStatus);
		} else {
			allServices = Object.assign(...services);
		}

		const servicesStatus = !Object.keys(allServices).some(value => !allServices[value]);
		if (servicesStatus) return Promise.resolve({ services: allServices });
		return Promise.reject(new MoleculerError('Core Service Unavailable', 503, 'CORE_SERVICES_NOT_READY', currentStatus));
	} catch (_) {
		return Promise.reject(new MoleculerError('Core Service Unavailable', 503, 'CORE_SERVICES_NOT_READY', currentStatus));
	}
};

const updateSvcStatus = data => {
	const { isIndexReady, isTransactionStatsReady, isFeeEstimatesReady, isDelegatesReady } = data;
	currentStatus.indexReadyStatus = isIndexReady;
	currentStatus.transactionStatsStatus = isTransactionStatsReady;
	currentStatus.feesStatus = isFeeEstimatesReady;
	currentStatus.delegatesStatus = isDelegatesReady;
};

const getIndexStatus = async () => currentStatus.indexReadyStatus;

module.exports = {
	getReady,
	updateSvcStatus,
	getIndexStatus,
};
