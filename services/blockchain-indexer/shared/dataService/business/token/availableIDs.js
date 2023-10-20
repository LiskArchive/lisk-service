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
const {
	DB: {
		MySQL: { getTableInstance },
	},
} = require('lisk-service-framework');

const config = require('../../../../config');
const accountBalancesTableSchema = require('../../../database/schema/accountBalances');

const MYSQL_ENDPOINT = config.endpoints.mysqlReplica;

const getAccountBalancesTable = () => getTableInstance(accountBalancesTableSchema, MYSQL_ENDPOINT);

const getAvailableTokenIDs = async (params) => {
	const response = {
		data: {},
		meta: {},
	};
	const accountBalancesTable = await getAccountBalancesTable();

	const tokenInfos = await accountBalancesTable.find(
		{ ...params, distinct: 'tokenID' },
		['tokenID'],
	);

	response.data.tokenIDs = tokenInfos.map(tokenInfo => tokenInfo.tokenID);
	response.meta = {
		count: response.data.tokenIDs.length,
		offset: params.offset,
		total: await accountBalancesTable.count({ distinct: 'tokenID' }),
	};

	return response;
};

module.exports = {
	getAvailableTokenIDs,
};
