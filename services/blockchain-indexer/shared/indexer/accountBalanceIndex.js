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
	accountBalancesTableSchema.tableName,
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
const accountBalanceIndexQueue = Queue(config.endpoints.cache, 'accountBalanceIndexQueue', accountBalanceIndexProcessor, 1);

const scheduleAccountBalanceUpdateFromEvents = async (events) => {
	const tokenModuleEvents = events.filter(event => event.module === MODULE.TOKEN);

	await BluebirdPromise.map(
		tokenModuleEvents,
		async event => {
			const { data: eventData = {} } = event;
			const addressKeys = Object.keys(eventData).filter(eventDataKey => eventDataKey.toLowerCase().includes('address'));

			await BluebirdPromise.map(
				addressKeys,
				async addressKey => {
					await accountBalanceIndexQueue.add({ address: eventData[addressKey] });
				},
				{ concurrency: addressKeys.length },
			);
		},
		{ concurrency: tokenModuleEvents.length },
	);
};

module.exports = {
	scheduleAccountBalanceUpdateFromEvents,
	updateAccountBalances,

	// For testing
	accountBalanceIndexQueue,
};
