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
const {
	account,
	unlock,
} = require('../constants/dpos');

const {
	constants,
	calculatePomEndHeight,
	standardizePomHeight,
	findPomHeightForUnlock,
	calculateUnlockEndHeight,
	standardizeUnlockHeight,
} = require('../../shared/core/compat/sdk_v5/dpos');

describe('DPoS tests', () => {
	describe('Verify calculatePomEndHeight', () => {
		it('PoM height: 0', async () => {
			const pomHeight = 0;
			const pomEndHeight = calculatePomEndHeight(pomHeight);
			expect(pomEndHeight).toBe(pomHeight + constants.PUNISH_TIME_SELF_VOTE);
		});

		it('PoM height: 16534704', async () => {
			const pomHeight = 16534704;
			const pomEndHeight = calculatePomEndHeight(pomHeight);
			expect(pomEndHeight).toBe(pomHeight + constants.PUNISH_TIME_SELF_VOTE);
		});
	});

	describe('Verify standardizePomHeight', () => {
		it('PoM height: 0', async () => {
			const pomHeight = 0;
			const standardizedPnlock = standardizePomHeight(pomHeight);
			expect(standardizedPnlock).toHaveProperty('start');
			expect(standardizedPnlock).toHaveProperty('end');
			expect(standardizedPnlock).toStrictEqual({
				start: pomHeight,
				end: pomHeight + constants.PUNISH_TIME_SELF_VOTE,
			});
		});

		it('PoM height: 16534704', async () => {
			const pomHeight = 16534704;
			const standardizedPnlock = standardizePomHeight(pomHeight);
			expect(standardizedPnlock).toHaveProperty('start');
			expect(standardizedPnlock).toHaveProperty('end');
			expect(standardizedPnlock).toStrictEqual({
				start: pomHeight,
				end: pomHeight + constants.PUNISH_TIME_SELF_VOTE,
			});
		});
	});

	describe('Verify findPomHeightForUnlock', () => {
		it('Non-delegate account - voter', async () => {
			expect(findPomHeightForUnlock(unlock.voter, account.normal, false)).toBeNull();
		});

		it('Non-delegate account - self-vote', async () => {
			expect(findPomHeightForUnlock(unlock.voter, account.normal, true)).toBeNull();
		});

		it('Voter unlocking', async () => {
			expect(findPomHeightForUnlock(unlock.voter, account.delegate, false)).toBeNull();
		});

		it('Self-vote unlocking', async () => {
			expect(findPomHeightForUnlock(unlock.selfVote, account.delegate, true)).toBeNull();
		});

		it('Punished voter unlocking', async () => {
			expect(findPomHeightForUnlock(unlock.punishedVoter, account.punishedDelegate, false))
				.toBe(account.punishedDelegate.dpos.delegate.pomHeights[0]);
		});

		it('Punished self-vote unlocking', async () => {
			expect(findPomHeightForUnlock(unlock.punishedSelfVote, account.punishedDelegate, true))
				.toBe(account.punishedDelegate.dpos.delegate.pomHeights[0]);
		});
	});

	describe('Verify calculateUnlockEndHeight', () => {
		it('Voter unlocking', async () => {
			expect(calculateUnlockEndHeight(unlock.voter, account.normal, account.delegate))
				.toBe(unlock.voter.unvoteHeight + constants.WAIT_TIME_VOTER);
		});

		it('Self-vote unlocking', async () => {
			expect(calculateUnlockEndHeight(unlock.selfVote, account.delegate, account.delegate))
				.toBe(unlock.selfVote.unvoteHeight + constants.WAIT_TIME_SELF_VOTE);
		});

		it('Punished voter unlocking', async () => {
			expect(calculateUnlockEndHeight(unlock.punishedVoter, account.punishedVoter, account.punishedDelegate))
				.toBe(findPomHeightForUnlock(unlock.punishedVoter, account.punishedDelegate, false) + constants.PUNISH_TIME_VOTER);
		});

		it('Punished self-vote unlocking', async () => {
			expect(calculateUnlockEndHeight(unlock.punishedSelfVote, account.punishedDelegate, account.punishedDelegate))
				.toBe(findPomHeightForUnlock(unlock.punishedVoter, account.punishedDelegate, false) + constants.PUNISH_TIME_SELF_VOTE);
		});
	});

	describe('Verify standardizeUnlockHeight', () => {
		it('Voter unlocking', async () => {
			const standardizedUnlock = standardizeUnlockHeight(unlock.voter, account.normal, account.delegate);
			expect(standardizedUnlock).toHaveProperty('start');
			expect(standardizedUnlock).toHaveProperty('end');
			expect(standardizedUnlock).toStrictEqual({
				start: unlock.voter.unvoteHeight,
				end: calculateUnlockEndHeight(unlock.voter, account.normal, account.delegate),
			});
		});

		it('Self-vote unlocking', async () => {
			const standardizedUnlock = standardizeUnlockHeight(unlock.selfVote, account.delegate, account.delegate);
			expect(standardizedUnlock).toHaveProperty('start');
			expect(standardizedUnlock).toHaveProperty('end');
			expect(standardizedUnlock).toStrictEqual({
				start: unlock.selfVote.unvoteHeight,
				end: calculateUnlockEndHeight(unlock.selfVote, account.delegate, account.delegate),
			});
		});

		it('Punished voter unlocking', async () => {
			const standardizedUnlock = standardizeUnlockHeight(unlock.punishedVoter, account.punishedVoter, account.punishedDelegate);
			expect(standardizedUnlock).toHaveProperty('start');
			expect(standardizedUnlock).toHaveProperty('end');
			expect(standardizedUnlock).toStrictEqual({
				start: unlock.punishedVoter.unvoteHeight,
				end: calculateUnlockEndHeight(unlock.punishedVoter, account.punishedVoter, account.punishedDelegate),
			});
		});

		it('Punished self-vote unlocking', async () => {
			const standardizedUnlock = standardizeUnlockHeight(unlock.punishedSelfVote, account.punishedDelegate, account.punishedDelegate);
			expect(standardizedUnlock).toHaveProperty('start');
			expect(standardizedUnlock).toHaveProperty('end');
			expect(standardizedUnlock).toStrictEqual({
				start: unlock.punishedSelfVote.unvoteHeight,
				end: calculateUnlockEndHeight(unlock.punishedSelfVote, account.punishedDelegate, account.punishedDelegate),
			});
		});
	});
});
