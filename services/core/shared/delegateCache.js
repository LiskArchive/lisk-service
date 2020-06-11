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

let delegates = [];

const loadAllDelegates = async (core, delegateList = []) => {
	const limit = 100;
	const response = await core.get('/delegates', { limit, offset: delegateList.length /* , sort: 'rank:asc' */ });
	delegateList = [...delegateList, ...response.data];
	if (delegateList.length >= delegates.length) {
	// this condition should speed up initial load but not break things on rounds/change
		delegates = delegateList;
	}
	if (response.data.length === limit) {
		loadAllDelegates(core, delegateList);
	} else {
		logger.info(`Initialized  with ${delegates.length} delegates`);
	}
};

const init = core => {
	loadAllDelegates(core);
};


const getDelegateRankByUsername = username => (
	delegates.findIndex(delegate => delegate.username === username) + 1
);

const getTotalNumberOfDelegates = (params = {}) => {
	const relevantDelegates = delegates.filter(delegate => (
		(!params.search || delegate.username.includes(params.search))
		&& (!params.username || delegate.username === params.username)
		&& (!params.address || delegate.account.address === params.address)
		&& (!params.publickey || delegate.account.publicKey === params.publickey)
		&& (!params.secpubkey || delegate.account.secondPublicKey === params.secpubkey)
	));
	return relevantDelegates.length;
};

module.exports = {
	init,
	getDelegateRankByUsername,
	getTotalNumberOfDelegates,
};
