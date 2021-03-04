/*
 * LiskHQ/lisk-service
 * Copyright © 2019-2020 Lisk Foundation
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
const { HTTP, Logger } = require('lisk-service-framework');
const packageJson = require('../package.json');

const logger = Logger('CustomAPI');
const requestLib = HTTP.request;
const config = require('../config.js');
const waitForIt = require('./waitForIt');

const svcStatus = {
	lisk_blocks: false,
	lisk_transactions: false,
	lisk_accounts: false,
	// lisk_delegates: false,
	// lisk_peers: false,
};

const getBuildTimestamp = () => {
	let timestamp;
	try {
		// eslint-disable-next-line import/no-unresolved
		timestamp = require('../build.json').timestamp;
	} catch (e) {
		// build.json is only generated in docker
	}
	if (!timestamp) {
		timestamp = new Date().toISOString();
	}
	return timestamp;
};

const buildTimestamp = getBuildTimestamp();

const getStatus = async broker => {
	const networkstatus = await broker.call('core.network.status');
	const networkStatistics = await broker.call('core.peers.statistics');
	const { coreVer } = networkStatistics.data;
	const versionCount = Object.values(coreVer);
	const networkNodeVersion = Object.keys(coreVer)[
		versionCount.indexOf(Math.max(...versionCount))
	];
	return {
		build: buildTimestamp,
		description: 'Lisk Service Gateway',
		name: packageJson.name,
		version: packageJson.version,
		networkId: networkstatus.data.constants.nethash,
		networkNodeVersion,
	};
};

const checkAPI = (url, dataCheck) => new Promise((resolve, reject) => {
	requestLib(`http://127.0.0.1:${config.port}/api/v2${url}`)
		.then((response) => {
			try {
				if (!response) resolve(false);
				else if (response.status === 200) {
					if (dataCheck === true) {
						if (response.data.data.length > 0) {
							return resolve(true);
						}
						return resolve(false);
					}
					return resolve(true);
				}
			} catch (err) {
				logger.error(err.stack);
				return reject(err);
			}
			return resolve(false);
		})
		.catch((err) => {
			logger.error(err.stack);
			resolve({});
		});
});

const getReady = () => {
	/* eslint-disable camelcase */
	const {
		lisk_blocks,
		lisk_transactions,
		lisk_accounts,
		// lisk_delegates,
		// lisk_peers,
	} = svcStatus;

	return {
		services: {
			lisk_blocks,
			lisk_transactions,
			lisk_accounts,
			// lisk_delegates,
			// lisk_peers,
		},
	};
};

const checkApiMapBoolean = (url, prop) => new Promise((resolve, reject) => {
	checkAPI(url, true).then(resp => {
		if (resp === true) {
			svcStatus[prop] = true;
			resolve(true);
		} else {
			reject();
		}
	});
});

// TODO: Readiness should be reported based on microservice calls
//       instead of HTTP
const init = () => {
	waitForIt(() => checkApiMapBoolean('/blocks', 'lisk_blocks'), 1500);
	waitForIt(() => checkApiMapBoolean('/transactions', 'lisk_transactions'), 1500);
	waitForIt(() => checkApiMapBoolean('/accounts', 'lisk_accounts'), 1500);
	// waitForIt(() => checkApiMapBoolean('/delegates', 'lisk_delegates'), 1500);
	// waitForIt(() => checkApiMapBoolean('/peers', 'lisk_peers'), 1500);
};

module.exports = {
	updateServiceStatus: init,
	getReady,
	getStatus,
};
