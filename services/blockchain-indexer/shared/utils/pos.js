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
const { getPosTokenID } = require('../dataService/business/pos/constants');

const keyValueTable = require('../database/mysqlKVStore');

const { KEY_VALUE_TABLE_KEYS } = require('../constants');

const getTotalStaked = async () => {
	const result = await keyValueTable.getPattern(
		KEY_VALUE_TABLE_KEYS.TOTAL_STAKED_PREFIX,
	);
	const [row] = result;

	let totalStaked = null;
	if (row && row.value) totalStaked = row.value.toString();

	return {
		amount: totalStaked,
		tokenID: await getPosTokenID(),
	};
};

module.exports = {
	getTotalStaked,
};
