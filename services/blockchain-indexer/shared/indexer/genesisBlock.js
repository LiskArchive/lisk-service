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
	DB: {
		MySQL: { getTableInstance },
	},
	Logger,
} = require('lisk-service-framework');

const { MODULE, MODULE_SUB_STORE, getGenesisHeight } = require('../constants');
const { updateTotalStake, updateTotalSelfStake } = require('./transactionProcessor/pos/stake');
const { indexAccountPublicKey, triggerAccountUpdates } = require('./accountIndex');
const { updateTotalLockedAmounts } = require('./utils/blockchainIndex');

const requestAll = require('../utils/requestAll');
const config = require('../../config');
const accountsTableSchema = require('../database/schema/accounts');
const accountBalancesTableSchema = require('../database/schema/accountBalances');
const stakesTableSchema = require('../database/schema/stakes');
const commissionsTableSchema = require('../database/schema/commissions');

const { getLisk32AddressFromPublicKey } = require('../utils/account');
const { requestConnector } = require('../utils/request');
const { INVALID_ED25519_KEY } = require('../constants');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getStakesTable = () => getTableInstance(stakesTableSchema, MYSQL_ENDPOINT);
const getAccountsTable = () => getTableInstance(accountsTableSchema, MYSQL_ENDPOINT);
const getAccountBalancesTable = () => getTableInstance(accountBalancesTableSchema, MYSQL_ENDPOINT);
const getCommissionsTable = () => getTableInstance(commissionsTableSchema, MYSQL_ENDPOINT);

let intervalTimeout;
const genesisAccountBalances = [];

const getGenesisAssetIntervalTimeout = () => intervalTimeout;

const indexTokenModuleAssets = async dbTrx => {
	logger.info('Starting to index the genesis assets from the Token module.');
	const genesisBlockAssetsLength = await requestConnector('getGenesisAssetsLength', {
		module: MODULE.TOKEN,
		subStore: MODULE_SUB_STORE.TOKEN.USER,
	});
	const totalUsers = genesisBlockAssetsLength[MODULE.TOKEN][MODULE_SUB_STORE.TOKEN.USER];
	const tokenModuleData = await requestAll(
		requestConnector,
		'getGenesisAssetByModule',
		{ module: MODULE.TOKEN, subStore: MODULE_SUB_STORE.TOKEN.USER, limit: 1000 },
		totalUsers,
	);
	const userSubStoreInfos = tokenModuleData[MODULE_SUB_STORE.TOKEN.USER];
	const tokenIDLockedAmountChangeMap = {};

	// eslint-disable-next-line no-restricted-syntax
	for (const userInfo of userSubStoreInfos) {
		const { address, availableBalance: balance, tokenID } = userInfo;

		// Add entry to index the genesis account balances
		const accountBalanceEntry = { address, tokenID, balance };
		genesisAccountBalances.push(accountBalanceEntry);

		// eslint-disable-next-line no-restricted-syntax
		for (const lockedBalance of userInfo.lockedBalances) {
			if (!tokenIDLockedAmountChangeMap[tokenID]) {
				tokenIDLockedAmountChangeMap[tokenID] = BigInt(0);
			}
			tokenIDLockedAmountChangeMap[tokenID] += BigInt(lockedBalance.amount);
		}
	}

	await updateTotalLockedAmounts(tokenIDLockedAmountChangeMap, dbTrx);
	logger.info('Finished indexing all the genesis assets from the Token module.');
};

const isGeneratorKeyValid = generatorKey => generatorKey !== INVALID_ED25519_KEY;

const indexPosValidatorsInfo = async (numValidators, dbTrx) => {
	logger.debug('Starting to index the validators information from the genesis PoS module assets.');
	if (numValidators > 0) {
		const accountsTable = await getAccountsTable();
		const commissionsTable = await getCommissionsTable();

		const posModuleData = await requestAll(
			requestConnector,
			'getGenesisAssetByModule',
			{ module: MODULE.POS, subStore: MODULE_SUB_STORE.POS.VALIDATORS, limit: 1000 },
			numValidators,
		);

		const validators = posModuleData[MODULE_SUB_STORE.POS.VALIDATORS];
		const genesisHeight = await getGenesisHeight();

		const commissionEntries = await BluebirdPromise.map(
			validators,
			async validator => {
				// Index all valid public keys
				if (isGeneratorKeyValid(validator.generatorKey)) {
					const account = {
						address: getLisk32AddressFromPublicKey(validator.generatorKey),
						publicKey: validator.generatorKey,
					};

					await accountsTable
						.upsert(account)
						.catch(() => indexAccountPublicKey(validator.generatorKey));
				}

				return {
					address: validator.address,
					commission: validator.commission,
					height: genesisHeight,
				};
			},
			{ concurrency: validators.length },
		);

		await commissionsTable.upsert(commissionEntries, dbTrx);
	}
	logger.debug('Finished indexing the validators information from the genesis PoS module assets.');
};

const indexPosStakesInfo = async (numStakers, dbTrx) => {
	logger.debug('Starting to index the stakes information from the genesis PoS module assets.');
	let totalStake = BigInt(0);
	let totalSelfStake = BigInt(0);

	if (numStakers > 0) {
		const stakesTable = await getStakesTable();

		const posModuleData = await requestAll(
			requestConnector,
			'getGenesisAssetByModule',
			{ module: MODULE.POS, subStore: MODULE_SUB_STORE.POS.STAKERS, limit: 1000 },
			numStakers,
		);
		const stakers = posModuleData[MODULE_SUB_STORE.POS.STAKERS];

		const allStakes = [];
		stakers.forEach(staker => {
			const { address: stakerAddress, stakes } = staker;
			stakes.forEach(stake => {
				const { validatorAddress, amount } = stake;

				allStakes.push({
					stakerAddress,
					validatorAddress,
					amount: BigInt(amount),
				});

				totalStake += BigInt(amount);
				if (stakerAddress === validatorAddress) {
					totalSelfStake += BigInt(amount);
				}
			});
		});

		await stakesTable.upsert(allStakes, dbTrx);
		logger.info(`Updated ${allStakes.length} stakes from the genesis block.`);
	}

	await updateTotalStake(totalStake, dbTrx);
	logger.info(`Updated total stakes at genesis: ${totalStake.toString()}.`);

	await updateTotalSelfStake(totalSelfStake, dbTrx);
	logger.info(`Updated total self-stakes information at genesis: ${totalSelfStake.toString()}.`);
	logger.debug('Finished indexing the stakes information from the genesis PoS module assets.');
};

const indexPosModuleAssets = async dbTrx => {
	logger.info('Starting to index the genesis assets from the PoS module.');
	const genesisBlockAssetsLength = await requestConnector('getGenesisAssetsLength', {
		module: MODULE.POS,
	});
	const numValidators = genesisBlockAssetsLength[MODULE.POS][MODULE_SUB_STORE.POS.VALIDATORS];
	const numStakers = genesisBlockAssetsLength[MODULE.POS][MODULE_SUB_STORE.POS.STAKERS];

	await indexPosValidatorsInfo(numValidators, dbTrx);
	await indexPosStakesInfo(numStakers, dbTrx);
	logger.info('Finished indexing all the genesis assets from the PoS module.');
};

const indexGenesisBlockAssets = async dbTrx => {
	logger.info('Starting to index the genesis assets.');
	intervalTimeout = setInterval(
		() => logger.info('Genesis assets indexing still in progress...'),
		5000,
	);
	await indexTokenModuleAssets(dbTrx);
	await indexPosModuleAssets(dbTrx);

	await triggerAccountUpdates();
	clearInterval(intervalTimeout);
	logger.info('Finished indexing all the genesis assets.');
};

let indexedGenesisAccountBalances;
const interval = setInterval(async () => {
	try {
		if (genesisAccountBalances.length) {
			if (indexedGenesisAccountBalances === false) return;
		} else {
			if (indexedGenesisAccountBalances === true) clearInterval(interval);
			return;
		}
		indexedGenesisAccountBalances = false;

		logger.info('Started indexing genesis account balances.');
		let numEntries = 0;
		const accountBalancesTable = await getAccountBalancesTable();
		while (genesisAccountBalances.length) {
			const accountBalanceEntry = genesisAccountBalances.shift();
			await accountBalancesTable
				.upsert(accountBalanceEntry)
				.then(() => {
					numEntries++;
				})
				.catch(err => {
					numEntries--;
					genesisAccountBalances.push(accountBalanceEntry);
					logger.warn(
						`Updating account balance for ${accountBalanceEntry.address} failed. Will retry.\nError: ${err.message}`,
					);
				});
		}

		indexedGenesisAccountBalances = true;
		logger.info(`Finished indexing genesis account balances. Added ${numEntries} entries.`);
	} catch (_) {
		// No actions required
	}
}, 5 * 60 * 1000);

module.exports = {
	getGenesisAssetIntervalTimeout,
	indexGenesisBlockAssets,

	// For testing
	indexTokenModuleAssets,
	indexPosModuleAssets,
};
