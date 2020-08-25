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

// const gateway = `http://${config.host}:${config.port}/api/v1`;

const getBuildTimestamp = () => {
	let timestamp;
	try {
		// eslint-disable-next-line import/no-unresolved
		timestamp = require('../build.json').timestamp;
	} catch (e) {
		//  build.json is only generated in docker
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

const checkAPI = (url) => new Promise((resolve, reject) => {
	requestLib(`http://gateway:9901${url}`).then(body => {
		if (!body) resolve(false);
		try {
			if (body.status === 200) {
				return resolve(true);
			}
		} catch (err) {
			logger.error(err.stack);
			return reject(err);
		}
		return resolve(false);
	}).catch(err => {
		logger.error(err.stack);
		resolve({});
	});
});

const getReady = async () => ({
	services: {
		lisk_blocks: await checkAPI('/blocks'),
		lisk_transations: await checkAPI('/transactions'),
		lisk_transation_statistics: await checkAPI('/transactions/statistics/day'),
		lisk_accounts: await checkAPI('/accounts'),
		lisk_delegates: await checkAPI('/delegates'),
		lisk_peers: await checkAPI('/peers'),
	},
});

module.exports = {
	getReady,
	getStatus,
};
