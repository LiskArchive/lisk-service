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
const { requestConnector } = require('../../../utils/request');

const WAIT_TIME_VOTER = 2000;
const WAIT_TIME_SELF_VOTE = 260000;
const PUNISH_TIME_VOTER = 260000;
const PUNISH_TIME_SELF_VOTE = 780000;

let sdkConstants;

const getConstants = async () => {
	if(typeof sdkConstants === 'undefined') {
		sdkConstants = {
			factorSelfVotes: 10,
			maxLengthName: 20,
			maxNumberSentVotes: 10,
			maxNumberPendingUnlocks: 20,
			failSafeMissedBlocks: 50,
			failSafeInactiveWindow: 260000,
			punishmentWindow: 780000,
			roundLength: 103,
			bftThreshold: 68,
			minWeightStandby: '100000000000',
			numberActiveDelegates: 101,
			numberStandbyDelegates: 2,
			tokenIDDPoS: '0000000000000000',
		};

		// sdkConstants = await requestConnector('dpos_getConstants', {});
	}
	return {
		data: sdkConstants,
		meta: {},
	}
};

module.exports = {
	WAIT_TIME_VOTER,
	WAIT_TIME_SELF_VOTE,
	PUNISH_TIME_VOTER,
	PUNISH_TIME_SELF_VOTE,
	getConstants,
};
