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

let moduleConstants;

const getPoSConstants = async () => {
	if (typeof moduleConstants === 'undefined') moduleConstants = await requestConnector('getPoSConstants');

	return {
		data: moduleConstants,
		meta: {},
	};
};

module.exports = {
	WAIT_TIME_VOTER,
	WAIT_TIME_SELF_VOTE,
	PUNISH_TIME_VOTER,
	PUNISH_TIME_SELF_VOTE,

	getPoSConstants,
};
