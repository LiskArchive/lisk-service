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
// 3rd party libraries
const { ServiceBroker } = require('moleculer');
const cron = require('node-cron');
const requireAllJs = require('./requireAllJs');
const loggerContext = require('./logger.js');
const cacheRedis = require('./cacheRedis.js');

class Microservice {
	constructor(config = {}) {
		this.moleculerConfig = config;
		this.logger = loggerContext('Microservice');
		this.moleculerConfig.actions = {};
		loggerContext.configure(config);
		cacheRedis.configure(config);
	}

	_addItems(folderPath, type) {
		const items = requireAllJs(folderPath);
		const fnMap = {
			'method': this.addMethod,
			'event': this.addEvent,
			'job': this.addJob,
		}

		Object.keys(items)
			.forEach(itemGroup => items[itemGroup]
				.forEach(item => fnMap[type].call(this, item)));
	}

	addMethods(folderPath) {
		this._addItems(folderPath, 'method');
	}

	addEvents(folderPath) {
		this._addItems(folderPath, 'event');
	}

	addJobs(folderPath) {
		this._addItems(folderPath, 'job');
	}

	addMethod(item) {
		this.moleculerConfig.actions[item.name] = {
			params: item.params,
			handler: ctx => item.controller(ctx.params),
		};
		this.logger.info(`Registered method ${this.moleculerConfig.name}.${item.name}`);
	}

	addEvent(event) {
		event.controller(data => {
			this.broker.emit(event.name, data, 'gateway');
		});
		this.logger.info(`Registered event ${this.moleculerConfig.name}.${event.name}`);
	}

	addJob(job) {
		cron.schedule(job.schedule, job.controller);
		this.logger.info(`Registered job ${this.moleculerConfig.name}.${job.name}`);
	}

	getLogger(context) {
		return loggerContext(context);
	}

	run() {
		this.broker = new ServiceBroker({
			transporter: this.moleculerConfig.transporter,
			requestTimeout: this.moleculerConfig.brokerTimeout * 1000,
			logLevel: 'info',
			logger: loggerContext('ServiceBroker'),
		});
	
		// Create a service
		this.broker.createService(this.moleculerConfig);
	
		// Start server
		return this.broker.start();
	}
}

module.exports = Microservice;
