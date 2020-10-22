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
const coreApi = require('./coreApi');
const {
	getUnixTime,
	getBlockchainTime,
	validateTimestamp,
} = require('../common');

const getTransactions = async params => {
	await Promise.all(['fromTimestamp', 'toTimestamp'].map(async (timestamp) => {
		if (await validateTimestamp(params[timestamp])) {
			params[timestamp] = await getBlockchainTime(params[timestamp]);
		}
		return Promise.resolve();
	}),
	);

	const transactions = await coreApi.getTransactions(params);

	if (transactions.data) {
		await Promise.all(transactions.data.map(async (o) => Object.assign(o, {
			unixTimestamp: await getUnixTime(o.timestamp),
		}),
		));
	}

	return transactions;
};

module.exports = { getTransactions };

// const updateTransactionType = params => {
// 	let url;
// 	const transactionTypes = [
// 		'transfer',
// 		'registerSecondPassphrase',
// 		'registerDelegate',
// 		'castVotes',
// 		'registerMultisignature',
// 	];
// 	if (params.type === 'registerDelegate') url = '/delegates/latest_registrations';
// 	params.type = (typeof (params.type) === 'string' && transactionTypes.includes(params.type))
// 		? params.type.toUpperCase() : params.type;
// 	params = mapParams(params, url);

// 	return params;
// };
// params = updateTransactionType(params);

// =============================================================================

// const recentBlocksCache = require('../../helpers/recentBlocksCache');
// const getTransactions = async params => {

// 	params = updateTransactionType(params);
// 	const transactions = await recentBlocksCache.getCachedTransactions(params)
// 		|| await coreApi.getTransactions(params);

// 	if (transactions.data) {
// 		await Promise.all(transactions.data.map(async o => (Object.assign(o, {
// 			unixTimestamp: await getUnixTime(o.timestamp),
// 		}))));
// 	}

// 	return transactions;
// };
