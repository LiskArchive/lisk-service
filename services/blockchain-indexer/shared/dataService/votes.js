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
const dataService = require('./business');

const { getAccounts } = require('./accounts');

const getVotes = async params => {
	const votes = {
		data: [],
		meta: {},
	};

	const response = await dataService.getVotes(params);
	votes.data = response.data;
	votes.data.votes = await BluebirdPromise.map(
		response.data.votes,
		async vote => {
			if (!vote.publicKey) {
				const account = (await getAccounts({ id: vote.address })).data[0];
				vote.publicKey = account.publicKey;
			}
			return vote;
		},
		{ concurrency: response.data.votes.length },
	);

	if (!votes.data.account) votes.data = votes.data.votes;

	votes.meta = {
		limit: response.meta.limit,
		count: response.data.votes.length,
		offset: response.meta.offset,
		total: response.data.votesUsed || response.meta.total,
		address: response.data.address,
		publicKey: response.data.publicKey,
		username: response.data.username,
	};

	return votes;
};

module.exports = {
	getVotes,
};
