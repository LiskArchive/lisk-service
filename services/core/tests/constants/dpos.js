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
const normalAccount = {
	address: 'lskbwvtd6sp5f5tpvfnu2v3tuvqbwyyfqqeadcawb',
	token: { balance: 1893122255345680 },
	sequence: { nonce: 0 },
	keys: { numberOfSignatures: 0, mandatoryKeys: [], optionalKeys: [] },
	dpos: {
		delegate: {
			username: '',
			pomHeights: [],
			consecutiveMissedBlocks: 0,
			lastForgedHeight: 16270293,
			isBanned: false,
			totalVotesReceived: '0',
		},
		sentVotes: [],
		unlocking: [
			{
				delegateAddress: 'lskc39w4qgnuswv2bqref6ueg37gjmmttd622ayb3',
				amount: '3000000000000',
				unvoteHeight: 16342221,
			},
		],
	},
	isDelegate: false,
	isMultisignature: false,
};

const delegateAccount = {
	address: 'lskc39w4qgnuswv2bqref6ueg37gjmmttd622ayb3',
	token: { balance: 243096359954 },
	sequence: { nonce: 3 },
	keys: {
		numberOfSignatures: 2,
		mandatoryKeys: [
			'130649e3d8d34eb59197c00bcf6f199bc4ec06ba0968f1d473b010384569e7f0',
			'c9cdfa540580545f806f09c3443a159dee8d392dd0efaa1220df413fce7bfaf2',
		],
		optionalKeys: [],
	},
	dpos: {
		delegate: {
			username: 'panzer',
			pomHeights: [],
			consecutiveMissedBlocks: 0,
			lastForgedHeight: 16463635,
			isBanned: false,
			totalVotesReceived: '35366000000000',
		},
		sentVotes: [
			{
				delegateAddress: 'lskc39w4qgnuswv2bqref6ueg37gjmmttd622ayb3',
				amount: 4500000000000,
			},
		],
		unlocking: [
			{
				delegateAddress: 'lskc39w4qgnuswv2bqref6ueg37gjmmttd622ayb3',
				amount: '3000000000000',
				unvoteHeight: 16442421,
			},
		],
	},
	isDelegate: true,
	isMultisignature: true,
};

const punishedDelegateAccount = {
	address: 'lskega874vwxpem8prhru2a78jnqawq8yu2j32b7o',
	token: { balance: 4886083634 },
	sequence: { nonce: 2 },
	keys: {
		numberOfSignatures: 2,
		mandatoryKeys: [
			'6263002d4fbc857749a249e95824d6334617f0f0ad3affc0eeabaa4e0469d682',
			'93ec60444c28e8b8c0f1a613ed41f518b637280c454188e5500ea4e54e1a2f12',
		],
		optionalKeys: [],
	},
	dpos: {
		delegate: {
			username: 'bigfisher',
			pomHeights: [16274704],
			consecutiveMissedBlocks: 0,
			lastForgedHeight: 16332114,
			isBanned: false,
			totalVotesReceived: '32000000000',
		},
		sentVotes: [],
		unlocking: [
			{
				delegateAddress: 'lskega874vwxpem8prhru2a78jnqawq8yu2j32b7o',
				amount: '1760000000000',
				unvoteHeight: 16456483,
			},
		],
	},
	isDelegate: true,
	isMultisignature: true,
};

const punishedVoterAccount = {
	address: 'lskeqretdgm6855pqnnz69ahpojk5yxfsv2am34et',
	token: { balance: 2876268240 },
	sequence: { nonce: 6 },
	keys: { numberOfSignatures: 0, mandatoryKeys: [], optionalKeys: [] },
	dpos: {
		delegate: {
			username: '',
			pomHeights: [],
			consecutiveMissedBlocks: 0,
			lastForgedHeight: 16270293,
			isBanned: false,
			totalVotesReceived: '0',
		},
		sentVotes: [
			{
				delegateAddress: 'lsksaca4v9r3uotdzdhje3smwa49rvj2h2sn5yskt',
				amount: 5700000000000,
			},
		],
		unlocking: [
			{
				delegateAddress: 'lskega874vwxpem8prhru2a78jnqawq8yu2j32b7o',
				amount: '3000000000000',
				unvoteHeight: 16342421,
			},
			{
				delegateAddress: 'lskega874vwxpem8prhru2a78jnqawq8yu2j32b7o',
				amount: '2000000000000',
				unvoteHeight: 16332862,
			},
		],
	},
	isDelegate: false,
	isMultisignature: false,
};

const voterUnlock = {
	delegateAddress: 'lskc39w4qgnuswv2bqref6ueg37gjmmttd622ayb3',
	amount: '3000000000000',
	unvoteHeight: 16342221,
};

const selfVoteUnlock = {
	delegateAddress: 'lskc39w4qgnuswv2bqref6ueg37gjmmttd622ayb3',
	amount: '3000000000000',
	unvoteHeight: 16442421,
};

const punishedVoterUnlock = {
	delegateAddress: 'lskega874vwxpem8prhru2a78jnqawq8yu2j32b7o',
	amount: '2000000000000',
	unvoteHeight: 16332862,
};

const punishedSelfVoteUnlock = {
	delegateAddress: 'lskega874vwxpem8prhru2a78jnqawq8yu2j32b7o',
	amount: '3000000000000',
	unvoteHeight: 16342421,
};

module.exports = {
	account: {
		normal: normalAccount,
		delegate: delegateAccount,
		punishedVoter: punishedVoterAccount,
		punishedDelegate: punishedDelegateAccount,
	},
	unlock: {
		voter: voterUnlock,
		selfVote: selfVoteUnlock,
		punishedVoter: punishedVoterUnlock,
		punishedSelfVote: punishedSelfVoteUnlock,
	},
};
