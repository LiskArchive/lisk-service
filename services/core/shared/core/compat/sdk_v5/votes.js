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

const coreApi = require('./coreApi');

const { parseToJSONCompatObj } = require('../common');
const { knex } = require('../../../database');

const dposModuleID = 5;
const voteTransactionAssetID = 1;

const indexVotes = async blocks => {
	const votesDB = await knex('votes');
	const votesMultiArray = blocks.map(block => {
		const votes = block.payload
			.filter(tx => tx.moduleID === dposModuleID && tx.assetID === voteTransactionAssetID)
			.map(tx => {
				const voteEntries = tx.asset.votes.map(vote => {
					const voteEntry = {};
					const sentAddress = (getAddressFromPublicKey(Buffer.from(tx.senderPublicKey, 'hex'))).toString('hex');
					voteEntry.sentAddress = sentAddress;
					voteEntry.receivedAddress = vote.delegateAddress;
					voteEntry.amount = vote.amount;
					voteEntry.timestamp = block.timestamp;
					voteEntry.transactionId = tx.id;
					return voteEntry;
				});
				return voteEntries;
			});
		return votes;
	});
	let allVotes = [];
	votesMultiArray.forEach(votes => allVotes = allVotes.concat(votes));
	await votesDB.writeBatch(allVotes);
};

const normalizeVote = vote => parseToJSONCompatObj(vote);

const getVotes = async params => {
	const votesDB = await knex('votes');
	const votes = {
		data: { votes: [] },
		meta: {},
	};

	if (params.address) params.sentAddress = params.address;
	if (params.username) params.sentAddress = ''; // TODO: Util method from accounts
	if (params.publicKey) params.sentAddress = (getAddressFromPublicKey(Buffer.from(tx.senderPublicKey, 'hex'))).toString('hex');

	delete params.address;
	delete params.username;
	delete params.publicKey;

	const resultSet = await votesDB.find({ sort: 'timestamp:desc', sentAddress: params.sentAddress });
	if (resultSet.length) params.ids = resultSet.map(row => row.transactionId);

	const response = await coreApi.getTransactions(params);
	if (response.data) votes.data.votes = response.data.map(tx => normalizeVote(tx.asset.votes));
	if (response.meta) votes.meta = response.meta;

	votes.data.votes = await BluebirdPromise.map(
		votes.data.votes,
		async vote => {
			vote.username = ''; // TODO: Util method from accounts
			return vote;
		},
		{ concurrency: votes.data.length },
	);
	votes.data.address = params.sentAddress;
	votes.data.username = ''; // TODO: Util method from accounts
	votes.data.votesUsed = votes.data.votes.length;

	votes.meta.total = votes.meta.count;
	votes.meta.count = votes.data.length;
	votes.meta.offset = params.offset || 0;
	return votes;
};

module.exports = {
	getVotes,
	indexVotes,
};
