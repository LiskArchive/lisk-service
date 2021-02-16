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

const { getIndexedAccountInfo } = require('./accounts');
const { parseToJSONCompatObj } = require('../../../jsonTools');

const mysqlIndex = require('../../../indexdb/mysql');
const votesIndexSchema = require('./schema/votes');

const getVotesIndex = () => mysqlIndex('votes', votesIndexSchema);

const dposModuleID = 5;
const voteTransactionAssetID = 1;

const extractAddressFromPublicKey = pk => (getAddressFromPublicKey(Buffer.from(pk, 'hex'))).toString('hex');

const indexVotes = async blocks => {
	const votesDB = await getVotesIndex();
	const votesMultiArray = blocks.map(block => {
		const votesArray = block.payload
			.filter(tx => tx.moduleID === dposModuleID && tx.assetID === voteTransactionAssetID)
			.map(tx => {
				const voteEntries = tx.asset.votes.map(vote => {
					const voteEntry = {};

					// TODO: Remove 'tempId' after composite PK support is added
					voteEntry.tempId = tx.id.concat(vote.delegateAddress);
					voteEntry.id = tx.id;
					voteEntry.sentAddress = extractAddressFromPublicKey(tx.senderPublicKey);
					voteEntry.receivedAddress = vote.delegateAddress;
					voteEntry.amount = vote.amount;
					voteEntry.timestamp = block.timestamp;
					return voteEntry;
				});
				return voteEntries;
			});
		let votes = [];
		votesArray.forEach(arr => votes = votes.concat(arr));
		return votes;
	});
	let allVotes = [];
	votesMultiArray.forEach(votes => allVotes = allVotes.concat(votes));
	if (allVotes.length) await votesDB.upsert(allVotes);
};

const normalizeVote = vote => parseToJSONCompatObj(vote);

const getVoters = async params => {
	const votesDB = await getVotesIndex();
	const votes = {
		data: { votes: [] },
		meta: {},
	};

	if (params.address) params.receivedAddress = params.address;
	if (params.username) {
		const accountInfo = await getIndexedAccountInfo({ username: params.username });
		if (!accountInfo || accountInfo.address === undefined) return new Error(`Account with username: ${params.username} does not exist`);
		params.receivedAddress = accountInfo.address;
	}
	if (params.publicKey) params.receivedAddress = extractAddressFromPublicKey(params.publicKey);

	delete params.address;
	delete params.username;
	delete params.publicKey;

	const resultSet = await votesDB.find({ sort: 'timestamp:desc', receivedAddress: params.receivedAddress });
	if (resultSet.length) {
		params.ids = resultSet.map(row => row.id);

		const response = await coreApi.getTransactions(params);
		if (response.data) {
			const voteMultiArray = response.data
				.map(tx => tx.asset.votes.map(v => ({ ...v, senderPublicKey: tx.senderPublicKey })));
			let allVotes = [];
			voteMultiArray
				.forEach(lvotes => allVotes = allVotes.concat(lvotes.map(v => ({
					...normalizeVote(v),
					sentAddress: extractAddressFromPublicKey(v.senderPublicKey),
				}))));
			votes.data.votes = allVotes;
		}
		if (response.meta) votes.meta = response.meta;
	}

	votes.data.votes = await BluebirdPromise.map(
		votes.data.votes,
		async vote => {
			const accountInfo = await getIndexedAccountInfo({ address: vote.sentAddress });
			vote.username = accountInfo && accountInfo.username ? accountInfo.username : undefined;
			const { amount, sentAddress, username } = vote;
			return { amount, address: sentAddress, username };
		},
		{ concurrency: votes.data.votes.length },
	);

	const accountInfo = await getIndexedAccountInfo({ address: params.receivedAddress });
	votes.data.account = {
		address: params.receivedAddress,
		username: accountInfo && accountInfo.username ? accountInfo.username : undefined,
		votesUsed: votes.data.votes.length,
	};

	votes.meta.total = resultSet.length;
	votes.meta.count = votes.data.votes.length;
	votes.meta.offset = params.offset || 0;
	return votes;
};

module.exports = {
	getVoters,
	indexVotes,
};
