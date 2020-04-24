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
const { ServiceBroker } = require('moleculer');
const cron = require('node-cron');
const requireAllJs = require('./requireAllJs');
const debug = require('debug')('framework:microservice');

const Microservice = (config = {}) => {
	const moleculerConfig = config;
	moleculerConfig.actions = {};
	
	let broker;

	const _addItems = (folderPath, type) => {
		const items = requireAllJs(folderPath);
		const fnMap = {
			'method': addMethod,
			'event': addEvent,
			'job': addJob,
		}

		Object.keys(items)
			.forEach(itemGroup => items[itemGroup]
				.forEach(item => fnMap[type].call(this, item)));
	};

	const addMethods = (folderPath) => {
		_addItems(folderPath, 'method');
	};

	const addEvents = (folderPath) => {
		_addItems(folderPath, 'event');
	};

	const addJobs = (folderPath) => {
		_addItems(folderPath, 'job');
	};

	const addMethod = (item) => {
		moleculerConfig.actions[item.name] = {
			params: item.params,
			handler: ctx => item.controller(ctx.params),
		};
		logger.info(`Registered method ${moleculerConfig.name}.${item.name}`);
	};

	const addEvent = (event) => {
		event.controller(data => {
			broker.emit(event.name, data, 'gateway');
		});
		logger.info(`Registered event ${moleculerConfig.name}.${event.name}`);
	};

	const addJob = (job) => {
		cron.schedule(job.schedule, job.controller);
		logger.info(`Registered job ${moleculerConfig.name}.${job.name}`);
	};

	const run = () => {
		broker = new ServiceBroker({
			transporter: moleculerConfig.transporter,
			requestTimeout: moleculerConfig.brokerTimeout * 1000,
			logLevel: 'info', // broken
			logger: moleculerConfig.logger || console.log,
		});
	
		debug(`Creating a Moleculer service through ${moleculerConfig.transporter}`);

		// Create a service
		broker.createService(moleculerConfig);
	
		// Start server
		return broker.start();
	};

	return {
		addMethods, addEvents, addJobs,
		addMethod, addEvent, addJob,
		run,
	};
}

module.exports = Microservice;
