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
const WAIT_TIME_VOTER = 2000;
const WAIT_TIME_SELF_VOTE = 260000;
const PUNISH_TIME_VOTER = 260000;
const PUNISH_TIME_SELF_VOTE = 780000;

const calculatePomEndHeight = pomHeight => pomHeight + PUNISH_TIME_SELF_VOTE;

const standardizePomHeight = pomHeight => ({
	start: pomHeight,
	end: calculatePomEndHeight(pomHeight),
});

const findPomHeightForUnlock = (unlock, account, isSelfVote) => {
	// No PoMs when account is non-delegate
	if (!account.isDelegate) return null;

	const unlockWaitingPeriod = isSelfVote
		? WAIT_TIME_SELF_VOTE
		: WAIT_TIME_VOTER;

	const pomWaitingPeriod = isSelfVote
		? PUNISH_TIME_SELF_VOTE
		: PUNISH_TIME_VOTER;

	// Consider the PoM height iff the following consditions are met:
	// - the punishment period begins before the unlock period ends (unvote height + waiting time)
	// - the unlock period begins (unvote height) before the punishment period ends
	// - the unlock period ends before the punishment period ends
	//
	// """
	//   This extended locking period also applies to tokens recently unvoted
	//   and still in the mandatory locking period(see the “voting LIP”).
	// """
	// Refer: https://github.com/LiskHQ/lips/blob/master/proposals/lip-0024.md#update-to-validity-of-unlock-transaction
	const { unvoteHeight } = unlock;
	const [pomHeightForUnlock] = account.dpos.delegate.pomHeights
		.sort((a, b) => b - a)
		.filter(
			pomHeight => pomHeight < unvoteHeight + unlockWaitingPeriod
				&& unvoteHeight < pomHeight + pomWaitingPeriod
				&& unvoteHeight + unlockWaitingPeriod < pomHeight + pomWaitingPeriod,
		);

	return pomHeightForUnlock || null;
};

const calculateUnlockEndHeight = (unlock, account, delegateAcc) => {
	if (unlock.delegateAddress === account.address) { // self-unvote
		const pomHeight = findPomHeightForUnlock(unlock, account, true);
		return pomHeight
			? pomHeight + PUNISH_TIME_SELF_VOTE
			: unlock.unvoteHeight + WAIT_TIME_SELF_VOTE;
	}

	const pomHeight = findPomHeightForUnlock(unlock, delegateAcc, false);
	return pomHeight
		? pomHeight + PUNISH_TIME_VOTER
		: unlock.unvoteHeight + WAIT_TIME_VOTER;
};

const standardizeUnlockHeight = (unlock, account, delegateAcc) => ({
	start: unlock.unvoteHeight,
	end: calculateUnlockEndHeight(unlock, account, delegateAcc),
});

module.exports = {
	constants: {
		WAIT_TIME_VOTER,
		WAIT_TIME_SELF_VOTE,
		PUNISH_TIME_VOTER,
		PUNISH_TIME_SELF_VOTE,
	},
	calculatePomEndHeight,
	standardizePomHeight,
	findPomHeightForUnlock,
	calculateUnlockEndHeight,
	standardizeUnlockHeight,
};
