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

const logger = loggerContext('microservice.js');

const Microservice = function (config = {}) {
	this.moleculerConfig = config;
	loggerContext.configure(config);
	cacheRedis.configure(config);
};

Microservice.prototype.addMethods = function (folderPath) {
	const methods = requireAllJs(folderPath);
	this.moleculerConfig.actions = {};
	Object.keys(methods).forEach(methodGroup => {
		methods[methodGroup].forEach(item => {
			this.moleculerConfig.actions[item.name] = {
				params: item.params,
				handler: ctx => item.controller(ctx.params),
			};
			logger.info(`Registered method ${this.moleculerConfig.name}.${item.name}`);
		});
	});
};

Microservice.prototype.addEvents = function (folderPath) {
	const events = requireAllJs(folderPath);
	Object.keys(events).forEach(eventGroup => {
		events[eventGroup].forEach(event => {
			event.controller(data => {
				this.broker.emit(event.name, data, 'gateway');
			});
			logger.info(`Registered event ${this.moleculerConfig.name}.${event.name}`);
		});
	});
};

Microservice.prototype.addJobs = function (folderPath) {
	const jobs = requireAllJs(folderPath);
	Object.keys(jobs).forEach(jobsGroup => {
		jobs[jobsGroup].forEach(job => {
			cron.schedule(job.schedule, job.controller);
			logger.info(`Registered job ${this.moleculerConfig.name}.${job.name}`);
		});
	});
};

Microservice.prototype.getLogger = function (context) {
	return loggerContext(context);
};


Microservice.prototype.run = function () {
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
};

module.exports = Microservice;
