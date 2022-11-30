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
const {
	WAIT_TIME_VOTER,
	WAIT_TIME_SELF_VOTE,
	PUNISH_TIME_VOTER,
	PUNISH_TIME_SELF_VOTE,
	getPoSConstants,
} = require('./constants');

const {
	calculatePomEndHeight,
	standardizePomHeight,
	findPomHeightForUnlock,
} = require('./pom');

const {
	calculateUnlockEndHeight,
	standardizeUnlockHeight,
	getUnlocks,
} = require('./unlock');

const {
	getValidators,
	getAllValidators,
	isPoSModuleRegistered,
} = require('./validators');

const { getVotesSent } = require('./votesSent');
const { getVotesReceived } = require('./votesReceived');

module.exports = {
	// Constants
	WAIT_TIME_VOTER,
	WAIT_TIME_SELF_VOTE,
	PUNISH_TIME_VOTER,
	PUNISH_TIME_SELF_VOTE,
	getPoSConstants,

	// PoM
	calculatePomEndHeight,
	standardizePomHeight,
	findPomHeightForUnlock,

	// Unlock
	calculateUnlockEndHeight,
	standardizeUnlockHeight,
	getUnlocks,

	// Validators
	getValidators,
	getAllValidators,
	isPoSModuleRegistered,

	// Votes sent
	getVotesSent,

	// Votes received
	getVotesReceived,
};
