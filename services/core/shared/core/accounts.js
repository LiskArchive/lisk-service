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

	accounts.data.forEach(account => {
		if (
			!!Object.getOwnPropertyDescriptor(account, 'isDelegate') && !account.isDelegate
			|| account.delegate && !account.delegate.rank
		) {
			delete account.delegate;
			delete account.approval;
			delete account.missedBlocks;
			delete account.producedBlocks;
			delete account.productivity;
			delete account.rank;
			delete account.rewards;
			delete account.username;
			delete account.vote;
			delete account.isBanned;
			delete account.status;
			delete account.pomHeights;
			delete account.lastForgedHeight;
			delete account.consecutiveMissedBlocks;
		}
		return account;
	});

	return accounts;
};

module.exports = {
	getAccounts,
};
