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
const semver = require('semver');
const pouchdb = require('../pouchdb');

const {
	getEpochUnixTime,
	getUnixTime,
	getBlockchainTime,
	validateTimestamp,
} = require('./compat');
const coreApi = require('./compat');
const { getCoreVersion, mapParams } = require('./compat/sdk_v2/coreVersionCompatibility');

const getSelector = (params) => {
	const result = {};

	const selector = {};
	if (params.height) selector.height = params.height;
	if (params.blockId) selector.id = params.blockId;
	if (params.fromTimestamp) selector.timestamp = { $gte: params.fromTimestamp };
	if (params.toTimestamp) selector.timestamp = { $lte: params.toTimestamp };
	result.selector = selector;

	if (params.limit) result.limit = params.limit;
	if (params.offset) result.skip = params.offset;

	return result;
};

const updateTransactionType = params => {
	let url;
	const transactionTypes = ['transfer', 'registerSecondPassphrase', 'registerDelegate', 'castVotes', 'registerMultisignature'];
	if (params.type === 'registerDelegate') url = '/delegates/latest_registrations';
	params.type = (typeof (params.type) === 'string' && transactionTypes.includes(params.type)) ? params.type.toUpperCase() : params.type;
	params = mapParams(params, url);

	// Check for backward compatibility
	const coreVersion = getCoreVersion();
	if (semver.lt(semver.coerce(coreVersion), '3.0.0') && params.type >= 8) params = mapParams(params, url);

	return params;
};

const getTransactions = async params => {
	await getEpochUnixTime(); // TODO: Remove, but make sure the epochtime is initiated here
	const db = await pouchdb('transactions');

	await Promise.all(['fromTimestamp', 'toTimestamp'].map(async timestamp => {
		if (await validateTimestamp(params[timestamp])) {
			params[timestamp] = await getBlockchainTime(params[timestamp]);
		}
		return Promise.resolve();
	}));

	let transactions = {
		data: [],
	};

	params = updateTransactionType(params);
	const inputData = getSelector(params);
	const dbResult = await db.find(inputData);
	if (dbResult.length > 0) transactions.data = dbResult;

	if (transactions.data.length === 0) {
		transactions = await coreApi.getTransactions(params);
		if (transactions.data.length > 0) {
			transactions.data.forEach((block) => {
				// drop confirmations
				db.writeOnce(block);
			});
		}
	}

	let result = [];
	if (transactions.data) {
		result = await Promise.all(
			transactions.data.map(async (o) => Object.assign(o, {
				unixTimestamp: await getUnixTime(o.timestamp),
			}),
			),
		);
	}

	transactions.data = result;
	transactions.meta = {
		limit: transactions.data.length,
		offset: inputData.offset,
		count: 0, // TODO: Update
	};
	return transactions;
};

module.exports = {
	getTransactions,
};
