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

const findPomHeightForUnlock = (account, unlock) => {
	// No PoMs when account is non-delegate
	if (!account.isDelegate) return null;

	const unlockWaitingPeriod = account.address === unlock.delegateAddress
		? WAIT_TIME_SELF_VOTE
		: WAIT_TIME_VOTER;

	const pomWaitingPeriod = account.address === unlock.delegateAddress
		? PUNISH_TIME_SELF_VOTE
		: PUNISH_TIME_VOTER;

	// Consider the PoM height iff the unvote happens before the punishment ends
	// and punishment starts before the (unvote) unlock period ends
	// """
	//   This extended locking period also applies to tokens recently unvoted
	//   and still in the mandatory locking period(see the “voting LIP”).
	// """
	// Refer: https://github.com/LiskHQ/lips/blob/master/proposals/lip-0024.md#update-to-validity-of-unlock-transaction
	const [pomHeight] = account.dpos.delegate.pomHeights
		.sort((a, b) => b - a)
		.filter(
			height => unlock.unvoteHeight < height + pomWaitingPeriod
				&& height < unlock.unvoteHeight + unlockWaitingPeriod,
		);

	return pomHeight || null;
};

const calculateUnlockEndHeight = (unlock, account, delegateAcc) => {
	if (unlock.delegateAddress === account.address) { // self-unvote
		const pomHeight = findPomHeightForUnlock(account, unlock);
		return pomHeight
			? pomHeight + PUNISH_TIME_SELF_VOTE
			: unlock.unvoteHeight + WAIT_TIME_SELF_VOTE;
	}

	const pomHeight = findPomHeightForUnlock(delegateAcc, unlock);
	return pomHeight
		? pomHeight + PUNISH_TIME_VOTER
		: unlock.unvoteHeight + WAIT_TIME_VOTER;
};

const standardizeUnlockHeight = (unlock, account, delegateAcc) => ({
	start: unlock.unvoteHeight,
	end: calculateUnlockEndHeight(unlock, account, delegateAcc),
});

module.exports = {
	calculatePomEndHeight,
	standardizePomHeight,
	findPomHeightForUnlock,
	calculateUnlockEndHeight,
	standardizeUnlockHeight,
};
