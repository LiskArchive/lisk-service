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
	DB: {
		MySQL: {
			KVStore: {
				getKeyValueTable,
			},
		},
	},
} = require('lisk-service-framework');

const { KV_STORE_KEY } = require('../constants');

const keyValueTable = getKeyValueTable();

const getTotalLocked = async () => {
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
