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

const USER_SUB_STORE_KEY = 'userSubstore';

const indexTokenModuleAssets = async (dbTrx) => {
	const genesisBlockAssetsLength = await requestConnector('getGenesisAssetsLength', { module: MODULE.TOKEN, subStore: USER_SUB_STORE_KEY });
	const totalUserSubStore = genesisBlockAssetsLength[MODULE.TOKEN].userSubstore;

	const tokenIDLockedAmountChangeMap = {};
	let offset = 0;
	while (offset < totalUserSubStore) {
		// eslint-disable-next-line no-await-in-loop
		const [tokenModule] = await requestConnector('getGenesisAssets', {
			module: MODULE.TOKEN,
			subStore: USER_SUB_STORE_KEY,
			offset,
		});
		const userSubStoreInfos = tokenModule.data.userSubstore;

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

const indexGenesisBlockAssets = async (dbTrx) => {
	await indexTokenModuleAssets(dbTrx);
};

module.exports = {
	indexGenesisBlockAssets,
};
