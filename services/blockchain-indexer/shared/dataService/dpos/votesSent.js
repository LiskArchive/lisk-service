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

const getVotesSent = async params => {
	const response = await dataService.getVotesSent(params);
	response.data.votes = await BluebirdPromise(
		response.data.votes,
		async vote => {
			const [delegateInfo = {}] = (await getDelegates({
				address: response.data.account.address,
			})).data;

			return {
				...vote,
				rank: delegateInfo.rank,
				voteWeight: delegateInfo.delegateWeight,
			};
		},
		{ concurrency: response.data.account.votes.length },
	);

	return response;
};

module.exports = {
	getVotesSent,
};
