/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const coreApi = require('./coreApi');
const { getAccounts } = require('./accounts');

const maxVotesPerAccount = 10;

const getVotes = async params => {
	const votes = {
		data: [],
		meta: {},
	};

	const response = await coreApi.getVotes(params);
	if (response.data) votes.data = response.data;
	if (response.meta) votes.meta = response.meta;

	votes.data.votes = await BluebirdPromise.map(
		votes.data.votes,
		async (vote) => {
			vote.address = vote.delegateAddress;
			vote.publicKey = null;
			vote.username = vote.delegate.username;
			if (vote.address === votes.data.address) {
				vote = {
					...vote,
					balance: votes.data.balance,
				};
			} else {
				const voteInfo = (await getAccounts({ address: vote.address }))
					.data[0];
				vote = {
					...vote,
					balance: voteInfo.balance,
				};
			}
			return vote;
		},
		{ concurrency: votes.data.votes.length },
	);
	votes.data.votesUsed = maxVotesPerAccount - votes.data.votesAvailable;

	return votes;
};

module.exports = {
	getVotes,
};
