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
const { getDelegates } = require('./delegates');

const getVoters = async params => {
    const voters = await coreApi.getVoters(params);
    voters.data.voters = await BluebirdPromise.map(
		voters.data.voters,
		async vote => {
            if (voters.data.address === vote.address) {
                vote.balance = voters.data.balance;
                vote.username = voters.data.username;
            } else {
                const voterInfo = await getDelegates({ address: vote.address }).data[0];
                vote.balance = voterInfo.balance;
                vote.username = voterInfo.username;
            }
            const voteAmount = vote.votes.map(item => {
                if (voters.data.address === item.delegateAddress) return Number(item.amount);
                return null;
            });
            vote.amount = voteAmount.reduce((a, b) => a + b);
			return vote;
		},
		{ concurrency: voters.data.voters.length },
	);
	return voters;
};

module.exports = {
	getVoters,
};
