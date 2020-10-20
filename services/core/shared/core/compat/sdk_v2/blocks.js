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
const coreApi = require('./coreApi');
const {
	getEpochUnixTime,
	getUnixTime,
	getBlockchainTime,
	validateTimestamp,
} = require('../common');

const getBlocks = async params => {
	await Promise.all(['fromTimestamp', 'toTimestamp'].map(async (timestamp) => {
		if (await validateTimestamp(params[timestamp])) {
			params[timestamp] = await getBlockchainTime(params[timestamp]);
		}
		return Promise.resolve();
	}),
	);

	const blocks = await coreApi.getBlocks(params);

	if (blocks.data) {
		await Promise.all(blocks.data.map(async (o) => Object.assign(o, {
			unixTimestamp: await getUnixTime(o.timestamp),
		}),
		));
	}

	return blocks;
};

module.exports = { getBlocks };
