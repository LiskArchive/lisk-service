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
const { requestConnector } = require('../../utils/request');

const keyValueTable = require('../../database/mysqlKVStore');

const { getPosTokenID } = require('./pos/constants');

const getTotalStaked = async () => {
	const result = await keyValueTable.getPattern(
		keyValueTable.KEYS.TOTAL_STAKED_PREFIX,
	);
	const [row] = result;
	const { value: totalStaked } = row;

	return {
		amount: totalStaked.toString(),
		tokenID: await getPosTokenID(),
	};
};

const getTotalLocked = async () => {
	const lockAmountsInfo = await keyValueTable.getPattern(
		keyValueTable.KEYS.TOTAL_LOCKED_PREFIX,
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

const getPeersStatistics = async () => {
	const response = await requestConnector('getPeersStatistics');
	response.totalLocked = await getTotalLocked();
	response.totalStaked = await getTotalStaked();
	return {
		data: response,
		meta: {},
	};
};

module.exports = {
	getPeersStatistics,
};
