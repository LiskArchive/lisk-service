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
const { Logger } = require('lisk-service-framework');

const logger = Logger();
let topAccounts = [];

const retrieveTopAccounts = async (core, accounts = []) => {
	const limit = 500;
	const response = await core.getAccounts({
		limit: limit > 100 ? 100 : limit,
		offset: accounts.length,
		sort: 'balance:desc',
	});
	accounts = [...accounts, ...response.data];

	if (accounts.length < limit) {
		retrieveTopAccounts(core, accounts);
	} else {
		topAccounts = accounts;
		logger.info(`Updated accounts cache with ${topAccounts.length} accounts.`);
	}
};

const get = () => new Promise((resolve) => {
		resolve(topAccounts);
	});

const reloadAccounts = async (core) => retrieveTopAccounts(core);

module.exports = {
	reloadAccounts,
	get,
};
