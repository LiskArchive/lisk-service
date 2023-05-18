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
const BluebirdPromise = require('bluebird');

const {
	MySQLKVStore: {
		getKeyValueTable,
	},
} = require('lisk-service-framework');

const { KV_STORE_KEY } = require('../constants');
const config = require('../../config')

const MYSQL_ENDPOINT = config.endpoints.mysql;
const getKeyValueTableInstance = () => getKeyValueTable(config.kvStoreTableName, MYSQL_ENDPOINT);

const updateTotalLockedAmounts = async (tokenIDLockedAmountChangeMap, dbTrx) => BluebirdPromise.map(
	Object.entries(tokenIDLockedAmountChangeMap),
	async ([tokenID, lockedAmountChange]) => {
		const keyValueTable = await getKeyValueTableInstance();

		const tokenKey = KV_STORE_KEY.PREFIX.TOTAL_LOCKED.concat(tokenID);
		const curLockedAmount = BigInt(await keyValueTable.get(tokenKey) || 0);
		const newLockedAmount = curLockedAmount + lockedAmountChange;

		await keyValueTable.set(tokenKey, newLockedAmount, dbTrx);
	},
	{ concurrency: Object.entries(tokenIDLockedAmountChangeMap).length },
);

module.exports = {
	updateTotalLockedAmounts,
};
