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
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const {
	getBase32AddressFromPublicKey,
	getBase32AddressFromHex,
} = require('../../../utils/accountUtils');
const config = require('../../../../config');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const votesIndexSchema = require('../../../database/schema/votes');
const votesAggregateIndexSchema = require('../../../database/schema/votesAggregate');

const getVotesIndex = () => getTableInstance('votes', votesIndexSchema, MYSQL_ENDPOINT);
const getVotesAggregateIndex = () => getTableInstance('votes_aggregate', votesAggregateIndexSchema, MYSQL_ENDPOINT);

// Command specific constants
const commandID = 1;
const commandName = 'voteDelegate';

const getVoteIndexingInfo = async (tx) => {
	const votesDB = await getVotesIndex();
	const votesToAggregateArray = [];
	const votesMultiArray = tx.params.votes.map(async vote => {
		const voteEntry = {};

		voteEntry.sentAddress = getBase32AddressFromPublicKey(tx.senderPublicKey);
		voteEntry.receivedAddress = getBase32AddressFromHex(vote.delegateAddress);
		voteEntry.amount = vote.amount;

		const [row] = await votesDB.find({
			id: tx.id,
			receivedAddress: voteEntry.receivedAddress,
			limit: 1,
		}, ['isAggregated']);
		if (!row || !row.isAggregated) {
			votesToAggregateArray.push({
				amount: BigInt(vote.amount),
				id: voteEntry.receivedAddress.concat(voteEntry.sentAddress),
				voteObject: {
					...voteEntry,
					id: voteEntry.receivedAddress.concat(voteEntry.sentAddress),
				},
			});
		}
		voteEntry.id = tx.id;
		return voteEntry;
	});
	let allVotePromises = [];
	votesMultiArray.forEach(votes => allVotePromises = allVotePromises.concat(votes));
	const votes = await BluebirdPromise.all(allVotePromises);
	return { votes, votesToAggregateArray };
};

const updateVoteAggregatesTrx = async (voteToAggregate, trx) => {
	const votesAggregateDB = await getVotesAggregateIndex();

	const incrementParam = {
		increment: {
			amount: BigInt(voteToAggregate.amount),
		},
		where: {
			property: 'id',
			value: voteToAggregate.id,
		},
	};

	const numRowsAffected = await votesAggregateDB.increment(incrementParam, trx);
	if (numRowsAffected === 0) {
		await votesAggregateDB.upsert(voteToAggregate.voteObject, trx);
	}
};

// eslint-disable-next-line no-unused-vars
const processTransaction = async (blockHeader, tx, dbTrx) => {
	const votesDB = await getVotesIndex();

	const { votes, votesToAggregateArray } = await getVoteIndexingInfo(tx);

	logger.trace(`Indexing transaction ${tx.id} contained in block at height ${tx.height}`);

	await votesDB.upsert(votes, dbTrx);

	await BluebirdPromise.map(
		votesToAggregateArray,
		async (voteToAggregate) => updateVoteAggregatesTrx(voteToAggregate, dbTrx),
		{ concurrency: 1 },
	);

	logger.debug(`Indexed transaction ${tx.id} contained in block at height ${tx.height}`);
};

module.exports = {
	commandID,
	commandName,
	processTransaction,
};
