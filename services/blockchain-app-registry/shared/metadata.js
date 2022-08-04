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

const applicationsIndexSchema = require('./database/schema/applications');
const { normalizeRangeParam } = require('./utils/paramUtils');

const getApplicationsIndex = () => getTableInstance(
	applicationsIndexSchema.tableName,
	applicationsIndexSchema,
	MYSQL_ENDPOINT,
);

const getBlockchainAppsMetaList = async (params) => {
	const applicationsDB = await getApplicationsIndex();

	const blockchainAppsMetaList = {
		data: [],
		meta: {},
	};

	if (params.chainID && params.chainID.includes(':')) {
		params = normalizeRangeParam(params, 'chainID');
	}

	if (params.search) {
		const { search, ...remParams } = params;
		params = remParams;

		params.search = {
			property: 'name',
			pattern: search,
		};
	}

	// const total = await applicationsDB.count(params);

	// const response = await applicationsDB.find(
	// 	params,
	// 	Object.getOwnPropertyNames(applicationsIndexSchema.schema),
	// );

	return blockchainAppsMetaList;
};

module.exports = {
	getBlockchainAppsMetaList,
};
