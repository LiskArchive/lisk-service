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
	getBase32AddressFromHex,
	getHexAddressFromBase32,
	getIndexedAccountInfo,
} = require('../../../utils/accountUtils');
const { getAddressByName } = require('../../../utils/delegateUtils');
const { parseToJSONCompatObj } = require('../../../utils/parser');
const { requestConnector } = require('../../../utils/request');

const normalizeVote = vote => {
	const normalizedVote = parseToJSONCompatObj(vote);
	normalizedVote.delegateAddress = getBase32AddressFromHex(vote.delegateAddress);
	return normalizedVote;
};

const getVotesSent = async params => {
	const voter = {
		data: {
			account: {},
			votes: [],
		},
		meta: {},
	};

	if (params.name) {
		params.address = await getAddressByName(params.name);
	}

	const response = await requestConnector('dpos_getVoter', { address: getHexAddressFromBase32(params.address) });

	// TODO: Remove if condition when proper error handling implemented in SDK
	if (!response.error) response.sentVotes
		.forEach(sentVote => voter.data.votes = voter.data.votes.concat(normalizeVote(sentVote)));

	voter.data.votes = await BluebirdPromise.map(
		voter.data.votes,
		async vote => {
			const accountInfo = await getIndexedAccountInfo({ address: vote.delegateAddress, limit: 1 }, ['name']);
			vote.name = accountInfo && accountInfo.name ? accountInfo.name : null;
			return vote;
		},
		{ concurrency: voter.data.votes.length },
	);

	const accountInfo = await getIndexedAccountInfo({ address: params.address, limit: 1 }, ['name']);
	voter.data.account = {
		address: params.address,
		name: accountInfo && accountInfo.name ? accountInfo.name : null,
		publicKey: accountInfo && accountInfo.publicKey ? accountInfo.publicKey : null,
		votesUsed: voter.data.votes.length,
	};

	const total = voter.data.votes.length;
	voter.data.votes = voter.data.votes.slice(params.offset, params.offset + params.limit);

	voter.meta = {
		count: voter.data.votes.length,
		offset: params.offset,
		total,
	};

	return voter;
};

module.exports = {
	getVotesSent,
};
