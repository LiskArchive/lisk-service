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
const { getTokenModuleUserSubStoreInfo } = require('./genesisBlock');
const accountBalancesTableSchema = require('../database/schema/accountBalances');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getAccountBalancesTable = () => getTableInstance(
	accountBalancesTableSchema.tableName,
	accountBalancesTableSchema,
	MYSQL_ENDPOINT,
);

const updateAccountBalances = async (job) => {
	const { address } = job.data;

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

const accountBalanceIndexQueue = Queue(config.endpoints.cache, 'accountBalanceIndexQueue', updateAccountBalances, 1);

const scheduleAccountBalanceUpdateFromEvents = async (events) => {
	const tokenModuleEvents = events.filter(event => event.module === MODULE.TOKEN);

	await BluebirdPromise.map(
		tokenModuleEvents,
		async event => {
			const { data: eventData = [] } = event;
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

const scheduleGenesisBlockAccountsBalanceUpdate = async () => {
	const usersSubStoreInfo = await getTokenModuleUserSubStoreInfo();

	await BluebirdPromise.map(
		usersSubStoreInfo,
		async userInfo => accountBalanceIndexQueue.add({ address: userInfo.address }),
		{ concurrency: usersSubStoreInfo.length },
	);
};

module.exports = {
	scheduleAccountBalanceUpdateFromEvents,
	scheduleGenesisBlockAccountsBalanceUpdate,
};
