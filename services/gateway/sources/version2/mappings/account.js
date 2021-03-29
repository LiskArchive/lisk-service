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
module.exports = {
	summary: {
		address: '=,string',
		balance: 'token.balance,string',
		username: 'dpos.delegate.username,string',
		publicKey: '=,string',
		isDelegate: '=,boolean',
		isMultisignature: '=,boolean',
	},
	knowledge: {
		owner: '=,string',
		description: '=,string',
	},
	token: {
		balance: '=,string',
	},
	sequence: {
		nonce: '=,string',
	},
	keys: {
		numberOfSignatures: '=,number',
		mandatoryKeys: '=',
		optionalKeys: '=',
		members: ['multisignatureGroups.members', {
			address: '=,string',
			publicKey: '=,string',
			isMandatory: '=,boolean',
		}],
		memberships: ['multisignatureMemberships', {
			address: '=,string',
			publicKey: '=,string',
			isMandatory: '=,boolean',
		}],
	},
	dpos: {
		delegate: {
			username: '=,string',
			pomHeights: ['pomHeights', {
				start: '=,number',
				end: '=,number',
			}],
			consecutiveMissedBlocks: '=,number',
			lastForgedHeight: '=,number',
			isBanned: '=,boolean',
			totalVotesReceived: '=,string',
			missedBlocks: '=,number',
			producedBlocks: 'producedBlocks,number',
			productivity: '=,string',
			rank: 'rank,number',
			status: 'status,string',
			rewards: 'rewards,string',
		},
		sentVotes: ['sentVotes', {
			delegateAddress: '=,string',
			amount: '=,string',
		}],
		unlocking: ['unlocking', {
			delegateAddress: '=,string',
			amount: '=,string',
			height: {
				start: '=,number',
				end: '=,number',
			},
		}],
	},
};
