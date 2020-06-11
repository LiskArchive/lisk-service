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
	schedule: { type: 'string' },
	controller: { type: 'function' },
};

const validator = new Validator();

const Microservice = (config = {}) => {
	const moleculerConfig = config;
	moleculerConfig.actions = {};

	const { logger } = moleculerConfig;

	const broker = new ServiceBroker({
		transporter: moleculerConfig.transporter,
		requestTimeout: (moleculerConfig.brokerTimeout || 5) * 1000,
		logLevel: 'info', // broken
		logger: moleculerConfig.logger,
	});

	const getBroker = () => broker;
	const nop = () => {};

	const addMethod = item => {
		const validDefinition = validator.validate(item, methodSchema);
		if (validDefinition !== true) {
			logger.warn([
				`Invalid method definition in ${moleculerConfig.name}:`,
				`${util.inspect(item)}`,
				`${util.inspect(validDefinition)}`,
			].join('\n'));
			return;
		}

		try {
			nop(isProperObject(item.params) ? validator.validate({}, item.params) : true);
		} catch (err) {
			logger.warn([
				`Invalid parameter definition in ${moleculerConfig.name}:`,
				`${util.inspect(item)}`,
			].join('\n'));
			return;
		}

		moleculerConfig.actions[item.name] = {
			params: item.params,
			handler: ctx => item.controller(ctx.params),
		};
		logger.info(`Registered method ${moleculerConfig.name}.${item.name}`);
	};

	const addEvent = event => {
		const validDefinition = validator.validate(event, eventSchema);
		if (validDefinition !== true) {
			logger.warn([
				`Invalid event definition in ${moleculerConfig.name}:`,
				`${util.inspect(event)}`,
				`${util.inspect(validDefinition)}`,
			].join('\n'));
			return;
		}

		event.controller(data => {
			broker.emit(event.name, data, 'gateway');
		});
		logger.info(`Registered event ${moleculerConfig.name}.${event.name}`);
	};

	const addJob = job => {
		const validDefinition = validator.validate(job, jobSchema);
		if (validDefinition !== true) {
			logger.warn([
				`Invalid event definition in ${moleculerConfig.name}:`,
				`${util.inspect(job)}`,
				`${util.inspect(validDefinition)}`,
			].join('\n'));
			return;
		}

		cron.schedule(job.schedule, job.controller);
		logger.info(`Registered job ${moleculerConfig.name}.${job.name}`);
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
		return broker.start();
	};

	return {
		addMethods,
		addEvents,
		addJobs,
		addMethod,
		addEvent,
		addJob,
		getBroker,
		run,
	};
};

module.exports = Microservice;
