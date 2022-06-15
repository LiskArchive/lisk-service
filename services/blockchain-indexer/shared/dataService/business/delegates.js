/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
	CacheRedis,
} = require('lisk-service-framework');

const { getHexAddressFromBase32 } = require('../../utils/accountUtils');

const { requestConnector } = require('../../utils/request');

const config = require('../../../config');
const { MODULE_ID } = require('../../constants');

const LAST_BLOCK_CACHE = 'lastBlock';
const lastBlockCache = CacheRedis(LAST_BLOCK_CACHE, config.endpoints.cache);

const LAST_BLOCK_KEY = 'lastBlock';

const isDposModuleRegistered = async () => {
	const networkStatus = await requestConnector('getNetworkStatus');
	const isRegistered = networkStatus.registeredModules
		.some(module => module.id === MODULE_ID.DPOS);
	return isRegistered;
};

const verifyIfPunished = async delegate => {
	const latestBlockString = await lastBlockCache.get(LAST_BLOCK_KEY);
	const latestBlock = latestBlockString ? JSON.parse(latestBlockString) : {};
	// TODO: Get this information from SDK directly once available
	const isPunished = delegate.pomHeights
		.some(pomHeight => pomHeight.start <= latestBlock.height
			&& latestBlock.height <= pomHeight.end);
	return isPunished;
};

const getAllDelegates = async () => {
	const delegatesFromApp = await requestConnector('dpos_getAllDelegates');
	const delegates = await BluebirdPromise.map(
		delegatesFromApp,
		// TODO: Get delegateWeight from SDK direvctly once available
		async delegate => {
			if (delegate.isBanned || await verifyIfPunished(delegate)) {
				delegate.delegateWeight = BigInt('0');
			} else {
				const cap = BigInt(delegate.selfVotes) * BigInt(10);
				delegate.totalVotesReceived = BigInt(delegate.totalVotesReceived);
				const voteWeight = BigInt(delegate.totalVotesReceived) > cap
					? cap
					: delegate.totalVotesReceived;

				delegate.delegateWeight = voteWeight;
			}
			return delegate;
		},
		{ concurrency: delegatesFromApp.length },
	);

	return delegates;
};

const getDelegates = async (addresses) => {
	const delegates = await BluebirdPromise.map(
		addresses,
		async address => {
			const delegate = await requestConnector(
				'dpos_getDelegate',
				{ address: getHexAddressFromBase32(address) },
			);
			return delegate;
		},
		{ concurrency: addresses.length },
	);
	return delegates;
};

module.exports = {
	getDelegates,
	getAllDelegates,
	isDposModuleRegistered,
};
