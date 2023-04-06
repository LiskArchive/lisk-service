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
const { MODULE } = require('../constants');
const { updateTotalLockedAmounts } = require('../utils/blockchainIndex');
const { requestConnector } = require('../utils/request');

const {
	updateTotalStake,
	updateTotalSelfStake,
} = require('./transactionProcessor/pos/stake');

const MODULE_SUB_STORE = Object.freeze({
	TOKEN: {
		USER: 'userSubstore',
	},
	POS: {
		STAKERS: 'stakers',
	},
});

const indexTokenModuleAssets = async (dbTrx) => {
	const genesisBlockAssetsLength = await requestConnector('getGenesisAssetsLength', {
		module: MODULE.TOKEN,
        subStore: MODULE_SUB_STORE.TOKEN.USER,
    });
	const totalUserSubStore = genesisBlockAssetsLength[MODULE.TOKEN][MODULE_SUB_STORE.TOKEN.USER];

	const tokenIDLockedAmountChangeMap = {};
	let offset = 0;
	while (offset < totalUserSubStore) {
		// eslint-disable-next-line no-await-in-loop
		const [tokenModule] = await requestConnector('getGenesisAssets', {
			module: MODULE.TOKEN,
			subStore: MODULE_SUB_STORE.TOKEN.USER,
			offset,
		});
		const userSubStoreInfos = tokenModule.data[MODULE_SUB_STORE.TOKEN.USER];

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
		}

		offset += userSubStoreInfos.length;
	}

	await updateTotalLockedAmounts(tokenIDLockedAmountChangeMap, dbTrx);
};

const indexPosModuleAssets = async (dbTrx) => {
	const genesisBlockAssetsLength = await requestConnector('getGenesisAssetsLength', { module: MODULE.POS, subStore: MODULE_SUB_STORE.POS.STAKERS });
	const totalStakers = genesisBlockAssetsLength[MODULE.POS][MODULE_SUB_STORE.POS.STAKERS];

	let offset = 0;
	let totalStakeChange = BigInt(0);
	let totalSelfStakeChange = BigInt(0);

	while (offset < totalStakers) {
		// eslint-disable-next-line no-await-in-loop
		const [posModule] = await requestConnector('getGenesisAssets', {
			module: MODULE.POS,
			subStore: MODULE_SUB_STORE.POS.STAKERS,
			offset,
		});
		const stakersInfo = posModule.data[MODULE_SUB_STORE.POS.STAKERS];

		// eslint-disable-next-line no-restricted-syntax
		for (const stakerInfo of stakersInfo) {
			// eslint-disable-next-line no-restricted-syntax
			for (const stake of stakerInfo.stakes) {
				totalStakeChange += BigInt(stake.amount);
				if (stakerInfo.address === stake.validatorAddress) {
					totalSelfStakeChange += BigInt(stake.amount);
				}
			}
		}
		offset += stakersInfo.length;
	}

	await updateTotalStake(totalStakeChange, dbTrx);
	await updateTotalSelfStake(totalSelfStakeChange, dbTrx);
};

const indexGenesisBlockAssets = async (dbTrx) => {
	await indexTokenModuleAssets(dbTrx);
	await indexPosModuleAssets(dbTrx);
};

module.exports = {
	indexGenesisBlockAssets,
};
