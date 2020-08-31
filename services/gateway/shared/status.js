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

const getStatus = () => ({
	build: buildTimestamp,
	description: 'Lisk Service Gateway',
	name: packageJson.name,
	version: packageJson.version,
	network: {
		networkId: 'unknown',
		protocolVersion: 'unknown',
	},
});

const checkAPI = (url, dataCheck) => new Promise((resolve, reject) => {
		requestLib(`http://127.0.0.1:${config.port}/api/v1${url}`)
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

const getReady = async () => ({
	services: {
		lisk_blocks: await checkAPI('/blocks', true),
		lisk_transactions: await checkAPI('/transactions', true),
		lisk_transaction_statistics: await checkAPI('/transactions/statistics/day', false),
		lisk_accounts: await checkAPI('/accounts', true),
		lisk_delegates: await checkAPI('/delegates', true),
		lisk_peers: await checkAPI('/peers', true),
	},
});

module.exports = {
	getReady,
	getStatus,
};
