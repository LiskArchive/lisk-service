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

const { requestConnector } = require('../../utils/request');

const config = require('../../../config');

const latestBlockCache = CacheRedis('latestBlock', config.endpoints.cache);

const verifyIfPunished = async delegate => {
	const latestBlockString = await latestBlockCache.get('latestBlock');
	const latestBlock = latestBlockString ? JSON.parse(latestBlockString) : {};
	const isPunished = delegate.pomHeights
		.some(pomHeight => pomHeight.start <= latestBlock.height
            && latestBlock.height <= pomHeight.end);
	return isPunished;
};

const getAllDelegates = async () => {
	const delegatesFromApp = await requestConnector('invokeEndpoint', { endpoint: 'dpos_getAllDelegates' });

	const delegates = await BluebirdPromise.map(
		delegatesFromApp,
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

module.exports = {
	getAllDelegates,
};
