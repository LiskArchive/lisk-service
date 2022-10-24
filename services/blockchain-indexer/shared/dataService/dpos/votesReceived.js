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

const dataService = require('../business');
const { getDelegates } = require('./delegates');

const getVotesReceived = async params => {
	const response = await dataService.getVotesReceived(params);
	response.data.votes = await BluebirdPromise.map(
		response.data.votes,
		async vote => {
			const [delegate] = (await getDelegates({
				address: vote.delegateAddress,
			})).data;

			return {
				...vote,
				rank: delegate.rank,
				voteWeight: delegate.voteWeight,
			};
		},
		{ concurrency: response.data.votes.length },
	);

	return response;
};

module.exports = {
	getVotesReceived,
};
