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

const getVotesIndex = () => getTableInstance('votes', votesIndexSchema, MYSQL_ENDPOINT);

// Command specific constants
const commandID = 1;
const commandName = 'voteDelegate';

const getVoteIndexingInfo = async (tx) => {
	const votes = tx.params.votes.map(async vote => {
		const voteEntry = {};

		voteEntry.sentAddress = getBase32AddressFromPublicKey(tx.senderPublicKey);
		voteEntry.receivedAddress = getBase32AddressFromHex(vote.delegateAddress);
		voteEntry.amount = vote.amount;
		return voteEntry;
	});
	return votes;
};

const indexVoteTrx = async (vote, trx) => {
	const votesDB = await getVotesIndex();

	const incrementParam = {
		increment: {
			amount: BigInt(vote.amount),
		},
		where: {
			sentAddress: vote.sentAddress,
			receivedAddress: vote.receivedAddress,
		},
	};

	const numRowsAffected = await votesDB.increment(incrementParam, trx);
	if (numRowsAffected === 0) {
		await votesDB.upsert(vote, trx);
	}
};

const removeVoteFromIndex = async (vote, trx) => {
	const votesDB = await getVotesIndex();

	const decrementParam = {
		decrement: {
			amount: BigInt(vote.amount),
		},
		where: {
			sentAddress: vote.sentAddress,
			receivedAddress: vote.receivedAddress,
		},
	};

	await votesDB.decrement(decrementParam, trx);
};

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, dbTrx) => {
	const votes = await getVoteIndexingInfo(tx);

	logger.trace(`Indexing transaction ${tx.id} contained in block at height ${tx.height}`);

	await BluebirdPromise.map(
		votes,
		async (vote) => indexVoteTrx(vote, dbTrx),
		{ concurrency: 1 },
	);

	logger.debug(`Indexed transaction ${tx.id} contained in block at height ${tx.height}`);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, dbTrx) => {
	const votes = await getVoteIndexingInfo(tx);

	logger.trace(`Reverting votes in transaction ${tx.id} contained in block at height ${tx.height}`);

	await BluebirdPromise.map(
		votes,
		async (vote) => removeVoteFromIndex(vote, dbTrx),
		{ concurrency: 1 },
	);

	logger.debug(`Reverted votes in transaction ${tx.id} contained in block at height ${tx.height}`);
};

module.exports = {
	commandID,
	commandName,
	applyTransaction,
	revertTransaction,
};
