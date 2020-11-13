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
const coreApi = require('./coreApi');

const maxVotesPerAccount = 10;

const getVotes = async params => {
	const votes = await coreApi.getVotes(params);
	votes.data.votes = votes.data.votes.map(vote => {
		vote.address = vote.delegateAddress;
		vote.balance = vote.amount;
		vote.publicKey = null;
		vote.username = vote.delegate.username;

		return vote;
	});
	votes.data.votesUsed = maxVotesPerAccount - votes.data.votesAvailable;

	return votes;
};

module.exports = {
	getVotes,
};
