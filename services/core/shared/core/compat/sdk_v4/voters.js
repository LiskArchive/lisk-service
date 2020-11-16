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
    const voters = {
		data: [],
		meta: {},
	};
    const response = await coreApi.getVoters(params);
    response.data.voters = await BluebirdPromise.map(
		response.data.voters,
		async voter => {
            if (response.data.address === voter.address) {
                voter = {
                    ...voter, balance: response.data.balance, username: response.data.username,
                };
            } else {
                const voterInfo = await getDelegates({ address: voter.address }).data[0];
                voter = { ...voter, balance: voterInfo.balance, username: voterInfo.username };
            }
            const voteAmount = voter.votes.map(item => {
                if (response.data.address === item.delegateAddress) return Number(item.amount);
                return null;
            });
            voter.amount = voteAmount.reduce((a, b) => a + b).toString();
			return voter;
		}, { concurrency: response.data.voters.length });
    voters.data = response.data.voters;
    voters.meta = {
		limit: response.meta.limit,
		count: response.data.voters.length,
		offset: response.meta.offset,
		total: response.data.voteCount,
		address: response.data.address,
		publicKey: response.data.publicKey,
		username: response.data.username,
	};
	return voters;
};

module.exports = {
	getVoters,
};
