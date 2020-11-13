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
		async voter => {
            if (voters.data.address === voter.address) {
                voter = { ...voter, balance: voters.data.balance, username: voters.data.username };
            } else {
                const voterInfo = await getDelegates({ address: voter.address }).data[0];
                voter = { ...voter, balance: voterInfo.balance, username: voterInfo.username };
            }
            const voteAmount = voter.votes.map(item => {
                if (voters.data.address === item.delegateAddress) return Number(item.amount);
                return null;
            });
            voter.amount = voteAmount.reduce((a, b) => a + b).toString();
			return voter;
		},
		{ concurrency: voters.data.voters.length },
	);
	return voters;
};

module.exports = {
	getVoters,
};
