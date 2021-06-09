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
const Microservice = require('../../src/microservice');
const LoggerConfig = require('../../src/logger').init;

const loggerConf = {
	console: 'true',
	level: 'debug',
	name: 'test-service',
};

LoggerConfig(loggerConf);

const app = Microservice({
	name: 'test',
	transporter: 'redis://localhost:6379/0',
	logger: loggerConf,
})

const testJob = () => true;

describe('Test microservice', () => {
	describe('addJobs()', () => {
		it('Job occurs only during start', async () => {
			const job = {
				name: 'test.job.start',
				description: 'Return true',
				init: () => testJob(),
			}
			expect(app.addJob(job)).toBe(true);
		});

		it('Job occurs based on interval', async () => {
			const job = {
				name: 'test.job.start',
				description: 'Return true',
				interval: 5, //seconds
				init: () => testJob(),
				controller: () => testJob(),
			}
			expect(app.addJob(job)).toBe(true);
		});

		it('Job occurs based on cron', async () => {
			const job = {
				name: 'test.job.start',
				description: 'Return true',
				schedule: '* * * * *',
				init: () => testJob(),
				controller: () => testJob(),
			}
			expect(app.addJob(job)).toBe(true);
		});

		it('Return false when no init or controller defined', async () => {
			const job = {
				name: 'test.job.start',
				description: 'Return true',
				schedule: '* * * * *',
			}
			expect(app.addJob(job)).toBe(false);
		});

		it('Return false when no schedule or interval defined with controller', async () => {
			const job = {
				name: 'test.job.start',
				description: 'Return true',
				init: () => testJob(),
				controller: () => testJob(),
			}
			expect(app.addJob(job)).toBe(false);
		});

		it('Return false when no controller defined with interval/schedule', async () => {
			const job = {
				name: 'test.job.start',
				description: 'Return true',
				interval: 5, //seconds
				init: () => testJob(),
			}
			expect(app.addJob(job)).toBe(false);
		});
	});
});