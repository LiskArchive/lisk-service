/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
const Queue = require('bull');

const config = require('../config');

const initializeQueue = (name) => {
	const statsQueue = new Queue(name, {
		redis: config.endpoints.redis,
		limiter: {
			max: 8,
			duration: 20,
		},
		prefix: 'bullStatsQueue',
		defaultJobOptions: {
			attempts: 5,
			timeout: 5 * 60 * 1000, // ms
			removeOnComplete: true,
		},
		settings: {},
	});
	return statsQueue;
};

module.exports = { initializeQueue };
