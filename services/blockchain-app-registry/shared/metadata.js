/*
* LiskHQ/lisk-service
* Copyright © 2022 Lisk Foundation
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

const { MySQL: { getTableInstance } } = require('lisk-service-framework');

const config = require('../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const { normalizeRangeParam } = require('./utils/paramUtils');
const applicationsIndexSchema = require('./database/schema/applications');
const tokensIndexSchema = require('./database/schema/tokens');

const getApplicationsIndex = () => getTableInstance(
	applicationsIndexSchema.tableName,
	applicationsIndexSchema,
	MYSQL_ENDPOINT,
);

const getTokensIndex = () => getTableInstance(
	tokensIndexSchema.tableName,
	tokensIndexSchema,
	MYSQL_ENDPOINT,
);

const formatResponseEntriesForTokens = (arr) => {
	const map = new Map(arr.map(entry => [entry.chainName, {
		chainID: entry.chainID,
		chainName: entry.chainName,
		assets: [],
	}]));
	for (let i = 0; i < arr.length; i++) {
		map.get(arr[i].chainName).assets.push({
			description: arr[i].description,
			name: arr[i].name,
			symbol: arr[i].symbol,
			display: arr[i].display,
			base: arr[i].base,
			exponent: arr[i].exponent,
			logo: JSON.parse(arr[i].logo),
		});
	}
	return [...map.values()];
};

const getBlockchainAppsMetaList = async (params) => {
	const applicationsDB = await getApplicationsIndex();

	const blockchainAppsMetaList = {
		data: [],
		meta: {},
	};

	if (params.search) {
		const { search, ...remParams } = params;
		params = remParams;

		params.search = {
			property: 'chainName',
			pattern: search,
		};
	}

	const limit = params.limit * config.supportedNetworks.length;
	const defaultApps = await applicationsDB.find(
		{ ...params, limit, isDefault: true },
		['network', 'chainID', 'chainName'],
	);

	if (defaultApps.length < params.limit) {
		const nonDefaultApps = await applicationsDB.find(
			{ ...params, limit, isDefault: false },
			['network', 'chainID', 'chainName'],
		);

		blockchainAppsMetaList.data = defaultApps.concat(nonDefaultApps);
	}

	blockchainAppsMetaList.data = blockchainAppsMetaList.data
		.slice(params.offset, params.offset + params.limit);

	const total = await applicationsDB.count(params);

	blockchainAppsMetaList.meta = {
		count: blockchainAppsMetaList.data.length,
		offset: params.offset,
		total,
	};

	return blockchainAppsMetaList;
};

const getBlockchainAppsMetadata = async (params) => {
	const applicationsDB = await getApplicationsIndex();

	const blockchainAppsMetadata = {
		data: [],
		meta: {},
	};

	if (params.chainID && params.chainID.includes(':')) {
		params = normalizeRangeParam(params, 'chainID');
	}

	if (params.network) {
		const { network, ...remParams } = params;
		params = remParams;
		params.whereIn = {
			property: 'network',
			values: network.split(','),
		};
	}

	if (params.search) {
		const { search, ...remParams } = params;
		params = remParams;
		params.search = {
			property: 'name',
			pattern: search,
		};
	}

	const response = await applicationsDB.find(
		params,
		Object.getOwnPropertyNames(applicationsIndexSchema.schema),
	);

	blockchainAppsMetadata.data = await BluebirdPromise.map(
		response,
		async (appMetadata) => {
			appMetadata.apis = JSON.parse(appMetadata.apis);
			appMetadata.explorers = JSON.parse(appMetadata.explorers);
			appMetadata.logo = JSON.parse(appMetadata.logo);
			return appMetadata;
		},
		{ concurrency: response.length },
	);

	const total = await applicationsDB.count(params);

	blockchainAppsMetadata.meta = {
		count: blockchainAppsMetadata.data.length,
		offset: params.offset,
		total,
	};

	return blockchainAppsMetadata;
};

const getBlockchainAppsTokenMetadata = async (params) => {
	const tokensDB = await getTokensIndex();

	const blockchainAppsTokenMetadata = {
		data: [],
		meta: {},
	};

	if (params.chainID && params.chainID.includes(':')) {
		params = normalizeRangeParam(params, 'chainID');
	}

	if (params.name) {
		const { name, ...remParams } = params;
		params = remParams;
		params.chainName = name;
	}

	if (params.search) {
		const { search, ...remParams } = params;
		params = remParams;
		params.search = {
			property: 'chainName',
			pattern: search,
		};
	}

	const response = await tokensDB.find(
		params,
		Object.getOwnPropertyNames(tokensIndexSchema.schema),
	);

	blockchainAppsTokenMetadata.data = formatResponseEntriesForTokens(response);

	const total = await tokensDB.count(params);

	blockchainAppsTokenMetadata.meta = {
		count: blockchainAppsTokenMetadata.data.length,
		offset: params.offset,
		total,
	};

	return blockchainAppsTokenMetadata;
};

module.exports = {
	getBlockchainAppsMetaList,
	getBlockchainAppsMetadata,
	getBlockchainAppsTokenMetadata,
};
