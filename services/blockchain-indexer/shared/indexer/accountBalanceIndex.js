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
const Redis = require('ioredis');
const {
	DB: {
		MySQL: { getTableInstance },
	},
	Logger,
} = require('lisk-service-framework');

const config = require('../../config');
const { MODULE } = require('../constants');
const { getTokenBalances } = require('../dataService');
const accountBalancesTableSchema = require('../database/schema/accountBalances');

const logger = Logger();

const redis = new Redis(config.endpoints.cache);

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getAccountBalancesTable = () => getTableInstance(accountBalancesTableSchema, MYSQL_ENDPOINT);

const updateAccountBalances = async address => {
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

const scheduleAddressesBalanceUpdate = async addresses => {
	if (addresses.length) {
		redis.sadd(config.set.accountBalanceUpdate.name, addresses);
	}
};

const getAddressesFromTokenEvents = events => {
	const addressesToUpdate = [];
	const tokenModuleEvents = events.filter(event => event.module === MODULE.TOKEN);

	// eslint-disable-next-line no-restricted-syntax
	for (const event of tokenModuleEvents) {
		const { data: eventData = {} } = event;
		const eventDataKeys = Object.keys(eventData);
		// eslint-disable-next-line no-restricted-syntax
		for (const key of eventDataKeys) {
			if (key.toLowerCase().includes('address')) {
				const address = eventData[key];
				addressesToUpdate.push(address);
			}
		}
	}

	return addressesToUpdate;
};

const triggerAccountsBalanceUpdate = async () => {
	const addresses = await redis.spop(
		config.set.accountBalanceUpdate.name,
		config.set.accountBalanceUpdate.batchSize,
	);

	try {
		// eslint-disable-next-line no-restricted-syntax
		for (const address of addresses) {
			await updateAccountBalances(address);
		}
	} catch (err) {
		// Reschedule accounts balance update on error
		await scheduleAddressesBalanceUpdate(addresses);
	}

	if (addresses.length) {
		logger.info(`Updated account balance for ${addresses.length} account(s).`);
	}
};

module.exports = {
	updateAccountBalances,
	getAddressesFromTokenEvents,
	triggerAccountsBalanceUpdate,
	scheduleAddressesBalanceUpdate,
};
