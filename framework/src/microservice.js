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
const util = require('util');
const Validator = require('fastest-validator');
const { ServiceBroker } = require('moleculer');
const cron = require('node-cron');
const requireAllJs = require('./requireAllJs');
const loggerLib = require('./logger');
const {
	isProperObject,
} = require('./data');

const methodSchema = {
	name: { type: 'string' },
	description: { type: 'string', optional: true },
	controller: { type: 'function' },
	params: { type: 'object', optional: true },
};

const eventSchema = {
	name: { type: 'string' },
	description: { type: 'string', optional: true },
	controller: { type: 'function' },
};

const jobSchema = {
	name: { type: 'string' },
	description: { type: 'string', optional: true },
	schedule: { type: 'string', optional: true },
	interval: { type: 'number', integer: true, optional: true },
	controller: { type: 'function', optional: true },
	init: { type: 'function', optional: true },
};

const validator = new Validator();

const Microservice = (config = {}) => {
	const moleculerConfig = config;
	moleculerConfig.actions = {};

	const logger = loggerLib.get();
	const log4jsConfig = loggerLib.getConfig();

	const jobsToBeScheduled = [];

	const broker = new ServiceBroker({
		transporter: moleculerConfig.transporter,
		requestTimeout: (moleculerConfig.brokerTimeout || 5) * 1000,
		logger: {
			type: 'Log4js',
			options: {
				level: config.logger.level || 'info',
				log4js: log4jsConfig,
			},
		},
	});

	const getBroker = () => broker;
	const nop = () => { };

	const addMethod = item => {
		const validDefinition = validator.validate(item, methodSchema);
		if (validDefinition !== true) {
			logger.warn([
				`Invalid method definition in ${moleculerConfig.name}:`,
				`${util.inspect(item)}`,
				`${util.inspect(validDefinition)}`,
			].join('\n'));
			return false;
		}

		try {
			nop(isProperObject(item.params) ? validator.validate({}, item.params) : true);
		} catch (err) {
			logger.warn([
				`Invalid parameter definition in ${moleculerConfig.name}:`,
				`${util.inspect(item)}`,
			].join('\n'));
			return false;
		}

		moleculerConfig.actions[item.name] = {
			params: item.params,
			handler: ctx => item.controller(ctx.params),
		};
		logger.info(`Registered method ${moleculerConfig.name}.${item.name}`);
		return true;
	};

	const addEvent = event => {
		const validDefinition = validator.validate(event, eventSchema);
		if (validDefinition !== true) {
			logger.warn([
				`Invalid event definition in ${moleculerConfig.name}:`,
				`${util.inspect(event)}`,
				`${util.inspect(validDefinition)}`,
			].join('\n'));
			return false;
		}

		event.controller(data => {
			const { broadcast, target } = event;
			if (broadcast === true) {
				broker.broadcast(event.name, data, target);
			} else {
				broker.emit(event.name, data, target);
			}
		});
		logger.info(`Registered event ${moleculerConfig.name}.${event.name}`);
		return true;
	};

	const addJob = job => {
		jobsToBeScheduled.push(job);
	};

	const scheduleJob = job => {
		const validDefinition = validator.validate(job, jobSchema);
		if (validDefinition !== true) {
			logger.warn([
				`Invalid event definition in ${moleculerConfig.name}:`,
				`${util.inspect(job)}`,
				`${util.inspect(validDefinition)}`,
			].join('\n'));
			return false;
		}
		if (!job.init && !job.controller) {
			logger.warn([
				`Invalid event definition in ${moleculerConfig.name}, neither init, nor controller is defined for job:`,
				`${util.inspect(job)}`,
				`${util.inspect(validDefinition)}`,
			].join('\n'));
			return false;
		}
		if ((job.controller && !job.schedule && !job.interval)) {
			logger.warn([
				`Invalid event definition in ${moleculerConfig.name}, neither schedule, nor interval set:`,
				`${util.inspect(job)}`,
				`${util.inspect(validDefinition)}`,
			].join('\n'));
			return false;
		}
		if ((job.schedule || job.interval) && !job.controller) {
			logger.warn([
				`Invalid event definition in ${moleculerConfig.name}, controller is required with schedule or interval:`,
				`${util.inspect(job)}`,
				`${util.inspect(validDefinition)}`,
			].join('\n'));
			return false;
		}
		if (job.init) {
			job.init();
		}
		if (job.interval) {
			setInterval(job.controller, job.interval * 1000);
		} else if (job.schedule) {
			cron.schedule(job.schedule, job.controller);
		}

		logger.info(`Registered job ${moleculerConfig.name}.${job.name}`);
		return true;
	};

	const _addItems = (folderPath, type) => {
		const items = requireAllJs(folderPath);
		const fnMap = {
			method: addMethod,
			event: addEvent,
			job: addJob,
		};

		Object.keys(items)
			.forEach(itemGroup => items[itemGroup]
				.forEach(item => fnMap[type].call(this, item)));
	};

	const scheduleJobs = async () => {
		jobsToBeScheduled.forEach(job => {
			scheduleJob(job);
		});

		jobsToBeScheduled.length = 0;
	};

	const addMethods = folderPath => {
		_addItems(folderPath, 'method');
	};

	const addEvents = folderPath => {
		_addItems(folderPath, 'event');
	};

	const addJobs = folderPath => {
		_addItems(folderPath, 'job');
	};

	const run = () => {
		logger.info(`Creating a Moleculer service through ${moleculerConfig.transporter}`);

		// Create a service
		broker.createService(moleculerConfig);

		// Start server
		return broker
		.start()
		.then(() => {
			scheduleJobs();
		});
	};

	const requestRpc = (method, params) => new Promise((resolve, reject) => {
		broker
			.call(method, params)
			.then(res => resolve(res))
			.catch(err => {
				logger.error(`Error occurred! ${err.message}`);
				reject(err);
			});
	});

	return {
		addMethods,
		addEvents,
		addJobs,
		addMethod,
		addEvent,
		addJob,
		getBroker,
		run,
		requestRpc,
	};
};

module.exports = Microservice;
