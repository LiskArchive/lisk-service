/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
	CacheRedis,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const config = require('../../config');
const accountsTableSchema = require('../database/schema/accounts');

const MYSQL_ENDPOINT = config.endpoints.mysqlPrimary;

const validatorCache = CacheRedis('validator', config.endpoints.cache);

const getAccountsTable = () => getTableInstance(accountsTableSchema, MYSQL_ENDPOINT);

const getNameByAddress = async (address) => {
	if (address) {
		const name = await validatorCache.get(address);
		if (name) {
			// Update the account index with the name asynchronously
			const accountsTable = await getAccountsTable();
			accountsTable.upsert({ address, name });

			return name;
		}
	}
	return null;
};

module.exports = {
	getNameByAddress,
};
