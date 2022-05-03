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
const { Utils } = require('lisk-service-framework');
const {
	getIndexedAccountInfo,
	getBase32AddressFromHex,
} = require('../../utils/accountUtils');

const { requestConnector } = require('../../utils/request');

const ObjectUtilService = Utils.Data;
const { isProperObject } = ObjectUtilService;

const getForgers = async () => {
	const forgers = await requestConnector('getForgers');
	forgers.data = forgers
		.map(forger => ({
			...forger,
			address: getBase32AddressFromHex(forger.address),
		}));

	forgers.data = await BluebirdPromise.map(
		forgers.data,
		async forger => {
			const account = await getIndexedAccountInfo(
				{ address: forger.address, limit: 1 },
				['address', 'username', 'totalVotesReceived']);
			forger.username = account && account.username
				? account.username
				: null;
			forger.totalVotesReceived = account && account.totalVotesReceived
				? Number(account.totalVotesReceived)
				: null;
			return forger;
		},
		{ concurrency: forgers.data.length },
	);
	return isProperObject(forgers) && Array.isArray(forgers.data) ? forgers.data : [];
};

module.exports = {
	getForgers,
};
