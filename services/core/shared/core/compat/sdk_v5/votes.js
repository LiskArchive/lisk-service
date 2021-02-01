/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const { getAddressFromPublicKey } = require('@liskhq/lisk-cryptography');

const { getAccounts } = require('./accounts');
const { parseToJSONCompatObj } = require('../common');

const normalizeVote = vote => parseToJSONCompatObj(vote);

const getVotes = async params => {
	const voter = {
		data: { votes: [] },
		meta: {},
	};

	if (params.address) params.receivedAddress = params.address;
	if (params.username) params.receivedAddress = ''; // TODO: Util method from accounts
	if (params.publicKey) params.receivedAddress = (getAddressFromPublicKey(Buffer.from(params.publicKey, 'hex'))).toString('hex');

	delete params.address;
	delete params.username;
	delete params.publicKey;

	const response = await getAccounts({ id: params.receivedAddress });
	if (response.data) voter.data.votes = response.data.map(acc => normalizeVote(acc.dpos.sentVotes));
	if (response.meta) voter.meta = response.meta;

	voter.data.votes = await BluebirdPromise.map(
		voter.data.votes,
		async vote => {
			vote.username = ''; // TODO: Util method from accounts
			return vote;
		},
		{ concurrency: voter.data.length },
	);
	voter.data.address = params.receivedAddress;
	voter.data.username = ''; // TODO: Util method from accounts
	voter.data.votesUsed = voter.data.votes.length;

	voter.meta.total = votes.meta.count;
	voter.meta.count = votes.data.length;
	voter.meta.offset = params.offset || 0;
	return voter;
};

module.exports = {
	getVotes,
};
