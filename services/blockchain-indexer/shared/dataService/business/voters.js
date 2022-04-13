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

const { getTableInstance } = require('../../database/mysql');
const votesIndexSchema = require('../../indexer/schema/votes');
const votesAggregateIndexSchema = require('../../indexer/schema/votesAggregate');

const {
	getBase32AddressFromHex,
	getIndexedAccountInfo,
} = require('../../utils/accountUtils');

const getVotesIndex = () => getTableInstance('votes', votesIndexSchema);
const getVotesAggregateIndex = () => getTableInstance('votes_aggregate', votesAggregateIndexSchema);

const extractAddressFromPublicKey = pk => (getAddressFromPublicKey(Buffer.from(pk, 'hex'))).toString('hex');

const getVotesByTransactionIDs = async transactionIDs => {
	const votesDB = await getVotesIndex();
	const votes = await votesDB.find({
		whereIn: {
			property: 'id',
			values: transactionIDs,
		},
	}, ['tempId']);
	return votes;
};

const getVoters = async params => {
	const votesDB = await getVotesIndex();
	const votesAggregateDB = await getVotesAggregateIndex();
	const votes = {
		data: { votes: [] },
		meta: {},
	};

	if (params.address) {
		const { address, ...remParams } = params;
		params = remParams;

		params.receivedAddress = address;
	}
	if (params.username) {
		const { username, ...remParams } = params;
		params = remParams;

		const accountInfo = await getIndexedAccountInfo({ username, limit: 1 }, ['address']);
		if (!accountInfo || accountInfo.address === undefined) return new Error(`Account with username: ${username} does not exist`);
		params.receivedAddress = accountInfo.address;
	}
	if (params.publicKey) {
		const { publicKey, ...remParams } = params;
		params = remParams;

		params.receivedAddress = getBase32AddressFromHex(extractAddressFromPublicKey(publicKey));
	}

	const numVotesReceived = params.aggregate
		? await votesAggregateDB.count({
			receivedAddress: params.receivedAddress,
			propBetweens: [{
				property: 'amount',
				greaterThan: '0',
			}],
		})
		: await votesDB.count({ receivedAddress: params.receivedAddress });

	const resultSet = params.aggregate
		? await votesAggregateDB.find(
			{
				sort: 'timestamp:desc',
				receivedAddress: params.receivedAddress,
				propBetweens: [{
					property: 'amount',
					greaterThan: '0',
				}],
				limit: numVotesReceived,
			},
			Object.keys(votesAggregateIndexSchema.schema),
		)
		: await votesDB.find(
			{
				sort: 'timestamp:desc',
				receivedAddress: params.receivedAddress,
				limit: numVotesReceived,
			},
			Object.keys(votesIndexSchema.schema),
		);
	if (resultSet.length) votes.data.votes = resultSet;

	votes.data.votes = await BluebirdPromise.map(
		votes.data.votes,
		async vote => {
			const accountInfo = await getIndexedAccountInfo({ address: vote.sentAddress, limit: 1 }, ['username']);
			vote.username = accountInfo && accountInfo.username ? accountInfo.username : undefined;
			const { amount, sentAddress, username } = vote;
			return { amount, address: sentAddress, username };
		},
		{ concurrency: votes.data.votes.length },
	);

	const accountInfo = await getIndexedAccountInfo({ address: params.receivedAddress, limit: 1 }, ['username']);
	votes.data.account = {
		address: params.receivedAddress,
		username: accountInfo && accountInfo.username ? accountInfo.username : undefined,
		votesReceived: numVotesReceived,
	};
	votes.data.votes = votes.data.votes.slice(params.offset, params.offset + params.limit);
	votes.meta.total = votes.data.account.votesReceived;
	votes.meta.count = votes.data.votes.length;
	votes.meta.offset = params.offset;
	return votes;
};

module.exports = {
	getVotesByTransactionIDs,
	getVoters,
};
