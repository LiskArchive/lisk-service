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

const { getAccounts, getIndexedAccountInfo } = require('./accounts');
const { parseToJSONCompatObj } = require('../common');

const normalizeVote = vote => parseToJSONCompatObj(vote);

const getVotes = async params => {
	const voter = {
		data: { votes: [] },
		meta: {},
	};

	if (params.address) params.sentAddress = params.address;
	if (params.username) {
		const [accountInfo] = await getIndexedAccountInfo({ username: params.username });
		if (!accountInfo || accountInfo.address === undefined) return new Error(`Account with username: ${params.username} does not exist`);
		params.sentAddress = accountInfo.address;
	}
	if (params.publicKey) params.sentAddress = (getAddressFromPublicKey(Buffer.from(params.publicKey, 'hex'))).toString('hex');

	delete params.address;
	delete params.username;
	delete params.publicKey;

	const response = await getAccounts({ id: params.sentAddress });
	if (response.data) response.data
		.forEach(acc => voter.data.votes = voter.data.votes.concat(normalizeVote(acc).dpos.sentVotes));
	if (response.meta) voter.meta = response.meta;

	voter.data.votes = await BluebirdPromise.map(
		voter.data.votes,
		async vote => {
			const [accountInfo] = await getIndexedAccountInfo({ address: vote.delegateAddress });
			vote.username = accountInfo && accountInfo.username ? accountInfo.username : undefined;
			const { amount, delegateAddress, username } = vote;
			return { amount, address: delegateAddress, username };
		},
		{ concurrency: voter.data.votes.length },
	);

	const [accountInfo] = await getIndexedAccountInfo({ address: params.sentAddress });
	voter.data.account = {
		address: params.sentAddress,
		username: accountInfo && accountInfo.username ? accountInfo.username : undefined,
		votesUsed: voter.data.votes.length,
	};

	voter.meta.total = voter.data.votes.length;
	voter.meta.count = voter.data.votes.length;
	voter.meta.offset = params.offset || 0;
	return voter;
};

module.exports = {
	getVotes,
};
