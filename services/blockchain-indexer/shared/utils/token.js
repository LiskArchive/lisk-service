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
const keyValueTable = require('../database/mysqlKVStore');

const { KEY_VALUE_TABLE_KEYS } = require('../constants');

const getTotalLocked = async () => {
	const lockAmountsInfo = await keyValueTable.getPattern(
		KEY_VALUE_TABLE_KEYS.TOTAL_LOCKED_PREFIX,
	);

	const totalLockedResponse = lockAmountsInfo.map(({ key, value }) => {
		const tokenID = key.split('_').pop();
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
