/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const coreApi = require('./compat');

const getVoters = async params => {
	const voters = {
		data: [],
		meta: {},
	};

	if (!params.offset) params.offset = 0;
	if (!params.limit) params.limit = 10;

	const response = await coreApi.getVoters(params);
	voters.data = response.data.voters;
	voters.meta = {
		limit: response.meta.limit,
		count: response.data.voters.length,
		offset: response.meta.offset,
		total: response.data.voteCount,
		address: response.data.address,
		publicKey: response.data.publicKey,
		username: response.data.username,
	};

	return voters;
};

module.exports = {
	getVoters,
};
