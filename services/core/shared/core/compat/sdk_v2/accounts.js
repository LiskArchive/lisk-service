/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
const coreApi = require('./coreApi');

const getAccounts = async params => {
	const requestParams = {
		limit: params.limit,
		offset: params.offset,
		sort: params.sort,
		username: params.username,
	};

	const result = await coreApi.getAccounts(requestParams);
	return result;
};


module.exports = { getAccounts };
