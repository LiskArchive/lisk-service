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
const path = require('path');
const packageJson = require('../package.json');

const getBuildTimestamp = () => {
	let timestamp;
	try {
		// eslint-disable-next-line import/no-unresolved, import/no-dynamic-require
		timestamp = require(path.resolve(__dirname, '../build.json')).timestamp;
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
	let version;
	const networkStatistics = await broker.call('indexer.network.statistics');
	const { chainID } = await broker.call('connector.getNetworkStatus');

	if (Object.getOwnPropertyNames(networkStatistics.data.coreVer).length) {
		version = networkStatistics.data.coreVer;
	} else {
		version = networkStatistics.data.networkVersion;
	}
	const versionCount = Object.values(version);
	const networkNodeVersion = Object.keys(version)[
		versionCount.indexOf(Math.max(...versionCount))
	];
	return {
		build: buildTimestamp,
		description: 'Lisk Service Gateway',
		name: packageJson.name,
		version: packageJson.version,
		networkNodeVersion,
		chainID,
	};
};

module.exports = {
	getStatus,

	// For testing
	getBuildTimestamp,
};
