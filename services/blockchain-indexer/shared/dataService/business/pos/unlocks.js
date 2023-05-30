/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const { getPosTokenID } = require('./constants');
const {
	getIndexedAccountInfo,
	getLisk32AddressFromPublicKey,
	updateAccountPublicKey,
} = require('../../../utils/account');
const { getAddressByName } = require('../../../utils/validator');
const { requestConnector } = require('../../../utils/request');
const { getNetworkStatus } = require('../network');
const { getBlockByHeight } = require('../blocks');

const getPosUnlocks = async params => {
	const unlocks = {
		data: {},
		meta: {},
	};

	if (params.name) params.address = await getAddressByName(params.name);
	if (params.publicKey) params.address = await getLisk32AddressFromPublicKey(params.publicKey);

	const { pendingUnlocks = [] } = await requestConnector(
		'getPosPendingUnlocks',
		{ address: params.address },
	);

	const { data: { height, genesis: { blockTime } } } = await getNetworkStatus();
	const { timestamp } = await getBlockByHeight(height);

	const tokenID = await getPosTokenID();
	const filteredPendingUnlocks = pendingUnlocks.reduce(
		(accumulator, pendingUnlock) => {
			const { unlockable, ...remPendingUnlock } = pendingUnlock;
			const isLocked = !pendingUnlock.unlockable;
			// Filter results based on `params.isLocked`
			if (params.isLocked === undefined || params.isLocked === isLocked) {
				// Calculate expected unlock time
				const expectedUnlockTime = timestamp
					+ (remPendingUnlock.expectedUnlockableHeight - height) * blockTime;

				accumulator.push({
					...remPendingUnlock,
					isLocked,
					expectedUnlockTime,
					tokenID,
				});
			}
			return accumulator;
		},
		[],
	);

	const { publicKey, name } = await getIndexedAccountInfo(
		{ address: params.address, limit: 1 },
		['name', 'publicKey'],
	);

	// Update index if public key is not indexed asynchronously
	if (!publicKey && params.publicKey) updateAccountPublicKey(params.publicKey);

	unlocks.data = {
		address: params.address,
		publicKey: publicKey || null,
		name: name || null,
		pendingUnlocks: filteredPendingUnlocks,
	};

	const total = unlocks.data.pendingUnlocks.length;
	unlocks.data.pendingUnlocks = unlocks.data.pendingUnlocks
		.slice(params.offset, params.offset + params.limit);

	unlocks.meta = {
		count: unlocks.data.pendingUnlocks.length,
		offset: params.offset,
		total,
	};

	return unlocks;
};

module.exports = {
	getPosUnlocks,
};
