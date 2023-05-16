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
	Queue,
} = require('lisk-service-framework');

const config = require('../../config');
const { MODULE } = require('../constants');
const { getTokenBalances } = require('../dataService');
const accountBalancesTableSchema = require('../database/schema/accountBalances');

const MYSQL_ENDPOINT = config.endpoints.mysql;
const getAccountBalancesTable = () => getTableInstance(
	accountBalancesTableSchema,
	MYSQL_ENDPOINT,
);

const updateAccountBalances = async (address) => {
	const accountBalancesTable = await getAccountBalancesTable();
	const { data: balanceInfos } = await getTokenBalances({ address });

	const updatedTokenBalances = balanceInfos.map(balanceInfo => ({
		address,
		tokenID: balanceInfo.tokenID,
		balance: balanceInfo.availableBalance,
	}));

	// Update all token balances of the address
	await accountBalancesTable.upsert(updatedTokenBalances);
};

const accountBalanceIndexProcessor = async job => updateAccountBalances(job.data.address);
const accountBalanceIndexQueue = Queue(
	config.endpoints.cache,
	config.queue.accountBalanceIndex.name,
	accountBalanceIndexProcessor,
	config.queue.accountBalanceIndex.concurrency,
);

const scheduleAccountBalanceUpdateFromEvents = async (events) => {
	await BluebirdPromise.map(
		events,
		async event => {
			// Skip non token module events
			if (event.module !== MODULE.TOKEN) return;

			const { data: eventData = {} } = event;
			const eventDataKeys = Object.keys(eventData);
			await BluebirdPromise.map(
				eventDataKeys,
				async key => {
					// Schedule account balance update for address related properties
					if (key.toLowerCase().includes('address')) {
						await accountBalanceIndexQueue.add({ address: eventData[key] });
					}
				},
				{ concurrency: eventDataKeys.length },
			);
		},
		{ concurrency: events.length },
	);
};

module.exports = {
	scheduleAccountBalanceUpdateFromEvents,
	updateAccountBalances,

	// For testing
	accountBalanceIndexQueue,
};
