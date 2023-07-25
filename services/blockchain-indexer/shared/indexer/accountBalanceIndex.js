/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
const {
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const config = require('../../config');
const { MODULE } = require('../constants');
const { getTokenBalances } = require('../dataService');
const accountBalancesTableSchema = require('../database/schema/accountBalances');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getAccountBalancesTable = () => getTableInstance(accountBalancesTableSchema, MYSQL_ENDPOINT);

const updateAccountBalances = async (address, dbTrx = null) => {
	const accountBalancesTable = await getAccountBalancesTable();
	const { data: balanceInfos } = await getTokenBalances({ address });

	const updatedTokenBalances = balanceInfos.map(balanceInfo => ({
		address,
		tokenID: balanceInfo.tokenID,
		balance: balanceInfo.availableBalance,
	}));

	// Update all token balances of the address
	await accountBalancesTable.upsert(updatedTokenBalances, dbTrx);
};

const updateAccountBalancesFromTokenEvents = async (events, dbTrx = null) => BluebirdPromise.map(
	events,
	async event => {
		// Skip non token module events
		if (event.module !== MODULE.TOKEN) return;

		const { data: eventData = {} } = event;
		const eventDataKeys = Object.keys(eventData);
		await BluebirdPromise.map(
			eventDataKeys,
			async key => {
				if (key.toLowerCase().includes('address')) {
					const address = eventData[key];
					await updateAccountBalances(address, dbTrx);
				}
			},
			{ concurrency: eventDataKeys.length },
		);
	},
	{ concurrency: events.length },
);

module.exports = {
	updateAccountBalances,
	updateAccountBalancesFromTokenEvents,
};
