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
const accountBalancesTableSchema = require('../database/schema/accountBalances');

const { MODULE } = require('../constants');
const { getTokenBalances } = require('../dataService');

const logger = Logger();

const redis = new Redis(config.endpoints.cache);

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getAccountBalancesTable = () => getTableInstance(accountBalancesTableSchema, MYSQL_ENDPOINT);

const updateAccountBalances = async addressTokenID => {
	const accountBalancesTable = await getAccountBalancesTable();
	const [address, cTokenID] = addressTokenID.split('_');
	const params = cTokenID ? { address, tokenID: cTokenID } : { address };
	const { data: balanceInfos } = await getTokenBalances(params);

	const updatedTokenBalances = balanceInfos.map(balanceInfo => {
		const { tokenID, availableBalance, lockedBalances } = balanceInfo;
		const totalLockedBalance = lockedBalances.reduce(
			(acc, entry) => BigInt(acc) + BigInt(entry.amount),
			BigInt('0'),
		);

		return {
			address,
			tokenID,
			balance: BigInt(availableBalance) + BigInt(totalLockedBalance),
		};
	});

	// Update all token balances of the address
	await accountBalancesTable.upsert(updatedTokenBalances);
};

const scheduleAddressesBalanceUpdate = async addressTokens => {
	if (addressTokens.length) {
		redis.sadd(config.set.accountBalanceUpdate.name, addressTokens);
	}
};

const getAddressesFromTokenEvents = async events => {
	const addressTokensToUpdate = [];
	const tokenModuleEvents = events.filter(event => event.module === MODULE.TOKEN);

	// eslint-disable-next-line no-restricted-syntax
	for (const event of tokenModuleEvents) {
		const { data: eventData = {} } = event;
		const eventDataKeys = Object.keys(eventData);
		// eslint-disable-next-line no-restricted-syntax
		for (const key of eventDataKeys) {
			if (key.toLowerCase().includes('address')) {
				const address = eventData[key];
				const tokenID = eventData.tokenID || eventData.messageFeeTokenID;
				if (tokenID) {
					addressTokensToUpdate.push(`${address}_${tokenID}`);
				} else {
					addressTokensToUpdate.push(address);
				}
			}
		}
	}

	return addressTokensToUpdate;
};

const triggerAccountsBalanceUpdate = async () => {
	const addressTokenEntries = await redis.spop(
		config.set.accountBalanceUpdate.name,
		config.set.accountBalanceUpdate.batchSize,
	);

	const numAddressesScheduled = addressTokenEntries.length;
	try {
		// eslint-disable-next-line no-restricted-syntax
		while (addressTokenEntries.length) {
			const addressToken = addressTokenEntries.shift();
			await updateAccountBalances(addressToken).catch(err => {
				addressTokenEntries.push(addressToken);
				throw err;
			});
		}
		logger.info(`Successfully updated account balances for ${numAddressesScheduled} account(s).`);
	} catch (err) {
		// Reschedule accounts balance update on error for remaining addresses
		await scheduleAddressesBalanceUpdate(addressTokenEntries);

		const numPending = addressTokenEntries.length;
		const numSuccess = numAddressesScheduled - numPending;
		logger.info(
			`Successfully updated account balances for ${numSuccess} account(s). Rescheduling updates for ${numPending} account(s).`,
		);
	}
};

module.exports = {
	updateAccountBalances,
	getAddressesFromTokenEvents,
	triggerAccountsBalanceUpdate,
	scheduleAddressesBalanceUpdate,
};
