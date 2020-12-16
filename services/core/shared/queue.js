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
const { Logger } = require('lisk-service-framework');
const Queue = require('bull');
const util = require('util');

const config = require('../config');

const logger = Logger();

const initializeQueue = (name, queueProcess) => {
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

	statsQueue.process(queueProcess);

	statsQueue.on('completed', (job, result) => {
		logger.debug(`${name} Job completed`, result);
	});
	statsQueue.on('error', (err) => {
		logger.debug(`${name} Job error`, err);
	});
	statsQueue.on('failed', (job, err) => {
		logger.debug(`${name} Job failed`, err);
		const { data } = job;
		statsQueue.add(name, data, data.options);
	});

	setInterval(async () => {
		const jobCounts = await statsQueue.getJobCounts();
		logger.debug(`Queue counters: ${util.inspect(jobCounts)}`);
	}, 30000);
	return statsQueue;
};

module.exports = { initializeQueue };
