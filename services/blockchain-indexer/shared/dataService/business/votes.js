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
const { getAddressFromPublicKey } = require('@liskhq/lisk-cryptography');

const { getAccounts } = require('./accounts');
const {
	getBase32AddressFromHex,
	getIndexedAccountInfo,
} = require('../../utils/accountUtils');
const { parseToJSONCompatObj } = require('../../utils/parser');

const normalizeVote = vote => parseToJSONCompatObj(vote);

const extractAddressFromPublicKey = pk => (getAddressFromPublicKey(Buffer.from(pk, 'hex'))).toString('hex');

const getVotes = async params => {
	const voter = {
		data: { votes: [] },
		meta: {},
	};

	if (params.address) {
		const { address, ...remParams } = params;
		params = remParams;

		params.sentAddress = address;
	}
	if (params.username) {
		const { username, ...remParams } = params;
		params = remParams;

		const accountInfo = await getIndexedAccountInfo({ username, limit: 1 }, ['address']);
		if (!accountInfo || accountInfo.address === undefined) return new Error(`Account with username: ${username} does not exist`);
		params.sentAddress = accountInfo.address;
	}
	if (params.publicKey) {
		const { publicKey, ...remParams } = params;
		params = remParams;

		params.sentAddress = getBase32AddressFromHex(extractAddressFromPublicKey(publicKey));
	}

	const response = await getAccounts({ id: params.sentAddress });
	if (response.data) response.data
		.forEach(acc => voter.data.votes = voter.data.votes.concat(normalizeVote(acc).dpos.sentVotes));
	if (response.meta) voter.meta = response.meta;

	voter.data.votes = await BluebirdPromise.map(
		voter.data.votes,
		async vote => {
			const accountInfo = await getIndexedAccountInfo({ address: vote.delegateAddress, limit: 1 }, ['username']);
			vote.username = accountInfo && accountInfo.username ? accountInfo.username : undefined;
			const { amount, delegateAddress, username } = vote;
			return { amount, address: delegateAddress, username };
		},
		{ concurrency: voter.data.votes.length },
	);

	const accountInfo = await getIndexedAccountInfo({ address: params.sentAddress, limit: 1 }, ['username']);
	voter.data.account = {
		address: params.sentAddress,
		username: accountInfo && accountInfo.username ? accountInfo.username : undefined,
		votesUsed: voter.data.votes.length,
	};

	voter.meta.total = voter.data.votes.length;
	return voter;
};

module.exports = {
	getVotes,
};
