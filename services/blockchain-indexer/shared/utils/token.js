/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
	MySQLKVStore: {
		getKeyValueTable,
	},
} = require('lisk-service-framework');

const { KV_STORE_KEY } = require('../constants');
const config = require('../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;
const getKeyValueTableInstance = () => getKeyValueTable(config.kvStoreTableName, MYSQL_ENDPOINT);

const getTotalLocked = async () => {
	const keyValueTable = await getKeyValueTableInstance();
	const lockAmountsInfo = await keyValueTable.getByPattern(
		KV_STORE_KEY.PREFIX.TOTAL_LOCKED,
	);

	const totalLockedResponse = lockAmountsInfo.map(({ key, value }) => {
		const tokenID = key.split(KV_STORE_KEY.PREFIX.TOTAL_LOCKED).pop();
		return {
			tokenID,
			amount: value.toString(),
		};
	});

	return totalLockedResponse;
};

module.exports = {
	getTotalLocked,
};
