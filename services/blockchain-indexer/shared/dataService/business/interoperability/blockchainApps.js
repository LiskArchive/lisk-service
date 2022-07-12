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

const config = require('../../../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const blockchainAppsIndexSchema = require('../../../database/schema/blockchainApps');

const getBlockchainAppsIndex = () => getTableInstance('blockchain_apps', blockchainAppsIndexSchema, MYSQL_ENDPOINT);

const getBlockchainApps = async (params) => {
	// TODO: Update implementation when interoperability_getOwnChainAccount is available
	const blockchainAppsDB = await getBlockchainAppsIndex();

	const blockchainAppsInfo = {
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

	const total = await blockchainAppsDB.count(params);

	const response = await blockchainAppsDB.find(
		{ ...params, limit: params.limit || total },
		Object.getOwnPropertyNames(blockchainAppsIndexSchema.schema),
	);

	blockchainAppsInfo.data = await BluebirdPromise.map(
		response,
		async (entry) => {
			if (!entry.isDefault) {
				const isDefault = !!config.defaultApps.some(e => e.includes(entry.name));

				const blockchainAppInfo = {
					...entry,
					isDefault,
				};

				if (isDefault) await blockchainAppsDB.upsert(blockchainAppInfo);
				return blockchainAppInfo;
			}
			return entry;
		},
		{ concurrency: response.length },
	);

	blockchainAppsInfo.data = !params.isDefault
		? blockchainAppsInfo.data.sort((a, b) => b.isDefault - a.isDefault)
		: blockchainAppsInfo.data;

	blockchainAppsInfo.meta = {
		count: blockchainAppsInfo.data.length,
		offset: params.offset,
		total,
	};

	return blockchainAppsInfo;
};

module.exports = {
	getBlockchainApps,
};
