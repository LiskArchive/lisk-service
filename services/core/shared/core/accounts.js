/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const Bluebird = require('bluebird');

const coreApi = require('./compat');
const { getDelegates } = require('./delegates');
const { parseToJSONCompatObj } = require('../jsonTools');

const getAccounts = async params => {
	const accounts = {
		data: [],
		meta: {},
	};
	const { status, ...remainingParams } = params;
	let response = await coreApi.getAccounts(remainingParams);
	if (status && ['active', 'banned', 'punished', 'standby'].some(item => status.includes(item))) {
		response = await getDelegates(params);
	}
	if (response.data) accounts.data = response.data;
	if (response.meta) accounts.meta = response.meta;

	accounts.data = await await Bluebird.map(
		accounts.data,
		async account => {
			if (account.isDelegate === true) {
				const delegate = await getDelegates({ address: account.address });
				const delegateOrigProps = parseToJSONCompatObj(account.delegate);
				const delegateExtraProps = parseToJSONCompatObj(delegate.data[0]);
				const delegateAccount = { ...account, delegate: { ...delegateOrigProps, ...delegateExtraProps } };
				return delegateAccount;
			} else {
				const {
					delegate, approval, missedBlocks, producedBlocks, productivity,
					rank, rewards, username, vote, isBanned, status, pomHeights,
					lastForgedHeight, consecutiveMissedBlocks,
					...nonDelegateAccount,
				} = account;
				return nonDelegateAccount;
			}
		},
		{ concurrency: accounts.data.length },
	);

	return accounts;
};

module.exports = {
	getAccounts,
};
