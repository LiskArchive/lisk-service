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
const { getVotesReceived, getVotesByTransactionIDs } = require('./votesReceived');
const { getVotesSent } = require('./votesSent');

const {
	WAIT_TIME_VOTER,
	WAIT_TIME_SELF_VOTE,
	PUNISH_TIME_VOTER,
	PUNISH_TIME_SELF_VOTE,
} = require('./constants');

const {
	calculatePomEndHeight,
	standardizePomHeight,
	findPomHeightForUnlock,
} = require('./pom');

const {
	calculateUnlockEndHeight,
	standardizeUnlockHeight,
} = require('./unlock');

module.exports = {
	getVotesSent,

	getVotesReceived,
	getVotesByTransactionIDs,

	WAIT_TIME_VOTER,
	WAIT_TIME_SELF_VOTE,
	PUNISH_TIME_VOTER,
	PUNISH_TIME_SELF_VOTE,

	calculatePomEndHeight,
	standardizePomHeight,

	findPomHeightForUnlock,
	calculateUnlockEndHeight,
	standardizeUnlockHeight,
};
