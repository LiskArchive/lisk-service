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
const coreApi = require('./compat');

const getAccounts = async params => {
	const accounts = {
		data: [],
		meta: {},
	};

	const response = await coreApi.getAccounts(params);
	if (response.data) accounts.data = response.data;
	if (response.meta) accounts.meta = response.meta;

	return accounts;
};

module.exports = {
	getAccounts,
};
