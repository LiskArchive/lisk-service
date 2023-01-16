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
const { getPosTokenID } = require('../dataService/business/pos/constants');

const keyValueTable = require('../database/mysqlKVStore');

const { KV_STORE_KEY } = require('../constants');

const getStakeInfo = async (keyPrefix) => {
	const [row] = await keyValueTable.getByPattern(keyPrefix);
	const stakeAmount = row && row.value ? row.value.toString() : null;

	return {
		tokenID: await getPosTokenID(),
		amount: stakeAmount,
	};
};

const getTotalStaked = async () => getStakeInfo(KV_STORE_KEY.PREFIX.TOTAL_STAKED);

const getTotalSelfStaked = async () => getStakeInfo(KV_STORE_KEY.PREFIX.TOTAL_SELF_STAKED);

module.exports = {
	getTotalStaked,
	getTotalSelfStaked,
};
