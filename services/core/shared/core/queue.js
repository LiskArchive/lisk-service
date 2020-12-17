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

const packageJson = require('../../package.json');
const config = require('../../config');

const logger = Logger();

const initializeQueue = (queueName, queueProcess, options) => {
	const queue = new Queue(queueName, {
		redis: config.endpoints.redis,
		limiter: options.limiter,
		prefix: `queue-${packageJson.name}`,
		defaultJobOptions: options.defaultJobOptions,
		settings: options.settings,
	});

	queue.process(queueName, queueProcess);

	queue.on('completed', (job, result) => {
		logger.debug(`${queueName} Job completed`, result);
		job.remove();
	});
	queue.on('error', (err) => {
		logger.debug(`${queueName} Job error`, err);
	});
	queue.on('failed', (job, err) => {
		logger.debug(`${queueName} Job failed`, err);
		const { data } = job;
		queue.add(queueName, data, data.options);
		job.remove();
	});

	setInterval(async () => {
		const jobCounts = await queue.getJobCounts();
		logger.debug(`Queue counters: ${util.inspect(jobCounts)}`);
	}, 30000);

	return queue;
};

module.exports = { initializeQueue };
