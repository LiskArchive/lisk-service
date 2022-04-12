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
const BluebirdPromise = require('bluebird');

const dataService = require('./business');

const { getDelegates } = require('./delegates');
const { parseToJSONCompatObj } = require('../utils/parser');
const { getAccountKnowledge } = require('../utils/knownAccounts');

const getAccounts = async params => {
	const accounts = {
		data: [],
		meta: {},
	};
	const { status, ...remainingParams } = params;
	let response;
	if (status) {
		// Include delegate info in all accounts requests unless explicitly stated
		response = params.isDelegate !== false ? await getDelegates(params) : { data: [] };
	} else {
		response = await dataService.getAccounts(remainingParams);
	}
	if (response.data) accounts.data = response.data;
	if (response.meta) accounts.meta = response.meta;

	accounts.data = await BluebirdPromise.map(
		accounts.data,
		async account => {
			account.multisignatureGroups = await dataService.getMultisignatureGroups(account);
			account.multisignatureMemberships = await dataService.getMultisignatureMemberships(account);
			account.knowledge = await getAccountKnowledge(account.address);

			if (account.isDelegate === true) {
				const delegate = await getDelegates({ address: account.address });
				const delegateOrigProps = account.delegate;
				const [delegateExtraProps = {}] = delegate.data;
				const delegateAccount = {
					...account,
					rank: delegateExtraProps.rank,
					status: delegateExtraProps.status,
					delegate: { ...delegateOrigProps, ...delegateExtraProps },
				};
				return delegateAccount;
			}
			const {
				delegate, approval, missedBlocks, producedBlocks, productivity,
				rank, rewards, username, vote, isBanned, status: _status, pomHeights,
				lastForgedHeight, consecutiveMissedBlocks,
				...nonDelegateAccount
			} = account;
			return nonDelegateAccount;
		},
		{ concurrency: accounts.data.length },
	);

	return parseToJSONCompatObj(accounts);
};

module.exports = {
	getAccounts,
};
