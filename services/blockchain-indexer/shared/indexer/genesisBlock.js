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
const { MySQL: { getTableInstance } } = require('lisk-service-framework');

const {
	MODULE,
	MODULE_SUB_STORE,
	getGenesisHeight,
} = require('../constants');
const {
	updateTotalStake,
	updateTotalSelfStake,
} = require('./transactionProcessor/pos/stake');
const { requestConnector } = require('../utils/request');
const { updateAccountBalances } = require('./accountBalanceIndex');
const { updateTotalLockedAmounts } = require('../utils/blockchainIndex');

const requestAll = require('../utils/requestAll');
const config = require('../../config');
const commissionsTableSchema = require('../database/schema/commissions');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getCommissionsTable = () => getTableInstance(commissionsTableSchema, MYSQL_ENDPOINT);

const indexTokenModuleAssets = async (dbTrx) => {
	const genesisBlockAssetsLength = await requestConnector(
		'getGenesisAssetsLength',
		{ module: MODULE.TOKEN, subStore: MODULE_SUB_STORE.TOKEN.USER },
	);
	const totalUsers = genesisBlockAssetsLength[MODULE.TOKEN][MODULE_SUB_STORE.TOKEN.USER];

	const tokenModuleData = await requestAll(
		requestConnector,
		'getGenesisAssetByModule',
		{ module: MODULE.TOKEN, subStore: MODULE_SUB_STORE.TOKEN.USER },
		totalUsers,
	);
	const userSubStoreInfos = tokenModuleData[MODULE_SUB_STORE.TOKEN.USER];
	const tokenIDLockedAmountChangeMap = {};

	// eslint-disable-next-line no-restricted-syntax
	for (const userInfo of userSubStoreInfos) {
		const { tokenID } = userInfo;

		// eslint-disable-next-line no-restricted-syntax
		for (const lockedBalance of userInfo.lockedBalances) {
			if (!tokenIDLockedAmountChangeMap[tokenID]) {
				tokenIDLockedAmountChangeMap[tokenID] = BigInt(0);
			}
			tokenIDLockedAmountChangeMap[tokenID] += BigInt(lockedBalance.amount);
		}

		// Index account balance
		// eslint-disable-next-line no-await-in-loop
		await updateAccountBalances(userInfo.address);
	}

	await updateTotalLockedAmounts(tokenIDLockedAmountChangeMap, dbTrx);
};

const indexPosValidatorsInfo = async (numValidators, dbTrx) => {
	if (numValidators > 0) {
		const commissionsTable = await getCommissionsTable();

		const posModuleData = await requestAll(
			requestConnector,
			'getGenesisAssetByModule',
			{ module: MODULE.POS, subStore: MODULE_SUB_STORE.POS.VALIDATORS },
			numValidators,
		);

		const validators = posModuleData[MODULE_SUB_STORE.POS.VALIDATORS];
		const genesisHeight = await getGenesisHeight();

		const commissionEntries = validators.map(validator => ({
			address: validator.address,
			commission: validator.commission,
			height: genesisHeight,
		}));

		await commissionsTable.upsert(commissionEntries, dbTrx);
	}
};

const indexPosStakesInfo = async (numStakers, dbTrx) => {
	let totalStakeChange = BigInt(0);
	let totalSelfStakeChange = BigInt(0);

	if (numStakers > 0) {
		const posModuleData = await requestAll(
			requestConnector,
			'getGenesisAssetByModule',
			{ module: MODULE.POS, subStore: MODULE_SUB_STORE.POS.STAKERS },
			numStakers,
		);
		const stakers = posModuleData[MODULE_SUB_STORE.POS.STAKERS];

		stakers.forEach(staker => {
			const { address: stakerAddress, stakes } = staker;

			stakes.forEach(stake => {
				const { validatorAddress, amount } = stake;
				totalStakeChange += BigInt(amount);
				if (stakerAddress === validatorAddress) { totalSelfStakeChange += BigInt(amount); }
			});
		});
	}

	await updateTotalStake(totalStakeChange, dbTrx);
	await updateTotalSelfStake(totalSelfStakeChange, dbTrx);
};

const indexPosModuleAssets = async (dbTrx) => {
	const genesisBlockAssetsLength = await requestConnector('getGenesisAssetsLength', { module: MODULE.POS });
	const numValidators = genesisBlockAssetsLength[MODULE.POS][MODULE_SUB_STORE.POS.VALIDATORS];
	const numStakers = genesisBlockAssetsLength[MODULE.POS][MODULE_SUB_STORE.POS.STAKERS];

	await indexPosValidatorsInfo(numValidators, dbTrx);
	await indexPosStakesInfo(numStakers, dbTrx);
};

const indexGenesisBlockAssets = async (dbTrx) => {
	await indexTokenModuleAssets(dbTrx);
	await indexPosModuleAssets(dbTrx);
};

module.exports = {
	indexGenesisBlockAssets,

	// For testing
	indexTokenModuleAssets,
	indexPosModuleAssets,
};
