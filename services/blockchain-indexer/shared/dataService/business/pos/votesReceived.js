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
const { MySQL: { getTableInstance } } = require('lisk-service-framework');
const votesIndexSchema = require('../../../database/schema/votes');
const {
	getIndexedAccountInfo,
} = require('../../../utils/accountUtils');

const config = require('../../../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getVotesIndex = () => getTableInstance('votes', votesIndexSchema, MYSQL_ENDPOINT);

const getVotesReceived = async params => {
	const votesDB = await getVotesIndex();
	const votes = {
		data: { votes: [] },
		meta: {},
	};

	if (params.address) {
		const { address, ...remParams } = params;
		params = remParams;

		params.receivedAddress = address;
	}

	if (params.name) {
		const { name, ...remParams } = params;
		params = remParams;

		const accountInfo = await getIndexedAccountInfo({ name, limit: 1 }, ['address']);
		if (!accountInfo || !accountInfo.address) return new Error(`Account with name: ${name} does not exist`);
		params.receivedAddress = accountInfo.address;
	}

	// TODO: Use count method directly once support for custom column-based count added https://github.com/LiskHQ/lisk-service/issues/1188
	const [{ numVotesReceived }] = params.aggregate
		? await votesDB.rawQuery(`SELECT COUNT(*) as numVotesReceived from ${votesIndexSchema.tableName} WHERE receivedAddress='${params.receivedAddress}' AND amount>0`)
		: await votesDB.rawQuery(`SELECT COUNT(*) as numVotesReceived from ${votesIndexSchema.tableName} WHERE receivedAddress='${params.receivedAddress}'`);

	const resultSet = params.aggregate
		? await votesDB.find(
			{
				receivedAddress: params.receivedAddress,
				propBetweens: [{
					property: 'amount',
					greaterThan: '0',
				}],
				limit: numVotesReceived,
			},
			Object.keys(votesIndexSchema.schema),
		)
		: await votesDB.find(
			{
				receivedAddress: params.receivedAddress,
				limit: numVotesReceived,
			},
			Object.keys(votesIndexSchema.schema),
		);
	if (resultSet.length) votes.data.votes = resultSet;

	votes.data.votes = await BluebirdPromise.map(
		votes.data.votes,
		async vote => {
			const accountInfo = await getIndexedAccountInfo({ address: vote.sentAddress, limit: 1 }, ['name']);
			vote.name = accountInfo && accountInfo.name ? accountInfo.name : null;
			const { amount, sentAddress, name } = vote;
			return { amount, delegateAddress: sentAddress, name };
		},
		{ concurrency: votes.data.votes.length },
	);

	const accountInfo = await getIndexedAccountInfo({ address: params.receivedAddress, limit: 1 }, ['name']);
	votes.data.account = {
		address: params.receivedAddress,
		name: accountInfo && accountInfo.name ? accountInfo.name : null,
		publicKey: accountInfo && accountInfo.publicKey ? accountInfo.publicKey : null,
		votesReceived: numVotesReceived,
	};
	votes.data.votes = votes.data.votes.slice(params.offset, params.offset + params.limit);
	votes.meta.total = votes.data.account.votesReceived;
	votes.meta.count = votes.data.votes.length;
	votes.meta.offset = params.offset;
	return votes;
};

module.exports = {
	getVotesReceived,
};
