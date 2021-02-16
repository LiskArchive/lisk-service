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
const { getAccounts, getBase32AddressFromHex } = require('./accounts');

const coreApi = require('./coreApi');

const ObjectUtilService = Utils.Data;
const { isProperObject } = ObjectUtilService;

const getForgers = async params => {
	const forgers = await coreApi.getForgers(params);
	forgers.data = forgers.data.map(forger => getBase32AddressFromHex(forger.address));
	const forgerAddresses = forgers.data.map(forger => forger.address);
	const forgerAccounts = await getAccounts({
		addresses: forgerAddresses,
		limit: forgerAddresses.length,
	});
	forgers.data = forgers.data.map(forger => {
		const filteredAcc = forgerAccounts.data.filter(account => account.address === forger.address);
		forger.username = filteredAcc[0].dpos.delegate.username;
		forger.totalVotesReceived = Number(filteredAcc[0].dpos.delegate.totalVotesReceived);
		return forger;
	});
	return isProperObject(forgers) && Array.isArray(forgers.data) ? forgers : [];
};

module.exports = {
	getForgers,
};
