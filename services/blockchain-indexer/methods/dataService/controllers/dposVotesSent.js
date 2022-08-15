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
const dataService = require('../../../shared/dataService');

const getVotesSent = async params => {
	const votesSent = {
		data: {},
		meta: {},
	};

	const response = await dataService.getVotesSent(params);
	if (response.data) votesSent.data = response.data;
	if (response.meta) votesSent.meta = response.meta;

	return votesSent;
};

module.exports = {
	getVotesSent,
};
