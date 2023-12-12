#!/usr/bin/env node
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
/* eslint-disable no-console */

const { ServiceBroker } = require('moleculer');

if (process.argv.length < 0) {
	console.log('Usage: moleculer_subscribe.js');
	process.exit(1);
}

// const cliProcedureName = process.argv[2];
// const cliParams = process.argv[3] ? JSON.parse(process.argv[3]) : undefined;
// const TIMEOUT = 15 * 1000;

const broker = new ServiceBroker({
	transporter: 'redis://lisk:password@127.0.0.1:6379',
	logLevel: 'info',
	requestTimeout: 15 * 1000,
	logger: console,
});

const moleculerConfig = {
	name: 'gateway',
	events: {},
};

moleculerConfig.events = {
	'event.hello': (payload, sender, event) => {
		console.log(`Event '${event}' received from ${sender} node:`, payload);
	},
	'block.change': (payload, sender, event) => {
		console.log(`Event '${event}' received from ${sender} node:`, payload);
	},
	'round.change': (payload, sender, event) => {
		console.log(`Event '${event}' received from ${sender} node:`, payload);
	},
	'update.fee_estimates': (payload, sender, event) => {
		console.log(`Event '${event}' received from ${sender} node:`, payload);
	},
};

broker.createService(moleculerConfig);
broker.start();
