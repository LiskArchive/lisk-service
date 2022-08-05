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
const { MySQL: { getTableInstance } } = require('lisk-service-framework');

const config = require('../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const applicationsIndexSchema = require('./database/schema/applications');

const getApplicationsIndex = () => getTableInstance(
	applicationsIndexSchema.tableName,
	applicationsIndexSchema,
	MYSQL_ENDPOINT,
);

const formatResponseEntries = (arr) => {
	const map = new Map(arr.map(entry => [entry.name, { name: entry.name, networks: [] }]));
	for (let i = 0; i < arr.length; i++) {
		map.get(arr[i].name).networks.push({ network: arr[i].network, chainID: arr[i].chainID });
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
			property: 'name',
			pattern: search,
		};
	}

	const limit = params.limit * config.numOfNetworksSupported.length;

	const defaultApps = await applicationsDB.find(
		{
			...params,
			isDefault: true,
			limit,
		},
		['name', 'chainID', 'network'],
	);

	blockchainAppsMetaList.data = formatResponseEntries(defaultApps);

	if (blockchainAppsMetaList.data.length < params.limit) {
		const nonDefaultApps = await applicationsDB.find(
			{
				...params,
				isDefault: false,
				limit,
			},
			['name', 'chainID', 'network'],
		);

		blockchainAppsMetaList.data = blockchainAppsMetaList.data
			.concat(formatResponseEntries(nonDefaultApps));
	}

	blockchainAppsMetaList.data = blockchainAppsMetaList.data
		.slice(params.offset, params.offset + params.limit);

	const [{ count: total }] = await applicationsDB.rawQuery('SELECT COUNT(DISTINCT(name)) as count from applications');

	blockchainAppsMetaList.meta = {
		count: blockchainAppsMetaList.data.length,
		offset: params.offset,
		total,
	};

	return blockchainAppsMetaList;
};

module.exports = {
	getBlockchainAppsMetaList,
};
