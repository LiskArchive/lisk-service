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
const { Utils } = require('lisk-service-framework');

const { getTransactions } = require('./transactions');

const ObjectUtilService = Utils.Data;
const { isProperObject } = ObjectUtilService;

const isStringType = value => typeof value === 'string';
const parseAddress = address => isStringType(address) ? address.toUpperCase() : '';

const getIncomingTxsCount = async address => {
	const result = await getTransactions({
		recipientId: parseAddress(address),
		limit: 1,
	});
	if (!isProperObject(result)
        || !isProperObject(result.meta)
        || !Number.isInteger(result.meta.count)) {
		throw new Error('Could not retrieve incoming transaction count.');
	}

	return result.meta.total;
};

const getOutgoingTxsCount = async address => {
	const result = await getTransactions({
		senderId: parseAddress(address),
		limit: 1,
	});
	if (!isProperObject(result)
        || !isProperObject(result.meta)
        || !Number.isInteger(result.meta.count)) {
		throw new Error('Could not retrieve outgoing transaction count.');
	}

	return result.meta.total;
};

module.exports = {
	getIncomingTxsCount,
	getOutgoingTxsCount,
};
