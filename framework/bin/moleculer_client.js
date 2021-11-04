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
const colorize = require('json-colorizer');

if (process.argv.length < 3) {
	console.log('Usage: moleculer.js <endpoint> [params_json]');
	process.exit(1);
}

const cliProcedureName = process.argv[2];
const cliParams = process.argv[3] ? JSON.parse(process.argv[3]) : undefined;
const TIMEOUT = 15 * 1000;

const broker = new ServiceBroker({
	transporter: 'redis://localhost:6379',
	logLevel: 'info',
	requestTimeout: 15 * 1000,
	logger: console,
});

const request = (method, params) => {
	broker.start()
		.then(() => broker.waitForServices(method.split('.')[0]))
		.then(() => broker.call(method, params || {}))
		.then(res => {
			console.log(colorize(JSON.stringify(res, null, 2)));
			process.exit(0);
		})
		.catch(err => console.error(`Error occurred! ${err.message}`));
};

setTimeout(() => {
	console.log('Timeout exceeded - could not get a response');
	process.exit(1);
}, TIMEOUT);

request(cliProcedureName, cliParams);
