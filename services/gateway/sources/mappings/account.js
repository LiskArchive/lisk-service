/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
module.exports = {
	address: '=,string',
	publicKey: '=,string',
	secondPublicKey: '=,string',
	balance: '=,string',
	nonce: '=,string',
	delegate: {
		approval: '=,string',
		missedBlocks: '=,number',
		producedBlocks: '=,number',
		productivity: '=,string',
		rank: '=,number',
		rewards: '=,string',
		username: '=,string',
		vote: '=,string',
		totalVotesReceived: ',string',
		isBanned: '=',
		status: '=,string',
		pomHeights: '=',
		lastForgedHeight: '=,number',
		consecutiveMissedBlocks: '=,number',
	},
	knowledge: {
		owner: '=,string',
		description: '=,string',
	},
	multisignatureAccount: {
		lifetime: 'multisignatureGroups.lifetime,number', // returns no data at a delegate account
		minimalNumberAcccounts: 'multisignatureGroups.min,number', // returns no data at a delegate account
		members: ['multisignatureGroups.members', {
			address: '=,string',
			publicKey: '=,string',
			secondPublicKey: '=,string',
			balance: '=,number',
			unconfirmedSignature: '=,number',
		}],
	},
	multisignatureMemberships: ['multisignatureMemberships', {
		address: '=,string',
		balance: '=,string',
		lifetime: '=,number',
		minimalNumberAcccounts: 'min,number',
		publicKey: '=,string',
		secondPublicKey: '=,string',
	}],
	transactionCount: {
		incoming: 'incomingTxsCount,string',
		outgoing: 'outgoingTxsCount,string',
	},
};
